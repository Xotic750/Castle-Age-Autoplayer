/////////////////////////////////////////////////////////////////////
//                          FESTIVAL
/////////////////////////////////////////////////////////////////////

caap.checkResults_festival_battle_home = function() {
	try {
		return festival.checkResults_festival_battle_home();
	} catch (err) {
		con.error("ERROR in checkResults_festival_battle_home: " + err);
		return false;
	}
};
caap.checkResults_festival_guild_battle = function() {
	try {
		return festival.checkResults_festival_guild_battle();
	} catch (err) {
		con.error("ERROR in checkResults_festival_guild_battle: " + err);
		return false;
	}
};
/*-------------------------------------------------------------------------------------\
 FestivalReview is a primary action subroutine to mange the Festival on the dashboard
 \-------------------------------------------------------------------------------------*/
caap.festivalReview = function() {
	try {
		return festival.review();
	} catch (err) {
		con.error("ERROR in festivalReview: " + err);
		return false;
	}
};
caap.festival = function() {
	try {
		return festival.festival();
	} catch (err) {
		con.error("ERROR in festival: " + err);
		return false;
	}
};
