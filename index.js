var Tinkerforge = require('tinkerforge');
require('./segment-display-4x7-clock');

var ipcon = new Tinkerforge.IPConnection();

var HOST = 'localhost';
var PORT = 4223;

ipcon.connect(HOST, PORT,
    function (error) {
        console.log('Error: ' + error);
    }
);

var tinkerforgeReady = function(connectReason){

    var brightness = 2;
    var clock = new TinkerforgeSegmentDisplayClock('pMU', ipcon, 2);
    clock.start();

    setTimeout(function(){
        clock.fading(800, -1);
    }, 1000)
}

ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED, tinkerforgeReady);


/* var poti = new Tinkerforge.BrickletLinearPoti('r73', ipcon);

ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED,
    function (connectReason) {
        // Set Period for position callback to 0.05s (50ms)
        // Note: The position position is only called every 50ms if the
        // position has changed since the last call!
        poti.setPositionCallbackPeriod(20);
    }
);

// Linear poti callback
poti.on(Tinkerforge.BrickletLinearPoti.CALLBACK_POSITION,
    function (position) {
        var number_array = toArray(position);
        var result_segments = [0x00, 0x00, 0x00, 0x00];
        for (var i = 0; i < number_array.length; i++) {
            result_segments[i] = DIGITS[number_array[i]];
        }
        segment.setSegments(result_segments, 2, false);
    }
);


function getRandom(from, to) {
    return Math.floor((Math.random() * to) + from);
}

 */
