/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
feed,battle,town,conquest,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,hiddenVar,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
// MONSTERS DASHBOARD
// Display the current monsters and stats
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    caap.makeTable = function (id, head, body, caption, style) {
        try {
            if (!$u.hasContent(id) || !$u.isString(id)) {
                throw "Invalid ID!";
            }

            var html = "<table id='caap_" + id + "_table' class='caap_table'>";

            html += $u.hasContent(caption) ? "<caption class='caap_caption' " + ($u.hasContent(style) ? "style='" + style + "'" : "") + ">" + caption + "</caption>" : "";
            html += "<thead>" + $u.setContent(head, '') + "</thead>";
            html += "<tbody>" + $u.setContent(body, '') + "</tbody>";
            html += "</table>";

            return html;
        } catch (err) {
            con.error("ERROR in makeTable: " + err);
            return undefined;
        }
    };

    caap.makeTr = function (data, style) {
        try {
            return $u.hasContent(data) ? "<tr" + ($u.hasContent(style) ? " style='" + style + "'" : "") + ">" + data + "</tr>" : "";
        } catch (err) {
            con.error("ERROR in makeTr: " + err);
            return undefined;
        }
    };

    caap.makeTh = function (header, style) {
        try {
            var type = " data-type='bestcolor'",
                html = '<th';

            type = $u.hasContent(header.color) ? '' : type;
            header.color = $u.setContent(header.color, $u.bestTextColor(state.getItem("StyleBackgroundLight", "#E0C961")));
            html += $u.hasContent(header.id) ? " id='" + header.id + "'" : '';
            html += $u.hasContent(header.title) ? " title='" + header.title + "'" : '';
            html += type + " style='color:" + header.color + ";" + ($u.hasContent(header.bgcolor) ? "background-color:" +
                header.bgcolor + ";" : '') + ($u.hasContent(header.width) ? "width:" + header.width + ";" : '') + ($u.hasContent(style) ? style : "") + "'>" + header.text + "</th>";

            return html;
        } catch (err) {
            con.error("ERROR in makeTh: " + err);
            return undefined;
        }
    };

    caap.makeTd = function (data, style) {
        try {
            var type = " data-type='bestcolor'",
                html = '<td';

            type = $u.hasContent(data.color) ? '' : type;
            data.color = $u.setContent(data.color, $u.bestTextColor(config.getItem("StyleBackgroundLight", "#E0C961")));
            html += $u.hasContent(data.id) ? " id='" + data.id + "'" : '';
            html += $u.hasContent(data.title) ? " title='" + data.title + "'" : '';
            html += type + " style='color:" + data.color + ";" + ($u.hasContent(data.bgcolor) ? "background-color:" + data.bgcolor + ";" : '') + ($u.hasContent(style) ? style : "") + "'>" + data.text + "</td>";

            return html;
        } catch (err) {
            con.error("ERROR in makeTd: " + err);
            return undefined;
        }
    };

    caap.updateDashboardWaitLog = true;

    caap.updateDashboard = function (force) {
        try {
            if (config.getItem("dashMinimised", false)) {
                return false;
            }

            if (caap.caapTopObject.length === 0) {
                throw "We are missing the Dashboard div!";
            }

            if (!caap.oneMinuteUpdate('dashboard', force)) {
                if (caap.updateDashboardWaitLog) {
                    con.log(4, "Dashboard update is waiting on oneMinuteUpdate");
                    caap.updateDashboardWaitLog = false;
                }

                return false;
            }

            caap.updateDashboardWaitLog = true;
            con.log(3, "Updating Dashboard");
			worker.list.forEach( function(i) {
				if ($u.isFunction(window[i].dashboard)) {
					window[i].dashboard();
				}
			});

            guild_monster.dashboard();
            gifting.queue.dashboard();
            gifting.history.dashboard();

           return true;
        } catch (err) {
            con.error("ERROR in updateDashboard: " + err);
            return false;
        }
    };

    /*-------------------------------------------------------------------------------------\
    addDBListener creates the listener for our dashboard controls.
    \-------------------------------------------------------------------------------------*/
    caap.dbDisplayListener = function (e) {
        var idName = e.target.id.stripCaap(),
            value = e.target.options[e.target.selectedIndex].value,
            title = e.target.options[e.target.selectedIndex].title;

        con.log(1, 'Change: dashboard setting "' + idName + '" to "' + value + '" with title "' + title + '"');
        config.setItem(idName, value);
        e.target.title = title;
        caap.setDisplay("caapTopObject", 'infoMonster', false);
        caap.setDisplay("caapTopObject", 'guildMonster', false);
        caap.setDisplay("caapTopObject", 'gbClassic', false);
        caap.setDisplay("caapTopObject", 'infoArena', false);
        caap.setDisplay("caapTopObject", 'gb100', false);
        caap.setDisplay("caapTopObject", 'gb10', false);
        caap.setDisplay("caapTopObject", 'infoFeed', false);
        caap.setDisplay("caapTopObject", 'army', false);
        caap.setDisplay("caapTopObject", 'infoTargets1', false);
        caap.setDisplay("caapTopObject", 'infoBattle', false);
        caap.setDisplay("caapTopObject", 'infoGuilds', false);
        caap.setDisplay("caapTopObject", 'userStats', false);
        caap.setDisplay("caapTopObject", 'generalsStats', false);
        caap.setDisplay("caapTopObject", 'Town_Stats', false);
        caap.setDisplay("caapTopObject", 'giftStats', false);
        caap.setDisplay("caapTopObject", 'giftQueue', false);
        caap.setDisplay("caapTopObject", 'buttonMonster', false);
        caap.setDisplay("caapTopObject", 'buttonFeed', false);
        caap.setDisplay("caapTopObject", 'GFDisplay', false);
        caap.setDisplay("caapTopObject", 'buttonGuildMonster', false);
        caap.setDisplay("caapTopObject", 'buttonTargets', false);
        caap.setDisplay("caapTopObject", 'buttonGenerals', false);
        caap.setDisplay("caapTopObject", 'buttonBattle', false);
        caap.setDisplay("caapTopObject", 'buttonGuilds', false);
        caap.setDisplay("caapTopObject", 'buttonGifting', false);
        caap.setDisplay("caapTopObject", 'buttonGiftQueue', false);
        caap.setDisplay("caapTopObject", 'buttonArmy', false);
        switch (value) {
            case "Target List":
                caap.setDisplay("caapTopObject", 'infoTargets1', true);
                caap.setDisplay("caapTopObject", 'buttonTargets', true);

                break;
            case "Battle Stats":
                caap.setDisplay("caapTopObject", 'infoBattle', true);

                break;
            case "Arena Stats" :
                caap.setDisplay("caapTopObject", 'infoArena', true);
                //caap.setDisplay("caapTopObject", 'buttonBattle', true);
                break;
            case "Guild Essence":
                caap.setDisplay("caapTopObject", 'infoGuilds', true);
                caap.setDisplay("caapTopObject", 'buttonGuilds', true);

                break;
            case "User Stats":
                caap.setDisplay("caapTopObject", 'userStats', true);

                break;
            case "Generals Stats":
                caap.setDisplay("caapTopObject", 'generalsStats', true);
                caap.setDisplay("caapTopObject", 'buttonGenerals', true);

                break;
            case "Town Stats":
                caap.setDisplay("caapTopObject", 'Town_Stats', true);

                break;
            case "Gifting Stats":
                caap.setDisplay("caapTopObject", 'giftStats', true);
                caap.setDisplay("caapTopObject", 'buttonGifting', true);

                break;
            case "Gift Queue":
                caap.setDisplay("caapTopObject", 'giftQueue', true);
                caap.setDisplay("caapTopObject", 'buttonGiftQueue', true);

                break;
            case "Guild Monster":
                caap.setDisplay("caapTopObject", 'guildMonster', true);
                caap.setDisplay("caapTopObject", 'buttonGuildMonster', true);

                break;
            case "Classic":
				caap.setDisplay("caapTopObject", 'GFDisplay', true);
                caap.setDisplay("caapTopObject", 'gbClassic', true);

                break;
            case "Monster":
                caap.setDisplay("caapTopObject", 'infoMonster', true);
                caap.setDisplay("caapTopObject", 'buttonMonster', true);
                break;
            case "100v100":
				caap.setDisplay("caapTopObject", 'GFDisplay', true);
                caap.setDisplay("caapTopObject", 'gb100', true);

                break;
            case "10v10":
				caap.setDisplay("caapTopObject", 'GFDisplay', true);
                caap.setDisplay("caapTopObject", 'gb10', true);

                break;
            case "Feed":
                caap.setDisplay("caapTopObject", 'infoFeed', true);
                caap.setDisplay("caapTopObject", 'buttonFeed', true);

                break;
            case "Army":
                caap.setDisplay("caapTopObject", 'army', true);
                caap.setDisplay("caapTopObject", 'buttonArmy', true);

                break;
            default:
        }

        caap.updateDashboard(true);
    };

    /*-------------------------------------------------------------------------------------\
    addDBListener creates the listener for guild battles control.
    \-------------------------------------------------------------------------------------*/
    caap.gfDisplayListener = function (e) {
        var idName = e.target.id.stripCaap(),
            value = e.target.options[e.target.selectedIndex].value,
            title = e.target.options[e.target.selectedIndex].title;

        con.log(1, 'Change: setting "' + idName + '" to "' + value + '" with title "' + title + '"');
        config.setItem(idName, value);
        e.target.title = title;
        caap.setDisplay("caapTopObject", 'yourgb100', value == 'My Guild');
        caap.setDisplay("caapTopObject", 'yourgbClassic', value == 'My Guild');
        caap.setDisplay("caapTopObject", 'enemygb100', value == 'Opponent');
        caap.setDisplay("caapTopObject", 'yourgb10', value == 'My Guild');
        caap.setDisplay("caapTopObject", 'enemygb10', value == 'Opponent');
        caap.setDisplay("caapTopObject", 'enemygbClassic', value == 'Opponent');
        caap.updateDashboard(true);
    };

	// Pass through function used to pass arguments that might not be referred from a different context
    caap.refreshFeedListener = function () {
        monster.fullReview('Feed');
    };

    caap.refreshGeneralsListener = function () {
		con.log(1, 'Cleared all general records');
        general.records = [];
		general.save();
    };

    caap.refreshGuildMonstersListener = function () {
        con.log(1, "refreshGuildMonstersListener");
        session.setItem('ReleaseControl', true);
        guild_monster.clear();
        caap.updateDashboard(true);
        schedule.setItem("guildMonsterReview", 0);
    };

    caap.liveFeedButtonListener = function () {
        caap.clickAjaxLinkSend('army_news_feed.php');
    };

    caap.crusadersButtonListener = function () {
        caap.clickAjaxLinkSend('crusaders.php');
    };

    caap.getBQH = function (cb) {
        function onError() {
            $j().alert("Unable to get bqh");
        }

        function onSuccess(data) {
            var bqh = $j("input[name='bqh']", data).eq(0).val();

            if ($u.isFunction(cb) && $u.hasContent(bqh)) {
                cb(bqh);
            } else {
                $j().alert("Unable to get bqh");
            }

            bqh = null;
        }

        try {
            caap.ajax('keep.php', null, onError, onSuccess);
            return true;
        } catch (err) {
            con.error("ERROR in getBQH: " + err);
            return false;
        }
    };

    caap.fastHealButtonListener = function () {
        if (stats.health.dif && stats.gold.total > 0) {
            caap.getBQH(function (bqh) {
                var params = {
                    "action": "heal_avatar",
                    "bqh": bqh
                };

                caap.ajaxLoad('keep.php', params, "#health_current_value", "#health_current_value", session.getItem("page", ""));
            });
        }
    };

    caap.clearTargetsButtonListener = function () {
        battle.reconRecords = [];
        battle.saveRecon();
        caap.updateDashboard(true);
    };

    caap.clearBattleButtonListener = function () {
        battle.clear();
        caap.updateDashboard(true);
    };

    caap.clearGuildsButtonListener = function () {
        essence.clear();
        caap.updateDashboard(true);
    };

    caap.rescanGuildsButtonListener = function () {
		essence.rescan();
        caap.updateDashboard(true);
    };

    caap.clearGiftingButtonListener = function () {
        gifting.clear("history");
        caap.updateDashboard(true);
    };

    caap.clearGiftQueueButtonListener = function () {
        gifting.clear("queue");
        caap.updateDashboard(true);
    };

    caap.getArmyButtonListener = function () {
        schedule.setItem("army_member", 0);
        army.deleteTemp();
    };

    caap.getArenaButtonListener = function() {
        schedule.setItem('arenaTimer', 0);
    };

    caap.addDBListener = function () {
        try {
            con.log(4, "Adding listeners for caap_top");
            if (!$u.hasContent($j('#caap_DBDisplay', caap.caapTopObject))) {
                caap.reloadCastleAge();
            }

            $j('#caap_DBDisplay', caap.caapTopObject).on('change', caap.dbDisplayListener);
            $j('#caap_GFDisplay', caap.caapTopObject).on('change', caap.gfDisplayListener);
            $j('#caap_refreshMonsters', caap.caapTopObject).on('click', monster.fullReview);
            $j('#caap_refreshFeeds', caap.caapTopObject).on('click', caap.refreshFeedListener);
            $j('#caap_refreshGenerals', caap.caapTopObject).on('click', caap.refreshGeneralsListener);
            $j('#caap_refreshGuildMonsters', caap.caapTopObject).on('click', caap.refreshGuildMonstersListener);
            $j('#caap_liveFeed', caap.caapTopObject).on('click', caap.liveFeedButtonListener);
            $j('#caap_crusaders', caap.caapTopObject).on('click', caap.crusadersButtonListener);
            $j('#caap_fastHeal', caap.caapTopObject).on('click', caap.fastHealButtonListener);
            $j('#caap_clearTargets', caap.caapTopObject).on('click', caap.clearTargetsButtonListener);
            $j('#caap_clearBattle', caap.caapTopObject).on('click', caap.clearBattleButtonListener);
            $j('#caap_clearGuilds', caap.caapTopObject).on('click', caap.clearGuildsButtonListener);
            $j('#caap_rescanGuilds', caap.caapTopObject).on('click', caap.rescanGuildsButtonListener);
            $j('#caap_clearGifting', caap.caapTopObject).on('click', caap.clearGiftingButtonListener);
            $j('#caap_clearGiftQueue', caap.caapTopObject).on('click', caap.clearGiftQueueButtonListener);
            $j('#caap_getArmy', caap.caapTopObject).on('click', caap.getArmyButtonListener);
            $j('#caap_dashMin', caap.caapTopObject).on('click', function () {
                caap.caapTopObject.toggle('fold', {}, '', function () {
                    caap.caapTopMinObject.show();
                });

                config.setItem("dashMinimised", true);
            });

            $j('#caap_dashMax', caap.caapTopMinObject).on('click', function () {
                caap.caapTopObject.toggle('fold');
                caap.caapTopMinObject.hide();
                config.setItem("dashMinimised", false);
            });

            con.log(4, "Listeners added for caap_top");
            return true;
        } catch (err) {
            con.error("ERROR in addDBListener: " + err);
            return false;
        }
    };

}());
