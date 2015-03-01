/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,u,image64,gm,
schedule,gifting,state,army, general,session,monster:true,guild_monster */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          monster OBJECT
// this is the main object for dealing with Monsters
/////////////////////////////////////////////////////////////////////

(function() {
    "use strict";

	worker.add('monster');
	worker.addRecordFunctions('monster');

	monster.lastClick = null;
	
	monster.recordIndex = 'link';
	monster.record = function(link) {
        this.data = {
            'link': link,
            'name': false,
            'userName': '',
            'monster': '',
            'attacked': -1,
            'defended': 0,
            'damage': -1,
            'life': 100,
			'lpage' : '',
            'fortify': -1,
            'time': 168,
            't2k': 168,
            'phase': -1,
            'miss': 0,
            'rix': -1,
            'over': '',
            'color': '',
			'join' : false,
            'review': -1,
            'conditions': '',
			'fullC' : '',
            'charClass': '',
			'listStamina' : '10',
			'listEnergy' : '',
			'multiNode' : false,
			'score' : 0, // Used to score monster finder targets to pick one to join
			'siegeLevel' : 0,
			'doSiege' : false,
			'spentEnergy' : 0,
			'spentStamina' : 0,
			'debtStamina' : 0,
			'debtStart' : -1,
            'strength': -1,
            'stun': -1,
            'stunTime': -1,
            'stunDo': false,
			'stunSetting' : 0,
			'stunTarget' : 0,
            'status': false,
            'stunType': '',
			'targetPart' : -1,
			'listReviewed' : 0,
			'lMissing' : 0,
            'save': true,
            'select': false
        };
    };

    monster.checkResults = function (page, ajax, aslice) {
        try {
			var lastClick = $u.setContent(monster.lastClick, session.getItem('clickUrl',''));
			
			monster.lastClick = '';
			
			switch (page) {
			case 'army_news_feed' :
				if (!config.getItem('enableMonsterFinder', false)) {
					return true;
				}

				feed.items("feed");
				break;
				
			case 'player_monster_list':
        	case 'public_monster_list':
        	case 'raid':
				slice = $u.setContent(slice, $j("#app_body"));
				var buttonsDiv = $j("img[src*='dragon_list_btn_'],input[src*='list_btn_atk'],input[src*='monster_button_'],img[src*='festival_monster_'],img[src*='festival_monster2_'],img[src*='conq2_monster_'],img[src*='list_conq_']", slice),
					page = session.getItem('page', ''),
					pageURL = session.getItem('clickUrl', ''),
					mR = {},
					it = 0,
					siege = '',
					engageButtonName = '',
					monsterName = '',
					monsterRow = $j("div[style*='monsterlist_container2.gif'], div[style*='pubmonster_middlef.gif']", slice),
					conditions = false,
					monsterFull = '',
					tempText = '',
					monsterText = '',
					userName = '',
					mName = '',
					now = Date.now(),
					link = '',
					lpage = '', // page where monster list is
					pageUserCheck = 0,
					newInputsDiv = $j(),
					publicList = page === 'public_monster_list';

				//con.log(2, "Checking monster list page results", page, pageURL, monsterRow);
				if (publicList) {
					lpage = 'player_monster_list';
				} else {
					if (page === 'guildv2_monster_list') {
						lpage = 'ajax:' + session.getItem('clickUrl', '').replace(/http.*\//,'');
					} else if (page === 'raid') {
						lpage = 'ajax:raid.php';
					} else if (page === 'player_monster_list') {
						if (pageURL.indexOf('monster_filter=2') >=0) {
							lpage = 'ajax:player_monster_list.php?monster_filter=2'
						} else if (pageURL.indexOf('monster_filter=3') >=0) {
							lpage = 'ajax:player_monster_list.php?monster_filter=3';
						} else {
							lpage = 'player_monster_list';
						}
					} else {
						con.log(2,'caap.checkResults_monsterList Unexpected page ' + page);
						return false;
					}
					monster.setrPage(lpage,'review',now);
				}
				
				// get all buttons to check monsterObjectList
				if (!$u.hasContent(buttonsDiv) && !$u.hasContent(monsterRow)) {
					con.log(2, "No buttons found");
					return false;
				}

				if (page === 'player_monster_list' || publicList) {
					// Review monsters and find attack and fortify button
					for (it = 0; it < monsterRow.length; it += 1) {
						// Make links for easy clickin'
						/*jslint continue: true */
						if (!$u.hasContent($j("input[id^='share_link_']", monsterRow.eq(it)))) {
							con.log(2, "No URL found", it, monsterRow.eq(it));
							continue;
						}
						/*jslint continue: false */
						monsterName =  $j("div[style*='bold']", monsterRow.eq(it)).text().trim().replace(/,.*/,'').toLowerCase().ucWords();
						monsterName = monster.getInfo(monsterName, 'alias', monsterName);
						conditions = '';
						if (publicList) {
							conditions = feed.addConditions(monsterName);
							if (conditions === false) {
								continue;
							}
						}

						link = $j("input[id^='share_link_']", monsterRow.eq(it)).attr("value").replace(/http.*\//,'');
						mR = monster.getRecord(monster.cleanLink(link));
						mR.lpage = lpage;
						mR.monster = monsterName;
						if (publicList) {
							mR.conditions = conditions;
						}

						mR.name = mR.name || $j("div[style*='20px']", monsterRow.eq(it)).text().trim() + ' ' + monsterName;
						mR.listReviewed = now;
						if (publicList) {
							mR.status = mR.status || 'Join';
						} else {
							newInputsDiv = $j("img[src*='list_btn_']", monsterRow.eq(it));
							engageButtonName = $u.setContent(newInputsDiv.attr("src"), '').regex(/list_btn_(\w*)/);
							switch (engageButtonName) {
								case 'collect':
									feed.checkDeath(mR);
									mR.status = mR.status == 'Attack' ? 'Dead or fled' : mR.status || 'Dead or fled';
									mR.color = 'grey';
									break;
								case 'atk':
									mR.status = mR.status || 'Attack';
									break;
								default:
									con.warn("Unknown engageButtonName status", engageButtonName, newInputsDiv.attr("src"));
							}
						}

						con.log(2, "Monster " + mR.name, link, mR.status, mR);
						monster.setRecord(mR);
					}
					
				} else {
					// Raid page
					if (lastClick) {
						con.log(1, "Deleting raid that has expired",lastClick);
						monster.lastClick = false;
						monster.deleteRecord(lastClick);
					}

					tempText = buttonsDiv.eq(0).parent().attr("href");
					pageUserCheck = session.getItem('pageUserCheck', 0);
					if (pageUserCheck && tempText && !(new RegExp('user=' + caap.stats.FBID).test(tempText) || /alchemy\.php/.test(tempText))) {
						con.log(2, "On another player's keep.", pageUserCheck);
						buttonsDiv = null;
						monsterRow = null;
						newInputsDiv = null;
						return false;
					}

					// Review monsters and find attack and fortify button
					con.log(2, "buttonsDiv", buttonsDiv);
					for (it = 0; it < buttonsDiv.length; it += 1) {
						// Make links for easy clickin'
						link = buttonsDiv.eq(it).parent().attr("href");
						con.log(3, "link", link);
						/*jslint continue: true */
						if (!(link && /user=/.test(link) && (/mpool=/.test(link) || /raid\.php/.test(link)))) {
							continue;
						}
						/*jslint continue: false */

						link = link.replace(/http.*\//, '');
						monsterRow = buttonsDiv.eq(it).parents().eq(3);
						monsterFull = monsterRow.text().trim().innerTrim();
						monsterName = monsterFull.replace(/Completed!/i, '').replace(/Fled!/i, '').replace(/COLLECTION: \d+:\d+:\d+/i, '').trim().innerTrim();
						if (/^Your /.test(monsterName)) {
							monsterText = monsterName.replace(/^Your /, '').trim().innerTrim().toLowerCase().ucWords();
							userName = "Your";
						} else {
							monsterText = monsterName.replace(new RegExp(".+'s (.+)$"), '$1').replace(/,.*/,'');
							userName = monsterName.replace(monsterText, '').trim();
							monsterText = monsterText.trim().innerTrim().toLowerCase().ucWords();
						}

						tempText = $j("div[style*='.jpg']", monsterRow).eq(0).attr("style").regex(new RegExp(".*\\/(.*\\.jpg)"));
						monsterText = monster.getInfo(tempText, 'alias', monsterText);
						mName = userName + ' ' + monsterText;
						con.log(2, "Monster Name", mName);
						con.log(3, "checkResults_monsterList page", page.replace(/festival_tower\d*/, "festival_battle_monster"), link);
						mR = monster.getRecord(monster.cleanLink(link));
						mR.name = mName;
						mR.userName = userName;
						mR.monster = monsterText;
						mR.lpage = lpage;
						engageButtonName = $u.setContent(buttonsDiv.eq(it).attr("src"), '').regex(/(dragon_list_btn_\d)/i);
						mR.listReviewed = now;

						switch (engageButtonName) {
							case 'collectbtn':
							case 'dragon_list_btn_2':
								feed.checkDeath(mR);
								mR.status = 'Collect';
								mR.color = 'grey';

								break;
							case 'engagebtn':
							case 'dragon_list_btn_3':

								break;
							case 'viewbtn':
							case 'dragon_list_btn_4':
								feed.checkDeath(mR);
								if (page === 'raid' && !(/!/.test(monsterFull))) {
									break;
								}

								if ((page !== "festival_tower" && page !== "festival_tower2" && !$u.hasContent(monster.completeButton[page.replace(/festival_tower\d*/, "battle_monster")].button)) ||
										!$u.hasContent(monster.completeButton[page.replace(/festival_tower\d*/, "battle_monster")].link)) {
									monster.completeButton[page.replace(/festival_tower\d*/, "battle_monster")].link = $u.setContent(mR.link, '');
									monster.completeButton[page.replace(/festival_tower\d*/, "battle_monster")].name = $u.setContent(mR.name, '');
									monster.completeButton[page.replace(/festival_tower\d*/, "battle_monster")].button = $u.setContent($j("img[src*='cancelButton.gif']", monsterRow), null);
								}

								mR.status = 'Done';
								mR.color = 'grey';

								break;
							default:
						}

						mR.mid = /mid=\S+/.test(link) ? '&mid=' + link.regex(/mid=(\S+)[&]*/) : '';
						monster.setRecord(mR);
					}
				}

				for (it = monster.records.length - 1; it >= 0; it -= 1) {
					mR = monster.records[it];
					if (mR.lpage === lpage && !publicList && mR.status !== 'Join') {
						if (mR.listReviewed < now) {
							mR.lMissing += 1;
							monster.setRecord(mR);
							con.warn('Did not see monster ' + mR.name + ' on monster list ' + mR.lMissing + ' times.', mR);
						} else {
							mR.lMissing = 0;
						}
						monster.setRecord(mR);
					}
				}
				session.getItem("feedDashUpdate", true)
				caap.updateDashboard(true);
				break;
				
			case 'onMonster': 
			case 'battle_monster': 
			case 'guildv2_battle_monster': 
			case 'battle_expansion_monster': 
				var slice = ajax ? $j(aslice) : $j("#app_body"),
					visiblePageChangetf = !ajax && !feed.isScan,
					cM = {}, // current
					time = [],
					tempDiv = $j(),
					tempText = '',
					stunStart = 0,
					tempArr = [],
					i = 0,
					monsterDiv = $j(),
					damageDiv = $j(),
					partsDiv = $j(),
					partsElem = $j(),
					partsElem2 = $j(),
					tStr = '',
					aliveArray,
					partsHealth = [],
					arms = [],
					mains = [],
					minions = [],
					tNum = 0,
					link = false,
					deathRuneSiegetf = false,
					defImage = '',
					id = 0,
					mpool = 0,
					deleteMon = false,
					page = $j(".game", ajax ? slice : $j("#globalContainer")).eq(0).attr("id"),
					matches = true;
					
				if ($u.hasContent($j("#app_body div[style*='no_monster_back.jpg']"))) {
					con.log(1, "Deleting monster that has expired",lastClick);
					monster.deleteRecord(lastClick);
					return false;
				}

				monsterDiv = $j(monster.onMonsterHeader, slice);

				if (visiblePageChangetf) {
					caap.chatLink(slice, "#chat_log div[style*='hidden'] div[style*='320px']");
				}
				
				tempText = monsterDiv.text().trim();
				//con.log(2, 'Header text', tempText);
				if (monsterDiv.text().regex(/Monster Codes?: \w+:\d+/i)) {
					id = parseInt(tempText.regex(/Monster Codes?: (\w+):\d+/), 36);
					mpool = tempText.regex(/Monster Codes?: \w+:(\d+)/);
					link = session.getItem('page', '') + '.php?casuser=' + id + '&mpool=' + mpool;
					//con.log(2, 'Header text2 ', id, mpool, link, tempText);
				} else {

					mpool = $j("input[name*='mpool']").eq(0).attr("value");
					mpool = $u.setContent(mpool, lastClick ? lastClick.regex(/mpool=(\d+)/) : '');
						
					id = $j("input[name*='casuser']").eq(0).attr("value");
					id = $u.setContent(id, $u.setContent($j("img[src*='profile.ak.fbcdn.net']", monsterDiv).attr("uid"), '').regex(/(\d+)/));
					id = $u.setContent(id, $u.setContent($j(".fb_link[href*='profile.php']", monsterDiv).attr("href"), '').regex(/id=(\d+)/));
					id = $u.setContent(id, $u.setContent($j("img[src*='graph.facebook.com']", monsterDiv).attr("src"), '').regex(/\/(\d+)\//));
					if ($j("input[name*='guild_creator_id']").length > 0) {
						id = $u.setContent(id, $j("input[name*='guild_creator_id']")[0].value + '_' + $j("input[name='slot']")[0].value + '_' + $j("input[name*='monster_slot']")[0].value);
					}
		id = $u.setContent(id, $u.setContent($j("#app_body #chat_log button[onclick*='ajaxSectionUpdate']").attr("onclick"), '').regex(/guild_id=(\d+)/)
							+ '_' + $u.setContent($j("#app_body #chat_log button[onclick*='ajaxSectionUpdate']").attr("onclick"), '').regex(/&slot=(\d+)/)
							+ '_' + $u.setContent($j("#app_body #chat_log button[onclick*='ajaxSectionUpdate']").attr("onclick"), '').regex(/monster_slot=(\d+)/));
					id = $u.setContent(id, $u.setContent($j("#app_body #chat_log button[onclick*='ajaxSectionUpdate']").attr("onclick"), '').regex(/user=(\d+)/));
					id = $u.setContent(id, $u.setContent($j("#app_body #monsterChatLogs img[src*='ldr_btn_chatoff.jpg']").attr("onclick"), '').regex(/user=(\d+)/));
				}
				
				id = $u.setContent(id, lastClick ? monster.getRecord(lastClick).id : 0);
				if (id === 0 || !$u.hasContent(id)) {
					con.warn("Unable to get id from monster page");
					slice = null;
					tempDiv = null;
					monsterDiv = null;
					damageDiv = null;
					return;
				}

				// With id, we look for the monster record
				link = monster.cleanLink(link, id, mpool);
				cM = monster.getRecord(link); // current monster record
				cM.rix = deathRuneSiegetf ? '&rix=' + $u.setContent(cM.link.regex(/rix=(\d+)/), 2) : '';

				// Get the user name
				if (id === caap.stats.FBID) {
					cM.userName = 'Your';
					cM.name = 'Your ' + $u.setContent(cM.monster, 'Unknown Monster');
				} else {
					if ($u.hasContent(monsterDiv)) {
						cM.userName = monsterDiv.text().replace(/Monster Codes: \w+:\w+/, '').trim();
						cM.userName = monsterDiv.text().replace("'s summoned", ' summoned').regex(/\s*(.+)\s+summoned/i);
						if (!cM.userName) {
							con.warn('Unable to find summoner name in monster div', monsterDiv.text(), monsterDiv);
						}
					} else {
						con.warn('Unable to find monster div to determine summoner name');
					}
				}
				
				// Find health bar, label it, and use it to find monster name
				monsterDiv = $j("img[src*='monster_health_background.jpg'],img[src*='nm_red.jpg']", slice).parent();
				if ($u.hasContent(monsterDiv)) {
					cM.life = monsterDiv.getPercent('width').dp(2);
					tempDiv = monsterDiv.siblings().eq(0).children().eq(0);
					if (!$u.hasContent(tempDiv)) {
						tempDiv = monsterDiv.parent().parent().siblings().eq(0);
						if ($u.hasContent(tempDiv.children())) {
							tempDiv = tempDiv.children().eq(0);
						}
					}
				} else {
					tempDiv = $j("div[style*='monster_health_back.jpg']", slice);
				}
				tempText = tempDiv.text().trim();
				if (tempText.toLowerCase().hasIndexOf('life') || tempText.toLowerCase().hasIndexOf('soldiers')) {
					cM.monster = tempText.regex(/\s*([^']+)'s\s+\w+/i).replace(/,.*/,'').toLowerCase().ucWords();
					cM.monster = monster.getInfo(cM.monster, 'alias', cM.monster);
					if (visiblePageChangetf && config.getItem("monsterEnableLabels", true)) {
						tempDiv.text(tempText + " (" + cM.life + "%)");
					}
				} else {
					con.warn('Unable to find monster name', tempText, $j("img[src*='monster_health_background.jpg'],img[src*='nm_red.jpg']", slice).parent(), $j("div[style*='monster_health_back.jpg']", slice));
				}
				cM.name = (cM.userName == 'Your' ? 'Your ' : $u.setContent(cM.userName, 'Someone') + "'s ") + $u.setContent(cM.monster, 'Unknown Monster');
				
				deathRuneSiegetf = cM.monster.indexOf('Deathrune Siege') >= 0;
				if (deathRuneSiegetf) {
					battle.checkResults();
					tempDiv = $j("div[style*='raid_back']", slice);
					if ($u.hasContent(tempDiv)) {
						if ($u.hasContent($j("img[src*='raid_1_large.jpg']", tempDiv))) {
							cM.monster = 'Deathrune Siege I';
						} else if ($u.hasContent($j("img[src*='raid_b1_large.jpg']", tempDiv))) {
							cM.monster = 'Deathrune Siege II';
						} else if ($u.hasContent($j("img[src*='raid_1_large_victory.jpg']", tempDiv))) {
							con.log(2, "Siege Victory!");
						} else {
							con.log(2, "Problem finding raid image! Probably finished.");
						}

					} else {
						con.warn("Problem finding raid_back");
						slice = null;
						tempDiv = null;
						monsterDiv = null;
						damageDiv = null;
						return;
					}
				}

				cM.review = Date.now();
				// Extract info
				
				// #monsterticker is the most reliable indicator of a living monster
				tempDiv = $j("#monsterTicker", slice);
				if ($u.hasContent(tempDiv)) {
					time = $u.setContent(tempDiv.text(), '').regex(/(\d+):(\d+):(\d+)/);
				} else if (!caap.hasImage("dead.jpg")) {
					con.warn("Could not locate Monster ticker.");
				}

				// Check for fortify stuff
				cM.fortify = -1;
				cM.strength = -1;
				defImage = monster.getInfo(cM.monster, 'defense_img');
				switch (defImage) {
					case 'bar_dispel.gif':
						tempDiv = $j("img[src*='" + defImage + "']", slice).parent();
						if ($u.hasContent(tempDiv)) {
							cM.fortify = (100 - tempDiv.getPercent('width')).dp(2);
							tempDiv = tempDiv.parent().parent().siblings().eq(0).children().eq(0).children().eq(1);
						} else {
							con.warn("Unable to find defence bar", defImage);
						}

						break;
					case 'seamonster_ship_health.jpg':
						tempDiv = $j("img[src*='" + defImage + "']", slice).parent();
						if ($u.hasContent(tempDiv)) {
							cM.fortify = tempDiv.getPercent('width').dp(2);
							defImage = monster.getInfo(cM.monster, 'repair_img');
							if (defImage) {
								tempDiv = $j("img[src*='" + defImage + "']", slice).parent();
								if ($u.hasContent(tempDiv)) {
									cM.fortify = (cM.fortify * (100 / (100 - tempDiv.getPercent('width')))).dp(2);
									tempDiv = tempDiv.parent().parent().siblings().eq(0).children().eq(0).children().eq(1);
								} else {
									cM.fortify = 100;
									con.warn("Unable to find repair bar", defImage);
								}
							}
						} else {
							con.warn("Unable to find defense bar", defImage);
						}
						tempDiv = $j("img[src*='repair_bar_grey.jpg']", slice).parent();
						if ($u.hasContent(tempDiv)) {
							cM.strength = 100 - tempDiv.getPercent('width').dp(2);
						}

						break;
					case 'repair_bar_grey.jpg':
						tempDiv = $j("img[src*='" + defImage + "']", slice).parent();
						if ($u.hasContent(tempDiv)) {
							cM.fortify = tempDiv.getPercent('width').dp(2);
							tempDiv = tempDiv.parent();
							if ($u.hasContent(tempDiv)) {
								cM.strength = tempDiv.getPercent('width').dp(2);
								tempDiv = tempDiv.parent().siblings().eq(0).children().eq(0);
							} else {
								cM.strength = 100;
								con.warn("Unable to find defense bar strength");
							}
						} else {
							con.warn("Unable to find defense bar fortify");
						}

						break;
					case 'nm_green.jpg':
						tempDiv = $j("img[src*='" + defImage + "']", slice).parent();
						if ($u.hasContent(tempDiv)) {
							cM.fortify = tempDiv.getPercent('width').dp(2);
							tempDiv = tempDiv.parent();
							if ($u.hasContent(tempDiv)) {
								cM.strength = tempDiv.getPercent('width').dp(2);
								tempDiv = tempDiv.parent().siblings().eq(0).children().eq(0);
							} else {
								cM.strength = 100;
								con.warn("Unable to find defense bar strength");
							}
						} else {
							con.warn("Unable to find defense bar fortify");
						}

						break;
					default:
						con.warn("No match for defense_img", defImage);
				}

				// See if healing debt is paid
				if (config.getItem('HealPercStam', 20) > 0 && cM.debtStart > 0 && (cM.debtStamina <= 0 ||  cM.fortify > cM.debtStart)) {
					cM.debtStart = -1;
					cM.debtStamina = 0;
					session.setItem('ReleaseControl', false);
				}
				

				if (visiblePageChangetf && $u.hasContent(tempDiv) && config.getItem("monsterEnableLabels", true)) {
					tempText = tempDiv.text().trim();
					if (!$u.hasContent(tempDiv.children()) && (tempText.toLowerCase().hasIndexOf('health') || tempText.toLowerCase().hasIndexOf('defense') || tempText.toLowerCase().hasIndexOf('armor'))) {
						tempDiv.text(tempText + " (" + (defImage === 'bar_dispel.gif' ? (100 - cM.fortify).dp(2) : cM.fortify) + "%" +
							(defImage === 'nm_green.jpg' ? '/' + cM.strength + '%' : '') + ")");
					}
				}

				// Get damage done to monster
				damageDiv = $j("#action_logs td[class='dragonContainer']:first tr", slice);
				if ($u.hasContent(damageDiv)) {
					damageDiv = $j(damageDiv).find("a[href$='keep.php?casuser=" + caap.stats.FBID + "']").last().closest('tr');
					if ($u.hasContent(damageDiv)) { // Make sure player has done damage.
						tempText = damageDiv.text().trim().innerTrim();
						tempArr = tempText.regex(/([\d,]+) dmg \/ ([\d,]+) def/);
						if ($u.isArray(tempArr) && tempArr.length > 1) {
							cM.defended =  $u.setContent(tempArr.pop(), '0').numberOnly();
						} else {
							tempArr = tempText.regex(/([\d,]+)/g);
						}
						if ($u.isArray(tempArr) && tempArr.length) {
							cM.attacked = $u.setContent(tempArr.pop(), '0').numberOnly();
							cM.damage = cM.attacked + cM.defended;
						} else {
							con.warn("Unable to get attacked and defended damage from #dragonContainer");
						}

						if (visiblePageChangetf) {
							damageDiv.parents("tr").eq(0).css('background-color', (gm ? gm.getItem("HighlightColor", '#C6A56F', hiddenVar) : '#C6A56F'));
						}
						//cM.hide = true;
					}
				} else {
					damageDiv = $j("div[id*='leaderboard_0']");
					if ($u.hasContent(damageDiv)) {
						damageDiv = $j("a[href*='user=" + caap.stats.FBID + "']", damageDiv[0].children);
						if ($u.hasContent(damageDiv)) {
							tempArr = $u.setContent(damageDiv.parent().parent()[0].children[4].innerHTML).trim().innerTrim().match(/([\d,]+)/g);
							if ($u.hasContent(tempArr) && tempArr.length > 0) {
								cM.attacked = tempArr[0].numberOnly();
								cM.damage = cM.attacked;
								if (tempArr.length === 2) {
									cM.defended = tempArr[1].numberOnly();
									cM.damage = cM.attacked + cM.defended;
								}
							} else {
								con.warn("Unable to get attacked and defended damage from Leaderboard", tempArr, (damageDiv.parent().parent()[0].children[4].innerHTML).trim().innerTrim());
							}
							if (visiblePageChangetf) {
								damageDiv.parent().parent().eq(0).css('background-color', (gm ? gm.getItem("HighlightColor", '#C6A56F', hiddenVar) : '#C6A56F'));
							}
						}
					} else {
						con.log(2, "Unable to find a damage table");
					}
				}
				
				// Is it alive?
				if ($u.hasContent(time)) {
					cM.time = time[0] + time[1] / 60;
					cM.t2k = monster.t2kCalc(cM);
					
					// new siege style
					tempDiv = $j("#objective_list_section div[style*='mobjective_container']", slice);
					if ($u.hasContent(tempDiv)) {
						cM.phase = tempDiv.length;
						cM.miss = $u.setContent($u.setContent($j("div[style*='monster_layout'],div[style*='nm_bottom'],div[style*='raid_back']", slice).text(), '').trim().innerTrim().regex(/Need (\d+) more/i), 0);
					} else { // old style
						tempDiv = $j("div[style*='monster_layout_2.jpg'] div[style*='alpha']", slice);
						if (tempDiv.length) {
							cM.phase = tempDiv.length + 1;
						}
					}
					if (cM.phase > 0) {
						cM.miss = $u.setContent($u.setContent($j("div[style*='monster_layout'],div[style*='nm_bottom'],div[style*='raid_back']", slice).text(), '').trim().innerTrim().regex(/Need (\d+) more/i), 0);
					}
					
					monsterDiv = $j("div[style*='nm_bottom'],div[style*='stance_plate_bottom']", slice);
					if ($u.hasContent(monsterDiv)) {
						tempText = $u.setContent(monsterDiv.children().eq(0).children().text(), '').trim().innerTrim();
						if (tempText) {
							con.log(4, "Character class text", tempText);
							tStr = tempText.regex(/Class: (\S+) /);
							if ($u.hasContent(tStr)) {
								cM.charClass = tStr;
								con.log(4, "character", cM.charClass);
							} else {
								con.warn("Can't get character", tempText);
							}
						} else {
							con.warn("Missing tempText");
						}
					} else {
						con.warn("Missing nm_bottom to find class");
					}

					// if the monster has parts, hit the weakest minion first, and then hit the part with the least health next
					partsDiv = $j("#app_body div[id^='monster_target_']");
					if ($u.hasContent(partsDiv)) {
						cM.targetPart = -1;
						partsHealth = [];
						//con.log(2, "The monster has " + partsDiv.length + " parts");

						// Click first order parts which have health
						partsDiv.each( function(index) {
							partsElem = $j(this).find('div[style*="multi_smallhealth.jpg"]');
							if ($u.hasContent(partsElem)) {
								//partsElem2 = partsElem.children[1].children[0];
								tNum = $u.setContent($j(partsElem).getPercent("width"), 0);
								partsHealth.push(tNum);
								tempDiv =  $j("#app_body span[id^='target_monster_info_" + (index + 1) + "']");
								//con.log(2, 'desciptor text: ' + tempDiv.text());
								if ($u.hasContent(tempDiv)) {
									if (tempDiv.text().regex(/reduce/)) {
										arms.push(tNum);
									} else if (tempDiv.text().regex(/hinder/)) {
										minions.push(tNum);
									} else {
										mains.push(tNum);
									}
								} else {
									con.warn('No info for body part ' + (index + 1), $j(this));
								}
							} else {
								con.warn('No children of body part for health width');
							}
						});
						//con.log(2, 'parts list', minions, arms, mains);
						
						// Define if use user or default order parts
						if (/:po/i.test(cM.conditions)) {
							tempArr = cM.conditions.substring(cM.conditions.indexOf('[') + 1, cM.conditions.lastIndexOf(']')).split(".");
							tempArr.some( function(part) {
								if ($u.setcontent(partsHealth[part],0) > 0) {
									cM.targetPart = part;
									return true;
								}
							});
						} else {
							cM.targetPart = partsHealth.lastIndexOf(minions.length ? caap.minMaxArray(minions, 'min', 0) : Math.min((arms.length ? caap.minMaxArray(arms, 'min', 0) : 100), caap.minMaxArray(mains, 'min', 0))) + 1;
							//con.log(2, 'targetpart calcs', Math.min.apply(null, aliveArray(minions)),  Math.min.apply(null, aliveArray(arms)), Math.min.apply(null, aliveArray(mains)));
						}

						// If one of the mains is more damaged that most damaged hinderer and arms > 80% health, assume headless
						if (arms.length && caap.minMaxArray(mains, 'min', 0) < caap.minMaxArray(arms, 'min', 0)
							&& caap.minMaxArray(arms, 'min', 0) > 80) {
							cM.life = (mains.reduce(function(a, b) { return a + b }, 0) / mains.length).dp(2);
						} else {
							cM.life = ((mains.reduce(function(a, b) { return a + b }, 0) + arms.reduce(function(a, b) { return a + b }, 0) / 5)	/ (mains.length + arms.length / 5)).dp(2);
						}
						//con.log(2, 'Average life of body parts ' + cM.life + '% and target is part ' + cM.targetPart, partsHealth, arms, mains, mains.reduce(function(a, b) { return a + b }, 0), arms.reduce(function(a, b) { return a + b }, 0), $j("#app_body #expanded_monster_target_1:visible").length, $j("#app_body #expanded_monster_target_2:visible").length);
					}

					// If it's alive and I've hit it, then check character class stuff and sieges
					if (monster.damaged(cM)) {
						if (cM.status == 'Join') {
							con.log(1, 'Joined a feed monster with ' + cM.damage, cM);
						}
						cM.status = 'Attack';
						// Character type stuff
						if (cM.charClass) {

							tStr = tempText.regex(/Tip: ([\w ]+) Status/);
							if (!tStr) {
								cM.stunType = 'fortify';
								con.warn("Can't get tip", tempText);
							} else {
								cM.stunType = tStr.split(" ").pop().toLowerCase().replace('ion', '');
								//con.log(2, 'Stun type: ' + cM.stunType);
							}
							
							if (!["strengthen", "cripple", "heal", "deflect", "fortify"].hasIndexOf(cM.stunType)) {
								con.warn("Unknown monster stun attack", cM.stunType);
							}

							tempArr = tempText.regex(/Status Time Remaining: (\d+):(\d+):(\d+)\s*/);
							if ($u.hasContent(tempArr) && tempArr.length === 3) {
								cM.stunTime = Date.now() + (tempArr[0] * 60 * 60 * 1000) + (tempArr[1] * 60 * 1000) + (tempArr[2] * 1000);
								
							} else {
								cM.stunTime = Date.now() + cM.time * 60 * 60 * 1000;
								con.warn("Can't get statusTime", tempText);
							}

							tempDiv = $j("img[src*='nm_stun_bar']", monsterDiv);
							if ($u.hasContent(tempDiv)) {
								tempText = tempDiv.getPercent('width').dp(2);
								con.log(4, "Stun bar percent text", tempText);
								if (tempText >= 0) {
									cM.stun = tempText;
									con.log(4, "stun", cM.stun);

									// If we haven't set a target time for stunning yet, or the target time was for the phase before this one,
									// or the WhenStun setting has changed, set a new stun target time.
									tNum = monster.parseCondition("cd", cM.conditions);
									tNum = $u.isNumber(tNum) ? tNum.toString() : config.getItem('WhenStun','Immediately');
									tNum = tNum == 'Immediately' ? 6 : tNum == 'Never' ? 0 : tNum.parseFloat();
									stunStart = cM.stunTime - 6 * 60 * 60 * 1000;
									con.log(5,'Checking stuntarget',tNum, $u.makeTime(stunStart, caap.timeStr(true)),$u.makeTime(cM.stunTime, caap.timeStr(true)));
									
									if (!cM.stunTarget || cM.stunTarget < stunStart || cM.stunSetting !== tNum) {
										cM.stunSetting = tNum;

										// Add +/- 30 min so multiple CAAPs don't all stun at the same time
										cM.stunTarget = cM.stunSetting == 6 ? stunStart : cM.stunSetting == 0 ? cM.stunTime
												: cM.stunTime - (tNum - 0.5 + Math.random()) * 60 * 60 * 1000;
										con.log(5,'New stun target', $u.makeTime(cM.stunTarget, caap.timeStr(true)));
									}

									cM.stunDo = cM.charClass === '?' ? '' : new RegExp(cM.charClass).test(tStr) && cM.stun < 100;
									if (cM.stunDo) {
										con.log(2,"Cripple/Deflect after " + $u.makeTime(cM.stunTarget, caap.timeStr(true)), cM.stunTime, cM.stunTarget, tNum, cM.stunSetting, stunStart, Date.now() > cM.stunTarget);
									}
									cM.stunDo = cM.stunDo && Date.now() > cM.stunTarget;

								} else {
									con.warn("Can't get stun bar width");
								}
							} else if (["strengthen", "heal", "fortify"].hasIndexOf(cM.stunType)) {
								cM.stun = cM.stunType == "strengthen" ? cM.strength : cM.health;
							}	else {
								con.warn('No bar and stun type is not strengthen, heal, or fortify');
							}

						}

						// Find the lowest and highest stamina/energy buttons
						tempDiv = $j("div[style*='button_cost_stamina_']", slice);
						cM.siegeLevel = tempDiv.length ? tempDiv.attr('style').match(/button_cost_stamina_(\d+)/)[1] : 0;
						
						tempDiv = $j("img[src*='button_cost_stamina_']", slice);
						if ($u.hasContent(tempDiv)) {
							cM.listStamina = [];
							cM.listEnergy = [];
							cM.multiNode = true;
							tempDiv.each( function() {
								tNum = $j(this).attr('src').regex(/button_cost_stamina_(\d+)/);
								if (cM.listStamina.indexOf(tNum) == -1) {
									cM.listStamina.push(tNum);
								}
							});
							tempDiv = $j("img[src*='button_cost_energy_']", slice);
							if ($u.hasContent(tempDiv)) {
								tempDiv.each( function() {
									tNum = $j(this).attr('src').regex(/button_cost_energy_(\d+)/);
									if (cM.listEnergy.indexOf(tNum) == -1) {
										cM.listEnergy.push(tNum);
									}
								});
							}
							cM.listStamina = cM.listStamina.join(',');
							cM.listEnergy = cM.listEnergy.join(',');
						} else {
							if (!cM.listStamina.length) {
								con.log(2, 'Unable to find stamina/energy attack buttons, so using default configuration');
							}
							cM.listStamina = monster.getInfo(cM, 'listStamina');
							cM.listEnergy = cM.fortify >= 0 ? monster.getInfo(cM, 'listEnergy') : '';
						}

							
					// It's alive and I haven't hit it
					} else {
						if (!cM.charClass || caap.hasImage('battle_enter_battle.gif', slice)) {
							cM.status = 'Join';
							cM.conditions = feed.addConditions(cM.name) || '';
						} else { // I haven't hit it, but I can't join it, so delete
							con.warn("Deleting unjoinable monster " + cM.name + " off Feed", cM)
							deleteMon = true;
						}
					}
				// It's dead
				} else {
					// And I haven't hit it and it's not conquest
					if (!monster.damaged(cM) && cM.lpage != "ajax:player_monster_list.php?monster_filter=2") {
						//and it's dead and not a conquest monster, so delete
						con.log(2, "Deleting dead monster " + cM.name + " off Feed", cM)
						deleteMon = true;
					} else {
						feed.checkDeath(cM);
						cM.status = (caap.hasImage('collect_reward', slice) || caap.hasImage('collectreward', slice)) ? 'Collect' : 'Done';
						cM.color = 'grey';
					}
				}
				
				
				if (deleteMon) {
					monster.deleteRecord(cM.link);
				} else {
					monster.setRecord(cM);
				}
				monster.select(true);
				session.getItem("feedDashUpdate", true)
				caap.updateDashboard(true);
				if (schedule.check('battleTimer')) {
					window.setTimeout(function () {
						caap.setDivContent('monster_mess', '');
					}, 2000);
				}
				con.log(2, "On Monster info: " + cM.name, link, cM, caap.stats.reviewPages);

				slice = null;
				tempDiv = null;
				partsDiv = null;
				monsterDiv = null;
				damageDiv = null;
				break;
				
				
			default : 
				break;
			}
        } catch (err) {
            con.error("ERROR in checkResults_onMonster: " + err.stack);
        }
    };
	
    caap.inLevelUpMode = function () {
        try {
            if (!config.getItem('EnableLevelUpMode', true)) {
                //if levelup mode is false then new level up mode is also false (kob)
                state.setItem("newLevelUpMode", false);
                return false;
            }

            if (!caap.stats.indicators.enl) {
                //if levelup mode is false then new level up mode is also false (kob)
                state.setItem("newLevelUpMode", false);
                return false;
            }

            // minutesBeforeLevelToUseUpStaEnergy : 5, = 30000
            if (((caap.stats.indicators.enl - Date.now()) < 30000) || (caap.stats.exp.dif <= config.getItem('LevelUpGeneralExp', 20))) {
                //detect if we are entering level up mode for the very first time (kob)
                if (!state.getItem("newLevelUpMode", false)) {
                    //set the current level up mode flag so that we don't call refresh monster routine more than once (kob)
                    state.setItem("newLevelUpMode", true);
                }

                return true;
            }

            //if levelup mode is false then new level up mode is also false (kob)
            state.setItem("newLevelUpMode", false);
            return false;
        } catch (err) {
            con.error("ERROR in inLevelUpMode: " + err.stack);
            return false;
        }
    };

	// Will return amount of stamina available.
    caap.checkStamina = function (battleOrMonster, attackMinStamina) {
        try {
            con.log(4, "checkStamina", battleOrMonster, attackMinStamina);
            attackMinStamina = $u.setContent(attackMinStamina, 0);

            var when = config.getItem('When' + battleOrMonster, 'Never'),
                maxIdleStamina = 0,
                staminaMF = '',
                messDiv = (battleOrMonster == 'battleOverride' ? 'battle' : battleOrMonster.toLowerCase()) + "_mess";

            if (when === 'Never') {
                return false;
            }

            if (!caap.stats.stamina || !caap.stats.health) {
                caap.setDivContent(messDiv, 'Health or stamina not known yet.');
                return false;
            }

            if (caap.stats.health.num < 10) {
                if (battleOrMonster === "Conquest") {
                    schedule.setItem("conquest_delay_stats", (10 - caap.stats.health.num) *  180, 120);
                }

                caap.setDivContent(messDiv, "Need health to fight: " + caap.stats.health.num + "/10");
                return false;
            }

            if (((battleOrMonster === "Battle" && config.getItem("waitSafeHealth", false)) || (battleOrMonster === "Conquest" && config.getItem("conquestWaitSafeHealth", false))) && caap.stats.health.num < 13) {
                if (battleOrMonster === "Conquest") {
                    schedule.setItem("conquest_delay_stats", (13 - caap.stats.health.num) *  180, 120);
                }

                caap.setDivContent(messDiv, "Unsafe. Need health to fight: " + caap.stats.health.num + "/13");
                return false;
            }

            if (when === 'At X Stamina') {
                if (caap.inLevelUpMode() && caap.stats.stamina.num >= attackMinStamina) {
                    caap.setDivContent(messDiv, 'Burning stamina to ' + (caap.inLevelUpMode() ? 'level up' : ' get below max'));
                    return caap.stats.stamina.num;
                }

                staminaMF = battleOrMonster + 'Stamina';
                if (state.getItem('BurnMode_' + staminaMF, false) || caap.stats.stamina.num >= config.getItem('X' + staminaMF, 1)) {
                    if (caap.stats.stamina.num < attackMinStamina || caap.stats.stamina.num <= config.getItem('XMin' + staminaMF, 0)) {
                        state.setItem('BurnMode_' + staminaMF, false);
                        return false;
                    }

                    state.setItem('BurnMode_' + staminaMF, true);
                    return caap.stats.stamina.num - config.getItem('XMin' + staminaMF, 0);
                }

                state.setItem('BurnMode_' + staminaMF, false);

                caap.setDivContent(messDiv, 'Waiting for stamina: ' + caap.stats.stamina.num + "/" + config.getItem('X' + staminaMF, 1));
                return false;
            }

            if (when === 'At Max Stamina') {
                maxIdleStamina = caap.maxStatCheck('stamina');

                if (caap.stats.stamina.num >= maxIdleStamina) {
                    caap.setDivContent(messDiv, 'Using max stamina');
                    return caap.stats.stamina.num; 
                }

                if (caap.inLevelUpMode()) {
                    caap.setDivContent(messDiv, 'Burning all stamina to ' + (caap.inLevelUpMode() ? 'level up' : ' get below max'));
                    return caap.stats.stamina.num;
                }

                caap.setDivContent(messDiv, 'Waiting for max stamina: ' + caap.stats.stamina.num + "/" + maxIdleStamina);
                return false;
            }

            if (caap.stats.stamina.num >= attackMinStamina) {
                return caap.stats.stamina.num;
            }

            caap.setDivContent(messDiv, "Waiting for more stamina: " + caap.stats.stamina.num + "/" + attackMinStamina);
            return false;
        } catch (err) {
            con.error("ERROR in checkStamina: " + err.stack);
            return false;
        }
    };

    /*-------------------------------------------------------------------------------------\
    needToHide will return true if the current stamina and health indicate we need to bring
    our health down through battles (hiding).  It also returns true if there is no other outlet
    for our stamina (currently this just means Monsters, but will eventually incorporate
    other stamina uses).
    \-------------------------------------------------------------------------------------*/
    caap.needToHide = function () {
        try {
            if (config.getItem('WhenMonster', 'Never') === 'Never') {
                con.log(1, 'Stay Hidden Mode: Monster battle not enabled');
                return true;
            }

            if (!state.getItem('targetFromMonster', '')) {
                con.log(1, 'Stay Hidden Mode: No monster to battle');
                return true;
            }

            if (config.getItem('delayStayHidden', true) === false) {
                con.log(2, 'Stay Hidden Mode: Delay hide if "safe" not enabled');
                return true;
            }

            /*-------------------------------------------------------------------------------------\
             The riskConstant helps us determine how much we stay in hiding and how much we are willing
             to risk coming out of hiding.  The lower the riskConstant, the more we spend stamina to
             stay in hiding. The higher the risk constant, the more we attempt to use our stamina for
             non-hiding activities.  The below matrix shows the default riskConstant of 1.7

             S   T   A   M   I   N   A
             1   2   3   4   5   6   7   8   9        -  Indicates we use stamina to hide
             H   10  -   -   +   +   +   +   +   +   +        +  Indicates we use stamina as requested
             E   11  -   -   +   +   +   +   +   +   +
             A   12  -   -   +   +   +   +   +   +   +
             L   13  -   -   +   +   +   +   +   +   +
             T   14  -   -   -   +   +   +   +   +   +
             H   15  -   -   -   +   +   +   +   +   +
             16  -   -   -   -   +   +   +   +   +
             17  -   -   -   -   -   +   +   +   +
             18  -   -   -   -   -   +   +   +   +

             Setting our riskConstant down to 1 will result in us spending out stamina to hide much
             more often:

             S   T   A   M   I   N   A
             1   2   3   4   5   6   7   8   9        -  Indicates we use stamina to hide
             H   10  -   -   +   +   +   +   +   +   +        +  Indicates we use stamina as requested
             E   11  -   -   +   +   +   +   +   +   +
             A   12  -   -   -   +   +   +   +   +   +
             L   13  -   -   -   -   +   +   +   +   +
             T   14  -   -   -   -   -   +   +   +   +
             H   15  -   -   -   -   -   -   +   +   +
             16  -   -   -   -   -   -   -   +   +
             17  -   -   -   -   -   -   -   -   +
             18  -   -   -   -   -   -   -   -   -

            \-------------------------------------------------------------------------------------*/

            var riskConstant = gm ? gm.getItem('HidingRiskConstant', 1.7, hiddenVar) : 1.7;

            /*-------------------------------------------------------------------------------------\
            The formula for determining if we should hide goes something like this:

            If  (health - (estimated dmg from next attacks) puts us below 10)  AND
            (current stamina will be at least 5 using staminatime/healthtime ratio)
            Then stamina can be used/saved for normal process
            Else stamina is used for us to hide

            \-------------------------------------------------------------------------------------*/
            //if ((caap.stats.health.num - ((caap.stats.stamina.num - 1) * riskConstant) < 10) && (caap.stats.stamina.num * (5 / 3) >= 5)) {
            if ((caap.stats.health.num - ((caap.stats.stamina.num - 1) * riskConstant) < 10) && ((caap.stats.stamina.num + (gm ? gm.getItem('HideStaminaRisk', 1, hiddenVar) : 1)) >= state.getItem('MonsterStaminaReq', 1))) {
                return false;
            }

            return true;
        } catch (err) {
            con.error("ERROR in needToHide: " + err.stack);
            return undefined;
        }
    };

    /*-------------------------------------------------------------------------------------\
    MonsterReview is a primary action subroutine to manage the monster and raid list
    on the dashboard
    \-------------------------------------------------------------------------------------*/
	worker.addAction({fName : 'monster.review', priority : 1000, description : 'Reviewing Monsters'});

    monster.review = function () {
        try {
            /*-------------------------------------------------------------------------------------\
            We do monster review once an hour.  Some routines may reset this timer to drive
            MonsterReview immediately.
            \-------------------------------------------------------------------------------------*/
            if (config.getItem('WhenMonster', 'Never') === 'Never' && ['No Monster', 'Demi Points Only'].indexOf(config.getItem('WhenBattle', 'Never')) < 0 &&  config.getItem('TargetType', 'Freshmeat') != 'Raid') {
                return false;
            }

            var link = '',
                result = false,
				i = 0,
				time = 60,
				cM = {},
				message = 'Reviewing ';

            for (i = 0; i < caap.stats.reviewPages.length; i++) {
                if (schedule.since(caap.stats.reviewPages[i].review, 60 * 60)) {
                    con.log(2,'Reviewing monster list page',caap.stats.reviewPages[i].path, caap.stats.reviewPages,caap.stats.reviewPages[i].review);
                    return caap.navigateTo(caap.stats.reviewPages[i].path);
                }
            }

            if (monster.records.length === 0) {
                return false;
            }

            for (i = 0; i < monster.records.length; i++) {
                cM = monster.records[i];
                /*jslint continue: true */
				
				// Skip monsters we haven't joined, unless in conquest lands
                if (cM.status == 'Join' && cM.lpage != "ajax:player_monster_list.php?monster_filter=2") {
                    continue;
                }
                if (cM.color === 'grey' && cM.life == 100) {
                    cM.life = 0;
                    cM.fortify = -1;
                    cM.strength = -1;
                    cM.time = 0;
                    cM.t2k = -1;
                    cM.phase = '';
                    monster.setRecord(cM);
                }

				time = (cM.status === 'Attack' ? (monster.parseCondition('mnt', cM.conditions) || 60) : 12 * 60) * 60;

				link = "ajax:" + cM.link;

				if (['Collect', 'Dead or fled'].hasIndexOf(cM.status)) {
					if (/:collect\b/.test(cM.conditions) 
						|| (/:collectsmall\b/.test(cM.conditions) && cM.damage < 200000)
						|| (!/:!collect\b/.test(cM.conditions) && config.getItem('monsterCollectReward', false))) {
						if (general.Select('CollectGeneral')) {
							return true;
						}

						link += '&action=collectReward' + cM.rix;
						con.log(2, 'Collecting reward on ' + cM.name, cM);
						message = 'Collecting ';
					}

				} else if (cM.status == 'Done' && cM.lpage == "player_monster_list") {
					if (/:clear\b/.test(cM.conditions) || (!/:!clear\b/.test(cM.conditions) && config.getItem('clearCompleteMonsters', false))) {
						link = link.replace("battle_monster.php?casuser=", "player_monster_list.php?remove_list=").concat("&monster_filter=1");
						//caap.updateDashboard(true);
						message = 'Clearing ';
						monster.deleteRecord(cM.link);
					}

				} else if (cM.doSiege && caap.stats.stamina.num >= cM.siegeLevel && cM.monster.indexOf('Deathrune Siege') < 0) {
					link += ',clickimg:siege_btn.gif';
					message = 'Sieging ';
				}
				
                if (message === 'Reviewing ' && !schedule.since(cM.review, time)) {
                    continue;
                }
                /*jslint continue: false */

                caap.setDivContent('monster_mess', message + (i + 1) + '/' + monster.records.length + ' ' + cM.name);

				con.log(1, message + (i + 1) + '/' + monster.records.length + ' ' + cM.name, link, cM);

				result = caap.navigate2(link);
				if (result == 'fail') {
					caap.navigate2('keep');
				}
				monster.lastClick = cM.link;
				return result;
            }

            caap.setDivContent('monster_mess', '');
            return false;
        } catch (err) {
            con.error("ERROR in monster.review: " + err.stack);
            return false;
        }
    };

	worker.addAction({fName : 'monster.worker', priority : 800, description : 'Fighting Monsters'});

    monster.worker = function () {
        try {
			var whenMonster = config.getItem('WhenMonster', 'Never');

			if (whenMonster === 'Never' || whenMonster == 'Review Only') {
				caap.setDivContent('monster_mess', whenMonster == 'Never' ? 'Monster off' : 'No current review');
				return false;
			}
				
			monster.select(false);
			
            ///////////////// Reivew/Siege all monsters/raids \\\\\\\\\\\\\\\\\\\\\\

            if (config.getItem('WhenMonster', 'Never') === 'Stay Hidden' && caap.needToHide() && caap.checkStamina('Monster', 1)) {
                con.log(1, "Stay Hidden Mode: We're not safe. Go battle.");
                caap.setDivContent('monster_mess', 'Not Safe For Monster. Battle!');
                return false;
            }

            if (!schedule.check('NotargetFrombattle_monster')) {
                return false;
            }

            ///////////////// Individual Monster Page \\\\\\\\\\\\\\\\\\\\\\

            // Establish a delay timer when we are 1 stamina below attack level.
            // Timer includes 5 min for stamina tick plus user defined random interval

            if (!caap.inLevelUpMode() && caap.stats.stamina.num === (state.getItem('MonsterStaminaReq', 1) - 1) && schedule.check('battleTimer') && config.getItem('seedTime', 0) > 0) {
                schedule.setItem('battleTimer', 300, config.getItem('seedTime', 0));
                caap.setDivContent('monster_mess', 'Monster Delay Until ' + caap.displayTime('battleTimer'));
                return false;
            }

            if (!schedule.check('battleTimer')) {
                if (caap.stats.stamina.num < caap.maxStatCheck('stamina')) {
                    caap.setDivContent('monster_mess', 'Monster Delay Until ' + caap.displayTime('battleTimer'));
                    return false;
                }
            }

            var fightMode = '',
                energyRequire = 0,
                cM = {},  // current monster
                attackButton = null,
                buttonList = [],
                tacticsValue = 0,
                useTactics = false,
                attackMess = '',
                it = 0,
                len = 0,
				gMult = 1, // General multiplier, like Orc King = 5
				minMax = 'min',
				menuGeneral = 'Use Current',
				specificGeneral = 'Use Current',
				temp,
				nodeNum = 0,
				xpPerPt = 1,
				statRequire = 0,
				statRequireBig = 0,
				statAvailable = 0,
				goBig = false,
				debtcM = {},
				whichStat = 'listEnergy',
				statList = [],
				blankRecord = new monster.record().data,
				result = false,
				healPercStam = config.getItem('HealPercStam', 20) / 100,
				energyAvailable = caap.checkEnergy('Fortify', config.getItem('WhenFortify', 'Energy Available')),
				maxEnergy = caap.checkEnergy('Fortify', 'Energy Available'),
				gMultFunc = function(gen) { 
					return $u.setContent(general.getRecordVal(general.getConfigMenuGeneral(gen), 'special').regex(/(\d)x power attacks/i), 1);
				},
				setGeneralVarsFunc = function(generalMenuSetting, stat) { 
					menuGeneral = generalMenuSetting;
					specificGeneral = general.getConfigMenuGeneral(generalMenuSetting);
					gMult = gMultFunc(specificGeneral);
					goBig = !general.ZinMisaCheck(generalMenuSetting) && (/:burn\b/i.test(cM.conditions) || general.charged(specificGeneral));
					statAvailable = stat == 'cover' || cM.stunDo ? maxEnergy : whichStat == 'listEnergy' ? energyAvailable : goBig 
						? caap.stats.stamina.num : Math.min(caap.checkStamina('Monster'), healPercStam > 0 && !caap.inLevelUpMode() ? (caap.stats.energy.num / healPercStam) : caap.stats.stamina.num);
					minMax = whichStat == 'listStamina' && (goBig || config.getItem('PowerAttackMax', false))	? 'max' : 'min';
				};

			debtcM = healPercStam ? (monster.records.reduce(function(previous, redR) {
				return redR.debtStamina > previous.debtStamina ? redR : previous;
			}, blankRecord)) : blankRecord;
			
            // Check to see if we should fortify or attack monster
			['energy', 'stamina', 'cover'].some( function(stat) {
				fightMode = stat == 'stamina' ? 'Monster' : 'Fortify';
				temp = state.getItem('targetFrom' + fightMode, '');
				cM = stat == 'cover' ? debtcM :  temp ? monster.getRecord(temp) : blankRecord;
				
				if (!cM.link) {
					return false;
				}
				
				whichStat = stat == 'stamina' ? 'listStamina' : 'listEnergy';
				statList = cM[whichStat].split(',');

				setGeneralVarsFunc(fightMode + 'General', stat);

				if (debtcM.debtStamina > 0 && stat !== 'cover') { // We have a debt
				
					// If trying to hit or heal anyone other than the monster we need to cover, then don't, unless hitting and levelling up
					if (cM.link !== debtcM.link && (stat == 'energy' || !caap.inLevelUpMode())) {
						return false;
					}
					// If done over 10% damage to fort and have energy to heal and debt is at least one heal, then wait for cover
					if (stat == 'stamina' && cM.fortify < cM.debtStart - 10 && debtcM.debtStamina >= debtcM.listEnergy.split(',')[0] * gMult / healPercStam && maxEnergy >= debtcM.listEnergy.split(',')[0]) {
						return false;
					}
				}
				xpPerPt = whichStat == 'listEnergy' ? 3.6 : 5.5;
				//con.log(2, fightMode + ' ', state.getItem('targetFrom' + fightMode, ''));
				
				//con.log(2, cM.name + ' ', whichStat, cM, cM[whichStat]);

				if (caap.inLevelUpMode()) {  
					// Check for the biggest hit we can make with our remaining stats
					statRequireBig = caap.minMaxArray(statList, 'max', 1, (caap.stats.stamina.num + 1) / gMultFunc('Level_UpGeneral')) * gMultFunc('Level_UpGeneral');
					
					// Is there a smaller power attack that will work?
					statRequire = caap.minMaxArray(statList, 'min', 1, (caap.stats.stamina.num + 1 - statRequireBig) / gMult) * gMult;
					
					if (statRequire && statRequire * xpPerPt < caap.stats.exp.dif) {
						// Ok, small power hit is a go
					// If power hit won't work, then do single hit
					} else if (statList[0] == 1 && 1 * gMult * xpPerPt < caap.stats.exp.dif) {
						statRequire = 1 * gMult;
					} else {
						// If too close to levelling for a power attack, do max attack to carry over xp
						setGeneralVarsFunc('Level_UpGeneral', stat);
						statRequire = statRequireBig;
					}
					con.log(2, 'Hitting for ' + statRequire + ' Big ' + statRequireBig + ' Stamina ' + caap.stats.stamina.num + ' xp ' + caap.stats.exp.dif, cM);
				} else if (statList[0] == 1 && (/:sa\b/i.test(cM.conditions) || (!config.getItem('PowerAttack', false) &&  !/:pa\b/i.test(cM.conditions)))) {
					statRequire = 1 * gMult;
				} else {
					statRequire = caap.minMaxArray(statList, minMax, 1, (statAvailable + 1) / gMult) * gMult ;
				}
				if (statRequire && statRequire <= statAvailable) {
					nodeNum = !cM.multiNode ? 0 : statList.indexOf(statRequire.toString());
					con.log(2, 'NodeNum ' + nodeNum);
					return true;
				} else {
					statAvailable = 0;
				}
			});

			if (!statAvailable) {
				schedule.setItem('NotargetFrombattle_monster', 60);
				return false;
			}

            // Set general and go to monster page
			result = caap.navigate2('@' + menuGeneral + ',ajax:' + cM.link + (cM.targetPart > 0 ? (",clickjq:#app_body #monster_target_" + cM.targetPart + " img[src*='multi_selectbtn.jpg'],jq:#app_body #expanded_monster_target_" + cM.targetPart + ":visible") : ''));
			
			monster.lastClick = cM.link;
            if (result !== false) {
                if (result == 'fail') {
					monster.deleteRecord(cM.link);
					con.warn('Monster ' + cM.name + ' deleted after five attempts to navigate to it.', cM);
					return false;
				}
                return true;
            }

            // Check if on engage monster page
            if ($u.hasContent($j("#app_body " + monster.onMonsterHeader))) {
                
                // Find the attack or fortify button
                if (fightMode === 'Fortify') {
                    buttonList = ['seamonster_fortify.gif', 'button_dispel.gif', 'attack_monster_button3.jpg'];

                    if (monster.getInfo(cM, 'fortify_img')) {
                        buttonList.unshift(monster.getInfo(cM, 'fortify_img')[0]);
                    }
                    if (!cM.stunTarget) {
                        con.log(1, "No stun target time set");
                    }
                    
					// Only stun if we have no debt
                    if (cM.stunDo && cM.stunType !== '' && !$u.hasContent(debtcM.link)) {
                        buttonList.unshift("button_nm_s_" + cM.stunType);
                    } else {
                        buttonList.unshift("button_nm_s_");
                    }
                } else if (statRequire === 1) {
                    // not power attack only normal attacks
                    buttonList = monster.singleButtons;
                } else {
					if (caap.ifClick('darkrage_button1.gif')) {
						return true;
					};
                    if (/:tac/i.test(cM.conditions) && caap.stats.level >= 50) {
                        useTactics = true;
                        tacticsValue = monster.parseCondition("tac%", cM.conditions);
                    } else if (config.getItem('UseTactics', false) && caap.stats.level >= 50) {
                        useTactics = true;
                        tacticsValue = config.getItem('TacticsThreshold', false);
                    }

                    if (tacticsValue !== false && cM.fortify && cM.fortify < tacticsValue) {
                        con.log(2, "Party health is below threshold value", cM.fortify, tacticsValue);
                        useTactics = false;
                    }

                    if (useTactics && caap.hasImage('nm_button_tactics.gif')) {
                        con.log(2, "Attacking monster using tactics buttons");
                        buttonList = ['nm_button_tactics.gif'].concat(monster.powerButtons);
                    } else {
                        con.log(2, "Attacking monster using regular buttons");
                        useTactics = false;
                        // power attack or if not seamonster power attack or if not regular attack -
                        // need case for seamonster regular attack?
                        buttonList = monster.powerButtons;

                        if (monster.getInfo(cM, 'attack_img')) {
                            if (!caap.inLevelUpMode() && config.getItem('PowerAttack', false) && config.getItem('PowerAttackMax', false)) {
                                buttonList.unshift(monster.getInfo(cM, 'attack_img')[1]);
                            } else {
                                buttonList.unshift(monster.getInfo(cM, 'attack_img')[0]);
                            }
                        }
                    }
                }

                con.log(2, "monster/button list", cM, buttonList, nodeNum);

                buttonList.some( function(button) {
                    attackButton = caap.checkForImage(button, null, null, nodeNum);
                    return $u.hasContent(attackButton);
                });

                if ($u.hasContent(attackButton)) {
                    if (fightMode === 'Fortify') {
                        attackMess = (cM.stunDo ? cM.stunType + 'ing ': 'Fortifying ') + cM.name;
                    } else {
						general.resetCharge();
						if (useTactics) {
							attackMess = 'Tactic Attacking ' + cM.name;
						} else {
							attackMess = (statRequire >= 5 ? 'Power' : 'Single') + ' Attacking ' + cM.name;
						}
                    }

                    con.log(1, attackMess);
                    caap.setDivContent('monster_mess', attackMess);
                    caap.click(attackButton);
					cM['spent' + (fightMode === 'Fortify' ? 'Energy' : 'Stamina')] += statRequire;
					
					// Record healing debt or repayments
					if (cM.fortify >= 0 && healPercStam > 0 && (!cM.charClass || ['Mage','Rogue'].indexOf(cM.charClass) == -1)) {
						cM.debtStamina = Math.max(0, cM.debtStamina + (fightMode === 'Fortify' ? -statRequire / healPercStam : statRequire));
						cM.debtStart = cM.debtStart == -1 && fightMode === 'Monster' ? Math.min(cM.fortify, 97) 
							: cM.debtStamina ? cM.debtStart : -1;
						session.setItem('ReleaseControl', false);
					}
                    // dashboard autorefresh fix
                    localStorage.AFrecentAction = true;

                    attackButton = null;
                    buttonList = null;
					state.setItem('fightMode', fightMode);
					monster.setRecord(cM);
                    return true;
                }

                con.warn('No button to attack/fortify with.');
                schedule.setItem('NotargetFrombattle_monster', 60);
                attackButton = null;
                buttonList = null;
                return false;
            }

            schedule.setItem('NotargetFrombattle_monster', 60);
            con.warn('Unable to find top banner for ' + cM.name, cM);
            attackButton = null;
            buttonList = null;
            return false;
        } catch (err) {
            con.error("ERROR in monster.worker: " + err.stack);
            return false;
        }
    };

    monster.engageButtons = {};
	
	monster.singleButtons = ['button_nm_p_attack.gif', 'attack_monster_button.jpg', 'event_attack1.gif', 'seamonster_attack.gif'];
	
	monster.powerButtons = ['button_nm_p_', 'power_button_', 'attack_monster_button2.jpg', 'event_attack2.gif', 'seamonster_power.gif', 'serpent_10stam_attack.gif'];
	
	monster.onMonsterHeader = "div[style*='dragon_title_owner'],div[style*='monster_header_'],div[style*='monster_'][style*='_title'],div[style*='monster_'][style*='_header'],div[style*='boss_'][style*='_header'],div[style*='boss_header_'],div[style*='newmonsterbanner_']";

    monster.completeButton = {
        'battle_monster': {
            'name': undefined,
            'button': undefined
        },
        'raid': {
            'name': undefined,
            'button': undefined
        }
    };

    // Keep object names short, and remove the ", the World Hydra" parts. Players should know what they're fighting
    // No commas allowed in Object names
    monster.info = {
         'Default Monster': {
            ach: 1000000,
            listStamina: '1,5',
			listEnergy: '10',
			siege: 5,
			achNum : 5,
            defense_img: 'nm_green.jpg'
        },
       'Skaar Deathrune': {
            duration: 96,
            defButton: 'button_dispel.gif',
            defense_img: 'bar_dispel.gif',
			achNum : 25
        },
        'Ragnarok': {
            defButton: 'button_dispel.gif',
            defense_img: 'bar_dispel.gif'
        },
        'Genesis': {
            defButton: 'attack_monster_button3.jpg',
            defense_img: 'seamonster_ship_health.jpg',
			achNum : 25,
            repair_img: 'repair_bar_grey.jpg'
        },
        'Cronus': {
            ach: 500000,
			achNum : 25,
			achTitle : "Hydra Knight"
		},
        'Invading Force': {
			alias: 'Dark Legion'
		},
        'Battle Of The Dark L...': {
			alias: 'Dark Legion'
		},
        'Dark Legion': {
            duration: 168,
            ach: 1000,
			achNum : 25,
            defense_img: 'seamonster_ship_health.jpg',
            repair_img: 'repair_bar_grey.jpg'
		},
        'Emerald Dragon': {
            duration: 72,
            ach: 100000,
            listStamina: '5,10',
			achNum : 25,
			achTitle : "Dragon Knight",
            attack_img: ['seamonster_power.gif', 'serpent_10stam_attack.gif']
        },
        'Frost Dragon': {
            duration: 72,
            ach: 100000,
            listStamina: '5,10',
			achNum : 25,
			achTitle : "Dragon Knight",
            attack_img: ['seamonster_power.gif', 'serpent_10stam_attack.gif']
        },
        'Gold Dragon': {
            duration: 72,
            ach: 100000,
            listStamina: '5,10',
			achNum : 25,
			achTitle : "Dragon Knight",
            attack_img: ['seamonster_power.gif', 'serpent_10stam_attack.gif']
        },
        'Ancient Red Dragon': {
            duration: 72,
            ach: 100000,
            listStamina: '5,10',
			achNum : 25,
			achTitle : "Dragon Knight",
            attack_img: ['seamonster_power.gif', 'serpent_10stam_attack.gif']
        },
        'Karn': {
            duration: 120,
            ach: 15000
        },
        'Gildamesh': {
            duration: 72,
            ach: 15000
        },
        'Colossus Of Terra': {
            duration: 72,
            ach: 20000
        },
        'Sylvanas': {
            duration: 48,
            ach: 50000
        },
        'Lotus': {
            duration: 48,
            ach: 500000
        },
        'Keira': {
            duration: 48,
            ach: 30000
        },
        'Amethyst Sea Serpent': {
            duration: 72,
            ach: 250000,
            listStamina: '10,20',
            attack_img: ['serpent_10stam_attack.gif', 'serpent_20stam_attack.gif'],
            fortify_img: ['seamonster_fortify.gif'],
            defense_img: 'seamonster_ship_health.jpg'
        },
        'Ancient Sea Serpent': {
            duration: 72,
            ach: 250000,
            listStamina: '10,20',
            attack_img: ['serpent_10stam_attack.gif', 'serpent_20stam_attack.gif'],
            fortify_img: ['seamonster_fortify.gif'],
            defense_img: 'seamonster_ship_health.jpg'
        },
        'Emerald Sea Serpent': {
            duration: 72,
            ach: 250000,
            listStamina: '10,20',
            attack_img: ['serpent_10stam_attack.gif', 'serpent_20stam_attack.gif'],
            fortify_img: ['seamonster_fortify.gif'],
            defense_img: 'seamonster_ship_health.jpg'
        },
        'Sapphire Sea Serpent': {
            duration: 72,
            ach: 250000,
            listStamina: '10,20',
            attack_img: ['serpent_10stam_attack.gif', 'serpent_20stam_attack.gif'],
            fortify_img: ['seamonster_fortify.gif'],
            defense_img: 'seamonster_ship_health.jpg'
        },
        'Deathrune Siege I': {
			duration: 88,
			ach: 50,
			staUse: 1
		},
        'Deathrune Siege II': {
			duration: 144,
			ach: 100,
			staUse: 1
        },
        'Mephistopheles': {
            duration: 48,
            ach: 200000
        },
        'War Of The Red Plains': {
            tactics: true,
            duration: 168,
            ach: 10000
        },
        'Bahamut': {
            ach: 4000000
        },
        'Alpha Bahamut': {
            ach: 8000000
        },
        'Azriel': {
            ach: 8000000
        },
        'Alpha Mephistopheles': {
            ach: 12000000
        },
        "Aurelius": {
            tactics: true,
			achTitle : "Aurelius, Lion's Rebellion",
            ach: 1000
        },
        'Cronus Astaroth': {
            ach: 1000000
        }
    };

	// Cleans a link to put it in a standard order. If no argument passed, uses the last clicked URL
	monster.cleanLink = function(link, casuser, mpool) {
		var temp;
		if (!$u.isString(link) || link.length === 0) {
			link = session.getItem('clickUrl', '').replace('battle_expansion_monster.php','guildv2_battle_monster.php');
		}
		//con.log(2, 'CleanLink', link, casuser, mpool);
		temp = link.replace(/http.*\//,'');
		link = temp.replace(/\?.*/,'') + '?';
		['casuser=', 'mpool=', 'guild_creator_id=', 'guild_created_at=', 'slot=', 'monster_slot=', 'mid=', 'tower='].forEach( function(piece) {
			if (piece == 'casuser=' && temp.indexOf(piece) >= 0 && $u.setContent(casuser, 0) > 0) {
				//con.log(2, 'Cleaning link', piece, link);
				link += '&casuser=' + casuser;
			} else if (piece == 'mpool=' && temp.indexOf(piece) >= 0 && $u.setContent(mpool, 0) > 0) {
				//con.log(2, 'Cleaning link', piece, link);
				link += '&mpool=' + mpool;
			} else if (temp.indexOf(piece) >= 0) {
				//con.log(2, 'Cleaning link', piece, link);
				link += '&' + temp.match(new RegExp('(' + piece +  '\\w+)'))[1];
			}
		});
		return link.indexOf('=') >= 0 ? link.replace('?&', '?') : monster.lastClick;
	};

    monster.which = function(img, entity) {
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

            // current thinking is that continue should not be used as it can cause reader confusion
            // therefore when linting, it throws a warning
            /*jslint continue: true */
            for (i in monster.info) {
                if (monster.info.hasOwnProperty(i)) {
                    if ($u.hasContent(name)) {
                        break;
                    }

                    r = monster.info[i];
                    if (!$u.hasContent(r) || !$u.hasContent(r[entity]) || !$j.isArray(r[entity])) {
                        continue;
                    }

                    for (k = 0; k < r[entity].length; k += 1) {
                        if (img === r[entity][k]) {
                            name = i;
                            break;
                        }
                    }
                }
            }
            /*jslint continue: true */

            return name;
        } catch (err) {
            con.error("ERROR in monster.which: " + err.stack);
            return undefined;
        }
    };

    monster.getInfo = function(mName, value, defValue) {
        try {
			mName = $u.setContent(mName.monster, mName);
            if (!$u.isString(mName) || mName.length === 0) {
				con.warn('monster.getInfo not passed a monster name', mName);
            }
			mName = mName.replace(/^The /i,''),
			defValue = typeof defValue == 'undefined' ? monster.info['Default Monster'][value] : defValue;
            return $u.setContent(monster.info[mName],false) ? $u.setContent(monster.info[mName][value], defValue): defValue;
        } catch (err) {
            con.error("ERROR in monster.getInfo: " + err + ' stack ' + err.stack);
            return undefined;
        }
    };

    // Add a review page with path, and set 'entry' key to value, if wanted
    monster.setrPage = function(path, entry, value) {
        try {
            var rPage = {
                'path' : path,
                'review' : 0,
                'page' : false
            };

            if (!$u.hasContent(path) || !$u.isString(path)) {
                con.warn("path", path);
                throw "Invalid identifying path!";
            }
            //caap.stats.reviewPages = config.getItem('caap.stats.reviewPages', []);

            for (var it = 0; it < caap.stats.reviewPages.length; it++) {
                if (caap.stats.reviewPages[it].path === path) {
                    if ($u.hasContent(entry)) {
                        caap.stats.reviewPages[it][entry] = value;
                    }
					caap.saveStats();
                    return true;
                }
            }
            if ($u.hasContent(entry)) {
                rPage[entry] = value;
            }

            caap.stats.reviewPages.push(rPage);
			caap.saveStats();
            //con.log(2,'setrPage',path, entry, value, caap.stats.reviewPages,rPage);
            return false;
        } catch (err) {
            con.error("ERROR in monster.setrPage: " + err.stack);
            return false;
        }
    };

    // Delete all review pages where 'entry' = value
    monster.deleterPage = function(entry, value) {
        try {
            if (!$u.hasContent(entry) || !$u.isString(entry)) {
                con.warn("Delete entry invalid", entry, value);
                throw "Invalid identifying entry!";
            }
            var deleted = 0;

            for (var i = caap.stats.reviewPages.length - 1; i >= 0; i += -1) {
                if (caap.stats.reviewPages[i][entry] === value) {
                    deleted += 1;
                    con.log(2,'Monster review pages before',caap.stats.reviewPages, entry, i);
                    caap.stats.reviewPages.splice(i,1);
                    con.log(2,'Monster review pages after',caap.stats.reviewPages, entry, i, deleted);
                }
            }
			caap.saveStats();
            return deleted;

        } catch (err) {
            con.error("ERROR in monster.deleterPage: " + err.stack);
            return false;
        }
    };

    // Delete or add review page based on if 'tf' is true or false
    monster.togglerPage = function(path, tf, entry, value) {
        try {
            if (tf) {
                return monster.setrPage(path, entry, value);
            }
            return monster.deleterPage('path', path);
        } catch (err) {
            con.error("ERROR in monster.togglerPage: " + err.stack);
            return false;
        }
    };

    monster.init = function() {
        try {
            caap.stats.reviewPages = $u.setContent(caap.stats.reviewPages, []);

			var pageList = [
				'player_monster_list',
				'ajax:player_monster_list.php?monster_filter=2',
				'ajax:player_monster_list.php?monster_filter=3',
				'ajax:raid.php'];
				
			caap.stats.reviewPages.forEach( function(page) {
				if (pageList.indexOf(page.path) < 0) {
					con.log(1, 'Deleted path ' + page.path + ' from monster pages review', caap.stats.reviewPages);
					monster.deleterPage('path', page.path);
				}
            });
			
			monster.togglerPage(pageList[0], caap.stats.level > 6 || caap.stats.level === 0);
			monster.togglerPage(pageList[1], caap.stats.level > 6 || caap.stats.level === 0);
			monster.togglerPage(pageList[2], caap.stats.level > 6 || caap.stats.level === 0);
			monster.togglerPage(pageList[3], caap.stats.level > 7 || caap.stats.level === 0);

            return true;
        } catch (err) {
            con.error("ERROR in monster.init: " + err.stack);
            return false;
        }
    };

	monster.damaged = function(cM) {
		if (!$u.isObject(cM)) {
			con.warn('Invalid monster record passed to scan.joined.', cM);
		}
		return $u.setContent(cM.damage, 0) > 0;
	};

    monster.parseCondition = function(type, conditions) {
        try {
			
			//con.log(2, 'PARSE', type, conditions);

            if (!$u.isString(type) || !$u.isString(conditions)) {
				con.warn('Invalid data passed to monster.parseCondition', type, conditions);
				return false;
            }

            var str = conditions.match(new RegExp(':' + type + '([\\d\\.]*)(\\w?)'));
			
			if (!str) {
				return false;
			}
			
            var value = $u.setContent(str[1], 0),
                first = false,
                second = false;

            if ((/k/i.test(str[2]) || /m/i.test(str[2]))) {
                first = /k/i.test(str[2]);
                second = /m/i.test(str[2]);
                value = value * 1000 * (first + second * 1000);
            }

            return value;
        } catch (err) {
            con.error("ERROR in monster.parseCondition: " + err, type, conditions);
            return false;
        }
    };

	// Do KOB parsing and achievement/max damage levels plus colorization
	monster.parsing = function(cM) {
        try {
			// Start of Keep On Budget (KOB) code Part 1 -- required variables
			//con.log(2, 'Start of Keep On Budget (KOB) Code');
               var KOBenable = false,
                KOBbiasHours = 0,
                KOBach = false,
                KOBmax = false,
                KOBminFort = false,
                KOBtmp = 0,
                KOBbiasedTF = 0,
                KOBPercentTimeRemaining = 0,
                KOBtotalMonsterTime = 0,
                isTarget = false,
				achLevel = monster.parseCondition('ach', cM.conditions),
				maxDamage = monster.parseCondition('max', cM.conditions),
				maxToFortify = monster.parseCondition('f%', cM.conditions),
				maxSta = monster.parseCondition('sta', cM.conditions);

			cM.color = '';
			cM.over = '';
			maxToFortify = maxToFortify !== false ? maxToFortify : config.getItem('MaxToFortify', 0);
			achLevel = achLevel === 0 ? 1 : achLevel; // Added to prevent ach === 0 defaulting to false 
			if (achLevel === false) {
				achLevel = monster.getInfo(cM, 'ach');
			}
			maxDamage = maxDamage === 0 ? 1 : maxDamage;  // Added to prevent max === 0 defaulting to false 

			//default is disabled for everything
			KOBenable = false;

			//default is zero bias hours for everything
			KOBbiasHours = 0;

			//KOB needs to follow achievement mode for this monster so that KOB can be skipped.
			KOBach = false;

			//KOB needs to follow max mode for this monster so that KOB can be skipped.
			KOBmax = false;

			//KOB needs to follow minimum fortification state for this monster so that KOB can be skipped.
			KOBminFort = false;

			//create a temp variable so we don't need to call parseCondition more than once for each if statement
			KOBtmp = monster.parseCondition('kob', cM.conditions);
			if (KOBtmp !== false && $u.isNaN(KOBtmp)) {
				con.log(2, 'KOB NaN branch');
				KOBenable = true;
				KOBbiasHours = 0;
			} else if (KOBtmp === false) {
				con.log(5, 'KOB false branch');
				KOBenable = false;
				KOBbiasHours = 0;
			} else {
				con.log(2, 'KOB passed value branch');
				KOBenable = true;
				KOBbiasHours = KOBtmp;
			}

			//test if user wants kob active globally
			if (!KOBenable && (gm ? gm.getItem('KOBAllMonters', false, hiddenVar) : false)) {
				KOBenable = true;
			}

			//disable kob if in level up mode or if we are within 5 stamina of max potential stamina
			if (caap.inLevelUpMode() || caap.stats.stamina.num >= caap.stats.stamina.max - 5) {
				KOBenable = false;
			}

			if (KOBenable) {
				con.log(2, 'Level Up Mode: ', caap.inLevelUpMode());
				con.log(2, 'Stamina Avail: ', caap.stats.stamina.num);
				con.log(2, 'Stamina Max: ', caap.stats.stamina.max);

				//log results of previous two tests
				con.log(2, 'KOBenable: ', KOBenable);
				con.log(2, 'KOB Bias Hours: ', KOBbiasHours);
			}

			//Total Time alotted for monster
			KOBtotalMonsterTime = monster.getInfo(cM.monster, 'duration', cM.page === 'festival_battle_monster' ? 192 : 168);
			if (KOBenable) {
				con.log(2, 'Total Time for Monster: ', KOBtotalMonsterTime);

				//Total Damage remaining
				con.log(2, 'HP left: ', cM.life);
			}

			//Time Left Remaining
			if (KOBenable) {
				con.log(2, 'TimeLeft: ', cM.time);
			}

			//calculate the bias offset for time remaining
			KOBbiasedTF = cM.time - KOBbiasHours;

			//for 7 day monsters we want kob to not permit attacks (beyond achievement level) for the first 24 to 48 hours
			// -- i.e. reach achievement and then wait for more players and siege assist clicks to catch up
			if (KOBtotalMonsterTime >= 168) {
				KOBtotalMonsterTime = KOBtotalMonsterTime - (gm ? gm.getItem('KOBDelayStart', 48, hiddenVar) : 48);
			}

			//Percentage of time remaining for the currently selected monster
			KOBPercentTimeRemaining = Math.round(KOBbiasedTF / KOBtotalMonsterTime * 1000) / 10;
			if (KOBenable) {
				con.log(2, 'Percent Time Remaining: ', KOBPercentTimeRemaining);
			}

			// End of Keep On Budget (KOB) code Part 1 -- required variables

			isTarget = (cM.link === state.getItem('targetFromraid', '') || cM.link === state.getItem('targetFromMonster', '') || cM.link === state.getItem('targetFromFortify', ''));
			
			//con.log(2, 'MAX DAMAGE', maxDamage, cM.damage);
			if ((maxDamage && cM.damage >= maxDamage) || (maxSta && cM.spentStamina >= maxSta)) {

				cM.color = 'red';
				cM.over = 'max';
				//used with KOB code
				KOBmax = true;
				//used with kob debugging
				if (KOBenable) {
					con.log(2, 'KOB - max activated');
				}

			} else if (cM.fortify !== -1 && cM.fortify < config.getItem('MinFortToAttack', 1)) {
				cM.color = 'purple';
				//used with KOB code
				KOBminFort = true;
				//used with kob debugging
				if (KOBenable) {
					con.log(2, 'KOB - MinFort activated');
				}

			} else if (cM.damage >= achLevel && (config.getItem('AchievementMode', false) || monster.parseCondition('ach', cM.conditions) !== false)) {
				cM.color = 'darkorange';
				cM.over = 'ach';
				//used with KOB code
				KOBach = true;
				//used with kob debugging
				if (KOBenable) {
					con.log(2, 'KOB - achievement reached');
				}

			}

			//Start of KOB code Part 2 begins here
			if (KOBenable && !KOBmax && !KOBminFort && KOBach && cM.life < KOBPercentTimeRemaining) {
				//kob color
				cM.color = 'magenta';
				// this line is required or we attack anyway.
				cM.over = 'max';
				//used with kob debugging
				if (KOBenable) {
					con.log(2, 'KOB - budget reached');
				}

			} else {
				if (!KOBmax && !KOBminFort && !KOBach) {
					//the way that the if statements got stacked, if it wasn't kob it was painted black anyway
					//had to jump out the black paint if max, ach or fort needed to paint the entry.
					cM.color = $u.bestTextColor(state.getItem("StyleBackgroundLight", "#E0C961"));
				}
			}
			//End of KOB code Part 2 stops here.
        } catch (err) {
            con.error("ERROR in monster.KOB: " + err, cM);
            return false;
        }
    };
	
    monster.t2kCalc = function(cM) {
        try {
            var duration = monster.getInfo(cM, 'duration', cM.page === 'festival_battle_monster' ? 192 : 168),
                timeUsed = duration - cM.time,
                T2K = ((cM.life * timeUsed) / (100 - cM.life)).dp(2);

			con.log(3, 'T2K: ', $u.minutes2hours(T2K));
			return T2K;
        } catch (err) {
            con.error("ERROR in monster.t2kCalc: " + err.stack);
            return 0;
        }
    };

    monster.characterClass = {
        'Warrior': ['Strengthen', 'Heal'],
        'Rogue': ['Cripple'],
        'Mage': ['Deflect'],
        'Cleric': ['Heal'],
        'Warlock': ['Heal', 'Deflect'],
        'Ranger': ['Strengthen', 'Heal', 'Cripple']
    };

    monster.fullReview = function(which) {
        try {
            for (var it = monster.records.length - 1; it >= 0; it -= 1) {
                if ((which == 'Feed') === (monster.records[it].status === 'Join')) {
					monster.deleteRecord(monster.records[it].link);
				}
			}
			if (which != 'Feed') {
				caap.stats.reviewPages.forEach( function(page) {
					monster.setrPage(page.path,'review',0);
				});
				schedule.setItem('NotargetFrombattle_monster', 0);
			}
            caap.updateDashboard(true);
            localStorage.AFrecentAction = false;

            return true;
        } catch (err) {
            con.error("ERROR in monster.fullReview: " + err.stack);
            return false;
        }
    };

    monster.select = function(force) {
        try {
            if (!caap.oneMinuteUpdate('selectMonster', force) || caap.stats.level < 7) {
                return false;
            }

            var monsterList = {
					'battle_monster': [],
					'raid': [],
					'any': []
				},
				it = 0,
                len = 0,
                len1 = 0,
                len2 = 0,
                len3 = 0,
                s = 0,
				cM = {},
				whichStat = 'any',
				conditions = '',
				monString = '',
                selectTypes = [],
				maxToFortify = 0,
                nodeNum = 0,
                firstOverAch = '',
                firstUnderMax = '',
                firstFortOverAch = '',
                firstFortUnderMax = '',
                firstStunOverAch = '',
                firstStunUnderMax = '',
                firstStrengthOverAch = '',
                firstStrengthUnderMax = '',
                strengthTarget = '',
                fortifyTarget = '',
                stunTarget = '',
				siegeLimit,
                target = {
                    'battle_monster': '',
                    'raid': '',
                    'fortify': ''
                },
                monsterlink = '',
                p = 0,
                m = 0,
                attackOrderList = [];

            // Next we get our monster objects from the repository and break them into separate lists
            // for monster or raid.  If we are serializing then we make one list only.

            for (it = monster.records.length - 1; it >= 0; it -= 1) {
				cM = monster.records[it];
				if (!$u.hasContent(cM.link)) {
					con.warn('Deleting monster record without link', cM);
					monster.deleteRecord(cM.link);
				} else if (cM.lMissing > 3) {
					con.log(2, 'Deleting monster ' + cM.name + ' since not seen on monster list ' + cM.lMissing + ' times', cM);
					monster.deleteRecord(cM.link);
				} else if (monster.damaged(cM)) {
					//con.log(2,'Review timer check', cM.name, cM.lMissing, typeof cM.lpage, typeof cM.lpage == 'undefined', schedule.since($u.setContent(cM.listReviewed, 0), 3 * 3600));
					if (cM.charClass.length) {
						if (cM.color !== 'grey' && schedule.since(cM.stunTime, 0)) {
							con.log(2, "Review monster due to class timer", cM.name);
							cM.review = -1;
						}
					}
					cM.conditions = 'none';
					whichStat = config.getItem('SerializeRaidsAndMonsters', false) ? 'any' : cM.link.indexOf('raid') >=0 ? 'raid' : 'battle_monster';
					monsterList[whichStat].push(cM.link);
                } else {
					cM.conditions = feed.addConditions(cM) || cM.conditions;
				}
				if (cM.status !== 'Attack'){
					cM.debtStart = -1;
					cM.debtStamina = 0;
				}
            }

            monster.doSave = true;

            if (whichStat === 'any') {
                selectTypes = ['any'];
            } else {
                selectTypes = ['battle_monster', 'raid'];
            }

            // We loop through for each selection type (only once if serialized between the two)
            // We then read in the users attack order list

            selectTypes.forEach(function(type) {
                if (!$u.hasContent(monsterList[type])) {
					return;
                }

                firstOverAch = '';
                firstUnderMax = '';
                firstFortOverAch = '';
                firstFortUnderMax = '';
                firstStunOverAch = '';
                firstStunUnderMax = '';
                firstStrengthOverAch = '';
                firstStrengthUnderMax = '';
                strengthTarget = '';
                fortifyTarget = '';
                stunTarget = '';

                // The extra apostrophe at the end of attack order makes it match any "soandos's monster" so it always selects a monster if available
                if (type === 'any') {
                    attackOrderList = config.getList('orderbattle_monster', '');
                    $j.merge(attackOrderList, config.getList('orderraid', '').concat('your', "'"));
                } else {
                    attackOrderList = config.getList('order' + type, '').concat('your', "'");
                }

                //con.log(2, 'attackOrderList', attackOrderList);
                // Next we step through the users list getting the name and conditions
                attackOrderList.forEach( function(aoItem) {
                    if (!aoItem.trim()) {
                        return;
                    }
                    // Now we try to match the users name against our list of monsters
                    monsterList[type].forEach(function(thisMon) {
						cM = monster.getRecord(thisMon);
                        // If we set conditions on this monster already then we do not reprocess
                        if (cM.conditions !== 'none') {
                            return;
                        }
						conditions = aoItem.replace(new RegExp("^[^:]+"), '').toString().trim();
						monString = aoItem.match(new RegExp("^[^:]+")).toString().trim().toLowerCase();
                        // If this monster does not match, skip to next one
                        if ((monString !== 'all' && !monster.getRecord(thisMon).name.toLowerCase().hasIndexOf(monString)) 
							|| (conditions.regex(/(:conq)\b/) && (cM.lpage != "ajax:player_monster_list.php?monster_filter=2"))
							|| (conditions.regex(/(:!conq)\b/) && (cM.lpage == "ajax:player_monster_list.php?monster_filter=2"))) {
                            return;
                        }

                        //Monster is a match so we set the conditions
                        cM.conditions = conditions;
						cM.fullC = aoItem;

						cM.select = true;

                        monster.doSave = true;
                        // If it's complete or collect rewards, no need to process further
                        if (cM.color === 'grey') {
							monster.setRecord(cM);
                            return;
                        }
						
						monster.parsing(cM);
						
						if (cM.siegeLevel > 0) {
							siegeLimit = conditions.regex(/:!s\b/) ? 0 : !conditions.regex(/:fs\b/) ? monster.parseCondition("s", cM.conditions) 
								: (caap.stats.stamina.num >= caap.maxStatCheck('stamina') && cM.phase > 2) ? 50 : 1;
							siegeLimit = siegeLimit !== false ? siegeLimit : config.getItem('siegeUpTo','Never') === 'Never' ? 0 : config.getItem('siegeUpTo','Never');
							
							cM.doSiege = cM.siegeLevel <= siegeLimit && cM.damage > 0 
								&& (cM.phase > 1 || (conditions && conditions.regex(/:fs\b/)));
							//con.log(2, "Page Review " + (cM.doSiege ? 'DO siege ' : "DON'T siege ") + cM.name, cM.siegeLevel, siegeLimit, cM.phase, config.getItem('siegeUpTo','None'), cM.conditions.match(':fs:'), cM.conditions.match(':!s:'));
						} else {
							cM.doSiege = false;
							cM.siegeLevel = 1000;
						}

                        // monster.parsing set our 'color' and 'over' values. Check these to see if this is the monster we should select
                        if (!firstUnderMax && cM.color !== 'purple') {
                            if (cM.over === 'ach') {
                                if (!firstOverAch) {
                                    firstOverAch = thisMon;
                                    con.log(3, 'firstOverAch', firstOverAch, cM.name);
                                }
                            } else if (cM.over !== 'max') {
                                firstUnderMax = thisMon;
                                con.log(3, 'firstUnderMax', firstUnderMax, cM.name);
                            }
                        }

						if (!cM.charClass.length || (cM.charClass.length && monster.characterClass[cM.charClass] && monster.characterClass[cM.charClass].hasIndexOf('Heal'))) {
							maxToFortify = (monster.parseCondition('f%', cM.conditions) !== false) ? monster.parseCondition('f%', cM.conditions) : config.getItem('MaxToFortify', 0);
							if (cM.fortify >= 0 && !firstFortUnderMax && cM.fortify < maxToFortify) {
								if (cM.over === 'ach') {
									if (!firstFortOverAch) {
										firstFortOverAch = thisMon;
										con.log(3, 'firstFortOverAch', firstFortOverAch, cM.name);
									}
								} else if (cM.over !== 'max') {
									firstFortUnderMax = thisMon;
									con.log(3, 'firstFortUnderMax', firstFortUnderMax, cM.name);
								}
							}
						}

						if (cM.charClass.length) {
							if (monster.characterClass[cM.charClass] && monster.characterClass[cM.charClass].hasIndexOf('Strengthen') && (config.getItem("StrengthenTo100", true) || cM.stunType == 'strengthen')) {
								if (!firstStrengthUnderMax && cM.strength < 100) {
									if (cM.over === 'ach') {
										if (!firstStrengthOverAch) {
											firstStrengthOverAch = thisMon;
											con.log(3, 'firstStrengthOverAch', firstStrengthOverAch, cM.name);
										}
									} else if (cM.over !== 'max') {
										firstStrengthUnderMax = thisMon;
										con.log(3, 'firstStrengthUnderMax', firstStrengthUnderMax, cM.name);
									}
								}
							}

							if (!firstStunUnderMax && cM.stunDo) {
								if (cM.over === 'ach') {
									if (!firstStunOverAch) {
										firstStunOverAch = thisMon;
										con.log(3, 'firstStunOverAch', firstStunOverAch, cM.name);
									}
//                                    } else if (cM.over !== 'max') {
								} else {
									firstStunUnderMax = thisMon;
									con.log(3, 'firstStunUnderMax', firstStunUnderMax, cM.name);
								}
							}
                        }
						monster.setRecord(cM);
                    });
                });

                // Now we use the first under max/under achievement that we found. If we didn't find any under
                // achievement then we use the first over achievement
                if (type !== 'raid') {
                    stunTarget = $u.setContent(firstStunUnderMax, firstStunOverAch);
                    strengthTarget = $u.setContent(firstStrengthUnderMax, firstStrengthOverAch);
                    fortifyTarget = $u.setContent(firstFortUnderMax, firstFortOverAch);
					target.fortify = stunTarget || strengthTarget || fortifyTarget;
                }

                // If we've got a monster for this selection type then we set the GM variables for the name
                // and stamina requirements
                monsterlink = $u.setContent(firstUnderMax, firstOverAch);
                if (monsterlink) {
					whichStat = monsterlink.indexOf('raid') >=0 ? 'raid' : 'battle_monster';
                    target[whichStat] = monsterlink;
                }
            });

            state.setItem('targetFromMonster', target.battle_monster);
            state.setItem('targetFromraid', target.raid);
            state.setItem('targetFromFortify', target.fortify);
			
            caap.updateDashboard(true);
            return true;
        } catch (err) {
            con.error("ERROR in monster.select: " + err.stack);
            return false;
        }
    };

    monster.menu = function() {
        try {
            var XMonsterInstructions = "Start attacking if stamina is above this point",
                XMinMonsterInstructions = "Do not attack if stamina is below this point",
                attackOrderInstructions = "List of search words that decide which monster to attack first. " + "Use words in player name or in monster name. To specify max damage follow keyword with " +
                    ":max token and specifiy max damage values. Use 'k' and 'm' suffixes for thousand and million. " + "To override achievement use the ach: token and specify damage values.",
                fortifyInstructions = "Fortify if ship health is below this % (leave blank to disable)",
                questFortifyInstructions = "Do quests if ship health is above this % and quest mode is set to Not Fortify (leave blank to disable)",
                stopAttackInstructions = "Do not attack if ship health is below this % (leave blank to disable)",
                monsterachieveInstructions = "Check if monsters have reached achievement damage level first. Switch when achievement met.",
                powerattackInstructions = "Use power attacks. Only do normal attacks if power attack not possible",
                powerattackMaxInstructions = "Use maximum power attacks globally on Skaar, Genesis, Ragnarok, and Bahamut types. Only do normal power attacks if maximum power attack not possible",
                useTacticsInstructions = "Use the Tactics attack method, on monsters that support it, instead of the normal attack. You must be level 50 or above.",
                useTacticsThresholdInstructions = "If monster health falls below this percentage then use the regular attack buttons instead of tactics.",
                collectRewardInstructions = "Automatically collect monster rewards.",
                strengthenTo100Instructions = "Do not wait until the character class gets a bonus for strengthening but perform strengthening as soon as the energy is available.",
                healPercStamInst = "After I hit a monster, heal my damage until the health is at least as high as when I started, or up to this percent of my stamina spent. If energy is not available to heal, monsters will not be hit.",
                mbattleList = ['Stamina Available', 'At Max Stamina', 'At X Stamina', 'Stay Hidden', 'Review Only', 'Never'],
                mbattleInst = [
                    'Stamina Available will attack whenever you have enough stamina',
                    'At Max Stamina will attack when stamina is at max and will burn down all stamina when able to level up',
                    'At X Stamina you can set maximum and minimum stamina to battle',
                    'Stay Hidden uses stamina to try to keep you under 10 health so you cannot be attacked, while also attempting to maximize your stamina use for Monster attacks. YOU MUST SET BATTLE WHEN TO "STAY HIDDEN" TO USE THIS FEATURE.',
                    'Reviews Only will only review, siege, collect, clear etc. according to settings',
                    'Never - disables attacking monsters'],
                fortifyList = ['Energy Available', 'At Max Energy', 'At X Energy', 'Never'],
                fortifyInst = [
                    'Energy Available will fortify whenever you have enough energy',
                    'At Max Energy will fortify when energy is at max and will burn down all energy when able to level up',
                    'At X Energy you can set maximum and minimum energy to fortify',
                    'Never - disables fortifying monsters'],
                stunList = ['Immediately', '5', '4', '3', '2', '1', 'Never'],
                stunInst = [
                    'Cripple/Deflect will be as soon as possible',
                    'Cripple/Deflect will be when 5 hours are left, plus or minus up to 30 min',
                    'Cripple/Deflect will be when 4 hours are left, plus or minus up to 30 min',
                    'Cripple/Deflect will be when 3 hours are left, plus or minus up to 30 min',
                    'Cripple/Deflect will be when 2 hours are left, plus or minus up to 30 min',
                    'Cripple/Deflect will be when 1 hours are left, plus or minus up to 30 min',
                    'Cripple/Deflect is disabled'],
                siegeList = ['Never', '1', '50', '250'],
                siegeInst = [
                    'Never siege monsters',
                    'Siege monsters only for one point of stamina, will not siege unless 1st siege has been launched',
                    'Siege monsters for up to 50 stamina, will not siege unless 1st siege has been launched',
                    'Siege monsters for up to 250 stamina, will not siege unless 1st siege has been launched'],
                delayStayHiddenInstructions = "Delay staying hidden if \"safe\" to wait for enough stamina to attack monster.",
                monsterDelayInstructions = "Max random delay (in seconds) to battle monsters",
                htmlCode = '';

            htmlCode += caap.startToggle('Monster', 'MONSTER');
            htmlCode += caap.makeDropDownTR("Attack When", 'WhenMonster', mbattleList, mbattleInst, '', 'Never', false, false, 62);
            htmlCode += caap.display.start('WhenMonster', 'isnot', 'Never');
            htmlCode += "<div id='caap_WhenMonsterStayHidden_hide' style='color: red; font-weight: bold; display: ";
            htmlCode += (config.getItem('WhenMonster', 'Never') === 'Stay Hidden' && config.getItem('WhenBattle', 'Never') !== 'Stay Hidden' ? 'block' : 'none') + "'>";
            htmlCode += "Warning: Battle Not Set To 'Stay Hidden'";
            htmlCode += "</div>";
            htmlCode += caap.display.start('WhenMonster', 'is', 'At X Stamina');
            htmlCode += caap.makeNumberFormTR("Start At Or Above", 'XMonsterStamina', XMonsterInstructions.replace('stamina','energy'), 1, '', '', true, false);
            htmlCode += caap.makeNumberFormTR("Stop At Or Below", 'XMinMonsterStamina', XMinMonsterInstructions.replace('stamina','energy'), 0, '', '', true, false);
            htmlCode += caap.display.end('WhenMonster', 'is', 'At X Stamina');
            htmlCode += caap.display.start('WhenMonster', 'is', 'Stay Hidden');
            htmlCode += caap.makeCheckTR("Delay hide if \"safe\"", 'delayStayHidden', true, delayStayHiddenInstructions, true);
            htmlCode += caap.display.end('WhenMonster', 'is', 'Stay Hidden');
            //htmlCode += caap.makeNumberFormTR("Monster delay secs", 'seedTime', monsterDelayInstructions, 300, '', '');
            htmlCode += caap.makeCheckTR("Use Tactics", 'UseTactics', false, useTacticsInstructions);
            htmlCode += caap.display.start('UseTactics', 'is', true);
            htmlCode += caap.makeNumberFormTR("Health threshold", 'TacticsThreshold', useTacticsThresholdInstructions, 75, '', '', true, false);
            htmlCode += caap.display.end('UseTactics', 'is', true);
            htmlCode += caap.makeCheckTR("Power Attack Only", 'PowerAttack', true, powerattackInstructions);
            htmlCode += caap.display.start('PowerAttack', 'is', true);
            htmlCode += caap.makeCheckTR("Power Attack Max", 'PowerAttackMax', false, powerattackMaxInstructions, true);
            htmlCode += caap.display.end('PowerAttack', 'is', true);
            htmlCode += caap.makeDropDownTR("Siege up to", 'siegeUpTo', siegeList, siegeInst, '', 'Never', false, false, 62);
            htmlCode += caap.makeCheckTR("Collect Monster Rewards", 'monsterCollectReward', false, collectRewardInstructions);
            htmlCode += caap.makeCheckTR("Clear Complete Monsters", 'clearCompleteMonsters', false, '');
            //htmlCode += caap.makeCheckTR("Battle Conquest Monsters", 'conquestMonsters', false, '');
            htmlCode += caap.makeCheckTR("Achievement Mode", 'AchievementMode', true, monsterachieveInstructions);
            htmlCode += caap.makeNumberFormTR("Heal My Damage Up to % of Stamina Used", 'HealPercStam', healPercStamInst, 20, '', '');
            htmlCode += caap.makeDropDownTR("Fortify for Others When", 'WhenFortify', fortifyList, fortifyInst, '', 'Never', false, false, 62);
            htmlCode += caap.display.start('WhenFortify', 'isnot', 'Never');
            htmlCode += caap.display.start('WhenFortify', 'is', 'At X Energy');
            htmlCode += caap.makeNumberFormTR("Start At Or Above", 'XFortifyEnergy', XMonsterInstructions, 1, '', '', true, false);
            htmlCode += caap.makeNumberFormTR("Stop At Or Below", 'XMinFortifyEnergy', XMinMonsterInstructions, 0, '', '', true, false);
            htmlCode += caap.makeCheckTR("Do not wait for Strengthen phase", 'StrengthenTo100', true, strengthenTo100Instructions);
            htmlCode += caap.display.end('WhenFortify', 'is', 'At X Energy');
            htmlCode += caap.makeNumberFormTR("Fortify If % Under", 'MaxToFortify', fortifyInstructions, 50, '', '');
            htmlCode += caap.makeNumberFormTR("Quest If % Over", 'MaxHealthtoQuest', questFortifyInstructions, 60, '', '');
            htmlCode += caap.display.end('WhenFortify', 'isnot', 'Never');
            htmlCode += caap.makeNumberFormTR("No Attack If % Under", 'MinFortToAttack', stopAttackInstructions, 10, '', '');
            htmlCode += caap.makeDropDownTR("Cripple/Deflect when", 'WhenStun', stunList, stunInst, '', 'Immediately', false, false, 62);
            htmlCode += caap.makeTD("Attack Monsters in this order <a href='http://caaplayer.freeforums.org/attack-monsters-in-this-order-clarified-t408.html' target='_blank' style='color: blue'>(INFO)</a>");
            htmlCode += caap.makeTextBox('orderbattle_monster', attackOrderInstructions, '', '');
            htmlCode += caap.display.end('WhenMonster', 'isnot', 'Never');
            htmlCode += caap.makeCheckTR("Enable Labels", 'monsterEnableLabels', true, "When enabled then the damage and fortify bars will display percentage labels.");
            htmlCode += caap.endToggle;
            return htmlCode;
        } catch (err) {
            con.error("ERROR in monster.menu: " + err.stack);
            return '';
        }
    };

	monster.dashboard = function() {
		monster.dashboardCommon('Monster');
	};
	
	// Creates the Monster Dashboard and Feed Dashboards
    monster.dashboardCommon = function(which) {
        try {
            if (config.getItem('DBDisplay', '') === which && session.getItem(which.toLowerCase() + "DashUpdate", true)) {
                var headers = ['Name', 'Damage', 'Dmg%', 'Fort%', 'Str%', 'Time', 'T2K', 'Phase', '&nbsp;', '&nbsp;', '&nbsp;'],
                    values = ['name', 'damage', 'life', 'fortify', 'strength', 'time', 't2k', 'phase', 'link'],
                    pp = 0,
                    value = null,
                    color = '',
                    monsterConditions = '',
                    achLevel = 0,
                    maxDamage = 0,
                    title = '',
                    id = '',
                    link = '',
                    visitMonsterInstructions = '',
                    removeLink = '',
                    removeLinkInstructions = '',
                    len = 0,
                    data = {
                        text: '',
                        color: '',
                        bgcolor: '',
                        id: '',
                        title: ''
                    },
                    linkRegExp = new RegExp("'(http.+)'"),
                    count = 0,
                    handler = null,
                    head = '',
                    body = '',
                    row = '',
					whichL = which.toLowerCase();

				if (which == 'Feed') {
					headers[1] = 'Score';
					values[1]= 'score';
				}
					
                for (pp = 0, len = headers.length; pp < len; pp += 1) {
                    switch (headers[pp]) {
                    case 'Name':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '30%'
                        });
                        break;
                    case 'Damage':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '13%'
                        });
                        break;
                    case 'Score':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '13%'
                        });
                        break;
                    case 'Dmg%':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '8%'
                        });
                        break;
                    case 'Fort%':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '8%'
                        });
                        break;
                    case 'Str%':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '8%'
                        });
                        break;
                    case 'Time':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '8%'
                        });
                        break;
                    case 'T2K':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '8%'
                        });
                        break;
                    case 'Link':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '2%'
                        });
                        break;
                    case 'Phase':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '13%'
                        });
                        break;
                    case '&nbsp;':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '1%'
                        });
                        break;
                    default:
                    }
                }

                head = caap.makeTr(head);
                values.shift();
                monster.records.forEach(function(cM) {
					//con.log(2, "MONSTER DASH",cM);
					if ((cM.status == 'Join') != (which == 'Feed')) {
						return;
					}
                    row = '';
                    color = cM.color;
                    if (cM.link === state.getItem('targetFromFortify', '')) {
                        color = 'blue';
                    } else if (cM.link === state.getItem('targetFromMonster', '') || cM.link === state.getItem('targetFromraid', '')) {
                        color = 'green';
                    }

                    monsterConditions = cM.conditions;
                    achLevel = monster.parseCondition('ach', monsterConditions);
                    maxDamage = monster.parseCondition('max', monsterConditions);
                    if (cM.link.length) {
                        link = caap.domain.altered + '/' + cM.link;
                        visitMonsterInstructions = "Clicking this link will take you to " + cM.name;
                        data = {
                            text: '<span id="caap_' + whichL + '_' + count + '" title="' + visitMonsterInstructions + '" mname="' + cM.name + '" mlink="' + cM.link +
                                '" rlink="' + link + '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + cM.name + '</span>',
                            color: 'blue',
                            id: '',
                            title: ''
                        };

                        row += caap.makeTd(data);
                    } else {
                        row += caap.makeTd({
                            text: cM.name,
                            color: color,
                            id: '',
                            title: ''
                        });
                    }

                    values.forEach(function(displayItem) {
                        id = "caap_" + displayItem + "_" + count;
                        title = '';
                        if (displayItem === 'phase' && color === 'grey') {
                            row += caap.makeTd({
                                text: cM.status,
                                color: color,
                                id: '',
                                title: ''
                            });
                        } else {
                            value = cM[displayItem];
                            if (value !== '' && (value >= 0 || value.length)) {
                                if (displayItem !== "time" && displayItem !== "t2k" && !$u.isNaN(value) && value > 999) {
                                    value = value.addCommas();
                                }

                                switch (displayItem) {
                                case 'damage':
                                    if (achLevel) {
                                        title = "User Set Monster Achievement: " + achLevel.addCommas();
                                    } else if (config.getItem('AchievementMode', false)) {
                                        title = "Stamina used: " + cM.spentStamina + " Energy used: " + cM.spentEnergy + " Default Monster Achievement: " + monster.getInfo(cM, 'ach').addCommas();
                                        title += cM.page === 'festival_battle_monster' ? " Festival Monster Achievement: " + monster.getInfo(cM, 'festival_ach').addCommas() : '';
                                    } else {
                                        title = "Achievement Mode Disabled";
                                    }

                                    title += $u.hasContent(maxDamage) && $u.isNumber(maxDamage) ? " - User Set Max Damage: " + maxDamage.addCommas() : '';
                                    break;
                                case 'time':								
									value = $u.minutes2hours(value);
									title = "Total Monster Duration: " + monster.getInfo(cM, 'duration', 168) + " hours";
                                    break;
                                case 't2k':
                                    value = $u.minutes2hours(value);
                                    title = "Estimated Time To Kill: " + value + " hours:mins";
                                    break;
                                case 'life':
                                    title = "Percentage of monster life remaining: " + value + "%";
                                    break;
                                case 'phase':
                                    value = value + "/" + monster.getInfo(cM, 'siege') + " need " + cM.miss;
                                    title = "Siege Phase: " + value + " more clicks";
                                    break;
                                case 'fortify':
                                    title = (config.getItem('HealPercStam', 20) && cM.debtStamina > 0 ? 'Stamina debt: ' + cM.debtStamina + ' or until Fort % > ' + cM.debtStart + ' ' : '') +"Percentage of party health/monster defense: " + value + "%";
                                    break;
                                case 'strength':
                                    title = "Percentage of party strength: " + value + "%";
                                    break;
                                case 'link':
                                    value = "<a href='" + link + "'>Link<\a>";
                                    break;
                                default:
                                }

                                row += caap.makeTd({
                                    text: value,
                                    color: color,
                                    id: id,
                                    title: title
                                });
                            } else {
                                row += caap.makeTd({
                                    text: '',
                                    color: color,
                                    id: '',
                                    title: ''
                                });
                            }
                        }
                    });

                    if (monsterConditions && monsterConditions !== 'none') {
                        data = {
                            text: '<span title="User Set Condition string: ' + cM.fullC + '" class="ui-icon ui-icon-info">i</span>',
                            color: 'blue',
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

                    if (cM.link.length) {
                        removeLink = link.replace("casuser", "remove_list") + (cM.page === 'festival_battle_monster' ? '&remove_monsterKey=' + cM.mid.replace("&mid=", "") : '');
                        removeLinkInstructions = "Clicking this link will remove " + cM.name + " from CAAP. If still on your monster list, it will reappear when CAAP sees it again.";
                        data = {
                            text: '<span id="caap_remove_' + count + '" title="' + removeLinkInstructions + '" mname="' + cM.name + '" mlink="' + cM.link +
                                '" rlink="' + removeLink + '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';" class="ui-icon ui-icon-circle-close">X</span>',
                            color: 'blue',
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
                    count += 1;
                });

                $j("#caap_info" + which, caap.caapTopObject).html(
                $j(caap.makeTable(whichL, head, body)).dataTable({
                    "bAutoWidth": false,
                    "bFilter": false,
                    "bJQueryUI": false,
                    "bInfo": false,
                    "bLengthChange": false,
                    "bPaginate": false,
                    "bProcessing": false,
                    "bStateSave": true,
                    "bSortClasses": false,
                    "aoColumnDefs": [{
                        "bSortable": false,
                        "aTargets": [8, 9, 10]
                    }, {
                        "sSortDataType": "remaining-time",
                        "aTargets": [5, 6]
                    }]
                }));

                handler = function(e) {
                    var visitMonsterLink = {
                        mlink: '',
                        mname: '',
                        rlink: '',
                        arlink: ''
                    },
                    i = 0,
                        len = 0;

                    for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                        if (e.target.attributes[i].nodeName === 'mname') {
                            visitMonsterLink.mname = e.target.attributes[i].value;
                        } else if (e.target.attributes[i].nodeName === 'rlink') {
                            visitMonsterLink.rlink = e.target.attributes[i].value;
                            visitMonsterLink.arlink = visitMonsterLink.rlink.replace(caap.domain.altered + "/", "");
                        } else if (e.target.attributes[i].nodeName === 'mlink') {
                            visitMonsterLink.mlink = e.target.attributes[i].value;
                        }
                    }

					monster.lastClick = visitMonsterLink.mlink;
					console.log('Visiting link ' + monster.lastClick);
                    caap.clickAjaxLinkSend(visitMonsterLink.arlink);
                };

                $j("span[id*='caap_" + whichL + "_']", caap.caapTopObject).off('click', handler).on('click', handler);
                handler = null;

                handler = function(e) {
                    var monsterRemove = {
                        mlink: '',
                        mname: '',
                        rlink: '',
                        arlink: ''
                    },
                    i = 0,
                        len = 0,
                        resp = false;

                    for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                        if (e.target.attributes[i].nodeName === 'mname') {
                            monsterRemove.mname = e.target.attributes[i].value;
                        } else if (e.target.attributes[i].nodeName === 'rlink') {
                            monsterRemove.rlink = e.target.attributes[i].value;
                            monsterRemove.arlink = monsterRemove.rlink.replace(caap.domain.altered + "/", "");
                        } else if (e.target.attributes[i].nodeName === 'mlink') {
                            monsterRemove.mlink = e.target.attributes[i].value;
                        }
                    }

					monster.deleteRecord(monsterRemove.mlink);
                };

                $j("span[id*='caap_remove_']", caap.caapTopObject).off('click', handler).on('click', handler);
                handler = null;
                session.setItem(which.toLowerCase() + "DashUpdate", false);
            }

            return true;
        } catch (err) {
            con.error("ERROR in monster.dashboardCommon: " + err.stack, which);
            return false;
        }
    };

}());
