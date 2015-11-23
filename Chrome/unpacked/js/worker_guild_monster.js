/*jslint white: true, browser: true, devel: true, 
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,stats,$j,rison,utility,
$u,chrome,worker,self,caap,config,con,gm,
schedule,gifting,state,army, general,session,monster:true,guild_monster: true */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          guild_monster OBJECT
// this is the main object for dealing with guild monsters
/////////////////////////////////////////////////////////////////////

(function() {
    "use strict";

	worker.add('guild_monster');	
	
    guild_monster.records = [];

    guild_monster.record = function() {
        this.data = {
            'slot': 0,
            'name': '',
            'guildId': '',
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
	
     guild_monster.checkResults = function(page) {
        try {
			switch (page) {
			case 'guild_current_monster_battles' :
				$j("#globalContainer input[src*='guild_battle_']").off('click', caap.guildMonsterEngageListener).on('click', caap.guildMonsterEngageListener);

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
								currentRecord = guild_monster.getItem(slot);
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
								if (stats.guild.id && guildId === stats.guild.id) {
									if (currentRecord.guildId !== guildId) {
										con.log(2, "Updated guildId", currentRecord.guildId, guildId);
										currentRecord.guildId = guildId;
									}
								} else {
									con.warn("guildId error", guildId, stats.guild.id);
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
							guild_monster.setItem(currentRecord);
						} else {
							con.warn("populate record failed", currentRecord, button);
						}

						button = null;
						form = null;
					});

					for (it = guild_monster.records.length - 1; it >= 0; it -= 1) {
						if (!slotArr.hasIndexOf(guild_monster.records[it].slot)) {
							guild_monster.deleteItem(guild_monster.records[it].slot);
						}
					}

					guild_monster.select(true);
					buttons = null;
				} else {
					con.log(1, "No buttons found");
					guild_monster.clear();
				}

				break;
			case 'guild_monster_summon_list' :
				if (config.getItem("enableSpider", true)) {
					guild_monster.enableSpider();
				}
				break;
			case 'guild_battle_monster' :
				$j("#globalContainer input[src*='guild_duel_button']").off('click', caap.guildMonsterEngageListener).on('click', caap.guildMonsterEngageListener);
				break;
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
					tempDiv = $j("#guild_battle_guild_tabs a[href*='guild_battle_monster.php?guild_id=']");
					slot = $u.setContent(tempDiv.attr("href"), 'slot=0').regex(/slot=(\d)/i);
				}

				bannerDiv = $j("#guild_battle_banner_section");
				myStatsTxt = bannerDiv.children().eq(2).children().eq(0).children().eq(1).text();
				myStatsTxt = myStatsTxt ? myStatsTxt.trim().innerTrim() : '';
				if ($u.isNumber(slot) && slot > 0 && slot <= 5) {
					con.log(1, "slot", slot);
					currentRecord = guild_monster.getItem(slot);
					currentRecord.minions = [];
					currentRecord.ticker = '';
					currentRecord.guildHealth = 0;
					currentRecord.enemyHealth = 0;
					if (!bannerDiv.attr("style").match(/_dead/)) {
						currentRecord.ticker = $j("#monsterTicker").text();
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
								} else if (memberDivs && memberDivs.length !== guild_monster.info[currentRecord.name].enemy / 4) {
									con.warn("Not enough members found", memberDivs);
								} else {
									memberDivs.each(function() {
										var member = $j(this),
											memberText = '',
											memberArr = [],
											targetIdDiv = $j(),
											memberRecord = new guild_monster.minion().data;

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
							con.log(1, "Monster is dead and ready to collect");
							currentRecord.state = 'Collect';
							if (config.getItem('guildMonsterCollect', false)) {
								collect = true;
							}
						} else {
							con.log(1, "Monster is completed");
							currentRecord.state = 'Completed';
						}

						currentRecord.color = "grey";
					}

					currentRecord.reviewed = Date.now();
					con.log(2, "currentRecord", currentRecord);
					guild_monster.setItem(currentRecord);
					if (collect) {
						caap.click(collectDiv);
					}
				} else {
					if (bannerDiv.children().eq(0).text().hasIndexOf("You do not have an on going guild monster battle. Have your Guild initiate more!")) {
					//tempDiv = $j("#guild_battle_guild_tabs a[href*='guild_battle_monster.php?guild_id=']");
					//if ($u.hasContent(tempDiv) && tempDiv.attr('href').hasIndexOf(stats.guild.id)) {
						slot = state.getItem('guildMonsterReviewSlot', 0);
						if ($u.isNumber(slot) && slot > 0 && slot <= 5) {
							con.log(1, "monster expired", slot);
							guild_monster.deleteItem(slot);
						} else {
							con.warn("monster expired slot error", slot);
						}
					} else {
						con.log(1, "On another guild's monster", myStatsTxt);
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
				break;
			default :
				break;
			}
        } catch (err) {
            con.error("ERROR in checkResults_guild_battle_monster: " + err);
            return false;
        }
    };

    /*-------------------------------------------------------------------------------------\
    guild_monster.review is a primary action subroutine to mange the guild monster on the dashboard
    \-------------------------------------------------------------------------------------*/
	
	worker.addAction({
		worker : 'guild_monster',
		priority : 1100,
		description : 'Reviewing Guild Monsters',
		functionName : 'review'
	});

    guild_monster.review = function() {
        try {
            /*-------------------------------------------------------------------------------------\
            We do guild monster review once an hour.  Some routines may reset this timer to drive
            GuildMonsterReview immediately.
            \-------------------------------------------------------------------------------------*/
            if (!schedule.check("guildMonsterReview") || config.getItem('WhenGuildMonster', 'Never') === 'Never') {
                return false;
            }

            if (!stats.guild.id) {
                con.log(2, "Going to guild to get Guild Id");
                if (caap.navigateTo('guild')) {
                    return true;
                }
            }

            var record = {},
                url = '',
                objective = '';

            if (state.getItem('guildMonsterBattlesRefresh', true)) {
                if (guild_monster.navigate_to_battles_refresh()) {
                    return true;
                }
            }

            if (!state.getItem('guildMonsterBattlesReview', false)) {
                if (guild_monster.navigate_to_battles()) {
                    return true;
                }

                state.setItem('guildMonsterBattlesReview', true);
            }

            record = guild_monster.getReview();
            if (record && $j.isPlainObject(record) && !$j.isEmptyObject(record)) {
                con.log(1, "Reviewing Slot (" + record.slot + ") Name: " + record.name);
                if (stats.stamina.num > 0 && config.getItem("doGuildMonsterSiege", true)) {
                    objective = "&action=doObjective";
                }
            url = "guild_battle_monster.php?twt2=" + guild_monster.info[record.name].twt2 + "&guild_id=" + record.guildId + objective + "&slot=" + record.slot + "&ref=nf";
                state.setItem('guildMonsterReviewSlot', record.slot);
                caap.ajaxLink(url);
                return true;
            }

            schedule.setItem("guildMonsterReview", (gm ? gm.getItem('guildMonsterReviewMins', 60) : 60) * 60, 300);
            state.setItem('guildMonsterBattlesRefresh', true);
            state.setItem('guildMonsterBattlesReview', false);
            state.setItem('guildMonsterReviewSlot', 0);
            guild_monster.select(true);
            con.log(1, 'Done with guild monster review.');
            return false;
        } catch (err) {
            con.error("ERROR in guild_monster.review: " + err);
            return false;
        }
    };

 	worker.addAction({
		worker : 'guild_monster',
		priority : 900,
		description : 'Fighting Guild Monsters'
	});

	guild_monster.worker = function() {
        function doClassicFirst() {
            if (config.getItem('doClassicMonstersFirst', false) && config.getItem("WhenMonster", 'Never') !== 'Never') {
                if (state.getItem('targetFrombattle_monster', '') || state.getItem('targetFromraid', '')) {
                    return true;
                }
            }

            return false;
        }
		
        try {
            var when = '',
                record = {},
                minion = {},
                form = $j(),
                key = $j(),
                url = '',
                attack = 0,
                stamina = 0;

            when = config.getItem("WhenGuildMonster", 'Never');
            if (when === 'Never') {
                form = null;
                key = null;
                return false;
            }

            if (!stats.guild.id) {
                con.log(2, "Going to guild to get Guild Id");
                if (caap.navigateTo('guild')) {
                    form = null;
                    key = null;
                    return true;
                }
            }

            if (caap.inLevelUpMode()) {
                if (stats.stamina.num < 5) {
                    caap.setDivContent('guild_monster_mess', 'Guild Monster stamina ' + stats.stamina.num + '/' + 5);
                    form = null;
                    key = null;
                    return false;
                }

                if (doClassicFirst()) {
                    form = null;
                    key = null;
                    return false;
                }
            } else if (when === 'Stamina Available') {
                stamina = state.getItem('staminaGuildMonster', 0);
                if (stats.stamina.num < stamina) {
                    caap.setDivContent('guild_monster_mess', 'Guild Monster stamina ' + stats.stamina.num + '/' + stamina);
                    form = null;
                    key = null;
                    return false;
                }

                state.setItem('staminaGuildMonster', 0);
                record = state.getItem('targetGuildMonster', {});
                if (record && $j.isPlainObject(record) && !$j.isEmptyObject(record)) {
                    minion = guild_monster.getTargetMinion(record);
                    if (minion && $j.isPlainObject(minion) && !$j.isEmptyObject(minion)) {
                        stamina = guild_monster.getStaminaValue(record, minion);
                        state.setItem('staminaGuildMonster', stamina);
                        if (stats.stamina.num < stamina) {
                            caap.setDivContent('guild_monster_mess', 'Guild Monster stamina ' + stats.stamina.num + '/' + stamina);
                            form = null;
                            key = null;
                            return false;
                        }
                    } else {
                        form = null;
                        key = null;
                        return false;
                    }
                } else {
                    form = null;
                    key = null;
                    return false;
                }

                if (doClassicFirst()) {
                    form = null;
                    key = null;
                    return false;
                }
            } else if (when === 'At X Stamina') {
                if (stats.stamina.num >= config.getItem("MaxStaminaToGMonster", 20)) {
                    state.setItem('guildMonsterBattlesBurn', true);
                }

                if (stats.stamina.num <= config.getItem("MinStaminaToGMonster", 0) || stats.stamina.num < 1) {
                    state.setItem('guildMonsterBattlesBurn', false);
                }

                if (!state.getItem('guildMonsterBattlesBurn', false)) {
                    caap.setDivContent('guild_monster_mess', 'Guild Monster stamina ' + stats.stamina.num + '/' + config.getItem("MaxStaminaToGMonster", 20));
                    form = null;
                    key = null;
                    return false;
                }

                if (doClassicFirst()) {
                    form = null;
                    key = null;
                    return false;
                }
            } else if (when === 'At Max Stamina') {
                if (stats.stamina.num < stats.stamina.max || stats.stamina.num < 1) {
                    caap.setDivContent('guild_monster_mess', 'Guild Monster stamina ' + stats.stamina.num + '/' + stats.stamina.max);
                    form = null;
                    key = null;
                    return false;
                }

                if (doClassicFirst()) {
                    form = null;
                    key = null;
                    return false;
                }
            }

            caap.setDivContent('guild_monster_mess', '');
            record = guild_monster.select(false);
            //record = guild_monster.select(true);
            //record = state.setItem('targetGuildMonster', {});
            //con.log(1, "record", record);
            if (record && $j.isPlainObject(record) && !$j.isEmptyObject(record)) {
                if (general.Select('Guild_MonsterGeneral')) {
                    form = null;
                    key = null;
                    return true;
                }

                if (!guild_monster.checkPage(record)) {
                    con.log(2, "Fighting Slot (" + record.slot + ") Name: " + record.name);
                    caap.setDivContent('guild_monster_mess', "Fighting (" + record.slot + ") " + record.name);
                    url = "guild_battle_monster.php?twt2=" + guild_monster.info[record.name].twt2 + "&guild_id=" + record.guildId + "&slot=" + record.slot;
                    caap.ajaxLink(url);
                    form = null;
                    key = null;
                    return true;
                }

                minion = guild_monster.getTargetMinion(record);
                if (minion && $j.isPlainObject(minion) && !$j.isEmptyObject(minion)) {
                    con.log(1, "Fighting target_id (" + minion.target_id + ") Name: " + minion.name);
                    caap.setDivContent('guild_monster_mess', "Fighting (" + minion.target_id + ") " + minion.name);
                    key = $j("#attack_key_" + minion.target_id);
                    if (key && key.length) {
                        attack = guild_monster.getAttackValue(record, minion);
                        if (!attack) {
                            form = null;
                            key = null;
                            return false;
                        }

                        key.attr("value", attack);
                        form = key.parents("form").eq(0);
                        if (form && form.length) {
                            caap.click(form.find("input[src*='gb_btn_duel.gif'],input[src*='guild_duel_button2.gif'],input[src*='monster_duel_button.gif']"));
                            form = null;
                            key = null;
                            return true;
                        }
                    }
                }
            }

            form = null;
            key = null;
            return false;
        } catch (err) {
            con.error("ERROR in guildMonster: " + err);
            return false;
        }
    };
	
    guild_monster.minion = function() {
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

    guild_monster.me = function() {
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

    guild_monster.info = {
        "Vincent": {
            twt2: "vincent",
            special1: [0],
            special2: [1],
            health: [100, 200, 400, 800],
            cta_img: ['cta_vincent.gif'],
            enemy: 100
        },
        "Alpha Vincent": {
            twt2: "alpha_vincent",
            special1: [0],
            special2: [1],
            health: [500, 1000, 2000, 4000],
            cta_img: ['cta_alphavincent.gif'],
            enemy: 100
        },
        "Army of the Apocalypse": {
            twt2: "ca_girls",
            special1: [0, 25, 50, 75],
            special2: [1, 2, 3, 4],
            health: [500, 1000, 2000, 4000],
            cta_img: [],
            enemy: 100
        },
        "Giant Arachnid": {
            twt2: "giant_arachnid",
            special1: [0],
            special2: [1],
            health: [100, 200, 400, 800],
            cta_img: ['cta_spider.jpg'],
            enemy: 24
        }
    };

    guild_monster.enableSpider = function() {
        try {
            var ladies = $j("#app_body div[style*='monster_summon_ladies.jpg']").parent(),
                cloned = ladies.clone(),
                tempText = '',
                tempDiv;

            tempDiv = $j("div[style*='monster_summon_ladies.jpg']", cloned);
            tempText = tempDiv.attr("style").replace("ladies", "spider");
            tempDiv.attr("style", tempText);
            tempDiv = $j("div[style*='guild_summon_monster_progress_bar.jpg']", cloned);
            tempText = caap.resultsText.hasIndexOf("Giant Arachnid :") ? $u.setContent($j("#app_body img[src*='nm_class_progress.jpg']").parent().css("width"), "0px") : "0px";
            tempDiv.css("width", tempText);
            tempDiv = $j("input[name='b_type']", cloned);
            tempDiv.val("spider");
            ladies.before(cloned);

            ladies = null;
            tempDiv = null;
            return true;
        } catch (err) {
            con.error("ERROR in guild_monster.which: " + err);
            return false;
        }
    };

    guild_monster.getCtaName = function(img) {
        return guild_monster.which(img, "cta_img");
    };

    guild_monster.which = function(img, entity) {
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

            for (i in guild_monster.info) {
                if (guild_monster.info.hasOwnProperty(i)) {
                    if ($u.hasContent(name)) {
                        break;
                    }

                    r = guild_monster.info[i];
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
            con.error("ERROR in guild_monster.which: " + err);
            return undefined;
        }
    };

    guild_monster.load = function() {
        try {
            guild_monster.records = gm.getItem('guild_monster.records', 'default');
            if (guild_monster.records === 'default' || !$j.isArray(guild_monster.records)) {
                guild_monster.records = gm.setItem('guild_monster.records', []);
            }

            session.setItem("GuildMonsterDashUpdate", true);
            con.log(3, "guild_monster.load", guild_monster.records);
            return true;
        } catch (err) {
            con.error("ERROR in guild_monster.load: " + err);
            return false;
        }
    };

    guild_monster.save = function(src) {
        try {
            if (caap.domain.which === 3) {
                caap.messaging.setItem('guild_monster.records', guild_monster.records);
            } else {
                gm.setItem('guild_monster.records', guild_monster.records);
                con.log(3, "guild_monster.save", guild_monster.records);
                if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif") && src !== "caapif") {
                    con.log(2, "guild_monster.save send");
                    caap.messaging.setItem('guild_monster.records', guild_monster.records);
                }
            }

            if (caap.domain.which !== 0) {
                session.setItem("GuildMonsterDashUpdate", true);
            }

            return true;
        } catch (err) {
            con.error("ERROR in guild_monster.save: " + err);
            return false;
        }
    };

    guild_monster.getItem = function(slot) {
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

            for (it = 0, len = guild_monster.records.length; it < len; it += 1) {
                if (guild_monster.records[it].slot === slot) {
                    success = true;
                    break;
                }
            }

            if (success) {
                con.log(3, "Got guild_monster record", slot, guild_monster.records[it]);
                return guild_monster.records[it];
            }

            newRecord = new guild_monster.record();
            newRecord.data.slot = slot;
            con.log(3, "New guild_monster record", slot, newRecord.data);
            return newRecord.data;
        } catch (err) {
            con.error("ERROR in guild_monster.getItem: " + err);
            return false;
        }
    };

    guild_monster.setItem = function(record) {
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

            for (it = 0, len = guild_monster.records.length; it < len; it += 1) {
                if (guild_monster.records[it].slot === record.slot) {
                    success = true;
                    break;
                }
            }

            if (success) {
                guild_monster.records[it] = record;
                con.log(3, "Updated guild_monster record", record, guild_monster.records);
            } else {
                guild_monster.records.push(record);
                con.log(3, "Added guild_monster record", record, guild_monster.records);
            }

            guild_monster.save();
            return true;
        } catch (err) {
            con.error("ERROR in guild_monster.setItem: " + err);
            return false;
        }
    };

    guild_monster.deleteItem = function(slot) {
        try {
            var it = 0,
                len = 0,
                success = false;

            if (!$u.isNumber(slot) || slot <= 0) {
                con.warn("slot", slot);
                throw "Invalid identifying slot!";
            }

            for (it = 0, len = guild_monster.records.length; it < len; it += 1) {
                if (guild_monster.records[it].slot === slot) {
                    success = true;
                    break;
                }
            }

            if (success) {
                guild_monster.records.splice(it, 1);
                guild_monster.save();
                con.log(3, "Deleted guild_monster record", slot, guild_monster.records);
                return true;
            }

            con.warn("Unable to delete guild_monster record", slot, guild_monster.records);
            return false;
        } catch (err) {
            con.error("ERROR in guild_monster.deleteItem: " + err);
            return false;
        }
    };

    guild_monster.navigate_to_main = function() {
        return caap.navigateTo('guild', 'tab_guild_main_on.gif');
    };

    guild_monster.navigate_to_battles_refresh = function() {
        var button = caap.checkForImage("guild_monster_tab_on.jpg");
        if ($u.hasContent(button)) {
            caap.click(button);
        }

        state.setItem('guildMonsterBattlesRefresh', false);
        return $u.hasContent(button);
    };

    guild_monster.navigate_to_battles = function() {
        return caap.navigateTo('guildv2_monster_summon_list,guildv2_current_monster_battles', 'guild_monster_list_on.jpg');
    };

    guild_monster.getReview = function() {
        try {
            var it = 0,
                len = 0;

            for (it = 0, len = guild_monster.records.length; it < len; it += 1) {
                if (guild_monster.records[it].state !== 'Completed') {
                    if (schedule.since(guild_monster.records[it].reviewed, 30 * 60)) {
                        break;
                    }
                }
            }

            return guild_monster.records[it];
        } catch (err) {
            con.error("ERROR in guild_monster.getReview: " + err);
            return undefined;
        }
    };

    guild_monster.checkPage = function(record) {
        try {
            if (!record || !$j.isPlainObject(record)) {
                throw "Not passed a record";
            }

            var slot = 0;

            slot = $j("input[name='slot']").eq(0).val();
            slot = slot ? slot.parseInt() : 0;
            return (record.slot === slot);
        } catch (err) {
            con.error("ERROR in guild_monster.checkPage: " + err);
            return undefined;
        }
    };

    guild_monster.getTargetMinion = function(record) {
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

                specialTargets = guild_monster.info[record.name].special1.slice();
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
            con.error("ERROR in guild_monster.getTargetMinion: " + err);
            return undefined;
        }
    };

    guild_monster.select = function(force) {
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

            if (!caap.oneMinuteUpdate('selectGuildMonster', force)) {
                return state.getItem('targetGuildMonster', {});
            }

            state.setItem('targetGuildMonster', {});
            attackOrderList = config.getList('orderGuildMonster', '');
            if (!attackOrderList || attackOrderList.length === 0) {
                attackOrderList = [String.fromCharCode(0)];
                con.log(3, "Added null character to select attackOrderList", attackOrderList);
            }

            // current thinking is that continue should not be used as it can cause reader confusion
            // therefore when linting, it throws a warning
            /*jslint continue: true */
            for (it = guild_monster.records.length - 1; it >= 0; it -= 1) {
                if (guild_monster.records[it].state !== 'Alive') {
                    guild_monster.records[it].color = "grey";
                    guild_monster.records[it].conditions = '';
                    continue;
                }

                attackOrderList.push(guild_monster.records[it].slot.toString());
                guild_monster.records[it].conditions = 'none';
                guild_monster.records[it].color = $u.bestTextColor(config.getItem("StyleBackgroundLight", "#E0C961"));
            }
            /*jslint continue: false */

            // current thinking is that continue should not be used as it can cause reader confusion
            // therefore when linting, it throws a warning
            /*jslint continue: true */
            for (ol = 0, len1 = attackOrderList.length; ol < len1; ol += 1) {
                conditions = attackOrderList[ol].replace(new RegExp("^[^:]+"), '').toString().trim();
                for (it = 0, len = guild_monster.records.length; it < len; it += 1) {
                    if (guild_monster.records[it].state !== 'Alive') {
                        guild_monster.records[it].color = "grey";
                        continue;
                    }

                    if (guild_monster.records[it].myStatus === 'Stunned') {
                        guild_monster.records[it].color = "purple";
                        continue;
                    }

                    if (guild_monster.records[it].conditions !== 'none') {
                        continue;
                    }

                    if (attackOrderList[ol] !== String.fromCharCode(0)) {
                        if (!(guild_monster.records[it].slot + " " + guild_monster.records[it].name.toLowerCase()).hasIndexOf(attackOrderList[ol].match(new RegExp("^[^:]+")).toString().trim().toLowerCase())) {
                            continue;
                        }
                    }

                    if (conditions) {
                        guild_monster.records[it].conditions = conditions;
                        if (conditions.hasIndexOf("ach")) {
                            ach = monster.parseCondition('ach', conditions);
                        }

                        if (conditions.hasIndexOf("max")) {
                            max = monster.parseCondition('max', conditions);
                        }
                    }

                    if (guild_monster.records[it].damage >= ach) {
                        guild_monster.records[it].color = "darkorange";
                        if (!firstOverAch || !$j.isPlainObject(firstOverAch) || $j.isEmptyObject(firstOverAch)) {
                            if (guild_monster.records[it].damage >= max) {
                                guild_monster.records[it].color = "red";
                                con.log(2, 'OverMax', guild_monster.records[it]);
                            } else {
                                firstOverAch = guild_monster.records[it];
                                con.log(2, 'firstOverAch', firstOverAch);
                            }
                        }
                    } else if (guild_monster.records[it].damage < max) {
                        if (!firstUnderMax || !$j.isPlainObject(firstUnderMax) || $j.isEmptyObject(firstUnderMax)) {
                            firstUnderMax = guild_monster.records[it];
                            con.log(2, 'firstUnderMax', firstUnderMax);
                        }
                    } else {
                        guild_monster.records[it].color = "red";
                        con.log(2, 'OverMax', guild_monster.records[it]);
                    }
                }
            }
            /*jslint continue: false */

            target = firstUnderMax;
            if (!target || !$j.isPlainObject(target) || $j.isEmptyObject(target)) {
                target = firstOverAch;
            }

            con.log(2, 'Guild Monster Target', target);
            if (target && $j.isPlainObject(target) && !$j.isEmptyObject(target)) {
                target.color = 'green';
                guild_monster.setItem(target);
            } else {
                state.setItem('guildMonsterBattlesBurn', false);
                guild_monster.save();
            }

            return state.setItem('targetGuildMonster', target);
        } catch (err) {
            con.error("ERROR in guild_monster.select: " + err);
            return undefined;
        }
    };

    guild_monster.attack2stamina = {
        1: 1,
        2: 5,
        3: 10,
        4: 20,
        5: 50
    };

    guild_monster.getAttackValue = function(record, minion) {
        try {
            if (!minion || !$j.isPlainObject(minion)) {
                throw "Not passed a minion";
            }

            var attack = 0,
                recordInfo = guild_monster.info[record.name],
                specialTargets = recordInfo.special2.slice();

            if (specialTargets.hasIndexOf(minion.target_id) && $u.isNaN(minion.healthNum)) {
                if (stats.stamina.num < 5) {
                    attack = 1;
                } else if (stats.stamina.num < 10) {
                    attack = 2;
                } else if (stats.stamina.num < 20) {
                    attack = 3;
                } else if (stats.stamina.num < 50) {
                    attack = 4;
                } else {
                    attack = 5;
                }
            } else if (minion.healthNum < recordInfo.health[0]) {
                attack = 1;
            } else if (minion.healthNum < recordInfo.health[1]) {
                if (stats.stamina.num < 5) {
                    attack = 1;
                } else {
                    attack = 2;
                }
            } else if (minion.healthNum < recordInfo.health[2]) {
                if (stats.stamina.num < 5) {
                    attack = 1;
                } else if (stats.stamina.num < 10) {
                    attack = 2;
                } else {
                    attack = 3;
                }
            } else if (minion.healthNum < recordInfo.health[3]) {
                if (stats.stamina.num < 5) {
                    attack = 1;
                } else if (stats.stamina.num < 10) {
                    attack = 2;
                } else if (stats.stamina.num < 20) {
                    attack = 3;
                } else {
                    attack = 4;
                }
            } else {
                if (stats.stamina.num < 5) {
                    attack = 1;
                } else if (stats.stamina.num < 10) {
                    attack = 2;
                } else if (stats.stamina.num < 20) {
                    attack = 3;
                } else if (stats.stamina.num < 50) {
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
            con.error("ERROR in guild_monster.getAttackValue: " + err);
            return undefined;
        }
    };

    guild_monster.getStaminaValue = function(record, minion) {
        try {
            if (!minion || !$j.isPlainObject(minion)) {
                throw "Not passed a minion";
            }

            var stamina = 0,
                staminaCap = 0,
                recordInfo = guild_monster.info[record.name],
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

            staminaCap = guild_monster.attack2stamina[record.attacks];
            if (stamina > staminaCap) {
                stamina = staminaCap;
            }

            con.log(2, 'getStaminaValue', stamina);
            return stamina;
        } catch (err) {
            con.error("ERROR in guild_monster.getStaminaValue: " + err);
            return undefined;
        }
    };

    guild_monster.menu = function() {
        try {
            // Guild Monster controls
            var mbattleList = ['Stamina Available', 'At Max Stamina', 'At X Stamina', 'Never'],
                mbattleInst = [
                    'Stamina Available will attack whenever you have enough stamina',
                    'At Max Stamina will attack when stamina is at max and will burn down all stamina when able to level up',
                    'At X Stamina you can set maximum and minimum stamina to battle',
                    'Never - disables attacking monsters'
                ],
                htmlCode = '';

            htmlCode += caap.startToggle('GuildMonsters', 'GUILD MONSTERS');
            htmlCode += caap.makeDropDownTR("Attack When", 'WhenGuildMonster', mbattleList, mbattleInst, '', 'Never', false, false, 62);
            htmlCode += caap.display.start('WhenGuildMonster', 'isnot', 'Never');
            htmlCode += caap.display.start('WhenGuildMonster', 'is', 'At X Stamina');
            htmlCode += caap.makeNumberFormTR("Start At Or Above", 'MaxStaminaToGMonster', '', 0, '', '', true, false);
            htmlCode += caap.makeNumberFormTR("Stop At Or Below", 'MinStaminaToGMonster', '', 0, '', '', true, false);
            htmlCode += caap.display.end('WhenGuildMonster', 'is', 'At X Stamina');
            htmlCode += caap.makeCheckTR('Classic Monsters First', 'doClassicMonstersFirst', false, 'Prioritise the classic monsters and raids before Guild Monsters.');
            htmlCode += caap.makeCheckTR('Siege Monster', 'doGuildMonsterSiege', true, 'Perform siege assists when visiting your Guild Monster.');
            htmlCode += caap.makeCheckTR('Collect Rewards', 'guildMonsterCollect', false, 'Collect the rewards of your completed Guild Monsters.');
            htmlCode += caap.makeCheckTR("Do not Attack Clerics", 'ignoreClerics', false, "Do not attack Guild Monster's Clerics. Does not include the Gate minions e.g. Azriel");
            htmlCode += caap.makeTD("Attack Gates");
            htmlCode += caap.makeTD("N" + caap.makeCheckBox('attackGateNorth', true), false, true, "display: inline-block; width: 25%;");
            htmlCode += caap.makeTD("W" + caap.makeCheckBox('attackGateWest', true), false, true, "display: inline-block; width: 25%;");
            htmlCode += caap.makeTD("E" + caap.makeCheckBox('attackGateEast', true), false, true, "display: inline-block; width: 25%;");
            htmlCode += caap.makeTD("S" + caap.makeCheckBox('attackGateSouth', true), false, true, "display: inline-block; width: 25%;");
            htmlCode += caap.makeNumberFormTR("Ignore Below Health", 'IgnoreMinionsBelow', "Do not attack monster minions that have a health below this value.", 0, '', '');
            htmlCode += caap.makeCheckTR('Choose First Alive', 'chooseIgnoredMinions', false, 'When the only selection left is the monster general then go back and attack any previously ignored monster minions.');
            htmlCode += caap.makeTD("Attack Monsters in this order");
            htmlCode += caap.makeTextBox('orderGuildMonster', 'Attack your guild monsters in this order, can use Slot Number and Name. Control is provided by using :ach and :max', '', '');
            htmlCode += caap.makeTD("Attack Minions in this order");
            htmlCode += caap.makeTextBox('orderGuildMinion', 'Attack your guild minions in this order. Uses the minion name.', '', '');
            htmlCode += caap.display.end('WhenGuildMonster', 'isnot', 'Never');
            //htmlCode += caap.makeCheckTR('Enable Arachnid', 'enableSpider', true, 'Allows you to summon the Giant Arachnid.');
            config.setItem('enableSpider', false);
            htmlCode += caap.endToggle;
            return htmlCode;
        } catch (err) {
            con.error("ERROR in guild_monster.menu: " + err);
            return '';
        }
    };

	guild_monster.dashboard = {		
		name: 'Guild Monsters',
		inst: 'Display your Guild Monsters',
		records: 'guild_monster',
		buttons: [{name: 'Refresh Monster List',
			func: function() {
				state.setItem('staminaGuildMonster', 0);
				state.setItem('targetGuildMonster', {});
				guild_monster.save('update');
				schedule.setItem("guildMonsterReview", 0);
			}
		}],
		tableTemplate: {
			colorF: function(cM) {
				return cM.color;
		}},
		tableEntries: [
			{name: 'Name', color: 'blue', 
				valueF: function(cM) {
					var link = '"guild_battle_monster.php?twt2=' + guild_monster.info[cM.name].twt2 + '&guild_id=' + cM.guildId +
						'&slot=' + cM.slot;
					return '<a href="' + caap.domain.altered + '/' + link + '" onclick="ajaxLinkSend(\'globalContainer\', \'' + link +
						'\'); ' + ' return false;" style="text-decoration:none;font-size:9px;">' + cM.name + '</a>';
			}},
			{name: 'Damage'},
			{name: 'Damage%', value: 'enemyHealth'},
			{name: 'My Status', value: 'myStatus'},
			{name: 'TimeLeft', format: 'time',
				valueF: function(r) {
					return $u.hasContent(r.ticker) ? r.ticker.regex(/(\d+:\d+):\d+/) : '';
			}},
			{name: 'Status', value: 'state'},
			{name: 'name', type: 'remove'}
		]
	};

}());
