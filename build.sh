#!/bin/sh
# -----------------------------------
# Please copy this file as "build.bat"
# Edit to put in the correct paths for your system

echo "Deleting old user.js files"
rm -f _normal.user.js _min.user.js

echo "Joining files into _normal.user.js"
cat _head.js >_normal.user.js
cat object_global.js >>_normal.user.js
cat object_gm.js >>_normal.user.js
cat object_html.js >>_normal.user.js
cat object_caap.js >>_normal.user.js
cat _main.js >>_normal.user.js
#cat css.js >>_normal.user.js
#cat utility.js >>_normal.user.js
#cat worker.js >>_normal.user.js
#cat worker_*.js >>_normal.user.js

# ----------------------------------------------------------------------
# INSTALLED VERSION - Means you only need to hit F5 / refresh in Firefox
# Just change the path to your firefox installed version, only the '???' should need changing on Windows7

echo "Installing new version to Firefox"
cp _normal.user.js Castle-Age-Autoplayer.user.js
cp Castle-Age-Autoplayer.user.js Chrome/Castle-Age-Autoplayer.user.js
cp README Chrome/README

# --------------------------------------------------------------------------------------
# MINIMISED VERSION - This will fail on errors so use is advised - required for release!
# Change path to compiler and source - obtain it from here:
# http://code.google.com/closure/compiler/

echo "Creating minimised version (will also show errors)"
cp _head.js _min.user.js
java -jar compiler.jar --js _normal.user.js >> _min.user.js

echo "Done."
