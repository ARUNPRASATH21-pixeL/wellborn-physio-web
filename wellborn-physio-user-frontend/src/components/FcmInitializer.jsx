// src/components/FCMInitializer.jsx
import { useEffect } from 'react';
import { requestNotificationPermission, setupMessageListener } from '../firebase-config';
import { postData, API } from '../services/api';

export default function FCMInitializer() {
  useEffect(() => {
    const initializeFCM = async () => {
      // Get permission and token only once when app loads
      const token = await requestNotificationPermission();
      
      if (token) {
        console.log('✅ FCM Token obtained:', token.substring(0, 20) + '...');
        
        try {
          // Save to backend
          await postData(API.FCM_SAVE_TOKEN, {
            token: token,
            role: 'USER'
          });
          console.log('✅ FCM token registered with backend');
          
          // Setup foreground message listener
          setupMessageListener();
          console.log('✅ FCM message listener initialized');
          
        } catch (error) {
          console.error('❌ Error registering FCM token:', error);
        }
      } else {
        console.warn('⚠️ User denied notification permission');
      }
    };
    
    // Run only once on mount
    initializeFCM();
    
  }, []); // Empty dependency array - runs only on mount
  
  return null; // This component doesn't render anything
}