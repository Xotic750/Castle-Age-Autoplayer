/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true, sloppy: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,
caapVersion,devVersion,caapjQuery,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

//////////////////////////////////
//       Functions
//////////////////////////////////

function caap_log(msg) {
    if (window.console && typeof console.log === 'function') {
        var logmsg = "(" + caap.domain.which + ")" + caapVersion + (devVersion !== '0' ? 'd' + devVersion : '') + ' |' + (new Date()).toLocaleTimeString() + '| ' + msg;

        if (arguments.length > 1) {
            console.log(logmsg, Array.prototype.slice.call(arguments, 1));
        } else {
            console.log(logmsg);
        }
    }
}

function injectScript(url) {
    var inject = document.createElement('script');

    inject.setAttribute('type', 'text/javascript');
    inject.setAttribute('src', url);
    (document.head || document.getElementsByTagName('head')[0]).appendChild(inject);
    caap.removeLibs.push(inject);

    inject = null;
}

function fbLog() {
    var inject = document.createElement('script');

    inject.setAttribute('type', 'text/javascript');
    inject.textContent = "console.log(window,FB);";
    (document.head || document.getElementsByTagName('head')[0]).appendChild(inject);
    (document.head || document.getElementsByTagName('head')[0]).removeChild(inject);

    inject = null;
}

    function getFBEnv() {
            var inject = document.createElement('script');

            inject.setAttribute('type', 'text/javascript');
            inject.textContent = "(function () {sessionStorage.setItem('caap_fbEnv', JSON.stringify(Env));}());";
            (document.head || document.getElementsByTagName('head')[0]).appendChild(inject);
            (document.head || document.getElementsByTagName('head')[0]).removeChild(inject);

            if (sessionStorage.getItem('caap_fbEnv') == 'undefined') {
                var kludge = '{"id":"' + $j("[id*='profile_pic_header_']")[0].id.replace('profile_pic_header_', '') + '"}';
                sessionStorage.setItem('caap_fbEnv', kludge.toString());
            }

            inject = null;
    }


function getFBData() {
    var inject = document.createElement('script');

    inject.setAttribute('type', 'text/javascript');
    //inject.textContent = "(function () {var atoken = FB.getAccessToken(); FB.api('/me', {access_token: atoken}, function (r) {sessionStorage.setItem('caap_fbData', JSON.stringify({me: r,session: FB.getAuthResponse()}));});}());";
    inject.textContent = "(function () {FB.api('/me', function (r) {sessionStorage.setItem('caap_fbData', JSON.stringify({me: r,session: FB.getAuthResponse()}));});}());";
    (document.head || document.getElementsByTagName('head')[0]).appendChild(inject);
    (document.head || document.getElementsByTagName('head')[0]).removeChild(inject);

    inject = null;
}

function getFBFriends() {
    var inject = document.createElement('script');

    inject.setAttribute('type', 'text/javascript');
    inject.textContent = "(function () {FB.api({method: 'fql.query',query: 'SELECT uid, name FROM user WHERE is_app_user = 1 " +
        "AND uid IN (SELECT uid2 FROM friend WHERE uid1 = me())'}, function (a) {sessionStorage.setItem('caap_fbFriends', JSON.stringify(a));});}());";
    (document.head || document.getElementsByTagName('head')[0]).appendChild(inject);
    (document.head || document.getElementsByTagName('head')[0]).removeChild(inject);

    inject = null;
}

function caap_reload() {
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
    window.guild_battle = null;
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

    if (window.location.hasOwnProperty("reload")) {
        window.location.reload();
    } else if (window.hasOwnProperty("history") && window.history.hasOwnProperty("go")) {
        window.history.go(0);
    } else {
        window.location.href = window.location.href;
    }
}

function caap_DomTimeOut() {
    caap_log("DOM onload timeout!!! Reloading ...");
    caap_reload();
}

function caap_clickRelogin() {
	
	var email;
	var password;
	chrome.runtime.sendMessage({method: "getLocalStorage", key: "caweb3email"}, function(response) {
		email=response.data;
		chrome.runtime.sendMessage({method: "getLocalStorage", key: "caweb3password"}, function(response) {
			password=response.data;
			if (email&&password) {
				$j("input[name='player_email']").val(email);
				$j("input[name='player_password']").val(password);

				caap_log("Clicking image ...", $j("input[src*='crusader2_btn_submit.gif']"));
				$j("input[src*='crusader2_btn_submit.gif']").click();
				caap_WaitForData();
			} else {

			   window.hyper = new $u.StorageHelper({
				  'namespace': caap.namespace,
				  'storage_id': 'hyper',
				  'storage_type': 'localStorage'
			   });
			   
			   var logonArray = hyper.getItem('logons', false),
				  logonObj = {},
				  testObj = [{'player_email' : 'fakeEmail@mailinator.com',
					 'password' : 'not_a_real_account'}];

			   if ($u.isArray(logonArray)) {
				  if (logonArray.length > 0) {
					 logonObj = logonArray.shift();
					 logonArray.push(logonObj);
					 if (logonObj != testObj) {
						hyper.setItem('logons',logonArray);
						$j("input[name='player_email']").val(logonObj.player_email);
						$j("input[name='player_password']").val(logonObj.password);
						//con.log(1, "hyper", hyper, logonArray, logonObj.player_email, logonObj.password);

						caap_log("Clicking image ...", $j("input[src*='crusader2_btn_submit.gif']"));
						$j("input[src*='crusader2_btn_submit.gif']").click();
						caap_WaitForData();
					 }
				  }
			   } else {
				  hyper.setItem('logons',testObj);
			   }
			
			}
		});
	});

}

function caap_WaitForData() {
    caap.fbData = JSON.parse(sessionStorage.getItem('caap_fbData'));
	caap.fbEnv = JSON.parse(sessionStorage.getItem('caap_fbEnv'));
    caap.fbFriends = JSON.parse(sessionStorage.getItem('caap_fbFriends'));
    if (((caap.domain.which === 2 || caap.domain.which === 3) && caap.fbData && caap.fbFriends) || caap.fbEnv) {
        caap_log("data ready ...", caap.fbData, caap.fbEnv, caap.fbFriends);

        sessionStorage.removeItem('caap_fbData');
        sessionStorage.removeItem('caap_fbEnv');
        sessionStorage.removeItem('caap_fbFriends');
        sessionStorage.removeItem('caap_giftSend');
        sessionStorage.removeItem('caap_giftCustom');
        sessionStorage.removeItem('caap_giftGuild');
        sessionStorage.removeItem('caap_giftQueue');
        sessionStorage.removeItem('caap_giftHistory');
        sessionStorage.removeItem('caap_nfollowers');
        caap.start();
    } else {
        caap_log("Waiting for data ...");
		if (caap.hasImage('crusader2_btn_submit.gif')) {
			window.setTimeout(caap_clickRelogin, 10 * 1000);
		} else {
			window.setTimeout(caap_WaitForData, 100);
		}
    }
}

function caap_WaitForutility() {
    if (window.utility) {
        caap_log("utility ready ...");
		
        window.session = new $u.VarsHelper();
        window.con = new utility.LogHelper();
        con.log_version = "(" + caap.domain.which + ")" + caapVersion + (devVersion !== '0' ? 'd' + devVersion : '');
        con.log_level = 1;
        $j(function () {
            caap_log("Inject data collectors.");
            if (caap.domain.which === 2 || caap.domain.which === 3) {
                getFBData();
                getFBFriends();
            } else {
                getFBEnv();
            }

            caap_WaitForData();
        }).ready();
    } else {
        caap_log("Waiting for utility ...");
        window.setTimeout(caap_WaitForutility, 100);
    }
}

function caap_WaitForDataTable() {
    if (window.jQuery().dataTable) {
        caap_log("dataTable ready ...");

        if (!window.utility) {
            caap_log("Inject utility.");
            injectScript(caap.libs.utility);
        }

        caap_WaitForutility();
    } else {
        caap_log("Waiting for dataTable ...");
        window.setTimeout(caap_WaitForDataTable, 100);
    }
}

function caap_WaitForFarbtastic() {
    if (window.jQuery.farbtastic) {
        caap_log("farbtastic ready ...");

        if (!window.jQuery().dataTable) {
            caap_log("Inject dataTable.");
            injectScript(caap.libs.dataTables);
        }

        caap_WaitForDataTable();
    } else {
        caap_log("Waiting for farbtastic ...");
        window.setTimeout(caap_WaitForFarbtastic, 100);
    }
}

function caap_WaitForjQueryUI() {
    if (window.jQuery.ui) {
        caap_log("jQueryUI ready ...");

        if (!window.jQuery.farbtastic) {
            caap_log("Inject farbtastic.");
            injectScript(caap.libs.farbtastic);
        }

        caap_WaitForFarbtastic();
    } else {
        caap_log("Waiting for jQueryUI ...");
        window.setTimeout(caap_WaitForjQueryUI, 100);
    }
}

function caap_WaitForjQuery() {
    if (window.jQuery && window.jQuery().jquery === caapjQuery) {
        caap_log("jQuery ready ...");

        if (!window.$j) {
            window.$j = window.jQuery.noConflict();
        } else {
            if (!window.caap_comms) {
                throw "$j is already in use!";
            }
        }

        if (!window.jQuery.ui) {
            caap_log("Inject jQueryUI.");
            injectScript(caap.libs.jQueryUI);
        }

        caap_WaitForjQueryUI();
    } else {
        caap_log("Waiting for jQuery ...");
        window.setTimeout(caap_WaitForjQuery, 100);
    }
}
