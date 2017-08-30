;
(function (root) {
    var settings = {
        cover: "",
        showTime: 300,
        coverColor: "rgba(0,0,0,.2)",
        defaultImg: "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw" +
                "==",
        onLoadError: function (index, element) {},
        onLoadStart: function (index, element) {}
    };

    var srcList = [];
    var lazyImgList = [];
    var _width = window.innerWidth;
    var _height = window.innerHeight;

    var _now = Date.now || function () {
        return new Date().getTime();
    };
    function extend(target) {
        for (let i = 1; i < arguments.length; i++) {
            let source = arguments[i];
            for (let key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };

    function getElementTop(element) {
        var actualTop = element.offsetTop;
        var current = element.offsetParent;
        while (current !== null) {
            actualTop += current.offsetTop;
            current = current.offsetParent;
        }
        return actualTop;
    }

    function getElementLeft(element) {
        var actualLeft = element.offsetLeft;
        var current = element.offsetParent;

        while (current !== null) {
            actualLeft += current.offsetLeft;
            current = current.offsetParent;
        }

        return actualLeft;
    }

    function throttle(func, wait, options) {
        var context,
            args,
            result;
        var timeout = null;
        var previous = 0;

        var later = function () {
            previous = _now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) {
                context = args = null;
            }
        };
        return function () {
            var now = _now();

            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                clearTimeout(timeout);
                timeout = null;
                previous = now; //上一次执行时间
                result = func.apply(context, args);
                if (!timeout) {
                    context = args = null;
                }
            } else if (!timeout) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };

    function removeMak(index, mask, callback, element) {
        setTimeout(function () {
            document
                .body
                .removeChild(mask);
            callback();
        }, settings.showTime);
    }

    function setMask(element, index, callback) {
        if (element.dataset.complete) 
            return;
        
        element.style.visibility = "hidden";
        element.src = srcList[index];

        var w = element.width;
        var h = element.height;
        var offsetTop = getElementTop(element);
        var offsetLeft = getElementLeft(element);

        element.style.visibility = "visible";
        var mask = document.createElement("div");
        mask.className = "lazy-load-mask";
        mask.style.cssText = "background-color:" + settings.coverColor + ";position:absolute;width:" + w + "px;height:" + h + "px;top:" + offsetTop + "px;left:" + offsetLeft + "px;z-index:500";
        mask.innerHTML = settings.cover;
        document
            .body
            .appendChild(mask);

        removeMak(index, mask, callback, element);
        element.dataset.complete = "true";

    }

    function setImgs(index, callback) {
        var src = srcList[index];
        var element = lazyImgList[index];

        image = new Image()
        image.src = src;
        image.onload = function () {
            callback();
            settings.onLoadStart(index, element);
        }

        image.onerror = function () {
            element.dataset.complete = "true";
            settings.onLoadError(index, element);
        }
    }

    function checkImgs() {
        var _loadElement = null;
        var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;

        for (var i = 0, len = lazyImgList.length; i < len; i++) {
            var element = lazyImgList[i];
            if (!element.dataset.complete && !_loadElement) {
                var offsetTop = getElementTop(element);
                if (offsetTop - scrollTop >= 0 && offsetTop - scrollTop < _height) {
                    _loadElement = i;
                    break;
                }
            }
        }
        if (_loadElement != null) {
            setImgs(_loadElement, function () {
                try {
                    setMask(lazyImgList[_loadElement], _loadElement, checkImgs)
                } catch (error) {
                    console.log(error)
                }
            })
        }
    }

    function init(options) {
        settings = extend(settings, options);
        lazyImgList = []
            .slice
            .call(document.querySelectorAll("[data-img-src]"));

        lazyImgList.forEach(function (element, index) {
            var src = element.dataset.imgSrc;
            srcList.push(src);
            element.src = settings.defaultImg;
        })

        checkImgs();
        window.onscroll = throttle(checkImgs, 200);
    }

    function reset() {
        lazyImgList = []
            .slice
            .call(document.querySelectorAll("[data-img-src]"));
    }

    root.lazyload = init;
    root.lazyReset = reset;
})(this)