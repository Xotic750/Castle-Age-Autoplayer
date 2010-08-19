
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
