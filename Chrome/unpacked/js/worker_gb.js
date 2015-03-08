
/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,gm,
schedule,gifting,state,army, general,session,battle:true,guild_battle: true */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          guild_battle OBJECT
// this is the main object for dealing with guild battles
/////////////////////////////////////////////////////////////////////

(function() {
    "use strict";

	worker.add({ name: 'gb', recordIndex: 'label', recordsAreObj: true});

	worker.addAction({worker : 'gb', priority : 1600, description : 'Guild Battle'});
		
    gb.record = function(label) {
        this.data = {
            label: label,
            guildId: '',
			att : 0,
            ticker: '',
			collectedTime: 0,
			lastBattleTime: 0,
			startTime: 0,
			endTime: 0,
			state: 'Active',
			seal: '0',
			easy: false,
			simtis: false, // someone in my tower is stunned
			firstScanDone: false,
			burn: false,
			t: { score: 0,
				tokens: 1 },
			tokens: 10,
			paths: [],
			nextTopReview: 0,
			me: {},
            enemy: {
				health : 0,
				towers : {},
				members : {},
				attacks : []},
            your: {
				health : 0,
				towers : {},
				members : {},
				attacks : []},
            color: $u.bestTextColor(config.getItem("StyleBackgroundLight", "#E0C961"))
        };
    };

    gb.member = function() {
        this.data = {
            'tower': 0,
            'position': 0,
            'target_id': 0,
            'name': '',
            'level': 0,
            'mclass': '',
            'healthNum': 0,
            'healthMax': 0,
            'status': '',
            'percent': 0,
			'battlePoints' : 0,
			'points' : 0,
			'scores' : {},
			'metrics' : {}
        };
    };

	gb.towerRecord = function () {
		this.data = {
			'players' : 0,
			'clerics' : 0,
			'actives' : 0,
			'AC' : 0,
			'seal' : {
				'stunned' : {
					'score' : 0
				},
				'unstunned' : {
					'score' : 0
				}
			},
			'normal' : {
				'stunned' : {
					'score' : 0
				},
				'unstunned' : {
					'score' : 0
				}
			},
			'healthNum' : 0,
			'healthMax' : 0,
			'damage' : 0,
			'life' : 0
		};
	};
	
    gb.wlRecord = function() {
        this.data = {
            'name': '',
            'duel': {
				'wins' : 0,
				'losses' : 0
			},
            'poly': {
				'wins' : 0,
				'losses' : 0
			},
            'confuse': {
				'wins' : 0,
				'losses' : 0
			},
            'heal': {
				'wins' : 0,
				'losses' : 0
			},
            'guild': '',
            'guildID': '',
            'level': 0,
            'health': 0,
			'class' : ''
        };
    };

    gb.me = function() {
        this.data = {
            'name': '',
            'level': 0,
            'mclass': '',
            'healthNum': 0,
            'healthMax': 0,
            'status': '',
            'percent': 0
        };
    };

	gb.gb100 = {
		'name' : '100v100', // Used for user facing text
		'label' : 'gb100', // Used for internal naming 'guild_battle_scoring'
		'stamina' : 20,
		'enterButton' : 'guild_enter_battle_button2.gif',
		'infoDiv' : 'fest_guild_battle',
		'waitHours' : 3.9,
		'collectHours' : 1.5,
		'minHealth' : 200,
		scoring : 'guild_battle_scoring',
		'basePath' : 'tenxten_gb_formation,hundred_battle,clickimg:sort_btn_joinbattle.gif,hundred_battle_view'
	};
		
	gb.gbClassic = {
		'name' : 'Classic',
		'label' : 'gbClassic',
		'stamina' : 20,
		'enterButton' : 'guild_enter_battle_button2.gif',
		'infoDiv' : 'guild_achievement',
		'waitHours' : 8.9,
		'collectHours' : 8.9,
		'minHealth' : 1,
		scoring : 'guild_battle_scoring',
		'basePath' : 'tenxten_gb_formation,guildv2_battle,clickimg:sort_btn_joinbattle.gif,guild_battle'
	};
		
	gb.gb10 = {
		'name' : '10v10',
		'label' : 'gb10',
		'stamina' : 10,
		'enterButton' : 'guild_enter_battle_button3.gif',
		'infoDiv' : 'guild_10v10',
		'waitHours' : 3.9,
		'collectHours' : 1.5,
		'minHealth' : 200,
		scoring : 'guild_battle_scoring',
		'basePath' : 'tenxten_gb_formation,clickjq:.team_content:visible input[src*="fb_guild_btn_joinbattle_small.gif"],ten_battle'
	};
	
	gb.enemy = {
		'mage' : [
			{'name': 'mduel',
			'base' : 'duel',
			'image' : 'attack'},
			{'name': 'fireball',
			'tokens' : 2,
			'base' : 'duel',
			'image' : 'fireball'},
			{'name': 'enrage',
			'tokens' : 2,
			'base' : 'duel',
			'image' : 'enrage'},
			{'name': 'poly',
			'base' : 'poly',
			'image' : 'polymoprh'},
			{'name': 'confuse',
			'base' : 'confuse'}
		],
		'rogue' : [
			{'name': 'rduel',
			'base' : 'duel',
			'image' : 'attack'},
			{'name': 'intimidate',
			'tokens' : 2,
			'base' : 'duel'},
			{'name': 'poison', 
			'base' : 'duel'}
		],
		'warrior' : [
			{'name': 'wduel',
			'base' : 'duel',
			'image' : 'attack'},
			{'name': 'whirlwind',
			'base' : 'duel'}
		],
		'cleric' : [
			{'name': 'cduel',
			'base' : 'duel',
			'image' : 'attack'},
			{'name' : 'divine_favor',
			'tokens' : 2,
			'base' : 'duel'}

		]
	};

	gb.your = {
		'mage' : [],
		'rogue' : [
			{'name': 'smokebomb',
			'self': false,
			'base' : 'level',
			image : 'rogue_smoke'}
		],
		warrior: [
			{name: 'guardian',
			self: false,
			base: 'level'},
			{name: 'sentinel',
			base: 'level'}
		],
		cleric: [
			{name: 'revive',
			base: 'rhealth'},
			{name: 'heal',
			base: 'damage',
			image: 'cleric_heal'},
			{name: 'mass_heal',
			tokens: 2,
			base: 'damage'},
			{name: 'fortify',
			base: 'level'},
			{name: 'cleanse',
			base: 'level'},
			{name: 'dispel',
			base: 'level'}
		]
	};

    gb.checkResults = function(page) {
        try {
			var fR = false;

			switch (page) {
			case 'guildv2_battle' :
			case 'guild_battle' :
				fR = gb.getRecord('gbClassic');
				break;
			case 'tenxten_gb_formation' :
			case 'ten_battle' :
				fR = gb.getRecord('gb10');
				break;
			case 'hundred_battle' :
			case 'hundred_battle_view' :
				fR = gb.getRecord('gb100');
				break;
			default :
				break;
			}

			switch (page) {
			case 'index' :
				schedule.setItem("page_index", 1 * 3600);
				gb.setRecord(gb.onTop(gb.gb10));
				gb.setRecord(gb.onTop(gb.gb100));
				gb.setRecord(gb.onTop(gb.gbClassic));
				break;
			
			case 'guildv2_battle' :
				caap.checkMyGuildIds();
				var text = $u.setContent($j('#app_body #guildv2_battle_middle').text().trim().innerTrim(), '');
				
				if (text.indexOf('submit the Guild for Auto-Matching') >= 0) {
					fR.state = 'Start';	
				} else if (text.indexOf('Time Remaining') >= 0) {
					fR.state = 'Active';
				} else if (text.indexOf('Auto-Match in Progress') >= 0) {
					fR.state = 'Auto-match';
				} else if (text.indexOf('JOIN NOW!') >= 0) {
					fR.state = 'Collect';
				} else {
					con.warn('Unrecognized GB status message: ' + text);
				}
				gb.setrPage(fR, gb.gbClassic.basePath, 'review', Date.now() - 2.5 * 60 * 1000);
				fR.nextTopReview = Date.now();
				break;
				
			case 'guild_battle' :
			case 'hundred_battle_view' :
			case 'ten_battle' :
				fR = gb.onBattle(fR);
				break;
				
			case 'tenxten_gb_formation' :
				if (!caap.hasImage('fb_guild_btn_joinbattle_small.gif', $j('.team_content:visible')) && (fR.state == 'Active' || fR.state == 'Collect')) {
					fR.state = 'No battle';
				}
				break;
				
			case 'hundred_battle' :
				if (!caap.hasImage('sort_btn_joinbattle.gif') && (fR.state == 'Active' || fR.state == 'Collect')) {
					fR.state = 'No battle';
				}
				break;
				
			default :
				break;
			}
			if (fR) {
				session.setItem("gbClassicDashUpdate", true);
				session.setItem("gb10DashUpdate", true);
				session.setItem("gb100DashUpdate", true);
				gb.setRecord(fR);
			}
			
       } catch (err) {
            con.error("ERROR in gb.checkResults: " + err.stack);
            return false;
        }
    };
	
	gb.init = function() {
		try {
			if (!gb.getRecord('winLoss').newRecord) {
				gb.deleteRecord('winLoss');
			}
			session.setItem("gbClassicDashUpdate", true);
			session.setItem("gb10DashUpdate", true);
			session.setItem("gb100DashUpdate", true);
			
			gb.testList = [
				{	method : 'duel',
					type : 'gb',
					check : new RegExp('(POLYMORPH|CONFUSE)? ?(VICTORY|DEFEAT)?\\! .*' + caap.stats.PlayerName + " (.*) Battle Results:"),
					vars : ['action', 'wl', 'name'],
					func : function(r) {
						var str = caap.resultsText.replace(r.name, '').replace(caap.stats.PlayerName, ''),
							tStr = '';
							
						r.points = str.regex(/\+(\d+) Battle Activity Points/);
						if (str.regex(/(Your target is freed from polymorph!)/i) || str.regex(/(yourself)/i)) {
							return;
						} else if ($u.hasContent(r.wl)) {
							var fR = gb.getRecord(session.getItem('gbWhich','gb100'));
							tStr = str.regex(/Defense increased by (\d+)% from Divine Favor/);
							if (tStr) {
								fR.att = (caap.stats.attack + caap.stats.bonus.attack + (caap.stats.defense + caap.stats.bonus.defense) * 0.7 * (tStr.numberOnly() / 100 + 1)).dp(0);
							} else {
								tStr = str.regex(/Attack increased by (\d+)% from Enrage/);
								if (tStr) {
									fR.att = ((caap.stats.attack + caap.stats.bonus.attack) * (tStr.numberOnly() / 100 + 1) + (caap.stats.defense + caap.stats.bonus.defense) * 0.7).dp(0);
								}
							}
								
							r.wl = r.wl == 'VICTORY' ? 'won' : 'lost';
							r.att = (fR.att > 0 ? fR.att : caap.stats.bonus.api) * (r.action == 'CONFUSE' ? 1.5 : 1) * (r.action == 'POLYMORPH' ? 1.25 : 1);
							gb.setRecord(fR);
						} else {
							r.wl = ($u.hasContent($j("#globalContainer #results_main_wrapper").find('div[style*="color:#ffdb59"]'))) ? 'won' : 'lost';
							r.att = gb.getRecordVal(session.getItem('gbWhich','gb100'), 'att', caap.stats.bonus.api);
						}
					}
				}
			];

			
			
       } catch (err) {
            con.error("ERROR in gb.init: " + err.stack);
            return false;
        }
	};

	gb.onTop = function(gf) {
        try {
			var fR = gb.getRecord(gf.label),
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
			gb.setRecord(fR);
			return fR;

		} catch (err) {
			con.error("ERROR in gb.onTop: " + err.stack);
            return false;
        }
    };
	
    gb.onBattle = function(fR) {
        try {
            var gate = $j(),
				args = [],
				general = '',
				gf = gb[fR.label], 
                tempDiv = $j(),
				tower = 0,
				which = '',
                classRegEx = new RegExp("guild_battle_container (\\w*)"),
				healthDiv = $j(),
				myStatsTxt = '',
				index = 0,
				tStr = '',
				pics = [],
				bR = {},
				towerPops = [],
				towerTypes = [],
				sealedTowers = 0,
				notStarted = '',
				wl = false,
				battleOver = '',
				now = Date.now();

			gb.setrPage(fR, gf.basePath, 'review', now);
            caap.chatLink("#app_body #guild_war_chat_log div[style*='border-bottom: 1px'] div[style*='font-size: 15px']");
            tempDiv = $j("#globalContainer #guild_battle_banner_section");
			myStatsTxt = $u.setContent(tempDiv.text().trim().innerTrim(), '');
			//con.log(2,'Do I have Shout? ' + fR.me.shout);
			notStarted = myStatsTxt.regex(/(This Battle Has Not Started Yet)/);
			battleOver = myStatsTxt.regex(/(Battle Is Over)/i) || myStatsTxt.regex(/(Have Your Guild Master .* Initiate More)/i) || myStatsTxt.regex(/your team.*was (defeated|victorious)/i);
			con.log(2, gf.name + " battle screen arena_battle_banner_section", myStatsTxt, notStarted, battleOver);
			if (myStatsTxt.regex(/(You Are Not A Part Of This .*Battle)/)) {
				return fR;
			}

			session.setItem('gbWhich', fR.label);
			battle.readWinLoss(caap.resultsText, gb.testList);

			fR.nextTopReview = Math.max(now + 5 * 60 * 1000, fR.nextTopReview);

			if (battleOver) {
				if (caap.hasImage('guild_battle_collectbtn_small.gif')) {
					fR.state = 'Collect';
				} else {
					fR.collectedTime = now;
				}
				fR.state = fR.state != 'Active' ? fR.state : gf.name == 'Classic' ? 'Start' : 'No battle';
				return fR;
			}
							
			fR.state == 'Active';
			
			if (caap.hasImage(gf.enterButton)) {
				//con.log(2, 'Battle has enter button', config.getItem('guild_battle_enter',false));
				return fR;
			}
			
			gb.deleterPage(fR, 'path', gf.basePath + ',clickimg:' + gf.enterButton);

			if (schedule.since(fR.lastBattleTime, gf.waitHours * 60 * 60)) {
				con.log(1,'Resetting battle data');
				tStr = fR.nextTopReview;
				fR = new gb.record(fR.label).data;					
				fR.nextTopReview = tStr;
			}

			fR.lastBattleTime = now;
			//con.log(2, 'Enter button cleared');

			tStr = $u.setContent($j("#monsterTicker").text().trim(),'');
            fR.endTime = now + tStr.parseTimer() * 1000;

			args = myStatsTxt.match(new RegExp("(.+) Level: (\\d+) Class: (.+) Health: (.+)/(\\d+).+Status: (.+) .* Activity Points: (\\d+)"));
			if (args && args.length === 8) {
				fR.me.mclass = args[3].toLowerCase();
				fR.me.status = args[6] ? args[6].trim() : '';
				fR.me.healthNum = args[4] ? args[4].parseInt() : 0;
				fR.me.healthMax = args[5] ? args[5].parseInt() : 1;
				fR.me.battlePoints = args[7] ? args[7].parseInt() : 0;
				fR.me.percent = ((fR.me.healthNum / fR.me.healthMax) * 100).dp(2);
				pics = $j.makeArray(tempDiv.find('img').map(function(e) { return $j(this).attr('src').regex(/(\w+\.\w+)$/); }));
				if (fR.att == 0 || (!pics.hasIndexOf('cleric_effect_divine_favor.gif') && !pics.hasIndexOf('mage_effect_enrage.gif'))) {
					fR.att = caap.stats.bonus.api;
				}
				fR.me.shout = pics.hasIndexOf('warrior_effect_shout.gif') ? true : false;
			} else if (myStatsTxt.hasIndexOf('Battle Has Not Started')) {
				// Wait retry until started
				return fR;
			} else {
				con.warn("args error", args, myStatsTxt);
			}

			tempDiv = $j("#globalContainer span[id='guild_token_current_value']");
			tStr = $u.hasContent(tempDiv) ? tempDiv.text().trim() : '';
			fR.tokens = tStr ? tStr.parseInt() : 0;

			tempDiv = $j("#globalContainer span[id='guild_token_time_value']");
			tStr = $u.hasContent(tempDiv) ? tempDiv.text().trim() : '';
			//con.log(5,'Tokens', fR.tokens);
			
			tempDiv = $j("#guild_battle_health");
			if (tempDiv && tempDiv.length) {
				['enemy', 'you'].forEach( function(e) {
					healthDiv = $j("div[style*='guild_battle_bar_" + e + ".gif']", tempDiv).eq(0);
					if ($u.hasContent(healthDiv)) {
						fR[e == 'you' ? 'your' : 'enemy'].health = (100 - healthDiv.getPercent('width')).dp(2);
					} else {
						con.warn("Health bar for " + e + " not found.");
					}
				});

				tempDiv = $j("span", tempDiv);
				if ($u.hasContent(tempDiv) && tempDiv.length === 2) {
					tStr = tempDiv.eq(0).text().trim();
					tempDiv.eq(0).text(tStr + " (" + fR.your.health + "%)");
					tStr = tempDiv.eq(1).text().trim();
					tempDiv.eq(1).text(tStr + " (" + fR.enemy.health + "%)");
				}
			} else {
				con.warn("guild_battle_health error");
			}
			
			gate = $j("div[id*='_guild_member_list_']");
			tower = gate.attr('id').match(/_guild_member_list_(\d)/)[1];
			which = gate.attr('id').match(/(\w+)_guild_member_list_(\d)/)[1];
			gb.setrPage(fR, gb.makePath(gf, which, tower), 'review', now);
			//con.log(2,'Gate ID',gate.attr('id'),tower, which, fR.paths);

			$j("#globalContainer div[id*='" + which + "_new_guild_tab_']").each(function(stower) {
				tStr = this.innerText.trim().innerTrim();
				towerTypes.push($u.setContent(tStr.regex(/\d+\) (\w+)/), ''));
				towerPops.push(tStr.regex(/(\d+)/));
				sealedTowers += $u.hasContent(fR[which].towers[stower]) ? fR[which].towers[stower].healthNum === 0 : towerPops[stower - 1] > 0;
			});
			// easy if only 1 unsealed tower left or 2 unsealed and winning by over 20%
			if (which == 'your') {
				fR.simtis = !$u.isString(fR.me.tower) ? false : towerPops[fR.me.tower - 1] < fR.your.towers[fR.me.tower].players;
			} else {
				fR.easy = (sealedTowers + (fR.your.health > fR.enemy.health + 20)) > 2 && !schedule.since(fR.endTime, -8 * 60 );
				//con.log(2,'EASY',fR.easy, sealedTowers + (fR.your.health > fR.enemy.health + 20), sealedTowers, towerPops);
			}
			
			//con.log(2,'SIMTIS',fR.simtis,fR.easy,$u.isString(fR.me.tower),fR.me.tower, towerPops, towerPops[(fR.me.tower || 1) - 1]);
			if (!gate) {
				con.warn("No gates found");
			} else {
				gb.readTower(fR, which, tower, gate.children("div[style*='height']"), towerTypes, sealedTowers);
			}

			con.log(2, 'Battle: ' + gf.label + ' ' + which.ucWords() + ' Tower ' + tower + " in seconds " + (Date.now() - now)/1000, fR);
			session.setItem(gf.label + "DashUpdate", true);
            caap.updateDashboard(true);
            return fR;
        } catch (err) {
            con.error("ERROR in gb.onBattle: " + err.stack);
            return false;
        }
    };
	
	gb.readTower = function (fR, which, tower, memberDivs, towerTypes, sealedTowers) {
		try {
			var towerList = fR.label == 'loe' ? Object.keys(fR.enemy.towers) : ['1','2','3','4'],
				typeList = fR.label == 'loe' ? ['enemy'] : ['your','enemy'],
				tR = new gb.towerRecord().data, // tower record
				member = $j(),
				gf = gb[fR.label], 
				tempDiv = $j(),
				mR = {}, // member record
				isMe = false,
				tStr = '',
				wl = fR.your.health > fR.enemy.health + 20 || fR.enemy.health > fR.your.health + 20,
				args = [],
				pics = [],
				bR = {}, // battle record
				scoring = config.getItem(gf.scoring,''),
				score = [],
				sealScore = [0, 0],
				tempScore = [0, 0],
				total = 0,
				sealCheck = false,
				fullText = '',
				theGeneral = 'Use Current';
				
			for (var n = 1; n <= 25; n += 1) {
				delete fR[which].members[tower + '-' + n];
				if (!memberDivs || !memberDivs.length || !memberDivs[n-1]) {
					//con.log(2, "No member found", tower, n);
					continue;
				}
				member = $j(memberDivs[n-1]);
				mR = new gb.member().data;
//					text = (which == 'enemy' ? 'basic_' : 'special_defense_') + tower + '_';
				tempDiv = member.find('div[class^="action_panel_"]').eq(0);
				if (tempDiv && tempDiv.length) {
					//con.log(2,"Target_id for member", tempDiv.attr('id'), tempDiv);
					mR.target_id = tempDiv.attr('class').replace('action_panel_','');
					//con.log(2,"Target_id for member", mR.target_id, tempDiv.attr('id'), tempDiv);
				} else {
					mR.target_id = 0;
					//con.log(2, "Unable to find target_id for member", tower, n, member, tempDiv);
				}

				tStr = $u.setContent(member.children().text(), '').trim().innerTrim();
				args = tStr.match(/(\d+)\. (.*) Level: (\d+) Status: (.*) (.+)\/(.+) .*Battle Points: (.*)/);

				if (args && args.length === 8) {
					pics = $j.makeArray(member.find('img').map(function(e) { return $j(this).attr('src').regex(/(\w+\.\w+)$/); }));
					mR.mclass = pics.listMatch(/class_(\w+)\.gif/);
					tR.clerics += mR.mclass == 'cleric' ? 1 : 0;
					mR.points = ['160', '200', '240'][['low','mid','high'].indexOf($u.setContent(pics.listMatch(/(guild_bp_(\w+)\.jpg)/), 'low'))];
					mR.name = args[2] || '';
					mR.level = args[3] ? args[3].parseInt() : 0;
					mR.status = args[4] || '';
					mR.healthNum = args[5] ? args[5].parseInt() : 0;
					mR.healthMax = args[6] ? args[6].parseInt() : 1;
					mR.battlePoints = args[7] ? args[7].parseInt() : 0;
					mR.percent = ((mR.healthNum / mR.healthMax) * 100).dp(2);

					bR = battle.getRecord(mR.target_id);
					bR.level = mR.level;
					['duel', 'poly','confuse'].forEach(function(awin) {
						if (mR.poly) {
							mR.metrics[awin] = 100;
						} else {
							// If enrage or divine favor, assume has 100% bonus. Could do more detailed calc based on time passed in game and number of tokens possibly spent, but 100% bonus is a good place to start.
							mR.metrics[awin] = battle.winChance(bR, (awin == 'confuse' ? 1.5 : awin == 'poly' ? 1.25 : 1) * fR.att, pics.hasIndexOf('mage_effect_enrage.gif') || pics.hasIndexOf('cleric_effect_divine_favor.gif'));
						}
					});
					mR.winChance = mR.metrics.duel;
					mR.metrics.damage = Math.atan((mR.healthMax - mR.healthNum)/1000)/Math.PI*2*100;
					mR.metrics.level = Math.atan(mR.level/1000)/Math.PI*2*100;
					mR.metrics.rhealth = 100 - Math.atan(Math.max(mR.healthNum - gf.minHealth, 0)/1000)/Math.PI*2*100;
					
					tR.players += 1;
					tR.actives += mR.battlePoints > 0 ? 1 : 0;
					tR.AC += (mR.battlePoints > 0 && mR.mclass == 'cleric') ? 1 : 0;
					tR.healthNum += mR.healthNum;
					tR.healthMax += mR.healthMax;
					isMe = which == 'your' && mR.name == caap.stats.PlayerName && mR.level == caap.stats.level;
					if (isMe) {
						fR.me.tower = tower;
					}
					
					(gf.label == 'loe' ? ['mage','warrior','rogue','cleric'] : [fR.me.mclass]).forEach( function(mclass) {
						gb[which][mclass].forEach(function(att) {
							args = ' '.concat(scoring).match(new RegExp("\\W" + att.name + "(\\[.*?)\\]"));
							//con.log(2,'scoring match attack', scoring, args, att.name);
							if (!args || args.length === 0 || ($u.isBoolean(att.self) && att.self !== isMe)) {
								return;
							}
							if (!fR[which].attacks) {
								fR[which].attacks = [att.name];
							} else if (fR[which].attacks.indexOf(att.name) == -1) {
								fR[which].attacks.push(att.name);
							}
							// First number is for multipliers, second is added
							score = [1, 0];
							sealCheck = false;
							sealScore = [0, 0];
							fullText = args[1];
							
							$u.setContent(fullText.match(/(!?\w+:\D?[^,]+)/g),[]).forEach( function(text) {
								var key = text.replace(/:.*/,'').replace('!','').toLowerCase(),
									tf = false;
								switch (key) {
									case 'base' : 		tf = true;															break;
									case 'cleric' : 	
									case 'rogue' :		
									case 'warrior' : 	
									case 'mage' : 		tf = key == mR.mclass; 												break;
									case 'l900' : 		tf = mR.level >=900; 												break;
									case 'l600' : 		tf = mR.level >=600 && mR.level <900; 								break;
									case 'l300' : 		tf = mR.level >=300 && mR.level <600; 								break;
									case 't1' : 	
									case 't2' : 	
									case 't3' : 	
									case 't4' : 		tf = tower == key.numberOnly(); 									break;
									case 'keep' : 	
									case 'wall' : 	
									case 'assault' : 	
									case 'church' : 	
									case 'arcane' : 	
									case 'barricade' : 	
									case 'elemental' : 	
									case 'null' : 	
									case 'gate' : 	
									case 'sewer' : 		tf = $u.hasContent(towerTypes) && towerTypes.length ? towerTypes[tower - 1].toLowerCase() === key : false;					break;
									case 'poly' : 		tf = pics.hasIndexOf('polymorph_effect.gif'); 						break;
									case 'poison' : 	tf = pics.hasIndexOf('rogue_effect_poison.gif'); 					break;
									case 'confuse' : 	tf = pics.hasIndexOf('mage_effect_confuse.gif'); 					break;
									case 'guardian' : 	tf = pics.hasIndexOf('warrior_ability_sentinel.gif'); 				break;
									case 'revive' : 	tf = pics.hasIndexOf('cleric_effect_revive.gif'); 					break;
									case 'shout' : 		tf = pics.hasIndexOf('warrior_effect_shout.gif'); 					break;
									case 'confidence' : tf = pics.hasIndexOf('warrior_effect_confidence.gif'); 				break;
									case 'fortify' : 	tf = pics.hasIndexOf('cleric_effect_fort.gif'); 					break;
									case 'smokebomb' : 	tf = pics.hasIndexOf('effect_smoke'); 								break;
									case 'enrage' : 	tf = pics.hasIndexOf('mage_effect_enrage.gif'); 					break;
									case 'divine_favor': tf = pics.hasIndexOf('cleric_effect_divine_favor.gif'); 			break;
									case 'attack' : 	tf = pics.hasIndexOf('targetting_attack.png'); 						break;
									case 'avoid' : 		tf = pics.hasIndexOf('targetting_avoid.png'); 						break;
									case 'defend' : 	tf = pics.hasIndexOf('targetting_defend.png');						break;
									case 'healFlag' : 	tf = pics.hasIndexOf('targetting_heal.png'); 						break;
									case 'me' : 		tf = isMe; 															break;
									case 'active' : 	tf = mR.battlePoints; 												break;
									case 'bs' : 		tf = mR.healthNum == mR.healthMax; 									break;
									case 'healed' : 	tf = mR.healthMax - mR.healthNum < 300; 							break;
									case '100v100' : 	
									case 'classic' : 	
									case '10v10' : 		tf = gf.label == key;		 										break;
									case 'easy' : 		tf = fR.easy; 														break;
									case 'easyc' : 		tf = fR.easy && mR.mclass == 'cleric'; 								break;
									case 'simtis' : 	tf = fR.simtis; 													break;
									case mR.target_id : tf = true; 															break;
									case 'unstunned' : 	tf = mR.healthNum > 200; 											break;
									case 'meshout' : 	tf = fR.me.shout; 													break;
									case 'afflicted' : 	
										tf = pics.hasIndexOf('polymorph_effect.gif') || pics.hasIndexOf('rogue_effect_poison.gif') || pics.hasIndexOf('mage_effect_confuse.gif'); 	break;
									case 'p160' : 		
									case 'p200' : 		
									case 'p240' : 		tf = mR.points == key.numberOnly(); 								break;
									case 'wlp160' :
									case 'wlp200' :
									case 'wlp240' : 	tf = mR.points == key.numberOnly() && wl; 							break;
									case 'seal' :
										tf = true;
										sealCheck = true;
										sealScore = [score[0], score[1]];
										break;
									default : 			
										if (!/\d+/.test(key)) {
											con.log(1, 'Unknown guild battle modifier: ' + key, fullText, att, args);
										}
								}

								args = text.match(new RegExp('(!?)' + key + ':(\\*?)(-?)([\\.\\d]+)'));
								
								// Deliberate avoidance of "tf !==" to catch 0 or undefined, etc.
								if (args && args.length == 5 && (tf != false) !== (args[1] == '!')) { 
									score[args[2] == '*' ? 0 : 1] += args[3] == '-' ? -args[4].parseFloat() : args[4].parseFloat();
								}
								
								if (sealCheck === true) {
									sealCheck = args[1] == '!' ? 'normal' : 'seal';
									sealScore = [score[0] - sealScore[0], score[1] - sealScore[1]];
									score = [score[0] - sealScore[0], score[1] - sealScore[1]];
								}
							});

							mR.scores[att.name] = {};
							tempScore = [score[0], score[1]];
							['normal','seal'].forEach(function(seal) {
								score = seal == sealCheck ? [tempScore[0] + sealScore[0], tempScore[1] + sealScore[1]] : [tempScore[0], tempScore[1]];
								total = score[0] * mR.metrics[att.base] + score[1];
								total = (gf.label == 'loe' || towerTypes[tower - 1] != 'Keep' || which == 'your' || sealedTowers == 3)
									&& mR.healthNum >= (which == 'your' ? gf.minHealth : 1) ? total.dp(2) : 0;
								mR.scores[att.name][seal] = total;
								theGeneral = fullText.match(new RegExp("@[^,]+"));
								theGeneral = theGeneral && theGeneral.length > 0 ? theGeneral[0] : '@Use Current';
								tR[seal].unstunned = gb.target(tR[seal].unstunned, total, mR, att.image || att.name, theGeneral, which, tower, $u.setContent(att.tokens, 1));
								if (which == 'enemy' && att.name.regex(/duel/)) {
									tR[seal].stunned = gb.target(tR[seal].stunned, total, mR, att.image || att.name, theGeneral, which, tower, $u.setContent(att.tokens, 1));
								}
							});

						});
					});
						
					fR[which].members[tower + '-' + n] = mR;
					
				} else {
					con.warn("Unable to read member stats",tower, n, args);
				}
			}
			
			tR.damage = tR.healthMax - tR.healthNum;
			tR.life = (tR.healthNum/tR.healthMax * 100).dp(1);
			fR.firstScanDone = true;
			fR[which].towers[tower] = tR;

			typeList.forEach(function(fwhich) {
				var maxDamage = 0,
					maxTower = 0;
					
				towerList.forEach(function(fTower) {
					tR = fR[fwhich].towers[fTower];
					if ($u.isObject(tR)) {
						if ($u.isNumber(tR.damage) && tR.damage > maxDamage + 1000 && tR.healthNum > 0) {
							maxDamage = tR.damage;
							maxTower = fTower;
						}
					} else {
						fR.firstScanDone = false;
					}
				});
				fR[fwhich].seal = maxTower;
			});

        } catch (err) {
            con.error("ERROR in gb.readTower: " + err.stack);
            return false;
        }
    };
	
	gb.worker = function () {
        try {
			var fRecord = gb.getRecord('gb100'),
				gRecord = gb.getRecord('gbClassic'),
				tRecord = gb.getRecord('gb10'),
				configSet = false;
				
			if (schedule.since(fRecord.startTime, 1 * 60) && !schedule.since(fRecord.startTime, 4* 60)) {
				caap.stats.priorityGeneral = config.getItem('100v100_ClassGeneral','Use Current') == 'Use Current' ? 'Use Current' : config.getItem('100v100_ClassGeneral','Use Current');
			}
			if (caap.stats.priorityGeneral == 'Use Current' && schedule.since(tRecord.startTime, -8 * 60) && !schedule.since(tRecord.startTime, -0 * 60)) {
				caap.stats.priorityGeneral = config.getItem('10v10_ClassGeneral','Use Current') == 'Use Current' ? 'Use Current' : config.getItem('10v10_ClassGeneral','Use Current');
			}
			if (caap.stats.priorityGeneral == 'Use Current' && gRecord.state == 'Auto-match') {
				caap.stats.priorityGeneral = config.getItem('Classic_ClassGeneral','Use Current') == 'Use Current' ? 'Use Current' : config.getItem('Classic_ClassGeneral','Use Current');
			}
			if (caap.stats.priorityGeneral != 'Use Current') {
				con.log(2,' Pre battle class general',caap.stats.priorityGeneral);
				if (general.selectSpecific(caap.stats.priorityGeneral)) {
					return true;
				}
			}
				
			if (fRecord.state == 'Active' || gRecord.state == 'Active' || tRecord.state == 'Active') {
				caap.stats.battleIdle = config.getItem('GB_IdleGeneral','Use Current') == 'Use Current' ? 'Use Current' : config.getItem('GB_IdleGeneral','Use Current');
			} else {
				caap.stats.battleIdle = 'Use Current';
			}

			return ['gb100', 'gb10', 'gbClassic'].some( function(label) {
				configSet =  config.getItem(label + 'whenTokens') != 'Never' ||
					config.getItem(gb[label].name + ' ClassGeneral', 'Use Current') != 'Use Current' ||
					config.getItem(label + 'collect', false);
				if (configSet && gb.workCommon(gb[label])) {
					return true;
				}

			});
        } catch (err) {
            con.error("ERROR in guildBattle: " + err.stack);
            return false;
        }
    };

	gb.workCommon = function (gf) {
		try {
			var fR = gb.getRecord(gf.label),
				//paths = [{'path' : gf.onTopPath, 'review' : $u.setContent(fR.nextTopReview, 0)}].concat($u.setContent(fR.paths, [])),
				whenTokens = config.getItem(gf.label + 'whenTokens', 'Never'),
				tokenMax = config.getItem(gf.label + 'max', 10),
				result = '',
				priority = false,
				waitForGB = false,
				wait = false,
				stun = false,
				useTokens = false,
				now = new Date(),
				doAttack = false,
				teams = [],
				tObj = {},
				pgO = {},
				bR = {},
				mess = gf.label + '_mess',
				towers = ['1','2','3','4'],
				t = { 'score' : 0, 'tokens' : 1 },
				stateMsg = schedule.since(fR.collectedTime, gf.waitHours * 60 * 60) ? 'Uncollected' : 'Collected';
			
			tObj = fR.t;
			fR.t = false;
			
			// Set paths or reset paths list according to state i
			if (schedule.check("page_index") && false) {
				con.log(1, 'Guild Battle: navigating to Index to check on battles');
				if (caap.navigateTo('index')) {
					gb.setRecord(fR);
					return true;
				}
				gb.setRecord(fR);
				return caap.navigateTo('keep');
			}
			
			if (fR.state == 'Collect') {
				fR.paths = [];
				if (stateMsg == 'Uncollected' && config.getItem(gf.label + 'collect',false) && !(caap.gameDay(-2 * 60) == 'Mon' 
					&& caap.gameDay(gf.collectHours * 3600, (gf.name == 'Classic' ? fR.lastBattleTime : fR.endTime)) == 'Tue')) {
					gb.setrPage(fR, (caap.stats.exp.dif < 60 ? '@Level_UpGeneral,' : '') + gf.basePath + ',clickimg:guild_battle_collectbtn_small.gif');
					stateMsg = 'Collecting'
				}
			} else if (fR.state == 'No battle') {
				fR.paths = [];
				stateMsg += ', no battle';
			} else if (fR.state == 'Start') {
				if (gb.checkTimes()) {
					caap.setDivContent(gf.label + '_mess', gf.name + ': Clicking button for auto-match');
					gb.setRecord(fR);
					return true;
				} else if (config.getItem('Classic_ClassGeneral', 'Use Current') != 'Use Current') {
					gb.setrPage(fR, gf.basePath);
					stateMsg += ', checking for auto-match to set general, next check: ' + $u.makeTime(fR.nextTopReview + 5 * 60 * 1000, caap.timeStr(true));
				} else {
					stateMsg += ', ready to start next battle';
				}
			} else if (fR.state == 'Auto-match') {
				fR.paths = [];
				stateMsg += ', and auto-match button pushed!';
			} else if (fR.state == 'Active') {
				gb.deleterPage(fR, 'path', gf.basePath);
				stateMsg = schedule.since(fR.lastBattleTime, gf.waitHours * 60 * 60) ? 'Not entered' : 'Entered Battle';
				if (config.getItem(gf.label + 'whenTokens','Never') != 'Never') {
					if (stateMsg == 'Not entered') {
						fR.paths = [];
						if (caap.stats.stamina.num >= gf.stamina) {
							stateMsg = 'Entering battle';
							gb.setrPage(fR, gf.basePath + ',clickimg:' + gf.enterButton, 'general', true);
						} else {
							caap.setDivContent(mess, gf.name + ': Unable to enter because of low stamina');
						}
					} else {
						fR.t = tObj;
						gb.setReview(fR);
						stateMsg = fR.tokens + '/10 ' + fR.me.status + ', reviewing towers';
					}
				}
			}

			// Add top page review to paths lists
			gb.setrPage(fR, 'index', 'review', $u.setContent(fR.nextTopReview, 0));
			
			stun = fR.me.healthNum <= gf.minHealth ? 'stunned' : 'unstunned';
			wait = stun == 'stunned' || fR.me.poly || (fR.me.confuse && fR.your.attacks.indexOf('cleanse') < 0 && fR.your.attacks.indexOf('dispel') < 0);
			tokenMax = wait ? 8 : tokenMax;
			fR.burn = fR.tokens <= (wait ?  tokenMax - 2 : config.getItem(gf.label + 'min', 0)) ? false :  fR.burn || fR.tokens >= tokenMax;
			priority = schedule.since(fR.endTime, -8 * 60 ) || fR.your.health < 10;
			useTokens =  priority || fR.burn;
			doAttack = fR.state == 'Active' && useTokens && fR.tokens;
			waitForGB = gf.name != 'Classic' && state.getItem('GB_Active', false) && !priority;
			
			//con.log(2, 'GUILD ' + gf.name, fR, $u.makeTime(fR.nextTopReview, caap.timeStr(true)), $u.makeTime(fR.lastBattleTime, caap.timeStr(true)));
			//con.log(2, gf.label + 'PATHs', fR.paths);

            /*jslint continue: true */

			if (!fR.t.score) {
				for (var i = 0; i < fR.paths.length; i++) {
					pgO = fR.paths[i];
					if (schedule.since(pgO.review, 5 * 60) && (!fR.firstScanDone || !pgO.filter || doAttack)) {
						//con.log(2,'Reviewing battle page',pgO.path, fR.paths);
						if (pgO.general) {
							if (waitForGB) {
								// If GB is busy doing stuff, then wait until it's done
								continue;
							} else if (gf.name == 'Classic') {
								state.setItem('GB_Active', true);
							}
							if (caap.stats.priorityGeneral == 'Use Current' && general.Select(caap.stats.battleIdle)) {
								caap.setDivContent(mess, gf.name + ': ' + fR.tokens + '/10, setting idle general');
								gb.setRecord(fR);
								return true;
							}
						}
						caap.setDivContent(mess, gf.name + ': ' + stateMsg);
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
			//con.log(2,'GUILD REVIEW PAGES', gf.name, paths);
            /*jslint continue: false */
			
			//con.log(2,'pre ATTACK!',doAttack, whenTokens, fR.tokens > tokenMax, fR.state, fR.me.healthNum > gf.minHealth);
			if (whenTokens !== 'Never' && caap.stats.priorityGeneral == 'Use Current') {
				
				if (doAttack && !waitForGB) {
					teams = stun == 'stunned' ? ['enemy'] : ['your','enemy'];
					towers = gf.name == '10v10' ? ['1'] : towers;
					teams.forEach(function(which) {
						towers.forEach(function(tower) {
							var seal = tower == fR[which].seal ? 'seal' : 'normal';
							if (fR[which].towers[tower][seal][stun].score > t.score && fR[which].towers[tower][seal][stun].tokens <= fR.tokens) {
								t = fR[which].towers[tower][seal][stun];
							}
							//con.log(2, 'Attack evals:',which, tower, seal, stun, t, t.tokens, fR.tokens, t.tokens <= fR.tokens);
						});
					});
					
					stateMsg = gf.name + ': ' + fR.tokens + '/10 ' + fR.me.status + ', ';
				
					fR.t = t;
					if (!t.score) {
						caap.setDivContent(mess, stateMsg + ' no valid target');
						con.log(2, gf.name + ': No valid target to attack', fR);
						state.setItem('GB_Active', gf.name == 'Classic' ? false : state.getItem('GB_Active', false));
						gb.setRecord(fR);
						return false;
					}
					
					caap.setDivContent(mess, stateMsg + t.attack + ' on ' + t.team + ' T' + t.tower + ' ' + t.name);
					con.log(2,  stateMsg + t.attack + ' on ' + t.team + ' T' + t.tower + ' ' + t.name, t);
					result = caap.navigate2(t.general + ',' + gb.makePath(gf, t.team, t.tower) + ',clickjq:.action_panel_' + t.id + ' input[src*="' + t.attack + '.jpg"]');
					if (result == 'fail') {
						con.warn(stateMsg + t.attack + ' failed on ' + t.team + ' T' + t.tower + ' ' + t.name + ' Check ' + general.getCurrentGeneral() + ' has ' + t.attack + ', reloading page', general.getCurrentGeneral(), general.getCurrentLoadout());
						caap.setDivContent(mess, stateMsg + t.attack + ' failed on ' + t.team + ' T' + t.tower + ' ' + t.name + ' Check ' + general.getCurrentGeneral() + ' has ' + t.attack);
						gb.setRecord(fR);
						return caap.navigate2(gb.makePath(gf, t.team == 'enemy' ? 'your' : 'enemy', t.tower));
					} else if (result == 'done') {
						battle.setRecordVal(t.id, 'level', t.level);
						state.setItem('lastBattleID', t.id);
						fR.t = false;
					}
					gb.setRecord(fR);
					return result;
				} else if (fR.state == 'Active') {
					caap.setDivContent(mess, gf.name + ': ' + fR.tokens + '/10 ' + fR.me.status + ', ' + 'waiting for ' + tokenMax + ' tokens');
				} else {
					caap.setDivContent(mess, gf.name + ': ' + stateMsg + ', next check: ' + $u.makeTime(fR.nextTopReview + 5 * 60 * 1000, caap.timeStr(true)));
				}
				state.setItem('GB_Active', gf.name == 'Classic' ? false : state.getItem('GB_Active', false));
			}
			gb.setRecord(fR);
			return false;
        } catch (err) {
            con.error("ERROR in gb.work: " + gf.name + ' ' + err.stack);
            return false;
        }
    };

	// Add a review page with path, and set 'entry' key to value, if wanted
	gb.setrPage = function(fR, path, entry, value) {
        try {
			var rPage = {
				path: path,
				review: 0
			};

            if (!$u.hasContent(path) || !$u.isString(path)) {
                con.warn("path", fR, path, entry, value);
                throw "Invalid identifying path!";
            }
			
			fR.paths = !$u.isArray(fR.paths) ? [] : fR.paths;				

            for (var it = 0; it < fR.paths.length; it++) {
                if (fR.paths[it].path === path) {
					if ($u.hasContent(entry)) {
						fR.paths[it][entry] = value;
					}
					return true;
                }
            }
			if ($u.hasContent(entry)) {
				rPage[entry] = value;
			}

			fR.paths.push(rPage);
			gb.setRecord(fR);
			
			return false;
        } catch (err) {
            con.error("ERROR in gb.setrPage: " + err.stack);
            return false;
        }
    };

	// Delete all review pages where 'entry' = value
	gb.deleterPage = function(fR, entry, value) {
        try {
            if (!$u.hasContent(entry) || !$u.isString(entry)) {
                con.warn("Delete entry invalid", entry, value);
                throw "Invalid identifying entry!";
            }
			var deleted = 0;

            for (var i = fR.paths.length - 1; i >= 0; i += -1) {
                if (fR.paths[i][entry] === value) {
					deleted += 1;
					//con.log(2,'GB review pages before',fR.paths, entry, i);
					fR.paths.splice(i,1);
					//con.log(2,'GB review pages after',fR.paths, entry, i, deleted);
                }
            }
			return deleted;

        } catch (err) {
            con.error("ERROR in gb.deleterPage: " + err.stack);
            return false;
        }
    };

	gb.makePath = function(gf, type, i) {
        try {
			if (!$u.isObject(gf) || (gf.label != 'loe' && (!$u.isString(type) || !($u.isNumber(i) || $u.isString(i))))) {
				con.warn('Invalid gb.makePath input', gf, type, i);
				return false;
			}
			if (gf.label == 'loe') {
				return gf.basePath + $u.setContent($u.setContent(i,'').regex(/(\w+):\d/), type) + '&slot=0';
			}
			return gf.basePath + ',clickimg:' + type + '_guild_off.gif,jq:#' + type + '_guild_tab,clickjq:#' + type + '_new_guild_tab_' + i + ',jq:#' + type + '_guild_member_list_' + i;
        } catch (err) {
            con.error("ERROR in gb.makePath: " + err.stack);
            return false;
        }
    };
	
	gb.setReview = function(fR) {
        try {
			var gf = gb[fR.label], 
				filter = false;
			['your','enemy'].forEach(function(type) {
				var doPage = !fR.firstScanDone || fR[type].attacks.length;
				for (var i = 1; i <= (gf.name == '10v10' ? 1 : 4); i++) {
					filter = i > 1 || type == 'your';
					gb.setrPage(fR, gb.makePath(gf, type, i), 'filter', filter);
					gb.setrPage(fR, gb.makePath(gf, type, i), 'general', true);
					if (doPage) {
						gb.setrPage(fR, gb.makePath(gf, type, i));
					} else {
						gb.deleterPage(fR, 'path', gb.makePath(gf, type, i));
					}
				}
			});
        } catch (err) {
            con.error("ERROR in gb.setReview: " + err.stack);
            return false;
        }
    };

    gb.target = function(t, total, mR, attack, general, team, tower, tokens) {
        try {
			if (total > t.score) {
				t.tower = tower;
				t.tokens = tokens;
				t.score = total;
				t.attack = attack;
				t.team = team;
				t.general = general;
				t.id = mR.target_id;
				t.name = mR.name;
				t.level = mR.level;
			}
			return t;
        } catch (err) {
            con.error("ERROR in gb.team: " + err.stack);
            return false;
        }
    };
	
    gb.checkTimes = function() {
        try {
			var begin = new Date(),
				end = new Date(),
				timeString = '',
				timeBattlesList = config.getList('timed_guild_battles', ''),
				timedSetting = config.getItem('WhenGuildBattle', ''),
				match = (timedSetting === 'Battle available') ? true : false,
				now = new Date();
				
			if (timedSetting=='Never') {
				return false;
			}
			//con.log(2, 'checking to see if starting GB', timeBattlesList);
			// Next we step through the users list getting the name and conditions
			for (var p = 0; p < timeBattlesList.length; p++) {
				if (!timeBattlesList[p].toString().trim()) {
					continue;
				}
				timeString = timeBattlesList[p].toString().trim();
				begin = 0;
				for (var i = 0; i < caap.weekdays.length; i++) {
					if (timeString.indexOf(caap.weekdays[i])>=0) {
						begin = general.parseTime(timeString);
						end = general.parseTime(timeString);
						//con.log(2, 'Vars now.getDay, i', now.getDay(), i);
						begin.setDate(begin.getDate() + i - now.getDay()); // Need to check on Sunday case
						end.setDate(end.getDate() + i - now.getDay()); // Need to check on Sunday case
						end.setMinutes(end.getMinutes() + 2 * 60);
						break;
					}
				}
						
				if (!begin) {
					con.log(4, 'No day of week match', now.getDay(), timeString);
					continue;
				}
				con.log(4,'begin ' + $u.makeTime(begin, caap.timeStr(true)) + ' end ' + $u.makeTime(end, caap.timeStr(true)) + ' time ' + $u.makeTime(now, caap.timeStr(true)), begin, end, now);
				
				if (begin < now && now < end) {
					match = true;
					con.log(4, 'Valid time for begin ' + $u.makeTime(begin, caap.timeStr(true)) + ' end ' + $u.makeTime(end, caap.timeStr(true)) + ' time ' + $u.makeTime(now, caap.timeStr(true)), begin, end, now, timeString);
					break;
				}
			}
			if (match) {
				caap.stats.priorityGeneral = config.getItem('Classic_ClassGeneral','Use Current') == 'Use Current' ? 'Use Current' : config.getItem('Classic_ClassGeneral','Use Current');
				return caap.navigate2((caap.stats.priorityGeneral !== 'Use Current' ? '@' + caap.stats.priorityGeneral + ',' : '') + 'tenxten_gb_formation,guildv2_battle,clickimg:sort_btn_startbattle.gif');
			}

			//con.log(5, 'No time match to current time', now);
        } catch (err) {
            con.error("ERROR in gb.checkTimes: " + err.stack);
            return false;
        }
    };

    gb.menu = function() {
        try {
            // Guild Battle controls
            var gbattleList = ['Battle available', 'At fixed times', 'Never'],
                gbattleInst = [
                    'Battle available will initiate a guild battle whenever the Start Button is available',
                    'At fixed times will allow you to set a schedule of when to start battles',
                    'Never - disables starting guild battles'
                ],
                tokenList = ['Over', 'Between Max Min', 'Never'],
                tokenInst = [
                    'Over - join battles and attack whenever your tokens are over the max',
                    'Between Max/Min - join battles and burn tokens once over max until just over min',
                    'Never - disables attacking in this battle'],
				tokenRange = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
				timed_guild_battles_inst = "List of times when Guild Battles should be started, such as 'Mon 1, Tue 15:30, Wed 8 PM, etc.  Guild battle will be attempted to be started at the listed time and up to two hours after.",
				guild_battle_scoring_inst = "List of score adjustments to pick targets",
                htmlCode = '';

            htmlCode += caap.startToggle('GuildBattles', 'GUILD BATTLES');

			[gb.gbClassic,gb.gb100,gb.gb10].forEach(function(gf) {
				htmlCode += caap.makeDropDownTR(gf.name + " Use tokens", gf.label + 'whenTokens', tokenList, tokenInst, '', 'Never', false, false, 62);
				htmlCode += caap.display.start(gf.label + 'whenTokens', 'isnot', 'Never');
				htmlCode += caap.makeDropDownTR(gf.name + " Max", gf.label + 'max', tokenRange, [], '', '8', false, false, 62);
				htmlCode += caap.display.start(gf.label + 'whenTokens', 'is', 'Between Max Min');
				htmlCode += caap.makeDropDownTR(gf.name + " Min", gf.label + 'min', tokenRange, [], '', '0', false, false, 62);
				htmlCode += caap.display.end(gf.label + 'whenTokens', 'is', 'Between Max Min');
				htmlCode += caap.display.end(gf.label + 'whenTokens', 'isnot', 'Never');
				htmlCode += caap.makeCheckTR(gf.name + " Auto-collect", gf.label + 'collect', false, 'Auto-collect when these battles finish');
			});

            htmlCode += caap.makeTD("Rate targets by: <a href='http://caaplayer.freeforums.org/viewtopic.php?f=9&t=830' target='_blank' style='color: blue'>(INFO)</a>");
            htmlCode += caap.makeTextBox('guild_battle_scoring', guild_battle_scoring_inst, 'cduel[],mduel[],wduel[],rduel[]', '');
            htmlCode += caap.makeDropDownTR("Start Guild Battles when", 'WhenGuildBattle', gbattleList, gbattleInst, '', 'Never', false, false, 62);
            htmlCode += caap.display.start('WhenGuildBattle', 'is', 'At fixed times');
            htmlCode += caap.makeTD("Start Guild Battles at these times:");
            htmlCode += caap.makeTextBox('timed_guild_battles', timed_guild_battles_inst, '', '');
            htmlCode += caap.display.end('WhenGuildBattle', 'is', 'At fixed times');
            htmlCode += caap.endToggle;
            return htmlCode;
        } catch (err) {
            con.error("ERROR in gb.menu: " + err.stack);
            return '';
        }
    };

    gb.dashboard = function() {
		gb.dashboardCommon(gb.gbClassic);
		gb.dashboardCommon(gb.gb10)
		gb.dashboardCommon(gb.gb100);
	};

    gb.dashboardCommon = function(gf) {
        try {
            /*-------------------------------------------------------------------------------------\
                Next we build the HTML to be included into the 'caap_guildBattle' div. We set our
                table and then build the header row.
            \-------------------------------------------------------------------------------------*/
			
            if (config.getItem('DBDisplay', '') === gf.name && session.getItem(gf.label + "DashUpdate", true)) {
                var color = '',
                    headers1 = ['Index', 'Name'],
                    values1 = ['index', 'name'],
                    headers2 = ['Class', 'Level', 'Health', 'Max', 'Status', 'Activity', 'Points', 'Win%'],
                    values2 = ['mclass', 'level', 'healthNum', 'healthMax', 'status', 'battlePoints', 'points', 'winChance'],
					headers = [],
					values = [],
                    pp = 0,
                    i = {},
                    len = 0,
                    len1 = 0,
					value = '',
                    data = {
                        text: '',
                        color: '',
                        bgcolor: '',
                        id: '',
                        title: ''
                    },
                    handler = null,
					fR = gb.getRecord(gf.label),
					display = config.getItem('GFDisplay','Opponent'),
					members = {},
					member = {},
					towers = {},
					tower = {},
					style = '',
					seal = '',
					whichLabel = '',
                    head = '',
                    body = '',
                    row = '',
					towerHtml = '';
				//con.log(2, "Dash record",fR);
				
				['your','enemy'].forEach(function(which) {
					whichLabel = which == 'your' ? 'My Guild' : which == 'enemy' ? 'Opponent' : '';
					style = '" style="display:' + (config.getItem('GFDisplay', 'Opponent') == whichLabel ? 'block' : 'none') + '"';
					$j("#caap_" + gf.label, caap.caapTopObject).append('<div id="caap_'+ which + gf.label + style + '></div>');

					if (config.getItem('GFDisplay', 'Opponent') != whichLabel) {
						return;
					}
                    head = '';
                    body = '';
                    row = '';
					towerHtml = '';
					headers = [];
					values = [];

					if (fR[which].attacks && $u.isArray(fR[which].attacks)) {
						headers = headers1.concat(fR[which].attacks);
						headers = headers.concat(headers2);
						values = values1.concat(fR[which].attacks);
						values = values.concat(values2);
						//con.log(2, 'Dashboard New arrays',fR[which].attacks, headers, values);
					} else {
						headers = headers1.concat(headers2);
						values = values1.concat(values2);
						con.log(2, 'No attacks scored yet',fR[which].attacks);
					}
					headers.push('Cnd');

					members = fR[which].members;
					towers = fR[which].towers;
					for (pp = 1; pp <= 4; pp += 1) {
						tower = towers[pp.toString()];
						if (!tower) {
							continue;
						}
						towerHtml += 'Tower ' + pp + ' #' + tower.players + '  Act: ' + tower.actives + ' Clr: ' + tower.clerics + ' AC: ' + tower.AC + ' Health Life%: ' + tower.life + '<br>';
					}

					for (pp = 0; pp < headers.length; pp += 1) {
						head += caap.makeTh({
							text: headers[pp],
							color: '',
							id: '',
							title: '',
							width: ''
						});
					}

					head = caap.makeTr(head);
					//con.log(2, "members", members, fR);
					for (var i in members) {
						if (members.hasOwnProperty(i)) {
							row = "";
							for (pp = 0; pp < values.length; pp += 1) {
								member = members[i];
								//con.log(2,'i pp', i, pp, values[pp],member[values[pp]]);
								switch (values[pp]) {
								case 'name':
									data = {
										text: '<span id="caap_' + gf.label + '_' + pp + '" title="Clicking this link will take you to (' +  ') ' + fR.name + '" mname="1"' +
											'" rlink="guild_battle_battle.php?twt2=' + '&guild_id=' + fR.guildId + '&slot='  +
											'" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + member[values[pp]] + '</span>',
										color: fR.color,
										id: '',
										title: ''
									};

									row += caap.makeTd(data);

									break;
								case 'index':
									row += caap.makeTd({
										text: i,
										color: fR.color,
										id: '',
										title: ''
									});

									break;
								case 'ticker':
									row += caap.makeTd({
										text: $u.hasContent(fR[values[pp]]) ? fR[values[pp]].regex(/(\d+:\d+):\d+/) : '',
										color: fR.color,
										id: '',
										title: ''
									});

									break;
								default:
									if (fR[which].attacks && fR[which].attacks.indexOf(values[pp]) >= 0) {
										if ($u.hasContent(member.scores[values[pp]])) {
											seal = i.replace(/-.*/,'') == fR[which].seal ? 'seal' : 'normal';
											value = member.scores[values[pp]][seal];
										} else {
											value = -1;
										}
									} else {
										value = $u.hasContent(member[values[pp]]) ? member[values[pp]] : ''
									}
									row += caap.makeTd({
										text: value,
										color: fR.color,
										id: '',
										title: ''
									});
								}
							}
		/*
							data = {
								text: '<a href="' + caap.domain.altered + '/guild_battle_battle.php?twt2=' + gb.info[fR.name].twt2 + '&guild_id=' + fR.guildId +
									'&action=doObjective&slot=' + fR.slot + '&ref=nf">Link</a>',
								color: 'blue',
								id: '',
								title: 'This is a siege link.'
							};
							row += caap.makeTd(data);
		*/
							if ($u.hasContent(fR.conditions) && fR.conditions !== 'none') {
								data = {
									text: '<span title="User Set Conditions: ' + fR.conditions + '" class="ui-icon ui-icon-info">i</span>',
									color: fR.color,
									id: '',
									title: ''
								};

								row += caap.makeTd(data);
							} else {
								row += caap.makeTd({
									text: '',
									color: color,
									id: '',
									title: ''
								});
							}

							body += caap.makeTr(row);
						}
					}

					$j("#caap_" + which + gf.label, caap.caapTopObject).html($j(caap.makeTable("guild_battle", head, body)).dataTable({
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
					$j("#caap_" + which + gf.label, caap.caapTopObject).prepend(towerHtml);

					handler = function(e) {
						var visitBattleLink = {
							mname: '',
							arlink: ''
						},
						i = 0,
							len = 0;

						for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
							if (e.target.attributes[i].nodeName === 'mname') {
								visitBattleLink.mname = e.target.attributes[i].value;
							} else if (e.target.attributes[i].nodeName === 'rlink') {
								visitBattleLink.arlink = e.target.attributes[i].value;
							}
						}

						// caap.clickAjaxLinkSend(visitBattleLink.arlink);
						gb.path = visitBattleLink.arlink;
						//con.log(2,'battle path set',gb.path);
					};

					$j("span[id*='caap_" + which + gf.label + "_']", caap.caapTopObject).off('click', handler).on('click', handler);
					handler = null;
				});

                session.setItem(gf.label + "DashUpdate", false);
            }

            return true;
        } catch (err) {
            con.error("ERROR in gb.dashboardCommon: " + err.stack);
            return false;
        }
    };

}());
