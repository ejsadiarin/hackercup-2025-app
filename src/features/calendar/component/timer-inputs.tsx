"use client";
import { Input } from "@/components/ui/input";
import { FC } from "react";

export const TimerInputs: FC<{
  minutesStr: string;
  secondsStr: string;
  setMinutesStr: (s: string) => void;
  setSecondsStr: (s: string) => void;
  commitMinutes: () => void;
  commitSeconds: () => void;
  adjustMinutes: (delta: number) => void;
}> = ({
  minutesStr,
  secondsStr,
  setMinutesStr,
  setSecondsStr,
  commitMinutes,
  commitSeconds,
  adjustMinutes,
}) => {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm">Duration</label>
      <div className="flex items-center border rounded overflow-hidden">
        <button
          type="button"
          aria-label="decrease minutes"
          onClick={() => adjustMinutes(-1)}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
        >
          −
        </button>

        <Input
          type="number"
          min={0}
          value={minutesStr}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setMinutesStr(e.target.value)
          }
          onBlur={commitMinutes}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") commitMinutes();
          }}
          className="no-spinner w-16 text-center px-2 py-1 outline-none"
        />

        <span className="px-2">:</span>

        <Input
          type="number"
          min={0}
          max={59}
          value={secondsStr}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSecondsStr(e.target.value)
          }
          onBlur={commitSeconds}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") commitSeconds();
          }}
          className="no-spinner w-16 text-center px-2 py-1 outline-none"
        />

        <button
          type="button"
          aria-label="increase minutes"
          onClick={() => adjustMinutes(1)}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
        >
          +
        </button>
      </div>
      <span className="text-sm text-gray-500">mm : ss</span>
    </div>
  );
};
