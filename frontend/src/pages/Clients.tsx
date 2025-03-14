import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ClientList } from '../components/ClientList';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useClientStore } from '../store/clientStore';
import { resetProjectColor } from '../utils/dynamicColors';

export const Clients = () => {
  const { t } = useTranslation();
  const { clearSelectedClient } = useClientStore();
  
  // Clear selected client when entering the clients list
  useEffect(() => {
    clearSelectedClient();
    resetProjectColor(); // Ensure colors are reset when entering page
    
    return () => {
      resetProjectColor(); // Also reset on unmount
    };
  }, [clearSelectedClient]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold dynamic-color">
          {t('clients.title')}
        </h1>
        <Link to="/clients/new" className="btn btn-primary">
          <PlusIcon className="h-5 w-5 mr-1" />
          {t('clients.new')}
        </Link>
      </div>

      <ClientList />
    </div>
  );
};
