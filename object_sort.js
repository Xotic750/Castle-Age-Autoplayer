
////////////////////////////////////////////////////////////////////
//                          sort OBJECT
// this is the main object for dealing with sort routines
/////////////////////////////////////////////////////////////////////

sort = {
    by: function (name, minor) {
        return function (o, p) {
            try {
                var a, b;
                if ($.type(o) === 'object' && $.type(p) === 'object' && o && p) {
                    a = o[name];
                    b = p[name];
                    if (a === b) {
                        return $.type(minor) === 'function' ? minor(o, p) : o;
                    }

                    if ($.type(a) === $.type(b)) {
                        if ($.type(a) === 'string') {
                            return a < b ? -1 : 1;
                        } else {
                            return a < b ? 1 : -1;
                        }
                    }

                    return $.type(a) < $.type(b) ? -1 : 1;
                } else {
                    throw {
                        name: 'Error',
                        message: 'Expected an object when sorting by ' + name
                    };
                }
            } catch (err) {
                utility.error("ERROR in sort.by: " + err);
                return undefined;
            }
        };
    }
};
