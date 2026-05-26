import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Sparkles, Map, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top right, #3A2E5D, #0F0F14)', color: '#fff', fontFamily: 'Outfit' }}>
      
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', background: 'linear-gradient(135deg, #A78BFA, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Kids Activities
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => navigate('/pricing')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontFamily: 'Outfit', fontSize: '16px' }}>Pricing</button>
          <button onClick={() => navigate('/login')} style={{ background: 'var(--primary)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 'bold' }}>Login</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ textAlign: 'center', padding: '100px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '56px', margin: '0 0 20px 0', lineHeight: 1.1 }}>
          Plan the perfect day for your kids in <span style={{ color: '#A78BFA' }}>seconds.</span>
        </h1>
        <p style={{ fontSize: '20px', color: 'var(--text-soft)', marginBottom: '40px', lineHeight: 1.5 }}>
          Access 200+ engaging activities, generate visual step-by-step guides, and download beautiful schedules. 
          No more wondering "What should we do today?"
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: '16px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)' }}>
            Start for Free <ArrowRight size={20} />
          </button>
        </div>
      </header>

      {/* Features */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '32px', borderRadius: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(167, 139, 250, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Sparkles color="#A78BFA" />
          </div>
          <h3 style={{ fontSize: '22px', margin: '0 0 12px 0' }}>200+ Activities</h3>
          <p style={{ color: 'var(--text-soft)', lineHeight: 1.5, margin: 0 }}>Discover arts, science, outdoor games, and more. All carefully curated for maximum engagement.</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '32px', borderRadius: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(96, 165, 250, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Map color="#60A5FA" />
          </div>
          <h3 style={{ fontSize: '22px', margin: '0 0 12px 0' }}>Visual Guides</h3>
          <p style={{ color: 'var(--text-soft)', lineHeight: 1.5, margin: 0 }}>Every activity comes with a beautiful, step-by-step vector illustrated guide that kids can follow along with.</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '32px', borderRadius: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Calendar color="#34D399" />
          </div>
          <h3 style={{ fontSize: '22px', margin: '0 0 12px 0' }}>Drag & Drop Planner</h3>
          <p style={{ color: 'var(--text-soft)', lineHeight: 1.5, margin: 0 }}>Easily plan your week. Export your custom schedule to beautiful spreadsheets or visual PDFs.</p>
        </div>

      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 20px', textAlign: 'center', color: 'var(--text-soft)' }}>
        <p>© {new Date().getFullYear()} Kids Activities Planner. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
          <button onClick={() => navigate('/terms')} style={{ background: 'none', border: 'none', color: 'var(--text-soft)', cursor: 'pointer' }}>Terms of Service</button>
          <button onClick={() => navigate('/privacy')} style={{ background: 'none', border: 'none', color: 'var(--text-soft)', cursor: 'pointer' }}>Privacy Policy</button>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
