module.exports = {
    store: function (num, obj) {
        localStorage.setItem(num, JSON.stringify(obj));
    },
    load: function (num) {
        return JSON.parse(localStorage.getItem(num));
    },
    remove: function (num) {
        localStorage.removeItem(num);
    }
};
