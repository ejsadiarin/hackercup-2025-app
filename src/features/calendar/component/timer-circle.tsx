"use client";
import { useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

function formatTime(remaining: number) {
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function simpleAlarm() {
  // 1. Audio alarm
  try {
    const audio = new Audio("/alarm-327234.mp3");
    audio.volume = 0.7;
    audio.loop = true; // loop the alarm until stopped
    audio.play().catch(() => {
      // if audio fails, just vibrate instead
      if (navigator.vibrate) {
        navigator.vibrate([300, 100, 300, 100, 300]);
      }
    });
    return audio; // return audio element so we can stop it later
  } catch {
    // fallback: just vibrate
    if (navigator.vibrate) {
      navigator.vibrate([300, 100, 300, 100, 300]);
    }
    return null;
  }
}

export default function TimerCircle({
  timerKey,
  isPlaying,
  duration,
  onFinish,
}: {
  timerKey: number;
  isPlaying: boolean;
  duration: number;
  onFinish?: () => void;
}) {
  const [showPopup, setShowPopup] = useState(false);
  const [alarmAudio, setAlarmAudio] = useState<HTMLAudioElement | null>(null);

  const handleComplete = () => {
    // play alarm and store reference
    try {
      const audio = simpleAlarm();
      setAlarmAudio(audio);
    } catch {
      /* ignore */
    }
    setShowPopup(true);
    if (onFinish) onFinish();
    return undefined;
  };

  const stopAlarmAndClose = () => {
    // stop the alarm
    if (alarmAudio) {
      alarmAudio.pause();
      alarmAudio.currentTime = 0;
      setAlarmAudio(null);
    }
    setShowPopup(false);
  };

  return (
    <>
      <CountdownCircleTimer
        key={timerKey}
        isPlaying={isPlaying}
        duration={duration}
        colors={["#8A009B", "#F7B801", "#A30000", "#A30000"]}
        colorsTime={[
          duration,
          Math.max(1, Math.floor(duration * 0.66)),
          Math.max(1, Math.floor(duration * 0.33)),
          0,
        ]}
        onComplete={handleComplete}
      >
        {({ remainingTime }: { remainingTime: number }) => (
          <div className="w-[192px] h-[192px] flex items-center justify-center text-[#A600A9] font-bold text-xl">
            {formatTime(remainingTime)}
          </div>
        )}
      </CountdownCircleTimer>

      {/* Popup using shadcn-style components with animations */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in-0 duration-200">
          <div
            className="absolute inset-0 bg-black/40 animate-in fade-in-0 duration-200"
            onClick={stopAlarmAndClose}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-80 max-w-lg animate-in zoom-in-95 slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold animate-pulse">
                ⏰ Timer Finished!
              </h3>
              <button
                onClick={stopAlarmAndClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Your countdown has completed successfully.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-violet-700 text-white rounded-md hover:bg-violet-800 transition-colors transform hover:scale-105 focus:ring-2 focus:ring-green-300"
                onClick={stopAlarmAndClose}
              >
                Great!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
