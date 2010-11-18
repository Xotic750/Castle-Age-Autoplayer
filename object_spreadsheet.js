
////////////////////////////////////////////////////////////////////
//                          spreadsheet OBJECT
// this is the main object for dealing with spreadsheet items
/////////////////////////////////////////////////////////////////////

spreadsheet = {
    records: [],

    headers: [],

    record: function () {
        this.data = {
            name         : '',
            image        : '',
            type         : '',
            attack       : 0,
            defense      : 0,
            hero         : '',
            recipe1      : '',
            recipe1image : '',
            recipe2      : '',
            recipe2image : '',
            recipe3      : '',
            recipe3image : '',
            summon       : '',
            comment      : ''
        };
    },

    namespace: 'caap',

    // use these to set/get values in a way that prepends the game's name
    setItem: function (name, value) {
        try {
            var jsonStr;

            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (value === undefined || value === null) {
                throw "Value supplied is 'undefined' or 'null'! (" + value + ")";
            }

            jsonStr = JSON.stringify(value);
            if (jsonStr === undefined || jsonStr === null) {
                throw "JSON.stringify returned 'undefined' or 'null'! (" + jsonStr + ")";
            }

            if (utility.is_html5_sessionStorage) {
                window.sessionStorage.setItem(gm.namespace + "." + caap.stats.FBID + "." + name, jsonStr);
            }

            return value;
        } catch (error) {
            utility.error("ERROR in spreadsheet.setItem: " + error, arguments.callee.caller);
            return undefined;
        }
    },

    getItem: function (name, value, hidden) {
        try {
            var jsonObj;

            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (utility.is_html5_sessionStorage) {
                jsonObj = $.parseJSON(window.sessionStorage.getItem(gm.namespace + "." + caap.stats.FBID + "." + name));
                if (jsonObj === undefined || jsonObj === null) {
                    if (!hidden) {
                        utility.warn("this.getItem parseJSON returned 'undefined' or 'null' for ", name);
                    }

                    if (value !== undefined && value !== null) {
                        if (!hidden) {
                            utility.warn("this.getItem using default value ", value);
                        }

                        jsonObj = value;
                    } else {
                        throw "No default value supplied! (" + value + ")";
                    }
                }
            }

            return jsonObj;
        } catch (error) {
            utility.error("ERROR in spreadsheet.getItem: " + error, arguments.callee.caller);
            if (error.match(/Invalid JSON/)) {
                if (value !== undefined && value !== null) {
                    this.setItem(name, value);
                    return value;
                } else {
                    this.deleteItem(name);
                }
            }

            return undefined;
        }
    },

    deleteItem: function (name) {
        try {
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (utility.is_html5_sessionStorage) {
                window.sessionStorage.removeItem(gm.namespace + "." + caap.stats.FBID + "." + name);
            }

            return true;
        } catch (error) {
            utility.error("ERROR in spreadsheet.deleteItem: " + error, arguments.callee.caller);
            return false;
        }
    },

    load: function () {
        try {
            if (this.getItem('spreadsheet.records', 'default') === 'default' || !$.isArray(this.getItem('spreadsheet.records', 'default')) || !this.getItem('spreadsheet.records', 'default').length) {
                $.ajax({
                    url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20csv%20where%20url%3D'https%3A%2F%2Fspreadsheets.google.com%2Fpub%3Fkey%3D0At1LY6Vd3Bp9dFFXX2xCc0x3RjJpN1VNbER5dkVvTXc%26hl%3Den%26output%3Dcsv'&format=json",
                    dataType: "json",
                    success: function (msg) {
                        utility.log(1, "msg", msg);
                        var x         = 0,
                            lenx      = 0,
                            y         = 0,
                            leny      = 0,
                            newRecord = {};

                        for (x in msg.query.results.row[0]) {
                            if (msg.query.results.row[0].hasOwnProperty(x)) {
                                spreadsheet.headers.push((msg.query.results.row[0][x]).toLowerCase());
                            }
                        }

                        for (x = 1, lenx = msg.query.results.row.length; x < lenx; x += 1) {
                            newRecord = new spreadsheet.record().data;
                            for (y = 0, leny = spreadsheet.headers.length; y < leny; y += 1) {
                                newRecord[spreadsheet.headers[y]] = msg.query.results.row[x]["col" + y];
                            }

                            spreadsheet.records.push(newRecord);
                        }

                        spreadsheet.setItem('spreadsheet.records', spreadsheet.records);
                        utility.log(1, "spreadsheet.records", spreadsheet.records);
                    }
                });
            } else {
                this.records = this.getItem('spreadsheet.records', this.records);
                utility.log(1, "spreadsheet.records", spreadsheet.records);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in spreadsheet.load: " + err);
            return false;
        }
    },

    save: function () {
        try {
            this.setItem('spreadsheet.records', this.records);
            utility.log(1, "spreadsheet.save", this.records);
            return true;
        } catch (err) {
            utility.error("ERROR in spreadsheet.save: " + err);
            return false;
        }
    },

    getTitle: function (title, image) {
        try {
            var it = 0,
                tempIt = -1,
                titleStr = '';

            for (it = this.records.length - 1; it >= 0; it -= 1) {
                if (this.records[it].name && this.records[it].name === title) {
                    tempIt = it;
                    if (this.records[it].image && this.records[it].image === image) {
                        break;
                    }
                }
            }

            if (tempIt > -1) {
                titleStr = this.records[tempIt].name + ": " + this.records[tempIt].type;
                if (this.records[tempIt].attack !== null && this.records[tempIt].attack !== undefined && this.records[tempIt].defense !== null && this.records[tempIt].defense !== undefined) {
                    titleStr += ", " + this.records[tempIt].attack + "atk," + this.records[tempIt].defense + "def";
                }

                if (this.records[tempIt].hero !== null && this.records[tempIt].hero !== undefined) {
                    titleStr += ", Hero: " + this.records[tempIt].hero;
                    titleStr += " (Owned: " + general.owned(this.records[tempIt].hero) + ")";
                }

                if (this.records[tempIt].recipe1 !== null && this.records[tempIt].recipe1 !== undefined) {
                    titleStr += ", Recipe1: " + this.records[tempIt].recipe1;
                    if (this.records[tempIt].recipe1 === "Map of Atlantis") {
                        titleStr += " (Owned: " + caap.stats.other.atlantis + ")";
                    } else {
                        titleStr += " (Owned: " + town.getCount(this.records[tempIt].recipe1, this.records[tempIt].recipe1image) + ")";
                    }
                }

                if (this.records[tempIt].recipe2 !== null && this.records[tempIt].recipe2 !== undefined) {
                    titleStr += ", Recipe2: " + this.records[tempIt].recipe2;
                    titleStr += " (Owned: " + town.getCount(this.records[tempIt].recipe2, this.records[tempIt].recipe3image) + ")";
                }

                if (this.records[tempIt].recipe3 !== null && this.records[tempIt].recipe3 !== undefined) {
                    titleStr += ", Recipe3: " + this.records[tempIt].recipe3;
                    titleStr += " (Owned: " + town.getCount(this.records[tempIt].recipe3, this.records[tempIt].recipe3image) + ")";
                }

                if (this.records[tempIt].summon !== null && this.records[tempIt].summon !== undefined) {
                    titleStr += ", Summon: " + this.records[tempIt].summon;
                }

                if (this.records[tempIt].comment !== null && this.records[tempIt].comment !== undefined) {
                    titleStr += ", Comment: " + this.records[tempIt].comment;
                }
            }

            return titleStr;
        } catch (err) {
            utility.error("ERROR in spreadsheet.getTitle: " + err);
            return undefined;
        }
    },

    doTitles: function () {
        try {
            var images = $("#app46755028429_globalContainer img");
            if (images && images.length) {
                images.each(function () {
                    var img = $(this),
                        title = '',
                        image = '',
                        newTitle = '';

                    title = img.attr("title");
                    if (title) {
                        image = utility.getHTMLPredicate(img.attr("src"));
                        newTitle = spreadsheet.getTitle(title, image);
                        if (newTitle) {
                            img.attr("title", newTitle);
                        }
                    }
                });
            }

            return true;
        } catch (err) {
            utility.error("ERROR in spreadsheet.doTitles: " + err);
            return false;
        }
    }
};
