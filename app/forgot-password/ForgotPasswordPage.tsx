'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email';
      if (errorMessage.includes('user-not-found')) {
        setError('No account found with this email');
      } else if (errorMessage.includes('invalid-email')) {
        setError('Please enter a valid email address');
      } else {
        setError('Failed to send reset email. Please try again');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-30">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            {success ? (
              // Success State
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
                <p className="text-white/60 text-sm mb-6">
                  We&apos;ve sent a password reset link to <span className="text-white">{email}</span>
                </p>
                <Link
                  href="/login"
                  className="inline-block w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all duration-200 text-center"
                >
                  Back to Sign In
                </Link>
              </div>
            ) : (
              // Form State
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">Forgot password?</h1>
                  <p className="text-white/60 text-sm">No worries, we&apos;ll send you reset instructions</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                        Sending...
                      </span>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>

                {/* Back to Login */}
                <Link
                  href="/login"
                  className="mt-6 flex items-center justify-center gap-2 text-white/50 text-sm hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
