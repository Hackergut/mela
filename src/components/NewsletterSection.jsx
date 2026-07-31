import React, { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section id="newsletter" className="py-20 px-6 lg:px-8 bg-[#1d1d1f]">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FF6B35] mb-4">Get Notified</p>
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
          Join our Newsletter
        </h2>
        <p className="text-[#a1a1a6] mb-10 text-base">
          Get notified about new updates and exclusive offers.
        </p>

        {submitted ? (
          <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-2xl px-8 py-6">
            <p className="text-[#FF6B35] font-semibold text-lg">You're in! 🎉</p>
            <p className="text-[#a1a1a6] text-sm mt-1">We'll keep you updated with the best deals.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-5 py-3.5 rounded-full bg-white/10 text-white placeholder-[#6e6e73] border border-white/10 focus:outline-none focus:border-[#FF6B35] text-sm transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3.5 bg-[#FF6B35] text-white text-sm font-semibold rounded-full hover:bg-[#e55a28] transition-colors whitespace-nowrap"
            >
              Submit
            </button>
          </form>
        )}
      </div>
    </section>
  );
}