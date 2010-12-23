
/////////////////////////////////////////////////////////////////////
//                          HTML TOOLS
// this object contains general methods for wading through the DOM and dealing with HTML
/////////////////////////////////////////////////////////////////////

nHtml = {
    xpath: {
        string    : XPathResult.STRING_TYPE,
        unordered : XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        first     : XPathResult.FIRST_ORDERED_NODE_TYPE
    },

    FindByAttrContains: function (obj, tag, attr, className, subDocument, nodeNum) {
        var p = null,
            q = null;

        if (attr === "className") {
            attr = "class";
        }

        if (!subDocument) {
            subDocument = document;
        }

        if (nodeNum) {
            p = subDocument.evaluate(".//" + tag + "[contains(translate(@" +
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
            q = subDocument.evaluate(".//" + tag + "[contains(translate(@" +
                attr + ",'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'" +
                className.toLowerCase() + "')]", obj, null, nHtml.xpath.first, null);

            if (q && q.singleNodeValue) {
                return q.singleNodeValue;
            }
        }

        return null;
    },

    FindByAttrXPath: function (obj, tag, className, subDocument) {
        var q  = null,
            xp = ".//" + tag + "[" + className + "]";

        try {
            if (obj === null) {
                utility.warn('Trying to find xpath with null obj:' + xp);
                return null;
            }

            if (!subDocument) {
                subDocument = document;
            }

            q = subDocument.evaluate(xp, obj, null, nHtml.xpath.first, null);
        } catch (err) {
            utility.error("XPath Failed:" + err, xp);
        }

        if (q && q.singleNodeValue) {
            return q.singleNodeValue;
        }

        return null;
    },

    spaceTags: {
        td    : 1,
        br    : 1,
        hr    : 1,
        span  : 1,
        table : 1
    },

    GetText: function (obj) {
        var txt   = ' ',
            o     = 0,
            len   = 0,
            child = null;

        if (obj.tagName !== undefined && nHtml.spaceTags[obj.tagName.toLowerCase()]) {
            txt += " ";
        }

        if (obj.nodeName === "#text") {
            return txt + obj.textContent;
        }

        for (o = 0, len = obj.childNodes.length; o < len; o += 1) {
            child = obj.childNodes[o];
            txt += nHtml.GetText(child);
        }

        return txt;
    }
};
