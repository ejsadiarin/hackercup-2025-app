"use client";
import { FC } from "react";

export const TimerControls: FC<{
  isPlaying: boolean;
  onStart: () => void;
  onPause: () => void;
  onRestart: () => void;
}> = ({ isPlaying, onStart, onPause, onRestart }) => {
  return (
    <div className="h-20 w-96 bg-[#A600A9] rounded-lg shadow flex items-center justify-center px-6">
      <div className="flex items-center justify-center gap-3">
        {isPlaying ? (
          <button
            type="button"
            onClick={onPause}
            className="px-3 py-1 bg-white text-violet-600 rounded-md font-medium"
          >
            Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={onStart}
            className="px-3 py-1 bg-white text-violet-600 rounded-md font-medium"
          >
            Start
          </button>
        )}

        <button
          type="button"
          onClick={onRestart}
          className="px-3 py-1 bg-white text-violet-600 rounded-md font-medium"
        >
          Restart
        </button>
      </div>
    </div>
  );
};
