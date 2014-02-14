/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,
schedule,gifting,state,army, general,session,monster,guild_monster,css,
image64,offline,profiles,session,config,state,css,gm,s,db,sort,schedule,general,
monster,guild_monster,festival,feed,battle,town,spreadsheet,gifting,army,caap,con,
caap_timeout,retryDelay,devVersion,caapVersion */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                          Start web Side Scripts
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    caap.start = function () {
        con.log(1, "caap.fb(Data/Env)", caap.fbData, caap.fbEnv);
        caap.sessionVarsInit();
        var FBID = 0,
            idOk = false,
            it = 0,
            aName;

        con.log(1, 'DOM load completed');
        con.log(1, 'mutationTypes', $u.mutationTypes);
        window.clearTimeout(caap_timeout);
        for (it = 0; it < caap.removeLibs.length; it += 1) {
            (document.head || document.getElementsByTagName('head')[0]).removeChild(caap.removeLibs[it]);
        }

        caap.removeLibs = [];
        caap.jQueryExtend();
        css.addCSS();

        if (caap.errorCheck()) {
            caap.mainCaapLoop();
            return;
        }

        caap.jWindow = $j(window);
        if (caap.domain.which === 4) {
            caap.initDb();
            caap.caapifpStartup();
            return;
        }

		if (caap.domain.which === 3) {
			caap.initDb();
			caap.getSigned();
			con.log(2, "session", session);
			caap.caapifStartup();
			return;
		}

		if (caap.domain.which >= 0 && caap.domain.which < 2) {
			FBID = $u.setContent(caap.fbEnv.id, 0).parseInt();
			aName = $j('#pageNav .headerTinymanName').text();
		} else {
			FBID = $u.setContent(caap.fbData.me.id, '0').parseInt();
			aName = $u.setContent(caap.fbData.me.name, '');
		}

		if ($u.isNumber(FBID) && FBID > 0) {
			caap.stats.FBID = FBID;
			idOk = true;
		}

		if (!idOk && caap.domain.which >= 0 && caap.domain.which < 2) {
			// Force reload without retrying
			con.error('No Facebook UserID!!! Reloading ...', FBID, window.location.href);
			window.setTimeout(function () {
				var newdiv = document.createElement('div');

				newdiv.innerHTML = "<p>CAAP will retry shortly!</p>";
				document.body.appendChild(newdiv);
				window.setTimeout(function () {
                                    window.image64 = null;
                                    window.offline = null;
                                    window.profiles = null;
                                    window.session = null;
                                    window.config = null;
                                    window.state = null;
                                    window.css = null;
                                    window.gm = null;
                                    window.ss = null;
                                    window.db = null;
                                    window.sort = null;
                                    window.schedule = null;
                                    window.general = null;
                                    window.monster = null;
                                    window.guild_monster = null;
                                    //window.arena = null;
                                    window.festival = null;
                                    window.feed = null;
                                    window.battle = null;
                                    window.town = null;
                                    window.spreadsheet = null;
                                    window.gifting = null;
                                    window.army = null;
                                    window.caap = null;
                                    window.con = null;
                                    window.conquest = null;
                                    $u.reload();
				}, 60000 + (Math.floor(Math.random() * 60) * 1000));

				newdiv = null;
			}, retryDelay);

			return;
		}

		caap.initDb(FBID);
		con.log_level = config.getItem('DebugLevel', 1);
		//con.log(3, "config", config);
		//con.log(3, "state", state);
		//con.log(3, "schedule", schedule);
		caap.lsUsed();
		schedule.setItem("clickedOnSomething", 3600);

        if (caap.domain.which === 0) {
            caap.loadStats(FBID, aName);
        }

        caap.saveStats();
		gifting.init();
		gifting.loadCurrent();

		/////////////////////////////////////////////////////////////////////
		// Put code to be run once to upgrade an old version's variables to
		// new format or such here.
		/////////////////////////////////////////////////////////////////////

		if (devVersion !== '0') {
			if (state.getItem('LastVersion', '0') !== caapVersion || state.getItem('LastDevVersion', '0') !== devVersion) {
			state.setItem('LastVersion', caapVersion);
			state.setItem('LastDevVersion', devVersion);
			}
		} else {
			if (state.getItem('LastVersion', '0') !== caapVersion) {
			state.setItem('LastVersion', caapVersion);
			state.setItem('LastDevVersion', '0');
			}
		}

		if (caap.domain.which === 0 || caap.domain.which === 2) {
			state.setItem('caapPause', 'none');
			session.setItem('ReleaseControl', true);
			window.setTimeout(caap.init, 200);
		}

		if (caap.domain.which === 1 || caap.domain.which === 2) {
			caap.mainCaapLoop();
		}

		caap.caapfbStartup();
    };

}());
