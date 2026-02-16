import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { useNavigate } from 'react-router-dom';
import './Page.css';

export default function CustodySchedule() {
  const navigate = useNavigate();

  return (
    
    <div className="page-container">

      <Header />

      <div className="page-content">
        <h1>Custody Schedule</h1>
        <p>This is where the custody schedule form will go</p>
      </div>

      <Footer 
        showBackButton={true}
        showNextButton={true}
        onNext={() => navigate('/transportation')}
        onBack={() => navigate('/household-info')}
        />

    </div>
  )
}