import Footer from '../components/common/Footer';
import Header from '../components/common/Header';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../hooks/useForm';
import './Page.css';


export default function Transportation() {
  const navigate = useNavigate();
  const { state, dispatch } = useForm();

  return (
    <div className="page-container">

      <Header />
      
      <div className="page-content">
        <h1>Transportation</h1>
        <p>This is where the transportation arrangements will go</p>
      </div>

      <Footer 
        showBackButton={true}
        showNextButton={true}
        onNext={() => navigate('/review')}
        onBack={() => navigate('/custody-schedule')}/> 
    </div>
  )
}