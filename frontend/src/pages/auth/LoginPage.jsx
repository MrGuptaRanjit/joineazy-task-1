import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const user = await login({
        email: formData.email,
        password: formData.password,
      });

      success(`Welcome back, ${user.name}!`);

      // Determine redirect path
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err.message || 'Invalid email or password.';
      setServerError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (email, password) => {
    setFormData({ email, password });
    setErrors({});
    setServerError('');
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Sign In</h2>
        <p className="text-xs text-slate-400 mt-1">Access your assignments and group workspace</p>
      </div>

      {serverError && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="student@student.edu"
          icon={Mail}
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            if (errors.email) setErrors({ ...errors, email: '' });
          }}
          error={errors.email}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          icon={Lock}
          value={formData.password}
          onChange={(e) => {
            setFormData({ ...formData, password: e.target.value });
            if (errors.password) setErrors({ ...errors, password: '' });
          }}
          error={errors.password}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          icon={LogIn}
          className="w-full mt-2"
        >
          Sign In
        </Button>
      </form>

      {/* Demo Credentials Quick-Fill */}
      <div className="mt-6 pt-5 border-t border-slate-800/80">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-2.5">
          Quick Demo Accounts
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleDemoFill('alex@student.edu', 'Password123!')}
            className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-left transition-colors"
          >
            <span className="font-semibold text-teal-400 block truncate">Alex (Student)</span>
            <span className="text-[10px] text-slate-500 block truncate">Group Alpha</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill('ethan@student.edu', 'Password123!')}
            className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-left transition-colors"
          >
            <span className="font-semibold text-teal-400 block truncate">Ethan (Student)</span>
            <span className="text-[10px] text-slate-500 block truncate">No Group (New)</span>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-400">
        Don't have a student account?{' '}
        <Link to="/register" className="font-semibold text-teal-400 hover:text-teal-300 hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
}
