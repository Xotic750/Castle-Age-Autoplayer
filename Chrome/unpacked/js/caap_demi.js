/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,battle,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,gm,hiddenVar,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

(function () {
    "use strict";

    caap.demi = {
        'ambrosia': {
            'power': {
                'total': 0,
                'max': 0,
                'next': 0
            },
            'daily': {
                'num': 0,
                'max': 0,
                'dif': 0
            }
        },
        'malekus': {
            'power': {
                'total': 0,
                'max': 0,
                'next': 0
            },
            'daily': {
                'num': 0,
                'max': 0,
                'dif': 0
            }
        },
        'corvintheus': {
            'power': {
                'total': 0,
                'max': 0,
                'next': 0
            },
            'daily': {
                'num': 0,
                'max': 0,
                'dif': 0
            }
        },
        'aurora': {
            'power': {
                'total': 0,
                'max': 0,
                'next': 0
            },
            'daily': {
                'num': 0,
                'max': 0,
                'dif': 0
            }
        },
        'azeron': {
            'power': {
                'total': 0,
                'max': 0,
                'next': 0
            },
            'daily': {
                'num': 0,
                'max': 0,
                'dif': 0
            }
        }
    };

    caap.demiPoints = function () {
        try {
            if (caap.stats.level < 9) {
                return false;
            }

            if (!config.getItem('DemiPointsFirst', false) || config.getItem('WhenMonster', 'Never') === 'Never') {
                return false;
            }

            if (schedule.check("battle")) {
                if (caap.navigateTo(caap.battlePage, 'battle_tab_battle_on.jpg')) {
                    return true;
                }
            }

            var demiPointsDone = false;
            demiPointsDone = battle.selectedDemisDone();
            state.setItem("DemiPointsDone", demiPointsDone);
            if (demiPointsDone) {
                return false;
            }

            return caap.battle('DemiPoints');
        } catch (err) {
            con.error("ERROR in demiPoints: " + err);
            return false;
        }
    };

    caap.loadDemi = function () {
        var demis = gm.getItem('demipoint.records', 'default');
        if (demis === 'default' || !$j.isPlainObject(demis)) {
            demis = gm.setItem('demipoint.records', caap.demi);
        }

        $j.extend(true, caap.demi, demis);
        con.log(4, 'Demi', caap.demi);
        session.setItem("UserDashUpdate", true);
    };

    caap.SaveDemi = function (src) {
        if (caap.domain.which === 3) {
            caap.messaging.setItem('caap.demi', caap.demi);
        } else {
            gm.setItem('demipoint.records', caap.demi);
            con.log(4, 'Demi', caap.demi);
            if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif") && src !== "caapif") {
                con.log(2, "caap.SaveDemi send");
                caap.messaging.setItem('caap.stats', caap.stats);
            }
        }

        if (caap.domain.which !== 0) {
            session.setItem("UserDashUpdate", true);
        }
    };

    caap.demiTable = {
        0: 'ambrosia',
        1: 'malekus',
        2: 'corvintheus',
        3: 'aurora',
        4: 'azeron'
    };

}());
