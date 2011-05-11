/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true, eqeqeq: true, newcap: true */
/*global postMessage */
/*jslint maxlen: 512 */

this.addEventListener('click', function (event) {
    if (event.button === 0 && event.shiftKey === false) {
        postMessage('left-click');
    }

    if (event.button === 2 || (event.button === 0 && event.shiftKey === true)) {
        postMessage('right-click');
        event.preventDefault();
    }
}, true);
