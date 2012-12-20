    ////////////////////////////////////////////////////////////////////
    //                          CONQUEST OBJECT
    // this is the main object for dealing with Conquest
    /////////////////////////////////////////////////////////////////////

    conquest = {
            collect: function () {
                try {
                    if((!config.getItem('doConquestCollect', false) || !schedule.check('collectConquestTimer')) && (!config.getItem('doConquestCrystalCollect', false) || !schedule.check('collectConquestCrystalTimer'))) {
                        return false;
                    }

                    var button = caap.checkForImage("conq3_btn_collectpower.gif");     //this is a guess
                    var button2 = caap.checkForImage("conq3_btn_collect.gif");
                    var buttonCrystal = caap.checkForImage("conq3_btn_pray.gif");

                    if ($u.hasContent(button)) {
                        caap.click(button);
                    } else if ($u.hasContent(button2)) {
                        caap.click(button2);
                    }
    //                schedule.setItem('collectConquestTimer', 24 * 60 * 60);
                    if ($u.hasContent(buttonCrystal)) {
                        caap.click(buttonCrystal);
                    }
    /*
    con.log (1, "time", $j("div[style*='conq3_mid_notop']").eq(0).eq(0).eq(2).eq(0));
    con.log (1, "time", $j("div[style*='conq3_mid_notop']").eq(0).eq(0).eq(0).eq(0), $j("div[style*='conq3_mid_notop']").eq(0).eq(0).eq(0).eq(0).eq(0).text());
    var timeLeft = $j("div[style*='conq3_mid_notop']").eq(0).eq(0).eq(0).eq(0).eq(0).text();
    schedule.setItem('collectConquestTimer', timeLeft * 60 * 60);
    */
                } catch (err) {
                    con.error("ERROR in collect Conquest: " + err);
                    return false;
                }
            },

        crystal: function () {
            try {
                if((!config.getItem('doConquestCrystalCollect1', false) || !schedule.check('collectConquestCrystal1Timer')) && (!config.getItem('doConquestCrystalCollect2', false) || !schedule.check('collectConquestCrystal2Timer'))) {
                    return false;
                }
                //var tributeMessage = $j("div[style*='cassandra_main']")[0].children[1].children[2].children[3].innerHTML.trim();
                //if (tributeMessage === 'PAY TRIBUTE!') {
                    var button = caap.checkForImage("conq3_btn_pray.gif");
                    if ($u.hasContent(button)) {
                        caap.click(button);
                        config.setItem('doConquestCrystalCollect', false);
                        //Not going to reset the timer, it will get set on the next pass
                    }
                else {
                    if (schedule.check('collectConquestCrystal1Timer')) {
                        schedule.setItem('collectConquestCrystal1Timer', tributeMessage.match(/\d*/)[0] * 60 * 60);
                    } else {
                        schedule.setItem('collectConquestCrystal2Timer', tributeMessage.match(/\d*/)[0] * 60 * 60);
                    }
                }
            } catch (err) {
                con.error("ERROR in Conquest Crystal: " + err);
                return false;
            }
        },
        battle: function () {
            var inputDiv = $j("div[style*='war_conquest_mid']");
            con.log (1, "in battle", inputDiv);
            inputDiv.each(function (index) {
                var rank = /\d+/.exec(inputDiv[index].children[4].children[0].children[0].title)[0];
                var playerId = $j("input[name*='target_id']", inputDiv[index].children[5].children[0].children[0].children[0])[0].value;
                var armySize = inputDiv[index].children[3].children[0].innerHTML;
                var duelNum = battle.getItem(playerId).duelwinsNum - battle.getItem(playerId).duellossesNum;
                var invadeNum = battle.getItem(playerId).invadewinsNum - battle.getItem(playerId).invadelossesNum;
                con.log (1, playerId, rank, armySize, duelNum, invadeNum);
            });
        }
    };
