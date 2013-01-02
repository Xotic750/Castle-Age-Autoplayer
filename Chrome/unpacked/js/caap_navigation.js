/////////////////////////////////////////////////////////////////////
//                          NAVIGATION FUNCTIONS
/////////////////////////////////////////////////////////////////////

caap.waitTime = 5000;

caap.visitUrl = function(url, loadWaitTime) {
	try {
		if(config.getItem('bookmarkMode', false)) {
			return true;
		}

		if(!$u.hasContent(url)) {
			throw 'No url passed to visitUrl';
		}

		caap.waitMilliSecs = $u.setContent(loadWaitTime, caap.waitTime);
		caap.setDomWaiting(url);
		if(caap.domain.inIframe) {
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
caap.click = function(obj, loadWaitTime) {
	try {
		if(!$u.hasContent(obj)) {
			throw 'Null object passed to Click';
		}

		caap.waitMilliSecs = $u.setContent(loadWaitTime, caap.waitTime);
		caap.setDomWaiting();
		var evt = document.createEvent("MouseEvents");
		evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		/*
		 Return Value: boolean
		 The return value of dispatchEvent indicates whether any of the listeners
		 which handled the event called preventDefault. If preventDefault was called
		 the value is false, else the value is true.
		 */
		return !(obj.jquery ? obj.get(0) : obj).dispatchEvent(evt);
	} catch (err) {
		con.error("ERROR in caap.click: " + err);
		return undefined;
	}
};
caap.clickAjaxLinkSend = function(link, loadWaitTime) {
	try {
		if(!$u.hasContent(link)) {
			throw 'No link passed to clickAjaxLinkSend';
		}

		caap.waitMilliSecs = $u.setContent(loadWaitTime, caap.waitTime);
		caap.setDomWaiting(link);
		window.location.href = caap.jss + ":void(" + caap.domain.ajax[caap.domain.which] + "ajaxLinkSend('globalContainer', '" + link + "'))";
		return true;
	} catch (err) {
		con.error("ERROR in caap.clickAjaxLinkSend: " + err);
		return false;
	}
};
caap.clickGetCachedAjax = function(link, loadWaitTime) {
	try {
		if(!$u.hasContent(link)) {
			throw 'No link passed to clickGetCachedAjax';
		}

		caap.setDomWaiting(link);
		window.location.href = caap.jss + ":void(" + caap.domain.ajax[caap.domain.which] + "get_cached_ajax('" + link + "', 'get_body'))";
		return true;
	} catch (err) {
		con.error("ERROR in caap.clickGetCachedAjax: " + err);
		return false;
	}
};
caap.ajaxLoad = function(link, params, selector_dom, selector_load, result, loadWaitTime) {
	try {
		if(!$u.hasContent(link)) {
			throw 'No link passed to ajaxLoad';
		}

		if(!$u.hasContent(selector_dom)) {
			throw 'No selector_dom passed to ajaxLoad';
		}
		selector_load = $u.setContent(selector_load, "");
		caap.waitMilliSecs = $u.setContent(loadWaitTime, caap.waitTime);
		caap.setDomWaiting($u.setContent(result, link));
		caap.ajaxLoadIcon.css("display", "block");
		function onError(XMLHttpRequest, textStatus, errorThrown) {
			con.error("caap.ajaxLoad", textStatus);
		}

		function onSuccess(data, textStatus, XMLHttpRequest) {
			$j(selector_dom).html(selector_load === "" ? caap.tempAjax.html() : $j(selector_load, caap.tempAjax).html());
			caap.ajaxLoadIcon.css("display", "none");
			caap.reBind();
			caap.clearDomWaiting();
			caap.checkResults();
		}


		caap.ajax(link, params, onError, onSuccess);
		return true;
	} catch (err) {
		con.error("ERROR in caap.ajaxLoad: " + err);
		return false;
	}
};
caap.navigateTo = function(pathToPage, imageOnPage, webSlice) {
	try {
		webSlice = $u.setContent(webSlice, caap.globalContainer);
		/*if(!$u.hasContent(webSlice)) {
			con.warn('No content to Navigate to', imageOnPage, pathToPage);
			return false;
		}

		if($u.hasContent(imageOnPage) && caap.hasImage(imageOnPage, webSlice)) {
			con.log(3, 'Image found on page', imageOnPage);
			return false;
		}*/

		 if(!$u.hasContent(webSlice)) {
		        webSlice = $u.setContent(webSlice, $j('#globalcss', caap.globalContainer));
         		if(!$u.hasContent(webSlice)) {
            			con.warn('No content to Navigate to', imageOnPage, pathToPage);
            			return false;
         }
      }


		var pathList = $u.hasContent(pathToPage) ? pathToPage.split(",") : [], s = 0, jq = $j(), path = '';

		for( s = pathList.length - 1; s >= 0; s -= 1) {
			path = $u.setContent(pathList[s], '');
			if(!$u.hasContent(path)) {
				con.warn('pathList had no content!', pathList[s]);
				continue;
			}
			jq = $j("a[href*='" + path + ".php']", webSlice).not("a[href*='" + path + ".php?']", webSlice);
			if($u.hasContent(jq)) {
				con.log(2, 'Go to', path);
			} else {
				jq = caap.checkForImage(path.hasIndexOf(".") ? path : path + '.', webSlice);
				if($u.hasContent(jq)) {
					con.log(2, 'Click on image', jq.attr("src").basename());
				}
			}

			if($u.hasContent(jq)) {
				caap.click(jq);
				return true;
			} else {
				con.log(3, 'No anchor or image found', path);
			}
		}

		con.warn('Unable to Navigate to', imageOnPage, pathToPage);
		return false;
	} catch (err) {
		con.error("ERROR in caap.navigateTo: " + err, imageOnPage, pathToPage);
		return undefined;
	}
};
caap.checkForImage = function(image, webSlice, subDocument, nodeNum) {
	try {
		webSlice = $u.setContent(webSlice, $u.setContent(subDocument, window.document).body);
		return $j("input[src*='" + image + "'],img[src*='" + image + "'],div[style*='" + image + "']", webSlice).eq($u.setContent(nodeNum, 0));
	} catch (err) {
		con.error("ERROR in caap.checkForImage: " + err);
		return undefined;
	}
};
caap.hasImage = function(image, webSlice, subDocument, nodeNum) {
	try {
		return $u.hasContent(caap.checkForImage(image, webSlice, subDocument, nodeNum));
	} catch (err) {
		con.error("ERROR in caap.hasImage: " + err);
		return undefined;
	}
}; 
