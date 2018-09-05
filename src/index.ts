import './gantt.scss';
import {$, createSVG} from './svg_util';
import Gan2Task from "./gan2_task";
import DateUtil from "./date_util";
import {classNames, DateScale} from "./gan2_constants";
import Gan2Bar from "./gan2_bar"
import Gan2Popup from "./gan2_popup";

/**
 * Gantt Task
 */
export interface Task {
  startDate: string,
  endDate: string,
  name: string,
  id: string,
  progress: number,
  index?: number,
  customClass?: string;
  customArrowClass?: string;
  fixed?: boolean;
  progressFixed?: boolean;
  childTask: Task[]
}

/**
 * Gant2 Option
 */
export interface Option {
  headerHeight: number,
  columnWidth: number,
  step: number,
  barHeight: number,
  barCornerRadius: number,
  arrowCurve: number,
  padding: number,
  viewMode: string,       // default: day. ['hour', 'day', 'month', 'year']
  popupTrigger: string,   // default: mousemove. ['click', 'mousemove', etc...]
  popupHtmlSupplier: (Gan2Task) => HTMLDocument,
  language: string,
  startDate?: string,     // optional. gantt chart startDate date
  endDate?: string,       // optional. gantt chart endDate date
  weekendCheck: boolean,
  autoScroll: boolean,    // default: true. scroll to gantt chart startDate point
  datePaddingQty: any,    // default: true. ['auto', number] chart will be shown [startDate date - qty] to [endDate date + qty]
  paddingBarCount: number // default: 2. set the padding bar count on the bottom
}

/**
 * date label on grid header
 */
interface DateLabel {
  upperText: string,
  lowerText: string,
  upperX: number,
  upperY: number,
  lowerX: number,
  lowerY: number
}

/**
 * default options
 */
const defaultOption: Option = {
  headerHeight: 50,
  columnWidth: 40,
  step: 24,
  barHeight: 20,
  barCornerRadius: 2,
  arrowCurve: 5,
  padding: 18,
  viewMode: 'Day',
  weekendCheck: true,
  popupTrigger: 'mousemove',
  popupHtmlSupplier: null,
  autoScroll: true,
  language: 'en',
  datePaddingQty: 'auto',
  paddingBarCount: 2
};

export default class Gan2Chart {

  option: Option;
  private constructOption: Option;

  private $svg: SVGElement;
  _$container: HTMLElement;
  _$popupWrapper: HTMLElement;
  private popup: Gan2Popup;

  tasks: Gan2Task[];
  _gan2TaskIndex: number = 0;
  _gan2TaskLength: number;

  // gantt chart property
  startDate: Date;
  endDate: Date;
  private chartDates: Date[] = [];
  _layers: {};
  _draggingBar: Gan2Bar;
  private bars: Gan2Bar[] = [];
  private isPopupOpen: boolean = false;

  // grid info
  private gridWidth: number;
  private gridHeight: number;

  constructor(wrapper: string | HTMLElement | SVGElement,
              tasks: any[],
              option: Option) {

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
  private setupWrapper(element: string | HTMLElement | SVGElement) {
    let $element: HTMLElement,
      svgElement: SVGElement;

    // TypeCheck
    if (typeof element === 'string') {
      $element = document.querySelector(element);
      if (!$element) throw 'Gan2Chart needs wrapper element';

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
    const parentElement = this.$svg.parentElement;
    parentElement.appendChild(this._$container);
    this._$container.appendChild(this.$svg);

    // popup
    this._$popupWrapper = document.createElement('div');
    this._$popupWrapper.classList.add(classNames.popupWrapper);
    this._$container.appendChild(this._$popupWrapper);
  }

  /**
   * task to Gan2Task
   * @param tasks
   */
  private setupTasks(tasks: any[]) {
    if (!(Array.isArray(tasks))) {
      tasks = [tasks];

    } else if (tasks[0] instanceof Gan2Task) {
      tasks = this.gan2TaskToTask(tasks);

    }

    this.tasks = tasks.map(task => new Gan2Task(this, task, this._viewMode));
    this._gan2TaskLength = this.tasks.reduce((acc, cur) => acc + cur.length, 0)
                          + this.option.paddingBarCount;
  }

  /**
   * update view mode and redraw with event handling
   * @param newViewMode
   * @param setScroll
   */
  public changeViewMode(newViewMode: string = this.option.viewMode,
                        setScroll: boolean = this.option.autoScroll) {
    this.option.viewMode = newViewMode.replace(' ', '_')
                                      .toUpperCase();
    this.updateViewScale();
    this.setupDate();
    this.render();
    this._hidePopup();
    setScroll ? this.setScrollPosition() : '';
  }

  /**
   * update view scale
   */
  private updateViewScale(): void {
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
  private setupDate() {
    const self = this;
    setupGanttDateRange();
    setupDateValue();

    /**
     * find startDate and endDate date for gantt chart drawing
     * @param datePaddingScale
     * @param datePaddingQty
     */
    function setupGanttDateRange(datePaddingScale: DateScale = self._viewMode,
                                datePaddingQty: any = self.option.datePaddingQty): void {

      const checkTasks = (tasks, startDate?, endDate?) => {
        tasks.forEach(task => {
          if (!startDate || task.startDate.getTime() < startDate.getTime())
            startDate = task.startDate;
          if (!endDate || task.endDate.getTime() > endDate.getTime())
            endDate = task.endDate;

          if (task.childTask) {
            [startDate, endDate] = checkTasks(task.childTask, startDate, endDate);
          }
        });
        return [startDate, endDate];
      };



      // find min and max date
      const [startDate, endDate] = checkTasks(self.tasks);

      // date qty auto configuration
      if (typeof datePaddingQty === 'string') {
        const diff = DateUtil.diff(startDate, endDate, datePaddingScale);
        const count = datePaddingScale >= DateScale.MONTH ? 18 : 30;
        datePaddingQty = diff < count ? (count - diff) / 2 : 4;
      }

      // if user does not input range date, add padding date
      if (!self.option.startDate) {
        self.startDate = DateUtil.add(DateUtil.startOf(startDate, datePaddingScale),
                                      -datePaddingQty,
                                    datePaddingScale);
      }

      if (!self.option.endDate) {
        self.endDate = DateUtil.add(DateUtil.startOf(endDate, datePaddingScale),
                                    datePaddingQty,
                                    datePaddingScale);
      }
    }


    /**
     * put chartDates based on datescale
     * @param dateScale
     */
    function setupDateValue(dateScale: DateScale = self._viewMode): void {
      self.chartDates.splice(0);

      let currentDate = DateUtil.clone(self.startDate);
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
  private render(): void {
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
  private setScrollPosition() {
    const parentElement = this.$svg.parentElement;
    if (!parentElement) return;

    let datePaddingQty = this.option.datePaddingQty;
    if (typeof datePaddingQty === 'string') { // date padding auto check
      datePaddingQty = 4;
    }
    parentElement.scrollLeft = datePaddingQty * this.option.columnWidth
                                - this.option.columnWidth;
  }

  /**
   * create and draw arrow object
   */
  private drawArrows(): void {
    this.tasks.forEach(task => task._drawArrow());
  }

    /**
     * create svg layer
     */
  private setupLayer(): void {
      this._layers = {};
      const layers = ['grid', 'date', 'arrow', 'progress', 'bar', 'details'];
      for (let layer of layers) {
        this._layers[layer] = createSVG('g', {
                                              class: layer,
                                              appendTo: this.$svg
                                            });
      }
    }

  /**
   * draw Gantt bars
   */
  private drawGanttBars(): void {

    // create taskBar object from task. and push it
    const createAndPushBar = (self, task) => {
      if (task.childTask) {
        task.childTask.forEach(t => createAndPushBar(self, t));
      }
      const bar = new Gan2Bar(self, task);
      task.taskBar = bar;
      self._layers['bar'].appendChild(bar.$group);
      self.bars.push(bar);
    };

    this.tasks.forEach(task => createAndPushBar(this, task));
  }

  /**
   * draw grid svg elements
   */
  private drawGrid(): void {
    const self = this;

    // drawBackground
    (function () {
      self.gridWidth = self.chartDates.length * self.option.columnWidth;
      self.gridHeight = self.option.headerHeight
                        + self.option.padding
                        + (self.option.barHeight + self.option.padding) * self._gan2TaskLength;

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
      const rowsLayer = createSVG('g', {appendTo: self._layers['grid']});
      const linesLayer = createSVG('g', {appendTo: self._layers['grid']});

      const rowWidth = self.chartDates.length * self.option.columnWidth;
      const rowHeight = self.option.barHeight + self.option.padding;

      // grid row y value
      let rowY = self.option.headerHeight + self.option.padding / 2;

      for (let i=0, length=self._gan2TaskLength; i<length; i++) {
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
      const headerWidth = self.chartDates.length * self.option.columnWidth;
      const headerHeight = self.option.headerHeight + 10;
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
      const columnWidth = self.option.columnWidth;
      let tickY = self.option.headerHeight + self.option.padding / 2;
      let tickHeight = (self.option.barHeight + self.option.padding) * self._gan2TaskLength;

      for (let i=0, length=self.chartDates.length; i<length; i++) {
        createSVG('path', {
                                      d: `M ${columnWidth * i} ${tickY} v ${tickHeight}`,
                                      class: classNames.tick,
                                      appendTo: self._layers['grid']
                                    });
      }
    })();

    // drawDayHighlight
    (function () {
        const now = DateUtil.now();
        const viewMode = self._viewMode;
        if (now < self.chartDates[0] || self.chartDates[self.chartDates.length-1] < now) return;

        const x = DateUtil.diff(now, self.chartDates[0], viewMode) * self.option.columnWidth;
        const width = self.option.columnWidth;
        const height = (self.option.barHeight + self.option.padding)
                        * self._gan2TaskLength;

        createSVG('rect', {
                              x: x,
                              y: self.option.headerHeight + self.option.padding/2,
                              width: width,
                              height: height,
                              class: classNames.todayHighlight,
                              appendTo: self._layers['grid']
                            });
    })();


    // saturday / sunday highlight
    (function () {
      if (!self.option.weekendCheck || self._viewMode > DateScale.DAY) return;

      for (let i=0; i<self.chartDates.length; i++) {
        const date = self.chartDates[i];

        let dayClass;
        if (date.getDay() === 0) dayClass = classNames.sundayHighlight;
        else if (date.getDay() === 6) dayClass = classNames.saturdayHighlight;

        // not weekend
        if (!dayClass) continue;

        const x = i * self.option.columnWidth;
        const width = self.option.columnWidth;
        const height = (self.option.barHeight + self.option.padding)
                        * self._gan2TaskLength;

        createSVG('rect', {
                                      x: x,
                                      y: self.option.headerHeight + self.option.padding/2,
                                      width: width,
                                      height: height,
                                      class: dayClass,
                                      appendTo: self._layers['grid']
                                    });
      }
    })();

  }


  /**
   * draw top dates and division bar
   */
  private drawDateAndDivideBar(): void {

    const dateLabelList = getDateLabelForDraw(this);
    let lastDateInfo = dateLabelList[0];

    for (let i=0, length = dateLabelList.length-1; i <= length; i++) {
      const date: DateLabel = dateLabelList[i];

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
        const lastUpperTextPadding = i === length ? this.option.columnWidth / 2 : 0;
        const $upperText = createSVG('text', {
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
                                    x1: date.lowerX - this.option.columnWidth/2,
                                    y1: 0,
                                    x2: date.lowerX - this.option.columnWidth/2,
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
    function getDateLabelForDraw(self): Array<DateLabel> {
      return self.chartDates.map((date, i) => self.getDateLabel(date, i));
    }

  }

  /**
   * get Date Label Informations
   * @param date
   * @param i
   * @returns {DateLabel}
   */
  private getDateLabel(date, i): DateLabel {
    // get date labels.
    const {lower, upper} = DateUtil.getDateLabel(date, this._viewMode, this.option.language);

    const basePosition = {
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


  private bindGridClickEvent(): void {
    // grid click event
    $.on(this.$svg, this.option.popupTrigger, `.grid`,
      (e) => {
        this._unSelectAll();
        this._hidePopup(e);
      });
  }

  /**
   * bind grid and taskBar events
   */
  private bindBarEvent(): void {
      let xOnStart = 0;
      let yOnStart = 0;
      // now event
      let isDragging = false;
      let isResizingLeft = false;
      let isResizingRight = false;
      let bars: Gan2Bar[] = []; // instanceof Gan2Bar
      let bar: Gan2Bar = null;
      const isAction = () => isDragging || isResizingLeft || isResizingRight;

      // drag startDate event handling
      $.on(this.$svg, 'mousedown', `.${classNames.barWrapper}, .${classNames.handle}`, (e, $bar) => {
        const barWrapper = $.closest(`.${classNames.barWrapper}`, $bar);
        barWrapper.classList.add(classNames.active);
        // get bar object
        bar = this._getBar(barWrapper.getAttribute('data-id'));
        if (!bar || (bar && bar.fixed)) return; // invalid or fixed bar

        // check target and event
        const classList = $bar.classList;
        if (classList.contains('left')) {
          isResizingLeft = true;
        } else if (classList.contains('right')) {
          isResizingRight = true;
        } else if (classList.contains(`${classNames.barWrapper}`)) {
          isDragging = true;
        }

        // event startDate position
        xOnStart = e.offsetX;
        yOnStart = e.offsetY;

        // move all bars
        bars = bar.task.getAllChildTaskWithThis.map(task => task.taskBar);
        bars.forEach(bar => {
          const $bar = bar.$bar;
          $bar.ox = $bar.getX();
          $bar.oy = $bar.getY();
          $bar.owidth = $bar.getWidth();
          $bar.finaldx = 0;
        });
      });

      // dragging event handling
      $.on(this.$svg, 'mousemove', e => {
        if (!isAction()) return;
        const dx = e.offsetX - xOnStart;
        const draggingBar = bar;

        bars.forEach(bar => {
          const $bar = bar.$bar;
          $bar.finaldx = this.getSnapPosition(dx);

          if (isResizingLeft) {
            if (draggingBar === bar) {
              bar.updateBarPosition({
                x: $bar.ox + $bar.finaldx,
                width: $bar.owidth - $bar.finaldx
              });
            } else {
              bar.updateBarPosition({x: $bar.ox + $bar.finaldx});
            }

          } else if (isResizingRight) {
              bar.updateBarPosition({width: $bar.owidth + $bar.finaldx});

          } else if (isDragging) {
            const moveX = $bar.ox + $bar.finaldx;
            if (bar.isUpdatableX(moveX)) bar.updateBarPosition({x: moveX});
          }
        });

        // if moved snap position, hold dragged bar
        if (dx !== bar.$bar.finaldx) {
          this._draggingBar = draggingBar;
        }

        // if popup opened, popup html redraw
        bar.dateChange(e);
        this._redrawPopup();
      });

      // drag endDate event handling
    $.on(this.$svg, 'mouseup', e => {

        bars.forEach(bar => {
          const $bar = bar.$bar;
          if (!$bar.finaldx) return;
          bar.dateChange(e);
        });

      if (!this._draggingBar) {
        if (e.target.parentElement.classList.contains(`${classNames.barGroup}`)) {
          this._triggerEvent(e, 'taskClick', [bar.task]);
        }
      }

    });

    /**
     * bind mouse up event on document
     */
    this._$container.addEventListener('mouseup', e => {
      if (isDragging || isResizingLeft || isResizingRight) {
        bars.forEach(bar => bar.$group.classList.remove(`${classNames.active}`));
      }
      isResizingRight = isResizingLeft = isDragging = false;
      const self = this;
      if (self._draggingBar) {
        this.setupDate();
        this.render();
        setTimeout(() => (self._draggingBar = null), 10);
      }
    });
  }


  /**
   * progress bar event bind
   */
  private progressBarEventBind(): void {
    let onStartX = 0;
    let isResizing = null;
    let bar: Gan2Bar = null;
    let $bar = null;
    let $progressBar = null;

    $.on(this.$svg, 'mousedown', `.${classNames.handle}.${classNames.progress}`, (e, $handle) => {
      isResizing = true;
      onStartX = e.offsetX;

      const $barWrapper = $.closest(`.${classNames.barWrapper}`, $handle);
      bar = this._getBar($barWrapper.getAttribute('data-id'));

      $bar = bar.$bar;
      $progressBar = bar.$progressBar;

      $progressBar.finaldx = 0;
      $progressBar.owidth = $progressBar.getWidth();
      $progressBar.minDx = -$progressBar.getWidth();
      $progressBar.maxDx = $bar.getWidth() - $progressBar.getWidth();

    });

    $.on(this.$svg, 'mousemove', e => {
      if (!isResizing) return;

      let dx = e.offsetX - onStartX;

      if (dx > $progressBar.maxDx) {
        dx = $progressBar.maxDx;
      }
      if (dx < $progressBar.minDx) {
        dx = $progressBar.minDx;
      }

      const $handle = bar.$handleProgress;
      $.attr($progressBar, 'width', $progressBar.owidth + dx);
      $.attr($handle, 'points', bar.getProgressPolygonPoints());
      $progressBar.finaldx = dx;

      // if popup opened, popup html redraw
      bar.progressChange(e);
      this._redrawPopup();
    });

    $.on(this.$svg, 'mouseup', (e) => {
      isResizing = false;
      if (!($progressBar && $progressBar.finaldx)) return;
      bar.progressChange(e);
      this._unSelectAll();
    });
  }

  private _redrawPopup(): void {
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
  public _showPopup(event?, task?: Gan2Task) {
    if (!this.popup) {
      this.popup = new Gan2Popup(this, this.option.popupHtmlSupplier);
    }

    if (!this.isPopupOpen) { // trigger event only first time
      this._triggerEvent(event, 'popupOpen', [task]);
    }

    this.isPopupOpen = true;
    this.popup.show(task, event);
  }

  /**
   * hide popup
   */
  public _hidePopup(e?: Event) {
    if (!this.popup) return;
    if (this.isPopupOpen) {
      this._triggerEvent(e,'popupClose', []);
    }
    this.isPopupOpen = false;
    this.popup.hide();
  }

  /**
   * find bar object
   * @param id
   * @returns {Gan2Bar}
   */
  public _getBar(id): Gan2Bar {
    return this.bars.find(bar => bar.task.id === id);
  }

  /**
   * get now viewmode
   * @returns {DateScale}
   */
  get _viewMode(): DateScale {
    const dateScale = DateScale[this.option.viewMode
                              .replace(' ', '_')
                              .toUpperCase()];
    return dateScale ? dateScale : DateScale.DAY;
  }

  /**
   *
   * @param dx
   */
  private getSnapPosition(dx) {
    let odx = dx, rem, position;

    if (this._viewMode === DateScale.MONTH) {
      rem = dx % (this.option.columnWidth / 30);
      position = odx - rem
        + (rem < this.option.columnWidth / 60 ? 0 : this.option.columnWidth / 30);
    } else {
      rem = dx % this.option.columnWidth;
      position = odx - rem
        + (rem < this.option.columnWidth / 2 ? 0 : this.option.columnWidth);
    }
    return position;
  }

  /**
   * convert gan2Task to Task
   * @param gan2Tasks
   */
  private gan2TaskToTask(gan2Tasks: Gan2Task[]): Task[] {
    return gan2Tasks.map(gan2t => {
      const task = gan2t._task;
      task.childTask = this.gan2TaskToTask(gan2t.childTask);
      return task;
    });
  }


  /**
   * unSelect method
   */
  public _unSelectAll() {
    this.$svg.querySelectorAll(`.bar .${classNames.barWrapper}`)
              .forEach(el => el.classList.remove(classNames.active));
  }

  /**
   * triggering user option event
   * @param e
   * @param eventName
   * @param params
   */
  public _triggerEvent(e: Event, eventName: string, params: Array<any>): void {
    const key = Object.keys(this.option)
                      .find(key => key.toUpperCase() === `ON${eventName.toUpperCase()}`);
    if (this.option[key]) {
      this.option[key](e, ...params);
    }
  }


  /**
   * refresh tasks
   * @param tasks
   */
  public refresh(tasks?: any[]) {
    if (tasks) {
      this.setupTasks(tasks);
    }
    this.changeViewMode();
  }
}

