
    ////////////////////////////////////////////////////////////////////
    //                          town OBJECT
    // this is the main object for dealing with town items
    /////////////////////////////////////////////////////////////////////

    town = {
        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        'soldiers': [],

        'item': [],

        'magic': [],

        record: function () {
            this.data = {
                'name'   : '',
                'image'  : '',
                'type'   : '',
                'upkeep' : 0,
                'hourly' : 0,
                'atk'    : 0,
                'def'    : 0,
                'owned'  : 0,
                'cost'   : 0,
                'api'    : 0,
                'dpi'    : 0,
                'mpi'    : 0
            };
        },

        types: ['soldiers', 'item', 'magic'],
        /*jslint sub: false */

        soldiershbest: 3,

        itemhbest: 2,

        magichbest: 2,

        load: function (type) {
            try {
                if (!$u.isString(type) || type === '' || !town.types.hasIndexOf(type))  {
                    con.warn("Type passed to load: ", type);
                    throw "Invalid type value!";
                }

                town[type] = gm.getItem(type + '.records', 'default');
                if (town[type] === 'default' || !$j.isArray(town[type])) {
                    town[type] = gm.setItem(type + '.records', []);
                }

                town[type + "hbest"] = town[type + "hbest"] === false ? JSON.hbest(town[type]) : town[type + "hbest"];
                con.log(3, "town.load " + type + " Hbest", town[type + "hbest"]);
                session.setItem(type.ucFirst() + "DashUpdate", true);
                con.log(3, "town.load", type, town[type]);
                return true;
            } catch (err) {
                con.error("ERROR in town.load: " + err);
                return false;
            }
        },

        save: function (type, src) {
            try {
                if (!$u.isString(type) || type === '' || !town.types.hasIndexOf(type))  {
                    con.warn("Type passed to save: ", type);
                    throw "Invalid type value!";
                }

                var compress = false;
                if (caap.domain.which === 3) {
                    caap.messaging.setItem("town." + type, town[type]);
                } else {
                    gm.setItem(type + '.records', town[type], town[type + "hbest"], compress);
                    con.log(3, "town.save", type, town[type]);
                    if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif") && src !== "caapif") {
                        con.log(2, "town.save send");
                        caap.messaging.setItem("town." + type, town[type]);
                    }
                }

                if (caap.domain.which !== 0) {
                    session.setItem(type.ucFirst() + "DashUpdate", true);
                }

                return true;
            } catch (err) {
                con.error("ERROR in town.save: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        GetItems: function (type) {
            try {
                var rowDiv = $j("div[style*='town_unit_bar.jpg'],div[style*='town_unit_bar_owned.jpg']", caap.appBodyDiv),
                    passed = true,
                    save   = false;

                if (!$u.isString(type) || type === '' || !town.types.hasIndexOf(type))  {
                    con.warn("Type passed to load: ", type);
                    throw "Invalid type value!";
                }

                town[type] = [];
                if ($u.hasContent(rowDiv)) {
                    rowDiv.each(function (index) {
                        var row     = $j(this),
                            current = new town.record(),
                            tempDiv = $j("strong", row).eq(0),
                            tStr    = '',
                            record  = {};

                        if ($u.hasContent(tempDiv) && tempDiv.length === 1) {
                            current.data['name'] = $u.setContent(tempDiv.text(), '').trim().innerTrim();
                            record = spreadsheet.getItem(current.data['name']);
                            current.data['type'] = $u.setContent(record['type'], 'Unknown');
                        } else {
                            con.warn("Unable to get item name in", type);
                            passed = false;
                        }

                        if (passed) {
                            tempDiv = $j("img", row).eq(0);
                            if ($u.hasContent(tempDiv) && tempDiv.length === 1) {
                                current.data['image'] = $u.setContent(tempDiv.attr("src"), '').basename();
                            } else {
                                con.log(3, "No image found for", type, current.data['name']);
                            }

                            tempDiv = $j("span[class='negative']", row);
                            if ($u.hasContent(tempDiv) && tempDiv.length === 1) {
                                current.data['upkeep'] = $u.setContent(tempDiv.text(), '0').numberOnly();
                            } else {
                                con.log(4, "No upkeep found for", type, current.data.name);
                            }

                            tStr = row.children().eq(2).text().trim().innerTrim();
                            if ($u.hasContent(tStr)) {
                                current.data['atk'] = $u.setContent(tStr.regex(/(\d+) Attack/), 0);
                                current.data['def'] = $u.setContent(tStr.regex(/(\d+) Defense/), 0);
                                current.data['api'] = (current.data['atk'] + (current.data['def'] * 0.7)).dp(2);
                                current.data['dpi'] = (current.data['def'] + (current.data['atk'] * 0.7)).dp(2);
                                current.data['mpi'] = ((current.data['api'] + current.data['dpi']) / 2).dp(2);
                            } else {
                                con.warn("No atk/def found for", type, current.data['name']);
                            }

                            tempDiv = $j("strong[class='gold']", row);
                            if ($u.hasContent(tempDiv) && tempDiv.length === 1) {
                                current.data['cost'] = $u.setContent(tempDiv.text(), '0').numberOnly();
                            } else {
                                con.log(4, "No cost found for", type, current.data['name']);
                            }

                            tStr = row.children().eq(3).text().trim().innerTrim();
                            if ($u.hasContent(tStr)) {
                                current.data['owned'] = $u.setContent(tStr.regex(/Owned: (\d+)/), 0);
                                current.data['hourly'] = current.data['owned'] * current.data['upkeep'];
                            } else {
                                con.warn("No number owned found for", type, current.data['name']);
                            }

                            town[type].push(current.data);
                            save = true;
                        }
                    });
                }

                if (save) {
                    town.save(type);
                    con.log(2, "Got town details for", type);
                } else {
                    con.log(1, "Nothing to save for", type);
                }

                return true;
            } catch (err) {
                con.error("ERROR in town.GetItems: " + err);
                return false;
            }
        },

        haveOrb: function (name) {
            try {
                if (!$u.isString(name) || name === '') {
                    throw "Invalid identifying name!";
                }

                var it     = 0,
                    len    = 0,
                    haveIt = false;

                for (it = 0, len = town['magic'].length; it < len; it += 1) {
                    if (town['magic'][it]['name'] === name) {
                        con.log(3, "town.haveOrb", town['magic'][it]);
                        if (town['magic'][it]['owned']) {
                            haveIt = true;
                        }

                        break;
                    }
                }

                return haveIt;
            } catch (err) {
                con.error("ERROR in town.haveOrb: " + err);
                return undefined;
            }
        },

        getCount: function (name, image) {
            try {
                var it1     = 0,
                    it2     = 0,
                    tempIt1 = -1,
                    tempIt2 = -1,
                    owned   = 0,
                    found   = false;

                for (it1 = town.types.length - 1; it1 >= 0; it1 -= 1) {
                    if (found) {
                        break;
                    }

                    for (it2 = town[town.types[it1]].length - 1; it2 >= 0; it2 -= 1) {
                        if (town[town.types[it1]][it2]['name'] && town[town.types[it1]][it2]['name'] === name) {
                            tempIt1 = it1;
                            tempIt2 = it2;
                            if (image && town[town.types[it1]][it2]['image'] && town[town.types[it1]][it2]['image'] === image) {
                                found = true;
                                break;
                            }
                        }
                    }
                }

                if (tempIt1 > -1 && tempIt2 > -1) {
                    owned = town[town.types[tempIt1]][tempIt2]['owned'];
                }

                return owned;
            } catch (err) {
                con.error("ERROR in town.getCount: " + err);
                return undefined;
            }
        },

        report: function () {
            try {
                var it1      = 0,
                    it2      = 0,
                    record   = {},
                    h        = '',
                    missing  = [],
                    w        = $j("#caap_missing_report"),
                    color    = "red",
                    bbcode   = config.getItem("townBBCode", true),
                    sbbcolor = bbcode ? "[color=" + color + "]" : "<td style='color:" + color + "'>",
                    ebbcolor = bbcode ? "[/color]" : "</td>",
                    std      = bbcode ? "" : "<td>",
                    etd      = bbcode ? "" : "</td>";

                if (!$u.hasContent(w)) {
                    for (it1 = town.types.length - 1; it1 >= 0; it1 -= 1) {
                        for (it2 = town[town.types[it1]].length - 1; it2 >= 0; it2 -= 1) {
                            record = spreadsheet.getItem(town[town.types[it1]][it2]['name'], town[town.types[it1]][it2]['image']);
                            if (!$u.hasContent(record) || !$j.isPlainObject(record) || $j.isEmptyObject(record) || town[town.types[it1]][it2]['image'] !== record['image'] || town[town.types[it1]][it2]['atk'] !== record['attack'] || town[town.types[it1]][it2]['def'] !== record['defense']) {
                                h = bbcode ? "[tr][td]" : "<tr>";
                                if (!$u.hasContent(record) || !$j.isPlainObject(record) || $j.isEmptyObject(record)) {
                                    h += sbbcolor + town[town.types[it1]][it2]['name'] + ebbcolor;
                                } else {
                                    h += std + town[town.types[it1]][it2]['name'] + etd;
                                }

                                h += bbcode ? "[/td][td]" : "";
                                if (town[town.types[it1]][it2]['image'] !== record['image']) {
                                    h += sbbcolor + town[town.types[it1]][it2]['image'] + ebbcolor;
                                } else {
                                    h += std + town[town.types[it1]][it2]['image'] + etd;
                                }

                                h += bbcode ? "[/td][td]" : "";
                                if (town[town.types[it1]][it2]['atk'] !== record['attack']) {
                                    h += sbbcolor + town[town.types[it1]][it2]['atk'] + ebbcolor;
                                } else {
                                    h += std + town[town.types[it1]][it2]['atk'] + etd;
                                }

                                h += bbcode ? "[/td][td]" : "";
                                if (town[town.types[it1]][it2]['def'] !== record['defense']) {
                                    h += sbbcolor + town[town.types[it1]][it2]['def'] + ebbcolor;
                                } else {
                                    h += std + town[town.types[it1]][it2]['def'] + etd;
                                }

                                h += bbcode ? "[/td][/tr]" : "</tr>";
                                missing.push(h);
                            }
                        }
                    }

                    if ($u.hasContent(missing)) {
                        missing.sort();
                        if (bbcode) {
                            h = "[table]\n[tr][td][b]Name[/b][/td][td][b]Image[/b][/td][td][b]Attack[/b][/td][td][b]Defense[/b][/td][/tr]\n";
                        } else {
                            h = "<table>\n<tr><th>Name</th><th>Image</th><th>Attack</th><th>Defense</th></tr>\n";
                        }

                        h += missing.join("\n");

                        if (bbcode) {
                            h += "[/table]\n";
                            h = "<textarea style='resize:none;width:600px;height:400px;' readonly='readonly'>" + h + "</textarea>";
                        } else {
                            h += "</table>\n";
                        }

                        w = $j('<div id="caap_missing_report" class="caap_ff caap_fs" title="Missing Item Report">' + h + '</div>').appendTo(document.body);
                        w.dialog({
                            resizable : false,
                            width     : 'auto',
                            height    : bbcode ? 'auto' : '400',
                            buttons   : {
                                "Ok": function () {
                                    w.dialog("destroy").remove();
                                }
                            },
                            close     : function () {
                                w.dialog("destroy").remove();
                            }
                        });
                    } else {
                        $j().alert("Nothing to report.");
                    }
                }

                return true;
            } catch (err) {
                con.error("ERROR in town.report: " + err);
                return false;
            }
        },

        runReport: function () {
            try {
                var reportType = config.getItem("townReportType", "Units"),
                    stance     = config.getItem("townReportStance", "Attack"),
                    sizeStr    = config.getItem("townReportSize", "Army"),
                    displayRef = reportType + stance + sizeStr;

                return town.bestStuff(reportType, stance, sizeStr, displayRef);
            } catch (err) {
                con.error("ERROR in town.runReport: " + err);
                return undefined;
            }
        },

        reportType: {
            'Units'   : 'soldiers',
            'Weapons' : 'item',
            'Items'   : 'item',
            'Magic'   : 'magic'
        },

        reportTypeList: function () {
            try {
                var list = [],
                    it   = '';

                for (it in town.reportType) {
                    if (town.reportType.hasOwnProperty(it)) {
                        list.push(it);
                    }
                }

                return list;
            } catch (err) {
                con.error("ERROR in town.menu: " + err);
                return undefined;
            }
        },

        bestStuffDialog: {},

        bestStuff: function (reportType, stance, size, displayRef) {
            try {
                reportType = $u.setContent(reportType, "Units");
                stance = stance !== "Attack" && stance !== "Defense" ? "Attack" : stance;
                size = $u.isNaN(size) ? caap.stats['army']['capped'] : ($u.isNumber(size) ? size : size.parseInt());
                displayRef = $u.setContent(displayRef, false);
                con.log(2, "reportType/stance/size/displayRef", reportType, stance, size, displayRef);
                var h    = "<table>\n<tr><th style='white-space: nowrap;'>Name</th><th>Used</th><th>Attack</th><th>Defense</th><th>" + (stance === "attack" ? "API" : "DPI") + "</th></tr>\n",
                    list = JSON.copy(town[$u.setContent(town.reportType[reportType], "soldiers")]).sort($u.sortBy(true, stance === "Attack" ? "api" : "dpi", $u.sortBy(false, "cost", $u.sortBy(false, "name", $u.sortBy(true, "owned"))))),
                    best = [],
                    it   = 0,
                    len  = list.length,
                    cnt  = size,
                    buy  = false;

                function destroy(idx) {
                    town.bestStuffDialog[idx].dialog("destroy").remove();
                    delete town.bestStuffDialog[idx];
                }

                for (it = 0; it < len; it += 1) {
                    if (cnt <= 0) {
                        break;
                    }

                    if (list[it]['owned'] === 0 && list[it]['cost'] === 0) {
                        continue;
                    }

                    if (list[it]['type'] === "Weapon") {
                        if (reportType === "Items") {
                            continue;
                        }
                    } else {
                        if (reportType === "Weapons") {
                            continue;
                        }
                    }

                    buy = false;
                    if (list[it]['cost'] !== 0) {
                        buy = true;
                    }

                    if (list[it]['owned'] > cnt) {
                        list[it]['owned'] = cnt;
                    }

                    best.push(list[it]);
                    cnt -= list[it]['owned'];
                    h += "<tr" + (buy ? " style='color: red;'" : "") + "><td style='white-space: nowrap;'>" + list[it]['name'] + "</td><td>" + list[it]['owned'] + "</td><td>" + list[it]['atk'] + "</td><td>" + list[it]['def'] + "</td><td>" + list[it][(stance === "Attack" ? "api" : "dpi")] + "</td></tr>\n";
                }

                h += "</table>\n";
                if (displayRef && !$u.hasContent(town.bestStuffDialog[displayRef])) {
                    town.bestStuffDialog[displayRef] = $j("<div id='caap_best_" + displayRef + "_report' class='caap_ff caap_fs' title='Best " + reportType + " " + stance + " Report: " + size + " Army'>" + h + "</div>").appendTo(document.body);
                    town.bestStuffDialog[displayRef].dialog({
                        resizable : false,
                        width     : '400',
                        height    : '400',
                        buttons   : {
                            Ok: function () {
                                destroy(displayRef);
                            }
                        },
                        close     : function () {
                            destroy(displayRef);
                        }
                    });
                }

                con.log(2, "town.bestStuff", best);
                return best;
            } catch (err) {
                con.error("ERROR in town.bestStuff: " + err);
                return undefined;
            }
        },

        menu: function () {
            try {
                var htmlCode = '';

                htmlCode += caap.startToggle('Town', 'TOWN');
                htmlCode += caap.makeDropDownTR("Report Type", 'townReportType', town.reportTypeList(), '', '', 'Units', false, false, 62);
                htmlCode += caap.makeDropDownTR("Stance", 'townReportStance', ["Attack", "Defense"], '', '', 'Attack', false, false, 62);
                htmlCode += caap.makeDropDownTR("Size", 'townReportSize', ['Army', '501', '521', '541'], '', '', 'Army', false, false, 62);
                htmlCode += caap.startTR();
                htmlCode += caap.makeTD("<input type='button' id='caap_TownBestReport' value='Show Report' style='padding: 0; font-size: 10px; height: 18px' />", false, false, "");
                htmlCode += caap.endTR;
                htmlCode += caap.makeCheckTR("Modify Timers", 'townModifyTimers', false, "Advanced timers for how often Town checks are performed.");
                htmlCode += caap.startCheckHide('townModifyTimers');
                htmlCode += caap.makeNumberFormTR("Soldiers Hours", 'checkSoldiers', "Check the Town Soldiers every X hours. Minimum 72.", 72, '', '', true);
                htmlCode += caap.makeNumberFormTR("Items Hours", 'checkItem', "Check the Town Items every X hours. Minimum 72.", 72, '', '', true);
                htmlCode += caap.makeNumberFormTR("Magic Hours", 'checkMagic', "Check the Town Magic every X hours. Minimum 72.", 72, '', '', true);
                htmlCode += caap.endCheckHide('townModifyTimers');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                con.error("ERROR in town.menu: " + err);
                return '';
            }
        },

        dashboard: function () {
            try {
                /*-------------------------------------------------------------------------------------\
                Next we build the HTML to be included into the 'soldiers', 'item' and 'magic' div.
                We set our table and then build the header row.
                \-------------------------------------------------------------------------------------*/
                if ((config.getItem('DBDisplay', '') === 'Soldiers Stats' && session.getItem("SoldiersDashUpdate", true)) || (config.getItem('DBDisplay', '') === 'Item Stats' && session.getItem("ItemDashUpdate", true)) || (config.getItem('DBDisplay', '') === 'Magic Stats' && session.getItem("MagicDashUpdate", true))) {
                    var headers     = ['Name', 'Type', 'Own', 'Atk', 'Def', 'API', 'DPI', 'MPI', 'Cost', 'Upkeep', 'Hourly'],
                        values      = ['name', 'type', 'owned', 'atk', 'def', 'api', 'dpi', 'mpi', 'cost', 'upkeep', 'hourly'],
                        pp          = 0,
                        i           = 0,
                        it          = 0,
                        len         = 0,
                        len1        = 0,
                        len2        = 0,
                        str         = '',
                        num         = 0,
                        header      = {text: '', color: '', bgcolor: '', id: '', title: '', width: ''},
                        head        = '',
                        body        = '',
                        row         = '';

                    for (i = 0, len = town.types.length; i < len; i += 1) {
                        if (config.getItem('DBDisplay', '') !== (town.types[i].ucFirst() + ' Stats')) {
                            continue;
                        }

                        for (pp = 0, len1 = headers.length; pp < len1; pp += 1) {
                            if (town.types[i] !== 'item' && headers[pp] === 'Type') {
                                continue;
                            }

                            header = {
                                text  : headers[pp],
                                color : '',
                                id    : '',
                                title : '',
                                width : ''
                            };

                            switch (headers[pp]) {
                            case 'Name' :
                                header.width = '30%';
                                break;
                            case 'Type' :
                                header.width = '7%';
                                break;
                            case 'Own' :
                                header.width = '6%';
                                break;
                            case 'Atk' :
                                header.width = '6%';
                                break;
                            case 'Def' :
                                header.width = '6%';
                                break;
                            case 'API' :
                                header.width = '6%';
                                break;
                            case 'DPI' :
                                header.width = '6%';
                                break;
                            case 'MPI' :
                                header.width = '6%';
                                break;
                            case 'Cost' :
                                header.width = '9%';
                                break;
                            case 'Upkeep' :
                                header.width = '9%';
                                break;
                            case 'Hourly' :
                                header.width = '9%';
                                break;
                            default:
                            }

                            head += caap.makeTh(header);
                        }

                        head = caap.makeTr(head);
                        for (it = 0, len1 = town[town.types[i]].length; it < len1; it += 1) {
                            row = "";
                            for (pp = 0, len2 = values.length; pp < len2; pp += 1) {
                                if (town.types[i] !== 'item' && values[pp] === 'type') {
                                    continue;
                                }

                                if ($u.isNaN(town[town.types[i]][it][values[pp]]) || !$u.hasContent(town[town.types[i]][it][values[pp]])) {
                                    str = $u.setContent(town[town.types[i]][it][values[pp]], '');
                                } else {
                                    num = town[town.types[i]][it][values[pp]];
                                    str = $u.hasContent(num) && (values[pp] === 'cost' || values[pp] === 'upkeep' || values[pp] === 'hourly') ? "$" + num.SI() : num.addCommas();
                                }

                                row += caap.makeTd({text: str, color: '', id: '', title: ''});
                            }

                            body += caap.makeTr(row);
                        }

                        $j("#caap_" + town.types[i] + "Stats", caap.caapTopObject).html(
                            $j(caap.makeTable(town.types[i], head, body)).dataTable({
                                "bAutoWidth"    : false,
                                "bFilter"       : false,
                                "bJQueryUI"     : false,
                                "bInfo"         : false,
                                "bLengthChange" : false,
                                "bPaginate"     : false,
                                "bProcessing"   : false,
                                "bStateSave"    : true,
                                "bSortClasses"  : false
                            })
                        );

                        session.setItem(town.types[i] + "DashUpdate", false);
                    }
                }

                return true;
            } catch (err) {
                con.error("ERROR in town.dashboard: " + err);
                return false;
            }
        }
        /*jslint sub: false */
    };
