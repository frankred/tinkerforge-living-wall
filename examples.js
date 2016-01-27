var Tinkerforge = require('tinkerforge');

var ipcon = new Tinkerforge.IPConnection();

var HOST = 'localhost';
var PORT = 4223;


// CONNECT
ipcon.connect(HOST, PORT,
    function (error) {
        console.log('Error: ' + error);
    }
);


ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED, function () {
    var x = new Tinkerforge.BrickletLEDStrip('oV9', ipcon);
    //x.setRGBValues(0, 16, [55, 55, 55, 55, 55, 0, 0, 55, 0, 0, 0, 0, 0, 0, 0, 0], [55, 55, 55, 55, 55, 0, 0, 55, 0, 0, 0, 0, 0, 0, 0, 0], [55, 55, 55, 55, 55, 0, 0, 55, 0, 0, 0, 0, 0, 0, 0, 0]);

    x.setRGBValues(6, 2, [55, 99, 99, 99, 99, 0, 0, 55, 0, 0, 0, 0, 0, 0, 0, 0],  [55, 99, 99, 55, 55, 0, 0, 55, 0, 0, 0, 0, 0, 0, 0, 0], [55, 55, 55, 55, 55, 0, 0, 55, 0, 0, 0, 0, 0, 0, 0, 0]);

   //x.setRGBValues(0, 16, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
});