'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import DropdownProfil from './dropdownprofile'; // <-- Panggil komponen baru

export default function NavbarUser() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-purple-200">
             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <span className="text-xl font-black text-slate-800">Creative <span className="text-purple-600">Hub</span></span>
        </Link>

        <div className="flex items-center gap-4">
          {status === 'loading' ? (
             <div className="h-10 w-32 bg-slate-50 animate-pulse rounded-xl"></div>
          ) : session ? (
            // Panggil komponen dropdown di sini
            <DropdownProfil name={session.user?.name || 'Admin'} />
          ) : (
            <Link href="/login" className="bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white px-5 py-2 rounded-xl text-xs font-bold transition-all border border-purple-100">
              Login Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}