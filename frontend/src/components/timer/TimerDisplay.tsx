interface TimerDisplayProps {
  progress: number;
  formattedTime: string;
  mode: 'work' | 'break';
}

export const TimerDisplay = ({ progress, formattedTime, mode }: TimerDisplayProps) => {
  // Dynamic color based on mode
  const getTimerColor = () => {
    return mode === 'work' ? 'rgb(59, 130, 246)' : 'rgb(16, 185, 129)';
  };

  return (
    <div className="relative h-36 w-36 sm:h-48 sm:w-48 mx-auto mb-6">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
          className="dark:stroke-gray-700"
        />

        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={getTimerColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="283"
          strokeDashoffset={283 - (283 * progress) / 100}
          className="transform origin-center -rotate-90"
        />
      </svg>

      {/* Timer text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          {formattedTime}
        </span>
      </div>
    </div>
  );
};
