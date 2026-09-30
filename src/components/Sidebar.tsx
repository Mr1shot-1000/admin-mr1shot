import { Coins, Wrench, Gem, Crown, BadgeCheck, ShoppingCart, MessageSquare, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export type PanelKey = 'coins' | 'diamonds' | 'membership' | 'verification' | 'orders' | 'chat' | 'maintenance';

interface SidebarProps {
  active: PanelKey;
  onNavigate: (key: PanelKey) => void;
  onLogout: () => void;
}

const NAV_ITEMS: { key: PanelKey; label: string; icon: React.ReactNode; description: string }[] = [
  {
    key: 'coins',
    label: 'إدارة العملات',
    icon: <Coins className="w-5 h-5" />,
    description: 'شحن وخصم أرصدة المستخدمين',
  },
  {
    key: 'diamonds',
    label: 'شحن الجواهر',
    icon: <Gem className="w-5 h-5" />,
    description: 'إدارة أرصدة الجواهر',
  },
  {
    key: 'membership',
    label: 'العضويات الأسبوعية',
    icon: <Crown className="w-5 h-5" />,
    description: 'شحن العضويات العادية والمميزة',
  },
  {
    key: 'verification',
    label: 'توثيق الحسابات',
    icon: <BadgeCheck className="w-5 h-5" />,
    description: 'توثيق وإدارة الحسابات',
  },
  {
    key: 'orders',
    label: 'طلبات الشراء',
    icon: <ShoppingCart className="w-5 h-5" />,
    description: 'مراجعة ومعالجة الطلبات',
  },
  {
    key: 'chat',
    label: 'التحكم بالشات',
    icon: <MessageSquare className="w-5 h-5" />,
    description: 'إدارة الشات العام والحظر',
  },
  {
    key: 'maintenance',
    label: 'الصيانة والتحديثات',
    icon: <Wrench className="w-5 h-5" />,
    description: 'تحكم وضع الصيانة للنسخ',
  },
];

export default function Sidebar({ active, onNavigate, onLogout }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (key: PanelKey) => {
    onNavigate(key);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 bg-slate-900/80 backdrop-blur-xl border border-blue-800/30 text-white rounded-xl p-2.5 shadow-lg"
        aria-label="فتح القائمة"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-slate-900/80 backdrop-blur-xl border-l border-blue-800/20 z-50 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-blue-800/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-11 h-11 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl shadow-lg shadow-blue-600/30">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">لوحة التحكم</h1>
              <p className="text-blue-400/50 text-xs">نظام الإدارة</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-blue-400/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          <p className="text-blue-400/40 text-[11px] font-semibold px-3 mb-2">القوائم</p>
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNavigate(item.key)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-right transition-all group ${
                  isActive
                    ? 'bg-blue-600/20 border border-blue-500/40 shadow-lg shadow-blue-600/10'
                    : 'border border-transparent hover:bg-slate-800/50'
                }`}
              >
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-slate-800/60 text-blue-400/60 group-hover:text-blue-300'
                  }`}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} transition-colors`}>
                    {item.label}
                  </p>
                  <p className={`text-[11px] truncate ${isActive ? 'text-blue-300/60' : 'text-slate-500/60'}`}>
                    {item.description}
                  </p>
                </div>
                {isActive && (
                  <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-blue-800/20">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-right bg-red-950/40 hover:bg-red-900/50 border border-red-800/30 text-red-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-950/60">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">تسجيل الخروج</p>
              <p className="text-red-400/40 text-[11px]">إنهاء الجلسة الحالية</p>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
