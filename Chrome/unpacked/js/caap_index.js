/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                              INDEX
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    caap.checkResults_index = function () {
        /*
        function news() {
            try {
                if ($u.hasContent($j("#caap_news", caap.globalContainer))) {
                    return true;
                }

                var xp = 0,
                    bp = 0,
                    wp = 0,
                    cp = 0,
                    win = 0,
                    lose = 0,
                    deaths = 0,
                    cash = 0,
                    i = '',
                    list = [],
                    user = {}, tStr = '',
                    $b = null,
                    $c = null;
                $b = $j('#battleUpdateBox');
                if ($b && $b.length) {
                    $c = $j('.alertsContainer', $b);
                    $j('.alert_content', $c).each(function (i, el) {
                        var uid = 0,
                            txt = '',
                            my_xp = 0,
                            my_bp = 0,
                            my_wp = 0,
                            my_cp = 0,
                            my_cash = 0,
                            $a = $j('a', el).eq(0);
                        txt = $j(el).text().replace(/,/g, '');
                        if (txt.regex(/You were killed/i)) {
                            deaths += 1;
                        } else {
                            tStr = $a.attr('href');
                            uid = tStr.regex(/user=(\d+)/);
                            user[uid] = user[uid] || {
                                name: $a.text(),
                                win: 0,
                                lose: 0
                            };
                            my_xp = txt.regex(/(\d+) experience/i);
                            my_bp = txt.regex(/(\d+) Battle Points!/i);
                            my_wp = txt.regex(/(\d+) War Points!/i);
                            my_cp = txt.regex(/(\d+) Champion Points!/i);
                            my_cash = txt.regex(/\$(\d+)/i);
                            if (txt.regex(/Victory!/i)) {
                                win += 1;
                                user[uid].lose += 1;
                                xp += my_xp;
                                bp += my_bp;
                                wp += my_wp;
                                cp += my_cp;
                                cash += my_cash;
                            } else {
                                lose += 1;
                                user[uid].win += 1;
                                xp -= my_xp;
                                bp -= my_bp;
                                wp -= my_wp;
                                cp -= my_cp;
                                cash -= my_cash;
                            }
                        }
                    });
                    if (win || lose) {
                        list.push('You were challenged <strong>' + (win + lose) + '</strong> times,<br>winning <strong>' + win + '</strong> and losing <strong>' + lose + '</strong>.');
                        list.push('You ' + (xp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + Math.abs(xp).addCommas() + '</span> experience points.');
                        list.push('You ' + (cash >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + '<b class="gold">$' + Math.abs(cash).addCommas() + '</b></span>.');
                        list.push('You ' + (bp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + Math.abs(bp).addCommas() + '</span> Battle Points.');
                        list.push('You ' + (wp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + Math.abs(wp).addCommas() + '</span> War Points.');
                        list.push('You ' + (cp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + Math.abs(cp).addCommas() + '</span> Champion Points.');
                        list.push('');
                        user = $u.sortObjectBy(user, function (a, b) {
                            return (user[b].win + (user[b].lose / 100)) - (user[a].win + (user[a].lose / 100));
                        });
                        for (i in user) {
                            if (user.hasOwnProperty(i)) {
                                list.push('<strong title="' + i + '">' + user[i].name + '</strong> ' + (user[i].win ? 'beat you <span class="negative">' + user[i].win + '</span> time' +
                                (user[i].win > 1 ? 's' : '') : '') + (user[i].lose ? (user[i].win ? ' and ' : '') + 'was beaten <span class="positive">' + user[i].lose + '</span> time' + (user[i].lose > 1 ? 's' : '') : '') + '.');
                            }
                        }

                        if (deaths) {
                            list.push('You died ' + (deaths > 1 ? deaths + ' times' : 'once') + '!');
                        }

                        $c.prepend('<div id="caap_news" style="padding: 0pt 0pt 10px;"><div class="alert_title">Summary:</div><div class="alert_content">' + list.join('<br>') + '</div></div>');
                    }
                }

                return true;
            } catch (err) {
                con.error("ERROR in news: " + err);
                return false;
            }
        }
        */

        try {
            /*
            if (config.getItem('NewsSummary', true)) {
                news();
            }
            */

            if (config.getItem('AutoGift', false)) {
                gifting.collected();
                // Check for new gifts
                // A warrior wants to join your Army!
                // Send Gifts to Friends
                if ($u.hasContent(caap.resultsText) && /Send Gifts to Friends/.test(caap.resultsText)) {
                    con.log(1, 'We have a gift waiting!');
                    state.setItem('HaveGift', true);
                }

                var time = config.getItem('CheckGiftMins', 15);
                time = time < 15 ? 15 : time;
                schedule.setItem("ajaxGiftCheck", time * 60, 300);
            }

            //arena.index();
            return true;
        } catch (err) {
            con.error("ERROR in checkResults_index: " + err);
            return false;
        }
    };

}());
