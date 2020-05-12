var ksort = require('ksort');
var ksort_compare_func = function (a, b) {
    return a.index < b.index;
};
var debug = require('debug');


function TinkerforgeLEDWallMatrix(width, height, walls) {
    this.debug = debug('led-strip-wall:matrix');

    this.walls = walls;
    this.width = width;
    this.height = height;
    this.matrix = this.generateMatrix();
    this.register = new Array(walls.length);

    this.draw_r_array = Array.apply(null, new Array(16)).map(Number.prototype.valueOf, 0);
    this.draw_g_array = Array.apply(null, new Array(16)).map(Number.prototype.valueOf, 0);
    this.draw_b_array = Array.apply(null, new Array(16)).map(Number.prototype.valueOf, 0);

    for (var i = 0; i < this.register.length; i++) {
        this.register[i] = [];
    }
    this.debug('matrix generated: ', this.matrix);
};

TinkerforgeLEDWallMatrix.prototype.generateMatrix = function () {
    var matrix = [];
    for (var i = 0; i < this.width; i++) {
        var line = [];
        for (var j = 0; j < this.height; j++) {
            var index = this.calcIndex(i, j, this.height);
            var wall_number = this.getWallByLEDIndex(index);
            var pixel = {
                r: 0,
                g: 0,
                b: 0,
                index: index,
                wall_number: wall_number,
                wall_led_index: index - this.walls[wall_number].index_substraction
            };

            line.push(pixel);
        }
        matrix.push(line);
    }
    return matrix;
};

TinkerforgeLEDWallMatrix.prototype.getWallByLEDIndex = function (index) {
    for (var i = 0; i < this.walls.length; i++) {
        if (index >= this.walls[i].from && index <= this.walls[i].to) {
            return i;
        }
    }
};

TinkerforgeLEDWallMatrix.prototype.calcIndex = function (x, y, height) {
    if (x % 2 === 0) {
        // Even
        // return (height * (x +1)) - y - 1;
        return height * x + height - y - 1;
    }
    // Odd
    return height * x + y;
};


TinkerforgeLEDWallMatrix.prototype.setRectangle = function (x, y, width, height, r, g, b) {
    this.debug("register: ", this.register);

    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {
            this.register[this.matrix[x + i][y + j].wall_number].push({
                r: r,
                g: g,
                b: b,
                index: this.matrix[x + i][y + j].wall_led_index
            });
        }
    }

    for (var i = 0; i < this.register.length; i++) {
        this.register[i] = ksort(this.register[i], ksort_compare_func);
    }

    this.debug("register: \n" + JSON.stringify(this.register, null, 4));
};

TinkerforgeLEDWallMatrix.prototype.draw = function () {

    var self = this;

    if (this.register.length == 0) {
        return;
    }

    for (var i = 0; i < this.register.length; i++) {

        var wall_number = i;
        var me;
        var next;
        var start;
        var amount;

        var flush = function (start, amount, wall_number, current_index) {
            for (var p = 0; p < amount; p++) {
                self.draw_r_array[p] = self.register[wall_number][current_index - p].r;
                self.draw_g_array[p] = self.register[wall_number][current_index - p].g;
                self.draw_b_array[p] = self.register[wall_number][current_index - p].b;
            }

            self.debug('R ' + self.draw_r_array);
            self.debug('G ' + self.draw_g_array);
            self.debug('B ' + self.draw_b_array);

            self.debug('setRGBValues(' + start + ',' + amount + ")");
            self.walls[i].bricklet.setRGBValues(start, amount, self.draw_r_array, self.draw_g_array, self.draw_b_array);
            self.debug('\n');
        };

        for (var j = 0; j < this.register[i].length; j++) {
            me = this.register[i][j];
            next = this.register[i][j + 1];

            self.debug('current: ' + me.index + ' on wall ' + wall_number);

            // First
            if (j == 0) {
                start = me.index;
                amount = 1;
            }

            // Last
            if (!next) {
                flush(start, amount, wall_number, j);
                break;
            }

            // Number break
            if (this.isNotNextNumber(me.index, next.index)) {
                flush(start, amount, wall_number, j);
                amount = 1;
                start = next.index;
            } else {
                amount++;
            }
        }
    }
};

TinkerforgeLEDWallMatrix.prototype.isNotNextNumber = function (a, b) {
    if (a + 1 == b) {
        return false;
    }
    return true;
};

module.exports = TinkerforgeLEDWallMatrix;
