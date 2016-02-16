/*jslint white: true, browser: true, devel: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,stats,$j,rison,utility,gm,ss,
$u,chrome,worker,self,caap,config,con,sort,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          army OBJECT
// this is the main object for dealing with Army
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

	worker.add({ name: 'army', recordIndex: 'userId'});
	
    army.record = function () {
        this.data ={
            'userId': '',
            'user': '',
            'name': '',
            'lvl': 0,
            'last': 0,
            'change': 0,
            'elite': false,
            'appUser': true
        };
    };
	
	army.checkResults = function (page) {
		try {
			switch (page) {
			case 'army':
				var listHref = $j("#app_body div[class='messages'] a[href*='army.php?act=ignore']"),
					autoGift = config.getItem('AutoGift', false),
					time = autoGift ? config.getItem('CheckGiftMins', 15) : 0;

				if ($u.hasContent(listHref)) {
					listHref.each(function () {
						var row = $j(this),
							link = $j("<br /><a title='This link can be used to collect the " +
						  "gift when it has been lost on Facebook. !!If you accept a gift " +
						  "in this manner then it will leave an orphan request on Facebook!!' " +
						  "href='" + row.attr("href").replace('ignore', 'acpt') + "'>Lost Accept</a>");

						link.insertAfter(row);

						link = null;

					});
				}

				if (autoGift) {
					if ($u.hasContent(listHref)) {
						con.log(1, 'We have a gift waiting!');
						state.setItem('HaveGift', true);
					} else {
						con.log(2, 'No gifts waiting.');
						state.setItem('HaveGift', false);
					}

					time = time < 15 ? 15 : time;
					schedule.setItem("ajaxGiftCheck", time * 60, 300);
				}

				listHref = null;
				break;
			case 'army_member' :
				army.page();
				break;
			default:
				break;
			}
		} catch (err) {
			con.error("ERROR in army.checkResults: " + err.stack);
			return false;
		}
	};

	worker.addAction({worker : 'army', priority : -2400, description : 'Checking Army', functionName : 'check'});
    army.check = function () {
        try {
		
			if (army.add()) {
				return true;
			}
			
            if (!config.getItem("EnableArmy", true) || !schedule.check("army_member")) {
                return false;
            }

            return army.run();
        } catch (err) {
            con.error("ERROR in army.check: " + err.stack);
            return false;
        }
    };

    army.recordsTemp = [];

    army.perPage = 25;

    army.pageDone = true;

    army.init = function () {
        try {
			if ($u.hasContent(ss)) {
				army.recordsTemp = ss.getItem('army.recordsTemp', 'default', true);
				if (army.recordsTemp === 'default' || !$j.isArray(army.recordsTemp)) {
					army.recordsTemp = ss.setItem('army.recordsTemp', []);
				}
	
				con.log(3, "army.loadTemp", army.recordsTemp);
			}
			worker.addPageCheck({page : 'index.php?feed=allies&news_feed_accept=2', config: 'armyAccept'});
            return true;
        } catch (err) {
            con.error("ERROR in army.loadTemp: " + err.stack);
            return false;
        }
    };

    army.saveTemp = function () {
        try {
            ss.setItem('army.recordsTemp', army.recordsTemp);
            con.log(3, "army.saveTemp", army.recordsTemp);
            return true;
        } catch (err) {
            con.error("ERROR in army.saveTemp: " + err.stack);
            return false;
        }
    };

    army.deleteTemp = function () {
        try {
            ss.deleteItem('army.recordsTemp');
            ss.deleteItem('army.currentPage');
            army.recordsTemp = [];
            con.log(3, "army.deleteTemp deleted");
            return true;
        } catch (err) {
            con.error("ERROR in army.saveTemp: " + err.stack);
            return false;
        }
    };

    army.page = function (slice) {
        try {
            if (!army.pageDone) {
                var newslice = $u.setContent(slice, $j('#globalContainer')),
                    pages = $j(),
                    search = $j(),
                    record = {},
                    tStr = '',
                    tNum = 0,
                    pCount = 0,
                    it = 0,
                    len = 0,
                    number = ss.getItem("army.currentPage", 1, true),
                    useAjaxArmy = config.getItem("useAjaxArmy", true);


                if (number === 1) {
                    pages = $j("a[href*='army_member.php?page=']", newslice).last();
                    tStr = $u.hasContent(pages) ? pages.attr("href") : '';
                    tNum = $u.hasContent(tStr) ? tStr.regex(/page=(\d+)/) : null;
                    pCount = $u.setContent(tNum, 1);
                    state.setItem("ArmyPageCount", pCount);
                } else {
                    pCount = state.getItem("ArmyPageCount", 1);
                }

                search = $j("a[href*='comments.php?casuser=']", newslice);
                search.each(function () {
                    var el = $j(this);

                    record = new army.record().data;
                    record.userId = $u.setContent($u.setContent(el.attr("href"), '').regex(/casuser=(\d+)/), 0);
                    tStr = $u.setContent(el.parents("tr").eq(0).text(), '').trim().innerTrim();
                    if (!useAjaxArmy) {
                        record.user = $u.setContent(tStr.regex(new RegExp('(.*?)\\s*"')), '').toString();
                    }

                    record.name = $u.setContent(tStr.regex(new RegExp('"(.*)"')), '').toString();
                    record.lvl = $u.setContent(tStr.regex(/Level\s+(\d+)/), 0);
                    record.last = Date.now();
                    if ($u.hasContent(record.userId) && record.userId > 0) {
                        army.recordsTemp.push(record);
                    } else {
                        con.warn("army.page skipping record", record);
                    }

                    el = null;
                });

                if (number === pCount) {
                    search = $j("a[href*='oracle.php']", $j("img[src*='bonus_member.jpg']", newslice).parent().parent());
                    if ($u.hasContent(search)) {
                        len = $u.setContent($u.setContent(search.text(), '').regex(/Extra members? x(\d+)/), 0);
                        for (it = 1; it <= len; it += 1) {
                            record = new army.record().data;
                            record.userId = -1 * it;
                            record.name = "Extra member " + it;
                            record.lvl = 0;
                            record.last = Date.now();
                            army.recordsTemp.push(record);
                        }
                    }
                }

                ss.setItem("army.currentPage", army.saveTemp() ? number + 1 : number);
                con.log(2, "army.page", number, pCount, army.recordsTemp.length);
                army.pageDone = true;

                newslice = null;
                pages = null;
                search = null;
            }

            return true;
        } catch (err) {
            con.error("ERROR in army.page: " + err.stack);
            army.pageDone = true;
            caap.clearDomWaiting();
            return false;
        }
    };

	// Invite army codes to army
	army.add = function () {
        try {
			var armyCodes = config.getItem('army_codes', ''),
				addCode = armyCodes.regex(/\b([\da-f]{6})\b/i),
				armyCodesLeft = $u.setContent(armyCodes.match(/\b[\da-f]{6}\b/gi), []).length,
				invites = 0,
				inviteButton;
			
			if (!schedule.check('lastArmyAdd')) {
				caap.setDivContent('army_mess', 'Army Add: ' + armyCodesLeft + ' codes left. No invites, check again: ' + $u.setContent(caap.displayTime('lastArmyAdd'), "Unknown"));
				return false;
			}

			if (!addCode) {
				//caap.setDivContent('army_mess', 'Army Add: No army codes to add');
				return false;
			}

			if (caap.navigateTo('army')) {
				caap.setDivContent('army_mess', 'Army Add: ' + armyCodesLeft + ' codes left. Checking for invites');
				return true;
			}

			invites = $j("#app_body b").text();
			if (!invites || !$u.isNumber(invites.parseInt()) || invites.parseInt() == 0) {
				con.log(1, 'Army Add: No invites available', invites);
				schedule.setItem('lastArmyAdd', 3 * 3600);
				return false;
			}
				
			if (!$j("input[name='army_code']")) {
				con.warn('Army Add: no text field to enter army code', $j("input[name='army_code']").val(), addCode);
				schedule.setItem('lastArmyAdd', 300);
				return false;
			} 
			if ($j("input[name='army_code']").val() != addCode) {
				$j("input[name='army_code']").val(addCode);
				return true;
			}
			
			inviteButton = caap.checkForImage('request_pa_army.gif');
			if (!inviteButton) {
				con.warn('Army Add: no invite button');
				schedule.setItem('lastArmyAdd', 300);
				return false;
			}
			caap.click(inviteButton);
			armyCodes = armyCodes.replace(new RegExp('\\s*' + addCode + '\\s*'), '').trim();
			con.log(1, 'Army Add: Invited ' + addCode + ', ' + invites + ' invites, and ' + armyCodesLeft + ' codes left',armyCodes);
			config.setItem('army_codes',armyCodes);
			$j('#caap_army_codes').val(armyCodes); 
			caap.setDivContent('army_mess', 'Army Add: ' + (armyCodesLeft - 1) + ' codes and ' + $u.setContent($j("#app_body b").text(), 0) + ' invites left.');
			return true;
        } catch (err) {
            con.error("ERROR in army.add: " + err.stack);
            return false;
        }
    };
	
    army.run = function () {
        function onError(XMLHttpRequest, textStatus, errorThrown) {
            con.error("army.run", [XMLHttpRequest, textStatus, errorThrown]);
        }

        function onSuccess(data) {
            army.page(data);
        }

        try {
            var expectedPageCount = 0,
                currentPage = 0,
                scanDays = $u.setContent(config.getItem("ArmyScanDays", 7), 7);

            currentPage = ss.getItem("army.currentPage", 1, true);
            expectedPageCount = state.getItem("ArmyPageCount", 0);
            if (!expectedPageCount) {
                expectedPageCount = Math.ceil((stats.army.actual - 1) / army.perPage);
                expectedPageCount = expectedPageCount || 0;
            }

            if (currentPage > expectedPageCount) {
                army.pageDone = false;
                con.log(3, "army.run", expectedPageCount);
                if (stats.army.actual - 1 !== army.recordsTemp.length) {
                    schedule.setItem("army_member", 1800, 300);
                    con.log(2, "Army size mismatch. Next schedule set 30 mins.", stats.army.actual - 1, army.recordsTemp.length);
                } else {
                    schedule.setItem("army_member", scanDays * 86400, 300);
                    army.merge();
                    con.log(2, "Army merge complete. Next schedule set " + scanDays + " days.", army.records);
                }

                army.deleteTemp();
                return false;
            }

            if (army.pageDone) {
                army.pageDone = false;
                if (config.getItem("useAjaxArmy", true)) {
                    caap.ajax("army_member.php?page=" + currentPage, null, onError, onSuccess);
                } else {
                    caap.ajaxLink("army_member.php?page=" + currentPage);
                }
            }

            return true;
        } catch (err) {
            con.error("ERROR in army.run: " + err.stack);
            return false;
        }
    };

    army.merge = function () {
        try {
            var it = 0,
                len = 0,
                record = {},
                fbf = {};

            for (it = 0, len = caap.fbFriends.length; it < len; it += 1) {
                fbf[caap.fbFriends[it].uid] = caap.fbFriends[it].name;
            }

            for (it = 0, len = army.recordsTemp.length; it < len; it += 1) {
                record = this.getRecord(army.recordsTemp[it].userId);
                if (!record.newRecord) {
                    army.recordsTemp[it].elite = $u.setContent(record.elite, false);
                    if (army.recordsTemp[it].lvl > record.lvl) {
                        army.recordsTemp[it].change = army.recordsTemp[it].last;
                    } else if ($u.hasContent(record.change) && record.change > 0) {
                        army.recordsTemp[it].change = record.change;
                    } else {
                        army.recordsTemp[it].change = army.recordsTemp[it].last;
                    }

                    if (!$u.hasContent(army.recordsTemp[it].name) && $u.hasContent(record.name)) {
                        army.recordsTemp[it].name = record.name;
                    }

                    if ($u.hasContent(army.recordsTemp[it].name) && $u.hasContent(record.name) && army.recordsTemp[it].name !== record.name) {
                        army.recordsTemp[it].name = record.name;
                    }

                    if (!$u.hasContent(army.recordsTemp[it].user) && $u.hasContent(record.user)) {
                        army.recordsTemp[it].user = record.user;
                    }

                    if ($u.hasContent(army.recordsTemp[it].user) && $u.hasContent(record.user) && army.recordsTemp[it].user !== record.user) {
                        army.recordsTemp[it].user = record.user;
                    }

                    if (!$u.hasContent(army.recordsTemp[it].lvl) && $u.hasContent(record.lvl)) {
                        army.recordsTemp[it].lvl = record.lvl;
                    }

                    if (!$u.hasContent(army.recordsTemp[it].elite) && $u.hasContent(record.elite)) {
                        army.recordsTemp[it].elite = record.elite;
                    }
                } else {
                    army.recordsTemp[it].change = army.recordsTemp[it].last;
                }

                if ($u.hasContent(caap.fbFriends) && $u.hasContent(fbf)) {
                    if ($u.hasContent(fbf[army.recordsTemp[it].userId]) && army.recordsTemp[it].user !== fbf[army.recordsTemp[it].userId]) {
                        army.recordsTemp[it].user = fbf[army.recordsTemp[it].userId];
                    }

                    army.recordsTemp[it].appUser = $u.hasContent(fbf[army.recordsTemp[it].userId]);
                }
            }

            army.records = JSON.copy(army.recordsTemp);
            state.setItem('wsave_army', true);
            army.deleteTemp();
            return true;
        } catch (err) {
            con.error("ERROR in army.merge: " + err.stack);
            return false;
        }
    };

    army.getIdList = function () {
        try {
            var it = 0,
                len = 0,
                list = [];

            for (it = 0, len = army.records.length; it < len; it += 1) {
                if ($u.hasContent(army.records[it].userId) && army.records[it].userId > 0 && army.records[it].appUser) {
                    list.push(army.records[it].userId);
                }
            }

            return list;
        } catch (err) {
            con.error("ERROR in army.getIdList: " + err.stack);
            return undefined;
        }
    };

    army.getDiffList = function () {
        try {
            var //it = 0,
                //len = 0,
                a = [],
                f = [],
                list = [],
                crossList = function (uid) {
                    return !a.hasIndexOf(uid);
                };

            a = army.getIdList();
            f = army.getFBList();
            list = f.filter(crossList);
            con.log(3, "getDiffList", a, f, list);
            return list;
        } catch (err) {
            con.error("ERROR in army.getDiffList: " + err.stack);
            return undefined;
        }
    };

    army.getFBList = function () {
        try {
            var it = 0,
                len = 0,
                f = [];

            if ($u.hasContent(caap.fbFriends)) {
                for (it = 0, len = caap.fbFriends.length; it < len; it += 1) {
                    f.push(caap.fbFriends[it].uid.parseInt());
                }
            }

            return f;
        } catch (err) {
            con.error("ERROR in army.getFBList: " + err.stack);
            return undefined;
        }
    };

    army.menu = function () {
        try {
            var armyInstructions = "Enable or disable the Army functions. Required when using CA's alternative URL.",
				acceptInst = 'Accept any invitations to join someone elses army daily.',
                armyScanInstructions = "Scan the army pages every X days.",
				armyCodeInstructions = 'A list of army codes, separated by commas or any non-alphabetic characters. As army codes are invited, they will automatically be deleted from the list.',
                htmlCode = '';

            htmlCode += caap.startToggle('Army', 'ARMY');
            htmlCode += caap.makeCheckTR('Accept Army Invites', 'armyAccept', false, acceptInst);
            htmlCode += caap.makeCheckTR('Enable Army Scan', 'EnableArmy', false, armyInstructions);
            htmlCode += caap.display.start('EnableArmy');
            htmlCode += caap.makeCheckTR('Do In Background', 'useAjaxArmy', true, "Check Army using AJAX rather than page navigation.");
            htmlCode += caap.makeNumberFormTR("Scan Every (days)", 'ArmyScanDays', armyScanInstructions, 7, '', '');
            htmlCode += caap.makeCheckTR('Change Indicators', 'ArmyIndicators', false, '');
            htmlCode += caap.display.start('ArmyIndicators');
            htmlCode += caap.makeNumberFormTR("Recent", 'ArmyAgeDaysColor0', '', '#008000', '', 'color', false, false, 50);
            htmlCode += caap.makeNumberFormTR("Warn 1 (days)", 'ArmyAgeDays1', '', 7, '', '');
            htmlCode += caap.makeNumberFormTR("Warn 2", 'ArmyAgeDaysColor1', '', '#ADFF2F', '', 'color', false, false, 50);
            htmlCode += caap.makeNumberFormTR("Warn 2 (days)", 'ArmyAgeDays2', '', 14, '', '');
            htmlCode += caap.makeNumberFormTR("Warn 3", 'ArmyAgeDaysColor2', '', '#FFD700', '', 'color', false, false, 50);
            htmlCode += caap.makeNumberFormTR("Warn 3 (days)", 'ArmyAgeDays3', '', 21, '', '');
            htmlCode += caap.makeNumberFormTR("Warn 4", 'ArmyAgeDaysColor3', '', '#FF8C00', '', 'color', false, false, 50);
            htmlCode += caap.makeNumberFormTR("Warn 4 (days)", 'ArmyAgeDays4', '', 28, '', '');
            htmlCode += caap.makeNumberFormTR("Warn 4", 'ArmyAgeDaysColor4', '', '#FF0000', '', 'color', false, false, 50);
            htmlCode += caap.display.end('ArmyIndicators');
            htmlCode += caap.display.end('EnableArmy');
            htmlCode += caap.makeTD("Add these army codes to my army");
            htmlCode += caap.makeTextBox('army_codes', armyCodeInstructions, '', '');
            htmlCode += caap.endToggle;
            return htmlCode;
        } catch (err) {
            con.error("ERROR in army.menu: " + err.stack);
            return '';
        }
    };

	army.dashboard = {
		name: 'Army',
		inst: 'Display your Army Members, the last time they leveled up',
		records: 'army',
		tableTemplate: {
			colorF: function(r) {
				if (schedule.since(r.change, config.getItem("ArmyAgeDays4", 28) * 86400)) {
					return config.getItem("ArmyAgeDaysColor4", 'red');
				} 
				if (schedule.since(r.change, config.getItem("ArmyAgeDays3", 21) * 86400)) {
					return config.getItem("ArmyAgeDaysColor3", 'darkorange');
				} 
				if (schedule.since(r.change, config.getItem("ArmyAgeDays2", 14) * 86400)) {
					return config.getItem("ArmyAgeDaysColor2", 'gold');
				} 
				if (schedule.since(r.change, config.getItem("ArmyAgeDays1", 7) * 86400)) {
					return config.getItem("ArmyAgeDaysColor1", 'greenyellow');
				}
				return config.getItem("ArmyAgeDaysColor0", 'green');
			}
		},
		
		tableEntries: [  
			{name: 'User ID', color: 'blue', format: 'text',
				valueF: function(r) {
					return '<a href="' + caap.domain.altered + '/keep.php?casuser=' + r.userId +
						'" onclick="ajaxLinkSend(\'globalContainer\', \'keep.php?casuser=' + r.userId +
						'\'); return false;" style="text-decoration:none;font-size:9px;color:blue;">' +
						r.userId + '</a>';
			}},
			{name: 'User',
				valueF: function(r) {
					return $u.hasContent(r.user) && ($u.isString(r.user) || r.user > 0) ?
						"<a href='http://www.facebook.com/profile.php?id=" + r.userId + "'>" + r.user + "</a>" : '';
			}},
			{name: 'Name'},
			{name: 'Level', value: 'lvl'},
			{name: 'Change',
				valueF: function(r) {
					return $u.hasContent(r.change) && ($u.isString(r.change) || r.change > 0) ? $u.makeTime(r.change, "d-m-Y") : '';		
			}},
			{name: '&nbsp;', format: 'unsortable',
				valueF: function(r) {
					return '<a href="' + caap.domain.altered + '/army_member.php?action=delete&player_id=' + r.userId +
						'" onclick="ajaxLinkSend(\'globalContainer\', \'army_member.php?action=delete&player_id=' + r.userId + '\'); return false;" class="ui-icon ui-icon-circle-close" style="text-decoration:none;font-size:9px;">X</a>';
			}}
		]
	};

}());
