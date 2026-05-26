import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const PlannerContext = createContext();
export const usePlanner = () => useContext(PlannerContext);

const STORAGE_KEY = 'kidsActivitiesPlanner';
const FAVORITES_KEY = 'kidsActivitiesFavorites';
const SAVED_PLANS_KEY = 'kidsActivitiesSavedPlans';
const CUSTOM_ACTIVITIES_KEY = 'kidsActivitiesCustom';

const loadFromStorage = (key, fallback) => {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
  catch { return fallback; }
};

export const PlannerProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [plannedActivities, setPlannedActivities] = useState(() => loadFromStorage(STORAGE_KEY, {}));
  const [favorites, setFavorites] = useState(() => loadFromStorage(FAVORITES_KEY, []));
  const [savedPlans, setSavedPlans] = useState(() => loadFromStorage(SAVED_PLANS_KEY, []));
  const [customActivities, setCustomActivities] = useState(() => loadFromStorage(CUSTOM_ACTIVITIES_KEY, []));
  
  const isInitialLoad = useRef(true);

  // Load from Firestore on auth change
  useEffect(() => {
    const loadData = async () => {
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid, 'plannerData', 'default');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPlannedActivities(data.plannedActivities || {});
            setFavorites(data.favorites || []);
            setSavedPlans(data.savedPlans || []);
            setCustomActivities(data.customActivities || []);
          }
        } catch (error) {
          console.error("Error loading planner data from Firestore:", error);
        }
      }
    };
    loadData();
  }, [currentUser]);

  // Save to LocalStorage and Firestore
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plannedActivities));
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(savedPlans));
    localStorage.setItem(CUSTOM_ACTIVITIES_KEY, JSON.stringify(customActivities));

    if (currentUser) {
      // Debounce or directly save to Firestore
      const saveToFirestore = async () => {
        try {
          const docRef = doc(db, 'users', currentUser.uid, 'plannerData', 'default');
          await setDoc(docRef, {
            plannedActivities,
            favorites,
            savedPlans,
            customActivities,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (error) {
          console.error("Error saving planner data to Firestore:", error);
        }
      };
      
      // Skip the very first render save to avoid overwriting Firestore with empty local state before load
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
      } else {
        saveToFirestore();
      }
    }
  }, [plannedActivities, favorites, savedPlans, customActivities, currentUser]);

  const addToPlan = (dateKey, activity) => {
    setPlannedActivities(prev => {
      const existing = prev[dateKey] || [];
      if (existing.find(a => a.id === activity.id)) return prev;
      return { ...prev, [dateKey]: [...existing, activity] };
    });
  };

  const removeFromPlan = (dateKey, activityId) => {
    setPlannedActivities(prev => {
      const filtered = (prev[dateKey] || []).filter(a => a.id !== activityId);
      const next = { ...prev };
      if (filtered.length === 0) delete next[dateKey];
      else next[dateKey] = filtered;
      return next;
    });
  };

  const getActivitiesForDate = (dateKey) => plannedActivities[dateKey] || [];

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const isFavorite = (id) => favorites.includes(id);

  const savePlan = (name) => {
    const plan = { id: Date.now(), name, date: new Date().toISOString(), activities: { ...plannedActivities } };
    setSavedPlans(prev => [plan, ...prev]);
    return plan;
  };

  const loadPlan = (planId) => {
    const plan = savedPlans.find(p => p.id === planId);
    if (plan) setPlannedActivities(plan.activities);
  };

  const deletePlan = (planId) => {
    setSavedPlans(prev => prev.filter(p => p.id !== planId));
  };

  const clearPlan = () => setPlannedActivities({});

  const getTotalPlanned = () => Object.values(plannedActivities).reduce((sum, arr) => sum + arr.length, 0);

  const getWeekActivities = (startDate) => {
    const result = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      result[key] = plannedActivities[key] || [];
    }
    return result;
  };

  const addCustomActivity = (activity) => {
    const newActivity = {
      ...activity,
      id: `custom-${Date.now()}`,
      isCustom: true
    };
    setCustomActivities(prev => [newActivity, ...prev]);
  };

  const editCustomActivity = (updatedActivity) => {
    setCustomActivities(prev => prev.map(a => a.id === updatedActivity.id ? updatedActivity : a));
  };

  return (
    <PlannerContext.Provider value={{
      plannedActivities, addToPlan, removeFromPlan, getActivitiesForDate,
      favorites, toggleFavorite, isFavorite,
      savedPlans, savePlan, loadPlan, deletePlan, clearPlan,
      getTotalPlanned, getWeekActivities,
      customActivities, addCustomActivity, editCustomActivity
    }}>
      {children}
    </PlannerContext.Provider>
  );
};
