/////////////////////////////////////////////////////////////////////
//                          ALCHEMY
/////////////////////////////////////////////////////////////////////

/*-------------------------------------------------------------------------------------\
AutoAlchemy perform aclchemy combines for all recipes that do not have missing
ingredients.  By default, it also will not combine Battle Hearts.
First we make sure the option is set and that we haven't been here for a while.
\-------------------------------------------------------------------------------------*/
caap.autoAlchemy = function() {
	try {
		if(!config.getItem('AutoAlchemy', false)) {
			return false;
		}

		if(!schedule.check('AlchemyTimer')) {
			return false;
		}
		/*-------------------------------------------------------------------------------------\
		 Now we navigate to the Alchemy Recipe page.
		 \-------------------------------------------------------------------------------------*/
		if(!caap.navigateTo('keep,alchemy', 'tab_alchemy_on.gif')) {
			var button = {}, recipeDiv = $j(), ssDiv = $j(), clicked = false;
			recipeDiv = $j("#" + caap.domain.id[caap.domain.which] + "recipe_list");
			if(recipeDiv && recipeDiv.length) {
				if(recipeDiv.attr("class") !== 'show_items') {
					button = recipeDiv.find("div[id*='alchemy_item_tab']");
					if(button && button.length) {
						caap.click(button);
						return true;
					} else {
						con.warn('Cant find item tab', recipeDiv);
						return false;
					}
				}
			} else {
				con.warn('Cant find recipe list');
				return false;
			}
			/*-------------------------------------------------------------------------------------\
			 We close the results of our combines so they don't hog up our screen
			 \-------------------------------------------------------------------------------------*/
			button = caap.checkForImage('help_close_x.gif');
			if($u.hasContent(button)) {
				caap.click(button);
				return true;
			}
			/*-------------------------------------------------------------------------------------\
			 Now we get all of the recipes and step through them one by one
			 \-------------------------------------------------------------------------------------*/
			ssDiv = $j("div[class='alchemyRecipeBack']");
			if(!ssDiv || !ssDiv.length) {
				con.log(2, 'No recipes found');
			}

			ssDiv.each(function() {
				recipeDiv = $j(this);
				/*-------------------------------------------------------------------------------------\
				 If we are missing an ingredient then skip it
				 \-------------------------------------------------------------------------------------*/
				if(recipeDiv.find("div[class*='missing']").length) {
					con.log(2, 'Skipping Recipe');
					return true;
				}
				/*-------------------------------------------------------------------------------------\
				 If we are skipping battle hearts then skip it
				 \-------------------------------------------------------------------------------------*/
				if(caap.hasImage('raid_hearts', recipeDiv) && !config.getItem('AutoAlchemyHearts', false)) {
					con.log(2, 'Skipping Hearts');
					return true;
				}
				/*-------------------------------------------------------------------------------------\
				 Find our button and click it
				 \-------------------------------------------------------------------------------------*/
				button = recipeDiv.find("input[type='image']");
				if(button && button.length) {
					clicked = true;
					caap.click(button);
					con.log(2, 'Clicked A Recipe', recipeDiv.find("img").attr("title"));
					return false;
				} else {
					con.warn('Cant Find Item Image Button');
				}

				return true;
			});
			if(clicked) {
				return true;
			}
			/*-------------------------------------------------------------------------------------\
			 All done. Set the timer to check back in 3 hours.
			 \-------------------------------------------------------------------------------------*/
			schedule.setItem('AlchemyTimer', 10800, 300);
			return false;
		}

		return true;
	} catch (err) {
		con.error("ERROR in autoAlchemy: " + err);
		return false;
	}
};
