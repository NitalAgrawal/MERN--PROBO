import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-3xl p-8 shadow-soft border border-warm-gray/10 relative overflow-hidden"
      >
        {/* Book spine decorative effect on the left */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-deep-brown/10 to-transparent pointer-events-none" />

        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-deep-brown mb-2">Welcome Back</h2>
          <p className="text-warm-gray text-sm font-medium">Continue writing your beautiful stories.</p>
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-warm-gray mb-2 ml-1">
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
                className="w-full bg-warm-ivory/50 border border-warm-gray/20 rounded-2xl py-3.5 pl-12 pr-4 text-deep-brown placeholder-warm-gray/40 text-sm focus:outline-none focus:border-dusty-rose focus:ring-1 focus:ring-dusty-rose/20 transition-all font-medium"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-warm-gray">
                Password
              </label>
              <Link 
                to="/forgot-password" 
                className="text-xs text-dusty-rose font-semibold hover:text-deep-brown transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-warm-gray/60">
                <Lock size={18} />
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-warm-ivory/50 border border-warm-gray/20 rounded-2xl py-3.5 pl-12 pr-4 text-deep-brown placeholder-warm-gray/40 text-sm focus:outline-none focus:border-dusty-rose focus:ring-1 focus:ring-dusty-rose/20 transition-all font-medium"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-deep-brown text-warm-ivory py-4 rounded-2xl hover:bg-deep-brown/95 transition-all shadow-soft text-sm font-semibold mt-8 group active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
            {!submitting && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-warm-gray">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-dusty-rose hover:text-deep-brown font-semibold transition-colors border-b border-transparent hover:border-deep-brown pb-0.5"
          >
            Create an Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
