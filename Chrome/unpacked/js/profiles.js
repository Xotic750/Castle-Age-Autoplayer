/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,profiles,db,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          profiles OBJECT
// this is the main object for dealing with user option profile
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    profiles.backupCurrent = function () {
        try {
            if (db && db.available) {
                if (confirm("Overwrite current backup?")) {
                    profiles.backup("current", function () {
                        con.log(1, "Backup completed.");
                        alert("Backup completed.");
                    });
                }
            }

            return true;
        } catch (err) {
            con.error("ERROR in profiles.backupCurrent: " + err);
            return false;
        }
    };

    profiles.restoreCurrent = function () {
        try {
            if (db && db.available) {
                if (confirm("Restore current backup?")) {
                    profiles.restore("current", function () {
                        caap.addControl(true);
                        con.log(1, "Restore completed.");
                        alert("Restore completed.");
                    });
                }
            }

            return true;
        } catch (err) {
            con.error("ERROR in profiles.restoreCurrent: " + err);
            return false;
        }
    };

    profiles.getBackupKeys = function (cb) {
        try {
            if (!db || !db.available) {
                throw "Indexed DB not available!";
            }

            db.onsuccess = function (event) {
                con.log(3, "profiles.getBackupKeys", event);
                if ($u.isFunction(cb)) {
                    cb(event);
                }
            };

            db.onabort = db.onerror = function (event) {
                con.warn("profiles.getBackupKeys failed", event);
                if ($u.isFunction(cb)) {
                    cb([]);
                }
            };

            db.getAllKeys('profiles.options');
            return true;
        } catch (err) {
            con.error("ERROR in profiles.getBackupKeys: " + err);
            if ($u.isFunction(cb)) {
                cb([]);
            }

            return false;
        }
    };

    profiles.backup = function (name, cb) {
        try {
            if (!$u.isString(name) || name === '') {
                throw "Invalid identifying name!";
            }

            if (!db || !db.available) {
                throw "Indexed DB not available!";
            }

            var copy = config.copyAll();

            copy.key = name;
            db.onsuccess = function () {
                db.onsuccess = function () {
                    con.log(1, "profiles.backup saved", name);
                    if ($u.isFunction(cb)) {
                        cb("Saved!");
                    }
                };

                db.onabort = db.onerror = function (event) {
                    con.warn("profiles.backup failed si", event);
                    if ($u.isFunction(cb)) {
                        cb("Failed!");
                    }
                };

                db.setItem('profiles.options', copy);
            };

            db.onabort = db.onerror = db.onblocked = function (event) {
                con.warn("profiles.backup failed cos", event);
                if ($u.isFunction(cb)) {
                    cb("Failed!");
                }
            };

            db.createObjectStore("profiles.options", "key");
            return true;
        } catch (err) {
            con.error("ERROR in profiles.backup: " + err);
            if ($u.isFunction(cb)) {
                cb("Failed!");
            }

            return false;
        }
    };

    profiles.restore = function (name, cb) {
        try {
            if (!$u.isString(name) || name === '') {
                throw "Invalid identifying name!";
            }

            if (!db || !db.available) {
                throw "Indexed DB not available!";
            }

            db.onsuccess = function (event) {
                con.log(1, "profiles.restore loaded", name);
                config.setAll(event);
                config.setKey("current");
                if ($u.isFunction(cb)) {
                    cb("Loaded!");
                }
            };

            db.onabort = db.onerror = function (event) {
                con.warn("profiles.restore failed", event);
                if ($u.isFunction(cb)) {
                    cb("Failed!");
                }
            };

            db.getItem('profiles.options', name);
            return true;
        } catch (err) {
            con.error("ERROR in profiles.save: " + err);
            if ($u.isFunction(cb)) {
                cb("Failed!");
            }

            return false;
        }
    };

    profiles.erase = function (name, cb) {
        try {
            if (!$u.isString(name) || name === '') {
                throw "Invalid identifying name!";
            }

            if (!db || !db.available) {
                throw "Indexed DB not available!";
            }

            db.onsuccess = function () {
                con.log(1, "profiles.erase deleted", name);
                if ($u.isFunction(cb)) {
                    cb("Deleted!");
                }
            };

            db.onabort = db.onerror = function (event) {
                con.warn("profiles.erase failed", event);
                if ($u.isFunction(cb)) {
                    cb("Failed!");
                }
            };

            db.deleteItem('profiles.options', name);
            return true;
        } catch (err) {
            con.error("ERROR in profiles.erase: " + err);
            if ($u.isFunction(cb)) {
                cb("Failed!");
            }

            return false;
        }
    };

}());
