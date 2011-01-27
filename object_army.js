
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

        copy2sortable: function () {
            try {
                var order = new sort.order();
                $j.extend(true, order.data, state.getItem("ArmySort", order.data));
                army.recordsSortable = [];
                $j.merge(army.recordsSortable, army.records);
                army.recordsSortable.sort($u.sortBy(order.data['reverse']['a'], order.data['value']['a'], $u.sortBy(order.data['reverse']['b'], order.data['value']['b'], $u.sortBy(order.data['reverse']['c'], order.data['value']['c']))));
                return true;
            } catch (err) {
                $u.error("ERROR in army.copy2sortable: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        hbest: 3,

        load: function () {
            try {
                army.records = gm.getItem('army.records', 'default');
                if (army.records === 'default' || !$j.isArray(army.records)) {
                    army.records = gm.setItem('army.records', []);
                }

                army.copy2sortable();
                army.hbest = army.hbest === false ? JSON.hbest(army.records) : army.hbest;
                $u.log(3, "army.load Hbest", army.hbest);
                state.setItem("ArmyDashUpdate", true);
                $u.log(3, "army.load", army.records);
                return true;
            } catch (err) {
                $u.error("ERROR in army.load: " + err);
                return false;
            }
        },

        save: function () {
            try {
                var compress = true;
                gm.setItem('army.records', army.records, army.hbest, compress);
                state.setItem("ArmyDashUpdate", true);
                $u.log(3, "army.save", army.records);
                return true;
            } catch (err) {
                $u.error("ERROR in army.save: " + err);
                return false;
            }
        },

        loadTemp: function () {
            try {
                army.recordsTemp = ss.getItem('army.recordsTemp', 'default');
                if (army.recordsTemp === 'default' || !$j.isArray(army.recordsTemp)) {
                    army.recordsTemp = ss.setItem('army.recordsTemp', []);
                }

                $u.log(3, "army.loadTemp", army.recordsTemp);
                return true;
            } catch (err) {
                $u.error("ERROR in army.loadTemp: " + err);
                return false;
            }
        },

        saveTemp: function () {
            try {
                ss.setItem('army.recordsTemp', army.recordsTemp);
                $u.log(3, "army.saveTemp", army.recordsTemp);
                return true;
            } catch (err) {
                $u.error("ERROR in army.saveTemp: " + err);
                return false;
            }
        },

        deleteTemp: function () {
            try {
                ss.deleteItem('army.recordsTemp');
                ss.deleteItem('army.currentPage');
                army.recordsTemp = [];
                $u.log(3, "army.deleteTemp deleted");
                return true;
            } catch (err) {
                $u.error("ERROR in army.saveTemp: " + err);
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

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        page: function (number) {
            try {
                $u.log(1, "army.page number", number);
                $j.ajax({
                    url: caap.domain.link + "/army_member.php?page=" + number,
                    error:
                        function (XMLHttpRequest, textStatus, errorThrown) {
                            $u.error("army.page ajax", textStatus);
                            army.onError();
                        },
                    success:
                        function (data, textStatus, XMLHttpRequest) {
                            try {
                                var jData   = $j(),
                                    pages   = $j(),
                                    search  = $j(),
                                    tStr    = '',
                                    tTxt    = '',
                                    tNum    = 0,
                                    pCount  = 0,
                                    it      = 0,
                                    record  = {};

                                jData = $j(data);
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
                                    var el    = $j(this),
                                        tEl   = null,
                                        tStr1 = '';

                                    record = new army.record();
                                    tStr1 = el.attr("href");
                                    tNum = tStr1.regex(/casuser=(\d+)/);
                                    record.data['userId'] = tNum ? tNum : 0;

                                    //tEl = el.parents("tr").eq(0).get(0).getElementsByTagName("a");
                                    //$u.log(1, "class", tEl);

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
                                        $u.log(1, "army.page skipping record", record.data);
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

                                $u.log(1, "army.page ajax", pCount, army.recordsTemp);
                                army.pageDone = true;
                            } catch (err) {
                                $u.error("ERROR in army.page ajax: " + err);
                                army.onError();
                            }
                        }
                });

                return true;
            } catch (err) {
                $u.error("ERROR in AjaxGiftCheck: " + err);
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
                    //ss.setItem("army.currentPage", 1);
                    $u.log(1, "army.run", expectedPageCount);
                    if (caap.stats['army']['actual'] - 1 !== army.recordsTemp.length) {
                        $u.log(2, "Army size mismatch. Next schedule set 30 mins.", caap.stats['army']['actual'] - 1, army.recordsTemp.length);
                        schedule.setItem("army_member", 1800, 300);
                    } else {
                        army.merge();
                        schedule.setItem("army_member", 604800, 300);
                        $u.log(2, "Army merge complete. Next schedule set 1 week.", army.records);
                    }

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
                $u.error("ERROR in army.run: " + err);
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
                    $u.log(1, "Unable to find 'userId'", userId);
                    return false;
                }

                return army.records[it];
            } catch (err) {
                $u.error("ERROR in army.find: " + err);
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
                            $u.log(2, "Changed level", army.recordsTemp[it]);
                        } else {
                            if ($u.hasContent(record['change']) && record['change'] > 0) {
                                army.recordsTemp[it]['change'] = record['change'];
                                $u.log(3, "Copy change", army.recordsTemp[it]);
                            } else {
                                army.recordsTemp[it]['change'] = army.recordsTemp[it]['last'];
                                $u.log(3, "Set change", army.recordsTemp[it]);
                            }
                        }
                    }
                }

                army.records = army.recordsTemp.slice();
                army.save();
                army.copy2sortable();
                army.deleteTemp();
                return true;
            } catch (err) {
                $u.error("ERROR in army.merge: " + err);
                return false;
            }
        },

        getIdList: function () {
            try {
                var it   = 0,
                    len  = 0,
                    list = [];

                for (it = 0, len = army.records.length; it < len; it += 1) {
                    if ($u.hasContent(army.recordsTemp[it]['userId']) && army.recordsTemp[it]['userId'] > 0) {
                        list.push(army.recordsTemp[it]['userId']);
                    }
                }

                return list;
            } catch (err) {
                $u.error("ERROR in army.getIdList: " + err);
                return undefined;
            }
        }
        /*jslint sub: false */
    };
