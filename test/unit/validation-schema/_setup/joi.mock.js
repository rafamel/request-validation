'use strict';

const mockPresenceKeys = jest.fn(function (type, keys) {
    if (!this.presenceKeys.hasOwnProperty(type)) {
        this.presenceKeys[type] = keys;
        return this;
    }
    this.presenceKeys[type] = this.presenceKeys[type].concat(keys);
    return this;
});

const mockConcat = jest.fn(function (other) {
    this.id = [this.id, other.id];
    return this;
});

jest.mock('joi', () => {
    let mockId = 0;
    const type = () => ({
        isJoi: true,
        id: mockId++,
        presenceKeys: {},
        concat: mockConcat
    });
    return {
        any: type,
        object() {
            return Object.assign(type(), {
                requiredKeys(keys) { return mockPresenceKeys.call(this, 'required', keys); },
                optionalKeys(keys) { return mockPresenceKeys.call(this, 'optional', keys); },
                forbiddenKeys(keys) { return mockPresenceKeys.call(this, 'forbidden', keys); }
            });
        }
    };
});

module.exports = {
    mockConcat,
    mockPresenceKeys,
    removeMockFns(...objs) {
        function remove(inObj) {
            if (typeof inObj !== 'object') return;
            Object.getOwnPropertyNames(inObj).filter(key => {
                try {
                    return typeof inObj[key] === 'function';
                } catch (e) { return false; }
            }).forEach(key => { delete inObj[key]; });
            Object.keys(inObj).forEach(key => {
                remove(inObj[key]);
            });
        }
        objs.forEach(obj => remove(obj));
    }
};
