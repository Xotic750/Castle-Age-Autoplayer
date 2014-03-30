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
			'enteredTime' : 0,
			'endTime' : 0,
			'me' : {},
			'attacks' : [],
            'enemy': {
				'towers' : {},
				'members' : {}
			},
            'your': {
				'towers' : {},
				'members' : {}
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
			'scores' : {}
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
			'bannerDiv' : 'guild_battle_banner_section',
			'enterButton' : 'guild_enter_battle_button2.gif',
			'index' : 0,
			'infoDiv' : '#app_body #guildv2_battle_middle',
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
			{'name': 'duel',
			'base' : 'win'},
			'polymorph','confuse'],
		'Rogue' : ['duel'],
		'Warrior' : ['duel','whirlwind'],
		'Cleric' : ['duel']
	};

	guild_battle.your = {
		'Mage' : [],
		'Rogue' : [],
		'Warrior' : [
			{'name': 'guardian',
			'base' : 'scoreHealth'},
			{'name' : 'sentinel',
			'base' : 'scoreHealth'}
		],
		'Cleric' : [
			{'name': 'revive',
			'base' : 'scoreDamage'},
			{'name' : 'heal',
			'base' : 'scoreDamage'},
			{'name' : 'fortitude',
			'base' : 'scoreHealth'},
			{'name' : 'cleanse',
			'base' : 'scoreDamage'},
			{'name' : 'dispel',
			'base' : 'scoreDamage'}
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
            if (gf !== guild_battle.gf.festival && gf !== guild_battle.gf.guild_battle) {
                con.warn("getItem invalid gf", gf);
                throw "Invalid identifying gf!";
            }

			if ($j.isPlainObject(guild_battle.records[gf.index])) {
                con.log(2, "Got guild_battle record #"+gf.index, guild_battle.records[gf.index].data, guild_battle.records, gf);
                return guild_battle.records[gf.index].data;
			}
            var newRecord = new guild_battle.record();
            con.log(2, "New guild_battle record #"+gf.index, newRecord.data, guild_battle.records);
            return newRecord.data;
        } catch (err) {
            con.error("ERROR in guild_battle.getItem: " + err);
            return false;
        }
    };

    guild_battle.setItem = function(gf, record) {
        try {
            if (gf !== guild_battle.gf['festival'] && gf !== guild_battle.gf['guild_battle']) {
                con.warn("getItem invalid gf", gf);
                throw "Invalid identifying gf!";
            }

            if (!record || !$j.isPlainObject(record)) {
                throw "Not passed a record";
            }

			guild_battle.records[gf.index] = {};
			guild_battle.records[gf.index].data = record;
			con.log(2, "Updated guild_battle record #"+gf.index, record, guild_battle.records);

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
				con.log(2, "Festival.checkInfo", next, timer, hour, tz);
				con.log(2, "When", tDate.toUTCString());

				if (record.endTime < record.reviewed) {
					record.startTime = tDate.getTime();
					record.endTime = record.startTime + 3600000;
					schedule.setItem('StartTime', record.startTime, 20);
					con.log(2, "New start time");
				}
				tDate.setUTCHours(hour, 0, 0, 0);
				con.log(2, "Festival start time", tDate, $u.makeTime(tDate, caap.timeStr(true)));
				
				start = record.startTime - record.reviewed;
				start = start > 0 ? start : 0;
				if (start && record.state === 'Ready') {
					con.log(2, "Festival starting in", start);
					schedule.setItem("Festival Review", start, 20);
				} else {
					con.log(2, "Festival review in", 300);
					schedule.setItem("Festival Review", 300, 20);
				}
				if (record.state === '' || record.state === 'Completed') {
					schedule.setItem(gf.name + "TokenTicker", 0);
					record.state = 'Ready';
					record.tokens = 10;
					record.myStatus = '';
					record.damage = 0;
					record.teamHealth = 0;
					record.enemyHealth = 0;
					record.ticker = '';
				}
				text = next;
				
			} else { // GBorFest == guild_battle
				text = $u.setContent(infoDiv.text().trim().innerTrim(), '');
			}

			if (text.indexOf(gf.startText) >= 0) {
				guild_battle.deleterPage('page',gf.page);
				record.state = 'Start';
			} else if (text.indexOf(gf.preGBText) >= 0 || text.indexOf(' MIN') >= 0) {
				guild_battle.deleterPage('page',gf.page);
				record.state = 'PreBattle';
			} else if (text.indexOf(gf.activeText) >= 0) {
				record.state = 'Active';
				guild_battle.setrPage(gf.basePath, 'page', gf.page);
			} else if (text.indexOf(gf.collectText) >= 0) {
				guild_battle.deleterPage('page',gf.page);
				record.state = 'Collect';
				if (schedule.since(record.collectedTime, gf.waitHours * 60 * 60) && config.getItem('guild_battle_collect',false)) {
					guild_battle.setrPage(gf.basePath + ',clickimg:guild_battle_collectbtn_small.gif','page',gf.page);
				}
					
			} else {
				con.warn(gf.name + ' Unknown message text', text);
			}
			// troubleshooting line 
			if (gf.name == 'Festival') {
				// guild_battle.setReview(gf);
				hour = record.state == 'Collect' ? 3 : $u.setContent(text.regex(/(\d+) HOUR/), 0);
				tDate = new Date();
				tDate.setHours(tDate.getHours() + hour%6 + 1, -3, 0, 0);
				record.startTime = tDate.getTime();
				con.log(2, "Festival possible start time", hour, tDate, $u.makeTime(tDate, caap.timeStr(true)));
			}

			guild_battle.setItem(gf, record);
			guild_battle.setrPage(gf.page, 'review', Date.now());

			con.log(2, "guild_battle.onTop", record, record.state, caap.stats.priorityGeneral);
			return true;

			} catch (err) {
				con.error("ERROR in guild_battle.onTop: " + err);
            return false;
        }
    };
	
	// Parses a string for the key, and adds/multiplies the score by according to the key
	// For example (500, 'cleric:+100', 'cleric') would return the score + 100, i.e. 600
    guild_battle.parse = function(tf, text, key) {
        try {
			var args = text.match(new RegExp(key + ':([^,]+)'));
			
			con.log(5,'scoringtext match',key, text, args);
			if (tf && args && args.length == 2) {
				return args[1].parseFloat();
			}
            return 1;
        } catch (err) {
            con.error("ERROR in guild_battle.clear: " + err);
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
				memberRecord = new guild_battle.member().data,
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
				imgDiv = $j(),
				myStatsTxt = '',
				index = 0,
				currentRecord = guild_battle.getItem(gf),
				minions = [],
				tStr = '',
				tNum = 0,
				resultsTxt = '',
				score = 0,
				lastAttacked = state.getItem('FestivalMinionAttacked', {}),
				won = {},
				losses = [],
				wins = [],
				notStarted = '',
				notFestival = '',
				battleOver = '',
				scoring = config.getItem('guild_battle_scoring','');

			guild_battle.setrPage(gf.basePath, 'review', Date.now());
			guild_battle.setrPage(gf.basePath, 'page', gf.page);
            con.log(2, gf.name + " battle screen");
            state.setItem('FestivalMinionAttacked', {});
            caap.chatLink("#app_body #guild_war_chat_log div[style*='border-bottom: 1px'] div[style*='font-size: 15px']");
            bannerDiv = $j("#globalContainer #" + gf.bannerDiv);
			myStatsTxt = $u.setContent(bannerDiv.text().trim().innerTrim(), '');
			notStarted = myStatsTxt.regex(/(This Battle Has Not Started Yet)/);
			notFestival = myStatsTxt.regex(/(You Are Not A Part Of This .*Battle)/);
			battleOver = myStatsTxt.regex(/(This .*Battle Is Over)/) || myStatsTxt.regex(/(Have Your Guild Master And Officers To Initiate More)/);
			con.log(2, "arena_battle_banner_section", myStatsTxt, notStarted, notFestival, battleOver);
			if (notFestival) {
				return true;
			}

			if (battleOver) {
				if (!caap.hasImage('guild_battle_collectbtn_small.gif')) {
					currentRecord.collectedTime = Date.now();
					guild_battle.deleterPage('page',gf.page);
					guild_battle.setItem(gf, currentRecord);
				} else {
					currentRecord.collectedTime = 0;
				}
				return true;
			}
							
			if (caap.hasImage(gf.enterButton)) {
				con.log(5, 'Battle has enter button', config.getItem('guild_battle_enter',false));
				if (config.getItem('guild_battle_enter',false)) {
					con.log(5, 'Saving push button path');
					guild_battle.setrPage(gf.basePath + ',clickimg:' + gf.enterButton,'page',gf.page);
				}
				guild_battle.setItem(gf, currentRecord);
				return true;
			}

			currentRecord.enteredTime = Date.now();
			con.log(5, 'No enter button', caap.hasImage(gf.enterButton), gf.enterButton);
			guild_battle.setReview(gf);

			text = $u.setContent($j("#monsterTicker").text().trim(),'');
            currentRecord.endTime = Date.now() + text.parseTimer() * 1000;

            myStatsTxt = $u.setContent(bannerDiv.children().eq(2).text().trim().innerTrim(), '');
			if (myStatsTxt) {
				con.log(5, "myStatsTxt", myStatsTxt);
				args = myStatsTxt.match(new RegExp("(.+) Level: (\\d+) Class: (.+) Health: (\\d+)/(\\d+).+Status: (.+) .* Activity Points: (\\d+)"));
				if (args && args.length === 8) {
					con.log(1, "my stats", args);
					currentRecord.me.mclass = args[3];
					currentRecord.me.status = args[6] ? args[6].trim() : '';
					currentRecord.me.healthNum = args[4] ? args[4].parseInt() : 0;
					currentRecord.me.healthMax = args[5] ? args[5].parseInt() : 1;
					currentRecord.me.battlePoints = args[7] ? args[7].parseInt() : 0;
					currentRecord.me.percent = ((memberRecord.healthNum / memberRecord.healthMax) * 100).dp(2);
					con.log(2, 'myRecord', memberRecord);
				} else if (myStatsTxt.indexOf('Battle Has Not Started') >= 0) {
					// Wait retry until started
					return true;
				} else {
					con.warn("args error", args, myStatsTxt);
				}
			}

			tokenSpan = $j("#globalContainer span[id='guild_token_current_value']");
			tStr = $u.hasContent(tokenSpan) ? tokenSpan.text().trim() : '';
			currentRecord.tokens = tStr ? tStr.parseInt() : 0;

			timerSpan = $j("#globalContainer span[id='guild_token_time_value']");
			tStr = $u.hasContent(timerSpan) ? timerSpan.text().trim() : '';
			currentRecord.tokenTime = tStr ? tStr.regex(/(\d+:\d+)/) : '0:00';
			con.log(2,'Tokens', currentRecord.tokens);
			
			allowedDiv = $j("#allowedAttacks");
			if (allowedDiv && allowedDiv.length) {
/*				currentRecord.attacks = allowedDiv.val() ? allowedDiv.val().parseInt() : 1;
				if (currentRecord.attacks < 1 || currentRecord.attacks > 5) {
					currentRecord.attacks = 1;
					con.warn("Invalid allowedAttacks");
				}
*/			} else {
				con.warn("Could not find allowedAttacks");
			}

			health = $j("#guild_battle_health");
			if (health && health.length) {
				healthEnemy = $j("div[style*='guild_battle_bar_enemy.gif']", health).eq(0);
				if ($u.hasContent(healthEnemy)) {
					currentRecord.enemyHealth = (100 - healthEnemy.getPercent('width')).dp(2);
				} else {
					con.warn("guild_battle_bar_enemy.gif not found");
				}

				healthGuild = $j("div[style*='guild_battle_bar_you.gif']", health).eq(0);
				if ($u.hasContent(healthGuild)) {
					currentRecord.guildHealth = (100 - healthGuild.getPercent('width')).dp(2);
				} else {
					con.warn("guild_battle_bar_you.gif not found");
				}

				tempDiv = $j("span", health);
				if ($u.hasContent(tempDiv) && tempDiv.length === 2) {
					tempTxt = tempDiv.eq(0).text().trim();
					tempDiv.eq(0).text(tempTxt + " (" + currentRecord.guildHealth + "%)");
					tempTxt = tempDiv.eq(1).text().trim();
					tempDiv.eq(1).text(tempTxt + " (" + currentRecord.enemyHealth + "%)");
				}
			} else {
				con.warn("guild_battle_health error");
			}

			gate = $j("div[id*='_guild_member_list_']");
			tower = gate.attr('id').match(/_guild_member_list_(\d)/)[1];
			which = gate.attr('id').match(/(\w+)_guild_member_list_(\d)/)[1];
			guild_battle.setrPage(guild_battle.makePath(gf, which, tower), 'review', Date.now());
			guild_battle.setrPage(guild_battle.makePath(gf, which, tower), 'page', gf.page);
			con.log(2,'Gate ID',gate.attr('id'),tower, which, caap.stats.reviewPagesGB);
			if (!gate) {
				con.warn("No gates found");
			} else {
				con.log(2,'Gate',tower, which);
				memberDivs = gate.children("div[style*='height']");
				con.log(2,'Members found',memberDivs.length,memberDivs);
				towerRecord =  {
					'players' : 0,
					'clerics' : 0,
					'actives' : 0,
					'AC' : 0,
					'clericHealthNum' : 0,
					'clericHealthMax' : 0,
					'clericLife' : 0
				};

				for (var n = 1; n <= 25; n += 1) {
					delete currentRecord[which].members[tower + '-' + n];
					if (!memberDivs || !memberDivs.length || !memberDivs[n-1]) {
						con.log(5, "No member found", tower, n);
						continue;
					}
					member = $j(memberDivs[n-1]);
					memberRecord = new guild_battle.member().data;
					targetIdDiv = member.find("input[name='target_id']").eq(0);
					if (targetIdDiv && targetIdDiv.length) {
						memberRecord.target_id = targetIdDiv.val() ? targetIdDiv.val().parseInt() : 1;
						con.log(5,"Target_id for member", memberRecord.target_id);
					} else {
						con.log(2, "Unable to find target_id for member", tower, n, member);
						continue;
					}

					memberText = member.children().text();
					memberText = memberText ? memberText.trim().innerTrim() : '';
					con.log(5, 'memberText', memberText);
					args = memberText.match(toonStatsRegEx);
					con.log(5, 'member args', args);
					memberRecord.mclass = member.children().attr('class').match(classRegEx)[1];
					towerRecord.clerics += memberRecord.mclass == 'cleric' ? 1 : 0;
					memberRecord.points = $j("img[src*='guild_bp_']", member).attr("title").match(/(\d+)/)[1];
					if (args && args.length === 8) {
						// memberRecord.position = args[1] || '';
						memberRecord.name = args[2] || '';
						memberRecord.level = args[3] ? args[3].parseInt() : 0;
						memberRecord.status = args[4] || '';
						memberRecord.healthNum = args[5] ? args[5].parseInt() : 0;
						memberRecord.healthMax = args[6] ? args[6].parseInt() : 1;
						memberRecord.battlePoints = args[7] ? args[7].parseInt() : 0;
						memberRecord.percent = ((memberRecord.healthNum / memberRecord.healthMax) * 100).dp(2);
						memberRecord.winChance = Math.min((caap.stats.indicators.api / memberRecord.level / 10 * 100).dp(1),100);
						memberRecord.score = (memberRecord.winChance * (memberRecord.points /100 - 1) + 100).dp(0);
						memberRecord.scoreDamage = Math.atan((memberRecord.healthMax - memberRecord.healthNum)/1000)/Math.PI*2*100;
						memberRecord.scoreHealth = 100 - Math.atan(Math.max(memberRecord.healthNum - gf.minHealth, 0)/1000)/Math.PI*2*100;
                        memberRecord.guardian = $u.hasContent($j("img[src*='ability_sentinel']", member)) ? true : false;
                        memberRecord.polymorph = $u.hasContent($j("img[src*='polymorph_effect']", member)) ? true : false;
                        memberRecord.poison = $u.hasContent($j("img[src*='effect_poison']", member)) ? true : false;
                        memberRecord.confuse = $u.hasContent($j("img[src*='effect_confuse']", member)) ? true : false;
                        memberRecord.revive = $u.hasContent($j("img[src*='effect_revive']", member)) ? true : false;
                        memberRecord.shout = $u.hasContent($j("img[src*='effect_shout']", member)) ? true : false;
                        memberRecord.confidence = $u.hasContent($j("img[src*='effect_confidence']", member)) ? true : false;
						con.log(5, 'memberRecord', memberRecord);
						towerRecord.players++;
						towerRecord.actives += memberRecord.battlePoints > 0 ? 1 : 0;
						towerRecord.AC += (memberRecord.battlePoints > 0 && memberRecord.mclass == 'cleric') ? 1 : 0;
						stunnedClerics += (memberRecord.status == 'Stunned' && memberRecord.mclass == 'cleric') ? 1 : 0;
						towerRecord.clericHealthNum += memberRecord.mclass == 'cleric' ? memberRecord.healthNum : 0;
						towerRecord.clericHealthMax += memberRecord.mclass == 'cleric' ? memberRecord.healthMax : 0;

						
						// for testing
//						currentRecord.me.mclass = 'Cleric';
						guild_battle[which][currentRecord.me.mclass].forEach(function(att) {
							args = scoring.match(new RegExp(att.name + "\\[(.*?)\\]"));
							con.log(5,'scoring match attack', scoring, args, att.name);
							if (args && args.length >= 1) {
								if (currentRecord.attacks.indexOf(att.name) == -1) {
									currentRecord.attacks.push(att.name);
								}
								// First number is for multipliers, second is added
								score = 0;
								text = args[1];
								['cleric','rogue','warrior','mage'].forEach(function(value) {
									score += guild_battle.parse(memberRecord.mclass == value, text, value);
								});
								['polymorph','poison','confuse','guardian','revive','shout','confidence'].forEach(function(value) {
									score += guild_battle.parse(memberRecord[value], text, value);
								});
								score += guild_battle.parse(memberRecord.battlePoints, text, 'active');

								memberRecord.scores[att.name] = {};
								con.log(5,'record check', score, att.base,memberRecord[att.base], memberRecord.scoreDamage); 
								score *= memberRecord[att.base];
								memberRecord.scores[att.name].score = memberRecord.healthNum < gf.minHealth ? 0 : score.dp(2);
								general = text.match(new RegExp("@[^,]+"));
								memberRecord.scores[att.name].general = general && general.length > 0 ? general[0] : '';
							}
						});
							
					} else {
						con.warn("Unable to read member stats",tower, n, args);
					}
					currentRecord[which].members[tower + '-' + n] = memberRecord;
				}
			}

			towerRecord.clericLife = towerRecord.clerics ? (towerRecord.clericHealthNum/towerRecord.clericHealthMax * 100).dp(1) : 100.0;
			currentRecord[which].towers[tower] = towerRecord;
			con.log(2, "currentRecord", currentRecord);
			guild_battle.setItem(gf, currentRecord);
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
				record = guild_battle.getItem(gf),
				startTime = $u.setContent(fRecord.startTime, 0),
				timeBattlesList = config.getList('timed_guild_battles', ''),
				begin = new Date(),
				end = new Date(),
				timeString = '',
				result = '',
				maxTokens = 0,
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
				caap.stats.priorityGeneral = config.getItem('GClassOn',false) ? config.getItem('GClassGeneral','Use Current') : false;
			} else {
				caap.stats.priorityGeneral = false;
			}
			
			if (fRecord.state == 'Active' || gRecord.state == 'Active') {
					caap.stats.battleIdle = config.getItem('GFightOn',false) ? config.getItem('GFightGeneral','Use Current') : false;
			}


			
            for (i = 0; i < caap.stats.reviewPagesGB.length; i++) {
				con.log(5,'Pre  battle page',caap.stats.reviewPagesGB[i].page, gf, schedule.since(caap.stats.reviewPagesGB[i].review, 5 * 60));
				// For now, this looks at both festival and GB pages that are due for review
                if (caap.stats.reviewPagesGB[i].path.indexOf(gf.page) >= 0 && schedule.since(caap.stats.reviewPagesGB[i].review, 5 * 60)) {
					con.log(2,'Reviewing battle page',caap.stats.reviewPagesGB[i].path, caap.stats.reviewPagesGB);
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
			
			maxTokens = schedule.since(record.endTime, -8 * 60 ) ? 0 : config.getItem(gf.name + 'TokenMax', 8);
			con.log(5,'ATTACK!',record.tokens,maxTokens, schedule.since(record.endTime, -8 * 60 ) , record.state, !schedule.since(record.enteredTime, gf.waitHours * 60 * 60), record.me.healthNum > gf.minHealth);
			if (record.tokens > maxTokens && record.state == 'Active' && !schedule.since(record.enteredTime, gf.waitHours * 60 * 60) && record.me.healthNum > gf.minHealth) {
				['your'].forEach(function(team) {
					$j.each(record[team].members, function(location, member) {
						$j.each(member.scores, function(attack, obj) {
							if (obj.score >= t.score) {
								t.tower = location.replace(/-.*/,'');
								t.id = member.target_id;
								t.score = obj.score;
								t.attack = attack;
								t.team = team;
								t.general = obj.general;
								t.target = member;
							}
						});
					});
				});
				
				con.log(2, 'ATTACKING', t);
				
				return caap.navigate2(t.general + ',' + guild_battle.makePath(gf, t.team, t.tower) + ',clickjq:#special_defense_' + t.tower + '_' + t.id + ' input[src*="' + t.attack + '.gif"]');
			}
				
			if (timedSetting=='Never' || gRecord.state !== 'Start') {
				return false;
			}
			con.log(2, 'checking to see if starting GB', timeBattlesList);
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
				caap.stats.priorityGeneral = config.getItem('GClassOn',false) ? config.getItem('GClassGeneral','Use Current') : false;
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
                gbattleInst = [
                    'Battle available will initiate a guild battle whenever the Start Button is available',
                    'At fixed times will allow you to set a schedule of when to start battles',
                    'Never - disables starting guild battles'
                ],
				timed_guild_battles_inst = "List of times when Guild Battles should be started, such as 'Mon 1, Tue 15:30, Wed 8 PM, etc.  Guild battle will be attempted to be started at the listed time and up to two hours after.",
				guild_battle_scoring_inst = "List of score adjustments to pick targets",
				GBCheckFreqInstructions = "How often in minutes the Guild Battle top page will be visited to see if a Guild Battle is in progress",
				GBStartFreqInstructions = "How often in minutes the Guild Battle top page will be visited if an Auto-match is in progress",
                htmlCode = '';

            htmlCode += caap.startToggle('GuildBattles', 'GUILD BATTLES');
            htmlCode += caap.makeNumberFormTR("Check Guild Battle page", 'GBCheckFreq', GBCheckFreqInstructions, 15, '', '', true, false);
            htmlCode += caap.makeNumberFormTR("Check Guild Battles start", 'GBStartFreq', GBStartFreqInstructions, 5, '', '', true, false);
            htmlCode += caap.makeTD("Rate targets by:");
            htmlCode += caap.makeTextBox('guild_battle_scoring', guild_battle_scoring_inst, '', '');
            htmlCode += caap.makeCheckTR("Collect after", 'guild_battle_collect', false, 'Check to automatically collect after festival and Facebook guild battles');
            htmlCode += caap.makeCheckTR("Auto-join battle", 'guild_battle_enter', false, 'Check to automatically join festival and Facebook guild battles');
            htmlCode += caap.makeNumberFormTR("Use tokens over", 'FestivalTokenMax', 'Tokens over this amount will be used to attack or defend', 8, '', '', true, false);
            htmlCode += caap.makeNumberFormTR("Use tokens over", 'Guild BattleTokenMax', 'Tokens over this amount will be used to attack or defend', 8, '', '', true, false);
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
                    headers = ['Index', 'Name'],
                    values = ['index', 'name'],
                    headers2 = ['Class', 'Level', 'Health', 'Max', 'Status', 'Activity', 'Points', 'Win%'],
                    values2 = ['mclass', 'level', 'healthNum', 'healthMax', 'status', 'battlePoints', 'points', 'winChance'],
                    pp = 0,
                    i = {},
                    len = 0,
                    len1 = 0,
                    data = {
                        text: '',
                        color: '',
                        bgcolor: '',
                        id: '',
                        title: ''
                    },
                    handler = null,
					record = guild_battle.getItem(gf),
					members = record.your.members,
					towers = record.your.towers,
					member = {},
					tower = {},
                    head = '',
                    body = '',
                    row = '',
					towerHtml = '';
				con.log(5, "Dash record",record);
				
				if ($u.isArray(record.attacks)) {
					headers = headers.concat(record.attacks);
					headers = headers.concat(headers2);
					values = values.concat(record.attacks);
					values = values.concat(values2);
					con.log(5, 'Dashboard New arrays',record.attacks, headers, values);
				} else {
					headers = headers.concat(headers2);
					values = values.concat(values2);
					con.log(2, 'No attacks scored yet',record.attacks);
				}
				headers.push('Cnd');

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
								row += caap.makeTd({
									text: record.attacks.indexOf(values[pp]) >= 0 ?  member.scores[values[pp]].score : $u.hasContent(member[values[pp]]) ? member[values[pp]] : '',
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

                $j("#caap_" + gf.label, caap.caapTopObject).html($j(caap.makeTable("guild_battle", head, body)).dataTable({
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
				$j("#caap_" + gf.label, caap.caapTopObject).prepend(towerHtml);

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

                $j("span[id*='caap_" + gf.label + "_']", caap.caapTopObject).off('click', handler).on('click', handler);
                handler = null;

                session.setItem(gf.label + "DashUpdate", false);
            }

            return true;
        } catch (err) {
            con.error("ERROR in guild_battle.dashboard: " + err);
            return false;
        }
    };

}());
