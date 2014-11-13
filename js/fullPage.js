/* 
 * Chriswang
 * 396276123@qq.com
 * 2014.11.11
 * Github:https://github.com/powy1993/fullpage
 */

function FullPage(options) {

	"use strict";

	var pageContain = document.getElementById(options.id),
		page = pageContain.children,
		pagelen = page.length,
		iPage = pagelen,
		sTime = options.slideTime || 800,
		effect = options.effect || {},
		indexNow = 0,
		browser = {},
		pageRange = {},
		cubicCurve = {},
		mode = [],
		modeLen,
		navChildren,
		SPACE = ' ',
		_interval = null,
		_isLocked = false,
		_isNav = false,
		_curve,
		_t,
		init,
		setCubic,
		trans,
		resetAndRun,
		onTap,
		replaceClass,
		goPage,
		navChange,
		wheelScroll;

	if (!page || pagelen === 1) return;
	if (options.mode) {
		_isNav = options.mode.indexOf('nav:') !== -1;
		mode = options.mode.split(',');
		modeLen = mode.length;
	}

	browser = {

        addEventListener : !!window.addEventListener,
        gravity : !!window.DeviceOrientationEvent,
        touch : ('ontouchstart' in window) || 
                window.DocumentTouch && document instanceof DocumentTouch,

        versionAndroid: function() {

            var u = navigator.userAgent,
                matchVersion = u.indexOf('Android'),
                num;

            if (matchVersion !== -1) {
                num = u.substring(matchVersion + 7, matchVersion + 11).replace(' ', '');
            }
            return num || 0;     //0: not Android device
        }(),

        cssCore: function(testCss) {

            switch (true) {
                case testCss.webkitTransition === '':
                return 'webkit'; break;
                case testCss.MozTransition === '':
                return 'Moz'; break;
                case testCss.msTransition === '':
                return 'ms'; break;
                case testCss.OTransition === '':
                return 'O'; break;
                default:
                return '';
            }
        }(document.createElement('Chriswang').style)
    };


	function UnitBezier(p1x, p1y, p2x, p2y) {
		// pre-calculate the polynomial coefficients
		// First and last control points are implied to be (0,0) and (1.0, 1.0)
		this.cx = 3.0 * p1x;
		this.bx = 3.0 * (p2x - p1x) - this.cx;
		this.ax = 1.0 - this.cx -this.bx;
		 
		this.cy = 3.0 * p1y;
		this.by = 3.0 * (p2y - p1y) - this.cy;
		this.ay = 1.0 - this.cy - this.by;
	}

	UnitBezier.prototype = {
		epsilon : 1e-5,     // Precision  
		sampleCurveX : function(t) {
	    	return ((this.ax * t + this.bx) * t + this.cx) * t;
		},
		sampleCurveY : function(t) {
	    	return ((this.ay * t + this.by) * t + this.cy) * t;
		},
		sampleCurveDerivativeX : function(t) {
	    	return (3.0 * this.ax * t + 2.0 * this.bx) * t + this.cx;
		},
		solveCurveX : function(x, epsilon) {
			var t0,
				t1,
				t2,
				x2,
				d2,
				i;

			// First try a few iterations of Newton's method -- normally very fast.
			for (t2 = x, i = 0; i < 8; i++) {
			    x2 = this.sampleCurveX(t2) - x;
			    if (Math.abs (x2) < epsilon)
			        return t2;
			    d2 = this.sampleCurveDerivativeX(t2);
			    if (Math.abs(d2) < epsilon)
			        break;
			    t2 = t2 - x2 / d2;
			}

			// No solution found - use bi-section
			t0 = 0.0;
			t1 = 1.0;
			t2 = x;

			if (t2 < t0) return t0;
			if (t2 > t1) return t1;

			while (t0 < t1) {
				x2 = this.sampleCurveX(t2);
				if (Math.abs(x2 - x) < epsilon)
					return t2;
				if (x > x2) t0 = t2;
				else t1 = t2;

				t2 = (t1 - t0) * .5 + t0;
			}

			// Give up
			return t2;
		},

		// Find new T as a function of Y along curve X
		solve : function(x, epsilon) {
	    	return this.sampleCurveY( this.solveCurveX(x, epsilon) );
		}
	}

	init = function() {
		
		var i = pagelen;

		pageContain.style.height = document.documentElement.clientHeight + 'px' || window.innerHeight + 'px';
		pageRange = {
			X : pageContain.offsetWidth,
			Y : pageContain.offsetHeight
		}
	}

	setCubic = function(a, b, c, d) {

		cubicCurve.A = a;
		cubicCurve.B = b;
		cubicCurve.C = c;
		cubicCurve.D = d;
	}

	if (typeof options.easing === 'string') {

		switch (options.easing) {

			case 'ease' : 
			setCubic(0.25, 0.1, 0.25, 1);
			break;

			case 'linear' :
			setCubic(0, 0, 1, 1);
			break;

			case 'ease-in' : 
			setCubic(0.42, 0, 1, 1);
			break;

			case 'ease-out' :
			setCubic(0, 0, 0.58, 1);
			break;

			case 'ease-in-out' :
			setCubic(0.42, 0, 0.58, 1);
			break;
		}
	} else {
		setCubic(options.easing[0], options.easing[1], options.easing[2], options.easing[3]);
	}

	if (browser.cssCore !== '') {
		
		while (iPage--) {

			page[iPage].style[browser.cssCore + 'TransitionTimingFunction'] = 'cubic-bezier(' 
																			+ cubicCurve.A + ',' 
																			+ cubicCurve.B + ',' 
																			+ cubicCurve.C + ',' 
																			+ cubicCurve.D + ')';
		}

		trans = function(o, x, y) {

			var s = o.style,
				t = arguments[4] ? 'translate(' + x +'px,' + y + 'px) translateZ(0) scale(' + arguments[4] +')'
								 : 'translate(' + x +'px,' + y + 'px) translateZ(0)'

			s[browser.cssCore + 'Transform'] = t;
		}
	} else {
		// simulate translate for ie9- 
		// Cubic-bezier : Fn(t) = (3p1-3p2+1)t^3+(3p2-6p1)t^2-3p1t.
		_curve = new UnitBezier(cubicCurve.A, cubicCurve.B, cubicCurve.C, cubicCurve.D);

		trans = function(o, x, y, t) {

			var cs = o.currentStyle,
				s = o.style,
				cx = parseInt(s.left || cs.left, 10),
				cy = parseInt(s.top || cs.top, 10),
				dx = x - cx,
				dy = y - cy,
				ft = +new Date,
				end = ft + t,
				pos = 0,
				diff;

			clearInterval(_interval);

			_interval = setInterval(function() {

				if (+new Date > end) {
					s.cssText = 'left:' + x + 'px;top:' + y + 'px;'
					clearInterval(_interval);
				} else {
					diff = end - new Date;
					pos = diff / t;
					// fix to cubic-bezier
					// pos = 1 - pos * pos * pos;
					pos = _curve.solve(1 - pos, UnitBezier.prototype.epsilon);

					s.cssText = 'left:'   + (cx + dx * pos) 
							  + 'px;top:' + (cy + dy * pos) 
							  + 'px;';
				}
			}, 13);
		}
	}

	resetAndRun = {
		transform : function(o, from, to) {

			var rangeNow = 0;

			switch (o[0]) {
				case 'Y' :
				rangeNow = to > from ? pageRange.Y : - pageRange.Y;
				trans(page[to], 0, rangeNow, 0, o[1]);
				break;

				case 'X' :
				rangeNow = to > from ? pageRange.X : - pageRange.X;
				trans(page[to], rangeNow, 0, 0, o[1]);
				break;

				case 'XY' :
				rangeNow = {
					X : to > from ? pageRange.X : - pageRange.X, 
					Y : to > from ? pageRange.Y : - pageRange.Y
				}
				trans(page[to], rangeNow.X, rangeNow.Y, 0, o[1]);
				break;

				default :
				break;
			}
			setTimeout(function() {
				trans(page[to], 0, 0, sTime, o[2]);
			}, 40);
		},
		opacity : function(o, from, to) {
			var s = page[to].style;

			s.opacity = o[0];
			setTimeout(function() {
				s.opacity = o[1];
			}, 40);
		}
	}

	if (browser.addEventListener && browser.touch) {
		onTap = function (o, fn) {
			o.addEventListener('touchstart', fn, false);
			if (arguments[2]) {       
				// if we touch on navBar we should stop scroll
				o.addEventListener('touchmove', function(e) {
					e.preventDefault();
				}, false);
			}
		}
	} else {
		onTap = function (o, fn) {
			o.onclick = fn;
		}
	}

	replaceClass = function(o, cls, tocls) {

		var oN = o.className,
			arr = [],
			len;

		if (oN.indexOf(cls) !== -1) {

			arr = oN.split(SPACE);
			len = arr.length;
			while (len--) {
				if (arr[len] === cls) {
					if (tocls === SPACE || tocls === '') {
						arr.splice(len, 1);
					} else {
						arr[len] = tocls;
					}
				}
			}
			if (arr.length) {
				o.className = arr.join(SPACE);
			} else {
				o.removeAttribute('class');
				o.removeAttribute('className');
			}
		}

	}

	if (_isNav) {
		navChange = function(from, to) {
			var t = navChildren[to].className;

			replaceClass(navChildren[from], 'active', SPACE);
			navChildren[to].className = t === '' ? 'active' : t + ' active';
		}
	}

	goPage = function(to) {

		var fix,
			indexOld,
			_effectNow;

		if (_isLocked                 // make sure translate is already
			|| to === indexNow		  // don't translate if thispage
			|| to >= pagelen 		  // more than max page
			|| to < 0) return;		  // less than min page(0)

		_isLocked = true;
		
		for (_effectNow in effect) {
			resetAndRun[_effectNow](effect[_effectNow], indexNow, to);
		}

		fix = browser.cssCore === '' ? 20 : 0;
		indexOld = indexNow;
		indexNow = to;
		if (_isNav) navChange(indexOld, indexNow);
		setTimeout(function() {
			// fix for bug in ie6-9 about z-index
			page[to].className += ' slide';	
		}, fix);

		setTimeout(function() {

			page[to]['style'][browser.cssCore + 'TransitionDuration'] = sTime + 'ms';
		}, 20);

		setTimeout(function() {

			replaceClass(page[indexOld], 'current', '');
			replaceClass(page[indexNow], 'slide', 'current');

			if (options.callback) {
				options.callback(indexNow, page[indexNow]);
			}

			_isLocked = false;
		}, sTime + 50);

	}
	
	init();
	// Tag first page
	_t = page[indexNow].className;
	page[indexNow].className = _t.indexOf('current') !== -1 ? _t : _t + ' current';

	if (browser.addEventListener) {

		window.addEventListener('resize', init, false);
	} else {

		window.onresize = init;
	}
	// check mode
	while (modeLen--) {

		(function(m) {

			switch (true) {
				case m === 'wheel' : 
				wheelScroll = function(e) {

					var direct;
					e = e || window.event;
					if (e.preventDefault) {
						e.preventDefault();
					} else {
						e.returnValue = false;
					}
					if (_isLocked) return;
					direct = - e.wheelDelta ||  e.detail;
					direct = direct < 0 ? -1 : 1;

					goPage(indexNow + direct);
				}
				if (browser.addEventListener) {
					document.addEventListener('DOMMouseScroll', wheelScroll, false);
				}
				window.onmousewheel = document.onmousewheel = wheelScroll;
				break;

				case m === 'touch' :
				if (!browser.touch || !browser.addEventListener) break;
				(function() {

					var touchEvent = {},
						start = {};

					touchEvent = {
						start : function(e) {

							var touches = e.touches[0];

							start = {
								x : touches.pageX,
								y : touches.pageY,
								time : +new Date
							}

							pageContain.addEventListener('touchmove', touchEvent.move, false);
							pageContain.addEventListener('touchend', touchEvent.end, false);
						},
						move : function(e) {
							// ensure swiping with one touch and not pinching
      						if ( event.touches.length > 1 || event.scale && event.scale !== 1) return
							e.preventDefault();
						},
						end : function(e) {

							var touches = e.changedTouches[0],
								duration = +new Date - start.time,
								delta = {},
								next = 0,
								isValidSlide = false;

							delta = {
								x : touches.pageX - start.x,
								y : touches.pageY - start.y
							}

							switch (options.effect.transform[0]) {
								case 'Y' :
								isValidSlide = 
									+  duration < 250 && Math.abs(delta.y) > 20
									|| Math.abs(delta.y) > pageRange.Y * .3;
								next = delta.y > 0 ? -1 : 1;
								break;

								case 'X' :
								isValidSlide = 
									+  duration < 250 && Math.abs(delta.x) > 20
									|| Math.abs(delta.x) > pageRange.Y * .4;
								next = delta.x > 0 ? -1 : 1;
								break;

								case 'XY' :
								isValidSlide = 
									+  duration < 250 && Math.abs(delta.y) + Math.abs(delta.x) > 40
									|| Math.abs(delta.y) > pageRange.Y * .2;
								next = delta.y > 0 ? -1 : 1;
								break;

								default :
								break;
							}
							if (isValidSlide) {
								goPage(indexNow + next);
							}
						}

					}


					pageContain.addEventListener('touchstart', touchEvent.start, false);
				}());
				break;

				case m.indexOf('nav:') !== -1 : 
				(function() {

					var navId = m.split(':')[1],
						navObj = document.getElementById(navId),
						navLen,
						gotoPage,
						_t;

					navChildren = navObj.children;
					navLen = navChildren.length;
					_t = navChildren[indexNow].className;

					if (!navObj || !navChildren) return;

					while (navLen--) {
						// set attr for finding specific page
						navChildren[navLen].setAttribute('data-page', navLen);
					}
					if (_t.indexOf('active') === -1) {
						navChildren[indexNow].className = _t === '' ? 'active' : _t + ' active';
					}

					gotoPage = function(e) {

						var t;
						e = e || window.event;
						e = e.target || e.srcElement;

						t = e.tagName.toLowerCase();

						while (t !== 'li') {
							if (t === 'ul') return;
							e = e.parentNode;
							t = e.tagName.toLowerCase();
						}

						goPage( + e.getAttribute('data-page') ); 
					}
					// bind event to navObj
					onTap(navObj, gotoPage, 1);
				}());
			}
		}(mode[modeLen]));
	}

	return {
		thisPage : function() {
			return indexNow;
		},
		go : function(num) {
			goPage(num);
		},
		next : function() {
			goPage(indexNow + 1);
		},
		prev : function() {
			goPage(indexNow - 1);
		}
	}
}