import { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/firebaseService';
import { User as FirebaseUser } from 'firebase/auth';

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error getting current user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return { currentUser, loading, userId: currentUser?.uid || 'user_1' }; // Fallback to user_1 for development
};
