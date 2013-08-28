/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                          BANKING
//                       Keep it safe!
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    caap.immediateBanking = function () {
        if (!config.getItem("BankImmed", false)) {
            return false;
        }

        return caap.bank();
    };

    caap.bank = function () {
        try {
            if (config.getItem("NoBankAfterLvl", true) && state.getItem('KeepLevelUpGeneral', false)) {
                return false;
            }

            var maxInCash = -1,
                minInCash = 0,
                depositButton = $j(),
                numberInput = $j(),
                deposit = 0;

            maxInCash = config.getItem('MaxInCash', -1);
            minInCash = config.getItem('MinInCash', 0);
            if (!maxInCash || maxInCash < 0 || caap.stats.gold.cash <= minInCash || caap.stats.gold.cash < maxInCash || caap.stats.gold.cash < 10) {

                depositButton = null;
                numberInput = null;
				return false;
            }

            if (general.Select('BankingGeneral')) {

                depositButton = null;
                numberInput = null;
                return true;
            }

            depositButton = $j("input[src*='btn_stash.gif']");
            if (!depositButton || !depositButton.length) {
                // Cannot find the link

                depositButton = null;
                numberInput = null;
                return caap.navigateTo('keep');
            }

            numberInput = $j("input[name='stash_gold']");
            if (!numberInput || !numberInput.length) {
                con.warn('Cannot find box to put in number for bank deposit.');

                depositButton = null;
                numberInput = null;
                return false;
            }

            deposit = caap.stats.gold.cash - minInCash;
            numberInput.attr("value", deposit);
            con.log(1, 'Depositing into bank:', deposit);
            caap.click(depositButton);

			depositButton = null;
			numberInput = null;
            return true;
        } catch (err) {
            con.error("ERROR in Bank: " + err);
            return false;
        }
    };

    caap.retrieveFromBank = function (num) {
        try {
            if (num <= 0) {
                return false;
            }

            var retrieveButton = $j(),
                numberInput = $j(),
                minInStore = 0;

            retrieveButton = $j("input[src*='keep_btn_retireve.gif']");
            if (!retrieveButton || !retrieveButton.length) {
                // Cannot find the link

				retrieveButton = null;
                numberInput = null;
                return caap.navigateTo('keep');
            }

            minInStore = config.getItem('minInStore', 0);
            if (!(minInStore || minInStore <= caap.stats.gold.bank - num)) {
				retrieveButton = null;
                numberInput = null;
                return false;
            }

            numberInput = $j("input[name='get_gold']");
            if (!numberInput || !numberInput.length) {
                con.warn('Cannot find box to put in number for bank retrieve.');
				retrieveButton = null;
                numberInput = null;
                return false;
            }

            numberInput.attr("value", num);
            con.log(1, 'Retrieving from bank:', num);
            state.setItem('storeRetrieve', '');
            caap.click(retrieveButton);

			retrieveButton = null;
			numberInput = null;
            return true;
        } catch (err) {
            con.error("ERROR in retrieveFromBank: " + err);
            return false;
        }
    };

}());
