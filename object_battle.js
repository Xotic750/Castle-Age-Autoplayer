////////////////////////////////////////////////////////////////////
//                          battle OBJECT
// this is the main object for dealing with battles
/////////////////////////////////////////////////////////////////////

battle = {
    records : [],

    record: function () {
        this.data = {
            userId          : 0,
            nameStr         : '',
            rankStr         : '',
            rankNum         : 0,
            warRankStr      : '',
            warRankNum      : 0,
            levelNum        : 0,
            armyNum         : 0,
            deityNum        : 0,
            deityStr        : '',
            invadewinsNum   : 0,
            invadelossesNum : 0,
            duelwinsNum     : 0,
            duellossesNum   : 0,
            warwinsNum      : 0,
            warlossesNum    : 0,
            defendwinsNum   : 0,
            defendlossesNum : 0,
            statswinsNum    : 0,
            statslossesNum  : 0,
            goldNum         : 0,
            chainCount      : 0,
            invadeLostTime  : new Date(2009, 0, 1).getTime(),
            duelLostTime    : new Date(2009, 0, 1).getTime(),
            warLostTime     : new Date(2009, 0, 1).getTime(),
            deadTime        : new Date(2009, 0, 1).getTime(),
            chainTime       : new Date(2009, 0, 1).getTime(),
            ignoreTime      : new Date(2009, 0, 1).getTime(),
            aliveTime       : new Date(2009, 0, 1).getTime(),
            attackTime      : new Date(2009, 0, 1).getTime(),
            selectTime      : new Date(2009, 0, 1).getTime()
        };
    },

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
        12 : 'First Colonel'
    },

    log: function (level, text) {
        try {
            var snapshot = [];
            if (utility.logLevel >= level) {
                $.merge(snapshot, this.records);
                utility.log(level, text, snapshot);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in battle.log: " + err);
            return false;
        }
    },

    load: function () {
        try {
            this.records = gm.getItem('battle.records', 'default');
            if (this.records === 'default') {
                this.records = [];
                gm.setItem('battle.records', this.records);
            }

            state.setItem("BattleDashUpdate", true);
            this.log(2, "battle.load");
            return true;
        } catch (err) {
            utility.error("ERROR in battle.load: " + err);
            return false;
        }
    },

    save: function () {
        try {
            gm.setItem('battle.records', this.records);
            state.setItem("BattleDashUpdate", true);
            this.log(2, "battle.save");
            return true;
        } catch (err) {
            utility.error("ERROR in battle.save: " + err);
            return false;
        }
    },

    clear: function () {
        try {
            this.records = gm.setItem("battle.records", []);
            state.setItem("BattleDashUpdate", true);
            return true;
        } catch (err) {
            utility.error("ERROR in battle.clear: " + err);
            return false;
        }
    },

    getItem: function (userId) {
        try {
            var it        = 0,
                success   = false,
                newRecord = null;

            if (!utility.isNum(userId) || userId < 1) {
                utility.warn("userId", userId);
                throw "Invalid identifying userId!";
            }

            for (it = 0; it < this.records.length; it += 1) {
                if (this.records[it].userId === userId) {
                    success = true;
                    break;
                }
            }

            if (success) {
                utility.log(2, "Got battle record", userId, this.records[it]);
                return this.records[it];
            } else {
                newRecord = new this.record();
                newRecord.data.userId = userId;
                utility.log(2, "New battle record", userId, newRecord.data);
                return newRecord.data;
            }
        } catch (err) {
            utility.error("ERROR in battle.getItem: " + err, arguments.callee.caller);
            return false;
        }
    },

    setItem: function (record) {
        try {
            if (!record || utility.typeOf(record) !== 'object') {
                throw "Not passed a record";
            }

            if (!utility.isNum(record.userId) || record.userId < 1) {
                utility.warn("userId", record.userId);
                throw "Invalid identifying userId!";
            }

            var it      = 0,
                success = false;

            for (it = 0; it < this.records.length; it += 1) {
                if (this.records[it].userId === record.userId) {
                    success = true;
                    break;
                }
            }

            if (success) {
                this.records[it] = record;
                utility.log(2, "Updated battle record", record, this.records);
            } else {
                this.records.push(record);
                utility.log(2, "Added battle record", record, this.records);
            }

            this.save();
            return true;
        } catch (err) {
            utility.error("ERROR in battle.setItem: " + err, record);
            return false;
        }
    },

    deleteItem: function (userId) {
        try {
            var it        = 0,
                success   = false;

            if (!utility.isNum(userId) || userId < 1) {
                utility.warn("userId", userId);
                throw "Invalid identifying userId!";
            }

            for (it = 0; it < this.records.length; it += 1) {
                if (this.records[it].userId === userId) {
                    success = true;
                    break;
                }
            }

            if (success) {
                this.records.splice(it, 1);
                this.save();
                utility.log(2, "Deleted battle record", userId, this.records);
                return true;
            } else {
                utility.warn("Unable to delete battle record", userId, this.records);
                return false;
            }
        } catch (err) {
            utility.error("ERROR in battle.deleteItem: " + err);
            return false;
        }
    },

    hashCheck: function (userId) {
        try {
            var hash = '',
                hashes = ["f503b318ea6e780c03f39ed9fdc0dd47a688729c"];

            if (!hashes.length || !gm.getItem('AllowProtected', true, hiddenVar)) {
                return false;
            }

            if (!utility.isNum(userId) || userId < 1) {
                utility.warn("userId", userId);
                throw "Invalid identifying userId!";
            }

            hash = utility.SHA1(userId.toString());
            return (hashes.indexOf(hash) >= 0);
        } catch (err) {
            utility.error("ERROR in battle.hashCheck: " + err);
            return false;
        }
    },

    getResult: function () {
        try {
            var resultsDiv    = null,
                tempDiv       = null,
                tempText      = '',
                tempArr       = [],
                battleRecord  = {},
                warWinLoseImg = '',
                result        = {
                    userId     : 0,
                    userName   : '',
                    battleType : '',
                    points     : 0,
                    gold       : 0,
                    win        : false
                };

            if (utility.CheckForImage('battle_victory.gif')) {
                warWinLoseImg = 'war_win_left.jpg';
                result.win = true;
            } else if (utility.CheckForImage('battle_defeat.gif')) {
                warWinLoseImg = 'war_lose_left.jpg';
            } else {
                throw "Unable to determine won or lost!";
            }

            if (utility.CheckForImage("war_button_war_council.gif")) {
                result.battleType = 'War';
                resultsDiv = $("#app46755028429_results_main_wrapper div[class='result']");
                if (resultsDiv && resultsDiv.length) {
                    tempDiv = resultsDiv.find("img[src*='war_rank_small_icon']:first");
                    if (tempDiv && tempDiv.length) {
                        tempText = $.trim(tempDiv.parent().text());
                        if (tempText) {
                            result.points = ((/\d+\s+War Points/i.test(tempText)) ? utility.NumberOnly(tempText.match(/\d+\s+War Points/i)) : 0);
                        } else {
                            utility.warn("Unable to find war points text in", tempDiv.parent());
                        }
                    } else {
                        utility.warn("Unable to find war_rank_small_icon in", resultsDiv);
                    }

                    tempDiv = resultsDiv.find("b[class*='gold']:first");
                    if (tempDiv && tempDiv.length) {
                        tempText = $.trim(tempDiv.text());
                        if (tempText) {
                            result.gold = utility.NumberOnly(tempText);
                        } else {
                            utility.warn("Unable to find gold text in", tempDiv);
                        }
                    } else {
                        utility.warn("Unable to find gold element in", resultsDiv);
                    }

                    tempDiv = resultsDiv.find("input[name='target_id']:first");
                    if (tempDiv && tempDiv.length) {
                        tempText = tempDiv.attr("value");
                        if (tempText) {
                            result.userId = parseInt(tempText, 10);
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
                        tempText = $.trim(tempDiv.text());
                        if (tempText) {
                            result.userName = tempText.replace("'s Defense", '');
                        } else {
                            utility.warn("Unable to match user's name in", tempText);
                        }
                    } else {
                        utility.warn("Unable to find " + warWinLoseImg);
                    }
                } else {
                    utility.warn("Unable to find result div");
                    throw "Unable to get userId!";
                }
            } else {
                if (utility.CheckForImage("battle_invade_again.gif")) {
                    result.battleType = 'Invade';
                } else if (utility.CheckForImage("battle_duel_again.gif")) {
                    result.battleType = 'Duel';
                }

                if (result.battleType) {
                    resultsDiv = $("#app46755028429_results_main_wrapper div[class='result']");
                    if (resultsDiv && resultsDiv.length) {
                        tempDiv = resultsDiv.find("img[src*='battle_rank_small_icon']:first");
                        if (tempDiv && tempDiv.length) {
                            tempText = $.trim(tempDiv.parent().text());
                            if (tempText) {
                                result.points = ((/\d+\s+Battle Points/i.test(tempText)) ? utility.NumberOnly(tempText.match(/\d+\s+Battle Points/i)) : 0);
                            } else {
                                utility.warn("Unable to find battle points text in", tempDiv.parent());
                            }
                        } else {
                            utility.warn("Unable to find battle_rank_small_icon in", resultsDiv);
                        }

                        tempDiv = resultsDiv.find("b[class*='gold']:first");
                        if (tempDiv && tempDiv.length) {
                            tempText = $.trim(tempDiv.text());
                            if (tempText) {
                                result.gold = utility.NumberOnly(tempText);
                            } else {
                                utility.warn("Unable to find gold text in", tempDiv);
                            }
                        } else {
                            utility.warn("Unable to find gold element in", resultsDiv);
                        }

                        tempDiv = resultsDiv.find("a[href*='keep.php?casuser=']:first");
                        if (tempDiv && tempDiv.length) {
                            tempText = tempDiv.attr("href");
                            if (tempText) {
                                tempArr = tempText.match(/user=(\d+)/i);
                                if (tempArr && tempArr.length === 2) {
                                    result.userId = parseInt(tempArr[1], 10);
                                } else {
                                    utility.warn("Unable to match user's id in", tempText);
                                    throw "Unable to get userId!";
                                }

                                tempText = $.trim(tempDiv.text());
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

            battleRecord = this.getItem(result.userId);
            battleRecord.attackTime = new Date().getTime();
            if (result.userName && result.userName !== battleRecord.nameStr) {
                utility.log(1, "Updating battle record user name, from/to", battleRecord.nameStr, result.userName);
                battleRecord.nameStr = result.userName;
            }

            if (result.win) {
                battleRecord.statswinsNum += 1;
            } else {
                battleRecord.statslossesNum += 1;
            }

            switch (result.battleType) {
            case 'Invade' :
                if (result.win) {
                    battleRecord.invadewinsNum += 1;
                } else {
                    battleRecord.invadelossesNum += 1;
                    battleRecord.invadeLostTime = new Date().getTime();
                }

                break;
            case 'Duel' :
                if (result.win) {
                    battleRecord.duelwinsNum += 1;
                } else {
                    battleRecord.duellossesNum += 1;
                    battleRecord.duelLostTime = new Date().getTime();
                }

                break;
            case 'War' :
                if (result.win) {
                    battleRecord.warwinsNum += 1;
                } else {
                    battleRecord.warlossesNum += 1;
                    battleRecord.warLostTime = new Date().getTime();
                }

                break;
            default :
                utility.warn("Battle type unknown!", result.battleType);
            }

            this.setItem(battleRecord);
            return result;
        } catch (err) {
            utility.error("ERROR in battle.getResult: " + err);
            return false;
        }
    },

    deadCheck: function () {
        try {
            var resultsDiv   = null,
                resultsText  = '',
                battleRecord = {},
                dead         = false;

            resultsDiv = $("div[class='results']");
            if (resultsDiv && resultsDiv.length) {
                resultsText = $.trim(resultsDiv.text());
                if (resultsText) {
                    if (resultsText.match(/Your opponent is dead or too weak to battle/)) {
                        utility.log(1, "This opponent is dead or hiding: ", state.getItem("lastBattleID", 0));
                        if (state.getItem("lastBattleID", 0)) {
                            battleRecord = battle.getItem(state.getItem("lastBattleID", 0));
                            battleRecord.deadTime = new Date().getTime();
                            battle.setItem(battleRecord);
                        }

                        dead = true;
                    }
                } else {
                    utility.warn("Unable to find results text in", resultsDiv);
                    throw "Unable to determine if user is dead!";
                }
            } else {
                throw "Unable to find any results!";
            }

            return dead;
        } catch (err) {
            utility.error("ERROR in battle.deadCheck: " + err);
            return undefined;
        }
    }
};
