;(function (root) {
  var settings = {
    cover: '',
    duration: 300,
    coverColor: 'rgba(0,0,0,.4)',
    defaultImg: 'data:image/png;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw' +
      '==',
    onLoadEnd: function (element, index) {},
    onLoadError: function (element, index) {},
    onLoadStart: function (element, index) {}
  }

  var srcList = []
  var lazyImgList = []
  var _height = window.innerHeight

  var hasOwnProperty = Object.prototype.hasOwnProperty
  var _now = Date.now || function () {
    return new Date().getTime()
  }

  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (callback) {
      var T,
        k
      if (this == null) {
        throw new TypeError('this is null or not defined')
      }
      var O = Object(this)
      var len = O.length >>> 0
      if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function')
      }
      if (arguments.length > 1) {
        T = arguments[1]
      }
      k = 0
      while (k < len) {
        var kValue
        if (k in O) {
          kValue = O[k]
          callback.call(T, kValue, k, O)
        }
        k++
      }
    }
  }

  function toArr (arr) {
    var output = []
    try {
      output = []
        .slice
        .call(arr)
    } catch(e) {
      for (var key in arr) {
        output.push(arr[key])
      }
    }
    return output
  }

  function assign (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i]
      for (var key in source) {
        if (hasOwnProperty.call(source, key)) {
          target[key] = source[key]
        }
      }
    }
    return target
  }

  function dataset (element, attr, value) {
    var hasDataset = dataset.hasDataset
    if (hasDataset == undefined) {
      hasDataset = !!element.dataset
      dataset.hasDataset = hasDataset
    }

    if (value === undefined) {
      return hasDataset
        ? element.dataset[attr]
        : element.getAttribute('data-' + attr)
    } else {
      hasDataset
        ? element.dataset[attr] = value + ''
        : element.setAttribute('data-' + attr, value + '')
    }
  }

  function getElementTop (element) {
    var actualTop = element.offsetTop
    var current = element.offsetParent
    while (current !== null) {
      actualTop += current.offsetTop
      current = current.offsetParent
    }
    return actualTop
  }

  function getElementLeft (element) {
    var actualLeft = element.offsetLeft
    var current = element.offsetParent

    while (current !== null) {
      actualLeft += current.offsetLeft
      current = current.offsetParent
    }

    return actualLeft
  }

  function fadeOut (element, callback, index) {
    var timeout = null
    var opacity = parseFloat(element.style.opacity, 10)
    var v = 1 / settings.duration * 5
    if (isNaN(opacity))
      opacity = 1
    timeout = setInterval(function () {
      if (opacity < 0.05) {
        element.style.opacity = 0
        clearInterval(timeout)
        timeout = null
        document
          .body
          .removeChild(element)
        callback()
        settings.onLoadEnd(element, index)
      } else {
        opacity = opacity - v
        element.style.opacity = opacity
      }
    }, 5)
  }

  function throttle (func, wait, options) {
    var context,
      args,
      result
    var timeout = null
    var previous = 0

    var later = function () {
      previous = _now()
      timeout = null
      result = func.apply(context, args)
      if (!timeout) {
        context = args = null
      }
    }

    return function () {
      var now = _now()

      var remaining = wait - (now - previous)
      context = this
      args = arguments
      if (remaining <= 0 || remaining > wait) {
        clearTimeout(timeout)
        timeout = null
        previous = now
        result = func.apply(context, args)
        if (!timeout) {
          context = args = null
        }
      } else if (!timeout) {
        timeout = setTimeout(later, remaining)
      }
      return result
    }
  }

  function setMask (element, index, callback) {
    if (dataset(element, 'complete'))
      return

    element.style.visibility = 'hidden'
    element.src = srcList[index]

    var w = element.width
    var h = element.height
    var offsetTop = getElementTop(element)
    var offsetLeft = getElementLeft(element)

    element.style.visibility = 'visible'
    var mask = document.createElement('div')
    mask.className = 'lazy-load-mask'
    mask.style.cssText = 'background-color:' + settings.coverColor + ';position:absolute;width:' + w + 'px;height:' + h + 'px;top:' + offsetTop + 'px;left:' + offsetLeft + 'px;z-index:20;'
    if (settings.cover)
      mask.innerHTML = settings.cover
    document
      .body
      .appendChild(mask)

    fadeOut(mask, callback, index)
    dataset(element, 'complete', true)
  }

  function setImgs (index, callback) {
    var src = srcList[index]
    var element = lazyImgList[index]

    image = new Image()
    image.src = src
    image.onload = function () {
      callback()
      settings.onLoadStart(element, index)
    }

    image.onerror = function () {
      dataset(element, 'complete', true)
      settings.onLoadError(element, index)
    }
  }

  function checkImgs () {
    var _loadElement = null
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop

    for (var i = 0, len = lazyImgList.length; i < len; i++) {
      var element = lazyImgList[i]
      if (!dataset(element, 'complete') && !_loadElement) {
        var offsetTop = getElementTop(element)
        if (offsetTop - scrollTop >= 0 && offsetTop - scrollTop < _height) {
          _loadElement = i
          break
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

  function init (options) {
    settings = assign(settings, options)
    lazyImgList = toArr(document.querySelectorAll('[data-imgsrc]'))

    lazyImgList
      .forEach(function (element, index) {
        var src = dataset(element, 'imgsrc')
        srcList.push(src)
        element.src = settings.defaultImg
      })

    checkImgs()
    window.onscroll = throttle(checkImgs, 200)
  }

  root.lazyload = init
})(this)
