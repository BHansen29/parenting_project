import { useEffect, useState } from 'react';
import './HolidaySchedule.css';

export const HOLIDAYS = [
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

export function getHolidayNames(holidaySchedule = {}, baseHolidays = HOLIDAYS) {
  return [
    ...baseHolidays,
    ...Object.keys(holidaySchedule).filter((holiday) => !baseHolidays.includes(holiday)),
  ];
}

const EMPTY_HOLIDAY = {
  doesNotApply: false,
  year: '',
  time: '',
  alternativeRequest: '',
};

export default function HolidaySchedule({
  value = {},
  onChange,
  errors = {},
  baseHolidays = HOLIDAYS,
  itemLabel = 'Holiday',
  ariaLabel = 'Holiday parenting schedule',
  introText = 'Choose how each holiday should be handled. You can mark a holiday as not applicable, assign it to odd, even, or every year, and add any alternative request.',
  idPrefix = 'holiday',
  optionSets = {},
  timeDisabledItems = [],
  yearFieldLabel = 'Year',
  descriptions = {},
}) {
  const [holidays, setHolidays] = useState(value);
  const [isAddingHoliday, setIsAddingHoliday] = useState(false);
  const [newHolidayName, setNewHolidayName] = useState('');
  const [addHolidayError, setAddHolidayError] = useState('');

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

    setHolidays(nextHolidays);
    onChange(nextHolidays);
  };

  const addHoliday = (event) => {
    event.preventDefault();
    const holidayName = newHolidayName.trim();

    if (!holidayName) {
      setAddHolidayError('Enter a holiday name');
      return;
    }

    if (getHolidayNames(holidays, baseHolidays).some((holiday) => holiday.toLowerCase() === holidayName.toLowerCase())) {
      setAddHolidayError('This holiday already exists');
      return;
    }

    const nextHolidays = { ...holidays, [holidayName]: { ...EMPTY_HOLIDAY } };
    setHolidays(nextHolidays);
    onChange(nextHolidays);
    setNewHolidayName('');
    setAddHolidayError('');
    setIsAddingHoliday(false);
  };

  return (
    <div className="holiday-schedule" aria-label={ariaLabel}>
      <p className="holiday-schedule__intro">{introText}</p>
      <div className="holiday-schedule__header" aria-hidden="true">
        <span>{itemLabel}</span>
        <span>Does not apply</span>
        <span>{yearFieldLabel}</span>
        <span>Time</span>
        <span>Alternative requests</span>
      </div>
      {getHolidayNames(holidays, baseHolidays).map((holiday) => {
        const savedSelection = holidays[holiday] || {};
        const selection = {
          ...EMPTY_HOLIDAY,
          ...savedSelection,
          doesNotApply: savedSelection.doesNotApply ?? savedSelection.year === 'na',
          year: savedSelection.year === 'na' ? '' : (savedSelection.year || EMPTY_HOLIDAY.year),
        };
        const holidayErrors = errors[holiday] || {};
        const holidayId = `${idPrefix}-${holiday.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        const holidayOptions = optionSets[holiday] || [
          { value: 'odd', label: 'Odd years' },
          { value: 'even', label: 'Even years' },
          { value: 'every', label: 'Every year' },
        ];
        const timeDisabled = timeDisabledItems.includes(holiday) || selection.year !== 'every';
        const description = descriptions[holiday];

        return (
          <div className="holiday-schedule__row" key={holiday}>
            <div className="holiday-schedule__name">
              <span>{holiday}</span>
              {description && <span className="holiday-schedule__description">{description}</span>}
            </div>
            <div className="holiday-schedule__field holiday-schedule__field--check">
              <span className="holiday-schedule__field-label">Does not apply</span>
              <label className="holiday-schedule__checkbox-label" htmlFor={`${holidayId}-does-not-apply`}>
                <input
                  id={`${holidayId}-does-not-apply`}
                  type="checkbox"
                  checked={selection.doesNotApply}
                  aria-label={`${holiday} does not apply`}
                  onChange={(event) => updateHoliday(holiday, 'doesNotApply', event.target.checked)}
                />
                <span>Does not apply</span>
              </label>
            </div>
            <div className="holiday-schedule__field">
              <span className="holiday-schedule__field-label">{yearFieldLabel}</span>
              <select
                id={`${holidayId}-year`}
                aria-label={`${holiday} year`}
                value={selection.year}
                disabled={selection.doesNotApply}
                aria-invalid={Boolean(holidayErrors.year)}
                aria-describedby={holidayErrors.year ? `${holidayId}-year-error` : undefined}
                onChange={(event) => updateHoliday(holiday, 'year', event.target.value)}
              >
                <option value="">Select an option</option>
                {holidayOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {holidayErrors.year && (
                <span className="holiday-schedule__error" id={`${holidayId}-year-error`}>
                  {holidayErrors.year}
                </span>
              )}
            </div>
            <div className="holiday-schedule__field">
              <span className="holiday-schedule__field-label">{timeDisabled ? 'Time' : 'Time (e.g. 6:00 PM)'}</span>
              {timeDisabled ? (
                <span className="holiday-schedule__not-applicable" aria-label={`${holiday} time not applicable`}>N/A</span>
              ) : (
                <input
                  aria-label={`${holiday} time`}
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  placeholder="6:00 PM"
                  maxLength="8"
                  pattern="(0?[1-9]|1[0-2]):[0-5][0-9] ?(AM|PM|am|pm)"
                  value={selection.time}
                  disabled={selection.doesNotApply}
                  required={!selection.doesNotApply && selection.year === 'every'}
                  aria-invalid={Boolean(holidayErrors.time)}
                  aria-describedby={holidayErrors.time ? `${holidayId}-time-error` : undefined}
                  onChange={(event) => updateHoliday(holiday, 'time', event.target.value)}
                />
              )}
              {holidayErrors.time && (
                <span className="holiday-schedule__error" id={`${holidayId}-time-error`}>
                  {holidayErrors.time}
                </span>
              )}
            </div>
            <div className="holiday-schedule__field">
              <span className="holiday-schedule__field-label">Alternative requests</span>
              <textarea
                aria-label={`${holiday} alternative requests`}
                placeholder="Add an alternative request"
                value={selection.alternativeRequest}
                disabled={selection.doesNotApply}
                rows="1"
                onChange={(event) => updateHoliday(holiday, 'alternativeRequest', event.target.value)}
              />
            </div>
          </div>
        );
      })}
      {isAddingHoliday ? (
        <form className="holiday-schedule__add-form" onSubmit={addHoliday}>
          <label htmlFor={`${idPrefix}-new-item-name`}>{itemLabel} name</label>
          <div className="holiday-schedule__add-controls">
            <input
              id={`${idPrefix}-new-item-name`}
              type="text"
              value={newHolidayName}
              placeholder={`Enter ${itemLabel.toLowerCase()} name`}
              autoFocus
              onChange={(event) => {
                setNewHolidayName(event.target.value);
                setAddHolidayError('');
              }}
            />
            <button type="submit" className="holiday-schedule__save-button">Add {itemLabel.toLowerCase()}</button>
            <button
              type="button"
              className="holiday-schedule__cancel-button"
              onClick={() => {
                setIsAddingHoliday(false);
                setNewHolidayName('');
                setAddHolidayError('');
              }}
            >
              Cancel
            </button>
          </div>
          {addHolidayError && <span className="holiday-schedule__add-error">{addHolidayError}</span>}
        </form>
      ) : (
        <button
          type="button"
          className="holiday-schedule__add-button"
          onClick={() => setIsAddingHoliday(true)}
        >
          + Add {itemLabel.toLowerCase()}
        </button>
      )}
    </div>
  );
}