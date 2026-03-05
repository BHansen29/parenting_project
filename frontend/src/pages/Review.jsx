import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../hooks/useForm';
import { useNavigation } from '../context/NavigationContext';
import './Page.css';

export default function Review() {
  const navigate = useNavigate();
  const { state } = useForm();
  const { setOnNext, setOnBack } = useNavigation();

  const handleBack = () => {
    navigate('/tax-exemptions');
  };

  useEffect(() => {
    setOnNext(null);
    setOnBack(handleBack);
  }, []);

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Review & Submit</h1>
        <p>This is where the review page will go</p>
      </div>
    </div>
  );
}