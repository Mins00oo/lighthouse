import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import duration from 'dayjs/plugin/duration';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';

// ----------------------------------------------------------------------

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.extend(relativeTime);

dayjs.tz.setDefault('Asia/Seoul');

// ----------------------------------------------------------------------

export const formatPatterns = {
  dateTime: 'DD MMM YYYY h:mm a', // 17 Apr 2022 12:00 am
  date: 'DD MMM YYYY', // 17 Apr 2022
  time: 'h:mm a', // 12:00 am
  split: {
    dateTime: 'DD/MM/YYYY h:mm a', // 17/04/2022 12:00 am
    date: 'DD/MM/YYYY', // 17/04/2022
  },
  paramCase: {
    dateTime: 'DD-MM-YYYY h:mm a', // 17-04-2022 12:00 am
    date: 'DD-MM-YYYY', // 17-04-2022
  },
};

const TIMEZONE = 'Asia/Seoul';

const isValidDate = (date) => date !== null && date !== undefined && dayjs(date).isValid();

const toKST = (date) => dayjs(date).tz(TIMEZONE);

/**
 * KST(Asia/Seoul) 기준 ISO 8601 문자열 반환
 * API 호출 시 시간 파라미터에 사용 (예: 2026-03-03T11:29:41+09:00)
 * dayjs().toISOString()은 항상 UTC(Z)를 반환하므로 이 함수로 대체한다.
 */
export function toKSTString(date) {
  return dayjs(date).tz(TIMEZONE).format();
}

// ----------------------------------------------------------------------

export function today(template) {
  return toKST(new Date()).startOf('day').format(template);
}

// ----------------------------------------------------------------------

/**
 * @output 17 Apr 2022 12:00 am
 */

// ----------------------------------------------------------------------

export function fDateTime(date, template) {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  return toKST(date).format(template ?? formatPatterns.dateTime);
}

// ----------------------------------------------------------------------

/**
 * @output 17 Apr 2022
 */

// ----------------------------------------------------------------------

export function fDate(date, template) {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  return toKST(date).format(template ?? formatPatterns.date);
}

// ----------------------------------------------------------------------

/**
 * @output 12:00 am
 */

// ----------------------------------------------------------------------

export function fTime(date, template) {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  return toKST(date).format(template ?? formatPatterns.time);
}

// ----------------------------------------------------------------------

/**
 * @output 1713250100
 */

// ----------------------------------------------------------------------

export function fTimestamp(date) {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  return toKST(date).valueOf();
}

// ----------------------------------------------------------------------

/**
 * @output a few seconds, 2 years
 */

// ----------------------------------------------------------------------

export function fToNow(date) {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  return toKST(date).toNow(true);
}

// ----------------------------------------------------------------------

/**
 * @output boolean
 */

// ----------------------------------------------------------------------

export function fIsBetween(inputDate, startDate, endDate) {
  if (!isValidDate(inputDate) || !isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  const formattedInputDate = fTimestamp(inputDate);
  const formattedStartDate = fTimestamp(startDate);
  const formattedEndDate = fTimestamp(endDate);

  if (
    formattedInputDate === 'Invalid date' ||
    formattedStartDate === 'Invalid date' ||
    formattedEndDate === 'Invalid date'
  ) {
    return false;
  }

  return formattedInputDate >= formattedStartDate && formattedInputDate <= formattedEndDate;
}

// ----------------------------------------------------------------------

/**
 * @output boolean
 */

// ----------------------------------------------------------------------

export function fIsAfter(startDate, endDate) {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  return dayjs(startDate).isAfter(endDate);
}

// ----------------------------------------------------------------------

/**
 * @output boolean
 */

// ----------------------------------------------------------------------

export function fIsSame(startDate, endDate, unitToCompare) {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  return dayjs(startDate).isSame(endDate, unitToCompare ?? 'year');
}

/**
 * @output
 * Same day: 26 Apr 2024
 * Same month: 25 - 26 Apr 2024
 * Same month: 25 - 26 Apr 2024
 * Same year: 25 Apr - 26 May 2024
 */

// ----------------------------------------------------------------------

export function fDateRangeShortLabel(startDate, endDate, initial) {
  if (!isValidDate(startDate) || !isValidDate(endDate) || fIsAfter(startDate, endDate)) {
    return 'Invalid date';
  }

  let label = `${fDate(startDate)} - ${fDate(endDate)}`;

  if (initial) {
    return label;
  }

  const isSameYear = fIsSame(startDate, endDate, 'year');
  const isSameMonth = fIsSame(startDate, endDate, 'month');
  const isSameDay = fIsSame(startDate, endDate, 'day');

  if (isSameYear && !isSameMonth) {
    label = `${fDate(startDate, 'DD MMM')} - ${fDate(endDate)}`;
  } else if (isSameYear && isSameMonth && !isSameDay) {
    label = `${fDate(startDate, 'DD')} - ${fDate(endDate)}`;
  } else if (isSameYear && isSameMonth && isSameDay) {
    label = `${fDate(endDate)}`;
  }

  return label;
}

// ----------------------------------------------------------------------

export function fAdd({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}) {
  const result = dayjs()
    .add(
      dayjs.duration({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
      })
    )
    .format();

  return result;
}

/**
 * @output 2024-05-28T05:55:31+00:00
 */

// ----------------------------------------------------------------------

export function fSub({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}) {
  const result = dayjs()
    .subtract(
      dayjs.duration({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
      })
    )
    .format();

  return result;
}
