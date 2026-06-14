'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModalProps = { isOpen: boolean; onClose: () => void; dataToEdit?: any; };

export default function ModalTambahCreative({ isOpen, onClose, dataToEdit }: ModalProps) {
  const [step, setStep] = useState(1);
  const [jenisForm, setJenisForm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileAset, setFileAset] = useState<File | null>(null);

  const [formDataAset, setFormDataAset] = useState({ nama_aset: '', kategori: 'Template', caption: '' });
  const [formDataKonten, setFormDataKonten] = useState({ judul_konten: '', platform: 'Instagram', pic: '', tgl_take: '', tgl_tayang: '', status: 'IDEATION' });
  const [formDataDocs, setFormDataDocs] = useState({ nama_acara: '', tgl_acara: '', drive_link: '' }); // STATE BARU DOKUMENTASI

  useEffect(() => {
    if (dataToEdit) {
      if (dataToEdit.nama_aset !== undefined) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setJenisForm('aset');
        setFormDataAset({ nama_aset: dataToEdit.nama_aset, kategori: dataToEdit.kategori, caption: dataToEdit.caption || '' });
      } else if (dataToEdit.judul_konten !== undefined) {
        setJenisForm('konten');
        setFormDataKonten({
          judul_konten: dataToEdit.judul_konten, platform: dataToEdit.platform, pic: dataToEdit.pic,
          tgl_take: dataToEdit.tgl_take.split('T')[0], tgl_tayang: dataToEdit.tgl_tayang.split('T')[0], status: dataToEdit.status
        });
      }
      setStep(2);
    }
  }, [dataToEdit]);

  if (!isOpen) return null;

  const resetDanTutup = () => { setStep(1); setJenisForm(''); setFileAset(null); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let finalPayload: any = {};
      let endpoint = '';
      const method = dataToEdit ? 'PUT' : 'POST';

      if (jenisForm === 'aset') {
        endpoint = '/api/creative/aset';
        let currentLink = dataToEdit?.link_file;
        if (fileAset) {
          const fileName = `${Date.now()}-${fileAset.name}`;
          await supabase.storage.from('creative-assets').upload(`aset/${fileName}`, fileAset);
          const { data: urlData } = supabase.storage.from('creative-assets').getPublicUrl(`aset/${fileName}`);
          currentLink = urlData.publicUrl;
        }
        finalPayload = { ...formDataAset, link_file: currentLink, id: dataToEdit?.id };
      } else if (jenisForm === 'konten') {
        endpoint = '/api/creative/konten';
        finalPayload = { ...formDataKonten, id: dataToEdit?.id };
      } else if (jenisForm === 'docs') {
        endpoint = '/api/creative/dokumentasi';
        finalPayload = { ...formDataDocs };
      }

      const res = await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(finalPayload) });
      if (res.ok) {
        alert(dataToEdit ? 'Data diupdate! ✏️' : 'Berhasil ditambah! 🚀');
        resetDanTutup();
        window.location.reload();
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert('Gagal memproses data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0">
          <h3 className="font-black text-slate-800">{dataToEdit ? 'Edit Data' : 'Tambah Data'}</h3>
          <button onClick={resetDanTutup} className="text-slate-400 font-bold hover:text-red-500">Tutup ✖</button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="grid gap-3">
              <button onClick={() => { setJenisForm('aset'); setStep(2); }} className="p-4 border-2 rounded-2xl text-left font-bold hover:border-purple-500 hover:bg-purple-50 transition-colors">🎨 Aset Desain</button>
              <button onClick={() => { setJenisForm('konten'); setStep(2); }} className="p-4 border-2 rounded-2xl text-left font-bold hover:border-pink-500 hover:bg-pink-50 transition-colors">📅 Jadwal Konten</button>
              <button onClick={() => { setJenisForm('docs'); setStep(2); }} className="p-4 border-2 rounded-2xl text-left font-bold hover:border-blue-500 hover:bg-blue-50 transition-colors">📸 Dokumentasi Acara</button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {jenisForm === 'aset' && (
                <>
                  <input required value={formDataAset.nama_aset} onChange={(e) => setFormDataAset({...formDataAset, nama_aset: e.target.value})} placeholder="Nama Aset" className="w-full border p-3 rounded-xl" />
                  <select value={formDataAset.kategori} onChange={(e) => setFormDataAset({...formDataAset, kategori: e.target.value})} className="w-full border p-3 rounded-xl">
                    <option value="Logo">Logo</option><option value="Template">Template</option><option value="Feeds">Feeds IG</option>
                  </select>
                  <label className="block text-xs font-bold text-slate-400">Ganti File (Kosongkan jika tidak diubah)</label>
                  <input type="file" onChange={(e) => setFileAset(e.target.files?.[0] || null)} className="w-full border p-2 rounded-xl text-sm" />
                </>
              )}
              {jenisForm === 'konten' && (
                <>
                  <input required value={formDataKonten.judul_konten} onChange={(e) => setFormDataKonten({...formDataKonten, judul_konten: e.target.value})} placeholder="Judul Konten" className="w-full border p-3 rounded-xl" />
                  <div className="grid grid-cols-2 gap-4">
                    <select value={formDataKonten.platform} onChange={(e) => setFormDataKonten({...formDataKonten, platform: e.target.value})} className="w-full border p-3 rounded-xl"><option value="Instagram">Instagram</option><option value="TikTok">TikTok</option></select>
                    <select value={formDataKonten.status} onChange={(e) => setFormDataKonten({...formDataKonten, status: e.target.value})} className="w-full border p-3 rounded-xl bg-purple-50 font-bold"><option value="IDEATION">IDEATION</option><option value="EDITING">EDITING</option><option value="READY">READY</option></select>
                  </div>
                  <input required value={formDataKonten.pic} onChange={(e) => setFormDataKonten({...formDataKonten, pic: e.target.value})} placeholder="PIC" className="w-full border p-3 rounded-xl" />
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="date" value={formDataKonten.tgl_take} onChange={(e) => setFormDataKonten({...formDataKonten, tgl_take: e.target.value})} className="border p-3 rounded-xl" />
                    <input required type="date" value={formDataKonten.tgl_tayang} onChange={(e) => setFormDataKonten({...formDataKonten, tgl_tayang: e.target.value})} className="border p-3 rounded-xl" />
                  </div>
                </>
              )}
              {jenisForm === 'docs' && (
                <>
                  <input required value={formDataDocs.nama_acara} onChange={(e) => setFormDataDocs({...formDataDocs, nama_acara: e.target.value})} placeholder="Nama Acara (Contoh: Lomba 17an)" className="w-full border p-3 rounded-xl" />
                  <label className="block text-xs font-bold text-slate-400">Tanggal Acara</label>
                  <input required type="date" value={formDataDocs.tgl_acara} onChange={(e) => setFormDataDocs({...formDataDocs, tgl_acara: e.target.value})} className="w-full border p-3 rounded-xl" />
                  <label className="block text-xs font-bold text-slate-400">Link Folder Google Drive (Wajib mode Public)</label>
                  <input required type="url" value={formDataDocs.drive_link} onChange={(e) => setFormDataDocs({...formDataDocs, drive_link: e.target.value})} placeholder="https://drive.google.com/drive/folders/..." className="w-full border p-3 rounded-xl" />
                </>
              )}
              <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white p-3 rounded-xl font-bold hover:bg-purple-600 transition-colors">
                {isLoading ? 'Memproses...' : dataToEdit ? 'Update Data' : 'Simpan Data'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}