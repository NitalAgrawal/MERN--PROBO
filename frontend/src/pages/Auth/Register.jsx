import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must contain at least one uppercase letter and one number.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await register({ name, email, password, confirmPassword });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-3xl p-8 shadow-soft border border-warm-gray/10 relative overflow-hidden"
      >
        {/* Book spine decorative effect on the left */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-deep-brown/10 to-transparent pointer-events-none" />

        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-deep-brown mb-2">Create Account</h2>
          <p className="text-warm-gray text-sm font-medium">Join StoryNest to start crafting your legacy.</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-200/50 rounded-2xl flex items-start gap-3 text-red-700 text-sm"
          >
            <AlertCircle className="shrink-0 mt-0.5" size={16} />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-warm-gray mb-1.5 ml-1">
              Your Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-warm-gray/60">
                <User size={18} />
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Mercer"
                className="w-full bg-warm-ivory/50 border border-warm-gray/20 rounded-2xl py-3 pl-12 pr-4 text-deep-brown placeholder-warm-gray/40 text-sm focus:outline-none focus:border-dusty-rose focus:ring-1 focus:ring-dusty-rose/20 transition-all font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-warm-gray mb-1.5 ml-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-warm-gray/60">
                <Mail size={18} />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-warm-ivory/50 border border-warm-gray/20 rounded-2xl py-3 pl-12 pr-4 text-deep-brown placeholder-warm-gray/40 text-sm focus:outline-none focus:border-dusty-rose focus:ring-1 focus:ring-dusty-rose/20 transition-all font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-warm-gray mb-1.5 ml-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-warm-gray/60">
                <Lock size={18} />
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className="w-full bg-warm-ivory/50 border border-warm-gray/20 rounded-2xl py-3 pl-12 pr-4 text-deep-brown placeholder-warm-gray/40 text-sm focus:outline-none focus:border-dusty-rose focus:ring-1 focus:ring-dusty-rose/20 transition-all font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-warm-gray mb-1.5 ml-1">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-warm-gray/60">
                <Lock size={18} />
              </span>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-warm-ivory/50 border border-warm-gray/20 rounded-2xl py-3 pl-12 pr-4 text-deep-brown placeholder-warm-gray/40 text-sm focus:outline-none focus:border-dusty-rose focus:ring-1 focus:ring-dusty-rose/20 transition-all font-medium"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-deep-brown text-warm-ivory py-4 rounded-2xl hover:bg-deep-brown/95 transition-all shadow-soft text-sm font-semibold mt-6 group active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none"
          >
            {submitting ? 'Creating Nest...' : 'Sign Up'}
            {!submitting && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-warm-gray">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="text-dusty-rose hover:text-deep-brown font-semibold transition-colors border-b border-transparent hover:border-deep-brown pb-0.5"
          >
            Sign In Instead
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
