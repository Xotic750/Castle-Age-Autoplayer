/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                          DISPLAY FUNCTIONS
// these functions set up the control applet and allow it to be changed
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

	caap.configsExport = '';
	
    caap.chatLink = function (query) {
        try {
            var hr = new RegExp('.*(http:.*)'),
                qr = /"/g;

            $j(query).each(function () {
                var e = $j(this),
                    h = '',
                    t = '',
                    a = [];
                h = e.html();
                a = $u.hasContent(h) ? h.trim().split("<br>") : [];
                t = $u.hasContent(a[1]) ? a[1].replace(qr, '').regex(hr) : '';
                a = $u.hasContent(t) ? t.split(" ") : [];
                t = $u.hasContent(a) ? h.replace(a[0], "<a href='" + a[0] + "'>" + a[0] + "</a>") : '';
                if ($u.hasContent(t)) {
                    e.html(t);
                }

				e = null;
				a = null;
            });

            return true;
        } catch (err) {
            con.error("ERROR in caap.chatLink: " + err);
            return false;
        }
    };

    caap.makeDropDown = function (idName, dropDownList, instructions, formatParms, defaultValue, css) {
        try {
            var selectedItem = config.getItem(idName, false),
                id = idName ? " id='caap_" + idName + "'" : '',
                title = '',
                htmlCode = '',
                index = 0;

			if (selectedItem === false || !dropDownList.hasIndexOf(selectedItem)) {
				selectedItem = config.setItem(idName, $u.setContent(defaultValue, dropDownList[0]));
			}
            index = dropDownList.indexOf(selectedItem);

            title = instructions[index] ? " title='" + instructions[index].toString().escapeHTML() + "'" : '';
            css = css ? " style='" + css + "'" : '';
            formatParms = formatParms ? ' ' + formatParms : '';
            htmlCode = "<select class='caap_ff caap_fs caap_ww'" + id + css + title + formatParms + ">";
            htmlCode += "<option disabled='disabled' value='not selected'>Choose one</option>";
            dropDownList.forEach( function(item, i) {
                title = instructions[i] ? " title='" + instructions[i].toString().escapeHTML() + "'" : '';
                htmlCode += "<option value='" + item.toString().escapeHTML() + "'" + (selectedItem === item ? " selected='selected'" : '') + title + ">" + item.toString().escapeHTML() + "</option>";
            });

            htmlCode += "</select>";
            return htmlCode;
        } catch (err) {
            con.error("ERROR in makeDropDown: " + err);
            return '';
        }
    };

    caap.startTR = function (id, css) {
        try {
            id = id ? " id='" + id + "'" : '';
            css = css ? " style='" + css + "'" : '';
            return "<div class='caap_ff caap_fn caap_ww'" + id + css + ">";
        } catch (err) {
            con.error("ERROR in startTR: " + err);
            return '';
        }
    };

    caap.endTR = "</div>";

    caap.makeTD = function (text, indent, right, css) {
        try {
			//caap.configsExport += text + ',';
		
            css = css ? " style='" + css + "'" : '';
            var cls = " class='caap_ff caap_fn" + (indent ? " caap_in" : '') + (right ? " caap_tr" : '') + "'";
            return "<div" + cls + css + ">" + text + "</div>";
        } catch (err) {
            con.error("ERROR in makeTD: " + err);
            return '';
        }
    };

    caap.makeSlider = function (text, id, inst, defaultValue, indent) {
        try {
            var value = config.getItem(id, 'defaultValue'),
                html = "<div class='caap_ff caap_fn caap_ww' id='caap_" + id + "'>";

            value = value !== 'defaultValue' ? value : config.setItem(id, $u.setContent(defaultValue, 1));
            html += '<div style="width: ' + (indent ? "42%;padding-left: 5%;" : "47%") + ';display: inline-block;">' + text + '</div>';
            html += "<div style='width: 45%;padding-right: 5%;display: inline-block;' id='caap_" + id + "_slider' title='" + inst.escapeHTML() + "'></div>";
            html += "</div>";

            return html;
        } catch (err) {
            con.error("ERROR in makeTD: " + err);
            return '';
        }
    };

    caap.makeSliderListener = function (id, min, max, step, defaultValue, opacity, slice) {
        function caapslide (event, ui) {
            // no idea why but the slider fails if the following is included
            //con.log(1, "slide event", event);

            if (opacity) {
                state.setItem(id.replace("Cust", ''), config.setItem(id, ui.value));
                caap.colorUpdate();
            } else {
                config.setItem(id, ui.value);
            }
        }

        try {
            $j("#caap_" + id + "_slider", $u.setContent(slice, caap.caapDivObject)).slider({
                orientation: "horizontal",
                range: "min",
                min: min,
                max: max,
                step: step,
                value: config.getItem(id, defaultValue),
                slide: caapslide
            });

            return true;
        } catch (err) {
            con.error("ERROR in makeTD: " + err);
            return false;
        }
    };

    caap.makeCheckBox = function (idName, defaultValue, instructions, css) {
        try {
            var id = idName ? " id='caap_" + idName + "'" : '',
                title = instructions ? " title='" + instructions.escapeHTML() + "'" : '',
                check = config.getItem(idName, 'defaultValue');

            check = check !== 'defaultValue' ? check : config.setItem(idName, $u.setContent(defaultValue, false));
            check = check ? " checked" : '';
            css = css ? " style='" + css + "'" : '';
            return "<input class='caap_ff caap_fn' type='checkbox'" + id + css + title + check + ' />';
        } catch (err) {
            con.error("ERROR in makeCheckBox: " + err);
            return '';
        }
    };

    caap.makeNumberForm = function (idName, instructions, initDefault, formatParms, subtype, css) {
        try {
            subtype = $u.setContent(subtype, 'number');
            css = $u.setContent(css, '');
            var value = config.getItem(idName, 'defaultValue'),
                stNum = subtype === 'number',
                id = idName ? " id='caap_" + idName + "'" : '',
                title = instructions ? " title='" + instructions.escapeHTML() + "'" : '',
                type = stNum ? " type='text' min='0' step='1'" : " type='text'";

            css += subtype === 'color' ? 'background-color:' + value + '; color:' + $u.bestTextColor(value) + ';' : '';
            css = css ? " style='" + css + "'" : '';
            subtype = subtype ? " data-subtype='" + subtype + "'" : '';
            initDefault = stNum && $u.isNumber(initDefault) ? initDefault : (stNum && $u.hasContent(initDefault) && $u.isString(initDefault) && !$u.isNaN(initDefault) ? initDefault.parseFloat() : (!stNum && $u.isString(initDefault) ? initDefault : ''));
            if (stNum && $u.hasContent(initDefault) && $u.isNaN(initDefault)) {
                con.warn("makeNumberForm - default value is not a number!", idName, initDefault);
            }

            value = value !== 'defaultValue' ? value : config.setItem(idName, initDefault);
            formatParms = $u.setContent(formatParms, '');
            return "<input class='caap_ff caap_fs caap_tr caap_ww'" + type + subtype + id + css + formatParms + title + " value='" + value + "' />";
        } catch (err) {
            con.error("ERROR in makeNumberForm: " + err);
            return '';
        }
    };

    caap.makeCheckTR = function (text, idName, defaultValue, instructions, indent, right, css, id1, css1) {
        try {
            var htmlCode = '';

            htmlCode += caap.startTR(id1 ? idName + id1 : idName + "_row", css1);
            htmlCode += caap.makeTD(text, indent, right, "width: " + (indent ? 85 : 90) + "%; display: inline-block;");
            htmlCode += caap.makeTD(caap.makeCheckBox(idName, defaultValue, instructions, css), false, true, "width: 10%; display: inline-block;");
            htmlCode += caap.endTR;
			
			caap.configsExport += [idName, text, defaultValue].join(',') + '\n';

            return htmlCode;
        } catch (err) {
            con.error("ERROR in makeCheckTR: " + err);
            return '';
        }
    };

    caap.makeNumberFormTR = function (text, idName, instructions, initDefault, formatParms, subtype, indent, right, width) {
        try {
            indent = $u.setContent(indent, false);
            right = $u.setContent(right, false);
            width = $u.setContent(width, 30);
            var htmlCode = '';

            htmlCode += caap.startTR();
            htmlCode += caap.makeTD(text, indent, right, "width: " + (indent ? 92 - width : 97 - width) + "%; display: inline-block;");
            htmlCode += caap.makeTD(caap.makeNumberForm(idName, instructions, initDefault, formatParms, subtype, ''), false, true, "width: " + width + "%; display: inline-block;");
            htmlCode += caap.endTR;

			caap.configsExport += [idName, text, initDefault].join(',') + '\n';

            return htmlCode;
        } catch (err) {
            con.error("ERROR in makeNumberFormTR: " + err);
            return '';
        }
    };

    caap.makeDropDownTR = function (text, idName, dropDownList, instructions, formatParms, defaultValue, indent, right, width, css, id1, css1) {
        try {
            var htmlCode = '';
			
			caap.configsExport += [idName, text, defaultValue].join(',') + '\n';

            htmlCode += caap.startTR(id1 ? idName + id1 : idName + "_row", css1);
            htmlCode += caap.makeTD(text, indent, right, "width: " + (indent ? 95 - width : 100 - width) + "%; display: inline-block;");
            htmlCode += caap.makeTD(caap.makeDropDown(idName, dropDownList, instructions, formatParms, defaultValue, css), false, true, "width: " + width + "%; display: inline-block;");
            htmlCode += caap.endTR;
            return htmlCode;
        } catch (err) {
            con.error("ERROR in makeDropDownTR: " + err);
            return '';
        }
    };

    caap.setDisplay = function (area, idName, display, quiet) {
        try {
            if (!$u.hasContent(idName)) {
                con.warn("idName", idName);
                throw "Bad idName!";
            }

            var areaDiv = caap[area],
                areatest = area,
				attr = 'id';
				
			if ($u.isObject(idName)) {
				attr = Object.keys(idName).pop();
				idName = idName[attr];
			}

            if (!$u.hasContent(areaDiv)) {
                areatest = "default";
                areaDiv = $j(document.body);
                con.warn("Unknown area. Using document.body", area);
            }

            con.log(2, "Change: display of 'caap_" + idName + "' to '" + (display === true ? 'block' : 'none') + "'", areatest);
			areaDiv = $j('div[' + attr + '="caap_' + idName + '"]', areaDiv);
            if (!$u.hasContent(areaDiv) && !quiet) {
                con.warn("Unable to find idName in area!", idName, area);
				return false;
            }
            areaDiv.each( function() {
				$j(this).css('display', display === true ? 'block' : 'none');
			});

            return true;
        } catch (err) {
            con.error("ERROR in setDisplay: " + err.stack);
            return false;
        }
    };

    caap.setDisplayById = function (idName) {
        try {
			$j("div[id^='caap_displayIf__" + idName + "__is']").each( function() {
				var id = $j(this).attr('id'),					
					arr = id.regex(/caap_displayIf__(\w+)__(is|isnot)__(\w+)/);
				if (arr) {
					caap.setDisplay('', id.replace('caap_',''), (config.getItem(arr[0], false).toString() == arr[2].replace(/_/g,' ')) == (arr[1] == 'is'));
				} else {
					con.warn('caap.dropBoxListener: Unable to parse setting change for id ' + id);
				}
			});

            return true;
        } catch (err) {
            con.error("ERROR in setDisplayById: " + err.stack);
            return false;
        }
    };

	caap.display = {};
	
	// If config setting for idName is the same as test, display
	// If display not defined, default is to display
	// If test not defined, default is true
    caap.display.start = function (idName, display, test) {
        try {
            var value = config.getItem(idName, 'Never').toString(),
				result,
				id,
				css;
			
			if (idName.regex(/(\W)/)) {
				con.warn('Config idName "' + idName + '" has a non-word character in it. Please remove');
			}
			
			display = $u.setContent(display, 'is') && display != 'isnot';
			test = $u.setContent(test, true).toString();
			result = display == (value == test),
			id = " id='caap_displayIf__" + idName + (display ? '__is__' : '__isnot__') + test.replace(/ /g,'_') + "'",
			css = " style='display: " + (result ? 'block' : 'none') + ";'";
			
            return "<div class='caap_ff caap_fn caap_ww'" + id + css + ">";
        } catch (err) {
            con.error("ERROR in caap.display.start: " + err);
            return '';
        }
    };

    caap.display.end = function () {
        return "</div>";
    };

    caap.startToggle = function (controlId, staticText) {
        try {
            var currentDisplay = state.getItem('Control_' + controlId, "none"),
                displayChar = currentDisplay === "none" ? "+" : "-",
                style = "font-family: 'lucida grande', tahoma, verdana, arial, sans-serif; font-size: 11px;",
                toggleCode = '';
				
			caap.configsExport += [staticText].join(',') + '\n';

            toggleCode += '<a style=\"font-weight: bold;' + style + '\" id="caap_Switch_' + controlId + '" href="javascript:;" style="text-decoration: none;"> ';
            toggleCode += displayChar + ' ' + staticText + '</a><br />' + "<div id='caap_" + controlId + "' style='display: " + currentDisplay + ";'>";
            return toggleCode;
        } catch (err) {
            con.error("ERROR in startToggle: " + err);
            return '';
        }
    };

    caap.endToggle = "<hr /></div>";

    caap.makeTextBox = function (idName, instructions, initDefault) {
        try {
			initDefault = $u.setContent(initDefault, '');

			caap.configsExport += [idName, '', initDefault].join(',') + '\n';
             var style = "font-family: 'lucida grande', tahoma, verdana, arial, sans-serif; font-size: 11px;",
                value = config.getItem(idName, 'defaultValue');

            value = value === 'defaultValue' ? config.setItem(idName, initDefault) : value;
            return "<textarea style=\"" + style + "\" title=" + '"' + instructions.escapeHTML() + '"' + " type='text' id='caap_" + idName + "' " + ($u.is_chrome ? " rows='3' cols='25'" : " rows='3' cols='21'") + ">" + value + "</textarea>";
        } catch (err) {
            con.error("ERROR in makeTextBox: " + err);
            return '';
        }
    };

    caap.setDivContent = function (idName, mess, slice, hide, conLevel) {
        try {
            if (/_mess$/.test(idName)) {
                if (caap.messDivs[idName] !== mess) {
                    caap.messDivs[idName] = mess;
                    con.log(4, "setDivContent", idName, mess);
                } else {
                    return;
                }
            }

            if (caap.domain.which === 3) {
                caap.messaging.setDivContent(idName, mess, hide);
            } else {
                if (config.getItem('SetTitle', false) && idName === "activity_mess") {
                    var DocumentTitle = config.getItem('SetTitleAction', false) ? mess.replace("Activity: ", '') + " - " : '';
                    DocumentTitle += config.getItem('SetTitleName', false) ? stats.PlayerName + " - " : '';
                    document.title = DocumentTitle + caap.documentTitle;
                }

                $j('#caap_' + idName, $u.setContent(slice, caap.caapDivObject)).html(mess).css('display', hide ? 'none' : 'block');
            }
			if ($u.isNumber(conLevel)) {
				con.log(conLevel, idName + ' ' + mess);
			}
        } catch (err) {
            con.error("ERROR in setDivContent: " + err);
        }
    };

}());
