/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                          AUTOINCOME
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    caap.checkAutoIncome = function (minutes) {
        try {
            return $u.hasContent(caap.stats.gold.ticker) && caap.stats.gold.ticker[0] < $u.setContent(minutes, 1);
        } catch (err) {
            con.error("ERROR in checkAutoIncome: " + err);
            return false;
        }
    };

    caap.autoIncome = function () {
        try {
            if (config.getItem("disAutoIncome", false) || (config.getItem("NoIncomeAfterLvl", true) && state.getItem('KeepLevelUpGeneral', false))) {
                return false;
            }

            if (caap.checkAutoIncome() && config.getItem('IncomeGeneral', 'Use Current') !== 'Use Current') {
                general.Select('IncomeGeneral');
                return true;
            }

            return false;
        } catch (err) {
            con.error("ERROR in autoIncome: " + err);
            return false;
        }
    };

}());
