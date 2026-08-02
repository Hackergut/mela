import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, UserPlus, Mail, Shield, User, X } from 'lucide-react';

const INP = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#FF6B35] focus:outline-none";

export default function TeamManager({ password }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invite, setInvite] = useState({ email: '', role: 'user' });
  const [inviting, setInviting] = useState(false);
  const [inviteOk, setInviteOk] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'user' });
      setUsers(res.data.items || []);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const sendInvite = async (e) => {
    e.preventDefault();
    setInviting(true); setInviteOk(null); setError(null);
    try {
      await base44.functions.invoke('admin-cms', { password, operation: 'invite_user', resource: 'user', payload: invite });
      setInviteOk(`Invito inviato a ${invite.email}`);
      setInvite({ email: '', role: 'user' });
      await load();
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setInviting(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <p className="text-sm text-[#6e6e73] mb-4">{users.length} membri del team</p>
        {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#FF6B35]" size={28} /></div> :
          error ? <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p> : (
            <div className="bg-white rounded-2xl overflow-hidden">
              {users.map((u, i) => (
                <div key={u.id} className={`flex items-center gap-3 p-4 ${i !== users.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.role === 'admin' ? 'bg-[#FF6B35]/10' : 'bg-gray-100'}`}>
                    {u.role === 'admin' ? <Shield size={18} className="text-[#FF6B35]" /> : <User size={18} className="text-[#6e6e73]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1d1d1f] truncate">{u.full_name || u.email}</p>
                    <p className="text-xs text-[#6e6e73] truncate">{u.email}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-[#FF6B35] text-white' : 'bg-gray-100 text-[#6e6e73]'}`}>
                    {u.role === 'admin' ? 'Admin' : 'Membro'}
                  </span>
                </div>
              ))}
            </div>
          )}
      </div>

      <div>
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus size={18} className="text-[#FF6B35]" />
            <h3 className="text-sm font-bold text-[#1d1d1f]">Invita membro</h3>
          </div>
          <form onSubmit={sendInvite} className="space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Email *</span>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input required type="email" value={invite.email} onChange={e => setInvite({ ...invite, email: e.target.value })} className={INP + ' pl-9'} placeholder="nome@email.com" />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Ruolo</span>
              <select value={invite.role} onChange={e => setInvite({ ...invite, role: e.target.value })} className={INP}>
                <option value="user">Membro</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 flex items-start gap-1"><X size={12} className="mt-0.5 flex-shrink-0" />{error}</p>}
            {inviteOk && <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">{inviteOk}</p>}
            <button type="submit" disabled={inviting} className="w-full py-3 bg-[#FF6B35] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {inviting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} Invita
            </button>
          </form>
          <p className="text-xs text-[#6e6e73] mt-3">Il membro riceverà un'email per registrarsi e accedere all'app.</p>
        </div>
      </div>
    </div>
  );
}