import DateUtil from './date_util';
import {$, animateSVG, createSVG} from './svg_util';
import {classNames} from "./gan2_constants";
import Gan2Chart from "./index";
import Gan2Task from "./gan2_task";

export default class Gan2Bar {
  x: any;
  y: any;
  width: any;
  height: any;
  private cornerRadius: any;
  private duration: any;
  private progressWidth: any;
  task: Gan2Task;
  $group: any;
  $barGroup: any;
  $handleGroup: any;
  readonly fixed: boolean;
  readonly progressfixed: boolean;

  $handleProgress: any;
  $progressBar: any;
  $bar: any;


  constructor(private gan2Chart: Gan2Chart, task: Gan2Task) {
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
  private prepareValues(): void {
    this.duration = DateUtil.diff(this.task.endDate, this.task.startDate, this.gan2Chart._viewMode - 1)
                    / this.gan2Chart.option.step;

    this.width = this.gan2Chart.option.columnWidth * this.duration;
    this.height = this.gan2Chart.option.barHeight;


    this.x = this.computeX;
    this.y = this.computeY;
    this.cornerRadius = this.gan2Chart.option.barCornerRadius;


    this.progressWidth = this.gan2Chart.option.columnWidth
                          * this.duration
                          * (this.task.progress / 100) || 0;

    this.$group = createSVG('g', {
                                  class: `${classNames.barWrapper} ${this.task.customClass || ''}`,
                                  'data-id': this.task.id
                                });

    this.$barGroup = createSVG('g', {
                                    class: `${classNames.barGroup}`,
                                    appendTo: this.$group
                                  });

    this.$handleGroup = createSVG('g', {
                                        class: `${classNames.handleGroup}`,
                                        appendTo: this.$group
                                      });
  }

  private get computeX(): number {
    const {columnWidth} = this.gan2Chart.option;
    const diff = DateUtil.diff(this.gan2Chart.startDate, this.task.startDate, this.gan2Chart._viewMode);
    return diff * columnWidth;
  }

  private get computeY(): number {
    return (
      this.gan2Chart.option.headerHeight +
      this.gan2Chart.option.padding +
      this.task.index * (this.height + this.gan2Chart.option.padding)
    );
  }


  /**
   * draw bar
   */
  private draw(): void {
    this.drawBar();
    this.drawProgressBar();
    this.drawLabel();
    this.drawResizeHandles();
  }

  /**
   * draw task bar with animation
   */
  private drawBar() {
    this.$bar = createSVG('rect', {
                                    x: this.x,
                                    y: this.y,
                                    width: this.width,
                                    height: this.height,
                                    rx: this.cornerRadius,
                                    ry: this.cornerRadius,
                                    class: `${classNames.bar}`,
                                    appendTo: this.$barGroup
                                  });

    animateSVG(this.$bar, 'width', 0, this.width);

    if (this.fixed) {
      this.$barGroup.classList.add(`${classNames.barFixed}`);
    }
  }

  /**
   * draw progress bar with animation
   */
  private drawProgressBar(): void {
    this.$progressBar = createSVG('rect', {
                                            x: this.x,
                                            y: this.y,
                                            width: this.progressWidth,
                                            height: this.height,
                                            rx: this.cornerRadius,
                                            ry: this.cornerRadius,
                                            class: `${classNames.progressBar}`,
                                            appendTo: this.$barGroup
                                          });

    animateSVG(this.$progressBar, 'width', 0, this.progressWidth);
  }

  /**
   * draw task bar label
   */
  private drawLabel(): void {
    createSVG('text', {
                        x: this.x + this.width / 2,
                        y: this.y + this.height / 2,
                        innerHTML: this.task.name,
                        class: `${classNames.barLabel}`,
                        appendTo: this.$barGroup
                      });
    // labels get BBox in the next tick
    requestAnimationFrame(() => this.updateLabelPosition());
  }

  /**
   * if task is not fixed, draw task bar resize handler
   */
  private drawResizeHandles(): void {
    if (this.fixed) return;

    const bar = this.$bar;
    const handle_width = 8;

    createSVG('rect', {
                        x: bar.getX() + bar.getWidth() - 9,
                        y: bar.getY() + 1,
                        width: handle_width,
                        height: this.height - 2,
                        rx: this.cornerRadius,
                        ry: this.cornerRadius,
                        class: `${classNames.handle} right`,
                        appendTo: this.$handleGroup
                      });

    createSVG('rect', {
                        x: bar.getX() + 1,
                        y: bar.getY() + 1,
                        width: handle_width,
                        height: this.height - 2,
                        rx: this.cornerRadius,
                        ry: this.cornerRadius,
                        class: `${classNames.handle} left`,
                        appendTo: this.$handleGroup
                      });

    if (this.task.progress && this.task.progress < 100 && !this.progressfixed) {
      this.$handleProgress = createSVG('polygon', {
                                                    points: this.getProgressPolygonPoints(),
                                                    class: `${classNames.handle} ${classNames.progress}`,
                                                    appendTo: this.$handleGroup
                                                  });
    }
  }

  /**
   * get progress points for handle
   * @returns {Array<number>}
   */
  getProgressPolygonPoints(): string {
    const $progressBar = this.$progressBar;
    return [
      $progressBar.getEndX() - 5,
      $progressBar.getY() + $progressBar.getHeight(),
      $progressBar.getEndX() + 5,
      $progressBar.getY() + $progressBar.getHeight(),
      $progressBar.getEndX(),
      $progressBar.getY() + $progressBar.getHeight() - 8.66
    ].toString();
  }

  /**
   * binding popup event
   */
  private bindPopupEvent() {
    const popupTrigger = this.gan2Chart.option.popupTrigger;

    // block popup when mouse down
    if (popupTrigger.includes('click')) {
      $.on(this.$group, 'mousedown', e =>
        this.gan2Chart._$popupWrapper.classList.add('block-event')
      );
      $.on(this.$group, 'mouseup', e =>
        this.gan2Chart._$popupWrapper.classList.remove('block-event')
      );
    }

    // bind popup open event
    $.on(this.$group, `focus ${popupTrigger}`, e => {
      if (this.gan2Chart._draggingBar) {
        return;
      }

      if (!this.gan2Chart._draggingBar && e.type === popupTrigger) {
        this.gan2Chart._showPopup(e, this.task);
      }

      // remove active classname
      this.gan2Chart._unSelectAll();
      this.$group.classList.toggle(`.${classNames.active}`);
    });

    if (popupTrigger.includes('mouse')) {
      // if mouse event, block bubble popup wrapper event
      this.gan2Chart._$popupWrapper.classList.add('block-event');
      $.on(this.$group, 'mouseleave', e => this.gan2Chart._hidePopup(e));
    }

  }

  /**
   * return predicate input x is available position
   * @param x
   */
  public isUpdatableX(x: number): boolean {
    if (!this.task.parentTask) return true;
    return this.task.parentTask.taskBar.$bar.getX() <= x;
  }

  /**
   * update bar position on move event
   * @param x
   * @param width
   */
  public updateBarPosition({x = null, width = null}) {
    const bar = this.$bar;

    if (x) { // update x position
      // get all x values of parent task
      const minX = this.task.getAllChildTaskWithThis
                            .map(task => task.taskBar.$bar.getX())
                            .reduce((acc, cur) => acc > cur ? cur : acc);

      // child task must not go before parent
      if (!this.isUpdatableX(minX)) return;

      bar.setAttribute('x', (+x).toString());
    }


    if (width && width >= this.gan2Chart.option.columnWidth) { // update width
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
    this.$progressBar.setAttribute('width',
                                   this.$bar.getWidth() * (this.task.progress / 100));

    /**
     * update bar arrow position
     */
    this.task._arrows.forEach(arrow => arrow.update());
  }

  /**
   * update bar label position
   */
  private updateLabelPosition() {
    const bar = this.$bar,
      label = this.$group.querySelector(`.${classNames.barLabel}`);

    if (label.getBBox().width > bar.getWidth()) {
      label.setAttribute('x', bar.getX() + bar.getWidth() + 5);
    } else {
      label.setAttribute('x', bar.getX() + bar.getWidth() / 2);
    }
  }

  /**
   * update task date
   */
  dateChange(e): void {
    const [newStartDate, newEndDate] = this.computeStartEndDate();
    const [oldStartDate, oldEndDate] = [this.task.startDate, this.task.endDate];

    // check and update changed
    if (this.task.startDate.getTime() !== newStartDate.getTime()) {
      this.task.startDate = newStartDate;
    }
    if (this.task.endDate.getTime() !== newEndDate.getTime()) {
      this.task.endDate = newEndDate;
    }

    this.gan2Chart._triggerEvent(e, 'change', [this.task]);
    this.gan2Chart._triggerEvent(e, 'taskChange', [this.task,
                                                        oldStartDate, oldEndDate,
                                                        newStartDate, newEndDate
                                                      ]);
  }

  /**
   * change progress bar
   */
  progressChange(e): void {
    const oldProgress = this.task.progress;
    const newProgress = Math.floor(this.$progressBar.getWidth() / this.$bar.getWidth() * 100);
    this.task.progress = newProgress;
    this.gan2Chart._triggerEvent(e, 'change', [this.task]);
    this.gan2Chart._triggerEvent(e, 'taskProgressChange', [this.task, oldProgress, newProgress]);
  }

  /**
   * compute on moved bar
   * @return {Date, Date} {newStartDate, newEndDate}
   */
  computeStartEndDate() {
    const bar = this.$bar;
    const xUnits = bar.getX() / this.gan2Chart.option.columnWidth;
    const newStartDate = DateUtil.add(this.gan2Chart.startDate,
                                        xUnits * this.gan2Chart.option.step,
                                        this.gan2Chart._viewMode-1);

    const widthUnits = bar.getWidth() / this.gan2Chart.option.columnWidth;
    const newEndDate = DateUtil.add(newStartDate,
                                      widthUnits * this.gan2Chart.option.step,
                                      this.gan2Chart._viewMode-1
                                    );

    return [newStartDate, newEndDate];
  }

  /**
   * update bar handler position
   */
  private updateHandlePosition() {
    const bar = this.$bar;

    const leftHandle = this.$handleGroup.querySelector(`.${classNames.handle}.left`);
    leftHandle ? leftHandle.setAttribute('x', bar.getX() + 1) : '';

    const rightHandle = this.$handleGroup.querySelector(`.${classNames.handle}.right`);
    rightHandle ? rightHandle.setAttribute('x', bar.getEndX() - 9) : '';

    const progressHandle = this.$handleGroup.querySelector(`.${classNames.handle}.${classNames.progress}`);
    if (progressHandle) {
      progressHandle.setAttribute('points', this.getProgressPolygonPoints());
    }
  }

}