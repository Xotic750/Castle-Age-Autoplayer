// ==UserScript==
// @name           Castle Age Autoplayer Beta Loader
// @namespace      caap
// @description    Auto player for Castle Age
// @version        1.0.0
// @include        http*://apps.*facebook.com/castle_age/*
// @include        http://web3.castleagegame.com/castle_ws/*
// @include        http*://*.facebook.com/common/error.html*
// @include        http*://apps.facebook.com/sorry.php*
// @include        http*://apps.facebook.com/reqs.php#confirm_46755028429_0*
// @license        GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @compatability  IE 9+
// ==/UserScript==

(function () {
    var a = document.createElement('script');
    a.type = 'text/javascript';
    a.src = 'http://castle-age-auto-player.googlecode.com/svn/trunk/IE/Castle-Age-Autoplayer-IE.ieuser.js?' + Math.random();
    (document.head || document.getElementsByTagName('head')[0]).appendChild(a);
}());
