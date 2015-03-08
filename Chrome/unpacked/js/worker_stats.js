
/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,offline,town,gm,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,spreadsheet,ss,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          Stats OBJECT
// this is the main object for dealing with stats
/////////////////////////////////////////////////////////////////////

(function() {
    "use strict";

	worker.addRecordFunctions({name: 'statsFunc', recordIndex: 'FBID', recordsAreObj: true});

    stats.record = function (FBID) {
        this.data = {
			'FBID': FBID,
			'account': '',
			'PlayerName': '',
			'level': 0,
			'army': {
				'actual': 0,
				'capped': 0
			},
			'records': {
				'total': 0,
				'invade': 0
			},
			'attack': 0,
			'defense': 0,
			'bonus' : {
				'attack': 0,
				'defense': 0,
				'dpi' : 0,
				'api' : 0
			},
			'points': {
				'skill': 0,
				'favor': 0,
				'guild': 0
			},
			'indicators': {
				'bsi': 0,
				'lsi': 0,
				'sppl': 0,
				'api': 0,
				'dpi': 0,
				'mpi': 0,
				'mhbeq': 0,
				'htl': 0,
				'hrtl': 0,
				'enl': 0,
				'pvpclass': '',
				'build': ''
			},
			'gold': {
				'cash': 0,
				'bank': 0,
				'total': 0,
				'income': 0,
				'upkeep': 0,
				'flow': 0,
				'ticker': []
			},
			'rank': {
				'battle': 0,
				'battlePoints': 0,
				'war': 0,
				'warPoints': 0,
				'conquest': 0,
				'conquestPoints': 0,
				'conquestLevel': 0,
				'conquestLevelPercent': 0
			},
			'potions': {
				'energy': 0,
				'stamina': 0
			},
			'energy': {
				'norm': 0,
				'num': 0,
				'min': 0,
				'max': 0,
				'ticker': []
			},
			'health': {
				'norm': 0,
				'num': 0,
				'min': 0,
				'max': 0,
				'ticker': []
			},
			'stamina': {
				'norm': 0,
				'num': 0,
				'min': 0,
				'max': 0,
				'ticker': []
			},
			'lowpoints' : {
				'level' : 0,
				'stamina' : 0,
				'energy' : 0
			},
			'exp': {
				'num': 0,
				'max': 0,
				'dif': 0
			},
			'guildTokens': {
				'num': 0,
				'max': 0,
				'dif': 0
			},
			'resources': {
				'lumber': 0,
				'iron': 0
			},
			'conquest': {
				'Conqueror': 0,
				'Guardian': 0,
				'Hunter': 0,
				'Engineer': 0
			},
			'LoMland' : -1,
			'other': {
				'qc': 0,
				'bww': 0,
				'bwl': 0,
				'te': 0,
				'tee': 0,
				'wlr': 0,
				'eer': 0,
				'atlantis': false
			},
			'achievements': {
				'battle': {
					'invasions': {
						'won': 0,
						'lost': 0,
						'streak': 0,
						'ratio': 0
					},
					'duels': {
						'won': 0,
						'lost': 0,
						'streak': 0,
						'ratio': 0
					}
				},
				'monster': {},
				'other': {
					'alchemy': 0
				},
				'feats': {
					'attack': 0,
					'defense': 0,
					'health': 0,
					'energy': 0,
					'stamina': 0,
					'army': 0
				}
			},
			'character': {},
			'guild': {
				'name': '',
				'id': '',
				'ids' : [], // For your guild mates
				'level': 0,
				'levelPercent': 0,
				'mPoints': 0,
				'mRank': '',
				'bPoints': 0,
				'bRank': '',
				'members': []
			},
			'essence' : {
				'attack': 0,
				'defense' : 0,
				'damage' : 0,
				'health' : 0
			},
			'priorityGeneral' : 'Use Current'
		};
    };

	statsFunc.init = function() {
		try {
			window.stats = statsFunc.getRecord(FBID);
       } catch (err) {
            con.error("ERROR in gb.init: " + err.stack);
            return false;
        }
	};
	
	statsFunc.checkResults = function(page) {
        try {
			switch (page) {
			case 'soldiers' :
			case 'item' :
			case 'magic' :
				$j("#app_body form[id*='itemBuy'] select[name='amount']").val("5");
				schedule.setItem(page, 72 * 3600, 300);

				$j("#app_body div[style*='town_unit_bar.jpg'],div[style*='town_unit_bar_owned.jpg']").each(function() {
					var row = $j(this),
						current = new stats.record().data,
						tempDiv = $j("strong", row).eq(0),
						tStr = '';

					if ($u.hasContent(tempDiv) && tempDiv.length === 1) {
						current.name = $u.setContent(tempDiv.text(), '').trim().innerTrim();
						current.type = page == 'item' ? $u.setContent(spreadsheet.getItem(current.name).type, 'Unknown') : page.ucFirst();
					} else {
						con.warn("Unable to get item name in");
						return;
					}
					tempDiv = $j("img", row).eq(0);
					if ($u.hasContent(tempDiv) && tempDiv.length === 1) {
						current.image = $u.setContent(tempDiv.attr("src"), '').basename();
					} else {
						con.log(3, "No image found for", current.name);
					}

					tempDiv = $j("span[class='negative']", row);
					if ($u.hasContent(tempDiv) && tempDiv.length === 1) {
						current.upkeep = $u.setContent(tempDiv.text(), '0').numberOnly();
					} else {
						con.log(4, "No upkeep found for", current.name);
					}

					tStr = row.children().eq(2).text().trim().innerTrim();
					if ($u.hasContent(tStr)) {
						current.atk = $u.setContent(tStr.regex(/(\d+) Attack/), 0);
						current.def = $u.setContent(tStr.regex(/(\d+) Defense/), 0);
						current.api = (current.atk + (current.def * 0.7)).dp(2);
						current.dpi = (current.def + (current.atk * 0.7)).dp(2);
						current.mpi = ((current.api + current.dpi) / 2).dp(2);
					} else {
						con.warn("No atk/def found for", current.name);
					}

					tempDiv = $j("strong[class='gold']", row);
					if ($u.hasContent(tempDiv) && tempDiv.length === 1) {
						current.cost = $u.setContent(tempDiv.text(), '0').numberOnly();
					} else {
						con.log(4, "No cost found for", current.name);
					}

					tStr = row.children().eq(3).text().trim().innerTrim();
					if ($u.hasContent(tStr)) {
						current.owned = $u.setContent(tStr.regex(/Owned: (\d+)/), 0);
						current.hourly = current.owned * current.upkeep;
					} else {
						con.warn("No number owned found for", current.name);
					}

					stats.setRecord(current);
				});

			default :
				break;
			}
        } catch (err) {
            con.error("ERROR in stats.checkResults: " + err.stack);
            return false;
        }
    };

    stats.getCount = function(image) {
        return $u.setContent(stats.getRecord(image).owned, 0);
    };

    stats.dashboard = function() {
        try {
            /*-------------------------------------------------------------------------------------\
                Next we build the HTML to be included into the 'soldiers', 'item' and 'magic' div.
                We set our table and then build the header row.
                \-------------------------------------------------------------------------------------*/
            if (config.getItem('DBDisplay', '') === 'Town Stats' && session.getItem("townDashUpdate", true)) {
                var headers = ['Name', 'Type', 'Own', 'Atk', 'Def', 'API', 'DPI', 'MPI', 'Cost', 'Upkeep', 'Hourly'],
                    values = ['name', 'type', 'owned', 'atk', 'def', 'api', 'dpi', 'mpi', 'cost', 'upkeep', 'hourly'],
                    pp = 0,
                    i = 0,
                    it = 0,
                    len = 0,
                    len1 = 0,
                    len2 = 0,
                    str = '',
                    num = 0,
                    header = {
                        text: '',
                        color: '',
                        bgcolor: '',
                        id: '',
                        title: '',
                        width: ''
                    },
                    head = '',
                    body = '',
                    row = '';

				for (pp = 0, len1 = headers.length; pp < len1; pp += 1) {

					header = {
						text: headers[pp],
						color: '',
						id: '',
						title: '',
						width: ''
					};

					switch (headers[pp]) {
					case 'Name':
						header.width = '30%';
						break;
					case 'Type':
						header.width = '7%';
						break;
					case 'Own':
						header.width = '6%';
						break;
					case 'Atk':
						header.width = '6%';
						break;
					case 'Def':
						header.width = '6%';
						break;
					case 'API':
						header.width = '6%';
						break;
					case 'DPI':
						header.width = '6%';
						break;
					case 'MPI':
						header.width = '6%';
						break;
					case 'Cost':
						header.width = '9%';
						break;
					case 'Upkeep':
						header.width = '9%';
						break;
					case 'Hourly':
						header.width = '9%';
						break;
					default:
					}

					head += caap.makeTh(header);
				}

				head = caap.makeTr(head);
				for (it = 0, len1 = stats.records.length; it < len1; it += 1) {
					row = "";
					for (pp = 0, len2 = values.length; pp < len2; pp += 1) {

						if ($u.isNaN(stats.records[it][values[pp]]) || !$u.hasContent(stats.records[it][values[pp]])) {
							str = $u.setContent(stats.records[it][values[pp]], '');
						} else {
							num = stats.records[it][values[pp]];
							str = $u.hasContent(num) && (values[pp] === 'cost' || values[pp] === 'upkeep' || values[pp] === 'hourly') ? "$" + num.SI() : num.addCommas();
						}

						row += caap.makeTd({
							text: str,
							color: '',
							id: '',
							title: ''
						});
					}

					body += caap.makeTr(row);
				}

				$j("#caap_Town_Stats", caap.caapTopObject).html(
				$j(caap.makeTable('Town', head, body)).dataTable({
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

				session.setItem("townDashUpdate", false);
            }

            return true;
        } catch (err) {
            con.error("ERROR in stats.dashboard: " + err);
            return false;
        }
    };

}());
