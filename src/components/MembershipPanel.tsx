import { useState } from 'react';
import {
  Crown, Gem, Sparkles, Hash, Coins, Zap, CheckCircle2, Calendar, Clock, Gift,
} from 'lucide-react';
import { patchMembership, patchPremiumMembership, patchMembershipSettings } from '@/lib/firebase';
import type { ToastAlert } from '@/types';

interface MembershipPanelProps {
  addToast: (type: ToastAlert['type'], message: string) => void;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default function MembershipPanel({ addToast }: MembershipPanelProps) {
  const [uidRegular, setUidRegular] = useState('');
  const [rewardRegular, setRewardRegular] = useState('');
  const [loadingRegular, setLoadingRegular] = useState(false);

  const [uidPremium, setUidPremium] = useState('');
  const [rewardPremium, setRewardPremium] = useState('');
  const [loadingPremium, setLoadingPremium] = useState(false);

  const handleChargeRegular = async () => {
    if (!uidRegular.trim()) { addToast('error', 'الرجاء إدخال UID المستخدم'); return; }
    const reward = parseInt(rewardRegular, 10);
    if (isNaN(reward) || reward <= 0) { addToast('error', 'الرجاء إدخال عدد كوينز صحيح'); return; }

    setLoadingRegular(true);
    try {
      const now = Date.now();
      const expiry = now + SEVEN_DAYS_MS;

      await patchMembership(uidRegular.trim(), {
        active_until: expiry,
        start_date: now,
        claimed_days: 0,
        last_claim: 0,
      });

      await patchMembershipSettings({ weekly_reward: reward });

      addToast('success', `تم شحن العضوية الأسبوعية لـ ${uidRegular.trim().slice(0, 12)}... بنجاح`);
      setUidRegular('');
      setRewardRegular('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      addToast('error', msg);
    } finally {
      setLoadingRegular(false);
    }
  };

  const handleChargePremium = async () => {
    if (!uidPremium.trim()) { addToast('error', 'الرجاء إدخال UID المستخدم'); return; }
    const reward = parseInt(rewardPremium, 10);
    if (isNaN(reward) || reward <= 0) { addToast('error', 'الرجاء إدخال عدد كوينز مميز صحيح'); return; }

    setLoadingPremium(true);
    try {
      const now = Date.now();
      const expiry = now + SEVEN_DAYS_MS;

      await patchPremiumMembership(uidPremium.trim(), {
        active_until: expiry,
        start_date: now,
        claimed_days: 0,
        last_claim: 0,
      });

      await patchMembershipSettings({ premium_reward: reward });

      addToast('success', `تم شحن العضوية المميزة لـ ${uidPremium.trim().slice(0, 12)}... بنجاح`);
      setUidPremium('');
      setRewardPremium('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      addToast('error', msg);
    } finally {
      setLoadingPremium(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Card */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-blue-800/20 shadow-xl p-5 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-600 to-yellow-500 rounded-xl shadow-lg shadow-amber-600/30">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base sm:text-lg">شحن العضويات الأسبوعية</h2>
            <p className="text-blue-400/50 text-xs">تفعيل العضوية الأسبوعية العادية والمميزة</p>
          </div>
        </div>
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUMN 1: Regular Weekly Membership */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-green-800/30 shadow-xl p-5 animate-slide-up">
          {/* Card Header */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-green-800/20">
            <div className="inline-flex items-center justify-center w-11 h-11 bg-gradient-to-br from-green-600 to-emerald-500 rounded-xl shadow-lg shadow-green-600/20">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">العضوية الأسبوعية العادية</h3>
              <p className="text-green-400/50 text-xs">Weekly Membership</p>
            </div>
          </div>

          {/* UID Input */}
          <div className="mb-4">
            <label className="block text-green-200/80 text-sm font-semibold mb-2">معرف المستخدم (UID)</label>
            <div className="relative">
              <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400/60" />
              <input
                type="text"
                value={uidRegular}
                onChange={(e) => setUidRegular(e.target.value)}
                placeholder="Firebase Auth UID"
                className="w-full bg-slate-800/60 border border-green-800/30 text-white rounded-xl pr-11 pl-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all placeholder:text-slate-500 font-mono"
                dir="ltr"
              />
            </div>
          </div>

          {/* Reward Input */}
          <div className="mb-5">
            <label className="block text-green-200/80 text-sm font-semibold mb-2">عدد الكوينز اليومية (Number coins in Day)</label>
            <div className="relative">
              <Coins className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400/60" />
              <input
                type="number"
                value={rewardRegular}
                onChange={(e) => setRewardRegular(e.target.value)}
                placeholder="مثال: 100"
                className="w-full bg-slate-800/60 border border-green-800/30 text-white rounded-xl pr-11 pl-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all placeholder:text-slate-500 text-lg font-bold"
                dir="ltr"
              />
            </div>
          </div>

          {/* Info badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            <div className="flex items-center gap-1.5 text-[11px] text-green-300/70 bg-green-950/30 rounded-lg px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5" />
              7 أيام
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-green-300/70 bg-green-950/30 rounded-lg px-2.5 py-1.5">
              <Clock className="w-3.5 h-3.5" />
              يبدأ فوراً
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleChargeRegular}
            disabled={loadingRegular}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-bold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-green-600/20 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loadingRegular ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            شحن العضوية الأسبوعية (CHARGE)
          </button>
        </div>

        {/* COLUMN 2: Premium Weekly Membership */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-cyan-700/30 shadow-xl p-5 animate-slide-up relative overflow-hidden">
          {/* Premium glow accent */}
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Card Header */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-cyan-700/20 relative">
            <div className="inline-flex items-center justify-center w-11 h-11 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-600/20 glow-btn">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">العضوية الأسبوعية المميزة (PREMIUM)</h3>
              <p className="text-cyan-400/50 text-xs">Weekly Premium Membership</p>
            </div>
          </div>

          {/* UID Input */}
          <div className="mb-4 relative">
            <label className="block text-cyan-200/80 text-sm font-semibold mb-2">معرف المستخدم (UID)</label>
            <div className="relative">
              <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/60" />
              <input
                type="text"
                value={uidPremium}
                onChange={(e) => setUidPremium(e.target.value)}
                placeholder="Firebase Auth UID"
                className="w-full bg-slate-800/60 border border-cyan-700/30 text-white rounded-xl pr-11 pl-4 py-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder:text-slate-500 font-mono"
                dir="ltr"
              />
            </div>
          </div>

          {/* Reward Input */}
          <div className="mb-5 relative">
            <label className="block text-cyan-200/80 text-sm font-semibold mb-2">عدد الكوينز اليومية المميزة (Number coins in Day)</label>
            <div className="relative">
              <Gem className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/60" />
              <input
                type="number"
                value={rewardPremium}
                onChange={(e) => setRewardPremium(e.target.value)}
                placeholder="مثال: 500"
                className="w-full bg-slate-800/60 border border-cyan-700/30 text-white rounded-xl pr-11 pl-4 py-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder:text-slate-500 text-lg font-bold"
                dir="ltr"
              />
            </div>
          </div>

          {/* Info badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            <div className="flex items-center gap-1.5 text-[11px] text-cyan-300/70 bg-cyan-950/30 rounded-lg px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5" />
              7 أيام
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-cyan-300/70 bg-cyan-950/30 rounded-lg px-2.5 py-1.5">
              <Clock className="w-3.5 h-3.5" />
              يبدأ فوراً
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-cyan-300/70 bg-cyan-950/30 rounded-lg px-2.5 py-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              مميز
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleChargePremium}
            disabled={loadingPremium}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-cyan-600/30 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 glow-btn"
          >
            {loadingPremium ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Zap className="w-5 h-5" />
            )}
            شحن العضوية المميزة (CHARGE PREM)
          </button>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-blue-800/20 shadow-xl p-4 animate-slide-up">
        <div className="flex items-start gap-2">
          <Gift className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-blue-300/60 text-xs leading-relaxed">
            العضوية الأسبوعية تفعّل لمدة 7 أيام من تاريخ الشحن. يتم حساب وقت الانتهاء بالميلي ثانية. تحدّث العضوية العادية في المسار membership/&#123;uid&#125; والمميزة في membership/&#123;uid&#125;/weekly_premium. يتم تحديث المكافأة اليومية في membership/Settings.
          </p>
        </div>
      </div>
    </div>
  );
}
