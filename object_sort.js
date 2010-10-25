
////////////////////////////////////////////////////////////////////
//                          sort OBJECT
// this is the main object for dealing with sort routines
/////////////////////////////////////////////////////////////////////

sort = {
    name : function (a, b) {
        var A = a.name.toLowerCase(),
            B = b.name.toLowerCase();

        if (A < B) {
            return -1;
        }

        if (A > B) {
            return 1;
        }

        return 0;
    },

    lvl : function (a, b) {
        var A = a.lvl,
            B = b.lvl;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    atk : function (a, b) {
        var A = a.atk,
            B = b.atk;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    def : function (a, b) {
        var A = a.def,
            B = b.def;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    api : function (a, b) {
        var A = a.api,
            B = b.api;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    dpi : function (a, b) {
        var A = a.dpi,
            B = b.dpi;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    mpi : function (a, b) {
        var A = a.mpi,
            B = b.mpi;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    eatk : function (a, b) {
        var A = a.eatk,
            B = b.eatk;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    edef : function (a, b) {
        var A = a.edef,
            B = b.edef;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    eapi : function (a, b) {
        var A = a.eapi,
            B = b.eapi;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    edpi : function (a, b) {
        var A = a.edpi,
            B = b.edpi;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    empi : function (a, b) {
        var A = a.empi,
            B = b.empi;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    owned : function (a, b) {
        var A = a.owned,
            B = b.owned;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    cost : function (a, b) {
        var A = a.cost,
            B = b.cost;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    upkeep : function (a, b) {
        var A = a.upkeep,
            B = b.upkeep;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    hourly : function (a, b) {
        var A = a.hourly,
            B = b.hourly;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    score : function (a, b) {
        var A = a.score,
            B = b.score;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    }
};
