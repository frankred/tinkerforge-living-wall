var debug = require('debug');
var moment = require('moment');
var TinkerforgeLEDWallMatrix = require('./module-led-strip-wall-matrix.js');
var Tinkerforge = require('tinkerforge');

var MAX_LED_CHANGE_AMOUT = 16;

Array.prototype.setAll = function (v) {
    var i, n = this.length;
    for (i = 0; i < n; ++i) {
        this[i] = v;
    }
};

function TinkerforgeLEDWall(ipcon, walls, width, height) {
    this.ipcon = ipcon;
    this.walls = walls;
    this.height = height;
    this.width = width;

    this.animations = [];

    this.debug = debug('led-strip-wall');

    var createFromToIndexes = function (walls_arr) {
        var index_counter = 0;
        for (var i = 0; i < walls_arr.length; i++) {
            walls_arr[i].from = index_counter;
            walls_arr[i].to = index_counter + walls_arr[i].leds - 1;
            walls_arr[i].index_substraction = index_counter;
            index_counter = walls_arr[i].leds;
        }

        return walls_arr;
    };

    this.walls = createFromToIndexes(this.walls);
    this.debug('walls: ' + this.walls);

    this.bricklets = this.initBricklets(ipcon);
    this.matrix = new TinkerforgeLEDWallMatrix(this.width, this.height, this.walls);
};

TinkerforgeLEDWall.prototype.initBricklets = function (ipcon) {
    for (var i = 0; i < this.walls.length; i++) {
        this.walls[i].bricklet = new Tinkerforge.BrickletLEDStrip(this.walls[i].uid, ipcon);
        this.walls[i].bricklet.setChipType(Tinkerforge.BrickletLEDStrip.CHIP_TYPE_WS2811);
        this.walls[i].bricklet.setFrameDuration(1);
    }

    this.setAll(0, 0, 0);
};


TinkerforgeLEDWall.prototype.setLED = function (x, y, r, g, b) {
    var index = this.calcIndex(x, y);

    for (var i = 0; i < this.walls.length; i++) {
        this.walls[i].bricklet.setRGBValues(0, 10, r, g, b);
    }
};


var COLOR_PERCENTAGE_100 = [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255];
var COLOR_PERCENTAGE_0 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


TinkerforgeLEDWall.prototype.setAll = function (r, g, b, renderCallback) {

    var r_array = Array.apply(null, new Array(16)).map(Number.prototype.valueOf, r);
    var g_array = Array.apply(null, new Array(16)).map(Number.prototype.valueOf, g);
    var b_array = Array.apply(null, new Array(16)).map(Number.prototype.valueOf, b);

    for (var i = 0; i < this.walls.length; i++) {
        var loops = Math.ceil(this.walls[i].leds / 16);
        for (j = 0; j < loops; j++) {
            this.walls[i].bricklet.setRGBValues(j * 16, 16, r_array, g_array, b_array);
        }
    }
};

TinkerforgeLEDWall.prototype.set = function (x, y, r, g, b) {

    var r_array = Array.apply(null, new Array(16)).map(Number.prototype.valueOf, 0);
    var g_array = Array.apply(null, new Array(16)).map(Number.prototype.valueOf, 0);
    var b_array = Array.apply(null, new Array(16)).map(Number.prototype.valueOf, 0);

    r_array[0] = r;
    g_array[0] = g;
    b_array[0] = b;

    for (var i = 0; i < this.walls.length; i++) {
        var wallIndex = this.matrix.matrix[x][y].wall_number;
        var led_index = this.matrix.matrix[x][y].wall_led_index;
        this.walls[wallIndex].bricklet.setRGBValues(led_index, 1, r_array, g_array, b_array);
    }
};

TinkerforgeLEDWall.prototype.setRectangle = function (x, y, width, height, r, g, b) {
    this.debug('matrix.setRectangle(' + x + ',' + y + ',' + width + ',' + height + ',' + r + ',' + g + ',' + b + ');');
    this.matrix.setRectangle(x, y, width, height, r, g, b);
};

TinkerforgeLEDWall.prototype.draw = function () {
    this.matrix.draw();
}

TinkerforgeLEDWall.prototype.animationArmageddon = function (r, g, b, delta_ms, random_colors) {
    var self = this;
    var x = 0;
    var y = 0;
    var reset_counter = 0;
    var limit = this.width * this.height;

    this.animations.push(setInterval(function () {
        self.set(x++ % self.width, y++ % self.height, r, g, b);
        reset_counter++;
        if (reset_counter >= limit) {
            x = 0;
            y = 0;
            self.setAll(0, 0, 0);
            reset_counter = 0;

            if (random_colors) {
                var rand_colors = [0, self.randomColor(), self.randomColor()];
                self.shuffle(rand_colors)
                r = rand_colors[0];
                g = rand_colors[1];
                b = rand_colors[2];
            }
        }
    }, delta_ms));
};

TinkerforgeLEDWall.prototype.randomColor = function () {
    return Math.floor((Math.random() * 255) + 1);
};

TinkerforgeLEDWall.prototype.shuffle = function (array) {
    for (var j, x, i = array.length; i; j = Math.floor(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x);
    return array;
}

TinkerforgeLEDWall.prototype.animationTallySheet = function (r, g, b, delta_ms) {
    var self = this;
    var x = 0;
    var y = 0;

    this.animations.push(setInterval(function () {
        self.set(x, y, r, g, b);

        y = ++y % self.height;
        if (y == 0) {
            x = ++x % self.width;
            if (x == 0) {
                self.setAll(0, 0, 0);
            }
        }

    }, delta_ms));
};


TinkerforgeLEDWall.prototype.animationDigitalWatch = function (r, g, b) {
    var self = this;

    this.stopAnimations();

    var drawDots = function () {
        var dots_diameter = parseInt(self.height / 5);
        var x_center = self.width / 2;
        var y_center = self.height / 2;
        var center_rect_x = x_center - dots_diameter / 2;
        var center_rect_y = y_center - dots_diameter / 2;

        self.setRectangle(parseInt(center_rect_x), parseInt(center_rect_y - self.height / 5) + 1, dots_diameter, dots_diameter, r, g, b);
        self.setRectangle(parseInt(center_rect_x), parseInt(center_rect_y + self.height / 5), dots_diameter, dots_diameter, r, g, b);


        self.draw();
    };
    drawDots();
};


TinkerforgeLEDWall.prototype.stopAnimations = function () {
    for (var i = 0; i < this.animations.length; i++) {
        clearInterval(this.animations[i]);
    }
    this.setAll(0, 0, 0);
};


TinkerforgeLEDWall.prototype.startStrobo = function (r, g, b, timeBright, timeDark) {

    var self = this;

    var stroboId = setInterval(function () {
        self.setAll(r, g, b);
        setTimeout(function () {
            self.setAll(0, 0, 50);
        }, timeBright);
    }, timeDark);
};

module.exports = TinkerforgeLEDWall;