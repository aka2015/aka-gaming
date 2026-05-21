"use client";

import { useState, useEffect } from "react";

const REWARDS = [10, 10, 30, 10, 10, 10, 50];
const LABELS = ["Hari 1", "Hari 2", "Hari 3", "Hari 4", "Hari 5", "Hari 6", "Hari 7"];

interface DailyCheckinProps {
  streak: number;
  canCheckin: boolean;
  onClaim: () => void;
  onClose: () => void;
}

export default function DailyCheckin({ streak, canCheckin, onClaim, onClose }: DailyCheckinProps) {
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [reward, setReward] = useState(0);

  useEffect(() => {
    if (!canCheckin) setClaimed(true);
  }, [canCheckin]);

  async function handleClaim() {
    setClaiming(true);
    try {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkin" }),
      });
      const data = await res.json();
      if (data.success && !data.alreadyClaimed) {
        setReward(data.reward);
        setClaimed(true);
        onClaim();
      }
    } catch {
      // ignore
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition"
        >
          ✕
        </button>

        <h2 className="font-head text-2xl text-center text-gray-800 mb-1">🎁 Check-in Harian</h2>
        <p className="text-center text-sm text-gray-400 mb-5">Claim credit gratis setiap hari!</p>

        {claimed && reward > 0 ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-3 animate-bounce">🎉</div>
            <p className="text-xl font-bold text-green-600">+{reward} Credit!</p>
            <p className="text-sm text-gray-400 mt-1">Streak: {streak} hari</p>
            <button onClick={onClose} className="mt-4 btn-primary-custom">
              Tutup
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1.5 mb-5">
              {REWARDS.map((r, i) => {
                const dayNum = i + 1;
                const isClaimed = dayNum <= streak - (canCheckin ? 1 : 0);
                const isToday = dayNum === (canCheckin ? streak + 1 : streak);
                return (
                  <div
                    key={i}
                    className={`flex flex-col items-center rounded-lg p-1.5 text-center ${
                      isClaimed
                        ? "bg-green-100 border-2 border-green-300"
                        : isToday
                          ? "bg-yellow-100 border-2 border-yellow-400 animate-pulse"
                          : "bg-gray-50 border-2 border-gray-100"
                    }`}
                  >
                    <span className="text-[10px] text-gray-400">{LABELS[i]}</span>
                    <span className={`text-sm font-bold ${isClaimed ? "text-green-600" : isToday ? "text-yellow-600" : "text-gray-300"}`}>
                      {isClaimed ? "✅" : `+${r}`}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">
                Streak saat ini: <span className="font-bold text-purple-600">{streak} hari</span>
              </p>
              {streak === 0 && <p className="text-xs text-gray-400 mt-1">Check-in hari ini untuk memulai streak!</p>}
            </div>

            <button
              onClick={handleClaim}
              disabled={claiming || !canCheckin}
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {claiming ? "⏳ Claiming..." : canCheckin ? `🎁 Claim +${REWARDS[Math.min(streak, REWARDS.length - 1)]} Credit` : "✅ Sudah Claim Hari Ini"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
