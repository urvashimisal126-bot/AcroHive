import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-black text-white flex flex-col items-center justify-center pt-10 pb-20 px-4">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-[#0d1a2e] text-[11px] font-mono tracking-[0.2em] text-primary mb-8 mt-10">
        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
        INTELLIAI ARENA 2026
      </div>

      {/* Headline */}
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center tracking-tight leading-[1.1] mb-6">
        Smart Campus<br />
        <span className="text-primary drop-shadow-[0_0_20px_rgba(0,212,255,0.3)]">Event OS</span>
      </h1>

      {/* Subtitle */}
      <p className="text-gray-400 text-lg md:text-xl text-center max-w-2xl mx-auto mb-12 leading-relaxed">
        Register for events, collect QR tickets, check in with geofenced scanning, and let AI power your campus experience.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24 w-full sm:w-auto">
        <Link
          to="/auth"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-black px-8 py-3.5 rounded-lg font-bold hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)]"
        >
          <Zap size={18} className="fill-current" />
          Get Started
        </Link>
        <Link
          to="/events"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent text-primary border border-primary/40 px-8 py-3.5 rounded-lg font-semibold hover:bg-primary/10 transition-colors"
        >
          Browse Events <ArrowRight size={18} />
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 max-w-4xl mx-auto text-center">
        <div className="space-y-1">
          <h3 className="text-3xl md:text-4xl font-bold text-primary">6+</h3>
          <p className="text-gray-500 text-sm font-medium">Events</p>
        </div>
        <div className="space-y-1">
          <h3 className="text-3xl md:text-4xl font-bold text-primary">1200+</h3>
          <p className="text-gray-500 text-sm font-medium">Students</p>
        </div>
        <div className="space-y-1">
          <h3 className="text-3xl md:text-4xl font-bold text-primary">98%</h3>
          <p className="text-gray-500 text-sm font-medium">Check-in Rate</p>
        </div>
        <div className="space-y-1">
          <h3 className="text-3xl md:text-4xl font-bold text-primary">0</h3>
          <p className="text-gray-500 text-sm font-medium">Proxy Entries</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-24 pb-6">
        <p className="text-gray-600 text-xs text-center font-mono">
          &copy; 2026 <span className="text-primary font-bold font-sans">AcroHive</span> &mdash; Smart Campus Event Operating System
        </p>
      </div>
    </div>
  );
}
