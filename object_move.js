/////////////////////////////////////////////////////////////////////
//                          move OBJECT
/////////////////////////////////////////////////////////////////////

Move = {
    me: null,

    moveHandler: function (e) {
        if (e === null) {
            return;
        }

        if (e.button === 0 && this.dragOK) {
            this.style.left = e.clientX - this.dragXoffset + 'px';
            this.style.top = e.clientY - this.dragYoffset + 'px';
        }
    },

    cleanup: function (e) {
        $(this).unbind('mousemove', Move.moveHandler);
        $(this).unbind('mouseup', Move.cleanup);
        if (this.dragOK && this.style.left && this.style.top) {
            switch (this.id) {
            case 'caap_div' :
                gm.setValue('caap_div_menuTop', (this.style.top).replace(/px/, ''));
                gm.setValue('caap_div_menuLeft', (this.style.left).replace(/px/, '') - $(caap.controlXY.selector).offset().left);
                gm.setValue('caap_div_zIndex', '2');
                gm.setValue('caap_top_zIndex', '1');
                break;
            case 'caap_top' :
                gm.setValue('caap_top_menuTop', (this.style.top).replace(/px/, ''));
                gm.setValue('caap_top_menuLeft', (this.style.left).replace(/px/, '') - $(caap.dashboardXY.selector).offset().left);
                gm.setValue('caap_div_zIndex', '1');
                gm.setValue('caap_top_zIndex', '2');
                break;
            default:
            }
        }

        //its been dragged now
        this.dragOK = false;
    },

    dragHandler: function (e) {
        if (e === null || this.nodeName != 'DIV') {
            return;
        }

        switch (this.id) {
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

        this.dragOK = true;
        this.dragXoffset = e.clientX - this.offsetLeft;
        this.dragYoffset = e.clientY - this.offsetTop;
        //set the left before removing the right
        this.style.left = e.clientX - this.dragXoffset + 'px';
        this.style.right = null;
        $(this).bind('mousemove', Move.moveHandler);
        $(this).bind('mouseup', Move.cleanup);
    }
};
