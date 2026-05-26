import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    
    // Create Firestore Profile
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      displayName,
      isPro: false,
      isAdmin: false,
      createdAt: new Date().toISOString()
    });

    return userCredential;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Check if user document exists, if not create it
    const userRef = doc(db, 'users', result.user.uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      await setDoc(userRef, {
        email: result.user.email,
        displayName: result.user.displayName,
        isPro: false,
        isAdmin: false,
        createdAt: new Date().toISOString()
      });
    }

    return result;
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    let unsubscribeProfile;
    let unsubscribeSubscriptions;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 1. Listen to the user's main profile (for isAdmin)
        const userRef = doc(db, 'users', user.uid);
        unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const isAdmin = data.isAdmin || false;
            
            // 2. Listen to Stripe subscriptions subcollection
            const subsRef = collection(db, 'customers', user.uid, 'subscriptions');
            const q = query(subsRef, where('status', 'in', ['trialing', 'active']));
            
            unsubscribeSubscriptions = onSnapshot(q, (subSnap) => {
              const hasActiveSubscription = !subSnap.empty;
              
              // A user is Pro if they are an admin OR they have an active Stripe subscription
              const isPro = isAdmin || hasActiveSubscription || (data.isPro || false); 
              
              setCurrentUser({
                ...user,
                isAdmin,
                isPro,
                profileData: data
              });
              setLoading(false);
            }, (error) => {
              console.error("Subscription listener error:", error);
              // Gracefully degrade if rules block access
              setCurrentUser({ ...user, isAdmin, isPro: isAdmin || (data.isPro || false), profileData: data });
              setLoading(false);
            });
          } else {
            setCurrentUser({ ...user, isPro: false, isAdmin: false });
            setLoading(false);
          }
        }, (error) => {
          console.error("Profile listener error:", error);
          setCurrentUser({ ...user, isPro: false, isAdmin: false });
          setLoading(false);
        });
      } else {
        setCurrentUser(null);
        setLoading(false);
        if (unsubscribeProfile) unsubscribeProfile();
        if (unsubscribeSubscriptions) unsubscribeSubscriptions();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeSubscriptions) unsubscribeSubscriptions();
    };
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
