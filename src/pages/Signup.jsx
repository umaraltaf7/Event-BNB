import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/authStore';
import { showToast } from '../utils/toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Signup = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);
  const user = useAuthStore((state) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [role, setRole] = useState('user');

  const password = watch('password');

  // Redirect if already authenticated (use role from profile or user metadata)
  useEffect(() => {
    if (!isAuthenticated || loading) return;
    const effectiveRole = profile?.role || user?.user_metadata?.role;
    if (!effectiveRole) return;
    navigate(effectiveRole === 'lister' ? '/lister/dashboard' : '/dashboard', { replace: true });
  }, [isAuthenticated, profile, user, loading, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const signUp = useAuthStore.getState().signUp;
      const result = await signUp(data.email, data.password, data.name, role);

      if (result.success) {
        if (result.requiresEmailConfirmation) {
          showToast('Account created! Please check your email to confirm, then sign in.', 'success');
          navigate('/login', { replace: true });
        } else {
          showToast('Account created successfully!', 'success');
          // Do not navigate here; let the auth effect redirect after authLoading completes
        }
      } else {
        showToast(result.error || 'Signup failed. Please try again.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-rose-600 hover:text-rose-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              {...register('name', { required: 'Name is required' })}
              error={errors.name?.message}
            />
            <Input
              label="Email address"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              error={errors.password?.message}
            />
            <Input
              label="Confirm Password"
              type="password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
              error={errors.confirmPassword?.message}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to:
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={role === 'user'}
                    onChange={(e) => setRole(e.target.value)}
                    className="mr-2"
                  />
                  <span>Browse and book events</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="lister"
                    checked={role === 'lister'}
                    onChange={(e) => setRole(e.target.value)}
                    className="mr-2"
                  />
                  <span>Create and manage events</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner size="sm" /> : 'Sign up'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;

