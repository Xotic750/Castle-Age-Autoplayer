/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                          PASSIVE GENERALS
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    caap.passiveGeneral = function () {
        try {
            if (config.getItem('IdleGeneral', 'Use Current') !== 'Use Current') {
                if (general.Select('IdleGeneral')) {
                    return true;
                }
            }

            return false;
        } catch (err) {
            con.error("ERROR in passiveGeneral: " + err);
            return false;
        }
    };

}());
