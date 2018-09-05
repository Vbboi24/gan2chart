var Gan2Chart = (function () {
  'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var defineProperty = function (obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  };

  var slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  var toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  /**
   * extend SVGElement prototype for some utility function
   */
  SVGElement.prototype.getX = function () {
      return +this.getAttribute('x');
  };
  SVGElement.prototype.getY = function () {
      return +this.getAttribute('y');
  };
  SVGElement.prototype.getWidth = function () {
      return +this.getAttribute('width');
  };
  SVGElement.prototype.getHeight = function () {
      return +this.getAttribute('height');
  };
  SVGElement.prototype.getEndX = function () {
      return this.getX() + this.getWidth();
  };
  function createSVG(tag, attrs) {
      var elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
      for (var attr in attrs) {
          if (attr === 'appendTo') {
              attrs.appendTo.appendChild(elem);
          } else if (attr === 'innerHTML') {
              elem.innerHTML = attrs.innerHTML;
          } else {
              elem.setAttribute(attr, attrs[attr]);
          }
      }
      return elem;
  }
  function animateSVG(svgElement, attr, from, to) {
      var animatedSvgElement = getAnimationElement(svgElement, attr, from, to);
      if (animatedSvgElement === svgElement) {
          // triggered 2nd time programmatically
          // trigger artificial click event
          var event = document.createEvent('HTMLEvents');
          event.initEvent('click', true, true);
          event.eventName = 'click';
          animatedSvgElement.dispatchEvent(event);
      }
  }
  function getAnimationElement(svgElement, attr, from, to) {
      var dur = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '0.4s';
      var begin = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '0.1s';

      var animEl = svgElement.querySelector('animate');
      if (animEl) {
          $.attr(animEl, {
              attributeName: attr,
              from: from, to: to, dur: dur,
              begin: 'click + ' + begin // artificial click
          });
          return svgElement;
      }
      var animateElement = createSVG('animate', {
          attributeName: attr,
          from: from, to: to, dur: dur, begin: begin,
          calcMode: 'spline',
          values: from + ';' + to,
          keyTimes: '0; 1',
          keySplines: cubic_bezier('ease-out')
      });
      svgElement.appendChild(animateElement);
      return svgElement;
  }
  function cubic_bezier(name) {
      return {
          ease: '.25 .1 .25 1',
          linear: '0 0 1 1',
          'ease-in': '.42 0 1 1',
          'ease-out': '0 0 .58 1',
          'ease-in-out': '.42 0 .58 1'
      }[name];
  }
  /**
   * utility function object like JQuery
   */
  var $ = {
      on: function on(element, event, selector, callback) {
          if (!callback) {
              callback = selector;
              $.bind(element, event, callback);
          } else {
              $.delegate(element, event, selector, callback);
          }
      },
      off: function off(element, event, handler) {
          element.removeEventListener(event, handler);
      },
      bind: function bind(element, event, callback) {
          event.split(/\s+/).forEach(function (event) {
              element.addEventListener(event, callback);
          });
      },
      delegate: function delegate(element, event, selector, callback) {
          element.addEventListener(event, function (e) {
              var delegatedTarget = e.target.closest(selector);
              if (delegatedTarget) {
                  e.delegatedTarget = delegatedTarget;
                  callback.call(this, e, delegatedTarget);
              }
          });
      },
      closest: function closest(selector, element) {
          if (!element) return null;
          if (element.matches(selector)) {
              return element;
          }
          return $.closest(selector, element.parentNode);
      },
      attr: function attr(element, _attr, value) {
          if (!value && typeof _attr === 'string') {
              return element.getAttribute(_attr);
          }
          if ((typeof _attr === 'undefined' ? 'undefined' : _typeof(_attr)) === 'object') {
              for (var key in _attr) {
                  $.attr(element, key, _attr[key]);
              }
              return;
          }
          element.setAttribute(_attr, value);
      }
  };

  var DateScale;
  (function (DateScale) {
      DateScale[DateScale["MILLISECOND"] = 0] = "MILLISECOND";
      DateScale[DateScale["SECOND"] = 1] = "SECOND";
      DateScale[DateScale["MINUTE"] = 2] = "MINUTE";
      DateScale[DateScale["HOUR"] = 3] = "HOUR";
      DateScale[DateScale["DAY"] = 4] = "DAY";
      DateScale[DateScale["MONTH"] = 5] = "MONTH";
      DateScale[DateScale["YEAR"] = 6] = "YEAR";
  })(DateScale || (DateScale = {}));
  /**
   * gan2 drawing class names
   */
  var classNames = {
      element: 'gan2',
      container: 'gan2-container',
      popupWrapper: 'popup-wrapper',
      gridBackground: 'grid-background',
      gridRow: 'grid-row',
      rowLine: 'row-line',
      gridHeader: 'grid-header',
      tick: 'tick',
      todayHighlight: 'today-highlight',
      active: 'active',
      handleGroup: 'handle-group',
      bar: 'bar',
      barLabel: 'bar-label',
      progress: 'progress',
      progressBar: 'bar-progress',
      progressFixed: 'progress-fixed',
      barFixed: 'bar-fixed',
      barGroup: 'bar-group',
      barWrapper: 'bar-wrapper',
      handle: 'handle',
      upperText: 'upper-text',
      upperDivisionBar: 'upper-division-bar',
      lowerText: 'lower-text'
  };
  var monthNames = {
      en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      ko: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  };
  var postFixes = {
      ko: {
          year: '년',
          day: '일',
          hour: '시'
      }
  };

  var DateUtil = function () {
      function DateUtil() {
          classCallCheck(this, DateUtil);
      }

      createClass(DateUtil, null, [{
          key: 'parse',

          /**
           * return parsed value
           * @param date
           * @param dateSeparator
           * @param timeSeparator
           */
          value: function parse(date) {
              var dateSeparator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '-';
              var timeSeparator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : /[.:]/;

              if (!date) {
                  return new Date();
              } else if (date instanceof Date) {
                  return date;
              }
              var parts = date.split(' ');
              var dateParts = parts[0].split(dateSeparator).map(function (val) {
                  return parseInt(val, 10);
              });
              var timeParts = parts[1] && parts[1].split(timeSeparator);
              // month is 0 indexed
              dateParts[1] = dateParts[1] - 1;
              if (timeParts && timeParts.length) {
                  if (timeParts.length == 4) {
                      timeParts[3] = '0.' + timeParts[3];
                      timeParts[3] = parseFloat(timeParts[3]) * 1000;
                  }
                  dateParts = dateParts.concat(timeParts);
              }

              var _dateParts = dateParts,
                  _dateParts2 = slicedToArray(_dateParts, 6),
                  a = _dateParts2[0],
                  b = _dateParts2[1],
                  c = _dateParts2[2],
                  d = _dateParts2[3],
                  e = _dateParts2[4],
                  f = _dateParts2[5];

              return new Date(a, b, c, d | 0, e | 0, f | 0);
          }
          /**
           * return Date to string value
           * @param date
           * @param withTime
           */

      }, {
          key: 'toString',
          value: function toString(date) {
              var withTime = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

              var values = this.getDateValues(date).map(function (val, i) {
                  val = i === 1 ? val + 1 : val;
                  if (i === 6) {
                      return DateUtil.padStart(val + '', 3, '0');
                  }
                  return DateUtil.padStart(val + '', 2, '0');
              });
              var dateString = values[0] + '-' + values[1] + '-' + values[2];
              var timeString = values[3] + ':' + values[4] + ':' + values[5] + '.' + values[6];
              return dateString + (withTime ? ' ' + timeString : '');
          }
          /**
           * return formatting date
           * @param date
           * @param format
           * @param lang
           */

      }, {
          key: 'format',
          value: function format(date) {
              var _format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'YYYY-MM-DD HH:mm:ss.SSS';

              var lang = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'en';

              var values = this.getDateValues(date).map(function (d) {
                  return DateUtil.padStart(d, 2, 0);
              });
              var postFixValue = function postFixValue(value) {
                  return postFixes[lang] ? postFixes[lang][value] : '';
              };
              var formatMap = {
                  YYYY: values[0],
                  MM: DateUtil.padStart(+values[1] + 1, 2, 0),
                  DD: values[2],
                  HH: values[3],
                  mm: values[4],
                  ss: values[5],
                  SSS: values[6],
                  D: values[2],
                  MMMM: monthNames[lang][+values[1]],
                  MMM: monthNames[lang][+values[1]],
                  DDDD: [+values[2]] + postFixValue('day'),
                  HHHH: [+values[3]] + postFixValue('hour'),
                  YYYYYYYY: [+values[0] + postFixValue('year')]
              };
              var str = _format;
              var formattedValues = [];
              Object.keys(formatMap).sort(function (a, b) {
                  return b.length - a.length;
              }) // big string first
              .forEach(function (key) {
                  if (str.includes(key)) {
                      str = str.replace(key, '$' + formattedValues.length);
                      formattedValues.push(formatMap[key]);
                  }
              });
              formattedValues.forEach(function (value, i) {
                  str = str.replace('$' + i, value);
              });
              return str;
          }
          /**
           * return difference of two chartDates
           * @param dateA
           * @param dateB
           * @param scale
           */

      }, {
          key: 'diff',
          value: function diff(dateA, dateB) {
              var scale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DateScale.DAY;

              var _map$map$sort = [dateA, dateB].map(function (date) {
                  return DateUtil.parse(date);
              }).map(function (date) {
                  return date.getTime();
              }).sort(function (a, b) {
                  return b - a;
              }),
                  _map$map$sort2 = slicedToArray(_map$map$sort, 2),
                  end = _map$map$sort2[0],
                  start = _map$map$sort2[1];

              var milliseconds = end - start;
              var seconds = milliseconds / 1000;
              var minutes = seconds / 60;
              var hours = minutes / 60;
              var days = hours / 24;
              var months = days / 30;
              var years = months / 12;
              var values = [milliseconds, seconds, minutes, hours, days, months, years];
              return Math.floor(values[scale]);
          }
          /**
           * return date object of today
           */

      }, {
          key: 'today',
          value: function today() {
              var _getDateValues$slice = this.getDateValues().slice(0, 3),
                  _getDateValues$slice2 = slicedToArray(_getDateValues$slice, 3),
                  a = _getDateValues$slice2[0],
                  b = _getDateValues$slice2[1],
                  c = _getDateValues$slice2[2];

              return new Date(a, b, c);
          }
      }, {
          key: 'now',
          value: function now() {
              return new Date();
          }
          /**
           *
           * @param date
           * @param qty
           * @param scale
           */

      }, {
          key: 'add',
          value: function add(date, qty, scale) {
              var getDateQty = function getDateQty(qty, scale) {
                  if (scale === DateScale.DAY) return qty;
                  return 0;
              };
              return new Date(date.getFullYear() + (scale === DateScale.YEAR ? qty : 0), date.getMonth() + (scale === DateScale.MONTH ? qty : 0), date.getDate() + getDateQty(qty, scale), date.getHours() + (scale === DateScale.HOUR ? qty : 0), date.getMinutes() + (scale === DateScale.MINUTE ? qty : 0), date.getSeconds() + (scale === DateScale.SECOND ? qty : 0), date.getMilliseconds() + (scale === DateScale.MILLISECOND ? qty : 0));
          }
          /**
           *
           * @param date
           * @param scale
           */

      }, {
          key: 'startOf',
          value: function startOf(date, scale) {
              var _scores;

              var scores = (_scores = {}, defineProperty(_scores, DateScale.YEAR, 6), defineProperty(_scores, DateScale.MONTH, 5), defineProperty(_scores, DateScale.DAY, 4), defineProperty(_scores, DateScale.HOUR, 3), defineProperty(_scores, DateScale.MINUTE, 2), defineProperty(_scores, DateScale.SECOND, 1), defineProperty(_scores, DateScale.MILLISECOND, 0), _scores);
              var shouldReset = function shouldReset(_scale) {
                  var maxScore = scores[scale];
                  return scores[_scale] <= maxScore;
              };
              return new Date(date.getFullYear(), shouldReset(DateScale.YEAR) ? 0 : date.getMonth(), shouldReset(DateScale.MONTH) ? 1 : date.getDate(), shouldReset(DateScale.DAY) ? 0 : date.getHours(), shouldReset(DateScale.HOUR) ? 0 : date.getMinutes(), shouldReset(DateScale.MINUTE) ? 0 : date.getSeconds(), shouldReset(DateScale.SECOND) ? 0 : date.getMilliseconds());
          }
      }, {
          key: 'clone',
          value: function clone(date) {
              return new Date(date);
          }
      }, {
          key: 'getDateValues',
          value: function getDateValues() {
              var date = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Date();

              return [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
          }
          /**
           * return date label for language
           * @param date
           * @param scale
           * @param language
           */

      }, {
          key: 'getDateLabel',
          value: function getDateLabel(date, scale) {
              var language = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'en';

              var postFix = !!postFixes[language];
              var lower = '',
                  upper = '';
              var yearFormat = postFix ? 'YYYYYYYY' : 'YYYY';
              var hourFormat = postFix ? 'HHHH' : 'HH';
              var dayFormat = postFix ? 'DDDD' : 'D';
              var monthFormat = postFix ? 'MMMM' : 'MMM';
              var dayAndMonthFormat = postFix ? 'MMM ' + dayFormat : dayFormat + ' MMM';
              switch (scale) {
                  case DateScale.YEAR:
                      lower = DateUtil.format(date, '' + yearFormat, language);
                      break;
                  case DateScale.MONTH:
                      upper = date.getFullYear() ? DateUtil.format(date, '' + yearFormat, language) : '';
                      lower = DateUtil.format(date, '' + monthFormat, language);
                      break;
                  case DateScale.HOUR:
                      upper = date.getDate() ? DateUtil.format(date, '' + dayAndMonthFormat, language) : '';
                      lower = DateUtil.format(date, '' + hourFormat, language);
                      break;
                  default:
                      // DAY
                      upper = date.getMonth() || date.getMonth() === 0 ? DateUtil.format(date, 'MMMM', language) : '';
                      lower = DateUtil.format(date, '' + dayFormat, language);
              }
              return { lower: lower, upper: upper };
          }
          /**
           *
           * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/DateUtil.padStart
           * @param str
           * @param targetLength
           * @param padString
           */

      }, {
          key: 'padStart',
          value: function padStart(str, targetLength, padString) {
              str = str + '';
              targetLength = targetLength >> 0;
              padString = String(typeof padString !== 'undefined' ? padString : ' ');
              if (str.length > targetLength) {
                  return String(str);
              } else {
                  targetLength = targetLength - str.length;
                  if (targetLength > padString.length) {
                      padString += padString.repeat(targetLength / padString.length);
                  }
                  return padString.slice(0, targetLength) + String(str);
              }
          }
      }]);
      return DateUtil;
  }();

  var Gan2Arrow = function () {
      function Gan2Arrow(gantt, fromTask, toTask) {
          classCallCheck(this, Gan2Arrow);

          this.gantt = gantt;
          this.fromTask = fromTask;
          this.toTask = toTask;
          this.calculatePath();
          this.create();
      }

      createClass(Gan2Arrow, [{
          key: 'calculatePath',
          value: function calculatePath() {
              var _gantt$option = this.gantt.option,
                  arrowCurve = _gantt$option.arrowCurve,
                  headerHeight = _gantt$option.headerHeight,
                  barHeight = _gantt$option.barHeight,
                  padding = _gantt$option.padding;
              var _ref = [this.fromTask.taskBar, this.toTask.taskBar],
                  fromTaskBar = _ref[0],
                  toTaskBar = _ref[1];
              // calculate path values

              var arrowPadding = 20;
              var startX = toTaskBar.$bar.getX() - arrowPadding;
              // set arrow startDate x point
              if (startX < fromTaskBar.$bar.getX() + arrowPadding) {
                  startX = fromTaskBar.$bar.getX() + arrowPadding;
              } else if (startX > fromTaskBar.$bar.getX() + fromTaskBar.$bar.getWidth() - arrowPadding) {
                  startX = fromTaskBar.$bar.getX() + fromTaskBar.$bar.getWidth() - arrowPadding;
              }
              var startY = headerHeight + barHeight + (padding + barHeight) * this.fromTask.index + padding;
              var endX = toTaskBar.$bar.getX() - padding / 2;
              var endY = headerHeight + barHeight / 2 + (padding + barHeight) * this.toTask.index + padding;
              var fromIsBelow = this.fromTask.index > this.toTask.index;
              var isClockwise = fromIsBelow ? 1 : 0;
              var curveY = fromIsBelow ? -arrowCurve : arrowCurve;
              var offset = endY + (fromIsBelow ? +arrowCurve : -arrowCurve);
              // define path variable
              this.path = 'M ' + startX + ' ' + startY + '\n                 V ' + offset + '\n                 a ' + arrowCurve + ' ' + arrowCurve + ' 0 0 ' + isClockwise + ' ' + arrowCurve + ' ' + curveY + '\n                 L ' + endX + ' ' + endY + '\n                 m -5 -5\n                 l 5 5\n                 l -5 5';
              if (toTaskBar.$bar.getX() <= fromTaskBar.$bar.getX() + padding) {
                  var down1 = padding / 2 - arrowCurve;
                  var down2 = toTaskBar.$bar.getY() + toTaskBar.height / 2 - curveY;
                  var left = toTaskBar.$bar.getX() - padding;
                  this.path = 'M ' + startX + ' ' + startY + '\n                   v ' + down1 + '\n                   a ' + arrowCurve + ' ' + arrowCurve + ' 0 0 1 -' + arrowCurve + ' ' + arrowCurve + '\n                   H ' + left + '\n                   a ' + arrowCurve + ' ' + arrowCurve + ' 0 0 ' + isClockwise + ' -' + arrowCurve + ' ' + curveY + '\n                   V ' + down2 + '\n                   a ' + arrowCurve + ' ' + arrowCurve + ' 0 0 ' + isClockwise + ' ' + arrowCurve + ' ' + curveY + '\n                   L ' + endX + ' ' + endY + '\n                   m -5 -5\n                   l 5 5\n                   l -5 5';
              }
          }
          /**
           * create path element
           */

      }, {
          key: 'create',
          value: function create() {
              this.$element = createSVG('path', {
                  d: this.path,
                  class: this.toTask.customArrowClass,
                  'data-from': this.fromTask.id,
                  'data-to': this.toTask.id
              });
          }
      }, {
          key: 'update',
          value: function update() {
              this.calculatePath();
              this.$element.setAttribute('d', this.path);
          }
      }]);
      return Gan2Arrow;
  }();

  var Gan2Task = function () {
      function Gan2Task(gan2Chart, task) {
          var defaultDateScale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DateScale.DAY;

          var _this = this;

          var parentTask = arguments[3];
          var id = arguments[4];
          classCallCheck(this, Gan2Task);

          this.gan2Chart = gan2Chart;
          this._task = task;
          this.id = id ? id.toString() : Gan2Task.generateId(task);
          this.name = task.name;
          this.index = gan2Chart._gan2TaskIndex++;
          this.startDate = DateUtil.parse(task.start);
          this.endDate = DateUtil.parse(task.end);
          this.progress = task.progress;
          this.progressFixed = task.progressFixed;
          this.customArrowClass = task.customArrowClass;
          this.customClass = task.customClass;
          this.fixed = task.fixed;
          this.parentTask = parentTask;
          this.childTask = [];
          this._arrows = [];
          // default task date
          if (!task.start && !task.end) {
              var today = DateUtil.today();
              this.startDate = today;
              this.endDate = DateUtil.add(today, 2, defaultDateScale);
          } else {
              this.startDate = DateUtil.parse(this.startDate) || DateUtil.add(this.endDate, -2, defaultDateScale);
              this.endDate = DateUtil.parse(this.endDate) || DateUtil.add(this.startDate, 2, defaultDateScale);
          }
          // if hours is not set, assume the last day is full day
          // e.g: 2018-09-09 becomes 2018-09-09 23:59:59
          var taskEndValue = DateUtil.getDateValues(this.endDate);
          if (taskEndValue.slice(3).every(function (d) {
              return d === 0;
          })) {
              this.endDate = DateUtil.add(this.endDate, 24, DateScale.HOUR);
          }
          // if has child task
          if (task.childTask) {
              this.childTask = task.childTask.map(function (v) {
                  return new Gan2Task(gan2Chart, v, defaultDateScale, _this);
              });
          }
      }
      /**
       * create arrow object
       * @param {number} parentId
       * @returns {Array<Gan2Arrow>}
       */


      createClass(Gan2Task, [{
          key: '_drawArrow',
          value: function _drawArrow(parentId) {
              var _this2 = this;

              this._arrows = [].concat(this.childTask.reduce(function (acc, cur) {
                  return acc.concat(cur._drawArrow(_this2.id));
              }, []));
              if (parentId) {
                  var arrow = new Gan2Arrow(this.gan2Chart, this.parentTask, this);
                  this.gan2Chart._layers['arrow'].appendChild(arrow.$element);
                  this._arrows.push(arrow);
              }
              return this._arrows;
          }
          /**
           * get all child tasks from this task
           */

      }, {
          key: 'getAllChildTaskWithThis',
          get: function get$$1() {
              return this.childTask.reduce(function (acc, cur) {
                  return acc.concat(cur.getAllChildTaskWithThis);
              }, []).concat(this);
          }
          /**
           * get count include child tasks
           * @returns {number}
           */

      }, {
          key: 'length',
          get: function get$$1() {
              return this.childTask.reduce(function (acc, cur) {
                  return acc + 1;
              }, 0) + 1;
          }
          /**
           * generate task uid
           * @param task
           */

      }], [{
          key: 'generateId',
          value: function generateId(task) {
              return task.name + '_' + Math.random().toString(36).slice(2, 12);
          }
      }]);
      return Gan2Task;
  }();

  var Gan2Bar = function () {
      function Gan2Bar(gan2Chart, task) {
          classCallCheck(this, Gan2Bar);

          this.gan2Chart = gan2Chart;
          this.task = task;
          this.fixed = task.fixed;
          this.progressfixed = task.progressFixed;
          this.prepareValues();
          this.draw();
          this.bindPopupEvent();
      }
      /**
       * setup default values
       */


      createClass(Gan2Bar, [{
          key: 'prepareValues',
          value: function prepareValues() {
              this.duration = DateUtil.diff(this.task.endDate, this.task.startDate, this.gan2Chart._viewMode - 1) / this.gan2Chart.option.step;
              this.width = this.gan2Chart.option.columnWidth * this.duration;
              this.height = this.gan2Chart.option.barHeight;
              this.x = this.computeX;
              this.y = this.computeY;
              this.cornerRadius = this.gan2Chart.option.barCornerRadius;
              this.progressWidth = this.gan2Chart.option.columnWidth * this.duration * (this.task.progress / 100) || 0;
              this.$group = createSVG('g', {
                  class: classNames.barWrapper + ' ' + (this.task.customClass || ''),
                  'data-id': this.task.id
              });
              this.$barGroup = createSVG('g', {
                  class: '' + classNames.barGroup,
                  appendTo: this.$group
              });
              this.$handleGroup = createSVG('g', {
                  class: '' + classNames.handleGroup,
                  appendTo: this.$group
              });
          }
      }, {
          key: 'draw',

          /**
           * draw bar
           */
          value: function draw() {
              this.drawBar();
              this.drawProgressBar();
              this.drawLabel();
              this.drawResizeHandles();
          }
          /**
           * draw task bar with animation
           */

      }, {
          key: 'drawBar',
          value: function drawBar() {
              this.$bar = createSVG('rect', {
                  x: this.x,
                  y: this.y,
                  width: this.width,
                  height: this.height,
                  rx: this.cornerRadius,
                  ry: this.cornerRadius,
                  class: '' + classNames.bar,
                  appendTo: this.$barGroup
              });
              animateSVG(this.$bar, 'width', 0, this.width);
              if (this.fixed) {
                  this.$barGroup.classList.add('' + classNames.barFixed);
              }
          }
          /**
           * draw progress bar with animation
           */

      }, {
          key: 'drawProgressBar',
          value: function drawProgressBar() {
              this.$progressBar = createSVG('rect', {
                  x: this.x,
                  y: this.y,
                  width: this.progressWidth,
                  height: this.height,
                  rx: this.cornerRadius,
                  ry: this.cornerRadius,
                  class: '' + classNames.progressBar,
                  appendTo: this.$barGroup
              });
              animateSVG(this.$progressBar, 'width', 0, this.progressWidth);
          }
          /**
           * draw task bar label
           */

      }, {
          key: 'drawLabel',
          value: function drawLabel() {
              var _this = this;

              createSVG('text', {
                  x: this.x + this.width / 2,
                  y: this.y + this.height / 2,
                  innerHTML: this.task.name,
                  class: '' + classNames.barLabel,
                  appendTo: this.$barGroup
              });
              // labels get BBox in the next tick
              requestAnimationFrame(function () {
                  return _this.updateLabelPosition();
              });
          }
          /**
           * if task is not fixed, draw task bar resize handler
           */

      }, {
          key: 'drawResizeHandles',
          value: function drawResizeHandles() {
              if (this.fixed) return;
              var bar = this.$bar;
              var handle_width = 8;
              createSVG('rect', {
                  x: bar.getX() + bar.getWidth() - 9,
                  y: bar.getY() + 1,
                  width: handle_width,
                  height: this.height - 2,
                  rx: this.cornerRadius,
                  ry: this.cornerRadius,
                  class: classNames.handle + ' right',
                  appendTo: this.$handleGroup
              });
              createSVG('rect', {
                  x: bar.getX() + 1,
                  y: bar.getY() + 1,
                  width: handle_width,
                  height: this.height - 2,
                  rx: this.cornerRadius,
                  ry: this.cornerRadius,
                  class: classNames.handle + ' left',
                  appendTo: this.$handleGroup
              });
              if (this.task.progress && this.task.progress < 100 && !this.progressfixed) {
                  this.$handleProgress = createSVG('polygon', {
                      points: this.getProgressPolygonPoints(),
                      class: classNames.handle + ' ' + classNames.progress,
                      appendTo: this.$handleGroup
                  });
              }
          }
          /**
           * get progress points for handle
           * @returns {Array<number>}
           */

      }, {
          key: 'getProgressPolygonPoints',
          value: function getProgressPolygonPoints() {
              var $progressBar = this.$progressBar;
              return [$progressBar.getEndX() - 5, $progressBar.getY() + $progressBar.getHeight(), $progressBar.getEndX() + 5, $progressBar.getY() + $progressBar.getHeight(), $progressBar.getEndX(), $progressBar.getY() + $progressBar.getHeight() - 8.66].toString();
          }
          /**
           * binding popup event
           */

      }, {
          key: 'bindPopupEvent',
          value: function bindPopupEvent() {
              var _this2 = this;

              var popupTrigger = this.gan2Chart.option.popupTrigger;
              // block popup when mouse down
              if (popupTrigger.includes('click')) {
                  $.on(this.$group, 'mousedown', function (e) {
                      return _this2.gan2Chart._$popupWrapper.classList.add('block-event');
                  });
                  $.on(this.$group, 'mouseup', function (e) {
                      return _this2.gan2Chart._$popupWrapper.classList.remove('block-event');
                  });
              }
              // bind popup open event
              $.on(this.$group, 'focus ' + popupTrigger, function (e) {
                  if (_this2.gan2Chart._draggingBar) {
                      return;
                  }
                  if (!_this2.gan2Chart._draggingBar && e.type === popupTrigger) {
                      _this2.gan2Chart._showPopup(e, _this2.task);
                  }
                  // remove active classname
                  _this2.gan2Chart._unSelectAll();
                  _this2.$group.classList.toggle('.' + classNames.active);
              });
              if (popupTrigger.includes('mouse')) {
                  // if mouse event, block bubble popup wrapper event
                  this.gan2Chart._$popupWrapper.classList.add('block-event');
                  $.on(this.$group, 'mouseleave', function (e) {
                      return _this2.gan2Chart._hidePopup(e);
                  });
              }
          }
          /**
           * return predicate input x is available position
           * @param x
           */

      }, {
          key: 'isUpdatableX',
          value: function isUpdatableX(x) {
              if (!this.task.parentTask) return true;
              return this.task.parentTask.taskBar.$bar.getX() <= x;
          }
          /**
           * update bar position on move event
           * @param x
           * @param width
           */

      }, {
          key: 'updateBarPosition',
          value: function updateBarPosition(_ref) {
              var _ref$x = _ref.x,
                  x = _ref$x === undefined ? null : _ref$x,
                  _ref$width = _ref.width,
                  width = _ref$width === undefined ? null : _ref$width;

              var bar = this.$bar;
              if (x) {
                  // update x position
                  // get all x values of parent task
                  var minX = this.task.getAllChildTaskWithThis.map(function (task) {
                      return task.taskBar.$bar.getX();
                  }).reduce(function (acc, cur) {
                      return acc > cur ? cur : acc;
                  });
                  // child task must not go before parent
                  if (!this.isUpdatableX(minX)) return;
                  bar.setAttribute('x', (+x).toString());
              }
              if (width && width >= this.gan2Chart.option.columnWidth) {
                  // update width
                  bar.setAttribute('width', (+width).toString());
              }
              // update bar label
              this.updateLabelPosition();
              // update bar handler
              this.updateHandlePosition();
              /**
               * update progress bar position
               */
              this.$progressBar.setAttribute('x', this.$bar.getX());
              this.$progressBar.setAttribute('width', this.$bar.getWidth() * (this.task.progress / 100));
              /**
               * update bar arrow position
               */
              this.task._arrows.forEach(function (arrow) {
                  return arrow.update();
              });
          }
          /**
           * update bar label position
           */

      }, {
          key: 'updateLabelPosition',
          value: function updateLabelPosition() {
              var bar = this.$bar,
                  label = this.$group.querySelector('.' + classNames.barLabel);
              if (label.getBBox().width > bar.getWidth()) {
                  label.setAttribute('x', bar.getX() + bar.getWidth() + 5);
              } else {
                  label.setAttribute('x', bar.getX() + bar.getWidth() / 2);
              }
          }
          /**
           * update task date
           */

      }, {
          key: 'dateChange',
          value: function dateChange(e) {
              var _computeStartEndDate = this.computeStartEndDate(),
                  _computeStartEndDate2 = slicedToArray(_computeStartEndDate, 2),
                  newStartDate = _computeStartEndDate2[0],
                  newEndDate = _computeStartEndDate2[1];

              var _ref2 = [this.task.startDate, this.task.endDate],
                  oldStartDate = _ref2[0],
                  oldEndDate = _ref2[1];
              // check and update changed

              if (this.task.startDate.getTime() !== newStartDate.getTime()) {
                  this.task.startDate = newStartDate;
              }
              if (this.task.endDate.getTime() !== newEndDate.getTime()) {
                  this.task.endDate = newEndDate;
              }
              this.gan2Chart._triggerEvent(e, 'change', [this.task]);
              this.gan2Chart._triggerEvent(e, 'taskChange', [this.task, oldStartDate, oldEndDate, newStartDate, newEndDate]);
          }
          /**
           * change progress bar
           */

      }, {
          key: 'progressChange',
          value: function progressChange(e) {
              var oldProgress = this.task.progress;
              var newProgress = Math.floor(this.$progressBar.getWidth() / this.$bar.getWidth() * 100);
              this.task.progress = newProgress;
              this.gan2Chart._triggerEvent(e, 'change', [this.task]);
              this.gan2Chart._triggerEvent(e, 'taskProgressChange', [this.task, oldProgress, newProgress]);
          }
          /**
           * compute on moved bar
           * @return {Date, Date} {newStartDate, newEndDate}
           */

      }, {
          key: 'computeStartEndDate',
          value: function computeStartEndDate() {
              var bar = this.$bar;
              var xUnits = bar.getX() / this.gan2Chart.option.columnWidth;
              var newStartDate = DateUtil.add(this.gan2Chart.startDate, xUnits * this.gan2Chart.option.step, this.gan2Chart._viewMode - 1);
              var widthUnits = bar.getWidth() / this.gan2Chart.option.columnWidth;
              var newEndDate = DateUtil.add(newStartDate, widthUnits * this.gan2Chart.option.step, this.gan2Chart._viewMode - 1);
              return [newStartDate, newEndDate];
          }
          /**
           * update bar handler position
           */

      }, {
          key: 'updateHandlePosition',
          value: function updateHandlePosition() {
              var bar = this.$bar;
              var leftHandle = this.$handleGroup.querySelector('.' + classNames.handle + '.left');
              leftHandle ? leftHandle.setAttribute('x', bar.getX() + 1) : '';
              var rightHandle = this.$handleGroup.querySelector('.' + classNames.handle + '.right');
              rightHandle ? rightHandle.setAttribute('x', bar.getEndX() - 9) : '';
              var progressHandle = this.$handleGroup.querySelector('.' + classNames.handle + '.' + classNames.progress);
              if (progressHandle) {
                  progressHandle.setAttribute('points', this.getProgressPolygonPoints());
              }
          }
      }, {
          key: 'computeX',
          get: function get$$1() {
              var columnWidth = this.gan2Chart.option.columnWidth;

              var diff = DateUtil.diff(this.gan2Chart.startDate, this.task.startDate, this.gan2Chart._viewMode);
              return diff * columnWidth;
          }
      }, {
          key: 'computeY',
          get: function get$$1() {
              return this.gan2Chart.option.headerHeight + this.gan2Chart.option.padding + this.task.index * (this.height + this.gan2Chart.option.padding);
          }
      }]);
      return Gan2Bar;
  }();

  var Gan2Popup = function () {
      /**
       *
       * @param {Gan2Chart} gan2Chart
       * @param customHtmlSupplier
       */
      function Gan2Popup(gan2Chart, customHtmlSupplier) {
          classCallCheck(this, Gan2Popup);

          this.gan2Chart = gan2Chart;
          this.$popupWrapper = gan2Chart._$popupWrapper;
          this.customHtmlSupplier = customHtmlSupplier || this.defaultHtmlSupplier;
          this.hide();
      }
      /**
       * show popup html
       * @param {Gan2Task} task
       * @param event
       */


      createClass(Gan2Popup, [{
          key: 'show',
          value: function show(task, event) {
              if (task) {
                  this.task = task;
              }
              this.html = this.customHtmlSupplier(this.task);
              this.html += '<div class="pointer"></div>';
              this.$popupWrapper.innerHTML = this.html;
              var $pointer = this.$popupWrapper.querySelector('.pointer');
              // set position
              $pointer.style.transform = 'rotateZ(90deg)';
              $pointer.style.left = '-7px';
              $pointer.style.top = '2px';
              var _ref = [this.task.taskBar.$bar.getX() + this.gan2Chart._$container.clientLeft, this.task.taskBar.$bar.getY(), this.task.taskBar.$bar.getWidth()],
                  x = _ref[0],
                  y = _ref[1],
                  width = _ref[2];

              if (event && event.type.includes('mouse')) {
                  x = event.offsetX - width + 10;
                  y = event.offsetY - 5;
              }
              this.$popupWrapper.style.left = x + (width + 10) + 'px';
              this.$popupWrapper.style.top = y + 'px';
              // show
              this.$popupWrapper.style.opacity = '1';
          }
          /**
           * hide popup html
           */

      }, {
          key: 'hide',
          value: function hide() {
              this.$popupWrapper.style.left = '0px';
              this.$popupWrapper.style.top = '0px';
              this.$popupWrapper.style.opacity = '0';
          }
          /**
           * default popup html
           * @param task
           */

      }, {
          key: 'defaultHtmlSupplier',
          value: function defaultHtmlSupplier(task) {
              var start = DateUtil.format(task.startDate, 'YYYY-MM-DD HH:mm:ss', this.gan2Chart.option.language);
              var end = DateUtil.format(task.endDate, 'YYYY-MM-DD HH:mm:ss', this.gan2Chart.option.language);
              return '<div class="title">' + task.name + '</div>\n            <div class="content">\n              <div>' + start + '</div>\n              <div>~ ' + end + '</div>\n            </div>';
          }
      }]);
      return Gan2Popup;
  }();

  /**
   * default options
   */
  var defaultOption = {
      headerHeight: 50,
      columnWidth: 40,
      step: 24,
      barHeight: 20,
      barCornerRadius: 2,
      arrowCurve: 5,
      padding: 18,
      viewMode: 'Day',
      popupTrigger: 'mousemove',
      popupHtmlSupplier: null,
      autoScroll: true,
      language: 'en',
      datePaddingQty: 'auto',
      paddingBarCount: 2
  };

  var Gan2Chart = function () {
      function Gan2Chart(wrapper, tasks, option) {
          classCallCheck(this, Gan2Chart);

          this._gan2TaskIndex = 0;
          this.chartDates = [];
          this.bars = [];
          this.isPopupOpen = false;
          this.option = Object.assign({}, defaultOption, option);
          this.constructOption = Object.assign({}, this.option);
          if (this.option.startDate) {
              this.startDate = DateUtil.parse(this.option.startDate);
          }
          if (this.option.endDate) {
              this.endDate = DateUtil.parse(this.option.endDate);
          }
          this.setupWrapper(wrapper);
          this.setupTasks(tasks);
          this.changeViewMode();
          this.bindGridClickEvent();
          this.bindBarEvent();
          this.progressBarEventBind();
      }
      /**
       * initialize container and svg elements
       * @param element
       */


      createClass(Gan2Chart, [{
          key: 'setupWrapper',
          value: function setupWrapper(element) {
              var $element = void 0,
                  svgElement = void 0;
              // TypeCheck
              if (typeof element === 'string') {
                  $element = document.querySelector(element);
              } else if (element instanceof HTMLElement) {
                  $element = element;
                  svgElement = element.querySelector('svg');
              } else {
                  svgElement = element;
              }
              // create SVG element
              if (!svgElement) {
                  this.$svg = createSVG('svg', {
                      appendTo: $element,
                      class: classNames.element
                  });
              } else {
                  this.$svg = svgElement;
                  this.$svg.className.add(classNames.element);
              }
              // create wrapper element
              this._$container = document.createElement('div');
              this._$container.classList.add(classNames.container);
              // append elements
              var parentElement = this.$svg.parentElement;
              parentElement.appendChild(this._$container);
              this._$container.appendChild(this.$svg);
              // popup
              this._$popupWrapper = document.createElement('div');
              this._$popupWrapper.classList.add(classNames.popupWrapper);
              this._$container.appendChild(this._$popupWrapper);
          }
          /**
           * task to Gan2Task
           * @param task
           */

      }, {
          key: 'setupTasks',
          value: function setupTasks(task) {
              var _this = this;

              if (!Array.isArray(task)) {
                  task = [task];
              } else if (task[0] instanceof Gan2Task) {
                  task = this.gan2TaskToTask(task);
              }
              this.tasks = task.map(function (task) {
                  return new Gan2Task(_this, task, _this._viewMode);
              });
              this._gan2TaskLength = this.tasks.reduce(function (acc, cur) {
                  return acc + cur.length;
              }, 0) + this.option.paddingBarCount;
          }
          /**
           * update view mode and redraw with event handling
           * @param newViewMode
           * @param setScroll
           */

      }, {
          key: 'changeViewMode',
          value: function changeViewMode() {
              var newViewMode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.option.viewMode;
              var setScroll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.option.autoScroll;

              this.option.viewMode = newViewMode.replace(' ', '_').toUpperCase();
              this.updateViewScale();
              this.setupDate();
              this.render();
              this._hidePopup();
              setScroll ? this.setScrollPosition() : '';
          }
          /**
           * update view scale
           */

      }, {
          key: 'updateViewScale',
          value: function updateViewScale() {
              switch (this._viewMode) {
                  case DateScale.HOUR:
                      this.option.step = this.constructOption.step * 2.5;
                      this.option.columnWidth = this.constructOption.columnWidth;
                      break;
                  case DateScale.DAY:
                      this.option.step = this.constructOption.step;
                      this.option.columnWidth = this.constructOption.columnWidth;
                      break;
                  default:
                      this.option.step = this.constructOption.step * 30;
                      this.option.columnWidth = this.constructOption.columnWidth * 2;
              }
          }
          /**
           * set chart dates
           */

      }, {
          key: 'setupDate',
          value: function setupDate() {
              var self = this;
              setupGanttDateRange();
              setupDateValue();
              /**
               * find startDate and endDate date for gantt chart drawing
               * @param datePaddingScale
               * @param datePaddingQty
               */
              function setupGanttDateRange() {
                  var datePaddingScale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self._viewMode;
                  var datePaddingQty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : self.option.datePaddingQty;

                  var checkTasks = function checkTasks(tasks, startDate, endDate) {
                      tasks.forEach(function (task) {
                          if (!startDate || task.start.getTime() < startDate.getTime()) startDate = task.start;
                          if (!endDate || task.end.getTime() > endDate.getTime()) endDate = task.end;
                          if (task.childTask) {
                              var _checkTasks = checkTasks(task.childTask, startDate, endDate);

                              var _checkTasks2 = slicedToArray(_checkTasks, 2);

                              startDate = _checkTasks2[0];
                              endDate = _checkTasks2[1];
                          }
                      });
                      return [startDate, endDate];
                  };
                  // find min and max date

                  var _checkTasks3 = checkTasks(self.tasks),
                      _checkTasks4 = slicedToArray(_checkTasks3, 2),
                      startDate = _checkTasks4[0],
                      endDate = _checkTasks4[1];
                  // date qty auto configuration


                  if (typeof datePaddingQty === 'string') {
                      var diff = DateUtil.diff(startDate, endDate, datePaddingScale);
                      var count = datePaddingScale >= DateScale.MONTH ? 18 : 30;
                      datePaddingQty = diff < count ? (count - diff) / 2 : 4;
                  }
                  // if user does not input range date, add padding date
                  if (!self.option.startDate) {
                      self.startDate = DateUtil.add(DateUtil.startOf(startDate, datePaddingScale), -datePaddingQty, datePaddingScale);
                  }
                  if (!self.option.endDate) {
                      self.endDate = DateUtil.add(DateUtil.startOf(endDate, datePaddingScale), datePaddingQty, datePaddingScale);
                  }
              }
              /**
               * put chartDates based on datescale
               * @param dateScale
               */
              function setupDateValue() {
                  var dateScale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self._viewMode;

                  self.chartDates.splice(0);
                  var currentDate = DateUtil.clone(self.startDate);
                  self.chartDates.push(currentDate);
                  while (currentDate < self.endDate) {
                      currentDate = DateUtil.add(currentDate, 1, dateScale);
                      self.chartDates.push(currentDate);
                  }
              }
          }
          /**
           * draw svg elements
           */

      }, {
          key: 'render',
          value: function render() {
              // clear svg
              this.$svg.innerHTML = '';
              this.bars.splice(0);
              // draw svg _layers
              this.setupLayer();
              // draw grid svg
              this.drawGrid();
              // draw date text and divide bar
              this.drawDateAndDivideBar();
              // create Gan2Bar Object and draw SVG element
              this.drawGanttBars();
              // create arrow object
              this.drawArrows();
          }
          /**
           * scroll To task startDate position
           */

      }, {
          key: 'setScrollPosition',
          value: function setScrollPosition() {
              var parentElement = this.$svg.parentElement;
              if (!parentElement) return;
              var datePaddingQty = this.option.datePaddingQty;
              if (typeof datePaddingQty === 'string') {
                  // date padding auto check
                  datePaddingQty = 4;
              }
              parentElement.scrollLeft = datePaddingQty * this.option.columnWidth - this.option.columnWidth;
          }
          /**
           * create and draw arrow object
           */

      }, {
          key: 'drawArrows',
          value: function drawArrows() {
              this.tasks.forEach(function (task) {
                  return task._drawArrow();
              });
          }
          /**
           * create svg layer
           */

      }, {
          key: 'setupLayer',
          value: function setupLayer() {
              this._layers = {};
              var layers = ['grid', 'date', 'arrow', 'progress', 'bar', 'details'];
              var _iteratorNormalCompletion = true;
              var _didIteratorError = false;
              var _iteratorError = undefined;

              try {
                  for (var _iterator = layers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                      var layer = _step.value;

                      this._layers[layer] = createSVG('g', {
                          class: layer,
                          appendTo: this.$svg
                      });
                  }
              } catch (err) {
                  _didIteratorError = true;
                  _iteratorError = err;
              } finally {
                  try {
                      if (!_iteratorNormalCompletion && _iterator.return) {
                          _iterator.return();
                      }
                  } finally {
                      if (_didIteratorError) {
                          throw _iteratorError;
                      }
                  }
              }
          }
          /**
           * draw Gantt bars
           */

      }, {
          key: 'drawGanttBars',
          value: function drawGanttBars() {
              var _this2 = this;

              // create taskBar object from task. and push it
              var createAndPushBar = function createAndPushBar(self, task) {
                  if (task.childTask) {
                      task.childTask.forEach(function (t) {
                          return createAndPushBar(self, t);
                      });
                  }
                  var bar = new Gan2Bar(self, task);
                  task.taskBar = bar;
                  self._layers['bar'].appendChild(bar.$group);
                  self.bars.push(bar);
              };
              this.tasks.forEach(function (task) {
                  return createAndPushBar(_this2, task);
              });
          }
          /**
           * draw grid svg elements
           */

      }, {
          key: 'drawGrid',
          value: function drawGrid() {
              var self = this;
              // drawBackground
              (function () {
                  self.gridWidth = self.chartDates.length * self.option.columnWidth;
                  self.gridHeight = self.option.headerHeight + self.option.padding + (self.option.barHeight + self.option.padding) * self._gan2TaskLength;
                  createSVG('rect', {
                      x: 0,
                      y: 0,
                      width: self.gridWidth,
                      height: self.gridHeight,
                      class: classNames.gridBackground,
                      appendTo: self._layers['grid']
                  });
                  $.attr(self.$svg, {
                      height: self.gridHeight,
                      width: self.gridWidth
                  });
              })();
              // drawGridRows
              (function () {
                  var rowsLayer = createSVG('g', { appendTo: self._layers['grid'] });
                  var linesLayer = createSVG('g', { appendTo: self._layers['grid'] });
                  var rowWidth = self.chartDates.length * self.option.columnWidth;
                  var rowHeight = self.option.barHeight + self.option.padding;
                  // grid row y value
                  var rowY = self.option.headerHeight + self.option.padding / 2;
                  for (var i = 0, length = self._gan2TaskLength; i < length; i++) {
                      createSVG('rect', {
                          x: 0,
                          y: rowY,
                          width: rowWidth,
                          height: rowHeight,
                          class: classNames.gridRow,
                          appendTo: rowsLayer
                      });
                      createSVG('line', {
                          x1: 0,
                          y1: rowY + rowHeight,
                          x2: rowWidth,
                          y2: rowY + rowHeight,
                          class: classNames.rowLine,
                          appendTo: linesLayer
                      });
                      rowY += self.option.barHeight + self.option.padding;
                  }
              })();
              // drawGridHeader
              (function () {
                  var headerWidth = self.chartDates.length * self.option.columnWidth;
                  var headerHeight = self.option.headerHeight + 10;
                  createSVG('rect', {
                      x: 0,
                      y: 0,
                      width: headerWidth,
                      height: headerHeight,
                      class: classNames.gridHeader,
                      appendTo: self._layers['grid']
                  });
              })();
              // drawGridTicks
              (function () {
                  var columnWidth = self.option.columnWidth;
                  var tickY = self.option.headerHeight + self.option.padding / 2;
                  var tickHeight = (self.option.barHeight + self.option.padding) * self._gan2TaskLength;
                  for (var i = 0, length = self.chartDates.length; i < length; i++) {
                      createSVG('path', {
                          d: 'M ' + columnWidth * i + ' ' + tickY + ' v ' + tickHeight,
                          class: classNames.tick,
                          appendTo: self._layers['grid']
                      });
                  }
              })();
              // drawGridHighlight
              (function () {
                  var now = DateUtil.now();
                  var viewMode = self._viewMode;
                  if (now < self.chartDates[0] || self.chartDates[self.chartDates.length - 1] < now) return;
                  var x = DateUtil.diff(now, self.chartDates[0], viewMode) * self.option.columnWidth;
                  var width = self.option.columnWidth;
                  var height = (self.option.barHeight + self.option.padding) * self._gan2TaskLength + self.option.headerHeight + self.option.padding / 2;
                  createSVG('rect', {
                      x: x,
                      y: 0,
                      width: width,
                      height: height,
                      class: classNames.todayHighlight,
                      appendTo: self._layers['grid']
                  });
              })();
          }
          /**
           * draw top dates and division bar
           */

      }, {
          key: 'drawDateAndDivideBar',
          value: function drawDateAndDivideBar() {
              var dateLabelList = getDateLabelForDraw(this);
              var lastDateInfo = dateLabelList[0];
              for (var i = 0, length = dateLabelList.length - 1; i <= length; i++) {
                  var date = dateLabelList[i];
                  // lower text draw
                  createSVG('text', {
                      x: date.lowerX,
                      y: date.lowerY,
                      innerHTML: date.lowerText,
                      class: classNames.lowerText,
                      appendTo: this._layers['date']
                  });
                  // upper text draw
                  if (i === length || lastDateInfo.upperText != date.upperText) {
                      var lastUpperTextPadding = i === length ? this.option.columnWidth / 2 : 0;
                      var $upperText = createSVG('text', {
                          x: (lastDateInfo.upperX + date.upperX) / 2 + lastUpperTextPadding,
                          y: lastDateInfo.upperY,
                          innerHTML: lastDateInfo.upperText,
                          class: classNames.upperText,
                          appendTo: this._layers['date']
                      });
                      // remove out-of-bound chartDates
                      if ($upperText.getBBox().x > this._layers['grid'].getBBox().width) {
                          $upperText.remove();
                      }
                      // upper text divide line
                      if (lastDateInfo.upperText === date.upperText) return;
                      createSVG('line', {
                          x1: date.lowerX - this.option.columnWidth / 2,
                          y1: 0,
                          x2: date.lowerX - this.option.columnWidth / 2,
                          y2: this.gridHeight,
                          class: classNames.upperDivisionBar,
                          appendTo: this._layers['grid']
                      });
                      lastDateInfo = date;
                  }
              }
              /**
               * get dateInfo list for drawing
               * @param self
               * @returns {DateLabel}
               */
              function getDateLabelForDraw(self) {
                  return self.chartDates.map(function (date, i) {
                      return self.getDateLabel(date, i);
                  });
              }
          }
          /**
           * get Date Label Informations
           * @param date
           * @param i
           * @returns {DateLabel}
           */

      }, {
          key: 'getDateLabel',
          value: function getDateLabel(date, i) {
              // get date labels.
              var _DateUtil$getDateLabe = DateUtil.getDateLabel(date, this._viewMode, this.option.language),
                  lower = _DateUtil$getDateLabe.lower,
                  upper = _DateUtil$getDateLabe.upper;

              var basePosition = {
                  x: i * this.option.columnWidth,
                  lowerY: this.option.headerHeight,
                  upperY: this.option.headerHeight - 25
              };
              return {
                  upperText: upper,
                  lowerText: lower,
                  upperX: basePosition.x,
                  upperY: basePosition.upperY,
                  lowerX: basePosition.x + this.option.columnWidth / 2,
                  lowerY: upper ? basePosition.lowerY : (basePosition.upperY + basePosition.lowerY) / 2
              };
          }
      }, {
          key: 'bindGridClickEvent',
          value: function bindGridClickEvent() {
              var _this3 = this;

              // grid click event
              $.on(this.$svg, this.option.popupTrigger, '.' + classNames.gridRow + ', .' + classNames.gridHeader, function (e) {
                  _this3._unSelectAll();
                  _this3._hidePopup(e);
              });
          }
          /**
           * bind grid and taskBar events
           */

      }, {
          key: 'bindBarEvent',
          value: function bindBarEvent() {
              var _this4 = this;

              var xOnStart = 0;
              var yOnStart = 0;
              // now event
              var isDragging = false;
              var isResizingLeft = false;
              var isResizingRight = false;
              var bars = []; // instanceof Gan2Bar
              var bar = null;
              var isAction = function isAction() {
                  return isDragging || isResizingLeft || isResizingRight;
              };
              // drag startDate event handling
              $.on(this.$svg, 'mousedown', '.' + classNames.barWrapper + ', .' + classNames.handle, function (e, $bar) {
                  var barWrapper = $.closest('.' + classNames.barWrapper, $bar);
                  barWrapper.classList.add(classNames.active);
                  // get bar object
                  bar = _this4._getBar(barWrapper.getAttribute('data-id'));
                  if (!bar || bar && bar.fixed) return; // invalid or fixed bar
                  // check target and event
                  var classList = $bar.classList;
                  if (classList.contains('left')) {
                      isResizingLeft = true;
                  } else if (classList.contains('right')) {
                      isResizingRight = true;
                  } else if (classList.contains('' + classNames.barWrapper)) {
                      isDragging = true;
                  }
                  // event startDate position
                  xOnStart = e.offsetX;
                  yOnStart = e.offsetY;
                  // move all bars
                  bars = bar.task.getAllChildTaskWithThis.map(function (task) {
                      return task.taskBar;
                  });
                  bars.forEach(function (bar) {
                      var $bar = bar.$bar;
                      $bar.ox = $bar.getX();
                      $bar.oy = $bar.getY();
                      $bar.owidth = $bar.getWidth();
                      $bar.finaldx = 0;
                  });
              });
              // dragging event handling
              $.on(this.$svg, 'mousemove', function (e) {
                  if (!isAction()) return;
                  var dx = e.offsetX - xOnStart;
                  var draggingBar = bar;
                  bars.forEach(function (bar) {
                      var $bar = bar.$bar;
                      $bar.finaldx = _this4.getSnapPosition(dx);
                      if (isResizingLeft) {
                          if (draggingBar === bar) {
                              bar.updateBarPosition({
                                  x: $bar.ox + $bar.finaldx,
                                  width: $bar.owidth - $bar.finaldx
                              });
                          } else {
                              bar.updateBarPosition({ x: $bar.ox + $bar.finaldx });
                          }
                      } else if (isResizingRight) {
                          bar.updateBarPosition({ width: $bar.owidth + $bar.finaldx });
                      } else if (isDragging) {
                          var moveX = $bar.ox + $bar.finaldx;
                          if (bar.isUpdatableX(moveX)) bar.updateBarPosition({ x: moveX });
                      }
                  });
                  // if moved snap position, hold dragged bar
                  if (dx !== bar.$bar.finaldx) {
                      _this4._draggingBar = draggingBar;
                  }
                  // if popup opened, popup html redraw
                  bar.dateChange(e);
                  _this4._redrawPopup();
              });
              // drag endDate event handling
              $.on(this.$svg, 'mouseup', function (e) {
                  bars.forEach(function (bar) {
                      var $bar = bar.$bar;
                      if (!$bar.finaldx) return;
                      bar.dateChange(e);
                  });
                  if (!_this4._draggingBar) {
                      if (e.target.parentElement.classList.contains('' + classNames.barGroup)) {
                          _this4._triggerEvent(e, 'taskClick', [bar.task]);
                      }
                  }
              });
              /**
               * bind mouse up event on document
               */
              this._$container.addEventListener('mouseup', function (e) {
                  if (isDragging || isResizingLeft || isResizingRight) {
                      bars.forEach(function (bar) {
                          return bar.$group.classList.remove('' + classNames.active);
                      });
                  }
                  isResizingRight = isResizingLeft = isDragging = false;
                  var self = _this4;
                  if (self._draggingBar) {
                      _this4.setupDate();
                      _this4.render();
                      setTimeout(function () {
                          return self._draggingBar = null;
                      }, 10);
                  }
              });
          }
          /**
           * progress bar event bind
           */

      }, {
          key: 'progressBarEventBind',
          value: function progressBarEventBind() {
              var _this5 = this;

              var onStartX = 0;
              var isResizing = null;
              var bar = null;
              var $bar = null;
              var $progressBar = null;
              $.on(this.$svg, 'mousedown', '.' + classNames.handle + '.' + classNames.progress, function (e, $handle) {
                  isResizing = true;
                  onStartX = e.offsetX;
                  var $barWrapper = $.closest('.' + classNames.barWrapper, $handle);
                  bar = _this5._getBar($barWrapper.getAttribute('data-id'));
                  $bar = bar.$bar;
                  $progressBar = bar.$progressBar;
                  $progressBar.finaldx = 0;
                  $progressBar.owidth = $progressBar.getWidth();
                  $progressBar.minDx = -$progressBar.getWidth();
                  $progressBar.maxDx = $bar.getWidth() - $progressBar.getWidth();
              });
              $.on(this.$svg, 'mousemove', function (e) {
                  if (!isResizing) return;
                  var dx = e.offsetX - onStartX;
                  if (dx > $progressBar.maxDx) {
                      dx = $progressBar.maxDx;
                  }
                  if (dx < $progressBar.minDx) {
                      dx = $progressBar.minDx;
                  }
                  var $handle = bar.$handleProgress;
                  $.attr($progressBar, 'width', $progressBar.owidth + dx);
                  $.attr($handle, 'points', bar.getProgressPolygonPoints());
                  $progressBar.finaldx = dx;
                  // if popup opened, popup html redraw
                  bar.progressChange(e);
                  _this5._redrawPopup();
              });
              $.on(this.$svg, 'mouseup', function (e) {
                  isResizing = false;
                  if (!($progressBar && $progressBar.finaldx)) return;
                  bar.progressChange(e);
                  _this5._unSelectAll();
              });
          }
      }, {
          key: '_redrawPopup',
          value: function _redrawPopup() {
              // if popup opened, popup html redraw
              if (this.isPopupOpen) {
                  this._showPopup();
              }
          }
          /**
           * show popup
           * @param task
           * @param event
           */

      }, {
          key: '_showPopup',
          value: function _showPopup(event, task) {
              if (!this.popup) {
                  this.popup = new Gan2Popup(this, this.option.popupHtmlSupplier);
              }
              if (!this.isPopupOpen) {
                  // trigger event only first time
                  this._triggerEvent(event, 'popupOpen', [task]);
              }
              this.isPopupOpen = true;
              this.popup.show(task, event);
          }
          /**
           * hide popup
           */

      }, {
          key: '_hidePopup',
          value: function _hidePopup(e) {
              if (!this.popup) return;
              if (this.isPopupOpen) {
                  this._triggerEvent(e, 'popupClose', []);
              }
              this.isPopupOpen = false;
              this.popup.hide();
          }
          /**
           * find bar object
           * @param id
           * @returns {Gan2Bar}
           */

      }, {
          key: '_getBar',
          value: function _getBar(id) {
              return this.bars.find(function (bar) {
                  return bar.task.id === id;
              });
          }
          /**
           * get now viewmode
           * @returns {DateScale}
           */

      }, {
          key: 'getSnapPosition',

          /**
           *
           * @param dx
           */
          value: function getSnapPosition(dx) {
              var odx = dx,
                  rem = void 0,
                  position = void 0;
              if (this._viewMode === DateScale.MONTH) {
                  rem = dx % (this.option.columnWidth / 30);
                  position = odx - rem + (rem < this.option.columnWidth / 60 ? 0 : this.option.columnWidth / 30);
              } else {
                  rem = dx % this.option.columnWidth;
                  position = odx - rem + (rem < this.option.columnWidth / 2 ? 0 : this.option.columnWidth);
              }
              return position;
          }
          /**
           * convert gan2Task to Task
           * @param gan2Tasks
           */

      }, {
          key: 'gan2TaskToTask',
          value: function gan2TaskToTask(gan2Tasks) {
              var _this6 = this;

              return gan2Tasks.map(function (gan2t) {
                  var task = gan2t._task;
                  task.childTask = _this6.gan2TaskToTask(gan2t.childTask);
                  return task;
              });
          }
          /**
           * unSelect method
           */

      }, {
          key: '_unSelectAll',
          value: function _unSelectAll() {
              this.$svg.querySelectorAll('.bar .' + classNames.barWrapper).forEach(function (el) {
                  return el.classList.remove(classNames.active);
              });
          }
          /**
           * triggering user option event
           * @param e
           * @param eventName
           * @param params
           */

      }, {
          key: '_triggerEvent',
          value: function _triggerEvent(e, eventName, params) {
              var key = Object.keys(this.option).find(function (key) {
                  return key.toUpperCase() === 'ON' + eventName.toUpperCase();
              });
              if (this.option[key]) {
                  var _option;

                  (_option = this.option)[key].apply(_option, [e].concat(toConsumableArray(params)));
              }
          }
          /**
           * refresh tasks
           * @param tasks
           */

      }, {
          key: 'refresh',
          value: function refresh(tasks) {
              if (tasks) {
                  this.setupTasks(tasks);
              }
              this.changeViewMode();
          }
      }, {
          key: '_viewMode',
          get: function get$$1() {
              var dateScale = DateScale[this.option.viewMode.replace(' ', '_').toUpperCase()];
              return dateScale ? dateScale : DateScale.DAY;
          }
      }]);
      return Gan2Chart;
  }();

  return Gan2Chart;

}());
