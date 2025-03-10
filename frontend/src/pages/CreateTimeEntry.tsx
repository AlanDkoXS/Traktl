import { useTranslation } from 'react-i18next';
import { TimeEntryForm } from '../components/TimeEntryForm';

export const CreateTimeEntry = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {t('timeEntries.new')}
      </h1>
      
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <TimeEntryForm />
        </div>
      </div>
    </div>
  );
};
