
////////////////////////////////////////////////////////////////////
//                          schedule OBJECT
// this is the main object for dealing with scheduling and timers
/////////////////////////////////////////////////////////////////////

schedule = {
    timers: {},

    log: function (level, text) {
        try {
            var snapshot = {};
            if (utility.logLevel >= level) {
                $.extend(snapshot, this.timers);
                utility.log(level, text, snapshot);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in schedule.log: " + err);
            return false;
        }
    },

    load: function () {
        try {
            if (gm.getItem('schedule.timers', 'default') === 'default' || !$.isPlainObject(gm.getItem('schedule.timers', 'default'))) {
                gm.setItem('schedule.timers', this.timers);
            } else {
                this.timers = gm.getItem('schedule.timers', this.timers);
            }

            this.log(2, "schedule.load");
            return true;
        } catch (err) {
            utility.error("ERROR in schedule.load: " + err);
            return false;
        }
    },

    save: function (force) {
        try {
            gm.setItem('schedule.timers', this.timers);
            this.log(2, "schedule.save");
            return true;
        } catch (err) {
            utility.error("ERROR in schedule.save: " + err);
            return false;
        }
    },

    setItem: function (name, seconds, randomSecs) {
        try {
            var now;
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (!utility.isNum(seconds) || seconds < 0) {
                throw "Invalid number of seconds supplied for (" + name + ") (" + seconds + ")";
            }

            if (!utility.isNum(randomSecs) || randomSecs < 0) {
                randomSecs = 0;
            }

            now = new Date().getTime();
            this.timers[name] = {
                last: now,
                next: now + (seconds * 1000) + (Math.floor(Math.random() * randomSecs) * 1000)
            };

            this.save();
            return this.timers[name];
        } catch (err) {
            utility.error("ERROR in schedule.setItem: " + err);
            return undefined;
        }
    },

    getItem: function (name) {
        try {
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (!$.isPlainObject(this.timers[name])) {
                throw "Invalid or non-existant timer! " + name;
            }

            return this.timers[name];
        } catch (err) {
            utility.error("ERROR in schedule.getItem: " + err);
            return undefined;
        }
    },

    deleteItem: function (name) {
        try {
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (!$.isPlainObject(this.timers[name])) {
                utility.warn("schedule.deleteItem - Invalid or non-existant timer: ", name);
            }

            delete this.timers[name];
            return true;
        } catch (err) {
            utility.error("ERROR in schedule.deleteItem: " + err);
            return false;
        }
    },

    check: function (name) {
        try {
            var scheduled = false;
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (!$.isPlainObject(this.timers[name])) {
                if (utility.logLevel > 2) {
                    utility.warn("Invalid or non-existant timer!", name);
                }

                scheduled = true;
            } else if (this.timers[name].next < new Date().getTime()) {
                scheduled = true;
            }

            return scheduled;
        } catch (err) {
            utility.error("ERROR in schedule.check: " + err);
            return false;
        }
    },

    since: function (name_or_number, seconds) {
        try {
            var value = 0;
            if (isNaN(name_or_number)) {
                if (typeof name_or_number !== 'string' || name_or_number === '') {
                    throw "Invalid identifying name! (" + name_or_number + ")";
                }

                if (!$.isPlainObject(this.timers[name_or_number])) {
                    if (utility.logLevel > 2) {
                        utility.warn("Invalid or non-existant timer!", name_or_number);
                    }
                } else {
                    value = this.timers[name_or_number].last;
                }
            } else {
                value = name_or_number;
            }

            return (value < (new Date().getTime() - 1000 * seconds));
        } catch (err) {
            utility.error("ERROR in schedule.since: " + err, arguments.callee.caller);
            return false;
        }
    },

    FormatTime: function (time) {
        try {
            var d_names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                t_day   = time.getDay(),
                t_hour  = time.getHours(),
                t_min   = time.getMinutes(),
                a_p     = "PM";

            if (config.getItem("use24hr", true)) {
                t_hour = t_hour + "";
                if (t_hour && t_hour.length === 1) {
                    t_hour = "0" + t_hour;
                }

                t_min = t_min + "";
                if (t_min && t_min.length === 1) {
                    t_min = "0" + t_min;
                }

                return d_names[t_day] + " " + t_hour + ":" + t_min;
            } else {
                if (t_hour < 12) {
                    a_p = "AM";
                }

                if (t_hour === 0) {
                    t_hour = 12;
                }

                if (t_hour > 12) {
                    t_hour = t_hour - 12;
                }

                t_min = t_min + "";
                if (t_min && t_min.length === 1) {
                    t_min = "0" + t_min;
                }

                return d_names[t_day] + " " + t_hour + ":" + t_min + " " + a_p;
            }
        } catch (err) {
            utility.error("ERROR in FormatTime: " + err);
            return "Time Err";
        }
    },

    display: function (name) {
        try {
            var formatted = '';
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name!";
            }

            if (!$.isPlainObject(this.timers[name])) {
                if (utility.logLevel > 2) {
                    utility.warn("Invalid or non-existant timer!", name);
                }

                formatted = this.FormatTime(new Date());
            } else {
                formatted = this.FormatTime(new Date(this.timers[name].next));
            }

            return formatted;
        } catch (err) {
            utility.error("ERROR in schedule.display: " + err);
            return false;
        }
    }
};
