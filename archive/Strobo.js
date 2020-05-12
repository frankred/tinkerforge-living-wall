var Tinkerforge = require('tinkerforge');

var HOST = localhost;
var PORT = 4223;
var UID  = 'p3g'; // Change to your UID
var leds = 200;

var ipcon = new Tinkerforge.IPConnection(); // Create IP connection
var ls = new Tinkerforge.BrickletLEDStrip(UID, ipcon); // Create device object
var current_state = true;

ipcon.connect(HOST, PORT,
    function(error) {
        console.log('Error: '+error);
    }
); // Connect to brickd
// Don't use device before ipcon is connected

ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED,
    function(connectReason) {
        ls.setFrameDuration(30);
        ledstrip_set_color( 10, 10, 10 );
    }
);

ls.on(Tinkerforge.BrickletLEDStrip.CALLBACK_FRAME_RENDERED,
    function(len) {
        if ( current_state ) {
            ledstrip_set_color( 0, 0, 0 );
        }
        else {
            var rgbrand = [ 0, ledstrip_random_color(), ledstrip_random_color() ];
            shuffle(rgbrand);

            ledstrip_set_color( rgbrand[0], rgbrand[1], rgbrand[2] );
        }

        current_state = !current_state;
    }
);

console.log("Press any key to exit ...");
process.stdin.on('data',
    function(data) {
        ipcon.disconnect();
        process.exit(0);
    }
);



function ledstrip_set_color( r, g, b ) {
    var loops = Math.ceil( leds / 16 );

    for (i = 0; i < loops; i++) { 
        // Set first 10 LEDs to green
        var r_array = Array.apply(null, new Array(leds)).map(Number.prototype.valueOf,r);
        var g_array = Array.apply(null, new Array(leds)).map(Number.prototype.valueOf,g);
        var b_array = Array.apply(null, new Array(leds)).map(Number.prototype.valueOf,b);
        ls.setRGBValues(i*16, 16, r_array, g_array, b_array);
    }
}

function ledstrip_random_color() {
    return Math.floor((Math.random() * 255) + 1);
}

function shuffle(o) {
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}