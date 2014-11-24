
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

    guild_battle.records = [];

    guild_battle.record = function() {
        this.data = {
            'name': '',
            'guildId': '',
            'ticker': '',
			'collectedTime' : 0,
			'lastBattleTime' : 0,
			'startTime' : 0,
			'endTime' : 0,
			'seal' : '0',
			'easy' : false,
			'simtis' : false,
			'firstScanDone' : false,
			'burn' : false,
			'paths' : [],
			'onTopTime' : 0,
			'me' : {},
            'enemy': {
				'towers' : {},
				'members' : {},
				'attacks' : []
			},
            'your': {
				'towers' : {},
				'members' : {},
				'attacks' : []
			},
            'color': $u.bestTextColor(config.getItem("StyleBackgroundLight", "#E0C961"))
        };
    };

    guild_battle.member = function() {
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

	guild_battle.towerRecord = function () {
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
			'clericHealthNum' : 0,
			'clericHealthMax' : 0,
			'clericDamage' : 0,
			'clericLife' : 0
		};
	};
	
	
    guild_battle.wlRecord = function() {
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

    guild_battle.me = function() {
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

	guild_battle.gf = {
		'festival' : {
			'name' : 'Festival',
			'label' : 'festival',
			'mess' : 'festival_mess',
			'abbrev' : 'Fest',
			'onTopPath' : 'festival_battle_home',
			'tabs' : '_arena_tab_',
			'token' : 'festivalTokens',
			'bannerDiv' : 'arena_battle_banner_section',
			'enterButton' : 'guild_enter_battle_button.gif',
			'index' : 1,
			'infoDiv' : '#app_body #current_battle_info',
			'waitHours' : 3.9,
			'minHealth' : 200,
			'basePath' : 'festival_battle_home,clickimg:festival_arena_enter.jpg,festival_guild_battle',
			'startText' : 'XXXX',
			'preGBText' : 'HOUR',
			'activeText' : 'BATTLE NOW',
			'collectText' : 'COLLECT'
		},
		'guild_battle' : {
			'name' : 'Guild Battle',
			'label' : 'guildBattle',
			'mess' : 'guild_battle_mess',
			'abbrev' : 'GB',
			'onTopPath' : 'tenxten_gb_formation,guildv2_battle',
			'tabs' : '_new_guild_tab_',
			'token' : 'guildBattleTokens',
			'bannerDiv' : 'guild_battle_banner_section',
			'enterButton' : 'guild_enter_battle_button2.gif',
			'index' : 0,
			'infoDiv' : '#app_body #guildv2_battle_middle',
			'IDDiv' : 'special_defense_',
			'waitHours' : 8.9,
			'minHealth' : 1,
			'basePath' : 'tenxten_gb_formation,guildv2_battle,clickimg:sort_btn_joinbattle.gif,guild_battle',
			'startText' : 'submit the Guild for Auto-Matching',
			'preGBText' : 'Auto-Match in Progress',
			'activeText' : 'Time Remaining',
			'collectText' : 'JOIN NOW!'
		},
		'tenVten' : {
			'name' : '10v10',
			'label' : '10v10',
			'mess' : '10v10_mess',
			'abbrev' : '10v10',
			'onTopPath' : 'index',
			'tabs' : '_new_guild_tab_',
			'token' : 'tenBattleTokens',
			'bannerDiv' : 'guild_battle_banner_section',
			'enterButton' : 'guild_enter_battle_button3.gif',
			'index' : 3, // 'winlossrecords' is index 2
			'infoDiv' : '#app_body #newsFeedSection',
			'IDDiv' : 'special_defense_',
			'waitHours' : 3.9,
			'minHealth' : 200,
			'basePath' : 'tenxten_gb_formation,clickjq:.team_content:visible input[src*="fb_guild_btn_joinbattle_small.gif"],ten_battle',
			'startText' : 'submit the Guild for Auto-Matching',
			'preGBText' : 'Next 10v10 Battle',
			'activeText' : 'is active!',
			'collectText' : 'Battle Over! Collect Reward!'
		}
	};
	
	guild_battle.enemy = {
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

	guild_battle.your = {
		'mage' : [],
		'rogue' : [
			{'name': 'smokebomb',
			'self': false,
			'base' : 'level'}
		],
		'warrior' : [
			{'name': 'guardian',
			'self': false,
			'base' : 'level'},
			{'name' : 'sentinel',
			'base' : 'level'}
		],
		'cleric' : [
			{'name': 'revive',
			'base' : 'rhealth'},
			{'name' : 'heal',
			'base' : 'damage',
			'image' : 'cleric_heal'},
			{'name' : 'mass_heal',
			'tokens' : 2,
			'base' : 'damage'},
			{'name' : 'fortify',
			'base' : 'level'},
			{'name' : 'cleanse',
			'base' : 'level'},
			{'name' : 'dispel',
			'base' : 'level'}
		]
	};

	// Add a review page with path, and set 'entry' key to value, if wanted
	guild_battle.setrPage = function(fR, path, entry, value) {
        try {
			var rPage = {
				'path' : path,
				'review' : 0,
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
			//con.log(2,'setrPage',path, entry, value, fR.paths,rPage);
			return false;
        } catch (err) {
            con.error("ERROR in guild_battle.setrPage: " + err);
            return false;
        }
    };

	// Delete all review pages where 'entry' = value
	guild_battle.deleterPage = function(fR, entry, value) {
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
            con.error("ERROR in guild_battle.deleterPage: " + err);
            return false;
        }
    };

	guild_battle.makePath = function(gf, type, i) {
        try {
			if (!$u.isObject(gf) || !$u.isString(type) || !($u.isNumber(i) || $u.isString(i))) {
				con.warn('Invalid guild_battle.makePath input', gf, type, i);
				return false;
			}
			if (gf.name == 'Festival') {
				return gf.basePath + ',clickjq:#' + type + '_team_tab,jq:#' + type + '_guild_battle_section_battle_list,clickjq:#' + type + '_arena_tab_' + i + ',jq:#' + type + '_guild_member_list_' + i;
			}
			return gf.basePath + ',clickimg:' + type + '_guild_off.gif,jq:#' + type + '_guild_tab,clickjq:#' + type + '_new_guild_tab_' + i + ',jq:#' + type + '_guild_member_list_' + i;
        } catch (err) {
            con.error("ERROR in guild_battle.makePath: " + err);
            return false;
        }
    };
	
	guild_battle.setReview = function(gf) {
        try {
			var fR = guild_battle.getItem(gf),
				filter = false;
			['your','enemy'].forEach(function(type) {
				var doPage = !fR.firstScanDone || fR[type].attacks.length;
				for (var i = 1; i <= (gf.name == '10v10' ? 1 : 4); i++) {
					filter = i > 1 || type == 'your';
					guild_battle.setrPage(fR, guild_battle.makePath(gf, type, i), 'filter', filter);
					if (doPage) {
						guild_battle.setrPage(fR, guild_battle.makePath(gf, type, i));
					} else {
						guild_battle.deleterPage(fR, 'path', guild_battle.makePath(gf, type, i));
					}
				}
			});
        } catch (err) {
            con.error("ERROR in guild_battle.setReview: " + err);
            return false;
        }
    };

    guild_battle.load = function() {
        try {
            guild_battle.records = gm.getItem('guild_battle.records', 'default');
            if (guild_battle.records === 'default' || !$j.isArray(guild_battle.records)) {
                guild_battle.records = gm.setItem('guild_battle.records', []);
            }
			//guild_battle.setrPage('tenxten_gb_formation,guildv2_battle');
			//guild_battle.setrPage('index');
			//guild_battle.deleterPage(fR, 'path', 'guildv2_battle');
			//fR.paths = [];
			delete caap.stats.reviewPagesGB;
            session.setItem("guildBattleDashUpdate", true);
            session.setItem("10v10DashUpdate", true);
            con.log(3, "guild_battle.load", guild_battle.records);
            return true;
        } catch (err) {
            con.error("ERROR in guild_battle.load: " + err);
            return false;
        }
    };

    guild_battle.save = function(src) {
        try {
            if (caap.domain.which === 3) {
                caap.messaging.setItem('guild_battle.records', guild_battle.records);
            } else {
                gm.setItem('guild_battle.records', guild_battle.records);
                con.log(3, "guild_battle.save", guild_battle.records);
                if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif") && src !== "caapif") {
                    con.log(2, "guild_battle.save send");
                    caap.messaging.setItem('guild_battle.records', guild_battle.records);
                }
            }

            if (caap.domain.which !== 0) {
                session.setItem("guildBattleDashUpdate", true);
                session.setItem("10v10DashUpdate", true);
            }

            return true;
        } catch (err) {
            con.error("ERROR in guild_battle.save: " + err);
            return false;
        }
    };

    guild_battle.getItem = function(gf) {
        try {
			if (gf === 'winlossRecords') {
				if ($u.hasContent(guild_battle.records[2])) {
					return guild_battle.records[2].data;
				}
				return {};
			}
			if (!$u.isObject(gf) || !$u.isNumber(gf.index)) {
                con.warn("getItem invalid gf", gf);
                throw "Invalid identifying gf!";
            }

			if ($j.isPlainObject(guild_battle.records[gf.index])) {
                con.log(5, "Got guild_battle record #"+gf.index, guild_battle.records[gf.index].data, guild_battle.records, gf);
                return guild_battle.records[gf.index].data;
			}
            var newRecord = new guild_battle.record();
            con.log(5, "New guild_battle record #"+gf.index, newRecord.data, guild_battle.records);
            return newRecord.data;
        } catch (err) {
            con.error("ERROR in guild_battle.getItem: " + err);
            return false;
        }
    };

    guild_battle.setItem = function(gf, record) {
        try {
			if (gf !== 'winlossRecords' && !$u.isNumber(gf.index)) {
				con.warn("setItem invalid gf", gf);
				throw "Invalid identifying gf!";
			}
			var index = $u.setContent(gf.index, 2);

			if (!record || !$j.isPlainObject(record)) {
				throw "Not passed a record";
			}

			guild_battle.records[index] = {};
			guild_battle.records[index].data = record;
			//con.log(2, "Updated guild_battle record #"+index, record, guild_battle.records);

            guild_battle.save();
            return true;
        } catch (err) {
            con.error("ERROR in guild_battle.setItem: " + err);
            return false;
        }
    };

    guild_battle.deleteItem = function(slot) {
        try {
            var it = 0,
                len = 0,
                success = false;

            if (!$u.isNumber(slot) || slot <= 0) {
                con.warn("slot", slot);
                throw "Invalid identifying slot!";
            }

            for (it = 0, len = guild_battle.records.length; it < len; it += 1) {
                if (guild_battle.records[it].slot === slot) {
                    success = true;
                    break;
                }
            }

            if (success) {
                guild_battle.records.splice(it, 1);
                guild_battle.save();
                con.log(3, "Deleted guild_battle record", slot, guild_battle.records);
                return true;
            }

            con.warn("Unable to delete guild_battle record", slot, guild_battle.records);
            return false;
        } catch (err) {
            con.error("ERROR in guild_battle.deleteItem: " + err);
            return false;
        }
    };

    guild_battle.clear = function() {
        try {
            con.log(1, "guild_battle.clear");
            guild_battle.records = [];
            guild_battle.save();
            state.setItem('staminaGuildBattle', 0);
            state.setItem('targetGuildBattle', {});
            session.setItem("guildBattleDashUpdate", true);
            session.setItem("10v10DashUpdate", true);
            return true;
        } catch (err) {
            con.error("ERROR in guild_battle.clear: " + err);
            return false;
        }
    };

	guild_battle.onTop = function(gf) {
        try {
			var fR = guild_battle.getItem(gf),
				nextReview = Date.now(),
				now = new Date(),
				nowUTC = new Date(),
				thenUTC = new Date(),
				text = '',
				remainingTime = 0,
				infoDiv = $j(gf.infoDiv);
				
			if (gf.name == 'Festival') {
		
				var tDate = new Date(),
					next = $u.setContent(infoDiv.children().eq(0).children().eq(0).text(), '').trim().innerTrim(),
					timer = $u.setContent(infoDiv.children().eq(1).children().eq(0).text(), '').trim().innerTrim(),
					tz = $u.setContent(timer.regex(/UTC ([\-+]*?\d+);/), 0),
					ampm = $u.setContent(timer.regex(/\d+:\d+ (AM|PM)/), 'AM'),
					hour = $u.setContent(timer.regex(/(\d+):\d+/), 0),
					start = 0;

				hour = ampm === 'AM' && hour === 12 ? 0 : (ampm === 'PM' ? hour + 12 : hour);
				hour = tz === 0 ? hour : hour - tz;
				hour = hour < 0 ? hour + 24 : (hour > 24 ? hour - 24 : hour);
				tDate.setUTCHours(hour, 0, 0, 0);
				tDate.setUTCDate(tDate.getDate() + (tDate < now ? 1 : 0));
				fR.reviewed = now.getTime();
				//con.log(2, "Festival.checkInfo", next, timer, hour, tz);
				//con.log(2, "When", tDate.toUTCString());

				if (fR.endTime < fR.reviewed) {
					fR.startTime = tDate.getTime();
					fR.endTime = fR.startTime + 3600000;
					schedule.setItem('StartTime', fR.startTime, 20);
					//con.log(2, "New start time");
				}
				tDate.setUTCHours(hour, 0, 0, 0);
				//con.log(2, "Festival battle start time" + $u.makeTime(tDate, caap.timeStr(true)), tDate);
				
				text = next;
				
			} else if (gf.name == '10v10') {
				text=infoDiv.text().trim(); //tenvtenremaining
				con.log(2, gf.name + ' TOP', text, $j('#app_body #tenvtenremaining').attr('value'));
			} else { // GBorFest == guild_battle
				text = $u.setContent(infoDiv.text().trim().innerTrim(), '');
			}

			if (text.indexOf(gf.startText) >= 0) {
				fR.paths = [];
				fR.state = 'Start';
				nextReview += (config.getItem('GB ClassGeneral','Use Current') != 'Use Current' ? -3 : config.getItem('GBwhenTokens',"Never") != 'Never' ? 5: 60) * 60 * 1000;
			} else if (text.indexOf(gf.preGBText) >= 0 || text.indexOf(' MIN') >= 0) {
				fR.paths = [];
				fR.state = 'PreBattle';
			} else if (text.indexOf(gf.activeText) >= 0) {
				if (schedule.since(fR.lastBattleTime, gf.waitHours * 60 * 60)) {
					con.log(2,'Resetting battle data');
					fR = new guild_battle.record().data;					
				}
				fR.state = 'Active';
				nextReview += (config.getItem(gf.abbrev + 'whenTokens',"Never") != 'Never' ? 5: 20) * 60 * 1000;
				guild_battle.setrPage(fR, gf.basePath);
			} else if (text.indexOf(gf.collectText) >= 0) {
				fR.paths = [];
				fR.state = 'Collect';
				//con.log(2,'collect button',gf.waitHours, schedule.since(fR.collectedTime, gf.waitHours * 60 * 60),gf.options, config.getItem('guild_battle_collect',false), gf.options.indexOf(config.getItem('guild_battle_collect',false)));
				
				nowUTC = new Date(now.getTime() +  (now.getTimezoneOffset() / 60 - 8) * 3600000);
				
				// Need to adjust from 7 to 8 when daylight savings time changes
				thenUTC = new Date(fR.lastBattleTime +  (now.getTimezoneOffset() / 60 - 8 + gf.waitHours) * 3600000);
				//con.log(2, 'DATE2 ' + now.getDay(), nowUTC.toLocaleString(), thenUTC.toLocaleString(),!(nowUTC.getDay() == 1 && thenUTC.getDay() == 2));
				if (schedule.since(fR.collectedTime, gf.waitHours * 60 * 60) && config.getItem(gf.abbrev + 'collect',false) && !(nowUTC.getDay() == 1 && thenUTC.getDay() == 2)) {
					guild_battle.setrPage(fR, gf.basePath + ',clickimg:guild_battle_collectbtn_small.gif');
				}
				nextReview = Math.max($u.setContent(fR.lastBattleTime,0) + (gf.waitHours * 60 * 60 - 4 * 60) * 1000, Date.now());
				
			} else {
				con.warn(gf.name + ' Unknown message text', text);
			}

			if (gf.name == 'Festival' && fR.state != 'Active') {
				// guild_battle.setReview(gf);
				hour = fR.state == 'Collect' ? 3 : $u.setContent(text.regex(/(\d+) HOUR/), 0);
				tDate = new Date();
				tDate.setHours(tDate.getHours() + hour%6 + 1, -4, 0, 0);
				fR.startTime = tDate.getTime();
				nextReview = fR.startTime;
				con.log(2, "Festival possible start time", hour, tDate, $u.makeTime(tDate, caap.timeStr(true)));
			} else if (gf.name == '10v10' &&  fR.state != 'Active') {
				remainingTime = $u.setContent($j('#app_body #tenvtenremaining').attr('value'), 0)
				nextReview = now.getTime() + (fR.state == 'Collect' ? 30 * 60 : remainingTime - 4 * 60) * 1000;
				fR.startTime = now.getTime() + (fR.state == 'Collect' ? 10 * 60 : remainingTime - 4 * 60) * 1000;
			}
			

			guild_battle.setItem(gf, fR);

			fR.onTopTime = nextReview;
			//guild_battle.setrPage(fR, gf.page, 'review', nextReview);

			con.log(2, "guild_battle.onTop", gf.name, fR, fR.state, caap.stats.priorityGeneral, new Date(nextReview).toLocaleString());
			return true;

			} catch (err) {
				con.error("ERROR in guild_battle.onTop: " + err);
            return false;
        }
    };
	
	// Parses a string for the key, and adds/multiplies the score by according to the key
	// For example ('cleric', true,  'cleric:+100', [500,100]) would return the score + 100, i.e. 600
	// Default is to add, if */- not present
	// Try/catch not used for performance since function called often
    guild_battle.parse = function(key, tf, text, score) {
		var args = text.match(new RegExp('\\W(!?)' + key + ':(\\D?)([^,]+)'));
		if (args && args.length == 4 && (tf != false) !== (args[1] == '!')) { // Deliberate avoidance of "tf !==" to catch 0 or undefined, etc.
			score[args[2] == '*' ? 0 : 1] += args[2] == '-' ? -args[3].parseFloat() : args[3].parseFloat();
		}
		return score;
    };
	
    guild_battle.target = function(t, total, mR, attack, general, team, tower, tokens) {
        try {
			if (total > t.score) {
				t.tower = tower;
				t.tokens = tokens;
				t.id = mR.target_id;
				t.score = total;
//				t.attack = attack.regex(/duel/) ? 'duel' : attack;
				t.attack = attack;
				t.team = team;
				t.general = general;
				t.name = mR.name;
			}
			return t;
        } catch (err) {
            con.error("ERROR in guild_battle.team: " + err);
            return false;
        }
    };
	
    guild_battle.onBattle = function(gf) {
        try {
            var gate = $j(),
                allowedDiv = $j(),
				memberDivs = $j(),
				member = $j(),
				memberText = '',
				args = [],
				text = '',
				general = '',
				targetIdDiv = $j(),
				fR = guild_battle.getItem(gf), // Fight record
				wlRs = guild_battle.getItem('winlossRecords'), 
				wlR = {},
				mR = new guild_battle.member().data, // member record
				tR = new guild_battle.towerRecord().data, // tower record
                tempDiv = $j(),
                tempTxt = '',
				stunnedClerics = 0,
                collect = false,
				tower = 0,
				which = '',
				n = 0,
                classRegEx = new RegExp("guild_battle_container (\\w*)"),
                toonStatsRegEx = new RegExp("(\\d+)\. (.*) Level: (\\d+) Status: (.*) (.+)/(.+) .*Battle Points: (.*)"),
				gates = $j(),
				tabs = $j(),
				health = $j(),
				healthGuild = $j(),
				healthEnemy = $j(),
				bannerDiv = $j(),
				collectDiv = $j(),
				enterDiv = $j(),
				tokenSpan = $j(),
				timerSpan = $j(),
				resultBody = $j(),
				winImgDiv = $j(),
				lossImgDiv = $j(),
				myStatsTxt = '',
				index = 0,
				lastMove = '',
				tStr = '',
				tNum = 0,
				maxDamage = 0,
				maxTower = 0,
				wlid = '',
				resultsTxt = '',
				score = [],
				towerPops = [],
				sealedTowers = 0,
				total = 0,
				notStarted = '',
				isMe = false,
				wl = false,
				notMyBattle = '',
				battleOver = '',
				now = Date.now(),
				deltaTime = 0,
				timeStamp = 0,
				scoring = config.getItem('guild_battle_scoring',''),
				sealScore = [0,0],
				tempScore = [0, 0],
				sealCheck = false,
				fullText = '';

			guild_battle.setrPage(fR, gf.basePath, 'review', Date.now());
            caap.chatLink("#app_body #guild_war_chat_log div[style*='border-bottom: 1px'] div[style*='font-size: 15px']");
            bannerDiv = $j("#globalContainer #" + gf.bannerDiv);
			myStatsTxt = $u.setContent(bannerDiv.text().trim().innerTrim(), '');
			notStarted = myStatsTxt.regex(/(This Battle Has Not Started Yet)/);
			notMyBattle = myStatsTxt.regex(/(You Are Not A Part Of This .*Battle)/);
			battleOver = myStatsTxt.regex(/(Battle Is Over)/i) || myStatsTxt.regex(/(Have Your Guild Master And Officers To Initiate More)/);
			//con.log(2, gf.name + " battle screen arena_battle_banner_section", myStatsTxt, notStarted, notMyBattle, battleOver);
			if (notMyBattle) {
				return true;
			}

			wlid = $u.setContent($j("#globalContainer #results_main_wrapper input[name='target_id']").attr('value'), false);
			text = $j("#globalContainer #results_main_wrapper").text();
			//con.log(2,'Pre Results',wlid, text, text.regex(/\+(\d+) Battle Activity Points/), tNum, wlR, wlRs);
			if (wlid && text && text !== '') {
				if (!$u.isObject(wlRs[wlid])) {
					wlRs[wlid] = new guild_battle.wlRecord().data;
				}
				wlR = wlRs[wlid];
				tNum = $u.setContent(text.regex(/\+(\d+) Battle Activity Points/),0);

				if (tNum == 50) {
					con.log(1, "You were polymorphed or confused", wlid, text, tNum, wlR, wlRs);
				} else if (text.regex(/(Your target is freed from polymorph!)/i)) {
					con.log(1, "Victory against polymorphed enemy", wlid, text, tNum, wlR, wlRs);
				} else {
					lastMove = $u.setContent(text.regex(/(\w+) (VICTORY|DEFEAT)!/), []);
					lastMove = lastMove.indexOf('POLYMORPH') >=0 ? 'poly' : lastMove.indexOf('CONFUSE') >=0 ? 'confuse' : tNum == 135 ? 'heal' : 'duel';
					if (tNum == 100) {
						con.log(1, lastMove + " Defeated by enemy", wlid, text, tNum, wlR, wlRs);
						wlR[lastMove].losses += 1;
					} else if (tNum == 135) {
						if ($u.hasContent($j("#globalContainer #results_main_wrapper").find('div[style*="color:#ffdb59"]'))) {
							con.log(1, "Victory against ally", wlid, text, tNum, wlR, wlRs);
							wlR[lastMove].wins += 1;
						} else { 
							con.log(1, "Defeat against ally", wlid, text, tNum, wlR, wlRs);
							wlR[lastMove].losses += 1;
						}
					} else if (tNum > 100) {
						con.log(1, lastMove + " Victory against enemy", wlid, text, tNum, wlR, wlRs);
						wlR[lastMove].wins += 1;
					} else {
						con.warn('Unknown battlepoint count', wlid, text, tNum, wlR, wlRs);
					}
					wlR[lastMove].total = wlR[lastMove].wins + wlR[lastMove].losses;
					guild_battle.setItem('winlossRecords', wlRs);
				}
			} else {
				text = $j("#globalContainer div[class='results']").text();
				if (text.regex(/(You do not have enough battle tokens for this action)/i)) {
					con.log(1, "You didn't have enough battle tokens");
				} else if (text.regex(/(does not have any health left to battle)/i)) {
					con.log(1, "Enemy had no health left");
				} else if (text.regex(/(You tried to attack but tripped while running)/i)) {
					con.log(1, "Oops, you tripped");
				} else if (text.regex(/(is stunned and cannot)/i)) {
					con.log(1, "Ally is stunned");
				} else if (text !== '') {
					con.log(1, "Unknown win or loss or result", text);
				}
			}

			if (battleOver) {
				if (caap.hasImage('guild_battle_collectbtn_small.gif')) {
					fR.state = 'Collect';
				} else {
					fR.collectedTime = Date.now();
					fR.paths = [];
				}
				fR.state = fR.state == 'Active' ? 'PreBattle' : fR.state;
				guild_battle.setItem(gf, fR);
				return true;
			}
							
			if (caap.hasImage(gf.enterButton)) {
				//con.log(2, 'Battle has enter button', config.getItem('guild_battle_enter',false));
				if (config.getItem(gf.abbrev + 'whenTokens','Never') != 'Never' && caap.stats.stamina.num >= 20) {
					fR.paths = [];
					guild_battle.setrPage(fR, gf.basePath + ',clickimg:' + gf.enterButton);
				}
				guild_battle.setItem(gf, fR);
				return true;
			}

			fR.lastBattleTime = Date.now();
			//con.log(2, 'Enter button cleared');

			if (config.getItem(gf.abbrev + 'whenTokens','Never') !== 'Never') {
				guild_battle.setReview(gf);
			}
			

			text = $u.setContent($j("#monsterTicker").text().trim(),'');
            fR.endTime = Date.now() + text.parseTimer() * 1000;

            myStatsTxt = $u.setContent(bannerDiv.text().trim().innerTrim(), '');
			args = myStatsTxt.match(new RegExp("(.+) Level: (\\d+) Class: (.+) Health: (\\d+)/(\\d+).+Status: (.+) .* Activity Points: (\\d+)"));
			if (args && args.length === 8) {
				//con.log(2, "my stats", args, myStatsTxt);
				fR.me.mclass = args[3].toLowerCase();
				fR.me.status = args[6] ? args[6].trim() : '';
				fR.me.healthNum = args[4] ? args[4].parseInt() : 0;
				fR.me.healthMax = args[5] ? args[5].parseInt() : 1;
				fR.me.battlePoints = args[7] ? args[7].parseInt() : 0;
				fR.me.percent = ((mR.healthNum / mR.healthMax) * 100).dp(2);
				//con.log(2, 'myRecord', mR);
			} else if (myStatsTxt.indexOf('Battle Has Not Started') >= 0) {
				// Wait retry until started
				return true;
			} else {
				con.warn("args error", args, myStatsTxt);
			}
			fR.me.shout = $u.hasContent($j("img[src*='effect_shout']", bannerDiv)) ? true : false;
			//con.log(2,'Do I have Shout? ' + fR.me.shout);

			tokenSpan = $j("#globalContainer span[id='guild_token_current_value']");
			tStr = $u.hasContent(tokenSpan) ? tokenSpan.text().trim() : '';
			fR.tokens = tStr ? tStr.parseInt() : 0;

			timerSpan = $j("#globalContainer span[id='guild_token_time_value']");
			tStr = $u.hasContent(timerSpan) ? timerSpan.text().trim() : '';
			fR.tokenTime = tStr ? tStr.regex(/(\d+:\d+)/) : '0:00';
			//con.log(5,'Tokens', fR.tokens);
			
			health = $j("#guild_battle_health");
			if (health && health.length) {
				healthEnemy = $j("div[style*='guild_battle_bar_enemy.gif']", health).eq(0);
				if ($u.hasContent(healthEnemy)) {
					fR.enemyHealth = (100 - healthEnemy.getPercent('width')).dp(2);
				} else {
					con.warn("guild_battle_bar_enemy.gif not found");
				}

				healthGuild = $j("div[style*='guild_battle_bar_you.gif']", health).eq(0);
				if ($u.hasContent(healthGuild)) {
					fR.guildHealth = (100 - healthGuild.getPercent('width')).dp(2);
				} else {
					con.warn("guild_battle_bar_you.gif not found");
				}

				tempDiv = $j("span", health);
				if ($u.hasContent(tempDiv) && tempDiv.length === 2) {
					tempTxt = tempDiv.eq(0).text().trim();
					tempDiv.eq(0).text(tempTxt + " (" + fR.guildHealth + "%)");
					tempTxt = tempDiv.eq(1).text().trim();
					tempDiv.eq(1).text(tempTxt + " (" + fR.enemyHealth + "%)");
				}
			} else {
				con.warn("guild_battle_health error");
			}
			
			gate = $j("div[id*='_guild_member_list_']");
			tower = gate.attr('id').match(/_guild_member_list_(\d)/)[1];
			which = gate.attr('id').match(/(\w+)_guild_member_list_(\d)/)[1];
			guild_battle.setrPage(fR, guild_battle.makePath(gf, which, tower), 'review', Date.now());
			//con.log(2,'Gate ID',gate.attr('id'),tower, which, fR.paths);

			towerPops = $j("#globalContainer div[id*='" + which + gf.tabs + "']").map(function() {
				return this.innerText.match(/(\d+)/)[1];
			}).get();
			['1','2','3','4'].forEach(function(stower) {
				sealedTowers += $u.hasContent(fR[which].towers[stower]) ? fR[which].towers[stower].clericHealthNum == 0 : towerPops[stower - 1] > 0;
			});
			// easy if only 1 unsealed tower left or 2 unsealed and winning by over 20%
			if (which == 'your') {
				con.log(2,' IN TOWER');
				fR.simtis = !$u.isString(fR.me.tower) ? false : towerPops[fR.me.tower - 1] < fR.your.towers[fR.me.tower].players;
			} else {
				fR.easy = (sealedTowers + (fR.guildHealth > fR.enemyHealth + 20)) > 2;
				//con.log(2,'EASY',fR.easy, sealedTowers + (fR.guildHealth > fR.enemyHealth + 20), sealedTowers, towerPops);
			}
			
			wl = fR.guildHealth > fR.enemyHealth + 20 || fR.enemyHealth > fR.guildHealth + 20;
			
			//con.log(2,'SIMTIS',fR.simtis,fR.easy,$u.isString(fR.me.tower),fR.me.tower, towerPops, towerPops[(fR.me.tower || 1) - 1]);
			if (!gate) {
				con.warn("No gates found");
			} else {
				con.log(2,'Gate', which, tower);
				memberDivs = gate.children("div[style*='height']");
				con.log(2,'Members found',memberDivs.length,memberDivs);


				for (var n = 1; n <= 25; n += 1) {
					delete fR[which].members[tower + '-' + n];
					if (!memberDivs || !memberDivs.length || !memberDivs[n-1]) {
						//con.log(2, "No member found", tower, n);
						continue;
					}
					member = $j(memberDivs[n-1]);
					mR = new guild_battle.member().data;
//					text = (which == 'enemy' ? 'basic_' : 'special_defense_') + tower + '_';
					text = 'action_panel_';
					targetIdDiv = member.find('div[class^="' + text + '"]').eq(0);
					if (targetIdDiv && targetIdDiv.length) {
						//con.log(2,"Target_id for member", targetIdDiv.attr('id'), targetIdDiv);
						mR.target_id = targetIdDiv.attr('class').replace(text,'');
						//con.log(2,"Target_id for member", mR.target_id, targetIdDiv.attr('id'), targetIdDiv);
					} else {
						mR.target_id = 0;
						//con.log(2, "Unable to find target_id for member", tower, n, member, targetIdDiv);
					}

					memberText = member.children().text();
					memberText = memberText ? memberText.trim().innerTrim() : '';
					//con.log(2, 'memberText', memberText);
					args = memberText.match(toonStatsRegEx);
					//con.log(2, 'member args', args);
					if (args && args.length === 8) {
						// mR.position = args[1] || '';
						//mR.mclass = member.children().attr('class').match(classRegEx)[1];
						mR.mclass = $j("img[src*='class_']", member).attr("title").match(/(\w+)/)[1].toLowerCase();
						//con.log(2, "Class", mR.mclass);
						tR.clerics += mR.mclass == 'cleric' ? 1 : 0;
						mR.points = $u.setContent($j("img[src*='guild_bp_']", member).attr("title").match(/(\d+)/)[1],160);
						mR.name = args[2] || '';
						mR.level = args[3] ? args[3].parseInt() : 0;
						mR.status = args[4] || '';
						mR.healthNum = args[5] ? args[5].parseInt() : 0;
						mR.healthMax = args[6] ? args[6].parseInt() : 1;
						mR.battlePoints = args[7] ? args[7].parseInt() : 0;
						mR.percent = ((mR.healthNum / mR.healthMax) * 100).dp(2);

						['duel', 'poly','confuse'].forEach(function(awin) {
							var api = (awin == 'confuse' ? 1.5 : awin == 'poly' ? 1.25 : 1) * caap.stats.bonus.api,
								numerator = 0,
								denominator = 0,
								winChance = Math.min((api / mR.level / 10 * 100).dp(1),100);
							wlR = wlRs[mR.target_id];
							if (mR.poly) {
								mR.metrics[awin] = 100;
							} else if ($u.hasContent(wlR) && $u.hasContent(wlR[awin]) && $u.isDefined(wlR[awin].total)) {
								var numerator = wlR.duel.wins + (awin != 'duel' ? wlR.poly.wins : 0) + (awin == 'confuse' ? wlR.confuse.wins : 0);
								var denominator = awin == 'confuse' ? wlR.confuse.total +  wlR.poly.wins +  wlR.duel.wins : awin == 'poly' ? wlR.confuse.losses +  wlR.poly.total +  wlR.duel.wins : wlR.confuse.losses +  wlR.poly.losses +  wlR.duel.total;
								mR.metrics[awin] = ((winChance * 0.5 / 100 + numerator) / (0.5 + denominator) * 100).dp(1);
							} else {
								mR.metrics[awin] = winChance;
							}
						});
						mR.winChance = mR.metrics.duel;
						mR.metrics.damage = Math.atan((mR.healthMax - mR.healthNum)/1000)/Math.PI*2*100;
						mR.metrics.level = Math.atan(mR.level/1000)/Math.PI*2*100;
						mR.metrics.rhealth = 100 - Math.atan(Math.max(mR.healthNum - gf.minHealth, 0)/1000)/Math.PI*2*100;
						
						if (mR.target_id && wlid == mR.target_id) {
							wlRs[wlid].level = mR.level;
							wlRs[wlid].name = mR.name;
						}

						//con.log(2, 'Member Record', mR);
						tR.players += 1;
						tR.actives += mR.battlePoints > 0 ? 1 : 0;
						tR.AC += (mR.battlePoints > 0 && mR.mclass == 'cleric') ? 1 : 0;
						stunnedClerics += (mR.status == 'Stunned' && mR.mclass == 'cleric') ? 1 : 0;
						tR.clericHealthNum += mR.mclass == 'cleric' ? mR.healthNum : 0;
						tR.clericHealthMax += mR.mclass == 'cleric' ? mR.healthMax : 0;
						isMe = which == 'your' && mR.name == caap.stats.PlayerName && mR.level == caap.stats.level;
						if (isMe) {
							fR.me.tower = tower;
						}
						
						timeStamp = Date.now();

						guild_battle[which][fR.me.mclass].forEach(function(att) {
							args = ' '.concat(scoring).match(new RegExp("\\W" + att.name + "(\\[.*?)\\]"));
							//con.log(2,'scoring match attack', scoring, args, att.name);
							if (!args || args.length == 0 || ($u.isBoolean(att.self) && att.self !== isMe)) {
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
								var key = text.replace(/:.*/,'').replace('!',''),
									tf = false;
								switch (key) {
									case 'base' : 		tf = true;															break;
									case 'cleric' : 	
									case 'rogue' :		
									case 'warrior' : 	
									case 'mage' : 		tf = key == mR.mclass; 												break;
									case 't1' : 	
									case 't2' : 	
									case 't3' : 	
									case 't4' : 		tf = tower == key.numberOnly(); 									break;
									case 'poly' : 		tf = $u.hasContent($j("img[src*='polymorph_effect']", member)); 	break;
									case 'poison' : 	tf = $u.hasContent($j("img[src*='effect_poison']", member)); 		break;
									case 'confuse' : 	tf = $u.hasContent($j("img[src*='effect_confuse']", member)); 		break;
									case 'guardian' : 	tf = $u.hasContent($j("img[src*='ability_sentinel']", member)); 	break;
									case 'revive' : 	tf = $u.hasContent($j("img[src*='effect_revive']", member)); 		break;
									case 'shout' : 		tf = $u.hasContent($j("img[src*='effect_shout']", member)); 		break;
									case 'confidence' : tf = $u.hasContent($j("img[src*='effect_confidence']", member)); 	break;
									case 'fortify' : 	tf = $u.hasContent($j("img[src*='effect_fort']", member)); 			break;
									case 'smokebomb' : 	tf = $u.hasContent($j("img[src*='effect_smoke']", member)); 		break;
									case 'me' : 		tf = isMe; 															break;
									case 'active' : 	tf = mR.battlePoints; 												break;
									case 'bs' : 		tf = mR.healthNum == mR.healthMax; 									break;
									case 'healed' : 	tf = mR.healthMax - mR.healthNum < 300; 							break;
									case 'festival' : 	
									case 'classic' : 	
									case '10v10' : 		tf = gf.label == key;		 										break;
									case 'easy' : 		tf = fR.easy; 														break;
									case 'easyc' : 		tf = fR.easy && mR.mclass == 'cleric'; 								break;
									case 'simtis' : 	tf = fR.simtis; 													break;
									case mR.target_id : tf = true; 															break;
									case 'unstunned' : 	tf = mR.healthNum > 200; 											break;
									case 'meshout' : 	tf = fR.me.shout; 													break;
									case 'afflicted' : 	
										tf = $u.hasContent($j("img[src*='polymorph_effect']", member)) || $u.hasContent($j("img[src*='effect_poison']", member)) || $u.hasContent($j("img[src*='effect_confuse']", member)); 	break;
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
								//con.log(2, 'CHACKING SCORE ENTREIS', mR.name, key, text, args, tf, sealCheck);
								
								// Deliberate avoidance of "tf !==" to catch 0 or undefined, etc.
								if (args && args.length == 5 && (tf != false) !== (args[1] == '!')) { 
									score[args[2] == '*' ? 0 : 1] += args[3] == '-' ? -args[4].parseFloat() : args[4].parseFloat();
								}
								
								if (sealCheck == true) {
									sealCheck = args[1] == '!' ? 'normal' : 'seal';
									sealScore = [score[0] - sealScore[0], score[1] - sealScore[1]];
									score = [score[0] - sealScore[0], score[1] - sealScore[1]];
									//con.log(2, 'SEALSCORE', att.name, text, sealScore, score, sealCheck);
								}
							});

							mR.scores[att.name] = {};
							tempScore = [score[0], score[1]];
							['normal','seal'].forEach(function(seal) {
								score = seal == sealCheck ? [tempScore[0] + sealScore[0], tempScore[1] + sealScore[1]] : [tempScore[0], tempScore[1]];
								total = score[0] * mR.metrics[att.base] + score[1];
								total = mR.healthNum >= (which == 'your' ? gf.minHealth : 1) ? total.dp(2) : 0;
								//con.log(2,'RECORD CHECK ' + seal, sealCheck, sealScore, score, total, att.base, mR.metrics[att.base]);
								mR.scores[att.name][seal] = total;
								general = fullText.match(new RegExp("@[^,]+"));
								general = general && general.length > 0 ? general[0] : '@Use Current';
								tR[seal].unstunned = guild_battle.target(tR[seal].unstunned, total, mR, att.image || att.name, general, which, tower, $u.setContent(att.tokens, 1));
								if (which == 'enemy' && att.name.regex(/duel/)) {
									tR[seal].stunned = guild_battle.target(tR[seal].stunned, total, mR, att.image || att.name, general, which, tower, $u.setContent(att.tokens, 1));
								}
							});

						});
							
						deltaTime += Date.now() - timeStamp;
						fR[which].members[tower + '-' + n] = mR;
						
					} else {
						con.warn("Unable to read member stats",tower, n, args);
					}
				}
			}
			tR.clericDamage = tR.clericHealthMax - tR.clericHealthNum;
			tR.clericLife = tR.clerics ? (tR.clericHealthNum/tR.clericHealthMax * 100).dp(1) : 100.0;
			fR.firstScanDone = true;
			fR[which].towers[tower] = tR;

			['your','enemy'].forEach(function(fwhich) {
				maxDamage = 0;
				maxTower = 0;
				['1','2','3','4'].forEach(function(fTower) {
					tR = fR[fwhich].towers[fTower];
					if ($u.isObject(tR)) {
						if ($u.isNumber(tR.clericDamage) && tR.clericDamage > maxDamage + 1000 && tR.clericHealthNum > 0) {
							maxDamage = tR.clericDamage;
							maxTower = fTower;
						}
					} else {
						fR.firstScanDone = false;
					}
				});
				fR[fwhich].seal = maxTower;
			});
			
			timeStamp = (Date.now() - now)/1000;
			
			con.log(2, "Current Record", fR, sealedTowers, fR.easy, fR.simtis, timeStamp, deltaTime/1000, deltaTime/timeStamp/1000*100);
			guild_battle.setItem(gf, fR);
			session.setItem(gf.label + "DashUpdate", true);
            caap.updateDashboard(true);
			if (collect) {
				caap.click(collectDiv);
			}
            return true;
        } catch (err) {
            con.error("ERROR in guild_battle.onBattle: " + err);
            return false;
        }
    };

    guild_battle.getReview = function() {
        try {
            var it = 0,
                len = 0;

            for (it = 0, len = guild_battle.records.length; it < len; it += 1) {
                if (guild_battle.records[it].state !== 'Completed') {
                    if (schedule.since(guild_battle.records[it].reviewed, 30 * 60)) {
                        break;
                    }
                }
            }

            return guild_battle.records[it];
        } catch (err) {
            con.error("ERROR in guild_battle.getReview: " + err);
            return undefined;
        }
    };

	guild_battle.weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

	guild_battle.work = function (gf) {
		try {
			var fRecord = guild_battle.getItem(guild_battle.gf.festival),
				gRecord = guild_battle.getItem(guild_battle.gf.guild_battle),
				tRecord = guild_battle.getItem(guild_battle.gf.tenVten),
				tStartTime = $u.setContent(tRecord.startTime, 0),
				fR = guild_battle.getItem(gf),
				paths = [{'path' : gf.onTopPath, 'review' : $u.setContent(fR.onTopTime, 0)}].concat($u.setContent(fR.paths, [])),
				timeBattlesList = config.getList('timed_guild_battles', ''),
				whenTokens = config.getItem(gf.abbrev + 'whenTokens', 'Never'),
				tokenMax = config.getItem(gf.abbrev + 'max', 10),
				begin = new Date(),
				end = new Date(),
				timeString = '',
				result = '',
				button = '',
				priority = false,
				wait = false,
				stun = false,
				burnTokens = false,
				doAttack = false,
				teams = [],
				pgO = {},
				button = null,
				towers = ['1','2','3','4'],
				t = { 'score' : 0, 'tokens' : 1 },
				timedSetting = config.getItem('WhenGuildBattle', ''),
				match = (timedSetting === 'Battle available') ? true : false,
				now = new Date();
			
			if (schedule.since($u.setContent(fRecord.startTime, 0), 1 * 60) && !schedule.since($u.setContent(fRecord.startTime, 0), 4* 60)) {
				caap.stats.priorityGeneral = config.getItem('Fest ClassGeneral','Use Current') == 'Use Current' ? 'Use Current' : config.getItem('Fest ClassGeneral','Use Current');
			}
			if (caap.stats.priorityGeneral == 'Use Current' && schedule.since(tStartTime, -8 * 60) && !schedule.since(tStartTime, -0 * 60) && schedule.since(tRecord.lastBattleTime, 30 * 60)) {
				caap.stats.priorityGeneral = config.getItem('10v10 ClassGeneral','Use Current') == 'Use Current' ? 'Use Current' : config.getItem('10v10 ClassGeneral','Use Current');
			}
			if (caap.stats.priorityGeneral == 'Use Current' && gRecord.state == 'PreBattle') {
				caap.stats.priorityGeneral = config.getItem('GB ClassGeneral','Use Current') == 'Use Current' ? 'Use Current' : config.getItem('GB ClassGeneral','Use Current');
			}
			if (caap.stats.priorityGeneral != 'Use Current') {
				con.log(2,gf.abbrev + ' PREBATTLE general',caap.stats.priorityGeneral);
				if (general.selectSpecific(caap.stats.priorityGeneral)) {
					return true;
				}
			}

			if (fRecord.state == 'Active' || gRecord.state == 'Active' || tRecord.state == 'Active') {
				caap.stats.battleIdle = config.getItem('GB Fest IdleGeneral','Use Current') == 'Use Current' ? 'Use Current' : config.getItem('GB Fest IdleGeneral','Use Current');
			} else {
				caap.stats.battleIdle = 'Use Current';
			}

			// Work around for faulty storage of caap.stats
			if (caap.stats.indicators.api == 0 && caap.stats.level > 10) {
				return caap.navigateTo('keep');
			}

			priority = schedule.since(fR.endTime, -8 * 60 ) || fR.guildHealth < 10;
			fR.burn = fR.tokens <= config.getItem(gf.abbrev + 'min', 0) ? false :  fR.burn || (whenTokens == 'Between Max/Min' && fR.tokens > tokenMax);
			stun = fR.me.healthNum <= gf.minHealth ? 'stunned' : 'unstunned';
			wait = stun == 'stunned' || fR.me.poly || (fR.me.confuse && fR.your.attacks.indexOf('cleanse') < 0 && fR.your.attacks.indexOf('dispel') < 0);
			burnTokens =  priority ? true : wait ? false : fR.burn;
			doAttack = fR.state == 'Active' && fR.tokens > (burnTokens ? 0 : Math.max(wait ? (caap.hyper ? 5 : 7) : 0, tokenMax));
			
			//con.log(2, 'GUILD ' + gf.name, fR, $u.makeTime(fR.onTopTime, caap.timeStr(true)), $u.makeTime(fR.lastBattleTime, caap.timeStr(true)));
			
            for (i = 0; i < paths.length; i++) {
				pgO = paths[i];
				//con.log(2, 'PATH REVIEW', gf.name, pgO.path, fR.paths);
                if (schedule.since(pgO.review, 5 * 60) && (!fR.firstScanDone || !pgO.filter || doAttack)) {
					con.log(2,'Reviewing battle page',pgO.path, fR.paths);
					if (caap.stats.priorityGeneral == 'Use Current' && general.Select(caap.stats.battleIdle)) {
						return true;
					}
					result = caap.navigate2(pgO.path);
					if (result == 'fail') {
						guild_battle.deleterPage(fR, 'path', pgO.path);
					} else if (result) {
						return true;
					} else {
						con.log(2, 'Loading keep page to force page reload', pgO.path, result);
						return caap.navigateTo('keep');
					}
				}
            }
			//con.log(2,'GUILD REVIEW PAGES', gf.name, paths);
			
			//con.log(2,'pre ATTACK!',doAttack, whenTokens, fR.tokens > tokenMax, fR.state, fR.me.healthNum > gf.minHealth);
			if (whenTokens !== 'Never' && caap.stats.priorityGeneral == 'Use Current') {
				
				if (doAttack) {
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
				
					if (t.score === 0) {
						con.log(2, gf.name + ': No valid target to attack', fR);
						return false;
					}
					
					caap.setDivContent(gf.mess, 'Tokens ' + fR.tokens + ' ' + t.attack + ' on ' + t.team + ' T' + t.tower + ' ' + t.name);
					con.log(2,  'Tokens ' + fR.tokens + ' ' + t.attack + ' on ' + t.team + ' T' + t.tower + ' ' + t.name, t);
//					button = t.attack == 'duel' ? 'basic_' : t.team == 'your' ? 'special_defense_' : 'special_';
					button = 'special_action';
					result = caap.navigate2(t.general + ',' + guild_battle.makePath(gf, t.team, t.tower) + ',clickjq:.action_panel_' + t.id + ' input[src*="' + t.attack + '.jpg"]');
					if (result == 'fail') {
						con.warn('Unable to complete path. Reloading page.', general.GetCurrentGeneral(), general.GetCurrentLoadout());
						return caap.navigate2(guild_battle.makePath(gf, t.team == 'enemy' ? 'your' : 'enemy', t.tower));
					}
					return result;
				}
			}
				
			if (timedSetting=='Never' || gRecord.state !== 'Start') {
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
				for (var i = 0; i < guild_battle.weekdays.length; i++) {
					if (timeString.indexOf(guild_battle.weekdays[i])>=0) {
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
				caap.stats.priorityGeneral = config.getItem('GB ClassGeneral','Use Current') == 'Use Current' ? 'Use Current' : config.getItem('GB ClassGeneral','Use Current');
				if (general.selectSpecific(caap.stats.priorityGeneral)) {
					return true;
				}
				if (caap.navigate2('tenxten_gb_formation,guildv2_battle')) {
					return true;
				}
				button = caap.checkForImage('sort_btn_startbattle.gif');
				if ($u.hasContent(button)) {
					con.log(1, 'CLICK GUILD BATTLE START');
					return caap.click(button);
				}
			}

			//con.log(5, 'No time match to current time', now);
			return false;
        } catch (err) {
            con.error("ERROR in guild_battle.work: " + err, gf.name);
            return false;
        }
    };

    guild_battle.menu = function() {
        try {
            // Guild Battle controls
            var gbattleList = ['Battle available', 'At fixed times', 'Never'],
				gbattleOptions = ['Both', 'Guild Battles', 'Festival', 'Never'],
                gbattleInst = [
                    'Battle available will initiate a guild battle whenever the Start Button is available',
                    'At fixed times will allow you to set a schedule of when to start battles',
                    'Never - disables starting guild battles'
                ],
                tokenList = ['Over', 'Between Max/Min', 'Never'],
                tokenInst = [
                    'Over - join battles and attack whenever your tokens are over the max',
                    'Between Max/Min - join battles and burn tokens once over max until just over min',
                    'Never - disables attacking in this battle'],
				tokenRange = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
				timed_guild_battles_inst = "List of times when Guild Battles should be started, such as 'Mon 1, Tue 15:30, Wed 8 PM, etc.  Guild battle will be attempted to be started at the listed time and up to two hours after.",
				guild_battle_scoring_inst = "List of score adjustments to pick targets",
                htmlCode = '';

            htmlCode += caap.startToggle('GuildBattles', 'GUILD BATTLES');

			[guild_battle.gf.guild_battle.abbrev,guild_battle.gf.festival.abbrev,guild_battle.gf.tenVten.abbrev].forEach(function(t) {
				htmlCode += caap.makeDropDownTR(t + " Use tokens", t + 'whenTokens', tokenList, tokenInst, '', 'Never', false, false, 62);
				htmlCode += caap.startDropHide(t + 'whenTokens','', 'Never', true);
				htmlCode += caap.makeDropDownTR(t + " Max", t + 'max', tokenRange, [], '', '8', false, false, 62);
				htmlCode += caap.startDropHide(t + 'whenTokens', 'Burn', 'Between Max/Min', false);
				htmlCode += caap.makeDropDownTR(t + " Min", t + 'min', tokenRange, [], '', '0', false, false, 62);
				htmlCode += caap.endDropHide(t + 'whenTokens', 'Burn', 'Between Max/Min', false);
				htmlCode += caap.endDropHide(t + 'whenTokens','', 'Never', true);
				htmlCode += caap.makeCheckTR(t + " Auto-collect", t + 'collect', false, 'Auto-collect when these battles finish');
			});

            htmlCode += caap.makeTD("Rate targets by: <a href='http://caaplayer.freeforums.org/viewtopic.php?f=9&t=830' target='_blank' style='color: blue'>(INFO)</a>");
            htmlCode += caap.makeTextBox('guild_battle_scoring', guild_battle_scoring_inst, 'cduel[],mduel[],wduel[],rduel[]', '');
            htmlCode += caap.makeDropDownTR("Start Guild Battles when", 'WhenGuildBattle', gbattleList, gbattleInst, '', 'Never', false, false, 62);
            htmlCode += caap.startDropHide('WhenGuildBattle', '', 'Never', true);
            htmlCode += caap.startDropHide('WhenGuildBattle', 'FixedTimes', 'At fixed times', false);
            htmlCode += caap.makeTD("Start Guild Battles at these times:");
            htmlCode += caap.makeTextBox('timed_guild_battles', timed_guild_battles_inst, '', '');
            htmlCode += caap.endDropHide('WhenGuildBattle', 'FixedTimes');
			htmlCode += caap.endDropHide('WhenGuildBattle');
            config.setItem('enableSpider', false);
            htmlCode += caap.endToggle;
            return htmlCode;
        } catch (err) {
            con.error("ERROR in guild_battle.menu: " + err);
            return '';
        }
    };

    guild_battle.dashboard = function() {
		guild_battle.dashboardWork(guild_battle.gf.guild_battle);
		guild_battle.dashboardWork(guild_battle.gf.tenVten);
	};

    guild_battle.dashboardWork = function(gf) {
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
					fR = guild_battle.getItem(gf),
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
						towerHtml += 'Tower ' + pp + ' #' + tower.players + '  Act: ' + tower.actives + ' Clr: ' + tower.clerics + ' AC: ' + tower.AC + ' Cleric Life%: ' + tower.clericLife + '<br>';
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
								text: '<a href="' + caap.domain.altered + '/guild_battle_battle.php?twt2=' + guild_battle.info[fR.name].twt2 + '&guild_id=' + fR.guildId +
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
								visitBattleLink.mname = e.target.attributes[i].nodeValue;
							} else if (e.target.attributes[i].nodeName === 'rlink') {
								visitBattleLink.arlink = e.target.attributes[i].nodeValue;
							}
						}

						// caap.clickAjaxLinkSend(visitBattleLink.arlink);
						guild_battle.path = visitBattleLink.arlink;
						//con.log(2,'battle path set',guild_battle.path);
					};

					$j("span[id*='caap_" + which + gf.label + "_']", caap.caapTopObject).off('click', handler).on('click', handler);
					handler = null;
				});

                session.setItem(gf.label + "DashUpdate", false);
            }

            return true;
        } catch (err) {
            con.error("ERROR in guild_battle.dashboard: " + err);
            return false;
        }
    };

}());
