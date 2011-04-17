
//////////////////////////////////
//       Globals
//////////////////////////////////

(function () {
    var caapVersion   = "!version!",
        devVersion    = "!dev!",
        hiddenVar     = true,
        caap_timeout  = 0,
        image64       = {},
        offline       = {},
        config        = {},
        state         = {},
        css           = {},
        gm            = null,
        ss            = null,
        sort          = {},
        schedule      = {},
        general       = {},
        monster       = {},
        guild_monster = {},
        //arena         = {},
        festival      = {},
        feed          = {},
        battle        = {},
        town          = {},
        spreadsheet   = {},
        gifting       = {},
        army          = {},
        caap          = {};

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    String.prototype['unescapeCAHTML'] = String.prototype.unescapeCAHTML = function () {
        return this.replace(/\\u003c/g, "<").stripTRN().replace(/\\\//g, "/").replace(/\\"/g, "\"");
    };

    String.prototype['stripCATN'] = String.prototype.stripCATN = function () {
        return this.replace(/\\t|\\n/g, "");
    };

    String.prototype['stripCaap'] = String.prototype.stripCaap = function () {
        return this.replace(/caap_/i, '');
    };

    String.prototype['numberOnly'] = String.prototype.numberOnly = function () {
        return parseFloat(this.replace(new RegExp("[^\\d\\.]", "g"), ''));
    };

    String.prototype['uni2char'] = String.prototype.uni2char = function () {
        var str = this;
        str=str.replace(/u0001/gi, "âº");
        str=str.replace(/u0002/gi, "â»");
        str=str.replace(/u0003/gi, "â¥");
        str=str.replace(/u0004/gi, "â¦");
        str=str.replace(/u0005/gi, "â£");
        str=str.replace(/u0006/gi, "â ");
        str=str.replace(/u0007/gi, "â¢");
        str=str.replace(/u0008/gi, "â");
        str=str.replace(/u0009/gi, "â");
        str=str.replace(/u000A/gi, "â");
        str=str.replace(/u000B/gi, "â");
        str=str.replace(/u000C/gi, "â");
        str=str.replace(/u000D/gi, "âª");
        str=str.replace(/u000E/gi, "â«");
        str=str.replace(/u000F/gi, "â¼");
        str=str.replace(/u0010/gi, "âº");
        str=str.replace(/u0011/gi, "â");
        str=str.replace(/u0012/gi, "â");
        str=str.replace(/u0013/gi, "â¼");
        str=str.replace(/u0014/gi, "Â¶");
        str=str.replace(/u0015/gi, "Â§");
        str=str.replace(/u0016/gi, "?");
        str=str.replace(/u0017/gi, "?");
        str=str.replace(/u0018/gi, "â");
        str=str.replace(/u0019/gi, "â");
        str=str.replace(/u001A/gi, "â");
        str=str.replace(/u001B/gi, "â");
        str=str.replace(/u001C/gi, "â");
        str=str.replace(/u001D/gi, "â");
        str=str.replace(/u001E/gi, "â²");
        str=str.replace(/u001F/gi, "â¼");
        str=str.replace(/u0020/gi, " ");
        str=str.replace(/u0021/gi, "!");
        str=str.replace(/u0022/gi, "\"");
        str=str.replace(/u0023/gi, "#");
        str=str.replace(/u0024/gi, "$");
        str=str.replace(/u0025/gi, "%");
        str=str.replace(/u0026/gi, "&");
        str=str.replace(/u0027/gi, "'");
        str=str.replace(/u0028/gi, "(");
        str=str.replace(/u0029/gi, ")");
        str=str.replace(/u002A/gi, "*");
        str=str.replace(/u002B/gi, "+");
        str=str.replace(/u002C/gi, ",");
        str=str.replace(/u002D/gi, "-");
        str=str.replace(/u002E/gi, ".");
        str=str.replace(/u2026/gi, "â¦");
        str=str.replace(/u002F/gi, "/");
        str=str.replace(/u0030/gi, "0");
        str=str.replace(/u0031/gi, "1");
        str=str.replace(/u0032/gi, "2");
        str=str.replace(/u0033/gi, "3");
        str=str.replace(/u0034/gi, "4");
        str=str.replace(/u0035/gi, "5");
        str=str.replace(/u0036/gi, "6");
        str=str.replace(/u0037/gi, "7");
        str=str.replace(/u0038/gi, "8");
        str=str.replace(/u0039/gi, "9");
        str=str.replace(/u003A/gi, ":");
        str=str.replace(/u003B/gi, ";");
        str=str.replace(/u003C/gi, "<");
        str=str.replace(/u003D/gi, "=");
        str=str.replace(/u003E/gi, ">");
        str=str.replace(/u2264/gi, "â¤");
        str=str.replace(/u2265/gi, "â¥");
        str=str.replace(/u003F/gi, "?");
        str=str.replace(/u0040/gi, "@");
        str=str.replace(/u0041/gi, "A");
        str=str.replace(/u0042/gi, "B");
        str=str.replace(/u0043/gi, "C");
        str=str.replace(/u0044/gi, "D");
        str=str.replace(/u0045/gi, "E");
        str=str.replace(/u0046/gi, "F");
        str=str.replace(/u0047/gi, "G");
        str=str.replace(/u0048/gi, "H");
        str=str.replace(/u0049/gi, "I");
        str=str.replace(/u004A/gi, "J");
        str=str.replace(/u004B/gi, "K");
        str=str.replace(/u004C/gi, "L");
        str=str.replace(/u004D/gi, "M");
        str=str.replace(/u004E/gi, "N");
        str=str.replace(/u004F/gi, "O");
        str=str.replace(/u0050/gi, "P");
        str=str.replace(/u0051/gi, "Q");
        str=str.replace(/u0052/gi, "R");
        str=str.replace(/u0053/gi, "S");
        str=str.replace(/u0054/gi, "T");
        str=str.replace(/u0055/gi, "U");
        str=str.replace(/u0056/gi, "V");
        str=str.replace(/u0057/gi, "W");
        str=str.replace(/u0058/gi, "X");
        str=str.replace(/u0059/gi, "Y");
        str=str.replace(/u005A/gi, "Z");
        str=str.replace(/u005B/gi, "[");
        str=str.replace(/u005C/gi, "\\");
        str=str.replace(/u005D/gi, "]");
        str=str.replace(/u005E/gi, "^");
        str=str.replace(/u005F/gi, "_");
        str=str.replace(/u0060/gi, "`");
        str=str.replace(/u0061/gi, "a");
        str=str.replace(/u0062/gi, "b");
        str=str.replace(/u0063/gi, "c");
        str=str.replace(/u0064/gi, "d");
        str=str.replace(/u0065/gi, "e");
        str=str.replace(/u0066/gi, "f");
        str=str.replace(/u0067/gi, "g");
        str=str.replace(/u0068/gi, "h");
        str=str.replace(/u0069/gi, "i");
        str=str.replace(/u006A/gi, "j");
        str=str.replace(/u006B/gi, "k");
        str=str.replace(/u006C/gi, "l");
        str=str.replace(/u006D/gi, "m");
        str=str.replace(/u006E/gi, "n");
        str=str.replace(/u006F/gi, "o");
        str=str.replace(/u0070/gi, "p");
        str=str.replace(/u0071/gi, "q");
        str=str.replace(/u0072/gi, "r");
        str=str.replace(/u0073/gi, "s");
        str=str.replace(/u0074/gi, "t");
        str=str.replace(/u0075/gi, "u");
        str=str.replace(/u0076/gi, "v");
        str=str.replace(/u0077/gi, "w");
        str=str.replace(/u0078/gi, "x");
        str=str.replace(/u0079/gi, "y");
        str=str.replace(/u007A/gi, "z");
        str=str.replace(/u007B/gi, "{");
        str=str.replace(/u007C/gi, "|");
        str=str.replace(/u007D/gi, "}");
        str=str.replace(/u02DC/gi, "Ë");
        str=str.replace(/u007E/gi, "â¼");
        str=str.replace(/u007F/gi, "");
        str=str.replace(/u00A2/gi, "Â¢");
        str=str.replace(/u00A3/gi, "Â£");
        str=str.replace(/u00A4/gi, "Â¤");
        str=str.replace(/u20AC/gi, "â¬");
        str=str.replace(/u00A5/gi, "Â¥");
        str=str.replace(/u0026quot;/gi, "\"");
        str=str.replace(/u0026gt;/gi, ">");
        str=str.replace(/u0026lt;/gi, "<");
        return str;
    };

    String.prototype['parseTimer'] = String.prototype.parseTimer = function () {
        var a = [],
            b = 0,
            i = 0,
            l = 0;

        a = this.split(':');
        for (i = 0, l = a.length; i < l; i += 1) {
            b = b * 60 + parseInt(a[i], 10);
        }

        if (isNaN(b)) {
            b = -1;
        }

        return b;
    };
    /*jslint sub: false */
