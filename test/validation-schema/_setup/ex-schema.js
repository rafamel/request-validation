'use strict';

module.exports = () => ({
    a: {
        a: {
            a: 1,
            b: 2,
            c: {
                a: {
                    a: 3
                },
                b: 4
            }
        },
        b: 5
    },
    b: {
        a: 6,
        b: {
            a: 7
        }
    },
    c: {
        a: {
            a: 8,
            b: 9
        },
        b: 10,
        c: 11
    }
});
