
    ////////////////////////////////////////////////////////////////////
    //                          spreadsheet OBJECT
    // this is the main object for dealing with spreadsheet items
    /////////////////////////////////////////////////////////////////////

    spreadsheet = {
        records: [],

        hbest: 2,

        compress: true,

        load: function () {
            try {
                if (!config.getItem("enableTitles", true) && !config.getItem("goblinHinting", true) && !config.getItem("enableRecipeClean", true)) {
                    return true;
                }

                spreadsheet.records = ss.getItem('spreadsheet.records', 'default', true);
                if (spreadsheet.records === 'default' || !$j.isArray(spreadsheet.records) || !spreadsheet.records.length) {
                    spreadsheet.records = [];
                    $j.ajax({
                        url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20csv%20where%20url%3D'http%3A%2F%2Fspreadsheets.google.com%2Fpub%3Fkey%3D0At1LY6Vd3Bp9dFFXX2xCc0x3RjJpN1VNbER5dkVvTXc%26hl%3Den%26output%3Dcsv'&format=json",
                        dataType: ($u.is_opera ? "jsonp" : "json"),
                        error:
                            function (XMLHttpRequest, textStatus, errorThrown) {
                                con.log(1, "Using offline items");
                                spreadsheet.records = offline.items;
                                spreadsheet.save();
                                con.error("spreadsheet.load", textStatus);
                            },
                        success: function (msg) {
                            try {
                                con.log(3, "msg", msg);
                                var rows       = [],
                                    row        = 0,
                                    rowsLen    = 0,
                                    column     = 0,
                                    newRecord  = {},
                                    cell       = null,
                                    headers    = {},
                                    headersLen = 0,
                                    headersArr = [],
                                    key        = '';

                                /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
                                /*jslint sub: true */
                                rows = msg['query']['results']['row'];
                                /*jslint sub: false */
                                headers = rows[0];
                                for (key in headers) {
                                    if (headers.hasOwnProperty(key)) {
                                        headersLen = headersArr.push((headers[key]).toLowerCase());
                                    }
                                }

                                for (row = 1, rowsLen = rows.length; row < rowsLen; row += 1) {
                                    newRecord = {};
                                    for (column = 0; column < headersLen; column += 1) {
                                        if (!$u.isDefined(headersArr[column]) || headersArr[column] === '') {
                                            con.warn("Spreadsheet column is empty", column);
                                            continue;
                                        }

                                        cell = rows[row]["col" + column];
                                        if (!$u.isDefined(cell) || cell === '') {
                                            cell = null;
                                        } else if ($u.isNaN(cell)) {
                                            if (headersArr[column] === "attack" || headersArr[column] === "defense") {
                                                con.warn("Spreadsheet " + headersArr[column] + " cell is NaN", cell);
                                            }

                                            cell = cell.replace(/"/g, "");
                                        } else {
                                            cell = cell.parseInt();
                                        }

                                        newRecord[headersArr[column]] = cell;
                                    }

                                    spreadsheet.records.push(newRecord);
                                }

                                if (!$u.hasContent(spreadsheet.records)) {
                                    con.log(1, "Using offline items");
                                    spreadsheet.records = offline.items;
                                }

                                spreadsheet.save();
                            } catch (err) {
                                con.log(1, "Using offline items");
                                spreadsheet.records = offline.items;
                                spreadsheet.save();
                                con.error("ERROR in spreadsheet.load: " + err);
                            }
                        }
                    });
                } else {
                    con.log(3, "spreadsheet.records", spreadsheet.records);
                }

                return true;
            } catch (err) {
                con.log(1, "Using offline items");
                spreadsheet.records = offline.items;
                spreadsheet.save();
                con.error("ERROR in spreadsheet.load: " + err);
                return false;
            }
        },

        save: function (src) {
            try {
                spreadsheet.hbest = spreadsheet.hbest === false ? JSON.hbest(spreadsheet.records) : spreadsheet.hbest;
                con.log(3, "spreadsheet.records Hbest", spreadsheet.hbest);
                if (caap.domain.which === 3) {
                    caap.messaging.setItem('spreadsheet.records', spreadsheet.records);
                } else {
                    ss.setItem('spreadsheet.records', spreadsheet.records, spreadsheet.hbest, spreadsheet.compress);
                    con.log(3, "spreadsheet.save", spreadsheet.records);
                    if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif") && src !== "caapif") {
                        con.log(2, "spreadsheet.save send");
                        caap.messaging.setItem('spreadsheet.records', spreadsheet.records);
                    }
                }

                return true;
            } catch (err) {
                con.error("ERROR in spreadsheet.save: " + err);
                return false;
            }
        },

        clear: function () {
            try {
                ss.deleteItem('spreadsheet.records');
                spreadsheet.records = [];
                con.log(3, "spreadsheet.clear", spreadsheet.records);
                return true;
            } catch (err) {
                con.error("ERROR in spreadsheet.clear: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        getItem: function (name, image) {
            try {
                if (!$u.hasContent(name) || !$u.isString(name)) {
                    con.warn("name", name);
                    throw "Invalid identifying name!";
                }

                var it     = 0,
                    len    = 0,
                    found  = false,
                    record = {};

                for (it = 0, len = spreadsheet.records.length; it < len; it += 1) {
                    if (image) {
                        if (spreadsheet.records[it]['name'] === name && spreadsheet.records[it]['image'] === image) {
                            record = spreadsheet.records[it];
                            found = true;
                            break;
                        }
                    } else {
                        if (spreadsheet.records[it]['name'] === name) {
                            record = spreadsheet.records[it];
                            found = true;
                            break;
                        }
                    }
                }

                if (!found) {
                    con.warn("Unable to find spreadsheet record for", name);
                }

                return record;
            } catch (err) {
                con.error("ERROR in spreadsheet.getItem: " + err);
                return undefined;
            }
        },

        getTitle: function (title, image) {
            try {
                var it       = 0,
                    tempIt   = -1,
                    owned    = 0,
                    titleStr = '',
                    hide     = false,
                    opacity  = false;

                for (it = spreadsheet.records.length - 1; it >= 0; it -= 1) {
                    if (spreadsheet.records[it]['name'] && spreadsheet.records[it]['name'] === title) {
                        tempIt = it;
                        if (spreadsheet.records[it]['image'] && spreadsheet.records[it]['image'] === image) {
                            break;
                        }
                    }
                }

                if (tempIt > -1) {
                    titleStr = spreadsheet.records[tempIt]['name'] + ": " + spreadsheet.records[tempIt]['type'];
                    if ($u.hasContent(spreadsheet.records[tempIt]['attack']) && $u.hasContent(spreadsheet.records[tempIt]['defense'])) {
                        titleStr += ", " + spreadsheet.records[tempIt]['attack'] + "atk," + spreadsheet.records[tempIt]['defense'] + "def";
                    }

                    if ($u.hasContent(spreadsheet.records[tempIt]['hero'])) {
                        titleStr += ", Hero: " + spreadsheet.records[tempIt]['hero'];
                        owned = general.owned(spreadsheet.records[tempIt]['hero']);
                        titleStr += " (Owned: " + owned + ")";
                        hide = (owned ? false : true);
                    }

                    if ($u.hasContent(spreadsheet.records[tempIt]['recipe1'])) {
                        titleStr += ", Recipe1: " + spreadsheet.records[tempIt]['recipe1'];
                        if (spreadsheet.records[tempIt]['recipe1'] === "Map of Atlantis") {
                            owned = caap.stats['other']['atlantis'];
                            titleStr += " (Owned: " + owned + ")";
                            hide = (owned ? false : true);
                        } else {
                            owned = town.getCount(spreadsheet.records[tempIt]['recipe1'], spreadsheet.records[tempIt]['recipe1image']);
                            titleStr += " (Owned: " + owned + ")";
                            hide = (owned ? false : true);
                        }
                    }

                    if ($u.hasContent(spreadsheet.records[tempIt]['recipe2'])) {
                        titleStr += ", Recipe2: " + spreadsheet.records[tempIt]['recipe2'];
                        owned = town.getCount(spreadsheet.records[tempIt]['recipe2'], spreadsheet.records[tempIt]['recipe2image']);
                        titleStr += " (Owned: " + owned + ")";
                        hide = (owned ? false : true);
                    }

                    if ($u.hasContent(spreadsheet.records[tempIt]['recipe3'])) {
                        titleStr += ", Recipe3: " + spreadsheet.records[tempIt]['recipe3'];
                        owned = town.getCount(spreadsheet.records[tempIt]['recipe3'], spreadsheet.records[tempIt]['recipe3image']);
                        titleStr += " (Owned: " + owned + ")";
                        hide = (owned ? false : true);
                    }

                    if ($u.hasContent(spreadsheet.records[tempIt]['recipe4'])) {
                        titleStr += ", Recipe4: " + spreadsheet.records[tempIt]['recipe4'];
                        owned = town.getCount(spreadsheet.records[tempIt]['recipe4'], spreadsheet.records[tempIt]['recipe4image']);
                        titleStr += " (Owned: " + owned + ")";
                        hide = (owned ? false : true);
                    }

                    if ($u.hasContent(spreadsheet.records[tempIt]['recipe5'])) {
                        titleStr += ", Recipe5: " + spreadsheet.records[tempIt]['recipe5'];
                        owned = town.getCount(spreadsheet.records[tempIt]['recipe5'], spreadsheet.records[tempIt]['recipe5image']);
                        titleStr += " (Owned: " + owned + ")";
                        hide = (owned ? false : true);
                    }

                    if ($u.hasContent(spreadsheet.records[tempIt]['summon'])) {
                        titleStr += ", Summon: " + spreadsheet.records[tempIt]['summon'];
                        opacity = true;
                    }

                    if ($u.hasContent(spreadsheet.records[tempIt]['comment'])) {
                        titleStr += ", Comment: " + spreadsheet.records[tempIt]['comment'];
                    }
                }

                return {title: titleStr, opacity: opacity, hide: hide};
            } catch (err) {
                con.error("ERROR in spreadsheet.getTitle: " + err);
                return undefined;
            }
        },
        /*jslint sub: false */

        doTitles: function (goblin) {
            try {
                var images = $j("#" + caap.domain.id[caap.domain.which] + "globalContainer img");
                if ($u.hasContent(images)) {
                    images.each(function () {
                        var img   = $j(this),
                            div   = $j(),
                            title = '',
                            image = '',
                            style = '',
                            tMes  = {};

                        title = img.attr("title");
                        if ($u.hasContent(title)) {
                            image = $u.setContent(img.attr("src"), '').basename();
                            tMes = spreadsheet.getTitle(title, image);
                            if (tMes && $j.isPlainObject(tMes) && !$j.isEmptyObject(tMes) && tMes.title) {
                                img.attr("title", tMes.title);
                                if (goblin && (tMes.opacity || tMes.hide)) {
                                    div = img.parent().parent();
                                    style = div.attr("style");
                                    style += tMes.opacity ? " opacity: 0.3;" : '';
                                    style += tMes.hide ? " display: none;" : '';
                                    div.attr("style", style);
                                }
                            }
                        }
                    });
                }

                return true;
            } catch (err) {
                con.error("ERROR in spreadsheet.doTitles: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        isSummon: function (title, image) {
            try {
                var it     = 0,
                    tempIt = -1;

                for (it = spreadsheet.records.length - 1; it >= 0; it -= 1) {
                    if (spreadsheet.records[it]['name'] && spreadsheet.records[it]['name'] === title) {
                        tempIt = it;
                        if (spreadsheet.records[it]['image'] && spreadsheet.records[it]['image'] === image) {
                            break;
                        }
                    }
                }

                return tempIt > -1 && $u.isDefined(spreadsheet.records[tempIt]['summon']) ? true : false;
            } catch (err) {
                con.error("ERROR in spreadsheet.isSummon: " + err);
                return undefined;
            }
        }
        /*jslint sub: false */
    };
