// Reusable checkbox list for selecting children by name.
// Pulls display names from child objects ({ id, firstName, lastName }).
// Props:
//   children:  array of child objects from form context
//   selected:  array of currently selected display name strings
//   onChange:  (newSelectedArray) => void
//   label:     optional question label rendered above the list

export default function ChildCheckboxList({ children, selected, onChange, label }) {
    const toggle = (name) => {
      const next = selected.includes(name)
        ? selected.filter(n => n !== name)
        : [...selected, name];
      onChange(next);
    };
  
    return (
      <div className="tax-child-list">
        {label && <p className="parent-label">{label}</p>}
        {children.map((child) => {
          const name = `${child.firstName} ${child.lastName}`.trim() || `Child ${child.id}`;
          const checked = selected.includes(name);
          return (
            <label
              key={child.id}
              className={`radio-option${checked ? ' radio-option--checked' : ''}`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(name)}
                className="tax-checkbox"
              />
              <span>{name}</span>
            </label>
          );
        })}
      </div>
    );
  }