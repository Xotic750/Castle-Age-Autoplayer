/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,gm,ss,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,sort,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          army OBJECT
// this is the main object for dealing with Army
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    army.records = [];

    army.recordsTemp = [];

    army.perPage = 25;

    army.pageDone = true;

    army.record = function () {
        return JSON.copy({
            'user': '',
            'name': '',
            'userId': '',
            'lvl': 0,
            'last': 0,
            'change': 0,
            'elite': false,
            'appUser': true
        });
    };

    army.hbest = 3;

    army.load = function () {
        try {
            army.records = gm.getItem('army.records', 'default');
            if (army.records === 'default' || !$j.isArray(army.records)) {
                army.records = gm.setItem('army.records', []);
            }

            army.hbest = army.hbest === false ? JSON.hbest(army.records) : army.hbest;
            con.log(3, "army.load Hbest", army.hbest);
            session.setItem("ArmyDashUpdate", true);
            con.log(3, "army.load", army.records);
            return true;
        } catch (err) {
            con.error("ERROR in army.load: " + err);
            return false;
        }
    };

    army.save = function (src) {
        try {
            var compress = false;

            if (caap.domain.which === 3) {
                caap.messaging.setItem('army.records', army.records);
            } else {
                gm.setItem('army.records', army.records, army.hbest, compress);
                con.log(3, "army.save", army.records);
                if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif") && src !== "caapif") {
                    con.log(2, "army.save send");
                    caap.messaging.setItem('army.records', army.records);
                }
            }

            if (caap.domain.which !== 0) {
                session.setItem("ArmyDashUpdate", true);
            }

            return true;
        } catch (err) {
            con.error("ERROR in army.save: " + err);
            return false;
        }
    };

    army.loadTemp = function () {
        try {
            army.recordsTemp = ss.getItem('army.recordsTemp', 'default', true);
            if (army.recordsTemp === 'default' || !$j.isArray(army.recordsTemp)) {
                army.recordsTemp = ss.setItem('army.recordsTemp', []);
            }

            con.log(3, "army.loadTemp", army.recordsTemp);
            return true;
        } catch (err) {
            con.error("ERROR in army.loadTemp: " + err);
            return false;
        }
    };

    army.saveTemp = function () {
        try {
            ss.setItem('army.recordsTemp', army.recordsTemp);
            con.log(3, "army.saveTemp", army.recordsTemp);
            return true;
        } catch (err) {
            con.error("ERROR in army.saveTemp: " + err);
            return false;
        }
    };

    army.deleteTemp = function () {
        try {
            ss.deleteItem('army.recordsTemp');
            ss.deleteItem('army.currentPage');
            army.recordsTemp = [];
            con.log(3, "army.deleteTemp deleted");
            return true;
        } catch (err) {
            con.error("ERROR in army.saveTemp: " + err);
            return false;
        }
    };

    army.init = function () {
        army.loadTemp();
        army.load();
    };

    army.setItem = function (record) {
        try {
            var it = 0,
                len = 0,
                found = false,
                save = true;

            for (it = 0, len = army.records.length; it < len; it += 1) {
                if (army.records[it].userId === record.userId) {
                    found = true;
                    break;
                }
            }

            if (found) {
                if (!$u.compare(army.records[it], record)) {
                    army.records[it] = record;
                    con.log(3, "Updated record");
                } else {
                    save = false;
                }
            } else {
                army.records.push(record);
                con.log(3, "Added record");
            }

            if (save) {
                army.save();
            }

            return record;
        } catch (err) {
            con.error("ERROR in army.setItem: " + err);
            return undefined;
        }
    };

    army.getItem = function (userId) {
        try {
            var it = 0,
                len = 0,
                found = false;

            for (it = 0, len = army.records.length; it < len; it += 1) {
                if (army.records[it].userId === userId) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                con.log(3, "Unable to find 'userId'", userId);
            }

            return found ? army.records[it] : {};
        } catch (err) {
            con.error("ERROR in army.getItem: " + err);
            return undefined;
        }
    };

    army.deleteItem = function (userId) {
        try {
            var it = 0,
                len = 0,
                found = false;

            for (it = 0, len = army.records.length; it < len; it += 1) {
                if (army.records[it].userId === userId) {
                    army.records[it].splice(it, 1);
                    found = true;
                    break;
                }
            }

            if (!found) {
                con.log(3, "Unable to find 'userId'", userId);
            } else {
                army.save();
            }

            return true;
        } catch (err) {
            con.error("ERROR in army.setItem: " + err);
            return false;
        }
    };

    army.page = function (slice) {
        try {
            if (!army.pageDone) {
                var newslice = $u.setContent(slice, $j('#globalContainer')),
                    pages = $j(),
                    search = $j(),
                    record = {},
                    tStr = '',
                    tNum = 0,
                    pCount = 0,
                    it = 0,
                    len = 0,
                    number = ss.getItem("army.currentPage", 1, true),
                    useAjaxArmy = config.getItem("useAjaxArmy", true);


                if (number === 1) {
                    pages = $j("a[href*='army_member.php?page=']", newslice).last();
                    tStr = $u.hasContent(pages) ? pages.attr("href") : '';
                    tNum = $u.hasContent(tStr) ? tStr.regex(/page=(\d+)/) : null;
                    pCount = $u.setContent(tNum, 1);
                    state.setItem("ArmyPageCount", pCount);
                } else {
                    pCount = state.getItem("ArmyPageCount", 1);
                }

                search = $j("a[href*='comments.php?casuser=']", newslice);
                search.each(function () {
                    var el = $j(this);

                    record = army.record();
                    record.userId = $u.setContent($u.setContent(el.attr("href"), '').regex(/casuser=(\d+)/), 0);
                    tStr = $u.setContent(el.parents("tr").eq(0).text(), '').trim().innerTrim();
                    if (!useAjaxArmy) {
                        record.user = $u.setContent(tStr.regex(new RegExp('(.*?)\\s*"')), '').toString();
                    }

                    record.name = $u.setContent(tStr.regex(new RegExp('"(.*)"')), '').toString();
                    record.lvl = $u.setContent(tStr.regex(/Level\s+(\d+)/), 0);
                    record.last = Date.now();
                    if ($u.hasContent(record.userId) && record.userId > 0) {
                        army.recordsTemp.push(record);
                    } else {
                        con.warn("army.page skipping record", record);
                    }

                    el = null;
                });

                if (number === pCount) {
                    search = $j("a[href*='oracle.php']", $j("img[src*='bonus_member.jpg']", newslice).parent().parent());
                    if ($u.hasContent(search)) {
                        len = $u.setContent($u.setContent(search.text(), '').regex(/Extra members? x(\d+)/), 0);
                        for (it = 1; it <= len; it += 1) {
                            record = army.record();
                            record.userId = -1 * it;
                            record.name = "Extra member " + it;
                            record.lvl = 0;
                            record.last = Date.now();
                            army.recordsTemp.push(record);
                        }
                    }
                }

                ss.setItem("army.currentPage", army.saveTemp() ? number + 1 : number);
                con.log(2, "army.page", number, pCount, army.recordsTemp.length);
                army.pageDone = true;

                newslice = null;
                pages = null;
                search = null;
            }

            return true;
        } catch (err) {
            con.error("ERROR in army.page: " + err);
            army.pageDone = true;
            caap.clearDomWaiting();
            return false;
        }
    };

    army.run = function () {
        function onError(XMLHttpRequest, textStatus, errorThrown) {
            con.error("army.run", [XMLHttpRequest, textStatus, errorThrown]);
        }

        function onSuccess(data) {
            army.page(data);
        }

        try {
            var expectedPageCount = 0,
                currentPage = 0,
                scanDays = $u.setContent(config.getItem("ArmyScanDays", 7), 7);

            currentPage = ss.getItem("army.currentPage", 1, true);
            expectedPageCount = state.getItem("ArmyPageCount", 0);
            if (!expectedPageCount) {
                expectedPageCount = Math.ceil((caap.stats.army.actual - 1) / army.perPage);
                expectedPageCount = expectedPageCount || 0;
            }

            if (currentPage > expectedPageCount) {
                army.pageDone = false;
                con.log(3, "army.run", expectedPageCount);
                if (caap.stats.army.actual - 1 !== army.recordsTemp.length) {
                    schedule.setItem("army_member", 1800, 300);
                    con.log(2, "Army size mismatch. Next schedule set 30 mins.", caap.stats.army.actual - 1, army.recordsTemp.length);
                } else {
                    schedule.setItem("army_member", scanDays * 86400, 300);
                    army.merge();
                    con.log(2, "Army merge complete. Next schedule set " + scanDays + " days.", army.records);
                }

                army.deleteTemp();
                return false;
            }

            if (army.pageDone) {
                army.pageDone = false;
                if (config.getItem("useAjaxArmy", true)) {
                    caap.ajax("army_member.php?page=" + currentPage, null, onError, onSuccess);
                } else {
                    caap.clickAjaxLinkSend("army_member.php?page=" + currentPage);
                }
            }

            return true;
        } catch (err) {
            con.error("ERROR in army.run: " + err);
            return false;
        }
    };

    army.merge = function () {
        try {
            var it = 0,
                len = 0,
                record = {},
                fbf = {};

            for (it = 0, len = caap.fbFriends.length; it < len; it += 1) {
                fbf[caap.fbFriends[it].uid] = caap.fbFriends[it].name;
            }

            for (it = 0, len = army.recordsTemp.length; it < len; it += 1) {
                record = army.getItem(army.recordsTemp[it].userId);
                if ($u.hasContent(record)) {
                    army.recordsTemp[it].elite = $u.setContent(record.elite, false);
                    if (army.recordsTemp[it].lvl > record.lvl) {
                        army.recordsTemp[it].change = army.recordsTemp[it].last;
                    } else if ($u.hasContent(record.change) && record.change > 0) {
                        army.recordsTemp[it].change = record.change;
                    } else {
                        army.recordsTemp[it].change = army.recordsTemp[it].last;
                    }

                    if (!$u.hasContent(army.recordsTemp[it].name) && $u.hasContent(record.name)) {
                        army.recordsTemp[it].name = record.name;
                    }

                    if ($u.hasContent(army.recordsTemp[it].name) && $u.hasContent(record.name) && army.recordsTemp[it].name !== record.name) {
                        army.recordsTemp[it].name = record.name;
                    }

                    if (!$u.hasContent(army.recordsTemp[it].user) && $u.hasContent(record.user)) {
                        army.recordsTemp[it].user = record.user;
                    }

                    if ($u.hasContent(army.recordsTemp[it].user) && $u.hasContent(record.user) && army.recordsTemp[it].user !== record.user) {
                        army.recordsTemp[it].user = record.user;
                    }

                    if (!$u.hasContent(army.recordsTemp[it].lvl) && $u.hasContent(record.lvl)) {
                        army.recordsTemp[it].lvl = record.lvl;
                    }

                    if (!$u.hasContent(army.recordsTemp[it].elite) && $u.hasContent(record.elite)) {
                        army.recordsTemp[it].elite = record.elite;
                    }
                } else {
                    army.recordsTemp[it].change = army.recordsTemp[it].last;
                }

                if ($u.hasContent(caap.fbFriends) && $u.hasContent(fbf)) {
                    if ($u.hasContent(fbf[army.recordsTemp[it].userId]) && army.recordsTemp[it].user !== fbf[army.recordsTemp[it].userId]) {
                        army.recordsTemp[it].user = fbf[army.recordsTemp[it].userId];
                    }

                    army.recordsTemp[it].appUser = $u.hasContent(fbf[army.recordsTemp[it].userId]);
                }
            }

            army.records = JSON.copy(army.recordsTemp);
            army.save();
            army.deleteTemp();
            return true;
        } catch (err) {
            con.error("ERROR in army.merge: " + err);
            return false;
        }
    };

    army.getIdList = function () {
        try {
            var it = 0,
                len = 0,
                list = [];

            for (it = 0, len = army.records.length; it < len; it += 1) {
                if ($u.hasContent(army.records[it].userId) && army.records[it].userId > 0 && army.records[it].appUser) {
                    list.push(army.records[it].userId);
                }
            }

            return list;
        } catch (err) {
            con.error("ERROR in army.getIdList: " + err);
            return undefined;
        }
    };

    army.getDiffList = function () {
        try {
            var //it = 0,
                //len = 0,
                a = [],
                f = [],
                list = [],
                crossList = function (uid) {
                    return !a.hasIndexOf(uid);
                };

            a = army.getIdList();
            f = army.getFBList();
            list = f.filter(crossList);
            con.log(3, "getDiffList", a, f, list);
            return list;
        } catch (err) {
            con.error("ERROR in army.getDiffList: " + err);
            return undefined;
        }
    };

    army.getFBList = function () {
        try {
            var it = 0,
                len = 0,
                f = [];

            if ($u.hasContent(caap.fbFriends)) {
                for (it = 0, len = caap.fbFriends.length; it < len; it += 1) {
                    f.push(caap.fbFriends[it].uid.parseInt());
                }
            }

            return f;
        } catch (err) {
            con.error("ERROR in army.getFBList: " + err);
            return undefined;
        }
    };

    army.menu = function () {
        try {
            var armyInstructions = "Enable or disable the Army functions. Required when using CA's alternative URL.",
                armyScanInstructions = "Scan the army pages every X days.",
                htmlCode = '';

            htmlCode += caap.startToggle('Army', 'ARMY OPTIONS');
            htmlCode += caap.makeCheckTR('Enable Army Functions', 'EnableArmy', false, armyInstructions);
            htmlCode += caap.startCheckHide('EnableArmy');
            htmlCode += caap.makeCheckTR('Do In Background', 'useAjaxArmy', true, "Check Army using AJAX rather than page navigation.");
            htmlCode += caap.makeNumberFormTR("Scan Every (days)", 'ArmyScanDays', armyScanInstructions, 7, '', '');
            htmlCode += caap.makeCheckTR('Change Indicators', 'ArmyIndicators', false, '');
            htmlCode += caap.startCheckHide('ArmyIndicators');
            htmlCode += caap.makeNumberFormTR("Recent", 'ArmyAgeDaysColor0', '', '#008000', '', 'color', false, false, 50);
            htmlCode += caap.makeNumberFormTR("Warn 1 (days)", 'ArmyAgeDays1', '', 7, '', '');
            htmlCode += caap.makeNumberFormTR("Warn 2", 'ArmyAgeDaysColor1', '', '#ADFF2F', '', 'color', false, false, 50);
            htmlCode += caap.makeNumberFormTR("Warn 2 (days)", 'ArmyAgeDays2', '', 14, '', '');
            htmlCode += caap.makeNumberFormTR("Warn 3", 'ArmyAgeDaysColor2', '', '#FFD700', '', 'color', false, false, 50);
            htmlCode += caap.makeNumberFormTR("Warn 3 (days)", 'ArmyAgeDays3', '', 21, '', '');
            htmlCode += caap.makeNumberFormTR("Warn 4", 'ArmyAgeDaysColor3', '', '#FF8C00', '', 'color', false, false, 50);
            htmlCode += caap.makeNumberFormTR("Warn 4 (days)", 'ArmyAgeDays4', '', 28, '', '');
            htmlCode += caap.makeNumberFormTR("Warn 4", 'ArmyAgeDaysColor4', '', '#FF0000', '', 'color', false, false, 50);
            htmlCode += caap.endCheckHide('ArmyIndicators');
            htmlCode += caap.startTR();
            htmlCode += caap.makeTD("<input type='button' id='caap_FillArmy' value='Fill Army (FB only)' style='padding: 0; font-size: 10px; height: 18px' />");
            htmlCode += caap.endTR;
            htmlCode += caap.endCheckHide('EnableArmy');
            htmlCode += caap.endToggle;
            return htmlCode;
        } catch (err) {
            con.error("ERROR in army.menu: " + err);
            return '';
        }
    };

    army.dashboard = function () {
        try {
            /*-------------------------------------------------------------------------------------\
            Next we build the HTML to be included into the 'caap_army' div. We set our
            table and then build the header row.
            \-------------------------------------------------------------------------------------*/
            if (config.getItem('DBDisplay', '') === 'Army' && session.getItem("ArmyDashUpdate", true)) {
                var headers = ['UserId', 'User', 'Name', 'Level', 'Change', 'Elite', '&nbsp;'],
                    values = ['userId', 'user', 'name', 'lvl', 'change'],
                    color = '',
                    pp = 0,
                    i = 0,
                    userIdLink = '',
                    userIdLinkInstructions = '',
                    removeLinkInstructions = '',
                    len = 0,
                    len1 = 0,
                    str = '',
                    header = {
                        text: '',
                        color: '',
                        bgcolor: '',
                        id: '',
                        title: '',
                        width: ''
                    },
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
                    row = '',
                    tempVar;

                for (pp = 0; pp < headers.length; pp += 1) {
                    header = {
                        text: headers[pp],
                        color: '',
                        bgcolor: '',
                        id: '',
                        title: '',
                        width: ''
                    };

                    switch (headers[pp]) {
                        case 'UserId':
                            header.width = '18%';
                            break;
                        case 'User':
                            header.width = '27%';
                            break;
                        case 'Name':
                            header.width = '30%';
                            break;
                        case 'Level':
                            header.width = '7%';
                            break;
                        case 'Change':
                            header.width = '10%';
                            break;
                        case 'Elite':
                            header.width = '7%';
                            break;
                        case '&nbsp;':
                            header.width = '1%';
                            break;
                        default:
                    }

                    head += caap.makeTh(header);
                }

                head = caap.makeTr(head);
                for (i = 0, len = army.records.length; i < len; i += 1) {
                    if (army.records[i].userId > 0) {
                        row = "";
                        if (schedule.since(army.records[i].change, config.getItem("ArmyAgeDays4", 28) * 86400)) {
                            color = config.getItem("ArmyAgeDaysColor4", 'red');
                        } else if (schedule.since(army.records[i].change, config.getItem("ArmyAgeDays3", 21) * 86400)) {
                            color = config.getItem("ArmyAgeDaysColor3", 'darkorange');
                        } else if (schedule.since(army.records[i].change, config.getItem("ArmyAgeDays2", 14) * 86400)) {
                            color = config.getItem("ArmyAgeDaysColor2", 'gold');
                        } else if (schedule.since(army.records[i].change, config.getItem("ArmyAgeDays1", 7) * 86400)) {
                            color = config.getItem("ArmyAgeDaysColor1", 'greenyellow');
                        } else {
                            color = config.getItem("ArmyAgeDaysColor0", 'green');
                        }

                        for (pp = 0, len1 = values.length; pp < len1; pp += 1) {
                            if (values[pp] === "change") {
                                row += caap.makeTd({
                                    text: $u.hasContent(army.records[i][values[pp]]) && ($u.isString(army.records[i][values[pp]]) || army.records[i][values[pp]] > 0) ? $u.makeTime(army.records[i][values[pp]], "d-m-Y") : '',
                                    bgcolor: color,
                                    color: $u.bestTextColor(color),
                                    id: '',
                                    title: ''
                                });
                            } else if (values[pp] === "userId") {
                                str = $u.setContent(army.records[i][values[pp]], '');
                                userIdLinkInstructions = "Clicking this link will take you to the user keep of " + str;
                                userIdLink = "keep.php?casuser=" + str;
                                data = {
                                    text: '<span id="caap_targetarmy_' + i + '" title="' + userIdLinkInstructions + '" rlink="' + userIdLink + '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + str + '</span>',
                                    color: 'blue',
                                    id: '',
                                    title: ''
                                };

                                row += caap.makeTd(data);
                            } else if (values[pp] === "user") {
                                tempVar = army.records[i].appUser ? '' : config.getItem("ArmyAgeDaysColor4", 'red');
                                userIdLinkInstructions = "Clicking this link will take you to the Facebook page of " + army.records[i][values[pp]];
                                row += caap.makeTd({
                                    text: $u.hasContent(army.records[i][values[pp]]) && ($u.isString(army.records[i][values[pp]]) || army.records[i][values[pp]] > 0) ? "<a href='http://www.facebook.com/profile.php?id=" +
                                        army.records[i].userId + "'>" + army.records[i][values[pp]] + "</a>" : '',
                                    bgcolor: tempVar,
                                    color: $u.hasContent(tempVar) ? $u.bestTextColor(tempVar) : '',
                                    id: '',
                                    title: $u.hasContent(tempVar) ? 'User has either blocked Castle Age or is no longer a friend.' : userIdLinkInstructions
                                });
                            } else {
                                row += caap.makeTd({
                                    text: $u.hasContent(army.records[i][values[pp]]) && ($u.isString(army.records[i][values[pp]]) || army.records[i][values[pp]] > 0) ? army.records[i][values[pp]] : '',
                                    color: '',
                                    id: '',
                                    title: ''
                                });
                            }
                        }

                        data = {
                            text: '<input id="caap_elitearmy_' + i + '" type="checkbox" title="Use to fill elite guard first" userid="' + army.records[i].userId +
                                '" cstate="' + (army.records[i].elite ? 'true' : 'false') + '" ' + (army.records[i].elite ? ' checked' : '') + ' />',
                            color: 'blue',
                            id: '',
                            title: ''
                        };

                        row += caap.makeTd(data);

                        tempVar = $u.setContent(army.records[i].user, '').escapeHTML();
                        removeLinkInstructions = "Clicking this link will remove " + tempVar + " from your army!";
                        data = {
                            text: '<span id="caap_removearmy_' + i + '" title="' + removeLinkInstructions + '" userid="' + army.records[i].userId + '" mname="' + tempVar +
                                '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';" class="ui-icon ui-icon-circle-close">X</span>',
                            color: 'blue',
                            id: '',
                            title: ''
                        };

                        row += caap.makeTd(data);
                        body += caap.makeTr(row);
                    }
                }

                $j("#caap_army", caap.caapTopObject).html(
                    $j(caap.makeTable("army", head, body)).dataTable({
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
                            "aTargets": [6]
                        }, {
                            "sSortDataType": "dom-checkbox",
                            "aTargets": [5]
                        }, {
                            "sSortDataType": "scan-date",
                            "aTargets": [4]
                        }]
                    })
                );

                handler = function (e) {
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
                };

                $j("span[id*='caap_targetarmy_']", caap.caapTopObject).off('click', handler).on('click', handler);
                handler = null;

                handler = function (e) {
                    var userid = 0,
                        cstate = false,
                        i = 0,
                        len = 0,
                        record = {};

                    for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                        if (e.target.attributes[i].nodeName === 'userid') {
                            userid = e.target.attributes[i].nodeValue.parseInt();
                        } else if (e.target.attributes[i].nodeName === 'cstate') {
                            cstate = e.target.attributes[i].nodeValue === 'true' ? true : false;
                        }
                    }

                    if ($u.hasContent(userid) && userid > 0) {
                        record = army.getItem(userid);
                        record.elite = !cstate;
                        army.setItem(record);
                        session.setItem("ArmyDashUpdate", true);
                        caap.updateDashboard(true);
                    }
                };

                $j("input[id*='caap_elitearmy_']", caap.caapTopObject).off('change', handler).on('change', handler);
                handler = null;

                handler = function (e) {
                    var mname = '',
                        userid = '',
                        i = 0,
                        len = 0,
                        resp = false;

                    for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                        if (e.target.attributes[i].nodeName === 'userid') {
                            userid = e.target.attributes[i].nodeValue.parseInt();
                        } else if (e.target.attributes[i].nodeName === 'mname') {
                            mname = e.target.attributes[i].nodeValue;
                        }
                    }

                    resp = confirm("Are you sure you want to remove " + mname + " from your army?");
                    if (resp === true) {
                        caap.clickAjaxLinkSend("army_member.php?action=delete&player_id=" + userid);
                        army.deleteItem(userid);
                        session.setItem("ArmyDashUpdate", true);
                        caap.updateDashboard(true);
                    }
                };

                $j("span[id*='caap_removearmy_']", caap.caapTopObject).off('click', handler).on('click', handler);
                handler = null;

                session.setItem("ArmyDashUpdate", false);
            }

            return true;
        } catch (err) {
            con.error("ERROR in army.dashboard: " + err);
            return false;
        }
    };

}());
