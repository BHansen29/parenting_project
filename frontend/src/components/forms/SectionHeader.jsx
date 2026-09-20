import FlagButton from './FlagButton';
import HelpMenu from '../common/HelpMenu';

/**
 * Reusable section header with icon, title, subtitle, and optional flag button.
 *
 * @param {ReactNode} icon           - The icon element (e.g. <Shield size={25} />)
 * @param {string}    iconClassName  - CSS class for the icon wrapper (e.g. "shield-icon", "car-icon")
 * @param {string}    title          - Section title
 * @param {string}    help           - Additional help text to display below the title (optional)
 * @param {object}    flag           - Optional flag hook result { isFlagged, toggleFlag }
 */
export default function SectionHeader({ icon, iconClassName = 'section-icon', title, help, flag }) {
  const inner = (
    <div className="section-header">
      <div className={iconClassName}>{icon}</div>
      <div className="section-title-group">
        <h2 className="section-title">{title}</h2>
        <HelpMenu text={help} />
      </div>
    </div>
  );

  if (flag) {
    return (
      <div className="section-header-with-flag">
        {inner}
        <div className="section-flag">
          <FlagButton isFlagged={flag.isFlagged} onClick={flag.toggleFlag} />
        </div>
      </div>
    );
  }

  return inner;
}
