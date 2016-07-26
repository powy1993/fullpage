fullpage
========

for desktop(ie5.5+) and mobile

You can use it for creating your personal pages and webApp.

Without jQuery.Less than 9KB.

兼容桌面端(ie5.5+) 和 手机端

你可以用它来构建你的个人主页或者网页应用

这是一个不使用jQuery小巧的框架 不到9KB


This is a [Demo](http://1.fullpagechris.sinaapp.com/fullpage.html).

  - Help! I want to make it AUTOPLAY! [Demo like this](http://1.fullpagechris.sinaapp.com/autoPlay.html)

  - I want a SPECIFIC example! [Demo like this](http://1.fullpagechris.sinaapp.com/index.html)

Here are some examples which use fullpage.

[PC](http://henan.qq.com/zt/2014/loveHenan/index.htm)
[Mobile](http://henan.qq.com/zt/2014/loveHenan/index-mob.htm)

Enjoy!

## Usage
Fullpage only needs to follow a simple pattern. Here is an example:

``` html
<div id="pageContain">	
	<div class="page page1 current">
		<div class="contain">
			<!-- your own code here-->
		</div>
	</div>
    <!-- ect.. -->
</div>

<!--alternative-->
<ul id="navBar">
	<li>0</li>
	<!-- ect.. -->
</ul>
<!--alternative-->
```

!新功能: 

你可以在 page 的 div 上加上 data-step, 当含有这个属性时, 你可以创造出不切屏的逐桢动画,
fullpage 会为你自动添上 step1,step2,step3 这些 class, 并且在step终止时切屏.(详见Demo)

Above is the initial required structure– a series of elements wrapped in two containers. Place any content you want within the items. The containing div will need to be passed to the Fullpage function like so:

``` js

var runPage = new FullPage({

  id : 'pageContain',                            // id of contain
  slideTime : 800,                               // time of slide
  continuous : false,                            // create an infinite feel with no endpoints
  effect : {                                     // slide effect
          transform : {
            translate : 'Y',                      // 'X'|'Y'|'XY'|'none'
            scale : [.1, 1],                      // [scalefrom, scaleto]
            rotate : [0, 0]                       // [rotatefrom, rotateto]
          },
          opacity : [0, 1]                       // [opacityfrom, opacityto]
      },                           
  mode : 'wheel,touch,nav:navBar',               // mode of fullpage
  easing : 'ease',                               // easing('ease','ease-in','ease-in-out' or use cubic-bezier like [.33, 1.81, 1, 1];
  start : 1					 // which page will display when install
    //  ,onSwipeStart : function(index, thisPage) {   // callback onTouchStart
    //    return 'stop';
    //  }
    //  ,beforeChange : function(index, thisPage) {   // callback before pageChange
    //    return 'stop';
    //  }
    //  ,callback : function(index, thisPage) {       // callback when pageChange
    //    alert(index);
    //  };
});

```

I always place this at the bottom of the page, externally, to verify the page is ready.

## 设置

- **id** String - 外层包裹id

- **slideTime** Integer *(default:800)* - 每页切换时间(毫秒)

- **effect** Object *(default:{})* - 效果参数

- **continuous** Boolean *(default:false)* - 是否循环(即能从最后页跳到第一页面)

  - transform

    - translate String 切换方向 'X'|'Y'|'XY'|'none'      表示 X轴|Y轴|XY轴|无
    - scale     Array  缩放     [scalefrom, scaleto]     表示 [起始缩放比例, 结束时缩放比例]  
    - rotate    Array  旋转     [rotatefrom, rotateto]   表示 [起始旋转角度, 结束时旋转角度]

  - opacity     Array  透明度   [opacityfrom, opacityto] 表示 [起始透明度, 结束时透明度]

- **mode** String *(default:'')* - 转换模式 'wheel,touch,nav:navBar' 表示 '滚轮,触摸,导航条:导航条id'

- **onSwipeStart** Function - 触摸开始时的回调函数
  - 当 retrun 'stop' 时,此次触摸将不会生效

- **beforeChange** Function - 滑动开始时的回调函数
  - 当 retrun 'stop' 时,此次滑动将还原

- **callback** Function - 滑动结束后的回调函数
- **start** Integer - 初始化时被展示的页面页码

## Fullpage API

Fullpage exposes a few functions that can be useful for script control of your pages.

`prev()` slide to prev

`next()` slide to next

`thisPage()` returns current page position

`go(num)` slide to set page position (num:the page you want to slide to)

## 接口

Fullpage也提供了一些接口供使用此插件的开发者调用：

`prev()`  直接滑向上一页

`next()`  直接滑入下一页

`thisPage()` 返回当前的页码

`go(num)` 直接滑到第num页
