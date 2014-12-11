/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,feed:true,image64,gm,
schedule,gifting,state,army, general,session,monster:true,guild_monster */
/*jslint maxlen: 256 */

    ////////////////////////////////////////////////////////////////////
    //                          feed OBJECT
    // this is the main object for dealing with feed records
    /////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    feed = {
        records: {},

        load: function() {
            try {
/*                monster.records = gm.getItem('monster.records', 'default');
                if (monster.records === 'default' || !$j.isPlainObject(monster.records)) {
                    monster.records = gm.setItem('monster.records', {});
                }
*/
/* convert to feed pages later
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
				
				monster.togglerPage(pageList[0], caap.stats.level > 6);
				monster.togglerPage(pageList[1], caap.stats.level > 6 && config.getItem("conquestMonsters", false));
				monster.togglerPage(pageList[2], caap.stats.level > 6);
				monster.togglerPage(pageList[3], caap.stats.level > 7);
*/
                feed.deleteExpired();
                session.setItem("FeedDashUpdate", true);
                return true;
            } catch (err) {
                con.error("ERROR in feed.load: " + err.stack);
                return false;
            }
        },

        save: function(src) {
            try {
/*                if (caap.domain.which === 3) {
                    caap.messaging.setItem('monster.records', monster.records);
                } else {
                    gm.setItem('monster.records', monster.records);
                    con.log(3, "feed.save", monster.records);
                    if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif") && src !== "caapif") {
                        con.log(2, "feed.save send");
                        caap.messaging.setItem('monster.records', monster.records);
                    }
                }
*/
                feed.deleteExpired();
                if (caap.domain.which !== 0) {
                    session.setItem("FeedDashUpdate", true);
                }

                return true;
            } catch (err) {
                con.error("ERROR in feed.save: " + err.stack);
                return false;
            }
        },

        deleteExpired: function() {
            try {
                var i = '',
                    save = false,
                    seconds = 0,
                    cM = {};

                // current thinking is that continue should not be used as it can cause reader confusion
                // therefore when linting, it throws a warning
                /*jslint continue: true */
                for (i in monster.records) {
                    if (monster.records.hasOwnProperty(i)) {
                        if (!monster.records[i].checked) {
                            con.log(3, "feed.deleteExpired skipping unchecked record", monster.records[i]);
                            continue;
                        }

                        seconds = (monster.records[i].time[0] * 3600) + (monster.records[i].time[1] * 60) + monster.records[i].time[2];
                        seconds = seconds > 0 ? seconds : 86400;
                        cM = monster.getItem(monster.records[i].md5);
                        if (schedule.since(monster.records[i].review, seconds) && !$u.hasContent(cM.monster)) {
                            con.log(2, "Feed Entry Expired", monster.records[i]);
                            feed.deleteItem(monster.records[i].md5);
                            save = true;
                        }
                    }
                }
                /*jslint continue: false */

                if (save) {
                    feed.save();
                }

                return true;
            } catch (err) {
                con.error("ERROR in feed.deleteExpired: " + err.stack);
                return false;
            }
        },
/*
        setItem: function(url, mon) {
            try {
                if (!$u.isString(mon) || !$u.isDefined(mon)) {
                    throw "URL supplied is 'undefined' or 'null'!";
                }

                if (!$u.isString(mon) || !$u.isDefined(mon)) {
                    throw "Monster supplied is 'undefined' or 'null'!";
                }

                var id = url.regex(/user=(\d+)/),
                    page = url.regex(new RegExp("^(\\S+).php")),
                    index = (id + ' ' + mon + ' ' + page).toLowerCase().MD5(),
                    mine = caap.stats.FBID === id ? true : false;

                if (id === 0 || !$u.hasContent(id) || !$u.isNumber(id)) {
                    con.warn("feed.setItem id", id);
                    throw "ID is not valid!";
                }

                if (!$u.hasContent(page) || !$u.isString(page)) {
                    con.warn("feed.setItem page", page);
                    throw "Page is not valid!";
                }

                con.log(4, "page", page);
                if (!$u.hasContent(monster.records[index])) {
                    monster.records[index] = {
                        'md5': index,
                        'id': id,
                        'page': page,
                        'url': url,
                        'monster': mon,
                        'type': '',
                        'time': [0, 0, 0],
                        'life': 0,
                        't2k': 0,
                        'seen': Date.now(),
                        'review': 0,
                        'checked': false,
                        'hide': mine,
                        'joinable': {}
                    };

                    feed.save();
                    state.setItem("feedScanDone", false);
                }

                return monster.records[index];
            } catch (err) {
                con.error("ERROR in feed.setItem: " + err.stack);
                return undefined;
            }
        },

        getItem: function(index) {
            try {
                if (!config.getItem('enableMonsterFinder', false) || !$u.hasContent(monster.records)) {
                    return null;
                }

                if (!$u.isString(index) || index === '') {
                    throw "Index supplied is 'undefined' or 'null'!";
                }

                var record = monster.records[index];
                if (!$u.isDefined(record)) {
                    con.warn("feed.getItem returned 'undefined' or 'null' for", index);
                    record = null;
                }

                return record;
            } catch (err) {
                con.error("ERROR in feed.getItem: " + err.stack);
                return undefined;
            }
        },

        deleteItem: function(index) {
            try {
                if (!$u.isString(index) || index === '') {
                    throw "Index supplied is 'undefined' or 'null'!";
                }

                if (!$u.isDefined(monster.records[index])) {
                    con.warn("feed.deleteItem - Invalid or non-existant index:", index);
                } else {
                    delete monster.records[index];
                    feed.save();
                }

                return true;
            } catch (err) {
                con.error("ERROR in feed.deleteItem: " + err.stack);
                return false;
            }
        },
*/
		/*
        checked: function(currentMonster) {
            try {
                if (currentMonster.md5 === '') {
                    con.log(2, "feed.checked no md5 supplied");
                    if ($u.hasContent(feed.scanRecord)) {
                        if ($u.hasContent(feed.scanRecord.id) && $u.hasContent(feed.scanRecord.monster && $u.hasContent(feed.scanRecord.page))) {
                            currentMonster.md5 = feed.scanRecord.md5;
                            currentMonster.userId = feed.scanRecord.id;
                            currentMonster.page = feed.scanRecord.page;
                            currentMonster.monster = feed.scanRecord.monster;
                            currentMonster.type = feed.scanRecord.type;
                            currentMonster.feedLink = feed.scanRecord.url;
                            currentMonster.hide = true;
                            currentMonster.save = false;
                            currentMonster.joinable = {};
                            currentMonster.time = feed.scanRecord.time;
                            currentMonster.life = feed.scanRecord.life;
                            currentMonster.t2k = feed.scanRecord.t2k;
                            currentMonster.review = feed.scanRecord.review > 0 ? feed.scanRecord.review : Date.now();
                            con.log(2, "feed.checked monster set from scanRecord", currentMonster);
                        } else if ($u.hasContent(feed.scanRecord.md5)) {
                            currentMonster = monster.getItem(feed.scanRecord.md5);
                            con.log(2, "feed.checked monster set from monster record", currentMonster);
                        } else {
                            con.log(2, "feed.checked scanRecord doesn't have info required", feed.scanRecord);
                        }

                        feed.scanRecord = {};
                    } else {
                        con.log(2, "feed.checked scanRecord empty");
                    }
                }

                if (!$u.hasContent(currentMonster) || !$j.isPlainObject(currentMonster)) {
                    throw "Not passed a record";
                }

                if (!$u.isString(currentMonster.md5) || !$u.hasContent(currentMonster.md5)) {
                    con.warn("md5", currentMonster);
                    throw "Invalid identifying md5!";
                }

                var id = $u.setContent(currentMonster.userId, currentMonster.feedLink.regex(/user=(\d+)/)),
                    page = $u.setContent(currentMonster.page, currentMonster.feedLink.regex(new RegExp("^(\\S+).php"))),
                    mon = currentMonster.monster,
                    md5 = (id + ' ' + mon + ' ' + page).toLowerCase().MD5();

                if (currentMonster.md5 !== md5) {
                    con.warn("md5 mismatch!", md5, currentMonster);
                    if (config.getItem("DebugLevel", 1) > 1) {
                        $j().alert("md5 mismatch!<br />" + md5 + '<br />' + currentMonster.md5);
                    }

                    throw "md5 mismatch!";
                }

                if (!$u.hasContent(monster.records[currentMonster.md5])) {
                    con.log(3, "feed link", currentMonster.feedLink);
                    monster.records[currentMonster.md5] = {};
                    monster.records[currentMonster.md5].md5 = currentMonster.md5;
                    monster.records[currentMonster.md5].id = id;
                    monster.records[currentMonster.md5].url = currentMonster.feedLink;
                    monster.records[currentMonster.md5].page = page;
                    monster.records[currentMonster.md5].monster = currentMonster.monster;
                    monster.records[currentMonster.md5].type = currentMonster.type;
                    monster.records[currentMonster.md5].seen = Date.now();
                    monster.records[currentMonster.md5].checked = false;
                    con.log(2, "Added monster details to feed", monster.records[currentMonster.md5]);
                } else {
                    monster.records[currentMonster.md5].checked = true;
                }

                monster.records[currentMonster.md5].hide = currentMonster.hide;
                monster.records[currentMonster.md5].joinable = currentMonster.joinable;
                monster.records[currentMonster.md5].time = currentMonster.time;
                monster.records[currentMonster.md5].life = currentMonster.life;
                monster.records[currentMonster.md5].t2k = currentMonster.t2k;
                monster.records[currentMonster.md5].review = currentMonster.review;
                con.log(3, "feed.checked", monster.records[currentMonster.md5], currentMonster);
                feed.save();
                return monster.records[currentMonster.md5];
            } catch (err) {
                con.error("ERROR in feed.checked: " + err.stack);
                return undefined;
            }
        },
*/
        items: function(type, slice) {
            try {
                slice = $u.setContent(slice, $j("#app_body"));
                var ft = config.getItem("festivalTower", false);

                $j("#" + (type === 'feed' ? "army_feed_body a[href*='twt2']" : "cta_log a[href*='twt2']:even"), slice).each(function() {
                    var post = $j(this),
                        link = post.attr("href").replace(new RegExp(".*(castle_age|castle_ws)\\/"), '').replace(/&action=doObjective/, '').replace(/&lka=\d+/, ''),
                        mon = (type === 'feed' ? $j("div[style*='bold']", post) : post).text().trim().innerTrim()
                            .replace(new RegExp("((.+ \\S+ to help \\S* (the |in an Epic Battle against the )*)|.+ has challenged )"), '').replace(/( raid)* on Castle Age!| in an epic battle!| to a team battle!|!/, '')
                            .replace(new RegExp("^(The )(Amethyst|Emerald|Ancient|Sapphire|Frost|Gold|Colossus)( Sea| Red| Dragon| of Terra)"), '$2$3')
                            .replace(/Horde/, "Battle Of The Dark Legion").toLowerCase().ucWords(),

                        img = $u.setContent(type === 'feed' ? $j("img[src*='graphics']", post).attr("src") : $j("img[src*='graphics']", post.parents().eq(3)).attr("src"), '').basename(),
                        fix = false;

                    con.log(3, "Item", {
                        'mon': mon,
                        'link': link,
                        'img': img
                    });
                    if (!$u.hasContent(link)) {
                        con.log(2, "No item link, skipping", {
                            'mon': mon,
                            'link': link,
                            'img': img
                        });
                        return true;
                    }

                    if (!ft && link.hasIndexOf("festival")) {
                        return true;
                    }

                    if (link.hasIndexOf('guild_battle_monster')) {
                        con.log(2, "Guild Monster, skipping", {
                            'mon': mon,
                            'link': link,
                            'img': img
                        });

                        return true;
                    }

                    if (!$u.hasContent(mon)) {
                        con.log(2, "No item monster text, skipping", {
                            'mon': mon,
                            'link': link,
                            'img': img
                        });
                        if (config.getItem("DebugLevel", 1) > 1) {
                            $j().alert("No item monster text, skipping<br />" + mon + '<br />' + link + '<br />' + img);
                        }

                        return true;
                    }

                    if (!$u.hasContent(img)) {
                        con.log(2, "No item image, skipping", {
                            'mon': mon,
                            'link': link,
                            'img': img
                        });
                        return true;
                    }

                    if (!mname) {
                        $j().alert("Missing mname image<br />" + mname + "<br />" + mon + "<br />" + link + "<br />" + img);
                    }

                    if (mon.hasIndexOf("Bahamut") && !mon.hasIndexOf("Alpha") && (img.hasIndexOf("volcanic5") || link.hasIndexOf("twt2=alpha"))) {
                        mon = "Alpha " + mon;
                        fix = true;
                    }

                    if (mon.hasIndexOf("War Of The Red Plains")) {
                        if (img.hasIndexOf("valhalla")) {
                            mon = "Valhalla, The Air Elemental";
                            fix = true;
                        } else if (img.hasIndexOf("gehenna")) {
                            mon = "Gehenna, The Fire Elemental";
                            fix = true;
                        } else if (img.hasIndexOf("alpha_mephistopheles")) {
                            mon = "Alpha Mephistopheles";
                            fix = true;
                        } else if (img.hasIndexOf("aurelius")) {
                            mon = "Aurelius, Lion's Rebellion";
                            fix = true;
                        } else if (img.hasIndexOf("corv")) {
                            mon = "Corvintheus";
                            fix = true;
                        }
                    }

                    if (fix) {
                        con.log(2, "Fixed CA listing issue", mon);
                    }

                    if (mname !== mon) {
                        $j().alert("mname/mon mismatch<br />" + mname + "<br />" + mon + "<br />" + link + "<br />" + img);
                    }

                    feed.setItem(link, mon);
                    return true;
                });

                if (type === "feed") {
                    schedule.setItem("feedMonsterFinder", config.getItem('CheckFeedMonsterFinderMins', 15) * 60, 300);
                } else if (type === "guild") {
                    schedule.setItem("guildMonsterFinder", config.getItem('CheckGuildMonsterFinderMins', 60) * 60, 300);
                }

                return true;
            } catch (err) {
                con.error("ERROR in feed.items: " + err.stack);
                return false;
            }
        },

        publicItems: function(slice) {
            try {
                slice = $u.setContent(slice, $j("#app_body"));
                $j("div[style*='pubmonster_middlef.gif']", slice).each(function() {
                    var post = $j(this),
                        userId = 0,
                        mpool = '',
                        link = '',
                        mon = '',
                        img = '';

                    if (!$u.hasContent(post)) {
                        con.log(2, "No pubmonster_middlef content");
                        return true;
                    }

                    userId = $u.setContent($j("input[name='casuser']", post).val(), "0").parseInt();
                    if (!$u.hasContent(userId) || userId === 0) {
                        con.log(2, "No userId found");
                        return true;
                    }

                    img = $j("img", post).eq(0).attr("src").basename();
                    if (!$u.hasContent(img)) {
                        con.log(2, "No item image, skipping", {
                            'mon': mon,
                            'link': link,
                            'img': img
                        });
                        return true;
                    }

                    mon = monster.getListName(img);
                    if (!$u.hasContent(mon)) {
                        con.log(2, "No item monster text, skipping", {
                            'mon': mon,
                            'link': link,
                            'img': img
                        });
                        if (config.getItem("DebugLevel", 1) > 1) {
                            $j().alert("No item monster text, skipping<br />" + mon + '<br />' + link + '<br />' + img);
                        }

                        return true;
                    }

                    mpool = $j("input[name='mpool']", post).val();
                    if (!$u.hasContent(mpool)) {
                        con.log(2, "No mpool, skipping", {
                            'mon': mon,
                            'link': link,
                            'img': img
                        });
                        return true;
                    }

                    link = "battle_monster.php?casuser=" + userId + "&mpool=" + mpool;
                    con.log(3, "Item", {
                        'mon': mon,
                        'link': link,
                        'img': img
                    });
                    if (!$u.hasContent(link)) {
                        con.log(2, "No item link, skipping", {
                            'mon': mon,
                            'link': link,
                            'img': img
                        });
                        return true;
                    }

                    feed.setItem(link, mon);
                    return true;
                });

                return true;
            } catch (err) {
                con.error("ERROR in feed.publicItems: " + err.stack);
                return false;
            }
        },

        ajaxFeedWait: false,

        ajaxFeed: function() {
            function onError(XMLHttpRequest, textStatus, errorThrown) {
                con.error("feed.ajaxFeed", [XMLHttpRequest, textStatus, errorThrown]);
                feed.ajaxFeedWait = false;
            }

            function onSuccess(data) {
                feed.items("feed", data);
                feed.ajaxFeedWait = false;
            }

            try {
                if (feed.ajaxFeedWait) {
                    schedule.setItem("feedMonsterFinder", 300, 300);
                    return true;
                }

                if (false && config.getItem("useAjaxMonsterFinder", true)) {  // Disabling until I can figure out AJAX load
                    feed.ajaxFeedWait = true;
                    caap.ajax("army_news_feed.php", null, onError, onSuccess);
                } else {
                    feed.ajaxFeedWait = false;
                    caap.clickAjaxLinkSend("army_news_feed.php");
                }

                var minutes = config.getItem('CheckFeedMonsterFinderMins', 15);
                minutes = minutes >= 15 ? minutes : 15;
                schedule.setItem("feedMonsterFinder", minutes * 60, 300);
                return true;
            } catch (err) {
                con.error("ERROR in feed.ajaxFeed: " + err.stack);
                return false;
            }
        },

        ajaxGuildWait: false,

        ajaxGuild: function() {
            function onError(XMLHttpRequest, textStatus, errorThrown) {
                con.error("feed.ajaxGuild", [XMLHttpRequest, textStatus, errorThrown]);
                feed.ajaxGuildWait = false;
            }

            function onSuccess(data) {
                feed.items("guild", data);
                feed.ajaxGuildWait = false;
            }

            try {
                if (feed.ajaxGuildWait) {
                    schedule.setItem("guildMonsterFinder", 300, 300);
                    return true;
                }

                if (false && onfig.getItem("useAjaxMonsterFinder", true)) { // Disabling until I can figure out AJAX load
                    feed.ajaxGuildWait = true;
                    caap.ajax("guild.php", null, onError, onSuccess);
                } else {
                    feed.ajaxGuildWait = true;
                    caap.clickAjaxLinkSend("guild.php");
                }

                var minutes = config.getItem('CheckGuildMonsterFinderMins', 60);
                minutes = minutes >= 15 ? minutes : 15;
                schedule.setItem("guildMonsterFinder", minutes * 60, 300);
                return true;
            } catch (err) {
                con.error("ERROR in feed.ajaxGuild: " + err.stack);
                return false;
            }
        },

        ajaxPublicWait: false,

        ajaxPublic: function(tier) {
            function onError(XMLHttpRequest, textStatus, errorThrown) {
                con.error("feed.ajaxPublic", [XMLHttpRequest, textStatus, errorThrown]);
                feed.ajaxPublicWait = false;
            }

            function onSuccess(data) {
                //feed.publicItems(data);
				caap.checkResults_monsterList(data);
                feed.ajaxPublicWait = false;
            }

            try {
                if (feed.ajaxPublicWait) {
                    schedule.setItem("publicMonsterFinder" + tier, 300, 300);
                    return true;
                }

                var url = 'public_monster_list.php?monster_tier=' + (tier + 1),
                    minutes = config.getItem('CheckPublicMonsterFinderMins' + tier, 15);

                if (false && config.getItem("useAjaxMonsterFinder", true)) { // Disabling until I can figure out AJAX load
                    feed.ajaxPublicWait = true;
                    caap.ajax(url, null, onError, onSuccess);
                } else {
                    feed.ajaxPublicWait = false;
                    caap.clickAjaxLinkSend(url);
                }

                minutes = minutes >= 1 ? minutes : 1;
                schedule.setItem("publicMonsterFinder" + tier, minutes * 60, 300);
                return true;
            } catch (err) {
                con.error("ERROR in feed.ajaxPublic: " + err.stack);
                return false;
            }
        },

        ajaxScanWait: false,

        ajaxScan: function(record) {
            function onError(XMLHttpRequest, textStatus, errorThrown) {
                con.error("feed.ajaxScan", [XMLHttpRequest, textStatus, errorThrown]);
                feed.ajaxScanWait = false;
            }

            function onSuccess(data) {
                caap.checkResults_viewFight(true, data);
                feed.ajaxScanWait = false;
            }

            try {
                if (feed.ajaxScanWait) {
                    return true;
                }

                feed.ajaxScanWait = true;

                caap.ajax(record.url, null, onError, onSuccess);
                return true;
            } catch (err) {
                con.error("ERROR in feed.ajaxScan: " + err.stack);
                return false;
            }
        },

        scanRecord: {},
/*
        setScanRecord: function(md5) {
            try {
                if (!$u.isString(md5) || !$u.hasContent(md5)) {
                    con.warn("md5", md5);
                    throw "Invalid identifying md5!";
                }

                feed.scanRecord = feed.getItem(md5);
                if (!$u.hasContent(feed.scanRecord)) {
                    feed.scanRecord = {};
                    feed.scanRecord.md5 = md5;
                }

                return true;
            } catch (err) {
                con.error("ERROR in feed.setScanRecord: " + err.stack);
                return false;
            }
        },

        isScan: false,
*/		
		addConditions: function(monsterName) {
			try {
				var monsterConditions = '',
					filterList = config.getList('feedFilter', 'all');
					
                for (var i = 0; i < filterList.length; i += 1) {
                    if (!filterList[i].trim()) {
                        return false;
                    }
					filterList[i] = filterList[i].toLowerCase();
					if (filterList[i] == 'all') {
						return '';
					}
					if (monsterName.toLowerCase().hasIndexOf(filterList[i].match(new RegExp("^[^:]+")).toString().trim())) {
						monsterConditions = filterList[i].replace(new RegExp("^[^:]+"), '').toString().trim();
						return monsterConditions.length ? ':' +  monsterConditions + ':' : '';
					}
				}
				return false;
            } catch (err) {
                con.error("ERROR in feed.addConditions: " + err, monsterName);
                return false;
            }
		},
		
        scan: function() {
            try {
                var done = true,
                    hours = config.getItem("feedMonsterReviewHrs", 6),
					cM = {},
					tR = false,
					result = false,
                    seconds = 0;

                hours = hours >= 1 ? hours : 1;
                seconds = hours * 3600;
                for (var i = 0; i < monster.records.length; i += 1) {
					cM = monster.records[i];
					//con.log(2, 'SCAN1', cM, cM.hide, cM.status, schedule.since(cM.review, seconds));
                    if (!cM.hide && cM.status == 'Join' && schedule.since(cM.review, seconds)) {
						con.log(1, 'Scanning ' + (i + 1) + '/' + monster.records.length + ' ' + cM.name, cM.link, cM);
						feed.scanRecord = cM;
						if (false && config.getItem("useAjaxMonsterFinder", true)) { // Disabling until I can figure out AJAX load
							feed.ajaxScan(cM);
						} else {
							feed.isScan = true;
							caap.navigate2('ajax:' + cM.link);
						}
						monster.lastClick = cM.md5;
						return true;
                    }
					//con.log(2, 'SCAN2', cM.name, !tR , cM.conditions, cM.conditions.match(':join') , monster.worldMonsterCount < 30 , caap.stats.stamina.num > monster.parseCondition('stam', cM.conditions));
					if (!tR && cM.status == 'Join' && cM.conditions.match(':join') && monster.worldMonsterCount < 30 && caap.stats.stamina.num > monster.parseCondition('stam', cM.conditions)) {
						tR = cM;
					}
                }
				feed.isScan = false;
				feed.scanRecord = {};
                if (tR) {
					result = caap.navigate2('@MonsterGeneral,ajax:' + tR.link + (!tR.charClass 
						?  ',clickimg:button_nm_p_power_attack.gif'
						: (' ,clickimg:battle_enter_battle.gif,expansion_monster_class_choose,clickjq:#choose_class_screen '
						+ ($u.hasContent($j('#choose_class_screen .banner_warlock input[src*="nm_class_select.gif"]')) ? '.banner_warlock' : '.banner_cleric')
						+ ' input[src*="nm_class_select.gif"]')));
					if (result === 'fail') {
						return caap.navigate2('player_monster_list');
					} else if (result === 'done') {
						monster.lastClick = tR.md5;
					}
					return result;
                }
				return false;

            } catch (err) {
                con.error("ERROR in feed.scan: " + err.stack);
                return false;
            }
        },

        dashboard: function() {
            try {
				monster.dashboardCommon('Feed');
            } catch (err) {
                con.error("ERROR in feed.dashboard: " + err.stack);
                return false;
            }
        },

        menu: function() {
            try {
                var htmlCode = '',
					filterInstructions = "List of filters to decide what monsters to look for. ";

                htmlCode += caap.startToggle('Monster Finder', 'MONSTER FINDER');
                htmlCode += caap.makeCheckTR("Enable Monster Finder", 'enableMonsterFinder', false, "Find joinable monsters.");
                htmlCode += caap.startCheckHide('enableMonsterFinder');
  /*              htmlCode += caap.makeCheckTR('Do In Background', 'useAjaxMonsterFinder', true, "Check Monsters using AJAX rather than page navigation.");
                htmlCode += caap.makeCheckTR("Enable Live Feed", 'feedMonsterFinder', false, "Find monsters in the Live Feed.");
                htmlCode += caap.startCheckHide('feedMonsterFinder');
                htmlCode += caap.makeNumberFormTR("Check every X mins", 'CheckFeedMonsterFinderMins', "Check the Live Feed every X minutes. Minimum 15.", 15, '', '', true);
                htmlCode += caap.endCheckHide('feedMonsterFinder');
                htmlCode += caap.makeCheckTR("Enable Guild Feed", 'guildMonsterFinder', false, "Find monsters in the Guild Feed.");
                htmlCode += caap.startCheckHide('guildMonsterFinder');
                htmlCode += caap.makeNumberFormTR("Check every X mins", 'CheckGuildMonsterFinderMins', "Check the Guild Feed every X minutes. Minimum 15.", 60, '', '', true);
                htmlCode += caap.endCheckHide('guildMonsterFinder');
 */             htmlCode += caap.makeCheckTR("Enable Tier 1", 'publicMonsterFinder1', false, "Find monsters in the Public Tier 1 Feed.");
                htmlCode += caap.startCheckHide('publicMonsterFinder1');
                htmlCode += caap.makeNumberFormTR("Check every X mins", 'CheckPublicMonsterFinderMins1', "Check the Public Tier 1 Feed every X minutes. Minimum 15.", 60, '', '', true);
                htmlCode += caap.endCheckHide('publicMonsterFinder1');

                htmlCode += caap.makeCheckTR("Enable Tier 2", 'publicMonsterFinder2', false, "Find monsters in the Public Tier 2 Feed.");
                htmlCode += caap.startCheckHide('publicMonsterFinder2');
                htmlCode += caap.makeNumberFormTR("Check every X mins", 'CheckPublicMonsterFinderMins2', "Check the Public Tier 2 Feed every X minutes. Minimum 15.", 60, '', '', true);
                htmlCode += caap.endCheckHide('publicMonsterFinder2');

                htmlCode += caap.makeCheckTR("Enable Tier 3", 'publicMonsterFinder3', false, "Find monsters in the Public Tier 3 Feed.");
                htmlCode += caap.startCheckHide('publicMonsterFinder3');
                htmlCode += caap.makeNumberFormTR("Check every X mins", 'CheckPublicMonsterFinderMins3', "Check the Public Tier 3 Feed every X minutes. Minimum 15.", 60, '', '', true);
                htmlCode += caap.endCheckHide('publicMonsterFinder3');
                htmlCode += caap.makeCheckTR("Status Scan", 'feedScan', false, "Scan the feed monsters to check their status.");
                htmlCode += caap.startCheckHide('feedScan');
                htmlCode += caap.makeNumberFormTR("Scan every X hours", 'feedMonsterReviewHrs', "Scan the feed monsters every X hours to check their status. Minimum 1.", 6, '', '', true);
                htmlCode += caap.endCheckHide('feedScan');
                /*
                if (false) {
                    htmlCode += caap.makeDropDownTR("Join", 'JoinMonster1', [''].concat(feed.monsterList), '', '', '', false, false, 80);
                    htmlCode += caap.makeDropDownTR("Join", 'JoinMonster2', [''].concat(feed.monsterList), '', '', '', false, false, 80);
                    htmlCode += caap.makeDropDownTR("Join", 'JoinMonster3', [''].concat(feed.monsterList), '', '', '', false, false, 80);
                    htmlCode += caap.makeDropDownTR("Join", 'JoinMonster4', [''].concat(feed.monsterList), '', '', '', false, false, 80);
                }
                */
				htmlCode += caap.makeTD("Filter monsters according to <a href='http://caaplayer.freeforums.org/attack-monsters-in-this-order-clarified-t408.html' target='_blank' style='color: blue'>(INFO)</a>");
				htmlCode += caap.makeTextBox('feedFilter', filterInstructions, 'all');

                htmlCode += caap.endCheckHide('enableMonsterFinder');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                con.error("ERROR in feed.menu: " + err.stack);
                return '';
            }
        },

        updateDropDowns: function() {
            try {
                caap.changeDropDownList('JoinMonster1', [''].concat(feed.monsterList), config.getItem('JoinMonster1', ''));
                caap.changeDropDownList('JoinMonster2', [''].concat(feed.monsterList), config.getItem('JoinMonster2', ''));
                caap.changeDropDownList('JoinMonster3', [''].concat(feed.monsterList), config.getItem('JoinMonster3', ''));
                caap.changeDropDownList('JoinMonster4', [''].concat(feed.monsterList), config.getItem('JoinMonster4', ''));
                return true;
            } catch (err) {
                con.error("ERROR in feed.updateDropDowns: " + err.stack);
                return false;
            }
        }
    };

}());
