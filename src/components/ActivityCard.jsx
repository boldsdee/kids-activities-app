import React, { useState } from 'react';
import { categories } from '../data/categories';
import { usePlanner } from '../context/PlannerContext';

import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const categoryMap = {};
categories.forEach(c => { categoryMap[c.id] = c; });

const budgetLabel = (gbp) => {
  if (gbp === undefined || gbp === null) return null;
  if (gbp === 0) return '🆓 Free';
  if (gbp <= 20)  return `💚 ~£${gbp}`;
  if (gbp <= 50)  return `💛 ~£${gbp}`;
  if (gbp <= 100) return `🧡 ~£${gbp}`;
  return `💜 ~£${gbp}`;
};

const ActivityCard = ({ activity, compact, onDragStart, showAdd, targetDate, onEdit, isLocked }) => {
  const [expanded, setExpanded] = useState(false);
  const { toggleFavorite, isFavorite, addToPlan } = usePlanner();
  const navigate = useNavigate();
  const cat = categoryMap[activity.category] || {};
  const bLabel = budgetLabel(activity.budgetGBP);

  const renderTextWithLinks = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.(?:com|org|net|edu|gov|io)[^\s]*)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        let cleanPart = part;
        const punctuationMatch = cleanPart.match(/([.,!?;:)]+)$/);
        let trailing = '';
        if (punctuationMatch) {
          trailing = punctuationMatch[1];
          cleanPart = cleanPart.slice(0, -trailing.length);
        }
        let href = cleanPart;
        if (!href.startsWith('http')) href = 'https://' + href;
        
        return (
          <React.Fragment key={i}>
            <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#60A5FA', textDecoration: 'underline' }}>{cleanPart}</a>
            {trailing}
          </React.Fragment>
        );
      }
      return part;
    });
  };

  const handleDragStart = (e) => {
    if (isLocked) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('application/json', JSON.stringify(activity));
    e.dataTransfer.effectAllowed = 'copy';
    if (onDragStart) onDragStart(activity);
  };

  const handleAdd = () => {
    if (isLocked) {
      navigate('/pricing');
      return;
    }
    if (targetDate) addToPlan(targetDate, activity);
  };

  const handleExpand = () => {
    if (isLocked) {
      navigate('/pricing');
      return;
    }
    setExpanded(!expanded);
  };

  return (
    <div
      className={`activity-card ${compact ? 'compact' : ''}`}
      style={{ '--cat-color': cat.color || '#A78BFA' }}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="card-cat-icon">{cat.icon}</div>

      <div className="card-meta">
        <span className="card-cat-name">{cat.name}</span>
        <h3 className="card-title">{activity.title}</h3>
      </div>

      <div className="card-pills" style={{ marginTop: '12px' }}>
        <span className="pill">👶 {activity.ageRange} yrs</span>
        <span className="pill">⏱️ {activity.duration}</span>
        {activity.difficulty && <span className="pill">⚡ {activity.difficulty}</span>}
        {bLabel && <span className="pill budget">{bLabel}</span>}
        {activity.isPaid && <span className="pill" style={{ background: '#F59E0B', color: '#FFF' }}>⭐ Premium</span>}
      </div>

      {!compact && (
        <>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              style={{ padding: '9px 18px', fontSize: '13px', background: isLocked ? 'rgba(255,255,255,0.05)' : 'var(--primary)', color: isLocked ? 'var(--text-soft)' : '#fff', border: isLocked ? '1px solid rgba(255,255,255,0.1)' : 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={handleExpand}
            >
              {isLocked ? <><Lock size={14} /> Premium Activity</> : (expanded ? '✕ Close' : '▶ How to play')}
            </button>
            <button
              onClick={() => toggleFavorite(activity.id)}
              style={{
                background: isFavorite(activity.id) ? '#F472B6' : 'var(--bg-raised)',
                border: '1px solid var(--border)', padding: '9px 14px', borderRadius: '12px',
                cursor: 'pointer', fontSize: '18px', color: isFavorite(activity.id) ? 'white' : 'var(--text-soft)',
                transition: '0.3s'
              }}
            >
              {isFavorite(activity.id) ? '❤️' : '🤍'}
            </button>
            {activity.isCustom && onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(activity); }}
                style={{
                  background: 'var(--bg-raised)', border: '1px solid rgba(255,255,255,0.1)',
                  padding: '9px 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px',
                  color: 'var(--text-soft)', transition: '0.3s', marginLeft: 'auto'
                }}
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {expanded && (
            <div className="card-details">
              <strong>What you'll need:</strong>
              <p>{Array.isArray(activity.materials) ? activity.materials.join(', ') : activity.materials}</p>
              <strong style={{ marginTop: '14px' }}>Steps:</strong>
              <p>{renderTextWithLinks(activity.instructions)}</p>
            </div>
          )}
        </>
      )}

      {showAdd && targetDate && (
        <button
          className="btn-primary"
          style={{ width: '100%', marginTop: '16px', background: 'var(--p-mint)', color: '#0F0F14' }}
          onClick={handleAdd}
        >
          + Add to Plan
        </button>
      )}
    </div>
  );
};

export default ActivityCard;
