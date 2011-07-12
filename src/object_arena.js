
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
                'shout'              : false,
                'shield'             : false,
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
                if (arena.records === 'default' || !$j.isArray(arena.records)) {
                    arena.records = gm.setItem('arena.records', []);
                }

                arena.cleanWins();
                session.setItem("ArenaDashUpdate", true);
                con.log(3, "arena.load", arena.records);
                return true;
            } catch (err) {
                con.error("ERROR in arena.load: " + err);
                return false;
            }
        },

        save: function () {
            try {
                gm.setItem('arena.records', arena.records);
                session.setItem("ArenaDashUpdate", true);
                con.log(3, "arena.save", arena.records);
                return true;
            } catch (err) {
                con.error("ERROR in arena.save: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        getItem: function () {
            try {
                return (arena.records.length ? arena.records[0] : new arena.record().data);
            } catch (err) {
                con.error("ERROR in arena.getItem: " + err);
                return false;
            }
        },

        setItem: function (record) {
            try {
                if (!record || !$j.isPlainObject(record)) {
                    throw "Not passed a record";
                }

                arena.records[0] = record;
                con.log(2, "Updated arena record", record, arena.records);
                arena.save();
                return true;
            } catch (err) {
                con.error("ERROR in arena.setItem: " + err);
                return false;
            }
        },

        deleteItem: function (slot) {
            try {
                var it        = 0,
                    len       = 0,
                    success   = false;

                if (!$u.isNumber(slot) || slot <= 0) {
                    con.warn("slot", slot);
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
                    con.log(3, "Deleted arena record", slot, arena.records);
                    return true;
                } else {
                    con.warn("Unable to delete arena record", slot, arena.records);
                    return false;
                }
            } catch (err) {
                con.error("ERROR in arena.deleteItem: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        clear: function () {
            try {
                con.log(1, "arena.clear");
                arena.records = gm.setItem("arena.records", []);
                state.setItem('staminaArena', 0);
                state.setItem('targetArena', {});
                session.setItem("ArenaDashUpdate", true);
                return true;
            } catch (err) {
                con.error("ERROR in arena.clear: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        setWin: function (records, won) {
            try {
                if (!records || !$j.isArray(records)) {
                    throw "Not passed records";
                }

                if (!won || !$j.isPlainObject(won)) {
                    throw "Not passed a win";
                }

                if (won['userId'] === '' || $u.isNaN(won['userId']) || won['userId'] < 1) {
                    con.warn("userId", won['userId']);
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
                    con.log(3, "Updated records", won, records);
                } else {
                    records.push(won);
                    con.log(3, "Added records", won, records);
                }

                return records;
            } catch (err) {
                con.error("ERROR in arena.setWin: " + err, won, records);
                return false;
            }
        },

        getWin: function (records, userId) {
            try {
                if (!records || !$j.isArray(records)) {
                    throw "Not passed records";
                }

                if (userId === '' || $u.isNaN(userId) || userId < 1) {
                    con.warn("userId", userId);
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
                    con.log(3, "Got win record", userId, records[it]);
                    return records[it];
                } else {
                    con.log(3, "No win record", userId);
                    return false;
                }
            } catch (err) {
                con.error("ERROR in arena.getWin: " + err, userId, records);
                return false;
            }
        },

        delWin: function (records, userId) {
            try {
                if (!records || !$j.isArray(records)) {
                    throw "Not passed records";
                }

                if (userId === '' || $u.isNaN(userId) || userId < 1) {
                    con.warn("userId", userId);
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
                    con.log(2, "Deleted win record", userId, records);
                    return records;
                } else {
                    con.log(3, "Unable to delete win record", userId, records);
                    return false;
                }
            } catch (err) {
                con.error("ERROR in arena.delWin: " + err, userId, records);
                return false;
            }
        },

        setLoss: function (records, userId) {
            try {
                if (!records || !$j.isArray(records)) {
                    throw "Not passed records";
                }

                if (userId === '' || $u.isNaN(userId) || userId < 1) {
                    con.warn("userId", userId);
                    throw "Invalid identifying userId!";
                }

                if (records.hasIndexOf(userId)) {
                    con.log(3, "userId exists", userId, records);
                } else {
                    records.push(userId);
                    con.log(3, "Added userId", userId, records);
                }

                return records;
            } catch (err) {
                con.error("ERROR in arena.setLoss: " + err, userId, records);
                return false;
            }
        },

        checkLoss: function (records, userId) {
            try {
                if (!records || !$j.isArray(records)) {
                    throw "Not passed records";
                }

                if (userId === '' || $u.isNaN(userId) || userId < 1) {
                    con.warn("userId", userId);
                    throw "Invalid identifying userId!";
                }

                if (records.hasIndexOf(userId)) {
                    con.log(3, "userId exists", userId, records);
                    return true;
                } else {
                    con.log(3, "userId not exists", userId, records);
                    return false;
                }
            } catch (err) {
                con.error("ERROR in arena.checkLoss: " + err, userId, records);
                return undefined;
            }
        },

        delLoss: function (records, userId) {
            try {
                if (!records || !$j.isArray(records)) {
                    throw "Not passed records";
                }

                if (userId === '' || $u.isNaN(userId) || userId < 1) {
                    con.warn("userId", userId);
                    throw "Invalid identifying userId!";
                }

                var it = -1;
                it = records.indexOf(userId);
                if (it >= 0) {
                    records.splice(it, 1);
                    con.log(2, "Deleted loss", userId, records);
                    return records;
                } else {
                    con.log(3, "Unable to delete loss", userId, records);
                    return false;
                }
            } catch (err) {
                con.error("ERROR in arena.delLoss: " + err, userId, records);
                return false;
            }
        },

        cleanWins: function () {
            try {
                var arenaInfo = {},
                    it        = 0,
                    len       = 0,
                    found     = false;

                arenaInfo = arena.getItem();
                if (!$j.isEmptyObject(arenaInfo)) {
                    for (it = 0, len = arenaInfo['wins'].length; it < len; it += 1) {
                        if (arenaInfo['losses'].hasIndexOf(arenaInfo['wins'][it]['userId'])) {
                            con.log(1, "Found win in losses: delete", arenaInfo['wins'][it]);
                            arenaInfo['wins'].splice(it, 1);
                            found = true;
                        }
                    }
                } else {
                    con.log(1, "No loss records available", arenaInfo);
                }

                if (found) {
                    arena.setItem(arenaInfo);
                }

                return true;
            } catch (err) {
                con.error("ERROR in arena.cleanWins: " + err);
                return false;
            }
        },

        /*jslint sub: false */

        navigate_to_main: function () {
            return caap.navigateTo('battle,arena', 'tab_arena_on.gif');
        },

        navigate_to_main_refresh: function () {
            var button = caap.checkForImage("tab_arena_on.gif");
            if ($u.hasContent(button)) {
                caap.click(button);
            }

            state.setItem('ArenaRefresh', false);
            return $u.hasContent(button);
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        checkInfo: function () {
            try {
                var tokenSpan   = $j(),
                    timerSpan   = $j(),
                    daysDiv     = $j(),
                    bottomDiv   = $j(),
                    tStr        = '',
                    tStr2       = '',
                    tNum        = 0,
                    arenaInfo   = {};

                arenaInfo = arena.getItem();
                arenaInfo['reviewed'] = Date.now();

                tokenSpan = $j("span[id='" +  caap.domain.id[caap.domain.which] + "guild_token_current_value']");
                tStr = tokenSpan.length ? tokenSpan.text().trim() : '';
                arenaInfo['tokens'] = tStr ? tStr.parseInt() : 0;

                timerSpan = $j("span[id='" +  caap.domain.id[caap.domain.which] + "guild_token_time_value']");
                tStr = timerSpan.length ? timerSpan.text().trim() : '';
                tStr = tStr ? tStr.regex(/(\d+:\d+)/) : '';
                arenaInfo['tokenTime'] = tStr ? tStr : '';

                daysDiv = $j("#" +  caap.domain.id[caap.domain.which] + "arena_banner").children().eq(0).children().eq(0);
                tStr = daysDiv.length ? daysDiv.text().trim() : '';
                arenaInfo['days'] = tStr ? tStr.regex(/(\d+) DAYS/) : 0;

                bottomDiv = $j("div[style *='arena3_home_bottom.jpg']");
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
                con.log(3, "startTime", tNum, tStr);
                if (tStr === 'sec') {
                    arenaInfo['startTime'] = tNum;
                } else if (tStr === 'min') {
                    arenaInfo['startTime'] = tNum * 60;
                }

                arena.setItem(arenaInfo);
                if (arenaInfo['startTime'] && arenaInfo['state'] === 'Ready') {
                    arenaInfo['minions'] = [];
                    con.log(2, "Arena starting in", arenaInfo['startTime']);
                    schedule.setItem("ArenaReview", arenaInfo['startTime'], 20);
                } else if (arenaInfo['nextTime'] && arenaInfo['nextTime'].parseTimer() < 3600 && arenaInfo['state'] === 'Ready') {
                    con.log(2, "Waiting Arena start in", arenaInfo['nextTime']);
                    schedule.setItem("ArenaReview", arenaInfo['nextTime'].parseTimer(), 20);
                } else {
                    if (arenaInfo['tokenTime'] && arenaInfo['tokenTime'].parseTimer() && arenaInfo['state'] === 'Alive') {
                        schedule.setItem("ArenaReview", arenaInfo['tokenTime'].parseTimer(), 20);
                        con.log(2, "Waiting Arena token in", arenaInfo['tokenTime']);
                    } else {
                        schedule.setItem("ArenaReview", gm.getItem('ArenaReviewMins', 5, hiddenVar) * 60, 120);
                        con.log(2, "Waiting 5 mins for Arena review");
                    }
                }

                con.log(3, "arena.checkInfo", arenaInfo);
                return true;
            } catch (err) {
                con.error("ERROR in arena.checkInfo: " + err);
                return false;
            }
        },

        onBattle: function () {
            try {
                var gates         = $j(),
                    tabs          = $j(),
                    health        = $j(),
                    healthGuild   = $j(),
                    healthEnemy   = $j(),
                    bannerDiv     = $j(),
                    collectDiv    = $j(),
                    enterDiv      = $j(),
                    tokenSpan     = $j(),
                    timerSpan     = $j(),
                    resultBody    = $j(),
                    imgDiv        = $j(),
                    myStatsTxt    = '',
                    myStatsArr    = [],
                    index         = 0,
                    currentRecord = {},
                    minions       = [],
                    tStr          = '',
                    tNum          = 0,
                    resultsTxt    = '',
                    lastAttacked  = {},
                    won           = {},
                    losses        = [],
                    wins          = [],
                    notStarted    = '',
                    notArena      = '',
                    battleOver    = '',
                    minionRegEx   = new RegExp("(.*) Level: (\\d+) Class: (.*) Health: (\\d+)/(\\d+) Status: (.*) Arena Activity Points: (\\d+)");

                currentRecord = arena.getItem();
                if (currentRecord['state'] !== 'Alive') {
                    con.log(2, "Test targeting");
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
                if (!$j.isEmptyObject(lastAttacked) && lastAttacked['index'] >= 0 && lastAttacked['index'] < 40) {
                    resultBody = $j("span[class='result_body']");
                    if (resultBody && resultBody.length) {
                        tStr = resultBody.text();
                        tNum = tStr ? tStr.regex(/\+(\d+) Battle Activity Points/) : 0;
                    }

                    imgDiv = $j("img[src*='battle_defeat.gif']");
                    if (imgDiv && imgDiv.length) {
                        if (lastAttacked['poly']) {
                            con.log(1, "Defeated by polymorphed minion", tNum, currentRecord['minions'][lastAttacked['index']]);
                        } else {
                            if (tNum > 50) {
                                currentRecord['minions'][lastAttacked['index']]['lost'] = true;
                                currentRecord['minions'][lastAttacked['index']]['won'] = false;
                                currentRecord['minions'][lastAttacked['index']]['last_ap'] = 0;
                                wins = arena.delWin(currentRecord['wins'], currentRecord['minions'][lastAttacked['index']]['target_id']);
                                currentRecord['wins'] = wins ? wins : currentRecord['wins'];
                                losses = arena.setLoss(currentRecord['losses'], currentRecord['minions'][lastAttacked['index']]['target_id']);
                                currentRecord['losses'] = losses ? losses : currentRecord['losses'];
                                arena.setItem(currentRecord);
                            } else {
                                con.log(1, "You were polymorphed");
                            }

                            con.log(1, "Defeated by minion", tNum, currentRecord['minions'][lastAttacked['index']]);
                        }
                    } else {
                        imgDiv = $j("img[src*='battle_victory.gif']");
                        if (imgDiv && imgDiv.length) {
                            if (lastAttacked['poly']) {
                                con.log(1, "Victory against polymorphed minion", tNum, currentRecord['minions'][lastAttacked['index']]);
                            } else if (imgDiv && imgDiv.length) {
                                currentRecord['minions'][lastAttacked['index']]['lost'] = false;
                                currentRecord['minions'][lastAttacked['index']]['won'] = true;
                                currentRecord['minions'][lastAttacked['index']]['last_ap'] = tNum ? tNum : 160;
                                won = new arena.win();
                                won.data['userId'] = currentRecord['minions'][lastAttacked['index']]['target_id'];
                                won.data['ap'] = currentRecord['minions'][lastAttacked['index']]['last_ap'];
                                wins = arena.setWin(currentRecord['wins'], won.data);
                                currentRecord['wins'] = wins ? wins : currentRecord['wins'];
                                losses = arena.delLoss(currentRecord['losses'], currentRecord['minions'][lastAttacked['index']]['target_id']);
                                currentRecord['losses'] = losses ? losses : currentRecord['losses'];
                                arena.setItem(currentRecord);
                                con.log(1, "Victory against minion", tNum, currentRecord['minions'][lastAttacked['index']]);
                            }
                        } else {
                            resultsTxt = $j("div[class='results']").text();
                            if (resultsTxt.regex(/(You do not have enough battle tokens for this action)/i)) {
                                con.log(1, "You didn't have enough battle tokens");
                            } else if (resultsTxt.regex(/(does not have any health left to battle)/i)) {
                                con.log(1, "Minion had no health left");
                            } else if (resultsTxt.regex(/(You tried to attack but tripped while running)/i)) {
                                con.log(1, "Oops, you tripped");
                            } else {
                                con.log(1, "Unknown win or loss or result");
                            }
                        }
                    }
                }

                bannerDiv = $j("#" +  caap.domain.id[caap.domain.which] + "arena_battle_banner_section");
                myStatsTxt = bannerDiv.text();
                myStatsTxt = myStatsTxt ? myStatsTxt.trim().innerTrim() : '';
                notStarted = myStatsTxt.regex(/(This Battle Has Not Started Yet)/);
                notArena = myStatsTxt.regex(/(You Are Not A Part Of This Arena Battle)/);
                battleOver = myStatsTxt.regex(/(This Arena Battle Is Over)/);
                if (notArena) {
                    return true;
                }

                con.log(3, "myStatsTxt", myStatsTxt);
                if (bannerDiv && bannerDiv.length) {
                    currentRecord['teamHealth'] = 0;
                    currentRecord['enemyHealth'] = 0;
                    if (!notStarted) {
                        gates = $j("div[id*='" +  caap.domain.id[caap.domain.which] + "enemy_guild_member_list_']");
                        if (!gates || !gates.length) {
                            tabs = $j("div[id*='" +  caap.domain.id[caap.domain.which] + "your_arena_tab']");
                            if (!tabs || !tabs.length) {
                                con.warn("No gates found");
                            }
                        } else if (gates && gates.length !== 4) {
                            con.warn("Not enough gates found");
                        } else {
                            gates.each(function (gIndex) {
                                var memberDivs = $j(this).children();
                                if (!memberDivs || !memberDivs.length) {
                                    con.warn("No members found");
                                } else if (memberDivs && memberDivs.length !== 10) {
                                    con.warn("Not enough members found", memberDivs);
                                } else {
                                    memberDivs.each(function (mIndex) {
                                        var member       = $j(this),
                                            memberText   = '',
                                            memberArr    = [],
                                            targetIdDiv  = $j(),
                                            polyImg      = $j(),
                                            shoutImg     = $j(),
                                            shieldImg    = $j(),
                                            nameDiv      = $j(),
                                            loss         = false,
                                            memberRecord = new arena.minion().data;

                                        memberRecord['index'] = index;
                                        targetIdDiv = member.find("input[name='target_id']").eq(0);
                                        if (targetIdDiv && targetIdDiv.length) {
                                            memberRecord['target_id'] = targetIdDiv.attr("value") ? targetIdDiv.attr("value").parseInt() : 0;
                                            won = arena.getWin(currentRecord['wins'], memberRecord['target_id']);
                                            if ($j.isPlainObject(won)) {
                                                memberRecord['won'] = true;
                                                memberRecord['last_ap'] = won['ap'] ? won['ap'] : 0;
                                            }

                                            loss = arena.checkLoss(currentRecord['losses'], memberRecord['target_id']);
                                            if ($u.isBoolean(loss)) {
                                                memberRecord['lost'] = loss;
                                            }
                                        } else {
                                            con.warn("Unable to find target_id for minion!", member);
                                        }

                                        memberRecord['attacking_position'] = (gIndex + 1);
                                        memberText = member.children().eq(1).text();
                                        memberText = memberText ? memberText.trim().innerTrim() : '';
                                        con.log(3, "memberText", memberText);
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
                                            con.warn("Minion match issue!", memberArr);
                                        }

                                        if (currentRecord['minions'] && currentRecord['minions'].length === 40) {
                                            if (currentRecord['minions'][index]['index'] === index) {
                                                memberRecord['lost'] = currentRecord['minions'][index]['lost'] ? currentRecord['minions'][index]['lost'] : false;
                                                memberRecord['last_ap'] = currentRecord['minions'][index]['last_ap'] ? currentRecord['minions'][index]['last_ap'] : 0;
                                            } else {
                                                con.warn("Minion index issue!", index, currentRecord['minions'][index], memberRecord);
                                            }
                                        }

                                        nameDiv = member.find("div[style='font-size: 19px; padding-bottom: 3px;'], div[style='font-size:19px; padding-bottom:3px;']");
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
                                            con.log(3, "poly", memberRecord);
                                        }

                                        shoutImg = member.find("img[src*='warrior_effect_shout']");
                                        memberRecord['shout'] = (shoutImg && shoutImg.length) ? true : false;
                                        if (memberRecord['shout']) {
                                            con.log(2, "shout", memberRecord);
                                        }

                                        shieldImg = member.find("img[src*='mage_effect_shield']");
                                        memberRecord['shield'] = (shieldImg && shieldImg.length) ? true : false;
                                        if (memberRecord['shield']) {
                                            con.log(2, "shield", memberRecord);
                                        }

                                        index = minions.push(memberRecord);
                                    });
                                }
                            });
                        }
                    }

                    collectDiv = $j("input[src*='arena3_collectbutton.gif']");
                    enterDiv = $j("input[src*='guild_enter_battle_button.gif']");
                    if (currentRecord['ticker'] && !notStarted && !battleOver && !collectDiv.length  && !enterDiv.length) {
                        currentRecord['state'] = 'Alive';
                        tStr = $j("span[id='" +  caap.domain.id[caap.domain.which] + "monsterTicker']").text();
                        currentRecord['ticker'] = tStr ? tStr.trim() : '';
                        if (myStatsTxt) {
                            con.log(3, "myStatsTxt", myStatsTxt);
                            myStatsArr = myStatsTxt.match(new RegExp("(.+) Level: (\\d+) Class: (.+) Health: (\\d+)/(\\d+).+Status: (.+) Arena Activity Points: (\\d+)"));
                            if (myStatsArr && myStatsArr.length === 8) {
                                con.log(3, "myStatsArr", myStatsArr);
                                currentRecord['damage'] = myStatsArr[7] ? myStatsArr[7].parseInt() : 0;
                                currentRecord['myStatus'] = myStatsArr[6] ? myStatsArr[6].trim() : '';
                                currentRecord['myClass'] = myStatsArr[3] ? myStatsArr[3].trim() : '';
                            } else {
                                con.warn("myStatsArr error", myStatsArr, myStatsTxt);
                            }
                        }

                        tokenSpan = $j("span[id='" +  caap.domain.id[caap.domain.which] + "guild_token_current_value']");
                        tStr = tokenSpan.length ? tokenSpan.text().trim() : '';
                        currentRecord['tokens'] = tStr ? tStr.parseInt() : 0;

                        timerSpan = $j("span[id='" +  caap.domain.id[caap.domain.which] + "guild_token_time_value']");
                        tStr = timerSpan.length ? timerSpan.text().trim() : '';
                        currentRecord['tokenTime'] = tStr ? tStr.regex(/(\d+:\d+)/) : '0:00';

                        health = $j("#" +  caap.domain.id[caap.domain.which] + "guild_battle_health");
                        if (health && health.length) {
                            healthEnemy = health.find("div[style*='guild_battle_bar_enemy.gif']").eq(0);
                            if (healthEnemy && healthEnemy.length) {
                                currentRecord['enemyHealth'] = (100 - healthEnemy.getPercent('width')).dp(2);
                            } else {
                                con.warn("guild_battle_bar_enemy.gif not found");
                            }

                            healthGuild = health.find("div[style*='guild_battle_bar_you.gif']").eq(0);
                            if (healthGuild && healthGuild.length) {
                                currentRecord['teamHealth'] = (100 - healthGuild.getPercent('width')).dp(2);
                            } else {
                                con.warn("guild_battle_bar_you.gif not found");
                            }
                        } else {
                            con.warn("guild_battle_health error");
                        }
                    } else {
                        if (collectDiv && collectDiv.length) {
                            con.log(1, "Battle ready to collect");
                            currentRecord['state'] = 'Collect';
                        } else if (!enterDiv.length && currentRecord['state'] !== 'Ready') {
                            con.log(1, "Battle is completed");
                            currentRecord['state'] = 'Completed';
                        } else {
                            con.log(1, "Battle is ready to join");
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

                    currentRecord['reviewed'] = Date.now();
                    con.log(3, "currentRecord", currentRecord);
                    arena.setItem(currentRecord);
                    if (currentRecord['state'] === 'Collect' && collectDiv.length) {
                        caap.click(collectDiv);
                    }
                } else {
                    con.warn("Not on arena battle page");
                }

                return true;
            } catch (err) {
                con.error("ERROR in arena.onBattle: " + err);
                return false;
            }
        },

        clearMinions: function () {
            try {
                var currentRecord = {};
                currentRecord = arena.getItem();
                currentRecord['minions'] = [];
                arena.setItem(currentRecord);
                return true;
            } catch (err) {
                con.error("ERROR in arena.clearMinions: " + err);
                return false;
            }
        },

        getMinion: function (index) {
            try {
                var arenaInfo = {},
                    minion    = {};

                if (index === '' || $u.isNaN(index) || index < 0 || index > 40) {
                    con.warn("index", index);
                    throw "Invalid identifying index!";
                }

                arenaInfo = arena.getItem();
                if (!$j.isEmptyObject(arenaInfo) && arenaInfo['minions'] && arenaInfo['minions'].length === 40) {
                    minion = arenaInfo['minions'][index];
                } else {
                    con.log(1, "No minion records available", arenaInfo);
                }

                return minion;
            } catch (err) {
                con.error("ERROR in arena.getTarget: " + err);
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
                            'shout'   : {},
                            'chain'   : {}
                        },
                        'Mage' : {
                            'last'    : {},
                            'suicide' : {},
                            'active'  : {},
                            'alive'   : {},
                            'health'  : {},
                            'poly'    : {},
                            'shout'   : {},
                            'chain'   : {}
                        },
                        'Rogue' : {
                            'last'    : {},
                            'suicide' : {},
                            'active'  : {},
                            'alive'   : {},
                            'health'  : {},
                            'poly'    : {},
                            'shout'   : {},
                            'chain'   : {}
                        },
                        'Warrior' : {
                            'last'    : {},
                            'suicide' : {},
                            'active'  : {},
                            'alive'   : {},
                            'health'  : {},
                            'poly'    : {},
                            'shout'   : {},
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
                    doPoly            = false,
                    stunnedPoly       = false,
                    roguePoly         = false,
                    attackOrderList   = [],
                    defaultOrderList  = [],
                    typeOrderList     = [],
                    done              = false,
                    uOrder            = '',
                    oType             = '';

                if (!record || !$j.isPlainObject(record)) {
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
                            higherLevel  = false,
                            lowerLevel = false,
                            knownWin = false,
                            clericMage = false,
                            shieldShout = false,
                            ignorePoly = false,
                            logic1  = false,
                            logic2  = false,
                            logic3  = false,
                            logic4  = false,
                            logic5  = false,
                            mclass  = '';

                        mclass = next['mclass'];
                        higherLevel = next['level'] > (target[mclass][type]['level'] ? target[mclass][type]['level'] : 0);
                        lowerLevel = next['level'] < (target[mclass][type]['level'] ? target[mclass][type]['level'] : 99999);
                        knownWin = next['won'] && !(target[mclass][type]['won'] ? target[mclass][type]['won'] : false);
                        clericMage = mclass === "Cleric" || mclass === "Mage";
                        shieldShout = next['shield'] || next['shout'];
                        logic1 = ((killClericFirst && mclass === "Cleric") || next['healthNum'] > ignoreArenaHealth);
                        logic2 = !doPoly && next['poly'];
                        logic3 = doPoly && stunnedPoly && next['poly'] && record['myStatus'] === 'Stunned';
                        logic4 = doPoly && roguePoly && next['poly'] && record['myClass'] !== 'Rogue';
                        logic5 = doPoly && next['poly'] && next['healthNum'] <= 50;
                        ignorePoly = logic2 || logic3 || logic4 || logic5;

                        switch (type) {
                        case "health":
                            if (ignorePoly) {
                                con.log(2, "Ignoring polymorphed minion " + mclass + " " + type, record['myStatus'], next);
                                return false;
                            }

                            if (!(logic1 && !shieldShout)) {
                                return false;
                            }

                            break;
                        case "active":
                            if (ignorePoly) {
                                con.log(2, "Ignoring polymorphed minion " + mclass + " " + type, record['myStatus'], next);
                                return false;
                            }

                            if (!(logic1 && next['points'] && !shieldShout)) {
                                return false;
                            }

                            break;
                        case "suicide":
                            logic2 = next['healthNum'] < (target[mclass][type]['healthNum'] ? target[mclass][type]['healthNum'] : 99999);
                            logic3 = !clericMage && logic1 && next['points'] && logic2;
                            if (logic3 && !shieldShout && lowerLevel) {
                                target[mclass][type] = next;
                                return true;
                            } else {
                                return false;
                            }

                            break;
                        case "last":
                            logic2 = $j.isEmptyObject(target[mclass][type]) && clericMage && next['healthNum'] > 0 && next['healthNum'] <= 30;
                            if (logic2 && !shieldShout) {
                                target[mclass][type] = next;
                                return true;
                            }

                            logic3 = !clericMage && target[mclass][type]['mclass'] !== 'Cleric' && (target[mclass][type]['mclass'] ? target[mclass][type]['mclass'] : 'none') !== 'mage';
                            logic4 = logic3 && next['healthNum'] > 200 && next['healthNum'] < (target[mclass][type]['healthNum'] ? target[mclass][type]['healthNum'] : 0);
                            if (logic4 && !shieldShout && lowerLevel) {
                                target[mclass][type] = next;
                                return true;
                            }

                            logic5 = $j.isEmptyObject(target[mclass][type]) && logic3 && next['healthNum'] > (target[mclass][type]['healthNum'] ? target[mclass][type]['healthNum'] : 0);
                            if (logic5 && !shieldShout) {
                                target[mclass][type] = next;
                                return true;
                            } else {
                                return false;
                            }

                            break;
                        case "poly":
                            if (ignorePoly) {
                                con.log(2, "Ignoring polymorphed minion " + mclass + " " + type, record['myStatus'], next);
                                return false;
                            }

                            if (next['poly'] && (shieldShout || higherLevel)) {
                                target[mclass][type] = next;
                                return true;
                            } else {
                                return false;
                            }

                            break;
                        case "chain":
                            logic2 = chainArena && next['won'] && next['last_ap'] >= chainArena;
                            logic3 = !observeHealth && logic2;
                            logic4 = observeHealth && logic1 && logic2;
                            logic5 = logic3 || logic4;

                            if (logic5 && higherLevel && next['last_ap'] >= (target[mclass][type]['last_ap'] ? target[mclass][type]['last_ap'] : 0)) {
                                target[mclass][type] = next;
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
                                    con.log(3, type + ' ' + mclass + " better level match", target[mclass][type]['level'], next['level'], [target[mclass][type], next]);
                                    target[mclass][type] = next;
                                    return true;
                                }

                                if (nDiff > maxArenaLevel && nDiff < cDiff) {
                                    con.log(3, type + ' ' + mclass + " better level match", target[mclass][type]['level'], next['level'], [target[mclass][type], next]);
                                    target[mclass][type] = next;
                                    return true;
                                }
                            } else {
                                if (nDiff <= maxArenaLevel && nDiff > cDiff) {
                                    con.log(3, type + ' ' + mclass + " better level match", target[mclass][type]['level'], next['level'], [target[mclass][type], next]);
                                    target[mclass][type] = next;
                                    return true;
                                }
                            }
                        }

                        return false;
                    } catch (e) {
                        con.warn("targetThis", next);
                        return false;
                    }
                }

                for (it = record['minions'].length - 1; it >= 0; it -= 1) {
                    var cm = {};

                    cm = record['minions'][it];
                    if (cm['status'] === 'Stunned' && cm['healthNum'] <= 0) {
                        con.log(2, "Stunned minion", cm['index'], cm);
                        continue;
                    }

                    targetThis(cm, 'last');
                    targetThis(cm, 'poly');
                    if (cm['lost']) {
                        con.log(2, "Lost minion", cm['index'], cm);
                        targetThis(cm, 'suicide');
                        continue;
                    }

                    targetThis(cm, 'active');
                    targetThis(cm, 'alive');
                    targetThis(cm, 'health');
                    targetThis(cm, 'chain');
                }

                defaultOrderList = ['Cleric', 'Mage', 'Rogue', 'Warrior'];
                attackOrderList = config.getList('orderArenaClass', '');
                if (!attackOrderList || attackOrderList.length === 0) {
                    attackOrderList = defaultOrderList.slice();
                }

                con.log(3, "attackOrderList", attackOrderList);
                typeOrderList = ['chain', 'active', 'health', 'alive', 'last'];
                if (attackSuicide) {
                    typeOrderList.splice(3, 0, 'suicide');
                }

                if (attackPoly) {
                    typeOrderList.unshift('poly');
                } else {
                    typeOrderList.splice(1, 0, 'poly');
                }

                con.log(3, "typeOrderList", typeOrderList);
                for (it = 0, lenIt = typeOrderList.length; it < lenIt; it += 1) {
                    if (done) {
                        break;
                    }

                    oType = typeOrderList[it];
                    con.log(3, "oType", oType);
                    for (ot = 0, lenOt = attackOrderList.length; ot < lenOt; ot += 1) {
                        uOrder = attackOrderList[ot].toString().toLowerCase().ucFirst();
                        con.log(3, "uOrder", uOrder);
                        if (!defaultOrderList.hasIndexOf(uOrder)) {
                            continue;
                        }

                        if (!$j.isEmptyObject(target[uOrder][oType])) {
                            minion = target[uOrder][oType];
                            con.log(3, "done", uOrder, oType);
                            done = true;
                            break;
                        }
                    }
                }

                if ($j.isEmptyObject(minion)) {
                    con.warn("No target found!");
                } else {
                    con.log(1, "Target " + minion['mclass'] + " " + oType, minion['index'], minion, target);
                }

                return minion;
            } catch (err) {
                con.error("ERROR in arena.getTargetMinion: " + err);
                return undefined;
            }
        },

        menu: function () {
            try {
                var mbattleList = [
                        'Tokens Available',
                        'Never'
                    ],
                    mbattleInst = [
                        'Tokens Available will attack whenever you have enough tokens',
                        'Never - disables attacking in Arena'
                    ],
                    chainList = [
                        '0',
                        '160',
                        '200',
                        '240'
                    ],
                    chainListInst = [
                        'Disabled',
                        'Chain 160 and above',
                        'Chain 200 and above',
                        'Chain 240 and above'
                    ],
                    htmlCode = '';

                htmlCode += caap.startToggle('Arena', 'ARENA');
                htmlCode += caap.makeDropDownTR("Attack When", 'WhenArena', mbattleList, mbattleInst, '', 'Never', false, false, 62);
                htmlCode += caap.startDropHide('WhenArena', '', 'Never', true);
                htmlCode += caap.makeTD("Attack Classes in this order");
                htmlCode += caap.makeTextBox('orderArenaClass', 'Attack Arena class in this order. Uses the class name.', 'Cleric,Mage,Rogue,Warrior', '');
                htmlCode += caap.makeNumberFormTR("Ignore Health &lt;=", 'ignoreArenaHealth', "Ignore enemies with health equal to or below this level.", 200, '', '');
                htmlCode += caap.makeNumberFormTR("Ignore Level Plus &gt;=", 'maxArenaLevel', "This value is added the the value of your current level and enemies with a level above this value are ignored", 50, '', '');
                htmlCode += caap.makeCheckTR("Stun All Clerics", 'killClericFirst', false, "Attack Clerics that are not stunned.");
                htmlCode += caap.makeCheckTR("Do Polymorphed", 'doPoly', true, "Attack polymorphed players.");
                htmlCode += caap.startCheckHide('doPoly');
                htmlCode += caap.makeCheckTR("Priority Polymorphed", 'attackPoly', false, "Attack polymorphed players first.", true);
                htmlCode += caap.makeCheckTR("Attack Polymorphed If Rogue", 'roguePoly', true, "Only attack polymorphed players if you are class Rogue.", true);
                htmlCode += caap.makeCheckTR("Stunned Ignore Polymorphed", 'stunnedPoly', true, "If you are stunned then Do not attack polymorphed minions, leave them for someone who can do more damage.", true);
                htmlCode += caap.endCheckHide('doPoly');
                htmlCode += caap.makeCheckTR("Suicide", 'attackSuicide', false, "When out of targets, attack active Rogues or Warriors to which you lost previously, before any class that's not stunned.");
                htmlCode += caap.makeDropDownTR("Chain", 'chainArena', chainList, chainListInst, '', '160', false, false, 35);
                htmlCode += caap.startDropHide('chainArena', '', '0', true);
                htmlCode += caap.makeCheckTR("Chain Observe Health", 'observeHealth', true, "When chaining, observe the 'Ignore Health' and 'Stun All Clerics' options.");
                htmlCode += caap.endDropHide('chainArena');
                htmlCode += caap.endDropHide('WhenArena');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                con.error("ERROR in arena.menu: " + err);
                return '';
            }
        },

        AddArenaDashboard: function () {
            try {
                if (config.getItem('DBDisplay', '') === 'Arena' && session.getItem("ArenaDashUpdate", true)) {
                    var html    = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>",
                        headers = ['Arena', 'Damage', 'Team%',      'Enemy%',      'My Status', 'TimeLeft', 'Status'],
                        values  = ['damage', 'teamHealth', 'enemyHealth', 'myStatus',  'ticker',   'state'];
                        pp      = 0,
                        i       = 0,
                        len     = 0,
                        data    = {},
                        color   = '',
                        handler = null;

                    for (pp = 0; pp < headers.length; pp += 1) {
                        html += caap.makeTh({text: headers[pp], color: '', id: '', title: '', width: ''});
                    }

                    html += '</tr>';
                    for (i = 0, len = arena.records.length; i < len; i += 1) {
                        html += "<tr>";
                        data = {
                            text  : '<span id="caap_arena_1" title="Clicking this link will take you to the Arena" rlink="arena.php" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">Arena</span>',
                            color : 'blue',
                            id    : '',
                            title : ''
                        };

                        html += caap.makeTd(data);
                        color = arena.records[i]['state'] === 'Alive' ? 'green' : $u.bestTextColor(config.getItem("StyleBackgroundLight", "#E0C961"));
                        color = arena.records[i]['state'] === 'Alive' && arena.records[i]['enemyHealth'] === arena.records[i]['teamHealth'] ? 'purple' : color;
                        color = arena.records[i]['enemyHealth'] > arena.records[i]['teamHealth'] ? 'red' : color;
                        for (pp = 0; pp < values.length; pp += 1) {
                            if (values[pp] === 'ticker') {
                                html += caap.makeTd({text: $u.hasContent(arena.records[i][values[pp]]) ? arena.records[i][values[pp]].regex(/(\d+:\d+):\d+/) : '', color: color, id: '', title: ''});
                            } else {
                                html += caap.makeTd({
                                    text  : $u.hasContent(arena.records[i][values[pp]]) && ($u.isString(arena.records[i][values[pp]]) || arena.records[i][values[pp]] > 0) ? arena.records[i][values[pp]] : '',
                                    color : color,
                                    id    : '',
                                    title : ''
                                });
                            }
                        }

                        html += '</tr>';
                    }

                    html += '</table>';
                    $j("#caap_arena", caap.caapTopObject).html(html);

                    handler = function (e) {
                        var visitMonsterLink = {
                                mname     : '',
                                arlink    : ''
                            },
                            i   = 0,
                            len = 0;

                        for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                            if (e.target.attributes[i].nodeName === 'mname') {
                                visitMonsterLink.mname = e.target.attributes[i].nodeValue;
                            } else if (e.target.attributes[i].nodeName === 'rlink') {
                                visitMonsterLink.arlink = e.target.attributes[i].nodeValue;
                            }
                        }

                        caap.clickAjaxLinkSend(visitMonsterLink.arlink);
                    };

                    $j("span[id='caap_arena_1']", caap.caapTopObject).unbind('click', handler).click(handler);

                    session.setItem("ArenaDashUpdate", false);
                }

                return true;
            } catch (err) {
                con.error("ERROR in arena.AddArenaDashboard: " + err);
                return false;
            }
        },

        engageListener: function (event) {
            con.log(4, "engage arena_battle.php");
            caap.setDomWaiting("arena_battle.php");
        },


        dualListener: function (event) {
            var index  = -1,
                minion = {};

            con.log(4, "engage arena_battle.php", event.target.id);
            index = event.target.id ? event.target.id.parseInt() : -1;
            minion = arena.getMinion(index);
            minion = !$j.isEmptyObject(minion) ? minion : {};
            state.setItem('ArenaMinionAttacked', minion);
            caap.setDomWaiting("arena_battle.php");
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        checkResults_arena: function () {
            try {
                caap.globalContainer.find("input[src*='battle_enter_battle']").bind('click', arena.engageListener);
                arena.checkInfo();
                return true;
            } catch (err) {
                con.error("ERROR in arena.checkResults_arena: " + err);
                return false;
            }
        },

        checkResults_arena_battle: function () {
            try {
                caap.globalContainer.find("input[src*='monster_duel_button']").each(function (index) {
                    $j(this).attr("id", index).bind('click', arena.dualListener);
                });

                arena.onBattle();
                return true;
            } catch (err) {
                con.error("ERROR in arena.checkResults_arena_battle: " + err);
                return false;
            }
        },

        review: function () {
            try {
                /*-------------------------------------------------------------------------------------\
                We do Arena review once an hour.  Some routines may reset this timer to drive
                ArenaReview immediately.
                \-------------------------------------------------------------------------------------*/
                if (!schedule.check("ArenaReview") || config.getItem('WhenArena', 'Never') === 'Never') {
                    return false;
                }

                if (state.getItem('ArenaRefresh', true)) {
                    if (arena.navigate_to_main_refresh()) {
                        return true;
                    }
                }

                if (!state.getItem('ArenaReview', false)) {
                    if (arena.navigate_to_main()) {
                        return true;
                    }

                    state.setItem('ArenaReview', true);
                }

                state.setItem('ArenaRefresh', true);
                state.setItem('ArenaReview', false);
                con.log(1, 'Done with Arena review.');
                return false;
            } catch (err) {
                con.error("ERROR in arena.Review: " + err);
                return false;
            }
        },

        arena: function () {
            try {
                var when    = '',
                    record  = {},
                    minion  = {},
                    form    = $j(),
                    key     = $j(),
                    enterButton = $j(),
                    nextTime = '',
                    tokenTimer = 0;

                when = config.getItem("WhenArena", 'Never');
                if (when === 'Never') {
                    return false;
                }

                record = arena.getItem();
                nextTime = (record['reviewed'] && record['nextTime']) ? "Next Arena: " + $u.makeTime(record['reviewed'] + (record['nextTime'].parseTimer() * 1000), caap.timeStr(true)) : '';
                nextTime = record['startTime'] ? "Next Arena: " + record['startTime'] + " seconds" : nextTime;
                tokenTimer = (record['reviewed'] && record['tokenTime'] && record['state'] === 'Alive') ? ((record['reviewed'] + (record['tokenTime'].parseTimer() * 1000)) - Date.now()) / 1000 : -1;
                tokenTimer = tokenTimer >= 0 ? tokenTimer.dp() : 0;
                nextTime = (tokenTimer >= 0 && record['state'] === 'Alive') ? "Next Token in: " + tokenTimer + ' seconds': nextTime;
                caap.setDivContent('arena_mess', nextTime);
                if (!record || !$j.isPlainObject(record) || $j.isEmptyObject(record) || state.getItem('ArenaJoined', false)) {
                    if (state.getItem('ArenaRefresh', true)) {
                        if (arena.navigate_to_main_refresh()) {
                            return true;
                        }
                    }

                    if (!state.getItem('ArenaReview', false)) {
                        if (arena.navigate_to_main()) {
                            return true;
                        }

                        state.setItem('ArenaReview', true);
                    }

                    state.setItem('ArenaRefresh', true);
                    state.setItem('ArenaReview', false);
                    state.setItem('ArenaJoined', false);
                    return false;
                }

                if (/*!record['days'] || */record['tokens'] <= 0 || (record['ticker'].parseTimer() <= 0 && record['state'] === "Ready") || (caap.stats['stamina']['num'] < 20 && record['state'] === "Ready")) {
                    return false;
                }

                caap.setDivContent('arena_mess', "Entering Arena");
                if (general.Select('ArenaGeneral')) {
                    return true;
                }

                if (!$j("#" + caap.domain.id[caap.domain.which] + "arena_battle_banner_section").length) {
                    if (state.getItem('ArenaRefresh', true)) {
                        if (arena.navigate_to_main_refresh()) {
                            return true;
                        }
                    }

                    if (!state.getItem('ArenaReview', false)) {
                        if (arena.navigate_to_main()) {
                            return true;
                        }

                        state.setItem('ArenaReview', true);
                    }

                    state.setItem('ArenaRefresh', true);
                    state.setItem('ArenaReview', false);
                    enterButton = $j("input[src*='battle_enter_battle.gif']");
                    con.log(1, "Enter battle", record, enterButton);
                    if (record['tokens'] > 0 && enterButton && enterButton.length) {
                        arena.clearMinions();
                        caap.click(enterButton);
                        return true;
                    }
                }

                enterButton = $j("input[src*='guild_enter_battle_button.gif']");
                if (enterButton && enterButton.length) {
                    con.log(1, "Joining battle", caap.stats['stamina']['num'], record, enterButton);
                    if (caap.stats['stamina']['num'] >= 20 && record['tokens'] > 0) {
                        state.setItem('ArenaJoined', true);
                        caap.click(enterButton);
                        return true;
                    }

                    return false;
                }

                if (record['state'] !== "Alive") {
                    return false;
                }

                minion = arena.getTargetMinion(record);
                if (minion && $j.isPlainObject(minion) && !$j.isEmptyObject(minion)) {
                    con.log(2, "Fighting target_id (" + minion['target_id'] + ") Name: " + minion['name']);
                    caap.setDivContent('arena_mess', "Fighting (" + minion['target_id'] + ") " + minion['name']);
                    key = $j("#" + caap.domain.id[caap.domain.which] + "attack_key_" + minion['target_id']);
                    if (key && key.length) {
                        form = key.parents("form").eq(0);
                        if (form && form.length) {
                            state.setItem('ArenaMinionAttacked', minion);
                            caap.click(form.find("input[src*='guild_duel_button2.gif'],input[src*='monster_duel_button.gif']"));
                            return true;
                        }
                    }
                }

                return false;
            } catch (err) {
                con.error("ERROR in arena.arena: " + err);
                return false;
            }
        },

        index: function () {
            try {
                var tokenSpan = $j(),
                    tStr      = '',
                    arenaInfo = {};

                $j("div[style*='arena3_newsfeed']").unbind('click', arena.engageListener).bind('click', caap.arenaEngageListener);
                tokenSpan = $j("span[id='" + caap.domain.id[caap.domain.which] + "arena_token_current_value']");
                if (tokenSpan && tokenSpan.length) {
                    tStr = tokenSpan.length ? tokenSpan.text().trim() : '';
                    arenaInfo = arena.getItem();
                    arenaInfo['tokens'] = tStr ? tStr.parseInt() : 0;
                    if (arenaInfo['tokens'] === 10) {
                        arenaInfo['tokenTime'] = '';
                    }

                    arena.setItem(arenaInfo);
                    con.log(4, 'arenaInfo', arenaInfo);
                }
                return false;
            } catch (err) {
                con.error("ERROR in arena.index: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        addListeners: function () {
            try {
                $j("input[src*='battle_enter_battle']", caap.globalContainer).bind('click', arena.engageListener);
                $j("div[style*='arena3_newsfeed']", caap.globalContainer).bind('click', arena.engageListener);
                $j("input[src*='monster_duel_button']", caap.globalContainer).each(function (index) {
                    $j(this).attr("id", index).bind('click', arena.dualListener);
                });

                return true;
            } catch (err) {
                con.error("ERROR in arena.addListeners: " + err);
                return false;
            }
        }
    };
