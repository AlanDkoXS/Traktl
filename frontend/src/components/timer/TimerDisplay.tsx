interface TimerDisplayProps {
  progress: number;
  formattedTime: string;
  mode: 'work' | 'break';
}

export const TimerDisplay = ({ progress, formattedTime, mode }: TimerDisplayProps) => {
  return (
    <div className="relative h-48 w-48 sm:h-64 sm:w-64 mx-auto mb-4">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          className="text-gray-200 dark:text-[rgb(var(--color-border-primary))]"
        />

        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="263.89" // 2 * PI * 42
          strokeDashoffset={263.89 - (263.89 * progress) / 100}
          className={`transform origin-center -rotate-90 ${
            mode === 'work' ? 'stroke-[hsl(var(--color-project-hue),var(--color-project-saturation),var(--color-project-lightness))]' : 'text-green-500 dark:text-green-400'
          }`}
        />
      </svg>

      {/* Timer text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl sm:text-5xl font-bold dynamic-color">
          {formattedTime}
        </span>
      </div>
    </div>
  );
};
