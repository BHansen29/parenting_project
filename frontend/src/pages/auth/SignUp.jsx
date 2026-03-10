import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { syncFirebaseUserProfileSafely } from '../../lib/authApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/card';
import TextInput from '../../components/forms/TextInput';
import '../Page.css';
import './Auth.css';
import logo from '../../assets/logos/ShareCare_Symmetrical Diamond Logo (1120 x 310 px).png';

export default function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      try {
        // Create the user in Firebase Auth with email + password
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

        // Try to sync Mongo profile, but do not block sign-up if backend/database is down.
        await syncFirebaseUserProfileSafely(userCredential.user);

        // On success, send them to the next step
        navigate('/household-info');
      } catch (err) {
        // Show Firebase error in the form
        setErrors({ general: err.message });
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <img src={logo} alt="ShareCare" />
        </div>

        <Card className="auth-card">
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>Sign up to create your parenting plan</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} noValidate>
              <TextInput
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                required
                error={errors.email}
                placeholder="you@example.com"
                autoComplete="email"
              />

              <TextInput
                id="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange('password')}
                required
                error={errors.password}
                placeholder="Enter a password"
                autoComplete="new-password"
              />

              <div className="auth-options">
                <Link to="/forgot-password" className="auth-link">
                  Forgot password?
                </Link>
              </div>

              {errors.general && (
                <p role="alert" className="text-red-600 text-sm mb-4">
                  {errors.general}
                </p>
              )}

              <button
                type="submit"
                className="auth-button"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </button>

              <div className="auth-footer">
                <p>
                  Already have an account?{' '}
                  <Link to="/signin" className="auth-link">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="auth-back">
          <Link to="/" className="auth-link">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
