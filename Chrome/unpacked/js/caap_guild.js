/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
festival,feed,battle,town,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,gm,hiddenVar,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                          GUILD
/////////////////////////////////////////////////////////////////////

(function() {
    "use strict";

    caap.checkResults_guild = function() {
        try {
            if (session.getItem("clickUrl").hasIndexOf("guild_battle=true")) {
                caap.guildTabAddListener();
                con.log(2, "Battle List");
                return true;
            }

            // Guild
            var guildTxt = '',
                guildDiv = $j(),
                tStr = '',
                members = [],
                save = false;

            if (config.getItem('enableMonsterFinder', false)) {
                feed.items("guild");
            }

            guildTxt = $j("#globalContainer #guild_achievement").text().trim().innerTrim();
            if ($u.hasContent(guildTxt)) {
                tStr = guildTxt.regex(/Monster ([\d,]+)/);
                caap.stats.guild.mPoints = $u.hasContent(tStr) ? ($u.isString(tStr) ? tStr.numberOnly() : tStr) : 0;
                tStr = guildTxt.regex(/Battle ([\d,]+)/);
                caap.stats.guild.bPoints = $u.hasContent(tStr) ? ($u.isString(tStr) ? tStr.numberOnly() : tStr) : 0;
                tStr = guildTxt.regex(/Monster [\d,]+ points \(Top (\d+\-\d+%)\)/);
                caap.stats.guild.mRank = $u.hasContent(tStr) ? tStr : '';
                tStr = guildTxt.regex(/Battle [\d,]+ points \(Top (\d+\-\d+%)\)/);
                caap.stats.guild.bRank = $u.hasContent(tStr) ? tStr : '';
                save = true;
            } else {
                con.warn('Using stored guild Monster and Battle points.');
            }

            guildTxt = $j("#globalContainer #guild_blast input[name='guild_id']").attr("value");
            if ($u.hasContent(guildTxt)) {
                caap.stats.guild.id = guildTxt;
                save = true;
            } else {
                con.warn('Using stored guild_id.');
            }

            guildTxt = $j("#globalContainer #guild_banner_section").text().trim();
            if ($u.hasContent(guildTxt)) {
                caap.stats.guild.name = guildTxt;
                save = true;
            } else {
                con.warn('Using stored guild name.');
            }

            guildDiv = $j("#globalContainer div[style*='guild_popup_middle.jpg'] div[style*='float:left;'] a[href*='keep.php?casuser']");
            if ($u.hasContent(guildDiv)) {
                guildDiv.each(function() {
                    var t = $j(this),
                        uid = t.attr("href").regex(/casuser=(\d+)/),
                        name = t.text().trim();

                    if (uid !== caap.stats.FBID) {
                        members.push({
                            'userId': uid,
                            'name': name
                        });
                    }

                    t = null;
                });

                caap.stats.guild.members = members.slice();
                save = true;
            } else {
                con.warn('Using stored guild member count.');
            }

            con.log(2, "checkResults_guild", caap.stats.guild);
            if (save) {
                caap.saveStats();
            }

            guildDiv = null;
            return true;
        } catch (err) {
            con.error("ERROR in checkResults_guild: " + err);
            return false;
        }
    };

    caap.guildTabListener = function(event) {
        session.setItem("clickUrl", $u.setContent($j(event.target).parent().attr("onclick"), '').regex(new RegExp(",'(.+\\.php.*?)'")));
    };

    caap.guildTabAddListener = function() {
        $j("div[style*='guild_tab_off_tile.jpg'],div[style*='guild_tab_on_tile.jpg']").off('click', caap.guildTabListener).on('click', caap.guildTabListener);
    };

    caap.checkResults_guild_panel = function() {
        caap.guildTabAddListener();
    };

    caap.checkResults_guild_shop = function() {
        caap.guildTabAddListener();
    };

    caap.checkResults_guild_class = function() {
        caap.guildTabAddListener();
    };

    caap.checkResults_guild_formation = function() {
        caap.guildTabAddListener();
    };

}());
