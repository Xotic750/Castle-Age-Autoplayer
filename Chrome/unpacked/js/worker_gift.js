/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global $j,$u,caap,config,con,schedule,gift,state,gift,session */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          gift OBJECT
// this is the main object for dealing with Gifts
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

	worker.add({ name: 'gift', recordIndex: 'userId'});
	
    gift.record = function () {
        this.data ={
			'userId'	: 0,
			'name'		: '',
			'total'		: 0,
			'sent'		: 0
		};
    };

	gift.checkResults = function (page) {
		try {
			switch (page) {
			case 'gift':
				var invites = $j("#app_body b").text();
				if (!invites || !$u.isNumber(invites.parseInt()) || invites.parseInt() === 0) {
					con.log(1, 'Gift Add: No invites available', invites);
					schedule.setItem('giftsMaxed', 3 * 3600);
				}
				if (gift.sentObj && state.getItem('giftsAvail', 0) > invites) {
					gift.sentObj.total += 1;
					gift.setRecord(gift.sentObj);
				}
				state.setItem('giftsAvail', invites);
						
				break;
			default:
				break;
			}
			gift.sentObj = null;
		} catch (err) {
			con.error("ERROR in gift.checkResults: " + err.stack);
			return false;
		}
	};

	worker.addAction({worker : 'gift', priority : -2150, description : 'Gifting'});

    gift.init = function () {
        try {
			worker.addPageCheck({page : 'ajax:index.php?feed=allies&news_feed_accept=0', config: 'giftAccept', hours : 1});
        } catch (err) {
            con.error("ERROR in gift.loadTemp: " + err.stack);
            return false;
        }
    };
	
	gift.worker = function () {
        try {
			var giftCodes = config.getItem('giftCodes', '').regex(/([\d:]+)/g),
				num = 0,
				result;
			
			if (!giftCodes) {
				return {action: false, mess: ''};
			}

			if (!schedule.check('giftsMaxed')) {
				return {action: false, mess: 'No gifts left, check again: ' + $u.setContent(caap.displayTime('giftsMaxed'), "Unknown")};
			}

			result = giftCodes.some( function(g) {
				gift.sentObj = gift.getRecord(g.toString().regex(/(\d+)/));
				num = $u.setContent(g.toString().regex(/:(\d+)/), 2000 + Math.floor(Math.random() * 52 + 1));
				return schedule.since(gift.sentObj.sent, 60 * 60);
			});
			if (result) {
				caap.clickAjaxLinkSend('gift.php?selected_army%5B%5D=' + gift.sentObj.userId + '&action=send_non_facebook_gift&giftSelection='  + num + '&ajax=1');
				gift.sentObj.sent = Date.now();
				gift.setRecord(gift.sentObj);
				return {mlog: 'Sent gift ' + num + ' to FB ID ' +  gift.sentObj.userId};
			}
			return {action: false, mess: 'Gifts sent to all recipients within an hour'};
			
        } catch (err) {
            con.error("ERROR in gift.add: " + err.stack);
            return false;
        }
    };
	
    gift.menu = function () {
        try {
            var acceptInst = 'Accept all gifts hourly.',
                giftFBIDListInst = 'A list of FB IDs, separated by commas or any non-alphabetic characters to send hourly gifts to. Use ":2014" etc. to specify a specific gifts. Otherwise gift will be random.',
                htmlCode = '';

            htmlCode += caap.startToggle('Gift', 'GIFTING OPTIONS');
            htmlCode += caap.makeCheckTR('Accept Gifts', 'giftAccept', false, acceptInst);
            htmlCode += caap.makeTD("Send gifts to:");
            htmlCode += caap.makeTextBox('giftCodes', giftFBIDListInst, '', '');
            htmlCode += caap.endToggle;
            return htmlCode;
        } catch (err) {
            con.error("ERROR in gift.menu: " + err.stack);
            return '';
        }
    };

}());
