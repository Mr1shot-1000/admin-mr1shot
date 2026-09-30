import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShoppingCart, RefreshCw, Send, XCircle, Trash2, Hash, User, DollarSign,
  FileText, Calendar, Layers, AlertTriangle, X, Clock, CheckCircle2, Ban,
} from 'lucide-react';
import { fetchAllOrders, patchOrder, deleteOrder, type OrderData } from '@/lib/firebase';
import type { ToastAlert } from '@/types';

interface PurchaseRequestsPanelProps {
  addToast: (type: ToastAlert['type'], message: string) => void;
}

interface OrderItem {
  userUid: string;
  orderKey: string;
  data: OrderData;
}

type Category = 'pending' | 'success' | 'rejected';

function NeonStatusBadge({ condition }: { condition: string | undefined }) {
  if (condition === 'Success') {
    return (
      <span
        className="inline-flex items-center gap-1 bg-green-950/40 border border-[#76FF03]/40 text-[#76FF03] text-xs font-bold px-3 py-1 rounded-full neon-green-glow"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        Success
      </span>
    );
  }
  if (condition === 'Rejected') {
    return (
      <span
        className="inline-flex items-center gap-1 bg-red-950/40 border border-[#F44336]/40 text-[#F44336] text-xs font-bold px-3 py-1 rounded-full neon-red-glow"
      >
        <Ban className="w-3.5 h-3.5" />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-slate-800/60 border border-slate-600/40 text-slate-300 text-xs font-bold px-3 py-1 rounded-full">
      <Clock className="w-3.5 h-3.5" />
      بانتظار
    </span>
  );
}

export default function PurchaseRequestsPanel({ addToast }: PurchaseRequestsPanelProps) {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<OrderItem | null>(null);
  const [category, setCategory] = useState<Category>('pending');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllOrders();
      if (!data) {
        setOrders([]);
        return;
      }
      const items: OrderItem[] = [];
      const inputs: Record<string, string> = {};
      for (const [userUid, userOrders] of Object.entries(data)) {
        if (!userOrders || typeof userOrders !== 'object') continue;
        for (const [orderKey, orderData] of Object.entries(userOrders)) {
          if (!orderData || typeof orderData !== 'object') continue;
          const item = { userUid, orderKey, data: orderData };
          items.push(item);
          const key = `${userUid}/${orderKey}`;
          if (orderData.request) {
            inputs[key] = orderData.request;
          }
        }
      }
      setOrders(items);
      setInputValues(inputs);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      addToast('error', msg);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((item) => {
      const cond = item.data.condition;
      if (category === 'pending') return cond !== 'Success' && cond !== 'Rejected';
      if (category === 'success') return cond === 'Success';
      if (category === 'rejected') return cond === 'Rejected';
      return true;
    });
  }, [orders, category]);

  const categoryCounts = useMemo(() => ({
    pending: orders.filter((o) => o.data.condition !== 'Success' && o.data.condition !== 'Rejected').length,
    success: orders.filter((o) => o.data.condition === 'Success').length,
    rejected: orders.filter((o) => o.data.condition === 'Rejected').length,
  }), [orders]);

  const handleSend = async (item: OrderItem) => {
    const key = `${item.userUid}/${item.orderKey}`;
    const val = inputValues[key] || '';
    if (!val.trim()) { addToast('error', 'الرجاء إدخال كود/رابط الإرسال'); return; }
    setActionLoading(key);
    try {
      await patchOrder(item.userUid, item.orderKey, { request: val.trim(), condition: 'Success' });
      addToast('success', 'تم إرسال الطلب بنجاح');
      loadOrders();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      addToast('error', msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (item: OrderItem) => {
    const key = `${item.userUid}/${item.orderKey}`;
    setActionLoading(key);
    try {
      await patchOrder(item.userUid, item.orderKey, { condition: 'Rejected' });
      addToast('success', 'تم رفض الطلب');
      loadOrders();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      addToast('error', msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(`${deleteTarget.userUid}/${deleteTarget.orderKey}`);
    try {
      await deleteOrder(deleteTarget.userUid, deleteTarget.orderKey);
      addToast('success', 'تم حذف الطلب');
      setDeleteTarget(null);
      loadOrders();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      addToast('error', msg);
    } finally {
      setActionLoading(null);
    }
  };

  const CATEGORY_TABS: { key: Category; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'pending', label: 'طلبات قيد الانتظار', icon: <Clock className="w-4 h-4" />, count: categoryCounts.pending },
    { key: 'success', label: 'طلبات مكتملة', icon: <CheckCircle2 className="w-4 h-4" />, count: categoryCounts.success },
    { key: 'rejected', label: 'طلبات مرفوضة', icon: <Ban className="w-4 h-4" />, count: categoryCounts.rejected },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-blue-800/20 shadow-xl p-5 animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-11 h-11 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl shadow-lg shadow-blue-600/30">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">طلبات الشراء</h2>
              <p className="text-blue-400/50 text-xs">إدارة طلبات المستخدمين</p>
            </div>
          </div>
          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-1.5 text-blue-400/70 hover:text-blue-400 text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 animate-slide-up">
        {CATEGORY_TABS.map((tab) => {
          const isActive = category === tab.key;
          const activeClasses =
            tab.key === 'success'
              ? 'bg-gradient-to-r from-green-600/80 to-emerald-500/80 text-green-100 border-[#76FF03]/30 shadow-[0_0_12px_rgba(118,255,3,0.2)]'
              : tab.key === 'rejected'
              ? 'bg-gradient-to-r from-red-600/80 to-rose-500/80 text-red-100 border-[#F44336]/30 shadow-[0_0_12px_rgba(244,67,54,0.2)]'
              : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-blue-400/30 shadow-lg shadow-blue-600/20';
          return (
            <button
              key={tab.key}
              onClick={() => setCategory(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-bold border transition-all ${
                isActive
                  ? activeClasses
                  : 'bg-slate-800/40 border-blue-800/20 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline truncate">{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-black/20' : 'bg-slate-700/50'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Grid */}
      {loading && filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-blue-400/40 text-sm">جاري التحميل...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-blue-800/20 shadow-xl py-16 text-center">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-blue-400/30" />
          <p className="text-blue-400/30 text-sm">
            {category === 'pending' ? 'لا توجد طلبات قيد الانتظار' : category === 'success' ? 'لا توجد طلبات مكتملة' : 'لا توجد طلبات مرفوضة'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((item) => {
            const key = `${item.userUid}/${item.orderKey}`;
            const d = item.data;
            return (
              <div
                key={key}
                className={`bg-slate-900/60 backdrop-blur-xl rounded-2xl border shadow-xl p-4 animate-slide-up ${
                  d.condition === 'Success'
                    ? 'border-[#76FF03]/20'
                    : d.condition === 'Rejected'
                    ? 'border-[#F44336]/20'
                    : 'border-blue-800/20'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-blue-800/20">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600/20 text-blue-300 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-lg">
                      {d.id_buy || 'N/A'}
                    </span>
                  </div>
                  <NeonStatusBadge condition={d.condition} />
                </div>

                {/* Info Grid */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-xs">
                    <User className="w-3.5 h-3.5 text-blue-400/60 shrink-0" />
                    <span className="text-blue-400/50 shrink-0">الاسم:</span>
                    <span className="text-white font-semibold truncate">{d.name || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Hash className="w-3.5 h-3.5 text-blue-400/60 shrink-0" />
                    <span className="text-blue-400/50 shrink-0">UID:</span>
                    <span className="text-cyan-300 font-mono truncate">{d.id || item.userUid}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <DollarSign className="w-3.5 h-3.5 text-blue-400/60 shrink-0" />
                    <span className="text-blue-400/50 shrink-0">السعر:</span>
                    <span className="text-amber-300 font-bold">{d.price || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="w-3.5 h-3.5 text-blue-400/60 shrink-0" />
                    <span className="text-blue-400/50 shrink-0">الوصف:</span>
                    <span className="text-slate-300 truncate">{d.dicrption || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-blue-400/60 shrink-0" />
                    <span className="text-blue-400/50 shrink-0">التاريخ:</span>
                    <span className="text-slate-300 truncate">{d.calnder || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Layers className="w-3.5 h-3.5 text-blue-400/60 shrink-0" />
                    <span className="text-blue-400/50 shrink-0">المتبقي:</span>
                    <span className="text-slate-300">{d.residual || '-'}</span>
                  </div>
                </div>

                {/* Input Field */}
                <div className="mb-3">
                  <input
                    type="text"
                    value={inputValues[key] || ''}
                    onChange={(e) => setInputValues((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder="أدخل كود/رابط الإرسال"
                    className="w-full bg-slate-800/60 border border-blue-800/30 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500"
                    dir="ltr"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSend(item)}
                    disabled={actionLoading === key}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-bold rounded-lg py-2.5 text-xs transition-all shadow-lg shadow-green-600/20 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {actionLoading === key ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                    إرسال الطلب
                  </button>
                  <button
                    onClick={() => handleReject(item)}
                    disabled={actionLoading === key}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold rounded-lg py-2.5 text-xs transition-all shadow-lg shadow-red-600/20 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {actionLoading === key ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <XCircle className="w-4 h-4" />}
                    رفض الطلب
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="flex items-center justify-center bg-slate-800/60 hover:bg-red-950/50 border border-blue-800/30 hover:border-red-800/40 text-red-400 rounded-lg p-2.5 transition-all hover:scale-105 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 rounded-2xl border border-red-800/30 shadow-2xl p-6 max-w-sm w-full animate-slide-up">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-red-950/60 rounded-full mb-3">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="text-white font-bold text-base mb-1">هل تريد حذف الطلب ؟</h3>
              <p className="text-blue-400/40 text-xs">لا يمكن التراجع عن هذه العملية</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                disabled={actionLoading === `${deleteTarget.userUid}/${deleteTarget.orderKey}`}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold rounded-xl py-3 text-sm transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {actionLoading === `${deleteTarget.userUid}/${deleteTarget.orderKey}` ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
                حذف
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
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
