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
                caap.messaging.setItem('stats', stats);
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
