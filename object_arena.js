
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
            'myClass'     : '',
            'state'       : '',
            'wins'        : [],
            'losses'      : []
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
            'won'                : false,
            'lost'               : false,
            'poly'               : false,
            'last_ap'            : 0
        };
    },

    win: function () {
        this.data = {
            'userId' : 0,
            'ap'     : 0
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

            arena.cleanWins();
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

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    setWin: function (records, won) {
        try {
            if (!records || !$.isArray(records)) {
                throw "Not passed records";
            }

            if (!won || !$.isPlainObject(won)) {
                throw "Not passed a win";
            }

            if (won['userId'] === '' || isNaN(won['userId']) || won['userId'] < 1) {
                utility.warn("userId", won['userId']);
                throw "Invalid identifying userId!";
            }

            var it      = 0,
                len     = 0,
                success = false;

            for (it = 0, len = records.length; it < len; it += 1) {
                if (records[it]['userId'] === won['userId']) {
                    success = true;
                    break;
                }
            }

            if (success) {
                records[it] = won;
                utility.log(3, "Updated records", won, records);
            } else {
                records.push(won);
                utility.log(3, "Added records", won, records);
            }

            return records;
        } catch (err) {
            utility.error("ERROR in arena.setWin: " + err, won, records, arguments.callee.caller);
            return false;
        }
    },

    getWin: function (records, userId) {
        try {
            if (!records || !$.isArray(records)) {
                throw "Not passed records";
            }

            if (userId === '' || isNaN(userId) || userId < 1) {
                utility.warn("userId", userId);
                throw "Invalid identifying userId!";
            }

            var it      = 0,
                len     = 0,
                success = false;

            for (it = 0, len = records.length; it < len; it += 1) {
                if (records[it]['userId'] === userId) {
                    success = true;
                    break;
                }
            }

            if (success) {
                utility.log(3, "Got win record", userId, records[it]);
                return records[it];
            } else {
                utility.log(3, "No win record", userId);
                return false;
            }
        } catch (err) {
            utility.error("ERROR in arena.getWin: " + err, userId, records, arguments.callee.caller);
            return false;
        }
    },

    delWin: function (records, userId) {
        try {
            if (!records || !$.isArray(records)) {
                throw "Not passed records";
            }

            if (userId === '' || isNaN(userId) || userId < 1) {
                utility.warn("userId", userId);
                throw "Invalid identifying userId!";
            }

            var it      = 0,
                len     = 0,
                success = false;

            for (it = 0, len = records.length; it < len; it += 1) {
                if (records[it]['userId'] === userId) {
                    success = true;
                    break;
                }
            }

            if (success) {
                records.splice(it, 1);
                utility.log(2, "Deleted win record", userId, records);
                return records;
            } else {
                utility.log(3, "Unable to delete win record", userId, records);
                return false;
            }
        } catch (err) {
            utility.error("ERROR in arena.delWin: " + err, userId, records, arguments.callee.caller);
            return false;
        }
    },

    setLoss: function (records, userId) {
        try {
            if (!records || !$.isArray(records)) {
                throw "Not passed records";
            }

            if (userId === '' || isNaN(userId) || userId < 1) {
                utility.warn("userId", userId);
                throw "Invalid identifying userId!";
            }

            if (records.indexOf(userId) >= 0) {
                utility.log(3, "userId exists", userId, records);
            } else {
                records.push(userId);
                utility.log(3, "Added userId", userId, records);
            }

            return records;
        } catch (err) {
            utility.error("ERROR in arena.setLoss: " + err, userId, records, arguments.callee.caller);
            return false;
        }
    },

    checkLoss: function (records, userId) {
        try {
            if (!records || !$.isArray(records)) {
                throw "Not passed records";
            }

            if (userId === '' || isNaN(userId) || userId < 1) {
                utility.warn("userId", userId);
                throw "Invalid identifying userId!";
            }

            if (records.indexOf(userId) >= 0) {
                utility.log(3, "userId exists", userId, records);
                return true;
            } else {
                utility.log(3, "userId not exists", userId, records);
                return false;
            }
        } catch (err) {
            utility.error("ERROR in arena.checkLoss: " + err, userId, records, arguments.callee.caller);
            return undefined;
        }
    },

    delLoss: function (records, userId) {
        try {
            if (!records || !$.isArray(records)) {
                throw "Not passed records";
            }

            if (userId === '' || isNaN(userId) || userId < 1) {
                utility.warn("userId", userId);
                throw "Invalid identifying userId!";
            }

            var it = -1;

            it = records.indexOf(userId);
            if (it >= 0) {
                records.splice(it, 1);
                utility.log(3, "Deleted loss", userId, records);
                return records;
            } else {
                utility.log(3, "Unable to delete loss", userId, records);
                return false;
            }
        } catch (err) {
            utility.error("ERROR in arena.delLoss: " + err, userId, records, arguments.callee.caller);
            return false;
        }
    },

    cleanWins: function () {
        try {
            var arenaInfo = {},
                wins      = [],
                it        = 0,
                len       = 0,
                found     = false;

            arenaInfo = arena.getItem();
            if (!$.isEmptyObject(arenaInfo)) {
                for (it = 0, len = arenaInfo['wins'].length; it < len; it += 1) {
                    if (arenaInfo['losses'].indexOf(arenaInfo['wins'][it]['userId']) >= 0) {
                        utility.log(1, "Found win in losses: delete", arenaInfo['wins'][it]);
                        arenaInfo['wins'].splice(it, 1);
                        found = true;
                    }
                }
            } else {
                utility.log(1, "No loss records available", arenaInfo);
            }

            if (found) {
                arena.setItem(arenaInfo);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in arena.cleanWins: " + err, arguments.callee.caller);
            return false;
        }
    },

    /*jslint sub: false */

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
                arenaInfo['teamHealth'] = 0;
                arenaInfo['enemyHealth'] = 0;
            }

            tStr2 = tStr ? tStr.regex(/ Time Remaining: (\d+:\d+:\d+)/) : '';
            arenaInfo['nextTime'] = tStr2 ? tStr2 : '';
            tStr = tStr ? tStr.regex(new RegExp("Battle Starts In (\\d+ .+?)\\(")) : '';
            tNum = tStr ? tStr.regex(/(\d+)/) : 0;
            tStr = tStr ? tStr.regex(new RegExp("\\d+ (.+)")) : 'sec';
            utility.log(3, "startTime", tNum, tStr);
            if (tStr === 'sec') {
                arenaInfo['startTime'] = tNum;
            } else if (tStr === 'min') {
                arenaInfo['startTime'] = tNum * 60;
            }

            arena.setItem(arenaInfo);
            if (arenaInfo['startTime'] && arenaInfo['state'] === 'Ready') {
                arenaInfo['minions'] = [];
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
                tabs          = $(),
                health        = $(),
                healthGuild   = $(),
                healthEnemy   = $(),
                allowedDiv    = $(),
                bannerDiv     = $(),
                collectDiv    = $(),
                tokenSpan     = $(),
                timerSpan     = $(),
                resultBody    = $(),
                imgDiv        = $(),
                collect       = false,
                myStatsTxt    = '',
                myStatsArr    = [],
                index         = 0,
                currentRecord = {},
                minions       = [],
                tStr          = '',
                checkStr      = '',
                tNum          = 0,
                lastAttacked  = {},
                won           = {},
                losses        = [],
                wins          = [],
                minionRegEx   = new RegExp("(.*) Level: (\\d+) Class: (.*) Health: (\\d+)/(\\d+) Status: (.*) Arena Activity Points: (\\d+)");

            currentRecord = arena.getItem();
            if (currentRecord['state'] !== 'Alive') {
                utility.log(2, "Test targeting");
                arena.getTargetMinion(currentRecord);
            }

            if (!currentRecord['wins']) {
                currentRecord['wins'] = [];
            }

            if (!currentRecord['losses']) {
                currentRecord['losses'] = [];
            }

            if (!currentRecord['myClass']) {
                currentRecord['myClass'] = '';
            }

            lastAttacked = state.getItem('ArenaMinionAttacked', {});
            state.setItem('ArenaMinionAttacked', {});
            if (!$.isEmptyObject(lastAttacked) && lastAttacked['index'] >= 0 && lastAttacked['index'] < 40) {
                resultBody = $("span[class='result_body']");
                if (resultBody && resultBody.length) {
                    tStr = resultBody.text();
                    tNum = tStr ? tStr.regex(/\+(\d+) Battle Activity Points/) : 0;
                    currentRecord['minions'][lastAttacked['index']]['last_ap'] = tNum ? tNum : 0;
                }

                imgDiv = $("img[src*='battle_defeat.gif']");
                if (imgDiv && imgDiv.length) {
                    currentRecord['minions'][lastAttacked['index']]['lost'] = true;
                    wins = arena.delWin(currentRecord['wins'], currentRecord['minions'][lastAttacked['index']]['target_id']);
                    currentRecord['wins'] = wins ? wins : currentRecord['wins'];
                    losses = arena.setLoss(currentRecord['losses'], currentRecord['minions'][lastAttacked['index']]['target_id']);
                    currentRecord['losses'] = losses ? losses : currentRecord['losses'];
                    arena.setItem(currentRecord);
                    utility.log(1, "Defeated by minion", tNum, currentRecord['minions'][lastAttacked['index']]);
                } else {
                    currentRecord['minions'][lastAttacked['index']]['last_ap'] = tNum ? tNum : 0;
                    imgDiv = $("img[src*='battle_victory.gif']");
                    if (imgDiv && imgDiv.length) {
                        if (lastAttacked['poly']) {
                            utility.log(1, "Victory against polymorphed minion", tNum, currentRecord['minions'][lastAttacked['index']]);
                        } else if (imgDiv && imgDiv.length) {
                            won = new arena.win();
                            won.data['userId'] = currentRecord['minions'][lastAttacked['index']]['target_id'];
                            won.data['ap'] = currentRecord['minions'][lastAttacked['index']]['last_ap'];
                            wins = arena.setWin(currentRecord['wins'], won.data);
                            currentRecord['wins'] = wins ? wins : currentRecord['wins'];
                            losses = arena.delLoss(currentRecord['losses'], currentRecord['minions'][lastAttacked['index']]['target_id']);
                            currentRecord['losses'] = losses ? losses : currentRecord['losses'];
                            arena.setItem(currentRecord);
                            utility.log(1, "Victory against minion", tNum, currentRecord['minions'][lastAttacked['index']]);
                        }
                    }
                }
            }

            bannerDiv = $("#app46755028429_arena_battle_banner_section");
            myStatsTxt = bannerDiv.text();
            myStatsTxt = myStatsTxt ? myStatsTxt.trim().innerTrim() : '';
            if (myStatsTxt.regex(/(You Are Not A Part Of This Arena Battle)/)) {
                return true;
            }

            utility.log(3, "myStatsTxt", myStatsTxt);
            if (bannerDiv && bannerDiv.length) {
                currentRecord['teamHealth'] = 0;
                currentRecord['enemyHealth'] = 0;
                if (!myStatsTxt.regex(/(This Battle Has Not Started Yet)/)) {
                    gates = $("div[id*='app46755028429_enemy_guild_member_list_']");
                    if (!gates || !gates.length) {
                        tabs = $("div[id*='app46755028429_your_arena_tab']");
                        if (!tabs || !tabs.length) {
                            utility.warn("No gates found");
                        }
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
                                        polyImg      = $(),
                                        nameDiv      = $(),
                                        loss         = false,
                                        memberRecord = new arena.minion().data;

                                    memberRecord['index'] = index;
                                    targetIdDiv = member.find("input[name='target_id']").eq(0);
                                    if (targetIdDiv && targetIdDiv.length) {
                                        memberRecord['target_id'] = targetIdDiv.attr("value") ? targetIdDiv.attr("value").parseInt() : 0;
                                        won = arena.getWin(currentRecord['wins'], memberRecord['target_id']);
                                        if (won) {
                                            memberRecord['won'] = true;
                                            memberRecord['last_ap'] = won['ap'] ? won['ap'] : 0;
                                        }

                                        loss = arena.checkLoss(currentRecord['losses'], memberRecord['target_id']);
                                        if (typeof loss === 'boolean') {
                                            memberRecord['lost'] = loss;
                                        }
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
                                            memberRecord['lost'] = currentRecord['minions'][index]['lost'] ? currentRecord['minions'][index]['lost'] : false;
                                            memberRecord['last_ap'] = currentRecord['minions'][index]['last_ap'] ? currentRecord['minions'][index]['last_ap'] : 0;
                                        } else {
                                            utility.warn("Minion index issue!", index, currentRecord['minions'][index], memberRecord);
                                        }
                                    }

                                    nameDiv = member.find("div[style='font-size: 19px; padding-bottom: 3px;']");
                                    if (nameDiv && nameDiv.length === 1) {
                                        if (memberRecord['won']) {
                                            tStr = '<div style="float: left; width: 220px; font-size: 11px;"><span style="float: left;" title="Won - Last Points: ' + memberRecord['last_ap'];
                                            tStr += '" class="ui-icon ui-icon-circle-check">Won</span> Last Points: ' + memberRecord['last_ap'] + '</div>';
                                            nameDiv.after(tStr);
                                        }

                                        if (memberRecord['lost']) {
                                            tStr = '<div style="float: left; width: 220px; font-size: 11px;"><span style="float: left;" title="Lost" class="ui-icon ui-icon-circle-close">Lost</span>Lost</div>';
                                            nameDiv.after(tStr);
                                        }
                                    }

                                    polyImg = member.find("img[src*='polymorph_effect']");
                                    memberRecord['poly'] = (polyImg && polyImg.length) ? true : false;
                                    if (memberRecord['poly']) {
                                        utility.log(3, "poly", memberRecord);
                                    }

                                    index = minions.push(memberRecord);
                                });
                            }
                        });
                    }
                }

                if (!myStatsTxt.regex(/(This Battle Has Not Started Yet)/) && !myStatsTxt.regex(/(This Arena Battle Is Over)/) && !$("input[src*='arena3_collectbutton.gif']").length  && !$("input[src*='guild_enter_battle_button.gif']").length) {
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
                            currentRecord['myClass'] = myStatsArr[3] ? myStatsArr[6].trim() : '';
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

                if (minions && minions.length) {
                    currentRecord['minions'] = minions.slice();
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

    getMinion: function (index) {
        try {
            var arenaInfo = {},
                minion    = {},
                it        = 0,
                len       = 0;

            if (index === '' || isNaN(index) || index < 0 || index > 40) {
                utility.warn("index", index);
                throw "Invalid identifying index!";
            }

            arenaInfo = arena.getItem();
            if (!$.isEmptyObject(arenaInfo) && arenaInfo['minions'] && arenaInfo['minions'].length === 40) {
                minion = arenaInfo['minions'][index];
            } else {
                utility.log(1, "No minion records available", arenaInfo);
            }

            return minion;
        } catch (err) {
            utility.error("ERROR in arena.getTarget: " + err, arguments.callee.caller);
            return false;
        }
    },

    getTargetMinion: function (record) {
        try {
            var it              = 0,
                ot              = 0,
                lenIt           = 0,
                lenOt           = 0,
                target = {
                    'Cleric' : {
                        'last'    : {},
                        'suicide' : {},
                        'active'  : {},
                        'alive'   : {},
                        'health'  : {},
                        'poly'    : {},
                        'chain'   : {}
                    },
                    'Mage' : {
                        'last'    : {},
                        'suicide' : {},
                        'active'  : {},
                        'alive'   : {},
                        'health'  : {},
                        'poly'    : {},
                        'chain'   : {}
                    },
                    'Rogue' : {
                        'last'    : {},
                        'suicide' : {},
                        'active'  : {},
                        'alive'   : {},
                        'health'  : {},
                        'poly'    : {},
                        'chain'   : {}
                    },
                    'Warrior' : {
                        'last'    : {},
                        'suicide' : {},
                        'active'  : {},
                        'alive'   : {},
                        'health'  : {},
                        'poly'    : {},
                        'chain'   : {}
                    }
                },
                minion            = {},
                killClericFirst   = false,
                attackPoly        = false,
                ignoreArenaHealth = 0,
                maxArenaLevel     = 0,
                chainArena        = 0,
                observeHealth     = false,
                attackSuicide     = false,
                chainStrict       = false,
                chainSearch       = false,
                doPoly            = false,
                stunnedPoly       = false,
                roguePoly         = false,
                stunnedAttack     = false,
                attackOrderList   = [],
                defaultOrderList  = [],
                typeOrderList     = [],
                done              = false,
                uOrder            = '',
                oType             = '';

            if (!record || !$.isPlainObject(record)) {
                throw "Not passed a record";
            }

            ignoreArenaHealth = config.getItem("ignoreArenaHealth", 200);
            maxArenaLevel = config.getItem("maxArenaLevel", 50);
            killClericFirst = config.getItem("killClericFirst", false);
            attackPoly = config.getItem("attackPoly", false);
            chainArena = config.getItem("chainArena", '160').parseInt();
            observeHealth = config.getItem("observeHealth", true);
            attackSuicide = config.getItem("attackSuicide", false);
            chainStrict = config.getItem("chainStrict", false);
            doPoly = config.getItem("doPoly", false);
            stunnedPoly = config.getItem("stunnedPoly", true);
            roguePoly = config.getItem("roguePoly", true);
            function targetThis(next, type) {
                try {
                    var nDiff   = 0,
                        cDiff   = 0,
                        lvlDif  = 0,
                        higherLevel  = false,
                        lowerLevel = false,
                        knownWin = false,
                        clericMage = false,
                        logic1  = false,
                        logic2  = false,
                        logic3  = false,
                        logic4  = false,
                        logic5  = false,
                        mclass  = '';

                    mclass = next['mclass'];
                    higherLevel = next['level'] > (target[mclass][type]['level'] ? target[mclass][type]['level'] : 0);
                    lowerLevel = next['level'] < (target[mclass][type]['level'] ? target[mclass][type]['level'] : 99999);
                    knownWin = next['won'] && !target[mclass][type]['won'];
                    clericMage = mclass === "Cleric" || mclass === "Mage";
                    logic1 = ((killClericFirst && mclass === "Cleric") || next['healthNum'] > ignoreArenaHealth);
                    logic2 = !doPoly && next['poly'];
                    logic3 = doPoly && stunnedPoly && next['poly'] && record['myStatus'] === 'Stunned';
                    logic4 = doPoly && roguePoly && next['poly'] && record['myClass'] === 'Rogue';
                    logic5 = doPoly && next['poly'] && next['healthNum'] <= 50;
                    if (logic2 || logic3 || logic4 || logic5) {
                        utility.log(2, "Ignoring polymorphed minion " + mclass +  " " + type, record['myStatus'], next);
                        return false;
                    }

                    switch (type) {
                    case "health":
                        if (!logic1) {
                            return false;
                        }

                        break;
                    case "active":
                        if (!(logic1 && next['points'])) {
                            return false;
                        }

                        break;
                    case "suicide":
                        logic2 = next['healthNum'] < (target[mclass][type]['healthNum'] ? target[mclass][type]['healthNum'] : 99999);
                        logic3 = !clericMage && logic1 && next['points'] && logic2;
                        if (logic3) {
                            if (lowerLevel) {
                                target[mclass][type] = next;
                                return true;
                            }

                            return false;
                        } else {
                            return false;
                        }

                        target[mclass][type] = next;
                        break;
                    case "last":
                        logic2 = $.isEmptyObject(target[mclass][type]) && clericMage && next['healthNum'] > 0 && next['healthNum'] <= 30;
                        if (logic2) {
                            target[mclass][type] = next;
                            return true;
                        }

                        logic3 = !clericMage && target[mclass][type]['level'] !== 'Cleric' && target[mclass][type]['level'] !== 'mage';
                        logic4 = logic3 && next['healthNum'] > 200 && next['healthNum'] < (target[mclass][type]['healthNum'] ? target[mclass][type]['healthNum'] : 0);
                        if (logic4) {
                            target[mclass][type] = next;
                            return true;
                        }

                        logic5 = $.isEmptyObject(target[mclass][type]) && logic3 && next['healthNum'] > (target[mclass][type]['healthNum'] ? target[mclass][type]['healthNum'] : 0);
                        if (logic5) {
                            target[mclass][type] = next;
                            return true;
                        } else {
                            return false;
                        }

                        break;
                    case "poly":
                        if (next['poly']) {
                            if (higherLevel) {
                                target[mclass][type] = next;
                                return true;
                            }

                            return false;
                        } else {
                            return false;
                        }

                        break;
                    case "chain":
                        logic2 = chainArena && next['won'] && next['last_ap'] >= chainArena;
                        logic3 = !observeHealth && logic2;
                        logic4 = observeHealth && logic1 && logic2;
                        logic5 = logic3 || logic4;
                        if (logic5) {
                            if (higherLevel) {
                                target[mclass][type] = next;
                            }

                            return true;
                        } else {
                            return false;
                        }

                        break;
                    default:
                    }

                    nDiff = next['level'] - caap.stats['level'];
                    cDiff = target[mclass][type]['level'] ? target[mclass][type]['level'] - caap.stats['level'] : 0 - caap.stats['level'];
                    if (cDiff !== 0) {
                        if (cDiff > 0) {
                            if (nDiff >= 0 && nDiff <= maxArenaLevel && nDiff > cDiff) {
                                utility.log(3, type + ' ' + mclass + " better level match", target[mclass][type]['level'], next['level'], [target[mclass][type], next]);
                                target[mclass][type] = next;
                                return true;
                            }

                            if (nDiff > maxArenaLevel && nDiff < cDiff) {
                                utility.log(3, type + ' ' + mclass + " better level match", target[mclass][type]['level'], next['level'], [target[mclass][type], next]);
                                target[mclass][type] = next;
                                return true;
                            }
                        } else {
                            if (nDiff <= maxArenaLevel && nDiff > cDiff) {
                                utility.log(3, type + ' ' + mclass + " better level match", target[mclass][type]['level'], next['level'], [target[mclass][type], next]);
                                target[mclass][type] = next;
                                return true;
                            }
                        }
                    }

                    return false;
                } catch (e) {
                    utility.warn("targetThis", next);
                    return false;
                }
            }

            for (it = record['minions'].length - 1; it >= 0; it -= 1) {
                var cm = {};

                cm = record['minions'][it];
                if (cm['status'] === 'Stunned') {
                    utility.log(2, "Stunned minion", cm['index'], cm);
                    continue;
                }

                targetThis(cm, 'last');
                targetThis(cm, 'poly');
                if (cm['lost']) {
                    utility.log(2, "Lost minion", cm['index'], cm);
                    targetThis(cm, 'suicide');
                    continue;
                }

                targetThis(cm, 'active');
                targetThis(cm, 'alive');
                targetThis(cm, 'health');
                targetThis(cm, 'chain');
            }

            defaultOrderList = ['Cleric', 'Mage', 'Rogue', 'Warrior'];
            attackOrderList = utility.TextToArray(config.getItem('orderArenaClass', ''));
            if (!attackOrderList || attackOrderList.length === 0) {
                attackOrderList = defaultOrderList.slice();
            }

            utility.log(2, "attackOrderList", attackOrderList);
            typeOrderList = ['chain', 'active', 'health', 'alive', 'last'];
            if (attackSuicide) {
                typeOrderList.splice(3, 0, 'suicide');
            }

            if (attackPoly) {
                typeOrderList.unshift('poly');
            } else {
                typeOrderList.splice(1, 0, 'poly');
            }

            utility.log(2, "typeOrderList", typeOrderList);
            for (it = 0, lenIt = typeOrderList.length; it < lenIt; it += 1) {
                if (done) {
                    break;
                }

                oType = typeOrderList[it];
                utility.log(3, "oType", oType);
                for (ot = 0, lenOt = attackOrderList.length; ot < lenOt; ot += 1) {
                    uOrder = attackOrderList[ot].toString().toLowerCase().ucFirst();
                    utility.log(3, "uOrder", uOrder);
                    if (defaultOrderList.indexOf(uOrder) < 0) {
                        continue;
                    }

                    if (!$.isEmptyObject(target[uOrder][oType])) {
                        minion = target[uOrder][oType];
                        utility.log(3, "done", uOrder, oType);
                        done = true;
                        break;
                    }
                }
            }

            if ($.isEmptyObject(minion)) {
                utility.warn("No target found!");
            } else {
                utility.log(1, "Target " + minion['mclass'] + " " + oType, minion['index'], minion, target);
            }

            return minion;
        } catch (err) {
            utility.error("ERROR in arena.getTargetMinion: " + err, arguments.callee.caller);
            return undefined;
        }
    }
};