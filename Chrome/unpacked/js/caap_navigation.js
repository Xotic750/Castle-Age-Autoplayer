/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                          NAVIGATION FUNCTIONS
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    caap.waitTime = 5000;

    caap.visitUrl = function (url, loadWaitTime) {
        try {
            /*
            if (config.getItem('bookmarkMode', false)) {
                return true;
            }
            */

            if (!$u.hasContent(url)) {
                throw 'No url passed to visitUrl';
            }

            caap.waitMilliSecs = $u.setContent(loadWaitTime, caap.waitTime);
            caap.setDomWaiting(url);
            if (caap.domain.inIframe) {
                caap.messaging.visitUrl(url);
            } else {
                window.location.href = url;
            }

            return true;
        } catch (err) {
            con.error("ERROR in caap.visitUrl: " + err);
            return false;
        }
    };

    caap.click = function (obj, loadWaitTime) {
        try {
            if (!$u.hasContent(obj)) {
                throw 'Null object passed to Click';
            }

            caap.waitMilliSecs = $u.setContent(loadWaitTime, caap.waitTime);
            caap.setDomWaiting();
            var evt = document.createEvent("MouseEvents"),
                bRet;

            evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            /*
            Return Value: boolean
            The return value of dispatchEvent indicates whether any of the listeners
            which handled the event called preventDefault. If preventDefault was called
            the value is false, else the value is true.
            */

            bRet = !(obj.jquery ? obj.get(0) : obj).dispatchEvent(evt);
            evt = null;

            return bRet;
        } catch (err) {
            con.error("ERROR in caap.click: " + err);
            return undefined;
        }
    };

    caap.clickAjaxLinkSend = function (link, loadWaitTime) {
        try {
            if (!$u.hasContent(link)) {
                throw 'No link passed to clickAjaxLinkSend';
            }

            caap.waitMilliSecs = $u.setContent(loadWaitTime, caap.waitTime);
            caap.setDomWaiting(link);
            window.location.href = caap.jss + ":void(ajaxLinkSend('globalContainer', '" + link + "'))";
            return true;
        } catch (err) {
            con.error("ERROR in caap.clickAjaxLinkSend: " + err);
            return false;
        }
    };

    caap.clickGetCachedAjax = function (link) {
        try {
            if (!$u.hasContent(link)) {
                throw 'No link passed to clickGetCachedAjax';
            }

            caap.setDomWaiting(link);
            window.location.href = caap.jss + ":void(get_cached_ajax('" + link + "', 'get_body'))";
            return true;
        } catch (err) {
            con.error("ERROR in caap.clickGetCachedAjax: " + err);
            return false;
        }
    };

    caap.ajaxLoad = function (link, params, selector_dom, selector_load, result, loadWaitTime) {
        function onError(XMLHttpRequest, textStatus, errorThrown) {
            con.error("caap.ajaxLoad", [XMLHttpRequest, textStatus, errorThrown]);
        }

        function onSuccess(data) {
            $j(selector_dom).html(selector_load === "" ? $j(data).html() : $j(selector_load, data).html());
            caap.ajaxLoadIcon.hide();
            caap.clearDomWaiting();
            caap.checkResults();
        }

        try {
            if (!$u.hasContent(link)) {
                throw 'No link passed to ajaxLoad';
            }

            if (!$u.hasContent(selector_dom)) {
                throw 'No selector_dom passed to ajaxLoad';
            }

            selector_load = $u.setContent(selector_load, "");
            caap.waitMilliSecs = $u.setContent(loadWaitTime, caap.waitTime);
            caap.setDomWaiting($u.setContent(result, link));
            caap.ajaxLoadIcon.css("display", "block");
            caap.ajax(link, params, onError, onSuccess);
            return true;
        } catch (err) {
            con.error("ERROR in caap.ajaxLoad: " + err);
            return false;
        }
    };
	
	// Enhanced Navigate function. Can navigate a full path with jquery elements and ajax and button clicks.
	// Path elements can use page names. Page signature image will be used automatically.
	// Other element links can only be used after last page name used.
	// Other elements can be ajax: for an ajax link
	// image: for a signature image name to check for before continuing to next step
	// clickimg: for an image to click
	
	// Return values are 'true' for moving along the path
	// 'done' when the last element in the path is clicked
	//	false when the last element is an image or PageList page and already on the page or unable to find
    caap.navigate2 = function (path) {
        try {
            var webslice = $j('#globalcss'),
				steps,
                s = 0,
				step = '',
				action = '',
				text = '',
				result = false,
                jq = $j(),
                step = '';

            if (!$u.isString(path)) {
                con.warn('Invalid path to navigate2', path);
                return false;
            }
            steps = path.split(",");

			// Start with page links to make sure on right page.
			// At this point, the pages must be defined in the caap.pageList
            for (s = steps.length - 1; s >= 0; s -= 1) {
                step = $u.setContent(steps[s], '');
                if (!$u.hasContent(step)) {
                    con.warn('steps had no content!', step, path, s);
                } else {
					if ($u.hasContent(caap.pageList[step])) {
						if ($u.hasContent(caap.pageList[step]) && session.getItem('page','none') == step) {
							if (s == steps.length - 1) {
								con.log(2,'Navigate2: Already on destination page', step, s, path, caap.pageList[step]);
								return false;
							} else {
								con.log(2,'Navigate2: Found signature pic for page', step, s, path, caap.pageList[step]);
								s += 1;
								break;
							}
						}
						jq = $j("a[href*='" + step + ".php']").not("a[href*='" + step + ".php?']", $j('#globalcss'));
						if ($u.hasContent(jq)) {
							con.log(2, 'Navigate2: Go to', jq, step, path, s);
							caap.click(jq);
							return true;
						}
						con.log(2,'Navigate2: Not on page' + step + ', so going back another step', path, s, caap.pageList[step]);
					}
                }
            }
            con.log(2, 'Navigate2: First pass search for sig pic passed', step, path, s);

            for (s = s; s < steps.length; s += 1) {
				// Look ahead to see if we have the checkpoint hit already
				step = $u.setContent(steps[s+1], '');
				action = step.replace(/:.*/,'');
				text = step.replace(/.*:/,'');

				// If the next step doesn't exist or isn't an image or that image is on the page, then do this step
				if (action =='image' && caap.hasImage(text, $j('#globalcss'))) {
					con.log(2, 'Navigate2 look ahead found image so skipping ', text, step, path, s);
				} else if (action =='jq' && $u.hasContent($j(text))) {
					con.log(2, 'Navigate2 look ahead found jquery so skipping ', text, step, path, s);
				} else {
					step = $u.setContent(steps[s], '');
					action = step.replace(/:.*/,'');
					text = step.replace(/.*:/,'');
					if (action =='ajax') {
						result = caap.clickAjaxLinkSend(text,2000);
						return s == steps.length - 1 ? 'done' : true;
					} else if (action =='image') {
						jq = caap.hasImage(text, $j('#globalcss'));
						// If the last step in the path, then we're done
						if (jq) {
							con.log(2,'Navigate2: already on destination page', step, s, path, caap.pageList[step]);
							return false;
						} else {
							con.log(2,'Navigate2: Passing by confirmation pic', step, s, path, caap.pageList[step]);
						}
					} else if (action =='clickimg') {
						jq = caap.checkForImage(text, $j('#globalcss'));
						// If the last step in the path, then we're done
						if ($u.hasContent(jq)) {
							con.log(2, 'Navigate2 image click', text, step, path, s);
							caap.click(jq);
							return s == steps.length - 1 ? 'done' : true;
						}
						con.warn('Navigate2: Unable to find image to click, fail?', step, path, s, action, text);
						return false;
					} else if (action =='clickjq') {
						jq = $j(text, '#globalcss');
						// If the last step in the path, then we're done
						if ($u.hasContent(jq)) {
							con.log(2, 'Navigate2 jq click', text, step, path, s);
							caap.click(jq);
							return s == steps.length - 1 ? 'done' : true;
						}
						con.warn('Navigate2: Unable to find image to click, fail?', step, path, s, action, text);
						return false;
					} else if (action =='image' || action == 'jq') {
						if (s == steps.length - 1) {
							con.log(2,'Navigate2: Path done',  step, path, s, action, text);
							return false;
						} else {
							con.log(2,'Navigate2: Skipping found checkpoint',  step, path, s, action, text);
						}
					} else {
						con.log(2, 'Navigate2: No instructions: understood', step, path, s, action, text);
					}
				}
            }

            con.warn('Navigate2: Unable to Navigate2', step, path, s);
            return false;
        } catch (err) {
            con.error("ERROR in caap.navigate2: " + err, path, step, s);
            return undefined;
        }
    };
	
    caap.navigateTo = function (pathToPage, imageOnPage, webSlice) {
        try {
            //webSlice = $u.setContent(webSlice, caap.globalContainer);
            var newwebSlice = $u.setContent(webSlice, $j('#globalcss')),
                pathList,
                s = 0,
                jq,
                path = '';


            if (!$u.hasContent(newwebSlice)) {
                con.warn('No content to Navigate to', imageOnPage, pathToPage);
                return false;
            }

            pathList = $u.hasContent(pathToPage) ? pathToPage.split(",") : [];

			if (!$u.hasContent(imageOnPage) && pathList[pathList.length - 1] && caap.pageList[pathList[pathList.length - 1]]) {
                con.log(5,'Using signature pic for web image', imageOnPage);
                imageOnPage = caap.pageList[pathList[pathList.length - 1]].signaturePic;
            }

            if ($u.hasContent(imageOnPage) && caap.hasImage(imageOnPage, newwebSlice)) {
                con.log(3, 'Image found on page', imageOnPage);
                return false;
            }

            jq = $j();

            for (s = pathList.length - 1; s >= 0; s -= 1) {
                path = $u.setContent(pathList[s], '');
                if (!$u.hasContent(path)) {
                    con.warn('pathList had no content!', pathToPage, imageOnPage, pathList[s]);
                } else {
					if (path.indexOf(':')>=0) {
						if (path.replace(/:.*/,'')=='ajax') {
							return caap.clickAjaxLinkSend(path.replace(/.*:/,''),2000);
						} else {
							con.warn(1,'Unknown caap.navigateTo parameter', path, pathList);
							return false;
						}
					}
                    jq = $j("a[href*='" + path + ".php']", newwebSlice).not("a[href*='" + path + ".php?']", newwebSlice);
                    if ($u.hasContent(jq)) {
                        con.log(2, 'Go to', path);
                    } else {
                        jq = caap.checkForImage(path.hasIndexOf(".") ? path : path + '.', newwebSlice);
                        if ($u.hasContent(jq)) {
                            con.log(2, 'Click on image', jq.attr("src").basename());
                        }
                    }

                    if ($u.hasContent(jq)) {
                        caap.click(jq);
                        return true;
                    }

                    con.log(3, 'No anchor or image found', path);
                }
            }

            con.warn('Unable to Navigate to', imageOnPage, pathToPage);

            newwebSlice = null;
            pathList = null;
            jq = null;

            return false;
        } catch (err) {
            con.error("ERROR in caap.navigateTo: " + err, imageOnPage, pathToPage);
            return undefined;
        }
    };

    caap.checkForImage = function (image, webSlice, subDocument, nodeNum) {
        try {
            webSlice = $u.setContent(webSlice, $u.setContent(subDocument, window.document).body);
            return $j("input[src*='" + image + "'],img[src*='" + image + "'],div[style*='" + image + "']", webSlice).eq($u.setContent(nodeNum, 0));
        } catch (err) {
            con.error("ERROR in caap.checkForImage: " + err);
            return undefined;
        }
    };

    caap.hasImage = function (image, webSlice, subDocument, nodeNum) {
        try {
            return $u.hasContent(caap.checkForImage(image, webSlice, subDocument, nodeNum));
        } catch (err) {
            con.error("ERROR in caap.hasImage: " + err);
            return undefined;
        }
    };

}());
