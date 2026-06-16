import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup, loginWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
        setIsLogin(true);
        setSuccess('Account created! Please check your inbox for a verification link before logging in.');
        setPassword(''); // Clear password for safety
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
    setLoading(false);
  };

  const pageStyle = {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'radial-gradient(circle at top right, #3A2E5D, #0F0F14)',
    padding: '20px',
    boxSizing: 'border-box'
  };

  const contentStyle = {
    background: 'rgba(26, 26, 46, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(12px)'
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px', marginBottom: '16px',
    borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.05)', color: '#F1F0FF',
    fontFamily: 'Outfit', fontSize: '15px', boxSizing: 'border-box'
  };

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', margin: '0 0 8px 0', background: 'linear-gradient(135deg, #A78BFA, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Kids Activities
          </h1>
          <p style={{ color: 'var(--text-soft)', margin: 0, fontSize: '15px' }}>
            {isLogin ? 'Log in to continue your adventure' : 'Create an account to start planning'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', lineHeight: '1.4' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6EE7B7', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', lineHeight: '1.4' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input 
              style={inputStyle} type="text" placeholder="Your Name" 
              value={name} onChange={e => setName(e.target.value)} required 
            />
          )}
          <input 
            style={inputStyle} type="email" placeholder="Email Address" 
            value={email} onChange={e => setEmail(e.target.value)} required 
          />
          <input 
            style={inputStyle} type="password" placeholder="Password" 
            value={password} onChange={e => setPassword(e.target.value)} required 
          />

          <button 
            type="submit" disabled={loading}
            style={{ 
              width: '100%', padding: '14px', borderRadius: '14px', 
              background: 'var(--primary)', color: '#fff', border: 'none', 
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Outfit', fontWeight: '600', 
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)', fontSize: '16px', opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ padding: '0 10px', color: 'var(--text-soft)', fontSize: '12px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <button 
          onClick={handleGoogleLogin} disabled={loading}
          style={{ 
            width: '100%', padding: '14px', borderRadius: '14px', 
            background: 'rgba(255, 255, 255, 0.05)', color: '#F1F0FF', border: '1px solid rgba(255, 255, 255, 0.1)', 
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Outfit', fontWeight: '600', 
            fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            opacity: loading ? 0.7 : 1
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-soft)', fontSize: '14px' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
            style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontFamily: 'Outfit', fontSize: '14px', padding: 0 }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
