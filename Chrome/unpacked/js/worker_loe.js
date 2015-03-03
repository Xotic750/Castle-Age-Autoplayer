
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
		'name' : 'Land of Earth', // Used for user facing text
		'label' : 'loe', // Used for internal naming
		'stamina' : 0,
		'enterButton' : '',
		'infoDiv' : '',
		'waitHours' : 24,
		'collectHours' : 0,
		'minHealth' : 0, 
		'basePath' : 'ajax:guildv2_conquest_expansion.php?guild_id='
	};
	
	loe.checkResults = function(page) {
        try {
			switch (page) {
			case 'guild_conquest_castle_battlelist' :
				var fR = gb.getRecord('loe'),
					guildId; 
				
				fR.paths = [];
				
				$j('img[src*="conq2_btn_attack.jpg"]').each(function() {
					guildId = $(this).closest('a').attr('href').regex(/guild_id=(\d+_\d+)/));
					con.log(2, 'At war with guild id ' + guildId, fR);
					gb.setrPage(fR, gb.makePath(fR, guildId);
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
					guild_id = $j("img[src*='conq2_castle_defender_on.jpg']").closest('a').attr('href').regex(/guild_id=(\d+_\d+)/);
				
				gb.fightResult(fR);
				
				$j('#tower_1 div[onmouseover*="hover_tab_1_"]').each( function() {
					var t = $j(this).attr('onmouseover').regex(/hover_tab_1_(\d)/);
					if ($u.hasContent($j(this).find('div[title="Officer Tagged"]') {
						gb.readTower(fR, 'enemy', guild_id + ':' + t, $j('#tower_' + t + ' div').children("div[style*='height']"));
					} else if ($u.isObject(fR.enemy.towers[guild_id + ':' + t]) { 
						con.log(1, 'LoE: No war, so deleting guild id ' + guild_id + ' tower ' + t + ' info');
						delete fR.enemy.towers[guild_id + ':' + t];
					}
				});
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
	}
	
	loe.init = function() {
		try {
			var when = config.getItem('WhenLoE', 'Never');
			if (when == 'Always' || (when == 'Blue Crystals' && loe.blueDay()) {
				worker.addPageCheck({page : 'guild_conquest_castle_battlelist', hours : 1, path: 'guild_conquest_castle,guild_conquest_castle_battlelist'});
			}
		} catch (err) {
            con.error("ERROR in loe.init: " + err.stack);
            return false;
        }
	};
	
	loe.onTop = function(gf) {
        try {
			var fR = loe.getRecord(gf.label),
				now = Date.now(),
				infoDiv = $j("#app_body #newsFeedSection div[style*='news_topcontainer.jpg']").has("img[src$='achivement_tabicons_" + gf.infoDiv + ".gif']"),
				text = infoDiv.text().trim();
			
			if (gf.name == 'Classic' && !$u.hasContent(text)) {
				fR.state = fR.state == 'Auto-match' ? 'Auto-match' : 'Start';
			} else if (text.regex(/next/i)) {
				fR.state = 'No battle';
				fR.nextTopReview = now + $u.setContent(($j(infoDiv).find('input.monsterTickerSecs').attr('value') - 4 * 60) % (6 * 3600), 0) * 1000;
				fR.startTime = $j(infoDiv).find('input.monsterTickerSecs').attr('value') ? fR.nextTopReview : 0;
			} else if (text.regex(/battle now/i)) {
				fR.state = 'Active';
			} else if (text.regex(/remaining/i)) {
				fR.state = 'Active';
				fR.nextTopReview = now + $u.setContent($j(infoDiv).find('input.monsterTickerSecs').attr('value') - 4 * 60, 0) * 1000;
			} else if (text.regex(/collect/i)) {
				fR.state = 'Collect';
				fR.nextTopReview = gf.name == 'Classic' ? fR.lastBattleTime + gf.waitHours * 3600 * 1000 : now + 3600 * 1000;
				
			} else {
				con.warn(gf.name + ' Unknown message text', text);
			}

			fR.nextTopReview = fR.nextTopReview < now ? now + 5 * 60 * 1000 : fR.nextTopReview;
			//con.log(2, gf.name + ' state ' + fR.state + ', next top page review: ' + new Date(fR.nextTopReview + 5 * 60 * 1000).toLocaleString(), fR, caap.stats.priorityGeneral, text);
			loe.setRecord(fR);
			return fR;

		} catch (err) {
			con.error("ERROR in loe.onTop: " + err.stack);
            return false;
        }
    };
	
    loe.onBattle = function(fR) {
        try {
        } catch (err) {
            con.error("ERROR in loe.onBattle: " + err.stack);
            return false;
        }
    };

	
	loe.worker = function () {
        try {
			var when = config.getItem('WhenLoE', 'Never'),
				fR = gb.getRecord('loe'),
				which = 'enemy',
				stun = 'unstunned',
				seal = fR[which].seal ? 'seal' : 'normal';
				
			if (when == 'Never' || !caap.stats.guildTokens.num || (when == 'Blue Crystals' && !loe.blueDay())) {
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
						nextReview = Math.min(nextReview, pgO.review);
					}
				}
			}
			
			$j.each(fR[which].towers, function(tower) {
				if (fR[which].towers[tower][seal][stun].score > t.score && fR[which].towers[tower][seal][stun].tokens <= fR.tokens) {
					t = fR[which].towers[tower][seal][stun];
				}
			});
			
			stateMsg = gf.name + ': ';
		
			fR.t = t;
			if (!t.score) {
				caap.setDivContent(mess, stateMsg + ' no valid target');
				con.log(2, gf.name + ': No valid target to attack', fR);
				gb.setRecord(fR);
				return false;
			}
			
			caap.setDivContent(mess, stateMsg + t.attack + ' on ' + t.team + ' T' + t.tower + ' ' + t.name);
			con.log(2,  stateMsg + t.attack + ' on ' + t.team + ' T' + t.tower + ' ' + t.name, t);
			button = 'special_action';
			result = caap.navigate2(t.general + ',' + gb.makePath(gf, t.team, t.tower) + ',clickjq:.action_panel_' + t.id + ' input[src*="' + t.attack + '.jpg"]');
			if (result == 'fail') {
				con.warn(stateMsg + t.attack + ' failed on ' + t.team + ' T' + t.tower + ' ' + t.name + ' Check ' + general.getCurrentGeneral() + ' has ' + t.attack + ', reloading page', general.getCurrentGeneral(), general.getCurrentLoadout());
				caap.setDivContent(mess, stateMsg + t.attack + ' failed on ' + t.team + ' T' + t.tower + ' ' + t.name + ' Check ' + general.getCurrentGeneral() + ' has ' + t.attack);
				gb.setRecord(fR);
				return caap.navigate2(gb.makePath(gf, t.team == 'enemy' ? 'your' : 'enemy', t.tower));
			} else if (result == 'done') {
				fR.t = false;
			}
			gb.setRecord(fR);
			return result;
			
        } catch (err) {
            con.error("ERROR in guildBattle: " + err.stack);
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
				guild_battle_scoring_inst = "List of score adjustments to pick targets",
                htmlCode = caap.makeDropDownTR("Do LoE conquest for", 'WhenLoE', whenLoElist, whenLoEinst, '', 'Never', false, false, 62);
				
            htmlCode += caap.display.start('WhenLoE', 'isnot', 'Never');
            htmlCode += caap.makeTD("Rate targets by: <a href='http://caaplayer.freeforums.org/viewtopic.php?f=9&t=830' target='_blank' style='color: blue'>(INFO)</a>");
            htmlCode += caap.makeTextBox('guild_battle_scoring', guild_battle_scoring_inst, 'cduel[],mduel[],wduel[],rduel[]', '');
            htmlCode += caap.display.end('WhenLoE', 'isnot', 'Never');
            return htmlCode;
        } catch (err) {
            con.error("ERROR in loe.menu: " + err.stack);
            return '';
        }
    };

}());
