/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,gm,hiddenVar,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,battle,conquest,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          CONQUEST OBJECT
// this is the main object for dealing with Conquest
/////////////////////////////////////////////////////////////////////

(function() {
   "use strict";

 	worker.add({ name: 'essence', recordIndex: 'guildId'});

    essence.record = function(guildId) {
        this.data = {
            guildId: guildId,
            name: '',
            level: 0,
            lastCheck: 0,
            attack: '',
            defense: '',
            damage: '',
            health: ''
        };
    };

    essence.clear = function() {
        try {
            essence.records = [];
            essence.doSave = true;
            session.setItem("essenceDashUpdate", true);
            return true;
        } catch (err) {
            con.error("ERROR in essence.clear: " + err);
            return false;
        }
    };

    essence.rescan = function() {
        try {
            essence.records.forEach( function(e) {
                e.lastCheck = Date.now();
				['attack', 'defense', 'damage', 'health'].forEach( function(a) {
					e[a] = -1;
				});
            });
            essence.doSave = true;
            session.setItem("essenceDashUpdate", true);
            return true;
        } catch (err) {
            con.error("ERROR in essence.clear: " + err);
            return false;
        }
    };

    essence.checkResults = function(page) {
        try {
			essence.eR = false;
			switch (page) {
			case 'conquest_duel' :
				stats.essence.bonus = $u.setContent($u.setContent($j('#app_body a[href*="trade_market.php"]').text(), '').regex(/(\d+)/), 0);
				break;
			case 'trade_market' :
				stats.essence.bonus = $u.setContent($u.setContent($j('#app_body a[href*="conquest_duel.php"]').text(), '').regex(/(\d+)/), 0);
				var guildCapsules = $j("[style*='trade_capsule']");
				guildCapsules.each(function() {
					var currentCapsule = $j(this),
						eR = essence.getRecord($j("[name='guild_id']", currentCapsule)[0].value);
						
					eR.name = currentCapsule.children().eq(0).eq(0).eq(0).eq(0).text().trim();
					eR.level = currentCapsule.children().eq(1).children(2).children(0).children(0).eq(0).text().match(/(\d+)/)[1];
					essence.setRecord(eR);
				});
				break; 
			case 'guild_conquest_market' :
				stats.essence.bonus = $u.setContent($u.setContent($j('#app_body a[href*="conquest_duel.php"]').text(), '').regex(/(\d+)/), 0);
				var storageDivs = $j("[id^='storage_']"),
					eR = essence.getRecord($j("[id^='guild_name_header']").children().eq(0).attr('href').split('=')[1]);

				eR.name = $j("[id^='guild_name_header']").children().eq(0).text();

				storageDivs.each(function() {
					var essenceText = $j(this).children().eq(0).text().split(/\W+/);
					eR[essenceText[1].toLowerCase()] = essenceText[6] - essenceText[5];
				});
				eR.lastCheck = Date.now();
				essence.setRecord(eR);
				essence.eR = eR;

				// update my essence totals
				stats.essence.attack = parseInt ($j("div[title*='Attack Essence']")[0].title.replace('Attack Essence - ', ''), 10);
				stats.essence.defense = parseInt ($j("div[title*='Defense Essence']")[0].title.replace('Defense Essence - ', ''), 10);
				stats.essence.health = parseInt ($j("div[title*='Health Essence']")[0].title.replace('Health Essence - ', ''), 10);
				stats.essence.damage = parseInt ($j("div[title*='Damage Essence']")[0].title.replace('Damage Essence - ', ''), 10);

				break;
			default :
				break;
			}
       } catch (err) {
            con.error("ERROR in essence.checkResults: " + err.stack);
            return false;
        }
    };
	
    essence.dashboard = function() {
        function points(num) {
            num = $u.setContent(num, 0);
            return num >= 0 ? "+" + num : num;
        }

        try {
            /*-------------------------------------------------------------------------------------\
            Next we build the HTML to be included into the 'caap_infoGuilds' div. We set our
            table and then build the header row.
            \-------------------------------------------------------------------------------------*/
            if (config.getItem('DBDisplay', '') === 'Guild Essence' && session.getItem("essenceDashUpdate", true)) {
                var headers = ['Name', 'Attack', 'Defense', 'Damage', 'Health'],
                    values = ['name', 'attack', 'defense', 'damage', 'health'],
                    pp = 0,
                    i = 0,
                    userIdLink = '',
                    userIdLinkInstructions = '',
                    len = 0,
                    len1 = 0,
					tmp = '',
                    data = {
                        text: '',
                        color: '',
                        bgcolor: '',
                        id: '',
                        title: ''
                    },
                    head = '',
                    body = '',
                    row = '';

                for (pp = 0; pp < headers.length; pp += 1) {
                    switch (headers[pp]) {
                    case 'Name':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '30%'
                        });
                        break;
                    case 'attack':
                    case 'defense':
                    case 'damage':
                    case 'health':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '10%'
                        });
                        break;
                    default:
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '7%'
                        });
                    }
                }

                head = caap.makeTr(head);
                for (i = 0, len = essence.records.length; i < len; i += 1) {
                    row = "";
                    for (pp = 0, len1 = values.length; pp < len1; pp += 1) {
                        switch (values[pp]) {
                        case 'name':
                            userIdLinkInstructions = "Clicking this link will take you to the guild keep of " + essence.records[i][values[pp]];
                            userIdLink = "guild_conquest_market.php?guild_id=" + essence.records[i].guildId;
                            data = {
                                text: '<span id="caap_Guilds_' + i + '" title="' + userIdLinkInstructions + '" rlink="' + userIdLink +
                                    '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + essence.records[i][values[pp]] + '</span>',
                                color: 'blue',
                                id: '',
                                title: ''
                            };

                            row += caap.makeTd(data);
                            break;
                        case 'attack':
                        case 'defense':
                        case 'damage':
                        case 'health':
							row += caap.makeTd({
                                text: essence.records[i][values[pp]],
                                color: essence.records[i][values[pp]] > 0 ? 'green' : 'black'			,
                                id: '',
                                title: ''
                            });
                            break;
                        default:
                            row += caap.makeTd({
                                text: essence.records[i][values[pp]],
                                color: '',
                                id: '',
                                title: ''
                            });
                        }
                    }

                    body += caap.makeTr(row);
                }

                $j("#caap_infoGuilds", caap.caapTopObject).html(
                $j(caap.makeTable("Guilds", head, body)).dataTable({
                    "bAutoWidth": false,
                    "bFilter": false,
                    "bJQueryUI": false,
                    "bInfo": false,
                    "bLengthChange": false,
                    "bPaginate": false,
                    "bProcessing": false,
                    "bStateSave": true,
                    "bSortClasses": false
                }));

                $j("span[id*='caap_Guilds_']", caap.caapTopObject).click(function(e) {
                    var visitUserIdLink = {
                        rlink: '',
                        arlink: ''
                    },
                    i = 0,
                        len = 0;

                    for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                        if (e.target.attributes[i].nodeName === 'rlink') {
                            visitUserIdLink.rlink = e.target.attributes[i].nodeValue;
                            visitUserIdLink.arlink = visitUserIdLink.rlink;
                        }
                    }

                    caap.clickAjaxLinkSend(visitUserIdLink.arlink);
                });

                session.setItem("essenceDashUpdate", false);
            }

            return true;
        } catch (err) {
            con.error("ERROR in essence.dashboard: " + err);
            return false;
        }
    };

	worker.addPageCheck({page : 'trade_market', config: 'EssenceScanCheck'});
	
	worker.addAction({worker : 'essence', priority : -2600, description : 'Scout Guild Essence'});

    essence.worker = function() {
        try {
			var energyConfig = config.getItem('EssenceEnergyMin', 0),
				unitMin = Math.max(1, Math.min(4, Math.floor((stats.energy.norm - energyConfig) / 25))),
				minEnergy = unitMin * 25 + energyConfig,
				result = false,
				essenceChecks = ['attack', 'defense', 'damage', 'health'],
				tradedEssence = '',
				guildButtonLevel,
				runeButtonLevel,
				buttonLevel,
				target;
				
            if (!config.getItem('EssenceScanCheck', false)) {
				return {action: false, mess: ''};
			}
			
            if (stats.energy.num < minEnergy) {
				return {action: false, mess: 'Waiting for ' + stats.energy.num + '/' + (unitMin * 25 + energyConfig)};
			}
			
			if (essence.eR && caap.ifClick(caap.checkForImage('trade_btn_confirm.gif', $j("#single_popup_content")))) {
				return {log: 'Clicking trade confirm button'};
			}
			
            if (stats.essence.bonus < config.getItem('essenceBonus', 0)) {
				return {action: false, mess: 'Waiting for essence bonus: ' + stats.essence.bonus + '/' + config.getItem('essenceBonus', 0) + '%'};
			}
			
			essenceChecks = essenceChecks.filter( function(e) {
				return config.getItem('essence' + e.ucWords(), false) 
					&& (stats.essence[e] >= unitMin * 200 || state.getItem('essenceBurn', false));
			});
			
			if (essenceChecks.length === 0) {
				state.deleteItem('essenceBurn');
				return {action: false, mess: 'No essence over minimum of ' + unitMin * 200};
			}
			state.setItem('essenceBurn', true);
			
			// If we have an essence record from checkResults, then try trading
			if (essence.eR) {

				result = essenceChecks.some( function(e) {

					guildButtonLevel = Math.floor(essence.eR[e] / 200);
					runeButtonLevel = Math.floor(stats.essence[e] / 200);
					buttonLevel = Math.min(guildButtonLevel, unitMin, runeButtonLevel);

					if (buttonLevel >= 1) {
						target = ['attack', 'defense', 'damage', 'health'].indexOf(e) + 1;
						caap.click ($j('#trade_confirm_pop_' + target + '_' + (buttonLevel - 1))[0]);
						tradedEssence = e;
						return true;
					}
				 });
				if (result) {
					return {mlog: 'Trading ' + buttonLevel * 200 + ' ' + tradedEssence + ' essence'};
				}
			}
			
			// Look for guilds that had space in an essence we want to trade
			essenceChecks.some( function(a) {
				result = essence.records.sort($u.sortBy(true, a)).some( function(eR) {
					if (stats.essence[a] >= 200 && eR[a] >= 200 && schedule.since(eR.lastCheck, 7 * 60 * 60)) {
						caap.clickAjaxLinkSend("guild_conquest_market.php?guild_id=" + eR.guildId, 1000);
						return true;
					}
				});
				if (result) {
					return true;
				}
			});
			
			if (result) {
				return {mlog: 'Scanning guilds that had essence space before'};
			}

			// Look for guilds we haven't reviewed in several hours
			result = essence.records.sort($u.sortBy(false, "lastCheck")).some( function(eR) {
				if (schedule.since(eR.lastCheck, 5 * 60 * 60)) {
					caap.clickAjaxLinkSend("guild_conquest_market.php?guild_id=" + eR.guildId, 1000);
					return true;
				}
			});
			
			if (result) {
				return {mlog: 'Scanning guilds not reviewed in a while'};
			}
			
			if (essence.records.length < 500) {
				caap.navigateTo('trade_market');
				return {mlog: 'Looking in trade market for more guilds to add to the ' + essence.records.length};
			}
			
			state.deleteItem('essenceBurn');

            return {action: false, mess: 'No guilds with essence space available'};
        } catch (err) {
            con.error("ERROR in essence.worker: " + err);
            return false;
        }
    };
	
    essence.menu = function () {
        try {
            var energyInstructions = "Only trade if energy is above this amount",
				bonusInstructions = "Only trade if trade bonus from Conquest Duel is at or above this percentage",
                essenceInstructions = "Scan Trade Market for guilds with room to trade essence.",
				tradeInstructions = 'If checked, will trade when essence is over 800 or as much as you can trade at one time according to your max energy and the min energy setting',
                htmlCode = caap.startToggle('essenceOptions', 'ESSENCE TRADING');
				
            htmlCode += caap.makeCheckTR('Scan for Essence', 'EssenceScanCheck', false, essenceInstructions);
            htmlCode += caap.display.start('EssenceScanCheck');
            htmlCode += caap.makeNumberFormTR("Min Energy for Trade", 'EssenceEnergyMin', energyInstructions, 0, '', '', false, false, 30);
            htmlCode += caap.makeNumberFormTR("Min Bonus % for Trade", 'essenceBonus', bonusInstructions, 0, '', '', false, false, 30);
            ['Attack', 'Damage', 'Defense', 'Health'].forEach( function(e) {
                htmlCode += caap.makeCheckTR('Trade ' + e, 'essence' + e, false, tradeInstructions);
            });
            htmlCode += caap.display.end('EssenceScanCheck');
            htmlCode += caap.endToggle;
            return htmlCode;
        } catch (err) {
            con.error("ERROR in addEssenceMenu: " + err.stack);
            return '';
        }
    };
	
}());