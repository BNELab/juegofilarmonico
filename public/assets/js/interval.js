(function(){
var index = 1;
var intervals = {},
    timeouts = {};

function postMessageHandler(e) {
    window.postMessage('', "*");

    var now = new Date().getTime();

    sysFunc._each.call(timeouts, function(ind, obj) {
        var targetTime = obj[1];

        if (now >= targetTime) {
            obj[0]();
            delete timeouts[ind];
        }
    });
    sysFunc._each.call(intervals, function(ind, obj) {
        var startTime = obj[1];
        var func = obj[0];
        var ms = obj[2];

        if (now >= startTime + ms) {
            func();
            obj[1] = new Date().getTime();
        }
    });
}
window.addEventListener("message", postMessageHandler, true);
window.postMessage('', "*");

function _setTimeout(func, ms) {
    timeouts[index] = [func, new Date().getTime() + ms];
    return index++;
}

function _setInterval(func, ms) {
    intervals[index] = [func, new Date().getTime(), ms];
    return index++;
}

function _clearInterval(ind) {
    if (intervals[ind]) {
        delete intervals[ind]
    }
}
function _clearTimeout(ind) {
    if (timeouts[ind]) {
        delete timeouts[ind]
    }
}

var intervalIndex = _setInterval(function() {
    console.log('every 100ms');
}, 100);
_setTimeout(function() {
    console.log('run after 200ms');
}, 200);
_setTimeout(function() {
    console.log('closing the one that\'s 100ms');
    _clearInterval(intervalIndex)
}, 2000);

window._setTimeout = _setTimeout;
window._setInterval = _setInterval;
window._clearTimeout = _clearTimeout;
window._clearInterval = _clearInterval;
})();