/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                          ELITE GUARD
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    caap.checkResults_party = function () {
        try {
            if ($u.hasContent($j("#app_body input[src*='elite_guard_request.gif']"))) {
                army.eliteCheckImg();
            } else {
                army.eliteResult();
            }

            return true;
        } catch (err) {
            con.error("ERROR in checkResults_army_member: " + err);
            return false;
        }
    };

    caap.autoElite = function () {
        try {
            if (!config.getItem("EnableArmy", true) || !config.getItem('AutoElite', true) || !schedule.check('AutoEliteGetList')) {
                return false;
            }

            return army.elite();
        } catch (err) {
            con.error("ERROR in autoElite: " + err);
            return false;
        }
    };

}());
