/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,sort,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          sort OBJECT
// this is the main object for dealing with sort routines
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    sort.order = function () {
        this.data = {
            'reverse': {
                'a': false,
                'b': false,
                'c': false
            },
            'value': {
                'a': '',
                'b': '',
                'c': ''
            }
        };
    };

    sort.dialog = {};

    sort.form = function (id, list, records) {
        try {
            var html = '',
                it = 0,
                it1 = 0,
                len1 = 0;

            if (!$u.hasContent(sort.dialog[id])) {
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

                sort.dialog[id] = $j('<div id="sort_form_' + id + '" title="Sort ' + id + '">' + html + '</div>').appendTo(window.document.body);
                sort.dialog[id].dialog({
                    buttons: {
                        "Sort": function () {
                            sort.getForm(id, records);
                            $j(this).dialog("close");
                        },
                        "Cancel": function () {
                            $j(this).dialog("close");
                        }
                    }
                });
            } else {
                sort.dialog[id].dialog("open");
            }

            sort.updateForm(id);
            return true;
        } catch (err) {
            con.error("ERROR in sort.form: " + err);
            return false;
        }
    };

    sort.getForm = function (id, records) {
        try {
            var order = new sort.order();

            if ($u.hasContent(sort.dialog[id])) {
                order.data.reverse.a = $j("#form0 input[name='reverse']:checked", sort.dialog[id]).val() === "true" ? true : false;
                order.data.reverse.b = $j("#form1 input[name='reverse']:checked", sort.dialog[id]).val() === "true" ? true : false;
                order.data.reverse.c = $j("#form2 input[name='reverse']:checked", sort.dialog[id]).val() === "true" ? true : false;
                order.data.value.a = $j("#select0 option:selected", sort.dialog[id]).val();
                order.data.value.b = $j("#select1 option:selected", sort.dialog[id]).val();
                order.data.value.c = $j("#select2 option:selected", sort.dialog[id]).val();
                records.sort($u.sortBy(order.data.reverse.a, order.data.value.a, $u.sortBy(order.data.reverse.b, order.data.value.b, $u.sortBy(order.data.reverse.c, order.data.value.c))));
                state.setItem(id + "Sort", order);
                session.setItem(id + "DashUpdate", true);
                caap.updateDashboard(true);
            } else {
                con.log(3, "Dialog for getForm not found", id);
            }

            return order.data;
        } catch (err) {
            con.error("ERROR in sort.getForm: " + err);
            return undefined;
        }
    };

    sort.updateForm = function (id) {
        try {
            var order = new sort.order();

            if ($u.hasContent(sort.dialog[id])) {
                $j.extend(true, order.data, state.getItem(id + "Sort", order));
                $j("#form0 input", sort.dialog[id]).val([order.data.reverse.a]);
                $j("#form1 input", sort.dialog[id]).val([order.data.reverse.b]);
                $j("#form2 input", sort.dialog[id]).val([order.data.reverse.c]);
                $j("#select0", sort.dialog[id]).val(order.data.value.a);
                $j("#select1", sort.dialog[id]).val(order.data.value.b);
                $j("#select2", sort.dialog[id]).val(order.data.value.c);
            } else {
                con.log(3, "Dialog for updateForm not found", id);
            }

            return true;
        } catch (err) {
            con.error("ERROR in sort.updateForm: " + err);
            return false;
        }
    };

}());
