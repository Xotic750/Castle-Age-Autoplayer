#!/bin/sh

version=
if grep -e s/\!dev\!/0/g version.sed; then
    version=`grep -e version version.sed | awk -F / '{print $3}'`
fi

echo -n "Deleting old build files : "
rm -f _buildcommon.tmp
rm -f ../FireFox/Castle-Age-Autoplayer-FireFox.user.js
rm -f ../FireFox/Castle-Age-Autoplayer-FireFox.min.user.js
rm -f ../Opera/Castle-Age-Autoplayer-Opera.user.js
rm -f ../Opera/Castle-Age-Autoplayer-Opera.min.user.js
rm -f ../Safari/Castle-Age-Autoplayer-Safari.user.js
rm -f ../Safari/Castle-Age-Autoplayer-Safari.min.user.js
rm -f ../IE/Castle-Age-Autoplayer-IE.ieuser.js
rm -f ../IE/Castle-Age-Autoplayer-IE.min.ieuser.js
rm -f ../Chrome/unpacked/Castle-Age-Autoplayer-Chrome.user.js
rm -f ../Chrome/unpacked/Castle-Age-Autoplayer-Chrome.min.user.js
echo "Done."

echo -n "Joining common files : "
sed -f version.sed _lead.js > _buildcommon.tmp
cat object_image64.js >> _buildcommon.tmp
cat object_offline.js >> _buildcommon.tmp
cat object_config.js >> _buildcommon.tmp
cat object_state.js >> _buildcommon.tmp
cat object_css.js >> _buildcommon.tmp
cat object_sort.js >> _buildcommon.tmp
cat object_schedule.js >> _buildcommon.tmp
cat object_general.js >> _buildcommon.tmp
cat object_monster.js >> _buildcommon.tmp
cat object_guild_monster.js >> _buildcommon.tmp
#cat object_arena.js >> _buildcommon.tmp
cat object_festival.js >> _buildcommon.tmp
cat object_feed.js >> _buildcommon.tmp
cat object_battle.js >> _buildcommon.tmp
cat object_town.js >> _buildcommon.tmp
cat object_spreadsheet.js >> _buildcommon.tmp
cat object_gifting.js >> _buildcommon.tmp
cat object_army.js >> _buildcommon.tmp
cat object_caap.js >> _buildcommon.tmp
cat _main.js >> _buildcommon.tmp
echo "Done."

echo -n "Creating Firefox version : "
sed -f version.sed _head_firefox.js > ../FireFox/Castle-Age-Autoplayer-FireFox.user.js
sed -f version.sed _pre_firefox.js >> ../FireFox/Castle-Age-Autoplayer-FireFox.user.js
cat _buildcommon.tmp >> ../FireFox/Castle-Age-Autoplayer-FireFox.user.js
# next line to be removed in the future once link changes are completed
cp ../FireFox/Castle-Age-Autoplayer-FireFox.user.js ../Castle-Age-Autoplayer.user.js
if [ "$version" ]; then
    cp ../FireFox/Castle-Age-Autoplayer-FireFox.user.js ../FireFox/Castle-Age-Autoplayer-FireFox-v$version.user.js
fi
echo "Done."

echo -n "Creating Opera version : "
sed -f version.sed _head_opera.js > ../Opera/Castle-Age-Autoplayer-Opera.user.js
sed -f version.sed _pre_opera.js >> ../Opera/Castle-Age-Autoplayer-Opera.user.js
cat _buildcommon.tmp >> ../Opera/Castle-Age-Autoplayer-Opera.user.js
if [ "$version" ]; then
    cp ../Opera/Castle-Age-Autoplayer-Opera.user.js ../Opera/Castle-Age-Autoplayer-Opera-v$version.user.js
fi
echo "Done."

echo -n "Creating Safari version : "
sed -f version.sed _head_safari.js > ../Safari/Castle-Age-Autoplayer-Safari.user.js
sed -f version.sed _pre_safari.js >> ../Safari/Castle-Age-Autoplayer-Safari.user.js
cat _buildcommon.tmp >> ../Safari/Castle-Age-Autoplayer-Safari.user.js
if [ "$version" ]; then
    cp ../Safari/Castle-Age-Autoplayer-Safari.user.js ../Safari/Castle-Age-Autoplayer-Safari-v$version.user.js
fi
echo "Done."

echo -n "Creating IE version : "
sed -f version.sed _head_ie.js > ../IE/Castle-Age-Autoplayer-IE.ieuser.js
sed -f version.sed _pre_ie.js >> ../IE/Castle-Age-Autoplayer-IE.ieuser.js
cat _buildcommon.tmp >> ../IE/Castle-Age-Autoplayer-IE.ieuser.js
if [ "$version" ]; then
    cp ../IE/Castle-Age-Autoplayer-IE.user.js ../IE/Castle-Age-Autoplayer-IE-v$version.user.js
fi
echo "Done."

echo -n "Creating Chrome version : "
sed -f version.sed _head_chrome.js > ../Chrome/unpacked/Castle-Age-Autoplayer-Chrome.user.js
sed -f version.sed _pre_chrome.js >> ../Chrome/unpacked/Castle-Age-Autoplayer-Chrome.user.js
cat _buildcommon.tmp >> ../Chrome/unpacked/Castle-Age-Autoplayer-Chrome.user.js

if [ "$version" ]; then
    echo "Creating Chrome release version"
    sed -f version.sed ../Chrome/templates/manifest.rel > ../Chrome/unpacked/manifest.json
    rm -f ../Chrome/upload/Chrome.zip
    zip -j ../Chrome/upload/Chrome.zip ../Chrome/unpacked/*
else
    echo "Creating Chrome development version"
    sed -f version.sed ../Chrome/templates/manifest.dev > ../Chrome/unpacked/manifest.json
    sed -f version.sed ../Chrome/templates/updates.tmpl > ../Chrome/packed/updates.xml
    # next line to be removed in the future once link changes are completed
    cp ../Chrome/packed/updates.xml ../
    if [ -f ../Chrome/Chrome.pem ]; then
        chromium-browser --no-message-box --pack-extension="../Chrome/unpacked" --pack-extension-key="../Chrome/Chrome.pem"
        #google-chrome --no-message-box --pack-extension="../Chrome/unpacked" --pack-extension-key="../Chrome/Chrome.pem"
        mv ../Chrome/unpacked.crx ../Chrome/packed/Chrome.crx
        # next line to be removed in the future once link changes are completed
        cp ../Chrome/packed/Chrome.crx ../Chrome/Chrome.crx
    else
        echo "Would create packed Chrome extension, but you are missing Chrome.pem file"
    fi
fi
echo "Done."

# --------------------------------------------------------------------------------------
# MINIMISED VERSION - This will fail on errors so use is advised - required for release!
# Change path to compiler and source - obtain it from here:
# http://code.google.com/closure/compiler/

#echo "Creating minimised version (will also show errors)"
#sed -f build/version.sed _head.js > _min.user.js
#java -jar bin/compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --output_wrapper "(function(){%output%})();" --warning_level QUIET --js _normal.user.js --externs jquery-1.4.4-fix/jquery-1.4.4.js --externs jquery-ui-1.8.9/js/jquery-ui-1.8.9.custom.min.js --externs farbtastic12/farbtastic/farbtastic.js --externs utility-0.1.0/utility-0.1.0.js >> _min.user.js
#cp _min.user.js Chrome/Castle-Age-Autoplayer.user.js
#echo "Done."

echo -n "Deleting old build files : "
rm -f _buildcommon.tmp
echo "Done."
