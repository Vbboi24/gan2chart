import Gan2Chart, {Task} from './index'
import DateUtil from './date_util'
import {DateScale} from './gan2_constants'
import Gan2Bar from "./gan2_bar";
import Gan2Arrow from "./gan2_arrow";


export default class Gan2Task {
  // Task options
  id: string;
  index: number;
  start: Date;
  end: Date;
  progress: number;
  name: string;
  customArrowClass: string;
  customClass: string;
  fixed: boolean;
  progressFixed: boolean;
  gan2Chart: Gan2Chart;
  _task: Task;

  // Gan2Chart Objects
  parentTask: Gan2Task;
  childTask: Gan2Task[];
  taskBar: Gan2Bar;
  arrows: Gan2Arrow[];

  constructor(gan2Chart: Gan2Chart,
              task: Task,
              defaultDateScale = DateScale.DAY,
              parentTask?: Gan2Task,
              id?: number) {

    this.gan2Chart = gan2Chart;
    this._task = task;
    this.id = id ? id.toString() : Gan2Task.generateId(task);
    this.name = task.name;
    this.index = gan2Chart._gan2TaskIndex++;
    this.start = DateUtil.parse(task.start);
    this.end = DateUtil.parse(task.end);
    this.progress = task.progress;
    this.progressFixed = task.progressFixed;
    this.customArrowClass = task.customArrowClass;
    this.customClass = task.customClass;
    this.fixed = task.fixed;

    this.parentTask = parentTask;
    this.childTask = [];
    this.arrows = [];

    // default task date
    if (!task.start && !task.end) {
      const today: Date = DateUtil.today();
      this.start = today;
      this.end = DateUtil.add(today, 2, defaultDateScale);
    } else {
      this.start = DateUtil.parse(this.start) || DateUtil.add(this.end, -2, defaultDateScale);
      this.end = DateUtil.parse(this.end) || DateUtil.add(this.start, 2, defaultDateScale);
    }

    // if hours is not set, assume the last day is full day
    // e.g: 2018-09-09 becomes 2018-09-09 23:59:59
    const taskEndValue = DateUtil.getDateValues(this.end);
    if (taskEndValue.slice(3).every(d => d === 0)) {
      this.end = DateUtil.add(this.end, 24, DateScale.HOUR);
    }

    // if has child task
    if (task.childTask) {
      this.childTask = task.childTask
                          .map(v => new Gan2Task(gan2Chart, v, defaultDateScale, this));
    }
  }

  /**
   * create arrow object
   * @param {number} parentId
   * @returns {Array<Gan2Arrow>}
   */
  public drawArrow(parentId?: string): Array<Gan2Arrow> {
    this.arrows = [].concat(this.childTask.reduce((acc, cur) => acc.concat(cur.drawArrow(this.id)), []));
    if (parentId) {
      const arrow = new Gan2Arrow(this.gan2Chart, this.parentTask, this);
      this.gan2Chart._layers['arrow'].appendChild(arrow.$element);
      this.arrows.push(arrow);
    }
    return this.arrows;
  }

  /**
   * get all child tasks from this task
   */
  get getAllChildTaskWithThis(): Gan2Task[] {
    return this.childTask.reduce((acc, cur) => acc.concat(cur.getAllChildTaskWithThis), [])
                         .concat(this);
  }

  /**
   * get count include child tasks
   * @returns {number}
   */
  get length(): number {
    return this.childTask.reduce((acc, cur) => acc + 1, 0) + 1;
  }

  /**
   * generate task uid
   * @param task
   */
  private static generateId(task: Task): string {
    return `${task.name}_${Math.random()
                               .toString(36)
                               .slice(2, 12)}`;
  }

}