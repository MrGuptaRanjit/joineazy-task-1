import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Hash, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function RegisterPage() {
  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    student_id: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.student_id.trim()) {
      errs.student_id = 'Student ID / Roll Number is required.';
    } else if (formData.student_id.trim().length < 2) {
      errs.student_id = 'Student ID must be at least 2 characters.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
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
      const user = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        student_id: formData.student_id.trim().toUpperCase(),
        password: formData.password,
      });

      success(`Account created successfully! Welcome, ${user.name}.`);
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      const msg = err.message || 'Registration failed. Please check your details.';
      setServerError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Student Registration</h2>
        <p className="text-xs text-slate-400 mt-1">Create an account to join student groups & submit work</p>
      </div>

      {serverError && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          icon={User}
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: '' });
          }}
          error={errors.name}
          required
        />

        <Input
          label="Student Email"
          type="email"
          placeholder="john.doe@university.edu"
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
          label="Student ID / Roll No."
          type="text"
          placeholder="STU2045"
          icon={Hash}
          value={formData.student_id}
          onChange={(e) => {
            setFormData({ ...formData, student_id: e.target.value });
            if (errors.student_id) setErrors({ ...errors, student_id: '' });
          }}
          error={errors.student_id}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="•••••••• (Min. 6 chars)"
          icon={Lock}
          value={formData.password}
          onChange={(e) => {
            setFormData({ ...formData, password: e.target.value });
            if (errors.password) setErrors({ ...errors, password: '' });
          }}
          error={errors.password}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          value={formData.confirmPassword}
          onChange={(e) => {
            setFormData({ ...formData, confirmPassword: e.target.value });
            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
          }}
          error={errors.confirmPassword}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          icon={UserPlus}
          className="w-full mt-3"
        >
          Create Student Account
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-teal-400 hover:text-teal-300 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
