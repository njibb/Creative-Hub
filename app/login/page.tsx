'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // STATE BARU BUAT NGINTIP PASSWORD
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError('Email atau password salah bre!');
      setIsLoading(false);
    } else {
      router.push('/'); // Kalau sukses, lempar ke halaman utama
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900">Masuk <span className="text-purple-600">Creative Hub</span></h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Khusus anak divisi yang punya akses.</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold mb-6 text-center">{error}</div>}

       <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
            <input 
              required 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              // Tambahin bg-slate-50, text-slate-900, dan focus:bg-white di sini
              className="w-full bg-slate-50 text-slate-900 border-2 border-slate-100 p-3 rounded-xl focus:bg-white focus:border-purple-500 outline-none transition-all font-bold" 
              placeholder="creative@irmala.com" 
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <input 
                required 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                // Samain kelasnya kayak email
                className="w-full bg-slate-50 text-slate-900 border-2 border-slate-100 p-3 pr-12 rounded-xl focus:bg-white focus:border-purple-500 outline-none transition-all font-bold" 
                placeholder="••••••••" 
              />
              
              {/* TOMBOL MATA (Biarin aja kodingan svg matanya gak usah diubah) */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors focus:outline-none p-1"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white p-4 rounded-xl font-black hover:bg-purple-600 transition-colors mt-4">
            {isLoading ? 'Ngecek Kunci... ⏳' : 'GAS MASUK 🚀'}
          </button>
        </form>

        <Link href="/" className="block text-center mt-6 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
          ← Kembali ke Halaman Utama
        </Link>
      </div>
    </div>
  );
}