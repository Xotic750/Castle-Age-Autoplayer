/////////////////////////////////////////////////////////////////////
//                              IDLE
/////////////////////////////////////////////////////////////////////

caap.idle = function() {
	if(config.getItem("WhenMonster", "Never") !== "Never" && config.getItem("WhenBattle", "Never") !== "Never" && session.getItem('resetselectMonster', true)) {
		con.log(4, "resetselectMonster");
		monster.select(true);
		session.setItem('resetselectMonster', false);
	}

	if(config.getItem("WhenGuildMonster", "Never") !== "Never" && session.getItem('resetselectGuildMonster', true)) {
		con.log(4, "resetselectGuildMonster");
		guild_monster.select(true);
		session.setItem('resetselectGuildMonster', false);
	}

	if(caap.doCTAs()) {
		return true;
	}

	caap.autoFillArmy();
	caap.updateDashboard();
	session.setItem('ReleaseControl', true);
	return true;
};
