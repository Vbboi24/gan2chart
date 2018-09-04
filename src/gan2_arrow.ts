import { createSVG } from './svg_util'
import Gan2Task from "./gan2_task";
import Gan2Chart from "./index";

export default class Gan2Arrow {
  $element: SVGElement;
  private path: any;

  // obj
  fromTask: Gan2Task;
  toTask: Gan2Task;

  constructor(private gantt: Gan2Chart, fromTask: Gan2Task, toTask: Gan2Task) {
    this.fromTask = fromTask;
    this.toTask = toTask;

    this.calculatePath();
    this.create();
  }

  private calculatePath() {
    const {arrowCurve, headerHeight, barHeight, padding} = this.gantt.option;
    const [fromTaskBar, toTaskBar] = [this.fromTask.taskBar, this.toTask.taskBar];

    // calculate path values
    const arrowPadding = 20;
    let startX: number = toTaskBar.$bar.getX() - arrowPadding;

    // set arrow start x point
    if (startX < fromTaskBar.$bar.getX() + arrowPadding) {
      startX = fromTaskBar.$bar.getX() + arrowPadding;

    } else if (startX > fromTaskBar.$bar.getX() + fromTaskBar.$bar.getWidth()  - arrowPadding ) {
      startX = fromTaskBar.$bar.getX() + fromTaskBar.$bar.getWidth() - arrowPadding;

    }

    const startY: number = headerHeight + barHeight + (padding + barHeight)
                  * this.fromTask.index + padding;
    const endX: number = toTaskBar.$bar.getX() - padding / 2;
    const endY: number = headerHeight + barHeight / 2
                  + (padding + barHeight) * this.toTask.index + padding;

    const fromIsBelow: boolean = this.fromTask.index > this.toTask.index;
    const isClockwise: number = fromIsBelow ? 1 : 0;
    const curveY: number = fromIsBelow ? -arrowCurve : arrowCurve;
    const offset: number = endY + (fromIsBelow ? +arrowCurve : -arrowCurve);

    // define path variable
    this.path = `M ${startX} ${startY}
                 V ${offset}
                 a ${arrowCurve} ${arrowCurve} 0 0 ${isClockwise} ${arrowCurve} ${curveY}
                 L ${endX} ${endY}
                 m -5 -5
                 l 5 5
                 l -5 5`;

    if (toTaskBar.$bar.getX() <= fromTaskBar.$bar.getX() + padding) {
      const down1 = padding / 2 - arrowCurve;
      const down2 = toTaskBar.$bar.getY() + toTaskBar.height / 2 - curveY;
      const left = toTaskBar.$bar.getX() - padding;

      this.path = `M ${startX} ${startY}
                   v ${down1}
                   a ${arrowCurve} ${arrowCurve} 0 0 1 -${arrowCurve} ${arrowCurve}
                   H ${left}
                   a ${arrowCurve} ${arrowCurve} 0 0 ${isClockwise} -${arrowCurve} ${curveY}
                   V ${down2}
                   a ${arrowCurve} ${arrowCurve} 0 0 ${isClockwise} ${arrowCurve} ${curveY}
                   L ${endX} ${endY}
                   m -5 -5
                   l 5 5
                   l -5 5`;
    }
  }

  /**
   * create path element
   */
  private create() {
    this.$element = createSVG('path', {
                                        d: this.path,
                                        class: this.toTask.customArrowClass,
                                        'data-from': this.fromTask.id,
                                        'data-to': this.toTask.id
                                      });
  }

  public update(): void {
    this.calculatePath();
    this.$element.setAttribute('d', this.path);
  }
}