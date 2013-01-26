/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                              ARMY
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

caap.checkResults_army = function () {
    try {
        var listHref = $j("#app_body div[class='messages'] a[href*='army.php?act=ignore']"),
            autoGift = config.getItem('AutoGift', false),
            time = autoGift ? config.getItem('CheckGiftMins', 15) : 0;

        if ($u.hasContent(listHref)) {
            listHref.each(function () {
                var row = $j(this),
                    link = $j("<br /><a title='This link can be used to collect the " +
			      "gift when it has been lost on Facebook. !!If you accept a gift " +
			      "in this manner then it will leave an orphan request on Facebook!!' " +
			      "href='" + row.attr("href").replace('ignore', 'acpt') + "'>Lost Accept</a>");

                link.insertAfter(row);

				link = null;

            });
        }

        if (autoGift) {
            if ($u.hasContent(listHref)) {
                con.log(1, 'We have a gift waiting!');
                state.setItem('HaveGift', true);
            } else {
                con.log(2, 'No gifts waiting.');
                state.setItem('HaveGift', false);
            }

            time = time < 15 ? 15 : time;
            schedule.setItem("ajaxGiftCheck", time * 60, 300);
        }

		listHref = null;
        return true;
    } catch (err) {
        con.error("ERROR in checkResults_army: " + err);
        return false;
    }
};
caap.checkResults_army_member = function () {
    try {
        army.page();
        return true;
    } catch (err) {
        con.error("ERROR in checkResults_army_member: " + err);
        return false;
    }
};

}());
