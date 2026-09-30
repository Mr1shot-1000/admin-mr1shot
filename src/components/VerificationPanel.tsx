import { useState, useEffect, useCallback } from 'react';
import {
  BadgeCheck, ShieldCheck, ShieldX, Hash, User, RefreshCw, XCircle, AlertTriangle, X,
} from 'lucide-react';
import { patchUserData, fetchAllUserDatas } from '@/lib/firebase';
import type { ToastAlert } from '@/types';

interface VerificationPanelProps {
  addToast: (type: ToastAlert['type'], message: string) => void;
}

interface VerifiedUser {
  uid: string;
  name: string;
}

export default function VerificationPanel({ addToast }: VerificationPanelProps) {
  const [uid, setUid] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [verifiedUsers, setVerifiedUsers] = useState<VerifiedUser[]>([]);
  const [unverifyTarget, setUnverifyTarget] = useState<VerifiedUser | null>(null);
  const [unverifyLoading, setUnverifyLoading] = useState(false);

  const loadVerifiedUsers = useCallback(async () => {
    setListLoading(true);
    try {
      const data = await fetchAllUserDatas();
      if (!data) {
        setVerifiedUsers([]);
        return;
      }
      const users: VerifiedUser[] = [];
      for (const [key, value] of Object.entries(data)) {
        if (value && value.v === 'Ⓜ︎') {
          users.push({ uid: key, name: value.name || 'بدون اسم' });
        }
      }
      setVerifiedUsers(users);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      addToast('error', msg);
    } finally {
      setListLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadVerifiedUsers();
  }, [loadVerifiedUsers]);

  const handleVerify = async () => {
    if (!uid.trim()) { addToast('error', 'الرجاء إدخال UID المستخدم'); return; }
    setActionLoading(true);
    try {
      await patchUserData(uid.trim(), { v: 'Ⓜ︎', img: 'https://googleapis.com' });
      addToast('success', 'تم توثيق الحساب بنجاح');
      setUid('');
      loadVerifiedUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      addToast('error', msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnverify = async () => {
    if (!uid.trim()) { addToast('error', 'الرجاء إدخال UID المستخدم'); return; }
    setActionLoading(true);
    try {
      await patchUserData(uid.trim(), { v: '' });
      addToast('success', 'تم إزالة التوثيق بنجاح');
      setUid('');
      loadVerifiedUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      addToast('error', msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRowUnverify = (user: VerifiedUser) => {
    setUnverifyTarget(user);
  };

  const handleConfirmUnverify = async () => {
    if (!unverifyTarget) return;
    setUnverifyLoading(true);
    try {
      await patchUserData(unverifyTarget.uid, { v: '' });
      setVerifiedUsers((prev) => prev.filter((u) => u.uid !== unverifyTarget.uid));
      addToast('success', 'تم إلغاء التوثيق');
      setUnverifyTarget(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      addToast('error', msg);
    } finally {
      setUnverifyLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Manual Verification Section */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-blue-800/20 shadow-xl p-5 animate-slide-up">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          <h2 className="text-white font-bold text-sm">توثيق / إزالة توثيق</h2>
        </div>

        <div className="relative mb-4">
          <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400/60" />
          <input
            type="text"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            placeholder="معرف المستخدم (UID)"
            className="w-full bg-slate-800/60 border border-blue-800/30 text-white rounded-xl pr-11 pl-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500 font-mono"
            dir="ltr"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleVerify}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {actionLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <BadgeCheck className="w-5 h-5" />}
            توثيق الحساب
          </button>
          <button
            onClick={handleUnverify}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-red-600/20 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {actionLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldX className="w-5 h-5" />}
            إزالة التوثيق
          </button>
        </div>
      </div>

      {/* Verified Users List */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-blue-800/20 shadow-xl animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-blue-800/20">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            <h2 className="text-white font-bold text-sm">الحسابات الموثقة</h2>
            <span className="bg-cyan-600/20 text-cyan-300 text-xs font-semibold px-2 py-0.5 rounded-full">
              {verifiedUsers.length}
            </span>
          </div>
          <button
            onClick={loadVerifiedUsers}
            disabled={listLoading}
            className="flex items-center gap-1.5 text-blue-400/70 hover:text-blue-400 text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${listLoading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-3 space-y-2">
          {listLoading && verifiedUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-blue-400/40 text-sm">جاري التحميل...</p>
            </div>
          ) : verifiedUsers.length === 0 ? (
            <div className="text-center py-12 text-blue-400/30 text-sm">
              <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
              لا توجد حسابات موثقة
            </div>
          ) : (
            verifiedUsers.map((user) => (
              <div
                key={user.uid}
                className="flex items-center gap-3 bg-slate-800/40 rounded-xl p-3 border border-blue-800/20 animate-fade-in"
              >
                {/* Avatar */}
                <div className="inline-flex items-center justify-center w-11 h-11 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full shrink-0 shadow-lg shadow-blue-600/20">
                  <span className="text-white font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-white text-sm font-bold truncate">{user.name}</p>
                    <BadgeCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  </div>
                  <p className="text-blue-400/50 text-[11px] font-mono truncate">{user.uid}</p>
                </div>

                {/* Unverify button */}
                <button
                  onClick={() => handleRowUnverify(user)}
                  className="flex items-center gap-1 bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/30 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  <XCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">إلغاء التوثيق</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Unverify Confirmation Dialog */}
      {unverifyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 rounded-2xl border border-red-800/30 shadow-2xl p-6 max-w-sm w-full animate-slide-up">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-red-950/60 rounded-full mb-3">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="text-white font-bold text-base mb-1">هل أنت متأكد من إلغاء توثيق هذا الحساب؟</h3>
              <div className="mt-3 flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full shrink-0">
                  <span className="text-white font-bold text-xs">{unverifyTarget.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-bold truncate max-w-[180px]">{unverifyTarget.name}</p>
                  <p className="text-blue-400/50 text-[10px] font-mono truncate max-w-[180px]">{unverifyTarget.uid}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmUnverify}
                disabled={unverifyLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold rounded-xl py-3 text-sm transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {unverifyLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldX className="w-5 h-5" />}
                تأكيد
              </button>
              <button
                onClick={() => setUnverifyTarget(null)}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-800/60 hover:bg-slate-700/60 border border-blue-800/30 text-slate-300 font-bold rounded-xl py-3 text-sm transition-all"
              >
                <X className="w-5 h-5" />
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
