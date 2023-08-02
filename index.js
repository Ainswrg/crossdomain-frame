(function () {
    "use strict";

    var LocationTypes;
    (function (LocationTypes) {
        LocationTypes["OnPage"] = "onpage";
        LocationTypes["SameDomainFrame"] = "samedomainiframe";
        LocationTypes["CrossDomainFrame"] = "crossdomainframe";
    })(LocationTypes || (LocationTypes = {}));
    var PLACEMENT_SYSTEMS = [
        { system: "doubleclick", parameter: "url" },
        { system: "betweendigital", parameter: "ref" },
        { system: "vidroll.ru", parameter: "wpl" },
        { system: "video-play.ru", parameter: "wpl" }
    ];

    var MyLocation = /** @class */ (function () {
        function MyLocation() {
            if (MyLocation._instance)
                return MyLocation._instance;
            MyLocation._instance = this;
            this.analyzeLocation();
        }
        MyLocation.prototype.analyzeLocation = function () {
            var _a;
            var assumedTopRef = window.location.href;
            if (window.top === window) {
                // такая запись для того чтобы инитить readonly свойства в методе, а не в конструкторе
                this._location = LocationTypes.OnPage;
                this._topWin = window;
            }
            else {
                this._topWin = window.top;
                try {
                    (_a = window.top) === null || _a === void 0 ? void 0 : _a.location.href; // если в кроссдоменном фрейме выбросится ошибка 
                    assumedTopRef = this._topWin.location.href;
                    this._location = LocationTypes.SameDomainFrame;
                }
                catch (_) {
                    this._location = LocationTypes.CrossDomainFrame;
                    assumedTopRef = window.document.referrer || window.location.href;
                }
            }
            // поиск по параметру в других системах 
            for (var _i = 0, PLACEMENT_SYSTEMS_1 = PLACEMENT_SYSTEMS; _i < PLACEMENT_SYSTEMS_1.length; _i++) {
                var _b = PLACEMENT_SYSTEMS_1[_i], system = _b.system, parameter = _b.parameter;
                if (!assumedTopRef.includes(system))
                    continue;
                var valFromSystem = new URL(assumedTopRef).searchParams.get(parameter);
                if (valFromSystem) {
                    assumedTopRef = valFromSystem;
                    break;
                }
            }
            if (window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0) {
                var topAncestorOrigin = window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1];
                if (topAncestorOrigin.replace(/^(https|http):\/\//, "") !== assumedTopRef.replace(/^(https|http):\/\//, ""))
                    assumedTopRef = topAncestorOrigin;
            }
            this._topRef = assumedTopRef;
        };
        Object.defineProperty(MyLocation.prototype, "topReferrer", {
            get: function () {
                return this._topRef;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MyLocation.prototype, "topWindow", {
            get: function () {
                return this._topWin;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MyLocation.prototype, "onPage", {
            get: function () {
                return this._location === LocationTypes.OnPage;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MyLocation.prototype, "inCrossDomainFrame", {
            get: function () {
                return this._location === LocationTypes.CrossDomainFrame;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MyLocation.prototype, "inSameDomainFrame", {
            get: function () {
                return this._location === LocationTypes.SameDomainFrame;
            },
            enumerable: false,
            configurable: true
        });
        return MyLocation;
    }());

    var myLocation = new MyLocation();
    console.log("Location: ", myLocation.onPage ? "On Page" : "Not On Page");
    console.log("Location1: ", myLocation.inSameDomainFrame ? "Same Domain Frame" : "Not Same Domain Frame");
    console.log("Location2: ", myLocation.inCrossDomainFrame ? "Cross Domain Frame" : "Not Cross Domain Frame");
    console.log("Top Referrer: ", myLocation.topReferrer);
    console.log("Top Window: ", myLocation.topWindow);

    var messageData = "\n    Location: "
        .concat(myLocation.onPage ? "On Page" : "Not On Page", "<br>\n    Location1: ")
        .concat(myLocation.inSameDomainFrame ? "Same Domain Frame" : "Not Same Domain Frame", "<br>\n    Location2: ")
        .concat(myLocation.inCrossDomainFrame ? "Cross Domain Frame" : "Not Cross Domain Frame", "<br>\n    TopReferrer: ")
        .concat(myLocation.topReferrer, "<br>\n    TopWindow: ");
    document.body.innerHTML = messageData;
})();
// console.log("Location: ", myLocation.onPage ? "On Page" : "Not On Page");
// console.log("Location1: ", myLocation.inSameDomainFrame ? "Same Domain Frame" : "Not Same Domain Frame");
// console.log("Location2: ", myLocation.inCrossDomainFrame ? "Cross Domain Frame" : "Not Cross Domain Frame");
// console.log("Top Referrer: ", myLocation.topReferrer);
// console.log("Top Window: ", myLocation.topWindow);
