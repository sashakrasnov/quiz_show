$(document).ready(function(){
    Q = new Quiz(0);

    $('#next-action').click(function() { Q.event_next(); });
    $('#next-question').click(function() { Q.event_nextq(); });
    $('#prev-question').click(function() { Q.event_prev(); });

    $('#feedback-no').click(function() { Q.event_feedback(0); });
    $('#feedback-yes').click(function() { Q.event_feedback(1); });

    // Next question when clicked on slide
    // Uncomment it to enable this functionality
    /*
    $('#question-slide').click(function() {
        if( $(this).attr('disabled') == "disabled" ) {
            return false;
        }
        else {
            Q.event_next();
        }
    });
    */

    function set_slide_size() {
        let ww = $(window).width(),
            wh = $(window).height(),
            hh = $('#question-header').height(),
            ah = $('#quiz-actions').height(),
            w  = $('#quiz').width(),
            h  = $('#quiz').height();

            $('#quiz #question-slide').css({
                //height: (wh - hh - ah) + 'px',
                height: (wh - 150) + 'px',
                width: 'auto'
            });

/*
        if(ww == w && w*Q.ASPECT*1.2 <= wh)
            $('#quiz #question-slide').css({
                height: 'unset',
                width: '100%'
            });
        else
            $('#quiz #question-slide').css({
                height: '100vh',
                width: 'unset'
            });
*/
        //console.log('ww:', ww, 'wh:', wh, 'hh:', hh, 'ah', ah, 'w:', w, 'h:', h, 'asp:', Q.ASPECT);
    }

    set_slide_size();

    $(window).resize(set_slide_size);

});
