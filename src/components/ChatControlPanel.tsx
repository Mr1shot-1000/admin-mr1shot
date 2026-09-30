import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageSquare, Settings, Radio, Ban, ShieldOff, Hash, Send, Trash2,
  RefreshCw, BadgeCheck, Volume2, X, AlertTriangle, UserX, Copy,
} from 'lucide-react';
import {
  patchStopChat, patchUserBan, putChatMessage, fetchChatGlobal, deleteChatMessage,
  type ChatMessage,
} from '@/lib/firebase';
import type { ToastAlert } from '@/types';

interface ChatControlPanelProps {
  addToast: (type: ToastAlert['type'], message: string) => void;
}

type SubPanel = 'settings' | 'live';

function formatTime(): string {
  const now = new Date();
  const hours = now.getHours();
  const mins = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours.toString().padStart(2, '0')}:${mins} ${ampm}`;
}

export default function ChatControlPanel({ addToast }: ChatControlPanelProps) {
  const [subPanel, setSubPanel] = useState<SubPanel>('settings');

  // Settings state
  const [banUid, setBanUid] = useState('');
  const [banReason, setBanReason] = useState('');
  const [unbanUid, setUnbanUid] = useState('');
  const [banLoading, setBanLoading] = useState(false);
  const [unbanLoading, setUnbanLoading] = useState(false);
  const [stopLoading, setStopLoading] = useState(false);

  // Live chat state
  const [messages, setMessages] = useState<{ key: string; data: ChatMessage }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [actionTarget, setActionTarget] = useState<{ key: string; data: ChatMessage } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ key: string; data: ChatMessage } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    setChatLoading(true);
    try {
      const data = await fetchChatGlobal();
      if (!data) {
        setMessages([]);
        return;
      }
      const items: { key: string; data: ChatMessage }[] = [];
      for (const [key, msg] of Object.entries(data)) {
        if (msg && typeof msg === 'object') {
          items.push({ key, data: msg });
        }
      }
      items.sort((a, b) => {
        const ta = parseInt(a.data.msg_id || a.key, 10) || 0;
        const tb = parseInt(b.data.msg_id || b.key, 10) || 0;
        return ta - tb;
      });
      setMessages(items);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      addToast('error', msg);
    } finally {
      setChatLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (subPanel === 'live') {
      loadMessages();
    }
  }, [subPanel, loadMessages]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // --- Settings actions ---

  const handleStopAll = async () => {
    setStopLoading(true);
    try {
      await patchStopChat('true');
      addToast('success', 'تم إيقاف الرسائل عن الجميع');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      addToast('error', msg);
    } finally {
      setStopLoading(false);
    }
  };

  const handleAllowAll = async () => {
    setStopLoading(true);
    try {
      await patchStopChat('false');
      addToast('success', 'تم تشغيل الرسائل للجميع');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      addToast('error', msg);
    } finally {
      setStopLoading(false);
    }
  };

  const handleBan = async () => {
    if (!banUid.trim()) { addToast('error', 'الرجاء إدخال UID المستخدم للحظر'); return; }
    if (!banReason.trim()) { addToast('error', 'الرجاء إدخال سبب الحظر'); return; }
    setBanLoading(true);
    try {
      await patchUserBan(banUid.trim(), 'true');

      const idStr = Date.now().toString();
      await putChatMessage(idStr, {
        message: banReason.trim(),
        uid: 'system_id',
        name: 'اشعارات النظام',
        v: 'Ⓜ︎',
        msg_id: idStr,
        time: formatTime(),
      });

      addToast('success', 'تم حظر المستخدم وإرسال الإشعار');
      setBanUid('');
      setBanReason('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      addToast('error', msg);
    } finally {
      setBanLoading(false);
    }
  };

  const handleUnban = async () => {
    if (!unbanUid.trim()) { addToast('error', 'الرجاء إدخال UID المستخدم لإلغاء الحظر'); return; }
    setUnbanLoading(true);
    try {
      await patchUserBan(unbanUid.trim(), 'false');
      addToast('success', 'تم إلغاء الحظر عن المستخدم');
      setUnbanUid('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      addToast('error', msg);
    } finally {
      setUnbanLoading(false);
    }
  };

  // --- Live chat actions ---

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    setSendLoading(true);
    try {
      const idStr = Date.now().toString();
      await putChatMessage(idStr, {
        message: inputText.trim(),
        uid: 'system_id',
        name: 'اشعارات النظام',
        v: 'Ⓜ︎',
        msg_id: idStr,
        time: formatTime(),
      });
      setInputText('');
      loadMessages();
      addToast('success', 'تم إرسال الرسالة');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      addToast('error', msg);
    } finally {
      setSendLoading(false);
    }
  };

  const handleDeleteMessage = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteChatMessage(deleteTarget.data.msg_id || deleteTarget.key);
      setMessages((prev) => prev.filter((m) => (m.data.msg_id || m.key) !== (deleteTarget.data.msg_id || deleteTarget.key)));
      addToast('success', 'تم حذف الرسالة');
      setDeleteTarget(null);
      setActionTarget(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
      addToast('error', msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBanFromChat = () => {
    if (!actionTarget) return;
    setBanUid(actionTarget.data.uid || '');
    setActionTarget(null);
    setSubPanel('settings');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-blue-800/20 shadow-xl p-5 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl shadow-lg shadow-blue-600/30">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base sm:text-lg">نظام التحكم بالشات</h2>
            <p className="text-blue-400/50 text-xs">إدارة الشات العام والحظر</p>
          </div>
        </div>
      </div>

      {/* Sub-panel Tabs */}
      <div className="flex gap-2 animate-slide-up">
        <button
          onClick={() => setSubPanel('settings')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
            subPanel === 'settings'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/20'
              : 'bg-slate-800/40 border border-blue-800/20 text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Settings className="w-4 h-4" />
          الإعدادات والحظر
        </button>
        <button
          onClick={() => setSubPanel('live')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
            subPanel === 'live'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/20'
              : 'bg-slate-800/40 border border-blue-800/20 text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Radio className="w-4 h-4" />
          المعاينة الحية
        </button>
      </div>

      {/* PANEL A: Settings & Ban */}
      {subPanel === 'settings' && (
        <div className="space-y-6 animate-fade-in">
          {/* Global Toggle */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-blue-800/20 shadow-xl p-5 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <Volume2 className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-bold text-sm">التحكم العام بالرسائل</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleStopAll}
                disabled={stopLoading}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-red-600/20 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {stopLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Ban className="w-5 h-5" />}
                إيقاف الرسائل عن الجميع
              </button>
              <button
                onClick={handleAllowAll}
                disabled={stopLoading}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-bold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-green-600/20 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {stopLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                تشغيل الرسائل (السماح)
              </button>
            </div>
          </div>

          {/* Ban Section */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-red-800/20 shadow-xl p-5 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <Ban className="w-5 h-5 text-red-400" />
              <h3 className="text-white font-bold text-sm">حظر مستخدم</h3>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-red-200/70 text-xs font-semibold mb-1.5">معرف المستخدم للحظر (UID)</label>
                <div className="relative">
                  <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400/60" />
                  <input
                    type="text"
                    value={banUid}
                    onChange={(e) => setBanUid(e.target.value)}
                    placeholder="Firebase Auth UID"
                    className="w-full bg-slate-800/60 border border-red-800/30 text-white rounded-xl pr-11 pl-4 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-slate-500 font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
              <div>
                <label className="block text-red-200/70 text-xs font-semibold mb-1.5">سبب الحظر (مثال: تصرف غير لائق)</label>
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="سبب الحظر"
                  className="w-full bg-slate-800/60 border border-red-800/30 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-slate-500"
                  dir="rtl"
                />
              </div>
            </div>

            <button
              onClick={handleBan}
              disabled={banLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-red-600/20 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {banLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Ban className="w-5 h-5" />}
              حظر المستخدم
            </button>
          </div>

          {/* Unban Section */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-green-800/20 shadow-xl p-5 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <ShieldOff className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-bold text-sm">إلغاء الحظر</h3>
            </div>

            <div className="mb-4">
              <label className="block text-green-200/70 text-xs font-semibold mb-1.5">معرف المستخدم لإلغاء الحظر (UID)</label>
              <div className="relative">
                <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400/60" />
                <input
                  type="text"
                  value={unbanUid}
                  onChange={(e) => setUnbanUid(e.target.value)}
                  placeholder="Firebase Auth UID"
                  className="w-full bg-slate-800/60 border border-green-800/30 text-white rounded-xl pr-11 pl-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all placeholder:text-slate-500 font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              onClick={handleUnban}
              disabled={unbanLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-bold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-green-600/20 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {unbanLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldOff className="w-5 h-5" />}
              إلغاء الحظر
            </button>
          </div>
        </div>
      )}

      {/* PANEL B: Telegram-style Live Chat */}
      {subPanel === 'live' && (
        <div className="animate-fade-in flex flex-col rounded-2xl border border-blue-800/20 shadow-xl overflow-hidden bg-slate-900/60 backdrop-blur-xl"
          style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-blue-800/20 bg-slate-900/80 shrink-0">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-bold text-sm">الشات العام المباشر</h3>
              <span className="bg-cyan-600/20 text-cyan-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                {messages.length}
              </span>
            </div>
            <button
              onClick={loadMessages}
              disabled={chatLoading}
              className="flex items-center gap-1.5 text-blue-400/70 hover:text-blue-400 text-xs font-semibold transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${chatLoading ? 'animate-spin' : ''}`} />
              تحديث
            </button>
          </div>

          {/* Chat Messages Area */}
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-950/40 to-blue-950/20"
          >
            {chatLoading && messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-blue-400/40 text-sm">جاري التحميل...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-blue-400/30 text-sm">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                لا توجد رسائل بعد
              </div>
            ) : (
              messages.map((item) => {
                const isSystem = item.data.uid === 'system_id';
                const isVerified = item.data.v === 'Ⓜ︎';
                return (
                  <div
                    key={item.key}
                    onClick={() => setActionTarget(item)}
                    className={`group cursor-pointer animate-fade-in ${
                      isSystem ? 'flex justify-center' : 'flex justify-start'
                    }`}
                  >
                    {/* System message - centered red tint card */}
                    {isSystem ? (
                      <div className="max-w-[85%] bg-[#EF9A9A]/15 border border-[#EF9A9A]/30 rounded-2xl px-4 py-2.5 backdrop-blur-sm">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[#EF9A9A] text-xs font-bold">اشعارات النظام</span>
                          <BadgeCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        </div>
                        <p className="text-[#EF9A9A]/90 text-sm leading-relaxed">
                          {item.data.message || ''}
                        </p>
                        <span className="text-[#EF9A9A]/40 text-[10px] mt-1 block">{item.data.time || ''}</span>
                      </div>
                    ) : (
                      /* User message - left aligned bubble */
                      <div className="max-w-[80%] bg-slate-800/70 border border-blue-800/30 rounded-2xl rounded-tr-md px-4 py-2.5 shadow-lg">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-cyan-300 text-xs font-bold truncate">
                            {item.data.name || 'مستخدم'}
                          </span>
                          {isVerified && (
                            <BadgeCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-slate-200 text-sm leading-relaxed">
                          {item.data.message || ''}
                        </p>
                        <span className="text-blue-400/40 text-[10px] mt-1 block">{item.data.time || ''}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Input Bar - Telegram style */}
          <div className="shrink-0 border-t border-blue-800/20 bg-slate-900/80 p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !sendLoading) handleSendMessage(); }}
                placeholder="اكتب رسالة كإشعار نظام..."
                className="flex-1 bg-slate-800/60 border border-blue-800/30 text-white rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder:text-slate-500"
                dir="rtl"
                disabled={sendLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={sendLoading || !inputText.trim()}
                className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-full shrink-0 shadow-lg shadow-blue-600/30 transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed glow-btn"
              >
                {sendLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Bottom Sheet */}
      {actionTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setActionTarget(null)}
        >
          <div
            className="bg-slate-900 rounded-t-3xl border-t border-blue-800/30 shadow-2xl w-full max-w-md p-4 animate-sheet-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1.5 bg-blue-800/40 rounded-full" />
            </div>

            {/* Message preview */}
            <div className="bg-slate-800/40 rounded-xl p-3 mb-4 border border-blue-800/20">
              <p className="text-blue-400/50 text-[10px] mb-1">
                {actionTarget.data.name || 'مستخدم'} • {actionTarget.data.time || ''}
              </p>
              <p className="text-slate-300 text-sm truncate">
                {actionTarget.data.message || ''}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => setDeleteTarget(actionTarget)}
                className="w-full flex items-center gap-3 bg-red-950/40 hover:bg-red-900/50 border border-red-800/30 text-red-300 rounded-xl px-4 py-3.5 text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Trash2 className="w-5 h-5" />
                حذف الرسالة
              </button>
              {actionTarget.data.uid !== 'system_id' && (
                <button
                  onClick={handleBanFromChat}
                  className="w-full flex items-center gap-3 bg-red-950/30 hover:bg-red-900/40 border border-red-800/20 text-red-300/90 rounded-xl px-4 py-3.5 text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <UserX className="w-5 h-5" />
                  حظر صاحب الرسالة
                </button>
              )}
              <button
                onClick={() => setActionTarget(null)}
                className="w-full flex items-center justify-center gap-2 bg-slate-800/60 hover:bg-slate-700/60 border border-blue-800/30 text-slate-300 font-bold rounded-xl py-3.5 text-sm transition-all"
              >
                <X className="w-5 h-5" />
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Message Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 rounded-2xl border border-red-800/30 shadow-2xl p-6 max-w-sm w-full animate-slide-up">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-red-950/60 rounded-full mb-3">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="text-white font-bold text-base mb-1">حذف الرسالة</h3>
              <p className="text-blue-400/40 text-xs">هل تريد حذف هذه الرسالة ؟</p>
              <p className="text-slate-300 text-sm mt-2 bg-slate-800/50 rounded-lg px-3 py-2 max-w-full truncate">
                {deleteTarget.data.message}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteMessage}
                disabled={deleteLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold rounded-xl py-3 text-sm transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {deleteLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 className="w-5 h-5" />}
                حذف الرسالة
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
