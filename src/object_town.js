
    ////////////////////////////////////////////////////////////////////
    //                          town OBJECT
    // this is the main object for dealing with town items
    /////////////////////////////////////////////////////////////////////

    town = {
        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        'soldiers': [],

        'soldiersSortable': [],

        'item': [],

        'itemSortable': [],

        'magic': [],

        'magicSortable': [],

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

        copy2sortable: function (type) {
            try {
                if (!$u.isString(type) || type === '' || !town.types.hasIndexOf(type))  {
                    $u.warn("Type passed to copy2sortable: ", type);
                    throw "Invalid type value!";
                }

                var order = new sort.order();
                $j.extend(true, order.data, state.getItem(type.ucFirst() + "Sort", order.data));
                town[type + 'Sortable'] = [];
                $j.merge(town[type + 'Sortable'], town[type]);
                town[type + 'Sortable'].sort($u.sortBy(order.data['reverse']['a'], order.data['value']['a'], $u.sortBy(order.data['reverse']['b'], order.data['value']['b'], $u.sortBy(order.data['reverse']['c'], order.data['value']['c']))));
                return true;
            } catch (err) {
                $u.error("ERROR in town.copy2sortable: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        soldiershbest: 3,

        itemhbest: 2,

        magichbest: 2,

        load: function (type) {
            try {
                if (!$u.isString(type) || type === '' || !town.types.hasIndexOf(type))  {
                    $u.warn("Type passed to load: ", type);
                    throw "Invalid type value!";
                }

                town[type] = gm.getItem(type + '.records', 'default');
                if (town[type] === 'default' || !$j.isArray(town[type])) {
                    town[type] = gm.setItem(type + '.records', []);
                }

                town[type + "hbest"] = town[type + "hbest"] === false ? JSON.hbest(town[type]) : town[type + "hbest"];
                $u.log(3, "town.load " + type + " Hbest", town[type + "hbest"]);
                town.copy2sortable(type);
                state.setItem(type.ucFirst() + "DashUpdate", true);
                $u.log(3, "town.load", type, town[type]);
                return true;
            } catch (err) {
                $u.error("ERROR in town.load: " + err);
                return false;
            }
        },

        save: function (type) {
            try {
                if (!$u.isString(type) || type === '' || !town.types.hasIndexOf(type))  {
                    $u.warn("Type passed to save: ", type);
                    throw "Invalid type value!";
                }

                var compress = false;
                gm.setItem(type + '.records', town[type], town[type + "hbest"], compress);
                state.setItem(type.ucFirst() + "DashUpdate", true);
                $u.log(3, "town.save", type, town[type]);
                return true;
            } catch (err) {
                $u.error("ERROR in town.save: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        GetItems: function (type) {
            try {
                var rowDiv = $j("div[style*='town_unit_bar']", caap.appBodyDiv),
                    passed = true,
                    save   = false;

                if (!$u.isString(type) || type === '' || !town.types.hasIndexOf(type))  {
                    $u.warn("Type passed to load: ", type);
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
                            $u.warn("Unable to get item name in", type);
                            passed = false;
                        }

                        if (passed) {
                            tempDiv = $j("img", row).eq(0);
                            if ($u.hasContent(tempDiv) && tempDiv.length === 1) {
                                current.data['image'] = $u.setContent(tempDiv.attr("src"), '').basename();
                            } else {
                                $u.log(3, "No image found for", type, current.data['name']);
                            }

                            tempDiv = $j("span[class='negative']", row);
                            if ($u.hasContent(tempDiv) && tempDiv.length === 1) {
                                current.data['upkeep'] = $u.setContent(tempDiv.text(), '0').numberOnly();
                            } else {
                                $u.log(3, "No upkeep found for", type, current.data.name);
                            }

                            tStr = row.children().eq(2).text().trim().innerTrim();
                            if ($u.hasContent(tStr)) {
                                current.data['atk'] = $u.setContent(tStr.regex(/(\d+) Attack/), 0);
                                current.data['def'] = $u.setContent(tStr.regex(/(\d+) Defense/), 0);
                                current.data['api'] = (current.data['atk'] + (current.data['def'] * 0.7)).dp(2);
                                current.data['dpi'] = (current.data['def'] + (current.data['atk'] * 0.7)).dp(2);
                                current.data['mpi'] = ((current.data['api'] + current.data['dpi']) / 2).dp(2);
                            } else {
                                $u.warn("No atk/def found for", type, current.data['name']);
                            }

                            tempDiv = $j("strong[class='gold']", row);
                            if ($u.hasContent(tempDiv) && tempDiv.length === 1) {
                                current.data['cost'] = $u.setContent(tempDiv.text(), '0').numberOnly();
                            } else {
                                $u.log(3, "No cost found for", type, current.data['name']);
                            }

                            tStr = row.children().eq(3).text().trim().innerTrim();
                            if ($u.hasContent(tStr)) {
                                current.data['owned'] = $u.setContent(tStr.regex(/Owned: (\d+)/), 0);
                                current.data['hourly'] = current.data['owned'] * current.data['upkeep'];
                            } else {
                                $u.warn("No number owned found for", type, current.data['name']);
                            }

                            town[type].push(current.data);
                            save = true;
                        }
                    });
                }

                if (save) {
                    town.save(type);
                    town.copy2sortable(type);
                    $u.log(2, "Got town details for", type);
                } else {
                    $u.log(1, "Nothing to save for", type);
                }

                return true;
            } catch (err) {
                $u.error("ERROR in town.GetItems: " + err);
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
                        $u.log(3, "town.haveOrb", town['magic'][it]);
                        if (town['magic'][it]['owned']) {
                            haveIt = true;
                        }

                        break;
                    }
                }

                return haveIt;
            } catch (err) {
                $u.error("ERROR in town.haveOrb: " + err);
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
                $u.error("ERROR in town.getCount: " + err);
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
                $u.error("ERROR in town.report: " + err);
                return false;
            }
        },

        dashboard: function () {
            try {
                /*-------------------------------------------------------------------------------------\
                Next we build the HTML to be included into the 'soldiers', 'item' and 'magic' div.
                We set our table and then build the header row.
                \-------------------------------------------------------------------------------------*/
                if ((config.getItem('DBDisplay', '') === 'Soldiers Stats' && state.getItem("SoldiersDashUpdate", true)) || (config.getItem('DBDisplay', '') === 'Item Stats' && state.getItem("ItemDashUpdate", true)) || (config.getItem('DBDisplay', '') === 'Magic Stats' && state.getItem("MagicDashUpdate", true))) {
                    var headers     = ['Name', 'Type', 'Owned', 'Atk', 'Def', 'API', 'DPI', 'MPI', 'Cost', 'Upkeep', 'Hourly'],
                        values      = ['name', 'type', 'owned', 'atk', 'def', 'api', 'dpi', 'mpi', 'cost', 'upkeep', 'hourly'],
                        html        = '',
                        townValues  = [],
                        pp          = 0,
                        i           = 0,
                        valueCol    = 'red',
                        it          = 0,
                        len         = 0,
                        len1        = 0,
                        len2        = 0,
                        str         = '',
                        header      = {text: '', color: '', bgcolor: '', id: '', title: '', width: ''},
                        statsRegExp = new RegExp("caap_.*Stats_"),
                        handler     = null;

                    $j.merge(townValues, values);
                    for (i = 0, len = town.types.length; i < len; i += 1) {
                        if (config.getItem('DBDisplay', '') !== (town.types[i].ucFirst() + ' Stats')) {
                            continue;
                        }

                        html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
                        for (pp = 0, len1 = headers.length; pp < len1; pp += 1) {
                            if (town.types[i] !== 'item' && headers[pp] === 'Type') {
                                continue;
                            }

                            header = {
                                text  : '<span id="caap_' + town.types[i] + 'Stats_' + values[pp] + '" title="Click to sort" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + headers[pp] + '</span>',
                                color : 'blue',
                                id    : '',
                                title : '',
                                width : ''
                            };

                            html += caap.makeTh(header);
                        }

                        html += '</tr>';
                        for (it = 0, len1 = town[town.types[i] + "Sortable"].length; it < len1; it += 1) {
                            html += "<tr>";
                            for (pp = 0, len2 = values.length; pp < len2; pp += 1) {
                                if (town.types[i] !== 'item' && values[pp] === 'type') {
                                    continue;
                                }

                                if ($u.isNaN(town[town.types[i] + "Sortable"][it][values[pp]]) || !$u.hasContent(town[town.types[i] + "Sortable"][it][values[pp]])) {
                                    str = $u.setContent(town[town.types[i] + "Sortable"][it][values[pp]], '');
                                } else {
                                    str = town[town.types[i] + "Sortable"][it][values[pp]].addCommas();
                                    str = $u.hasContent(str) && (values[pp] === 'cost' || values[pp] === 'upkeep' || values[pp] === 'hourly') ? "$" + str : str;
                                }

                                html += caap.makeTd({text: str, color: pp === 0 ? '' : valueCol, id: '', title: ''});
                            }

                            html += '</tr>';
                        }

                        html += '</table>';
                        $j("#caap_" + town.types[i] + "Stats", caap.caapTopObject).html(html);
                        state.setItem(town.types[i] + "DashUpdate", false);
                    }

                    handler = function (e) {
                        var clicked = '',
                            order = new sort.order();

                        if (e.target.id) {
                            clicked = e.target.id.replace(statsRegExp, '');
                        }

                        if (townValues.hasIndexOf(clicked)) {
                            order.data['value']['a'] = clicked;
                            if (clicked !== 'name') {
                                order.data['reverse']['a'] = true;
                                order.data['value']['b'] = "name";
                            }

                            town['soldiersSortable'].sort($u.sortBy(order.data['reverse']['a'], order.data['value']['a'], $u.sortBy(order.data['reverse']['b'], order.data['value']['b'])));
                            state.setItem("SoldiersSort", order.data);
                            state.setItem("SoldiersDashUpdate", true);
                            caap.updateDashboard(true);
                            sort.updateForm("Soldiers");
                        }
                    };

                    $j("span[id*='caap_soldiersStats_']", caap.caapTopObject).unbind('click', handler).click(handler);

                    handler = function (e) {
                        var clicked = '',
                            order = new sort.order();

                        if (e.target.id) {
                            clicked = e.target.id.replace(statsRegExp, '');
                        }

                        if (townValues.hasIndexOf(clicked)) {
                            order.data['value']['a'] = clicked;
                            if (clicked !== 'name') {
                                order.data['reverse']['a'] = true;
                                order.data['value']['b'] = "name";
                            }

                            town['itemSortable'].sort($u.sortBy(order.data['reverse']['a'], order.data['value']['a'], $u.sortBy(order.data['reverse']['b'], order.data['value']['b'])));
                            state.setItem("ItemSort", order.data);
                            state.setItem("ItemDashUpdate", true);
                            caap.updateDashboard(true);
                            sort.updateForm("Item");
                        }
                    };

                    $j("span[id*='caap_itemStats_']", caap.caapTopObject).unbind('click', handler).click(handler);

                    handler = function (e) {
                        var clicked = '',
                            order = new sort.order();

                        if (e.target.id) {
                            clicked = e.target.id.replace(statsRegExp, '');
                        }

                        if (townValues.hasIndexOf(clicked)) {
                            order.data['value']['a'] = clicked;
                            if (clicked !== 'name') {
                                order.data['reverse']['a'] = true;
                                order.data['value']['b'] = "name";
                            }

                            town['magicSortable'].sort($u.sortBy(order.data['reverse']['a'], order.data['value']['a'], $u.sortBy(order.data['reverse']['b'], order.data['value']['b'])));
                            state.setItem("MagicSort", order.data);
                            state.setItem("MagicDashUpdate", true);
                            caap.updateDashboard(true);
                            sort.updateForm("Magic");
                        }
                    };

                    $j("span[id*='caap_magicStats_']", caap.caapTopObject).unbind('click', handler).click(handler);
                }

                return true;
            } catch (err) {
                $u.error("ERROR in town.dashboard: " + err);
                return false;
            }
        }
        /*jslint sub: false */
    };
