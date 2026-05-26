import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Key, CreditCard, Shield } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

const SettingsPage = () => {
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const isPro = currentUser?.isPro || false; 
  const isAdmin = currentUser?.isAdmin || false;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleStripeAction = async () => {
    setLoading(true);
    try {
      if (isPro) {
        // Open Customer Portal to manage subscription
        const functions = getFunctions();
        const functionRef = httpsCallable(functions, 'ext-firestore-stripe-payments-createPortalLink');
        const { data } = await functionRef({ returnUrl: window.location.origin + '/app/settings' });
        window.location.assign(data.url);
      } else {
        // Open Checkout Session to upgrade
        const docRef = await addDoc(collection(db, 'customers', currentUser.uid, 'checkout_sessions'), {
          price: 'price_1TbFmzBL4fVsRdQTKk664AOE', // NOTE TO CREATOR: Replace with actual price ID
          success_url: window.location.origin + '/app/settings',
          cancel_url: window.location.origin + '/app/settings',
        });
        
        onSnapshot(docRef, (snap) => {
          const { error, url } = snap.data();
          if (error) {
            alert(`An error occurred: ${error.message}`);
            setLoading(false);
          }
          if (url) {
            window.location.assign(url);
          }
        });
      }
    } catch (error) {
      console.error("Stripe action failed:", error);
      alert("Action failed. Please ensure the Firebase Stripe Extension is properly configured.");
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Outfit' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '24px', color: 'var(--text-main)' }}>Account Settings</h1>
      
      {/* Profile Section */}
      <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={20} color="var(--primary)" /> Profile Information
        </h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-soft)', marginBottom: '4px', fontSize: '14px' }}>Email Address</label>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)' }}>
              {currentUser?.email}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-soft)', marginBottom: '4px', fontSize: '14px' }}>Account Status</label>
            <div style={{ display: 'inline-block', padding: '6px 12px', background: isPro ? 'rgba(167, 139, 250, 0.2)' : 'rgba(255, 255, 255, 0.1)', color: isPro ? '#A78BFA' : 'var(--text-main)', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }}>
              {isPro ? '🌟 Premium Plan' : 'Free Plan'}
            </div>
          </div>
        </div>
      </div>

      {/* Billing Section */}
      <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={20} color="var(--primary)" /> Subscription & Billing
        </h2>
        <p style={{ color: 'var(--text-soft)', marginBottom: '20px', lineHeight: 1.5 }}>
          {isAdmin 
            ? "You are an Admin. You automatically receive unlimited access to all activities and features."
            : isPro 
              ? "You are currently on the Premium Plan. You have unlimited access to all activities and custom creations." 
              : "You are currently on the Free Plan. Upgrade to access all 200+ activities, custom creation, and downloads."}
        </p>
        {!isAdmin && (
          <button 
            onClick={handleStripeAction}
            disabled={loading}
            style={{ padding: '12px 24px', borderRadius: '12px', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Processing...' : isPro ? 'Manage Subscription' : 'Upgrade to Premium'}
          </button>
        )}
      </div>

      {/* Admin Panel Link */}
      {isAdmin && (
        <div style={{ background: 'rgba(96, 165, 250, 0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(96, 165, 250, 0.2)', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} /> Administrator Access
          </h2>
          <p style={{ color: 'var(--text-soft)', marginBottom: '20px', lineHeight: 1.5 }}>
            You have super admin access. You can manage users and configure the application from the Admin Portal.
          </p>
          <button 
            onClick={() => window.location.href = '/admin'}
            style={{ padding: '12px 24px', borderRadius: '12px', background: 'rgba(96, 165, 250, 0.1)', color: '#60A5FA', border: '1px solid rgba(96, 165, 250, 0.2)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Shield size={18} /> Open Admin Portal
          </button>
        </div>
      )}

      {/* Danger Zone */}
      <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key size={20} /> Account Actions
        </h2>
        <button 
          onClick={handleLogout}
          style={{ padding: '12px 24px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <LogOut size={18} /> Log Out
        </button>
      </div>

    </div>
  );
};

export default SettingsPage;
