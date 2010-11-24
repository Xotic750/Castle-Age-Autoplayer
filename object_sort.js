
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
            var theDialog = null,
                html      = '',
                it        = 0,
                it1       = 0,
                len1      = 0,
                order     = {
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

            if (!this.dialog[id] || !this.dialog[id].length) {
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

                this.dialog[id] = $('<div id="sort_form_' + id + '" title="Sort ' + id + '">' + html + '</div>').appendTo(window.document.body);
                this.dialog[id].dialog({
                    buttons: {
                        "Sort": function () {
                            order.reverse.a = $("input[name='reverse']:checked", "#form0", $(this)).val() === "true" ? true : false;
                            order.reverse.b = $("input[name='reverse']:checked", "#form1", $(this)).val() === "true" ? true : false;
                            order.reverse.c = $("input[name='reverse']:checked", "#form2", $(this)).val() === "true" ? true : false;
                            order.value.a = $("option:selected", "#select0", $(this)).val();
                            order.value.b = $("option:selected", "#select1", $(this)).val();
                            order.value.c = $("option:selected", "#select2", $(this)).val();
                            records.sort(sort.by(order.reverse.a, order.value.a, sort.by(order.reverse.b, order.value.b, sort.by(order.reverse.c, order.value.c))));
                            state.setItem(id + "Sort", order);
                            state.setItem(id + "DashUpdate", true);
                            caap.UpdateDashboard(true);
                            utility.log(1, "order", order);
                            $(this).dialog("close");
                        },
                        "Cancel": function () {
                            $(this).dialog("close");
                        }
                    }
                });
            } else {
                this.dialog[id].dialog("open");
            }

            $.extend(true, order, state.getItem(id + "Sort", order));
            this.updateForm(id, order);
            utility.log(1, "order", order);
            return true;
        } catch (err) {
            utility.error("ERROR in sort.form: " + err);
            return false;
        }
    },

    updateForm: function (id, order) {
        try {
            if (this.dialog[id] && this.dialog[id].length) {
                $("input", "#form0", this.dialog[id]).val([order.reverse.a]);
                $("input", "#form1", this.dialog[id]).val([order.reverse.b]);
                $("input", "#form2", this.dialog[id]).val([order.reverse.c]);
                $("#select0", this.dialog[id]).val(order.value.a);
                $("#select1", this.dialog[id]).val(order.value.b);
                $("#select2", this.dialog[id]).val(order.value.c);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in sort.updateForm: " + err);
            return false;
        }
    }
};
