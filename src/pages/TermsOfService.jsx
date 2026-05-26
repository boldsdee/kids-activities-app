import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', padding: '40px 20px', fontFamily: 'Outfit' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--bg-card)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border)' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', marginBottom: '30px' }}>
          <ArrowLeft size={20} /> Back to Home
        </button>
        
        <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>Terms of Service</h1>
        <p style={{ color: 'var(--text-soft)', marginBottom: '20px' }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <div style={{ lineHeight: 1.6, color: 'var(--text-soft)' }}>
          <h2 style={{ color: 'var(--text-main)', marginTop: '30px', fontSize: '20px' }}>1. Agreement to Terms</h2>
          <p>By accessing or using our Kids Activities Planner application, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>

          <h2 style={{ color: 'var(--text-main)', marginTop: '30px', fontSize: '20px' }}>2. Subscriptions</h2>
          <p>Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis (such as monthly or annually).</p>

          <h2 style={{ color: 'var(--text-main)', marginTop: '30px', fontSize: '20px' }}>3. Accounts</h2>
          <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>

          <h2 style={{ color: 'var(--text-main)', marginTop: '30px', fontSize: '20px' }}>4. Disclaimer</h2>
          <p>The activities provided are suggestions. Parents must supervise their children at all times during these activities. We are not liable for any injuries or damages resulting from participating in the activities listed on our platform.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
