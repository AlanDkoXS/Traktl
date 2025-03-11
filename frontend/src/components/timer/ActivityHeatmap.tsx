import { useTranslation } from 'react-i18next';
import { TimeEntry } from '../../types';
import { format, subDays, addDays, startOfWeek, getDay } from 'date-fns';

interface ActivityHeatmapProps {
  timeEntries: TimeEntry[];
}

export const ActivityHeatmap = ({ timeEntries }: ActivityHeatmapProps) => {
  const { t } = useTranslation();
  const daysTranslation = {
    0: t('dashboard.days.sun'),
    1: t('dashboard.days.mon'),
    2: t('dashboard.days.tue'),
    3: t('dashboard.days.wed'),
    4: t('dashboard.days.thu'),
    5: t('dashboard.days.fri'),
    6: t('dashboard.days.sat')
  };
  
  // Generate 4 weeks of calendar grid (28 days)
  const generateCalendarGrid = () => {
    const today = new Date();
    const result = [];
    
    // Start from 4 weeks ago, aligned to the start of the week
    const start = startOfWeek(subDays(today, 28));
    
    // Generate 4 weeks (28 days)
    for (let i = 0; i < 28; i++) {
      const date = addDays(start, i);
      result.push({
        date,
        dateString: format(date, 'yyyy-MM-dd'),
        dayOfWeek: getDay(date),
        activity: 0
      });
    }
    
    return result;
  };
  
  // Calculate activity data
  const getActivityData = () => {
    const calendarGrid = generateCalendarGrid();
    
    // Map timeEntries to days
    timeEntries.forEach(entry => {
      const entryDate = format(new Date(entry.startTime), 'yyyy-MM-dd');
      const day = calendarGrid.find(d => d.dateString === entryDate);
      
      if (day) {
        day.activity += entry.duration / (1000 * 60); // Convert ms to minutes
      }
    });
    
    return calendarGrid;
  };
  
  const calendarData = getActivityData();
  
  // Get maximum activity for scaling
  const maxActivity = Math.max(...calendarData.map(d => d.activity), 60); // Minimum max of 60 min
  
  // Get color based on activity level
  const getActivityColor = (minutes: number) => {
    if (minutes === 0) return 'bg-gray-100 dark:bg-gray-700';
    
    const level = Math.min(Math.floor((minutes / maxActivity) * 4), 3);
    
    const colors = [
      'bg-green-100 dark:bg-green-900',
      'bg-green-300 dark:bg-green-700',
      'bg-green-500 dark:bg-green-500',
      'bg-green-700 dark:bg-green-300'
    ];
    
    return colors[level];
  };
  
  // Group by weeks
  const weeks = [];
  for (let i = 0; i < 4; i++) {
    weeks.push(calendarData.slice(i * 7, (i + 1) * 7));
  }
  
  return (
    <div>
      {/* Day headers */}
      <div className="flex mb-1">
        {[0, 1, 2, 3, 4, 5, 6].map(day => (
          <div key={day} className="w-8 h-8 flex-shrink-0 text-xs text-center text-gray-500 dark:text-gray-400">
            {daysTranslation[day]}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={`week-${weekIndex}`} className="flex">
            {week.map((day) => (
              <div 
                key={day.dateString}
                className={`w-8 h-8 flex-shrink-0 m-0.5 rounded ${getActivityColor(day.activity)}`}
                title={`${format(day.date, 'MMM d')}: ${Math.round(day.activity)} min`}
              />
            ))}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end mt-4 text-xs text-gray-500 dark:text-gray-400">
        <span>{t('dashboard.less')}</span>
        <div className="flex mx-2 space-x-1">
          <div className="h-3 w-3 bg-gray-100 dark:bg-gray-700 rounded"></div>
          <div className="h-3 w-3 bg-green-100 dark:bg-green-900 rounded"></div>
          <div className="h-3 w-3 bg-green-300 dark:bg-green-700 rounded"></div>
          <div className="h-3 w-3 bg-green-500 dark:bg-green-500 rounded"></div>
          <div className="h-3 w-3 bg-green-700 dark:bg-green-300 rounded"></div>
        </div>
        <span>{t('dashboard.more')}</span>
      </div>
    </div>
  );
};
