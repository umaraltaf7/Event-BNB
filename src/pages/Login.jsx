import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/authStore';
import { showToast } from '../utils/toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = user?.role === 'lister' ? '/lister/dashboard' : '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = (data) => {
    // Mock authentication - in real app, this would be an API call
    const mockUsers = {
      user: { id: '1', name: 'John Doe', email: data.email, role: 'user' },
      lister: { id: '2', name: 'Jane Smith', email: data.email, role: 'lister' },
    };

    // Simple mock: if email contains 'lister', login as lister
    const user = data.email.includes('lister') ? mockUsers.lister : mockUsers.user;
    
    login(user);
    showToast('Login successful!', 'success');
    
    // Role-based redirect
    if (user.role === 'lister') {
      navigate('/lister/dashboard', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to EventBnB
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/signup" className="font-medium text-rose-600 hover:text-rose-500">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
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
          </div>

          <div>
            <Button type="submit" className="w-full" size="lg">
              Sign in
            </Button>
          </div>

          <div className="text-sm text-gray-600 bg-gray-100 p-4 rounded-lg">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <p>User: any email (e.g., user@example.com)</p>
            <p>Lister: email containing "lister" (e.g., lister@example.com)</p>
            <p>Password: any password (min 6 chars)</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

