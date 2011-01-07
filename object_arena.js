
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
            'attacking_position' : 0,
            'target_id'          : 0,
            'name'               : '',
            'level'              : 0,
            'mclass'             : '',
            'healthNum'          : 0,
            'healthMax'          : 0,
            'status'             : '',
            'percent'            : 0
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

            tStr = tStr ? tStr.regex(/Battle Starts In (\d+ .+?\()/) : '';
            tNum = tStr ? tStr.regex(/(\d+)/) : 0;
            tStr = tStr ? tStr.regex(/\d+ (.+?)/) : 'sec';
            if (tStr === 'sec') {
                arenaInfo['startTime'] = tNum;
            } else if (tStr === 'min') {
                arenaInfo['startTime'] = tNum * 60;
            }

            arena.setItem(arenaInfo);
            if (arenaInfo['nextTime'] && arenaInfo['nextTime'].parseTimer() && arenaInfo['state'] === 'Ready') {
                utility.log(2, "Waiting Arena start in", arenaInfo['nextTime']);
                schedule.setItem("ArenaReview", arenaInfo['nextTime'].parseTimer(), 20);
            } else {
                if (arenaInfo['tokenTime'] && arenaInfo['tokenTime'].parseTimer() && arenaInfo['state'] === 'Alive') {
                    schedule.setItem("ArenaReview", arenaInfo['ticker'].parseTimer(), 20);
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
                slot          = 0,
                currentRecord = {},
                tStr          = '',
                minionRegEx   = new RegExp("(.*) Level: (\\d+) Class: (.*) Health: (\\d+)/(\\d+) Status: (.*) Arena Activity Points: (\\d+)");

            bannerDiv = $("#app46755028429_arena_battle_banner_section");
            myStatsTxt = bannerDiv.text();
            myStatsTxt = myStatsTxt ? myStatsTxt.trim().innerTrim() : '';
            utility.log(3, "myStatsTxt", myStatsTxt);
            if (bannerDiv && bannerDiv.length) {
                currentRecord = arena.getItem();
                currentRecord['minions'] = [];
                currentRecord['teamHealth'] = 0;
                currentRecord['enemyHealth'] = 0;
                tStr = bannerDiv.text();
                tStr = tStr ? tStr.trim().innerTrim() : '';
                if (!tStr.regex(/(This Arena Battle Is Over)/) && !$("input[src*='arena3_collectbutton.gif']").length  && !$("input[src*='guild_enter_battle_button.gif']").length) {
                    currentRecord['state'] = 'Alive';
                    tStr = $("span[id='app46755028429_monsterTicker']").text();
                    currentRecord['ticker'] = tStr ? tStr.trim() : '';
                    if (myStatsTxt) {
                        utility.log(3, "myStatsTxt", myStatsTxt);
                        myStatsArr = myStatsTxt.match(new RegExp("(.+) Level: (\\d+) Class: (.+) Health: (\\d+)/(\\d+).+Status: (.+) Arena Activity Points: (\\d+)"));
                        if (myStatsArr && myStatsArr.length === 8) {
                            utility.log(2, "myStatsArr", myStatsArr);
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

                                    memberRecord['attacking_position'] = (gIndex + 1);
                                    targetIdDiv = member.find("input[name='target_id']").eq(0);
                                    if (targetIdDiv && targetIdDiv.length) {
                                        memberRecord['target_id'] = targetIdDiv.attr("value") ? targetIdDiv.attr("value").parseInt() : 1;
                                    } else {
                                        utility.warn("Unable to find target_id for minion!", member);
                                    }

                                    memberText = member.children().eq(1).text();
                                    memberText = memberText ? memberText.trim().innerTrim() : '';
                                    utility.log(3, "memberText", memberText);
                                    memberArr = memberText.match(minionRegEx);
                                    if (memberArr && memberArr.length === 8) {
                                        memberRecord['name'] = memberArr[1] ? memberArr[1] : '';
                                        memberRecord['level'] = memberArr[2] ? memberArr[2].parseInt() : 0;
                                        memberRecord['mclass'] = memberArr[3] ? memberArr[3] : '';
                                        memberRecord['healthNum'] = memberArr[4] ? memberArr[4].parseInt() : 0;
                                        memberRecord['healthMax'] = memberArr[5] ? memberArr[5].parseInt() : 1;
                                        memberRecord['status'] = memberArr[6] ? memberArr[6] : '';
                                        memberRecord['percent'] = ((memberRecord['healthNum'] / memberRecord['healthMax']) * 100).dp(2);
                                    } else {
                                        utility.warn("Minion match issue!", memberArr);
                                    }

                                    currentRecord['minions'].push(memberRecord);
                                });
                            }
                        });
                    }
                } else {
                    collectDiv = $("input[src*='arena3_collectbutton.gif']");
                    if (collectDiv && collectDiv.length) {
                        utility.log(1, "Battle ready to collect");
                        currentRecord['state'] = 'Collect';
                        currentRecord['myStatus'] = '';
                        currentRecord['damage'] = 0;
                        currentRecord['minions'] = [];
                        currentRecord['teamHealth'] = 0;
                        currentRecord['enemyHealth'] = 0;
                        collect = true;
                    } else if (!$("input[src*='guild_enter_battle_button.gif']").length && currentRecord['state'] !== 'Ready') {
                        utility.log(1, "Battle is completed");
                        currentRecord['state'] = 'Completed';
                        currentRecord['myStatus'] = '';
                        currentRecord['damage'] = 0;
                        currentRecord['minions'] = [];
                        currentRecord['teamHealth'] = 0;
                        currentRecord['enemyHealth'] = 0;
                    } else {
                        utility.log(1, "Battle is ready to join");
                        currentRecord['state'] = 'Ready';
                        currentRecord['myStatus'] = '';
                        currentRecord['damage'] = 0;
                        currentRecord['minions'] = [];
                        currentRecord['teamHealth'] = 0;
                        currentRecord['enemyHealth'] = 0;
                    }
                }

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
            utility.error("ERROR in arena.onMonster: " + err);
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
                len             = 0,
                first           = {},
                minion          = {};

            if (!record || !$.isPlainObject(record)) {
                throw "Not passed a record";
            }

            for (it = record['minions'].length - 1; it >= 0; it -= 1) {
                if (record['minions'][it]['status'] === 'Stunned') {
                    continue;
                }

                if (!first || !$.isPlainObject(first) || $.isEmptyObject(first)) {
                    first = record['minions'][it];
                } else {
                    if (record['minions'][it]['level'] <= first['level']  && record['minions'][it]['healthNum'] < first['healthNum']) {
                        first = record['minions'][it];
                    }
                }

                if (record['minions'][it]['level'] > caap.stats['level']) {
                    continue;
                }

                minion = record['minions'][it];
                break;
            }

            if (!minion || !$.isPlainObject(minion) || $.isEmptyObject(minion)) {
                utility.log(2, "Using first minion", first);
                if (first && $.isPlainObject(first) && !$.isEmptyObject(first)) {
                    minion = first;
                }
            }

            utility.log(2, "Target minion", minion);
            return minion;
        } catch (err) {
            utility.error("ERROR in arena.getTargetMinion: " + err, arguments.callee.caller);
            return undefined;
        }
    }
};