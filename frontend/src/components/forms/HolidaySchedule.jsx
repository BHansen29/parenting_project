import { useEffect, useState } from 'react';
import './HolidaySchedule.css';

const HOLIDAYS = [
  'Martin Luther King, Jr. /Weekend',
  'President\'s Day /Weekend',
  'Easter/Passover',
  'Spring School Break',
  'Mother\'s Day',
  'Father\'s Day',
  'Memorial Day/Weekend',
  '4th of July',
  'Labor Day/Weekend',
  'Rosh Hashanah',
  'Halloween',
  'Thanksgiving Day/Weekend',
  'Hanukkah',
  'Christmas Eve',
  'Christmas Day',
  'Winter Holiday School Break',
  'Kwanzaa',
  'New Year\'s Eve',
  'New Year\'s Day',
  'Child\'s Birthday',
  'Parent\'s Birthday',
  'Vacation with Parent 1',
  'Vacation with Parent 2',
];

const EMPTY_HOLIDAY = { year: 'na', time: '' };

export default function HolidaySchedule({ value = {}, onChange, errors = {} }) {
  const [holidays, setHolidays] = useState(value);

  useEffect(() => {
    setHolidays(value);
  }, [value]);

  const updateHoliday = (holiday, field, fieldValue) => {
    const nextHolidays = {
      ...holidays,
      [holiday]: {
        ...EMPTY_HOLIDAY,
        ...(holidays[holiday] || {}),
        [field]: fieldValue,
      },
    };

    if (field === 'year' && fieldValue === 'na') {
      nextHolidays[holiday].time = '';
    }

    setHolidays(nextHolidays);
    onChange(nextHolidays);
  };

  return (
    <div className="holiday-schedule" aria-label="Holiday parenting schedule">
      <p className="holiday-schedule__intro">
        Select odd or even years for each holiday, or choose N/A. Add the exchange time whenever a holiday is assigned to a year.
      </p>
      <div className="holiday-schedule__header" aria-hidden="true">
        <span>Holiday</span>
        <span>Year</span>
        <span>Time</span>
      </div>
      {HOLIDAYS.map((holiday) => {
        const selection = { ...EMPTY_HOLIDAY, ...(holidays[holiday] || {}) };
        const error = errors[holiday];
        const holidayId = holiday.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        return (
          <div className="holiday-schedule__row" key={holiday}>
            <label className="holiday-schedule__name" htmlFor={`${holidayId}-year`}>
              {holiday}
            </label>
            <div className="holiday-schedule__field">
              <span className="holiday-schedule__field-label">Year</span>
              <select
                id={`${holidayId}-year`}
                aria-label={`${holiday} year`}
                value={selection.year}
                onChange={(event) => updateHoliday(holiday, 'year', event.target.value)}
              >
                <option value="na">N/A</option>
                <option value="odd">Odd years</option>
                <option value="even">Even years</option>
              </select>
            </div>
            <div className="holiday-schedule__field">
              <span className="holiday-schedule__field-label">Time</span>
              <input
                aria-label={`${holiday} time`}
                type="text"
                placeholder="e.g. 6:00 PM"
                value={selection.time}
                disabled={selection.year === 'na'}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${holidayId}-error` : undefined}
                onChange={(event) => updateHoliday(holiday, 'time', event.target.value)}
              />
            </div>
            {error && <span className="holiday-schedule__error" id={`${holidayId}-error`}>{error}</span>}
          </div>
        );
      })}
    </div>
  );
}