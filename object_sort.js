
////////////////////////////////////////////////////////////////////
//                          sort OBJECT
// this is the main object for dealing with sort routines
/////////////////////////////////////////////////////////////////////

sort = {
    by: function (reverse, name, minor) {
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
                        if (reverse) {
                            return a < b ? 1 : -1;
                        } else {
                            return a < b ? -1 : 1;
                        }
                    }

                    if (reverse) {
                        return $.type(a) < $.type(b) ? 1 : -1;
                    } else {
                        return $.type(a) < $.type(b) ? -1 : 1;
                    }
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
    },

    dialog: {},

    form: function (id, list, records) {
        try {
            var html      = '',
                it        = 0,
                it1       = 0,
                len1      = 0;

            if (!sort.dialog[id] || !sort.dialog[id].length) {
                list.unshift("");
                html += "<p>Sort by ...</p>";
                for (it = 0; it < 3; it += 1) {
                    html += "<div style='padding-bottom: 30px;'>";
                    html += "<div style='float: left; padding-right: 30px;'>";
                    html += "<form id='form" + it + "'>";
                    html += "<input type='radio' id='asc" + it + "' name='reverse' value='false' checked /> Ascending<br />";
                    html += "<input type='radio' id='des" + it + "' name='reverse' value='true' /> Descending";
                    html += "</form>";
                    html += "</div>";
                    html += "<div>";
                    html += "<select id='select" + it + "'>";
                    for (it1 = 0, len1 = list.length; it1 < len1; it1 += 1) {
                        html += "<option value='" + list[it1] + "'>" + list[it1] + "</option>";
                    }

                    html += "</select>";
                    html += "</div>";
                    html += "</div>";
                    if (it < 2) {
                        html += "<p>Then by ...</p>";
                    }
                }

                sort.dialog[id] = $('<div id="sort_form_' + id + '" title="Sort ' + id + '">' + html + '</div>').appendTo(window.document.body);
                sort.dialog[id].dialog({
                    buttons: {
                        "Sort": function () {
                            sort.getForm(id, records);
                            $(this).dialog("close");
                        },
                        "Cancel": function () {
                            $(this).dialog("close");
                        }
                    }
                });
            } else {
                sort.dialog[id].dialog("open");
            }

            sort.updateForm(id);
            return true;
        } catch (err) {
            utility.error("ERROR in sort.form: " + err);
            return false;
        }
    },

    getForm: function (id, records) {
        try {
            var order = {
                    reverse: {
                        a: false,
                        b: false,
                        c: false
                    },
                    value: {
                        a: '',
                        b: '',
                        c: ''
                    }
                };

            if (sort.dialog[id] && sort.dialog[id].length) {
                order.reverse.a = $("#form0 input[name='reverse']:checked", sort.dialog[id]).val() === "true" ? true : false;
                order.reverse.b = $("#form1 input[name='reverse']:checked", sort.dialog[id]).val() === "true" ? true : false;
                order.reverse.c = $("#form2 input[name='reverse']:checked", sort.dialog[id]).val() === "true" ? true : false;
                order.value.a = $("#select0 option:selected", sort.dialog[id]).val();
                order.value.b = $("#select1 option:selected", sort.dialog[id]).val();
                order.value.c = $("#select2 option:selected", sort.dialog[id]).val();
                records.sort(sort.by(order.reverse.a, order.value.a, sort.by(order.reverse.b, order.value.b, sort.by(order.reverse.c, order.value.c))));
                state.setItem(id + "Sort", order);
                state.setItem(id + "DashUpdate", true);
                caap.UpdateDashboard(true);
            } else {
                utility.warn("Dialog for getForm not found", id);
            }

            return order;
        } catch (err) {
            utility.error("ERROR in sort.getForm: " + err);
            return undefined;
        }
    },

    updateForm: function (id) {
        try {
            var order = {
                    reverse: {
                        a: false,
                        b: false,
                        c: false
                    },
                    value: {
                        a: '',
                        b: '',
                        c: ''
                    }
                };

            if (sort.dialog[id] && sort.dialog[id].length) {
                $.extend(true, order, state.getItem(id + "Sort", order));
                $("#form0 input", sort.dialog[id]).val([order.reverse.a]);
                $("#form1 input", sort.dialog[id]).val([order.reverse.b]);
                $("#form2 input", sort.dialog[id]).val([order.reverse.c]);
                $("#select0", sort.dialog[id]).val(order.value.a);
                $("#select1", sort.dialog[id]).val(order.value.b);
                $("#select2", sort.dialog[id]).val(order.value.c);
            } else {
                utility.warn("Dialog for updateForm not found", id, sort.dialog[id]);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in sort.updateForm: " + err);
            return false;
        }
    }
};
