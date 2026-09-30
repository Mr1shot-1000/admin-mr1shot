import { CheckCircle2, XCircle, Info } from 'lucide-react';
import type { ToastAlert } from '@/types';
import Sidebar, { type PanelKey } from '@/components/Sidebar';

interface LayoutProps {
  activePanel: PanelKey;
  onNavigate: (key: PanelKey) => void;
  onLogout: () => void;
  toasts: ToastAlert[];
  removeToast: (id: string) => void;
  children: React.ReactNode;
}

export default function Layout({
  activePanel,
  onNavigate,
  onLogout,
  toasts,
  removeToast,
  children,
}: LayoutProps) {
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      <Sidebar active={activePanel} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Toasts */}
      <div className="fixed top-4 left-4 z-50 space-y-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-toast-in rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 text-sm font-semibold border backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-green-950/80 border-green-700/40 text-green-300'
                : toast.type === 'error'
                ? 'bg-red-950/80 border-red-700/40 text-red-300'
                : 'bg-blue-950/80 border-blue-700/40 text-blue-300'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : toast.type === 'error' ? <XCircle className="w-5 h-5 shrink-0" /> : <Info className="w-5 h-5 shrink-0" />}
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100 transition-opacity shrink-0">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Main content — offset for sidebar on desktop */}
      <main className="relative lg:mr-72 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-6 pt-16 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
