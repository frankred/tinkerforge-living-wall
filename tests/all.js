var assert = require("assert");

var Watch = require('../module-segment-display-4x7-clock.js');
var Wall = require('../module-led-strip-wall.js');

describe('living wall tests', function () {

    describe('segment-display-4x7-clock', function () {

        var clock = new Watch();

        it('toNumberArray', function () {
            assert.deepEqual(clock.toNumberArray("0"), [0]);
            assert.deepEqual(clock.toNumberArray("0000"), [0, 0, 0, 0]);
            assert.deepEqual(clock.toNumberArray("1337"), [1, 3, 3, 7]);
            assert.deepEqual(clock.toNumberArray("0337"), [0, 3, 3, 7]);
        });
    });


    describe('led-strip-wall', function () {



        it('calcIndex', function () {
            var wall = new Wall();
            var matrix = wall.createMatrix(5, 4);
            assert.deepEqual(matrix, [
                [3 , 2, 1, 0],
                [4 , 5, 6, 7],
                [11 , 10, 9, 8],
                [12 , 13, 14, 15],
                [19 , 18, 17, 16]
            ]);
        });
    });
});