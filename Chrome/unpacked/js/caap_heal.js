/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                          HEAL
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    caap.heal = function () {
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

            if (!caap.stats.health || $j.isEmptyObject(caap.stats.health) || $j.isEmptyObject(caap.stats.healthT)) {
                return false;
            }

            if (!caap.stats.stamina || $j.isEmptyObject(caap.stats.stamina) || $j.isEmptyObject(caap.stats.staminaT)) {
                return false;
            }

            if ((config.getItem('WhenBattle', 'Never') !== 'Never') || (config.getItem('WhenMonster', 'Never') !== 'Never') || (config.getItem('WhenMonster', 'Never') !== 'Never')) {
                battleHealth = (config.getItem('WhenBattle', 'Never') !== 'Never' && config.getItem('waitSafeHealth', false) ? 13 : 10);
                conquesthealth = (config.getItem('WhenConquest', 'Never') !== 'Never' && config.getItem('ConquestWaitSafeHealth', false) ? 13 : 10);
                highest = battleHealth >= conquesthealth ? battleHealth : conquesthealth;
                if ((caap.inLevelUpMode() || caap.stats.stamina.num >= caap.stats.staminaT.max) && caap.stats.health.num < highest) {
                    con.log(1, 'Heal');
                    return caap.navigateTo('keep,keep_healbtn.gif');
                }
            }

            if (caap.stats.health.num >= caap.stats.healthT.max || caap.stats.health.num >= minToHeal) {
                return false;
            }

            if (caap.stats.stamina.num < minStamToHeal) {
                caap.setDivContent('heal_mess', 'Waiting for stamina to heal: ' + caap.stats.stamina.num + '/' + minStamToHeal);
                return false;
            }

            con.log(1, 'Heal');
            return caap.navigateTo('keep,keep_healbtn.gif');
        } catch (err) {
            con.error("ERROR in heal: " + err);
            return false;
        }
    };

}());
