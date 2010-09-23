
////////////////////////////////////////////////////////////////////
//                          utility OBJECT
// Small functions called a lot to reduce duplicate code
/////////////////////////////////////////////////////////////////////

utility = {
    is_chrome           : navigator.userAgent.toLowerCase().indexOf('chrome') !== -1 ? true : false,

    is_firefox          : navigator.userAgent.toLowerCase().indexOf('firefox') !== -1  ? true : false,

    is_html5_storage    : ('localStorage' in window) && window.localStorage !== null,

    waitMilliSecs: 5000,

    VisitUrl: function (url, loadWaitTime) {
        try {
            this.waitMilliSecs = (loadWaitTime) ? loadWaitTime : 5000;
            window.location.href = url;
            return true;
        } catch (err) {
            this.error("ERROR in utility.VisitUrl: " + err);
            return false;
        }
    },

    Click: function (obj, loadWaitTime) {
        try {
            if (!obj) {
                throw 'Null object passed to Click';
            }

            if (this.waitingForDomLoad === false) {
                schedule.setItem('clickedOnSomething', 0);
                this.waitingForDomLoad = true;
            }

            this.waitMilliSecs = (loadWaitTime) ? loadWaitTime : 5000;
            var evt = document.createEvent("MouseEvents");
            evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            /*
            Return Value: boolean
            The return value of dispatchEvent indicates whether any of the listeners
            which handled the event called preventDefault. If preventDefault was called
            the value is false, else the value is true.
            */
            return !obj.dispatchEvent(evt);
        } catch (err) {
            this.error("ERROR in utility.Click: " + err);
            return undefined;
        }
    },

    ClickAjax: function (link, loadWaitTime) {
        try {
            if (!link) {
                throw 'No link passed to Click Ajax';
            }

            if (state.getItem('clickUrl', '').indexOf(link) < 0) {
                state.setItem('clickUrl', 'http://apps.facebook.com/castle_age/' + link);
                this.waitingForDomLoad = false;
            }

            return this.VisitUrl("javascript:void(a46755028429_ajaxLinkSend('globalContainer', '" + link + "'))", loadWaitTime);
        } catch (err) {
            this.error("ERROR in utility.ClickAjax: " + err);
            return false;
        }
    },

    oneMinuteUpdate: function (funcName) {
        try {
            if (!state.getItem('reset' + funcName) && !schedule.check(funcName + 'Timer')) {
                return false;
            }

            schedule.setItem(funcName + 'Timer', 60);
            state.setItem('reset' + funcName, false);
            return true;
        } catch (err) {
            this.error("ERROR in utility.oneMinuteUpdate: " + err);
            return false;
        }
    },

    NavigateTo: function (pathToPage, imageOnPage) {
        try {
            var content   = document.getElementById('content'),
                pathList  = [],
                s         = 0,
                a         = null,
                imageTest = '',
                input     = null,
                img       = null;

            if (!content) {
                this.warn('No content to Navigate to', imageOnPage, pathToPage);
                return false;
            }

            if (imageOnPage && this.CheckForImage(imageOnPage)) {
                return false;
            }

            pathList = pathToPage.split(",");
            for (s = pathList.length - 1; s >= 0; s -= 1) {
                a = nHtml.FindByAttrXPath(content, 'a', "contains(@href,'/" + pathList[s] + ".php') and not(contains(@href,'" + pathList[s] + ".php?'))");
                if (a) {
                    this.log(1, 'Go to', pathList[s]);
                    //state.setItem('clickUrl', 'http://apps.facebook.com/castle_age/' + pathList[s] + '.php');
                    this.Click(a);
                    return true;
                }

                imageTest = pathList[s];
                if (imageTest.indexOf(".") === -1) {
                    imageTest = imageTest + '.';
                }

                input = nHtml.FindByAttrContains(document.body, "input", "src", imageTest);
                if (input) {
                    this.log(2, 'Click on image', input.src.match(/[\w.]+$/));
                    this.Click(input);
                    return true;
                }

                img = nHtml.FindByAttrContains(document.body, "img", "src", imageTest);
                if (img) {
                    this.log(2, 'Click on image', img.src.match(/[\w.]+$/));
                    this.Click(img);
                    return true;
                }
            }

            this.warn('Unable to Navigate to', imageOnPage, pathToPage);
            return false;
        } catch (err) {
            this.error("ERROR in utility.NavigateTo: " + err, imageOnPage, pathToPage);
            return false;
        }
    },

    CheckForImage: function (image, webSlice, subDocument, nodeNum) {
        try {
            var traverse   = '',
                imageSlice = null;

            if (!webSlice) {
                if (!subDocument) {
                    webSlice = document.body;
                } else {
                    webSlice = subDocument.body;
                }
            }

            if (nodeNum) {
                traverse = ":eq(" + nodeNum + ")";
            } else {
                traverse = ":first";
            }

            imageSlice = $(webSlice).find("input[src*='" + image + "']" + traverse);
            if (!imageSlice.length) {
                imageSlice = $(webSlice).find("img[src*='" + image + "']" + traverse);
                if (!imageSlice.length) {
                    imageSlice = $(webSlice).find("div[style*='" + image + "']" + traverse);
                }
            }

            return (imageSlice.length ? imageSlice.get(0) : null);
        } catch (err) {
            this.error("ERROR in utility.CheckForImage: " + err);
            return null;
        }
    },

    NumberOnly: function (num) {
        try {
            return parseFloat(num.toString().replace(new RegExp("[^0-9\\.]", "g"), ''));
        } catch (err) {
            this.error("ERROR in utility.NumberOnly: " + err);
            return undefined;
        }
    },

    RemoveHtmlJunk: function (html) {
        try {
            return html.replace(new RegExp("\\&[^;]+;", "g"), '');
        } catch (err) {
            this.error("ERROR in utility.RemoveHtmlJunk: " + err);
            return undefined;
        }
    },

    typeOf: function (obj) {
        try {
            var s = typeof obj;

            if (s === 'object') {
                if (obj) {
                    if (obj instanceof Array) {
                        s = 'array';
                    }
                } else {
                    s = 'null';
                }
            }

            return s;
        } catch (err) {
            this.error("ERROR in utility.typeOf: " + err);
            return false;
        }
    },

    isInt: function (value) {
        try {
            var y = parseInt(value, 10);
            if (isNaN(y)) {
                return false;
            }

            return value === y && value.toString() === y.toString();
        } catch (err) {
            this.error("ERROR in utility.isInt: " + err);
            return false;
        }
    },

    alert_id: 0,

    alert: function (message) {
        try {
            this.alert_id += 1;
            var id = this.alert_id;
            $('<div id="alert_' + id + '" title="Alert!"><p>' + message + '</p></div>').appendTo(document.body);
            $("#alert_" + id).dialog({
                buttons: {
                    "Ok": function () {
                        $(this).dialog("close");
                    }
                }
            });

            return true;
        } catch (err) {
            this.error("ERROR in utility.alert: " + err);
            return false;
        }
    },

    logLevel: 1,

    log: function (level, text) {
        if (console.log !== undefined) {
            if (this.logLevel && !isNaN(level) && this.logLevel >= level) {
                var message = 'v' + caapVersion + ' (' + (new Date()).toLocaleTimeString() + ') : ' + text;
                if (arguments.length > 2) {
                    console.log(message, Array.prototype.slice.call(arguments, 2));
                } else {
                    console.log(message);
                }
            }
        }
    },

    warn: function (text) {
        if (console.warn !== undefined) {
            var message = 'v' + caapVersion + ' (' + (new Date()).toLocaleTimeString() + ') : ' + text;
            if (arguments.length > 1) {
                console.warn(message, Array.prototype.slice.call(arguments, 1));
            } else {
                console.warn(message);
            }
        } else {
            if (arguments.length > 1) {
                this.log(1, text, Array.prototype.slice.call(arguments, 1));
            } else {
                this.log(1, text);
            }
        }
    },

    error: function (text) {
        if (console.error !== undefined) {
            var message = 'v' + caapVersion + ' (' + (new Date()).toLocaleTimeString() + ') : ' + text;
            if (arguments.length > 1) {
                console.error(message, Array.prototype.slice.call(arguments, 1));
            } else {
                console.error(message);
            }
        } else {
            if (arguments.length > 1) {
                this.log(1, text, Array.prototype.slice.call(arguments, 1));
            } else {
                this.log(1, text);
            }
        }
    },

    timeouts: {},

    setTimeout: function (func, millis) {
        try {
            var t = window.setTimeout(function () {
                func();
                utility.timeouts[t] = undefined;
            }, millis);

            this.timeouts[t] = 1;
            return true;
        } catch (err) {
            this.error("ERROR in utility.setTimeout: " + err);
            return false;
        }
    },

    clearTimeouts: function () {
        try {
            for (var t in this.timeouts) {
                if (this.timeouts.hasOwnProperty(t)) {
                    window.clearTimeout(t);
                }
            }

            this.timeouts = {};
            return true;
        } catch (err) {
            this.error("ERROR in utility.clearTimeouts: " + err);
            return false;
        }
    },

    getHTMLPredicate: function (HTML) {
        try {
            for (var x = HTML.length; x > 1; x -= 1) {
                if (HTML.substr(x, 1) === '/') {
                    return HTML.substr(x + 1);
                }
            }

            return HTML;
        } catch (err) {
            this.error("ERROR in utility.getHTMLPredicate: " + err);
            return false;
        }
    }
};
