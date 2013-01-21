/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

///////////////////////////
//       Extend jQuery
///////////////////////////

(function () {
    "use strict";

    caap.jQueryExtend = function () {
        (function (/*$*/) {

            jQuery.fn.getPercent = function (type) {
                var t = [],
					rVal;

                if (!type || type === 'width') {
                    t = this.attr("style").match(/width:\s*([\d\.]+)%/i);
                } else if (!type || type === 'height') {
                    t = this.attr("style").match(/height:\s*([\d\.]+)%/i);
                }

				rVal = (t && t.length >= 2 && t[1]) ? parseFloat(t[1]) : 0;
				t = null;
                return rVal;
            };

            jQuery.fn.justtext = function () {
                return jQuery(this).clone().children().remove().end().text();
            };

            jQuery.fn.colorInput = function (farb_callback, diag_callback) {
                var t = this,
                    v = jQuery("<div id='" + t.attr("id") + "_diag'></div>").appendTo(document.body),
                    w, x;

                v.dialog({
                    title: t.attr("id"),
                    resizable: false,
                    top: t.offset().top + 'px',
                    left: (window.innerWidth / 2) + 'px',
                    width: 'auto',
                    height: 'auto',
                    buttons: {
                        "Ok": function () {
                            v.dialog("destroy").remove();
                            if (utility.isFunction(diag_callback)) {
                                diag_callback(t.attr("id"), t.val());
                            }
                        }
                    },
                    close: function () {
                        v.dialog("destroy").remove();
                        if (utility.isFunction(diag_callback)) {
                            diag_callback(t.attr("id"), 'close');
                        }
                    }
                });

                w = jQuery("<div id='" + t.attr("id") + "_farb'></div>").appendTo(v);
                x = jQuery.farbtastic(w, function (c) {
                    c = c.toUpperCase();
                    w.css({
                        background: c,
                        color: utility.bestTextColor(c)
                    });

                    t.css({
                        background: c,
                        color: utility.bestTextColor(c)
                    });

                    t.val(c);
                    if (utility.isFunction(farb_callback)) {
                        farb_callback(c);
                    }
                }).setColor(t.val());

                return [v, w, x];
            };

            jQuery.fn.alert = function (html) {
                var w = jQuery('<div id="alert_' + Date.now() + '" title="Alert!">' + (html || '') + '</div>').appendTo(document.body);

                w.dialog({
                    buttons: {
                        "Ok": function () {
                            w.dialog("destroy").remove();
                        }
                    }
                });

                return w;
            };

            /*jslint nomen: false */
            /* Create an array with the values of all the checkboxes in a column */
            jQuery.fn.dataTableExt.afnSortData['dom-checkbox'] = function (oSettings, iColumn) {
                var aData = [];

                /*jslint nomen: true */
                jQuery('td:eq(' + iColumn + ') input', oSettings.oApi._fnGetTrNodes(oSettings)).each(function () {
                    aData.push(this.checked === true ? "1" : "0");
                });
                /*jslint nomen: false */

                return aData;
            };

            jQuery.fn.dataTableExt.afnSortData['remaining-time'] = function (oSettings, iColumn) {
                var aData = [];

                /*jslint nomen: true */
                jQuery('td:eq(' + iColumn + ')', oSettings.oApi._fnGetTrNodes(oSettings)).each(function () {
                    aData.push(jQuery(this).text().lpad("0", 9));
                });
                /*jslint nomen: false */

                return aData;
            };

            jQuery.fn.dataTableExt.afnSortData['scan-date'] = function (oSettings, iColumn) {
                var aData = [];

                /*jslint nomen: true */
                jQuery('td:eq(' + iColumn + ')', oSettings.oApi._fnGetTrNodes(oSettings)).each(function () {
                    aData.push(jQuery(this).text().split("-").reverse().join("-"));
                });
                /*jslint nomen: false */

                return aData;
            };

        }(jQuery));
    };

}());
