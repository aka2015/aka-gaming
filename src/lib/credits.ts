import { getAdminDb } from "./firebase-admin";

export const CREDIT_CONFIG = {
  DAILY_CREDITS: 100,
  COST_GENERATE: 10,
  COST_REGENERATE: 10,
  COST_ITERATE: 5,
  REWARD_PER_AD: 20,
  MAX_ADS_PER_DAY: 5,
  MAX_CREDIT_ROLLOVER: 200,
  CHECKIN_REWARDS: [10, 10, 30, 10, 10, 10, 50],
};

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export async function getUserCredits(userId: string): Promise<{
  credits: number;
  adsWatchedToday: number;
  canWatchAds: boolean;
  lastReset: string;
  checkinStreak: number;
  lastCheckin: string;
  canCheckin: boolean;
}> {
  const adminDb = getAdminDb();
  const userRef = adminDb.collection("users").doc(userId);
  const userSnap = await userRef.get();
  const today = getTodayKey();

  if (!userSnap.exists) {
    await userRef.set({
      uid: userId,
      email: userId,
      displayName: "",
      photoURL: "",
      role: "user",
      credits: CREDIT_CONFIG.DAILY_CREDITS,
      lastReset: today,
      adsWatchedToday: 0,
      createdAt: Date.now(),
    });
    return {
      credits: CREDIT_CONFIG.DAILY_CREDITS,
      adsWatchedToday: 0,
      canWatchAds: true,
      lastReset: today,
      checkinStreak: 0,
      lastCheckin: "",
      canCheckin: true,
    };
  }

  const data = userSnap.data() || {};
  let credits = data.credits ?? CREDIT_CONFIG.DAILY_CREDITS;
  let adsWatchedToday = data.adsWatchedToday ?? 0;
  let lastReset = data.lastReset ?? today;
  let checkinStreak = data.checkinStreak ?? 0;
  let lastCheckin = data.lastCheckin ?? "";

  if (lastReset !== today) {
    const rollover = Math.min(credits, CREDIT_CONFIG.MAX_CREDIT_ROLLOVER);
    credits = rollover + CREDIT_CONFIG.DAILY_CREDITS;
    adsWatchedToday = 0;
    lastReset = today;
    await userRef.update({ credits, adsWatchedToday: 0, lastReset });
  }

  return {
    credits,
    adsWatchedToday,
    canWatchAds: adsWatchedToday < CREDIT_CONFIG.MAX_ADS_PER_DAY,
    lastReset,
    checkinStreak,
    lastCheckin,
    canCheckin: lastCheckin !== today,
  };
}

export async function deductCredits(userId: string, amount: number): Promise<{ success: boolean; credits: number; error?: string }> {
  const adminDb = getAdminDb();
  const userRef = adminDb.collection("users").doc(userId);

  return adminDb.runTransaction(async (transaction) => {
    const snap = await transaction.get(userRef);
    if (!snap.exists) {
      return { success: false, credits: 0, error: "User tidak ditemukan" };
    }

    const data = snap.data() || {};
    let credits = data.credits ?? 0;
    const today = getTodayKey();
    const lastReset = data.lastReset ?? today;

    if (lastReset !== today) {
      const rollover = Math.min(credits, CREDIT_CONFIG.MAX_CREDIT_ROLLOVER);
      credits = rollover + CREDIT_CONFIG.DAILY_CREDITS;
      transaction.update(userRef, { credits, adsWatchedToday: 0, lastReset: today });
    }

    if (credits < amount) {
      return { success: false, credits, error: "Credit tidak cukup. Tonton ads atau tunggu reset besok." };
    }

    credits -= amount;
    transaction.update(userRef, { credits });
    return { success: true, credits };
  });
}

export async function addCreditsFromAd(userId: string): Promise<{ success: boolean; credits: number; adsWatchedToday: number; error?: string }> {
  const adminDb = getAdminDb();
  const userRef = adminDb.collection("users").doc(userId);

  return adminDb.runTransaction(async (transaction) => {
    const snap = await transaction.get(userRef);
    if (!snap.exists) {
      return { success: false, credits: 0, adsWatchedToday: 0, error: "User tidak ditemukan" };
    }

    const data = snap.data() || {};
    let credits = data.credits ?? 0;
    let adsWatchedToday = data.adsWatchedToday ?? 0;
    const today = getTodayKey();
    let lastReset = data.lastReset ?? today;

    if (lastReset !== today) {
      adsWatchedToday = 0;
      lastReset = today;
    }

    if (adsWatchedToday >= CREDIT_CONFIG.MAX_ADS_PER_DAY) {
      return { success: false, credits, adsWatchedToday, error: "Batas nonton ads hari ini sudah tercapai" };
    }

    credits += CREDIT_CONFIG.REWARD_PER_AD;
    adsWatchedToday += 1;
    transaction.update(userRef, { credits, adsWatchedToday, lastReset });
    return { success: true, credits, adsWatchedToday };
  });
}

export async function claimDailyCheckin(userId: string): Promise<{
  success: boolean;
  credits: number;
  streak: number;
  reward: number;
  alreadyClaimed: boolean;
  error?: string;
}> {
  const adminDb = getAdminDb();
  const userRef = adminDb.collection("users").doc(userId);
  const today = getTodayKey();
  const yesterday = getYesterdayKey();

  return adminDb.runTransaction(async (transaction) => {
    const snap = await transaction.get(userRef);
    if (!snap.exists) {
      return { success: false, credits: 0, streak: 0, reward: 0, alreadyClaimed: false, error: "User tidak ditemukan" };
    }

    const data = snap.data() || {};
    let credits = data.credits ?? 0;
    let streak = data.checkinStreak ?? 0;
    let lastCheckin = data.lastCheckin ?? "";

    if (lastCheckin === today) {
      return { success: true, credits, streak, reward: 0, alreadyClaimed: true };
    }

    if (lastCheckin !== yesterday && lastCheckin !== today) {
      streak = 0;
    }

    streak += 1;
    const rewardIndex = Math.min(streak - 1, CREDIT_CONFIG.CHECKIN_REWARDS.length - 1);
    const reward = CREDIT_CONFIG.CHECKIN_REWARDS[rewardIndex];
    credits += reward;

    transaction.update(userRef, { credits, checkinStreak: streak, lastCheckin: today });
    return { success: true, credits, streak, reward, alreadyClaimed: false };
  });
}
