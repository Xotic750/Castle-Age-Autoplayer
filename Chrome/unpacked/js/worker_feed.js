
/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,feed:true,image64,gm,
schedule,gifting,state,army, general,session,monster:true,guild_monster */
/*jslint maxlen: 256 */

    ////////////////////////////////////////////////////////////////////
    //                          feed OBJECT
    // this is the main object for dealing with feed records
    /////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

	worker.add('feed');
	
    feed.init = function() {
		try {
			if (!config.getItem('enableMonsterFinder', false)) {
				return false;
			}
			var keeps = config.getItem('feedKeeps', ''); 
			
			worker.addPageCheck({page : 'ajax:public_monster_list.php?monster_tier=2', config: 'feedLowTier', cFreq: 'feedLowTierFreq'});
			worker.addPageCheck({page : 'ajax:public_monster_list.php?monster_tier=3', config: 'feedMediumTier', cFreq: 'feedMediumFreq'});
			worker.addPageCheck({page : 'ajax:public_monster_list.php?monster_tier=4', config: 'feedHighTier', cFreq: 'feedHighFreq'});
			worker.addPageCheck({page : 'ajax:guild_priority_mlist.php', config: 'feedGuild', cFreq: 'feedGuildFreq'});
			if (!$u.hasContent(keeps.trim())) {
				return true;
			}
			$u.setContent(keeps.regex(/(\d+:\d)/g), []).forEach( function(k) {
				worker.addPageCheck({page : 'ajax:battle_monster.php?casuser=' + k.regex(/(\d+):/) + '&mpool=' + k.regex(/:(\d)/), hours: 1, type: 'findKeep'});
			});
				
			return true;
		} catch (err) {
			con.error("ERROR in feed.deleteExpired: " + err.stack);
			return false;
		}
	};
	
	feed.checkResults = function(page) {
        try {
			var pR = {};
			switch (page) {
			case 'keep' : 
				if (!$u.hasContent($j('img[src*="keep_plus.jpg"][onclick*="Items"]:visible'))) {
					schedule.setItem('findKeep', Date.now());
					state.getItem('feedPicOwned', '').split('\n').forEach( function(p) {
						if (!$u.hasContent(p)) {
							return;
						}
						var picDiv = $j('img[src*="' + p + '"]');
						if (picDiv) {
							pR.image = picDiv.attr('src').regex(/(\w+\.\w+)$/);
							pR.name = picDiv.attr('title');
							pR.owned = picDiv.closest('div').next().text().innerTrim().trim().regex(/(\d+)/);
							town.setRecord(pR);
						}
					});
				}
				break;
							
			default :
				break;
			}
        } catch (err) {
            con.error("ERROR in town.checkResults: " + err.stack);
            return false;
        }
    };

	// Takes either user + monster name or the monster object.
	// If a match, returns the conditions. If no match, returns false.
    feed.addConditions = function(cM) {
		try {
			var monsterName = $u.isObject(cM) ? cM.name : cM,
				monsterConditions = false,
				filterList = config.getItem('feedFilter', 'all').split('\n');
				
			filterList.some( function(item) {
				var matchTerm = 
				item = item.trim().toLowerCase();
				if (!item.trim()) {
					return false;
				} else if (item.regex(/(^all\b)/) || monsterName.toLowerCase().hasIndexOf(item.match(/^[^:]+/i).toString())) {
					monsterConditions = item.replace(/^[^:]+/i, '').toString().trim();
					if ($u.isObject(cM)) {
						cM.conditions = monsterConditions + ':';
						feed.scoring(cM);
					}
					monsterConditions = monsterConditions.length ? monsterConditions + ':' : '';
				}
				return monsterConditions !== false;
			});
			return monsterConditions;
		} catch (err) {
			con.error("ERROR in feed.addConditions: " + err, monsterName);
			return false;
		}
	};
	
	worker.addAction({worker : 'feed', priority : 200, description : 'Finding Monsters'});
    feed.worker = function() {
		try {
            if (!config.getItem('enableMonsterFinder', false)) {
                return false;
            }
			var slice = $j("#app_body"),
				done = true,
				cM = {},
				tR = false,
				link = 'ajax:',
				attackButton = '',
				hasClass = function(charClass) {
					return $u.hasContent($j('#choose_class_screen .banner_' + charClass.toLowerCase() + ' input[src*="nm_class_select.gif"]', slice));
				},
				result,
				charStats = caap.stats.character,
				currentGeneralObj = general.getRecord(general.getCurrentGeneral()),
				joinable = function(cM) {
					return cM.join && cM.status == 'Join';
				},
				reviewInterval = Math.max(config.getItem('feedScan', false) ? config.getItem("feedMonsterReviewHrs", 6) : 365 * 24, 1) * 3600,
				attackReady = false;

			tR = monster.records.filter(joinable).reduce( function(previous, tarM) {
				return tarM.score > previous.score ? tarM : previous;
			}, {'score' : 0, conditions : ''});
			attackReady = tR.score && caap.stats.stamina.num > tR.listStamina[0];
			
			if (attackReady && general.Select('MonsterGeneral')) {
				return true;
			}
			
			for (var i = 0; i < monster.records.length; i += 1) { 
				cM = monster.records[i];
				//con.log(2, 'SCAN1', cM, cM.hide, cM.status, schedule.since(cM.review, reviewInterval));
				if (!cM.hide && cM.status == 'Join' && cM.conditions.length && schedule.since(cM.review, attackReady && !tR.conditions.regex(/:burn\b/) ? 5 * 60 : reviewInterval)) {
					con.log(1, 'Scanning ' + (i + 1) + '/' + monster.records.length + ' ' + cM.name, cM.link, cM);
					feed.scanRecord = cM;
					if (false && config.getItem("useAjaxMonsterFinder", true)) { // Disabling until I can figure out AJAX load - Artifice
						feed.ajaxScan(cM);
					} else {
						feed.isScan = true;
						caap.navigate2('ajax:' + cM.link);
					}
					monster.lastClick = cM.link;
					return true;
				}
				//con.log(2, 'SCAN2', cM.name, !cM , cM.conditions, cM.conditions.match(':join') , monster.worldMonsterCount < 30 , caap.stats.stamina.num > monster.parseCondition('stam', cM.conditions));
			}
			feed.isScan = false;
			feed.scanRecord = {};

			if (chores.checkPages('achievements')) {
				return true;
			}
			
			// Check on item inventory
			if (schedule.since('findKeep', 24 * 3600) && (state.getItem('feedPicOwned',false) || state.getItem('feedNameOwned',false))) {
				if (session.getItem('page','') == 'keep') {
					$j('img[src*="keep_plus.jpg"][onclick*="Items"]:visible').click();
					caap.setDomWaiting('keep.php');
					caap.clearDomWaiting();
					caap.checkResultsTop();
					return true;
				}
				return caap.navigateTo('keep');
			}

			
			
			if (attackReady) {
				link += tR.link;
				if (tR.charClass) {
					if ($j("div[id='choose_class_screen']", slice).length) {
						if ($u.hasContent(monster.characterClass[cM.charClass.ucWords()]) && hasClass(cM.charClass)) {
							result = cM.charClass;
						} else {
							result = Object.keys(charStats).filter(hasClass).reduce(function(previous, key) {
								if (charStats[key].percent < 100 && charStats[key].level + charStats[key].percent / 100 
									> charStats[previous].level + charStats[previous].percent / 100) {
									return key;
								}
								return previous;
							}, hasClass('Warlock') ? 'Warlock' : 'Cleric');
						}
						link = 'clickjq:#choose_class_screen .banner_' + result.toLowerCase() + ' input[src*="nm_class_select.gif"]';
						con.log(1, 'Joining ' + cM.name + ' with class ' + result, cM, link);
					} else {
						link += ",clickimg:battle_enter_battle.gif";
					}
				}
			
				con.log(1, 'Joining ' + cM.name, cM, link);
				result = caap.navigate2(link);
				if (result === 'fail') {
					return caap.navigate2('player_monster_list');
				} else if (result === 'done') {
					currentGeneralObj.charge = currentGeneralObj.charge == 100 ? 0 : currentGeneralObj.charge;
					monster.lastClick = tR.link;
				} else if (!result && !tR.charClass) {
					monster.powerButtons.some( function(button) {
						attackButton = caap.checkForImage(button);
						return $u.hasContent(attackButton);
					});
					if ($u.hasContent(attackButton)) {
						caap.click(attackButton);
						monster.lastClick = tR.link;
						return true;
					} else {
						con.warn('Unable to find attack button to join ' + tR.name);
					}
				}

				return result;
			}

		} catch (err) {
			con.error("ERROR in feed.scan: " + err.stack);
			return false;
		}
	};

    feed.scoring = function(cM) {
		try {
			var temp,
				life = cM.life,
				t2k = cM.t2k,
				fortify = cM.fortify,
				strength = cM.strength,
				same = monster.records.filter( function(obj) {
					return obj.monster == cM.monster && obj.status == 'Attack';
				}).length,
				sameundermax = monster.records.filter( function(obj) {
					return obj.monster == cM.monster && obj.status == 'Attack' && obj.over != 'max';
				}).length,
				undermax = monster.records.filter( function(obj) {
					return obj.status == 'Attack' && obj.over != 'max';
				}).length,
				targetpart = cM.targetPart,
				parts = cM.partsHealth,
				time = cM.time[0] + cM.time[1]/60,
				name = cM.name,
				monstername = cM.monster,
				damagemod = fortify > 0 ? 58 * fortify / 100 * (strength > 0 ? strength : 100) / 100 + 42 : 0,
				rogue = 'Rogue',
				warlock = 'Warlock',
				warrior = 'Warrior',
				mage = 'Mage',
				cleric = 'Cleric',
				ranger = 'Ranger',
				levelup = caap.inLevelUpMode(),
				energy = caap.stats.energy.num,
				atmaxenergy = caap.stats.energy.num >= caap.maxStatCheck('energy'),
				atmaxstamina = caap.stats.stamina.num >= caap.maxStatCheck('stamina'),
				stamina = caap.stats.stamina.num,
				exp = caap.stats.exp.dif,
				killed = monster.getInfo(cM.monster, 'achTitle', false),
				achnum = monster.getInfo(cM.monster, 'achNum'),
				picowned = function(pic) {
					state.setItem('feedPicOwned', state.getItem('feedPicOwned', '').split('\n').addToList(pic).join('\n'));
					return town.getRecordVal(pic, 'owned', 0);
				},
				needpic = function(pic, want) {
					return want > picowned(pic);
				},
				nameowned = function(name) {
					state.setItem('feedNameOwned', state.getItem('feedNameOwned', '').split('\n').addToList(name).join('\n'));
					return town.records.getObjByFieldLc('name', name.toLowerCase(), 'owned', 0);
				},
				needname = function(name, want) {
					return want > nameowned(name);
				},
				keep = worker.pagesList.flatten('page').hasIndexOf('ajax:' + cM.link),
				achleft = 0,
				conq = cM.lpage == "ajax:player_monster_list.php?monster_filter=2",
				achrecords = caap.stats.achievements.monster;
				
				killed = killed ? achrecords[killed] : Object.keys(achrecords).reduce(function(previous, current) {
					return previous || (current.hasIndexOf(cM.monster) && !current.regex(/'s/) ? achrecords[current] : 0);
				}, 0);
				achleft = Math.max(0, achnum - killed);

				if (cM.conditions.regex(/:j\[(.*?)\]:/)) {
					cM.score = (eval($u.setContent(cM.conditions.regex(/:s\[(.*?)\]:/), 0)) + 0).dp(2);
					temp = (cM.listStamina.length ? Math.max(cM.listStamina[0], 5) : 5);
					cM.join = eval(cM.conditions.regex(/:j\[(.*?)\]:/)) && stamina > temp;
					con.log(2, cM.name +  (cM.join ? ' Join candidate' : ' Do not join') + '. Score: ' + cM.score + ' Min stamina ' + temp, cM.conditions, cM.conditions.regex(/:s\[(.*?)\]:/), cM.conditions.regex(/:j\[(.*?)\]:/));
					cM.color = cM.join ? 'green' : $u.bestTextColor(state.getItem("StyleBackgroundLight", "#E0C961"));
					if (cM.score <=0) {
						con.log(1, 'Deleting monster ' + cM.name + ' because score of ' + cM.score + ' <= 0', cM);
						monster.deleteRecord(cM.link);
					}
				}
				if (cM.conditions.regex(/:c\[(.*?)\]:/)) {
					cM.charClass = eval($u.setContent(cM.conditions.regex(/:c\[(.*?)\]:/), 'Warlock'));
					con.log(1, 'Class to be set: ' + cM.charClass, cM.conditions.regex(/:c\[(.*?)\]:/));
				}
				
		} catch (err) {
			con.error("ERROR in feed.scoring: " + err.stack);
			return false;
		}
	};

    feed.checkDeath = function(cM) {
		try {
			var health = cM.life;

			if (!monster.damaged(cM) || cM.status == 'Done' || cM.status === 'Dead or Fled' || cM.status == 'Collect') {
				return false;
			}
			if ((feed.addConditions(cM) || '').regex(/(\bachleft\b|\bkilled\b)/)) {
				schedule.deleteItem("page_achievements");
			}
			if ((feed.addConditions(cM) || '').regex(/(\bpicowned\[|\bnameowned\[)/)) {
				schedule.deleteItem("findKeep");
			}
				
		} catch (err) {
			con.error("ERROR in feed.checkDeath: " + err.stack);
			return false;
		}
	};

    feed.dashboard = function() {
		try {
			monster.dashboardCommon('Feed');
		} catch (err) {
			con.error("ERROR in feed.dashboard: " + err.stack);
			return false;
		}
	};

    feed.menu = function() {
		try {
			var htmlCode = '',
				filterInstructions = "List of filters to decide what monsters to look for. ",
				keepInstruction = 'List of userid keeps and mpools to watch. Separate items by return or commas. ' + 
					'Format like, "100000666:3, 55000000012341234:3"',
				str = '';

			htmlCode += caap.startToggle('MonsterFinder', 'MONSTER FINDER');
			htmlCode += caap.makeCheckTR("Enable Monster Finder", 'enableMonsterFinder', false, "Find joinable monsters.");
			htmlCode += caap.display.start('enableMonsterFinder');
/*              htmlCode += caap.makeCheckTR('Do In Background', 'useAjaxMonsterFinder', true, "Check Monsters using AJAX rather than page navigation.");
			htmlCode += caap.makeCheckTR("Enable Live Feed", 'feedMonsterFinder', false, "Find monsters in the Live Feed.");
			htmlCode += caap.display.start('feedMonsterFinder');
			htmlCode += caap.makeNumberFormTR("Check every X mins", 'CheckFeedMonsterFinderMins', "Check the Live Feed every X minutes. Minimum 15.", 15, '', '', true);
			htmlCode += caap.display.end('feedMonsterFinder');
*/		
			['Low Tier', 'Medium Tier', 'High Tier', 'Guild'].forEach( function(t) {
				str = t.replace(' ', '');
				htmlCode += caap.makeCheckTR("Scan " + t, 'feed' + str, false, "Look for monsters in the " + t + " Feed.");
				htmlCode += caap.display.start('feed' + str);
				htmlCode += caap.makeNumberFormTR("Check every X mins", 'feed' + str + 'Freq', "Check the " + t + " feed every X minutes", 60, '', '', true);
				htmlCode += caap.display.end('feed' + str);
			});
			
			htmlCode += caap.makeCheckTR("Status Scan", 'feedScan', false, "Scan the feed monsters to check their status.");
			htmlCode += caap.display.start('feedScan');
			htmlCode += caap.makeNumberFormTR("Scan every X hours", 'feedMonsterReviewHrs', "Scan the feed monsters every X hours to check their status", 6, '', '', true);
			htmlCode += caap.display.end('feedScan');

			htmlCode += caap.makeTD("Filter and join monsters according to <a href='http://caaplayer.freeforums.org/auto-join-and-monster-finder-configs-t839.html' target='_blank' style='color: blue'>(INFO)</a>");
			htmlCode += caap.makeTextBox('feedFilter', filterInstructions, 'all');

			htmlCode += caap.makeTD("Keep Watch");
			htmlCode += caap.makeTextBox('feedKeeps', keepInstruction, '');

			htmlCode += caap.display.end('enableMonsterFinder');
			htmlCode += caap.endToggle;
			return htmlCode;
		} catch (err) {
			con.error("ERROR in feed.menu: " + err.stack);
			return '';
		}
	};

}());
