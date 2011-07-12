
//////////////////////////////////
//       Globals
//////////////////////////////////

(function () {
    var caapVersion   = "!version!",
        devVersion    = "!dev!",
        hiddenVar     = true,
        caap_timeout  = 0,
        image64       = {},
        offline       = {},
        profiles      = {},
        session       = null,
        config        = null,
        state         = null,
        css           = {},
        gm            = null,
        ss            = null,
        db            = null,
        sort          = {},
        schedule      = null,
        general       = {},
        monster       = {},
        guild_monster = {},
        //arena         = {},
        festival      = {},
        feed          = {},
        battle        = {},
        town          = {},
        spreadsheet   = {},
        gifting       = {},
        army          = {},
        caap          = {},
        con           = null,
        retryDelay    = 1000;

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    String.prototype['stripCaap'] = function () {
        return this.replace(/caap_/i, '');
    };

    String.prototype['numberOnly'] = function () {
        return parseFloat(this.replace(new RegExp("[^\\d\\.]", "g"), ''));
    };

    String.prototype['parseTimer'] = function () {
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
