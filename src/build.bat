@echo off
rem -----------------------------------
rem Please copy this file as "build.bat"
rem Edit to put in the correct paths for your system

echo Deleting old user.js files
del /F /Q _normal.user.js _min.user.js 2>nul

echo Joining files into _normal.user.js
bin\sed -f build\version.sed _head.js > _normal.user.js 2>nul
bin\sed -f build\version.sed _lead.js >> _normal.user.js 2>nul
type object_idb.js >>_normal.user.js 2>nul
type object_image64.js >>_normal.user.js 2>nul
type object_config.js >>_normal.user.js 2>nul
type object_state.js >>_normal.user.js 2>nul
type object_css.js >>_normal.user.js 2>nul
type object_sort.js >>_normal.user.js 2>nul
type object_schedule.js >>_normal.user.js 2>nul
type object_general.js >>_normal.user.js 2>nul
type object_monster.js >>_normal.user.js 2>nul
type object_guild_monster.js >>_normal.user.js 2>nul
type object_battle.js >>_normal.user.js 2>nul
type object_town.js >>_normal.user.js 2>nul
type object_spreadsheet.js >>_normal.user.js 2>nul
type object_gifting.js >>_normal.user.js 2>nul
type object_army.js >>_normal.user.js 2>nul
type object_caap.js >>_normal.user.js 2>nul
type _main.js >>_normal.user.js 2>nul

rem ----------------------------------------------------------------------
rem INSTALLED VERSION

echo Creating Firefox and Chrome versions
copy _normal.user.js Castle-Age-Autoplayer.user.js >nul
copy Castle-Age-Autoplayer.user.js Chrome\Castle-Age-Autoplayer.user.js >nul
copy README Chrome/README >nul

if EXIST "build\Chrome.pem" (
    echo Creating Chrome extension...
    chrome.exe --no-message-box --pack-extension="Chrome" --pack-extension-key="build\Chrome.pem"
) ELSE (
    echo Would create packed Chrome extension, but you are missing Chrome.pem file
)

rem --------------------------------------------------------------------------------------
rem MINIMISED VERSION - This will fail on errors so use is advised - required for release!
rem Change path to compiler and source - obtain it from here:
rem http://code.google.com/closure/compiler/

echo Creating minimised version (will also show errors)
copy _head.js _min.user.js >nul
"C:\Program Files\Java\jre6\bin\java.exe" -jar "C:\Program Files\Compiler\compiler.jar"  --compilation_level ADVANCED_OPTIMIZATIONS --output_wrapper "(function(){%output%})();" --warning_level QUIET --js "_normal.user.js" --externs "jquery-1.4.4-fix\jquery-1.4.4.js" --externs "jquery-ui-1.8.9\js\jquery-ui-1.8.9.custom.min.js" --externs "farbtastic12\farbtastic\farbtastic.js" --externs "utility-0.1.0\utility-0.1.0.js >> "_min.user.js"
rem copy _min.user.js Chrome\Castle-Age-Autoplayer.user.js >nul
echo Press any key to quit.
pause>nul
