import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { categories } from '../data/categories';
import { activities } from '../data/activities';
import ActivityCard from '../components/ActivityCard';
import { usePlanner } from '../context/PlannerContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { customActivities } = usePlanner();
  const { currentUser } = useAuth();
  const isPro = currentUser?.isPro || false;

  const category = useMemo(() => categories.find(c => c.id === categoryId), [categoryId]);

  const allActivities = useMemo(() => {
    return [...customActivities, ...activities].filter(Boolean);
  }, [activities, customActivities]);

  const categoryActivities = useMemo(() => {
    return allActivities.filter(a => a && a.category === categoryId);
  }, [allActivities, categoryId]);

  if (!category) {
    return (
      <div className="page" style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Category Not Found</h2>
        <button onClick={() => navigate('/app')} className="btn-primary" style={{ marginTop: '20px' }}>
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="page category-page">
      {/* Dynamic Themed Hero Banner */}
      <header style={{ 
        background: `linear-gradient(135deg, ${category.color}33, rgba(0,0,0,0.5))`,
        borderBottom: `2px solid ${category.color}66`,
        padding: '60px 20px',
        margin: '-20px -20px 40px -20px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <button 
          onClick={() => navigate('/app')}
          style={{
            position: 'absolute', top: '20px', left: '20px',
            background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', padding: '10px 16px', borderRadius: '12px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            fontFamily: 'Outfit', fontWeight: 'bold'
          }}
        >
          <ArrowLeft size={18} /> Back
        </button>

        <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>
          {category.icon}
        </span>
        <h1 style={{ fontSize: '42px', color: '#fff', marginBottom: '8px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          {category.name}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
          Explore {categoryActivities.length} amazing {category.name.toLowerCase()} activities for your little ones.
        </p>
      </header>

      {categoryActivities.length === 0 ? (
        <div className="empty-state">
          <span>🔭</span>
          <h3>No activities found in this category</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px,1fr))', gap: '22px' }}>
          {categoryActivities.map((a, index) => {
            const isLocked = !isPro && index >= 30;
            return (
              <ActivityCard 
                key={a.id} 
                activity={a} 
                isLocked={isLocked}
              />
            );
          })}
        </div>
      )}
      
      <div style={{ height: '100px' }} />
    </div>
  );
};

export default CategoryPage;
