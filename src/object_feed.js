
    ////////////////////////////////////////////////////////////////////
    //                          feed OBJECT
    // this is the main object for dealing with feed records
    /////////////////////////////////////////////////////////////////////

    feed = {
        records: {},

        recordsSortable : [],

        monsterList: [],

        loadList: function () {
            try {
                var list = monster.list();
                feed.monsterList = gm.getItem('feed.monsterList', 'default');
                if (feed.monsterList === 'default' || !$j.isArray(feed.monsterList)) {
                    feed.monsterList = gm.setItem('feed.monsterList', list);
                }

                if (feed.monsterList.length !== list.length) {
                    if (feed.monsterList.length < list.length) {
                        $u.warn("monsterList mismatch, fewer monsters than master!", feed.monsterList, list);
                        feed.monsterList = gm.setItem('feed.monsterList', list);
                    } else if (feed.monsterList.length > list.length) {
                        $u.log(2, "monsterList mismatch, more monsters than master.", feed.monsterList, list);
                    }
                }

                $u.log(3, "feed.monsterList", feed.monsterList);
                return true;
            } catch (err) {
                $u.error("ERROR in feed.loadList: " + err);
                return false;
            }
        },

        saveList: function () {
            try {
                gm.setItem('feed.monsterList', feed.monsterList);
                $u.log(3, "feed.monsterList", feed.monsterList);
                return true;
            } catch (err) {
                $u.error("ERROR in feed.saveList: " + err);
                return false;
            }
        },

        load: function () {
            try {
                feed.records = gm.getItem('feed.records', 'default');
                if (feed.records === 'default' || !$j.isPlainObject(feed.records)) {
                    feed.records = gm.setItem('feed.records', {});
                }

                feed.loadList();
                feed.deleteExpired();
                feed.copy2sortable();
                state.setItem("FeedDashUpdate", true);
                $u.log(3, "feed.load", feed.records);
                return true;
            } catch (err) {
                $u.error("ERROR in feed.load: " + err);
                return false;
            }
        },

        save: function (force) {
            try {
                gm.setItem('feed.records', feed.records);
                feed.deleteExpired();
                feed.copy2sortable();
                state.setItem("FeedDashUpdate", true);
                $u.log(3, "feed.save", feed.records);
                return true;
            } catch (err) {
                $u.error("ERROR in feed.save: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        deleteExpired: function () {
            try {
                var i       = '',
                    save    = false,
                    seconds = 0,
                    mRecord = {};

                for (i in feed.records) {
                    if (feed.records.hasOwnProperty(i)) {
                        if (!feed.records[i]['checked']) {
                            $u.log(3, "feed.deleteExpired skipping unchecked record", feed.records[i]);
                            continue;
                        }

                        seconds = (feed.records[i]['time'][0] * 3600) + (feed.records[i]['time'][1] * 60) + feed.records[i]['time'][2];
                        seconds = seconds > 0 ? seconds : 86400;
                        mRecord = monster.getItem(feed.records[i]['md5']);
                        if (schedule.since(feed.records[i]['review'], seconds) && !$u.hasContent(mRecord['monster'])) {
                            $u.log(2, "Feed Entry Expired", feed.records[i]);
                            feed.deleteItem(feed.records[i]['md5']);
                            save = true;
                        }
                    }
                }

                if (save) {
                    feed.save();
                }

                return true;
            } catch (err) {
                $u.error("ERROR in feed.deleteExpired: " + err);
                return false;
            }
        },

        copy2sortable: function () {
            try {
                var i      = '',
                    update = false;

                feed.recordsSortable = [];
                for (i in feed.records) {
                    if (feed.records.hasOwnProperty(i)) {
                        feed.recordsSortable.push(feed.records[i]);
                        if (!feed.monsterList.hasIndexOf(feed.records[i]['monster'].toLowerCase().ucWords())) {
                            $u.log(1, "New monster name found", feed.records[i]['monster']);
                            feed.monsterList.push(feed.records[i]['monster'].ucWords());
                            update = true;
                        }
                    }
                }

                $u.log(3, "feed.recordsSortable", feed.recordsSortable);
                feed.recordsSortable.sort($u.sortBy(true, 'review'));
                if (update) {
                    feed.monsterList.sort();
                    feed.saveList();
                    feed.updateDropDowns();
                }

                return true;
            } catch (err) {
                $u.error("ERROR in feed.copy2sortable: " + err);
                return false;
            }
        },

        setItem: function (url, mon) {
            try {
                if (!$u.isString(mon) || !$u.isDefined(mon)) {
                    throw "URL supplied is 'undefined' or 'null'!";
                }

                if (!$u.isString(mon) || !$u.isDefined(mon)) {
                    throw "Monster supplied is 'undefined' or 'null'!";
                }

                var id    = url.regex(/user=(\d+)/),
                    page  = url.regex(new RegExp("^(\\S+).php")),
                    index = (id + ' ' + mon + ' ' + page).toLowerCase().MD5(),
                    mine  = caap.stats['FBID'] === id ? true : false;

                if (id === 0 || !$u.hasContent(id) || !$u.isNumber(id)) {
                    $u.warn("feed.setItem id", id);
                    throw "ID is not valid!";
                }

                if (!$u.hasContent(page) || !$u.isString(page)) {
                    $u.warn("feed.setItem page", page);
                    throw "Page is not valid!";
                }

                $u.log(4, "page", page);
                if (!$u.hasContent(feed.records[index])) {
                    feed.records[index] = {
                        'md5'      : index,
                        'id'       : id,
                        'page'     : page,
                        'url'      : url,
                        'monster'  : mon,
                        'type'     : '',
                        'time'     : [0, 0, 0],
                        'life'     : 0,
                        't2k'      : 0,
                        'seen'     : new Date().getTime(),
                        'review'   : 0,
                        'checked'  : false,
                        'hide'     : mine,
                        'joinable' : {}
                    };

                    feed.save();
                    state.setItem("feedScanDone", false);
                }

                return feed.records[index];
            } catch (err) {
                $u.error("ERROR in feed.setItem: " + err);
                return undefined;
            }
        },
        /*jslint sub: false */

        getItem: function (index) {
            try {
                if (!$u.isString(index) || index === '') {
                    throw "Index supplied is 'undefined' or 'null'!";
                }

                var record = feed.records[index];
                if (!$u.isDefined(record)) {
                    $u.warn("feed.getItem returned 'undefined' or 'null' for", index);
                    record = null;
                }

                return record;
            } catch (err) {
                $u.error("ERROR in feed.getItem: " + err);
                return undefined;
            }
        },

        deleteItem: function (index) {
            try {
                if (!$u.isString(index) || index === '') {
                    throw "Index supplied is 'undefined' or 'null'!";
                }

                if (!$u.isDefined(feed.records[index])) {
                    $u.warn("feed.deleteItem - Invalid or non-existant index:", index);
                } else {
                    delete feed.records[index];
                    feed.save();
                }

                return true;
            } catch (err) {
                $u.error("ERROR in feed.deleteItem: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        checked: function (currentMonster) {
            try {
                if (currentMonster['md5'] === '') {
                    $u.log(2, "feed.checked no md5 supplied");
                    if ($u.hasContent(feed.scanRecord)) {
                        if ($u.hasContent(feed.scanRecord['id']) && $u.hasContent(feed.scanRecord['monster'] && $u.hasContent(feed.scanRecord['page']))) {
                            currentMonster['md5'] = feed.scanRecord['md5'];
                            currentMonster['userId'] = feed.scanRecord['id'];
                            currentMonster['page'] = feed.scanRecord['page'];
                            currentMonster['monster'] = feed.scanRecord['monster'];
                            currentMonster['type'] = feed.scanRecord['type'];
                            currentMonster['feedLink'] = feed.scanRecord['url'];
                            currentMonster['hide'] = true;
                            currentMonster['save'] = false;
                            currentMonster['joinable'] = {};
                            currentMonster['time'] = feed.scanRecord['time'];
                            currentMonster['life'] = feed.scanRecord['life'];
                            currentMonster['t2k'] = feed.scanRecord['t2k'];
                            currentMonster['review'] = feed.scanRecord['review'] > 0 ? feed.scanRecord['review'] : new Date().getTime();
                            $u.log(2, "feed.checked monster set from scanRecord", currentMonster);
                        } else if ($u.hasContent(feed.scanRecord['md5'])) {
                            currentMonster = monster.getItem(feed.scanRecord['md5']);
                            $u.log(2, "feed.checked monster set from monster record", currentMonster);
                        } else {
                            $u.log(2, "feed.checked scanRecord doesn't have info required", feed.scanRecord);
                        }

                        feed.scanRecord = {};
                    } else {
                        $u.log(2, "feed.checked scanRecord empty");
                    }
                }

                if (!$u.hasContent(currentMonster) || !$j.isPlainObject(currentMonster)) {
                    throw "Not passed a record";
                }

                if (!$u.isString(currentMonster['md5']) || !$u.hasContent(currentMonster['md5'])) {
                    $u.warn("md5", currentMonster);
                    throw "Invalid identifying md5!";
                }

                var id   = $u.setContent(currentMonster['userId'], currentMonster['feedLink'].regex(/user=(\d+)/)),
                    page = $u.setContent(currentMonster['page'], currentMonster['feedLink'].regex(new RegExp("^(\\S+).php"))),
                    mon  = currentMonster['monster'],
                    md5  = (id + ' ' + mon  + ' ' + page).toLowerCase().MD5();

                if (currentMonster['md5'] !== md5) {
                    $u.warn("md5 mismatch!", md5, currentMonster);
                    if (config.getItem("DebugLevel", 1) > 1) {
                        $j().alert("md5 mismatch!<br />" + md5 + '<br />' + currentMonster['md5']);
                    }

                    throw "md5 mismatch!";
                }

                if (!$u.hasContent(feed.records[currentMonster['md5']])) {
                    $u.log(3, "feed link", currentMonster['feedLink']);
                    feed.records[currentMonster['md5']] = {};
                    feed.records[currentMonster['md5']]['md5'] = currentMonster['md5'];
                    feed.records[currentMonster['md5']]['id'] = id;
                    feed.records[currentMonster['md5']]['url'] = currentMonster['feedLink'];
                    feed.records[currentMonster['md5']]['page'] = page;
                    feed.records[currentMonster['md5']]['monster'] = currentMonster['monster'];
                    feed.records[currentMonster['md5']]['type'] = currentMonster['type'];
                    feed.records[currentMonster['md5']]['seen'] = new Date().getTime();
                    feed.records[currentMonster['md5']]['checked'] = false;
                    $u.log(2, "Added monster details to feed", feed.records[currentMonster['md5']]);
                } else {
                    feed.records[currentMonster['md5']]['checked'] = true;
                }

                feed.records[currentMonster['md5']]['hide'] = currentMonster['hide'];
                feed.records[currentMonster['md5']]['joinable'] = currentMonster['joinable'];
                feed.records[currentMonster['md5']]['time'] = currentMonster['time'];
                feed.records[currentMonster['md5']]['life'] = currentMonster['life'];
                feed.records[currentMonster['md5']]['t2k'] = currentMonster['t2k'];
                feed.records[currentMonster['md5']]['review'] = currentMonster['review'];
                $u.log(3, "feed.checked", feed.records[currentMonster['md5']], currentMonster);
                feed.save();
                return feed.records[currentMonster['md5']];
            } catch (err) {
                $u.error("ERROR in feed.checked: " + err);
                return undefined;
            }
        },
        /*jslint sub: false */

        items: function (type, slice) {
            try {
                var ft = config.getItem("festivalTower", false);
                $j("#" + caap.domain.id[caap.domain.which] + (type === 'feed' ? "army_feed_body a[href*='twt2']" : "cta_log a[href*='twt2']:even"), slice).each(function () {
                    var post  = $j(this),
                        link  = post.attr("href").replace(new RegExp(".*(castle_age|castle_ws)\\/"), '').replace(/&action=doObjective/, '').replace(/&lka=\d+/, ''),
                        mon   = (type === 'feed' ? $j("div[style*='bold']", post) : post).text().trim().innerTrim().replace(new RegExp("((.+ \\S+ to help \\S* (the |in an Epic Battle against the )*)|.+ has challenged )"), '').replace(/( raid)* on Castle Age!| in an epic battle!| to a team battle!|!/, '').replace(new RegExp("^(The )(Amethyst|Emerald|Ancient|Sapphire|Frost|Gold|Colossus)( Sea| Red| Dragon| of Terra)"), '$2$3').replace(/Horde/, "Battle Of The Dark Legion").toLowerCase().ucWords(),
                        img   = $u.setContent(type === 'feed' ? $j("img[src*='graphics']", post).attr("src") : $j("img[src*='graphics']", post.parents().eq(3)).attr("src"), '').basename(),
                        mname = monster.getCtaName(img),
                        fix   = false;

                    $u.log(3, "Item", {'mon': mon, 'link': link, 'img': img});
                    if (!$u.hasContent(link)) {
                        $u.log(2, "No item link, skipping", {'mon': mon, 'link': link, 'img': img});
                        return true;
                    }

                    if (!ft && link.hasIndexOf("festival")) {
                        return true;
                    }

                    if (link.hasIndexOf('guild_battle_monster')) {
                        $u.log(2, "Guild Monster, skipping", {'mon': mon, 'link': link, 'img': img});
                        if (config.getItem("DebugLevel", 1) > 1 && !guild_monster.getCtaName(img)) {
                            $j().alert("Guild Monster missing image<br />" + mon + '<br />' + link + '<br />' + img);
                        }

                        return true;
                    }

                    if (!$u.hasContent(mon)) {
                        $u.log(2, "No item monster text, skipping", {'mon': mon, 'link': link, 'img': img});
                        if (config.getItem("DebugLevel", 1) > 1) {
                            $j().alert("No item monster text, skipping<br />" + mon + '<br />' + link + '<br />' + img);
                        }

                        return true;
                    }

                    if (!$u.hasContent(img)) {
                        $u.log(2, "No item image, skipping", {'mon': mon, 'link': link, 'img': img});
                        return true;
                    }

                    if (!mname) {
                        //alert("Missing mname image\n" + mname + "\n" + mon + "\n" + link + "\n" + img);
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
                        $u.log(2, "Fixed CA listing issue", mon);
                    }

                    if (mname !== mon) {
                        //alert("mname/mon mismatch\n" + mname + "\n" + mon + "\n" + link + "\n" + img);
                    }

                    feed.setItem(link, mon);
                    return true;
                });

                return true;
            } catch (err) {
                $u.error("ERROR in feed.items: " + err);
                return false;
            }
        },

        publicItems: function (slice) {
            try {
                $j("div[style*='pubmonster_middlef.gif']", slice).each(function () {
                    var post = $j(this),
                        userId = 0,
                        mpool = '',
                        link = '',
                        mon  = '',
                        img  = '';

                    if (!$u.hasContent(post)) {
                        $u.log(2, "No pubmonster_middlef content");
                        return true;
                    }

                    userId = $u.setContent($j("input[name='casuser']", post).val(), "0").parseInt();
                    if (!$u.hasContent(userId) || userId === 0) {
                        $u.log(2, "No userId found");
                        return true;
                    }

                    img = $j("img", post).eq(0).attr("src").basename();
                    if (!$u.hasContent(img)) {
                        $u.log(2, "No item image, skipping", {'mon': mon, 'link': link, 'img': img});
                        return true;
                    }

                    mon = monster.getListName(img);
                    if (!$u.hasContent(mon)) {
                        $u.log(2, "No item monster text, skipping", {'mon': mon, 'link': link, 'img': img});
                        if (config.getItem("DebugLevel", 1) > 1) {
                            $j().alert("No item monster text, skipping<br />" + mon + '<br />' + link + '<br />' + img);
                        }

                        return true;
                    }

                    mpool = $j("input[name='mpool']", post).val();
                    if (!$u.hasContent(mpool)) {
                        $u.log(2, "No mpool, skipping", {'mon': mon, 'link': link, 'img': img});
                        return true;
                    }

                    link = "battle_monster.php?casuser=" + userId + "&mpool=" + mpool;
                    $u.log(3, "Item", {'mon': mon, 'link': link, 'img': img});
                    if (!$u.hasContent(link)) {
                        $u.log(2, "No item link, skipping", {'mon': mon, 'link': link, 'img': img});
                        return true;
                    }

                    feed.setItem(link, mon);
                    return true;
                });

                return true;
            } catch (err) {
                $u.error("ERROR in feed.publicItems: " + err);
                return false;
            }
        },

        ajaxFeedWait: false,

        ajaxFeed: function () {
            try {
                if (feed.ajaxFeedWait) {
                    schedule.setItem("feedMonsterFinder", 300, 300);
                    return true;
                }

                feed.ajaxFeedWait = true;
                function onError(XMLHttpRequest, textStatus, errorThrown) {
                    $u.error("feed.ajaxFeed", textStatus);
                    feed.ajaxFeedWait = false;
                }

                function onSuccess(data, textStatus, XMLHttpRequest) {
                    feed.items("feed", data);
                    feed.ajaxFeedWait = false;
                }

                caap.ajax(caap.domain.link + '/army_news_feed.php', onError, onSuccess);
                var minutes = config.getItem('CheckFeedMonsterFinderMins', 15);
                minutes = minutes >= 15 ? minutes : 15;
                schedule.setItem("feedMonsterFinder", minutes * 60, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in feed.ajaxFeed: " + err);
                return false;
            }
        },

        ajaxGuildWait: false,

        ajaxGuild: function () {
            try {
                if (feed.ajaxGuildWait) {
                    schedule.setItem("guildMonsterFinder", 300, 300);
                    return true;
                }

                feed.ajaxGuildWait = true;
                function onError(XMLHttpRequest, textStatus, errorThrown) {
                    $u.error("feed.ajaxGuild", textStatus);
                    feed.ajaxGuildWait = false;
                }

                function onSuccess(data, textStatus, XMLHttpRequest) {
                    feed.items("guild", data);
                    feed.ajaxGuildWait = false;
                }

                caap.ajax(caap.domain.link + '/guild.php', onError, onSuccess);
                var minutes = config.getItem('CheckGuildMonsterFinderMins', 60);
                minutes = minutes >= 15 ? minutes : 15;
                schedule.setItem("guildMonsterFinder", minutes * 60, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in feed.ajaxGuild: " + err);
                return false;
            }
        },

        opMessage: function (event) {
            event.responseText = event.responseText.unescapeCAHTML();
            $u.log(2, "ajaxPublic opera", event);
            console.log(event.responseText);
            feed.publicItems(event.responseText);
            feed.ajaxPublicWait = false;
        },

        ajaxPublicWait: false,

        ajaxPublic: function (tier) {
            try {
                if (feed.ajaxPublicWait) {
                    schedule.setItem("publicMonsterFinder" + tier, 300, 300);
                    return true;
                }

                function onError(XMLHttpRequest, textStatus, errorThrown) {
                    $u.error("feed.ajaxPublic", textStatus);
                    feed.ajaxPublicWait = false;
                }

                function onSuccess(data, textStatus, XMLHttpRequest) {
                    feed.publicItems(data);
                    feed.ajaxPublicWait = false;
                }

                function onReturn(message) {
                    $u.log(2, "ajaxPublic onReturn", message);
                    message.responseText = message.responseText.unescapeCAHTML();
                    feed.publicItems(message.responseText);
                    feed.ajaxPublicWait = false;
                }

                feed.ajaxPublicWait = true;
                var url = 'public_monster_list.php?monster_tier=' + tier,
                    msg;

                if (caap.domain.which === 2) {
                    url = "http://apps.facebook.com/castle_age/" + url;
                    if ($u.hasContent(window.chrome)) {
                        chrome.extension.sendRequest({'action': 'getPage', 'value': url}, onReturn);
                    } else if ($u.hasContent(window.caap_comms)) {
                        window.caap_comms.sendRequest({'action': 'getPage', 'value': url}, onReturn);
                    }
                } else {
                    caap.ajax(caap.domain.link + '/' + url, onError, onSuccess);
                }

                var minutes = config.getItem('CheckPublicMonsterFinderMins' + tier, 15);
                minutes = minutes >= 15 ? minutes : 15;
                schedule.setItem("publicMonsterFinder" + tier, minutes * 60, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in feed.ajaxPublic: " + err);
                return false;
            }
        },

        ajaxScanWait: false,

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        ajaxScan: function (record) {
            try {
                if (feed.ajaxScanWait) {
                    return true;
                }

                feed.ajaxScanWait = true;
                function onError(XMLHttpRequest, textStatus, errorThrown) {
                    $u.error("feed.ajaxScan", textStatus);
                    feed.ajaxScanWait = false;
                }

                function onSuccess(data, textStatus, XMLHttpRequest) {
                    caap.checkResults_viewFight(record);
                    feed.ajaxScanWait = false;
                }

                caap.ajax(caap.domain.link + '/' + record['url'], onError, onSuccess);
                return true;
            } catch (err) {
                $u.error("ERROR in feed.ajaxScan: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        scanRecord: {},

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        setScanRecord: function (md5) {
            try {
                if (!$u.isString(md5) || !$u.hasContent(md5)) {
                    $u.warn("md5", md5);
                    throw "Invalid identifying md5!";
                }

                feed.scanRecord = feed.getItem(md5);
                if (!$u.hasContent(feed.scanRecord)) {
                    feed.scanRecord = {};
                    feed.scanRecord['md5'] = md5;
                }

                return true;
            } catch (err) {
                $u.error("ERROR in feed.setScanRecord: " + err);
                return false;
            }
        },

        scan: function () {
            try {
                var it      = 0,
                    len     = feed.recordsSortable.length,
                    done    = true,
                    hours   = config.getItem("feedMonsterReviewHrs", 6),
                    seconds = 0;

                hours = hours >= 1 ? hours : 1;
                seconds = hours * 3600;
                for (it = 0; it < len; it += 1) {
                    if (!feed.recordsSortable[it]['hide'] && $u.hasContent(feed.recordsSortable[it]['url']) && schedule.since(feed.recordsSortable[it]['review'], seconds)) {
                        done = false;
                        break;
                    }
                }

                if (!state.setItem("feedScanDone", done)) {
                    $u.log(2, "Scanning", feed.recordsSortable[it]);
                    feed.scanRecord = feed.recordsSortable[it];
                    if (config.getItem("feedCompatabilityScan", false)) {
                        caap.clickAjaxLinkSend(feed.recordsSortable[it]['url']);
                    } else {
                        feed.ajaxScan(feed.recordsSortable[it]);
                    }
                } else {
                    feed.scanRecord = {};
                }

                return true;
            } catch (err) {
                $u.error("ERROR in feed.scan: " + err);
                return false;
            }
        },

        dashboard: function () {
            try {
                if (config.getItem('DBDisplay', '') === 'Feed' && state.getItem("FeeedDashUpdate", true)) {
                    var headers = ['Monster', 'Type', 'Damage%', 'TimeLeft', 'T2K', 'Reviewed'],
                        values  = ['monster', 'page', 'life',    'time',     't2k', 'review'],
                        pp      = 0,
                        i       = 0,
                        len     = 0,
                        data    = {},
                        color   = '',
                        value   = null,
                        handler = null,
                        head    = '',
                        body    = '',
                        row     = '';

                    for (pp = 0; pp < headers.length; pp += 1) {
                        head += caap.makeTh({text: headers[pp], color: '', id: '', title: '', width: ''});
                    }

                    head = caap.makeTr(head);
                    for (i = 0, len = feed.recordsSortable.length; i < len; i += 1) {
                        row = '';
                        for (pp = 0; pp < values.length; pp += 1) {
                            if (feed.recordsSortable[i]['hide']) {
                                continue;
                            }

                            value = feed.recordsSortable[i][values[pp]];
                            switch (values[pp]) {
                            case 'monster':
                                data = {
                                    text  : '<span id="caap_feed_' + i + '" title="Clicking this link will take you to the monster" rlink="' + feed.recordsSortable[i]['url'] + '" mmd5="' + feed.recordsSortable[i]['md5'] + '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + value + '</span>',
                                    color : 'blue',
                                    id    : '',
                                    title : ''
                                };

                                row += caap.makeTd(data);
                                break;
                            case 'review':
                                row += caap.makeTd({text: $u.makeTime(value, "d M H:i"), color: feed.recordsSortable[i]['checked'] ? 'green' : color, id: '', title: ''});
                                break;
                            case 'page':
                                row += caap.makeTd({text: value.hasIndexOf('festival') ? "Festival" : "Standard", color: feed.recordsSortable[i]['checked'] ? 'green' : color, id: '', title: ''});
                                break;
                            case 'life':
                                row += caap.makeTd({text: value, color: feed.recordsSortable[i]['checked'] ? (feed.recordsSortable[i]['life'] < 10 ? 'red' :'green') : color, id: '', title: ''});
                                break;
                            case 't2k':
                                row += caap.makeTd({text: $u.minutes2hours(value), color: feed.recordsSortable[i]['checked'] ? (feed.recordsSortable[i]['t2k'] < (feed.recordsSortable[i]['time'][0] + feed.recordsSortable[i]['time'][1] / 60) ? 'purple' : 'green') : color, id: '', title: ''});
                                break;
                            case 'time':
                                row += caap.makeTd({text: value = value[0] + ":" + (value[1] < 10 ? '0' + value[1] : value[1]), color: feed.recordsSortable[i]['checked'] ? (feed.recordsSortable[i]['time'][0] < 2 ? 'red' : 'green') : color, id: '', title: ''});
                                break;
                            default:
                            }
                        }

                        body += caap.makeTr(row);
                    }

                    $j("#caap_feed", caap.caapTopObject).html(
                        $j(caap.makeTable("feed", head, body)).dataTable({
                            "bAutoWidth"    : false,
                            "bFilter"       : false,
                            "bJQueryUI"     : false,
                            "bInfo"         : false,
                            "bLengthChange" : false,
                            "bPaginate"     : false,
                            "bProcessing"   : false,
                            "bStateSave"    : true,
                            "bSortClasses"  : false,
                            "aoColumnDefs"  : [{
                                "sSortDataType" : "remaining-time",
                                "aTargets"      : [3, 4]
                            }]
                        })
                    );

                    handler = function (e) {
                        var visitMonsterLink = {
                                mmd5      : '',
                                arlink    : ''
                            },
                            i   = 0,
                            len = 0;

                        for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                            if (e.target.attributes[i].nodeName === 'rlink') {
                                visitMonsterLink.arlink = e.target.attributes[i].nodeValue;
                            } else if (e.target.attributes[i].nodeName === 'mmd5') {
                                visitMonsterLink.mmd5 = e.target.attributes[i].nodeValue;
                            }
                        }

                        feed.setScanRecord(visitMonsterLink.mmd5);
                        caap.clickAjaxLinkSend(visitMonsterLink.arlink);
                    };

                    $j("span[id*='caap_feed_']", caap.caapTopObject).unbind('click', handler).click(handler);

                    state.setItem("FeedlDashUpdate", false);
                }

                return true;
            } catch (err) {
                $u.error("ERROR in feed.dashboard: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        menu: function () {
            try {
                var htmlCode = '';

                htmlCode += caap.startToggle('Monster Finder', 'MONSTER FINDER');
                htmlCode += caap.makeCheckTR("Enable Monster Finder", 'enableMonsterFinder', false, "Find joinable monsters.");
                htmlCode += caap.startCheckHide('enableMonsterFinder');
                htmlCode += caap.makeCheckTR("Enable Live Feed", 'feedMonsterFinder', false, "Find monsters in the Live Feed.");
                htmlCode += caap.startCheckHide('feedMonsterFinder');
                htmlCode += caap.makeNumberFormTR("Check every X mins", 'CheckFeedMonsterFinderMins', "Check the Live Feed every X minutes. Minimum 15.", 15, '', '', true);
                htmlCode += caap.endCheckHide('feedMonsterFinder');
                htmlCode += caap.makeCheckTR("Enable Guild Feed", 'guildMonsterFinder', false, "Find monsters in the Guild Feed.");
                htmlCode += caap.startCheckHide('guildMonsterFinder');
                htmlCode += caap.makeNumberFormTR("Check every X mins", 'CheckGuildMonsterFinderMins', "Check the Guild Feed every X minutes. Minimum 15.", 60, '', '', true);
                htmlCode += caap.endCheckHide('guildMonsterFinder');

                if (caap.domain.which === 0 || ((window.chrome || $u.hasContent(window.caap_comms)) && caap.domain.which === 2)) {
                    htmlCode += caap.makeCheckTR("Enable Tier 1", 'publicMonsterFinder1', false, "Find monsters in the Public Tier 1 Feed.");
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
                } else {
                    config.setItem("publicMonsterFinder1", false);
                    config.setItem("publicMonsterFinder2", false);
                    config.setItem("publicMonsterFinder3", false);
                }

                htmlCode += caap.makeCheckTR("Status Scan", 'feedScan', false, "Scan the feed monsters to check their status.");
                htmlCode += caap.startCheckHide('feedScan');
                htmlCode += caap.makeNumberFormTR("Scan every X hours", 'feedMonsterReviewHrs', "Scan the feed monsters every X hours to check their status. Minimum 1.", 6, '', '', true);
                if (false) {
                    htmlCode += caap.makeCheckTR("Compatability Scan", 'feedCompatabilityScan', false, "Scan the feed monsters in the foreground to check their status", true);
                } else {
                    config.setItem("feedCompatabilityScan", false);
                }

                htmlCode += caap.endCheckHide('feedScan');
                if (false) {
                    htmlCode += caap.makeDropDownTR("Join", 'JoinMonster1', [''].concat(feed.monsterList), '', '', '', false, false, 80);
                    htmlCode += caap.makeDropDownTR("Join", 'JoinMonster2', [''].concat(feed.monsterList), '', '', '', false, false, 80);
                    htmlCode += caap.makeDropDownTR("Join", 'JoinMonster3', [''].concat(feed.monsterList), '', '', '', false, false, 80);
                    htmlCode += caap.makeDropDownTR("Join", 'JoinMonster4', [''].concat(feed.monsterList), '', '', '', false, false, 80);
                }

                htmlCode += caap.endCheckHide('enableMonsterFinder');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in feed.menu: " + err);
                return '';
            }
        },

        updateDropDowns: function () {
            try {
                caap.changeDropDownList('JoinMonster1', [''].concat(feed.monsterList), config.getItem('JoinMonster1', ''));
                caap.changeDropDownList('JoinMonster2', [''].concat(feed.monsterList), config.getItem('JoinMonster2', ''));
                caap.changeDropDownList('JoinMonster3', [''].concat(feed.monsterList), config.getItem('JoinMonster3', ''));
                caap.changeDropDownList('JoinMonster4', [''].concat(feed.monsterList), config.getItem('JoinMonster4', ''));
                return true;
            } catch (err) {
                $u.error("ERROR in feed.updateDropDowns: " + err);
                return false;
            }
        }
    };

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    window['feed'] = feed;
    caap['opMessage'] = feed.opMessage;
    /*jslint sub: false */
