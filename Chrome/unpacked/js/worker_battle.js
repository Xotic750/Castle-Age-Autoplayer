/*jslint white: true, browser: true, devel: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,image64,$j,rison,utility,
festival,feed,battle,
$u,stats,worker,self,caap,config,con,gm,recon,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          battle OBJECT
// this is the main object for dealing with battles
/////////////////////////////////////////////////////////////////////

(function() {
    "use strict";

	worker.add({name: 'battle', recordIndex: 'userId'});

    battle.record = function(userId) {
        this.data = {
            userId: userId,
            name: '',
			minDef : 0,
			maxDef : 1000000,
			hiding: 0,
            wonTime: 0,
            lostTime: 0,
            deadTime: 0,
			valid: true,
            festRank: -1,
			festPoints : 0,
            conqRank: -1,
			conqInvadePoints : 0,
			conqDuelPoints : 0,
			conqValid : true,
            level: 0,
            army: -1,
            rank: -1,
            deity: -1,
            invadeWon: 0,
            invadeLost: 0,
            invadePoints: 0,
            duelWon: 0,
            duelLost: 0,
            duelPoints: 0,
            warRank: -1,
            warWon: 0,
            warLost: 0,
            warPoints: 0,
            chainCount: 0,
            chainRest: 0,
			gbPoints : 0,
/*          arenaRank: 0,
			arenaLost : 0,
			arenaWon : 0,
			arenaRevenge: false,
			arenaDeadTime: 0,
			arenaPoints: 0,
			arenaTotal: 0,
			arenaInvalid: false,
*/          newRecord: true
        };
    };
	
/////////////////////////////////////////////////////////////////////
// 	Data for the specific types of battles
/////////////////////////////////////////////////////////////////////
    battle.Raid = { // Not updated for new format
		Invade1: 'raid_attack_button.gif',
		Invade5: 'raid_attack_button3.gif',
		Duel1: 'raid_attack_button2.gif',
		Duel5: 'raid_attack_button4.gif',
		regex1: new RegExp('[0-9]+\\. (.+)\\s*Rank: ([0-9]+) ([^0-9]+) ([0-9]+) ([^0-9]+) ([0-9]+)', 'i'),
		refresh: 'raid',
		image: 'battle_tab_raid_on.jpg'
	};
	
	battle.Invade = {rank: 		'rank',
					myRank:		'battle',
					points: 	'invadePoints',
					kinds:		'kinds',
					demis: 		true,
					invade:		true,
					dead: 		'deadTime',
					chained: 	'chainRest',
					chainCount:	'chainCount',
					general: 	'InvadeGeneral',
					when: 		'WhenBattle',
					maxChain: 	'maxChain',
					maxRank: 	'battleMaxRank',
					minRank: 	'battleMinRank',
					idList:		'battleIdList',
					lost:		'invadeLost',
					won:		'invadeWon',
					valid:		'valid',
					minLevel: 	8,
					page:		'battle',
					delay:		'battleDelay',
					mid:		'battle_mid.jpg',
					recon:		'recon',
					regex: 		/(.+) \(Level (\d+)\)\s*Battle: [\w ]+ \(Rank (\d+)\).* (\d+)\b/i,
					stats: 		['name', 'level', 'rank', 'army'],
					pointList: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,6,8,10,12,13,15,16,17,18,19,19,19,19,20,20,20,20,20,20,20,20,20,20,20],
					linkF: function(bR) {
						return 'battle.php?symbol_id=' + (bR.deity + 1) + '&target_id=' + bR.userId +'&action=battle&duel=false';
					},
					checkF: function(bR, div) {
						if (stats.level >= battle.War.minLevel) {
							caap.bulkRegex(div, /\s*War: [\w ]+ \(Rank (\d+)\)/, bR, ['warRank']);
						}
						var tempTxt = $u.setContent($j("img[src*='iphone_']", div).attr("src"), '').regex(/_(\w+)_icon\.gif/i);
						if ($u.hasContent(tempTxt) && $u.hasContent(caap.deityTable[tempTxt] - 1)) {
							bR.deity = caap.deityTable[tempTxt] - 1;
						} else {
							con.warn("Unable to match demi number in tempTxt", tempTxt);
						}
					},
					winLossRegex: /Your Army of (\d+) fought with.* x\d+(.+)'s Army of (\d+) fought with.* You have (lost|won) (\d+) Battle Points.*\$([,\d]+)?/i,
					regexVars: ['myArmy', 'name', 'army', 'wl', 'points', 'gold'],
					winLossF: function(r) {
						r.att = stats.bonus.api * r.myArmy / r.army;
						r.gold = r.gold ? r.gold.numberOnly() : 0;
						r.points = (r.wl == 'won' ? 1 : -1) * r.points;
					},
					other: 'Duel' // Check duel for win loss if no match for Invade
				};
					
	battle.Duel = {	general: 	'DuelGeneral',  // Undefined items filled in by battle.Invade in battle.init()
					points:		'duelPoints',
					invade:		false,
					lost:		'duelLost',
					won:		'duelWon',
					link: function(bR) {
						return 'battle.php?symbol_id=' + (bR.deity + 1) + '&target_id=' + bR.userId + '&action=battle&duel=true';
					},
					winLossRegex: /.*\d+(.*) fought with.*You have (won|lost) (\d+) Battle Points.*\$([,\d]+)?/i,
					regexVars: ['name', 'wl', 'points', 'gold'],
					winLossF: function(r) {
						r.att = stats.bonus.api;
						r.gold = r.gold ? r.gold.numberOnly() : 0;
						r.points = (r.wl == 'won' ? 1 : -1) * r.points;
					},
					other: 'War' // Check War for win loss if no match for duel
				};
					
	battle.War = {	rank: 		'warRank',  // Undefined items filled in by battle.Invade in battle.init()
					myRank:		'war',
					points:		'warPoints',
					demis: 		false,
					invade:		false,
					lost:		'warLost',
					won:		'warWon',
					general: 	'WarGeneral',
					minLevel: 	100,
					pointList: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,6,8,10,12,13,15,16,17,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18],
					linkF: function(bR) { return 'battle.php?target_id=' + bR.userId + '&action=war';	},
					winLossRegex: /Cost -(10) Stamina/,
					regexVars: ['points'], // Just using as a placeholder to make sure it matches
					winLossF: function(r) {
						r.name = caap.resultsText.regexd(/\(\d+ total points\)(.*?)'s Defense/i, 'Unknown');
						r.wl = $u.hasContent(caap.resultsText.regex(/Gain (\+\d+ Experience)/i)) ? 'won' : 'lost';
						r.gold = caap.resultsText.regexd(/\$([,\d]+)/, 0);
						r.points = caap.resultsText.regexd(/([\+\-\d]+) War Points/i, 0);
					},
					other: 'None'
				};
	
	battle.Festival = {	rank: 	'festRank',  // Undefined items filled in by battle.Duel in battle.init()
					myRank:		'festival',
					points:		'festivalPoints', 
					demis: 		false,
					page:		'festival_duel_battle',
					mid:		'festival_duelchamp_line.jpg',  //Damn (LEVEL 819) Protector (Rank 7)
					regex: 		/(.+) \(LEVEL (\d+)\) [\w ]+ \(Rank (\d+)\)/i,
					stats: 		['name', 'level', 'festRank'],
					minLevel: 	1,
					pointList: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,6,8,10,12,13,15,16,17,18,19,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
					linkF: function(bR) { return 'festival_duel_battle.php?target_id=' + bR.userId + '&action=battle&duel=true';	},
					checkF: function() { return; },
					//Your are defeated in battle, taking 10 damage and dealing 6 damage to your enemy. -3 Champion Points! -100000 Gold
					winLossRegex: /Your? are (\w+) in battle,.* ([\+\-\d]+) Champion Points.* ([\+\-\d]+) Gold/i,
					regexVars: ['wl', 'points', 'gold'],
					winLossF: function(r) {
						r.att = stats.bonus.api;
						r.wl = r.wl === 'victorious' ? 'won' : 'lost';
					},
					other: 'None'
				};
	
	battle.ConqInvade = {rank: 	'conqRank',
					myRank:		'conquest',
					points:		'conqInvadePoints',
					invade:		true,
					kinds:		'conqKinds',
					general: 	'InvadeGeneral', 
					when: 		'WhenConquest',
					maxChain: 	'ConquestMaxChains',
					maxRank: 	'ConquestMinRank',
					minRank: 	'ConquestMaxRank',
					valid:		'conqValid',
					lost:		'invadeLost',
					won:		'invadeWon',
					delay:		'conqDelay',
					minLevel: 	80,
					dead: 		'deadTime',
					chained: 	'chainRest',
					chainCount:	'chainCount', // A bit of overlap between Battle chain counts, which could be different, but not worth adding another entry to the record
					page:		'conquest_duel',
					mid:		'war_conquest_mid.jpg',
					recon:		'conquest',
					regex: 		/(.+) \(Level (\d+)\) Conquest Rank: [\w ]+ \(Rank (\d+)\) (\d+)\b/i,
					stats: 		['name', 'level', 'conqRank', 'army'],
					// No data on wiki on this, so assuming the same as invade
					pointList: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,6,8,10,12,13,15,16,17,18,19,19,19,19,20,20,20,20,20,20,20,20,20,20,20],
					linkF: function(bR) {
						return 'conquest_duel.php?target_id=' + bR.userId +'&action=battle&duel=false';
					},
					checkF: function() { return; },
					 //+13 Conquest Rank Pts +18 Battlelust Points -1 Conquest Token +1 Conquest XP
					winLossRegex: /Army(\d+) .*? Army(\d+) .*? ([\+\-\d]+) Conquest Rank Pts .* ([\+\-\d]+) Guild Coins/i,
					regexVars: ['myArmy', 'army', 'points', 'wl'],
					winLossF: function(r) {
						r.att = stats.bonus.api * r.myArmy / r.army;
						r.wl = r.wl === 0 ? 'lost' : 'won';
						r.name = caap.resultsText.regex(/[\+\-\d]+ Health (.*) [\+\-\d]+ Conquest Rank Pts/i);
					},
					other: 'ConqDuel' // Check duel for win loss if no match for Invade
				};
					
	battle.ConqDuel = {invade:		false,  // Undefined items filled in by battle.Duel in battle.init()
					points:		'conqDuelPoints',
					general: 	'DuelGeneral',
					lost:		'duelLost',
					won:		'duelWon',
					linkF: function(bR) {
						return 'conquest_duel.php?target_id=' + bR.userId +'&action=battle&duel=true';
					},
					winLossRegex: /([\+\-\d]+) Conquest Rank Pts .* ([\+\-\d]+) Guild Coins/i,
					regexVars: ['points', 'wl'],
					winLossF: function(r) {
						r.att = stats.bonus.api;
						r.wl = r.wl === 0 ? 'lost' : 'won';
						r.name = caap.resultsText.regext(/[\+\-\d]+ Health (.*) [\+\-\d]+ Conquest Rank Pts/i);
					},
					other: 'None'
				};
					
	// List of battle rank names
	battle.ranks = {
		rank: ['Acolyte', 'Scout', 'Soldier', 'Elite Soldier', 'Squire', 'Knight', 'First Knight', 'Legionnaire', 'Centurion', 'Champion', 'Lieutenant Commander', 'Commander', 'High Commander', 
		'Lieutenant General', 'General', 'High General', 'Baron', 'Earl', 'Duke', 'Prince', 'King', 'High King'],
		festRank: ['Newcomer', 'Initiate', 'Vandal', 'Savage', 'Brigand', 'Enforcer', 'Fighter', 'Protector', 'Defender', 'Guardian', 'Slaughterer', 'Killer', 'Slayer',  'Avenger', 'Rechoner', 'Eradicator', 'Champion', 'Archon', 'Master'],
		warRank: ['No Rank', 'Reserve', 'Footman', 'Corporal', 'Lieutenant', 'Captain', 'First Captain', 'Blackguard', 'Warguard', 'Master Warguard', 'Lieutenant Colonel', 'Colonel', 'First Colonel', 'Lieutenant Warchief', 'Warchief', 'High Warchief'],
		conqRank: ['No Rank', 'Scout', 'Soldier', 'Elite Soldier', 'Squire', 'Knight', 'First Knight', 'Legionnaire', 'Centurion',
			'Champion', 'Lt Commander', 'Commander', 'High Commander', 'Lieutenant General', 'General', 'High General', 'Baron', 'Earl', 'Duke']
	};

	// Calculate the number of points I would win against someone given our ranks
	battle.pointF = function(pointList, d) {
		return pointList[d + pointList.indexOf(10)];
	};
	
	// Calculate an opponents rank based on the number of points I won in a battle
	battle.rankF = function(pointList, hisRank, myRank, p) {
		if (!pointList.hasIndexOf(p)) {
			return hisRank;
		}
		return Math.min(myRank - pointList.indexOf(10) + pointList.lastIndexOf(p), 
			Math.max(myRank + pointList.indexOf(p) - pointList.indexOf(10), hisRank));
	};
	
	// Calculate an a score based on level, army size, and previous experience for a battle record to pick the best target
	battle.scoring = function(r, which) {
		var w = battle[which],
			defBonus = which == 'War' ? 'War' : w.invade ? r.army / stats.army.capped : 1; 
			
		return battle.winChance(r, stats.bonus.api, defBonus) * battle.pointF(w.pointList, r[w.rank] - stats.rank[w.myRank]); 
	};
	
	// Calculate min or max Rank to fight based on config menu setting
	battle.minMaxRankF = function(w, minMax) {
		var conf = $u.setContent(config.getItem(w.rank, ''), minMax.match(/max/i) ? '1000' : '0');	
		return conf.match(/[\+\-]/) ? stats.rank[w.myRank] + conf : conf;
	};
	
	battle.init = function() {
		try {
			var arr = [],
				foughtRecently,
				num = battle.records.length,
				newbie;
				
			battle.Invade.page = stats.level < 10 ? 'battle_train' : 'battle'; // Need to check this works
			
			battle.Duel = $j.extend({}, battle.Invade, battle.Duel);
			battle.War = $j.extend({}, battle.Invade, battle.War);
			battle.Festival = $j.extend({}, battle.Duel, battle.Festival);
			battle.ConqDuel = $j.extend({}, battle.ConqInvade, battle.ConqDuel);

			battle.records = battle.records.filter( function(r) {
				foughtRecently = !schedule.since(r.wonTime, 4 * 7 * 24 * 3600) || !schedule.since(r.lostTime,  4 * 7 * 24 * 3600);
				newbie = !schedule.since(r.deadTime, 24 * 3600);
				if (foughtRecently || newbie) {
					return true;
				}
				arr.push(r.name);
			});
			if (arr.length) {
				con.warn('Battle: Deleted ' + (num - battle.records.length) + ' old records', arr);
				state.setItem('wsave_battle', true);
			}
        } catch (err) {
            con.error("ERROR in battle.init: " + err.stack);
            return false;
        }
    };

    battle.checkResults = function(page, resultsText) {
        try {
			var w = false,
				demis = [],
				minRank,
				maxRank,
				userId,
				bR;
			
			switch (page) {
			case 'festival_duel_battle' :
				w = battle.Festival;
				break;
			case 'conquest_duel' :
				w = battle.ConqInvade; // See below comment for battle.Invade
				break;
			case 'battle' :
				
				w = battle.Invade;  // battle.duel is possible as well, but battle.Invade has all the commands we need on this page, and is the start of the win/loss checks
				
				// Check demi points
				demis = $u.setContent($j('#app_body div[style*="battle_top.jpg"]').text().trim().innerTrim(), '').regex(/(\d+) \/ (\d+)/g);
				if ($u.hasContent(demis) && demis.length == 5) {
					['ambrosia', 'malekus', 'corvintheus', 'aurora', 'azeron'].forEach(function (d) {
						caap.demi[d].daily = caap.getStatusNumbers(demis.shift().join('/'));
					});
					caap.SaveDemi();
				} else {
					con.warn('Unable to read daily demi points', demis);
				}

				break;
			default :
				break;
			}


			if (!w) {
				return;
			}
			
			schedule.setItem(w.delay, 5 * 60);
			battle.readWinLoss(resultsText, w);
			
			minRank = battle.minMaxRankF(w, 'min');
			maxRank = battle.minMaxRankF(w, 'max');

			$j('#app_body div[style*="' + w.mid + '"]').each( function() {
				userId = $j("input[name='target_id']", this).attr('value');
				if (!userId) {
					con.warn('Battle: unable to find user ID', this);
					return;
				}
				bR = battle.getRecord(userId);
				caap.bulkRegex(this, w.regex, bR, w.stats);
				w.checkF(bR, this);
				
				if (bR.newRecord) {
					if (bR[w.rank] <= maxRank && bR[w.rank] >= minRank) {
						window[w.recon].setRecord(bR);
						state.setItem('wsave_' + w.recon + '_noWarning', true);
					}
				} else {
					battle.setRecord(bR);
				}
			});

		} catch (err) {
            con.error("ERROR in battle.checkResults: " + err.stack);
            return false;
        }
    };

	worker.addAction({fName : 'battle.monsterWait', priority : 190, description : 'Battling Players'});
	
	// Called with lower priority than battle.worker to let Finder find monsters. If no monsters, then battles.
    battle.monsterWait = function() {
        return battle.worker('monsterWait');
	};
	
	worker.addAction({worker : 'battle', priority : 700, description : 'Battling Players'});
	
    battle.worker = function(monsterWait) {
        try {
            var which = config.getItem('battleWhich', 'Invade'),
				w = battle[which],
				whenBattle = config.getItem(w.when, 'Never'),
                target = '',
	            staminaReq = 0,
				duelInvade = ['Invade', 'Duel'].hasIndexOf(which),
                whenMonster = config.getItem('WhenMonster', 'Never'),
                type = duelInvade ? config.getItem('TargetType', 'Invade') : 'Freshmeat',
	            targetMonster = state.getItem('targetFrombattle_monster', ''),
                monsterObject = $u.hasContent(targetMonster) ? monster.getRecord(targetMonster) : {},
				battleOrOverride = 'Battle';

            /*-------------------------------------------------------------------------------------\
			Check ready to battle and what type of battle
			\-------------------------------------------------------------------------------------*/

			switch (whenBattle) {
			case 'Never':
				return {action: false, mess: ''};
			case 'Stay Hidden':
				if (!caap.needToHide() && config.getItem('delayStayHidden', true) === true) {
					return {action: false, mess: 'No need to hide'};
				}
				break;
			case 'Only Demipoints or Zin/Misa':
				if (!battle.demisPointsToDo('left') && !general.ZinMisaCheck(w.general)) {
					return {action: false, mess: 'Demipoints and Zin/Misa done'};
				}
				break;
			default:
				break;
			}
			
			// What kind of battle?
			if (battle.demisPointsToDo('left') || general.ZinMisaCheck(w.general)) {
				battleOrOverride = 'battleOverride';
				caap.setDivContent('battle_mess', 'Battle: Doing ' + (battle.demisPointsToDo('left') ? 'Demi Points' : 'Zin or Misa'));
				if (which == 'War') {
					which = config.getItem('zinDemiType', 'Invade');
					w = battle[which];
				} 
				
			} else if (config.getItem('battleMonsterWait', false)) {
				if (!monsterWait) {
					return false;
				}
				if (whenMonster !== 'Never' && monsterObject && !/the deathrune siege/i.test(monsterObject.name)) {
					return {action: false, mess: 'Waiting for monster'};
				}
			}

            if (stats.level < w.minLevel) {
                return {action: false, mess: 'Locked until level ' + w.minLevel};
            }

            staminaReq = which == 'War' ? 10 : target === 'raid' ? state.getItem('RaidStaminaReq', 1) : 1;

            if (!caap.checkStamina(battleOrOverride, staminaReq)) {
                return {action: false, mess: 'Need ' + staminaReq + ' stamina for ' + which};
            }
			
			return battle.common(which, type);
				
        } catch (err) {
            con.error("ERROR in battle.worker: " + err);
            return false;
        }
	};

	battle.common = function(which, type) {
        try {
            var w = battle[which],
				tempTxt,
				result,
				targets = [],
				targetRaid,
				arenaTokens = 0, // Need to move this out of here eventually
				gen,
				conqLevel = which.hasIndexOf('Conq') ? config.getItem('conquestLevels', 'Any').numberOnly() : 'Any',
				battleReconTimer = schedule.getItem("battleRecon"),
				rejoinSecs = !$u.isDefined(battleReconTimer) ? 0 : ((battleReconTimer.next - Date.now()) / 1000).dp() + ' secs',
                bR = {}, // Battle Record
                targetMonster = state.getItem('targetFrombattle_monster', ''),
                monsterObject = $u.hasContent(targetMonster) ? monster.getRecord(targetMonster) : {},
				idList = $u.hasContent(w.idList) ? config.getList(w.idList, []) : [],
				randomNum = Math.random() * 100,
				minRank = battle.minMaxRankF(w, 'min'),
				maxRank = battle.minMaxRankF(w, 'max'),
				valid,
				demisLeft = battle.demisPointsToDo('left');

			switch (type) {
			case 'Freshmeat' :
				
			/*-------------------------------------------------------------------------------------\
				FRESHMEAT List targets, score, and hit best
			\-------------------------------------------------------------------------------------*/

				targets = battle.records.filter( function(r) {
					// Check timers/valid
					return schedule.since(r[w.dead], 10 * 60) && schedule.since(r[w.chained], 0) && r[w.valid];
				});
				
				targets = targets.concat(recon.records);
				
				targets = targets.filter( function(r) {
					return r[w.rank] >= minRank && r[w.rank] <= maxRank && (!w.demis || !demisLeft || battle.demisPointsToDo(r.deity)) &&
						(!w.invade || r.army > 0) && (conqLevel == 'Any' || r.level >= Number(conqLevel));
				});
				
				targets.forEach( function(r) {
					r.score = battle.scoring(r, which);
				});
				
				if (!targets.length) {
					if (schedule.since(w.delay, 5 * 60)) { 
						caap.ajaxLink(w.page);
						return {mlog: 'Looking for ' + type + ' targets on ' + w.page};
					}
					return {action: false, mess: 'Recon for targets in ' + rejoinSecs};
				}
				
				bR = targets.sort($u.sortBy(false, 'score')).pop();
				state.setItem('wsave_battle_noWarning', true);
				break;
				
			case 'User ID List' :

			/*-------------------------------------------------------------------------------------\
				USER ID LIST
			\-------------------------------------------------------------------------------------*/

				if (idList.length && session.getItem(w.target, '') !== 'none') {
					idList.some( function(hs) { // hitString
						hs = (session.getItem(w.target, '') || hs).trim();
						var randomNg =  session.getItem(w.target, '') ? false : randomNum > (hs.regex(/:(\d+)%/) || 100);
						bR = battle.getItem(hs.regex(/^(\d+)/));
						tempTxt = hs.regex(/@([\w ]+)/);
						valid = !bR[w.valid] && schedule.since(bR[w.deadTime], 3 * 60);
						if (!bR || !valid(bR) || randomNg || (tempTxt && !general.getStat(tempTxt, 'name')) ||
							(!config.getItem("IgnoreBattleLoss", false) && bR[which.toLowerCase() + 'lost'])) {
							if (which == 'arena' && bR && !schedule.since(bR.arenaDeadTime, 3 * 60) && hs.match(/:stalk/i)) {
								con.log(1, "Full spend target " + bR.name + " not dead, just sleeping", hs, bR);
								session.setItem('arenaWait', true);
							} else {
								con.warn('Passing on hitting ' + hs, !valid(bR), randomNg, tempTxt);
							}
							randomNum -= hs.regex(/:(\d+)%/) || 100;
							session.setItem(w.target, '');
							bR = false;
							return false;
						}
						session.setItem(w.target, hs);
						gen = tempTxt || gen;
						return true;
					});
					if (bR) {
						con.log(2, 'Using user id list target', gen);
						break;
					} 
					if (session.getItem('arenaWait', false)) {
						if (arenaTokens < 9) {
							schedule.setItem('arenaTimer', 3 * 60);
							return false;
						}
					} else {
						session.setItem(w.target, 'none');
					}
				}
				if (idList.match(/raid/i)) {
					return battle.common(which, 'Raid');
				} 
				if (idList.match(/freshmeat/i)) {
					return battle.common(which, 'Freshmeat');
				}
				return {action: false, mess: 'No valid target on id list'};
				
			case 'Raid' :
			/*-------------------------------------------------------------------------------------\
				RAID code
			\-------------------------------------------------------------------------------------*/

				targetRaid = state.getItem('targetFromraid', '');
				if (!targetRaid) {
					return {action: false, mess: 'No Raid To Attack'};
				}

				if (!schedule.check("battleRecon")) {
					return {action: false, mess: 'Joining Raid in ' + rejoinSecs};
				}

				if (general.Select(w.general) || caap.ajaxLink("raid.php")) {
					return {mlog: 'Joining the Raid'};
				}

				if (config.getItem('clearCompleteRaids', false) && $u.hasContent(monster.completeButton.raid.button) && $u.hasContent(monster.completeButton.raid.md5)) {
					caap.click(monster.completeButton.raid.button);
					monster.deleteItem(monster.completeButton.raid.md5);
					monster.completeButton.raid = {
						md5: undefined,
						name: undefined,
						button: undefined
					};

					caap.updateDashboard(true);
					return {mlog: 'Cleared a completed raid'};
				}

				monsterObject = monster.getRecord(targetRaid);
				
				if (caap.navigate2('ajax:' + monsterObject.link)) {
					return {mlog: 'Joining the Raid'};
				}

				if (!$u.hasContent($j("#app_body div[style*='dragon_title_owner']"))) {
					if (caap.ifClick(monster.engageButtons[monsterObject.md5])) {
						return {mlog: 'Attacking ' + monsterObject.name};
					}
				}
				return {action: false, mwarn: 'Unable to engage raid ' + monsterObject.name};

				// The user can specify 'raid' in their Userid List to get us here. In that case we need to adjust NextBattleTarget when we are done
				
			default :
				return {action: false, mwarn: 'Battle: invalid setting for Target Type: ' + config.getItem('targetType', 'Freshmeat')};
            }

			result = caap.navigate3(w.page, w.linkF(bR), w.general);
			if (caap.navigate3(w.page, w.linkF(bR), w.general)) {
				if (result == 'done') {
					battle.bR = bR;
				}
				return {mlog: which.ucWords() + 'ing rank ' + bR[w.rank] + ' level ' + bR.level + ' ' + bR.name +
					(w.invade ? ' with ' + bR.army + ' army' : '') };
			}
			return {action: false, mwarn: 'Unable to find link ' + w.linkF(bR.userId) + ' on page ' + w.page};
		
        } catch (err) {
            con.error("ERROR in battle.worker: " + err);
            return false;
        }
    };

	worker.addPageCheck({page : 'battle', hours : 7, level : 9, func: 'battle.demiPoints'});		

	// Do I need to check if I still have demipoints to do for the day?
    battle.demiPoints = function () {
		return battle.demisPointsToDo('set');
	};

	// Check win/loss of battle
    battle.readWinLoss = function(resultsText, w) {
        try {
			if (!battle.bR && !$u.hasContent(resultsText)) {
				return false;
			}
			
            var lastbR = $u.setContent(battle.bR, {}),
				lastBattleID = $u.setContent(lastbR.userId, state.getItem("lastBattleID", false)),
				resultsDiv = lastBattleID ? $j() : $j("#app_body #results_main_wrapper"),
				userId = $u.setContent(lastBattleID, $j(resultsDiv).find("input[name='target_id']").first().attr('value'), 
					$u.setContent($j(resultsDiv).find("a[href*='keep.php?casuser=']").first().attr('href'), '').regex(/user=(\d+)/i)),
				str = '',
                bR = {}, // Battle Record
                r = {}, // Holds the results of the win/loss check, like wl for win or loss, opponent name, points won, etc.
				maxChain = 1000000;

			
			battle.bR = {};
			state.setItem("lastBattleID", '');
			
			if (!userId) {
				return false;
			}
			
			bR = $u.hasContent(lastbR) ? $j.extend({}, new battle.record(lastbR.userId).data, lastbR) :	battle.getRecord(userId);
			
			// Loop through the possible regexs for invade, duel, etc possible on this page, and fill r with the win/loss results
			do {
				if (caap.bulkRegex(resultsText, w.winLossRegex, r, w.regexVars, w.other != 'None')) {
					w.winLossF(r);
				} else {
					w = w.other != 'None' ? battle[w.other] : w;
				}
			} while (!$u.hasContent(r) && w.other != 'None');
			
			
			if (!r.wl) {
				if (w.points == 'gbPoints') {
					con.log(2, 'Unable to parse win/loss for user id ' + userId + ' from ' + caap.page, resultsText, w);
					return false;
				}
				bR.hiding = $u.setContent(bR.hiding, 0) + 1;
				if (bR[w.chainCount] > 0) {
					bR[w.chained] =  Date.now() + Math.random() * 7 * 24 * 3600 * 1000;
					con.log(2, 'Chained ' + bR.name + ' ' + bR[w.chainCount] + " times and didn't see a battle result, so giving a break until " + $u.makeTime(bR[w.chained], caap.timeStr(true)));
					bR[w.chainCount] = 0;
				} else {
					bR[w.dead] = Date.now();
					con.log(2, 'Unable to parse win/loss from ' + caap.page + ', setting wait time for target ' + userId, resultsText, w);
				}
				battle.setRecord(bR);
				recon.deleteRecord(userId);
				return false;
			}
			
			bR.name = $u.setContent(bR.name, r.name);
			bR.army = $u.setContent(r.army, bR.army);
			r.userId = userId;
			bR[r.wl + 'Time'] = Date.now();
			bR[w[r.wl]] += 1;
			bR[w.points] += $u.setContent(r.points, 0);
			if ($u.hasContent(r.att)) {
				str = (r.wl == 'won' ? 'max' : 'min') + 'Def';
				bR[str] = Math[r.wl == 'won' ? 'min' : 'max'](r.att, bR[str]).dp(0);
			}
			if (bR.minDef > bR.maxDef) {
				if (str == 'maxDef') {
					bR.minDef = 0;
				} else { 
					bR.maxDef = 1000000;
				}
			}
			
			general.resetCharge();
			
            if (r.wl == 'won' && w.points != 'gbPoints') {
				maxChain = config.getItem(w.maxChain, 5);
				bR[w.chainCount] += 1;
				session.setItem('ReleaseControl', false);
				if ($u.hasContent(w) && $u.hasContent(w.pointList)) {
					bR[w.rank] = battle.rankF(w.pointList, stats.rank[w.myRank], bR[w.rank], r.points);
				}
			}
			
			if (bR[w.chainCount] >= maxChain) {
				bR[w.chained] =  Date.now() + Math.random() * 7 * 24 * 3600 * 1000;
				con.log(2, 'Chained ' + bR.name + ' the full ' + bR[w.chainCount] + " times, so giving a break until " + $u.makeTime(bR[w.chained], caap.timeStr(true)));
				bR[w.chainCount] = 0;
			} else {
				con.log(2, (r.wl == 'won' ? bR[w.chainCount] + 'th Victory' : 'Lost') + ' against ' + r.name + ' for ' + r.points + ' ' + w.points, bR);
			}

			battle.setRecord(bR);
			recon.deleteRecord(bR.userId);
        } catch (err) {
            con.error("ERROR in battle.readWinLoss: " + err.stack);
            return false;
        }
    };
	
	// Calculate the chance of winning
    battle.winChance = function(bR, att, defBonus) {
		
		if (defBonus == 'War') {
			if (bR.warLost) {
				return 0;
			}
			if (bR.warWon) {
				return 100;
			}
			defBonus = 0;
		}
			// defMod used for things like GB enrage or divine favour to increase target def
		var defMod = $u.setContent(defBonus, 0) + 1,
			// low estimate of targets effective defense. Based on BSI 0
			lowEst = $u.setContent(bR.minDef, 0) * 0.95 * defMod,
			// high estimate of targets effective defense. Based on BSI 10
			highEst = Math.min(Math.max($u.setContent(bR.level, 0) * 10, lowEst * 1.5), $u.setContent(bR.maxDef, 1000000) * 1.05) * defMod;
			// Math.max lowEst * 1.5 in highEst is used to prevent model breakage when opponents BSI > 10 causes you to think you have a 100% chance to beat someone even though you've never won at an effective Att of 10 * his level.
		if (att > highEst) {
			return 100;
		} 
		if (att < lowEst) {
			return 0;
		}
		return ((att - lowEst) / (highEst - lowEst) * 100).dp(0);
    };

	// Used by dashboard button to clear all battle records
	battle.clear = function() {
        try {
            battle.records = [];
            state.setItem('wsave_battle', true);
            session.setItem("BattleDashUpdate", true);
            return true;
        } catch (err) {
            con.error("ERROR in battle.clear: " + err.stack);
            return false;
        }
    };

	// Returns true if selected demi points not done and menu says do them first
	// If passed "set," checks for any demi points that set to work on
	// If passed "left," checks for any demi points that still need points that day
    battle.demisPointsToDo = function(demiPoint) {
        try {
            return (['set','left'].hasIndexOf(demiPoint) ? [0, 1, 2, 3, 4] : [demiPoint]).some( function(it) {
				return config.getItem('DemiPoint' + it, false) && (demiPoint == 'set' || caap.demi[caap.demiTable[it]].daily.dif > 0);
            });

        } catch (err) {
            con.error("ERROR in battle.demisPointsToDo: " + err.stack);
            return undefined;
        }
    };

    battle.menu = function() {
        try {
			var XBattleInstructions = "Start battling if stamina is above this points",
                XMinBattleInstructions = "Do not battle if stamina is below this points",
                monsterWaitInst = 'Only will battle only when there are no active monster battles and Monster Finder can not find any or if Get Demi Points First has been selected.',
                userIdInstructions = "User IDs(not user name).  Click with the " + "right mouse button on the link to the users profile & copy link." + "  Then paste it here and remove everything but the last numbers." + " (ie. 123456789)",
                maxChainInstructions = "Maximum number of chain hits after the initial attack.",
                minRankInst = "The lowest rank that you are willing to spend your stamina on. " +
					"Use +/- to indicate relative rank, e.g. -2 to attack opponents down to two ranks below your rank. " +
					"If no +/-, the number is an absolute rank, e.g. 19 would mean do not attack below rank Prince (19). " +
					"Leave blank to attack any rank. (Uses Battle Rank for invade and duel, War Rank for wars.)",
                maxRankInst = "The highest rank that you are willing to spend your stamina on. " +
					"Use +/- to indicate relative rank, e.g. +2 to attack opponents up to two ranks over your rank. " +
					"If no +/-, the number is an absolute rank, e.g. 19 would mean do not attack above rank Prince (19). " +
					"Leave blank to attack any rank. (Uses Battle Rank for invade and duel, War Rank for wars.)",
                plusonekillsInstructions = "Force +1 kill scenario if 80% or more" + " of targets are withn freshmeat settings. Note: Since Castle Age" + " choses the target, selecting this option could result in a " + "greater chance of loss.",
                raidPowerAttackInstructions = "Attack raids using the x5 button. (Not recommended).",
                raidOrderInstructions = "List of search words that decide which " + "raids to participate in first.  Use words in player name or in " +
                    "raid name. To specify max damage follow keyword with :max token " + "and specifiy max damage values. Use 'k' and 'm' suffixes for " + "thousand and million.",
                ignorebattlelossInstructions = "Ignore battle losses and attack " + "regardless.  This will also delete all battle loss records.",
                whichList = ['Invade', 'Duel', 'War', 'Festival'],
                warList = ['Invade', 'Duel'],
                whichInst = ['Battle using Invade button', 'Battle using Duel button', 'War using Duel button', 'Do Festival Duel Champion'],
                targetList = ['Freshmeat', 'User ID List', 'Raid'],
                targetInst = ['Use settings to select a target from the Battle Page', 'Select target from the supplied list of userids', 'Raid Battles'],
                collectRewardInstructions = "(EXPERIMENTAL) Automatically collect raid rewards.",
				haveZin = general.hasRecord("Zin"),
				haveMisa = general.hasRecord("Misa"),
				who = (haveZin ? 'Zin' : '') + (haveZin && haveMisa ? ' and ' : '') + (haveMisa ? 'Misa' : ''),
                battleList = ['Stamina Available', 'At Max Stamina', 'At X Stamina', 'Stay Hidden', 'Only Demipoints or Zin/Misa', 'Never'],
                battleInst = [
                    'Stamina Available will battle whenever you have enough stamina',
                    'At Max Stamina will battle when stamina is at max and will burn down all stamina when able to level up',
                    'At X Stamina you can set maximum and minimum stamina to battle',
                    'Stay Hidden uses stamina to try to keep you under 10 health so you cannot be attacked, while also attempting to maximize your stamina use for Monster attacks. YOU MUST SET MONSTER TO "STAY HIDDEN" TO USE THIS FEATURE.',
                    'Only does Demipoints' + (who ? ' or ' + who : ''),
                    'Never - disables player battles'
                ],
				subCode = '',
                htmlCode = caap.startToggle('Battling', 'BATTLE');

            htmlCode += caap.makeDropDownTR("Battle When", 'WhenBattle', battleList, battleInst, '', 'Never', false, false, 62);
            htmlCode += caap.display.start('WhenBattle', 'isnot', 'Never');

            htmlCode += caap.makeCheckTR("Use " + who + " First", 'useZinMisaFirst', false, 'If ' + who + 
					' charged and not levelling up then use battle first if space in the appropriate stat.', false, false, '', '_zin_row', who ? "display: block;" : "display: none;");

            htmlCode += "<div title='Does not work with War'>Get below Demi points first</div>";
			caap.demiQuestList.forEach( function(item, i) {
                subCode += "<span title='" + item + "'>";
                subCode += "<img alt='" + item + "' src='data:image/gif;base64," + image64[item] + "' height='15px' width='15px'/>";
                subCode += caap.makeCheckBox('DemiPoint' + i, false);
                subCode += "</span>";
            });
            htmlCode += caap.makeTD(subCode, false, false, "white-space: nowrap;");

            htmlCode += "<div id='caap_WhenBattleStayHidden_hide' style='color: red; font-weight: bold; display: ";
            htmlCode += (config.getItem('WhenBattle', 'Never') === 'Stay Hidden' && config.getItem('WhenMonster', 'Never') !== 'Stay Hidden' ? 'block' : 'none') + "'>";
            htmlCode += "Warning: Monster Not Set To 'Stay Hidden'";
            htmlCode += "</div>";

            htmlCode += caap.display.start('WhenBattle', 'is', 'At X Stamina');
            htmlCode += caap.makeNumberFormTR("Start At Or Above", 'XBattleStamina', XBattleInstructions, 1, '', '', true, false);
            htmlCode += caap.makeNumberFormTR("Stop At Or Below", 'XMinBattleStamina', XMinBattleInstructions, 0, '', '', true, false);
            htmlCode += caap.display.end('WhenBattle', 'is', 'At X Stamina');
            htmlCode += caap.makeDropDownTR("Battle Type", 'battleWhich', whichList, whichInst, '', '', false, false, 62);
			htmlCode += caap.display.start('battleWhich', 'isnot', 'Duel');
			htmlCode += caap.display.start('battleWhich', 'isnot', 'Invade');
			htmlCode += caap.makeDropDownTR("For Zin/Demi", 'zinDemiType', warList, '', '', '', false, false, 62);
			htmlCode += caap.display.end('battleWhich', 'isnot', 'Invade');
			htmlCode += caap.display.end('battleWhich', 'isnot', 'Duel');
            htmlCode += caap.makeCheckTR("Wait For Monsters", 'battleMonsterWait', false, monsterWaitInst);
			// siege is changed so disable 
			config.setItem('raidDoSiege', false);
			//htmlCode += caap.makeCheckTR("Siege Weapon Assist Raids", 'raidDoSiege', true, dosiegeInstructions);
            htmlCode += caap.makeNumberFormTR("Max Chains", 'maxChain', maxChainInstructions, 4, '', '');
            htmlCode += caap.makeTD("Attack targets that are not:");
            htmlCode += caap.makeNumberFormTR("Lower Than Rank", 'battleMinRank', minRankInst, '', '', 'text'); // Check +1 works
            htmlCode += caap.makeNumberFormTR("Higher Than Rank", 'battleMaxRank', maxRankInst, '', '', 'text'); // Check +1 works
            htmlCode += caap.makeDropDownTR("Target Type", 'TargetType', targetList, targetInst, '', '', false, false, 62);
            htmlCode += caap.display.start('TargetType', 'is', 'Raid');
            htmlCode += caap.makeCheckTR("Collect Raid Rewards", 'raidCollectReward', false, collectRewardInstructions);
            htmlCode += caap.makeCheckTR("Clear Complete Raids", 'clearCompleteRaids', false, '');
            htmlCode += caap.makeCheckTR("Power Attack", 'RaidPowerAttack', false, raidPowerAttackInstructions, true);
            htmlCode += caap.makeCheckTR("Attempt +1 Kills", 'PlusOneKills', false, plusonekillsInstructions, true);
            htmlCode += caap.makeTD("Join Raids in this order <a href='http://caaplayer.freeforums.org/attack-monsters-in-this-order-clarified-t408.html' target='_blank' style='color: blue'>(INFO)</a>");
            htmlCode += caap.makeTextBox('orderraid', raidOrderInstructions, '');
            htmlCode += caap.display.end('TargetType', 'is', 'Raid');
            htmlCode += caap.display.start('TargetType', 'is', 'Userid List');
            htmlCode += caap.makeTextBox('battleIdList', userIdInstructions, '');
            htmlCode += caap.makeCheckTR("Ignore Battle Losses", 'IgnoreBattleLoss', false, ignorebattlelossInstructions);
            htmlCode += caap.display.end('TargetType', 'is', 'Userid List');
            htmlCode += caap.display.end('WhenBattle', 'isnot', 'Never');
            htmlCode += caap.endToggle;
			config.setItem('WhenbattleOverride', 'Stamina Available');
            return htmlCode;
        } catch (err) {
            con.error("ERROR in battle.menu: " + err.stack);
            return '';
        }
    };

    battle.dashboard = function(which) {
        try {
            /*-------------------------------------------------------------------------------------\
            Next we build the HTML to be included into the 'caap_infoBattle' div. We set our
            table and then build the header row.
            \-------------------------------------------------------------------------------------*/
			
			which = which == 'Arena' ? which : 'Battle';
            if (config.getItem('DBDisplay', '') === (which + ' Stats') && session.getItem(which + "DashUpdate", true)) {
                var headers = ['UserId', 'Name', 'BR', 'WR', 'CR', 'Level', 'Army', 'Min Def', 'Max Def', 'Duel Win Chance', 'Invade', 'Duel', 'War', 'Points', '&nbsp;'],
                    values = ['userId', 'name', 'rank', 'warRank', 'conqRank', 'level', 'army', 'minDef', 'maxDef', 'wc', 'invadeWon', 'duelWon', 'warWon', 'points'],
                    pp = 0,
                    i = 0,
                    userIdLink = '',
                    userIdLinkInstructions = '',
                    len = 0,
                    len1 = 0,
                    data = {
                        text: '',
                        color: '',
                        bgcolor: '',
                        id: '',
                        title: ''
                    },
                    head = '',
                    body = '',
                    row = '',
					arenaers = [],
					winnerF = function(bR) {
						return bR.duelWon > 0 && !bR.duelLost;
					},
					report = '',
					types = ['duel', 'invade', 'war', 'conqInvade', 'conqDuel', 'gb'];

				if (which == 'Arena') {
					headers = ['UserId', 'Name', 'Points', 'Total', 'Duel', 'AR', 'Level', 'Army', '&nbsp;'];
                    values = ['userId', 'name', 'arenaPoints', 'arenaTotal', 'duelWon', 'arenaRank', 'level', 'army'];
					arenaers = battle.records.filter( function(bR) {
						return bR.arenaRank;
					});
					
					[1, 2, 3, 4, 5, 6, 7].forEach( function(rank) {
						report += 'R' + rank + ': ';
						var aRankArr = arenaers.filter( function(bR) {
								return bR.arenaRank == rank;
							}),
							winnerSum = aRankArr.filter(winnerF).length;
						report += winnerSum + '/' + aRankArr.length + ' ' + (winnerSum / aRankArr.length * 100).dp(1) + '% ';
					});
				}
				
                for (pp = 0; pp < headers.length; pp += 1) {
                    switch (headers[pp]) {
                    case 'UserId':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '16%'
                        });
                        break;
                    case 'Name':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '20%'
                        });
                        break;
                    case 'Invade':
                    case 'Duel':
                    case 'War':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '7%'
                        });
                        break;
                    case 'CR':
                    case 'BR':
                    case 'WR':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '5%'
                        });
                        break;
                    case '&nbsp;':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '1%'
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
                for (i = 0, len = battle.records.length; i < len; i += 1) {
                    row = "";
                    for (pp = 0, len1 = values.length; pp < len1; pp += 1) {
                        switch (values[pp]) {
                        case 'userId':
                            userIdLinkInstructions = "Clicking this link will take you to the user keep of " + battle.records[i][values[pp]];
                            userIdLink = "keep.php?casuser=" + battle.records[i][values[pp]];
                            data = {
                                text: '<span id="caap_battle_' + i + '" title="' + userIdLinkInstructions + '" rlink="' + userIdLink +
                                    '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + battle.records[i][values[pp]] + '</span>',
                                color: 'blue',
                                id: '',
                                title: ''
                            };

                            row += caap.makeTd(data);
                            break;
                        case 'rank':
                        case 'warRank':
                        case 'conqRank':
                            row += caap.makeTd({
                                text: battle.records[i][values[pp]] < 0 ? '' : battle.records[i][values[pp]],
                                color: '',
                                id: '',
                                title: battle.records[i][values[pp]] < 0 ? 'Unknown' : battle.ranks[values[pp]][battle.records[i][values[pp]]]
                            });
                            break;
                        case 'wc':
                            row += caap.makeTd({
                                text: battle.winChance(battle.records[i], stats.bonus.api),
                                color: '',
                                id: '',
                                title: ''
                            });
                            break;
                        case 'invadeWon':
                            row += caap.makeTd({
                                text: battle.records[i][values[pp]] + "/" + battle.records[i].invadeLost,
                                color: '',
                                id: '',
                                title: ''
                            });
                            break;
                        case 'duelWon':
                            row += caap.makeTd({
                                text: battle.records[i][values[pp]] + "/" + battle.records[i].duelLost,
                                color: '',
                                id: '',
                                title: ''
                            });
                            break;
                        case 'warWon':
                            row += caap.makeTd({
                                text: battle.records[i][values[pp]] + "/" + battle.records[i].warLost,
                                color: '',
                                id: '',
                                title: ''
                            });
                            break;
                        case 'points':
                            row += caap.makeTd({
                                text:  types.reduce( function(p, c) {
									return p + battle.records[i][c + 'Points'];
								}, 0),
                                color: '',
                                id: '',
                                title: types.map( function(e) {
									return e.ucWords() + ': ' + battle.records[i][e + 'Points'];
								}).join(', ')
                            });
                            break;
                        default:
                            row += caap.makeTd({
                                text: battle.records[i][values[pp]],
                                color: '',
                                id: '',
                                title: ''
                            });
                        }
                    }

					userIdLinkInstructions = "Clicking this link will remove " + battle.records[i].name + "'s data from CAAP.";
					data = {
						text: '<span id="caap_battle_remove_' + battle.records[i].userId + '" title="' + userIdLinkInstructions 
							+ '" userid="' + battle.records[i].userId + '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';" class="ui-icon ui-icon-circle-close">X</span>',
						color: 'blue',
						id: '',
						title: ''
					};

					row += caap.makeTd(data);

                    body += caap.makeTr(row);
                }

                $j("#caap_info" + which, caap.caapTopObject).html(
                $j(caap.makeTable(which.toLowerCase(), head, body)).dataTable({
                    "bAutoWidth": false,
                    "bFilter": false,
                    "bJQueryUI": false,
                    "bInfo": false,
                    "bLengthChange": false,
                    "bPaginate": false,
                    "bProcessing": false,
                    "bStateSave": true,
                    "bSortClasses": false,
                    "aoColumnDefs": [{
                        "bSortable": false,
                        "aTargets": [headers.length - 1]
                    }]
					}));
				$j("#caap_info" + which, caap.caapTopObject).prepend(report);
				
                $j("span[id*='caap_battle_']", caap.caapTopObject).click(function(e) {
					i = 0;
					len = 0;

                    for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                        if (e.target.attributes[i].nodeName === 'rlink') {
							caap.ajaxLink(e.target.attributes[i].nodeValue);
							return true;
                        }
                    }

                });

                $j("span[id^='caap_battle_remove_']", caap.caapTopObject).click(function(e) {
                    i = 0;
                    len = 0;
						
                    for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                        if (e.target.attributes[i].nodeName === 'userid') {
                            battle.deleteRecord(e.target.attributes[i].value);
                        }
                    }
                });

                session.setItem(which + "DashUpdate", false);
            }

            return true;
        } catch (err) {
            con.error("ERROR in battle.dashboard: " + err.stack, which);
            return false;
        }
    };

}());