## Introduction
[Gan2Chart](https://github.com/partnerjun/gan2chart) is a gantt chart library. It based on [frappe/gantt](https://github.com/frappe/gantt) and use TypeScript, scss.

![example](https://github.com/partnerjun/gan2chart/raw/master/example.jpg)

## Install
```
npm install gan2chart
```

## Usage
```
import Gan2Chart from 'gan2chart';
```
or
```
<script src="gan2chart.min.js"></script>
```

and start:
```js
  const tasks = [
    {
      startDate: '2018-10-01 01:00:00',
      endDate: '2018-10-14 20:00:00',
      name: 'Project X',
      id: "task0",
      progress: 70,
      progressFixed: true,
      customClass: 'bar-tomato',
      childTask: [
        {
          startDate: '2018-10-01 02:00:00',
          endDate: '2018-10-04',
          name: 'Planning',
          id: "task0-1",
          progress: 20,
          customArrowClass: 'arrow-red',
          childTask: [
            {
              startDate: '2018-10-02 12:00:00',
              endDate: '2018-10-04',
              name: 'Planning Meeting',
              id: "Task 0-0-1",
              progress: 50,
              customClass: ''
            }
          ]
        },
        {
          startDate: '2018-10-05 00:00:00',
          endDate: '2018-10-08 12:00:00',
          name: 'Coding',
          id: "task0-2",
          progress: 50,
          customArrowClass: 'arrow-blue',
          customClass: ''
        },
        {
          startDate: '2018-10-10 00:00:00',
          endDate: '2018-10-12 12:00:00',
          name: 'QA',
          id: "task0-3",
          progress: 50,
          customArrowClass: 'arrow-purple',
          customClass: '',
          fixed: true
        }
      ]
    }
  ];


  new Gan2Chart('#parent-chart', tasks, {
    viewMode: 'day',
    popupTrigger: 'click',
    autoScroll: false,
    language: 'ko',
    datePaddingQty: 5,
    popupHtmlSupplier: (task) => {
      return `<div class="title">${task.name} ${task.fixed ? '&para;' : ''}</div>
              <div class="date">${format(task.startDate)} ~ ${format(task.endDate)}</div>
              <div class="content">progress: ${task.progress}%</div>`;
    },
    onTaskProgressChange: (e, task, oldProgress, newProgress) => {
      if (e.type === 'mouseup') {
        console.log(e.type, task.name, 'progress change!')
      }
    },
    onTaskChange: (e, task, oldTaskStart, oldTaskEnd, newTaskStart, newTaskEnd) => {
      if (e.type === 'mouseup') {
        console.log(e.type, task.name, 'task change!')
      }
    },
    onPopupOpen: (e, task) => {
      console.log('popup open!')
    },
    onPopupClose: (e) => {
      console.log('popup close!')
    },
    onTaskClick: (e, task) => {
      document.querySelector('#child-chart').innerHTML = '';
      new Gan2Chart('#child-chart', task, {
        language: 'en',
        viewMode: 'hour',
        autoScroll: true,
        paddingBarCount: 1,
        onChange: (e, changedTask) => {
          const findTask = task.getAllChildTaskWithThis
                               .find(t => t.name === changedTask.name);
          findTask.startDate = changedTask.startDate;
          findTask.endDate = changedTask.endDate;
          findTask.progress = changedTask.progress;
          findTask.gan2Chart.refresh();
        }
      });
    }
  });

  function format(date) {
    return date.toLocaleDateString();
  }
```

## Features
- Option Object
  ```js
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
  ```js
  option: Option;   
  tasks: Gan2Task[];
  
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
  ```js
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