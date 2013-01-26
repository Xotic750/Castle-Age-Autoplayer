/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
festival,feed,battle,town,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,gm,hiddenVar,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                          GUILD BATTLES
/////////////////////////////////////////////////////////////////////

(function() {
    "use strict";

    caap.checkResults_guild_current_battles = function() {
        try {
            var tempDiv = $j("img[src*='guild_symbol']");

            if (tempDiv && tempDiv.length) {
                tempDiv.each(function() {
                    con.log(5, "name", $j(this).parent().parent().next().text().trim());
                    con.log(5, "button", $j(this).parent().parent().parent().next().find("input[src*='guild_battle_']"));
                });
            } else {
                tempDiv = null;
                return false;
            }

            tempDiv = null;
            return true;
        } catch (err) {
            con.error("ERROR in checkResults_guild_current_battles: " + err);
            return false;
        }
    };

}());
