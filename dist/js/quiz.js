// =============================================
// Constructor
// =============================================
var Quiz = function(q_id) {
    //this.DEBUG = true;
    this.DEBUG = false;
    this.CYCLE = false;
    this.ASPECT = 120/173; // Aspect ratio of slides

    // Setting up types of questions as Array of Objects
    // The index of the array is a question type number
    // Each object in @types consists of these parameters:
    // h: header title; d: description about this type
    this.types = [
        {'h':'Warm-up',        'd':''}, // Type '0'
        {'h':'Logical Aikido', 'd':''}, // Type '1'
        {'h':'Unwanted sixth', 'd':''}, // Type '2'
        {'h':'Master\'s hand', 'd':''}, // Type '3'
    ];

    // Setting up a sequence of questions as Array of Objects
    // Each object in the array consist of these parameters:
    //   q: Array of slides: question image, help image, answer image
    //   t: question type
    //   c: question unique id
    this.questions = [{
            'q': ['assets/slides/warm-up-question.svg', '', 'assets/slides/warm-up-answer.svg'],
            't': 0,
            'c': 'wup-1'
        }, {
            'q': ['assets/slides/aikido-question.svg', 'assets/slides/aikido-help.svg', 'assets/slides/aikido-answer.svg'],
            't': 1,
            'c': 'aikido-1'
        }, {
            'q': ['assets/slides/unwanted-6th-question.svg', '', 'assets/slides/unwanted-6th-answer.svg'],
            't': 2,
            'c': '6th-1'
        }, {
            'q': ['assets/slides/mhand-question.jpg', '', 'assets/slides/mhand-answer.jpg'],
            't': 3,
            'c': 'mhand-1'
        }
    ];

    this.actions = ['Show help', 'Show answer', 'Next question'];

    this.votes = [];

    this.q_len = this.questions.length; // Amount of questions per quiz
    this.s_len = this.actions.length;   // Slides per questions

    this.q_id = q_id >= 0 && q_id <= this.q_len-1 ? q_id : 0;   // Question pointer
    this.s_id = 0;                                              // Slide pointer

    this.btn_action = document.getElementById('next-action');
    this.btn_prev   = document.getElementById('prev-question');
    this.btn_next   = document.getElementById('next-question');
    this.btn_yes    = document.getElementById('feedback-yes');
    this.btn_no     = document.getElementById('feedback-no');

    this.img_slide  = document.getElementById('question-slide');

    this.buttons();
    this.show_slide();
}

// ======================================================
// Logger
// ======================================================
Quiz.prototype.log = function(c) {
    if(this.DEBUG) console.log(
        'q_id:', this.q_id,
        's_id:', this.s_id,
        'url:', this.questions[this.q_id].q[this.s_id],
        c || ''
    );
}

// ======================================================
// Event listener callback for "next question" action
// ======================================================
Quiz.prototype.event_nextq = function() {
    this.nextq();
    this.buttons();
    this.show_slide();
}

// ======================================================
// Event listener callback for "previous question" action
// ======================================================
Quiz.prototype.event_prevq = function() {
    this.prevq();
    this.buttons();
    this.show_slide();
}

// ======================================================
// Event listener callback for "next slide" action
// ======================================================
Quiz.prototype.event_next = function() {
    this.next();
    this.buttons();
    this.show_slide();
}

// ======================================================
// Event listener callback for "previous slide" action
// ======================================================
Quiz.prototype.event_prev = function() {
    this.prev();
    this.buttons();
    this.show_slide();
}

// ======================================================
// Event listener callback for feedback buttons
// ======================================================
Quiz.prototype.event_feedback = function(yes) {
    yes = yes || 0;

    var btn_yes = this.btn_yes,
        btn_no  = this.btn_no,
        code    = this.questions[this.q_id].c,
        slide   = this.s_id,
        votes   = this.votes;

    // Pure JS for get request

    var xhr = new XMLHttpRequest();

    xhr.open('GET', `feedback.ajax.php?q=${code}&s=${slide}&yes=${yes}`);

    xhr.onload = function() {
        if (xhr.status === 200) {
            votes.push(code);
            btn_yes.disabled = btn_no.disabled  = true;
            console.log(xhr);
            try {
                const resp = JSON.parse(xhr.responseText);
                // Add a code below to handle response from the server
            }
            catch {
                this.log('// feedback script response data error: ' + xhr.responseText);
            }
        }
    }

    xhr.send();

    // jQuery code for get request. Doesn't work with jQuery Slim
    /*
    $.get('feedback.ajax.php?q=' + this.questions[this.q_id].c + '&yes=' + yes, function(data) {
        btn_yes.disabled = btn_no.disabled  = true;
    });
    */
}

// ======================================================
// Button actions for the current state
// ======================================================
Quiz.prototype.buttons = function() {
    var n = (this.s_id < this.s_len-1 && !this.questions[this.q_id].q[this.s_id+1]);

    this.btn_action.innerHTML = this.actions[this.s_id + n];

    if(this.CYCLE) {
        this.btn_action.disabled = false;
        this.btn_prev.disabled = this.btn_next.disabled = false;
    }
    else {
        this.btn_action.disabled = (this.q_id == this.q_len-1 &&     // Last question and last action
                                    this.s_id == this.s_len-1);
        //this.btn_prev.disabled = (this.q_id == 0);                 // First question
        this.btn_prev.disabled = (this.q_id == 0 && this.s_id == 0); // First question and first slide
        this.btn_next.disabled = (this.q_id == this.q_len-1);        // Last questions

        if(this.btn_action.disabled) {
            this.img_slide.setAttribute('disabled', 'disabled');
        }
        else {
            this.img_slide.removeAttribute('disabled');
        }
    }

    // Displaying vote buttons only for the questions has not been voted
    this.btn_yes.disabled = this.btn_no.disabled = (
        this.votes.includes(this.questions[this.q_id].c)
        // Uncomment the line below to enable vote buttons only on the slide with an answer
        //|| this.s_id != this.s_len-1
    );
}

// ======================================================
// Draws the slide only for the certain question
// ======================================================
Quiz.prototype.show_slide = function() {
    var q_id = this.q_id,
        s_id = this.s_id,
        q = this.questions[q_id].q,
        qt = this.questions[q_id].t,
        l = this.questions.length,
        t = this.types[this.questions[q_id].t];

    if(q[s_id]) {
        $('#question').fadeOut('fast', function() {
            $('#question-header').html('Question ' + (q_id+1) + ' of ' + l + ' &ndash; &laquo;' + t.h + '&raquo;');

            document.getElementById('question-header').className = 'question-type-' + qt;

            $('#question-slide').attr('src', q[s_id]);

            $(this).fadeIn('fast');
        });

        this.log('// show_slide');
    }
}

// ===============================================
// Next slide or question
// ===============================================
Quiz.prototype.next = function() {
    var q = this.questions[this.q_id].q;

    if(this.s_id < this.s_len-1) {
        this.s_id++;
        this.log('// next');

        if(!q[this.s_id]) this.next();
    }
    else {
        this.nextq();
    }
}

// ===============================================
// Next question
// ===============================================
Quiz.prototype.nextq = function() {
    if(this.q_id < this.q_len-1) {
        this.q_id++;
    }
    else if(this.CYCLE) {
        this.q_id = 0;
    }

    this.s_id = 0;

    this.log('// nextq');
}

// ===============================================
// Previous question
// ===============================================
Quiz.prototype.prevq = function() {
    if(this.q_id > 0) {
        this.q_id--;
    }
    else if(this.CYCLE) {
        this.q_id = this.q_len-1;
    }

    this.s_id = 0;

    this.log('// prevq');
}

// ===============================================
// Previous slide or question
// ===============================================
Quiz.prototype.prev = function() {
    var q = this.questions[this.q_id].q;

    // Let's move to the previous slide in the question
    if(this.s_id > 0) {
        this.s_id--;
        this.log('// prev');

        // No slide exists at current position. So, let's move back one more time
        if(!q[this.s_id]) this.prev();
    }
    // Let's move directly to the start position of the previous
    // question if the current question is also on the start position
    else {
        this.prevq();
    }
}

