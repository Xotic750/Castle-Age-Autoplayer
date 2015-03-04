/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

(function () {
    "use strict";

	worker.add('caap');
	
	worker.addAction({worker : 'caap', priority : 0, description : 'Setting Idle General', functionName : 'passiveGeneral'});	
	
	caap.checkResults = function(page) {
        try {
			switch (page) {
			case 'index' :
				if (config.getItem('AutoGift', false)) {
					gifting.collected();
					// Check for new gifts
					// A warrior wants to join your Army!
					// Send Gifts to Friends
					if ($u.hasContent(caap.resultsText) && /Send Gifts to Friends/.test(caap.resultsText)) {
						con.log(1, 'We have a gift waiting!');
						state.setItem('HaveGift', true);
					}

					var time = config.getItem('CheckGiftMins', 15);
					time = time < 15 ? 15 : time;
					schedule.setItem("ajaxGiftCheck", time * 60, 300);
				}
				
				arena.revengeCheck();
				break;

			default :
				break;
			}
        } catch (err) {
            con.error("ERROR in town.checkResults: " + err.stack);
            return false;
        }
    };

/////////////////////////////////////////////////////////////////////
//                          PASSIVE GENERALS
/////////////////////////////////////////////////////////////////////

    caap.passiveGeneral = function () {
        try {
			var timedLoadoutCheck = general.timedLoadout();
			if (timedLoadoutCheck) {
//				con.log(5,"Idle Check paused",timedLoadoutCheck);
				return timedLoadoutCheck === 'change';
			}
//			con.log(2,"Idle Check equipped", timedLoadoutCheck, caap.stats.battleIdle);
			if (caap.stats.battleIdle != 'Use Current' ? general.Select(caap.stats.battleIdle) 
				: (config.getItem('IdleGeneral', 'Use Current') != 'Use Current') 
				? general.Select(state.getItem('lastLoadout', 'Use Current')) || general.Select(state.getItem('lastGeneral', 'Use Current'))
				: general.Select('IdleGeneral')) {
				return true;
			}
			state.setItem('lastLoadout', 'Use Current');
			state.setItem('lastGeneral', 'Use Current');
			return false;
        } catch (err) {
            con.error("ERROR in passiveGeneral: " + err);
            return false;
        }
    };

/////////////////////////////////////////////////////////////////////
//                              IDLE
/////////////////////////////////////////////////////////////////////

	worker.addAction({worker : 'caap', priority : -10000, description : 'Idle', functionName : 'idle'});
	
    caap.idle = function () {
        if (caap.doCTAs()) {
            return true;
        }
        caap.updateDashboard();
        return true;
    };

/////////////////////////////////////////////////////////////////////
//                          POTIONS
/////////////////////////////////////////////////////////////////////

	worker.addAction({worker : 'caap', priority : -600, description : 'Drinking Potions', functionName : 'autoPotions'});
	
    caap.autoPotions = function() {
        function consumePotion(potion) {
            try {
                if (!caap.hasImage('keep_top.jpg')) {
                    con.log(2, "Going to keep for potions");
                    if (caap.navigateTo('keep')) {
                        return true;
                    }
                }

                var formId = "consume_1",
                    potionDiv = $j(),
                    button = $j();

                if (potion === 'stamina') {
                    formId = "consume_2";
                }

                con.log(1, "Consuming potion", potion);
                potionDiv = $j("form[id='" + formId + "'] input[src*='keep_consumebtn.jpg']");
                if (potionDiv && potionDiv.length) {
                    button = potionDiv;
                    if (button) {
                        caap.click(button);
                    } else {
                        con.warn("Could not find consume button for", potion);

                        potionDiv = null;
                        button = null;
                        return false;
                    }
                } else {
                    con.warn("Could not find consume form for", potion);

                    potionDiv = null;
                    button = null;
                    return false;
                }

                potionDiv = null;
                button = null;
                return true;
            } catch (err) {
                con.error("ERROR in consumePotion: " + err, potion);
                return false;
            }
        }

        try {
            if (!config.getItem('AutoPotions', true) || !schedule.check('AutoPotionTimerDelay')) {
                return false;
            }

            if (caap.stats.exp.dif <= config.getItem("potionsExperience", 20)) {
                con.log(2, "AutoPotions, ENL condition. Delaying 10 minutes");
                schedule.setItem('AutoPotionTimerDelay', 600);
                return false;
            }

            if (caap.stats.energy.num < caap.stats.energy.max - 10 && caap.stats.potions.energy >= config.getItem("energyPotionsSpendOver", 39) && caap.stats.potions.energy > config.getItem("energyPotionsKeepUnder", 35)) {
                return consumePotion('energy');
            }

            if (caap.stats.stamina.num < caap.stats.stamina.max - 10 && caap.stats.potions.stamina >= config.getItem("staminaPotionsSpendOver", 39) && caap.stats.potions.stamina > config.getItem("staminaPotionsKeepUnder", 35)) {
                return consumePotion('stamina');
            }

            return false;
        } catch (err) {
            con.error("ERROR in autoPotions: " + err);
            return false;
        }
    };

/////////////////////////////////////////////////////////////////////
//                          KOBO
/////////////////////////////////////////////////////////////////////

	worker.addAction({worker : 'caap', priority : -2500, description : 'Doing Kobo Rolls', functionName : 'kobo'});
	
    caap.kobo = function() {
        try {
            var button = $j(),
                koboDIV = $j(),
                ginDIV = $j(),
                gin_left = 10,
                hours = 24,
                minutes = 0,
                rClick,
                addClick = false;


            if ((!config.getItem('AutoKobo', true)) || (!schedule.check('AutoKoboTimerDelay'))) {
                caap.setDivContent('kobo_mess', schedule.check('AutoKoboTimerDelay') ? 'Kobo = none' : 'Next Kobo: ' + $u.setContent(caap.displayTime('AutoKoboTimerDelay'), "Unknown"));
                button = null;
                koboDIV = null;
                ginDIV = null;
                return false;
            }
            con.log(2, "autoKobo");

            koboDIV = $j("div[style*='emporium_top']");
            if (!koboDIV || koboDIV.length === 0) {
                con.log(2, "Going to emporium");
                if (caap.navigateTo('goblin_emp')) {
                    button = null;
                    koboDIV = null;
                    ginDIV = null;
                    return true;
                }

                button = null;
                koboDIV = null;
                ginDIV = null;
                throw "Impossible to navigate to emporium page";
            }

            if ($u.hasContent(caap.resultsText) &&  /You have exceeded the 10 emporium roll limit for the day. Come back tomorrow for another chance!/.test(caap.resultsText)) {
                con.log(1, "caap.kobo", caap.resultsText);
                schedule.setItem('AutoKoboTimerDelay', ((hours * 60) + minutes) * 60, 100);
                caap.setDivContent('kobo_mess', schedule.check('AutoKoboTimerDelay') ? 'Kobo = none' : 'Next Kobo: ' + $u.setContent(caap.displayTime('AutoKoboTimerDelay'), "Unknown"));
                button = null;
                koboDIV = null;
                ginDIV = null;
                return false;
            }

            gin_left = Math.min(($j("span[id='gin_left_amt']")).text(), 10);
            con.log(4, "gin_left = ", gin_left);
            if (gin_left > 0) {
                var ingredientDIV = $j("div[class='ingredientUnit']" + (config.getItem('autoKoboAle', false) ? "" : "[id!='gout_6_261']") + ">div>span[id*='gout_value']"),
                    countClick = 0,
                    whiteList = config.getList('kobo_whitelist', ''),
					useWhiteList = config.getItem('autoKoboUseWhiteList',false),
                    blackList = config.getList('kobo_blacklist', ''),
					useBlackList = config.getItem('autoKoboUseBlackList',false);

                con.log(4, "ingredientDIV = ", ingredientDIV);
                ingredientDIV.each(function(_i, _e) {
                    var count = $j(_e).text(),
                        name = $j(_e).parent().parent()[0].children[0].children[0].alt,
    					whiteListed=false,
    					blackListed=false, 
						p=0, len=0;

                    con.log(3, "ingredient " + _i + " '" + name + "' :count = " + count);
                    if (count > config.getItem('koboKeepUnder', 10) && (gin_left > countClick) ) {
						if (useWhiteList) {
							for (p = 0, len = whiteList.length; p < len; p += 1) {
								if (name.trim().toLowerCase().match(new RegExp(whiteList[p].trim().toLowerCase()))) { 
									con.log(2, "ingredient " + _i + " '" + name + "' is white listed with condition : "+whiteList[p]);
									whiteListed = true; 
								}
							}
							if (!whiteListed) { con.log(2, "ingredient " + _i + " '" + name + "' isn't white listed"); }
						} else {
							whiteListed=true;
						}
						if (useBlackList) {
							for (p = 0, len = blackList.length; p < len; p += 1) {
								if (name.trim().toLowerCase().match(new RegExp(blackList[p].trim().toLowerCase()))) { 
									con.log(2, "ingredient " + _i + " '" + name + "' is black listed with condition : "+blackList[p]);
									blackListed = true; 
								}
							}
							if (!blackListed) { con.log(2, "ingredient " + _i + " '" + name + "' isn't black listed"); }
						}
						if ((whiteListed)&&(!blackListed)) {
							addClick = true;
							countClick = countClick + 1;
							$j(_e).parent().parent().click();
						}
                    }
                });

                if (!addClick) {
                    schedule.setItem('AutoKoboTimerDelay', ((hours * 60) + minutes) * 60);
                    caap.setDivContent('kobo_mess', schedule.check('AutoKoboTimerDelay') ? 'Kobo = none' : 'Next Kobo: ' + $u.setContent(caap.displayTime('AutoKoboTimerDelay'), "Unknown"));
                    button = null;
                    koboDIV = null;
                    ginDIV = null;
                    return false;
                }

                if (gin_left > countClick) {
                    button = null;
                    koboDIV = null;
                    ginDIV = null;
                    return true;
                }
            }

            button = caap.checkForImage('emporium_button.gif');
            if (button && button.length > 0) {
                con.log(2, "Click Roll");
                hours = 0;
                minutes = 1;
                schedule.setItem('AutoKoboTimerDelay', ((hours * 60) + minutes) * 60, 100);
                caap.setDivContent('kobo_mess', schedule.check('AutoKoboTimerDelay') ? 'Kobo = none' : 'Next Kobo: ' + $u.setContent(caap.displayTime('AutoKoboTimerDelay'), "Unknown"));
                rClick = caap.click(button);

                button = null;
                koboDIV = null;
                ginDIV = null;
                return rClick;
            }

            button = null;
            koboDIV = null;
            ginDIV = null;
            return false;

        } catch (err) {
            con.error("ERROR in autoKobo: " + err);
            return false;
        }
    };

/////////////////////////////////////////////////////////////////////
//                              CTA
/////////////////////////////////////////////////////////////////////

    caap.waitAjaxCTA = false;

    caap.recordCTA = [];

    caap.loadedCTA = false;

    caap.waitLoadCTA = true;

    caap.doCTAs = function () {
        function onError() {
            caap.waitAjaxCTA = false;
        }

        function onSuccess() {
            caap.waitAjaxCTA = false;
        }

        try {
            if ((gm ? gm.getItem("ajaxCTA", false, hiddenVar) : false) || caap.waitAjaxCTA || caap.stats.stamina.num < 1 || !schedule.check('ajaxCTATimer')) {
                return false;
            }

            if (caap.waitLoadCTA) {
                $j.ajax({
                    url: caap.domain.protocol[caap.domain.ptype] +
                        "query.yahooapis.com/v1/public/yql?q=select%20*%20from%20csv%20where%20url%3D'http%3A%2F%2Fspreadsheets.google.com%2Fpub%3Fkey%3D0At1LY6Vd3Bp9dFhvYkltNVdVNlRfSzZWV0xCQXQtR3c%26hl%3Den%26output%3Dcsv'&format=json",
                    dataType: ($u.is_opera ? "jsonp" : "json"),
                    error: function () {
                        caap.loadedCTA = true;
                    },
                    success: function (msg) {
                        var rows = msg.query && msg.query.results && msg.query.results.row ? msg.query.results.row : [],
                            row = 0,
                            rowsLen = 0,
                            column = 0,
                            newRecord = {}, headers = $u.hasContent(rows) ? rows[0] : {}, headersLen = 0,
                            headersArr = [],
                            key = '';

                        for (key in headers) {
                            if (headers.hasOwnProperty(key)) {
                                headersLen = headersArr.push((headers[key]).toLowerCase());
                            }
                        }

                        for (row = 1, rowsLen = rows.length; row < rowsLen; row += 1) {
                            newRecord = {};
                            for (column = 0; column < headersLen; column += 1) {
                                if ($u.hasContent(headersArr[column])) {
                                    newRecord[headersArr[column]] = $u.setContent(rows[row]["col" + column], null);
                                }
                            }

                            caap.recordCTA.push(newRecord);
                        }

                        caap.loadedCTA = true;
                    }
                });

                caap.waitLoadCTA = false;
                return true;
            }

            if (!$u.hasContent(caap.recordCTA) || !caap.loadedCTA) {
                return false;
            }

            var count = state.getItem('ajaxCTACount', 0);
            if (count < caap.recordCTA.length) {
                caap.waitAjaxCTA = true;

                caap.ajax(caap.recordCTA[count].code.AESDecrypt(caap.namespace), null, onError, onSuccess);

                state.setItem('ajaxCTACount', count + 1);
            } else {
                caap.waitAjaxCTA = false;
                state.setItem('ajaxCTACount', 0);
                schedule.setItem('ajaxCTATimer', 10800, 300);
            }

            return true;
        } catch (err) {
            con.error("ERROR in doCTAs: " + err);
            return false;
        }
    };

/////////////////////////////////////////////////////////////////////
//                          GUILD
/////////////////////////////////////////////////////////////////////

    caap.checkResults_guild = function() {
        try {
            if (session.getItem("clickUrl").hasIndexOf("guild_battle=true")) {
                caap.guildTabAddListener();
                con.log(2, "Battle List");
                return true;
            }

            // Guild
            var guildTxt = '',
                guildDiv = $j(),
                tStr = '',
                members = [],
                save = false;

            if (config.getItem('enableMonsterFinder', false)) {
                feed.items("guild");
            }

            guildTxt = $j("#globalContainer #guild_achievement").text().trim().innerTrim();
            if ($u.hasContent(guildTxt)) {
                tStr = guildTxt.regex(/Monster ([\d,]+)/);
                caap.stats.guild.mPoints = $u.hasContent(tStr) ? ($u.isString(tStr) ? tStr.numberOnly() : tStr) : 0;
                tStr = guildTxt.regex(/Battle ([\d,]+)/);
                caap.stats.guild.bPoints = $u.hasContent(tStr) ? ($u.isString(tStr) ? tStr.numberOnly() : tStr) : 0;
                tStr = guildTxt.regex(/Monster [\d,]+ points \(Top (\d+\-\d+%)\)/);
                caap.stats.guild.mRank = $u.hasContent(tStr) ? tStr : '';
                tStr = guildTxt.regex(/Battle [\d,]+ points \(Top (\d+\-\d+%)\)/);
                caap.stats.guild.bRank = $u.hasContent(tStr) ? tStr : '';
                save = true;
            } else {
                con.warn('Using stored guild Monster and Battle points.');
            }

            guildTxt = $j("#globalContainer #guild_blast input[name='guild_id']").attr("value");
            if ($u.hasContent(guildTxt)) {
                caap.stats.guild.id = guildTxt;
                save = true;
            } else {
                con.warn('Using stored guild_id.');
            }

            guildTxt = $j("#globalContainer #guild_banner_section").text().trim();
            if ($u.hasContent(guildTxt)) {
                caap.stats.guild.name = guildTxt;
                save = true;
            } else {
                con.warn('Using stored guild name.');
            }

            guildDiv = $j("#globalContainer div[style*='guild_popup_middle.jpg'] div[style*='float:left;'] a[href*='keep.php?casuser']");
            if ($u.hasContent(guildDiv)) {
                guildDiv.each(function() {
                    var t = $j(this),
                        uid = t.attr("href").regex(/casuser=(\d+)/),
                        name = t.text().trim();

                    if (uid !== caap.stats.FBID) {
                        members.push({
                            'userId': uid,
                            'name': name
                        });
                    }

                    t = null;
                });

                caap.stats.guild.members = members.slice();
                save = true;
            } else {
                con.warn('Using stored guild member count.');
            }

            con.log(2, "checkResults_guild", caap.stats.guild);
            if (save) {
                caap.saveStats();
            }

            guildDiv = null;
            return true;
        } catch (err) {
            con.error("ERROR in checkResults_guild: " + err);
            return false;
        }
    };

    caap.guildTabListener = function(event) {
        session.setItem("clickUrl", $u.setContent($j(event.target).parent().attr("onclick"), '').regex(new RegExp(",'(.+\\.php.*?)'")));
    };

    caap.guildTabAddListener = function() {
        $j("div[style*='guild_tab_off_tile.jpg'],div[style*='guild_tab_on_tile.jpg']").off('click', caap.guildTabListener).on('click', caap.guildTabListener);
    };

    caap.checkResults_guild_panel = function() {
        caap.guildTabAddListener();
    };

    caap.checkResults_guild_shop = function() {
        caap.guildTabAddListener();
    };

    caap.checkResults_guild_class = function() {
        caap.guildTabAddListener();
    };

    caap.checkResults_guild_formation = function() {
        caap.guildTabAddListener();
    };
	
}());
