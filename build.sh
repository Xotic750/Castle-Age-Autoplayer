#!/bin/sh
# -----------------------------------
# Please copy this file as "build.sh"
# Edit to put in the correct paths for your system

echo -n "Deleting old user.js files : "
rm -f _normal.user.js _min.user.js
echo "Done."

echo -n "Joining files into _normal.user.js : "
sed -f build/version.sed _head.js > _normal.user.js
sed -f build/version.sed _lead.js >> _normal.user.js
cat object_image64.js >> _normal.user.js
cat object_utility.js >> _normal.user.js
cat object_config.js >> _normal.user.js
cat object_state.js >> _normal.user.js
cat object_css.js >> _normal.user.js
cat object_gm.js >> _normal.user.js
cat object_html.js >> _normal.user.js
cat object_sort.js >> _normal.user.js
cat object_schedule.js >> _normal.user.js
cat object_general.js >> _normal.user.js
cat object_monster.js >> _normal.user.js
cat object_battle.js >> _normal.user.js
cat object_town.js >> _normal.user.js
cat object_gifting.js >> _normal.user.js
cat object_caap.js >> _normal.user.js
cat _main.js >> _normal.user.js
echo "Done."

# ----------------------------------------------------------------------
# INSTALLED VERSION

echo -n "Creating Firefox and Chrome versions : "
cp _normal.user.js Castle-Age-Autoplayer.user.js
cp Castle-Age-Autoplayer.user.js Chrome/Castle-Age-Autoplayer.user.js
cp README Chrome/README
echo "Done."

# --------------------------------------------------------------------------------------
# MINIMISED VERSION - This will fail on errors so use is advised - required for release!
# Change path to compiler and source - obtain it from here:
# http://code.google.com/closure/compiler/

echo "Creating minimised version (will also show errors)"
cp _head.js _min.user.js
java -jar bin/compiler.jar --js _normal.user.js >> _min.user.js
echo "Done."

if grep -e s/\!dev\!/0/g build/version.sed; then
    echo "Creating Chrome release version"
    sed -f build/version.sed build/manifest.rel > Chrome/manifest.json
    rm -f Chrome.zip
    zip -j Chrome.zip Chrome/*
else
    echo "Creating Chrome development version"
    sed -f build/version.sed build/manifest.dev > Chrome/manifest.json
    sed -f build/version.sed build/updates.tmpl > updates.xml
    if [ -f ../Chrome.pem ]; then
        chromium-browser --no-message-box --pack-extension="Chrome" --pack-extension-key="../Chrome.pem"
    else
        echo "Would create packed Chrome extension, but you are missing Chrome.pem file"
    fi
fi

echo "Done."
