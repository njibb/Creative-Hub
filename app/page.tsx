'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react'; // <-- TAMBAHAN IMPORT NEXT-AUTH
import NavbarUser from './components/navbaruser';
import ModalTambahCreative from './components/modaltambahcreative';
import Link from 'next/link';

// =========================================================================
// KOMPONEN AJAIB V2: Galeri Drive dengan Fitur Navigasi Folder Dalam Folder
// =========================================================================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GaleriDrive = ({ acara, session }: { acara: any, session: any }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]); // Sekarang nampung file DAN folder
  const [loading, setLoading] = useState(true);
  const [isModalTerbuka, setIsModalTerbuka] = useState(false);

  // STATE BARU: Untuk ngatur navigasi folder di dalam modal
  const [currentFolderId, setCurrentFolderId] = useState(acara.drive_link);
  const [historyFolder, setHistoryFolder] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!isModalTerbuka) return; // Jalankan fetch cuma kalau modalnya lagi dibuka

    const fetchDriveContent = async () => {
      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY;
        
        // MANTRA SAKTI: Kita minta Google buat ngasih file gambar APALAGI folder biasa
        const query = `'${currentFolderId}' in parents and (mimeType contains 'image/' or mimeType = 'application/vnd.google-apps.folder') and trashed = false`;
        const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&key=${apiKey}&fields=files(id,name,mimeType,thumbnailLink,webViewLink)`;
        
        const res = await fetch(url);
        const json = await res.json();
        
        // Urutkan biar folder muncul di atas baru gambar di bawahnya
        if (json.files) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sortedItems = json.files.sort((a: any, b: any) => {
            if (a.mimeType === 'application/vnd.google-apps.folder' && b.mimeType !== 'application/vnd.google-apps.folder') return -1;
            if (a.mimeType !== 'application/vnd.google-apps.folder' && b.mimeType === 'application/vnd.google-apps.folder') return 1;
            return 0;
          });
          setItems(sortedItems);
        }
      } catch (error) {
        console.error("Gagal navigasi folder Drive:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDriveContent();
  }, [currentFolderId, isModalTerbuka, acara.drive_link]);

  // FUNGSI PAS FOLDER DIKLIK (Masuk ke dalem)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleMasukFolder = (folderId: string, folderName: string) => {
    const namaFolderSekarang = historyFolder.length === 0 ? 'Utama' : items.find(f => f.id === currentFolderId)?.name || 'Kembali';
    setHistoryFolder([...historyFolder, { id: currentFolderId, name: namaFolderSekarang }]);
    setCurrentFolderId(folderId);
  };

  // FUNGSI KETIKA KLIK BREADCRUMB / TOMBOL KEMBALI
  const handleKembaliKeFolder = (folderId: string, index: number) => {
    setCurrentFolderId(folderId);
    setHistoryFolder(historyFolder.slice(0, index));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleHapusAcara = async (e: any) => {
    e.stopPropagation();
    if(!window.confirm("Yakin mau hapus album acara ini?")) return;
    await fetch('/api/creative/dokumentasi', { method: 'DELETE', body: JSON.stringify({ id: acara.id }) });
    window.location.reload();
  };

  return (
    <>
      {/* ================= UI KARTU ALBUM (DI HALAMAN DEPAN) ================= */}
      <div 
        onClick={() => { setIsModalTerbuka(true); setCurrentFolderId(acara.drive_link); setHistoryFolder([]); }}
        className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-lg hover:border-purple-200 transition-all group flex flex-col"
      >
        {/* COVER BINGKAI */}
        <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden flex items-center justify-center">
          {items.length > 0 && items.some(i => i.thumbnailLink) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={items.find(i => i.thumbnailLink)?.thumbnailLink?.replace('=s220', '=s600')} alt="cover" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <p className="text-4xl animate-bounce">📁</p>
          )}
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-xl">
            ALBUM AKTIF
          </div>
        </div>

        {/* INFO ACARA */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-black text-slate-800 text-lg leading-tight mb-2 group-hover:text-purple-600 transition-colors">{acara.nama_acara}</h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
              📅 {new Date(acara.tgl_acara).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          {session && (
            <button onClick={handleHapusAcara} className="w-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all mt-auto z-10 relative">
              Hapus Album
            </button>
          )}
        </div>
      </div>

      {/* ================= MODAL POP-UP (PAS KARTU DIKLIK) ================= */}
      {isModalTerbuka && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 md:p-8">
          <div className="bg-white w-full max-w-6xl rounded-[2.5rem] shadow-2xl flex flex-col h-[90vh] md:h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-300">
            
            {/* Header Modal & Breadcrumbs */}
            <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white z-10">
              <div>
                <h3 className="font-black text-2xl text-slate-800">{acara.nama_acara}</h3>
                
                {/* TRACK JALUR FOLDER (BREADCRUMBS UI) */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mt-2 flex-wrap">
                  <span 
                    onClick={() => handleKembaliKeFolder(acara.drive_link, 0)}
                    className={`cursor-pointer hover:text-purple-600 ${currentFolderId === acara.drive_link ? 'text-purple-600 font-black' : ''}`}
                  >
                    📁 Root
                  </span>
                  {historyFolder.map((folder, index) => (
                    <span key={folder.id} className="flex items-center gap-1.5">
                      <span>/</span>
                      <span 
                        onClick={() => handleKembaliKeFolder(folder.id, index)}
                        className={`cursor-pointer hover:text-purple-600 truncate max-w-[100px] ${currentFolderId === folder.id ? 'text-purple-600 font-black' : ''}`}
                      >
                        {folder.name}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={() => setIsModalTerbuka(false)} className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all font-black text-lg self-end md:self-auto">
                ✖
              </button>
            </div>

            {/* Area Grid Foto & Folder */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-slate-400 font-bold animate-pulse">Menyelami isi folder Drive... 🔄</p>
                </div>
              ) : items.length === 0 ? (
                <div className="h-full flex items-center justify-center flex-col gap-4">
                  <p className="text-5xl">📂</p>
                  <p className="text-slate-400 font-bold">Folder ini masih kosong cuy.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {items.map((item) => {
                    const isFolder = item.mimeType === 'application/vnd.google-apps.folder';

                    if (isFolder) {
                      return (
                        <div 
                          key={item.id}
                          onClick={() => handleMasukFolder(item.id, item.name)}
                          className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm hover:border-purple-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between aspect-square group/folder"
                        >
                          <div className="text-5xl group-hover/folder:scale-110 transition-transform">📁</div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug">{item.name}</h4>
                            <p className="text-[10px] font-black text-purple-500 mt-1 uppercase tracking-wider">Klik Buka ↗</p>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <a 
                          key={item.id} 
                          href={item.webViewLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="overflow-hidden rounded-2xl group/img relative bg-slate-200 aspect-square border border-slate-200 block shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.thumbnailLink?.replace('=s220', '=s800')} alt={item.name} className="object-cover w-full h-full group-hover/img:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <p className="text-white text-xs font-bold truncate w-full text-center bg-white/20 backdrop-blur-md py-2 rounded-xl">Lihat HD ↗</p>
                          </div>
                        </a>
                      );
                    }
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
// =========================================================================

export default function CreativeHubPage() {
  // <-- UBAH KE SESSION ASLI DARI NEXT-AUTH -->
  const { data: session } = useSession(); 
  
  const [activeTab, setActiveTab] = useState('assets'); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dataToEdit, setDataToEdit] = useState<any>(null); 

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dataKonten, setDataKonten] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dataAset, setDataAset] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dataDocs, setDataDocs] = useState<any[]>([]); 
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSemuaData = async () => {
      try {
        const [resK, resA, resD] = await Promise.all([
          fetch('/api/creative/konten'), 
          fetch('/api/creative/aset'),
          fetch('/api/creative/dokumentasi') 
        ]);
        const [jsonK, jsonA, jsonD] = await Promise.all([resK.json(), resA.json(), resD.json()]);
        
        if (jsonK.success) setDataKonten(jsonK.data);
        if (jsonA.success) setDataAset(jsonA.data);
        if (jsonD.success) setDataDocs(jsonD.data);
      } finally { setIsLoading(false); }
    };
    fetchSemuaData();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (item: any) => { setDataToEdit(item); setIsModalOpen(true); };

  const handleHapusAset = async (id: string) => {
    if (!window.confirm("Hapus aset ini?")) return;
    await fetch('/api/creative/aset', { method: 'DELETE', body: JSON.stringify({ id }) });
    window.location.reload();
  };

  const handleHapusKonten = async (id: string) => {
    if (!window.confirm("Hapus konten ini?")) return;
    await fetch('/api/creative/konten', { method: 'DELETE', body: JSON.stringify({ id }) });
    window.location.reload();
  };

  const stats = [
    { label: 'Total Macam Aset', value: dataAset.length || 0, icon: '🎨', color: 'border-l-purple-500', bg: 'bg-purple-50', text: 'text-purple-600' },
    { label: 'Konten Diproses', value: dataKonten.length || 0, icon: '⏳', color: 'border-l-pink-500', bg: 'bg-pink-50', text: 'text-pink-600' },
    { label: 'Siap Tayang', value: dataKonten.filter(k => k.status === 'READY').length || 0, icon: '✅', color: 'border-l-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-600' },
    { label: 'Album Acara', value: dataDocs.length || 0, icon: '📸', color: 'border-l-blue-500', bg: 'bg-blue-50', text: 'text-blue-600' },
  ];

  return (
    <main className="min-h-screen bg-[#FDFDFF] font-sans text-slate-800 pb-12">
      <NavbarUser />

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Creative <span className="text-purple-600">Hub</span></h1>
              <p className="text-sm text-slate-500 font-medium">Manajemen aset visual dan perencanaan konten media sosial.</p>
            </div>
          </div>

          {/* <-- TAMBAHAN LOGIKA TOMBOL LOGIN / LOGOUT --> */}
          <div className="flex gap-2">
            {session ? (
              <>
                <button onClick={() => { setDataToEdit(null); setIsModalOpen(true); }} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-purple-100 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Tambah Data Creative
                </button>
                
              </>
            ) : (
              <Link href="/login" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg flex items-center justify-center">
                Login Admin
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className={`bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 border-l-4 ${stat.color}`}>
              <div className={`${stat.bg} ${stat.text} p-3 rounded-2xl text-xl`}>{stat.icon}</div>
              <div>
                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-tight">{stat.value}</h2>
              </div>
            </div>
          ))}
        </div>

        <div className="flex bg-slate-100/50 p-1.5 rounded-2xl mb-8 max-w-fit border border-slate-200/50">
          <button onClick={() => setActiveTab('assets')} className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'assets' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>🎨 Brand Kit & Aset</button>
          <button onClick={() => setActiveTab('calendar')} className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'calendar' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>📅 Kalender Konten</button>
          <button onClick={() => setActiveTab('docs')} className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'docs' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>📸 Dokumentasi Acara</button>
        </div>

        <div className="min-h-[400px]">
          {/* TAB 1: ASSETS */}
          {activeTab === 'assets' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dataAset.map((aset) => (
                  <div key={aset.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 flex flex-col justify-between group hover:border-purple-200 transition-all">
                    <div>
                      <div className="aspect-video bg-slate-50 rounded-2xl mb-4 flex items-center justify-center border border-slate-50 overflow-hidden relative">
                        {aset.link_file ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={aset.link_file} alt={aset.nama_aset} className="object-cover w-full h-full hover:scale-105 transition-transform duration-300" />
                        ) : (<div className="text-4xl">📄</div>)}
                      </div>
                      <div className="mb-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-500 bg-purple-50 px-2 py-1 rounded-md">{aset.kategori}</span>
                        <h3 className="font-bold text-slate-800 mt-2">{aset.nama_aset}</h3>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-auto">
                      <div className="flex gap-2">
                        <a href={aset.link_file} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white text-slate-700 border border-slate-200 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors text-center block">Lihat</a>
                        <a href={`${aset.link_file}?download=`} className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-purple-600 transition-colors text-center block">Download File</a>
                      </div>
                      {aset.caption && (<button onClick={() => {navigator.clipboard.writeText(aset.caption); alert('Caption disalin!');}} className="w-full bg-white text-slate-600 border border-slate-200 py-2.5 rounded-xl text-xs font-bold hover:border-purple-200 transition-colors">Salin Caption</button>)}
                      {session && (
                        <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100">
                          <button onClick={() => handleEdit(aset)} className="flex-1 bg-amber-50 text-amber-600 py-2 rounded-xl text-xs font-bold hover:bg-amber-500 hover:text-white transition-colors">Edit</button>
                          <button onClick={() => handleHapusAset(aset.id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-colors">Hapus</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* TAB 2: CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                    <tr><th className="px-4 py-4">Status</th><th className="px-4 py-4">Konten</th><th className="px-4 py-4">Platform</th><th className="px-4 py-4">PIC</th><th className="px-4 py-4">Target Tayang</th>{session && <th className="px-4 py-4 text-right">Aksi</th>}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {dataKonten.map((konten) => (
                      <tr key={konten.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-5"><span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${konten.status === 'READY' ? 'bg-indigo-100 text-indigo-600' : 'bg-pink-100 text-pink-600'}`}>{konten.status}</span></td>
                        <td className="px-4 py-5 font-bold text-slate-800 italic">{konten.judul_konten}</td>
                        <td className="px-4 py-5 font-medium text-slate-600">{konten.platform}</td>
                        <td className="px-4 py-5 font-bold text-slate-700">{konten.pic}</td>
                        <td className="px-4 py-5 text-slate-500">{new Date(konten.tgl_tayang).toLocaleDateString('id-ID')}</td>
                        {session && (
                          <td className="px-4 py-5 text-right">
                            <button onClick={() => handleEdit(konten)} className="text-amber-500 hover:text-amber-700 text-xs font-bold mr-3">Edit</button>
                            <button onClick={() => handleHapusKonten(konten.id)} className="text-red-500 hover:text-red-700 text-xs font-bold">Hapus</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTATION */}
          {activeTab === 'docs' && (
            <div>
              {isLoading ? (
                <p className="text-slate-400 font-bold">Menyiapkan album acara... ⏳</p>
              ) : dataDocs.length === 0 ? (
                <p className="text-slate-400 font-bold">Belum ada dokumentasi acara nih bre. Coba tambahin satu!</p>
              ) : (
                /* WRAPPER GRID BUAT KARTU ALBUMNYA */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {dataDocs.map((acara) => (
                    <GaleriDrive key={acara.id} acara={acara} session={session} />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      <ModalTambahCreative isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setDataToEdit(null); }} dataToEdit={dataToEdit} />
    </main>
  );
}