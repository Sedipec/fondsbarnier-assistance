'use client';

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="flex items-center gap-3">
      <progress
        className="progress progress-primary w-full"
        value={current}
        max={total}
      />
      <span className="text-base-content/70 min-w-[3rem] text-sm font-medium">
        {percentage}%
      </span>
    </div>
  );
}
