/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true, sub: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,gm,hiddenVar,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,battle,conquest,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          CONQUEST OBJECT
// this is the main object for dealing with Conquest
/////////////////////////////////////////////////////////////////////

(function() {
    "use strict";

    conquest.records = [];

    conquest.targets = {};

    conquest.record = function() {
        this.data = {
            'userId': 0,
            'nameStr': '',
            'rankNum': 0,
            'levelNum': 0,
            'armyNum': 0,
            'invadewinsNum': 0,
            'invadelossesNum': 0,
            'ibp': 0,
            'duelwinsNum': 0,
            'duellossesNum': 0,
            'dbp': 0,
            'goldNum': 0,
            'chainCount': 0,
            'invadeLostTime': 0,
            'duelLostTime': 0,
            'deadTime': 0,
            'chainTime': 0,
            'ignoreTime': 0,
            'aliveTime': 0,
            'attackTime': 0,
            'selectTime': 0,
            'unknownTime': 0,
            'newRecord': true
        };
    };

    conquest.conquestRankTier = function(points) {
        var tier = 0;

        if (points >= 50000) {
            tier = 18;
        } else if (points >= 43000) {
            tier = 17;
        } else if (points >= 37000) {
            tier = 16;
        } else if (points >= 32500) {
            tier = 15;
        } else if (points >= 27000) {
            tier = 14;
        } else if (points >= 22500) {
            tier = 13;
        } else if (points >= 19500) {
            tier = 12;
        } else if (points >= 14000) {
            tier = 11;
        } else if (points >= 10000) {
            tier = 10;
        } else if (points >= 7500) {
            tier = 9;
        } else if (points >= 5000) {
            tier = 8;
        } else if (points >= 3000) {
            tier = 7;
        } else if (points >= 2000) {
            tier = 6;
        } else if (points >= 1200) {
            tier = 5;
        } else if (points >= 700) {
            tier = 4;
        } else if (points >= 450) {
            tier = 3;
        } else if (points >= 250) {
            tier = 2;
        } else if (points >= 100) {
            tier = 1;
        }

        return tier;
    };

    conquest.conquestRankTable = {
        0: 'Grunt',
        1: 'Scout',
        2: 'Soldier',
        3: 'Elite Soldier',
        4: 'Squire',
        5: 'Night',
        6: 'First Night',
        7: 'Legionnaire',
        8: 'Centurian',
        9: 'Champion',
        10: 'Lt Commander',
        11: 'Commander',
        12: 'High Commander',
        13: 'Lieutenant General',
        14: 'General',
        15: 'High General',
        16: 'Baron',
        17: 'Earl',
        18: 'Duke'
    };

    conquest.hbest = 2;

    conquest.load = function() {
        try {
            conquest.records = gm.getItem('conquest.records', 'default');
            if (conquest.records === 'default' || !$j.isArray(conquest.records)) {
                conquest.records = gm.setItem('conquest.records', []);
            }

            conquest.hbest = conquest.hbest === false ? JSON.hbest(conquest.records) : conquest.hbest;
            con.log(1, "conquest.load Hbest", conquest.hbest);
            session.setItem("conquestDashUpdate", true);
            con.log(1, "conquest.load", conquest.records);
            return true;
        } catch (err) {
            con.error("ERROR in conquest.load: " + err);
            return false;
        }
    };

    conquest.save = function(src) {
        try {
            var compress = false;

            if (caap.domain.which === 3) {
                caap.messaging.setItem('conquest.records', conquest.records);
            } else {
                gm.setItem('conquest.records', conquest.records, conquest.hbest, compress);
                con.log(1, "conquest.save", conquest.records);
                if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif") && src !== "caapif") {
                    caap.messaging.setItem('conquest.records', conquest.records);
                }
            }

            if (caap.domain.which !== 0) {
                session.setItem("conquestDashUpdate", true);
            }

            return true;
        } catch (err) {
            con.error("ERROR in conquest.save: " + err);
            return false;
        }
    };

    conquest.clear = function() {
        try {
            conquest.records = [];
            conquest.save();
            session.setItem("conquestDashUpdate", true);
            return true;
        } catch (err) {
            con.error("ERROR in conquest.clear: " + err);
            return false;
        }
    };

    conquest.getItem = function(userId) {
        try {
            var it = 0,
                len = 0,
                success = false,
                newRecord = null;

            if (userId === '' || $u.isNaN(userId) || userId < 1) {
                con.warn("userId", userId);
                throw "Invalid identifying userId!";
            }

            for (it = 0, len = conquest.records.length; it < len; it += 1) {
                if (conquest.records[it]['userId'] === userId) {
                    success = true;
                    break;
                }
            }

            if (success) {
                con.log(1, "Got conquest record", userId, conquest.records[it]);
                conquest.records[it]['newRecord'] = false;
                return conquest.records[it];
            }

            newRecord = new conquest.record();
            newRecord.data['userId'] = userId;
            con.log(2, "New conquest record", userId, newRecord.data);
            return newRecord.data;
        } catch (err) {
            con.error("ERROR in conquest.getItem: " + err);
            return false;
        }
    };

    conquest.setItem = function(record) {
        try {
            if (!record || !$j.isPlainObject(record)) {
                throw "Not passed a record";
            }

            if (record['userId'] === '' || $u.isNaN(record['userId']) || record['userId'] < 1) {
                con.warn("userId", record['userId']);
                throw "Invalid identifying userId!";
            }

            var it = 0,
                len = 0,
                success = false;

            for (it = 0, len = conquest.records.length; it < len; it += 1) {
                if (conquest.records[it]['userId'] === record['userId']) {
                    success = true;
                    break;
                }
            }

            record['newRecord'] = false;
            if (success) {
                conquest.records[it] = record;
                con.log(1, "Updated conquest record", record, conquest.records);
            } else {
                conquest.records.push(record);
                con.log(1, "Added conquest record", record, conquest.records);
            }

            conquest.save();
            return true;
        } catch (err) {
            con.error("ERROR in conquest.setItem: " + err, record);
            return false;
        }
    };

    conquest.deleteItem = function(userId) {
        try {
            var it = 0,
                len = 0,
                success = false;

            if (userId === '' || $u.isNaN(userId) || userId < 1) {
                con.warn("userId", userId);
                throw "Invalid identifying userId!";
            }

            for (it = 0, len = conquest.records.length; it < len; it += 1) {
                if (conquest.records[it]['userId'] === userId) {
                    success = true;
                    break;
                }
            }

            if (success) {
                conquest.records.splice(it, 1);
                conquest.save();
                con.log(1, "Deleted conquest record", userId, conquest.records);
                return true;
            }

            con.warn("Unable to delete conquest record", userId, conquest.records);
            return false;
        } catch (err) {
            con.error("ERROR in conquest.deleteItem: " + err);
            return false;
        }
    };

    conquest.hashCheck = function(record) {
        try {
            var hash = '',
                hashes = [
                    "3f56e5f147545c2069f615aa2ebc80d2eef34d48",
                    "8caeb4b385c1257419ee18dee47cfa3a1271ba77",
                    "02752cf4b979dd5a77b53694917a60f944cb772f",
                    "c644f2fdcf1a7d721b82efab5313df609442c4f9",
                    "8d29caf6400807789964185405b0f442e6cacae7",
                    "7f04c6d6d1110ce05532ca508efde5dbafe7ec17"
                ];

            if (!hashes.length || !(gm ? gm.getItem('AllowProtected', true, hiddenVar) : true)) {
                return false;
            }

            if (record['userId'] === '' || $u.isNaN(record['userId']) || record['userId'] < 1) {
                con.warn("userId", record);
                throw "Invalid identifying userId!";
            }

            hash = (record['userId'].toString().SHA1() + record['nameStr']).SHA1();
            return (hashes.hasIndexOf(hash));
        } catch (err) {
            con.error("ERROR in conquest.hashCheck: " + err);
            return false;
        }
    };

    conquest.flagResult = false;

    conquest.getResult = function() {
        try {
            var tempDiv = $j(),
                tempText = '',
                tNum = 0,
                conquestRecord = {},
                warWinLoseImg = '',
                result = {
                    userId: 0,
                    userName: '',
                    conquestType: '',
                    points: 0,
                    gold: 0,
                    win: false,
                    hiding: false,
                    unknown: false
                };

            if ($u.hasContent($j("#app_body #results_main_wrapper img[src*='conquest_victory.gif']"))) {
                warWinLoseImg = 'war_win_left.jpg';
                result.win = true;
            } else if ($u.hasContent($j("#app_body #results_main_wrapper img[src*='conquest_defeat.gif']"))) {
                warWinLoseImg = 'war_lose_left.jpg';
            } else {
                if ($u.hasContent($j("#app_body #results_main_wrapper"))) {
                    if (/Your opponent is hiding, please try again/.test(caap.resultsText)) {
                        result.hiding = true;
                        con.log(1, "Your opponent is hiding");
                        tempDiv = null;
                        return result;
                    }

                    result.unknown = true;
                    con.warn("Unable to determine won, lost or hiding!", caap.resultsText);
                    tempDiv = null;
                    return result;
                }

                result.unknown = true;
                con.warn("Unable to determine won or lost!");
                tempDiv = null;
                return result;
            }

            if ($u.hasContent($j("#app_body #results_main_wrapper img[src*='war_castle.jpg']"))) {
                result.conquestType = 'War';
                if ($u.hasContent($j("#app_body #results_main_wrapper"))) {
                    tempDiv = $j("#app_body #results_main_wrapper img[src*='war_rank_small_icon']").eq(0);
                    if ($u.hasContent(tempDiv)) {
                        tempText = $u.setContent(tempDiv.parent().text(), '').trim().innerTrim();
                        if ($u.hasContent(tempText)) {
                            tNum = tempText.regex(/(\d+)\s+War Points/i);
                            if ($u.hasContent(tNum)) {
                                result.points = tNum;
                            } else {
                                con.warn("Unable to match war points", tempText);
                            }
                        } else {
                            con.warn("Unable to find war points text");
                        }
                    } else {
                        con.log(1, "Unable to find war_rank_small_icon");
                    }

                    tempDiv = $j("#app_body #results_main_wrapper b[class*='gold']").eq(0);
                    if ($u.hasContent(tempDiv)) {
                        tNum = $u.setContent(tempDiv.text(), '').trim().numberOnly();
                        if ($u.hasContent(tNum)) {
                            result.gold = tNum;
                        } else {
                            con.warn("Unable to find gold text");
                        }
                    } else {
                        con.warn("Unable to find gold element");
                    }

                    tempDiv = $j("#app_body #results_main_wrapper form[id*='fight_opp_'] input[name='target_id']").eq(0);
                    if ($u.hasContent(tempDiv)) {
                        tNum = $u.setContent(tempDiv.attr("value"), '0').parseInt();
                        if ($u.hasContent(tNum) && tNum > 0) {
                            result.userId = tNum;
                        } else {
                            con.warn("No value in tempDiv");
                            tempDiv = null;
                            throw "Unable to get userId!";
                        }
                    } else {
                        con.warn("Unable to find target_id in $j('#app_body #results_main_wrapper')");
                        tempDiv = null;
                        throw "Unable to get userId!";
                    }

                    tempDiv = $j("#app_body #results_main_wrapper div[style*='" + warWinLoseImg + "']");
                    if ($u.hasContent(tempDiv)) {
                        tempText = $u.setContent(tempDiv.text(), '').trim().replace("'s Defense", '');
                        if ($u.hasContent(tempText)) {
                            result.userName = tempText;
                        } else {
                            con.warn("Unable to match user's name in", tempText);
                        }
                    } else {
                        con.warn("Unable to find ", warWinLoseImg);
                    }
                } else {
                    con.warn("Unable to find result div");
                    tempDiv = null;
                    throw "Unable to get userId!";
                }
            } else {
                if ($u.hasContent($j("#app_body #results_main_wrapper input[src*='conquest_invade_again.gif']"))) {
                    result.conquestType = 'Invade';
                } else if ($u.hasContent($j("#app_body #results_main_wrapper input[src*='conquest_duel_again.gif']"))) {
                    result.conquestType = 'Duel';
                } else {
                    if ($u.hasContent($j("#app_body #results_main_wrapper img[src*='icon_weapon.gif']"))) {
                        result.conquestType = 'Duel';
                    } else if ($u.hasContent($j("#app_body #results_main_wrapper div[class='full_invade_results']"))) {
                        result.conquestType = 'Invade';
                    }
                }

                if ($u.hasContent(result.conquestType)) {
                    if ($u.hasContent($j("#app_body #results_main_wrapper"))) {
                        tempDiv = $j("#app_body #results_main_wrapper img[src*='conquest_rank_small_icon']").eq(0);
                        if ($u.hasContent(tempDiv)) {
                            tempText = $u.setContent(tempDiv.parent().parent().text(), '').trim().innerTrim();
                            if ($u.hasContent(tempText)) {
                                tNum = tempText.regex(/(\d+)\s+Conquest Points/i);
                                if ($u.hasContent(tNum)) {
                                    result.points = tNum;
                                } else {
                                    con.warn("Unable to match conquest points", tempText);
                                }
                            } else {
                                con.warn("Unable to find conquest points text in tempDiv.parent().parent()");
                            }
                        } else {
                            con.log(1, "Unable to find conquest_rank_small_icon in $j('#app_body #results_main_wrapper')");
                        }

                        tempDiv = $j("#app_body #results_main_wrapper b[class*='gold']").eq(0);
                        if ($u.hasContent(tempDiv)) {
                            tNum = $u.setContent(tempDiv.text(), '').trim().numberOnly();
                            if ($u.hasContent(tNum)) {
                                result.gold = tNum;
                            } else {
                                con.warn("Unable to find gold text in tempDiv");
                            }
                        } else {
                            con.warn("Unable to find gold element in $j('#app_body #results_main_wrapper')");
                        }

                        tempDiv = $j("#app_body #results_main_wrapper a[href*='keep.php?casuser=']").eq(0);
                        if ($u.hasContent(tempDiv)) {
                            tempText = $u.setContent(tempDiv.attr("href"), '');
                            if ($u.hasContent(tempText)) {
                                tNum = tempText.regex(/user=(\d+)/i);
                                if ($u.hasContent(tNum)) {
                                    result.userId = tNum;
                                } else {
                                    con.warn("Unable to match user's id in", tempText);
                                    tempDiv = null;
                                    throw "Unable to get userId!";
                                }

                                tempText = $u.setContent(tempDiv.text(), '').trim();
                                if ($u.hasContent(tempText)) {
                                    result.userName = tempText;
                                } else {
                                    con.warn("Unable to match user's name in", tempText);
                                }
                            } else {
                                con.warn("No href text in tempDiv");
                                tempDiv = null;
                                throw "Unable to get userId!";
                            }
                        } else {
                            con.warn("Unable to find keep.php?casuser= $j('#app_body #results_main_wrapper')");
                            tempDiv = null;
                            throw "Unable to get userId!";
                        }
                    } else {
                        con.warn("Unable to find result div");
                        tempDiv = null;
                        throw "Unable to get userId!";
                    }
                } else {
                    con.warn("Unable to determine conquest type");
                    tempDiv = null;
                    throw "Unable to get userId!";
                }
            }

            conquestRecord = conquest.getItem(result.userId);
            conquestRecord['attackTime'] = Date.now();
            if (result.userName && result.userName !== conquestRecord['nameStr']) {
                con.log(1, "Updating conquest record user name, from/to", conquestRecord['nameStr'], result.userName);
                conquestRecord['nameStr'] = result.userName;
            }

            if (result.win) {
                conquestRecord['statswinsNum'] += 1;
            } else {
                conquestRecord['statslossesNum'] += 1;
            }

            switch (result.conquestType) {
            case 'Invade':
                if (result.win) {
                    conquestRecord['invadewinsNum'] += 1;
                    conquestRecord['ibp'] += result.points;
                } else {
                    conquestRecord['invadelossesNum'] += 1;
                    conquestRecord['ibp'] -= result.points;
                    conquestRecord['invadeLostTime'] = Date.now();
                }

                break;
            case 'Duel':
                if (result.win) {
                    conquestRecord['duelwinsNum'] += 1;
                    conquestRecord['dbp'] += result.points;
                } else {
                    conquestRecord['duellossesNum'] += 1;
                    conquestRecord['dbp'] -= result.points;
                    conquestRecord['duelLostTime'] = Date.now();
                }

                break;
            default:
                con.warn("Conquest type unknown!", result.conquestType);
            }

            conquest.setItem(conquestRecord);
            tempDiv = null;
            return result;
        } catch (err) {
            con.error("ERROR in conquest.getResult: " + err);
            return false;
        }
    };

    conquest.deadCheck = function() {
        try {
            var conquestRecord = {},
                dead = false;

            if (state.getItem("lastConquestID", 0)) {
                conquestRecord = conquest.getItem(state.getItem("lastConquestID", 0));
            }

            if ($u.hasContent($j("#app_body #results_main_wrapper"))) {
                if ($u.hasContent(caap.resultsText)) {
                    if (/Your opponent is dead or too weak to conquest/.test(caap.resultsText)) {
                        con.log(1, "This opponent is dead or hiding: ", state.getItem("lastConquestID", 0));
                        if ($j.isPlainObject(conquestRecord) && !$j.isEmptyObject(conquestRecord)) {
                            conquestRecord['deadTime'] = Date.now();
                        }

                        dead = true;
                    }
                } else {
                    if ($j.isPlainObject(conquestRecord) && !$j.isEmptyObject(conquestRecord)) {
                        conquestRecord['unknownTime'] = Date.now();
                    }

                    con.warn("Unable to determine if user is dead!");
                    dead = null;
                }
            } else {
                if ($j.isPlainObject(conquestRecord) && !$j.isEmptyObject(conquestRecord)) {
                    conquestRecord['unknownTime'] = Date.now();
                }

                con.warn("Unable to find any results!");
                dead = null;
            }

            if (dead !== false && $j.isPlainObject(conquestRecord) && !$j.isEmptyObject(conquestRecord)) {
                conquest.setItem(conquestRecord);
            }

            return dead;
        } catch (err) {
            con.error("ERROR in conquest.deadCheck: " + err);
            return undefined;
        }
    };

    conquest.checkResults = function() {
        try {
            var conquestRecord = {},
                tempTime = 0,
                chainBP = 0,
                maxChains = 0,
                result = {};

            if (!conquest.flagResult) {
                return true;
            }

            con.log(1, "Checking Conquest Results");
            conquest.flagResult = false;
            state.setItem("ConquestChainId", 0);
            if (conquest.deadCheck() !== false) {
                return true;
            }

            result = conquest.getResult();
            if (!result || result.hiding === true) {
                return true;
            }

            if (result.unknown === true) {
                if (state.getItem("lastConquestID", 0)) {
                    conquestRecord = conquest.getItem(state.getItem("lastConquestID", 0));
                    conquestRecord['unknownTime'] = Date.now();
                    conquest.setItem(conquestRecord);
                }

                return true;
            }

            conquestRecord = conquest.getItem(result.userId);
            if (result.win) {
                con.log(1, "We Defeated ", result.userName, "Conquest Points: " + result.points + ", Gold: " + result.gold);
                //Test if we should chain this guy
                tempTime = $u.setContent(conquestRecord['chainTime'], 0);
                chainBP = config.getItem('ChainBP', '');
                if (schedule.since(tempTime, 86400) && ((chainBP !== '' && !$u.isNaN(chainBP) && chainBP >= 0))) {
                    if (chainBP !== '' && !$u.isNaN(chainBP) && chainBP >= 0) {
                        if (result.points >= chainBP) {
                            state.setItem("ConquestChainId", result.userId);
                            con.log(1, "Chain Attack:", result.userId, "Conquest Points: " + result.points);
                        } else {
                            conquestRecord['ignoreTime'] = Date.now();
                        }
                    }
                }

                conquestRecord['chainCount'] = conquestRecord['chainCount'] ? conquestRecord['chainCount'] += 1 : 1;
                maxChains = config.getItem('ConquestMaxChains', 11);
                if (maxChains === '' || $u.isNaN(maxChains) || maxChains < 0) {
                    maxChains = 11;
                }

                if (conquestRecord['chainCount'] >= maxChains) {
                    con.log(1, "Lets give this guy a break. Chained", conquestRecord['chainCount']);
                    conquestRecord['chainTime'] = Date.now();
                    conquestRecord['chainCount'] = 0;
                }

            } else {
                con.log(1, "We Were Defeated By ", result.userName);
                conquestRecord['chainCount'] = 0;
                conquestRecord['chainTime'] = 0;
            }

            conquest.setItem(conquestRecord);
            return true;
        } catch (err) {
            con.error("ERROR in conquest.checkResults: " + err);
            return false;
        }
    };

    conquest.nextTarget = function() {
        state.setItem('ConquestTargetUpto', state.getItem('ConquestTargetUpto', 0) + 1);
    };

    conquest.getTarget = function() {
        try {
            var target = 0,
                targets = [],
                conquestUpto = '',
                i;

            target = state.getItem('ConquestChainId', 0);
            if (target) {
                return target;
            }

            for (i in conquest.targets) {
                if (conquest.targets.hasOwnProperty(i)) {
                    targets.push(conquest.targets[i].userId);
                }
            }

            if (!targets.length) {
                return false;
            }

            conquestUpto = state.getItem('ConquestTargetUpto', 0);
            if (conquestUpto > targets.length - 1) {
                conquestUpto = 0;
                state.setItem('ConquestTargetUpto', 0);
            }

            if (!targets[conquestUpto]) {
                conquest.nextTarget();
                return false;
            }

            return targets[conquestUpto];
        } catch (err) {
            con.error("ERROR in conquest.getTarget: " + err);
            return false;
        }
    };

    conquest.click = function(conquestButton) {
        try {
            session.setItem('ReleaseControl', true);
            conquest.flagResult = true;
            caap.setDomWaiting("conquest_duel.php");
            caap.click(conquestButton);
            return true;
        } catch (err) {
            con.error("ERROR in conquest.click: " + err);
            return false;
        }
    };

    conquest.battles = {
        'Freshmeat': {
            'Invade': 'war_conquest_invadebtn.gif',
            'Duel': 'war_conquest_duelbtn.gif',
            'regex1': new RegExp('(.+)\\s*\\(Level ([0-9]+)\\)\\s*Conquest: ([A-Za-z ]+) \\(Rank ([0-9]+)\\)\\s*War: ([A-Za-z ]+) \\(Rank ([0-9]+)\\)\\s*([0-9]+)', 'i'),
            'regex2': new RegExp('(.+)\\s*\\(Level ([0-9]+)\\)\\s*Conquest: ([A-Za-z ]+) \\(Rank ([0-9]+)\\)\\s*([0-9]+)', 'i'),
            'refresh': 'conqduel_on.jpg', // must use menu to navigate
            'image': 'conqduel_on.jpg'
        }
    };

    conquest.freshmeat = function(type, slice) {
        try {
            var buttonType = type === 'Raid' ? config.getItem('ConquestType', 'Invade') + state.getItem('RaidStaminaReq', 1) : config.getItem('ConquestType', 'Invade'),
                inputDiv = $j("input[src*='" + conquest.battles[type === "recon" ? "Freshmeat" : type][buttonType] + "']", (type === "recon" && slice ? $j(slice) : $j("#app_body"))),
                plusOneSafe = false,
                safeTargets = [],
                chainId = '',
                chainAttack = false,
                inp = $j(),
                txt = '',
                minRank = 0,
                maxLevel = 0,
                minLevel = 0,
                ARBase = 0,
                ARMax = 0,
                ARMin = 0,
                levelMultiplier = 0,
                armyRatio = 0,
                conquestRecord = {},
                it = 0,
                itx,
                len = 0,
                form = $j(),
                firstId = '',
                lastConquestID = 0,
                engageButton = $j(),
                time = 0,
                found = 0,
                entryLimit = 0,
                noSafeCount = 0,
                noSafeCountSet = 0;

            if (!$u.hasContent(inputDiv)) {
                con.warn('Not on conquestpage');
                caap.navigateTo('conquest_duel', 'conqduel_on.jpg');
                inputDiv = null;
                inp = null;
                form = null;
                engageButton = null;
                return false;
            }

            chainId = state.getItem('ConquestChainId', 0);
            state.setItem('ConquestChainId', '');
            // Lets get our Freshmeat user settings
            minRank = config.getItem("FreshMeatMinRank", 99);
            con.log(1, "FreshMeatMinRank", minRank);
            if (minRank === '' || $u.isNaN(minRank)) {
                if (minRank !== '') {
                    con.warn("FreshMeatMinRank is NaN, using default", 99);
                }

                minRank = 99;
            }

            maxLevel = config.getItem("FreshMeatMaxLevel", 99999);
            con.log(1, "FreshMeatMaxLevel", maxLevel);
            if (maxLevel === '' || $u.isNaN(maxLevel)) {
                if (maxLevel !== '') {
                    con.warn("FreshMeatMaxLevel is NaN, using default", maxLevel);
                }

                maxLevel = 99999;
            }

            minLevel = config.getItem("FreshMeatMinLevel", 99999);
            con.log(1, "FreshMeatMinLevel", minLevel);
            if (minLevel === '' || $u.isNaN(minLevel)) {
                if (minLevel !== '') {
                    con.warn("FreshMeatMinLevel is NaN, using default", minLevel);
                }

                minLevel = 99999;
            }

            ARBase = config.getItem("FreshMeatARBase", 0.5);
            con.log(1, "FreshMeatARBase", ARBase);
            if (ARBase === '' || $u.isNaN(ARBase)) {
                if (ARBase !== '') {
                    con.warn("FreshMeatARBase is NaN, using default", ARBase);
                }

                ARBase = 0.5;
            }

            ARMax = config.getItem("FreshMeatARMax", 99999);
            con.log(1, "FreshMeatARMax", ARMax);
            if (ARMax === '' || $u.isNaN(ARMax)) {
                if (ARMax !== '') {
                    con.warn("FreshMeatARMax is NaN, using default", ARMax);
                }

                ARMax = 99999;
            }

            ARMin = config.getItem("FreshMeatARMin", 0);
            con.log(1, "FreshMeatARMin", ARMin);
            if (ARMin === '' || $u.isNaN(ARMin)) {
                if (ARMin !== '') {
                    con.warn("FreshMeatARMin is NaN, using default", ARMin);
                }

                ARMin = 0;
            }

            inputDiv.each(function(index) {
                var tr = $j(),
                    levelm = [],
                    tempTxt = '',
                    tNum = 0,
                    tempTime = -1,
                    i = 0,
                    len = 0,
                    tempRecord = type === "recon" ? new conquest.reconRecord() : new conquest.record();

                tempRecord.data['button'] = $j(this);
                if (type === 'Raid') {
                    tr = tempRecord.data['button'].parents().eq(4);
                } else {
                    tr = tempRecord.data['button'].parents("tr").eq(0);
                }

                inp = $j("input[name='target_id']", tr);
                if (!$u.hasContent(inp)) {
                    con.warn("Could not find 'target_id' input");
                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                tempRecord.data['userId'] = $u.setContent(inp.val(), '0').parseInt();
                if (!$u.isNumber(tempRecord.data['userId']) || tempRecord.data['userId'] <= 0) {
                    con.warn("Not a valid userId", tempRecord.data['userId']);
                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                if (type === "recon") {
                    for (i = 0, len = conquest.reconRecords.length; i < len; i += 1) {
                        if (conquest.reconRecords[i]['userId'] === tempRecord.data['userId']) {
                            tempRecord.data = conquest.reconRecords[i];
                            conquest.reconRecords.splice(i, 1);
                            con.log(1, "UserRecord exists. Loaded and removed.", tempRecord);
                            break;
                        }
                    }
                }

                if (type === 'Raid') {
                    tempTxt = $u.setContent(tr.children().eq(1).text(), '').trim();
                    levelm = conquest.battles['Raid']['regex1'].exec(tempTxt);
                    if (!$u.hasContent(levelm)) {
                        con.warn("Can't match Raid regex in ", tempTxt);
                        inputDiv = null;
                        inp = null;
                        form = null;
                        engageButton = null;
                        tr = null;
                        return true;
                    }

                    tempRecord.data['nameStr'] = $u.setContent(levelm[1], '').trim();
                    tempRecord.data['rankNum'] = $u.setContent(levelm[2], '').parseInt();
                    tempRecord.data['rankStr'] = conquest.conquestRankTable[tempRecord.data['rankNum']];
                    tempRecord.data['levelNum'] = $u.setContent(levelm[4], '').parseInt();
                    tempRecord.data['armyNum'] = $u.setContent(levelm[6], '').parseInt();
                } else {
                    if (!$u.hasContent(tr)) {
                        con.warn("Can't find parent tr in tempRecord.data['button']");
                        inputDiv = null;
                        inp = null;
                        form = null;
                        engageButton = null;
                        tr = null;
                        return true;
                    }

                    tNum = $u.setContent($j("img[src*='symbol_']", tr).attr("src"), '').regex(/(\d+)\.jpg/i);
                    if ($u.hasContent(tNum)) {
                        tempRecord.data['deityNum'] = tNum - 1;
                        if (tempRecord.data['deityNum'] >= 0 && tempRecord.data['deityNum'] <= 4) {
                            tempRecord.data['deityStr'] = caap.demiTable[tempRecord.data['deityNum']];
                        } else {
                            con.warn("Demi number is not between 0 and 4", tempRecord.data['deityNum']);
                            tempRecord.data['deityNum'] = 0;
                            tempRecord.data['deityStr'] = caap.demiTable[tempRecord.data['deityNum']];
                        }
                    } else {
                        con.warn("Unable to match demi number in tempTxt");
                    }

                    // If looking for demi points, and already full, continue
                    if (type !== "recon") {
                        if (config.getItem('DemiPointsFirst', false) && !state.getItem('DemiPointsDone', true) && (config.getItem('WhenMonster', 'Never') !== 'Never')) {
                            if (caap.demi[tempRecord.data['deityStr']]['daily']['dif'] <= 0 || !config.getItem('DemiPoint' + tempRecord.data['deityNum'], true)) {
                                con.log(1, "Daily Demi Points done for", tempRecord.data['deityStr']);
                                inputDiv = null;
                                inp = null;
                                form = null;
                                engageButton = null;
                                tr = null;
                                return true;
                            }
                        } else if (config.getItem('WhenConquest', 'Never') === "Demi Points Only") {
                            if (caap.demi[tempRecord.data['deityStr']]['daily']['dif'] <= 0) {
                                con.log(1, "Daily Demi Points done for", tempRecord.data['deityStr']);
                                inputDiv = null;
                                inp = null;
                                form = null;
                                engageButton = null;
                                tr = null;
                                return true;
                            }
                        }
                    }

                    tempTxt = $u.setContent(tr.text(), '').trim();
                    if (!$u.hasContent(tempTxt)) {
                        con.warn("Can't find tempTxt in tr");
                        inputDiv = null;
                        inp = null;
                        form = null;
                        engageButton = null;
                        tr = null;
                        return true;
                    }

                    if (conquest.battles['Freshmeat']['warLevel']) {
                        levelm = conquest.battles['Freshmeat']['regex1'].exec(tempTxt);
                        if (!levelm) {
                            levelm = conquest.battles['Freshmeat']['regex2'].exec(tempTxt);
                            conquest.battles['Freshmeat']['warLevel'] = false;
                        }
                    } else {
                        levelm = conquest.battles['Freshmeat']['regex2'].exec(tempTxt);
                        if (!levelm) {
                            levelm = conquest.battles['Freshmeat']['regex1'].exec(tempTxt);
                            conquest.battles['Freshmeat']['warLevel'] = true;
                        }
                    }

                    if (!levelm) {
                        con.warn("Can't match Freshmeat regex in ", tempTxt);
                        inputDiv = null;
                        inp = null;
                        form = null;
                        engageButton = null;
                        tr = null;
                        return true;
                    }

                    tempRecord.data['nameStr'] = $u.setContent(levelm[1], '').trim();
                    tempRecord.data['levelNum'] = $u.setContent(levelm[2], '').parseInt();
                    tempRecord.data['rankStr'] = $u.setContent(levelm[3], '').trim();
                    tempRecord.data['rankNum'] = $u.setContent(levelm[4], '').parseInt();
                    if (conquest.battles['Freshmeat']['warLevel']) {
                        tempRecord.data['warRankStr'] = $u.setContent(levelm[5], '').trim();
                        tempRecord.data['warRankNum'] = $u.setContent(levelm[6], '').parseInt();
                        tempRecord.data['armyNum'] = $u.setContent(levelm[7], '').parseInt();
                    } else {
                        tempRecord.data['armyNum'] = $u.setContent(levelm[5], '').parseInt();
                    }
                }

                if (conquest.hashCheck(tempRecord.data)) {
                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                levelMultiplier = caap.stats['level'] / (tempRecord.data['levelNum'] > 0 ? tempRecord.data['levelNum'] : 1);
                armyRatio = ARBase * levelMultiplier;
                armyRatio = Math.min(armyRatio, ARMax);
                armyRatio = Math.max(armyRatio, ARMin);
                if (armyRatio <= 0) {
                    con.warn("Bad ratio", armyRatio, ARBase, ARMin, ARMax, levelMultiplier);
                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                if (tempRecord.data['levelNum'] - caap.stats['level'] > maxLevel) {
                    con.log(1, "Exceeds relative maxLevel", {
                        'level': tempRecord.data['levelNum'],
                        'levelDif': tempRecord.data['levelNum'] - caap.stats['level'],
                        'maxLevel': maxLevel
                    });

                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                if (caap.stats['level'] - tempRecord.data['levelNum'] > minLevel) {
                    con.log(1, "Exceeds relative minLevel", {
                        'level': tempRecord.data['levelNum'],
                        'levelDif': caap.stats['level'] - tempRecord.data['levelNum'],
                        'minLevel': minLevel
                    });

                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                if (caap.stats['rank']['conquest'] && (caap.stats['rank']['conquest'] - tempRecord.data['rankNum'] > minRank)) {
                    con.log(1, "Greater than conquest minRank", {
                        'rankDif': caap.stats['rank']['conquest'] - tempRecord.data['rankNum'],
                        'minRank': minRank
                    });

                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                // if we know our army size, and this one is larger than armyRatio, don't conquest
                if (caap.stats['army']['capped'] && (tempRecord.data['armyNum'] > (caap.stats['army']['capped'] * armyRatio))) {
                    con.log(1, "Greater than armyRatio", {
                        'armyRatio': armyRatio.dp(2),
                        'armyNum': tempRecord.data['armyNum'],
                        'armyMax': (caap.stats['army']['capped'] * armyRatio).dp()
                    });

                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                if (type === "recon") {
                    tempRecord.data['aliveTime'] = Date.now();
                    entryLimit = config.getItem("LimitTargets", 100);
                    while (conquest.reconRecords.length >= entryLimit) {
                        con.log(1, "Entry limit matched. Deleted an old record", conquest.reconRecords.shift());
                    }

                    delete tempRecord.data['button'];
                    con.log(1, "Push UserRecord", tempRecord);
                    conquest.reconRecords.push(tempRecord.data);
                    found += 1;

                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                con.log(1, "ID: " + tempRecord.data['userId'].toString().rpad(" ", 15) + " Level: " + tempRecord.data['levelNum'].toString().rpad(" ", 4) +
                    " Conquest Rank: " + tempRecord.data['rankNum'].toString().rpad(" ", 2) + " Army: " + tempRecord.data['armyNum']);

                // don't conquest people we lost to in the last week
                conquestRecord = conquest.getItem(tempRecord.data['userId']);
                if (!config.getItem("IgnoreConquestLoss", false)) {
                    switch (config.getItem("ConquestType", 'Invade')) {
                    case 'Invade':
                        tempTime = $u.setContent(conquestRecord['invadeLostTime'], 0);

                        break;
                    case 'Duel':
                        tempTime = $u.setContent(conquestRecord['duelLostTime'], 0);

                        break;
                    default:
                        con.warn("Conquest type unknown!", config.getItem("ConquestType", 'Invade'));
                    }

                    if (conquestRecord && !conquestRecord['newRecord'] && tempTime && !schedule.since(tempTime, 604800)) {
                        con.log(1, "We lost " + config.getItem("ConquestType", 'Invade') + " to this id this week: ", tempRecord.data['userId']);
                        inputDiv = null;
                        inp = null;
                        form = null;
                        engageButton = null;
                        tr = null;
                        return true;
                    }
                }

                // don't conquest people that results were unknown in the last hour
                tempTime = $u.setContent(conquestRecord['unknownTime'], 0);
                if (conquestRecord && !conquestRecord['newRecord'] && !schedule.since(tempTime, 3600)) {
                    con.log(1, "User was conquestd but results unknown in the last hour: ", tempRecord.data['userId']);
                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                // don't conquest people that were dead or hiding in the last hour
                tempTime = $u.setContent(conquestRecord['deadTime'], 0);
                if (conquestRecord && !conquestRecord['newRecord'] && !schedule.since(tempTime, 3600)) {
                    con.log(1, "User was dead in the last hour: ", tempRecord.data['userId']);
                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                // don't conquest people we've already chained to max in the last 2 days
                tempTime = $u.setContent(conquestRecord['chainTime'], 0);
                if (conquestRecord && !conquestRecord['newRecord'] && !schedule.since(tempTime, 86400)) {
                    con.log(1, "We chained user within 2 days: ", tempRecord.data['userId']);
                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                // don't conquest people that didn't meet chain gold or chain points in the last week
                tempTime = $u.setContent(conquestRecord['ignoreTime'], 0);
                if (conquestRecord && !conquestRecord['newRecord'] && !schedule.since(tempTime, 604800)) {
                    con.log(1, "User didn't meet chain requirements this week: ", tempRecord.data['userId']);
                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                tempRecord.data['score'] = (type === 'Raid' ? 0 : tempRecord.data['rankNum']) - (tempRecord.data['armyNum'] / levelMultiplier / caap.stats['army']['capped']);
                if (tempRecord.data['userId'] === chainId) {
                    chainAttack = true;
                }

                tempRecord.data['targetNumber'] = index + 1;
                con.log(1, "tempRecord/levelm", tempRecord.data, levelm);
                safeTargets.push(tempRecord.data);
                tempRecord = null;
                if (index === 0 && type === 'Raid') {
                    plusOneSafe = true;
                }

                inputDiv = null;
                inp = null;
                form = null;
                engageButton = null;
                tr = null;
                return true;
            });

            if (type === "recon") {
                conquest.saveRecon();
                caap.setDivContent('idle_mess', 'Player Recon: Found:' + found + ' Total:' + conquest.reconRecords.length);
                con.log(1, 'Player Recon: Found:' + found + ' Total:' + conquest.reconRecords.length);
                window.setTimeout(function() {
                    caap.setDivContent('idle_mess', '');
                }, 5000);

                schedule.setItem('PlayerReconTimer', (gm ? gm.getItem('PlayerReconRetry', 60, hiddenVar) : 60), 60);
                conquest.reconInProgress = false;
                inputDiv = null;
                inp = null;
                form = null;
                engageButton = null;
                return true;
            }

            safeTargets.sort($u.sortBy(true, "score"));
            if ($u.hasContent(safeTargets)) {
                if (chainAttack) {
                    form = inputDiv.eq(0).parent().parent();
                    inp = $j("input[name='target_id']", form);
                    if ($u.hasContent(inp)) {
                        inp.attr("value", chainId);
                        con.log(1, "Chain attacking: ", chainId);
                        conquest.click(inputDiv.eq(0), type);
                        state.setItem("lastConquestID", chainId);
                        caap.setDivContent('conquest_mess', 'Attacked: ' + state.getItem("lastConquestID", 0));
                        state.setItem("notSafeCount", 0);
                        inputDiv = null;
                        inp = null;
                        form = null;
                        engageButton = null;
                        return true;
                    }

                    con.warn("Could not find 'target_id' input");
                } else if (config.getItem('PlusOneKills', false) && type === 'Raid') {
                    if (plusOneSafe) {
                        form = inputDiv.eq(0).parent().parent();
                        inp = $j("input[name='target_id']", form);
                        if ($u.hasContent(inp)) {
                            txt = inp.attr("value");
                            firstId = txt ? txt.parseInt() : 0;
                            inp.attr("value", '200000000000001');
                            con.log(1, "Target ID Overriden For +1 Kill. Expected Defender: ", firstId);
                            conquest.click(inputDiv.eq(0), type);
                            state.setItem("lastConquestID", firstId);
                            caap.setDivContent('conquest_mess', 'Attacked: ' + state.getItem("lastConquestID", 0));
                            state.setItem("notSafeCount", 0);
                            inputDiv = null;
                            inp = null;
                            form = null;
                            engageButton = null;
                            return true;
                        }

                        con.warn("Could not find 'target_id' input");
                    } else {
                        con.log(1, "Not safe for +1 kill.");
                    }
                } else {
                    lastConquestID = state.getItem("lastConquestID", 0);
                    for (it = 0, len = safeTargets.length; it < len; it += 1) {
                        // current thinking is that continue should not be used as it can cause reader confusion
                        // therefore when linting, it throws a warning
                        /*jslint continue: true */
                        if (!lastConquestID && lastConquestID === safeTargets[it]['id']) {
                            continue;
                        }
                        /*jslint continue: false */

                        if ($u.isDefined(safeTargets[it]['button'])) {
                            con.log(1, 'Found Target score: ' + safeTargets[it]['score'].dp(2) + ' id: ' + safeTargets[it]['userId'] + ' Number: ' + safeTargets[it]['targetNumber']);
                            conquest.click(safeTargets[it]['button'], type);
                            delete safeTargets[it]['score'];
                            delete safeTargets[it]['targetNumber'];
                            delete safeTargets[it]['button'];
                            conquestRecord = conquest.getItem(safeTargets[it]['userId']);
                            if (conquestRecord['newRecord']) {
                                state.setItem("lastConquestID", safeTargets[it]['userId']);
                                $j.extend(true, conquestRecord, safeTargets[it]);
                                conquestRecord['newRecord'] = false;
                                conquestRecord['aliveTime'] = Date.now();
                            } else {
                                conquestRecord['aliveTime'] = Date.now();
                                for (itx in safeTargets[it]) {
                                    if (safeTargets[it].hasOwnProperty(itx)) {
                                        if (!$u.hasContent(conquestRecord[itx] && $u.hasContent(safeTargets[it][itx]))) {
                                            conquestRecord[itx] = safeTargets[it][itx];
                                        }

                                        if ($u.hasContent(safeTargets[it][itx]) && $u.isString(safeTargets[it][itx]) && conquestRecord[itx] !== safeTargets[it][itx]) {
                                            conquestRecord[itx] = safeTargets[it][itx];
                                        }

                                        if ($u.hasContent(safeTargets[it][itx]) && $u.isNumber(safeTargets[it][itx]) && conquestRecord[itx] < safeTargets[it][itx]) {
                                            conquestRecord[itx] = safeTargets[it][itx];
                                        }
                                    }
                                }
                            }

                            conquest.setItem(conquestRecord);
                            caap.setDivContent('conquest_mess', 'Attacked: ' + lastConquestID);
                            state.setItem("notSafeCount", 0);
                            inputDiv = null;
                            inp = null;
                            form = null;
                            engageButton = null;
                            return true;
                        }

                        con.warn('Attack button is null or undefined');
                    }
                }
            }

            noSafeCount = state.setItem("notSafeCount", state.getItem("notSafeCount", 0) + 1);
            noSafeCountSet = config.getItem("notSafeCount", 20);
            noSafeCountSet = noSafeCountSet < 1 ? 1 : noSafeCountSet;
            if (noSafeCount >= noSafeCountSet) {
                caap.setDivContent('conquest_mess', 'Leaving Conquest. Will Return Soon.');
                con.log(1, 'No safe targets limit reached. Releasing control for other processes: ', noSafeCount);
                state.setItem("notSafeCount", 0);
                time = config.getItem("NoTargetDelay", 45);
                time = time < 10 ? 10 : time;
                schedule.setItem("NoTargetDelay", time);
                inputDiv = null;
                inp = null;
                form = null;
                engageButton = null;
                return false;
            }

            caap.setDivContent('conquest_mess', 'No targets matching criteria');
            con.log(1, 'No safe targets: ', noSafeCount);
            if (type === 'Raid') {
                engageButton = monster.engageButtons[state.getItem('targetFromraid', '')];
                if (session.getItem("page", '') === 'raid' && engageButton) {
                    caap.click(engageButton);
                } else {
                    caap.navigateTo('conquest_duel', 'conqduel_on.jpg');
                }
            } else {
                caap.navigateTo('conquest_duel', 'conqduel_on.jpg');
            }

            inputDiv = null;
            inp = null;
            form = null;
            engageButton = null;
            return true;
        } catch (err) {
            con.error("ERROR in conquest.freshmeat: " + err);
            return false;
        }
    };

    // this function appears to have some serious bugs and really needs to be reworked!
    // it can try to click all 3 buttons, but the DOM could change after each click
    conquest.collect = function() {
        try {
            var button = caap.checkForImage("conq3_btn_collectpower_small.gif"),
                button2 = caap.checkForImage("conq3_btn_collect.gif"),
                buttonCrystal = caap.checkForImage("conq3_btn_pray.gif"),
                timeLeft;

            if ($u.hasContent(button)) {
                caap.click(button);
            }

            if ($u.hasContent(button2)) {
                con.log(1, "button exists");
                caap.click(button2);
            }

            con.log(1, "done with buttons", button, button2, buttonCrystal);
            if ($u.hasContent(buttonCrystal)) {
                caap.click(buttonCrystal);
            }

            timeLeft = $j("div[style*='conq3_mid_notop']")[0].children[0].children[0].children[2].children[0].innerHTML.match(/(\d+)/)[0];
            schedule.setItem('collectConquestTimer', timeLeft * 60 * 60);
            schedule.setItem('collectConquestCrystalTimer', timeLeft * 60 * 60);

            button = null;
            button2 = null;
            buttonCrystal = null;
        } catch (err) {
            con.error("ERROR in collect Conquest: " + err);
            return;
        }
    };

    conquest.battle = function() {
        function logOpponent(opponent, reason, conditions) {
            con.log((reason === 'match' ? 1 : 2), (opponent.nameStr.lpad(' ', 20) + opponent.userId.lpad(' ', 16) +
                opponent.levelNum.lpad(' ', 4) + conquest.conquestRankTable[opponent.rankNum].lpad(' ', 16) +
                opponent.armyNum.lpad(' ', 4)), reason, conditions);
        }

        try {
            var slice = $j("#app_body div[style*='war_conquest_header2.jpg']"),
                levelDiv = $j(),
                percentageDiv = $j(),
                rechargeDiv = $j(),
                rechargeSecs = 0,
                timeDiv = $j(),
                timeSecs = 0,
                tokensDiv = $j(),
                temptext = '',
                passedStats = true,
                passedTimes = true,
                opponentsSlice = $j("#app_body div[style*='war_conquest_mid']"),
                minRank,
                maxRank,
                minLevel,
                maxLevel,
                ARBase,
                ARMin,
                ARMax,
                conquesttype = config.getItem('ConquestType', 'Invade');

            con.log(1, "conquest.battle begins", caap.stats);

            if ($u.hasContent(slice)) {
                levelDiv = $j("div[style*='width:160px;height:12px;color:#80cfec']", slice);
                if ($u.hasContent(levelDiv)) {
                    caap.stats['rank']['conquestLevel'] = $u.setContent(levelDiv.text(), '').regex(/(\d+)/);
                } else {
                    con.warn("Unable to get conquest levelDiv");
                    passedStats = false;
                }

                percentageDiv = $j("div[style*='war_redbar.jpg']", slice);
                if ($u.hasContent(percentageDiv)) {
                    caap.stats['rank']['conquestLevelPercent'] = $u.setContent(percentageDiv.getPercent('width'), 0);
                } else {
                    con.warn("Unable to get conquest percentageDiv");
                    passedStats = false;
                }

                tokensDiv = $j("#guild_token_current_value", slice).parent();
                if ($u.hasContent(tokensDiv)) {
                    temptext = $u.setContent(tokensDiv.text(), '').stripTRN();
                    if ($u.hasContent(temptext)) {
                        caap.stats['guildTokens']['num'] = $u.setContent(temptext.regex(/(\d+)\/\d+/), 0);
                        caap.stats['guildTokens']['max'] = $u.setContent(temptext.regex(/\d+\/(\d+)/), 0);
                    } else {
                        con.warn("Unable to get tokensDiv text", tokensDiv);
                        passedStats = false;
                    }
                } else {
                    tokensDiv = $j("#guild_token_current_value_amount", slice);
                    if ($u.hasContent(tokensDiv)) {
                        temptext = $u.setContent(tokensDiv.val(), '');
                        if ($u.hasContent(temptext)) {
                            caap.stats['guildTokens']['num'] = $u.setContent(temptext.regex(/(\d+)/), 0);
                        } else {
                            con.warn("Unable to get guild_token_current_value_amount text", tokensDiv);
                            passedStats = false;
                        }
                    } else {
                        con.warn("Unable to get conquest tokensMaxDiv");
                        passedStats = false;
                    }

                    tokensDiv = $j("#guild_token_current_max", slice);
                    if ($u.hasContent(tokensDiv)) {
                        temptext = $u.setContent(tokensDiv.val(), '');
                        if ($u.hasContent(temptext)) {
                            caap.stats['guildTokens']['max'] = $u.setContent(temptext.regex(/(\d+)/), 0);
                        } else {
                            con.warn("Unable to get guild_token_current_max text", tokensDiv);
                            passedStats = false;
                        }
                    } else {
                        con.warn("Unable to get conquest tokensMaxDiv");
                        passedStats = false;
                    }
                }

                caap.stats['guildTokens']['dif'] = caap.stats['guildTokens']['max'] - caap.stats['guildTokens']['num'];

                con.log(1, "conquest.battle", caap.stats['rank'], caap.stats['guildTokens']);
                if (passedStats) {
                    caap.saveStats();
                }

                rechargeDiv = $j("#guild_token_current_recharge_time", slice);
                if ($u.hasContent(rechargeDiv)) {
                    rechargeSecs = $u.setContent(rechargeDiv.val(), '').regex(/(\d+)/);
                } else {
                    if (passedStats && caap.stats['guildTokens']['num'] > 0 && caap.stats['guildTokens']['max'] > 0 && caap.stats['guildTokens']['num'] === caap.stats['guildTokens']['max']) {
                        con.warn("Unable to get conquest rechargeDiv");
                        passedTimes = false;
                    }
                }

                timeDiv = $j("#guild_token_time_sec", slice);
                if ($u.hasContent(timeDiv)) {
                    timeSecs = $u.setContent(timeDiv.val(), '').regex(/(\d+)/);
                } else {
                    if (passedStats && caap.stats['guildTokens']['num'] > 0 && caap.stats['guildTokens']['max'] > 0 && caap.stats['guildTokens']['num'] === caap.stats['guildTokens']['max']) {
                        con.warn("Unable to get conquest timeDiv");
                        passedTimes = false;
                    }
                }

                con.log(1, "conquest.battle", rechargeSecs, timeSecs);
            } else {
                con.warn("Unable to get conquest slice");
            }

            minLevel = config.getItem("ConquestMinLevel", 99999);
            con.log(1, "ConquestMinLevel", minLevel);
            if (minLevel === '' || $u.isNaN(minLevel)) {
                if (minLevel !== '') {
                    con.warn("ConquestMinLevel is NaN, using default", minLevel);
                }

                minLevel = 99999;
            }

            maxLevel = config.getItem("ConquestMaxLevel", 99999);
            con.log(1, "ConquestMaxLevel", maxLevel);
            if (maxLevel === '' || $u.isNaN(maxLevel)) {
                if (maxLevel !== '') {
                    con.warn("ConquestMaxLevel is NaN, using default", maxLevel);
                }

                maxLevel = 99999;
            }

            minRank = config.getItem("ConquestMinRank", 99);
            con.log(1, "ConquestMinRank", minRank);
            if (minRank === '' || $u.isNaN(minRank)) {
                if (minRank !== '') {
                    con.warn("ConquestMinRank is NaN, using default", 99);
                }

                minRank = 99;
            }

            maxRank = config.getItem("ConquestMaxRank", 99);
            con.log(1, "ConquestMaxRank", minRank);
            if (minRank === '' || $u.isNaN(minRank)) {
                if (minRank !== '') {
                    con.warn("ConquestMaxRank is NaN, using default", 99);
                }

                minRank = 99;
            }

            ARBase = config.getItem("ConquestARBase", 0.7);
            con.log(1, "ConquestARBase", ARBase);
            if (ARBase === '' || $u.isNaN(ARBase)) {
                if (ARBase !== '') {
                    con.warn("ConquestARBase is NaN, using default", ARBase);
                }

                ARBase = 0.7;
            }

            ARMin = config.getItem("ConquestARMin", 0);
            con.log(1, "ConquestARMin", ARMin);
            if (ARMin === '' || $u.isNaN(ARMin)) {
                if (ARMin !== '') {
                    con.warn("ConquestARMin is NaN, using default", ARMin);
                }

                ARMin = 0;
            }

            ARMax = config.getItem("ConquestARMax", 99999);
            con.log(1, "ConquestARMax", ARMax);
            if (ARMax === '' || $u.isNaN(ARMax)) {
                if (ARMax !== '') {
                    con.warn("ConquestARMax is NaN, using default", ARMax);
                }

                ARMax = 99999;
            }

            con.log(1, "in battle", opponentsSlice);
            if ($u.hasContent(opponentsSlice)) {
                con.log(1, "My rank/type is", conquest.conquestRankTable[caap.stats['rank']['conquest']], caap.stats['rank']['conquest'], conquesttype);
                opponentsSlice.each(function() {
                    var opponentDiv = $j(this),
                        boxesDiv = opponentDiv.children("div"),
                        idDiv = $j(),
                        playerDiv = $j(),
                        armyDiv = $j(),
                        tempDiv = $j(),
                        tempText = '',
                        userId = 0,
                        battleRecord = {},
                        levelMultiplier,
                        armyRatio;

                    if ($u.hasContent(boxesDiv) && boxesDiv.length === 7 ) {
                        idDiv = boxesDiv.eq(1);
                        playerDiv = boxesDiv.eq(2);
                        armyDiv = boxesDiv.eq(3);
                    } else {
                        con.warn("skipping opponent, missing boxes", opponentDiv);
                        opponentDiv = null;
                        boxesDiv = null;
                        idDiv = null;
                        playerDiv = null;
                        armyDiv = null;
                        tempDiv = null;
                        return;
                    }

                    if ($u.hasContent(idDiv)) {
                        tempDiv = $j("a[href*='keep.php?casuser=']", idDiv);
                        if ($u.hasContent(tempDiv)) {
                            tempText = $u.setContent(tempDiv.attr('href'), '');
                            if ($u.hasContent(tempText)) {
                                userId = $u.setContent(tempText.regex(/casuser=(\d+)/i), -1);
                                if (!$u.isNumber(userId) || userId < 1) {
                                    con.warn("skipping opponent, unable to get userid", tempText);
                                    opponentDiv = null;
                                    boxesDiv = null;
                                    idDiv = null;
                                    playerDiv = null;
                                    armyDiv = null;
                                    tempDiv = null;
                                    return;
                                }

                                battleRecord = conquest.getItem(userId);
                            } else {
                                con.warn("No text in idDiv");
                                opponentDiv = null;
                                boxesDiv = null;
                                idDiv = null;
                                playerDiv = null;
                                armyDiv = null;
                                tempDiv = null;
                                return;
                            }
                        }
                    } else {
                        con.warn("skipping opponent, missing idDiv", opponentDiv);
                        opponentDiv = null;
                        boxesDiv = null;
                        idDiv = null;
                        playerDiv = null;
                        armyDiv = null;
                        tempDiv = null;
                        return;
                    }

                    if ($u.hasContent(playerDiv)) {
                        tempText = $u.setContent(playerDiv.text(), '');
                        if ($u.hasContent(tempText)) {
                            battleRecord.nameStr = $u.setContent(tempText.regex(/\s*(.+) \(Level/), '');
                            battleRecord.levelNum = $u.setContent(tempText.regex(/Level (\d+)/i), -1);
                            battleRecord.rankNum = $u.setContent(tempText.regex(/Rank (\d+)/i), -1);

                            if (battleRecord.nameStr === '') {
                                con.warn("Unable to match opponent's name", tempText);
                            }

                            if (!$u.isNumber(battleRecord.levelNum) || !$u.isNumber(battleRecord.rankNum) || battleRecord.levelNum === -1 || battleRecord.rankNum === -1) {
                                con.warn("skipping opponent, unable to get level or rank", tempText);
                                opponentDiv = null;
                                boxesDiv = null;
                                idDiv = null;
                                playerDiv = null;
                                armyDiv = null;
                                tempDiv = null;
                                return;
                            }
                        } else {
                            con.warn("No text in playerDiv");
                            opponentDiv = null;
                            boxesDiv = null;
                            idDiv = null;
                            playerDiv = null;
                            armyDiv = null;
                            tempDiv = null;
                            return;
                        }
                    } else {
                        con.warn("skipping opponent, missing playerDiv", opponentDiv);
                        opponentDiv = null;
                        boxesDiv = null;
                        idDiv = null;
                        playerDiv = null;
                        armyDiv = null;
                        tempDiv = null;
                        return;
                    }

                    if ($u.hasContent(armyDiv)) {
                        tempText = $u.setContent(armyDiv.text(), '');
                        if ($u.hasContent(tempText)) {
                            battleRecord.armyNum = $u.setContent(tempText.regex(/(\d+)/i), -1);

                            if (battleRecord.armyNum=== -1) {
                                con.warn("skipping opponent, unable to get army", tempText);
                                opponentDiv = null;
                                boxesDiv = null;
                                idDiv = null;
                                playerDiv = null;
                                armyDiv = null;
                                tempDiv = null;
                                return;
                            }
                        } else {
                            con.warn("No text in armyDiv");
                            opponentDiv = null;
                            boxesDiv = null;
                            idDiv = null;
                            playerDiv = null;
                            armyDiv = null;
                            tempDiv = null;
                            return;
                        }
                    } else {
                        con.warn("skipping opponent, missing armyDiv", opponentDiv);
                        opponentDiv = null;
                        boxesDiv = null;
                        idDiv = null;
                        playerDiv = null;
                        armyDiv = null;
                        tempDiv = null;
                        return;
                    }

                    if (!$u.isNumber(caap.stats['level']) || (caap.stats['level'] - battleRecord.levelNum > minLevel)) {
                        logOpponent(battleRecord, "minLevel", {
                            'level': battleRecord.levelNum,
                            'levelDif': (caap.stats['level'] || 0) - battleRecord.levelNum,
                            'minLevel': minLevel
                        });

                        opponentDiv = null;
                        boxesDiv = null;
                        idDiv = null;
                        playerDiv = null;
                        armyDiv = null;
                        tempDiv = null;
                        return;
                    }

                    if (!$u.isNumber(caap.stats['level']) || (battleRecord.levelNum - caap.stats['level'] > maxLevel)) {
                        logOpponent(battleRecord, "maxLevel", {
                            opponent: battleRecord,
                            'level': battleRecord.levelNum,
                            'levelDif': battleRecord.levelNum - (caap.stats['level'] || 0) ,
                            'maxLevel': maxLevel
                        });

                        opponentDiv = null;
                        boxesDiv = null;
                        idDiv = null;
                        playerDiv = null;
                        armyDiv = null;
                        tempDiv = null;
                        return;
                    }

                    if (!$u.isNumber(caap.stats['rank']['conquest']) || (caap.stats['rank']['conquest'] - battleRecord.rankNum > minRank)) {
                        logOpponent(battleRecord, "minRank", {
                            opponent: battleRecord,
                            'rankDif': (caap.stats['rank']['conquest'] || 0) - battleRecord.rankNum,
                            'minRank': minRank
                        });

                        opponentDiv = null;
                        boxesDiv = null;
                        idDiv = null;
                        playerDiv = null;
                        armyDiv = null;
                        tempDiv = null;
                        return;
                    }

                    if (!$u.isNumber(caap.stats['rank']['conquest']) || (battleRecord.rankNum - caap.stats['rank']['conquest'] > maxRank)) {
                        logOpponent(battleRecord, "maxRank", {
                            opponent: battleRecord,
                            'rankDif': battleRecord.rankNum -(caap.stats['rank']['conquest'] || 0),
                            'minRank': minRank
                        });

                        opponentDiv = null;
                        boxesDiv = null;
                        idDiv = null;
                        playerDiv = null;
                        armyDiv = null;
                        tempDiv = null;
                        return;
                    }

                    levelMultiplier = (caap.stats['level'] || 0) / (battleRecord.levelNum || 1);
                    armyRatio = ARBase * levelMultiplier;
                    armyRatio = Math.min(armyRatio, ARMax);
                    armyRatio = Math.max(armyRatio, ARMin);
                    if (armyRatio <= 0) {
                        con.warn("Bad ratio", armyRatio, ARBase, ARMin, ARMax, levelMultiplier);
                        opponentDiv = null;
                        boxesDiv = null;
                        idDiv = null;
                        playerDiv = null;
                        armyDiv = null;
                        tempDiv = null;
                        return;
                    }

                    // if we know our army size, and this one is larger than armyRatio, don't conquest
                    if (conquesttype === 'Invade' && caap.stats['army']['capped'] && (battleRecord.armyNum > (caap.stats['army']['capped'] * armyRatio))) {
                        logOpponent(battleRecord, "armyRatio", {
                            'armyRatio': armyRatio.dp(2),
                            'armyNum': battleRecord.armyNum ,
                            'armyMax': (caap.stats['army']['capped'] * armyRatio).dp()
                        });

                        opponentDiv = null;
                        boxesDiv = null;
                        idDiv = null;
                        playerDiv = null;
                        armyDiv = null;
                        tempDiv = null;
                        return;
                    }

                    conquest.targets[battleRecord.userId] = battleRecord;
                    logOpponent(battleRecord, "match", '');

                    opponentDiv = null;
                    boxesDiv = null;
                    idDiv = null;
                    playerDiv = null;
                    armyDiv = null;
                    tempDiv = null;
                });
            } else {
                con.warn("missing opponentsSlice");
            }

            slice = null;
            levelDiv = null;
            percentageDiv = null;
            rechargeDiv = null;
            timeDiv = null;
            tokensDiv = null;
        } catch (err) {
            con.error("ERROR in conquest.battle: " + err);
        }
    };

    conquest.menu = function() {
        try {
            var XConquestInstructions = "Start battling if Guild Coins is above this points",
                XMinConquestInstructions = "Do not conquest if Guild Coins is below this points",
                chainBPInstructions = "Number of conquest points won to initiate a chain attack. Specify 0 to always chain attack.",
                maxChainsInstructions = "Maximum number of chain hits after the initial attack.",
                FMRankInstructions = "The lowest relative rank below yours that " + "you are willing to spend your Guild Coins on. Leave blank to attack " + "any rank. (Uses Conquest Rank for invade and duel)",
                FMARBaseInstructions = "This value sets the base for your Army " + "Ratio calculation [X * (Your Army Size/ Opponent Army Size)]. It is basically a multiplier for the army " +
                    "size of a player at your equal level. A value of 1 means you " + "will conquest an opponent the same level as you with an army the " + "same size as you or less. Default .5",
                FreshMeatARMaxInstructions = "This setting sets the highest value you will use for the Army Ratio [Math.min(Army Ratio, Army Ratio Max)] value. " +
                    "So, if you NEVER want to fight an army bigger than 80% your size, you can set the Max value to .8.",
                FreshMeatARMinInstructions = "This setting sets the lowest value you will use for the Army Ratio [Math.max(Army Ratio, Army Ratio Min)] value. " +
                    "So, if you NEVER want to pass up an army that is less than 10% the size of yours, you can set MIN value to .1.",
                FreshMeatMaxLevelInstructions = "This sets the highest relative level, above yours, that you are willing to attack. So if you are a level 100 and do not want to attack an opponent above level 120, you would code 20.",
                FreshMeatMinLevelInstructions = "This sets the lowest relative level, below yours, that you are willing to attack. So if you are a level 100 and do not want to attack an opponent below level 60, you would code 40.",
                conquestList = ['Guild Coins Available', 'At Max Guild Coins', 'At X Guild Coins', 'Never'],
                conquestInst = [
                    'Guild Coins Available will conquest whenever you have enough Guild Coins',
                    'At Max Guild Coins will conquest when Guild Coins is at max and will burn down all Guild Coins when able to level up',
                    'At X Guild Coins you can set maximum and minimum Guild Coins to conquest',
                    'Never - disables'
                ],
                typeList = ['Invade', 'Duel'],
                typeInst = ['Conquest using Invade button', 'Conquest using Duel button - no guarentee you will win though'],
                htmlCode = '';

            htmlCode = caap.startToggle('Conquesting', 'CONQUEST BATTLE');
            htmlCode += caap.makeDropDownTR("Conquest When", 'WhenConquest', conquestList, conquestInst, '', 'Never', false, false, 62);
            htmlCode += caap.startDropHide('WhenConquest', '', 'Never', true);
            htmlCode += caap.startDropHide('WhenConquest', 'XStamina', 'At X Stamina', false);
            htmlCode += caap.makeNumberFormTR("Start At Or Above", 'ConquestXCoins', '', 1, '', '', true, false);
            htmlCode += caap.makeNumberFormTR("Stop At Or Below", 'ConquestXMinCoins', '', 0, '', '', true, false);
            htmlCode += caap.endDropHide('WhenConquest', 'XStamina');
            htmlCode += caap.makeDropDownTR("Conquest Type", 'ConquestType', typeList, typeInst, '', '', false, false, 62);
            htmlCode += caap.makeNumberFormTR("Chain Conquest Points", 'ConquestChainBP', chainBPInstructions, '', '');
            htmlCode += caap.makeNumberFormTR("Max Chains", 'ConquestMaxChains', maxChainsInstructions, 4, '', '');
            htmlCode += caap.makeTD("Attack targets that are not:");
            htmlCode += caap.makeNumberFormTR("My Level Minus", 'ConquestMinLevel', FreshMeatMaxLevelInstructions, '', '', '', true);
            htmlCode += caap.makeNumberFormTR("My Level Plus", 'ConquestMaxLevel', FreshMeatMinLevelInstructions, '', 50, '', true);
            htmlCode += caap.makeNumberFormTR("My Rank Minus", 'ConquestMinRank', '', '', 1, '', true);
            htmlCode += caap.makeNumberFormTR("My Rank Plus", 'ConquestMaxRank', '', '', 2, '', true);
            htmlCode += caap.makeNumberFormTR("Higher Than X*AR", 'ConquestARBase', FMARBaseInstructions, 0.7, '', '', true);
            htmlCode += caap.makeCheckTR('Advanced', 'ConquestAdvancedOptions', false);
            htmlCode += caap.startCheckHide('ConquestAdvancedOptions');
            htmlCode += caap.makeNumberFormTR("Army Ratio Max", 'ConquestARMax', FreshMeatARMaxInstructions, '', '', '', true);
            htmlCode += caap.makeNumberFormTR("Army Ratio Min", 'ConquestARMin', FreshMeatARMinInstructions, '', '', '', true);
            htmlCode += caap.endCheckHide('ConquestAdvancedOptions');
            htmlCode += caap.endDropHide('WhenConquest');
            /*
            htmlCode += caap.makeCheckTR("Modify Timers", 'conquestModifyTimers', false, "Advanced timers for how often Conquest functions are performed.");
            htmlCode += caap.startCheckHide('conquestModifyTimers');
            htmlCode += caap.makeNumberFormTR("Conquest retry", 'ConquestNotSafeCount', "Check the Conquest X times before release and delay for other processes. Minimum 1.", 20, '', '', true);
            htmlCode += caap.makeNumberFormTR("Conquest delay", 'ConquestNoTargetDelay', "Check the Conquest every X seconds when no target available. Minimum 10.", 45, '', '', true);
            htmlCode += caap.endCheckHide('conquestModifyTimers');
            */
            htmlCode += caap.endToggle;
            return htmlCode;
        } catch (err) {
            con.error("ERROR in conquest.menu: " + err);
            return '';
        }
    };

    conquest.dashboard = function() {
        function points(num) {
            num = $u.setContent(num, 0);
            return num >= 0 ? "+" + num : num;
        }

        try {
            /*-------------------------------------------------------------------------------------\
            Next we build the HTML to be included into the 'caap_infoConquest' div. We set our
            table and then build the header row.
            \-------------------------------------------------------------------------------------*/
            if (config.getItem('DBDisplay', '') === 'Conquest Stats' && session.getItem("ConquestDashUpdate", true)) {
                var headers = ['UserId', 'Name', 'BR', 'WR', 'Level', 'Army', 'Invade', 'Duel'],
                    values = ['userId', 'nameStr', 'rankNum', 'warRankNum', 'levelNum', 'armyNum', 'invadewinsNum', 'duelwinsNum'],
                    pp = 0,
                    i = 0,
                    userIdLink = '',
                    userIdLinkInstructions = '',
                    len = 0,
                    len1 = 0,
                    data = {
                        text: '',
                        color: '',
                        bgcolor: '',
                        id: '',
                        title: ''
                    },
                    head = '',
                    body = '',
                    row = '';

                for (pp = 0; pp < headers.length; pp += 1) {
                    switch (headers[pp]) {
                    case 'UserId':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '16%'
                        });
                        break;
                    case 'Name':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '30%'
                        });
                        break;
                    case 'Invade':
                    case 'Duel':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '10%'
                        });
                        break;
                    case 'BR':
                    case 'WR':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '5%'
                        });
                        break;
                    default:
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '7%'
                        });
                    }
                }

                head = caap.makeTr(head);
                for (i = 0, len = conquest.records.length; i < len; i += 1) {
                    row = "";
                    for (pp = 0, len1 = values.length; pp < len1; pp += 1) {
                        switch (values[pp]) {
                        case 'userId':
                            userIdLinkInstructions = "Clicking this link will take you to the user keep of " + conquest.records[i][values[pp]];
                            userIdLink = "keep.php?casuser=" + conquest.records[i][values[pp]];
                            data = {
                                text: '<span id="caap_conquest_' + i + '" title="' + userIdLinkInstructions + '" rlink="' + userIdLink +
                                    '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + conquest.records[i][values[pp]] + '</span>',
                                color: 'blue',
                                id: '',
                                title: ''
                            };

                            row += caap.makeTd(data);
                            break;
                        case 'rankNum':
                            row += caap.makeTd({
                                text: conquest.records[i][values[pp]],
                                color: '',
                                id: '',
                                title: conquest.records[i]['rankStr']
                            });
                            break;
                        case 'warRankNum':
                            row += caap.makeTd({
                                text: conquest.records[i][values[pp]],
                                color: '',
                                id: '',
                                title: conquest.records[i]['warRankStr']
                            });
                            break;
                        case 'invadewinsNum':
                            row += caap.makeTd({
                                text: conquest.records[i][values[pp]] + "/" + conquest.records[i]['invadelossesNum'] + " " + points(conquest.records[i]['ibp']),
                                color: '',
                                id: '',
                                title: ''
                            });
                            break;
                        case 'duelwinsNum':
                            row += caap.makeTd({
                                text: conquest.records[i][values[pp]] + "/" + conquest.records[i]['duellossesNum'] + " " + points(conquest.records[i]['dbp']),
                                color: '',
                                id: '',
                                title: ''
                            });
                            break;
                        case 'warwinsNum':
                            row += caap.makeTd({
                                text: conquest.records[i][values[pp]] + "/" + conquest.records[i]['warlossesNum'] + " " + points(conquest.records[i]['wbp']),
                                color: '',
                                id: '',
                                title: ''
                            });
                            break;
                        default:
                            row += caap.makeTd({
                                text: conquest.records[i][values[pp]],
                                color: '',
                                id: '',
                                title: ''
                            });
                        }
                    }

                    body += caap.makeTr(row);
                }

                $j("#caap_infoConquest", caap.caapTopObject).html(
                $j(caap.makeTable("conquest", head, body)).dataTable({
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

                $j("span[id*='caap_conquest_']", caap.caapTopObject).click(function(e) {
                    var visitUserIdLink = {
                        rlink: '',
                        arlink: ''
                    },
                    i = 0,
                        len = 0;

                    for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                        if (e.target.attributes[i].nodeName === 'rlink') {
                            visitUserIdLink.rlink = e.target.attributes[i].nodeValue;
                            visitUserIdLink.arlink = visitUserIdLink.rlink;
                        }
                    }

                    caap.clickAjaxLinkSend(visitUserIdLink.arlink);
                });

                session.setItem("ConquestDashUpdate", false);
            }

            return true;
        } catch (err) {
            con.error("ERROR in conquest.dashboard: " + err);
            return false;
        }
    };

}());
