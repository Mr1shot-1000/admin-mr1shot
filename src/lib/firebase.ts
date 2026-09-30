const FIREBASE_DB_URL = 'https://admin-key-c3528-default-rtdb.firebaseio.com';

export async function fetchCoin(uid: string): Promise<string> {
  const url = `${FIREBASE_DB_URL}/coins/${uid}/coin.json`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`فشل في جلب الرصيد (${res.status})`);
  }
  const data = await res.json();
  if (data === null || data === undefined) {
    return '0';
  }
  return String(data);
}

export async function putCoin(uid: string, value: string): Promise<void> {
  const url = `${FIREBASE_DB_URL}/coins/${uid}/coin.json`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  });
  if (!res.ok) {
    throw new Error(`فشل في تحديث الرصيد (${res.status})`);
  }
}

// --- Diamonds ---

export async function fetchDiamond(uid: string): Promise<string> {
  const url = `${FIREBASE_DB_URL}/diamond/${uid}/diamond.json`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`فشل في جلب الجواهر (${res.status})`);
  }
  const data = await res.json();
  if (data === null || data === undefined) {
    return '0';
  }
  return String(data);
}

export async function putDiamond(uid: string, value: string): Promise<void> {
  const url = `${FIREBASE_DB_URL}/diamond/${uid}/diamond.json`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  });
  if (!res.ok) {
    throw new Error(`فشل في تحديث الجواهر (${res.status})`);
  }
}

// --- Membership ---

export async function patchMembership(uid: string, data: Record<string, number>): Promise<void> {
  const url = `${FIREBASE_DB_URL}/membership/${uid}.json`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`فشل في تحديث العضوية (${res.status})`);
  }
}

export async function patchPremiumMembership(uid: string, data: Record<string, number>): Promise<void> {
  const url = `${FIREBASE_DB_URL}/membership/${uid}/weekly_premium.json`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`فشل في تحديث العضوية المميزة (${res.status})`);
  }
}

export async function patchMembershipSettings(data: Record<string, number>): Promise<void> {
  const url = `${FIREBASE_DB_URL}/membership/Settings.json`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`فشل في تحديث إعدادات العضوية (${res.status})`);
  }
}

// --- Verification ---

export async function patchUserData(uid: string, data: Record<string, string>): Promise<void> {
  const url = `${FIREBASE_DB_URL}/user_datas/${uid}.json`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`فشل في تحديث بيانات المستخدم (${res.status})`);
  }
}

export async function fetchAllUserDatas(): Promise<Record<string, { name?: string; v?: string }> | null> {
  const url = `${FIREBASE_DB_URL}/user_datas.json`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`فشل في جلب بيانات المستخدمين (${res.status})`);
  }
  return res.json();
}

// --- Purchase Requests ---

export interface OrderData {
  id_buy?: string;
  id?: string;
  name?: string;
  price?: string;
  dicrption?: string;
  calnder?: string;
  residual?: string;
  condition?: string;
  request?: string;
}

export async function fetchAllOrders(): Promise<Record<string, Record<string, OrderData>> | null> {
  const url = `${FIREBASE_DB_URL}/order_buy.json`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`فشل في جلب طلبات الشراء (${res.status})`);
  }
  return res.json();
}

export async function patchOrder(userUid: string, orderKey: string, data: Record<string, string>): Promise<void> {
  const url = `${FIREBASE_DB_URL}/order_buy/${userUid}/${orderKey}.json`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`فشل في تحديث الطلب (${res.status})`);
  }
}

export async function deleteOrder(userUid: string, orderKey: string): Promise<void> {
  const url = `${FIREBASE_DB_URL}/order_buy/${userUid}/${orderKey}.json`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`فشل في حذف الطلب (${res.status})`);
  }
}

// --- Chat Control ---

export async function patchStopChat(stop: string): Promise<void> {
  const url = `${FIREBASE_DB_URL}/stop_chat/stop_chat.json`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stop }),
  });
  if (!res.ok) {
    throw new Error(`فشل في تحديث حالة الشات (${res.status})`);
  }
}

export async function patchUserBan(uid: string, bk: string): Promise<void> {
  const url = `${FIREBASE_DB_URL}/seting_usgl/${uid}.json`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bk }),
  });
  if (!res.ok) {
    throw new Error(`فشل في تحديث حالة الحظر (${res.status})`);
  }
}

export interface ChatMessage {
  message?: string;
  uid?: string;
  name?: string;
  v?: string;
  msg_id?: string;
  time?: string;
}

export async function putChatMessage(id: string, data: Record<string, string>): Promise<void> {
  const url = `${FIREBASE_DB_URL}/chat_global/${id}.json`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`فشل في إرسال الرسالة (${res.status})`);
  }
}

export async function fetchChatGlobal(): Promise<Record<string, ChatMessage> | null> {
  const url = `${FIREBASE_DB_URL}/chat_global.json`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`فشل في جلب رسائل الشات (${res.status})`);
  }
  return res.json();
}

export async function deleteChatMessage(msgId: string): Promise<void> {
  const url = `${FIREBASE_DB_URL}/chat_global/${msgId}.json`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`فشل في حذف الرسالة (${res.status})`);
  }
}

/**
 * Updates maintenance control fields for a single version in Firebase.
 * Node: control_appsensi/control_appsensi
 * Fields per version N: control{N}, text_mainte_login{N}, text_mainte_signin{N}, messag_dialog{N}
 */
export async function updateMaintenanceVersion(
  versionNum: number,
  status: string,
  loginText: string,
  signinText: string,
  dialogMessage: string,
): Promise<void> {
  const url = `${FIREBASE_DB_URL}/control_appsensi/control_appsensi.json`;

  const payload: Record<string, string> = {
    [`control${versionNum}`]: status,
    [`text_mainte_login${versionNum}`]: loginText,
    [`text_mainte_signin${versionNum}`]: signinText,
    [`messag_dialog${versionNum}`]: dialogMessage,
  };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`فشل في تحديث النسخة v${versionNum} (${res.status})`);
  }
}
