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
			var GBorFest = '0';
		
			caap.stats.GBstatus = 'Collect';
			caap.stats.priorityGeneral = false;
			if ($u.hasContent(caap.checkForImage('sort_btn_startbattle.gif'))) {
				caap.stats.GBstatus = 'Start';
				guild_battle.deleterPage('page',GBorFest);
			} else if ($u.hasContent(caap.checkForImage('guild_battle_locked.gif'))) {
				caap.stats.GBstatus = 'Locked';
				caap.stats.priorityGeneral = config.getItem('GClassOn',false) ? config.getItem('GClassGeneral','Use Current') : false;
				guild_battle.deleterPage('page',GBorFest);
			} else if ($u.hasContent(caap.checkForImage('sort_btn_joinbattle.gif'))) {
				if ($j('#guildv2_battle_middle').text().indexOf('Remaining')>=0) {
					caap.stats.GBstatus = 'Active';
					caap.stats.priorityGeneral = config.getItem('GFightOn',false) ? config.getItem('GFightGeneral','Use Current') : false;
					con.log(4, "Battle active, so priority gen set", caap.stats.priorityGeneral);
					guild_battle.activateBattle(GBorFest);
				}
			}

			var delay = ((caap.stats.GBstatus == 'Locked') ? config.getItem('GBStartFreq',1) : config.getItem('GBCheckFreq',5)) * 60;
			schedule.setItem('pageReviewTime' + GBorFest, delay, 60);
			
			con.log(2, "Guild battle status", caap.stats.GBstatus);
			
            return true;
        } catch (err) {
            con.error("ERROR in caap.checkResults_guildv2_battle: " + err);
            return false;
        }
    };

    caap.checkResults_guild_battle = function() {
        try {
            con.log(2, "Guild Battle battle screen");
			guild_battle.onBattle(0);
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
