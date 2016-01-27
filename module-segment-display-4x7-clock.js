var Tinkerforge = require('tinkerforge');
var moment = require('moment');
var debug = require('debug');
var Tweenable = require('shifty');

var DIGITS = [
    0x3f,   // 0
    0x06,   // 1
    0x5b,   // 2
    0x4f,   // 3
    0x66,   // 4
    0x6d,   // 5
    0x7d,   // 6
    0x07,   // 7
    0x7f,   // 8
    0x6f    // 8
];

var ONE_SECOND = 1000;

TinkerforgeSegmentDisplayClock = function (ipcon, uid, brightness) {
    this.ipcon = ipcon;
    this.uid = uid;
    this.digits = DIGITS;
    this.format = "hmm";
    this.bricklet = new Tinkerforge.BrickletSegmentDisplay4x7(uid, ipcon);
    this.tweenable = new Tweenable();

    this.debug_tick = debug('4x7-segment-display:tick');
    this.debug_convert = debug('4x7-segment-display:convert');
    this.debug_draw = debug('4x7-segment-display:draw');

    this.disabled = false;
    this.brightness = brightness;
    this.segments = [0x00, 0x00, 0x00, 0x00];
    this.show_colon = true;

    this.defaults = {
        fading: {
            duration: 800,
            amount: 1
        },
        strobo: {
            duration: 100,
            amount: 5
        }
    };
};

TinkerforgeSegmentDisplayClock.prototype.start = function () {
    var self = this;

    var tick = function () {
        var now = moment().format(self.format);
        self.timeToSegments(now);
        self.draw()
        self.debug_tick(now + " => " + JSON.stringify(self.segments) + " => show colon: " + self.show_colon);
        self.toggleColon();
    };

    tick();

    setTimeout(tick, ONE_SECOND);
};


TinkerforgeSegmentDisplayClock.prototype.toggleColon = function () {
    this.show_colon = !this.show_colon;
};

TinkerforgeSegmentDisplayClock.prototype.fading = function (duration, amount) {
    var self = this;

    amount = amount ? amount : this.defaults.fading.amount;
    duration = duration ? duration : this.defaults.fading.duration;

    var infinity = amount < 0;

    var lastStepValue = 0;
    var step = function (data) {
        self.brightness = Math.floor(data.x);

        if (self.brightness == 0) {
            self.disabled = true;
        } else {
            self.disabled = false;
        }

        self.draw();
        lastStepValue = self.brightness;
    };

    var finish = function () {
        if (!infinity) {
            --amount;
            if (amount == 0) {
                return;
            }
        }
        self.tweenable.tween(tweenFromLowToHigh);
    };

    var tweenFromLowToHigh = {
        from: {x: 0},
        to: {x: 6.999},
        duration: duration,
        easing: 'linear',
        step: step,
        finish: finish
    };

    this.tweenable.tween(tweenFromLowToHigh);
};

TinkerforgeSegmentDisplayClock.prototype.timeToSegments = function (time) {
    var timeNumbersArray = this.toNumberArray(time);
    this.debug_convert(time + " => " + JSON.stringify(timeNumbersArray));

    this.segmentsToZero();

    var j = this.segments.length - 1;
    for (var i = timeNumbersArray.length - 1; i >= 0; i--) {
        this.segments[j] = this.digits[timeNumbersArray[i]];
        j--;
    }
};

TinkerforgeSegmentDisplayClock.prototype.segmentsToZero = function () {
    this.segments[0] = 0x00;
    this.segments[1] = 0x00;
    this.segments[2] = 0x00;
    this.segments[3] = 0x00;
};

TinkerforgeSegmentDisplayClock.prototype.toNumberArray = function (time) {
    return time.replace(/\D/g, '0').split('').map(Number);
};

TinkerforgeSegmentDisplayClock.prototype.draw = function () {
    this.debug_draw(JSON.stringify(this.segments) + " " + this.brightness + " " + this.show_colon);
    this.bricklet.setSegments(this.disabled ? [0x00, 0x00, 0x00, 0x00] : this.segments, this.brightness, this.show_colon);
};


module.exports = TinkerforgeSegmentDisplayClock;