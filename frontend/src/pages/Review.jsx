import Footer from '../components/common/Footer';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../hooks/useForm';
import './Page.css';  

export default function Review() {
  const navigate = useNavigate();
  const { state } = useForm();

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Review & Submit</h1>
        <p>This is where the review page will go</p>
      </div>

            <Footer 
              showBackButton={true}
              showNextButton={false}
              onBack={() => navigate('/transportation')}
              /> 
    </div>
  )
}