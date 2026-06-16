import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../data/categories';
import { activities } from '../data/activities';
import { usePlanner } from '../context/PlannerContext';

const todayKey = new Date().toISOString().split('T')[0];

const CAT_GLOWS = {
  arts: 'rgba(255,107,53,0.35)', science: 'rgba(123,47,247,0.35)', outdoor: 'rgba(0,200,83,0.35)',
  cooking: 'rgba(255,64,129,0.35)', music: 'rgba(0,188,212,0.35)', stories: 'rgba(255,152,0,0.35)',
  building: 'rgba(121,85,72,0.35)', nature: 'rgba(76,175,80,0.35)', mindfulness: 'rgba(156,39,176,0.35)', physical: 'rgba(244,67,54,0.35)'
};

const Home = () => {
  const { getActivitiesForDate, getTotalPlanned } = usePlanner();
  const todayActivities = getActivitiesForDate(todayKey);

  const randomActivity = React.useMemo(() => activities[Math.floor(Math.random() * activities.length)], []);

  const catMap = React.useMemo(() => {
    const m = {}; categories.forEach(c => { m[c.id] = c; }); return m;
  }, []);

  return (
    <div className="page home-page">
      {/* Hero */}
      <header className="home-hero">
        <div className="hero-content">
          <h1>Hello, Adventurer! 🌈</h1>
          <p>Ready to plan some magic? {activities.length}+ activities for curious little explorers.</p>
        </div>
        <div className="hero-stats">
          <div className="stat-card"><span className="stat-num">{activities.length}</span><span className="stat-label">Activities</span></div>
          <div className="stat-card"><span className="stat-num">{todayActivities.length}</span><span className="stat-label">Today</span></div>
          <div className="stat-card"><span className="stat-num">{getTotalPlanned()}</span><span className="stat-label">Planned</span></div>
        </div>
      </header>

      {/* Categories */}
      <section style={{ marginBottom: '52px' }}>
        <h2 className="section-heading">Explore Categories 🎒</h2>
        <div className="cat-grid">
          {categories.map(cat => (
            <Link
              to={`/app/category/${cat.id}`}
              key={cat.id}
              className="cat-card"
              style={{ '--cat-color': cat.color, '--cat-glow': CAT_GLOWS[cat.id] || 'rgba(167,139,250,0.35)' }}
            >
              <span className="cat-icon">{cat.icon}</span>
              <h3>{cat.name}</h3>
              <p>{activities.filter(a => a.category === cat.id).length} Ideas</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Today's plan */}
      <section style={{ marginBottom: '120px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <h2 className="section-heading" style={{ marginBottom: 0 }}>Today's Magic ✨</h2>
          {todayActivities.length > 0 && (
            <Link to="/app/planner" style={{ color: 'var(--p-purple)', fontWeight: 'bold', textDecoration: 'none', fontSize: '15px' }}>
              Open Planner →
            </Link>
          )}
        </div>

        {todayActivities.length === 0 ? (
          <div className="empty-state">
            <span>🎨</span>
            <h3>Nothing planned yet!</h3>
            <p>Start by picking a fun activity from the library.</p>
            <Link to="/app/library" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>Browse Library</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '18px' }}>
            {todayActivities.filter(Boolean).map(a => (
              <div key={a.id} style={{
                background: 'var(--bg-card)', padding: '20px', borderRadius: '20px',
                boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: '14px',
                border: '1px solid var(--border)',
                borderLeft: `6px solid ${catMap[a.category]?.color || '#A78BFA'}`
              }}>
                <span style={{ fontSize: '30px' }}>{catMap[a.category]?.icon || '✨'}</span>
                <div>
                  <h4 style={{ fontSize: '17px', marginBottom: '4px' }}>{a.title}</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-soft)' }}>{a.duration} • {catMap[a.category]?.name || 'Activity'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
