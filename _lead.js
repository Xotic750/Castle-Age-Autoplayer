
/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true, eqeqeq: true, newcap: true */
/*global window,jQuery,GM_xmlhttpRequest,GM_openInTab,GM_registerMenuCommand,rison,utility,$u */
/*jslint maxlen: 512 */

//////////////////////////////////
//       Globals
//////////////////////////////////
(function () {
    var caapVersion   = "!version!",
        devVersion    = "!dev!",
        hiddenVar     = true,
        caap_timeout  = 0,
        image64       = {},
        config        = {},
        state         = {},
        css           = {},
        gm            = null,
        ss            = null,
        sort          = {},
        schedule      = {},
        general       = {},
        monster       = {},
        guild_monster = {},
        //arena         = {},
        battle        = {},
        town          = {},
        spreadsheet   = {},
        gifting       = {},
        army          = {},
        caap          = {},
        $j            = {};

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    String.prototype['stripCaap'] = String.prototype.stripCaap = function () {
        return this.replace(/caap_/i, '');
    };

    String.prototype['numberOnly'] = String.prototype.numberOnly = function () {
        return parseFloat(this.replace(new RegExp("[^\\d\\.]", "g"), ''));
    };

    String.prototype['parseTimer'] = String.prototype.parseTimer = function () {
        var a = [],
            b = 0,
            i = 0,
            l = 0;

        a = this.split(':');
        for (i = 0, l = a.length; i < l; i += 1) {
            b = b * 60 + parseInt(a[i], 10);
        }

        if (isNaN(b)) {
            b = -1;
        }

        return b;
    };
    /*jslint sub: false */
