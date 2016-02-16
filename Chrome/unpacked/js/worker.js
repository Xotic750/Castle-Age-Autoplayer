/*jslint white: true, browser: true, devel: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,caap,gm,$j,con,utility,
$u,chrome,worker,self,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                         Worker
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

	window.worker = {};
	worker.list = [];
	worker.dashList = [];
	worker.dashRecords = [];
	
	worker.add = function(n) {
		var o = $u.isObject(n) ? n : {};
			
		
		o.name = $u.setContent(o.name, n);
		window[o.name] = $u.setContent(window[o.name], {});
		window[o.name].name = o.name;
		worker.list.addToList(o.name);
		if (o.recordIndex) {
			worker.addRecordFunctions(o);
		}
	};
	
	worker.recordsList = [];
	worker.addRecordFunctions = function(o) {
		try {
			o =  $u.isObject(o) ? o : {name: o};
			var wO = window[o.name]; // worker object
			worker.recordsList.addToList(o.name);
			wO.hBest = o.recordsAreObj ? 0 : 3;
			wO.recordIndex = $u.setContent(wO.recordIndex, o.recordIndex);
			
			wO.load = function() {
				var newR = new wO.record().data,
					arr = [];
				
				wO.records = gm.getItem(wO.name, 'default');
				if (!$j.isArray(wO.records)) {
					// Should be ok to remove old record lookup after completing conversion to new system - Artifice
					wO.records = gm.getItem(wO.name + '.records', 'default');
					if (!$j.isArray(wO.records)) { 
						con.warn(wO.name + ': No records found, and no old records either. Setting as blank.');
						wO.records = gm.setItem(wO.name, []);
					} else {
						con.warn(wO.name + ': Old records found and deleted.');
						wO.save();
						gm.deleteItem(wO.name + '.records');
					}
				} else {
					con.log(2, wO.name + ' records loaded', wO.records);
				}
				wO.records = wO.records.filter( function(r) {
					if ($u.isNumber(r[wO.recordIndex]) && wO.hasRecord(r[wO.recordIndex])) {
						arr.push(r[wO.recordIndex]);
						return false;
					} 
					return true;
				});
				if (arr.length) {
					con.warn(wO.name + ': Deleted number indexed record(s) for ' + arr.join(', ') + ', since conflicting with existing string record(s)');
					state.setItem('wsave_' + wO.name, true);
					arr = [];
				}
					
				wO.records.forEach( function(r, i) {
					if ($u.isNumber(r[wO.recordIndex])) {
						arr.push(r[wO.recordIndex]);
						r[wO.recordIndex] = r[wO.recordIndex].toString();
					}
					wO.records[i] = $j.extend(true, {}, newR, r);
				});
				if (arr.length) {
					con.warn(wO.name + ': Converted number indexed record(s) for ' + arr.join(', ') + ' to string record(s)');
					state.setItem('wsave_' + wO.name, true);
				}
			};

			wO.save = function(option) {
				var newR = new wO.record().data,
					undefinedKeyList = [];
					
				wO.records.forEach( function(r) {
					Object.keys(r).forEach( function(e) {
						if (!Object.keys(newR).hasIndexOf(e)) {
							undefinedKeyList = undefinedKeyList.addToList(e);
							delete r[e];
						}
					});
				});
				undefinedKeyList.removeFromList('newRecord');
				if (state.getItem('wsave_' + wO.name + '_noWarning')) {
					state.deleteItem('wsave_' + wO.name + '_noWarning');
				} else if (undefinedKeyList.length) {
					con.warn(wO.name + ' warning: Keys not in record template will be deleted: ' + undefinedKeyList.join(', '), o);
				}
				if (caap.domain.which === 3) {
					caap.messaging.setItem(wO.name, wO.records);
				} else {
					gm.setItem(wO.name, wO.records, wO.hBest, false);
					if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif") && option !== "caapif") {
						caap.messaging.setItem(wO.name, wO.records);
					}
				}

				state.deleteItem('wsave_' + wO.name);
				
				if ($u.isObject(wO.dashboard) && caap.domain.which !== 0) {
					worker.dashRecords.forEach( function(dO) {
						if (dO.records == wO.name) {
							session.setItem('DashUpdate' + dO.dash.underline(), true);
						}
					});
				}
				if (option == 'update') {
					caap.updateDashboard();
				}
				
			};
			
			wO.hasRecord = function(n) {
				return wO.records.hasObj(wO.recordIndex, n.toString());
			};

			wO.getRecord = function(n) {
				if (!$u.isString(n) && !$u.isNumber(n)) {
					con.error(wO.name + ' record index is not a number or string: ' + n);
					return false;
				}
				n = n.toString();
				var i = wO.records.getObjIndex(wO.recordIndex, n),
					r = new wO.record(n).data;
				if (i >= 0) {
					wO.records[i].newRecord = false;
					return $j.extend(true, {}, r, wO.records[i]);
				}
				r[wO.recordIndex] = n;
				r.newRecord = true;
				return r;
			};

			wO.getRecordByField = function(f, v) {
				if (!$u.isString(f) ) {
					con.error(wO.name + ' field is not string: ' + f);
					return false;
				}
				var flat = wO.records.flatten(f),
					i = -1;
				if ($u.isRegExp(v)) {
					flat.some( function(e, ii) {
						i = e.match(v) ? ii : -1;
						return i >= 0;
					});
				} else {
					i = flat.indexOf(v);
				}
				
				if (i >= 0) {
					wO.records[i].newRecord = false;
					return $j.extend(true, {}, new wO.record().data, wO.records[i]);
				}
				return false;
			};

			wO.setRecord = function(o) {
				var i = wO.records.getObjIndex(wO.recordIndex, o[wO.recordIndex].toString());
					
				o.newRecord = false;
				if (i >= 0) {
					wO.records[i] = o;
				} else {
					wO.records.push(o);
				}
				state.setItem('wsave_' + wO.name, true);
			};

			wO.getRecordVal = function(n, f, d) {
				var i = wO.records.getObjIndex(wO.recordIndex, n.toString());
				if (i == -1) {
					con.warn(wO.name.ucWords() + ' worker warning: record ' + n + ' not found');
					return d;
				}
				if (!$u.isDefined(wO.records[i][f])) {
					con.warn(wO.name.ucWords() + ' worker warning: record ' + n + ' field "' + f + '" is undefined', wO.records[i]);
					return d;
				}
				return wO.records[i][f];
			};

			wO.setRecordVal = function(r, f, v) {
				var n = ($u.isObject(r) ? r[wO.recordIndex] : r).toString(),
					i = wO.records.getObjIndex(wO.recordIndex, n),
					nr = new wO.record(n).data;

				state.setItem('wsave_' + wO.name, true);
				if (!Object.keys(nr).hasIndexOf(f)) {
					con.warn(wO.name.ucWords() + ' worker warning: field "' + f + '" not defined in record template');
				}
				if (i >= 0) {
					if ($u.isObject(r)) {
						r[f] = v;
						wO.records[i] = r;
					} else {
						wO.records[i][f] = v;
					}
					return true;
				}
				nr[wO.recordIndex] = n;
				nr[f] = v;
				wO.records.push(nr);
			};

			wO.deleteRecord = function(n) {
				var length = wO.records.length;
				wO.records = wO.records.deleteObjs(wO.recordIndex, n.toString());
				state.setItem('wsave_' + wO.name, true);
				return length - wO.records.length;
			};
        } catch (err) {
            con.error("ERROR in worker.addRecordFunctions: " + err.stack);
            return false;
        }
	};

	worker.actionsList = [];
	worker.addAction = function(o) {
		o.fName = $u.setContent(o.fName, o.worker + '.' + $u.setContent(o.functionName, 'worker'));
		o.worker = o.fName.regex(/(\w+)\./);
		o.functionName = o.fName.regex(/\.(\w+)/);
		worker.actionsList = worker.actionsList.deleteObjs('fName', o.fName);
		worker.actionsList.push(o);
	};

	worker.pagesList = [];
	worker.addPageCheck = function(o) {
		var i = worker.pagesList.getObjIndex('page', o.page);
		if (i >= 0) {
			o.hours = Math.min(o.hours, worker.pagesList[i].hours);
			worker.pagesList[i] = o;
			return;
		}
		worker.pagesList.push(o);
	};
	
	worker.deletePageCheck = function(o) {
		o = $u.isObject(o) ? o : {page : o};
		var key = Object.keys(o).shift();
		worker.pagesList = worker.pagesList.deleteObjs(key, o[key]);
	};
	
	worker.checkResults = function(r) {
		if ($u.isFunction(window[r].checkResults)) {
			window[r].checkResults(session.getItem('page'), caap.resultsText);
		}
	};
	
	worker.checkSave = function(r) {
		if (state.getItem('wsave_' + window[r].name, false)) {
			window[r].save();
		}
	};
	
}());
