
    ////////////////////////////////////////////////////////////////////
    //                          gifting OBJECT
    // this is the main object for dealing with gifting
    /////////////////////////////////////////////////////////////////////

    gifting = {
        cachedGiftEntry: {},

        types: ["gifts", "queue", "history"],

        load: function (type) {
            try {
                if (!$u.isString(type) || type === '' || !gifting.types.hasIndexOf(type))  {
                    $u.warn("Type passed to load: ", type);
                    throw "Invalid type value!";
                }

                gifting[type].records = gm.getItem("gifting." + type, 'default');
                if (gifting[type].records === 'default' || !$j.isArray(gifting[type].records)) {
                    gifting[type].records = gm.setItem("gifting." + type, []);
                }

                gifting[type].hbest = gifting[type].hbest === false ? JSON.hbest(gifting[type].records) : gifting[type].hbest;
                $u.log(3, "gifting." + type + " Hbest", gifting[type].hbest);
                $u.log(3, "gifting.load", type, gifting[type].records);
                state.setItem("Gift" + type.ucFirst() + "DashUpdate", true);
                return true;
            } catch (err) {
                $u.error("ERROR in gifting.load: " + err);
                return false;
            }
        },

        save: function (type) {
            try {
                if (!$u.isString(type) || type === '' || !gifting.types.hasIndexOf(type))  {
                    $u.warn("Type passed to load: ", type);
                    throw "Invalid type value!";
                }

                var compress = false;
                gm.setItem("gifting." + type, gifting[type].records, gifting[type].hbest, compress);
                $u.log(3, "gifting.save", type, gifting[type].records);
                state.setItem("Gift" + type.ucFirst() + "DashUpdate", true);
                return true;
            } catch (err) {
                $u.error("ERROR in gifting.save: " + err);
                return false;
            }
        },

        clear: function (type) {
            try {
                if (!$u.isString(type) || type === '' || !gifting.types.hasIndexOf(type))  {
                    $u.warn("Type passed to clear: ", type);
                    throw "Invalid type value!";
                }

                gifting[type].records = gm.setItem("gifting." + type, []);
                gifting.cachedGiftEntry = gm.setItem("GiftEntry", {});
                state.setItem("Gift" + type.ucFirst() + "DashUpdate", true);
                return true;
            } catch (err) {
                $u.error("ERROR in gifting.clear: " + err);
                return false;
            }
        },

        init: function () {
            try {
                var result = true;

                if (!gifting.load("gifts")) {
                    result = false;
                }

                if (!gifting.load("queue")) {
                    result = false;
                }

                if (!gifting.load("history")) {
                    result = false;
                }

                gifting.queue.fix();
                gifting.history.fix();
                return result;
            } catch (err) {
                $u.error("ERROR in gifting.init: " + err);
                return undefined;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        accept: function () {
            try {
                // Some users reported an issue with the following jQuery search using jQuery 1.4.3
                //giftDiv = $j("div[class='messages']:first img:first");
                // So I have changed the query to try and resolve the issue
                var giftDiv   = $j("div[class='messages'] a[href*='profile.php?id='] img", caap.globalContainer).eq(0),
                    tempText  = '',
                    tempNum   = 0,
                    current   = {};

                if ($u.hasContent(giftDiv)) {
                    tempNum = $u.setContent(giftDiv.attr("uid"), '0').parseInt();
                    if ($u.hasContent(tempNum) && tempNum > 0) {
                        current = new gifting.queue.record();
                        current.data['userId'] = tempNum;
                        tempText = $u.setContent(giftDiv.attr("title"), '').trim();
                        if ($u.hasContent(tempText)) {
                            current.data['name'] = tempText;
                        } else {
                            $u.warn("No name found in", giftDiv);
                            current.data['name'] = "Unknown";
                        }
                    } else {
                        $u.warn("No uid found in", giftDiv);
                    }
                } else {
                    $u.warn("No gift messages found!");
                }

                gifting.setCurrent(gm.setItem("GiftEntry", current.data));
                return !$j.isEmptyObject(gifting.getCurrent());
            } catch (err) {
                $u.error("ERROR in gifting.accept: " + err);
                return undefined;
            }
        },
        /*jslint sub: false */

        loadCurrent: function () {
            try {
                gifting.cachedGiftEntry = gm.getItem('GiftEntry', 'default');
                if (gifting.cachedGiftEntry === 'default' || !$j.isPlainObject(gifting.cachedGiftEntry)) {
                    gifting.cachedGiftEntry = gm.setItem('GiftEntry', {});
                }

                return true;
            } catch (err) {
                $u.error("ERROR in gifting.loadCurrent: " + err);
                return false;
            }
        },

        getCurrent: function () {
            try {
                return gifting.cachedGiftEntry;
            } catch (err) {
                $u.error("ERROR in gifting.getCurrent: " + err);
                return undefined;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        setCurrent: function (record) {
            try {
                if (!$u.hasContent(record) || !$j.isPlainObject(record)) {
                    throw "Not passed a record";
                }

                if ($u.isNaN(record['userId']) || record['userId'] < 1) {
                    $u.warn("userId", record, record['userId']);
                    throw "Invalid identifying userId!";
                }

                gifting.cachedGiftEntry = gm.setItem("GiftEntry", record);
                return gifting.cachedGiftEntry;
            } catch (err) {
                $u.error("ERROR in gifting.setCurrent: " + err);
                return undefined;
            }
        },
        /*jslint sub: false */

        clearCurrent: function () {
            try {
                gifting.cachedGiftEntry = gm.setItem("GiftEntry", {});
                state.setItem("GiftingRefresh", 0);
                return gifting.cachedGiftEntry;
            } catch (err) {
                $u.error("ERROR in gifting.clearCurrent: " + err);
                return undefined;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        collecting: function () {
            try {
                var giftEntry = gifting.getCurrent();
                if (!$j.isEmptyObject(giftEntry) && giftEntry['checked']) {
                    gifting.collected(true);
                }

                if ($j.isEmptyObject(giftEntry) && state.getItem('HaveGift', false)) {
                    if (caap.NavigateTo('army', 'invite_on.gif')) {
                        return true;
                    }

                    if (!gifting.accept()) {
                        state.setItem('HaveGift', false);
                        return false;
                    }

                    schedule.setItem('ClickedFacebookURL', 30);
                    caap.VisitUrl(caap.domain.protocol[caap.domain.ptype] + "apps.facebook.com/reqs.php#confirm_46755028429_0");
                    return true;
                }

                if (!$j.isEmptyObject(giftEntry) && !giftEntry['checked']) {
                    $u.log(1, "Clearing incomplete pending gift", giftEntry);
                    gifting.cachedGiftEntry = gm.setItem("GiftEntry", {});
                }

                return null;
            } catch (err) {
                $u.error("ERROR in gifting.collecting: " + err);
                return undefined;
            }
        },

        collect: function () {
            try {
                var giftEntry  = false,
                    appDiv     = $j(),
                    reload     = false,
                    rfCount    = state.getItem("GiftingRefresh", 0),
                    giftsList  = [];

                if (!window.location.href.hasIndexOf(caap.domain.url[1])) {
                    return false;
                }

                giftEntry = gifting.getCurrent();
                if ($j.isEmptyObject(giftEntry)) {
                    return false;
                }

                if (!giftEntry['checked'] || rfCount > 0) {
                    $u.log(1, 'On FB page with gift ready to go');
                    appDiv = $j("#globalContainer .mbl .uiListItem div[id*='app_46755028429_']");
                    if ($u.hasContent(appDiv)) {
                        giftsList = gifting.gifts.list();
                        appDiv.each(function (index) {
                            try {
                                var giftRequest = $j(this),
                                    giftText    = '',
                                    giftType    = '',
                                    userId      = 0,
                                    name        = '',
                                    giftDiv     = $j("span[class='fb_protected_wrapper']", giftRequest),
                                    inputDiv    = $j(".uiButtonConfirm input[name*='gift_accept.php'],input[name*='army.php']", giftRequest);

                                if ($u.hasContent(inputDiv)) {
                                    userId = $u.setContent(inputDiv.attr("name"), 'uid=0').regex(/uid=(\d+)/i);
                                    if (giftEntry['userId'] !== userId) {
                                        return true;
                                    }

                                    if ($u.hasContent(giftDiv)) {
                                        giftText = $u.setContent(giftDiv.text(), '').trim();
                                        giftType = giftText.regex(new RegExp("has sent you a (.*) in Castle Age!", "i"));
                                        name = giftText.regex(new RegExp("(.*) has sent you a .* in Castle Age!", "i"));
                                        giftEntry['name'] = $u.hasContent(giftEntry['name']) ? giftEntry['name'] : ($u.hasContent(name) ? name : 'Unknown');
                                        if (!$u.hasContent(giftType)) {
                                            $u.warn("No gift type found in ", giftText);
                                        }
                                    } else {
                                        $u.warn("No fb_protected_wrapper in giftRequest", index);
                                    }

                                    if (giftType === '' || !giftsList.hasIndexOf(giftType)) {
                                        $u.log(1, 'Unknown gift type', giftType, giftsList);
                                        giftType = 'Unknown Gift';
                                    } else {
                                        $u.log(1, 'gift type', giftType, giftsList);
                                    }

                                    giftEntry['gift'] = giftType;
                                    giftEntry['found'] = true;
                                    giftEntry['checked'] = true;
                                    gifting.setCurrent(giftEntry);
                                    schedule.setItem('ClickedFacebookURL', 35);
                                    if (!reload) {
                                        rfCount = state.setItem("GiftingRefresh", rfCount + 1);
                                    }

                                    reload = true;
                                    caap.Click(inputDiv);
                                    return false;
                                } else {
                                    if (!reload) {
                                        rfCount = state.setItem("GiftingRefresh", rfCount + 1);
                                    }

                                    reload = true;
                                    $u.warn("No input found in giftRequest", index);
                                }

                                return true;
                            } catch (e) {
                                // This can happen when FB mess up the DOM on the requests page
                                // NOT_FOUND_ERR code 8
                                $u.warn("ERROR in gifting.collect: skipping" + e);
                                return true;
                            }
                        });
                    } else {
                        if (!reload) {
                            rfCount = state.setItem("GiftingRefresh", rfCount + 1);
                        }

                        reload = true;
                        $u.warn("No gifts found for CA");
                    }

                    giftEntry['checked'] = true;
                    gifting.setCurrent(giftEntry);
                }

                if (!schedule.check('ClickedFacebookURL')) {
                    return false;
                }

                if (giftEntry['found']) {
                    $u.log(1, 'Gift click timed out');
                } else {
                    giftEntry['gift'] = 'Unknown Gift';
                    gifting.setCurrent(giftEntry);
                    $u.log(1, 'Unable to find gift', giftEntry);
                }

                if (reload && rfCount === 1) {
                    $u.reload();
                }

                state.setItem("GiftingRefresh", 0);
                caap.VisitUrl(caap.domain.protocol[caap.domain.ptype] + caap.domain.url[0] + "/gift_accept.php?act=acpt&uid=" + giftEntry['userId']);
                return true;
            } catch (err) {
                $u.error("ERROR in gifting.collect: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        collected: function (force) {
            try {
                var giftEntry   = gifting.getCurrent(),
                    collectOnly = false;

                if (!$j.isEmptyObject(giftEntry)) {
                    if (force || caap.HasImage("gift_yes.gif")) {
                        collectOnly = config.getItem("CollectOnly", false);
                        if (!collectOnly || (collectOnly && config.getItem("CollectAndQueue", false))) {
                            gifting.queue.setItem(giftEntry);
                        }

                        gifting.history.received(giftEntry);
                    }

                    gifting.clearCurrent();
                }

                schedule.setItem("NoGiftDelay", 0);
                return true;
            } catch (err) {
                $u.error("ERROR in gifting.collected: " + err);
                return false;
            }
        },

        popCheck: function (type) {
            try {
                var popDiv     = $j(),
                    tempDiv    = $j(),
                    tempText   = '',
                    tryAgain   = true;

                popDiv = $j("#pop_content");
                if ($u.hasContent(popDiv)) {
                    tempDiv = $j("input[name='sendit']", popDiv);
                    if ($u.hasContent(tempDiv)) {
                        $u.log(1, 'Sending gifts to Facebook');
                        caap.Click(tempDiv);
                        return true;
                    }

                    tempDiv = $j("input[name='skip_ci_btn']", popDiv);
                    if ($u.hasContent(tempDiv)) {
                        $u.log(1, 'Denying Email Nag For Gift Send');
                        caap.Click(tempDiv);
                        return true;
                    }

                    tempDiv = $j("input[name='ok']", popDiv);
                    if ($u.hasContent(tempDiv)) {
                        tempText = tempDiv.parent().parent().prev().text();
                        if (tempText) {
                            if (/you have run out of requests/.test(tempText)) {
                                $u.log(2, 'Out of requests: ', tempText);
                                schedule.setItem("MaxGiftsExceeded", 10800, 300);
                                tryAgain = false;
                            } else {
                                $u.warn('Popup message: ', tempText);
                            }
                        } else {
                            $u.warn('Popup message but no text found', tempDiv);
                        }

                        caap.Click(tempDiv);
                        return tryAgain;
                    }

                    tempText = popDiv.text();
                    if (tempText) {
                        if (/Loading/.test(tempText)) {
                            $u.log(2, "Popup is loading ...");
                            return true;
                        } else {
                            $u.warn('Unknown popup!', popDiv.text());
                            return false;
                        }
                    } else {
                        $u.warn('Popup message but no text found', popDiv);
                        return false;
                    }
                }

                if (gifting.waitingForDomLoad) {
                    return true;
                }

                return null;
            } catch (err) {
                $u.error("ERROR in gifting.popCheck: " + err);
                return undefined;
            }
        },

        gifts: {
            options: ['Same Gift As Received', 'Random Gift'],

            hbest: 0,

            records: [],

            /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
            /*jslint sub: true */
            record: function () {
                this.data = {
                    'name'  : '',
                    'image' : ''
                };
            },

            getItem: function (name) {
                try {
                    var it    = 0,
                        len   = 0,
                        gift  = false;

                    if (!$u.isString(name) || name === '') {
                        $u.warn("name", name);
                        throw "Invalid identifying name!";
                    }

                    for (it = 0, len = gifting.gifts.records.length; it < len; it += 1) {
                        if (gifting.gifts.records[it]['name'] === name) {
                            gift = gifting.gifts.records[it];
                            break;
                        }
                    }

                    return gift;
                } catch (err) {
                    $u.error("ERROR in gifting.gifts.getItem: " + err);
                    return undefined;
                }
            },

            getImg: function (name) {
                try {
                    var it    = 0,
                        len   = 0,
                        image = '';

                    if (!$u.isString(name) || name === '') {
                        $u.warn("name", name);
                        throw "Invalid identifying name!";
                    }


                    if (name !== 'Unknown Gift') {
                        for (it = 0, len = gifting.gifts.records.length; it < len; it += 1) {
                            if (gifting.gifts.records[it]['name'] === name) {
                                image = gifting.gifts.records[it]['image'];
                                break;
                            }
                        }

                        if (it >= len) {
                            $u.warn("Gift not in list! ", name);
                        }
                    }

                    return image;
                } catch (err) {
                    $u.error("ERROR in gifting.gifts.getImg: " + err);
                    return undefined;
                }
            },

            populate: function () {
                try {
                    var giftDiv  = $j("#" + caap.domain.id[caap.domain.which] + "giftContainer div[id*='" + caap.domain.id[caap.domain.which] + "gift']"),
                        newGift  = {},
                        tempDiv  = $j(),
                        tempText = '',
                        tempArr  = [],
                        update   = false;

                    if ($u.hasContent(giftDiv)) {
                        gifting.clear("gifts");
                        giftDiv.each(function () {
                            var theGift = $j(this);
                            newGift = new gifting.gifts.record();
                            tempDiv = theGift.children().eq(0);
                            if ($u.hasContent(tempDiv)) {
                                tempText = $u.setContent(tempDiv.text(), '').trim().replace("!", "");
                                if ($u.hasContent(tempText)) {
                                    newGift.data['name'] = tempText;
                                } else {
                                    $u.warn("Unable to get gift name! No text in ", tempDiv);
                                    return true;
                                }
                            } else {
                                $u.warn("Unable to get gift name! No child!");
                                return true;
                            }

                            tempDiv = $j("img[class*='imgButton']", theGift);
                            if ($u.hasContent(tempDiv)) {
                                tempText = $u.setContent(tempDiv.attr("src"), '').basename();
                                if (tempText) {
                                    newGift.data['image'] = tempText;
                                } else {
                                    $u.warn("Unable to get gift image! No src in ", tempDiv);
                                    return true;
                                }
                            } else {
                                $u.warn("Unable to get gift image! No img!");
                                return true;
                            }

                            if (gifting.gifts.getItem(newGift.data['name'])) {
                                newGift.data['name'] += " #2";
                                $u.log(2, "Gift exists, no auto return for ", newGift.data['name']);
                            }

                            gifting.gifts.records.push(newGift.data);
                            update = true;
                            return true;
                        });
                    }

                    if (update) {
                        tempArr = gifting.gifts.list();
                        tempText = config.getItem("GiftChoice", gifting.gifts.options[0]);
                        if (!tempArr.hasIndexOf(tempText))  {
                            $u.log(1, "Gift choice invalid, changing from/to ", tempText, gifting.gifts.options[0]);
                            tempText = config.setItem("GiftChoice", gifting.gifts.options[0]);
                        }

                        caap.ChangeDropDownList("GiftChoice", tempArr, tempText);
                        gifting.save("gifts");
                    }

                    return update;
                } catch (err) {
                    $u.error("ERROR in gifting.gifts.populate: " + err);
                    return undefined;
                }
            },

            list: function () {
                try {
                    var it       = 0,
                        len      = 0,
                        giftList = [],
                        giftOpts = gifting.gifts.options.slice();

                    for (it = 0, len = gifting.gifts.records.length; it < len; it += 1) {
                        giftList.push(gifting.gifts.records[it]['name']);
                    }

                    return $j.merge(giftOpts, giftList);
                } catch (err) {
                    $u.error("ERROR in gifting.gifts.list: " + err);
                    return undefined;
                }
            },

            random: function () {
                try {
                    return gifting.gifts.records[Math.floor(Math.random() * (gifting.gifts.records.length))]['name'];
                } catch (err) {
                    $u.error("ERROR in gifting.gifts.random: " + err);
                    return undefined;
                }
            },
            /*jslint sub: false */

            length: function () {
                try {
                    return gifting.gifts.records.length;
                } catch (err) {
                    $u.error("ERROR in gifting.gifts.length: " + err);
                    return undefined;
                }
            }
        },

        queue: {
            records: [],

            /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
            /*jslint sub: true */
            record: function () {
                this.data = {
                    'userId'  : 0,
                    'name'    : '',
                    'gift'    : '',
                    'checked' : false,
                    'found'   : false,
                    'chosen'  : false,
                    'sent'    : false,
                    'last'    : 0
                };
            },

            fix: function () {
                try {
                    var it = 0,
                        save = false;

                    for (it = gifting.queue.records.length - 1; it >= 0; it -= 1) {
                        if ($u.isNaN(gifting.queue.records[it]['userId']) || gifting.queue.records[it]['userId'] < 1 || gifting.queue.records[it]['sent'] === true) {
                            $u.warn("gifting.queue.fix - delete", gifting.queue.records[it]);
                            gifting.queue.records.splice(it, 1);
                            save = true;
                        }
                    }

                    if (save) {
                        gifting.save("queue");
                    }

                    return save;
                } catch (err) {
                    $u.error("ERROR in gifting.queue.fix: " + err);
                    return undefined;
                }
            },

            hbest: 2,

            setItem: function (record) {
                try {
                    if (!$u.hasContent(record) || !$j.isPlainObject(record)) {
                        throw "Not passed a record";
                    }

                    if ($u.isNaN(record['userId']) || record['userId'] < 1) {
                        $u.warn("userId", record['userId']);
                        throw "Invalid identifying userId!";
                    }

                    var it      = 0,
                        len     = 0,
                        found   = false,
                        updated = false;

                    if (config.getItem("UniqueGiftQueue", true)) {
                        for (it = 0, len = gifting.queue.records.length; it < len; it += 1) {
                            if (gifting.queue.records[it]['userId'] === record['userId']) {
                                if (gifting.queue.records[it]['name'] !== record['name']) {
                                    gifting.queue.records[it]['name'] = record['name'];
                                    updated = true;
                                    $u.log(2, "Updated users name", record, gifting.queue.records);
                                }

                                found = true;
                                $u.log(2, "found in queue", gifting.queue.records[it]);
                                break;
                            }
                        }
                    }

                    if (!found) {
                        gifting.queue.records.push(record);
                        updated = true;
                        $u.log(2, "Added gift to queue", record, gifting.queue.records);
                    }

                    if (updated) {
                        gifting.save("queue");
                    }

                    return true;
                } catch (err) {
                    $u.error("ERROR in gifting.queue.setItem: " + err, record);
                    return false;
                }
            },
            /*jslint sub: false */

            deleteIndex: function (index) {
                try {
                    if ($u.isNaN(index) || index < 0 || index >= gifting.queue.records.length) {
                        throw "Invalid index! (" + index + ")";
                    }

                    gifting.queue.records.splice(index, 1);
                    gifting.save("queue");
                    return true;
                } catch (err) {
                    $u.error("ERROR in gifting.queue.deleteIndex: " + err, index);
                    return false;
                }
            },

            length: function () {
                try {
                    return gifting.queue.records.length;
                } catch (err) {
                    $u.error("ERROR in gifting.queue.length: " + err);
                    return undefined;
                }
            },

            randomImg: '',

            /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
            /*jslint sub: true */
            chooseGift: function () {
                try {
                    var it             = 0,
                        it1            = 0,
                        len            = 0,
                        gift           = '',
                        choice         = '',
                        filterId       = false,
                        filterIdList   = [],
                        filterIdLen    = 0,
                        filterGift     = false,
                        filterGiftList = [],
                        filterGiftLen  = 0,
                        filterGiftCont = false;

                    filterId = config.getItem("FilterReturnId", false);
                    if (filterId) {
                        filterIdList = config.getList("FilterReturnIdList", '');
                        filterIdLen = filterIdList.length;
                    }

                    filterGift = config.getItem("FilterReturnGift", false);
                    if (filterGift) {
                        filterGiftList = config.getList("FilterReturnGiftList", '');
                        filterGiftLen = filterGiftList.length;
                    }

                    choice = config.getItem("GiftChoice", gifting.gifts.options[0]);
                    for (it = 0, len = gifting.queue.records.length; it < len; it += 1) {
                        if (!schedule.since(gifting.queue.records[it]['last'] || 0, gm.getItem("LastGiftUserDelaySecs", 3600, hiddenVar))) {
                            continue;
                        }

                        if (gifting.queue.records[it]['sent']) {
                            continue;
                        }

                        if (filterId && filterIdLen && filterIdList.hasIndexOf(gifting.queue.records[it]['userId'])) {
                            $u.log(2, "chooseGift Filter Id", gifting.queue.records[it]['userId']);
                            continue;
                        }

                        if (filterGift && filterGiftLen) {
                            filterGiftCont = false;
                            for (it1 = 0; it1 < filterGiftLen; it1 += 1) {
                                if (gifting.queue.records[it]['gift'].hasIndexOf(filterGiftList[it1])) {
                                    $u.log(2, "chooseGift Filter Gift", gifting.queue.records[it]['gift']);
                                    filterGiftCont = true;
                                    break;
                                }
                            }

                            if (filterGiftCont) {
                                continue;
                            }
                        }

                        switch (choice) {
                        case gifting.gifts.options[0]:
                            gift = gifting.queue.records[it]['gift'];
                            break;
                        case gifting.gifts.options[1]:
                            if (gifting.randomImg) {
                                gift = gifting.queue.randomImg;
                            } else {
                                gift = gifting.gifts.random();
                                gifting.queue.randomImg = gift;
                            }

                            break;
                        default:
                            gift = choice;
                        }

                        break;
                    }

                    if (!gift) {
                        schedule.setItem("NoGiftDelay", gm.getItem("NoGiftDelaySecs", 1800, hiddenVar), 300);
                    }

                    return gift;
                } catch (err) {
                    $u.error("ERROR in gifting.queue.chooseGift: " + err);
                    return undefined;
                }
            },

            chooseFriend: function (howmany) {
                try {
                    var it             = 0,
                        it1            = 0,
                        len            = 0,
                        tempGift       = '',
                        unselListDiv   = $j("div[class='unselected_list']", caap.appBodyDiv),
                        selListDiv     = $j("div[class='selected_list']", caap.appBodyDiv),
                        unselDiv       = $j(),
                        selDiv         = $j(),
                        first          = true,
                        same           = true,
                        returnOnlyOne  = false,
                        filterId       = false,
                        filterIdList   = [],
                        filterIdLen    = 0,
                        filterGift     = false,
                        filterGiftList = [],
                        filterGiftLen  = 0,
                        filterGiftCont = false,
                        giftingList    = [],
                        searchStr      = '',
                        clickedList    = [],
                        pendingList    = [],
                        chosenList     = [];

                    if ($u.isNaN(howmany) || howmany < 1) {
                        throw "Invalid howmany! (" + howmany + ")";
                    }

                    returnOnlyOne = config.getItem("ReturnOnlyOne", false);
                    filterId = config.getItem("FilterReturnId", false);
                    if (filterId) {
                        filterIdList = config.getList("FilterReturnIdList", '');
                        filterIdLen = filterIdList.length;
                    }

                    filterGift = config.getItem("FilterReturnGift", false);
                    if (filterGift) {
                        filterGiftList = config.getList("FilterReturnGiftList", '');
                        filterGiftLen = filterGiftList.length;
                    }

                    if (config.getItem("GiftChoice", gifting.gifts.options[0]) !== gifting.gifts.options[0]) {
                        same = false;
                    }

                    for (it = 0, len = gifting.queue.records.length; it < len; it += 1) {
                        gifting.queue.records[it]['chosen'] = false;

                        if (giftingList.length >= howmany) {
                            continue;
                        }

                        if (!schedule.since(gifting.queue.records[it]['last'] || 0, gm.getItem("LastGiftUserDelaySecs", 3600, hiddenVar))) {
                            continue;
                        }

                        if (gifting.queue.records[it]['sent']) {
                            continue;
                        }

                        if (filterId && filterIdLen && filterIdList.hasIndexOf(gifting.queue.records[it]['userId'])) {
                            $u.log(2, "chooseFriend Filter Id", gifting.queue.records[it]['userId']);
                            continue;
                        }

                        if (filterGift && filterGiftLen) {
                            filterGiftCont = false;
                            for (it1 = 0; it1 < filterGiftLen; it1 += 1) {
                                if (gifting.queue.records[it]['gift'].hasIndexOf(filterGiftList[it1])) {
                                    $u.log(2, "chooseFriend Filter Gift", gifting.queue.records[it]['gift']);
                                    filterGiftCont = true;
                                    break;
                                }
                            }

                            if (filterGiftCont) {
                                continue;
                            }
                        }

                        if (returnOnlyOne) {
                            if (gifting.history.checkSentOnce(gifting.queue.records[it]['userId'])) {
                                $u.log(2, "Sent Today: ", gifting.queue.records[it]['userId']);
                                gifting.queue.records[it]['last'] = new Date().getTime();
                                continue;
                            }
                        }

                        if (first) {
                            tempGift = gifting.queue.records[it]['gift'];
                            first = false;
                        }

                        if (gifting.queue.records[it]['gift'] === tempGift || !same) {
                            giftingList.push(gifting.queue.records[it]['userId']);
                        }
                    }

                    if ($u.hasContent(giftingList)) {
                        for (it = 0, len = giftingList.length; it < len; it += 1) {
                            searchStr += "input[value='" + giftingList[it] + "']";
                            if (it >= 0 && it < len - 1) {
                                searchStr += ",";
                            }
                        }

                        unselDiv = $j(searchStr, unselListDiv);
                        if ($u.hasContent(unselDiv)) {
                            unselDiv.each(function () {
                                var unsel = $j(this),
                                    id    = $u.setContent(unsel.attr("value"), '0').parseInt();

                                if (!/none/.test($u.setContent(unsel.parent().attr("style"), ''))) {
                                    caap.waitingForDomLoad = false;
                                    caap.Click(unsel);
                                    $u.log(2, "Id clicked:", id);
                                    clickedList.push(id);
                                } else {
                                    $u.log(2, "Id not found, perhaps gift pending:", id);
                                    pendingList.push(id);
                                }
                            });
                        } else {
                            $u.log(2, "Ids not found:", giftingList, searchStr);
                            $j.merge(pendingList, giftingList);
                        }

                        if ($u.hasContent(clickedList)) {
                            for (it = 0, len = clickedList.length; it < len; it += 1) {
                                searchStr += "input[value='" + clickedList[it] + "']";
                                if (it >= 0 && it < len - 1) {
                                    searchStr += ",";
                                }
                            }

                            selDiv = $j(searchStr, selListDiv);
                            if ($u.hasContent(selDiv)) {
                                selDiv.each(function () {
                                    var sel = $j(this),
                                        id  = $u.setContent(sel.attr("value"), '0').parseInt();

                                    if (!/none/.test($u.setContent(sel.parent().attr("style"), ''))) {
                                        $u.log(2, "User Chosen:", id);
                                        chosenList.push(id);
                                    } else {
                                        $u.log(2, "Selected id is none:", id);
                                        pendingList.push(id);
                                    }
                                });
                            } else {
                                $u.log(2, "Selected ids not found:", searchStr);
                                $j.merge(pendingList, clickedList);
                            }
                        }

                        $u.log(2, "chosenList/pendingList", chosenList, pendingList);
                        for (it = 0, len = gifting.queue.records.length; it < len; it += 1) {
                            if (chosenList.hasIndexOf(gifting.queue.records[it]['userId'])) {
                                $u.log(2, "Chosen", gifting.queue.records[it]['userId']);
                                gifting.queue.records[it]['chosen'] = true;
                                gifting.queue.records[it]['last'] = new Date().getTime();
                            } else if (pendingList.hasIndexOf(gifting.queue.records[it]['userId'])) {
                                $u.log(2, "Pending", gifting.queue.records[it]['userId']);
                                gifting.queue.records[it]['last'] = new Date().getTime();
                            }
                        }

                        caap.waitingForDomLoad = false;
                        gifting.save("queue");
                    }

                    return chosenList.length;
                } catch (err) {
                    $u.error("ERROR in gifting.queue.chooseFriend: " + err);
                    return undefined;
                }
            },

            sent: function () {
                try {
                    var it         = 0,
                        resultDiv  = $j(),
                        resultText = '',
                        sentok     = false;

                    if (window.location.href.hasIndexOf('act=create')) {
                        resultDiv = $j('#' + caap.domain.id[caap.domain.which] + 'results_main_wrapper');
                        if ($u.hasContent(resultDiv)) {
                            resultText = resultDiv.text();
                            if ($u.hasContent(resultText)) {
                                if (/You have sent \d+ gift/.test(resultText)) {
                                    for (it = gifting.queue.records.length - 1; it >= 0; it -= 1) {
                                        if (gifting.queue.records[it]['chosen']) {
                                            gifting.queue.records[it]['sent'] = true;
                                            gifting.history.sent(gifting.queue.records[it]);
                                            gifting.queue.records.splice(it, 1);
                                        }
                                    }

                                    $u.log(1, 'Confirmed gifts sent out.');
                                    sentok = true;
                                    gifting.save("queue");
                                } else if (/You have exceed the max gift limit for the day/.test(resultText)) {
                                    $u.log(1, 'Exceeded daily gift limit.');
                                    schedule.setItem("MaxGiftsExceeded", gm.getItem("MaxGiftsExceededDelaySecs", 10800, hiddenVar), 300);
                                } else {
                                    $u.log(2, 'Result message', resultText);
                                }
                            } else {
                                $u.log(2, 'No result message');
                            }
                        }
                    } else {
                        $u.log(2, 'Not a gift create request');
                    }

                    return sentok;
                } catch (err) {
                    $u.error("ERROR in gifting.queue.sent: " + err);
                    return undefined;
                }
            }
            /*jslint sub: false */
        },

        history: {
            records: [],

            /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
            /*jslint sub: true */
            record: function () {
                this.data = {
                    'userId'       : 0,
                    'name'         : '',
                    'sent'         : 0,
                    'lastSent'     : 0,
                    'received'     : 0,
                    'lastReceived' : 0
                };
            },

            fix: function () {
                try {
                    var it = 0,
                        save = false;

                    for (it = gifting.history.records.length - 1; it >= 0; it -= 1) {
                        if ($u.isNaN(gifting.history.records[it]['userId']) || gifting.history.records[it]['userId'] < 1) {
                            $u.warn("gifting.history.fix - delete", gifting.history.records[it]);
                            gifting.history.records.splice(it, 1);
                            save = true;
                        }
                    }

                    if (save) {
                        gifting.save("history");
                    }

                    return save;
                } catch (err) {
                    $u.error("ERROR in gifting.history.fix: " + err);
                    return undefined;
                }
            },

            hbest: 0,

            received: function (record) {
                try {
                    if (!$u.hasContent(record) || !$j.isPlainObject(record)) {
                        throw "Not passed a record";
                    }

                    if ($u.isNaN(record['userId']) || record['userId'] < 1) {
                        $u.warn("userId", record['userId']);
                        throw "Invalid identifying userId!";
                    }

                    var it        = 0,
                        len       = 0,
                        success   = false,
                        newRecord = {};

                    for (it = 0, len = gifting.history.records.length; it < len; it += 1) {
                        if (gifting.history.records[it]['userId'] === record['userId']) {
                            if (gifting.history.records[it]['name'] !== record['name']) {
                                gifting.history.records[it]['name'] = record['name'];
                            }

                            gifting.history.records[it]['received'] += 1;
                            gifting.history.records[it]['lastReceived'] = new Date().getTime();
                            success = true;
                            break;
                        }
                    }

                    if (success) {
                        $u.log(2, "Updated gifting.history record", gifting.history.records[it], gifting.history.records);
                    } else {
                        newRecord = new gifting.history.record();
                        newRecord.data['userId'] = record['userId'];
                        newRecord.data['name'] = record['name'];
                        newRecord.data['received'] = 1;
                        newRecord.data['lastReceived'] = new Date().getTime();
                        gifting.history.records.push(newRecord.data);
                        $u.log(2, "Added gifting.history record", newRecord.data, gifting.history.records);
                    }

                    gifting.save("history");
                    return true;
                } catch (err) {
                    $u.error("ERROR in gifting.history.received: " + err, record);
                    return false;
                }
            },

            sent: function (record) {
                try {
                    if (!$u.hasContent(record) || !$j.isPlainObject(record)) {
                        throw "Not passed a record";
                    }

                    if ($u.isNaN(record['userId']) || record['userId'] < 1) {
                        $u.warn("userId", record['userId']);
                        throw "Invalid identifying userId!";
                    }

                    var it        = 0,
                        len       = 0,
                        success   = false,
                        newRecord = {};

                    for (it = 0, len = gifting.history.records.length; it < len; it += 1) {
                        if (gifting.history.records[it]['userId'] === record['userId']) {
                            if (gifting.history.records[it]['name'] !== record['name']) {
                                gifting.history.records[it]['name'] = record['name'];
                            }

                            gifting.history.records[it]['sent'] += 1;
                            gifting.history.records[it]['lastSent'] = new Date().getTime();
                            success = true;
                            break;
                        }
                    }

                    if (success) {
                        $u.log(2, "Updated gifting.history record", gifting.history.records[it], gifting.history.records);
                    } else {
                        newRecord = new gifting.history.record();
                        newRecord.data['userId'] = record['userId'];
                        newRecord.data['name'] = record['name'];
                        newRecord.data['sent'] = 1;
                        newRecord.data['lastSent'] = new Date().getTime();
                        gifting.history.records.push(newRecord.data);
                        $u.log(2, "Added gifting.history record", newRecord.data, gifting.history.records);
                    }

                    gifting.save("history");
                    return true;
                } catch (err) {
                    $u.error("ERROR in gifting.history.sent: " + err, record);
                    return false;
                }
            },

            checkSentOnce: function (userId) {
                try {
                    if ($u.isNaN(userId) || userId < 1) {
                        $u.warn("userId", userId);
                        throw "Invalid identifying userId!";
                    }

                    var it       = 0,
                        len      = 0,
                        sentOnce = false;

                    for (it = 0, len = gifting.history.records.length; it < len; it += 1) {
                        if (gifting.history.records[it]['userId'] !== userId) {
                            continue;
                        }

                        sentOnce = !schedule.since(gifting.history.records[it]['lastSent'] || 0, gm.getItem("OneGiftPerPersonDelaySecs", 86400, hiddenVar));
                        break;
                    }

                    return sentOnce;
                } catch (err) {
                    $u.error("ERROR in gifting.history.checkSentOnce: " + err, userId);
                    return undefined;
                }
            },
            /*jslint sub: false */

            length: function () {
                try {
                    return gifting.history.records.length;
                } catch (err) {
                    $u.error("ERROR in gifting.history.length: " + err);
                    return undefined;
                }
            }
        }
    };

    /* This section is added to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    window['gifting'] = gifting;
    gifting['gifts'] = gifting.gifts;
    gifting['queue'] = gifting.queue;
    gifting['history'] = gifting.history;
    /*jslint sub: false */
