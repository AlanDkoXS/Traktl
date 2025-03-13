import React from 'react';
import { useTranslation } from 'react-i18next';
import { TimeEntry } from '../../types';
import { format, subDays, getDay, eachDayOfInterval, startOfWeek } from 'date-fns';

interface ActivityHeatmapProps {
  timeEntries?: TimeEntry[];
}

export const ActivityHeatmap = ({ timeEntries = [] }: ActivityHeatmapProps) => {  
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
  
  // Generate 20 weeks of data (140 days)
  const generateCalendarGrid = () => {
    const today = new Date();
    const endDate = today;
    const startDate = subDays(today, 139); // 20 weeks - 1 day
    
    // Ensure we start with Sunday for consistency
    const gridStartDate = startOfWeek(startDate);
    
    // Get all days between start and end
    const days = eachDayOfInterval({ start: gridStartDate, end: endDate });
    
    // Group by day of week (0-6, Sunday to Saturday)
    const daysByWeekday: Record<number, any[]> = {
      0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
    };
    
    days.forEach(date => {
      const dayOfWeek = getDay(date);
      daysByWeekday[dayOfWeek].push({
        date,
        dateString: format(date, 'yyyy-MM-dd'),
        activity: 0
      });
    });
    
    return daysByWeekday;
  };
  
  // Calculate activity data
  const getActivityData = () => {
    const daysByWeekday = generateCalendarGrid();
    const activityByDate: Record<string, number> = {};
    
    // Map timeEntries to days if they exist
    if (timeEntries && timeEntries.length > 0) {
      timeEntries.forEach(entry => {
        try {
          // Ensure startTime is properly processed - handle both string and Date objects
          const startTime = entry.startTime instanceof Date 
            ? entry.startTime 
            : new Date(entry.startTime);
            
          const entryDate = format(startTime, 'yyyy-MM-dd');
          
          if (!activityByDate[entryDate]) {
            activityByDate[entryDate] = 0;
          }
          
          // Ensure duration is a number
          const duration = typeof entry.duration === 'number' ? entry.duration : 0;
          activityByDate[entryDate] += duration / (1000 * 60); // Convert ms to minutes
        } catch (error) {
          console.error("Error processing time entry:", error);
        }
      });
    }
    
    // Update activity data on each day
    Object.keys(daysByWeekday).forEach((dayOfWeekStr) => {
      const dayOfWeek = Number(dayOfWeekStr);
      daysByWeekday[dayOfWeek] = daysByWeekday[dayOfWeek].map(day => ({
        ...day,
        activity: activityByDate[day.dateString] || 0
      }));
    });
    
    return daysByWeekday;
  };
  
  const calendarData = getActivityData();
  
  // Get maximum activity for scaling
  const allActivities = Object.values(calendarData)
    .flat()
    .map(day => day.activity);
  
  const maxActivity = Math.max(...allActivities, 60); // Minimum max of 60 min
  
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
  
  // Number of columns (weeks)
  const numCols = 20;
  
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-max pb-2">
        {/* Main grid with labels */}
        <div className="grid grid-cols-[auto_repeat(20,1fr)] gap-1">
          {/* Top left empty cell */}
          <div className="w-8"></div>
          
          {/* Date labels at top */}
          {Array.from({ length: numCols }).map((_, colIndex) => {
            // Show date labels every fourth column
            if (colIndex % 4 === 0 && calendarData[1] && calendarData[1][colIndex]) {
              return (
                <div key={`date-${colIndex}`} className="text-xs text-center text-gray-500 dark:text-gray-400 mb-1">
                  {format(calendarData[1][colIndex].date, 'MMM d')}
                </div>
              );
            }
            return <div key={`date-${colIndex}`}></div>;
          })}
          
          {/* Day rows with labels */}
          {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => (
            <React.Fragment key={`row-${dayOfWeek}`}>
              {/* Day label */}
              <div className="text-xs flex items-center justify-end pr-2 text-gray-500 dark:text-gray-400">
                {daysTranslation[dayOfWeek]}
              </div>
              
              {/* Activity cells for this day */}
              {Array.from({ length: numCols }).map((_, colIndex) => {
                const day = calendarData[dayOfWeek] && calendarData[dayOfWeek][colIndex];
                return (
                  <div 
                    key={`cell-${dayOfWeek}-${colIndex}`}
                    className={`aspect-square w-full ${day ? getActivityColor(day.activity) : 'bg-transparent'} rounded`}
                    title={day ? `${format(day.date, 'MMM d')}: ${Math.round(day.activity)} min` : ''}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center mt-4 justify-end text-xs text-gray-500 dark:text-gray-400">
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
    </div>
  );
};
