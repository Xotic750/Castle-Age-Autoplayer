/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

(function () {
    "use strict";

	worker.add('chores');
	
	chores.checkResults = function(page) {
		try {
			var pagesHeaders = worker.pagesList.flatten('page'),
				url = 'ajax:' + session.getItem('clickUrl', 'none');
				
			if (pagesHeaders.hasIndexOf(page)) {
				schedule.setItem('page_' + page, Date.now());
			}
			if (pagesHeaders.hasIndexOf(url)) {
				schedule.setItem('page_' + url, Date.now());
			}
        } catch (err) {
            con.error("ERROR in chores.checkResults: " + err.stack);
            return false;
        }
    };
	
/////////////////////////////////////////////////////////////////////
//                          HEAL
/////////////////////////////////////////////////////////////////////

	worker.addAction({fName : 'chores.heal', priority : 850, description : 'Healing'});
	
    chores.heal = function () {
        try {
            var minToHeal = 0,
                minStamToHeal = 0,
                battleHealth = 0,
                conquesthealth = 0,
                highest = 0;

            caap.setDivContent('heal_mess', '');
            minToHeal = config.getItem('MinToHeal', 0);
            if (minToHeal === "" || minToHeal < 0 || !$u.isNumber(minToHeal)) {
                return false;
            }
            minStamToHeal = config.getItem('MinStamToHeal', 0);
            if (minStamToHeal === "" || minStamToHeal < 0 || !$u.isNumber(minStamToHeal)) {
                minStamToHeal = 0;
            }

            if (!stats.health || $j.isEmptyObject(stats.health)) {
                return false;
            }

            if (!stats.stamina || $j.isEmptyObject(stats.stamina)) {
                return false;
            }

            if ((config.getItem('WhenBattle', 'Never') !== 'Never') || (config.getItem('WhenMonster', 'Never') !== 'Never') || (config.getItem('WhenMonster', 'Never') !== 'Never')) {
                battleHealth = (config.getItem('WhenBattle', 'Never') !== 'Never' && config.getItem('waitSafeHealth', false) ? 13 : 10);
                conquesthealth = (config.getItem('WhenConquest', 'Never') !== 'Never' && config.getItem('ConquestWaitSafeHealth', false) ? 13 : 10);
                highest = battleHealth >= conquesthealth ? battleHealth : conquesthealth;
                if ((caap.inLevelUpMode() || stats.stamina.num >= stats.stamina.max) && stats.health.num < highest) {
                    con.log(1, 'Heal');
                    return caap.navigateTo('keep,keep_healbtn.gif');
                }
            }

            if (stats.health.num >= stats.health.max || stats.health.num >= minToHeal) {
                return false;
            }

            if (stats.stamina.num < minStamToHeal) {
                caap.setDivContent('heal_mess', 'Waiting for stamina to heal: ' + stats.stamina.num + '/' + minStamToHeal);
                return false;
            }

            con.log(1, 'Heal');
            return caap.navigateTo('keep,keep_healbtn.gif');
        } catch (err) {
            con.error("ERROR in chores.heal: " + err.stack);
            return false;
        }
    };

    /*-------------------------------------------------------------------------------------\
    AutoAlchemy perform alchemy combines for all recipes that do not have missing
    ingredients.  By default, it also will not combine Battle Hearts.
    First we make sure the option is set and that we haven't been here for a while.
    \-------------------------------------------------------------------------------------*/
	worker.addAction({fName : 'chores.alchemy', priority : -700, description : 'Doing Alchemy'});
	
    chores.alchemy = function () {
        try {
            if (!config.getItem('AutoAlchemy', false)) {
                return false;
            }

            if (!schedule.check('AlchemyTimer')) {
                return false;
            }

            /*-------------------------------------------------------------------------------------\
			Now we navigate to the Alchemy Recipe page.
			\-------------------------------------------------------------------------------------*/
            if (!caap.navigateTo('keep,alchemy', 'alchfb_btn_alchemies_on.gif')) {
                var button1 = {},
					ssDiv = $j(),
                    clicked = false;

                /*-------------------------------------------------------------------------------------\
				We close the results of our combines so they don't hog up our screen
				\-------------------------------------------------------------------------------------*/
                 if (caap.ifClick('help_close_x.gif')) {
                    return true;
                }

                /*-------------------------------------------------------------------------------------\
				Now we get all of the recipes and step through them one by one
				\-------------------------------------------------------------------------------------*/
                ssDiv = $j("div[id*='recipe']");
                if (!ssDiv || !ssDiv.length) {
                    con.log(3, 'No recipes found');
                }

                ssDiv.each(function () {
                    var button2 = {},
						recipeDiv = $j(this);

                    con.log(3, 'If we are missing an ingredient then skip it');

                    /*-------------------------------------------------------------------------------------\
					If we are missing an ingredient then skip it
					\-------------------------------------------------------------------------------------*/
                    button2 = recipeDiv.find("img[src*='alchfb_createoff.gif']");
                    if (button2 && button2.length) {
                        con.log(2, 'Skipping Recipe');

						recipeDiv = null;
						button2 = null;
                        return true;
                    }

                    con.log(3, 'If we are crafting map of atlantis then skip it');

                    /*-------------------------------------------------------------------------------------\
					If we are crafting map of atlantis then skip it
					\-------------------------------------------------------------------------------------*/
                    button2 = recipeDiv.find("img[src*='seamonster_map_finished.jpg']");
                    if (button2 && button2.length) {
                        con.log(2, 'Skipping map of atlantis Recipe');

						recipeDiv = null;
						button2 = null;
                        return true;
                    }

                    con.log(3, 'If we are skipping battle hearts then skip it');

                    /*-------------------------------------------------------------------------------------\
					If we are skipping battle hearts then skip it
					\-------------------------------------------------------------------------------------*/

                    if (caap.hasImage('raid_hearts', recipeDiv) && !config.getItem('AutoAlchemyHearts', false)) {
                        con.log(2, 'Skipping Hearts');

						recipeDiv = null;
						button2 = null;
                        return true;
                    }

                    con.log(3, 'Find our button and click it');

                    /*-------------------------------------------------------------------------------------\
					Find our button and click it
					\-------------------------------------------------------------------------------------*/
                    button2 = recipeDiv.find("input[type='image']");
                    if (button2 && button2.length) {
                        caap.click(button2);
                        con.log(2, 'Clicked A Recipe', recipeDiv.find("div[style='padding-top:5px;']"));
                        clicked = true;

						recipeDiv = null;
						button2 = null;
                        return false;
                    }

                    con.warn('Cant Find Item Image Button');

					recipeDiv = null;
					button2 = null;
                    return true;
                });

                con.log(3, 'End each recipe');

                if (clicked) {
                    return true;
                }

                /*-------------------------------------------------------------------------------------\
				All done. Set the timer to check back in 3 hours.
				\-------------------------------------------------------------------------------------*/
                schedule.setItem('AlchemyTimer', 10800, 300);

				button1 = null;
				ssDiv = null;
                return false;
            }

            return true;
        } catch (err) {
            con.error("ERROR in chores.alchemy: " + err.stack);
            return false;
        }
    };

	worker.addAction({fName: 'chores.income', priority : 2000, description : 'Awaiting Income'});

	chores.income = function () {
        try {
            if (config.getItem("disAutoIncome", false) || (config.getItem("NoIncomeAfterLvl", true) && state.getItem('KeepLevelUpGeneral', false))) {
                return false;
            }

            if ($u.hasContent(stats.gold.ticker) && stats.gold.ticker[0] < 1
				&& config.getItem('IncomeGeneral', 'Use Current') !== 'Use Current') {
                general.Select('IncomeGeneral');
                return true;
            }

            return false;
        } catch (err) {
            con.error("ERROR in chores.income: " + err.stack);
            return false;
        }
    };

/////////////////////////////////////////////////////////////////////
//                          BANKING
//                       Keep it safe!
/////////////////////////////////////////////////////////////////////

 	worker.addAction({fName : 'chores.immediateBanking', priority : 1500, description : 'Banking Immediately'});

   chores.immediateBanking = function () {
        if (!config.getItem("BankImmed", false)) {
            return false;
        }

        return caap.bank();
    };

 	worker.addAction({fName : 'chores.bank', priority : 400, description : 'Banking'});

    chores.bank = function () {
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
            if (!maxInCash || maxInCash < 0 || stats.gold.cash <= minInCash || stats.gold.cash < maxInCash || stats.gold.cash < 10) {

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

            deposit = stats.gold.cash - minInCash;
            numberInput.attr("value", deposit);
            con.log(1, 'Depositing into bank:', deposit);
            caap.click(depositButton);

			depositButton = null;
			numberInput = null;
            return true;
        } catch (err) {
            con.error("ERROR in Bank: " + err.stack);
            return false;
        }
    };

    chores.retrieveFromBank = function (num) {
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
            if (!(minInStore || minInStore <= stats.gold.bank - num)) {
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
            con.error("ERROR in retrieveFromBank: " + err.stack);
            return false;
        }
    };

 	worker.addAction({fName : 'chores.checkPages', priority : -1200, description : 'Reviewing Pages'});
	
	worker.addPageCheck({page : 'oracle'});

	worker.addPageCheck({page : 'battlerank', path : 'battle,battlerank', level : 8});

	worker.addPageCheck({page : 'war_rank', path : 'battle,war_rank', level : 100});

	worker.addPageCheck({page : 'conquest_battlerank', level : 80});

	worker.addPageCheck({page : 'conquest_duel'});

	worker.addPageCheck({page : 'achievements'});

	worker.addPageCheck({page : 'symbolquests', path : 'quests,symbolquests', level : 8});

	worker.addPageCheck({page : 'view_class_progress', path : 'player_monster_list,view_class_progress', level : 100});

	worker.addPageCheck({page : 'gift', hours : 3, path : 'army,gift'});

	worker.addPageCheck({page : 'keep', hours : 1});

    chores.checkPages = function(page, value) {
        try {
			var list = $u.isDefined(value) ? worker.pagesList.filterByField(page, value) 
				: $u.isString(page) ? [{page : page}] : worker.pagesList,
				hours = 0;
			return list.some( function(o) {
				if (o.config && !config.getItem(o.config, false)) {
					return false;
				}
				hours = o.cFreq ? config.getItem(o.cFreq, 60) / 60 : $u.setContent(o.hours, 24);
				if (schedule.since('page_' + o.page, hours * 3600) && (!$u.hasContent(o.level) || stats.level >= o.level)
					&& config.getItem($u.setContent(o.config, 'NoNe'), true)) {
					con.log(2, 'Reviewing ' + o.page, o);
					var result = caap.navigateTo($u.setContent(o.path, o.page));
					if (result == 'fail') {
						con.warn('Chores: Unable to check page ' + o.page + '. Waiting to retry', o);
						schedule.setItem('page_' + page, Date.now());
					}
					return result;
				}
			});
        } catch (err) {
            con.error("ERROR in chores.checkPages: " + err.stack);
            return false;
        }
    };

}());
