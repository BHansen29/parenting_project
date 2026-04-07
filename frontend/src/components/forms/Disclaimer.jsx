// Reusable disclaimer banner used across form pages.
// Props:
//   variant: 'info' (blue) | 'warning' (amber)
//   children: the disclaimer text

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" /><path d="M12 8h.01" />
    </svg>
  );
  
  const WarningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
  );
  
  export default function Disclaimer({ children, variant = 'info' }) {
    return (
      <div className={`tax-disclaimer tax-disclaimer--${variant}`}>
        <div className="tax-disclaimer__icon">
          {variant === 'warning' ? <WarningIcon /> : <InfoIcon />}
        </div>
        <p className="tax-disclaimer__text">{children}</p>
      </div>
    );
  }