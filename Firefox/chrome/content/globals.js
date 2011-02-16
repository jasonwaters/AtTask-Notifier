Function.prototype.bind = function(obj) {
    var method = this,
    temp = function() {
        return method.apply(obj, arguments);
    };
    return temp;
};