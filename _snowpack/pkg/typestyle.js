/**
 * The unique id is used for unique hashes.
 */
let uniqueId = 0;
/**
 * Quick dictionary lookup for unit-less numbers.
 */
const CSS_NUMBER = Object.create(null);
/**
 * CSS properties that are valid unit-less numbers.
 *
 * Ref: https://github.com/facebook/react/blob/master/packages/react-dom/src/shared/CSSProperty.js
 */
const CSS_NUMBER_KEYS = [
    "animation-iteration-count",
    "border-image-outset",
    "border-image-slice",
    "border-image-width",
    "box-flex",
    "box-flex-group",
    "box-ordinal-group",
    "column-count",
    "columns",
    "counter-increment",
    "counter-reset",
    "flex",
    "flex-grow",
    "flex-positive",
    "flex-shrink",
    "flex-negative",
    "flex-order",
    "font-weight",
    "grid-area",
    "grid-column",
    "grid-column-end",
    "grid-column-span",
    "grid-column-start",
    "grid-row",
    "grid-row-end",
    "grid-row-span",
    "grid-row-start",
    "line-clamp",
    "line-height",
    "opacity",
    "order",
    "orphans",
    "tab-size",
    "widows",
    "z-index",
    "zoom",
    // SVG properties.
    "fill-opacity",
    "flood-opacity",
    "stop-opacity",
    "stroke-dasharray",
    "stroke-dashoffset",
    "stroke-miterlimit",
    "stroke-opacity",
    "stroke-width"
];
// Add vendor prefixes to all unit-less properties.
for (const property of CSS_NUMBER_KEYS) {
    for (const prefix of ["-webkit-", "-ms-", "-moz-", "-o-", ""]) {
        CSS_NUMBER[prefix + property] = true;
    }
}
/**
 * Transform a JavaScript property into a CSS property.
 */
function hyphenate(propertyName) {
    return propertyName
        .replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
        .replace(/^ms-/, "-ms-"); // Internet Explorer vendor prefix.
}
/**
 * Generate a hash value from a string.
 */
function stringHash(str) {
    let value = 5381;
    let len = str.length;
    while (len--)
        value = (value * 33) ^ str.charCodeAt(len);
    return (value >>> 0).toString(36);
}
/**
 * Transform a style string to a CSS string.
 */
function styleToString(key, value) {
    if (value && typeof value === "number" && !CSS_NUMBER[key]) {
        return `${key}:${value}px`;
    }
    return `${key}:${value}`;
}
/**
 * Sort an array of tuples by first value.
 */
function sortTuples(value) {
    return value.sort((a, b) => (a[0] > b[0] ? 1 : -1));
}
/**
 * Categorize user styles.
 */
function parseStyles(styles, hasNestedStyles) {
    const properties = [];
    const nestedStyles = [];
    // Sort keys before adding to styles.
    for (const key of Object.keys(styles)) {
        const name = key.trim();
        const value = styles[key];
        if (name.charCodeAt(0) !== 36 /* $ */ && value != null) {
            if (typeof value === "object" && !Array.isArray(value)) {
                nestedStyles.push([name, value]);
            }
            else {
                properties.push([hyphenate(name), value]);
            }
        }
    }
    return {
        style: stringifyProperties(sortTuples(properties)),
        nested: hasNestedStyles ? nestedStyles : sortTuples(nestedStyles),
        isUnique: !!styles.$unique
    };
}
/**
 * Stringify an array of property tuples.
 */
function stringifyProperties(properties) {
    return properties
        .map(([name, value]) => {
        if (!Array.isArray(value))
            return styleToString(name, value);
        return value.map(x => styleToString(name, x)).join(";");
    })
        .join(";");
}
/**
 * Interpolate CSS selectors.
 */
function interpolate(selector, parent) {
    if (selector.indexOf("&") === -1)
        return `${parent} ${selector}`;
    return selector.replace(/&/g, parent);
}
/**
 * Recursive loop building styles with deferred selectors.
 */
function stylize(selector, styles, rulesList, stylesList, parent) {
    const { style, nested, isUnique } = parseStyles(styles, selector !== "");
    let pid = style;
    if (selector.charCodeAt(0) === 64 /* @ */) {
        const child = {
            selector,
            styles: [],
            rules: [],
            style: parent ? "" : style
        };
        rulesList.push(child);
        // Nested styles support (e.g. `.foo > @media > .bar`).
        if (style && parent) {
            child.styles.push({ selector: parent, style, isUnique });
        }
        for (const [name, value] of nested) {
            pid += name + stylize(name, value, child.rules, child.styles, parent);
        }
    }
    else {
        const key = parent ? interpolate(selector, parent) : selector;
        if (style)
            stylesList.push({ selector: key, style, isUnique });
        for (const [name, value] of nested) {
            pid += name + stylize(name, value, rulesList, stylesList, key);
        }
    }
    return pid;
}
/**
 * Transform `stylize` tree into style objects.
 */
function composeStylize(cache, pid, rulesList, stylesList, className, isStyle) {
    for (const { selector, style, isUnique } of stylesList) {
        const key = isStyle ? interpolate(selector, className) : selector;
        const id = isUnique
            ? `u\0${(++uniqueId).toString(36)}`
            : `s\0${pid}\0${style}`;
        const item = new Style(style, id);
        item.add(new Selector(key, `k\0${pid}\0${key}`));
        cache.add(item);
    }
    for (const { selector, style, rules, styles } of rulesList) {
        const item = new Rule(selector, style, `r\0${pid}\0${selector}\0${style}`);
        composeStylize(item, pid, rules, styles, className, isStyle);
        cache.add(item);
    }
}
/**
 * Cache to list to styles.
 */
function join(arr) {
    let res = "";
    for (let i = 0; i < arr.length; i++)
        res += arr[i];
    return res;
}
/**
 * Noop changes.
 */
const noopChanges = {
    add: () => undefined,
    change: () => undefined,
    remove: () => undefined
};
/**
 * Implement a cache/event emitter.
 */
class Cache {
    constructor(changes = noopChanges) {
        this.changes = changes;
        this.sheet = [];
        this.changeId = 0;
        this._keys = [];
        this._children = Object.create(null);
        this._counters = Object.create(null);
    }
    add(style) {
        const count = this._counters[style.id] || 0;
        const item = this._children[style.id] || style.clone();
        this._counters[style.id] = count + 1;
        if (count === 0) {
            this._children[item.id] = item;
            this._keys.push(item.id);
            this.sheet.push(item.getStyles());
            this.changeId++;
            this.changes.add(item, this._keys.length - 1);
        }
        else if (item instanceof Cache && style instanceof Cache) {
            const curIndex = this._keys.indexOf(style.id);
            const prevItemChangeId = item.changeId;
            item.merge(style);
            if (item.changeId !== prevItemChangeId) {
                this.sheet.splice(curIndex, 1, item.getStyles());
                this.changeId++;
                this.changes.change(item, curIndex, curIndex);
            }
        }
    }
    remove(style) {
        const count = this._counters[style.id];
        if (count) {
            this._counters[style.id] = count - 1;
            const item = this._children[style.id];
            const index = this._keys.indexOf(item.id);
            if (count === 1) {
                delete this._counters[style.id];
                delete this._children[style.id];
                this._keys.splice(index, 1);
                this.sheet.splice(index, 1);
                this.changeId++;
                this.changes.remove(item, index);
            }
            else if (item instanceof Cache && style instanceof Cache) {
                const prevChangeId = item.changeId;
                item.unmerge(style);
                if (item.changeId !== prevChangeId) {
                    this.sheet.splice(index, 1, item.getStyles());
                    this.changeId++;
                    this.changes.change(item, index, index);
                }
            }
        }
    }
    values() {
        return this._keys.map(key => this._children[key]);
    }
    merge(cache) {
        for (const item of cache.values())
            this.add(item);
        return this;
    }
    unmerge(cache) {
        for (const item of cache.values())
            this.remove(item);
        return this;
    }
    clone() {
        return new Cache().merge(this);
    }
}
/**
 * Selector is a dumb class made to represent nested CSS selectors.
 */
class Selector {
    constructor(selector, id) {
        this.selector = selector;
        this.id = id;
    }
    getStyles() {
        return this.selector;
    }
    clone() {
        return this;
    }
}
/**
 * The style container registers a style string with selectors.
 */
class Style extends Cache {
    constructor(style, id) {
        super();
        this.style = style;
        this.id = id;
    }
    getStyles() {
        return `${this.sheet.join(",")}{${this.style}}`;
    }
    clone() {
        return new Style(this.style, this.id).merge(this);
    }
}
/**
 * Implement rule logic for style output.
 */
class Rule extends Cache {
    constructor(rule, style, id) {
        super();
        this.rule = rule;
        this.style = style;
        this.id = id;
    }
    getStyles() {
        return `${this.rule}{${this.style}${join(this.sheet)}}`;
    }
    clone() {
        return new Rule(this.rule, this.style, this.id).merge(this);
    }
}
function key(pid, styles) {
    const key = `f${stringHash(pid)}`;
    return key;
}
/**
 * The FreeStyle class implements the API for everything else.
 */
class FreeStyle extends Cache {
    constructor(id, changes) {
        super(changes);
        this.id = id;
    }
    registerStyle(styles) {
        const rulesList = [];
        const stylesList = [];
        const pid = stylize("&", styles, rulesList, stylesList);
        const id = key(pid);
        const selector = `.${ id }`;
        composeStylize(this, pid, rulesList, stylesList, selector, true);
        return id;
    }
    registerKeyframes(keyframes) {
        return this.registerHashRule("@keyframes", keyframes);
    }
    registerHashRule(prefix, styles) {
        const rulesList = [];
        const stylesList = [];
        const pid = stylize("", styles, rulesList, stylesList);
        const id = key(pid);
        const selector = `${prefix} ${ id }`;
        const rule = new Rule(selector, "", `h\0${pid}\0${prefix}`);
        composeStylize(rule, pid, rulesList, stylesList, "", false);
        this.add(rule);
        return id;
    }
    registerRule(rule, styles) {
        const rulesList = [];
        const stylesList = [];
        const pid = stylize(rule, styles, rulesList, stylesList);
        composeStylize(this, pid, rulesList, stylesList, "", false);
    }
    registerCss(styles) {
        return this.registerRule("", styles);
    }
    getStyles() {
        return join(this.sheet);
    }
    clone() {
        return new FreeStyle(this.id, this.changes).merge(this);
    }
}
/**
 * Exports a simple function to create a new instance.
 */
function create(changes) {
    return new FreeStyle(`f${(++uniqueId).toString(36)}`, changes);
}

/**
 * We need to do the following to *our* objects before passing to freestyle:
 * - For any `$nest` directive move up to FreeStyle style nesting
 * - For any `$unique` directive map to FreeStyle Unique
 * - For any `$debugName` directive return the debug name
 */
function convertToStyles(object) {
    /** The final result we will return */
    var styles = {};
    for (var key in object) {
        /** Grab the value upfront */
        var val = object[key];
        /** TypeStyle configuration options */
        if (key === '$nest') {
            var nested = val;
            for (var selector in nested) {
                var subproperties = nested[selector];
                styles[selector] = convertToStyles(subproperties);
            }
        }
        else if (key === '$debugName') {
            styles.$displayName = val;
        }
        else {
            styles[key] = val;
        }
    }
    return styles;
}
// todo: better name here
function convertToKeyframes(frames) {
    var result = {};
    for (var offset in frames) {
        if (offset !== '$debugName') {
            result[offset] = frames[offset];
        }
    }
    if (frames.$debugName) {
        result.$displayName = frames.$debugName;
    }
    return result;
}

/** Raf for node + browser */
var raf = typeof requestAnimationFrame === 'undefined'
    /**
     * Make sure setTimeout is always invoked with
     * `this` set to `window` or `global` automatically
     **/
    ? function (cb) { return setTimeout(cb); }
    /**
     * Make sure window.requestAnimationFrame is always invoked with `this` window
     * We might have raf without window in case of `raf/polyfill` (recommended by React)
     **/
    : typeof window === 'undefined'
        ? requestAnimationFrame
        : requestAnimationFrame.bind(window);
/**
 * Merges various styles into a single style object.
 * Note: if two objects have the same property the last one wins
 */
function extend() {
    var objects = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        objects[_i] = arguments[_i];
    }
    /** The final result we will return */
    var result = {};
    for (var _a = 0, objects_1 = objects; _a < objects_1.length; _a++) {
        var object = objects_1[_a];
        if (object == null || object === false) {
            continue;
        }
        for (var key in object) {
            /** Falsy values except a explicit 0 is ignored */
            var val = object[key];
            if (!val && val !== 0) {
                continue;
            }
            /** if nested media or pseudo selector */
            if (key === '$nest' && val) {
                result[key] = result['$nest'] ? extend(result['$nest'], val) : val;
            }
            /** if freestyle sub key that needs merging. We come here due to our recursive calls */
            else if ((key.indexOf('&') !== -1 || key.indexOf('@media') === 0)) {
                result[key] = result[key] ? extend(result[key], val) : val;
            }
            else {
                result[key] = val;
            }
        }
    }
    return result;
}
/**
 * Utility to help customize styles with media queries. e.g.
 * ```
 * style(
 *  media({maxWidth:500}, {color:'red'})
 * )
 * ```
 */
var media = function (mediaQuery) {
    var _a;
    var objects = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        objects[_i - 1] = arguments[_i];
    }
    var mediaQuerySections = [];
    if (mediaQuery.type)
        mediaQuerySections.push(mediaQuery.type);
    if (mediaQuery.orientation)
        mediaQuerySections.push("(orientation: " + mediaQuery.orientation + ")");
    if (mediaQuery.minWidth)
        mediaQuerySections.push("(min-width: " + mediaLength(mediaQuery.minWidth) + ")");
    if (mediaQuery.maxWidth)
        mediaQuerySections.push("(max-width: " + mediaLength(mediaQuery.maxWidth) + ")");
    if (mediaQuery.minHeight)
        mediaQuerySections.push("(min-height: " + mediaLength(mediaQuery.minHeight) + ")");
    if (mediaQuery.maxHeight)
        mediaQuerySections.push("(max-height: " + mediaLength(mediaQuery.maxHeight) + ")");
    var stringMediaQuery = "@media " + mediaQuerySections.join(' and ');
    var object = {
        $nest: (_a = {},
            _a[stringMediaQuery] = extend.apply(void 0, objects),
            _a)
    };
    return object;
};
var mediaLength = function (value) {
    return typeof value === 'string' ? value : value + "px";
};

/**
 * Creates an instance of free style with our options
 */
var createFreeStyle = function () { return create(); };
/**
 * Maintains a single stylesheet and keeps it in sync with requested styles
 */
var TypeStyle = /** @class */ (function () {
    function TypeStyle(_a) {
        var _this = this;
        var autoGenerateTag = _a.autoGenerateTag;
        /**
         * Insert `raw` CSS as a string. This is useful for e.g.
         * - third party CSS that you are customizing with template strings
         * - generating raw CSS in JavaScript
         * - reset libraries like normalize.css that you can use without loaders
         */
        this.cssRaw = function (mustBeValidCSS) {
            if (!mustBeValidCSS) {
                return;
            }
            _this._raw += mustBeValidCSS || '';
            _this._pendingRawChange = true;
            _this._styleUpdated();
        };
        /**
         * Takes CSSProperties and registers it to a global selector (body, html, etc.)
         */
        this.cssRule = function (selector) {
            var objects = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                objects[_i - 1] = arguments[_i];
            }
            var styles = convertToStyles(extend.apply(void 0, objects));
            _this._freeStyle.registerRule(selector, styles);
            _this._styleUpdated();
            return;
        };
        /**
         * Renders styles to the singleton tag imediately
         * NOTE: You should only call it on initial render to prevent any non CSS flash.
         * After that it is kept sync using `requestAnimationFrame` and we haven't noticed any bad flashes.
         **/
        this.forceRenderStyles = function () {
            var target = _this._getTag();
            if (!target) {
                return;
            }
            target.textContent = _this.getStyles();
        };
        /**
         * Utility function to register an @font-face
         */
        this.fontFace = function () {
            var fontFace = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                fontFace[_i] = arguments[_i];
            }
            var freeStyle = _this._freeStyle;
            for (var _a = 0, _b = fontFace; _a < _b.length; _a++) {
                var face = _b[_a];
                freeStyle.registerRule('@font-face', face);
            }
            _this._styleUpdated();
            return;
        };
        /**
         * Allows use to use the stylesheet in a node.js environment
         */
        this.getStyles = function () {
            return (_this._raw || '') + _this._freeStyle.getStyles();
        };
        /**
         * Takes keyframes and returns a generated animationName
         */
        this.keyframes = function (frames) {
            var keyframes = convertToKeyframes(frames);
            // TODO: replace $debugName with display name
            var animationName = _this._freeStyle.registerKeyframes(keyframes);
            _this._styleUpdated();
            return animationName;
        };
        /**
         * Helps with testing. Reinitializes FreeStyle + raw
         */
        this.reinit = function () {
            /** reinit freestyle */
            var freeStyle = createFreeStyle();
            _this._freeStyle = freeStyle;
            _this._lastFreeStyleChangeId = freeStyle.changeId;
            /** reinit raw */
            _this._raw = '';
            _this._pendingRawChange = false;
            /** Clear any styles that were flushed */
            var target = _this._getTag();
            if (target) {
                target.textContent = '';
            }
        };
        /** Sets the target tag where we write the css on style updates */
        this.setStylesTarget = function (tag) {
            /** Clear any data in any previous tag */
            if (_this._tag) {
                _this._tag.textContent = '';
            }
            _this._tag = tag;
            /** This special time buffer immediately */
            _this.forceRenderStyles();
        };
        /**
         * Takes an object where property names are ideal class names and property values are CSSProperties, and
         * returns an object where property names are the same ideal class names and the property values are
         * the actual generated class names using the ideal class name as the $debugName
         */
        this.stylesheet = function (classes) {
            var classNames = Object.getOwnPropertyNames(classes);
            var result = {};
            for (var _i = 0, classNames_1 = classNames; _i < classNames_1.length; _i++) {
                var className = classNames_1[_i];
                var classDef = classes[className];
                if (classDef) {
                    classDef.$debugName = className;
                    result[className] = _this.style(classDef);
                }
            }
            return result;
        };
        var freeStyle = createFreeStyle();
        this._autoGenerateTag = autoGenerateTag;
        this._freeStyle = freeStyle;
        this._lastFreeStyleChangeId = freeStyle.changeId;
        this._pending = 0;
        this._pendingRawChange = false;
        this._raw = '';
        this._tag = undefined;
        // rebind prototype to TypeStyle.  It might be better to do a function() { return this.style.apply(this, arguments)}
        this.style = this.style.bind(this);
    }
    /**
     * Only calls cb all sync operations settle
     */
    TypeStyle.prototype._afterAllSync = function (cb) {
        var _this = this;
        this._pending++;
        var pending = this._pending;
        raf(function () {
            if (pending !== _this._pending) {
                return;
            }
            cb();
        });
    };
    TypeStyle.prototype._getTag = function () {
        if (this._tag) {
            return this._tag;
        }
        if (this._autoGenerateTag) {
            var tag = typeof window === 'undefined'
                ? { textContent: '' }
                : document.createElement('style');
            if (typeof document !== 'undefined') {
                document.head.appendChild(tag);
            }
            this._tag = tag;
            return tag;
        }
        return undefined;
    };
    /** Checks if the style tag needs updating and if so queues up the change */
    TypeStyle.prototype._styleUpdated = function () {
        var _this = this;
        var changeId = this._freeStyle.changeId;
        var lastChangeId = this._lastFreeStyleChangeId;
        if (!this._pendingRawChange && changeId === lastChangeId) {
            return;
        }
        this._lastFreeStyleChangeId = changeId;
        this._pendingRawChange = false;
        this._afterAllSync(function () { return _this.forceRenderStyles(); });
    };
    TypeStyle.prototype.style = function () {
        var className = this._freeStyle.registerStyle(convertToStyles(extend.apply(undefined, arguments)));
        this._styleUpdated();
        return className;
    };
    return TypeStyle;
}());

/** Zero configuration, default instance of TypeStyle */
var ts = new TypeStyle({ autoGenerateTag: true });
/**
 * Takes CSSProperties and return a generated className you can use on your component
 */
var style = ts.style;

export { media, style };
