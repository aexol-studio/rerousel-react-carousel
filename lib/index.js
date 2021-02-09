"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rerousel = void 0;
var react_1 = __importStar(require("react"));
var typestyle_1 = require("typestyle");
var wrapper = typestyle_1.style({
    display: 'flex',
    alignItems: 'center',
    overflowX: 'scroll',
    scrollSnapType: 'x mandatory',
    '-webkit-overflow-scrolling': 'touch',
    flexFlow: 'row nowrap',
    '-ms-overflow-style': 'none',
    scrollbarWidth: 'none',
    $nest: {
        '& > *': {
            boxSizing: 'border-box',
            flexShrink: 0,
        },
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
});
var Rerousel = function (_a) {
    var children = _a.children, itemRef = _a.itemRef, _b = _a.interval, interval = _b === void 0 ? 3000 : _b;
    var itemWidth = useWidth(itemRef)[0];
    var _c = react_1.useState(), setScrollInterval = _c[1];
    var _d = react_1.useState(0), currentScrollLeft = _d[0], setCurrentScrollLeft = _d[1];
    var wrapperRef = react_1.useRef(null);
    var cc = react_1.Children.count(children);
    function useWidth(elementRef) {
        var _a = react_1.useState(0), width = _a[0], setWidth = _a[1];
        var updateWidth = react_1.useCallback(function () {
            if (elementRef && elementRef.current) {
                var width_1 = elementRef.current.getBoundingClientRect().width;
                setWidth(width_1);
            }
        }, [elementRef]);
        react_1.useEffect(function () {
            updateWidth();
            window.addEventListener('resize', updateWidth);
            return function () {
                window.removeEventListener('resize', updateWidth);
            };
        }, [updateWidth]);
        return [width];
    }
    react_1.useEffect(function () {
        var _a, _b;
        if (currentScrollLeft === 0) {
            (_a = wrapperRef.current) === null || _a === void 0 ? void 0 : _a.scrollTo({ left: 0 });
            setCurrentScrollLeft(1);
            return;
        }
        if (currentScrollLeft > cc) {
            setCurrentScrollLeft(0);
            return;
        }
        if (itemWidth != undefined) {
            (_b = wrapperRef.current) === null || _b === void 0 ? void 0 : _b.scrollTo({
                left: itemWidth * currentScrollLeft,
                behavior: 'smooth',
            });
        }
    }, [currentScrollLeft, itemWidth]);
    react_1.useEffect(function () {
        var i = setInterval(function () {
            setCurrentScrollLeft(function (csl) { return csl + 1; });
        }, interval);
        setScrollInterval(i);
        return function () {
            setScrollInterval(function (i) {
                if (i) {
                    clearInterval(i);
                }
                return undefined;
            });
        };
    }, [itemWidth]);
    return (react_1.default.createElement("div", { className: wrapper, ref: wrapperRef },
        children,
        children));
};
exports.Rerousel = Rerousel;
//# sourceMappingURL=index.js.map