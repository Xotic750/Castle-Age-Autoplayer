
/*jslint white: true, browser: true, devel: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,offline,town,gm,
$u,chrome,worker,self,caap,config,con,spreadsheet,ss,
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
			'item': '',
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

	worker.addPageCheck({page : 'soldiers', config: 'itemIventory'});
		
	worker.addPageCheck({page : 'item', config: 'itemIventory'});
		
	worker.addPageCheck({page : 'magic', config: 'itemIventory'});
	
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
				break;

			default :
				break;
			}
        } catch (err) {
            con.error("ERROR in town.checkResults: " + err.stack);
            return false;
        }
    };

    town.getCount = function(image) {
        return $u.isString(image) ? $u.setContent(town.getRecord(image).owned, 0) : 0;
    };

	town.dashboard = {
		name: 'Items',
		inst: 'Display information about items and solders',
		records: 'town',
		tableEntries: [
			{name: 'Name'},
			{name: 'Type'},
			{name: 'Own', value: 'owned'},
			{name: 'Atk'},
			{name: 'Def'},
			{name: 'API'},
			{name: 'DPI'},
			{name: 'MPI'},
			{name: 'Cost', format: '$SI'},
			{name: 'Upkeep', format: '$SI'},
			{name: 'Hourly', format: '$SI'}
		]
	};

}());
