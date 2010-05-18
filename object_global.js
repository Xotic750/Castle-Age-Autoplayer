
///////////////////////////
// Define our global object
///////////////////////////

global = {
    gameName: 'castle_age',

    discussionURL: 'http://senses.ws/caap/index.php',

    debug: false,

    newVersionAvailable: false,

    documentTitle: document.title,

    is_chrome: navigator.userAgent.toLowerCase().indexOf('chrome') != -1 ? true : false,

    is_firefox: navigator.userAgent.toLowerCase().indexOf('firefox') != -1  ? true : false,

    // Object separator - used to separate objects
    os: '\n',

    // Value separator - used to separate name/values within the objects
    vs: '\t',

    // Label separator - used to separate the name from the value
    ls: '\f',

    AddCSS: function () {
        $("<link>").appendTo("head").attr({
            rel: "stylesheet",
            type: "text/css",
            href: "http://github.com/Xotic750/Castle-Age-Autoplayer/raw/master/jquery-ui-1.8.1/css/smoothness/jquery-ui-1.8.1.custom.css"
        });

        $("<link>").appendTo("head").attr({
            rel: "stylesheet",
            type: "text/css",
            href: "http://github.com/Xotic750/Castle-Age-Autoplayer/raw/master/farbtastic12/farbtastic/farbtastic.css"
        });
    },

    alert_id: 0,

    alert: function (message) {
        global.alert_id += 1;
        var id = global.alert_id;
        $('<div id="alert_' + id + '" title="Alert!"><p>' + message + '</p></div>').appendTo(document.body);
        $("#alert_" + id).dialog({ buttons: { "Ok": function() { $(this).dialog("close"); } } });
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
