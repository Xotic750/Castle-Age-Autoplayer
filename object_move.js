/////////////////////////////////////////////////////////////////////
//                          move OBJECT
/////////////////////////////////////////////////////////////////////

Move = {
    me: null,

    moveHandler: function (e) {
        if (e === null) {
            return;
        }

        if (e.button === 0 && Move.me.dragOK) {
            Move.me.style.left = e.clientX - Move.me.dragXoffset + 'px';
            Move.me.style.top = e.clientY - Move.me.dragYoffset + 'px';
        }
    },

    cleanup: function (e) {
        Move.me.removeEventListener('mousemove', Move.moveHandler, false);
        Move.me.removeEventListener('mouseup', Move.cleanup, false);
        if (Move.me.dragOK && Move.me.style.left && Move.me.style.top) {
            switch (Move.me.id) {
            case 'caap_div' :
                gm.setValue('caap_div_menuTop', (Move.me.style.top).replace(/px/, ''));
                gm.setValue('caap_div_menuLeft', (Move.me.style.left).replace(/px/, '') - $(caap.controlXY.selector).offset().left);
                gm.setValue('caap_div_zIndex', '2');
                gm.setValue('caap_top_zIndex', '1');
                break;
            case 'caap_top' :
                gm.setValue('caap_top_menuTop', (Move.me.style.top).replace(/px/, ''));
                gm.setValue('caap_top_menuLeft', (Move.me.style.left).replace(/px/, '') - $(caap.dashboardXY.selector).offset().left);
                gm.setValue('caap_div_zIndex', '1');
                gm.setValue('caap_top_zIndex', '2');
                break;
            default:
            }
        }

        //its been dragged now
        Move.me.dragOK = false;
    },

    dragHandler: function (e) {
        if (e === null || this.nodeName != 'DIV') {
            return;
        }

        Move.me = this;
        switch (Move.me.id) {
        case 'caap_div' :
            $("#caap_div").css('z-index', '2');
            $("#caap_top").css('z-index', '1');
            break;
        case 'caap_top' :
            $("#caap_div").css('z-index', '1');
            $("#caap_top").css('z-index', '2');
            break;
        default:
            return;
        }

        Move.me.dragOK = true;
        Move.me.dragXoffset = e.clientX - Move.me.offsetLeft;
        Move.me.dragYoffset = e.clientY - Move.me.offsetTop;
        //set the left before removing the right
        Move.me.style.left = e.clientX - Move.me.dragXoffset + 'px';
        Move.me.style.right = null;
        Move.me.addEventListener('mousemove', Move.moveHandler, false);
        Move.me.addEventListener('mouseup', Move.cleanup, false);
    }
};
