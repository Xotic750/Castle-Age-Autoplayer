caap.demi = {
	'ambrosia' : {
		'power' : {
			'total' : 0,
			'max' : 0,
			'next' : 0
		},
		'daily' : {
			'num' : 0,
			'max' : 0,
			'dif' : 0
		}
	},
	'malekus' : {
		'power' : {
			'total' : 0,
			'max' : 0,
			'next' : 0
		},
		'daily' : {
			'num' : 0,
			'max' : 0,
			'dif' : 0
		}
	},
	'corvintheus' : {
		'power' : {
			'total' : 0,
			'max' : 0,
			'next' : 0
		},
		'daily' : {
			'num' : 0,
			'max' : 0,
			'dif' : 0
		}
	},
	'aurora' : {
		'power' : {
			'total' : 0,
			'max' : 0,
			'next' : 0
		},
		'daily' : {
			'num' : 0,
			'max' : 0,
			'dif' : 0
		}
	},
	'azeron' : {
		'power' : {
			'total' : 0,
			'max' : 0,
			'next' : 0
		},
		'daily' : {
			'num' : 0,
			'max' : 0,
			'dif' : 0
		}
	}
};
caap.demiPoints = function() {
	try {
		if(caap.stats['level'] < 9) {
			return false;
		}

		if(!config.getItem('DemiPointsFirst', false) || config.getItem('WhenMonster', 'Never') === 'Never') {
			return false;
		}

		if(schedule.check("battle")) {
			if(caap.navigateTo(caap.battlePage, 'battle_on.gif')) {
				return true;
			}
		}

		var demiPointsDone = false;
		demiPointsDone = battle.selectedDemisDone();
		state.setItem("DemiPointsDone", demiPointsDone);
		if(!demiPointsDone) {
			return caap.battle('DemiPoints');
		} else {
			return false;
		}
	} catch (err) {
		con.error("ERROR in demiPoints: " + err);
		return false;
	}
};

caap.loadDemi = function() {
	var demis = gm.getItem('demipoint.records', 'default');
	if(demis === 'default' || !$j.isPlainObject(demis)) {
		demis = gm.setItem('demipoint.records', caap.demi);
	}

	$j.extend(true, caap.demi, demis);
	con.log(4, 'Demi', caap.demi);
	session.setItem("UserDashUpdate", true);
};
caap.SaveDemi = function(src) {
	if(caap.domain.which === 3) {
		caap.messaging.setItem('caap.demi', caap.demi);
	} else {
		gm.setItem('demipoint.records', caap.demi);
		con.log(4, 'Demi', caap.demi);
		if(caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif") && src !== "caapif") {
			con.log(2, "caap.SaveDemi send");
			caap.messaging.setItem('caap.stats', caap.stats);
		}
	}

	if(caap.domain.which !== 0) {
		session.setItem("UserDashUpdate", true);
	}
};
caap.demiTable = {
	0 : 'ambrosia',
	1 : 'malekus',
	2 : 'corvintheus',
	3 : 'aurora',
	4 : 'azeron'
};
