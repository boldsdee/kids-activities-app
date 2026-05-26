import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';

const PricingPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'customers', currentUser.uid, 'checkout_sessions'), {
        // NOTE TO CREATOR: Replace 'price_XXXX' with your actual Stripe Price ID
        price: 'price_1TbFmzBL4fVsRdQTKk664AOE', 
        success_url: window.location.origin + '/app/settings',
        cancel_url: window.location.origin + '/pricing',
      });

      // Wait for the Stripe Extension to attach the checkout URL
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
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Failed to start checkout. Please ensure you have configured the Stripe Extension.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top right, #3A2E5D, #0F0F14)', color: '#fff', fontFamily: 'Outfit', padding: '40px 20px' }}>
      
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Nav */}
        <button 
          onClick={() => navigate('/')} 
          style={{ background: 'none', border: 'none', color: '#A78BFA', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', marginBottom: '40px' }}
        >
          <ArrowLeft size={20} /> Back to Home
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 16px 0' }}>Simple, transparent pricing</h1>
          <p style={{ fontSize: '18px', color: 'var(--text-soft)', maxWidth: '600px', margin: '0 auto' }}>
            Start for free, upgrade when you need more. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'flex-start' }}>
          
          {/* Free Tier */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px' }}>
            <h3 style={{ fontSize: '24px', margin: '0 0 8px 0', color: '#E2E8F0' }}>Starter</h3>
            <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '8px' }}>
              $0<span style={{ fontSize: '18px', color: 'var(--text-soft)', fontWeight: 'normal' }}>/forever</span>
            </div>
            <p style={{ color: 'var(--text-soft)', marginBottom: '32px' }}>Perfect for parents wanting to try it out.</p>
            
            <button 
              onClick={() => navigate('/login')}
              style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '32px' }}
            >
              Get Started
            </button>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="#34D399" /> 30 Core Activities</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="#34D399" /> Drag & Drop Planner</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="#34D399" /> Basic Cloud Sync</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-soft)' }}><X size={20} color="#EF4444" opacity={0.5} /> Custom Activity Creation</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-soft)' }}><X size={20} color="#EF4444" opacity={0.5} /> Export/Download Plans</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-soft)' }}><X size={20} color="#EF4444" opacity={0.5} /> Premium Bible & Science Kits</li>
            </ul>
          </div>

          {/* Premium Tier */}
          <div style={{ background: 'var(--bg-card)', border: '2px solid #A78BFA', borderRadius: '24px', padding: '40px', position: 'relative', boxShadow: '0 20px 40px rgba(167, 139, 250, 0.15)' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #A78BFA, #60A5FA)', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Most Popular
            </div>

            <h3 style={{ fontSize: '24px', margin: '0 0 8px 0', color: '#A78BFA' }}>Premium</h3>
            <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '8px' }}>
              $5<span style={{ fontSize: '18px', color: 'var(--text-soft)', fontWeight: 'normal' }}>/month</span>
            </div>
            <p style={{ color: 'var(--text-soft)', marginBottom: '32px' }}>Unlock the ultimate planning experience.</p>
            
            <button 
              onClick={handleSubscribe}
              disabled={loading}
              style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--primary)', border: 'none', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '32px', boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Starting Secure Checkout...' : 'Subscribe Now'}
            </button>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="#34D399" /> <strong>All 200+ Activities</strong></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="#34D399" /> <strong>Unlimited Custom Activities</strong></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="#34D399" /> <strong>Download Visual PDFs & Sheets</strong></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="#34D399" /> Premium Bible & Science Kits</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="#34D399" /> Drag & Drop Planner</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Check size={20} color="#34D399" /> Full Device Sync</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PricingPage;
