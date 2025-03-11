import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TagList } from '../components/tag/TagList';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useTagStore } from '../store/tagStore';

export const Tags = () => {
  const { t } = useTranslation();
  const { clearSelectedTag } = useTagStore();
  
  useEffect(() => {
    clearSelectedTag();
  }, [clearSelectedTag]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {t('tags.title')}
        </h1>
        <Link to="/tags/new" className="btn btn-primary">
          <PlusIcon className="h-5 w-5 mr-1" />
          {t('tags.new')}
        </Link>
      </div>

      <TagList />
    </div>
  );
};
