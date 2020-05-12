var Tinkerforge = require('tinkerforge');
var TinkerforgeSegmentDisplayClock = require('./module-segment-display-4x7-clock.js');
var TinkerforgeLEDWall = require('./module-led-strip-wall.js');

var ipcon = new Tinkerforge.IPConnection();

var HOST = 'localhost';
var PORT = 4223;

// CONNECT
ipcon.connect(HOST, PORT,
    function (error) {
        console.log('Error: ' + error);
    }
);

// LED-WALL
var start_ledWall = function (connectReason) {
    var walls = [
        {
            uid: 'oV9',
            leds: 267
        },
        {
            uid: 'oWs',
            leds: 226
        }
    ];

    WALL = new TinkerforgeLEDWall(ipcon, walls, 29, 17);
    // WALL.setRectangle(5, 5, 4, 4, 255, 0, 255);
    // WALL.animationArmageddon(28,84,35, 16, true);
    WALL.setRectangle(16, 2, 2, 2, 255, 0, 255);
    // WALL.animationDigitalWatch(100,100,200);
    // WALL.setAll(3,3, 30);




};

ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED, start_ledWall);


// CLOCK
var start_segmentClock = function (connectReason) {

    var brightness = 2;
    var clock = new TinkerforgeSegmentDisplayClock(ipcon, 'pMU', 2);
    clock.start();

    setTimeout(function () {
        clock.fading(800, -1);
    }, 1000)
};


// ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED, start_segmentClock);


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



