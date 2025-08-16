"use client";
import { useState } from "react";
import TimerCircle from "../component/timer-circle";
import { TimerInputs } from "../component/timer-inputs";
import { TimerControls } from "../component/timer-controls";

export default function Timer({ className }: { className?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [key, setKey] = useState(0);

  // default 20:00
  const DEFAULT_DURATION_MIN = 20;

  // numeric state used for the actual timer duration
  const [durationMinutes, setDurationMinutes] = useState(
    () => DEFAULT_DURATION_MIN
  );
  const [durationSeconds, setDurationSeconds] = useState(0);

  // string-backed inputs so the user can delete digits freely
  const [minutesStr, setMinutesStr] = useState(String(DEFAULT_DURATION_MIN));
  const [secondsStr, setSecondsStr] = useState("0");

  const timerDuration = Math.max(
    1,
    durationMinutes * 60 + Math.max(0, Math.min(59, durationSeconds))
  );

  const commitMinutes = () => {
    const parsed = Number(minutesStr || 0);
    const next = Math.max(0, Math.round(Number.isNaN(parsed) ? 0 : parsed));
    setDurationMinutes(next);
    setMinutesStr(String(next));
    setKey((k) => k + 1);
    setIsPlaying(false);
  };

  const commitSeconds = () => {
    const parsed = Number(secondsStr || 0);
    let next = Math.round(Number.isNaN(parsed) ? 0 : parsed);
    next = Math.max(0, Math.min(59, next));
    setDurationSeconds(next);
    setSecondsStr(String(next));
    setKey((k) => k + 1);
    setIsPlaying(false);
  };

  const adjustMinutes = (delta: number) => {
    const next = Math.max(0, durationMinutes + delta);
    setDurationMinutes(next);
    setMinutesStr(String(next));
    setKey((k) => k + 1);
    setIsPlaying(false);
  };

  return (
    <div
      className={`flex justify-center items-center bg-slate-200 p-12 rounded-xl w-full ${
        className ?? ""
      }`}
    >
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="flex items-center justify-center gap-6 w-full">
          <TimerCircle
            timerKey={key}
            isPlaying={isPlaying}
            duration={timerDuration}
          />
        </div>

        <TimerInputs
          minutesStr={minutesStr}
          secondsStr={secondsStr}
          setMinutesStr={setMinutesStr}
          setSecondsStr={setSecondsStr}
          commitMinutes={commitMinutes}
          commitSeconds={commitSeconds}
          adjustMinutes={adjustMinutes}
        />

        <div className="flex flex-col items-center gap-3">
          <TimerControls
            isPlaying={isPlaying}
            onStart={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onRestart={() => {
              setKey((k) => k + 1);
              setIsPlaying(true);
            }}
          />
        </div>
      </div>
    </div>
  );
}
