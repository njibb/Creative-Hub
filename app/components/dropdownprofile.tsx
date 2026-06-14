'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function DropdownProfil({ name }: { name: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fungsi buat nutup dropdown kalau diklik di luar area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Tombol Profil (Pemicu Dropdown) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-2xl transition-all"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-black text-slate-800 leading-none mb-1">{name}</p>
          <p className="text-[10px] font-black text-purple-600 tracking-widest uppercase">DIV. CREATIVE</p>
        </div>
        <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-black shadow-lg shadow-purple-200 uppercase">
          {name[0]}
        </div>
      </button>

      {/* Konten Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-200">
          <button 
            onClick={() => signOut()} 
            className="w-full flex items-center gap-3 text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl text-sm font-bold transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}