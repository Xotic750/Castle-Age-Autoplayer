
/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true,regexp: true, eqeqeq: true, maxlen: 512 */
/*global window,unsafeWindow,$,jQuery,GM_log,console,GM_getValue,GM_setValue,GM_xmlhttpRequest,GM_openInTab,GM_registerMenuCommand,XPathResult,GM_deleteValue,GM_listValues,GM_addStyle,localStorage,sessionStorage,rison,utility */
/*jslint maxlen: 250 */

//////////////////////////////////
//       Globals
//////////////////////////////////

var caapVersion   = "!version!",
    devVersion    = "!dev!",
    hiddenVar     = true,
    caap_timeout  = 0,
    image64       = {},
    config        = {},
    state         = {},
    css           = {},
    gm            = {},
    ss            = {},
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
