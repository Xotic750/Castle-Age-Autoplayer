
////////////////////////////////////////////////////////////////////
//                          army OBJECT
// this is the main object for dealing with Army
/////////////////////////////////////////////////////////////////////

army = {
    records: [],

    recordsSortable: [],

    recordsTemp: [],

    perPage: 25,

    pageDone: true,

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    record: function () {
        this.data = {
            'user'       : '',
            'name'       : '',
            'userId'     : '',
            'lvl'        : 0,
            'last'       : 0,
            'change'     : 0,
            'color'      : 'black'
        };
    },
    /*jslint sub: true */

    copy2sortable: function () {
        try {
            var order = {
                    reverse: {
                        a: false,
                        b: false,
                        c: false
                    },
                    value: {
                        a: '',
                        b: '',
                        c: ''
                    }
                };

            $.extend(true, order, state.getItem("ArmySort", order));
            army.recordsSortable = [];
            $.merge(army.recordsSortable, army.records);
            army.recordsSortable.sort(sort.by(order.reverse.a, order.value.a, sort.by(order.reverse.b, order.value.b, sort.by(order.reverse.c, order.value.c))));
            return true;
        } catch (err) {
            utility.error("ERROR in army.copy2sortable: " + err);
            return false;
        }
    },

    hbest: 3,

    load: function () {
        try {
            army.records = gm.getItem('army.records', 'default');
            if (army.records === 'default' || !$.isArray(army.records)) {
                army.records = gm.setItem('army.records', []);
            }

            army.copy2sortable();
            //army.hbest = JSON.hbest(army.records);
            utility.log(2, "army.load Hbest", army.hbest);
            state.setItem("ArmyDashUpdate", true);
            utility.log(5, "army.load", army.records);
            return true;
        } catch (err) {
            utility.error("ERROR in army.load: " + err);
            return false;
        }
    },

    save: function () {
        try {
            var compress = true;
            gm.setItem('army.records', army.records, army.hbest, compress);
            state.setItem("ArmyDashUpdate", true);
            utility.log(5, "army.save", army.records);
            return true;
        } catch (err) {
            utility.error("ERROR in army.save: " + err);
            return false;
        }
    },

    loadTemp: function () {
        try {
            army.recordsTemp = ss.getItem('army.recordsTemp', 'default');
            if (army.recordsTemp === 'default' || !$.isArray(army.recordsTemp)) {
                army.recordsTemp = ss.setItem('army.recordsTemp', []);
            }

            utility.log(5, "army.loadTemp", army.recordsTemp);
            return true;
        } catch (err) {
            utility.error("ERROR in army.loadTemp: " + err);
            return false;
        }
    },

    saveTemp: function () {
        try {
            ss.setItem('army.recordsTemp', army.recordsTemp);
            utility.log(5, "army.saveTemp", army.recordsTemp);
            return true;
        } catch (err) {
            utility.error("ERROR in army.saveTemp: " + err);
            return false;
        }
    },

    init: function () {
        army.loadTemp();
        army.load();
    },

    onError: function () {
        var currentPage = 0;

        currentPage = ss.getItem("army.currentPage", 1);
        if (currentPage > 1) {
            ss.setItem("army.currentPage", currentPage - 1);
        }

        army.pageDone = true;
    },

    page: function (number) {
        try {
            utility.log(1, "army.page number", number);
            $.ajax({
                url: "http://apps.facebook.com/castle_age/army_member.php?page=" + number,
                error:
                    function (XMLHttpRequest, textStatus, errorThrown) {
                        utility.error("army.page ajax", textStatus);
                        army.onError();
                    },
                success:
                    function (data, textStatus, XMLHttpRequest) {
                        try {
                            var jData   = $(),
                                pages   = $(),
                                search  = $(),
                                tStr    = '',
                                pCount  = 0;

                            jData = $(data);
                            if (number === 1) {
                                pages = jData.find("a[href*='army_member.php?page=']");
                                tStr = pages.last().attr("href");
                                pCount = tStr.regex(/page=(\d+)/);
                                pCount = pCount ? pCount : 1;
                                state.setItem("ArmyPageCount", pCount);
                            } else {
                                pCount = state.getItem("ArmyPageCount", 1);
                            }

                            search = jData.find("a[href*='comments.php?casuser=']");
                            search.each(function () {
                                var record = new army.record(),
                                    el     = $(this),
                                    tStr1  = '',
                                    tNum   = 0,
                                    tTxt   = '',
                                    it     = 0;

                                tStr1 = el.attr("href");
                                tNum = tStr1.regex(/casuser=(\d+)/);
                                record.data['userId'] = tNum ? tNum : 0;
                                tStr1 = el.parents("tr").eq(0).text().trim().innerTrim();
                                tTxt = tStr1.regex('(.+) "');
                                record.data['user'] = (tTxt !== undefined && tTxt !== null) ? tTxt.toString() : '';
                                tTxt = tStr1.regex(new RegExp('"(.+)"'));
                                record.data['name'] = (tTxt !== undefined && tTxt !== null) ? tTxt.toString() : '';
                                tNum = tStr1.regex(/Level (\d+)/);
                                record.data['lvl'] = tNum ? tNum : 0;
                                record.data['last'] = new Date().getTime();
                                if (record.data['userId']) {
                                    army.recordsTemp.push(record.data);
                                } else {
                                    utility.log(1, "army.page skipping record", record.data);
                                }
                            });

                            if (number === pCount) {
                                search = jData.find("img[src*='bonus_member.jpg']");
                                if (search && search.length) {
                                    search = search.parent().parent().find("a[href*='oracle.php']");
                                    if (search && search.length) {
                                        tTxt = search.text();
                                        tTxt = tTxt ? tTxt : '';
                                        tNum = tTxt.regex(/Extra members x(\d+)/);
                                        for (it = 1; it <= tNum; it += 1) {
                                            record = new army.record();
                                            record.data['userId'] = 900000000000000 + it;
                                            record.data['name'] = "Extra member " + it;
                                            record.data['lvl'] = 0;
                                            record.data['last'] = new Date().getTime();
                                            army.recordsTemp.push(record.data);
                                        }
                                    }
                                }
                            }

                            utility.log(1, "army.page ajax", pCount, army.recordsTemp);
                            army.pageDone = true;
                        } catch (err) {
                            utility.error("ERROR in army.page ajax: " + err);
                            army.onError();
                        }
                    }
            });

            return true;
        } catch (err) {
            utility.error("ERROR in AjaxGiftCheck: " + err);
            army.onError();
            return false;
        }
    },

    run: function () {
        try {
            if (!schedule.check("army_member")) {
                return false;
            }

            var expectedPageCount = 0,
                currentPage       = 0;

            currentPage = ss.getItem("army.currentPage", 1);
            expectedPageCount = state.getItem("ArmyPageCount", 0);
            if (!expectedPageCount) {
                expectedPageCount = Math.ceil((caap.stats['army']['actual'] - 1) / army.perPage);
                expectedPageCount = expectedPageCount ? expectedPageCount : 0;
            }

            if (currentPage > expectedPageCount) {
                army.saveTemp();
                army.pageDone = false;
                army.merge();
                ss.setItem("army.currentPage", 1);
                utility.log(1, "army.run", expectedPageCount, caap.stats['army']['actual'] - 1, army.recordsTemp);
                schedule.setItem("army_member", 604800, 300);
                return false;
            } else if (currentPage === 1) {
                army.recordsTemp = [];
                army.saveTemp();
                army.pageDone = false;
                army.page(currentPage);
                ss.setItem("army.currentPage", 2);
            } else if (army.pageDone) {
                army.saveTemp();
                army.pageDone = false;
                army.page(currentPage);
                ss.setItem("army.currentPage", currentPage + 1);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in army.run: " + err);
            return false;
        }
    },

    find: function (userId) {
        try {
            var it    = 0,
                len   = 0,
                found = false;

            for (it = 0, len = army.records.length; it < len; it += 1) {
                if (army.records[it]['userId'] === userId) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                utility.log(1, "Unable to find 'userId'", userId);
                return false;
            }

            return army.records[it];
        } catch (err) {
            utility.error("ERROR in army.find: " + err);
            return false;
        }
    },

    merge: function () {
        try {
            var it     = 0,
                len    = 0,
                record = {};

            for (it = 0, len = army.recordsTemp.length; it < len; it += 1) {
                record = army.find(army.recordsTemp[it]['userId']);
                if (record) {
                    if (army.recordsTemp[it]['lvl'] > record['lvl']) {
                        army.recordsTemp[it]['change'] = army.recordsTemp[it]['last'];
                        utility.log(1, "Changed level", army.recordsTemp[it]);
                    }
                }
            }

            army.records = army.recordsTemp.slice();
            army.save();
            army.copy2sortable();
            return true;
        } catch (err) {
            utility.error("ERROR in army.merge: " + err);
            return false;
        }
    }
};
