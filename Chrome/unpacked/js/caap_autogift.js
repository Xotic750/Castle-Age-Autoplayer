/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                              AUTOGIFT
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    caap.checkResults_gift_accept = function () {
        return true;
    };

    caap.ajaxGiftCheck = function () {
        try {
            if (/*config.getItem('bookmarkMode', false) ||*/ !config.getItem('AutoGift', false) || !schedule.check("ajaxGiftCheck")) {
                return false;
            }

            return gifting.ajaxGiftCheck();
        } catch (err) {
            con.error("ERROR in AjaxGiftCheck: " + err);
            return false;
        }
    };

    caap.autoGift = function () {
        try {
            if (caap.checkAutoIncome(3) || caap.inLevelUpMode() || /*config.getItem('bookmarkMode', false) ||*/ !config.getItem('AutoGift', false)) {
                return false;
            }

            return gifting.run();
        } catch (err) {
            con.error("ERROR in autoGift: " + err);
            return false;
        }
    };

}());
