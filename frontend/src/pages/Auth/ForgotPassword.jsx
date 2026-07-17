import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';
import { motion } from 'framer-motion';
import { Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your email address.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Request failed. Please try again.');
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
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-deep-brown/10 to-transparent pointer-events-none" />

        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-deep-brown mb-4">Request Received</h2>
            <p className="text-warm-gray text-sm leading-relaxed mb-8 max-w-sm mx-auto font-medium">
              If an account is associated with <span className="text-deep-brown font-semibold">{email}</span>, you will receive a password reset link shortly.
            </p>
            <Link 
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-dusty-rose hover:text-deep-brown transition-colors"
            >
              <ArrowLeft size={16} />
              Return to Login
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-bold text-deep-brown mb-2">Reset Password</h2>
              <p className="text-warm-gray text-sm font-medium">We'll send you link instructions to access your account.</p>
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

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@example.com"
                    className="w-full bg-warm-ivory/50 border border-warm-gray/20 rounded-2xl py-3.5 pl-12 pr-4 text-deep-brown placeholder-warm-gray/40 text-sm focus:outline-none focus:border-dusty-rose focus:ring-1 focus:ring-dusty-rose/20 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-deep-brown text-warm-ivory py-4 rounded-2xl hover:bg-deep-brown/95 transition-all shadow-soft text-sm font-semibold mt-4 group active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none"
              >
                {submitting ? 'Sending Request...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link 
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-semibold text-warm-gray hover:text-deep-brown transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
