## Introduction
[Gan2Chart](https://github.com/partnerjun/gan2chart) is a gantt chart library. It based on [frappe/gantt](https://github.com/frappe/gantt) and use TypeScript, scss.


## Features
- Option Object
  ```
  /**
   * Task option
   */
  interface Task {
    startDate: string,
    endDate: string,
    name: string,
    id: string,
    progress: number,
    index?: number,
    customClass?: string;
    customArrowClass?: string;
    fixed?: boolean; // task fix
    progressFixed?: boolean; // task progress fix
    childTask: Task[]
  }
  
  /**
   * Gan2Chart consturct option
   */
  interface Option {
    headerHeight: number,    // default: 50
    columnWidth: number,     // default: 40
    barHeight: number,       // default: 20
    barCornerRadius: number, // default: 2
    arrowCurve: number,      // default: 5
    padding: number,         // default: 18
    viewMode: string,        // default: day. ['hour', 'day', 'month', 'year']
    popupTrigger: string,    // default: mousemove. ['click', 'mousemove', etc...]
    popupHtmlSupplier: (Gan2Task) => HTMLDocument,
    language: string,
    startDate?: string,      // optional. gantt chart start date
    endDate?: string,        // optional. gantt chart end date
    weekendCheck?: boolean,  // default: true. fill the cell of sunday and saturday
    autoScroll: boolean,     // default: true. scroll to gantt chart start point
    datePaddingQty: any,     // default: true. ['auto', number] chart will be shown [start date - qty] to [end date + qty]
    paddingBarCount: number, // default: 2. set the padding bar count on the bottom
    
    onTaskProgressChange: (e, task, oldProgress, newProgress) => {
    
    },
    
    onTaskChange: (e, task, oldTaskStart, oldTaskEnd, newTaskStart, newTaskEnd) => {
    
    },
    
    onPopupOpen: (e, task) => {
    
    },
    
    onPopupClose: (e) => {
    
    },
    
    onTaskClick: (e, task) => {
    
    }
  }
  ```


- API and Property
  * Gan2Chart
  ```
  /**
   * update view mode and redraw with event handling
   * @param newViewMode
   * @param setScroll
   */
  public changeViewMode(newViewMode: string = this.option.viewMode,
                        setScroll: boolean = this.option.autoScroll)
  
  /**
   * refresh gan2chart 
   * @param tasks
   */
  public refresh(tasks?: Gan2Task | Gan2Task[] | Task[])                        
  ```
  
  
  * Gan2Task
  ```
  id: string;
  index: number;
  startDate: Date;
  endDate: Date;
  progress: number;
  name: string;
  customArrowClass: string;
  customClass: string;
  fixed: boolean;
  progressFixed: boolean;
    
  /**
   * get gan2chart
   */
  gan2Chart: Gan2Chart
  
  /**
   * get parent task
   */
  parentTask: Gan2Task
  
  /**
   * get all child tasks from this task
   */
  getAllChildTaskWithThis: number
  ```

## License
[MIT](https://github.com/partnerjun/gan2chart/blob/master/LICENSE)