/*jslint white: true, browser: true, devel: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global $j,gb,stats,worker,$u,caap,config,con,lom,conquestLands,stats,loe,
schedule,state,general,session,battle:true */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          LoM OBJECT
// this is the main object for dealing with Land of Mist
/////////////////////////////////////////////////////////////////////

(function() {
    "use strict";

	worker.add('lom');
	
	gb.lom = {
		name: 'Land of Mist', // Used for user facing text
		label: 'lom', // Used for internal naming
		stamina: 0,
		enterButton: '',
		powers: '',
		waitHours: 24,
		collectHours: 0,
		minHealth: 200, 
		reg: /(.*?) Level: (\d+) Status: (\w+) ([\d\.]+)\/(\d+)(?: Battle Points: )?(\d+)?/g,
		scoring : 'lomScoring',
		top : { your : 'guildv2_conquest_command' },
		basePath: 'ajax:guildv2_conquest_expansion.php?slot='
	};
	
	lom.checkResults = function(page, resultsText) {
        try {
			var fR = {},
				slot = '',
				powers = [],
				pageUrl = session.getItem('clickUrl', ''),
				landCapsules = $j(),
				tmp = $j();
			
			switch (page) {
			case 'keep' : // Check for misload of land
			case 'guildv2_conquest_command' : // Land of Mist top

				// If page != url, we have a misload, and delete the tower
				if (pageUrl.hasIndexOf('guildv2_conquest_expansion')) {
					slot = $u.setContent(pageUrl.regex(/slot=(\d)/), 0) - 1;
					gb.deleteRecord('lom');
				}
				if (page == 'keep') {
					break;
				}
				landCapsules = $j("div[style*='conq2_capsule']");
				tmp = $j("#app_body #header_garrison_tab a[href*='slot=']");
				
				// Read which LoM land player in
				stats.LoMland = $u.hasContent(tmp) ? tmp.attr('href').regex(/slot=(\d+)/) - 1 : -1;
				
				if (stats.LoMland == -1 && gb.hasRecord('lom')) {
					con.log(2, 'LoM: Not in any land, so deleting records');
					gb.deleteRecord('lom');
				}
				
				// Process LoM land statuses
				landCapsules.each(function(i) {
					var currentCapsule = $j(this),
						arr = [],
						landRecord = conquestLands.getItem(i);
					
					landRecord.name = currentCapsule.children().eq(0).text().trim();
					tmp = $j("img[src*='conq2_btn']", currentCapsule)[0].src.split('/');
					landRecord.status = tmp[tmp.length - 1].match(/.+_(.+)\..+/)[1];
					if (landRecord.status == 'explore') {
						landRecord.timeLeft = 0;
						landRecord.stateTimeLeft = 0;
					} else {
						if (stats.LoMland == i) {
							if (landRecord.status == 'defend') {
								fR = gb.getRecord('lom');
								if (!fR.paths.length) {
									con.log(2, 'LoM: My LoM land now in defend! Adding page check');
									gb.setrPage(fR, gb.makePath(gb.lom, 'your', i));
									gb.setRecord(fR);
								}
							} else if (gb.hasRecord('lom')) {
								con.log(2, 'LoM: Not defending or not in it, so deleting land ' + slot + ' info');
								gb.deleteRecord('lom');
							}
						}
							
						try{
							arr = currentCapsule.text().trim().regex(/(\d+) HR/gi);
							landRecord.timeLeft = arr.length ? arr.pop() : 999999;
							landRecord.phaseLeft = arr.length ? arr.pop() : 999999;
							landRecord.defenders = $j("div[onmouseout*='defenderc_text_']", currentCapsule).parent().text().regex(/(\d+)/);
						} catch (err) {
							con.error("ERROR in landRecord.timeLeft: " + err.stack);
							landRecord.timeLeft = 999999;
						}	
					}
					landRecord.index = i;
					conquestLands.records[i] = landRecord;
				});
				conquestLands.records.splice(landCapsules.length, conquestLands.records.length - landCapsules.length);
				con.log(3, 'Conquest Lands Records', conquestLands.records);
				conquestLands.save();
				break;
				
			case 'guildv2_conquest_expansion' : // Land of Mist or Earth tower
				
				slot = $u.setContent($j("img[src*='conq2_btn_interiordefender_on.jpg']").closest('a').attr('href'), '').regex(/slot=(\d+)/);
				
				if (!$u.hasContent(slot)) {
					con.warn('LoM slot is undefined');
					break;
				}
				slot = slot - 1;
				if (slot != stats.LoMland) {
					break;
				}
				
				fR = gb.getRecord('lom');
				
				// Your health is too low to use a special ability, heal first
				
				if (resultsText.match(/Your health is too low to use a special ability, heal first/)) {
					con.log(2, 'LoM: Health too low, so disabling LoM guardian until next land', fR);
					fR.state = 'No Battle';
					
				} else {
					
					$j('div[id^="special_defense_button"] form input[type="image"]').each( function() {
						powers.addToList($j(this).attr('src').regex(/.*\/(\w+\.\w+)/));
					});
					
					if ($u.hasContent(powers)) {
						fR.state = 'Active';
						session.setItem('gbWhich', fR.label);
						battle.readWinLoss(resultsText, gb.winLoss);
						gb.setrPage(fR, gb.makePath(gb.lom, 'your', slot), 'review', Date.now());
						gb.readTower(fR, 'your', slot, $j('#your_guild_member_list_1'), powers);
					} else if (fR.state == 'Active') { 
					// Add a timeout here in case wasn't in last defend, script wasn't run during protect so not deleted but now defending?
						con.log(2, 'LoM: No defense actions, so ignoring land ' + slot);
						fR.state = 'No Battle';
					}
				}
				
				gb.setRecord(fR);
				break;
				
			default :
				break;
			}

		} catch (err) {
            con.error("ERROR in lom.checkResults: " + err.stack);
            return false;
        }
    };
	
    lom.conquestMenu = function() {
        try {
            // Guild Battle controls
            var priorityList = ['Guardian', 'LoE'],
                priorityInst = [
                    'Defend LoM for Guardian points when able before attacking LoE lands',
                    'Attack LoE lands when able instead of defending LoM for Guardian points'],
	            htmlCode = '';
			
            htmlCode += caap.display.start('WhenLoE', 'isnot', 'Never');
            htmlCode += caap.display.start('WhenGuardian', 'isnot', 'Never');
			htmlCode += caap.makeDropDownTR("Prioritize", 'lomPriority', priorityList, priorityInst, '', 'Blue Crystals', false, false, 62);
            htmlCode += caap.display.end('WhenGuardian', 'isnot', 'Never');
            htmlCode += caap.display.end('WhenLoE', 'isnot', 'Never');
				
            return htmlCode;
        } catch (err) {
            con.error("ERROR in lom.conquestMenu: " + err.stack);
            return '';
        }
    };

}());
