
    ////////////////////////////////////////////////////////////////////
    //                          css OBJECT
    // this is the object for inline css
    /////////////////////////////////////////////////////////////////////

    css = {
        addCSS: function () {
            try {
                if (!$j('link[href*="jquery-ui.css"]').length) {
                    $j("<link>").appendTo("head").attr({
                        rel: "stylesheet",
                        type: "text/css",
                        href: "http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.9/themes/smoothness/jquery-ui.css"
                    });
                }

                $j("<style type='text/css'>" + css.farbtastic + "</style>").appendTo("head");
                $j("<style type='text/css'>" + css.caap + "</style>").appendTo("head");
                return true;
            } catch (err) {
                $u.error("ERROR in addCSS: " + err);
                return false;
            }
        },

        caap: ".caap_ff {font-family: 'Lucida Grande', tahoma, verdana, arial, sans-serif;}" +
              ".caap_fs {font-size: 10px;}" +
              ".caap_fn {font-size: 11px;}" +
              ".caap_ww {width: 100%;}" +
              ".caap_in {padding-left: 5%;}" +
              ".caap_tr {text-align: right;}",

        farbtastic: ".farbtastic {position: relative;}" +
                    ".farbtastic * {position: absolute; cursor: crosshair;}" +
                    ".farbtastic, .farbtastic .wheel {width: 195px; height: 195px;}" +
                    ".farbtastic .color, .farbtastic .overlay {top: 47px; left: 47px; width: 101px; height: 101px;}" +
                    ".farbtastic .wheel {background: url(data:image/png;base64," + image64.wheel + ") no-repeat; width: 195px; height: 195px;}" +
                    ".farbtastic .overlay {background: url(data:image/png;base64," + image64.mask + ") no-repeat;}" +
                    ".farbtastic .marker {width: 17px; height: 17px; margin: -8px 0 0 -8px; overflow: hidden; background: url(data:image/png;base64," + image64.marker + ") no-repeat;}"
    };
