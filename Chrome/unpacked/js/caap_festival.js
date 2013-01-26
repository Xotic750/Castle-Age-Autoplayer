/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,festival,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                          FESTIVAL
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    caap.checkResults_festival_battle_home = function () {
        try {
            return festival.checkResults_festival_battle_home();
        } catch (err) {
            con.error("ERROR in checkResults_festival_battle_home: " + err);
            return false;
        }
    };

    caap.checkResults_festival_guild_battle = function () {
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
    caap.festivalReview = function () {
        try {
            return festival.review();
        } catch (err) {
            con.error("ERROR in festivalReview: " + err);
            return false;
        }
    };

    caap.festival = function () {
        try {
            return festival.festival();
        } catch (err) {
            con.error("ERROR in festival: " + err);
            return false;
        }
    };

}());
