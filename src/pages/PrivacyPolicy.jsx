import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', padding: '40px 20px', fontFamily: 'Outfit' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--bg-card)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border)' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', marginBottom: '30px' }}>
          <ArrowLeft size={20} /> Back to Home
        </button>
        
        <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-soft)', marginBottom: '20px' }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <div style={{ lineHeight: 1.6, color: 'var(--text-soft)' }}>
          <h2 style={{ color: 'var(--text-main)', marginTop: '30px', fontSize: '20px' }}>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, password, and payment method.</p>

          <h2 style={{ color: 'var(--text-main)', marginTop: '30px', fontSize: '20px' }}>2. How We Use Your Information</h2>
          <p>We may use the information we collect about you to provide, maintain, and improve our services, including to process transactions, send related information, and provide customer support.</p>

          <h2 style={{ color: 'var(--text-main)', marginTop: '30px', fontSize: '20px' }}>3. Data Storage and Security</h2>
          <p>Your data is stored securely in our cloud infrastructure. We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing.</p>

          <h2 style={{ color: 'var(--text-main)', marginTop: '30px', fontSize: '20px' }}>4. Third-Party Services</h2>
          <p>We use third-party services (like Firebase for authentication and Stripe for payments) which may collect information as dictated by their own privacy policies.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
