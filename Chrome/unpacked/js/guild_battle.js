/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,gm,
schedule,gifting,state,army, general,session,battle:true,guild_battle: true */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          guild_battle OBJECT
// this is the main object for dealing with guild battles
/////////////////////////////////////////////////////////////////////

(function() {
    "use strict";

    guild_battle.records = [];

    guild_battle.record = function() {
        this.data = {
            'name': '',
            'guildId': '',
            'slot': 0,
            'ticker': '',
            'minions': [],
            'attacks': 1,
            'damage': 0,
            'myStatus': '',
            'reviewed': 0,
            'state': '',
            'enemyHealth': 0,
            'guildHealth': 0,
            'conditions': '',
            'color': $u.bestTextColor(config.getItem("StyleBackgroundLight", "#E0C961"))
        };
    };

    guild_battle.minion = function() {
        this.data = {
            'attacking_position': 0,
            'target_id': 0,
            'name': '',
            'level': 0,
            'mclass': '',
            'healthNum': 0,
            'healthMax': 0,
            'status': '',
            'percent': 0
        };
    };

    guild_battle.me = function() {
        this.data = {
            'name': '',
            'level': 0,
            'mclass': '',
            'healthNum': 0,
            'healthMax': 0,
            'status': '',
            'percent': 0
        };
    };

    guild_battle.which = function(img, entity) {
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

            for (i in guild_battle.info) {
                if (guild_battle.info.hasOwnProperty(i)) {
                    if ($u.hasContent(name)) {
                        break;
                    }

                    r = guild_battle.info[i];
                    // current thinking is that continue should not be used as it can cause reader confusion
                    // therefore when linting, it throws a warning
                    /*jslint continue: true */
                    if (!$u.hasContent(r) || !$u.hasContent(r[entity]) || !$j.isArray(r[entity])) {
                        continue;
                    }
                    /*jslint continue: false */

                    for (k = 0; k < r[entity].length; k += 1) {
                        if (img === r[entity][k]) {
                            name = i;
                            break;
                        }
                    }
                }
            }

            return name;
        } catch (err) {
            con.error("ERROR in guild_battle.which: " + err);
            return undefined;
        }
    };

    guild_battle.load = function() {
        try {
            guild_battle.records = gm.getItem('guild_battle.records', 'default');
            if (guild_battle.records === 'default' || !$j.isArray(guild_battle.records)) {
                guild_battle.records = gm.setItem('guild_battle.records', []);
            }

            session.setItem("GuildBattleDashUpdate", true);
            con.log(3, "guild_battle.load", guild_battle.records);
            return true;
        } catch (err) {
            con.error("ERROR in guild_battle.load: " + err);
            return false;
        }
    };

    guild_battle.save = function(src) {
        try {
            if (caap.domain.which === 3) {
                caap.messaging.setItem('guild_battle.records', guild_battle.records);
            } else {
                gm.setItem('guild_battle.records', guild_battle.records);
                con.log(3, "guild_battle.save", guild_battle.records);
                if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif") && src !== "caapif") {
                    con.log(2, "guild_battle.save send");
                    caap.messaging.setItem('guild_battle.records', guild_battle.records);
                }
            }

            if (caap.domain.which !== 0) {
                session.setItem("GuildBattleDashUpdate", true);
            }

            return true;
        } catch (err) {
            con.error("ERROR in guild_battle.save: " + err);
            return false;
        }
    };

    guild_battle.getItem = function(slot) {
        try {
            var it = 0,
                len = 0,
                success = false,
                newRecord = {};

            if (!$u.isNumber(slot)) {
                con.warn("slot", slot);
                throw "Invalid identifying slot!";
            }

            if (slot === '') {
                return '';
            }

            for (it = 0, len = guild_battle.records.length; it < len; it += 1) {
                if (guild_battle.records[it].slot === slot) {
                    success = true;
                    break;
                }
            }

            if (success) {
                con.log(3, "Got guild_battle record", slot, guild_battle.records[it]);
                return guild_battle.records[it];
            }

            newRecord = new guild_battle.record();
            newRecord.data.slot = slot;
            con.log(3, "New guild_battle record", slot, newRecord.data);
            return newRecord.data;
        } catch (err) {
            con.error("ERROR in guild_battle.getItem: " + err);
            return false;
        }
    };

    guild_battle.setItem = function(record) {
        try {
            if (!record || !$j.isPlainObject(record)) {
                throw "Not passed a record";
            }

            if (!$u.isNumber(record.slot) || record.slot <= 0) {
                con.warn("slot", record.slot);
                throw "Invalid identifying slot!";
            }

            var it = 0,
                len = 0,
                success = false;

            for (it = 0, len = guild_battle.records.length; it < len; it += 1) {
                if (guild_battle.records[it].slot === record.slot) {
                    success = true;
                    break;
                }
            }

            if (success) {
                guild_battle.records[it] = record;
                con.log(3, "Updated guild_battle record", record, guild_battle.records);
            } else {
                guild_battle.records.push(record);
                con.log(3, "Added guild_battle record", record, guild_battle.records);
            }

            guild_battle.save();
            return true;
        } catch (err) {
            con.error("ERROR in guild_battle.setItem: " + err);
            return false;
        }
    };

    guild_battle.deleteItem = function(slot) {
        try {
            var it = 0,
                len = 0,
                success = false;

            if (!$u.isNumber(slot) || slot <= 0) {
                con.warn("slot", slot);
                throw "Invalid identifying slot!";
            }

            for (it = 0, len = guild_battle.records.length; it < len; it += 1) {
                if (guild_battle.records[it].slot === slot) {
                    success = true;
                    break;
                }
            }

            if (success) {
                guild_battle.records.splice(it, 1);
                guild_battle.save();
                con.log(3, "Deleted guild_battle record", slot, guild_battle.records);
                return true;
            }

            con.warn("Unable to delete guild_battle record", slot, guild_battle.records);
            return false;
        } catch (err) {
            con.error("ERROR in guild_battle.deleteItem: " + err);
            return false;
        }
    };

    guild_battle.clear = function() {
        try {
            con.log(1, "guild_battle.clear");
            guild_battle.records = [];
            guild_battle.save();
            state.setItem('staminaGuildBattle', 0);
            state.setItem('targetGuildBattle', {});
            session.setItem("GuildBattleDashUpdate", true);
            return true;
        } catch (err) {
            con.error("ERROR in guild_battle.clear: " + err);
            return false;
        }
    };

    guild_battle.navigate_to_main = function() {
        return caap.navigateTo('guild', 'tab_guild_main_on.gif');
    };

    guild_battle.navigate_to_battles_refresh = function() {
        var button = caap.checkForImage("guild_battle_tab_on.jpg");
        if ($u.hasContent(button)) {
            caap.click(button);
        }

        state.setItem('guildBattleBattlesRefresh', false);
        return $u.hasContent(button);
    };

    guild_battle.navigate_to_battles = function() {
        return caap.navigateTo('guildv2_battle_summon_list,guildv2_current_battle_battles', 'guild_battle_list_on.jpg');
    };

    guild_battle.populate = function() {
        try {
            var buttons = $j("input[src*='guild_battle_']"),
                slotArr = [],
                it = 0;

            if (buttons && buttons.length) {
                buttons.each(function() {
                    var button = $j(this),
                        form = null,
                        currentRecord = {},
                        imageName = '',
                        slot = 0,
                        name = '',
                        guildId = '',
                        passed = true;

                    form = button.parents("form").eq(0);
                    if (form && form.length) {
                        slot = form.find("input[name='slot']").eq(0).val();
                        slot = slot ? slot.parseInt() : 0;
                        if ($u.isNumber(slot) && slot > 0 && slot <= 5) {
                            con.log(3, "slot", slot);
                            slotArr.push(slot);
                            currentRecord = guild_battle.getItem(slot);
                            name = button.parents().eq(4).text();
                            name = name.replace("has  been summoned!", "");
                            name = name.replace("Join Battle!", "");
                            name = name.replace("Collect Now!", "");
                            name = name ? name.trim() : '';
                            if (name) {
                                if (currentRecord.name !== name) {
                                    con.log(1, "Updated name", currentRecord.name, name);
                                    currentRecord.name = name;
                                }
                            } else {
                                con.warn("name error", name);
                                passed = false;
                            }

                            guildId = form.find("input[name='guild_id']").eq(0).val();
                            if (caap.stats.guild.id && guildId === caap.stats.guild.id) {
                                if (currentRecord.guildId !== guildId) {
                                    con.log(2, "Updated guildId", currentRecord.guildId, guildId);
                                    currentRecord.guildId = guildId;
                                }
                            } else {
                                con.warn("guildId error", guildId, caap.stats.guild.id);
                                passed = false;
                            }

                            imageName = button.attr("src").basename();
                            if (imageName) {
                                switch (imageName) {
                                case "guild_battle_joinbtn.gif":
                                    currentRecord.color = $u.bestTextColor(config.getItem("StyleBackgroundLight", "#E0C961"));
                                    currentRecord.state = "Alive";

                                    break;
                                    // Need to find the image for dragon_list_btn_4.jpg. Its view or fail, might no longer be in use
                                case "guild_battle_collectbtn.gif":
                                case "dragon_list_btn_4.jpg":
                                    currentRecord.color = "grey";
                                    if (currentRecord.state !== "Completed") {
                                        con.log(2, "Updated state", currentRecord.state, "Collect");
                                        currentRecord.state = "Collect";
                                    }

                                    break;
                                default:
                                    currentRecord.state = "Error";
                                    con.warn("state error", imageName);
                                    passed = false;
                                }
                            } else {
                                con.warn("imageName error", button.attr("src"), imageName);
                                passed = false;
                            }
                        } else {
                            con.warn("slot error", slot);
                            passed = false;
                        }
                    } else {
                        con.warn("form error", button);
                        passed = false;
                    }

                    if (passed) {
                        con.log(2, "currentRecord/button", currentRecord, button);
                        guild_battle.setItem(currentRecord);
                    } else {
                        con.warn("populate record failed", currentRecord, button);
                    }

                    button = null;
                    form = null;
                });

                for (it = guild_battle.records.length - 1; it >= 0; it -= 1) {
                    if (!slotArr.hasIndexOf(guild_battle.records[it].slot)) {
                        guild_battle.deleteItem(guild_battle.records[it].slot);
                    }
                }

                guild_battle.select(true);
                buttons = null;
            } else {
                con.log(1, "No buttons found");
                guild_battle.clear();
            }

            caap.updateDashboard(true);
            return true;
        } catch (err) {
            con.error("ERROR in guild_battle.populate: " + err);
            return false;
        }
    };

    guild_battle.onBattle = function() {
        try {
            var gates = $j(),
                health = $j(),
                healthGuild = $j(),
                healthEnemy = $j(),
                allowedDiv = $j(),
                bannerDiv = $j(),
                collectDiv = $j(),
                tempDiv = $j(),
                tempTxt = '',
                collect = false,
                myStatsTxt = '',
                myStatsArr = [],
                slot = 0,
                currentRecord = {},
                minionRegEx = new RegExp("(.*) Level (\\d+) Class: (.*) Health: (.+)/(.+) Status: (.*)");


            caap.chatLink("#app_body #guild_war_chat_log div[style*='border-bottom: 1px'] div[style*='font-size: 15px']");
            slot = $u.setContent($j("input[name='slot']").eq(0).val(), '0').parseInt();
            if (!$u.isNumber(slot) || slot < 1 || slot > 5) {
                tempDiv = $j("#guild_battle_guild_tabs a[href*='guild_battle_battle.php?guild_id=']");
                slot = $u.setContent(tempDiv.attr("href"), 'slot=0').regex(/slot=(\d)/i);
            }

            bannerDiv = $j("#guild_battle_banner_section");
            myStatsTxt = bannerDiv.children().eq(2).children().eq(0).children().eq(1).text();
            myStatsTxt = myStatsTxt ? myStatsTxt.trim().innerTrim() : '';
            if ($u.isNumber(slot) && slot > 0 && slot <= 5) {
                con.log(1, "slot", slot);
                currentRecord = guild_battle.getItem(slot);
                currentRecord.minions = [];
                currentRecord.ticker = '';
                currentRecord.guildHealth = 0;
                currentRecord.enemyHealth = 0;
                if (!bannerDiv.attr("style").match(/_dead/)) {
                    currentRecord.ticker = $j("#battleTicker").text();
                    currentRecord.ticker = currentRecord.ticker ? currentRecord.ticker.trim() : '';
                    if (myStatsTxt) {
                        con.log(1, "myStatsTxt", myStatsTxt);
                        myStatsArr = myStatsTxt.match(new RegExp("(.+) Level: (\\d+) Class: (.+) Health: (\\d+)/(\\d+).+Status: (.+) Battle Damage: (\\d+)"));
                        if (myStatsArr && myStatsArr.length === 8) {
                            con.log(1, "myStatsArr", myStatsArr);
                            currentRecord.damage = myStatsArr[7] ? myStatsArr[7].parseInt() : 0;
                            currentRecord.myStatus = myStatsArr[6] ? myStatsArr[6].trim() : '';
                        } else {
                            con.warn("myStatsArr error", myStatsArr, myStatsTxt);
                        }
                    }

                    allowedDiv = $j("#allowedAttacks");
                    if (allowedDiv && allowedDiv.length) {
                        currentRecord.attacks = allowedDiv.val() ? allowedDiv.val().parseInt() : 1;
                        if (currentRecord.attacks < 1 || currentRecord.attacks > 5) {
                            currentRecord.attacks = 1;
                            con.warn("Invalid allowedAttacks");
                        }
                    } else {
                        con.warn("Could not find allowedAttacks");
                    }

                    health = $j("#guild_battle_health");
                    if (health && health.length) {
                        healthEnemy = $j("div[style*='guild_battle_bar_enemy.gif']", health).eq(0);
                        if ($u.hasContent(healthEnemy)) {
                            currentRecord.enemyHealth = (100 - healthEnemy.getPercent('width')).dp(2);
                        } else {
                            con.warn("guild_battle_bar_enemy.gif not found");
                        }

                        healthGuild = $j("div[style*='guild_battle_bar_you.gif']", health).eq(0);
                        if ($u.hasContent(healthGuild)) {
                            currentRecord.guildHealth = (100 - healthGuild.getPercent('width')).dp(2);
                        } else {
                            con.warn("guild_battle_bar_you.gif not found");
                        }

                        tempDiv = $j("span", health);
                        if ($u.hasContent(tempDiv) && tempDiv.length === 2) {
                            tempTxt = tempDiv.eq(0).text().trim();
                            tempDiv.eq(0).text(tempTxt + " (" + currentRecord.guildHealth + "%)");
                            tempTxt = tempDiv.eq(1).text().trim();
                            tempDiv.eq(1).text(tempTxt + " (" + currentRecord.enemyHealth + "%)");
                        }
                    } else {
                        con.warn("guild_battle_health error");
                    }

                    gates = $j("div[id*='enemy_guild_member_list_']");
                    if (!gates || !gates.length) {
                        con.warn("No gates found");
                    } else if (gates && gates.length !== 4) {
                        con.warn("Not enough gates found");
                    } else {
                        gates.each(function(gIndex) {
                            var memberDivs = $j(this).children();

                            if (!memberDivs || !memberDivs.length) {
                                con.warn("No members found");
                            } else if (memberDivs && memberDivs.length !== guild_battle.info[currentRecord.name].enemy / 4) {
                                con.warn("Not enough members found", memberDivs);
                            } else {
                                memberDivs.each(function() {
                                    var member = $j(this),
                                        memberText = '',
                                        memberArr = [],
                                        targetIdDiv = $j(),
                                        memberRecord = new guild_battle.minion().data;

                                    memberRecord.attacking_position = (gIndex + 1);
                                    targetIdDiv = member.find("input[name='target_id']").eq(0);
                                    if (targetIdDiv && targetIdDiv.length) {
                                        memberRecord.target_id = targetIdDiv.val() ? targetIdDiv.val().parseInt() : 1;
                                    } else {
                                        con.warn("Unable to find target_id for minion!", member);
                                    }

                                    memberText = member.children().eq(1).text();
                                    memberText = memberText ? memberText.trim().innerTrim() : '';
                                    memberArr = memberText.match(minionRegEx);
                                    con.log(1, 'memberArr', memberArr);
                                    if (memberArr && memberArr.length === 7) {
                                        memberRecord.name = memberArr[1] || '';
                                        memberRecord.level = memberArr[2] ? memberArr[2].parseInt() : 0;
                                        memberRecord.mclass = memberArr[3] || '';
                                        memberRecord.healthNum = memberArr[4] ? memberArr[4].parseInt() : 0;
                                        memberRecord.healthMax = memberArr[5] ? memberArr[5].parseInt() : 1;
                                        memberRecord.status = memberArr[6] || '';
                                        memberRecord.percent = ((memberRecord.healthNum / memberRecord.healthMax) * 100).dp(2);
                                    }

                                    con.log(1, 'memberRecord', memberRecord);
                                    currentRecord.minions.push(memberRecord);

                                    member = null;
                                    targetIdDiv = null;
                                });
                            }

                            memberDivs = null;
                        });
                    }
                } else {
                    collectDiv = $j("input[src*='collect_reward_button2.jpg']");
                    if (collectDiv && collectDiv.length) {
                        con.log(1, "Battle is dead and ready to collect");
                        currentRecord.state = 'Collect';
                        if (config.getItem('guildBattleCollect', false)) {
                            collect = true;
                        }
                    } else {
                        con.log(1, "Battle is completed");
                        currentRecord.state = 'Completed';
                    }

                    currentRecord.color = "grey";
                }

                currentRecord.reviewed = Date.now();
                con.log(2, "currentRecord", currentRecord);
                guild_battle.setItem(currentRecord);
                if (collect) {
                    caap.click(collectDiv);
                }
            } else {
                if (bannerDiv.children().eq(0).text().hasIndexOf("You do not have an on going guild battle battle. Have your Guild initiate more!")) {
                //tempDiv = $j("#guild_battle_guild_tabs a[href*='guild_battle_battle.php?guild_id=']");
                //if ($u.hasContent(tempDiv) && tempDiv.attr('href').hasIndexOf(caap.stats.guild.id)) {
                    slot = state.getItem('guildBattleReviewSlot', 0);
                    if ($u.isNumber(slot) && slot > 0 && slot <= 5) {
                        con.log(1, "battle expired", slot);
                        guild_battle.deleteItem(slot);
                    } else {
                        con.warn("battle expired slot error", slot);
                    }
                } else {
                    con.log(1, "On another guild's battle", myStatsTxt);
                }
            }

            gates = null;
            health = null;
            healthGuild = null;
            healthEnemy = null;
            allowedDiv = null;
            bannerDiv = null;
            collectDiv = null;
            tempDiv = null;
            return true;
        } catch (err) {
            con.error("ERROR in guild_battle.onBattle: " + err);
            return false;
        }
    };

    guild_battle.getReview = function() {
        try {
            var it = 0,
                len = 0;

            for (it = 0, len = guild_battle.records.length; it < len; it += 1) {
                if (guild_battle.records[it].state !== 'Completed') {
                    if (schedule.since(guild_battle.records[it].reviewed, 30 * 60)) {
                        break;
                    }
                }
            }

            return guild_battle.records[it];
        } catch (err) {
            con.error("ERROR in guild_battle.getReview: " + err);
            return undefined;
        }
    };

    guild_battle.checkPage = function(record) {
        try {
            if (!record || !$j.isPlainObject(record)) {
                throw "Not passed a record";
            }

            var slot = 0;

            slot = $j("input[name='slot']").eq(0).val();
            slot = slot ? slot.parseInt() : 0;
            return (record.slot === slot);
        } catch (err) {
            con.error("ERROR in guild_battle.checkPage: " + err);
            return undefined;
        }
    };

    guild_battle.getTargetMinion = function(record) {
        try {
            var it = 0,
                ol = 0,
                len = 0,
                alive = 0,
                minion = {},
                minHealth = 0,
                specialTargets = [],
                firstSpecial = -1,
                ignoreClerics = false,
                attackOrderList = [],
                isSpecial = false,
                isMatch = false,
                attackNorth = config.getItem('attackGateNorth', true),
                attackEast = config.getItem('attackGateEast', true),
                attackSouth = config.getItem('attackGateSouth', true),
                attackWest = config.getItem('attackGateWest', true);

            if (!record || !$j.isPlainObject(record)) {
                throw "Not passed a record";
            }

            minHealth = config.getItem('IgnoreMinionsBelow', 0);
            if (!$u.isNumber(minHealth)) {
                minHealth = 0;
            }

            attackOrderList = config.getList('orderGuildMinion', '');
            if (!attackOrderList || attackOrderList.length === 0) {
                attackOrderList = [String.fromCharCode(0)];
                con.log(1, "Added null character to getTargetMinion attackOrderList", attackOrderList);
            }

            ignoreClerics = config.getItem('ignoreClerics', false);
            // current thinking is that continue should not be used as it can cause reader confusion
            // therefore when linting, it throws a warning
            /*jslint continue: true */
            for (ol = 0, len = attackOrderList.length; ol < len; ol += 1) {
                if (minion && $j.isPlainObject(minion) && !$j.isEmptyObject(minion)) {
                    con.log(1, "Minion matched and set - break", minion);
                    break;
                }

                specialTargets = guild_battle.info[record.name].special1.slice();
                for (it = record.minions.length - 1; it >= 0; it -= 1) {
                    if (!attackNorth && record.minions[it].attacking_position === 1) {
                        con.log(1, "Skipping North Minion", it, record.minions[it]);
                        continue;
                    }

                    if (!attackWest && record.minions[it].attacking_position === 2) {
                        con.log(1, "Skipping West Minion", it, record.minions[it]);
                        continue;
                    }

                    if (!attackEast && record.minions[it].attacking_position === 3) {
                        con.log(1, "Skipping East Minion", it, record.minions[it]);
                        continue;
                    }

                    if (!attackSouth && record.minions[it].attacking_position === 4) {
                        con.log(1, "Skipping South Minion", it, record.minions[it]);
                        continue;
                    }

                    if (attackOrderList[ol] === String.fromCharCode(0)) {
                        isMatch = true;
                    } else {
                        isMatch = !record.minions[it].name.toLowerCase().hasIndexOf(attackOrderList[ol].match(new RegExp("^[^:]+")).toString().trim().toLowerCase());
                    }

                    if (isMatch) {
                        con.log(1, "Minion matched", it, record.minions[it]);
                    }

                    isSpecial = specialTargets.hasIndexOf(it);
                    if (record.minions[it].status === 'Stunned') {
                        con.log(1, 'Stunned', isMatch, isSpecial, record.minions[it].healthNum);
                        if (isSpecial && $u.isNaN(record.minions[it].healthNum)) {
                            specialTargets.pop();
                            if (isMatch) {
                                con.log(1, "Special minion stunned", specialTargets);
                            }
                        } else if (isMatch) {
                            con.log(1, "Minion stunned");
                        }

                        continue;
                    }

                    // need to look at this when next fighting one, don't think ignore cleric code is correct
                    if (isSpecial) {
                        if (!$u.isNaN(record.minions[it].healthNum)) {
                            specialTargets.pop();
                            con.log(1, "Not special minion", it, specialTargets);
                            if (ignoreClerics && record.minions[it].mclass === "Cleric") {
                                con.log(1, "Ignoring Cleric", record.minions[it]);
                                continue;
                            }
                        } else if (firstSpecial < 0) {
                            firstSpecial = it;
                            con.log(1, "firstSpecial minion", firstSpecial);
                        } else {
                            con.log(1, "Special minion", it, specialTargets);
                        }
                    } else {
                        if (ignoreClerics && record.minions[it].mclass === "Cleric") {
                            con.log(1, "Ignoring Cleric", record.minions[it]);
                            continue;
                        }
                    }

                    if ($u.isNumber(minHealth) && !isSpecial) {
                        if (record.minions[it].healthNum < minHealth) {
                            if (!alive) {
                                alive = it;
                                con.log(1, "First alive", alive);
                            }

                            continue;
                        }
                    }

                    if (isMatch) {
                        minion = record.minions[it];
                        break;
                    }
                }
            }
            /*jslint continue: false */

            if ($j.isEmptyObject(minion) && firstSpecial >= 0) {
                minion = record.minions[firstSpecial];
                con.log(1, "Target Special", firstSpecial, record.minions[firstSpecial]);
            }

            if (config.getItem('chooseIgnoredMinions', false) && alive) {
                minion = record.minions[alive];
                con.log(1, "Target Alive", alive, record.minions[alive]);
            }

            con.log(1, "Target minion", minion);
            return minion;
        } catch (err) {
            con.error("ERROR in guild_battle.getTargetMinion: " + err);
            return undefined;
        }
    };

    guild_battle.select = function(force) {
        try {
            var it = 0,
                ol = 0,
                len = 0,
                len1 = 0,
                attackOrderList = [],
                conditions = '',
                ach = 999999,
                max = 999999,
                target = {},
                firstOverAch = {},
                firstUnderMax = {};

            if (!(force || caap.oneMinuteUpdate('selectGuildBattle'))) {
                return state.getItem('targetGuildBattle', {});
            }

            state.setItem('targetGuildBattle', {});
            attackOrderList = config.getList('orderGuildBattle', '');
            if (!attackOrderList || attackOrderList.length === 0) {
                attackOrderList = [String.fromCharCode(0)];
                con.log(3, "Added null character to select attackOrderList", attackOrderList);
            }

            // current thinking is that continue should not be used as it can cause reader confusion
            // therefore when linting, it throws a warning
            /*jslint continue: true */
            for (it = guild_battle.records.length - 1; it >= 0; it -= 1) {
                if (guild_battle.records[it].state !== 'Alive') {
                    guild_battle.records[it].color = "grey";
                    guild_battle.records[it].conditions = '';
                    continue;
                }

                attackOrderList.push(guild_battle.records[it].slot.toString());
                guild_battle.records[it].conditions = 'none';
                guild_battle.records[it].color = $u.bestTextColor(config.getItem("StyleBackgroundLight", "#E0C961"));
            }
            /*jslint continue: false */

            // current thinking is that continue should not be used as it can cause reader confusion
            // therefore when linting, it throws a warning
            /*jslint continue: true */
            for (ol = 0, len1 = attackOrderList.length; ol < len1; ol += 1) {
                conditions = attackOrderList[ol].replace(new RegExp("^[^:]+"), '').toString().trim();
                for (it = 0, len = guild_battle.records.length; it < len; it += 1) {
                    if (guild_battle.records[it].state !== 'Alive') {
                        guild_battle.records[it].color = "grey";
                        continue;
                    }

                    if (guild_battle.records[it].myStatus === 'Stunned') {
                        guild_battle.records[it].color = "purple";
                        continue;
                    }

                    if (guild_battle.records[it].conditions !== 'none') {
                        continue;
                    }

                    if (attackOrderList[ol] !== String.fromCharCode(0)) {
                        if (!(guild_battle.records[it].slot + " " + guild_battle.records[it].name.toLowerCase()).hasIndexOf(attackOrderList[ol].match(new RegExp("^[^:]+")).toString().trim().toLowerCase())) {
                            continue;
                        }
                    }

                    if (conditions) {
                        guild_battle.records[it].conditions = conditions;
                        if (conditions.hasIndexOf("ach")) {
                            ach = battle.parseCondition('ach', conditions);
                        }

                        if (conditions.hasIndexOf("max")) {
                            max = battle.parseCondition('max', conditions);
                        }
                    }

                    if (guild_battle.records[it].damage >= ach) {
                        guild_battle.records[it].color = "darkorange";
                        if (!firstOverAch || !$j.isPlainObject(firstOverAch) || $j.isEmptyObject(firstOverAch)) {
                            if (guild_battle.records[it].damage >= max) {
                                guild_battle.records[it].color = "red";
                                con.log(2, 'OverMax', guild_battle.records[it]);
                            } else {
                                firstOverAch = guild_battle.records[it];
                                con.log(2, 'firstOverAch', firstOverAch);
                            }
                        }
                    } else if (guild_battle.records[it].damage < max) {
                        if (!firstUnderMax || !$j.isPlainObject(firstUnderMax) || $j.isEmptyObject(firstUnderMax)) {
                            firstUnderMax = guild_battle.records[it];
                            con.log(2, 'firstUnderMax', firstUnderMax);
                        }
                    } else {
                        guild_battle.records[it].color = "red";
                        con.log(2, 'OverMax', guild_battle.records[it]);
                    }
                }
            }
            /*jslint continue: false */

            target = firstUnderMax;
            if (!target || !$j.isPlainObject(target) || $j.isEmptyObject(target)) {
                target = firstOverAch;
            }

            con.log(2, 'Guild Battle Target', target);
            if (target && $j.isPlainObject(target) && !$j.isEmptyObject(target)) {
                target.color = 'green';
                guild_battle.setItem(target);
            } else {
                state.setItem('guildBattleBattlesBurn', false);
                guild_battle.save();
            }

            return state.setItem('targetGuildBattle', target);
        } catch (err) {
            con.error("ERROR in guild_battle.select: " + err);
            return undefined;
        }
    };

	guild_battle.weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

	guild_battle.pageReviewTime = 0;

	guild_battle.GBstatus = 'Start';
	
 	// Parse the menu item too see if a loadout override should be equipped.  If time is during a general override time,
	// the according general will be equipped, and a value of True will be returned continually to the main loop, so no
	// other action will be taken until the time is up.
	guild_battle.checkTime = function (force) {
		try {
			var timeBattlesList = config.getList('timed_guild_battles', ''),
				begin = new Date(),
				end = new Date(),
				timeString = '',
				button = null,
				timedSetting = config.getItem('WhenGuildBattle', ''),
//				match = true,	
				match = (timedSetting === 'Battle available') ? true : false,
				delay = (guild_battle.GBstatus == 'Locked') ? config.getItem('GBStartFreq',1) : config.getItem('GBCheckFreq',5) * 60,
				now = new Date();

			if (schedule.since(guild_battle.pageReviewTime, delay)) {
				if (caap.navigateTo('guildv2_battle')) {
					con.log(2, 'Checking Guild Battle page');
					return true;
				}
				con.log(2, 'Loading keep page to force Guild Page reload');
				return caap.navigateTo('keep');
			}
			if (timedSetting=='Never' || guild_battle.GBstatus !== 'Start') {
				return false;
			}
			con.log(4, 'checkTime start', timeBattlesList);
			// Next we step through the users list getting the name and conditions
			for (var p = 0; p < timeBattlesList.length; p++) {
				if (!timeBattlesList[p].toString().trim()) {
					continue;
				}
				timeString = timeBattlesList[p].toString().trim();
				begin = 0;
				for (var i = 0; i < guild_battle.weekdays.length; i++) {
					if (timeString.indexOf(guild_battle.weekdays[i])>=0) {
						begin = general.parseTime(timeString);
						end = general.parseTime(timeString);
						con.log(5, 'Vars now.getDay, i', now.getDay(), i);
						begin.setDate(begin.getDate() + i - now.getDay()); // Need to check on Sunday case
						end.setDate(end.getDate() + i - now.getDay()); // Need to check on Sunday case
						end.setMinutes(end.getMinutes() + 2 * 60);
						break;
					}
				}
						
				if (!begin) {
					con.log(4, 'No day of week match', now.getDay(), timeString);
					continue;
				}
				con.log(4,'begin ' + $u.makeTime(begin, caap.timeStr(true)) + ' end ' + $u.makeTime(end, caap.timeStr(true)) + ' time ' + $u.makeTime(now, caap.timeStr(true)), begin, end, now);
				
				if (begin < now && now < end) {
					match = true;
					con.log(2, 'Valid time for begin ' + $u.makeTime(begin, caap.timeStr(true)) + ' end ' + $u.makeTime(end, caap.timeStr(true)) + ' time ' + $u.makeTime(now, caap.timeStr(true)), begin, end, now, timeString);
					break;
				}
			}
			if (match) {
				general.priority = config.getItem('GClassGeneral','Use Current');
				if (general.selectSpecific(general.priority)) {
					return true;
				}
				if (caap.navigateTo('guildv2_battle')) {
					return true;
				}
				button = caap.checkForImage('sort_btn_startbattle.gif');
				if ($u.hasContent(button)) {
					con.log(1, 'CLICK GUILD BATTLE START');
					return caap.click(button);
				}
			}
			con.log(4, 'No time match to current time', now);
			return false;
        } catch (err) {
            con.error("ERROR in guild_battle.checkTime: " + err);
            return false;
        }
    };
	
	
    guild_battle.attack2stamina = {
        1: 1,
        2: 5,
        3: 10,
        4: 20,
        5: 50
    };

    guild_battle.getAttackValue = function(record, minion) {
        try {
            if (!minion || !$j.isPlainObject(minion)) {
                throw "Not passed a minion";
            }

            var attack = 0,
                recordInfo = guild_battle.info[record.name],
                specialTargets = recordInfo.special2.slice();

            if (specialTargets.hasIndexOf(minion.target_id) && $u.isNaN(minion.healthNum)) {
                if (caap.stats.staminaT.num < 5) {
                    attack = 1;
                } else if (caap.stats.staminaT.num < 10) {
                    attack = 2;
                } else if (caap.stats.staminaT.num < 20) {
                    attack = 3;
                } else if (caap.stats.staminaT.num < 50) {
                    attack = 4;
                } else {
                    attack = 5;
                }
            } else if (minion.healthNum < recordInfo.health[0]) {
                attack = 1;
            } else if (minion.healthNum < recordInfo.health[1]) {
                if (caap.stats.staminaT.num < 5) {
                    attack = 1;
                } else {
                    attack = 2;
                }
            } else if (minion.healthNum < recordInfo.health[2]) {
                if (caap.stats.staminaT.num < 5) {
                    attack = 1;
                } else if (caap.stats.staminaT.num < 10) {
                    attack = 2;
                } else {
                    attack = 3;
                }
            } else if (minion.healthNum < recordInfo.health[3]) {
                if (caap.stats.staminaT.num < 5) {
                    attack = 1;
                } else if (caap.stats.staminaT.num < 10) {
                    attack = 2;
                } else if (caap.stats.staminaT.num < 20) {
                    attack = 3;
                } else {
                    attack = 4;
                }
            } else {
                if (caap.stats.staminaT.num < 5) {
                    attack = 1;
                } else if (caap.stats.staminaT.num < 10) {
                    attack = 2;
                } else if (caap.stats.staminaT.num < 20) {
                    attack = 3;
                } else if (caap.stats.staminaT.num < 50) {
                    attack = 4;
                } else {
                    attack = 5;
                }
            }

            if (attack > record.attacks) {
                attack = record.attacks;
            }

            con.log(2, 'getAttackValue', attack);
            return attack;
        } catch (err) {
            con.error("ERROR in guild_battle.getAttackValue: " + err);
            return undefined;
        }
    };

    guild_battle.getStaminaValue = function(record, minion) {
        try {
            if (!minion || !$j.isPlainObject(minion)) {
                throw "Not passed a minion";
            }

            var stamina = 0,
                staminaCap = 0,
                recordInfo = guild_battle.info[record.name],
                specialTargets = recordInfo.special2.slice();

            if (specialTargets.hasIndexOf(minion.target_id) && $u.isNaN(minion.healthNum)) {
                stamina = 50;
            } else if (minion.healthNum < recordInfo.health[0]) {
                stamina = 1;
            } else if (minion.healthNum < recordInfo.health[1]) {
                stamina = 5;
            } else if (minion.healthNum < recordInfo.health[2]) {
                stamina = 10;
            } else if (minion.healthNum < recordInfo.health[3]) {
                stamina = 20;
            } else {
                stamina = 50;
            }

            staminaCap = guild_battle.attack2stamina[record.attacks];
            if (stamina > staminaCap) {
                stamina = staminaCap;
            }

            con.log(2, 'getStaminaValue', stamina);
            return stamina;
        } catch (err) {
            con.error("ERROR in guild_battle.getStaminaValue: " + err);
            return undefined;
        }
    };

    guild_battle.menu = function() {
        try {
            // Guild Battle controls
            var gbattleList = ['Battle available', 'At fixed times', 'Never'],
                gbattleInst = [
                    'Battle available will initiate a guild battle whenever the Start Button is available',
                    'At fixed times will allow you to set a schedule of when to start battles',
                    'Never - disables starting guild battles'
                ],
				timed_guild_battles_inst = "List of times when Guild Battles should be started, such as 'Mon 1, Tue 15:30, Wed 8 PM, etc.  Guild battle will be attempted to be started at the listed time and up to two hours after.",
				GBCheckFreqInstructions = "How often in minutes the Guild Battle top page will be visited to see if a Guild Battle is in progress",
				GBStartFreqInstructions = "How often in minutes the Guild Battle top page will be visited if an Auto-match is in progress",
                htmlCode = '';

            htmlCode += caap.startToggle('GuildBattles', 'GUILD BATTLES');
            htmlCode += caap.makeNumberFormTR("Check Guild Battle page", 'GBCheckFreq', GBCheckFreqInstructions, 5, '', '', true, false);
            htmlCode += caap.makeNumberFormTR("Check Guild Battles start", 'GBStartFreq', GBStartFreqInstructions, 1, '', '', true, false);
            htmlCode += caap.makeDropDownTR("Start Guild Battles when", 'WhenGuildBattle', gbattleList, gbattleInst, '', 'Never', false, false, 62);
            htmlCode += caap.startDropHide('WhenGuildBattle', '', 'Never', true);
            htmlCode += caap.startDropHide('WhenGuildBattle', 'FixedTimes', 'At fixed times', false);
            htmlCode += caap.makeTD("Start Guild Battles at these times:");
            htmlCode += caap.makeTextBox('timed_guild_battles', timed_guild_battles_inst, '', '');
            htmlCode += caap.endDropHide('WhenGuildBattle', 'FixedTimes', 'At fixed times', false);
/*            htmlCode += caap.makeCheckTR('Classic Battles First', 'doClassicBattlesFirst', false, 'Prioritise the classic battles and raids before Guild Battles.');
            htmlCode += caap.makeCheckTR('Siege Battle', 'doGuildBattleSiege', true, 'Perform siege assists when visiting your Guild Battle.');
            htmlCode += caap.makeCheckTR('Collect Rewards', 'guildBattleCollect', false, 'Collect the rewards of your completed Guild Battles.');
            htmlCode += caap.makeCheckTR("Do not Attack Clerics", 'ignoreClerics', false, "Do not attack Guild Battle's Clerics. Does not include the Gate minions e.g. Azriel");
            htmlCode += caap.makeTD("Attack Gates");
            htmlCode += caap.makeTD("N" + caap.makeCheckBox('attackGateNorth', true), false, true, "display: inline-block; width: 25%;");
            htmlCode += caap.makeTD("W" + caap.makeCheckBox('attackGateWest', true), false, true, "display: inline-block; width: 25%;");
            htmlCode += caap.makeTD("E" + caap.makeCheckBox('attackGateEast', true), false, true, "display: inline-block; width: 25%;");
            htmlCode += caap.makeTD("S" + caap.makeCheckBox('attackGateSouth', true), false, true, "display: inline-block; width: 25%;");
            htmlCode += caap.makeNumberFormTR("Ignore Below Health", 'IgnoreMinionsBelow', "Do not attack battle minions that have a health below this value.", 0, '', '');
            htmlCode += caap.makeCheckTR('Choose First Alive', 'chooseIgnoredMinions', false, 'When the only selection left is the battle general then go back and attack any previously ignored battle minions.');
            htmlCode += caap.makeTD("Attack Battles in this order");
            htmlCode += caap.makeTextBox('orderGuildBattle', 'Attack your guild battles in this order, can use Slot Number and Name. Control is provided by using :ach and :max', '', '');
            htmlCode += caap.makeTD("Attack Minions in this order");
            htmlCode += caap.makeTextBox('orderGuildMinion', 'Attack your guild minions in this order. Uses the minion name.', '', '');
*/          htmlCode += caap.endDropHide('WhenGuildBattle');
            //htmlCode += caap.makeCheckTR('Enable Arachnid', 'enableSpider', true, 'Allows you to summon the Giant Arachnid.');
            config.setItem('enableSpider', false);
            htmlCode += caap.endToggle;
            return htmlCode;
        } catch (err) {
            con.error("ERROR in guild_battle.menu: " + err);
            return '';
        }
    };

    guild_battle.dashboard = function() {
        try {
            /*-------------------------------------------------------------------------------------\
                Next we build the HTML to be included into the 'caap_guildBattle' div. We set our
                table and then build the header row.
                \-------------------------------------------------------------------------------------*/
            if (config.getItem('DBDisplay', '') === 'Guild Battle' && session.getItem("GuildBattleDashUpdate", true)) {
                var color = '',
                    headers = ['Slot', 'Name', 'Damage', 'Damage%', 'My Status', 'TimeLeft', 'Status', 'Link', '&nbsp;'],
                    values = ['slot', 'name', 'damage', 'enemyHealth', 'myStatus', 'ticker', 'state'],
                    pp = 0,
                    i = 0,
                    len = 0,
                    len1 = 0,
                    data = {
                        text: '',
                        color: '',
                        bgcolor: '',
                        id: '',
                        title: ''
                    },
                    handler = null,
                    head = '',
                    body = '',
                    row = '';

                for (pp = 0; pp < headers.length; pp += 1) {
                    head += caap.makeTh({
                        text: headers[pp],
                        color: '',
                        id: '',
                        title: '',
                        width: ''
                    });
                }

                head = caap.makeTr(head);
                for (i = 0, len = guild_battle.records.length; i < len; i += 1) {
                    row = "";
                    for (pp = 0, len1 = values.length; pp < len1; pp += 1) {
                        switch (values[pp]) {
                        case 'name':
                            data = {
                                text: '<span id="caap_guildbattle_' + pp + '" title="Clicking this link will take you to (' + guild_battle.records[i].slot + ') ' + guild_battle.records[i].name + '" mname="' + guild_battle.records[i].slot +
                                    '" rlink="guild_battle_battle.php?twt2=' + guild_battle.info[guild_battle.records[i].name].twt2 + '&guild_id=' + guild_battle.records[i].guildId + '&slot=' + guild_battle.records[i].slot +
                                    '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + guild_battle.records[i].name + '</span>',
                                color: guild_battle.records[i].color,
                                id: '',
                                title: ''
                            };

                            row += caap.makeTd(data);

                            break;
                        case 'ticker':
                            row += caap.makeTd({
                                text: $u.hasContent(guild_battle.records[i][values[pp]]) ? guild_battle.records[i][values[pp]].regex(/(\d+:\d+):\d+/) : '',
                                color: guild_battle.records[i].color,
                                id: '',
                                title: ''
                            });

                            break;
                        default:
                            row += caap.makeTd({
                                text: $u.hasContent(guild_battle.records[i][values[pp]]) ? guild_battle.records[i][values[pp]] : '',
                                color: guild_battle.records[i].color,
                                id: '',
                                title: ''
                            });
                        }
                    }

                    data = {
                        text: '<a href="' + caap.domain.altered + '/guild_battle_battle.php?twt2=' + guild_battle.info[guild_battle.records[i].name].twt2 + '&guild_id=' + guild_battle.records[i].guildId +
                            '&action=doObjective&slot=' + guild_battle.records[i].slot + '&ref=nf">Link</a>',
                        color: 'blue',
                        id: '',
                        title: 'This is a siege link.'
                    };

                    row += caap.makeTd(data);

                    if ($u.hasContent(guild_battle.records[i].conditions) && guild_battle.records[i].conditions !== 'none') {
                        data = {
                            text: '<span title="User Set Conditions: ' + guild_battle.records[i].conditions + '" class="ui-icon ui-icon-info">i</span>',
                            color: guild_battle.records[i].color,
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
                }

                $j("#caap_guildBattle", caap.caapTopObject).html(caap.makeTable("guild_battle", head, body));

                handler = function(e) {
                    var visitBattleLink = {
                        mname: '',
                        arlink: ''
                    },
                    i = 0,
                        len = 0;

                    for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                        if (e.target.attributes[i].nodeName === 'mname') {
                            visitBattleLink.mname = e.target.attributes[i].nodeValue;
                        } else if (e.target.attributes[i].nodeName === 'rlink') {
                            visitBattleLink.arlink = e.target.attributes[i].nodeValue;
                        }
                    }

                    caap.clickAjaxLinkSend(visitBattleLink.arlink);
                };

                $j("span[id*='caap_guildbattle_']", caap.caapTopObject).off('click', handler).on('click', handler);
                handler = null;

                session.setItem("GuildBattleDashUpdate", false);
            }

            return true;
        } catch (err) {
            con.error("ERROR in guild_battle.dashboard: " + err);
            return false;
        }
    };

}());
