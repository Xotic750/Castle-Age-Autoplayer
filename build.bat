@echo off
rem -----------------------------------
rem Please copy this file as "build.bat"
rem Edit to put in the correct paths for your system

echo Deleting old user.js files
del /F /Q _normal.user.js _min.user.js 2>nul

echo Joining files into _normal.user.js
type _head.js >_normal.user.js 2>nul
type object_image64.js >>_normal.user.js 2>nul
type object_css.js >>_normal.user.js 2>nul
type object_global.js >>_normal.user.js 2>nul
type object_gm.js >>_normal.user.js 2>nul
type object_html.js >>_normal.user.js 2>nul
type object_sort.js >>_normal.user.js 2>nul
type object_schedule.js >>_normal.user.js 2>nul
type object_general.js >>_normal.user.js 2>nul
type object_caap.js >>_normal.user.js 2>nul
type _main.js >>_normal.user.js 2>nul

rem ----------------------------------------------------------------------
rem INSTALLED VERSION

echo Creating Firefox and Chrome versions
copy _normal.user.js Castle-Age-Autoplayer.user.js >nul
copy Castle-Age-Autoplayer.user.js Chrome/Castle-Age-Autoplayer.user.js >nul
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

rem echo Creating minimised version (will also show errors)
rem copy _head.js _min.user.js >nul
rem "C:\Program Files\Java\jre6\bin\java.exe" -jar "C:\Program Files\Compiler\compiler.jar" --js "_normal.user.js" >> "_min.user.js"

echo Press any key to quit.
pause>nul