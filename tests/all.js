var assert = require("assert");

require('../segment-display-4x7-clock.js');

describe('living wall tests', function () {

    describe('segment-display-4x7-clock', function () {

        var clock = new TinkerforgeSegmentDisplayClock();

        it('toSegmentDisplay', function () {
            assert.deepEqual([clock.digits[1], clock.digits[2], clock.digits[3], clock.digits[4]], clock.toSegmentDisplay("1234"));
            assert.deepEqual([0x00, clock.digits[1], clock.digits[2], clock.digits[3]], clock.toSegmentDisplay("123"));

        });

        it('toNumberArray', function () {
            assert.deepEqual(clock.toNumberArray("0"), [0]);
            assert.deepEqual(clock.toNumberArray("0000"), [0, 0, 0, 0]);
            assert.deepEqual(clock.toNumberArray("1337"), [1, 3, 3, 7]);
            assert.deepEqual(clock.toNumberArray("0337"), [0, 3, 3, 7]);
        });
    });
});