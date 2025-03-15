import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { GoogleLogo } from './GoogleLogo';

interface GoogleLoginButtonProps {
  isLogin?: boolean;
}

export const GoogleLoginButton = ({ isLogin = true }: GoogleLoginButtonProps) => {
  const { t } = useTranslation();
  const { loginWithGoogle } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Load the Google Identity Services script
      await loadGoogleScript();
      
      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });
      
      // Prompt the Google One Tap UI
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Try manual prompt
          console.log('One Tap was skipped or not displayed, falling back to manual prompt');
          window.google.accounts.id.renderButton(
            document.getElementById('google-login-button')!,
            { theme: 'outline', size: 'large', width: '100%' }
          );
        }
      });
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
      setIsLoading(false);
    }
  };

  const handleGoogleResponse = async (response: any) => {
    console.log('Google response received');
    try {
      // Call your backend with the token
      await loginWithGoogle(response.credential);
      console.log('Google login successful');
    } catch (error) {
      console.error('Error with Google authentication:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load Google Identity Services script
  const loadGoogleScript = () => {
    return new Promise<void>((resolve, reject) => {
      if (document.getElementById('google-identity-script')) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-identity-script';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google script'));
      document.body.appendChild(script);
    });
  };

  return (
    <div>
      <button
        type="button"
        className="w-full flex justify-center items-center gap-2 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md transition-colors dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        id="google-login-button"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-t-2 border-transparent border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin" />
        ) : (
          <GoogleLogo className="w-5 h-5" />
        )}
        {isLogin ? t('auth.signInWithGoogle') : t('auth.signUpWithGoogle')}
      </button>
    </div>
  );
};
