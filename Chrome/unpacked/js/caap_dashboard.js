/*jslint white: true, browser: true, devel: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
feed,battle,town,conquest,
$u,stats,worker,self,caap,config,con,essence,
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

    caap.addDashboard = function() {
        try {
            /*-------------------------------------------------------------------------------------\
             Here is where we construct the HTML for our dashboard. We start by building the outer
             container and position it within the main container.
             \-------------------------------------------------------------------------------------*/
            var layout = "<div id='caap_top'>",
                displayList = [
                    'Arena Stats',
                    'Army',
                    'Battle Stats',
                    'Feed',
                    '100v100',
                    'Generals Stats',
//                    'Gift Queue',
//                    'Gifting Stats',
                    'Guild Essence',
                    'Guild Monster',
                    'Classic',
                    '10v10',
                    'Monster',
                    'Target List',
                    'Town Stats',
                    'User Stats'
                ],
                displayInst = [
                    'Display your Army Members, the last time they leveled up and choose priority Elite Guard.',
                    'Display your Battle history statistics, who you fought and if you won or lost.',
                    'Display the monsters that have been seen in your Live Feed and/or Guild Feed that are still valid.',
                    'Display the 100v100 battle in progress.',
                    'Display information about your Generals.',
//                    'Display your current Gift Queue.',
//                    'Display your Gifting history, how many gifts you have received and returned to a user.',
                    'Display Essence Storage space for Guilds that have been scouted.',
                    'Display information about your Guild Monster.',
                    'Display the Guild battle in progress.',
                    'Display the 10v10 battle in progress.',
                    'Display your Monster battles.',
                    'Display information about Targets that you have performed reconnaissance on.',
                    'Display information about items and solders',
                    'Display information about your account and character statistics.'
                    ],
                    styleXY = {
                        x : 0,
                        y : 0
                    },
                    bgc = state.getItem("StyleBackgroundLight", "#E0C961");

            /*-------------------------------------------------------------------------------------\
            Next we put in our Refresh Monster List button which will only show when we have
            selected the Monster display.
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_buttonMonster' style='position:absolute;top:0px;left:250px;display:" + (config.getItem('DBDisplay', 'None') === 'Monster' ? 'block' : 'none') + "'>";
            layout += "<input type='button' id='caap_refreshMonsters' value='Refresh Monster List' style='padding: 0; font-size: 9px; height: 18px' /></div>";

            /*-------------------------------------------------------------------------------------\
            Next we put in our Refresh Feed List button which will only show when we have
            selected the Feed display.
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_buttonFeed' style='position:absolute;top:0px;left:250px;display:" + (config.getItem('DBDisplay', 'None') === 'Feed' ? 'block' : 'none') + "'>";
            layout += "<input type='button' id='caap_refreshFeeds' value='Refresh Feed List' style='padding: 0; font-size: 9px; height: 18px' /></div>";

            /*-------------------------------------------------------------------------------------\
            Next we put in our Guild and Festival battle dropdown which will only show when we have
            selected the Guild or Festival battle display.
            \-------------------------------------------------------------------------------------*/

            layout += "<div id='caap_GFDisplay' style='font-size: 9px;position:absolute;top:0px;left:250px;display:" + (['100v100','Classic', '10v10'].hasIndexOf(config.getItem('DBDisplay', 'Monster')) ? 'block' : 'none') + "'>Table: ";
            layout += caap.makeDropDown('GFDisplay', ['Opponent','My Guild'], ['Them','Us'], '', 'Opponent', "font-size: 9px; min-width: 90px; max-width: 90px; width : 90px;") + "</div>";

            /*-------------------------------------------------------------------------------------\
            Next we put in our Refresh Generals List button which will only show when we have
            selected the Generals display.
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_buttonGenerals' style='position:absolute;top:0px;left:250px;display:" + (config.getItem('DBDisplay', 'Monster') === 'Generals Stats' ? 'block' : 'none') + "'>";
            layout += "<input type='button' id='caap_refreshGenerals' value='Refresh Generals List' style='padding: 0; font-size: 9px; height: 18px' /></div>";

            /*-------------------------------------------------------------------------------------\
            Next we put in our Refresh Guild Monster List button which will only show when we have
            selected the Guild Monster display.
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_buttonGuildMonster' style='position:absolute;top:0px;left:250px;display:" + (config.getItem('DBDisplay', 'Monster') === 'Guild Monster' ? 'block' : 'none') + "'>";
            layout += "<input type='button' id='caap_refreshGuildMonsters' value='Refresh Guild Monster List' style='padding: 0; font-size: 9px; height: 18px' /></div>";

            /*-------------------------------------------------------------------------------------\
            Next we put in the Clear Target List button which will only show when we have
            selected the Target List display
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_buttonTargets' style='position:absolute;top:0px;left:250px;display:" + (config.getItem('DBDisplay', 'Monster') === 'Target List' ? 'block' : 'none') + "'>";
            layout += "<input type='button' id='caap_clearTargets' value='Clear Targets List' style='padding: 0; font-size: 9px; height: 18px' /></div>";

            /*-------------------------------------------------------------------------------------\
            Next we put in the Clear Battle Stats button which will only show when we have
            selected the Target List display
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_buttonBattle' style='position:absolute;top:0px;left:250px;display:" + (config.getItem('DBDisplay', 'Monster') === 'Battle Stats' ? 'block' : 'none') + "'>";
            layout += "<input type='button' id='caap_clearBattle' value='Clear Battle Stats' style='padding: 0; font-size: 9px; height: 18px' /></div>";

            /*-------------------------------------------------------------------------------------\
            Next we put in the Clear Arena Stats button which will only show when we have
            selected the Target List display
            \-------------------------------------------------------------------------------------
            layout += "<div id='caap_buttonArena' style='position:absolute;top:0px;left:250px;display:" + (config.getItem('DBDisplay', 'Monster') === 'Arena Stats' ? 'block' : 'none') + "'>";
            layout += "<input type='button' id='caap_clearArena' value='Clear Arena Stats' style='padding: 0; font-size: 9px; height: 18px' /></div>";*/

            /*-------------------------------------------------------------------------------------\
            Next we put in the Clear Guild Essence button which will only show when we have
            selected the Guild Essence display
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_buttonGuilds' style='position:absolute;top:0px;left:250px;display:" + (config.getItem('DBDisplay', 'Monster') === 'Guild Essence' ? 'block' : 'none') + "'>";
            layout += "<input type='button' id='caap_clearGuilds' value='Clear Guild Essence' style='padding: 0; font-size: 9px; height: 18px' />";
            layout += "<input type='button' id='caap_rescanGuilds' value='Rescan Essence' style='padding: 0; font-size: 9px; height: 18px' />";
            layout += "</div>";

            /*-------------------------------------------------------------------------------------\
            Then we put in the Guild tokens and FP total since we overlay them on the page.
            \-------------------------------------------------------------------------------------*/
            layout += "<div style='position:absolute;top:8 px;left:10px;padding: 0; font-size: 9px; height: 18px'><b>Tokens: " + stats.guildTokens.num + '/' + stats.guildTokens.max + ' &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FP: ' + stats.points.favor + "</b></div>";
//            layout += "<div style='position:absolute;top:0px;left:10px;'><input id='caap_liveFeed' type='button' value='Live Feed' style='padding: 0; font-size: 9px; height: 18px' /></div>";

            /*-------------------------------------------------------------------------------------\
             Then we put in the Raid link since no longer available through interface.
             \-------------------------------------------------------------------------------------*/
            layout += "<div style='position:absolute;top:0px;left:140px;'><a href='raid.php' onclick=\"ajaxLinkSend('globalContainer'," +
				"'raid.php'); return false;\"><input type='button' value='Raid' style='padding: 0; font-size: 9px; height: 18px' /></a></div>";

            /*-------------------------------------------------------------------------------------\
            We install the display selection box that allows the user to toggle through the
            available displays.
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_DBDisplay' style='font-size: 9px;position:absolute;top:0px;right:25px;'>Display: ";
            layout += caap.makeDropDown('DBDisplay', displayList, displayInst, '', 'User Stats', "font-size: 9px; min-width: 90px; max-width: 90px; width : 90px;") + "</div>";

            /*-------------------------------------------------------------------------------------\
            We install the minimize/maximise button that allows the user to make the dashboard
            appear or disappear.
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_dashMin' class='ui-icon ui-icon-circle-minus' style='position:absolute;top:0px;right:5px;' title='Minimise' onmouseover='this.style.cursor=\"pointer\";' onmouseout='this.style.cursor=\"default\";'>-</div>";

            /*-------------------------------------------------------------------------------------\
            And here we build our empty content divs.  We display the appropriate div
            depending on which display was selected using the control above
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_infoMonster' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Monster' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_guildMonster' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Guild Monster' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_gbClassic' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Classic' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_gb10' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === '10v10' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_infoTargets1' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Target List' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_infoBattle' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Battle Stats' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_infoArena' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Arena Stats' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_userStats' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'User Stats' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_generalsStats' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Generals Stats' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_Town_Stats' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Town Stats' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_army' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Army' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_gb100' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === '100v100' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_infoFeed' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Feed' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_infoGuilds' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Guild Essence' ? 'block' : 'none') + "'></div>";
            layout += "</div>";

            /*-------------------------------------------------------------------------------------\
            No we apply our CSS to our container
            \-------------------------------------------------------------------------------------*/
            caap.dashboardXY.x = state.getItem('caap_top_menuLeft', '');
            caap.dashboardXY.y = state.getItem('caap_top_menuTop', $j(caap.dashboardXY.selector).offset().top);
            styleXY = caap.getDashboardXY();
            $j(layout).css({
                background : bgc,
                color : $u.bestTextColor(bgc),
                padding : "5px",
                height : "175px",
                width : "610px",
                margin : "0 auto",
                opacity : state.getItem('StyleOpacityLight', 1),
                top : styleXY.y + 'px',
                left : styleXY.x + 'px',
                zIndex : state.getItem('caap_top_zIndex', 1),
                position : 'absolute',
                display : config.getItem("dashMinimised", false) ? 'none' : 'block'
            }).appendTo(document.body);

            caap.caapTopObject = $j('#caap_top');
            $j("input[type='button']", caap.caapTopObject).button();
            return true;
        } catch (err) {
            con.error("ERROR in addDashboard: " + err.stack);
            return false;
        }
    };

    caap.addDashboardMin = function() {
        try {
            /*-------------------------------------------------------------------------------------\
            Here is where we construct the HTML for our dashboard. We start by building the outer
            container and position it within the main container.
            \-------------------------------------------------------------------------------------*/
            var layout = "<div id='caap_topmin'>",
                styleXY = {
                    x : 0,
                    y : 0
                },
                bgc = state.getItem("StyleBackgroundLight", "#E0C961");

            /*-------------------------------------------------------------------------------------\
            We install the display selection box that allows the user to toggle through the
            available displays.
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_dashMax' class='ui-icon ui-icon-circle-plus' style='position:absolute;top:0px;left:0px;' title='Maximise' onmouseover='this.style.cursor=\"pointer\";' onmouseout='this.style.cursor=\"default\";'>-</div>";
            layout += "</div>";

            /*-------------------------------------------------------------------------------------\
            No we apply our CSS to our container
            \-------------------------------------------------------------------------------------*/
            styleXY = caap.getDashboardXY();
            $j(layout).css({
                background : bgc,
                color : $u.bestTextColor(bgc),
                padding : "5px",
                height : "6px",
                width : "6px",
                margin : "0 auto",
                opacity : state.getItem('StyleOpacityLight', 1),
                top : styleXY.y + 'px',
                left : styleXY.x + 'px',
                zIndex : state.getItem('caap_top_zIndex', 1),
                position : 'absolute',
                display : config.getItem("dashMinimised", false) ? 'block' : 'none'
            }).appendTo(document.body);

            caap.caapTopMinObject = $j('#caap_topmin');
            return true;
        } catch (err) {
            con.error("ERROR in addDashboardMin: " + err.stack);
            return false;
        }
    };

    caap.updateDashboard = function (force) {
        try {
            if (config.getItem("dashMinimised", false)) {
                return false;
            }

            if (caap.caapTopObject.length === 0) {
                throw "We are missing the Dashboard div!";
            }

/*            if (!caap.oneMinuteUpdate('dashboard', force)) {
                if (caap.updateDashboardWaitLog) {
                    con.log(4, "Dashboard update is waiting on oneMinuteUpdate");
                    caap.updateDashboardWaitLog = false;
                }

                return false;
            }
*/
            caap.updateDashboardWaitLog = true;
            con.log(3, "Updating Dashboard");
			worker.list.forEach( function(i) {
				if ($u.isFunction(window[i].dashboard)) {
					window[i].dashboard();
				}
			});

            guild_monster.dashboard();

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
        caap.setDisplay("caapTopObject", 'buttonMonster', false);
        caap.setDisplay("caapTopObject", 'buttonFeed', false);
        caap.setDisplay("caapTopObject", 'GFDisplay', false);
        caap.setDisplay("caapTopObject", 'buttonGuildMonster', false);
        caap.setDisplay("caapTopObject", 'buttonTargets', false);
        caap.setDisplay("caapTopObject", 'buttonGenerals', false);
        caap.setDisplay("caapTopObject", 'buttonBattle', false);
        caap.setDisplay("caapTopObject", 'buttonGuilds', false);
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
				break;
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
            $j('#caap_clearTargets', caap.caapTopObject).on('click', caap.clearTargetsButtonListener);
            $j('#caap_clearBattle', caap.caapTopObject).on('click', caap.clearBattleButtonListener);
            $j('#caap_clearGuilds', caap.caapTopObject).on('click', caap.clearGuildsButtonListener);
            $j('#caap_rescanGuilds', caap.caapTopObject).on('click', caap.rescanGuildsButtonListener);
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
