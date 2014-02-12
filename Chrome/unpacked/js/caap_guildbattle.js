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
			guild_battle.pageReviewTime = Date.now();
			if ($u.hasContent(caap.checkForImage('sort_btn_startbattle.gif'))) {
				guild_battle.GBstatus = 'Start';
			} else if ($u.hasContent(caap.checkForImage('guild_battle_locked.gif'))) {
				guild_battle.GBstatus = 'Locked';
				general.priority = config.getItem('GClassOn',false) ? config.getItem('GClassGeneral','Use Current') : false;
			} else if ($u.hasContent(caap.checkForImage('sort_btn_joinbattle.gif'))) {
				if ($j('#guildv2_battle_middle').text().indexOf('Remaining')>=0) {
					guild_battle.GBstatus = 'Active';
					general.priority = config.getItem('GFightOn',false) ? config.getItem('GFightGeneral','Use Current') : false;
					con.log(4, "Battle active, so priority gen set", general.priority);
				} else {
					guild_battle.GBstatus = 'Collect';
					general.priority = false;
				}
			}

			con.log(2, "Guild battle status", guild_battle.GBstatus);
			
/*          var tempDiv = $j("img[src*='guild_symbol']");

            if (tempDiv && tempDiv.length) {
                tempDiv.each(function() {
                    con.log(5, "button", $j(this).parent().parent().parent().next().find("input[src*='guild_battle_']"));
                });
            } else {
                tempDiv = null;
                return false;
            }

            tempDiv = null;
*/            return true;
        } catch (err) {
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
