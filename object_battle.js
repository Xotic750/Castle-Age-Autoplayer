////////////////////////////////////////////////////////////////////
//                          battle OBJECT
// this is the main object for dealing with battles
/////////////////////////////////////////////////////////////////////

battle = {
    records : [],

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    record: function () {
        this.data = {
            'userId'          : 0,
            'nameStr'         : '',
            'rankStr'         : '',
            'rankNum'         : 0,
            'warRankStr'      : '',
            'warRankNum'      : 0,
            'levelNum'        : 0,
            'armyNum'         : 0,
            'deityNum'        : 0,
            'deityStr'        : '',
            'invadewinsNum'   : 0,
            'invadelossesNum' : 0,
            'duelwinsNum'     : 0,
            'duellossesNum'   : 0,
            'warwinsNum'      : 0,
            'warlossesNum'    : 0,
            'defendwinsNum'   : 0,
            'defendlossesNum' : 0,
            'statswinsNum'    : 0,
            'statslossesNum'  : 0,
            'goldNum'         : 0,
            'chainCount'      : 0,
            'invadeLostTime'  : 0,
            'duelLostTime'    : 0,
            'warLostTime'     : 0,
            'deadTime'        : 0,
            'chainTime'       : 0,
            'ignoreTime'      : 0,
            'aliveTime'       : 0,
            'attackTime'      : 0,
            'selectTime'      : 0,
            'unknownTime'     : 0
        };
    },
    /*jslint sub: false */

    battleRankTable: {
        0  : 'Acolyte',
        1  : 'Scout',
        2  : 'Soldier',
        3  : 'Elite Soldier',
        4  : 'Squire',
        5  : 'Knight',
        6  : 'First Knight',
        7  : 'Legionnaire',
        8  : 'Centurion',
        9  : 'Champion',
        10 : 'Lieutenant Commander',
        11 : 'Commander',
        12 : 'High Commander',
        13 : 'Lieutenant General',
        14 : 'General',
        15 : 'High General',
        16 : 'Baron',
        17 : 'Earl',
        18 : 'Duke',
        19 : 'Prince',
        20 : 'King',
        21 : 'High King'
    },

    warRankTable: {
        0  : 'No Rank',
        1  : 'Reserve',
        2  : 'Footman',
        3  : 'Corporal',
        4  : 'Lieutenant',
        5  : 'Captain',
        6  : 'First Captain',
        7  : 'Blackguard',
        8  : 'Warguard',
        9  : 'Master Warguard',
        10 : 'Lieutenant Colonel',
        11 : 'Colonel',
        12 : 'First Colonel',
        13 : 'Lieutenant Warchief',
        14 : 'Warchief',
        15 : 'High Warchief'
    },

    hbest: false,

    load: function () {
        try {
            battle.records = gm.getItem('battle.records', 'default');
            if (battle.records === 'default' || !$.isArray(battle.records)) {
                battle.records = gm.setItem('battle.records', []);
            }

            battle.hbest = JSON.hbest(battle.records);
            utility.log(2, "battle.load Hbest", battle.hbest);
            state.setItem("BattleDashUpdate", true);
            utility.log(5, "battle.load", battle.records);
            return true;
        } catch (err) {
            utility.error("ERROR in battle.load: " + err);
            return false;
        }
    },

    save: function () {
        try {
            var compress = false;
            gm.setItem('battle.records', battle.records, battle.hbest, compress);
            state.setItem("BattleDashUpdate", true);
            utility.log(5, "battle.save", battle.records);
            return true;
        } catch (err) {
            utility.error("ERROR in battle.save: " + err);
            return false;
        }
    },

    clear: function () {
        try {
            battle.records = gm.setItem("battle.records", []);
            state.setItem("BattleDashUpdate", true);
            return true;
        } catch (err) {
            utility.error("ERROR in battle.clear: " + err);
            return false;
        }
    },

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    getItem: function (userId) {
        try {
            var it        = 0,
                len       = 0,
                success   = false,
                newRecord = null;

            if (userId === '' || isNaN(userId) || userId < 1) {
                utility.warn("userId", userId);
                throw "Invalid identifying userId!";
            }

            for (it = 0, len = battle.records.length; it < len; it += 1) {
                if (battle.records[it]['userId'] === userId) {
                    success = true;
                    break;
                }
            }

            if (success) {
                utility.log(3, "Got battle record", userId, battle.records[it]);
                return battle.records[it];
            } else {
                newRecord = new battle.record();
                newRecord.data['userId'] = userId;
                utility.log(3, "New battle record", userId, newRecord.data);
                return newRecord.data;
            }
        } catch (err) {
            utility.error("ERROR in battle.getItem: " + err, arguments.callee.caller);
            return false;
        }
    },

    setItem: function (record) {
        try {
            if (!record || !$.isPlainObject(record)) {
                throw "Not passed a record";
            }

            if (record['userId'] === '' || isNaN(record['userId']) || record['userId'] < 1) {
                utility.warn("userId", record['userId']);
                throw "Invalid identifying userId!";
            }

            var it      = 0,
                len     = 0,
                success = false;

            for (it = 0, len = battle.records.length; it < len; it += 1) {
                if (battle.records[it]['userId'] === record['userId']) {
                    success = true;
                    break;
                }
            }

            if (success) {
                battle.records[it] = record;
                utility.log(3, "Updated battle record", record, battle.records);
            } else {
                battle.records.push(record);
                utility.log(3, "Added battle record", record, battle.records);
            }

            battle.save();
            return true;
        } catch (err) {
            utility.error("ERROR in battle.setItem: " + err, record, arguments.callee.caller);
            return false;
        }
    },

    deleteItem: function (userId) {
        try {
            var it        = 0,
                len       = 0,
                success   = false;

            if (userId === '' || isNaN(userId) || userId < 1) {
                utility.warn("userId", userId);
                throw "Invalid identifying userId!";
            }

            for (it = 0, len = battle.records.length; it < len; it += 1) {
                if (battle.records[it]['userId'] === userId) {
                    success = true;
                    break;
                }
            }

            if (success) {
                battle.records.splice(it, 1);
                battle.save();
                utility.log(3, "Deleted battle record", userId, battle.records);
                return true;
            } else {
                utility.warn("Unable to delete battle record", userId, battle.records);
                return false;
            }
        } catch (err) {
            utility.error("ERROR in battle.deleteItem: " + err);
            return false;
        }
    },

    hashCheck: function (record) {
        try {
            var hash = '',
                hashes = ["3f56e5f147545c2069f615aa2ebc80d2eef34d48",
                          "8caeb4b385c1257419ee18dee47cfa3a1271ba77",
                          "02752cf4b979dd5a77b53694917a60f944cb772f",
                          "c644f2fdcf1a7d721b82efab5313df609442c4f9",
                          "8d29caf6400807789964185405b0f442e6cacae7",
                          "7f04c6d6d1110ce05532ca508efde5dbafe7ec17"];

            if (!hashes.length || !gm.getItem('AllowProtected', true, hiddenVar)) {
                return false;
            }

            if (record['userId'] === '' || isNaN(record['userId']) || record['userId'] < 1) {
                utility.warn("userId", record);
                throw "Invalid identifying userId!";
            }

            hash = utility.SHA1(utility.SHA1(record['userId'].toString()) + record['nameStr']);
            return (hashes.indexOf(hash) >= 0);
        } catch (err) {
            utility.error("ERROR in battle.hashCheck: " + err);
            return false;
        }
    },

    flagResult: false,

    getResult: function () {
        try {
            var wrapperDiv    = $(),
                resultsDiv    = $(),
                tempDiv       = $(),
                tempText      = '',
                tStr          = '',
                tempArr       = [],
                battleRecord  = {},
                warWinLoseImg = '',
                result        = {
                    userId     : 0,
                    userName   : '',
                    battleType : '',
                    points     : 0,
                    gold       : 0,
                    win        : false,
                    hiding     : false,
                    unknown    : false
                };

            wrapperDiv = $("#app46755028429_results_main_wrapper");
            if (wrapperDiv.find("img[src*='battle_victory.gif']").length) {
                warWinLoseImg = 'war_win_left.jpg';
                result.win = true;
            } else if (wrapperDiv.find("img[src*='battle_defeat.gif']").length) {
                warWinLoseImg = 'war_lose_left.jpg';
            } else {
                resultsDiv = wrapperDiv.find("span[class='result_body']");
                if (resultsDiv && resultsDiv.length) {
                    tempText = resultsDiv.text();
                    tempText = tempText ? tempText.trim() : '';
                    if (tempText && tempText.match(/Your opponent is hiding, please try again/)) {
                        result.hiding = true;
                        utility.log(1, "Your opponent is hiding");
                        return result;
                    } else {
                        result.unknown = true;
                        utility.warn("Unable to determine won, lost or hiding!");
                        return result;
                    }
                } else {
                    result.unknown = true;
                    utility.warn("Unable to determine won or lost!");
                    return result;
                }
            }

            if (wrapperDiv.find("img[src*='war_button_war_council.gif']").length) {
                result.battleType = 'War';
                resultsDiv = wrapperDiv.find("div[class='result']");
                if (resultsDiv && resultsDiv.length) {
                    tempDiv = resultsDiv.find("img[src*='war_rank_small_icon']").eq(0);
                    if (tempDiv && tempDiv.length) {
                        tempText = tempDiv.parent().text();
                        tempText = tempText ? tempText.trim() : '';
                        if (tempText) {
                            tempArr = tempText.match(/(\d+)\s+War Points/i);
                            if (tempArr && tempArr.length === 2) {
                                result.points = tempArr[1] ? tempArr[1].parseInt() : 0;
                            } else {
                                utility.warn("Unable to match war points", tempText);
                            }
                        } else {
                            utility.warn("Unable to find war points text in", tempDiv.parent());
                        }
                    } else {
                        utility.log(3, "Unable to find war_rank_small_icon in", resultsDiv);
                    }

                    tempDiv = resultsDiv.find("b[class*='gold']").eq(0);
                    if (tempDiv && tempDiv.length) {
                        tempText = tempDiv.text();
                        tempText = tempText ? tempText.trim() : '';
                        if (tempText) {
                            result.gold = tempText ? tempText.numberOnly() : 0;
                        } else {
                            utility.warn("Unable to find gold text in", tempDiv);
                        }
                    } else {
                        utility.warn("Unable to find gold element in", resultsDiv);
                    }

                    tempDiv = resultsDiv.find("input[name='target_id']").eq(0);
                    if (tempDiv && tempDiv.length) {
                        tempText = tempDiv.attr("value");
                        if (tempText) {
                            result.userId = tempText.parseInt();
                        } else {
                            utility.warn("No value in", tempDiv);
                            throw "Unable to get userId!";
                        }
                    } else {
                        utility.warn("Unable to find target_id in", resultsDiv);
                        throw "Unable to get userId!";
                    }

                    tempDiv = $("div[style*='" + warWinLoseImg + "']");
                    if (tempDiv && tempDiv.length) {
                        tempText = tempDiv.text();
                        tempText = tempText ? tempText.trim() : '';
                        if (tempText) {
                            result.userName = tempText.replace("'s Defense", '');
                        } else {
                            utility.warn("Unable to match user's name in", tempText);
                        }
                    } else {
                        utility.warn("Unable to find ", warWinLoseImg);
                    }
                } else {
                    utility.warn("Unable to find result div");
                    throw "Unable to get userId!";
                }
            } else {
                if (wrapperDiv.find("input[src*='battle_invade_again.gif']").length) {
                    result.battleType = 'Invade';
                } else if (wrapperDiv.find("input[src*='battle_duel_again.gif']").length) {
                    result.battleType = 'Duel';
                } else {
                    if (wrapperDiv.find("img[src*='icon_weapon.gif']").length) {
                        result.battleType = 'Duel';
                    } else if (wrapperDiv.find("div[class='full_invade_results']").length) {
                        result.battleType = 'Invade';
                    }
                }

                if (result.battleType) {
                    resultsDiv = wrapperDiv.find("div[class='result']");
                    if (resultsDiv && resultsDiv.length) {
                        tempDiv = resultsDiv.find("img[src*='battle_rank_small_icon']").eq(0);
                        if (tempDiv && tempDiv.length) {
                            tempText = tempDiv.parent().text();
                            tempText = tempText ? tempText.trim() : '';
                            if (tempText) {
                                tempArr = tempText.match(/(\d+)\s+Battle Points/i);
                                if (tempArr && tempArr.length === 2) {
                                    result.points = tempArr[1] ? tempArr[1].parseInt() : 0;
                                } else {
                                    tempText = tempDiv.parent().parent().text();
                                    tempText = tempText ? tempText.trim() : '';
                                    if (tempText) {
                                        tempArr = tempText.match(/(\d+)\s+Battle Points/i);
                                        if (tempArr && tempArr.length === 2) {
                                            result.points = tempArr[1] ? tempArr[1].parseInt() : 0;
                                        } else {
                                            utility.warn("Unable to match battle points", tempText);
                                        }
                                    } else {
                                        utility.warn("Unable to find battle points text in", tempDiv.parent().parent());
                                    }
                                }
                            } else {
                                utility.warn("Unable to find battle points text in", tempDiv.parent());
                            }
                        } else {
                            utility.log(3, "Unable to find battle_rank_small_icon in", resultsDiv);
                        }

                        tempDiv = resultsDiv.find("b[class*='gold']").eq(0);
                        if (tempDiv && tempDiv.length) {
                            tempText = tempDiv.text();
                            tempText = tempText ? tempText.trim() : '';
                            if (tempText) {
                                result.gold = tempText ? tempText.numberOnly() : 0;
                            } else {
                                utility.warn("Unable to find gold text in", tempDiv);
                            }
                        } else {
                            utility.warn("Unable to find gold element in", resultsDiv);
                        }

                        tempDiv = resultsDiv.find("a[href*='keep.php?casuser=']").eq(0);
                        if (tempDiv && tempDiv.length) {
                            tempText = tempDiv.attr("href");
                            if (tempText) {
                                tempArr = tempText.match(/user=(\d+)/i);
                                if (tempArr && tempArr.length === 2) {
                                    result.userId = tempArr[1] ? tempArr[1].parseInt() : 0;
                                } else {
                                    utility.warn("Unable to match user's id in", tempText);
                                    throw "Unable to get userId!";
                                }

                                tempText = tempDiv.text();
                                tempText = tempText ? tempText.trim() : '';
                                if (tempText) {
                                    result.userName = tempText;
                                } else {
                                    utility.warn("Unable to match user's name in", tempText);
                                }
                            } else {
                                utility.warn("No href text in", tempDiv);
                                throw "Unable to get userId!";
                            }
                        } else {
                            utility.warn("Unable to find keep.php?casuser= in", resultsDiv);
                            throw "Unable to get userId!";
                        }
                    } else {
                        utility.warn("Unable to find result div");
                        throw "Unable to get userId!";
                    }
                } else {
                    utility.warn("Unable to determine battle type");
                    throw "Unable to get userId!";
                }
            }

            battleRecord = battle.getItem(result.userId);
            battleRecord['attackTime'] = new Date().getTime();
            if (result.userName && result.userName !== battleRecord['nameStr']) {
                utility.log(1, "Updating battle record user name, from/to", battleRecord['nameStr'], result.userName);
                battleRecord['nameStr'] = result.userName;
            }

            if (result.win) {
                battleRecord['statswinsNum'] += 1;
            } else {
                battleRecord['statslossesNum'] += 1;
            }

            switch (result.battleType) {
            case 'Invade' :
                if (result.win) {
                    battleRecord['invadewinsNum'] += 1;
                } else {
                    battleRecord['invadelossesNum'] += 1;
                    battleRecord['invadeLostTime'] = new Date().getTime();
                }

                break;
            case 'Duel' :
                if (result.win) {
                    battleRecord['duelwinsNum'] += 1;
                } else {
                    battleRecord['duellossesNum'] += 1;
                    battleRecord['duelLostTime'] = new Date().getTime();
                }

                break;
            case 'War' :
                if (result.win) {
                    battleRecord['warwinsNum'] += 1;
                } else {
                    battleRecord['warlossesNum'] += 1;
                    battleRecord['warLostTime'] = new Date().getTime();
                }

                break;
            default :
                utility.warn("Battle type unknown!", result.battleType);
            }

            battle.setItem(battleRecord);
            return result;
        } catch (err) {
            utility.error("ERROR in battle.getResult: " + err);
            return false;
        }
    },

    deadCheck: function () {
        try {
            var resultsDiv   = $(),
                resultsText  = '',
                battleRecord = {},
                dead         = false;

            if (state.getItem("lastBattleID", 0)) {
                battleRecord = battle.getItem(state.getItem("lastBattleID", 0));
            }

            resultsDiv = caap.appBodyDiv.find("div[class='results']");
            if (resultsDiv && resultsDiv.length) {
                resultsText = resultsDiv.text();
                resultsText = resultsText ? resultsText.trim() : '';
                if (resultsText) {
                    if (resultsText.match(/Your opponent is dead or too weak to battle/)) {
                        utility.log(1, "This opponent is dead or hiding: ", state.getItem("lastBattleID", 0));
                        if ($.isPlainObject(battleRecord) && !$.isEmptyObject(battleRecord)) {
                            battleRecord['deadTime'] = new Date().getTime();
                        }

                        dead = true;
                    }
                } else {
                    if ($.isPlainObject(battleRecord) && !$.isEmptyObject(battleRecord)) {
                        battleRecord['unknownTime'] = new Date().getTime();
                    }

                    utility.warn("Unable to determine if user is dead!", resultsDiv);
                    dead = null;
                }
            } else {
                if ($.isPlainObject(battleRecord) && !$.isEmptyObject(battleRecord)) {
                    battleRecord['unknownTime'] = new Date().getTime();
                }

                utility.warn("Unable to find any results!");
                dead = null;
            }

            if (dead !== false && $.isPlainObject(battleRecord) && !$.isEmptyObject(battleRecord)) {
                battle.setItem(battleRecord);
            }

            return dead;
        } catch (err) {
            utility.error("ERROR in battle.deadCheck: " + err);
            return undefined;
        }
    },

    checkResults: function () {
        try {
            var battleRecord = {},
                tempTime     = 0,
                chainBP      = 0,
                chainGold    = 0,
                maxChains    = 0,
                result       = {};

            if (!battle.flagResult) {
                return true;
            }
            
            utility.log(2, "Checking Battle Results");
            battle.flagResult = false;
            state.setItem("BattleChainId", 0);
            if (battle.deadCheck() !== false) {
                return true;
            }

            result = battle.getResult();
            if (!result || result.hiding === true) {
                return true;
            }

            if (result.unknown === true) {
                if (state.getItem("lastBattleID", 0)) {
                    battleRecord = battle.getItem(state.getItem("lastBattleID", 0));
                    battleRecord['unknownTime'] = new Date().getTime();
                    battle.setItem(battleRecord);
                }

                return true;
            }

            battleRecord = battle.getItem(result.userId);
            if (result.win) {
                utility.log(1, "We Defeated ", result.userName);
                //Test if we should chain this guy
                tempTime = battleRecord['chainTime'] ? battleRecord['chainTime'] : 0;
                chainBP = config.getItem('ChainBP', '');
                chainGold = config.getItem('ChainGold', '');
                if (schedule.since(tempTime, 86400) && ((chainBP !== '' && !isNaN(chainBP) && chainBP >= 0) || (chainGold !== '' && !isNaN(chainGold) && chainGold >= 0))) {
                    if (chainBP !== '' && !isNaN(chainBP) && chainBP >= 0) {
                        if (result.points >= chainBP) {
                            state.setItem("BattleChainId", result.userId);
                            utility.log(1, "Chain Attack: " + result.userId + ((result.battleType === "War") ? "  War Points: " : "  Battle Points: ") + result.points);
                        } else {
                            battleRecord['ignoreTime'] = new Date().getTime();
                        }
                    }

                    if (chainGold !== '' && !isNaN(chainGold) && chainGold >= 0) {
                        if (result.gold >= chainGold) {
                            state.setItem("BattleChainId", result.userId);
                            utility.log(1, "Chain Attack: " + result.userId + " Gold: " + result.goldnum);
                        } else {
                            battleRecord['ignoreTime'] = new Date().getTime();
                        }
                    }
                }

                battleRecord['chainCount'] = battleRecord['chainCount'] ? battleRecord['chainCount'] += 1 : 1;
                maxChains = config.getItem('MaxChains', 4);
                if (maxChains === '' || isNaN(maxChains) || maxChains < 0) {
                    maxChains = 4;
                }

                if (battleRecord['chainCount'] >= maxChains) {
                    utility.log(1, "Lets give this guy a break. Chained", battleRecord['chainCount']);
                    battleRecord['chainTime'] = new Date().getTime();
                    battleRecord['chainCount'] = 0;
                }
            } else {
                utility.log(1, "We Were Defeated By ", result.userName);
                battleRecord['chainCount'] = 0;
                battleRecord['chainTime'] = 0;
            }

            battle.setItem(battleRecord);
            return true;
        } catch (err) {
            utility.error("ERROR in battle.checkResults: " + err);
            return false;
        }
    },
    /*jslint sub: false */

    nextTarget: function () {
        state.setItem('BattleTargetUpto', state.getItem('BattleTargetUpto', 0) + 1);
    },

    getTarget: function (mode) {
        try {
            var target     = '',
                targets    = [],
                battleUpto = '',
                targetType = '',
                targetRaid = '';

            targetType = config.getItem('TargetType', 'Freshmeat');
            targetRaid = state.getItem('targetFromraid', '');
            if (mode === 'DemiPoints') {
                if (targetRaid && targetType === 'Raid') {
                    return 'Raid';
                }

                return 'Freshmeat';
            }

            if (targetType === 'Raid') {
                if (targetRaid) {
                    return 'Raid';
                }

                caap.SetDivContent('battle_mess', 'No Raid To Attack');
                return 'NoRaid';
            }

            if (targetType === 'Freshmeat') {
                return 'Freshmeat';
            }

            target = state.getItem('BattleChainId', 0);
            if (target) {
                return target;
            }

            targets = utility.TextToArray(config.getItem('BattleTargets', ''));
            if (!targets.length) {
                return false;
            }

            battleUpto = state.getItem('BattleTargetUpto', 0);
            if (battleUpto > targets.length - 1) {
                battleUpto = 0;
                state.setItem('BattleTargetUpto', 0);
            }

            if (!targets[battleUpto]) {
                battle.nextTarget();
                return false;
            }

            caap.SetDivContent('battle_mess', 'Battling User ' + battleUpto + '/' + targets.length + ' ' + targets[battleUpto]);
            if ((targets[battleUpto] === '' || isNaN(targets[battleUpto]) ? targets[battleUpto].toLowerCase() : targets[battleUpto]) === 'raid') {
                if (targetRaid) {
                    return 'Raid';
                }

                caap.SetDivContent('battle_mess', 'No Raid To Attack');
                battle.nextTarget();
                return false;
            }

            return targets[battleUpto];
        } catch (err) {
            utility.error("ERROR in battle.getTarget: " + err);
            return false;
        }
    },

    click: function (battleButton, type) {
        try {
            state.setItem('ReleaseControl', true);
            battle.flagResult = true;
            state.setItem('clickUrl', 'http://apps.facebook.com/castle_age/' + (type === 'Raid' ? 'raid.php' : 'battle.php'));
            utility.Click(battleButton);
            return true;
        } catch (err) {
            utility.error("ERROR in battle.click: " + err);
            return false;
        }
    },

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    battles: {
        'Raid' : {
            'Invade'   : 'raid_attack_button.gif',
            'Duel'     : 'raid_attack_button2.gif',
            'regex1'   : new RegExp('[0-9]+\\. (.+)\\s*Rank: ([0-9]+) ([^0-9]+) ([0-9]+) ([^0-9]+) ([0-9]+)', 'i'),
            'refresh'  : 'raid',
            'image'    : 'tab_raid_on.gif'
        },
        'Freshmeat' : {
            'Invade'   : 'battle_01.gif',
            'Duel'     : 'battle_02.gif',
            'War'      : 'war_button_duel.gif',
            'regex1'   : new RegExp('(.+)\\s*\\(Level ([0-9]+)\\)\\s*Battle: ([A-Za-z ]+) \\(Rank ([0-9]+)\\)\\s*War: ([A-Za-z ]+) \\(Rank ([0-9]+)\\)\\s*([0-9]+)', 'i'),
            'regex2'   : new RegExp('(.+)\\s*\\(Level ([0-9]+)\\)\\s*Battle: ([A-Za-z ]+) \\(Rank ([0-9]+)\\)\\s*([0-9]+)', 'i'),
            'warLevel' : true,
            'refresh'  : 'battle_on.gif',
            'image'    : 'battle_on.gif'
        }
    },

    selectedDemisDone: function (force) {
        try {
            var demiPointsDone = true,
                it = 0;

            for (it = 0; it < 5; it += 1) {
                if (force || config.getItem('DemiPoint' + it, true)) {
                    if (caap.demi[caap.demiTable[it]]['daily']['dif'] > 0) {
                        demiPointsDone = false;
                        break;
                    }
                }
            }

            return demiPointsDone;
        } catch (err) {
            utility.error("ERROR in battle.selectedDemisDone: " + err);
            return undefined;
        }
    },

    freshmeat: function (type) {
        try {
            var inputDiv        = $(),
                plusOneSafe     = false,
                safeTargets     = [],
                chainId         = '',
                chainAttack     = false,
                inp             = $(),
                txt             = '',
                tempArr         = [],
                levelm          = [],
                minRank         = 0,
                maxLevel        = 0,
                ARBase          = 0,
                ARMax           = 0,
                ARMin           = 0,
                levelMultiplier = 0,
                armyRatio       = 0,
                tempRecord      = {},
                battleRecord    = {},
                tempTime        = 0,
                it              = 0,
                len             = 0,
                tr              = $(),
                form            = $(),
                firstId         = '',
                lastBattleID    = 0,
                engageButton    = null;

            utility.log(3, 'target img', battle.battles[type][config.getItem('BattleType', 'Invade')]);
            inputDiv = caap.appBodyDiv.find("input[src*='" + battle.battles[type][config.getItem('BattleType', 'Invade')] + "']");
            if (!inputDiv || !inputDiv.length) {
                utility.warn('Not on battlepage');
                utility.NavigateTo(caap.battlePage);
                return false;
            }

            chainId = state.getItem('BattleChainId', 0);
            state.setItem('BattleChainId', '');
            // Lets get our Freshmeat user settings
            minRank = config.getItem("FreshMeatMinRank", 99);
            utility.log(3, "FreshMeatMinRank", minRank);
            if (minRank === '' || isNaN(minRank)) {
                if (minRank !== '') {
                    utility.warn("FreshMeatMinRank is NaN, using default", 99);
                }

                minRank = 99;
            }

            maxLevel = gm.getItem("FreshMeatMaxLevel", 99999, hiddenVar);
            utility.log(3, "FreshMeatMaxLevel", maxLevel);
            if (maxLevel === '' || isNaN(maxLevel)) {
                maxLevel = 99999;
                utility.warn("FreshMeatMaxLevel is NaN, using default", maxLevel);
            }

            ARBase = config.getItem("FreshMeatARBase", 0.5);
            utility.log(3, "FreshMeatARBase", ARBase);
            if (ARBase === '' || isNaN(ARBase)) {
                ARBase = 0.5;
                utility.warn("FreshMeatARBase is NaN, using default", ARBase);
            }

            ARMax = gm.getItem("FreshMeatARMax", 99999, hiddenVar);
            utility.log(3, "FreshMeatARMax", ARMax);
            if (ARMax === '' || isNaN(ARMax)) {
                ARMax = 99999;
                utility.warn("FreshMeatARMax is NaN, using default", ARMax);
            }

            ARMin = gm.getItem("FreshMeatARMin", 0, hiddenVar);
            utility.log(3, "FreshMeatARMin", ARMin);
            if (ARMin === '' || isNaN(ARMin)) {
                ARMin = 0;
                utility.warn("FreshMeatARMin is NaN, using default", ARMin);
            }

            for (it = 0, len = inputDiv.length; it < len; it += 1) {
                tr = $();
                levelm = [];
                txt = '';
                tempArr = [];
                tempTime = -1;
                tempRecord = new battle.record();
                tempRecord.data['button'] = inputDiv.eq(it);
                if (type === 'Raid') {
                    tr = tempRecord.data['button'].parents().eq(4);
                    txt = tr.children().eq(1).text();
                    txt = txt ? txt.trim() : '';
                    levelm = battle.battles['Raid']['regex1'].exec(txt);
                    if (!levelm || !levelm.length) {
                        utility.warn("Can't match Raid regex in ", txt);
                        continue;
                    }

                    tempRecord.data['nameStr'] = levelm[1] ? levelm[1].trim() : '';
                    tempRecord.data['rankNum'] = levelm[2] ? levelm[2].parseInt() : 0;
                    tempRecord.data['rankStr'] = battle.battleRankTable[tempRecord.data['rankNum']];
                    tempRecord.data['levelNum'] = levelm[4] ? levelm[4].parseInt() : 0;
                    tempRecord.data['armyNum'] = levelm[6] ? levelm[6].parseInt() : 0;
                } else {
                    tr = tempRecord.data['button'].parents("tr").eq(0);
                    if (!tr || !tr.length) {
                        utility.warn("Can't find parent tr in", tempRecord.data['button']);
                        continue;
                    }

                    txt = tr.find("img[src*='symbol_']").attr("src");
                    if (txt) {
                        tempArr = txt.match(/(\d+)\.jpg/i);
                        if (tempArr && tempArr.length === 2) {
                            tempRecord.data['deityNum'] = tempArr[1] ? tempArr[1].parseInt() - 1: -1;
                            if (tempRecord.data['deityNum'] >= 0 && tempRecord.data['deityNum'] <= 4) {
                                tempRecord.data['deityStr'] = caap.demiTable[tempRecord.data['deityNum']];
                            } else {
                                utility.warn("Demi number is not between 0 and 4", tempRecord.data['deityNum']);
                                tempRecord.data['deityNum'] = 0;
                                tempRecord.data['deityStr'] = caap.demiTable[tempRecord.data['deityNum']];
                            }
                        } else {
                            utility.warn("Unable to match demi number in txt", txt);
                        }
                    } else {
                        utility.warn("Unable to find demi image in tr", tr);
                    }

                    // If looking for demi points, and already full, continue
                    if (config.getItem('DemiPointsFirst', false) && !state.getItem('DemiPointsDone', true) && (config.getItem('WhenMonster', 'Never') !== 'Never')) {
                        if (caap.demi[tempRecord.data['deityStr']]['daily']['dif'] <= 0 || !config.getItem('DemiPoint' + tempRecord.data['deityNum'], true)) {
                            utility.log(2, "Daily Demi Points done for", tempRecord.data['deityStr']);
                            continue;
                        }
                    } else if (config.getItem('WhenBattle', 'Never') === "Demi Points Only") {
                        if (caap.demi[tempRecord.data['deityStr']]['daily']['dif'] <= 0) {
                            utility.log(2, "Daily Demi Points done for", tempRecord.data['deityStr']);
                            continue;
                        }
                    }

                    txt = tr.text();
                    txt = txt ? txt.trim() : '';
                    if (txt === '') {
                        utility.warn("Can't find txt in tr");
                        continue;
                    }

                    if (battle.battles['Freshmeat']['warLevel']) {
                        levelm = battle.battles['Freshmeat']['regex1'].exec(txt);
                        if (!levelm) {
                            levelm = battle.battles['Freshmeat']['regex2'].exec(txt);
                            battle.battles['Freshmeat']['warLevel'] = false;
                        }
                    } else {
                        levelm = battle.battles['Freshmeat']['regex2'].exec(txt);
                        if (!levelm) {
                            levelm = battle.battles['Freshmeat']['regex1'].exec(txt);
                            battle.battles['Freshmeat']['warLevel'] = true;
                        }
                    }

                    if (!levelm) {
                        utility.warn("Can't match Freshmeat regex in ", txt);
                        continue;
                    }

                    tempRecord.data['nameStr'] = levelm[1] ? levelm[1].trim() : '';
                    tempRecord.data['levelNum'] = levelm[2] ? levelm[2].parseInt() : 0;
                    tempRecord.data['rankStr'] = levelm[3] ? levelm[3].trim() : '';
                    tempRecord.data['rankNum'] = levelm[4] ? levelm[4].parseInt() : 0;
                    if (battle.battles['Freshmeat']['warLevel']) {
                        tempRecord.data['warRankStr'] = levelm[5] ? levelm[5].trim() : '';
                        tempRecord.data['warRankNum'] = levelm[6] ? levelm[6].parseInt() : 0;
                    }

                    if (battle.battles['Freshmeat']['warLevel']) {
                        tempRecord.data['armyNum'] = levelm[7] ? levelm[7].parseInt() : 0;
                    } else {
                        tempRecord.data['armyNum'] = levelm[5] ? levelm[5].parseInt() : 0;
                    }
                }

                inp = tr.find("input[name='target_id']");
                if (!inp || !inp.length) {
                    utility.warn("Could not find 'target_id' input");
                    continue;
                }

                txt = inp.attr("value");
                tempRecord.data['userId'] = txt ? txt.parseInt() : 0;
                if (battle.hashCheck(tempRecord.data)) {
                    continue;
                }

                levelMultiplier = caap.stats['level'] / tempRecord.data['levelNum'];
                armyRatio = ARBase * levelMultiplier;
                armyRatio = Math.min(armyRatio, ARMax);
                armyRatio = Math.max(armyRatio, ARMin);
                if (armyRatio <= 0) {
                    utility.warn("Bad ratio", armyRatio, ARBase, ARMin, ARMax, levelMultiplier);
                    continue;
                }

                if (tempRecord.data['levelNum'] - caap.stats['level'] > maxLevel) {
                    utility.log(2, "Greater than maxLevel", {'levelDif': tempRecord.data['levelNum'] - caap.stats['level'], 'minRank': minRank});
                    continue;
                }

                if (config.getItem("BattleType", 'Invade') === "War" && battle.battles['Freshmeat']['warLevel']) {
                    if (caap.stats['rank']['war'] && (caap.stats['rank']['war'] - tempRecord.data['warRankNum'] > minRank)) {
                        utility.log(2, "Greater than war minRank", {'rankDif': caap.stats['rank']['war'] - tempRecord.data['rankNum'], 'minRank': minRank});
                        continue;
                    }
                } else {
                    if (caap.stats['rank']['battle'] && (caap.stats['rank']['battle'] - tempRecord.data['rankNum'] > minRank)) {
                        utility.log(2, "Greater than battle minRank", {'rankDif': caap.stats['rank']['battle'] - tempRecord.data['rankNum'], 'minRank': minRank});
                        continue;
                    }
                }

                // if we know our army size, and this one is larger than armyRatio, don't battle
                if (caap.stats['army']['capped'] && (tempRecord.data['armyNum'] > (caap.stats['army']['capped'] * armyRatio))) {
                    utility.log(2, "Greater than armyRatio", {'armyRatio': armyRatio.dp(2), 'armyNum': tempRecord.data['armyNum'], 'armyMax': (caap.stats['army']['capped'] * armyRatio).dp()});
                    continue;
                }

                if (config.getItem("BattleType", 'Invade') === "War" && battle.battles['Freshmeat']['warLevel']) {
                    utility.log(1, "ID: " + tempRecord.data['userId'].toString().rpad(" ", 15) +
                                " Level: " + tempRecord.data['levelNum'].toString().rpad(" ", 4) +
                                " War Rank: " + tempRecord.data['warRankNum'].toString().rpad(" ", 2) +
                                " Army: " + tempRecord.data['armyNum']);
                } else {
                    utility.log(1, "ID: " + tempRecord.data['userId'].toString().rpad(" ", 15) +
                                " Level: " + tempRecord.data['levelNum'].toString().rpad(" ", 4) +
                                " Battle Rank: " + tempRecord.data['rankNum'].toString().rpad(" ", 2) +
                                " Army: " + tempRecord.data['armyNum']);
                }

                // don't battle people we lost to in the last week
                battleRecord = battle.getItem(tempRecord.data['userId']);
                if (!config.getItem("IgnoreBattleLoss", false)) {
                    switch (config.getItem("BattleType", 'Invade')) {
                    case 'Invade' :
                        tempTime = battleRecord['invadeLostTime'] ? battleRecord['invadeLostTime'] : 0;
                        break;
                    case 'Duel' :
                        tempTime = battleRecord['duelLostTime'] ? battleRecord['duelLostTime'] : 0;
                        break;
                    case 'War' :
                        tempTime = battleRecord['warlostTime'] ? battleRecord['warlostTime'] : 0;
                        break;
                    default :
                        utility.warn("Battle type unknown!", config.getItem("BattleType", 'Invade'));
                    }

                    if (battleRecord && battleRecord['nameStr'] !== '' && !schedule.since(tempTime, 604800)) {
                        utility.log(1, "We lost " + config.getItem("BattleType", 'Invade') + " to this id this week: ", tempRecord.data['userId']);
                        continue;
                    }
                }

                // don't battle people that results were unknown in the last hour
                tempTime = battleRecord['unknownTime'] ? battleRecord['unknownTime'] : 0;
                if (battleRecord && battleRecord['nameStr'] !== '' && !schedule.since(tempTime, 3600)) {
                    utility.log(1, "User was battled but results unknown in the last hour: ", tempRecord.data['userId']);
                    continue;
                }

                // don't battle people that were dead or hiding in the last hour
                tempTime = battleRecord['deadTime'] ? battleRecord['deadTime']: 0;
                if (battleRecord && battleRecord['nameStr'] !== '' && !schedule.since(tempTime, 3600)) {
                    utility.log(1, "User was dead in the last hour: ", tempRecord.data['userId']);
                    continue;
                }

                // don't battle people we've already chained to max in the last 2 days
                tempTime = battleRecord['chainTime'] ? battleRecord['chainTime'] : 0;
                if (battleRecord && battleRecord['nameStr'] !== '' && !schedule.since(tempTime, 86400)) {
                    utility.log(1, "We chained user within 2 days: ", tempRecord.data['userId']);
                    continue;
                }

                // don't battle people that didn't meet chain gold or chain points in the last week
                tempTime = battleRecord['ignoreTime'] ? battleRecord['ignoreTime'] : 0;
                if (battleRecord && battleRecord['nameStr'] !== '' && !schedule.since(tempTime, 604800)) {
                    utility.log(1, "User didn't meet chain requirements this week: ", tempRecord.data['userId']);
                    continue;
                }

                tempRecord.data['score'] = (type === 'Raid' ? 0 : tempRecord.data['rankNum']) - (tempRecord.data['armyNum'] / levelMultiplier / caap.stats['army']['capped']);
                if (tempRecord.data['userId'] === chainId) {
                    chainAttack = true;
                }

                tempRecord.data['targetNumber'] = it + 1;
                utility.log(3, "tempRecord/levelm", tempRecord.data, levelm);
                safeTargets.push(tempRecord.data);
                tempRecord = null;
                if (it === 0 && type === 'Raid') {
                    plusOneSafe = true;
                }
            }

            safeTargets.sort(sort.by(true, "score"));
            utility.log(3, "safeTargets", safeTargets);
            if (safeTargets && safeTargets.length) {
                if (chainAttack) {
                    form = inputDiv.eq(0).parent().parent();
                    inp = form.find("input[name='target_id']");
                    if (inp && inp.length) {
                        inp.attr("value", chainId);
                        utility.log(1, "Chain attacking: ", chainId);
                        battle.click(inputDiv.eq(0).get(0), type);
                        state.setItem("lastBattleID", chainId);
                        caap.SetDivContent('battle_mess', 'Attacked: ' + state.getItem("lastBattleID", 0));
                        state.setItem("notSafeCount", 0);
                        return true;
                    }

                    utility.warn("Could not find 'target_id' input");
                } else if (config.getItem('PlusOneKills', false) && type === 'Raid') {
                    if (plusOneSafe) {
                        form = inputDiv.eq(0).parent().parent();
                        inp = form.find("input[name='target_id']");
                        if (inp && inp.length) {
                            txt = inp.attr("value");
                            firstId = txt ? txt.parseInt() : 0;
                            inp.attr("value", '200000000000001');
                            utility.log(1, "Target ID Overriden For +1 Kill. Expected Defender: ", firstId);
                            battle.click(inputDiv.eq(0).get(0), type);
                            state.setItem("lastBattleID", firstId);
                            caap.SetDivContent('battle_mess', 'Attacked: ' + state.getItem("lastBattleID", 0));
                            state.setItem("notSafeCount", 0);
                            return true;
                        }

                        utility.warn("Could not find 'target_id' input");
                    } else {
                        utility.log(1, "Not safe for +1 kill.");
                    }
                } else {
                    lastBattleID = state.getItem("lastBattleID", 0);
                    for (it = 0, len = safeTargets.length; it < len; it += 1) {
                        if (!lastBattleID && lastBattleID === safeTargets[it]['id']) {
                            continue;
                        }

                        if (safeTargets[it]['button'] !== null || safeTargets[it]['button'] !== undefined) {
                            utility.log(2, 'Found Target score: ' + safeTargets[it]['score'].dp(2) + ' id: ' + safeTargets[it]['userId'] + ' Number: ' + safeTargets[it]['targetNumber']);
                            battle.click(safeTargets[it]['button'].get(0), type);
                            delete safeTargets[it]['score'];
                            delete safeTargets[it]['targetNumber'];
                            delete safeTargets[it]['button'];
                            state.setItem("lastBattleID", safeTargets[it]['userId']);
                            safeTargets[it]['aliveTime'] = new Date().getTime();
                            battleRecord = battle.getItem(safeTargets[it]['userId']);
                            $.extend(true, battleRecord, safeTargets[it]);
                            utility.log(3, "battleRecord", battleRecord);
                            battle.setItem(battleRecord);
                            caap.SetDivContent('battle_mess', 'Attacked: ' + lastBattleID);
                            state.setItem("notSafeCount", 0);
                            return true;
                        }

                        utility.warn('Attack button is null');
                    }
                }
            }

            state.setItem("notSafeCount", state.getItem("notSafeCount", 0) + 1);
            // add a schedule here for 5 mins or so
            if (state.getItem("notSafeCount", 0) > 100) {
                caap.SetDivContent('battle_mess', 'Leaving Battle. Will Return Soon.');
                utility.log(1, 'No safe targets limit reached. Releasing control for other processes: ', state.getItem("notSafeCount", 0));
                state.setItem("notSafeCount", 0);
                return false;
            }

            caap.SetDivContent('battle_mess', 'No targets matching criteria');
            utility.log(1, 'No safe targets: ', state.getItem("notSafeCount", 0));

            if (type === 'Raid') {
                engageButton = monster.engageButtons[state.getItem('targetFromraid', '')];
                if (state.getItem("page", '') === 'raid' && engageButton) {
                    utility.Click(engageButton);
                } else {
                    schedule.setItem("RaidNoTargetDelay", gm.getItem("RaidNoTargetDelay", 45, hiddenVar));
                    utility.NavigateTo(caap.battlePage + ',raid');
                }
            } else {
                utility.NavigateTo(caap.battlePage + ',battle_on.gif');
            }

            return true;
        } catch (err) {
            utility.error("ERROR in battle.freshmeat: " + err);
            return false;
        }
    }
    /*jslint sub: false */
};
