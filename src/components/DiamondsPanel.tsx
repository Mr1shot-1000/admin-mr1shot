import { useState, useCallback } from 'react';
import {
  Gem, Eye, PlusCircle, MinusCircle, Target, Zap, Hash, User, Wallet, AlertCircle,
} from 'lucide-react';
import { fetchDiamond, putDiamond } from '@/lib/firebase';
import type { LogEntry, ToastAlert } from '@/types';
import SessionLog from '@/components/SessionLog';

interface DiamondsPanelProps {
  addToast: (type: ToastAlert['type'], message: string) => void;
}

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

export default function DiamondsPanel({ addToast }: DiamondsPanelProps) {
  const [uid, setUid] = useState('');
  const [amount, setAmount] = useState('');
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const full: LogEntry = {
      ...entry,
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setLogs((prev) => [full, ...prev]);
  }, []);

  const handleFetchBalance = async () => {
    if (!uid.trim()) {
      addToast('error', 'الرجاء إدخال UID المستخدم');
      return;
    }
    setBalanceLoading(true);
    try {
      const raw = await fetchDiamond(uid.trim());
      const num = parseInt(raw, 10) || 0;
      setCurrentBalance(num);
      addLog({
        uid: uid.trim(),
        action: 'عرض الجواهر',
        amount: '-',
        oldBalance: '-',
        newBalance: raw,
        status: 'success',
      });
      addToast('success', `رصيد الجواهر الحالي: ${num} جوهرة`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      addLog({
        uid: uid.trim(),
        action: 'عرض الجواهر',
        amount: '-',
        oldBalance: '-',
        newBalance: '-',
        status: 'error',
        message: msg,
      });
      addToast('error', msg);
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleAddGems = async () => {
    if (!uid.trim()) { addToast('error', 'الرجاء إدخال UID المستخدم'); return; }
    const amt = parseInt(amount, 10);
    if (isNaN(amt) || amt <= 0) { addToast('error', 'الرجاء إدخال مبلغ صحيح'); return; }
    setActionLoading(true);
    try {
      const raw = await fetchDiamond(uid.trim());
      const oldBal = parseInt(raw, 10) || 0;
      const newBal = oldBal + amt;
      await putDiamond(uid.trim(), String(newBal));
      setCurrentBalance(newBal);
      addLog({
        uid: uid.trim(),
        action: 'إضافة جواهر',
        amount: String(amt),
        oldBalance: String(oldBal),
        newBalance: String(newBal),
        status: 'success',
      });
      addToast('success', `تمت إضافة ${amt} جوهرة. الرصيد الجديد: ${newBal}`);
      setAmount('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      addLog({
        uid: uid.trim(),
        action: 'إضافة جواهر',
        amount: String(amt),
        oldBalance: '-',
        newBalance: '-',
        status: 'error',
        message: msg,
      });
      addToast('error', msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubtractGems = async () => {
    if (!uid.trim()) { addToast('error', 'الرجاء إدخال UID المستخدم'); return; }
    const amt = parseInt(amount, 10);
    if (isNaN(amt) || amt <= 0) { addToast('error', 'الرجاء إدخال مبلغ صحيح'); return; }
    setActionLoading(true);
    try {
      const raw = await fetchDiamond(uid.trim());
      const oldBal = parseInt(raw, 10) || 0;
      if (oldBal < amt) {
        addLog({
          uid: uid.trim(),
          action: 'خصم جواهر',
          amount: String(amt),
          oldBalance: String(oldBal),
          newBalance: '-',
          status: 'error',
          message: 'الرصيد غير كافٍ للخصم',
        });
        addToast('error', `الرصيد غير كافٍ. رصيد الجواهر: ${oldBal} جوهرة فقط`);
        return;
      }
      const newBal = oldBal - amt;
      await putDiamond(uid.trim(), String(newBal));
      setCurrentBalance(newBal);
      addLog({
        uid: uid.trim(),
        action: 'خصم جواهر',
        amount: String(amt),
        oldBalance: String(oldBal),
        newBalance: String(newBal),
        status: 'success',
      });
      addToast('success', `تم خصم ${amt} جوهرة. الرصيد الجديد: ${newBal}`);
      setAmount('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      addLog({
        uid: uid.trim(),
        action: 'خصم جواهر',
        amount: String(amt),
        oldBalance: '-',
        newBalance: '-',
        status: 'error',
        message: msg,
      });
      addToast('error', msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetBalance = async () => {
    if (!uid.trim()) { addToast('error', 'الرجاء إدخال UID المستخدم'); return; }
    const amt = parseInt(amount, 10);
    if (isNaN(amt) || amt < 0) { addToast('error', 'الرجاء إدخال مبلغ صحيح'); return; }
    setActionLoading(true);
    try {
      const raw = await fetchDiamond(uid.trim());
      const oldBal = parseInt(raw, 10) || 0;
      await putDiamond(uid.trim(), String(amt));
      setCurrentBalance(amt);
      addLog({
        uid: uid.trim(),
        action: 'تعيين جواهر',
        amount: String(amt),
        oldBalance: String(oldBal),
        newBalance: String(amt),
        status: 'success',
      });
      addToast('success', `تم تعيين رصيد الجواهر إلى ${amt}`);
      setAmount('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      addLog({
        uid: uid.trim(),
        action: 'تعيين جواهر',
        amount: String(amt),
        oldBalance: '-',
        newBalance: '-',
        status: 'error',
        message: msg,
      });
      addToast('error', msg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* UID Input + Balance Display */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-blue-800/20 shadow-xl p-5 animate-slide-up">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-cyan-400" />
          <h2 className="text-white font-bold text-sm">تحديد المستخدم</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/60" />
            <input
              type="text"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="أدخل UID المستخدم (Firebase Auth UID)"
              className="w-full bg-slate-800/60 border border-blue-800/30 text-white rounded-xl pr-11 pl-4 py-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder:text-slate-500 font-mono"
              dir="ltr"
            />
          </div>
          <button
            onClick={handleFetchBalance}
            disabled={balanceLoading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 text-white font-bold rounded-xl px-5 py-3 text-sm transition-all shadow-lg shadow-cyan-600/30 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 whitespace-nowrap"
          >
            {balanceLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
            عرض رصيد الجواهر الحالي
          </button>
        </div>

        {/* Balance Display */}
        {currentBalance !== null && (
          <div className="mt-4 bg-gradient-to-l from-cyan-950/60 to-slate-800/40 rounded-xl border border-cyan-700/30 p-4 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-600/20 rounded-xl">
                <Wallet className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-cyan-300/60 text-xs">رصيد الجواهر الحالي</p>
                <p className="text-white font-bold text-2xl">{currentBalance.toLocaleString('en-US')}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold bg-cyan-950/40 px-3 py-1.5 rounded-lg">
              <Gem className="w-4 h-4" />
              جوهرة
            </div>
          </div>
        )}
      </div>

      {/* Amount Input + Quick Chips */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-blue-800/20 shadow-xl p-5 animate-slide-up">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-cyan-400" />
          <h2 className="text-white font-bold text-sm">إدارة الجواهر</h2>
        </div>

        {/* Amount Input */}
        <div className="relative mb-4">
          <Gem className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/60" />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="أدخل المبلغ"
            className="w-full bg-slate-800/60 border border-blue-800/30 text-white rounded-xl pr-11 pl-4 py-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder:text-slate-500 text-lg font-bold"
            dir="ltr"
          />
        </div>

        {/* Quick Chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              onClick={() => setAmount(String(q))}
              className="bg-slate-800/60 hover:bg-cyan-600/20 border border-blue-800/30 hover:border-cyan-500/50 text-cyan-200 hover:text-cyan-100 rounded-full px-4 py-2 text-sm font-bold transition-all hover:scale-105 active:scale-95"
            >
              +{q.toLocaleString('en-US')}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleAddGems}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-bold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-green-600/20 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {actionLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <PlusCircle className="w-5 h-5" />}
            إضافة جواهر
          </button>
          <button
            onClick={handleSubtractGems}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-red-600/20 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {actionLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MinusCircle className="w-5 h-5" />}
            خصم جواهر
          </button>
          <button
            onClick={handleSetBalance}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-bold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-amber-600/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {actionLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Target className="w-5 h-5" />}
            تعيين رصيد محدد
          </button>
        </div>

        {/* Warning */}
        <div className="mt-4 flex items-start gap-2 bg-amber-950/30 border border-amber-800/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-300/70 text-xs leading-relaxed">
            سيتم خصم الجواهر من الرصيد الحالي. إذا كان الرصيد غير كافٍ سيتم رفض العملية. يتم حفظ القيمة كنص في قاعدة البيانات.
          </p>
        </div>
      </div>

      {/* Session Log */}
      <SessionLog entries={logs} onClear={() => setLogs([])} />
    </div>
  );
}
