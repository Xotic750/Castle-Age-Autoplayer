
////////////////////////////////////////////////////////////////////
//                          arena OBJECT
// this is the main object for dealing with guild monsters
/////////////////////////////////////////////////////////////////////

arena = {
    records: [],

    record: function () {
        this.data = {
            'reviewed'    : 0,
            'days'        : 0,
            'tokens'      : 0,
            'tokenTime'   : '',
            'collect'     : false,
            'startTime'   : 0,
            'ticker'      : '',
            'nextTime'    : '',
            'minions'     : [],
            'teamHealth'  : 0,
            'enemyHealth' : 0,
            'damage'      : 0,
            'myStatus'    : '',
            'state'       : ''
        };
    },

    minion: function () {
        this.data = {
            'index'              : 0,
            'attacking_position' : 0,
            'target_id'          : 0,
            'name'               : '',
            'level'              : 0,
            'mclass'             : '',
            'healthNum'          : 0,
            'healthMax'          : 0,
            'status'             : '',
            'percent'            : 0,
            'points'             : 0,
            'lost'               : 0
        };
    },

    me: function () {
        this.data = {
            'name'               : '',
            'level'              : 0,
            'mclass'             : '',
            'healthNum'          : 0,
            'healthMax'          : 0,
            'status'             : '',
            'percent'            : 0
        };
    },

    load: function () {
        try {
            arena.records = gm.getItem('arena.records', 'default');
            if (arena.records === 'default' || !$.isArray(arena.records)) {
                arena.records = gm.setItem('arena.records', []);
            }

            state.setItem("ArenaDashUpdate", true);
            utility.log(3, "arena.load", arena.records);
            return true;
        } catch (err) {
            utility.error("ERROR in arena.load: " + err);
            return false;
        }
    },

    save: function () {
        try {
            gm.setItem('arena.records', arena.records);
            state.setItem("ArenaDashUpdate", true);
            utility.log(3, "arena.save", arena.records);
            return true;
        } catch (err) {
            utility.error("ERROR in arena.save: " + err);
            return false;
        }
    },

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    getItem: function () {
        try {
            return (arena.records.length ? arena.records[0] : new arena.record().data);
        } catch (err) {
            utility.error("ERROR in arena.getItem: " + err, arguments.callee.caller);
            return false;
        }
    },

    setItem: function (record) {
        try {
            if (!record || !$.isPlainObject(record)) {
                throw "Not passed a record";
            }

            arena.records[0] = record;
            utility.log(2, "Updated arena record", record, arena.records);
            arena.save();
            return true;
        } catch (err) {
            utility.error("ERROR in arena.setItem: " + err);
            return false;
        }
    },

    deleteItem: function (slot) {
        try {
            var it        = 0,
                len       = 0,
                success   = false;

            if (typeof slot !== 'number' || slot <= 0) {
                utility.warn("slot", slot);
                throw "Invalid identifying slot!";
            }

            for (it = 0, len = arena.records.length; it < len; it += 1) {
                if (arena.records[it]['slot'] === slot) {
                    success = true;
                    break;
                }
            }

            if (success) {
                arena.records.splice(it, 1);
                arena.save();
                utility.log(3, "Deleted arena record", slot, arena.records);
                return true;
            } else {
                utility.warn("Unable to delete arena record", slot, arena.records);
                return false;
            }
        } catch (err) {
            utility.error("ERROR in arena.deleteItem: " + err);
            return false;
        }
    },
    /*jslint sub: false */

    clear: function () {
        try {
            utility.log(1, "arena.clear");
            arena.records = gm.setItem("arena.records", []);
            state.setItem('staminaArena', 0);
            state.setItem('targetArena', {});
            state.setItem("ArenaDashUpdate", true);
            return true;
        } catch (err) {
            utility.error("ERROR in arena.clear: " + err);
            return false;
        }
    },

    navigate_to_main: function () {
        return utility.NavigateTo('battle,arena', 'tab_arena_on.gif');
    },

    navigate_to_main_refresh: function () {
        var button = utility.CheckForImage("tab_arena_on.gif");
        if (button) {
            utility.Click(button);
        }

        state.setItem('ArenaRefresh', false);
        return button ? true : false;
    },

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    checkInfo: function () {
        try {
            var tokenSpan   = $(),
                timerSpan   = $(),
                daysDiv     = $(),
                bottomDiv   = $(),
                enterButton = null,
                tStr        = '',
                tStr2       = '',
                tNum        = 0,
                arenaInfo   = {};

            arenaInfo = arena.getItem();
            arenaInfo['reviewed'] = new Date().getTime();

            tokenSpan = $("span[id='app46755028429_guild_token_current_value']");
            tStr = tokenSpan.length ? tokenSpan.text().trim() : '';
            arenaInfo['tokens'] = tStr ? tStr.parseInt() : 0;

            timerSpan = $("span[id='app46755028429_guild_token_time_value']");
            tStr = timerSpan.length ? timerSpan.text().trim() : '';
            tStr = tStr ? tStr.regex(/(\d+:\d+)/) : '';
            arenaInfo['tokenTime'] = tStr ? tStr : '';

            daysDiv = $("#app46755028429_arena_banner").children().eq(0).children().eq(0);
            tStr = daysDiv.length ? daysDiv.text().trim() : '';
            arenaInfo['days'] = tStr ? tStr.regex(/(\d+) DAYS/) : 0;

            bottomDiv = $("div[style *='arena3_home_bottom.jpg']");
            tStr = bottomDiv.length ? bottomDiv.text().trim().innerTrim() : '';
            arenaInfo['collect'] = tStr ? (tStr.regex(/(Battle Over, Collect Your Reward!)/)  ? true : false) : false;
            tStr2 = tStr ? tStr.regex(/^Time Remaining: (\d+:\d+:\d+)/) : '';
            arenaInfo['ticker'] = tStr2 ? tStr2 : '';
            if (arenaInfo['ticker'].parseTimer() && arenaInfo['state'] === 'Completed') {
                arenaInfo['state'] = 'Ready';
                arenaInfo['myStatus'] = '';
                arenaInfo['damage'] = 0;
                arenaInfo['minions'] = [];
                arenaInfo['teamHealth'] = 0;
                arenaInfo['enemyHealth'] = 0;
            }

            tStr2 = tStr ? tStr.regex(/ Time Remaining: (\d+:\d+:\d+)/) : '';
            arenaInfo['nextTime'] = tStr2 ? tStr2 : '';

            tStr = tStr ? tStr.regex(new RegExp("Battle Starts In (\\d+ .+?)\\(")) : '';
            tNum = tStr ? tStr.regex(/(\d+)/) : 0;
            tStr = tStr ? tStr.regex(new RegExp("\\d+ (.+)")) : 'sec';
            utility.log(2, "startTime", tNum, tStr);
            if (tStr === 'sec') {
                arenaInfo['startTime'] = tNum;
            } else if (tStr === 'min') {
                arenaInfo['startTime'] = tNum * 60;
            }

            arena.setItem(arenaInfo);
            if (arenaInfo['startTime'] && arenaInfo['state'] === 'Ready') {
                utility.log(2, "Arena starting in", arenaInfo['startTime']);
                schedule.setItem("ArenaReview", arenaInfo['startTime'], 20);
            } else if (arenaInfo['nextTime'] && arenaInfo['nextTime'].parseTimer() < 3600 && arenaInfo['state'] === 'Ready') {
                utility.log(2, "Waiting Arena start in", arenaInfo['nextTime']);
                schedule.setItem("ArenaReview", arenaInfo['nextTime'].parseTimer(), 20);
            } else {
                if (arenaInfo['tokenTime'] && arenaInfo['tokenTime'].parseTimer() && arenaInfo['state'] === 'Alive') {
                    schedule.setItem("ArenaReview", arenaInfo['tokenTime'].parseTimer(), 20);
                    utility.log(2, "Waiting Arena token in", arenaInfo['tokenTime']);
                } else {
                    schedule.setItem("ArenaReview", gm.getItem('ArenaReviewMins', 5, hiddenVar) * 60, 120);
                    utility.log(2, "Waiting 5 mins for Arena review");
                }
            }

            utility.log(2, "arena.checkInfo", arenaInfo);
            return true;
        } catch (err) {
            utility.error("ERROR in arena.checkInfo: " + err);
            return false;
        }
    },

    onBattle: function () {
        try {
            var gates         = $(),
                health        = $(),
                healthGuild   = $(),
                healthEnemy   = $(),
                allowedDiv    = $(),
                bannerDiv     = $(),
                collectDiv    = $(),
                tokenSpan     = $(),
                timerSpan     = $(),
                collect       = false,
                myStatsTxt    = '',
                myStatsArr    = [],
                index         = 0,
                currentRecord = {},
                minions       = [],
                tStr          = '',
                lastAttacked  = -1,
                minionRegEx   = new RegExp("(.*) Level: (\\d+) Class: (.*) Health: (\\d+)/(\\d+) Status: (.*) Arena Activity Points: (\\d+)");

            currentRecord = arena.getItem();
            lastAttacked = state.getItem('ArenaMinionAttacked', -1);
            state.setItem('ArenaMinionAttacked', -1);
            if (lastAttacked >= 0 && lastAttacked < 40) {
                if ($("img[src*='battle_defeat.gif']").length) {
                    currentRecord['minions'][lastAttacked]['lost'] += 1;
                    utility.log(2, "Defeated by minion", lastAttacked, currentRecord['minions'][lastAttacked]);
                    arena.setItem(currentRecord);
                }
            }

            bannerDiv = $("#app46755028429_arena_battle_banner_section");
            myStatsTxt = bannerDiv.text();
            myStatsTxt = myStatsTxt ? myStatsTxt.trim().innerTrim() : '';
            utility.log(3, "myStatsTxt", myStatsTxt);
            if (bannerDiv && bannerDiv.length) {
                currentRecord['teamHealth'] = 0;
                currentRecord['enemyHealth'] = 0;
                tStr = bannerDiv.text();
                tStr = tStr ? tStr.trim().innerTrim() : '';
                if (tStr.regex(/(You Are Not A Part Of This Arena Battle)/)) {
                    return true;
                }

                if (!tStr.regex(/(This Battle Has Not Started Yet)/) && !tStr.regex(/(This Arena Battle Is Over)/) && !$("input[src*='arena3_collectbutton.gif']").length  && !$("input[src*='guild_enter_battle_button.gif']").length) {
                    currentRecord['state'] = 'Alive';
                    tStr = $("span[id='app46755028429_monsterTicker']").text();
                    currentRecord['ticker'] = tStr ? tStr.trim() : '';
                    if (myStatsTxt) {
                        utility.log(3, "myStatsTxt", myStatsTxt);
                        myStatsArr = myStatsTxt.match(new RegExp("(.+) Level: (\\d+) Class: (.+) Health: (\\d+)/(\\d+).+Status: (.+) Arena Activity Points: (\\d+)"));
                        if (myStatsArr && myStatsArr.length === 8) {
                            utility.log(3, "myStatsArr", myStatsArr);
                            currentRecord['damage'] = myStatsArr[7] ? myStatsArr[7].parseInt() : 0;
                            currentRecord['myStatus'] = myStatsArr[6] ? myStatsArr[6].trim() : '';
                        } else {
                            utility.warn("myStatsArr error", myStatsArr, myStatsTxt);
                        }
                    }

                    tokenSpan = $("span[id='app46755028429_guild_token_current_value']");
                    tStr = tokenSpan.length ? tokenSpan.text().trim() : '';
                    currentRecord['tokens'] = tStr ? tStr.parseInt() : 0;

                    timerSpan = $("span[id='app46755028429_guild_token_time_value']");
                    tStr = timerSpan.length ? timerSpan.text().trim() : '';
                    currentRecord['tokenTime'] = tStr ? tStr.regex(/(\d+:\d+)/) : '0:00';

                    health = $("#app46755028429_guild_battle_health");
                    if (health && health.length) {
                        healthEnemy = health.find("div[style*='guild_battle_bar_enemy.gif']").eq(0);
                        if (healthEnemy && healthEnemy.length) {
                            currentRecord['enemyHealth'] = (100 - utility.getElementWidth(healthEnemy)).dp(2);
                        } else {
                            utility.warn("guild_battle_bar_enemy.gif not found");
                        }

                        healthGuild = health.find("div[style*='guild_battle_bar_you.gif']").eq(0);
                        if (healthGuild && healthGuild.length) {
                            currentRecord['teamHealth'] = (100 - utility.getElementWidth(healthGuild)).dp(2);
                        } else {
                            utility.warn("guild_battle_bar_you.gif not found");
                        }
                    } else {
                        utility.warn("guild_battle_health error");
                    }

                    gates = $("div[id*='app46755028429_enemy_guild_member_list_']");
                    if (!gates || !gates.length) {
                        utility.warn("No gates found");
                    } else if (gates && gates.length !== 4) {
                        utility.warn("Not enough gates found");
                    } else {
                        gates.each(function (gIndex) {
                            var memberDivs = $(this).children();
                            if (!memberDivs || !memberDivs.length) {
                                utility.warn("No members found");
                            } else if (memberDivs && memberDivs.length !== 10) {
                                utility.warn("Not enough members found", memberDivs);
                            } else {
                                memberDivs.each(function (mIndex) {
                                    var member       = $(this),
                                        memberText   = '',
                                        memberArr    = [],
                                        targetIdDiv  = $(),
                                        memberRecord = new arena.minion().data;

                                    memberRecord['index'] = index;
                                    targetIdDiv = member.find("input[name='target_id']").eq(0);
                                    if (targetIdDiv && targetIdDiv.length) {
                                        memberRecord['target_id'] =  targetIdDiv.attr("value") ? targetIdDiv.attr("value").parseInt() : 1;
                                    } else {
                                        utility.warn("Unable to find target_id for minion!", member);
                                    }

                                    memberRecord['attacking_position'] = (gIndex + 1);
                                    memberText = member.children().eq(1).text();
                                    memberText = memberText ? memberText.trim().innerTrim() : '';
                                    utility.log(3, "memberText", memberText);
                                    memberArr = memberText.match(minionRegEx);
                                    if (memberArr && memberArr.length === 8) {
                                        memberRecord['name'] = memberArr[1] ? memberArr[1] : '';
                                        memberRecord['level'] = memberArr[2] ? memberArr[2].parseInt() : 0;
                                        memberRecord['mclass'] = memberArr[3] ? memberArr[3] : '';
                                        memberRecord['healthNum'] = memberArr[4] ? memberArr[4].parseInt() : 0;
                                        memberRecord['healthMax'] = memberArr[5] ? memberArr[5].parseInt() : 0;
                                        memberRecord['status'] = memberArr[6] ? memberArr[6] : '';
                                        memberRecord['points'] = memberArr[7] ? memberArr[7].parseInt() : 0;
                                        memberRecord['percent'] = ((memberRecord['healthNum'] / (memberRecord['healthMax'] ? memberRecord['healthMax'] : 1)) * 100).dp(2);
                                    } else {
                                        utility.warn("Minion match issue!", memberArr);
                                    }

                                    if (currentRecord['minions'] && currentRecord['minions'].length === 40) {
                                        if (currentRecord['minions'][index]['index'] === index) {
                                            memberRecord['lost'] = currentRecord['minions'][index]['lost'] ? currentRecord['minions'][index]['lost'] : 0;
                                        } else {
                                            utility.warn("Minion index issue!", index, currentRecord['minions'][index], memberRecord);
                                        }
                                    }

                                    index = minions.push(memberRecord);
                                });
                            }
                        });
                    }
                } else {
                    collectDiv = $("input[src*='arena3_collectbutton.gif']");
                    if (collectDiv && collectDiv.length) {
                        utility.log(1, "Battle ready to collect");
                        currentRecord['state'] = 'Collect';
                        collect = true;
                    } else if (!$("input[src*='guild_enter_battle_button.gif']").length && currentRecord['state'] !== 'Ready') {
                        utility.log(1, "Battle is completed");
                        currentRecord['state'] = 'Completed';
                    } else {
                        utility.log(1, "Battle is ready to join");
                        currentRecord['state'] = 'Ready';
                    }

                    currentRecord['myStatus'] = '';
                    currentRecord['damage'] = 0;
                    currentRecord['teamHealth'] = 0;
                    currentRecord['enemyHealth'] = 0;
                }

                currentRecord['minions'] = minions.slice();
                currentRecord['reviewed'] = new Date().getTime();
                utility.log(2, "currentRecord", currentRecord);
                arena.setItem(currentRecord);
                if (collect) {
                    utility.Click(collectDiv.get(0));
                }
            } else {
                utility.warn("Not on arena battle page");
            }

            return true;
        } catch (err) {
            utility.error("ERROR in arena.onBattle: " + err);
            return false;
        }
    },

    checkPage: function () {
        try {
            return ($("#app46755028429_arena_battle_banner_section").length ? true : false);
        } catch (err) {
            utility.error("ERROR in arena.checkPage: " + err, arguments.callee.caller);
            return undefined;
        }
    },

    getTargetMinion: function (record) {
        try {
            var it              = 0,
                nolossFirst     = false,
                first           = {},
                activeCleric    = false,
                firstCleric1    = {},
                firstCleric2    = {},
                firstCleric3    = {},
                activeMage      = false,
                firstMage1      = {},
                firstMage2      = {},
                firstMage3      = {},
                activeRogue     = false,
                firstRogue1     = {},
                firstRogue2     = {},
                firstRogue3     = {},
                activeWarrior   = false,
                firstWarrior1   = {},
                firstWarrior2   = {},
                firstWarrior3   = {},
                minion          = {},
                killClericFirst = false;

            if (!record || !$.isPlainObject(record)) {
                throw "Not passed a record";
            }

            for (it = record['minions'].length - 1; it >= 0; it -= 1) {
                var cm = {};

                cm = record['minions'][it];
                if (cm['status'] === 'Stunned') {
                    utility.log(3, "Skipping stunned minion", cm);
                    continue;
                }

                if (!first || !$.isPlainObject(first) || $.isEmptyObject(first)) {
                    utility.log(3, "First minion alive", cm);
                    first = cm;
                }

                if (cm['lost']) {
                    utility.log(2, "Skipping minion we lost to", cm);
                    continue;
                }

                if (!nolossFirst) {
                    nolossFirst = false
                    utility.log(3, "First minion alive without loss", cm);
                    first = cm;
                }

                switch (cm['mclass']) {
                case 'Cleric':
                    if (cm['healthNum'] > 200) {
                        if (cm['points']) {
                            activeCleric = true;
                            if ($.isEmptyObject(firstCleric1)) {
                                utility.log(2, "First active Cleric", cm);
                                firstCleric1 = cm;
                                continue;
                            }

                            if (cm['healthNum'] < firstCleric1['healthNum']) {
                                utility.log(2, "Active Cleric with less health", cm);
                                firstCleric1 = cm;
                                continue;
                            }
                        } else {
                            if ($.isEmptyObject(firstCleric2)) {
                                utility.log(2, "First Cleric", cm);
                                firstCleric2 = cm;
                                continue;
                            }

                            if (!activeCleric && cm['healthNum'] < firstCleric2['healthNum']) {
                                utility.log(2, "Cleric with less health", cm);
                                firstCleric2 = cm;
                                continue;
                            }
                        }
                    }

                    if ($.isEmptyObject(firstCleric3)) {
                        utility.log(2, "First alive Cleric", cm);
                        firstCleric3 = cm;
                        continue;
                    }

                    break;
                case 'Mage':
                    if (cm['healthNum'] > 200) {
                        if (cm['points']) {
                            activeMage = true;
                            if ($.isEmptyObject(firstMage1)) {
                                utility.log(2, "First active Mage", cm);
                                firstMage1 = cm;
                                continue;
                            }

                            if (cm['healthNum'] < firstMage1['healthNum']) {
                                utility.log(2, "Active Mage with less health", cm);
                                firstMage1 = cm;
                                continue;
                            }
                        } else {
                            if ($.isEmptyObject(firstMage2)) {
                                utility.log(2, "First Mage", cm);
                                firstMage2 = cm;
                                continue;
                            }

                            if (!activeMage && cm['healthNum'] < firstMage2['healthNum']) {
                                utility.log(2, "Mage with less health", cm);
                                firstMage2 = cm;
                                continue;
                            }
                        }
                    }

                    if ($.isEmptyObject(firstMage3)) {
                        utility.log(2, "First alive Mage", cm);
                        firstMage3 = cm;
                        continue;
                    }

                    break;
                case 'Rogue':
                    if (cm['healthNum'] > 200) {
                        if (cm['points']) {
                            activeRogue = true;
                            if ($.isEmptyObject(firstRogue1)) {
                                utility.log(2, "First active Rogue", cm);
                                firstRogue1 = cm;
                                continue;
                            }

                            if (cm['healthNum'] < firstRogue1['healthNum']) {
                                utility.log(2, "Active Rogue with less health", cm);
                                firstRogue1 = cm;
                                continue;
                            }
                        } else {
                            if ($.isEmptyObject(firstRogue2)) {
                                utility.log(2, "First Rogue", cm);
                                firstRogue2 = cm;
                                continue;
                            }

                            if (!activeRogue && cm['healthNum'] < firstRogue2['healthNum']) {
                                utility.log(2, "Rogue with less health", cm);
                                firstRogue2 = cm;
                                continue;
                            }
                        }
                    }

                    if ($.isEmptyObject(firstRogue3)) {
                        utility.log(2, "First alive Rogue", cm);
                        firstRogue3 = cm;
                        continue;
                    }

                    break;
                case 'Warrior':
                    if (cm['healthNum'] > 200) {
                        if (cm['points']) {
                            activeWarrior = true;
                            if ($.isEmptyObject(firstWarrior1)) {
                                utility.log(2, "First active Warrior", cm);
                                firstWarrior1 = cm;
                                continue;
                            }

                            if (cm['healthNum'] < firstWarrior1['healthNum']) {
                                utility.log(2, "Active Warrior with less health", cm);
                                firstWarrior1 = cm;
                                continue;
                            }
                        } else {
                            if ($.isEmptyObject(firstWarrior2)) {
                                utility.log(2, "First Warrior", cm);
                                firstWarrior2 = cm;
                                continue;
                            }

                            if (!activeWarrior && cm['healthNum'] < firstWarrior2['healthNum']) {
                                utility.log(2, "Warrior with less health", cm);
                                firstWarrior2 = cm;
                                continue;
                            }
                        }
                    }

                    if ($.isEmptyObject(firstWarrior3)) {
                        utility.log(2, "First alive Warrior", cm);
                        firstWarrior3 = cm;
                        continue;
                    }

                    break;
                default:
                }
            }


            killClericFirst = config.getItem("killClericFirst", false);
            if (killClericFirst && !$.isEmptyObject(firstCleric1)) {
                minion = firstCleric1;
            } else if (killClericFirst && !$.isEmptyObject(firstCleric2)) {
                minion = firstCleric2;
            } else if (killClericFirst && !$.isEmptyObject(firstCleric3)) {
                minion = firstCleric23;
            } else if (!$.isEmptyObject(firstCleric1)) {
                minion = firstCleric1;
            } else if (!$.isEmptyObject(firstMage1)) {
                minion = firstMage1;
            } else if (!$.isEmptyObject(firstRogue1)) {
                minion = firstRogue1;
            } else if (!$.isEmptyObject(firstWarrior1)) {
                minion = firstWarrior1;
            } else if (!$.isEmptyObject(firstCleric2)) {
                minion = firstCleric2;
            } else if (!$.isEmptyObject(firstMage2)) {
                minion = firstMage2;
            } else if (!$.isEmptyObject(firstRogue2)) {
                minion = firstRogue2;
            } else if (!$.isEmptyObject(firstWarrior2)) {
                minion = firstWarrior2;
            } else if (!$.isEmptyObject(firstCleric3)) {
                minion = firstCleric3;
            } else if (!$.isEmptyObject(firstMage3)) {
                minion = firstMage3;
            } else if (!$.isEmptyObject(firstRogue3)) {
                minion = firstRogue3;
            } else if (!$.isEmptyObject(firstWarrior3)) {
                minion = firstWarrior3;
            } else {
                minion = first;
            }

            utility.log(2, "Target " + minion['mclass'], minion);
            return minion;
        } catch (err) {
            utility.error("ERROR in arena.getTargetMinion: " + err, arguments.callee.caller);
            return undefined;
        }
    }
};