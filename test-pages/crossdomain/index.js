(function () {
    "use strict";

    var LocationTypes;
    (function (LocationTypes) {
        LocationTypes["OnPage"] = "onpage";
        LocationTypes["SameDomainFrame"] = "samedomainiframe";
        LocationTypes["CrossDomainFrame"] = "crossdomainframe";
    })(LocationTypes || (LocationTypes = {}));
    const PLACEMENT_SYSTEMS = [
        { system: "doubleclick", parameter: "url" },
        { system: "betweendigital", parameter: "ref" },
        { system: "vidroll.ru", parameter: "wpl" },
        { system: "video-play.ru", parameter: "wpl" },
    ];

    class MyLocation {
        static _instance;
        _location;
        _topWin;
        _topRef;
        constructor() {
            if (MyLocation._instance) return MyLocation._instance;
            MyLocation._instance = this;
            this.analyzeLocation();
        }
        analyzeLocation() {
            let assumedTopRef = window.location.href;
            if (window.top === window) {
                // такая запись для того чтобы инитить readonly свойства в методе, а не в конструкторе
                this._location = LocationTypes.OnPage;
                this._topWin = window;
            } else {
                this._topWin = window.top;
                try {
                    window.top?.location.href; // если в кроссдоменном фрейме выбросится ошибка
                    assumedTopRef = this._topWin.location.href;
                    this._location = LocationTypes.SameDomainFrame;
                } catch (_) {
                    this._location = LocationTypes.CrossDomainFrame;
                    assumedTopRef = window.document.referrer || window.location.href;
                }
            }
            // поиск по параметру в других системах
            for (const { system, parameter } of PLACEMENT_SYSTEMS) {
                if (!assumedTopRef.includes(system)) continue;
                const valFromSystem = new URL(assumedTopRef).searchParams.get(parameter);
                if (valFromSystem) {
                    assumedTopRef = valFromSystem;
                    break;
                }
            }
            if (window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0) {
                const topAncestorOrigin = window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1];
                if (topAncestorOrigin.replace(/^(https|http):\/\//, "") !== assumedTopRef.replace(/^(https|http):\/\//, ""))
                    assumedTopRef = topAncestorOrigin;
            }
            this._topRef = assumedTopRef;
        }
        get topReferrer() {
            return this._topRef;
        }
        get topWindow() {
            return this._topWin;
        }
        get onPage() {
            return this._location === LocationTypes.OnPage;
        }
        get inCrossDomainFrame() {
            return this._location === LocationTypes.CrossDomainFrame;
        }
        get inSameDomainFrame() {
            return this._location === LocationTypes.SameDomainFrame;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    var myLocation = new MyLocation();
    // console.log("Location: ", myLocation.onPage ? "On Page" : "Not On Page");
    // console.log("Location1: ", myLocation.inSameDomainFrame ? "Same Domain Frame" : "Not Same Domain Frame");
    // console.log("Location2: ", myLocation.inCrossDomainFrame ? "Cross Domain Frame" : "Not Cross Domain Frame");
    // console.log("Top Referrer: ", myLocation.topReferrer);
    // console.log("Top Window: ", myLocation.topWindow);
    window.onload = function () {
        window.parent.postMessage({
            type: "myLocationData",
            location: myLocation.inCrossDomainFrame ? "Cross Domain Frame" : "Not Cross Domain Frame",
            topReferrer: myLocation.topReferrer,
        }, "https://ainswrg.github.io");
    };
})();
