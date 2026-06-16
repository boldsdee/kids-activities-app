import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { activities } from '../data/activities';
import { categories } from '../data/categories';
import ActivityCard from '../components/ActivityCard';
import { usePlanner } from '../context/PlannerContext';
import { useAuth } from '../context/AuthContext';
import CreateActivityModal from '../components/CreateActivityModal';
import { useNavigate } from 'react-router-dom';

const BUDGET_OPTIONS = [
  { label: 'All Budgets', value: 'all' },
  { label: '🆓 Free', value: '0' },
  { label: '💚 Under £20', value: '20' },
  { label: '💛 Under £50', value: '50' },
  { label: '🧡 Under £100', value: '100' },
  { label: '💜 Under £200', value: '200' },
];

const Library = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch]       = useState(searchParams.get('search') || '');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || 'all');
  const [selectedAge, setSelectedAge] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const { customActivities, addCustomActivity, editCustomActivity } = usePlanner();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isPro = currentUser?.isPro || false;

  const handleCreateClick = () => {
    if (!isPro) {
      navigate('/pricing');
      return;
    }
    setIsModalOpen(true);
  };

  const allActivities = useMemo(() => {
    return [...customActivities, ...activities].filter(Boolean);
  }, [activities, customActivities]);

  const filtered = useMemo(() => {
    return allActivities.filter(a => {
      if (!a) return false;
      if (selectedCat !== 'all' && a.category !== selectedCat) return false;
      if (selectedAge !== 'all' && (!a.ageRange || !String(a.ageRange).includes(selectedAge))) return false;
      if (search && (!a.title || !a.title.toLowerCase().includes(search.toLowerCase()))) return false;
      if (selectedBudget !== 'all') {
        const bud = a.budgetGBP ?? 0;
        if (selectedBudget === '0'   && bud !== 0)    return false;
        if (selectedBudget === '20'  && (bud === 0 || bud > 20))  return false;
        if (selectedBudget === '50'  && (bud === 0 || bud > 50))  return false;
        if (selectedBudget === '100' && (bud === 0 || bud > 100)) return false;
        if (selectedBudget === '200' && (bud === 0 || bud > 200)) return false;
      }
      return true;
    });
  }, [search, selectedCat, selectedAge, selectedBudget, allActivities]);

  const selStyle = {
    padding: '13px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)',
    background: '#22223A', color: '#F1F0FF', fontFamily: 'Outfit', cursor: 'pointer', fontSize: '14px', outline: 'none'
  };

  return (
    <div className="page library-page">
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '38px', background: 'linear-gradient(135deg, #A78BFA, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Activity Library 📚
        </h1>
        <p style={{ color: 'var(--text-soft)', fontSize: '17px', marginTop: '8px' }}>
          {filtered.length} activities — pick a category, age or budget!
        </p>
        <button
          onClick={handleCreateClick}
          style={{
            marginTop: '20px', padding: '12px 24px', borderRadius: '14px',
            background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer',
            fontFamily: 'Outfit', fontWeight: '600', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            display: 'inline-flex', alignItems: 'center', gap: '8px'
          }}
        >
          <span style={{ fontSize: '20px' }}>+</span> Create Activity
        </button>
      </header>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="🔍  Search activities…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} style={selStyle}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <select value={selectedAge} onChange={e => setSelectedAge(e.target.value)} style={selStyle}>
          <option value="all">Any Age</option>
          <option value="2">2+ yrs</option>
          <option value="3">3+ yrs</option>
          <option value="4">4+ yrs</option>
          <option value="5">5+ yrs</option>
          <option value="6">6+ yrs</option>
          <option value="7">7+ yrs</option>
          <option value="8">8+ yrs</option>
          <option value="9">9+ yrs</option>
          <option value="10">10+ yrs</option>
          <option value="11">11+ yrs</option>
          <option value="12">12+ yrs</option>
        </select>
      </div>

      {/* Budget chips */}
      <div className="budget-chips" style={{ marginBottom: '32px' }}>
        {BUDGET_OPTIONS.map(b => (
          <button
            key={b.value}
            className={`budget-chip ${selectedBudget === b.value ? 'active' : ''}`}
            onClick={() => setSelectedBudget(b.value)}
          >{b.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span>🔭</span>
          <h3>No activities found</h3>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px,1fr))', gap: '22px' }}>
          {filtered.map((a, index) => {
            const isLocked = !isPro && index >= 30;
            return (
              <ActivityCard 
                key={a.id} 
                activity={a} 
                isLocked={isLocked}
                onEdit={(act) => { setEditingActivity(act); setIsModalOpen(true); }} 
              />
            );
          })}
        </div>
      )}
      <div style={{ height: '100px' }} />

      <CreateActivityModal 
        isOpen={isModalOpen} 
        initialData={editingActivity}
        onClose={() => { setIsModalOpen(false); setEditingActivity(null); }} 
        onSave={(act) => {
          if (act.id) editCustomActivity(act);
          else addCustomActivity(act);
        }} 
      />
    </div>
  );
};

export default Library;
