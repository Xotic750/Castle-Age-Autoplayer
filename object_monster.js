
////////////////////////////////////////////////////////////////////
//                          monster OBJECT
// this is the main object for dealing with Monsters
/////////////////////////////////////////////////////////////////////

monster = {
    records: [],

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    record: function () {
        this.data = {
            'name'       : '',
            'userId'     : 0,
            'attacked'   : -1,
            'defended'   : -1,
            'damage'     : -1,
            'life'       : -1,
            'fortify'    : -1,
            'time'       : [],
            't2k'        : -1,
            'phase'      : '',
            'miss'       : 0,
            'link'       : '',
            'rix'        : -1,
            'mpool'      : '',
            'over'       : '',
            'page'       : '',
            'color'      : '',
            'review'     : -1,
            'type'       : '',
            'conditions' : '',
            'charClass'  : '',
            'strength'   : -1,
            'stun'       : -1,
            'stunTime'   : -1,
            'stunDo'     : false,
            'stunType'   : '',
            'tip'        : ''
        };
    },
    /*jslint sub: false */

    engageButtons: {},

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    completeButton: {
        'battle_monster': {
            'name'   : undefined,
            'button' : undefined
        },
        'raid': {
            'name'   : undefined,
            'button' : undefined
        }
    },
    /*jslint sub: false */

    // http://castleage.wikidot.com/monster for monster info
    // http://castleage.wikidot.com/skaar
    info: {
        'Deathrune' : {
            duration     : 96,
            defense      : true,
            hp           : 100000000,
            ach          : 1000000,
            siege        : 5,
            siegeClicks  : [30, 60, 90, 120, 200],
            siegeDam     : [6600000, 8250000, 9900000, 13200000, 16500000],
            siege_img    : ['/graphics/death_siege_small'],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            reqAtkButton : 'attack_monster_button.jpg',
            v            : 'attack_monster_button2.jpg',
            defButton    : 'button_dispel.gif',
            defense_img  : 'bar_dispel.gif'
        },
        'Ice Elemental' : {
            duration     : 168,
            defense      : true,
            hp           : 100000000,
            ach          : 1000000,
            siege        : 5,
            siegeClicks  : [30, 60, 90, 120, 200],
            siegeDam     : [7260000, 9075000, 10890000, 14520000, 18150000],
            siege_img    : ['/graphics/water_siege_small'],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            reqAtkButton : 'attack_monster_button.jpg',
            pwrAtkButton : 'attack_monster_button2.jpg',
            defButton    : 'button_dispel.gif',
            defense_img  : 'bar_dispel.gif'
        },
        'Earth Elemental' : {
            duration     : 168,
            defense      : true,
            hp           : 100000000,
            ach          : 1000000,
            siege        : 5,
            siegeClicks  : [30, 60, 90, 120, 200],
            siegeDam     : [6600000, 8250000, 9900000, 13200000, 16500000],
            siege_img    : ['/graphics/earth_siege_small'],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            reqAtkButton : 'attack_monster_button.jpg',
            pwrAtkButton : 'attack_monster_button2.jpg',
            defButton    : 'attack_monster_button3.jpg',
            defense_img  : 'seamonster_ship_health.jpg',
            repair_img   : 'repair_bar_grey.jpg'
        },
        'Hydra' : {
            duration     : 168,
            hp           : 100000000,
            ach          : 500000,
            siege        : 6,
            siegeClicks  : [10, 20, 50, 100, 200, 300],
            siegeDam     : [1340000, 2680000, 5360000, 14700000, 28200000, 37520000],
            siege_img    : ['/graphics/monster_siege_small'],
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50]
        },
        'Legion' : {
            duration     : 168,
            hp           : 100000,
            ach          : 1000,
            siege        : 6,
            siegeClicks  : [10, 20, 40, 80, 150, 300],
            siegeDam     : [3000, 4500, 6000, 9000, 12000, 15000],
            siege_img    : ['/graphics/castle_siege_small'],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            defense_img  : 'seamonster_ship_health.jpg',
            repair_img   : 'repair_bar_grey.jpg'
        },
        'Emerald Dragon' : {
            duration     : 72,
            ach          : 100000,
            siege        : 0
        },
        'Frost Dragon' : {
            duration     : 72,
            ach          : 100000,
            siege        : 0
        },
        'Gold Dragon' : {
            duration     : 72,
            ach          : 100000,
            siege        : 0
        },
        'Red Dragon' : {
            duration     : 72,
            ach          : 100000,
            siege        : 0
        },
        'King'      : {
            duration     : 72,
            ach          : 15000,
            siege        : 0
        },
        'Terra'     : {
            duration     : 72,
            ach          : 20000,
            siege        : 0
        },
        'Queen'     : {
            duration     : 48,
            ach          : 50000,
            siege        : 1,
            siegeClicks  : [11],
            siegeDam     : [500000],
            siege_img    : ['/graphics/boss_sylvanas_drain_icon.gif']
        },
        'Ravenmoore' : {
            duration     : 48,
            ach          : 500000,
            siege        : 0
        },
        'Knight'    : {
            duration     : 48,
            ach          : 30000,
            siege        : 0,
            reqAtkButton : 'event_attack1.gif',
            pwrAtkButton : 'event_attack2.gif',
            defButton    : null
        },
        'Serpent'   : {
            duration     : 72,
            defense      : true,
            ach          : 250000,
            siege        : 0,
            fort         : true,
            //staUse       : 5,
            defense_img  : 'seamonster_ship_health.jpg'
        },
        'Siege'    : {
            duration     : 232,
            raid         : true,
            ach          : 100,
            siege        : 4,
            siegeClicks  : [30, 50, 80, 100],
            siegeDam     : [200, 500, 300, 1500],
            siege_img    : ['/graphics/monster_siege_'],
            staUse       : 1
        },
        'Raid I'    : {
            duration     : 88,
            raid         : true,
            ach          : 50,
            siege        : 2,
            siegeClicks  : [30, 50],
            siegeDam     : [200, 500],
            siege_img    : ['/graphics/monster_siege_'],
            staUse       : 1
        },
        'Raid II'   : {
            duration     : 144,
            raid         : true,
            ach          : 50,
            siege        : 2,
            siegeClicks  : [80, 100],
            siegeDam     : [300, 1500],
            siege_img    : ['/graphics/monster_siege_'],
            staUse       : 1
        },
        'Mephistopheles' : {
            duration     : 48,
            ach          : 200000,
            siege        : 0
        },
        // http://castleage.wikia.com/wiki/War_of_the_Red_Plains
        'Plains' : {
            alpha        : true,
            tactics      : true,
            duration     : 168,
            hp           : 350000000,
            ach          : 10000,
            siege        : 7,
            siegeClicks  : [30, 60, 90, 120, 200, 250, 300],
            siegeDam     : [13750000, 17500000, 20500000, 23375000, 26500000, 29500000, 34250000],
            siege_img    : [
                '/graphics/water_siege_small',
                '/graphics/alpha_bahamut_siege_blizzard_small',
                '/graphics/azriel_siege_inferno_small',
                '/graphics/war_siege_holy_smite_small'
            ],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            defense_img  : 'nm_green.jpg'
        },
        // http://castleage.wikia.com/wiki/Bahamut,_the_Volcanic_Dragon
        'Volcanic Dragon' : {
            alpha        : true,
            duration     : 168,
            hp           : 130000000,
            ach          : 4000000,
            siege        : 5,
            siegeClicks  : [30, 60, 90, 120, 200],
            siegeDam     : [7896000, 9982500, 11979000, 15972000, 19965000],
            siege_img    : ['/graphics/water_siege_small'],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            defense_img  : 'nm_green.jpg'
        },
        // http://castleage.wikidot.com/alpha-bahamut
        // http://castleage.wikia.com/wiki/Alpha_Bahamut,_The_Volcanic_Dragon
        'Alpha Volcanic Dragon' : {
            alpha        : true,
            duration     : 168,
            hp           : 620000000,
            ach          : 8000000,
            siege        : 7,
            siegeClicks  : [30, 60, 90, 120, 200, 250, 300],
            siegeDam     : [22250000, 27500000, 32500000, 37500000, 42500000, 47500000, 55000000],
            siege_img    : [
                '/graphics/water_siege_small',
                '/graphics/alpha_bahamut_siege_blizzard_small',
                '/graphics/azriel_siege_inferno_small'
            ],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            defense_img  : 'nm_green.jpg'
        },
        // http://castleage.wikia.com/wiki/Azriel,_the_Angel_of_Wrath
        'Wrath' : {
            alpha        : true,
            duration     : 168,
            hp           : 600000000,
            ach          : 8000000,
            siege        : 7,
            siegeClicks  : [30, 60, 90, 120, 200, 250, 300],
            siegeDam     : [22250000, 27500000, 32500000, 37500000, 42500000, 47500000, 55000000],
            siege_img    : [
                '/graphics/water_siege_small',
                '/graphics/alpha_bahamut_siege_blizzard_small',
                '/graphics/azriel_siege_inferno_small'
            ],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            defense_img  : 'nm_green.jpg'
        },
        'Alpha Mephistopheles' : {
            alpha        : true,
            duration     : 168,
            hp           : 600000000,
            ach          : 12000000,
            siege        : 10,
            siegeClicks  : [15, 30, 45, 60, 75, 100, 150, 200, 250, 300],
            siegeDam     : [19050000, 22860000, 26670000, 30480000, 34290000, 38100000, 45720000, 49530000, 53340000, 60960000],
            siege_img    : [
                '/graphics/earth_siege_small',
                '/graphics/castle_siege_small',
                '/graphics/death_siege_small',
                '/graphics/skaar_siege_small'
            ],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            defense_img  : 'nm_green.jpg'
        },
        'Fire Elemental' : {
            alpha        : true,
            duration     : 168,
            hp           : 350000000,
            ach          : 1000000,
            siege        : 7,
            siegeClicks  : [30, 60, 90, 120, 200, 250, 300],
            siegeDam     : [14750000, 18500000, 21000000, 24250000, 27000000, 30000000, 35000000],
            siege_img    : [
                '/graphics/water_siege_small',
                '/graphics/alpha_bahamut_siege_blizzard_small',
                '/graphics/azriel_siege_inferno_small',
                '/graphics/war_siege_holy_smite_small'
            ],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            defense_img  : 'nm_green.jpg'
        },
        "Lion's Rebellion" : {
            alpha        : true,
            tactics      : true,
            duration     : 168,
            hp           : 350000000,
            ach          : 1000,
            siege        : 7,
            siegeClicks  : [30, 60, 90, 120, 200, 250, 300],
            siegeDam     : [15250000, 19000000, 21500000, 24750000, 27500000, 30500000, 35500000],
            siege_img    : [
                '/graphics/water_siege_small',
                '/graphics/alpha_bahamut_siege_blizzard_small',
                '/graphics/azriel_siege_inferno_small',
                '/graphics/war_siege_holy_smite_small'
            ],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            defense_img  : 'nm_green.jpg'
        },
        "Corvintheus" : {
            alpha        : true,
            duration     : 168,
            hp           : 640000000,
            ach          : 30000000,
            siege        : 10,
            siegeClicks  : [15, 30, 45, 60, 75, 100, 150, 200, 250, 300],
            siegeDam     : [16000000, 19200000, 22400000, 25600000, 28800000, 32000000, 38400000, 41600000, 44800000, 51200000],
            siege_img    : [
                '/graphics/earth_siege_small',
                '/graphics/castle_siege_small',
                '/graphics/skaar_siege_small',
                '/graphics/death_siege_small'
            ],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            defense_img  : 'nm_green.jpg'
        }
    },

    load: function () {
        try {
            monster.records = gm.getItem('monster.records', 'default');
            if (monster.records === 'default' || !$.isArray(monster.records)) {
                monster.records = gm.setItem('monster.records', []);
            }

            state.setItem("MonsterDashUpdate", true);
            utility.log(5, "monster.load", monster.records);
            return true;
        } catch (err) {
            utility.error("ERROR in monster.load: " + err);
            return false;
        }
    },

    save: function () {
        try {
            gm.setItem('monster.records', monster.records);
            state.setItem("MonsterDashUpdate", true);
            utility.log(5, "monster.save", monster.records);
            return true;
        } catch (err) {
            utility.error("ERROR in monster.save: " + err);
            return false;
        }
    },

    parseCondition: function (type, conditions) {
        try {
            if (!conditions || conditions.toLowerCase().indexOf(':' + type) < 0) {
                return false;
            }

            var str    = '',
                value  = 0,
                first  = false,
                second = false;

            str = conditions.substring(conditions.indexOf(':' + type) + type.length + 1).replace(new RegExp(":.+"), '');
            value = str.parseFloat();
            if (/k$/i.test(str) || /m$/i.test(str)) {
                first = /\d+k/i.test(str);
                second = /\d+m/i.test(str);
                value = value * 1000 * (first + second * 1000);
            }

            return value;
        } catch (err) {
            utility.error("ERROR in monster.parseCondition: " + err);
            return false;
        }
    },

    type: function (name) {
        try {
            var words = [],
                count = 0;

            if (typeof name !== 'string') {
                utility.warn("name", name);
                throw "Invalid identifying name!";
            }

            if (name === '') {
                return '';
            }

            words = name.split(" ");
            utility.log(3, "Words", words);
            count = words.length - 1;
            if (count >= 4) {
                if (words[count - 4] === 'Alpha' && words[count - 1] === 'Volcanic' && words[count] === 'Dragon') {
                    return words[count - 4] + ' ' + words[count - 1] + ' ' + words[count];
                }
            }

            if (words[count] === 'Elemental' || words[count] === 'Dragon' ||
                    (words[count - 1] === 'Alpha' && words[count] === 'Mephistopheles') ||
                    (words[count - 1] === "Lion's" && words[count] === 'Rebellion') ||
                    (words[count - 1] === 'Fire' && words[count] === 'Elemental')) {
                return words[count - 1] + ' ' + words[count];
            }

            return words[count];
        } catch (err) {
            utility.error("ERROR in monster.type: " + err, arguments.callee.caller);
            return false;
        }
    },

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    getItem: function (name) {
        try {
            var it        = 0,
                len       = 0,
                success   = false,
                newRecord = {};

            if (typeof name !== 'string') {
                utility.warn("name", name);
                throw "Invalid identifying name!";
            }

            if (name === '') {
                return '';
            }

            for (it = 0, len = monster.records.length; it < len; it += 1) {
                if (monster.records[it]['name'] === name) {
                    success = true;
                    break;
                }
            }

            if (success) {
                utility.log(3, "Got monster record", name, monster.records[it]);
                return monster.records[it];
            } else {
                newRecord = new monster.record();
                newRecord.data['name'] = name;
                utility.log(3, "New monster record", name, newRecord.data);
                return newRecord.data;
            }
        } catch (err) {
            utility.error("ERROR in monster.getItem: " + err, arguments.callee.caller);
            return false;
        }
    },

    setItem: function (record) {
        try {
            if (!record || !$.isPlainObject(record)) {
                throw "Not passed a record";
            }

            if (typeof record['name'] !== 'string' || record['name'] === '') {
                utility.warn("name", record['name']);
                throw "Invalid identifying name!";
            }

            var it      = 0,
                len     = 0,
                success = false;

            for (it = 0, len = monster.records.length; it < len; it += 1) {
                if (monster.records[it]['name'] === record['name']) {
                    success = true;
                    break;
                }
            }

            if (success) {
                monster.records[it] = record;
                utility.log(3, "Updated monster record", record, monster.records);
            } else {
                monster.records.push(record);
                utility.log(3, "Added monster record", record, monster.records);
            }

            monster.save();
            return true;
        } catch (err) {
            utility.error("ERROR in monster.setItem: " + err);
            return false;
        }
    },

    deleteItem: function (name) {
        try {
            var it        = 0,
                len       = 0,
                success   = false;

            if (typeof name !== 'string' || name === '') {
                utility.warn("name", name);
                throw "Invalid identifying name!";
            }

            for (it = 0, len = monster.records.length; it < len; it += 1) {
                if (monster.records[it]['name'] === name) {
                    success = true;
                    break;
                }
            }

            if (success) {
                monster.records.splice(it, 1);
                monster.save();
                utility.log(3, "Deleted monster record", name, monster.records);
                return true;
            } else {
                utility.warn("Unable to delete monster record", name, monster.records);
                return false;
            }
        } catch (err) {
            utility.error("ERROR in monster.deleteItem: " + err);
            return false;
        }
    },
    /*jslint sub: false */

    clear: function () {
        try {
            monster.records = gm.setItem("monster.records", []);
            state.setItem("MonsterDashUpdate", true);
            return true;
        } catch (err) {
            utility.error("ERROR in monster.clear: " + err);
            return false;
        }
    },

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    t2kCalc: function (record) {
        try {
            var timeLeft                       = 0,
                timeUsed                       = 0,
                T2K                            = 0,
                damageDone                     = 0,
                hpLeft                         = 0,
                totalSiegeDamage               = 0,
                totalSiegeClicks               = 0,
                attackDamPerHour               = 0,
                clicksPerHour                  = 0,
                clicksToNextSiege              = 0,
                nextSiegeAttackPlusSiegeDamage = 0,
                s                              = 0,
                len                            = 0,
                siegeImpacts                   = 0,
                boss                           = {},
                siegeStage                     = 0;

            siegeStage = record['phase'] - 1;
            boss = monster.info[record['type']];
            timeLeft = record['time'][0].parseInt() + (record['time'][1].parseInt() * 0.0166);
            timeUsed = boss.duration - timeLeft;
            if (!boss.siege || !boss.hp) {
                return (record['life'] * timeUsed) / (100 - record['life']);
            }

            damageDone = (100 - record['life']) / 100 * boss.hp;
            hpLeft = boss.hp - damageDone;
            for (s = 0, len = boss.siegeClicks.length; s < len; s += 1) {
                utility.log(5, 's ', s, ' T2K ', T2K, ' hpLeft ', hpLeft);
                if (s < siegeStage || record['miss'] === 0) {
                    totalSiegeDamage += boss.siegeDam[s];
                    totalSiegeClicks += boss.siegeClicks[s];
                } else if (s === siegeStage) {
                    attackDamPerHour = (damageDone - totalSiegeDamage) / timeUsed;
                    clicksPerHour = (totalSiegeClicks + boss.siegeClicks[s] - record['miss']) / timeUsed;
                    utility.log(5, 'Attack Damage Per Hour: ', attackDamPerHour);
                    utility.log(5, 'Damage Done: ', damageDone);
                    utility.log(5, 'Total Siege Damage: ', totalSiegeDamage);
                    utility.log(5, 'Time Used: ', timeUsed);
                    utility.log(5, 'Clicks Per Hour: ', clicksPerHour);
                } else if (s >= siegeStage) {
                    clicksToNextSiege = (s === siegeStage) ? record['miss'] : boss.siegeClicks[s];
                    nextSiegeAttackPlusSiegeDamage = boss.siegeDam[s] + clicksToNextSiege / clicksPerHour * attackDamPerHour;
                    if (hpLeft <= nextSiegeAttackPlusSiegeDamage || record['miss'] === 0) {
                        T2K += hpLeft / attackDamPerHour;
                        break;
                    }

                    T2K += clicksToNextSiege / clicksPerHour;
                    hpLeft -= nextSiegeAttackPlusSiegeDamage;
                }
            }

            siegeImpacts = (record['life'] / (100 - record['life']) * timeLeft).dp(2);
            T2K = T2K.dp(2);
            utility.log(3, 'T2K based on siege: ', caap.decHours2HoursMin(T2K));
            utility.log(3, 'T2K estimate without calculating siege impacts: ', caap.decHours2HoursMin(siegeImpacts));
            return T2K;
        } catch (err) {
            utility.error("ERROR in monster.t2kCalc: " + err);
            return 0;
        }
    },

    characterClass: {
        'Warrior' : ['Strengthen', 'Heal'],
        'Rogue'   : ['Cripple'],
        'Mage'    : ['Deflect'],
        'Cleric'  : ['Heal'],
        'Warlock' : ['Heal', 'Deflect'],
        'Ranger'  : ['Strengthen', 'Cripple']
    },
    /*jslint sub: false */

    flagReview: function (force) {
        try {
            schedule.setItem("monsterReview", 0);
            state.setItem('monsterReviewCounter', -3);
            return true;
        } catch (err) {
            utility.error("ERROR in monster.flagReview: " + err);
            return false;
        }
    },

    flagFullReview: function (force) {
        try {
            monster.clear();
            monster.flagReview();
            schedule.setItem('NotargetFrombattle_monster', 0);
            state.setItem('ReleaseControl', true);
            caap.UpdateDashboard(true);
            return true;
        } catch (err) {
            utility.error("ERROR in monster.flagFullReview: " + err);
            return false;
        }
    },

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    energyTarget: function () {
        this.data = {
            'name' : '',
            'type' : ''
        };
    },

    select: function (force) {
        try {
            if (!(force || schedule.oneMinuteUpdate('selectMonster')) || caap.stats['level'] < 7) {
                return false;
            }

            utility.log(2, 'Selecting monster');
            var monsterList  = {
                    'battle_monster' : [],
                    'raid'           : [],
                    'any'            : []
                },
                it                    = 0,
                len                   = 0,
                len1                  = 0,
                len2                  = 0,
                len3                  = 0,
                s                     = 0,
                selectTypes           = [],
                maxToFortify          = 0,
                nodeNum               = 0,
                firstOverAch          = '',
                firstUnderMax         = '',
                firstFortOverAch      = '',
                firstFortUnderMax     = '',
                firstStunOverAch      = '',
                firstStunUnderMax     = '',
                firstStrengthOverAch  = '',
                firstStrengthUnderMax = '',
                strengthTarget        = '',
                fortifyTarget         = '',
                stunTarget            = '',
                energyTarget          = new monster.energyTarget(),
                monsterName           = '',
                monsterObj            = {},
                monsterConditions     = '',
                monstType             = '',
                p                     = 0,
                m                     = 0,
                attackOrderList       = [];

            // First we forget everything about who we already picked.
            state.setItem('targetFrombattle_monster', '');
            state.setItem('targetFromfortify', energyTarget.data);
            state.setItem('targetFromraid', '');

            // Next we get our monster objects from the reposoitory and break them into separarte lists
            // for monster or raid.  If we are serializing then we make one list only.
            for (it = 0, len = monster.records.length; it < len; it += 1) {
                if (monster.records[it]['type'] === '') {
                    monster.records[it]['type'] = monster.type(monster.records[it]['name']);
                }

                if (monster.info[monster.records[it]['type']] && monster.info[monster.records[it]['type']].alpha) {
                    if (monster.records[it]['damage'] !== -1 && monster.records[it]['color'] !== 'grey' && schedule.since(monster.records[it]['stunTime'], 0)) {
                        utility.log(2, "Review monster due to class timer", monster.records[it]['name']);
                        monster.records[it]['review'] = -1;
                        monster.flagReview();
                    }
                }

                monster.records[it]['conditions'] = 'none';
                if (gm.getItem('SerializeRaidsAndMonsters', false, hiddenVar)) {
                    monsterList['any'].push(monster.records[it]['name']);
                } else if ((monster.records[it]['page'] === 'raid') || (monster.records[it]['page'] === 'battle_monster')) {
                    monsterList[monster.records[it]['page']].push(monster.records[it]['name']);
                }
            }

            monster.save();

            //PLEASE NOTE BEFORE CHANGING
            //The Serialize Raids and Monsters dictates a 'single-pass' because we only need select
            //one "targetFromxxxx" to fill in. The other MUST be left blank. This is what keeps it
            //serialized!!! Trying to make this two pass logic is like trying to fit a square peg in
            //a round hole. Please reconsider before doing so.
            if (gm.getItem('SerializeRaidsAndMonsters', false, hiddenVar)) {
                selectTypes = ['any'];
            } else {
                selectTypes = ['battle_monster', 'raid'];
            }

            utility.log(3, 'records/monsterList/selectTypes', monster.records, monsterList, selectTypes);
            // We loop through for each selection type (only once if serialized between the two)
            // We then read in the users attack order list
            for (s = 0, len1 = selectTypes.length; s < len1; s += 1) {
                if (!monsterList[selectTypes[s]].length) {
                    continue;
                }

                firstOverAch          = '';
                firstUnderMax         = '';
                firstFortOverAch      = '';
                firstFortUnderMax     = '';
                firstStunOverAch      = '';
                firstStunUnderMax     = '';
                firstStrengthOverAch  = '';
                firstStrengthUnderMax = '';
                strengthTarget        = '';
                fortifyTarget         = '';
                stunTarget            = '';
                energyTarget          = new monster.energyTarget();

                // The extra apostrophe at the end of attack order makes it match any "soandos's monster" so it always selects a monster if available
                if (selectTypes[s] === 'any') {
                    attackOrderList = utility.TextToArray(config.getItem('orderbattle_monster', ''));
                    $.merge(attackOrderList, utility.TextToArray(config.getItem('orderraid', '')).concat('your', "'"));
                } else {
                    attackOrderList = utility.TextToArray(config.getItem('order' + selectTypes[s], '')).concat('your', "'");
                }

                utility.log(5, 'attackOrderList', attackOrderList);
                // Next we step through the users list getting the name and conditions
                for (p = 0, len2 = attackOrderList.length; p < len2; p += 1) {
                    if (!attackOrderList[p].trim()) {
                        continue;
                    }

                    monsterConditions = attackOrderList[p].replace(new RegExp("^[^:]+"), '').toString().trim();
                    // Now we try to match the users name agains our list of monsters
                    for (m = 0, len3 = monsterList[selectTypes[s]].length; m < len3; m += 1) {
                        if (!monsterList[selectTypes[s]][m]) {
                            continue;
                        }

                        monsterObj = monster.getItem(monsterList[selectTypes[s]][m]);
                        // If we set conditions on this monster already then we do not reprocess
                        if (monsterObj['conditions'] !== 'none') {
                            continue;
                        }

                        // If this monster does not match, skip to next one
                        // Or if this monster is dead, skip to next one
                        // Or if this monster is not the correct type, skip to next one
                        if (monsterList[selectTypes[s]][m].toLowerCase().indexOf(attackOrderList[p].match(new RegExp("^[^:]+")).toString().trim().toLowerCase()) < 0 || (selectTypes[s] !== 'any' && monsterObj['page'] !== selectTypes[s])) {
                            continue;
                        }

                        //Monster is a match so we set the conditions
                        monsterObj['conditions'] = monsterConditions;
                        monster.setItem(monsterObj);
                        // If it's complete or collect rewards, no need to process further
                        if (monsterObj['color'] === 'grey') {
                            continue;
                        }

                        utility.log(3, 'Current monster being checked', monsterObj);
                        // checkMonsterDamage would have set our 'color' and 'over' values. We need to check
                        // these to see if this is the monster we should select
                        if (!firstUnderMax && monsterObj['color'] !== 'purple') {
                            if (monsterObj['over'] === 'ach') {
                                if (!firstOverAch) {
                                    firstOverAch = monsterList[selectTypes[s]][m];
                                    utility.log(3, 'firstOverAch', firstOverAch);
                                }
                            } else if (monsterObj['over'] !== 'max') {
                                firstUnderMax = monsterList[selectTypes[s]][m];
                                utility.log(3, 'firstUnderMax', firstUnderMax);
                            }
                        }

                        monstType = monster.type(monsterList[selectTypes[s]][m]);
                        if (monstType && monster.info[monstType]) {
                            if (!monster.info[monstType].alpha || (monster.info[monstType].alpha && monster.characterClass[monsterObj['charClass']] && monster.characterClass[monsterObj['charClass']].indexOf('Heal') >= 0)) {
                                maxToFortify = (monster.parseCondition('f%', monsterConditions) !== false) ? monster.parseCondition('f%', monsterConditions) : config.getItem('MaxToFortify', 0);
                                if (monster.info[monstType].fort && !firstFortUnderMax && monsterObj['fortify'] < maxToFortify) {
                                    if (monsterObj['over'] === 'ach') {
                                        if (!firstFortOverAch) {
                                            firstFortOverAch = monsterList[selectTypes[s]][m];
                                            utility.log(3, 'firstFortOverAch', firstFortOverAch);
                                        }
                                    } else if (monsterObj['over'] !== 'max') {
                                        firstFortUnderMax = monsterList[selectTypes[s]][m];
                                        utility.log(3, 'firstFortUnderMax', firstFortUnderMax);
                                    }
                                }
                            }

                            if (monster.info[monstType].alpha) {
                                if (config.getItem("StrengthenTo100", true) && monster.characterClass[monsterObj['charClass']] && monster.characterClass[monsterObj['charClass']].indexOf('Strengthen') >= 0) {
                                    if (!firstStrengthUnderMax && monsterObj['strength'] < 100) {
                                        if (monsterObj['over'] === 'ach') {
                                            if (!firstStrengthOverAch) {
                                                firstStrengthOverAch = monsterList[selectTypes[s]][m];
                                                utility.log(3, 'firstStrengthOverAch', firstStrengthOverAch);
                                            }
                                        } else if (monsterObj['over'] !== 'max') {
                                            firstStrengthUnderMax = monsterList[selectTypes[s]][m];
                                            utility.log(3, 'firstStrengthUnderMax', firstStrengthUnderMax);
                                        }
                                    }
                                }

                                if (!firstStunUnderMax && monsterObj['stunDo']) {
                                    if (monsterObj['over'] === 'ach') {
                                        if (!firstStunOverAch) {
                                            firstStunOverAch = monsterList[selectTypes[s]][m];
                                            utility.log(3, 'firstStunOverAch', firstStunOverAch);
                                        }
                                    } else if (monsterObj['over'] !== 'max') {
                                        firstStunUnderMax = monsterList[selectTypes[s]][m];
                                        utility.log(3, 'firstStunUnderMax', firstStunUnderMax);
                                    }
                                }
                            }
                        }
                    }
                }

                // Now we use the first under max/under achievement that we found. If we didn't find any under
                // achievement then we use the first over achievement
                if (selectTypes[s] !== 'raid') {
                    strengthTarget = firstStrengthUnderMax;
                    if (!strengthTarget) {
                        strengthTarget = firstStrengthOverAch;
                    }

                    if (strengthTarget) {
                        energyTarget.data['name'] = strengthTarget;
                        energyTarget.data['type'] = 'Strengthen';
                        utility.log(2, 'Strengthen target ', energyTarget.data['name']);
                    }

                    fortifyTarget = firstFortUnderMax;
                    if (!fortifyTarget) {
                        fortifyTarget = firstFortOverAch;
                    }

                    if (fortifyTarget) {
                        energyTarget.data['name'] = fortifyTarget;
                        energyTarget.data['type'] = 'Fortify';
                        utility.log(2, 'Fortify replaces strengthen ', energyTarget.data['name']);
                    }

                    stunTarget = firstStunUnderMax;
                    if (!stunTarget) {
                        stunTarget = firstStunOverAch;
                    }

                    if (stunTarget) {
                        energyTarget.data['name'] = stunTarget;
                        energyTarget.data['type'] = 'Stun';
                        utility.log(2, 'Stun target replaces fortify ', energyTarget.data['name']);
                    }

                    state.setItem('targetFromfortify', energyTarget.data);
                    if (energyTarget.data['name']) {
                        utility.log(1, 'Energy target', energyTarget.data);
                    }
                }

                monsterName = firstUnderMax;
                if (!monsterName) {
                    monsterName = firstOverAch;
                }

                // If we've got a monster for this selection type then we set the GM variables for the name
                // and stamina requirements
                if (monsterName) {
                    monsterObj = monster.getItem(monsterName);
                    state.setItem('targetFrom' + monsterObj['page'], monsterName);
                    if (monsterObj['page'] === 'battle_monster') {
                        nodeNum = 0;
                        if (!caap.InLevelUpMode() && monster.info[monsterObj['type']] && monster.info[monsterObj['type']].staLvl) {
                            for (nodeNum = monster.info[monsterObj['type']].staLvl.length - 1; nodeNum >= 0; nodeNum -= 1) {
                                if (caap.stats['stamina']['max'] >= monster.info[monsterObj['type']].staLvl[nodeNum]) {
                                    break;
                                }
                            }
                        }

                        if (!caap.InLevelUpMode() && monster.info[monsterObj['type']] && monster.info[monsterObj['type']].staMax && config.getItem('PowerAttack', false) && config.getItem('PowerAttackMax', false)) {
                            state.setItem('MonsterStaminaReq', monster.info[monsterObj['type']].staMax[nodeNum]);
                        } else if (monster.info[monsterObj['type']] && monster.info[monsterObj['type']].staUse) {
                            state.setItem('MonsterStaminaReq', monster.info[monsterObj['type']].staUse);
                        } else if ((caap.InLevelUpMode() && caap.stats['stamina']['num'] >= 10) || monsterObj['conditions'].match(/:pa/i)) {
                            state.setItem('MonsterStaminaReq', 5);
                        } else if (monsterObj['conditions'].match(/:sa/i)) {
                            state.setItem('MonsterStaminaReq', 1);
                        } else if ((caap.InLevelUpMode() && caap.stats['stamina']['num'] >= 10) || config.getItem('PowerAttack', true)) {
                            state.setItem('MonsterStaminaReq', 5);
                        } else {
                            state.setItem('MonsterStaminaReq', 1);
                        }

                        switch (config.getItem('MonsterGeneral', 'Use Current')) {
                        case 'Orc King':
                            state.setItem('MonsterStaminaReq', state.getItem('MonsterStaminaReq', 1) * (general.GetLevel('Orc King') + 1));
                            utility.log(2, 'MonsterStaminaReq:Orc King', state.getItem('MonsterStaminaReq', 1));
                            break;
                        case 'Barbarus':
                            state.setItem('MonsterStaminaReq', state.getItem('MonsterStaminaReq', 1) * (general.GetLevel('Barbarus') === 4 ? 3 : 2));
                            utility.log(2, 'MonsterStaminaReq:Barbarus', state.getItem('MonsterStaminaReq', 1));
                            break;
                        default:
                        }
                    } else {
                        // Switch RaidPowerAttack - RaisStaminaReq is not being used - bug?
                        if (gm.getItem('RaidPowerAttack', false, hiddenVar) || monsterObj['conditions'].match(/:pa/i)) {
                            state.setItem('RaidStaminaReq', 5);
                        } else if (monster.info[monsterObj['type']] && monster.info[monsterObj['type']].staUse) {
                            state.setItem('RaidStaminaReq', monster.info[monsterObj['type']].staUse);
                        } else {
                            state.setItem('RaidStaminaReq', 1);
                        }
                    }
                }
            }

            caap.UpdateDashboard(true);
            return true;
        } catch (err) {
            utility.error("ERROR in monster.select: " + err);
            return false;
        }
    },

    ConfirmRightPage: function (monsterName) {
        try {
            // Confirm name and type of monster
            var monsterDiv = null,
                tempDiv    = null,
                tempText   = '';

            monsterDiv = $("div[style*='dragon_title_owner']");
            if (monsterDiv && monsterDiv.length) {
                tempText = monsterDiv.children(":eq(2)").text().trim();
            } else {
                monsterDiv = $("div[style*='nm_top']");
                if (monsterDiv && monsterDiv.length) {
                    tempText = monsterDiv.children(":eq(0)").children(":eq(0)").text().trim();
                    tempDiv = $("div[style*='nm_bars']");
                    if (tempDiv && tempDiv.length) {
                        tempText += ' ' + tempDiv.children(":eq(0)").children(":eq(0)").children(":eq(0)").siblings(":last").children(":eq(0)").text().trim().replace("'s Life", "");
                    } else {
                        utility.warn("Problem finding nm_bars");
                        return false;
                    }
                } else {
                    utility.warn("Problem finding dragon_title_owner and nm_top");
                    return false;
                }
            }

            if (monsterDiv.find("img[uid='" + caap.stats['FBID'] + "']").length) {
                utility.log(2, "You monster found");
                tempText = tempText.replace(new RegExp(".+?'s "), 'Your ');
            }

            if (monsterName !== tempText) {
                utility.log(2, 'Looking for ' + monsterName + ' but on ' + tempText + '. Going back to select screen');
                return utility.NavigateTo('keep,' + monster.getItem(monsterName).page);
            }

            return false;
        } catch (err) {
            utility.error("ERROR in monster.ConfirmRightPage: " + err);
            return false;
        }
    }
    /*jslint sub: false */
};
