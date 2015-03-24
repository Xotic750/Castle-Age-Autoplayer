/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,gm,
schedule,gifting,state,army, general,session,battle:true,guild_battle: true */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          LoE OBJECT
// this is the main object for dealing with Land of Earth
/////////////////////////////////////////////////////////////////////

(function() {
    "use strict";

	worker.add('loe');
	
	gb.loe = {
		name: 'Land of Earth', // Used for user facing text
		label: 'loe', // Used for internal naming
		stamina: 0,
		enterButton: '',
		infoDiv: '',
		waitHours: 24,
		collectHours: 0,
		minHealth: 0, 
		scoring : 'loeScoring',
		basePath: 'ajax:guildv2_conquest_expansion.php?guild_id='
	};
	
	loe.checkResults = function(page, resultsText) {
        try {
			switch (page) {
			case 'guild_conquest_castle_battlelist' :
				var fR = gb.getRecord('loe'),
					guild_id; 
				
				fR.paths = [];
				
				$j('img[src*="conq2_btn_attack.jpg"]').each(function() {
					guild_id = $j(this).closest('a').attr('href').regex(/guild_id=(\d+_\d+)/);
					if (!$u.isString(guild_id)) {
						con.warn('Loe guild id is undefined');
						return;
					}
					con.log(2, 'At war with guild id ' + guild_id, fR);
					gb.setrPage(fR, gb.makePath(gb['loe'], guild_id));
				});
				
				$j.each(fR.enemy.towers, function(tower) {
					if (!$u.hasContent($j('a[href*="?guild_id=' + tower.regex(/(\d):/) + '&"').find('img[src*="conq2_btn_attack.jpg"]'))) {
						con.log(1, 'LoE: War is over, so deleting battles with guild id ' + tower.regex(/(\d):/) + ' tower ' + tower.regex(/:(\d)/));
						delete fR.enemy.towers[tower];
					}
				});
				gb.setRecord(fR);
				break;
				
			case 'guildv2_conquest_expansion' :
				var fR = gb.getRecord('loe'),
					guild_id = $j("img[src*='conq2_castle_defender_on.jpg']").closest('a').attr('href').regex(/guild_id=(\d+_\d+)/),
					haveBattle = false;
				
				if (!$u.isString(guild_id)) {
					con.warn('Loe guild id is undefined');
					return;
				}
				session.setItem('gbWhich', fR.label);
				battle.readWinLoss(resultsText, gb.testList);
				
				$j('#hover_tab_1_1').closest('.tower_tab').find('div[onmouseover*="hover_tab_1_"]').each( function() {
					var t = $j(this).attr('onmouseover').regex(/hover_tab_1_(\d)/);
					if ($u.hasContent($j(this).find('div[title="Officer Tagged"]'))) {
						gb.readTower(fR, 'enemy', guild_id + ':' + t, 
							$j('#tower_' + t));
						gb.setRecord(fR);
						haveBattle = true;
					} else {
						if ($u.isObject(fR.enemy.towers[guild_id + ':' + t])) { 
							con.log(1, 'LoE: No war, so deleting guild id ' + guild_id + ' tower ' + t + ' info');
							delete fR.enemy.towers[guild_id + ':' + t];
						}
					}
				});
				if (haveBattle) {
					gb.setrPage(fR, gb.makePath(gb['loe'], guild_id), 'review', Date.now());
				} else {
					gb.deleterPage(fR, gb.makePath(gb['loe'], guild_id));
				}
				
				gb.setRecord(fR);
				break;
				
			default :
				break;
			}

		} catch (err) {
            con.error("ERROR in loe.checkResults: " + err.stack);
            return false;
        }
    };
	
	loe.blueDay = function() {
		return ['Tue', 'Wed', 'Thu'].hasIndexOf(caap.gameDay());
	};
	
	loe.init = function() {
		try {
			var when = config.getItem('WhenLoE', 'Never');
			if (when == 'Always' || (when == 'Blue Crystals' && loe.blueDay())) {
				worker.addPageCheck({page : 'guild_conquest_castle_battlelist', hours : 1, path: 'ajax:guild_conquest_castle_battlelist.php'});
			}
		} catch (err) {
            con.error("ERROR in loe.init: " + err.stack);
            return false;
        }
	};
	
	loe.unpause = function() {
		worker.deletePageCheck('guild_conquest_castle_battlelist');
		loe.init();
	};
	
 	loe.worker = function () {
        try {
			var when = config.getItem('WhenLoE', 'Never'),
				fR = gb.getRecord('loe'),
				gf = gb[fR.label], 
				which = 'enemy',
				stun = 'unstunned',
				mess = 'conquest_mess',
				stateMsg = '',
				t = {score : 0},
				n = 0,
				pgO = {},
				result = false,
				seal = fR[which].seal ? 'seal' : 'normal';
				
			if (when == 'Never' || !stats.guildTokens.num || (when == 'Blue Crystals' && !loe.blueDay())) {
				return false;
			}
			if (!fR.t.score) {
				for (var i = 0; i < fR.paths.length; i++) {
					pgO = fR.paths[i];
					if (schedule.since(pgO.review, 5 * 60)) {
						//con.log(2,'Reviewing battle page',pgO.path, fR.paths);
						caap.setDivContent(mess, gf.name + ': Reviewing lands');
						result = caap.navigate2(pgO.path);
						if (result == 'fail') {
							gb.deleterPage(fR, 'path', pgO.path);
						} else if (result) {
							gb.setRecord(fR);
							return true;
						} else {
							con.log(2, 'Loading keep page to force page reload', pgO.path, result);
							gb.setRecord(fR);
							return caap.navigateTo('keep');
						}
					}
				}
			}
			
			$j.each(fR[which].towers, function(tower) {
				if (fR[which].towers[tower][seal][stun].score > t.score) {
					t = fR[which].towers[tower][seal][stun];
				}
			});
			
			stateMsg = gf.name + ': ';
		
			fR.t = t;
			if (!t.score) {
				caap.setDivContent(mess, stateMsg + ' no valid target');
				gb.setRecord(fR);
				return false;
			}
			
			caap.setDivContent(mess, stateMsg + t.attack + ' on ' + t.team + ' T' + t.tower + ' ' + t.name);
			con.log(2,  stateMsg + t.attack + ' on ' + t.team + ' T' + t.tower + ' ' + t.name, t);
			n = t.tower.regex(/:(\d)/);
			result = caap.navigate2(t.general + ',' + gb.makePath(gf, t.team, t.tower)
				+ ',clickjq:div[onclick^="towerTabClick(' + "'" + n + "'" + ')"]:visible,jq:#tower_' 
				+ n + ':visible,clickjq:.action_panel_' + t.id + ' input[src*="' + t.attack + '.jpg"]');
			if (result == 'fail') {
				con.warn(stateMsg + t.attack + ' failed on ' + t.team + ' T' + t.tower + ' ' + t.name + ' Check ' + general.current + ' has ' + t.attack + ', reloading page', general.current, general.loadout);
				caap.setDivContent(mess, stateMsg + t.attack + ' failed on ' + t.team + ' T' + t.tower + ' ' + t.name + ' Check ' + general.current + ' has ' + t.attack);
				gb.setRecord(fR);
				return caap.navigate2('ajax:guild_conquest_castle_battlelist.php');
			} else if (result == 'done') {
				battle.setRecordVal(t.id, 'level', t.level);
				state.setItem('lastBattleID', t.id);
				fR.t = false;
			}
			gb.setRecord(fR);
			return result;
			
        } catch (err) {
            con.error("ERROR in loe.worker: " + err.stack);
            return false;
        }
    };

    loe.conquestMenu = function() {
        try {
            // Guild Battle controls
            var whenLoElist = ['Never', 'Blue Crystals', 'Always'],
                whenLoEinst = [
                    'Never - disables starting guild battles',
                    'Do LoE attacks on blue crystal days when a war is available',
                    'Always do LoE attacks',
                ],
				loeScoringInst = "List of score adjustments to pick targets",
                htmlCode = caap.makeDropDownTR("Do LoE conquest for", 'WhenLoE', whenLoElist, whenLoEinst, '', 'Never', false, false, 62);
				
            htmlCode += caap.display.start('WhenLoE', 'isnot', 'Never');
            htmlCode += caap.makeTD("Rate targets by: <a href='http://caaplayer.freeforums.org/viewtopic.php?f=9&t=830' target='_blank' style='color: blue'>(INFO)</a>");
            htmlCode += caap.makeTextBox('loeScoring', loeScoringInst, 'cduel[],mduel[],wduel[],rduel[]', '');
            htmlCode += caap.display.end('WhenLoE', 'isnot', 'Never');
            return htmlCode;
        } catch (err) {
            con.error("ERROR in loe.conquestMenu: " + err.stack);
            return '';
        }
    };

}());
