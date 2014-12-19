/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,u,image64,gm,
schedule,gifting,state,army, general,session,monster:true,guild_monster */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          monster OBJECT
// this is the main object for dealing with Monsters
/////////////////////////////////////////////////////////////////////

(function() {
    "use strict";

    monster.records = [];

	monster.lastClick = null;
	
	monster.record = function() {
        this.data = {
            'name': false,
            'userName': '',
            'monster': '',
            'md5': '',
            'attacked': -1,
            'defended': -1,
            'damage': -1,
            'life': -1,
			'lpage' : '',
            'fortify': -1,
            'time': [],
            't2k': -1,
            'phase': -1,
            'miss': 0,
            'link': '',
            'rix': -1,
            'over': '',
            'color': '',
			'join' : false,
            'review': -1,
            'conditions': '',
            'charClass': '',
			'staminaList' : [],
			'energyList' : [],
			'multiNode' : false,
			'partsHealth' : [], // List of health of multi-part monsters, for example [100, 65, 94]
			'score' : 0, // Used to score monster finder targets to pick one to join
			'siegeLevel' : 0,
			'doSiege' : false,
			'spent' : {	'energy' : 0,
						'stamina' : 0},
			'debt' : {	'stamina' : 0,
						'start' : -1},
            'strength': -1,
            'stun': -1,
            'stunTime': -1,
            'stunDo': false,
			'stunSetting' : 0,
			'stunTarget' : 0,
            'status': false,
            'stunType': '',
			'targetPart' : -1,
			'listReviewed' : 0,
			'lMissing' : 0,
            'tip': '',
            'save': true,
            'select': false
        };
    };

    monster.engageButtons = {};
	
	monster.onMonsterHeader = "div[style*='dragon_title_owner'],div[style*='monster_header_'],div[style*='monster_'][style*='_title'],div[style*='monster_'][style*='_header'],div[style*='boss_'][style*='_header'],div[style*='boss_header_'],div[style*='festival_monsters_top_'],div[style*='newmonsterbanner_']";

    monster.completeButton = {
        'battle_monster': {
            'name': undefined,
            'button': undefined
        },
        'raid': {
            'name': undefined,
            'button': undefined
        }
    };

    // Keep object names short, and remove the ", the World Hydra" parts. Players should know what they're fighting
    // No commas allowed in Object names
    monster.info = {
         'Default Monster': {
            ach: 1000000,
            festival_ach: 1000000,
            staminaList: [1, 5],
			energyList: [10],
			siege: 5,
            defense_img: 'nm_green.jpg'
        },
       'Skaar Deathrune': {
            duration: 96,
            reqAtkButton: 'attack_monster_button.jpg',
            pwrAtkButton: 'attack_monster_button2.jpg',
            defButton: 'button_dispel.gif',
            defense_img: 'bar_dispel.gif',
            festival_dur: 120
        },
        'Ragnarok': {
            reqAtkButton: 'attack_monster_button.jpg',
            pwrAtkButton: 'attack_monster_button2.jpg',
            defButton: 'button_dispel.gif',
            defense_img: 'bar_dispel.gif'
        },
        'Genesis': {
            reqAtkButton: 'attack_monster_button.jpg',
            pwrAtkButton: 'attack_monster_button2.jpg',
            defButton: 'attack_monster_button3.jpg',
            defense_img: 'seamonster_ship_health.jpg',
            repair_img: 'repair_bar_grey.jpg'
        },
        'Cronus': {
            ach: 500000,
            festival_ach: 500000
		},
        'Invading Force': {
			alias: 'Dark Legion'
		},
        'Dark Legion': {
            duration: 168,
            ach: 1000,
            defense_img: 'seamonster_ship_health.jpg',
            repair_img: 'repair_bar_grey.jpg'
		},
        'Emerald Dragon': {
            duration: 72,
            ach: 100000,
            staminaList: [5, 10],
            attack_img: ['seamonster_power.gif', 'serpent_10stam_attack.gif']
        },
        'Frost Dragon': {
            duration: 72,
            ach: 100000,
            staminaList: [5, 10],
            attack_img: ['seamonster_power.gif', 'serpent_10stam_attack.gif'],
            festival_dur: 96,
            festival_ach: 30000
        },
        'Gold Dragon': {
            duration: 72,
            ach: 100000,
            staminaList: [5, 10],
            attack_img: ['seamonster_power.gif', 'serpent_10stam_attack.gif'],
            festival_dur: 96,
            festival_ach: 30000
        },
        'Ancient Red Dragon': {
            duration: 72,
            ach: 100000,
            staminaList: [5, 10],
            attack_img: ['seamonster_power.gif', 'serpent_10stam_attack.gif'],
            festival_dur: 96,
            festival_ach: 50000
        },
        'Karn': {
            duration: 120,
            ach: 15000
        },
        'Gildamesh': {
            duration: 72,
            ach: 15000,
            festival_dur: 96,
            festival_ach: 30000
        },
        'Colossus Of Terra': {
            duration: 72,
            ach: 20000,
            festival_dur: 96,
            festival_ach: 30000
        },
        'Sylvanas': {
            duration: 48,
            ach: 50000,
            festival_dur: 72,
            festival_ach: 30000
        },
        'Lotus': {
            duration: 48,
            ach: 500000
        },
        'Keira': {
            duration: 48,
            ach: 30000,
            reqAtkButton: 'event_attack1.gif',
            pwrAtkButton: 'event_attack2.gif'
        },
        'Amethyst Sea Serpent': {
            duration: 72,
            ach: 250000,
            staminaList: [10, 20],
            attack_img: ['serpent_10stam_attack.gif', 'serpent_20stam_attack.gif'],
            fortify_img: ['seamonster_fortify.gif'],
            defense_img: 'seamonster_ship_health.jpg',
            festival_dur: 96,
            festival_ach: 30000
        },
        'Ancient Sea Serpent': {
            duration: 72,
            ach: 250000,
            staminaList: [10, 20],
            attack_img: ['serpent_10stam_attack.gif', 'serpent_20stam_attack.gif'],
            fortify_img: ['seamonster_fortify.gif'],
            defense_img: 'seamonster_ship_health.jpg',
            festival_dur: 96,
            festival_ach: 30000
        },
        'Emerald Sea Serpent': {
            duration: 72,
            ach: 250000,
            staminaList: [10, 20],
            attack_img: ['serpent_10stam_attack.gif', 'serpent_20stam_attack.gif'],
            fortify_img: ['seamonster_fortify.gif'],
            defense_img: 'seamonster_ship_health.jpg',
            festival_dur: 96,
            festival_ach: 30000
        },
        'Sapphire Sea Serpent': {
            duration: 72,
            ach: 250000,
            staminaList: [10, 20],
            attack_img: ['serpent_10stam_attack.gif', 'serpent_20stam_attack.gif'],
            fortify_img: ['seamonster_fortify.gif'],
            defense_img: 'seamonster_ship_health.jpg',
            festival_dur: 96,
            festival_ach: 30000
        },
        'Deathrune Siege I': {
			duration: 88,
			ach: 50,
			staUse: 1
		},
        'Deathrune Siege II': {
			duration: 144,
			ach: 100,
			staUse: 1
        },
        'Mephistopheles': {
            duration: 48,
            ach: 200000,
            festival_dur: 89,
            festival_ach: 50000
        },
        'War Of The Red Plains': {
            tactics: true,
            duration: 168,
            ach: 10000,
        },
        'Bahamut': {
            ach: 4000000,
        },
        'Alpha Bahamut': {
            ach: 8000000,
            festival_ach: 2500000
        },
        'Azriel': {
            ach: 8000000,
            festival_ach: 4000000
        },
        'Alpha Mephistopheles': {
            ach: 12000000,
        },
        'Gehenna': {
            festival_dur: 96,
            festival_ach: 3500000
        },
        "Aurelius": {
            tactics: true,
            ach: 1000,
        },
        "Corvintheus": {
            festival_ach: 2500000
        },
        'Valhalla': {
            festival_ach: 2500000
        },
        'Jahanna': {
            festival_ach: 2500000
        },
        "Agamemnon": {
            festival_ach: 10000000
        },
        "Aurora": {
            festival_ach: 2500000
        },
        "Ambrosia": {
            festival_ach: 2500000
        },
        "Kromash": {
            festival_ach: 2500000
        },
        "Glacius": {
            festival_dur: 120
        },
        "Shardros": {
            festival_dur: 120
        },
        "Magmos": {
            festival_ach: 2500000
        },
        "Typhonus": {
            festival_ach: 2500000
        },
        "Malekus": {
            festival_ach: 2500000
        },
        'Cronus Astaroth': {
            ach: 1000000
        }
    };

    monster.list = function() {
        try {
            var i = '',
                list = [];

            for (i in monster.info) {
                if (monster.info.hasOwnProperty(i)) {
                    list.push(i);
                }
            }

            return list.sort();
        } catch (err) {
            con.error("ERROR in monster.list: " + err.stack);
            return undefined;
        }
    };

	// Cleans a link to put it in a standard order. If no argument passed, uses the last clicked URL
	monster.cleanLink = function(link, casuser, mpool) {
		var temp;
		if (!$u.isString(link) || link.length == 0) {
			link = session.getItem('clickUrl', '').replace('battle_expansion_monster.php','guildv2_battle_monster.php');
		}
		//con.log(2, 'CleanLink', link, casuser, mpool);
		temp = link.replace(/http.*\//,'');
		link = temp.replace(/\?.*/,'') + '?';
		['casuser=', 'mpool=', 'guild_creator_id=', 'guild_created_at=', 'slot=', 'monster_slot=', 'mid=', 'tower='].forEach( function(piece) {
			if (piece == 'casuser=' && temp.indexOf(piece) >= 0 && $u.setContent(casuser, 0) > 0) {
				//con.log(2, 'Cleaning link', piece, link);
				link += '&casuser=' + casuser;
			} else if (piece == 'mpool=' && temp.indexOf(piece) >= 0 && $u.setContent(mpool, 0) > 0) {
				//con.log(2, 'Cleaning link', piece, link);
				link += '&mpool=' + mpool;
			} else if (temp.indexOf(piece) >= 0) {
				//con.log(2, 'Cleaning link', piece, link);
				link += '&' + temp.match(new RegExp('(' + piece +  '\\w+)'))[1];
			}
		});
		return link.indexOf('=') >= 0 ? link.replace('?&', '?') : monster.getItem(monster.lastClick).link;
	};

    monster.which = function(img, entity) {
        try {
            if (!$u.hasContent(img) || !$u.isString(img)) {
                con.warn("img", img);
                throw "Invalid identifying img!";
            }

            if (!$u.hasContent(entity) || !$u.isString(entity)) {
                con.warn("entity", entity);
                throw "Invalid entity name!";
            }

            var i = '',
                k = 0,
                r = {},
                name = '';

            // current thinking is that continue should not be used as it can cause reader confusion
            // therefore when linting, it throws a warning
            /*jslint continue: true */
            for (i in monster.info) {
                if (monster.info.hasOwnProperty(i)) {
                    if ($u.hasContent(name)) {
                        break;
                    }

                    r = monster.info[i];
                    if (!$u.hasContent(r) || !$u.hasContent(r[entity]) || !$j.isArray(r[entity])) {
                        continue;
                    }

                    for (k = 0; k < r[entity].length; k += 1) {
                        if (img === r[entity][k]) {
                            name = i;
                            break;
                        }
                    }
                }
            }
            /*jslint continue: true */

            return name;
        } catch (err) {
            con.error("ERROR in monster.which: " + err.stack);
            return undefined;
        }
    };

    monster.getInfo = function(mName, value, defValue) {
        try {
			mName = $u.setContent(mName.monster, mName);
            if (!$u.isString(mName) || mName.length === 0) {
				con.warn('mName not passed a known monster name', mName);
                throw "Not passed a record";
            }
			mName = mName.replace(/^The /i,''),
			defValue = typeof defValue == 'undefined' ? monster.info['Default Monster'][value] : defValue;
            return $u.setContent(monster.info[mName],false) ? $u.setContent(monster.info[mName][value], defValue): defValue;
        } catch (err) {
            con.error("ERROR in monster.getInfo: " + err + ' stack ' + err.stack);
            return undefined;
        }
    };

    // Add a review page with path, and set 'entry' key to value, if wanted
    monster.setrPage = function(path, entry, value) {
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
            //caap.stats.reviewPages = config.getItem('caap.stats.reviewPages', []);

            for (var it = 0; it < caap.stats.reviewPages.length; it++) {
                if (caap.stats.reviewPages[it].path === path) {
                    if ($u.hasContent(entry)) {
                        caap.stats.reviewPages[it][entry] = value;
                    }
					caap.saveStats();
                    return true;
                }
            }
            if ($u.hasContent(entry)) {
                rPage[entry] = value;
            }

            caap.stats.reviewPages.push(rPage);
			caap.saveStats();
            //con.log(2,'setrPage',path, entry, value, caap.stats.reviewPages,rPage);
            return false;
        } catch (err) {
            con.error("ERROR in monster.setrPage: " + err.stack);
            return false;
        }
    };

    // Delete all review pages where 'entry' = value
    monster.deleterPage = function(entry, value) {
        try {
            if (!$u.hasContent(entry) || !$u.isString(entry)) {
                con.warn("Delete entry invalid", entry, value);
                throw "Invalid identifying entry!";
            }
            var deleted = 0;

            for (var i = caap.stats.reviewPages.length - 1; i >= 0; i += -1) {
                if (caap.stats.reviewPages[i][entry] === value) {
                    deleted += 1;
                    con.log(2,'Monster review pages before',caap.stats.reviewPages, entry, i);
                    caap.stats.reviewPages.splice(i,1);
                    con.log(2,'Monster review pages after',caap.stats.reviewPages, entry, i, deleted);
                }
            }
			caap.saveStats();
            return deleted;

        } catch (err) {
            con.error("ERROR in monster.deleterPage: " + err.stack);
            return false;
        }
    };

    // Delete or add review page based on if 'tf' is true or false
    monster.togglerPage = function(path, tf, entry, value) {
        try {
            if (tf) {
                return monster.setrPage(path, entry, value);
            }
            return monster.deleterPage('path', path);
        } catch (err) {
            con.error("ERROR in monster.togglerPage: " + err.stack);
            return false;
        }
    };

    monster.load = function() {
        try {
            monster.records = gm.getItem('monster.records', 'default');
            if (monster.records == 'default' || !$j.isArray(monster.records)) {
				con.warn('Monster records reset', monster.records);
                monster.records = gm.setItem('monster.records', []);
				monster.fullReview();
            }
			caap.fillRecords(monster.records, new monster.record().data);
			monster.save();
            caap.stats.reviewPages = $u.setContent(caap.stats.reviewPages, []);

			var pageList = [
				'player_monster_list',
				'ajax:player_monster_list.php?monster_filter=2',
				'ajax:player_monster_list.php?monster_filter=3',
				'ajax:raid.php'];
				
			caap.stats.reviewPages.forEach( function(page) {
				if (pageList.indexOf(page.path) < 0) {
					con.log(1, 'Deleted path ' + page.path + ' from monster pages review', caap.stats.reviewPages);
					monster.deleterPage('path', page.path);
				}
            });
			
			monster.togglerPage(pageList[0], caap.stats.level > 6 || caap.stats.level === 0);
			monster.togglerPage(pageList[1], caap.stats.level > 6 || caap.stats.level === 0);
			monster.togglerPage(pageList[2], caap.stats.level > 6 || caap.stats.level === 0);
			monster.togglerPage(pageList[3], caap.stats.level > 7 || caap.stats.level === 0);

            session.setItem("MonsterDashUpdate", true);
            session.setItem("FeedDashUpdate", true);
			//con.log(2,'Load Monster records after load',monster.records, caap.stats.reviewPages, caap.stats.level);
            return true;
        } catch (err) {
            con.error("ERROR in monster.load: " + err.stack);
            return false;
        }
    };

    monster.save = function(src) {
        try {
/*            for (var i = monster.records.length - 1; i >= 0 ; i--) {
                if (monster.records[i].flag) {
                    monster.records.splice(i,1);
                }
            }
*/			if (caap.domain.which === 3) {
                con.log(4, "monster.save FB messaging set item");
                caap.messaging.setItem('monster.records', monster.records);
            } else {
                gm.setItem('monster.records', monster.records);
                if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif") && src !== "caapif") {
                    con.log(4, "monster.save send");
                    caap.messaging.setItem('monster.records', monster.records);
                }
            }

            if (caap.domain.which !== 0) {
                session.setItem("MonsterDashUpdate", true);
				session.setItem("FeedDashUpdate", true);
            }
            return true;
        } catch (err) {
            con.error("ERROR in monster.save: " + err.stack);
            return false;
        }
    };

	monster.damaged = function(cM) {
		if (!$u.isObject(cM)) {
			con.warn('Invalid monster record passed to scan.joined.', cM);
		}
		return $u.setContent(cM.damage, 0) > 0;
	};

    monster.parseCondition = function(type, conditions) {
        try {
			
			//con.log(2, 'PARSE', type, conditions);

            if (!$u.isString(type) || !$u.isString(conditions)) {
				con.warn('Invalid data passed to monster.parseCondition', type, conditions);
				return false;
            }

            var str = conditions.regex(new RegExp(':' + type + '([\\d\\.]*)(\\w?)'));
			
			if (!str) {
				return false;
			}
			
            var value = $u.setContent(str[1], 0),
                first = false,
                second = false;

            if ((/k/i.test(str[2]) || /m/i.test(str[2]))) {
                first = /k/i.test(str[2]);
                second = /m/i.test(str[2]);
                value = value * 1000 * (first + second * 1000);
            }

            return value;
        } catch (err) {
            con.error("ERROR in monster.parseCondition: " + err, type, conditions);
            return false;
        }
    };

	// Do KOB parsing and achievement/max damage levels plus colorization
   monster.parsing = function(cM) {
        try {
			// Start of Keep On Budget (KOB) code Part 1 -- required variables
			//con.log(2, 'Start of Keep On Budget (KOB) Code');
               var KOBenable = false,
                KOBbiasHours = 0,
                KOBach = false,
                KOBmax = false,
                KOBminFort = false,
                KOBtmp = 0,
                KOBtimeLeft = 0,
                KOBbiasedTF = 0,
                KOBPercentTimeRemaining = 0,
                KOBtotalMonsterTime = 0,
                isTarget = false,
				achLevel = monster.parseCondition('ach', cM.conditions),
				maxDamage = monster.parseCondition('max', cM.conditions),
				maxToFortify = monster.parseCondition('f%', cM.conditions),
				maxSta = monster.parseCondition('sta', cM.conditions);

			cM.color = '';
			cM.over = '';
			maxToFortify = maxToFortify !== false ? maxToFortify : config.getItem('MaxToFortify', 0);
			achLevel = achLevel === 0 ? 1 : achLevel; // Added to prevent ach === 0 defaulting to false 
			if (achLevel === false) {
				achLevel = monster.getInfo(cM, 'ach');
			}
			maxDamage = maxDamage === 0 ? 1 : maxDamage;  // Added to prevent max === 0 defaulting to false 

			//default is disabled for everything
			KOBenable = false;

			//default is zero bias hours for everything
			KOBbiasHours = 0;

			//KOB needs to follow achievement mode for this monster so that KOB can be skipped.
			KOBach = false;

			//KOB needs to follow max mode for this monster so that KOB can be skipped.
			KOBmax = false;

			//KOB needs to follow minimum fortification state for this monster so that KOB can be skipped.
			KOBminFort = false;

			//create a temp variable so we don't need to call parseCondition more than once for each if statement
			KOBtmp = monster.parseCondition('kob', cM.conditions);
			if (KOBtmp !== false && $u.isNaN(KOBtmp)) {
				con.log(2, 'KOB NaN branch');
				KOBenable = true;
				KOBbiasHours = 0;
			} else if (KOBtmp === false) {
				con.log(5, 'KOB false branch');
				KOBenable = false;
				KOBbiasHours = 0;
			} else {
				con.log(2, 'KOB passed value branch');
				KOBenable = true;
				KOBbiasHours = KOBtmp;
			}

			//test if user wants kob active globally
			if (!KOBenable && (gm ? gm.getItem('KOBAllMonters', false, hiddenVar) : false)) {
				KOBenable = true;
			}

			//disable kob if in level up mode or if we are within 5 stamina of max potential stamina
			if (caap.inLevelUpMode() || caap.stats.stamina.num >= caap.stats.stamina.max - 5) {
				KOBenable = false;
			}

			if (KOBenable) {
				con.log(2, 'Level Up Mode: ', caap.inLevelUpMode());
				con.log(2, 'Stamina Avail: ', caap.stats.stamina.num);
				con.log(2, 'Stamina Max: ', caap.stats.stamina.max);

				//log results of previous two tests
				con.log(2, 'KOBenable: ', KOBenable);
				con.log(2, 'KOB Bias Hours: ', KOBbiasHours);
			}

			//Total Time alotted for monster
			KOBtotalMonsterTime = monster.getInfo(cM.monster, 'duration', cM.page === 'festival_battle_monster' ? 192 : 168);
			if (KOBenable) {
				con.log(2, 'Total Time for Monster: ', KOBtotalMonsterTime);

				//Total Damage remaining
				con.log(2, 'HP left: ', cM.life);
			}

			//Time Left Remaining
			KOBtimeLeft = cM.time[0] + (cM.time[1] * 0.0166);
			if (KOBenable) {
				con.log(2, 'TimeLeft: ', KOBtimeLeft);
			}

			//calculate the bias offset for time remaining
			KOBbiasedTF = KOBtimeLeft - KOBbiasHours;

			//for 7 day monsters we want kob to not permit attacks (beyond achievement level) for the first 24 to 48 hours
			// -- i.e. reach achievement and then wait for more players and siege assist clicks to catch up
			if (KOBtotalMonsterTime >= 168) {
				KOBtotalMonsterTime = KOBtotalMonsterTime - (gm ? gm.getItem('KOBDelayStart', 48, hiddenVar) : 48);
			}

			//Percentage of time remaining for the currently selected monster
			KOBPercentTimeRemaining = Math.round(KOBbiasedTF / KOBtotalMonsterTime * 1000) / 10;
			if (KOBenable) {
				con.log(2, 'Percent Time Remaining: ', KOBPercentTimeRemaining);
			}

			// End of Keep On Budget (KOB) code Part 1 -- required variables

			isTarget = (cM.md5 === state.getItem('targetFromraid', '') || cM.md5 === state.getItem('targetFromMonster', '') || cM.md5 === state.getItem('targetFromFortify', ''));
			
			//con.log(2, 'MAX DAMAGE', maxDamage, cM.damage);
			if ((maxDamage && cM.damage >= maxDamage) || (maxSta && cM.spent.stamina >= maxSta)) {

				cM.color = 'red';
				cM.over = 'max';
				//used with KOB code
				KOBmax = true;
				//used with kob debugging
				if (KOBenable) {
					con.log(2, 'KOB - max activated');
				}

			} else if (cM.fortify !== -1 && cM.fortify < config.getItem('MinFortToAttack', 1)) {
				cM.color = 'purple';
				//used with KOB code
				KOBminFort = true;
				//used with kob debugging
				if (KOBenable) {
					con.log(2, 'KOB - MinFort activated');
				}

			} else if (cM.damage >= achLevel && (config.getItem('AchievementMode', false) || monster.parseCondition('ach', cM.conditions) !== false)) {
				cM.color = 'darkorange';
				cM.over = 'ach';
				//used with KOB code
				KOBach = true;
				//used with kob debugging
				if (KOBenable) {
					con.log(2, 'KOB - achievement reached');
				}

			}

			//Start of KOB code Part 2 begins here
			if (KOBenable && !KOBmax && !KOBminFort && KOBach && cM.life < KOBPercentTimeRemaining) {
				//kob color
				cM.color = 'magenta';
				// this line is required or we attack anyway.
				cM.over = 'max';
				//used with kob debugging
				if (KOBenable) {
					con.log(2, 'KOB - budget reached');
				}

			} else {
				if (!KOBmax && !KOBminFort && !KOBach) {
					//the way that the if statements got stacked, if it wasn't kob it was painted black anyway
					//had to jump out the black paint if max, ach or fort needed to paint the entry.
					cM.color = $u.bestTextColor(state.getItem("StyleBackgroundLight", "#E0C961"));
				}
			}
			//End of KOB code Part 2 stops here.
        } catch (err) {
            con.error("ERROR in monster.KOB: " + err, cM);
            return false;
        }
    };
	
    monster.getItem = function(md5) {
        try {
            var it = 0,
                success = false,
                newRecord = {},
                record = {};

            if (!$u.isString(md5)) {
                throw "Invalid identifying md5!";
            }

            if ($u.hasContent(md5)) {
                for (it = 0; it < monster.records.length; it += 1) {
                    if (monster.records[it].md5 === md5) {
                        success = true;
                        break;
                    }
                }
            }

            if (success) {
                record = monster.records[it];
                con.log(3, "Got monster record", md5, record);
            } else {
                newRecord = new monster.record();
                newRecord.data.md5 = md5;
                record = newRecord.data;
                con.log(3, "New monster record", md5, record);
            }

            return record;
        } catch (err) {
            con.error("ERROR in monster.getItem: " + err, md5, err.stack);
            return undefined;
        }
    };

    monster.setItem = function(record) {
        try {

            if (!$u.hasContent(record) || !$j.isPlainObject(record)) {
                throw "Not passed a record";
            }

            if (!$u.isString(record.md5) || !$u.hasContent(record.md5)) {
                con.warn("md5", record.md5);
                throw "Invalid identifying md5!";
            }

            var it = 0,
                success = false;

            if (config.getItem('enableMonsterFinder', false) && !record.select) {
                //feed.checked(record);
            }

            record.select = false;
			for (it = 0; it < monster.records.length; it += 1) {
				if (monster.records[it].md5 === record.md5) {
					success = true;
					break;
				}
			}

			if (success) {
				monster.records[it] = record;
				con.log(3, "Updated monster record", record, monster.records);
			} else {
				monster.records.push(record);
				con.log(3, "Added monster record", record, monster.records);
			}

			monster.save();
			con.log(3, "save monster record", monster.records);

            return record;
        } catch (err) {
            con.error("ERROR in monster.setItem: " + err, record, which, monster.records);
            return undefined;
        }
    };

    monster.deleteItem = function(md5) {
        try {
            var it = 0,
				success = false;

            if (!$u.isString(md5) || !$u.hasContent(md5)) {
                con.warn("md5", md5);
                throw "Invalid identifying md5!";
            }
			
			for (it = 0; it < monster.records.length; it += 1) {
				if (monster.records[it].md5 === md5) {
					success = true;
					monster.records.splice(it, 1);
					monster.save();
					con.log(3, "Deleted monster record", md5, monster.records);
					caap.updateDashboard(true);
					return;
				}
			}

            if (!success) {
                con.warn("Couldn't find monster record to delete", md5, monster.records);
            }

            return success;
        } catch (err) {
            con.error("ERROR in monster.deleteItem: " + err.stack);
            return false;
        }
    };

    monster.t2kCalc = function(cM) {
        try {
            var timeLeft = cM.time[0] + (cM.time[1] * 0.0166),
                duration = monster.getInfo(cM, 'duration', cM.page === 'festival_battle_monster' ? 192 : 168),
                timeUsed = duration - timeLeft,
                T2K = ((cM.life * timeUsed) / (100 - cM.life)).dp(2);

			con.log(3, 'T2K: ', $u.minutes2hours(T2K));
			return T2K;
        } catch (err) {
            con.error("ERROR in monster.t2kCalc: " + err.stack);
            return 0;
        }
    };

    monster.characterClass = {
        'Warrior': ['Strengthen', 'Heal'],
        'Rogue': ['Cripple'],
        'Mage': ['Deflect'],
        'Cleric': ['Heal'],
        'Warlock': ['Heal', 'Deflect'],
        'Ranger': ['Strengthen', 'Heal', 'Cripple']
    };

    monster.fullReview = function(which) {
        try {
            for (var it = monster.records.length - 1; it >= 0; it -= 1) {
                if ((which == 'Feed') === (monster.records[it].status === 'Join')) {
					//con.log(2, 'FullReview deleting monster ' + monster.records[it].name, monster.records[it], which);
					monster.deleteItem(monster.records[it].md5);
				}
			}
			if (which != 'Feed') {
				caap.stats.reviewPages.forEach( function(page) {
					monster.setrPage(page.path,'review',0);
				});
				schedule.setItem('NotargetFrombattle_monster', 0);
			}
            caap.updateDashboard(true);
            localStorage.AFrecentAction = false;
            monster.save();

            return true;
        } catch (err) {
            con.error("ERROR in monster.fullReview: " + err.stack);
            return false;
        }
    };

	monster.worldMonsterCount = 0;
	
    monster.select = function(force) {
        try {
            if (!caap.oneMinuteUpdate('selectMonster', force) || caap.stats.level < 7) {
                return false;
            }

            //con.log(2, 'SELECTING MONSTER');
            var monsterList = {
					'battle_monster': [],
					'raid': [],
					'any': []
				},
				it = 0,
                len = 0,
                len1 = 0,
                len2 = 0,
                len3 = 0,
                s = 0,
				cM = {},
				whichList = 'any',
				conditions = '',
                selectTypes = [],
				maxToFortify = 0,
                nodeNum = 0,
                firstOverAch = '',
                firstUnderMax = '',
                firstFortOverAch = '',
                firstFortUnderMax = '',
                firstStunOverAch = '',
                firstStunUnderMax = '',
                firstStrengthOverAch = '',
                firstStrengthUnderMax = '',
                strengthTarget = '',
                fortifyTarget = '',
                stunTarget = '',
				siegeLimit,
                target = {
                    'battle_monster': '',
                    'raid': '',
                    'fortify': ''
                },
                monsterMD5 = '',
                cM = {},
                //monstType             = '',
                p = 0,
                m = 0,
                attackOrderList = [];

            // Next we get our monster objects from the repository and break them into separate lists
            // for monster or raid.  If we are serializing then we make one list only.

			monster.worldMonsterCount = 0;
            for (it = monster.records.length - 1; it >= 0; it -= 1) {
				cM = monster.records[it];
                if (monster.damaged(cM)) {
					//con.log(2,'Review timer check', cM.name, cM.lMissing, typeof cM.lpage, typeof cM.lpage == 'undefined', schedule.since($u.setContent(cM.listReviewed, 0), 3 * 3600));
					if (cM.lMissing > 3 || (typeof cM.lpage == 'undefined' && cM.listReviewed > 0 && schedule.since($u.setContent(cM.listReviewed, 0), 3 * 3600))) {
						con.log(2, 'Deleting monster ' + cM.name + ' since not seen on monster list over three times', cM);
						monster.deleteItem(cM.md5);
					} else {
						if (cM.charClass.length) {
							if (cM.color !== 'grey' && schedule.since(cM.stunTime, 0)) {
								con.log(2, "Review monster due to class timer", cM.name);
								cM.review = -1;
							}
						}
						if (cM.link.indexOf('mpool=3') >= 0 && cM.link.indexOf('festival') < 0 && cM.status === 'Attack') {
							monster.worldMonsterCount += 1;
						}
						//con.log(2, 'World Monster Count after ' + cM.name + ' = ' + monster.worldMonsterCount, cM);
						cM.conditions = 'none';
						whichList = config.getItem('SerializeRaidsAndMonsters', false) ? 'any' : cM.link.indexOf('raid') >=0 ? 'raid' : 'battle_monster';
						monsterList[whichList].push(cM.md5);
					}
                } else {
					cM.conditions = feed.addConditions(cM) || cM.conditions;
				}
				if (cM.status !== 'Attack'){
					cM.debt.start = -1;
					cM.debt.stamina = 0;
				}
            }

            monster.save();

            //PLEASE NOTE BEFORE CHANGING
            //The Serialize Raids and Monsters dictates a 'single-pass' because we only need select
            //one "targetFromxxxx" to fill in. The other MUST be left blank. This is what keeps it
            //serialized!!! Trying to make this two pass logic is like trying to fit a square peg in
            //a round hole. Please reconsider before doing so.
            if (whichList === 'any') {
                selectTypes = ['any'];
            } else {
                selectTypes = ['battle_monster', 'raid'];
            }

            // We loop through for each selection type (only once if serialized between the two)
            // We then read in the users attack order list

            selectTypes.forEach(function(type) {
                if (!$u.hasContent(monsterList[type])) {
					return;
                }

                firstOverAch = '';
                firstUnderMax = '';
                firstFortOverAch = '';
                firstFortUnderMax = '';
                firstStunOverAch = '';
                firstStunUnderMax = '';
                firstStrengthOverAch = '';
                firstStrengthUnderMax = '';
                strengthTarget = '';
                fortifyTarget = '';
                stunTarget = '';

                // The extra apostrophe at the end of attack order makes it match any "soandos's monster" so it always selects a monster if available
                if (type === 'any') {
                    attackOrderList = config.getList('orderbattle_monster', '');
                    $j.merge(attackOrderList, config.getList('orderraid', '').concat('your', "'"));
                } else {
                    attackOrderList = config.getList('order' + type, '').concat('your', "'");
                }

                //con.log(2, 'attackOrderList', attackOrderList);
                // Next we step through the users list getting the name and conditions
                attackOrderList.forEach( function(aoItem) {
                    if (!aoItem.trim()) {
                        return;
                    }
                    // Now we try to match the users name against our list of monsters
                    monsterList[type].forEach(function(thisMon) {
						cM = monster.getItem(thisMon);
                        // If we set conditions on this monster already then we do not reprocess
                        if (cM.conditions !== 'none') {
                            return;
                        }
						conditions = aoItem.replace(new RegExp("^[^:]+"), '').toString().trim();
                        // If this monster does not match, skip to next one
                        if (!monster.getItem(thisMon).name.toLowerCase().hasIndexOf(aoItem.match(new RegExp("^[^:]+")).toString().trim().toLowerCase()) && (conditions.regex(/(:conq)\b/) != (cM.lpage == "ajax:player_monster_list.php?monster_filter=2"))) {
                            return;
                        }

                        //Monster is a match so we set the conditions
                        cM.conditions = conditions;
						cM.fullC = aoItem;

						cM.select = true;

                        monster.setItem(cM);
                        // If it's complete or collect rewards, no need to process further
                        if (cM.color === 'grey') {
                            return;
                        }
						
						monster.parsing(cM);
						
						if (cM.siegeLevel > 0) {
							siegeLimit = conditions.regex(/:!s\b/) ? 0 : !conditions.regex(/:fs\b/) ? monster.parseCondition("s", cM.conditions) 
								: (caap.stats.stamina.num >= caap.maxStatCheck('stamina') && cM.phase > 2) ? 50 : 1;
							siegeLimit = siegeLimit !== false ? siegeLimit : config.getItem('siegeUpTo','Never') === 'Never' ? 0 : config.getItem('siegeUpTo','Never');
							
							cM.doSiege = cM.siegeLevel <= siegeLimit && cM.damage > 0 
								&& (cM.phase > 1 || (conditions && conditions.regex(/:fs\b/)));
							//con.log(2, "Page Review " + (cM.doSiege ? 'DO siege ' : "DON'T siege ") + cM.name, cM.siegeLevel, siegeLimit, cM.phase, config.getItem('siegeUpTo','None'), cM.conditions.match(':fs:'), cM.conditions.match(':!s:'));
						} else {
							cM.doSiege = false;
							cM.siegeLevel = 1000;
						}

                        // monster.parsing set our 'color' and 'over' values. Check these to see if this is the monster we should select
                        if (!firstUnderMax && cM.color !== 'purple') {
                            if (cM.over === 'ach') {
                                if (!firstOverAch) {
                                    firstOverAch = thisMon;
                                    con.log(3, 'firstOverAch', firstOverAch, cM.name);
                                }
                            } else if (cM.over !== 'max') {
                                firstUnderMax = thisMon;
                                con.log(3, 'firstUnderMax', firstUnderMax, cM.name);
                            }
                        }

						if (!cM.charClass.length || (cM.charClass.length && monster.characterClass[cM.charClass] && monster.characterClass[cM.charClass].hasIndexOf('Heal'))) {
							maxToFortify = (monster.parseCondition('f%', cM.conditions) !== false) ? monster.parseCondition('f%', cM.conditions) : config.getItem('MaxToFortify', 0);
							if (cM.fortify >= 0 && !firstFortUnderMax && cM.fortify < maxToFortify) {
								if (cM.over === 'ach') {
									if (!firstFortOverAch) {
										firstFortOverAch = thisMon;
										con.log(3, 'firstFortOverAch', firstFortOverAch, cM.name);
									}
								} else if (cM.over !== 'max') {
									firstFortUnderMax = thisMon;
									con.log(3, 'firstFortUnderMax', firstFortUnderMax, cM.name);
								}
							}
						}

						if (cM.charClass.length) {
							if (config.getItem("StrengthenTo100", true) && monster.characterClass[cM.charClass] && monster.characterClass[cM.charClass].hasIndexOf('Strengthen')) {
								if (!firstStrengthUnderMax && cM.strength < 100) {
									if (cM.over === 'ach') {
										if (!firstStrengthOverAch) {
											firstStrengthOverAch = thisMon;
											con.log(3, 'firstStrengthOverAch', firstStrengthOverAch, cM.name);
										}
									} else if (cM.over !== 'max') {
										firstStrengthUnderMax = thisMon;
										con.log(3, 'firstStrengthUnderMax', firstStrengthUnderMax, cM.name);
									}
								}
							}

							if (!firstStunUnderMax && cM.stunDo) {
								if (cM.over === 'ach') {
									if (!firstStunOverAch) {
										firstStunOverAch = thisMon;
										con.log(3, 'firstStunOverAch', firstStunOverAch, cM.name);
									}
//                                    } else if (cM.over !== 'max') {
								} else {
									firstStunUnderMax = thisMon;
									con.log(3, 'firstStunUnderMax', firstStunUnderMax, cM.name);
								}
							}
                        }
                    });
                });

                // Now we use the first under max/under achievement that we found. If we didn't find any under
                // achievement then we use the first over achievement
                if (type !== 'raid') {
                    strengthTarget = $u.setContent(firstStrengthUnderMax, firstStrengthOverAch);
                    fortifyTarget = $u.setContent(firstFortUnderMax, firstFortOverAch);
                    stunTarget = $u.setContent(firstStunUnderMax, firstStunOverAch);
					target.fortify = stunTarget || fortifyTarget || strengthTarget;
                }

                // If we've got a monster for this selection type then we set the GM variables for the name
                // and stamina requirements
                monsterMD5 = $u.setContent(firstUnderMax, firstOverAch);
                if (monsterMD5) {
					whichList = monster.getItem(monsterMD5).link.indexOf('raid') >=0 ? 'raid' : 'battle_monster';
                    target[whichList] = monsterMD5;
                }
            });

            state.setItem('targetFromMonster', target.battle_monster);
            state.setItem('targetFromraid', target.raid);
            state.setItem('targetFromFortify', target.fortify);
			
            caap.updateDashboard(true);
            return true;
        } catch (err) {
            con.error("ERROR in monster.select: " + err.stack);
            return false;
        }
    };

    monster.menu = function() {
        try {
            var XMonsterInstructions = "Start attacking if stamina is above this point",
                XMinMonsterInstructions = "Do not attack if stamina is below this point",
                attackOrderInstructions = "List of search words that decide which monster to attack first. " + "Use words in player name or in monster name. To specify max damage follow keyword with " +
                    ":max token and specifiy max damage values. Use 'k' and 'm' suffixes for thousand and million. " + "To override achievement use the ach: token and specify damage values.",
                fortifyInstructions = "Fortify if ship health is below this % (leave blank to disable)",
                questFortifyInstructions = "Do quests if ship health is above this % and quest mode is set to Not Fortify (leave blank to disable)",
                stopAttackInstructions = "Do not attack if ship health is below this % (leave blank to disable)",
                monsterachieveInstructions = "Check if monsters have reached achievement damage level first. Switch when achievement met.",
                demiPointsFirstInstructions = "Do not attack monsters until you have gotten all your demi points from battling. Set 'Battle When' to 'No Monster' or 'Demi Points Only'. " +
                    "Be sure to set battle to Invade or Duel, War does not give you Demi Points.",
                powerattackInstructions = "Use power attacks. Only do normal attacks if power attack not possible",
                powerattackMaxInstructions = "Use maximum power attacks globally on Skaar, Genesis, Ragnarok, and Bahamut types. Only do normal power attacks if maximum power attack not possible",
                useTacticsInstructions = "Use the Tactics attack method, on monsters that support it, instead of the normal attack. You must be level 50 or above.",
                useTacticsThresholdInstructions = "If monster health falls below this percentage then use the regular attack buttons instead of tactics.",
                collectRewardInstructions = "Automatically collect monster rewards.",
                strengthenTo100Instructions = "Do not wait until the character class gets a bonus for strengthening but perform strengthening as soon as the energy is available.",
                healPercStamInst = "After I hit a monster, heal my damage until the health is at least as high as when I started, or up to this percent of my stamina spent. If energy is not available to heal, monsters will not be hit.",
                mbattleList = ['Stamina Available', 'At Max Stamina', 'At X Stamina', 'Stay Hidden', 'Review Only', 'Never'],
                mbattleInst = [
                    'Stamina Available will attack whenever you have enough stamina',
                    'At Max Stamina will attack when stamina is at max and will burn down all stamina when able to level up',
                    'At X Stamina you can set maximum and minimum stamina to battle',
                    'Stay Hidden uses stamina to try to keep you under 10 health so you cannot be attacked, while also attempting to maximize your stamina use for Monster attacks. YOU MUST SET BATTLE WHEN TO "STAY HIDDEN" TO USE THIS FEATURE.',
                    'Reviews Only will only review, siege, collect, clear etc. according to settings',
                    'Never - disables attacking monsters'],
                fortifyList = ['Energy Available', 'At Max Energy', 'At X Energy', 'Never'],
                fortifyInst = [
                    'Energy Available will fortify whenever you have enough energy',
                    'At Max Energy will fortify when energy is at max and will burn down all energy when able to level up',
                    'At X Energy you can set maximum and minimum energy to fortify',
                    'Never - disables fortifying monsters'],
                stunList = ['Immediately', '5', '4', '3', '2', '1', 'Never'],
                stunInst = [
                    'Cripple/Deflect will be as soon as possible',
                    'Cripple/Deflect will be when 5 hours are left, plus or minus up to 30 min',
                    'Cripple/Deflect will be when 4 hours are left, plus or minus up to 30 min',
                    'Cripple/Deflect will be when 3 hours are left, plus or minus up to 30 min',
                    'Cripple/Deflect will be when 2 hours are left, plus or minus up to 30 min',
                    'Cripple/Deflect will be when 1 hours are left, plus or minus up to 30 min',
                    'Cripple/Deflect is disabled'],
                siegeList = ['Never', '1', '50', '250'],
                siegeInst = [
                    'Never siege monsters',
                    'Siege monsters only for one point of stamina, will not siege unless 1st siege has been launched',
                    'Siege monsters for up to 50 stamina, will not siege unless 1st siege has been launched',
                    'Siege monsters for up to 250 stamina, will not siege unless 1st siege has been launched'],
                delayStayHiddenInstructions = "Delay staying hidden if \"safe\" to wait for enough stamina to attack monster.",
                monsterDelayInstructions = "Max random delay (in seconds) to battle monsters",
                demiPtItem = 0,
                subCode = '',
                htmlCode = '';

            htmlCode += caap.startToggle('Monster', 'MONSTER');
            htmlCode += caap.makeDropDownTR("Attack When", 'WhenMonster', mbattleList, mbattleInst, '', 'Never', false, false, 62);
            htmlCode += caap.startDropHide('WhenMonster', '', 'Never', true);
            htmlCode += "<div id='caap_WhenMonsterStayHidden_hide' style='color: red; font-weight: bold; display: ";
            htmlCode += (config.getItem('WhenMonster', 'Never') === 'Stay Hidden' && config.getItem('WhenBattle', 'Never') !== 'Stay Hidden' ? 'block' : 'none') + "'>";
            htmlCode += "Warning: Battle Not Set To 'Stay Hidden'";
            htmlCode += "</div>";
            htmlCode += caap.startDropHide('WhenMonster', 'XStamina', 'At X Stamina', false);
            htmlCode += caap.makeNumberFormTR("Start At Or Above", 'XMonsterStamina', XMonsterInstructions.replace('stamina','energy'), 1, '', '', true, false);
            htmlCode += caap.makeNumberFormTR("Stop At Or Below", 'XMinMonsterStamina', XMinMonsterInstructions.replace('stamina','energy'), 0, '', '', true, false);
            htmlCode += caap.endDropHide('WhenMonster', 'XStamina', 'At X Stamina', false);
            htmlCode += caap.startDropHide('WhenMonster', 'DelayStayHidden', 'Stay Hidden', false);
            htmlCode += caap.makeCheckTR("Delay hide if \"safe\"", 'delayStayHidden', true, delayStayHiddenInstructions, true);
            htmlCode += caap.endDropHide('WhenMonster', 'DelayStayHidden', 'Stay Hidden', false);
            htmlCode += caap.makeNumberFormTR("Monster delay secs", 'seedTime', monsterDelayInstructions, 300, '', '');
            htmlCode += caap.makeCheckTR("Use Tactics", 'UseTactics', false, useTacticsInstructions);
            htmlCode += caap.startCheckHide('UseTactics');
            htmlCode += caap.makeNumberFormTR("Health threshold", 'TacticsThreshold', useTacticsThresholdInstructions, 75, '', '', true, false);
            htmlCode += caap.endCheckHide('UseTactics');
            htmlCode += caap.makeCheckTR("Power Attack Only", 'PowerAttack', true, powerattackInstructions);
            htmlCode += caap.startCheckHide('PowerAttack');
            htmlCode += caap.makeCheckTR("Power Attack Max", 'PowerAttackMax', false, powerattackMaxInstructions, true);
            htmlCode += caap.endCheckHide('PowerAttack');
            htmlCode += caap.makeDropDownTR("Siege up to", 'siegeUpTo', siegeList, siegeInst, '', 'Never', false, false, 62);
            htmlCode += caap.makeCheckTR("Collect Monster Rewards", 'monsterCollectReward', false, collectRewardInstructions);
            htmlCode += caap.makeCheckTR("Clear Complete Monsters", 'clearCompleteMonsters', false, '');
            //htmlCode += caap.makeCheckTR("Battle Conquest Monsters", 'conquestMonsters', false, '');
            htmlCode += caap.makeCheckTR("Achievement Mode", 'AchievementMode', true, monsterachieveInstructions);
            htmlCode += caap.makeCheckTR("Get Demi Points First", 'DemiPointsFirst', false, demiPointsFirstInstructions);
            htmlCode += caap.startCheckHide('DemiPointsFirst');
            for (demiPtItem = 0; demiPtItem < caap.demiQuestList.length; demiPtItem += 1) {
                subCode += "<span title='" + caap.demiQuestList[demiPtItem] + "'>";
                subCode += "<img alt='" + caap.demiQuestList[demiPtItem] + "' src='data:image/gif;base64," + image64[caap.demiQuestList[demiPtItem]] + "' height='15px' width='15px'/>";
                subCode += caap.makeCheckBox('DemiPoint' + demiPtItem, true);
                subCode += "</span>";
            }

            htmlCode += caap.makeTD(subCode, false, false, "white-space: nowrap;");
            htmlCode += caap.endCheckHide('DemiPointsFirst');
            htmlCode += caap.makeNumberFormTR("Heal My Damage Up to % of Stamina Used", 'HealPercStam', healPercStamInst, 20, '', '');
            htmlCode += caap.makeDropDownTR("Fortify for Others When", 'WhenFortify', fortifyList, fortifyInst, '', 'Never', false, false, 62);
            htmlCode += caap.startDropHide('WhenFortify', '', 'Never', true);
            htmlCode += caap.startDropHide('WhenFortify', 'XEnergy', 'At X Energy', false);
            htmlCode += caap.makeNumberFormTR("Start At Or Above", 'XFortifyEnergy', XMonsterInstructions, 1, '', '', true, false);
            htmlCode += caap.makeNumberFormTR("Stop At Or Below", 'XMinFortifyEnergy', XMinMonsterInstructions, 0, '', '', true, false);
            htmlCode += caap.endDropHide('WhenFortify', 'XEnergy', 'At X Energy', false);
            htmlCode += caap.makeNumberFormTR("Fortify If % Under", 'MaxToFortify', fortifyInstructions, 50, '', '');
            htmlCode += caap.makeNumberFormTR("Quest If % Over", 'MaxHealthtoQuest', questFortifyInstructions, 60, '', '');
            htmlCode += caap.endDropHide('WhenFortify');
            htmlCode += caap.makeNumberFormTR("No Attack If % Under", 'MinFortToAttack', stopAttackInstructions, 10, '', '');
            htmlCode += caap.makeDropDownTR("Cripple/Deflect when", 'WhenStun', stunList, stunInst, '', 'Immediately', false, false, 62);
            htmlCode += caap.makeCheckTR("Do not Wait Until Strengthen", 'StrengthenTo100', true, strengthenTo100Instructions);
            htmlCode += caap.makeTD("Attack Monsters in this order <a href='http://caaplayer.freeforums.org/attack-monsters-in-this-order-clarified-t408.html' target='_blank' style='color: blue'>(INFO)</a>");
            htmlCode += caap.makeTextBox('orderbattle_monster', attackOrderInstructions, '', '');
            htmlCode += caap.endDropHide('WhenMonster');
            htmlCode += caap.makeCheckTR("Enable Labels", 'monsterEnableLabels', true, "When enabled then the damage and fortify bars will display percentage labels.");
            htmlCode += caap.endToggle;
            return htmlCode;
        } catch (err) {
            con.error("ERROR in monster.menu: " + err.stack);
            return '';
        }
    };

	monster.dashboard = function() {
		monster.dashboardCommon('Monster');
	};
	
	// Creates the Monster Dashboard and Feed Dashboards
    monster.dashboardCommon = function(which) {
        try {
            if (config.getItem('DBDisplay', '') === which && session.getItem(which + "DashUpdate", true)) {
                var headers = ['Name', 'Damage', 'Dmg%', 'Fort%', 'Str%', 'Time', 'T2K', 'Phase', '&nbsp;', '&nbsp;', '&nbsp;'],
                    values = ['name', 'damage', 'life', 'fortify', 'strength', 'time', 't2k', 'phase', 'link'],
                    pp = 0,
                    value = null,
                    color = '',
                    monsterConditions = '',
                    achLevel = 0,
                    maxDamage = 0,
                    title = '',
                    id = '',
                    link = '',
                    visitMonsterInstructions = '',
                    removeLink = '',
                    removeLinkInstructions = '',
                    len = 0,
                    data = {
                        text: '',
                        color: '',
                        bgcolor: '',
                        id: '',
                        title: ''
                    },
                    linkRegExp = new RegExp("'(http.+)'"),
                    duration = 0,
                    count = 0,
                    handler = null,
                    head = '',
                    body = '',
                    row = '',
					whichL = which.toLowerCase();

				if (which == 'Feed') {
					headers[1] = 'Score';
					values[1]= 'score';
				}
					
                for (pp = 0, len = headers.length; pp < len; pp += 1) {
                    switch (headers[pp]) {
                    case 'Name':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '30%'
                        });
                        break;
                    case 'Damage':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '13%'
                        });
                        break;
                    case 'Score':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '13%'
                        });
                        break;
                    case 'Dmg%':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '8%'
                        });
                        break;
                    case 'Fort%':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '8%'
                        });
                        break;
                    case 'Str%':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '8%'
                        });
                        break;
                    case 'Time':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '8%'
                        });
                        break;
                    case 'T2K':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '8%'
                        });
                        break;
                    case 'Link':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '2%'
                        });
                        break;
                    case 'Phase':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '13%'
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
                    }
                }

                head = caap.makeTr(head);
                values.shift();
                monster.records.forEach(function(cM) {
					//con.log(2, "MONSTER DASH",cM);
					if ((cM.status == 'Join') != (which == 'Feed')) {
						return;
					}
                    row = '';
                    color = cM.color;
                    if (cM.md5 === state.getItem('targetFromFortify', '')) {
                        color = 'blue';
                    } else if (cM.md5 === state.getItem('targetFromMonster', '') || cM.md5 === state.getItem('targetFromraid', '')) {
                        color = 'green';
                    }

                    monsterConditions = cM.conditions;
                    achLevel = monster.parseCondition('ach', monsterConditions);
                    maxDamage = monster.parseCondition('max', monsterConditions);
                    if (cM.link.length) {
                        link = caap.domain.altered + '/' + cM.link;
                        visitMonsterInstructions = "Clicking this link will take you to " + cM.name;
                        data = {
                            text: '<span id="caap_' + whichL + '_' + count + '" title="' + visitMonsterInstructions + '" mname="' + cM.name + '" mmd5="' + cM.md5 +
                                '" rlink="' + link + '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + cM.name + '</span>',
                            color: 'blue',
                            id: '',
                            title: ''
                        };

                        row += caap.makeTd(data);
                    } else {
                        row += caap.makeTd({
                            text: cM.name,
                            color: color,
                            id: '',
                            title: ''
                        });
                    }

                    values.forEach(function(displayItem) {
                        id = "caap_" + displayItem + "_" + count;
                        title = '';
                        if (displayItem === 'phase' && color === 'grey') {
                            row += caap.makeTd({
                                text: cM.status,
                                color: color,
                                id: '',
                                title: ''
                            });
                        } else {
                            value = cM[displayItem];
                            if (value !== '' && (value >= 0 || value.length)) {
                                if (displayItem !== "time" && displayItem !== "t2k" && !$u.isNaN(value) && value > 999) {
                                    value = value.addCommas();
                                }

                                switch (displayItem) {
                                case 'damage':
                                    if (achLevel) {
                                        title = "User Set Monster Achievement: " + achLevel.addCommas();
                                    } else if (config.getItem('AchievementMode', false)) {
                                        title = "Stamina used: " + cM.spent.stamina + " Energy used: " + cM.spent.energy + " Default Monster Achievement: " + monster.getInfo(cM, 'ach').addCommas();
                                        title += cM.page === 'festival_battle_monster' ? " Festival Monster Achievement: " + monster.getInfo(cM, 'festival_ach').addCommas() : '';
                                    } else {
                                        title = "Achievement Mode Disabled";
                                    }

                                    title += $u.hasContent(maxDamage) && $u.isNumber(maxDamage) ? " - User Set Max Damage: " + maxDamage.addCommas() : '';
                                    break;
                                case 'time':
                                    if ($u.hasContent(value) && value.length === 3) {
                                        value = value[0] + ":" + value[1].lpad("0", 2);
                                        duration = monster.getInfo(cM, 'duration', cM.page === 'festival_battle_monster' ? 192 : 168);
                                        title = $u.hasContent(duration) ? "Total Monster Duration: " + duration + " hours" : '';
                                    } else {
                                        value = '';
                                    }

                                    break;
                                case 't2k':
                                    value = $u.minutes2hours(value);
                                    title = "Estimated Time To Kill: " + value + " hours:mins";
                                    break;
                                case 'life':
                                    title = "Percentage of monster life remaining: " + value + "%";
                                    break;
                                case 'phase':
                                    value = value + "/" + monster.getInfo(cM, 'siege') + " need " + cM.miss;
                                    title = "Siege Phase: " + value + " more clicks";
                                    break;
                                case 'fortify':
                                    title = (config.getItem('HealPercStam', 20) && cM.debt.stamina > 0 ? 'Stamina debt: ' + cM.debt.stamina + ' or until Fort % > ' + cM.debt.start + ' ' : '') +"Percentage of party health/monster defense: " + value + "%";
                                    break;
                                case 'strength':
                                    title = "Percentage of party strength: " + value + "%";
                                    break;
                                case 'link':
                                    value = "<a href='" + link + "'>Link<\a>";
                                    break;
                                default:
                                }

                                row += caap.makeTd({
                                    text: value,
                                    color: color,
                                    id: id,
                                    title: title
                                });
                            } else {
                                row += caap.makeTd({
                                    text: '',
                                    color: color,
                                    id: '',
                                    title: ''
                                });
                            }
                        }
                    });

                    if (monsterConditions && monsterConditions !== 'none') {
                        data = {
                            text: '<span title="User Set Condition string: ' + cM.fullC + '" class="ui-icon ui-icon-info">i</span>',
                            color: 'blue',
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

                    if (cM.link.length && which == 'Monster') {
                        removeLink = link.replace("casuser", "remove_list") + (cM.page === 'festival_battle_monster' ? '&remove_monsterKey=' + cM.mid.replace("&mid=", "") : '');
                        removeLinkInstructions = "Clicking this link will remove " + cM.name + " from CAAP. If still on your monster list, it will reappear when CAAP sees it again.";
                        data = {
                            text: '<span id="caap_remove_' + count + '" title="' + removeLinkInstructions + '" mname="' + cM.name + '" mmd5="' + cM.md5 +
                                '" rlink="' + removeLink + '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';" class="ui-icon ui-icon-circle-close">X</span>',
                            color: 'blue',
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
                    count += 1;
                });

                $j("#caap_info" + which, caap.caapTopObject).html(
                $j(caap.makeTable(whichL, head, body)).dataTable({
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
                        "aTargets": [8, 9, 10]
                    }, {
                        "sSortDataType": "remaining-time",
                        "aTargets": [5, 6]
                    }]
                }));

                handler = function(e) {
                    var visitMonsterLink = {
                        mmd5: '',
                        mname: '',
                        rlink: '',
                        arlink: ''
                    },
                    i = 0,
                        len = 0;

                    for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                        if (e.target.attributes[i].nodeName === 'mname') {
                            visitMonsterLink.mname = e.target.attributes[i].value;
                        } else if (e.target.attributes[i].nodeName === 'rlink') {
                            visitMonsterLink.rlink = e.target.attributes[i].value;
                            visitMonsterLink.arlink = visitMonsterLink.rlink.replace(caap.domain.altered + "/", "");
                        } else if (e.target.attributes[i].nodeName === 'mmd5') {
                            visitMonsterLink.mmd5 = e.target.attributes[i].value;
                        }
                    }

                    //feed.setScanRecord(visitMonsterLink.mmd5);
					monster.lastClick = visitMonsterLink.mmd5;
                    caap.clickAjaxLinkSend(visitMonsterLink.arlink);
                };

                $j("span[id*='caap_" + whichL + "_']", caap.caapTopObject).off('click', handler).on('click', handler);
                handler = null;

                handler = function(e) {
                    var monsterRemove = {
                        mmd5: '',
                        mname: '',
                        rlink: '',
                        arlink: ''
                    },
                    i = 0,
                        len = 0,
                        resp = false;

                    for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                        if (e.target.attributes[i].nodeName === 'mname') {
                            monsterRemove.mname = e.target.attributes[i].value;
                        } else if (e.target.attributes[i].nodeName === 'rlink') {
                            monsterRemove.rlink = e.target.attributes[i].value;
                            monsterRemove.arlink = monsterRemove.rlink.replace(caap.domain.altered + "/", "");
                        } else if (e.target.attributes[i].nodeName === 'mmd5') {
                            monsterRemove.mmd5 = e.target.attributes[i].value;
                        }
                    }

					monster.deleteItem(monsterRemove.mmd5);
                    //    caap.clickGetCachedAjax(monsterRemove.arlink);
                };

                $j("span[id*='caap_remove_']", caap.caapTopObject).off('click', handler).on('click', handler);
                handler = null;
                session.setItem(which + "DashUpdate", false);
            }

            return true;
        } catch (err) {
            con.error("ERROR in monster.dashboardCommon: " + err.stack, which);
            return false;
        }
    };

}());
