interface TimerDisplayProps {
  progress: number;
  formattedTime: string;
  mode: 'work' | 'break';
}

export const TimerDisplay = ({ progress, formattedTime, mode }: TimerDisplayProps) => {
  // Dynamic color based on mode
  const getTimerColor = () => {
    return mode === 'work' ? 'var(--color-primary-600)' : 'rgb(16, 185, 129)';
  };

  return (
    <div className="relative h-48 w-48 sm:h-64 sm:w-64 mx-auto mb-4">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="7"
          className="dark:stroke-gray-700"
        />

        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={`rgb(${getTimerColor()})`}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="263.89" // 2 * PI * 42
          strokeDashoffset={263.89 - (263.89 * progress) / 100}
          className="transform origin-center -rotate-90"
        />
      </svg>

      {/* Timer text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
          {formattedTime}
        </span>
      </div>
    </div>
  );
};
