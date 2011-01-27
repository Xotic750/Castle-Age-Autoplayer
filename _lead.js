
/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true, eqeqeq: true, maxlen: 512 */
/*global window,jQuery,GM_xmlhttpRequest,GM_openInTab,GM_registerMenuCommand,rison,utility,$u */
/*jslint maxlen: 280 */

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
        arena         = {},
        battle        = {},
        town          = {},
        spreadsheet   = {},
        gifting       = {},
        army          = {},
        caap          = {},
        $j            = {};
