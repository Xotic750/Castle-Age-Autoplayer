
////////////////////////////////////////////////////////////////////
//                          schedule OBJECT
// this is the main object for dealing with scheduling and timers
/////////////////////////////////////////////////////////////////////

schedule = {
    timers: [],

    timer: function () {
        this.data = {
            name : '',
            last : new Date(2009, 1, 1).getTime(),
            next : new Date(2009, 1, 1).getTime()
        };
    },

    Load: function () {
        try {
            $.extend(this.timers, gm.getJValue('timers'));
            global.log(2, "schedule.Load", this.timers);
            return true;
        } catch (err) {
            global.error("ERROR in schedule.Load: " + err);
            return false;
        }
    },

    Save: function () {
        try {
            gm.setJValue('timers', this.timers);
            global.log(2, "schedule.Save", this.timers);
            return true;
        } catch (err) {
            global.error("ERROR in schedule.Save: " + err);
            return false;
        }
    },

    Search: function (name) {
        try {
            var it = 0;

            for (it = 0; it < this.timers.length; it += 1) {
                if (this.timers[it].name === name) {
                    break;
                }
            }

            if (it >= this.timers.length) {
                it = -1;
            }

            return it;
        } catch (err) {
            global.error("ERROR in schedule.Search: " + err);
            return -2;
        }
    },

    Set: function (name, seconds, randomSecs) {
        try {
            var tempTimer = new this.timer(),
                index     = 0;

            if (!randomSecs) {
                randomSecs = 0;
            }

            tempTimer.data.name = name;
            tempTimer.data.last = new Date().getTime();
            tempTimer.data.next = tempTimer.data.last + (seconds * 1000) + (Math.floor(Math.random() * randomSecs) * 1000);
            index = this.Search(tempTimer.data.name);
            if (index >= 0) {
                this.timers[index] = tempTimer.data;
            } else {
                this.timers.push(tempTimer.data);
            }

            this.Save();
            return true;
        } catch (err) {
            global.error("ERROR in schedule.Set: " + err);
            return false;
        }
    },

    Get: function (name) {
        try {
            var tempTimer = new this.timer(),
                index     = 0;

            index = this.Search(name);
            if (index >= 0) {
                tempTimer.data = this.timers[index];
            }

            return tempTimer.data;
        } catch (err) {
            global.error("ERROR in schedule.Get: " + err);
            return (new this.timer().data);
        }
    },

    Check: function (name) {
        try {
            var index     = 0,
                scheduled = false;

            if (this.Get(name).next < new Date().getTime()) {
                scheduled = true;
            }

            global.log(3, "schedule.Check", name, scheduled);
            return scheduled;
        } catch (err) {
            global.error("ERROR in schedule.Check: " + err);
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

            if (gm.getValue("use24hr", true)) {
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
            global.error("ERROR in FormatTime: " + err);
            return "Time Err";
        }
    },

    Display: function (name) {
        try {
            return this.FormatTime(new Date(this.Get(name).next));
        } catch (err) {
            global.error("ERROR in schedule.Display: " + err);
            return false;
        }
    }
};
