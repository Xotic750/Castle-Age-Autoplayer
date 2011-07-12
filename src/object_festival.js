
    ////////////////////////////////////////////////////////////////////
    //                          festival OBJECT
    // this is the main object for dealing with festival battles
    /////////////////////////////////////////////////////////////////////

    festival = {
        records: [],

        record: function () {
            this.data = {
                'reviewed'    : 0,
                'days'        : 0,
                'tokens'      : 0,
                'tokenTime'   : 0,
                'collect'     : false,
                'startTime'   : 0,
                'ticker'      : '',
                'endTime'     : 0,
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
                festival.records = gm.getItem('festival.records', 'default');
                if (festival.records === 'default' || !$j.isArray(festival.records)) {
                    festival.records = gm.setItem('festival.records', []);
                }

                festival.cleanWins();
                session.setItem("FestivalDashUpdate", true);
                con.log(3, "festival.load", festival.records);
                return true;
            } catch (err) {
                con.error("ERROR in festival.load: " + err);
                return false;
            }
        },

        save: function (src) {
            try {
                if (caap.domain.which === 3) {
                    caap.messaging.setItem('festival.records', festival.records);
                } else {
                    gm.setItem('festival.records', festival.records);
                    con.log(3, "festival.save", festival.records);
                    if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif") && src !== "caapif") {
                        con.log(2, "festival.save send");
                        caap.messaging.setItem('festival.records', festival.records);
                    }
                }

                if (caap.domain.which !== 0) {
                    session.setItem("FestivalDashUpdate", true);
                }

                return true;
            } catch (err) {
                con.error("ERROR in festival.save: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        getItem: function () {
            try {
                return (festival.records.length ? festival.records[0] : new festival.record().data);
            } catch (err) {
                con.error("ERROR in festival.getItem: " + err);
                return false;
            }
        },

        setItem: function (record) {
            try {
                if (!record || !$j.isPlainObject(record)) {
                    throw "Not passed a record";
                }

                festival.records[0] = record;
                con.log(2, "Updated festival record", record, festival.records);
                festival.save();
                return record;
            } catch (err) {
                con.error("ERROR in festival.setItem: " + err);
                return undefined;
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

                for (it = 0, len = festival.records.length; it < len; it += 1) {
                    if (festival.records[it]['slot'] === slot) {
                        success = true;
                        break;
                    }
                }

                if (success) {
                    festival.records.splice(it, 1);
                    festival.save();
                    con.log(3, "Deleted festival record", slot, festival.records);
                    return true;
                } else {
                    con.warn("Unable to delete festival record", slot, festival.records);
                    return false;
                }
            } catch (err) {
                con.error("ERROR in festival.deleteItem: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        clear: function () {
            try {
                con.log(1, "festival.clear");
                festival.records = [];
                festival.save();
                state.setItem('staminaFestival', 0);
                state.setItem('targetFestival', {});
                session.setItem("FestivalDashUpdate", true);
                return true;
            } catch (err) {
                con.error("ERROR in festival.clear: " + err);
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
                con.error("ERROR in festival.setWin: " + err, won, records);
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
                con.error("ERROR in festival.getWin: " + err, userId, records);
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
                con.error("ERROR in festival.delWin: " + err, userId, records);
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
                con.error("ERROR in festival.setLoss: " + err, userId, records);
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
                con.error("ERROR in festival.checkLoss: " + err, userId, records);
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
                con.error("ERROR in festival.delLoss: " + err, userId, records);
                return false;
            }
        },

        cleanWins: function () {
            try {
                var festivalInfo = festival.getItem(),
                    it           = 0,
                    len          = 0,
                    found        = false;

                if (!$j.isEmptyObject(festivalInfo)) {
                    for (it = 0, len = festivalInfo['wins'].length; it < len; it += 1) {
                        if (festivalInfo['losses'].hasIndexOf(festivalInfo['wins'][it]['userId'])) {
                            con.log(1, "Found win in losses: delete", festivalInfo['wins'][it]);
                            festivalInfo['wins'].splice(it, 1);
                            found = true;
                        }
                    }
                } else {
                    con.log(1, "No loss records available", festivalInfo);
                }

                if (found) {
                    festival.setItem(festivalInfo);
                }

                return true;
            } catch (err) {
                con.error("ERROR in festival.cleanWins: " + err);
                return false;
            }
        },

        /*jslint sub: false */

        navigate_to_main: function () {
            return caap.navigateTo('soldiers,tab_festival_off.jpg,festival_battle_home', 'arena3_rewardsbutton.gif');
        },

        navigate_to_main_refresh: function () {
            state.setItem('FestivalRefresh', false);
            return caap.navigateTo('soldiers,tab_festival_off.jpg,festival_battle_home');
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        checkInfo: function () {
            try {
                var infoDiv      = $j("#current_battle_info", caap.appBodyDiv),
                    now          = new Date(),
                    tDate        = new Date(),
                    next         = $u.setContent(infoDiv.children().eq(0).children().eq(0).text(), '').trim().innerTrim(),
                    timer        = $u.setContent(infoDiv.children().eq(1).children().eq(0).text(), '').trim().innerTrim(),
                    tz           = $u.setContent(timer.regex(/UTC ([\-+]*?\d+);/), 0),
                    ampm         = $u.setContent(timer.regex(/\d+:\d+ (AM|PM)/), 'AM'),
                    hour         = $u.setContent(timer.regex(/(\d+):\d+/), 0),
                    festivalInfo = festival.getItem(),
                    start        = 0;

                hour = ampm === 'AM' && hour === 12 ? 0 : (ampm === 'PM' ? hour + 12 : hour);
                hour = tz === 0 ? hour : hour - tz;
                hour = hour < 0 ? hour + 24 : (hour > 24 ? hour - 24 : hour);
                tDate.setUTCHours(hour, 0, 0, 0);
                tDate.setUTCDate(tDate.getDate() + (tDate < now ? 1 : 0));
                festivalInfo['reviewed'] = now.getTime();
                con.log(2, "festival.checkInfo", next, timer, hour, tz);
                con.log(2, "When", tDate.toUTCString());

                if (festivalInfo['endTime'] < festivalInfo['reviewed']) {
                    festivalInfo['startTime'] = tDate.getTime();
                    festivalInfo['endTime'] = festivalInfo['startTime'] + 3600000;
                    schedule.setItem('festivalStartTime', festivalInfo['startTime'], 20);
                    con.log(2, "New start time");
                }

                festivalInfo['collect'] = next.regex(/(COLLECT NOW!)/) ? true : false;
                if (festivalInfo['state'] === '' || festivalInfo['state'] === 'Completed') {
                    schedule.setItem("festivalTokenTicker", 0);
                    festivalInfo['state'] = 'Ready';
                    festivalInfo['tokens'] = 10;
                    festivalInfo['myStatus'] = '';
                    festivalInfo['damage'] = 0;
                    festivalInfo['teamHealth'] = 0;
                    festivalInfo['enemyHealth'] = 0;
                    festivalInfo['ticker'] = '';
                }

                festival.setItem(festivalInfo);
                start = festivalInfo['startTime'] - festivalInfo['reviewed'];
                start = start > 0 ? start : 0;
                if (start && festivalInfo['state'] === 'Ready') {
                    festivalInfo['minions'] = [];
                    con.log(2, "Festival starting in", start);
                    schedule.setItem("FestivalReview", start, 20);
                } else {
                    con.log(2, "Festival review in", 300);
                    schedule.setItem("FestivalReview", 300, 20);
                }

                con.log(3, "festival.checkInfo", festivalInfo);
                return true;
            } catch (err) {
                con.error("ERROR in festival.checkInfo: " + err);
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
                    notFestival      = '',
                    battleOver    = '',
                    minionRegEx   = new RegExp("(.*) Level: (\\d+) Class: (.*) Health: (\\d+)/(\\d+) Status: (.*) Festival Activity Points: (\\d+)");

                currentRecord = festival.getItem();
                if (currentRecord['state'] !== 'Alive') {
                    con.log(2, "Test targeting");
                    festival.getTargetMinion(currentRecord);
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

                lastAttacked = state.getItem('FestivalMinionAttacked', {});
                state.setItem('FestivalMinionAttacked', {});
                if (!$j.isEmptyObject(lastAttacked) && lastAttacked['index'] >= 0 && lastAttacked['index'] < 40) {
                    resultBody = $j("span[class='result_body']", caap.globalContainer);
                    if ($u.hasContent(resultBody)) {
                        tStr = resultBody.text();
                        tNum = tStr ? tStr.regex(/\+(\d+) Battle Activity Points/) : 0;
                    }

                    imgDiv = $j("img[src*='battle_defeat.gif']", caap.globalContainer);
                    if ($u.hasContent(imgDiv)) {
                        if (lastAttacked['poly']) {
                            con.log(1, "Defeated by polymorphed minion", tNum, currentRecord['minions'][lastAttacked['index']]);
                        } else {
                            if (tNum > 50) {
                                currentRecord['minions'][lastAttacked['index']]['lost'] = true;
                                currentRecord['minions'][lastAttacked['index']]['won'] = false;
                                currentRecord['minions'][lastAttacked['index']]['last_ap'] = 0;
                                wins = festival.delWin(currentRecord['wins'], currentRecord['minions'][lastAttacked['index']]['target_id']);
                                currentRecord['wins'] = wins ? wins : currentRecord['wins'];
                                losses = festival.setLoss(currentRecord['losses'], currentRecord['minions'][lastAttacked['index']]['target_id']);
                                currentRecord['losses'] = losses ? losses : currentRecord['losses'];
                                festival.setItem(currentRecord);
                            } else {
                                con.log(1, "You were polymorphed");
                            }

                            con.log(1, "Defeated by minion", tNum, currentRecord['minions'][lastAttacked['index']]);
                        }
                    } else {
                        imgDiv = $j("img[src*='battle_victory.gif']", caap.globalContainer);
                        if ($u.hasContent(imgDiv)) {
                            if (lastAttacked['poly']) {
                                con.log(1, "Victory against polymorphed minion", tNum, currentRecord['minions'][lastAttacked['index']]);
                            } else {
                                currentRecord['minions'][lastAttacked['index']]['lost'] = false;
                                currentRecord['minions'][lastAttacked['index']]['won'] = true;
                                currentRecord['minions'][lastAttacked['index']]['last_ap'] = tNum ? tNum : 160;
                                won = new festival.win();
                                won.data['userId'] = currentRecord['minions'][lastAttacked['index']]['target_id'];
                                won.data['ap'] = currentRecord['minions'][lastAttacked['index']]['last_ap'];
                                wins = festival.setWin(currentRecord['wins'], won.data);
                                currentRecord['wins'] = wins ? wins : currentRecord['wins'];
                                losses = festival.delLoss(currentRecord['losses'], currentRecord['minions'][lastAttacked['index']]['target_id']);
                                currentRecord['losses'] = losses ? losses : currentRecord['losses'];
                                festival.setItem(currentRecord);
                                con.log(1, "Victory against minion", tNum, currentRecord['minions'][lastAttacked['index']]);
                            }
                        } else {
                            resultsTxt = $j("div[class='results']", caap.globalContainer).text();
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

                bannerDiv = $j("#" +  caap.domain.id[caap.domain.which] + "arena_battle_banner_section", caap.globalContainer);
                con.log(2, "arena_battle_banner_section");
                myStatsTxt = bannerDiv.text();
                myStatsTxt = myStatsTxt ? myStatsTxt.trim().innerTrim() : '';
                notStarted = myStatsTxt.regex(/(This Battle Has Not Started Yet)/);
                notFestival = myStatsTxt.regex(/(You Are Not A Part Of This Festival Battle)/);
                battleOver = myStatsTxt.regex(/(This Festival Battle Is Over)/);
                if (notFestival) {
                    return true;
                }

                con.log(3, "myStatsTxt", myStatsTxt);
                if ($u.hasContent(bannerDiv)) {
                    currentRecord['teamHealth'] = 0;
                    currentRecord['enemyHealth'] = 0;
                    if (!notStarted) {
                        gates = $j("div[id*='" +  caap.domain.id[caap.domain.which] + "enemy_guild_member_list_']", caap.globalContainer);
                        if (!$u.hasContent(gates)) {
                            tabs = $j("div[id*='" +  caap.domain.id[caap.domain.which] + "your_arena_tab']", caap.globalContainer);
                            if (!$u.hasContent(tabs)) {
                                con.warn("No gates found");
                            }
                        } else if (!$u.hasContent(gates) || gates.length !== 4) {
                            con.warn("Not enough gates found");
                        } else {
                            gates.each(function (gIndex) {
                                var memberDivs = $j(this).children();
                                if (!$u.hasContent(memberDivs)) {
                                    con.warn("No members found");
                                } else {
                                    if (memberDivs.length === 1 && /No Soldiers Posted In This Position!/i.test(memberDivs.text().trim().innerTrim())) {
                                        con.log(2, "No Soldiers Posted In This Position");
                                        return true;
                                    }

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
                                            memberRecord = new festival.minion().data;

                                        memberRecord['index'] = index;
                                        targetIdDiv = $j("input[name='target_id']", member);
                                        if ($u.hasContent(targetIdDiv)) {
                                            memberRecord['target_id'] = targetIdDiv.attr("value") ? targetIdDiv.attr("value").parseInt() : 0;
                                            won = festival.getWin(currentRecord['wins'], memberRecord['target_id']);
                                            if ($j.isPlainObject(won)) {
                                                memberRecord['won'] = true;
                                                memberRecord['last_ap'] = won['ap'] ? won['ap'] : 0;
                                            }

                                            loss = festival.checkLoss(currentRecord['losses'], memberRecord['target_id']);
                                            if ($u.isBoolean(loss)) {
                                                memberRecord['lost'] = loss;
                                            }
                                        } else {
                                            con.warn("Unable to find target_id for minion!", targetIdDiv.length);
                                        }

                                        memberRecord['attacking_position'] = (gIndex + 1);
                                        memberText = member.children().eq(1).text();
                                        memberText = memberText ? memberText.trim().innerTrim() : '';
                                        con.log(2, "memberText", memberText);
                                        memberArr = memberText.match(minionRegEx);
                                        if ($u.hasContent(memberArr) && memberArr.length === 8) {
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

                                        nameDiv = $j("div[style='font-size: 19px; padding-bottom: 3px;'], div[style='font-size:19px; padding-bottom:3px;']", member);
                                        if ($u.hasContent(nameDiv) && nameDiv.length === 1) {
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

                                        polyImg = $j("img[src*='polymorph_effect']", member);
                                        memberRecord['poly'] = $u.hasContent(polyImg) ? true : false;
                                        if (memberRecord['poly']) {
                                            con.log(3, "poly", memberRecord);
                                        }

                                        shoutImg = $j("img[src*='warrior_effect_shout']", member);
                                        memberRecord['shout'] = $u.hasContent(shoutImg) ? true : false;
                                        if (memberRecord['shout']) {
                                            con.log(2, "shout", memberRecord);
                                        }

                                        shieldImg = $j("img[src*='mage_effect_shield']", member);
                                        memberRecord['shield'] = $u.hasContent(shieldImg) ? true : false;
                                        if (memberRecord['shield']) {
                                            con.log(2, "shield", memberRecord);
                                        }

                                        index = minions.push(memberRecord);
                                    });
                                }

                                return true;
                            });
                        }
                    }

                    collectDiv = $j("input[src*='arena3_collectbutton.gif']", caap.globalContainer);
                    enterDiv = $j("input[src*='guild_enter_battle_button.gif']", caap.globalContainer);
                    if (!notStarted && !battleOver && !$u.hasContent(collectDiv) && !$u.hasContent(enterDiv)) {
                        currentRecord['state'] = 'Alive';
                        tStr = $j("span[id='" +  caap.domain.id[caap.domain.which] + "monsterTicker']", caap.globalContainer).text();
                        currentRecord['ticker'] = tStr ? tStr.trim() : '';
                        schedule.setItem("festivalTokenTicker", currentRecord['ticker'].parseTimer(), 5);
                        if (myStatsTxt) {
                            con.log(3, "myStatsTxt", myStatsTxt);
                            myStatsArr = myStatsTxt.match(new RegExp("(.+) Level: (\\d+) Class: (.+) Health: (\\d+)/(\\d+).+Status: (.+) Festival Activity Points: (\\d+)"));
                            if ($u.hasContent(myStatsArr) && myStatsArr.length === 8) {
                                con.log(3, "myStatsArr", myStatsArr);
                                currentRecord['damage'] = myStatsArr[7] ? myStatsArr[7].parseInt() : 0;
                                currentRecord['myStatus'] = myStatsArr[6] ? myStatsArr[6].trim() : '';
                                currentRecord['myClass'] = myStatsArr[3] ? myStatsArr[3].trim() : '';
                            } else {
                                con.warn("myStatsArr error", myStatsArr, myStatsTxt);
                            }
                        }

                        tokenSpan = $j("span[id='" +  caap.domain.id[caap.domain.which] + "guild_token_current_value']", caap.globalContainer);
                        tStr = $u.hasContent(tokenSpan) ? tokenSpan.text().trim() : '';
                        currentRecord['tokens'] = tStr ? tStr.parseInt() : 0;

                        timerSpan = $j("span[id='" +  caap.domain.id[caap.domain.which] + "guild_token_time_value']", caap.globalContainer);
                        tStr = $u.hasContent(timerSpan) ? timerSpan.text().trim() : '';
                        currentRecord['tokenTime'] = tStr ? tStr.regex(/(\d+:\d+)/) : '0:00';

                        health = $j("#" +  caap.domain.id[caap.domain.which] + "guild_battle_health", caap.globalContainer);
                        if ($u.hasContent(health)) {
                            healthEnemy = $j("div[style*='guild_battle_bar_enemy.gif']", health).eq(0);
                            if ($u.hasContent(healthEnemy)) {
                                currentRecord['enemyHealth'] = (100 - healthEnemy.getPercent('width')).dp(2);
                            } else {
                                con.warn("guild_battle_bar_enemy.gif not found");
                            }

                            healthGuild = $j("div[style*='guild_battle_bar_you.gif']", health).eq(0);
                            if ($u.hasContent(healthGuild)) {
                                currentRecord['teamHealth'] = (100 - healthGuild.getPercent('width')).dp(2);
                            } else {
                                con.warn("guild_battle_bar_you.gif not found");
                            }
                        } else {
                            con.warn("guild_battle_health error");
                        }
                    } else {
                        if ($u.hasContent(collectDiv)) {
                            con.log(1, "Battle ready to collect");
                            currentRecord['state'] = 'Collect';
                        } else if (!$u.hasContent(enterDiv) && currentRecord['state'] !== 'Ready') {
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

                    if ($u.hasContent(minions)) {
                        currentRecord['minions'] = minions.slice();
                    }

                    currentRecord['reviewed'] = Date.now();
                    con.log(3, "currentRecord", currentRecord);
                    festival.setItem(currentRecord);
                    if (currentRecord['state'] === 'Collect' && $u.hasContent(collectDiv)) {
                        caap.click(collectDiv);
                    }
                } else {
                    con.warn("Not on festival battle page");
                }

                return true;
            } catch (err) {
                con.error("ERROR in festival.onBattle: " + err);
                return false;
            }
        },

        clearMinions: function () {
            try {
                var currentRecord = {};
                currentRecord = festival.getItem();
                currentRecord['minions'] = [];
                festival.setItem(currentRecord);
                return true;
            } catch (err) {
                con.error("ERROR in festival.clearMinions: " + err);
                return false;
            }
        },

        getMinion: function (index) {
            try {
                var festivalInfo = {},
                    minion    = {};

                if (index === '' || $u.isNaN(index) || index < 0 || index > 40) {
                    con.warn("index", index);
                    throw "Invalid identifying index!";
                }

                festivalInfo = festival.getItem();
                if (!$j.isEmptyObject(festivalInfo) && festivalInfo['minions'] && festivalInfo['minions'].length === 40) {
                    minion = festivalInfo['minions'][index];
                } else {
                    con.log(1, "No minion records available", festivalInfo);
                }

                return minion;
            } catch (err) {
                con.error("ERROR in festival.getTarget: " + err);
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
                    ignoreFestivalHealth = 0,
                    maxFestivalLevel     = 0,
                    chainFestival        = 0,
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

                ignoreFestivalHealth = config.getItem("ignoreFestivalHealth", 200);
                maxFestivalLevel = config.getItem("maxFestivalLevel", 50);
                killClericFirst = config.getItem("killClericFirst", false);
                attackPoly = config.getItem("attackPoly", false);
                chainFestival = config.getItem("chainFestival", '160').parseInt();
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
                        logic1 = ((killClericFirst && mclass === "Cleric") || next['healthNum'] > ignoreFestivalHealth);
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
                            logic2 = chainFestival && next['won'] && next['last_ap'] >= chainFestival;
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
                                if (nDiff >= 0 && nDiff <= maxFestivalLevel && nDiff > cDiff) {
                                    con.log(3, type + ' ' + mclass + " better level match", target[mclass][type]['level'], next['level'], [target[mclass][type], next]);
                                    target[mclass][type] = next;
                                    return true;
                                }

                                if (nDiff > maxFestivalLevel && nDiff < cDiff) {
                                    con.log(3, type + ' ' + mclass + " better level match", target[mclass][type]['level'], next['level'], [target[mclass][type], next]);
                                    target[mclass][type] = next;
                                    return true;
                                }
                            } else {
                                if (nDiff <= maxFestivalLevel && nDiff > cDiff) {
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
                attackOrderList = config.getList('orderFestivalClass', '');
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
                con.error("ERROR in festival.getTargetMinion: " + err);
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
                        'Never - disables attacking in Festival'
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

                htmlCode += caap.startToggle('Festival', 'FESTIVAL');
                htmlCode += caap.makeDropDownTR("Attack When", 'WhenFestival', mbattleList, mbattleInst, '', 'Never', false, false, 62);
                htmlCode += caap.startDropHide('WhenFestival', '', 'Never', true);
                htmlCode += caap.makeTD("Attack Classes in this order");
                htmlCode += caap.makeTextBox('orderFestivalClass', 'Attack Festival class in this order. Uses the class name.', 'Cleric,Mage,Rogue,Warrior', '');
                htmlCode += caap.makeNumberFormTR("Ignore Health &lt;=", 'ignoreFestivalHealth', "Ignore enemies with health equal to or below this level.", 200, '', '');
                htmlCode += caap.makeNumberFormTR("Ignore Level Plus &gt;=", 'maxFestivalLevel', "This value is added the the value of your current level and enemies with a level above this value are ignored", 50, '', '');
                htmlCode += caap.makeCheckTR("Stun All Clerics", 'killClericFirst', false, "Attack Clerics that are not stunned.");
                htmlCode += caap.makeCheckTR("Do Polymorphed", 'doPoly', true, "Attack polymorphed players.");
                htmlCode += caap.startCheckHide('doPoly');
                htmlCode += caap.makeCheckTR("Priority Polymorphed", 'attackPoly', false, "Attack polymorphed players first.", true);
                htmlCode += caap.makeCheckTR("Attack Polymorphed If Rogue", 'roguePoly', true, "Only attack polymorphed players if you are class Rogue.", true);
                htmlCode += caap.makeCheckTR("Stunned Ignore Polymorphed", 'stunnedPoly', true, "If you are stunned then do not attack polymorphed minions, leave them for someone who can do more damage.", true);
                htmlCode += caap.endCheckHide('doPoly');
                htmlCode += caap.makeCheckTR("Suicide", 'attackSuicide', false, "When out of targets, attack active Rogues or Warriors to which you lost previously, before any class that's not stunned.");
                htmlCode += caap.makeDropDownTR("Chain", 'chainFestival', chainList, chainListInst, '', '160', false, false, 35);
                htmlCode += caap.startDropHide('chainFestival', '', '0', true);
                htmlCode += caap.makeCheckTR("Chain Observe Health", 'observeHealth', true, "When chaining, observe the 'Ignore Health' and 'Stun All Clerics' options.");
                htmlCode += caap.endDropHide('chainFestival');
                htmlCode += caap.endDropHide('WhenFestival');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                con.error("ERROR in festival.menu: " + err);
                return '';
            }
        },

        dashboard: function () {
            try {
                if (config.getItem('DBDisplay', '') === 'Festival' && session.getItem("FestivalDashUpdate", true)) {
                    var headers = ['Festival', 'Damage',     'Team%',       'Enemy%',   'My Status', 'TimeLeft', 'Status'],
                        values  = ['damage',   'teamHealth', 'enemyHealth', 'myStatus', 'ticker',    'state'],
                        pp      = 0,
                        i       = 0,
                        len     = 0,
                        data    = {},
                        color   = '',
                        handler = null,
                        head    = '',
                        body    = '',
                        row     = '';

                    for (pp = 0; pp < headers.length; pp += 1) {
                        head += caap.makeTh({text: headers[pp], color: '', id: '', title: '', width: ''});
                    }

                    head = caap.makeTr(head);
                    for (i = 0, len = festival.records.length; i < len; i += 1) {
                        row = "";
                        data = {
                            text  : '<span id="caap_festival_1" title="Clicking this link will take you to the Festival" rlink="festival_battle_home.php" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">Festival</span>',
                            color : 'blue',
                            id    : '',
                            title : ''
                        };

                        row += caap.makeTd(data);
                        color = festival.records[i]['state'] === 'Alive' ? 'green' : $u.bestTextColor(config.getItem("StyleBackgroundLight", "#E0C961"));
                        color = festival.records[i]['state'] === 'Alive' && festival.records[i]['enemyHealth'] === festival.records[i]['teamHealth'] ? 'purple' : color;
                        color = festival.records[i]['enemyHealth'] > festival.records[i]['teamHealth'] ? 'red' : color;
                        for (pp = 0; pp < values.length; pp += 1) {
                            if (values[pp] === 'ticker') {
                                row += caap.makeTd({text: $u.hasContent(festival.records[i][values[pp]]) ? festival.records[i][values[pp]].regex(/(\d+:\d+):\d+/) : '', color: color, id: '', title: ''});
                            } else {
                                row += caap.makeTd({
                                    text  : $u.hasContent(festival.records[i][values[pp]]) && ($u.isString(festival.records[i][values[pp]]) || festival.records[i][values[pp]] > 0) ? festival.records[i][values[pp]] : '',
                                    color : color,
                                    id    : '',
                                    title : ''
                                });
                            }
                        }

                        body += caap.makeTr(row);
                    }

                    $j("#caap_festival", caap.caapTopObject).html(caap.makeTable("festival", head, body));

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

                    $j("span[id='caap_festival_1']", caap.caapTopObject).unbind('click', handler).click(handler);

                    session.setItem("FestivalDashUpdate", false);
                }

                return true;
            } catch (err) {
                con.error("ERROR in festival.dashboard: " + err);
                return false;
            }
        },

        engageListener: function (event) {
            con.log(4, "engage festival_battle_home.php");
            caap.setDomWaiting("festival_battle_home.php");
        },


        dualListener: function (event) {
            var index  = -1,
                minion = {};

            con.log(4, "engage festival_guild_battle.php", event.target.id);
            index = event.target.id ? event.target.id.parseInt() : -1;
            minion = festival.getMinion(index);
            minion = !$j.isEmptyObject(minion) ? minion : {};
            state.setItem('FestivalMinionAttacked', minion);
            caap.setDomWaiting("festival_guild_battle.php");
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        checkResults_festival_battle_home: function () {
            try {
                //caap.globalContainer.find("input[src*='battle_enter_battle']").bind('click', festival.engageListener);
                festival.checkInfo();
                return true;
            } catch (err) {
                con.error("ERROR in festival.checkResults_festival_battle_home: " + err);
                return false;
            }
        },

        checkResults_festival_guild_battle: function () {
            try {
                caap.globalContainer.find("input[src*='monster_duel_button']").each(function (index) {
                    $j(this).parent().parent().attr("id", index).bind('click', festival.dualListener);
                });

                festival.onBattle();
                return true;
            } catch (err) {
                con.error("ERROR in festival.checkResults_festival_guild_battle: " + err);
                return false;
            }
        },

        review: function () {
            try {
                /*-------------------------------------------------------------------------------------\
                We do Festival review once an hour.  Some routines may reset this timer to drive
                FestivalReview immediately.
                \-------------------------------------------------------------------------------------*/
                if (!schedule.check("FestivalReview") || config.getItem('WhenFestival', 'Never') === 'Never') {
                    return false;
                }

                if (state.getItem('FestivalRefresh', true)) {
                    if (festival.navigate_to_main_refresh()) {
                        return true;
                    }
                }

                if (!state.getItem('FestivalReview', false)) {
                    if (festival.navigate_to_main()) {
                        return true;
                    }

                    state.setItem('FestivalReview', true);
                }

                state.setItem('FestivalRefresh', true);
                state.setItem('FestivalReview', false);
                con.log(1, 'Done with Festival review.');
                return false;
            } catch (err) {
                con.error("ERROR in festival.Review: " + err);
                return false;
            }
        },

        festival: function () {
            try {
                var when    = config.getItem("WhenFestival", 'Never'),
                    record  = festival.getItem(),
                    minion  = {},
                    form    = $j(),
                    key     = $j(),
                    enterButton = $j(),
                    nextTime = '',
                    tokenTimer = 0;

                if (when === 'Never') {
                    return false;
                }

                nextTime = record['startTime'] ? "Next Festival: " + $u.makeTime(record['startTime'], caap.timeStr(true)) : '';
                tokenTimer = (record['reviewed'] && record['tokenTime'] && record['state'] === 'Alive') ? ((record['reviewed'] + (record['tokenTime'].parseTimer() * 1000)) - Date.now()) / 1000 : -1;
                tokenTimer = tokenTimer >= 0 ? tokenTimer.dp() : 0;
                nextTime = (tokenTimer >= 0 && record['state'] === 'Alive') ? "Next Token in: " + tokenTimer + ' seconds': nextTime;
                caap.setDivContent('festival_mess', nextTime);
                if (!schedule.check('festivalStartTime')) {
                    con.log(1, "festivalStartTime", Date.now(), schedule.getItem('festivalStartTime'));
                    return false;
                }

                /*
                if (!record || !$j.isPlainObject(record) || $j.isEmptyObject(record) || state.getItem('FestivalJoined', false)) {
                    con.log(1, "FestivalRefresh1");
                    if (state.getItem('FestivalRefresh', true)) {
                        if (festival.navigate_to_main_refresh()) {
                            return true;
                        }
                    }

                    if (!state.getItem('FestivalReview', false)) {
                        if (festival.navigate_to_main()) {
                            return true;
                        }

                        state.setItem('FestivalReview', true);
                    }

                    state.setItem('FestivalRefresh', true);
                    state.setItem('FestivalReview', false);
                    state.setItem('FestivalJoined', false);
                    return false;
                }
                */

                /*
                if (record['tokens'] <= 0 || (record['ticker'].parseTimer() <= 0 && record['state'] === "Ready") || (caap.stats['stamina']['num'] < 20 && record['state'] === "Ready")) {
                    return false;
                }
                */
                if (!schedule.check("festivalTokenTicker")) {
                    con.log(1, "festivalTokenTicker");
                    return false;
                }

                caap.setDivContent('festival_mess', "Entering Festival");
                if (general.Select('FestivalGeneral')) {
                    return true;
                }

                if (!$u.hasContent($j("#" + caap.domain.id[caap.domain.which] + "arena_battle_banner_section", caap.globalContainer))) {
                    con.log(1, "FestivalRefresh2");
                    /*
                    if (state.getItem('FestivalRefresh', true)) {
                        if (festival.navigate_to_main_refresh()) {
                            return true;
                        }
                    }

                    if (!state.getItem('FestivalReview', false)) {
                        if (festival.navigate_to_main()) {
                            return true;
                        }

                        state.setItem('FestivalReview', true);
                    }
                    */

                    state.setItem('FestivalRefresh', true);
                    state.setItem('FestivalReview', false);
                    enterButton = $j("img[src*='festival_arena_enter.jpg']");
                    con.log(1, "Enter battle", record, enterButton);
                    if (record['tokens'] > 0 && $u.hasContent(enterButton)) {
                        festival.clearMinions();
                        caap.click(enterButton);
                        return true;
                    }
                }

                enterButton = $j("input[src*='guild_enter_battle_button.gif']");
                if ($u.hasContent(enterButton)) {
                    con.log(1, "Joining battle", caap.stats['stamina']['num'], record, enterButton);
                    if (caap.stats['stamina']['num'] >= 20 && record['tokens'] > 0) {
                        state.setItem('FestivalJoined', true);
                        caap.click(enterButton);
                        return true;
                    }

                    return false;
                }

                if (record['state'] !== "Alive") {
                    con.log(1, "Not Alive");
                    return false;
                }

                minion = festival.getTargetMinion(record);
                if (minion && $j.isPlainObject(minion) && !$j.isEmptyObject(minion)) {
                    con.log(2, "Fighting target_id (" + minion['target_id'] + ") Name: " + minion['name']);
                    caap.setDivContent('festival_mess', "Fighting (" + minion['target_id'] + ") " + minion['name']);
                    key = $j("#" + caap.domain.id[caap.domain.which] + "attack_key_" + minion['target_id']);
                    if (key && key.length) {
                        form = key.parents("form").eq(0);
                        if (form && form.length) {
                            state.setItem('FestivalMinionAttacked', minion);
                            caap.click(form.find("input[src*='guild_duel_button2.gif'],input[src*='monster_duel_button.gif']"));
                            return true;
                        }
                    }
                }

                return false;
            } catch (err) {
                con.error("ERROR in festival.festival: " + err);
                return false;
            }
        },

        index: function () {
            try {
                var tokenSpan = $j(),
                    tStr      = '',
                    festivalInfo = {};

                $j("div[style*='arena3_newsfeed']").unbind('click', festival.engageListener).bind('click', caap.arenaEngageListener);
                tokenSpan = $j("span[id='" + caap.domain.id[caap.domain.which] + "arena_token_current_value']");
                if (tokenSpan && tokenSpan.length) {
                    tStr = tokenSpan.length ? tokenSpan.text().trim() : '';
                    festivalInfo = festival.getItem();
                    festivalInfo['tokens'] = tStr ? tStr.parseInt() : 0;
                    if (festivalInfo['tokens'] === 10) {
                        festivalInfo['tokenTime'] = '';
                    }

                    festival.setItem(festivalInfo);
                    con.log(4, 'festivalInfo', festivalInfo);
                }
                return false;
            } catch (err) {
                con.error("ERROR in festival.index: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        addListeners: function () {
            try {
                $j("input[src*='battle_enter_battle']", caap.globalContainer).bind('click', festival.engageListener);
                //$j("div[style*='arena3_newsfeed']", caap.globalContainer).bind('click', festival.engageListener);
                $j("input[src*='monster_duel_button']", caap.globalContainer).each(function (index) {
                    $j(this).attr("id", index).bind('click', festival.dualListener);
                });

                return true;
            } catch (err) {
                con.error("ERROR in festival.addListeners: " + err);
                return false;
            }
        }
    };
