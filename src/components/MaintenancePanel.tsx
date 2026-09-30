import { useState } from 'react';
import {
  Wrench, ShieldAlert, ToggleRight, ToggleLeft, Send, CheckSquare, Square, Info, CheckCircle2, XCircle, Layers,
} from 'lucide-react';
import { updateMaintenanceVersion } from '@/lib/firebase';
import type { ToastAlert } from '@/types';

interface MaintenancePanelProps {
  addToast: (type: ToastAlert['type'], message: string) => void;
}

const VERSIONS = [1, 2, 3, 4, 5, 6, 7];

export default function MaintenancePanel({ addToast }: MaintenancePanelProps) {
  const [selectedVersions, setSelectedVersions] = useState<number[]>([]);
  const [loginText, setLoginText] = useState('');
  const [signinText, setSigninText] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleVersion = (v: number) => {
    setSelectedVersions((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
    );
  };

  const selectAll = () => setSelectedVersions([...VERSIONS]);
  const deselectAll = () => setSelectedVersions([]);

  const handleAction = async (status: string, actionLabel: string) => {
    if (selectedVersions.length === 0) {
      addToast('error', 'الرجاء تحديد نسخة واحدة على الأقل');
      return;
    }
    setLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const v of selectedVersions) {
      try {
        await updateMaintenanceVersion(v, status, loginText, signinText, dialogMessage);
        successCount++;
      } catch {
        failCount++;
      }
    }

    if (failCount === 0) {
      addToast(
        'success',
        `${actionLabel} بنجاح لـ ${successCount} نسخة${successCount === 1 ? '' : 'ات'}`,
      );
    } else if (successCount === 0) {
      addToast('error', `فشل تحديث جميع النسخ (${failCount})`);
    } else {
      addToast(
        'error',
        `تم تحديث ${successCount} بنجاح وفشل ${failCount} نسخة`,
      );
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Card */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-blue-800/20 shadow-xl p-5 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-500 rounded-xl shadow-lg shadow-amber-600/30">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base sm:text-lg">لوحة التحكم بالصيانة والتحديثات</h2>
            <p className="text-blue-400/50 text-xs">إدارة وضع الصيانة لنسخ التطبيق</p>
          </div>
        </div>
      </div>

      {/* Version Selection */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-blue-800/20 shadow-xl p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-bold text-sm">اختيار النسخ</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="text-blue-300 hover:text-blue-200 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <CheckSquare className="w-4 h-4" />
              تحديد الكل
            </button>
            <button
              onClick={deselectAll}
              className="text-red-400/70 hover:text-red-400 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Square className="w-4 h-4" />
              إلغاء التحديد
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {VERSIONS.map((v) => {
            const selected = selectedVersions.includes(v);
            return (
              <button
                key={v}
                onClick={() => toggleVersion(v)}
                className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all hover:scale-[1.03] active:scale-[0.97] ${
                  selected
                    ? 'bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-600/20'
                    : 'bg-slate-800/40 border-blue-800/20 hover:border-blue-700/40'
                }`}
              >
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                    selected ? 'bg-blue-600/30' : 'bg-slate-700/40'
                  }`}
                >
                  {selected ? (
                    <CheckSquare className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <span className={`text-sm font-bold ${selected ? 'text-blue-200' : 'text-slate-400'}`}>
                  النسخة v{v}
                </span>
              </button>
            );
          })}
        </div>

        {selectedVersions.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-blue-300/70 bg-blue-950/30 rounded-lg px-3 py-2 animate-fade-in">
            <Info className="w-4 h-4 shrink-0" />
            <span>تم تحديد {selectedVersions.length} نسخة: {selectedVersions.map((v) => `v${v}`).join('، ')}</span>
          </div>
        )}
      </div>

      {/* Text Fields */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-blue-800/20 shadow-xl p-5 animate-slide-up">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h3 className="text-white font-bold text-sm">نصوص الصيانة والتنبيه</h3>
        </div>

        <div className="space-y-4">
          {/* Login maintenance text */}
          <div>
            <label className="block text-blue-200 text-sm font-semibold mb-2">
              نص صيانة تسجيل الدخول
            </label>
            <div className="relative">
              <input
                type="text"
                value={loginText}
                onChange={(e) => setLoginText(e.target.value)}
                placeholder="أدخل نص الصيانة لشاشة تسجيل الدخول"
                className="w-full bg-slate-800/60 border border-blue-800/30 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500"
                dir="rtl"
              />
            </div>
            <p className="text-blue-400/40 text-[11px] mt-1.5 mr-1 font-mono">text_mainte_login{selectedVersions.length === 1 ? selectedVersions[0] : 'N'}</p>
          </div>

          {/* Signin maintenance text */}
          <div>
            <label className="block text-blue-200 text-sm font-semibold mb-2">
              نص صيانة إنشاء الحساب
            </label>
            <div className="relative">
              <input
                type="text"
                value={signinText}
                onChange={(e) => setSigninText(e.target.value)}
                placeholder="أدخل نص الصيانة لشاشة إنشاء الحساب"
                className="w-full bg-slate-800/60 border border-blue-800/30 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500"
                dir="rtl"
              />
            </div>
            <p className="text-blue-400/40 text-[11px] mt-1.5 mr-1 font-mono">text_mainte_signin{selectedVersions.length === 1 ? selectedVersions[0] : 'N'}</p>
          </div>

          {/* Dialog message */}
          <div>
            <label className="block text-blue-200 text-sm font-semibold mb-2">
              رسالة التنبيه (Dialog)
            </label>
            <div className="relative">
              <textarea
                value={dialogMessage}
                onChange={(e) => setDialogMessage(e.target.value)}
                placeholder="أدخل رسالة التنبيه التي ستظهر للمستخدمين"
                rows={3}
                className="w-full bg-slate-800/60 border border-blue-800/30 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500 resize-none"
                dir="rtl"
              />
            </div>
            <p className="text-blue-400/40 text-[11px] mt-1.5 mr-1 font-mono">messag_dialog{selectedVersions.length === 1 ? selectedVersions[0] : 'N'}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-blue-800/20 shadow-xl p-5 animate-slide-up">
        <div className="flex items-center gap-2 mb-4">
          <Send className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-bold text-sm">تنفيذ الإجراء</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Activate maintenance — sends "off" */}
          <button
            onClick={() => handleAction('off', 'تم تفعيل وضع الصيانة')}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-red-600/20 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ToggleRight className="w-5 h-5" />
            )}
            تفعيل وضع الصيانة
          </button>

          {/* Deactivate maintenance — sends "on" */}
          <button
            onClick={() => handleAction('on', 'تم إيقاف وضع الصيانة')}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-bold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-green-600/20 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ToggleLeft className="w-5 h-5" />
            )}
            إيقاف وضع الصيانة
          </button>
        </div>

        {/* Info note */}
        <div className="mt-4 flex items-start gap-2 bg-blue-950/30 border border-blue-800/20 rounded-xl px-4 py-3">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-blue-300/70 text-xs leading-relaxed">
            «تفعيل وضع الصيانة» يرسل الحالة "off" لجميع النسخ المحددة. «إيقاف وضع الصيانة» يرسل الحالة "on". سيتم تحديث الحقول control، text_mainte_login، text_mainte_signin، messag_dialog لكل نسخة محددة.
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-green-300/70">
          <CheckCircle2 className="w-4 h-4" />
          on = التطبيق يعمل
        </div>
        <div className="flex items-center gap-1.5 text-red-300/70">
          <XCircle className="w-4 h-4" />
          off = وضع الصيانة
        </div>
      </div>
    </div>
  );
}
