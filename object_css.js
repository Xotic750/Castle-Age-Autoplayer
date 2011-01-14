
////////////////////////////////////////////////////////////////////
//                          css OBJECT
// this is the object for inline css
/////////////////////////////////////////////////////////////////////

css = {
    AddCSS: function () {
        try {
            var href = window.location.href;
            if (href.indexOf('apps.facebook.com/castle_age') >= 0 || href.indexOf('apps.facebook.com/reqs.php') >= 0) {
                if (!$j('link[href*="jquery-ui.css"').length) {
                    $j("<link>").appendTo("head").attr({
                        rel: "stylesheet",
                        type: "text/css",
                        href: "http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.6/themes/smoothness/jquery-ui.css"
                    });
                }

                $j("<style type='text/css'>" + css.farbtastic + "</style>").appendTo("head");
            }

            return true;
        } catch (err) {
            css.error("ERROR in AddCSS: " + err);
            return false;
        }
    },

    farbtastic: ".farbtastic {" +
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
