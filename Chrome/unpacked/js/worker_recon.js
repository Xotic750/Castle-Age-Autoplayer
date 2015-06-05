/*jslint white: true, browser: true, devel: true, 
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,caap,config,$j,rison,battle,
$u,recon,worker,self,
schedule,con,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                              PLAYER RECON
/////////////////////////////////////////////////////////////////////

/*-------------------------------------------------------------------------------------\
									  RECON PLAYERS
recon worker holds the records for possible good targets that haven't been hit yet
\-------------------------------------------------------------------------------------*/


(function () {
    "use strict";
	worker.add({name: 'recon', recordIndex: 'userId'});

    recon.record = function(userId) {
        this.data = {
            userId: userId,
            name: '',
            rank: -1,
            warRank: -1,
			festRank: -1,
            //arenaRank: -1,
            level: 0,
            army: 0
        };
    };
	
	recon.init = function(which) {
		try {
			which = $u.setContent(which, config.getItem('battleWhich', 'Invade'));
			
			if (!$u.hasContent(recon.dashboard.tableEntries)) {
				recon.dashboard.tableEntries = battle.dashboard.tableEntries.filter( function(e) {
					return ['UserId', 'Name', 'BR', 'WR', 'FR', 'Level', 'Army', 'name'].hasIndexOf(e.name);
				});
			}
				
			var w = battle[which],
				recName = w.recon,
				records = window[w.recon].records,
				origLen = records.length;

			// Keep best 250 targets
			if (records.length > 250) {
				records = battle.filterF(records, which);
			
				records.forEach( function(r) {
					r.score = battle.scoring(r, which);
				});
				
				records.sort($u.sortBy(true, 'score'));
				
				window[w.recon].records = records.slice(0, 250);
				con.log(2, recName.ucWords() + ': Removed ' + (origLen - window[w.recon].records.length) + ' lesser targets');
				state.setItem('wsave_' + recName, true);
				state.setItem('wsave_' + recName + '_noWarning', true);
			}
			
        } catch (err) {
            con.error("ERROR in recon.init: " + err.stack);
            return false;
        }
    };
	
	recon.dashboard = {
		name: 'Recon Stats',
		inst: 'Display information about Targets that you have performed reconnaissance on',
		records: 'recon',
		buttons: ['clear'],
		tableTemplate: { width: '10%' },
		// Additional entries filled in recon.init from battle dash
	};

}());
