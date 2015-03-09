/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                              PLAYER RECON
/////////////////////////////////////////////////////////////////////

/*-------------------------------------------------------------------------------------\
									  RECON PLAYERS
battle.reconPlayers is an idle background process that scans the battle page for viable
battle.targets that can later be attacked.
\-------------------------------------------------------------------------------------*/


(function () {
    "use strict";
	worker.add('recon');

	worker.addRecordFunctions('recon');
	recon.recordIndex = 'userId';
    recon.record = function() {
        this.data = {
            'userId': 0,
            'nameStr': '',
            'rankNum': 0,
            'warRankNum': 0,
            'levelNum': 0,
            'armyNum': 0,
            'deityNum': 0,
            'aliveTime': 0,
			'arenaRankNum' : 0
        };
    };
	
	worker.addAction({worker : 'recon', priority : -1000, description : 'Player Recon'});
	
    recon.worker = function() {
        function onError(XMLHttpRequest, textStatus, errorThrown) {
            con.error("reconPlayers", [XMLHttpRequest, textStatus, errorThrown]);
        }

        function onSuccess(data, textStatus, XMLHttpRequest) {
            battle.freshmeat("recon", [data, textStatus, XMLHttpRequest]);
        }

        try {
            if (config.getItem('WhenBattle', 'Never') === 'Never' || !config.getItem('DoPlayerRecon', false) || !schedule.check('PlayerReconTimer') || stats.stamina.num <= 0) {
                return false;
            }

            if (config.getItem("stopReconLimit", true) && recon.records.length >= config.getItem("LimitTargets", 100)) {
                schedule.setItem('PlayerReconTimer', (gm ? gm.getItem('PlayerReconRetry', 60, hiddenVar) : 60), 60);
                caap.setDivContent('idle_mess', 'Player Recon: Stop Limit');
                return false;
            }

            recon.inProgress = true;
            caap.setDivContent('idle_mess', 'Player Recon: In Progress');
            con.log(1, "Player Recon: In Progress");
            if (config.getItem('bgRecon', true)) {
                caap.ajax("battle.php", null, onError, onSuccess);
            } else {
                if (caap.navigateTo(battle.page, $j("#app_body img[src*='battle_tab_battle_on.jpg']").length ? '' : 'battle_tab_battle_on.jpg')) {
                    return true;
                }
            }

            return true;
        } catch (err) {
            con.error("ERROR in recon.worker:" + err);
            return false;
        }
    };

    recon.dashboard = function() {
        try {
            var headers = [],
                values = [],
                pp = 0,
                i = 0,
                count = 0,
                userIdLink = '',
                userIdLinkInstructions = '',
                valueCol = 'red',
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
                row = '',
                rows = [];

            /*-------------------------------------------------------------------------------------\
            Next we build the HTML to be included into the 'caap_infoTargets1' div. We set our
            table and then build the header row.
            \-------------------------------------------------------------------------------------*/
            if (config.getItem('DBDisplay', '') === 'Target List' && session.getItem("ReconDashUpdate", true)) {
                head = "";
                body = "";
                headers = ['UserId', 'Name', 'Deity', 'BR#', 'Arena#',
                'WR#', 'Level', 'Army', 'Last Alive'];
                values = ['userId', 'nameStr', 'deityNum', 'rankNum', 'arenaRankNum',
                'warRankNum', 'levelNum', 'armyNum', 'aliveTime'];
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
                    }
                }

                head = caap.makeTr(head);
                for (i = 0, len = battle.reconRecords.length; i < len; i += 1) {
                    row = "";
                    for (pp = 0; pp < values.length; pp += 1) {
                        switch (values[pp]) {
                            case 'userId':
                                userIdLinkInstructions = "Clicking this link will take you to the user keep of " + battle.reconRecords[i][values[pp]];
                                userIdLink = "keep.php?casuser=" + battle.reconRecords[i][values[pp]];
                                data = {
                                    text: '<span id="caap_targetrecon_' + i + '" title="' + userIdLinkInstructions + '" rlink="' + userIdLink +
                                        '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + battle.reconRecords[i][values[pp]] + '</span>',
                                    color: 'blue'
                                };

                                row += caap.makeTd(data);

                                break;
                            case 'deityNum':
                                row += caap.makeTd({
                                    text: caap.demiTable[battle.reconRecords[i][values[pp]]].ucFirst()
                                });

                                break;
                            case 'rankNum':
                                row += caap.makeTd({
                                    text: battle.reconRecords[i][values[pp]],
                                    title: battle.battleRankTable[battle.reconRecords[i][values[pp]]]
                                });

                                break;
                            case 'arenaRankNum':
                                row += caap.makeTd({
                                    text : battle.reconRecords[i][values[pp]],
                                    title : battle.battleRankTable[battle.reconRecords[i][values[pp]]]
                                });

                                break;
                            case 'warRankNum':
                                row += caap.makeTd({
                                    text: battle.reconRecords[i][values[pp]],
                                    title: battle.warRankTable[battle.reconRecords[i][values[pp]]]
                                });

                                break;
                            case 'aliveTime':
                                data = {
                                    text: $u.makeTime(battle.reconRecords[i][values[pp]], "d M H:i")
                                };

                                row += caap.makeTd(data);

                                break;
                            default:
                                row += caap.makeTd({
                                    text: battle.reconRecords[i][values[pp]]
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

                    caap.clickAjaxLinkSend(visitUserIdLink.arlink);
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

    recon.inProgress = false;

}());
