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

    caap.checkResults_guildv2_battle = function() {
        try {
            con.log(2, "Guild Battle entry screen");
			if (!$u.hasContent(caap.checkForImage('sort_btn_startbattle.gif'))) {
				con.log(2, "No start guild button available");
				guild_battle.startButtonCheck = Date.now();
			}
/*            var tempDiv = $j("img[src*='guild_symbol']");

            if (tempDiv && tempDiv.length) {
                tempDiv.each(function() {
                    con.log(5, "button", $j(this).parent().parent().parent().next().find("input[src*='guild_battle_']"));
                });
            } else {
                tempDiv = null;
                return false;
            }

            tempDiv = null;
            return true;
*/        } catch (err) {
            con.error("ERROR in checkResults_guild_current_battles: " + err);
            return false;
        }
    };

    caap.checkResults_guild_battle = function() {
        try {
            con.log(2, "Guild Battle battle screen");
/*            var tempDiv = $j("img[src*='guild_symbol']");

            if (tempDiv && tempDiv.length) {
                tempDiv.each(function() {
                    con.log(5, "button", $j(this).parent().parent().parent().next().find("input[src*='guild_battle_']"));
                });
            } else {
                tempDiv = null;
                return false;
            }

            tempDiv = null;
            return true;
*/        } catch (err) {
            con.error("ERROR in checkResults_guild_current_battles: " + err);
            return false;
        }
    };

}());
