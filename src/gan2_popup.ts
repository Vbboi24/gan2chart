import Gan2Task from "./gan2_task";
import Gan2Chart from "./index";
import DateUtil from "./date_util";

export default class Gan2Popup {
  private task: Gan2Task;
  private $popupWrapper: HTMLElement;
  private html: string;
  private readonly customHtmlSupplier: (Gan2Task) => string; // () => HTMLElement

  /**
   *
   * @param {Gan2Chart} gan2Chart
   * @param customHtmlSupplier
   */
  constructor(private gan2Chart: Gan2Chart, customHtmlSupplier) {
    this.$popupWrapper = gan2Chart._$popupWrapper;
    this.customHtmlSupplier = customHtmlSupplier || this.defaultHtmlSupplier;
    this.hide();
  }


  /**
   * show popup html
   * @param {Gan2Task} task
   * @param event
   */
  show(task?: Gan2Task, event?: any): void {
    if (task) {
      this.task = task;
    }

    this.html = this.customHtmlSupplier(this.task);
    this.html += `<div class="pointer"></div>`;
    this.$popupWrapper.innerHTML = this.html;

    const $pointer: HTMLElement = this.$popupWrapper.querySelector('.pointer');

    // set position
    $pointer.style.transform = 'rotateZ(90deg)';
    $pointer.style.left = '-7px';
    $pointer.style.top = '2px';

    let [x, y, width] = [this.task.taskBar.$bar.getX() + this.gan2Chart._$container.clientLeft,
                         this.task.taskBar.$bar.getY(),
                         this.task.taskBar.$bar.getWidth()];
    if (event && event.type.includes('mouse')) {
      x = event.offsetX - width + 10;
      y = event.offsetY - 5;
    }
    this.$popupWrapper.style.left = `${x + (width + 10)}px`;
    this.$popupWrapper.style.top = `${y}px`;

    // show
    this.$popupWrapper.style.opacity = '1';
  }

  /**
   * hide popup html
   */
  hide() {
    this.$popupWrapper.style.left = '0px';
    this.$popupWrapper.style.top = '0px';
    this.$popupWrapper.style.opacity = '0';
  }

  /**
   * default popup html
   * @param task
   */
  private defaultHtmlSupplier(task: Gan2Task): string {
    const start = DateUtil.format(task.start, 'YYYY-MM-DD HH:mm:ss', this.gan2Chart.option.language);
    const end = DateUtil.format(task.end, 'YYYY-MM-DD HH:mm:ss', this.gan2Chart.option.language);
    return `<div class="title">${task.name}</div>
            <div class="content">
              <div>${start}</div>
              <div>~ ${end}</div>
            </div>`;
  }
}