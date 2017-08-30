# lazyload.js
lazy load imgs

# support
* √ ie8 ~ ie11
* √ edge
* √ firefox4+
* √ chrome26+

# usage
```html
  <img data-imgsrc="https://avatars2.githubusercontent.com/u/15724170?v=4&s=40">
```
```javascript
<script src="./lazyload.min.js"></script>
<script>
  lazyload()
 </script>
```

# options 
```
{
  cover: '',
  duration: 300,
  coverColor: 'rgba(0,0,0,.4)',
  onLoadEnd: function (element, index) {},
  onLoadError: function (element, index) {},
  onLoadStart: function (element, index) {},
  defaultImg: 'data:image/png;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
}
```
