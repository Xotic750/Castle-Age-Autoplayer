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
//            'slot': 0,
            'ticker': '',
			'collectedTime' : 0,
			'lastBattleTime' : 0,
			'endTime' : 0,
			'seal' : '0',
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
			'page' : 'festival_battle_home',
			'token' : 'festivalTokens',
			'options' : ['Festival','Both'],
			'bannerDiv' : 'arena_battle_banner_section',
			'enterButton' : 'guild_enter_battle_button.gif',
			'index' : 1,
			'infoDiv' : '#app_body #current_battle_info',
			'waitHours' : 3,
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
			'page' : 'guildv2_battle',
			'token' : 'guildBattleTokens',
			'options' : ['Guild Battles','Both'],
			'bannerDiv' : 'guild_battle_banner_section',
			'enterButton' : 'guild_enter_battle_button2.gif',
			'index' : 0,
			'infoDiv' : '#app_body #guildv2_battle_middle',
			'IDDiv' : 'special_defense_',
			'waitHours' : 9,
			'minHealth' : 1,
			'basePath' : 'guildv2_battle,clickimg:sort_btn_joinbattle.gif,guild_battle',
			'startText' : 'submit the Guild for Auto-Matching',
			'preGBText' : 'Auto-Match in Progress',
			'activeText' : 'Time Remaining',
			'collectText' : 'JOIN NOW!'
		}
	};
	
	guild_battle.enemy = {
		'Mage' : [
			{'name': 'mduel',
			'base' : 'duel'},
			{'name': 'poly',
			'base' : 'poly'},
			{'name': 'confuse',
			'base' : 'confuse'}
		],
		'Rogue' : [
			{'name': 'rduel',
			'base' : 'duel'},
			{'name': 'poison',
			'base' : 'duel'}
		],
		'Warrior' : [
			{'name': 'wduel',
			'base' : 'duel'},
			{'name': 'whirlwind',
			'base' : 'duel'}
		],
		'Cleric' : [
			{'name': 'cduel',
			'base' : 'duel'}
		]
	};

	guild_battle.your = {
		'Mage' : [],
		'Rogue' : [
			{'name': 'smokebomb',
			'self': false,
			'base' : 'level'}
		],
		'Warrior' : [
			{'name': 'guardian',
			'self': false,
			'base' : 'level'},
			{'name' : 'sentinel',
			'base' : 'level'}
		],
		'Cleric' : [
			{'name': 'revive',
			'base' : 'rhealth'},
			{'name' : 'heal',
			'base' : 'damage'},
			{'name' : 'fortify',
			'base' : 'level'},
			{'name' : 'cleanse',
			'base' : 'level'},
			{'name' : 'dispel',
			'base' : 'level'}
		]
	};

	guild_battle.gf.festival.other = guild_battle.gf.guild_battle;
	guild_battle.gf.guild_battle.other = guild_battle.gf.festival;
	
	// Add a review page with path, and set 'entry' key to value, if wanted
	guild_battle.setrPage = function(path, entry, value) {
        try {
			var rPage = {
				'path' : path,
				'review' : 0,
				'page' : false
			};

            if (!$u.hasContent(path) || !$u.isString(path)) {
                con.warn("path", path);
                throw "Invalid identifying path!";
            }
            caap.stats.reviewPagesGB = $u.setContent(caap.stats.reviewPagesGB, []);

            for (var it = 0; it < caap.stats.reviewPagesGB.length; it++) {
                if (caap.stats.reviewPagesGB[it].path === path) {
					if ($u.hasContent(entry)) {
						caap.stats.reviewPagesGB[it][entry] = value;
					}
					return true;
                }
            }
			if ($u.hasContent(entry)) {
				rPage[entry] = value;
			}

			caap.stats.reviewPagesGB.push(rPage);
			con.log(2,'setrPage',path, entry, value, caap.stats.reviewPagesGB,rPage);
			return false;
        } catch (err) {
            con.error("ERROR in guild_battle.setrPage: " + err);
            return false;
        }
    };

	// Delete all review pages where 'entry' = value
	guild_battle.deleterPage = function(entry, value) {
        try {
            if (!$u.hasContent(entry) || !$u.isString(entry)) {
                con.warn("Delete entry invalid", entry, value);
                throw "Invalid identifying entry!";
            }
			var deleted = 0;

            for (var i = caap.stats.reviewPagesGB.length - 1; i >= 0; i += -1) {
                if (caap.stats.reviewPagesGB[i][entry] === value) {
					deleted += 1;
					con.log(2,'GB review pages before',caap.stats.reviewPagesGB, entry, i);
					caap.stats.reviewPagesGB.splice(i,1);
					con.log(2,'GB review pages after',caap.stats.reviewPagesGB, entry, i, deleted);
                }
            }
			return deleted;

        } catch (err) {
            con.error("ERROR in guild_battle.deleterPage: " + err);
            return false;
        }
    };

	// Delete or add review page based on if 'tf' is true or false
	guild_battle.togglerPage = function(path, tf, entry, value) {
        try {
            if (tf) {
                return guild_battle.setrPage(path, entry, value);
            }
			return guild_battle.deleterPage('path', path);
        } catch (err) {
            con.error("ERROR in guild_battle.togglerPage: " + err);
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
			var	types = ['enemy','your'];
			types.forEach(function(type) {
				for (var i = 1; i <= 4; i++) {
					guild_battle.setrPage(guild_battle.makePath(gf, type, i), 'page', gf.page);
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
			guild_battle.setrPage('guildv2_battle');
			//caap.stats.reviewPagesGB = [];
            session.setItem("guildBattleDashUpdate", true);
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
			if (gf !== guild_battle.gf.festival && gf !== guild_battle.gf.guild_battle) {
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
			var index = $u.setContent(gf.index, 2);
			if (gf !== 'winlossRecords' && gf !== guild_battle.gf.festival && gf !== guild_battle.gf.guild_battle) {
				con.warn("getItem invalid gf", gf);
				throw "Invalid identifying gf!";
			}

			if (!record || !$j.isPlainObject(record)) {
				throw "Not passed a record";
			}

			guild_battle.records[index] = {};
			guild_battle.records[index].data = record;
			con.log(5, "Updated guild_battle record #"+index, record, guild_battle.records);

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
            return true;
        } catch (err) {
            con.error("ERROR in guild_battle.clear: " + err);
            return false;
        }
    };

	guild_battle.onTop = function(gf) {
        try {
			var record = guild_battle.getItem(gf),
				otherRecord = guild_battle.getItem(gf.other),
				nextReview = Date.now(),
				now = new Date(),
				text = '',
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
				record.reviewed = now.getTime();
				con.log(5, "Festival.checkInfo", next, timer, hour, tz);
				con.log(5, "When", tDate.toUTCString());

				if (record.endTime < record.reviewed) {
					record.startTime = tDate.getTime();
					record.endTime = record.startTime + 3600000;
					schedule.setItem('StartTime', record.startTime, 20);
					con.log(5, "New start time");
				}
				tDate.setUTCHours(hour, 0, 0, 0);
				con.log(5, "Festival battle start time" + $u.makeTime(tDate, caap.timeStr(true)), tDate);
				
				text = next;
				
			} else { // GBorFest == guild_battle
				text = $u.setContent(infoDiv.text().trim().innerTrim(), '');
			}

			if (text.indexOf(gf.startText) >= 0) {
				guild_battle.deleterPage('page',gf.page);
				record.state = 'Start';
				nextReview += -3 * 60 * 1000;
			} else if (text.indexOf(gf.preGBText) >= 0 || text.indexOf(' MIN') >= 0) {
				guild_battle.deleterPage('page',gf.page);
				record.state = 'PreBattle';
			} else if (text.indexOf(gf.activeText) >= 0) {
				record.state = 'Active';
				guild_battle.setrPage(gf.basePath, 'page', gf.page);
			} else if (text.indexOf(gf.collectText) >= 0) {
				guild_battle.deleterPage('page',gf.page);
				record.state = 'Collect';
				con.log(5,'collect button',gf.waitHours, schedule.since(record.collectedTime, gf.waitHours * 60 * 60),gf.options, config.getItem('guild_battle_collect',false), gf.options.indexOf(config.getItem('guild_battle_collect',false)));
				if (schedule.since(record.collectedTime, gf.waitHours * 60 * 60) && gf.options.indexOf(config.getItem('guild_battle_collect',false)) >= 0) {
					guild_battle.setrPage(gf.basePath + ',clickimg:guild_battle_collectbtn_small.gif','page',gf.page);
				}
				nextReview = Math.max(record.lastBattleTime + (gf.waitHours * 60 * 60 - 4 * 60) * 1000, Date.now());
				
			} else {
				con.warn(gf.name + ' Unknown message text', text);
			}

			if (gf.name == 'Festival') {
				// guild_battle.setReview(gf);
				hour = record.state == 'Collect' ? 3 : $u.setContent(text.regex(/(\d+) HOUR/), 0);
				tDate = new Date();
				tDate.setHours(tDate.getHours() + hour%6 + 1, -3, 0, 0);
				record.startTime = tDate.getTime();
				con.log(2, "Festival possible start time", hour, tDate, $u.makeTime(tDate, caap.timeStr(true)));
			}

			guild_battle.setItem(gf, record);
			guild_battle.setrPage(gf.page, 'review', nextReview);

			con.log(2, "guild_battle.onTop", record, record.state, caap.stats.priorityGeneral);
			return true;

			} catch (err) {
				con.error("ERROR in guild_battle.onTop: " + err);
            return false;
        }
    };
	
	// Parses a string for the key, and adds/multiplies the score by according to the key
	// For example (500, 'cleric:+100', 'cleric') would return the score + 100, i.e. 600
    guild_battle.parse = function(tf, text, key, score) {
        try {
			var args = text.match(new RegExp('(!?)' + key + ':(\\D?)([^,]+)'));
			
			con.log(5,'scoringtext match',key, text, args);
			if (args && args.length == 4 && (tf != false) !== (args[1] == '!')) { // Deliberate avoidance of "tf !==" to catch 0 or undefined, etc.
				score[args[2] == '*' ? 0 : 1] += args[2] == '-' ? -args[3].parseFloat() : args[3].parseFloat();
			}
            return score;
        } catch (err) {
            con.error("ERROR in guild_battle.parse: " + err);
            return false;
        }
    };
	
    guild_battle.target = function(t, total, mR, attack, general, team, tower) {
        try {
			if (total > t.score) {
				t.tower = tower;
				t.id = mR.target_id;
				t.score = total;
				t.attack = attack.regex(/duel/) ? 'duel' : attack;
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
				towerRecord = {},
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
				total = 0,
				notStarted = '',
				isMe = false,
				notMyBattle = '',
				battleOver = '',
				scoring = config.getItem('guild_battle_scoring','');

			guild_battle.setrPage(gf.basePath, 'review', Date.now());
			guild_battle.setrPage(gf.basePath, 'page', gf.page);
            caap.chatLink("#app_body #guild_war_chat_log div[style*='border-bottom: 1px'] div[style*='font-size: 15px']");
            bannerDiv = $j("#globalContainer #" + gf.bannerDiv);
			myStatsTxt = $u.setContent(bannerDiv.text().trim().innerTrim(), '');
			notStarted = myStatsTxt.regex(/(This Battle Has Not Started Yet)/);
			notMyBattle = myStatsTxt.regex(/(You Are Not A Part Of This .*Battle)/);
			battleOver = myStatsTxt.regex(/(Battle Is Over)/i) || myStatsTxt.regex(/(Have Your Guild Master And Officers To Initiate More)/);
			con.log(5, gf.name + " battle screen arena_battle_banner_section", myStatsTxt, notStarted, notMyBattle, battleOver);
			if (notMyBattle) {
				return true;
			}

			wlid = $u.setContent($j("#globalContainer #results_main_wrapper input[name='target_id']").attr('value'), false);
			text = $j("#globalContainer #results_main_wrapper").text();
			con.log(5,'Pre Results',wlid, text, text.regex(/\+(\d+) Battle Activity Points/), tNum, wlR, wlRs);
			if (wlid && text && text !== '') {
				if (!$u.isObject(wlRs[wlid])) {
					wlRs[wlid] = new guild_battle.wlRecord().data;
				}
				wlR = wlRs[wlid];
				tNum = $u.setContent(text.regex(/\+(\d+) Battle Activity Points/),0);

				if (tNum == 50) {
					con.log(1, "You were polymorphed or confused");
				} else if (text.regex(/(Your target is freed from polymorph!)/i)) {
					con.log(1, "Victory against polymorphed enemy");
				} else {
					lastMove = text.regex(/(\w+) VICTORY!/);
					lastMove = ['POLYMORPH','CONFUSE'].indexOf(lastMove) >=0 ? lastMove.replace('MORPH','').toLowerCase() : tNum == 135 ? 'heal' : 'duel';
					if (tNum == 100) {
						con.log(1, "Defeated by enemy");
						wlR[lastMove].losses += 1;
					} else if (tNum == 135) {
						if ($u.hasContent($j("#globalContainer #results_main_wrapper").find('div[style*="color:#ffdb59"]'))) {
							con.log(1, "Victory against ally");
							wlR[lastMove].wins += 1;
						} else { 
							con.log(1, "Defeat against ally");
							wlR[lastMove].losses += 1;
						}
					} else if (tNum > 100) {
						con.log(1, "Victory against enemy");
						wlR[lastMove].wins += 1;
					} else {
						con.warn('Unknown battlepoint count');
					}
					wlR[lastMove].total = wlR[lastMove].wins + wlR[lastMove].losses;
					guild_battle.setItem('winlossRecords', wlRs);
				}
				con.log(2,'Results',wlid, text, tNum, wlR, wlRs);
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
				if (!caap.hasImage('guild_battle_collectbtn_small.gif')) {
					fR.collectedTime = Date.now();
					guild_battle.setItem(gf, fR);
				} else {
					fR.collectedTime = 0;
				}
				guild_battle.setItem(gf, fR);
				//return true;
			}
							
			if (caap.hasImage(gf.enterButton)) {
				con.log(5, 'Battle has enter button', config.getItem('guild_battle_enter',false));
				fR['your'].attacks = []; // Should probably make these more frequent, but leaving here for now
				fR['enemy'].attacks = [];
				if (gf.options.indexOf(config.getItem('guild_battle_enter',false)) >= 0 && caap.stats.stamina.num >= 20) {
					guild_battle.deleterPage('page',gf.page);
					guild_battle.setrPage(gf.basePath + ',clickimg:' + gf.enterButton,'page',gf.page);
				}
				guild_battle.setItem(gf, fR);
				return true;
			}

			fR.lastBattleTime = Date.now();
			con.log(5, 'No enter button', caap.hasImage(gf.enterButton), gf.enterButton);

			if (gf.options.indexOf(config.getItem('guild_battle_fight',false)) >= 0) {
				con.log(5,'Opted out of battle.', config.getItem('guild_battle_fight',false));
				guild_battle.setReview(gf);
			}
			

			text = $u.setContent($j("#monsterTicker").text().trim(),'');
            fR.endTime = Date.now() + text.parseTimer() * 1000;

            myStatsTxt = $u.setContent(bannerDiv.children().eq(2).text().trim().innerTrim(), '');
			if (myStatsTxt) {
				con.log(5, "myStatsTxt", myStatsTxt);
				args = myStatsTxt.match(new RegExp("(.+) Level: (\\d+) Class: (.+) Health: (\\d+)/(\\d+).+Status: (.+) .* Activity Points: (\\d+)"));
				if (args && args.length === 8) {
					con.log(5, "my stats", args);
					fR.me.mclass = args[3];
					fR.me.status = args[6] ? args[6].trim() : '';
					fR.me.healthNum = args[4] ? args[4].parseInt() : 0;
					fR.me.healthMax = args[5] ? args[5].parseInt() : 1;
					fR.me.battlePoints = args[7] ? args[7].parseInt() : 0;
					fR.me.percent = ((mR.healthNum / mR.healthMax) * 100).dp(2);
					con.log(5, 'myRecord', mR);
				} else if (myStatsTxt.indexOf('Battle Has Not Started') >= 0) {
					// Wait retry until started
					return true;
				} else {
					con.warn("args error", args, myStatsTxt);
				}
			}

			tokenSpan = $j("#globalContainer span[id='guild_token_current_value']");
			tStr = $u.hasContent(tokenSpan) ? tokenSpan.text().trim() : '';
			fR.tokens = tStr ? tStr.parseInt() : 0;

			timerSpan = $j("#globalContainer span[id='guild_token_time_value']");
			tStr = $u.hasContent(timerSpan) ? timerSpan.text().trim() : '';
			fR.tokenTime = tStr ? tStr.regex(/(\d+:\d+)/) : '0:00';
			con.log(5,'Tokens', fR.tokens);
			
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
			guild_battle.setrPage(guild_battle.makePath(gf, which, tower), 'review', Date.now());
			guild_battle.setrPage(guild_battle.makePath(gf, which, tower), 'page', gf.page);
			con.log(5,'Gate ID',gate.attr('id'),tower, which, caap.stats.reviewPagesGB);
			if (!gate) {
				con.warn("No gates found");
			} else {
				con.log(2,'Gate', which, tower);
				memberDivs = gate.children("div[style*='height']");
				con.log(5,'Members found',memberDivs.length,memberDivs);
				towerRecord =  {
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

				for (var n = 1; n <= 25; n += 1) {
					delete fR[which].members[tower + '-' + n];
					if (!memberDivs || !memberDivs.length || !memberDivs[n-1]) {
						con.log(5, "No member found", tower, n);
						continue;
					}
					member = $j(memberDivs[n-1]);
					mR = new guild_battle.member().data;
					text = (which == 'enemy' ? 'basic_' : 'special_defense_') + tower + '_';
					targetIdDiv = member.find('div[id^="' + text + '"]').eq(0);
					if (targetIdDiv && targetIdDiv.length) {
						con.log(5,"Target_id for member", targetIdDiv.attr('id'), targetIdDiv);
						mR.target_id = targetIdDiv.attr('id').replace(text,'');
						con.log(5,"Target_id for member", mR.target_id,targetIdDiv.attr('id'), targetIdDiv);
					} else {
						con.log(5, "Unable to find target_id for member", tower, n, member, targetIdDiv);
						continue;
					}

					memberText = member.children().text();
					memberText = memberText ? memberText.trim().innerTrim() : '';
					con.log(5, 'memberText', memberText);
					args = memberText.match(toonStatsRegEx);
					con.log(5, 'member args', args);
					mR.mclass = member.children().attr('class').match(classRegEx)[1];
					towerRecord.clerics += mR.mclass == 'cleric' ? 1 : 0;
					mR.points = $j("img[src*='guild_bp_']", member).attr("title").match(/(\d+)/)[1];
					if (args && args.length === 8) {
						// mR.position = args[1] || '';
						mR.name = args[2] || '';
						mR.level = args[3] ? args[3].parseInt() : 0;
						mR.status = args[4] || '';
						mR.healthNum = args[5] ? args[5].parseInt() : 0;
						mR.healthMax = args[6] ? args[6].parseInt() : 1;
						mR.battlePoints = args[7] ? args[7].parseInt() : 0;
						mR.percent = ((mR.healthNum / mR.healthMax) * 100).dp(2);

						['duel', 'poly','confuse'].forEach(function(awin) {
							var api = (awin == 'confuse' ? 1.5 : awin == 'poly' ? 1.25 : 1) * caap.stats.indicators.api;
							var winChance = Math.min((api / mR.level / 10 * 100).dp(1),100);
							wlR = wlRs[mR.target_id];
							if ($u.hasContent(wlR) && $u.hasContent(wlR[awin]) && wlR[awin].total) {
								mR.metrics[awin] = ((winChance * 0.5 / 100 + wlR[awin].wins / wlR[awin].total) / (wlR[awin].total + 0.5) * 100).dp(1);
							} else {
								mR.metrics[awin] = winChance;
							}
						});
						mR.winChance = mR.metrics.duel;
						mR.metrics.damage = Math.atan((mR.healthMax - mR.healthNum)/1000)/Math.PI*2*100;
						mR.metrics.level = Math.atan(mR.level/1000)/Math.PI*2*100;
						mR.metrics.rhealth = 100 - Math.atan(Math.max(mR.healthNum - gf.minHealth, 0)/1000)/Math.PI*2*100;
						
						if (wlid == mR.target_id) {
							wlRs[wlid].level = mR.level;
							wlRs[wlid].name = mR.name;
						}

                        mR.guardian = $u.hasContent($j("img[src*='ability_sentinel']", member)) ? true : false;
                        mR.poly = $u.hasContent($j("img[src*='polymorph_effect']", member)) ? true : false;
                        mR.poison = $u.hasContent($j("img[src*='effect_poison']", member)) ? true : false;
                        mR.confuse = $u.hasContent($j("img[src*='effect_confuse']", member)) ? true : false;
                        mR.revive = $u.hasContent($j("img[src*='effect_revive']", member)) ? true : false;
                        mR.shout = $u.hasContent($j("img[src*='effect_shout']", member)) ? true : false;
                        mR.fortify = $u.hasContent($j("img[src*='effect_fort']", member)) ? true : false;
                        mR.confidence = $u.hasContent($j("img[src*='effect_confidence']", member)) ? true : false;
                        mR.smokebomb = $u.hasContent($j("img[src*='effect_smoke']", member)) ? true : false;
						con.log(5, 'Member Record', mR);
						towerRecord.players += 1;
						towerRecord.actives += mR.battlePoints > 0 ? 1 : 0;
						towerRecord.AC += (mR.battlePoints > 0 && mR.mclass == 'cleric') ? 1 : 0;
						stunnedClerics += (mR.status == 'Stunned' && mR.mclass == 'cleric') ? 1 : 0;
						towerRecord.clericHealthNum += mR.mclass == 'cleric' ? mR.healthNum : 0;
						towerRecord.clericHealthMax += mR.mclass == 'cleric' ? mR.healthMax : 0;
						
						// for testing
						//fR.me.mclass = 'Warrior';
						guild_battle[which][fR.me.mclass].forEach(function(att) {
							args = scoring.match(new RegExp(att.name + "(\\[.*?)\\]"));
							con.log(5,'scoring match attack', scoring, args, att.name);
							isMe = which == 'your' && mR.name == caap.stats.PlayerName && mR.level == caap.stats.level;
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
							text = args[1];
							['cleric','rogue','warrior','mage'].forEach(function(value) {
								score = guild_battle.parse(mR.mclass == value, text, value, score);
							});
							['1','2','3','4'].forEach(function(value) {
								score = guild_battle.parse(tower == value, text, 't' + value, score);
							});
							['poly','poison','confuse','guardian','revive','shout','confidence','fortify','smokebomb'].forEach(function(value) {
								score = guild_battle.parse(mR[value], text, value, score);
							});
							score = guild_battle.parse(isMe, text, 'me', score);
							score = guild_battle.parse(mR.battlePoints, text, 'active', score);
							score = guild_battle.parse(true, text, 'base', score);
							score = guild_battle.parse(mR.healthNum == mR.healthMax, text, 'bs', score);
							score = guild_battle.parse(mR.healthMax - mR.healthNum < 300 , text, 'healed', score);
							score = guild_battle.parse(gf.label == 'festival' , text, 'festival', score);

							mR.scores[att.name] = {};
							con.log(5,'record check', score, att.base,mR[att.base], mR.scoreDamage);
							['normal','seal'].forEach(function(seal) {
								score = guild_battle.parse(seal == 'seal', text, 'seal', score);
								total = score[0] * mR.metrics[att.base] + score[1];
								total = mR.healthNum >= (which == 'your' ? gf.minHealth : 1) ? total.dp(2) : 0;
								mR.scores[att.name][seal] = total;
								general = text.match(new RegExp("@[^,]+"));
								general = general && general.length > 0 ? general[0] : '@Use Current';
								towerRecord[seal].unstunned = guild_battle.target(towerRecord[seal].unstunned, total, mR, att.name, general, which, tower);
								if (which == 'enemy' && att.name.regex(/duel/)) {
									towerRecord[seal].stunned = guild_battle.target(towerRecord[seal].stunned, total, mR, att.name, general, which, tower);
								}
							});
						});
							
					} else {
						con.warn("Unable to read member stats",tower, n, args);
					}
					fR[which].members[tower + '-' + n] = mR;
				}
			}
			towerRecord.clericDamage = towerRecord.clericHealthMax - towerRecord.clericHealthNum;
			towerRecord.clericLife = towerRecord.clerics ? (towerRecord.clericHealthNum/towerRecord.clericHealthMax * 100).dp(1) : 100.0;
			fR[which].towers[tower] = towerRecord;

			['your','enemy'].forEach(function(fwhich) {
				maxDamage = 0;
				maxTower = 0;
				['1','2','3','4'].forEach(function(fTower) {
					towerRecord = fR[fwhich].towers[fTower];
					if ($u.isObject(towerRecord) && $u.isNumber(towerRecord.clericDamage) && towerRecord.clericDamage > maxDamage + 1000 && towerRecord.clericHealthNum > 0) {
						maxDamage = towerRecord.clericDamage;
						maxTower = fTower;
					}
				});
				fR[fwhich].seal = maxTower;
			});
			
			con.log(2, "Current Record", fR);
			guild_battle.setItem(gf, fR);
			session.setItem(gf.label + "DashUpdate", true);
//            caap.updateDashboard(true);
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

	guild_battle.path = 'guildv2_battle,clickimg:sort_btn_joinbattle.gif,guild_battle,clickimg:enemy_guild_on.gif,jq:#enemy_guild_tab,clickjq:#enemy_new_guild_tab_4,jq:#enemy_guild_member_list_4,clickjq:#basic_4_100000206587433 input[src*="gb_btn_duel.gif"]';

	guild_battle.path = '@Joan,festival_battle_home,clickimg:festival_arena_enter.jpg,festival_guild_battle,clickimg:guild_battle_collectbtn_small.gif';
	
	guild_battle.path = false;	

 	// Parse the menu item too see if a loadout override should be equipped. If time is during a general override time,
	// the according general will be equipped, and a value of True will be returned continually to the main loop, so no
	// other action will be taken until the time is up.
	guild_battle.work = function (gf) {
		try {
			var fRecord = guild_battle.getItem(guild_battle.gf.festival),
				gRecord = guild_battle.getItem(guild_battle.gf.guild_battle),
				fR = guild_battle.getItem(gf),
				startTime = $u.setContent(fRecord.startTime, 0),
				timeBattlesList = config.getList('timed_guild_battles', ''),
				begin = new Date(),
				end = new Date(),
				timeString = '',
				result = '',
				button = '',
				maxTokens = 0,
				stun = false,
				burnTokens = false,
				teams = [],
				button = null,
				t = { 'score' : 0 },
				timedSetting = config.getItem('WhenGuildBattle', ''),
				match = (timedSetting === 'Battle available') ? true : false,
				now = new Date();
				
			// For testing paths
			if (guild_battle.path) {
				result = caap.navigate2(guild_battle.path);
				if (result == 'done' || result == 'fail' || !result) {
					guild_battle.path = false;
				}
				return true;
			}
		
			con.log(5, 'schedule since ', schedule.since(startTime, 0), schedule.since(startTime,  3 * 60), startTime, fRecord, guild_battle.records);
			
			if ((fRecord.state == 'PreBattle' && schedule.since(startTime, 0) && !schedule.since(startTime, 3 * 60)) || gRecord.state == 'PreBattle') {
				caap.stats.priorityGeneral = config.getItem('GBClassGeneral','Use Current') == 'Use Current' ? false : config.getItem('GBClassGeneral','Use Current');
			} else {
				caap.stats.priorityGeneral = false;
			}
			if (fRecord.state == 'Active' || gRecord.state == 'Active') {
				caap.stats.battleIdle = config.getItem('GBIdleGeneral','Use Current') == 'Use Current' ? false : config.getItem('GBIdleGeneral','Use Current');
			} else {
				caap.stats.battleIdle = false;
			}

			// Work around for faulty storage of caap.stats
			if (caap.stats.indicators.api == 0) {
				return caap.navigateTo('keep');
			}
			
            for (i = 0; i < caap.stats.reviewPagesGB.length; i++) {
				con.log(5,'Pre  battle page',caap.stats.reviewPagesGB[i].page, gf, schedule.since(caap.stats.reviewPagesGB[i].review, 5 * 60));
				// For now, this looks at both festival and GB pages that are due for review
                if (caap.stats.reviewPagesGB[i].path.indexOf(gf.page) >= 0 && schedule.since(caap.stats.reviewPagesGB[i].review, 5 * 60)) {
					con.log(5,'Reviewing battle page',caap.stats.reviewPagesGB[i].path, caap.stats.reviewPagesGB);
					result = caap.navigate2(caap.stats.reviewPagesGB[i].path);
					if (result == 'fail') {
						guild_battle.deleterPage('path', caap.stats.reviewPagesGB[i].path);
					} else if (result) {
						return true;
					} else {
						con.log(2, 'Loading keep page to force page reload');
						return caap.navigateTo('keep');
					}
				}
            }
			con.log(5,'Guild review',caap.stats.reviewPagesGB);
			
			if (gf.options.indexOf(config.getItem('guild_battle_fight',false)) < 0 || caap.stats.priorityGeneral) {
				return false;
			}
			
			burnTokens = schedule.since(fR.endTime, -8 * 60 ) || fR.guildHealth < 10;
			stun = fR.me.healthNum <= gf.minHealth ? 'stunned' : 'unstunned';
			maxTokens = burnTokens ? 0 : stun == 'stunned' ? 8 : config.getItem('TokenMax', 8);
			con.log(5,'pre ATTACK!',fR.tokens > maxTokens, fR.state == 'Active' , fR.state, fR.me.healthNum > gf.minHealth);
			
			if (fR.tokens > maxTokens && fR.state == 'Active') {
				teams = stun == 'stunned' ? ['enemy'] : ['your','enemy'];
				teams.forEach(function(which) {
					['1','2','3','4'].forEach(function(tower) {
						var seal = tower == fR[which].seal ? 'seal' : 'normal';
						t = fR[which].towers[tower][seal][stun].score > t.score ? fR[which].towers[tower][seal][stun] : t;
						con.log(5, 'Attack evals:',which, tower, seal, stun, t);
					});
				});
			
				if (!t.id) {
					con.log(2, 'No valid target to attack');
					return false;
				}
				
				con.log(2, 'ATTACKING', t.team, t.tower, t.name, t.attack, t);
				button = t.attack == 'duel' ? 'basic_' : t.team == 'your' ? 'special_defense_' : 'special_';
				return caap.navigate2(t.general + ',' + guild_battle.makePath(gf, t.team, t.tower) + ',clickjq:#' + button + t.tower + '_' + t.id + ' input[src*="' + t.attack + '.gif"]');
			}
				
			if (timedSetting=='Never' || gRecord.state !== 'Start') {
				return false;
			}
			con.log(5, 'checking to see if starting GB', timeBattlesList);
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
						con.log(5, 'Vars now.getDay, i', now.getDay(), i);
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
				caap.stats.priorityGeneral = config.getItem('GBClassGeneral','Use Current') == 'Use Current' ? false : config.getItem('GBClassGeneral','Use Current');
				if (general.selectSpecific(caap.stats.priorityGeneral)) {
					return true;
				}
				if (caap.navigateTo('guildv2_battle')) {
					return true;
				}
				button = caap.checkForImage('sort_btn_startbattle.gif');
				if ($u.hasContent(button)) {
					con.log(1, 'CLICK GUILD BATTLE START');
					return caap.click(button);
				}
			}

			con.log(5, 'No time match to current time', now);
			return false;
        } catch (err) {
            con.error("ERROR in guild_battle.work: " + err);
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
				timed_guild_battles_inst = "List of times when Guild Battles should be started, such as 'Mon 1, Tue 15:30, Wed 8 PM, etc.  Guild battle will be attempted to be started at the listed time and up to two hours after.",
				guild_battle_scoring_inst = "List of score adjustments to pick targets",
                htmlCode = '';

            htmlCode += caap.startToggle('GuildBattles', 'GUILD BATTLES');
            htmlCode += caap.makeDropDownTR("Auto-collect after", 'guild_battle_collect', gbattleOptions, [], '', 'Never', false, false, 62);
            htmlCode += caap.makeDropDownTR("Auto-join", 'guild_battle_enter', gbattleOptions, [], '', 'Never', false, false, 62);
            htmlCode += caap.makeDropDownTR("Fight in", 'guild_battle_fight', gbattleOptions, [], '', 'Never', false, false, 62);
            htmlCode += caap.makeNumberFormTR("Use tokens over", 'TokenMax', 'Tokens over this amount will be used to attack or defend', 8, '', '', true, false);
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
					record = guild_battle.getItem(gf),
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
				con.log(5, "Dash record",record);
				
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

					if (record[which].attacks && $u.isArray(record[which].attacks)) {
						headers = headers1.concat(record[which].attacks);
						headers = headers.concat(headers2);
						values = values1.concat(record[which].attacks);
						values = values.concat(values2);
						con.log(5, 'Dashboard New arrays',record[which].attacks, headers, values);
					} else {
						headers = headers1.concat(headers2);
						values = values1.concat(values2);
						con.log(2, 'No attacks scored yet',record[which].attacks);
					}
					headers.push('Cnd');

					members = record[which].members;
					towers = record[which].towers;
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
					con.log(5, "members", members, record);
					for (var i in members) {
						if (members.hasOwnProperty(i)) {
							row = "";
							for (pp = 0; pp < values.length; pp += 1) {
								member = members[i];
								con.log(5,'i pp', i, pp, values[pp],member[values[pp]]);
								switch (values[pp]) {
								case 'name':
									data = {
										text: '<span id="caap_' + gf.label + '_' + pp + '" title="Clicking this link will take you to (' +  ') ' + record.name + '" mname="1"' +
											'" rlink="guild_battle_battle.php?twt2=' + '&guild_id=' + record.guildId + '&slot='  +
											'" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + member[values[pp]] + '</span>',
										color: record.color,
										id: '',
										title: ''
									};

									row += caap.makeTd(data);

									break;
								case 'index':
									row += caap.makeTd({
										text: i,
										color: record.color,
										id: '',
										title: ''
									});

									break;
								case 'ticker':
									row += caap.makeTd({
										text: $u.hasContent(record[values[pp]]) ? record[values[pp]].regex(/(\d+:\d+):\d+/) : '',
										color: record.color,
										id: '',
										title: ''
									});

									break;
								default:
									if (record[which].attacks && record[which].attacks.indexOf(values[pp]) >= 0) {
										if ($u.hasContent(member.scores[values[pp]])) {
											seal = i.replace(/-.*/,'') == record[which].seal ? 'seal' : 'normal';
											value = member.scores[values[pp]][seal];
										} else {
											value = 'N/A';
										}
									} else {
										value = $u.hasContent(member[values[pp]]) ? member[values[pp]] : ''
									}
									row += caap.makeTd({
										text: value,
										color: record.color,
										id: '',
										title: ''
									});
								}
							}
		/*
							data = {
								text: '<a href="' + caap.domain.altered + '/guild_battle_battle.php?twt2=' + guild_battle.info[record.name].twt2 + '&guild_id=' + record.guildId +
									'&action=doObjective&slot=' + record.slot + '&ref=nf">Link</a>',
								color: 'blue',
								id: '',
								title: 'This is a siege link.'
							};

							row += caap.makeTd(data);
		*/
							if ($u.hasContent(record.conditions) && record.conditions !== 'none') {
								data = {
									text: '<span title="User Set Conditions: ' + record.conditions + '" class="ui-icon ui-icon-info">i</span>',
									color: record.color,
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
						con.log(5,'battle path set',guild_battle.path);
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
