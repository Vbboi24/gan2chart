import {DateScale, monthNames, postFixes} from './gan2_constants'

export default class DateUtil {

  /**
   * return parsed value
   * @param date
   * @param dateSeparator
   * @param timeSeparator
   */
  static parse(date: string | Date,
               dateSeparator: string = '-',
               timeSeparator: RegExp = /[.:]/): Date {
    if (!date) {
      return new Date();
    } else if (date instanceof Date) {
      return date;
    }

    const parts = date.split(' ');
    let dateParts = parts[0].split(dateSeparator)
      .map(val => parseInt(val, 10));

    let timeParts: any = parts[1] && parts[1].split(timeSeparator);

    // month is 0 indexed
    dateParts[1] = dateParts[1] - 1;

    if (timeParts && timeParts.length) {
      if (timeParts.length == 4) {
        timeParts[3] = '0.' + timeParts[3];
        timeParts[3] = parseFloat(timeParts[3]) * 1000;
      }
      dateParts = dateParts.concat(timeParts);
    }
    const [a, b, c, d, e, f] = dateParts;
    return new Date(a, b, c, d | 0, e | 0, f | 0);
  }

  /**
   * return Date to string value
   * @param date
   * @param withTime
   */
  static toString(date: Date, withTime: boolean = false): string {

    const values = this.getDateValues(date).map((val, i) => {
      val = i === 1 ? val + 1 : val;
      if (i === 6) {
        return DateUtil.padStart(val + '', 3, '0');
      }
      return DateUtil.padStart(val + '', 2, '0');
    });

    const dateString = `${values[0]}-${values[1]}-${values[2]}`;
    const timeString = `${values[3]}:${values[4]}:${values[5]}.${values[6]}`;

    return dateString + (withTime ? ' ' + timeString : '');
  }

  /**
   * return formatting date
   * @param date
   * @param format
   * @param lang
   */
  static format(date: Date, format: string = 'YYYY-MM-DD HH:mm:ss.SSS', lang: string = 'en') {
    const values = this.getDateValues(date)
      .map(d => DateUtil.padStart(d, 2, 0));

    const postFixValue = (value) => postFixes[lang] ? postFixes[lang][value] : '';

    const formatMap = {
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

    let str = format;
    const formattedValues = [];

    Object.keys(formatMap)
      .sort((a, b) => b.length - a.length) // big string first
      .forEach(key => {
        if (str.includes(key)) {
          str = str.replace(key, `$${formattedValues.length}`);
          formattedValues.push(formatMap[key]);
        }
      });

    formattedValues.forEach((value, i) => {
      str = str.replace(`$${i}`, value);
    });

    return str;
  }

  /**
   * return difference of two chartDates
   * @param dateA
   * @param dateB
   * @param scale
   */
  static diff(dateA: Date | string, dateB: Date | string,
              scale: DateScale = DateScale.DAY): number {
    const [end, start] = [dateA, dateB].map(date => DateUtil.parse(date))
      .map(date => date.getTime())
      .sort((a, b) => b - a);

    const milliseconds = end - start;
    const seconds = milliseconds / 1000;
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;
    const months = days / 30;
    const years = months / 12;

    const values = [
      milliseconds,
      seconds,
      minutes,
      hours,
      days,
      months,
      years
    ];

    return Math.floor(values[scale]);
  }

  /**
   * return date object of today
   */
  static today(): Date {
    const [a, b, c] = this.getDateValues().slice(0, 3);
    return new Date(a, b, c);
  }

  static now() {
    return new Date();
  }

  /**
   *
   * @param date
   * @param qty
   * @param scale
   */
  static add(date: Date, qty: number, scale: DateScale) {

    const getDateQty = (qty, scale) => {
      if (scale === DateScale.DAY) return qty;
      return 0;
    };

    return new Date(
      date.getFullYear() + (scale === DateScale.YEAR ? qty : 0),
      date.getMonth() + (scale === DateScale.MONTH ? qty : 0),
      date.getDate() + getDateQty(qty, scale),
      date.getHours() + (scale === DateScale.HOUR ? qty : 0),
      date.getMinutes() + (scale === DateScale.MINUTE ? qty : 0),
      date.getSeconds() + (scale === DateScale.SECOND ? qty : 0),
      date.getMilliseconds() + (scale === DateScale.MILLISECOND ? qty : 0));
  }

  /**
   *
   * @param date
   * @param scale
   */
  static startOf(date: Date, scale: DateScale) {
    const scores = {
      [DateScale.YEAR]: 6,
      [DateScale.MONTH]: 5,
      [DateScale.DAY]: 4,
      [DateScale.HOUR]: 3,
      [DateScale.MINUTE]: 2,
      [DateScale.SECOND]: 1,
      [DateScale.MILLISECOND]: 0
    };

    const shouldReset = (_scale) => {
      const maxScore = scores[scale];
      return scores[_scale] <= maxScore;
    };

    return new Date(date.getFullYear(),
      shouldReset(DateScale.YEAR) ? 0 : date.getMonth(),
      shouldReset(DateScale.MONTH) ? 1 : date.getDate(),
      shouldReset(DateScale.DAY) ? 0 : date.getHours(),
      shouldReset(DateScale.HOUR) ? 0 : date.getMinutes(),
      shouldReset(DateScale.MINUTE) ? 0 : date.getSeconds(),
      shouldReset(DateScale.SECOND) ? 0 : date.getMilliseconds());
  }

  static clone(date): Date {
    return new Date(date);
  }

  static getDateValues(date: Date = new Date()): Array<number> {
    return [
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    ];
  }

  /**
   * return date label for language
   * @param date
   * @param scale
   * @param language
   */
  static getDateLabel(date: Date, scale: DateScale, language: string = 'en') {
    const postFix = !!postFixes[language];

    let lower = '', upper = '';
    const yearFormat = postFix ? 'YYYYYYYY' : 'YYYY';
    const hourFormat = postFix ? 'HHHH' : 'HH';
    const dayFormat = postFix ? 'DDDD' : 'D';
    const monthFormat = postFix ? 'MMMM' : 'MMM';
    const dayAndMonthFormat = postFix ? `MMM ${dayFormat}` : `${dayFormat} MMM`;

    switch (scale) {
      case DateScale.YEAR:
        lower = DateUtil.format(date, `${yearFormat}`, language);
        break;

      case DateScale.MONTH:
        upper = date.getFullYear() ? DateUtil.format(date, `${yearFormat}`, language) : '';
        lower = DateUtil.format(date, `${monthFormat}`, language);
        break;

      case DateScale.HOUR:
        upper = date.getDate() ? DateUtil.format(date, `${dayAndMonthFormat}`, language) : '';
        lower = DateUtil.format(date, `${hourFormat}`, language);
        break;

      default: // DAY
        upper = date.getMonth() || date.getMonth() === 0 ? DateUtil.format(date, 'MMMM', language) : '';
        lower = DateUtil.format(date, `${dayFormat}`, language);
    }
    return {lower, upper};
  }


  /**
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/DateUtil.padStart
   * @param str
   * @param targetLength
   * @param padString
   */
  private static padStart(str, targetLength, padString) {
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


}


