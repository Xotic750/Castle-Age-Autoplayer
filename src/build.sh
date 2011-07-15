#!/bin/sh

version=
if grep -e s/\!dev\!/0/g version.sed; then
    version=`grep -e version version.sed | awk -F / '{print $3}'`
fi

echo -n "Deleting old build files : "
rm -f ../common/_buildcommon.tmp
rm -f ../common/Castle-Age-Autoplayer.js
rm -f ../FireFox/Castle-Age-Autoplayer-FireFox.user.js
rm -f ../FireFox/Castle-Age-Autoplayer-FireFox.min.user.js
rm -f ../FireFox/unpacked/chrome/content/Castle-Age-Autoplayer-Chrome.js
rm -f ../Opera/unpacked/Castle-Age-Autoplayer-Chrome.js
rm -f ../Opera/Castle-Age-Autoplayer-Opera.user.js
rm -f ../Opera/Castle-Age-Autoplayer-Opera.min.user.js
rm -f ../Opera/unpacked/resources/Castle-Age-Autoplayer-Chrome.js
rm -f ../Safari/Castle-Age-Autoplayer-Safari.user.js
rm -f ../Safari/Castle-Age-Autoplayer-Safari.min.user.js
rm -f ../IE/Castle-Age-Autoplayer-IE.ieuser.js
rm -f ../IE/Castle-Age-Autoplayer-IE.min.ieuser.js
rm -f ../Chrome/unpacked/Castle-Age-Autoplayer-Chrome.user.js
rm -f ../Chrome/unpacked/Castle-Age-Autoplayer-Chrome.min.user.js
rm -f ../Chrome/unpacked/Castle-Age-Autoplayer-Chrome.js
echo "Done."

echo -n "Joining common files : "
sed -f version.sed _lead.js > ../common/_buildcommon.tmp
cat object_image64.js >> ../common/_buildcommon.tmp
cat object_offline.js >> ../common/_buildcommon.tmp
cat object_profiles.js >> ../common/_buildcommon.tmp
sed -f version.sed object_css.js >> ../common/_buildcommon.tmp
cat object_sort.js >> ../common/_buildcommon.tmp
cat object_general.js >> ../common/_buildcommon.tmp
cat object_monster.js >> ../common/_buildcommon.tmp
cat object_guild_monster.js >> ../common/_buildcommon.tmp
#cat object_arena.js >> ../common/_buildcommon.tmp
cat object_festival.js >> ../common/_buildcommon.tmp
cat object_feed.js >> ../common/_buildcommon.tmp
cat object_battle.js >> ../common/_buildcommon.tmp
cat object_town.js >> ../common/_buildcommon.tmp
cat object_spreadsheet.js >> ../common/_buildcommon.tmp
cat object_gifting.js >> ../common/_buildcommon.tmp
cat object_army.js >> ../common/_buildcommon.tmp
sed -f version.sed object_caap.js >> ../common/_buildcommon.tmp
sed -f version.sed _main.js >> ../common/_buildcommon.tmp
sed -f version.sed _head_common.js > ../common/Castle-Age-Autoplayer.js
sed -f version.sed _pre_common.js >> ../common/Castle-Age-Autoplayer.js
cat ../common/_buildcommon.tmp >> ../common/Castle-Age-Autoplayer.js
echo "Done."

echo -n "Creating Firefox version : "
# next line to be removed in the future once link changes are completed
sed -f version.sed _head_firefox.js > ../Castle-Age-Autoplayer.user.js
sed -f version.sed _pre_firefox.js >> ../Castle-Age-Autoplayer.user.js
cat ../common/_buildcommon.tmp >> ../Castle-Age-Autoplayer.user.js

if [ "$version" ]; then
    sed -f version.sed ../FireFox/templates/caapff.js > ../FireFox/unpacked/resources/jid0-gksswwibbint83120tqnpaqcb7s-caap-data/original/caapff.js
    sed -f version.sed ../FireFox/templates/caap_comms.js > ../FireFox/unpacked/resources/jid0-gksswwibbint83120tqnpaqcb7s-caap-data/caap_comms.js
    sed -f version.sed ../FireFox/templates/main.js > ../FireFox/unpacked/resources/jid0-gksswwibbint83120tqnpaqcb7s-caap-lib/main.js
    sed -f version.sed ../FireFox/templates/install.rdf.rel > ../FireFox/unpacked/install.rdf
    sed -f version.sed ../FireFox/templates/update.rdf > ../FireFox/update.rdf
    sed -f version.sed ../FireFox/templates/update.xhtml.head.rel > ../FireFox/update.xhtml
else
    sed -f version.sed ../FireFox/templates/caapff.js > ../FireFox/unpacked/resources/jid0-gksswwibbint83120tqnpaqcb7s-caap-data/original/caapff.js
    sed -f version.sed ../FireFox/templates/caap_comms.js > ../FireFox/unpacked/resources/jid0-gksswwibbint83120tqnpaqcb7s-caap-data/caap_comms.js
    sed -f version.sed ../FireFox/templates/main.js > ../FireFox/unpacked/resources/jid0-gksswwibbint83120tqnpaqcb7s-caap-lib/main.js
    sed -f version.sed ../FireFox/templates/install.rdf.dev > ../FireFox/unpacked/install.rdf
    sed -f version.sed ../FireFox/templates/update.rdf > ../FireFox/update.rdf
    sed -f version.sed ../FireFox/templates/update.xhtml.head.dev > ../FireFox/update.xhtml
fi

cat ../FireFox/templates/update.xhtml.body >> ../FireFox/update.xhtml
cp ../common/Castle-Age-Autoplayer.js ../FireFox/unpacked/resources/jid0-gksswwibbint83120tqnpaqcb7s-caap-data/Castle-Age-Autoplayer.js
rm -f ../FireFox/packed/caap.xpi
cd ../FireFox/unpacked/
zip -x '*/.svn/*' -x '*/.git/' -r ../packed/caap.xpi *
cd ../../src/
echo "Done."

echo -n "Creating Opera version : "
if [ "$version" ]; then
    sed -f version.sed ../Opera/templates/config.xml.rel > ../Opera/unpacked/config.xml
    sed -f version.sed ../Opera/templates/index.html > ../Opera/unpacked/index.html
    sed -f version.sed ../Opera/templates/options.html.rel > ../Opera/unpacked/options.html
    sed -f version.sed ../Opera/templates/user.js > ../Opera/unpacked/includes/user.js
else
    sed -f version.sed ../Opera/templates/config.xml.dev > ../Opera/unpacked/config.xml
    sed -f version.sed ../Opera/templates/index.html > ../Opera/unpacked/index.html
    sed -f version.sed ../Opera/templates/options.html.dev > ../Opera/unpacked/options.html
    sed -f version.sed ../Opera/templates/user.js > ../Opera/unpacked/includes/user.js
    sed -f version.sed ../Opera/templates/updates.xml > ../Opera/packed/updates.xml
fi

cp ../common/Castle-Age-Autoplayer.js ../Opera/unpacked/resources/Castle-Age-Autoplayer.js
rm -f ../Opera/packed/caap.oex
cd ../Opera/unpacked/
zip -x '*/.svn/*' -x '*/.git/' -r ../packed/caap.oex *
cd ../../src/
echo "Done."

echo -n "Creating Safari version : "
echo "Done."

echo -n "Creating IE version : "
echo "Done."

echo -n "Creating Chrome version : "
cp ../common/Castle-Age-Autoplayer.js ../Chrome/unpacked/Castle-Age-Autoplayer.js

if [ "$version" ]; then
    echo "Creating Chrome release version"
    sed -f version.sed ../Chrome/templates/manifest.rel > ../Chrome/unpacked/manifest.json
    rm -f ../Chrome/upload/Chrome.zip
    zip -x '*/.svn/*' -x '*/.git/' -j ../Chrome/upload/Chrome.zip ../Chrome/unpacked/*
else
    echo "Creating Chrome development version"
    sed -f version.sed ../Chrome/templates/manifest.dev > ../Chrome/unpacked/manifest.json
    sed -f version.sed ../Chrome/templates/updates.tmpl > ../Chrome/packed/updates.xml
    sed -f version.sed ../Chrome/templates/background.html > ../Chrome/unpacked/background.html
    cp ../Chrome/packed/updates.xml ../
    if [ -f ../Chrome/Chrome.pem ]; then
        #chromium-browser --no-message-box --pack-extension="../Chrome/unpacked" --pack-extension-key="../Chrome/Chrome.pem"
        google-chrome --no-message-box --pack-extension="../Chrome/unpacked" --pack-extension-key="../Chrome/Chrome.pem"
        mv ../Chrome/unpacked.crx ../Chrome/packed/Chrome.crx
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
rm -f ../common/_buildcommon.tmp
echo "Done."
