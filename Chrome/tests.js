/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true, eqeqeq: true, newcap: true, strict: true, onevar: true, maxerr: 50, maxlen: 280, indent: 4 */
/*global window,GM_getValue,GM_setValue,GM_deleteValue,GM_listValues,localStorage,sessionStorage,utility,JSON2,RISON,rison */
/*jslint maxlen: 310 */

////////////////////////////////////////////////////////////////////
//                        Tests for utility library
/////////////////////////////////////////////////////////////////////
(function () {
    "use strict";

    var tests = {};

    tests = {
        chars: function (start, end) {
            try {
                start = typeof start === 'number' ? start : 32;
                end = typeof end === 'number' ? end : 126;
                var t = '',
                    i = 0;

                for (i = start; i <= end; i += 1) {
                    t += String.fromCharCode(i);
                }

                return t;
            } catch (err) {
                utility.error("ERROR in tests.chars: " + err);
                return undefined;
            }
        },

        charWhiteSpace: function () {
            try {
                var t = '',
                    i = '',
                    w = String.whiteSpace;

                for (i in w) {
                    if (w.hasOwnProperty(i)) {
                        t += String.fromCharCode(i);
                    }
                }

                return t;
            } catch (err) {
                utility.error("ERROR in tests.charWhiteSpace: " + err);
                return undefined;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        testJson: function (x) {
            try {
                var a = ['', 1, "2", 1e+30, 1e-30, [], "wow!", "can't", {}, new Date(), new RegExp("\\d", "g"), {'a': 1, 'b': "2", 'c': new Date(), 'd': new RegExp("\\d", "g")}, {'a': 1, 'b': "2", 'c': new Date(), 'd': new RegExp("\\d", "g")}],
                    z = tests.chars(0, 126),
                    b = '',
                    c = '',
                    d = [],
                    e = [],
                    p = true;

                a = x ? x : a;
                if (JSON.stringify !== JSON2.stringify) {
                    utility.log(1, "Browser has native JSON.stringify");
                }

                b = JSON.stringify(a);
                c = JSON2.stringify(a);
                p = b === c ? p : false;
                b = JSON.stringify(z);
                c = JSON2.stringify(z);
                p = b === c ? p : false;
                utility.log(1, "JSON.stringify " + (p ? "Passed" : "Failed"));
                if (JSON.parse !== JSON2.parse) {
                    utility.log(1, "Browser has native JSON.parse");
                }

                b = JSON.stringify(a);
                c = JSON2.stringify(a);
                d = JSON.parse(b);
                e = JSON2.parse(c);
                b = JSON.stringify(e);
                c = JSON2.stringify(d);
                p = b === c ? p : false;
                b = JSON.stringify(z);
                c = JSON2.stringify(z);
                d = JSON.parse(b);
                e = JSON2.parse(c);
                b = JSON.stringify(e);
                c = JSON2.stringify(d);
                p = b === c ? p : false;
                utility.log(1, "JSON.parse " + (p ? "Passed" : "Failed"));
                return p;
            } catch (err) {
                utility.error("ERROR in tests.testJson: " + err);
                return undefined;
            }
        },

        testRison: function (x) {
            try {
                var a = ['', 1, "2", 1e+30, 1e-30, [], "wow!", "can't", {}, new Date(), new RegExp("\\d", "g"), {'a': 1, 'b': "2", 'c': new Date(), 'd': new RegExp("\\d", "g")}, {'a': 1, 'b': "2", 'c': new Date(), 'd': new RegExp("\\d", "g")}],
                    d = [],
                    g = '',
                    h = '',
                    i = '',
                    p = true;

                a = x ? x : a;
                g = JSON.stringify(a);
                h = RISON.stringify(a);
                d = RISON.parse(h);
                i = JSON.stringify(d);
                p = g === i ? p : false;

                a = tests.chars(0, 126);
                g = JSON.stringify(a);
                h = RISON.encode(a);
                d = RISON.decode(h);
                i = JSON.stringify(d);
                p = g === i ? p : false;
                utility.log(1, "RISON " + (p ? "Passed" : "Failed"));

                if (RISON.encode !== rison.encode) {
                    g = JSON.stringify(a);
                    h = rison.encode(a);
                    d = rison.decode(h);
                    i = JSON.stringify(d);
                    utility.log(1, "rison " + (g === i ? "Passed" : "Failed"));
                    p = g === i ? p : false;
                }

                return p;
            } catch (err) {
                utility.error("ERROR in tests.testRison: " + err);
                return undefined;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        testTrims: function (x) {
            try {
                x = utility.isNumber(x) ? x : 100000;
                var q  = "Just a little test text.",
                    i  = 0,
                    t1 = 0,
                    t2 = 0,
                    r  = {},
                    w  = tests.charWhiteSpace(),
                    s  = w + q + w,
                    p = '',
                    m = '',
                    a = ["0009", "000a", "000b", "000c", "000d", "0020", "0085", "00a0", "1680", "180e", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "200a", "200b", "2028", "2029", "202f", "205f", "3000"];

                // Native trim
                if (String.prototype.trim !== String.prototype.outerTrim) {
                    t1 = new Date().getTime();
                    for (i = x; i > 0; i -= 1) {
                        p = s.trim();
                    }

                    t2 = new Date().getTime();
                    // outerTrim recognises more Unicode whitespaces than native trim, so we specify the list to test
                    // see ECMA-262 5th edition about BOM as whitespace
                    m = s.outerTrim({'list': a});
                    r['trim'] = {};
                    r['trim']['desc'] = 'Native';
                    r['trim']['iter'] = x;
                    r['trim']['time'] = t2 - t1;
                    r['trim']['string'] = [p, m];
                    r['trim']['passed'] = p === m;
                }

                // outerTrim using lookup table
                t1 = new Date().getTime();
                for (i = x; i >= 0; i -= 1) {
                    s.outerTrim();
                }

                t2 = new Date().getTime();
                r['trim1'] = {};
                r['trim1']['desc'] = 'outerTrim lookup';
                r['trim1']['iter'] = x;
                r['trim1']['time'] = t2 - t1;
                r['trim1']['string'] = s.outerTrim();
                r['trim1']['passed'] = s.outerTrim() === q;

                // outerTrim using RegExp
                t1 = new Date().getTime();
                for (i = x; i >= 0; i -= 1) {
                    p = s.outerTrim({'rx': true});
                }

                t2 = new Date().getTime();
                r['trim2'] = {};
                r['trim2']['desc'] = 'outerTrim regexp';
                r['trim2']['iter'] = x;
                r['trim2']['time'] = t2 - t1;
                r['trim2']['string'] = p;
                r['trim2']['passed'] = p === q;

                if (String.prototype.trim !== String.prototype.outerTrim) {
                    utility.log(1, "Browser has native trim " + (r['trim']['passed'] ? "Passed" : "Failed"));
                }

                utility.log(1, "outerTrim " + (r['trim1']['passed'] && r['trim2']['passed'] ? "Passed" : "Failed"), r);
                return r['trim1']['passed'] && r['trim2']['passed'];
            } catch (err) {
                utility.error("ERROR in tests.testTrims: " + err);
                return undefined;
            }
        },

        testInnerTrim: function (x) {
            try {
                x = utility.isNumber(x) ? x : 100000;
                var p  = '',
                    i  = 0,
                    t1 = 0,
                    t2 = 0,
                    r  = {},
                    w  = tests.charWhiteSpace(),
                    q  = w + "Just a little test text." + w,
                    s  = w + "Just" + w + "a" + w + "little" + w + "test" + w + "text." + w;

                // innerTrim using lookup table
                t1 = new Date().getTime();
                for (i = x; i >= 0; i -= 1) {
                    p = s.innerTrim();
                }

                t2 = new Date().getTime();
                r['trim1'] = {};
                r['trim1']['desc'] = 'innerTrim lookup';
                r['trim1']['iter'] = x;
                r['trim1']['time'] = t2 - t1;
                r['trim1']['string'] = p;
                r['trim1']['passed'] = p === q;

                // innerTrim using RegExp
                t1 = new Date().getTime();
                for (i = x; i >= 0; i -= 1) {
                    p = s.innerTrim({'rx': true});
                }

                t2 = new Date().getTime();
                r['trim2'] = {};
                r['trim2']['desc'] = 'innerTrim regexp';
                r['trim2']['iter'] = x;
                r['trim2']['time'] = t2 - t1;
                r['trim2']['string'] = p;
                r['trim2']['passed'] = p === q;

                utility.log(1, "innerTrim " + (r['trim1']['passed'] && r['trim2']['passed'] ? "Passed" : "Failed"), r);
                return r['trim1']['passed'] && r['trim2']['passed'];
            } catch (err) {
                utility.error("ERROR in tests.testInnerTrim: " + err);
                return undefined;
            }
        },
        /*jslint sub: false */

        testMD5: function () {
            try {
                var t = '',
                    r = '',
                    c = 'e5df5a39f2b8cb71b24e1d8038f93131',
                    d = 'e1cb1402564d3f0d07fc946196789c81',
                    p = true;

                t = tests.chars();
                r = t.MD5();
                if (r !== c) {
                    p = false;
                }

                t = tests.chars(0, 255);
                r = t.MD5();
                if (r !== d) {
                    p = false;
                }


                if (p) {
                    utility.log(1, "MD5 Passed");
                } else {
                    utility.warn("MD5 Failed");
                }

                return p;
            } catch (err) {
                utility.error("ERROR in tests.testMD5: " + err);
                return undefined;
            }
        },

        testSHA1: function () {
            try {
                var t = '',
                    r = '',
                    c = 'e4f8188cdca2a68b074005e2ccab5b67842c6fc7',
                    d = 'ae79896181f7034c2c11a57bd211ec3dea276625',
                    p = true;

                t = tests.chars();
                r = t.SHA1();
                if (r !== c) {
                    p = false;
                }

                t = tests.chars(0, 255);
                r = t.SHA1();
                if (r !== d) {
                    p = false;
                }

                if (p) {
                    utility.log(1, "SHA1 Passed");
                } else {
                    utility.warn("SHA1 Failed");
                }

                return p;
            } catch (err) {
                utility.error("ERROR in tests.testSHA1: " + err);
                return undefined;
            }
        },

        testSHA256: function () {
            try {
                var t = '',
                    r = '',
                    c = 'cb2a9233adc1225c5c495c46e62cf6308223c5e241ef33ad109f03141b57966a',
                    d = '9799e3eb6096a48f515a94324200b7af24251a4131eccf9a2cd65d012a1f5c71',
                    p = true;

                t = tests.chars();
                r = t.SHA256();
                if (r !== c) {
                    p = false;
                }

                t = tests.chars(0, 255);
                r = t.SHA256();
                if (r !== d) {
                    p = false;
                }

                if (p) {
                    utility.log(1, "SHA256 Passed");
                } else {
                    utility.warn("SHA256 Failed");
                }

                return p;
            } catch (err) {
                utility.error("ERROR in tests.testSHA256: " + err);
                return undefined;
            }
        },

        testUTF8: function () {
            try {
                var t = '',
                    r = '',
                    s = '',
                    p = true;

                t = tests.chars(0, 255);
                r = t.Utf8encode();
                s = r.Utf8decode();
                if (s !== t) {
                    p = false;
                }

                if (p) {
                    utility.log(1, "Utf8 Passed");
                } else {
                    utility.warn("Utf8 Failed");
                }

                return p;
            } catch (err) {
                utility.error("ERROR in tests.testUTF8: " + err);
                return undefined;
            }
        },

        testBase64: function () {
            try {
                var t = '',
                    c = "/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAVQAA/+4ADkFkb2JlAGTAAAAAAf/" +
                        "bAIQAAgEBAQEBAgEBAgMCAQIDAwICAgIDAwMDAwMDAwQDBAQEBAMEBAUGBgYFBAcHCAgHBwoKCg" +
                        "oKDAwMDAwMDAwMDAECAgIEAwQHBAQHCggHCAoMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD" +
                        "AwMDAwMDAwMDAwMDAwMDAwMDAwM/8AAEQgAFgAWAwERAAIRAQMRAf/EAGsAAQEAAAAAAAAAAAAA" +
                        "AAAAAAgJAQEBAQAAAAAAAAAAAAAAAAABAgMQAAEDAgUCBAYDAAAAAAAAAAIBAwQFBhESEwcIABQ" +
                        "xIhUJIUEyQmIWM0QXEQEBAQADAAAAAAAAAAAAAAABABEhQQL/2gAMAwEAAhEDEQA/AI58ethnb+" +
                        "kS7muKYUSgQybdmTnm+67dJJuJGjx4zhgD0p9GjNEcXTbbTOSEpCPUgZUtQmkeyg5upxKp3J7ba" +
                        "7JFZ20lNKNZkxKhT6y9bcgSVsm6zRXKZAJsRVMSKM6mAqhCuCoqmkQKkcMNzInKuPxvbZYW5Jb5" +
                        "xXAOe8FLBoI3qQzxl4K6UE4grJT4auQTb/kHFVCRml7Hd+bQ29cb8vda2ot47bNSDC8qBLjsSXD" +
                        "oNaokOjJPjg+ipnhS6caIqYKhYChCpovQmkdyZ5Pcsmvbkvxqwfb8u+3K9wfuejzQl0ZuSFWkTp" +
                        "tRh+nzv2lpQizYzzSGgxQzNoIj5kVVLqPPnGVgPflyy6tyusymwHsLzp1DKmzFzojpyW6XXagUf" +
                        "H5ugxUWW8vjmPL4ph1qwR64hv8AJWDudETjzHkzrncfmDC9MeBh5oEbRZhEUsCY7XTypISQCsYY" +
                        "ZsFyr0DxKSOu+8eXs15+E1alIj30KFqSaa5bLEwzRP67hVWe1qL9uhHQsfowXp2MiJJlbpf6jGq" +
                        "VRjJ+4ec6fTiORn1O4LOAGha3caubFVPV1fzwToWcv//Z",
                    r = '',
                    s = '',
                    p = true;

                t = tests.chars(0, 255);
                r = t.Base64encode();
                s = r.Base64decode();
                if (s !== t) {
                    p = false;
                }

                r = c.Base64decode();
                s = r.Base64encode();
                if (s !== c) {
                    p = false;
                }

                if (p) {
                    utility.log(1, "Base64 Passed");
                } else {
                    utility.warn("Base64 Failed");
                }

                return p;
            } catch (err) {
                utility.error("ERROR in tests.testBase64: " + err);
                return undefined;
            }
        },

        testAes: function () {
            try {
                var t = '',
                    r = '',
                    s = '',
                    c = new utility.Aes("password"),
                    d = new utility.Aes("test"),
                    e = 'YWQ1TWVlZWXr+E1tVWIBV0wzwzwdzTiH/YEHUjpWgt7sx9NcneHZHQ==',
                    f = "pssst ... đon’t tell anyøne!",
                    p = true;

                t = tests.chars(0, 255);
                r = c.encrypt(t);
                s = c.decrypt(r);
                if (s !== t) {
                    p = false;
                }

                r = d.decrypt(e);
                if (r !== f) {
                    p = false;
                }

                if (p) {
                    utility.log(1, "Aes Passed");
                } else {
                    utility.warn("Aes Failed");
                }

                return p;
            } catch (err) {
                utility.error("ERROR in tests.testAes: " + err);
                return undefined;
            }
        },

        testLZ77: function () {
            try {
                var t = '',
                    r = '',
                    s = '',
                    c = new utility.LZ77(),
                    p = true;

                t = tests.chars(0, 255);
                r = c.compress(t);
                s = c.decompress(r);
                if (s !== t) {
                    p = false;
                }

                t = "LZ77 algorithms achieve compression by replacing portions of the data with references";
                t += " to matching data that have already passed through both encoder and decoder. A match";
                t += " is encoded by a pair of numbers called a length-distance pair, which is equivalent to";
                t += " the statement \"each of the next length characters is equal to the character exactly ";
                t += "distance characters behind it in the uncompressed stream.\" (The \"distance\" is sometimes";
                t += " called the \"offset\" instead.)\n";
                t += "The encoder and decoder must both keep track of some amount of the most recent data, such";
                t += " as the last 2 kB, 4 kB, or 32 kB. The structure in which this data is held is called a ";
                t += "sliding window, which is why LZ77 is sometimes called sliding window compression. The ";
                t += "encoder needs to keep this data to look for matches, and the decoder needs to keep this data";
                t += " to interpret the matches the encoder refers to. This is why the encoder can use a smaller ";
                t += "size sliding window than the decoder, but not vice-versa.\n";
                t += "Many documents which talk about LZ77 algorithms describe a length-distance pair as a command ";
                t += "to \"copy\" data from the sliding window: \"Go back distance characters in the buffer and ";
                t += "copy length characters, starting from that point.\" While those used to imperative programming";
                t += " may find this model intuitive, it may also make it hard to understand a feature of LZ77 ";
                t += "encoding: namely, that it is not only acceptable but frequently useful to have a length-distance";
                t += " pair where the length actually exceeds the distance. As a copy command, this is puzzling: \"Go ";
                t += "back one character in the buffer and copy seven characters, starting from that point.\" How can";
                t += " seven characters be copied from the buffer when only one of the specified characters is actually";
                t += " in the buffer? Looking at a length-distance pair as a statement of identity, however, clarifies ";
                t += "the confusion: each of the next seven characters is identical to the character that comes one ";
                t += "before it. This means that each character can be determined by looking back in the buffer – even ";
                t += "if the character looked back to was not in the buffer when the decoding of the current pair began. ";
                t += "Since by definition a pair like this will be repeating a sequence of distance characters multiple ";
                t += "times, it means that LZ77 incorporates a flexible and easy form of run-length encoding.";
                r = c.compress(t);
                s = c.decompress(r);
                if (s !== t) {
                    p = false;
                }

                if (p) {
                    utility.log(1, "LZ77 Passed", ((r.length / t.length) * 100).dp(2));
                } else {
                    utility.warn("LZ77 Failed");
                }

                return p;
            } catch (err) {
                utility.error("ERROR in tests.testLZ77: " + err);
                return undefined;
            }
        },

        testUrlStuff: function (url) {
            try {
                var test = [
                        "http://abc/def/ghi.html?tuv&123#xyz",
                        "http://abc/def/ghi.html?tuv#xyz&123",
                        "http://abc/def/ghi.php&123#xyz?tuv",
                        "http://abc/def/ghi.html&123?tuv#xyz",
                        "http://abc/def/ghi.css#xyz?tuv&123",
                        "http://abc/def/ghi.html#xyz?&123tuv",
                        "http://abc/def/ghi.js?tuv&123",
                        "http://abc/def/ghi.html&123?tuv",
                        "http://abc/def/ghi.png?tuv#xyz",
                        "http://abc/def/ghi.html#xyz?tuv",
                        "http://abc/def/ghi.jpg#xyz&123",
                        "http://abc/def/ghi.html&123#xyz",
                        "http://abc/def/ghi.html?tuv",
                        "http://abc/def/ghi.bmp&123",
                        "http://abc/def/ghi.html#xyz",
                        "http://abc/def/ghi.html",
                        "http://abc/def/ghi.jk.html",
                        "http://abc/def/ghi.html?tuv=\"/abc.d\"",
                        "http://abc/def/ghi.html?tuv=\"/abc.d?abc\"",
                        "http://abc/def/ghi.html?tuv=\"/abc.d#cde\"",
                        "http://abc/def/ghi.html?tuv=\"/abc.d&fgh\"",
                        "http://abc/def/ghi",
                        "http://abc/def/ghi/",
                        "abc",
                        "abc.html",
                        "/abc",
                        "/abc.html"
                    ],
                    x = 0,
                    l = 0;

                test = utility.isString(url) ? [url] : test;
                for (x = 0, l = test.length; x < test.length; x += 1) {
                    utility.log(2, 'Url     : ', test[x]);
                    utility.log(2, 'dirname : ', test[x].dirname());
                    utility.log(2, 'filename: ', test[x].basename(test[x].fileext()));
                    utility.log(2, 'fileext : ', test[x].fileext(), test[x].getUrlQuery());
                    utility.log(2, 'urlquery: ', test[x].getUrlQuery());
                }
            } catch (err) {
                utility.error("ERROR in tests.testUrlStuff: " + err);
            }
        },

        testsRun: function (run) {
            try {
                var p = true;
                if (run) {
                    if (!tests.testTrims(1)) {
                        p = false;
                    }

                    if (!tests.testInnerTrim(1)) {
                        p = false;
                    }

                    if (!tests.testJson()) {
                        p = false;
                    }

                    if (!tests.testRison()) {
                        p = false;
                    }

                    if (!tests.testMD5()) {
                        p = false;
                    }

                    if (!tests.testSHA1()) {
                        p = false;
                    }

                    if (!tests.testSHA256()) {
                        p = false;
                    }

                    if (!tests.testUTF8()) {
                        p = false;
                    }

                    if (!tests.testBase64()) {
                        p = false;
                    }

                    if (!tests.testAes()) {
                        p = false;
                    }

                    if (!tests.testLZ77()) {
                        p = false;
                    }
                }

                if (!p) {
                    utility.warn("One or more tests failed!");
                }

                return p;
            } catch (err) {
                utility.error("ERROR in tests.testsRun: " + err);
                return undefined;
            }
        }
    };

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    tests['chars'] = tests.chars;
    tests['testJson'] = tests.testJson;
    tests['testRison'] = tests.testRison;
    tests['testTrims'] = tests.testTrims;
    tests['testInnerTrim'] = tests.testInnerTrim;
    tests['testMD5'] = tests.testMD5;
    tests['testSHA1'] = tests.testSHA1;
    tests['testSHA256'] = tests.testSHA256;
    tests['testUTF8'] = tests.testUTF8;
    tests['testBase64'] = tests.testBase64;
    tests['testAes'] = tests.testAes;
    tests['testLZ77'] = tests.testLZ77;
    tests['testAes'] = tests.testAes;
    tests['testUrlStuff'] = tests.testUrlStuff;
    tests['testsRun'] = tests.testsRun;

    if (!window['tests']) {
        window['tests'] = window.tests = tests;
    }
    /*jslint sub: false */
}());
