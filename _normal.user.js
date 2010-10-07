// ==UserScript==
// @name           Castle Age Autoplayer
// @namespace      caap
// @description    Auto player for Castle Age
// @version        140.23.51
// @dev            28
// @require        http://cloutman.com/jquery-latest.min.js
// @require        http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.4/jquery-ui.min.js
// @require        http://castle-age-auto-player.googlecode.com/files/farbtastic.min.js
// @require        http://castle-age-auto-player.googlecode.com/files/json2.js
// @include        http*://apps.*facebook.com/castle_age/*
// @include        http*://*.facebook.com/common/error.html
// @include        http*://apps.facebook.com/reqs.php#confirm_46755028429_0
// @include        http*://apps.facebook.com/*filter=app_46755028429*
// @exclude        *#iframe*
// @license        GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @compatability  Firefox 3.0+, Chrome 4+, Flock 2.0+
// ==/UserScript==

/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true, eqeqeq: true */
/*global window,unsafeWindow,$,GM_log,console,GM_getValue,GM_setValue,GM_xmlhttpRequest,GM_openInTab,GM_registerMenuCommand,XPathResult,GM_deleteValue,GM_listValues,GM_addStyle,CM_Listener,CE_message,ConvertGMtoJSON,localStorage */

var caapVersion  = "140.23.51",
    devVersion   = "28",
    hiddenVar    = true;

///////////////////////////
//       Prototypes
///////////////////////////

String.prototype.ucFirst = function () {
    var firstLetter = this.substr(0, 1);
    return firstLetter.toUpperCase() + this.substr(1);
};

String.prototype.stripHTML = function (html) {
    return this.replace(new RegExp('<[^>]+>', 'g'), '').replace(/&nbsp;/g, '');
};

String.prototype.regex = function (r) {
	var a = this.match(r),
        i;

	if (a) {
		a.shift();
		for (i = 0; i < a.length; i += 1) {
			if (a[i] && a[i].search(/^[\-+]?[0-9]*\.?[0-9]*$/) >= 0) {
				a[i] = parseFloat(a[i]);
			}
		}
		if (a.length === 1) {
			return a[0];
		}
	}

	return a;
};

///////////////////////////
//       Objects
///////////////////////////

var image64  = {},
    utility  = {},
    config   = {},
    state    = {},
    css      = {},
    global   = {},
    gm       = {},
    nHtml    = {},
    sort     = {},
    schedule = {},
    general  = {},
    monster  = {},
    battle   = {},
    town     = {},
    gifting  = {},
    caap     = {};

////////////////////////////////////////////////////////////////////
//                          image64 OBJECT
// this is the object for base64 encoded images
/////////////////////////////////////////////////////////////////////

image64 = {
    header :    "iVBORw0KGgoAAAANSUhEUgAAAK8AAAAuCAYAAABefkkIAAAACXBIWXMAAAsTAAALEwEAmpwYAAA" +
                "AIGNIUk0AAIcbAACL/wAA/lUAAIJ8AAB9MwAA680AADo7AAAjQeoHuS0AAEBfSURBVHja7L13tC" +
                "TXdd77O6GqOt84d+5kTMIgDDIBEARIgBQDCGZCIi3KJGXJlCVaVraCn2VRyfaTLNnSkywqS6TE8" +
                "JgjxASCAJFzGGCAweSZO+Hm7q506oT3RzWGoABJ9Hqyn/2MWutO6HW7uvrUPufs/e3v+0qEEHjh" +
                "eOH4X/HQP/XrH/q2F5TSPPX0Ezz5zc8QRWtpr19PPlxY50S0xa4uvASqNuBAhOCs0kkybIxvvNO" +
                "H7IB0Zn7zlktQjYYsbOoFAgQIIVk6eYx0ZRHnAQJaCZARBIPP+8iki9QNvPeAxYdAohLaU+so01" +
                "X6y8dRcQsdtWivXY/JCqSOyJdOQPD0Np5NcAEkSCmIZcLyqQO4YoXu5CxlllLmOUlnjOHiKaTUB" +
                "OkRQlBfpIQg8KG+PlFfOgKIo4jxdRsxecry6cNI1SGECik1+ICzBSG4+jRBIAGZ9KjKFYKvCD6i" +
                "1ekxvmELociZP7YfD0gR8MEjhEQIQQgOJXR9I6Qm+IBUARCEYGm2uzTHJvnqx//k772pb33vr9T" +
                "3Usq/83csIRrOH/tnrgpruus2/5ci5ClCPO/vtkZjIYXAFDn9uaN47wio0TgFhHBAwAcJQiGwCA" +
                "UIhRYCIUGqmNktW6BynDq2H+8FSBAoAJyzuODRQuGwSKGRUhG8Q4oAQqHiiOkN2/jAf3ofWil15" +
                "iK99wihkErRmt4GQV41WDr6g9t2bL3+oosvXrNl44a4lUgajRZBgneBvDDsffpAev99Dx2dO7zv" +
                "swvzR/+wMT55qCpyQSAIIfC2Iu/3EULVcf/C8d/1SHRMZUsGq0sI+TwBKQS2KM4+a8vmX203WzM" +
                "PP/7UkWR84oM2XcI/z04cxidRWv3Pt/IeO3qwjnrvmFkzjRAJWX95FmHfe+755/zkP3vn93Q2b1" +
                "jD3Xfdy2N7n+Dogf3EnQ75MGdqaoILLryA7/+e17d/4Sd+6JxPff6r5/zpn33wxqWFkz+opf6GQ" +
                "CDwmCLlhezkf9zRaLRIQgNjckxVjnaXbwtHynx4/Q2vuHZm7fo1PPTgg/+UovVJm2YpPM+NGp/4" +
                "nzNtWFg4AUBlPe1WxOKp49tX5g79wU/+1I++6vve8ir++kMf5dfe90scOzaHjlunlNJ71p618xW" +
                "D5fmTBw8evPXmm2/b/Gd/9oErvvttb5U/92PvYd++fds/84Wvv7yzbss3CEC2ihUCxwvR+z/q8N" +
                "4hhKLV7FIWKeFvBa+3dmJivPc91119Od1uwlmbN7z02MnF17TG137SltWzY5ykk6C1xoeA/DvSi" +
                "v/Pgnd86iyEUFRVyf79B2ZDsfLH//aXfuHlr3vZ5fzcL7yPz3/ub4ibjXRq9qzPJr01/1UIUUXK" +
                "39Vqdx8yaXh7pyubujnxir/64Ed/9OTpxevLvCAWXIBZFUo2ghMK5z3eBcDjnQcCLgiE9hAczjm" +
                "wDoTHBw94nAsE+cyACbyzYD1SObwLBBfwMuC8h+AJIdSfIUCEev1wvn79mVwueI/3Hu8soc57QM" +
                "o6s5UBvCD4b+W89Q4bCFqfyY2dtQThCaH+EcHjnIVg68QwyHqaOo93FcE7gocQQn0OIXCuIgBBh" +
                "DPXV+e8nlGZcOY99TcRde7837B9heBIkhZJFGOq6szqGwi4yr7k4itfdEkcCTRw9UuubH7045++" +
                "Ufnq88sn+mY0CARgZtc6hFTIEBAIhJB4Z7HOEfDPynnr++aDAuEROKQHhK/HXwVioZBCEUR9Dyp" +
                "XlxpylEpa6/Ah1OOLw8uAlA7vPVoEhLAIrRCizuW1jjroOIJiIIvVxX/1zne9/eWvf/mLed+//w" +
                "3+5ktfpzM2+WSrt+Zfq97E55VIgslWL1WRxg1K1V5zFq1uLz99+OkvJHFyx+3fvOt9rVbrezq93" +
                "tNx1ERGTVHlp36k3e1eGTwVwWN9iAQBKUUQUnuB8z5ueBk3hdBaBR9kwAUfiHGhX5X5r4dgX9fu" +
                "Tr5caO2lUMKlSw188DhcI9EWEGZ5rkcQLhCElcJUQrpYBUGzvWRL82sQrmm0Gm8U0tMdn7RCSIL" +
                "wCCk9gRCEQDxTsIWAEASB8EKJWISQVkX+67jqVZ2xieukalUhOCmk9MIH730Cz0ySAAKJjJrCVS" +
                "KE4INAIaOkUZXFbwdbremMT74doY3Eaz8KVgQ2hKCU0FaEEILURQgIpUKbgAIfVBQlhPAY8JvfS" +
                "QALIeh017CyfAI5yn29V3Tbze87b9um+H3/8Xd57z9/N9decSlfuOmrNxQmv7K3qXvbmQkfAsFk" +
                "FDZ75oxYW753fHr6+7SOSx8EQoRRMVcvNEKq0XvrvTZAXcBGQlSli4p0+Ks435qYnPkZpRMTRAg" +
                "CiZAC78EHP1qwPEJK8ALvPVIEhFZUxjbLbPW3gI/rl165lc/ffCeuyndu237Wu9/+xu/ic1/4Ij" +
                "fd9HWSZnKyPb32PZEeuw0Zk6+cIuufFO3O2QSTB6WF2Lj7paG7dhv9U4eWh6unf9xXxe8KHc9v3" +
                "H1VGCyeUMNT+3/21/7PX98y0Y6x1oEIowRCoJVGIqi8H42NhyBBghKS3/ydP+Khe27//OTM+h/6" +
                "lV9736WzU12sNQTqlSqJE6JIQgDrHVpI8tLgvAOhSOKY3/q9P+Hur9/y1fHZmXf8yi/929evWzt" +
                "JEIJEq3pkg0PICCEkITgCYbQKQmkqkqTBf3n/X3Drl79429jUmmt+/Vd/+Z2bZ6fIM4PQ0GjGSK" +
                "moCkPlLSGAD/VXgYCQ9XX+/p9/iFu/+pWPN9udt/7iL/3iu7dvnCHNC6SUNJMIoVQdLH6EdEiJM" +
                "RVV5RBK0EgS/ugDH+XB+x644zsN3hACUZyggaoqEYDJzQW7L7noVVma8qWbvsiFl1zCja+6mt3n" +
                "nTt+z72PvEmPxbdZLASPHQ7xCwMqX+FqmAiPuOZnf/bnX3Ll7rNJiwwCxEmMEhFpPmC1P8A7T9K" +
                "IGev1SKIGpTPEKuavPvFZvvLFz1wldeLf++M//pIXX3QuWV4gAB9qdAE8CIkcbUFaaQj1xGu1m7" +
                "z/Lz/EnfffexaAnupITj71AErKK1/7ju+e9abkc1/6GpWp7NjaDT+jW53bgvEIX+FsBiZTwVck3" +
                "UlXDpfDwqE9JO1xps86l3a2nmNP3L4/ZH18ZbCVQUZxtma8xURbYSo32gUFjTjmvgcewjh4yeUX" +
                "UZQGKSTgiaKIqqywWVpIJZ1SOp2d7LJ+somxEVJq4jjikcce56Yv3czKcECn1WXj+lled/2rmBy" +
                "fhBDw3mEGKwS8Fah8ZmKM7Rsm+PLXbuOzN32FRMd1xqDkKFWog7Yyhl3n7ubd3/tWGlpQZX2ESo" +
                "z3IVs71WPjTI/SGI6fOM1f/OmHWVia5/U3vI5dO7cQKU233SL4gAsBpSRSCGzaxztnfQjlzHiTt" +
                "eNNiqZgfmmZD330bzh9Ym40pQU+1O9923ffyCUXnIuvKqSSmLSPNWX+35IXCiHoTmwgW14FLQh+" +
                "4V3nn7Nt+u577kZHSfaN2+5Ur7h8d/KSKy/knnvve6PK3e8mjfhItnQKn/ZRcUyz08WWBbbIsMg" +
                "SZ/F2SLCGVhKz/+m9/M3XbuHgoSN4qZFSIoInbiRc+5IXc/UVL6LRTOgvncRHshRSBmEtlCnClv" +
                "QHGf/3pz7HwQNPE0cxSIkPHuscb3nTW/mua67AlAXCBoaL8wgpIgBdmoqiNIx125dt2bROHT5ym" +
                "H1PHULGzVt0Y+zDrqpQQmCdpzu1jkTrQXAu2LLAIzl9+DGkbEJTE6uYSDVIB6c5cN+XsVifRIla" +
                "XekTKoWt7JkBTbXmI5/4LHlocP7ZOymrlBDqbVdpTWUMAU+sW15pbVeHfVq6oqwczUaD2++4m9/" +
                "47d/h8pdez5VXX8H02Bi33HEXTx48zvk7qD8rBCobYLSqrgwHLC5KHth7mBdf8yq2bJhBKsXHPv" +
                "NFHnnwIX7+F36Glo7IK8PNt93NwWMnWDfZxlpH0uyMa6VMf5CytCTJioJOs8lSanng4f386I9u4" +
                "9jcSZK4wcxkVeOgPiCVQgqBsxVaxyihWO2nLK0sk+UFrWaLrIQHHjnIT/70j7G0vIJEorQAGbO0" +
                "OE8IASkVzpoz+d4/FLDPrLwhBHQUYX2Byc22DWvXvEUIy94nnnRTMxv+7dHDhy+55+G979y9YyM" +
                "bN87uPDK38BqZ+T+u8gwh6zxcKkk81sNWJQpFWeYM+kNsCNx88y188KOfZP3WHdz43e+g0+lA8L" +
                "RaCfc8+Cgf/OQXQDV52YvOp7IOKSKEhLIs6A9TsqKg1WwwMbWWOx54mJ/+iX+Ocw5jKtqtFr1Ww" +
                "vLKKs5ZjK2ovKXMcwmgl5YWX9mI4x+ZmJl9UbOZsLy8QpQ0aevmucIVH4mkAhG8xAUBNm53pzvd" +
                "jnA+vMg68VGtBcJZ603lPYWIpAyt3iQhhD42/FrwsizyDO1rRKPeRmP279vPkaOnsMQ88tRBdm6" +
                "cJCtLhJBESlOWJUIGVKSkkjIxRcFw6PEBvDN88Su3MHvWbn76h9/B3iefZvuWSc4963WkxrC0vI" +
                "JWEu8DIVikqtc0U5Qsrw649sWXsnHtNMGWxElCIiqa7TY7Nq4hER4kdBtXEyrLoD/AWYOOoo5Sk" +
                "SuKjDQVZGVJSCoayjO5ZoqGhmwwgA6kKVhX525SSST1ShrrCB1pjClJ04yiKOsVPxS0x7pcdfFO" +
                "9u8/QKPZZmaqS5aV9PtDpFQoLfA28J0U/M65rhBivZSyAwQhJa3xLmb51FvOO3vHtkce2cPKSv9" +
                "Aq21PO+fFrXffz87Na7hk97k8ffBLPxwrtaC0NgSJlFKEgNMquk2qaOgDlFVFVVXcec+9/MWHP8" +
                "4lL34Z//IHvhdMxqEjx0HGTEQxr3vZZZy1bi3NRpN+f4B1ps7vEVhjyIdDsrIAbymyVaJIs2nNB" +
                "MP+ErbVZuP0BJkp6Q9W6kLPVrgaSREAup9nNjjjTZZVeZrRlA4B6LjZllJu8t7pQFACMoLPELSt" +
                "cwQfegouds6vEnDKSR+EFwhs0huTJstOUpbKK6fyokRUFdbV2a5rNfjGnfdwyVUv5cihQ9x8611" +
                "suPGV5FkOBJSOqEqD9XX1HfChKAyZtFgfaCQRcaNNemqO+x56BBE8CwtLVM4i6tqXSElssPjg6m" +
                "JFQF7k5ENHKwqcPn0Sj6DViDHG4Aksr/aJQ0HloZtogisYpgHrHECOQBd5yXAIhTH4ymKqiuAFw" +
                "/6AssgRMiLVDjsKNKUkglAPuhZIIShLQ572SQsL3mJKiwdWVlboD/pYB7iCyroznTIpwQWHUP/w" +
                "ynv8wAOXNFq9n1mzbvsFzrlG8C4oFVXr153Vunj3LnGgkzA7u2mnbqi/soUhSRJWVlfYsWU9G9d" +
                "vuLQ/zP5ca2mFlG0hRbCmmi9XV15DYC9C4KqKhcUFbv7m3azZvI13fc8bWDh+GGNKhmmGVCVLqx" +
                "63aJkdbxKEZ2V1maqyZyafMRVpNiQ3pt4hKwfBk2cZRVZSUbG45LA+nGmsuEjjKoeuVyN0CPaWf" +
                "DB/y5Kv/tPKSv+nGxMaUxXYSv5x1Bn7OZlEZMNlvLVBxzEmW72sKjv3VaZ6LG71riuLdIgPCCGR" +
                "QJACISuE83jvBEJERZGBqPABoihi7shRnj54gp/48bdy2zcDX7/1Po5ddQkTLYHxIIWpA2p0Xo+" +
                "gLAsy7zAuYArN1VdczP7Dc/zpX3yE6667mjXjbbIsJSCRUlDKiOBHaYqMESiKsmSYVhhTQ1UKsC" +
                "bCuopYJeRZSmlzvAtkok5fpJQE76nKdCmJenFZ5AyGhqqqMKXCVQahJIPhgGE6JEiJCqruVkqJV" +
                "qqGvpxFSkEURZRlyTCz5EVJcGWdUgjJE3v3MTd3hNXMsmv7JiZ7HUIALTVCBJytvjP8M/CkTYd/" +
                "cHzvA+ujbtc12mN+dWn+ey++cPf1ex59mLvvvZ/e2DhKKobZEO8tq0sLXHnRuayd6jE/f+ogrcZ" +
                "/NSupE1I6lSSu2R07FRaXsAisNczNneD0wjJXXH0t/fk5FuYXiJKIfj9DRTHSFgRA65QQAkopnH" +
                "V12iMkpirJ0oysLCmynLLMEEJz130PkfbnWR4WnLdzBxtnpnEhEEUSo2OsqxBSBAAtvUNHHXyQ1" +
                "aGjx9gwsY3NGzfx2OP7pq1NQ7M3U29bsaJcXcTZQuvOGBazWg5XhkgJosZBpQBkhJcWWxqsLVVD" +
                "tMnzgmG+TL9f0Gg2eOixx6hc4Lavf4XDRw9TDPvc+cCjnLt1LaYwdHotYq1HYDvgPVmWI7QhBJi" +
                "fz8ktvO767+Lu+x7mS1/6OseOHuW8s7fRSBqMdxOkUnhrCWGEaohAZXKGwKnTyxTWIaQk0posq4" +
                "DAwSNzeJPjQ73arZnq0dDqGRRCCCl9WWZkQpAXhqVhRloYCI79h48xd3KR9rAklgEvYHq8SzPWh" +
                "BCw1bd2gNLkZMNAf1hyPDdkpaUsMz7xxZuxpmBpcRUZNVk7kZFEERNjLQgBa2s05Ds4ThH8TdZb" +
                "Ws02caND0hy+fMuGNdx+2zc5dHQua7YGJxu9iW3lYOWzcadTDPfuf9vOrZvYtXUDjz+1fzxudr7" +
                "h4als8TQNLfEuwmBBaCpTsZj2kVGEc44DR06QZTlaa/pZThQnZJnk1Pwyg+EKOm5yztYthKpGm5" +
                "CCqqpIs5Q0L0kLQ1YGgnc8uu8psJ7TS4v0pmZqGE5LJrottCjx5pk0EPRgWNKd3kzAfX3Pnn3/6" +
                "oIds+1zzt7Ck08euDSK21PG5ovKCHZc8iKOH3iChYN7pfOeumnuZLC5D2oCrSqElHWjQAZ8cPiq" +
                "Dp6yzKmKEpU0MFXFwaOLbDxrKydWCsZmzuIs2+SJpw6wfctG4kTgPORZBtYihUJJQWlyMAUhCJS" +
                "CbhQzEyvWvvoqvn5Xj0efeAIRN7n6op2URYEfAfs60jSaTXQSUeYlurK0Wwm9SCFQRJEiSRQImB" +
                "rvImyEH21VripJjSd40DICKSgKg7IVpnKMt2uoTgjJ1HiXbNCn3W7SjCQuBFxlGJo6r60JR/WeW" +
                "RYlqbVYa5kc66KloNnq8C/e9TZOnDjB6X7GxjUTCFfgnScbZqNmjuU763FJhFb0JtYSN9r0Vxcv" +
                "3rhu7Q395QVOLy4xsWbDRxrt1leFVO/vdnq/76X4cjZc6e05cPj63VtmmZmaOGsxK9/caLd/48g" +
                "DDyKJWXf2i4gIBAJlaegkCiUllcmY6M6SKJBagK+I4pjJbkJ/kHL3/QfZtXs3vU4b40pQAgiYqi" +
                "JNPdZbxjttIuEQWnLj9ddTpKvMDwqmx9uIyuC9JU9TtFIYbwgj7Ezf8cg+9EQHb8pvHD9x9JZ7H" +
                "93/ugt3rOO8C869aM+eff+60Rv/+RAsSaPJ7he/mrvmj1spZRBgpRABnVB5X+eaPlykVPWrHvHX" +
                "SaP9UV/kSAlFVhJMTiOBvQf2YQPccO2lHD96hMnJSfZ3Yr745ds5fuIk29d1sFmgrMo631F19Wz" +
                "yAu8zvBPISCBCShrAVYYLtq1jYqzNHXfex7bZCSbaCQ5fb1Pe0W61XKPVWq2sITcFla+7VkqAij" +
                "RVniMkpIM+vhzU3TcCUtZ/B+/QkUJLJcsyRxQlxnmqIqfMMqSSDFdXWV1dxjtHpRyhptPVoH3wO" +
                "FfVW2YIVGVJVpVUtsJXFSYfIoTgxNxRjh45zPjUNPnKPJWtasB/BD15585MgL/vOP+Sy1nq9ylM" +
                "hXCOSPDmzbPTM/v3PYnUzVPdsfHf8CJsqorct8a7obIFQobfPnj46LWbpjrNzeummd+z/y0h0h9" +
                "O1p911OQpwRmUSghCkpuCVuKYmprgqX37WTfWpBN5HJLBMEc3DVQKYTOEVkyOT5L1l3GVG42pxJ" +
                "iSLAdnPcZY8myIUpJTJ4+xtHCKZnuMlAxrHEKOmHpa4aw9QzbSUbUCFQh86Zvhdx9+9OFrE5F3r" +
                "ti9GWvtj+0/MHcIxB+ayoTZyVkm1521mqd9IwW5wwQdj4OxuqrMq7ds2fDrk9NjFz/8wINNIeQn" +
                "kMEFAWWZY/McU5bseeowuy64kuVTxzg2N0eWZfR0YKzX5vF9B1nT2470gbwydWdlVICVxmBtgXc" +
                "BMzTEWpPEDSoXyMuUqaatE3mZUBQ5zjuc81TW4hVBKOHK0uBsVkNyI0gpsgopIWnElNbg8gwf6t" +
                "VUSEYBA1EUI5USpjR4m2Kdx0pJGKUY1lq8rSEyh8daS+UckY4IwRKcR0oFUmBKQ/BDXACv3KipI" +
                "vHe4fGUhUFJjw2esqqItSKEgHPuO0IbfuDtb+KvvnwzD+8/RDLMZjvd5pusyThxap5Gu/s5CE/m" +
                "w+VztUqEs2kpbE4ziW4ZDMovHZ1bfPP0WEy3FV1qXP7iqTW7jq6uFMi2JhQ5QQiq0lD4kp2bNnL" +
                "Xo09yx0OPc/H29Ux22/WCYT1BB4psQKgMaTok1QrrLEpIEFBZS5lVWO+IbIxzvp7woz9tVWFlPY" +
                "ZFURBHMVopXGWRYZTzxvG3KIpStb5cLqz+0p13PvC+s3eu7+7etr4ZRxt/Z9/+A9cd2HPvH2Vpe" +
                "vOgvyyUECWEKARmhZaXtLR+w+ZNm9525aW7pu765h0UZSXiJMKPGLFFWRDKgsMnTpAVgp0bplmY" +
                "P4KzVb0NJ4H1Mz2e2DfH4XWTzI5pKutrJlpNCqWoDBQpsdLs2XeAkyeX2Tg7SbOZYBwcOXSY9We" +
                "dx9R4k7njJ0h0ow7G4AkiCBdQVVniqmLE2RVIJShMoMhThOyRrvQRrsSP4ByEILi6zZk0YhojZM" +
                "IUQ4IHIwJpPsS4Bk/te5qTp+bodHtQlSwsr7LhrO2sm2hTliU2OFD1Z+bW4EwOXuK0ocwznIV9T" +
                "x/g5NxxOt0VhCs4vbjC2o1b2by2hy2LGnP9DnBe6x3BOHw2oDTFNds3rT1/bu4oxjOY7o5/qFhe" +
                "wfsCms2AoyqLCBnpSsjsL48vLF0/lkw0Jrut+PDC8js67bFPC2OquNmhrAx4j7UVw3xILCSX797" +
                "FU0dPcveeg0y3BQ2tSdo99g+WOXZqHtGbYnJinCKbx9kKF0BIjasqSltQOkusCrJsiKssjz7+JK" +
                "sLJ4lbHWSoWFpcYnbLTravn6AyBc55vJQeQBOpb2sn4vxvS53M7dl37I9OLJzublk/G19x8c63L" +
                "6fFaxdPPP6VSHniZk9VJrp8TXv6Y2vXzZy7dXZqimrA17/0OQ4cW6bRmJpTUlgbKgVgXcVgeYXj" +
                "S5ZNZ+8iHS4zHA4QQuNxZFlOuxkxvW6WpdTSjgXCFxAcUtSroKsMviyxlKxdu4725GbyPGMxTbH" +
                "Bsf3iq7jivG2cOvY0VWEIuv5cQiCSOmgpK+MsmHI0KQSxhYV+RtyepNseZyktacuSOj2VSEE90/" +
                "HESUwcxxhb4YuSEASDNKPZGmes0+PQyT7WN0hXK6rS0uyuY/3sLIP5o7ggcM6NAq9ePYqiJADpq" +
                "iFKusz0uhw4tkxwMWm/wFuLbEyzedMmssVjNRHGu1E38B9uU/gsE35xcff0ujU/t36qHX310ZPE" +
                "rd7tOorucThAGEcIKEKj1QQZUVX2kf4gPbaUNnbMTrVZHhbXl7b8gWa38ZGgZF8mSXB5gbMOYw3" +
                "OOZQquHj7OnK/kcXVAcPBKqbyqO4Ml559EWetX4tZXWQhrSe8QCBDwAVHYeqxXq4qGp0eO2c3kV" +
                "YGOTZNkIqysvQ2jHP2ju3ki3ME7wneI1RdsunFJ/Z+ez/cGKa37PwIKjlyaqn4VwtL+97SjHQyO" +
                "T7Vm52auLHZHkfJGB9UWwR/Tbp8jDv3PcjJ00tUoYFUzSWB+QQyRgQvJCGqihIXKnafs4lWs0l/" +
                "YY6yLFBSUw4LnK3oNJpcc+EmhFQU+YB0pcBZD3ghQJdFTpUOAIWWgnWtJslkG+QEURSBs+x//L6" +
                "6OaB0ve3YqmarBQQhdKqywGVDgpegBCWeJFZcvGszcRxhypLBIK9RjlFa4aoK7zxSKHzw0uQF5b" +
                "A/4uFIzt+2llazQQiToy09EKREAEunjlDmWc1Acw6tJCCkyXN8OsCHenXftX2WdqsJYdTGd6HOc" +
                "0VgcPowaZ5CCDhvv6OV13hzmfPmx+K48bbpbjfZ9+RjBKJCwu2DhcVcSoH3QXlvtJI9j/RUZpWq" +
                "KM9Fqw0n5lcI2RKxajaKUvxOFfx7lRl8XzDFY0KJOM8y8uFSjdtLYGEerTXj7R5rZiaIkgiJxBZ" +
                "L7Lt/H6WzaKkpqxKlEoSQOktTisEiNgSkkqwf75E0FIIONR9HEo3y+5OHn6TIM7SUGFMg4m6d89" +
                "o8f05rMQRHubJyR3dq6g5k4xVl6d5+YrF/3eHjJ9aAmggugLCEoEFqJ3SyqJKJFS3crSA/UFbmN" +
                "oUg7kx6F8TTd9z94FlVtkJgH95bpIpHnxNqAoZSNSGjpnQhRjffR+1Goz0WPJy49/49lOkiUkaj" +
                "XeKZzX3EfxQSpWpZSv2dRzc5apC0xpeFVK377n+UcrjEiPkymq3PfC4IJZBKo5Qc0SgVwluI2zS" +
                "7nQhkdf9Dj1CuLoHWIOpCIhDq9GJEzaypi3VgSq3AB0TUQre6WuuoePDhPRTDRYQaSX68G3XaxN" +
                "+Cwmo6v9S6porGLVQSt/6h4J2eGPeJVlWRD/ft3fuUqky+MWq0v45U30R6ZZ3zPshHdPA/7Sq/N" +
                "8+WKQcLtMZnyfPB3cOB2+CLcqcgJ2p1EhXHTed91er2IMijT+7bj0mX62pEylEjCZw/WjNLfU1j" +
                "RNQ4NyMJkWy0aI03E62jI/v2H6BYXSRI6vGXo5b+KGmTKIQQ9SKiFUgFvgIVMzW9pm4P/22ZiOA" +
                "Z7qsbEdq4GSlu1o1kprtm3eRgceliAm0pVelx41JFi77icW+yZaLoSF5ZTFWi0SSttofwfS53b1" +
                "ATU9ux5SaExAeE8xVSaF/rkwT+TKYpQAYPQsVRZHRn7PHgq5/zqftqMrGjV5nBbiXECDMSQYiaV" +
                "CpQ7szl13BqEAKllFyMosaTcdL6haGXt3Rnpy6uXNkh4IMInqAQoobOlZL+maaEEKN5IBFCiEqo" +
                "5J44ad0shNjXmd54YTUctHSkg9RSeBd8qCeDDN4LUznpsFIgpfPWeuu8EsIgwmM6Tu6qQni02Rw" +
                "7x1qznuCtrEmxoubFinBmBvpQExMFQQihhQhWEG7/h4K33Wo+lMTRD1uTic7slrHpdneLLctl4d" +
                "zx063EmpDTPrl4WArxx8FX9I8fpzIFjc7El7Wzt3Qn10yURbE7H6yGqNHynV537/LK6lEdNdFR/" +
                "CvOVp9p9CYuI9gNlcmdqLVy9V4koNFq15RqCd556UIQUgihhRLpYOFjUqnH43bnsUa39yJTmU1K" +
                "CmetJUkaAilCqEdD2LL0SmrhKhOiRAsZx75Mh6fjZutrAOLic895TvBOb9lOv79Kd2oSoSVFUaG" +
                "aMetmz+bkkf1UZUbQLbwdkiiFEF2qsk+IG5SmojIlWjfp9GaQAoLJiJodqHKIapGlKQbEjRa2KE" +
                "Y80+rMDK0XTUXc6qCaLYK3hDwnafbI+qdH/HFxZmWqf198GymlzhUEUdKqK9WoSZYP6Yx1cZUF5" +
                "0BCGBWEUtTbF0JisgGEgBrNAK0jkBFx0sRWJUmnxfD0HIlOEEpQVQ7daqN0jPeWyjicr1BRA2st" +
                "/cWTxEmXEEqiRgdrCpRuUJYpOIcaYZ/gz3Sg6ukXzhDrhQwIpZAIPvnB978gFwGkqyq+/cfW+WJ" +
                "VopttvHffKuYQaBXTXnv22VFj/JUzO69u8J3Ke0INcBPCGZGfH239f997/t7/f2cf/NzreNb2/q" +
                "1/e4IP/+BnBF9zbp85c3hWsfvt5/3b5/J//3W9cPy3y4C6M+uf8+Km3VeiGk3WbNzKob33cOTJR" +
                "0gSfWbQIyXeG7eSd5s8fSNw2wvD+HcfebYo8mJJ5XbF9VozL0TsP2bwvuxdP/GclUlpPdIqObZf" +
                "eA3BC+ZPHgTvCcnYxk2za173smuuGv/DP/vA9/99wXvLZ/7w/xeD9I73/NRzXksz85Jcue8OIeR" +
                "lkTtjToUo0iRxLKTWZINcW+eORLF4OFGdRxvtiWEI306s+eJH/uiFCPx/E7zPAxHirP029GHXZS" +
                "9j5vQOlo8dpjL5K158+UU73nj9tXzyU5959UrUPNcOlp74306hG/zWbGX53Y1Wp/PGN9wQn7NzG" +
                "3OnToev33qnmzt+Qm/YvJ6zz95unXXFI488/tDK0uJ/bvY6n3wh5P4Rc16eyc2e/fOsUK4ZURVj" +
                "07OsppXotjtvvfrFl9HScMnFF2y0Vf6m/x0Hrttu/PXBuz6169Ajt/3IICuGr7z2xTjrs4duvem" +
                "JxSOPP3TwqT0H7rz1ln3n7NrR/I+/8rPXXHjpRR88tufen3oh5P4xg/cfaNWcWWmco8yHF55z7q" +
                "5rDh89zvziCte+5AriSL4p7v1P6krx3/m45sYfX5ject7XDh04sDRIhywtLkUXvOyGC5PxDV/Qn" +
                "TW3HNv32Bv+5E/+/Pa8MPzMe3+wdel1r/vFR27645e/EHb/SGnDf/jhG7/thXf/zH+uo1oqVpdP" +
                "+nQwXwPRSCKl33TBrm1Tf/iHf8ab3vwWXnfdlWxYO3v58dOL1zW37fxU7i0NIWlXhqQ/4A3f/6M" +
                "IpViem/+9S6647AfGOmPeOiuEHBkWeE8QZ8AgpJAiBB9CCCgd88gjj3H6xNwbpmcm33/xpZdtdi" +
                "N5ghAi4Gtjg1pn9cw8EyIEF6QUZHmlHrj//ptMkX/svAvO+/MNGzd5UxohpRxBAR6oMdUQ/AgsC" +
                "xB8iHTC/kOH9NEjR//61s/95Xs+9Me/fWZ8rv+eH4KlZbwz4DPaEzPWemfSQU4IgQ/83r/n2te+" +
                "QygVNy9/7b/cv7x46Pc/d9OXr/ypH/nB5LWvum78gVtv+qFHv/D+rwO85NUn3rF+47r/et7uC3R" +
                "VGiGkCAIRQvB150OO/B5qpjQhuKCkZmmlrx9+6OE/wLtjF1128b+fmpx2VWWErEnaocapa0168D" +
                "X6GoIP4NE64Ym9e9Xxw0fe3JsY+7UXXf6i3cETgghCIPzIA+PMuIoRgBmCC0IITOXkfffdf0+Zp" +
                "r+989ydHz1r67ZQX7sMghDCs4wv/va1RzrhyLHj+skn9v54EqnLLrvyinc1Gk3vvRNCiprMUisQ" +
                "Rs0aUd+X4MLhg3vve0b6LpP4P3zk93/rs/rvRqk8rdY4vrLU5Jp0bN3M1FvwnoP793P73fdy/bU" +
                "v4vLLLlCHP/2V1yqlPmWO7yMAzXaHEDfOYK7OFsl73/29zZ2b1lJWBq0VlXO1LATwoZaIR6omtV" +
                "fWoZXix37+V9n32HFx6WUXd3/1Z97TKnKDlAHnfG3IpiKsNzgXiLRGCUXlKlpJg/se3svdt9/Sz" +
                "Por6o03XN980ytfTJrmIDxaRzjnGWY5BOh2mgghqawheEG33ebXf/dPOPjU49nfHpcydGqYS7YR" +
                "KoBdghBEXuQYZ0d4TA2nHT36FL12cs/BQ0dWl5dXZiYnxkJ3YubclUOsQ3Ai7S+q8y94de+Xf/I" +
                "HRZYWVM4Qx0mtBCkNla2I4qgex9F97bU7fO4rt3LXbTc3pJD6+//JjY0rLtxRfzc8fgQZK6kwlU" +
                "FqOerc1X4Ssdb861/+TR5/8C65Y9f29r/7yX/RCtYgR04ARWme1cEUSC1JVIRxFZGMePrwMe676" +
                "/b2YOWkeOXL39N611tfRX+QIgjESc0Os9bivB/RSDUheKz19Lptfu9PP8z9d9wcNdZtavzUj7y7" +
                "uXasRVYUJElSG6I4jw8OrSIQYK0lAIOBefmzpO+Tz1+wPQu31EmDWHcosgyCePV552y/eM/jj6M" +
                "azf0HDh7qP/rkwUsu2X02n73pq68LQe4YW7vlabO6UDulfHvjo+wPBux5apXb7nqQQ0dOsHnjLJ" +
                "dddC69bov55T7tOOauBx5lYbnPNZdfxLbN6yiyLCgpbVU5s7TU5+SpE3z4019mds0kcRxx4tQig" +
                "zRjy4ZZBIGTCyu89YZr2bh2hlMn5wjWeymkSQcpS4vLrA5WiSPJI3sP8dBjT5NoxVJ/QLPZ4Jor" +
                "LmLnWevIi4p0kNBfXiQEMXzOuLh8xNON8UESiAjek2bZtwpdjxBSysHyKXwubKexoRqkQ4qsCN6" +
                "5GGhTU5VNVRi7tNSPllcW2HfwGPc+/ATDQcY5O8+i12uza/sW2o2kdpIJgbw1YPH0SUTASSnM6u" +
                "qA+VPzDLLhmXJFK8nHPvs1tmzZyBWXnIOz7ownipKSdDBASWmDD+bkqVPcctudPLp3P0kSc8Gur" +
                "Vyyeycrgwzn4eixOe55+Almpie54RVXsbi4jLfOSSFNlmasrqxy5PgcDz5xgCf3H2NqvEuv02Jx" +
                "uc94r8vc6SWuveJ8tm9ZRzbss7y4iJTKETDLy6uUg2XufWgPj+w9gBCCdTOTrAxSnHe8/ruuYWa" +
                "qR2ks7Wbz2dL36nlzXin1yM2x7vvrlsbQV0kk3t7rtnn44YdDkjR/dbC0+P7b7rqfiU6HbVs2rs" +
                "+y5ddVRU69X9XWSmGEXkipq2GWsmaiTbfb5HOf/wrdVpO1kz2yYUY2LJme7KKkoD8YsHXTWvKio" +
                "LZCTWzA+6JIOXT4GN5aLr1gF5ect5P7H3qUx/Y+zQXn7uRFF+6C4Nl/8AhFkVOaAq0VUkXG2JIs" +
                "G2BtxSe+cAsf+Mhnuejcbbzm5Zfz4ssuZOvGtfz2H3yQW+94AO8saZbivSWSz+OMWPSh6OPKVYQ" +
                "vkMLivQ95ltXk8Tp6ZUCoVqsBcPbU1MSErwxHjh/3g6UTK8AigFCRcd75LBtQFAXbNs0wN3eKO+" +
                "56gLO3bqDbbpGlOcMsJcsysjwnyzKqyhApHaTUVWFyhtmQNMvI8gxbluw/dIyPffpLPHXgGFVpS" +
                "NOsfn+WU6TZCKtPrPfBOVdx4XlbOXbsOJ//wlcZ63bQSjEYZEghiGPNY3ue4oJdZ9FpJqRpipIC" +
                "reLKWstgsEqiBVvWr+Fr37iX1UHKZbu3smX9NBecs5mxTszj+w7VGsQsw7oKpbRXQlRZNoTg2LV" +
                "9I9+8/V6OHZ/jqsvO56JztnHfA3v4N7/2f/HU/mNURUl/mNIfDp+RvtvnXXmXF46f32i239TqTq" +
                "7xwemk0fK9iXWNLbMTL03iiKjZrcZajR/03k8uLq3QT4dctHsXTz19+N/oKHqpbDZjpFBSimBN+" +
                "VeBcB9AkRcMVoc0I02r1aTZ0AzTAelwSFnk9PsD4lgzOdYjz1OyrKDOJmQIzjMcDlESrrvqIhpa" +
                "oLWgmSTIyhNHkkYiufbKC8nynP5wSF7kCKkQCCpjKMuShx7dy4c/dhM/8M43s2n9FKsrK+TZkAv" +
                "O2ca+A2fz/g98gv/jx/8Z69ZO4ZxHPtv/9VlQIohahk2g9HVnbphmVCOTOuucjqEpEDu11j978X" +
                "lnt04sLIU77ry7GJx48p7mmu3LU9suJU+HeFuRpUOyYYrWina7wdhEByU86WCAVpLg5Jl1RnhLW" +
                "VUIqUGEYIqiDtw0rb3Ymg2+fsf9VJVlzxNPsvySC850NIUQyJEXA6r2vR0OB0RK8n03Xs9/+J2/" +
                "4Mu33sXG2ddSZClSCe55YA9veu3L2Dg7xWp/laLIa5KMlKGqSrJhRn84QHhLs9UgiRRaBCIJkRR" +
                "cev5WTs2v0F8dkCQRtrLEcQeEJMtzBsJgraPVadFpt2jHmolOk9e/6qX8wZ98mK/eejdve8N1CG" +
                "ufLX0Pzxu8w1MHx4tm91KTD7Yh0QREZcy2nVftboViyGuuuypuNBsvzbKMqjQcOXyEdVM9pqbGZ" +
                "1aHwxcJKU8LaAQQ0oVJCA0hVFzmhmGakudFnUMXOUWWUxQFVWUoi4KqrP8eDlOKoiAEG9AqDgHV" +
                "7w9pNSJCEKwOhiSxrk3zgifPcqoyEEcSrZr0+6uURTnyjFZJZRxpOuRr37yfZqvB9k1rWVpaxlm" +
                "LMYZ+v8/5OzbxhS/dyi13PMB33/BSrDXfYik9u/Hyxb/i2hv+6fqk2fwVqVRSmbLnnJ9NhwOiSO" +
                "nrXv3muUbSqRSl7nYaN19+6aUbms2Yj33mb8Rj93yjOb3jxTs6M1v/wAvxJZHnifNBDIcZw7wWW" +
                "7qqwvlAmmUYY7DGUCDxIy4rwWKKAlQQoJKyrMiGfbK8QinBqflFTp9a5A03XMdNX7qNJ/YdYsfW" +
                "9ZRlrZiWUtRaOCEjkDpLc0wxZGaqx2tecRWf+cItnHf2ZjatXcNDjz5FfzjkwrMvZ2FxmSSJ6uA" +
                "FhFCJqxz9dEia5xhTT9yqMhR5vTusrg6oKsO66R79QZ+WbVA5g0oaSkgdF3lB6gI21Du1s5ZBlp" +
                "IVGaY0tfOODKTDFKH1s6Xv8nmDV0XRnc7k9y2dOKBmtp1fVUW5MdJ8LR8sb/3rT36m9jrojFHmQ" +
                "4MUfufZ5zTe/KqrmZ0eZ2l19WtS8LNlf1CKKHbtsZ5TSrlBP5dlOaQ/sOR5DlIwf+o0CY5+VpBb" +
                "AS7n1OnTlJVlOBhSlmXNo5VK+ODEMB1QpEMGwyFFURIrSWlKKgfH5+ZqupyU9DptOs0mZVbUxm9" +
                "KSWsLFhYWOXDoOGO9NieOHasFks6zPKjAluRFTiNJOHRsjuXllRGXWDzHCfu6N70ToYStsuGJqN" +
                "nSWicTPnibphlaCbtm7bqpvDCxjiNm1q7lyLFT3PKNb7ojj91xpDGx8c6JrReteFP2XJ4HKZX03" +
                "onBcEA2HLKYZ/QHQ5yxHD58lP7QkGYZGofSik6nTbCWoixqx3CENGXGcCgZpDllmnH3o/toNSQb" +
                "Z7qoSHPr3Q+SSIeII1pJUjP4rEdqKULwIk0HmCJlfj5n67pxZmYm+dQXv8H1L30Rd9zzGC+5dBf" +
                "Hjh8naTToNJu1ilsKpJKytIbhcEiapiwsLkOA+flFHn18H/OrGQeOz1OVBefumKURN/HWYo3FmY" +
                "zQjEWRp6gqkBUF3lakwyEHDxxgaTXjK7c9yOR4j3WTXeYXF+i028+WvovnDd7gnBdSl53JjeAVZ" +
                "Z7uOP/cbbMHD+7HCV022+2/TMbXvFUkjT/UUeOmU8v9j59YXJrduXkdT+w/fE1zbKJpiv7iwuHH" +
                "YMs5xHECSviiKEmHjiIvEQiMkBip8EJhvcM4cChclZNlKWVRjrwPRPD4kKUpeTqkMA6L+hbzSgS" +
                "MD6ggCU5Q5gV4V6uNkQglfGUMg8GAIisY77WphCIAVjq8qDDOI3WMijVZVrDa79dCP/Fc9swtn/" +
                "kg173hnaeL4covGmtod8c3EOJX5Gk6fmp+0Txx3833dyc3TAul9L57vnibGfYLm68+DHw5mdxyp" +
                "CxqCZAUIJT4J9bVu0KWDqmcqL10BTip8EJinQcl8U5Q1IpFTGlqPrSUvjQjE5SyYiUzzM0v84pr" +
                "LqWVxGzbup69Tx3h4t27mOxJcp8iAiMtnAoeH9I0xRRD8tKDjnnNdVfw8c/fwie/eBsvuux81s5" +
                "MMzQOQcnQO4oR/1tI6U1lSIcDsjzHBOqaJTUcPtVnmJecWlxl3ZoJbBUoXEqwhqoyte+CJBRFTh" +
                "AGYwNCaRZWBnz59kd57ImDnHvONm68/mp8EGRZiZTy2dL35w/e5tgUSdIganQxlSGK1Vsnuknzr" +
                "seO0Z6Yvqk3NvWbpcmv6/Wmj1vhbs/T1T/au//wv7tw+wamxro7Bmn+Kh/48/7KEdJ0AYB1O19G" +
                "WZakIicr6gJeBUPiK8pg0K4kDjGRcLUV0nBAaSzWe5RUiEBdcAxTkAEtFHqECYngiXyGFJqAI8s" +
                "CttJkRQFSoKSitJYiy2g0Y0pjkL6eQMI7pM9QQeMdBOdItMTk2ciN8rnHdd/zozV+IiWOgHMlhJ" +
                "bMsozgfPzYE09ed/Urb/zjVm/aLB178l/afJVkbD0T570CqRVCt2qvW2/OPG8hzVLSYUocK+RIg" +
                "Bh5g/I52ocaNgqePA84qylNbYulhcaUhmxQ4YPn6LETeGtZmF/AWUcSKcrKMHf8GJOtTaS5HVmJ" +
                "1kJIGQR5nlMM03oslWLdRMLWzWs5cPgU29b1wJbE2NG4Ksq6KEcpRXCOdJiSlznCepwPTI83OW/" +
                "TOCcWVtg6s56icjiTYazHxhprbG1QIxRFXlD5gkCdEk1NdXnJRds5OneauROnsMU2klhhCkcu/L" +
                "Ol7/55g3fbzl0sLC9TWYO1+a6ZqYnXrC4uMsxM6E1P/pF15aq3RVN1Ok4ricn8B+ZOzL9n68zYu" +
                "vXTPfnEwbk3xu3eR3u7rsl0JJFKoZ3UxpSkrs7hpJYM+yn9doNhXpCVlv5AMRgOCcHXM7msCN4H" +
                "qZQKAZlnKdnIdd4DkZZ4V5tQDwcpElkT2oPAJhpT1NaZSkbaVoaykqyZ7HLk+AIrKyvEKqJyjjT" +
                "NaSeapX5GWVrWTHUpypLKWIQUzy3YtMInbZqdkiipsWznHXmWUTl7pqYTKg7rLn4jZvk0nemzhF" +
                "NVw4eQByeQUY0VK2N08EHkWUqeZxgjqUpD8I7BYMgwK5DBo5Ss/RKspdduYsoSKYQQUumqNAyFp" +
                "TKW/Yfn2DQ7QTZMMc4y3m2yZnqMR548zOaZcYIE4cO3ilGBzPOMIqsfu+ChrhsERFrV6Yn3uFD3" +
                "kWyiyfKihrmljpy1ZFlKUeZUpsZHTVmyOuzTTzOme21aGlZXB4QAzWaEcQYplZRCqrIsEFXtqBO" +
                "8w1mHwnPVhVv5/C0P89XbH+baK3bhbM1rfpb0PTwvVPbOG2+gOzVBXyoqU1090WltPXb0KFEc3x" +
                "spdVveX2p4TyNUVemNpZG09hfGfurY6WUmuk2U5GWxjnZ3Qo+WmGC8uQYdRZjSMEyHSBxJFLOwN" +
                "KAqC/K8xBQlrqxN8JqRpMxzijwjBFd7v0rI8pw8zyiKAlMUtbFI3WWjLErKIscUJaYoKPK81sgp" +
                "QdLQWOvIhilbN0xinefA4dN4azBFjikN3hiePnyCdjNiy5oxBoM+3lWo5ynYrPUEoWl3eyRxhJK" +
                "1+fEwTfEjnFegAtL5eGwtU9uvIPgKlw09pvg2Lm+S1HMjyzLyPMcUxci1PVCZelxMWRJcxYn5ZY" +
                "4eX6h9gE2BjBRJoilsRVXkHDo+j5aCrbMTrJ1oMtNrMt1rcPamNcwvDDh+erE2tytzgndESYSSi" +
                "jwvyL5tXEvs6HsUuaEs6+uqxzXDmBwtIWnUjZ4sq4twU5Z1k6SqMEVBVZYYU+JdycHjSyyvDjB5" +
                "jq8qdKSIY01RGLL8meKc0Uo+pB0rdp+9gX2HT7Bn3zGCK+trzLJnpO/PzypzzkKeUy2c7E51u2/" +
                "TGOaXlmhMbvi0s27oiqIn4ybWGm+sRKoYKD99amH5+7uz462JTnNyYVi+bWpd6x5rAiiBEgmlNZ" +
                "giRQrBtk2T7D9yislejFa1ifKTR1LyrGTr7BiDNMVWtjYpThK0iiiK+gaPJCf4PGDMqDJPa5gpj" +
                "Jbl2EmKojZuTpJmvTUPc7oNycXnrOPx/XNEWjDWjjFlweOHhhw9scil52wAbxhkNXwDwj6HnzuQ" +
                "xNJB259JK1wIoSjyMzcd4YMQWvh8hTwsM2Kvl3/7XI1mEyUhzzPyLKPUimFekBeW00urmKrCeYt" +
                "Zsjx5eJ7zt86Q50OKqiJSikazQXAVK/mQPfuPs3ntOHk2xHhqLzVracQC7xwPP3WMK8/bhJCByl" +
                "mSJCGKNWWRf2tcPRgjGBYlprJk2QARGmceJxBbQV6Utb9yozFKZTJKYyiMx3ro54bF5WFtuCcCC" +
                "33DUr9gqjtOlqWYqiKOIhpJgq0KyizDWiiNJS1K+mlte7ppps1wOMm9jxxC4dl+1uyzpe/PH7yV" +
                "C7OuMpdq5961a9vG1yydOIonWVTwDVsVSC1sPXMbtNoNqsKQV4nPjfODrGCm1yAz9j2F8QbEJwj" +
                "uuBo9r8xXjiBg16YJWg3FwWOLNJsx1nq0luzcPFY/48E6rKvbglLVRh3e1XZHMkgq51lazZmd7i" +
                "GAxdWUyV6ClBCCpHLyjJGHeMZeyNUKkc1ru7QSzYmFVRb7CmdrS/orzltPq5nULjMCfG0r/5y0N" +
                "1KesWaB+JaSoiFD6BhTEGqrHYRUhTdFKNJTiGCJ22uJogZBwLNng1S1w7uv6u/bH2b0WjGtJGJ+" +
                "eYAQgkFmKI1lutekldRycG8tSFnnzAEWlob0WjGVc6xmOYnWSCBWkvlBxtlbZwA4tTxguhufgcz" +
                "kKP99Zly99yz2Db1mTHvDJMurOUpCpOresdESX9UuPkrXwkucpSgrFvoV22ZbKAUnl3N8EORLOX" +
                "llmZ2IwTuMF89I15Gq5j6UpmJxpWDLunGkEpxc7DPeiVFCct62aZJIs7Casikvni19f36oLIq4m" +
                "OB+Syt9zqMPP8RwZRnVnLwzHw7npXOIWlN4MDh/umLIcHiaEKKLMq06jz51GlukRK1ez6rGL4hQ" +
                "taX3n6fVax45dJBi+SRhNGuUFMQ+UKxalJR4ITk0nB89w0BgvcEaLeN2ovLhoPXEE3OU2QAxcqm" +
                "RIhCPtLvL84Gl099qIigpGAxzlOxqpUR8Ym4Ot3oCP1ISKSGIAJO70cPtJMcOL9Z2/KJ+/FY2sE" +
                "jZeM74TDRzdE3h2SqkuEqjXtZK5JSpKrRw4lU3fPe9zfa4dyZ/ZOXYntooTh1Gxg2i5jjt9btg9" +
                "BgDKUTcX13WT5xcpDLlqMAUaAFu+K2HqSgJwQueenoBJQXL/Ryte0rhk6OHD2FWT9JUCtvvc2T1" +
                "GbOWOj2RQtAYjflgcZWV04Yql0StriryvPXk3qfIh6tnxlWIgEagpWC47BksfWtctRQM0xwlOko" +
                "pGc2fPs384ATW+1F9UROB8meVuhJYHgqWTgoknn7fEDfHlXeu+fTT+8lXTiO0JEESXGDp5BKLo2" +
                "VBCEEiaxTp1Lx+RvoeRNxNnzd4Z6amHkli9QuD5YXxzvj0zmRi3ZRAfJo4OZk1QSwNliLEK60xW" +
                "Zb1CQI6zdZXB/3F749b45cEoouN877VTk6GkHzIe38wafc2HZ8/dXVlovWIILVSSK1CsD44r4Vz" +
                "TgTvha/ZXsIjgxJaKq2zVrt30jr/xaPLxWsJ0TiSEGkVhJD102OcEyF44dxIEeedkEoFKZKo0Yx" +
                "WW73JR+aXlx4pM7UjEGKpZIi0JgSCs06MZNrCeyueUZpJoYJWiVBKpc9deR3eS4CX2qr6S6BYWi" +
                "7S+SWPUjokzc4OF8z4YOmwGx7fMwasPvv965rjxN0p8I7u2jWPDof9m4er7jJQLSGFj6JolFvXT" +
                "0kK3gvvfV2MeoRUyiuRRI04WWn0Ju48sXh6ryn05kDQSumgI0WwBOut8N4RnBc+uBFlRwYlFEop" +
                "22x35gPy00cW8tcHH7UQEEUqCCmFr7y33ongkd65WsXoHSgptEhU0owOtnuTjy2uLN9UpGIHyFh" +
                "IKaJI1w9lsk4670TwPtTX7mpptVBeyUS1k+aJqNH+7LFTJ7dbF80ggnhWTAhb2+MSvA8+OMCr4y" +
                "sH5Uj6XkxNrzn5dygp1JyCT3sBzfHJKNZxO9gyHxahXGlFdFezEFk3gEC2ME9VlugN4ZFEy0dan" +
                "c7HqyIb9064ZquVVbnpWx+IdPRn45MzH1dxvKFcnQ9R3HCeELwXQjebUgDGVMI5i5SRNM6Q91ec" +
                "1o3MWnu01Wq9e3bjtilTDqZFVXkVRcFaJ6ROhE4i4ZzDVJXwzskoaYnB6oLDBemFOEEIy93O+OV" +
                "Ts+s3ZEun25GOHFJIV4Wgm01Zq38t1lpVC9A1g+XTldYNi+D4cxQUXiKUxOTph5++4xNPB2dm27" +
                "PbXdIekytH93jvtYzbk7JcOXr6+fLcE/f89Zl/H4Z7r377z76qu2V6U5kudaUPldQaa51XcSOoS" +
                "Etrragqq7x36LgVBiunrAhKhcBRIB0bn75YJ411+cqpOIoaARFwTgTdbAohkVVppfW126b1PqSr" +
                "iyHSjbKy9nCn0713ZsNZv+Rs0fZ5FnQcB+9cCDIWuhEL752ojAvOVSKKW2I4WPK+sgIhhyH4vNM" +
                "ee/3k2vWdfPl0rKQKUkls5dGNlpBaiqqqQmUdhCCkikV/6aRXKgnW2WWtlZ+YWf8JqUXH9JdEFD" +
                "fwoX78a9RqCEIIprTC+kpolQhPX8g4NmU6rOJmKz+jlHjheOH4X/H4fwYAYkF2Qd5yP1IAAAAAS" +
                "UVORK5CYII=",

    marker :    "iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAAK3RFWHRDcmVhdGlvbiBUaW1lAHZ" +
                "yIDE0IGp1bCAyMDA2IDEzOjMxOjIzICswMTAwHvJDZwAAAAd0SU1FB9YHDgsgJYiZ4bUAAAAJcE" +
                "hZcwAALiIAAC4iAari3ZIAAAAEZ0FNQQAAsY8L/GEFAAAB5ElEQVR42q2Tz0sqURTH72Qq4mASS" +
                "AoSIfSDdCEI8qJFLXSjLYSQNoGLINrI8/0ZD9q0KnDlKkIMebmP9xZRCEEiLQLBiMiNJDYq/Zg5" +
                "73vpCkM6CdGBD3Pn3OvXe77nDGPfENKwJBHx/CxYAtNAAVfgXJKk7khVCCyCP6ALVKAJXkEdbIN" +
                "xw5tgM4HHPphSFEUql8usXq8zWZZZKBRiPp+PH3sBx2Br4FbiBg+aplGxWKRgMPiMH1+YTKZDq9" +
                "V64na7G+l0mprNJo7RG/g94IEoQSsUCuRyue6QToIJYAJWMA/Bo2QySZ1Ohws9gZBeZI570Gq1y" +
                "O/395BKGJg+ZbFYznK5HAmf9vQiKW5iqVQim832Fyn5E+83Y7EYieAdY2Nig7dRqtVqrNfr3YiW" +
                "GsVltVrtr2f0IrwEZrfbGeqWhQ9GMeFwOPprRS9SAWo4HGZOp/MH1l4DAS6+HolE+u9Xek9kcK+" +
                "qKqVSKUL/s0hPDhFY83g8j5VKhcQg7nxs80/w0mg0KB6Pa2az+RTpDbDA3sd/lwvk8/l+Z7iS/F" +
                "HEAor8H9rtNmWzWYpGo+T1eikQCFAmkyFxAy7AJ255aMHYcIID8d1oNBi8hGuwwkYFDq0CPlG3Y" +
                "sTb4B/4BRwjBb4S/wGzT16tu5THiAAAAABJRU5ErkJggg==",

    mask :      "iVBORw0KGgoAAAANSUhEUgAAAGUAAABlCAYAAABUfC3PAAAAB3RJTUUH1gcOCDMLN+YTsQAAB5h" +
                "JREFUeNrtXdtS5DoMbKkG/v+Lj/cJCgbb6pbkZDjFVFHLxjepWzc7mQD8fV7uY3/6/ClxUg77vx" +
                "BqLzTXHePtxfpfDkR33yv7XEbIXQKdaLt63vF0vRVHOwjwrv1K0jrHXLFGu5K7PnZw/QyIY9Juh" +
                "2SR5rUGYKvCsXNW1u7qc8m1x4FEnwHgJGgnyT2i110C2mHln8MTo+fL6HMn+K8CQtRmTxVXZACz" +
                "sZJMqgVllbVkfwRzKOCOjUyDnNeKxkeNV0i5QqCr16iMt8CAVkZhC6+zXaJXNkV20e8meE0XAaw" +
                "cLPnOyvA4sE+worcxfTtCY8YT7AC5ppCCjgUKSnauWQHZDhhfmRQjhGXAVIFXCcq0zWQcmz4qUZ" +
                "bpk9k8mhC6WoRMzJuZ3xa/o3HNFCmVo/yTwL3C3Cfl/PavNVl8l6KWCD2/+d9p21dPWe1Y0bXYi" +
                "4zNGMpJmbekMEcNDFFXgxj1NaLYsESkOEbWipTnY4cRKFglS0m6Rs7xdcMWXYvasvqk5ngEhKi7" +
                "WiYEsJZbUXAmjwfXTnhD6pqyeRwFgLqtSSUm8kqFSCOKEqsYWXT2xZbLqidABHpVJXqShKzx7Pq" +
                "rxkmREuUJVhglpLEbOYWsCCCfkDrLJx6QXwHeMuHLgqPpAe0GmSq8JUOBJyy5IiMKvy/nYcOXEW" +
                "dZVmjLtLNk7ios35A6854MWer/w0SffQhBATirSAYYhgQjiah6/nKOzOYxKont4mu2yAV3yQTRs" +
                "IwlJQt+VBicIIQpCjy4ZqIX0vkho5cavlZAg7TijGKZtsp4Fyz8hEF9klJ9Jjg6H1NJtAZSPADI" +
                "C+SpZElErY5ZmMoJDcn4CkAypLByZjwjlP8RVE2DKAKYHIIDhPhTxZRNrFVSukIvneh3lqAcXUR" +
                "KQCAOTR7kB8EvkXziwQlmU4hGq0Qxd1R/vq5jDWtJD04McrPInGupIa0KGLNOBtQjhD8IcFQvQh" +
                "JwNMzR8eNJ8p8JWhHmk3EpTzHSE6rAYqPAKqH7BBRfKHyalIohfOrw2JTDzD5DCWNV0rCI4UqIY" +
                "az3FHH0fA/BIwB+lw4hjrN7oGjX3WnJfogQZ/B4TLxk9Rh/dCOJ9azo9iube3wXAhYgzOJ+1SM6" +
                "vcyjkpgpgS1RVVUSOBO6VuRWwMuQlyb8QZSrI7npO1U9uVCOejI0McQ6kbTVOeXN4whOjpWbXOz" +
                "9+53wECq0CkGzkOei9btC9CNRGTH33tXi4ORxiCfDkieveSEnUaQwXwg1wlOUe+1OHvHsknZHjG" +
                "f+j4VXeYXYSCEnYy6rgCfBU6xxpwsa54vkczKETXPKY8NsViArAOUNYcQDME7o2REmP/cpb4sJv" +
                "lo2kmA5WdmolY4TyTmqeCr5pMtApwXKjpTTCRAiMI78fsKJE2EWUE+W0yzZFCkoWsauxMyUlpkS" +
                "tusYxQtyA8Ixy5sIrrKYB9WSQz+f6iYSjZEAwpq+I+WdqBTQbBWO2jlRdfzqrKxr71KS6cNTKqe" +
                "a3cfdK4NwoX/3Ka8367fLZ9PwhSZQO4+7M0fvSBDWCXZW3hF5CqNodFSSBQHE+iiQdtdtZTB3Ht" +
                "8ueOLjlNIZUnARKVb1lOx9afv7absP9PluGIaUqApTLRPEMXsnEHcQwDwXsH3u622SCLEhpbRgc" +
                "XwHCVUjU7+Ooeaw8ZxTIFYRaHiwQX3CEIm+uMDLup7SnCb6TgXQDACjZDdRmeeinZQXK1LekyGg" +
                "42sJp772gBuNCcHt6Mj4Pz0Fm8NICMKh4OJVUpD0mm6PRHHt8XGTqwokkmOZUIKCQWTGYnFQquK" +
                "ALJarkhgE2CiEEzSFIlSUPxAmO0jZHrNAUCirMIiKqnvtjF5ekAObR3RnL0/4kei7Xpcxq0YYUi" +
                "DKUCUuY+mefEKU9aLl0T2IMIYmN0bB/SEAXvH+jjZ2vWn4QtKaVCWxKRM71gRRWKjzKg8n+uYZu" +
                "F3bD09BwZI7x1aB73zTEIr6qbJNS+LsQgD/Tq2Ol6Qp45AIfx2GFnnM0lPeEwIpArAvaasAgaIO" +
                "yhgmBJaurcKXnVxUaLtCHpYIu0jGoeQUFACsEpBp6zQSRW4g90rdo6TgwFzd8172ivREn5AUFBb" +
                "qBkYNQezYjAwn9R+zRJ+ZGA0gd1lq57wVg8wawNRTugHtAoPNIR3EP3/PcwgGUcUCz/sUkEp3kY" +
                "IDxtBNvhoxqrJ9C18ZpRlLi8buXH7VfyQUH2KYVoGPchD9NwS+ekrGarqsr9uKM+2jGBa7xnx6S" +
                "pdiHe27hJn5ixW76536KDLsjGBKCkRXXQHHgMiu29Hvt/z+I3xdBUTX+JUB7Lxr92eumLf9gQyB" +
                "I6n/t7OvaCDjitgkWKWNIQWFsWzbHWuMZ1Ii5aMKZtdXGYsCAVWgVePceeLIzD8jpcN6hiD4B2H" +
                "PIScLWAdpp8Ywfab7FHaynWVnBe5U9oQeFZnZa2OW6NUYPogck1EKLzIHG1LbZF55SkWo3zzmFe" +
                "Tbekpl4ivaT43dATyuwOXr5rEifFTasvPvwt5oIPnufkzfEZES5Q9mwUGWoSDWYOWoAnfnOCp8X" +
                "SnQyfmsYey4QN+x2qe84sduMIY7PsMA/Ie/z0t9/gHKOXPlZc81WwAAAABJRU5ErkJggg==",

    wheel :     "iVBORw0KGgoAAAANSUhEUgAAAMMAAADDCAYAAAA/f6WqAAAAB3RJTUUH1gcOCDIojJpTggAALYl" +
                "JREFUeNrtnXmYHUW58H9V1WdmMtlDQtijSSDKorLovRAWAwqyiBJugoCK6CfqRdSLityLkIsiF9" +
                "SIyqIsRhZBlu+TK0JEQBBFUEAEZQ9LgkCABBPIJJnMdFd9f5wzM2d6qrqr+/SZmUy6nqef06e6z" +
                "9Ld76/epd6qgrKUpSxlKUtZylKWspSlLGVxF1HeguKLAQmTp0JlOuitQU+BaHJ105NBj4JoDEQK" +
                "olYwoxAmQtKBxKBYi6ITxWokK1GsQPI6ilcQLEWxjBfpFGDKu13CMBwEXsA2bTB+BzA7Qbgz6B0" +
                "hmgl6GugxEAG6tkX0va/fr70XBhQgqb72bLb3kgjFy0ieQ/EUiscQPErAo/yNlaL6pWUpYWia8C" +
                "v4l21BzwYzG6K9IHo7mBarcPcTfG0BwROGNED67xsUy5E8gOSPBNyD5mH+VGqREoaGhX+/KSD3h" +
                "+j9EL231uILt+AnaYACYcgCiKADxZ+R3IHgNlp4jFvpKuEoYUgBYL8A2mYB80AfDGZXiCp+gu8C" +
                "wXY8AYaigHABInkJyW+R3Mga7uBu1pZglDDUAJinIJoOZh5ER0L0LjDSLsjaQ9BThN5VlwZDEUD" +
                "0hwIkK1DcguQ61vN7cTPrShg2Sef3Q+Nh1GGgPwF6X9CV/K2/zghCThgaAUWmOuXLEPwcxZW8wB" +
                "JxN2EJw4g3g6btCOLTEM0DPdXd6usMTnAW08hxrB4Gl3AH/YR3YF3Pq+08l3YIYucJulH8HskiW" +
                "rlJXERHCcOIguC4NmjbB6KTQB8EumWgIOuMwp0Vjoww2IAIKN6UkgM0RP37JUguJeBKfshrI923" +
                "ECMbghPaITgMzMmg31ONBLkEX3uaP41C4DgnDkMQa8HjMKiCwZBOvwIUKxFcTsAFLOQfI7UfQ4x" +
                "MCL48GsLDgK+A3qNP2NNMH90kCNLMJgcMPj6ELxg2gQ88YOj/ugrJIgQX0MYL4syRBYUYWRCc1A" +
                "ptBwFngN7dHQnKA4GPo5xUlwJLEgxZBD5wCH1WcylZW6xCcAkB3xdn8koJw7CCYIGEaCcwZ4I+H" +
                "LRyh0V9Wn2dQ6C1p4lUAAxJgGQxpdIiTK7XvnOXYvgGa7heLGTtxi5HcuMH4VtTQJ4N8o8gjwCh" +
                "qozXb5KBdSQcc21g/245NO2K628Iy99JuwwRuwyfWyh4CwGL2IxbzDnsba5HlTAMkUlk+NZc0Pe" +
                "A+BrIsenSkf50/QBwSdww1Pu+ly499utva/9z9kNwGy/wPfNttihhGDQIEIZzt4dtLgd5Pcgdsk" +
                "GQZ8Mi/Hm+owmCPRSbDRbJKARfoMI95gfMNwtoK2Form/QBucdD8EfQH4EpHILv3S85tEOvsJdM" +
                "BhZv6Z5gu7WEvE2SDEDyTVswU/NhWxbwtAUEH6wDUy+FOSlIKfadLW/VpANCn+jrX9B5lWjFl6W" +
                "WyQTXgfWKeAjVLjL/ITDzAKCEoZCIJinDD/+AAR3gvgoSJluFskM2sH2HUU1szmBSPu478/JDIK" +
                "fdgvTbqe0tkkzENzAWznHXMTEEoaGQLi4HQ78Ksj/C2p71x3P1pTZzofGfQhvqTZAN9AJrK1tbw" +
                "JravvrgK5azNX9dUWYSdIRQUozh4SHU913bhuSLzOGX5irmDXc4w3DFISfbgFiIURHV9MojKW/Q" +
                "JPcsZanL8GzX8C5hRFE6yFcD3otRMsgeh7ClyH8J4SrIHoD9Bro6qyez3qgQkArCoVkDAHjUYwn" +
                "YBIBUwiYRsAMFJuhaEPRTkCFAJHYv5Clv6K+r0KSrWNOpuz3ZMbC51DcJuZbYC9hsIFwza6gL4N" +
                "oN7fw+/QupwHQQCdZddMQroNoNURPQPgg6Ceg+3nQS+GZ5YJiH7qZzngqbIdkOhVmongHinejmE" +
                "rAWAIquTvusiT3JeUyJQPSAfw3a7hQHE9nCYM7WiRh54MgvAz0VunCn0cz5Emr6N0MhJ0QrYDof" +
                "tB3QfgIrH9M8MjqIbtv+xHQxUwUO6PYE8X+KKahGEeAStQasgEgkjTDQK1QX6cRXIThdHEEq0sY" +
                "BoDwYAWWfRKib4MZlw5AxEDTqdG0bBcA0TqIXoDoFtC/gbV/EdyzatiamPsRUOHtVJhNhblI3oV" +
                "iEgHKy4RKy4LtEe7AA4Iks0lwM4bPig/yUglDLwg3tYM+tbZV0k2jpHyjJCiSxigPgKATwuerAE" +
                "S3QHS/4OaNblikAcFcZqI4AMlcAnZHMYGgFgBNM5V8/Qfbe5noP/TUP4Tgo+JAntjkYTDcNQY6z" +
                "gZ9YnXscSMQZMlGtYKgQa+E6G4Ir4aOOwU3rWGEFAOSY9iJVo5EMg/FTBQtmf0IHxCUFwg9GmIJ" +
                "AUeJ9/LXTRYGw+3jofs8MJ/oP/CmZzMeplIaCF7aIaqZQdfChqsEVz3BCC/mWMYxhkNRnIDi3QS" +
                "0o2qRKVfqt8wAhy8Q9ZEmwTHsx31DNaJODB0It04C9SPQ8/3MoiwOs7dmiEA/B9Fl0HWV4JLlbG" +
                "LFzKOFrZiD4osE7ItktNOx9knz9neibdtyJB9nL347FECIoQHh9vGgLqmCYAoEwXuEmga9DKJFs" +
                "P4ywUWvsIkXcwIVJvF+JCfXIlLtmUFQHjCkA/EaAUeKPbhnxMNg+NM46Dof9Mft5lBen8ErgmQg" +
                "ehX05dB5keB7/6As/Z/PSbQynkNp4atIdkfV9Vv4hliTzKN0cwkEL6GYL3bj3hELg+E3o2H098C" +
                "cMBAA4wGAacA8CteCvhHEtwVn/L0U+5Rn9TXGM4GPIjkZyVt7e7obgcEHhD4gliGZK97JQyMOhm" +
                "o/QvhNMKf0OcvGA4asKRgDHGZd7RXWC6Dzl4Izw1LUMzy3bzMDxQICjkTRnjjnUp6+BjsIPftP0" +
                "8LBYhbPjRgYqj3LH/wcmO+DDuwANAKDE4Q3wFwF684RfP2lUrRzPr+LqbCBuSjOQPE2VK2PwqdH" +
                "Oq926APiHhRzxQ6s2OhhqE7l+JcPgrgazJhk08jk1AoDHGYN0eNVLfT6bwRnlusVFPEsz2crWvg" +
                "GAcegGOXVz5A9olSVStUPiJ8zhk+LLZs76cAgwPD4bhAthmiqn5/gA0RSx1vYCdENoE8TnFg6yM" +
                "3QEq18FMkCJNv19k34RpOy+A19GsIgOJdlnC7mNG8OWNFcEJ6dCht+DXpXf7PIBwhnROk10N+As" +
                "ZcK5neVotvEZ3s576CFHxKwNxLlBUNWEPqbSxsQfIptuUaI5vRBiOaB8GA7jF0E+qg+4faFISsQ" +
                "kQH9GIRfEHzirlJUBwmIq5lMC2ehOA5FW2KOUh4QBg4tXYnkELEVDzTjemRzQDASJn4J5Dz7lam" +
                "MdyHxPA3yTlAfLkEY3CKOZSUv80UkZyB5I5ew26fHt4OkmIzgJ+bV5kxH06Rhny8cAPK06nhlm1" +
                "clPO6KV1MSgrwO5NGCo58txXMIgPgiG/grCxGchOTV1MemUh6zcoLQE87dBcV3jaFl2JtJhqVbg" +
                "rwLzCy3aZSlw81pGnXXcopOEczvKMVyGJhNt3EIkh+j2DZRoPOYSf3NpYiAzzCORUXmMMliQTAV" +
                "qJwLalZygFmQX59KQG4AdR50fbkEYRhpiQNZjORjSJ5FYgqNLPUXJYXgf1jDTsPYTHrtGFBHu+c" +
                "OSRsB4nVX1oH4FnScLpi/vhTBYQbE/tyN4WgUj6NiQLh6q33Npv7t6RQCLjCG0cPOTDL8cxroe6" +
                "tjl02CWZQUUTIpppHeANHZIM4WzCnTKoazyXQ/uyK4DslMJKKBHuiBnXD9X79Che8VEW4VxYBgA" +
                "lh9OZhj7RAYTxCiBP8h6gJzLrx8Vk8fgjGm7FkeIgXgPCBE7zHzAO8h4OcopjtGuKXHVUTKvmAV" +
                "itlCND5stCAY3vww6BuAYKDwpznNPs6zCUFfDOu+IpjTO72IMaZrOFz/EP32UH7eCwYA8zD7U+F" +
                "qJFvk6ltwOdK1VyPACBZLmCsEG4ZUGAxvbAbqPjDb24U/i3awwRLpaup15/GCvfuNRzbGrB3Eax" +
                "cFnCMG+f8U9d+8/3scBgDzGEehuATFuLpVRf1iKo75XI3oe9WgNRzfKrhyyGAwGAFd3wR9mlsT2" +
                "LSEC4q4mRSZ6voL+kjBbgOyFo0xqxoQNNEEYRVDCEqzrj9TnRUGEDzDSQjO7ddT7asZ7NogLllL" +
                "u+A940T+7NYGYejcEeR91XmOkkwjHy1h1Q7PAIcKdnza+vvGrMhwTWIQIRGD9Ps+5zb7+0TMTJL" +
                "2Z0XAUhYScGJvLpMtUzVhlu8ebaCFs4n9zhj4Wl5nWuQHwQTA9aCPSIYgyTxKNJlWgT5G8LZbnf" +
                "/BmJcyPsyGH3ZOYRMb0ffn+S6RBgOAWck4urgBwfv7RZg8zCPTZxINkKq6/Y4QZk8S/G1QYejGH" +
                "CzhJoEJql+SVytY07i7QP8nzDgvqYfRGLM06cEU8XBzfGeW80WD/6VZv5P7s0kwAJgXmEkri1Fs" +
                "7wVB7dvi2iDBAP/VJDhCiOxz3IqcWqHSBXdK2Lsn3bz6ZYb8TrSp9xOuh67jBDskRgeMMUsyCE8" +
                "RIOQVHFHQ8WYJtiiqLg0GAPMah1LhWiRjXH5CzEFOBaFOokIFcyaJ7LNr5IKhE3OogZskyP5T9Z" +
                "ve1+waofczS2D9+wQzXki9qcY8nvGBNyqAIid8RQleoYLr8epzLDsMBsEazkVwci21YgAIBn8QL" +
                "FAsngqHZ9UOIo9WWAt3ippWsK9lUa8pMmmItaCPFWzxS6//YswjOYRBDJJgFfm5Is91fdanEUl6" +
                "9YYBwKxiAi3cgmLPHv/B5SBnAaFWFxrYf2vBH7LIdua1tt6EA4G96gEwdSBU90Vd0pOqQVF/po6" +
                "9CqqhYnE5XPirTK5L9pasaIHJKrB5fyuPgMbPNY738f363zEpdfWf92+FJ7LarOVkJL9GMdFYTK" +
                "KsENTVBxr+0xj+KAS6KZrBYNQquF3AHJ8lhWXMfErWCtHTEOwnGOM9u50x5r6M2iDPa14zwxe0P" +
                "N8lMv5n399Nq3Mdr3egMy2MbgxnaTjVgGoEBEtdGMLsGYL7m6IZVsBeAvZ1aYX6OtnvmKgBIeu0" +
                "RD+tsAHU1wXtWad57M7Q0mcRwqyCluXz3oLlccz3901KnU+jaSz31hQQmfyuhkM07OobezR+YAT" +
                "AfxjDMb79Dt4wLMBIAyebatcIWACoh8JlOonavug7y4BcDC035orwNi6kaQLrC1bS7+eBQWT8ft" +
                "t7E9tPOm6DxniYTA0VIVjdaTjDwPUaRukcELhMJgMffgpmAU8WaiYtx+xk4CEBLVmWDXavvdnrZ" +
                "P8T5P4C8UhmZ96YW5uh6nEvKisyAiRShDftu/N+n0i5bt/PCs//Vu9Aq+zPEdUB1xo4Uldbx8Tw" +
                "qQcEvceBC94mOKlQzRDCcS4Q4k2MTNAUfa8CAVohFuUBIaYZsgp9ViH0FTAfOLK+9xXGrIIsPZz" +
                "jNIe5kKxfIYjWGM6MYH8NkzxCp17mUm37yNOG03YQvFkIDC9h2rvhWN81to0HJLXXVzfADxq4j9" +
                "05W/9mtqJ5W9ws/62+Tub8j9oRZRIpPoMrgtQQGGMFj64wXGPgRBPTDnm0Qt02eT0cAVyR9h+8Y" +
                "sKdVQdnqyyrISettRlVNY0O4ZLRiBcbhCFtCxPeh3Vbt2PftnUn1MUuc0Bd5FnnM0OCsfVaWupM" +
                "hjrXhuUVhzOdq2j4voaVPstP+ixNWXdxn1xg0mU9lWaDEc/AzQIOyboAfXK4lZcE7DYW8Vrem2e" +
                "M+VmDtrpPnSiotZc5fzvtPJnhs83aeq8tj8/QzwoxLNTwHz3awaYRyKYZalY+79xN8HhDZtKTsK" +
                "WAA7LecekwnUxfJ+MVExsAoVa6ChTWLALo+9n649rzvKy32uQUXhP7vUb6pgrzH9bDjyvwSQMTs" +
                "oRUiYFC/+OBgY8AZzRkJkUwV0OrzzKBOkF9xepWGbikgHvXnWNLM3fClM/4mlKhxUxy1UU5N98p" +
                "yxOTwVLMpbgJFD9WqKk0U7Akgv8XgklamNhncYLYNv96g8qtGQxGPArzohzOsnBrBiPguimIZQX" +
                "AEGYMS+Zp/X1b86Tv0I46mxbQHorWdcttXUDxvlBivyFjTrUcaMoPiDzFHehCx5ILuEDDRzSMzu" +
                "EwD6C49vkdtoJdgQdzwfAIvEXAnjQgMZantl7CTwu6b90Z4+CNCr/M4A+k1aWZTtKjnZEOgdcOv" +
                "0J71NmAMI4IeVNMpbfAI0/CHzUcaHJA4NgEcFRuGCI4TEDFN/aX9LTqDNS/bE1h63R1eQiqLxTS" +
                "47hO+WzSucIhpGk2vchwjsvfMAxMLtYJmiEOhImBEBd+U6R2EALzqOEKA3M0VBqBIGbXfcgYTnG" +
                "lZyTAYISBg4yj6ZUWMGwSEXtaoYFFAqEL1AxZW+8iIi8yQ4svE0wXFxw6BRjpMImwdO2kQU0KEM" +
                "LiI8TrmjHlzk0hvGxgWh4AtCUWbGDGHbA98HQmGB6EURHs49IEJqWu3siseyKvATcWeMO6M9jwP" +
                "nUyIxB4tPARfhkrLnPIODSCsfgCBnvOpIx1ssXNJCyaAIcTLYrWBLays6DjL4ZrIjiVujBr1s6Q" +
                "2DGp4f2ZYeiCvYBxcS3gep8ERt3+r3dAvFHgPQubHGOXnsddLbm27MuYA+0j+PH38dBo/HbLmBY" +
                "wlscU1xRxhU6d7yoHwzyymOk3aviSgVG+ppAjtFoPyYHAhZlgiOB9OLSASdEIWJ4w0CXgfwu+X1" +
                "2DJPhJpk7asA6RAIF2QCUTQLAlBUsGZs9Lh2kUb8fiZpELgDgEJmYuFQ7GUnhoK3gW2NnDH3Bpg" +
                "/j+fosNrYdYZt8LXP5CBPvkyTwz7qZ6JVD0yjrdBdr5WTSCfbRr8nHtcaxeqHVCJ5kruiMtoU8b" +
                "FDJmHtnqfGWsaZphviD6g+EXGnbq6ZHGw0ewmUx1x8dreBfwZy8YfgPtGnbzScK33X2Hl7p4d8T" +
                "aYQCDSGjls9S5nF9bK+8KXwrHvq7TDjZzxWYyxf2GtDoXEMbS2rvqbB1yhZYQfmXgq9TGOvjAQL" +
                "p22NsbBgF7aGhzAeBrMtVHkTTc0YTGo5viHN1GWn7XexcIwmLX21p9bdEA2qEdbEJvYvuqTm6wd" +
                "NTVD04nBqgLCNFkLfFwBK8Ab9X+plCaQz0bWBj/IVc6xt6+XeEJ3d/1+QbrgN81CQafbFVbmoUt" +
                "/SIpJSNL+kVaykZStmpIcpqGLRlYk57x6lp02zXs2KfjtynaoL7MEYQh3OFzM9Lq627WXrYs1sC" +
                "hmt5ta/mT6lL8i0dnI14dIs2Q1fzx0R6S9AF9OsEk0rFzjeO4TQu4Wn1jCY/aepJtDaC0aAzfKG" +
                "bTp/XX8DsDx9fGNXs50ZCYXLX5DJgGPJ8CgxEadrGZRXFV4vIbLHD8sUn3qSgYpKf5IzPAIRMAS" +
                "1q+Ly26Y1KO9dQpiwAnJWbGv98XjKZrhxDuN9XIYeDjJJMCRrWTm11SYVgMY7urOUkDhD5tigTH" +
                "FBKhhD81EYYsznCaRiAmnHgKc2Spiwusy4GWFqfZJuz1Ah73H+LPXaaYwRY3sZ+fEAfL1gs9KCA" +
                "AHA7P/gKWAzOSWn0PjVD/fhfgpkQYumFHXXcT07SCSIFBQOf6hOSogmDI6+SKlNbbt+X3eXUtyJ" +
                "TU0tvMJOlwklXsNa01t2mGJCjSvqdpUAiBud5wXxyGJMHXjj9WV79zqs/QBbu4Jh8yDhhSzKkXD" +
                "od/DLKZJGksWlSE8MsEPyIu7PHlOXQCLEmmT1aNYNMOtkiWtsDBYJpLEdwr4JiehjpN8E1CzLd2" +
                "MekwGNhe4zcHYhIMddri73X9JUMBQ5L5k0X4XX6AzZySHr6By0ewQSBJnxVFZdQEceWuU4AwGeS" +
                "t8GLgqbAaYWvJoQUG/LkQZi4wyDPrpp8MLM7KdNdIDiyhA+k4Vvu8MSSPOx0EMylJ+NPMpEY1RB" +
                "oItgVeXVDUH7OdB96ZzE67P2lGwqwTBBStGZ6Oqs/bG4YUWtu2hq2AF50waJhuPIWfBGh07zX4z" +
                "WaWs3Q5hNRX+Mkh8FkiQ2mtv80kskWNkjrS6h+FItuQTNss0EkAJGmKppaPwUs/gVVQXQTdVz3p" +
                "hJsgYXoiDBFMT1oYIGl+QYs5FZpY+KoJmsFX+H3Mn0Yd4qSl+RTJS3271rGJawRXNoJ0+JQueUl" +
                "acUg6zCWRYno1rwhMZFgCbJOh9U/09HUVht9bYfgpZoKGcSIh3ECC1rDMQBUKeKGJtygkexKdzO" +
                "EwZzWFbFBoS51J0BhJGkHG4LBFler3SXhUrnTzeJdRnghV0Z1vzxmYYzyFPUkl1gh/i9OB7obNl" +
                "aNHsSeYnhGGtR9vTs9zWj9DHi2RxfxpxDeIw5CkGWy+gcrQ+vtGkbAIvw8Ag6ohwioM/Xq9jR0a" +
                "LxvRwBQnDBo2czUhUcpdtMFgmhdSTfIZfNIlmgmDzFCXpBHix5VFOxiHlqjvc3A5uq7Hlzbm2qS" +
                "Ee5vZ8r0o+oIJia2+cUel6vc3S4Jhiklu6Z130mZKGXi9yTB0F+An5DGRfPyEtDqfTVn6FOJ1Pm" +
                "aRSdEMPhDYhH9Qi4FV2gMGl3awhNDcmiGEKfEBtFlAIBaSYOhgyGMa5QmRpqxl3/BmUuqUBYI0c" +
                "8k42jkXCPFxGTLFRGvmw14t6uTcpAh82p/SSTAIGOPzJcLjeA2mfzbfjMzkM8iMmsKnTnn6DMpy" +
                "XFmO+8IQd55VgqaoN5mIWb1xS9g2e0fS4J9BC7GGsEp6wpCmHWplTJJmaBd+Qu7llQ0CDF0ZQqZ" +
                "JHWl5o0eupDtf/yAeMq2HQqXAYNMIqgEHuh4KYemDiHcADnrnWxesrtRk3PeHUhr3dicMUW0xEt" +
                "edynqlBlYPIzMpr/BnjRjZWvk0bRDV7RuH8yxjEOAAIwkSm0kU1WkL11iMLDO0NLO8GTb4OzEbs" +
                "tUJgwEV75ExBf3wRghDI0BozwhRvIdZxLSFzVwyjqhSHJKefeVW3APg0HVQRHV19Vt8xr1B8xnW" +
                "gWmluNFEJnZv4tGksUX2kWhYOwxgaDSvKClalOQfiDqhttW5IDEOAJKiS1giTGmCqiymURIIrmG" +
                "gg1baYW036AK/MtFnKKwIiv3X1t8Q1WkqjTHC0cq6Jgo3jtbYNnAm3hoL0meOiMcZXIm9NoESOb" +
                "p00pa50ikhU+FpGhEDgsEGImrid8d9ho4Cv1tSS6rayMugjPMti5eZNNrkG6vhKmuSzKRQDAXuZ" +
                "SmLR+kEERT0XcISfY3D0FWUM1w7f0L5CMtSYBnXXR3Mn1lVO2zPDUkwrDN+Qp56Tm2bVD6/shQY" +
                "LZkga2aSaACCumPrUn2GRoCIeYQlDGUprIQwUYIUHoIO9lXfY7La4YQhhBW+wWPjAYOwZMGWpSw" +
                "NRDImRHUwJAFhG3IQ1xgGVjhhMLAi/gU6Iwyx8aglDGUprGiYSCyaJNyC7mM2rUjyGV7Pkh/uMc" +
                "Ru2/IRlqWo0gXbKA8YpKf/EB9iIGM+w2tR3fq78Vlssy5MHMLoT2Gmlo+xLAVphukhiLwLZlvqV" +
                "jhh+AFitYY3fRahTlsgvbYFErYrH2NZCnKgp4f5hH7Ae1PdX5qoUSJ4rj4RxWf6b9vc6rX9IIS3" +
                "lo+xLAV4z6Jngrs0INJAqJua/jmnz0DfCbu6/ACT7DDH/QcFvK18kmVptHwAtg5hou/M8Lb38c4" +
                "65QNDmmOcYWo/AexYPsqyNFoE7BBCRVqE3DXLQdLMkEDnLHg5EYYIluTQAE5IDOwCRjRxvtWybB" +
                "JWErM0BMYTBkHyFKkCnqmfZ9XlM/zdZmuZDL5DbNvusDLEWpbGI0l7hSDzLGOlLT5DCI/Gf8M28" +
                "fDjom4kU5oWSBsIq6EtgD1o7sx6ZRnhznMEe9q0QNos8HFtIfrkcgAMAzTD1bBGw1JfLZAUau2J" +
                "KEXwr+UTLUvesi/MDGHLyDOSpD00h4G/p2oGEEZj/m5is3H7agTHvIezy0dalrwlgncLaPFYO3C" +
                "ABnDUmdACg3T8+AO2tVKT1lpN6X/Yef+yJ7os+WF4r65aGF5ZETZZjdW9djss84KhG+7J28XtOK" +
                "9dwHvLx1qWHP5CEMH7fHqeM6QN3YsYmINqhWEtPKih00VXGomWLdDwvvLJliVr2RXeFcEWEf5aw" +
                "OXL1smndSlmKwy3w7oIHtIeP5ghxHrIOzCjy8dbliwlhA9G0JY3Mc8GRwj3eMNQdaL5g2/Sk6c3" +
                "P3k0zCkfb1kymEhKw9zIkqmqM8hkTDu88Qo8nAEGCOGOPFohwZxq0fDh8gmXxbfsALtpmOHrC6T" +
                "JaO393c+I/hMBpMKwEu4Na+ncOoXKDI7LwbtjxpePuSw+RcMRcRMpTdZ0SuPcDbe5fs8Jw19gvY" +
                "Y/pNlfaZGlWBRg8xCOKB9zWdLKFMOYCI6JEgbzJDXEDi2hu+D2zDCAMBH8JgsAOj36FETwKTCyf" +
                "NxlSSqtcHgEW2VxmD3k89m/1RJRM8IAGm7W0K09QlgZPP3dZsFu5eMuS4LjLDQcF0El7xBPW8Mc" +
                "wi8R7klfEmH4AywN4b5GQqqWPzVKw/HlEy+L00SCd4YwO0tOXJK5VNuMgeuSfjfFXBFGww05+hS" +
                "SHBsRwVFvwUwrH3tZbCWEz2to90nP9oGkduzpR+GvDcAAG+AXEWxw+QRpuUsOWidqOKF87GWJl7" +
                "GG7Q0cmda3kLUhDuF6RPKM9qkw/BWWR/Bbn8hRBnNKRnDcVMzm5eMvS393gc9GMD7J1HbJXEJiX" +
                "mjg2rTf9ojqCKPhp0k/6mO3Weq2BP69fPxl6Y0gGWaE8DENIq1T1wWItoNy7zPwZAEwwKuwOISX" +
                "fbSDT1Jf7ZjUcMIkzDalGJSl5it8ScPkLAN1fML7ISyyZanmgmE5Yp2Gq3WCNvDJUbJc2FQNXyz" +
                "FoCwYdtaxTra0ccyefWAr18KNPn9B+v9XroigK01FaT8I6n2HT7Zj3llKwyYNggKxwMDEPONmUh" +
                "roa/8peLNQGJ6AJzQsTnJefHunLZGlBWCCUio21aIOBnUoKEHNntGe1oUmscOtsxsu9P0XGdIih" +
                "I5gYQRRXtPIEXUSGg5RZc7SpqoVJkDlG6BG1a8KbGpQRBmgsIDxv6/DU02AAZ6D+wz83icnJCkc" +
                "ZoGj1cBZYLYopWNTK2O/AuodVQjiW34oNITdcF5S+kVDMICIumGhri547kWo9gREw0wEXy+T+DY" +
                "lrTD2X0D9OyhVD8DANePFgImw00x0Dbe/CQ9m+TuZBe8luE3DvQlEeneU9E4PLgCFRPEJWvhgKS" +
                "WbAgjjJ0Dr90BN6A9B0tYfioSGOOyC//EJpzYEA4juLjgnimmHtE4Q2zFDrCFQjEbxHdpMuabDy" +
                "PYTBIz6L1D/Ul2izaUVlONV9E536rBEbuuEe7P+rVwmyco67ZBmFrmAQFiuu7rNpMK3wbSWUjNS" +
                "y9aHgPpcn3kkGQiESgGiCoVF3sKoqhWiQYEBRHcEZ2sIPXNDel+NsFxb/2sXKI5gIp+vnV2WEaU" +
                "VtpkJwXmgxgzUADIHEH1Q1GRscQj35flruZ3VVXB7BL/yBaFXG7iut399CwGnMYWDSukZSSDMHA" +
                "ejLoRg5sBWUGY0ldQALWGgw8DpebRCQzCACDV8vX4NOBcIA7SBdJpI9dtEAs5nK7NDKUUjwk8II" +
                "PgmyAP6/ATpEGwfEGzniB9hmUN1EGCADngihPNdDnSvg5x0HQp3IxEwg4DL2MJMKaVpY3eYdzkR" +
                "1Akglbt1lwnvU02lpWC+k6VfoVAYQJgNcF4ES5wmkXQArxLuRX//YTaj+RGzzNhSqjbWsut8kN8" +
                "A1ebWCK79JEHq/R4NagGi/1K2gwwDgHhdwyk9znSiNvABYOB9kUg+BJzDNNNWCtbGphXesz+o70" +
                "MwLtlOTmo1U0Ott0LndQ1LckFXHACXIzi2F2TXqxwQCPAAH5B0ITmXiLN4XHSVUrYxgPCv7wHxc" +
                "9DTk3NLezbj2K9/b2L7ehVEsxEdTzT6dwtKfRAhcBqSl1Odf5ViMrn8CEULklNo49Qyw3VjAGHf" +
                "XaHyM1Bvdbf8MqN2sGkJvgUdTxYixYXegIo5DsllCIIBrb5oSCvUb+tQnMMazi01xHAF4YB3g74" +
                "czNtBC/dQMJOiHVzaovf1blhxKIK1ww8GTIVWfoLiY06hrzebVAoc7kDDBiQ/IOK/+ZNYX0rfcA" +
                "LhA/uB/gmY6RAJP/PIx1SKgxCtAPZHvPpoUX+9+B7edrMlkruQzLICIHNuAzVlN4pL0XyNu0VHK" +
                "YXDAYRDDwF+DHpbv6kj8voMOoLoM7B8USOh1Cb5DHVlnViO5CQk65w97Ao/MzKpj0JSQXICLVzC" +
                "B8p+iKGFAImZ+zGoLAK1rZ8vkGYPi6Rj18Lyq4oEoTmaoXp3JJM4Fck3kUjvaJJKMKHc7zWKu9B" +
                "8hlvFs6VkDrpZ1ArjvwD6NIjGJw/Vr2/lXT6DTvIRAP13iA5ELHul6EtpYiKcaWdzfoLkI4l+gf" +
                "BsQJL7JgySxwj4Ar8Qd5USOlggHD0Z1FkQHgemLXlmrSjFUfYymVZCeAji+QeacTnNzQrd3ExF8" +
                "WsUu2aKIPmAYDefXkPyDeBSbigjTc0F4VPvgOiHoPeGSPkBkAWIATBsAP0peOqaos2jwYEBYEuz" +
                "GwGLUUzNBYMrf8vdMdmJ4gYqnMbl4h+l1BYNwQkV4KNgFkC0XTV0GnkKvy8QA+oMROfCE6cjCJt" +
                "1ac0fb7ycvwInIOjI5E8lgZD8mTYkx2JYzPHm4HJMdZEgnLgVVH4E6kKQ06rZp42qea8OqGuhcl" +
                "YzQRgczdDjUM/gc0i+j6x1yCkPLZElodFuOr1BwFUYzuFi8VIpzY1ogzFzITod9NtBS/c8FT7h1" +
                "DTtUP8+ugfMXMTDK5p9mYM4ksxUmMU3UZyCROTqgfaBYWDqh0bxBJIFPMIvuVuEpXRneWxfmQFq" +
                "AegjIWpPXrfJd1pqb4f5adAHIx58bjAudXCHVU41o5nMQhSfyeQ7pCU7puVBVffXIrkRwXf4rvh" +
                "bKeVpEHxtPLR+FPTJEL21rzc5bUFknxU80mDQgFkGG+Yi/vLQYF3y4I8xnmnGMZrzkXy8KTAkga" +
                "EwKF5FcgVwId8qHeyBEPygFToOheiroHcHXUmd8N1r33iYT72pFi9CdBTivnsH89KHZsD97mY8c" +
                "AmS+Q050T6v9jEjmoBlKBbRymWcIl4pIbi4Ah3vh+hkiPasmkQ+k/7oHBoicXsNuo9E/PGewb4F" +
                "Qzf7xI5mEmP4ESoBCIV/eobKAEPfFqF4DsllGH7G18TLmx4EC1pg8hzQXwS9L0Sjk9dj8lkZPC8" +
                "I0XKIPga/u7NZfQnDE4YeDdHK91Ac3+tUZ8tPyqYVJBBYz4kI+AeKa5FcyYniiZEPwcXjQR4K0Q" +
                "mg96g5xyLdJEozl9I63FwdbdEyMMcgbrt3qG7J0M9LtJ8Zg+FsJCfWhnjm8x3ShtbWw+AaVBSgk" +
                "byO4ncEXI3mTv6PWDOCtICE7XcCcySE80HPgKjFb7W+PP5CUii1X27SEgiPQtz616G8PcNjkq7d" +
                "TTvjORXJqSgqDadlpDvS/evsgHQS8DyKW2jhFlq5n8PFuo0PAAT8aiZ0HwDhXAh3Bz0BIpm+IJS" +
                "Pv5AlH8m6PQTRsYibnxzqWzV8Zqzb3VSYxCeRfJuAcdbsVd/UjCwgpG8GxToULxBwCxVuw/Agh4" +
                "lVwxeAuwII3w7de4M+AqJ3gZ4EofJbB8d3xbQsZpJthFt0M2z4LOKWYdEhOsymbzSSgzkIyWUot" +
                "vLWCD490kEKIGlb0AtGJ4oVVHgAyV0EPIzgcfYZQjjMXQGMnQnrdwG9J0RzQE+DaFwVgKzLimfR" +
                "CLk62zToi8B8HXHDG8NF+obnXKaHm10RXIZit960DZXDf0gPsbocahsItjpd0xpvEPAEAQ8geBL" +
                "Jc7SzlO1ZjhBRsYL/7HhgO+icDnp7CN8B+t0Qbg7hWIgq/QU1xHsxYnyXFvTRDM76DogWwMsXIe" +
                "7uHE5iN3wn9j3EbMEoFqI4ul+kKW9vdJpjbRN86YAhSAQmQtFJhXW1Xu9lKJ6nhZeR/JOAVSjeo" +
                "MIaJJ0ERFRYD90VoLWaDt01ttqqMx7CSRBOgXAaRDMg2gx0G4TtNcEX/YU6JB8MWcOoefoVomXQ" +
                "/Tnovg1xQzTcRG54z3J9mGlnNCchOR3F6NwzEPoAoRJ8i8BTawQJwFToW5kpIKyFc6PauRFSi5p" +
                "TK6A7AK2qYEQJQu1zLKtfkBY9ytvrHP2u6h9c/dRwFbfhnd58s1iH5rso/g3BEufEAj4Tl9XXxe" +
                "tdm8859ZuruRH93guggqANwWgEo4FxwFhgNNAOoqWGTsIX2Y75bDLjcdeNTdvvPb8TxELonDucQ" +
                "Rj+MADcICJ+Jm5Fsz+CnyHQqc8r6bnLjLLhC4DrOwtX2PEfLwqSLDcnDYLeumdBzoOnTkVcs2q4" +
                "i9rGM/DlavEihk8j+TSCV1PHhAjPBi1N0PPIkI+si0aAiJ+T96JkxgtMaoX6HYuqM1hEcxAX3oy" +
                "4e6NIm9+4RoFdITq5lJ8C+yC4FkHopamFBxBpWiSTICfIrMj6wSwfEgVtPjfK2co8A+IYWH084k" +
                "cbVVbwRjgkUhguFktQfALDUcDTTm2Q10zOoiFkgq8hizCZ6h+Va8ur2ijoJklArgfxQzD7IBZej" +
                "7iic2OTrI13fPD5YgMXiF8QsTdwLoI1drO1yT7C8G44CtYYTrV7N5gD4ZmTEd/daNPhN/7B8ueL" +
                "FYzmv4DZtZFsUaYGrSi/YVgIfpKN53uhMov2WArmk9BxKOJb9wzHvoOR08+QtZxkWpnAgQScgWS" +
                "P1MxWnzEPPkl+efKeBnwuS85QWkeZz3FXz7JXZ9oqiC6B6DzEaa+OFPEZmUvLftmMZhKHIvkqkj" +
                "1S0zTyJPVlzW+SRcGgyZdg10iaRVQHgV4E0fnQ8Q/EmXokic3IXmd5gWlnFIdR4WQk70HV0jp8Y" +
                "ZAFgWFLEvSGIQ0Cn9Zfe9QlQrASwsthwwUjEYJNA4Y+KNqYyD4oTkJyUG0VIP90jaxp4ElawAmU" +
                "T1pEoxAknWeFYQmYS2HdlfDF1xDCjGQx2TRg6IMiYHN2pMKngXkETE1cilfGWnJJtoFCSblNMg0" +
                "G3YAfkPZdtvN684i6Qd9dNYc6foX4/Caz9sWmBUNvMYLzGM84DiPgEyj27R1h55vlakv/lp5aIB" +
                "WGNBB8tUgmv2AZRD8HcSU8uQRx5iY32domCkNdud4oupmOZB6KI1G8C4nM5UNk9SlkVhiS6vOkY" +
                "EcrILoFzHVQ+T3i8HWbsiiUMNSXu0zASmZR4d+QHFwbXFTJPAVNnjqpG2z5faZ7jAD9IoR3grkR" +
                "1t4B89aOdF+ghKFhS8pIbmIKo9gfwfuRzEExDYXIPGCoKTB4j0/ugOjPYG6H7ttg1WMwv3so5iU" +
                "qYRhJ5tQUtqXCbCSzUeyF5O0oWgoBIhEG7esgG9DLQd8P0b1g7oHoYdizs2z9SxiaqTkES2llFb" +
                "NQ7ETAzkh2RDKzpkHGZAJEag8N0HssAv0yRM+Bfgq6HwPzKISPwo0rR2o/QAnDxmpiLWMqMJ1Wt" +
                "gamoJiMYjKSyQSMQjIGhULQhqINpaPqYHltIFoLUSdEq6sdXtEK0K9D9AqYpRAtQ2xXrn9dlrKU" +
                "pSxlKUtZylKWwSj/HyHl/ePsagXCAAAAAElFTkSuQmCC"
};

////////////////////////////////////////////////////////////////////
//                          utility OBJECT
// Small functions called a lot to reduce duplicate code
/////////////////////////////////////////////////////////////////////

utility = {
    is_chrome           : navigator.userAgent.toLowerCase().indexOf('chrome') !== -1 ? true : false,

    is_firefox          : navigator.userAgent.toLowerCase().indexOf('firefox') !== -1  ? true : false,

    is_html5_storage    : ('localStorage' in window) && window.localStorage !== null,

    waitMilliSecs: 5000,

    VisitUrl: function (url, loadWaitTime) {
        try {
            this.waitMilliSecs = (loadWaitTime) ? loadWaitTime : 5000;
            window.location.href = url;
            return true;
        } catch (err) {
            this.error("ERROR in utility.VisitUrl: " + err);
            return false;
        }
    },

    Click: function (obj, loadWaitTime) {
        try {
            if (!obj) {
                throw 'Null object passed to Click';
            }

            if (caap.waitingForDomLoad === false) {
                schedule.setItem('clickedOnSomething', 0);
                caap.waitingForDomLoad = true;
            }

            this.waitMilliSecs = (loadWaitTime) ? loadWaitTime : 5000;
            var evt = document.createEvent("MouseEvents");
            evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            /*
            Return Value: boolean
            The return value of dispatchEvent indicates whether any of the listeners
            which handled the event called preventDefault. If preventDefault was called
            the value is false, else the value is true.
            */
            return !obj.dispatchEvent(evt);
        } catch (err) {
            this.error("ERROR in utility.Click: " + err);
            return undefined;
        }
    },

    ClickAjax: function (link, loadWaitTime) {
        try {
            if (!link) {
                throw 'No link passed to Click Ajax';
            }

            if (state.getItem('clickUrl', '').indexOf(link) < 0) {
                state.setItem('clickUrl', 'http://apps.facebook.com/castle_age/' + link);
                caap.waitingForDomLoad = false;
            }

            return this.VisitUrl("javascript:void(a46755028429_ajaxLinkSend('globalContainer', '" + link + "'))", loadWaitTime);
        } catch (err) {
            this.error("ERROR in utility.ClickAjax: " + err);
            return undefined;
        }
    },

    oneMinuteUpdate: function (funcName) {
        try {
            if (!state.getItem('reset' + funcName) && !schedule.check(funcName + 'Timer')) {
                return false;
            }

            schedule.setItem(funcName + 'Timer', 60);
            state.setItem('reset' + funcName, false);
            return true;
        } catch (err) {
            this.error("ERROR in utility.oneMinuteUpdate: " + err);
            return undefined;
        }
    },

    NavigateTo: function (pathToPage, imageOnPage) {
        try {
            var content   = document.getElementById('content'),
                pathList  = [],
                s         = 0,
                a         = null,
                imageTest = '',
                input     = null,
                img       = null;

            if (!content) {
                this.warn('No content to Navigate to', imageOnPage, pathToPage);
                return false;
            }

            if (imageOnPage && this.CheckForImage(imageOnPage)) {
                return false;
            }

            pathList = pathToPage.split(",");
            for (s = pathList.length - 1; s >= 0; s -= 1) {
                a = nHtml.FindByAttrXPath(content, 'a', "contains(@href,'/" + pathList[s] + ".php') and not(contains(@href,'" + pathList[s] + ".php?'))");
                if (a) {
                    this.log(1, 'Go to', pathList[s]);
                    //state.setItem('clickUrl', 'http://apps.facebook.com/castle_age/' + pathList[s] + '.php');
                    this.Click(a);
                    return true;
                }

                imageTest = pathList[s];
                if (imageTest.indexOf(".") === -1) {
                    imageTest = imageTest + '.';
                }

                input = nHtml.FindByAttrContains(document.body, "input", "src", imageTest);
                if (input) {
                    this.log(2, 'Click on image', input.src.match(/[\w.]+$/));
                    this.Click(input);
                    return true;
                }

                img = nHtml.FindByAttrContains(document.body, "img", "src", imageTest);
                if (img) {
                    this.log(2, 'Click on image', img.src.match(/[\w.]+$/));
                    this.Click(img);
                    return true;
                }
            }

            this.warn('Unable to Navigate to', imageOnPage, pathToPage);
            return false;
        } catch (err) {
            this.error("ERROR in utility.NavigateTo: " + err, imageOnPage, pathToPage);
            return undefined;
        }
    },

    CheckForImage: function (image, webSlice, subDocument, nodeNum) {
        try {
            var traverse   = '',
                imageSlice = null;

            if (!webSlice) {
                if (!subDocument) {
                    webSlice = document.body;
                } else {
                    webSlice = subDocument.body;
                }
            }

            if (nodeNum) {
                traverse = ":eq(" + nodeNum + ")";
            } else {
                traverse = ":first";
            }

            imageSlice = $(webSlice).find("input[src*='" + image + "']" + traverse);
            if (!imageSlice.length) {
                imageSlice = $(webSlice).find("img[src*='" + image + "']" + traverse);
                if (!imageSlice.length) {
                    imageSlice = $(webSlice).find("div[style*='" + image + "']" + traverse);
                }
            }

            return (imageSlice.length ? imageSlice.get(0) : null);
        } catch (err) {
            this.error("ERROR in utility.CheckForImage: " + err);
            return undefined;
        }
    },

    NumberOnly: function (num) {
        try {
            return parseFloat(num.toString().replace(new RegExp("[^0-9\\.]", "g"), ''));
        } catch (err) {
            this.error("ERROR in utility.NumberOnly: " + err, arguments.callee.caller);
            return undefined;
        }
    },

    RemoveHtmlJunk: function (html) {
        try {
            return html.replace(new RegExp("\\&[^;]+;", "g"), '');
        } catch (err) {
            this.error("ERROR in utility.RemoveHtmlJunk: " + err);
            return undefined;
        }
    },

    typeOf: function (obj) {
        try {
            var s = typeof obj;

            if (s === 'object') {
                if (obj) {
                    if (obj instanceof Array) {
                        s = 'array';
                    }
                } else {
                    s = 'null';
                }
            }

            return s;
        } catch (err) {
            this.error("ERROR in utility.typeOf: " + err);
            return undefined;
        }
    },

    isEmpty: function (obj) {
        try {
            var i, v,
                empty = true;

            if (this.typeOf(obj) === 'object') {
                for (i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        v = obj[i];
                        if (v !== undefined && this.typeOf(v) !== 'function') {
                            empty = false;
                            break;
                        }
                    }
                }
            }

            return empty;
        } catch (err) {
            this.error("ERROR in utility.isEmpty: " + err);
            return undefined;
        }
    },

    isNum: function (value) {
        try {
            return (!isNaN(value) && typeof value === 'number');
        } catch (err) {
            this.error("ERROR in utility.isNum: " + err);
            return undefined;
        }
    },

    isInt: function (value) {
        try {
            var y = parseInt(value, 10);
            if (isNaN(y)) {
                return false;
            }

            return value === y && value.toString() === y.toString();
        } catch (err) {
            this.error("ERROR in utility.isInt: " + err);
            return undefined;
        }
    },

    alert_id: 0,

    alert: function (message) {
        try {
            this.alert_id += 1;
            var id = this.alert_id;
            $('<div id="alert_' + id + '" title="Alert!"><p>' + message + '</p></div>').appendTo(document.body);
            $("#alert_" + id).dialog({
                buttons: {
                    "Ok": function () {
                        $(this).dialog("close");
                    }
                }
            });

            return true;
        } catch (err) {
            this.error("ERROR in utility.alert: " + err);
            return false;
        }
    },

    logLevel: 1,

    log: function (level, text) {
        if (console.log !== undefined) {
            if (this.logLevel && !isNaN(level) && this.logLevel >= level) {
                var message = 'v' + caapVersion + ' (' + (new Date()).toLocaleTimeString() + ') : ' + text;
                if (arguments.length > 2) {
                    console.log(message, Array.prototype.slice.call(arguments, 2));
                } else {
                    console.log(message);
                }
            }
        }
    },

    warn: function (text) {
        if (console.warn !== undefined) {
            var message = 'v' + caapVersion + ' (' + (new Date()).toLocaleTimeString() + ') : ' + text;
            if (arguments.length > 1) {
                console.warn(message, Array.prototype.slice.call(arguments, 1));
            } else {
                console.warn(message);
            }
        } else {
            if (arguments.length > 1) {
                this.log(1, text, Array.prototype.slice.call(arguments, 1));
            } else {
                this.log(1, text);
            }
        }
    },

    error: function (text) {
        if (console.error !== undefined) {
            var message = 'v' + caapVersion + ' (' + (new Date()).toLocaleTimeString() + ') : ' + text;
            if (arguments.length > 1) {
                console.error(message, Array.prototype.slice.call(arguments, 1));
            } else {
                console.error(message);
            }
        } else {
            if (arguments.length > 1) {
                this.log(1, text, Array.prototype.slice.call(arguments, 1));
            } else {
                this.log(1, text);
            }
        }
    },

    timeouts: {},

    setTimeout: function (func, millis) {
        try {
            var t = window.setTimeout(function () {
                func();
                utility.timeouts[t] = undefined;
            }, millis);

            this.timeouts[t] = 1;
            return true;
        } catch (err) {
            this.error("ERROR in utility.setTimeout: " + err);
            return false;
        }
    },

    clearTimeouts: function () {
        try {
            for (var t in this.timeouts) {
                if (this.timeouts.hasOwnProperty(t)) {
                    window.clearTimeout(t);
                }
            }

            this.timeouts = {};
            return true;
        } catch (err) {
            this.error("ERROR in utility.clearTimeouts: " + err);
            return false;
        }
    },

    getHTMLPredicate: function (HTML) {
        try {
            for (var x = HTML.length; x > 1; x -= 1) {
                if (HTML.substr(x, 1) === '/') {
                    return HTML.substr(x + 1);
                }
            }

            return HTML;
        } catch (err) {
            this.error("ERROR in utility.getHTMLPredicate: " + err);
            return undefined;
        }
    },

    // Turns text delimeted with new lines and commas into an array.
    // Primarily for use with user input text boxes.
    TextToArray: function (text) {
        try {
            var theArray  = [],
                tempArray = [],
                it        = 0;

            if (typeof text === 'string' && text !== '') {
                text = text.replace(/,/g, global.os).replace(/ /g, '');
                tempArray = text.split(global.os);
                if (tempArray && tempArray.length) {
                    for (it = 0; it < tempArray.length; it += 1) {
                        if (tempArray[it] !== '') {
                            theArray.push(isNaN(tempArray[it]) ? tempArray[it] : parseFloat(tempArray[it]));
                        }
                    }
                }
            }

            this.log(2, "theArray", theArray);
            return theArray;
        } catch (err) {
            utility.error("ERROR in utility.TextToArray: " + err);
            return undefined;
        }
    },

    //pads left
    lpad: function (text, padString, length) {
        try {
            while (text.length < length) {
                text = padString + text;
            }

            return text;
        } catch (err) {
            utility.error("ERROR in utility.lpad: " + err);
            return undefined;
        }
    },

    //pads right
    rpad: function (text, padString, length) {
        try {
            while (text.length < length) {
                text = text + padString;
            }

            return text;
        } catch (err) {
            utility.error("ERROR in utility.rpad: " + err);
            return undefined;
        }
    },

    /*jslint bitwise: false */
    SHA1: function (msg) {
        try {
            if (!msg || typeof msg !== 'string') {
                utility.warn("msg", msg);
                throw "Invalid msg!";
            }

            function rotate_left(n, s) {
                var t4 = (n << s) | (n >>> (32 - s));
                return t4;
            }

            function lsb_hex(val) {
                var str = "", i, vh, vl;

                for (i = 0; i <= 6; i += 2) {
                    vh = (val >>> (i * 4 + 4)) & 0x0f;
                    vl = (val >>> (i * 4)) & 0x0f;
                    str += vh.toString(16) + vl.toString(16);
                }

                return str;
            }

            function cvt_hex(val) {
                var str = "", i, v;

                for (i = 7; i >= 0; i -= 1) {
                    v = (val >>> (i * 4)) & 0x0f;
                    str += v.toString(16);
                }

                return str;
            }

            function Utf8Encode(string) {
                string = string.replace(/\r\n/g, "\n");
                var utftext = "",
                    n = 0,
                    c = '';

                for (n = 0; n < string.length; n += 1) {
                    c = string.charCodeAt(n);
                    if (c < 128) {
                        utftext += String.fromCharCode(c);
                    } else if ((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    } else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                }

                return utftext;
            }

            var blockstart, i, j,
                W = [80],
                H0 = 0x67452301,
                H1 = 0xEFCDAB89,
                H2 = 0x98BADCFE,
                H3 = 0x10325476,
                H4 = 0xC3D2E1F0,
                A = null,
                B = null,
                C = null,
                D = null,
                E = null,
                temp = null,
                msg_len = 0,
                word_array = [];

            msg = Utf8Encode(msg);
            msg_len = msg.length;
            for (i = 0; i < msg_len - 3; i += 4) {
                j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 | msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
                word_array.push(j);
            }

            switch (msg_len % 4) {
            case 0:
                i = 0x080000000;
                break;
            case 1:
                i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;
                break;
            case 2:
                i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000;
                break;
            case 3:
                i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80;
                break;
            default:
            }

            word_array.push(i);
            while ((word_array.length % 16) !== 14) {
                word_array.push(0);
            }

            word_array.push(msg_len >>> 29);
            word_array.push((msg_len << 3) & 0x0ffffffff);
            for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
                for (i = 0; i < 16; i += 1) {
                    W[i] = word_array[blockstart + i];
                }

                for (i = 16; i <= 79; i += 1) {
                    W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
                }

                A = H0;
                B = H1;
                C = H2;
                D = H3;
                E = H4;
                for (i = 0; i <= 19; i += 1) {
                    temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
                    E = D;
                    D = C;
                    C = rotate_left(B, 30);
                    B = A;
                    A = temp;
                }

                for (i = 20; i <= 39; i += 1) {
                    temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
                    E = D;
                    D = C;
                    C = rotate_left(B, 30);
                    B = A;
                    A = temp;
                }

                for (i = 40; i <= 59; i += 1) {
                    temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
                    E = D;
                    D = C;
                    C = rotate_left(B, 30);
                    B = A;
                    A = temp;
                }

                for (i = 60; i <= 79; i += 1) {
                    temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
                    E = D;
                    D = C;
                    C = rotate_left(B, 30);
                    B = A;
                    A = temp;
                }

                H0 = (H0 + A) & 0x0ffffffff;
                H1 = (H1 + B) & 0x0ffffffff;
                H2 = (H2 + C) & 0x0ffffffff;
                H3 = (H3 + D) & 0x0ffffffff;
                H4 = (H4 + E) & 0x0ffffffff;
            }

            temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
            return temp.toLowerCase();
        } catch (err) {
            utility.error("ERROR in utility.SHA1: " + err);
            return undefined;
        }
    }
    /*jslint bitwise: true */
};

////////////////////////////////////////////////////////////////////
//                          config OBJECT
// this is the main object for dealing with user options
/////////////////////////////////////////////////////////////////////

config = {
    options: {},

    log: function (level, text) {
        try {
            var snapshot = {};
            if (utility.logLevel >= level) {
                $.extend(snapshot, this.options);
                utility.log(level, text, snapshot);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in config.log: " + err);
            return false;
        }
    },

    load: function () {
        try {
            if (gm.getItem('config.options', 'default') === 'default') {
                gm.setItem('config.options', this.options);
            } else {
                this.options = gm.getItem('config.options', this.options);
            }

            if (utility.typeOf(this.options) !== 'object') {
                utility.warn("Invalid options object! Resetting!");
                gm.deleteItem('config.options');
                this.options = {};
            }

            this.log(2, "config.load");
            return true;
        } catch (err) {
            utility.error("ERROR in config.load: " + err);
            return false;
        }
    },

    save: function (force) {
        try {
            gm.setItem('config.options', this.options);
            this.log(2, "config.save");
            return true;
        } catch (err) {
            utility.error("ERROR in config.save: " + err);
            return false;
        }
    },

    setItem: function (name, value) {
        try {
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name!";
            }

            if (value === undefined || value === null) {
                throw "Value supplied is 'undefined' or 'null'!";
            }

            this.options[name] = value;
            this.save();
            return value;
        } catch (err) {
            utility.error("ERROR in config.setItem: " + err);
            return undefined;
        }
    },

    getItem: function (name, value) {
        try {
            var item;
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name!";
            }

            item = this.options[name];
            if ((item === undefined || item === null) && value !== undefined && value !== null) {
                item = value;
            }

            if (item === undefined || item === null) {
                utility.warn("config.getItem returned 'undefined' or 'null' for", name);
            }

            return item;
        } catch (err) {
            utility.error("ERROR in config.getItem: " + err);
            return undefined;
        }
    },

    deleteItem: function (name) {
        try {
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name!";
            }

            if (this.options[name] === undefined || this.options[name] === null) {
                utility.warn("config.deleteItem - Invalid or non-existant flag: ", name);
            }

            delete this.options[name];
            return true;
        } catch (err) {
            utility.error("ERROR in config.deleteItem: " + err);
            return false;
        }
    }
};

////////////////////////////////////////////////////////////////////
//                          state OBJECT
// this is the main object for dealing with state flags
/////////////////////////////////////////////////////////////////////

state = {
    flags: {},

    log: function (level, text) {
        try {
            var snapshot = {};
            if (utility.logLevel >= level) {
                $.extend(snapshot, this.flags);
                utility.log(level, text, snapshot);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in state.log: " + err);
            return false;
        }
    },

    load: function () {
        try {
            if (gm.getItem('state.flags', 'default') === 'default') {
                gm.setItem('state.flags', this.flags);
            } else {
                this.flags = gm.getItem('state.flags', this.flags);
            }

            if (utility.typeOf(this.flags) !== 'object') {
                utility.warn("Invalid flags object! Resetting!");
                gm.deleteItem('state.flags');
                this.flags = {};
            }

            this.log(2, "state.load");
            return true;
        } catch (err) {
            utility.error("ERROR in state.load: " + err);
            return false;
        }
    },

    save: function (force) {
        try {
            if (!force) {
                if (!schedule.check('StateSave')) {
                    return false;
                }
            }

            gm.setItem('state.flags', this.flags);
            this.log(2, "state.save");
            schedule.setItem('StateSave', 1);
            return true;
        } catch (err) {
            utility.error("ERROR in state.save: " + err);
            return false;
        }
    },

    setItem: function (name, value) {
        try {
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name!";
            }

            if (value === undefined || value === null) {
                throw "Value supplied is 'undefined' or 'null'!";
            }

            this.flags[name] = value;
            this.save();
            return value;
        } catch (err) {
            utility.error("ERROR in state.setItem: " + err);
            return undefined;
        }
    },

    getItem: function (name, value) {
        try {
            var item;
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name!";
            }

            item = this.flags[name];
            if ((item === undefined || item === null) && value !== undefined && value !== null) {
                item = value;
            }

            if (item === undefined || item === null) {
                utility.warn("state.getItem returned 'undefined' or 'null' for", name);
            }

            return item;
        } catch (err) {
            utility.error("ERROR in state.getItem: " + err);
            return undefined;
        }
    },

    deleteItem: function (name) {
        try {
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name!";
            }

            if (this.flags[name] === undefined || this.flags[name] === null) {
                utility.warn("state.deleteItem - Invalid or non-existant flag: ", name);
            }

            delete this.flags[name];
            return true;
        } catch (err) {
            utility.error("ERROR in state.deleteItem: " + err);
            return false;
        }
    }
};

////////////////////////////////////////////////////////////////////
//                          css OBJECT
// this is the object for inline css
/////////////////////////////////////////////////////////////////////

css = {
    AddCSS: function () {
        try {
            var href = window.location.href;

            if (href.indexOf('apps.facebook.com/castle_age') >= 0) {
                if (!$('link[href*="jquery-ui-1.8.1.custom.css"').length) {
                    $("<link>").appendTo("head").attr({
                        rel: "stylesheet",
                        type: "text/css",
                        href: "http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.4/themes/smoothness/jquery-ui.css"
                    });
                }

                $("<style type='text/css'>" + this.farbtastic + "</style>").appendTo("head");
            }

            if (gm.getItem("fbFilter", false, hiddenVar) && (href.indexOf('apps.facebook.com/reqs.php') >= 0 || href.indexOf('apps.facebook.com/home.php') >= 0 || href.indexOf('filter=app_46755028429') >= 0)) {
                $("<style type='text/css'>#contentArea div[id^='div_story_']:not([class*='46755028429']) {\ndisplay:none !important;\n}</style>").appendTo("head");
            }

            return true;
        } catch (err) {
            this.error("ERROR in AddCSS: " + err);
            return false;
        }
    },

    farbtastic :    ".farbtastic {" +
                    "  position: relative;" +
                    "}" +
                    ".farbtastic * {" +
                    "  position: absolute;" +
                    "  cursor: crosshair;" +
                    "}" +
                    ".farbtastic, .farbtastic .wheel {" +
                    "  width: 195px;" +
                    "  height: 195px;" +
                    "}" +
                    ".farbtastic .color, .farbtastic .overlay {" +
                    "  top: 47px;" +
                    "  left: 47px;" +
                    "  width: 101px;" +
                    "  height: 101px;" +
                    "}" +
                    ".farbtastic .wheel {" +
                    "  background: url(data:image/png;base64," + image64.wheel + ") no-repeat;" +
                    "  width: 195px;" +
                    "  height: 195px;" +
                    "}" +
                    ".farbtastic .overlay {" +
                    "  background: url(data:image/png;base64," + image64.mask + ") no-repeat;" +
                    "}" +
                    ".farbtastic .marker {" +
                    "  width: 17px;" +
                    "  height: 17px;" +
                    "  margin: -8px 0 0 -8px;" +
                    "  overflow: hidden;" +
                    "  background: url(data:image/png;base64," + image64.marker + ") no-repeat;" +
                    "}"
};

///////////////////////////
// Define our global object
///////////////////////////

global = {
    namespace           : 'caap',
    discussionURL       : 'http://senses.ws/caap/index.php',
    newVersionAvailable : false,
    documentTitle       : document.title,
    // Object separator - used to separate objects
    os                  : '\n',
    // Value separator - used to separate name/values within the objects
    vs                  : '\t',
    // Label separator - used to separate the name from the value
    ls                  : '\f',

    releaseUpdate: function () {
        try {
            if (state.getItem('SUC_remote_version', 0) > caapVersion) {
                global.newVersionAvailable = true;
            }

            // update script from: http://castle-age-auto-player.googlecode.com/files/Castle-Age-Autoplayer.user.js

            function updateCheck(forced) {
                if (forced || (state.getItem('SUC_last_update', 0) + 86400000) <= new Date().getTime()) {
                    try {
                        GM_xmlhttpRequest({
                            method: 'GET',
                            url: 'http://castle-age-auto-player.googlecode.com/files/Castle-Age-Autoplayer.user.js',
                            headers: {'Cache-Control': 'no-cache'},
                            onload: function (resp) {
                                var remote_version = resp.responseText.match(new RegExp("@version\\s*(.*?)\\s*$", "m"))[1],
                                    script_name    = resp.responseText.match(new RegExp("@name\\s*(.*?)\\s*$", "m"))[1];

                                state.setItem('SUC_last_update', new Date().getTime());
                                state.setItem('SUC_target_script_name', script_name);
                                state.setItem('SUC_remote_version', remote_version);
                                utility.log(1, 'remote version ', remote_version);
                                if (remote_version > caapVersion) {
                                    global.newVersionAvailable = true;
                                    if (forced) {
                                        if (confirm('There is an update available for the Greasemonkey script "' + script_name + '."\nWould you like to go to the install page now?')) {
                                            GM_openInTab('http://senses.ws/caap/index.php?topic=771.msg3582#msg3582');
                                        }
                                    }
                                } else if (forced) {
                                    alert('No update is available for "' + script_name + '."');
                                }
                            }
                        });
                    } catch (err) {
                        if (forced) {
                            alert('An error occurred while checking for updates:\n' + err);
                        }
                    }
                }
            }

            GM_registerMenuCommand(state.getItem('SUC_target_script_name', '???') + ' - Manual Update Check', function () {
                updateCheck(true);
            });

            updateCheck(false);
        } catch (err) {
            utility.error("ERROR in release updater: " + err);
        }
    },

    devUpdate: function () {
        try {
            if (state.getItem('SUC_remote_version', 0) > caapVersion || (state.getItem('SUC_remote_version', 0) >= caapVersion && state.getItem('DEV_remote_version', 0) > devVersion)) {
                global.newVersionAvailable = true;
            }

            // update script from: http://castle-age-auto-player.googlecode.com/svn/trunk/Castle-Age-Autoplayer.user.js

            function updateCheck(forced) {
                if (forced || (gm.getItem('SUC_last_update', 0) + 86400000) <= (new Date().getTime())) {
                    try {
                        GM_xmlhttpRequest({
                            method: 'GET',
                            url: 'http://castle-age-auto-player.googlecode.com/svn/trunk/Castle-Age-Autoplayer.user.js',
                            headers: {'Cache-Control': 'no-cache'},
                            onload: function (resp) {
                                var remote_version = resp.responseText.match(new RegExp("@version\\s*(.*?)\\s*$", "m"))[1],
                                    dev_version    = resp.responseText.match(new RegExp("@dev\\s*(.*?)\\s*$", "m"))[1],
                                    script_name    = resp.responseText.match(new RegExp("@name\\s*(.*?)\\s*$", "m"))[1];

                                state.setItem('SUC_last_update', new Date().getTime());
                                state.setItem('SUC_target_script_name', script_name);
                                state.setItem('SUC_remote_version', remote_version);
                                state.setItem('DEV_remote_version', dev_version);
                                utility.log(1, 'remote version ', remote_version, dev_version);
                                if (remote_version > caapVersion || (remote_version >= caapVersion && dev_version > devVersion)) {
                                    global.newVersionAvailable = true;
                                    if (forced) {
                                        if (confirm('There is an update available for the Greasemonkey script "' + script_name + '."\nWould you like to go to the install page now?')) {
                                            GM_openInTab('http://code.google.com/p/castle-age-auto-player/updates/list');
                                        }
                                    }
                                } else if (forced) {
                                    alert('No update is available for "' + script_name + '."');
                                }
                            }
                        });
                    } catch (err) {
                        if (forced) {
                            alert('An error occurred while checking for updates:\n' + err);
                        }
                    }
                }
            }

            GM_registerMenuCommand(state.getItem('SUC_target_script_name', '???') + ' - Manual Update Check', function () {
                updateCheck(true);
            });

            updateCheck(false);
        } catch (err) {
            utility.error("ERROR in development updater: " + err);
        }
    }
};

/////////////////////////////////////////////////////////////////////
//                          gm OBJECT
// this object is used for setting/getting GM specific functions.
/////////////////////////////////////////////////////////////////////

gm = {
    fireFoxUseGM: false,

    // use these to set/get values in a way that prepends the game's name
    setItem: function (name, value) {
        try {
            var jsonStr;

            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (value === undefined || value === null) {
                throw "Value supplied is 'undefined' or 'null'! (" + value + ")";
            }

            jsonStr = JSON.stringify(value);
            if (jsonStr === undefined || jsonStr === null) {
                throw "JSON.stringify returned 'undefined' or 'null'! (" + jsonStr + ")";
            }

            if (global.is_html5_storage && !this.fireFoxUseGM) {
                localStorage.setItem(global.namespace + "." + caap.stats.FBID + "." + name, jsonStr);
            } else {
                GM_setValue(global.namespace + "." + caap.stats.FBID + "." + name, jsonStr);
            }

            return value;
        } catch (error) {
            utility.error("ERROR in gm.setItem: " + error, arguments.callee.caller);
            return undefined;
        }
    },

    getItem: function (name, value, hidden) {
        try {
            var jsonObj;

            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (global.is_html5_storage && !this.fireFoxUseGM) {
                jsonObj = $.parseJSON(localStorage.getItem(global.namespace + "." + caap.stats.FBID + "." + name));
            } else {
                jsonObj = $.parseJSON(GM_getValue(global.namespace + "." + caap.stats.FBID + "." + name));
            }

            if (jsonObj === undefined || jsonObj === null) {
                if (!hidden) {
                    utility.warn("gm.getItem parseJSON returned 'undefined' or 'null' for ", name);
                }

                if (value !== undefined && value !== null) {
                    if (!hidden) {
                        utility.warn("gm.getItem using default value ", value);
                        //this.setItem(name, value);
                    }

                    jsonObj = value;
                } else {
                    throw "No default value supplied! (" + value + ")";
                }
            }

            return jsonObj;
        } catch (error) {
            utility.error("ERROR in gm.getItem: " + error, arguments.callee.caller);
            return undefined;
        }
    },

    deleteItem: function (name) {
        try {
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (global.is_html5_storage && !this.fireFoxUseGM) {
                localStorage.removeItem(global.namespace + "." + caap.stats.FBID + "." + name);
            } else {
                GM_deleteValue(global.namespace + "." + caap.stats.FBID + "." + name);
            }

            return true;
        } catch (error) {
            utility.error("ERROR in gm.deleteItem: " + error, arguments.callee.caller);
            return false;
        }
    },

    clear: function () {
        try {
            if (global.is_html5_storage && !this.fireFoxUseGM) {
                localStorage.clear();
            } else {
                var storageKeys = [],
                    key         = 0;

                storageKeys = GM_listValues();
                for (key = 0; key < storageKeys.length; key += 1) {
                    if (storageKeys[key].match(new RegExp(global.namespace + "." + caap.stats.FBID))) {
                        GM_deleteValue(storageKeys[key]);
                    }
                }
            }

            return true;
        } catch (error) {
            utility.error("ERROR in gm.clear: " + error, arguments.callee.caller);
            return false;
        }
    },

    length: function (name) {
        try {
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            return this.getItem(name, []).length;
        } catch (error) {
            utility.error("ERROR in gm.length: " + error, arguments.callee.caller);
            return undefined;
        }
    },

    splice: function (name, index, howmany) {
        try {
            var newArr   = [],
                removed  = null,
                it       = 0;


            if (arguments.length < 3) {
                throw "Must provide name, index & howmany!";
            }

            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (!utility.isNum(index) || index < 0) {
                throw "Invalid index! (" + index + ")";
            }

            if (!utility.isNum(howmany) || howmany < 0) {
                throw "Invalid howmany! (" + howmany + ")";
            }

            newArr = this.getItem(name, []);
            if (arguments.length >= 4) {
                removed = newArr.splice(index, howmany);
                for (it = 3; it < arguments.length; it += 1) {
                    newArr.splice(index + it - 2, 0, arguments[it]);
                }
            } else {
                removed = newArr.splice(index, howmany);
            }

            this.setItem(name, newArr);
            return removed;
        } catch (error) {
            utility.error("ERROR in gm.splice: " + error, arguments.callee.caller);
            return undefined;
        }
    },

    unshift: function (name, element) {
        try {
            var newArr = [],
                length = 0,
                it     = 0;

            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (arguments.length < 2) {
                throw "Must provide element(s)!";
            }

            newArr = this.getItem(name, []);
            for (it = 1; it < arguments.length; it += 1) {
                length = newArr.unshift(arguments[it]);
            }

            this.setItem(name, newArr);
            return length;
        } catch (error) {
            utility.error("ERROR in gm.unshift: " + error, arguments.callee.caller);
            return undefined;
        }
    },

    shift: function (name) {
        try {
            var newArr   = [],
                shiftVal = null;

            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            newArr = this.getItem(name, []);
            shiftVal = newArr.shift();
            this.setItem(name, newArr);
            return shiftVal;
        } catch (error) {
            utility.error("ERROR in gm.shift: " + error, arguments.callee.caller);
            return undefined;
        }
    },

    push: function (name, element) {
        try {
            var newArr = [],
                length = 0,
                it     = 0;

            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (arguments.length < 2) {
                throw "Must provide element(s)!";
            }

            newArr = this.getItem(name, []);
            for (it = 1; it < arguments.length; it += 1) {
                length = newArr.push(arguments[it]);
            }

            this.setItem(name, newArr);
            return length;
        } catch (error) {
            utility.error("ERROR in gm.push: " + error, arguments.callee.caller);
            return undefined;
        }
    },

    pop: function (name) {
        try {
            var newArr = [],
                popVal = null;

            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            newArr = this.getItem(name, []);
            popVal = newArr.pop();
            this.setItem(name, newArr);
            return popVal;
        } catch (error) {
            utility.error("ERROR in gm.pop: " + error, arguments.callee.caller);
            return undefined;
        }
    },

    listFindItemByPrefix: function (list, prefix) {
        var itemList = list.filter(function (item) {
            return item.indexOf(prefix) === 0;
        });

        if (itemList.length) {
            return itemList[0];
        }

        return null;
    },

    setObjVal: function (objName, label, value) {
        var objStr  = this.getItem(objName),
            itemStr = '',
            objList = [];

        if (!objStr) {
            this.setItem(objName, label + global.ls + value);
            return;
        }

        itemStr = this.listFindItemByPrefix(objStr.split(global.vs), label + global.ls);
        if (!itemStr) {
            this.setItem(objName, label + global.ls + value + global.vs + objStr);
            return;
        }

        objList = objStr.split(global.vs);
        objList.splice(objList.indexOf(itemStr), 1, label + global.ls + value);
        this.setItem(objName, objList.join(global.vs));
    },

    getObjVal: function (objName, label, defaultValue) {
        var objStr  = '',
            itemStr = '';

        if (objName.indexOf(global.ls) < 0) {
            objStr = this.getItem(objName, '', hiddenVar);
        } else {
            objStr = objName;
        }

        if (!objStr) {
            return defaultValue;
        }

        itemStr = this.listFindItemByPrefix(objStr.split(global.vs), label + global.ls);
        if (!itemStr) {
            return defaultValue;
        }

        return itemStr.split(global.ls)[1];
    }
};

/////////////////////////////////////////////////////////////////////
//                          HTML TOOLS
// this object contains general methods for wading through the DOM and dealing with HTML
/////////////////////////////////////////////////////////////////////

nHtml = {
    xpath: {
        string    : XPathResult.STRING_TYPE,
        unordered : XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        first     : XPathResult.FIRST_ORDERED_NODE_TYPE
    },

    FindByAttrContains: function (obj, tag, attr, className, subDocument, nodeNum) {
        var p = null,
            q = null;

        if (attr === "className") {
            attr = "class";
        }

        if (!subDocument) {
            subDocument = document;
        }

        if (nodeNum) {
            p = subDocument.evaluate(".//" + tag + "[contains(translate(@" +
                attr + ",'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'" +
                className.toLowerCase() + "')]", obj, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

            if (p) {
                if (nodeNum < p.snapshotLength) {
                    return p.snapshotItem(nodeNum);
                } else if (nodeNum >= p.snapshotLength) {
                    return p.snapshotItem(p.snapshotLength - 1);
                }
            }
        } else {
            q = subDocument.evaluate(".//" + tag + "[contains(translate(@" +
                attr + ",'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'" +
                className.toLowerCase() + "')]", obj, null, this.xpath.first, null);

            if (q && q.singleNodeValue) {
                return q.singleNodeValue;
            }
        }

        return null;
    },

    FindByAttrXPath: function (obj, tag, className, subDocument) {
        var q  = null,
            xp = ".//" + tag + "[" + className + "]";

        try {
            if (obj === null) {
                utility.warn('Trying to find xpath with null obj:' + xp);
                return null;
            }

            if (!subDocument) {
                subDocument = document;
            }

            q = subDocument.evaluate(xp, obj, null, this.xpath.first, null);
        } catch (err) {
            utility.error("XPath Failed:" + err, xp);
        }

        if (q && q.singleNodeValue) {
            return q.singleNodeValue;
        }

        return null;
    },

    spaceTags: {
        td    : 1,
        br    : 1,
        hr    : 1,
        span  : 1,
        table : 1
    },

    GetText: function (obj) {
        var txt   = ' ',
            o     = 0,
            child = null;

        if (obj.tagName !== undefined && this.spaceTags[obj.tagName.toLowerCase()]) {
            txt += " ";
        }

        if (obj.nodeName === "#text") {
            return txt + obj.textContent;
        }

        for (o = 0; o < obj.childNodes.length; o += 1) {
            child = obj.childNodes[o];
            txt += this.GetText(child);
        }

        return txt;
    },

    getX: function (path, parent, type) {
        var evaluate = null;
        switch (type) {
        case this.xpath.string :
            evaluate = document.evaluate(path, parent, null, type, null).stringValue;
            break;
        case this.xpath.first :
            evaluate = document.evaluate(path, parent, null, type, null).singleNodeValue;
            break;
        case this.xpath.unordered :
            evaluate = document.evaluate(path, parent, null, type, null);
            break;
        default :
        }

        return evaluate;
    }
};

////////////////////////////////////////////////////////////////////
//                          sort OBJECT
// this is the main object for dealing with sort routines
/////////////////////////////////////////////////////////////////////

sort = {
    name : function (a, b) {
        var A = a.name.toLowerCase(),
            B = b.name.toLowerCase();

        if (A < B) {
            return -1;
        }

        if (A > B) {
            return 1;
        }

        return 0;
    },

    lvl : function (a, b) {
        var A = a.lvl,
            B = b.lvl;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    atk : function (a, b) {
        var A = a.atk,
            B = b.atk;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    def : function (a, b) {
        var A = a.def,
            B = b.def;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    api : function (a, b) {
        var A = a.api,
            B = b.api;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    dpi : function (a, b) {
        var A = a.dpi,
            B = b.dpi;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    mpi : function (a, b) {
        var A = a.mpi,
            B = b.mpi;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    eatk : function (a, b) {
        var A = a.eatk,
            B = b.eatk;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    edef : function (a, b) {
        var A = a.edef,
            B = b.edef;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    eapi : function (a, b) {
        var A = a.eapi,
            B = b.eapi;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    edpi : function (a, b) {
        var A = a.edpi,
            B = b.edpi;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    empi : function (a, b) {
        var A = a.empi,
            B = b.empi;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    owned : function (a, b) {
        var A = a.owned,
            B = b.owned;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    cost : function (a, b) {
        var A = a.cost,
            B = b.cost;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    upkeep : function (a, b) {
        var A = a.upkeep,
            B = b.upkeep;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    },

    hourly : function (a, b) {
        var A = a.hourly,
            B = b.hourly;

        if (A > B) {
            return -1;
        }

        if (A < B) {
            return 1;
        }

        return 0;
    }
};

////////////////////////////////////////////////////////////////////
//                          schedule OBJECT
// this is the main object for dealing with scheduling and timers
/////////////////////////////////////////////////////////////////////

schedule = {
    timers: {},

    log: function (level, text) {
        try {
            var snapshot = {};
            if (utility.logLevel >= level) {
                $.extend(snapshot, this.timers);
                utility.log(level, text, snapshot);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in schedule.log: " + err);
            return false;
        }
    },

    load: function () {
        try {
            if (gm.getItem('schedule.timers', 'default') === 'default') {
                gm.setItem('schedule.timers', this.timers);
            } else {
                this.timers = gm.getItem('schedule.timers', this.timers);
            }

            if (utility.typeOf(this.timers) !== 'object') {
                utility.warn("Invalid timers object! Resetting!");
                gm.deleteItem('schedule.timers');
                this.timers = {};
            }

            this.log(2, "schedule.load");
            return true;
        } catch (err) {
            utility.error("ERROR in schedule.load: " + err);
            return false;
        }
    },

    save: function (force) {
        try {
            gm.setItem('schedule.timers', this.timers);
            this.log(2, "schedule.save");
            return true;
        } catch (err) {
            utility.error("ERROR in schedule.save: " + err);
            return false;
        }
    },

    setItem: function (name, seconds, randomSecs) {
        try {
            var now;
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (!utility.isNum(seconds) || seconds < 0) {
                throw "Invalid number of seconds supplied for (" + name + ") (" + seconds + ")";
            }

            if (!utility.isNum(randomSecs) || randomSecs < 0) {
                randomSecs = 0;
            }

            now = new Date().getTime();
            this.timers[name] = {
                last: now,
                next: now + (seconds * 1000) + (Math.floor(Math.random() * randomSecs) * 1000)
            };

            this.save();
            return this.timers[name];
        } catch (err) {
            utility.error("ERROR in schedule.setItem: " + err);
            return undefined;
        }
    },

    getItem: function (name) {
        try {
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (utility.typeOf(this.timers[name]) !== 'object') {
                throw "Invalid or non-existant timer! " + name;
            }

            return this.timers[name];
        } catch (err) {
            utility.error("ERROR in schedule.getItem: " + err);
            return undefined;
        }
    },

    deleteItem: function (name) {
        try {
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (utility.typeOf(this.timers[name]) !== 'object') {
                utility.warn("schedule.deleteItem - Invalid or non-existant timer: ", name);
            }

            delete this.timers[name];
            return true;
        } catch (err) {
            utility.error("ERROR in schedule.deleteItem: " + err);
            return false;
        }
    },

    check: function (name) {
        try {
            var scheduled = false;
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (utility.typeOf(this.timers[name]) !== 'object') {
                if (utility.logLevel > 2) {
                    utility.warn("Invalid or non-existant timer!", name);
                }

                scheduled = true;
            } else if (this.timers[name].next < new Date().getTime()) {
                scheduled = true;
            }

            return scheduled;
        } catch (err) {
            utility.error("ERROR in schedule.check: " + err);
            return false;
        }
    },

    since: function (name_or_number, seconds) {
        try {
            var value = 0;
            if (isNaN(name_or_number)) {
                if (typeof name_or_number !== 'string' || name_or_number === '') {
                    throw "Invalid identifying name! (" + name_or_number + ")";
                }

                if (utility.typeOf(this.timers[name_or_number]) !== 'object') {
                    if (utility.logLevel > 2) {
                        utility.warn("Invalid or non-existant timer!", name_or_number);
                    }
                } else {
                    value = this.timers[name_or_number].last;
                }
            } else {
                value = name_or_number;
            }

            return (value < (new Date().getTime() - 1000 * seconds));
        } catch (err) {
            utility.error("ERROR in schedule.since: " + err, arguments.callee.caller);
            return false;
        }
    },

    FormatTime: function (time) {
        try {
            var d_names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                t_day   = time.getDay(),
                t_hour  = time.getHours(),
                t_min   = time.getMinutes(),
                a_p     = "PM";

            if (config.getItem("use24hr", true)) {
                t_hour = t_hour + "";
                if (t_hour && t_hour.length === 1) {
                    t_hour = "0" + t_hour;
                }

                t_min = t_min + "";
                if (t_min && t_min.length === 1) {
                    t_min = "0" + t_min;
                }

                return d_names[t_day] + " " + t_hour + ":" + t_min;
            } else {
                if (t_hour < 12) {
                    a_p = "AM";
                }

                if (t_hour === 0) {
                    t_hour = 12;
                }

                if (t_hour > 12) {
                    t_hour = t_hour - 12;
                }

                t_min = t_min + "";
                if (t_min && t_min.length === 1) {
                    t_min = "0" + t_min;
                }

                return d_names[t_day] + " " + t_hour + ":" + t_min + " " + a_p;
            }
        } catch (err) {
            utility.error("ERROR in FormatTime: " + err);
            return "Time Err";
        }
    },

    display: function (name) {
        try {
            var formatted = '';
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name!";
            }

            if (utility.typeOf(this.timers[name]) !== 'object') {
                if (utility.logLevel > 2) {
                    utility.warn("Invalid or non-existant timer!", name);
                }

                formatted = this.FormatTime(new Date());
            } else {
                formatted = this.FormatTime(new Date(this.timers[name].next));
            }

            return formatted;
        } catch (err) {
            utility.error("ERROR in schedule.display: " + err);
            return false;
        }
    }
};

////////////////////////////////////////////////////////////////////
//                          general OBJECT
// this is the main object for dealing with Generals
/////////////////////////////////////////////////////////////////////

general = {
    records: [],

    recordsSortable: [],

    record: function () {
        this.data = {
            name       : '',
            img        : '',
            lvl        : 0,
            last       : new Date().getTime() - (24 * 3600000),
            special    : '',
            atk        : 0,
            def        : 0,
            api        : 0,
            dpi        : 0,
            mpi        : 0,
            eatk       : 0,
            edef       : 0,
            eapi       : 0,
            edpi       : 0,
            empi       : 0,
            energyMax  : 0,
            staminaMax : 0,
            healthMax  : 0
            /*
            battle  : {
                win   : 0,
                loss  : 0,
                total : 0,
                ratio : 0
            },
            duel    : {
                win   : 0,
                loss  : 0,
                total : 0,
                ratio : 0
            },
            war    : {
                win   : 0,
                loss  : 0,
                total : 0,
                ratio : 0
            },
            monster : {
                attack : {
                    used : 0,
                    points : {
                        total : 0,
                        max   : 0,
                        tsp   : 0,
                        dpsp  : 0
                    }
                },
                fortify : {
                    used : 0,
                    points : {
                        total : 0,
                        max   : 0,
                        tep   : 0,
                        fpep  : 0
                    }
                }
            },
            quests  : 0
            */
        };
    },

    log: function (level, text) {
        try {
            var snapshot = [];
            if (utility.logLevel >= level) {
                $.merge(snapshot, this.records);
                utility.log(level, text, snapshot);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in general.log: " + err);
            return false;
        }
    },

    copy2sortable: function () {
        try {
            this.recordsSortable = [];
            $.merge(this.recordsSortable, this.records);
            return true;
        } catch (err) {
            utility.error("ERROR in general.copy2sortable: " + err);
            return false;
        }
    },

    load: function () {
        try {
            this.records = gm.getItem('general.records', 'default');
            if (this.records === 'default') {
                this.records = [];
                gm.setItem('general.records', this.records);
            }

            this.copy2sortable();
            this.BuildlLists();
            state.setItem("GeneralsDashUpdate", true);
            this.log(2, "general.load");
            return true;
        } catch (err) {
            utility.error("ERROR in general.load: " + err);
            return false;
        }
    },

    save: function () {
        try {
            gm.setItem('general.records', this.records);
            state.setItem("GeneralsDashUpdate", true);
            this.log(2, "general.save");
            return true;
        } catch (err) {
            utility.error("ERROR in general.save: " + err);
            return false;
        }
    },

    find: function (general) {
        try {
            var it = 0;

            for (it = 0; it < this.records.length; it += 1) {
                if (this.records[it].name === general) {
                    break;
                }
            }

            if (it >= this.records.length) {
                utility.warn("Unable to find 'General' record");
                return false;
            }

            return this.records[it];
        } catch (err) {
            utility.error("ERROR in general.find: " + err);
            return false;
        }
    },

    GetNames: function () {
        try {
            var it    = 0,
                names = [];

            for (it = 0; it < this.records.length; it += 1) {
                names.push(this.records[it].name);
            }

            return names.sort();
        } catch (err) {
            utility.error("ERROR in general.GetNames: " + err);
            return false;
        }
    },

    GetImage: function (general) {
        try {
            var genImg = this.find(general);

            if (genImg === false) {
                utility.warn("Unable to find 'General' image");
                genImg = '';
            } else {
                genImg = genImg.img;
            }

            return genImg;
        } catch (err) {
            utility.error("ERROR in general.GetImage: " + err);
            return false;
        }
    },

    GetStaminaMax: function (general) {
        try {
            var genStamina = this.find(general);

            if (genStamina === false) {
                utility.warn("Unable to find 'General' stamina");
                genStamina = 0;
            } else {
                genStamina = genStamina.staminaMax;
            }

            return genStamina;
        } catch (err) {
            utility.error("ERROR in general.GetStaminaMax: " + err);
            return false;
        }
    },

    GetEnergyMax: function (general) {
        try {
            var genEnergy = this.find(general);

            if (genEnergy === false) {
                utility.warn("Unable to find 'General' energy");
                genEnergy = 0;
            } else {
                genEnergy = genEnergy.energyMax;
            }

            return genEnergy;
        } catch (err) {
            utility.error("ERROR in general.GetEnergyMax: " + err);
            return false;
        }
    },

    GetHealthMax: function (general) {
        try {
            var genHealth = this.find(general);

            if (genHealth === false) {
                utility.warn("Unable to find 'General' health");
                genHealth = 0;
            } else {
                genHealth = genHealth.healthMax;
            }

            return genHealth;
        } catch (err) {
            utility.error("ERROR in general.GetHealthMax: " + err);
            return false;
        }
    },

    GetLevelUpNames: function () {
        try {
            var it    = 0,
                names = [];

            for (it = 0; it < this.records.length; it += 1) {
                if (this.records[it].lvl < 4) {
                    names.push(this.records[it].name);
                }
            }

            return names;
        } catch (err) {
            utility.error("ERROR in general.GetLevelUpNames: " + err);
            return false;
        }
    },

    List: [],

    BuyList: [],

    IncomeList: [],

    BankingList: [],

    CollectList: [],

    StandardList: [
        'Idle',
        'Monster',
        'Fortify',
        'Battle',
        'Duel',
        'War',
        'SubQuest'
    ],

    BuildlLists: function () {
        try {
            utility.log(1, 'Building Generals Lists');
            this.List = [
                'Use Current',
                'Under Level 4'
            ].concat(this.GetNames());

            var crossList = function (checkItem) {
                return (general.List.indexOf(checkItem) >= 0);
            };

            this.BuyList = [
                'Use Current',
                'Darius',
                'Lucius',
                'Garlan',
                'Penelope'
            ].filter(crossList);

            this.IncomeList = [
                'Use Current',
                'Scarlett',
                'Mercedes',
                'Cid'
            ].filter(crossList);

            this.BankingList = [
                'Use Current',
                'Aeris'
            ].filter(crossList);

            this.CollectList = [
                'Use Current',
                'Angelica',
                'Morrigan'
            ].filter(crossList);

            return true;
        } catch (err) {
            utility.error("ERROR in BuildlLists: " + err);
            return false;
        }
    },

    GetCurrent: function () {
        try {
            var generalName = '',
                nameObj     = null;

            nameObj = $("#app46755028429_equippedGeneralContainer .general_name_div3");
            if (nameObj) {
                generalName = $.trim(nameObj.text()).replace(/[\t\r\n]/g, '').replace('**', '');
            }

            if (!generalName) {
                utility.warn("Couldn't get current 'General'. Will use current 'General'", generalName);
                return 'Use Current';
            }

            utility.log(8, "Current General", generalName);
            return generalName;
        } catch (err) {
            utility.error("ERROR in GetCurrent: " + err);
            return 'Use Current';
        }
    },

    GetGenerals: function () {
        try {
            var generalsDiv = null,
                update      = false,
                save        = false,
                tempObj     = null;

            generalsDiv = $(".generalSmallContainer2");
            if (generalsDiv.length) {
                generalsDiv.each(function (index) {
                    var newGeneral   = new general.record(),
                        name      = '',
                        img       = '',
                        level     = 0,
                        atk       = 0,
                        def       = 0,
                        special   = '',
                        container = $(this),
                        it        = 0;

                    tempObj = container.find(".general_name_div3");
                    if (tempObj && tempObj.length) {
                        name = tempObj.text().replace(/[\t\r\n]/g, '').replace('**', '');
                    } else {
                        utility.warn("Unable to find 'name' container", index);
                    }

                    tempObj = container.find(".imgButton");
                    if (tempObj && tempObj.length) {
                        img = utility.getHTMLPredicate(tempObj.attr("src"));
                    } else {
                        utility.warn("Unable to find 'image' container", index);
                    }

                    tempObj = container.children().eq(3);
                    if (tempObj && tempObj.length) {
                        level = parseInt(tempObj.text().replace(/Level /gi, '').replace(/[\t\r\n]/g, ''), 10);
                    } else {
                        utility.warn("Unable to find 'level' container", index);
                    }

                    tempObj = container.children().eq(4);
                    if (tempObj && tempObj.length) {
                        special = $.trim($(tempObj.html().replace(/<br>/g, ' ')).text());
                    } else {
                        utility.warn("Unable to find 'special' container", index);
                    }

                    tempObj = container.find(".generals_indv_stats_padding div");
                    if (tempObj && tempObj.length === 2) {
                        atk = parseInt(tempObj.eq(0).text(), 10);
                        def = parseInt(tempObj.eq(1).text(), 10);
                    } else {
                        utility.warn("Unable to find 'attack and defence' containers", index);
                    }

                    if (name && img && level && utility.isNum(atk) && utility.isNum(def) && special) {
                        for (it = 0; it < general.records.length; it += 1) {
                            if (general.records[it].name === name) {
                                newGeneral.data = general.records[it];
                                break;
                            }
                        }

                        newGeneral.data.name = name;
                        newGeneral.data.img = img;
                        newGeneral.data.lvl = level;
                        newGeneral.data.atk = atk;
                        newGeneral.data.def = def;
                        newGeneral.data.api = atk + (def * 0.7);
                        newGeneral.data.dpi = def + (atk * 0.7);
                        newGeneral.data.mpi = (newGeneral.data.api + newGeneral.data.dpi) / 2;
                        newGeneral.data.special = special;
                        if (it < general.records.length) {
                            general.records[it] = newGeneral.data;
                        } else {
                            utility.log(1, "Adding new 'General'", newGeneral.data.name);
                            general.records.push(newGeneral.data);
                            update = true;
                        }

                        save = true;
                    } else {
                        utility.warn("Missing required 'General' attribute", index);
                    }
                });

                if (save) {
                    caap.stats.generals.total = this.records.length;
                    caap.stats.generals.invade = Math.min((caap.stats.army.actual / 5).toFixed(0), this.records.length);
                    this.save();
                    caap.SaveStats();
                    this.copy2sortable();
                    if (update) {
                        this.UpdateDropDowns();
                    }
                }

                utility.log(2, "All Generals", this.records);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in GetGenerals: " + err);
            return false;
        }
    },

    UpdateDropDowns: function () {
        try {
            this.BuildlLists();
            utility.log(1, "Updating 'General' Drop Down Lists");
            for (var generalType in this.StandardList) {
                if (this.StandardList.hasOwnProperty(generalType)) {
                    caap.ChangeDropDownList(this.StandardList[generalType] + 'General', this.List, config.getItem(this.StandardList[generalType] + 'General', 'Use Current'));
                }
            }

            caap.ChangeDropDownList('BuyGeneral', this.BuyList, config.getItem('BuyGeneral', 'Use Current'));
            caap.ChangeDropDownList('IncomeGeneral', this.IncomeList, config.getItem('IncomeGeneral', 'Use Current'));
            caap.ChangeDropDownList('BankingGeneral', this.BankingList, config.getItem('BankingGeneral', 'Use Current'));
            caap.ChangeDropDownList('CollectGeneral', this.CollectList, config.getItem('CollectGeneral', 'Use Current'));
            caap.ChangeDropDownList('LevelUpGeneral', this.List, config.getItem('LevelUpGeneral', 'Use Current'));
            return true;
        } catch (err) {
            utility.error("ERROR in UpdateDropDowns: " + err);
            return false;
        }
    },

    Clear: function (whichGeneral) {
        try {
            utility.log(1, 'Setting ' + whichGeneral + ' to "Use Current"');
            config.setItem(whichGeneral, 'Use Current');
            this.UpdateDropDowns();
            return true;
        } catch (err) {
            utility.error("ERROR in Clear: " + err);
            return false;
        }
    },

    LevelUpCheck: function (whichGeneral) {
        try {
            var generalType = '',
                use = false,
                keepGeneral = false;

            if ((caap.stats.staminaT.num > caap.stats.stamina.max || caap.stats.energyT.num > caap.stats.energy.max) && state.getItem('KeepLevelUpGeneral', false)) {
                utility.log(1, "Keep Level Up General");
                keepGeneral = true;
            } else if (state.getItem('KeepLevelUpGeneral', false)) {
                utility.log(1, "Clearing Keep Level Up General flag");
                state.setItem('KeepLevelUpGeneral', false);
            }

            generalType = $.trim(whichGeneral.replace(/General/i, ''));
            if (config.getItem('LevelUpGeneral', 'Use Current') !== 'Use Current' && (this.StandardList.indexOf(generalType) >= 0 || generalType === 'Quest')) {
                if (keepGeneral || (config.getItem(generalType + 'LevelUpGeneral', false) && caap.stats.exp.dif && caap.stats.exp.dif <= config.getItem('LevelUpGeneralExp', 0))) {
                    use = true;
                }
            }

            return use;
        } catch (err) {
            utility.error("ERROR in LevelUpCheck: " + err);
            return undefined;
        }
    },

    Select: function (whichGeneral) {
        try {
            var generalName       = '',
                getCurrentGeneral = '',
                currentGeneral    = '',
                generalImage      = '';

            if (this.LevelUpCheck(whichGeneral)) {
                whichGeneral = 'LevelUpGeneral';
                utility.log(1, 'Using level up general');
            }

            generalName = config.getItem(whichGeneral, 'Use Current');
            if (!generalName || /use current/i.test(generalName)) {
                return false;
            }

            if (/under level 4/i.test(generalName)) {
                if (!this.GetLevelUpNames().length) {
                    return this.Clear(whichGeneral);
                }

                if (config.getItem('ReverseLevelUpGenerals')) {
                    generalName = this.GetLevelUpNames().reverse().pop();
                } else {
                    generalName = this.GetLevelUpNames().pop();
                }
            }

            getCurrentGeneral = this.GetCurrent();
            if (!getCurrentGeneral) {
                caap.ReloadCastleAge();
            }

            currentGeneral = getCurrentGeneral;
            if (generalName.indexOf(currentGeneral) >= 0) {
                return false;
            }

            utility.log(1, 'Changing from ' + currentGeneral + ' to ' + generalName);
            if (utility.NavigateTo('mercenary,generals', 'tab_generals_on.gif')) {
                return true;
            }

            generalImage = this.GetImage(generalName);
            if (utility.CheckForImage(generalImage)) {
                return utility.NavigateTo(generalImage);
            }

            caap.SetDivContent('Could not find ' + generalName);
            utility.warn('Could not find', generalName, generalImage);
            if (config.getItem('ignoreGeneralImage', true)) {
                return false;
            } else {
                return this.Clear(whichGeneral);
            }
        } catch (err) {
            utility.error("ERROR in Select: " + err);
            return false;
        }
    },

    quickSwitch: false,

    GetEquippedStats: function () {
        try {
            var generalName  = '',
                it           = 0,
                generalDiv   = null,
                tempObj      = null,
                success      = false;

            generalName = this.GetCurrent();
            if (generalName === 'Use Current') {
                return false;
            }

            utility.log(1, "Equipped 'General'", generalName);
            for (it = 0; it < this.records.length; it += 1) {
                if (this.records[it].name === generalName) {
                    break;
                }
            }

            if (it >= this.records.length) {
                utility.warn("Unable to find 'General' record");
                return false;
            }

            generalDiv = $("#app46755028429_equippedGeneralContainer .generals_indv_stats div");
            if (generalDiv && generalDiv.length === 2) {
                tempObj = generalDiv.eq(0);
                if (tempObj && tempObj.length) {
                    this.records[it].eatk = parseInt(tempObj.text(), 10);
                    tempObj = generalDiv.eq(1);
                    if (tempObj && tempObj.length) {
                        this.records[it].edef = parseInt(tempObj.text(), 10);
                        success = true;
                    } else {
                        utility.warn("Unable to get 'General' defense object");
                    }
                } else {
                    utility.warn("Unable to get 'General' attack object");
                }

                if (success) {
                    this.records[it].eapi = (this.records[it].eatk + (this.records[it].edef * 0.7));
                    this.records[it].edpi = (this.records[it].edef + (this.records[it].eatk * 0.7));
                    this.records[it].empi = ((this.records[it].eapi + this.records[it].edpi) / 2);
                    this.records[it].energyMax = caap.stats.energyT.max;
                    this.records[it].staminaMax = caap.stats.staminaT.max;
                    this.records[it].healthMax = caap.stats.healthT.max;
                    this.records[it].last = new Date().getTime();
                    this.save();
                    this.copy2sortable();
                    utility.log(2, "Got 'General' stats", this.records[it]);
                } else {
                    utility.warn("Unable to get 'General' stats");
                }
            } else {
                utility.warn("Unable to get equipped 'General' divs", generalDiv);
            }

            return this.records[it];
        } catch (err) {
            utility.error("ERROR in GetAllStats: " + err);
            return false;
        }
    },

    GetAllStats: function () {
        try {
            if (!schedule.check("allGenerals")) {
                return false;
            }

            var generalImage = '',
                it           = 0,
                theGeneral   = '';

            for (it = 0; it < this.records.length; it += 1) {
                if (schedule.since(this.records[it].last, gm.getItem("GeneralLastReviewed", 24, hiddenVar) * 3600)) {
                    break;
                }
            }

            if (it >= this.records.length) {
                schedule.setItem("allGenerals", gm.getItem("GetAllGenerals", 168, hiddenVar) * 3600, 300);
                utility.log(2, "Finished visiting all Generals for their stats");
                theGeneral = config.getItem('IdleGeneral', 'Use Current');
                if (theGeneral !== 'Use Current') {
                    utility.log(1, "Changing to idle general");
                    return this.Select('IdleGeneral');
                }

                return false;
            }

            if (utility.NavigateTo('mercenary,generals', 'tab_generals_on.gif')) {
                utility.log(1, "Visiting generals to get 'General' stats");
                return true;
            }

            generalImage = this.GetImage(this.records[it].name);
            if (utility.CheckForImage(generalImage)) {
                if (this.GetCurrent() !== this.records[it].name) {
                    utility.log(1, "Visiting 'General'", this.records[it].name);
                    return utility.NavigateTo(generalImage);
                }
            }

            return true;
        } catch (err) {
            utility.error("ERROR in GetAllStats: " + err);
            return false;
        }
    }
};

////////////////////////////////////////////////////////////////////
//                          monster OBJECT
// this is the main object for dealing with Monsters
/////////////////////////////////////////////////////////////////////

monster = {
    records: [],

    record: function () {
        this.data = {
            name       : '',
            attacked   : -1,
            defended   : -1,
            damage     : -1,
            life       : -1,
            fortify    : -1,
            timeLeft   : '',
            t2k        : -1,
            phase      : '',
            link       : '',
            rix        : -1,
            over       : '',
            page       : '',
            color      : '',
            review     : -1,
            type       : '',
            conditions : '',
            charClass  : '',
            strength   : -1,
            stun       : -1,
            stunTime   : -1,
            stunDo     : false,
            stunType   : '',
            tip        : ''
        };
    },

    engageButtons: {},

    completeButton: {},

    // http://castleage.wikidot.com/monster for monster info
    // http://castleage.wikidot.com/skaar
    info: {
        'Deathrune' : {
            duration     : 96,
            defense      : true,
            hp           : 100000000,
            ach          : 1000000,
            siege        : 5,
            siegeClicks  : [30, 60, 90, 120, 200],
            siegeDam     : [6600000, 8250000, 9900000, 13200000, 16500000],
            siege_img    : ['/graphics/death_siege_small'],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            reqAtkButton : 'attack_monster_button.jpg',
            v            : 'attack_monster_button2.jpg',
            defButton    : 'button_dispel.gif',
            defense_img  : 'bar_dispel.gif'
        },
        'Ice Elemental' : {
            duration     : 168,
            defense      : true,
            hp           : 100000000,
            ach          : 1000000,
            siege        : 5,
            siegeClicks  : [30, 60, 90, 120, 200],
            siegeDam     : [7260000, 9075000, 10890000, 14520000, 18150000],
            siege_img    : ['/graphics/water_siege_small'],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            reqAtkButton : 'attack_monster_button.jpg',
            pwrAtkButton : 'attack_monster_button2.jpg',
            defButton    : 'button_dispel.gif',
            defense_img  : 'bar_dispel.gif'
        },
        'Earth Elemental' : {
            duration     : 168,
            defense      : true,
            hp           : 100000000,
            ach          : 1000000,
            siege        : 5,
            siegeClicks  : [30, 60, 90, 120, 200],
            siegeDam     : [6600000, 8250000, 9900000, 13200000, 16500000],
            siege_img    : ['/graphics/earth_siege_small'],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            reqAtkButton : 'attack_monster_button.jpg',
            pwrAtkButton : 'attack_monster_button2.jpg',
            defButton    : 'attack_monster_button3.jpg',
            defense_img  : 'seamonster_ship_health.jpg',
            repair_img   : 'repair_bar_grey.jpg'
        },
        'Hydra' : {
            duration     : 168,
            hp           : 100000000,
            ach          : 500000,
            siege        : 6,
            siegeClicks  : [10, 20, 50, 100, 200, 300],
            siegeDam     : [1340000, 2680000, 5360000, 14700000, 28200000, 37520000],
            siege_img    : ['/graphics/monster_siege_small'],
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50]
        },
        'Legion' : {
            duration     : 168,
            hp           : 100000,
            ach          : 1000,
            siege        : 6,
            siegeClicks  : [10, 20, 40, 80, 150, 300],
            siegeDam     : [3000, 4500, 6000, 9000, 12000, 15000],
            siege_img    : ['/graphics/castle_siege_small'],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            defense_img  : 'seamonster_ship_health.jpg',
            repair_img   : 'repair_bar_grey.jpg'
        },
        'Emerald Dragon' : {
            duration     : 72,
            ach          : 100000,
            siege        : 0
        },
        'Frost Dragon' : {
            duration     : 72,
            ach          : 100000,
            siege        : 0
        },
        'Gold Dragon' : {
            duration     : 72,
            ach          : 100000,
            siege        : 0
        },
        'Red Dragon' : {
            duration     : 72,
            ach          : 100000,
            siege        : 0
        },
        'King'      : {
            duration     : 72,
            ach          : 15000,
            siege        : 0
        },
        'Terra'     : {
            duration     : 72,
            ach          : 20000,
            siege        : 0
        },
        'Queen'     : {
            duration     : 48,
            ach          : 50000,
            siege        : 1,
            siegeClicks  : [11],
            siegeDam     : [500000],
            siege_img    : ['/graphics/boss_sylvanas_drain_icon.gif']
        },
        'Ravenmoore' : {
            duration     : 48,
            ach          : 500000,
            siege        : 0
        },
        'Knight'    : {
            duration     : 48,
            ach          : 30000,
            siege        : 0,
            reqAtkButton : 'event_attack1.gif',
            pwrAtkButton : 'event_attack2.gif',
            defButton    : null
        },
        'Serpent'   : {
            duration     : 72,
            defense      : true,
            ach          : 250000,
            siege        : 0,
            fort         : true,
            //staUse       : 5,
            defense_img  : 'seamonster_ship_health.jpg'
        },
        'Raid I'    : {
            duration     : 88,
            raid         : true,
            ach          : 50,
            siege        : 2,
            siegeClicks  : [30, 50],
            siegeDam     : [200, 500],
            siege_img    : ['/graphics/monster_siege_'],
            staUse       : 1
        },
        'Raid II'   : {
            duration     : 144,
            raid         : true,
            ach          : 50,
            siege        : 2,
            siegeClicks  : [80, 100],
            siegeDam     : [300, 1500],
            siege_img    : ['/graphics/monster_siege_'],
            staUse       : 1
        },
        'Mephistopheles' : {
            duration     : 48,
            ach          : 200000,
            siege        : 0
        },
        // http://castleage.wikia.com/wiki/War_of_the_Red_Plains
        'Plains' : {
            alpha        : true,
            duration     : 168,
            hp           : 350000000,
            ach          : 10000,
            siege        : 7,
            siegeClicks  : [30, 60, 90, 120, 200, 250, 300],
            siegeDam     : [13750000, 17500000, 20500000, 23375000, 26500000, 29500000, 34250000],
            siege_img    : [
                '/graphics/water_siege_small',
                '/graphics/alpha_bahamut_siege_blizzard_small',
                '/graphics/azriel_siege_inferno_small',
                '/graphics/war_siege_holy_smite_small'
            ],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            defense_img  : 'nm_green.jpg'
        },
        // http://castleage.wikia.com/wiki/Bahamut,_the_Volcanic_Dragon
        'Volcanic Dragon' : {
            alpha        : true,
            duration     : 168,
            hp           : 130000000,
            ach          : 4000000,
            siege        : 5,
            siegeClicks  : [30, 60, 90, 120, 200],
            siegeDam     : [7896000, 9982500, 11979000, 15972000, 19965000],
            siege_img    : ['/graphics/water_siege_small'],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            defense_img  : 'nm_green.jpg'
        },
        // http://castleage.wikidot.com/alpha-bahamut
        // http://castleage.wikia.com/wiki/Alpha_Bahamut,_The_Volcanic_Dragon
        'Alpha Volcanic Dragon' : {
            alpha        : true,
            duration     : 168,
            hp           : 620000000,
            ach          : 8000000,
            siege        : 7,
            siegeClicks  : [30, 60, 90, 120, 200, 250, 300],
            siegeDam     : [22250000, 27500000, 32500000, 37500000, 42500000, 47500000, 55000000],
            siege_img    : [
                '/graphics/water_siege_small',
                '/graphics/alpha_bahamut_siege_blizzard_small',
                '/graphics/azriel_siege_inferno_small'
            ],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            defense_img  : 'nm_green.jpg'
        },
        // http://castleage.wikia.com/wiki/Azriel,_the_Angel_of_Wrath
        'Wrath' : {
            alpha        : true,
            duration     : 168,
            hp           : 600000000,
            ach          : 8000000,
            siege        : 7,
            siegeClicks  : [30, 60, 90, 120, 200, 250, 300],
            siegeDam     : [22250000, 27500000, 32500000, 37500000, 42500000, 47500000, 55000000],
            siege_img    : [
                '/graphics/water_siege_small',
                '/graphics/alpha_bahamut_siege_blizzard_small',
                '/graphics/azriel_siege_inferno_small'
            ],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            defense_img  : 'nm_green.jpg'
        },
        'Alpha Mephistopheles' : {
            alpha        : true,
            duration     : 168,
            hp           : 600000000,
            ach          : 12000000,
            siege        : 10,
            siegeClicks  : [15, 30, 45, 60, 75, 100, 150, 200, 250, 300],
            siegeDam     : [19050000, 22860000, 26670000, 30480000, 34290000, 38100000, 45720000, 49530000, 53340000, 60960000],
            siege_img    : [
                '/graphics/earth_siege_small',
                '/graphics/castle_siege_small',
                '/graphics/death_siege_small',
                '/graphics/skaar_siege_small'
            ],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            defense_img  : 'nm_green.jpg'
        },
        'Fire Elemental' : {
            alpha        : true,
            duration     : 168,
            hp           : 350000000,
            ach          : 6000000,
            siege        : 7,
            siegeClicks  : [30, 60, 90, 120, 200, 250, 300],
            siegeDam     : [14750000, 18500000, 21000000, 24250000, 27000000, 30000000, 35000000],
            siege_img    : [
                '/graphics/water_siege_small',
                '/graphics/alpha_bahamut_siege_blizzard_small',
                '/graphics/azriel_siege_inferno_small',
                '/graphics/war_siege_holy_smite_small'
            ],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            defense_img  : 'nm_green.jpg'
        },
        "Rebellion's Life" : {
            alpha        : true,
            duration     : 168,
            hp           : 350000000,
            ach          : 20000,
            siege        : 7,
            siegeClicks  : [30, 60, 90, 120, 200, 250, 300],
            siegeDam     : [15250000, 19000000, 21500000, 24750000, 27500000, 30500000, 35500000],
            siege_img    : [
                '/graphics/water_siege_small',
                '/graphics/alpha_bahamut_siege_blizzard_small',
                '/graphics/azriel_siege_inferno_small',
                '/graphics/war_siege_holy_smite_small'
            ],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            defense_img  : 'nm_green.jpg'
        }
    },

    log: function (level, text) {
        try {
            var snapshot = [];
            if (utility.logLevel >= level) {
                $.merge(snapshot, this.records);
                utility.log(level, text, snapshot);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in monster.log: " + err);
            return false;
        }
    },

    load: function () {
        try {
            this.records = gm.getItem('monster.records', 'default');
            if (this.records === 'default') {
                this.records = [];
                gm.setItem('monster.records', this.records);
            }

            state.setItem("MonsterDashUpdate", true);
            this.log(2, "monster.load");
            return true;
        } catch (err) {
            utility.error("ERROR in monster.load: " + err);
            return false;
        }
    },

    save: function () {
        try {
            gm.setItem('monster.records', this.records);
            state.setItem("MonsterDashUpdate", true);
            this.log(2, "monster.save");
            return true;
        } catch (err) {
            utility.error("ERROR in monster.save: " + err);
            return false;
        }
    },

    parseCondition: function (type, conditions) {
        try {
            if (!conditions || conditions.toLowerCase().indexOf(':' + type) < 0) {
                return false;
            }

            var str    = '',
                value  = 0,
                first  = false,
                second = false;

            str = conditions.substring(conditions.indexOf(':' + type) + type.length + 1).replace(new RegExp(":.+"), '');
            value = parseFloat(str);
            if (/k$/i.test(str) || /m$/i.test(str)) {
                first = /\d+k/i.test(str);
                second = /\d+m/i.test(str);
                value = value * 1000 * (first + second * 1000);
            }

            return value;
        } catch (err) {
            utility.error("ERROR in monster.parseCondition: " + err);
            return false;
        }
    },

    type: function (name) {
        try {
            var words = [],
                count = 0;

            if (typeof name !== 'string') {
                utility.warn("name", name);
                throw "Invalid identifying name!";
            }

            if (name === '') {
                return '';
            }

            words = name.split(" ");
            count = words.length - 1;
            if (count >= 4) {
                if (words[count - 4] === 'Alpha' && words[count - 1] === 'Volcanic' && words[count] === 'Dragon') {
                    return words[count - 4] + ' ' + words[count - 1] + ' ' + words[count];
                }
            }

            if (words[count] === 'Elemental' || words[count] === 'Dragon' ||
                    (words[count - 1] === 'Alpha' && words[count] === 'Mephistopheles') ||
                    (words[count - 1] === "Rebellion's" && words[count] === 'Life') ||
                    (words[count - 1] === 'Fire' && words[count] === 'Elemental')) {
                return words[count - 1] + ' ' + words[count];
            }

            return words[count];
        } catch (err) {
            utility.error("ERROR in monster.type: " + err, arguments.callee.caller);
            return false;
        }
    },

    getItem: function (name) {
        try {
            var it        = 0,
                success   = false,
                newRecord = null;

            if (typeof name !== 'string') {
                utility.warn("name", name);
                throw "Invalid identifying name!";
            }

            if (name === '') {
                return '';
            }

            for (it = 0; it < this.records.length; it += 1) {
                if (this.records[it].name === name) {
                    success = true;
                    break;
                }
            }

            if (success) {
                utility.log(3, "Got monster record", name, this.records[it]);
                return this.records[it];
            } else {
                newRecord = new this.record();
                newRecord.data.name = name;
                utility.log(3, "New monster record", name, newRecord.data);
                return newRecord.data;
            }
        } catch (err) {
            utility.error("ERROR in monster.getItem: " + err, arguments.callee.caller);
            return false;
        }
    },

    setItem: function (record) {
        try {
            if (!record || utility.typeOf(record) !== 'object') {
                throw "Not passed a record";
            }

            if (typeof record.name !== 'string' || record.name === '') {
                utility.warn("name", record.name);
                throw "Invalid identifying name!";
            }

            var it      = 0,
                success = false;

            for (it = 0; it < this.records.length; it += 1) {
                if (this.records[it].name === record.name) {
                    success = true;
                    break;
                }
            }

            if (success) {
                this.records[it] = record;
                utility.log(3, "Updated monster record", record, this.records);
            } else {
                this.records.push(record);
                utility.log(3, "Added monster record", record, this.records);
            }

            this.save();
            return true;
        } catch (err) {
            utility.error("ERROR in monster.setItem: " + err);
            return false;
        }
    },

    deleteItem: function (name) {
        try {
            var it        = 0,
                success   = false;

            if (typeof name !== 'string' || name === '') {
                utility.warn("name", name);
                throw "Invalid identifying name!";
            }

            for (it = 0; it < this.records.length; it += 1) {
                if (this.records[it].name === name) {
                    success = true;
                    break;
                }
            }

            if (success) {
                this.records.splice(it, 1);
                this.save();
                utility.log(2, "Deleted monster record", name, this.records);
                return true;
            } else {
                utility.warn("Unable to delete monster record", name, this.records);
                return false;
            }
        } catch (err) {
            utility.error("ERROR in monster.deleteItem: " + err);
            return false;
        }
    },

    clear: function () {
        try {
            this.records = state.setItem("monster.records", []);
            return true;
        } catch (err) {
            utility.error("ERROR in monster.clear: " + err);
            return false;
        }
    },

    t2kCalc: function (boss, time, percentHealthLeft, siegeStage, clicksNeededInCurrentStage) {
        try {
            var siegeStageStr                  = '',
                timeLeft                       = 0,
                timeUsed                       = 0,
                T2K                            = 0,
                damageDone                     = 0,
                hpLeft                         = 0,
                totalSiegeDamage               = 0,
                totalSiegeClicks               = 0,
                attackDamPerHour               = 0,
                clicksPerHour                  = 0,
                clicksToNextSiege              = 0,
                nextSiegeAttackPlusSiegeDamage = 0,
                s                              = 0,
                siegeImpacts                   = 0;


            timeLeft = parseInt(time[0], 10) + (parseInt(time[1], 10) * 0.0166);
            timeUsed = boss.duration - timeLeft;
            if (!boss.siege || !boss.hp) {
                return (percentHealthLeft * timeUsed) / (100 - percentHealthLeft);
            }

            siegeStageStr = (siegeStage - 1).toString();
            damageDone = (100 - percentHealthLeft) / 100 * boss.hp;
            hpLeft = boss.hp - damageDone;
            for (s in boss.siegeClicks) {
                if (boss.siegeClicks.hasOwnProperty(s)) {
                    utility.log(9, 's ', s, ' T2K ', T2K, ' hpLeft ', hpLeft);
                    if (s < siegeStageStr  || clicksNeededInCurrentStage === 0) {
                        totalSiegeDamage += boss.siegeDam[s];
                        totalSiegeClicks += boss.siegeClicks[s];
                    }

                    if (s === siegeStageStr) {
                        attackDamPerHour = (damageDone - totalSiegeDamage) / timeUsed;
                        clicksPerHour = (totalSiegeClicks + boss.siegeClicks[s] - clicksNeededInCurrentStage) / timeUsed;
                        utility.log(9, 'Attack Damage Per Hour: ', attackDamPerHour);
                        utility.log(9, 'Damage Done: ', damageDone);
                        utility.log(9, 'Total Siege Damage: ', totalSiegeDamage);
                        utility.log(9, 'Time Used: ', timeUsed);
                        utility.log(9, 'Clicks Per Hour: ', clicksPerHour);
                    }

                    if (s >= siegeStageStr) {
                        clicksToNextSiege = (s === siegeStageStr) ? clicksNeededInCurrentStage : boss.siegeClicks[s];
                        nextSiegeAttackPlusSiegeDamage = boss.siegeDam[s] + clicksToNextSiege / clicksPerHour * attackDamPerHour;
                        if (hpLeft <= nextSiegeAttackPlusSiegeDamage || clicksNeededInCurrentStage === 0) {
                            T2K += hpLeft / attackDamPerHour;
                            break;
                        }

                        T2K += clicksToNextSiege / clicksPerHour;
                        hpLeft -= nextSiegeAttackPlusSiegeDamage;
                    }
                }
            }

            siegeImpacts = percentHealthLeft / (100 - percentHealthLeft) * timeLeft;
            utility.log(2, 'T2K based on siege: ', T2K.toFixed(2));
            utility.log(2, 'T2K estimate without calculating siege impacts: ', siegeImpacts.toFixed(2));
            return T2K;
        } catch (err) {
            utility.error("ERROR in monster.t2kCalc: " + err);
            return 0;
        }
    },

    characterClass: {
        Warrior : ['Strengthen', 'Heal'],
        Rogue   : ['Cripple'],
        Mage    : ['Deflect'],
        Cleric  : ['Heal'],
        Warlock : ['Heal', 'Deflect'],
        Ranger  : ['Strengthen', 'Cripple']
    },

    flagReview: function (force) {
        try {
            schedule.setItem("monsterReview", 0);
            state.setItem('monsterReviewCounter', -3);
            return true;
        } catch (err) {
            utility.error("ERROR in monster.flagReview: " + err);
            return false;
        }
    },

    flagFullReview: function (force) {
        try {
            this.clear();
            this.flagReview();
            schedule.setItem('NotargetFrombattle_monster', 0);
            state.setItem('ReleaseControl', true);
            caap.UpdateDashboard(true);
            return true;
        } catch (err) {
            utility.error("ERROR in monster.flagFullReview: " + err);
            return false;
        }
    },

    select: function (force) {
        try {
            if (!(force || utility.oneMinuteUpdate('selectMonster')) || caap.stats.level < 7) {
                return false;
            }

            utility.log(1, 'Selecting monster');
            // First we forget everything about who we already picked.
            state.setItem('targetFrombattle_monster', '');
            state.setItem('targetFromfortify', '');
            state.setItem('targetFromraid', '');

            // Next we get our monster objects from the reposoitory and break them into separarte lists
            // for monster or raid.  If we are serializing then we make one list only.
            var monsterList  = {
                    battle_monster : [],
                    raid           : [],
                    any            : []
                },
                it                 = 0,
                s                  = 0,
                selectTypes        = [],
                maxToFortify       = 0,
                nodeNum            = 0,
                firstOverAch       = '',
                firstUnderMax      = '',
                firstFortOverAch   = '',
                firstFortUnderMax  = '',
                firstStunOverAch   = '',
                firstStunUnderMax  = '',
                monsterName        = '',
                monsterObj         = {},
                monsterConditions  = '',
                monstType          = '',
                p                  = 0,
                m                  = 0,
                attackOrderList    = [];


            for (it = 0; it < this.records.length; it += 1) {
                if (this.records[it].type === '') {
                    this.records[it].type = this.type(this.records[it].name);
                }

                if (this.info[this.records[it].type] && this.info[this.records[it].type].alpha) {
                    if (this.records[it].damage !== -1 && this.records[it].color !== 'grey' && schedule.since(this.records[it].stunTime, 0)) {
                        utility.log(1, "Review monster due to class timer", this.records[it].name);
                        this.records[it].review = 0;
                        schedule.setItem("monsterReview", 0);
                        state.setItem('monsterReviewCounter', -3);
                    }
                }

                this.records[it].conditions = 'none';
                if (gm.getItem('SerializeRaidsAndMonsters', false, hiddenVar)) {
                    monsterList.any.push(this.records[it].name);
                } else if ((this.records[it].page === 'raid') || (this.records[it].page === 'battle_monster')) {
                    monsterList[this.records[it].page].push(this.records[it].name);
                }
            }

            this.save();

            //PLEASE NOTE BEFORE CHANGING
            //The Serialize Raids and Monsters dictates a 'single-pass' because we only need select
            //one "targetFromxxxx" to fill in. The other MUST be left blank. This is what keeps it
            //serialized!!! Trying to make this two pass logic is like trying to fit a square peg in
            //a round hole. Please reconsider before doing so.
            if (gm.getItem('SerializeRaidsAndMonsters', false, hiddenVar)) {
                selectTypes = ['any'];
            } else {
                selectTypes = ['battle_monster', 'raid'];
            }

            utility.log(3, 'records/monsterList/selectTypes', this.records, monsterList, selectTypes);
            // We loop through for each selection type (only once if serialized between the two)
            // We then read in the users attack order list
            for (s in selectTypes) {
                if (selectTypes.hasOwnProperty(s)) {
                    if (!monsterList[selectTypes[s]].length) {
                        continue;
                    }

                    firstOverAch       = '';
                    firstUnderMax      = '';
                    firstFortOverAch   = '';
                    firstFortUnderMax  = '';
                    firstStunOverAch   = '';
                    firstStunUnderMax  = '';

                    // The extra apostrophe at the end of attack order makes it match any "soandos's monster" so it always selects a monster if available
                    if (selectTypes[s] === 'any') {
                        attackOrderList = utility.TextToArray(config.getItem('orderbattle_monster', ''));
                        $.merge(attackOrderList, utility.TextToArray(config.getItem('orderraid', '')).concat('your', "'"));
                    } else {
                        attackOrderList = utility.TextToArray(config.getItem('order' + selectTypes[s], '')).concat('your', "'");
                    }

                    utility.log(9, 'attackOrderList', attackOrderList);
                    // Next we step through the users list getting the name and conditions
                    for (p in attackOrderList) {
                        if (attackOrderList.hasOwnProperty(p)) {
                            if (!($.trim(attackOrderList[p]))) {
                                continue;
                            }

                            monsterConditions = $.trim(attackOrderList[p].replace(new RegExp("^[^:]+"), '').toString());
                            // Now we try to match the users name agains our list of monsters
                            for (m in monsterList[selectTypes[s]]) {
                                if (monsterList[selectTypes[s]].hasOwnProperty(m)) {
                                    if (!monsterList[selectTypes[s]][m]) {
                                        continue;
                                    }

                                    maxToFortify = 0;
                                    monsterObj = this.getItem(monsterList[selectTypes[s]][m]);
                                    // If we set conditions on this monster already then we do not reprocess
                                    if (monsterObj.conditions !== 'none') {
                                        continue;
                                    }

                                    //If this monster does not match, skip to next one
                                    // Or if this monster is dead, skip to next one
                                    // Or if this monster is not the correct type, skip to next one
                                    if (monsterList[selectTypes[s]][m].toLowerCase().indexOf($.trim(attackOrderList[p].match(new RegExp("^[^:]+")).toString()).toLowerCase()) < 0 || (selectTypes[s] !== 'any' && monsterObj.page !== selectTypes[s])) {
                                        continue;
                                    }

                                    //Monster is a match so we set the conditions
                                    monsterObj.conditions = monsterConditions;

                                    //monsterObj.over = '';
                                    this.setItem(monsterObj);

                                    // If it's complete or collect rewards, no need to process further
                                    if (monsterObj.color === 'grey') {
                                        continue;
                                    }

                                    utility.log(3, 'Current monster being checked', monsterObj);
                                    // checkMonsterDamage would have set our 'color' and 'over' values. We need to check
                                    // these to see if this is the monster we should select
                                    if (!firstUnderMax && monsterObj.color !== 'purple') {
                                        if (monsterObj.over === 'ach') {
                                            if (!firstOverAch) {
                                                firstOverAch = monsterList[selectTypes[s]][m];
                                                utility.log(3, 'firstOverAch', firstOverAch);
                                            }
                                        } else if (monsterObj.over !== 'max') {
                                            firstUnderMax = monsterList[selectTypes[s]][m];
                                            utility.log(3, 'firstUnderMax', firstUnderMax);
                                        }
                                    }

                                    monstType = this.type(monsterList[selectTypes[s]][m]);
                                    if (monstType && this.info[monstType]) {
                                        if (!this.info[monstType].alpha || (this.info[monstType].alpha && this.characterClass[monsterObj.charClass] && this.characterClass[monsterObj.charClass].indexOf('Heal') >= 0)) {
                                            maxToFortify = (this.parseCondition('f%', monsterConditions) !== false) ? this.parseCondition('f%', monsterConditions) : config.getItem('MaxToFortify', 0);
                                            if (this.info[monstType].fort && !firstFortUnderMax && monsterObj.fortify < maxToFortify) {
                                                if (monsterObj.over === 'ach') {
                                                    if (!firstFortOverAch) {
                                                        firstFortOverAch = monsterList[selectTypes[s]][m];
                                                        utility.log(3, 'firstFortOverAch', firstFortOverAch);
                                                    }
                                                } else if (monsterObj.over !== 'max') {
                                                    firstFortUnderMax = monsterList[selectTypes[s]][m];
                                                    utility.log(3, 'firstFortUnderMax', firstFortUnderMax);
                                                }
                                            }
                                        }

                                        if (this.info[monstType].alpha) {
                                            if (!firstStunUnderMax && monsterObj.stunDo) {
                                                if (monsterObj.over === 'ach') {
                                                    if (!firstStunOverAch) {
                                                        firstStunOverAch = monsterList[selectTypes[s]][m];
                                                        utility.log(3, 'firstStunOverAch', firstStunOverAch);
                                                    }
                                                } else if (monsterObj.over !== 'max') {
                                                    firstStunUnderMax = monsterList[selectTypes[s]][m];
                                                    utility.log(3, 'firstStunUnderMax', firstStunUnderMax);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Now we use the first under max/under achievement that we found. If we didn't find any under
                    // achievement then we use the first over achievement
                    if (selectTypes[s] !== 'raid') {
                        if (!state.setItem('targetFromfortify', firstFortUnderMax)) {
                            state.setItem('targetFromfortify', firstFortOverAch);
                        }

                        utility.log(3, 'fort under max ', firstFortUnderMax);
                        utility.log(3, 'fort over Ach ', firstFortOverAch);
                        utility.log(3, 'fort target ', state.getItem('targetFromfortify', ''));

                        if (!state.setItem('targetFromStun', firstStunUnderMax)) {
                            state.setItem('targetFromStun', firstStunOverAch);
                        }

                        utility.log(3, 'stun under max ', firstStunUnderMax);
                        utility.log(3, 'stun over Ach ', firstStunOverAch);
                        utility.log(3, 'stun target ', state.getItem('targetFromStun', ''));

                        if (state.getItem('targetFromStun', '')) {
                            state.setItem('targetFromfortify', state.getItem('targetFromStun', ''));
                            utility.log(1, 'Stun target replaces fortify ', state.getItem('targetFromfortify', ''));
                        }
                    }

                    monsterName = firstUnderMax;
                    if (!monsterName) {
                        monsterName = firstOverAch;
                    }

                    utility.log(3, 'monster', monsterName);
                    // If we've got a monster for this selection type then we set the GM variables for the name
                    // and stamina requirements
                    if (monsterName) {
                        monsterObj = this.getItem(monsterName);
                        state.setItem('targetFrom' + monsterObj.page, monsterName);
                        if (monsterObj.page === 'battle_monster') {
                            nodeNum = 0;
                            if (!caap.InLevelUpMode() && this.info[monsterObj.type] && this.info[monsterObj.type].staLvl) {
                                for (nodeNum = this.info[monsterObj.type].staLvl.length - 1; nodeNum >= 0; nodeNum -= 1) {
                                    utility.log(9, 'stamina.max:nodeNum:staLvl', caap.stats.stamina.max, nodeNum, this.info[monsterObj.type].staLvl[nodeNum]);
                                    if (caap.stats.stamina.max >= this.info[monsterObj.type].staLvl[nodeNum]) {
                                        break;
                                    }
                                }
                            }

                            utility.log(8, 'MonsterStaminaReq:Info', monsterObj.type, nodeNum, this.info[monsterObj.type]);
                            if (!caap.InLevelUpMode() && this.info[monsterObj.type] && this.info[monsterObj.type].staMax && config.getItem('PowerAttack', false) && config.getItem('PowerAttackMax', false)) {
                                utility.log(7, 'MonsterStaminaReq:PowerAttackMax', this.info[monsterObj.type].staMax[nodeNum]);
                                state.setItem('MonsterStaminaReq', this.info[monsterObj.type].staMax[nodeNum]);
                            } else if (this.info[monsterObj.type] && this.info[monsterObj.type].staUse) {
                                utility.log(7, 'MonsterStaminaReq:staUse', this.info[monsterObj.type].staUse);
                                state.setItem('MonsterStaminaReq', this.info[monsterObj.type].staUse);
                            } else if ((caap.InLevelUpMode() && caap.stats.stamina.num >= 10) || monsterObj.conditions.match(/:pa/i)) {
                                utility.log(7, 'MonsterStaminaReq:pa', 5);
                                state.setItem('MonsterStaminaReq', 5);
                            } else if (monsterObj.conditions.match(/:sa/i)) {
                                utility.log(7, 'MonsterStaminaReq:sa', 1);
                                state.setItem('MonsterStaminaReq', 1);
                            } else if ((caap.InLevelUpMode() && caap.stats.stamina.num >= 10) || config.getItem('PowerAttack', true)) {
                                utility.log(7, 'MonsterStaminaReq:PowerAttack', 5);
                                state.setItem('MonsterStaminaReq', 5);
                            } else {
                                utility.log(7, 'MonsterStaminaReq:default', 1);
                                state.setItem('MonsterStaminaReq', 1);
                            }

                            utility.log(2, 'MonsterStaminaReq:MonsterGeneral', config.getItem('MonsterGeneral', 'Use Current'));
                            if (config.getItem('MonsterGeneral', 'Use Current') === 'Orc King') {
                                utility.log(2, 'MonsterStaminaReq:Orc King', state.getItem('MonsterStaminaReq', 1) * 5);
                                state.setItem('MonsterStaminaReq', state.getItem('MonsterStaminaReq', 1) * 5);
                            }

                            if (config.getItem('MonsterGeneral', 'Use Current') === 'Barbarus') {
                                utility.log(2, 'MonsterStaminaReq:Barbarus', state.getItem('MonsterStaminaReq', 1) * 3);
                                state.setItem('MonsterStaminaReq', state.getItem('MonsterStaminaReq', 1) * 3);
                            }
                        } else {
                            // Switch RaidPowerAttack - RaisStaminaReq is not being used - bug?
                            utility.log(8, 'RaidStaminaReq:Info', monsterObj.type, this.info[monsterObj.type]);
                            if (gm.getItem('RaidPowerAttack', false, hiddenVar) || monsterObj.conditions.match(/:pa/i)) {
                                utility.log(7, 'RaidStaminaReq:pa', 5);
                                state.setItem('RaidStaminaReq', 5);
                            } else if (this.info[monsterObj.type] && this.info[monsterObj.type].staUse) {
                                utility.log(7, 'RaidStaminaReq:staUse', this.info[monsterObj.type].staUse);
                                state.setItem('RaidStaminaReq', this.info[monsterObj.type].staUse);
                            } else {
                                utility.log(7, 'RaidStaminaReq:default', 1);
                                state.setItem('RaidStaminaReq', 1);
                            }
                        }
                    }
                }
            }

            caap.UpdateDashboard(true);
            return true;
        } catch (err) {
            utility.error("ERROR in monster.select: " + err);
            return false;
        }
    },

    ConfirmRightPage: function (monsterName) {
        try {
            // Confirm name and type of monster
            var monsterDiv = null,
                tempDiv    = null,
                tempText   = '';

            monsterDiv = $("div[style*='dragon_title_owner']");
            if (monsterDiv && monsterDiv.length) {
                tempText = $.trim(monsterDiv.children(":eq(2)").text());
            } else {
                monsterDiv = $("div[style*='nm_top']");
                if (monsterDiv && monsterDiv.length) {
                    tempText = $.trim(monsterDiv.children(":eq(0)").children(":eq(0)").text());
                    tempDiv = $("div[style*='nm_bars']");
                    if (tempDiv && tempDiv.length) {
                        tempText += ' ' + $.trim(tempDiv.children(":eq(0)").children(":eq(0)").children(":eq(0)").siblings(":last").children(":eq(0)").text()).replace("'s Life", "");
                    } else {
                        utility.warn("Problem finding nm_bars");
                        return false;
                    }
                } else {
                    utility.warn("Problem finding dragon_title_owner and nm_top");
                    return false;
                }
            }

            if (monsterDiv.find("img[uid='" + caap.stats.FBID + "']").length) {
                utility.log(2, "monster name found");
                tempText = tempText.replace(new RegExp(".+'s "), 'Your ');
            }

            if (monsterName !== tempText) {
                utility.log(1, 'Looking for ' + monsterName + ' but on ' + tempText + '. Going back to select screen');
                return utility.NavigateTo('keep,' + this.getItem(monsterName).page);
            }

            return false;
        } catch (err) {
            utility.error("ERROR in monster.ConfirmRightPage: " + err);
            return false;
        }
    }
};
////////////////////////////////////////////////////////////////////
//                          battle OBJECT
// this is the main object for dealing with battles
/////////////////////////////////////////////////////////////////////

battle = {
    records : [],

    record: function () {
        this.data = {
            userId          : 0,
            nameStr         : '',
            rankStr         : '',
            rankNum         : 0,
            warRankStr      : '',
            warRankNum      : 0,
            levelNum        : 0,
            armyNum         : 0,
            deityNum        : 0,
            deityStr        : '',
            invadewinsNum   : 0,
            invadelossesNum : 0,
            duelwinsNum     : 0,
            duellossesNum   : 0,
            warwinsNum      : 0,
            warlossesNum    : 0,
            defendwinsNum   : 0,
            defendlossesNum : 0,
            statswinsNum    : 0,
            statslossesNum  : 0,
            goldNum         : 0,
            chainCount      : 0,
            invadeLostTime  : new Date(2009, 0, 1).getTime(),
            duelLostTime    : new Date(2009, 0, 1).getTime(),
            warLostTime     : new Date(2009, 0, 1).getTime(),
            deadTime        : new Date(2009, 0, 1).getTime(),
            chainTime       : new Date(2009, 0, 1).getTime(),
            ignoreTime      : new Date(2009, 0, 1).getTime(),
            aliveTime       : new Date(2009, 0, 1).getTime(),
            attackTime      : new Date(2009, 0, 1).getTime(),
            selectTime      : new Date(2009, 0, 1).getTime()
        };
    },

    battleRankTable: {
        0  : 'Acolyte',
        1  : 'Scout',
        2  : 'Soldier',
        3  : 'Elite Soldier',
        4  : 'Squire',
        5  : 'Knight',
        6  : 'First Knight',
        7  : 'Legionnaire',
        8  : 'Centurion',
        9  : 'Champion',
        10 : 'Lieutenant Commander',
        11 : 'Commander',
        12 : 'High Commander',
        13 : 'Lieutenant General',
        14 : 'General',
        15 : 'High General',
        16 : 'Baron',
        17 : 'Earl',
        18 : 'Duke',
        19 : 'Prince',
        20 : 'King',
        21 : 'High King'
    },

    warRankTable: {
        0  : 'No Rank',
        1  : 'Reserve',
        2  : 'Footman',
        3  : 'Corporal',
        4  : 'Lieutenant',
        5  : 'Captain',
        6  : 'First Captain',
        7  : 'Blackguard',
        8  : 'Warguard',
        9  : 'Master Warguard',
        10 : 'Lieutenant Colonel',
        11 : 'Colonel',
        12 : 'First Colonel'
    },

    log: function (level, text) {
        try {
            var snapshot = [];
            if (utility.logLevel >= level) {
                $.merge(snapshot, this.records);
                utility.log(level, text, snapshot);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in battle.log: " + err);
            return false;
        }
    },

    load: function () {
        try {
            this.records = gm.getItem('battle.records', 'default');
            if (this.records === 'default') {
                this.records = [];
                gm.setItem('battle.records', this.records);
            }

            state.setItem("BattleDashUpdate", true);
            this.log(2, "battle.load");
            return true;
        } catch (err) {
            utility.error("ERROR in battle.load: " + err);
            return false;
        }
    },

    save: function () {
        try {
            gm.setItem('battle.records', this.records);
            state.setItem("BattleDashUpdate", true);
            this.log(2, "battle.save");
            return true;
        } catch (err) {
            utility.error("ERROR in battle.save: " + err);
            return false;
        }
    },

    clear: function () {
        try {
            this.records = gm.setItem("battle.records", []);
            state.setItem("BattleDashUpdate", true);
            return true;
        } catch (err) {
            utility.error("ERROR in battle.clear: " + err);
            return false;
        }
    },

    getItem: function (userId) {
        try {
            var it        = 0,
                success   = false,
                newRecord = null;

            if (!utility.isNum(userId) || userId < 1) {
                utility.warn("userId", userId);
                throw "Invalid identifying userId!";
            }

            for (it = 0; it < this.records.length; it += 1) {
                if (this.records[it].userId === userId) {
                    success = true;
                    break;
                }
            }

            if (success) {
                utility.log(2, "Got battle record", userId, this.records[it]);
                return this.records[it];
            } else {
                newRecord = new this.record();
                newRecord.data.userId = userId;
                utility.log(2, "New battle record", userId, newRecord.data);
                return newRecord.data;
            }
        } catch (err) {
            utility.error("ERROR in battle.getItem: " + err, arguments.callee.caller);
            return false;
        }
    },

    setItem: function (record) {
        try {
            if (!record || utility.typeOf(record) !== 'object') {
                throw "Not passed a record";
            }

            if (!utility.isNum(record.userId) || record.userId < 1) {
                utility.warn("userId", record.userId);
                throw "Invalid identifying userId!";
            }

            var it      = 0,
                success = false;

            for (it = 0; it < this.records.length; it += 1) {
                if (this.records[it].userId === record.userId) {
                    success = true;
                    break;
                }
            }

            if (success) {
                this.records[it] = record;
                utility.log(2, "Updated battle record", record, this.records);
            } else {
                this.records.push(record);
                utility.log(2, "Added battle record", record, this.records);
            }

            this.save();
            return true;
        } catch (err) {
            utility.error("ERROR in battle.setItem: " + err, record);
            return false;
        }
    },

    deleteItem: function (userId) {
        try {
            var it        = 0,
                success   = false;

            if (!utility.isNum(userId) || userId < 1) {
                utility.warn("userId", userId);
                throw "Invalid identifying userId!";
            }

            for (it = 0; it < this.records.length; it += 1) {
                if (this.records[it].userId === userId) {
                    success = true;
                    break;
                }
            }

            if (success) {
                this.records.splice(it, 1);
                this.save();
                utility.log(2, "Deleted battle record", userId, this.records);
                return true;
            } else {
                utility.warn("Unable to delete battle record", userId, this.records);
                return false;
            }
        } catch (err) {
            utility.error("ERROR in battle.deleteItem: " + err);
            return false;
        }
    },

    hashCheck: function (userId) {
        try {
            var hash = '',
                hashes = ["f503b318ea6e780c03f39ed9fdc0dd47a688729c"];

            if (!hashes.length || !gm.getItem('AllowProtected', true, hiddenVar)) {
                return false;
            }

            if (!utility.isNum(userId) || userId < 1) {
                utility.warn("userId", userId);
                throw "Invalid identifying userId!";
            }

            hash = utility.SHA1(userId.toString());
            return (hashes.indexOf(hash) >= 0);
        } catch (err) {
            utility.error("ERROR in battle.hashCheck: " + err);
            return false;
        }
    },

    getResult: function () {
        try {
            var resultsDiv    = null,
                tempDiv       = null,
                tempText      = '',
                tempArr       = [],
                battleRecord  = {},
                warWinLoseImg = '',
                result        = {
                    userId     : 0,
                    userName   : '',
                    battleType : '',
                    points     : 0,
                    gold       : 0,
                    win        : false
                };

            if (utility.CheckForImage('battle_victory.gif')) {
                warWinLoseImg = 'war_win_left.jpg';
                result.win = true;
            } else if (utility.CheckForImage('battle_defeat.gif')) {
                warWinLoseImg = 'war_lose_left.jpg';
            } else {
                throw "Unable to determine won or lost!";
            }

            if (utility.CheckForImage("war_button_war_council.gif")) {
                result.battleType = 'War';
                resultsDiv = $("#app46755028429_results_main_wrapper div[class='result']");
                if (resultsDiv && resultsDiv.length) {
                    tempDiv = resultsDiv.find("img[src*='war_rank_small_icon']:first");
                    if (tempDiv && tempDiv.length) {
                        tempText = $.trim(tempDiv.parent().text());
                        if (tempText) {
                            result.points = ((/\d+\s+War Points/i.test(tempText)) ? utility.NumberOnly(tempText.match(/\d+\s+War Points/i)) : 0);
                        } else {
                            utility.warn("Unable to find war points text in", tempDiv.parent());
                        }
                    } else {
                        utility.warn("Unable to find war_rank_small_icon in", resultsDiv);
                    }

                    tempDiv = resultsDiv.find("b[class*='gold']:first");
                    if (tempDiv && tempDiv.length) {
                        tempText = $.trim(tempDiv.text());
                        if (tempText) {
                            result.gold = utility.NumberOnly(tempText);
                        } else {
                            utility.warn("Unable to find gold text in", tempDiv);
                        }
                    } else {
                        utility.warn("Unable to find gold element in", resultsDiv);
                    }

                    tempDiv = resultsDiv.find("input[name='target_id']:first");
                    if (tempDiv && tempDiv.length) {
                        tempText = tempDiv.attr("value");
                        if (tempText) {
                            result.userId = parseInt(tempText, 10);
                        } else {
                            utility.warn("No value in", tempDiv);
                            throw "Unable to get userId!";
                        }
                    } else {
                        utility.warn("Unable to find target_id in", resultsDiv);
                        throw "Unable to get userId!";
                    }

                    tempDiv = $("div[style*='" + warWinLoseImg + "']");
                    if (tempDiv && tempDiv.length) {
                        tempText = $.trim(tempDiv.text());
                        if (tempText) {
                            result.userName = tempText.replace("'s Defense", '');
                        } else {
                            utility.warn("Unable to match user's name in", tempText);
                        }
                    } else {
                        utility.warn("Unable to find " + warWinLoseImg);
                    }
                } else {
                    utility.warn("Unable to find result div");
                    throw "Unable to get userId!";
                }
            } else {
                if (utility.CheckForImage("battle_invade_again.gif")) {
                    result.battleType = 'Invade';
                } else if (utility.CheckForImage("battle_duel_again.gif")) {
                    result.battleType = 'Duel';
                }

                if (result.battleType) {
                    resultsDiv = $("#app46755028429_results_main_wrapper div[class='result']");
                    if (resultsDiv && resultsDiv.length) {
                        tempDiv = resultsDiv.find("img[src*='battle_rank_small_icon']:first");
                        if (tempDiv && tempDiv.length) {
                            tempText = $.trim(tempDiv.parent().text());
                            if (tempText) {
                                result.points = ((/\d+\s+Battle Points/i.test(tempText)) ? utility.NumberOnly(tempText.match(/\d+\s+Battle Points/i)) : 0);
                            } else {
                                utility.warn("Unable to find battle points text in", tempDiv.parent());
                            }
                        } else {
                            utility.warn("Unable to find battle_rank_small_icon in", resultsDiv);
                        }

                        tempDiv = resultsDiv.find("b[class*='gold']:first");
                        if (tempDiv && tempDiv.length) {
                            tempText = $.trim(tempDiv.text());
                            if (tempText) {
                                result.gold = utility.NumberOnly(tempText);
                            } else {
                                utility.warn("Unable to find gold text in", tempDiv);
                            }
                        } else {
                            utility.warn("Unable to find gold element in", resultsDiv);
                        }

                        tempDiv = resultsDiv.find("a[href*='keep.php?casuser=']:first");
                        if (tempDiv && tempDiv.length) {
                            tempText = tempDiv.attr("href");
                            if (tempText) {
                                tempArr = tempText.match(/user=(\d+)/i);
                                if (tempArr && tempArr.length === 2) {
                                    result.userId = parseInt(tempArr[1], 10);
                                } else {
                                    utility.warn("Unable to match user's id in", tempText);
                                    throw "Unable to get userId!";
                                }

                                tempText = $.trim(tempDiv.text());
                                if (tempText) {
                                    result.userName = tempText;
                                } else {
                                    utility.warn("Unable to match user's name in", tempText);
                                }
                            } else {
                                utility.warn("No href text in", tempDiv);
                                throw "Unable to get userId!";
                            }
                        } else {
                            utility.warn("Unable to find keep.php?casuser= in", resultsDiv);
                            throw "Unable to get userId!";
                        }
                    } else {
                        utility.warn("Unable to find result div");
                        throw "Unable to get userId!";
                    }
                } else {
                    utility.warn("Unable to determine battle type");
                    throw "Unable to get userId!";
                }
            }

            battleRecord = this.getItem(result.userId);
            battleRecord.attackTime = new Date().getTime();
            if (result.userName && result.userName !== battleRecord.nameStr) {
                utility.log(1, "Updating battle record user name, from/to", battleRecord.nameStr, result.userName);
                battleRecord.nameStr = result.userName;
            }

            if (result.win) {
                battleRecord.statswinsNum += 1;
            } else {
                battleRecord.statslossesNum += 1;
            }

            switch (result.battleType) {
            case 'Invade' :
                if (result.win) {
                    battleRecord.invadewinsNum += 1;
                } else {
                    battleRecord.invadelossesNum += 1;
                    battleRecord.invadeLostTime = new Date().getTime();
                }

                break;
            case 'Duel' :
                if (result.win) {
                    battleRecord.duelwinsNum += 1;
                } else {
                    battleRecord.duellossesNum += 1;
                    battleRecord.duelLostTime = new Date().getTime();
                }

                break;
            case 'War' :
                if (result.win) {
                    battleRecord.warwinsNum += 1;
                } else {
                    battleRecord.warlossesNum += 1;
                    battleRecord.warLostTime = new Date().getTime();
                }

                break;
            default :
                utility.warn("Battle type unknown!", result.battleType);
            }

            this.setItem(battleRecord);
            return result;
        } catch (err) {
            utility.error("ERROR in battle.getResult: " + err);
            return false;
        }
    },

    deadCheck: function () {
        try {
            var resultsDiv   = null,
                resultsText  = '',
                battleRecord = {},
                dead         = false;

            resultsDiv = $("div[class='results']");
            if (resultsDiv && resultsDiv.length) {
                resultsText = $.trim(resultsDiv.text());
                if (resultsText) {
                    if (resultsText.match(/Your opponent is dead or too weak to battle/)) {
                        utility.log(1, "This opponent is dead or hiding: ", state.getItem("lastBattleID", 0));
                        if (state.getItem("lastBattleID", 0)) {
                            battleRecord = battle.getItem(state.getItem("lastBattleID", 0));
                            battleRecord.deadTime = new Date().getTime();
                            battle.setItem(battleRecord);
                        }

                        dead = true;
                    }
                } else {
                    utility.warn("Unable to find results text in", resultsDiv);
                    throw "Unable to determine if user is dead!";
                }
            } else {
                throw "Unable to find any results!";
            }

            return dead;
        } catch (err) {
            utility.error("ERROR in battle.deadCheck: " + err);
            return undefined;
        }
    }
};

////////////////////////////////////////////////////////////////////
//                          town OBJECT
// this is the main object for dealing with town items
/////////////////////////////////////////////////////////////////////

town = {
    soldiers: [],

    soldiersSortable: [],

    item: [],

    itemSortable: [],

    magic: [],

    magicSortable: [],

    record: function () {
        this.data = {
            name    : '',
            upkeep  : 0,
            hourly  : 0,
            atk     : 0,
            def     : 0,
            owned   : 0,
            cost    : 0,
            api     : 0,
            dpi     : 0,
            mpi     : 0
        };
    },

    types: ['soldiers', 'item', 'magic'],

    log: function (type, level, text) {
        try {
            if (typeof type !== 'string' || type === '' || this.types.indexOf(type) < 0)  {
                utility.warn("Type passed to load: ", type);
                throw "Invalid type value!";
            }

            var snapshot = {};
            if (utility.logLevel >= level) {
                $.extend(snapshot, this[type]);
                utility.log(level, text, type, snapshot);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in town.log: " + err);
            return false;
        }
    },

    load: function (type) {
        try {
            if (typeof type !== 'string' || type === '' || this.types.indexOf(type) < 0)  {
                utility.warn("Type passed to load: ", type);
                throw "Invalid type value!";
            }

            this[type] = gm.getItem(type + '.records', 'default');
            if (this[type] === 'default') {
                this[type] = [];
                gm.setItem(type + '.records', this[type]);
            }

            this[type + 'Sortable'] = [];
            $.merge(this[type + 'Sortable'], this[type]);
            state.setItem(type.ucFirst() + "DashUpdate", true);
            this.log(type, 2, "town.load");
            return true;
        } catch (err) {
            utility.error("ERROR in town.load: " + err);
            return false;
        }
    },

    save: function (type) {
        try {
            if (typeof type !== 'string' || type === '' || this.types.indexOf(type) < 0)  {
                utility.warn("Type passed to load: ", type);
                throw "Invalid type value!";
            }

            gm.setItem(type + '.records', this[type]);
            state.setItem(type.ucFirst() + "DashUpdate", true);
            this.log(type, 2, "town.save");
            return true;
        } catch (err) {
            utility.error("ERROR in town.save: " + err);
            return false;
        }
    },

    GetItems: function (type) {
        try {
            var rowDiv  = null,
                tempDiv = null,
                current = {},
                passed  = true,
                save    = false;

            if (typeof type !== 'string' || type === '' || this.types.indexOf(type) < 0)  {
                utility.warn("Type passed to load: ", type);
                throw "Invalid type value!";
            }

            this[type] = [];
            this[type + 'Sortable'] = [];
            rowDiv = $("td[class*='eq_buy_row']");
            if (rowDiv && rowDiv.length) {
                rowDiv.each(function (index) {
                    current = new town.record();
                    tempDiv = $(this).find("div[class='eq_buy_txt_int'] strong");
                    if (tempDiv && tempDiv.length === 1) {
                        current.data.name = $.trim(tempDiv.text());
                    } else {
                        utility.warn("Unable to get '" + type + "' name!");
                        passed = false;
                    }

                    if (passed) {
                        tempDiv = $(this).find("div[class='eq_buy_txt_int'] span[class='negative']");
                        if (tempDiv && tempDiv.length === 1) {
                            current.data.upkeep = utility.NumberOnly(tempDiv.text());
                        } else {
                            utility.log(2, "No upkeep found for '" + type + "' '" + current.data.name + "'");
                        }

                        tempDiv = $(this).find("div[class='eq_buy_stats_int'] div");
                        if (tempDiv && tempDiv.length === 2) {
                            current.data.atk = utility.NumberOnly(tempDiv.eq(0).text());
                            current.data.def = utility.NumberOnly(tempDiv.eq(1).text());
                            current.data.api = (current.data.atk + (current.data.def * 0.7));
                            current.data.dpi = (current.data.def + (current.data.atk * 0.7));
                            current.data.mpi = ((current.data.api + current.data.dpi) / 2);
                        } else {
                            utility.warn("No atk/def found for '" + type + "' '" + current.data.name + "'");
                        }

                        tempDiv = $(this).find("div[class='eq_buy_costs_int'] strong[class='gold']");
                        if (tempDiv && tempDiv.length === 1) {
                            current.data.cost = utility.NumberOnly(tempDiv.text());
                        } else {
                            utility.log(2, "No cost found for '" + type + "' '" + current.data.name + "'");
                        }

                        tempDiv = $(this).find("div[class='eq_buy_costs_int'] tr:last td:first");
                        if (tempDiv && tempDiv.length === 1) {
                            current.data.owned = utility.NumberOnly(tempDiv.text());
                            current.data.hourly = current.data.owned * current.data.upkeep;
                        } else {
                            utility.warn("No number owned found for '" + type + "' '" + current.data.name + "'");
                        }

                        town[type].push(current.data);
                        save = true;
                    }
                });
            }

            if (save) {
                $.merge(this[type + 'Sortable'], this[type]);
                this.save(type);
            } else {
                utility.log(1, "Nothing to save for '" + type + "'");
            }

            return true;
        } catch (err) {
            utility.error("ERROR in town.GetItems: " + err);
            return false;
        }
    }
};

////////////////////////////////////////////////////////////////////
//                          gifting OBJECT
// this is the main object for dealing with gifting
/////////////////////////////////////////////////////////////////////

gifting = {
    types: ["gifts", "queue", "history"],

    log: function (type, level, text) {
        try {
            if (typeof type !== 'string' || type === '' || this.types.indexOf(type) < 0)  {
                utility.warn("Type passed to load: ", type);
                throw "Invalid type value!";
            }

            var snapshot = {};
            if (utility.logLevel >= level) {
                $.extend(snapshot, this[type].records);
                utility.log(level, text, type, snapshot);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in gifting.log: " + err);
            return false;
        }
    },

    load: function (type) {
        try {
            if (typeof type !== 'string' || type === '' || this.types.indexOf(type) < 0)  {
                utility.warn("Type passed to load: ", type);
                throw "Invalid type value!";
            }

            this[type].records = gm.getItem("gifting." + type, 'default');
            if (this[type].records === 'default') {
                this[type].records = [];
                gm.setItem("gifting." + type, this[type].records);
            }

            this.log(type, 1, "gifting.load " + type);
            state.setItem("Gift" + type.ucFirst() + "DashUpdate", true);
            return true;
        } catch (err) {
            utility.error("ERROR in gifting.load: " + err);
            return false;
        }
    },

    save: function (type) {
        try {
            if (typeof type !== 'string' || type === '' || this.types.indexOf(type) < 0)  {
                utility.warn("Type passed to load: ", type);
                throw "Invalid type value!";
            }

            gm.setItem("gifting." + type, this[type].records);
            this.log(type, 1, "gifting.save " + type);
            state.setItem("Gift" + type.ucFirst() + "DashUpdate", true);
            return true;
        } catch (err) {
            utility.error("ERROR in gifting.save: " + err);
            return false;
        }
    },

    clear: function (type) {
        try {
            if (typeof type !== 'string' || type === '' || this.types.indexOf(type) < 0)  {
                utility.warn("Type passed to clear: ", type);
                throw "Invalid type value!";
            }

            this[type].records = gm.setItem("gifting." + type, []);
            state.setItem("Gift" + type.ucFirst() + "DashUpdate", true);
            return true;
        } catch (err) {
            utility.error("ERROR in gifting.clear: " + err);
            return false;
        }
    },

    init: function () {
        try {
            var result = true;

            if (!gifting.load("gifts")) {
                result = false;
            }

            if (!gifting.load("queue")) {
                result = false;
            }

            if (!gifting.load("history")) {
                result = false;
            }

            this.queue.fix();
            return result;
        } catch (err) {
            utility.error("ERROR in gifting.init: " + err);
            return undefined;
        }
    },

    accept: function () {
        try {
            var giftDiv   = null,
                tempText  = '',
                tempNum   = 0,
                current   = {};

            giftDiv = $("div[class='messages']:first img:first");
            if (giftDiv && giftDiv.length) {
                tempNum = parseInt(giftDiv.attr("uid"), 10);
                if (tempNum > 0) {
                    current = new this.queue.record().data;
                    current.userId = tempNum;
                    tempText = $.trim(giftDiv.attr("title"));
                    if (tempText) {
                        current.name = tempText;
                    } else {
                        utility.warn("No name found in", giftDiv);
                        current.name = "Unknown";
                    }
                } else {
                    utility.warn("No uid found in", giftDiv);
                }
            } else {
                utility.warn("No gift messages found!");
            }

            return !utility.isEmpty(gm.setItem("GiftEntry", current));
        } catch (err) {
            utility.error("ERROR in gifting.accept: " + err);
            return undefined;
        }
    },

    getCurrent: function () {
        try {
            return gm.getItem("GiftEntry", {});
        } catch (err) {
            utility.error("ERROR in gifting.getCurrent: " + err);
            return undefined;
        }
    },

    setCurrent: function (record) {
        try {
            if (!record || utility.typeOf(record) !== 'object') {
                throw "Not passed a record";
            }

            if (!utility.isNum(record.userId) || record.userId < 1) {
                utility.warn("userId", record.userId);
                throw "Invalid identifying userId!";
            }

            return gm.setItem("GiftEntry", record);
        } catch (err) {
            utility.error("ERROR in gifting.setCurrent: " + err);
            return undefined;
        }
    },

    clearCurrent: function () {
        try {
            return gm.setItem("GiftEntry", {});
        } catch (err) {
            utility.error("ERROR in gifting.clearCurrent: " + err);
            return undefined;
        }
    },

    collecting: function () {
        try {
            if (!utility.isEmpty(this.getCurrent()) && this.getCurrent().checked) {
                this.collected(true);
            }

            if (utility.isEmpty(this.getCurrent()) && state.getItem('HaveGift', false)) {
                if (utility.NavigateTo('army', 'invite_on.gif')) {
                    return true;
                }

                if (!this.accept()) {
                    state.setItem('HaveGift', false);
                    return false;
                }

                schedule.setItem('ClickedFacebookURL', 30);
                state.setItem('clickUrl', "http://apps.facebook.com/reqs.php#confirm_46755028429_0");
                utility.VisitUrl("http://apps.facebook.com/reqs.php#confirm_46755028429_0");
                return true;
            }

            return null;
        } catch (err) {
            utility.error("ERROR in gifting.collecting: " + err);
            return false;
        }
    },

    collect: function () {
        try {
            var giftEntry = false,
                appDiv    = null,
                inputDiv  = null,
                userArr   = [],
                userId    = 0,
                giftDiv   = null,
                giftText  = '',
                giftArr   = [],
                giftType  = '';

            if (window.location.href.indexOf('apps.facebook.com/reqs.php') < 0) {
                return false;
            }

            giftEntry = this.getCurrent();
            if (utility.isEmpty(giftEntry)) {
                return false;
            }

            if (!giftEntry.checked) {
                utility.log(1, 'On FB page with gift ready to go');
                appDiv = $("div[id*='app_46755028429']");
                if (appDiv && appDiv.length) {
                    appDiv.each(function () {
                        inputDiv = $(this).find("input[name*='/castle/tracker.php']");
                        if (inputDiv && inputDiv.length) {
                            userArr = inputDiv.attr("name").match(/uid%3D(\d+)/i);
                            if (!userArr || userArr.length !== 2) {
                                return true;
                            }

                            userId = utility.NumberOnly(userArr[1]);
                            if (giftEntry.userId !== userId) {
                                return true;
                            }

                            giftDiv = $(this).find("div[class='pts requestBody']");
                            giftText = '';
                            giftArr = [];
                            giftType = '';
                            if (giftDiv && giftDiv.length) {
                                giftText = $.trim(giftDiv.text());
                                giftArr = giftDiv.text().match(new RegExp("(.*) has sent you a (.*) in Castle Age!.*"));
                                if (giftArr && giftArr.length === 3) {
                                    giftType = giftArr[2];
                                }
                            } else {
                                utility.warn("No requestBody in ", $(this));
                            }

                            if (giftType === '' || gifting.gifts.list().indexOf(giftType) < 0) {
                                utility.log(1, 'Unknown gift type', giftType, gifting.gifts.list());
                                giftType = 'Unknown Gift';
                            }

                            giftEntry.gift = giftType;
                            giftEntry.found = true;
                            giftEntry.checked = true;
                            gifting.setCurrent(giftEntry);
                            schedule.setItem('ClickedFacebookURL', 30);
                            utility.Click(inputDiv.get(0));
                            return false;
                        } else {
                            utility.warn("No input found in ", $(this));
                        }

                        return true;
                    });
                } else {
                    utility.warn("No gifts found for CA");
                }

                giftEntry.checked = true;
                this.setCurrent(giftEntry);
            }

            if (!schedule.check('ClickedFacebookURL')) {
                return false;
            }

            if (giftEntry.found) {
                utility.log(1, 'Gift click timed out');
            } else {
                giftEntry.gift = 'Unknown Gift';
                this.setCurrent(giftEntry);
                utility.log(1, 'Unable to find gift', giftEntry);
            }

            state.setItem('clickUrl', "http://apps.facebook.com/castle_age/army.php?act=acpt&uid=" + giftEntry.userId);
            utility.VisitUrl("http://apps.facebook.com/castle_age/army.php?act=acpt&uid=" + giftEntry.userId);
            return true;
        } catch (err) {
            utility.error("ERROR in gifting.collect: " + err);
            return false;
        }
    },

    collected: function (force) {
        try {
            var giftEntry = this.getCurrent();
            if (!utility.isEmpty(giftEntry)) {
                if (force || utility.CheckForImage("gift_yes.gif")) {
                    this.queue.setItem(giftEntry);
                    this.history.received(giftEntry);
                }

                this.clearCurrent();
            }

            schedule.setItem("NoGiftDelay", 0);
            return true;
        } catch (err) {
            utility.error("ERROR in gifting.collected: " + err);
            return false;
        }
    },

    popCheck: function (type) {
        try {
            var popDiv     = null,
                tempDiv    = null,
                tempText   = '',
                tryAgain   = true;

            popDiv = $("#pop_content");
            if (popDiv && popDiv.length) {
                tempDiv = popDiv.find("input[name='sendit']");
                if (tempDiv && tempDiv.length) {
                    utility.log(1, 'Sending gifts to Facebook');
                    utility.Click(tempDiv.get(0));
                    return true;
                }

                tempDiv = popDiv.find("input[name='skip_ci_btn']");
                if (tempDiv && tempDiv.length) {
                    utility.log(1, 'Denying Email Nag For Gift Send');
                    utility.Click(tempDiv.get(0));
                    return true;
                }

                tempDiv = popDiv.find("input[name='ok']");
                if (tempDiv && tempDiv.length) {
                    tempText = tempDiv.parent().parent().prev().text();
                    if (tempText) {
                        if (/you have run out of requests/.test(tempText)) {
                            utility.log(1, 'Out of requests: ', tempText);
                            schedule.setItem("MaxGiftsExceeded", 10800, 300);
                            tryAgain = false;
                        } else {
                            utility.warn('Popup message: ', tempText);
                        }
                    } else {
                        utility.warn('Popup message but no text found', tempDiv);
                    }

                    utility.Click(tempDiv.get(0));
                    return tryAgain;
                }

                tempText = popDiv.text();
                if (tempText) {
                    if (/Loading/.test(tempText)) {
                        utility.log(1, "Popup is loading ...");
                    } else {
                        utility.warn('Unknown popup!', popDiv.text());
                    }
                } else {
                    utility.warn('Popup message but no text found', popDiv);
                }
            }

            if (this.waitingForDomLoad) {
                return true;
            }

            return null;
        } catch (err) {
            utility.error("ERROR in gifting.popCheck: " + err);
            return undefined;
        }
    },

    gifts: {
        options: ['Same Gift As Received', 'Random Gift'],

        records: [],

        record: function () {
            this.data = {
                name  : '',
                image : ''
            };
        },

        getItem: function (name) {
            try {
                var it    = 0,
                    gift  = false;

                if (typeof name !== 'string' || name === '') {
                    utility.warn("name", name);
                    throw "Invalid identifying name!";
                }

                for (it = 0; it < this.records.length; it += 1) {
                    if (this.records[it].name === name) {
                        break;
                    }
                }

                if (it < this.records.length) {
                    gift = this.records[it];
                }

                return gift;
            } catch (err) {
                utility.error("ERROR in gifting.gifts.getItem: " + err);
                return undefined;
            }
        },

        getImg: function (name) {
            try {
                var it    = 0,
                    image = '';

                if (typeof name !== 'string' || name === '') {
                    utility.warn("name", name);
                    throw "Invalid identifying name!";
                }


                if (name !== 'Unknown Gift') {
                    for (it = 0; it < this.records.length; it += 1) {
                        if (this.records[it].name === name) {
                            image = this.records[it].image;
                            break;
                        }
                    }

                    if (it >= this.records.length) {
                        utility.warn("Gift not in list! ", name);
                    }
                }

                return image;
            } catch (err) {
                utility.error("ERROR in gifting.gifts.getImg: " + err);
                return undefined;
            }
        },

        populate: function () {
            try {
                var giftDiv  = null,
                    newGift  = {},
                    tempDiv  = null,
                    tempText = '',
                    tempArr  = [],
                    update   = false;

                giftDiv = $("#app46755028429_giftContainer div[id*='app46755028429_gift']");
                if (giftDiv && giftDiv.length) {
                    gifting.clear("gifts");
                    giftDiv.each(function () {
                        newGift = new gifting.gifts.record().data;
                        tempDiv = $(this).children(":first");
                        if (tempDiv && tempDiv.length) {
                            tempText = $.trim(tempDiv.text()).replace("!", "");
                            if (tempText) {
                                newGift.name = tempText;
                            } else {
                                utility.warn("Unable to get gift name! No text in ", tempDiv);
                                return true;
                            }
                        } else {
                            utility.warn("Unable to get gift name! No child!");
                            return true;
                        }

                        tempDiv = $(this).find("img[class*='imgButton']");
                        if (tempDiv && tempDiv.length) {
                            tempText = utility.getHTMLPredicate(tempDiv.attr("src"));
                            if (tempText) {
                                newGift.image = tempText;
                            } else {
                                utility.warn("Unable to get gift image! No src in ", tempDiv);
                                return true;
                            }
                        } else {
                            utility.warn("Unable to get gift image! No img!");
                            return true;
                        }

                        if (gifting.gifts.getItem(newGift.name)) {
                            newGift.name += " #2";
                            utility.log(1, "Gift exists, no auto return for ", newGift.name);
                        }

                        gifting.gifts.records.push(newGift);
                        update = true;
                        return true;
                    });
                }

                if (update) {
                    tempArr = this.list();
                    tempText = config.getItem("GiftChoice", this.options[0]);
                    if (tempArr.indexOf(tempText) < 0)  {
                        utility.log(1, "Gift choice invalid, changing from/to ", tempText, this.options[0]);
                        tempText = config.setItem("GiftChoice", this.options[0]);
                    }

                    caap.ChangeDropDownList("GiftChoice", tempArr, tempText);
                    gifting.save("gifts");
                }

                return update;
            } catch (err) {
                utility.error("ERROR in gifting.gifts.populate: " + err);
                return undefined;
            }
        },

        list: function () {
            try {
                var it       = 0,
                    giftList = [];

                for (it = 0; it < this.records.length; it += 1) {
                    giftList.push(this.records[it].name);
                }

                return $.merge($.merge([], this.options), giftList);
            } catch (err) {
                utility.error("ERROR in gifting.gifts.list: " + err);
                return undefined;
            }
        },

        length: function () {
            try {
                return this.records.length;
            } catch (err) {
                utility.error("ERROR in gifting.gifts.length: " + err);
                return undefined;
            }
        },

        random: function () {
            try {
                return this.records[Math.floor(Math.random() * (this.records.length))].name;
            } catch (err) {
                utility.error("ERROR in gifting.gifts.random: " + err);
                return undefined;
            }
        }
    },

    queue: {
        records: [],

        record: function () {
            this.data = {
                userId  : 0,
                name    : '',
                gift    : '',
                checked : false,
                found   : false,
                chosen  : false,
                sent    : false,
                last    : new Date(2009, 0, 1).getTime()
            };
        },

        fix: function () {
            try {
                var it = 0,
                    save = false;

                for (it = this.records.length - 1; it >= 0; it -= 1) {
                    if (!utility.isNum(this.records[it].userId) || this.records[it].userId < 1 || this.records[it].sent === true) {
                        utility.warn("gifting.queue.fix - delete", this.records[it]);
                        this.records.splice(it, 1);
                        save = true;
                    }
                }

                if (save) {
                    gifting.save("queue");
                }

                return this.save;
            } catch (err) {
                utility.error("ERROR in gifting.queue.fix: " + err);
                return undefined;
            }
        },

        setItem: function (record) {
            try {
                if (!record || utility.typeOf(record) !== 'object') {
                    throw "Not passed a record";
                }

                if (!utility.isNum(record.userId) || record.userId < 1) {
                    utility.warn("userId", record.userId);
                    throw "Invalid identifying userId!";
                }

                var it      = 0,
                    found   = false,
                    updated = false;

                if (config.getItem("UniqueGiftQueue", true)) {
                    for (it = 0; it < this.records.length; it += 1) {
                        if (this.records[it].userId === record.userId) {
                            if (this.records[it].name !== record.name) {
                                this.records[it].name = record.name;
                                updated = true;
                                utility.log(1, "Updated users name", record, this.records);
                            }

                            found = true;
                            break;
                        }
                    }
                }

                if (!found) {
                    this.records.push(record);
                    updated = true;
                    utility.log(1, "Added gift to queue", record, this.records);
                }

                if (updated) {
                    gifting.save("queue");
                }

                return true;
            } catch (err) {
                utility.error("ERROR in gifting.queue.setItem: " + err, record);
                return false;
            }
        },

        deleteIndex: function (index) {
            try {
                if (!utility.isNum(index) || index < 0 || index >= this.records.length) {
                    throw "Invalid index! (" + index + ")";
                }

                this.records.splice(index, 1);
                gifting.save("queue");
                return true;
            } catch (err) {
                utility.error("ERROR in gifting.queue.deleteIndex: " + err, index);
                return false;
            }
        },

        length: function () {
            try {
                return this.records.length;
            } catch (err) {
                utility.error("ERROR in gifting.queue.length: " + err);
                return undefined;
            }
        },

        randomImg: '',

        chooseGift: function () {
            try {
                var it = 0,
                    gift = '',
                    choice = '';

                choice = config.getItem("GiftChoice", gifting.gifts.options[0]);
                for (it = 0; it < this.records.length; it += 1) {
                    if (!schedule.since(this.records[it].last || 0, 43200)) {
                        continue;
                    }

                    if (this.records[it].sent) {
                        continue;
                    }

                    switch (choice) {
                    case gifting.gifts.options[0]:
                        gift = this.records[it].gift;
                        break;
                    case gifting.gifts.options[1]:
                        if (this.randomImg) {
                            gift = this.randomImg;
                        } else {
                            gift = gifting.gifts.random();
                            this.randomImg = gift;
                        }

                        break;
                    default:
                        gift = choice;
                    }

                    break;
                }

                if (!gift) {
                    schedule.setItem("NoGiftDelay", 1800, 300);
                }

                return gift;
            } catch (err) {
                utility.error("ERROR in gifting.queue.chooseGift: " + err);
                return undefined;
            }
        },

        chooseFriend: function (howmany) {
            try {
                var it       = 0,
                    tempGift = '',
                    tempText = '',
                    unselDiv = null,
                    selDiv   = null,
                    first    = true,
                    count    = 0,
                    same     = true;

                if (!utility.isNum(howmany) || howmany < 1) {
                    throw "Invalid howmany! (" + howmany + ")";
                }

                if (config.getItem("GiftChoice", gifting.gifts.options[0]) !== gifting.gifts.options[0]) {
                    same = false;
                }

                for (it = 0; it < this.records.length; it += 1) {
                    this.records[it].chosen = false;

                    if (count >= howmany) {
                        continue;
                    }

                    if (!schedule.since(this.records[it].last || 0, 3600)) {
                        continue;
                    }

                    if (this.records[it].sent) {
                        continue;
                    }

                    if (first) {
                        tempGift = this.records[it].gift;
                        first = false;
                    }

                    if (this.records[it].gift === tempGift || !same) {
                        unselDiv = $("div[class='unselected_list'] input[value='" + this.records[it].userId + "']");
                        if (unselDiv && unselDiv.length) {
                            if (!/none/.test(unselDiv.parent().attr("style"))) {
                                utility.Click(unselDiv.get(0));
                                selDiv = $("div[class='selected_list'] input[value='" + this.records[it].userId + "']").parent();
                                if (selDiv && selDiv.length) {
                                    if (!/none/.test(selDiv.attr("style"))) {
                                        utility.log(1, "User Chosen: ", this.records[it].userId, this.records[it]);
                                        this.records[it].chosen = true;
                                        count += 1;
                                        continue;
                                    } else {
                                        tempText = "Selected id is none:";
                                    }
                                } else {
                                    tempText = "Selected id not found:";
                                }
                            } else {
                                tempText = "Unselected id is none:";
                            }
                        } else {
                            tempText = "Id not found, perhaps gift pending:";
                        }

                        utility.log(1, tempText, this.records[it].userId, this.records[it]);
                        this.records[it].last = new Date().getTime();
                    }
                }

                caap.waitingForDomLoad = false;
                gifting.save("queue");
                return count;
            } catch (err) {
                utility.error("ERROR in gifting.queue.chooseFriend: " + err);
                return undefined;
            }
        },

        sent: function () {
            try {
                var it         = 0,
                    resultDiv  = null,
                    resultText = '',
                    sentok     = false;

                if (window.location.href.indexOf('act=create') >= 0) {
                    resultDiv = $('#app46755028429_results_main_wrapper');
                    if (resultDiv && resultDiv.length) {
                        resultText = resultDiv.text();
                        if (resultText) {
                            if (/You have sent \d+ gift/.test(resultText)) {
                                for (it = this.records.length - 1; it >= 0; it -= 1) {
                                    if (this.records[it].chosen) {
                                        this.records[it].sent = true;
                                        gifting.history.sent(this.records[it]);
                                        this.records.splice(it, 1);
                                    }
                                }

                                utility.log(1, 'Confirmed gifts sent out.');
                                sentok = true;
                            } else if (/You have exceed the max gift limit for the day/.test(resultText)) {
                                utility.log(1, 'Exceeded daily gift limit.');
                                schedule.setItem("MaxGiftsExceeded", 10800, 300);
                            } else {
                                utility.log(1, 'Result message', resultText);
                            }
                        } else {
                            utility.log(1, 'No result message');
                        }
                    }
                } else {
                    utility.log(1, 'Not a gift create request');
                }

                return sentok;
            } catch (err) {
                utility.error("ERROR in gifting.queue.sent: " + err);
                return undefined;
            }
        }
    },

    history: {
        records: [],

        record: function () {
            this.data = {
                userId   : 0,
                name     : '',
                sent     : 0,
                received : 0
            };
        },

        received: function (record) {
            try {
                if (!record || utility.typeOf(record) !== 'object') {
                    throw "Not passed a record";
                }

                if (!utility.isNum(record.userId) || record.userId < 1) {
                    utility.warn("userId", record.userId);
                    throw "Invalid identifying userId!";
                }

                var it        = 0,
                    success   = false,
                    newRecord = {};

                for (it = 0; it < this.records.length; it += 1) {
                    if (this.records[it].userId === record.userId) {
                        if (this.records[it].name !== record.name) {
                            this.records[it].name = record.name;
                        }

                        this.records[it].received += 1;
                        success = true;
                        break;
                    }
                }

                if (success) {
                    utility.log(1, "Updated gifting.history record", this.records[it], this.records);
                } else {
                    newRecord = new this.record().data;
                    newRecord.userId = record.userId;
                    newRecord.name = record.name;
                    newRecord.received = 1;
                    this.records.push(newRecord);
                    utility.log(1, "Added gifting.history record", newRecord, this.records);
                }

                gifting.save("history");
                return true;
            } catch (err) {
                utility.error("ERROR in gifting.history.received: " + err, record);
                return false;
            }
        },

        sent: function (record) {
            try {
                if (!record || utility.typeOf(record) !== 'object') {
                    throw "Not passed a record";
                }

                if (!utility.isNum(record.userId) || record.userId < 1) {
                    utility.warn("userId", record.userId);
                    throw "Invalid identifying userId!";
                }

                var it        = 0,
                    success   = false,
                    newRecord = {};

                for (it = 0; it < this.records.length; it += 1) {
                    if (this.records[it].userId === record.userId) {
                        if (this.records[it].name !== record.name) {
                            this.records[it].name = record.name;
                        }

                        this.records[it].sent += 1;
                        success = true;
                        break;
                    }
                }

                if (success) {
                    utility.log(1, "Updated gifting.history record", this.records[it], this.records);
                } else {
                    newRecord = new this.record().data;
                    newRecord.userId = record.userId;
                    newRecord.name = record.name;
                    newRecord.sent = 1;
                    this.records.push(newRecord);
                    utility.log(1, "Added gifting.history record", newRecord, this.records);
                }

                gifting.save("history");
                return true;
            } catch (err) {
                utility.error("ERROR in gifting.history.sent: " + err, record);
                return false;
            }
        },

        length: function () {
            try {
                return this.records.length;
            } catch (err) {
                utility.error("ERROR in gifting.history.length: " + err);
                return undefined;
            }
        }
    }
};
////////////////////////////////////////////////////////////////////
//                          caap OBJECT
// this is the main object for the game, containing all methods, globals, etc.
/////////////////////////////////////////////////////////////////////

caap = {
    lastReload        : new Date(),
    waitingForDomLoad : false,
    pageLoadOK        : false,
    caapDivObject     : null,
    caapTopObject     : null,

    init: function () {
        try {
            state.setItem(this.friendListType.gifta.name + 'Requested', false);
            state.setItem(this.friendListType.giftc.name + 'Requested', false);
            state.setItem(this.friendListType.facebook.name + 'Requested', false);
            // Get rid of those ads now! :P
            if (config.getItem('HideAds', false)) {
                $('.UIStandardFrame_SidebarAds').css('display', 'none');
            }

            // Can create a blank space above the game to host the dashboard if wanted.
            // Dashboard currently uses '185px'
            var shiftDown = gm.getItem('ShiftDown', '', hiddenVar);
            if (shiftDown) {
                $(this.controlXY.selector).css('padding-top', shiftDown);
            }

            general.load();
            monster.load();
            battle.load();
            this.LoadDemi();
            this.LoadRecon();
            town.load('soldiers');
            town.load('item');
            town.load('magic');
            this.AddControl();
            this.AddColorWheels();
            this.AddDashboard();
            this.AddListeners();
            this.AddDBListener();
            this.CheckResults();
            this.AutoStatCheck();
            return true;
        } catch (err) {
            utility.error("ERROR in init: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          DISPLAY FUNCTIONS
    // these functions set up the control applet and allow it to be changed
    /////////////////////////////////////////////////////////////////////

    defaultDropDownOption: "<option disabled='disabled' value='not selected'>Choose one</option>",

    MakeDropDown: function (idName, dropDownList, instructions, formatParms, defaultValue) {
        try {
            var selectedItem = config.getItem(idName, 'defaultValue'),
                count        = 0,
                itemcount    = 0,
                htmlCode     = '',
                item         = 0;

            if (selectedItem === 'defaultValue') {
                if (defaultValue) {
                    selectedItem = config.setItem(idName, defaultValue);
                } else {
                    selectedItem = config.setItem(idName, dropDownList[0]);
                }
            }

            for (itemcount in dropDownList) {
                if (dropDownList.hasOwnProperty(itemcount)) {
                    if (selectedItem === dropDownList[itemcount]) {
                        break;
                    }

                    count += 1;
                }
            }

            htmlCode = "<select id='caap_" + idName + "' " + ((instructions[count]) ? " title='" + instructions[count] + "' " : '') + formatParms + ">";
            htmlCode += this.defaultDropDownOption;
            for (item in dropDownList) {
                if (dropDownList.hasOwnProperty(item)) {
                    if (instructions) {
                        htmlCode += "<option value='" + dropDownList[item] +
                            "'" + ((selectedItem === dropDownList[item]) ? " selected='selected'" : '') +
                            ((instructions[item]) ? " title='" + instructions[item] + "'" : '') + ">" +
                            dropDownList[item] + "</option>";
                    } else {
                        htmlCode += "<option value='" + dropDownList[item] +
                            "'" + ((selectedItem === dropDownList[item]) ? " selected='selected'" : '') + ">" +
                            dropDownList[item] + "</option>";
                    }
                }
            }

            htmlCode += '</select>';
            return htmlCode;
        } catch (err) {
            utility.error("ERROR in MakeDropDown: " + err);
            return '';
        }
    },

    /*-------------------------------------------------------------------------------------\
    DBDropDown is used to make our drop down boxes for dash board controls.  These require
    slightly different HTML from the side controls.
    \-------------------------------------------------------------------------------------*/
    DBDropDown: function (idName, dropDownList, instructions, formatParms) {
        try {
            var selectedItem = config.getItem(idName, 'defaultValue'),
                htmlCode     = '',
                item         = 0;
            if (selectedItem === 'defaultValue') {
                selectedItem = config.setItem(idName, dropDownList[0]);
            }

            htmlCode = " <select id='caap_" + idName + "' " + formatParms + "'><option>" + selectedItem;
            for (item in dropDownList) {
                if (dropDownList.hasOwnProperty(item)) {
                    if (selectedItem !== dropDownList[item]) {
                        if (instructions) {
                            htmlCode += "<option value='" + dropDownList[item] + "' " + ((instructions[item]) ? " title='" + instructions[item] + "'" : '') + ">"  + dropDownList[item];
                        } else {
                            htmlCode += "<option value='" + dropDownList[item] + "'>" + dropDownList[item];
                        }
                    }
                }
            }

            htmlCode += '</select>';
            return htmlCode;
        } catch (err) {
            utility.error("ERROR in DBDropDown: " + err);
            return '';
        }
    },

    MakeCheckBox: function (idName, defaultValue, varClass, instructions, tableTF) {
        try {
            var checkItem = config.getItem(idName, 'defaultValue'),
                htmlCode  = '';

            if (checkItem === 'defaultValue') {
                config.setItem(idName, defaultValue);
            }

            htmlCode = "<input type='checkbox' id='caap_" + idName + "' title=" + '"' + instructions + '"' + ((varClass) ? " class='" + varClass + "'" : '') + (config.getItem(idName) ? 'checked' : '') + ' />';
            if (varClass) {
                if (tableTF) {
                    htmlCode += "</td></tr></table>";
                } else {
                    htmlCode += '<br />';
                }

                htmlCode += this.AddCollapsingDiv(idName, varClass);
            }

            return htmlCode;
        } catch (err) {
            utility.error("ERROR in MakeCheckBox: " + err);
            return '';
        }
    },

    MakeNumberForm: function (idName, instructions, initDefault, formatParms, subtype) {
        try {
            if (!subtype) {
                subtype = 'number';
            }

            if (subtype === 'number' && isNaN(initDefault) && initDefault !== '') {
                utility.warn("MakeNumberForm - default value is not a number!", idName, initDefault);
            }

            if (!initDefault) {
                initDefault = '';
            }

            if (config.getItem(idName, 'defaultValue') === 'defaultValue') {
                config.setItem(idName, initDefault);
            }

            if (!formatParms) {
                formatParms = "size='4'";
            }

            return (" <input type='text' data-subtype='" + subtype + "' id='caap_" + idName + "' " + formatParms + " title=" + '"' + instructions + '" ' + "value='" + config.getItem(idName) + "' />");
        } catch (err) {
            utility.error("ERROR in MakeNumberForm: " + err);
            return '';
        }
    },

    MakeCheckTR: function (text, idName, defaultValue, varClass, instructions, tableTF) {
        try {
            var htmlCode = "<tr><td style='width: 90%'>" + text +
                "</td><td style='width: 10%; text-align: right'>" +
                this.MakeCheckBox(idName, defaultValue, varClass, instructions, tableTF);

            if (!tableTF) {
                htmlCode += "</td></tr>";
            }

            return htmlCode;
        } catch (err) {
            utility.error("ERROR in MakeCheckTR: " + err);
            return '';
        }
    },

    AddCollapsingDiv: function (parentId, subId) {
        try {
            return ("<div id='caap_" + subId + "' style='display: " + (config.getItem(parentId, false) ? 'block' : 'none') + "'>");
        } catch (err) {
            utility.error("ERROR in AddCollapsingDiv: " + err);
            return '';
        }
    },

    ToggleControl: function (controlId, staticText) {
        try {
            var currentDisplay = state.getItem('Control_' + controlId, "none"),
                displayChar    = "-",
                toggleCode     = '';

            if (currentDisplay === "none") {
                displayChar = "+";
            }

            toggleCode = '<b><a id="caap_Switch_' + controlId +
                '" href="javascript:;" style="text-decoration: none;"> ' +
                displayChar + ' ' + staticText + '</a></b><br />' +
                "<div id='caap_" + controlId + "' style='display: " + currentDisplay + "'>";

            return toggleCode;
        } catch (err) {
            utility.error("ERROR in ToggleControl: " + err);
            return '';
        }
    },

    MakeTextBox: function (idName, instructions, initDefault, formatParms) {
        try {
            if (!initDefault) {
                initDefault = '';
            }

            if (config.getItem(idName, 'defaultValue') === 'defaultValue') {
                config.setItem(idName, initDefault);
            }

            if (formatParms === '') {
                if (utility.is_chrome) {
                    formatParms = " rows='3' cols='25'";
                } else {
                    formatParms = " rows='3' cols='21'";
                }
            }

            return ("<textarea title=" + '"' + instructions + '"' + " type='text' id='caap_" + idName + "' " + formatParms + ">" + config.getItem(idName) + "</textarea>");
        } catch (err) {
            utility.error("ERROR in MakeTextBox: " + err);
            return '';
        }
    },

    SaveBoxText: function (idName) {
        try {
            var boxText = $("#caap_" + idName).val();
            if (typeof boxText !== 'string') {
                throw "Value of the textarea id='caap_" + idName + "' is not a string: " + boxText;
            }

            config.setItem(idName, boxText);
            return true;
        } catch (err) {
            utility.error("ERROR in SaveBoxText: " + err);
            return false;
        }
    },

    SetDivContent: function (idName, mess) {
        try {
            if (config.getItem('SetTitle', false) && config.getItem('SetTitleAction', false) && idName === "activity_mess") {
                var DocumentTitle = mess.replace("Activity: ", '') + " - ";

                if (config.getItem('SetTitleName', false)) {
                    DocumentTitle += this.stats.PlayerName + " - ";
                }

                document.title = DocumentTitle + global.documentTitle;
            }

            $('#caap_' + idName).html(mess);
        } catch (err) {
            utility.error("ERROR in SetDivContent: " + err);
        }
    },

    questWhenList: [
        'Energy Available',
        'At Max Energy',
        'At X Energy',
        'Not Fortifying',
        'Never'
    ],

    questWhenInst: [
        'Energy Available - will quest whenever you have enough energy.',
        'At Max Energy - will quest when energy is at max and will burn down all energy when able to level up.',
        'At X Energy - allows you to set maximum and minimum energy values to start and stop questing. Will burn down all energy when able to level up.',
        'Not Fortifying - will quest only when your fortify settings are matched.',
        'Never - disables questing.'
    ],

    questAreaList: [
        'Quest',
        'Demi Quests',
        'Atlantis'
    ],

    landQuestList: [
        'Land of Fire',
        'Land of Earth',
        'Land of Mist',
        'Land of Water',
        'Demon Realm',
        'Undead Realm',
        'Underworld',
        'Kingdom of Heaven',
        'Ivory City',
        'Earth II'
    ],

    demiQuestList: [
        'Ambrosia',
        'Malekus',
        'Corvintheus',
        'Aurora',
        'Azeron'
    ],

    atlantisQuestList: [
        'Atlantis'
    ],

    questForList: [
        'Advancement',
        'Max Influence',
        'Max Gold',
        'Max Experience',
        'Manual'
    ],

    SelectDropOption: function (idName, value) {
        try {
            $("#caap_" + idName + " option").removeAttr('selected');
            $("#caap_" + idName + " option[value='" + value + "']").attr('selected', 'selected');
            return true;
        } catch (err) {
            utility.error("ERROR in SelectDropOption: " + err);
            return false;
        }
    },

    autoQuest: function () {
        this.data = {
            name: '',
            energy: 0,
            general: 'none',
            expRatio: 0
        };
    },

    newAutoQuest: function () {
        return (new this.autoQuest()).data;
    },

    updateAutoQuest: function (id, value) {
        try {
            var temp = state.getItem('AutoQuest', this.newAutoQuest());

            if (typeof id !== 'string' || id === '') {
                throw "No valid id supplied!";
            }

            if (value === undefined || value === null) {
                throw "No value supplied!";
            }

            temp[id] = value;
            state.setItem('AutoQuest', temp);
            return true;
        } catch (err) {
            utility.error("ERROR in updateAutoQuest: " + err);
            return false;
        }
    },

    ShowAutoQuest: function () {
        try {
            //$("#stopAutoQuest").text("Stop auto quest: " + gm.getObjVal('AutoQuest', 'name') + " (energy: " + gm.getObjVal('AutoQuest', 'energy') + ")");
            $("#stopAutoQuest").text("Stop auto quest: " + state.getItem('AutoQuest', this.newAutoQuest()).name + " (energy: " + state.getItem('AutoQuest', this.newAutoQuest()).energy + ")");
            $("#stopAutoQuest").css('display', 'block');
            return true;
        } catch (err) {
            utility.error("ERROR in ShowAutoQuest: " + err);
            return false;
        }
    },

    ClearAutoQuest: function () {
        try {
            $("#stopAutoQuest").text("");
            $("#stopAutoQuest").css('display', 'none');
            return true;
        } catch (err) {
            utility.error("ERROR in ClearAutoQuest: " + err);
            return false;
        }
    },

    ManualAutoQuest: function (AutoQuest) {
        try {
            if (!AutoQuest) {
                AutoQuest = this.newAutoQuest();
            }

            //gm.setItem('AutoQuest', AutoQuest);
            config.setItem('AutoQuest', AutoQuest);
            config.setItem('WhyQuest', 'Manual');
            this.SelectDropOption('WhyQuest', 'Manual');
            this.ClearAutoQuest();
            return true;
        } catch (err) {
            utility.error("ERROR in ManualAutoQuest: " + err);
            return false;
        }
    },

    ChangeDropDownList: function (idName, dropList, option) {
        try {
            $("#caap_" + idName + " option").remove();
            $("#caap_" + idName).append(this.defaultDropDownOption);
            for (var item in dropList) {
                if (dropList.hasOwnProperty(item)) {
                    if (item === '0' && !option) {
                        config.setItem(idName, dropList[item]);
                        utility.log(1, "Saved: " + idName + "  Value: " + dropList[item]);
                    }

                    $("#caap_" + idName).append("<option value='" + dropList[item] + "'>" + dropList[item] + "</option>");
                }
            }

            if (option) {
                $("#caap_" + idName + " option[value='" + option + "']").attr('selected', 'selected');
            } else {
                $("#caap_" + idName + " option:eq(1)").attr('selected', 'selected');
            }

            return true;
        } catch (err) {
            utility.error("ERROR in ChangeDropDownList: " + err);
            return false;
        }
    },

    divList: [
        'banner',
        'activity_mess',
        'idle_mess',
        'quest_mess',
        'battle_mess',
        'monster_mess',
        'fortify_mess',
        'heal_mess',
        'demipoint_mess',
        'demibless_mess',
        'level_mess',
        'exp_mess',
        'debug1_mess',
        'debug2_mess',
        'control'
    ],

    controlXY: {
        selector : '.UIStandardFrame_Content',
        x        : 0,
        y        : 0
    },

    GetControlXY: function (reset) {
        try {
            var newTop  = 0,
                newLeft = 0;

            if (reset) {
                newTop = $(this.controlXY.selector).offset().top;
            } else {
                newTop = this.controlXY.y;
            }

            if (this.controlXY.x === '' || reset) {
                newLeft = $(this.controlXY.selector).offset().left + $(this.controlXY.selector).width() + 10;
            } else {
                newLeft = $(this.controlXY.selector).offset().left + this.controlXY.x;
            }

            return {x: newLeft, y: newTop};
        } catch (err) {
            utility.error("ERROR in GetControlXY: " + err);
            return {x: 0, y: 0};
        }
    },

    SaveControlXY: function () {
        try {
            var refOffset = $(this.controlXY.selector).offset();
            state.setItem('caap_div_menuTop', caap.caapDivObject.offset().top);
            state.setItem('caap_div_menuLeft', caap.caapDivObject.offset().left - refOffset.left);
            state.setItem('caap_top_zIndex', '1');
            state.setItem('caap_div_zIndex', '2');
        } catch (err) {
            utility.error("ERROR in SaveControlXY: " + err);
        }
    },

    dashboardXY: {
        selector : '#app46755028429_app_body_container',
        x        : 0,
        y        : 0
    },

    GetDashboardXY: function (reset) {
        try {
            var newTop  = 0,
                newLeft = 0;

            if (reset) {
                newTop = $(this.dashboardXY.selector).offset().top - 10;
            } else {
                newTop = this.dashboardXY.y;
            }

            if (this.dashboardXY.x === '' || reset) {
                newLeft = $(this.dashboardXY.selector).offset().left;
            } else {
                newLeft = $(this.dashboardXY.selector).offset().left + this.dashboardXY.x;
            }

            return {x: newLeft, y: newTop};
        } catch (err) {
            utility.error("ERROR in GetDashboardXY: " + err);
            return {x: 0, y: 0};
        }
    },

    SaveDashboardXY: function () {
        try {
            var refOffset = $(this.dashboardXY.selector).offset();
            state.setItem('caap_top_menuTop', this.caapTopObject.offset().top);
            state.setItem('caap_top_menuLeft', this.caapTopObject.offset().left - refOffset.left);
            state.setItem('caap_div_zIndex', '1');
            state.setItem('caap_top_zIndex', '2');
        } catch (err) {
            utility.error("ERROR in SaveDashboardXY: " + err);
        }
    },

    AddControl: function () {
        try {
            var caapDiv = "<div id='caap_div'>",
                divID = 0,
                styleXY = {
                    x: 0,
                    y: 0
                },
                htmlCode = '',
                banner = '';

            for (divID in this.divList) {
                if (this.divList.hasOwnProperty(divID)) {
                    caapDiv += "<div id='caap_" + this.divList[divID] + "'></div>";
                }
            }

            caapDiv += "</div>";
            this.controlXY.x = state.getItem('caap_div_menuLeft', '');
            this.controlXY.y = state.getItem('caap_div_menuTop', $(this.controlXY.selector).offset().top);
            styleXY = this.GetControlXY();
            $(caapDiv).css({
                width                   : '180px',
                background              : config.getItem('StyleBackgroundLight', '#E0C691'),
                opacity                 : config.getItem('StyleOpacityLight', 1),
                color                   : '#000',
                padding                 : "4px",
                border                  : "2px solid #444",
                top                     : styleXY.y + 'px',
                left                    : styleXY.x + 'px',
                zIndex                  : state.getItem('caap_div_zIndex', '2'),
                position                : 'absolute',
                '-moz-border-radius'    : '5px',
                '-webkit-border-radius' : '5px'
            }).appendTo(document.body);

            this.caapDivObject = $("#caap_div");

            banner += "<div id='caap_BannerHide' style='display: " + (config.getItem('BannerDisplay', true) ? 'block' : 'none') + "'>";
            banner += "<img src='data:image/png;base64," + image64.header + "' alt='Castle Age Auto Player' /><br /><hr /></div>";
            this.SetDivContent('banner', banner);

            htmlCode += this.AddPauseMenu();
            htmlCode += this.AddDisableMenu();
            htmlCode += this.AddCashHealthMenu();
            htmlCode += this.AddQuestMenu();
            htmlCode += this.AddBattleMenu();
            htmlCode += this.AddMonsterMenu();
            htmlCode += this.AddReconMenu();
            htmlCode += this.AddGeneralsMenu();
            htmlCode += this.AddSkillPointsMenu();
            htmlCode += this.AddOtherOptionsMenu();
            htmlCode += this.AddFooterMenu();
            this.SetDivContent('control', htmlCode);

            this.CheckLastAction(state.getItem('LastAction', 'none'));
            $("#caap_resetElite").button();
            $("#caap_StartedColourSelect").button();
            $("#caap_StopedColourSelect").button();
            $("#caap_FillArmy").button();
            $("#caap_ResetMenuLocation").button();
            return true;
        } catch (err) {
            utility.error("ERROR in AddControl: " + err);
            return false;
        }
    },

    AddPauseMenu: function () {
        try {
            return ("<div id='caapPaused' style='display: " + state.getItem('caapPause', 'block') + "'><b>Paused on mouse click.</b><br /><a href='javascript:;' id='caapRestart' >Click here to restart</a></div><hr />");
        } catch (err) {
            utility.error("ERROR in AddPauseMenu: " + err);
            return ("<div id='caapPaused' style='display: block'><b>Paused on mouse click.</b><br /><a href='javascript:;' id='caapRestart' >Click here to restart</a></div><hr />");
        }
    },

    AddDisableMenu: function () {
        try {
            var autoRunInstructions = "Disable auto running of CAAP. Stays persistent even on page reload and the autoplayer will not autoplay.",
                htmlCode = '';

            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR("Disable Autoplayer", 'Disabled', false, '', autoRunInstructions) + '</table><hr />';
            return htmlCode;
        } catch (err) {
            utility.error("ERROR in AddDisableMenu: " + err);
            return '';
        }
    },

    AddCashHealthMenu: function () {
        try {
            var bankInstructions0 = "Minimum cash to keep in the bank. Press tab to save",
                bankInstructions1 = "Minimum cash to have on hand, press tab to save",
                bankInstructions2 = "Maximum cash to have on hand, bank anything above this, press tab to save (leave blank to disable).",
                healthInstructions = "Minimum health to have before healing, press tab to save (leave blank to disable).",
                healthStamInstructions = "Minimum Stamina to have before healing, press tab to save (leave blank to disable).",
                bankImmedInstructions = "Bank as soon as possible. May interrupt player and monster battles.",
                autobuyInstructions = "Automatically buy lands in groups of 10 based on best Return On Investment value.",
                autosellInstructions = "Automatically sell off any excess lands above your level allowance.",
                htmlCode = '';

            htmlCode += this.ToggleControl('CashandHealth', 'CASH and HEALTH');
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR("Bank Immediately", 'BankImmed', false, '', bankImmedInstructions);
            htmlCode += this.MakeCheckTR("Auto Buy Lands", 'autoBuyLand', false, '', autobuyInstructions);
            htmlCode += this.MakeCheckTR("Auto Sell Excess Lands", 'SellLands', false, '', autosellInstructions) + '</table>';
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Keep In Bank</td><td style='text-align: right'>$" + this.MakeNumberForm('minInStore', bankInstructions0, 100000, "size='12' style='font-size: 10px; text-align: right'") + "</td></tr></table>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Bank Above</td><td style='text-align: right'>$" + this.MakeNumberForm('MaxInCash', bankInstructions2, '', "size='7' style='font-size: 10px; text-align: right'") + "</td></tr>";
            htmlCode += "<tr><td style='padding-left: 10px'>But Keep On Hand</td><td style='text-align: right'>$" +
                this.MakeNumberForm('MinInCash', bankInstructions1, '', "size='7' style='font-size: 10px; text-align: right'") + "</td></tr></table>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Heal If Health Below</td><td style='text-align: right'>" + this.MakeNumberForm('MinToHeal', healthInstructions, '', "size='2' style='font-size: 10px; text-align: right'") + "</td></tr>";
            htmlCode += "<tr><td style='padding-left: 10px'>But Not If Stamina Below</td><td style='text-align: right'>" +
                this.MakeNumberForm('MinStamToHeal', healthStamInstructions, '', "size='2' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
            htmlCode += "<hr/></div>";
            return htmlCode;
        } catch (err) {
            utility.error("ERROR in AddCashHealthMenu: " + err);
            return '';
        }
    },

    AddQuestMenu: function () {
        try {
            var forceSubGen = "Always do a quest with the Subquest General you selected under the Generals section. NOTE: This will keep the script from automatically switching to the required general for experience of primary quests.",
                XQuestInstructions = "Start questing when energy is at or above this value.",
                XMinQuestInstructions = "Stop quest when energy is at or below this value.",
                //autoQuestName = gm.getObjVal('AutoQuest', 'name'),
                autoQuestName = state.getItem('AutoQuest', this.newAutoQuest()).name,
                htmlCode = '';

            htmlCode += this.ToggleControl('Quests', 'QUEST');
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td width=80>Quest When</td><td style='text-align: right; width: 60%'>" + this.MakeDropDown('WhenQuest', this.questWhenList, this.questWhenInst, "style='font-size: 10px; width: 100%'", 'Never') + '</td></tr></table>';
            htmlCode += "<div id='caap_WhenQuestHide' style='display: " + (config.getItem('WhenQuest', 'Never') !== 'Never' ? 'block' : 'none') + "'>";
            htmlCode += "<div id='caap_WhenQuestXEnergy' style='display: " + (config.getItem('WhenQuest', 'Never') !== 'At X Energy' ? 'none' : 'block') + "'>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Start At Or Above Energy</td><td style='text-align: right'>" + this.MakeNumberForm('XQuestEnergy', XQuestInstructions, 1, "size='3' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 10px'>Stop At Or Below Energy</td><td style='text-align: right'>" +
                this.MakeNumberForm('XMinQuestEnergy', XMinQuestInstructions, 0, "size='3' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
            htmlCode += "</div>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Quest Area</td><td style='text-align: right; width: 60%'>" + this.MakeDropDown('QuestArea', this.questAreaList, '', "style='font-size: 10px; width: 100%'") + '</td></tr>';
            switch (config.getItem('QuestArea', this.questAreaList[0])) {
            case 'Quest' :
                htmlCode += "<tr id='trQuestSubArea' style='display: table-row'><td>Sub Area</td><td style='text-align: right; width: 60%'>" +
                    this.MakeDropDown('QuestSubArea', this.landQuestList, '', "style='font-size: 10px; width: 100%'") + '</td></tr>';
                break;
            case 'Demi Quests' :
                htmlCode += "<tr id='trQuestSubArea' style='display: table-row'><td>Sub Area</td><td style='text-align: right; width: 60%'>" +
                    this.MakeDropDown('QuestSubArea', this.demiQuestList, '', "style='font-size: 10px; width: 100%'") + '</td></tr>';
                break;
            default :
                htmlCode += "<tr id='trQuestSubArea' style='display: table-row'><td>Sub Area</td><td style='text-align: right; width: 60%'>" +
                    this.MakeDropDown('QuestSubArea', this.atlantisQuestList, '', "style='font-size: 10px; width: 100%'") + '</td></tr>';
                break;
            }

            htmlCode += "<tr><td>Quest For</td><td style='text-align: right; width: 60%'>" + this.MakeDropDown('WhyQuest', this.questForList, '', "style='font-size: 10px; width: 100%'") + '</td></tr></table>';
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR("Switch Quest Area", 'switchQuestArea', true, '', 'Allows switching quest area after Advancement or Max Influence');
            htmlCode += this.MakeCheckTR("Use Only Subquest General", 'ForceSubGeneral', false, '', forceSubGen);
            htmlCode += this.MakeCheckTR("Quest For Orbs", 'GetOrbs', false, '', 'Perform the Boss quest in the selected land for orbs you do not have.') + "</table>";
            htmlCode += "</div>";
            if (autoQuestName) {
                //htmlCode += "<a id='stopAutoQuest' style='display: block' href='javascript:;'>Stop auto quest: " + autoQuestName + " (energy: " + gm.getObjVal('AutoQuest', 'energy') + ")" + "</a>";
                htmlCode += "<a id='stopAutoQuest' style='display: block' href='javascript:;'>Stop auto quest: " + autoQuestName + " (energy: " + state.getItem('AutoQuest', this.newAutoQuest()).energy + ")" + "</a>";
            } else {
                htmlCode += "<a id='stopAutoQuest' style='display: none' href='javascript:;'></a>";
            }

            htmlCode += "<hr/></div>";
            return htmlCode;
        } catch (err) {
            utility.error("ERROR in AddQuestMenu: " + err);
            return '';
        }
    },

    AddBattleMenu: function () {
        try {
            var XBattleInstructions = "Start battling if stamina is above this points",
                XMinBattleInstructions = "Don't battle if stamina is below this points",
                userIdInstructions = "User IDs(not user name).  Click with the " +
                    "right mouse button on the link to the users profile & copy link." +
                    "  Then paste it here and remove everything but the last numbers." +
                    " (ie. 123456789)",
                chainBPInstructions = "Number of battle points won to initiate a " +
                    "chain attack. Specify 0 to always chain attack.",
                chainGoldInstructions = "Amount of gold won to initiate a chain " +
                    "attack. Specify 0 to always chain attack.",
                FMRankInstructions = "The lowest relative rank below yours that " +
                    "you are willing to spend your stamina on. Leave blank to attack " +
                    "any rank.",
                FMARBaseInstructions = "This value sets the base for your army " +
                    "ratio calculation. It is basically a multiplier for the army " +
                    "size of a player at your equal level. A value of 1 means you " +
                    "will battle an opponent the same level as you with an army the " +
                    "same size as you or less. Default .5",
                plusonekillsInstructions = "Force +1 kill scenario if 80% or more" +
                    " of targets are withn freshmeat settings. Note: Since Castle Age" +
                    " choses the target, selecting this option could result in a " +
                    "greater chance of loss.",
                raidOrderInstructions = "List of search words that decide which " +
                    "raids to participate in first.  Use words in player name or in " +
                    "raid name. To specify max damage follow keyword with :max token " +
                    "and specifiy max damage values. Use 'k' and 'm' suffixes for " +
                    "thousand and million.",
                ignorebattlelossInstructions = "Ignore battle losses and attack " +
                    "regardless.  This will also delete all battle loss records.",
                battleList = [
                    'Stamina Available',
                    'At Max Stamina',
                    'At X Stamina',
                    'No Monster',
                    'Stay Hidden',
                    'Demi Points Only',
                    'Never'
                ],
                battleInst = [
                    'Stamina Available will battle whenever you have enough stamina',
                    'At Max Stamina will battle when stamina is at max and will burn down all stamina when able to level up',
                    'At X Stamina you can set maximum and minimum stamina to battle',
                    'No Monster will battle only when there are no active monster battles or if Get Demi Points First has been selected.',
                    'Stay Hidden uses stamina to try to keep you under 10 health so you cannot be attacked, while also attempting to maximize your stamina use for Monster attacks. YOU MUST SET MONSTER TO "STAY HIDDEN" TO USE THIS FEATURE.',
                    'Demi Points Only will battle only when Daily Demi Points are required, can use in conjunction with Get Demi Points First.',
                    'Never - disables player battles'
                ],
                typeList = [
                    'Invade',
                    'Duel',
                    'War'
                ],
                typeInst = [
                    'Battle using Invade button',
                    'Battle using Duel button - no guarentee you will win though',
                    'War using Duel button - no guarentee you will win though'
                ],
                targetList = [
                    'Freshmeat',
                    'Userid List',
                    'Raid'
                ],
                targetInst = [
                    'Use settings to select a target from the Battle Page',
                    'Select target from the supplied list of userids',
                    'Raid Battles'
                ],
                dosiegeInstructions = "(EXPERIMENTAL) Turns on or off automatic siege assist for all raids only.",
                collectRewardInstructions = "(EXPERIMENTAL) Automatically collect raid rewards.",
                htmlCode = '';

            htmlCode += this.ToggleControl('Battling', 'BATTLE');
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Battle When</td><td style='text-align: right; width: 65%'>" + this.MakeDropDown('WhenBattle', battleList, battleInst, "style='font-size: 10px; width: 100%'", 'Never') + '</td></tr></table>';
            htmlCode += "<div id='caap_WhenBattleStayHidden1' style='display: " + (config.getItem('WhenBattle', 'Never') === 'Stay Hidden' && config.getItem('WhenMonster', 'Never') !== 'Stay Hidden' ? 'block' : 'none') + "'>";
            htmlCode += "<font color='red'><b>Warning: Monster Not Set To 'Stay Hidden'</b></font>";
            htmlCode += "</div>";
            htmlCode += "<div id='caap_WhenBattleXStamina' style='display: " + (config.getItem('WhenBattle', 'Never') !== 'At X Stamina' ? 'none' : 'block') + "'>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Start Battles When Stamina</td><td style='text-align: right'>" + this.MakeNumberForm('XBattleStamina', XBattleInstructions, 1, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 10px'>Keep This Stamina</td><td style='text-align: right'>" +
                this.MakeNumberForm('XMinBattleStamina', XMinBattleInstructions, 0, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
            htmlCode += "</div>";
            htmlCode += "<div id='caap_WhenBattleHide' style='display: " + (config.getItem('WhenBattle', 'Never') !== 'Never' ? 'block' : 'none') + "'>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Battle Type</td><td style='text-align: right; width: 40%'>" + this.MakeDropDown('BattleType', typeList, typeInst, "style='font-size: 10px; width: 100%'") + '</td></tr></table>';
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR("Siege Weapon Assist Raids", 'raidDoSiege', true, '', dosiegeInstructions);
            htmlCode += this.MakeCheckTR("Collect Raid Rewards", 'raidCollectReward', false, '', collectRewardInstructions);
            htmlCode += this.MakeCheckTR("Clear Complete Raids", 'clearCompleteRaids', false, '', '');
            htmlCode += this.MakeCheckTR("Ignore Battle Losses", 'IgnoreBattleLoss', false, '', ignorebattlelossInstructions);
            htmlCode += "<tr><td>Chain:Battle Points Won</td><td style='text-align: right'>" + this.MakeNumberForm('ChainBP', chainBPInstructions, '', "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td>Chain:Gold Won</td><td style='text-align: right'>" + this.MakeNumberForm('ChainGold', chainGoldInstructions, '', "size='5' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Target Type</td><td style='text-align: right; width: 50%'>" + this.MakeDropDown('TargetType', targetList, targetInst, "style='font-size: 10px; width: 100%'") + '</td></tr></table>';
            htmlCode += "<div id='caap_FreshmeatSub' style='display: " + (config.getItem('TargetType', 'Never') !== 'Userid List' ? 'block' : 'none') + "'>";
            htmlCode += "Attack targets that are:";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td style='padding-left: 10px'>Not Lower Than Rank Minus</td><td style='text-align: right'>" +
                this.MakeNumberForm('FreshMeatMinRank', FMRankInstructions, '', "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 10px'>Not Higher Than X*Army</td><td style='text-align: right'>" +
                this.MakeNumberForm('FreshMeatARBase', FMARBaseInstructions, 0.5, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
            htmlCode += "</div>";
            htmlCode += "<div id='caap_RaidSub' style='display: " + (config.getItem('TargetType', 'Invade') === 'Raid' ? 'block' : 'none') + "'>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR("Attempt +1 Kills", 'PlusOneKills', false, '', plusonekillsInstructions) + '</table>';
            htmlCode += "Join Raids in this order <a href='http://senses.ws/caap/index.php?topic=1502.0' target='_blank'><font color='red'>?</font></a><br />";
            htmlCode += this.MakeTextBox('orderraid', raidOrderInstructions, '', '');
            htmlCode += "</div>";
            htmlCode += "<div align=right id='caap_UserIdsSub' style='display: " + (config.getItem('TargetType', 'Invade') === 'Userid List' ? 'block' : 'none') + "'>";
            htmlCode += this.MakeTextBox('BattleTargets', userIdInstructions, '', '');
            htmlCode += "</div>";
            htmlCode += "</div>";
            htmlCode += "<hr/></div>";
            return htmlCode;
        } catch (err) {
            utility.error("ERROR in AddBattleMenu: " + err);
            return '';
        }
    },

    AddMonsterMenu: function () {
        try {
            var XMonsterInstructions = "Start attacking if stamina is above this points",
                XMinMonsterInstructions = "Don't attack if stamina is below this points",
                attackOrderInstructions = "List of search words that decide which monster to attack first. " +
                    "Use words in player name or in monster name. To specify max damage follow keyword with " +
                    ":max token and specifiy max damage values. Use 'k' and 'm' suffixes for thousand and million. " +
                    "To override achievement use the ach: token and specify damage values.",
                fortifyInstructions = "Fortify if ship health is below this % (leave blank to disable)",
                questFortifyInstructions = "Do Quests if ship health is above this % and quest mode is set to Not Fortify (leave blank to disable)",
                stopAttackInstructions = "Don't attack if ship health is below this % (leave blank to disable)",
                monsterachieveInstructions = "Check if monsters have reached achievement damage level first. Switch when achievement met.",
                demiPointsFirstInstructions = "Don't attack monsters until you've gotten all your demi points from battling. Set 'Battle When' to 'No Monster'",
                powerattackInstructions = "Use power attacks. Only do normal attacks if power attack not possible",
                powerattackMaxInstructions = "Use maximum power attacks globally on Skaar, Genesis, Ragnarok, and Bahamut types. Only do normal power attacks if maximum power attack not possible",
                powerfortifyMaxInstructions = "Use maximum power fortify globally on Skaar, Genesis, Ragnarok, and Bahamut types. Only do normal power attacks if maximum power attack not possible",
                dosiegeInstructions = "Turns on or off automatic siege assist for all monsters only.",
                useTacticsInstructions = "Use the Tactics attack method, on monsters that support it, instead of the normal attack. You must be level 50 or above.",
                useTacticsThresholdInstructions = "If monster health falls below this percentage then use the regular attack buttons instead of tactics.",
                collectRewardInstructions = "Automatically collect monster rewards.",
                mbattleList = [
                    'Stamina Available',
                    'At Max Stamina',
                    'At X Stamina',
                    'Stay Hidden',
                    'Never'
                ],
                mbattleInst = [
                    'Stamina Available will attack whenever you have enough stamina',
                    'At Max Stamina will attack when stamina is at max and will burn down all stamina when able to level up',
                    'At X Stamina you can set maximum and minimum stamina to battle',
                    'Stay Hidden uses stamina to try to keep you under 10 health so you cannot be attacked, while also attempting to maximize your stamina use for Monster attacks. YOU MUST SET BATTLE WHEN TO "STAY HIDDEN" TO USE THIS FEATURE.',
                    'Never - disables attacking monsters'
                ],
                monsterDelayInstructions = "Max random delay (in seconds) to battle monsters",
                demiPoint = [
                    'Ambrosia',
                    'Malekus',
                    'Corvintheus',
                    'Aurora',
                    'Azeron'
                ],
                demiPtList = [
                    '<img src="http://image2.castleagegame.com/graphics/symbol_tiny_1.jpg" height="15" width="14"/>',
                    '<img src="http://image2.castleagegame.com/graphics/symbol_tiny_2.jpg" height="15" width="14"/>',
                    '<img src="http://image2.castleagegame.com/graphics/symbol_tiny_3.jpg" height="15" width="14"/>',
                    '<img src="http://image2.castleagegame.com/graphics/symbol_tiny_4.jpg" height="15" width="14"/>',
                    '<img src="http://image2.castleagegame.com/graphics/symbol_tiny_5.jpg" height="15" width="14"/>'
                ],
                demiPtItem = 0,
                htmlCode = '';

            htmlCode += this.ToggleControl('Monster', 'MONSTER');
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td style='width: 35%'>Attack When</td><td style='text-align: right'>" + this.MakeDropDown('WhenMonster', mbattleList, mbattleInst, "style='font-size: 10px; width: 100%;'", 'Never') + '</td></tr></table>';
            htmlCode += "<div id='caap_WhenMonsterXStamina' style='display: " + (config.getItem('WhenMonster', 'Never') !== 'At X Stamina' ? 'none' : 'block') + "'>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Battle When Stamina</td><td style='text-align: right'>" + this.MakeNumberForm('XMonsterStamina', XMonsterInstructions, 1, "size='3' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 10px'>Keep This Stamina</td><td style='text-align: right'>" +
                this.MakeNumberForm('XMinMonsterStamina', XMinMonsterInstructions, 0, "size='3' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
            htmlCode += "</div>";
            htmlCode += "<div id='caap_WhenMonsterHide' style='display: " + (config.getItem('WhenMonster', 'Never') !== 'Never' ? 'block' : 'none') + "'>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Monster delay secs</td><td style='text-align: right'>" + this.MakeNumberForm('seedTime', monsterDelayInstructions, 300, "size='3' style='font-size: 10px; text-align: right'") + "</td></tr>";
            htmlCode += this.MakeCheckTR("Use Tactics", 'UseTactics', false, 'UseTactics_Adv', useTacticsInstructions, true);
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>&nbsp;&nbsp;&nbsp;Health threshold</td><td style='text-align: right'>" +
                this.MakeNumberForm('TacticsThreshold', useTacticsThresholdInstructions, 75, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
            htmlCode += "</div>";

            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR("Power Attack Only", 'PowerAttack', true, 'PowerAttack_Adv', powerattackInstructions, true);
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR("&nbsp;&nbsp;&nbsp;Power Attack Max", 'PowerAttackMax', false, '', powerattackMaxInstructions) + "</table>";
            htmlCode += "</div>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR("Power Fortify Max", 'PowerFortifyMax', false, '', powerfortifyMaxInstructions);
            htmlCode += this.MakeCheckTR("Siege Weapon Assist Monsters", 'monsterDoSiege', true, '', dosiegeInstructions);
            htmlCode += this.MakeCheckTR("Collect Monster Rewards", 'monsterCollectReward', false, '', collectRewardInstructions);
            htmlCode += this.MakeCheckTR("Clear Complete Monsters", 'clearCompleteMonsters', false, '', '');
            htmlCode += this.MakeCheckTR("Achievement Mode", 'AchievementMode', true, '', monsterachieveInstructions);
            htmlCode += this.MakeCheckTR("Get Demi Points First", 'DemiPointsFirst', false, 'DemiList', demiPointsFirstInstructions, true);
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            for (demiPtItem in demiPtList) {
                if (demiPtList.hasOwnProperty(demiPtItem)) {
                    htmlCode += demiPtList[demiPtItem] + this.MakeCheckBox('DemiPoint' + demiPtItem, true, '', demiPoint[demiPtItem]);
                }
            }

            htmlCode += "</table>";
            htmlCode += "</div>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Fortify If Percentage Under</td><td style='text-align: right'>" +
                this.MakeNumberForm('MaxToFortify', fortifyInstructions, 50, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 10px'>Quest If Percentage Over</td><td style='text-align: right'>" +
                this.MakeNumberForm('MaxHealthtoQuest', questFortifyInstructions, 60, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td>No Attack If Percentage Under</td><td style='text-align: right'>" + this.MakeNumberForm('MinFortToAttack', stopAttackInstructions, 10, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
            htmlCode += "Attack Monsters in this order <a href='http://senses.ws/caap/index.php?topic=1502.0' target='_blank'><font color='red'>?</font></a><br />";
            htmlCode += this.MakeTextBox('orderbattle_monster', attackOrderInstructions, '', '');
            htmlCode += "</div>";
            htmlCode += "<hr/></div>";
            return htmlCode;
        } catch (err) {
            utility.error("ERROR in AddMonsterMenu: " + err);
            return '';
        }
    },

    AddReconMenu: function () {
        try {
            // Recon Controls
            var PReconInstructions = "Enable player battle reconnaissance to run " +
                    "as an idle background task. Battle targets will be collected and" +
                    " can be displayed using the 'Target List' selection on the " +
                    "dashboard.",
                PRRankInstructions = "Provide the number of ranks below you which" +
                    " recon will use to filter targets. This value will be subtracted" +
                    " from your rank to establish the minimum rank that recon will " +
                    "consider as a viable target. Default 3.",
                PRLevelInstructions = "Provide the number of levels above you " +
                    "which recon will use to filter targets. This value will be added" +
                    " to your level to establish the maximum level that recon will " +
                    "consider as a viable target. Default 10.",
                PRARBaseInstructions = "This value sets the base for your army " +
                    "ratio calculation. It is basically a multiplier for the army " +
                    "size of a player at your equal level. For example, a value of " +
                    ".5 means you will battle an opponent the same level as you with " +
                    "an army half the size of your army or less. Default 1.",
                htmlCode = '';

            htmlCode += this.ToggleControl('Recon', 'RECON');
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR("Enable Player Recon", 'DoPlayerRecon', false, 'PlayerReconControl', PReconInstructions, true);
            htmlCode += 'Find battle targets that are:';
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td style='padding-left: 10px'>Not Lower Than Rank Minus</td><td style='text-align: right'>" +
                this.MakeNumberForm('ReconPlayerRank', PRRankInstructions, 3, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 10px'>Not Higher Than Level Plus</td><td style='text-align: right'>" +
                this.MakeNumberForm('ReconPlayerLevel', PRLevelInstructions, 10, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 10px'>Not Higher Than X*Army</td><td style='text-align: right'>" +
                this.MakeNumberForm('ReconPlayerARBase', PRARBaseInstructions, 1, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
            htmlCode += "</div>";
            htmlCode += "<hr/></div>";
            return htmlCode;
        } catch (err) {
            utility.error("ERROR in AddReconMenu: " + err);
            return '';
        }
    },

    AddGeneralsMenu: function () {
        try {
            // Add General Comboboxes
            var reverseGenInstructions = "This will make the script level Generals under level 4 from Top-down instead of Bottom-up",
                ignoreGeneralImage = "This will prevent the script " +
                    "from changing your selected General to 'Use Current' if the script " +
                    "is unable to find the General's image when changing activities. " +
                    "Instead it will use the current General for the activity and try " +
                    "to select the correct General again next time.",
                LevelUpGenExpInstructions = "Specify the number of experience " +
                    "points below the next level up to begin using the level up general.",
                LevelUpGenInstructions1 = "Use the Level Up General for Idle mode.",
                LevelUpGenInstructions2 = "Use the Level Up General for Monster mode.",
                LevelUpGenInstructions3 = "Use the Level Up General for Fortify mode.",
                LevelUpGenInstructions4 = "Use the Level Up General for Battle mode.",
                LevelUpGenInstructions5 = "Use the Level Up General for Duel mode.",
                LevelUpGenInstructions6 = "Use the Level Up General for War mode.",
                LevelUpGenInstructions7 = "Use the Level Up General for doing sub-quests.",
                LevelUpGenInstructions8 = "Use the Level Up General for doing primary quests " +
                    "(Warning: May cause you not to gain influence if wrong general is equipped.)",
                LevelUpGenInstructions9 = "Ignore Banking until level up energy and stamina gains have been used.",
                LevelUpGenInstructions10 = "Ignore Income until level up energy and stamina gains have been used.",
                dropDownItem = 0,
                htmlCode = '';

            htmlCode += this.ToggleControl('Generals', 'GENERALS');
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR("Do not reset General", 'ignoreGeneralImage', true, '', ignoreGeneralImage) + "</table>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            for (dropDownItem in general.StandardList) {
                if (general.StandardList.hasOwnProperty(dropDownItem)) {
                    htmlCode += '<tr><td>' + general.StandardList[dropDownItem] + "</td><td style='text-align: right'>" +
                        this.MakeDropDown(general.StandardList[dropDownItem] + 'General', general.List, '', "style='font-size: 10px; min-width: 110px; max-width: 110px; width: 110px;'") + '</td></tr>';
                }
            }

            htmlCode += "<tr><td>Buy</td><td style='text-align: right'>" + this.MakeDropDown('BuyGeneral', general.BuyList, '', "style='font-size: 10px; min-width: 110px; max-width: 110px; width: 110px;'") + '</td></tr>';
            htmlCode += "<tr><td>Collect</td><td style='text-align: right'>" + this.MakeDropDown('CollectGeneral', general.CollectList, '', "style='font-size: 10px; min-width: 110px; max-width: 110px; width: 110px;'") + '</td></tr>';
            htmlCode += "<tr><td>Income</td><td style='text-align: right'>" + this.MakeDropDown('IncomeGeneral', general.IncomeList, '', "style='font-size: 10px; min-width: 110px; max-width: 110px; width: 110px;'") + '</td></tr>';
            htmlCode += "<tr><td>Banking</td><td style='text-align: right'>" + this.MakeDropDown('BankingGeneral', general.BankingList, '', "style='font-size: 10px; min-width: 110px; max-width: 110px; width: 110px;'") + '</td></tr>';
            htmlCode += "<tr><td>Level Up</td><td style='text-align: right'>" + this.MakeDropDown('LevelUpGeneral', general.List, '', "style='font-size: 10px; min-width: 110px; max-width: 110px; width: 110px;'") + '</td></tr></table>';
            htmlCode += "<div id='caap_LevelUpGeneralHide' style='display: " + (config.getItem('LevelUpGeneral', 'Use Current') !== 'Use Current' ? 'block' : 'none') + "'>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Exp To Use LevelUp Gen </td><td style='text-align: right'>" + this.MakeNumberForm('LevelUpGeneralExp', LevelUpGenExpInstructions, 20, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += this.MakeCheckTR("Level Up Gen For Idle", 'IdleLevelUpGeneral', true, '', LevelUpGenInstructions1);
            htmlCode += this.MakeCheckTR("Level Up Gen For Monsters", 'MonsterLevelUpGeneral', true, '', LevelUpGenInstructions2);
            htmlCode += this.MakeCheckTR("Level Up Gen For Fortify", 'FortifyLevelUpGeneral', true, '', LevelUpGenInstructions3);
            htmlCode += this.MakeCheckTR("Level Up Gen For Battles", 'BattleLevelUpGeneral', true, '', LevelUpGenInstructions4);
            htmlCode += this.MakeCheckTR("Level Up Gen For Duels", 'DuelLevelUpGeneral', true, '', LevelUpGenInstructions5);
            htmlCode += this.MakeCheckTR("Level Up Gen For Wars", 'WarLevelUpGeneral', true, '', LevelUpGenInstructions6);
            htmlCode += this.MakeCheckTR("Level Up Gen For SubQuests", 'SubQuestLevelUpGeneral', true, '', LevelUpGenInstructions7);
            htmlCode += this.MakeCheckTR("Level Up Gen For MainQuests", 'QuestLevelUpGeneral', false, '', LevelUpGenInstructions8);
            htmlCode += this.MakeCheckTR("Don't Bank After Level Up", 'NoBankAfterLvl', true, '', LevelUpGenInstructions9);
            htmlCode += this.MakeCheckTR("Don't Income After Level Up", 'NoIncomeAfterLvl', true, '', LevelUpGenInstructions10);
            htmlCode += "</table></div>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR("Reverse Under Level 4 Order", 'ReverseLevelUpGenerals', false, '', reverseGenInstructions) + "</table>";
            htmlCode += "<hr/></div>";
            return htmlCode;
        } catch (err) {
            utility.error("ERROR in AddGeneralsMenu: " + err);
            return '';
        }
    },

    AddSkillPointsMenu: function () {
        try {
            var statusInstructions = "Automatically increase attributes when " +
                    "upgrade skill points are available.",
                statusAdvInstructions = "USE WITH CAUTION: You can use numbers or " +
                    "formulas(ie. level * 2 + 10). Variable keywords include energy, " +
                    "health, stamina, attack, defense, and level. JS functions can be " +
                    "used (Math.min, Math.max, etc) !!!Remember your math class: " +
                    "'level + 20' not equals 'level * 2 + 10'!!!",
                statImmedInstructions = "Update Stats Immediately",
                statSpendAllInstructions = "If selected then spend all possible points and don't save for stamina upgrade.",
                attrList = [
                    '',
                    'Energy',
                    'Attack',
                    'Defense',
                    'Stamina',
                    'Health'
                ],
                htmlCode = '';

            htmlCode += this.ToggleControl('Status', 'UPGRADE SKILL POINTS');
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR("Auto Add Upgrade Points", 'AutoStat', false, 'AutoStat_Adv', statusInstructions, true);
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR("Spend All Possible", 'StatSpendAll', false, '', statSpendAllInstructions);
            htmlCode += this.MakeCheckTR("Upgrade Immediately", 'StatImmed', false, '', statImmedInstructions);
            htmlCode += this.MakeCheckTR("Advanced Settings <a href='http://userscripts.org/posts/207279' target='_blank'><font color='red'>?</font></a>", 'AutoStatAdv', false, '', statusAdvInstructions) + "</table>";
            htmlCode += "<div id='caap_Status_Normal' style='display: " + (config.getItem('AutoStatAdv', false) ? 'none' : 'block') + "'>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td style='width: 25%; text-align: right'>Increase</td><td style='width: 50%; text-align: center'>" +
                this.MakeDropDown('Attribute0', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 5%; text-align: center'>to</td><td style='width: 20%; text-align: right'>" +
                this.MakeNumberForm('AttrValue0', statusInstructions, 0, "size='3' style='font-size: 10px; text-align: right'", 'text') + " </td></tr>";
            htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
                this.MakeDropDown('Attribute1', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 5%; text-align: center'>to</td><td style='width: 20%; text-align: right'>" +
                this.MakeNumberForm('AttrValue1', statusInstructions, 0, "size='3' style='font-size: 10px; text-align: right'", 'text') + " </td></tr>";
            htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
                this.MakeDropDown('Attribute2', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 5%; text-align: center'>to</td><td style='width: 20%; text-align: right'>" +
                this.MakeNumberForm('AttrValue2', statusInstructions, 0, "size='3' style='font-size: 10px; text-align: right'", 'text') + " </td></tr>";
            htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
                this.MakeDropDown('Attribute3', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 5%; text-align: center'>to</td><td style='width: 20%; text-align: right'>" +
                this.MakeNumberForm('AttrValue3', statusInstructions, 0, "size='3' style='font-size: 10px; text-align: right'", 'text') + " </td></tr>";
            htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
                this.MakeDropDown('Attribute4', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 5%; text-align: center'>to</td><td style='width: 20%; text-align: right'>" +
                this.MakeNumberForm('AttrValue4', statusInstructions, 0, "size='3' style='font-size: 10px; text-align: right'", 'text') + " </td></tr></table>";
            htmlCode += "</div>";
            htmlCode += "<div id='caap_Status_Adv' style='display: " + (config.getItem('AutoStatAdv', false) ? 'block' : 'none') + "'>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td style='width: 25%; text-align: right'>Increase</td><td style='width: 50%; text-align: center'>" +
                this.MakeDropDown('Attribute5', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 25%; text-align: left'>using</td></tr>";
            htmlCode += "<tr><td colspan='3'>" + this.MakeNumberForm('AttrValue5', statusInstructions, 0, "size='7' style='font-size: 10px; width : 98%'", 'text') + " </td></tr>";
            htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
                this.MakeDropDown('Attribute6', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 25%'>using</td></tr>";
            htmlCode += "<tr><td colspan='3'>" + this.MakeNumberForm('AttrValue6', statusInstructions, 0, "size='7' style='font-size: 10px; width : 98%'", 'text') + " </td></tr>";
            htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
                this.MakeDropDown('Attribute7', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 25%'>using</td></tr>";
            htmlCode += "<tr><td colspan='3'>" + this.MakeNumberForm('AttrValue7', statusInstructions, 0, "size='7' style='font-size: 10px; width : 98%'", 'text') + " </td></tr>";
            htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
                this.MakeDropDown('Attribute8', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 25%'>using</td></tr>";
            htmlCode += "<tr><td colspan='3'>" + this.MakeNumberForm('AttrValue8', statusInstructions, 0, "size='7' style='font-size: 10px; width : 98%'", 'text') + " </td></tr>";
            htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
                this.MakeDropDown('Attribute9', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 25%'>using</td></tr>";
            htmlCode += "<tr><td colspan='3'>" + this.MakeNumberForm('AttrValue9', statusInstructions, 0, "size='7' style='font-size: 10px; width : 98%'", 'text') + " </td></tr></table>";
            htmlCode += "</div>";
            htmlCode += "</table></div>";
            htmlCode += "<hr/></div>";
            return htmlCode;
        } catch (err) {
            utility.error("ERROR in AddSkillPointsMenu: " + err);
            return '';
        }
    },

    AddOtherOptionsMenu: function () {
        try {
            // Other controls
            var giftInstructions = "Automatically receive and send return gifts.",
                giftQueueUniqueInstructions = "When enabled only unique user's gifts will be queued, otherwise all received gifts will be queued.",
                timeInstructions = "Use 24 hour format for displayed times.",
                titleInstructions0 = "Set the title bar.",
                titleInstructions1 = "Add the current action.",
                titleInstructions2 = "Add the player name.",
                autoCollectMAInstructions = "Auto collect your Master and Apprentice rewards.",
                hideAdsInstructions = "Hides the sidebar adverts.",
                newsSummaryInstructions = "Enable or disable the news summary on the index page.",
                autoAlchemyInstructions1 = "AutoAlchemy will combine all recipes " +
                    "that do not have missing ingredients. By default, it will not " +
                    "combine Battle Hearts recipes.",
                autoAlchemyInstructions2 = "If for some reason you do not want " +
                    "to skip Battle Hearts",
                autoPotionsInstructions0 = "Enable or disable the auto consumption " +
                    "of energy and stamina potions.",
                autoPotionsInstructions1 = "Number of stamina potions at which to " +
                    "begin consuming.",
                autoPotionsInstructions2 = "Number of stamina potions to keep.",
                autoPotionsInstructions3 = "Number of energy potions at which to " +
                    "begin consuming.",
                autoPotionsInstructions4 = "Number of energy potions to keep.",
                autoPotionsInstructions5 = "Do not consume potions if the " +
                    "experience points to the next level are within this value.",
                autoEliteInstructions = "Enable or disable Auto Elite function",
                autoEliteIgnoreInstructions = "Use this option if you have a small " +
                    "army and are unable to fill all 10 Elite positions. This prevents " +
                    "the script from checking for any empty places and will cause " +
                    "Auto Elite to run on its timer only.",
                bannerInstructions = "Uncheck if you wish to hide the CAAP banner.",
                autoBlessList = [
                    'None',
                    'Energy',
                    'Attack',
                    'Defense',
                    'Stamina',
                    'Health'
                ],
                styleList = [
                    'CA Skin',
                    'Original',
                    'Custom',
                    'None'
                ],
                htmlCode = '';

            htmlCode += this.ToggleControl('Other', 'OTHER OPTIONS');
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR('Display CAAP Banner', 'BannerDisplay', true, '', bannerInstructions);
            htmlCode += this.MakeCheckTR('Use 24 Hour Format', 'use24hr', true, '', timeInstructions);
            htmlCode += this.MakeCheckTR('Set Title', 'SetTitle', false, 'SetTitle_Adv', titleInstructions0, true);
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR('&nbsp;&nbsp;&nbsp;Display Action', 'SetTitleAction', false, '', titleInstructions1);
            htmlCode += this.MakeCheckTR('&nbsp;&nbsp;&nbsp;Display Name', 'SetTitleName', false, '', titleInstructions2) + '</td></tr></table>';
            htmlCode += '</div>';
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR('Hide Sidebar Adverts', 'HideAds', false, '', hideAdsInstructions);
            htmlCode += this.MakeCheckTR('Enable News Summary', 'NewsSummary', true, '', newsSummaryInstructions);
            htmlCode += this.MakeCheckTR('Auto Collect MA', 'AutoCollectMA', false, '', autoCollectMAInstructions);
            htmlCode += this.MakeCheckTR('Auto Alchemy', 'AutoAlchemy', false, 'AutoAlchemy_Adv', autoAlchemyInstructions1, true);
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR('&nbsp;&nbsp;&nbsp;Do Battle Hearts', 'AutoAlchemyHearts', false, '', autoAlchemyInstructions2) + '</td></tr></table>';
            htmlCode += '</div>';
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR('Auto Potions', 'AutoPotions', false, 'AutoPotions_Adv', autoPotionsInstructions0, true);
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td style='padding-left: 10px'>Spend Stamina Potions At</td><td style='text-align: right'>" +
                this.MakeNumberForm('staminaPotionsSpendOver', autoPotionsInstructions1, 39, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 10px'>Keep Stamina Potions</td><td style='text-align: right'>" +
                this.MakeNumberForm('staminaPotionsKeepUnder', autoPotionsInstructions2, 35, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 10px'>Spend Energy Potions At</td><td style='text-align: right'>" +
                this.MakeNumberForm('energyPotionsSpendOver', autoPotionsInstructions3, 39, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 10px'>Keep Energy Potions</td><td style='text-align: right'>" +
                this.MakeNumberForm('energyPotionsKeepUnder', autoPotionsInstructions4, 35, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 10px'>Wait If Exp. To Level</td><td style='text-align: right'>" +
                this.MakeNumberForm('potionsExperience', autoPotionsInstructions5, 20, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
            htmlCode += '</div>';
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR('Auto Elite Army', 'AutoElite', false, 'AutoEliteControl', autoEliteInstructions, true);
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR('&nbsp;&nbsp;&nbsp;Timed Only', 'AutoEliteIgnore', false, '', autoEliteIgnoreInstructions) + '</table>';
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td><input type='button' id='caap_resetElite' value='Do Now' style='padding: 0; font-size: 10px; height: 18px' /></tr></td>";
            htmlCode += '<tr><td>' + this.MakeTextBox('EliteArmyList', "Try these UserIDs first. Use ',' between each UserID", '', '') + '</td></tr></table>';
            htmlCode += '</div>';
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR('Auto Return Gifts', 'AutoGift', false, 'GiftControl', giftInstructions, true);
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR('Queue unique users only', 'UniqueGiftQueue', true, '', giftQueueUniqueInstructions) + '</table>';
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td style='width: 25%; padding-left: 10px'>Give</td><td style='text-align: right'>" +
                this.MakeDropDown('GiftChoice', gifting.gifts.list(), '', "style='font-size: 10px; width: 100%'") + '</td></tr></table>';
            htmlCode += '</div>';
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px' style='margin-top: 3px'>";
            htmlCode += "<tr><td style='width: 50%'>Auto bless</td><td style='text-align: right'>" +
                this.MakeDropDown('AutoBless', autoBlessList, '', "style='font-size: 10px; width: 100%'") + '</td></tr></table>';
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px' style='margin-top: 3px'>";
            htmlCode += "<tr><td style='width: 50%'>Style</td><td style='text-align: right'>" +
                this.MakeDropDown('DisplayStyle', styleList, '', "style='font-size: 10px; width: 100%'") + '</td></tr></table>';
            htmlCode += "<div id='caap_DisplayStyleHide' style='display: " + (config.getItem('DisplayStyle', 'CA Skin') === 'Custom' ? 'block' : 'none') + "'>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td style='padding-left: 10px'><b>Started</b></td><td style='text-align: right'><input type='button' id='caap_StartedColorSelect' value='Select' style='padding: 0; font-size: 10px; height: 18px' /></td></tr>";
            htmlCode += "<tr><td style='padding-left: 20px'>RGB Color</td><td style='text-align: right'>" +
                this.MakeNumberForm('StyleBackgroundLight', '#FFF or #FFFFFF', '#E0C691', "size='5' style='font-size: 10px; text-align: right'", 'text') + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 20px'>Transparency</td><td style='text-align: right'>" +
                this.MakeNumberForm('StyleOpacityLight', '0 ~ 1', 1, "size='5' style='vertical-align: middle; font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 10px'><b>Stoped</b></td><td style='text-align: right'><input type='button' id='caap_StopedColorSelect' value='Select' style='padding: 0; font-size: 10px; height: 18px' /></td></tr>";
            htmlCode += "<tr><td style='padding-left: 20px'>RGB Color</td><td style='text-align: right'>" +
                this.MakeNumberForm('StyleBackgroundDark', '#FFF or #FFFFFF', '#B09060', "size='5' style='font-size: 10px; text-align: right'", 'text') + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 20px'>Transparency</td><td style='text-align: right'>" +
                this.MakeNumberForm('StyleOpacityDark', '0 ~ 1', 1, "size='5' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
            htmlCode += "</div>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px' style='margin-top: 3px'>";
            htmlCode += "<tr><td><input type='button' id='caap_FillArmy' value='Fill Army' style='padding: 0; font-size: 10px; height: 18px' /></td></tr></table>";
            htmlCode += '</div>';
            htmlCode += "<hr/></div>";
            return htmlCode;
        } catch (err) {
            utility.error("ERROR in AddOtherOptionsMenu: " + err);
            return '';
        }
    },

    AddFooterMenu: function () {
        try {
            var htmlCode = '';
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td style='width: 90%'>Unlock Menu <input type='button' id='caap_ResetMenuLocation' value='Reset' style='padding: 0; font-size: 10px; height: 18px' /></td>" +
                "<td style='width: 10%; text-align: right'><input type='checkbox' id='unlockMenu' /></td></tr></table>";

            if (!devVersion) {
                htmlCode += "Version: " + caapVersion + " - <a href='" + global.discussionURL + "' target='_blank'>CAAP Forum</a><br />";
                if (global.newVersionAvailable) {
                    htmlCode += "<a href='http://castle-age-auto-player.googlecode.com/files/Castle-Age-Autoplayer.user.js'>Install new CAAP version: " + state.getItem('SUC_remote_version') + "!</a>";
                }
            } else {
                htmlCode += "Version: " + caapVersion + " d" + devVersion + " - <a href='" + global.discussionURL + "' target='_blank'>CAAP Forum</a><br />";
                if (global.newVersionAvailable) {
                    htmlCode += "<a href='http://castle-age-auto-player.googlecode.com/files/Castle-Age-Autoplayer.user.js'>Install new CAAP version: " + state.getItem('SUC_remote_version') + " d" + state.getItem('DEV_remote_version')  + "!</a>";
                }
            }

            return htmlCode;
        } catch (err) {
            utility.error("ERROR in AddFooterMenu: " + err);
            return '';
        }
    },

    AddColorWheels: function () {
        try {
            var fb1call = null,
                fb2call = null;

            fb1call = function (color) {
                $('#caap_ColorSelectorDiv1').css({'background-color': color});
                $('#caap_StyleBackgroundLight').val(color);
                config.setItem("StyleBackgroundLight", color);
                state.setItem("CustStyleBackgroundLight", color);
            };

            $.farbtastic($("<div id='caap_ColorSelectorDiv1'></div>").css({
                background : config.getItem("StyleBackgroundLight", "#E0C691"),
                padding    : "5px",
                border     : "2px solid #000",
                top        : (window.innerHeight / 2) - 100 + 'px',
                left       : (window.innerWidth / 2) - 290 + 'px',
                zIndex     : '1337',
                position   : 'fixed',
                display    : 'none'
            }).appendTo(document.body), fb1call).setColor(config.getItem("StyleBackgroundLight", "#E0C691"));

            fb2call = function (color) {
                $('#caap_ColorSelectorDiv2').css({'background-color': color});
                $('#caap_StyleBackgroundDark').val(color);
                config.setItem("StyleBackgroundDark", color);
                state.setItem("CustStyleBackgroundDark", color);
            };

            $.farbtastic($("<div id='caap_ColorSelectorDiv2'></div>").css({
                background : config.getItem("StyleBackgroundDark", "#B09060"),
                padding    : "5px",
                border     : "2px solid #000",
                top        : (window.innerHeight / 2) - 100 + 'px',
                left       : (window.innerWidth / 2) + 'px',
                zIndex     : '1337',
                position   : 'fixed',
                display    : 'none'
            }).appendTo(document.body), fb2call).setColor(config.getItem("StyleBackgroundDark", "#B09060"));

            return true;
        } catch (err) {
            utility.error("ERROR in AddColorWheels: " + err);
            return false;
        }
    },

    AddDashboard: function () {
        try {
            /*-------------------------------------------------------------------------------------\
             Here is where we construct the HTML for our dashboard. We start by building the outer
             container and position it within the main container.
            \-------------------------------------------------------------------------------------*/
            var layout      = "<div id='caap_top'>",
                displayList = ['Monster', 'Target List', 'Battle Stats', 'User Stats', 'Generals Stats', 'Soldier Stats', 'Item Stats', 'Magic Stats', 'Gifting Stats', 'Gift Queue'],
                styleXY = {
                    x: 0,
                    y: 0
                };
            /*-------------------------------------------------------------------------------------\
             Next we put in our Refresh Monster List button which will only show when we have
             selected the Monster display.
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_buttonMonster' style='position:absolute;top:0px;left:250px;display:" +
                (config.getItem('DBDisplay', 'Monster') === 'Monster' ? 'block' : 'none') + "'><input type='button' id='caap_refreshMonsters' value='Refresh Monster List' style='padding: 0; font-size: 9px; height: 18px' /></div>";
            /*-------------------------------------------------------------------------------------\
             Next we put in the Clear Target List button which will only show when we have
             selected the Target List display
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_buttonTargets' style='position:absolute;top:0px;left:250px;display:" +
                (config.getItem('DBDisplay', 'Monster') === 'Target List' ? 'block' : 'none') + "'><input type='button' id='caap_clearTargets' value='Clear Targets List' style='padding: 0; font-size: 9px; height: 18px' /></div>";
            /*-------------------------------------------------------------------------------------\
             Next we put in the Clear Battle Stats button which will only show when we have
             selected the Target List display
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_buttonBattle' style='position:absolute;top:0px;left:250px;display:" +
                (config.getItem('DBDisplay', 'Monster') === 'Battle Stats' ? 'block' : 'none') + "'><input type='button' id='caap_clearBattle' value='Clear Battle Stats' style='padding: 0; font-size: 9px; height: 18px' /></div>";
            /*-------------------------------------------------------------------------------------\
             Next we put in the Clear Gifting Stats button which will only show when we have
             selected the Target List display
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_buttonGifting' style='position:absolute;top:0px;left:250px;display:" +
                (config.getItem('DBDisplay', 'Monster') === 'Gifting Stats' ? 'block' : 'none') + "'><input type='button' id='caap_clearGifting' value='Clear Gifting Stats' style='padding: 0; font-size: 9px; height: 18px' /></div>";
            /*-------------------------------------------------------------------------------------\
             Next we put in the Clear Gift Queue button which will only show when we have
             selected the Target List display
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_buttonGiftQueue' style='position:absolute;top:0px;left:250px;display:" +
                (config.getItem('DBDisplay', 'Monster') === 'Gift Queue' ? 'block' : 'none') + "'><input type='button' id='caap_clearGiftQueue' value='Clear Gift Queue' style='padding: 0; font-size: 9px; height: 18px' /></div>";
            /*-------------------------------------------------------------------------------------\
             Then we put in the Live Feed link since we overlay the Castle Age link.
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_buttonFeed' style='position:absolute;top:0px;left:0px;'><input id='caap_liveFeed' type='button' value='LIVE FEED! Your friends are calling.' style='padding: 0; font-size: 9px; height: 18px' /></div>";
            /*-------------------------------------------------------------------------------------\
             We install the display selection box that allows the user to toggle through the
             available displays.
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_DBDisplay' style='font-size: 9px;position:absolute;top:0px;right:5px;'>Display: " +
                this.DBDropDown('DBDisplay', displayList, '', "style='font-size: 9px; min-width: 120px; max-width: 120px; width : 120px;'") + "</div>";
            /*-------------------------------------------------------------------------------------\
            And here we build our empty content divs.  We display the appropriate div
            depending on which display was selected using the control above
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_infoMonster' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Monster' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_infoTargets1' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Target List' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_infoBattle' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Battle Stats' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_userStats' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'User Stats' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_generalsStats' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Generals Stats' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_soldiersStats' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Soldier Stats' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_itemStats' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Item Stats' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_magicStats' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Magic Stats' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_giftStats' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Gifting Stats' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_giftQueue' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Gift Queue' ? 'block' : 'none') + "'></div>";
            layout += "</div>";
            /*-------------------------------------------------------------------------------------\
             No we apply our CSS to our container
            \-------------------------------------------------------------------------------------*/
            this.dashboardXY.x = state.getItem('caap_top_menuLeft', '');
            this.dashboardXY.y = state.getItem('caap_top_menuTop', $(this.dashboardXY.selector).offset().top - 10);
            styleXY = this.GetDashboardXY();
            $(layout).css({
                background              : config.getItem("StyleBackgroundLight", "white"),
                padding                 : "5px",
                height                  : "185px",
                width                   : "610px",
                margin                  : "0 auto",
                opacity                 : config.getItem('StyleOpacityLight', 1),
                top                     : styleXY.y + 'px',
                left                    : styleXY.x + 'px',
                zIndex                  : state.getItem('caap_top_zIndex', 1),
                position                : 'absolute',
                '-moz-border-radius'    : '5px',
                '-webkit-border-radius' : '5px'
            }).appendTo(document.body);

            this.caapTopObject = $('#caap_top');
            $("#caap_refreshMonsters").button();
            $("#caap_clearTargets").button();
            $("#caap_clearBattle").button();
            $("#caap_clearGifting").button();
            $("#caap_clearGiftQueue").button();
            $("#caap_liveFeed").button();

            return true;
        } catch (err) {
            utility.error("ERROR in AddDashboard: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                      MONSTERS DASHBOARD
    // Display the current monsters and stats
    /////////////////////////////////////////////////////////////////////
    decHours2HoursMin : function (decHours) {
        utility.log(9, "decHours2HoursMin", decHours);
        var hours   = 0,
            minutes = 0;

        hours = Math.floor(decHours);
        minutes = parseInt((decHours - hours) * 60, 10);
        if (minutes < 10) {
            minutes = '0' + minutes;
        }

        return (hours + ':' + minutes);
    },

    makeCommaValue: function (nStr) {
        nStr += '';
        var x   = nStr.split('.'),
            x1  = x[0],
            rgx = /(\d+)(\d{3})/;

        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }

        return x1;
    },

    makeTh: function (obj) {
        var header = {text: '', color: '', id: '', title: '', width: ''},
        html       = '<th';

        header = obj;
        if (!header.color) {
            header.color = 'black';
        }

        if (header.id) {
            html += " id='" + header.id + "'";
        }

        if (header.title) {
            html += " title='" + header.title + "'";
        }

        if (header.width) {
            html += " width='" + header.width + "'";
        }

        html += " style='color:" + header.color + ";font-size:10px;font-weight:bold'>" + header.text + "</th>";
        return html;
    },

    makeTd: function (obj) {
        var data = {text: '', color: '', id: '',  title: ''},
            html = '<td';

        data = obj;
        if (!data.color) {
            data.color = 'black';
        }

        if (data.id) {
            html += " id='" + data.id + "'";
        }

        if (data.title) {
            html += " title='" + data.title + "'";
        }

        html += " style='color:" + data.color + ";font-size:10px'>" + data.text + "</td>";
        return html;
    },

    UpdateDashboardWaitLog: true,

    UpdateDashboard: function (force) {
        try {
            var html                     = '',
                monsterList              = [],
                monsterName              = '',
                monstType                = '',
                energyRequire            = 0,
                nodeNum                  = 0,
                color                    = '',
                value                    = 0,
                headers                  = [],
                values                   = [],
                generalValues            = [],
                townValues               = [],
                pp                       = 0,
                i                        = 0,
                newTime                  = new Date(),
                count                    = 0,
                monsterObjLink           = '',
                visitMonsterLink         = '',
                visitMonsterInstructions = '',
                removeLink               = '',
                removeLinkInstructions   = '',
                shortMonths              = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                userIdLink               = '',
                userIdLinkInstructions   = '',
                id                       = '',
                title                    = '',
                monsterConditions        = '',
                achLevel                 = 0,
                maxDamage                = 0,
                titleCol                 = 'black',
                valueCol                 = 'red',
                it                       = 0,
                str                      = '',
                header                   = {text: '', color: '', id: '', title: '', width: ''},
                data                     = {text: '', color: '', id: '', title: ''},
                width                    = '',
                handler;

            if ($('#caap_top').length === 0) {
                throw "We are missing the Dashboard div!";
            }

            if (!force && !utility.oneMinuteUpdate('dashboard') && $('#caap_infoMonster').html() && $('#caap_infoMonster').html()) {
                if (this.UpdateDashboardWaitLog) {
                    utility.log(2, "Dashboard update is waiting on oneMinuteUpdate");
                    this.UpdateDashboardWaitLog = false;
                }

                return false;
            }

            utility.log(2, "Updating Dashboard");
            this.UpdateDashboardWaitLog = true;
            if (state.getItem("MonsterDashUpdate", true)) {
                html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
                headers = ['Name', 'Damage', 'Damage%', 'Fort%', 'Stre%', 'TimeLeft', 'T2K', 'Phase', 'Link', '&nbsp;', '&nbsp;'];
                values  = ['name', 'damage', 'life', 'fortify', 'strength', 'timeLeft', 't2k', 'phase', 'link'];
                for (pp = 0; pp < headers.length; pp += 1) {
                    width = '';
                    if (headers[pp] === 'Name') {
                        width = '30%';
                    }

                    html += this.makeTh({text: headers[pp], color: '', id: '', title: '', width: width});
                }

                html += '</tr>';
                values.shift();
                utility.log(9, "monsterList", monsterList);
                monster.records.forEach(function (monsterObj) {
                    utility.log(9, "monsterObj", monsterObj);
                    monsterName = monsterObj.name;
                    monstType = monsterObj.type;
                    energyRequire = 10;
                    nodeNum = 0;
                    if (monster.info[monstType]) {
                        if (!caap.InLevelUpMode() && config.getItem('PowerFortifyMax') && monster.info[monstType].staLvl) {
                            for (nodeNum = monster.info[monstType].staLvl.length - 1; nodeNum >= 0; nodeNum -= 1) {
                                if (caap.stats.stamina.max > monster.info[monstType].staLvl[nodeNum]) {
                                    break;
                                }
                            }
                        }

                        if (nodeNum >= 0 && nodeNum !== null && nodeNum !== undefined && config.getItem('PowerAttackMax') && monster.info[monstType].nrgMax) {
                            energyRequire = monster.info[monstType].nrgMax[nodeNum];
                        }
                    }

                    utility.log(9, "Energy Required/Node", energyRequire, nodeNum);
                    color = '';
                    html += "<tr>";
                    if (monsterName === state.getItem('targetFromfortify', '')) {
                        color = 'blue';
                    } else if (monsterName === state.getItem('targetFromraid', '') || monsterName === state.getItem('targetFrombattle_monster', '')) {
                        color = 'green';
                    } else {
                        color = monsterObj.color;
                    }

                    achLevel = 0;
                    maxDamage = 0;
                    monsterConditions = monsterObj.conditions;
                    if (monsterConditions) {
                        achLevel = monster.parseCondition('ach', monsterConditions);
                        maxDamage = monster.parseCondition('max', monsterConditions);
                    }

                    monsterObjLink = monsterObj.link;
                    utility.log(9, "monsterObjLink", monsterObjLink);
                    if (monsterObjLink) {
                        visitMonsterLink = monsterObjLink.replace("&action=doObjective", "").match(new RegExp("'(http:.+)'"));
                        utility.log(9, "visitMonsterLink", visitMonsterLink);
                        visitMonsterInstructions = "Clicking this link will take you to " + monsterName;
                        data = {
                            text  : '<span id="caap_monster_' + count + '" title="' + visitMonsterInstructions + '" mname="' + monsterName + '" rlink="' + visitMonsterLink[1] +
                                    '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + monsterName + '</span>',
                            color : color,
                            id    : '',
                            title : ''
                        };

                        html += caap.makeTd(data);
                    } else {
                        html += caap.makeTd({text: monsterName, color: color, id: '', title: ''});
                    }

                    values.forEach(function (displayItem) {
                        utility.log(9, 'displayItem/value ', displayItem, monsterObj[displayItem]);
                        id = "caap_" + displayItem + "_" + count;
                        title = '';
                        if (displayItem === 'phase' && color === 'grey') {
                            html += caap.makeTd({text: monsterObj.status, color: color, id: '', title: ''});
                        } else {
                            value = monsterObj[displayItem];
                            if ((value !== '' && value >= 0) || (value !== '' && isNaN(value))) {
                                if (parseInt(value, 10) === value && value > 999) {
                                    utility.log(9, 'makeCommaValue ', value);
                                    value = caap.makeCommaValue(value);
                                }

                                switch (displayItem) {
                                case 'damage' :
                                    if (achLevel) {
                                        title = "User Set Monster Achievement: " + caap.makeCommaValue(achLevel);
                                    } else if (config.getItem('AchievementMode', false)) {
                                        if (monster.info[monstType]) {
                                            title = "Default Monster Achievement: " + caap.makeCommaValue(monster.info[monstType].ach);
                                        }
                                    } else {
                                        title = "Achievement Mode Disabled";
                                    }

                                    if (maxDamage) {
                                        title += " - User Set Max Damage: " + caap.makeCommaValue(maxDamage);
                                    }

                                    break;
                                case 'timeLeft' :
                                    if (monster.info[monstType]) {
                                        title = "Total Monster Duration: " + monster.info[monstType].duration + " hours";
                                    }

                                    break;
                                case 't2k' :
                                    value = caap.decHours2HoursMin(value);
                                    title = "Estimated Time To Kill: " + value + " hours:mins";
                                    break;
                                case 'life' :
                                    value = value.toFixed(2);
                                    title = "Percentage of monster life remaining: " + value + "%";
                                    break;
                                case 'fortify' :
                                    value = value.toFixed(2);
                                    title = "Percentage of party health/monster defense: " + value + "%";
                                    break;
                                case 'strength' :
                                    value = value.toFixed(2);
                                    title = "Percentage of party strength: " + value + "%";
                                    break;
                                default :
                                }

                                html += caap.makeTd({text: value, color: color, id: id, title: title});
                            } else {
                                html += caap.makeTd({text: '', color: color, id: '', title: ''});
                            }
                        }
                    });

                    if (monsterConditions && monsterConditions !== 'none') {
                        data = {
                            text  : '<span title="User Set Conditions: ' + monsterConditions + '" class="ui-icon ui-icon-info">i</span>',
                            color : 'blue',
                            id    : '',
                            title : ''
                        };

                        html += caap.makeTd(data);
                    } else {
                        html += caap.makeTd({text: '', color: color, id: '', title: ''});
                    }

                    if (monsterObjLink) {
                        removeLink = monsterObjLink.replace("casuser", "remove_list").replace("&action=doObjective", "").match(new RegExp("'(http:.+)'"));
                        utility.log(9, "removeLink", removeLink);
                        removeLinkInstructions = "Clicking this link will remove " + monsterName + " from both CA and CAAP!";
                        data = {
                            text  : '<span id="caap_remove_' + count + '" title="' + removeLinkInstructions + '" mname="' + monsterName + '" rlink="' + removeLink[1] +
                                    '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';" class="ui-icon ui-icon-circle-close">X</span>',
                            color : 'blue',
                            id    : '',
                            title : ''
                        };

                        html += caap.makeTd(data);
                    } else {
                        html += caap.makeTd({text: '', color: color, id: '', title: ''});
                    }

                    html += '</tr>';
                    count += 1;
                });

                html += '</table>';
                $("#caap_infoMonster").html(html);

                handler = function (e) {
                    utility.log(9, "Clicked", e.target.id);
                    var visitMonsterLink = {
                        mname     : '',
                        rlink     : '',
                        arlink    : ''
                    },
                    i = 0;

                    for (i = 0; i < e.target.attributes.length; i += 1) {
                        if (e.target.attributes[i].nodeName === 'mname') {
                            visitMonsterLink.mname = e.target.attributes[i].nodeValue;
                        } else if (e.target.attributes[i].nodeName === 'rlink') {
                            visitMonsterLink.rlink = e.target.attributes[i].nodeValue;
                            visitMonsterLink.arlink = visitMonsterLink.rlink.replace("http://apps.facebook.com/castle_age/", "");
                        }
                    }

                    utility.log(9, 'visitMonsterLink', visitMonsterLink);
                    utility.ClickAjax(visitMonsterLink.arlink);
                };

                $("#caap_top span[id*='caap_monster_']").unbind('click', handler).click(handler);

                handler = function (e) {
                    utility.log(9, "Clicked", e.target.id);
                    var monsterRemove = {
                        mname     : '',
                        rlink     : '',
                        arlink    : ''
                    },
                    i = 0,
                    resp = false;

                    for (i = 0; i < e.target.attributes.length; i += 1) {
                        if (e.target.attributes[i].nodeName === 'mname') {
                            monsterRemove.mname = e.target.attributes[i].nodeValue;
                        } else if (e.target.attributes[i].nodeName === 'rlink') {
                            monsterRemove.rlink = e.target.attributes[i].nodeValue;
                            monsterRemove.arlink = monsterRemove.rlink.replace("http://apps.facebook.com/castle_age/", "");
                        }
                    }

                    utility.log(9, 'monsterRemove', monsterRemove);
                    resp = confirm("Are you sure you want to remove " + monsterRemove.mname + "?");
                    if (resp === true) {
                        monster.deleteItem(monsterRemove.mname);
                        caap.UpdateDashboard(true);
                        if (state.getItem('clickUrl', '').indexOf(monsterRemove.arlink) < 0) {
                            state.setItem('clickUrl', monsterRemove.rlink);
                            this.waitingForDomLoad = false;
                        }

                        utility.VisitUrl("javascript:void(a46755028429_get_cached_ajax('" + monsterRemove.arlink + "', 'get_body'))");
                    }
                };

                $("#caap_top span[id*='caap_remove_']").unbind('click', handler).click(handler);
                state.setItem("MonsterDashUpdate", false);
            }

            /*-------------------------------------------------------------------------------------\
            Next we build the HTML to be included into the 'caap_infoTargets1' div. We set our
            table and then build the header row.
            \-------------------------------------------------------------------------------------*/
            if (state.getItem("ReconDashUpdate", true)) {
                html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
                headers = ['UserId', 'Name',    'Deity#',   'Rank',    'Rank#',   'Level',    'Army',    'Last Alive'];
                values  = ['userID', 'nameStr', 'deityNum', 'rankStr', 'rankNum', 'levelNum', 'armyNum', 'aliveTime'];
                for (pp = 0; pp < headers.length; pp += 1) {
                    html += this.makeTh({text: headers[pp], color: '', id: '', title: '', width: ''});
                }

                html += '</tr>';
                for (i = 0; i < this.ReconRecordArray.length; i += 1) {
                    html += "<tr>";
                    for (pp = 0; pp < values.length; pp += 1) {
                        if (/userID/.test(values[pp])) {
                            userIdLinkInstructions = "Clicking this link will take you to the user keep of " + this.ReconRecordArray[i][values[pp]];
                            userIdLink = "http://apps.facebook.com/castle_age/keep.php?casuser=" + this.ReconRecordArray[i][values[pp]];
                            data = {
                                text  : '<span id="caap_targetrecon_' + i + '" title="' + userIdLinkInstructions + '" rlink="' + userIdLink +
                                        '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + this.ReconRecordArray[i][values[pp]] + '</span>',
                                color : 'blue',
                                id    : '',
                                title : ''
                            };

                            html += caap.makeTd(data);
                        } else if (/\S+Num/.test(values[pp])) {
                            html += caap.makeTd({text: this.ReconRecordArray[i][values[pp]], color: 'black', id: '', title: ''});
                        } else if (/\S+Time/.test(values[pp])) {
                            newTime = new Date(this.ReconRecordArray[i][values[pp]]);
                            data = {
                                text  : newTime.getDate() + '-' + shortMonths[newTime.getMonth()] + ' ' + newTime.getHours() + ':' + (newTime.getMinutes() < 10 ? '0' : '') + newTime.getMinutes(),
                                color : 'black',
                                id    : '',
                                title : ''
                            };

                            html += caap.makeTd(data);
                        } else {
                            html += caap.makeTd({text: this.ReconRecordArray[i][values[pp]], color: 'black', id: '', title: ''});
                        }
                    }

                    html += '</tr>';
                }

                html += '</table>';
                $("#caap_infoTargets1").html(html);

                handler = function (e) {
                    utility.log(9, "Clicked", e.target.id);
                    var visitUserIdLink = {
                        rlink     : '',
                        arlink    : ''
                    },
                    i = 0;

                    for (i = 0; i < e.target.attributes.length; i += 1) {
                        if (e.target.attributes[i].nodeName === 'rlink') {
                            visitUserIdLink.rlink = e.target.attributes[i].nodeValue;
                            visitUserIdLink.arlink = visitUserIdLink.rlink.replace("http://apps.facebook.com/castle_age/", "");
                        }
                    }

                    utility.log(9, 'visitUserIdLink', visitUserIdLink);
                    utility.ClickAjax(visitUserIdLink.arlink);
                };

                $("#caap_top span[id*='caap_targetrecon_']").unbind('click', handler).click(handler);
                state.setItem("ReconDashUpdate", false);
            }

            /*-------------------------------------------------------------------------------------\
            Next we build the HTML to be included into the 'caap_infoBattle' div. We set our
            table and then build the header row.
            \-------------------------------------------------------------------------------------*/
            if (state.getItem("BattleDashUpdate", true)) {
                html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
                headers = ['UserId', 'Name',    'BR#',     'WR#',        'Level',    'Army',    'I Win',         'I Lose',          'D Win',       'D Lose',        'W Win',      'W Lose'];
                values  = ['userId', 'nameStr', 'rankNum', 'warRankNum', 'levelNum', 'armyNum', 'invadewinsNum', 'invadelossesNum', 'duelwinsNum', 'duellossesNum', 'warwinsNum', 'warlossesNum'];
                for (pp = 0; pp < headers.length; pp += 1) {
                    html += this.makeTh({text: headers[pp], color: '', id: '', title: '', width: ''});
                }

                html += '</tr>';
                for (i = 0; i < battle.records.length; i += 1) {
                    html += "<tr>";
                    for (pp = 0; pp < values.length; pp += 1) {
                        if (/userId/.test(values[pp])) {
                            userIdLinkInstructions = "Clicking this link will take you to the user keep of " + battle.records[i][values[pp]];
                            userIdLink = "http://apps.facebook.com/castle_age/keep.php?casuser=" + battle.records[i][values[pp]];
                            data = {
                                text  : '<span id="caap_battle_' + i + '" title="' + userIdLinkInstructions + '" rlink="' + userIdLink +
                                        '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + battle.records[i][values[pp]] + '</span>',
                                color : 'blue',
                                id    : '',
                                title : ''
                            };

                            html += caap.makeTd(data);
                        } else if (/rankNum/.test(values[pp])) {
                            html += caap.makeTd({text: battle.records[i][values[pp]], color: 'black', id: '', title: battle.records[i].rankStr});
                        } else if (/warRankNum/.test(values[pp])) {
                            html += caap.makeTd({text: battle.records[i][values[pp]], color: 'black', id: '', title: battle.records[i].warRankStr});
                        } else {
                            html += caap.makeTd({text: battle.records[i][values[pp]], color: 'black', id: '', title: ''});
                        }
                    }

                    html += '</tr>';
                }

                html += '</table>';
                $("#caap_infoBattle").html(html);

                $("#caap_top span[id*='caap_battle_']").click(function (e) {
                    utility.log(9, "Clicked", e.target.id);
                    var visitUserIdLink = {
                        rlink     : '',
                        arlink    : ''
                    },
                    i = 0;

                    for (i = 0; i < e.target.attributes.length; i += 1) {
                        if (e.target.attributes[i].nodeName === 'rlink') {
                            visitUserIdLink.rlink = e.target.attributes[i].nodeValue;
                            visitUserIdLink.arlink = visitUserIdLink.rlink.replace("http://apps.facebook.com/castle_age/", "");
                        }
                    }

                    utility.log(9, 'visitUserIdLink', visitUserIdLink);
                    utility.ClickAjax(visitUserIdLink.arlink);
                });

                state.setItem("BattleDashUpdate", false);
            }

            /*-------------------------------------------------------------------------------------\
            Next we build the HTML to be included into the 'caap_userStats' div. We set our
            table and then build the header row.
            \-------------------------------------------------------------------------------------*/
            if (state.getItem("UserDashUpdate", true)) {
                html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
                headers = ['Name', 'Value', 'Name', 'Value'];
                for (pp = 0; pp < headers.length; pp += 1) {
                    html += this.makeTh({text: headers[pp], color: '', id: '', title: '', width: ''});
                }

                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Facebook ID', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.stats.FBID, color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Account Name', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.stats.account, color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Character Name', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.stats.PlayerName, color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Energy', color: titleCol, id: '', title: 'Current/Max'});
                html += this.makeTd({text: this.stats.energy.num + '/' + this.stats.energy.max, color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Level', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.stats.level, color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Stamina', color: titleCol, id: '', title: 'Current/Max'});
                html += this.makeTd({text: this.stats.stamina.num + '/' + this.stats.stamina.max, color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Battle Rank', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: battle.battleRankTable[this.stats.rank.battle] + ' (' + this.stats.rank.battle + ')', color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Attack', color: titleCol, id: '', title: 'Current/Max'});
                html += this.makeTd({text: this.makeCommaValue(this.stats.attack), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Battle Rank Points', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.rank.battlePoints), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Defense', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.defense), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'War Rank', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: battle.warRankTable[this.stats.rank.war] + ' (' + this.stats.rank.war + ')', color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Health', color: titleCol, id: '', title: 'Current/Max'});
                html += this.makeTd({text: this.stats.health.num + '/' + this.stats.health.max, color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'War Rank Points', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.rank.warPoints), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Army', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.army.actual), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Generals', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.stats.generals.total, color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Generals When Invade', color: titleCol, id: '', title: 'For every 5 army members you have, one of your generals will also join the fight.'});
                html += this.makeTd({text: this.stats.generals.invade, color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Gold In Bank', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '$' + this.makeCommaValue(this.stats.gold.bank), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Total Income Per Hour', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '$' + this.makeCommaValue(this.stats.gold.income), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Gold In Cash', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '$' + this.makeCommaValue(this.stats.gold.cash), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Upkeep', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '$' + this.makeCommaValue(this.stats.gold.upkeep), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Total Gold', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '$' + this.makeCommaValue(this.stats.gold.total), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Cash Flow Per Hour', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '$' + this.makeCommaValue(this.stats.gold.flow), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Skill Points', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.stats.points.skill, color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Energy Potions', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.stats.potions.energy, color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Favor Points', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.stats.points.favor, color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Stamina Potions', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.stats.potions.stamina, color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Experience To Next Level (ETNL)', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.exp.dif), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Battle Strength Index (BSI)', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.stats.indicators.bsi.toFixed(2), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Hours To Level (HTL)', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.decHours2HoursMin(this.stats.indicators.htl), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Levelling Speed Index (LSI)', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.stats.indicators.lsi.toFixed(2), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Hours Remaining To Level (HRTL)', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.decHours2HoursMin(this.stats.indicators.hrtl), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Skill Points Per Level (SPPL)', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.stats.indicators.sppl.toFixed(2), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Expected Next Level (ENL)', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: schedule.FormatTime(new Date(this.stats.indicators.enl)), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Attack Power Index (API)', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.stats.indicators.api.toFixed(2), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Defense Power Index (DPI)', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.stats.indicators.dpi.toFixed(2), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Mean Power Index (MPI)', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.stats.indicators.mpi.toFixed(2), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Battles/Wars Won', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.other.bww), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Times eliminated', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.other.te), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Battles/Wars Lost', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.other.bwl), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Times you eliminated an enemy', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.other.tee), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Battles/Wars Win/Loss Ratio (WLR)', color: titleCol, id: '', title: ''});
                if (this.stats.other.wlr) {
                    html += this.makeTd({text: this.stats.other.wlr.toFixed(2), color: valueCol, id: '', title: ''});
                } else {
                    html += this.makeTd({text: this.stats.other.wlr, color: valueCol, id: '', title: ''});
                }

                html += this.makeTd({text: 'Enemy Eliminated/Eliminated Ratio (EER)', color: titleCol, id: '', title: ''});
                if (this.stats.other.eer) {
                    html += this.makeTd({text: this.stats.other.eer.toFixed(2), color: valueCol, id: '', title: ''});
                } else {
                    html += this.makeTd({text: this.stats.other.eer, color: valueCol, id: '', title: ''});
                }

                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Invasions Won', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.achievements.battle.invasions.won), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Duels Won', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.achievements.battle.duels.won), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Invasions Lost', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.achievements.battle.invasions.lost), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Duels Lost', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.achievements.battle.duels.lost), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Invasions Streak', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.achievements.battle.invasions.streak), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Duels Streak', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.achievements.battle.duels.streak), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Invasions Win/loss Ratio (IWLR)', color: titleCol, id: '', title: ''});
                if (this.stats.achievements.battle.invasions.ratio) {
                    html += this.makeTd({text: this.stats.achievements.battle.invasions.ratio.toFixed(2), color: valueCol, id: '', title: ''});
                } else {
                    html += this.makeTd({text: this.stats.achievements.battle.invasions.ratio, color: valueCol, id: '', title: ''});
                }

                html += this.makeTd({text: 'Duels Win/loss Ratio (DWLR)', color: titleCol, id: '', title: ''});
                if (this.stats.achievements.battle.duels.ratio) {
                    html += this.makeTd({text: this.stats.achievements.battle.duels.ratio.toFixed(2), color: valueCol, id: '', title: ''});
                } else {
                    html += this.makeTd({text: this.stats.achievements.battle.duels.ratio, color: valueCol, id: '', title: ''});
                }

                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Quests Completed', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.other.qc), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Alchemy Performed', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.achievements.other.alchemy), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Gildamesh, The Orc King Slain', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.achievements.monster.gildamesh), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Lotus Ravenmoore Slain', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.achievements.monster.lotus), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'The Colossus of Terra Slain', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.achievements.monster.colossus), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Dragons Slain', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.achievements.monster.dragons), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Sylvanas the Sorceress Queen Slain', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.achievements.monster.sylvanas), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Cronus, The World Hydra Slain', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.achievements.monster.cronus), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Keira the Dread Knight Slain', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.achievements.monster.keira), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'The Battle of the Dark Legion Slain', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.achievements.monster.legion), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Genesis, The Earth Elemental Slain', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.achievements.monster.genesis), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Skaar Deathrune Slain', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.achievements.monster.skaar), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Gehenna, The Fire Elemental Slain', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.achievements.monster.gehenna), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Sieges Assisted With', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.achievements.monster.sieges), color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: "Aurelius, Lion's Rebellion", color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.makeCommaValue(this.stats.achievements.monster.aurelius), color: valueCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Ambrosia Daily Points', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.demi.ambrosia.daily.num + '/' + this.demi.ambrosia.daily.max, color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Malekus Daily Points', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.demi.malekus.daily.num + '/' + this.demi.ambrosia.daily.max, color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Ambrosia Total Points', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.demi.ambrosia.power.total, color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Malekus Total Points', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.demi.malekus.power.total, color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Corvintheus Daily Points', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.demi.corvintheus.daily.num + '/' + this.demi.corvintheus.daily.max, color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Aurora Daily Points', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.demi.aurora.daily.num + '/' + this.demi.aurora.daily.max, color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Corvintheus Total Points', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.demi.corvintheus.power.total, color: valueCol, id: '', title: ''});
                html += this.makeTd({text: 'Aurora Total Points', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.demi.aurora.power.total, color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Azeron Daily Points', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.demi.azeron.daily.num + '/' + this.demi.azeron.daily.max, color: valueCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += '</tr>';

                html += "<tr>";
                html += this.makeTd({text: 'Azeron Total Points', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: this.demi.azeron.power.total, color: valueCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += '</tr>';


                html += "<tr>";
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: titleCol, id: '', title: ''});
                html += this.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                html += '</tr>';

                count = 0;
                for (pp in this.stats.character) {
                    if (this.stats.character.hasOwnProperty(pp)) {
                        if (count % 2  === 0) {
                            html += "<tr>";
                        }

                        html += this.makeTd({text: this.stats.character[pp].name, color: titleCol, id: '', title: ''});
                        html += this.makeTd({text: "Level " + this.stats.character[pp].level + " (" + this.stats.character[pp].percent + "%)", color: valueCol, id: '', title: ''});
                        if (count % 2 === 1) {
                            html += '</tr>';
                        }

                        count += 1;
                    }
                }

                html += '</table>';
                $("#caap_userStats").html(html);
                state.setItem("UserDashUpdate", false);
            }

            /*-------------------------------------------------------------------------------------\
            Next we build the HTML to be included into the 'caap_generalsStats' div. We set our
            table and then build the header row.
            \-------------------------------------------------------------------------------------*/
            if (state.getItem("GeneralsDashUpdate", true)) {
                html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
                headers = ['General', 'Lvl', 'Atk', 'Def', 'API', 'DPI', 'MPI', 'EAtk', 'EDef', 'EAPI', 'EDPI', 'EMPI', 'Special'];
                values  = ['name', 'lvl', 'atk', 'def', 'api', 'dpi', 'mpi', 'eatk', 'edef', 'eapi', 'edpi', 'empi', 'special'];
                $.merge(generalValues, values);
                for (pp = 0; pp < headers.length; pp += 1) {
                    header = {
                        text  : '<span id="caap_generalsStats_' + values[pp] + '" title="Click to sort" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + headers[pp] + '</span>',
                        color : 'blue',
                        id    : '',
                        title : '',
                        width : ''
                    };

                    if (headers[pp] === 'Special') {
                        header = {
                            text  : headers[pp],
                            color : 'black',
                            id    : '',
                            title : '',
                            width : '25%'
                        };
                    }

                    html += this.makeTh(header);
                }

                html += '</tr>';
                for (it = 0; it < general.recordsSortable.length; it += 1) {
                    html += "<tr>";
                    for (pp = 0; pp < values.length; pp += 1) {
                        str = '';
                        if (isNaN(general.recordsSortable[it][values[pp]])) {
                            if (general.recordsSortable[it][values[pp]]) {
                                str = general.recordsSortable[it][values[pp]];
                            }
                        } else {
                            if (/pi/.test(values[pp])) {
                                str = general.recordsSortable[it][values[pp]].toFixed(2);
                            } else {
                                str = general.recordsSortable[it][values[pp]].toString();
                            }
                        }

                        if (pp === 0) {
                            color = titleCol;
                        } else {
                            color = valueCol;
                        }

                        html += caap.makeTd({text: str, color: color, id: '', title: ''});
                    }

                    html += '</tr>';
                }

                html += '</table>';
                $("#caap_generalsStats").html(html);

                handler = function (e) {
                    var clicked = '';

                    if (e.target.id) {
                        clicked = e.target.id.replace(new RegExp("caap_.*Stats_"), '');
                    }

                    utility.log(9, "Clicked", clicked);
                    if (generalValues.indexOf(clicked) !== -1 && typeof sort[clicked] === 'function') {
                        general.recordsSortable.sort(sort[clicked]);
                        state.setItem("GeneralsDashUpdate", true);
                        caap.UpdateDashboard(true);
                    }
                };

                $("#caap_top span[id*='caap_generalsStats_']").unbind('click', handler).click(handler);
                state.setItem("GeneralsDashUpdate", false);
            }


            /*-------------------------------------------------------------------------------------\
            Next we build the HTML to be included into the 'soldiers', 'item' and 'magic' div.
            We set our table and then build the header row.
            \-------------------------------------------------------------------------------------*/
            if (state.getItem("SoldiersDashUpdate", true) || state.getItem("ItemDashUpdate", true) || state.getItem("MagicDashUpdate", true)) {
                headers = ['Name', 'Owned', 'Atk', 'Def', 'API', 'DPI', 'MPI', 'Cost', 'Upkeep', 'Hourly'];
                values  = ['name', 'owned', 'atk', 'def', 'api', 'dpi', 'mpi', 'cost', 'upkeep', 'hourly'];
                $.merge(townValues, values);
                for (i = 0; i < town.types.length; i += 1) {
                    if (!state.getItem(town.types[i].ucFirst() + "DashUpdate", true)) {
                        continue;
                    }

                    html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
                    for (pp = 0; pp < headers.length; pp += 1) {
                        header = {
                            text  : '<span id="caap_' + town.types[i] + 'Stats_' + values[pp] + '" title="Click to sort" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + headers[pp] + '</span>',
                            color : 'blue',
                            id    : '',
                            title : '',
                            width : ''
                        };

                        html += this.makeTh(header);
                    }

                    html += '</tr>';
                    for (it = 0; it < town[town.types[i] + "Sortable"].length; it += 1) {
                        html += "<tr>";
                        for (pp = 0; pp < values.length; pp += 1) {
                            str = '';
                            if (isNaN(town[town.types[i] + "Sortable"][it][values[pp]])) {
                                if (town[town.types[i] + "Sortable"][it][values[pp]]) {
                                    str = town[town.types[i] + "Sortable"][it][values[pp]];
                                }
                            } else {
                                if (/pi/.test(values[pp])) {
                                    str = town[town.types[i] + "Sortable"][it][values[pp]].toFixed(2);
                                } else {
                                    str = this.makeCommaValue(town[town.types[i] + "Sortable"][it][values[pp]]);
                                    if (values[pp] === 'cost' || values[pp] === 'upkeep' || values[pp] === 'hourly') {
                                        str = "$" + str;
                                    }
                                }
                            }

                            if (pp === 0) {
                                color = titleCol;
                            } else {
                                color = valueCol;
                            }

                            html += caap.makeTd({text: str, color: color, id: '', title: ''});
                        }

                        html += '</tr>';
                    }

                    html += '</table>';
                    $("#caap_" + town.types[i] + "Stats").html(html);
                }

                handler = function (e) {
                    var clicked = '';

                    if (e.target.id) {
                        clicked = e.target.id.replace(new RegExp("caap_.*Stats_"), '');
                    }

                    utility.log(9, "Clicked", clicked);
                    if (townValues.indexOf(clicked) !== -1 && typeof sort[clicked] === 'function') {
                        town.soldiersSortable.sort(sort[clicked]);
                        state.setItem("SoldiersDashUpdate", true);
                        caap.UpdateDashboard(true);
                    }
                };

                $("#caap_top span[id*='caap_soldiersStats_']").unbind('click', handler).click(handler);
                state.setItem("SoldiersDashUpdate", false);

                handler = function (e) {
                    var clicked = '';

                    if (e.target.id) {
                        clicked = e.target.id.replace(new RegExp("caap_.*Stats_"), '');
                    }

                    utility.log(9, "Clicked", clicked);
                    if (townValues.indexOf(clicked) !== -1 && typeof sort[clicked] === 'function') {
                        town.itemSortable.sort(sort[clicked]);
                        state.setItem("ItemDashUpdate", true);
                        caap.UpdateDashboard(true);
                    }
                };

                $("#caap_top span[id*='caap_itemStats_']").unbind('click', handler).click(handler);
                state.setItem("ItemDashUpdate", false);

                handler = function (e) {
                    var clicked = '';

                    if (e.target.id) {
                        clicked = e.target.id.replace(new RegExp("caap_.*Stats_"), '');
                    }

                    utility.log(9, "Clicked", clicked);
                    if (townValues.indexOf(clicked) !== -1 && typeof sort[clicked] === 'function') {
                        town.magicSortable.sort(sort[clicked]);
                        state.setItem("MagicDashUpdate", true);
                        caap.UpdateDashboard(true);
                    }
                };

                $("#caap_top span[id*='caap_magicStats_']").unbind('click', handler).click(handler);
                state.setItem("MagicDashUpdate", false);
            }

            /*-------------------------------------------------------------------------------------\
            Next we build the HTML to be included into the 'caap_giftStats' div. We set our
            table and then build the header row.
            \-------------------------------------------------------------------------------------*/
            if (state.getItem("GiftHistoryDashUpdate", true)) {
                html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
                headers = ['UserId', 'Name', 'Received', 'Sent'];
                values  = ['userId', 'name', 'received', 'sent'];
                for (pp = 0; pp < headers.length; pp += 1) {
                    html += this.makeTh({text: headers[pp], color: '', id: '', title: '', width: ''});
                }

                html += '</tr>';
                for (i = 0; i < gifting.history.records.length; i += 1) {
                    html += "<tr>";
                    for (pp = 0; pp < values.length; pp += 1) {
                        if (/userId/.test(values[pp])) {
                            userIdLinkInstructions = "Clicking this link will take you to the user keep of " + gifting.history.records[i][values[pp]];
                            userIdLink = "http://apps.facebook.com/castle_age/keep.php?casuser=" + gifting.history.records[i][values[pp]];
                            data = {
                                text  : '<span id="caap_targetgift_' + i + '" title="' + userIdLinkInstructions + '" rlink="' + userIdLink +
                                        '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + gifting.history.records[i][values[pp]] + '</span>',
                                color : 'blue',
                                id    : '',
                                title : ''
                            };

                            html += caap.makeTd(data);
                        } else {
                            html += caap.makeTd({text: gifting.history.records[i][values[pp]], color: 'black', id: '', title: ''});
                        }
                    }

                    html += '</tr>';
                }

                html += '</table>';
                $("#caap_giftStats").html(html);

                handler = function (e) {
                    utility.log(9, "Clicked", e.target.id);
                    var visitUserIdLink = {
                        rlink     : '',
                        arlink    : ''
                    },
                    i = 0;

                    for (i = 0; i < e.target.attributes.length; i += 1) {
                        if (e.target.attributes[i].nodeName === 'rlink') {
                            visitUserIdLink.rlink = e.target.attributes[i].nodeValue;
                            visitUserIdLink.arlink = visitUserIdLink.rlink.replace("http://apps.facebook.com/castle_age/", "");
                        }
                    }

                    utility.log(9, 'visitUserIdLink', visitUserIdLink);
                    utility.ClickAjax(visitUserIdLink.arlink);
                };

                $("#caap_top span[id*='caap_targetgift_']").unbind('click', handler).click(handler);
                state.setItem("GiftHistoryDashUpdate", false);
            }

            /*-------------------------------------------------------------------------------------\
            Next we build the HTML to be included into the 'caap_giftQueue' div. We set our
            table and then build the header row.
            \-------------------------------------------------------------------------------------*/
            if (state.getItem("GiftQueueDashUpdate", true)) {
                html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
                headers = ['UserId', 'Name', 'Gift', 'FB Cleared', 'Delete'];
                values  = ['userId', 'name', 'gift', 'found'];
                for (pp = 0; pp < headers.length; pp += 1) {
                    html += this.makeTh({text: headers[pp], color: '', id: '', title: '', width: ''});
                }

                html += '</tr>';
                for (i = 0; i < gifting.queue.records.length; i += 1) {
                    html += "<tr>";
                    for (pp = 0; pp < values.length; pp += 1) {
                        if (/userId/.test(values[pp])) {
                            userIdLinkInstructions = "Clicking this link will take you to the user keep of " + gifting.queue.records[i][values[pp]];
                            userIdLink = "http://apps.facebook.com/castle_age/keep.php?casuser=" + gifting.queue.records[i][values[pp]];
                            data = {
                                text  : '<span id="caap_targetgiftq_' + i + '" title="' + userIdLinkInstructions + '" rlink="' + userIdLink +
                                        '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + gifting.queue.records[i][values[pp]] + '</span>',
                                color : 'blue',
                                id    : '',
                                title : ''
                            };

                            html += caap.makeTd(data);
                        } else {
                            html += caap.makeTd({text: gifting.queue.records[i][values[pp]], color: 'black', id: '', title: ''});
                        }
                    }

                    removeLinkInstructions = "Clicking this link will remove " + gifting.queue.records[i].name + "'s entry from the gift queue!";
                    data = {
                        text  : '<span id="caap_removeq_' + i + '" title="' + removeLinkInstructions + '" mname="' +
                                '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';" class="ui-icon ui-icon-circle-close">X</span>',
                        color : 'blue',
                        id    : '',
                        title : ''
                    };

                    html += caap.makeTd(data);

                    html += '</tr>';
                }

                html += '</table>';
                $("#caap_giftQueue").html(html);

                handler = function (e) {
                    utility.log(9, "Clicked", e.target.id);
                    var visitUserIdLink = {
                        rlink     : '',
                        arlink    : ''
                    },
                    i = 0;

                    for (i = 0; i < e.target.attributes.length; i += 1) {
                        if (e.target.attributes[i].nodeName === 'rlink') {
                            visitUserIdLink.rlink = e.target.attributes[i].nodeValue;
                            visitUserIdLink.arlink = visitUserIdLink.rlink.replace("http://apps.facebook.com/castle_age/", "");
                        }
                    }

                    utility.log(9, 'visitUserIdLink', visitUserIdLink);
                    utility.ClickAjax(visitUserIdLink.arlink);
                };

                $("#caap_top span[id*='caap_targetgiftq_']").unbind('click', handler).click(handler);

                handler = function (e) {
                    utility.log(9, "Clicked", e.target.id);
                    var index = -1,
                        i = 0,
                        resp = false;

                    for (i = 0; i < e.target.attributes.length; i += 1) {
                        if (e.target.attributes[i].nodeName === 'id') {
                            index = parseInt(e.target.attributes[i].nodeValue.replace("caap_removeq_", ""), 10);
                        }
                    }

                    utility.log(9, 'index', index);
                    resp = confirm("Are you sure you want to remove this queue entry?");
                    if (resp === true) {
                        gifting.queue.deleteIndex(index);
                        caap.UpdateDashboard(true);
                    }
                };

                $("#caap_top span[id*='caap_removeq_']").unbind('click', handler).click(handler);
                state.setItem("GiftQueueDashUpdate", false);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in UpdateDashboard: " + err);
            return false;
        }
    },

    /*-------------------------------------------------------------------------------------\
    AddDBListener creates the listener for our dashboard controls.
    \-------------------------------------------------------------------------------------*/
    dbDisplayListener: function (e) {
        var value = e.target.options[e.target.selectedIndex].value;
        config.setItem('DBDisplay', value);
        caap.SetDisplay('infoMonster', false);
        caap.SetDisplay('infoTargets1', false);
        caap.SetDisplay('infoBattle', false);
        caap.SetDisplay('userStats', false);
        caap.SetDisplay('generalsStats', false);
        caap.SetDisplay('soldiersStats', false);
        caap.SetDisplay('itemStats', false);
        caap.SetDisplay('magicStats', false);
        caap.SetDisplay('giftStats', false);
        caap.SetDisplay('giftQueue', false);
        caap.SetDisplay('buttonMonster', false);
        caap.SetDisplay('buttonTargets', false);
        caap.SetDisplay('buttonBattle', false);
        caap.SetDisplay('buttonGifting', false);
        caap.SetDisplay('buttonGiftQueue', false);
        switch (value) {
        case "Target List" :
            caap.SetDisplay('infoTargets1', true);
            caap.SetDisplay('buttonTargets', true);
            break;
        case "Battle Stats" :
            caap.SetDisplay('infoBattle', true);
            caap.SetDisplay('buttonBattle', true);
            break;
        case "User Stats" :
            caap.SetDisplay('userStats', true);
            break;
        case "Generals Stats" :
            caap.SetDisplay('generalsStats', true);
            break;
        case "Soldier Stats" :
            caap.SetDisplay('soldiersStats', true);
            break;
        case "Item Stats" :
            caap.SetDisplay('itemStats', true);
            break;
        case "Magic Stats" :
            caap.SetDisplay('magicStats', true);
            break;
        case "Gifting Stats" :
            caap.SetDisplay('giftStats', true);
            caap.SetDisplay('buttonGifting', true);
            break;
        case "Gift Queue" :
            caap.SetDisplay('giftQueue', true);
            caap.SetDisplay('buttonGiftQueue', true);
            break;
        case "Monster" :
            caap.SetDisplay('infoMonster', true);
            caap.SetDisplay('buttonMonster', true);
            break;
        default :
        }
    },

    refreshMonstersListener: function (e) {
        monster.flagFullReview();
    },

    liveFeedButtonListener: function (e) {
        utility.ClickAjax('army_news_feed.php');
    },

    clearTargetsButtonListener: function (e) {
        caap.ReconRecordArray = [];
        caap.SaveRecon();
        caap.UpdateDashboard(true);
    },

    clearBattleButtonListener: function (e) {
        battle.clear();
        caap.UpdateDashboard(true);
    },

    clearGiftingButtonListener: function (e) {
        gifting.clear("history");
        caap.UpdateDashboard(true);
    },

    clearGiftQueueButtonListener: function (e) {
        gifting.clear("queue");
        caap.UpdateDashboard(true);
    },

    AddDBListener: function () {
        try {
            utility.log(1, "Adding listeners for caap_top");
            if (!$('#caap_DBDisplay').length) {
                caap.ReloadCastleAge();
            }

            $('#caap_DBDisplay').change(this.dbDisplayListener);
            $('#caap_refreshMonsters').click(this.refreshMonstersListener);
            $('#caap_liveFeed').click(this.liveFeedButtonListener);
            $('#caap_clearTargets').click(this.clearTargetsButtonListener);
            $('#caap_clearBattle').click(this.clearBattleButtonListener);
            $('#caap_clearGifting').click(this.clearGiftingButtonListener);
            $('#caap_clearGiftQueue').click(this.clearGiftQueueButtonListener);
            utility.log(8, "Listeners added for caap_top");
            return true;
        } catch (err) {
            utility.error("ERROR in AddDBListener: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          EVENT LISTENERS
    // Watch for changes and update the controls
    /////////////////////////////////////////////////////////////////////

    SetDisplay: function (idName, setting) {
        try {
            if (setting === true) {
                $('#caap_' + idName).css('display', 'block');
            } else {
                $('#caap_' + idName).css('display', 'none');
            }

            return true;
        } catch (err) {
            utility.error("ERROR in SetDisplay: " + err);
            return false;
        }
    },

    CheckBoxListener: function (e) {
        try {
            var idName        = e.target.id.replace(/caap_/i, ''),
                DocumentTitle = '',
                d             = '';

            utility.log(1, "Change: setting '" + idName + "' to ", e.target.checked);
            config.setItem(idName, e.target.checked);
            if (e.target.className) {
                caap.SetDisplay(e.target.className, e.target.checked);
            }

            switch (idName) {
            case "AutoStatAdv" :
                utility.log(9, "AutoStatAdv");
                if (e.target.checked) {
                    caap.SetDisplay('Status_Normal', false);
                    caap.SetDisplay('Status_Adv', true);
                } else {
                    caap.SetDisplay('Status_Normal', true);
                    caap.SetDisplay('Status_Adv', false);
                }

                state.setItem("statsMatch", true);
                break;
            case "HideAds" :
                utility.log(9, "HideAds");
                if (e.target.checked) {
                    $('.UIStandardFrame_SidebarAds').css('display', 'none');
                } else {
                    $('.UIStandardFrame_SidebarAds').css('display', 'block');
                }

                break;
            case "BannerDisplay" :
                utility.log(9, "BannerDisplay");
                if (e.target.checked) {
                    $('#caap_BannerHide').css('display', 'block');
                } else {
                    $('#caap_BannerHide').css('display', 'none');
                }

                break;
            case "IgnoreBattleLoss" :
                utility.log(9, "IgnoreBattleLoss");
                if (e.target.checked) {
                    utility.log(1, "Ignore Battle Losses has been enabled.");
                }

                break;
            case "SetTitle" :
            case "SetTitleAction" :
            case "SetTitleName" :
                utility.log(9, idName);
                if (e.target.checked) {
                    if (config.getItem('SetTitleAction', false)) {
                        d = $('#caap_activity_mess').html();
                        if (d) {
                            DocumentTitle += d.replace("Activity: ", '') + " - ";
                        }
                    }

                    if (config.getItem('SetTitleName', false)) {
                        DocumentTitle += caap.stats.PlayerName + " - ";
                    }

                    document.title = DocumentTitle + global.documentTitle;
                } else {
                    document.title = global.documentTitle;
                }

                break;
            case "unlockMenu" :
                utility.log(9, "unlockMenu");
                if (e.target.checked) {
                    $(":input[id^='caap_']").attr({disabled: true});
                    caap.caapDivObject.css('cursor', 'move').draggable({
                        stop: function () {
                            caap.SaveControlXY();
                        }
                    });

                    caap.caapTopObject.css('cursor', 'move').draggable({
                        stop: function () {
                            caap.SaveDashboardXY();
                        }
                    });
                } else {
                    caap.caapDivObject.css('cursor', '').draggable("destroy");
                    caap.caapTopObject.css('cursor', '').draggable("destroy");
                    $(":input[id^='caap_']").attr({disabled: false});
                }

                break;
            case "AutoElite" :
                utility.log(9, "AutoElite");
                schedule.setItem('AutoEliteGetList', 0);
                schedule.setItem('AutoEliteReqNext', 0);
                state.setItem('AutoEliteEnd', '');
                state.setItem("MyEliteTodo", []);
                if (!state.getItem('FillArmy', false)) {
                    state.setItem(caap.friendListType.giftc.name + 'Requested', false);
                    state.setItem(caap.friendListType.giftc.name + 'Responded', []);
                }

                break;
            case "AchievementMode" :
                utility.log(9, "AchievementMode");
                monster.flagReview();
                break;
            case "StatSpendAll" :
                state.setItem("statsMatch", true);
                state.setItem("autoStatRuleLog", true);
                break;
            default :
            }

            return true;
        } catch (err) {
            utility.error("ERROR in CheckBoxListener: " + err);
            return false;
        }
    },

    TextBoxListener: function (e) {
        try {
            var idName = e.target.id.replace(/caap_/i, '');

            utility.log(1, 'Change: setting "' + idName + '" to ', String(e.target.value));
            if (/Style+/.test(idName)) {
                switch (idName) {
                case "StyleBackgroundLight" :
                    if (e.target.value.substr(0, 1) !== '#') {
                        e.target.value = '#' + e.target.value;
                    }

                    state.setItem("CustStyleBackgroundLight", e.target.value);
                    break;
                case "StyleBackgroundDark" :
                    if (e.target.value.substr(0, 1) !== '#') {
                        e.target.value = '#' + e.target.value;
                    }

                    state.setItem("CustStyleBackgroundDark", e.target.value);
                    break;
                default :
                }
            } else if (/AttrValue+/.test(idName)) {
                state.setItem("statsMatch", true);
            }

            config.setItem(idName, String(e.target.value));
            return true;
        } catch (err) {
            utility.error("ERROR in TextBoxListener: " + err);
            return false;
        }
    },

    NumberBoxListener: function (e) {
        try {
            var idName = e.target.id.replace(/caap_/i, '');

            utility.log(1, 'Change: setting "' + idName + '" to ', parseFloat(e.target.value) || '');
            if (/Style+/.test(idName)) {
                switch (idName) {
                case "StyleOpacityLight" :
                    state.setItem("CustStyleOpacityLight", e.target.value);
                    break;
                case "StyleOpacityDark" :
                    state.setItem("CustStyleOpacityDark", e.target.value);
                    break;
                default :
                }
            } else if (/AttrValue+/.test(idName)) {
                state.setItem("statsMatch", true);
            } else if (/MaxToFortify/.test(idName)) {
                monster.flagFullReview();
            } else if (/Chain/.test(idName)) {
                state.getItem('BattleChainId', 0);
            }

            config.setItem(idName, parseFloat(e.target.value) || '');
            return true;
        } catch (err) {
            utility.error("ERROR in NumberBoxListener: " + err);
            return false;
        }
    },

    DropBoxListener: function (e) {
        try {
            if (e.target.selectedIndex > 0) {
                var idName = e.target.id.replace(/caap_/i, ''),
                    value  = e.target.options[e.target.selectedIndex].value,
                    title  = e.target.options[e.target.selectedIndex].title;

                utility.log(1, 'Change: setting "' + idName + '" to "' + value + '" with title "' + title + '"');
                config.setItem(idName, value);
                e.target.title = title;
                if (idName === 'WhenQuest' || idName === 'WhenBattle' || idName === 'WhenMonster' || idName === 'LevelUpGeneral') {
                    caap.SetDisplay(idName + 'Hide', (value !== 'Never'));
                    if (idName === 'WhenBattle' || idName === 'WhenMonster') {
                        caap.SetDisplay(idName + 'XStamina', (value === 'At X Stamina'));
                        caap.SetDisplay('WhenBattleStayHidden1', ((config.getItem('WhenBattle', 'Never') === 'Stay Hidden' && config.getItem('WhenMonster', 'Never') !== 'Stay Hidden')));
                        if (idName === 'WhenBattle') {
                            if (value === 'Never') {
                                caap.SetDivContent('battle_mess', 'Battle off');
                            } else {
                                caap.SetDivContent('battle_mess', '');
                            }
                        } else if (idName === 'WhenMonster') {
                            if (value === 'Never') {
                                caap.SetDivContent('monster_mess', 'Monster off');
                            } else {
                                caap.SetDivContent('monster_mess', '');
                            }
                        }
                    }

                    if (idName === 'WhenQuest') {
                        caap.SetDisplay(idName + 'XEnergy', (value === 'At X Energy'));
                    }
                } else if (idName === 'QuestArea' || idName === 'QuestSubArea' || idName === 'WhyQuest') {
                    //gm.setItem('AutoQuest', '');
                    state.setItem('AutoQuest', caap.newAutoQuest());
                    caap.ClearAutoQuest();
                    if (idName === 'QuestArea') {
                        switch (value) {
                        case "Quest" :
                            $("#trQuestSubArea").css('display', 'table-row');
                            caap.ChangeDropDownList('QuestSubArea', caap.landQuestList);
                            break;
                        case "Demi Quests" :
                            $("#trQuestSubArea").css('display', 'table-row');
                            caap.ChangeDropDownList('QuestSubArea', caap.demiQuestList);
                            break;
                        case "Atlantis" :
                            $("#trQuestSubArea").css('display', 'table-row');
                            caap.ChangeDropDownList('QuestSubArea', caap.atlantisQuestList);
                            break;
                        default :
                        }
                    }
                } else if (idName === 'BattleType') {
                    state.getItem('BattleChainId', 0);
                } else if (idName === 'TargetType') {
                    state.getItem('BattleChainId', 0);
                    switch (value) {
                    case "Freshmeat" :
                        caap.SetDisplay('FreshmeatSub', true);
                        caap.SetDisplay('UserIdsSub', false);
                        caap.SetDisplay('RaidSub', false);
                        break;
                    case "Userid List" :
                        caap.SetDisplay('FreshmeatSub', false);
                        caap.SetDisplay('UserIdsSub', true);
                        caap.SetDisplay('RaidSub', false);
                        break;
                    case "Raid" :
                        caap.SetDisplay('FreshmeatSub', true);
                        caap.SetDisplay('UserIdsSub', false);
                        caap.SetDisplay('RaidSub', true);
                        break;
                    default :
                        caap.SetDisplay('FreshmeatSub', true);
                        caap.SetDisplay('UserIdsSub', false);
                        caap.SetDisplay('RaidSub', false);
                    }
                } else if (/Attribute?/.test(idName)) {
                    state.setItem("statsMatch", true);
                } else if (idName === 'DisplayStyle') {
                    caap.SetDisplay(idName + 'Hide', (value === 'Custom'));
                    switch (value) {
                    case "CA Skin" :
                        config.setItem("StyleBackgroundLight", "#E0C691");
                        config.setItem("StyleBackgroundDark", "#B09060");
                        config.setItem("StyleOpacityLight", 1);
                        config.setItem("StyleOpacityDark", 1);
                        break;
                    case "None" :
                        config.setItem("StyleBackgroundLight", "white");
                        config.setItem("StyleBackgroundDark", "white");
                        config.setItem("StyleOpacityLight", 1);
                        config.setItem("StyleOpacityDark", 1);
                        break;
                    case "Custom" :
                        config.setItem("StyleBackgroundLight", state.getItem("CustStyleBackgroundLight", "#E0C691"));
                        config.setItem("StyleBackgroundDark", state.getItem("CustStyleBackgroundDark", "#B09060"));
                        config.setItem("StyleOpacityLight", state.getItem("CustStyleOpacityLight", 1));
                        config.setItem("StyleOpacityDark", state.getItem("CustStyleOpacityDark", 1));
                        break;
                    default :
                        config.setItem("StyleBackgroundLight", "#efe");
                        config.setItem("StyleBackgroundDark", "#fee");
                        config.setItem("StyleOpacityLight", 1);
                        config.setItem("StyleOpacityDark", 1);
                    }

                    caap.caapDivObject.css({
                        background: config.getItem('StyleBackgroundDark', '#fee'),
                        opacity: config.getItem('StyleOpacityDark', 1)
                    });

                    caap.caapTopObject.css({
                        background: config.getItem('StyleBackgroundDark', '#fee'),
                        opacity: config.getItem('StyleOpacityDark', 1)
                    });
                }
            }

            return true;
        } catch (err) {
            utility.error("ERROR in DropBoxListener: " + err);
            return false;
        }
    },

    TextAreaListener: function (e) {
        try {
            var idName = e.target.id.replace(/caap_/i, '');
            var value = e.target.value;
            utility.log(1, 'Change: setting "' + idName + '" to ', value);
            if (idName === 'orderbattle_monster' || idName === 'orderraid') {
                monster.flagFullReview();
            } else if (idName === 'BattleTargets') {
                state.getItem('BattleChainId', 0);
            }

            caap.SaveBoxText(idName);
            return true;
        } catch (err) {
            utility.error("ERROR in TextAreaListener: " + err);
            return false;
        }
    },

    PauseListener: function (e) {
        $('#caap_div').css({
            'background': config.getItem('StyleBackgroundDark', '#fee'),
            'opacity': '1',
            'z-index': '3'
        });

        $('#caap_top').css({
            'background': config.getItem('StyleBackgroundDark', '#fee'),
            'opacity': '1'
        });

        $('#caapPaused').css('display', 'block');
        state.setItem('caapPause', 'block');
    },

    RestartListener: function (e) {
        $('#caapPaused').css('display', 'none');
        $('#caap_div').css({
            'background': config.getItem('StyleBackgroundLight', '#efe'),
            'opacity': config.getItem('StyleOpacityLight', 1),
            'z-index': state.getItem('caap_div_zIndex', '2'),
            'cursor': ''
        });

        $('#caap_top').css({
            'background': config.getItem('StyleBackgroundLight', '#efe'),
            'opacity': config.getItem('StyleOpacityLight', 1),
            'z-index': state.getItem('caap_top_zIndex', '1'),
            'cursor': ''
        });

        $(":input[id*='caap_']").attr({disabled: false});
        $('#unlockMenu').attr('checked', false);
        state.setItem('caapPause', 'none');
        state.setItem('ReleaseControl', true);
        state.setItem('resetselectMonster', true);
        caap.waitingForDomLoad = false;
    },

    ResetMenuLocationListener: function (e) {
        state.deleteItem('caap_div_menuLeft');
        state.deleteItem('caap_div_menuTop');
        state.deleteItem('caap_div_zIndex');
        caap.controlXY.x = '';
        caap.controlXY.y = $(caap.controlXY.selector).offset().top;
        var caap_divXY = caap.GetControlXY(true);
        caap.caapDivObject.css({
            'cursor' : '',
            'z-index' : '2',
            'top' : caap_divXY.y + 'px',
            'left' : caap_divXY.x + 'px'
        });

        state.deleteItem('caap_top_menuLeft');
        state.deleteItem('caap_top_menuTop');
        state.deleteItem('caap_top_zIndex');
        caap.dashboardXY.x = '';
        caap.dashboardXY.y = $(caap.dashboardXY.selector).offset().top - 10;
        var caap_topXY = caap.GetDashboardXY(true);
        caap.caapTopObject.css({
            'cursor' : '',
            'z-index' : '1',
            'top' : caap_topXY.y + 'px',
            'left' : caap_topXY.x + 'px'
        });

        $(":input[id^='caap_']").attr({disabled: false});
    },

    FoldingBlockListener: function (e) {
        try {
            var subId = e.target.id.replace(/_Switch/i, ''),
                subDiv = document.getElementById(subId);

            if (subDiv.style.display === "block") {
                utility.log(2, 'Folding: ', subId);
                subDiv.style.display = "none";
                e.target.innerHTML = e.target.innerHTML.replace(/-/, '+');
                state.setItem('Control_' + subId.replace(/caap_/i, ''), "none");
            } else {
                utility.log(2, 'Unfolding: ', subId);
                subDiv.style.display = "block";
                e.target.innerHTML = e.target.innerHTML.replace(/\+/, '-');
                state.setItem('Control_' + subId.replace(/caap_/i, ''), "block");
            }

            return true;
        } catch (err) {
            utility.error("ERROR in FoldingBlockListener: " + err);
            return false;
        }
    },

    whatClickedURLListener: function (event) {
        var obj = event.target;
        while (obj && !obj.href) {
            obj = obj.parentNode;
        }

        if (obj && obj.href) {
            state.setItem('clickUrl', obj.href);
            //utility.log(9, 'globalContainer', obj.href);
        } else {
            if (obj && !obj.href) {
                utility.warn('whatClickedURLListener globalContainer no href', obj);
            }
        }
    },

    whatFriendBox: function (event) {
        utility.log(9, 'whatFriendBox', event);
        var obj    = event.target,
            userID = [],
            txt    = '';

        while (obj && !obj.id) {
            obj = obj.parentNode;
        }

        if (obj && obj.id) {
            //utility.log(9, 'globalContainer', obj.onclick);
            userID = obj.onclick.toString().match(/friendKeepBrowse\('([0-9]+)'/);
            if (userID && userID.length === 2) {
                txt = "?casuser=" + userID[1];
            }

            state.setItem('clickUrl', 'http://apps.facebook.com/castle_age/keep.php' + txt);
        }

        //utility.log(9, 'globalContainer', obj.id, txt);
    },

    windowResizeListener: function (e) {
        if (window.location.href.indexOf('castle_age')) {
            var caap_divXY = caap.GetControlXY();
            caap.caapDivObject.css('left', caap_divXY.x + 'px');
            var caap_topXY = caap.GetDashboardXY();
            caap.caapTopObject.css('left', caap_topXY.x + 'px');
        }
    },

    targetList: [
        "app_body",
        "index",
        "keep",
        "generals",
        "battle_monster",
        "battle",
        "battlerank",
        "battle_train",
        "arena",
        "quests",
        "raid",
        "symbolquests",
        "alchemy",
        "goblin_emp",
        "soldiers",
        "item",
        "land",
        "magic",
        "oracle",
        "symbols",
        "treasure_chest",
        "gift",
        "apprentice",
        "news",
        "friend_page",
        "party",
        "comments",
        "army",
        "army_news_feed",
        "army_reqs",
        "guild",
        "guild_panel",
        "guild_current_battles"
    ],

    AddListeners: function () {
        try {
            utility.log(1, "Adding listeners for caap_div");
            if ($('#caap_div').length === 0) {
                throw "Unable to find div for caap_div";
            }

            $('#caap_div input:checkbox[id^="caap_"]').change(this.CheckBoxListener);
            $('#caap_div input[data-subtype="text"]').change(this.TextBoxListener);
            $('#caap_div input[data-subtype="number"]').change(this.NumberBoxListener);
            $('#unlockMenu').change(this.CheckBoxListener);
            $('#caap_div select[id^="caap_"]').change(this.DropBoxListener);
            $('#caap_div textarea[id^="caap_"]').change(this.TextAreaListener);
            $('#caap_div a[id^="caap_Switch"]').click(this.FoldingBlockListener);
            $('#caap_FillArmy').click(function (e) {
                state.setItem("FillArmy", true);
                state.setItem("ArmyCount", 0);
                state.setItem('FillArmyList', []);
                state.setItem(caap.friendListType.giftc.name + 'Responded', []);
                state.setItem(caap.friendListType.facebook.name + 'Responded', false);

            });

            $('#caap_StartedColorSelect').click(function (e) {
                var display = 'none';
                if ($('#caap_ColorSelectorDiv1').css('display') === 'none') {
                    display = 'block';
                }

                $('#caap_ColorSelectorDiv1').css('display', display);
            });

            $('#caap_StopedColorSelect').click(function (e) {
                var display = 'none';
                if ($('#caap_ColorSelectorDiv2').css('display') === 'none') {
                    display = 'block';
                }

                $('#caap_ColorSelectorDiv2').css('display', display);
            });

            $('#caap_ResetMenuLocation').click(this.ResetMenuLocationListener);
            $('#caap_resetElite').click(function (e) {
                schedule.setItem('AutoEliteGetList', 0);
                schedule.setItem('AutoEliteReqNext', 0);
                state.setItem('AutoEliteEnd', '');
                if (!state.getItem('FillArmy', false)) {
                    state.setItem(caap.friendListType.giftc.name + 'Requested', false);
                    state.setItem(caap.friendListType.giftc.name + 'Responded', []);
                }
            });

            $('#caapRestart').click(this.RestartListener);
            $('#caap_control').mousedown(this.PauseListener);
            $('#stopAutoQuest').click(function (e) {
                utility.log(1, 'Change: setting stopAutoQuest and go to Manual');
                caap.ManualAutoQuest();
            });

            if ($('#app46755028429_globalContainer').length === 0) {
                throw 'Global Container not found';
            }

            // Fires when CAAP navigates to new location
            $('#app46755028429_globalContainer').find('a').bind('click', this.whatClickedURLListener);
            $('#app46755028429_globalContainer').find("div[id*='app46755028429_friend_box_']").bind('click', this.whatFriendBox);

            $('#app46755028429_globalContainer').bind('DOMNodeInserted', function (event) {
                var targetStr = event.target.id.replace('app46755028429_', '');
                // Uncomment this to see the id of domNodes that are inserted

                /*
                if (event.target.id && !event.target.id.match(/globalContainer/) && !event.target.id.match(/time/)) {
                    caap.SetDivContent('debug2_mess', targetStr);
                    alert(event.target.id);
                }
                */

                if ($.inArray(targetStr, caap.targetList) !== -1) {
                    utility.log(9, "Refreshing DOM Listeners", event.target.id);
                    caap.waitingForDomLoad = false;
                    $('#app46755028429_globalContainer').find('a').unbind('click', caap.whatClickedURLListener).bind('click', caap.whatClickedURLListener);
                    $('#app46755028429_globalContainer').find("div[id*='app46755028429_friend_box_']").unbind('click', caap.whatFriendBox).bind('click', caap.whatFriendBox);
                    window.setTimeout(function () {
                        caap.CheckResults();
                    }, 100);
                }

                // Income timer
                if (targetStr === "gold_time_value") {
                    var payTimer = $(event.target).text().match(/([0-9]+):([0-9]+)/);
                    utility.log(10, "gold_time_value", payTimer);
                    if (payTimer && payTimer.length === 3) {
                        caap.stats.gold.payTime.ticker = payTimer[0];
                        caap.stats.gold.payTime.minutes = parseInt(payTimer[1], 10);
                        caap.stats.gold.payTime.seconds = parseInt(payTimer[2], 10);
                    }
                }

                // Energy
                if (targetStr === "energy_current_value") {
                    var energy = parseInt($(event.target).text(), 10),
                        tempE  = null,
                        tempET = null;

                    utility.log(9, "energy_current_value", energy);
                    if (utility.isNum(energy)) {
                        tempE = caap.GetStatusNumbers(energy + "/" + caap.stats.energy.max);
                        tempET = caap.GetStatusNumbers(energy + "/" + caap.stats.energyT.max);
                        if (tempE && tempET) {
                            caap.stats.energy = tempE;
                            caap.stats.energyT = tempET;
                        } else {
                            utility.warn("Unable to get energy levels");
                        }
                    }
                }

                // Health
                if (targetStr === "health_current_value") {
                    var health = parseInt($(event.target).text(), 10),
                        tempH  = null,
                        tempHT = null;

                    utility.log(9, "health_current_value", health);
                    if (utility.isNum(health)) {
                        tempH = caap.GetStatusNumbers(health + "/" + caap.stats.health.max);
                        tempHT = caap.GetStatusNumbers(health + "/" + caap.stats.healthT.max);
                        if (tempH && tempHT) {
                            caap.stats.health = tempH;
                            caap.stats.healthT = tempHT;
                        } else {
                            utility.warn("Unable to get health levels");
                        }
                    }
                }

                // Stamina
                if (targetStr === "stamina_current_value") {
                    var stamina = parseInt($(event.target).text(), 10),
                        tempS   = null,
                        tempST  = null;

                    utility.log(9, "stamina_current_value", stamina);
                    if (utility.isNum(stamina)) {
                        tempS = caap.GetStatusNumbers(stamina + "/" + caap.stats.stamina.max);
                        tempST = caap.GetStatusNumbers(stamina + "/" + caap.stats.staminaT.max);
                        if (tempS) {
                            caap.stats.stamina = tempS;
                            caap.stats.staminaT = tempST;
                        } else {
                            utility.warn("Unable to get stamina levels");
                        }
                    }
                }

                // Reposition the dashboard
                if (event.target.id === caap.dashboardXY.selector) {
                    caap.caapTopObject.css('left', caap.GetDashboardXY().x + 'px');
                }
            });

            $(window).unbind('resize', this.windowResizeListener).bind('resize', this.windowResizeListener);

            utility.log(8, "Listeners added for caap_div");
            return true;
        } catch (err) {
            utility.error("ERROR in AddListeners: " + err);
            return false;
        }
    },


    /////////////////////////////////////////////////////////////////////
    //                          CHECK RESULTS
    // Called each iteration of main loop, this does passive checks for
    // results to update other functions.
    /////////////////////////////////////////////////////////////////////

    SetCheckResultsFunction: function (resultsFunction) {
        schedule.setItem('SetResultsFunctionTimer', 20);
        state.setItem('ResultsFunction', resultsFunction);
    },

    pageList: {
        'index': {
            signaturePic: 'gif',
            CheckResultsFunction: 'CheckResults_index'
        },
        'battle_monster': {
            signaturePic: 'tab_monster_list_on.gif',
            CheckResultsFunction: 'CheckResults_fightList',
            subpages: ['onMonster']
        },
        'onMonster': {
            signaturePic: 'tab_monster_active.gif',
            CheckResultsFunction: 'CheckResults_viewFight'
        },
        'raid': {
            signaturePic: 'tab_raid_on.gif',
            CheckResultsFunction: 'CheckResults_fightList',
            subpages: ['onRaid']
        },
        'onRaid': {
            signaturePic: 'raid_map',
            CheckResultsFunction : 'CheckResults_viewFight'
        },
        'land': {
            signaturePic: 'tab_land_on.gif',
            CheckResultsFunction: 'CheckResults_land'
        },
        'generals': {
            signaturePic: 'tab_generals_on.gif',
            CheckResultsFunction: 'CheckResults_generals'
        },
        'quests': {
            signaturePic: 'tab_quest_on.gif',
            CheckResultsFunction: 'CheckResults_quests'
        },
        'symbolquests': {
            signaturePic: 'demi_quest_on.gif',
            CheckResultsFunction: 'CheckResults_quests'
        },
        'monster_quests': {
            signaturePic: 'tab_atlantis_on.gif',
            CheckResultsFunction: 'CheckResults_quests'
        },
        'gift_accept': {
            signaturePic: 'gif',
            CheckResultsFunction: 'CheckResults_gift_accept'
        },
        'army': {
            signaturePic: 'invite_on.gif',
            CheckResultsFunction: 'CheckResults_army'
        },
        'keep': {
            signaturePic: 'tab_stats_on.gif',
            CheckResultsFunction: 'CheckResults_keep'
        },
        'oracle': {
            signaturePic: 'oracle_on.gif',
            CheckResultsFunction: 'CheckResults_oracle'
        },
        'battlerank': {
            signaturePic: 'tab_battle_rank_on.gif',
            CheckResultsFunction: 'CheckResults_battlerank'
        },
        'war_rank': {
            signaturePic: 'tab_war_on.gif',
            CheckResultsFunction: 'CheckResults_war_rank'
        },
        'achievements': {
            signaturePic: 'tab_achievements_on.gif',
            CheckResultsFunction: 'CheckResults_achievements'
        },
        'battle': {
            signaturePic: 'battle_on.gif',
            CheckResultsFunction: 'CheckResults_battle'
        },
        'soldiers': {
            signaturePic: 'tab_soldiers_on.gif',
            CheckResultsFunction: 'CheckResults_soldiers'
        },
        'item': {
            signaturePic: 'tab_black_smith_on.gif',
            CheckResultsFunction: 'CheckResults_item'
        },
        'magic': {
            signaturePic: 'tab_magic_on.gif',
            CheckResultsFunction: 'CheckResults_magic'
        },
        'gift': {
            signaturePic: 'tab_gifts_on.gif',
            CheckResultsFunction: 'CheckResults_gift'
        },
        'view_class_progress': {
            signaturePic: 'nm_class_whole_progress_bar.jpg',
            CheckResultsFunction: 'CheckResults_view_class_progress'
        },
        'guild_current_battles': {
            signaturePic: 'tab_guild_current_battles_on.gif',
            CheckResultsFunction: 'CheckResults_guild_current_battles'
        }
    },

    AddExpDisplay: function () {
        try {
            var expDiv = $("#app46755028429_st_2_5 strong"),
                enlDiv = null;

            if (!expDiv.length) {
                utility.warn("Unable to get experience array");
                return false;
            }

            enlDiv = $("#caap_enl");
            if (enlDiv.length) {
                utility.log(8, "Experience to Next Level already displayed. Updating.");
                enlDiv.html(this.stats.exp.dif);
            } else {
                utility.log(8, "Prepending Experience to Next Level to display");
                expDiv.prepend("(<span id='caap_enl' style='color:red'>" + (this.stats.exp.dif) + "</span>) ");
            }

            this.SetDivContent('exp_mess', "Experience to next level: " + this.stats.exp.dif);
            return true;
        } catch (err) {
            utility.error("ERROR in AddExpDisplay: " + err);
            return false;
        }
    },

    CheckResults: function () {
        try {
            // Check page to see if we should go to a page specific check function
            // todo find a way to verify if a function exists, and replace the array with a check_functionName exists check
            if (!schedule.check('CheckResultsTimer')) {
                return false;
            }

            this.pageLoadOK = this.GetStats();

            this.AddExpDisplay();
            this.SetDivContent('level_mess', 'Expected next level: ' + schedule.FormatTime(new Date(this.stats.indicators.enl)));
            if ((config.getItem('DemiPointsFirst', false) && config.getItem('WhenMonster', 'Never') !== 'Never') || config.getItem('WhenBattle', 'Never') === 'Demi Points Only') {
                if (state.getItem('DemiPointsDone', true)) {
                    this.SetDivContent('demipoint_mess', 'Daily Demi Points: Done');
                } else {
                    if (config.getItem('DemiPointsFirst', false) && config.getItem('WhenMonster', 'Never') !== 'Never') {
                        this.SetDivContent('demipoint_mess', 'Daily Demi Points: First');
                    } else {
                        this.SetDivContent('demipoint_mess', 'Daily Demi Points: Only');
                    }
                }
            } else {
                this.SetDivContent('demipoint_mess', '');
            }

            if (schedule.display('BlessingTimer')) {
                if (schedule.check('BlessingTimer')) {
                    this.SetDivContent('demibless_mess', 'Demi Blessing = none');
                } else {
                    this.SetDivContent('demibless_mess', 'Next Demi Blessing: ' + schedule.display('BlessingTimer'));
                }
            }

            schedule.setItem('CheckResultsTimer', 1);
            state.getItem('page', '');
            state.setItem('pageUserCheck', '');
            var pageUrl = state.getItem('clickUrl', '');
            utility.log(9, "Page url", pageUrl);
            if (pageUrl) {
                var pageUserCheck = pageUrl.match(/user=([0-9]+)/);
                utility.log(6, "pageUserCheck", pageUserCheck);
                if (pageUserCheck) {
                    state.setItem('pageUserCheck', pageUserCheck[1]);
                }
            }

            var page = 'None',
                sigImage = '';
            if (pageUrl.match(new RegExp("\/[^\/]+.php", "i"))) {
                page = pageUrl.match(new RegExp("\/[^\/]+.php", "i"))[0].replace('/', '').replace('.php', '');
                utility.log(9, "Page match", page);
            }

            if (this.pageList[page]) {
                if (page === "quests" && this.stats.level < 8) {
                    sigImage = "quest_back_1.jpg";
                } else {
                    sigImage = this.pageList[page].signaturePic;
                }

                if ($("img[src*='" + sigImage + "']").length) {
                    state.setItem('page', page);
                    utility.log(9, "Page set value", page);
                }

                if (this.pageList[page].subpages) {
                    this.pageList[page].subpages.forEach(function (subpage) {
                        if ($("img[src*='" + caap.pageList[subpage].signaturePic + "']").length) {
                            page = state.setItem('page', subpage);
                            utility.log(9, "Page pubpage", page);
                        }
                    });
                }
            }

            var resultsDiv = $("span[class*='result_body']"),
                resultsText = '';

            if (resultsDiv && resultsDiv.length) {
                resultsText = $.trim(resultsDiv.text());
            }

            if (page && this.pageList[page]) {
                utility.log(1, 'Checking results for', page);
                if (typeof this[this.pageList[page].CheckResultsFunction] === 'function') {
                    this[this.pageList[page].CheckResultsFunction](resultsText);
                } else {
                    utility.warn('Check Results function not found', this.pageList[page]);
                }
            } else {
                utility.log(1, 'No results check defined for', page);
            }

            monster.select();
            this.UpdateDashboard();
            if (general.List.length <= 2) {
                schedule.setItem("generals", 0);
                schedule.setItem("allGenerals", 0);
                this.CheckGenerals();
            }

            if (this.stats.level < 10) {
                this.battlePage = 'battle_train,battle_off';
            } else {
                this.battlePage = 'battle';
            }

            // Check for Elite Guard Add image
            if (!config.getItem('AutoEliteIgnore', false)) {
                if (utility.CheckForImage('elite_guard_add') && state.getItem('AutoEliteEnd', 'NoArmy') !== 'NoArmy') {
                    schedule.setItem('AutoEliteGetList', 0);
                }
            }

            // If set and still recent, go to the function specified in 'ResultsFunction'
            var resultsFunction = state.getItem('ResultsFunction', '');
            if ((resultsFunction) && !schedule.check('SetResultsFunctionTimer')) {
                this[resultsFunction](resultsText);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in CheckResults: " + err);
            return false;
        }
    },

    CheckResults_generals: function () {
        try {
            var currentGeneral = '',
                html           = '';

            general.GetGenerals();
            currentGeneral = general.GetEquippedStats();
            if (currentGeneral) {
                html = "<span title='Equipped Attack Power Index' style='font-size: 12px; font-weight: normal;'>EAPI:" + currentGeneral.eapi.toFixed(2) +
                       "</span> <span title='Equipped Defense Power Index' style='font-size: 12px; font-weight: normal;'>EDPI:" + currentGeneral.edpi.toFixed(2) +
                       "</span> <span title='Equipped Mean Power Index' style='font-size: 12px; font-weight: normal;'>EMPI:" + currentGeneral.empi.toFixed(2) + "</span>";
                $("#app46755028429_general_name_div_int").append(html);
            }

            schedule.setItem("generals", gm.getItem("CheckGenerals", 24, hiddenVar) * 3600, 300);
            return true;
        } catch (err) {
            utility.error("ERROR in CheckResults_generals: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          GET STATS
    // Functions that records all of base game stats, energy, stamina, etc.
    /////////////////////////////////////////////////////////////////////

    // text in the format '123/234'
    GetStatusNumbers: function (text) {
        try {
            var txtArr = [];

            if (text === '' || typeof text !== 'string') {
                throw "No text supplied for status numbers:" + text;
            }

            txtArr = text.match(/([0-9]+)\/([0-9]+)/);
            if (txtArr.length !== 3) {
                throw "Unable to match status numbers" + text;
            }

            return {
                num: parseInt(txtArr[1], 10),
                max: parseInt(txtArr[2], 10),
                dif: parseInt(txtArr[2], 10) - parseInt(txtArr[1], 10)
            };
        } catch (err) {
            utility.error("ERROR in GetStatusNumbers: " + err);
            return false;
        }
    },

    stats: {
        FBID       : 0,
        account    : '',
        PlayerName : '',
        level      : 0,
        army       : {
            actual : 0,
            capped : 0
        },
        generals   : {
            total  : 0,
            invade : 0
        },
        attack     : 0,
        defense    : 0,
        points     : {
            skill : 0,
            favor : 0
        },
        indicators : {
            bsi  : 0,
            lsi  : 0,
            sppl : 0,
            api  : 0,
            dpi  : 0,
            mpi  : 0,
            htl  : 0,
            hrtl : 0,
            enl  : new Date(2009, 1, 1).getTime()
        },
        gold : {
            cash    : 0,
            bank    : 0,
            total   : 0,
            income  : 0,
            upkeep  : 0,
            flow    : 0,
            payTime : {
                ticker  : '0:00',
                minutes : 0,
                seconds : 0
            }
        },
        rank : {
            battle       : 0,
            battlePoints : 0,
            war          : 0,
            warPoints    : 0
        },
        potions : {
            energy  : 0,
            stamina : 0
        },
        energy : {
            num : 0,
            max : 0,
            dif : 0
        },
        energyT : {
            num : 0,
            max : 0,
            dif : 0
        },
        health : {
            num : 0,
            max : 0,
            dif : 0
        },
        healthT : {
            num : 0,
            max : 0,
            dif : 0
        },
        stamina : {
            num : 0,
            max : 0,
            dif : 0
        },
        staminaT : {
            num : 0,
            max : 0,
            dif : 0
        },
        exp : {
            num : 0,
            max : 0,
            dif : 0
        },
        other : {
            qc  : 0,
            bww : 0,
            bwl : 0,
            te  : 0,
            tee : 0,
            wlr : 0,
            eer : 0
        },
        achievements : {
            battle : {
                invasions : {
                    won    : 0,
                    lost   : 0,
                    streak : 0,
                    ratio  : 0
                },
                duels : {
                    won    : 0,
                    lost   : 0,
                    streak : 0,
                    ratio  : 0
                }
            },
            monster : {
                gildamesh : 0,
                colossus  : 0,
                sylvanas  : 0,
                keira     : 0,
                legion    : 0,
                skaar     : 0,
                lotus     : 0,
                dragons   : 0,
                cronus    : 0,
                sieges    : 0,
                genesis   : 0,
                gehenna   : 0,
                aurelius  : 0
            },
            other : {
                alchemy : 0
            }
        },
        character : {
            warrior : {
                name    : 'Warrior',
                level   : 0,
                percent : 0
            },
            rogue : {
                name    : 'Rogue',
                level   : 0,
                percent : 0
            },
            mage : {
                name    : 'Mage',
                level   : 0,
                percent : 0
            },
            cleric : {
                name    : 'Cleric',
                level   : 0,
                percent : 0
            },
            warlock : {
                name    : 'Warlock',
                level   : 0,
                percent : 0
            },
            ranger : {
                name    : 'Ranger',
                level   : 0,
                percent : 0
            }
        }
    },

    LoadStats: function () {
        if (gm.getItem('stats.record', 'default') === 'default') {
            gm.setItem('stats.record', this.stats);
        } else {
            this.stats = gm.getItem('stats.record', this.stats);
        }

        utility.log(2, "Stats", this.stats);
        state.setItem("UserDashUpdate", true);
    },

    SaveStats: function () {
        gm.setItem('stats.record', this.stats);
        utility.log(2, "Stats", this.stats);
        state.setItem("UserDashUpdate", true);
    },

    GetStats: function () {
        try {
            var cashDiv        = null,
                energyDiv      = null,
                healthDiv      = null,
                staminaDiv     = null,
                expDiv         = null,
                levelDiv       = null,
                armyDiv        = null,
                pointsDiv      = null,
                passed         = true,
                temp           = null,
                tempT          = null,
                levelArray     = [],
                newLevel       = 0,
                newPoints      = 0,
                armyArray      = [],
                pointsArray    = [],
                xS             = 0,
                xE             = 0;

            utility.log(8, "Getting Gold, Energy, Health, Stamina and Experience");
            // gold
            cashDiv = $("#app46755028429_gold_current_value");
            if (cashDiv.length) {
                utility.log(8, 'Getting current cash value');
                temp = utility.NumberOnly(cashDiv.text());
                if (!isNaN(temp)) {
                    this.stats.gold.cash = temp;
                    this.stats.gold.total = this.stats.gold.bank + this.stats.gold.cash;
                } else {
                    utility.warn("Cash value is not a number", temp);
                    passed = false;
                }
            } else {
                utility.warn("Unable to get cashDiv");
                passed = false;
            }

            // energy
            energyDiv = $("#app46755028429_st_2_2");
            if (energyDiv.length) {
                utility.log(8, 'Getting current energy levels');
                tempT = this.GetStatusNumbers(energyDiv.text());
                temp = this.GetStatusNumbers(tempT.num + "/" + this.stats.energy.max);
                if (temp && tempT) {
                    this.stats.energy = temp;
                    this.stats.energyT = tempT;
                } else {
                    utility.warn("Unable to get energy levels");
                    passed = false;
                }
            } else {
                utility.warn("Unable to get energyDiv");
                passed = false;
            }

            // health
            healthDiv = $("#app46755028429_st_2_3");
            if (healthDiv.length) {
                utility.log(8, 'Getting current health levels');
                tempT = this.GetStatusNumbers(healthDiv.text());
                temp = this.GetStatusNumbers(tempT.num + "/" + this.stats.health.max);
                if (temp && tempT) {
                    this.stats.health = temp;
                    this.stats.healthT = tempT;
                } else {
                    utility.warn("Unable to get health levels");
                    passed = false;
                }
            } else {
                utility.warn("Unable to get healthDiv");
                passed = false;
            }

            // stamina
            staminaDiv = $("#app46755028429_st_2_4");
            if (staminaDiv.length) {
                utility.log(8, 'Getting current stamina values');
                tempT = this.GetStatusNumbers(staminaDiv.text());
                temp = this.GetStatusNumbers(tempT.num + "/" + this.stats.stamina.max);
                if (temp && tempT) {
                    this.stats.stamina = temp;
                    this.stats.staminaT = tempT;
                } else {
                    utility.warn("Unable to get stamina values");
                    passed = false;
                }
            } else {
                utility.warn("Unable to get staminaDiv");
                passed = false;
            }

            // experience
            expDiv = $("#app46755028429_st_2_5");
            if (expDiv.length) {
                utility.log(8, 'Getting current experience values');
                temp = this.GetStatusNumbers(expDiv.text());
                if (temp) {
                    this.stats.exp = temp;
                } else {
                    utility.warn("Unable to get experience values");
                    passed = false;
                }
            } else {
                utility.warn("Unable to get expDiv");
                passed = false;
            }

            // level
            levelDiv = $("#app46755028429_st_5");
            if (levelDiv.length) {
                levelArray = levelDiv.text().match(/Level: ([0-9]+)!/);
                if (levelArray && levelArray.length === 2) {
                    utility.log(8, 'Getting current level');
                    newLevel = parseInt(levelArray[1], 10);
                    if (newLevel > this.stats.level) {
                        utility.log(1, 'New level. Resetting Best Land Cost.');
                        state.setItem('BestLandCost', 0);
                        state.setItem('KeepLevelUpGeneral', true);
                        this.stats.level = newLevel;
                    }
                } else {
                    utility.warn('levelArray incorrect');
                    passed = false;
                }
            } else {
                utility.warn("Unable to get levelDiv");
                passed = false;
            }

            // army
            armyDiv = $("#app46755028429_main_bntp a[href*='army.php']");
            if (armyDiv.length) {
                armyArray = armyDiv.text().match(/My Army \(([0-9]+)\)/);
                if (armyArray && armyArray.length === 2) {
                    utility.log(8, 'Getting current army count');
                    this.stats.army.actual = parseInt(armyArray[1], 10);
                    temp = Math.min(this.stats.army.actual, 501);
                    if (temp >= 0 && temp <= 501) {
                        this.stats.army.capped = temp;
                    } else {
                        utility.warn("Army count not in limits");
                        passed = false;
                    }
                } else {
                    utility.warn('armyArray incorrect');
                    passed = false;
                }
            } else {
                utility.warn("Unable to get armyDiv");
                passed = false;
            }

            // upgrade points
            pointsDiv = $("#app46755028429_main_bntp a[href*='keep.php']");
            if (pointsDiv.length) {
                pointsArray = pointsDiv.text().match(/My Stats \(\+([0-9]+)\)/);
                if (pointsArray && pointsArray.length === 2) {
                    utility.log(8, 'Getting current upgrade points');
                    newPoints = parseInt(pointsArray[1], 10);
                    if (newPoints > this.stats.points.skill) {
                        utility.log(1, 'New points. Resetting AutoStat.');
                        state.setItem("statsMatch", true);
                    }

                    this.stats.points.skill = newPoints;
                } else {
                    utility.log(8, 'No upgrade points found');
                    this.stats.points.skill = 0;
                }
            } else {
                utility.warn("Unable to get pointsDiv");
                passed = false;
            }

            // Indicators: Hours To Level, Time Remaining To Level and Expected Next Level
            if (this.stats.exp) {
                utility.log(8, 'Calculating time to next level');
                xS = gm.getItem("expStaminaRatio", 2.4, hiddenVar);
                xE = state.getItem('AutoQuest', this.newAutoQuest()).expRatio || gm.getItem("expEnergyRatio", 1.4, hiddenVar);
                this.stats.indicators.htl = ((this.stats.level * 12.5) - (this.stats.stamina.max * xS) - (this.stats.energy.max * xE)) / (12 * (xS + xE));
                this.stats.indicators.hrtl = (this.stats.exp.dif - (this.stats.stamina.num * xS) - (this.stats.energy.num * xE)) / (12 * (xS + xE));
                this.stats.indicators.enl = new Date().getTime() + Math.ceil(this.stats.indicators.hrtl * 60 * 60 * 1000);
            } else {
                utility.warn('Could not calculate time to next level. Missing experience stats!');
                passed = false;
            }

            if (!passed)  {
                utility.log(8, 'Saving stats');
                this.SaveStats();
            }

            if (!passed && this.stats.energy.max === 0 && this.stats.health.max === 0 && this.stats.stamina.max === 0) {
                utility.alert("Paused as this account may have been disabled!");
                utility.warn("Paused as this account may have been disabled!", this.stats);
                this.PauseListener();
            }

            return passed;
        } catch (err) {
            utility.error("ERROR GetStats: " + err);
            return false;
        }
    },

    CheckResults_keep: function () {
        try {
            var rankImg        = null,
                warRankImg     = null,
                playerName     = null,
                moneyStored    = null,
                income         = null,
                upkeep         = null,
                energyPotions  = null,
                staminaPotions = null,
                otherStats     = null,
                energy         = null,
                stamina        = null,
                attack         = null,
                defense        = null,
                health         = null,
                statCont       = null,
                anotherEl      = null;

            if ($(".keep_attribute_section").length) {
                utility.log(8, "Getting new values from player keep");
                // rank
                rankImg = $("img[src*='gif/rank']");
                if (rankImg.length) {
                    rankImg = rankImg.attr("src").split('/');
                    this.stats.rank.battle = parseInt((rankImg[rankImg.length - 1].match(/rank([0-9]+)\.gif/))[1], 10);
                } else {
                    utility.warn('Using stored rank.');
                }

                // PlayerName
                playerName = $(".keep_stat_title_inc");
                if (playerName.length) {
                    this.stats.PlayerName = playerName.text().match(new RegExp("\"(.+)\","))[1];
                    state.setItem("PlayerName", this.stats.PlayerName);
                } else {
                    utility.warn('Using stored PlayerName.');
                }

                if (this.stats.level >= 100) {
                    // war rank
                    warRankImg = $("img[src*='war_rank_']");
                    if (warRankImg.length) {
                        warRankImg = warRankImg.attr("src").split('/');
                        this.stats.rank.war = parseInt((warRankImg[warRankImg.length - 1].match(/war_rank_([0-9]+)\.gif/))[1], 10);
                    } else {
                        utility.warn('Using stored warRank.');
                    }
                }

                statCont = $(".attribute_stat_container");
                if (statCont.length === 6) {
                    // Energy
                    energy = statCont.eq(0);
                    if (energy.length) {
                        this.stats.energy = this.GetStatusNumbers(this.stats.energyT.num + '/' + parseInt(energy.text().match(new RegExp("\\s*([0-9]+).*"))[1], 10));
                    } else {
                        utility.warn('Using stored energy value.');
                    }

                    // Stamina
                    stamina = statCont.eq(1);
                    if (stamina.length) {
                        this.stats.stamina = this.GetStatusNumbers(this.stats.staminaT.num + '/' + parseInt(stamina.text().match(new RegExp("\\s*([0-9]+).*"))[1], 10));
                    } else {
                        utility.warn('Using stored stamina value.');
                    }

                    if (this.stats.level >= 10) {
                        // Attack
                        attack = statCont.eq(2);
                        if (attack.length) {
                            this.stats.attack = parseInt(attack.text().match(new RegExp("\\s*([0-9]+).*"))[1], 10);
                        } else {
                            utility.warn('Using stored attack value.');
                        }

                        // Defense
                        defense = statCont.eq(3);
                        if (defense.length) {
                            this.stats.defense = parseInt(defense.text().match(new RegExp("\\s*([0-9]+).*"))[1], 10);
                        } else {
                            utility.warn('Using stored defense value.');
                        }
                    }

                    // Health
                    health = statCont.eq(4);
                    if (health.length) {
                        this.stats.health = this.GetStatusNumbers(this.stats.healthT.num + '/' + parseInt(health.text().match(new RegExp("\\s*([0-9]+).*"))[1], 10));
                    } else {
                        utility.warn('Using stored health value.');
                    }
                } else {
                    utility.warn("Can't find stats containers! Using stored stats values.");
                }

                // Check for Gold Stored
                moneyStored = $(".statsTB .money");
                if (moneyStored.length) {
                    this.stats.gold.bank = utility.NumberOnly(moneyStored.text());
                    this.stats.gold.total = this.stats.gold.bank + this.stats.gold.cash;
                    moneyStored.attr({
                        title         : "Click to copy value to retrieve",
                        style         : "color: blue;"
                    }).hover(
                        function () {
                            this.style.cursor = 'pointer';
                        },
                        function () {
                            this.style.cursor = 'default';
                        }
                    ).click(function () {
                        $("input[name='get_gold']").val(caap.stats.gold.bank);
                    });
                } else {
                    utility.warn('Using stored inStore.');
                }

                // Check for income
                income = $(".statsTB .positive:first");
                if (income.length) {
                    this.stats.gold.income = utility.NumberOnly(income.text());
                } else {
                    utility.warn('Using stored income.');
                }

                // Check for upkeep
                upkeep = $(".statsTB .negative");
                if (upkeep.length) {
                    this.stats.gold.upkeep = utility.NumberOnly(upkeep.text());
                } else {
                    utility.warn('Using stored upkeep.');
                }

                // Cash Flow
                this.stats.gold.flow = this.stats.gold.income - this.stats.gold.upkeep;

                // Energy potions
                energyPotions = $("img[title='Energy Potion']");
                if (energyPotions.length) {
                    this.stats.potions.energy = energyPotions.parent().next().text().replace(new RegExp("[^0-9\\.]", "g"), "");
                } else {
                    this.stats.potions.energy = 0;
                }

                // Stamina potions
                staminaPotions = $("img[title='Stamina Potion']");
                if (staminaPotions.length) {
                    this.stats.potions.stamina = staminaPotions.parent().next().text().replace(new RegExp("[^0-9\\.]", "g"), "");
                } else {
                    this.stats.potions.stamina = 0;
                }

                // Other stats
                // Quests Completed
                otherStats = $(".statsTB .keepTable1 tr:eq(0) td:last");
                if (otherStats.length) {
                    this.stats.other.qc = parseInt(otherStats.text(), 10);
                } else {
                    utility.warn('Using stored other.');
                }

                // Battles/Wars Won
                otherStats = $(".statsTB .keepTable1 tr:eq(1) td:last");
                if (otherStats.length) {
                    this.stats.other.bww = parseInt(otherStats.text(), 10);
                } else {
                    utility.warn('Using stored other.');
                }

                // Battles/Wars Lost
                otherStats = $(".statsTB .keepTable1 tr:eq(2) td:last");
                if (otherStats.length) {
                    this.stats.other.bwl = parseInt(otherStats.text(), 10);
                } else {
                    utility.warn('Using stored other.');
                }

                // Times eliminated
                otherStats = $(".statsTB .keepTable1 tr:eq(3) td:last");
                if (otherStats.length) {
                    this.stats.other.te = parseInt(otherStats.text(), 10);
                } else {
                    utility.warn('Using stored other.');
                }

                // Times you eliminated an enemy
                otherStats = $(".statsTB .keepTable1 tr:eq(4) td:last");
                if (otherStats.length) {
                    this.stats.other.tee = parseInt(otherStats.text(), 10);
                } else {
                    utility.warn('Using stored other.');
                }

                // Win/Loss Ratio (WLR)
                if (this.stats.other.bwl !== 0) {
                    this.stats.other.wlr = this.stats.other.bww / this.stats.other.bwl;
                } else {
                    this.stats.other.wlr = Infinity;
                }

                // Enemy Eliminated Ratio/Eliminated (EER)
                if (this.stats.other.tee !== 0) {
                    this.stats.other.eer = this.stats.other.tee / this.stats.other.te;
                } else {
                    this.stats.other.eer = Infinity;
                }

                // Indicators
                if (this.stats.level >= 10) {
                    this.stats.indicators.bsi = (this.stats.attack + this.stats.defense) / this.stats.level;
                    this.stats.indicators.lsi = (this.stats.energy.max + (2 * this.stats.stamina.max)) / this.stats.level;
                    this.stats.indicators.sppl = (this.stats.energy.max + (2 * this.stats.stamina.max) + this.stats.attack + this.stats.defense + this.stats.health.max - 122) / this.stats.level;
                    this.stats.indicators.api = (this.stats.attack + (this.stats.defense * 0.7));
                    this.stats.indicators.dpi = (this.stats.defense + (this.stats.attack * 0.7));
                    this.stats.indicators.mpi = ((this.stats.indicators.api + this.stats.indicators.dpi) / 2);
                }

                schedule.setItem("keep", gm.getItem("CheckKeep", 1, hiddenVar) * 3600, 300);
                this.SaveStats();
            } else {
                anotherEl = $("a[href*='keep.php?user=']");
                if (anotherEl && anotherEl.length) {
                    utility.log(1, "On another player's keep", anotherEl.attr("href").match(/user=([0-9]+)/)[1]);
                } else {
                    utility.warn("Attribute section not found and not identified as another player's keep!");
                }
            }

            return true;
        } catch (err) {
            utility.error("ERROR in CheckResults_keep: " + err);
            return false;
        }
    },

    CheckResults_oracle: function () {
        try {
            var favorDiv = null,
                text     = '',
                temp     = [],
                save     = false;

            favorDiv = $(".title_action");
            if (favorDiv.length) {
                text = favorDiv.text();
                temp = text.match(new RegExp("\\s*You have zero favor points!\\s*"));
                if (temp && temp.length === 1) {
                    utility.log(1, 'Got number of Favor Points.');
                    this.stats.points.favor = 0;
                    save = true;
                } else {
                    temp = text.match(new RegExp("\\s*You have a favor point!\\s*"));
                    if (temp && temp.length === 1) {
                        utility.log(1, 'Got number of Favor Points.');
                        this.stats.points.favor = 1;
                        save = true;
                    } else {
                        temp = text.match(new RegExp("\\s*You have ([0-9]+) favor points!\\s*"));
                        if (temp && temp.length === 2) {
                            utility.log(1, 'Got number of Favor Points.');
                            this.stats.points.favor = parseInt(temp[1], 10);
                            save = true;
                        } else {
                            utility.warn('Favor Points RegExp not matched.');
                        }
                    }
                }
            } else {
                utility.warn('Favor Points div not found.');
            }

            if (save) {
                this.SaveStats();
            }

            schedule.setItem("oracle", gm.getItem("CheckOracle", 24, hiddenVar) * 3600, 300);
            return true;
        } catch (err) {
            utility.error("ERROR in CheckResults_oracle: " + err);
            return false;
        }
    },

    CheckResults_soldiers: function () {
        try {
            $("div[class='eq_buy_costs_int']").find("select[name='amount']:first option[value='5']").attr('selected', 'selected');
            town.GetItems("soldiers");
            schedule.setItem("soldiers", gm.getItem("CheckSoldiers", 72, hiddenVar) * 3600, 300);
            return true;
        } catch (err) {
            utility.error("ERROR in CheckResults_soldiers: " + err);
            return false;
        }
    },

    CheckResults_item: function () {
        try {
            $("div[class='eq_buy_costs_int']").find("select[name='amount']:first option[value='5']").attr('selected', 'selected');
            town.GetItems("item");
            schedule.setItem("item", gm.getItem("CheckItem", 72, hiddenVar) * 3600, 300);
            return true;
        } catch (err) {
            utility.error("ERROR in CheckResults_item: " + err);
            return false;
        }
    },

    CheckResults_magic: function () {
        try {
            $("div[class='eq_buy_costs_int']").find("select[name='amount']:first option[value='5']").attr('selected', 'selected');
            town.GetItems("magic");
            schedule.setItem("magic", gm.getItem("CheckMagic", 72, hiddenVar) * 3600, 300);
            return true;
        } catch (err) {
            utility.error("ERROR in CheckResults_magic: " + err);
            return false;
        }
    },

    CheckResults_gift: function () {
        try {
            gifting.gifts.populate();
            schedule.setItem("gift", gm.getItem("CheckGift", 72, hiddenVar) * 3600, 300);
            return true;
        } catch (err) {
            utility.error("ERROR in CheckResults_gift: " + err);
            return false;
        }
    },

    CheckResults_battlerank: function () {
        try {
            var rankDiv = null,
                text     = '',
                temp     = [];

            rankDiv = $("div[style*='battle_rank_banner.jpg']");
            if (rankDiv.length) {
                text = rankDiv.text();
                temp = text.match(new RegExp(".*with (.*) Battle Points.*"));
                if (temp && temp.length === 2) {
                    utility.log(1, 'Got Battle Rank Points.');
                    this.stats.rank.battlePoints = utility.NumberOnly(temp[1]);
                    this.SaveStats();
                } else {
                    utility.warn('Battle Rank Points RegExp not matched.');
                }
            } else {
                utility.warn('Battle Rank Points div not found.');
            }

            schedule.setItem("battlerank", gm.getItem("CheckBattleRank", 48, hiddenVar) * 3600, 300);
            return true;
        } catch (err) {
            utility.error("ERROR in CheckResults_battlerank: " + err);
            return false;
        }
    },

    CheckResults_war_rank: function () {
        try {
            var rankDiv = null,
                text     = '',
                temp     = [];

            rankDiv = $("div[style*='war_rank_banner.jpg']");
            if (rankDiv.length) {
                text = rankDiv.text();
                temp = text.match(new RegExp(".*with (.*) War Points.*"));
                if (temp && temp.length === 2) {
                    utility.log(1, 'Got War Rank Points.');
                    this.stats.rank.warPoints = utility.NumberOnly(temp[1]);
                    this.SaveStats();
                } else {
                    utility.warn('War Rank Points RegExp not matched.');
                }
            } else {
                utility.warn('War Rank Points div not found.');
            }

            schedule.setItem("warrank", gm.getItem("CheckWarRank", 48, hiddenVar) * 3600, 300);
            return true;
        } catch (err) {
            utility.error("ERROR in CheckResults_war_rank: " + err);
            return false;
        }
    },

    CheckResults_achievements: function () {
        try {
            var achDiv = null,
                tdDiv  = null;

            achDiv = $("#app46755028429_achievements_2");
            if (achDiv && achDiv.length) {
                tdDiv = achDiv.find("td div");
                if (tdDiv && tdDiv.length === 6) {
                    this.stats.achievements.battle.invasions.won = utility.NumberOnly(tdDiv.eq(0).text());
                    this.stats.achievements.battle.duels.won = utility.NumberOnly(tdDiv.eq(1).text());
                    this.stats.achievements.battle.invasions.lost = utility.NumberOnly(tdDiv.eq(2).text());
                    this.stats.achievements.battle.duels.lost = utility.NumberOnly(tdDiv.eq(3).text());
                    this.stats.achievements.battle.invasions.streak = parseInt(tdDiv.eq(4).text(), 10);
                    this.stats.achievements.battle.duels.streak = parseInt(tdDiv.eq(5).text(), 10);
                    if (this.stats.achievements.battle.invasions.lost) {
                        this.stats.achievements.battle.invasions.ratio = this.stats.achievements.battle.invasions.won / this.stats.achievements.battle.invasions.lost;
                    } else {
                        this.stats.achievements.battle.invasions.ratio = Infinity;
                    }

                    if (this.stats.achievements.battle.invasions.lost) {
                        this.stats.achievements.battle.duels.ratio = this.stats.achievements.battle.duels.won / this.stats.achievements.battle.duels.lost;
                    } else {
                        this.stats.achievements.battle.duels.ratio = Infinity;
                    }
                } else {
                    utility.warn('Battle Achievements problem.');
                }
            } else {
                utility.warn('Battle Achievements not found.');
            }

            achDiv = $("#app46755028429_achievements_3");
            if (achDiv && achDiv.length) {
                tdDiv = achDiv.find("td div");
                if (tdDiv && tdDiv.length === 13) {
                    this.stats.achievements.monster.gildamesh = utility.NumberOnly(tdDiv.eq(0).text());
                    this.stats.achievements.monster.lotus = utility.NumberOnly(tdDiv.eq(1).text());
                    this.stats.achievements.monster.colossus = utility.NumberOnly(tdDiv.eq(2).text());
                    this.stats.achievements.monster.dragons = utility.NumberOnly(tdDiv.eq(3).text());
                    this.stats.achievements.monster.sylvanas = utility.NumberOnly(tdDiv.eq(4).text());
                    this.stats.achievements.monster.cronus = utility.NumberOnly(tdDiv.eq(5).text());
                    this.stats.achievements.monster.keira = utility.NumberOnly(tdDiv.eq(6).text());
                    this.stats.achievements.monster.sieges = utility.NumberOnly(tdDiv.eq(7).text());
                    this.stats.achievements.monster.legion = utility.NumberOnly(tdDiv.eq(8).text());
                    this.stats.achievements.monster.genesis = utility.NumberOnly(tdDiv.eq(9).text());
                    this.stats.achievements.monster.skaar = utility.NumberOnly(tdDiv.eq(10).text());
                    this.stats.achievements.monster.gehenna = utility.NumberOnly(tdDiv.eq(11).text());
                    this.stats.achievements.monster.aurelius = utility.NumberOnly(tdDiv.eq(12).text());
                } else {
                    utility.warn('Monster Achievements problem.');
                }
            } else {
                utility.warn('Monster Achievements not found.');
            }

            achDiv = $("#app46755028429_achievements_4");
            if (achDiv && achDiv.length) {
                tdDiv = achDiv.find("td div");
                if (tdDiv && tdDiv.length === 1) {
                    this.stats.achievements.other.alchemy = utility.NumberOnly(tdDiv.eq(0).text());
                } else {
                    utility.warn('Other Achievements problem.');
                }

                this.SaveStats();
            } else {
                utility.warn('Other Achievements not found.');
            }

            schedule.setItem("achievements", gm.getItem("CheckAchievements", 72, hiddenVar) * 3600, 300);
            return true;
        } catch (err) {
            utility.error("ERROR in CheckResults_achievements: " + err);
            return false;
        }
    },

    CheckResults_view_class_progress: function () {
        try {
            var classDiv = null,
                name     = '';

            classDiv = $("#app46755028429_choose_class_screen div[class*='banner_']");
            if (classDiv && classDiv.length === 6) {
                classDiv.each(function (index) {
                    name = $(this).attr("class").replace("banner_", '');
                    if (name && typeof caap.stats.character[name] === 'object') {
                        //caap.stats.character[name].name = name.ucFirst();
                        caap.stats.character[name].percent = utility.NumberOnly($(this).find("img[src*='progress']").css("width"));
                        caap.stats.character[name].level = utility.NumberOnly($(this).children().eq(2).text());
                    } else {
                        utility.warn("Problem character class name", name);
                    }
                });

                this.SaveStats();
            } else {
                utility.warn("Problem with character class records", classDiv);
            }

            schedule.setItem("view_class_progress", gm.getItem("CheckClassProgress", 48, hiddenVar) * 3600, 300);
            return true;
        } catch (err) {
            utility.error("ERROR in CheckResults_view_class_progress: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          QUESTING
    // Quest function does action, DrawQuest sets up the page and gathers info
    /////////////////////////////////////////////////////////////////////

    MaxEnergyQuest: function () {
        var maxIdleEnergy = this.stats.energy.max,
            theGeneral = config.getItem('IdleGeneral', 'Use Current');

        if (theGeneral !== 'Use Current') {
            maxIdleEnergy = general.GetEnergyMax(theGeneral);
        }

        if (theGeneral !== 'Use Current' && !maxIdleEnergy) {
            utility.log(1, "Changing to idle general to get Max energy");
            if (general.Select('IdleGeneral')) {
                return true;
            }
        }

        if (this.stats.energy.num >= maxIdleEnergy) {
            return this.Quests();
        }

        return false;
    },

    QuestAreaInfo: {
        'Land of Fire' : {
            clas : 'quests_stage_1',
            base : 'land_fire',
            next : 'Land of Earth',
            area : '',
            list : '',
            boss : 'Heart of Fire'
        },
        'Land of Earth' : {
            clas : 'quests_stage_2',
            base : 'land_earth',
            next : 'Land of Mist',
            area : '',
            list : '',
            boss : 'Gift of Earth'
        },
        'Land of Mist' : {
            clas : 'quests_stage_3',
            base : 'land_mist',
            next : 'Land of Water',
            area : '',
            list : '',
            boss : 'Eye of the Storm'
        },
        'Land of Water' : {
            clas : 'quests_stage_4',
            base : 'land_water',
            next : 'Demon Realm',
            area : '',
            list : '',
            boss : 'A Look into the Darkness'
        },
        'Demon Realm' : {
            clas : 'quests_stage_5',
            base : 'land_demon_realm',
            next : 'Undead Realm',
            area : '',
            list : '',
            boss : 'The Rift'
        },
        'Undead Realm' : {
            clas : 'quests_stage_6',
            base : 'land_undead_realm',
            next : 'Underworld',
            area : '',
            list : '',
            boss : 'Undead Embrace'
        },
        'Underworld' : {
            clas : 'quests_stage_7',
            base : 'tab_underworld',
            next : 'Kingdom of Heaven',
            area : '',
            list : '',
            boss : 'Confrontation'
        },
        'Kingdom of Heaven' : {
            clas : 'quests_stage_8',
            base : 'tab_heaven',
            next : 'Ivory City',
            area : '',
            list : '',
            boss : 'Archangels Wrath'
        },
        'Ivory City' : {
            clas : 'quests_stage_9',
            base : 'tab_ivory',
            next : 'Earth II',
            area : '',
            list : '',
            boss : 'Entrance to the Throne'
        },
        'Earth II' : {
            clas : 'quests_stage_10',
            base : 'tab_earth2',
            next : 'Ambrosia',
            area : 'Demi Quests',
            list : 'demiQuestList',
            boss : "Lion's Rebellion"
        },
        'Ambrosia' : {
            clas : 'symbolquests_stage_1',
            next : 'Malekus',
            area : '',
            list : ''
        },
        'Malekus' : {
            clas : 'symbolquests_stage_2',
            next : 'Corvintheus',
            area : '',
            list : ''
        },
        'Corvintheus' : {
            clas : 'symbolquests_stage_3',
            next : 'Aurora',
            area : '',
            list : ''
        },
        'Aurora' : {
            clas : 'symbolquests_stage_4',
            next : 'Azeron',
            area : '',
            list : ''
        },
        'Azeron' : {
            clas : 'symbolquests_stage_5',
            next : 'Atlantis',
            area : 'Atlantis',
            list : 'atlantisQuestList'
        },
        'Atlantis' : {
            clas : 'monster_quests_stage_1',
            next : '',
            area : '',
            list : ''
        }
    },

    demiQuestTable : {
        'Ambrosia'    : 'energy',
        'Malekus'     : 'attack',
        'Corvintheus' : 'defense',
        'Aurora'      : 'health',
        'Azeron'      : 'stamina'
    },

    Quests: function () {
        try {
            var storeRetrieve = state.getItem('storeRetrieve', '');
            if (storeRetrieve) {
                if (storeRetrieve === 'general') {
                    if (general.Select('BuyGeneral')) {
                        return true;
                    }

                    state.setItem('storeRetrieve', '');
                    return true;
                } else {
                    return this.RetrieveFromBank(storeRetrieve);
                }
            }

            this.SetDivContent('quest_mess', '');
            var whenQuest = config.getItem('WhenQuest', 'Never');
            if (whenQuest === 'Never') {
                this.SetDivContent('quest_mess', 'Questing off');
                return false;
            }

            if (whenQuest === 'Not Fortifying') {
                var maxHealthtoQuest = config.getItem('MaxHealthtoQuest', 0);
                if (!maxHealthtoQuest) {
                    this.SetDivContent('quest_mess', '<b>No valid over fortify %</b>');
                    return false;
                }

                var fortMon = state.getItem('targetFromfortify', '');
                if (fortMon) {
                    this.SetDivContent('quest_mess', 'No questing until attack target ' + fortMon + " health exceeds " + config.getItem('MaxToFortify', 0) + '%');
                    return false;
                }

                var targetFrombattle_monster = state.getItem('targetFrombattle_monster', '');
                if (!targetFrombattle_monster) {
                    var currentMonster = monster.getItem(targetFrombattle_monster);
                    var targetFort = currentMonster.fortify;
                    if (!targetFort) {
                        if (targetFort < maxHealthtoQuest) {
                            this.SetDivContent('quest_mess', 'No questing until fortify target ' + targetFrombattle_monster + ' health exceeds ' + maxHealthtoQuest + '%');
                            return false;
                        }
                    }
                }
            }

            if (!state.getItem('AutoQuest', this.newAutoQuest()).name) {
                if (config.getItem('WhyQuest', 'Never') === 'Manual') {
                    this.SetDivContent('quest_mess', 'Pick quest manually.');
                    return false;
                }

                this.SetDivContent('quest_mess', 'Searching for quest.');
                utility.log(1, "Searching for quest");
            } else {
                var energyCheck = this.CheckEnergy(state.getItem('AutoQuest', this.newAutoQuest()).energy, whenQuest, 'quest_mess');
                if (!energyCheck) {
                    return false;
                }
            }

            if (state.getItem('AutoQuest', this.newAutoQuest()).general === 'none' || config.getItem('ForceSubGeneral', false)) {
                if (general.Select('SubQuestGeneral')) {
                    return true;
                }
            } else if (general.LevelUpCheck('QuestGeneral')) {
                if (general.Select('LevelUpGeneral')) {
                    return true;
                }

                utility.log(1, 'Using level up general');
            }

            switch (config.getItem('QuestArea', 'Quest')) {
            case 'Quest' :
                var imgExist = false;
                if (this.stats.level > 7) {
                    var subQArea = config.getItem('QuestSubArea', 'Land of Fire');
                    var landPic = this.QuestAreaInfo[subQArea].base;
                    if (landPic === 'tab_underworld' || landPic === 'tab_ivory' || landPic === 'tab_earth2') {
                        imgExist = utility.NavigateTo('quests,jobs_tab_more.gif,' + landPic + '_small.gif', landPic + '_big');
                    } else if (landPic === 'tab_heaven') {
                        imgExist = utility.NavigateTo('quests,jobs_tab_more.gif,' + landPic + '_small2.gif', landPic + '_big2.gif');
                    } else if ((landPic === 'land_demon_realm') || (landPic === 'land_undead_realm')) {
                        imgExist = utility.NavigateTo('quests,jobs_tab_more.gif,' + landPic + '.gif', landPic + '_sel');
                    } else {
                        imgExist = utility.NavigateTo('quests,jobs_tab_back.gif,' + landPic + '.gif', landPic + '_sel');
                    }
                } else {
                    imgExist = utility.NavigateTo('quests', 'quest_back_1.jpg');
                }

                if (imgExist) {
                    return true;
                }

                break;
            case 'Demi Quests' :
                if (utility.NavigateTo('quests,symbolquests', 'demi_quest_on.gif')) {
                    return true;
                }

                var subDQArea = config.getItem('QuestSubArea', 'Ambrosia');
                var picSlice = nHtml.FindByAttrContains(document.body, 'img', 'src', 'deity_' + this.demiQuestTable[subDQArea]);
                if (picSlice.style.height !== '160px') {
                    return utility.NavigateTo('deity_' + this.demiQuestTable[subDQArea]);
                }

                break;
            case 'Atlantis' :
                if (!utility.CheckForImage('tab_atlantis_on.gif')) {
                    return utility.NavigateTo('quests,monster_quests');
                }

                break;
            default :
            }

            var button = utility.CheckForImage('quick_switch_button.gif');
            if (button && !config.getItem('ForceSubGeneral', false)) {
                if (general.LevelUpCheck('QuestGeneral')) {
                    if (general.Select('LevelUpGeneral')) {
                        return true;
                    }

                    utility.log(1, 'Using level up general');
                } else {
                    utility.log(1, 'Clicking on quick switch general button.');
                    utility.Click(button);
                    general.quickSwitch = true;
                    return true;
                }
            }

            if (general.quickSwitch) {
                general.GetEquippedStats();
            }

            var costToBuy = '';
            //Buy quest requires popup
            var itemBuyPopUp = nHtml.FindByAttrContains(document.body, "form", "id", 'itemBuy');
            if (itemBuyPopUp) {
                state.setItem('storeRetrieve', 'general');
                if (general.Select('BuyGeneral')) {
                    return true;
                }

                state.setItem('storeRetrieve', '');
                costToBuy = itemBuyPopUp.textContent.replace(new RegExp(".*\\$"), '').replace(new RegExp("[^0-9]{3,}.*"), '');
                utility.log(1, "costToBuy", costToBuy);
                if (this.stats.gold.cash < costToBuy) {
                    //Retrieving from Bank
                    if (this.stats.gold.cash + (this.stats.gold.bank - config.getItem('minInStore', 0)) >= costToBuy) {
                        utility.log(1, "Trying to retrieve", costToBuy - this.stats.gold.cash);
                        state.setItem("storeRetrieve", costToBuy - this.stats.gold.cash);
                        return this.RetrieveFromBank(costToBuy - this.stats.gold.cash);
                    } else {
                        utility.log(1, "Cant buy requires, stopping quest");
                        this.ManualAutoQuest();
                        return false;
                    }
                }

                button = utility.CheckForImage('quick_buy_button.jpg');
                if (button) {
                    utility.log(1, 'Clicking on quick buy button.');
                    utility.Click(button);
                    return true;
                }

                utility.warn("Cant find buy button");
                return false;
            }

            button = utility.CheckForImage('quick_buy_button.jpg');
            if (button) {
                state.setItem('storeRetrieve', 'general');
                if (general.Select('BuyGeneral')) {
                    return true;
                }

                state.setItem('storeRetrieve', '');
                costToBuy = button.previousElementSibling.previousElementSibling.previousElementSibling
                    .previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling
                    .firstChild.data.replace(new RegExp("[^0-9]", "g"), '');
                utility.log(1, "costToBuy", costToBuy);
                if (this.stats.gold.cash < costToBuy) {
                    //Retrieving from Bank
                    if (this.stats.gold.cash + (this.stats.gold.bank - config.getItem('minInStore', 0)) >= costToBuy) {
                        utility.log(1, "Trying to retrieve: ", costToBuy - this.stats.gold.cash);
                        state.setItem("storeRetrieve", costToBuy - this.stats.gold.cash);
                        return this.RetrieveFromBank(costToBuy - this.stats.gold.cash);
                    } else {
                        utility.log(1, "Cant buy General, stopping quest");
                        this.ManualAutoQuest();
                        return false;
                    }
                }

                utility.log(1, 'Clicking on quick buy general button.');
                utility.Click(button);
                return true;
            }

            var autoQuestDivs = this.CheckResults_quests(true);
            //if (!gm.getObjVal('AutoQuest', 'name')) {
            if (!state.getItem('AutoQuest', this.newAutoQuest()).name) {
                utility.log(1, 'Could not find AutoQuest.');
                this.SetDivContent('quest_mess', 'Could not find AutoQuest.');
                return false;
            }

            //var autoQuestName = gm.getObjVal('AutoQuest', 'name');
            var autoQuestName = state.getItem('AutoQuest', this.newAutoQuest()).name;
            //if (gm.getObjVal('AutoQuest', 'name') !== autoQuestName) {
            if (state.getItem('AutoQuest', this.newAutoQuest()).name !== autoQuestName) {
                utility.log(1, 'New AutoQuest found.');
                this.SetDivContent('quest_mess', 'New AutoQuest found.');
                return true;
            }

            // if found missing requires, click to buy
            if (autoQuestDivs.tr !== undefined) {
                if (config.getItem('QuestSubArea', 'Atlantis') === 'Atlantis') {
                    utility.log(1, "Cant buy Atlantis items, stopping quest");
                    this.ManualAutoQuest();
                    return false;
                }

                var background = nHtml.FindByAttrContains(autoQuestDivs.tr, "div", "style", 'background-color');
                if (background) {
                    if (background.style.backgroundColor === 'rgb(158, 11, 15)') {
                        utility.log(3, " background.style.backgroundColor", background.style.backgroundColor);
                        state.setItem('storeRetrieve', 'general');
                        if (general.Select('BuyGeneral')) {
                            return true;
                        }

                        state.setItem('storeRetrieve', '');
                        if (background.firstChild.firstChild.title) {
                            utility.log(1, "Clicking to buy", background.firstChild.firstChild.title);
                            utility.Click(background.firstChild.firstChild);
                            return true;
                        }
                    }
                }
            } else {
                utility.warn('Can not buy quest item');
                return false;
            }

            //var questGeneral = gm.getObjVal('AutoQuest', 'general');
            var questGeneral = state.getItem('AutoQuest', this.newAutoQuest()).general;
            if (questGeneral === 'none' || config.getItem('ForceSubGeneral', false)) {
                if (general.Select('SubQuestGeneral')) {
                    return true;
                }
            } else if (questGeneral && questGeneral !== general.GetCurrent()) {
                if (general.LevelUpCheck(questGeneral)) {
                    if (general.Select('LevelUpGeneral')) {
                        return true;
                    }

                    utility.log(1, 'Using level up general');
                } else {
                    if (autoQuestDivs.genDiv !== undefined) {
                        utility.log(1, 'Clicking on general', questGeneral);
                        utility.Click(autoQuestDivs.genDiv);
                        return true;
                    } else {
                        utility.warn('Can not click on general', questGeneral);
                        return false;
                    }
                }
            }

            if (autoQuestDivs.click !== undefined) {
                utility.log(1, 'Clicking auto quest', autoQuestName);
                state.setItem('ReleaseControl', true);
                utility.Click(autoQuestDivs.click, 10000);
                //utility.log(1, "Quests: " + autoQuestName + " (energy: " + gm.getObjVal('AutoQuest', 'energy') + ")");
                this.ShowAutoQuest();
                return true;
            } else {
                utility.warn('Can not click auto quest', autoQuestName);
                return false;
            }
        } catch (err) {
            utility.error("ERROR in Quests: " + err);
            return false;
        }
    },

    questName: null,

    CheckResults_symbolquests: function () {
        try {
            var demiDiv = null,
                points  = [],
                success = true;

            demiDiv = $("div[id*='app46755028429_symbol_desc_symbolquests']");
            if (demiDiv && demiDiv.length === 5) {
                demiDiv.each(function (index) {
                    var temp = utility.NumberOnly($(this).children().next().eq(1).children().children().next().text());
                    if (utility.isNum(temp)) {
                        points.push(temp);
                    } else {
                        success = false;
                        utility.warn('Demi-Power temp text problem', temp);
                    }
                });

                utility.log(2, 'Points', points);
                if (success) {
                    this.demi.ambrosia.power.total = points[0];
                    this.demi.malekus.power.total = points[1];
                    this.demi.corvintheus.power.total = points[2];
                    this.demi.aurora.power.total = points[3];
                    this.demi.azeron.power.total = points[4];
                    schedule.setItem("symbolquests", gm.getItem("CheckSymbolQuests", 24, hiddenVar) * 3600, 300);
                    this.SaveDemi();
                }
            } else {
                utility.warn("Demi demiDiv problem", demiDiv);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in CheckResults_symbolquests: " + err);
            return false;
        }
    },

    isBossQuest: function (name) {
        try {
            var qn = '',
                found = false;

            for (qn in this.QuestAreaInfo) {
                if (this.QuestAreaInfo.hasOwnProperty(qn)) {
                    if (this.QuestAreaInfo.boss && this.QuestAreaInfo.boss === name) {
                        found = true;
                        break;
                    }
                }
            }

            return found;
        } catch (err) {
            utility.error("ERROR in isBossQuest: " + err);
            return false;
        }
    },

    CheckResults_quests: function (pickQuestTF) {
        try {
            if ($("#app46755028429_quest_map_container").length) {
                var metaQuest = $("div[id*='app46755028429_meta_quest_']");
                if (metaQuest && metaQuest.length) {
                    metaQuest.each(function (index) {
                        if (!($(this).find("img[src*='_completed']").length || $(this).find("img[src*='_locked']").length)) {
                            $("div[id='app46755028429_quest_wrapper_" + $(this).attr("id").replace("app46755028429_meta_quest_", '') + "']").css("display", "block");
                        }
                    });
                }
            }

            var whyQuest = config.getItem('WhyQuest', 'Manual');
            if (pickQuestTF === true && whyQuest !== 'Manual') {
                //gm.setItem('AutoQuest', '');
                state.setItem('AutoQuest', this.newAutoQuest());
            }

            var bestReward  = 0,
                rewardRatio = 0,
                div         = document.body,
                ss          = null,
                s           = 0;

            if (utility.CheckForImage('demi_quest_on.gif')) {
                this.CheckResults_symbolquests();
                ss = document.evaluate(".//div[contains(@id,'symbol_displaysymbolquest')]",
                    div, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                if (ss.snapshotLength <= 0) {
                    utility.warn("Failed to find symbol_displaysymbolquest");
                }

                for (s = 0; s < ss.snapshotLength; s += 1) {
                    div = ss.snapshotItem(s);
                    if (div.style.display !== 'none') {
                        break;
                    }
                }
            }

            ss = document.evaluate(".//div[contains(@class,'quests_background')]", div, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (ss.snapshotLength <= 0) {
                utility.warn("Failed to find quests_background");
                return false;
            }

            var haveOrb = false;
            if ($(div).find("input[src*='alchemy_summon']").length) {
                haveOrb = true;
                //if (this.isBossQuest(gm.getObjVal('AutoQuest', 'name')) && config.getItem('GetOrbs', false) && whyQuest !== 'Manual') {
                if (this.isBossQuest(state.getItem('AutoQuest', this.newAutoQuest()).name) && config.getItem('GetOrbs', false) && whyQuest !== 'Manual') {
                    //gm.setItem('AutoQuest', '');
                    state.setItem('AutoQuest', this.newAutoQuest());
                }
            }

            var autoQuestDivs = {
                'click' : undefined,
                'tr'    : undefined,
                'genDiv': undefined
            };

            for (s = 0; s < ss.snapshotLength; s += 1) {
                div = ss.snapshotItem(s);
                this.questName = this.GetQuestName(div);
                if (!this.questName) {
                    continue;
                }

                var reward     = null,
                    energy     = null,
                    experience = null,
                    divTxt     = nHtml.GetText(div),
                    expM       = divTxt.match(new RegExp("\\+([0-9]+)"));

                if (expM && expM.length === 2) {
                    experience = utility.NumberOnly(expM[1]);
                } else {
                    var expObj = $("div[class='quest_experience']");
                    if (expObj && expObj.length) {
                        experience = utility.NumberOnly(expObj.text());
                    } else {
                        utility.warn("Can't find experience for", this.questName);
                    }
                }

                var idx = this.questName.indexOf('<br>');
                if (idx >= 0) {
                    this.questName = this.questName.substring(0, idx);
                }

                var energyM = divTxt.match(new RegExp("([0-9]+)\\s+energy", "i"));
                if (energyM && energyM.length === 2) {
                    energy = utility.NumberOnly(energyM[1]);
                } else {
                    var eObj = nHtml.FindByAttrContains(div, 'div', 'className', 'quest_req');
                    if (eObj) {
                        energy = eObj.getElementsByTagName('b')[0];
                    }
                }

                if (!energy) {
                    utility.warn("Can't find energy for", this.questName);
                    continue;
                }

                var moneyM     = utility.RemoveHtmlJunk(divTxt).match(new RegExp("\\$([0-9,]+)\\s*-\\s*\\$([0-9,]+)", "i")),
                    rewardLow  = 0,
                    rewardHigh = 0;

                if (moneyM && moneyM.length === 3) {
                    rewardLow  = utility.NumberOnly(moneyM[1]);
                    rewardHigh = utility.NumberOnly(moneyM[2]);
                    reward = (rewardLow + rewardHigh) / 2;
                } else {
                    moneyM = utility.RemoveHtmlJunk(divTxt).match(new RegExp("\\$([0-9,]+)mil\\s*-\\s*\\$([0-9,]+)mil", "i"));
                    if (moneyM && moneyM.length === 3) {
                        rewardLow  = utility.NumberOnly(moneyM[1]) * 1000000;
                        rewardHigh = utility.NumberOnly(moneyM[2]) * 1000000;
                        reward = (rewardLow + rewardHigh) / 2;
                    } else {
                        utility.warn('No money found for', this.questName, divTxt);
                    }
                }

                var click = $(div).find("input[name*='Do']");
                if (click && click.length) {
                    click = click.get(0);
                } else {
                    utility.warn('No button found for', this.questName);
                    continue;
                }

                var influence = null;
                if (this.isBossQuest(this.questName)) {
                    if ($("div[class='quests_background_sub']").length) {
                        //if boss and found sub quests
                        influence = "100";
                    } else {
                        influence = "0";
                    }
                } else {
                    var influenceList = divTxt.match(new RegExp("([0-9]+)%"));
                    if (influenceList && influenceList.length === 2) {
                        influence = influenceList[1];
                    } else {
                        utility.warn("Influence div not found.", influenceList);
                    }
                }

                if (!influence) {
                    utility.warn('No influence found for', this.questName, divTxt);
                }

                var general = 'none';
                var genDiv = null;
                if (influence && influence < 100) {
                    genDiv = nHtml.FindByAttrContains(div, 'div', 'className', 'quest_act_gen');
                    if (genDiv) {
                        genDiv = nHtml.FindByAttrContains(genDiv, 'img', 'src', 'jpg');
                        if (genDiv) {
                            general = genDiv.title;
                        }
                    }
                }

                var questType = 'subquest';
                if (div.className === 'quests_background') {
                    questType = 'primary';
                } else if (div.className === 'quests_background_special') {
                    questType = 'boss';
                }

                if (s === 0) {
                    utility.log(1, "Adding Quest Labels and Listeners");
                }

                this.LabelQuests(div, energy, reward, experience, click);
                utility.log(9, "QuestSubArea", config.getItem('QuestSubArea', 'Atlantis'));
                if (this.CheckCurrentQuestArea(config.getItem('QuestSubArea', 'Atlantis'))) {
                    if (config.getItem('GetOrbs', false) && questType === 'boss' && whyQuest !== 'Manual') {
                        if (!haveOrb) {
                            //gm.setObjVal('AutoQuest', 'name', this.questName);
                            this.updateAutoQuest('name', this.questName);
                            pickQuestTF = true;
                        }
                    }

                    switch (whyQuest) {
                    case 'Advancement' :
                        if (influence) {
                            //if (!gm.getObjVal('AutoQuest', 'name') && questType === 'primary' && utility.NumberOnly(influence) < 100) {
                            if (!state.getItem('AutoQuest', this.newAutoQuest()).name && questType === 'primary' && utility.NumberOnly(influence) < 100) {
                                //gm.setObjVal('AutoQuest', 'name', this.questName);
                                this.updateAutoQuest('name', this.questName);
                                pickQuestTF = true;
                            }
                        } else {
                            utility.warn("Can't find influence for", this.questName, influence);
                        }

                        break;
                    case 'Max Influence' :
                        if (influence) {
                            //if (!gm.getObjVal('AutoQuest', 'name') && utility.NumberOnly(influence) < 100) {
                            if (!state.getItem('AutoQuest', this.newAutoQuest()).name && utility.NumberOnly(influence) < 100) {
                                //gm.setObjVal('AutoQuest', 'name', this.questName);
                                this.updateAutoQuest('name', this.questName);
                                pickQuestTF = true;
                            }
                        } else {
                            utility.warn("Can't find influence for", this.questName, influence);
                        }

                        break;
                    case 'Max Experience' :
                        rewardRatio = (Math.floor(experience / energy * 100) / 100);
                        if (bestReward < rewardRatio) {
                            //gm.setObjVal('AutoQuest', 'name', this.questName);
                            this.updateAutoQuest('name', this.questName);
                            pickQuestTF = true;
                        }

                        break;
                    case 'Max Gold' :
                        rewardRatio = (Math.floor(reward / energy * 10) / 10);
                        if (bestReward < rewardRatio) {
                            //gm.setObjVal('AutoQuest', 'name', this.questName);
                            this.updateAutoQuest('name', this.questName);
                            pickQuestTF = true;
                        }

                        break;
                    default :
                    }

                    //if (gm.getObjVal('AutoQuest', 'name') === this.questName) {
                    if (state.getItem('AutoQuest', this.newAutoQuest()).name === this.questName) {
                        bestReward = rewardRatio;
                        var expRatio = experience / energy;
                        utility.log(1, "Setting AutoQuest", this.questName);
                        //gm.setItem('AutoQuest', 'name' + global.ls + this.questName + global.vs + 'energy' + global.ls + energy + global.vs + 'general' + global.ls + general + global.vs + 'expRatio' + global.ls + expRatio);
                        var tempAutoQuest = this.newAutoQuest();
                        tempAutoQuest.name = this.questName;
                        tempAutoQuest.energy = energy;
                        tempAutoQuest.general = general;
                        tempAutoQuest.expRatio = expRatio;
                        state.setItem('AutoQuest', tempAutoQuest);
                        utility.log(2, "CheckResults_quests", state.getItem('AutoQuest', this.newAutoQuest()));
                        this.ShowAutoQuest();
                        autoQuestDivs.click  = click;
                        autoQuestDivs.tr     = div;
                        autoQuestDivs.genDiv = genDiv;
                    }
                }
            }

            if (pickQuestTF) {
                //if (gm.getObjVal('AutoQuest', 'name')) {
                if (state.getItem('AutoQuest', this.newAutoQuest()).name) {
                    utility.log(2, "CheckResults_quests(pickQuestTF)", state.getItem('AutoQuest', this.newAutoQuest()));
                    this.ShowAutoQuest();
                    return autoQuestDivs;
                }

                //if not find quest, probably you already maxed the subarea, try another area
                if ((whyQuest === 'Max Influence' || whyQuest === 'Advancement') && config.getItem('switchQuestArea', true)) {
                    var QuestSubArea = config.getItem('QuestSubArea', 'Land Of Fire');
                    utility.log(9, "QuestSubArea", QuestSubArea);
                    if (QuestSubArea && this.QuestAreaInfo[QuestSubArea] && this.QuestAreaInfo[QuestSubArea].next) {
                        config.setItem('QuestSubArea', this.QuestAreaInfo[QuestSubArea].next);
                        if (this.QuestAreaInfo[QuestSubArea].area && this.QuestAreaInfo[QuestSubArea].list) {
                            config.setItem('QuestArea', this.QuestAreaInfo[QuestSubArea].area);
                            this.ChangeDropDownList('QuestSubArea', this[this.QuestAreaInfo[QuestSubArea].list]);
                        }
                    } else {
                        utility.log(1, "Setting questing to manual");
                        this.ManualAutoQuest();
                    }

                    utility.log(1, "UpdateQuestGUI: Setting drop down menus");
                    this.SelectDropOption('QuestArea', config.getItem('QuestArea', 'Quest'));
                    this.SelectDropOption('QuestSubArea', config.getItem('QuestSubArea', 'Land Of Fire'));
                    return false;
                }

                utility.log(1, "Finished QuestArea.");
                this.ManualAutoQuest();
            }

            return false;
        } catch (err) {
            utility.error("ERROR in CheckResults_quests: " + err);
            this.ManualAutoQuest();
            return false;
        }
    },

    ClassToQuestArea: {
        'quests_stage_1'         : 'Land of Fire',
        'quests_stage_2'         : 'Land of Earth',
        'quests_stage_3'         : 'Land of Mist',
        'quests_stage_4'         : 'Land of Water',
        'quests_stage_5'         : 'Demon Realm',
        'quests_stage_6'         : 'Undead Realm',
        'quests_stage_7'         : 'Underworld',
        'quests_stage_8'         : 'Kingdom of Heaven',
        'quests_stage_9'         : 'Ivory City',
        'quests_stage_10'        : 'Earth II',
        'symbolquests_stage_1'   : 'Ambrosia',
        'symbolquests_stage_2'   : 'Malekus',
        'symbolquests_stage_3'   : 'Corvintheus',
        'symbolquests_stage_4'   : 'Aurora',
        'symbolquests_stage_5'   : 'Azeron',
        'monster_quests_stage_1' : 'Atlantis'
    },

    CheckCurrentQuestArea: function (QuestSubArea) {
        try {
            var found = false;

            if (this.stats.level < 8) {
                if (utility.CheckForImage('quest_back_1.jpg')) {
                    found = true;
                }
            } else if (QuestSubArea && this.QuestAreaInfo[QuestSubArea]) {
                if ($("div[class*='" + this.QuestAreaInfo[QuestSubArea].clas + "']").length) {
                    found = true;
                }
            }

            return found;
        } catch (err) {
            utility.error("ERROR in CheckCurrentQuestArea: " + err);
            return false;
        }
    },

    GetQuestName: function (questDiv) {
        try {
            var item_title = nHtml.FindByAttrXPath(questDiv, 'div', "@class='quest_desc' or @class='quest_sub_title'");
            if (!item_title) {
                utility.log(2, "Can't find quest description or sub-title");
                return false;
            }

            if (item_title.innerHTML.toString().match(/LOCK/)) {
                utility.log(2, "Quest locked", item_title);
                return false;
            }

            var firstb = item_title.getElementsByTagName('b')[0];
            if (!firstb) {
                utility.warn("Can't get bolded member out of", item_title.innerHTML.toString());
                return false;
            }

            this.questName = $.trim(firstb.innerHTML.toString()).stripHTML();
            if (!this.questName) {
                utility.warn('No quest name for this row');
                return false;
            }

            return this.questName;
        } catch (err) {
            utility.error("ERROR in GetQuestName: " + err);
            return false;
        }
    },

    /*------------------------------------------------------------------------------------\
    CheckEnergy gets passed the default energy requirement plus the condition text from
    the 'Whenxxxxx' setting and the message div name.
    \------------------------------------------------------------------------------------*/
    CheckEnergy: function (energy, condition, msgdiv) {
        try {
            if (!this.stats.energy || !energy) {
                return false;
            }

            if (condition === 'Energy Available' || condition === 'Not Fortifying') {
                if (this.stats.energy.num >= energy) {
                    return true;
                }

                if (msgdiv) {
                    this.SetDivContent(msgdiv, 'Waiting for more energy: ' + this.stats.energy.num + "/" + (energy ? energy : ""));
                }
            } else if (condition === 'At X Energy') {
                if (this.InLevelUpMode() && this.stats.energy.num >= energy) {
                    if (msgdiv) {
                        this.SetDivContent(msgdiv, 'Burning all energy to level up');
                    }

                    return true;
                }

                var whichEnergy = config.getItem('XQuestEnergy', 1);
                if (this.stats.energy.num >= whichEnergy) {
                    state.setItem('AtXQuestEnergy', true);
                }

                if (this.stats.energy.num >= energy) {
                    if (state.getItem('AtXQuestEnergy', false) && this.stats.energy.num >= config.getItem('XMinQuestEnergy', 0)) {
                        this.SetDivContent(msgdiv, 'At X energy. Burning to ' + config.getItem('XMinQuestEnergy', 0));
                        return true;
                    } else {
                        state.setItem('AtXQuestEnergy', false);
                    }
                }

                if (energy > whichEnergy) {
                    whichEnergy = energy;
                }

                if (msgdiv) {
                    this.SetDivContent(msgdiv, 'Waiting for X energy: ' + this.stats.energy.num + "/" + whichEnergy);
                }
            } else if (condition === 'At Max Energy') {
                var maxIdleEnergy = this.stats.energy.max,
                    theGeneral = config.getItem('IdleGeneral', 'Use Current');

                if (theGeneral !== 'Use Current') {
                    maxIdleEnergy = general.GetEnergyMax(theGeneral);
                }

                if (theGeneral !== 'Use Current' && !maxIdleEnergy) {
                    utility.log(1, "Changing to idle general to get Max energy");
                    if (general.Select('IdleGeneral')) {
                        return true;
                    }
                }

                if (this.stats.energy.num >= maxIdleEnergy) {
                    return true;
                }

                if (this.InLevelUpMode() && this.stats.energy.num >= energy) {
                    if (msgdiv) {
                        this.SetDivContent(msgdiv, 'Burning all energy to level up');
                    }

                    return true;
                }

                if (msgdiv) {
                    this.SetDivContent(msgdiv, 'Waiting for max energy: ' + this.stats.energy.num + "/" + maxIdleEnergy);
                }
            }

            return false;
        } catch (err) {
            utility.error("ERROR in CheckEnergy: " + err);
            return false;
        }
    },

    AddLabelListener: function (element, type, listener, usecapture) {
        try {
            element.addEventListener(type, this[listener], usecapture);
            return true;
        } catch (err) {
            utility.error("ERROR in AddLabelListener: " + err);
            return false;
        }
    },

    LabelListener: function (e) {
        try {
            var sps = e.target.getElementsByTagName('span'),
                mainDiv = null,
                className = '';

            if (sps.length <= 0) {
                throw 'what did we click on?';
            }

            caap.ManualAutoQuest('name' + global.ls + sps[0].innerHTML.toString() + global.vs + 'energy' + global.ls + sps[1].innerHTML.toString());
            if (caap.stats.level < 10 && utility.CheckForImage('quest_back_1.jpg')) {
                config.setItem('QuestArea', 'Quest');
                config.setItem('QuestSubArea', 'Land of Fire');
            } else {
                if (utility.CheckForImage('tab_quest_on.gif')) {
                    config.setItem('QuestArea', 'Quest');
                    caap.SelectDropOption('QuestArea', 'Quest');
                    caap.ChangeDropDownList('QuestSubArea', caap.landQuestList);
                } else if (utility.CheckForImage('demi_quest_on.gif')) {
                    config.setItem('QuestArea', 'Demi Quests');
                    caap.SelectDropOption('QuestArea', 'Demi Quests');
                    caap.ChangeDropDownList('QuestSubArea', caap.demiQuestList);
                } else if (utility.CheckForImage('tab_atlantis_on.gif')) {
                    config.setItem('QuestArea', 'Atlantis');
                    caap.SelectDropOption('QuestArea', 'Atlantis');
                    caap.ChangeDropDownList('QuestSubArea', caap.atlantisQuestList);
                }

                mainDiv = $("#app46755028429_main_bn");
                if (mainDiv && mainDiv.length) {
                    className = mainDiv.attr("class");
                    if (className && caap.ClassToQuestArea[className]) {
                        config.setItem('QuestSubArea', caap.ClassToQuestArea[className]);
                    }
                }
            }

            utility.log(1, 'Setting QuestSubArea to', config.getItem('QuestSubArea', 'Land Of Fire'));
            caap.SelectDropOption('QuestSubArea', config.getItem('QuestSubArea', 'Land Of Fire'));
            caap.ShowAutoQuest();
            return true;
        } catch (err) {
            utility.error("ERROR in LabelListener: " + err);
            return false;
        }
    },

    LabelQuests: function (div, energy, reward, experience, click) {
        if ($(div).find("div[class='autoquest'").length) {
            return;
        }

        div = document.createElement('div');
        div.className = 'autoquest';
        div.style.fontSize = '10px';
        div.innerHTML = "$ per energy: " + (Math.floor(reward / energy * 10) / 10) +
            "<br />Exp per energy: " + (Math.floor(experience / energy * 100) / 100) + "<br />";

        //if (gm.getObjVal('AutoQuest', 'name') === this.questName) {
        if (state.getItem('AutoQuest', this.newAutoQuest()).name === this.questName) {
            var b = document.createElement('b');
            b.innerHTML = "Current auto quest";
            div.appendChild(b);
        } else {
            var setAutoQuest = document.createElement('a');
            setAutoQuest.innerHTML = 'Auto run this quest.';
            setAutoQuest.quest_name = this.questName;

            var quest_nameObj = document.createElement('span');
            quest_nameObj.innerHTML = this.questName;
            quest_nameObj.style.display = 'none';
            setAutoQuest.appendChild(quest_nameObj);

            var quest_energyObj = document.createElement('span');
            quest_energyObj.innerHTML = energy;
            quest_energyObj.style.display = 'none';
            setAutoQuest.appendChild(quest_energyObj);
            this.AddLabelListener(setAutoQuest, "click", "LabelListener", false);

            div.appendChild(setAutoQuest);
        }

        div.style.position = 'absolute';
        div.style.background = '#B09060';
        div.style.right = "144px";
        click.parentNode.insertBefore(div, click);
    },

    /////////////////////////////////////////////////////////////////////
    //                          AUTO BLESSING
    /////////////////////////////////////////////////////////////////////

    deityTable: {
        energy  : 1,
        attack  : 2,
        defense : 3,
        health  : 4,
        stamina : 5
    },

    BlessingResults: function (resultsText) {
        // Check time until next Oracle Blessing
        if (resultsText.match(/Please come back in: /)) {
            var hours   = parseInt(resultsText.match(/ \d+ hour/), 10),
                minutes = parseInt(resultsText.match(/ \d+ minute/), 10);

            schedule.setItem('BlessingTimer', (hours * 60 + minutes) * 60, 300);
            utility.log(1, 'Recorded Blessing Time. Scheduling next click!');
        }

        // Recieved Demi Blessing.  Wait 24 hours to try again.
        if (resultsText.match(/You have paid tribute to/)) {
            schedule.setItem('BlessingTimer', 86400, 300);
            utility.log(1, 'Received blessing. Scheduling next click!');
        }

        this.SetCheckResultsFunction('');
    },

    AutoBless: function () {
        var autoBless = config.getItem('AutoBless', 'None').toLowerCase();
        if (autoBless === 'none') {
            return false;
        }

        if (!schedule.check('BlessingTimer')) {
            return false;
        }

        if (utility.NavigateTo('quests,demi_quest_off', 'demi_quest_bless')) {
            return true;
        }

        var picSlice = nHtml.FindByAttrContains(document.body, 'img', 'src', 'deity_' + autoBless);
        if (!picSlice) {
            utility.warn('No diety pics for deity', autoBless);
            return false;
        }

        if (picSlice.style.height !== '160px') {
            return utility.NavigateTo('deity_' + autoBless);
        }

        picSlice = nHtml.FindByAttrContains(document.body, 'form', 'id', '_symbols_form_' + this.deityTable[autoBless]);
        if (!picSlice) {
            utility.warn('No form for deity blessing.');
            return false;
        }

        picSlice = utility.CheckForImage('demi_quest_bless', picSlice);
        if (!picSlice) {
            utility.warn('No image for deity blessing.');
            return false;
        }

        utility.log(1, 'Click deity blessing for ', autoBless);
        schedule.setItem('BlessingTimer', 3600, 300);
        this.SetCheckResultsFunction('BlessingResults');
        utility.Click(picSlice);
        return true;
    },

    /////////////////////////////////////////////////////////////////////
    //                          LAND
    // Displays return on lands and perfom auto purchasing
    /////////////////////////////////////////////////////////////////////

    LandsGetNameFromRow: function (row) {
        // schoolofmagic, etc. <div class=item_title
        var infoDiv = nHtml.FindByAttrXPath(row, 'div', "contains(@class,'land_buy_info') or contains(@class,'item_title')");
        if (!infoDiv) {
            utility.warn("can't find land_buy_info");
        }

        if (infoDiv.className.indexOf('item_title') >= 0) {
            return $.trim(infoDiv.textContent);
        }

        var strongs = infoDiv.getElementsByTagName('strong');
        if (strongs.length < 1) {
            return null;
        }

        return $.trim(strongs[0].textContent);
    },

    bestLand: {
        land : '',
        roi  : 0
    },

    CheckResults_land: function () {
        if (nHtml.FindByAttrXPath(document, 'div', "contains(@class,'caap_landDone')")) {
            return null;
        }

        state.setItem('BestLandCost', 0);
        this.sellLand = '';
        this.bestLand.roi = 0;
        this.IterateLands(function (land) {
            this.SelectLands(land.row, 2);
            var roi = (parseInt((land.income / land.totalCost) * 240000, 10) / 100);
            var div = null;
            if (!nHtml.FindByAttrXPath(land.row, 'input', "@name='Buy'")) {
                roi = 0;
                // Lets get our max allowed from the land_buy_info div
                div = nHtml.FindByAttrXPath(land.row, 'div', "contains(@class,'land_buy_info') or contains(@class,'item_title')");
                var maxText = $.trim(nHtml.GetText(div).match(/:\s+\d+/i).toString());
                var maxAllowed = Number(maxText.replace(/:\s+/, ''));
                // Lets get our owned total from the land_buy_costs div
                div = nHtml.FindByAttrXPath(land.row, 'div', "contains(@class,'land_buy_costs')");
                var ownedText = $.trim(nHtml.GetText(div).match(/:\s+\d+/i).toString());
                var owned = Number(ownedText.replace(/:\s+/, ''));
                // If we own more than allowed we will set land and selection
                var selection = [1, 5, 10];
                for (var s = 2; s >= 0; s -= 1) {
                    if (owned - maxAllowed >= selection[s]) {
                        this.sellLand = land;
                        this.sellLand.selection = s;
                        break;
                    }
                }
            }

            div = nHtml.FindByAttrXPath(land.row, 'div', "contains(@class,'land_buy_info') or contains(@class,'item_title')").getElementsByTagName('strong');
            div[0].innerHTML += " | " + roi + "% per day.";
            if (!land.usedByOther) {
                if (!(this.bestLand.roi || roi === 0) || roi > this.bestLand.roi) {
                    this.bestLand.roi = roi;
                    this.bestLand.land = land;
                    state.setItem('BestLandCost', this.bestLand.land.cost);
                }
            }
        });

        var bestLandCost = state.getItem('BestLandCost', '');
        utility.log(1, "Best Land Cost: ", bestLandCost);
        if (!bestLandCost) {
            state.setItem('BestLandCost', 'none');
        }

        var div = document.createElement('div');
        div.className = 'caap_landDone';
        div.style.display = 'none';
        nHtml.FindByAttrContains(document.body, "tr", "class", 'land_buy_row').appendChild(div);
        return null;
    },

    IterateLands: function (func) {
        var content = document.getElementById('content');
        var ss = document.evaluate(".//tr[contains(@class,'land_buy_row')]", content, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        if (!ss || (ss.snapshotLength === 0)) {
            utility.log(9, "Can't find land_buy_row");
            return null;
        }

        var landByName = {};
        var landNames = [];

        utility.log(9, 'forms found', ss.snapshotLength);
        for (var s = 0; s < ss.snapshotLength; s += 1) {
            var row = ss.snapshotItem(s);
            if (!row) {
                continue;
            }

            var name = this.LandsGetNameFromRow(row);
            if (name === null || name === '') {
                utility.warn("Can't find land name");
                continue;
            }

            var moneyss = document.evaluate(".//*[contains(@class,'gold') or contains(@class,'currency')]", row, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (moneyss.snapshotLength < 2) {
                utility.warn("Can't find 2 gold instances");
                continue;
            }

            var income = 0;
            var nums = [];
            var numberRe = new RegExp("([0-9,]+)");
            for (var sm = 0; sm < moneyss.snapshotLength; sm += 1) {
                income = moneyss.snapshotItem(sm);
                if (income.className.indexOf('label') >= 0) {
                    income = income.parentNode;
                    var m = numberRe.exec(income.textContent);
                    if (m && m.length >= 2 && m[1].length > 1) {
                        // number must be more than a digit or else it could be a "? required" text
                        income = utility.NumberOnly(m[1]);
                    } else {
                        utility.log(9, 'Cannot find income for ', name, income.textContent);
                        income = 0;
                        continue;
                    }
                } else {
                    income = utility.NumberOnly(income.textContent);
                }
                nums.push(income);
            }

            income = nums[0];
            var cost = nums[1];
            if (!income || !cost) {
                utility.warn("Can't find income or cost for", name);
                continue;
            }

            if (income > cost) {
                // income is always less than the cost of land.
                income = nums[1];
                cost = nums[0];
            }

            var totalCost = cost;
            var land = {
                'row'         : row,
                'name'        : name,
                'income'      : income,
                'cost'        : cost,
                'totalCost'   : totalCost,
                'usedByOther' : false
            };

            landByName[name] = land;
            landNames.push(name);
        }

        for (var p = 0; p < landNames.length; p += 1) {
            func.call(this, landByName[landNames[p]]);
        }

        return landByName;
    },

    SelectLands: function (row, val) {
        var selects = row.getElementsByTagName('select');
        if (selects.length < 1) {
            return false;
        }

        var select = selects[0];
        select.selectedIndex = val;
        return true;
    },

    BuyLand: function (land) {
        this.SelectLands(land.row, 2);
        var button = nHtml.FindByAttrXPath(land.row, 'input', "@type='submit' or @type='image'");
        if (button) {
            utility.log(9, "Clicking buy button", button);
            utility.log(1, "Buying Land", land.name);
            utility.Click(button, 13000);
            state.setItem('BestLandCost', 0);
            this.bestLand.roi = 0;
            return true;
        }

        return false;
    },

    SellLand: function (land, select) {
        this.SelectLands(land.row, select);
        var button = nHtml.FindByAttrXPath(land.row, 'input', "@type='submit' or @type='image'");
        if (button) {
            utility.log(9, "Clicking sell button", button);
            utility.log(1, "Selling Land: ", land.name);
            utility.Click(button, 13000);
            this.sellLand = '';
            return true;
        }

        return false;
    },

    Lands: function () {
        if (config.getItem('autoBuyLand', false)) {
            // Do we have lands above our max to sell?
            if (this.sellLand && config.getItem('SellLands', false)) {
                this.SellLand(this.sellLand, this.sellLand.selection);
                return true;
            }

            var bestLandCost = state.getItem('BestLandCost', '');
            if (!bestLandCost) {
                utility.log(1, "Going to land to get Best Land Cost");
                if (utility.NavigateTo('soldiers,land', 'tab_land_on.gif')) {
                    return true;
                }
            }

            if (bestLandCost === 'none') {
                utility.log(2, "No Lands avaliable");
                return false;
            }

            utility.log(2, "Lands: How much gold in store?", this.stats.gold.bank);
            if (!this.stats.gold.bank && this.stats.gold.bank !== 0) {
                utility.log(1, "Going to keep to get Stored Value");
                if (utility.NavigateTo('keep')) {
                    return true;
                }
            }

            // Retrieving from Bank
            var cashTotAvail = this.stats.gold.cash + (this.stats.gold.bank - config.getItem('minInStore', 0));
            var cashNeed = 10 * bestLandCost;
            var theGeneral = config.getItem('IdleGeneral', 'Use Current');
            if ((cashTotAvail >= cashNeed) && (this.stats.gold.cash < cashNeed)) {
                if (theGeneral !== 'Use Current') {
                    utility.log(1, "Changing to idle general");
                    if (general.Select('IdleGeneral')) {
                        return true;
                    }
                }

                utility.log(1, "Trying to retrieve", 10 * bestLandCost - this.stats.gold.cash);
                return this.RetrieveFromBank(10 * bestLandCost - this.stats.gold.cash);
            }

            // Need to check for enough moneys + do we have enough of the builton type that we already own.
            if (bestLandCost && this.stats.gold.cash >= 10 * bestLandCost) {
                if (theGeneral !== 'Use Current') {
                    utility.log(1, "Changing to idle general");
                    if (general.Select('IdleGeneral')) {
                        return true;
                    }
                }

                utility.NavigateTo('soldiers,land');
                if (utility.CheckForImage('tab_land_on.gif')) {
                    utility.log(2, "Buying land", this.bestLand.land.name);
                    if (this.BuyLand(this.bestLand.land)) {
                        return true;
                    }
                } else {
                    return utility.NavigateTo('soldiers,land');
                }
            }
        }

        return false;
    },

    /////////////////////////////////////////////////////////////////////
    //                          BATTLING PLAYERS
    /////////////////////////////////////////////////////////////////////

    CheckBattleResults: function () {
        try {
            var now          = null,
                newelement   = null,
                battleRecord = {},
                resultsDiv   = null,
                resultsText  = '',
                wins         = 0,
                tempDiv      = null,
                tempText     = '',
                tempTime     = new Date(2009, 0, 1).getTime(),
                chainBP      = 0,
                chainGold    = 0,
                result       = {
                    userId     : 0,
                    userName   : '',
                    battleType : '',
                    points     : 0,
                    gold       : 0,
                    win        : false
                };

            if (battle.deadCheck() !== false) {
                return true;
            }

            result = battle.getResult();
            if (!result) {
                return true;
            }

            battleRecord = battle.getItem(result.userId);
            if (result.win) {
                utility.log(1, "We Defeated ", result.userName);
                //Test if we should chain this guy
                state.setItem("BattleChainId", 0);
                tempTime = battleRecord.chainTime ? battleRecord.chainTime : new Date(2009, 0, 1).getTime();
                if (schedule.since(tempTime, 86400)) {
                    chainBP = config.getItem('ChainBP', '');
                    if (utility.isNum(chainBP) && chainBP >= 0) {
                        if (result.points >= chainBP) {
                            state.setItem("BattleChainId", result.userId);
                            utility.log(1, "Chain Attack: " + result.userId + ((result.battleType === "War") ? "  War Points: " : "  Battle Points: ") + result.points);
                        } else {
                            battleRecord.ignoreTime = new Date().getTime();
                            battle.setItem(battleRecord);
                        }
                    }

                    chainGold = config.getItem('ChainGold', '');
                    if (utility.isNum(chainGold) && chainGold >= 0) {
                        if (result.gold >= chainGold) {
                            state.setItem("BattleChainId", result.userId);
                            utility.log(1, "Chain Attack: " + result.userId + " Gold: " + result.goldnum);
                        } else {
                            battleRecord.ignoreTime = new Date().getTime();
                            battle.setItem(battleRecord);
                        }
                    }

                    if (state.getItem("BattleChainId", 0)) {
                        battleRecord.chainCount = battleRecord.chainCount ? battleRecord.chainCount += 1 : 1;
                        if (battleRecord.chainCount >= config.getItem('MaxChains', 4)) {
                            utility.log(1, "Lets give this guy a break. Chained", battleRecord.chainCount);
                            battleRecord.chainTime = new Date().getTime();
                            battleRecord.chainCount = 0;
                        }

                        battle.setItem(battleRecord);
                    }
                }

                this.SetCheckResultsFunction('');
            } else {
                utility.log(1, "We Were Defeated By ", result.userName);
                battleRecord.chainCount = 0;
                battleRecord.chainTime = new Date(2009, 0, 1).getTime();
                battle.setItem(battleRecord);
                this.SetCheckResultsFunction('');
            }

            return true;
        } catch (err) {
            utility.error("ERROR in CheckBattleResults: " + err);
            return false;
        }
    },

    BattleUserId: function (userid) {
        try {
            if (battle.hashCheck(userid)) {
                return true;
            }

            var battleButton = null,
                form = null,
                inp = null;

            battleButton = utility.CheckForImage(this.battles.Freshmeat[config.getItem('BattleType', 'Invade')]);
            if (battleButton) {
                form = $(battleButton).parent().parent();
                if (form && form.length) {
                    inp = form.find("input[name='target_id']");
                    if (inp && inp.length) {
                        inp.attr("value", userid);
                        state.setItem("lastBattleID", userid);
                        this.ClickBattleButton(battleButton);
                        state.setItem("notSafeCount", 0);
                        return true;
                    } else {
                        utility.warn("target_id not found in battleForm");
                    }
                } else {
                    utility.warn("form not found in battleButton");
                }
            } else {
                utility.warn("battleButton not found");
            }

            return false;
        } catch (err) {
            utility.error("ERROR in BattleUserId: " + err);
            return false;
        }
    },

    ClickBattleButton: function (battleButton) {
        state.setItem('ReleaseControl', true);
        this.SetCheckResultsFunction('CheckBattleResults');
        utility.Click(battleButton);
    },

    battles: {
        Raid : {
            Invade   : 'raid_attack_button.gif',
            Duel     : 'raid_attack_button2.gif',
            regex1   : new RegExp('Rank: ([0-9]+) ([^0-9]+) ([0-9]+) ([^0-9]+) ([0-9]+)', 'i'),
            refresh  : 'raid',
            image    : 'tab_raid_on.gif'
        },
        Freshmeat : {
            Invade   : 'battle_01.gif',
            Duel     : 'battle_02.gif',
            War      : 'war_button_duel.gif',
            regex1   : new RegExp('(.+)    \\(Level ([0-9]+)\\)\\s*Battle: ([A-Za-z ]+) \\(Rank ([0-9]+)\\)\\s*War: ([A-Za-z ]+) \\(Rank ([0-9]+)\\)\\s*([0-9]+)', 'i'),
            regex2   : new RegExp('(.+)    \\(Level ([0-9]+)\\)\\s*Battle: ([A-Za-z ]+) \\(Rank ([0-9]+)\\)\\s*([0-9]+)', 'i'),
            warLevel : true,
            refresh  : 'battle_on.gif',
            image    : 'battle_on.gif'
        }
    },

    BattleFreshmeat: function (type) {
        try {
            var invadeOrDuel = config.getItem('BattleType', 'Invade'),
                target       = "//input[contains(@src,'" + this.battles[type][invadeOrDuel] + "')]",
                ss           = document.evaluate(target, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

            utility.log(1, 'target ', target);
            if (ss.snapshotLength <= 0) {
                utility.warn('Not on battlepage');
                return false;
            }

            var plusOneSafe = false,
                safeTargets = [],
                count       = 0,
                chainId     = '',
                chainAttack = false,
                inp         = null,
                yourRank    = 0,
                txt         = '',
                levelm   = '',
                minRank  = 0,
                maxLevel = 0,
                tempNum = 0,
                ARBase   = 0,
                ARMax    = 0,
                ARMin    = 0,
                levelMultiplier = 0,
                armyRatio = 0,
                dfl = '',
                tempRecord = {},
                battleRecord = {},
                tempText = '',
                tempTime = new Date(2009, 0, 1).getTime();

            chainId = state.getItem('BattleChainId', 0);
            state.setItem('BattleChainId', '');
            // Lets get our Freshmeat user settings
            minRank = config.getItem("FreshMeatMinRank", 99);
            utility.log(2, "FreshMeatMinRank", minRank);
            if (!utility.isNum(minRank)) {
                minRank = 99;
                utility.warn("FreshMeatMinRank is NaN, using default", minRank);
            }

            maxLevel = gm.getItem("FreshMeatMaxLevel", 99999, hiddenVar);
            utility.log(2, "FreshMeatMaxLevel", maxLevel);
            if (!utility.isNum(maxLevel)) {
                maxLevel = 99999;
                utility.warn("FreshMeatMaxLevel is NaN, using default", maxLevel);
            }

            ARBase = config.getItem("FreshMeatARBase", 0.5);
            utility.log(2, "FreshMeatARBase", ARBase);
            if (!utility.isNum(ARBase)) {
                ARBase = 0.5;
                utility.warn("FreshMeatARBase is NaN, using default", ARBase);
            }

            ARMax = gm.getItem("FreshMeatARMax", 99999, hiddenVar);
            utility.log(2, "FreshMeatARMax", ARMax);
            if (!utility.isNum(ARMax)) {
                ARMax = 99999;
                utility.warn("FreshMeatARMax is NaN, using default", ARMax);
            }

            ARMin = gm.getItem("FreshMeatARMin", 99999, hiddenVar);
            utility.log(2, "FreshMeatARMin", ARMin);
            if (!utility.isNum(ARMin)) {
                ARMin = 99999;
                utility.warn("FreshMeatARMin is NaN, using default", ARMin);
            }

            //utility.log(1, "my army/rank/level: " + this.stats.army.capped + "/" + this.stats.rank.battle + "/" + this.stats.level);
            for (var s = 0; s < ss.snapshotLength; s += 1) {
                tempTime = new Date(2009, 0, 1).getTime();
                tempRecord = {};
                tempRecord.button = ss.snapshotItem(s);
                var tr = tempRecord.button;

                if (!tr) {
                    utility.warn('No tr parent of button?');
                    continue;
                }

                levelm   = '';
                txt = '';
                if (type === 'Raid') {
                    tr = tr.parentNode.parentNode.parentNode.parentNode.parentNode;
                    txt = tr.childNodes[3].childNodes[3].textContent;
                    levelm = this.battles.Raid.regex1.exec(txt);
                    if (!levelm) {
                        utility.warn("Can't match Raid regex in ", txt);
                        continue;
                    }

                    tempRecord.rankNum = parseInt(levelm[1], 10);
                    tempRecord.rankStr = battle.battleRankTable[tempRecord.rankNum];
                    tempRecord.levelNum = parseInt(levelm[3], 10);
                    tempRecord.armyNum = parseInt(levelm[5], 10);
                } else {
                    while (tr.tagName.toLowerCase() !== "tr") {
                        tr = tr.parentNode;
                    }

                    tempRecord.deityNum = utility.NumberOnly(utility.CheckForImage('symbol_', tr).src.match(/\d+\.jpg/i)) - 1;
                    tempRecord.deityStr = this.demiTable[tempRecord.deityNum];
                    // If looking for demi points, and already full, continue
                    if (config.getItem('DemiPointsFirst', false) && !state.getItem('DemiPointsDone', true) && (config.getItem('WhenMonster', 'Never') !== 'Never')) {
                        utility.log(9, "Demi Points First", tempRecord.deityNum, tempRecord.deityStr, this.demi[tempRecord.deityStr], config.getItem('DemiPoint' + tempRecord.deityNum, true));
                        if (this.demi[tempRecord.deityStr].daily.dif <= 0 || !config.getItem('DemiPoint' + tempRecord.deityNum, true)) {
                            utility.log(1, "Daily Demi Points done for", tempRecord.deityStr);
                            continue;
                        }
                    }

                    txt = $.trim(nHtml.GetText(tr));
                    if (!txt.length) {
                        utility.warn("Can't find txt in tr");
                        continue;
                    }

                    if (this.battles.Freshmeat.warLevel) {
                        levelm = this.battles.Freshmeat.regex1.exec(txt);
                        if (!levelm) {
                            levelm = this.battles.Freshmeat.regex2.exec(txt);
                            this.battles.Freshmeat.warLevel = false;
                        }
                    } else {
                        levelm = this.battles.Freshmeat.regex2.exec(txt);
                        if (!levelm) {
                            levelm = this.battles.Freshmeat.regex1.exec(txt);
                            this.battles.Freshmeat.warLevel = true;
                        }
                    }

                    if (!levelm) {
                        utility.warn("Can't match Freshmeat regex in ", txt);
                        continue;
                    }

                    tempRecord.nameStr = levelm[1];
                    tempRecord.levelNum = parseInt(levelm[2], 10);
                    tempRecord.rankStr = levelm[3];
                    tempRecord.rankNum = parseInt(levelm[4], 10);
                    if (this.battles.Freshmeat.warLevel) {
                        tempRecord.warRankStr = levelm[5];
                        tempRecord.warRankNum = parseInt(levelm[6], 10);
                    }

                    if (this.battles.Freshmeat.warLevel) {
                        tempRecord.armyNum = parseInt(levelm[7], 10);
                    } else {
                        tempRecord.armyNum = parseInt(levelm[5], 10);
                    }
                }

                inp = nHtml.FindByAttrXPath(tr, "input", "@name='target_id'");
                if (!inp) {
                    utility.warn("Could not find 'target_id' input");
                    continue;
                }

                tempRecord.userId = parseInt(inp.value, 10);
                if (battle.hashCheck(tempRecord.userId)) {
                    continue;
                }

                levelMultiplier = this.stats.level / tempRecord.levelNum;
                armyRatio = ARBase * levelMultiplier;
                armyRatio = Math.min(armyRatio, ARMax);
                armyRatio = Math.max(armyRatio, ARMin);
                if (armyRatio <= 0) {
                    utility.warn("Bad ratio", armyRatio, ARBase, ARMin, ARMax, levelMultiplier);
                    continue;
                }

                utility.log(2, "Army Ratio: " + armyRatio + " Level: " + tempRecord.levelNum + " Rank: " + tempRecord.rankNum + " Army: " + tempRecord.armyNum);
                if (tempRecord.levelNum - this.stats.level > maxLevel) {
                    utility.log(2, "Greater than maxLevel", maxLevel);
                    continue;
                }

                if (config.getItem("BattleType", 'Invade') === "War" && this.battles.Freshmeat.warLevel) {
                    if (this.stats.rank.war && (this.stats.rank.war - tempRecord.warRankNum  > minRank)) {
                        utility.log(2, "Greater than minRank", minRank);
                        continue;
                    }
                } else {
                    if (this.stats.rank.battle && (this.stats.rank.battle - tempRecord.rankNum  > minRank)) {
                        utility.log(2, "Greater than minRank", minRank);
                        continue;
                    }
                }

                // if we know our army size, and this one is larger than armyRatio, don't battle
                if (this.stats.army.capped && (tempRecord.armyNum > (this.stats.army.capped * armyRatio))) {
                    utility.log(2, "Greater than armyRatio", armyRatio);
                    continue;
                }

                if (config.getItem("BattleType", 'Invade') === "War" && this.battles.Freshmeat.warLevel) {
                    utility.log(1, "ID: " + utility.rpad(tempRecord.userId.toString(), " ", 15) +
                                " Level: " + utility.rpad(tempRecord.levelNum.toString(), " ", 4) +
                                " War Rank: " + utility.rpad(tempRecord.warRankNum.toString(), " ", 2) +
                                " Army: " + tempRecord.armyNum);
                } else {
                    utility.log(1, "ID: " + utility.rpad(tempRecord.userId.toString(), " ", 15) +
                                " Level: " + utility.rpad(tempRecord.levelNum.toString(), " ", 4) +
                                " Battle Rank: " + utility.rpad(tempRecord.rankNum.toString(), " ", 2) +
                                " Army: " + tempRecord.armyNum);
                }

                // don't battle people we lost to in the last week
                battleRecord = battle.getItem(tempRecord.userId);
                switch (config.getItem("BattleType", 'Invade')) {
                case 'Invade' :
                    tempTime = battleRecord.invadeLostTime  ? battleRecord.invadeLostTime : new Date(2009, 0, 1).getTime();
                    break;
                case 'Duel' :
                    tempTime = battleRecord.duelLostTime ? battleRecord.duelLostTime : new Date(2009, 0, 1).getTime();
                    break;
                case 'War' :
                    tempTime = battleRecord.warlostTime ? battleRecord.warlostTime : new Date(2009, 0, 1).getTime();
                    break;
                default :
                    utility.warn("Battle type unknown!", config.getItem("BattleType", 'Invade'));
                }

                if (battleRecord && battleRecord.nameStr !== '' && !schedule.since(tempTime, 604800)) {
                    utility.log(1, "We lost " + config.getItem("BattleType", 'Invade') + " to this id this week: ", tempRecord.userId);
                    continue;
                }

                // don't battle people that were dead or hiding in the last hour
                tempTime = battleRecord.deadTime ? battleRecord.deadTime : new Date(2009, 0, 1).getTime();
                if (battleRecord && battleRecord.nameStr !== '' && !schedule.since(tempTime, 3600)) {
                    utility.log(1, "User was dead in the last hour: ", tempRecord.userId);
                    continue;
                }

                // don't battle people we've already chained to max in the last 2 days
                tempTime = battleRecord.chainTime ? battleRecord.chainTime : new Date(2009, 0, 1).getTime();
                if (battleRecord && battleRecord.nameStr !== '' && !schedule.since(tempTime, 86400)) {
                    utility.log(1, "We chained user within 2 days: ", tempRecord.userId);
                    continue;
                }

                // don't battle people that didn't meet chain gold or chain points in the last week
                tempTime = battleRecord.ignoreTime ? battleRecord.ignoreTime : new Date(2009, 0, 1).getTime();
                if (battleRecord && battleRecord.nameStr !== '' && !schedule.since(tempTime, 604800)) {
                    utility.log(1, "User didn't meet chain requirements this week: ", tempRecord.userId);
                    continue;
                }

                tempRecord.score = (type === 'Raid' ? 0 : tempRecord.rankNum) - (tempRecord.armyNum / levelMultiplier / this.stats.army.capped);
                if (tempRecord.userId === chainId) {
                    chainAttack = true;
                }

                tempRecord.targetNumber = s + 1;
                utility.log(2, "tempRecord/levelm", tempRecord, levelm);
                safeTargets[count] = tempRecord;
                count += 1;
                if (s === 0 && type === 'Raid') {
                    plusOneSafe = true;
                }

                for (var x = 0; x < count; x += 1) {
                    for (var y = 0 ; y < x ; y += 1) {
                        if (safeTargets[y].score < safeTargets[y + 1].score) {
                            tempRecord = safeTargets[y];
                            safeTargets[y] = safeTargets[y + 1];
                            safeTargets[y + 1] = tempRecord;
                        }
                    }
                }
            }

            if (count > 0) {
                var anyButton = null,
                    form      = null;

                if (chainAttack) {
                    anyButton = ss.snapshotItem(0);
                    form = anyButton.parentNode.parentNode;
                    inp = nHtml.FindByAttrXPath(form, "input", "@name='target_id'");
                    if (inp) {
                        inp.value = chainId;
                        utility.log(1, "Chain attacking: ", chainId);
                        this.ClickBattleButton(anyButton);
                        state.setItem("lastBattleID", chainId);
                        this.SetDivContent('battle_mess', 'Attacked: ' + state.getItem("lastBattleID", 0));
                        state.setItem("notSafeCount", 0);
                        return true;
                    }

                    utility.warn("Could not find 'target_id' input");
                } else if (config.getItem('PlusOneKills', false) && type === 'Raid') {
                    if (plusOneSafe) {
                        anyButton = ss.snapshotItem(0);
                        form = anyButton.parentNode.parentNode;
                        inp = nHtml.FindByAttrXPath(form, "input", "@name='target_id'");
                        if (inp) {
                            var firstId = parseInt(inp.value, 10);
                            inp.value = '200000000000001';
                            utility.log(1, "Target ID Overriden For +1 Kill. Expected Defender: ", firstId);
                            this.ClickBattleButton(anyButton);
                            state.setItem("lastBattleID", firstId);
                            this.SetDivContent('battle_mess', 'Attacked: ' + state.getItem("lastBattleID", 0));
                            state.setItem("notSafeCount", 0);
                            return true;
                        }

                        utility.warn("Could not find 'target_id' input");
                    } else {
                        utility.log(1, "Not safe for +1 kill.");
                    }
                } else {
                    for (var z = 0; z < count; z += 1) {
                        if (!state.getItem("lastBattleID", 0) && state.getItem("lastBattleID", 0) === safeTargets[z].id && z < count - 1) {
                            continue;
                        }

                        var bestButton = safeTargets[z].button;
                        if (bestButton !== null || bestButton !== undefined) {
                            utility.log(1, 'Found Target score: ' + safeTargets[z].score.toFixed(2) + ' id: ' + safeTargets[z].userId + ' Number: ' + safeTargets[z].targetNumber);
                            this.ClickBattleButton(bestButton);
                            delete safeTargets[z].score;
                            delete safeTargets[z].targetNumber;
                            delete safeTargets[z].button;
                            state.setItem("lastBattleID", safeTargets[z].userId);
                            safeTargets[z].aliveTime = new Date().getTime();
                            battleRecord = battle.getItem(safeTargets[z].userId);
                            $.extend(true, battleRecord, safeTargets[z]);
                            utility.log(1, "battleRecord", battleRecord);
                            battle.setItem(battleRecord);
                            this.SetDivContent('battle_mess', 'Attacked: ' + state.getItem("lastBattleID", 0));
                            state.setItem("notSafeCount", 0);
                            return true;
                        }

                        utility.warn('Attack button is null');
                    }
                }
            }

            state.setItem("notSafeCount", state.getItem("notSafeCount", 0) + 1);
            // add a schedule here for 5 mins or so
            if (state.getItem("notSafeCount", 0) > 100) {
                this.SetDivContent('battle_mess', 'Leaving Battle. Will Return Soon.');
                utility.log(1, 'No safe targets limit reached. Releasing control for other processes: ', state.getItem("notSafeCount", 0));
                state.setItem("notSafeCount", 0);
                return false;
            }

            this.SetDivContent('battle_mess', 'No targets matching criteria');
            utility.log(1, 'No safe targets: ', state.getItem("notSafeCount", 0));

            if (type === 'Raid') {
                var engageButton = monster.engageButtons[state.getItem('targetFromraid', '')];
                if (state.getItem("page", '') === 'raid' && engageButton) {
                    utility.Click(engageButton);
                } else {
                    schedule.setItem("RaidNoTargetDelay", gm.getItem("RaidNoTargetDelay", 45, hiddenVar));
                    utility.NavigateTo(this.battlePage + ',raid');
                }
            } else {
                utility.NavigateTo(this.battlePage + ',battle_on.gif');
            }

            return true;
        } catch (err) {
            utility.error("ERROR in BattleFreshmeat: " + err);
            return utility.ClickAjax('raid.php');
        }
    },

    CheckKeep: function () {
        try {
            if (!schedule.check("keep")) {
                return false;
            }

            utility.log(1, 'Visiting keep to get stats');
            return utility.NavigateTo('keep', 'tab_stats_on.gif');
        } catch (err) {
            utility.error("ERROR in CheckKeep: " + err);
            return false;
        }
    },

    CheckOracle: function () {
        try {
            if (!schedule.check("oracle")) {
                return false;
            }

            utility.log(9, "Checking Oracle for Favor Points");
            return utility.NavigateTo('oracle', 'oracle_on.gif');
        } catch (err) {
            utility.error("ERROR in CheckOracle: " + err);
            return false;
        }
    },

    CheckBattleRank: function () {
        try {
            if (!schedule.check("battlerank") || this.stats.level < 8) {
                return false;
            }

            utility.log(1, 'Visiting Battle Rank to get stats');
            return utility.NavigateTo('battle,battlerank', 'tab_battle_rank_on.gif');
        } catch (err) {
            utility.error("ERROR in CheckBattleRank: " + err);
            return false;
        }
    },

    CheckWarRank: function () {
        try {
            if (!schedule.check("warrank") || this.stats.level < 100) {
                return false;
            }

            utility.log(1, 'Visiting War Rank to get stats');
            return utility.NavigateTo('battle,war_rank', 'tab_war_on.gif');
        } catch (err) {
            utility.error("ERROR in CheckWar: " + err);
            return false;
        }
    },

    CheckGenerals: function () {
        try {
            if (!schedule.check("generals")) {
                return false;
            }

            utility.log(1, "Visiting generals to get 'General' list");
            return utility.NavigateTo('mercenary,generals', 'tab_generals_on.gif');
        } catch (err) {
            utility.error("ERROR in CheckGenerals: " + err);
            return false;
        }
    },

    CheckSoldiers: function () {
        try {
            if (!schedule.check("soldiers")) {
                return false;
            }

            utility.log(9, "Checking Soldiers");
            return utility.NavigateTo('soldiers', 'tab_soldiers_on.gif');
        } catch (err) {
            utility.error("ERROR in CheckSoldiers: " + err);
            return false;
        }
    },


    CheckItem: function () {
        try {
            if (!schedule.check("item")) {
                return false;
            }

            utility.log(9, "Checking Item");
            return utility.NavigateTo('soldiers,item', 'tab_black_smith_on.gif');
        } catch (err) {
            utility.error("ERROR in CheckItem: " + err);
            return false;
        }
    },

    CheckMagic: function () {
        try {
            if (!schedule.check("magic")) {
                return false;
            }

            utility.log(9, "Checking Magic");
            return utility.NavigateTo('soldiers,magic', 'tab_magic_on.gif');
        } catch (err) {
            utility.error("ERROR in CheckMagic: " + err);
            return false;
        }
    },

    CheckAchievements: function () {
        try {
            if (!schedule.check("achievements")) {
                return false;
            }

            utility.log(1, 'Visiting achievements to get stats');
            return utility.NavigateTo('keep,achievements', 'tab_achievements_on.gif');
        } catch (err) {
            utility.error("ERROR in CheckAchievements: " + err);
            return false;
        }
    },

    CheckSymbolQuests: function () {
        try {
            if (!schedule.check("symbolquests") || this.stats.level < 8) {
                return false;
            }

            utility.log(1, "Visiting symbolquests to get 'Demi-Power' points");
            return utility.NavigateTo('quests,symbolquests', 'demi_quest_on.gif');
        } catch (err) {
            utility.error("ERROR in CheckSymbolQuests: " + err);
            return false;
        }
    },

    CheckCharacterClasses: function () {
        try {
            if (!schedule.check("view_class_progress") || this.stats.level < 100) {
                return false;
            }

            utility.log(9, "Checking Monster Class to get Character Class Stats");
            return utility.NavigateTo('battle_monster,view_class_progress', 'nm_class_whole_progress_bar.jpg');
        } catch (err) {
            utility.error("ERROR in CheckCharacterClasses: " + err);
            return false;
        }
    },

    CheckGift: function () {
        try {
            if (!schedule.check("gift")) {
                return false;
            }

            utility.log(9, "Checking Gift");
            return utility.NavigateTo('army,gift', 'tab_gifts_on.gif');
        } catch (err) {
            utility.error("ERROR in CheckGift: " + err);
            return false;
        }
    },

    battleWarnLevel: true,

    Battle: function (mode) {
        try {
            var whenBattle    = '',
                target        = '',
                battletype    = '',
                useGeneral    = '',
                staminaReq    = 0,
                chainImg      = '',
                button        = null,
                raidName      = '',
                dfl           = '',
                battleChainId = 0,
                targetMonster = '',
                whenMonster   = '',
                targetType    = '',
                rejoinSecs    = '',
                battleRecord  = {},
                tempTime      = new Date(2009, 0, 1).getTime();

            if (this.stats.level < 8) {
                if (this.battleWarnLevel) {
                    utility.log(1, "Battle: Unlock at level 8");
                    this.battleWarnLevel = false;
                }

                return false;
            }

            whenBattle = config.getItem('WhenBattle', 'Never');
            whenMonster = config.getItem('WhenMonster', 'Never');
            targetMonster = state.getItem('targetFrombattle_monster', '');
            switch (whenBattle) {
            case 'Never' :
                this.SetDivContent('battle_mess', 'Battle off');
                return false;
            case 'Stay Hidden' :
                if (!this.NeedToHide()) {
                    this.SetDivContent('battle_mess', 'We Dont Need To Hide Yet');
                    utility.log(1, 'We Dont Need To Hide Yet');
                    return false;
                }

                break;
            case 'No Monster' :
                if (mode !== 'DemiPoints') {
                    if (whenMonster !== 'Never' && targetMonster && !targetMonster.match(/the deathrune siege/i)) {
                        return false;
                    }
                }

                break;
            case 'Demi Points Only' :
                if (mode === 'DemiPoints' && whenMonster === 'Never') {
                    return false;
                }

                if (mode !== 'DemiPoints' && whenMonster !== 'Never' && targetMonster && !targetMonster.match(/the deathrune siege/i)) {
                    return false;
                }

                if (state.getItem('DemiPointsDone', true)) {
                    return false;
                }

                break;
            default :
            }

            if (this.CheckKeep()) {
                return true;
            } else if (this.stats.health.num < 10) {
                utility.log(9, 'Health is less than 10: ', this.stats.health.num);
                return false;
            } else if (this.stats.health.num < 12) {
                utility.log(9, 'Unsafe. Health is less than 12: ', this.stats.health.num);
                return false;
            }

            target = this.GetCurrentBattleTarget(mode);
            utility.log(9, 'Mode/Target', mode, target);
            if (!target) {
                utility.log(1, 'No valid battle target');
                return false;
            } else if (!utility.isNum(target)) {
                target = target.toLowerCase();
            }

            if (target === 'noraid') {
                utility.log(9, 'No Raid To Attack');
                return false;
            }

            battletype = config.getItem('BattleType', 'Invade');
            switch (battletype) {
            case 'Invade' :
                useGeneral = 'BattleGeneral';
                staminaReq = 1;
                chainImg = 'battle_invade_again.gif';
                if (general.LevelUpCheck(useGeneral)) {
                    useGeneral = 'LevelUpGeneral';
                    utility.log(1, 'Using level up general');
                }

                break;
            case 'Duel' :
                useGeneral = 'DuelGeneral';
                staminaReq = 1;
                chainImg = 'battle_duel_again.gif';
                if (general.LevelUpCheck(useGeneral)) {
                    useGeneral = 'LevelUpGeneral';
                    utility.log(1, 'Using level up general');
                }

                break;
            case 'War' :
                useGeneral = 'WarGeneral';
                staminaReq = 10;
                chainImg = 'battle_duel_again.gif';
                if (general.LevelUpCheck(useGeneral)) {
                    useGeneral = 'LevelUpGeneral';
                    utility.log(1, 'Using level up general');
                }

                break;
            default :
                utility.warn('Unknown battle type ', battletype);
                return false;
            }

            if (!this.CheckStamina('Battle', staminaReq)) {
                utility.log(9, 'Not enough stamina for ', battletype);
                return false;
            } else if (general.Select(useGeneral)) {
                return true;
            }

            // Check if we should chain attack
            if ($("img[src*='battle_victory.gif']").length) {
                button = utility.CheckForImage(chainImg);
                battleChainId = state.getItem("BattleChainId", 0);
                if (button && battleChainId) {
                    this.SetDivContent('battle_mess', 'Chain Attack In Progress');
                    utility.log(1, 'Chaining Target', battleChainId);
                    this.ClickBattleButton(button);
                    state.setItem("BattleChainId", 0);
                    return true;
                }
            }

            if (!state.getItem("notSafeCount", 0)) {
                state.setItem("notSafeCount", 0);
            }

            utility.log(1, 'Battle Target', target);
            targetType = config.getItem('TargetType', 'Invade');
            switch (target) {
            case 'raid' :
                if (!schedule.check("RaidNoTargetDelay")) {
                    rejoinSecs = ((schedule.getItem("RaidNoTargetDelay").next - new Date().getTime()) / 1000).toFixed() + ' secs';
                    utility.log(1, 'Rejoining the raid in', rejoinSecs);
                    this.SetDivContent('battle_mess', 'Joining the Raid in ' + rejoinSecs);
                    return true;
                }

                this.SetDivContent('battle_mess', 'Joining the Raid');
                if (utility.NavigateTo(this.battlePage + ',raid', 'tab_raid_on.gif')) {
                    return true;
                }

                if (config.getItem('clearCompleteRaids', false) && monster.completeButton.raid) {
                    utility.Click(monster.completeButton.raid, 1000);
                    monster.completeButton.raid = '';
                    utility.log(1, 'Cleared a completed raid');
                    return true;
                }

                raidName = state.getItem('targetFromraid', '');
                if (!$("div[style*='dragon_title_owner']").length) {
                    button = monster.engageButtons[raidName];
                    if (button) {
                        utility.Click(button);
                        return true;
                    }

                    utility.warn('Unable to engage raid', raidName);
                    return false;
                }

                if (monster.ConfirmRightPage(raidName)) {
                    return true;
                }

                // The user can specify 'raid' in their Userid List to get us here. In that case we need to adjust NextBattleTarget when we are done
                if (targetType === "Userid List") {
                    if (this.BattleFreshmeat('Raid')) {
                        if ($("span[class*='result_body']").length) {
                            this.NextBattleTarget();
                        }

                        if (state.getItem("notSafeCount", 0) > 10) {
                            state.setItem("notSafeCount", 0);
                            this.NextBattleTarget();
                        }

                        return true;
                    }

                    utility.warn('Doing Raid UserID list, but no target');
                    return false;
                }

                return this.BattleFreshmeat('Raid');
            case 'freshmeat' :
                if (utility.NavigateTo(this.battlePage, 'battle_on.gif')) {
                    return true;
                }

                this.SetDivContent('battle_mess', 'Battling ' + target);
                // The user can specify 'freshmeat' in their Userid List to get us here. In that case we need to adjust NextBattleTarget when we are done
                if (targetType === "Userid List") {
                    if (this.BattleFreshmeat('Freshmeat')) {
                        if ($("span[class*='result_body']").length) {
                            this.NextBattleTarget();
                        }

                        if (state.getItem("notSafeCount", 0) > 10) {
                            state.setItem("notSafeCount", 0);
                            this.NextBattleTarget();
                        }

                        return true;
                    }

                    utility.warn('Doing Freshmeat UserID list, but no target');
                    return false;
                }

                return this.BattleFreshmeat('Freshmeat');
            default:
                battleRecord = battle.getItem(target);
                switch (config.getItem("BattleType", 'Invade')) {
                case 'Invade' :
                    tempTime = battleRecord.invadeLostTime ? battleRecord.invadeLostTime : tempTime;
                    break;
                case 'Duel' :
                    tempTime = battleRecord.duelLostTime ? battleRecord.duelLostTime : tempTime;
                    break;
                case 'War' :
                    tempTime = battleRecord.warlostTime ? battleRecord.warlostTime : tempTime;
                    break;
                default :
                    utility.warn("Battle type unknown!", config.getItem("BattleType", 'Invade'));
                }

                if (battleRecord && battleRecord.nameStr !== '' && !schedule.since(tempTime, 604800)) {
                    utility.log(1, 'Avoiding Losing Target', target);
                    this.NextBattleTarget();
                    return true;
                }

                if (utility.NavigateTo(this.battlePage, 'battle_on.gif')) {
                    return true;
                }

                state.setItem('BattleChainId', 0);
                if (this.BattleUserId(target)) {
                    this.NextBattleTarget();
                    return true;
                }

                utility.warn('Doing default UserID list, but no target');
                return false;
            }
        } catch (err) {
            utility.error("ERROR in Battle: " + err);
            return false;
        }
    },

    NextBattleTarget: function () {
        state.setItem('BattleTargetUpto', state.getItem('BattleTargetUpto', 0) + 1);
    },

    GetCurrentBattleTarget: function (mode) {
        try {
            var target     = '',
                targets    = [],
                battleUpto = '',
                targetType = '',
                targetRaid = '';

            targetType = config.getItem('TargetType', 'Freshmeat');
            targetRaid = state.getItem('targetFromraid', '');
            if (mode === 'DemiPoints') {
                if (targetRaid && targetType === 'Raid') {
                    return 'Raid';
                }

                return 'Freshmeat';
            }

            if (targetType === 'Raid') {
                if (targetRaid) {
                    return 'Raid';
                }

                this.SetDivContent('battle_mess', 'No Raid To Attack');
                return 'NoRaid';
            }

            if (targetType === 'Freshmeat') {
                return 'Freshmeat';
            }

            target = state.getItem('BattleChainId', 0);
            if (target) {
                return target;
            }

            targets = utility.TextToArray(config.getItem('BattleTargets', ''));
            if (!targets.length) {
                return false;
            }

            battleUpto = state.getItem('BattleTargetUpto', 0);
            if (battleUpto > targets.length - 1) {
                battleUpto = 0;
                state.setItem('BattleTargetUpto', 0);
            }

            if (!targets[battleUpto]) {
                this.NextBattleTarget();
                return false;
            }

            this.SetDivContent('battle_mess', 'Battling User ' + battleUpto + '/' + targets.length + ' ' + targets[battleUpto]);
            if ((!utility.isNum(targets[battleUpto]) ? targets[battleUpto].toLowerCase() : targets[battleUpto]) === 'raid') {
                if (targetRaid) {
                    return 'Raid';
                }

                this.SetDivContent('battle_mess', 'No Raid To Attack');
                this.NextBattleTarget();
                return false;
            }

            return targets[battleUpto];
        } catch (err) {
            utility.error("ERROR in GetCurrentBattleTarget: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          ATTACKING MONSTERS
    /////////////////////////////////////////////////////////////////////

    CheckResults_guild_current_battles: function () {
        try {
            var tempDiv = null,
                buttonsEl = null;

            tempDiv = $("img[src*='guild_symbol']");
            if (tempDiv && tempDiv.length) {
                tempDiv.each(function () {
                    utility.log(1, "name", $.trim($(this).parent().parent().next().text()));
                    utility.log(1, "button", $(this).parent().parent().parent().next().find("input[src*='dragon_list_btn_']"));
                });
            } else {
                return false;
            }

            return true;
        } catch (err) {
            utility.error("ERROR in CheckResults_guild_current_battles: " + err);
            return false;
        }
    },

    CheckResults_fightList: function () {
        try {
            utility.log(9, "CheckResults_fightList - get all buttons to check monsterObjectList");
            // get all buttons to check monsterObjectList
            var ss = document.evaluate(".//img[contains(@src,'dragon_list_btn_') or contains(@src,'mp_button_summon_')]", document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (ss.snapshotLength === 0) {

                utility.warn("No monster buttons found");
                return false;
            }

            var page                  = state.getItem('page', 'battle_monster'),
                firstMonsterButtonDiv = utility.CheckForImage('dragon_list_btn_');

            if ((firstMonsterButtonDiv) && !(firstMonsterButtonDiv.parentNode.href.match('user=' + this.stats.FBID) ||
                    firstMonsterButtonDiv.parentNode.href.match(/alchemy\.php/))) {
                var pageUserCheck = state.getItem('pageUserCheck', '');
                if (pageUserCheck) {
                    utility.log(1, "On another player's keep.", pageUserCheck);
                    return false;
                }
            }

            if (page === 'battle_monster' && ss.snapshotLength === 1) {
                utility.log(1, "No monsters to review");
                state.setItem('reviewDone', true);
                return true;
            }

            var startCount = 0;
            if (page === 'battle_monster') {
                startCount = 1;
            }

            utility.log(9, "startCount", startCount);
            // Review monsters and find attack and fortify button
            var monsterReviewed = {};
            for (var s = startCount; s < ss.snapshotLength; s += 1) {
                var engageButtonName = ss.snapshotItem(s).src.match(/dragon_list_btn_\d/i)[0],
                    monsterRow       = ss.snapshotItem(s).parentNode.parentNode.parentNode.parentNode,
                    monsterFull      = $.trim(nHtml.GetText(monsterRow)),
                    monsterName          = $.trim(monsterFull.replace('Completed!', '').replace(/Fled!/i, ''));

                // Make links for easy clickin'
                var url = ss.snapshotItem(s).parentNode.href;
                if (!(url && url.match(/user=/) && (url.match(/mpool=/) || url.match(/raid\.php/)))) {
                    continue;
                }

                utility.log(5, "monster", monsterName);
                monsterReviewed = monster.getItem(monsterName);
                monsterReviewed.page = page;
                switch (engageButtonName) {
                case 'dragon_list_btn_2' :
                    monsterReviewed.status = 'Collect Reward';
                    monsterReviewed.color = 'grey';
                    break;
                case 'dragon_list_btn_3' :
                    monster.engageButtons[monsterName] = ss.snapshotItem(s);
                    break;
                case 'dragon_list_btn_4' :
                    if (page === 'raid' && !(/!/.test(monsterFull))) {
                        monster.engageButtons[monsterName] = ss.snapshotItem(s);
                        break;
                    }

                    if (!monster.completeButton[page]) {
                        monster.completeButton[page] = utility.CheckForImage('cancelButton.gif', monsterRow);
                    }

                    monsterReviewed.status = 'Complete';
                    monsterReviewed.color = 'grey';
                    break;
                default :
                }

                var mpool     = ((url.match(/mpool=\d+/i)) ? '&mpool=' + url.match(/mpool=\d+/i)[0].split('=')[1] : ''),
                    monstType = monster.type(monsterName),
                    siege     = '';

                if (monstType === 'Siege') {
                    siege = "&action=doObjective";
                } else {
                    var boss = monster.info[monstType];
                    siege = (boss && boss.siege) ? "&action=doObjective" : '';
                }

                var link = "<a href='http://apps.facebook.com/castle_age/" + page + ".php?casuser=" +
                            url.match(/user=\d+/i)[0].split('=')[1] + mpool + siege + "'>Link</a>";

                monsterReviewed.link = link;
                monster.setItem(monsterReviewed);
            }

            var it = 0,
                delList = [];

            for (it = 0; it < monster.records.length; it += 1) {
                if (monster.records[it].page === '') {
                    delList.push(monster.records[it].name);
                }
            }

            for (it = 0; it < delList.length; it += 1) {
                monster.deleteItem(delList[it]);
            }

            state.setItem('reviewDone', true);
            this.UpdateDashboard(true);
            return true;
        } catch (err) {
            utility.error("ERROR in CheckResults_fightList: " + err);
            return false;
        }
    },

    CheckResults_viewFight: function () {
        try {
            var missRegEx         = new RegExp(".*Need (\\d+) more.*"),
                currentMonster    = {},
                time              = [],
                currentPhase      = 0,
                miss              = '',
                tempDiv           = null,
                tempText          = '',
                tempArr           = [],
                counter           = 0,
                monstHealthImg    = '',
                totalCount        = 0,
                ind               = 0,
                divSeigeLogs      = null,
                divSeigeCount     = 0,
                achLevel          = 0,
                maxDamage         = 0,
                maxToFortify      = 0,
                isTarget          = false,
                KOBenable         = false,
                KOBbiasHours      = 0,
                KOBach            = false,
                KOBmax            = false,
                KOBminFort        = false,
                KOBtmp            = 0,
                KOBtimeLeft       = 0,
                KOBbiasedTF       = 0,
                KOBPercentTimeRemaining = 0,
                KOBtotalMonsterTime = 0,
                monsterDiv        = null,
                damageDiv         = null,
                chatDiv           = null,
                chatArr           = [],
                chatHtml          = '';

            chatDiv = $("#app46755028429_chat_log div[style*='hidden'] div[style*='320px']");
            if (chatDiv && chatDiv.length) {
                chatDiv.each(function () {
                    chatHtml = $.trim($(this).html());
                    if (chatHtml) {
                        chatArr = chatHtml.split("<br>");
                        if (chatArr && chatArr.length === 2) {
                            tempArr = chatArr[1].replace(/"/g, '').match(new RegExp('.*(http:.*)'));
                            if (tempArr && tempArr.length === 2 && tempArr[1]) {
                                tempArr = tempArr[1].split(" ");
                                if (tempArr && tempArr.length) {
                                    tempText = "<a href='" + tempArr[0] + "'>" + tempArr[0] + "</a>";
                                    chatHtml = chatHtml.replace(tempArr[0], tempText);
                                    $(this).html(chatHtml);
                                }
                            }
                        }
                    }
                });
            }

            monsterDiv = $("div[style*='dragon_title_owner']");
            if (monsterDiv && monsterDiv.length) {
                tempText = $.trim(monsterDiv.children(":eq(2)").text());
            } else {
                monsterDiv = $("div[style*='nm_top']");
                if (monsterDiv && monsterDiv.length) {
                    tempText = $.trim(monsterDiv.children(":eq(0)").children(":eq(0)").text());
                    tempDiv = $("div[style*='nm_bars']");
                    if (tempDiv && tempDiv.length) {
                        tempText += ' ' + $.trim(tempDiv.children(":eq(0)").children(":eq(0)").children(":eq(0)").siblings(":last").children(":eq(0)").text()).replace("'s Life", "");
                    } else {
                        utility.warn("Problem finding nm_bars");
                        return;
                    }
                } else {
                    utility.warn("Problem finding dragon_title_owner and nm_top");
                    return;
                }
            }

            if (monsterDiv.find("img[uid='" + this.stats.FBID + "']").length) {
                utility.log(2, "monster name found");
                tempText = tempText.replace(new RegExp(".+'s "), 'Your ');
            }

            utility.log(2, "monster name", tempText);
            currentMonster = monster.getItem(tempText);
            if (currentMonster.type === '') {
                currentMonster.type = monster.type(currentMonster.name);
            }

            if (currentMonster.type === 'Siege') {
                tempDiv = $("div[style*='raid_back']");
                if (tempDiv && tempDiv.length) {
                    if (tempDiv.find("img[src*='raid_1_large.jpg']").length) {
                        currentMonster.type = 'Raid I';
                    } else if (tempDiv.find("img[src*='raid_b1_large.jpg']").length) {
                        currentMonster.type = 'Raid II';
                    } else if (tempDiv.find("img[src*='raid_1_large_victory.jpg']").length) {
                        utility.log(1, "Siege Victory!");
                    } else {
                        utility.warn("Problem finding raid image! Probably finished.");
                    }
                } else {
                    utility.warn("Problem finding raid_back");
                    return;
                }
            }

            currentMonster.review = new Date().getTime();
            state.setItem('monsterRepeatCount', 0);
            // Extract info
            tempDiv = $("#app46755028429_monsterTicker");
            if (tempDiv && tempDiv.length) {
                utility.log(2, "Monster ticker found.");
                time = tempDiv.text().split(":");
            } else {
                if (!utility.CheckForImage("dead.jpg")) {
                    utility.warn("Could not locate Monster ticker.");
                }
            }

            if (time && time.length === 3 && monster.info[currentMonster.type] && monster.info[currentMonster.type].fort) {
                if (currentMonster.type === "Deathrune" || currentMonster.type === 'Ice Elemental') {
                    currentMonster.fortify = 100;
                } else {
                    currentMonster.fortify = 0;
                }

                switch (monster.info[currentMonster.type].defense_img) {
                case 'bar_dispel.gif' :
                    tempDiv = $("img[src*='" + monster.info[currentMonster.type].defense_img + "']");
                    if (tempDiv && tempDiv.length) {
                        currentMonster.fortify = 100 - parseFloat(tempDiv.parent().css('width'));
                    } else {
                        utility.warn("Unable to find defense bar", monster.info[currentMonster.type].defense_img);
                    }

                    break;
                case 'seamonster_ship_health.jpg' :
                    tempDiv = $("img[src*='" + monster.info[currentMonster.type].defense_img + "']");
                    if (tempDiv && tempDiv.length) {
                        currentMonster.fortify = parseFloat(tempDiv.parent().css('width'));
                        if (monster.info[currentMonster.type].repair_img) {
                            tempDiv = $("img[src*='" + monster.info[currentMonster.type].repair_img + "']");
                            if (tempDiv && tempDiv.length) {
                                currentMonster.fortify = currentMonster.fortify * (100 / (100 - parseFloat(tempDiv.parent().css('width'))));
                            } else {
                                utility.warn("Unable to find repair bar", monster.info[currentMonster.type].repair_img);
                            }
                        }
                    } else {
                        utility.warn("Unable to find defense bar", monster.info[currentMonster.type].defense_img);
                    }

                    break;
                case 'nm_green.jpg' :
                    tempDiv = $("img[src*='" + monster.info[currentMonster.type].defense_img + "']");
                    if (tempDiv && tempDiv.length) {
                        currentMonster.fortify = parseFloat(tempDiv.parent().css('width'));
                        currentMonster.strength = parseFloat(tempDiv.parent().parent().css('width'));
                    } else {
                        utility.warn("Unable to find defense bar", monster.info[currentMonster.type].defense_img);
                    }

                    break;
                default:
                    utility.warn("No match for defense_img", monster.info[currentMonster.type].defense_img);
                }
            }

            // Get damage done to monster
            damageDiv = $("td[class='dragonContainer'] td[valign='top'] a[href*='user=" + this.stats.FBID + "']");
            if (damageDiv && damageDiv.length) {
                if (monster.info[currentMonster.type] && monster.info[currentMonster.type].defense) {
                    tempArr = $.trim(damageDiv.parent().parent().siblings(":last").text()).match(new RegExp("([0-9,]+) dmg / ([0-9,]+) def"));
                    if (tempArr && tempArr.length === 3) {
                        currentMonster.attacked = utility.NumberOnly(tempArr[1]);
                        currentMonster.defended = utility.NumberOnly(tempArr[2]);
                        currentMonster.damage = currentMonster.attacked + currentMonster.defended;
                    } else {
                        utility.warn("Unable to get attacked and defended damage");
                    }
                } else if (currentMonster.type === 'Siege' || (monster.info[currentMonster.type] && monster.info[currentMonster.type].raid)) {
                    currentMonster.attacked = utility.NumberOnly($.trim(damageDiv.parent().siblings(":last").text()));
                    currentMonster.damage = currentMonster.attacked;
                } else {
                    currentMonster.attacked = utility.NumberOnly($.trim(damageDiv.parent().parent().siblings(":last").text()));
                    currentMonster.damage = currentMonster.attacked;
                }

                damageDiv.parents("tr:first").css('background-color', gm.getItem("HighlightColor", '#C6A56F', hiddenVar));
            } else {
                utility.log(1, "Player hasn't done damage yet");
            }

            if (/:ac\b/.test(currentMonster.conditions) ||
                    (currentMonster.type.match(/Raid/) && config.getItem('raidCollectReward', false)) ||
                    (!currentMonster.type.match(/Raid/) && config.getItem('monsterCollectReward', false))) {

                counter = state.getItem('monsterReviewCounter', -3);
                if (counter >= 0 && monster.records[counter] && monster.records[counter].name === currentMonster.name && ($("a[href*='&action=collectReward']").length || $("input[alt*='Collect Reward']").length)) {
                    utility.log(1, 'Collecting Reward');
                    currentMonster.review = 1;
                    state.setItem('monsterReviewCounter', counter -= 1);
                    currentMonster.status = 'Collect Reward';
                    if (currentMonster.name.indexOf('Siege') >= 0) {
                        if ($("a[href*='&rix=1']").length) {
                            currentMonster.rix = 1;
                        } else {
                            currentMonster.rix = 2;
                        }
                    }
                }
            }

            if (monster.info[currentMonster.type] && monster.info[currentMonster.type].alpha) {
                monstHealthImg = 'nm_red.jpg';
            } else {
                monstHealthImg = 'monster_health_background.jpg';
            }

            monsterDiv = $("img[src*='" + monstHealthImg + "']");
            if (time && time.length === 3 && monsterDiv && monsterDiv.length) {
                currentMonster.timeLeft = time[0] + ":" + time[1];
                if (monsterDiv && monsterDiv.length) {
                    utility.log(2, "Found monster health div.");
                    currentMonster.life = parseFloat(monsterDiv.parent().css("width"));
                } else {
                    utility.warn("Could not find monster health div.");
                }

                if (currentMonster.life) {
                    if (!monster.info[currentMonster.type]) {
                        monster.setItem(currentMonster);
                        utility.warn('Unknown monster');
                        return;
                    }
                }

                if (damageDiv && damageDiv.length && monster.info[currentMonster.type] && monster.info[currentMonster.type].alpha) {
                    // Character type stuff
                    monsterDiv = $("div[style*='nm_bottom']");
                    if (monsterDiv && monsterDiv.length) {
                        tempText = $.trim(monsterDiv.children().eq(0).children().text()).replace(new RegExp("[\\s\\s]+", 'g'), ' ');
                        if (tempText) {
                            utility.log(2, "tempText", tempText);
                            tempArr = tempText.match(/Class: (\w+) /);
                            if (tempArr && tempArr.length === 2) {
                                currentMonster.charClass = tempArr[1];
                                utility.log(2, "character", currentMonster.charClass);
                            } else {
                                utility.warn("Can't get character", tempArr);
                            }

                            tempArr = tempText.match(/Tip: ([\w ]+) Status/);
                            if (tempArr && tempArr.length === 2) {
                                currentMonster.tip = tempArr[1];
                                utility.log(2, "tip", currentMonster.tip);
                            } else {
                                utility.warn("Can't get tip", tempArr);
                            }

                            tempArr = tempText.match(/Status Time Remaining: ([0-9]+):([0-9]+):([0-9]+)\s*/);
                            if (tempArr && tempArr.length === 4) {
                                currentMonster.stunTime = new Date().getTime() + (tempArr[1] * 60 * 60 * 1000) + (tempArr[2] * 60 * 1000) + (tempArr[3] * 1000);
                                utility.log(2, "statusTime", currentMonster.stunTime);
                            } else {
                                utility.warn("Can't get statusTime", tempArr);
                            }

                            tempDiv = monsterDiv.find("img[src*='nm_stun_bar']");
                            if (tempDiv && tempDiv.length) {
                                tempText = tempDiv.css('width');
                                utility.log(2, "tempText", tempText);
                                if (tempText) {
                                    currentMonster.stun = utility.NumberOnly(tempText);
                                    utility.log(2, "stun", currentMonster.stun);
                                } else {
                                    utility.warn("Can't get stun bar width");
                                }
                            } else {
                                if (currentMonster.strength !== 100) {
                                    utility.warn("Can't get stun bar");
                                }
                            }

                            if (currentMonster.charClass && currentMonster.tip && currentMonster.stun !== -1) {
                                currentMonster.stunDo = new RegExp(currentMonster.charClass).test(currentMonster.tip) && currentMonster.stun < 100;
                                currentMonster.stunType = '';
                                if (currentMonster.stunDo) {
                                    utility.log(1, "Do character specific attack", currentMonster.stunDo);
                                    tempArr = currentMonster.tip.split(" ");
                                    if (tempArr && tempArr.length) {
                                        tempText = tempArr[tempArr.length - 1].toLowerCase();
                                        tempArr = ["strengthen", "cripple", "heal", "deflection"];
                                        if (tempText && tempArr.indexOf(tempText) >= 0) {
                                            currentMonster.stunType = tempText.replace("ion", '');
                                            utility.log(1, "Character specific attack type", currentMonster.stunType);
                                        } else {
                                            utility.warn("Type does match list!", tempText);
                                        }
                                    } else {
                                        utility.warn("Unable to get type from tip!", currentMonster.tip);
                                    }
                                }
                            } else {
                                utility.warn("Missing 'class', 'tip' or 'stun'", currentMonster);
                            }
                        } else {
                            utility.warn("Missing tempText");
                        }
                    } else {
                        utility.warn("Missing nm_bottom");
                    }
                }

                if (monster.info[currentMonster.type] && monster.info[currentMonster.type].siege) {
                    if (monster.info[currentMonster.type].alpha) {
                        miss = $.trim($("div[style*='nm_bottom']").children(":last").children(":last").children(":last").children(":last").text()).replace(missRegEx, "$1");
                    } else if (currentMonster.type.indexOf('Raid') >= 0) {
                        tempDiv = $("img[src*='" + monster.info[currentMonster.type].siege_img + "']");
                        miss = $.trim(tempDiv.parent().parent().text()).replace(missRegEx, "$1");
                    } else {
                        miss = $.trim($("#app46755028429_action_logs").prev().children().eq(3).children().eq(2).children().eq(1).text()).replace(missRegEx, "$1");
                    }

                    if (currentMonster.type.indexOf('Raid') >= 0) {
                        totalCount = utility.NumberOnly(utility.getHTMLPredicate(tempDiv.attr("src")));
                    } else {
                        totalCount = 1;
                        for (ind = 0; ind < monster.info[currentMonster.type].siege_img.length; ind += 1) {
                            totalCount += $("img[src*=" + monster.info[currentMonster.type].siege_img[ind] + "]").size();
                        }
                    }

                    currentPhase = Math.min(totalCount, monster.info[currentMonster.type].siege);
                    currentMonster.phase = Math.min(currentPhase, monster.info[currentMonster.type].siege) + "/" + monster.info[currentMonster.type].siege + " need " + (isNaN(miss) ? 0 : miss);
                }

                if (monster.info[currentMonster.type]) {
                    if (isNaN(miss)) {
                        miss = 0;
                    }

                    currentMonster.t2k = monster.t2kCalc(monster.info[currentMonster.type], time, currentMonster.life, currentPhase, miss);
                }
            } else {
                utility.log(1, 'Monster is dead or fled');
                currentMonster.color = 'grey';
                if (currentMonster.status !== 'Complete' && currentMonster.status !== 'Collect Reward') {
                    currentMonster.status = "Dead or Fled";
                }

                state.setItem('resetselectMonster', true);
                monster.setItem(currentMonster);
                return;
            }

            if (damageDiv && damageDiv.length) {
                achLevel = monster.parseCondition('ach', currentMonster.conditions);
                if (monster.info[currentMonster.type] && achLevel === false) {
                    achLevel = monster.info[currentMonster.type].ach;
                }

                maxDamage = monster.parseCondition('max', currentMonster.conditions);
                maxToFortify = (monster.parseCondition('f%', currentMonster.conditions) !== false) ? monster.parseCondition('f%', currentMonster.conditions) : config.getItem('MaxToFortify', 0);
                isTarget = (currentMonster.name === state.getItem('targetFromraid', '') || currentMonster.name === state.getItem('targetFrombattle_monster', '') || currentMonster.name === state.getItem('targetFromfortify', ''));
                if (currentMonster.name === state.getItem('targetFromfortify', '') && currentMonster.fortify > maxToFortify) {
                    state.setItem('resetselectMonster', true);
                }

                // Start of Keep On Budget (KOB) code Part 1 -- required variables
                utility.log(1, 'Start of Keep On Budget (KOB) Code');

                //default is disabled for everything
                KOBenable = false;

                //default is zero bias hours for everything
                KOBbiasHours = 0;

                //KOB needs to follow achievment mode for this monster so that KOB can be skipped.
                KOBach = false;

                //KOB needs to follow max mode for this monster so that KOB can be skipped.
                KOBmax = false;

                //KOB needs to follow minimum fortification state for this monster so that KOB can be skipped.
                KOBminFort = false;

                //create a temp variable so we don't need to call parseCondition more than once for each if statement
                KOBtmp = monster.parseCondition('kob', currentMonster.conditions);
                if (isNaN(KOBtmp)) {
                    utility.log(1, 'NaN branch');
                    KOBenable = true;
                    KOBbiasHours = 0;
                } else if (!KOBtmp) {
                    utility.log(1, 'false branch');
                    KOBenable = false;
                    KOBbiasHours = 0;
                } else {
                    utility.log(1, 'passed value branch');
                    KOBenable = true;
                    KOBbiasHours = KOBtmp;
                }

                //test if user wants kob active globally
                if (!KOBenable && gm.getItem('KOBAllMonters', false, hiddenVar)) {
                    KOBenable = true;
                }

                //disable kob if in level up mode or if we are within 5 stamina of max potential stamina
                if (this.InLevelUpMode() || this.stats.stamina.num >= this.stats.stamina.max - 5) {
                    KOBenable = false;
                }

                utility.log(1, 'Level Up Mode: ', this.InLevelUpMode());
                utility.log(1, 'Stamina Avail: ', this.stats.stamina.num);
                utility.log(1, 'Stamina Max: ', this.stats.stamina.max);

                //log results of previous two tests
                utility.log(1, 'KOBenable: ', KOBenable);
                utility.log(1, 'KOB Bias Hours: ', KOBbiasHours);

                //Total Time alotted for monster
                KOBtotalMonsterTime = monster.info[currentMonster.type].duration;
                utility.log(1, 'Total Time for Monster: ', KOBtotalMonsterTime);

                //Total Damage remaining
                utility.log(1, 'HP left: ', currentMonster.life);

                //Time Left Remaining
                KOBtimeLeft = parseInt(time[0], 10) + (parseInt(time[1], 10) * 0.0166);
                utility.log(1, 'TimeLeft: ', KOBtimeLeft);

                //calculate the bias offset for time remaining
                KOBbiasedTF = KOBtimeLeft - KOBbiasHours;

                //for 7 day monsters we want kob to not permit attacks (beyond achievement level) for the first 24 to 48 hours
                // -- i.e. reach achievement and then wait for more players and siege assist clicks to catch up
                if (KOBtotalMonsterTime >= 168) {
                    KOBtotalMonsterTime = KOBtotalMonsterTime - gm.getItem('KOBDelayStart', 48, hiddenVar);
                }

                //Percentage of time remaining for the currently selected monster
                KOBPercentTimeRemaining = Math.round(KOBbiasedTF / KOBtotalMonsterTime * 1000) / 10;
                utility.log(1, 'Percent Time Remaining: ', KOBPercentTimeRemaining);

                // End of Keep On Budget (KOB) code Part 1 -- required variables

                if (maxDamage && currentMonster.damage >= maxDamage) {
                    currentMonster.color = 'red';
                    currentMonster.over = 'max';
                    //used with KOB code
                    KOBmax = true;
                    //used with kob debugging
                    utility.log(1, 'KOB - max activated');
                    if (isTarget) {
                        state.setItem('resetselectMonster', true);
                    }
                } else if (currentMonster.fortify !== -1 && currentMonster.fortify < config.getItem('MinFortToAttack', 1)) {
                    currentMonster.color = 'purple';
                    //used with KOB code
                    KOBminFort = true;
                    //used with kob debugging
                    utility.log(1, 'KOB - MinFort activated');
                    if (isTarget) {
                        state.setItem('resetselectMonster', true);
                    }
                } else if (currentMonster.damage >= achLevel && (config.getItem('AchievementMode', false) || monster.parseCondition('ach', currentMonster.conditions))) {
                    currentMonster.color = 'orange';
                    currentMonster.over = 'ach';
                    //used with KOB code
                    KOBach = true;
                    //used with kob debugging
                    utility.log(1, 'KOB - achievement reached');
                    if (isTarget && currentMonster.damage < achLevel) {
                        state.setItem('resetselectMonster', true);
                    }
                }

                //Start of KOB code Part 2 begins here
                if (KOBenable && !KOBmax && !KOBminFort && KOBach && currentMonster.life < KOBPercentTimeRemaining) {
                    //kob color
                    currentMonster.color = 'magenta';
                    // this line is required or we attack anyway.
                    currentMonster.over = 'max';
                    //used with kob debugging
                    utility.log(1, 'KOB - budget reached');
                    if (isTarget) {
                        state.setItem('resetselectMonster', true);
                        utility.log(1, 'This monster no longer a target due to kob');
                    }

                } else {
                    if (!KOBmax && !KOBminFort && !KOBach) {
                        //the way that the if statements got stacked, if it wasn't kob it was painted black anyway
                        //had to jump out the black paint if max, ach or fort needed to paint the entry.
                        currentMonster.color = 'black';
                    }
                }
                //End of KOB code Part 2 stops here.
            } else {
                currentMonster.color = 'black';
            }

            monster.setItem(currentMonster);
            this.UpdateDashboard(true);
            if (schedule.check('battleTimer')) {
                window.setTimeout(function () {
                    caap.SetDivContent('monster_mess', '');
                }, 2000);
            }
        } catch (err) {
            utility.error("ERROR in CheckResults_viewFight: " + err);
        }
    },

    /*-------------------------------------------------------------------------------------\
    MonsterReview is a primary action subroutine to mange the monster and raid list
    on the dashboard
    \-------------------------------------------------------------------------------------*/
    MonsterReview: function () {
        try {
            /*-------------------------------------------------------------------------------------\
            We do monster review once an hour.  Some routines may reset this timer to drive
            MonsterReview immediately.
            \-------------------------------------------------------------------------------------*/
            if (!schedule.check("monsterReview") || (config.getItem('WhenMonster', 'Never') === 'Never' && config.getItem('WhenBattle', 'Never') === 'Never')) {
                return false;
            }

            /*-------------------------------------------------------------------------------------\
            We get the monsterReviewCounter.  This will be set to -3 if we are supposed to refresh
            the monsterOl completely. Otherwise it will be our index into how far we are into
            reviewing monsterOl.
            \-------------------------------------------------------------------------------------*/
            var counter = state.getItem('monsterReviewCounter', -3),
                link    = '',
                tempTime = new Date().getTime();

            if (counter === -3) {
                state.setItem('monsterReviewCounter', counter += 1);
                return true;
            }

            if (counter === -2) {
                if (this.stats.level > 6) {
                    if (utility.NavigateTo('keep,battle_monster', 'tab_monster_list_on.gif')) {
                        state.setItem('reviewDone', false);
                        return true;
                    }
                } else {
                    utility.log(1, "Monsters: Unlock at level 7");
                    state.setItem('reviewDone', true);
                }

                if (state.getItem('reviewDone', true)) {
                    state.setItem('monsterReviewCounter', counter += 1);
                } else {
                    return true;
                }
            }

            if (counter === -1) {
                if (this.stats.level > 7) {
                    if (utility.NavigateTo(this.battlePage + ',raid', 'tab_raid_on.gif')) {
                        state.setItem('reviewDone', false);
                        return true;
                    }
                } else {
                    utility.log(1, "Raids: Unlock at level 8");
                    state.setItem('reviewDone', true);
                }

                if (state.getItem('reviewDone', true)) {
                    state.setItem('monsterReviewCounter', counter += 1);
                } else {
                    return true;
                }
            }

            if (monster.records && monster.records.length === 0) {
                return false;
            }

            /*-------------------------------------------------------------------------------------\
            Now we step through the monsterOl objects. We set monsterReviewCounter to the next
            index for the next reiteration since we will be doing a click and return in here.
            \-------------------------------------------------------------------------------------*/
            while (counter < monster.records.length) {
                if (!monster.records[counter]) {
                    state.setItem('monsterReviewCounter', counter += 1);
                    continue;
                }
                /*-------------------------------------------------------------------------------------\
                If we looked at this monster more recently than an hour ago, skip it
                \-------------------------------------------------------------------------------------*/
                if (monster.records[counter].color === 'grey' && monster.records[counter].life !== -1) {
                    monster.records[counter].life = -1;
                    monster.records[counter].fortify = -1;
                    monster.records[counter].strength = -1;
                    monster.records[counter].timeLeft = '';
                    monster.records[counter].t2k = -1;
                    monster.records[counter].phase = '';
                }

                tempTime = monster.records[counter].review ? monster.records[counter].review : new Date(2009, 0, 1).getTime();
                if (monster.records[counter].status === 'Complete' || !schedule.since(tempTime, gm.getItem("MonsterLastReviewed", 15, hiddenVar) * 60) || state.getItem('monsterRepeatCount', 0) > 2) {
                    state.setItem('monsterReviewCounter', counter += 1);
                    state.setItem('monsterRepeatCount', 0);
                    continue;
                }
                /*-------------------------------------------------------------------------------------\
                We get our monster link
                \-------------------------------------------------------------------------------------*/
                this.SetDivContent('monster_mess', 'Reviewing/sieging ' + (counter + 1) + '/' + monster.records.length + ' ' + monster.records[counter].name);
                link = monster.records[counter].link;
                /*-------------------------------------------------------------------------------------\
                If the link is good then we get the url and any conditions for monster
                \-------------------------------------------------------------------------------------*/
                if (/href/.test(link)) {
                    link = link.split("'")[1];
                    /*-------------------------------------------------------------------------------------\
                    If the autocollect token was specified then we set the link to do auto collect. If
                    the conditions indicate we should not do sieges then we fix the link.
                    \-------------------------------------------------------------------------------------*/
                    if ((((monster.records[counter].conditions) && (/:ac\b/.test(monster.records[counter].conditions))) ||
                            (monster.records[counter].type.match(/Raid/) && config.getItem('raidCollectReward', false)) ||
                            (!monster.records[counter].type.match(/Raid/) && config.getItem('monsterCollectReward', false))) && monster.records[counter].status === 'Collect Reward') {

                        if (general.Select('CollectGeneral')) {
                            return true;
                        }

                        link += '&action=collectReward';
                        if (monster.records[counter].name.indexOf('Siege') >= 0) {
                            if (monster.records[counter].rix !== -1)  {
                                link += '&rix=' + monster.records[counter].rix;
                            } else {
                                link += '&rix=2';
                            }
                        }

                        link = link.replace('&action=doObjective', '');
                        state.setItem('CollectedRewards', true);
                    } else if (((monster.records[counter].conditions) && (monster.records[counter].conditions.match(':!s'))) ||
                               (!config.getItem('raidDoSiege', true) && monster.records[counter].type.match(/Raid/)) ||
                               (!config.getItem('monsterDoSiege', true) && !monster.records[counter].type.match(/Raid/) && monster.info[monster.records[counter].type].siege) ||
                               this.stats.stamina.num === 0) {
                        link = link.replace('&action=doObjective', '');
                    }
                    /*-------------------------------------------------------------------------------------\
                    Now we use ajaxSendLink to display the monsters page.
                    \-------------------------------------------------------------------------------------*/
                    utility.log(1, 'Reviewing ' + (counter + 1) + '/' + monster.records.length + ' ' + monster.records[counter].name);
                    state.setItem('ReleaseControl', true);
                    link = link.replace('http://apps.facebook.com/castle_age/', '');
                    link = link.replace('?', '?twt2&');
                    utility.log(9, "Link", link);
                    utility.ClickAjax(link);
                    state.setItem('monsterRepeatCount', state.getItem('monsterRepeatCount', 0) + 1);
                    state.setItem('resetselectMonster', true);
                    return true;
                }
            }
            /*-------------------------------------------------------------------------------------\
            All done.  Set timer and tell monster.select and dashboard they need to do thier thing.
            We set the monsterReviewCounter to do a full refresh next time through.
            \-------------------------------------------------------------------------------------*/
            schedule.setItem("monsterReview", gm.getItem('monsterReviewMins', 60, hiddenVar) * 60, 300);
            state.setItem('resetselectMonster', true);
            state.setItem('monsterReviewCounter', -3);
            utility.log(1, 'Done with monster/raid review.');
            this.SetDivContent('monster_mess', '');
            this.UpdateDashboard(true);
            if (state.getItem('CollectedRewards', false)) {
                state.setItem('CollectedRewards', false);
                monster.flagReview();
            }

            return true;
        } catch (err) {
            utility.error("ERROR in MonsterReview: " + err);
            return false;
        }
    },

    Monsters: function () {
        try {
            if (config.getItem('WhenMonster', 'Never') === 'Never') {
                this.SetDivContent('monster_mess', 'Monster off');
                return false;
            }

            ///////////////// Reivew/Siege all monsters/raids \\\\\\\\\\\\\\\\\\\\\\

            if (config.getItem('WhenMonster', 'Never') === 'Stay Hidden' && this.NeedToHide() && this.CheckStamina('Monster', 1)) {
                utility.log(1, "Stay Hidden Mode: We're not safe. Go battle.");
                this.SetDivContent('monster_mess', 'Not Safe For Monster. Battle!');
                return false;
            }

            if (!schedule.check('NotargetFrombattle_monster')) {
                return false;
            }

            ///////////////// Individual Monster Page \\\\\\\\\\\\\\\\\\\\\\

            // Establish a delay timer when we are 1 stamina below attack level.
            // Timer includes 5 min for stamina tick plus user defined random interval
            if (!this.InLevelUpMode() && this.stats.stamina.num === (state.getItem('MonsterStaminaReq', 1) - 1) && schedule.check('battleTimer') && config.getItem('seedTime', 0) > 0) {
                schedule.setItem('battleTimer', 300, config.getItem('seedTime', 0));
                this.SetDivContent('monster_mess', 'Monster Delay Until ' + schedule.display('battleTimer'));
                return false;
            }

            if (!schedule.check('battleTimer')) {
                if (this.stats.stamina.num < general.GetStaminaMax(config.getItem('IdleGeneral', 'Use Current'))) {
                    this.SetDivContent('monster_mess', 'Monster Delay Until ' + schedule.display('battleTimer'));
                    return false;
                }
            }

            var fightMode = '';
            // Check to see if we should fortify, attack monster, or battle raid
            var monsterName = state.getItem('targetFromfortify', '');
            var monstType = monster.type(monsterName);
            var nodeNum = 0;
            var energyRequire = 10;
            var currentMonster = monster.getItem(monsterName);

            if (monstType) {
                if (!this.InLevelUpMode() && config.getItem('PowerFortifyMax', false) && monster.info[monstType].staLvl) {
                    for (nodeNum = monster.info[monstType].staLvl.length - 1; nodeNum >= 0; nodeNum -= 1) {
                        if (this.stats.stamina.max >= monster.info[monstType].staLvl[nodeNum]) {
                            break;
                        }
                    }
                }

                if (nodeNum >= 0 && nodeNum !== null && nodeNum !== undefined && config.getItem('PowerAttackMax', false)) {
                    energyRequire = monster.info[monstType].nrgMax[nodeNum];
                }
            }

            utility.log(9, "Energy Required/Node", energyRequire, nodeNum);
            if (config.getItem('FortifyGeneral', 'Use Current') === 'Orc King') {
                energyRequire = energyRequire * 5;
                utility.log(2, 'Monsters Fortify:Orc King', energyRequire);
            }

            if (config.getItem('FortifyGeneral', 'Use Current') === 'Barbarus') {
                energyRequire = energyRequire * 3;
                utility.log(2, 'Monsters Fortify:Barbarus', energyRequire);
            }

            if (monsterName && this.CheckEnergy(energyRequire, gm.getItem('WhenFortify', 'Energy Available', hiddenVar), 'fortify_mess')) {
                fightMode = 'Fortify';
            } else {
                monsterName = state.getItem('targetFrombattle_monster', '');
                monstType = monster.type(monsterName);
                currentMonster = monster.getItem(monsterName);
                if (monsterName && this.CheckStamina('Monster', state.getItem('MonsterStaminaReq', 1)) && currentMonster.page === 'battle_monster') {
                    fightMode = 'Monster';
                } else {
                    schedule.setItem('NotargetFrombattle_monster', 60);
                    return false;
                }
            }

            // Set right general
            if (general.Select(fightMode + 'General')) {
                return true;
            }

            // Check if on engage monster page
            var imageTest = 'dragon_title_owner';
            if (monstType && monster.info[monstType].alpha) {
                imageTest = 'nm_top';
            }

            if ($("div[style*='" + imageTest + "']").length) {
                if (monster.ConfirmRightPage(monsterName)) {
                    return true;
                }

                var attackButton = null;
                var singleButtonList = [
                    'button_nm_p_attack.gif',
                    'attack_monster_button.jpg',
                    'event_attack1.gif',
                    'seamonster_attack.gif',
                    'event_attack2.gif',
                    'attack_monster_button2.jpg'
                ];
                var buttonList = [];
                // Find the attack or fortify button
                if (fightMode === 'Fortify') {
                    buttonList = [
                        'seamonster_fortify.gif',
                        'button_dispel.gif',
                        'attack_monster_button3.jpg'
                    ];

                    if (currentMonster && currentMonster.stunDo && currentMonster.stunType !== '') {
                        buttonList.unshift("button_nm_s_" + currentMonster.stunType);
                    } else {
                        buttonList.unshift("button_nm_s_");
                    }

                    utility.log(1, "monster/button list", currentMonster, buttonList);
                } else if (state.getItem('MonsterStaminaReq', 1) === 1) {
                    // not power attack only normal attacks
                    buttonList = singleButtonList;
                } else {
                    var monsterConditions = currentMonster.conditions,
                        tacticsValue      = 0,
                        partyHealth       = 0,
                        useTactics        = false;

                    if (config.getItem('UseTactics', false) && this.stats.level >= 50) {
                        useTactics = true;
                        tacticsValue = config.getItem('TacticsThreshold', false);
                    }

                    if (monsterConditions && monsterConditions.match(/:tac/i) && this.stats.level >= 50) {
                        useTactics = true;
                        tacticsValue = monster.parseCondition("tac%", monsterConditions);
                    }

                    if (useTactics) {
                        partyHealth = currentMonster.fortify;
                    }

                    if (tacticsValue !== false && partyHealth < tacticsValue) {
                        utility.log(1, "Party health is below threshold value", partyHealth, tacticsValue);
                        useTactics = false;
                    }

                    if (useTactics && utility.CheckForImage('nm_button_tactics.gif')) {
                        utility.log(1, "Attacking monster using tactics buttons");
                        buttonList = [
                            'nm_button_tactics.gif'
                        ].concat(singleButtonList);
                    } else {
                        utility.log(1, "Attacking monster using regular buttons");
                        // power attack or if not seamonster power attack or if not regular attack -
                        // need case for seamonster regular attack?
                        buttonList = [
                            'button_nm_p_power',
                            'button_nm_p_',
                            'power_button_',
                            'attack_monster_button2.jpg',
                            'event_attack2.gif',
                            'seamonster_power.gif',
                            'event_attack1.gif',
                            'attack_monster_button.jpg'
                        ].concat(singleButtonList);
                    }
                }

                nodeNum = 0;
                if (!this.InLevelUpMode()) {
                    if (((fightMode === 'Fortify' && config.getItem('PowerFortifyMax', false)) || (fightMode !== 'Fortify' && config.getItem('PowerAttack', false) && config.getItem('PowerAttackMax', false))) && monster.info[monstType].staLvl) {
                        for (nodeNum = monster.info[monstType].staLvl.length - 1; nodeNum >= 0; nodeNum -= 1) {
                            if (this.stats.stamina.max >= monster.info[monstType].staLvl[nodeNum]) {
                                break;
                            }
                        }
                    }
                }

                for (var i in buttonList) {
                    if (buttonList.hasOwnProperty(i)) {
                        attackButton = utility.CheckForImage(buttonList[i], null, null, nodeNum);
                        if (attackButton) {
                            break;
                        }
                    }
                }

                if (attackButton) {
                    var attackMess = '';
                    if (fightMode === 'Fortify') {
                        attackMess = 'Fortifying ' + monsterName;
                    } else {
                        attackMess = (state.getItem('MonsterStaminaReq', 1) >= 5 ? 'Power' : 'Single') + ' Attacking ' + monsterName;
                    }

                    utility.log(1, attackMess);
                    this.SetDivContent('monster_mess', attackMess);
                    state.setItem('ReleaseControl', true);
                    utility.Click(attackButton, 8000);
                    return true;
                } else {
                    utility.warn('No button to attack/fortify with.');
                    schedule.setItem('NotargetFrombattle_monster', 60);
                    return false;
                }
            }

            ///////////////// Check For Monster Page \\\\\\\\\\\\\\\\\\\\\\

            if (utility.NavigateTo('keep,battle_monster', 'tab_monster_list_on.gif')) {
                return true;
            }

            if (config.getItem('clearCompleteMonsters', false) && monster.completeButton.battle_monster) {
                utility.Click(monster.completeButton.battle_monster, 1000);
                utility.log(1, 'Cleared a completed monster');
                monster.completeButton.battle_monster = '';
                return true;
            }

            var firstMonsterButtonDiv = utility.CheckForImage('dragon_list_btn_');
            if ((firstMonsterButtonDiv) && !(firstMonsterButtonDiv.parentNode.href.match('user=' + this.stats.FBID) ||
                    firstMonsterButtonDiv.parentNode.href.match(/alchemy\.php/))) {
                var pageUserCheck = state.getItem('pageUserCheck', '');
                if (pageUserCheck) {
                    utility.log(1, "On another player's keep.", pageUserCheck);
                    return utility.NavigateTo('keep,battle_monster', 'tab_monster_list_on.gif');
                }
            }

            var engageButton = monster.engageButtons[monsterName];
            if (engageButton) {
                this.SetDivContent('monster_mess', 'Opening ' + monsterName);
                utility.Click(engageButton);
                return true;
            } else {
                schedule.setItem('NotargetFrombattle_monster', 60);
                utility.warn('No "Engage" button for ', monsterName);
                return false;
            }
        } catch (err) {
            utility.error("ERROR in Monsters: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          COMMON FIGHTING FUNCTIONS
    /////////////////////////////////////////////////////////////////////

    demi: {
        ambrosia : {
            power : {
                total : 0,
                max   : 0,
                next  : 0
            },
            daily : {
                num : 0,
                max : 0,
                dif : 0
            }
        },
        malekus : {
            power : {
                total : 0,
                max   : 0,
                next  : 0
            },
            daily : {
                num : 0,
                max : 0,
                dif : 0
            }
        },
        corvintheus : {
            power : {
                total : 0,
                max   : 0,
                next  : 0
            },
            daily : {
                num : 0,
                max : 0,
                dif : 0
            }
        },
        aurora : {
            power : {
                total : 0,
                max   : 0,
                next  : 0
            },
            daily : {
                num : 0,
                max : 0,
                dif : 0
            }
        },
        azeron : {
            power : {
                total : 0,
                max   : 0,
                next  : 0
            },
            daily : {
                num : 0,
                max : 0,
                dif : 0
            }
        }
    },

    LoadDemi: function () {
        if (gm.getItem('demipoint.records', 'default') === 'default') {
            gm.setItem('demipoint.records', this.demi);
        } else {
            this.demi = gm.getItem('demipoint.records', this.demi);
        }

        utility.log(2, 'Demi', this.demi);
        state.setItem("UserDashUpdate", true);
    },

    SaveDemi: function () {
        gm.setItem('demipoint.records', this.demi);
        utility.log(2, 'Demi', this.demi);
        state.setItem("UserDashUpdate", true);
    },

    demiTable: {
        0 : 'ambrosia',
        1 : 'malekus',
        2 : 'corvintheus',
        3 : 'aurora',
        4 : 'azeron'
    },

    CheckResults_battle: function () {
        try {
            var symDiv  = null,
                points  = [],
                success = true;

            symDiv = $("#app46755028429_app_body img[src*='symbol_tiny_']").not("img[src*='rewards.jpg']");
            if (symDiv && symDiv.length === 5) {
                symDiv.each(function (index) {
                    var temp = $(this).parent().parent().next().text().replace(/\s/g, '');
                    if (temp) {
                        points.push(temp);
                    } else {
                        success = false;
                        utility.warn('Demi temp text problem', temp);
                    }
                });

                utility.log(2, 'Points', points);
                if (success) {
                    this.demi.ambrosia.daily = this.GetStatusNumbers(points[0]);
                    this.demi.malekus.daily = this.GetStatusNumbers(points[1]);
                    this.demi.corvintheus.daily = this.GetStatusNumbers(points[2]);
                    this.demi.aurora.daily = this.GetStatusNumbers(points[3]);
                    this.demi.azeron.daily = this.GetStatusNumbers(points[4]);
                    schedule.setItem("battle", gm.getItem('CheckDemi', 6, hiddenVar) * 3600, 300);
                    this.SaveDemi();
                }
            } else {
                utility.warn('Demi symDiv problem', symDiv);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in CheckResults_battle: " + err);
            return false;
        }
    },

    DemiPoints: function () {
        try {
            if (!config.getItem('DemiPointsFirst', false) || config.getItem('WhenMonster', 'Never') === 'Never' || this.stats.level < 9) {
                return false;
            }

            if (schedule.check("battle")) {
                utility.log(5, 'DemiPointsFirst battle page check');
                if (utility.NavigateTo(this.battlePage, 'battle_on.gif')) {
                    return true;
                }
            }

            var demiPower      = '',
                demiPointsDone = true;

            for (demiPower in this.demi) {
                if (this.demi.hasOwnProperty(demiPower)) {
                    if (this.demi[demiPower].daily.dif > 0) {
                        demiPointsDone = false;
                        break;
                    }
                }
            }

            utility.log(5, 'DemiPointsDone', demiPower, demiPointsDone);
            state.setItem("DemiPointsDone", demiPointsDone);
            if (!demiPointsDone) {
                return this.Battle('DemiPoints');
            } else {
                return false;
            }
        } catch (err) {
            utility.error("ERROR in DemiPoints: " + err);
            return false;
        }
    },

    InLevelUpMode: function () {
        try {
            if (!gm.getItem('EnableLevelUpMode', true, hiddenVar)) {
                //if levelup mode is false then new level up mode is also false (kob)
                state.setItem("newLevelUpMode", false);
                return false;
            }

            if (!(this.stats.indicators.enl) || (this.stats.indicators.enl).toString().match(new Date(2009, 1, 1).getTime())) {
                //if levelup mode is false then new level up mode is also false (kob)
                state.setItem("newLevelUpMode", false);
                return false;
            }

            // minutesBeforeLevelToUseUpStaEnergy : 5, = 30000
            if (((this.stats.indicators.enl - new Date().getTime()) < 30000) || (this.stats.exp.dif <= config.getItem('LevelUpGeneralExp', 0))) {
                //detect if we are entering level up mode for the very first time (kob)
                if (!state.getItem("newLevelUpMode", false)) {
                    //set the current level up mode flag so that we don't call refresh monster routine more than once (kob)
                    state.setItem("newLevelUpMode", true);
                    this.refreshMonstersListener();
                }

                return true;
            }

            //if levelup mode is false then new level up mode is also false (kob)
            state.setItem("newLevelUpMode", false);
            return false;
        } catch (err) {
            utility.error("ERROR in InLevelUpMode: " + err);
            return false;
        }
    },

    CheckStamina: function (battleOrBattle, attackMinStamina) {
        try {
            utility.log(9, "CheckStamina", battleOrBattle, attackMinStamina);
            if (!attackMinStamina) {
                attackMinStamina = 1;
            }

            var when           = config.getItem('When' + battleOrBattle, 'Never'),
                maxIdleStamina = 0,
                theGeneral     = '';

            if (when === 'Never') {
                return false;
            }

            if (!this.stats.stamina || !this.stats.health) {
                this.SetDivContent('battle_mess', 'Health or stamina not known yet.');
                return false;
            }

            if (this.stats.health.num < 10) {
                this.SetDivContent('battle_mess', "Need health to fight: " + this.stats.health.num + "/10");
                return false;
            }

            if (this.stats.health.num < 12) {
                this.SetDivContent('battle_mess', "Unsafe. Need spare health to fight: " + this.stats.health.num + "/12");
                return false;
            }

            if (when === 'At X Stamina') {
                if (this.InLevelUpMode() && this.stats.stamina.num >= attackMinStamina) {
                    this.SetDivContent('battle_mess', 'Burning stamina to level up');
                    return true;
                }

                var staminaMF = battleOrBattle + 'Stamina';
                if (state.getItem('BurnMode_' + staminaMF, false) || this.stats.stamina.num >= config.getItem('X' + staminaMF, 1)) {
                    if (this.stats.stamina.num < attackMinStamina || this.stats.stamina.num <= config.getItem('XMin' + staminaMF, 0)) {
                        state.setItem('BurnMode_' + staminaMF, false);
                        return false;
                    }

                    //this.SetDivContent('battle_mess', 'Burning stamina');
                    state.setItem('BurnMode_' + staminaMF, true);
                    return true;
                } else {
                    state.setItem('BurnMode_' + staminaMF, false);
                }

                this.SetDivContent('battle_mess', 'Waiting for stamina: ' + this.stats.stamina.num + "/" + config.getItem('X' + staminaMF, 1));
                return false;
            }

            if (when === 'At Max Stamina') {
                maxIdleStamina = this.stats.stamina.max;
                theGeneral = config.getItem('IdleGeneral', 'Use Current');
                if (theGeneral !== 'Use Current') {
                    maxIdleStamina = general.GetStaminaMax(theGeneral);
                }

                if (theGeneral !== 'Use Current' && !maxIdleStamina) {
                    utility.log(1, "Changing to idle general to get Max Stamina");
                    if (general.Select('IdleGeneral')) {
                        return true;
                    }
                }

                if (this.stats.stamina.num >= maxIdleStamina) {
                    this.SetDivContent('battle_mess', 'Using max stamina');
                    return true;
                }

                if (this.InLevelUpMode() && this.stats.stamina.num >= attackMinStamina) {
                    this.SetDivContent('battle_mess', 'Burning all stamina to level up');
                    return true;
                }

                this.SetDivContent('battle_mess', 'Waiting for max stamina: ' + this.stats.stamina.num + "/" + maxIdleStamina);
                return false;
            }

            if (this.stats.stamina.num >= attackMinStamina) {
                return true;
            }

            this.SetDivContent('battle_mess', 'Waiting for more stamina: ' + this.stats.stamina.num + "/" + attackMinStamina);
            return false;
        } catch (err) {
            utility.error("ERROR in CheckStamina: " + err);
            return false;
        }
    },

    /*-------------------------------------------------------------------------------------\
    NeedToHide will return true if the current stamina and health indicate we need to bring
    our health down through battles (hiding).  It also returns true if there is no other outlet
    for our stamina (currently this just means Monsters, but will eventually incorporate
    other stamina uses).
    \-------------------------------------------------------------------------------------*/
    NeedToHide: function () {
        if (config.getItem('WhenMonster', 'Never') === 'Never') {
            utility.log(1, 'Stay Hidden Mode: Monster battle not enabled');
            return true;
        }

        if (!state.getItem('targetFrombattle_monster', '')) {
            utility.log(1, 'Stay Hidden Mode: No monster to battle');
            return true;
        }
    /*-------------------------------------------------------------------------------------\
    The riskConstant helps us determine how much we stay in hiding and how much we are willing
    to risk coming out of hiding.  The lower the riskConstant, the more we spend stamina to
    stay in hiding. The higher the risk constant, the more we attempt to use our stamina for
    non-hiding activities.  The below matrix shows the default riskConstant of 1.7

                S   T   A   M   I   N   A
                1   2   3   4   5   6   7   8   9        -  Indicates we use stamina to hide
        H   10  -   -   +   +   +   +   +   +   +        +  Indicates we use stamina as requested
        E   11  -   -   +   +   +   +   +   +   +
        A   12  -   -   +   +   +   +   +   +   +
        L   13  -   -   +   +   +   +   +   +   +
        T   14  -   -   -   +   +   +   +   +   +
        H   15  -   -   -   +   +   +   +   +   +
            16  -   -   -   -   +   +   +   +   +
            17  -   -   -   -   -   +   +   +   +
            18  -   -   -   -   -   +   +   +   +

    Setting our riskConstant down to 1 will result in us spending out stamina to hide much
    more often:

                S   T   A   M   I   N   A
                1   2   3   4   5   6   7   8   9        -  Indicates we use stamina to hide
        H   10  -   -   +   +   +   +   +   +   +        +  Indicates we use stamina as requested
        E   11  -   -   +   +   +   +   +   +   +
        A   12  -   -   -   +   +   +   +   +   +
        L   13  -   -   -   -   +   +   +   +   +
        T   14  -   -   -   -   -   +   +   +   +
        H   15  -   -   -   -   -   -   +   +   +
            16  -   -   -   -   -   -   -   +   +
            17  -   -   -   -   -   -   -   -   +
            18  -   -   -   -   -   -   -   -   -

    \-------------------------------------------------------------------------------------*/
        var riskConstant = gm.getItem('HidingRiskConstant', 1.7, hiddenVar);
    /*-------------------------------------------------------------------------------------\
    The formula for determining if we should hide goes something like this:

        If  (health - (estimated dmg from next attacks) puts us below 10)  AND
            (current stamina will be at least 5 using staminatime/healthtime ratio)
        Then stamina can be used/saved for normal process
        Else stamina is used for us to hide

    \-------------------------------------------------------------------------------------*/
        if ((this.stats.health.num - ((this.stats.stamina.num - 1) * riskConstant) < 10) && (this.stats.stamina.num * (5 / 3) >= 5)) {
            return false;
        } else {
            return true;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          POTIONS
    /////////////////////////////////////////////////////////////////////

    ConsumePotion: function (potion) {
        try {
            if (!$(".statsTTitle").length) {
                utility.log(1, "Going to keep for potions");
                if (utility.NavigateTo('keep')) {
                    return true;
                }
            }

            var formId    = "app46755028429_consume_1",
                potionDiv = null,
                button    = null;

            if (potion === 'stamina') {
                formId = "app46755028429_consume_2";
            }

            utility.log(1, "Consuming potion potion");
            potionDiv = $("form[id='" + formId + "'] input[src*='potion_consume.gif']");
            if (potionDiv && potionDiv.length) {
                button = potionDiv.get(0);
                if (button) {
                    utility.Click(button);
                } else {
                    utility.warn("Could not find consume button for", potion);
                    return false;
                }
            } else {
                utility.warn("Could not find consume form for", potion);
                return false;
            }

            return true;
        } catch (err) {
            utility.error("ERROR in ConsumePotion: " + err, potion);
            return false;
        }
    },

    AutoPotions: function () {
        try {
            if (!config.getItem('AutoPotions', true) || !schedule.check('AutoPotionTimerDelay')) {
                return false;
            }

            if (this.stats.exp.dif <= config.getItem("potionsExperience", 20)) {
                utility.log(1, "AutoPotions, ENL condition. Delaying 10 minutes");
                schedule.setItem('AutoPotionTimerDelay', 600);
                return false;
            }

            if (this.stats.energy.num < this.stats.energy.max - 10 &&
                this.stats.potions.energy >= config.getItem("energyPotionsSpendOver", 39) &&
                this.stats.potions.energy > config.getItem("energyPotionsKeepUnder", 35)) {
                return this.ConsumePotion('energy');
            }

            if (this.stats.stamina.num < this.stats.stamina.max - 10 &&
                this.stats.potions.stamina >= config.getItem("staminaPotionsSpendOver", 39) &&
                this.stats.potions.stamina > config.getItem("staminaPotionsKeepUnder", 35)) {
                return this.ConsumePotion('stamina');
            }

            return false;
        } catch (err) {
            utility.error("ERROR in AutoPotion: " + err);
            return false;
        }
    },

    /*-------------------------------------------------------------------------------------\
    AutoAlchemy perform aclchemy combines for all recipes that do not have missing
    ingredients.  By default, it also will not combine Battle Hearts.
    First we make sure the option is set and that we haven't been here for a while.
    \-------------------------------------------------------------------------------------*/
    AutoAlchemy: function () {
        try {
            if (!config.getItem('AutoAlchemy', false)) {
                return false;
            }

            if (!schedule.check('AlchemyTimer')) {
                return false;
            }
    /*-------------------------------------------------------------------------------------\
    Now we navigate to the Alchemy Recipe page.
    \-------------------------------------------------------------------------------------*/
            if (!utility.NavigateTo('keep,alchemy', 'tab_alchemy_on.gif')) {
                var button    = null,
                    recipeDiv = null,
                    tempDiv   = null;

                recipeDiv = $("#app46755028429_recipe_list");
                if (recipeDiv && recipeDiv.length) {
                    if (recipeDiv.attr("class") !== 'show_items') {
                        tempDiv = recipeDiv.find("div[id*='alchemy_item_tab']");
                        if (tempDiv && tempDiv.length) {
                            button = tempDiv.get(0);
                            if (button) {
                                utility.Click(button, 5000);
                                return true;
                            } else {
                                utility.warn('Cant find tab button', button);
                                return false;
                            }
                        } else {
                            utility.warn('Cant find item tab', tempDiv);
                            return false;
                        }
                    }
                } else {
                    utility.warn('Cant find recipe list', recipeDiv);
                    return false;
                }
    /*-------------------------------------------------------------------------------------\
    We close the results of our combines so they don't hog up our screen
    \-------------------------------------------------------------------------------------*/
                button = utility.CheckForImage('help_close_x.gif');
                if (button) {
                    utility.Click(button, 1000);
                    return true;
                }
    /*-------------------------------------------------------------------------------------\
    Now we get all of the recipes and step through them one by one
    \-------------------------------------------------------------------------------------*/
                var ss = document.evaluate(".//div[@class='alchemyRecipeBack']", document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                for (var s = 0; s < ss.snapshotLength; s += 1) {
                    recipeDiv = ss.snapshotItem(s);
    /*-------------------------------------------------------------------------------------\
    If we are missing an ingredient then skip it
    \-------------------------------------------------------------------------------------*/
                    if (nHtml.FindByAttrContains(recipeDiv, 'div', 'class', 'missing')) {
                        utility.log(5, 'Skipping Recipe');
                        continue;
                    }
    /*-------------------------------------------------------------------------------------\
    If we are skipping battle hearts then skip it
    \-------------------------------------------------------------------------------------*/
                    if (utility.CheckForImage('raid_hearts', recipeDiv) && !config.getItem('AutoAlchemyHearts', false)) {
                        utility.log(1, 'Skipping Hearts');
                        continue;
                    }
    /*-------------------------------------------------------------------------------------\
    Find our button and click it
    \-------------------------------------------------------------------------------------*/
                    button = nHtml.FindByAttrXPath(recipeDiv, 'input', "@type='image'");
                    if (button) {
                        utility.Click(button, 2000);
                        return true;
                    } else {
                        utility.warn('Cant Find Item Image Button');
                    }
                }
    /*-------------------------------------------------------------------------------------\
    All done. Set the timer to check back in 3 hours.
    \-------------------------------------------------------------------------------------*/
                schedule.setItem('AlchemyTimer', 10800, 300);
                return false;
            }

            return true;
        } catch (err) {
            utility.error("ERROR in Alchemy: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          BANKING
    // Keep it safe!
    /////////////////////////////////////////////////////////////////////

    ImmediateBanking: function () {
        if (!config.getItem("BankImmed", false)) {
            return false;
        }

        return this.Bank();
    },

    Bank: function () {
        try {
            if (config.getItem("NoBankAfterLvl", true) && state.getItem('KeepLevelUpGeneral', false)) {
                return false;
            }

            var maxInCash = config.getItem('MaxInCash', -1),
                minInCash = config.getItem('MinInCash', 0);

            if (!maxInCash || maxInCash < 0 || this.stats.gold.cash <= minInCash || this.stats.gold.cash < maxInCash || this.stats.gold.cash < 10) {
                return false;
            }

            if (general.Select('BankingGeneral')) {
                return true;
            }

            var depositButton = utility.CheckForImage('btn_stash.gif');
            if (!depositButton) {
                // Cannot find the link
                return utility.NavigateTo('keep');
            }

            var depositForm = depositButton.form;
            var numberInput = nHtml.FindByAttrXPath(depositForm, 'input', "@type='' or @type='text'");
            if (numberInput) {
                numberInput.value = parseInt(numberInput.value, 10) - minInCash;
            } else {
                utility.warn('Cannot find box to put in number for bank deposit.');
                return false;
            }

            utility.log(1, 'Depositing into bank');
            utility.Click(depositButton);
            return true;
        } catch (err) {
            utility.error("ERROR in Bank: " + err);
            return false;
        }
    },

    RetrieveFromBank: function (num) {
        try {
            if (num <= 0) {
                return false;
            }

            var retrieveButton = utility.CheckForImage('btn_retrieve.gif');
            if (!retrieveButton) {
                // Cannot find the link
                return utility.NavigateTo('keep');
            }

            var minInStore = config.getItem('minInStore', 0);
            if (!(minInStore || minInStore <= this.stats.gold.bank - num)) {
                return false;
            }

            var retrieveForm = retrieveButton.form;
            var numberInput = nHtml.FindByAttrXPath(retrieveForm, 'input', "@type='' or @type='text'");
            if (numberInput) {
                numberInput.value = num;
            } else {
                utility.warn('Cannot find box to put in number for bank retrieve.');
                return false;
            }

            utility.log(1, 'Retrieving from bank: ', num);
            state.setItem('storeRetrieve', '');
            utility.Click(retrieveButton);
            return true;
        } catch (err) {
            utility.error("ERROR in RetrieveFromBank: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          HEAL
    /////////////////////////////////////////////////////////////////////

    Heal: function () {
        try {
            var minToHeal     = 0,
                minStamToHeal = 0;

            this.SetDivContent('heal_mess', '');
            minToHeal = config.getItem('MinToHeal', 0);
            if (!minToHeal) {
                return false;
            }

            minStamToHeal = config.getItem('MinStamToHeal', 0);
            if (minStamToHeal === "") {
                minStamToHeal = 0;
            }

            if (!this.stats.health) {
                return false;
            }

            if ((config.getItem('WhenBattle', 'Never') !== 'Never') || (config.getItem('WhenMonster', 'Never') !== 'Never')) {
                if ((this.InLevelUpMode() || this.stats.stamina.num >= this.stats.stamina.max) && this.stats.health.num < 10) {
                    utility.log(1, 'Heal');
                    return utility.NavigateTo('keep,heal_button.gif');
                }
            }

            if (this.stats.health.num >= this.stats.health.max || this.stats.health.num >= minToHeal) {
                return false;
            }

            if (this.stats.stamina.num < minStamToHeal) {
                this.SetDivContent('heal_mess', 'Waiting for stamina to heal: ' + this.stats.stamina.num + '/' + minStamToHeal);
                return false;
            }

            utility.log(1, 'Heal');
            return utility.NavigateTo('keep,heal_button.gif');
        } catch (err) {
            utility.error("ERROR in Heal: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          ELITE GUARD
    /////////////////////////////////////////////////////////////////////

    AutoElite: function () {
        try {
            if (!config.getItem('AutoElite', false)) {
                return false;
            }

            if (!schedule.check('AutoEliteGetList')) {
                if (!state.getItem('FillArmy', false) && state.getItem(this.friendListType.giftc.name + 'Requested', false)) {
                    state.setItem(this.friendListType.giftc.name + 'Requested', false);
                }

                return false;
            }

            utility.log(1, 'Elite Guard cycle');
            var MergeMyEliteTodo = function (list) {
                utility.log(1, 'Elite Guard MergeMyEliteTodo list');
                var eliteArmyList = utility.TextToArray(config.getItem('EliteArmyList', ''));
                if (eliteArmyList.length) {
                    utility.log(1, 'Merge and save Elite Guard MyEliteTodo list');
                    var diffList = list.filter(function (todoID) {
                        return (eliteArmyList.indexOf(todoID) < 0);
                    });

                    $.merge(eliteArmyList, diffList);
                    state.setItem('MyEliteTodo', eliteArmyList);
                } else {
                    utility.log(1, 'Save Elite Guard MyEliteTodo list');
                    state.setItem('MyEliteTodo', list);
                }
            };

            var eliteList = state.getItem('MyEliteTodo', []);
            if (!$.isArray(eliteList)) {
                utility.warn('MyEliteTodo list is not expected format, deleting', eliteList);
                eliteList = state.setItem('MyEliteTodo', []);
            }

            if (window.location.href.indexOf('party.php')) {
                utility.log(1, 'Checking Elite Guard status');
                var autoEliteFew = state.getItem('AutoEliteFew', false);
                var autoEliteFull = $('.result_body').text().match(/YOUR Elite Guard is FULL/i);
                if (autoEliteFull || (autoEliteFew && state.getItem('AutoEliteEnd', '') === 'NoArmy')) {
                    if (autoEliteFull) {
                        utility.log(1, 'Elite Guard is FULL');
                        if (eliteList.length) {
                            MergeMyEliteTodo(eliteList);
                        }
                    } else if (autoEliteFew && state.getItem('AutoEliteEnd', '') === 'NoArmy') {
                        utility.log(1, 'Not enough friends to fill Elite Guard');
                        state.setItem('AutoEliteFew', false);
                    }

                    utility.log(1, 'Set Elite Guard AutoEliteGetList timer');
                    schedule.setItem('AutoEliteGetList', 21600, 300);
                    state.setItem('AutoEliteEnd', 'Full');
                    utility.log(1, 'Elite Guard done');
                    return false;
                }
            }

            if (!eliteList.length) {
                utility.log(1, 'Elite Guard no MyEliteTodo cycle');
                var allowPass = false;
                if (state.getItem(this.friendListType.giftc.name + 'Requested', false) && state.getItem(this.friendListType.giftc.name + 'Responded', false) === true) {
                    utility.log(1, 'Elite Guard received 0 friend ids');
                    if (utility.TextToArray(config.getItem('EliteArmyList', '')).length) {
                        utility.log(1, 'Elite Guard has some defined friend ids');
                        allowPass = true;
                    } else {
                        schedule.setItem('AutoEliteGetList', 21600, 300);
                        utility.log(1, 'Elite Guard has 0 defined friend ids');
                        state.setItem('AutoEliteEnd', 'Full');
                        utility.log(1, 'Elite Guard done');
                        return false;
                    }
                }

                this.GetFriendList(this.friendListType.giftc);
                var castleageList = [];
                if (state.getItem(this.friendListType.giftc.name + 'Responded', false) !== true) {
                    castleageList = state.getItem(this.friendListType.giftc.name + 'Responded', []);
                }

                if (castleageList.length || (this.stats.army.capped <= 1) || allowPass) {
                    utility.log(1, 'Elite Guard received a new friend list');
                    MergeMyEliteTodo(castleageList);
                    state.setItem(this.friendListType.giftc.name + 'Responded', []);
                    state.setItem(this.friendListType.giftc.name + 'Requested', false);
                    eliteList = state.getItem('MyEliteTodo', []);
                    if (eliteList.length === 0) {
                        utility.log(1, 'WARNING! Elite Guard friend list is 0');
                        state.setItem('AutoEliteFew', true);
                        schedule.setItem('AutoEliteGetList', 21600, 300);
                    } else if (eliteList.length < 50) {
                        utility.log(1, 'WARNING! Elite Guard friend list is fewer than 50: ', eliteList.length);
                        state.setItem('AutoEliteFew', true);
                    }
                }
            } else if (schedule.check('AutoEliteReqNext')) {
                utility.log(1, 'Elite Guard has a MyEliteTodo list, shifting User ID');
                var user = eliteList.shift();
                utility.log(1, 'Add Elite Guard ID: ', user);
                utility.ClickAjax('party.php?twt=jneg&jneg=true&user=' + user);
                utility.log(1, 'Elite Guard sent request, saving shifted MyEliteTodo');
                state.setItem('MyEliteTodo', eliteList);
                schedule.setItem('AutoEliteReqNext', 7);
                if (!eliteList.length) {
                    utility.log(1, 'Army list exhausted');
                    state.setItem('AutoEliteEnd', 'NoArmy');
                }
            }

            utility.log(1, 'Release Elite Guard cycle');
            return true;
        } catch (err) {
            utility.error("ERROR in AutoElite: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          PASSIVE GENERALS
    /////////////////////////////////////////////////////////////////////

    PassiveGeneral: function () {
        if (config.getItem('IdleGeneral', 'Use Current') !== 'Use Current') {
            if (general.Select('IdleGeneral')) {
                return true;
            }
        }

        return false;
    },

    /////////////////////////////////////////////////////////////////////
    //                          AUTOINCOME
    /////////////////////////////////////////////////////////////////////

    AutoIncome: function () {
        if (config.getItem("NoIncomeAfterLvl", true) && state.getItem('KeepLevelUpGeneral', false)) {
            return false;
        }

        if (this.stats.gold.payTime.minutes < 1 && this.stats.gold.payTime.ticker.match(/[0-9]+:[0-9]+/) && config.getItem('IncomeGeneral', 'Use Current') !== 'Use Current') {
            general.Select('IncomeGeneral');
            return true;
        }

        return false;
    },

    /////////////////////////////////////////////////////////////////////
    //                              AUTOGIFT
    /////////////////////////////////////////////////////////////////////

    CheckResults_army: function (resultsText) {
        if (config.getItem('AutoGift', false)) {
            if ($("a[href*='reqs.php#confirm_46755028429_0']").length) {
                utility.log(1, 'We have a gift waiting!');
                state.setItem('HaveGift', true);
            } else {
                utility.log(1, 'No gifts waiting.');
                state.setItem('HaveGift', false);
            }

            schedule.setItem("ajaxGiftCheck", gm.getItem('CheckGiftMins', 15, hiddenVar) * 60, 300);
        }

        var listHref = $('div[style="padding: 0pt 0pt 10px 0px; overflow: hidden; float: left; width: 240px; height: 50px;"]')
            .find('a[text="Ignore"]');
        for (var i = 0; i < listHref.length; i += 1) {
            var link = "<br /><a title='This link can be used to collect the " +
                "gift when it has been lost on Facebook. !!If you accept a gift " +
                "in this manner then it will leave an orphan request on Facebook!!' " +
                "href='" + listHref[i].href.replace('ignore', 'acpt') + "'>Lost Accept</a>";
            $(link).insertAfter(
                $('div[style="padding: 0pt 0pt 10px 0px; overflow: hidden; float: left; width: 240px; height: 50px;"]')
                .find('a[href=' + listHref[i].href + ']')
            );
        }
    },

    SortObject: function (obj, sortfunc, deep) {
        var list   = [],
            output = {},
            i      = 0;

        if (typeof deep === 'undefined') {
            deep = false;
        }

        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                list.push(i);
            }
        }

        list.sort(sortfunc);
        for (i = 0; i < list.length; i += 1) {
            if (deep && typeof obj[list[i]] === 'object') {
                output[list[i]] = this.SortObject(obj[list[i]], sortfunc, deep);
            } else {
                output[list[i]] = obj[list[i]];
            }
        }

        return output;
    },

    News: function () {
        try {
            if ($('#app46755028429_battleUpdateBox').length) {
                var xp = 0,
                    bp = 0,
                    wp = 0,
                    win = 0,
                    lose = 0,
                    deaths = 0,
                    cash = 0,
                    i,
                    list = [],
                    user = {};

                $('#app46755028429_battleUpdateBox .alertsContainer .alert_content').each(function (i, el) {
                    var uid,
                        txt = $(el).text().replace(/,/g, ''),
                        title = $(el).prev().text(),
                        days = title.regex(/([0-9]+) days/i),
                        hours = title.regex(/([0-9]+) hours/i),
                        minutes = title.regex(/([0-9]+) minutes/i),
                        seconds = title.regex(/([0-9]+) seconds/i),
                        time,
                        my_xp = 0,
                        my_bp = 0,
                        my_wp = 0,
                        my_cash = 0;

                    time = Date.now() - ((((((((days || 0) * 24) + (hours || 0)) * 60) + (minutes || 59)) * 60) + (seconds || 59)) * 1000);
                    if (txt.regex(/You were killed/i)) {
                        deaths += 1;
                    } else {
                        uid = $('a:eq(0)', el).attr('href').regex(/user=([0-9]+)/i);
                        user[uid] = user[uid] ||
                            {
                                name: $('a:eq(0)', el).text(),
                                win: 0,
                                lose: 0
                            };

                        var result = null;
                        if (txt.regex(/Victory!/i)) {
                            win += 1;
                            user[uid].lose += 1;
                            my_xp = txt.regex(/([0-9]+) experience/i);
                            my_bp = txt.regex(/([0-9]+) Battle Points!/i);
                            my_wp = txt.regex(/([0-9]+) War Points!/i);
                            my_cash = txt.regex(/\$([0-9]+)/i);
                            result = 'win';
                        } else {
                            lose += 1;
                            user[uid].win += 1;
                            my_xp = 0 - txt.regex(/([0-9]+) experience/i);
                            my_bp = 0 - txt.regex(/([0-9]+) Battle Points!/i);
                            my_wp = 0 - txt.regex(/([0-9]+) War Points!/i);
                            my_cash = 0 - txt.regex(/\$([0-9]+)/i);
                            result = 'loss';
                        }

                        xp += my_xp;
                        bp += my_bp;
                        wp += my_wp;
                        cash += my_cash;

                    }
                });

                if (win || lose) {
                    list.push('You were challenged <strong>' + (win + lose) + '</strong> times,<br>winning <strong>' + win + '</strong> and losing <strong>' + lose + '</strong>.');
                    list.push('You ' + (xp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + this.makeCommaValue(Math.abs(xp)) + '</span> experience points.');
                    list.push('You ' + (cash >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + '<b class="gold">$' + this.makeCommaValue(Math.abs(cash)) + '</b></span>.');
                    list.push('You ' + (bp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + this.makeCommaValue(Math.abs(bp)) + '</span> Battle Points.');
                    list.push('You ' + (wp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + this.makeCommaValue(Math.abs(wp)) + '</span> War Points.');
                    list.push('');
                    user = this.SortObject(user, function (a, b) {
                            return (user[b].win + (user[b].lose / 100)) - (user[a].win + (user[a].lose / 100));
                        });

                    for (i in user) {
                        if (user.hasOwnProperty(i)) {
                            list.push('<strong title="' + i + '">' + user[i].name + '</strong> ' +
                                (user[i].win ? 'beat you <span class="negative">' + user[i].win +
                                '</span> time' + (user[i].win > 1 ? 's' : '') : '') +
                                (user[i].lose ? (user[i].win ? ' and ' : '') +
                                'was beaten <span class="positive">' + user[i].lose +
                                '</span> time' + (user[i].lose > 1 ? 's' : '') : '') + '.');
                        }
                    }

                    if (deaths) {
                        list.push('You died ' + (deaths > 1 ? deaths + ' times' : 'once') + '!');
                    }

                    $('#app46755028429_battleUpdateBox .alertsContainer').prepend('<div style="padding: 0pt 0pt 10px;"><div class="alert_title">Summary:</div><div class="alert_content">' + list.join('<br>') + '</div></div>');
                }
            }

            return true;
        } catch (err) {
            utility.error("ERROR in News: " + err);
            return false;
        }
    },

    CheckResults_index: function (resultsText) {
        if (config.getItem('NewsSummary', true)) {
            this.News();
        }

        // Check for new gifts
        // A warrior wants to join your Army!
        // Send Gifts to Friends
        if (config.getItem('AutoGift', false)) {
            if (resultsText && /Send Gifts to Friends/.test(resultsText)) {
                utility.log(1, 'We have a gift waiting!');
                state.setItem('HaveGift', true);
            } else {
                utility.log(1, 'No gifts waiting.');
                state.setItem('HaveGift', false);
            }

            schedule.setItem("ajaxGiftCheck", gm.getItem('CheckGiftMins', 15, hiddenVar) * 60, 300);
        }
    },

    CheckResults_gift_accept: function (resultsText) {
        // Confirm gifts actually sent
        gifting.queue.sent();

        gifting.collected();
    },

    GiftExceedLog: true,

    AutoGift: function () {
        try {
            var tempDiv    = null,
                tempText   = '',
                giftImg    = '',
                giftChoice = '',
                popCheck,
                collecting;

            if (!config.getItem('AutoGift', false)) {
                return false;
            }

            popCheck = gifting.popCheck();
            if (typeof popCheck === 'boolean') {
                return popCheck;
            }

            // Go to gifts page if gift list is empty
            if (gifting.gifts.length() <= 2) {
                if (utility.NavigateTo('army,gift', 'tab_gifts_on.gif')) {
                    return true;
                }
            }

            collecting = gifting.collecting();
            if (typeof collecting === 'boolean') {
                return collecting;
            }

            if (!schedule.check("NoGiftDelay")) {
                return false;
            }

            if (!schedule.check("MaxGiftsExceeded")) {
                if (this.GiftExceedLog) {
                    utility.log(1, 'Gifting limit exceeded, will try later');
                    this.GiftExceedLog = false;
                }

                return false;
            }

            giftChoice = gifting.queue.chooseGift();
            if (gifting.queue.length() && giftChoice) {
                if (utility.NavigateTo('army,gift', 'tab_gifts_on.gif')) {
                    return true;
                }

                giftImg = gifting.gifts.getImg(giftChoice);
                if (giftImg) {
                    utility.NavigateTo('gift_more_gifts.gif');
                    tempDiv = $("#app46755028429_giftContainer img[class='imgButton']:first");
                    if (tempDiv && tempDiv.length) {
                        tempText = utility.getHTMLPredicate(tempDiv.attr("src"));
                        if (tempText !== giftImg) {
                            utility.log(1, "images", tempText, giftImg);
                            return utility.NavigateTo(giftImg);
                        }

                        utility.log(1, "Gift selected");
                    }
                } else {
                    utility.log(1, "Unknown gift, using first", giftChoice, giftImg);
                }

                if (gifting.queue.chooseFriend(5)) {
                    tempDiv = $("form[id*='req_form_'] input[name='send']");
                    if (tempDiv && tempDiv.length) {
                        utility.Click(tempDiv.get(0));
                        return true;
                    } else {
                        utility.warn("Send button not found!");
                        return false;
                    }
                } else {
                    utility.warn("No friends chosen!");
                    return false;
                }
            }

            if (utility.isEmpty(gifting.getCurrent())) {
                return false;
            }

            return true;
            /*
            var giverId = [];
            // Gather the gifts
            if (state.getItem('HaveGift', false)) {
                if (utility.NavigateTo('gift,army', 'invite_on.gif')) {
                    return true;
                }

                var acceptDiv = nHtml.FindByAttrContains(document.body, 'a', 'href', 'reqs.php#confirm_');
                var ignoreDiv = nHtml.FindByAttrContains(document.body, 'a', 'href', 'act=ignore');
                if (ignoreDiv && acceptDiv) {
                    giverId = new RegExp("(userId=|user=|/profile/|uid=)([0-9]+)").exec(ignoreDiv.href);
                    if (!giverId) {
                        utility.log(1, 'Unable to find giver ID, perhaps gift pending.');
                        return false;
                    }

                    var profDiv = nHtml.FindByAttrContains(acceptDiv.parentNode.parentNode, 'a', 'href', 'profile.php');
                    if (!profDiv) {
                        profDiv = nHtml.FindByAttrContains(acceptDiv.parentNode.parentNode, 'div', 'style', 'overflow: hidden; text-align: center; width: 170px;');
                    }

                    var giverName = "Unknown";
                    if (profDiv) {
                        giverName = $.trim(nHtml.GetText(profDiv));
                    }

                    gm.setItem('GiftEntry', [giverId[2], giverName]);
                    utility.log(1, 'Giver ID = ' + giverId[2] + ' Name  = ' + giverName);
                    schedule.setItem('ClickedFacebookURL', 30);
                    acceptDiv.href = "http://apps.facebook.com/reqs.php#confirm_46755028429_0";
                    state.setItem('clickUrl', acceptDiv.href);
                    utility.VisitUrl(acceptDiv.href);
                    return true;
                }

                state.setItem('HaveGift', false);
                return utility.NavigateTo('army,gift', 'tab_gifts_on.gif');
            }

            var button = nHtml.FindByAttrContains(document.body, 'input', 'name', 'skip_ci_btn');
            if (button) {
                utility.log(1, 'Denying Email Nag For Gift Send');
                utility.Click(button);
                return true;
            }

            // Facebook pop-up on CA
            if (gm.getItem('FBSendList', []).length) {
                button = nHtml.FindByAttrContains(document.body, 'input', 'name', 'sendit');
                if (button) {
                    utility.log(1, 'Sending gifts to Facebook');
                    utility.Click(button);
                    return true;
                }

                gm.unshift('ReceivedList', gm.getItem('FBSendList', []));
                gm.setItem('FBSendList', []);
                button = nHtml.FindByAttrContains(document.body, 'input', 'name', 'ok');
                if (button) {
                    utility.log(1, 'Over max gifts per day');
                    schedule.setItem('WaitForNextGiftSend', 10800, 300);
                    utility.Click(button);
                    return true;
                }

                utility.log(1, 'No Facebook pop up to send gifts');
                return false;
            }

            // CA send gift button
            if (gm.getItem('CASendList', []).length) {
                var sendForm = nHtml.FindByAttrContains(document.body, 'form', 'id', 'req_form_');
                if (sendForm) {
                    button = nHtml.FindByAttrContains(sendForm, 'input', 'name', 'send');
                    if (button) {
                        utility.log(1, 'Clicked CA send gift button');
                        gm.unshift('FBSendList', gm.getItem('CASendList', []));
                        gm.setItem('CASendList', []);
                        utility.Click(button);
                        return true;
                    }
                }

                utility.warn('No CA button to send gifts');
                gm.unshift('ReceivedList', gm.getItem('CASendList', []));
                gm.setItem('CASendList', []);
                return false;
            }

            if (!schedule.check('WaitForNextGiftSend')) {
                return false;
            }

            if (schedule.check('WaitForNotFoundIDs') && gm.getItem('NotFoundIDs', [])) {
                gm.unshift('ReceivedList', gm.getItem('NotFoundIDs', []));
                gm.setItem('NotFoundIDs', []);
            }

            if (gm.getItem('DisableGiftReturn', false, hiddenVar)) {
                gm.setItem('ReceivedList', []);
            }

            var giverList = gm.getItem('ReceivedList', []);
            if (!giverList.length) {
                return false;
            }

            if (utility.NavigateTo('army,gift', 'tab_gifts_on.gif')) {
                return true;
            }

            // Get the gift to send out
            if (giftNamePic && giftNamePic.length === 0) {
                utility.warn('No list of pictures for gift choices');
                return false;
            }

            var givenGiftType = '';
            var giftPic = '';
            var giftChoice = config.getItem('GiftChoice', 'Get Gift List');
            var giftList = gm.getItem('GiftList', []);
            switch (giftChoice) {
            case 'Random Gift':
                giftPic = gm.getItem('RandomGiftPic');
                if (giftPic) {
                    break;
                }

                var picNum = Math.floor(Math.random() * (giftList.length));
                var n = 0;
                for (var picN in giftNamePic) {
                    if (giftNamePic.hasOwnProperty(picN)) {
                        n += 1;
                        if (n === picNum) {
                            giftPic = giftNamePic[picN];
                            gm.setItem('RandomGiftPic', giftPic);
                            break;
                        }
                    }
                }

                if (!giftPic) {
                    utility.log(1, 'No gift type match. GiverList: ', giverList);
                    return false;
                }
                break;
            case 'Same Gift As Received':
                givenGiftType = giverList[0].split(global.vs)[2];
                utility.log(1, 'Looking for same gift as ', givenGiftType);
                if (giftList.indexOf(givenGiftType) < 0) {
                    utility.log(1, 'No gift type match. Using first gift as default.');
                    givenGiftType = gm.getItem('GiftList', [])[0];
                }
                giftPic = giftNamePic[givenGiftType];
                break;
            default:
                giftPic = giftNamePic[config.getItem('GiftChoice', 'Get Gift List')];
                break;
            }

            // Move to gifts page
            var picDiv = utility.CheckForImage(giftPic);
            if (!picDiv) {
                utility.warn('Unable to find ', giftPic);
                return false;
            } else {
                utility.log(1, 'GiftPic is ', giftPic);
            }

            if (nHtml.FindByAttrContains(picDiv.parentNode.parentNode.parentNode.parentNode, 'div', 'style', 'giftpage_select')) {
                if (utility.NavigateTo('gift_invite_castle_off.gif', 'gift_invite_castle_on.gif')) {
                    return true;
                }
            } else {
                utility.NavigateTo('gift_more_gifts.gif');
                return utility.NavigateTo(giftPic);
            }

            // Click on names
            var giveDiv = nHtml.FindByAttrContains(document.body, 'div', 'class', 'unselected_list');
            var doneDiv = nHtml.FindByAttrContains(document.body, 'div', 'class', 'selected_list');
            gm.setItem('ReceivedList', []);
            for (var p in giverList) {
                if (giverList.hasOwnProperty(p)) {
                    if (p > 9) {
                        if (giverList[p].length) {
                            gm.push('ReceivedList', giverList[p]);
                        }

                        continue;
                    }

                    var giverData = giverList[p].split(global.vs);
                    var giverID = giverData[0];
                    var giftType = giverData[2];
                    if (giftChoice === 'Same Gift As Received' && giftType !== givenGiftType && giftList.indexOf(giftType) >= 0) {
                        //utility.log(1, 'giftType ' + giftType + ' givenGiftType ' + givenGiftType);
                        if (giverList[p].length) {
                            gm.push('ReceivedList', giverList[p]);
                        }
                        continue;
                    }

                    var nameButton = nHtml.FindByAttrContains(giveDiv, 'input', 'value', giverID);
                    if (!nameButton) {
                        utility.log(1, 'Unable to find giver ID ', giverID);
                        gm.push('NotFoundIDs', giverList[p]);
                        schedule.setItem('WaitForNotFoundIDs', 10800);
                        continue;
                    } else {
                        utility.log(1, 'Clicking giver ID ', giverID);
                        utility.Click(nameButton);
                    }

                    //test actually clicked
                    if (nHtml.FindByAttrContains(doneDiv, 'input', 'value', giverID)) {
                        gm.push('CASendList', giverList[p]);
                        utility.log(1, 'Moved ID ', giverID);
                    } else {
                        utility.log(1, 'NOT moved ID ', giverID);
                        gm.push('NotFoundIDs', giverList[p]);
                        schedule.setItem('WaitForNotFoundIDs', 10800);
                    }
                }
            }

            return true;
            */
        } catch (err) {
            utility.error("ERROR in AutoGift: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                              IMMEDIATEAUTOSTAT
    /////////////////////////////////////////////////////////////////////

    ImmediateAutoStat: function () {
        if (!config.getItem("StatImmed", false) || !config.getItem('AutoStat', false)) {
            return false;
        }

        return caap.AutoStat();
    },

    ////////////////////////////////////////////////////////////////////
    //                      Auto Stat
    ////////////////////////////////////////////////////////////////////

    IncreaseStat: function (attribute, attrAdjust, atributeSlice) {
        try {
            utility.log(9, "Attribute: " + attribute + "   Adjust: " + attrAdjust);
            attribute = attribute.toLowerCase();
            var button        = null,
                ajaxLoadIcon  = null,
                level         = 0,
                attrCurrent   = 0,
                energy        = 0,
                stamina       = 0,
                attack        = 0,
                defense       = 0,
                health        = 0,
                attrAdjustNew = 0,
                logTxt        = "";

            ajaxLoadIcon = $('#app46755028429_AjaxLoadIcon');
            if (!ajaxLoadIcon.length || ajaxLoadIcon.css("display") !== 'none') {
                utility.warn("Unable to find AjaxLoadIcon or page not loaded: Fail");
                return "Fail";
            }

            if ((attribute === 'stamina') && (this.stats.points.skill < 2)) {
                if (config.getItem("StatSpendAll", false)) {
                    utility.log(1, "Stamina requires 2 upgrade points: Next");
                    return "Next";
                } else {
                    utility.log(1, "Stamina requires 2 upgrade points: Save");
                    state.setItem("statsMatch", false);
                    return "Save";
                }
            }

            switch (attribute) {
            case "energy" :
                button = nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'energy_max');
                break;
            case "stamina" :
                button = nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'stamina_max');
                break;
            case "attack" :
                button = nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'attack');
                break;
            case "defense" :
                button = nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'defense');
                break;
            case "health" :
                button = nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'health_max');
                break;
            default :
                throw "Unable to match attribute: " + attribute;
            }

            if (!button) {
                utility.warn("Unable to locate upgrade button: Fail ", attribute);
                return "Fail";
            }

            attrAdjustNew = attrAdjust;
            logTxt = attrAdjust;
            level = this.stats.level;
            attrCurrent = parseInt(button.parentNode.parentNode.childNodes[3].firstChild.data.replace(new RegExp("[^0-9]", "g"), ''), 10);
            energy = parseInt(nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'energy_max').parentNode.parentNode.childNodes[3].firstChild.data.replace(new RegExp("[^0-9]", "g"), ''), 10);
            stamina = parseInt(nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'stamina_max').parentNode.parentNode.childNodes[3].firstChild.data.replace(new RegExp("[^0-9]", "g"), ''), 10);
            if (level >= 10) {
                attack = parseInt(nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'attack').parentNode.parentNode.childNodes[3].firstChild.data.replace(new RegExp("[^0-9]", "g"), ''), 10);
                defense = parseInt(nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'defense').parentNode.parentNode.childNodes[3].firstChild.data.replace(new RegExp("[^0-9]", "g"), ''), 10);
                health = parseInt(nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'health_max').parentNode.parentNode.childNodes[3].firstChild.data.replace(new RegExp("[^0-9]", "g"), ''), 10);
            }

            utility.log(9, "Energy=" + energy + " Stamina=" + stamina + " Attack=" + attack + " Defense=" + defense + " Heath=" + health);
            if (config.getItem('AutoStatAdv', false)) {
                //Using eval, so user can define formulas on menu, like energy = level + 50
                attrAdjustNew = eval(attrAdjust);
                logTxt = "(" + attrAdjust + ")=" + attrAdjustNew;
            }

            if (attrAdjustNew > attrCurrent) {
                utility.log(1, "Status Before [" + attribute + "=" + attrCurrent + "]  Adjusting To [" + logTxt + "]");
                utility.Click(button);
                return "Click";
            }

            return "Next";
        } catch (err) {
            utility.error("ERROR in IncreaseStat: " + err);
            return "Error";
        }
    },

    AutoStatCheck: function () {
        try {
            var startAtt   = 0,
                stopAtt    = 4,
                attribute  = '',
                attrValue  = 0,
                n          = 0,
                level      = 0,
                energy     = 0,
                stamina    = 0,
                attack     = 0,
                defense    = 0,
                health     = 0,
                attrAdjust = 0,
                value      = 0,
                passed     = false;

            if (!config.getItem('AutoStat', false) || !this.stats.points.skill) {
                return false;
            }

            if (config.getItem("AutoStatAdv", false)) {
                startAtt = 5;
                stopAtt = 9;
            }

            for (n = startAtt; n <= stopAtt; n += 1) {
                attribute = config.getItem('Attribute' + n, '').toLowerCase();
                if (attribute === '') {
                    continue;
                }

                if (this.stats.level < 10) {
                    if (attribute === 'attack' || attribute === 'defense' || attribute === 'health') {
                        continue;
                    }
                }

                if ((attribute === 'stamina') && (this.stats.points.skill < 2)) {
                    if (config.getItem("StatSpendAll", false)) {
                        continue;
                    } else {
                        passed = false;
                        break;
                    }
                }

                attrValue = config.getItem('AttrValue' + n, 0);
                attrAdjust = attrValue;
                level = this.stats.level;
                energy = this.stats.energy.num;
                stamina = this.stats.stamina.num;
                if (level >= 10) {
                    attack = this.stats.attack;
                    defense = this.stats.defense;
                    health = this.stats.health.num;
                }

                if (config.getItem('AutoStatAdv', false)) {
                    //Using eval, so user can define formulas on menu, like energy = level + 50
                    attrAdjust = eval(attrValue);
                }

                if (attribute === "attack" || attribute === "defense") {
                    value = this.stats[attribute];
                } else {
                    value = this.stats[attribute].num;
                }

                if (attrAdjust > value) {
                    passed = true;
                    break;
                }
            }

            state.setItem("statsMatch", passed);
            return true;
        } catch (err) {
            utility.error("ERROR in AutoStatCheck: " + err);
            return false;
        }
    },

    AutoStat: function () {
        try {
            if (!config.getItem('AutoStat', false) || !this.stats.points.skill) {
                return false;
            }

            if (!state.getItem("statsMatch", true)) {
                if (state.getItem("autoStatRuleLog", true)) {
                    utility.log(1, "User should possibly change their stats rules");
                    state.setItem("autoStatRuleLog", false);
                }

                return false;
            }

            var atributeSlice      = null,
                startAtt           = 0,
                stopAtt            = 4,
                attrName           = '',
                attribute          = '',
                attrValue          = 0,
                n                  = 0,
                returnIncreaseStat = '';

            //atributeSlice = nHtml.FindByAttrContains(document.body, "div", "class", 'keep_attribute_section');
            atributeSlice = $("div[class*='keep_attribute_section']").get(0);
            if (!atributeSlice) {
                utility.NavigateTo('keep');
                return true;
            }

            if (config.getItem("AutoStatAdv", false)) {
                startAtt = 5;
                stopAtt = 9;
            }

            for (n = startAtt; n <= stopAtt; n += 1) {
                attrName = 'Attribute' + n;
                attribute = config.getItem(attrName, '');
                if (attribute === '') {
                    utility.log(9, attrName + " is blank: continue");
                    continue;
                }

                if (this.stats.level < 10) {
                    if (attribute === 'Attack' || attribute === 'Defense' || attribute === 'Health') {
                        utility.log(1, "Characters below level 10 can not increase Attack, Defense or Health: continue");
                        continue;
                    }
                }

                attrValue = config.getItem('AttrValue' + n, 0);
                returnIncreaseStat = this.IncreaseStat(attribute, attrValue, atributeSlice);
                switch (returnIncreaseStat) {
                case "Next" :
                    utility.log(9, attrName + " : next");
                    continue;
                case "Click" :
                    utility.log(9, attrName + " : click");
                    return true;
                default :
                    utility.log(9, attrName + " return value: " + returnIncreaseStat);
                    return false;
                }
            }

            utility.log(1, "No rules match to increase stats");
            state.setItem("statsMatch", false);
            return false;
        } catch (err) {
            utility.error("ERROR in AutoStat: " + err);
            return false;
        }
    },

    AutoCollectMA: function () {
        try {
            if (!config.getItem('AutoCollectMA', false) || !schedule.check('AutoCollectMATimer') || this.stats.level < 10) {
                return false;
            }

            utility.log(1, "Collecting Master and Apprentice reward");
            caap.SetDivContent('idle_mess', 'Collect MA Reward');
            //var buttonMas = nHtml.FindByAttrContains(document.body, "img", "src", "ma_view_progress_main"),
            //    buttonApp = nHtml.FindByAttrContains(document.body, "img", "src", "ma_main_learn_more");
            var buttonMas = utility.CheckForImage("ma_view_progress_main"),
                buttonApp = utility.CheckForImage("ma_main_learn_more");

            if (!buttonMas && !buttonApp) {
                utility.log(1, "Going to home");
                if (utility.NavigateTo('index')) {
                    return true;
                }
            }

            if (buttonMas) {
                utility.Click(buttonMas);
                this.SetDivContent('idle_mess', 'Collected MA Reward');
                utility.log(1, "Collected Master and Apprentice reward");
            }

            if (!buttonMas && buttonApp) {
                this.SetDivContent('idle_mess', 'No MA Rewards');
                utility.log(1, "No Master and Apprentice rewards");
            }

            window.setTimeout(function () {
                caap.SetDivContent('idle_mess', '');
            }, 5000);

            schedule.setItem('AutoCollectMATimer', 86400, 300);
            utility.log(1, "Collect Master and Apprentice reward completed");
            return true;
        } catch (err) {
            utility.error("ERROR in AutoCollectMA: " + err);
            return false;
        }
    },

    friendListType: {
        facebook: {
            name: "facebook",
            url: 'http://apps.facebook.com/castle_age/army.php?app_friends=false&giftSelection=1'
        },
        gifta: {
            name: "gifta",
            url: 'http://apps.facebook.com/castle_age/gift.php?app_friends=a&giftSelection=1'
        },
        giftb: {
            name: "giftb",
            url: 'http://apps.facebook.com/castle_age/gift.php?app_friends=b&giftSelection=1'
        },
        giftc: {
            name: "giftc",
            url: 'http://apps.facebook.com/castle_age/gift.php?app_friends=c&giftSelection=1'
        }
    },

    GetFriendList: function (listType, force) {
        try {
            utility.log(1, "Entered GetFriendList and request is for: ", listType.name);
            if (force) {
                state.setItem(listType.name + 'Requested', false);
                state.setItem(listType.name + 'Responded', []);
            }

            if (!state.getItem(listType.name + 'Requested', false)) {
                utility.log(1, "Getting Friend List: ", listType.name);
                state.setItem(listType.name + 'Requested', true);

                $.ajax({
                    url: listType.url,
                    error:
                        function (XMLHttpRequest, textStatus, errorThrown) {
                            state.setItem(listType.name + 'Requested', false);
                            utility.log(1, "GetFriendList(" + listType.name + "): ", textStatus);
                        },
                    success:
                        function (data, textStatus, XMLHttpRequest) {
                            try {
                                utility.log(1, "GetFriendList.ajax splitting data");
                                data = data.split('<div class="unselected_list">');
                                if (data.length < 2) {
                                    throw "Could not locate 'unselected_list'";
                                }

                                data = data[1].split('</div><div class="selected_list">');
                                if (data.length < 2) {
                                    throw "Could not locate 'selected_list'";
                                }

                                utility.log(1, "GetFriendList.ajax data split ok");
                                var friendList = [];
                                $('<div></div>').html(data[0]).find('input').each(function (index) {
                                    friendList.push($(this).val());
                                });

                                utility.log(1, "GetFriendList.ajax saving friend list of: ", friendList.length);
                                if (friendList.length) {
                                    state.setItem(listType.name + 'Responded', friendList);
                                } else {
                                    state.setItem(listType.name + 'Responded', true);
                                }

                                utility.log(1, "GetFriendList(" + listType.name + "): ", textStatus);
                                //utility.log(1, "GetFriendList(" + listType.name + "): " + friendList);
                            } catch (err) {
                                state.setItem(listType.name + 'Requested', false);
                                utility.error("ERROR in GetFriendList.ajax: " + err);
                            }
                        }
                });
            } else {
                utility.log(1, "Already requested GetFriendList for: ", listType.name);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in GetFriendList(" + listType.name + "): " + err);
            return false;
        }
    },

    addFriendSpamCheck: 0,

    AddFriend: function (id) {
        try {
            var responseCallback = function (XMLHttpRequest, textStatus, errorThrown) {
                if (caap.addFriendSpamCheck > 0) {
                    caap.addFriendSpamCheck -= 1;
                }

                utility.log(1, "AddFriend(" + id + "): ", textStatus);
            };

            $.ajax({
                url: 'http://apps.facebook.com/castle_age/party.php?twt=jneg&jneg=true&user=' + id + '&lka=' + id + '&etw=9&ref=nf',
                error: responseCallback,
                success: responseCallback
            });

            return true;
        } catch (err) {
            utility.error("ERROR in AddFriend(" + id + "): " + err);
            return false;
        }
    },

    AutoFillArmy: function (caListType, fbListType) {
        try {
            if (!state.getItem('FillArmy', false)) {
                return false;
            }

            var armyCount = state.getItem("ArmyCount", 0);
            if (armyCount === 0) {
                this.SetDivContent('idle_mess', 'Filling Army');
                utility.log(1, "Filling army");
            }

            if (state.getItem(caListType.name + 'Responded', false) === true || state.getItem(fbListType.name + 'Responded', false) === true) {
                this.SetDivContent('idle_mess', '<b>Fill Army Completed</b>');
                utility.log(1, "Fill Army Completed: no friends found");
                window.setTimeout(function () {
                    caap.SetDivContent('idle_mess', '');
                }, 5000);

                state.setItem('FillArmy', false);
                state.setItem("ArmyCount", 0);
                state.setItem('FillArmyList', []);
                state.setItem(caListType.name + 'Responded', false);
                state.setItem(fbListType.name + 'Responded', false);
                state.setItem(caListType.name + 'Requested', []);
                state.setItem(fbListType.name + 'Requested', []);
                return true;
            }

            var fillArmyList = state.getItem('FillArmyList', []);
            if (!fillArmyList.length) {
                this.GetFriendList(caListType);
                this.GetFriendList(fbListType);
            }

            var castleageList = state.getItem(caListType.name + 'Responded', []);
            //utility.log(1, "gifList: " + castleageList);
            var facebookList = state.getItem(fbListType.name + 'Responded', []);
            //utility.log(1, "facebookList: " + facebookList);
            if ((castleageList.length && facebookList.length) || fillArmyList.length) {
                if (!fillArmyList.length) {
                    var diffList = facebookList.filter(function (facebookID) {
                        return (castleageList.indexOf(facebookID) >= 0);
                    });

                    //utility.log(1, "diffList: " + diffList);
                    fillArmyList = state.setItem('FillArmyList', diffList);
                    state.setItem(caListType.name + 'Responded', false);
                    state.setItem(fbListType.name + 'Responded', false);
                    state.setItem(caListType.name + 'Requested', []);
                    state.setItem(fbListType.name + 'Requested', []);
                }

                // Add army members //
                var batchCount = 5;
                if (fillArmyList.length < 5) {
                    batchCount = fillArmyList.length;
                } else if (fillArmyList.length - armyCount < 5) {
                    batchCount = fillArmyList.length - armyCount;
                }

                batchCount = batchCount - this.addFriendSpamCheck;
                for (var i = 0; i < batchCount; i += 1) {
                    this.AddFriend(fillArmyList[armyCount]);
                    armyCount += 1;
                    this.addFriendSpamCheck += 1;
                }

                this.SetDivContent('idle_mess', 'Filling Army, Please wait...' + armyCount + "/" + fillArmyList.length);
                utility.log(1, 'Filling Army, Please wait...' + armyCount + "/" + fillArmyList.length);
                state.setItem("ArmyCount", armyCount);
                if (armyCount >= fillArmyList.length) {
                    this.SetDivContent('idle_mess', '<b>Fill Army Completed</b>');
                    window.setTimeout(function () {
                        caap.SetDivContent('idle_mess', '');
                    }, 5000);

                    utility.log(1, "Fill Army Completed");
                    state.setItem('FillArmy', false);
                    state.setItem("ArmyCount", 0);
                    state.setItem('FillArmyList', []);
                }
            }

            return true;
        } catch (err) {
            utility.error("ERROR in AutoFillArmy: " + err);
            this.SetDivContent('idle_mess', '<b>Fill Army Failed</b>');
            window.setTimeout(function () {
                caap.SetDivContent('idle_mess', '');
            }, 5000);

            state.setItem('FillArmy', false);
            state.setItem("ArmyCount", 0);
            state.setItem('FillArmyList', []);
            state.setItem(caListType.name + 'Responded', false);
            state.setItem(fbListType.name + 'Responded', false);
            state.setItem(caListType.name + 'Requested', []);
            state.setItem(fbListType.name + 'Requested', []);
            return false;
        }
    },

    AjaxGiftCheck: function () {
        try {
            if (!config.getItem('AutoGift', false) || !schedule.check("ajaxGiftCheck")) {
                return false;
            }

            utility.log(2, "Performing AjaxGiftCheck");

            $.ajax({
                url: "http://apps.facebook.com/castle_age/army.php",
                error:
                    function (XMLHttpRequest, textStatus, errorThrown) {
                        utility.error("AjaxGiftCheck.ajax", textStatus);
                    },
                success:
                    function (data, textStatus, XMLHttpRequest) {
                        try {
                            utility.log(2, "AjaxGiftCheck.ajax: Checking data.");
                            if ($(data).find("a[href*='reqs.php#confirm_46755028429_0']").length) {
                                utility.log(1, 'AjaxGiftCheck.ajax: We have a gift waiting!');
                                state.setItem('HaveGift', true);
                            } else {
                                utility.log(1, 'AjaxGiftCheck.ajax: No gifts waiting.');
                                state.setItem('HaveGift', false);
                            }

                            utility.log(2, "AjaxGiftCheck.ajax: Done.");
                        } catch (err) {
                            utility.error("ERROR in AjaxGiftCheck.ajax: " + err);
                        }
                    }
            });

            schedule.setItem("ajaxGiftCheck", gm.getItem('CheckGiftMins', 15, hiddenVar) * 60, 300);
            utility.log(2, "Completed AjaxGiftCheck");
            return true;
        } catch (err) {
            utility.error("ERROR in AjaxGiftCheck: " + err);
            return false;
        }
    },

    Idle: function () {
        if (state.getItem('resetselectMonster', false)) {
            utility.log(1, "resetselectMonster");
            monster.select(true);
            state.setItem('resetselectMonster', false);
        }

        if (this.CheckGenerals()) {
            return true;
        }

        if (general.GetAllStats()) {
            return true;
        }

        if (this.CheckKeep()) {
            return true;
        }

        if (this.CheckAchievements()) {
            return true;
        }

        if (this.AutoCollectMA()) {
            return true;
        }

        if (this.AjaxGiftCheck()) {
            return true;
        }

        if (this.ReconPlayers()) {
            return true;
        }

        if (this.CheckOracle()) {
            return true;
        }

        if (this.CheckBattleRank()) {
            return true;
        }

        if (this.CheckWarRank()) {
            return true;
        }

        if (this.CheckSymbolQuests()) {
            return true;
        }

        if (this.CheckSoldiers()) {
            return true;
        }

        if (this.CheckItem()) {
            return true;
        }

        if (this.CheckMagic()) {
            return true;
        }

        if (this.CheckCharacterClasses()) {
            return true;
        }

        this.AutoFillArmy(this.friendListType.giftc, this.friendListType.facebook);
        this.UpdateDashboard();
        state.setItem('ReleaseControl', true);
        return true;
    },

    /*-------------------------------------------------------------------------------------\
                                      RECON PLAYERS
    ReconPlayers is an idle background process that scans the battle page for viable
    targets that can later be attacked.
    \-------------------------------------------------------------------------------------*/

    ReconRecordArray : [],

    ReconRecord: function () {
        this.data = {
            userID          : 0,
            nameStr         : '',
            rankStr         : '',
            rankNum         : 0,
            warRankStr      : '',
            warRankNum      : 0,
            levelNum        : 0,
            armyNum         : 0,
            deityNum        : 0,
            invadewinsNum   : 0,
            invadelossesNum : 0,
            duelwinsNum     : 0,
            duellossesNum   : 0,
            defendwinsNum   : 0,
            defendlossesNum : 0,
            statswinsNum    : 0,
            statslossesNum  : 0,
            goldNum         : 0,
            aliveTime       : new Date(2009, 0, 1).getTime(),
            attackTime      : new Date(2009, 0, 1).getTime(),
            selectTime      : new Date(2009, 0, 1).getTime()
        };
    },

    LoadRecon: function () {
        this.ReconRecordArray = gm.getItem('recon.records', 'default');
        if (this.ReconRecordArray === 'default') {
            this.ReconRecordArray = [];
            gm.setItem('recon.records', this.ReconRecordArray);
        }

        state.setItem("ReconDashUpdate", true);
    },

    SaveRecon: function () {
        gm.setItem('recon.records', this.ReconRecordArray);
        state.setItem("ReconDashUpdate", true);
    },

    ReconPlayers: function () {
        try {
            if (!config.getItem('DoPlayerRecon', false)) {
                return false;
            }

            if (this.stats.stamina.num <= 0) {
                return false;
            }

            if (!schedule.check('PlayerReconTimer')) {
                return false;
            }

            this.SetDivContent('idle_mess', 'Player Recon: In Progress');
            utility.log(1, "Player Recon: In Progress");

            $.ajax({
                url: "http://apps.facebook.com/castle_age/battle.php",
                error:
                    function (XMLHttpRequest, textStatus, errorThrown) {
                        utility.error("ReconPlayers2.ajax", textStatus);
                    },
                success:
                    function (data, textStatus, XMLHttpRequest) {
                        try {
                            var found = 0;
                            utility.log(2, "ReconPlayers.ajax: Checking data.");

                            $(data).find("img[src*='symbol_']").not("[src*='symbol_tiny_']").each(function (index) {
                                var UserRecord      = new caap.ReconRecord(),
                                    $tempObj        = $(this).parent().parent().parent().parent().parent(),
                                    tempArray       = [],
                                    txt             = '',
                                    regex           = new RegExp('(.+)\\s*\\(Level ([0-9]+)\\)\\s*Battle: ([A-Za-z ]+) \\(Rank ([0-9]+)\\)\\s*War: ([A-Za-z ]+) \\(Rank ([0-9]+)\\)\\s*([0-9]+)', 'i'),
                                    regex2          = new RegExp('(.+)\\s*\\(Level ([0-9]+)\\)\\s*Battle: ([A-Za-z ]+) \\(Rank ([0-9]+)\\)\\s*([0-9]+)', 'i'),
                                    entryLimit      = gm.getItem('LimitTargets', 100, hiddenVar),
                                    i               = 0,
                                    OldRecord       = null,
                                    reconRank       = config.getItem('ReconPlayerRank', 99),
                                    reconLevel      = config.getItem('ReconPlayerLevel', 999),
                                    reconARBase     = config.getItem('ReconPlayerARBase', 999),
                                    levelMultiplier = 0,
                                    armyRatio       = 0,
                                    goodTarget      = true;

                                if ($tempObj.length) {
                                    tempArray = $tempObj.find("a:first").attr("href").match(/user=([0-9]+)/);
                                    if (tempArray && tempArray.length === 2) {
                                        UserRecord.data.userID = parseInt(tempArray[1], 10);
                                    }

                                    for (i = 0; i < caap.ReconRecordArray.length; i += 1) {
                                        if (caap.ReconRecordArray[i].userID === UserRecord.data.userID) {
                                            UserRecord.data = caap.ReconRecordArray[i];
                                            caap.ReconRecordArray.splice(i, 1);
                                            utility.log(2, "UserRecord exists. Loaded and removed.", UserRecord);
                                            break;
                                        }
                                    }

                                    tempArray = $(this).attr("src").match(/symbol_([0-9])\.jpg/);
                                    if (tempArray && tempArray.length === 2) {
                                        UserRecord.data.deityNum = parseInt(tempArray[1], 10);
                                    }

                                    txt = $.trim($tempObj.text());
                                    if (txt.length) {
                                        if (caap.battles.Freshmeat.warLevel) {
                                            tempArray = regex.exec(txt);
                                            if (!tempArray) {
                                                tempArray = regex2.exec(txt);
                                                caap.battles.Freshmeat.warLevel = false;
                                            }
                                        } else {
                                            tempArray = regex2.exec(txt);
                                            if (!tempArray) {
                                                tempArray = regex.exec(txt);
                                                caap.battles.Freshmeat.warLevel = true;
                                            }
                                        }

                                        if (tempArray) {
                                            UserRecord.data.aliveTime      = new Date().getTime();
                                            UserRecord.data.nameStr        = $.trim(tempArray[1]);
                                            UserRecord.data.levelNum       = parseInt(tempArray[2], 10);
                                            UserRecord.data.rankStr        = tempArray[3];
                                            UserRecord.data.rankNum        = parseInt(tempArray[4], 10);
                                            if (caap.battles.Freshmeat.warLevel) {
                                                UserRecord.data.warRankStr = tempArray[5];
                                                UserRecord.data.warRankNum = parseInt(tempArray[6], 10);
                                                UserRecord.data.armyNum    = parseInt(tempArray[7], 10);
                                            } else {
                                                UserRecord.data.armyNum    = parseInt(tempArray[5], 10);
                                            }

                                            if (UserRecord.data.levelNum - caap.stats.level > reconLevel) {
                                                utility.log(2, 'Level above reconLevel max', reconLevel, UserRecord);
                                                goodTarget = false;
                                            } else if (caap.stats.rank.battle - UserRecord.data.rankNum > reconRank) {
                                                utility.log(2, 'Rank below reconRank min', reconRank, UserRecord);
                                                goodTarget = false;
                                            } else {
                                                levelMultiplier = caap.stats.level / UserRecord.data.levelNum;
                                                armyRatio = reconARBase * levelMultiplier;
                                                if (armyRatio <= 0) {
                                                    utility.log(2, 'Recon unable to calculate army ratio', reconARBase, levelMultiplier);
                                                    goodTarget = false;
                                                } else if (UserRecord.data.armyNum  > (caap.stats.army.capped * armyRatio)) {
                                                    utility.log(2, 'Army above armyRatio adjustment', armyRatio, UserRecord);
                                                    goodTarget = false;
                                                }
                                            }

                                            if (goodTarget) {
                                                while (caap.ReconRecordArray.length >= entryLimit) {
                                                    OldRecord = caap.ReconRecordArray.shift();
                                                    utility.log(2, "Entry limit matched. Deleted an old record", OldRecord);
                                                }

                                                utility.log(2, "UserRecord", UserRecord);
                                                caap.ReconRecordArray.push(UserRecord.data);
                                                found += 1;
                                            }
                                        } else {
                                            utility.warn('Recon can not parse target text string', txt);
                                        }
                                    } else {
                                        utility.warn("Can't find txt in $tempObj", $tempObj);
                                    }
                                } else {
                                    utility.warn("$tempObj is empty");
                                }
                            });

                            caap.SaveRecon();
                            caap.SetDivContent('idle_mess', 'Player Recon: Found:' + found + ' Total:' + caap.ReconRecordArray.length);
                            utility.log(1, 'Player Recon: Found:' + found + ' Total:' + caap.ReconRecordArray.length);
                            window.setTimeout(function () {
                                caap.SetDivContent('idle_mess', '');
                            }, 5 * 1000);

                            utility.log(2, "ReconPlayers.ajax: Done.", caap.ReconRecordArray);
                        } catch (err) {
                            utility.error("ERROR in ReconPlayers.ajax: " + err);
                        }
                    }
            });

            schedule.setItem('PlayerReconTimer', gm.getItem('PlayerReconRetry', 60, hiddenVar), 60);
            return true;
        } catch (err) {
            utility.error("ERROR in ReconPlayers:" + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          MAIN LOOP
    // This function repeats continously.  In principle, functions should only make one
    // click before returning back here.
    /////////////////////////////////////////////////////////////////////

    actionDescTable: {
        AutoIncome        : 'Awaiting Income',
        AutoStat          : 'Upgrade Skill Points',
        MaxEnergyQuest    : 'At Max Energy Quest',
        PassiveGeneral    : 'Setting Idle General',
        Idle              : 'Idle Tasks',
        ImmediateBanking  : 'Immediate Banking',
        Battle            : 'Battling Players',
        MonsterReview     : 'Review Monsters/Raids',
        ImmediateAutoStat : 'Immediate Auto Stats',
        AutoElite         : 'Fill Elite Guard',
        AutoPotions       : 'Auto Potions',
        AutoAlchemy       : 'Auto Alchemy',
        AutoBless         : 'Auto Bless',
        AutoGift          : 'Auto Gifting',
        DemiPoints        : 'Demi Points First',
        Monsters          : 'Fighting Monsters',
        Heal              : 'Auto Healing',
        Bank              : 'Auto Banking',
        Lands             : 'Land Operations'
    },

    CheckLastAction: function (thisAction) {
        var lastAction = state.getItem('LastAction', 'none');
        if (this.actionDescTable[thisAction]) {
            this.SetDivContent('activity_mess', 'Activity: ' + this.actionDescTable[thisAction]);
        } else {
            this.SetDivContent('activity_mess', 'Activity: ' + thisAction);
        }

        if (lastAction !== thisAction) {
            utility.log(1, 'Changed from doing ' + lastAction + ' to ' + thisAction);
            state.setItem('LastAction', thisAction);
        }
    },

    // The Master Action List
    masterActionList: {
        0x00: 'AutoElite',
        0x01: 'Heal',
        0x02: 'ImmediateBanking',
        0x03: 'ImmediateAutoStat',
        0x04: 'MaxEnergyQuest',
        0x05: 'MonsterReview',
        0x06: 'DemiPoints',
        0x07: 'Monsters',
        0x08: 'Battle',
        0x09: 'Quests',
        0x0A: 'Bank',
        0x0B: 'PassiveGeneral',
        0x0C: 'Lands',
        0x0D: 'AutoBless',
        0x0E: 'AutoStat',
        0x0F: 'AutoGift',
        0x10: 'AutoPotions',
        0x11: 'AutoAlchemy',
        0x12: 'Idle'
    },

    actionsList: [],

    MakeActionsList: function () {
        try {
            if (this.actionsList && this.actionsList.length === 0) {
                utility.log(1, "Loading a fresh Action List");
                // actionOrder is a comma seperated string of action numbers as
                // hex pairs and can be referenced in the Master Action List
                // Example: "00,01,02,03,04,05,06,07,08,09,0A,0B,0C,0D,0E,0F,10,11,12"
                var action = '';
                var actionOrderArray = [];
                var masterActionListCount = 0;
                var actionOrderUser = gm.getItem("actionOrder", '', hiddenVar);
                if (actionOrderUser !== '') {
                    // We are using the user defined actionOrder set in the
                    // Advanced Hidden Options
                    utility.log(1, "Trying user defined Action Order");
                    // We take the User Action Order and convert it from a comma
                    // separated list into an array
                    actionOrderArray = actionOrderUser.split(",");
                    // We count the number of actions contained in the
                    // Master Action list
                    for (action in this.masterActionList) {
                        if (this.masterActionList.hasOwnProperty(action)) {
                            masterActionListCount += 1;
                            utility.log(9, "Counting Action List", masterActionListCount);
                        } else {
                            utility.warn("Error Getting Master Action List length!");
                            utility.warn("Skipping 'action' from masterActionList: ", action);
                        }
                    }
                } else {
                    // We are building the Action Order Array from the
                    // Master Action List
                    utility.log(1, "Building the default Action Order");
                    for (action in this.masterActionList) {
                        if (this.masterActionList.hasOwnProperty(action)) {
                            masterActionListCount = actionOrderArray.push(action);
                            utility.log(9, "Action Added", action);
                        } else {
                            utility.warn("Error Building Default Action Order!");
                            utility.warn("Skipping 'action' from masterActionList: ", action);
                        }
                    }
                }

                // We notify if the number of actions are not sensible or the
                // same as in the Master Action List
                var actionOrderArrayCount = actionOrderArray.length;
                if (actionOrderArrayCount === 0) {
                    var throwError = "Action Order Array is empty! " + (actionOrderUser === "" ? "(Default)" : "(User)");
                    throw throwError;
                }

                if (actionOrderArrayCount < masterActionListCount) {
                    utility.warn("Warning! Action Order Array has fewer orders than default!");
                }

                if (actionOrderArrayCount > masterActionListCount) {
                    utility.warn("Warning! Action Order Array has more orders than default!");
                }

                // We build the Action List
                utility.log(8, "Building Action List ...");
                for (var itemCount = 0; itemCount !== actionOrderArrayCount; itemCount += 1) {
                    var actionItem = '';
                    if (actionOrderUser !== '') {
                        // We are using the user defined comma separated list
                        // of hex pairs
                        actionItem = this.masterActionList[parseInt(actionOrderArray[itemCount], 16)];
                        utility.log(9, "(" + itemCount + ") Converted user defined hex pair to action", actionItem);
                    } else {
                        // We are using the Master Action List
                        actionItem = this.masterActionList[actionOrderArray[itemCount]];
                        utility.log(9, "(" + itemCount + ") Converted Master Action List entry to an action", actionItem);
                    }

                    // Check the Action Item
                    if (actionItem.length > 0 && typeof(actionItem) === "string") {
                        // We add the Action Item to the Action List
                        this.actionsList.push(actionItem);
                        utility.log(9, "Added action to the list", actionItem);
                    } else {
                        utility.warn("Error! Skipping actionItem");
                        utility.warn("Action Item(" + itemCount + "): ", actionItem);
                    }
                }

                if (actionOrderUser !== '') {
                    utility.log(1, "Get Action List: " + this.actionsList);
                }
            }
            return true;
        } catch (err) {
            // Something went wrong, log it and use the emergency Action List.
            utility.error("ERROR in MakeActionsList: " + err);
            this.actionsList = [
                "AutoElite",
                "Heal",
                "ImmediateBanking",
                "ImmediateAutoStat",
                "MaxEnergyQuest",
                "MonsterReview",
                "DemiPoints",
                "Monsters",
                "Battle",
                "Quests",
                "Bank",
                'PassiveGeneral',
                "Lands",
                "AutoBless",
                "AutoStat",
                "AutoGift",
                'AutoPotions',
                "AutoAlchemy",
                "Idle"
            ];

            return false;
        }
    },

    ErrorCheck: function () {
        // assorted errors...
        if (window.location.href.indexOf('/common/error.html') >= 0) {
            utility.log(1, 'detected error page, waiting to go back to previous page.');
            window.setTimeout(function () {
                window.history.go(-1);
            }, 30 * 1000);

            return true;
        }

        if ($('#try_again_button').length) {
            utility.log(1, 'detected Try Again message, waiting to reload');
            // error
            window.setTimeout(function () {
                window.history.go(0);
            }, 30 * 1000);

            return true;
        }

        return false;
    },

    MainLoop: function () {
        utility.waitMilliSecs = 5000;
        // assorted errors...
        if (this.ErrorCheck()) {
            return;
        }

        if (window.location.href.indexOf('apps.facebook.com/reqs.php') >= 0 || window.location.href.indexOf('filter=app_46755028429') >= 0) {
            gifting.collect();
            this.WaitMainLoop();
            return;
        }

        //We don't need to send out any notifications
        var button = $("a[class*='undo_link']");
        if (button && button.length) {
            utility.Click(button.get(0));
            utility.log(1, 'Undoing notification');
        }

        var caapDisabled = config.getItem('Disabled', false);
        if (caapDisabled) {
            this.WaitMainLoop();
            return;
        }

        if (!this.pageLoadOK) {
            var noWindowLoad = state.getItem('NoWindowLoad', 0);

            if (noWindowLoad === 0) {
                schedule.setItem('NoWindowLoadTimer', Math.min(Math.pow(2, noWindowLoad - 1) * 15, 3600));
                state.setItem('NoWindowLoad', 1);
            } else if (schedule.check('NoWindowLoadTimer')) {
                schedule.setItem('NoWindowLoadTimer', Math.min(Math.pow(2, noWindowLoad - 1) * 15, 3600));
                state.setItem('NoWindowLoad', noWindowLoad + 1);
                this.ReloadCastleAge();
            }

            utility.log(1, 'Page no-load count: ', noWindowLoad);
            this.pageLoadOK = this.GetStats();
            this.WaitMainLoop();
            return;
        } else {
            state.setItem('NoWindowLoad', 0);
        }

        if (state.getItem('caapPause', 'none') !== 'none') {
            this.caapDivObject.css({
                background : config.getItem('StyleBackgroundDark', '#fee'),
                opacity    : config.getItem('StyleOpacityDark', 1)
            });

            this.caapTopObject.css({
                background : config.getItem('StyleBackgroundDark', '#fee'),
                opacity    : config.getItem('StyleOpacityDark', 1)
            });

            this.WaitMainLoop();
            return;
        }

        if (schedule.since('clickedOnSomething', 45) && this.waitingForDomLoad) {
            utility.log(1, 'Clicked on something, but nothing new loaded.  Reloading page.');
            this.ReloadCastleAge();
        }

        if (this.AutoIncome()) {
            this.CheckLastAction('AutoIncome');
            this.WaitMainLoop();
            return;
        }

        this.MakeActionsList();
        var actionsListCopy = this.actionsList.slice();

        utility.log(9, "Action List", actionsListCopy);
        if (state.getItem('ReleaseControl', false)) {
            state.setItem('ReleaseControl', false);
        } else {
            actionsListCopy.unshift(state.getItem('LastAction', 'Idle'));
        }

        utility.log(9, 'Action List2', actionsListCopy);
        for (var action in actionsListCopy) {
            if (actionsListCopy.hasOwnProperty(action)) {
                utility.log(8, 'Action', actionsListCopy[action]);
                if (this[actionsListCopy[action]]()) {
                    this.CheckLastAction(actionsListCopy[action]);
                    break;
                }
            }
        }

        this.WaitMainLoop();
    },

    WaitMainLoop: function () {
        this.waitForPageChange = true;
        utility.setTimeout(function () {
            caap.waitForPageChange = false;
            caap.MainLoop();
        }, utility.waitMilliSecs * (1 + Math.random() * 0.2));
    },

    ReloadCastleAge: function () {
        // better than reload... no prompt on forms!
        if (!config.getItem('Disabled') && (state.getItem('caapPause') === 'none')) {
            window.location.href = "http://apps.facebook.com/castle_age/index.php?bm=1";
        }
    },

    ReloadOccasionally: function () {
        var reloadMin = gm.getItem('ReloadFrequency', 8, hiddenVar);
        if (!reloadMin || reloadMin < 8) {
            reloadMin = 8;
        }

        utility.setTimeout(function () {
            if (schedule.since('clickedOnSomething', 5 * 60)) {
                utility.log(1, 'Reloading if not paused after inactivity');
                caap.ReloadCastleAge();
            }

            caap.ReloadOccasionally();
        }, 60000 * reloadMin + (reloadMin * 60000 * Math.random()));
    }
};

/////////////////////////////////////////////////////////////////////
//                         BEGIN
/////////////////////////////////////////////////////////////////////

utility.log(1, "Starting CAAP ... waiting page load");
utility.setTimeout(function () {
        utility.error('DOM onload timeout!!! Releading ...', window.location.href);
        window.location.href = window.location.href;
    }, 180000);

/////////////////////////////////////////////////////////////////////
//                    On Page Load
/////////////////////////////////////////////////////////////////////

$(function () {
    var FBID          = 0,
        idOk          = false,
        DocumentTitle = '',
        tempText      = '',
        tempArr       = [],
        accountEl;

    utility.log(1, 'Full page load completed');
    utility.clearTimeouts();
    if (caap.ErrorCheck()) {
        return;
    }

    accountEl = $('#navAccountName');
    if (accountEl && accountEl.length) {
        tempText = accountEl.attr('href');
        if (tempText) {
            //FBID = tempText.regex(/id=([0-9]+)/i);
            if (utility.isNum(FBID) && FBID > 0) {
                caap.stats.FBID = FBID;
                idOk = true;
            } else {
                tempArr = $('script').text().match(new RegExp('."user.":(\\d+),', ''));
                if (tempArr && tempArr.length === 2) {
                    FBID = parseInt(tempArr[1], 10);
                    if (utility.isNum(FBID) && FBID > 0) {
                        caap.stats.FBID = FBID;
                        idOk = true;
                    }
                }
            }
        }
    }

    if (!idOk) {
        // Force reload without retrying
        utility.error('No Facebook UserID!!! Reloading ...', FBID, window.location.href);
        window.location.href = window.location.href;
    }

    config.load();
    schedule.load();
    state.load();
    caap.LoadStats();
    caap.stats.FBID = FBID;
    caap.stats.account = accountEl.text();
    utility.logLevel = gm.getItem('DebugLevel', utility.logLevel, hiddenVar);
    gifting.init();
    state.setItem('clickUrl', window.location.href);
    schedule.setItem('clickedOnSomething', 0);
    css.AddCSS();

    /////////////////////////////////////////////////////////////////////
    //                          http://code.google.com/ updater
    // Used by browsers other than Chrome (namely Firefox and Flock)
    // to get updates from http://code.google.com/
    /////////////////////////////////////////////////////////////////////

    if (utility.is_firefox) {
        if (!devVersion) {
            global.releaseUpdate();
        } else {
            global.devUpdate();
        }
    }

    /////////////////////////////////////////////////////////////////////
    // Put code to be run once to upgrade an old version's variables to
    // new format or such here.
    /////////////////////////////////////////////////////////////////////

    if (devVersion) {
        if (state.getItem('LastVersion', 0) !== caapVersion || state.getItem('LastDevVersion', 0) !== devVersion) {
            state.setItem('LastVersion', caapVersion);
            state.setItem('LastDevVersion', devVersion);
        }
    } else {
        if (state.getItem('LastVersion', 0) !== caapVersion) {
            state.setItem('LastVersion', caapVersion);
            state.setItem('LastDevVersion', 0);
        }
    }

    if (window.location.href.indexOf('facebook.com/castle_age/') >= 0) {
        state.setItem('caapPause', 'none');
        state.setItem('ReleaseControl', true);
        utility.setTimeout(function () {
            caap.init();
        }, 200);
    }

    caap.waitMilliSecs = 8000;
    caap.WaitMainLoop();
    caap.ReloadOccasionally();
});

// ENDOFSCRIPT
