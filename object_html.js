/////////////////////////////////////////////////////////////////////
//                          HTML TOOLS
// this object contains general methods for wading through the DOM and dealing with HTML
/////////////////////////////////////////////////////////////////////

nHtml = {
    xpath: {
        string : XPathResult.STRING_TYPE,
        unordered: XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        first : XPathResult.FIRST_ORDERED_NODE_TYPE
    },

    FindByAttrContains: function (obj, tag, attr, className, subDocument, nodeNum) {
        if (attr == "className") {
            attr = "class";
        }

        if (!subDocument) {
            subDocument = document;
        }

        if (nodeNum) {
            var p = subDocument.evaluate(".//" + tag + "[contains(translate(@" +
                attr + ",'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'" +
                className.toLowerCase() + "')]", obj, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

            if (p) {
                if (nodeNum < p.snapshotLength) {
                    return p.snapshotItem(nodeNum);
                } else if (nodeNum >= p.snapshotLength) {
                    return p.snapshotItem(p.snapshotLength - 1);
                }
            }
        } else {
            var q = subDocument.evaluate(".//" + tag + "[contains(translate(@" +
                attr + ",'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'" +
                className.toLowerCase() + "')]", obj, null, this.xpath.first, null);

            if (q && q.singleNodeValue) {
                return q.singleNodeValue;
            }
        }

        return null;
    },

    FindByAttrXPath: function (obj, tag, className, subDocument) {
        var q = null;
        var xp = ".//" + tag + "[" + className + "]";
        try {
            if (obj === null) {
                gm.log('Trying to find xpath with null obj:' + xp);
                return null;
            }

            if (!subDocument) {
                subDocument = document;
            }

            q = subDocument.evaluate(xp, obj, null, this.xpath.first, null);
        } catch (err) {
            gm.log("XPath Failed:" + xp + "," + err);
        }

        if (q && q.singleNodeValue) {
            return q.singleNodeValue;
        }

        return null;
    },

    FindByAttr: function (obj, tag, attr, className, subDocument) {
        if (className.exec === undefined) {
            if (attr == "className") {
                attr = "class";
            }

            if (!subDocument) {
                subDocument = document;
            }

            var q = subDocument.evaluate(".//" + tag + "[@" + attr + "='" + className + "']", obj, null, this.xpath.first, null);
            if (q && q.singleNodeValue) {
                return q.singleNodeValue;
            }

            return null;
        }

        var divs = obj.getElementsByTagName(tag);
        for (var d = 0; d < divs.length; d += 1) {
            var div = divs[d];
            if (className.exec !== undefined) {
                if (className.exec(div[attr])) {
                    return div;
                }
            } else if (div[attr] == className) {
                return div;
            }
        }

        return null;
    },

    FindByClassName: function (obj, tag, className) {
        return this.FindByAttr(obj, tag, "className", className);
    },

    spaceTags: {
        'td': 1,
        'br': 1,
        'hr': 1,
        'span': 1,
        'table': 1
    },

    GetText: function (obj) {
        var txt = ' ';
        if (obj.tagName !== undefined && this.spaceTags[obj.tagName.toLowerCase()]) {
            txt += " ";
        }

        if (obj.nodeName == "#text") {
            return txt + obj.textContent;
        }

        for (var o = 0; o < obj.childNodes.length; o += 1) {
            var child = obj.childNodes[o];
            txt += this.GetText(child);
        }

        return txt;
    },

    timeouts: {},

    setTimeout: function (func, millis) {
        var t = window.setTimeout(function () {
            func();
            nHtml.timeouts[t] = undefined;
        }, millis);

        this.timeouts[t] = 1;
    },

    clearTimeouts: function () {
        for (var t in this.timeouts) {
            if (this.timeouts.hasOwnProperty(t)) {
                window.clearTimeout(t);
            }
        }

        this.timeouts = {};
    },

    getX: function (path, parent, type) {
        var evaluate = null;
        switch (type) {
        case this.xpath.string :
            evaluate = document.evaluate(path, parent, null, type, null).stringValue;
            break;
        case this.xpath.first :
            evaluate = document.evaluate(path, parent, null, type, null).singleNodeValue;
            break;
        case this.xpath.unordered :
            evaluate = document.evaluate(path, parent, null, type, null);
            break;
        default :
        }

        return evaluate;
    },

    getHTMLPredicate: function (HTML) {
        for (var x = HTML.length; x > 1; x -= 1) {
            if (HTML.substr(x, 1) == '/') {
                return HTML.substr(x + 1);
            }
        }

        return HTML;
    },

    OpenInIFrame: function (url, key) {
        //if (!iframe = document.getElementById(key))
        var iframe = document.createElement("iframe");
        //gm.log ("Navigating iframe to " + url);
        iframe.setAttribute("src", url);
        iframe.setAttribute("id", key);
        iframe.setAttribute("style", "width:0;height:0;");
        document.documentElement.appendChild(iframe);
    },

    ResetIFrame: function (key) {
        var iframe = document.getElementById(key);
        if (iframe) {
            gm.log("Deleting iframe = " + key);
            iframe.parentNode.removeChild(iframe);
        } else {
            gm.log("Frame not found = " + key);
        }

        if (document.getElementById(key)) {
            gm.log("Found iframe");
        }
    },

    Gup: function (name, href) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(href);
        if (results === null) {
            return "";
        } else {
            return results[1];
        }
    },

    ScrollToBottom: function () {
        //gm.log("Scroll Height: " + document.body.scrollHeight);
        if (document.body.scrollHeight) {
            if (global.is_chrome) {
                var dh = document.body.scrollHeight;
                var ch = document.body.clientHeight;
                if (dh > ch) {
                    var moveme = dh - ch;
                    gm.log("Scrolling down by: " + moveme + "px");
                    window.scroll(0, moveme);
                    gm.log("Scrolled ok");
                } else {
                    gm.log("Not scrolling to bottom. Client height is greater than document height!");
                }
            } else {
                window.scrollBy(0, document.body.scrollHeight);
            }
        }// else if (screen.height) {}
    },

    ScrollToTop: function () {
        if (global.is_chrome) {
            gm.log("Scrolling to top");
            window.scroll(0, 0);
            gm.log("Scrolled ok");
        } else {
            window.scrollByPages(-1000);
        }
    },

    CountInstances: function (string, word) {
        var substrings = string.split(word);
        return substrings.length - 1;
    }
};
