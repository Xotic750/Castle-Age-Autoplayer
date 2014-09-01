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
			return guild_battle.onTop(guild_battle.gf.guild_battle);
		} catch (err) {
            con.error("ERROR in caap.checkResults_guildv2_battle: " + err);
            return false;
        }
    };

    caap.checkResults_guild_battle = function() {
        try {
            con.log(2, "Guild Battle battle screen");
			guild_battle.onBattle(guild_battle.gf.guild_battle);
        } catch (err) {
            con.error("ERROR in caap.checkResults_guild_battle: " + err);
            return false;
        }
    };

    caap.checkResults_tenxten_gb_formation = function() {
        try {
            con.log(2, "10X10 battle screen");
			//guild_battle.onBattle(guild_battle.gf.guild_battle);
        } catch (err) {
            con.error("ERROR in caap.checkResults_guild_battle: " + err);
            return false;
        }
    };

    caap.guild_battle = function() {
        try {
			if (guild_battle.path) {
				con.log(2, "Guild Battle path", guild_battle.path);
			} else {
				con.log(2, "Guild Battle no work to do");
			}
        } catch (err) {
            con.error("ERROR in caap.guild_battle: " + err);
            return false;
        }
    };

}());
