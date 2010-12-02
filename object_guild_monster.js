
////////////////////////////////////////////////////////////////////
//                          guild_monster OBJECT
// this is the main object for dealing with guild monsters
/////////////////////////////////////////////////////////////////////

guild_monster = {
    records: [],

    record: function () {
        this.data = {
            name        : '',
            guildId     : '',
            slot        : 0,
            ticker      : '',
            minions     : [],
            attacks     : 1,
            damage      : 0,
            myStatus    : '',
            reviewed    : 0,
            state       : '',
            enemyHealth : 0,
            guildHealth : 0,
            conditions  : '',
            color       : 'black'
        };
    },

/*
    minion: function () {
        this.data = {
            attacking_position : 0,
            target_id          : 0,
            name               : '',
            level              : 0,
            mclass             : '',
            healthNum          : 0,
            healthMax          : 0,
            status             : '',
            percent            : 0
        };
    },
*/

    me: function () {
        this.data = {
            name               : '',
            level              : 0,
            mclass             : '',
            healthNum          : 0,
            healthMax          : 0,
            status             : '',
            percent            : 0
        };
    },

    info: {
        "Vincent": {
            twt2: "vincent",
            special1: [0],
            special2: [1],
            health: [100, 200, 400, 800]
        },
        "Alpha Vincent": {
            twt2: "alpha_vincent",
            special1: [0],
            special2: [1],
            health: [500, 1000, 2000, 4000]
        },
        "Army of the Apocalypse": {
            twt2: "ca_girls",
            special1: [0, 25, 50, 75],
            special2: [1, 2, 3, 4],
            health: [500, 1000, 2000, 4000]
        }
    },

    load: function () {
        try {
            if (gm.getItem('guild_monster.records', 'default') === 'default' || !$.isArray(gm.getItem('guild_monster.records', 'default'))) {
                gm.setItem('guild_monster.records', this.records);
            } else {
                this.records = gm.getItem('guild_monster.records', this.records);
            }

            /*
            if (this.records.length < 3) {
                var record = new this.record().data;
                $.extend(true, record, this.records[0]);
                record.name ="Alpha Vincent";
                record.slot = 4
                record.myStatus = "Healthy";
                record.ticker = "35:16:42";
                record.state = "Alive";
                record.reviewed = 1391099048253;
                record.color = "black";
                this.records.push(record);
                var record1 = new this.record().data;
                $.extend(true, record1, this.records[0]);
                record1.name ="Vincent";
                record1.slot = 5
                record1.myStatus = "Healthy";
                record1.ticker = "35:16:42";
                record1.state = "Alive";
                record1.reviewed = 1391099048253;
                record1.color = "black";
                this.records.push(record1);
            }

            this.select(true);
            */

            state.setItem("GuildMonsterDashUpdate", true);
            utility.log(3, "guild_monster.load", this.records);
            return true;
        } catch (err) {
            utility.error("ERROR in guild_monster.load: " + err);
            return false;
        }
    },

    save: function () {
        try {
            gm.setItem('guild_monster.records', this.records);
            state.setItem("GuildMonsterDashUpdate", true);
            utility.log(3, "guild_monster.save", this.records);
            return true;
        } catch (err) {
            utility.error("ERROR in guild_monster.save: " + err);
            return false;
        }
    },

    getItem: function (slot) {
        try {
            var it        = 0,
                len       = 0,
                success   = false,
                newRecord = {};

            if (typeof slot !== 'number') {
                utility.warn("slot", slot);
                throw "Invalid identifying slot!";
            }

            if (slot === '') {
                return '';
            }

            for (it = 0, len = this.records.length; it < len; it += 1) {
                if (this.records[it].slot === slot) {
                    success = true;
                    break;
                }
            }

            if (success) {
                utility.log(3, "Got guild_monster record", slot, this.records[it]);
                return this.records[it];
            } else {
                newRecord = new this.record();
                newRecord.data.slot = slot;
                utility.log(3, "New guild_monster record", slot, newRecord.data);
                return newRecord.data;
            }
        } catch (err) {
            utility.error("ERROR in guild_monster.getItem: " + err, arguments.callee.caller);
            return false;
        }
    },

    setItem: function (record) {
        try {
            if (!record || !$.isPlainObject(record)) {
                throw "Not passed a record";
            }

            if (typeof record.slot !== 'number' || record.slot <= 0) {
                utility.warn("slot", record.slot);
                throw "Invalid identifying slot!";
            }

            var it      = 0,
                len     = 0,
                success = false;

            for (it = 0, len = this.records.length; it < len; it += 1) {
                if (this.records[it].slot === record.slot) {
                    success = true;
                    break;
                }
            }

            if (success) {
                this.records[it] = record;
                utility.log(3, "Updated guild_monster record", record, this.records);
            } else {
                this.records.push(record);
                utility.log(3, "Added guild_monster record", record, this.records);
            }

            this.save();
            return true;
        } catch (err) {
            utility.error("ERROR in guild_monster.setItem: " + err);
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

            for (it = 0, len = this.records.length; it < len; it += 1) {
                if (this.records[it].slot === slot) {
                    success = true;
                    break;
                }
            }

            if (success) {
                this.records.splice(it, 1);
                this.save();
                utility.log(3, "Deleted guild_monster record", slot, this.records);
                return true;
            } else {
                utility.warn("Unable to delete guild_monster record", slot, this.records);
                return false;
            }
        } catch (err) {
            utility.error("ERROR in guild_monster.deleteItem: " + err);
            return false;
        }
    },

    clear: function () {
        try {
            utility.log(1, "guild_monster.clear");
            this.records = gm.setItem("guild_monster.records", []);
            state.setItem('staminaGuildMonster', 0);
            state.setItem('targetGuildMonster', {});
            state.setItem("GuildMonsterDashUpdate", true);
            return true;
        } catch (err) {
            utility.error("ERROR in guild_monster.clear: " + err);
            return false;
        }
    },

    navigate_to_main: function () {
        return utility.NavigateTo('guild', 'tab_guild_main_on.gif');
    },

    navigate_to_battles_refresh: function () {
        var button = utility.CheckForImage("guild_monster_tab_on.jpg");
        if (button) {
            utility.Click(button);
        }

        state.setItem('guildMonsterBattlesRefresh', false);
        return button ? true : false;
    },

    navigate_to_battles: function () {
        return utility.NavigateTo('guild,guild_current_monster_battles', 'guild_monster_tab_on.jpg');
    },

    populate: function () {
        try {
            var buttons = $("input[src*='dragon_list_btn_']"),
                slotArr = [],
                it      = 0;

            if (buttons && buttons.length) {
                buttons.each(function () {
                    var button        = $(this),
                        form          = null,
                        currentRecord = {},
                        imageName     = '',
                        slot          = 0,
                        name          = '',
                        guildId       = '',
                        passed        = true;

                    form = button.parents("form").eq(0);
                    if (form && form.length) {
                        slot = parseInt(form.find("input[name='slot']").eq(0).attr("value"), 10);
                        if (typeof slot === 'number' && slot > 0 && slot <= 5) {
                            utility.log(3, "slot", slot);
                            slotArr.push(slot);
                            currentRecord = guild_monster.getItem(slot);
                            name = $.trim(button.parents().eq(4).text());
                            if (name) {
                                if (currentRecord.name !== name) {
                                    utility.log(1, "Updated name", currentRecord.name, name);
                                    currentRecord.name = name;
                                }
                            } else {
                                utility.warn("name error", name);
                                passed = false;
                            }

                            guildId = form.find("input[name='guild_id']").eq(0).attr("value");
                            if (caap.stats.guild.id && guildId === caap.stats.guild.id) {
                                if (currentRecord.guildId !== guildId) {
                                    utility.log(2, "Updated guildId", currentRecord.guildId, guildId);
                                    currentRecord.guildId = guildId;
                                }
                            } else {
                                utility.warn("guildId error", guildId, caap.stats.guild.id);
                                passed = false;
                            }

                            imageName = utility.getHTMLPredicate(button.attr("src"));
                            if (imageName) {
                                switch (imageName) {
                                case "dragon_list_btn_3.jpg":
                                    currentRecord.color = "black";
                                    currentRecord.state = "Alive";
                                    break;
                                case "dragon_list_btn_2.jpg":
                                case "dragon_list_btn_4.jpg":
                                    currentRecord.color = "grey";
                                    if (currentRecord.state !== "Completed") {
                                        utility.log(2, "Updated state", currentRecord.state, "Collect");
                                        currentRecord.state = "Collect";
                                    }

                                    break;
                                default:
                                    currentRecord.state = "Error";
                                    utility.warn("state error", imageName);
                                    passed = false;
                                }
                            } else {
                                utility.warn("imageName error", button.attr("src"), imageName);
                                passed = false;
                            }
                        } else {
                            utility.warn("slot error", slot);
                            passed = false;
                        }
                    } else {
                        utility.warn("form error", button);
                        passed = false;
                    }

                    if (passed) {
                        utility.log(2, "currentRecord/button", currentRecord, button);
                        guild_monster.setItem(currentRecord);
                    } else {
                        utility.warn("populate record failed", currentRecord, button);
                    }
                });

                for (it = this.records.length - 1; it >= 0; it -= 1) {
                    if (slotArr.indexOf(this.records[it].slot) < 0) {
                        this.deleteItem(this.records[it].slot);
                    }
                }

                this.select(true);
            } else {
                utility.log(1, "No buttons found");
                this.clear();
            }

            caap.UpdateDashboard(true);
            return true;
        } catch (err) {
            utility.error("ERROR in guild_monster.populate: " + err);
            return false;
        }
    },

    onMonster: function () {
        try {
            var gates         = null,
                health        = null,
                healthGuild   = null,
                healthEnemy   = null,
                allowedDiv    = null,
                bannerDiv     = null,
                appBodyDiv    = null,
                chatDiv       = null,
                collectDiv    = null,
                collect       = false,
                chatHtml      = '',
                chatArr       = [],
                tempArr       = [],
                tempText      = '',
                myStatsTxt    = '',
                myStatsArr    = [],
                slot          = 0,
                currentRecord = {},
                minionRegEx   = new RegExp("(.*) Level (\\d+) Class: (.*) Health: (.+)/(.+) Status: (.*)"),
                httpRegExp    = new RegExp('.*(http:.*)');

            appBodyDiv = $("#app46755028429_app_body");
            chatDiv = appBodyDiv.find("#app46755028429_guild_war_chat_log div[style*='border-bottom: 1px'] div[style*='font-size: 15px']");
            if (chatDiv && chatDiv.length) {
                chatDiv.each(function () {
                    chatHtml = $.trim($(this).html());
                    if (chatHtml) {
                        chatArr = chatHtml.split("<br>");
                        if (chatArr && chatArr.length === 2) {
                            tempArr = chatArr[1].replace(/"/g, '').match(httpRegExp);
                            if (tempArr && tempArr.length === 2 && tempArr[1]) {
                                tempArr = tempArr[1].split(" ");
                                if (tempArr && tempArr.length) {
                                    tempText = "<a href='" + tempArr[0] + "'>" + tempArr[0] + "</a>";
                                    chatHtml = chatHtml.replace(tempArr[0], tempText);
                                    $(this).html(chatHtml);
                                }
                            }
                        }
                    }
                });
            }

            //utility.log(1, "name", $.trim($("#app46755028429_enemy_guild_member_list_1").children().eq(0).children().eq(1).children().eq(0).text()));
            //utility.log(1, "guidId", $("input[name='guild_id']").eq(0).attr("value"));
            slot = parseInt($("input[name='slot']").eq(0).attr("value"), 10);
            bannerDiv = $("#app46755028429_guild_battle_banner_section");
            myStatsTxt = $.trim(bannerDiv.children().eq(1).children().eq(0).children().eq(1).text()).replace(/\s+/g, ' ');
            if (typeof slot === 'number' && slot > 0 && slot <= 5) {
                utility.log(3, "slot", slot);
                currentRecord = this.getItem(slot);
                currentRecord.minions = [];
                currentRecord.ticker = '';
                currentRecord.guildHealth = 0;
                currentRecord.enemyHealth = 0;

                if (!bannerDiv.attr("style").match(/_dead/)) {
                    currentRecord.ticker = $.trim($("#app46755028429_monsterTicker").text());
                    if (myStatsTxt) {
                        utility.log(3, "myStatsTxt", myStatsTxt);
                        myStatsArr = myStatsTxt.match(new RegExp("(.+) Level: (\\d+) Class: (.+) Health: (\\d+)/(\\d+).+Status: (.+) Battle Damage: (\\d+)"));
                        if (myStatsArr && myStatsArr.length === 8) {
                            utility.log(2, "myStatsArr", myStatsArr);
                            currentRecord.damage = parseInt(myStatsArr[7], 10);
                            currentRecord.myStatus = $.trim(myStatsArr[6]);
                        } else {
                            utility.warn("myStatsArr error", myStatsArr, myStatsTxt);
                        }
                    }

                    allowedDiv = $("#app46755028429_allowedAttacks");
                    if (allowedDiv && allowedDiv.length) {
                        currentRecord.attacks = parseInt(allowedDiv.attr("value"), 10);
                        if (currentRecord.attacks < 1 || currentRecord.attacks > 5) {
                            currentRecord.attacks = 1;
                            utility.warn("Invalid allowedAttacks");
                        }
                    } else {
                        utility.warn("Could not find allowedAttacks");
                    }

                    health = $("#app46755028429_guild_battle_health");
                    if (health && health.length) {
                        healthEnemy = health.find("div[style*='guild_battle_bar_enemy.gif']").eq(0);
                        if (healthEnemy && healthEnemy.length) {
                            currentRecord.enemyHealth = 100 - utility.getElementWidth(healthEnemy);
                        } else {
                            utility.warn("guild_battle_bar_enemy.gif not found");
                        }

                        healthGuild = health.find("div[style*='guild_battle_bar_you.gif']").eq(0);
                        if (healthGuild && healthGuild.length) {
                            currentRecord.guildHealth = 100 - utility.getElementWidth(healthGuild);
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
                            } else if (memberDivs && memberDivs.length !== 25) {
                                utility.warn("Not enough members found", memberDivs);
                            } else {
                                memberDivs.each(function (mIndex) {
                                    var member       = $(this),
                                        memberText   = '',
                                        memberArr    = [],
                                        targetIdDiv  = null,
                                        //memberRecord = new guild_monster.minion().data,
                                        memberRecord = {
                                            attacking_position : 0,
                                            target_id          : 0,
                                            name               : '',
                                            level              : 0,
                                            mclass             : '',
                                            healthNum          : 0,
                                            healthMax          : 0,
                                            status             : '',
                                            percent            : 0
                                        };

                                    memberRecord.attacking_position = (gIndex + 1);
                                    //memberRecord.target_id = (gIndex * 25) + (mIndex + 1);
                                    targetIdDiv = member.find("input[name='target_id']").eq(0);
                                    if (targetIdDiv && targetIdDiv.length) {
                                        memberRecord.target_id = parseInt(targetIdDiv.attr("value"), 10);
                                    } else {
                                        utility.warn("Unable to find target_id for minion!", member);
                                    }

                                    memberText = $.trim(member.children().eq(1).text()).replace(/\s+/g, ' ');
                                    memberArr = memberText.match(minionRegEx);
                                    if (memberArr && memberArr.length === 7) {
                                        memberRecord.name = memberArr[1];
                                        memberRecord.level = parseInt(memberArr[2], 10);
                                        memberRecord.mclass = memberArr[3];
                                        memberRecord.healthNum = parseInt(memberArr[4], 10);
                                        memberRecord.healthMax = parseInt(memberArr[5], 10);
                                        memberRecord.status = memberArr[6];
                                        memberRecord.percent = parseFloat(((memberRecord.healthNum / memberRecord.healthMax) * 100).toFixed(2));
                                    }

                                    currentRecord.minions.push(memberRecord);
                                });
                            }
                        });
                    }
                } else {
                    collectDiv = $("input[src*='collect_reward_button2.jpg']");
                    if (collectDiv && collectDiv.length) {
                        utility.log(1, "Monster is dead and ready to collect");
                        currentRecord.state = 'Collect';
                        if (config.getItem('guildMonsterCollect', false)) {
                            collect = true;
                        }
                    } else {
                        utility.log(1, "Monster is completed");
                        currentRecord.state = 'Completed';
                    }

                    currentRecord.color = "grey";
                }

                currentRecord.reviewed = new Date().getTime();
                utility.log(2, "currentRecord", currentRecord);
                this.setItem(currentRecord);
                if (collect) {
                    utility.Click(collectDiv.get(0));
                }
            } else {
                if (bannerDiv.children().eq(0).text().indexOf("You do not have an on going guild monster battle. Have your Guild initiate more!") >= 0) {
                    slot = state.getItem('guildMonsterReviewSlot', 0);
                    if (typeof slot === 'number' && slot > 0 && slot <= 5) {
                        utility.log(1, "monster expired", slot);
                        this.deleteItem(slot);
                    } else {
                        utility.warn("monster expired slot error", slot);
                    }
                //} else if (caap.stats.guild.name && myStatsTxt.indexOf(caap.stats.guild.name) < 0) {
                //    utility.warn("slot error", slot);
                } else {
                    utility.log(1, "On another guild's monster", myStatsTxt);
                }
            }

            return true;
        } catch (err) {
            utility.error("ERROR in guild_monster.onMonster: " + err);
            return false;
        }
    },

    getReview: function () {
        try {
            var it     = 0,
                len    = 0,
                record = {};

            for (it = 0, len = this.records.length; it < len; it += 1) {
                if (this.records[it].state === 'Completed') {
                    continue;
                }

                if (!schedule.since(this.records[it].reviewed, 30 * 60)) {
                    continue;
                }

                record = this.records[it];
                break;
            }

            return record;
        } catch (err) {
            utility.error("ERROR in guild_monster.getReview: " + err, arguments.callee.caller);
            return undefined;
        }
    },

    checkPage: function (record) {
        try {
            if (!record || !$.isPlainObject(record)) {
                throw "Not passed a record";
            }

            var slot = 0;

            //utility.log(1, "name", $.trim($("#app46755028429_enemy_guild_member_list_1").children().eq(0).children().eq(1).children().eq(0).text()));
            //utility.log(1, "guidId", $("input[name='guild_id']").eq(0).attr("value"));
            slot = parseInt($("input[name='slot']").eq(0).attr("value"), 10);
            return (record.slot === slot);
        } catch (err) {
            utility.error("ERROR in guild_monster.checkPage: " + err, arguments.callee.caller);
            return undefined;
        }
    },

    getTargetMinion: function (record) {
        try {
            var it             = 0,
                alive          = 0,
                minion         = {},
                minHealth      = 0,
                specialTargets = this.info[record.name].special1.slice(),
                firstSpecial   = 0;

            if (!record || !$.isPlainObject(record)) {
                throw "Not passed a record";
            }

            minHealth = config.getItem('IgnoreMinionsBelow', 0);
            if (typeof minHealth !== 'number') {
                minHealth = 0;
            }

            for (it = record.minions.length - 1; it >= 0; it -= 1) {
                if (record.minions[it].status === 'Stunned') {
                    if (specialTargets.indexOf(it) >= 0 && !isNaN(record.minions[it].healthNum)) {
                        specialTargets.pop();
                        utility.log(2, "Special minion stunned", it, specialTargets);
                    }

                    continue;
                }

                if (specialTargets.indexOf(it) >= 0) {
                    if (!isNaN(record.minions[it].healthNum)) {
                        specialTargets.pop();
                        utility.log(2, "Not special minion", it, specialTargets);
                    } else if (it > 0 && !firstSpecial) {
                        firstSpecial = it;
                        utility.log(2, "firstSpecial minion", firstSpecial);
                        continue;
                    } else {
                        utility.log(2, "Special minion", it, specialTargets);
                        continue;
                    }
                }

                if (minHealth && specialTargets.indexOf(it) < 0) {
                    if (record.minions[it].healthNum < minHealth) {
                        if (!alive) {
                            alive = it;
                            utility.log(2, "First alive", alive);
                        }

                        continue;
                    }
                }

                minion = record.minions[it];
                break;
            }

            if (it <= 0) {
                minion = record.minions[firstSpecial];
                utility.log(2, "Target Special", firstSpecial, record.minions[firstSpecial]);
            }

            if (config.getItem('chooseIgnoredMinions', false) && alive) {
                minion = record.minions[alive];
                utility.log(2, "Target Alive", alive, record.minions[alive]);
            }

            utility.log(2, "Target minion", minion);
            return minion;
        } catch (err) {
            utility.error("ERROR in guild_monster.getTargetMinion: " + err, arguments.callee.caller);
            return undefined;
        }
    },

    select: function (force) {
        try {
            var it              = 0,
                ol              = 0,
                len             = 0,
                len1            = 0,
                record          = {},
                attackOrderList = [],
                conditions      = '',
                ach             = 999999,
                max             = 999999,
                target          = {},
                firstOverAch    = {},
                firstUnderMax   = {};

            if (!(force || utility.oneMinuteUpdate('selectGuildMonster'))) {
                return false;
            }

            attackOrderList = utility.TextToArray(config.getItem('orderGuildMonster', ''));
            state.setItem('targetGuildMonster', {});
            for (it = this.records.length - 1; it >= 0; it -= 1) {
                if (this.records[it].state !== 'Alive') {
                    this.records[it].color = "grey";
                    this.records[it].conditions = '';
                    continue;
                }

                attackOrderList.push(this.records[it].slot.toString());
                this.records[it].conditions = 'none';
                this.records[it].color = "black";
            }

            for (ol = 0, len1 = attackOrderList.length; ol < len1; ol += 1) {
                conditions = $.trim(attackOrderList[ol].replace(new RegExp("^[^:]+"), '').toString());
                for (it = 0, len = this.records.length ; it < len; it += 1) {
                    if (this.records[it].state !== 'Alive') {
                        this.records[it].color = "grey";
                        continue;
                    }

                    if (this.records[it].myStatus === 'Stunned') {
                        this.records[it].color = "purple";
                        continue;
                    }

                    if (this.records[it].conditions !== 'none') {
                        continue;
                    }

                    if ((this.records[it].slot + " " + this.records[it].name.toLowerCase()).indexOf($.trim(attackOrderList[ol].match(new RegExp("^[^:]+")).toString()).toLowerCase()) < 0) {
                        continue;
                    }

                    if (conditions) {
                        this.records[it].conditions = conditions;
                        if (conditions.indexOf("ach") >= 0) {
                            ach = monster.parseCondition('ach', conditions);
                        }

                        if (conditions.indexOf("max") >= 0) {
                            max = monster.parseCondition('max', conditions);
                        }
                    }

                    if (this.records[it].damage >= ach) {
                        this.records[it].color = "darkorange";
                        if (!firstOverAch || !$.isPlainObject(firstOverAch) || $.isEmptyObject(firstOverAch)) {
                            if (this.records[it].damage >= max) {
                                this.records[it].color = "red";
                                utility.log(2, 'OverMax', this.records[it]);
                            } else {
                                firstOverAch = this.records[it];
                                utility.log(2, 'firstOverAch', firstOverAch);
                            }
                        }
                    } else if (this.records[it].damage < max) {
                        if (!firstUnderMax || !$.isPlainObject(firstUnderMax) || $.isEmptyObject(firstUnderMax)) {
                            firstUnderMax = this.records[it];
                            utility.log(2, 'firstUnderMax', firstUnderMax);
                        }
                    } else {
                        this.records[it].color = "red";
                        utility.log(2, 'OverMax', this.records[it]);
                    }
                }
            }

            target = firstUnderMax;
            if (!target || !$.isPlainObject(target) || $.isEmptyObject(target)) {
                target = firstOverAch;
            }

            utility.log(2, 'target', target);
            if (target && $.isPlainObject(target) && !$.isEmptyObject(target)) {
                target.color = 'green';
                this.setItem(target);
            } else {
                state.setItem('guildMonsterBattlesBurn', false);
                this.save();
            }

            return state.setItem('targetGuildMonster', target);
        } catch (err) {
            utility.error("ERROR in guild_monster.select: " + err, arguments.callee.caller);
            return undefined;
        }
    },

    attack2stamina: {
        1: 1,
        2: 5,
        3: 10,
        4: 20,
        5: 50
    },

    getAttackValue: function (record, minion) {
        try {
            if (!minion || !$.isPlainObject(minion)) {
                throw "Not passed a minion";
            }

            var attack         = 0,
                recordInfo     = this.info[record.name];
                specialTargets = recordInfo.special2.slice();

            if (specialTargets.indexOf(minion.target_id) >= 0 && isNaN(minion.healthNum)) {
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

            utility.log(2, 'getAttackValue', attack);
            return attack;
        } catch (err) {
            utility.error("ERROR in guild_monster.getAttackValue: " + err, arguments.callee.caller);
            return undefined;
        }
    },

    getStaminaValue: function (record, minion) {
        try {
            if (!minion || !$.isPlainObject(minion)) {
                throw "Not passed a minion";
            }

            var stamina        = 0,
                staminaCap     = 0,
                recordInfo     = this.info[record.name];
                specialTargets = recordInfo.special2.slice();

            if (specialTargets.indexOf(minion.target_id) >= 0 && isNaN(minion.healthNum)) {
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

            staminaCap = this.attack2stamina[record.attacks];
            if (stamina > staminaCap) {
                stamina = staminaCap;
            }

            utility.log(2, 'getStaminaValue', stamina);
            return stamina;
        } catch (err) {
            utility.error("ERROR in guild_monster.getStaminaValue: " + err, arguments.callee.caller);
            return undefined;
        }
    }
};