export enum DateScale {
  MILLISECOND,
  SECOND,
  MINUTE,
  HOUR,
  DAY,
  MONTH,
  YEAR
}


/**
 * gan2 drawing class names
 */
export const classNames = {
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
  lowerText: 'lower-text',
};


export const monthNames = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ],
  ko: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월'
  ]
};

export const postFixes = {
  ko: {
    year: '년',
    day: '일',
    hour: '시'
  }
};