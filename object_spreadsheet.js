
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

            spreadsheet.records = ss.getItem('spreadsheet.records', 'default');
            if (spreadsheet.records === 'default' || !$j.isArray(spreadsheet.records) || !spreadsheet.records.length) {
                spreadsheet.records = [];
                $j.ajax({
                    url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20csv%20where%20url%3D'http%3A%2F%2Fspreadsheets.google.com%2Fpub%3Fkey%3D0At1LY6Vd3Bp9dFFXX2xCc0x3RjJpN1VNbER5dkVvTXc%26hl%3Den%26output%3Dcsv'&format=json",
                    dataType: "json",
                    success: function (msg) {
                        utility.log(2, "msg", msg);
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
                                if (headersArr[column] === null || headersArr[column] === undefined || headersArr[column] === '') {
                                    utility.warn("Spreadsheet column is empty", column);
                                    continue;
                                }

                                cell = rows[row]["col" + column];
                                if (cell === null || cell === undefined || cell === '') {
                                    cell = null;
                                } else if (isNaN(cell)) {
                                    if (headersArr[column] === "attack" || headersArr[column] === "defense") {
                                        utility.warn("Spreadsheet " + headersArr[column] + " cell is NaN", cell);
                                    }

                                    cell = cell.replace(/"/g, "");
                                } else {
                                    cell = cell.parseInt();
                                }

                                newRecord[headersArr[column]] = cell;
                            }

                            spreadsheet.records.push(newRecord);
                        }

                        //spreadsheet.hbest = JSON.hbest(spreadsheet.records);
                        utility.log(2, "spreadsheet.records Hbest", spreadsheet.hbest);
                        ss.setItem('spreadsheet.records', spreadsheet.records, spreadsheet.hbest, spreadsheet.compress);
                        utility.log(2, "spreadsheet.records", spreadsheet.records);
                    }
                });
            } else {
                utility.log(2, "spreadsheet.records", spreadsheet.records);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in spreadsheet.load: " + err);
            return false;
        }
    },

    save: function () {
        try {
            spreadsheet.setItem('spreadsheet.records', spreadsheet.records);
            utility.log(1, "spreadsheet.save", spreadsheet.records);
            return true;
        } catch (err) {
            utility.error("ERROR in spreadsheet.save: " + err);
            return false;
        }
    },

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
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
                if (spreadsheet.records[tempIt]['attack'] !== null && spreadsheet.records[tempIt]['attack'] !== undefined && spreadsheet.records[tempIt]['defense'] !== null && spreadsheet.records[tempIt]['defense'] !== undefined) {
                    titleStr += ", " + spreadsheet.records[tempIt]['attack'] + "atk," + spreadsheet.records[tempIt]['defense'] + "def";
                }

                if (spreadsheet.records[tempIt]['hero'] !== null && spreadsheet.records[tempIt]['hero'] !== undefined) {
                    titleStr += ", Hero: " + spreadsheet.records[tempIt]['hero'];
                    owned = general.owned(spreadsheet.records[tempIt]['hero']);
                    titleStr += " (Owned: " + owned + ")";
                    hide = (owned ? false : true);
                }

                if (spreadsheet.records[tempIt]['recipe1'] !== null && spreadsheet.records[tempIt]['recipe1'] !== undefined) {
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

                if (spreadsheet.records[tempIt]['recipe2'] !== null && spreadsheet.records[tempIt]['recipe2'] !== undefined) {
                    titleStr += ", Recipe2: " + spreadsheet.records[tempIt]['recipe2'];
                    owned = town.getCount(spreadsheet.records[tempIt]['recipe2'], spreadsheet.records[tempIt]['recipe2image']);
                    titleStr += " (Owned: " + owned + ")";
                    hide = (owned ? false : true);
                }

                if (spreadsheet.records[tempIt]['recipe3'] !== null && spreadsheet.records[tempIt]['recipe3'] !== undefined) {
                    titleStr += ", Recipe3: " + spreadsheet.records[tempIt]['recipe3'];
                    owned = town.getCount(spreadsheet.records[tempIt]['recipe3'], spreadsheet.records[tempIt]['recipe3image']);
                    titleStr += " (Owned: " + owned + ")";
                    hide = (owned ? false : true);
                }

                if (spreadsheet.records[tempIt]['recipe4'] !== null && spreadsheet.records[tempIt]['recipe4'] !== undefined) {
                    titleStr += ", Recipe4: " + spreadsheet.records[tempIt]['recipe4'];
                    owned = town.getCount(spreadsheet.records[tempIt]['recipe4'], spreadsheet.records[tempIt]['recipe4image']);
                    titleStr += " (Owned: " + owned + ")";
                    hide = (owned ? false : true);
                }

                if (spreadsheet.records[tempIt]['summon'] !== null && spreadsheet.records[tempIt]['summon'] !== undefined) {
                    titleStr += ", Summon: " + spreadsheet.records[tempIt]['summon'];
                    opacity = true;
                }

                if (spreadsheet.records[tempIt]['comment'] !== null && spreadsheet.records[tempIt]['comment'] !== undefined) {
                    titleStr += ", Comment: " + spreadsheet.records[tempIt]['comment'];
                }
            }

            return {title: titleStr, opacity: opacity, hide: hide};
        } catch (err) {
            utility.error("ERROR in spreadsheet.getTitle: " + err);
            return undefined;
        }
    },
    /*jslint sub: false */

    doTitles: function (goblin) {
        try {
            var images = $j("#app46755028429_globalContainer img");
            if (images && images.length) {
                images.each(function () {
                    var img   = $j(this),
                        div   = $j(),
                        title = '',
                        image = '',
                        style = '',
                        tMes  = {};

                    title = img.attr("title");
                    if (title) {
                        image = img.attr("src").filepart();
                        tMes = spreadsheet.getTitle(title, image);
                        if (tMes && $j.isPlainObject(tMes) && !$j.isEmptyObject(tMes) && tMes.title) {
                            img.attr("title", tMes.title);
                            if (goblin && (tMes.opacity || tMes.hide)) {
                                div = img.parent().parent();
                                style = div.attr("style");
                                if (tMes.opacity) {
                                    style += " opacity: 0.3;";
                                }

                                if (tMes.hide) {
                                    style += " display: none;";
                                }

                                div.attr("style", style);
                            }
                        }
                    }
                });
            }

            return true;
        } catch (err) {
            utility.error("ERROR in spreadsheet.doTitles: " + err);
            return false;
        }
    },

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    isSummon: function (title, image) {
        try {
            var it     = 0,
                tempIt = -1,
                summon = false;

            for (it = spreadsheet.records.length - 1; it >= 0; it -= 1) {
                if (spreadsheet.records[it]['name'] && spreadsheet.records[it]['name'] === title) {
                    tempIt = it;
                    if (spreadsheet.records[it]['image'] && spreadsheet.records[it]['image'] === image) {
                        break;
                    }
                }
            }

            if (tempIt > -1) {
                if (spreadsheet.records[tempIt]['summon'] !== null && spreadsheet.records[tempIt]['summon'] !== undefined) {
                    summon = true;
                }
            }

            return summon;
        } catch (err) {
            utility.error("ERROR in spreadsheet.isSummon: " + err);
            return undefined;
        }
    }
    /*jslint sub: false */
};
