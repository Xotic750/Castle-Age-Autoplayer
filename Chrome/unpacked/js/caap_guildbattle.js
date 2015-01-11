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
		
			var text = $u.setContent($j('#app_body #guildv2_battle_middle').text().trim().innerTrim(), ''),
				fR = guild_battle.getItem(guild_battle.gf.guild_battle);
			
			if (text.indexOf('submit the Guild for Auto-Matching') >= 0) {
				fR.state = 'Start';	
			} else if (text.indexOf('Time Remaining') >= 0) {
				fR.state = 'Active';
			} else if (text.indexOf('Auto-Match in Progress') >= 0) {
				fR.state = 'Auto-match';
			} else if (text.indexOf('JOIN NOW!') >= 0) {
				fR.state = 'Collect';
			} else {
				con.warn('Unrecognized GB status message: ' + text);
			}
			guild_battle.setrPage(fR, guild_battle.gf.guild_battle.startPath, 'review', Date.now() - 2.5 * 60 * 1000);
			fR.nextTopReview = Date.now();
			
		} catch (err) {
            con.error("ERROR in caap.checkResults_guildv2_battle: " + err.stack);
            return false;
        }
    };

    caap.checkResults_guild_battle = function() {
        try {
            //con.log(2, "Guild Battle battle screen");
			guild_battle.onBattle(guild_battle.gf.guild_battle);
        } catch (err) {
            con.error("ERROR in caap.checkResults_guild_battle: " + err.stack);
            return false;
        }
    };

    caap.checkResults_tenxten_gb_formation = function() {
        try {
			var fR = guild_battle.getItem(guild_battle.gf.tenVten);
			//con.log(1,'tenv10', !caap.hasImage('fb_guild_btn_joinbattle_small.gif'), fR.state == 'Active', fR);
            if (!caap.hasImage('fb_guild_btn_joinbattle_small.gif') && (fR.state == 'Active' || fR.state == 'Collect')) {
				fR.state = 'No battle';
			}
        } catch (err) {
            con.error("ERROR in caap.checkResults_tenxten_gb_formation: " + err.stack);
            return false;
        }
    };

    caap.checkResults_ten_battle = function() {
        try {
			//con.log(2, "10X10 battle screen");
			guild_battle.onBattle(guild_battle.gf.tenVten);
        } catch (err) {
            con.error("ERROR in caap.checkResults_ten_battle: " + err.stack);
            return false;
        }
    };

    caap.checkResults_festival_battle_home = function () {
        try {
			var fR = guild_battle.getItem(guild_battle.gf.festival);
			//caap.globalContainer.find("input[src*='battle_enter_battle']").on('click', festival.engageListener);
			fR.state = !caap.hasImage('festival_arena_enter.jpg') ? 'No battle' : fR.state;
			guild_battle.setrPage(fR, 'index', 'review', 0);
			
        } catch (err) {
            con.error("ERROR in checkResults_festival_battle_home: " + err);
            return false;
        }
    };

    caap.checkResults_festival_guild_battle = function () {
        try {
			guild_battle.onBattle(guild_battle.gf.festival);
            // return festival.checkResults_festival_guild_battle();
        } catch (err) {
            con.error("ERROR in checkResults_festival_guild_battle: " + err);
            return false;
        }
    };

}());
