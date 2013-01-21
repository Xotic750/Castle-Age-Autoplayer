/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,gm,hiddenVar,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                              CTA
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    caap.waitAjaxCTA = false;

    caap.recordCTA = [];

    caap.loadedCTA = false;

    caap.waitLoadCTA = true;

    caap.doCTAs = function () {
        function onError() {
            caap.waitAjaxCTA = false;
        }

        function onSuccess() {
            caap.waitAjaxCTA = false;
        }

        try {
            if ((gm ? gm.getItem("ajaxCTA", false, hiddenVar) : false) || caap.waitAjaxCTA || caap.stats.stamina.num < 1 || !schedule.check('ajaxCTATimer')) {
                return false;
            }

            if (caap.waitLoadCTA) {
                $j.ajax({
                    url: caap.domain.protocol[caap.domain.ptype] +
                        "query.yahooapis.com/v1/public/yql?q=select%20*%20from%20csv%20where%20url%3D'http%3A%2F%2Fspreadsheets.google.com%2Fpub%3Fkey%3D0At1LY6Vd3Bp9dFhvYkltNVdVNlRfSzZWV0xCQXQtR3c%26hl%3Den%26output%3Dcsv'&format=json",
                    dataType: ($u.is_opera ? "jsonp" : "json"),
                    error: function () {
                        caap.loadedCTA = true;
                    },
                    success: function (msg) {
                        var rows = msg.query && msg.query.results && msg.query.results.row ? msg.query.results.row : [],
                            row = 0,
                            rowsLen = 0,
                            column = 0,
                            newRecord = {}, headers = $u.hasContent(rows) ? rows[0] : {}, headersLen = 0,
                            headersArr = [],
                            key = '';

                        for (key in headers) {
                            if (headers.hasOwnProperty(key)) {
                                headersLen = headersArr.push((headers[key]).toLowerCase());
                            }
                        }

                        for (row = 1, rowsLen = rows.length; row < rowsLen; row += 1) {
                            newRecord = {};
                            for (column = 0; column < headersLen; column += 1) {
                                if ($u.hasContent(headersArr[column])) {
                                    newRecord[headersArr[column]] = $u.setContent(rows[row]["col" + column], null);
                                }
                            }

                            caap.recordCTA.push(newRecord);
                        }

                        caap.loadedCTA = true;
                    }
                });

                caap.waitLoadCTA = false;
                return true;
            }

            if (!$u.hasContent(caap.recordCTA) || !caap.loadedCTA) {
                return false;
            }

            var count = state.getItem('ajaxCTACount', 0);
            if (count < caap.recordCTA.length) {
                caap.waitAjaxCTA = true;

                caap.ajax(caap.recordCTA[count].code.AESDecrypt(caap.namespace), null, onError, onSuccess);

                state.setItem('ajaxCTACount', count + 1);
            } else {
                caap.waitAjaxCTA = false;
                state.setItem('ajaxCTACount', 0);
                schedule.setItem('ajaxCTATimer', 10800, 300);
            }

            return true;
        } catch (err) {
            con.error("ERROR in doCTAs: " + err);
            return false;
        }
    };

}());
