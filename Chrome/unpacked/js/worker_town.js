
/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,offline,town,gm,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,spreadsheet,ss,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          town OBJECT
// this is the main object for dealing with town items
/////////////////////////////////////////////////////////////////////

(function() {
    "use strict";

	worker.add('town');

	worker.addRecordFunctions('town');
	town.recordIndex = 'image';
    town.record = function () {
        this.data = {
            'image': '', 
            'name': '',
            'type': '',
            'upkeep': 0,
            'hourly': 0,
            'atk': 0,
            'def': 0,
            'owned': 0,
            'cost': 0,
            'api': 0,
            'dpi': 0,
            'mpi': 0
        };
    };

	worker.addPageCheck({page : 'soldiers'});
		
	worker.addPageCheck({page : 'item'});
		
	worker.addPageCheck({page : 'magic'});
	
	town.init = function() {
		try {
			if (gm) {
				// Should be ok to remove old record lookup after 2015/3/17 - Artifice
				gm.deleteItem('item.records');
				gm.deleteItem('magic.records');
				gm.deleteItem('soldiers.records');
			}
       } catch (err) {
            con.error("ERROR in gb.init: " + err.stack);
            return false;
        }
	};

		
	town.checkResults = function(page) {
        try {
			switch (page) {
			case 'soldiers' :
			case 'item' :
			case 'magic' :
				$j("#app_body form[id*='itemBuy'] select[name='amount']").val("5");
				schedule.setItem(page, 72 * 3600, 300);

				$j("#app_body div[style*='town_unit_bar.jpg'],div[style*='town_unit_bar_owned.jpg']").each(function() {
					var row = $j(this),
						current = new town.record().data,
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

					town.setRecord(current);
				});

			default :
				break;
			}
        } catch (err) {
            con.error("ERROR in town.checkResults: " + err.stack);
            return false;
        }
    };

    town.getCount = function(image) {
        return $u.setContent(town.getRecord(image).owned, 0);
    };

    town.dashboard = function() {
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
				for (it = 0, len1 = town.records.length; it < len1; it += 1) {
					row = "";
					for (pp = 0, len2 = values.length; pp < len2; pp += 1) {

						if ($u.isNaN(town.records[it][values[pp]]) || !$u.hasContent(town.records[it][values[pp]])) {
							str = $u.setContent(town.records[it][values[pp]], '');
						} else {
							num = town.records[it][values[pp]];
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
            con.error("ERROR in town.dashboard: " + err);
            return false;
        }
    };

}());
