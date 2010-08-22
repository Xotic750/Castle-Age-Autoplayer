// ==UserScript==
// @name           Castle Age Autoplayer
// @namespace      caap
// @description    Auto player for Castle Age
// @version        140.23.51
// @dev            4
// @require        http://cloutman.com/jquery-latest.min.js
// @require        http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.4/jquery-ui.min.js
// @require        http://castle-age-auto-player.googlecode.com/files/farbtastic.min.js
// @require        http://castle-age-auto-player.googlecode.com/files/json2.js
// @include        http*://apps.*facebook.com/castle_age/*
// @include        http://www.facebook.com/common/error.html
// @include        http://www.facebook.com/reqs.php#confirm_46755028429_0
// @include        http://www.facebook.com/home.php
// @include        http://www.facebook.com/*filter=app_46755028429*
// @exclude        *#iframe*
// @license        GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @compatability  Firefox 3.0+, Chrome 4+, Flock 2.0+
// ==/UserScript==

/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true, eqeqeq: true */
/*global window,unsafeWindow,$,GM_log,console,GM_getValue,GM_setValue,GM_xmlhttpRequest,GM_openInTab,GM_registerMenuCommand,XPathResult,GM_deleteValue,GM_listValues,GM_addStyle,CM_Listener,CE_message,ConvertGMtoJSON,localStorage */

var caapVersion = "140.23.51",
    devVersion  = "4";

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

// Adds commas into a string, ignore any number formatting
var addCommas = function (s) {
	var a = s ? s.toString() : '0',
        r = new RegExp('(-?[0-9]+)([0-9]{3})');

	while (r.test(a)) {
		a = a.replace(r, '$1,$2');
	}

	return a;
};

var sortObject = function (obj, sortfunc, deep) {
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
			output[list[i]] = sortObject(obj[list[i]], sortfunc, deep);
		} else {
			output[list[i]] = obj[list[i]];
		}
	}

	return output;
};

///////////////////////////
//       Objects
///////////////////////////

var image64 = {},
    css     = {},
    global  = {},
    gm      = {},
    nHtml   = {},
    general = {},
    caap    = {};

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

            if (gm.getValue("fbFilter", false) && (href.indexOf('apps.facebook.com/reqs.php') >= 0 || href.indexOf('apps.facebook.com/home.php') >= 0 || href.indexOf('filter=app_46755028429') >= 0)) {
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
    gameName            : 'castle_age',
    discussionURL       : 'http://senses.ws/caap/index.php',
    newVersionAvailable : false,
    documentTitle       : document.title,
    is_chrome           : navigator.userAgent.toLowerCase().indexOf('chrome') !== -1 ? true : false,
    is_firefox          : navigator.userAgent.toLowerCase().indexOf('firefox') !== -1  ? true : false,
    // Object separator - used to separate objects
    os                  : '\n',
    // Value separator - used to separate name/values within the objects
    vs                  : '\t',
    // Label separator - used to separate the name from the value
    ls                  : '\f',

    alert_id: 0,

    alert: function (message) {
        try {
            global.alert_id += 1;
            var id = global.alert_id;
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
            this.error("ERROR in alert: " + err);
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

    ReloadCastleAge: function () {
        // better than reload... no prompt on forms!
        if (window.location.href.indexOf('castle_age') >= 0 && !gm.getValue('Disabled') && (gm.getValue('caapPause') === 'none')) {
            if (global.is_chrome) {
                CE_message("paused", null, gm.getValue('caapPause', 'none'));
            }

            window.location.href = "http://apps.facebook.com/castle_age/index.php?bm=1";
        }
    },

    ReloadOccasionally: function () {
        var reloadMin = gm.getNumber('ReloadFrequency', 8);
        if (!reloadMin || reloadMin < 8) {
            reloadMin = 8;
        }

        nHtml.setTimeout(function () {
            if (caap.WhileSinceDidIt('clickedOnSomething', 5 * 60)) {
                global.log(1, 'Reloading if not paused after inactivity');
                if ((window.location.href.indexOf('castle_age') >= 0 || window.location.href.indexOf('reqs.php#confirm_46755028429_0') >= 0) &&
                        !gm.getValue('Disabled') && (gm.getValue('caapPause') === 'none')) {
                    if (global.is_chrome) {
                        CE_message("paused", null, gm.getValue('caapPause', 'none'));
                    }

                    window.location.href = "http://apps.facebook.com/castle_age/index.php?bm=1";
                }
            }

            global.ReloadOccasionally();
        }, 1000 * 60 * reloadMin + (reloadMin * 60 * 1000 * Math.random()));
    },

    releaseUpdate: function () {
        try {
            if (gm.getValue('SUC_remote_version', 0) > caapVersion) {
                global.newVersionAvailable = true;
            }

            // update script from: http://castle-age-auto-player.googlecode.com/files/Castle-Age-Autoplayer.user.js

            function updateCheck(forced) {
                if ((forced) || (parseInt(gm.getValue('SUC_last_update', '0'), 10) + (86400000 * 1) <= (new Date().getTime()))) {
                    try {
                        GM_xmlhttpRequest({
                            method: 'GET',
                            url: 'http://castle-age-auto-player.googlecode.com/files/Castle-Age-Autoplayer.user.js',
                            headers: {'Cache-Control': 'no-cache'},
                            onload: function (resp) {
                                var rt             = resp.responseText,
                                    remote_version = (new RegExp("@version\\s*(.*?)\\s*$", "m").exec(rt))[1],
                                    script_name    = (new RegExp("@name\\s*(.*?)\\s*$", "m").exec(rt))[1];

                                gm.setValue('SUC_last_update', new Date().getTime() + '');
                                gm.setValue('SUC_target_script_name', script_name);
                                gm.setValue('SUC_remote_version', remote_version);
                                global.log(1, 'remote version ', remote_version);
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

            GM_registerMenuCommand(gm.getValue('SUC_target_script_name', '???') + ' - Manual Update Check', function () {
                updateCheck(true);
            });

            updateCheck(false);
        } catch (err) {
            global.error("ERROR in release updater: " + err);
        }
    },

    devUpdate: function () {
        try {
            if (gm.getValue('SUC_remote_version', 0) > caapVersion || (gm.getValue('SUC_remote_version', 0) >= caapVersion && gm.getValue('DEV_remote_version', 0) > devVersion)) {
                global.newVersionAvailable = true;
            }

            // update script from: http://castle-age-auto-player.googlecode.com/svn/trunk/Castle-Age-Autoplayer.user.js

            function updateCheck(forced) {
                if ((forced) || (parseInt(gm.getValue('SUC_last_update', '0'), 10) + (86400000 * 1) <= (new Date().getTime()))) {
                    try {
                        GM_xmlhttpRequest({
                            method: 'GET',
                            url: 'http://castle-age-auto-player.googlecode.com/svn/trunk/Castle-Age-Autoplayer.user.js',
                            headers: {'Cache-Control': 'no-cache'},
                            onload: function (resp) {
                                var rt             = resp.responseText,
                                    remote_version = (new RegExp("@version\\s*(.*?)\\s*$", "m").exec(rt))[1],
                                    dev_version    = (new RegExp("@dev\\s*(.*?)\\s*$", "m").exec(rt))[1],
                                    script_name    = (new RegExp("@name\\s*(.*?)\\s*$", "m").exec(rt))[1];

                                gm.setValue('SUC_last_update', new Date().getTime() + '');
                                gm.setValue('SUC_target_script_name', script_name);
                                gm.setValue('SUC_remote_version', remote_version);
                                gm.setValue('DEV_remote_version', dev_version);
                                global.log(1, 'remote version ', remote_version, dev_version);
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

            GM_registerMenuCommand(gm.getValue('SUC_target_script_name', '???') + ' - Manual Update Check', function () {
                updateCheck(true);
            });

            updateCheck(false);
        } catch (err) {
            global.error("ERROR in development updater: " + err);
        }
    },

    hashStr: [
        '41030325072',
        '4200014995461306',
        '2800013751923752',
        '55577219620',
        '65520919503',
        '2900007233824090',
        '2900007233824090',
        '3100017834928060',
        '3500032575830770',
        '32686632448',
        '2700017666913321'
    ]
};

/////////////////////////////////////////////////////////////////////
//                          gm OBJECT
// this object is used for setting/getting GM specific functions.
/////////////////////////////////////////////////////////////////////

gm = {
    // use to log stuff
    log: function (mess) {
        GM_log('v' + caapVersion + ' (' + (new Date()).toLocaleTimeString() + ') : ' + mess);
    },

    debugGM: false,

    debug: function (mess) {
        if (this.debugGM) {
            this.log(mess);
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
            global.error("ERROR in gm.isInt: " + err);
            return false;
        }
    },

    // use these to set/get values in a way that prepends the game's name
    setValue: function (n, v) {
        try {
            this.debug('Set ' + n + ' to ' + v);
            if (this.isInt(v)) {
                if (v > 999999999 && !global.is_chrome) {
                    v = v + '';
                } else {
                    v = Number(v);
                }
            }

            GM_setValue(global.gameName + "__" + n, v);
            return v;
        } catch (err) {
            global.error("ERROR in gm.setValue: " + err);
            return null;
        }
    },

    setJValue: function (name, value) {
        try {
            var jsonStr = JSON.stringify(value);

            if (global.is_chrome) {
                localStorage.setItem(global.gameName + "__" + name, jsonStr);
            } else {
                GM_setValue(global.gameName + "__" + name, jsonStr);
            }

            return value;
        } catch (error) {
            console.log("ERROR in gm.setJValue: " + error);
            return null;
        }
    },

    getJValue: function (name, value) {
        try {
            var jsonObj = null;

            $.parseJSON(localStorage.getItem(name));
            if (global.is_chrome) {
                jsonObj = $.parseJSON(localStorage.getItem(global.gameName + "__" + name));
            } else {
                jsonObj = $.parseJSON(GM_getValue(global.gameName + "__" + name));
            }

            if (!jsonObj && value) {
                return value;
            }

            return jsonObj;
        } catch (error) {
            console.log("ERROR in gm.getJValue: " + error);
            return null;
        }
    },

    getValue: function (n, v) {
        var ret = GM_getValue(global.gameName + "__" + n, v);
        this.debug('Get ' + n + ' value ' + ret);
        return ret;
    },

    deleteValue: function (n) {
        this.debug('Delete ' + n + ' value ');
        GM_deleteValue(global.gameName + "__" + n);
    },

    setList: function (n, v) {
        if (!$.isArray(v)) {
            global.log(1, 'Attempted to SetList ' + n + ' to ' + v.toString() + ' which is not an array.');
            return undefined;
        }

        GM_setValue(global.gameName + "__" + n, v.join(global.os));
        return v;
    },

    getList: function (n) {
        var getTheList = GM_getValue(global.gameName + "__" + n, ''),
            ret        = [];

        this.debug('GetList ' + n + ' value ' + getTheList);
        if (getTheList !== '') {
            ret = getTheList.split(global.os);
        }

        return ret;
    },

    listAddBefore: function (listName, addList) {
        var newList = addList.concat(this.getList(listName));
        this.setList(listName, newList);
        return newList;
    },

    listPop: function (listName) {
        var popList = this.getList(listName),
            popItem = null;

        if (!popList.length) {
            return null;
        }

        popItem = popList.pop();
        this.setList(listName, popList);
        return popItem;
    },

    listPush: function (listName, pushItem, max) {
        var list = this.getList(listName);

        // Only add if it isn't already there.
        if (list.indexOf(pushItem) !== -1) {
            return;
        }

        list.push(pushItem);
        if (max > 0) {
            while (max < list.length) {
                pushItem = list.shift();
                this.debug('Removing ' + pushItem + ' from ' + listName + '.');
            }
        }

        this.setList(listName, list);
    },

    listFindItemByPrefix: function (list, prefix) {
        var itemList = list.filter(function (item) {
            return item.indexOf(prefix) === 0;
        });

        this.debug('List: ' + list + ' prefix ' + prefix + ' filtered ' + itemList);
        if (itemList.length) {
            return itemList[0];
        }

        return null;
    },

    setObjVal: function (objName, label, value) {
        var objStr  = this.getValue(objName),
            itemStr = '',
            objList = [];

        if (!objStr) {
            this.setValue(objName, label + global.ls + value);
            return;
        }

        itemStr = this.listFindItemByPrefix(objStr.split(global.vs), label + global.ls);
        if (!itemStr) {
            this.setValue(objName, label + global.ls + value + global.vs + objStr);
            return;
        }

        objList = objStr.split(global.vs);
        objList.splice(objList.indexOf(itemStr), 1, label + global.ls + value);
        this.setValue(objName, objList.join(global.vs));
    },

    getObjVal: function (objName, label, defaultValue) {
        var objStr  = '',
            itemStr = '';

        if (objName.indexOf(global.ls) < 0) {
            objStr = this.getValue(objName);
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
    },

    getListObjVal: function (listName, objName, label, defaultValue) {
        var gLOVlist = this.getList(listName),
            objStr   = '',
            itemStr  = '';

        if (!(gLOVlist.length)) {
            return defaultValue;
        }

        this.debug('have list ' + gLOVlist);
        objStr = this.listFindItemByPrefix(gLOVlist, objName + global.vs);
        if (!objStr) {
            return defaultValue;
        }

        this.debug('have obj ' + objStr);
        itemStr = this.listFindItemByPrefix(objStr.split(global.vs), label + global.ls);
        if (!itemStr) {
            return defaultValue;
        }

        this.debug('have val ' + itemStr);
        return itemStr.split(global.ls)[1];
    },

    setListObjVal: function (listName, objName, label, value, max) {
        var objList = this.getList(listName),
            objStr  = '',
            valList = [],
            valStr  = '';

        if (!(objList.length)) {
            this.setValue(listName, objName + global.vs + label + global.ls + value);
            return;
        }

        objStr = this.listFindItemByPrefix(objList, objName + global.vs);
        if (!objStr) {
            this.listPush(listName, objName + global.vs + label + global.ls + value, max);
            return;
        }

        valList = objStr.split(global.vs);
        valStr = this.listFindItemByPrefix(valList, label + global.ls);
        if (!valStr) {
            valList.push(label + global.ls + value);
            objList.splice(objList.indexOf(objStr), 1, objStr + global.vs + label + global.ls + value);
            this.setList(listName, objList);
            return;
        }

        valList.splice(valList.indexOf(valStr), 1, label + global.ls + value);
        objList.splice(objList.indexOf(objStr), 1, valList.join(global.vs));
        this.setList(listName, objList);
    },

    deleteListObj: function (listName, objName) {
        var objList = this.getList(listName),
            objStr  = '';

        if (!(objList.length)) {
            return;
        }

        objStr = this.listFindItemByPrefix(objList, objName);
        if (objStr) {
            objList.splice(objList.indexOf(objStr), 1);
            this.setList(listName, objList);
        }
    },

    getNumber: function (name, defaultValue) {
        try {
            var value  = this.getValue(name),
                number = null;

            if ((!value && value !== 0) || isNaN(value)) {
                if ((!defaultValue && defaultValue !== 0) || isNaN(defaultValue)) {
                    throw "Value of " + name + " and defaultValue are not numbers: " +
                        "'" + value + "', '" + defaultValue + "'";
                } else {
                    number = defaultValue;
                }
            } else {
                number = value;
            }

            //alert("Name: " + name + " Number: " + number + " Default: " + defaultValue);
            return Number(number);
        } catch (err) {
            global.error("ERROR in GetNumber: " + err);
            return '';
        }
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
                global.log(1, 'Trying to find xpath with null obj:' + xp);
                return null;
            }

            if (!subDocument) {
                subDocument = document;
            }

            q = subDocument.evaluate(xp, obj, null, this.xpath.first, null);
        } catch (err) {
            global.error("XPath Failed:" + err, xp);
        }

        if (q && q.singleNodeValue) {
            return q.singleNodeValue;
        }

        return null;
    },

    FindByAttr: function (obj, tag, attr, className, subDocument) {
        var q    = null,
            divs = null,
            d    = 0,
            div  = null;

        if (className.exec === undefined) {
            if (attr === "className") {
                attr = "class";
            }

            if (!subDocument) {
                subDocument = document;
            }

            q = subDocument.evaluate(".//" + tag + "[@" + attr + "='" + className + "']", obj, null, this.xpath.first, null);
            if (q && q.singleNodeValue) {
                return q.singleNodeValue;
            }

            return null;
        }

        divs = obj.getElementsByTagName(tag);
        for (d = 0; d < divs.length; d += 1) {
            div = divs[d];
            if (className.exec !== undefined) {
                if (className.exec(div[attr])) {
                    return div;
                }
            } else if (div[attr] === className) {
                return div;
            }
        }

        return null;
    },

    FindByClassName: function (obj, tag, className) {
        return this.FindByAttr(obj, tag, "className", className);
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

    timeouts: {},

    setTimeout: function (func, millis) {
        var t = window.setTimeout(function () {
            func();
            nHtml.timeouts[t] = undefined;
        }, millis);

        this.timeouts[t] = 1;
    },

    clearTimeouts: function () {
        for (var t in this.timeouts) {
            if (this.timeouts.hasOwnProperty(t)) {
                window.clearTimeout(t);
            }
        }

        this.timeouts = {};
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
    },

    getHTMLPredicate: function (HTML) {
        for (var x = HTML.length; x > 1; x -= 1) {
            if (HTML.substr(x, 1) === '/') {
                return HTML.substr(x + 1);
            }
        }

        return HTML;
    },

    OpenInIFrame: function (url, key) {
        var iframe = document.createElement("iframe");
        iframe.setAttribute("src", url);
        iframe.setAttribute("id", key);
        iframe.setAttribute("style", "width:0;height:0;");
        document.documentElement.appendChild(iframe);
    },

    ResetIFrame: function (key) {
        var iframe = document.getElementById(key);
        if (iframe) {
            global.log(1, "Deleting iframe", key);
            iframe.parentNode.removeChild(iframe);
        } else {
            global.log(1, "Frame not found", key);
        }

        if (document.getElementById(key)) {
            global.log(1, "Found iframe");
        }
    },

    Gup: function (name, href) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS  = "[\\?&]" + name + "=([^&#]*)",
            regex   = new RegExp(regexS),
            results = regex.exec(href);

        if (results === null) {
            return "";
        } else {
            return results[1];
        }
    },

    ScrollToBottom: function () {
        global.log(9, "Scroll Height", document.body.scrollHeight);
        var dh     = 0,
            ch     = 0,
            moveme = 0;

        if (document.body.scrollHeight) {
            if (global.is_chrome) {
                dh = document.body.scrollHeight;
                ch = document.body.clientHeight;
                if (dh > ch) {
                    moveme = dh - ch;
                    global.log(1, "Scrolling down by: " + moveme + "px");
                    window.scroll(0, moveme);
                    global.log(1, "Scrolled ok");
                } else {
                    global.log(1, "Not scrolling to bottom. Client height is greater than document height!");
                }
            } else {
                window.scrollBy(0, document.body.scrollHeight);
            }
        }
    },

    ScrollToTop: function () {
        if (global.is_chrome) {
            global.log(1, "Scrolling to top");
            window.scroll(0, 0);
            global.log(1, "Scrolled ok");
        } else {
            window.scrollByPages(-1000);
        }
    },

    CountInstances: function (string, word) {
        var substrings = string.split(word);
        return substrings.length - 1;
    }
};

////////////////////////////////////////////////////////////////////
//                          general OBJECT
// this is the main object for dealing with Generals
/////////////////////////////////////////////////////////////////////

general = {
    Record : function () {
        this.data = {
            name    : '',
            img     : '',
            level   : 0,
            last    : new Date(2009, 1, 1).getTime(),
            special : '',
            atk     : 0,
            def     : 0,
            api     : 0,
            dpi     : 0,
            mpi     : 0,
            eatk    : 0,
            edef    : 0,
            eapi    : 0,
            edpi    : 0,
            empi    : 0
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

    RecordArray : [],

    RecordArraySortable : [],

    SortName : function (a, b) {
        var nameA = a.name.toLowerCase(),
            nameB = b.name.toLowerCase();

        if (nameA < nameB) {
            return -1;
        }

        if (nameA > nameB) {
            return 1;
        }

        return 0;
    },

    SortLevel : function (a, b) {
        var levelA = a.level,
            levelB = b.level;

        if (levelA > levelB) {
            return -1;
        }

        if (levelA < levelB) {
            return 1;
        }

        return 0;
    },

    SortAtk : function (a, b) {
        var atkA = a.atk,
            atkB = b.atk;

        if (atkA > atkB) {
            return -1;
        }

        if (atkA < atkB) {
            return 1;
        }

        return 0;
    },

    SortDef : function (a, b) {
        var defA = a.def,
            defB = b.def;

        if (defA > defB) {
            return -1;
        }

        if (defA < defB) {
            return 1;
        }

        return 0;
    },

    SortApi : function (a, b) {
        var apiA = a.api,
            apiB = b.api;

        if (apiA > apiB) {
            return -1;
        }

        if (apiA < apiB) {
            return 1;
        }

        return 0;
    },

    SortDpi : function (a, b) {
        var dpiA = a.dpi,
            dpiB = b.dpi;

        if (dpiA > dpiB) {
            return -1;
        }

        if (dpiA < dpiB) {
            return 1;
        }

        return 0;
    },

    SortMpi : function (a, b) {
        var mpiA = a.mpi,
            mpiB = b.mpi;

        if (mpiA > mpiB) {
            return -1;
        }

        if (mpiA < mpiB) {
            return 1;
        }

        return 0;
    },

    SortEAtk : function (a, b) {
        var atkA = a.eatk,
            atkB = b.eatk;

        if (atkA > atkB) {
            return -1;
        }

        if (atkA < atkB) {
            return 1;
        }

        return 0;
    },

    SortEDef : function (a, b) {
        var defA = a.edef,
            defB = b.edef;

        if (defA > defB) {
            return -1;
        }

        if (defA < defB) {
            return 1;
        }

        return 0;
    },

    SortEApi : function (a, b) {
        var apiA = a.eapi,
            apiB = b.eapi;

        if (apiA > apiB) {
            return -1;
        }

        if (apiA < apiB) {
            return 1;
        }

        return 0;
    },

    SortEDpi : function (a, b) {
        var dpiA = a.edpi,
            dpiB = b.edpi;

        if (dpiA > dpiB) {
            return -1;
        }

        if (dpiA < dpiB) {
            return 1;
        }

        return 0;
    },

    SortEMpi : function (a, b) {
        var mpiA = a.empi,
            mpiB = b.empi;

        if (mpiA > mpiB) {
            return -1;
        }

        if (mpiA < mpiB) {
            return 1;
        }

        return 0;
    },

    GetNames : function () {
        var it    = 0,
            names = [];

        for (it = 0; it < this.RecordArray.length; it += 1) {
            names.push(this.RecordArray[it].name);
        }

        return names.sort();
    },

    GetImage : function (general) {
        var it    = 0;

        for (it = 0; it < this.RecordArray.length; it += 1) {
            if (this.RecordArray[it].name === general) {
                break;
            }
        }

        return this.RecordArray[it].img;
    },

    GetLevelUpNames : function () {
        var it    = 0,
            names = [];

        for (it = 0; it < this.RecordArray.length; it += 1) {
            if (this.RecordArray[it].level < 4) {
                names.push(this.RecordArray[it].name);
            }
        }

        return names;
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
        'SubQuest'
    ],

    BuildlLists: function () {
        try {
            global.log(1, 'Building Generals Lists');
            this.RecordArray = gm.getJValue('AllGeneralsJSON', []);
            this.RecordArraySortable = [];
            $.merge(this.RecordArraySortable, this.RecordArray);
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
            global.error("ERROR in BuildlLists: " + err);
            return false;
        }
    },

    GetCurrent: function () {
        try {
            var generalName = '',
                nameObj     = null;

            nameObj = $("#app46755028429_equippedGeneralContainer .general_name_div3");
            if (nameObj) {
                generalName = $.trim(nameObj.text());
            }

            if (!generalName) {
                global.log(1, "Couldn't get current 'General'. Will use current 'General'", generalName);
                return 'Use Current';
            }

            global.log(8, "Current General", generalName);
            return generalName;
        } catch (err) {
            global.error("ERROR in GetCurrent: " + err);
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
                    var newGeneral   = new general.Record(),
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
                        global.log(1, "Unable to find 'name' container", index);
                    }

                    tempObj = container.find(".imgButton");
                    if (tempObj && tempObj.length) {
                        img = nHtml.getHTMLPredicate(tempObj.attr("src"));
                    } else {
                        global.log(1, "Unable to find 'image' container", index);
                    }

                    tempObj = container.children().eq(3);
                    if (tempObj && tempObj.length) {
                        level = parseInt(tempObj.text().replace(/Level /gi, '').replace(/[\t\r\n]/g, ''), 10);
                    } else {
                        global.log(1, "Unable to find 'level' container", index);
                    }

                    tempObj = container.children().eq(4);
                    if (tempObj && tempObj.length) {
                        special = $.trim($(tempObj.html().replace(/<br>/g, ' ')).text());
                    } else {
                        global.log(1, "Unable to find 'special' container", index);
                    }

                    tempObj = container.find(".generals_indv_stats_padding div");
                    if (tempObj && tempObj.length === 2) {
                        atk = parseInt(tempObj.eq(0).text(), 10);
                        def = parseInt(tempObj.eq(1).text(), 10);
                    } else {
                        global.log(1, "Unable to find 'attack and defence' containers", index);
                    }

                    if (name && img && level && atk && def && special) {
                        for (it = 0; it < general.RecordArray.length; it += 1) {
                            if (general.RecordArray[it].name === name) {
                                newGeneral.data = general.RecordArray[it];
                                break;
                            }
                        }

                        newGeneral.data.name = name;
                        newGeneral.data.img = img;
                        newGeneral.data.level = level;
                        newGeneral.data.atk = atk;
                        newGeneral.data.def = def;
                        newGeneral.data.api = atk + (def * 0.7);
                        newGeneral.data.dpi = def + (atk * 0.7);
                        newGeneral.data.mpi = (newGeneral.data.api + newGeneral.data.dpi) / 2;
                        newGeneral.data.special = special;
                        if (it < general.RecordArray.length) {
                            general.RecordArray[it] = newGeneral.data;
                        } else {
                            global.log(1, "Adding new 'General'", newGeneral.data.name);
                            general.RecordArray.push(newGeneral.data);
                            update = true;
                        }

                        save = true;
                    } else {
                        global.log(1, "Missing required 'General' attribute", index);
                    }
                });

                if (save) {
                    caap.stats.generals.total = this.RecordArray.length;
                    caap.stats.generals.invade = Math.min((caap.stats.army.actual / 5).toFixed(0), this.RecordArray.length);
                    gm.setJValue('AllGeneralsJSON', this.RecordArray);
                    this.RecordArraySortable = [];
                    $.merge(this.RecordArraySortable, this.RecordArray);
                    if (update) {
                        this.UpdateDropDowns();
                    }
                }

                global.log(2, "All Generals", this.RecordArray);
            }

            return true;
        } catch (err) {
            global.error("ERROR in GetGenerals: " + err);
            return false;
        }
    },

    UpdateDropDowns: function () {
        try {
            this.BuildlLists();
            global.log(1, "Updating 'General' Drop Down Lists");
            for (var generalType in this.StandardList) {
                if (this.StandardList.hasOwnProperty(generalType)) {
                    caap.ChangeDropDownList(this.StandardList[generalType] + 'General', this.List, gm.getValue(this.StandardList[generalType] + 'General', 'Use Current'));
                }
            }

            caap.ChangeDropDownList('BuyGeneral', this.BuyList, gm.getValue('BuyGeneral', 'Use Current'));
            caap.ChangeDropDownList('IncomeGeneral', this.IncomeList, gm.getValue('IncomeGeneral', 'Use Current'));
            caap.ChangeDropDownList('BankingGeneral', this.BankingList, gm.getValue('BankingGeneral', 'Use Current'));
            caap.ChangeDropDownList('CollectGeneral', this.BankingList, gm.getValue('CollectGeneral', 'Use Current'));
            caap.ChangeDropDownList('LevelUpGeneral', this.List, gm.getValue('LevelUpGeneral', 'Use Current'));
            return true;
        } catch (err) {
            global.error("ERROR in UpdateDropDowns: " + err);
            return false;
        }
    },

    Clear: function (whichGeneral) {
        try {
            global.log(1, 'Setting ' + whichGeneral + ' to "Use Current"');
            gm.setValue(whichGeneral, 'Use Current');
            this.UpdateDropDowns();
            return true;
        } catch (err) {
            global.error("ERROR in Clear: " + err);
            return false;
        }
    },

    Select: function (whichGeneral) {
        try {
            var generalType       = '',
                generalName       = '',
                getCurrentGeneral = '',
                currentGeneral    = '',
                generalImage      = '';

            if (gm.getValue('LevelUpGeneral', 'Use Current') !== 'Use Current') {
                generalType = $.trim(whichGeneral.replace(/General/i, ''));
                if (gm.getValue(generalType + 'LevelUpGeneral', false) &&
                        caap.stats.exp.dif && caap.stats.exp.dif <= gm.getValue('LevelUpGeneralExp', 0)) {
                    whichGeneral = 'LevelUpGeneral';
                    global.log(1, 'Using level up general');
                }
            }

            generalName = gm.getValue(whichGeneral, '');
            if (!generalName || /use current/i.test(generalName)) {
                return false;
            }

            if (/under level 4/i.test(generalName)) {
                if (!this.GetLevelUpNames().length) {
                    return this.Clear(whichGeneral);
                }

                if (gm.getValue('ReverseLevelUpGenerals')) {
                    generalName = this.GetLevelUpNames().reverse().pop();
                } else {
                    generalName = this.GetLevelUpNames().pop();
                }
            }

            getCurrentGeneral = this.GetCurrent();
            if (!getCurrentGeneral) {
                global.ReloadCastleAge();
            }

            currentGeneral = getCurrentGeneral.replace('**', '');
            if (generalName.indexOf(currentGeneral) >= 0) {
                return false;
            }

            global.log(1, 'Changing from ' + currentGeneral + ' to ' + generalName);
            if (caap.NavigateTo('mercenary,generals', 'tab_generals_on.gif')) {
                return true;
            }

            generalImage = this.GetImage(generalName);
            if (caap.CheckForImage(generalImage)) {
                return caap.NavigateTo(generalImage);
            }

            caap.SetDivContent('Could not find ' + generalName);
            global.log(1, 'Could not find', generalName, generalImage);
            if (gm.getValue('ignoreGeneralImage', false)) {
                return false;
            } else {
                return this.Clear(whichGeneral);
            }
        } catch (err) {
            global.error("ERROR in Select: " + err);
            return false;
        }
    },

    GetAllStats: function () {
        try {
            if (!caap.WhileSinceDidIt(caap.last.allGenerals, (12 * 60 * 60) + (5 * 60))) {
                return false;
            }

            var generalImage = '',
                it           = 0,
                generalDiv   = null,
                tempObj      = null,
                success      = false;

            for (it = 0; it < this.RecordArray.length; it += 1) {
                if (caap.WhileSinceDidIt(this.RecordArray[it].last, (60 * 60))) {
                    break;
                }
            }

            if (it === this.RecordArray.length) {
                caap.last.allGenerals = new Date().getTime();
                caap.SaveStats();
                global.log(9, "Finished visiting all Generals for their stats");
                return false;
            }

            if (caap.NavigateTo('mercenary,generals', 'tab_generals_on.gif')) {
                global.log(1, "Visiting generals to get 'General' stats");
                return true;
            }

            generalImage = this.GetImage(this.RecordArray[it].name);
            if (caap.CheckForImage(generalImage)) {
                if (this.GetCurrent().replace('**', '') !== this.RecordArray[it].name) {
                    global.log(1, "Visiting 'General'", this.RecordArray[it].name);
                    return caap.NavigateTo(generalImage);
                }
            }

            generalDiv = $("#app46755028429_equippedGeneralContainer .generals_indv_stats div");
            if (generalDiv && generalDiv.length === 2) {
                tempObj = generalDiv.eq(0);
                if (tempObj && tempObj.length) {
                    this.RecordArray[it].eatk = parseInt(tempObj.text(), 10);
                    tempObj = generalDiv.eq(1);
                    if (tempObj && tempObj.length) {
                        this.RecordArray[it].edef = parseInt(tempObj.text(), 10);
                        success = true;
                    } else {
                        global.log(1, "Unable to get 'General' defense object");
                    }
                } else {
                    global.log(1, "Unable to get 'General' attack object");
                }

                if (success) {
                    this.RecordArray[it].eapi = (this.RecordArray[it].eatk + (this.RecordArray[it].edef * 0.7));
                    this.RecordArray[it].edpi = (this.RecordArray[it].edef + (this.RecordArray[it].eatk * 0.7));
                    this.RecordArray[it].empi = ((this.RecordArray[it].eapi + this.RecordArray[it].edpi) / 2);
                    this.RecordArray[it].last = new Date().getTime();
                    gm.setJValue('AllGeneralsJSON', this.RecordArray);
                    this.RecordArraySortable = [];
                    $.merge(this.RecordArraySortable, this.RecordArray);
                    global.log(9, "Got 'General' stats", this.RecordArray[it]);
                } else {
                    global.log(1, "Unable to get 'General' stats");
                }
            } else {
                global.log(1, "Unable to get equipped 'General' divs");
            }

            return true;
        } catch (err) {
            global.error("ERROR in GetAllStats: " + err);
            return false;
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
    newLevelUpMode    : false,
    pageLoadOK        : false,
    caapDivObject     : null,
    caapTopObject     : null,

    init: function () {
        try {
            gm.deleteValue("statsMatch");
            gm.deleteValue(this.friendListType.gifta.name + 'Requested');
            gm.deleteValue(this.friendListType.giftb.name + 'Requested');
            gm.deleteValue(this.friendListType.giftc.name + 'Requested');
            gm.deleteValue(this.friendListType.facebook.name + 'Requested');
            // Get rid of those ads now! :P
            if (gm.getValue('HideAds', false)) {
                $('.UIStandardFrame_SidebarAds').css('display', 'none');
            }

            // Can create a blank space above the game to host the dashboard if wanted.
            // Dashboard currently uses '185px'
            var shiftDown = gm.getValue('ShiftDown', '');
            if (shiftDown) {
                $(this.controlXY.selector).css('padding-top', shiftDown);
            }

            this.AddControl();
            this.AddColorWheels();
            this.AddDashboard();
            this.AddListeners();
            this.AddDBListener();
            this.ReconRecordArray = gm.getJValue('reconJSON', []);
            this.CheckResults();
            return true;
        } catch (err) {
            global.error("ERROR in init: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          UTILITY FUNCTIONS
    // Small functions called a lot to reduce duplicate code
    /////////////////////////////////////////////////////////////////////

    VisitUrl: function (url, loadWaitTime) {
        try {
            this.waitMilliSecs = (loadWaitTime) ? loadWaitTime : 5000;
            window.location.href = url;
            return true;
        } catch (err) {
            global.error("ERROR in VisitUrl: " + err);
            return false;
        }
    },

    Click: function (obj, loadWaitTime) {
        try {
            if (!obj) {
                throw 'Null object passed to Click';
            }

            if (this.waitingForDomLoad === false) {
                this.JustDidIt('clickedOnSomething');
                this.waitingForDomLoad = true;
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
            global.error("ERROR in Click: " + err);
            return undefined;
        }
    },

    ClickAjax: function (link, loadWaitTime) {
        try {
            if (!link) {
                throw 'No link passed to Click Ajax';
            }

            if (gm.getValue('clickUrl', '').indexOf(link) < 0) {
                gm.setValue('clickUrl', 'http://apps.facebook.com/castle_age/' + link);
                this.waitingForDomLoad = false;
            }

            return this.VisitUrl("javascript:void(a46755028429_ajaxLinkSend('globalContainer', '" + link + "'))", loadWaitTime);
        } catch (err) {
            global.error("ERROR in ClickAjax: " + err);
            return false;
        }
    },

    ClickWait: function (obj, loadWaitTime) {
        try {
            this.setTimeout(function () {
                this.Click(obj, loadWaitTime);
            }, 1000 + Math.floor(Math.random() * 1000));

            return true;
        } catch (err) {
            global.error("ERROR in ClickWait: " + err);
            return false;
        }
    },

    oneMinuteUpdate: function (funcName) {
        try {
            if (!gm.getValue('reset' + funcName) && !this.WhileSinceDidIt(funcName + 'Timer', 60)) {
                return false;
            }

            this.JustDidIt(funcName + 'Timer');
            gm.setValue('reset' + funcName, false);
            return true;
        } catch (err) {
            global.error("ERROR in oneMinuteUpdate: " + err);
            return false;
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
                global.log(1, 'No content to Navigate to', imageOnPage, pathToPage);
                return false;
            }

            if (imageOnPage && this.CheckForImage(imageOnPage)) {
                return false;
            }

            pathList = pathToPage.split(",");
            for (s = pathList.length - 1; s >= 0; s -= 1) {
                a = nHtml.FindByAttrXPath(content, 'a', "contains(@href,'/" + pathList[s] + ".php') and not(contains(@href,'" + pathList[s] + ".php?'))");
                if (a) {
                    global.log(1, 'Go to', pathList[s]);
                    gm.setValue('clickUrl', 'http://apps.facebook.com/castle_age/' + pathList[s] + '.php');
                    this.Click(a);
                    return true;
                }

                imageTest = pathList[s];
                if (imageTest.indexOf(".") === -1) {
                    imageTest = imageTest + '.';
                }

                input = nHtml.FindByAttrContains(document.body, "input", "src", imageTest);
                if (input) {
                    global.log(2, 'Click on image', input.src.match(/[\w.]+$/));
                    this.Click(input);
                    return true;
                }

                img = nHtml.FindByAttrContains(document.body, "img", "src", imageTest);
                if (img) {
                    global.log(2, 'Click on image', img.src.match(/[\w.]+$/));
                    this.Click(img);
                    return true;
                }
            }

            global.log(1, 'Unable to Navigate to', imageOnPage, pathToPage);
            return false;
        } catch (err) {
            global.error("ERROR in NavigateTo: " + err, imageOnPage, pathToPage);
            return false;
        }
    },

    CheckForImage: function (image, webSlice, subDocument, nodeNum) {
        try {
            if (!webSlice) {
                if (!subDocument) {
                    webSlice = document.body;
                } else {
                    webSlice = subDocument.body;
                }
            }

            var imageSlice = nHtml.FindByAttrContains(webSlice, 'input', 'src', image, subDocument, nodeNum);
            if (imageSlice) {
                return imageSlice;
            }

            imageSlice = nHtml.FindByAttrContains(webSlice, 'img', 'src', image, subDocument, nodeNum);
            if (imageSlice) {
                return imageSlice;
            }

            imageSlice = nHtml.FindByAttrContains(webSlice, 'div', 'style', image, subDocument, nodeNum);
            if (imageSlice) {
                return imageSlice;
            }

            return null;
        } catch (err) {
            global.error("ERROR in CheckForImage: " + err);
            return null;
        }
    },

    WhileSinceDidIt: function (nameOrNumber, seconds) {
        try {
            if (!/\d+/.test(nameOrNumber)) {
                nameOrNumber = gm.getValue(nameOrNumber, 0);
            }

            var now = new Date().getTime();
            return (parseInt(nameOrNumber, 10) < (now - 1000 * seconds));
        } catch (err) {
            global.error("ERROR in WhileSinceDidIt: " + err);
            return false;
        }
    },

    JustDidIt: function (name) {
        try {
            if (!name) {
                throw "name not provided!";
            }

            var now = (new Date().getTime());
            gm.setValue(name, now.toString());
            return true;
        } catch (err) {
            global.error("ERROR in JustDidIt: " + err);
            return false;
        }
    },

    DeceiveDidIt: function (name) {
        try {
            if (!name) {
                throw "name not provided!";
            }

            global.log(1, "Deceive Did It");
            var now = (new Date().getTime()) - 6500000;
            gm.setValue(name, now.toString());
            return true;
        } catch (err) {
            global.error("ERROR in DeceiveDidIt: " + err);
            return false;
        }
    },

    // Returns true if timer is passed, or undefined
    CheckTimer: function (name) {
        try {
            if (!name) {
                throw "name not provided!";
            }

            var nameTimer = gm.getValue(name),
                now       = new Date().getTime();

            if (!nameTimer) {
                return true;
            }

            return (nameTimer < now);
        } catch (err) {
            global.error("ERROR in CheckTimer: " + err);
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

            if (gm.getValue("use24hr", true)) {
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
            global.error("ERROR in FormatTime: " + err);
            return "Time Err";
        }
    },

    DisplayTimer: function (name) {
        try {
            if (!name) {
                throw "name not provided!";
            }

            var nameTimer = gm.getValue(name),
                newTime   = new Date();

            if (!nameTimer) {
                return false;
            }

            newTime.setTime(parseInt(nameTimer, 10));
            return this.FormatTime(newTime);
        } catch (err) {
            global.error("ERROR in DisplayTimer: " + err);
            return false;
        }
    },

    SetTimer: function (name, time) {
        try {
            if (!name) {
                throw "name not provided!";
            }

            if (!time) {
                throw "time not provided!";
            }

            var now = (new Date().getTime());
            now += time * 1000;
            gm.setValue(name, now.toString());
            return true;
        } catch (err) {
            global.error("ERROR in SetTimer: " + err);
            return false;
        }
    },

    NumberOnly: function (num) {
        try {
            var numOnly = parseFloat(num.toString().replace(new RegExp("[^0-9\\.]", "g"), ''));
            global.log(10, "NumberOnly", numOnly);
            return numOnly;
        } catch (err) {
            global.error("ERROR in NumberOnly: " + err);
            return null;
        }
    },

    RemoveHtmlJunk: function (html) {
        try {
            return html.replace(new RegExp("\\&[^;]+;", "g"), '');
        } catch (err) {
            global.error("ERROR in RemoveHtmlJunk: " + err);
            return null;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          DISPLAY FUNCTIONS
    // these functions set up the control applet and allow it to be changed
    /////////////////////////////////////////////////////////////////////

    AppendTextToDiv: function (divName, text) {
        try {
            $('#' + divName).append(text);
            return true;
        } catch (err) {
            global.error("ERROR in AppendTextToDiv: " + err);
            return false;
        }
    },

    defaultDropDownOption: "<option disabled='disabled' value='not selected'>Choose one</option>",

    MakeDropDown: function (idName, dropDownList, instructions, formatParms) {
        try {
            var selectedItem = gm.getValue(idName, 'defaultValue'),
                count        = 0,
                itemcount    = 0,
                htmlCode     = '',
                item         = 0;

            if (selectedItem === 'defaultValue') {
                selectedItem = gm.setValue(idName, dropDownList[0]);
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
            global.error("ERROR in MakeDropDown: " + err);
            return '';
        }
    },

    /*-------------------------------------------------------------------------------------\
    DBDropDown is used to make our drop down boxes for dash board controls.  These require
    slightly different HTML from the side controls.
    \-------------------------------------------------------------------------------------*/
    DBDropDown: function (idName, dropDownList, instructions, formatParms) {
        try {
            var selectedItem = gm.getValue(idName, 'defaultValue'),
                htmlCode     = '',
                item         = 0;
            if (selectedItem === 'defaultValue') {
                selectedItem = gm.setValue(idName, dropDownList[0]);
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
            global.error("ERROR in DBDropDown: " + err);
            return '';
        }
    },

    MakeCheckBox: function (idName, defaultValue, varClass, instructions, tableTF) {
        try {
            var checkItem = gm.getValue(idName, 'defaultValue'),
                htmlCode  = '';

            if (checkItem === 'defaultValue') {
                gm.setValue(idName, defaultValue);
            }

            htmlCode = "<input type='checkbox' id='caap_" + idName + "' title=" + '"' + instructions + '"' + ((varClass) ? " class='" + varClass + "'" : '') + (gm.getValue(idName) ? 'checked' : '') + ' />';
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
            global.error("ERROR in MakeCheckBox: " + err);
            return '';
        }
    },

    MakeNumberForm: function (idName, instructions, initDefault, formatParms) {
        try {
            if (!initDefault) {
                initDefault = '';
            }

            if (gm.getValue(idName, 'defaultValue') === 'defaultValue') {
                gm.setValue(idName, initDefault);
            }

            if (!formatParms) {
                formatParms = "size='4'";
            }

            var htmlCode = " <input type='text' id='caap_" + idName + "' " + formatParms + " title=" + '"' + instructions + '" ' + "value='" + gm.getValue(idName, '') + "' />";
            return htmlCode;
        } catch (err) {
            global.error("ERROR in MakeNumberForm: " + err);
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
            global.error("ERROR in MakeCheckTR: " + err);
            return '';
        }
    },

    AddCollapsingDiv: function (parentId, subId) {
        try {
            var htmlCode = "<div id='caap_" + subId + "' style='display: " +
                (gm.getValue(parentId, false) ? 'block' : 'none') + "'>";

            return htmlCode;
        } catch (err) {
            global.error("ERROR in AddCollapsingDiv: " + err);
            return '';
        }
    },

    ToggleControl: function (controlId, staticText) {
        try {
            var currentDisplay = gm.getValue('Control_' + controlId, "none"),
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
            global.error("ERROR in ToggleControl: " + err);
            return '';
        }
    },

    MakeTextBox: function (idName, instructions, formatParms) {
        try {
            if (formatParms === '') {
                if (global.is_chrome) {
                    formatParms = " rows='3' cols='25'";
                } else {
                    formatParms = " rows='3' cols='21'";
                }
            }

            var htmlCode = "<textarea title=" + '"' + instructions + '"' + " type='text' id='caap_" + idName + "' " + formatParms + ">" + gm.getValue(idName, '') + "</textarea>";
            return htmlCode;
        } catch (err) {
            global.error("ERROR in MakeTextBox: " + err);
            return '';
        }
    },

    MakeListBox: function (idName, instructions, formatParms) {
        try {
            if (formatParms === '') {
                if (global.is_chrome) {
                    formatParms = " rows='3' cols='25'";
                } else {
                    formatParms = " rows='3' cols='21'";
                }
            }

            var htmlCode = "<textarea title=" + '"' + instructions + '"' + " type='text' id='caap_" + idName + "' " + formatParms + ">" + gm.getList(idName) + "</textarea>";
            return htmlCode;
        } catch (err) {
            global.error("ERROR in MakeTextBox: " + err);
            return '';
        }
    },

    SaveBoxText: function (idName) {
        try {
            var boxText = $("#caap_" + idName).val();
            if (typeof boxText !== 'string') {
                throw "Value of the textarea id='caap_" + idName + "' is not a string: " + boxText;
            }

            gm.setValue(idName, boxText);
            return true;
        } catch (err) {
            global.error("ERROR in SaveBoxText: " + err);
            return false;
        }
    },

    SetDivContent: function (idName, mess) {
        try {
            if (gm.getValue('SetTitle', false) && gm.getValue('SetTitleAction', false) && idName === "activity_mess") {
                var DocumentTitle = mess.replace("Activity: ", '') + " - ";

                if (gm.getValue('SetTitleName', false)) {
                    DocumentTitle += this.stats.PlayerName + " - ";
                }

                document.title = DocumentTitle + global.documentTitle;
            }

            $('#caap_' + idName).html(mess);
        } catch (err) {
            global.error("ERROR in SetDivContent: " + err);
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
        'Ivory City'
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
            global.error("ERROR in SelectDropOption: " + err);
            return false;
        }
    },

    ShowAutoQuest: function () {
        try {
            $("#stopAutoQuest").text("Stop auto quest: " + gm.getObjVal('AutoQuest', 'name') + " (energy: " + gm.getObjVal('AutoQuest', 'energy') + ")");
            $("#stopAutoQuest").css('display', 'block');
            return true;
        } catch (err) {
            global.error("ERROR in ShowAutoQuest: " + err);
            return false;
        }
    },

    ClearAutoQuest: function () {
        try {
            $("#stopAutoQuest").text("");
            $("#stopAutoQuest").css('display', 'none');
            return true;
        } catch (err) {
            global.error("ERROR in ClearAutoQuest: " + err);
            return false;
        }
    },

    ManualAutoQuest: function () {
        try {
            this.SelectDropOption('WhyQuest', 'Manual');
            this.ClearAutoQuest();
            return true;
        } catch (err) {
            global.error("ERROR in ManualAutoQuest: " + err);
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
                        gm.setValue(idName, dropList[item]);
                        global.log(1, "Saved: " + idName + "  Value: " + dropList[item]);
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
            global.error("ERROR in ChangeDropDownList: " + err);
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
            global.error("ERROR in GetControlXY: " + err);
            return {x: 0, y: 0};
        }
    },

    SaveControlXY: function () {
        try {
            var refOffset = $(this.controlXY.selector).offset();
            gm.setValue('caap_div_menuTop', caap.caapDivObject.offset().top);
            gm.setValue('caap_div_menuLeft', caap.caapDivObject.offset().left - refOffset.left);
            gm.setValue('caap_top_zIndex', '1');
            gm.setValue('caap_div_zIndex', '2');
        } catch (err) {
            global.error("ERROR in SaveControlXY: " + err);
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
            global.error("ERROR in GetDashboardXY: " + err);
            return {x: 0, y: 0};
        }
    },

    SaveDashboardXY: function () {
        try {
            var refOffset = $(this.dashboardXY.selector).offset();
            gm.setValue('caap_top_menuTop', this.caapTopObject.offset().top);
            gm.setValue('caap_top_menuLeft', this.caapTopObject.offset().left - refOffset.left);
            gm.setValue('caap_div_zIndex', '1');
            gm.setValue('caap_top_zIndex', '2');
        } catch (err) {
            global.error("ERROR in SaveDashboardXY: " + err);
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
            this.controlXY.x = gm.getValue('caap_div_menuLeft', '');
            this.controlXY.y = gm.getValue('caap_div_menuTop', $(this.controlXY.selector).offset().top);
            styleXY = this.GetControlXY();
            $(caapDiv).css({
                width                   : '180px',
                background              : gm.getValue('StyleBackgroundLight', '#E0C691'),
                opacity                 : gm.getValue('StyleOpacityLight', '1'),
                color                   : '#000',
                padding                 : "4px",
                border                  : "2px solid #444",
                top                     : styleXY.y + 'px',
                left                    : styleXY.x + 'px',
                zIndex                  : gm.getValue('caap_div_zIndex', '2'),
                position                : 'absolute',
                '-moz-border-radius'    : '5px',
                '-webkit-border-radius' : '5px'
            }).appendTo(document.body);

            this.caapDivObject = $("#caap_div");

            banner += "<div id='caap_BannerHide' style='display: " + (gm.getValue('BannerDisplay', true) ? 'block' : 'none') + "'>";
            banner += "<img src='data:image/png;base64," + image64.header + "' alt='Castle Age Auto Player' /><br /><hr /></div>";
            this.SetDivContent('banner', banner);

            htmlCode += this.AddPauseMenu();
            htmlCode += this.AddDisableMenu();
            htmlCode += this.AddCashHealthMenu();
            htmlCode += this.AddQuestMenu();
            htmlCode += this.AddBattleMenu();
            htmlCode += this.AddMonsterMenu();
            htmlCode += this.AddMonsterFinderMenu();
            htmlCode += this.AddReconMenu();
            htmlCode += this.AddGeneralsMenu();
            htmlCode += this.AddSkillPointsMenu();
            htmlCode += this.AddOtherOptionsMenu();
            htmlCode += this.AddFooterMenu();
            this.SetDivContent('control', htmlCode);

            this.CheckLastAction(gm.getValue('LastAction', 'none'));
            $("#caap_resetElite").button();
            $("#caap_StartedColourSelect").button();
            $("#caap_StopedColourSelect").button();
            $("#caap_FillArmy").button();
            $("#caap_ResetMenuLocation").button();
            return true;
        } catch (err) {
            global.error("ERROR in AddControl: " + err);
            return false;
        }
    },

    AddPauseMenu: function () {
        try {
            var htmlCode = '';
            if (global.is_chrome) {
                htmlCode += "<div id='caapPausedDiv' style='display: none'><a href='javascript:;' id='caapPauseA' >Pause</a></div>";
            }

            htmlCode += "<div id='caapPaused' style='display: " + gm.getValue('caapPause', 'block') + "'><b>Paused on mouse click.</b><br /><a href='javascript:;' id='caapRestart' >Click here to restart</a></div><hr />";
            return htmlCode;
        } catch (err) {
            global.error("ERROR in AddPauseMenu: " + err);
            return '';
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
            global.error("ERROR in AddDisableMenu: " + err);
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
            htmlCode += "<tr><td>Keep In Bank</td><td style='text-align: right'>$" + this.MakeNumberForm('minInStore', bankInstructions0, 100000, "type='text' size='12' style='font-size: 10px; text-align: right'") + "</td></tr></table>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Bank Above</td><td style='text-align: right'>$" + this.MakeNumberForm('MaxInCash', bankInstructions2, '', "type='text' size='7' style='font-size: 10px; text-align: right'") + "</td></tr>";
            htmlCode += "<tr><td style='padding-left: 10px'>But Keep On Hand</td><td style='text-align: right'>$" +
                this.MakeNumberForm('MinInCash', bankInstructions1, '', "type='text' size='7' style='font-size: 10px; text-align: right'") + "</td></tr></table>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Heal If Health Below</td><td style='text-align: right'>" + this.MakeNumberForm('MinToHeal', healthInstructions, 10, "size='2' style='font-size: 10px; text-align: right'") + "</td></tr>";
            htmlCode += "<tr><td style='padding-left: 10px'>But Not If Stamina Below</td><td style='text-align: right'>" +
                this.MakeNumberForm('MinStamToHeal', healthStamInstructions, '', "size='2' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
            htmlCode += "<hr/></div>";
            return htmlCode;
        } catch (err) {
            global.error("ERROR in AddCashHealthMenu: " + err);
            return '';
        }
    },

    AddQuestMenu: function () {
        try {
            var forceSubGen = "Always do a quest with the Subquest General you selected under the Generals section. NOTE: This will keep the script from automatically switching to the required general for experience of primary quests.",
                XQuestInstructions = "Start questing when energy is at or above this value.",
                XMinQuestInstructions = "Stop quest when energy is at or below this value.",
                autoQuestName = gm.getObjVal('AutoQuest', 'name'),
                htmlCode = '';

            htmlCode += this.ToggleControl('Quests', 'QUEST');
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td width=80>Quest When</td><td style='text-align: right; width: 60%'>" + this.MakeDropDown('WhenQuest', this.questWhenList, this.questWhenInst, "style='font-size: 10px; width: 100%'") + '</td></tr></table>';
            htmlCode += "<div id='caap_WhenQuestHide' style='display: " + (gm.getValue('WhenQuest', false) !== 'Never' ? 'block' : 'none') + "'>";
            htmlCode += "<div id='caap_WhenQuestXEnergy' style='display: " + (gm.getValue('WhenQuest', false) !== 'At X Energy' ? 'none' : 'block') + "'>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Start At Or Above Energy</td><td style='text-align: right'>" + this.MakeNumberForm('XQuestEnergy', XQuestInstructions, 1, "size='3' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 10px'>Stop At Or Below Energy</td><td style='text-align: right'>" +
                this.MakeNumberForm('XMinQuestEnergy', XMinQuestInstructions, 0, "size='3' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
            htmlCode += "</div>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Quest Area</td><td style='text-align: right; width: 60%'>" + this.MakeDropDown('QuestArea', this.questAreaList, '', "style='font-size: 10px; width: 100%'") + '</td></tr>';
            switch (gm.getValue('QuestArea', this.questAreaList[0])) {
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
            htmlCode += this.MakeCheckTR("Switch Quest Area", 'switchQuestArea', false, '', 'Allows switching quest area after Advancement or Max Influence');
            htmlCode += this.MakeCheckTR("Use Only Subquest General", 'ForceSubGeneral', false, '', forceSubGen);
            htmlCode += this.MakeCheckTR("Quest For Orbs", 'GetOrbs', false, '', 'Perform the Boss quest in the selected land for orbs you do not have.') + "</table>";
            htmlCode += "</div>";
            if (autoQuestName) {
                htmlCode += "<a id='stopAutoQuest' style='display: block' href='javascript:;'>Stop auto quest: " + autoQuestName + " (energy: " + gm.getObjVal('AutoQuest', 'energy') + ")" + "</a>";
            } else {
                htmlCode += "<a id='stopAutoQuest' style='display: none' href='javascript:;'></a>";
            }

            htmlCode += "<hr/></div>";
            return htmlCode;
        } catch (err) {
            global.error("ERROR in AddQuestMenu: " + err);
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
                    'Never'
                ],
                battleInst = [
                    'Stamina Available will battle whenever you have enough stamina',
                    'At Max Stamina will battle when stamina is at max and will burn down all stamina when able to level up',
                    'At X Stamina you can set maximum and minimum stamina to battle',
                    'No Monster will battle only when there are no active monster battles',
                    'Stay Hidden uses stamina to try to keep you under 10 health so you cannot be attacked, while also attempting to maximize your stamina use for Monster attacks. YOU MUST SET MONSTER TO "STAY HIDDEN" TO USE THIS FEATURE.',
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
            htmlCode += "<tr><td>Battle When</td><td style='text-align: right; width: 65%'>" + this.MakeDropDown('WhenBattle', battleList, battleInst, "style='font-size: 10px; width: 100%'") + '</td></tr></table>';
            htmlCode += "<div id='caap_WhenBattleStayHidden1' style='display: " + (gm.getValue('WhenBattle', false) === 'Stay Hidden' && gm.getValue('WhenMonster', false) !== 'Stay Hidden' ? 'block' : 'none') + "'>";
            htmlCode += "<font color='red'><b>Warning: Monster Not Set To 'Stay Hidden'</b></font>";
            htmlCode += "</div>";
            htmlCode += "<div id='caap_WhenBattleXStamina' style='display: " + (gm.getValue('WhenBattle', false) !== 'At X Stamina' ? 'none' : 'block') + "'>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Start Battles When Stamina</td><td style='text-align: right'>" + this.MakeNumberForm('XBattleStamina', XBattleInstructions, 1, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 10px'>Keep This Stamina</td><td style='text-align: right'>" +
                this.MakeNumberForm('XMinBattleStamina', XMinBattleInstructions, 0, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
            htmlCode += "</div>";
            htmlCode += "<div id='caap_WhenBattleHide' style='display: " + (gm.getValue('WhenBattle', false) !== 'Never' ? 'block' : 'none') + "'>";
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
            htmlCode += "<div id='caap_FreshmeatSub' style='display: " + (gm.getValue('TargetType', false) !== 'Userid List' ? 'block' : 'none') + "'>";
            htmlCode += "Attack targets that are:";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td style='padding-left: 10px'>Not Lower Than Rank Minus</td><td style='text-align: right'>" +
                this.MakeNumberForm('FreshMeatMinRank', FMRankInstructions, '', "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 10px'>Not Higher Than X*Army</td><td style='text-align: right'>" +
                this.MakeNumberForm('FreshMeatARBase', FMARBaseInstructions, "0.5", "size='2' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
            htmlCode += "</div>";
            htmlCode += "<div id='caap_RaidSub' style='display: " + (gm.getValue('TargetType', false) === 'Raid' ? 'block' : 'none') + "'>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR("Attempt +1 Kills", 'PlusOneKills', false, '', plusonekillsInstructions) + '</table>';
            htmlCode += "Join Raids in this order <a href='http://senses.ws/caap/index.php?topic=1502.0' target='_blank'><font color='red'>?</font></a><br />";
            htmlCode += this.MakeTextBox('orderraid', raidOrderInstructions, '');
            htmlCode += "</div>";
            htmlCode += "<div align=right id='caap_UserIdsSub' style='display: " + (gm.getValue('TargetType', false) === 'Userid List' ? 'block' : 'none') + "'>";
            htmlCode += this.MakeListBox('BattleTargets', userIdInstructions, '');
            htmlCode += "</div>";
            htmlCode += "</div>";
            htmlCode += "<hr/></div>";
            return htmlCode;
        } catch (err) {
            global.error("ERROR in AddBattleMenu: " + err);
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
                demiPointsFirstInstructions = "Don't attack monsters until you've gotten all your demi points from battling. Requires that battle mode is set appropriately",
                powerattackInstructions = "Use power attacks. Only do normal attacks if power attack not possible",
                powerattackMaxInstructions = "Use maximum power attacks globally on Skaar, Genesis, Ragnarok, and Bahamut types. Only do normal power attacks if maximum power attack not possible",
                powerfortifyMaxInstructions = "Use maximum power fortify globally on Skaar, Genesis, Ragnarok, and Bahamut types. Only do normal power attacks if maximum power attack not possible",
                dosiegeInstructions = "Turns on or off automatic siege assist for all monsters only.",
                useTacticsInstructions = "Use the Tactics attack method, on monsters that support it, instead of the normal attack.",
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
            htmlCode += "<tr><td style='width: 35%'>Attack When</td><td style='text-align: right'>" + this.MakeDropDown('WhenMonster', mbattleList, mbattleInst, "style='font-size: 10px; width: 100%;'") + '</td></tr></table>';
            htmlCode += "<div id='caap_WhenMonsterXStamina' style='display: " + (gm.getValue('WhenMonster', false) !== 'At X Stamina' ? 'none' : 'block') + "'>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Battle When Stamina</td><td style='text-align: right'>" + this.MakeNumberForm('XMonsterStamina', XMonsterInstructions, 1, "size='3' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 10px'>Keep This Stamina</td><td style='text-align: right'>" +
                this.MakeNumberForm('XMinMonsterStamina', XMinMonsterInstructions, 0, "size='3' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
            htmlCode += "</div>";
            htmlCode += "<div id='caap_WhenMonsterHide' style='display: " + (gm.getValue('WhenMonster', false) !== 'Never' ? 'block' : 'none') + "'>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Monster delay secs</td><td style='text-align: right'>" + this.MakeNumberForm('seedTime', monsterDelayInstructions, 300, "type='text' size='3' style='font-size: 10px; text-align: right'") + "</td></tr>";
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
            htmlCode += this.MakeTextBox('orderbattle_monster', attackOrderInstructions, '');
            htmlCode += "</div>";
            htmlCode += "<hr/></div>";
            return htmlCode;
        } catch (err) {
            global.error("ERROR in AddMonsterMenu: " + err);
            return '';
        }
    },

    AddMonsterFinderMenu: function () {
        try {
            // Monster finder controls
            var monsterFinderInstructions = "When monsters are over max damage, use Monster Finder?",
                monsterFinderStamInstructions = "Don't find new monster if stamina under this amount",
                monsterFinderFeedMinInstructions = "Wait at least this many minutes before checking the Castle Age feed (in Facebook) (Max 120)",
                //monsterFinderFeedMaxInstructions = "If this much time has passed, always Castle Age feed (in Facebook) (argument is in minutes)",
                monsterFinderOrderInstructions = "List of search words that decide which monster to attack first.  Can be names or monster types.",
                htmlCode = '';

            htmlCode += this.ToggleControl('MonsterFinder', 'MONSTER FINDER');
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR("Use Monster Finder", 'MonsterFinderUse', false, 'MonsterFinderUse_Adv', monsterFinderInstructions, true);
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Monster Find Min Stam</td><td style='text-align: right'>" +
                this.MakeNumberForm('MonsterFinderMinStam', monsterFinderStamInstructions, 50, "size='3' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td>Min-Check Feed (minutes)</td><td style='text-align: right'>" +
                this.MakeNumberForm('MonsterFinderFeedMin', monsterFinderFeedMinInstructions, 15, "size='3' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
            htmlCode += "Find Monster Priority <a href='http://senses.ws/caap/index.php?topic=66.0' target='_blank'><font color='red'>?</font></a>";
            htmlCode += this.MakeTextBox('MonsterFinderOrder', monsterFinderOrderInstructions, '');
            htmlCode += "</div>";
            htmlCode += "<hr/></div>";
            return htmlCode;
        } catch (err) {
            global.error("ERROR in AddMonsterFinderMenu: " + err);
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
                this.MakeNumberForm('ReconPlayerRank', PRRankInstructions, '3', "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 10px'>Not Higher Than Level Plus</td><td style='text-align: right'>" +
                this.MakeNumberForm('ReconPlayerLevel', PRLevelInstructions, '10', "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 10px'>Not Higher Than X*Army</td><td style='text-align: right'>" +
                this.MakeNumberForm('ReconPlayerARBase', PRARBaseInstructions, '1', "size='2' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
            htmlCode += "</div>";
            htmlCode += "<hr/></div>";
            return htmlCode;
        } catch (err) {
            global.error("ERROR in AddReconMenu: " + err);
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
                LevelUpGenInstructions5 = "Use the Level Up General for doing sub-quests.",
                LevelUpGenInstructions6 = "Use the Level Up General for doing primary quests " +
                    "(Warning: May cause you not to gain influence if wrong general is equipped.)",
                dropDownItem = 0,
                htmlCode = '';

            general.BuildlLists();

            htmlCode += this.ToggleControl('Generals', 'GENERALS');
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR("Do not reset General", 'ignoreGeneralImage', false, '', ignoreGeneralImage) + "</table>";
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
            htmlCode += "<div id='caap_LevelUpGeneralHide' style='display: " + (gm.getValue('LevelUpGeneral', false) !== 'Use Current' ? 'block' : 'none') + "'>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td>Exp To Use LevelUp Gen </td><td style='text-align: right'>" + this.MakeNumberForm('LevelUpGeneralExp', LevelUpGenExpInstructions, 20, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += this.MakeCheckTR("Level Up Gen For Idle", 'IdleLevelUpGeneral', true, '', LevelUpGenInstructions1);
            htmlCode += this.MakeCheckTR("Level Up Gen For Monsters", 'MonsterLevelUpGeneral', true, '', LevelUpGenInstructions2);
            htmlCode += this.MakeCheckTR("Level Up Gen For Fortify", 'FortifyLevelUpGeneral', true, '', LevelUpGenInstructions3);
            htmlCode += this.MakeCheckTR("Level Up Gen For Battles", 'BattleLevelUpGeneral', true, '', LevelUpGenInstructions4);
            htmlCode += this.MakeCheckTR("Level Up Gen For SubQuests", 'SubQuestLevelUpGeneral', true, '', LevelUpGenInstructions5);
            htmlCode += this.MakeCheckTR("Level Up Gen For MainQuests", 'QuestLevelUpGeneral', true, '', LevelUpGenInstructions6);
            htmlCode += "</table></div>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR("Reverse Under Level 4 Order", 'ReverseLevelUpGenerals', false, '', reverseGenInstructions) + "</table>";
            htmlCode += "<hr/></div>";
            return htmlCode;
        } catch (err) {
            global.error("ERROR in AddGeneralsMenu: " + err);
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
            htmlCode += this.MakeCheckTR("Upgrade Immediately", 'StatImmed', false, '', statImmedInstructions);
            htmlCode += this.MakeCheckTR("Advanced Settings <a href='http://userscripts.org/posts/207279' target='_blank'><font color='red'>?</font></a>", 'AutoStatAdv', false, '', statusAdvInstructions) + "</table>";
            htmlCode += "<div id='caap_Status_Normal' style='display: " + (gm.getValue('AutoStatAdv', false) ? 'none' : 'block') + "'>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td style='width: 25%; text-align: right'>Increase</td><td style='width: 50%; text-align: center'>" +
                this.MakeDropDown('Attribute0', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 5%; text-align: center'>to</td><td style='width: 20%; text-align: right'>" +
                this.MakeNumberForm('AttrValue0', statusInstructions, 0, "type='text' size='3' style='font-size: 10px; text-align: right'") + " </td></tr>";
            htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
                this.MakeDropDown('Attribute1', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 5%; text-align: center'>to</td><td style='width: 20%; text-align: right'>" +
                this.MakeNumberForm('AttrValue1', statusInstructions, 0, "type='text' size='3' style='font-size: 10px; text-align: right'") + " </td></tr>";
            htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
                this.MakeDropDown('Attribute2', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 5%; text-align: center'>to</td><td style='width: 20%; text-align: right'>" +
                this.MakeNumberForm('AttrValue2', statusInstructions, 0, "type='text' size='3' style='font-size: 10px; text-align: right'") + " </td></tr>";
            htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
                this.MakeDropDown('Attribute3', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 5%; text-align: center'>to</td><td style='width: 20%; text-align: right'>" +
                this.MakeNumberForm('AttrValue3', statusInstructions, 0, "type='text' size='3' style='font-size: 10px; text-align: right'") + " </td></tr>";
            htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
                this.MakeDropDown('Attribute4', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 5%; text-align: center'>to</td><td style='width: 20%; text-align: right'>" +
                this.MakeNumberForm('AttrValue4', statusInstructions, 0, "type='text' size='3' style='font-size: 10px; text-align: right'") + " </td></tr></table>";
            htmlCode += "</div>";
            htmlCode += "<div id='caap_Status_Adv' style='display: " + (gm.getValue('AutoStatAdv', false) ? 'block' : 'none') + "'>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td style='width: 25%; text-align: right'>Increase</td><td style='width: 50%; text-align: center'>" +
                this.MakeDropDown('Attribute5', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 25%; text-align: left'>using</td></tr>";
            htmlCode += "<tr><td colspan='3'>" + this.MakeNumberForm('AttrValue5', statusInstructions, 0, "type='text' size='7' style='font-size: 10px; width : 98%'") + " </td></tr>";
            htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
                this.MakeDropDown('Attribute6', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 25%'>using</td></tr>";
            htmlCode += "<tr><td colspan='3'>" + this.MakeNumberForm('AttrValue6', statusInstructions, 0, "type='text' size='7' style='font-size: 10px; width : 98%'") + " </td></tr>";
            htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
                this.MakeDropDown('Attribute7', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 25%'>using</td></tr>";
            htmlCode += "<tr><td colspan='3'>" + this.MakeNumberForm('AttrValue7', statusInstructions, 0, "type='text' size='7' style='font-size: 10px; width : 98%'") + " </td></tr>";
            htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
                this.MakeDropDown('Attribute8', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 25%'>using</td></tr>";
            htmlCode += "<tr><td colspan='3'>" + this.MakeNumberForm('AttrValue8', statusInstructions, 0, "type='text' size='7' style='font-size: 10px; width : 98%'") + " </td></tr>";
            htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
                this.MakeDropDown('Attribute9', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 25%'>using</td></tr>";
            htmlCode += "<tr><td colspan='3'>" + this.MakeNumberForm('AttrValue9', statusInstructions, 0, "type='text' size='7' style='font-size: 10px; width : 98%'") + " </td></tr></table>";
            htmlCode += "</div>";
            htmlCode += "</table></div>";
            htmlCode += "<hr/></div>";
            return htmlCode;
        } catch (err) {
            global.error("ERROR in AddSkillPointsMenu: " + err);
            return '';
        }
    },

    AddOtherOptionsMenu: function () {
        try {
            // Other controls
            var giftInstructions = "Automatically receive and send return gifts.",
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
                giftChoiceList = [
                    'Same Gift As Received',
                    'Random Gift'
                ],
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

            giftChoiceList = giftChoiceList.concat(gm.getList('GiftList'));
            giftChoiceList.push('Get Gift List');

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
            htmlCode += this.MakeCheckTR('Auto Collect MA', 'AutoCollectMA', true, '', autoCollectMAInstructions);
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
            htmlCode += this.MakeCheckTR('Auto Elite Army', 'AutoElite', true, 'AutoEliteControl', autoEliteInstructions, true);
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR('&nbsp;&nbsp;&nbsp;Timed Only', 'AutoEliteIgnore', false, '', autoEliteIgnoreInstructions) + '</table>';
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td><input type='button' id='caap_resetElite' value='Do Now' style='padding: 0; font-size: 10px; height: 18px' /></tr></td>";
            htmlCode += '<tr><td>' + this.MakeListBox('EliteArmyList', "Try these UserIDs first. Use ',' between each UserID", '') + '</td></tr></table>';
            htmlCode += '</div>';
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += this.MakeCheckTR('Auto Return Gifts', 'AutoGift', false, 'GiftControl', giftInstructions, true);
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td style='width: 25%; padding-left: 10px'>Give</td><td style='text-align: right'>" +
                this.MakeDropDown('GiftChoice', giftChoiceList, '', "style='font-size: 10px; width: 100%'") + '</td></tr></table>';
            htmlCode += '</div>';
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px' style='margin-top: 3px'>";
            htmlCode += "<tr><td style='width: 50%'>Auto bless</td><td style='text-align: right'>" +
                this.MakeDropDown('AutoBless', autoBlessList, '', "style='font-size: 10px; width: 100%'") + '</td></tr></table>';
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px' style='margin-top: 3px'>";
            htmlCode += "<tr><td style='width: 50%'>Style</td><td style='text-align: right'>" +
                this.MakeDropDown('DisplayStyle', styleList, '', "style='font-size: 10px; width: 100%'") + '</td></tr></table>';
            htmlCode += "<div id='caap_DisplayStyleHide' style='display: " + (gm.getValue('DisplayStyle', false) === 'Custom' ? 'block' : 'none') + "'>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
            htmlCode += "<tr><td style='padding-left: 10px'><b>Started</b></td><td style='text-align: right'><input type='button' id='caap_StartedColorSelect' value='Select' style='padding: 0; font-size: 10px; height: 18px' /></td></tr>";
            htmlCode += "<tr><td style='padding-left: 20px'>RGB Color</td><td style='text-align: right'>" +
                this.MakeNumberForm('StyleBackgroundLight', 'FFF or FFFFFF', '#E0C691', "type='text' size='5' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 20px'>Transparency</td><td style='text-align: right'>" +
                this.MakeNumberForm('StyleOpacityLight', '0 ~ 1', '1', "type='text' size='5' style='vertical-align: middle; font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 10px'><b>Stoped</b></td><td style='text-align: right'><input type='button' id='caap_StopedColorSelect' value='Select' style='padding: 0; font-size: 10px; height: 18px' /></td></tr>";
            htmlCode += "<tr><td style='padding-left: 20px'>RGB Color</td><td style='text-align: right'>" +
                this.MakeNumberForm('StyleBackgroundDark', 'FFF or FFFFFF', '#B09060', "type='text' size='5' style='font-size: 10px; text-align: right'") + '</td></tr>';
            htmlCode += "<tr><td style='padding-left: 20px'>Transparency</td><td style='text-align: right'>" +
                this.MakeNumberForm('StyleOpacityDark', '0 ~ 1', '1', "type='text' size='5' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
            htmlCode += "</div>";
            htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px' style='margin-top: 3px'>";
            htmlCode += "<tr><td><input type='button' id='caap_FillArmy' value='Fill Army' style='padding: 0; font-size: 10px; height: 18px' /></td></tr></table>";
            htmlCode += '</div>';
            htmlCode += "<hr/></div>";
            return htmlCode;
        } catch (err) {
            global.error("ERROR in AddOtherOptionsMenu: " + err);
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
                    htmlCode += "<a href='http://castle-age-auto-player.googlecode.com/files/Castle-Age-Autoplayer.user.js'>Install new CAAP version: " + gm.getValue('SUC_remote_version') + "!</a>";
                }
            } else {
                htmlCode += "Version: " + caapVersion + " d" + devVersion + " - <a href='" + global.discussionURL + "' target='_blank'>CAAP Forum</a><br />";
                if (global.newVersionAvailable) {
                    htmlCode += "<a href='http://castle-age-auto-player.googlecode.com/files/Castle-Age-Autoplayer.user.js'>Install new CAAP version: " + gm.getValue('SUC_remote_version') + " d" + gm.getValue('DEV_remote_version')  + "!</a>";
                }
            }

            return htmlCode;
        } catch (err) {
            global.error("ERROR in AddFooterMenu: " + err);
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
                gm.setValue("StyleBackgroundLight", color);
                gm.setValue("CustStyleBackgroundLight", color);
            };

            $.farbtastic($("<div id='caap_ColorSelectorDiv1'></div>").css({
                background : gm.getValue("StyleBackgroundLight", "#E0C691"),
                padding    : "5px",
                border     : "2px solid #000",
                top        : (window.innerHeight / 2) - 100 + 'px',
                left       : (window.innerWidth / 2) - 290 + 'px',
                zIndex     : '1337',
                position   : 'fixed',
                display    : 'none'
            }).appendTo(document.body), fb1call).setColor(gm.getValue("StyleBackgroundLight", "#E0C691"));

            fb2call = function (color) {
                $('#caap_ColorSelectorDiv2').css({'background-color': color});
                $('#caap_StyleBackgroundDark').val(color);
                gm.setValue("StyleBackgroundDark", color);
                gm.setValue("CustStyleBackgroundDark", color);
            };

            $.farbtastic($("<div id='caap_ColorSelectorDiv2'></div>").css({
                background : gm.getValue("StyleBackgroundDark", "#B09060"),
                padding    : "5px",
                border     : "2px solid #000",
                top        : (window.innerHeight / 2) - 100 + 'px',
                left       : (window.innerWidth / 2) + 'px',
                zIndex     : '1337',
                position   : 'fixed',
                display    : 'none'
            }).appendTo(document.body), fb2call).setColor(gm.getValue("StyleBackgroundDark", "#B09060"));

            return true;
        } catch (err) {
            global.error("ERROR in AddColorWheels: " + err);
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
                displayList = ['Monster', 'Target List', 'User Stats', 'Generals Stats'],
                styleXY = {
                    x: 0,
                    y: 0
                };
            /*-------------------------------------------------------------------------------------\
             Next we put in our Refresh Monster List button which will only show when we have
             selected the Monster display.
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_buttonMonster' style='position:absolute;top:0px;left:250px;display:" +
                (gm.getValue('DBDisplay', 'Monster') === 'Monster' ? 'block' : 'none') + "'><input type='button' id='caap_refreshMonsters' value='Refresh Monster List' style='padding: 0; font-size: 9px; height: 18px' /></div>";
            /*-------------------------------------------------------------------------------------\
             Next we put in the Clear Target List button which will only show when we have
             selected the Target List display
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_buttonTargets' style='position:absolute;top:0px;left:250px;display:" +
                (gm.getValue('DBDisplay', 'Monster') === 'Target List' ? 'block' : 'none') + "'><input type='button' id='caap_clearTargets' value='Clear Targets List' style='padding: 0; font-size: 9px; height: 18px' /></div>";
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
            layout += "<div id='caap_infoMonster' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (gm.getValue('DBDisplay', 'Monster') === 'Monster' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_infoTargets1' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (gm.getValue('DBDisplay', 'Monster') === 'Target List' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_infoTargets2' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (gm.getValue('DBDisplay', 'Monster') === 'Target Stats' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_userStats' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (gm.getValue('DBDisplay', 'Monster') === 'User Stats' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_generalsStats' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (gm.getValue('DBDisplay', 'Monster') === 'Generals Stats' ? 'block' : 'none') + "'></div>";
            layout += "</div>";
            /*-------------------------------------------------------------------------------------\
             No we apply our CSS to our container
            \-------------------------------------------------------------------------------------*/
            this.dashboardXY.x = gm.getValue('caap_top_menuLeft', '');
            this.dashboardXY.y = gm.getValue('caap_top_menuTop', $(this.dashboardXY.selector).offset().top - 10);
            styleXY = this.GetDashboardXY();
            $(layout).css({
                background              : gm.getValue("StyleBackgroundLight", "white"),
                padding                 : "5px",
                height                  : "185px",
                width                   : "610px",
                margin                  : "0 auto",
                opacity                 : gm.getValue('StyleOpacityLight', '1'),
                top                     : styleXY.y + 'px',
                left                    : styleXY.x + 'px',
                zIndex                  : gm.getValue('caap_top_zIndex', '1'),
                position                : 'absolute',
                '-moz-border-radius'    : '5px',
                '-webkit-border-radius' : '5px'
            }).appendTo(document.body);

            this.caapTopObject = $('#caap_top');
            $("#caap_refreshMonsters").button();
            $("#caap_clearTargets").button();
            $("#caap_liveFeed").button();

            return true;
        } catch (err) {
            global.error("ERROR in AddDashboard: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                      MONSTERS DASHBOARD
    // Display the current monsters and stats
    /////////////////////////////////////////////////////////////////////
    decHours2HoursMin : function (decHours) {
        var hours   = 0,
            minutes = 0;

        hours = Math.floor(decHours);
        minutes = ((decHours - hours) * 60).toFixed(0);
        if (minutes < 10) {
            minutes = '0' + minutes;
        }

        return hours + ':' + minutes;
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
        if (gm.getObjVal(data.color, 'color')) {
            data.color = gm.getObjVal(data.color, 'color');
        }

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
                monster                  = '',
                monstType                = '',
                energyRequire            = 0,
                nodeNum                  = 0,
                staLvl                   = [],
                color                    = '',
                value                    = 0,
                headers                  = [],
                values                   = [],
                pp                       = 0,
                targetList               = [],
                i                        = 0,
                targetObj                = null,
                userid                   = 0,
                link                     = '',
                j                        = 0,
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
                oCount                   = 0,
                it                       = 0,
                str                      = '',
                header                   = {text: '', color: '', id: '', title: '', width: ''},
                data                     = {text: '', color: '', id: '', title: ''};

            if ($('#caap_top').length === 0) {
                throw "We are missing the Dashboard div!";
            }

            if (!force && !this.oneMinuteUpdate('dashboard') && $('#caap_infoMonster').html() && $('#caap_infoMonster').html()) {
                if (this.UpdateDashboardWaitLog) {
                    global.log(3, "Dashboard update is waiting on oneMinuteUpdate");
                    this.UpdateDashboardWaitLog = false;
                }

                return false;
            }

            global.log(9, "Updating Dashboard");
            this.UpdateDashboardWaitLog = true;
            html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
            headers = ['Name', 'Damage', 'Damage%', 'Fort%', 'TimeLeft', 'T2K', 'Phase', 'Link', '&nbsp;', '&nbsp;'];
            for (pp in headers) {
                if (headers.hasOwnProperty(pp)) {
                    html += this.makeTh({text: headers[pp], color: '', id: '', title: '', width: ''});
                }
            }

            html += '</tr>';
            headers.shift();
            monsterList = gm.getList('monsterOl');
            global.log(9, "monsterList", monsterList);
            monsterList.forEach(function (monsterObj) {
                global.log(9, "monsterObj", monsterObj.split(global.vs));
                monster = monsterObj.split(global.vs)[0];
                monstType = gm.getObjVal(monsterObj, 'Type', '');
                energyRequire = 10;
                nodeNum = 0;
                if (caap.monsterInfo[monstType]) {
                    staLvl = caap.monsterInfo[monstType].staLvl;
                    if (!caap.InLevelUpMode() && gm.getValue('PowerFortifyMax') && staLvl) {
                        for (nodeNum = caap.monsterInfo[monstType].staLvl.length - 1; nodeNum >= 0; nodeNum -= 1) {
                            if (caap.stats.stamina.max > caap.monsterInfo[monstType].staLvl[nodeNum]) {
                                break;
                            }
                        }
                    }

                    if (nodeNum >= 0 && nodeNum !== null && nodeNum !== undefined && gm.getValue('PowerAttackMax') && caap.monsterInfo[monstType].nrgMax) {
                        energyRequire = caap.monsterInfo[monstType].nrgMax[nodeNum];
                    }
                }

                color = '';
                html += "<tr>";
                if (monster === gm.getValue('targetFromfortify') && caap.CheckEnergy(energyRequire, gm.getValue('WhenFortify', 'Energy Available'), 'fortify_mess')) {
                    color = 'blue';
                } else if (monster === gm.getValue('targetFromraid') || monster === gm.getValue('targetFrombattle_monster')) {
                    color = 'green';
                } else {
                    color = gm.getObjVal(monsterObj, 'color', 'black');
                }

                achLevel = 0;
                maxDamage = 0;
                monsterConditions = gm.getObjVal(monsterObj, 'conditions', '');
                if (monsterConditions) {
                    achLevel = caap.parseCondition('ach', monsterConditions);
                    maxDamage = caap.parseCondition('max', monsterConditions);
                }

                monsterObjLink = gm.getObjVal(monsterObj, 'Link', '');
                global.log(9, "monsterObjLink", monsterObjLink);
                if (monsterObjLink) {
                    visitMonsterLink = monsterObjLink.replace("&action=doObjective", "").match(new RegExp("'(http:.+)'"));
                    global.log(9, "visitMonsterLink", visitMonsterLink);
                    visitMonsterInstructions = "Clicking this link will take you to " + monster;
                    data = {
                        text  : '<span id="caap_monster_' + count + '" title="' + visitMonsterInstructions + '" mname="' + monster + '" rlink="' + visitMonsterLink[1] +
                                '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + monster + '</span>',
                        color : color,
                        id    : '',
                        title : ''
                    };

                    html += caap.makeTd(data);
                } else {
                    html += caap.makeTd({text: monster, color: color, id: '', title: ''});
                }

                headers.forEach(function (displayItem) {
                    global.log(9, ' displayItem ', displayItem, ' value ', gm.getObjVal(monsterObj, displayItem));
                    id = "caap_" + displayItem + "_" + count;
                    title = '';
                    if (displayItem === 'Phase' && color === 'grey') {
                        html += caap.makeTd({text: gm.getObjVal(monsterObj, 'status'), color: color, id: '', title: ''});
                    } else {
                        value = gm.getObjVal(monsterObj, displayItem);
                        if (value && !(displayItem === 'Fort%' && value === 101)) {
                            if (parseInt(value, 10).toString() === value) {
                                value = caap.makeCommaValue(value);
                            }

                            switch (displayItem) {
                            case 'Damage' :
                                if (achLevel) {
                                    title = "User Set Monster Achievement: " + caap.makeCommaValue(achLevel);
                                } else if (gm.getValue('AchievementMode', false)) {
                                    if (caap.monsterInfo[monstType]) {
                                        title = "Default Monster Achievement: " + caap.makeCommaValue(caap.monsterInfo[monstType].ach);
                                    }
                                } else {
                                    title = "Achievement Mode Disabled";
                                }

                                if (maxDamage) {
                                    title += " - User Set Max Damage: " + caap.makeCommaValue(maxDamage);
                                }

                                break;
                            case 'TimeLeft' :
                                if (caap.monsterInfo[monstType]) {
                                    title = "Total Monster Duration: " + caap.monsterInfo[monstType].duration + " hours";
                                }

                                break;
                            case 'T2K' :
                                value = caap.decHours2HoursMin(parseFloat(value));
                                title = "Estimated Time To Kill: " + value + " hours";
                                break;
                            default :
                            }

                            html += caap.makeTd({text: value + (displayItem.match(/%/) ? '%' : ''), color: color, id: id, title: title});
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
                    global.log(9, "removeLink", removeLink);
                    removeLinkInstructions = "Clicking this link will remove " + monster + " from both CA and CAAP!";
                    data = {
                        text  : '<span id="caap_remove_' + count + '" title="' + removeLinkInstructions + '" mname="' + monster + '" rlink="' + removeLink[1] +
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

            $("#caap_top span[id*='caap_monster_']").click(function (e) {
                global.log(9, "Clicked", e.target.id);
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

                global.log(9, 'visitMonsterLink', visitMonsterLink);
                caap.ClickAjax(visitMonsterLink.arlink);
            });

            $("#caap_top span[id*='caap_remove_']").click(function (e) {
                global.log(9, "Clicked", e.target.id);
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

                global.log(9, 'monsterRemove', monsterRemove);
                resp = confirm("Are you sure you want to remove " + monsterRemove.mname + "?");
                if (resp === true) {
                    gm.deleteListObj('monsterOl', monsterRemove.mname);
                    caap.UpdateDashboard(true);
                    if (gm.getValue('clickUrl', '').indexOf(monsterRemove.arlink) < 0) {
                        gm.setValue('clickUrl', monsterRemove.rlink);
                        this.waitingForDomLoad = false;
                    }

                    caap.VisitUrl("javascript:void(a46755028429_get_cached_ajax('" + monsterRemove.arlink + "', 'get_body'))");
                }
            });

            /*-------------------------------------------------------------------------------------\
            Next we build the HTML to be included into the 'caap_infoTargets1' div. We set our
            table and then build the header row.
            \-------------------------------------------------------------------------------------*/
            html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
            headers = ['UserId', 'Name',    'Deity#',   'Rank',    'Rank#',   'Level',    'Army',    'Last Alive'];
            values  = ['userID', 'nameStr', 'deityNum', 'rankStr', 'rankNum', 'levelNum', 'armyNum', 'aliveTime'];
            for (pp in headers) {
                if (headers.hasOwnProperty(pp)) {
                    html += this.makeTh({text: headers[pp], color: '', id: '', title: '', width: ''});
                }
            }

            html += '</tr>';
            for (i = 0; i < this.ReconRecordArray.length; i += 1) {
                html += "<tr>";
                for (pp in values) {
                    if (values.hasOwnProperty(pp)) {
                        if (/userID/.test(values[pp])) {
                            userIdLinkInstructions = "Clicking this link will take you to the user keep of " + this.ReconRecordArray[i][values[pp]];
                            userIdLink = "http://apps.facebook.com/castle_age/keep.php?casuser=" + this.ReconRecordArray[i][values[pp]];
                            data = {
                                text  : '<span id="caap_target_' + i + '" title="' + userIdLinkInstructions + '" rlink="' + userIdLink +
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
                }

                html += '</tr>';
            }

            html += '</table>';
            $("#caap_infoTargets1").html(html);

            $("#caap_top span[id*='caap_target_']").click(function (e) {
                global.log(9, "Clicked", e.target.id);
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

                global.log(9, 'visitUserIdLink', visitUserIdLink);
                caap.ClickAjax(visitUserIdLink.arlink);
            });

            /*-------------------------------------------------------------------------------------\
            Next we build the HTML to be included into the 'caap_userStats' div. We set our
            table and then build the header row.
            \-------------------------------------------------------------------------------------*/
            html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
            headers = ['Name', 'Value', 'Name', 'Value'];
            for (pp in headers) {
                if (headers.hasOwnProperty(pp)) {
                    html += this.makeTh({text: headers[pp], color: '', id: '', title: '', width: ''});
                }
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
            html += this.makeTd({text: this.battleRankTable[this.stats.rank.battle] + ' (' + this.stats.rank.battle + ')', color: valueCol, id: '', title: ''});
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
            html += this.makeTd({text: this.warRankTable[this.stats.rank.war] + ' (' + this.stats.rank.war + ')', color: valueCol, id: '', title: ''});
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
            html += this.makeTd({text: this.FormatTime(new Date(this.stats.indicators.enl)), color: valueCol, id: '', title: ''});
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
            html += this.makeTd({text: this.stats.other.wlr.toFixed(2), color: valueCol, id: '', title: ''});
            html += this.makeTd({text: 'Enemy Eliminated/Eliminated Ratio (EER)', color: titleCol, id: '', title: ''});
            html += this.makeTd({text: this.stats.other.eer.toFixed(2), color: valueCol, id: '', title: ''});
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
            html += this.makeTd({text: this.stats.achievements.battle.invasions.ratio.toFixed(2), color: valueCol, id: '', title: ''});
            html += this.makeTd({text: 'Duels Win/loss Ratio (DWLR)', color: titleCol, id: '', title: ''});
            html += this.makeTd({text: this.stats.achievements.battle.duels.ratio.toFixed(2), color: valueCol, id: '', title: ''});
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
            html += this.makeTd({text: 'Sieges Assisted With', color: titleCol, id: '', title: ''});
            html += this.makeTd({text: this.makeCommaValue(this.stats.achievements.monster.sieges), color: valueCol, id: '', title: ''});
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

            html += '</table>';
            $("#caap_userStats").html(html);

            /*-------------------------------------------------------------------------------------\
            Next we build the HTML to be included into the 'caap_generalsStats' div. We set our
            table and then build the header row.
            \-------------------------------------------------------------------------------------*/
            html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
            headers = ['General', 'Lvl', 'Atk', 'Def', 'API', 'DPI', 'MPI', 'EAtk', 'EDef', 'EAPI', 'EDPI', 'EMPI', 'Special'];
            values  = ['name', 'level', 'atk', 'def', 'api', 'dpi', 'mpi', 'eatk', 'edef', 'eapi', 'edpi', 'empi', 'special'];
            for (pp in headers) {
                if (headers.hasOwnProperty(pp)) {
                    header = {
                        text  : '<span id="caap_generalsStats_' + headers[pp].replace(' ', '_') + '" title="Click to sort" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + headers[pp] + '</span>',
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
            }

            html += '</tr>';
            for (it = 0; it < general.RecordArraySortable.length; it += 1) {
                html += "<tr>";
                for (pp in values) {
                    if (values.hasOwnProperty(pp)) {
                        str = '';
                        if (isNaN(general.RecordArraySortable[it][values[pp]])) {
                            if (general.RecordArraySortable[it][values[pp]]) {
                                str = general.RecordArraySortable[it][values[pp]];
                            }
                        } else {
                            if (general.RecordArraySortable[it][values[pp]]) {
                                if (/pi/.test(values[pp])) {
                                    str = general.RecordArraySortable[it][values[pp]].toFixed(2).toString();
                                } else {
                                    str = general.RecordArraySortable[it][values[pp]].toString();
                                }
                            }
                        }

                        if (pp === "0") {
                            color = titleCol;
                        } else {
                            color = valueCol;
                        }

                        html += caap.makeTd({text: str, color: color, id: '', title: ''});
                    }
                }

                html += '</tr>';
            }

            html += '</table>';
            $("#caap_generalsStats").html(html);

            $("#caap_top span[id*='caap_generalsStats_']").click(function (e) {
                var clicked = '';

                if (e.target.id) {
                    clicked = e.target.id.replace(/caap_generalsStats_/, '');
                }

                global.log(9, "Clicked", clicked);
                switch (clicked) {
                case "General" :
                    general.RecordArraySortable.sort(general.SortName);
                    break;
                case "Lvl" :
                    general.RecordArraySortable.sort(general.SortLevel);
                    break;
                case "Atk" :
                    general.RecordArraySortable.sort(general.SortAtk);
                    break;
                case "Def" :
                    general.RecordArraySortable.sort(general.SortDef);
                    break;
                case "API" :
                    general.RecordArraySortable.sort(general.SortApi);
                    break;
                case "DPI" :
                    general.RecordArraySortable.sort(general.SortDpi);
                    break;
                case "MPI" :
                    general.RecordArraySortable.sort(general.SortMpi);
                    break;
                case "EAtk" :
                    general.RecordArraySortable.sort(general.SortEAtk);
                    break;
                case "EDef" :
                    general.RecordArraySortable.sort(general.SortEDef);
                    break;
                case "EAPI" :
                    general.RecordArraySortable.sort(general.SortEApi);
                    break;
                case "EDPI" :
                    general.RecordArraySortable.sort(general.SortEDpi);
                    break;
                case "EMPI" :
                    general.RecordArraySortable.sort(general.SortEMpi);
                    break;
                default :
                }

                caap.UpdateDashboard(true);
            });

            return true;
        } catch (err) {
            global.error("ERROR in UpdateDashboard: " + err);
            return false;
        }
    },

    /*-------------------------------------------------------------------------------------\
    AddDBListener creates the listener for our dashboard controls.
    \-------------------------------------------------------------------------------------*/
    dbDisplayListener: function (e) {
        var value = e.target.options[e.target.selectedIndex].value;
        gm.setValue('DBDisplay', value);
        switch (value) {
        case "Target List" :
            caap.SetDisplay('infoMonster', false);
            caap.SetDisplay('infoTargets1', true);
            caap.SetDisplay('infoTargets2', false);
            caap.SetDisplay('userStats', false);
            caap.SetDisplay('generalsStats', false);
            caap.SetDisplay('buttonMonster', false);
            caap.SetDisplay('buttonTargets', true);
            break;
        case "Target Stats" :
            caap.SetDisplay('infoMonster', false);
            caap.SetDisplay('infoTargets1', false);
            caap.SetDisplay('infoTargets2', true);
            caap.SetDisplay('userStats', false);
            caap.SetDisplay('generalsStats', false);
            caap.SetDisplay('buttonMonster', false);
            caap.SetDisplay('buttonTargets', true);
            break;
        case "User Stats" :
            caap.SetDisplay('infoMonster', false);
            caap.SetDisplay('infoTargets1', false);
            caap.SetDisplay('infoTargets2', false);
            caap.SetDisplay('userStats', true);
            caap.SetDisplay('generalsStats', false);
            caap.SetDisplay('buttonMonster', false);
            caap.SetDisplay('buttonTargets', false);
            break;
        case "Generals Stats" :
            caap.SetDisplay('infoMonster', false);
            caap.SetDisplay('infoTargets1', false);
            caap.SetDisplay('infoTargets2', false);
            caap.SetDisplay('userStats', false);
            caap.SetDisplay('generalsStats', true);
            caap.SetDisplay('buttonMonster', false);
            caap.SetDisplay('buttonTargets', false);
            break;
        case "Monster" :
            caap.SetDisplay('infoMonster', true);
            caap.SetDisplay('infoTargets1', false);
            caap.SetDisplay('infoTargets2', false);
            caap.SetDisplay('userStats', false);
            caap.SetDisplay('generalsStats', false);
            caap.SetDisplay('buttonMonster', true);
            caap.SetDisplay('buttonTargets', false);
            break;
        default :
        }
    },

    refreshMonstersListener: function (e) {
        gm.setValue('monsterReview', 0);
        gm.setValue('monsterReviewCounter', -3);
        gm.setValue('NotargetFrombattle_monster', 0);
        gm.setValue('ReleaseControl', true);
    },

    liveFeedButtonListener: function (e) {
        caap.ClickAjax('army_news_feed.php');
    },

    clearTargetsButtonListener: function (e) {
        gm.setJValue('reconJSON', []);
        caap.ReconRecordArray = [];
        caap.UpdateDashboard(true);
    },

    AddDBListener: function () {
        try {
            global.log(1, "Adding listeners for caap_top");
            if (!$('#caap_DBDisplay').length) {
                global.ReloadCastleAge();
            }

            $('#caap_DBDisplay').change(this.dbDisplayListener);
            $('#caap_refreshMonsters').click(this.refreshMonstersListener);
            $('#caap_liveFeed').click(this.liveFeedButtonListener);
            $('#caap_clearTargets').click(this.clearTargetsButtonListener);
            global.log(8, "Listeners added for caap_top");
            return true;
        } catch (err) {
            global.error("ERROR in AddDBListener: " + err);
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
            global.error("ERROR in SetDisplay: " + err);
            return false;
        }
    },

    CheckBoxListener: function (e) {
        try {
            var idName        = e.target.id.replace(/caap_/i, ''),
                DocumentTitle = '',
                d             = '';

            global.log(1, "Change: setting '" + idName + "' to " + e.target.checked);
            gm.setValue(idName, e.target.checked);
            if (e.target.className) {
                caap.SetDisplay(e.target.className, e.target.checked);
            }

            switch (idName) {
            case "AutoStatAdv" :
                global.log(9, "AutoStatAdv");
                if (e.target.checked) {
                    caap.SetDisplay('Status_Normal', false);
                    caap.SetDisplay('Status_Adv', true);
                } else {
                    caap.SetDisplay('Status_Normal', true);
                    caap.SetDisplay('Status_Adv', false);
                }

                caap.statsMatch = true;
                break;
            case "HideAds" :
                global.log(9, "HideAds");
                if (e.target.checked) {
                    $('.UIStandardFrame_SidebarAds').css('display', 'none');
                } else {
                    $('.UIStandardFrame_SidebarAds').css('display', 'block');
                }

                break;
            case "BannerDisplay" :
                global.log(9, "BannerDisplay");
                if (e.target.checked) {
                    $('#caap_BannerHide').css('display', 'block');
                } else {
                    $('#caap_BannerHide').css('display', 'none');
                }

                break;
            case "IgnoreBattleLoss" :
                global.log(9, "IgnoreBattleLoss");
                if (e.target.checked) {
                    global.log(1, "Ignore Battle Losses has been enabled.");
                    gm.deleteValue("BattlesLostList");
                    global.log(1, "Battle Lost List has been cleared.");
                }

                break;
            case "SetTitle" :
            case "SetTitleAction" :
            case "SetTitleName" :
                global.log(9, idName);
                if (e.target.checked) {
                    if (gm.getValue('SetTitleAction', false)) {
                        d = $('#caap_activity_mess').html();
                        if (d) {
                            DocumentTitle += d.replace("Activity: ", '') + " - ";
                        }
                    }

                    if (gm.getValue('SetTitleName', false)) {
                        DocumentTitle += caap.stats.PlayerName + " - ";
                    }

                    document.title = DocumentTitle + global.documentTitle;
                } else {
                    document.title = global.documentTitle;
                }

                break;
            case "unlockMenu" :
                global.log(9, "unlockMenu");
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
                global.log(9, "AutoElite");
                gm.deleteValue('AutoEliteGetList');
                gm.deleteValue('AutoEliteReqNext');
                gm.deleteValue('AutoEliteEnd');
                gm.deleteValue('MyEliteTodo');
                if (!gm.getValue('FillArmy', false)) {
                    gm.deleteValue(caap.friendListType.giftc.name + 'Requested');
                    gm.deleteValue(caap.friendListType.giftc.name + 'Responded');
                }

                break;
            case "AutoPotions" :
                global.log(9, "AutoPotions");
                gm.deleteValue('AutoPotionTimer');
                break;
            case "AchievementMode" :
                global.log(9, "AchievementMode");
                gm.setValue('monsterReview', 0);
                gm.setValue('monsterReviewCounter', -3);
                break;
            default :
            }

            return true;
        } catch (err) {
            global.error("ERROR in CheckBoxListener: " + err);
            return false;
        }
    },

    TextBoxListener: function (e) {
        try {
            var idName = e.target.id.replace(/caap_/i, '');
            global.log(1, 'Change: setting "' + idName + '" to "' + e.target.value + '"');
            if (/Style+/.test(idName)) {
                switch (idName) {
                case "StyleBackgroundLight" :
                    if (e.target.value.substr(0, 1) !== '#') {
                        e.target.value = '#' + e.target.value;
                    }

                    gm.setValue("CustStyleBackgroundLight", e.target.value);
                    break;
                case "StyleBackgroundDark" :
                    if (e.target.value.substr(0, 1) !== '#') {
                        e.target.value = '#' + e.target.value;
                    }

                    gm.setValue("CustStyleBackgroundDark", e.target.value);
                    break;
                case "StyleOpacityLight" :
                    gm.setValue("CustStyleOpacityLight", e.target.value);
                    break;
                case "StyleOpacityDark" :
                    gm.setValue("CustStyleOpacityDark", e.target.value);
                    break;
                default :
                }
            } else if (/AttrValue+/.test(idName)) {
                caap.statsMatch = true;
            } else if (/energyPotions+/.test(idName) || /staminaPotions+/.test(idName)) {
                gm.deleteValue('AutoPotionTimer');
            }

            gm.setValue(idName, e.target.value);
            return true;
        } catch (err) {
            global.error("ERROR in TextBoxListener: " + err);
            return false;
        }
    },

    DropBoxListener: function (e) {
        try {
            if (e.target.selectedIndex > 0) {
                var idName = e.target.id.replace(/caap_/i, ''),
                    value  = e.target.options[e.target.selectedIndex].value,
                    title  = e.target.options[e.target.selectedIndex].title;

                global.log(1, 'Change: setting "' + idName + '" to "' + value + '" with title "' + title + '"');
                gm.setValue(idName, value);
                e.target.title = title;
                if (idName === 'WhenQuest' || idName === 'WhenBattle' || idName === 'WhenMonster' || idName === 'LevelUpGeneral') {
                    caap.SetDisplay(idName + 'Hide', (value !== 'Never'));
                    if (idName === 'WhenBattle' || idName === 'WhenMonster') {
                        caap.SetDisplay(idName + 'XStamina', (value === 'At X Stamina'));
                        caap.SetDisplay('WhenBattleStayHidden1', ((gm.getValue('WhenBattle', false) === 'Stay Hidden' && gm.getValue('WhenMonster', false) !== 'Stay Hidden')));
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
                    gm.setValue('AutoQuest', '');
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
                } else if (idName === 'IdleGeneral') {
                    gm.setValue('MaxIdleEnergy', 0);
                    gm.setValue('MaxIdleStamina', 0);
                } else if (idName === 'TargetType') {
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
                    //gm.setValue("SkillPointsNeed", 1);
                    caap.statsMatch = true;
                } else if (idName === 'DisplayStyle') {
                    caap.SetDisplay(idName + 'Hide', (value === 'Custom'));
                    switch (value) {
                    case "CA Skin" :
                        gm.setValue("StyleBackgroundLight", "#E0C691");
                        gm.setValue("StyleBackgroundDark", "#B09060");
                        gm.setValue("StyleOpacityLight", "1");
                        gm.setValue("StyleOpacityDark", "1");
                        break;
                    case "None" :
                        gm.setValue("StyleBackgroundLight", "white");
                        gm.setValue("StyleBackgroundDark", "white");
                        gm.setValue("StyleOpacityLight", "1");
                        gm.setValue("StyleOpacityDark", "1");
                        break;
                    case "Custom" :
                        gm.setValue("StyleBackgroundLight", gm.getValue("CustStyleBackgroundLight", "#E0C691"));
                        gm.setValue("StyleBackgroundDark", gm.getValue("CustStyleBackgroundDark", "#B09060"));
                        gm.setValue("StyleOpacityLight", gm.getValue("CustStyleOpacityLight", "1"));
                        gm.setValue("StyleOpacityDark", gm.getValue("CustStyleOpacityDark", "1"));
                        break;
                    default :
                        gm.setValue("StyleBackgroundLight", "#efe");
                        gm.setValue("StyleBackgroundDark", "#fee");
                        gm.setValue("StyleOpacityLight", "1");
                        gm.setValue("StyleOpacityDark", "1");
                    }

                    caap.caapDivObject.css({
                        background: gm.getValue('StyleBackgroundDark', '#fee'),
                        opacity: gm.getValue('StyleOpacityDark', '1')
                    });

                    caap.caapTopObject.css({
                        background: gm.getValue('StyleBackgroundDark', '#fee'),
                        opacity: gm.getValue('StyleOpacityDark', '1')
                    });
                }
            }

            return true;
        } catch (err) {
            global.error("ERROR in DropBoxListener: " + err);
            return false;
        }
    },

    TextAreaListener: function (e) {
        try {
            var idName = e.target.id.replace(/caap_/i, '');
            var value = e.target.value;
            global.log(1, 'Change: setting "' + idName + '" to "' + value + '"');
            if (idName === 'orderbattle_monster' || idName === 'orderraid') {
                gm.setValue('monsterReview', 0);
                gm.setValue('monsterReviewCounter', -3);
            }

            if (idName === 'EliteArmyList' || idName === 'BattleTargets') {
                var eList = [];
                if (value.length) {
                    value = value.replace(/\n/gi, ',');
                    eList = value.split(',');
                    var fEmpty = function (e) {
                        return e !== '';
                    };

                    eList = eList.filter(fEmpty);
                    if (!eList.length) {
                        eList = [];
                    }
                }

                gm.setList(idName, eList);
                e.target.value = eList;
            } else {
                caap.SaveBoxText(idName);
            }

            return true;
        } catch (err) {
            global.error("ERROR in TextAreaListener: " + err);
            return false;
        }
    },

    PauseListener: function (e) {
        $('#caap_div').css({
            'background': gm.getValue('StyleBackgroundDark', '#fee'),
            'opacity': '1',
            'z-index': '3'
        });

        $('#caap_top').css({
            'background': gm.getValue('StyleBackgroundDark', '#fee'),
            'opacity': '1'
        });

        $('#caapPaused').css('display', 'block');
        if (global.is_chrome) {
            CE_message("paused", null, 'block');
        }

        gm.setValue('caapPause', 'block');
    },

    RestartListener: function (e) {
        $('#caapPaused').css('display', 'none');
        $('#caap_div').css({
            'background': gm.getValue('StyleBackgroundLight', '#efe'),
            'opacity': gm.getValue('StyleOpacityLight', '1'),
            'z-index': gm.getValue('caap_div_zIndex', '2'),
            'cursor': ''
        });

        $('#caap_top').css({
            'background': gm.getValue('StyleBackgroundLight', '#efe'),
            'opacity': gm.getValue('StyleOpacityLight', '1'),
            'z-index': gm.getValue('caap_top_zIndex', '1'),
            'cursor': ''
        });

        $(":input[id*='caap_']").attr({disabled: false});
        $('#unlockMenu').attr('checked', false);

        gm.setValue('caapPause', 'none');
        if (global.is_chrome) {
            CE_message("paused", null, gm.getValue('caapPause', 'none'));
        }

        gm.setValue('ReleaseControl', true);
        gm.setValue('resetselectMonster', true);
        caap.waitingForDomLoad = false;
    },

    ResetMenuLocationListener: function (e) {
        gm.deleteValue('caap_div_menuLeft');
        gm.deleteValue('caap_div_menuTop');
        gm.deleteValue('caap_div_zIndex');
        caap.controlXY.x = '';
        caap.controlXY.y = $(caap.controlXY.selector).offset().top;
        var caap_divXY = caap.GetControlXY(true);
        caap.caapDivObject.css({
            'cursor' : '',
            'z-index' : '2',
            'top' : caap_divXY.y + 'px',
            'left' : caap_divXY.x + 'px'
        });

        gm.deleteValue('caap_top_menuLeft');
        gm.deleteValue('caap_top_menuTop');
        gm.deleteValue('caap_top_zIndex');
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
            var subId = e.target.id.replace(/_Switch/i, '');
            var subDiv = document.getElementById(subId);
            if (subDiv.style.display === "block") {
                global.log(1, 'Folding: ' + subId);
                subDiv.style.display = "none";
                e.target.innerHTML = e.target.innerHTML.replace(/-/, '+');
                gm.setValue('Control_' + subId.replace(/caap_/i, ''), "none");
            } else {
                global.log(1, 'Unfolding: ' + subId);
                subDiv.style.display = "block";
                e.target.innerHTML = e.target.innerHTML.replace(/\+/, '-');
                gm.setValue('Control_' + subId.replace(/caap_/i, ''), "block");
            }

            return true;
        } catch (err) {
            global.error("ERROR in FoldingBlockListener: " + err);
            return false;
        }
    },

    whatClickedURLListener: function (event) {
        var obj = event.target;
        while (obj && !obj.href) {
            obj = obj.parentNode;
        }

        if (obj && obj.href) {
            gm.setValue('clickUrl', obj.href);
            global.log(9, 'globalContainer', obj.href);
        } else {
            if (obj && !obj.href) {
                global.log(1, 'globalContainer no href', obj);
            }
        }
    },

    whatFriendBox: function (event) {
        global.log(9, 'whatFriendBox', event);
        var obj    = event.target,
            userID = [],
            txt    = '';

        while (obj && !obj.id) {
            obj = obj.parentNode;
        }

        if (obj && obj.id) {
            global.log(9, 'globalContainer', obj.onclick);
            userID = obj.onclick.toString().match(/friendKeepBrowse\('([0-9]+)'/);
            if (userID && userID.length === 2) {
                txt = "?casuser=" + userID[1];
            }

            gm.setValue('clickUrl', 'http://apps.facebook.com/castle_age/keep.php' + txt);
        }

        global.log(9, 'globalContainer', obj.id, txt);
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
        "army_reqs"
    ],

    AddListeners: function () {
        try {
            global.log(1, "Adding listeners for caap_div");
            if ($('#caap_div').length === 0) {
                throw "Unable to find div for caap_div";
            }

            $('#caap_div input:checkbox[id^="caap_"]').change(this.CheckBoxListener);
            $('#caap_div input:text[id^="caap_"]').change(this.TextBoxListener);
            $('#unlockMenu').change(this.CheckBoxListener);
            $('#caap_div select[id^="caap_"]').change(this.DropBoxListener);
            $('#caap_div textarea[id^="caap_"]').change(this.TextAreaListener);
            $('#caap_div a[id^="caap_Switch"]').click(this.FoldingBlockListener);
            $('#caap_FillArmy').click(function (e) {
                gm.setValue("FillArmy", true);
                gm.deleteValue("ArmyCount");
                gm.deleteValue('FillArmyList');
                gm.deleteValue(caap.friendListType.giftc.name + 'Responded');
                gm.deleteValue(caap.friendListType.facebook.name + 'Responded');

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
                gm.deleteValue('AutoEliteGetList');
                gm.deleteValue('AutoEliteReqNext');
                gm.deleteValue('AutoEliteEnd');
                if (!gm.getValue('FillArmy', false)) {
                    gm.deleteValue(caap.friendListType.giftc.name + 'Requested');
                    gm.deleteValue(caap.friendListType.giftc.name + 'Responded');
                }
            });

            $('#caapRestart').click(this.RestartListener);
            $('#caap_control').mousedown(this.PauseListener);
            if (global.is_chrome) {
                $('#caap_control').mousedown(this.PauseListener);
            }

            $('#stopAutoQuest').click(function (e) {
                gm.setValue('AutoQuest', '');
                gm.setValue('WhyQuest', 'Manual');
                global.log(1, 'Change: setting stopAutoQuest and go to Manual');
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
                if (event.target.id && !event.target.id.match(/time/)) {
                    caap.SetDivContent('debug2_mess', targetStr);
                    alert(event.target.id);
                }
                */

                if ($.inArray(targetStr, caap.targetList) !== -1) {
                    global.log(9, "Refreshing DOM Listeners", event.target.id);
                    caap.waitingForDomLoad = false;
                    $('#app46755028429_globalContainer').find('a').unbind('click', caap.whatClickedURLListener);
                    $('#app46755028429_globalContainer').find('a').bind('click', caap.whatClickedURLListener);
                    $('#app46755028429_globalContainer').find("div[id*='app46755028429_friend_box_']").unbind('click', caap.whatFriendBox);
                    $('#app46755028429_globalContainer').find("div[id*='app46755028429_friend_box_']").bind('click', caap.whatFriendBox);
                    window.setTimeout(function () {
                        caap.CheckResults();
                    }, 100);
                }

                // Income timer
                if (targetStr === "gold_time_value") {
                    var payTimer = $(event.target).text().match(/([0-9]+):([0-9]+)/);
                    global.log(10, "gold_time_value", payTimer);
                    if (payTimer && payTimer.length === 3) {
                        caap.stats.gold.payTime.ticker = payTimer[0];
                        caap.stats.gold.payTime.minutes = parseInt(payTimer[1], 10);
                        caap.stats.gold.payTime.seconds = parseInt(payTimer[2], 10);
                    }
                }

                // Energy
                if (targetStr === "energy_current_value") {
                    var energy = parseInt($(event.target).text(), 10),
                        tempE  = null;

                    global.log(9, "energy_current_value", energy);
                    if (typeof energy === 'number') {
                        tempE = caap.GetStatusNumbers(energy + "/" + caap.stats.energy.max);
                        if (tempE) {
                            caap.stats.energy = tempE;
                            caap.SaveStats();
                        } else {
                            global.log(1, "Unable to get energy levels");
                        }
                    }
                }

                // Health
                if (targetStr === "health_current_value") {
                    var health = parseInt($(event.target).text(), 10),
                        tempH  = null;

                    global.log(9, "health_current_value", health);
                    if (typeof health === 'number') {
                        tempH = caap.GetStatusNumbers(health + "/" + caap.stats.health.max);
                        if (tempH) {
                            caap.stats.health = tempH;
                            caap.SaveStats();
                        } else {
                            global.log(1, "Unable to get health levels");
                        }
                    }
                }

                // Stamina
                if (targetStr === "stamina_current_value") {
                    var stamina = parseInt($(event.target).text(), 10),
                        tempS   = null;

                    global.log(9, "stamina_current_value", stamina);
                    if (typeof stamina === 'number') {
                        tempS = caap.GetStatusNumbers(stamina + "/" + caap.stats.stamina.max);
                        if (tempS) {
                            caap.stats.stamina = tempS;
                            caap.SaveStats();
                        } else {
                            global.log(1, "Unable to get stamina levels");
                        }
                    }
                }

                // Reposition the dashboard
                if (event.target.id === caap.dashboardXY.selector) {
                    caap.caapTopObject.css('left', caap.GetDashboardXY().x + 'px');
                }
            });

            $(window).unbind('resize', this.windowResizeListener);
            $(window).bind('resize', this.windowResizeListener);

            global.log(8, "Listeners added for caap_div");
            return true;
        } catch (err) {
            global.error("ERROR in AddListeners: " + err);
            return false;
        }
    },


    /////////////////////////////////////////////////////////////////////
    //                          CHECK RESULTS
    // Called each iteration of main loop, this does passive checks for
    // results to update other functions.
    /////////////////////////////////////////////////////////////////////

    SetCheckResultsFunction: function (resultsFunction) {
        this.JustDidIt('SetResultsFunctionTimer');
        gm.setValue('ResultsFunction', resultsFunction);
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
            signaturePic: 'raid_back.jpg',
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
        }
    },

    trackPerformance: false,

    performanceTimer: function (marker) {
        if (!this.trackPerformance) {
            return;
        }

        var now = (new Date().getTime());
        var elapsedTime = now - parseInt(gm.getValue('performanceTimer', 0), 10);
        global.log(1, 'Performance Timer At ' + marker + ' Time elapsed: ' + elapsedTime);
        gm.setValue('performanceTimer', now.toString());
    },

    AddExpDisplay: function () {
        try {
            var expDiv = $("#app46755028429_st_2_5 strong"),
                enlDiv = null;

            if (!expDiv.length) {
                global.log(1, "Unable to get experience array");
                return false;
            }

            enlDiv = $("#caap_enl");
            if (enlDiv.length) {
                global.log(8, "Experience to Next Level already displayed. Updating.");
                enlDiv.html(this.stats.exp.dif);
            } else {
                global.log(8, "Prepending Experience to Next Level to display");
                expDiv.prepend("(<span id='caap_enl' style='color:red'>" + (this.stats.exp.dif) + "</span>) ");
            }

            this.SetDivContent('exp_mess', "Experience to next level: " + this.stats.exp.dif);
            return true;
        } catch (err) {
            global.error("ERROR in AddExpDisplay: " + err);
            return false;
        }
    },

    CheckResults: function () {
        try {
            // Check page to see if we should go to a page specific check function
            // todo find a way to verify if a function exists, and replace the array with a check_functionName exists check
            if (!this.WhileSinceDidIt('CheckResultsTimer', 1)) {
                return false;
            }

            this.pageLoadOK = this.GetStats();

            this.AddExpDisplay();
            this.SetDivContent('level_mess', 'Expected next level: ' + this.FormatTime(new Date(this.stats.indicators.enl)));
            if (gm.getValue('DemiPointsFirst', false) && gm.getValue('WhenMonster') !== 'Never') {
                if (gm.getValue('DemiPointsDone', true)) {
                    this.SetDivContent('demipoint_mess', 'Daily Demi Points: Done');
                } else {
                    this.SetDivContent('demipoint_mess', 'Daily Demi Points: First');
                }
            } else {
                this.SetDivContent('demipoint_mess', '');
            }

            if (this.DisplayTimer('BlessingTimer')) {
                if (this.CheckTimer('BlessingTimer')) {
                    this.SetDivContent('demibless_mess', 'Demi Blessing = none');
                } else {
                    this.SetDivContent('demibless_mess', 'Next Demi Blessing: ' + this.DisplayTimer('BlessingTimer'));
                }
            }

            this.performanceTimer('Start CheckResults');
            this.JustDidIt('CheckResultsTimer');
            gm.setValue('page', '');
            gm.setValue('pageUserCheck', '');
            var pageUrl = gm.getValue('clickUrl', '');
            global.log(9, "Page url", pageUrl);
            if (pageUrl) {
                var pageUserCheck = pageUrl.match(/user=([0-9]+)/);
                global.log(6, "pageUserCheck", pageUserCheck);
                if (pageUserCheck) {
                    gm.setValue('pageUserCheck', pageUserCheck[1]);
                }
            }

            var page = 'None';
            if (pageUrl.match(new RegExp("\/[^\/]+.php", "i"))) {
                page = pageUrl.match(new RegExp("\/[^\/]+.php", "i"))[0].replace('/', '').replace('.php', '');
                global.log(9, "Page match", page);
            }

            if (this.pageList[page]) {
                if (this.CheckForImage(this.pageList[page].signaturePic)) {
                    page = gm.setValue('page', page);
                    global.log(9, "Page set value", page);
                }

                if (this.pageList[page].subpages) {
                    this.pageList[page].subpages.forEach(function (subpage) {
                        if (caap.CheckForImage(caap.pageList[subpage].signaturePic)) {
                            page = gm.setValue('page', subpage);
                            global.log(9, "Page pubpage", page);
                        }
                    });
                }
            }

            var resultsDiv = nHtml.FindByAttrContains(document.body, 'span', 'class', 'result_body');
            var resultsText = '';
            if (resultsDiv) {
                resultsText = $.trim(nHtml.GetText(resultsDiv));
            }

            if (gm.getValue('page', '')) {
                global.log(1, 'Checking results for', page);
                if (typeof this[this.pageList[page].CheckResultsFunction] === 'function') {
                    this[this.pageList[page].CheckResultsFunction](resultsText);
                } else {
                    global.log(1, 'Check Results function not found', this[this.pageList[page].CheckResultsFunction]);
                }
            } else {
                global.log(1, 'No results check defined for', page);
            }

            this.performanceTimer('Before selectMonster');
            this.selectMonster();
            this.performanceTimer('Done selectMonster');
            this.UpdateDashboard();
            this.performanceTimer('Done Dashboard');

            if (general.List.length <= 2) {
                this.last.generals = 0;
                this.last.allGenerals = 0;
                this.CheckGenerals();
            }

            // Check for new gifts
            if (gm.getValue('AutoGift', false) && !gm.getValue('HaveGift', false)) {
                if ($("a[href*='reqs.php#confirm_']").length) {
                    global.log(1, 'We have a gift waiting!');
                    gm.setValue('HaveGift', true);
                }
            }

            if (this.stats.level < 10) {
                this.battlePage = 'battle_train,battle_off';
            } else {
                this.battlePage = 'battle';
            }

            // Check for Elite Guard Add image
            if (!gm.getValue('AutoEliteIgnore', false)) {
                if (this.CheckForImage('elite_guard_add') && gm.getValue('AutoEliteEnd', 'NoArmy') !== 'NoArmy') {
                    gm.deleteValue('AutoEliteGetList');
                }
            }

            // If set and still recent, go to the function specified in 'ResultsFunction'
            var resultsFunction = gm.getValue('ResultsFunction', '');
            if ((resultsFunction) && !this.WhileSinceDidIt('SetResultsFunctionTimer', 20)) {
                this[resultsFunction](resultsText);
            }

            if (gm.getValue('NewsSummary', true)) {
                this.News();
            }

            this.performanceTimer('Done CheckResults');
            return true;
        } catch (err) {
            global.error("ERROR in CheckResults: " + err);
            return false;
        }
    },

    CheckResults_generals: function () {
        try {
            general.GetGenerals();
            this.last.generals = new Date().getTime();
            this.SaveStats();
            return true;
        } catch (err) {
            global.error("ERROR in CheckResults_generals: " + err);
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

            if (!text || typeof text !== 'string') {
                global.log(1, "No text supplied for status numbers", text);
                return false;
            }

            txtArr = text.match(/([0-9]+)\/([0-9]+)/);
            if (txtArr.length !== 3) {
                global.log(1, "Unable to match status numbers", text);
                return false;
            }

            return {
                num: parseInt(txtArr[1], 10),
                max: parseInt(txtArr[2], 10),
                dif: parseInt(txtArr[2], 10) - parseInt(txtArr[1], 10)
            };
        } catch (err) {
            global.error("ERROR in GetStatusNumbers: " + err);
            return false;
        }
    },

    last: {
        keep         : new Date(2009, 1, 1).getTime(),
        oracle       : new Date(2009, 1, 1).getTime(),
        battlerank   : new Date(2009, 1, 1).getTime(),
        warrank      : new Date(2009, 1, 1).getTime(),
        generals     : new Date(2009, 1, 1).getTime(),
        allGenerals  : new Date(2009, 1, 1).getTime(),
        achievements : new Date(2009, 1, 1).getTime(),
        battle       : new Date(2009, 1, 1).getTime(),
        symbolquests : new Date(2009, 1, 1).getTime()
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
        health : {
            num : 0,
            max : 0,
            dif : 0
        },
        stamina : {
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
                genesis   : 0
            },
            other : {
                alchemy : 0
            }
        }

    },

    LoadStats: function () {
        $.extend(this.stats, gm.getJValue('userStats'));
        $.extend(this.last, gm.getJValue('lastStats'));
        $.extend(this.demi, gm.getJValue('demiStats'));
    },

    SaveStats: function () {
        gm.setJValue('userStats', this.stats);
        gm.setJValue('lastStats', this.last);
        gm.setJValue('demiStats', this.demi);
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
                levelArray     = [],
                newLevel       = 0,
                armyArray      = [],
                pointsArray    = [],
                xS             = 0,
                xE             = 0;

            global.log(8, "Getting Gold, Energy, Health, Stamina and Experience");
            // gold
            cashDiv = $("#app46755028429_gold_current_value");
            if (cashDiv.length) {
                global.log(8, 'Getting current cash value');
                temp = this.NumberOnly(cashDiv.text());
                if (!isNaN(temp)) {
                    this.stats.gold.cash = temp;
                    this.stats.gold.total = this.stats.gold.bank + this.stats.gold.cash;
                } else {
                    global.log(1, "Cash value is not a number");
                    passed = false;
                }
            } else {
                global.log(1, "Unable to get cashDiv");
                passed = false;
            }

            // energy
            energyDiv = $("#app46755028429_st_2_2");
            if (energyDiv.length) {
                global.log(8, 'Getting current energy levels');
                temp = this.GetStatusNumbers(energyDiv.text());
                if (temp) {
                    this.stats.energy = temp;
                } else {
                    global.log(1, "Unable to get energy levels");
                    passed = false;
                }
            } else {
                global.log(1, "Unable to get energyDiv");
                passed = false;
            }

            // health
            healthDiv = $("#app46755028429_st_2_3");
            if (healthDiv.length) {
                global.log(8, 'Getting current health levels');
                temp = this.GetStatusNumbers(healthDiv.text());
                if (temp) {
                    this.stats.health = temp;
                } else {
                    global.log(1, "Unable to get health levels");
                    passed = false;
                }
            } else {
                global.log(1, "Unable to get healthDiv");
                passed = false;
            }

            // stamina
            staminaDiv = $("#app46755028429_st_2_4");
            if (staminaDiv.length) {
                global.log(8, 'Getting current stamina values');
                temp = this.GetStatusNumbers(staminaDiv.text());
                if (temp) {
                    this.stats.stamina = temp;
                } else {
                    global.log(1, "Unable to get stamina values");
                    passed = false;
                }
            } else {
                global.log(1, "Unable to get staminaDiv");
                passed = false;
            }

            // experience
            expDiv = $("#app46755028429_st_2_5");
            if (expDiv.length) {
                global.log(8, 'Getting current experience values');
                temp = this.GetStatusNumbers(expDiv.text());
                if (temp) {
                    this.stats.exp = temp;
                } else {
                    global.log(1, "Unable to get experience values");
                    passed = false;
                }
            } else {
                global.log(1, "Unable to get expDiv");
                passed = false;
            }

            // level
            levelDiv = $("#app46755028429_st_5");
            if (levelDiv.length) {
                levelArray = levelDiv.text().match(/Level: ([0-9]+)!/);
                if (levelArray && levelArray.length === 2) {
                    global.log(8, 'Getting current level');
                    newLevel = parseInt(levelArray[1], 10);
                    if (newLevel > this.stats.level) {
                        global.log(1, 'New level. Resetting Best Land Cost.');
                        gm.deleteValue('BestLandCost');
                        this.stats.level = newLevel;
                    }
                } else {
                    global.log(1, 'levelArray incorrect');
                    passed = false;
                }
            } else {
                global.log(1, "Unable to get levelDiv");
                passed = false;
            }

            // army
            armyDiv = $("#app46755028429_main_bntp a[href*='army.php']");
            if (armyDiv.length) {
                armyArray = armyDiv.text().match(/My Army \(([0-9]+)\)/);
                if (armyArray && armyArray.length === 2) {
                    global.log(8, 'Getting current army count');
                    this.stats.army.actual = parseInt(armyArray[1], 10);
                    temp = Math.min(this.stats.army.actual, 501);
                    if (temp >= 0 && temp <= 501) {
                        this.stats.army.capped = temp;
                    } else {
                        global.log(1, "Army count not in limits");
                        passed = false;
                    }
                } else {
                    global.log(1, 'armyArray incorrect');
                    passed = false;
                }
            } else {
                global.log(1, "Unable to get armyDiv");
                passed = false;
            }

            // upgrade points
            pointsDiv = $("#app46755028429_main_bntp a[href*='keep.php']");
            if (pointsDiv.length) {
                pointsArray = pointsDiv.text().match(/My Stats \(\+([0-9]+)\)/);
                if (pointsArray && pointsArray.length === 2) {
                    global.log(8, 'Getting current upgrade points');
                    this.stats.points.skill = parseInt(pointsArray[1], 10);
                } else {
                    global.log(8, 'No upgrade points found');
                    this.stats.points.skill = 0;
                }
            } else {
                global.log(1, "Unable to get pointsDiv");
                passed = false;
            }

            // Indicators: Hours To Level, Time Remaining To Level and Expected Next Level
            if (this.stats.exp) {
                global.log(8, 'Calculating time to next level');
                xS = gm.getNumber("expStaminaRatio", 2.4);
                xE = parseFloat(gm.getObjVal('AutoQuest', 'expRatio')) || gm.getNumber("expEnergyRatio", 1.4);
                this.stats.indicators.htl = ((this.stats.level * 12.5) - (this.stats.stamina.max * xS) - (this.stats.energy.max * xE)) / (12 * (xS + xE));
                this.stats.indicators.hrtl = (this.stats.exp.dif - (this.stats.stamina.num * xS) - (this.stats.energy.num * xE)) / (12 * (xS + xE));
                this.stats.indicators.enl = new Date().getTime() + Math.ceil(this.stats.indicators.hrtl * 60 * 60 * 1000);
            } else {
                global.log(1, 'Could not calculate time to next level. Missing experience stats!');
                passed = false;
            }

            if (!passed)  {
                global.log(8, 'Saving stats');
                this.SaveStats();
            }

            if (passed && this.stats.energy.max === 0 && this.stats.health.max === 0 && this.stats.stamina.max === 0) {
                global.alert("Paused as this account may have been disabled!");
                global.log(1, "Paused as this account may have been disabled!", this.stats);
                this.PauseListener();
            }

            global.log(2, "Stats", this.stats, this.last);
            return passed;
        } catch (err) {
            global.error("ERROR GetStats: " + err);
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
                attack         = null,
                defense        = null;

            if ($(".keep_attribute_section").length) {
                global.log(8, "Getting new values from player keep");
                // rank
                rankImg = $("img[src*='gif/rank']");
                if (rankImg.length) {
                    rankImg = rankImg.attr("src").split('/');
                    this.stats.rank.battle = parseInt((rankImg[rankImg.length - 1].match(/rank([0-9]+)\.gif/))[1], 10);
                } else {
                    global.log(1, 'Using stored rank.');
                }

                // war rank
                warRankImg = $("img[src*='war_rank_']");
                if (warRankImg.length) {
                    warRankImg = warRankImg.attr("src").split('/');
                    this.stats.rank.war = parseInt((warRankImg[warRankImg.length - 1].match(/war_rank_([0-9]+)\.gif/))[1], 10);
                } else {
                    global.log(1, 'Using stored warRank.');
                }

                // PlayerName
                playerName = $(".keep_stat_title_inc");
                if (playerName.length) {
                    this.stats.PlayerName = playerName.text().match(new RegExp("\"(.+)\","))[1];
                } else {
                    global.log(1, 'Using stored PlayerName.');
                }

                // Attack
                attack = $(".attribute_stat_container:eq(2)");
                if (attack.length) {
                    this.stats.attack = parseInt(attack.text().match(new RegExp("\\s*([0-9]+).*"))[1], 10);
                } else {
                    global.log(1, 'Using stored attack value.');
                }

                // Defense
                defense = $(".attribute_stat_container:eq(3)");
                if (defense.length) {
                    this.stats.defense = parseInt(defense.text().match(new RegExp("\\s*([0-9]+).*"))[1], 10);
                } else {
                    global.log(1, 'Using stored defense value.');
                }

                // Check for Gold Stored
                moneyStored = $(".statsTB .money");
                if (moneyStored.length) {
                    this.stats.gold.bank = this.NumberOnly(moneyStored.text());
                    this.stats.gold.total = this.stats.gold.bank + this.stats.gold.cash;
                } else {
                    global.log(1, 'Using stored inStore.');
                }

                // Check for income
                income = $(".statsTB .positive:first");
                if (income.length) {
                    this.stats.gold.income = this.NumberOnly(income.text());
                } else {
                    global.log(1, 'Using stored income.');
                }

                // Check for upkeep
                upkeep = $(".statsTB .negative");
                if (upkeep.length) {
                    this.stats.gold.upkeep = this.NumberOnly(upkeep.text());
                } else {
                    global.log(1, 'Using stored upkeep.');
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
                    global.log(1, 'Using stored other.');
                }

                // Battles/Wars Won
                otherStats = $(".statsTB .keepTable1 tr:eq(1) td:last");
                if (otherStats.length) {
                    this.stats.other.bww = parseInt(otherStats.text(), 10);
                } else {
                    global.log(1, 'Using stored other.');
                }

                // Battles/Wars Lost
                otherStats = $(".statsTB .keepTable1 tr:eq(2) td:last");
                if (otherStats.length) {
                    this.stats.other.bwl = parseInt(otherStats.text(), 10);
                } else {
                    global.log(1, 'Using stored other.');
                }

                // Times eliminated
                otherStats = $(".statsTB .keepTable1 tr:eq(3) td:last");
                if (otherStats.length) {
                    this.stats.other.te = parseInt(otherStats.text(), 10);
                } else {
                    global.log(1, 'Using stored other.');
                }

                // Times you eliminated an enemy
                otherStats = $(".statsTB .keepTable1 tr:eq(4) td:last");
                if (otherStats.length) {
                    this.stats.other.tee = parseInt(otherStats.text(), 10);
                } else {
                    global.log(1, 'Using stored other.');
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
                this.stats.indicators.bsi = (this.stats.attack + this.stats.defense) / this.stats.level;
                this.stats.indicators.lsi = (this.stats.energy.max + (2 * this.stats.stamina.max)) / this.stats.level;
                this.stats.indicators.sppl = (this.stats.energy.max + (2 * this.stats.stamina.max) + this.stats.attack + this.stats.defense + this.stats.health.max - 122) / this.stats.level;
                this.stats.indicators.api = (this.stats.attack + (this.stats.defense * 0.7));
                this.stats.indicators.dpi = (this.stats.defense + (this.stats.attack * 0.7));
                this.stats.indicators.mpi = ((this.stats.indicators.api + this.stats.indicators.dpi) / 2);
                this.last.keep = new Date().getTime();
                global.log(2, "Stats", this.stats, this.last);
                this.SaveStats();
            } else {
                global.log(1, "On another player's keep", $("a[href*='keep.php?user=']").attr("href").match(/user=([0-9]+)/)[1]);
            }

            return true;
        } catch (err) {
            global.error("ERROR in CheckResults_keep: " + err);
            return false;
        }
    },

    CheckResults_oracle: function () {
        try {
            var favorDiv = null,
                text     = '',
                temp     = [];

            favorDiv = $(".title_action");
            if (favorDiv.length) {
                text = favorDiv.text();
                temp = text.match(new RegExp("\\s*You have zero favor points!\\s*"));
                if (temp && temp.length === 1) {
                    global.log(1, 'Got number of Favor Points.');
                    this.stats.points.favor = 0;
                } else {
                    temp = text.match(new RegExp("\\s*You have a favor point!\\s*"));
                    if (temp && temp.length === 1) {
                        global.log(1, 'Got number of Favor Points.');
                        this.stats.points.favor = 1;
                    } else {
                        temp = text.match(new RegExp("\\s*You have ([0-9]+) favor points!\\s*"));
                        if (temp && temp.length === 2) {
                            global.log(1, 'Got number of Favor Points.');
                            this.stats.points.favor = parseInt(temp[1], 10);
                        } else {
                            global.log(1, 'Favor Points RegExp not matched.');
                            this.stats.points.favor = 0;
                        }
                    }
                }
            } else {
                global.log(1, 'Favor Points div not found.');
                this.stats.points.favor = 0;
            }

            this.last.oracle = new Date().getTime();
            this.SaveStats();
            global.log(2, "Stats", this.stats, this.last);
            return true;
        } catch (err) {
            global.error("ERROR in CheckResults_oracle: " + err);
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
                    global.log(1, 'Got Battle Rank Points.');
                    this.stats.rank.battlePoints = this.NumberOnly(temp[1]);
                } else {
                    global.log(1, 'Battle Rank Points RegExp not matched.');
                    this.stats.rank.battlePoints = 0;
                }
            } else {
                global.log(1, 'Battle Rank Points div not found.');
                this.stats.rank.battlePoints = 0;
            }

            this.last.battlerank = new Date().getTime();
            this.SaveStats();
            global.log(2, "Stats", this.stats, this.last);
            return true;
        } catch (err) {
            global.error("ERROR in CheckResults_battlerank: " + err);
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
                    global.log(1, 'Got War Rank Points.');
                    this.stats.rank.warPoints = this.NumberOnly(temp[1]);
                } else {
                    global.log(1, 'War Rank Points RegExp not matched.');
                    this.stats.rank.warPoints = 0;
                }
            } else {
                global.log(1, 'War Rank Points div not found.');
                this.stats.rank.warPoints = 0;
            }

            this.last.warrank = new Date().getTime();
            this.SaveStats();
            global.log(2, "Stats", this.stats, this.last);
            return true;
        } catch (err) {
            global.error("ERROR in CheckResults_war_rank: " + err);
            return false;
        }
    },

    CheckResults_achievements: function () {
        try {
            var achDiv = null,
                tdDiv  = null,
                text     = '',
                temp     = [];

            achDiv = $("#app46755028429_achievements_2");
            if (achDiv && achDiv.length) {
                tdDiv = achDiv.find("td div");
                if (tdDiv && tdDiv.length === 6) {
                    this.stats.achievements.battle.invasions.won = this.NumberOnly(tdDiv.eq(0).text());
                    this.stats.achievements.battle.duels.won = this.NumberOnly(tdDiv.eq(1).text());
                    this.stats.achievements.battle.invasions.lost = this.NumberOnly(tdDiv.eq(2).text());
                    this.stats.achievements.battle.duels.lost = this.NumberOnly(tdDiv.eq(3).text());
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
                }
            } else {
                global.log(1, 'Battle Achievements not found.');
            }

            achDiv = $("#app46755028429_achievements_3");
            if (achDiv && achDiv.length) {
                tdDiv = achDiv.find("td div");
                if (tdDiv && tdDiv.length === 11) {
                    this.stats.achievements.monster.gildamesh = this.NumberOnly(tdDiv.eq(0).text());
                    this.stats.achievements.monster.lotus = this.NumberOnly(tdDiv.eq(1).text());
                    this.stats.achievements.monster.colossus = this.NumberOnly(tdDiv.eq(2).text());
                    this.stats.achievements.monster.dragons = this.NumberOnly(tdDiv.eq(3).text());
                    this.stats.achievements.monster.sylvanas = this.NumberOnly(tdDiv.eq(4).text());
                    this.stats.achievements.monster.cronus = this.NumberOnly(tdDiv.eq(5).text());
                    this.stats.achievements.monster.keira = this.NumberOnly(tdDiv.eq(6).text());
                    this.stats.achievements.monster.sieges = this.NumberOnly(tdDiv.eq(7).text());
                    this.stats.achievements.monster.legion = this.NumberOnly(tdDiv.eq(8).text());
                    this.stats.achievements.monster.genesis = this.NumberOnly(tdDiv.eq(9).text());
                    this.stats.achievements.monster.skaar = this.NumberOnly(tdDiv.eq(10).text());
                }
            } else {
                global.log(1, 'Monster Achievements not found.');
            }

            achDiv = $("#app46755028429_achievements_4");
            if (achDiv && achDiv.length) {
                tdDiv = achDiv.find("td div");
                if (tdDiv && tdDiv.length === 1) {
                    this.stats.achievements.other.alchemy = this.NumberOnly(tdDiv.eq(0).text());
                }
            } else {
                global.log(1, 'Other Achievements not found.');
            }

            this.last.achievements = new Date().getTime();
            this.SaveStats();
            global.log(2, "Stats", this.stats, this.last);
            return true;
        } catch (err) {
            global.error("ERROR in CheckResults_achievements: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          QUESTING
    // Quest function does action, DrawQuest sets up the page and gathers info
    /////////////////////////////////////////////////////////////////////

    MaxEnergyQuest: function () {
        if (!gm.getValue('MaxIdleEnergy', 0)) {
            global.log(1, "Changing to idle general to get Max energy");
            return this.PassiveGeneral();
        }

        if (this.stats.energy.num >= gm.getValue('MaxIdleEnergy')) {
            return this.Quests();
        }

        return false;
    },

    baseQuestTable : {
        'Land of Fire'      : 'land_fire',
        'Land of Earth'     : 'land_earth',
        'Land of Mist'      : 'land_mist',
        'Land of Water'     : 'land_water',
        'Demon Realm'       : 'land_demon_realm',
        'Undead Realm'      : 'land_undead_realm',
        'Underworld'        : 'tab_underworld',
        'Kingdom of Heaven' : 'tab_heaven',
        'Ivory City'        : 'tab_ivory'
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
            if (gm.getValue('storeRetrieve', '') !== '') {
                if (gm.getValue('storeRetrieve') === 'general') {
                    if (general.Select('BuyGeneral')) {
                        return true;
                    }

                    gm.setValue('storeRetrieve', '');
                    return true;
                } else {
                    return this.RetrieveFromBank(gm.getValue('storeRetrieve', ''));
                }
            }

            this.SetDivContent('quest_mess', '');
            if (gm.getValue('WhenQuest', '') === 'Never') {
                this.SetDivContent('quest_mess', 'Questing off');
                return false;
            }

            if (gm.getValue('WhenQuest', '') === 'Not Fortifying') {
                var maxHealthtoQuest = gm.getNumber('MaxHealthtoQuest', 0);
                if (!maxHealthtoQuest) {
                    this.SetDivContent('quest_mess', '<b>No valid over fortify %</b>');
                    return false;
                }

                var fortMon = gm.getValue('targetFromfortify', '');
                if (fortMon) {
                    this.SetDivContent('quest_mess', 'No questing until attack target ' + fortMon + " health exceeds " + gm.getNumber('MaxToFortify', 0) + '%');
                    return false;
                }

                var targetFrombattle_monster = gm.getValue('targetFrombattle_monster', '');
                if (!targetFrombattle_monster) {
                    var targetFort = gm.getListObjVal('monsterOl', targetFrombattle_monster, 'ShipHealth');
                    if (!targetFort) {
                        if (targetFort < maxHealthtoQuest) {
                            this.SetDivContent('quest_mess', 'No questing until fortify target ' + targetFrombattle_monster + ' health exceeds ' + maxHealthtoQuest + '%');
                            return false;
                        }
                    }
                }
            }

            if (!gm.getObjVal('AutoQuest', 'name')) {
                if (gm.getValue('WhyQuest', '') === 'Manual') {
                    this.SetDivContent('quest_mess', 'Pick quest manually.');
                    return false;
                }

                this.SetDivContent('quest_mess', 'Searching for quest.');
                global.log(1, "Searching for quest");
            } else {
                var energyCheck = this.CheckEnergy(gm.getObjVal('AutoQuest', 'energy'), gm.getValue('WhenQuest', 'Never'), 'quest_mess');
                if (!energyCheck) {
                    return false;
                }
            }

            if (gm.getObjVal('AutoQuest', 'general') === 'none' || gm.getValue('ForceSubGeneral')) {
                if (general.Select('SubQuestGeneral')) {
                    return true;
                }
            }

            if (gm.getValue('LevelUpGeneral', 'Use Current') !== 'Use Current' &&
                    gm.getValue('QuestLevelUpGeneral', false) &&
                    this.stats.exp.dif &&
                    this.stats.exp.dif <= gm.getValue('LevelUpGeneralExp', 0)) {
                if (general.Select('LevelUpGeneral')) {
                    return true;
                }

                global.log(1, 'Using level up general');
            }

            switch (gm.getValue('QuestArea', 'Quest')) {
            case 'Quest' :
                //var stageSet0 = $("#app46755028429_stage_set_0").css("display") === 'block' ? true : false;
                //var stageSet1 = $("#app46755028429_stage_set_1").css("display") === 'block' ? true : false;
                var subQArea = gm.getValue('QuestSubArea', 'Land of Fire');
                var landPic = this.baseQuestTable[subQArea];
                var imgExist = false;
                if (landPic === 'tab_underworld' || landPic === 'tab_ivory') {
                    imgExist = this.NavigateTo('quests,jobs_tab_more.gif,' + landPic + '_small.gif', landPic + '_big');
                } else if (landPic === 'tab_heaven') {
                    imgExist = this.NavigateTo('quests,jobs_tab_more.gif,' + landPic + '_small2.gif', landPic + '_big2.gif');
                } else if ((landPic === 'land_demon_realm') || (landPic === 'land_undead_realm')) {
                    imgExist = this.NavigateTo('quests,jobs_tab_more.gif,' + landPic + '.gif', landPic + '_sel');
                } else {
                    imgExist = this.NavigateTo('quests,jobs_tab_back.gif,' + landPic + '.gif', landPic + '_sel');
                }

                if (imgExist) {
                    return true;
                }

                break;
            case 'Demi Quests' :
                if (this.NavigateTo('quests,symbolquests', 'demi_quest_on.gif')) {
                    return true;
                }

                var subDQArea = gm.getValue('QuestSubArea', 'Ambrosia');
                var picSlice = nHtml.FindByAttrContains(document.body, 'img', 'src', 'deity_' + this.demiQuestTable[subDQArea]);
                if (picSlice.style.height !== '160px') {
                    return this.NavigateTo('deity_' + this.demiQuestTable[subDQArea]);
                }

                break;
            case 'Atlantis' :
                if (!this.CheckForImage('tab_atlantis_on.gif')) {
                    return this.NavigateTo('quests,monster_quests');
                }

                break;
            default :
            }

            var button = this.CheckForImage('quick_switch_button.gif');
            if (button && !gm.getValue('ForceSubGeneral', false)) {
                if (gm.getValue('LevelUpGeneral', 'Use Current') !== 'Use Current' &&
                    gm.getValue('QuestLevelUpGeneral', false) &&
                    this.stats.exp.dif &&
                    this.stats.exp.dif <= gm.getValue('LevelUpGeneralExp', 0)) {
                    if (general.Select('LevelUpGeneral')) {
                        return true;
                    }
                    global.log(1, 'Using level up general');
                } else {
                    global.log(1, 'Clicking on quick switch general button.');
                    this.Click(button);
                    return true;
                }
            }

            var costToBuy = '';
            //Buy quest requires popup
            var itemBuyPopUp = nHtml.FindByAttrContains(document.body, "form", "id", 'itemBuy');
            if (itemBuyPopUp) {
                gm.setValue('storeRetrieve', 'general');
                if (general.Select('BuyGeneral')) {
                    return true;
                }

                gm.setValue('storeRetrieve', '');
                costToBuy = itemBuyPopUp.textContent.replace(new RegExp(".*\\$"), '').replace(new RegExp("[^0-9]{3,}.*"), '');
                global.log(1, "costToBuy", costToBuy);
                if (this.stats.gold.cash < costToBuy) {
                    //Retrieving from Bank
                    if (this.stats.gold.cash + (this.stats.gold.bank - gm.getNumber('minInStore', 0)) >= costToBuy) {
                        global.log(1, "Trying to retrieve", costToBuy - this.stats.gold.cash);
                        gm.setValue("storeRetrieve", costToBuy - this.stats.gold.cash);
                        return this.RetrieveFromBank(costToBuy - this.stats.gold.cash);
                    } else {
                        gm.setValue('AutoQuest', '');
                        gm.setValue('WhyQuest', 'Manual');
                        global.log(1, "Cant buy requires, stopping quest");
                        this.ManualAutoQuest();
                        return false;
                    }
                }

                button = this.CheckForImage('quick_buy_button.jpg');
                if (button) {
                    global.log(1, 'Clicking on quick buy button.');
                    this.Click(button);
                    return true;
                }

                global.log(1, "Cant find buy button");
                return false;
            }

            button = this.CheckForImage('quick_buy_button.jpg');
            if (button) {
                gm.setValue('storeRetrieve', 'general');
                if (general.Select('BuyGeneral')) {
                    return true;
                }

                gm.setValue('storeRetrieve', '');
                costToBuy = button.previousElementSibling.previousElementSibling.previousElementSibling
                    .previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling
                    .firstChild.data.replace(new RegExp("[^0-9]", "g"), '');
                global.log(1, "costToBuy", costToBuy);
                if (this.stats.gold.cash < costToBuy) {
                    //Retrieving from Bank
                    if (this.stats.gold.cash + (this.stats.gold.bank - gm.getNumber('minInStore', 0)) >= costToBuy) {
                        global.log(1, "Trying to retrieve", costToBuy - this.stats.gold.cash);
                        gm.setValue("storeRetrieve", costToBuy - this.stats.gold.cash);
                        return this.RetrieveFromBank(costToBuy - this.stats.gold.cash);
                    } else {
                        gm.setValue('AutoQuest', '');
                        gm.setValue('WhyQuest', 'Manual');
                        global.log(1, "Cant buy General, stopping quest");
                        this.ManualAutoQuest();
                        return false;
                    }
                }

                global.log(1, 'Clicking on quick buy general button.');
                this.Click(button);
                return true;
            }

            var autoQuestDivs = this.CheckResults_quests(true);
            if (!gm.getObjVal('AutoQuest', 'name')) {
                global.log(1, 'Could not find AutoQuest.');
                this.SetDivContent('quest_mess', 'Could not find AutoQuest.');
                return false;
            }

            var autoQuestName = gm.getObjVal('AutoQuest', 'name');
            if (gm.getObjVal('AutoQuest', 'name') !== autoQuestName) {
                global.log(1, 'New AutoQuest found.');
                this.SetDivContent('quest_mess', 'New AutoQuest found.');
                return true;
            }

            // if found missing requires, click to buy
            if (autoQuestDivs.tr !== undefined) {
                if (gm.getValue('QuestSubArea', 'Atlantis') === 'Atlantis') {
                    gm.setValue('AutoQuest', '');
                    gm.setValue('WhyQuest', 'Manual');
                    global.log(1, "Cant buy Atlantis items, stopping quest");
                    this.ManualAutoQuest();
                    return false;
                }

                var background = nHtml.FindByAttrContains(autoQuestDivs.tr, "div", "style", 'background-color');
                if (background) {
                    if (background.style.backgroundColor === 'rgb(158, 11, 15)') {
                        global.log(1, " background.style.backgroundColor", background.style.backgroundColor);
                        gm.setValue('storeRetrieve', 'general');
                        if (general.Select('BuyGeneral')) {
                            return true;
                        }

                        gm.setValue('storeRetrieve', '');
                        if (background.firstChild.firstChild.title) {
                            global.log(1, "Clicking to buy", background.firstChild.firstChild.title);
                            this.Click(background.firstChild.firstChild);
                            return true;
                        }
                    }
                }
            } else {
                global.log(1, 'Can not buy quest item');
                return false;
            }

            var questGeneral = gm.getObjVal('AutoQuest', 'general');
            if (questGeneral === 'none' || gm.getValue('ForceSubGeneral', false)) {
                if (general.Select('SubQuestGeneral')) {
                    return true;
                }
            } else if ((questGeneral) && questGeneral !== general.GetCurrent()) {
                if (gm.getValue('LevelUpGeneral', 'Use Current') !== 'Use Current' &&
                        gm.getValue('QuestLevelUpGeneral', false) && this.stats.exp.dif &&
                        this.stats.exp.dif <= gm.getValue('LevelUpGeneralExp', 0)) {
                    if (general.Select('LevelUpGeneral')) {
                        return true;
                    }

                    global.log(1, 'Using level up general');
                } else {
                    if (autoQuestDivs.genDiv !== undefined) {
                        global.log(1, 'Clicking on general', questGeneral);
                        this.Click(autoQuestDivs.genDiv);
                        return true;
                    } else {
                        global.log(1, 'Can not click on general', questGeneral);
                        return false;
                    }
                }
            }

            if (autoQuestDivs.click !== undefined) {
                global.log(1, 'Clicking auto quest', autoQuestName);
                gm.setValue('ReleaseControl', true);
                this.Click(autoQuestDivs.click, 10000);
                //global.log(1, "Quests: " + autoQuestName + " (energy: " + gm.getObjVal('AutoQuest', 'energy') + ")");
                this.ShowAutoQuest();
                return true;
            } else {
                global.log(1, 'Can not click auto quest', autoQuestName);
                return false;
            }
        } catch (err) {
            global.error("ERROR in Quests: " + err);
            return false;
        }
    },

    questName: null,

    QuestManually: function () {
        global.log(1, "QuestManually: Setting manual quest options");
        gm.setValue('AutoQuest', '');
        gm.setValue('WhyQuest', 'Manual');
        this.ManualAutoQuest();
    },

    UpdateQuestGUI: function () {
        global.log(1, "UpdateQuestGUI: Setting drop down menus");
        this.SelectDropOption('QuestArea', gm.getValue('QuestArea'));
        this.SelectDropOption('QuestSubArea', gm.getValue('QuestSubArea'));
    },

    CheckResults_symbolquests: function () {
        try {
            var demiDiv = null,
                points  = [],
                success = true;

            demiDiv = $("div[id*='app46755028429_symbol_desc_symbolquests']");
            if (demiDiv && demiDiv.length === 5) {
                demiDiv.each(function (index) {
                    var temp = caap.NumberOnly($(this).children().next().eq(1).children().children().next().text());
                    if (temp && typeof temp === 'number') {
                        points.push(temp);
                    } else {
                        success = false;
                        global.log(1, 'Demi-Power temp text problem', temp);
                    }
                });

                global.log(2, 'Points', points);
                if (success) {
                    this.demi.ambrosia.power.total = points[0];
                    this.demi.malekus.power.total = points[1];
                    this.demi.corvintheus.power.total = points[2];
                    this.demi.aurora.power.total = points[3];
                    this.demi.azeron.power.total = points[4];
                    this.last.symbolquests = new Date().getTime();
                    this.SaveStats();
                    global.log(1, 'Demi', this.demi, this.last);
                }
            } else {
                global.log(1, "Demi demiDiv problem", demiDiv);
            }

            return true;
        } catch (err) {
            global.error("ERROR in CheckResults_symbolquests: " + err);
            return false;
        }
    },

    CheckResults_quests: function (pickQuestTF) {
        try {
            var whyQuest = gm.getValue('WhyQuest', '');
            if (pickQuestTF === true && whyQuest !== 'Manual') {
                gm.setValue('AutoQuest', '');
            }

            var bestReward  = 0,
                rewardRatio = 0,
                div         = document.body,
                ss          = null,
                s           = 0;

            if (this.CheckForImage('demi_quest_on.gif')) {
                this.CheckResults_symbolquests();
                ss = document.evaluate(".//div[contains(@id,'symbol_displaysymbolquest')]",
                    div, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                if (ss.snapshotLength <= 0) {
                    global.log(1, "Failed to find symbol_displaysymbolquest");
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
                global.log(1, "Failed to find quests_background");
                return false;
            }

            var bossList = [
                    "Heart of Fire",
                    "Gift of Earth",
                    "Eye of the Storm",
                    "A Look into the Darkness",
                    "The Rift",
                    "Undead Embrace",
                    "Confrontation",
                    "Archangels Wrath",
                    "Entrance to the Throne"
                ],
                haveOrb  = false;

            if (nHtml.FindByAttrContains(div, 'input', 'src', 'alchemy_summon')) {
                haveOrb = true;
                if (bossList.indexOf(gm.getObjVal('AutoQuest', 'name')) >= 0 && gm.getValue('GetOrbs', false) && whyQuest !== 'Manual') {
                    gm.setValue('AutoQuest', '');
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
                    experience = this.NumberOnly(expM[1]);
                } else {
                    var expObj = nHtml.FindByAttr(div, 'div', 'className', 'quest_experience');
                    if (expObj) {
                        experience = (this.NumberOnly(nHtml.GetText(expObj)));
                    } else {
                        global.log(1, "Can't find experience for", this.questName);
                    }
                }

                var idx = this.questName.indexOf('<br>');
                if (idx >= 0) {
                    this.questName = this.questName.substring(0, idx);
                }

                var energyM = divTxt.match(new RegExp("([0-9]+)\\s+energy", "i"));
                if (energyM && energyM.length === 2) {
                    energy = this.NumberOnly(energyM[1]);
                } else {
                    var eObj = nHtml.FindByAttrContains(div, 'div', 'className', 'quest_req');
                    if (eObj) {
                        energy = eObj.getElementsByTagName('b')[0];
                    }
                }

                if (!energy) {
                    global.log(1, "Can't find energy for", this.questName);
                    continue;
                }

                var moneyM     = this.RemoveHtmlJunk(divTxt).match(new RegExp("\\$([0-9,]+)\\s*-\\s*\\$([0-9,]+)", "i")),
                    rewardLow  = 0,
                    rewardHigh = 0;

                if (moneyM && moneyM.length === 3) {
                    rewardLow  = this.NumberOnly(moneyM[1]);
                    rewardHigh = this.NumberOnly(moneyM[2]);
                    reward = (rewardLow + rewardHigh) / 2;
                } else {
                    moneyM = this.RemoveHtmlJunk(divTxt).match(new RegExp("\\$([0-9,]+)mil\\s*-\\s*\\$([0-9,]+)mil", "i"));
                    if (moneyM && moneyM.length === 3) {
                        rewardLow  = this.NumberOnly(moneyM[1]) * 1000000;
                        rewardHigh = this.NumberOnly(moneyM[2]) * 1000000;
                        reward = (rewardLow + rewardHigh) / 2;
                    } else {
                        global.log(1, 'No money found for', this.questName, divTxt);
                    }
                }

                var click = nHtml.FindByAttr(div, "input", "name", /^Do/);
                if (!click) {
                    global.log(1, 'No button found for', this.questName);
                    continue;
                }

                var influence = null;
                if (bossList.indexOf(this.questName) >= 0) {
                    if (nHtml.FindByClassName(document.body, 'div', 'quests_background_sub')) {
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
                        global.log(1, "Influence div not found.", influenceList);
                    }
                }

                if (!influence) {
                    global.log(1, 'No influence found for', this.questName, divTxt);
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
                    global.log(1, "Adding Quest Labels and Listeners");
                }

                this.LabelQuests(div, energy, reward, experience, click);
                //global.log(1, gm.getValue('QuestSubArea', 'Atlantis'));
                if (this.CheckCurrentQuestArea(gm.getValue('QuestSubArea', 'Atlantis'))) {
                    if (gm.getValue('GetOrbs', false) && questType === 'boss' && whyQuest !== 'Manual') {
                        if (!haveOrb) {
                            gm.setObjVal('AutoQuest', 'name', this.questName);
                            pickQuestTF = true;
                        }
                    }

                    switch (whyQuest) {
                    case 'Advancement' :
                        if (influence) {
                            if (!gm.getObjVal('AutoQuest', 'name') && questType === 'primary' && this.NumberOnly(influence) < 100) {
                                gm.setObjVal('AutoQuest', 'name', this.questName);
                                pickQuestTF = true;
                            }
                        } else {
                            global.log(1, "Can't find influence for", this.questName, influence);
                        }

                        break;
                    case 'Max Influence' :
                        if (influence) {
                            if (!gm.getObjVal('AutoQuest', 'name') && this.NumberOnly(influence) < 100) {
                                gm.setObjVal('AutoQuest', 'name', this.questName);
                                pickQuestTF = true;
                            }
                        } else {
                            global.log(1, "Can't find influence for", this.questName, influence);
                        }

                        break;
                    case 'Max Experience' :
                        rewardRatio = (Math.floor(experience / energy * 100) / 100);
                        if (bestReward < rewardRatio) {
                            gm.setObjVal('AutoQuest', 'name', this.questName);
                            pickQuestTF = true;
                        }

                        break;
                    case 'Max Gold' :
                        rewardRatio = (Math.floor(reward / energy * 10) / 10);
                        if (bestReward < rewardRatio) {
                            gm.setObjVal('AutoQuest', 'name', this.questName);
                            pickQuestTF = true;
                        }

                        break;
                    default :
                    }

                    if (gm.getObjVal('AutoQuest', 'name') === this.questName) {
                        bestReward = rewardRatio;
                        var expRatio = experience / energy;
                        global.log(1, "Setting AutoQuest", this.questName);
                        gm.setValue('AutoQuest', 'name' + global.ls + this.questName + global.vs + 'energy' + global.ls + energy + global.vs + 'general' + global.ls + general + global.vs + 'expRatio' + global.ls + expRatio);
                        global.log(9, "CheckResults_quests", gm.getValue('AutoQuest'));
                        this.ShowAutoQuest();
                        autoQuestDivs.click  = click;
                        autoQuestDivs.tr     = div;
                        autoQuestDivs.genDiv = genDiv;
                    }
                }
            }

            if (pickQuestTF) {
                if (gm.getObjVal('AutoQuest', 'name')) {
                    global.log(9, "CheckResults_quests(pickQuestTF)", gm.getValue('AutoQuest'));
                    this.ShowAutoQuest();
                    return autoQuestDivs;
                }

                //if not find quest, probably you already maxed the subarea, try another area
                if ((whyQuest === 'Max Influence' || whyQuest === 'Advancement') && gm.getValue('switchQuestArea', false)) {
                    global.log(9, "QuestSubArea", gm.getValue('QuestSubArea'));
                    switch (gm.getValue('QuestSubArea')) {
                    case 'Land of Fire':
                        gm.setValue('QuestSubArea', 'Land of Earth');
                        break;
                    case 'Land of Earth':
                        gm.setValue('QuestSubArea', 'Land of Mist');
                        break;
                    case 'Land of Mist':
                        gm.setValue('QuestSubArea', 'Land of Water');
                        break;
                    case 'Land of Water':
                        gm.setValue('QuestSubArea', 'Demon Realm');
                        break;
                    case 'Demon Realm':
                        gm.setValue('QuestSubArea', 'Undead Realm');
                        break;
                    case 'Undead Realm':
                        gm.setValue('QuestSubArea', 'Underworld');
                        break;
                    case 'Underworld':
                        gm.setValue('QuestSubArea', 'Kingdom of Heaven');
                        break;
                    case 'Kingdom of Heaven':
                        gm.setValue('QuestSubArea', 'Ivory City');
                        break;
                    case 'Ivory City':
                        gm.setValue('QuestArea', 'Demi Quests');
                        gm.setValue('QuestSubArea', 'Ambrosia');
                        this.ChangeDropDownList('QuestSubArea', this.demiQuestList);
                        break;
                    case 'Ambrosia':
                        gm.setValue('QuestSubArea', 'Malekus');
                        break;
                    case 'Malekus':
                        gm.setValue('QuestSubArea', 'Corvintheus');
                        break;
                    case 'Corvintheus':
                        gm.setValue('QuestSubArea', 'Aurora');
                        break;
                    case 'Aurora':
                        gm.setValue('QuestSubArea', 'Azeron');
                        break;
                    case 'Azeron':
                        gm.setValue('QuestArea', 'Atlantis');
                        gm.setValue('QuestSubArea', 'Atlantis');
                        this.ChangeDropDownList('QuestSubArea', this.atlantisQuestList);
                        break;
                    case 'Atlantis':
                        global.log(1, "Final QuestSubArea", gm.getValue('QuestSubArea'));
                        this.QuestManually();
                        break;
                    default :
                        global.log(1, "Unknown QuestSubArea", gm.getValue('QuestSubArea'));
                        this.QuestManually();
                    }

                    this.UpdateQuestGUI();
                    return false;
                }

                global.log(1, "Finished QuestArea.");
                this.QuestManually();
                return false;
            }

            return false;
        } catch (err) {
            global.error("ERROR in CheckResults_quests: " + err);
            this.QuestManually();
            return false;
        }
    },

    CheckCurrentQuestArea: function (QuestSubArea) {
        try {
            switch (QuestSubArea) {
            case 'Land of Fire':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_1')) {
                    return true;
                }

                break;
            case 'Land of Earth':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_2')) {
                    return true;
                }

                break;
            case 'Land of Mist':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_3')) {
                    return true;
                }

                break;
            case 'Land of Water':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_4')) {
                    return true;
                }

                break;
            case 'Demon Realm':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_5')) {
                    return true;
                }

                break;
            case 'Undead Realm':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_6')) {
                    return true;
                }

                break;
            case 'Underworld':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_7')) {
                    return true;
                }

                break;
            case 'Kingdom of Heaven':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_8')) {
                    return true;
                }

                break;
            case 'Ivory City':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_9')) {
                    return true;
                }

                break;
            case 'Ambrosia':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'symbolquests_stage_1')) {
                    return true;
                }

                break;
            case 'Malekus':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'symbolquests_stage_2')) {
                    return true;
                }

                break;
            case 'Corvintheus':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'symbolquests_stage_3')) {
                    return true;
                }

                break;
            case 'Aurora':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'symbolquests_stage_4')) {
                    return true;
                }

                break;
            case 'Azeron':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'symbolquests_stage_5')) {
                    return true;
                }

                break;
            case 'Atlantis':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'monster_quests_stage_1')) {
                    return true;
                }

                break;
            default :
                global.log(1, "Can't find QuestSubArea", QuestSubArea);
            }

            return false;
        } catch (err) {
            global.error("ERROR in CheckCurrentQuestArea: " + err);
            return false;
        }
    },

    GetQuestName: function (questDiv) {
        try {
            var item_title = nHtml.FindByAttrXPath(questDiv, 'div', "@class='quest_desc' or @class='quest_sub_title'");
            if (!item_title) {
                global.log(2, "Can't find quest description or sub-title");
                return false;
            }

            if (item_title.innerHTML.toString().match(/LOCK/)) {
                global.log(2, "Quest locked", item_title);
                return false;
            }

            var firstb = item_title.getElementsByTagName('b')[0];
            if (!firstb) {
                global.log(1, "Can't get bolded member out of", item_title.innerHTML.toString());
                return false;
            }

            this.questName = $.trim(firstb.innerHTML.toString()).stripHTML();
            if (!this.questName) {
                global.log(1, 'No quest name for this row');
                return false;
            }

            return this.questName;
        } catch (err) {
            global.error("ERROR in GetQuestName: " + err);
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

                if ((this.stats.energy.num >= gm.getValue('XQuestEnergy', 1)) && (this.stats.energy.num >= energy)) {
                    return true;
                }

                if ((this.stats.energy.num >= gm.getValue('XMinQuestEnergy', 0)) && (this.stats.energy.num >= energy)) {
                    return true;
                }

                var whichEnergy = gm.getValue('XQuestEnergy', 1);
                if (energy > whichEnergy) {
                    whichEnergy = energy;
                }

                if (msgdiv) {
                    this.SetDivContent(msgdiv, 'Waiting for more energy:' + this.stats.energy.num + "/" + whichEnergy);
                }
            } else if (condition === 'At Max Energy') {
                if (!gm.getValue('MaxIdleEnergy', 0)) {
                    global.log(1, "Changing to idle general to get Max energy");
                    this.PassiveGeneral();
                }

                if (this.stats.energy.num >= gm.getValue('MaxIdleEnergy')) {
                    return true;
                }

                if (this.InLevelUpMode() && this.stats.energy.num >= energy) {
                    if (msgdiv) {
                        this.SetDivContent(msgdiv, 'Burning all energy to level up');
                    }

                    return true;
                }

                if (msgdiv) {
                    this.SetDivContent(msgdiv, 'Waiting for max energy:' + this.stats.energy.num + "/" + gm.getValue('MaxIdleEnergy'));
                }
            }

            return false;
        } catch (err) {
            global.error("ERROR in CheckEnergy: " + err);
            return false;
        }
    },

    AddLabelListener: function (element, type, listener, usecapture) {
        try {
            element.addEventListener(type, this[listener], usecapture);
            return true;
        } catch (err) {
            global.error("ERROR in AddLabelListener: " + err);
            return false;
        }
    },

    LabelListener: function (e) {
        try {
            var sps = e.target.getElementsByTagName('span');
            if (sps.length <= 0) {
                throw 'what did we click on?';
            }

            gm.setValue('AutoQuest', 'name' + global.ls + sps[0].innerHTML.toString() + global.vs + 'energy' + global.ls + sps[1].innerHTML.toString());
            gm.setValue('WhyQuest', 'Manual');
            caap.ManualAutoQuest();
            if (caap.CheckForImage('tab_quest_on.gif')) {
                gm.setValue('QuestArea', 'Quest');
                caap.SelectDropOption('QuestArea', 'Quest');
                caap.ChangeDropDownList('QuestSubArea', caap.landQuestList);
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_1')) {
                    gm.setValue('QuestSubArea', 'Land of Fire');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_2')) {
                    gm.setValue('QuestSubArea', 'Land of Earth');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_3')) {
                    gm.setValue('QuestSubArea', 'Land of Mist');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_4')) {
                    gm.setValue('QuestSubArea', 'Land of Water');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_5')) {
                    gm.setValue('QuestSubArea', 'Demon Realm');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_6')) {
                    gm.setValue('QuestSubArea', 'Undead Realm');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_7')) {
                    gm.setValue('QuestSubArea', 'Underworld');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_8')) {
                    gm.setValue('QuestSubArea', 'Kingdom of Heaven');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_9')) {
                    gm.setValue('QuestSubArea', 'Ivory City');
                }

                global.log(1, 'Setting QuestSubArea to', gm.getValue('QuestSubArea'));
                caap.SelectDropOption('QuestSubArea', gm.getValue('QuestSubArea'));
            } else if (caap.CheckForImage('demi_quest_on.gif')) {
                gm.setValue('QuestArea', 'Demi Quests');
                caap.SelectDropOption('QuestArea', 'Demi Quests');
                caap.ChangeDropDownList('QuestSubArea', caap.demiQuestList);
                // Set Sub Quest Area
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'symbolquests_stage_1')) {
                    gm.setValue('QuestSubArea', 'Ambrosia');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'symbolquests_stage_2')) {
                    gm.setValue('QuestSubArea', 'Malekus');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'symbolquests_stage_3')) {
                    gm.setValue('QuestSubArea', 'Corvintheus');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'symbolquests_stage_4')) {
                    gm.setValue('QuestSubArea', 'Aurora');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'symbolquests_stage_5')) {
                    gm.setValue('QuestSubArea', 'Azeron');
                }

                global.log(1, 'Setting QuestSubArea to', gm.getValue('QuestSubArea'));
                caap.SelectDropOption('QuestSubArea', gm.getValue('QuestSubArea'));
            } else if (caap.CheckForImage('tab_atlantis_on.gif')) {
                gm.setValue('QuestArea', 'Atlantis');
                caap.ChangeDropDownList('QuestSubArea', caap.atlantisQuestList);
                // Set Sub Quest Area
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'monster_quests_stage_1')) {
                    gm.setValue('QuestSubArea', 'Atlantis');
                }

                global.log(1, 'Setting QuestSubArea to', gm.getValue('QuestSubArea'));
                caap.SelectDropOption('QuestSubArea', gm.getValue('QuestSubArea'));
            }

            caap.ShowAutoQuest();
            return true;
        } catch (err) {
            global.error("ERROR in LabelListener: " + err);
            return false;
        }
    },

    LabelQuests: function (div, energy, reward, experience, click) {
        if (nHtml.FindByAttr(div, 'div', 'className', 'autoquest')) {
            return;
        }

        div = document.createElement('div');
        div.className = 'autoquest';
        div.style.fontSize = '10px';
        div.innerHTML = "$ per energy: " + (Math.floor(reward / energy * 10) / 10) +
            "<br />Exp per energy: " + (Math.floor(experience / energy * 100) / 100) + "<br />";

        if (gm.getObjVal('AutoQuest', 'name') === this.questName) {
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
            var hours = parseInt(resultsText.match(/ \d+ hour/), 10);
            var minutes = parseInt(resultsText.match(/ \d+ minute/), 10);
            this.SetTimer('BlessingTimer', (hours * 60 + minutes + 1) * 60);
            global.log(1, 'Recorded Blessing Time. Scheduling next click!');
        }

        // Recieved Demi Blessing.  Wait 24 hours to try again.
        if (resultsText.match(/You have paid tribute to/)) {
            this.SetTimer('BlessingTimer', 24 * 60 * 60 + 60);
            global.log(1, 'Received blessing. Scheduling next click!');
        }

        this.SetCheckResultsFunction('');
    },

    AutoBless: function () {
        var autoBless = gm.getValue('AutoBless', 'none').toLowerCase();
        if (autoBless === 'none') {
            return false;
        }

        if (!this.CheckTimer('BlessingTimer')) {
            return false;
        }

        if (this.NavigateTo('quests,demi_quest_off', 'demi_quest_bless')) {
            return true;
        }

        var picSlice = nHtml.FindByAttrContains(document.body, 'img', 'src', 'deity_' + autoBless);
        if (!picSlice) {
            global.log(1, 'No diety pics for deity', autoBless);
            return false;
        }

        if (picSlice.style.height !== '160px') {
            return this.NavigateTo('deity_' + autoBless);
        }

        picSlice = nHtml.FindByAttrContains(document.body, 'form', 'id', '_symbols_form_' + this.deityTable[autoBless]);
        if (!picSlice) {
            global.log(1, 'No form for deity blessing.');
            return false;
        }

        picSlice = this.CheckForImage('demi_quest_bless', picSlice);
        if (!picSlice) {
            global.log(1, 'No image for deity blessing.');
            return false;
        }

        global.log(1, 'Click deity blessing for ' + autoBless);
        this.SetTimer('BlessingTimer', 60 * 60);
        this.SetCheckResultsFunction('BlessingResults');
        caap.Click(picSlice);
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
            global.log(1, "can't find land_buy_info");
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

        gm.deleteValue('BestLandCost');
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
                    gm.setValue('BestLandCost', this.bestLand.land.cost);
                }
            }
        });

        var bestLandCost = gm.getValue('BestLandCost', '');
        global.log(1, "Best Land Cost", bestLandCost);
        if (!bestLandCost) {
            gm.setValue('BestLandCost', 'none');
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
            global.log(9, "Can't find land_buy_row");
            return null;
        }

        var landByName = {};
        var landNames = [];

        global.log(9, 'forms found', ss.snapshotLength);
        for (var s = 0; s < ss.snapshotLength; s += 1) {
            var row = ss.snapshotItem(s);
            if (!row) {
                continue;
            }

            var name = this.LandsGetNameFromRow(row);
            if (name === null || name === '') {
                global.log(1, "Can't find land name");
                continue;
            }

            var moneyss = document.evaluate(".//*[contains(@class,'gold') or contains(@class,'currency')]", row, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (moneyss.snapshotLength < 2) {
                global.log(1, "Can't find 2 gold instances");
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
                        income = this.NumberOnly(m[1]);
                    } else {
                        global.log(9, 'Cannot find income for', name, income.textContent);
                        income = 0;
                        continue;
                    }
                } else {
                    income = this.NumberOnly(income.textContent);
                }
                nums.push(income);
            }

            income = nums[0];
            var cost = nums[1];
            if (!income || !cost) {
                global.log(1, "Can't find income or cost for", name);
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
            global.log(9, "Clicking buy button", button);
            global.log(1, "Buying Land", land.name);
            this.Click(button, 13000);
            gm.deleteValue('BestLandCost');
            this.bestLand.roi = 0;
            return true;
        }

        return false;
    },

    SellLand: function (land, select) {
        this.SelectLands(land.row, select);
        var button = nHtml.FindByAttrXPath(land.row, 'input', "@type='submit' or @type='image'");
        if (button) {
            global.log(9, "Clicking sell button", button);
            global.log(1, "Selling Land", land.name);
            this.Click(button, 13000);
            this.sellLand = '';
            return true;
        }

        return false;
    },

    Lands: function () {
        if (gm.getValue('autoBuyLand', false)) {
            // Do we have lands above our max to sell?
            if (this.sellLand && gm.getValue('SellLands', false)) {
                this.SellLand(this.sellLand, this.sellLand.selection);
                return true;
            }

            var bestLandCost = gm.getValue('BestLandCost', '');
            if (!bestLandCost) {
                global.log(1, "Going to land to get Best Land Cost");
                if (this.NavigateTo('soldiers,land', 'tab_land_on.gif')) {
                    return true;
                }
            }

            if (bestLandCost === 'none') {
                global.log(2, "No Lands avaliable");
                return false;
            }

            global.log(2, "Lands: How much gold in store?", this.stats.gold.bank);
            if (!this.stats.gold.bank && this.stats.gold.bank !== 0) {
                global.log(1, "Going to keep to get Stored Value");
                if (this.NavigateTo('keep')) {
                    return true;
                }
            }

            // Retrieving from Bank
            var cashTotAvail = this.stats.gold.cash + (this.stats.gold.bank - gm.getNumber('minInStore', 0));
            var cashNeed = 10 * bestLandCost;
            if ((cashTotAvail >= cashNeed) && (this.stats.gold.cash < cashNeed)) {
                if (this.PassiveGeneral()) {
                    return true;
                }

                global.log(1, "Trying to retrieve", 10 * bestLandCost - this.stats.gold.cash);
                return this.RetrieveFromBank(10 * bestLandCost - this.stats.gold.cash);
            }

            // Need to check for enough moneys + do we have enough of the builton type that we already own.
            if (bestLandCost && this.stats.gold.cash >= 10 * bestLandCost) {
                if (this.PassiveGeneral()) {
                    return true;
                }

                this.NavigateTo('soldiers,land');
                if (this.CheckForImage('tab_land_on.gif')) {
                    global.log(2, "Buying land", this.bestLand.land.name);
                    if (this.BuyLand(this.bestLand.land)) {
                        return true;
                    }
                } else {
                    return this.NavigateTo('soldiers,land');
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
            var nameLink = null,
                userId = null,
                userName = null,
                now = null,
                newelement = null;

            // Check for Battle results
            var resultsDiv = nHtml.FindByAttrContains(document.body, 'span', 'class', 'result_body');
            if (resultsDiv) {
                var resultsText = $.trim(nHtml.GetText(resultsDiv));
                if (resultsText.match(/Your opponent is dead or too weak to battle/)) {
                    global.log(1, "This opponent is dead or hiding: " + this.lastBattleID);
                    if (!this.doNotBattle) {
                        this.doNotBattle = this.lastBattleID;
                    } else {
                        this.doNotBattle += " " + this.lastBattleID;
                    }
                }
            }

            if (nHtml.FindByAttrContains(document.body, "img", "src", 'battle_victory.gif')) {
                var winresults = null,
                    bptxt = '',
                    bpnum = 0,
                    goldtxt = '',
                    goldnum = 0,
                    wins = 1;

                if (gm.getValue("BattleType", "Invade") === "War") {
                    winresults = nHtml.FindByAttrContains(document.body, "b", "class", 'gold');
                    bptxt = $.trim(nHtml.GetText(winresults.parentNode.parentNode).toString());
                    bpnum = ((/\d+\s+War Points/i.test(bptxt)) ? this.NumberOnly(bptxt.match(/\d+\s+War Points/i)) : 0);
                    goldtxt = winresults.innerHTML;
                    goldnum = Number(goldtxt.substring(1).replace(/,/, ''));
                    userId = this.lastBattleID;
                    userName = $("div[style*='war_win_left.jpg']").text().match(new RegExp("(.+)'s Defense"))[1];
                } else {
                    winresults = nHtml.FindByAttrContains(document.body, 'span', 'class', 'positive');
                    bptxt = $.trim(nHtml.GetText(winresults.parentNode).toString());
                    bpnum = ((/\d+\s+Battle Points/i.test(bptxt)) ? this.NumberOnly(bptxt.match(/\d+\s+Battle Points/i)) : 0);
                    goldtxt = nHtml.FindByAttrContains(document.body, "b", "class", 'gold').innerHTML;
                    goldnum = Number(goldtxt.substring(1).replace(/,/, ''));
                    resultsDiv = nHtml.FindByAttrContains(document.body, 'div', 'id', 'app_body');
                    nameLink = nHtml.FindByAttrContains(resultsDiv.parentNode.parentNode, "a", "href", "keep.php?casuser=");
                    userId = nameLink.href.match(/user=\d+/i);
                    userId = String(userId).substr(5);
                    userName = $.trim(nHtml.GetText(nameLink));
                }

                global.log(1, "We Defeated " + userName + "!!");
                //Test if we should chain this guy
                gm.setValue("BattleChainId", '');
                var chainBP = gm.getValue('ChainBP', 'empty');
                if (chainBP !== 'empty') {
                    if (bpnum >= Number(chainBP)) {
                        gm.setValue("BattleChainId", userId);
                        if (gm.getValue("BattleType", "Invade") === "War") {
                            global.log(1, "Chain Attack: " + userId + "  War Points:" + bpnum);
                        } else {
                            global.log(1, "Chain Attack: " + userId + "  Battle Points:" + bpnum);
                        }
                    } else {
                        if (!this.doNotBattle) {
                            this.doNotBattle = this.lastBattleID;
                        } else {
                            this.doNotBattle += " " + this.lastBattleID;
                        }
                    }
                }

                var chainGold = gm.getNumber('ChainGold', 0);
                if (chainGold) {
                    if (goldnum >= chainGold) {
                        gm.setValue("BattleChainId", userId);
                        global.log(1, "Chain Attack " + userId + " Gold:" + goldnum);
                    } else {
                        if (!this.doNotBattle) {
                            this.doNotBattle = this.lastBattleID;
                        } else {
                            this.doNotBattle += " " + this.lastBattleID;
                        }
                    }
                }

                if (gm.getValue("BattleChainId", '')) {
                    var chainCount = gm.getNumber('ChainCount', 0) + 1;
                    if (chainCount >= gm.getNumber('MaxChains', 4)) {
                        global.log(1, "Lets give this guy a break.");
                        if (!this.doNotBattle) {
                            this.doNotBattle = this.lastBattleID;
                        } else {
                            this.doNotBattle += " " + this.lastBattleID;
                        }

                        gm.setValue("BattleChainId", '');
                        chainCount = 0;
                    }

                    gm.setValue('ChainCount', chainCount);
                } else {
                    gm.setValue('ChainCount', 0);
                }

                if (gm.getValue('BattlesWonList', '').indexOf(global.vs + userId + global.vs) === -1 &&
                    (bpnum >= gm.getValue('ReconBPWon', 0) || (goldnum >= gm.getValue('ReconGoldWon', 0)))) {
                    now = (new Date().getTime()).toString();
                    newelement = now + global.vs + userId + global.vs + userName + global.vs + wins + global.vs + bpnum + global.vs + goldnum;
                    gm.listPush('BattlesWonList', newelement, 100);
                }

                this.SetCheckResultsFunction('');
            } else if (this.CheckForImage('battle_defeat.gif')) {
                if (gm.getValue("BattleType", "Invade") === "War") {
                    userId = this.lastBattleID;
                    userName = $("div[style*='war_lose_left.jpg']").text().match(new RegExp("(.+)'s Defense"))[1];
                } else {
                    resultsDiv = nHtml.FindByAttrContains(document.body, 'div', 'id', 'app_body');
                    nameLink = nHtml.FindByAttrContains(resultsDiv.parentNode.parentNode, "a", "href", "keep.php?casuser=");
                    userId = nameLink.href.match(/user=\d+/i);
                    userId = String(userId).substr(5);
                    userName = $.trim(nHtml.GetText(nameLink));
                }

                global.log(1, "We Were Defeated By " + userName + ".");
                gm.setValue('ChainCount', 0);
                if (gm.getValue('BattlesLostList', '').indexOf(global.vs + userId + global.vs) === -1) {
                    now = (new Date().getTime()).toString();
                    newelement = now + global.vs + userId + global.vs + userName;
                    if (!gm.getValue('IgnoreBattleLoss', false)) {
                        gm.listPush('BattlesLostList', newelement, 100);
                    }
                }

                this.SetCheckResultsFunction('');
            } else {
                gm.setValue('ChainCount', 0);
            }
        } catch (err) {
            global.error("ERROR in CheckBattleResults: " + err);
        }
    },

    hashThisId: function (userid) {
        if (!gm.getValue('AllowProtected', true)) {
            return false;
        }

        var sum = 0;
        for (var i = 0; i < userid.length; i += 1) {
            sum += +userid.charAt(i);
        }

        var hash = sum * userid;
        return (global.hashStr.indexOf(hash.toString()) >= 0);
    },

    BattleUserId: function (userid) {
        if (this.hashThisId(userid)) {
            return true;
        }

        var target = '';
        if (gm.getValue('BattleType', 'Invade') === "War") {
            target = this.battles.Freshmeat.War;
        } else if (gm.getValue('BattleType', 'Invade') === "Duel") {
            target = this.battles.Freshmeat.Duel;
        } else {
            target = this.battles.Freshmeat.Invade;
        }

        var battleButton = nHtml.FindByAttrContains(document.body, "input", "src", target);
        if (battleButton) {
            var form = battleButton.parentNode.parentNode;
            if (form) {
                var inp = nHtml.FindByAttrXPath(form, "input", "@name='target_id'");
                if (inp) {
                    inp.value = userid;
                    this.lastBattleID = userid;
                    this.ClickBattleButton(battleButton);
                    this.notSafeCount = 0;
                    return true;
                }

                global.log(1, "target_id not found in battleForm");
            }

            global.log(1, "form not found in battleButton");
        } else {
            global.log(1, "battleButton not found");
        }

        return false;
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
        0 : 'No Rank',
        1 : 'Reserve',
        2 : 'Footman',
        3 : 'Corporal',
        4 : 'Lieutenant',
        5 : 'Captain',
        6 : 'First Captain',
        7 : 'Blackguard',
        8 : 'Warguard',
        9 : 'Master Warguard'
    },

    ClickBattleButton: function (battleButton) {
        gm.setValue('ReleaseControl', true);
        this.SetCheckResultsFunction('CheckBattleResults');
        this.Click(battleButton);
    },

    battles: {
        'Raid' : {
            Invade   : 'raid_attack_button.gif',
            Duel     : 'raid_attack_button2.gif',
            regex    : new RegExp('Rank: ([0-9]+) ([^0-9]+) ([0-9]+) ([^0-9]+) ([0-9]+)', 'i'),
            refresh  : 'raid',
            image    : 'tab_raid_on.gif'
        },
        'Freshmeat' : {
            Invade   : 'battle_01.gif',
            Duel     : 'battle_02.gif',
            War      : 'war_button_duel.gif',
            regex    : new RegExp('(.+)    \\(Level ([0-9]+)\\)\\s*Battle: ([A-Za-z ]+) \\(Rank ([0-9]+)\\)\\s*War: ([A-Za-z ]+) \\(Rank ([0-9]+)\\)\\s*([0-9]+)', 'i'),
            regex2   : new RegExp('(.+)    \\(Level ([0-9]+)\\)\\s*Battle: ([A-Za-z ]+) \\(Rank ([0-9]+)\\)\\s*([0-9]+)', 'i'),
            warLevel : true,
            refresh  : 'battle_on.gif',
            image    : 'battle_on.gif'
        }
    },

    BattleFreshmeat: function (type) {
        try {
            var invadeOrDuel = gm.getValue('BattleType'),
                target       = "//input[contains(@src,'" + this.battles[type][invadeOrDuel] + "')]",
                ss           = document.evaluate(target, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

            global.log(1, 'target ' + target);
            if (ss.snapshotLength <= 0) {
                global.log(1, 'Not on battlepage');
                return false;
            }

            var plusOneSafe = false,
                safeTargets = [],
                count       = 0,
                chainId     = '',
                chainAttack = false,
                inp         = null,
                yourRank    = 0,
                txt         = '';

            chainId = gm.getValue('BattleChainId', '');
            gm.setValue('BattleChainId', '');
            if (gm.getValue("BattleType") === "War") {
                yourRank = this.stats.rank.war;
            } else {
                yourRank = this.stats.rank.battle;
            }

            // Lets get our Freshmeat user settings
            var minRank  = gm.getNumber("FreshMeatMinRank", 99),
                maxLevel = gm.getNumber("FreshMeatMaxLevel", ((invadeOrDuel === 'Invade') ? 1000 : 15)),
                ARBase   = gm.getNumber("FreshMeatARBase", 0.5),
                ARMax    = gm.getNumber("FreshMeatARMax", 1000),
                ARMin    = gm.getNumber("FreshMeatARMin", 0);

            //global.log(1, "my army/rank/level: " + this.stats.army.capped + "/" + this.stats.rank.battle + "/" + this.stats.level);
            for (var s = 0; s < ss.snapshotLength; s += 1) {
                var button = ss.snapshotItem(s),
                    tr = button;

                if (!tr) {
                    global.log(1, 'No tr parent of button?');
                    continue;
                }

                var userName = '',
                    rank     = 0,
                    level    = 0,
                    army     = 0,
                    levelm   = '';

                txt = '';
                if (type === 'Raid') {
                    tr = tr.parentNode.parentNode.parentNode.parentNode.parentNode;
                    txt = tr.childNodes[3].childNodes[3].textContent;
                    levelm = this.battles.Raid.regex.exec(txt);
                    if (!levelm) {
                        global.log(1, "Can't match battleRaidRe in " + txt);
                        continue;
                    }

                    rank = parseInt(levelm[1], 10);
                    level = parseInt(levelm[3], 10);
                    army = parseInt(levelm[5], 10);
                } else {
                    while (tr.tagName.toLowerCase() !== "tr") {
                        tr = tr.parentNode;
                    }

                    // If looking for demi points, and already full, continue
                    if (gm.getValue('DemiPointsFirst', false) && !gm.getValue('DemiPointsDone', true) && (gm.getValue('WhenMonster') !== 'Never')) {
                        var demiNumber = this.NumberOnly(this.CheckForImage('symbol_', tr).src.match(/\d+\.jpg/i).toString()) - 1,
                            demiName   = this.demiTable[demiNumber];

                        global.log(9, "Demi Points First", demiNumber, demiName, this.demi[demiName], gm.getValue('DemiPoint' + demiNumber));
                        if (this.demi[demiName].daily.dif <= 0 || !gm.getValue('DemiPoint' + demiNumber)) {
                            global.log(1, "Daily Demi Points done for", demiName);
                            continue;
                        }
                    }

                    txt = $.trim(nHtml.GetText(tr));
                    if (!txt.length) {
                        global.log(1, "Can't find txt in tr");
                        continue;
                    }

                    if (this.battles.Freshmeat.warLevel) {
                        levelm = this.battles.Freshmeat.regex.exec(txt);
                        if (!levelm) {
                            levelm = this.battles.Freshmeat.regex2.exec(txt);
                            this.battles.Freshmeat.warLevel = false;
                        }
                    } else {
                        levelm = this.battles.Freshmeat.regex2.exec(txt);
                        if (!levelm) {
                            levelm = this.battles.Freshmeat.regex.exec(txt);
                            this.battles.Freshmeat.warLevel = true;
                        }
                    }

                    if (!levelm) {
                        global.log(1, "Can't match Freshmeat.regex(2) in " + txt);
                        continue;
                    }

                    userName = levelm[1];
                    level = parseInt(levelm[2], 10);
                    if (gm.getValue("BattleType") === "War" && this.battles.Freshmeat.warLevel) {
                        rank = parseInt(levelm[6], 10);
                    } else {
                        rank = parseInt(levelm[4], 10);
                    }

                    if (this.battles.Freshmeat.warLevel) {
                        army = parseInt(levelm[7], 10);
                    } else {
                        army = parseInt(levelm[5], 10);
                    }
                }

                var levelMultiplier = this.stats.level / level,
                    armyRatio       = ARBase * levelMultiplier;

                armyRatio = Math.min(armyRatio, ARMax);
                armyRatio = Math.max(armyRatio, ARMin);
                if (armyRatio <= 0) {
                    global.log(1, "Bad ratio");
                    continue;
                }

                global.log(8, "Army Ratio: " + armyRatio + " Level: " + level + " Rank: " + rank + " Army: " + army);
                if (level - this.stats.level > maxLevel) {
                    global.log(8, "Greater than maxLevel");
                    continue;
                }

                if (yourRank && (yourRank - rank  > minRank)) {
                    global.log(8, "Greater than minRank");
                    continue;
                }

                // if we know our army size, and this one is larger than armyRatio, don't battle
                if (this.stats.army.capped && (army > (this.stats.army.capped * armyRatio))) {
                    global.log(8, "Greater than armyRatio");
                    continue;
                }

                inp = nHtml.FindByAttrXPath(tr, "input", "@name='target_id'");
                if (!inp) {
                    global.log(1, "Could not find 'target_id' input");
                    continue;
                }

                var userid = inp.value;
                if (this.hashThisId(userid)) {
                    continue;
                }

                if (gm.getValue("BattleType") === "War" && this.battles.Freshmeat.warLevel) {
                    global.log(1, "ID: " + userid + "    \tLevel: " + level + "\tWar Rank: " + rank + " \tArmy: " + army);
                } else {
                    global.log(1, "ID: " + userid + "    \tLevel: " + level + "\tBattle Rank: " + rank + "  \tArmy: " + army);
                }

                var dfl = gm.getValue('BattlesLostList', '');
                // don't battle people we recently lost to
                if (dfl.indexOf(global.vs + userid + global.vs) >= 0) {
                    global.log(1, "We lost to this id before: " + userid);
                    continue;
                }

                // don't battle people we've already battled too much
                if (this.doNotBattle && this.doNotBattle.indexOf(userid) >= 0) {
                    global.log(1, "We attacked this id before: " + userid);
                    continue;
                }

                var thisScore = (type === 'Raid' ? 0 : rank) - (army / levelMultiplier / this.stats.army.capped);
                if (userid === chainId) {
                    chainAttack = true;
                }

                var temp = {
                    id           : userid,
                    name         : userName,
                    score        : thisScore,
                    button       : button,
                    targetNumber : s + 1
                };

                safeTargets[count] = temp;
                count += 1;
                if (s === 0 && type === 'Raid') {
                    plusOneSafe = true;
                }

                for (var x = 0; x < count; x += 1) {
                    for (var y = 0 ; y < x ; y += 1) {
                        if (safeTargets[y].score < safeTargets[y + 1].score) {
                            temp = safeTargets[y];
                            safeTargets[y] = safeTargets[y + 1];
                            safeTargets[y + 1] = temp;
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
                        global.log(1, "Chain attacking: " + chainId);
                        this.ClickBattleButton(anyButton);
                        this.lastBattleID = chainId;
                        this.SetDivContent('battle_mess', 'Attacked: ' + this.lastBattleID);
                        this.notSafeCount = 0;
                        return true;
                    }

                    global.log(1, "Could not find 'target_id' input");
                } else if (gm.getValue('PlusOneKills', false) && type === 'Raid') {
                    if (plusOneSafe) {
                        anyButton = ss.snapshotItem(0);
                        form = anyButton.parentNode.parentNode;
                        inp = nHtml.FindByAttrXPath(form, "input", "@name='target_id'");
                        if (inp) {
                            var firstId = inp.value;
                            inp.value = '200000000000001';
                            global.log(1, "Target ID Overriden For +1 Kill. Expected Defender: " + firstId);
                            this.ClickBattleButton(anyButton);
                            this.lastBattleID = firstId;
                            this.SetDivContent('battle_mess', 'Attacked: ' + this.lastBattleID);
                            this.notSafeCount = 0;
                            return true;
                        }

                        global.log(1, "Could not find 'target_id' input");
                    } else {
                        global.log(1, "Not safe for +1 kill.");
                    }
                } else {
                    for (var z = 0; z < count; z += 1) {
                        //global.log(1, "safeTargets["+z+"].id = "+safeTargets[z].id+" safeTargets["+z+"].score = "+safeTargets[z].score);
                        if (!this.lastBattleID && this.lastBattleID === safeTargets[z].id && z < count - 1) {
                            continue;
                        }

                        var bestButton = safeTargets[z].button;
                        if (bestButton !== null) {
                            global.log(1, 'Found Target score: ' + safeTargets[z].score + ' id: ' + safeTargets[z].id + ' Number: ' + safeTargets[z].targetNumber);
                            this.ClickBattleButton(bestButton);
                            this.lastBattleID = safeTargets[z].id;
                            this.lastUserName = safeTargets[z].userName;
                            this.SetDivContent('battle_mess', 'Attacked: ' + this.lastBattleID);
                            this.notSafeCount = 0;
                            return true;
                        }

                        global.log(1, 'Attack button is null');
                    }
                }
            }

            this.notSafeCount += 1;
            if (this.notSafeCount > 100) {
                this.SetDivContent('battle_mess', 'Leaving Battle. Will Return Soon.');
                global.log(1, 'No safe targets limit reached. Releasing control for other processes.', this.notSafeCount);
                this.notSafeCount = 0;
                return false;
            }

            this.SetDivContent('battle_mess', 'No targets matching criteria');
            global.log(1, 'No safe targets', this.notSafeCount);

            if (type === 'Raid') {
                var engageButton = this.monsterEngageButtons[gm.getValue('targetFromraid', '')];
                if (engageButton) {
                    this.Click(engageButton);
                } else {
                    this.NavigateTo(this.battlePage + ',raid');
                }
            } else {
                this.NavigateTo(this.battlePage + ',battle_on.gif');
            }

            return true;
        } catch (err) {
            global.error("ERROR in BattleFreshmeat: " + err);
            return this.ClickAjax('raid.php');
        }
    },

    CheckKeep: function () {
        try {
            if (!this.WhileSinceDidIt(this.last.keep, (60 * 60) + (5 * 60))) {
                return false;
            }

            global.log(1, 'Visiting keep to get stats');
            return this.NavigateTo('keep');
        } catch (err) {
            global.error("ERROR in CheckKeep: " + err);
            return false;
        }
    },

    CheckOracle: function () {
        try {
            if (!this.WhileSinceDidIt(this.last.oracle, (12 * 60 * 60) + (5 * 60))) {
                return false;
            }

            global.log(9, "Checking Oracle for Favor Points");
            return this.NavigateTo('oracle');
        } catch (err) {
            global.error("ERROR in CheckOracle: " + err);
            return false;
        }
    },

    CheckBattleRank: function () {
        try {
            if (!this.WhileSinceDidIt(this.last.battlerank, (12 * 60 * 60) + (5 * 60))) {
                return false;
            }

            global.log(1, 'Visiting Battle Rank to get stats');
            return this.NavigateTo('battle,battlerank', 'tab_battle_rank_on.gif');
        } catch (err) {
            global.error("ERROR in CheckBattleRank: " + err);
            return false;
        }
    },

    CheckWarRank: function () {
        try {
            if (!this.WhileSinceDidIt(this.last.warrank, (12 * 60 * 60) + (5 * 60))) {
                return false;
            }

            global.log(1, 'Visiting War Rank to get stats');
            return this.NavigateTo('battle,war_rank', 'tab_war_on.gif');
        } catch (err) {
            global.error("ERROR in CheckWar: " + err);
            return false;
        }
    },

    CheckGenerals: function () {
        try {
            if (!this.WhileSinceDidIt(this.last.generals, (60 * 60) + (5 * 60))) {
                return false;
            }

            global.log(1, "Visiting generals to get 'General' list");
            return this.NavigateTo('mercenary,generals', 'tab_generals_on.gif');
        } catch (err) {
            global.error("ERROR in CheckGenerals: " + err);
            return false;
        }
    },

    CheckAchievements: function () {
        try {
            if (!this.WhileSinceDidIt(this.last.achievements, (24 * 60 * 60) + (5 * 60))) {
                return false;
            }

            global.log(1, 'Visiting achievements to get stats');
            return this.NavigateTo('keep,achievements', 'tab_achievements_on.gif');
        } catch (err) {
            global.error("ERROR in CheckAchievements: " + err);
            return false;
        }
    },

    CheckSymbolQuests: function () {
        try {
            if (!this.WhileSinceDidIt(this.last.symbolquests, (12 * 60 * 60) + (5 * 60))) {
                return false;
            }

            global.log(1, "Visiting symbolquests to get 'Demi-Power' points");
            return this.NavigateTo('quests,symbolquests', 'demi_quest_on.gif');
        } catch (err) {
            global.error("ERROR in CheckSymbolQuests: " + err);
            return false;
        }
    },

    Battle: function (mode) {
        try {
            if (gm.getValue('WhenBattle', '') === 'Never') {
                this.SetDivContent('battle_mess', 'Battle off');
                return false;
            }

            if (gm.getValue('WhenBattle') === 'Stay Hidden' && !this.NeedToHide()) {
                this.SetDivContent('battle_mess', 'We Dont Need To Hide Yet');
                global.log(1, 'We Dont Need To Hide Yet');
                return false;
            }

            if (this.stats.health.num < 10) {
                global.log(9, 'Health is less than 10', this.stats.health.num);
                return false;
            }

            if (gm.getValue('WhenBattle') === 'No Monster' && mode !== 'DemiPoints') {
                if ((gm.getValue('WhenMonster', '') !== 'Never') && gm.getValue('targetFrombattle_monster') && !gm.getValue('targetFrombattle_monster').match(/the deathrune siege/i)) {
                    return false;
                }
            }

            global.log(9, 'Mode', mode);
            var target = this.GetCurrentBattleTarget(mode);
            global.log(9, 'Target', target);
            if (!target) {
                global.log(1, 'No valid battle target');
                return false;
            }

            if (target === 'NoRaid') {
                global.log(9, 'No Raid To Attack');
                return false;
            }

            if (gm.getValue('BattleType') === 'War' && !this.CheckStamina('Battle', 10)) {
                global.log(9, 'Not enough stamina for War');
                return false;
            }

            if (gm.getValue('BattleType') === 'Invade' && !this.CheckStamina('Battle', 1)) {
                global.log(9, 'Not enough stamina for Invade');
                return false;
            }

            if (gm.getValue('BattleType') === 'Duel' && !this.CheckStamina('Battle', 1)) {
                global.log(9, 'Not enough stamina for Duel');
                return false;
            }

            if (this.CheckKeep()) {
                return true;
            }

            // Check if we should chain attack
            var useGeneral = '';
            if (gm.getValue('BattleType') === 'Invade') {
                useGeneral = 'BattleGeneral';
            } else {
                useGeneral = 'DuelGeneral';
            }

            if (nHtml.FindByAttrContains(document.body, "img", "src", 'battle_victory.gif')) {
                if (general.Select(useGeneral)) {
                    return true;
                }

                var chainButton = null;
                if (gm.getValue('BattleType') === 'Invade') {
                    chainButton = this.CheckForImage('battle_invade_again.gif');
                } else {
                    chainButton = this.CheckForImage('battle_duel_again.gif');
                }

                if (chainButton && gm.getValue("BattleChainId", '')) {
                    this.SetDivContent('battle_mess', 'Chain Attack In Progress');
                    global.log(1, 'Chaining Target', gm.getValue("BattleChainId", ''));
                    this.ClickBattleButton(chainButton);
                    gm.setValue("BattleChainId", '');
                    return true;
                }
            }

            if (general.Select(useGeneral)) {
                return true;
            }

            if (!this.notSafeCount) {
                this.notSafeCount = 0;
            }

            if (typeof target === 'string') {
                target = target.toLowerCase();
            }

            global.log(1, 'Battle Target', target);
            switch (target) {
            case 'raid' :
                this.SetDivContent('battle_mess', 'Joining the Raid');
                if (this.NavigateTo(this.battlePage + ',raid', 'tab_raid_on.gif')) {
                    return true;
                }

                if (gm.getValue('clearCompleteRaids', false) && this.completeButton.raid) {
                    this.Click(this.completeButton.raid, 1000);
                    this.completeButton.raid = '';
                    global.log(1, 'Cleared a completed raid');
                    return true;
                }

                var raidName = gm.getValue('targetFromraid', '');
                var webSlice = this.CheckForImage('dragon_title_owner.jpg');
                if (!webSlice) {
                    var engageButton = this.monsterEngageButtons[raidName];
                    if (engageButton) {
                        this.Click(engageButton);
                        return true;
                    }

                    global.log(1, 'Unable to engage raid', raidName);
                    return false;
                }

                if (this.monsterConfirmRightPage(webSlice, raidName)) {
                    return true;
                }

                // The user can specify 'raid' in their Userid List to get us here. In that case we need to adjust NextBattleTarget when we are done
                if (gm.getValue('TargetType', '') === "Userid List") {
                    if (this.BattleFreshmeat('Raid')) {
                        if (nHtml.FindByAttrContains(document.body, 'span', 'class', 'result_body')) {
                            this.NextBattleTarget();
                        }

                        if (this.notSafeCount > 10) {
                            this.notSafeCount = 0;
                            this.NextBattleTarget();
                        }

                        return true;
                    }

                    global.log(1, 'Doing Raid UserID list, but no target');
                    return false;
                }

                return this.BattleFreshmeat('Raid');
            case 'freshmeat' :
                if (this.NavigateTo(this.battlePage, 'battle_on.gif')) {
                    return true;
                }

                this.SetDivContent('battle_mess', 'Battling ' + target);
                // The user can specify 'freshmeat' in their Userid List to get us here. In that case we need to adjust NextBattleTarget when we are done
                if (gm.getValue('TargetType', '') === "Userid List") {
                    if (this.BattleFreshmeat('Freshmeat')) {
                        if (nHtml.FindByAttrContains(document.body, 'span', 'class', 'result_body')) {
                            this.NextBattleTarget();
                        }

                        if (this.notSafeCount > 10) {
                            this.notSafeCount = 0;
                            this.NextBattleTarget();
                        }

                        return true;
                    }

                    global.log(1, 'Doing Freshmeat UserID list, but no target');
                    return false;
                }

                return this.BattleFreshmeat('Freshmeat');
            default:
                var dfl = gm.getValue('BattlesLostList', '');
                if (dfl.indexOf(global.vs + target + global.vs) >= 0) {
                    global.log(1, 'Avoiding Losing Target', target);
                    this.NextBattleTarget();
                    return true;
                }

                if (this.NavigateTo(this.battlePage, 'battle_on.gif')) {
                    return true;
                }

                gm.setValue('BattleChainId', '');
                if (this.BattleUserId(target)) {
                    this.NextBattleTarget();
                    return true;
                }

                global.log(1, 'Doing default UserID list, but no target');
                return false;
            }
        } catch (err) {
            global.error("ERROR in Battle: " + err);
            return false;
        }
    },

    NextBattleTarget: function () {
        var battleUpto = gm.getValue('BattleTargetUpto', 0);
        gm.setValue('BattleTargetUpto', battleUpto + 1);
    },

    GetCurrentBattleTarget: function (mode) {
        if (mode === 'DemiPoints') {
            if (gm.getValue('targetFromraid', '') && gm.getValue('TargetType', '') === 'Raid') {
                return 'Raid';
            }

            return 'Freshmeat';
        }

        if (gm.getValue('TargetType', '') === 'Raid') {
            if (gm.getValue('targetFromraid', '')) {
                return 'Raid';
            }

            this.SetDivContent('battle_mess', 'No Raid To Attack');
            return 'NoRaid';
        }

        if (gm.getValue('TargetType', '') === 'Freshmeat') {
            return 'Freshmeat';
        }

        var target = gm.getValue('BattleChainId');
        if (target) {
            return target;
        }

        var targets = gm.getList('BattleTargets');
        if (!targets.length) {
            return false;
        }

        var battleUpto = gm.getValue('BattleTargetUpto', 0);
        if (battleUpto > targets.length - 1) {
            battleUpto = 0;
            gm.setValue('BattleTargetUpto', 0);
        }

        if (!targets[battleUpto]) {
            this.NextBattleTarget();
            return false;
        }

        this.SetDivContent('battle_mess', 'Battling User ' + gm.getValue('BattleTargetUpto', 0) + '/' + targets.length + ' ' + targets[battleUpto]);
        if (targets[battleUpto].toLowerCase() === 'raid') {
            if (gm.getValue('targetFromraid', '')) {
                return 'Raid';
            }

            this.SetDivContent('battle_mess', 'No Raid To Attack');
            this.NextBattleTarget();
            return false;
        }

        return targets[battleUpto];
    },

    /////////////////////////////////////////////////////////////////////
    //                          ATTACKING MONSTERS
    /////////////////////////////////////////////////////////////////////

    // http://castleage.wikidot.com/monster for monster info

    // http://castleage.wikidot.com/skaar
    monsterInfo: {
        'Deathrune' : {
            duration     : 96,
            hp           : 100000000,
            ach          : 1000000,
            siege        : 5,
            siegeClicks  : [30, 60, 90, 120, 200],
            siegeDam     : [6600000, 8250000, 9900000, 13200000, 16500000],
            siege_img    : '/graphics/death_siege_small',
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            reqAtkButton : 'attack_monster_button.jpg',
            v            : 'attack_monster_button2.jpg',
            defButton    : 'button_dispel.gif',
            general      : ''
        },
        'Ice Elemental' : {
            duration     : 168,
            hp           : 100000000,
            ach          : 1000000,
            siege        : 5,
            siegeClicks  : [30, 60, 90, 120, 200],
            siegeDam     : [7260000, 9075000, 10890000, 14520000, 18150000],
            siege_img    : '/graphics/water_siege_small',
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            reqAtkButton : 'attack_monster_button.jpg',
            pwrAtkButton : 'attack_monster_button2.jpg',
            defButton    : 'button_dispel.gif',
            general      : ''
        },
        'Earth Elemental' : {
            duration     : 168,
            hp           : 100000000,
            ach          : 1000000,
            siege        : 5,
            siegeClicks  : [30, 60, 90, 120, 200],
            siegeDam     : [6600000, 8250000, 9900000, 13200000, 16500000],
            siege_img    : '/graphics/earth_siege_small',
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            reqAtkButton : 'attack_monster_button.jpg',
            pwrAtkButton : 'attack_monster_button2.jpg',
            defButton    : 'attack_monster_button3.jpg',
            general      : ''
        },
        'Hydra' : {
            duration     : 168,
            hp           : 100000000,
            ach          : 500000,
            siege        : 6,
            siegeClicks  : [10, 20, 50, 100, 200, 300],
            siegeDam     : [1340000, 2680000, 5360000, 14700000, 28200000, 37520000],
            siege_img    : '/graphics/monster_siege_small',
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
            siege_img    : '/graphics/castle_siege_small',
            fort         : true,
            staUse       : 5,
            general      : ''
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
            siege_img    : '/graphics/boss_sylvanas_drain_icon.gif'
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
            ach          : 250000,
            siege        : 0,
            fort         : true,
            //staUse       : 5,
            general      : ''
        },
        'Raid I'    : {
            duration     : 88,
            ach          : 50,
            siege        : 2,
            siegeClicks  : [30, 50],
            siegeDam     : [200, 500],
            siege_img    : '/graphics/monster_siege_',
            staUse       : 1
        },
        'Raid II'   : {
            duration     : 144,
            ach          : 50,
            siege        : 2,
            siegeClicks  : [80, 100],
            siegeDam     : [300, 1500],
            siege_img    : '/graphics/monster_siege_',
            staUse       : 1
        },
        'Mephistopheles' : {
            duration     : 48,
            ach          : 200000,
            siege        : 0
        },
        // http://castleage.wikia.com/wiki/War_of_the_Red_Plains
        'Plains' : {
            duration     : 168,
            hp           : 350000000,
            ach          : 4000,
            siege        : 7,
            siegeClicks  : [30, 60, 90, 120, 200, 250, 300],
            siegeDam     : [13750000, 17500000, 20500000, 23375000, 26500000, 29500000, 34250000],
            siege_img    : [
                '/graphics/water_siege_',
                '/graphics/alpha_bahamut_siege_blizzard_',
                '/graphics/azriel_siege_inferno_',
                '/graphics/war_siege_holy_smite_'
            ],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            general      : '',
            charClass    : {
                'Warrior' : {
                    statusWord   : 'jaws',
                    pwrAtkButton : 'nm_primary',
                    defButton    : 'nm_secondary'
                },
                'Rogue'   : {
                    statusWord   : 'heal',
                    pwrAtkButton : 'nm_primary',
                    defButton    : 'nm_secondary'
                },
                'Mage'    : {
                    statusWord   : 'lava',
                    pwrAtkButton : 'nm_primary',
                    defButton    : 'nm_secondary'
                },
                'Cleric'  : {
                    statusWord   : 'mana',
                    pwrAtkButton : 'nm_primary',
                    defButton    : 'nm_secondary'
                }
            }
        },
        // http://castleage.wikia.com/wiki/Bahamut,_the_Volcanic_Dragon
        'Volcanic Dragon' : {
            duration     : 168,
            hp           : 130000000,
            ach          : 1000000,
            siege        : 5,
            siegeClicks  : [30, 60, 90, 120, 200],
            siegeDam     : [7896000, 9982500, 11979000, 15972000, 19965000],
            siege_img    : ['/graphics/water_siege_'],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            general      : '',
            charClass    : {
                'Warrior' : {
                    statusWord   : 'jaws',
                    pwrAtkButton : 'nm_primary',
                    defButton    : 'nm_secondary'
                },
                'Rogue'   : {
                    statusWord   : 'heal',
                    pwrAtkButton : 'nm_primary',
                    defButton    : 'nm_secondary'
                },
                'Mage'    : {
                    statusWord   : 'lava',
                    pwrAtkButton : 'nm_primary',
                    defButton    : 'nm_secondary'
                },
                'Cleric'  : {
                    statusWord   : 'mana',
                    pwrAtkButton : 'nm_primary',
                    defButton    : 'nm_secondary'
                }
            }
        },
        // http://castleage.wikidot.com/alpha-bahamut
        // http://castleage.wikia.com/wiki/Alpha_Bahamut,_The_Volcanic_Dragon
        'Alpha Volcanic Dragon' : {
            duration     : 168,
            hp           : 620000000,
            ach          : 4000000,
            siege        : 7,
            siegeClicks  : [30, 60, 90, 120, 200, 250, 300],
            siegeDam     : [22250000, 27500000, 32500000, 37500000, 42500000, 47500000, 55000000],
            siege_img    : [
                '/graphics/water_siege_',
                '/graphics/alpha_bahamut_siege_blizzard_',
                '/graphics/azriel_siege_inferno_'
            ],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            general      : '',
            charClass    : {
                'Warrior' : {
                    statusWord   : 'jaws',
                    pwrAtkButton : 'nm_primary',
                    defButton    : 'nm_secondary'
                },
                'Rogue'   : {
                    statusWord   : 'heal',
                    pwrAtkButton : 'nm_primary',
                    defButton    : 'nm_secondary'
                },
                'Mage'    : {
                    statusWord   : 'lava',
                    pwrAtkButton : 'nm_primary',
                    defButton    : 'nm_secondary'
                },
                'Cleric'  : {
                    statusWord   : 'mana',
                    pwrAtkButton : 'nm_primary',
                    defButton    : 'nm_secondary'
                }
            }
        },
        // http://castleage.wikia.com/wiki/Azriel,_the_Angel_of_Wrath
        'Wrath' : {
            duration     : 168,
            hp           : 600000000,
            ach          : 4000000,
            siege        : 7,
            siegeClicks  : [30, 60, 90, 120, 200, 250, 300],
            siegeDam     : [22250000, 27500000, 32500000, 37500000, 42500000, 47500000, 55000000],
            siege_img    : [
                '/graphics/water_siege_',
                '/graphics/alpha_bahamut_siege_blizzard_',
                '/graphics/azriel_siege_inferno_'
            ],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            general      : '',
            charClass    : {
                'Warrior' : {
                    statusWord   : 'jaws',
                    pwrAtkButton : 'nm_primary',
                    defButton    : 'nm_secondary'
                },
                'Rogue'   : {
                    statusWord   : 'heal',
                    pwrAtkButton : 'nm_primary',
                    defButton    : 'nm_secondary'
                },
                'Mage'    : {
                    statusWord   : 'lava',
                    pwrAtkButton : 'nm_primary',
                    defButton    : 'nm_secondary'
                },
                'Cleric'  : {
                    statusWord   : 'mana',
                    pwrAtkButton : 'nm_primary',
                    defButton    : 'nm_secondary'
                }
            }
        },

        'Alpha Mephistopheles' : {
            duration     : 168,
            hp           : 600000000,
            ach          : 4000000,
            siege        : 10,
            siegeClicks  : [15, 30, 45, 60, 75, 100, 150, 200, 250, 300],
            siegeDam     : [19050000, 22860000, 26670000, 30480000, 34290000, 38100000, 45720000, 49530000, 53340000, 60960000],
            siege_img    : [
                '/graphics/earth_siege_',
                '/graphics/castle_siege_',
                '/graphics/skaar_siege_'
            ],
            fort         : true,
            staUse       : 5,
            staLvl       : [0, 100, 200, 500],
            staMax       : [5, 10, 20, 50],
            nrgMax       : [10, 20, 40, 100],
            general      : '',
            charClass    : {
                'Warrior' : {
                    statusWord   : 'jaws',
                    pwrAtkButton : 'nm_primary',
                    defButton    : 'nm_secondary'
                },
                'Rogue'   : {
                    statusWord   : 'heal',
                    pwrAtkButton : 'nm_primary',
                    defButton    : 'nm_secondary'
                },
                'Mage'    : {
                    statusWord   : 'lava',
                    pwrAtkButton : 'nm_primary',
                    defButton    : 'nm_secondary'
                },
                'Cleric'  : {
                    statusWord   : 'mana',
                    pwrAtkButton : 'nm_primary',
                    defButton    : 'nm_secondary'
                }
            }
        }
    },

    monster: {},

    monsterEngageButtons: {},

    completeButton: {},

    parseCondition: function (type, conditions) {
        try {
            if (!conditions || conditions.toLowerCase().indexOf(':' + type) < 0) {
                return false;
            }

            var value = conditions.substring(conditions.indexOf(':' + type) + type.length + 1).replace(new RegExp(":.+"), '');
            if (/k$/i.test(value) || /m$/i.test(value)) {
                var first = /\d+k/i.test(value);
                var second = /\d+m/i.test(value);
                value = parseFloat(value, 10) * 1000 * (first + second * 1000);
            }

            return parseFloat(value, 10);
        } catch (err) {
            global.error("ERROR in parseCondition: " + err);
            return false;
        }
    },

    getMonstType: function (name) {
        try {
            var words = name.split(" ");
            var count = words.length - 1;
            if (count >= 4) {
                if (words[count - 4] === 'Alpha' && words[count - 1] === 'Volcanic' && words[count] === 'Dragon') {
                    return words[count - 4] + ' ' + words[count - 1] + ' ' + words[count];
                }
            }

            if (words[count] === 'Mephistopheles' && words[count - 1] === 'Alpha') {
                return words[count - 1] + ' ' + words[count];
            }
            if (words[count] === 'Elemental' || words[count] === 'Dragon') {
                return words[count - 1] + ' ' + words[count];
            }

            return words[count];
        } catch (err) {
            global.error("ERROR in getMonstType: " + err);
            return '';
        }
    },

    CheckResults_fightList: function () {
        try {
            global.log(9, "CheckResults_fightList - get all buttons to check monsterObjectList");
            // get all buttons to check monsterObjectList
            var ss = document.evaluate(".//img[contains(@src,'dragon_list_btn_') or contains(@src,'mp_button_summon_')]", document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (ss.snapshotLength === 0) {
                global.log(1, "No monster buttons found");
                return false;
            }

            var page = gm.getValue('page', 'battle_monster');
            var firstMonsterButtonDiv = this.CheckForImage('dragon_list_btn_');
            if ((firstMonsterButtonDiv) && !(firstMonsterButtonDiv.parentNode.href.match('user=' + this.stats.FBID) ||
                    firstMonsterButtonDiv.parentNode.href.match(/alchemy\.php/))) {
                var pageUserCheck = gm.getValue('pageUserCheck', '');
                if (pageUserCheck) {
                    global.log(1, "On another player's keep.", pageUserCheck);
                    return false;
                }
            }

            if (page === 'battle_monster' && ss.snapshotLength === 1) {
                global.log(1, "No monsters to review");
                gm.setValue('reviewDone', 1);
                return true;
            }

            var startCount = 0;
            if (page === 'battle_monster') {
                startCount = 1;
            }

            global.log(9, "startCount", startCount);
            // Review monsters and find attack and fortify button
            var monsterList = [];
            for (var s = startCount; s < ss.snapshotLength; s += 1) {
                var engageButtonName = ss.snapshotItem(s).src.match(/dragon_list_btn_\d/i)[0];
                var monsterRow = ss.snapshotItem(s).parentNode.parentNode.parentNode.parentNode;
                var monsterFull = $.trim(nHtml.GetText(monsterRow));
                var monster = $.trim(monsterFull.replace('Completed!', '').replace(/Fled!/i, ''));
                monsterList.push(monster);
                // Make links for easy clickin'
                var url = ss.snapshotItem(s).parentNode.href;
                if (!(url && url.match(/user=/) && (url.match(/mpool=/) || url.match(/raid\.php/)))) {
                    continue;
                }

                gm.setListObjVal('monsterOl', monster, 'page', page);
                switch (engageButtonName) {
                case 'dragon_list_btn_2' :
                    gm.setListObjVal('monsterOl', monster, 'status', 'Collect Reward');
                    gm.setListObjVal('monsterOl', monster, 'color', 'grey');
                    break;
                case 'dragon_list_btn_3' :
                    this.monsterEngageButtons[monster] = ss.snapshotItem(s);
                    break;
                case 'dragon_list_btn_4' :
                    if (page === 'raid' && !(/!/.test(monsterFull))) {
                        this.monsterEngageButtons[monster] = ss.snapshotItem(s);
                        break;
                    }

                    if (!this.completeButton[page]) {
                        this.completeButton[page] = this.CheckForImage('cancelButton.gif', monsterRow);
                    }

                    gm.setListObjVal('monsterOl', monster, 'status', 'Complete');
                    gm.setListObjVal('monsterOl', monster, 'color', 'grey');
                    break;
                default :
                }

                var mpool = ((url.match(/mpool=\d+/i)) ? '&mpool=' + url.match(/mpool=\d+/i)[0].split('=')[1] : '');
                var monstType = this.getMonstType(monster);
                var siege = '';
                if (monstType === 'Siege') {
                    siege = "&action=doObjective";
                } else {
                    var boss = this.monsterInfo[monstType];
                    siege = (boss && boss.siege) ? "&action=doObjective" : '';
                }

                var link = "<a href='http://apps.facebook.com/castle_age/" + page +
                        ".php?casuser=" + url.match(/user=\d+/i)[0].split('=')[1] +
                        mpool + siege + "'>Link</a>";
                gm.setListObjVal('monsterOl', monster, 'Link', link);
            }
            gm.setValue('reviewDone', 1);

            gm.getList('monsterOl').forEach(function (monsterObj) {
                var monster = monsterObj.split(global.vs)[0];
                if (monsterObj.indexOf(global.vs + 'page' + global.ls) < 0) {
                    gm.deleteListObj('monsterOl', monster);
                } else if (monsterList.indexOf(monster) < 0 && monsterObj.indexOf('page' + global.ls + page) >= 0) {
                    gm.deleteListObj('monsterOl', monster);
                }
            });

            return true;
        } catch (err) {
            global.error("ERROR in CheckResults_fightList: " + err);
            return false;
        }
    },

    t2kCalc: function (boss, time, percentHealthLeft, siegeStage, clicksNeededInCurrentStage) {
        try {
            var siegeStageStr = (siegeStage - 1).toString();
            var timeLeft = parseInt(time[0], 10) + (parseInt(time[1], 10) * 0.0166);
            var timeUsed = (boss.duration - timeLeft);
            if (!boss.siege || !boss.hp) {
                return Math.round((percentHealthLeft * timeUsed / (100 - percentHealthLeft)) * 10) / 10;
            }

            var T2K = 0;
            var damageDone = (100 - percentHealthLeft) / 100 * boss.hp;
            var hpLeft = boss.hp - damageDone;
            var totalSiegeDamage = 0;
            var totalSiegeClicks = 0;
            var attackDamPerHour = 0;
            var clicksPerHour = 0;
            var clicksToNextSiege = 0;
            var nextSiegeAttackPlusSiegeDamage = 0;
            for (var s in boss.siegeClicks) {
                if (boss.siegeClicks.hasOwnProperty(s)) {
                    global.log(9, 's ', s, ' T2K ', T2K, ' hpLeft ', hpLeft);
                    if (s < siegeStageStr  || clicksNeededInCurrentStage === 0) {
                        totalSiegeDamage += boss.siegeDam[s];
                        totalSiegeClicks += boss.siegeClicks[s];
                    }

                    if (s === siegeStageStr) {
                        attackDamPerHour = (damageDone - totalSiegeDamage) / timeUsed;
                        clicksPerHour = (totalSiegeClicks + boss.siegeClicks[s] - clicksNeededInCurrentStage) / timeUsed;
                        global.log(9, 'Attack Damage Per Hour: ', attackDamPerHour, ' Damage Done: ', damageDone, ' Total Siege Damage: ', totalSiegeDamage, ' Time Used: ', timeUsed, ' Clicks Per Hour: ', clicksPerHour);
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

            var t2kValue = Math.round(T2K * 10) / 10;
            global.log(1, 'T2K based on siege: ' + t2kValue + ' T2K estimate without calculating siege impacts: ' + Math.round(percentHealthLeft / (100 - percentHealthLeft) * timeLeft * 10) / 10);
            return t2kValue;
        } catch (err) {
            global.error("ERROR in t2kCalc: " + err);
            return 0;
        }
    },

    CheckResults_viewFight: function () {
        try {
            // Check if on monster page (nm_top.jpg for Volcanic Dragon & WORTP)
            // (nm_top_2.jpg for Alpha Volcanic Dragon)
            var webSlice = this.CheckForImage('dragon_title_owner.jpg');
            if (!webSlice) {
                webSlice = this.CheckForImage('nm_top.jpg');
                if (!webSlice) {
                    webSlice = this.CheckForImage('nm_top_2.jpg');
                    if (!webSlice) {
                        global.log(1, 'Can not find identifier for monster fight page.');
                        return;
                    }
                }
            }

            // Get name and type of monster
            var yourRegEx = new RegExp(".+'s "),
                monster   = nHtml.GetText(webSlice);

            if (this.CheckForImage('nm_volcanic_title.jpg')) {
                monster = monster.match(yourRegEx) + 'Bahamut, the Volcanic Dragon';
                monster = $.trim(monster);
            } else if (this.CheckForImage('nm_volcanic_title_2.jpg')) {
                monster = monster.match(yourRegEx) + 'Alpha Bahamut, the Volcanic Dragon';
                monster = $.trim(monster);
            } else if (this.CheckForImage('nm_azriel_title.jpg')) {
                monster = monster.match(yourRegEx) + 'Azriel, the Angel of Wrath';
                monster = $.trim(monster);
            } else if (this.CheckForImage('nm_war_title.jpg')) {
                monster = monster.match(yourRegEx) + 'War of the Red Plains';
                monster = $.trim(monster);
            } else if (this.CheckForImage('nm_mephistopheles2_title.jpg')) {
                monster = monster.match(yourRegEx) + 'Alpha Mephistopheles';
                monster = $.trim(monster);
            } else {
                monster = $.trim(monster.substring(0, monster.indexOf('You have (')));
            }

            var fort      = null,
                monstType = '';

            if (this.CheckForImage('raid_1_large.jpg')) {
                monstType = 'Raid I';
            } else if (this.CheckForImage('raid_b1_large.jpg')) {
                monstType = 'Raid II';
            } else if (this.CheckForImage('nm_volcanic_large_2.jpg')) {
                monstType = 'Alpha Volcanic Dragon';
            } else if (this.CheckForImage('nm_azriel_large2.jpg')) {
                monstType = 'Wrath';
            } else if (this.CheckForImage('nm_war_large.jpg')) {
                monstType = 'Plains';
            } else if (this.CheckForImage('nm_mephistopheles2_large.jpg')) {
                monstType = 'Alpha Mephistopheles';
            } else {
                monstType = this.getMonstType(monster);
            }

            if (nHtml.FindByAttr(webSlice, 'img', 'uid', this.stats.FBID)) {
                monster = monster.replace(yourRegEx, 'Your ');
            }

            var now = (new Date().getTime());
            gm.setListObjVal('monsterOl', monster, 'review', now.toString());
            gm.setValue('monsterRepeatCount', 0);
            var lastDamDone = gm.getListObjVal('monsterOl', monster, 'Damage', 0);
            gm.setListObjVal('monsterOl', monster, 'Type', monstType);
            // Extract info
            var time          = [],
                monsterTicker = $("#app46755028429_monsterTicker");

            if (monsterTicker.length) {
                global.log(2, "Monster ticker found.");
                time = monsterTicker.text().split(":");
            } else {
                global.log(1, "Could not locate Monster ticker.");
            }

            var boss         = '',
                currentPhase = 0,
                miss         = '',
                fortPct      = null;

            if (time && time.length === 3 && this.monsterInfo[monstType] && this.monsterInfo[monstType].fort) {
                if (monstType === "Deathrune" || monstType === 'Ice Elemental') {
                    gm.setListObjVal('monsterOl', monster, 'Fort%', 100);
                } else {
                    gm.setListObjVal('monsterOl', monster, 'Fort%', 0);
                }

                // Check for mana forcefield
                var img = this.CheckForImage('bar_dispel');
                if (img) {
                    var manaHealth = img.parentNode.style.width;
                    manaHealth = manaHealth.substring(0, manaHealth.length - 1);
                    fortPct = 100 - Number(manaHealth);
                } else {
                    // Check fortify stuff
                    img = this.CheckForImage('seamonster_ship_health');
                    if (img) {
                        var shipHealth = img.parentNode.style.width;
                        fortPct = shipHealth.substring(0, shipHealth.length - 1);
                        if (monstType === "Legion" || monstType.indexOf('Elemental') >= 0) {
                            img = this.CheckForImage('repair_bar_grey');
                            if (img) {
                                var extraHealth = img.parentNode.style.width;
                                extraHealth = extraHealth.substring(0, extraHealth.length - 1);
                                fortPct = Math.round(Number(fortPct) * (100 / (100 - Number(extraHealth))));
                            }
                        }
                    } else {
                        // Check party health - Volcanic dragon
                        img = this.CheckForImage('nm_green');
                        if (img) {
                            var partyHealth = img.parentNode.style.width;
                            fortPct = partyHealth.substring(0, partyHealth.length - 1);
                        }

                        // Character type stuff
                        var bottomDiv  = null,
                            tempText   = '',
                            tempArr    = [],
                            character  = '',
                            tip        = '',
                            doCharAtk  = false,
                            statusTime = '';

                        bottomDiv = $("div[style*='nm_bottom.jpg']");
                        if (bottomDiv && bottomDiv.length) {
                            tempText = $.trim(bottomDiv.children().eq(0).children().text()).replace(new RegExp("[\\s\\s]+", 'g'), ' ');
                            if (tempText) {
                                global.log(2, "tempText", tempText);
                                tempArr = tempText.match(/Class: (\w+) /);
                                if (tempArr && tempArr.length === 2) {
                                    character = tempArr[1];
                                    global.log(1, "character", character);
                                } else {
                                    global.log(1, "Can't get character", tempArr);
                                }

                                tempArr = tempText.match(/Tip: ([\w ]+) Status/);
                                if (tempArr && tempArr.length === 2) {
                                    tip = tempArr[1];
                                    global.log(1, "tip", tip);
                                } else {
                                    global.log(1, "Can't get tip", tempArr);
                                }

                                tempArr = tempText.match(/Status Time Remaining: ([\w:]+)\s*/);
                                if (tempArr && tempArr.length === 2) {
                                    statusTime = tempArr[1];
                                    global.log(1, "statusTime", statusTime);
                                } else {
                                    global.log(1, "Can't get statusTime", tempArr);
                                }

                                if (character && tip) {
                                    doCharAtk = new RegExp(character).test(tip);
                                    global.log(1, "Do character specific attack", doCharAtk);
                                } else {
                                    global.log(1, "Missing 'character' or 'tip'", character, tip);
                                }
                            } else {
                                global.log(1, "Missing tempText");
                            }
                        } else {
                            global.log(1, "Missing bottomDiv");
                        }
                    }
                }

                if (fortPct !== null) {
                    gm.setListObjVal('monsterOl', monster, 'Fort%', (Math.round(fortPct * 10)) / 10);
                }
            }

            var damDone = 0;
            // Get damage done to monster
            webSlice = nHtml.FindByAttrContains(document.body, "td", "class", "dragonContainer");
            if (webSlice) {
                webSlice = nHtml.FindByAttrContains(webSlice, "td", "valign", "top");
                if (webSlice) {
                    webSlice = nHtml.FindByAttrContains(webSlice, "a", "href", "keep.php?casuser=" + this.stats.FBID) || nHtml.FindByAttrContains(webSlice, "a", "href", "keep.php?user=" + this.stats.FBID);
                    if (webSlice) {
                        var damList = null;
                        if (monstType === "Serpent" || monstType.indexOf('Elemental') >= 0 || monstType === "Deathrune") {
                            //damList = $.trim(nHtml.GetText(webSlice.parentNode.nextSibling.nextSibling)).split("/");
                            damList = $.trim(nHtml.GetText(webSlice.parentNode.parentNode.nextSibling.nextSibling)).split("/");
                            fort = this.NumberOnly(damList[1]);
                            damDone = this.NumberOnly(damList[0]) + fort;
                            gm.setListObjVal('monsterOl', monster, 'Fort', fort);
                        } else if (monstType === "Siege" || monstType === "Raid I" || monstType === "Raid II") {
                            damList = $.trim(nHtml.GetText(webSlice.parentNode.nextSibling.nextSibling));
                            damDone = this.NumberOnly(damList);
                        } else {
                            //damList = $.trim(nHtml.GetText(webSlice.parentNode.nextSibling.nextSibling));
                            damList = $.trim(nHtml.GetText(webSlice.parentNode.parentNode.nextSibling.nextSibling));
                            damDone = this.NumberOnly(damList);
                        }

                        gm.setListObjVal('monsterOl', monster, 'Damage', damDone);
                        //if (damDone) global.log(1, "Damage done = " + gm.getListObjVal('monsterOl',monster,'Damage'));
                    } else {
                        global.log(1, "Player hasn't done damage yet");
                    }
                } else {
                    global.log(1, "couldn't get top table");
                }
            } else {
                global.log(1, "couldn't get dragoncontainer");
            }

            var monsterConditions = gm.getListObjVal('monsterOl', monster, 'conditions', '');
            if (/:ac\b/.test(monsterConditions) ||
                    (monstType.match(/Raid/) && gm.getValue('raidCollectReward', false)) ||
                    (!monstType.match(/Raid/) && gm.getValue('monsterCollectReward', false))) {
                var counter     = parseInt(gm.getValue('monsterReviewCounter', -3), 10),
                    monsterList = gm.getList('monsterOl');

                if (counter >= 0 && monsterList[counter].indexOf(monster) >= 0 &&
                    (nHtml.FindByAttrContains(document.body, 'a', 'href', '&action=collectReward') ||
                     nHtml.FindByAttrContains(document.body, 'input', 'alt', 'Collect Reward'))) {
                    global.log(1, 'Collecting Reward');
                    gm.setListObjVal('monsterOl', monster, 'review', "1");
                    gm.setValue('monsterReviewCounter', counter -= 1);
                    gm.setListObjVal('monsterOl', monster, 'status', 'Collect Reward');
                    if (monster.indexOf('Siege') >= 0) {
                        if (nHtml.FindByAttrContains(document.body, 'a', 'href', '&rix=1')) {
                            gm.setListObjVal('monsterOl', monster, 'rix', 1);
                        } else {
                            gm.setListObjVal('monsterOl', monster, 'rix', 2);
                        }
                    }
                }
            }

            var hp             = 0,
                monstHealthImg = '';

            if (monstType.indexOf('Volcanic') >= 0 || monstType.indexOf('Wrath') >= 0 || monstType.indexOf('Plains') >= 0 || monstType.indexOf('Alpha Mephistopheles') >= 0) {
                monstHealthImg = 'nm_red.jpg';
            } else {
                monstHealthImg = 'monster_health_background.jpg';
            }

            if (time && time.length === 3 && this.CheckForImage(monstHealthImg)) {
                gm.setListObjVal('monsterOl', monster, 'TimeLeft', time[0] + ":" + time[1]);
                var hpBar        = null,
                    imgHealthBar = nHtml.FindByAttrContains(document.body, "img", "src", monstHealthImg);

                if (imgHealthBar) {
                    global.log(2, "Found monster health div.");
                    var divAttr   = imgHealthBar.parentNode.getAttribute("style").split(";"),
                        attrWidth = divAttr[1].split(":");

                    hpBar = $.trim(attrWidth[1]);
                } else {
                    global.log(1, "Could not find monster health div.");
                }

                if (hpBar) {
                    hp = Math.round(hpBar.replace(/%/, '') * 10) / 10; //fix two 2 decimal places
                    gm.setListObjVal('monsterOl', monster, 'Damage%', hp);
                    boss = this.monsterInfo[monstType];
                    if (!boss) {
                        global.log(1, 'Unknown monster');
                        return;
                    }
                }

                if (boss && boss.siege) {
                    var missRegEx = new RegExp(".*Need (\\d+) more.*");
                    if (monstType.indexOf('Volcanic') >= 0 || monstType.indexOf('Wrath') >= 0 || monstType.indexOf('Plains') >= 0 || monstType.indexOf('Alpha Mephistopheles') >= 0) {
                        miss = $.trim($("#app46755028429_action_logs").prev().children().eq(1).children().eq(3).text().replace(missRegEx, "$1"));
                        var totalCount = 0;
                        for (var ind = 0; ind < boss.siege_img.length; ind += 1) {
                            totalCount += $("img[src*=" + boss.siege_img[ind] + "]").size();
                        }

                        currentPhase = Math.min(totalCount, boss.siege);
                    } else {
                        if (monstType.indexOf('Raid') >= 0) {
                            miss = $.trim($("img[src*=" + boss.siege_img + "]").parent().parent().text().replace(missRegEx, "$1"));
                        } else {
                            miss = $.trim($("#app46755028429_action_logs").prev().children().eq(3).children().eq(2).children().eq(1).text().replace(missRegEx, "$1"));
                        }

                        var divSeigeLogs = document.getElementById("app46755028429_siege_log");
                        if (divSeigeLogs && !currentPhase) {
                            //global.log(1, "Found siege logs.");
                            var divSeigeCount = divSeigeLogs.getElementsByTagName("div").length;
                            if (divSeigeCount) {
                                currentPhase = Math.round(divSeigeCount / 4) + 1;
                            } else {
                                global.log(1, "Could not count siege logs.");
                            }
                        } else {
                            global.log(1, "Could not find siege logs.");
                        }
                    }

                    var phaseText = Math.min(currentPhase, boss.siege) + "/" + boss.siege + " need " + (isNaN(miss) ? 0 : miss);
                    gm.setListObjVal('monsterOl', monster, 'Phase', phaseText);
                }

                if (boss) {
                    if (isNaN(miss)) {
                        miss = 0;
                    }

                    var T2K = this.t2kCalc(boss, time, hp, currentPhase, miss);
                    gm.setListObjVal('monsterOl', monster, 'T2K', T2K.toString());
                }
            } else {
                global.log(1, 'Monster is dead or fled');
                gm.setListObjVal('monsterOl', monster, 'color', 'grey');
                var dofCheck = gm.getListObjVal('monsterOl', monster, 'status');
                if (dofCheck !== 'Complete' && dofCheck !== 'Collect Reward') {
                    gm.setListObjVal('monsterOl', monster, 'status', "Dead or Fled");
                }

                gm.setValue('resetselectMonster', true);
                return;
            }

            boss = this.monsterInfo[monstType];
            var achLevel = this.parseCondition('ach', monsterConditions);
            if (boss && achLevel === false) {
                achLevel = boss.ach;
            }

            var maxDamage = this.parseCondition('max', monsterConditions);
            fortPct = gm.getListObjVal('monsterOl', monster, 'Fort%', '');
            var maxToFortify = (this.parseCondition('f%', monsterConditions) !== false) ? this.parseCondition('f%', monsterConditions) : gm.getNumber('MaxToFortify', 0);
            var isTarget = (monster === gm.getValue('targetFromraid', '') ||
                    monster === gm.getValue('targetFrombattle_monster', '') ||
                    monster === gm.getValue('targetFromfortify', ''));
            if (monster === gm.getValue('targetFromfortify', '') && fortPct > maxToFortify) {
                gm.setValue('resetselectMonster', true);
            }

            // Start of Keep On Budget (KOB) code Part 1 -- required variables
            global.log(1, 'Start of Keep On Budget (KOB) Code');

            //default is disabled for everything
            var KOBenable = false;

            //default is zero bias hours for everything
            var KOBbiasHours = 0;

            //KOB needs to follow achievment mode for this monster so that KOB can be skipped.
            var KOBach = false;

            //KOB needs to follow max mode for this monster so that KOB can be skipped.
            var KOBmax = false;

            //KOB needs to follow minimum fortification state for this monster so that KOB can be skipped.
            var KOBminFort = false;

            //create a temp variable so we don't need to call parseCondition more than once for each if statement
            var KOBtmp = this.parseCondition('kob', monsterConditions);
            if (isNaN(KOBtmp)) {
                global.log(1, 'NaN branch');
                KOBenable = true;
                KOBbiasHours = 0;
            } else if (!KOBtmp) {
                global.log(1, 'false branch');
                KOBenable = false;
                KOBbiasHours = 0;
            } else {
                global.log(1, 'passed value branch');
                KOBenable = true;
                KOBbiasHours = KOBtmp;
            }

            //test if user wants kob active globally
            if (!KOBenable && gm.getValue('KOBAllMonters', false)) {
                KOBenable = true;
            }

            //disable kob if in level up mode or if we are within 5 stamina of max potential stamina
            if (this.InLevelUpMode() || this.stats.stamina.num >= this.stats.stamina.max - 5) {
                KOBenable = false;
            }
            global.log(1, 'Level Up Mode: ' + this.InLevelUpMode() + ' Stamina Avail: ' + this.stats.stamina.num + ' Stamina Max: ' + this.stats.stamina.max);

            //log results of previous two tests
            global.log(1, 'KOBenable: ' + KOBenable + ' KOB Bias Hours: ' + KOBbiasHours);

            //Total Time alotted for monster
            var KOBtotalMonsterTime = this.monsterInfo[monstType].duration;
            global.log(1, 'Total Time for Monster: ' + KOBtotalMonsterTime);

            //Total Damage remaining
            global.log(1, 'HP left: ' + hp);

            //Time Left Remaining
            var KOBtimeLeft = parseInt(time[0], 10) + (parseInt(time[1], 10) * 0.0166);
            global.log(1, 'TimeLeft: ' + KOBtimeLeft);

            //calculate the bias offset for time remaining
            var KOBbiasedTF = KOBtimeLeft - KOBbiasHours;

            //for 7 day monsters we want kob to not permit attacks (beyond achievement level) for the first 24 to 48 hours
            // -- i.e. reach achievement and then wait for more players and siege assist clicks to catch up
            if (KOBtotalMonsterTime >= 168) {
                KOBtotalMonsterTime = KOBtotalMonsterTime - gm.getValue('KOBDelayStart', 48);
            }

            //Percentage of time remaining for the currently selected monster
            var KOBPercentTimeRemaining = Math.round(KOBbiasedTF / KOBtotalMonsterTime * 1000) / 10;
            global.log(1, 'Percent Time Remaining: ' + KOBPercentTimeRemaining);

            // End of Keep On Budget (KOB) code Part 1 -- required variables

            if (maxDamage && damDone >= maxDamage) {
                gm.setListObjVal('monsterOl', monster, 'color', 'red');
                gm.setListObjVal('monsterOl', monster, 'over', 'max');
                //used with KOB code
                KOBmax = true;
                //used with kob debugging
                global.log(1, 'KOB - max activated');
                if (isTarget) {
                    gm.setValue('resetselectMonster', true);
                }
            } else if ((fortPct) && fortPct < gm.getNumber('MinFortToAttack', 1)) {
                gm.setListObjVal('monsterOl', monster, 'color', 'purple');
                //used with KOB code
                KOBminFort = true;
                //used with kob debugging
                global.log(1, 'KOB - MinFort activated');
                if (isTarget) {
                    gm.setValue('resetselectMonster', true);
                }
            } else if (damDone >= achLevel && gm.getValue('AchievementMode')) {
                gm.setListObjVal('monsterOl', monster, 'color', 'orange');
                gm.setListObjVal('monsterOl', monster, 'over', 'ach');
                //used with KOB code
                KOBach = true;
                //used with kob debugging
                global.log(1, 'KOB - achievement reached');
                if (isTarget && lastDamDone < achLevel) {
                    gm.setValue('resetselectMonster', true);
                }
            }

            //Start of KOB code Part 2 begins here
            if (KOBenable && !KOBmax && !KOBminFort && KOBach && hp < KOBPercentTimeRemaining) {
                //need to figure out a color for kob 'someday' - borrowing max's color for now
                gm.setListObjVal('monsterOl', monster, 'color', 'magenta');
                // this line is required or we attack anyway.
                gm.setListObjVal('monsterOl', monster, 'over', 'max');
                //used with kob debugging
                global.log(1, 'KOB - budget reached');
                if (isTarget) {
                    gm.setValue('resetselectMonster', true);
                    global.log(1, 'This monster no longer a target due to kob');
                }

            } else {
                if (!KOBmax && !KOBminFort && !KOBach) {
                    //the way that the if statements got stacked, if it wasn't kob it was painted black anyway
                    //had to jump out the black paint if max, ach or fort needed to paint the entry.
                    gm.setListObjVal('monsterOl', monster, 'color', 'black');
                }
            }
            //End of KOB code Part 2 stops here.

            if (this.CheckTimer('battleTimer')) {
                window.setTimeout(function () {
                    caap.SetDivContent('monster_mess', '');
                }, 2000);
            }
        } catch (err) {
            global.error("ERROR in CheckResults_viewFight: " + err);
        }
    },

    selectMonster: function () {
        try {
            if (!this.oneMinuteUpdate('selectMonster')) {
                return;
            }

            global.log(2, 'Selecting monster');
            // First we forget everything about who we already picked.
            gm.setValue('targetFrombattle_monster', '');
            gm.setValue('targetFromfortify', '');
            gm.setValue('targetFromraid', '');

            // Next we get our monster objects from the reposoitory and break them into separarte lists
            // for monster or raid.  If we are serializing then we make one list only.
            var monsterList = {};
            monsterList.battle_monster = [];
            monsterList.raid = [];
            monsterList.any = [];
            var monsterFullList = gm.getList('monsterOl');
            var monstPage = '';
            monsterFullList.forEach(function (monsterObj) {
                gm.setListObjVal('monsterOl', monsterObj.split(global.vs)[0], 'conditions', 'none');
                monstPage = gm.getObjVal(monsterObj, 'page');
                if (gm.getValue('SerializeRaidsAndMonsters', false)) {
                    monsterList.any.push(monsterObj);
                } else if ((monstPage === 'raid') || (monstPage === 'battle_monster')) {
                    monsterList[monstPage].push(monsterObj);
                }
            });

            //PLEASE NOTE BEFORE CHANGING
            //The Serialize Raids and Monsters dictates a 'single-pass' because we only need select
            //one "targetFromxxxx" to fill in. The other MUST be left blank. This is what keeps it
            //serialized!!! Trying to make this two pass logic is like trying to fit a square peg in
            //a round hole. Please reconsider before doing so.
            var selectTypes = [];
            if (gm.getValue('SerializeRaidsAndMonsters', false)) {
                selectTypes = ['any'];
            } else {
                selectTypes = ['battle_monster', 'raid'];
            }

            // We loop through for each selection type (only once if serialized between the two)
            // We then read in the users attack order list
            for (var s in selectTypes) {
                if (selectTypes.hasOwnProperty(s)) {
                    var selectType = selectTypes[s];
                    var firstOverAch = '';
                    var firstUnderMax = '';
                    var firstFortOverAch = '';
                    var firstFortUnderMax = '';
                    var attackOrderList = [];
                    // The extra apostrophe at the end of attack order makes it match any "soandos's monster" so it always selects a monster if available
                    if (selectType === 'any') {
                        var attackOrderList1 = gm.getValue('orderbattle_monster', '').split(/[\n,]/);
                        var attackOrderList2 = gm.getValue('orderraid', '').split(/[\n,]/).concat('your', "'");
                        attackOrderList = attackOrderList1.concat(attackOrderList2);
                    } else {
                        attackOrderList = gm.getValue('order' + selectType, '').split(/[\n,]/).concat('your', "'");
                    }

                    var monster = '';
                    var monsterConditions = '';
                    var monstType = '';
                    // Next we step through the users list getting the name and conditions
                    for (var p in attackOrderList) {
                        if (attackOrderList.hasOwnProperty(p)) {
                            if (!($.trim(attackOrderList[p]))) {
                                continue;
                            }

                            var attackOrderName = $.trim(attackOrderList[p].match(new RegExp("^[^:]+")).toString()).toLowerCase();
                            monsterConditions = $.trim(attackOrderList[p].replace(new RegExp("^[^:]+"), '').toString());
                            var monsterListCurrent = monsterList[selectType];
                            // Now we try to match the users name agains our list of monsters
                            for (var m in monsterListCurrent) {
                                if (monsterListCurrent.hasOwnProperty(m)) {
                                    var monsterObj = monsterListCurrent[m];
                                    monster = monsterObj.split(global.vs)[0];
                                    monstPage = gm.getObjVal(monsterObj, 'page');

                                    // If we set conditions on this monster already then we do not reprocess
                                    if (gm.getListObjVal('monsterOl', monster, 'conditions') !== 'none') {
                                        continue;
                                    }

                                    //If this monster does not match, skip to next one
                                    // Or if this monster is dead, skip to next one
                                    // Or if this monster is not the correct type, skip to next one
                                    if ((monster.toLowerCase().indexOf(attackOrderName) < 0) || (selectType !== 'any' && monstPage !== selectType)) {
                                        continue;
                                    }

                                    //Monster is a match so we set the conditions
                                    gm.setListObjVal('monsterOl', monster, 'conditions', monsterConditions);

                                    // If it's complete or collect rewards, no need to process further
                                    var color = gm.getObjVal(monsterObj, 'color', '');
                                    if (color === 'grey') {
                                        continue;
                                    }

                                    // checkMonsterDamage would have set our 'color' and 'over' values. We need to check
                                    // these to see if this is the monster we should select/
                                    var over = gm.getObjVal(monsterObj, 'over', '');
                                    if (!firstUnderMax && color !== 'purple') {
                                        if (over === 'ach') {
                                            if (!firstOverAch) {
                                                firstOverAch = monster;
                                            }
                                        } else if (over !== 'max') {
                                            firstUnderMax = monster;
                                        }
                                    }

                                    var monsterFort = parseFloat(gm.getObjVal(monsterObj, 'Fort%', 0));
                                    var maxToFortify = (this.parseCondition('f%', monsterConditions)  !== false) ? this.parseCondition('f%', monsterConditions) : gm.getNumber('MaxToFortify', 0);
                                    monstType = this.getMonstType(monster);
                                    /*
                                    global.log(1, monster + ' monsterFort < maxToFortify ' + (monsterFort < maxToFortify) + ' this.monsterInfo[monstType] ' +
                                        this.monsterInfo[monstType]+ ' this.monsterInfo[monstType].fort ' + this.monsterInfo[monstType].fort);
                                    */
                                    if (!firstFortUnderMax && monsterFort < maxToFortify &&
                                            monstPage === 'battle_monster' &&
                                            this.monsterInfo[monstType] &&
                                            this.monsterInfo[monstType].fort) {
                                        if (over === 'ach') {
                                            if (!firstFortOverAch) {
                                                //global.log(1, 'hitit');
                                                firstFortOverAch = monster;
                                            }
                                        } else if (over !== 'max') {
                                            //global.log(1, 'norm hitit');
                                            firstFortUnderMax = monster;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Now we use the first under max/under achievement that we found. If we didn't find any under
                    // achievement then we use the first over achievement
                    monster = firstUnderMax;
                    if (!monster) {
                        monster = firstOverAch;
                    }

                    if (selectType !== 'raid') {
                        gm.setValue('targetFromfortify', firstFortUnderMax);
                        if (!gm.getValue('targetFromfortify', '')) {
                            gm.setValue('targetFromfortify', firstFortOverAch);
                        }
                        //global.log(1, 'fort under max ' + firstFortUnderMax + ' fort over Ach ' + firstFortOverAch + ' fort target ' + gm.getValue('targetFromfortify', ''));
                    }

                    // If we've got a monster for this selection type then we set the GM variables for the name
                    // and stamina requirements
                    if (monster) {
                        monstPage = gm.getListObjVal('monsterOl', monster, 'page');
                        gm.setValue('targetFrom' + monstPage, monster);
                        monsterConditions = gm.getListObjVal('monsterOl', monster, 'conditions');
                        monstType = gm.getListObjVal('monsterOl', monster, 'Type', '');
                        if (monstPage === 'battle_monster') {
                            var nodeNum = 0;
                            if (!this.InLevelUpMode() && this.monsterInfo[monstType] && this.monsterInfo[monstType].staLvl) {
                                for (nodeNum = this.monsterInfo[monstType].staLvl.length - 1; nodeNum >= 0; nodeNum -= 1) {
                                    global.log(9, 'stamina.max:nodeNum:staLvl', this.stats.stamina.max, nodeNum, this.monsterInfo[monstType].staLvl[nodeNum]);
                                    if (this.stats.stamina.max >= this.monsterInfo[monstType].staLvl[nodeNum]) {
                                        break;
                                    }
                                }
                            }

                            global.log(8, 'MonsterStaminaReq:Info', monstType, nodeNum, this.monsterInfo[monstType]);
                            if (!this.InLevelUpMode() && this.monsterInfo[monstType] && this.monsterInfo[monstType].staMax && gm.getValue('PowerAttack') && gm.getValue('PowerAttackMax')) {
                                global.log(7, 'MonsterStaminaReq:PowerAttackMax', this.monsterInfo[monstType].staMax[nodeNum]);
                                gm.setValue('MonsterStaminaReq', this.monsterInfo[monstType].staMax[nodeNum]);
                            } else if (this.monsterInfo[monstType] && this.monsterInfo[monstType].staUse) {
                                global.log(7, 'MonsterStaminaReq:staUse', this.monsterInfo[monstType].staUse);
                                gm.setValue('MonsterStaminaReq', this.monsterInfo[monstType].staUse);
                            } else if ((this.InLevelUpMode() && this.stats.stamina.num >= 10) || monsterConditions.match(/:pa/i)) {
                                global.log(7, 'MonsterStaminaReq:pa', 5);
                                gm.setValue('MonsterStaminaReq', 5);
                            } else if (monsterConditions.match(/:sa/i)) {
                                global.log(7, 'MonsterStaminaReq:sa', 1);
                                gm.setValue('MonsterStaminaReq', 1);
                            } else if (gm.getValue('PowerAttack')) {
                                global.log(7, 'MonsterStaminaReq:PowerAttack', 5);
                                gm.setValue('MonsterStaminaReq', 5);
                            } else {
                                global.log(7, 'MonsterStaminaReq:default', 1);
                                gm.setValue('MonsterStaminaReq', 1);
                            }

                            global.log(2, 'MonsterStaminaReq:MonsterGeneral', gm.getValue('MonsterGeneral', 'Strider'));
                            if (gm.getValue('MonsterGeneral', 'Strider') === 'Orc King') {
                                global.log(2, 'MonsterStaminaReq:Orc King', gm.getValue('MonsterStaminaReq', 1) * 5);
                                gm.setValue('MonsterStaminaReq', gm.getValue('MonsterStaminaReq', 1) * 5);
                            }

                            if (gm.getValue('MonsterGeneral', 'Strider') === 'Barbarus') {
                                global.log(2, 'MonsterStaminaReq:Barbarus', gm.getValue('MonsterStaminaReq', 1) * 3);
                                gm.setValue('MonsterStaminaReq', gm.getValue('MonsterStaminaReq', 1) * 3);
                            }
                        } else {
                            // Switch RaidPowerAttack
                            global.log(8, 'RaidStaminaReq:Info', monstType, this.monsterInfo[monstType]);
                            if (gm.getValue('RaidPowerAttack', false) || monsterConditions.match(/:pa/i)) {
                                global.log(7, 'RaidStaminaReq:pa', 5);
                                gm.setValue('RaidStaminaReq', 5);
                            } else if (this.monsterInfo[monstType] && this.monsterInfo[monstType].staUse) {
                                global.log(7, 'RaidStaminaReq:staUse', this.monsterInfo[monstType].staUse);
                                gm.setValue('RaidStaminaReq', this.monsterInfo[monstType].staUse);
                            } else {
                                global.log(7, 'RaidStaminaReq:default', 1);
                                gm.setValue('RaidStaminaReq', 1);
                            }
                        }
                    }
                }
            }

        } catch (err) {
            global.error("ERROR in selectMonster: " + err);
        }
    },

    monsterConfirmRightPage: function (webSlice, monster) {
        try {
            // Confirm name and type of monster
            var yourRegEx     = new RegExp(".+'s "),
                monsterOnPage = nHtml.GetText(webSlice),
                monstPage     = null;

            if (this.CheckForImage('nm_volcanic_title.jpg')) {
                monsterOnPage = monsterOnPage.match(yourRegEx) + 'Bahamut, the Volcanic Dragon';
                monsterOnPage = $.trim(monsterOnPage);
            } else if (this.CheckForImage('nm_volcanic_title_2.jpg')) {
                monsterOnPage = monsterOnPage.match(yourRegEx) + 'Alpha Bahamut, the Volcanic Dragon';
                monsterOnPage = $.trim(monsterOnPage);
            } else if (this.CheckForImage('nm_azriel_title.jpg')) {
                monsterOnPage = monsterOnPage.match(yourRegEx) + 'Azriel, the Angel of Wrath';
                monsterOnPage = $.trim(monsterOnPage);
            } else if (this.CheckForImage('nm_war_title.jpg')) {
                monsterOnPage = monsterOnPage.match(yourRegEx) + 'War of the Red Plains';
                monsterOnPage = $.trim(monsterOnPage);
            } else if (this.CheckForImage('nm_mephistopheles2_title.jpg')) {
                monsterOnPage = monsterOnPage.match(yourRegEx) + 'Alpha Mephistopheles';
                monsterOnPage = $.trim(monsterOnPage);
            } else {
                monsterOnPage = $.trim(monsterOnPage.substring(0, monsterOnPage.indexOf('You have (')));
            }

            if (nHtml.FindByAttr(webSlice, 'img', 'uid', this.stats.FBID)) {
                monsterOnPage = monsterOnPage.replace(yourRegEx, 'Your ');
            }

            if (monster !== monsterOnPage) {
                global.log(1, 'Looking for ' + monster + ' but on ' + monsterOnPage + '. Going back to select screen');
                monstPage = gm.getListObjVal('monsterOl', monster, 'page');
                return this.NavigateTo('keep,' + monstPage);
            }

            return false;
        } catch (err) {
            global.error("ERROR in monsterConfirmRightPage: " + err);
            return false;
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
            if (!this.WhileSinceDidIt('monsterReview', 60 * 60) || (gm.getValue('WhenMonster') === 'Never' && gm.getValue('WhenBattle') === 'Never')) {
                return false;
            }

            /*-------------------------------------------------------------------------------------\
            We get the monsterReviewCounter.  This will be set to -3 if we are supposed to refresh
            the monsterOl completely. Otherwise it will be our index into how far we are into
            reviewing monsterOl.
            \-------------------------------------------------------------------------------------*/
            var counter = parseInt(gm.getValue('monsterReviewCounter', -3), 10);
            if (counter === -3) {
                gm.setValue('monsterOl', '');
                gm.setValue('monsterReviewCounter', counter += 1);
                return true;
            }

            if (counter === -2) {
                if (this.NavigateTo('battle_monster', 'tab_monster_list_on.gif')) {
                    gm.setValue('reviewDone', 0);
                    return true;
                }

                if (gm.getValue('reviewDone', 1) > 0) {
                    gm.setValue('monsterReviewCounter', counter += 1);
                } else {
                    return true;
                }
            }

            if (counter === -1) {
                if (this.NavigateTo(this.battlePage + ',raid', 'tab_raid_on.gif')) {
                    gm.setValue('reviewDone', 0);
                    return true;
                }

                if (gm.getValue('reviewDone', 1) > 0) {
                    gm.setValue('monsterReviewCounter', counter += 1);
                } else {
                    return true;
                }
            }

            if (!(gm.getValue('monsterOl', ''))) {
                return false;
            }

            /*-------------------------------------------------------------------------------------\
            Now we step through the monsterOl objects. We set monsterReviewCounter to the next
            index for the next reiteration since we will be doing a click and return in here.
            \-------------------------------------------------------------------------------------*/
            var monsterObjList = gm.getList('monsterOl');
            while (counter < monsterObjList.length) {
                var monsterObj = monsterObjList[counter];
                if (!monsterObj) {
                    gm.setValue('monsterReviewCounter', counter += 1);
                    continue;
                }
                /*-------------------------------------------------------------------------------------\
                If we looked at this monster more recently than an hour ago, skip it
                \-------------------------------------------------------------------------------------*/
                if (!this.WhileSinceDidIt(gm.getObjVal(monsterObj, 'review'), 60 * 60) ||
                            gm.getValue('monsterRepeatCount', 0) > 2) {
                    gm.setValue('monsterReviewCounter', counter += 1);
                    gm.setValue('monsterRepeatCount', 0);
                    continue;
                }
                /*-------------------------------------------------------------------------------------\
                We get our monster link
                \-------------------------------------------------------------------------------------*/
                var monster = monsterObj.split(global.vs)[0];
                this.SetDivContent('monster_mess', 'Reviewing/sieging ' + (counter + 1) + '/' + monsterObjList.length + ' ' + monster);
                var link = gm.getObjVal(monsterObj, 'Link');
                /*-------------------------------------------------------------------------------------\
                If the link is good then we get the url and any conditions for monster
                \-------------------------------------------------------------------------------------*/
                if (/href/.test(link)) {
                    link = link.split("'")[1];
                    var conditions = gm.getObjVal(monsterObj, 'conditions', '');
                    var monstType = gm.getObjVal(monsterObj, 'Type', '');
                    /*-------------------------------------------------------------------------------------\
                    If the autocollect token was specified then we set the link to do auto collect. If
                    the conditions indicate we should not do sieges then we fix the link.
                    \-------------------------------------------------------------------------------------*/
                    if ((((conditions) && (/:ac\b/.test(conditions))) ||
                            (monstType.match(/Raid/) && gm.getValue('raidCollectReward', false)) ||
                            (!monstType.match(/Raid/) && gm.getValue('monsterCollectReward', false))) && gm.getObjVal(monsterObj, 'status') === 'Collect Reward') {
                        if (general.Select('CollectGeneral')) {
                            return true;
                        }

                        link += '&action=collectReward';
                        if (monster.indexOf('Siege') >= 0) {
                            link += '&rix=' + gm.getObjVal(monsterObj, 'rix', '2');
                        }

                        link = link.replace('&action=doObjective', '');
                    } else if (((conditions) && (conditions.match(':!s'))) ||
                               (!gm.getValue('raidDoSiege', true) && monstType.match(/Raid/)) ||
                               (!gm.getValue('monsterDoSiege', true) && !monstType.match(/Raid/) && this.monsterInfo[monstType].siege) ||
                               this.stats.stamina.num === 0) {
                        link = link.replace('&action=doObjective', '');
                    }
                    /*-------------------------------------------------------------------------------------\
                    Now we use ajaxSendLink to display the monsters page.
                    \-------------------------------------------------------------------------------------*/
                    global.log(1, 'Reviewing ' + (counter + 1) + '/' + monsterObjList.length + ' ' + monster);
                    gm.setValue('ReleaseControl', true);
                    link = link.replace('http://apps.facebook.com/castle_age/', '');
                    link = link.replace('?', '?twt2&');
                    global.log(9, "Link", link);
                    this.ClickAjax(link);
                    gm.setValue('monsterRepeatCount', gm.getValue('monsterRepeatCount', 0) + 1);
                    gm.setValue('resetselectMonster', true);
                    return true;
                }
            }
            /*-------------------------------------------------------------------------------------\
            All done.  Set timer and tell selectMonster and dashboard they need to do thier thing.
            We set the monsterReviewCounter to do a full refresh next time through.
            \-------------------------------------------------------------------------------------*/
            this.JustDidIt('monsterReview');
            gm.setValue('resetselectMonster', true);
            gm.setValue('monsterReviewCounter', -3);
            global.log(1, 'Done with monster/raid review.');
            this.SetDivContent('monster_mess', '');
            return true;
        } catch (err) {
            global.error("ERROR in MonsterReview: " + err);
            return false;
        }
    },

    Monsters: function () {
        try {
            if (gm.getValue('WhenMonster', '') === 'Never') {
                this.SetDivContent('monster_mess', 'Monster off');
                return false;
            }

            ///////////////// Reivew/Siege all monsters/raids \\\\\\\\\\\\\\\\\\\\\\

            if (gm.getValue('WhenMonster') === 'Stay Hidden' && this.NeedToHide() && this.CheckStamina('Monster', 1)) {
                global.log(1, "Stay Hidden Mode: We're not safe. Go battle.");
                this.SetDivContent('monster_mess', 'Not Safe For Monster. Battle!');
                return false;
            }

            if (!this.CheckTimer('NotargetFrombattle_monster')) {
                return false;
            }

            ///////////////// Individual Monster Page \\\\\\\\\\\\\\\\\\\\\\

            // Establish a delay timer when we are 1 stamina below attack level.
            // Timer includes 5 min for stamina tick plus user defined random interval
            //global.log(1, !this.InLevelUpMode() + " && " + this.stats.stamina.num + " >= " + (gm.getNumber('MonsterStaminaReq', 1) - 1) + " && " + this.CheckTimer('battleTimer') + " && " + gm.getNumber('seedTime', 0) > 0);
            if (!this.InLevelUpMode() && this.stats.stamina.num === (gm.getNumber('MonsterStaminaReq', 1) - 1) && this.CheckTimer('battleTimer') && gm.getNumber('seedTime', 0) > 0) {
                this.SetTimer('battleTimer', 5 * 60 + Math.floor(Math.random() * gm.getValue('seedTime', 0)));
                this.SetDivContent('monster_mess', 'Monster Delay Until ' + this.DisplayTimer('battleTimer'));
                return false;
            }

            if (!this.CheckTimer('battleTimer')) {
                if (this.stats.stamina.num < gm.getNumber('MaxIdleStamina', this.stats.stamina.max)) {
                    this.SetDivContent('monster_mess', 'Monster Delay Until ' + this.DisplayTimer('battleTimer'));
                    return false;
                }
            }

            var fightMode = '';
            // Check to see if we should fortify, attack monster, or battle raid
            var monster = gm.getValue('targetFromfortify');
            var monstType = this.getMonstType(monster);
            var nodeNum = 0;
            var staLvl = null;
            var energyRequire = 10;

            if (monstType) {
                staLvl = this.monsterInfo[monstType].staLvl;
                if (!this.InLevelUpMode() && gm.getValue('PowerFortifyMax') && staLvl) {
                    for (nodeNum = this.monsterInfo[monstType].staLvl.length - 1; nodeNum >= 0; nodeNum -= 1) {
                        if (this.stats.stamina.max >= this.monsterInfo[monstType].staLvl[nodeNum]) {
                            break;
                        }
                    }
                }

                if (nodeNum >= 0 && nodeNum !== null && nodeNum !== undefined && gm.getValue('PowerAttackMax')) {
                    energyRequire = this.monsterInfo[monstType].nrgMax[nodeNum];
                }
            }

            if (gm.getValue('FortifyGeneral', 'Strider') === 'Orc King') {
                energyRequire = energyRequire * 5;
                global.log(2, 'Monsters Fortify:Orc King', energyRequire);
            }

            if (gm.getValue('FortifyGeneral', 'Strider') === 'Barbarus') {
                energyRequire = energyRequire * 3;
                global.log(2, 'Monsters Fortify:Barbarus', energyRequire);
            }

            if (monster && this.CheckEnergy(energyRequire, gm.getValue('WhenFortify', 'Energy Available'), 'fortify_mess')) {
                fightMode = gm.setValue('fightMode', 'Fortify');
            } else {
                monster = gm.getValue('targetFrombattle_monster');
                if (monster && this.CheckStamina('Monster', gm.getValue('MonsterStaminaReq', 1)) && gm.getListObjVal('monsterOl', monster, 'page') === 'battle_monster') {
                    fightMode = gm.setValue('fightMode', 'Monster');
                } else {
                    this.SetTimer('NotargetFrombattle_monster', 60);
                    return false;
                }
            }

            // Set right general
            if (general.Select(fightMode + 'General')) {
                return true;
            }

            monstType = this.getMonstType(monster);
            // Check if on engage monster page
            var imageTest = '';
            if (monstType === 'Volcanic Dragon' || monstType === 'Wrath' || monstType === 'Plains' || monstType === 'Alpha Mephistopheles') {
                imageTest = 'nm_top.jpg';
            } else if (monstType === 'Alpha Volcanic Dragon') {
                imageTest = 'nm_top_2.jpg';
            } else {
                imageTest = 'dragon_title_owner.jpg';
            }

            var webSlice = this.CheckForImage(imageTest);
            if (webSlice) {
                if (this.monsterConfirmRightPage(webSlice, monster)) {
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
                        "button_nm_s_",
                        'button_dispel.gif',
                        'attack_monster_button3.jpg'
                    ];
                } else if (gm.getValue('MonsterStaminaReq', 1) === 1) {
                    // not power attack only normal attacks
                    buttonList = singleButtonList;
                } else {
                    var monsterConditions = gm.getListObjVal('monsterOl', monster, 'conditions', ''),
                        tacticsValue      = 0,
                        partyHealth     = 0,
                        useTactics        = false;

                    if (gm.getValue('UseTactics', false)) {
                        useTactics = true;
                        tacticsValue = gm.getValue('TacticsThreshold', false);
                    }

                    if (monsterConditions && monsterConditions.match(/:tac/i)) {
                        useTactics = true;
                        tacticsValue = this.parseCondition("tac%", monsterConditions);
                    }

                    if (useTactics) {
                        partyHealth = parseFloat(gm.getListObjVal('monsterOl', monster, 'Fort%', 0));
                    }

                    if (tacticsValue !== false && partyHealth < tacticsValue) {
                        global.log(1, "Party health is below threshold value", partyHealth, tacticsValue);
                        useTactics = false;
                    }

                    if (useTactics && this.CheckForImage('nm_button_tactics.gif')) {
                        global.log(1, "Attacking monster using tactics buttons");
                        buttonList = [
                            'nm_button_tactics.gif'
                        ].concat(singleButtonList);
                    } else {
                        global.log(1, "Attacking monster using regular buttons");
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
                staLvl = this.monsterInfo[monstType].staLvl;
                if (!this.InLevelUpMode()) {
                    if (((fightMode === 'Fortify' && gm.getValue('PowerFortifyMax')) || (fightMode !== 'Fortify' && gm.getValue('PowerAttack') && gm.getValue('PowerAttackMax'))) && staLvl) {
                        for (nodeNum = this.monsterInfo[monstType].staLvl.length - 1; nodeNum >= 0; nodeNum -= 1) {
                            if (this.stats.stamina.max >= this.monsterInfo[monstType].staLvl[nodeNum]) {
                                break;
                            }
                        }
                    }
                }

                for (var i in buttonList) {
                    if (buttonList.hasOwnProperty(i)) {
                        attackButton = this.CheckForImage(buttonList[i], null, null, nodeNum);
                        if (attackButton) {
                            break;
                        }
                    }
                }

                if (attackButton) {
                    var attackMess = '';
                    if (fightMode === 'Fortify') {
                        attackMess = 'Fortifying ' + monster;
                    } else {
                        attackMess = (gm.getValue('MonsterStaminaReq', 1) >= 5 ? 'Power' : 'Single') + ' Attacking ' + monster;
                    }

                    global.log(1, attackMess);
                    this.SetDivContent('monster_mess', attackMess);
                    gm.setValue('ReleaseControl', true);
                    this.Click(attackButton, 8000);
                    return true;
                } else {
                    global.log(1, 'ERROR - No button to attack/fortify with.');
                    this.SetTimer('NotargetFrombattle_monster', 60);
                    return false;
                }
            }

            ///////////////// Check For Monster Page \\\\\\\\\\\\\\\\\\\\\\

            if (this.NavigateTo('keep,battle_monster', 'tab_monster_list_on.gif')) {
                return true;
            }

            if (gm.getValue('clearCompleteMonsters', false) && this.completeButton.battle_monster) {
                this.Click(this.completeButton.battle_monster, 1000);
                global.log(1, 'Cleared a completed monster');
                this.completeButton.battle_monster = '';
                return true;
            }

            var firstMonsterButtonDiv = this.CheckForImage('dragon_list_btn_');
            if ((firstMonsterButtonDiv) && !(firstMonsterButtonDiv.parentNode.href.match('user=' + this.stats.FBID) ||
                    firstMonsterButtonDiv.parentNode.href.match(/alchemy\.php/))) {
                var pageUserCheck = gm.getValue('pageUserCheck', '');
                if (pageUserCheck) {
                    global.log(1, "On another player's keep.", pageUserCheck);
                    return this.NavigateTo('keep,battle_monster');
                }
            }

            var engageButton = this.monsterEngageButtons[monster];
            if (engageButton) {
                this.SetDivContent('monster_mess', 'Opening ' + monster);
                this.Click(engageButton);
                return true;
            } else {
                this.SetTimer('NotargetFrombattle_monster', 60);
                global.log(1, 'No "Engage" button for ' + monster);
                return false;
            }
        } catch (err) {
            global.error("ERROR in Monsters: " + err);
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
                        global.log(1, 'Demi temp text problem', temp);
                    }
                });

                global.log(2, 'Points', points);
                if (success) {
                    this.demi.ambrosia.daily = this.GetStatusNumbers(points[0]);
                    this.demi.malekus.daily = this.GetStatusNumbers(points[1]);
                    this.demi.corvintheus.daily = this.GetStatusNumbers(points[2]);
                    this.demi.aurora.daily = this.GetStatusNumbers(points[3]);
                    this.demi.azeron.daily = this.GetStatusNumbers(points[4]);
                    this.last.battle = new Date().getTime();
                    this.SaveStats();
                    global.log(1, 'Demi', this.demi, this.last);
                }
            } else {
                global.log(1, 'Demi symDiv problem', symDiv);
            }

            return true;
        } catch (err) {
            global.error("ERROR in CheckResults_battle: " + err);
            return false;
        }
    },

    DemiPoints: function () {
        try {
            if (!gm.getValue('DemiPointsFirst', false) || gm.getValue('WhenMonster') === 'Never') {
                return false;
            }

            if (!this.WhileSinceDidIt(this.last.battle, (6 * 60 * 60))) {
                return this.NavigateTo(this.battlePage, 'battle_on.gif');
            }

            var demiPower      = 0,
                demiPointsDone = true;

            for (demiPower in this.demi) {
                if (this.demi.hasOwnProperty(demiPower)) {
                    if (this.demi[demiPower].daily.dif > 0) {
                        demiPointsDone = false;
                        break;
                    }
                }
            }

            global.log(1, 'DemiPointsDone', demiPointsDone);
            gm.setValue('DemiPointsDone', demiPointsDone);
            if (!demiPointsDone) {
                return this.Battle('DemiPoints');
            }

            global.log(1, 'DemiPoints here');
            return false;
        } catch (err) {
            global.error("ERROR in DemiPoints: " + err);
            return false;
        }
    },

    minutesBeforeLevelToUseUpStaEnergy : 5,

    InLevelUpMode: function () {
        try {
            if (!gm.getValue('EnableLevelUpMode', true)) {
                //if levelup mode is false then new level up mode is also false (kob)
                this.newLevelUpMode = false;
                return false;
            }

            if (!(this.stats.indicators.enl) || (this.stats.indicators.enl).toString().match(new Date(2009, 1, 1).getTime())) {
                //if levelup mode is false then new level up mode is also false (kob)
                this.newLevelUpMode = false;
                return false;
            }

            if (((this.stats.indicators.enl - new Date().getTime()) < this.minutesBeforeLevelToUseUpStaEnergy * 60 * 1000) || (this.stats.exp.dif <= gm.getValue('LevelUpGeneralExp', 0))) {
                //detect if we are entering level up mode for the very first time (kob)
                if (!this.newLevelUpMode) {
                    //set the current level up mode flag so that we don't call refresh monster routine more than once (kob)
                    this.newLevelUpMode = true;
                    this.refreshMonstersListener();
                }

                return true;
            }

            //if levelup mode is false then new level up mode is also false (kob)
            this.newLevelUpMode = false;
            return false;
        } catch (err) {
            global.error("ERROR in InLevelUpMode: " + err);
            return false;
        }
    },

    CheckStamina: function (battleOrBattle, attackMinStamina) {
        try {
            global.log(9, "CheckStamina", battleOrBattle, attackMinStamina);
            if (!attackMinStamina) {
                attackMinStamina = 1;
            }

            var when = gm.getValue('When' + battleOrBattle, '');
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

            if (when === 'At X Stamina') {
                if (this.InLevelUpMode() && this.stats.stamina.num >= attackMinStamina) {
                    this.SetDivContent('battle_mess', 'Burning stamina to level up');
                    return true;
                }

                var staminaMF = battleOrBattle + 'Stamina';
                if (gm.getValue('BurnMode_' + staminaMF, false) || this.stats.stamina.num >= gm.getValue('X' + staminaMF, 1)) {
                    if (this.stats.stamina.num < attackMinStamina || this.stats.stamina.num <= gm.getValue('XMin' + staminaMF, 0)) {
                        gm.setValue('BurnMode_' + staminaMF, false);
                        return false;
                    }

                    //this.SetDivContent('battle_mess', 'Burning stamina');
                    gm.setValue('BurnMode_' + staminaMF, true);
                    return true;
                } else {
                    gm.setValue('BurnMode_' + staminaMF, false);
                }

                this.SetDivContent('battle_mess', 'Waiting for stamina: ' + this.stats.stamina.num + "/" + gm.getValue('X' + staminaMF, 1));
                return false;
            }

            if (when === 'At Max Stamina') {
                if (!gm.getValue('MaxIdleStamina', 0)) {
                    global.log(1, "Changing to idle general to get Max Stamina");
                    this.PassiveGeneral();
                }

                if (this.stats.stamina.num >= gm.getValue('MaxIdleStamina')) {
                    this.SetDivContent('battle_mess', 'Using max stamina');
                    return true;
                }

                if (this.InLevelUpMode() && this.stats.stamina.num >= attackMinStamina) {
                    this.SetDivContent('battle_mess', 'Burning all stamina to level up');
                    return true;
                }

                this.SetDivContent('battle_mess', 'Waiting for max stamina: ' + this.stats.stamina.num + "/" + gm.getValue('MaxIdleStamina'));
                return false;
            }

            if (this.stats.stamina.num >= attackMinStamina) {
                return true;
            }

            this.SetDivContent('battle_mess', 'Waiting for more stamina: ' + this.stats.stamina.num + "/" + attackMinStamina);
            return false;
        } catch (err) {
            global.error("ERROR in CheckStamina: " + err);
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
        if (gm.getValue('WhenMonster', '') === 'Never') {
            global.log(1, 'Stay Hidden Mode: Monster battle not enabled');
            return true;
        }

        if (!gm.getValue('targetFrombattle_monster', '')) {
            global.log(1, 'Stay Hidden Mode: No monster to battle');
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
        var riskConstant = gm.getNumber('HidingRiskConstant', 1.7);
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
    //                          MONSTER FINDER
    /////////////////////////////////////////////////////////////////////

    mf_attackButton: null,

    monstArgs: {
        'doaid': {
            fname: 'Any Weapon Aid',
            sname: 'Aid',
            urlid: 'doObjective'
        },
        'urlix': {
            fname: 'Any Monster',
            sname: 'Any',
            urlid: 'user'
        },
        'legio': {
            fname: 'Battle of the Dark Legion',
            sname: 'Legion',
            nname: 'castle',
            imgid: 'cta_castle_',
            twt2: 'corc_'
        },
        'hydra': {
            fname: 'Cronus, The World Hydra ',
            sname: 'Cronus',
            nname: 'hydra',
            imgid: 'twitter_hydra_objective',
            twt2: 'hydra_'
        },
        /*
        'elems': {
            fname: 'Any Elemental',
            sname:'Elemental',
            nname:'elems',
            imgid:'',
            twt2: ''
        },
        */
        'earth': {
            fname: 'Genesis, The Earth Elemental ',
            sname: 'Genesis',
            nname: 'earthelemental',
            imgid: 'cta_earth_',
            twt2: 'earth_'
        },
        'ice': {
            fname: 'Ragnarok, The Ice Elemental ',
            sname: 'Ragnarok',
            nname: 'iceelemental',
            imgid: 'cta_water_',
            twt2: 'water_'
        },
        'kull': {
            fname: 'Kull, the Orc Captain',
            sname: 'Kull',
            nname: 'captain',
            imgid: 'cta_orc_captain.gif',
            twt2: 'bosscaptain'
        },
        'gilda': {
            fname: 'Gildamesh, the Orc King',
            sname: 'Gildamesh',
            nname: 'king',
            imgid: 'cta_orc_king.gif',
            twt2: 'bossgilda'
        },
        'colos': {
            fname: 'Colossus of Terra',
            sname: 'Colossus',
            nname: 'stone',
            imgid: 'cta_stone.gif',
            twt2: 'bosscolossus'
        },
        'sylva': {
            fname: 'Sylvanas the Sorceress Queen',
            sname: 'Sylvanas',
            nname: 'sylvanas',
            imgid: 'cta_sylvanas.gif',
            twt2: 'bosssylvanus'
        },
        'mephi': {
            fname: 'Mephistophles',
            sname: 'Mephisto',
            nname: 'mephi',
            imgid: 'cta_mephi.gif',
            twt2: 'bossmephistopheles'
        },
        'keira': {
            fname: 'Keira',
            sname: 'keira',
            nname: 'keira',
            imgid: 'cta_keira.gif',
            twt2: 'boss_img'
        },
        'lotus': {
            fname: 'Lotus Ravenmoore',
            sname: 'Ravenmoore',
            nname: 'lotus',
            imgid: 'cta_lotus.gif',
            twt2: 'bosslotus_'
        },
        'skaar': {
            fname: 'Skaar Deathrune',
            sname: 'Deathrune',
            nname: 'skaar',
            imgid: 'cta_death_',
            twt2: 'death_',
            deadimg: 'cta_death_dead.gif'
        },
        'serps': {
            fname: 'Any Serpent',
            sname: 'Serpent',
            nname: 'seamonster',
            imgid: 'twitter_seamonster_',
            twt2: 'sea_'
        },
        'eserp': {
            fname: 'Emerald Serpent',
            sname: 'Emerald Serpent',
            nname: 'greenseamonster',
            imgid: 'twitter_seamonster_green_1',
            twt2: 'sea_'
        },
        'sserp': {
            fname: 'Saphire Serpent',
            sname: 'Saphire Serpent',
            nname: 'blueseamonster',
            imgid: 'twitter_seamonster_blue_1',
            twt2: 'sea_'
        },
        'aserp': {
            fname: 'Amethyst Serpent',
            sname: 'Amethyst Serpent',
            nname: 'purpleseamonster',
            imgid: 'twitter_seamonster_purple_1',
            twt2: 'sea_'
        },
        'rserp': {
            fname: 'Ancient Serpent',
            sname: 'Ancient Serpent',
            nname: 'redseamonster',
            imgid: 'twitter_seamonster_red_1',
            twt2: 'sea_'
        },
        'drags': {
            fname: 'Any Dragon',
            sname: 'Dragon',
            nname: 'drag',
            imgid: '_dragon.gif',
            twt2: 'dragon_'
        },
        'edrag': {
            fname: 'Emerald Dragon',
            sname: 'Emerald Dragon',
            nname: 'greendragon',
            imgid: 'cta_green_dragon.gif',
            twt2: 'dragon_'
        },
        'fdrag': {
            fname: 'Frost Dragon',
            sname: 'Frost Dragon',
            nname: 'bluedragon',
            imgid: 'cta_blue_dragon.gif',
            twt2: 'dragon_'
        },
        'gdrag': {
            fname: 'Gold Dragon',
            sname: 'Gold Dragon',
            nname: 'yellowdragon',
            imgid: 'cta_yellow_dragon.gif"',
            twt2: 'dragon_'
        },
        'rdrag': {
            fname: 'Ancient Red Dragon',
            sname: 'Red Dragon',
            nname: 'reddragon',
            imgid: 'cta_red_dragon.gif',
            twt2: 'dragon_'
        },
        'deas': {
            fname: 'Any Deathrune Raid',
            sname: 'Deathrune Raid',
            nname: 'deathrune',
            imgid: 'raid_deathrune_',
            twt2: 'deathrune_'
        },
        'a1dea': {
            fname: 'Deathrune Raid I Part 1',
            sname: 'Deathrune Raid A1',
            nname: 'deathrunea1',
            imgid: 'raid_deathrune_a1.gif',
            twt2: 'deathrune_'
        },
        'a2dea': {
            fname: 'Deathrune Raid I Part 2',
            sname: 'Deathrune Raid A2',
            nname: 'deathrunea2',
            imgid: 'raid_deathrune_a2.gif',
            twt2: 'deathrune_'
        },
        'b1dea': {
            fname: 'Deathrune Raid II Part 1',
            sname: 'Deathrune Raid B1',
            nname: 'deathruneb1',
            imgid: 'raid_deathrune_b1.gif',
            twt2: 'deathrune_'
        },
        'b2dea': {
            fname: 'Deathrune Raid II Part 2',
            sname: 'Deathrune Raid B2',
            nname: 'deathruneb2',
            imgid: 'raid_deathrune_b2.gif',
            twt2: 'deathrune_'
        }
    },

    monstGroups: {
        'doaid': {
            monst: 'legio~hydra~earth~ice~sylva~skaar~a1dea~a2dea~b1dea~b2dea'
        },
        'world': {
            monst: 'legio~hydra~earth~ice',
            max: '5'
        },
        'serps': {
            monst: 'eserp~sserp~aserp~rserp'
        },
        'drags': {
            monst: 'edrag~fdrag~gdrag~rdrag'
        },
        'deas': {
            monst: 'a1dea~a2dea~b1dea~b2dea'
        },
        'elems': {
            monst: 'earth~ice'
        }
    },

    MonsterFinder: function () {
        if (!gm.getValue("MonsterFinderUse", false) || this.stats.stamina.num < gm.getValue("MonsterFinderMinStam", 20) || this.stats.health.num < 10) {
            return false;
        }

        var urlix = gm.getValue("urlix", "").replace("~", "");
        if (urlix === "" && gm.getValue("mfStatus", "") !== "OpenMonster" && caap.WhileSinceDidIt("clearedMonsterFinderLinks", 24 * 60 * 60)) {
            gm.setValue("mfStatus", "");
            global.log(1, "Resetting monster finder history");
            this.clearLinks();
        }

        global.log(1, "All checks passed to enter Monster Finder");
        if (window.location.href.indexOf("filter=app_46755028429") < 0) {
            var mfstatus = gm.getValue("mfStatus", "");
            if (mfstatus === "OpenMonster") {
                caap.CheckMonster();
                return true;
            } else if (mfstatus === "MonsterFound") {
                caap.VisitUrl("http://apps.facebook.com/castle_age" + gm.getValue("navLink"));
                gm.setValue("mfStatus", "");
                return true;
            } else if ((mfstatus === "TestMonster" && this.WhileSinceDidIt('checkedFeed', 60 * 60 * 2)) || (!this.WhileSinceDidIt('checkedFeed', 60 * gm.getValue("MonsterFinderFeedMin", 5)))) {
                caap.selectMonst();
            } else {
                if (global.is_chrome) {
                    caap.VisitUrl("http://apps.facebook.com/?filter=app_46755028429&show_hidden=true&ignore_self=true&sk=lf", 0);
                } else {
                    caap.VisitUrl("http://www.facebook.com/?filter=app_46755028429&show_hidden=true&ignore_self=true&sk=lf", 0);
                }

                gm.setValue("mfStatus", "MFOFB");
                return false;
            }
        }
    },

    MonsterFinderOnFB: function () {
        if (gm.getValue("mfStatus", "") !== "MFOFB") {
            return false;
        }

        gm.setValue("mfStatus", "Running");
        var delayPer   = 10000,
            iterations = 2;

        gm.setValue("delayPer", delayPer);
        gm.setValue("iterations", iterations);
        gm.setValue("iterationsRun", 0);
        global.log(1, "Set mostRecentFeed");
        this.JustDidIt("checkedFeed");
        gm.setValue("monstersExhausted", false);
        this.bottomScroll();
    },

    CheckMonster: function () {
        //Look for Attack Button
        if (gm.getValue("mfStatus") !== "OpenMonster") {
            return false;
        }

        global.log(1, "Checking Monster: " + gm.getValue("navLink"));
        this.mf_attackButton = this.CheckForImage('attack_monster_button.jpg');
        if (!this.mf_attackButton) {
            this.mf_attackButton = this.CheckForImage('seamonster_power.gif');
            if (!this.mf_attackButton) {
                this.mf_attackButton = this.CheckForImage('attack_monster_button2.jpg');
                if (!this.mf_attackButton) {
                    this.mf_attackButton = this.CheckForImage('seamonster_power.gif');
                    if (!this.mf_attackButton) {
                        this.mf_attackButton = this.CheckForImage('attack_monster_button.jpg');
                        if (!this.mf_attackButton) {
                            this.mf_attackButton = this.CheckForImage('event_attack1.gif');
                            if (!this.mf_attackButton) {
                                this.mf_attackButton = this.CheckForImage('event_attack2.gif');
                                if (!this.mf_attackButton) {
                                    this.mf_attackButton = this.CheckForImage('raid_attack_button.gif');
                                }
                            }
                        }
                    }
                }
            }
        }

        if (this.mf_attackButton) {
            var dam = this.CheckResults_viewFight();
            global.log(1, "Found Attack Button.  Dam: " + dam);
            if (!dam) {
                global.log(1, "No Damage to monster, Attacking");
                caap.Click(this.mf_attackButton);
                window.setTimeout(function () {
                    global.log(1, "Hand off to Monsters section");
                    gm.setValue("urlixc", gm.getValue("urlixc", "~") + "~" + gm.getValue("navLink").replace("http://apps.facebook.com/castle_age", ""));
                    //caap.maintainUrl(gm.getValue("navLink").replace("http://apps.facebook.com/castle_age",""));
                    gm.setValue("mfStatus", "MonsterFound");
                    //caap.DeceiveDidIt("NotargetFrombattle_monster");
                    gm.setValue("navLink", "");
                    global.log(1, "Navigate to battle_monster");
                    //caap.VisitUrl("http://apps.facebook.com/castle_age/battle_monster.php");
                    caap.NavigateTo('battle_monster');
                    window.setTimeout(function () {
                        global.log(1, "resetselectMonster");
                        gm.setValue('resetselectMonster', true);
                        gm.setValue('LastAction', "Idle");
                        return true;
                    }, 4000);

                }, 4000);
                return false;
            } else {
                global.log(1, "Already attacked this monster, find new one");
                gm.setValue("urlixc", gm.getValue("urlixc", "~") + "~" + gm.getValue("navLink").replace("http://apps.facebook.com/castle_age", ""));
                //this.maintainUrl(gm.getValue("navLink").replace("http://apps.facebook.com/castle_age",""));
                gm.setValue("mfStatus", "TestMonster");
                gm.setValue("waitMonsterLoad", 0);
                return true;
            }
        } else {
            global.log(1, "No Attack Button");
            if (gm.getValue("waitMonsterLoad", 0) < 2) {
                global.log(1, "No Attack Button, Pass" + gm.getValue("waitMonsterLoad"));
                gm.setValue("waitMonsterLoad", gm.getValue("waitMonsterLoad", 0) + 1);
                gm.setValue("LastAction", "Idle");
                return true;
            } else {
                global.log(1, "No Attack Button, Find New Monster");
                gm.setValue("urlixc", gm.getValue("urlixc", "~") + gm.getValue("navLink").replace("http://apps.facebook.com/castle_age", ""));
                //this.maintainUrl(gm.getValue("navLink").replace("http://apps.facebook.com/castle_age",""));
                gm.setValue("mfStatus", "TestMonster");
                gm.setValue("waitMonsterLoad", 0);
                return true;
            }
        }
    },

    mfMain: function () {
        global.log(1, "Do Stuff " + new Date());
        if (gm.getValue("urlix", "") === "") {
            this.clearLinks();
        }

        //this.maintainAllUrl();
        //this.redirectLinks();
        this.handleCTA();
        global.log(1, "Scroll Up");
        nHtml.ScrollToTop();
        global.log(1, "Select Monster");
        this.selectMonst();
    },

    redirectLinks: function () {
        for (var x = 0; x < document.getElementsByTagName("a").length; x += 1) {
            document.getElementsByTagName('a')[x].target = "child_frame";
        }
    },

    bottomScroll: function () {
        nHtml.ScrollToBottom();
        //global.log(1, "Scroll To Bottom " + new Date() );
        nHtml.setTimeout(function () {
            caap.olderPosts();
        }, gm.getValue("delayPer", 60000));
    },

    olderPosts: function () {
        var itRun = gm.getValue("iterationsRun", 0);
        if (itRun > 0) {
            //var showMore = nHtml.getX('//a[@class=\'PagerMoreLink\']', document, nHtml.xpath.unordered);
            var showMore = nHtml.FindByAttrContains(document, "a", "class", "PagerMoreLink");
            if (showMore) {
                global.log(1, "Showing more ...");
                caap.Click(showMore);
                global.log(1, "Link clicked.");
            } else {
                global.log(1, "PagerMoreLink not found!");
            }
        }

        //this.NavigateTo("Older Posts");
        gm.setValue("iterationsRun", itRun += 1);
        global.log(1, "Get More Iterations " + gm.getValue("iterationsRun") + " of " + gm.getValue("iterations") + " " + new Date());
        if (gm.getValue("iterationsRun") < gm.getValue("iterations")) {
            nHtml.setTimeout(function () {
                caap.bottomScroll();
            }, gm.getValue("delayPer", 60000));
        } else {
            //global.log(1, "Made it Here, Try mfMain");
            nHtml.setTimeout(function () {
                caap.mfMain();
            }, gm.getValue("delayPer", 120000));
        }
    },

    selectMonst: function () {
        if (gm.getValue("monstersExhausted", false) === true) {
            return false;
        }

        global.log(1, "Select Monst Function");
        var monstPriority = gm.getValue("MonsterFinderOrder");

        global.log(1, "Monst Priority: " + monstPriority);

        var monstArray = monstPriority.split("~");
        global.log(1, "MonstArray: " + monstArray[0]);
        for (var x = 0; x < monstArray.length; x += 1) {
            if (gm.getValue(monstArray[x], "~") === "~") {
                gm.setValue(monstArray[x], "~");
            }

            global.log(1, "monstArray[x]: " + monstArray[x]);
            var monstType = monstArray[x];
            var monstList = gm.getValue(monstArray[x], "~");
            var monstLinks = monstList.replace(/~~/g, "~").split("~");
            var numlinks = 0;
            global.log(1, "Inside MonstArray For Loop " + monstArray[x] + " - Array[" + (monstLinks.length - 1) + "] " + gm.getValue(monstArray[x]).replace("~", "~\n"));
            for (var z = 0; z < monstLinks.length; z += 1) {
                if (monstLinks[z]) {
                    var link = monstLinks[z].replace("http://apps.facebook.com/castle_age", "");
                    var urlixc = gm.getValue("urlixc", "~");
                    // + "  UrlixC: " + urlixc);
                    if (urlixc.indexOf(link) === -1) {
                        global.log(1, "Navigating to Monst: " + monstArray[x] + "  Link: " + link);
                        link = "http://apps.facebook.com/castle_age" + link;
                        gm.setValue("navLink", link);
                        gm.setValue('clickUrl', link);
                        this.VisitUrl(link);
                        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        // code is unreachable because of this.VisitUrl
                        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        gm.setValue("mfStatus", "OpenMonster");
                        gm.setValue("LastAction", "Monsters");
                        this.waitMilliSecs =  10000;
                        return true;
                    } else {
                        numlinks += 1;
                        global.log(1, "Trimming already checked URL, Monst Type: " + monstType);
                        //var newVal = gm.getValue(monstArray[x],"~").replace("~" + link, "");
                        gm.setValue(monstType, gm.getValue(monstType).replace("~" + link, "").replace(/~~/g, "~"), "~");
                    }
                }
            }

            global.log(1, "Links Already Visited: " + monstArray[x] + " #:" + numlinks);
        }

        global.log(1, "All Monsters Tested");
        gm.setValue("monstersExhausted", true);
        gm.setValue("mfStatus", "");
        var numurl = gm.getValue("urlix", "~");
        if (nHtml.CountInstances(numurl) > 100) {
            global.log(1, "Idle- Resetting Monster Searcher Values, #-" + numurl);
            caap.clearLinks(true);
            gm.setValue("LastAction", "");
        }

        gm.setValue('clickUrl', "http://apps.facebook.com/castle_age/index.php?bm=1");
        this.VisitUrl("http://apps.facebook.com/castle_age/index.php?bm=1");
        return false;
    },

    clearLinks: function (resetall) {
        global.log(1, "Clear Links");
        if (resetall === true) {
            gm.setValue("navLink", "");
            gm.setValue("mfStatus", "");
            gm.setValue("waitMonsterLoad", 0);
            gm.setValue("urlixc", "~");
        }

        gm.setValue("urlix", "~");
        gm.setValue('doaid', '~');
        gm.setValue('legio', '~');
        gm.setValue('hydra', '~');
        gm.setValue('earth', '~');
        gm.setValue('ice', '~');
        gm.setValue('kull', '~');
        gm.setValue('gilda', '~');
        gm.setValue('colos', '~');
        gm.setValue('sylva', '~');
        gm.setValue('mephi', '~');
        gm.setValue('keira', '~');
        gm.setValue('lotus', '~');
        gm.setValue('skaar', '~');
        gm.setValue('serps', '~');
        gm.setValue('eserp', '~');
        gm.setValue('sserp', '~');
        gm.setValue('aserp', '~');
        gm.setValue('rserp', '~');
        gm.setValue('drags', '~');
        gm.setValue('edrag', '~');
        gm.setValue('fdrag', '~');
        gm.setValue('gdrag', '~');
        gm.setValue('rdrag', '~');
        gm.setValue('deas', '~');
        gm.setValue('a1dea', '~');
        gm.setValue('a2dea', '~');
        gm.setValue('b1dea', '~');
        gm.setValue('b2dea', '~');

        this.JustDidIt("clearedMonsterFinderLinks");
    },

    handleCTA: function () {
        var ctas = nHtml.getX('//div[@class=\'GenericStory_Body\']', document, nHtml.xpath.unordered);
        global.log(1, "Number of entries- " + ctas.snapshotLength);
        for (var x = 0; x < ctas.snapshotLength; x += 1) {
            var url = nHtml.getX('./div[2]/div/div/a/@href', ctas.snapshotItem(x), nHtml.xpath.string).replace("http://apps.facebook.com/castle_age", "");
            var fid = nHtml.Gup("user", url);
            var mpool = nHtml.Gup("mpool", url);
            var action = nHtml.Gup("action", url);
            var src = nHtml.getX('./div[2]/div/div/a/div/img/@src', ctas.snapshotItem(x), nHtml.xpath.string);
            var time = nHtml.getX('./form/span/span/a/abbr/@title', ctas.snapshotItem(x), nHtml.xpath.string);
            var monst = '';
            var urlixc = gm.getValue("urlixc", "~");
            if (src) {
                if (urlixc.indexOf(url) >= 0) {
                    //global.log(1, "Monster Already Checked");
                } else if (src.indexOf("cta_hydra_") >= 0 || src.indexOf("twitter_hydra_objective") >= 0) { //Hydra
                    monst = gm.getValue("hydra", "~");
                    if (monst.indexOf(url) === -1) {
                        gm.setValue("hydra", gm.getValue("hydra", "") + "~" + url);
                    }
                } else if (src.indexOf("cta_castle_") >= 0) { //Battle of the Dark Legion (Orcs)
                    monst = gm.getValue("legio", "~");
                    if (monst.indexOf(url) === -1) {
                        gm.setValue("legio", gm.getValue("legio", "") + "~" + url);
                    }
                } else if (src.indexOf("cta_earth_") >= 0) { //Genesis, the Earth Elemental
                    monst = gm.getValue("earth", "~");
                    if (monst.indexOf(url) === -1) {
                        gm.setValue("earth", gm.getValue("earth", "") + "~" + url);
                    }
                } else if (src.indexOf("cta_water_") >= 0) { //Ragnarok, the Ice Elemental
                    monst = gm.getValue("ice", "~");
                    if (monst.indexOf(url) === -1) {
                        gm.setValue("ice", gm.getValue("ice", "") + "~" + url);
                    }
                } else if (src.indexOf("raid_deathrune_") >= 0) { //Deathrune Raids
                    monst = gm.getValue("deas", "~");
                    if (monst.indexOf(url) === -1) {
                        gm.setValue("deas", gm.getValue("deas", "") + "~" + url);
                    }
                    if (src.indexOf("raid_deathrune_a1.gif") >= 0) { // Deathrune Raid Part 1 Under Level 50 Summoner (a1)
                        monst = gm.getValue("a1dea", "~");
                        if (monst.indexOf(url) === -1) {
                            gm.setValue("a1dea", gm.getValue("a1dea", "") + "~" + url);
                        }
                    } else if (src.indexOf("raid_deathrune_a2.gif") >= 0) { // Deathrune Raid Part 2 Under Level 50 Summoner (a2)
                        monst = gm.getValue("a2dea", "~");
                        if (monst.indexOf(url) === -1) {
                            gm.setValue("a2dea", gm.getValue("a2dea", "") + "~" + url);
                        }
                    } else if (src.indexOf("raid_deathrune_b1.gif") >= 0) { // Deathrune Raid Part 1 Over Level 50 Summoner (b1)
                        monst = gm.getValue("b1dea", "~");
                        if (monst.indexOf(url) === -1) {
                            gm.setValue("b1dea", gm.getValue("b1dea", "") + "~" + url);
                        }
                    } else if (src.indexOf("raid_deathrune_b2.gif") >= 0) { // Deathrune Raid Part 2 Over Level 50 Summoner (b2)
                        monst = gm.getValue("b2dea", "~");
                        if (monst.indexOf(url) === -1) {
                            gm.setValue("b2dea", gm.getValue("b2dea", "") + "~" + url);
                        }
                    }
                } else if (src.indexOf("_dragon.gif") >= 0) { //Dragons
                    monst = gm.getValue("drags", "~");
                    if (monst.indexOf(url) === -1) {
                        gm.setValue("drags", gm.getValue("drags", "") + "~" + url);
                    }

                    if (src.indexOf("cta_red_dragon.gif") >= 0) { // Red Dragon
                        monst = gm.getValue("rdrag", "~");
                        if (monst.indexOf(url) === -1) {
                            gm.setValue("rdrag", gm.getValue("rdrag", "") + "~" + url);
                        }
                    } else if (src.indexOf("cta_yellow_dragon.gif") >= 0) {  // Gold Dragon
                        monst = gm.getValue("gdrag", "~");
                        if (monst.indexOf(url) === -1) {
                            gm.setValue("gdrag", gm.getValue("gdrag", "") + "~" + url);
                        }
                    } else if (src.indexOf("cta_blue_dragon.gif") >= 0) { // Frost Dragon
                        monst = gm.getValue("fdrag", "~");
                        if (monst.indexOf(url) === -1) {
                            gm.setValue("fdrag", gm.getValue("fdrag", "") + "~" + url);
                        }
                    } else if (src.indexOf("cta_green_dragon.gif") >= 0) { // Emerald Dragon
                        monst = gm.getValue("edrag", "~");
                        if (monst.indexOf(url) === -1) {
                            gm.setValue("edrag", gm.getValue("edrag", "") + "~" + url);
                        }
                    }
                } else if (src.indexOf("twitter_seamonster_") >= 0 && src.indexOf("_1.jpg") >= 0) { // Sea Serpents
                    monst = gm.getValue("serps", "~");
                    if (monst.indexOf(url) === -1) {
                        gm.setValue("serps", gm.getValue("serps", "") + "~" + url);
                    }

                    if (src.indexOf("twitter_seamonster_purple_1") >= 0) { // Amethyt Serpent
                        monst = gm.getValue("aserp", "~");
                        if (monst.indexOf(url) === -1) {
                            gm.setValue("aserp", gm.getValue("aserp", "") + "~" + url);
                        }
                    } else if (src.indexOf("twitter_seamonster_red_1") >= 0) { // Ancient Serpent (red)
                        monst = gm.getValue("rserp", "~");
                        if (monst.indexOf(url) === -1) {
                            gm.setValue("rserp", gm.getValue("rserp", "") + "~" + url);
                        }
                    } else if (src.indexOf("twitter_seamonster_blue_1") >= 0) { // Saphire Serpent
                        monst = gm.getValue("sserp", "~");
                        if (monst.indexOf(url) === -1) {
                            gm.setValue("sserp", gm.getValue("sserp", "") + "~" + url);
                        }
                    } else if (src.indexOf("twitter_seamonster_green_1") >= 0) { // Emerald Serpent
                        monst = gm.getValue("eserp", "~");
                        if (monst.indexOf(url) === -1) {
                            gm.setValue("eserp", gm.getValue("eserp", "") + "~" + url);
                        }
                    }
                } else if (src.indexOf("cta_death") >= 0 && src.indexOf("cta_death_dead.gif") === -1) { // skaar
                    monst = gm.getValue("skaar", "~");
                    if (monst.indexOf(url) === -1) {
                        gm.setValue("skaar", gm.getValue("skaar", "") + "~" + url);
                    }
                } else if (src.indexOf("cta_lotus.gif") >= 0) { // Lotus
                    monst = gm.getValue("lotus", "~");
                    if (monst.indexOf(url) === -1) {
                        gm.setValue("lotus", gm.getValue("lotus", "") + "~" + url);
                    }
                } else if (src.indexOf("cta_keira.gif") >= 0) { // Keira
                    monst = gm.getValue("keira", "~");
                    if (monst.indexOf(url) === -1) {
                        gm.setValue("keira", gm.getValue("keira", "") + "~" + url);
                    }
                } else if (src.indexOf("cta_mephi.gif") >= 0) { // Mephisto
                    monst = gm.getValue("mephi", "~");
                    if (monst.indexOf(url) === -1) {
                        gm.setValue("mephi", gm.getValue("mephi", "") + "~" + url);
                    }
                } else if (src.indexOf("cta_sylvanas.gif") >= 0) { //Sylvanas
                    monst = gm.getValue("sylva", "~");
                    if (monst.indexOf(url) === -1) {
                        gm.setValue("sylva", gm.getValue("sylva", "") + "~" + url);
                    }
                } else if (src.indexOf("cta_stone.gif") >= 0) { //Colossus of Terra
                    monst = gm.getValue("colos", "~");
                    if (monst.indexOf(url) === -1) {
                        gm.setValue("colos", gm.getValue("colos", "") + "~" + url);
                    }
                } else if (src.indexOf("cta_orc_king.gif") >= 0) { //Gildamesh
                    monst = gm.getValue("gilda", "~");
                    if (monst.indexOf(url) === -1) {
                        gm.setValue("gilda", gm.getValue("gilda", "") + "~" + url);
                    }
                } else if (src.indexOf("cta_orc_captain.gif") >= 0) { //Kull
                    monst = gm.getValue("kull", "~");
                    if (monst.indexOf(url) === -1) {
                        gm.setValue("kull", gm.getValue("kull", "") + "~" + url);
                    }
                }
            }

            var urlix = gm.getValue("urlix", "~");
            var doaid = gm.getValue("doaid", "~");
            if (fid && action) {
                if (action === "doObjective") {
                    if (urlixc.indexOf(url) === -1 && doaid.indexOf(url) === -1) {
                        doaid += "~" + url;
                        gm.setValue("doaid", doaid);
                    }
                }
            }

            if (fid && mpool) {
                if (urlixc.indexOf(url) === -1 && urlix.indexOf(url) === -1) {
                    urlix += "~" + url;
                    gm.setValue("urlix", urlix);
                }
            }
        }

        global.log(1, "Completed Url Handling");
        this.JustDidIt("checkedFeed");
    },

    /////////////////////////////////////////////////////////////////////
    //                          POTIONS
    /////////////////////////////////////////////////////////////////////

    ConsumePotion: function (potion) {
        try {
            if (!$(".statsTTitle").length) {
                global.log(1, "Going to keep for potions");
                if (this.NavigateTo('keep')) {
                    return true;
                }
            }

            var formId   = "app46755028429_consume_1",
                webSlice = null,
                button   = null;

            if (potion === 'stamina') {
                formId = "app46755028429_consume_2";
            }

            global.log(1, "Consuming potion potion");
            webSlice = nHtml.FindByAttr(document.body, "form", "id", formId);
            if (webSlice) {
                button = nHtml.FindByAttrContains(webSlice, "input", "src", 'potion_consume.gif');
                if (button) {
                    caap.Click(button);
                } else {
                    global.log(1, "Could not find consume button for", potion);
                    return false;
                }
            } else {
                global.log(1, "Could not find consume form for", potion);
                return false;
            }

            return true;
        } catch (err) {
            global.error("ERROR in ConsumePotion: " + err, potion);
            return false;
        }
    },

    AutoPotions: function () {
        try {
            if (!gm.getValue('AutoPotions', true) || !(this.WhileSinceDidIt('AutoPotionTimerDelay', 10 * 60))) {
                return false;
            }

            if (this.stats.exp.dif <= gm.getNumber("potionsExperience", 20)) {
                global.log(1, "AutoPotions, ENL condition. Delaying 10 minutes");
                this.JustDidIt('AutoPotionTimerDelay');
                return false;
            }

            if (this.stats.energy.num < this.stats.energy.max - 10 &&
                this.stats.potions.energy >= gm.getNumber("energyPotionsSpendOver", 39) &&
                this.stats.potions.energy > gm.getNumber("energyPotionsKeepUnder", 35)) {
                return this.ConsumePotion('energy');
            }

            if (this.stats.stamina.num < this.stats.stamina.max - 10 &&
                this.stats.potions.stamina >= gm.getNumber("staminaPotionsSpendOver", 39) &&
                this.stats.potions.stamina > gm.getNumber("staminaPotionsKeepUnder", 35)) {
                return this.ConsumePotion('stamina');
            }

            return false;
        } catch (err) {
            global.error("ERROR in AutoPotion: " + err);
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
            if (!gm.getValue('AutoAlchemy', false)) {
                return false;
            }

            if (!this.CheckTimer('AlchemyTimer')) {
                return false;
            }
    /*-------------------------------------------------------------------------------------\
    Now we navigate to the Alchemy Recipe page.
    \-------------------------------------------------------------------------------------*/
            if (!this.NavigateTo('keep,alchemy', 'alchemy_banner.jpg')) {
                var button = null;
                if (document.getElementById('app46755028429_recipe_list').className !== 'show_items') {
                    button = nHtml.FindByAttrContains(document.body, 'div', 'id', 'alchemy_item_tab');
                    if (button) {
                        this.Click(button, 5000);
                        return true;
                    } else {
                        global.log(1, 'Cant find recipe div');
                        return false;
                    }
                }
    /*-------------------------------------------------------------------------------------\
    We close the results of our combines so they don't hog up our screen
    \-------------------------------------------------------------------------------------*/
                button = this.CheckForImage('help_close_x.gif');
                if (button) {
                    this.Click(button, 1000);
                    return true;
                }
    /*-------------------------------------------------------------------------------------\
    Now we get all of the recipes and step through them one by one
    \-------------------------------------------------------------------------------------*/
                var ss = document.evaluate(".//div[@class='alchemyRecipeBack']", document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                for (var s = 0; s < ss.snapshotLength; s += 1) {
                    var recipeDiv = ss.snapshotItem(s);
    /*-------------------------------------------------------------------------------------\
    If we are missing an ingredient then skip it
    \-------------------------------------------------------------------------------------*/
                    if (nHtml.FindByAttrContains(recipeDiv, 'div', 'class', 'missing')) {
                        // global.log(1, 'Skipping Recipe');
                        continue;
                    }
    /*-------------------------------------------------------------------------------------\
    If we are skipping battle hearts then skip it
    \-------------------------------------------------------------------------------------*/
                    if (this.CheckForImage('raid_hearts', recipeDiv) && !gm.getValue('AutoAlchemyHearts', false)) {
                        global.log(1, 'Skipping Hearts');
                        continue;
                    }
    /*-------------------------------------------------------------------------------------\
    Find our button and click it
    \-------------------------------------------------------------------------------------*/
                    button = nHtml.FindByAttrXPath(recipeDiv, 'input', "@type='image'");
                    if (button) {
                        this.Click(button, 2000);
                        return true;
                    } else {
                        global.log(1, 'Cant Find Item Image Button');
                    }
                }
    /*-------------------------------------------------------------------------------------\
    All done. Set the timer to check back in 3 hours.
    \-------------------------------------------------------------------------------------*/
                this.SetTimer('AlchemyTimer', 3 * 60 * 60);
                return false;
            }

            return true;
        } catch (err) {
            global.error("ERROR in Alchemy: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          BANKING
    // Keep it safe!
    /////////////////////////////////////////////////////////////////////

    ImmediateBanking: function () {
        if (!gm.getValue("BankImmed")) {
            return false;
        }

        return this.Bank();
    },

    Bank: function () {
        try {
            var maxInCash = gm.getNumber('MaxInCash', -1);
            var minInCash = gm.getNumber('MinInCash', 0);
            if (!maxInCash || maxInCash < 0 || this.stats.gold.cash <= minInCash || this.stats.gold.cash < maxInCash || this.stats.gold.cash < 10) {
                return false;
            }

            if (general.Select('BankingGeneral')) {
                return true;
            }

            var depositButton = this.CheckForImage('btn_stash.gif');
            if (!depositButton) {
                // Cannot find the link
                return this.NavigateTo('keep');
            }

            var depositForm = depositButton.form;
            var numberInput = nHtml.FindByAttrXPath(depositForm, 'input', "@type='' or @type='text'");
            if (numberInput) {
                numberInput.value = parseInt(numberInput.value, 10) - minInCash;
            } else {
                global.log(1, 'Cannot find box to put in number for bank deposit.');
                return false;
            }

            global.log(1, 'Depositing into bank');
            this.Click(depositButton);
            // added a true result by default until we can find a fix for the result check
            return true;

            /*
            var checkBanked = nHtml.FindByAttrContains(div, "div", "class", 'result');
            if (checkBanked && (checkBanked.firstChild.data.indexOf("You have stashed") < 0)) {
                global.log(1, 'Banking succeeded!');
                return true;
            }

            global.log(1, 'Banking failed! Cannot find result or not stashed!');
            return false;
            */
        } catch (err) {
            global.error("ERROR in Bank: " + err);
            return false;
        }
    },

    RetrieveFromBank: function (num) {
        try {
            if (num <= 0) {
                return false;
            }

            var retrieveButton = this.CheckForImage('btn_retrieve.gif');
            if (!retrieveButton) {
                // Cannot find the link
                return this.NavigateTo('keep');
            }

            var minInStore = gm.getNumber('minInStore', 0);
            if (!(minInStore || minInStore <= this.stats.gold.bank - num)) {
                return false;
            }

            var retrieveForm = retrieveButton.form;
            var numberInput = nHtml.FindByAttrXPath(retrieveForm, 'input', "@type='' or @type='text'");
            if (numberInput) {
                numberInput.value = num;
            } else {
                global.log(1, 'Cannot find box to put in number for bank retrieve.');
                return false;
            }

            global.log(1, 'Retrieving ' + num + ' from bank');
            gm.setValue('storeRetrieve', '');
            this.Click(retrieveButton);
            return true;
        } catch (err) {
            global.error("ERROR in RetrieveFromBank: " + err);
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
            minToHeal = gm.getNumber('MinToHeal', 0);
            if (!minToHeal) {
                return false;
            }

            minStamToHeal = gm.getNumber('MinStamToHeal', 0);
            if (minStamToHeal === "") {
                minStamToHeal = 0;
            }

            if (!this.stats.health) {
                return false;
            }

            if ((gm.getValue('WhenBattle', '') !== 'Never') || (gm.getValue('WhenMonster', '') !== 'Never')) {
                if ((this.InLevelUpMode() || this.stats.stamina.num >= this.stats.stamina.max) && this.stats.health.num < 10) {
                    global.log(1, 'Heal');
                    return this.NavigateTo('keep,heal_button.gif');
                }
            }

            if (this.stats.health.num >= this.stats.health.max || this.stats.health.num >= minToHeal) {
                return false;
            }

            if (this.stats.stamina.num < minStamToHeal) {
                this.SetDivContent('heal_mess', 'Waiting for stamina to heal: ' + this.stats.stamina.num + '/' + minStamToHeal);
                return false;
            }

            global.log(1, 'Heal');
            return this.NavigateTo('keep,heal_button.gif');
        } catch (err) {
            global.error("ERROR in Heal: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          ELITE GUARD
    /////////////////////////////////////////////////////////////////////

    AutoElite: function () {
        try {
            if (!gm.getValue('AutoElite', false)) {
                return false;
            }

            if (!(this.WhileSinceDidIt('AutoEliteGetList', 6 * 60 * 60))) {
                if (!gm.getValue('FillArmy', false)) {
                    gm.deleteValue(this.friendListType.giftc.name + 'Requested');
                }

                return false;
            }

            global.log(1, 'Elite Guard cycle');
            var MergeMyEliteTodo = function (list) {
                global.log(1, 'Elite Guard MergeMyEliteTodo list');
                var eliteArmyList = gm.getList('EliteArmyList');
                if (eliteArmyList.length) {
                    global.log(1, 'Merge and save Elite Guard MyEliteTodo list');
                    var diffList = list.filter(function (todoID) {
                        return (eliteArmyList.indexOf(todoID) < 0);
                    });

                    $.merge(eliteArmyList, diffList);
                    gm.setList('MyEliteTodo', eliteArmyList);
                } else {
                    global.log(1, 'Save Elite Guard MyEliteTodo list');
                    gm.setList('MyEliteTodo', list);
                }
            };

            var eliteList = gm.getList('MyEliteTodo');
            if (!$.isArray(eliteList)) {
                global.log(1, 'MyEliteTodo list is not expected format, deleting');
                eliteList = [];
                gm.deleteValue('MyEliteTodo');
            }

            if (window.location.href.indexOf('party.php')) {
                global.log(1, 'Checking Elite Guard status');
                var autoEliteFew = gm.getValue('AutoEliteFew', false);
                var autoEliteFull = $('.result_body').text().match(/YOUR Elite Guard is FULL/i);
                if (autoEliteFull || (autoEliteFew && gm.getValue('AutoEliteEnd', '') === 'NoArmy')) {
                    if (autoEliteFull) {
                        global.log(1, 'Elite Guard is FULL');
                        if (eliteList.length) {
                            MergeMyEliteTodo(eliteList);
                        }
                    } else if (autoEliteFew && gm.getValue('AutoEliteEnd', '') === 'NoArmy') {
                        global.log(1, 'Not enough friends to fill Elite Guard');
                        gm.deleteValue('AutoEliteFew');
                    }

                    global.log(1, 'Set Elite Guard AutoEliteGetList timer');
                    this.JustDidIt('AutoEliteGetList');
                    gm.setValue('AutoEliteEnd', 'Full');
                    global.log(1, 'Elite Guard done');
                    return false;
                }
            }

            if (!eliteList.length) {
                global.log(1, 'Elite Guard no MyEliteTodo cycle');
                var allowPass = false;
                if (gm.getValue(this.friendListType.giftc.name + 'Requested', false) &&
                    gm.getValue(this.friendListType.giftc.name + 'Responded', false) === true) {
                    global.log(1, 'Elite Guard received 0 friend ids');
                    if (gm.getList('EliteArmyList').length) {
                        global.log(1, 'Elite Guard has some defined friend ids');
                        allowPass = true;
                    } else {
                        this.JustDidIt('AutoEliteGetList');
                        global.log(1, 'Elite Guard has 0 defined friend ids');
                        gm.setValue('AutoEliteEnd', 'Full');
                        global.log(1, 'Elite Guard done');
                        return false;
                    }
                }

                this.GetFriendList(this.friendListType.giftc);
                var castleageList = [];
                if (gm.getValue(this.friendListType.giftc.name + 'Responded', false) !== true) {
                    castleageList = gm.getList(this.friendListType.giftc.name + 'Responded');
                }

                if (castleageList.length || (this.stats.army.capped <= 1) || allowPass) {
                    global.log(1, 'Elite Guard received a new friend list');
                    MergeMyEliteTodo(castleageList);
                    gm.deleteValue(this.friendListType.giftc.name + 'Responded');
                    gm.deleteValue(this.friendListType.giftc.name + 'Requested');
                    eliteList = gm.getList('MyEliteTodo');
                    if (eliteList.length < 50) {
                        global.log(1, 'WARNING! Elite Guard friend list is fewer than 50: ' + eliteList.length);
                        gm.setValue('AutoEliteFew', true);
                    }
                }
            } else if (this.WhileSinceDidIt('AutoEliteReqNext', 7)) {
                global.log(1, 'Elite Guard has a MyEliteTodo list, shifting User ID');
                var user = eliteList.shift();
                global.log(1, 'Add Elite Guard ID: ' + user);
                this.ClickAjax('party.php?twt=jneg&jneg=true&user=' + user);
                global.log(1, 'Elite Guard sent request, saving shifted MyEliteTodo');
                gm.setList('MyEliteTodo', eliteList);
                this.JustDidIt('AutoEliteReqNext');
                if (!eliteList.length) {
                    global.log(1, 'Army list exhausted');
                    gm.setValue('AutoEliteEnd', 'NoArmy');
                }
            }

            global.log(1, 'Release Elite Guard cycle');
            return true;
        } catch (err) {
            global.error("ERROR in AutoElite: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          PASSIVE GENERALS
    /////////////////////////////////////////////////////////////////////

    PassiveGeneral: function () {
        if (general.Select('IdleGeneral')) {
            return true;
        }

        gm.setValue('MaxIdleEnergy', this.stats.energy.max);
        gm.setValue('MaxIdleStamina', this.stats.stamina.max);
        return false;
    },

    /////////////////////////////////////////////////////////////////////
    //                          AUTOINCOME
    /////////////////////////////////////////////////////////////////////

    AutoIncome: function () {
        if (this.stats.gold.payTime.minutes < 1 && this.stats.gold.payTime.ticker.match(/[0-9]+:[0-9]+/) &&
                gm.getValue('IncomeGeneral') !== 'Use Current') {
            general.Select('IncomeGeneral');
            return true;
        }

        return false;
    },

    /////////////////////////////////////////////////////////////////////
    //                              AUTOGIFT
    /////////////////////////////////////////////////////////////////////

    CheckResults_army: function (resultsText) {
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

    CheckResults_gift_accept: function (resultsText) {
        // Confirm gifts actually sent
        if ($('#app46755028429_app_body').text().match(/You have sent \d+ gifts?/)) {
            global.log(1, 'Confirmed gifts sent out.');
            gm.setValue('RandomGiftPic', '');
            gm.setValue('FBSendList', '');
        }
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
                    var uid, txt = $(el).text().replace(/,/g, ''),
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
                    list.push('You were challenged <strong>' + (win + lose) + '</strong> times, winning <strong>' + win + '</strong> and losing <strong>' + lose + '</strong>.');
                    list.push('You ' + (xp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + addCommas(Math.abs(xp)) + '</span> experience points.');
                    list.push('You ' + (cash >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + '<b class="gold">$' + addCommas(Math.abs(cash)) + '</b></span>.');
                    list.push('You ' + (bp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + addCommas(Math.abs(bp)) + '</span> Battle Points.');
                    list.push('You ' + (wp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + addCommas(Math.abs(wp)) + '</span> War Points.');
                    list.push('');
                    user = sortObject(user, function (a, b) {
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
            global.error("ERROR in News: " + err);
            return false;
        }
    },

    CheckResults_index: function (resultsText) {
    },

    AutoGift: function () {
        try {
            if (!gm.getValue('AutoGift', false)) {
                return false;
            }

            var giftNamePic = {};
            var giftEntry = nHtml.FindByAttrContains(document.body, 'div', 'id', '_gift1');
            if (giftEntry) {
                gm.setList('GiftList', []);
                var ss = document.evaluate(".//div[contains(@id,'_gift')]", giftEntry.parentNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                for (var s = 0; s < ss.snapshotLength; s += 1) {
                    var giftDiv = ss.snapshotItem(s);
                    var giftName = $.trim(nHtml.GetText(giftDiv)).replace(/!/i, '');
                    if (gm.getValue("GiftList").indexOf(giftName) >= 0) {
                        giftName += ' #2';
                    }

                    gm.listPush('GiftList', giftName);
                    giftNamePic[giftName] = this.CheckForImage('mystery', giftDiv).src.match(/[\w_\.]+$/i).toString();
                    //global.log(1, 'Gift name: ' + giftName + ' pic ' + giftNamePic[giftName] + ' hidden ' + giftExtraGiftTF[giftName]);
                }

                //global.log(1, 'Gift list: ' + gm.getList('GiftList'));
                if (gm.getValue('GiftChoice') === 'Get Gift List') {
                    gm.setValue('GiftChoice', 'Same Gift As Received');
                    this.SelectDropOption('GiftChoice', 'Same Gift As Received');
                }
            }

            // Go to gifts page if asked to read in gift list
            if (gm.getValue('GiftChoice', false) === 'Get Gift List' || !gm.getList('GiftList')) {
                if (this.NavigateTo('army,gift', 'giftpage_title.jpg')) {
                    return true;
                }
            }

            var giverId = [];
            // Gather the gifts
            if (gm.getValue('HaveGift', false)) {
                if (this.NavigateTo('army', 'invite_on.gif')) {
                    return true;
                }

                var acceptDiv = nHtml.FindByAttrContains(document.body, 'a', 'href', 'reqs.php#confirm_');
                var ignoreDiv = nHtml.FindByAttrContains(document.body, 'a', 'href', 'act=ignore');
                if (ignoreDiv && acceptDiv) {
                    giverId = new RegExp("(userId=|user=|/profile/|uid=)([0-9]+)").exec(ignoreDiv.href);
                    if (!giverId) {
                        global.log(1, 'Unable to find giver ID');
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

                    gm.setValue('GiftEntry', giverId[2] + global.vs + giverName);
                    global.log(1, 'Giver ID = ' + giverId[2] + ' Name  = ' + giverName);
                    this.JustDidIt('ClickedFacebookURL');
                    if (global.is_chrome) {
                        acceptDiv.href = "http://apps.facebook.com/reqs.php#confirm_46755028429_0";
                    }

                    gm.setValue('clickUrl', acceptDiv.href);
                    this.VisitUrl(acceptDiv.href);
                    return true;
                }

                gm.deleteValue('HaveGift');
                return this.NavigateTo('gift');
            }

            var button = nHtml.FindByAttrContains(document.body, 'input', 'name', 'skip_ci_btn');
            if (button) {
                global.log(1, 'Denying Email Nag For Gift Send');
                caap.Click(button);
                return true;
            }

            // Facebook pop-up on CA
            if (gm.getValue('FBSendList', '')) {
                button = nHtml.FindByAttrContains(document.body, 'input', 'name', 'sendit');
                if (button) {
                    global.log(1, 'Sending gifts to Facebook');
                    caap.Click(button);
                    return true;
                }

                gm.listAddBefore('ReceivedList', gm.getList('FBSendList'));
                gm.setList('FBSendList', []);
                button = nHtml.FindByAttrContains(document.body, 'input', 'name', 'ok');
                if (button) {
                    global.log(1, 'Over max gifts per day');
                    this.JustDidIt('WaitForNextGiftSend');
                    caap.Click(button);
                    return true;
                }

                global.log(1, 'No Facebook pop up to send gifts');
                return false;
            }

            // CA send gift button
            if (gm.getValue('CASendList', '')) {
                var sendForm = nHtml.FindByAttrContains(document.body, 'form', 'id', 'req_form_');
                if (sendForm) {
                    button = nHtml.FindByAttrContains(sendForm, 'input', 'name', 'send');
                    if (button) {
                        global.log(1, 'Clicked CA send gift button');
                        gm.listAddBefore('FBSendList', gm.getList('CASendList'));
                        gm.setList('CASendList', []);
                        caap.Click(button);
                        return true;
                    }
                }

                global.log(1, 'No CA button to send gifts');
                gm.listAddBefore('ReceivedList', gm.getList('CASendList'));
                gm.setList('CASendList', []);
                return false;
            }



            if (!this.WhileSinceDidIt('WaitForNextGiftSend', 3 * 60 * 60)) {
                return false;
            }

            if (this.WhileSinceDidIt('WaitForNotFoundIDs', 3 * 60 * 60) && gm.getList('NotFoundIDs')) {
                gm.listAddBefore('ReceivedList', gm.getList('NotFoundIDs'));
                gm.setList('NotFoundIDs', []);
            }

            if (gm.getValue('DisableGiftReturn', false)) {
                gm.setList('ReceivedList', []);
            }

            var giverList = gm.getList('ReceivedList');
            if (!giverList.length) {
                return false;
            }

            if (this.NavigateTo('army,gift', 'giftpage_title.jpg')) {
                return true;
            }

            // Get the gift to send out
            if (giftNamePic && giftNamePic.length === 0) {
                global.log(1, 'No list of pictures for gift choices');
                return false;
            }

            var givenGiftType = '';
            var giftPic = '';
            var giftChoice = gm.getValue('GiftChoice');
            var giftList = gm.getList('GiftList');
            switch (giftChoice) {
            case 'Random Gift':
                giftPic = gm.getValue('RandomGiftPic');
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
                            gm.setValue('RandomGiftPic', giftPic);
                            break;
                        }
                    }
                }
                if (!giftPic) {
                    global.log(1, 'No gift type match. GiverList: ' + giverList);
                    return false;
                }
                break;
            case 'Same Gift As Received':
                givenGiftType = giverList[0].split(global.vs)[2];
                global.log(1, 'Looking for same gift as ' + givenGiftType);
                if (giftList.indexOf(givenGiftType) < 0) {
                    global.log(1, 'No gift type match. Using first gift as default.');
                    givenGiftType = gm.getList('GiftList')[0];
                }
                giftPic = giftNamePic[givenGiftType];
                break;
            default:
                giftPic = giftNamePic[gm.getValue('GiftChoice')];
                break;
            }

            // Move to gifts page
            var picDiv = this.CheckForImage(giftPic);
            if (!picDiv) {
                global.log(1, 'Unable to find ' + giftPic);
                return false;
            } else {
                global.log(1, 'GiftPic is ' + giftPic);
            }

            if (nHtml.FindByAttrContains(picDiv.parentNode.parentNode.parentNode.parentNode, 'div', 'style', 'giftpage_select')) {
                if (this.NavigateTo('gift_invite_castle_off.gif', 'gift_invite_castle_on.gif')) {
                    return true;
                }
            } else {
                this.NavigateTo('gift_more_gifts.gif');
                return this.NavigateTo(giftPic);
            }

            // Click on names
            var giveDiv = nHtml.FindByAttrContains(document.body, 'div', 'class', 'unselected_list');
            var doneDiv = nHtml.FindByAttrContains(document.body, 'div', 'class', 'selected_list');
            gm.setList('ReceivedList', []);
            for (var p in giverList) {
                if (giverList.hasOwnProperty(p)) {
                    if (p > 9) {
                        gm.listPush('ReceivedList', giverList[p]);
                        continue;
                    }

                    var giverData = giverList[p].split(global.vs);
                    var giverID = giverData[0];
                    var giftType = giverData[2];
                    if (giftChoice === 'Same Gift As Received' && giftType !== givenGiftType && giftList.indexOf(giftType) >= 0) {
                        //global.log(1, 'giftType ' + giftType + ' givenGiftType ' + givenGiftType);
                        gm.listPush('ReceivedList', giverList[p]);
                        continue;
                    }

                    var nameButton = nHtml.FindByAttrContains(giveDiv, 'input', 'value', giverID);
                    if (!nameButton) {
                        global.log(1, 'Unable to find giver ID ' + giverID);
                        gm.listPush('NotFoundIDs', giverList[p]);
                        this.JustDidIt('WaitForNotFoundIDs');
                        continue;
                    } else {
                        global.log(1, 'Clicking giver ID ' + giverID);
                        this.Click(nameButton);
                    }

                    //test actually clicked
                    if (nHtml.FindByAttrContains(doneDiv, 'input', 'value', giverID)) {
                        gm.listPush('CASendList', giverList[p]);
                        global.log(1, 'Moved ID ' + giverID);
                    } else {
                        global.log(1, 'NOT moved ID ' + giverID);
                        gm.listPush('NotFoundIDs', giverList[p]);
                        this.JustDidIt('WaitForNotFoundIDs');
                    }
                }
            }

            return true;
        } catch (err) {
            global.error("ERROR in AutoGift: " + err);
            return false;
        }
    },

    AcceptGiftOnFB: function () {
        try {
            if (global.is_chrome) {
                if (window.location.href.indexOf('apps.facebook.com/reqs.php') < 0 && window.location.href.indexOf('apps.facebook.com/home.php') < 0) {
                    return false;
                }
            } else {
                if (window.location.href.indexOf('www.facebook.com/reqs.php') < 0 && window.location.href.indexOf('www.facebook.com/home.php') < 0) {
                    return false;
                }
            }

            var giftEntry = gm.getValue('GiftEntry', '');
            if (!giftEntry) {
                return false;
            }

            global.log(1, 'On FB page with gift ready to go');
            if (window.location.href.indexOf('facebook.com/reqs.php') >= 0) {
                var ss = document.evaluate(".//input[contains(@name,'/castle/tracker.php')]", document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                for (var s = 0; s < ss.snapshotLength; s += 1) {
                    var giftDiv = ss.snapshotItem(s);
                    var user = giftDiv.name.match(/uid%3D(\d+)/i);
                    if (!user || user.length !== 2) {
                        continue;
                    }

                    user = parseInt(user[1], 10);
                    if (user !== this.NumberOnly(giftEntry)) {
                        continue;
                    }

                    var giftType = $.trim(giftDiv.value.replace(/^Accept /i, ''));
                    if (gm.getList('GiftList').indexOf(giftType) < 0) {
                        global.log(1, 'Unknown gift type', giftType);
                        giftType = 'Unknown Gift';
                    }

                    if (gm.getValue('ReceivedList', ' ').indexOf(giftEntry) < 0) {
                        gm.listPush('ReceivedList', giftEntry + global.vs + giftType);
                    }

                    global.log(1, 'This giver/gift/givers', user, giftType, gm.getList('ReceivedList'));
                    gm.setValue('GiftEntry', '');
                    this.Click(giftDiv);
                    return true;
                }
            }

            if (!this.WhileSinceDidIt('ClickedFacebookURL', 10)) {
                return false;
            }

            global.log(1, 'Error: unable to find gift', giftEntry);
            if (gm.getValue('ReceivedList', ' ').indexOf(giftEntry) < 0) {
                gm.listPush('ReceivedList', giftEntry + '\tUnknown Gift');
            }

            gm.setValue('GiftEntry', '');
            this.VisitUrl("http://apps.facebook.com/castle_age/army.php?act=acpt&uid=" + this.NumberOnly(giftEntry));
            return true;
        } catch (err) {
            global.error("ERROR in AcceptGiftOnFB: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                              IMMEDIATEAUTOSTAT
    /////////////////////////////////////////////////////////////////////

    ImmediateAutoStat: function () {
        if (!gm.getValue("StatImmed") || !gm.getValue('AutoStat')) {
            return false;
        }

        return caap.AutoStat();
    },

    ////////////////////////////////////////////////////////////////////
    //                      Auto Stat
    ////////////////////////////////////////////////////////////////////

    IncreaseStat: function (attribute, attrAdjust, atributeSlice) {
        try {
            global.log(9, "Attribute: " + attribute + "   Adjust: " + attrAdjust);
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

            ajaxLoadIcon = nHtml.FindByAttrContains(document.body, 'div', 'id', 'app46755028429_AjaxLoadIcon');
            if (!ajaxLoadIcon || ajaxLoadIcon.style.display !== 'none') {
                global.log(1, "Unable to find AjaxLoadIcon: Fail");
                return "Fail";
            }

            if ((attribute === 'stamina') && (this.stats.points.skill < 2)) {
                //gm.setValue("SkillPointsNeed", 2);
                global.log(1, "Stamina requires 2 upgrade points: Next");
                return "Next";
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
                global.log(1, "Unable to locate upgrade button: " + attribute);
                return "Fail";
            }

            //gm.setValue("SkillPointsNeed", 1);
            attrAdjustNew = attrAdjust;
            logTxt += attrAdjust;
            level = this.stats.level;
            attrCurrent = parseInt(button.parentNode.parentNode.childNodes[3].firstChild.data.replace(new RegExp("[^0-9]", "g"), ''), 10);
            energy = parseInt(nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'energy_max').parentNode.parentNode.childNodes[3].firstChild.data.replace(new RegExp("[^0-9]", "g"), ''), 10);
            stamina = parseInt(nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'stamina_max').parentNode.parentNode.childNodes[3].firstChild.data.replace(new RegExp("[^0-9]", "g"), ''), 10);
            if (level >= 10) {
                attack = parseInt(nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'attack').parentNode.parentNode.childNodes[3].firstChild.data.replace(new RegExp("[^0-9]", "g"), ''), 10);
                defense = parseInt(nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'defense').parentNode.parentNode.childNodes[3].firstChild.data.replace(new RegExp("[^0-9]", "g"), ''), 10);
                health = parseInt(nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'health_max').parentNode.parentNode.childNodes[3].firstChild.data.replace(new RegExp("[^0-9]", "g"), ''), 10);
            }

            global.log(9, "Energy=" + energy + " Stamina=" + stamina + " Attack=" + attack + " Defense=" + defense + " Heath=" + health);
            if (gm.getValue('AutoStatAdv', false)) {
                //Using eval, so user can define formulas on menu, like energy = level + 50
                attrAdjustNew = eval(attrAdjust);
                logTxt = "(" + attrAdjust + ")=" + attrAdjustNew;
            }

            if (attrAdjustNew > attrCurrent) {
                global.log(1, "Status Before [" + attribute + "=" + attrCurrent + "]  Adjusting To [" + logTxt + "]");
                this.Click(button);
                return "Click";
            }

            return "Next";
        } catch (err) {
            global.error("ERROR in IncreaseStat: " + err);
            return "Error";
        }
    },

    statsMatch: true,

    autoStatRuleLog: true,

    AutoStat: function () {
        try {
            if (!gm.getValue('AutoStat') || !this.stats.points.skill) {
                return false;
            }

            if (!this.statsMatch) {
                if (this.autoStatRuleLog) {
                    global.log(1, "User should change their stats rules");
                    this.autoStatRuleLog = false;
                }

                return false;
            }

            /*
            if (!this.stats.points.skill || this.stats.points.skill < gm.getValue("SkillPointsNeed", 1)) {
                if (this.autoStatRuleLog) {
                    global.log(1, "Dont have enough stats points: Have (" + this.stats.points.skill + ") Require (" + gm.getValue("SkillPointsNeed", 1) + ")");
                    this.autoStatRuleLog = false;
                }

                return false;
            }
            */

            var atributeSlice      = null,
                startAtt           = 0,
                stopAtt            = 4,
                attrName           = '',
                attribute          = '',
                attrValue          = 0,
                n                  = 0,
                returnIncreaseStat = '';

            atributeSlice = nHtml.FindByAttrContains(document.body, "div", "class", 'keep_attribute_section');
            if (!atributeSlice) {
                this.NavigateTo('keep');
                return true;
            }

            if (gm.getValue("AutoStatAdv", false)) {
                startAtt = 5;
                stopAtt = 9;
            }

            for (n = startAtt; n <= stopAtt; n += 1) {
                attrName = 'Attribute' + n;
                attribute = gm.getValue(attrName, '');
                if (attribute === '') {
                    global.log(9, attrName + " is blank: continue");
                    continue;
                }

                if (this.stats.level < 10) {
                    if (attribute === 'Attack' || attribute === 'Defense' || attribute === 'Health') {
                        global.log(1, "Characters below level 10 can not increase Attack, Defense or Health: continue");
                        continue;
                    }
                }

                attrValue = gm.getValue('AttrValue' + n, 0);
                returnIncreaseStat = this.IncreaseStat(attribute, attrValue, atributeSlice);
                switch (returnIncreaseStat) {
                case "Fail" :
                case "Next" :
                    global.log(9, attrName + " : next");
                    continue;
                case "Click" :
                    global.log(9, attrName + " : click");
                    return true;
                default :
                    global.log(9, attrName + " return value: " + returnIncreaseStat);
                    return false;
                }
            }

            global.log(1, "No rules match to increase stats");
            this.statsMatch = false;
            return false;
        } catch (err) {
            global.error("ERROR in AutoStat: " + err);
            return false;
        }
    },

    AutoCollectMA: function () {
        try {
            if (!gm.getValue('AutoCollectMA', true) ||
                !(this.WhileSinceDidIt('AutoCollectMATimer', (24 * 60 * 60) + (5 * 60)))) {
                return false;
            }

            global.log(1, "Collecting Master and Apprentice reward");
            caap.SetDivContent('idle_mess', 'Collect MA Reward');
            var buttonMas = nHtml.FindByAttrContains(document.body, "img", "src", "ma_view_progress_main"),
                buttonApp = nHtml.FindByAttrContains(document.body, "img", "src", "ma_main_learn_more");

            if (!buttonMas && !buttonApp) {
                global.log(1, "Going to home");
                if (this.NavigateTo('index')) {
                    return true;
                }
            }

            if (buttonMas) {
                this.Click(buttonMas);
                caap.SetDivContent('idle_mess', 'Collected MA Reward');
                global.log(1, "Collected Master and Apprentice reward");
            }

            if (!buttonMas && buttonApp) {
                caap.SetDivContent('idle_mess', 'No MA Rewards');
                global.log(1, "No Master and Apprentice rewards");
            }

            window.setTimeout(function () {
                caap.SetDivContent('idle_mess', '');
            }, 5000);

            this.JustDidIt('AutoCollectMATimer');
            global.log(1, "Collect Master and Apprentice reward completed");
            return true;
        } catch (err) {
            global.error("ERROR in AutoCollectMA: " + err);
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
            global.log(1, "Entered GetFriendList and request is for: " + listType.name);
            if (force) {
                gm.deleteValue(listType.name + 'Requested');
                gm.deleteValue(listType.name + 'Responded');
            }

            if (!gm.getValue(listType.name + 'Requested', false)) {
                global.log(1, "Getting Friend List: " + listType.name);
                gm.setValue(listType.name + 'Requested', true);

                $.ajax({
                    url: listType.url,
                    error:
                        function (XMLHttpRequest, textStatus, errorThrown) {
                            gm.deleteValue(listType.name + 'Requested');
                            global.log(1, "GetFriendList(" + listType.name + "): " + textStatus);
                        },
                    success:
                        function (data, textStatus, XMLHttpRequest) {
                            try {
                                global.log(1, "GetFriendList.ajax splitting data");
                                data = data.split('<div class="unselected_list">');
                                if (data.length < 2) {
                                    throw "Could not locate 'unselected_list'";
                                }

                                data = data[1].split('</div><div class="selected_list">');
                                if (data.length < 2) {
                                    throw "Could not locate 'selected_list'";
                                }

                                global.log(1, "GetFriendList.ajax data split ok");
                                var friendList = [];
                                $('<div></div>').html(data[0]).find('input').each(function (index) {
                                    friendList.push($(this).val());
                                });

                                global.log(1, "GetFriendList.ajax saving friend list of " + friendList.length + " ids");
                                if (friendList.length) {
                                    gm.setList(listType.name + 'Responded', friendList);
                                } else {
                                    gm.setValue(listType.name + 'Responded', true);
                                }

                                global.log(1, "GetFriendList(" + listType.name + "): " + textStatus);
                                //global.log(1, "GetFriendList(" + listType.name + "): " + friendList);
                            } catch (err) {
                                gm.deleteValue(listType.name + 'Requested');
                                global.error("ERROR in GetFriendList.ajax: " + err);
                            }
                        }
                });
            } else {
                global.log(1, "Already requested GetFriendList for: " + listType.name);
            }

            return true;
        } catch (err) {
            global.error("ERROR in GetFriendList(" + listType.name + "): " + err);
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

                global.log(1, "AddFriend(" + id + "): " + textStatus);
            };

            $.ajax({
                url: 'http://apps.facebook.com/castle_age/party.php?twt=jneg&jneg=true&user=' + id + '&lka=' + id + '&etw=9&ref=nf',
                error: responseCallback,
                success: responseCallback
            });

            return true;
        } catch (err) {
            global.error("ERROR in AddFriend(" + id + "): " + err);
            return false;
        }
    },

    AutoFillArmy: function (caListType, fbListType) {
        try {
            if (!gm.getValue('FillArmy', false)) {
                return false;
            }

            var armyCount = gm.getValue("ArmyCount", 0);
            if (armyCount === 0) {
                this.SetDivContent('idle_mess', 'Filling Army');
                global.log(1, "Filling army");
            }

            if (gm.getValue(caListType.name + 'Responded', false) === true ||
                    gm.getValue(fbListType.name + 'Responded', false) === true) {
                this.SetDivContent('idle_mess', '<b>Fill Army Completed</b>');
                global.log(1, "Fill Army Completed: no friends found");
                window.setTimeout(function () {
                    caap.SetDivContent('idle_mess', '');
                }, 5000);

                gm.setValue('FillArmy', false);
                gm.deleteValue("ArmyCount");
                gm.deleteValue('FillArmyList');
                gm.deleteValue(caListType.name + 'Responded');
                gm.deleteValue(fbListType.name + 'Responded');
                gm.deleteValue(caListType.name + 'Requested');
                gm.deleteValue(fbListType.name + 'Requested');
                return true;
            }

            var fillArmyList = gm.getList('FillArmyList');
            if (!fillArmyList.length) {
                this.GetFriendList(caListType);
                this.GetFriendList(fbListType);
            }

            var castleageList = gm.getList(caListType.name + 'Responded');
            //global.log(1, "gifList: " + castleageList);
            var facebookList = gm.getList(fbListType.name + 'Responded');
            //global.log(1, "facebookList: " + facebookList);
            if ((castleageList.length && facebookList.length) || fillArmyList.length) {
                if (!fillArmyList.length) {
                    var diffList = facebookList.filter(function (facebookID) {
                        return (castleageList.indexOf(facebookID) >= 0);
                    });

                    //global.log(1, "diffList: " + diffList);
                    gm.setList('FillArmyList', diffList);
                    fillArmyList = gm.getList('FillArmyList');
                    gm.deleteValue(caListType.name + 'Responded');
                    gm.deleteValue(fbListType.name + 'Responded');
                    gm.deleteValue(caListType.name + 'Requested');
                    gm.deleteValue(fbListType.name + 'Requested');
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
                global.log(1, 'Filling Army, Please wait...' + armyCount + "/" + fillArmyList.length);
                gm.setValue("ArmyCount", armyCount);
                if (armyCount >= fillArmyList.length) {
                    this.SetDivContent('idle_mess', '<b>Fill Army Completed</b>');
                    window.setTimeout(function () {
                        caap.SetDivContent('idle_mess', '');
                    }, 5000);

                    global.log(1, "Fill Army Completed");
                    gm.setValue('FillArmy', false);
                    gm.deleteValue("ArmyCount");
                    gm.deleteValue('FillArmyList');
                }
            }

            return true;
        } catch (err) {
            global.error("ERROR in AutoFillArmy: " + err);
            this.SetDivContent('idle_mess', '<b>Fill Army Failed</b>');
            window.setTimeout(function () {
                caap.SetDivContent('idle_mess', '');
            }, 5000);

            gm.setValue('FillArmy', false);
            gm.deleteValue("ArmyCount");
            gm.deleteValue('FillArmyList');
            gm.deleteValue(caListType.name + 'Responded');
            gm.deleteValue(fbListType.name + 'Responded');
            gm.deleteValue(caListType.name + 'Requested');
            gm.deleteValue(fbListType.name + 'Requested');
            return false;
        }
    },

    AjaxGiftCheck: function () {
        try {
            if (!gm.getValue('AutoGift', false) || !this.WhileSinceDidIt("AjaxGiftCheckTimer", (5 * 60) + Math.floor(Math.random() * 3 * 60))) {
                return false;
            }

            global.log(2, "Performing AjaxGiftCheck");

            $.ajax({
                url: "http://apps.facebook.com/castle_age/index.php",
                error:
                    function (XMLHttpRequest, textStatus, errorThrown) {
                        global.error("AjaxGiftCheck.ajax", textStatus);
                    },
                success:
                    function (data, textStatus, XMLHttpRequest) {
                        try {
                            global.log(2, "AjaxGiftCheck.ajax: Checking data.");
                            if ($(data).find("a[href*='reqs.php#confirm_']").length) {
                                global.log(1, 'AjaxGiftCheck.ajax: We have a gift waiting!');
                                gm.setValue('HaveGift', true);
                            } else {
                                global.log(1, 'AjaxGiftCheck.ajax: No gifts waiting.');
                                gm.deleteValue('HaveGift');
                            }

                            global.log(2, "AjaxGiftCheck.ajax: Done.");
                        } catch (err) {
                            global.error("ERROR in AjaxGiftCheck.ajax: " + err);
                        }
                    }
            });

            this.JustDidIt('AjaxGiftCheckTimer');
            global.log(2, "Completed AjaxGiftCheck");
            return true;
        } catch (err) {
            global.error("ERROR in AjaxGiftCheck: " + err);
            return false;
        }
    },

    Idle: function () {
        //Update Monster Finder
        if (this.WhileSinceDidIt("clearedMonsterFinderLinks", 72 * 60 * 60)) {
            this.clearLinks(true);
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

        if (this.CheckOracle()) {
            return true;
        }

        if (this.CheckBattleRank()) {
            return true;
        }

        if (this.CheckWarRank()) {
            return true;
        }

        if (this.CheckAchievements()) {
            return true;
        }

        if (this.CheckSymbolQuests()) {
            return true;
        }

        if (this.AutoCollectMA()) {
            return true;
        }

        this.AjaxGiftCheck();
        this.AutoFillArmy(this.friendListType.giftc, this.friendListType.facebook);
        this.ReconPlayers();
        this.UpdateDashboard();
        gm.setValue('ReleaseControl', true);
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

    ReconPlayers: function () {
        try {
            if (!gm.getValue('DoPlayerRecon', false)) {
                return false;
            }

            if (this.stats.stamina.num <= 0) {
                return false;
            }

            if (!this.CheckTimer('PlayerReconTimer')) {
                return false;
            }

            this.SetDivContent('idle_mess', 'Player Recon: In Progress');
            global.log(1, "Player Recon: In Progress");

            $.ajax({
                url: "http://apps.facebook.com/castle_age/battle.php",
                error:
                    function (XMLHttpRequest, textStatus, errorThrown) {
                        global.error("ReconPlayers2.ajax", textStatus);
                    },
                success:
                    function (data, textStatus, XMLHttpRequest) {
                        try {
                            var found = 0;
                            global.log(2, "ReconPlayers.ajax: Checking data.");

                            $(data).find("img[src*='symbol_']").not("[src*='symbol_tiny_']").each(function (index) {
                                var UserRecord      = new caap.ReconRecord(),
                                    $tempObj        = $(this).parent().parent().parent().parent().parent(),
                                    tempArray       = [],
                                    txt             = '',
                                    regex           = new RegExp('(.+)\\s*\\(Level ([0-9]+)\\)\\s*Battle: ([A-Za-z ]+) \\(Rank ([0-9]+)\\)\\s*War: ([A-Za-z ]+) \\(Rank ([0-9]+)\\)\\s*([0-9]+)', 'i'),
                                    regex2          = new RegExp('(.+)\\s*\\(Level ([0-9]+)\\)\\s*Battle: ([A-Za-z ]+) \\(Rank ([0-9]+)\\)\\s*([0-9]+)', 'i'),
                                    entryLimit      = gm.getNumber('LimitTargets', 100),
                                    i               = 0,
                                    OldRecord       = null,
                                    reconRank       = gm.getNumber('ReconPlayerRank', 99),
                                    reconLevel      = gm.getNumber('ReconPlayerLevel', 999),
                                    reconARBase     = gm.getNumber('ReconPlayerARBase', 999),
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
                                            global.log(2, "UserRecord exists. Loaded and removed.", UserRecord);
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
                                                global.log(2, 'Level above reconLevel max', reconLevel, UserRecord);
                                                goodTarget = false;
                                            } else if (caap.stats.rank.battle - UserRecord.data.rankNum > reconRank) {
                                                global.log(2, 'Rank below reconRank min', reconRank, UserRecord);
                                                goodTarget = false;
                                            } else {
                                                levelMultiplier = caap.stats.level / UserRecord.data.levelNum;
                                                armyRatio = reconARBase * levelMultiplier;
                                                if (armyRatio <= 0) {
                                                    global.log(2, 'Recon unable to calculate army ratio', reconARBase, levelMultiplier);
                                                    goodTarget = false;
                                                } else if (UserRecord.data.armyNum  > (caap.stats.army * armyRatio)) {
                                                    global.log(2, 'Army above armyRatio adjustment', armyRatio, UserRecord);
                                                    goodTarget = false;
                                                }
                                            }

                                            if (goodTarget) {
                                                while (caap.ReconRecordArray.length >= entryLimit) {
                                                    OldRecord = caap.ReconRecordArray.shift();
                                                    global.log(2, "Entry limit matched. Deleted an old record", OldRecord);
                                                }

                                                global.log(2, "UserRecord", UserRecord);
                                                caap.ReconRecordArray.push(UserRecord.data);
                                                found += 1;
                                            }
                                        } else {
                                            global.log(1, 'Recon can not parse target text string', txt);
                                        }
                                    } else {
                                        global.log(1, "Can't find txt in $tempObj", $tempObj);
                                    }
                                } else {
                                    global.log(1, "$tempObj is empty");
                                }
                            });

                            gm.setJValue('reconJSON', caap.ReconRecordArray);
                            caap.SetDivContent('idle_mess', 'Player Recon: Found:' + found + ' Total:' + caap.ReconRecordArray.length);
                            global.log(1, 'Player Recon: Found:' + found + ' Total:' + caap.ReconRecordArray.length);
                            window.setTimeout(function () {
                                caap.SetDivContent('idle_mess', '');
                            }, 5 * 1000);

                            global.log(2, "ReconPlayers.ajax: Done.", caap.ReconRecordArray);
                        } catch (err) {
                            global.error("ERROR in ReconPlayers.ajax: " + err);
                        }
                    }
            });

            this.SetTimer('PlayerReconTimer', gm.getValue('PlayerReconRetry', 60) + Math.floor(Math.random() * 60));
            return true;
        } catch (err) {
            global.error("ERROR in ReconPlayers:" + err);
            return false;
        }
    },

    currentPage: "",

    currentTab: "",

    waitMilliSecs: 5000,

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
        MonsterFinder     : 'Monster Finder',
        DemiPoints        : 'Demi Points First',
        Monsters          : 'Fighting Monsters',
        Heal              : 'Auto Healing',
        Bank              : 'Auto Banking',
        Lands             : 'Land Operations'
    },

    CheckLastAction: function (thisAction) {
        var lastAction = gm.getValue('LastAction', 'none');
        if (this.actionDescTable[thisAction]) {
            this.SetDivContent('activity_mess', 'Activity: ' + this.actionDescTable[thisAction]);
        } else {
            this.SetDivContent('activity_mess', 'Activity: ' + thisAction);
        }

        if (lastAction !== thisAction) {
            global.log(1, 'Changed from doing ' + lastAction + ' to ' + thisAction);
            gm.setValue('LastAction', thisAction);
        }
    },

    // The Master Action List
    masterActionList: {
        0x00: 'AutoElite',
        0x01: 'Heal',
        0x02: 'ImmediateBanking',
        0x03: 'ImmediateAutoStat',
        0x04: 'MaxEnergyQuest',
        0x05: 'DemiPoints',
        0x06: 'MonsterReview',
        0x07: 'Monsters',
        0x08: 'Battle',
        0x09: 'MonsterFinder',
        0x0A: 'Quests',
        0x0B: 'Bank',
        0x0C: 'PassiveGeneral',
        0x0D: 'Lands',
        0x0E: 'AutoBless',
        0x0F: 'AutoStat',
        0x10: 'AutoGift',
        0x11: 'AutoPotions',
        0x12: 'AutoAlchemy',
        0x13: 'Idle'
    },

    actionsList: [],

    MakeActionsList: function () {
        try {
            if (this.actionsList && this.actionsList.length === 0) {
                global.log(1, "Loading a fresh Action List");
                // actionOrder is a comma seperated string of action numbers as
                // hex pairs and can be referenced in the Master Action List
                // Example: "00,01,02,03,04,05,06,07,08,09,0A,0B,0C,0D,0E,0F,10,11,12,"
                var action = '';
                var actionOrderArray = [];
                var masterActionListCount = 0;
                var actionOrderUser = gm.getValue("actionOrder", '');
                if (actionOrderUser !== '') {
                    // We are using the user defined actionOrder set in the
                    // Advanced Hidden Options
                    global.log(1, "Trying user defined Action Order");
                    // We take the User Action Order and convert it from a comma
                    // separated list into an array
                    actionOrderArray = actionOrderUser.split(",");
                    // We count the number of actions contained in the
                    // Master Action list
                    for (action in this.masterActionList) {
                        if (this.masterActionList.hasOwnProperty(action)) {
                            masterActionListCount += 1;
                            global.log(9, "Counting Action List", masterActionListCount);
                        } else {
                            global.log(1, "Error Getting Master Action List length!");
                            global.log(1, "Skipping 'action' from masterActionList: " + action);
                        }
                    }
                } else {
                    // We are building the Action Order Array from the
                    // Master Action List
                    global.log(1, "Building the default Action Order");
                    for (action in this.masterActionList) {
                        if (this.masterActionList.hasOwnProperty(action)) {
                            masterActionListCount = actionOrderArray.push(action);
                            global.log(9, "Action Added", action);
                        } else {
                            global.log(1, "Error Building Default Action Order!");
                            global.log(1, "Skipping 'action' from masterActionList: " + action);
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
                    global.log(1, "Warning! Action Order Array has fewer orders than default!");
                }

                if (actionOrderArrayCount > masterActionListCount) {
                    global.log(1, "Warning! Action Order Array has more orders than default!");
                }

                // We build the Action List
                global.log(8, "Building Action List ...");
                for (var itemCount = 0; itemCount !== actionOrderArrayCount; itemCount += 1) {
                    var actionItem = '';
                    if (actionOrderUser !== '') {
                        // We are using the user defined comma separated list
                        // of hex pairs
                        actionItem = this.masterActionList[parseInt(actionOrderArray[itemCount], 16)];
                        global.log(9, "(" + itemCount + ") Converted user defined hex pair to action", actionItem);
                    } else {
                        // We are using the Master Action List
                        actionItem = this.masterActionList[actionOrderArray[itemCount]];
                        global.log(9, "(" + itemCount + ") Converted Master Action List entry to an action", actionItem);
                    }

                    // Check the Action Item
                    if (actionItem.length > 0 && typeof(actionItem) === "string") {
                        // We add the Action Item to the Action List
                        this.actionsList.push(actionItem);
                        global.log(9, "Added action to the list", actionItem);
                    } else {
                        global.log(1, "Error! Skipping actionItem");
                        global.log(1, "Action Item(" + itemCount + "): " + actionItem);
                    }
                }

                if (actionOrderUser !== '') {
                    global.log(1, "Get Action List: " + this.actionsList);
                }
            }
            return true;
        } catch (err) {
            // Something went wrong, log it and use the emergency Action List.
            global.error("ERROR in MakeActionsList: " + err);
            this.actionsList = [
                "AutoElite",
                "Heal",
                "ImmediateBanking",
                "ImmediateAutoStat",
                "MaxEnergyQuest",
                "DemiPoints",
                "MonsterReview",
                "Monsters",
                "Battle",
                "MonsterFinder",
                "Quests",
                "Bank",
                "PassiveGeneral",
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

    MainLoop: function () {
        this.waitMilliSecs = 5000;
        // assorted errors...
        var href = window.location.href;
        if (href.indexOf('/common/error.html') >= 0) {
            global.log(1, 'detected error page, waiting to go back to previous page.');
            window.setTimeout(function () {
                window.history.go(-1);
            }, 30 * 1000);

            return;
        }

        if ($('#try_again_button').length) {
            global.log(1, 'detected Try Again message, waiting to reload');
            // error
            window.setTimeout(function () {
                window.history.go(0);
            }, 30 * 1000);

            return;
        }

        var locationFBMF = false;
        if (global.is_chrome) {
            if (href.indexOf('apps.facebook.com/reqs.php') >= 0 || href.indexOf('apps.facebook.com/home.php') >= 0 || href.indexOf('filter=app_46755028429') >= 0) {
                locationFBMF = true;
            }
        } else {
            if (href.indexOf('www.facebook.com/reqs.php') >= 0 || href.indexOf('www.facebook.com/home.php') >= 0 || href.indexOf('filter=app_46755028429') >= 0) {
                locationFBMF = true;
            }
        }

        if (locationFBMF) {
            if (gm.getValue("mfStatus", "") === "OpenMonster") {
                global.log(1, "Opening Monster " + gm.getValue("navLink"));
                this.CheckMonster();
            } else if (gm.getValue("mfStatus", "") === "CheckMonster") {
                global.log(1, "Scanning URL for new monster");
                this.selectMonst();
            }

            this.MonsterFinderOnFB();
            this.AcceptGiftOnFB();
            this.WaitMainLoop();
            return;
        }

        //We don't need to send out any notifications
        var button = nHtml.FindByAttrContains(document.body, "a", "class", 'undo_link');
        if (button) {
            this.Click(button);
            global.log(1, 'Undoing notification');
        }

        var caapDisabled = gm.getValue('Disabled', false);
        if (caapDisabled) {
            if (global.is_chrome) {
                CE_message("disabled", null, caapDisabled);
            }

            this.WaitMainLoop();
            return;
        }

        if (!this.pageLoadOK) {
            var noWindowLoad = gm.getValue('NoWindowLoad', 0);

            if (noWindowLoad === 0) {
                this.JustDidIt('NoWindowLoadTimer');
                gm.setValue('NoWindowLoad', 1);
            } else if (this.WhileSinceDidIt('NoWindowLoadTimer', Math.min(Math.pow(2, noWindowLoad - 1) * 15, 60 * 60))) {
                this.JustDidIt('NoWindowLoadTimer');
                gm.setValue('NoWindowLoad', noWindowLoad + 1);
                global.ReloadCastleAge();
            }

            global.log(1, 'Page no-load count: ' + noWindowLoad);
            this.pageLoadOK = this.GetStats();
            this.WaitMainLoop();
            return;
        } else {
            gm.setValue('NoWindowLoad', 0);
        }

        if (gm.getValue('caapPause', 'none') !== 'none') {
            this.caapDivObject.css({
                background : gm.getValue('StyleBackgroundDark', '#fee'),
                opacity    : gm.getValue('StyleOpacityDark', '1')
            });

            this.caapTopObject.css({
                background : gm.getValue('StyleBackgroundDark', '#fee'),
                opacity    : gm.getValue('StyleOpacityDark', '1')
            });

            this.WaitMainLoop();
            return;
        }

        if (this.WhileSinceDidIt('clickedOnSomething', 45) && this.waitingForDomLoad) {
            global.log(1, 'Clicked on something, but nothing new loaded.  Reloading page.');
            global.ReloadCastleAge();
        }

        if (this.AutoIncome()) {
            this.CheckLastAction('AutoIncome');
            this.WaitMainLoop();
            return;
        }

        this.MakeActionsList();
        var actionsListCopy = this.actionsList.slice();

        global.log(9, "Action List", actionsListCopy);
        if (!gm.getValue('ReleaseControl', false)) {
            actionsListCopy.unshift(gm.getValue('LastAction', 'Idle'));
        } else {
            gm.setValue('ReleaseControl', false);
        }

        global.log(9, 'Action List2', actionsListCopy);
        for (var action in actionsListCopy) {
            if (actionsListCopy.hasOwnProperty(action)) {
                global.log(8, 'Action', actionsListCopy[action]);
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
        nHtml.setTimeout(function () {
            caap.waitForPageChange = false;
            caap.MainLoop();
        }, caap.waitMilliSecs * (1 + Math.random() * 0.2));
    }
};

/////////////////////////////////////////////////////////////////////
//                         BEGIN
/////////////////////////////////////////////////////////////////////

if (typeof GM_log !== 'function') {
    alert("Your browser does not appear to support Greasemonkey scripts!");
    throw "Error: Your browser does not appear to support Greasemonkey scripts!";
}

global.logLevel = gm.getValue('DebugLevel', global.logLevel);
global.log(1, "Starting");

/////////////////////////////////////////////////////////////////////
//                         Chrome Startup
/////////////////////////////////////////////////////////////////////

if (global.is_chrome) {
    try {
        var lastVersion      = localStorage.getItem(global.gameName + '__LastVersion', 0),
            shouldTryConvert = false;

        if (lastVersion) {
            if (lastVersion.substr(0, 1) === 's') {
                shouldTryConvert = true;
            }
        }

        if (caapVersion <= '140.21.9' || shouldTryConvert) {
            ConvertGMtoJSON();
        }
    } catch (err) {
        global.error("Error converting DB: " + err);
    }

    try {
        CM_Listener();
    } catch (err) {
        global.error("Error loading CM_Listener" + err);
    }
}

/////////////////////////////////////////////////////////////////////
//                         Set Title
/////////////////////////////////////////////////////////////////////

if (gm.getValue('SetTitle')) {
    var DocumentTitle = '';
    if (gm.getValue('SetTitleAction', false)) {
        DocumentTitle += "Starting - ";
    }

    if (gm.getValue('SetTitleName', false)) {
        caap.stats.PlayerName = gm.getValue('PlayerName', '');
        DocumentTitle += caap.stats.PlayerName + " - ";
    }

    document.title = DocumentTitle + global.documentTitle;
}

/////////////////////////////////////////////////////////////////////
//                          http://code.google.com/ updater
// Used by browsers other than Chrome (namely Firefox and Flock)
// to get updates from http://code.google.com/
/////////////////////////////////////////////////////////////////////

if (!global.is_chrome) {
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

if (gm.getValue('LastVersion', 0) !== caapVersion) {
    try {
        if ((gm.getValue('LastVersion', 0) < '140.15.3' || gm.getValue('LastVersion', 0) < '140.21.0' || gm.getValue('LastVersion', 0) < '140.23.51') &&
                gm.getValue("actionOrder", '') !== '') {
            alert("You are using a user defined Action List!\n" +
                  "The Master Action List has changed!\n" +
                  "You must update your Action List!");
        }

        if (gm.getValue('LastVersion', 0) < '140.16.2') {
            for (var a = 1; a <= 5; a += 1) {
                var attribute = gm.getValue("Attribute" + a, '');
                if (attribute !== '') {
                    gm.setValue("Attribute" + a, attribute.ucFirst());
                    global.log(1, "Converted Attribute" + a + ": " + attribute + "   to: " + attribute.ucFirst());
                }
            }
        }

        if (gm.getValue('LastVersion', 0) < '140.23.0') {
            var convertToArray = function (name) {
                var value = gm.getValue(name, '');
                var eList = [];
                if (value.length) {
                    value = value.replace(/\n/gi, ',');
                    eList = value.split(',');
                    var fEmpty = function (e) {
                        return e !== '';
                    };

                    eList = eList.filter(fEmpty);
                    if (!eList.length) {
                        eList = [];
                    }
                }

                gm.setList(name, eList);
            };

            convertToArray('EliteArmyList');
            convertToArray('BattleTargets');
        }

        if (gm.getValue('LastVersion', 0) < '140.23.6') {
            gm.deleteValue('AutoEliteGetList');
            gm.deleteValue('AutoEliteReqNext');
            gm.deleteValue('AutoEliteEnd');
            gm.deleteValue('MyEliteTodo');
        }

        if (gm.getValue('LastVersion', 0) < '140.23.51') {
            gm.deleteValue('userStats');
            gm.deleteValue('AllGenerals');
            gm.deleteValue('GeneralImages');
            gm.deleteValue('LevelUpGenerals');
        }

        gm.setValue('LastVersion', caapVersion);
    } catch (err) {
        global.error("ERROR in Environment updater: " + err);
    }
}

/////////////////////////////////////////////////////////////////////
//                    On Page Load
/////////////////////////////////////////////////////////////////////

$(function () {
    global.log(1, 'Full page load completed');
    // If unable to read in gm.values, then reload the page
    if (gm.getValue('caapPause', 'none') !== 'none' && gm.getValue('caapPause', 'none') !== 'block') {
        global.error('ERROR: Refresh page because unable to load gm.values due to unsafewindow error');
        window.location.href = window.location.href;
    }

    css.AddCSS();
    gm.setValue('clickUrl', window.location.href);
    if (window.location.href.indexOf('facebook.com/castle_age/') >= 0) {
        caap.LoadStats();
        caap.stats.FBID = $('head').html().regex(/user:([0-9]+),/i);
        caap.stats.account = $('#navAccountName').text();
        global.log(9, "FBID", caap.stats.FBID);
        if (!caap.stats.FBID || typeof caap.stats.FBID !== 'number' || caap.stats.FBID === 0) {
            // Force reload without retrying
            global.error('ERROR: No Facebook UserID!!!');
            window.location.href = window.location.href;
        }

        gm.setValue('caapPause', 'none');
        gm.setValue('ReleaseControl', true);
        if (global.is_chrome) {
            CE_message("paused", null, gm.getValue('caapPause', 'none'));
        }

        nHtml.setTimeout(function () {
            caap.init();
        }, 200);
    }

    caap.waitMilliSecs = 8000;
    caap.WaitMainLoop();
});

global.ReloadOccasionally();

// ENDOFSCRIPT
