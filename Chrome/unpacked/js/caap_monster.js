/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,feed,spreadsheet,ss,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,gm,battle,profiles,town,
hiddenVar,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                          MONSTERS AND BATTLES
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    caap.checkResults_army_news_feed = function () {
        try {
            if (!config.getItem('enableMonsterFinder', false)) {
                return true;
            }

            feed.items("feed");
            return true;
        } catch (err) {
            con.error("ERROR in checkResults_army_news_feed: " + err.stack);
            return false;
        }
    };

    caap.checkResults_monsterList = function (slice) {
        try {
			slice = $u.setContent(slice, $j("#app_body"));
            var buttonsDiv = $j("img[src*='dragon_list_btn_'],input[src*='list_btn_atk'],input[src*='monster_button_'],img[src*='festival_monster_'],img[src*='festival_monster2_'],img[src*='conq2_monster_'],img[src*='list_conq_']", slice),
                page = session.getItem('page', ''),
				pageURL = session.getItem('clickUrl', ''),
				lastmd5 = monster.lastClick,
                mR = {},
                it = 0,
                url = '',
                siege = '',
                engageButtonName = '',
                monsterName = '',
                monsterRow = $j("div[style*='monsterlist_container2.gif'], div[style*='pubmonster_middlef.gif']", slice),
				conditions = false,
                monsterFull = '',
                tempText = '',
                monsterText = '',
                userName = '',
                mName = '',
				now = Date.now(),
				link = '',
				lpage = '', // page where monster list is
                md5 = '',
                pageUserCheck = 0,
                newInputsDiv = $j(),
				publicList = page === 'public_monster_list';

				monster.lastClick = null;

            //con.log(2, "Checking monster list page results", page, pageURL, monsterRow);
			if (publicList) {
				lpage = 'player_monster_list';
			} else {
				if (page === 'guildv2_monster_list') {
					lpage = 'ajax:' + session.getItem('clickUrl', '').replace(/http.*\//,'');
				} else if (page === 'raid') {
					lpage = 'ajax:raid.php';
				} else if (page === 'player_monster_list') {
					if (pageURL.indexOf('monster_filter=2') >=0) {
						lpage = 'ajax:player_monster_list.php?monster_filter=2'
					} else if (pageURL.indexOf('monster_filter=3') >=0) {
						lpage = 'ajax:player_monster_list.php?monster_filter=3';
					} else {
						lpage = 'player_monster_list';
					}
				} else {
					con.log(2,'caap.checkResults_monsterList Unexpected page ' + page);
					return false;
				}
				monster.setrPage(lpage,'review',now);
			}
			
            // get all buttons to check monsterObjectList
            if (!$u.hasContent(buttonsDiv) && !$u.hasContent(monsterRow)) {
                con.log(2, "No buttons found");
                return false;
            }

            if (page === 'player_monster_list' || publicList) {
                // Review monsters and find attack and fortify button
                for (it = 0; it < monsterRow.length; it += 1) {
                    // Make links for easy clickin'
                    /*jslint continue: true */
                    if (!$u.hasContent($j("input[id^='share_link_']", monsterRow.eq(it)))) {
                        con.log(2, "No URL found", it, monsterRow.eq(it));
                        continue;
                    }
                    /*jslint continue: false */
					monsterName =  $j("div[style*='bold']", monsterRow.eq(it)).text().trim().replace(/,.*/,'').toLowerCase().ucWords();
					monsterName = monster.getInfo(monsterName, 'alias', monsterName);
					conditions = '';
					if (publicList) {
						conditions = feed.addConditions(monsterName);
						if (conditions === false) {
							continue;
						}
					}

					link = $j("input[id^='share_link_']", monsterRow.eq(it)).attr("value").replace(/http.*\//,'');
					link = monster.cleanLink(link);
					md5 = link.MD5();
                    mR = monster.getItem(md5);
					mR.link = link;
					mR.lpage = lpage;
					mR.monster = monsterName;
					if (publicList) {
						mR.conditions = conditions;
					}

                    mR.name = mR.name || $j("div[style*='20px']", monsterRow.eq(it)).text().trim() + ' ' + monsterName;
                    mR.md5 = md5;
					mR.listReviewed = now;
					if (publicList) {
						mR.status = mR.status || 'Join';
					} else {
						newInputsDiv = $j("img[src*='list_btn_']", monsterRow.eq(it));
						engageButtonName = $u.setContent(newInputsDiv.attr("src"), '').regex(/list_btn_(\w*)/);
						switch (engageButtonName) {
							case 'collect':
								feed.checkDeath(mR);
								mR.status = mR.status || 'Dead or fled';
								mR.color = 'grey';
								break;
							case 'atk':
								mR.status = mR.status || (lpage == "ajax:player_monster_list.php?monster_filter=2" ? 'Join' : 'Attack');
								break;
							default:
								con.warn("Unknown engageButtonName status", engageButtonName, newInputsDiv.attr("src"));
						}
					}

					con.log(2, "Monster " + mR.name, link, mR.status, mR);
					monster.setItem(mR);
				}
				
            } else {
				// Raid page
				if (lastmd5) {
					con.log(1, "Deleting raid that has expired",lastmd5);
					monster.deleteItem(lastmd5);
				}

                tempText = buttonsDiv.eq(0).parent().attr("href");
                pageUserCheck = session.getItem('pageUserCheck', 0);
                if (pageUserCheck && tempText && !(new RegExp('user=' + caap.stats.FBID).test(tempText) || /alchemy\.php/.test(tempText))) {
                    con.log(2, "On another player's keep.", pageUserCheck);
                    buttonsDiv = null;
                    monsterRow = null;
                    newInputsDiv = null;
                    return false;
                }

                // Review monsters and find attack and fortify button
                con.log(2, "buttonsDiv", buttonsDiv);
                for (it = 0; it < buttonsDiv.length; it += 1) {
                    // Make links for easy clickin'
                    url = buttonsDiv.eq(it).parent().attr("href");
                    con.log(3, "url", url);
                    /*jslint continue: true */
                    if (!(url && /user=/.test(url) && (/mpool=/.test(url) || /raid\.php/.test(url)))) {
                        continue;
                    }
                    /*jslint continue: false */

                    url = url.replace(/http.*\//, '');
                    monsterRow = buttonsDiv.eq(it).parents().eq(3);
                    monsterFull = monsterRow.text().trim().innerTrim();
                    monsterName = monsterFull.replace(/Completed!/i, '').replace(/Fled!/i, '').replace(/COLLECTION: \d+:\d+:\d+/i, '').trim().innerTrim();
                    if (/^Your /.test(monsterName)) {
                        monsterText = monsterName.replace(/^Your /, '').trim().innerTrim().toLowerCase().ucWords();
                        userName = "Your";
                    } else {
                        monsterText = monsterName.replace(new RegExp(".+'s (.+)$"), '$1').replace(/,.*/,'');
                        userName = monsterName.replace(monsterText, '').trim();
                        monsterText = monsterText.trim().innerTrim().toLowerCase().ucWords();
                    }

                    tempText = $j("div[style*='.jpg']", monsterRow).eq(0).attr("style").regex(new RegExp(".*\\/(.*\\.jpg)"));
                    monsterText = $u.setContent(monster.getListName(tempText), monsterText);
                    mName = userName + ' ' + monsterText;
                    con.log(2, "Monster Name", mName);
                    con.log(3, "checkResults_monsterList page", page.replace(/festival_tower\d*/, "festival_battle_monster"), url);
                    md5 = url.MD5();
                    mR = monster.getItem(md5);
                    mR.name = mName;
                    mR.userName = userName;
                    mR.monster = monsterText;
					mR.lpage = lpage;
                    engageButtonName = $u.setContent(buttonsDiv.eq(it).attr("src"), '').regex(/(dragon_list_btn_\d)/i);
					mR.listReviewed = now;

                    switch (engageButtonName) {
                        case 'collectbtn':
                        case 'dragon_list_btn_2':
							feed.checkDeath(mR);
                            mR.status = 'Collect';
                            mR.color = 'grey';

                            break;
                        case 'engagebtn':
                        case 'dragon_list_btn_3':

                            break;
                        case 'viewbtn':
                        case 'dragon_list_btn_4':
							feed.checkDeath(mR);
                            if (page === 'raid' && !(/!/.test(monsterFull))) {
                                break;
                            }

                            if ((page !== "festival_tower" && page !== "festival_tower2" && !$u.hasContent(monster.completeButton[page.replace(/festival_tower\d*/, "battle_monster")].button)) ||
                                    !$u.hasContent(monster.completeButton[page.replace(/festival_tower\d*/, "battle_monster")].md5)) {
                                monster.completeButton[page.replace(/festival_tower\d*/, "battle_monster")].md5 = $u.setContent(mR.md5, '');
                                monster.completeButton[page.replace(/festival_tower\d*/, "battle_monster")].name = $u.setContent(mR.name, '');
                                monster.completeButton[page.replace(/festival_tower\d*/, "battle_monster")].button = $u.setContent($j("img[src*='cancelButton.gif']", monsterRow), null);
                            }

                            mR.status = 'Done';
                            mR.color = 'grey';

                            break;
                        default:
                    }

                    mR.mid = /mid=\S+/.test(url) ? '&mid=' + url.regex(/mid=(\S+)[&]*/) : '';
                    mR.link = url;
                    monster.setItem(mR, 'monster');
                }
            }

			for (it = monster.records.length - 1; it >= 0; it -= 1) {
				mR = monster.records[it];
				if (mR.lpage === lpage && !publicList && mR.status !== 'Join') {
					if (mR.listReviewed < now) {
						mR.lMissing += 1;
						monster.setItem(mR);
						con.warn('Did not see monster ' + mR.name + ' on monster list ' + mR.lMissing + ' times.', mR);
					} else {
						mR.lMissing = 0;
					}
					monster.setItem(mR);
				}
			}
            session.getItem("FeedDashUpdate", true)
            session.getItem("MonsterDashUpdate", true)
            caap.updateDashboard(true);
            return true;
        } catch (err) {
            con.error("ERROR in checkResults_monsterList: " + err.stack);
            return false;
        }
    };

	caap.checkResults_onMonster = function (ajax, aslice) {
        try {
            var slice = ajax ? $j(aslice) : $j("#app_body"),
				visiblePageChangetf = !ajax && !feed.isScan,
                cM = {}, // In the interest of saving bits to be more environmentally friendly, currentMonster has been renamed cM
                time = [],
                tempDiv = $j(),
                tempText = '',
                stunStart = 0,
                tempArr = [],
                i = 0,
                monsterDiv = $j(),
                damageDiv = $j(),
				partsDiv = $j(),
				partsElem = $j(),
				partsElem2 = $j(),
                tStr = '',
				aliveArray,
				arms = [],
				mains = [],
				minions = [],
                tNum = 0,
				link = false,
                deathRuneSiegetf = false,
				defImage = '',
                id = 0,
				mpool = 0,
				deleteMon = false,
                md5 = '',
                page = $j(".game", ajax ? slice : $j("#globalContainer")).eq(0).attr("id"),
                matches = true;

            if ($u.hasContent($j("#app_body div[style*='no_monster_back.jpg']"))) {
                con.log(1, "Deleting monster that has expired",monster.lastClick);
				monster.deleteItem(monster.lastClick);
				monster.lastClick = null;
                return false;
            }

            monsterDiv = $j(monster.onMonsterHeader, slice);

            if (visiblePageChangetf) {
                caap.chatLink(slice, "#chat_log div[style*='hidden'] div[style*='320px']");
            }
			
			tempText = monsterDiv.text().trim();
			//con.log(2, 'Header text', tempText);
			if (monsterDiv.text().regex(/Monster Codes?: \w+:\d+/i)) {
				id = parseInt(tempText.regex(/Monster Codes?: (\w+):\d+/), 36);
				mpool = tempText.regex(/Monster Codes?: \w+:(\d+)/);
				link = session.getItem('page', '') + '.php?casuser=' + id + '&mpool=' + mpool;
				//con.log(2, 'Header text2 ', id, mpool, link, tempText);
			} else {

				mpool = $j("input[name*='mpool']").eq(0).attr("value");
				mpool = $u.setContent(mpool, monster.lastClick ? monster.getItem(monster.lastClick).link.regex(/mpool=(\d+)/) : '');
					
				id = $j("input[name*='casuser']").eq(0).attr("value");
				id = $u.setContent(id, $u.setContent($j("img[src*='profile.ak.fbcdn.net']", monsterDiv).attr("uid"), '').regex(/(\d+)/));
				id = $u.setContent(id, $u.setContent($j(".fb_link[href*='profile.php']", monsterDiv).attr("href"), '').regex(/id=(\d+)/));
				id = $u.setContent(id, $u.setContent($j("img[src*='graph.facebook.com']", monsterDiv).attr("src"), '').regex(/\/(\d+)\//));
				if ($j("input[name*='guild_creator_id']").length > 0) {
					id = $u.setContent(id, $j("input[name*='guild_creator_id']")[0].value + '_' + $j("input[name='slot']")[0].value + '_' + $j("input[name*='monster_slot']")[0].value);
				}
	id = $u.setContent(id, $u.setContent($j("#app_body #chat_log button[onclick*='ajaxSectionUpdate']").attr("onclick"), '').regex(/guild_id=(\d+)/)
						+ '_' + $u.setContent($j("#app_body #chat_log button[onclick*='ajaxSectionUpdate']").attr("onclick"), '').regex(/&slot=(\d+)/)
						+ '_' + $u.setContent($j("#app_body #chat_log button[onclick*='ajaxSectionUpdate']").attr("onclick"), '').regex(/monster_slot=(\d+)/));
				id = $u.setContent(id, $u.setContent($j("#app_body #chat_log button[onclick*='ajaxSectionUpdate']").attr("onclick"), '').regex(/user=(\d+)/));
				id = $u.setContent(id, $u.setContent($j("#app_body #monsterChatLogs img[src*='ldr_btn_chatoff.jpg']").attr("onclick"), '').regex(/user=(\d+)/));
			}
			
			id = $u.setContent(id, monster.lastClick ? monster.getItem(monster.lastClick).id : 0);
			if (id === 0 || !$u.hasContent(id)) {
				con.warn("Unable to get id from monster page");
				slice = null;
				tempDiv = null;
				monsterDiv = null;
				damageDiv = null;
				monster.lastClick = null;
				return;
			}

			// With id, we look for the monster record
			link = monster.cleanLink(link, id, mpool);
			//con.log(2, 'CleanLink', link, id, mpool, monster.lastClick);
            md5 = link.MD5();
            cM = monster.getItem(md5); // In the interest of saving bits to be more environmentally friendly, currentMonster has been renamed cM
            cM.md5 = md5;
			cM.link = link;
			cM.rix = deathRuneSiegetf ? '&rix=' + $u.setContent(cM.link.regex(/rix=(\d+)/), 2) : '';
            monster.lastClick = null;

			// Get the user name
			if (id === caap.stats.FBID) {
				cM.userName = 'Your';
				cM.name = 'Your ' + $u.setContent(cM.monster, 'Unknown Monster');
			} else {
				if ($u.hasContent(monsterDiv)) {
					cM.userName = monsterDiv.text().replace(/Monster Codes: \w+:\w+/, '').trim();
					cM.userName = monsterDiv.text().replace("'s summoned", ' summoned').regex(/\s*(.+)\s+summoned/i);
					if (!cM.userName) {
						con.warn('Unable to find summoner name in monster div', monsterDiv.text(), monsterDiv);
					}
				} else {
					con.warn('Unable to find monster div to determine summoner name');
				}
			}
			
			// Find health bar, label it, and use it to find monster name
			monsterDiv = $j("img[src*='monster_health_background.jpg'],img[src*='nm_red.jpg']", slice).parent();
			if ($u.hasContent(monsterDiv)) {
				cM.life = monsterDiv.getPercent('width').dp(2);
				tempDiv = monsterDiv.siblings().eq(0).children().eq(0);
				if (!$u.hasContent(tempDiv)) {
					tempDiv = monsterDiv.parent().parent().siblings().eq(0);
					if ($u.hasContent(tempDiv.children())) {
						tempDiv = tempDiv.children().eq(0);
					}
				}
			} else {
				tempDiv = $j("div[style*='monster_health_back.jpg']", slice);
			}
			tempText = tempDiv.text().trim();
			if (tempText.toLowerCase().hasIndexOf('life') || tempText.toLowerCase().hasIndexOf('soldiers')) {
				cM.monster = tempText.regex(/\s*([^']+)'s\s+\w+/i).replace(/,.*/,'').toLowerCase().ucWords();
				cM.monster = monster.getInfo(cM.monster, 'alias', cM.monster);
				if (visiblePageChangetf && config.getItem("monsterEnableLabels", true)) {
					tempDiv.text(tempText + " (" + cM.life + "%)");
				}
			} else {
				con.warn('Unable to find monster name', tempText, $j("img[src*='monster_health_background.jpg'],img[src*='nm_red.jpg']", slice).parent(), $j("div[style*='monster_health_back.jpg']", slice));
			}
			cM.name = (cM.userName == 'Your' ? 'Your ' : $u.setContent(cM.userName, 'Someone') + "'s ") + $u.setContent(cM.monster, 'Unknown Monster');
			
            deathRuneSiegetf = cM.monster.indexOf('Deathrune Siege') >= 0;
			if (deathRuneSiegetf) {
				battle.checkResults();
                tempDiv = $j("div[style*='raid_back']", slice);
                if ($u.hasContent(tempDiv)) {
                    if ($u.hasContent($j("img[src*='raid_1_large.jpg']", tempDiv))) {
                        cM.monster = 'Deathrune Siege I';
                    } else if ($u.hasContent($j("img[src*='raid_b1_large.jpg']", tempDiv))) {
                        cM.monster = 'Deathrune Siege II';
                    } else if ($u.hasContent($j("img[src*='raid_1_large_victory.jpg']", tempDiv))) {
                        con.log(2, "Siege Victory!");
                    } else {
                        con.log(2, "Problem finding raid image! Probably finished.");
                    }

                } else {
                    con.warn("Problem finding raid_back");
                    slice = null;
                    tempDiv = null;
                    monsterDiv = null;
                    damageDiv = null;
                    return;
                }
            }

            cM.review = Date.now();
            // Extract info
			
			// #monsterticker is the most reliable indicator of a living monster
            tempDiv = $j("#monsterTicker", slice);
            if ($u.hasContent(tempDiv)) {
                time = $u.setContent(tempDiv.text(), '').regex(/(\d+):(\d+):(\d+)/);
            } else if (!caap.hasImage("dead.jpg")) {
                con.warn("Could not locate Monster ticker.");
            }

			// Check for fortify stuff
			cM.fortify = -1;
			cM.strength = -1;
			defImage = monster.getInfo(cM.monster, 'defense_img');
			switch (defImage) {
				case 'bar_dispel.gif':
					tempDiv = $j("img[src*='" + defImage + "']", slice).parent();
					if ($u.hasContent(tempDiv)) {
						cM.fortify = (100 - tempDiv.getPercent('width')).dp(2);
						tempDiv = tempDiv.parent().parent().siblings().eq(0).children().eq(0).children().eq(1);
					} else {
						con.warn("Unable to find defence bar", defImage);
					}

					break;
				case 'seamonster_ship_health.jpg':
					tempDiv = $j("img[src*='" + defImage + "']", slice).parent();
					if ($u.hasContent(tempDiv)) {
						cM.fortify = tempDiv.getPercent('width').dp(2);
						defImage = monster.getInfo(cM.monster, 'repair_img');
						if (defImage) {
							tempDiv = $j("img[src*='" + defImage + "']", slice).parent();
							if ($u.hasContent(tempDiv)) {
								cM.fortify = (cM.fortify * (100 / (100 - tempDiv.getPercent('width')))).dp(2);
								tempDiv = tempDiv.parent().parent().siblings().eq(0).children().eq(0).children().eq(1);
							} else {
								cM.fortify = 100;
								con.warn("Unable to find repair bar", defImage);
							}
						}
					} else {
						con.warn("Unable to find defense bar", defImage);
					}
					tempDiv = $j("img[src*='repair_bar_grey.jpg']", slice).parent();
					if ($u.hasContent(tempDiv)) {
						cM.strength = 100 - tempDiv.getPercent('width').dp(2);
					}

					break;
				case 'repair_bar_grey.jpg':
					tempDiv = $j("img[src*='" + defImage + "']", slice).parent();
					if ($u.hasContent(tempDiv)) {
						cM.fortify = tempDiv.getPercent('width').dp(2);
						tempDiv = tempDiv.parent();
						if ($u.hasContent(tempDiv)) {
							cM.strength = tempDiv.getPercent('width').dp(2);
							tempDiv = tempDiv.parent().siblings().eq(0).children().eq(0);
						} else {
							cM.strength = 100;
							con.warn("Unable to find defense bar strength");
						}
					} else {
						con.warn("Unable to find defense bar fortify");
					}

					break;
				case 'nm_green.jpg':
					tempDiv = $j("img[src*='" + defImage + "']", slice).parent();
					if ($u.hasContent(tempDiv)) {
						cM.fortify = tempDiv.getPercent('width').dp(2);
						tempDiv = tempDiv.parent();
						if ($u.hasContent(tempDiv)) {
							cM.strength = tempDiv.getPercent('width').dp(2);
							tempDiv = tempDiv.parent().siblings().eq(0).children().eq(0);
						} else {
							cM.strength = 100;
							con.warn("Unable to find defense bar strength");
						}
					} else {
						con.warn("Unable to find defense bar fortify");
					}

					break;
				default:
					con.warn("No match for defense_img", defImage);
			}

			// See if healing debt is paid
			if (config.getItem('HealPercStam', 20) > 0 && cM.debt.start > 0 && (cM.debt.stamina <= 0 ||  cM.fortify > cM.debt.start)) {
				cM.debt.start = -1;
				cM.debt.stamina = 0;
				session.setItem('ReleaseControl', false);
			}
			

			if (visiblePageChangetf && $u.hasContent(tempDiv) && config.getItem("monsterEnableLabels", true)) {
				tempText = tempDiv.text().trim();
				if (!$u.hasContent(tempDiv.children()) && (tempText.toLowerCase().hasIndexOf('health') || tempText.toLowerCase().hasIndexOf('defense') || tempText.toLowerCase().hasIndexOf('armor'))) {
					tempDiv.text(tempText + " (" + (defImage === 'bar_dispel.gif' ? (100 - cM.fortify).dp(2) : cM.fortify) + "%" +
						(defImage === 'nm_green.jpg' ? '/' + cM.strength + '%' : '') + ")");
				}
			}

            // Get damage done to monster
            damageDiv = $j("#action_logs td[class='dragonContainer']:first", slice);
            if ($u.hasContent(damageDiv)) {
				//con.log(2, 'Monster dragoncontainer found', damageDiv.text());
				damageDiv = $j("td[valign='top']:first a[href*='user=" + caap.stats.FBID + "']:first", damageDiv);
				if ($u.hasContent(damageDiv)) { // Make sure player has done damage.
					if (cM.fortify > -1) {
						tempArr = $u.setContent(damageDiv.parent().parent().siblings(":last").text(), '').trim().innerTrim().regex(/([\d,]+ dmg) \/ ([\d,]+ def)/);
						if ($u.hasContent(tempArr) && tempArr.length === 2) {
							cM.attacked = $u.setContent(tempArr[0], '0').numberOnly();
							cM.defended = $u.setContent(tempArr[1], '0').numberOnly();
							cM.damage = cM.attacked + cM.defended;
						} else {
							con.warn("Unable to get attacked and defended damage from #dragonContainer");
						}
					} else if (deathRuneSiegetf) {
						cM.attacked = $u.setContent(damageDiv.parent().siblings(":last").text(), '0').numberOnly();
						cM.damage = cM.attacked;
					} else {
						cM.attacked = $u.setContent(damageDiv.parent().parent().siblings(":last").text(), '0').numberOnly();
						cM.damage = cM.attacked;
						//con.log(2, 'Monster dragoncontainer player info read', cM.attacked, damageDiv.parent().parent().siblings(":last").text());
					}

					if (visiblePageChangetf) {
						damageDiv.parents("tr").eq(0).css('background-color', (gm ? gm.getItem("HighlightColor", '#C6A56F', hiddenVar) : '#C6A56F'));
					}
					//cM.hide = true;
				}
            } else {
                damageDiv = $j("div[id*='leaderboard_0']");
                if ($u.hasContent(damageDiv)) {
                    damageDiv = $j("a[href*='user=" + caap.stats.FBID + "']", damageDiv[0].children);
					if ($u.hasContent(damageDiv)) {
						tempArr = $u.setContent(damageDiv.parent().parent()[0].children[4].innerHTML).trim().innerTrim().match(/([\d,]+)/g);
						if ($u.hasContent(tempArr) && tempArr.length > 0) {
							cM.attacked = tempArr[0].numberOnly();
							cM.damage = cM.attacked;
							if (tempArr.length === 2) {
								cM.defended = tempArr[1].numberOnly();
								cM.damage = cM.attacked + cM.defended;
							}
						} else {
							con.warn("Unable to get attacked and defended damage from Leaderboard", tempArr, (damageDiv.parent().parent()[0].children[4].innerHTML).trim().innerTrim());
						}
						if (visiblePageChangetf) {
							damageDiv.parent().parent().eq(0).css('background-color', (gm ? gm.getItem("HighlightColor", '#C6A56F', hiddenVar) : '#C6A56F'));
						}
					}
                } else {
                    con.log(2, "Unable to find a damage table");
                }
            }
			
			// Is it alive?
			if ($u.hasContent(time)) {
				cM.time = time;
				cM.t2k = monster.t2kCalc(cM);
				
				// new siege style
				tempDiv = $j("#objective_list_section div[style*='mobjective_container']", slice);
				if ($u.hasContent(tempDiv)) {
					cM.phase = tempDiv.length;
					cM.miss = $u.setContent($u.setContent($j("div[style*='monster_layout'],div[style*='nm_bottom'],div[style*='raid_back']", slice).text(), '').trim().innerTrim().regex(/Need (\d+) more/i), 0);
				} else { // old style
					tempDiv = $j("div[style*='monster_layout_2.jpg'] div[style*='alpha']", slice);
					if (tempDiv.length) {
						cM.phase = tempDiv.length + 1;
					}
				}
				if (cM.phase > 0) {
					cM.miss = $u.setContent($u.setContent($j("div[style*='monster_layout'],div[style*='nm_bottom'],div[style*='raid_back']", slice).text(), '').trim().innerTrim().regex(/Need (\d+) more/i), 0);
				}
				
				monsterDiv = $j("div[style*='nm_bottom'],div[style*='stance_plate_bottom']", slice);
				if ($u.hasContent(monsterDiv)) {
					tempText = $u.setContent(monsterDiv.children().eq(0).children().text(), '').trim().innerTrim();
					if (tempText) {
						con.log(4, "Character class text", tempText);
						tStr = tempText.regex(/Class: (\S+) /);
						if ($u.hasContent(tStr)) {
							cM.charClass = tStr;
							con.log(4, "character", cM.charClass);
						} else {
							con.warn("Can't get character", tempText);
						}
					} else {
						con.warn("Missing tempText");
					}
				} else {
					con.warn("Missing nm_bottom to find class");
				}

                // if the monster has parts, hit the weakest minion first, and then hit the part with the least health next
                partsDiv = $j("#app_body div[id^='monster_target_']");
                if ($u.hasContent(partsDiv)) {
					cM.targetPart = -1;
					cM.partsHealth = [];
					//con.log(2, "The monster has " + partsDiv.length + " parts");

                    // Click first order parts which have health
                    partsDiv.each( function(index) {
                        partsElem = $j(this).find('div[style*="multi_smallhealth.jpg"]');
                        if ($u.hasContent(partsElem)) {
							//partsElem2 = partsElem.children[1].children[0];
							tNum = $u.setContent($j(partsElem).getPercent("width"), 0);
							cM.partsHealth.push(tNum);
							tempDiv =  $j("#app_body span[id^='target_monster_info_" + (index + 1) + "']");
							//con.log(2, 'desciptor text: ' + tempDiv.text());
							if ($u.hasContent(tempDiv)) {
								if (tempDiv.text().regex(/reduce/)) {
									arms.push(tNum);
								} else if (tempDiv.text().regex(/hinder/)) {
									minions.push(tNum);
								} else {
									mains.push(tNum);
								}
							} else {
								con.warn('No info for body part ' + (index + 1), $j(this));
							}
						} else {
							con.warn('No children of body part for health width');
						}
                    });
					//con.log(2, 'parts list', minions, arms, mains);
					
                    // Define if use user or default order parts
                    if (/:po/i.test(cM.conditions)) {
                        tempArr = cM.conditions.substring(cM.conditions.indexOf('[') + 1, cM.conditions.lastIndexOf(']')).split(".");
						tempArr.some( function(part) {
							if ($u.setcontent(cM.partsHealth[part],0) > 0) {
								cM.targetPart = part;
								return true;
							}
						});
                    } else {
						cM.targetPart = cM.partsHealth.lastIndexOf(minions.length ? caap.minMaxArray(minions, 'min', 0) : Math.min((arms.length ? caap.minMaxArray(arms, 'min', 0) : 100), caap.minMaxArray(mains, 'min', 0))) + 1;
						//con.log(2, 'targetpart calcs', Math.min.apply(null, aliveArray(minions)),  Math.min.apply(null, aliveArray(arms)), Math.min.apply(null, aliveArray(mains)));
                    }

					// If one of the mains is more damaged that most damaged hinderer and arms > 80% health, assume headless
					if (arms.length && caap.minMaxArray(mains, 'min', 0) < caap.minMaxArray(arms, 'min', 0)
						&& caap.minMaxArray(arms, 'min', 0) > 80) {
						cM.life = (mains.reduce(function(a, b) { return a + b }, 0) / mains.length).dp(2);
					} else {
						cM.life = ((mains.reduce(function(a, b) { return a + b }, 0) + arms.reduce(function(a, b) { return a + b }, 0) / 5)	/ (mains.length + arms.length / 5)).dp(2);
					}
					//con.log(2, 'Average life of body parts ' + cM.life + '% and target is part ' + cM.targetPart, cM.partsHealth, arms, mains, mains.reduce(function(a, b) { return a + b }, 0), arms.reduce(function(a, b) { return a + b }, 0), $j("#app_body #expanded_monster_target_1:visible").length, $j("#app_body #expanded_monster_target_2:visible").length);
                }

				// If it's alive and I've hit it, then check character class stuff and sieges
				if (monster.damaged(cM)) {
					if (cM.status == 'Join') {
						con.log(1, 'Joined a feed monster with ' + cM.damage, cM);
					}
					cM.status = 'Attack';
					// Character type stuff
					if (cM.charClass) {

						tStr = tempText.regex(/Tip: ([\w ]+) Status/);
						if (!tStr) {
							cM.stunType = 'fortify';
							con.warn("Can't get tip", tempText);
						} else {
							cM.stunType = tStr.split(" ").pop().replace("ion", '').toLowerCase();
							con.log(2, 'Stun type: ' + cM.stunType);
						}
						
						if (!["strengthen", "cripple", "heal", "deflection", "fortify"].hasIndexOf(cM.stunType)) {
							con.warn("Unknown monster stun attack", cM.stunType);
						}

						tempArr = tempText.regex(/Status Time Remaining: (\d+):(\d+):(\d+)\s*/);
						if ($u.hasContent(tempArr) && tempArr.length === 3) {
							cM.stunTime = Date.now() + (tempArr[0] * 60 * 60 * 1000) + (tempArr[1] * 60 * 1000) + (tempArr[2] * 1000);
							
						} else {
							cM.stunTime = Date.now() + (cM.time[0] * 60 * 60 * 1000) + (cM.time[1] * 60 * 1000) + (cM.time[2] * 1000);
							con.warn("Can't get statusTime", tempText);
						}

						tempDiv = $j("img[src*='nm_stun_bar']", monsterDiv);
						if ($u.hasContent(tempDiv)) {
							tempText = tempDiv.getPercent('width').dp(2);
							con.log(4, "Stun bar percent text", tempText);
							if (tempText >= 0) {
								cM.stun = tempText;
								con.log(4, "stun", cM.stun);

								// If we haven't set a target time for stunning yet, or the target time was for the phase before this one,
								// or the WhenStun setting has changed, set a new stun target time.
								tNum = monster.parseCondition("cd", cM.conditions);
								tNum = $u.isNumber(tNum) ? tNum.toString() : config.getItem('WhenStun','Immediately');
								tNum = tNum == 'Immediately' ? 6 : tNum == 'Never' ? 0 : tNum.parseFloat();
								stunStart = cM.stunTime - 6 * 60 * 60 * 1000;
								con.log(5,'Checking stuntarget',tNum, $u.makeTime(stunStart, caap.timeStr(true)),$u.makeTime(cM.stunTime, caap.timeStr(true)));
								
								if (!cM.stunTarget || cM.stunTarget < stunStart || cM.stunSetting !== tNum) {
									cM.stunSetting = tNum;

									// Add +/- 30 min so multiple CAAPs don't all stun at the same time
									cM.stunTarget = cM.stunSetting == 6 ? stunStart : cM.stunSetting == 0 ? cM.stunTime
											: cM.stunTime - (tNum - 0.5 + Math.random()) * 60 * 60 * 1000;
									con.log(5,'New stun target', $u.makeTime(cM.stunTarget, caap.timeStr(true)));
								}

								cM.stunDo = cM.charClass === '?' ? '' : new RegExp(cM.charClass).test(tStr) && cM.stun < 100;
								if (cM.stunDo) {
									con.log(2,"Cripple/Deflect after " + $u.makeTime(cM.stunTarget, caap.timeStr(true)), cM.stunTime, cM.stunTarget, tNum, cM.stunSetting, stunStart, Date.now() > cM.stunTarget);
								}
								cM.stunDo = cM.stunDo && Date.now() > cM.stunTarget;

							} else {
								con.warn("Can't get stun bar width");
							}
						} else if (["strengthen", "heal", "fortify"].hasIndexOf(cM.stunType)) {
							cM.stun = cM.stunType == "strengthen" ? cM.strength : cM.health;
						}	else {
							con.warn('No bar and stun type is not strengthen, heal, or fortify');
						}

					}

					// Find the lowest and highest stamina/energy buttons
					tempDiv = $j("div[style*='button_cost_stamina_']", slice);
					cM.siegeLevel = tempDiv.length ? tempDiv.attr('style').match(/button_cost_stamina_(\d+)/)[1] : 0;
					
					cM.staminaList = [];
					cM.energyList = [];
					tempDiv = $j("img[src*='button_cost_stamina_']", slice);
					if ($u.hasContent(tempDiv)) {
						cM.multiNode = true;
						tempDiv.each( function() {
							tNum = $j(this).attr('src').regex(/button_cost_stamina_(\d+)/);
							if (cM.staminaList.indexOf(tNum) == -1) {
								cM.staminaList.push(tNum);
							}
						});
						tempDiv = $j("img[src*='button_cost_energy_']", slice);
						if ($u.hasContent(tempDiv)) {
							tempDiv.each( function() {
								tNum = $j(this).attr('src').regex(/button_cost_energy_(\d+)/);
								if (cM.energyList.indexOf(tNum) == -1) {
									cM.energyList.push(tNum);
								}
							});
						}
					} else {
						if (!cM.staminaList.length) {
							con.log(2, 'Unable to find stamina/energy attack buttons, so using default configuration');
						}
						cM.staminaList = monster.getInfo(cM, 'staminaList');
						cM.energyList = cM.fortify >= 0 ? monster.getInfo(cM, 'energyList') : [];
					}
						
				// It's alive and I haven't hit it
				} else {
					if (!cM.charClass || caap.hasImage('battle_enter_battle.gif', slice)) {
						cM.status = 'Join';
						cM.conditions = feed.addConditions(cM.name) || '';
					} else { // I haven't hit it, but I can't join it, so delete
						con.warn("Deleting unjoinable monster " + cM.name + " off Feed", cM)
						deleteMon = true;
					}
				}
			// It's dead
			} else {
				// And I haven't hit it and it's not conquest
				if (!monster.damaged(cM) && cM.lpage != "ajax:player_monster_list.php?monster_filter=2") {
					//and it's dead and not a conquest monster, so delete
					con.log(2, "Deleting dead monster " + cM.name + " off Feed", cM)
					deleteMon = true;
				} else {
					feed.checkDeath(cM);
					cM.status = (caap.hasImage('collect_reward', slice) || caap.hasImage('collectreward', slice)) ? 'Collect' : 'Done';
					cM.color = 'grey';
				}
			}
			
			
			if (deleteMon) {
				monster.deleteItem(cM.md5);
			} else {
				monster.setItem(cM);
			}
            monster.select(true);
            session.getItem("FeedDashUpdate", true)
            session.getItem("MonsterDashUpdate", true)
			caap.updateDashboard(true);
            if (schedule.check('battleTimer')) {
                window.setTimeout(function () {
                    caap.setDivContent('monster_mess', '');
                }, 2000);
            }
            con.log(2, "On Monster info: " + cM.name, md5, cM, caap.stats.reviewPages);

            slice = null;
            tempDiv = null;
			partsDiv = null;
            monsterDiv = null;
            damageDiv = null;
        } catch (err) {
            con.error("ERROR in checkResults_onMonster: " + err.stack);
        }
    };
	
	caap.checkResults_battle = function () {
        try {
            var symDiv = $j(),
                points = [],
                success = true;

            battle.checkResults();
            symDiv = $j("#app_body img[src*='symbol_tiny_']").not("#app_body img[src*='rewards.jpg']");
            if ($u.hasContent(symDiv) && symDiv.length === 5) {
                symDiv.each(function () {
                    var txt = '';

                    txt = $j(this).parent().parent().next().text();
                    txt = txt ? txt.replace(/\s/g, '') : '';
                    if (txt) {
                        points.push(txt);
                    } else {
                        success = false;
                        con.warn('Demi temp text problem', txt);
                    }
                });

                if (success) {
                    caap.demi.ambrosia.daily = caap.getStatusNumbers(points[0]);
                    caap.demi.malekus.daily = caap.getStatusNumbers(points[1]);
                    caap.demi.corvintheus.daily = caap.getStatusNumbers(points[2]);
                    caap.demi.aurora.daily = caap.getStatusNumbers(points[3]);
                    caap.demi.azeron.daily = caap.getStatusNumbers(points[4]);
                    schedule.setItem("battle", (gm ? gm.getItem('CheckDemi', 6, hiddenVar) : 6) * 3600, 300);
                    caap.SaveDemi();
                }
            } else {
                con.warn('Demi symDiv problem');
            }

            //config.getItem('DoPlayerRecon', false)
            if (battle.reconInProgress) {
                battle.freshmeat("recon");
            }

            symDiv = null;
            return true;
        } catch (err) {
            con.error("ERROR in checkResults_battle: " + err.stack);
            return false;
        }
    };

    caap.inLevelUpMode = function () {
        try {
            if (!config.getItem('EnableLevelUpMode', true)) {
                //if levelup mode is false then new level up mode is also false (kob)
                state.setItem("newLevelUpMode", false);
                return false;
            }

            if (!caap.stats.indicators.enl) {
                //if levelup mode is false then new level up mode is also false (kob)
                state.setItem("newLevelUpMode", false);
                return false;
            }

            // minutesBeforeLevelToUseUpStaEnergy : 5, = 30000
            if (((caap.stats.indicators.enl - Date.now()) < 30000) || (caap.stats.exp.dif <= config.getItem('LevelUpGeneralExp', 20))) {
                //detect if we are entering level up mode for the very first time (kob)
                if (!state.getItem("newLevelUpMode", false)) {
                    //set the current level up mode flag so that we don't call refresh monster routine more than once (kob)
                    state.setItem("newLevelUpMode", true);
                }

                return true;
            }

            //if levelup mode is false then new level up mode is also false (kob)
            state.setItem("newLevelUpMode", false);
            return false;
        } catch (err) {
            con.error("ERROR in inLevelUpMode: " + err.stack);
            return false;
        }
    };

	// Will return amount of stamina available.
    caap.checkStamina = function (battleOrMonster, attackMinStamina) {
        try {
            con.log(4, "checkStamina", battleOrMonster, attackMinStamina);
            attackMinStamina = $u.setContent(attackMinStamina, 0);

            var when = config.getItem('When' + battleOrMonster, 'Never'),
                maxIdleStamina = 0,
                theGeneral = '',
                staminaMF = '',
                messDiv = battleOrMonster.toLowerCase() + "_mess";

            if (when === 'Never') {
                return false;
            }

            if (!caap.stats.stamina || !caap.stats.health) {
                caap.setDivContent(messDiv, 'Health or stamina not known yet.');
                return false;
            }

            if (caap.stats.health.num < 10) {
                if (battleOrMonster === "Conquest") {
                    schedule.setItem("conquest_delay_stats", (10 - caap.stats.health.num) *  180, 120);
                }

                caap.setDivContent(messDiv, "Need health to fight: " + caap.stats.health.num + "/10");
                return false;
            }

            if (((battleOrMonster === "Battle" && config.getItem("waitSafeHealth", false)) || (battleOrMonster === "Conquest" && config.getItem("conquestWaitSafeHealth", false))) && caap.stats.health.num < 13) {
                if (battleOrMonster === "Conquest") {
                    schedule.setItem("conquest_delay_stats", (13 - caap.stats.health.num) *  180, 120);
                }

                caap.setDivContent(messDiv, "Unsafe. Need health to fight: " + caap.stats.health.num + "/13");
                return false;
            }

            if (when === 'At X Stamina') {
                if (caap.inLevelUpMode() && caap.stats.stamina.num >= attackMinStamina) {
                    caap.setDivContent(messDiv, 'Burning stamina to level up');
                    return caap.stats.stamina.num;
                }

                staminaMF = battleOrMonster + 'Stamina';
                if (state.getItem('BurnMode_' + staminaMF, false) || caap.stats.stamina.num >= config.getItem('X' + staminaMF, 1)) {
                    if (caap.stats.stamina.num < attackMinStamina || caap.stats.stamina.num <= config.getItem('XMin' + staminaMF, 0)) {
                        state.setItem('BurnMode_' + staminaMF, false);
                        return false;
                    }

                    state.setItem('BurnMode_' + staminaMF, true);
                    return caap.stats.stamina.num - config.getItem('XMin' + staminaMF, 0);
                }

                state.setItem('BurnMode_' + staminaMF, false);

                caap.setDivContent(messDiv, 'Waiting for stamina: ' + caap.stats.stamina.num + "/" + config.getItem('X' + staminaMF, 1));
                return false;
            }

            if (when === 'At Max Stamina') {
                maxIdleStamina = caap.maxStatCheck('stamina');

                if (caap.stats.stamina.num >= maxIdleStamina) {
                    caap.setDivContent(messDiv, 'Using max stamina');
                    return caap.stats.stamina.num; 
                }

                if (caap.inLevelUpMode()) {
                    caap.setDivContent(messDiv, 'Burning all stamina to level up');
                    return caap.stats.stamina.num;
                }

                caap.setDivContent(messDiv, 'Waiting for max stamina: ' + caap.stats.stamina.num + "/" + maxIdleStamina);
                return false;
            }

            if (caap.stats.stamina.num >= attackMinStamina) {
                return caap.stats.stamina.num;
            }

            caap.setDivContent(messDiv, "Waiting for more stamina: " + caap.stats.stamina.num + "/" + attackMinStamina);
            return false;
        } catch (err) {
            con.error("ERROR in checkStamina: " + err.stack);
            return false;
        }
    };

    /*-------------------------------------------------------------------------------------\
    needToHide will return true if the current stamina and health indicate we need to bring
    our health down through battles (hiding).  It also returns true if there is no other outlet
    for our stamina (currently this just means Monsters, but will eventually incorporate
    other stamina uses).
    \-------------------------------------------------------------------------------------*/
    caap.needToHide = function () {
        try {
            if (config.getItem('WhenMonster', 'Never') === 'Never') {
                con.log(1, 'Stay Hidden Mode: Monster battle not enabled');
                return true;
            }

            if (!state.getItem('targetFromMonster', '')) {
                con.log(1, 'Stay Hidden Mode: No monster to battle');
                return true;
            }

            if (config.getItem('delayStayHidden', true) === false) {
                con.log(2, 'Stay Hidden Mode: Delay hide if "safe" not enabled');
                return true;
            }

            /*-------------------------------------------------------------------------------------\
             The riskConstant helps us determine how much we stay in hiding and how much we are willing
             to risk coming out of hiding.  The lower the riskConstant, the more we spend stamina to
             stay in hiding. The higher the risk constant, the more we attempt to use our stamina for
             non-hiding activities.  The below matrix shows the default riskConstant of 1.7

             S   T   A   M   I   N   A
             1   2   3   4   5   6   7   8   9        -  Indicates we use stamina to hide
             H   10  -   -   +   +   +   +   +   +   +        +  Indicates we use stamina as requested
             E   11  -   -   +   +   +   +   +   +   +
             A   12  -   -   +   +   +   +   +   +   +
             L   13  -   -   +   +   +   +   +   +   +
             T   14  -   -   -   +   +   +   +   +   +
             H   15  -   -   -   +   +   +   +   +   +
             16  -   -   -   -   +   +   +   +   +
             17  -   -   -   -   -   +   +   +   +
             18  -   -   -   -   -   +   +   +   +

             Setting our riskConstant down to 1 will result in us spending out stamina to hide much
             more often:

             S   T   A   M   I   N   A
             1   2   3   4   5   6   7   8   9        -  Indicates we use stamina to hide
             H   10  -   -   +   +   +   +   +   +   +        +  Indicates we use stamina as requested
             E   11  -   -   +   +   +   +   +   +   +
             A   12  -   -   -   +   +   +   +   +   +
             L   13  -   -   -   -   +   +   +   +   +
             T   14  -   -   -   -   -   +   +   +   +
             H   15  -   -   -   -   -   -   +   +   +
             16  -   -   -   -   -   -   -   +   +
             17  -   -   -   -   -   -   -   -   +
             18  -   -   -   -   -   -   -   -   -

            \-------------------------------------------------------------------------------------*/

            var riskConstant = gm ? gm.getItem('HidingRiskConstant', 1.7, hiddenVar) : 1.7;

            /*-------------------------------------------------------------------------------------\
            The formula for determining if we should hide goes something like this:

            If  (health - (estimated dmg from next attacks) puts us below 10)  AND
            (current stamina will be at least 5 using staminatime/healthtime ratio)
            Then stamina can be used/saved for normal process
            Else stamina is used for us to hide

            \-------------------------------------------------------------------------------------*/
            //if ((caap.stats.health.num - ((caap.stats.stamina.num - 1) * riskConstant) < 10) && (caap.stats.stamina.num * (5 / 3) >= 5)) {
            if ((caap.stats.health.num - ((caap.stats.stamina.num - 1) * riskConstant) < 10) && ((caap.stats.stamina.num + (gm ? gm.getItem('HideStaminaRisk', 1, hiddenVar) : 1)) >= state.getItem('MonsterStaminaReq', 1))) {
                return false;
            }

            return true;
        } catch (err) {
            con.error("ERROR in needToHide: " + err.stack);
            return undefined;
        }
    };

    /*-------------------------------------------------------------------------------------\
    MonsterReview is a primary action subroutine to manage the monster and raid list
    on the dashboard
    \-------------------------------------------------------------------------------------*/
    caap.monsterReview = function () {
        try {
            /*-------------------------------------------------------------------------------------\
            We do monster review once an hour.  Some routines may reset this timer to drive
            MonsterReview immediately.
            \-------------------------------------------------------------------------------------*/
			//con.log(2,'monster review',caap.stats.reviewPages);
            if (config.getItem('WhenMonster', 'Never') === 'Never' && ['No Monster', 'Demi Points Only'].indexOf(config.getItem('WhenBattle', 'Never')) < 0 &&  config.getItem('TargetType', 'Freshmeat') != 'Raid') {
                return false;
            }

            var link = '',
                result = false,
				i = 0,
				time = 60,
				cM = {},
				message = 'Reviewing ';

//caap.stats.reviewPages = {};
            for (i = 0; i < caap.stats.reviewPages.length; i++) {
                if (schedule.since(caap.stats.reviewPages[i].review, 60 * 60)) {
                    con.log(2,'Reviewing monster list page',caap.stats.reviewPages[i].path, caap.stats.reviewPages,caap.stats.reviewPages[i].review);
                    return caap.navigateTo(caap.stats.reviewPages[i].path);
                }
            }
            //con.log(5,'monster review',caap.stats.reviewPages);

            if (monster.records.length === 0) {
                return false;
            }

            /*-------------------------------------------------------------------------------------\
            Now we step through the monsterOl objects. We set monsterReviewCounter to the next
            index for the next reiteration since we will be doing a click and return in here.
            \-------------------------------------------------------------------------------------*/
            for (i = 0; i < monster.records.length; i++) {
                cM = monster.records[i];
                /*jslint continue: true */
				
				// Skip monsters we haven't joined, unless in conquest lands
                if (cM.status == 'Join' && cM.lpage != "ajax:player_monster_list.php?monster_filter=2") {
                    continue;
                }
                if (cM.color === 'grey' && cM.life !== -1) {
                    cM.life = -1;
                    cM.fortify = -1;
                    cM.strength = -1;
                    cM.time = [];
                    cM.t2k = -1;
                    cM.phase = '';
                    monster.save();
                }

                /*-------------------------------------------------------------------------------------\
                If we looked at this monster more recently than an hour ago, skip it
                \-------------------------------------------------------------------------------------*/
				time = (cM.status === 'Attack' ? (monster.parseCondition('mnt', cM.conditions) || 60) : 60) * 60;
				//con.log(2,'PRE MONSTER REVIEW', cM.name, schedule.since(cM.review, time),  cM, time, monster.parseCondition('mnt', cM.conditions));

				link = "ajax:" + cM.link;

				/*-------------------------------------------------------------------------------------\
				If the autocollect token was specified then we set the link to do auto collect.
				\-------------------------------------------------------------------------------------*/
				if (['Collect', 'Dead or fled'].indexOf(cM.status)>=0) {
					if (/:collect\b/.test(cM.conditions) || (!/:!collect\b/.test(cM.conditions) && config.getItem('monsterCollectReward', false))) {
						if (general.Select('CollectGeneral')) {
							return true;
						}

						link += '&action=collectReward' + cM.rix;
						con.log(2, 'Collecting reward on ' + cM.name, cM);
						message = 'Collecting ';
					}

				} else if (cM.status == 'Done' && cM.lpage == "player_monster_list") {
					if (/:clear\b/.test(cM.conditions) || (!/:!clear\b/.test(cM.conditions) && config.getItem('clearCompleteMonsters', false))) {
						link = link.replace("battle_monster.php?casuser=", "player_monster_list.php?remove_list=").concat("&monster_filter=1");
						//caap.updateDashboard(true);
						message = 'Clearing ';
						monster.deleteItem(cM.md5);
					}

				} else if (cM.doSiege && caap.stats.stamina.num >= cM.siegeLevel && cM.monster.indexOf('Deathrune Siege') < 0) {
					link += ',clickimg:siege_btn.gif';
					message = 'Sieging ';
				}
				
                if (message === 'Reviewing ' && (cM.status === 'Done' || !schedule.since(cM.review, time))) {
                    continue;
                }
                /*jslint continue: false */

                /*-------------------------------------------------------------------------------------\
                We get our monster link
                \-------------------------------------------------------------------------------------*/
                caap.setDivContent('monster_mess', message + (i + 1) + '/' + monster.records.length + ' ' + cM.name);

                /*-------------------------------------------------------------------------------------\
                If the link is good then we get the url and any conditions for monster
                \-------------------------------------------------------------------------------------*/
				
				/*-------------------------------------------------------------------------------------\
				Now we use ajaxSendLink to display the monsters page.
				\-------------------------------------------------------------------------------------*/
				con.log(1, message + (i + 1) + '/' + monster.records.length + ' ' + cM.name, link, cM);

				result = caap.navigate2(link);
				if (result == 'fail') {
					caap.navigate2('keep');
				}
				monster.lastClick = cM.md5;
				return result;
            }

            /*-------------------------------------------------------------------------------------\
            All done.  Set timer and tell monster.select and dashboard they need to do their thing.
            We set the monsterReviewCounter to do a full refresh next time through.
            \-------------------------------------------------------------------------------------*/

            caap.setDivContent('monster_mess', '');
            caap.updateDashboard(true);

            return false;
        } catch (err) {
            con.error("ERROR in monsterReview: " + err.stack);
            return false;
        }
    };

    caap.monsters = function () {
        try {
			var whenMonster = config.getItem('WhenMonster', 'Never');

			if (whenMonster === 'Never' || whenMonster == 'Review Only') {
				caap.setDivContent('monster_mess', whenMonster == 'Never' ? 'Monster off' : 'No current review');
				return false;
			}
				
			monster.select(false);
			
            ///////////////// Reivew/Siege all monsters/raids \\\\\\\\\\\\\\\\\\\\\\

            if (config.getItem('WhenMonster', 'Never') === 'Stay Hidden' && caap.needToHide() && caap.checkStamina('Monster', 1)) {
                con.log(1, "Stay Hidden Mode: We're not safe. Go battle.");
                caap.setDivContent('monster_mess', 'Not Safe For Monster. Battle!');
                return false;
            }

            if (!schedule.check('NotargetFrombattle_monster')) {
                return false;
            }

            ///////////////// Individual Monster Page \\\\\\\\\\\\\\\\\\\\\\

            // Establish a delay timer when we are 1 stamina below attack level.
            // Timer includes 5 min for stamina tick plus user defined random interval

            if (!caap.inLevelUpMode() && caap.stats.stamina.num === (state.getItem('MonsterStaminaReq', 1) - 1) && schedule.check('battleTimer') && config.getItem('seedTime', 0) > 0) {
                schedule.setItem('battleTimer', 300, config.getItem('seedTime', 0));
                caap.setDivContent('monster_mess', 'Monster Delay Until ' + caap.displayTime('battleTimer'));
                return false;
            }

            if (!schedule.check('battleTimer')) {
                if (caap.stats.stamina.num < caap.maxStatCheck('stamina')) {
                    caap.setDivContent('monster_mess', 'Monster Delay Until ' + caap.displayTime('battleTimer'));
                    return false;
                }
            }

            var fightMode = '',
                energyRequire = 0,
                cM = {},  // current monster
                attackButton = null,
                singleButtonList = [],
                buttonList = [],
                tacticsValue = 0,
                useTactics = false,
                attackMess = '',
                it = 0,
                len = 0,
				gMult = 1, // General multiplier, like Orc King = 5
				minMax = 'min',
                theGeneral = 'Use Current',
				temp,
				nodeNum = 0,
				xpPerPt = 1,
				statRequire = 0,
				statRequireBig = 0,
				statAvailable = 0,
				debtcM = {},
				statList = 'energyList',
				blankRecord = new monster.record().data,
				result = false,
				healPercStam = config.getItem('HealPercStam', 20) / 100,
				staminaAvailable = Math.min(caap.checkStamina('Monster'), healPercStam > 0 && !caap.inLevelUpMode() ? caap.stats.energy.num / healPercStam : 10000),
				energyAvailable = caap.checkEnergy('Fortify', config.getItem('WhenFortify', 'Energy Available')),
				maxEnergy = caap.checkEnergy('Fortify', 'Energy Available');

			debtcM = healPercStam ? (monster.records.reduce(function(previous, redR) {
				return redR.debt.stamina > previous.debt.stamina ? redR : previous;
			}, blankRecord)) : blankRecord;
			
            // Check to see if we should fortify or attack monster
			['energy', 'stamina', 'cover'].some( function(stat) {
				fightMode = stat == 'stamina' ? 'Monster' : 'Fortify';
				temp = state.getItem('targetFrom' + fightMode, '');
				cM = stat == 'cover' ? debtcM :  temp ? monster.getItem(temp) : blankRecord;
				
				if (!cM.md5) {
					return false;
				}
				
				if (debtcM.debt.stamina > 0 && stat !== 'cover') { // We have a debt
				
					// If trying to hit or heal anyone other than the monster we need to cover, then don't, unless hitting and levelling up
					if (cM.md5 !== debtcM.md5 && (stat == 'energy' || !caap.inLevelUpMode())) {
						return false;
					}
					// If done over 10% damage to fort and have energy to heal and debt is at least one heal, then wait for cover
					if (stat == 'stamina' && cM.fortify < cM.debt.start - 10 && debtcM.debt.stamina >= debtcM.energyList[0] / healPercStam && maxEnergy >= debtcM.energyList[0]) {
						return false;
					}
				}
				statList = stat == 'stamina' ? 'staminaList' : 'energyList';
				theGeneral = general.getLoadoutGeneral(general.Select(fightMode + 'General', true));
				gMult = $u.setContent(general.GetStat(theGeneral, 'special').regex(/power attacks? by (\d)x/i), 1);
				xpPerPt = (statList == 'energyList' ? 3.6 : 5) * gMult;
				//con.log(2, fightMode + ' ', state.getItem('targetFrom' + fightMode, ''));
				
				//con.log(2, cM.name + ' ', statList, cM, cM[statList]);

				statAvailable = stat == 'cover' ? maxEnergy : statList == 'energyList' ? energyAvailable : staminaAvailable;
				if (caap.inLevelUpMode()) {  
					// Check for the biggest hit we can make with our remaining stats
					statRequireBig = caap.minMaxArray(cM[statList], 'max', 1, (caap.stats.stamina.num + 1) / gMult);
					
					// Is there a smaller power attack that will work?
					statRequire = caap.minMaxArray(cM[statList], 'min', 1, (caap.stats.stamina.num + 1 - statRequireBig) / gMult);
					
					if (statRequire && statRequire * xpPerPt < caap.stats.exp.dif) {
						// Ok, small power hit is a go
					// If power hit won't work, then do single hit
					} else if (cM[statList][0] == 1 && 1 * xpPerPt < caap.stats.exp.dif) {
						statRequire = 1;
					} else {
						// If too close to levelling for a power attack, do max attack to carry over xp
						statRequire = statRequireBig;
					}
					con.log(2, 'Hitting for ' + statRequire + ' Big ' + statRequireBig + ' Stamina ' + caap.stats.stamina.num + ' xp ' + caap.stats.exp.dif, cM, cM[statList][0], cM[statList][0] == 1, 1 * xpPerPt < caap.stats.exp.dif);
				} else if (cM[statList][0] == 1 && (/:sa\b/i.test(cM.conditions) || (!config.getItem('PowerAttack', false) &&  !/:pa\b/i.test(cM.conditions)))) {
					statRequire = 1;
				} else {
					minMax = statList == 'staminaList' && config.getItem('PowerAttackMax', false) ? 'max' : 'min';
					statRequire = caap.minMaxArray(cM[statList], minMax, 1, (statAvailable + 1) / gMult );
				}
				if (statRequire && statRequire * gMult <= statAvailable) {
					nodeNum = !cM.multiNode ? 0 : cM[statList].indexOf(statRequire);
					con.log(2, 'NodeNum ' + nodeNum);
					return true;
				} else {
					statAvailable = 0;
				}
			});

			if (!statAvailable) {
				schedule.setItem('NotargetFrombattle_monster', 60);
				return false;
			}

            // Set general and go to monster page
			result = caap.navigate2('@' + fightMode + 'General,ajax:' + cM.link + (cM.targetPart > 0 ? (",clickjq:#app_body #monster_target_" + cM.targetPart + " img[src*='multi_selectbtn.jpg'],jq:#app_body #expanded_monster_target_" + cM.targetPart + ":visible") : ''));
            if (result !== false) {
				attackButton = null;
                singleButtonList = null;
                buttonList = null;
                if (result == 'fail') {
					monster.deleteItem(cM.md5);
					con.warn('Monster ' + cM.name + ' deleted after five attempts to navigate to it.', cM);
					return false;
				}
                return true;
            }

            // Check if on engage monster page
            if ($u.hasContent($j("#app_body " + monster.onMonsterHeader))) {
                singleButtonList = ['button_nm_p_attack.gif', 'attack_monster_button.jpg', 'event_attack1.gif', 'seamonster_attack.gif', 'event_attack2.gif', 'attack_monster_button2.jpg'];

                // Find the attack or fortify button
                if (fightMode === 'Fortify') {
                    buttonList = ['seamonster_fortify.gif', 'button_dispel.gif', 'attack_monster_button3.jpg'];

                    if (monster.getInfo(cM, 'fortify_img')) {
                        buttonList.unshift(monster.getInfo(cM, 'fortify_img')[0]);
                    }
                    if (!cM.stunTarget) {
                        con.log(1, "No stun target time set");
                    }
                    
					// Only stun if we have no debt
                    if (cM.stunDo && cM.stunType !== '' && !$u.hasContent(debt.md5)) {
                        buttonList.unshift("button_nm_s_" + cM.stunType);
                    } else {
                        buttonList.unshift("button_nm_s_");
                    }
                } else if (statRequire === 1) {
                    // not power attack only normal attacks
                    buttonList = singleButtonList;
                } else {
                    if (/:tac/i.test(cM.conditions) && caap.stats.level >= 50) {
                        useTactics = true;
                        tacticsValue = monster.parseCondition("tac%", cM.conditions);
                    } else if (config.getItem('UseTactics', false) && caap.stats.level >= 50) {
                        useTactics = true;
                        tacticsValue = config.getItem('TacticsThreshold', false);
                    }

                    if (tacticsValue !== false && cM.fortify && cM.fortify < tacticsValue) {
                        con.log(2, "Party health is below threshold value", cM.fortify, tacticsValue);
                        useTactics = false;
                    }

                    if (useTactics && caap.hasImage('nm_button_tactics.gif')) {
                        con.log(2, "Attacking monster using tactics buttons");
                        buttonList = ['nm_button_tactics.gif'].concat(singleButtonList);
                    } else {
                        con.log(2, "Attacking monster using regular buttons");
                        useTactics = false;
                        // power attack or if not seamonster power attack or if not regular attack -
                        // need case for seamonster regular attack?
                        buttonList = monster.powerButtons.concat(singleButtonList);

                        if (monster.getInfo(cM, 'attack_img')) {
                            if (!caap.inLevelUpMode() && config.getItem('PowerAttack', false) && config.getItem('PowerAttackMax', false)) {
                                buttonList.unshift(monster.getInfo(cM, 'attack_img')[1]);
                            } else {
                                buttonList.unshift(monster.getInfo(cM, 'attack_img')[0]);
                            }
                        }
                    }
                }

                con.log(2, "monster/button list", cM, buttonList, nodeNum);

                buttonList.some( function(button) {
                    attackButton = caap.checkForImage(button, null, null, nodeNum);
                    return $u.hasContent(attackButton);
                });

                if ($u.hasContent(attackButton)) {
                    if (fightMode === 'Fortify') {
                        attackMess = (cM.stunDo ? cM.stunType + 'ing ': 'Fortifying') + cM.name;
                    } else {
						if (general.GetStat(theGeneral, 'charge') == 100) {
							general.getRecord(theGeneral).charge = 0;
						}
						if (useTactics) {
							attackMess = 'Tactic Attacking ' + cM.name;
						} else {
							attackMess = (statRequire >= 5 ? 'Power' : 'Single') + ' Attacking ' + cM.name;
						}
                    }

                    con.log(1, attackMess);
                    caap.setDivContent('monster_mess', attackMess);
                    caap.click(attackButton);
					cM.spent[fightMode === 'Fortify' ? 'energy' : 'stamina'] += statRequire;
					
					// Record healing debt or repayments
					if (cM.fortify >= 0 && healPercStam > 0 && (!cM.charClass || ['Mage','Rogue'].indexOf(cM.charClass) == -1)) {
						cM.debt.stamina = Math.max(0, cM.debt.stamina + (fightMode === 'Fortify' ? -statRequire / healPercStam : statRequire));
						cM.debt.start = cM.debt.start == -1 && fightMode === 'Monster' ? Math.min(cM.fortify, 97) 
							: cM.debt.stamina ? cM.debt.start : -1;
						session.setItem('ReleaseControl', false);
					}
                    // dashboard autorefresh fix
                    localStorage.AFrecentAction = true;

                    attackButton = null;
                    singleButtonList = null;
                    buttonList = null;
					state.setItem('fightMode', fightMode);
                    return true;
                }

                con.warn('No button to attack/fortify with.');
                schedule.setItem('NotargetFrombattle_monster', 60);
                attackButton = null;
                singleButtonList = null;
                buttonList = null;
                return false;
            }

            schedule.setItem('NotargetFrombattle_monster', 60);
            con.warn('Unable to find top banner for ' + cM.name, cM);
            attackButton = null;
            singleButtonList = null;
            buttonList = null;
            return false;
        } catch (err) {
            con.error("ERROR in monsters: " + err.stack);
            return false;
        }
    };

}());
