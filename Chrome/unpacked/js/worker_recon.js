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
	
    recon.dashboard = function() {
        try {
            var headers = [],
                values = [],
                pp = 0,
                i = 0,
                userIdLink = '',
                userIdLinkInstructions = '',
                len = 0,
                data = {
                    text: '',
                    color: '',
                    bgcolor: '',
                    id: '',
                    title: ''
                },
                handler = null,
                head = '',
                body = '',
                row = '';

            /*-------------------------------------------------------------------------------------\
            Next we build the HTML to be included into the 'caap_infoTargets1' div. We set our
            table and then build the header row.
            \-------------------------------------------------------------------------------------*/
            if (config.getItem('DBDisplay', '') === 'Target List' && session.getItem("ReconDashUpdate", true)) {
                head = "";
                body = "";
                headers = ['UserId', 'Name', 'Deity', 'BR#', 'Arena#',
                'WR#', 'Level', 'Army'];
                values = ['userId', 'name', 'deity', 'rank', 'arenaRank',
                'warRank', 'level', 'army'];
                for (pp = 0; pp < headers.length; pp += 1) {
                    switch (headers[pp]) {
                        case 'UserId':
                            head += caap.makeTh({
                                text: headers[pp],
                                width: '16%'
                            });

                            break;
                        case 'Name':
                            head += caap.makeTh({
                                text: headers[pp],
                                width: '25%'
                            });

                            break;
                        case 'Deity':
                            head += caap.makeTh({
                                text: headers[pp],
                                width: '12%'
                            });

                            break;
                        case 'BR#':
                            head += caap.makeTh({
                                text: headers[pp],
                                width: '7%'
                            });

                            break;
                        case 'arena#':
                            head += caap.makeTh({
                                text : headers[pp],
                                width : '7%'
                            });

                            break;
                        case 'WR#':
                            head += caap.makeTh({
                                text: headers[pp],
                                width: '7%'
                            });

                            break;
                        case 'Level':
                            head += caap.makeTh({
                                text: headers[pp],
                                width: '7%'
                            });

                            break;
                        case 'Army':
                            head += caap.makeTh({
                                text: headers[pp],
                                width: '7%'
                            });

                            break;
                        case 'Last Alive':
                            head += caap.makeTh({
                                text: headers[pp],
                                width: '12%'
                            });

                            break;
                        default:
							break;
                    }
                }

                head = caap.makeTr(head);
                for (i = 0, len = recon.records.length; i < len; i += 1) {
                    row = "";
                    for (pp = 0; pp < values.length; pp += 1) {
                        switch (values[pp]) {
                            case 'userId':
                                userIdLinkInstructions = "Clicking this link will take you to the user keep of " + recon.records[i][values[pp]];
                                userIdLink = "keep.php?casuser=" + recon.records[i][values[pp]];
                                data = {
                                    text: '<span id="caap_targetrecon_' + i + '" title="' + userIdLinkInstructions + '" rlink="' + userIdLink +
                                        '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + recon.records[i][values[pp]] + '</span>',
                                    color: 'blue'
                                };

                                row += caap.makeTd(data);

                                break;
                            case 'deityNum':
                                row += caap.makeTd({
                                    text: caap.demiTable[recon.records[i][values[pp]]].ucFirst()
                                });

                                break;
                            case 'rankNum':
                                row += caap.makeTd({
                                    text: recon.records[i][values[pp]],
                                    title: battle.battleRankTable[recon.records[i][values[pp]]]
                                });

                                break;
                            case 'arenaRankNum':
                                row += caap.makeTd({
                                    text : recon.records[i][values[pp]],
                                    title : battle.battleRankTable[recon.records[i][values[pp]]]
                                });

                                break;
                            case 'warRankNum':
                                row += caap.makeTd({
                                    text: recon.records[i][values[pp]],
                                    title: battle.warRankTable[recon.records[i][values[pp]]]
                                });

                                break;
                            case 'aliveTime':
                                data = {
                                    text: $u.makeTime(recon.records[i][values[pp]], "d M H:i")
                                };

                                row += caap.makeTd(data);

                                break;
                            default:
                                row += caap.makeTd({
                                    text: recon.records[i][values[pp]]
                                });
                        }
                    }

                    body += caap.makeTr(row);
                }

                $j("#caap_infoTargets1", caap.caapTopObject).html($j(caap.makeTable("recon", head, body)).dataTable({
                    "bAutoWidth": false,
                    "bFilter": false,
                    "bJQueryUI": false,
                    "bInfo": false,
                    "bLengthChange": false,
                    "bPaginate": false,
                    "bProcessing": false,
                    "bStateSave": true,
                    "bSortClasses": false
                }));

                handler = function (e) {
                    var visitUserIdLink = {
                            rlink: '',
                            arlink: ''
                        },
                        i = 0,
                        len = 0;

                    for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                        if (e.target.attributes[i].nodeName === 'rlink') {
                            visitUserIdLink.rlink = e.target.attributes[i].nodeValue;
                            visitUserIdLink.arlink = visitUserIdLink.rlink;
                        }
                    }

                    caap.ajaxLink(visitUserIdLink.arlink);
                };

                $j("span[id*='caap_targetrecon_']", caap.caapTopObject).off('click', handler).click(handler);
                session.setItem("ReconDashUpdate", false);
            }
            return true;
        } catch (err) {
            con.error("ERROR in stats.dashboard: " + err);
            return false;
        }
    };

}());
