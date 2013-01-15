/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true, sub: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,gm,hiddenVar,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,battle,conquest,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          CONQUEST OBJECT
// this is the main object for dealing with Conquest
/////////////////////////////////////////////////////////////////////

(function() {
    "use strict";

    conquest.conquestRankTier = function(points) {
        var tier = 0;

        if (points >= 50000) {
            tier = 18;
        } else if (points >= 43000) {
            tier = 17;
        } else if (points >= 37000) {
            tier = 16;
        } else if (points >= 32500) {
            tier = 15;
        } else if (points >= 27000) {
            tier = 14;
        } else if (points >= 22500) {
            tier = 13;
        } else if (points >= 19500) {
            tier = 12;
        } else if (points >= 14000) {
            tier = 11;
        } else if (points >= 10000) {
            tier = 10;
        } else if (points >= 7500) {
            tier = 9;
        } else if (points >= 5000) {
            tier = 8;
        } else if (points >= 3000) {
            tier = 7;
        } else if (points >= 2000) {
            tier = 6;
        } else if (points >= 1200) {
            tier = 5;
        } else if (points >= 700) {
            tier = 4;
        } else if (points >= 450) {
            tier = 3;
        } else if (points >= 250) {
            tier = 2;
        } else if (points >= 100) {
            tier = 1;
        }

        return tier;
    };

    conquest.conquestRankTable = {

        0: 'No Rank',
        1: 'Scout',
        2: 'Soldier',
        3: 'Elite Soldier',
        4: 'Squire',
        5: 'Night',
        6: 'First Night',
        7: 'Legionnaire',
        8: 'Centurian',
        9: 'Champion',
        10: 'Lt Commander',
        11: 'Commander',
        12: 'High Commander',
        13: 'Lieutenant General',
        14: 'General',
        15: 'High General',
        16: 'Baron',
        17: 'Earl',
        18: 'Duke'
    };

    // this function appears to have some serious bugs and really needs to be reworked!
    // it can try to click all 3 buttons, but the DOM could change after each click
    conquest.collect = function() {
        try {
            var button = caap.checkForImage("conq3_btn_collectpower_small.gif"),
                button2 = caap.checkForImage("conq3_btn_collect.gif"),
                buttonCrystal = caap.checkForImage("conq3_btn_pray.gif"),
                timeLeft;

            if ($u.hasContent(button)) {
                caap.click(button);
            }

            if ($u.hasContent(button2)) {
                con.log(1, "button exists");
                caap.click(button2);
            }

            con.log(1, "done with buttons", button, button2, buttonCrystal);
            if ($u.hasContent(buttonCrystal)) {
                caap.click(buttonCrystal);
            }

            timeLeft = $j("div[style*='conq3_mid_notop']")[0].children[0].children[0].children[2].children[0].innerHTML.match(/(\d+)/)[0];
            schedule.setItem('collectConquestTimer', timeLeft * 60 * 60);
            schedule.setItem('collectConquestCrystalTimer', timeLeft * 60 * 60);

            button = null;
            button2 = null;
            buttonCrystal = null;
        } catch (err) {
            con.error("ERROR in collect Conquest: " + err);
            return;
        }
    };

    conquest.battle = function() {
        var inputDiv = $j("div[style*='war_conquest_mid']");

        con.log(1, "in battle", inputDiv);
        inputDiv.each(function(index) {
            var rank = /\d+/.exec(inputDiv[index].children[4].children[0].children[0].title)[0],
                playerId = $j("input[name*='target_id']", inputDiv[index].children[5].children[0].children[0].children[0])[0].value,
                armySize = inputDiv[index].children[3].children[0].innerHTML,
                duelNum = battle.getItem(playerId).duelwinsNum - battle.getItem(playerId).duellossesNum,
                invadeNum = battle.getItem(playerId).invadewinsNum - battle.getItem(playerId).invadelossesNum;

            con.log(1, playerId, rank, armySize, duelNum, invadeNum);
        });

        inputDiv = null;
    };

}());
