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
