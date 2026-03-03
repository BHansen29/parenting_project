import { useState, useEffect } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import './ScheduleBuilder.css';

/**
 * ScheduleBuilder component for creating weekly parenting schedules with time frames
 * @param {object} value - Current schedule data (object with day indices as keys)
 * @param {function} onChange - Callback when schedule changes
 * @param {string} parent1Label - Label for first parent (default: "Parent 1")
 * @param {string} parent2Label - Label for second parent (default: "Parent 2")
 * @param {string} error - Error message to display
 * @param {string} helpText - Help text to display
 */
export default function ScheduleBuilder({
  value = {},
  onChange,
  parent1Label = 'Parent 1',
  parent2Label = 'Parent 2',
  error = '',
  helpText = '',
}) {
  const [schedule, setSchedule] = useState(value);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Update schedule when value prop changes
  useEffect(() => {
    setSchedule(value);
  }, [value]);

  // Notify parent component of changes
  useEffect(() => {
    if (onChange) {
      onChange(schedule);
    }
  }, [schedule, onChange]);

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

  // Get day index (0-27 for 4 weeks)
  const getDayIndex = (week, dayOfWeek) => week * 7 + dayOfWeek;

  // Get day label
  const getDayLabel = (dayOfWeek) => weekDays[dayOfWeek];

  // Handle day click - open modal to edit time slots
  const handleDayClick = (week, dayOfWeek) => {
    const dayIndex = getDayIndex(week, dayOfWeek);
    setSelectedDay({ week, dayOfWeek, dayIndex });
    setShowModal(true);
  };

  // Add new time slot for selected day
  const addTimeSlot = () => {
    if (selectedDay === null) return;

    const dayIndex = selectedDay.dayIndex;
    const currentSlots = schedule[dayIndex] || [];

    const newSlot = {
      parent: 'parent1',
      timeFrame: '',
      wholeDay: false
    };

    setSchedule(prev => ({
      ...prev,
      [dayIndex]: [...currentSlots, newSlot]
    }));
  };

  // Update a time slot
  const updateTimeSlot = (slotIndex, field, value) => {
    if (selectedDay === null) return;

    const dayIndex = selectedDay.dayIndex;
    const currentSlots = [...(schedule[dayIndex] || [])];

    if (field === 'wholeDay' && value === true) {
      // If marking as whole day, clear time frame
      currentSlots[slotIndex] = {
        ...currentSlots[slotIndex],
        wholeDay: true,
        timeFrame: ''
      };
    } else {
      currentSlots[slotIndex] = {
        ...currentSlots[slotIndex],
        [field]: value
      };
    }

    setSchedule(prev => ({
      ...prev,
      [dayIndex]: currentSlots
    }));
  };

  // Remove a time slot
  const removeTimeSlot = (slotIndex) => {
    if (selectedDay === null) return;

    const dayIndex = selectedDay.dayIndex;
    const currentSlots = [...(schedule[dayIndex] || [])];
    currentSlots.splice(slotIndex, 1);

    if (currentSlots.length === 0) {
      // Remove day from schedule if no slots left
      setSchedule(prev => {
        const newSchedule = { ...prev };
        delete newSchedule[dayIndex];
        return newSchedule;
      });
    } else {
      setSchedule(prev => ({
        ...prev,
        [dayIndex]: currentSlots
      }));
    }
  };

  // Clear all time slots for selected day
  const clearDay = () => {
    if (selectedDay === null) return;

    const dayIndex = selectedDay.dayIndex;
    setSchedule(prev => {
      const newSchedule = { ...prev };
      delete newSchedule[dayIndex];
      return newSchedule;
    });
    setShowModal(false);
  };

  // Clear entire schedule
  const clearSchedule = () => {
    if (window.confirm('Are you sure you want to clear the entire schedule?')) {
      setSchedule({});
    }
  };

  // Get display text for a day
  const getDayDisplay = (week, dayOfWeek) => {
    const dayIndex = getDayIndex(week, dayOfWeek);
    const slots = schedule[dayIndex];

    if (!slots || slots.length === 0) {
      return null;
    }

    return slots.map((slot, idx) => {
      const parentLabel = slot.parent === 'parent1' ? parent1Label : parent2Label;
      const time = slot.wholeDay ? 'All day' : slot.timeFrame || 'No time set';
      return (
        <div key={idx} className={`schedule-builder__day-slot schedule-builder__day-slot--${slot.parent}`}>
          <div className="schedule-builder__day-slot-parent">{parentLabel}</div>
          <div className="schedule-builder__day-slot-time">{time}</div>
        </div>
      );
    });
  };

  // Get statistics
  const getStats = () => {
    const stats = {
      parent1Days: 0,
      parent2Days: 0,
      splitDays: 0,
      unassignedDays: 0,
      total: 28
    };

    for (let i = 0; i < 28; i++) {
      const slots = schedule[i];
      if (!slots || slots.length === 0) {
        stats.unassignedDays++;
      } else if (slots.length === 1) {
        if (slots[0].parent === 'parent1') {
          stats.parent1Days++;
        } else {
          stats.parent2Days++;
        }
      } else {
        stats.splitDays++;
      }
    }

    return stats;
  };

  const stats = getStats();

  return (
    <div className="schedule-builder">
      {/* Legend */}
      <div className="schedule-builder__legend">
        <div className="schedule-builder__legend-item">
          <div className="schedule-builder__legend-color schedule-builder__legend-color--parent1"></div>
          <span>{parent1Label}</span>
        </div>
        <div className="schedule-builder__legend-item">
          <div className="schedule-builder__legend-color schedule-builder__legend-color--parent2"></div>
          <span>{parent2Label}</span>
        </div>
        <div className="schedule-builder__legend-item">
          <div className="schedule-builder__legend-color schedule-builder__legend-color--unassigned"></div>
          <span>Unassigned</span>
        </div>
      </div>

      {/* Calendar Grid - 4 weeks */}
      <div className="schedule-builder__weekly-grid">
        {/* Day headers */}
        <div className="schedule-builder__weekday-header">
          <div className="schedule-builder__week-label"></div>
          {weekDays.map(day => (
            <div key={day} className="schedule-builder__weekday">
              {day.substring(0, 3)}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {[0, 1, 2, 3].map(week => (
          <div key={week} className="schedule-builder__week-row">
            <div className="schedule-builder__week-label">{weekLabels[week]}</div>
            {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => {
              const dayIndex = getDayIndex(week, dayOfWeek);
              const hasSlots = schedule[dayIndex] && schedule[dayIndex].length > 0;

              return (
                <button
                  key={dayOfWeek}
                  type="button"
                  className={`schedule-builder__day-cell ${hasSlots ? 'schedule-builder__day-cell--has-slots' : ''}`}
                  onClick={() => handleDayClick(week, dayOfWeek)}
                  aria-label={`${getDayLabel(dayOfWeek)} ${weekLabels[week]}`}
                >
                  {getDayDisplay(week, dayOfWeek)}
                  {!hasSlots && <Plus size={16} className="schedule-builder__add-icon" />}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Statistics */}
      <div className="schedule-builder__stats">
        <div className="schedule-builder__stat">
          <span className="schedule-builder__stat-label">{parent1Label} (full days):</span>
          <span className="schedule-builder__stat-value">{stats.parent1Days}</span>
        </div>
        <div className="schedule-builder__stat">
          <span className="schedule-builder__stat-label">{parent2Label} (full days):</span>
          <span className="schedule-builder__stat-value">{stats.parent2Days}</span>
        </div>
        <div className="schedule-builder__stat">
          <span className="schedule-builder__stat-label">Split days:</span>
          <span className="schedule-builder__stat-value">{stats.splitDays}</span>
        </div>
        <div className="schedule-builder__stat">
          <span className="schedule-builder__stat-label">Unassigned:</span>
          <span className="schedule-builder__stat-value">{stats.unassignedDays}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="schedule-builder__actions">
        <button
          type="button"
          onClick={clearSchedule}
          className="schedule-builder__clear-button"
        >
          Clear Schedule
        </button>
      </div>

      {/* Modal for editing day */}
      {showModal && selectedDay && (
        <div className="schedule-builder__modal-overlay" onClick={() => setShowModal(false)}>
          <div className="schedule-builder__modal" onClick={(e) => e.stopPropagation()}>
            <div className="schedule-builder__modal-header">
              <h3>
                {getDayLabel(selectedDay.dayOfWeek)} - {weekLabels[selectedDay.week]}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="schedule-builder__modal-close"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="schedule-builder__modal-content">
              {/* Time slots */}
              <div className="schedule-builder__time-slots">
                {(schedule[selectedDay.dayIndex] || []).map((slot, idx) => (
                  <div key={idx} className="schedule-builder__time-slot">
                    <div className="schedule-builder__time-slot-controls">
                      {/* Parent selection */}
                      <div className="schedule-builder__field">
                        <label className="schedule-builder__label">Parent:</label>
                        <select
                          value={slot.parent}
                          onChange={(e) => updateTimeSlot(idx, 'parent', e.target.value)}
                          className="schedule-builder__select"
                        >
                          <option value="parent1">{parent1Label}</option>
                          <option value="parent2">{parent2Label}</option>
                        </select>
                      </div>

                      {/* Whole day checkbox */}
                      <div className="schedule-builder__field schedule-builder__field--checkbox">
                        <label className="schedule-builder__checkbox-label">
                          <input
                            type="checkbox"
                            checked={slot.wholeDay}
                            onChange={(e) => updateTimeSlot(idx, 'wholeDay', e.target.checked)}
                            className="schedule-builder__checkbox"
                          />
                          Whole day
                        </label>
                      </div>

                      {/* Time frame */}
                      {!slot.wholeDay && (
                        <div className="schedule-builder__field schedule-builder__field--full">
                          <label className="schedule-builder__label">Time frame:</label>
                          <input
                            type="text"
                            value={slot.timeFrame}
                            onChange={(e) => updateTimeSlot(idx, 'timeFrame', e.target.value)}
                            placeholder="e.g., 'Until noon' or '4:00 PM - 7:30 PM'"
                            className="schedule-builder__input"
                          />
                        </div>
                      )}
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(idx)}
                      className="schedule-builder__remove-slot"
                      aria-label="Remove time slot"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {/* Add slot button */}
                <button
                  type="button"
                  onClick={addTimeSlot}
                  className="schedule-builder__add-slot"
                >
                  <Plus size={16} />
                  Add Time Slot
                </button>
              </div>
            </div>

            <div className="schedule-builder__modal-footer">
              <button
                type="button"
                onClick={clearDay}
                className="schedule-builder__modal-button schedule-builder__modal-button--secondary"
              >
                Clear Day
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="schedule-builder__modal-button schedule-builder__modal-button--primary"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help text and errors */}
      {error && (
        <div className="schedule-builder__error" role="alert">
          {error}
        </div>
      )}

      {helpText && !error && (
        <div className="schedule-builder__help-text">
          {helpText}
        </div>
      )}
    </div>
  );
}
