var Hatena = Hatena || {};

/* UTF-8 でないページから読み込まれても動くように、
 * コメントは複数行コメント (閉じる "*" の前にスペースを置く) を使い、
 * 文字列リテラル中の ASCII 外の文字は \uXXXX とエスケープする。
 */

(function (Hatena) {

var B = Hatena.Bookmark = Hatena.Bookmark || {};
if (B.BookmarkButton) return;

if (location.protocol === 'https:') {
    B.apiOrigin = 'https://b.hatena.ne.jp';
} else {
    B.apiOrigin = 'http://cdn.api.b.hatena.ne.jp';
}
B.origin = location.protocol + '//b.hatena.ne.jp';
B.staticOrigin = location.protocol + '//b.st-hatena.com';

var match = new RegExp('^((?:local|b(?!log)\\w+)\\.hatena\\.ne\\.jp(?::3000)?)$').exec(location.host);
var isLocal;
if (match) {
    B.origin = B.apiOrigin = B.staticOrigin = 'http://' + match[1];
    isLocal = true;
}

var U = B.ButtonUtils = {};

var extend = U.extend = function (dest, src) {
    for (var i in src)
        dest[i] = src[i];
    return dest;
};

var E = U.createElement = function (name, props) {
    var element = document.createElement(name);
    for (var p in props)
        element[p] = props[p];
    for (var i = 2; i < arguments.length; i++) {
        var child = arguments[i];
        if (!child.nodeType)
            child = document.createTextNode(child);
        element.appendChild(child);
    }
    return element;
};

var getLocation = U.getLocation = function () {
    var url = location.href;
    /* Safari は location.href でパス中の URI エスケープを
     * デコードしてしまうので、document.URL も調べてみる
     */
    if (url.length < document.URL.length)
        url = document.URL;
    return url;
};

var View = U.View = {
    root: null,
    clientLeft: 0,
    clientTop: 0,
    init: function () {
        this.root = ((document.compatMode || '') === 'CSS1Compat')
                    ? document.documentElement : document.body;
        this.clientLeft = this.root.clientLeft || 0;
        this.clientTop = this.root.clientTop || 0;
    },
    getElementRect: function (element) {
        if (!this.root) this.init();
        this.getElementRect = element.getBoundingClientRect
            ? this.getElementRectByRect : this.getElementRectByOffset;
        return this.getElementRect(element);
    },
    getElementRectByRect: function (element) {
        var rect = element.getBoundingClientRect();
        var scroll = this.getScroll();
        return {
            x: rect.left + scroll.x - this.clientLeft,
            y: rect.top + scroll.y - this.clientTop,
            width: rect.width || rect.right - rect.left,
            height: rect.height || rect.bottom - rect.top
        };
    },
    getElementRectByOffset: function (element) {
        var x = 0, y = 0;
        for (var node = element, base; base = node.offsetParent; node = base) {
            x += node.offsetLeft;
            y += node.offsetTop;
        }
        return { x: x, y: y, width: element.offsetWidth, height: element.offsetHeight };
    },
    getWindowSize: function () {
        if (!this.root) this.init();
        return { width: this.root.clientWidth, height: this.root.clientHeight };
    },
    getDocumentSize: function () {
        if (!this.root) this.init();
        return { width: this.root.scrollWidth, height: this.root.scrollHeight };
    },
    getScroll: function () {
        if (!this.root) this.init();
        this.getScroll = (typeof window.pageXOffset === 'number')
                         ? this.getScrollByPage : this.getScrollByRoot;
        return this.getScroll();
    },
    getScrollByPage: function () {
        return { x: window.pageXOffset, y: window.pageYOffset };
    },
    getScrollByRoot: function () {
        return { x: this.root.scrollLeft, y: this.root.scrollTop };
    }
};

var Dispatchable = U.Dispatchable = {
    addEventListener: function (type, listener) {
        var listeners = this.getListeners(type);
        for (var i = 0; i < listeners.length; i++)
            if (listeners[i] === listener)
                return;
        listeners.push(listener);
    },
    removeEventListener: function (type, listener) {
        var listeners = this.getListeners(type);
        for (var i = 0; i < listeners.length; i++) {
            if (listeners[i] === listener) {
                listeners.splice(i, 1);
                return;
            }
        }
    },
    dispatchEvent: function (type, data) {
        var event = new Dispatchable.Event(type, data);
        var listeners = this.getListeners(type);
        for (var i = 0; i < listeners.length; i++)
            listeners[i].call(this, event);
        return !event.defaultPrevented;
    },
    getListeners: function (type) {
        if (!this.hasOwnProperty('_listenersMap'))
            this._listenersMap = {};
        return this._listenersMap[type] || (this._listenersMap[type] = []);
    }
};

Dispatchable.Event = function (type, data) {
    this.type = type;
    this.data = data;
    this.defaultPrevented = false;
};

extend(Dispatchable.Event.prototype, {
    preventDefault: function () {
        this.defaultPrevented = true;
    }
});

var Observer = U.Observer = function (target, type, handler, method) {
    this.target = target;
    this.type = type;
    this.listener = handler;
    if (method) {
        this.listener = (typeof method === 'string')
            ? function () { return handler[method].apply(handler, arguments); }
            : function () { return handler.apply(method, arguments); };
    }
    if (!target.addEventListener && target.attachEvent) {
        var listener = this.listener;
        this.listener = function (event) {
            return listener.call(target, Observer.WrappedEvent.create(event));
        };
        this.start = this.startAttach;
        this.stop = this.stopAttach;
    }
    this.start();
};

extend(Observer.prototype, {
    start: function () {
        this.target.addEventListener(this.type, this.listener, false);
    },
    stop: function () {
        this.target.removeEventListener(this.type, this.listener, false);
    },
    startAttach: function () {
        this.target.attachEvent('on' + this.type, this.listener);
    },
    stopAttach: function () {
        this.target.detachEvent('on' + this.type, this.listener);
    }
});

Observer.WrappedEvent = {
    create: function (event) {
        /* 一部の IE8 でのクラッシュ対策
         * cf: http://vividcode.hatenablog.com/entry/ie/ie8_posmes_crash */
        if ( event.type === "message" ) {
            return event;
        }
        var e = document.createEventObject(event);
        e._event = event;
        e.target = event.srcElement;
        var scroll = View.getScroll();
        e.pageX = event.clientX + scroll.x - View.clientLeft;
        e.pageY = event.clientY + scroll.y - View.clientTop;
        e.stopPropagation = this.stopPropagation;
        e.preventDefault = this.preventDefault;
        return e;
    },
    stopPropagation: function () {
        this._event.cancelBubble = true;
    },
    preventDefault: function () {
        this._event.returnValue = false;
    }
};

var JSON = U.JSON = window.JSON || {
    _tokenRE: /[{}\[\],:]|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b|\"(?:[^\u0000-\u001f\"\\]|\\(?:[\"\\\/bfnrt]|u[0-9A-Fa-f]{4}))*\"|\b(?:true|false|null)\b|\s+/g,
    _escapeChar: function (c) {
        return '\\u' + (0x10000 + c.charCodeAt(0)).toString(16).substring(1);
    },

    parse: function (json) {
        json = String(json);
        if (json.replace(JSON._tokenRE, '') !== '')
            throw new Error('Invalid JSON sytax');
        return eval('(' + json + ')');
    },
    stringify: function (value) {
        switch (typeof value) {
        case 'string':
            return '"' + value.replace(/[\u0000-\u001f\"\\\u2028\u2029]/g, JSON._escapeChar) + '"';
        case 'number':
        case 'boolean':
            return '' + value;
        case 'object':
            if (!value) return 'null';
            var stringify = JSON.stringify;
            var type = Object.prototype.toString.call(value).slice(8, -1);
            switch (type) {
            case 'String': case 'Number': case 'Boolean':
                return stringify(value.valueOf());
            case 'Array':
                var members = [];
                for (var i = 0; i < value.length; i++)
                    members.push(stringify(value[i]));
                return '[' + members.join(',') + ']';
            case 'Object':
                var members = [];
                for (var i in value)
                    if (value.hasOwnProperty(i))
                        members.push(stringify(i) + ':' + stringify(value[i]));
                return '{' + members.join(',') + '}';
            }
            return 'null';
        }
        return 'null';
    }
};

var WindowMessenger = U.WindowMessenger = function (win, url) {
    this.win = win;
    this.origin = url.replace(/^(https?:\/\/[^\/?#]+)[\s\S]*/, '$1');
    this.observer = new Observer(window, 'message', this, 'messageHandler');
};

extend(WindowMessenger, {
    usePostMessage: true,
    keySeed: (Math.random() * 0x10000) << 8,
    createForFrame: function (frame, url) {
        var win = frame.contentWindow;
        /* WebKit ではフレームごとに別の名前をつける必要あり */
        win.name = (++this.keySeed).toString(36) + '|' + getLocation();
        win.location.replace(url);
        return new this(win, url);
    }
});

extend(WindowMessenger.prototype, Dispatchable);
extend(WindowMessenger.prototype, {
    send: function (type, data) {
        if (typeof data === 'undefined') data = null;
        var message = 'HBMessage@' + JSON.stringify({ type: type, data: data });
        this.win.postMessage(message, this.origin);
    },
    messageHandler: function (event) {
        var origin = event.origin || event.uri.replace(/^(https?:\/\/[^\/?#]+)[\s\S]*/, '$1');
        if (origin !== this.origin || event.source != this.win ||
            !/^HBMessage@/.test(event.data)) return;
        var message = JSON.parse(event.data.substring(10));
        this.dispatchEvent(message.type, message.data);
    },
    destroy: function () {
        this.observer.stop();
    }
});

if (!window.postMessage) {

WindowMessenger = U.WindowMessenger = function (win, url, key) {
    this.win = win;
    this.url = url.replace(/#[\s\S]*/, '');
    this.key = key;
    WindowMessenger.instances[this.key] = this;
    if (!WindowMessenger.timerId) WindowMessenger.init();
};

extend(WindowMessenger, {
    usePostMessage: false,
    instances: {},
    interval: 20,
    timerId: 0,
    createForFrame: function (frame, url) {
        var win = frame.contentWindow;
        var key = this.makeFNVHash(url + '|' + Math.random()).toString(36);
        win.name = key + '|' + getLocation();
        win.location.replace(url);
        return new this(win, url, key);
    },
    /* http://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function */
    makeFNVHash: function (string) {
        var hash = 2166136261;
        for (var i = 0; i < string.length; i++)
            hash = ((hash * 16777619) ^ string.charCodeAt(i)) >>> 0;
        return hash;
    },
    init: function () {
        this.lastFragment = location.hash;
        var WM = this;
        this.timerId = window.setInterval(function () { WM.observe(); }, this.interval);
    },
    observe: function () {
        var fragment = location.hash;
        if (fragment === this.lastFragment) return;
        var match = fragment.match(/^#HBMessage-(\w+)-([^\/]+)\/(.+)/);
        if (!match) {
            this.lastFragment = fragment;
            return;
        }
        /* "#" だとページ最上部へのスクロールが発生するので "#_" で */
        this.lastFragment = this.lastFragment || '#_';
        var scroll = View.getScroll();
        location.replace(this.lastFragment);
        window.scrollTo(scroll.x, scroll.y);
        var messenger = this.instances[match[1]];
        if (!messenger) return;
        var type = decodeURIComponent(match[2]);
        var data = JSON.parse(decodeURIComponent(match[3]));
        messenger.dispatchEvent(type, data);
    }
});

extend(WindowMessenger.prototype, Dispatchable);
extend(WindowMessenger.prototype, {
    send: function (type, data) {
        if (typeof data === 'undefined') data = null;
        var url = this.url + '#HBMessage-' + this.key + '-' +
                  encodeURIComponent(type) + '/' +
                  encodeURIComponent(JSON.stringify(data));
        try {
            this.win.location.replace(url);
        } catch (ex) {
            this.win.location.href = url;
        }
    },
    destroy: function () {
        delete WindowMessenger.instances[this.key];
    }
});

} /* WindowMessenger implementation with fragment identifier */

B.BookmarkButton = function (link) {
    this.url = link.getAttribute('data-hatena-bookmark-url') ||
               B.BookmarkButton.extractURL(link.href) ||
               B.BookmarkButton.getCurrentURL();
    this.link = link;
    this.mode = B.BookmarkButton.isTouchBrowser
        ? 'goto-touch' : this.link.getAttribute('data-hatena-bookmark-mode');
    /* IE 7 はデフォルトのセキュリティ設定によりフレーム内でのパネルの動作に
     * 支障をきたすので、フレーム内ではポップアップを開くことを強制する。
     */
    if (!WindowMessenger.usePostMessage &&
        /\bMSIE 7\b/.test(navigator.userAgent) &&
        window.self != window.top) {
        this.mode = 'popup';
    }
    this.setup();
};

extend(B.BookmarkButton, {
    interval: 428, /* Welcome to Shibuya.js! */
    timerId: 0,
    setup: function () {
        if (this.timerId) return;
        var Button = this;
        this.timerId = window.setInterval(function () { Button.tryCreate(); }, this.interval);
        this.tryCreate();
    },
    lastLinkCount: 0,
    tryCreate: function () {
        var links = document.getElementsByTagName('a');
        var linkCount = links.length;
        if (linkCount === this.lastLinkCount) return;
        var buttonLinks = [];
        var classRE = /(?:^|\s)hatena-bookmark-button(?:\s|$)/;
        for (var i = 0; i < linkCount; i++)
            if (classRE.test(links[i].className) &&
                !links[i].getAttribute('data-hatena-bookmark-initialized'))
                buttonLinks.push(links[i]);
        for (var i = 0; i < buttonLinks.length; i++)
            new B.BookmarkButton(buttonLinks[i]);
        this.lastLinkCount = links.length;
    },
    extractURL: function (entryURL) {
        if (!entryURL) return null;
        var match = entryURL.match(/^http:\/\/b\.hatena\.ne\.jp\/entry\/(?:add\/)?(.+)/);
        if (!match) return null;
        var url = match[1];
        var parts = url.match(/^(?:https?(?:(:)|(%3A))|(s\/))?/);
        if (parts[2]) {
            try {
                return decodeURIComponent(url);
            } catch (ex) {
                return unescape(url);
            }
        }
        if (!parts[1])
            url = parts[3] ? 'https://' + url.substring(2) : 'http://' + url;
        return url.replace(/%23/g, '#');
    },
    getCurrentURL: function () {
        var url = getLocation();
        var canonicalURL = this.getCanonicalURL();
        if (canonicalURL) {
            var index = url.indexOf('#');
            if (index >= 0 && canonicalURL.indexOf('#') < 0)
                canonicalURL += url.substring(index);
            url = canonicalURL;
        }
        return url;
    },
    getCanonicalURL: function () {
        var links = document.getElementsByTagName('link');
        for (var i = 0; i < links.length; i++) {
            if (links[i].rel.toLowerCase() !== 'canonical' || !links[i].href) continue;
            /* IE で href プロパティが絶対 URL に解決されないことがある */
            var a = document.createElement('a');
            a.href = links[i].href;
            return a.cloneNode(false).href;
        }
        return null;
    },
    isTouchBrowser: /\b(?:iPhone|iPod);| Android /.test(navigator.userAgent),
    forcedLayout: ''
});

extend(B.BookmarkButton.prototype, {
    setup: function () {
        var layout = B.BookmarkButton.forcedLayout || this.link.getAttribute('data-hatena-bookmark-layout');
        if (layout === 'simple') {
            this.link.setAttribute('data-hatena-bookmark-initialized', '1');
            this.observer = new Observer(this.link, 'click', this, 'clickHandler');
            this.button = this.link;
            /* リンクの内容が画像ひとつのみならその画像を基準にパネルを表示 */
            var images = this.link.getElementsByTagName('img');
            this.anchor = (images.length === 1) ? images[0] : this.link;
            if (!isLocal && !/^https?:\/\/b\.hatena\.ne\.jp\/(?!articles(?![\w-]))/.test(getLocation())) {
                this.image = new Image();
                this.image.src = B.apiOrigin + '/entry/button/?url=' + encodeURIComponent(this.url) + '&layout=simple&format=image';
            }
        } else {
            var config = {
                vertical: { height: 50 },
                'simple-balloon'  : { width: 70,  height: 20 },
                'standard-balloon': { width: 130, height: 20 },
                'standard-noballoon': { width: 80, height: 20 },
                'vertical-balloon': { width: 80,  height: 60 }
            };
            var width = 50, height = 20;
            if (config[layout]) {
                width  = config[layout]['width']  || width;
                height = config[layout]['height'] || height;
            }
            this.frame = E('iframe', { className: 'hatena-bookmark-button-frame', title: this.link.title, frameBorder: 0, scrolling: 'no', allowTransparency: true, width: width, height: height, src:'javascript:false' });
            this.frame.style.cssText = 'width: ' + width + 'px; height: ' + height + 'px;';
            this.link.parentNode.replaceChild(this.frame, this.link);

            var buttonURL = B.apiOrigin + '/entry/button/?url=' + encodeURIComponent(this.url);
            if (layout && layout !== 'standard')
                buttonURL += '&layout=' + encodeURIComponent(layout);
            var lang = this.link.getAttribute('data-hatena-bookmark-lang');
            if (lang)
                buttonURL += '&lang=' + encodeURIComponent(lang);
            if (this.mode === 'popup')
                buttonURL += '&mode=' + encodeURIComponent(this.mode);
            this.messenger = WindowMessenger.createForFrame(this.frame, buttonURL);
            this.observer = new Observer(this.messenger, 'click', this, 'clickHandler');
            this._resizeObserver = new Observer(this.messenger, "resize", this, "resizeMessageHandler");
            this.button = this.frame;
            this.anchor = this.frame;
        }
    },
    getTitle: function () {
        var title = this.link.getAttribute('data-hatena-bookmark-title');
        if (!title) {
            title = this.link.getAttribute('data-hatena-bookmark-escaped-title');
            if (title)
                try { title = decodeURIComponent(title); } catch (ex) {}
        }
        if (!title && this.url.replace(/#.*/, '') === getLocation().replace(/#.*/, ''))
            title = document.title;
        return title;
    },
    togglePanel: function () {
        if (!this.panel)
            this.panel = new B.BookmarkPanel(this.url, this.getTitle());
        if (this.panel.isShown) {
            this.panel.hide();
        } else {
            var position = this.link.getAttribute('data-hatena-bookmark-position');
            var hideBg = this.link.getAttribute('data-hatena-bookmark-hide-bg');
            var hideBackground = !hideBg || hideBg.toLowerCase() !== 'false';
            this.panel.show(this.anchor, position, hideBackground);
        }
    },
    gotoTouchEntry: function () {
        var entryURL = B.origin + '/entry.touch/';
        var urlMatch = this.url.match(/^http(s)?:\/\/([\s\S]*)$/);
        if (urlMatch)
            entryURL += (urlMatch[1] ? 's/' : '') + urlMatch[2];
        else
            entryURL += this.url;
        location.href = entryURL.replace(/#/g, '%23');
    },
    gotoTouchBookmarklet: function () {
        var bookmarkletURL = B.origin + '/bookmarklet.touch?url=' + encodeURIComponent(this.url);
        var title = this.getTitle();
        if (title)
            bookmarkletURL += '&btitle=' + encodeURIComponent(title);
        location.href = bookmarkletURL;
    },
    clickHandler: function (event) {
        if ((event.which || event.button || 0) > 1) return;
        if (event.stopPropagation) event.stopPropagation();
        if (event.preventDefault) event.preventDefault();
        switch (this.mode) {
        case 'popup':
            B.BookmarkPanel.openPopup(this.url, this.getTitle());
            break;
        case 'goto-touch':
            this.gotoTouchEntry();
            break;
        default:
            this.togglePanel();
        }
    },
    resizeMessageHandler: function (evt) {
        var width = evt.data.width + "";
        var height = evt.data.height + "";
        if (/^\d+$/.test(width)) this.frame.style.width = width + "px";
        if (/^\d+$/.test(height)) this.frame.style.height = height + "px";
    },
    destroy: function () {
        if (this.observer) this.observer.stop();
        if (this._resizeObserver) this._resizeObserver.stop();
        if (this.messenger) this.messenger.destroy();
        if (this.panel) this.panel.destroy();
        if (this.button && this.button.parentNode)
            this.button.parentNode.removeChild(this.button);
    }
});

B.BookmarkPanel = function (url, title) {
    this.url = url;
    this.title = title || '';
    this.isShown = false;
    this.width = 365;
    this.height = 160;
    this.fixedTo = 'top';
    this.hiddenFlashes = [];
    this.clickObserver = new Observer(document, 'click', this, 'clickHandler');
    this.clickObserver.stop();
    this.observers = [this.clickObserver];
    this.setup();
};

extend(B.BookmarkPanel, {
    currentPanel: null,
    makePanelURL: function (url, title) {
        var panelURL = B.origin + '/entry/panel/?url=' + encodeURIComponent(url);
        if (title)
            panelURL += '&btitle=' + encodeURIComponent(title);
        return panelURL;
    },
    openPopup: function (url, title) {
        var panelURL = this.makePanelURL(url, title);
        var win = window.open(panelURL, 'hatena_bookmark_panel_popup', 'width=365,height=220,menubar=no,toolbar=no,resizable=yes');
    },
    hasCommonStyle: false,
    setupCommonStyle: function () {
        if (this.hasCommonStyle) return;
        this.hasCommonStyle = true;
        var resetCSSDeclarations =
            'margin: 0; padding: 0; border: none; ' +
            'position: static; float: none; width: auto; height: auto; ' +
            'line-height: 1; vertical-align: baseline; ' +
            'color: #222; background: none; ' +
            'font-style: normal; font-weight:normal; font-size: medium; ' +
            'text-indent: 0; text-align: left; text-decoration: none; ' +
            'letter-spacing: normal; word-spacing: normal; white-space: normal;';
        var resetCSSText =
            '.hatena-bookmark-bookmark-panel, ' +
            '.hatena-bookmark-bookmark-panel * ' +
            '{' + resetCSSDeclarations + '}';
        try {
            var style = document.createElement('style');
            style.type = 'text/css';
            style.appendChild(document.createTextNode(resetCSSText));
            document.getElementsByTagName('head')[0].appendChild(style);
        } catch (ex) {
            document.createStyleSheet().cssText = resetCSSText;
        }
    },
    needsRebase: null,
    getBasePosition: function () {
        if (this.needsRebase === null) {
            var style = window.getComputedStyle
                ? getComputedStyle(document.body, null)
                : document.body.currentStyle;
            this.needsRebase = !!style && style.position !== 'static';
        }
        return this.needsRebase ? View.getElementRect(document.body) : { x: 0, y: 0 };
    }
});

extend(B.BookmarkPanel.prototype, {
    setup: function () {
        /* var frameTitle = (this.title ? '『' + this.title + '』' : 'このエントリー') + 'をはてなブックマークに追加'; */
        var frameTitle = (this.title ? '\u300E' + this.title + '\u300F' : '\u3053\u306E\u30A8\u30F3\u30C8\u30EA\u30FC') + '\u3092\u306F\u3066\u306A\u30D6\u30C3\u30AF\u30DE\u30FC\u30AF\u306B\u8FFD\u52A0';
        this.panel = E('div', { className: 'hatena-bookmark-bookmark-panel' },
            this.loading = E('div', null, E('span', null, 'Now Loading...')),
            this.content = E('div', null,
                this.frame = E('iframe', { title: frameTitle, scrolling: 'no', frameBorder: 0, allowTransparency: true, src: 'javascript:false' })
            )
        );
        this.setupStyle();
        document.body.appendChild(this.panel);
        var panelURL = B.BookmarkPanel.makePanelURL(this.url, this.title);
        this.messenger = WindowMessenger.createForFrame(this.frame, panelURL);
        this.observers.push(
            /* frame からのメッセージ受信失敗時の保険 */
            new Observer(this.frame, 'load', this, 'showContent'),
            new Observer(this.messenger, 'ready', this, 'showContent'),
            new Observer(this.messenger, 'resize', this, 'resizeMessageHandler')
        );
    },
    setupStyle: function () {
        B.BookmarkPanel.setupCommonStyle();
        var size = 'width: ' + this.width + 'px; height: ' + this.height + 'px;';
        this.panel.style.cssText = 'position: absolute; z-index: 10002; display: none; ' + size;
        this.loading.style.cssText = 'background-color: #fff; border: 3px solid #2c6ebd; -moz-border-radius: 5px; -webkit-border-radius: 5px; border-radius: 5px; text-align: center; width: ' + (this.width - 6) + 'px; height: ' + (this.height - 6) + 'px;';
        this.loading.firstChild.style.cssText = 'background: url("' + B.staticOrigin + '/images/loading.gif") left center no-repeat; padding-left: 23px; font-size: 0.85em; position: relative; top: ' + (this.height / 2 - 10) + 'px;';
        this.content.style.cssText = 'display: none;';
        this.frame.style.cssText = 'display: block; ' + size;
    },
    show: function (anchor, position, hideBackground) {
        if (this.isShown) return;
        if (B.BookmarkPanel.currentPanel)
            B.BookmarkPanel.currentPanel.hide();
        if (anchor)
            this.anchorTo(anchor, position);
        this.panel.style.display = '';
        this.isShown = true;
        this.clickObserver.start();
        if (hideBackground)
            this.hideFlashes();
        B.BookmarkPanel.currentPanel = this;
        if (!this.loading)
            this.messenger.send('notifysize');
    },
    hideFlashes: function () {
        var flashes = [];
        var embeds = document.getElementsByTagName('embed');
        for (var i = 0, embed; embed = embeds[i]; i++)
            if (embed.type === 'application/x-shockwave-flash')
                flashes.push(embed);
        var objects = document.getElementsByTagName('object');
        for (var i = 0, object; object = objects[i]; i++)
            if (object.type === 'application/x-shockwave-flash' ||
                (object.classid || '').toLowerCase() === 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000')
                flashes.push(object);
        if (!flashes.length) return;
        var panelRect = View.getElementRect(this.panel);
        var left = panelRect.x;
        var top = panelRect.y;
        var right = panelRect.x + panelRect.width;
        var bottom = panelRect.y + Math.max(panelRect.height, 300);
        for (var i = 0, flash; flash = flashes[i]; i++) {
            var rect = View.getElementRect(flash);
            if (rect.x + rect.width < left || right < rect.x ||
                rect.y + rect.height < top || bottom < rect.y)
                continue;
            flash.style.visibility = 'hidden';
            this.hiddenFlashes.push(flash);
        }
    },
    showContent: function () {
        if (!this.loading) return;
        this.panel.removeChild(this.loading);
        this.loading = null;
        this.content.style.display = '';
    },
    hide: function () {
        if (!this.isShown) return;
        this.panel.style.display = 'none';
        this.isShown = false;
        this.clickObserver.stop();
        for (var i = 0, flash; flash = this.hiddenFlashes[i]; i++)
            flash.style.visibility = '';
        this.hiddenFlashes = [];
        B.BookmarkPanel.currentPanel = null;
    },
    resize: function (width, height) {
        if (width > 0) {
            this.panel.style.width = width + 'px';
            this.frame.style.width = width + 'px';
            this.width = width;
        }
        if (height > 0) {
            if (this.fixedTo === 'bottom')
                this.panel.style.top = parseFloat(this.panel.style.top) + this.height - height + 'px';
            this.panel.style.height = height + 'px';
            this.frame.style.height = height + 'px';
            this.height = height;
        }
    },
    anchorTo: function (anchor, position) {
        var rect = View.getElementRect(anchor);
        var isLeft = position && position.indexOf('left') >= 0;
        var isTop = position && position.indexOf('top') >= 0;
        if (!position) {
            var size = View.getWindowSize();
            var scroll = View.getScroll();
            isLeft = (scroll.x + size.width) - rect.x < this.width &&
                     (rect.x + rect.width) - scroll.x >= this.width;
            var h = Math.max(this.height, 300);
            isTop = (scroll.y + size.height) - (rect.y + rect.height) < h &&
                    rect.y - scroll.y >= h;
        }
        var left = isLeft ? rect.x + rect.width - this.width : rect.x;
        var top = isTop ? rect.y - this.height - 2 : rect.y + rect.height + 2;
        var base = B.BookmarkPanel.getBasePosition();
        this.panel.style.left = (Math.max(left, 2) - base.x) + 'px';
        this.panel.style.top = (Math.max(top, 2) - base.y) + 'px';
        this.fixedTo = isTop ? 'bottom' : 'top';
    },
    clickHandler: function (event) {
        for (var node = event.target; node; node = node.parentNode)
            if (node === this.panel)
                return;
        this.hide();
    },
    resizeMessageHandler: function (event) {
        this.resize(event.data.width || -1, event.data.height || -1);
    },
    destroy: function () {
        this.hide();
        for (var i = 0, observer; observer = this.observers[i]; i++)
            observer.stop();
        this.messenger.destroy();
        if (this.panel.parentNode)
            this.panel.parentNode.removeChild(this.panel);
    }
});

})(Hatena);

Hatena.Bookmark.BookmarkButton.setup();
