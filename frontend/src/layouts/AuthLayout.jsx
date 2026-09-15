import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 relative selection:bg-teal-500 selection:text-white">
      {/* Background Accent glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 text-center relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shadow-xl shadow-teal-500/5">
          <GraduationCap className="w-7 h-7" />
        </div>
        <div className="text-left">
          <h1 className="text-xl font-bold tracking-tight text-slate-100 leading-tight">EduFlow</h1>
          <p className="text-xs text-slate-400 font-medium">Student & Group Coursework Hub</p>
        </div>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative z-10">
        <Outlet />
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-slate-500 relative z-10">
        <p>© {new Date().getFullYear()} EduFlow Academy. All rights reserved.</p>
      </div>
    </div>
  );
}
