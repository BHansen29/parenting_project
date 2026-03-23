import { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';
import './Tooltip.css';

export default function Tooltip({ content, children }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const tooltipRef = useRef(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isLocked && tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setIsLocked(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLocked]);

  const handleIconClick = (e) => {
    e.stopPropagation();
    setIsLocked(!isLocked);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setIsLocked(false);
  };

  const showTooltip = isHovered || isLocked;

  return (
    <div className="tooltip" ref={tooltipRef}>
      <div
        className="tooltip__trigger"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleIconClick}
      >
        <Info className="tooltip__icon" size={18} />
      </div>

      {showTooltip && (
        <div className={`tooltip__dialog ${isLocked ? 'tooltip__dialog--locked' : ''}`}>
          <div className="tooltip__header">
            <div className="tooltip__header-icon">
              <Info size={16} />
            </div>
            {isLocked && (
              <button
                className="tooltip__close"
                onClick={handleClose}
                aria-label="Close tooltip"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="tooltip__content">
            {content || children}
          </div>
        </div>
      )}
    </div>
  );
}
