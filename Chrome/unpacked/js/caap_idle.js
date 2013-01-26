/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                              IDLE
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    caap.idle = function () {
        if (config.getItem("WhenMonster", "Never") !== "Never" && config.getItem("WhenBattle", "Never") !== "Never" && session.getItem('resetselectMonster', true)) {
            con.log(4, "resetselectMonster");
            monster.select(true);
            session.setItem('resetselectMonster', false);
        }

        if (config.getItem("WhenGuildMonster", "Never") !== "Never" && session.getItem('resetselectGuildMonster', true)) {
            con.log(4, "resetselectGuildMonster");
            guild_monster.select(true);
            session.setItem('resetselectGuildMonster', false);
        }

        if (caap.doCTAs()) {
            return true;
        }

        caap.autoFillArmy();
        caap.updateDashboard();
        session.setItem('ReleaseControl', true);
        return true;
    };

}());
