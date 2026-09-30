import { ScrollText, Trash2, ArrowLeftRight, TrendingUp, TrendingDown, Pencil, Eye, CheckCircle2, XCircle } from 'lucide-react';
import type { LogEntry } from '@/types';

interface SessionLogProps {
  entries: LogEntry[];
  onClear: () => void;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  'عرض الرصيد': <Eye className="w-4 h-4 text-cyan-400" />,
  'عرض الجواهر': <Eye className="w-4 h-4 text-cyan-400" />,
  'إضافة عملات': <TrendingUp className="w-4 h-4 text-green-400" />,
  'إضافة جواهر': <TrendingUp className="w-4 h-4 text-green-400" />,
  'خصم عملات': <TrendingDown className="w-4 h-4 text-red-400" />,
  'خصم جواهر': <TrendingDown className="w-4 h-4 text-red-400" />,
  'تعيين رصيد': <Pencil className="w-4 h-4 text-amber-400" />,
  'تعيين جواهر': <Pencil className="w-4 h-4 text-amber-400" />,
};

export default function SessionLog({ entries, onClear }: SessionLogProps) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-blue-800/20 shadow-xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-blue-800/20">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-blue-400" />
          <h2 className="text-white font-bold text-sm">سجل العمليات</h2>
          <span className="bg-blue-600/20 text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full">
            {entries.length}
          </span>
        </div>
        {entries.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-red-400/70 hover:text-red-400 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            مسح
          </button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto p-3 space-y-2">
        {entries.length === 0 ? (
          <div className="text-center py-12 text-blue-400/30 text-sm">
            <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            لا توجد عمليات بعد
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className={`bg-slate-800/40 rounded-xl p-3 border ${entry.status === 'error' ? 'border-red-800/30' : 'border-blue-800/20'} animate-fade-in`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {ACTION_ICONS[entry.action] || <ArrowLeftRight className="w-4 h-4 text-blue-400" />}
                  <span className="text-white text-xs font-bold">{entry.action}</span>
                </div>
                <div className="flex items-center gap-1 text-blue-400/50 text-[10px]">
                  {entry.status === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                  )}
                  {entry.timestamp}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-900/40 rounded-lg px-2 py-1.5">
                  <span className="text-blue-400/50">المستخدم: </span>
                  <span className="text-cyan-300 font-mono break-all">{entry.uid}</span>
                </div>
                <div className="bg-slate-900/40 rounded-lg px-2 py-1.5">
                  <span className="text-blue-400/50">المبلغ: </span>
                  <span className="text-amber-300 font-bold">{entry.amount}</span>
                </div>
                {entry.status === 'success' && entry.oldBalance !== '-' && (
                  <div className="bg-slate-900/40 rounded-lg px-2 py-1.5 col-span-2">
                    <span className="text-blue-400/50">الرصيد: </span>
                    <span className="text-red-300 font-bold">{entry.oldBalance}</span>
                    <span className="text-blue-400/50 mx-1">←</span>
                    <span className="text-green-300 font-bold">{entry.newBalance}</span>
                  </div>
                )}
                {entry.message && (
                  <div className="col-span-2 text-red-300/80 text-[11px] px-2">{entry.message}</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
