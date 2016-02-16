/*jslint white: true, browser: true, devel: true, 
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global $j,$u,caap,config,con,schedule,state,session, worker, essence, stats */
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
            attack: 0,
            defense: 0,
            damage: 0,
            health: 0
        };
    };

    essence.checkResults = function(page) {
        try {
			var storageDivs, guildCapsules, eR;
			essence.eR = false;
			switch (page) {
			case 'conquest_duel' :
				stats.essence.bonus = $u.setContent($u.setContent($j('#app_body a[href*="trade_market.php"]').text(), '').regex(/(\d+)/), 0);
				break;
			case 'trade_market' :
				stats.essence.bonus = $u.setContent($u.setContent($j('#app_body a[href*="conquest_duel.php"]').text(), '').regex(/(\d+)/), 0);
				guildCapsules = $j("[style*='trade_capsule']");
				guildCapsules.each(function() {
					var currentCapsule = $j(this);
					
					eR = essence.getRecord($j("[name='guild_id']", currentCapsule)[0].value);
						
					eR.name = currentCapsule.children().eq(0).eq(0).eq(0).eq(0).text().trim();
					eR.level = currentCapsule.children().eq(1).children(2).children(0).children(0).eq(0).text().match(/(\d+)/)[1];
					essence.setRecord(eR);
				});
				break; 
			case 'guild_conquest_market' :
				stats.essence.bonus = $u.setContent($u.setContent($j('#app_body a[href*="conquest_duel.php"]').text(), '').regex(/(\d+)/), 0);
				storageDivs = $j("[id^='storage_']");
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
	
	worker.addPageCheck({page : 'trade_market', config: 'EssenceScanCheck'});
	
	worker.addAction({worker : 'essence', priority : -2600, description : 'Scout Guild Essence'});

    essence.worker = function() {
        try {
			var energyConfig = config.getItem('EssenceEnergyMin', 0),
				unitMin = Math.max(1, Math.min(4, Math.floor((stats.energy.norm - energyConfig) / 25))),
				minEnergy = unitMin * 25 + energyConfig,
				result = false,
				essenceChecks = ['attack', 'defense', 'damage', 'health'].filter( function(e) {
					return config.getItem('essence' + e.ucWords(), false) &&
						(stats.essence[e] >= unitMin * 200 || (state.getItem('essenceBurn', false) && stats.essence[e] > 200));
				}),
				tryGuildF = function(g, type) {
					var guildButtonLevel = Math.floor(g[type] / 200),
						runeButtonLevel = Math.floor(stats.essence[type] / 200),
						amount = Math.min(guildButtonLevel, unitMin, runeButtonLevel) * 200,
						target = ['attack', 'defense', 'damage', 'health'].indexOf(type) + 1;
					caap.navigate3("guild_conquest_market.php?guild_id=" + g.guildId, "guild_conquest_market.php?guild_id=" + g.guildId +
						"&confirmTrade=" + target + "&confirmedTradeAmount=" + amount);
					result = {mlog: 'Trading ' + amount + ' ' + type + ' essence'};
				};
				
            if (!config.getItem('EssenceScanCheck', false)) {
				return {action: false, mess: ''};
			}
			
			if (essenceChecks.length === 0) {
				state.deleteItem('essenceBurn');
				return {action: false, mess: 'No essence over minimum of ' + unitMin * 200};
			}

            if (stats.energy.num < Math.min(minEnergy + 100, stats.energy.norm - 15)) {
				return {action: false, mess: 'Waiting for ' + stats.energy.num + '/' + Math.min(minEnergy + 100, stats.energy.norm - 15)};
			}
			
            if (stats.essence.bonus < config.getItem('essenceBonus', 0)) {
				return {action: false, mess: 'Waiting for essence bonus: ' + stats.essence.bonus + '/' + config.getItem('essenceBonus', 0) + '%'};
			}
			
			state.setItem('essenceBurn', true);
			
			// Look for guilds that had space in an essence we want to trade
			essence.records.some( function(eR) {
				return essenceChecks.some( function(type) {
					if (stats.essence[type] >= 200 && eR[type] >= 200) {
						tryGuildF(eR, type);
						return true;
					}
				});
			});
			
			if (result) {
				return result;
			}
			
			// Scan guilds
			essence.records.some( function(eR) {
				if (schedule.since(eR.lastCheck, 7 * 60 * 60)) {
					tryGuildF(eR, 'attack');
					return true;
				}
			});
			
			if (result) {
				return {mlog: 'Scanning guilds'};
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
	
	essence.dashboard = {
		name: 'Essence Stats',
		inst: 'Display Essence storage space for Guilds that have been scouted',
		records: 'essence',
		buttons: ['clear',
			{name: 'Rescan Essence',
				func: function() {
					essence.records.forEach( function(e) {
						e.lastCheck = Date.now();
						['attack', 'defense', 'damage', 'health'].forEach( function(a) {
							e[a] = -1;
						});
					});
					essence.save('update');
			}}
		],
		tableEntries: [
			{name: 'User ID', color: 'blue', format: 'text',
				valueF: function(r) {
					return '<a href="' + caap.domain.altered + '/guild_conquest_market.php?guild_id=' + r.guildId +
						'" onclick="ajaxLinkSend(\'globalContainer\', \'guild_conquest_market.php?guild_id=' + r.guildId +
						'\'); return false;" style="text-decoration:none;font-size:9px;">' + r.name + '</a>';
			}},
			{name: 'Attack', format: 'nonnegative'},
			{name: 'Defense', format: 'nonnegative'},
			{name: 'Damage', format: 'nonnegative'},
			{name: 'Health', format: 'nonnegative'},
			{name: 'name', type: 'remove'}
		]
	};
	
}());