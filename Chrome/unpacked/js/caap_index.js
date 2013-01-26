/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                              INDEX
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    caap.checkResults_index = function () {
        try {
            if (config.getItem('AutoGift', false)) {
                gifting.collected();
                // Check for new gifts
                // A warrior wants to join your Army!
                // Send Gifts to Friends
                if ($u.hasContent(caap.resultsText) && /Send Gifts to Friends/.test(caap.resultsText)) {
                    con.log(1, 'We have a gift waiting!');
                    state.setItem('HaveGift', true);
                }

                var time = config.getItem('CheckGiftMins', 15);
                time = time < 15 ? 15 : time;
                schedule.setItem("ajaxGiftCheck", time * 60, 300);
            }

            return true;
        } catch (err) {
            con.error("ERROR in checkResults_index: " + err);
            return false;
        }
    };

}());
