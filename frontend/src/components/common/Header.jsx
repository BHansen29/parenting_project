import { useNavigate } from 'react-router-dom';
import './Header.css';
import logo from '../../assets/logos/ShareCare_Symmetrical Diamond Logo (1120 x 310 px).png';

export default function Header({
  showNavigation = true,
  saved = false,
}) {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/landing-page');
  };

  return (
    <header className="header">
      <div className="header__top-bar">
        <img
          src={logo}
          alt="ShareCare"
          className="header__logo"
          onClick={handleLogoClick}
        />

        {saved && (
          <div className="header__saved">
            <svg className="header__saved-icon" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Saved
          </div>
        )}
      </div>
    </header>
  );
}
