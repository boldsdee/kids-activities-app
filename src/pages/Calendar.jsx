import React, { useState } from 'react';
import { categories } from '../data/categories';
import { usePlanner } from '../context/PlannerContext';
import { filterActivitiesForDate, paidAllowedOnDate, isUKBankHoliday } from '../utils/activityFilters';

const catMap = {};
categories.forEach(c => { catMap[c.id] = c; });

const Calendar = () => {
  const { getActivitiesForDate, addToPlan } = usePlanner();
  const [view, setView] = useState('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeActivity, setActiveActivity] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  const navigate = (dir) => {
    const d = new Date(currentDate);
    if (view === 'monthly') d.setMonth(d.getMonth() + dir);
    else if (view === 'weekly') d.setDate(d.getDate() + dir * 7);
    else if (view === 'daily') d.setDate(d.getDate() + dir);
    else d.setFullYear(d.getFullYear() + dir);
    setCurrentDate(d);
  };

  const handleDrop = (e, dateKey) => {
    e.preventDefault();
    try { addToPlan(dateKey, JSON.parse(e.dataTransfer.getData('application/json'))); } catch {}
  };

  const getDateKey = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const todayKey = new Date().toISOString().split('T')[0];

  const renderMonthly = () => (
    <div className="cal-grid">
      {dayLabels.map(d => <div key={d} className="cal-header-cell">{d}</div>)}
      {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} className="cal-cell empty" />)}
      {Array.from({ length: daysInMonth }).map((_, i) => {
        const day = i + 1;
        const dateKey = getDateKey(day);
        const allActs = getActivitiesForDate(dateKey);
        const dayActs = filterActivitiesForDate(allActs, dateKey);
        const isToday = dateKey === todayKey;
        const paidDay = paidAllowedOnDate(dateKey);
        const bankHoliday = isUKBankHoliday(dateKey);
        return (
          <div key={day} className={`cal-cell ${isToday ? 'today' : ''}`}
            onDrop={(e) => handleDrop(e, dateKey)} onDragOver={(e) => e.preventDefault()}>
            <span className="cal-day-num">
              {day}
              {bankHoliday && <span className="day-bank-badge" title="UK Bank Holiday">🇬🇧</span>}
              {!bankHoliday && paidDay && <span className="day-bank-badge" title="Paid activities allowed today">💷</span>}
            </span>
            <div className="cal-items">
              {dayActs.slice(0, 3).map(a => (
                <div key={a.id} className="cal-item"
                  style={{ background: catMap[a.category]?.color + '33', color: catMap[a.category]?.color }}
                  onClick={() => setActiveActivity(a)}
                  title="Click to see how it works">
                  <span className="cal-item-icon">{catMap[a.category]?.icon}</span>
                  <span className="cal-item-label">{a.title}</span>
                </div>
              ))}
              {dayActs.length > 3 && <span className="cal-more">+{dayActs.length - 3} more</span>}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderWeekly = () => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const mon = new Date(d); mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    const dates = Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(mon); dd.setDate(mon.getDate() + i);
      return dd;
    });
    return (
      <div className="week-view">
        {dates.map((dd, i) => {
          const dk = dd.toISOString().split('T')[0];
          const allActs = getActivitiesForDate(dk);
          const acts = filterActivitiesForDate(allActs, dk);
          return (
            <div key={dk} className={`week-col ${dk === todayKey ? 'today' : ''}`}
              onDrop={(e) => handleDrop(e, dk)} onDragOver={(e) => e.preventDefault()}>
              <div className="week-col-header">
                <span>{dayLabels[i]}</span>
                <span className="week-col-num">{dd.getDate()}</span>
                {isUKBankHoliday(dk) && <span style={{ fontSize: '10px' }} title="UK Bank Holiday">🇬🇧</span>}
              </div>
              {acts.map(a => (
                <div key={a.id} className="week-act"
                  style={{ background: catMap[a.category]?.color + '22', borderLeft: `3px solid ${catMap[a.category]?.color}`, cursor: 'pointer' }}
                  onClick={() => setActiveActivity(a)}
                  title="Click to see how it works">
                  {catMap[a.category]?.icon} {a.title}
                </div>
              ))}
              {acts.length === 0 && <span className="week-empty-cell">No activities</span>}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDaily = () => {
    const dk = currentDate.toISOString().split('T')[0];
    const allActs = getActivitiesForDate(dk);
    const acts = filterActivitiesForDate(allActs, dk);
    const bankHoliday = isUKBankHoliday(dk);
    const paidDay = paidAllowedOnDate(dk);
    return (
      <div className="daily-view" onDrop={(e) => handleDrop(e, dk)} onDragOver={(e) => e.preventDefault()}>
        <h2>
          {currentDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          {bankHoliday && <span style={{ marginLeft: '10px', fontSize: '14px', color: 'var(--p-yellow)' }}>🇬🇧 Bank Holiday — paid activities available!</span>}
          {!bankHoliday && paidDay && <span style={{ marginLeft: '10px', fontSize: '14px', color: 'var(--p-yellow)' }}>💷 Paid activities available today</span>}
        </h2>
        {acts.length === 0 ? (
          <div className="empty-state"><span>📅</span><p>No activities planned. Drag some here!</p></div>
        ) : acts.map((a, i) => (
          <div key={a.id} className="daily-item"
            style={{ '--cat-color': catMap[a.category]?.color, cursor: 'pointer' }}
            onClick={() => setActiveActivity(a)}
            title="Click to see how it works">
            <span className="daily-num">{i + 1}</span>
            <span className="daily-icon">{catMap[a.category]?.icon}</span>
            <div><strong>{a.title}</strong><p>{a.duration} · Ages {a.ageRange}</p></div>
            <span className="pill duration">{a.difficulty}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderYearly = () => (
    <div className="yearly-grid">
      {monthNames.map((mName, mIdx) => {
        const dim = new Date(year, mIdx + 1, 0).getDate();
        let total = 0;
        for (let d = 1; d <= dim; d++) total += getActivitiesForDate(`${year}-${String(mIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`).length;
        return (
          <div key={mIdx} className="year-month" onClick={() => { setCurrentDate(new Date(year, mIdx, 1)); setView('monthly'); }}>
            <h3>{mName}</h3>
            <span className={`year-count ${total > 0 ? 'has-items' : ''}`}>{total} planned</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="page calendar-page">
        <header className="cal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '48px' }}>📅</span>
            <h1 style={{ fontSize: '36px', color: 'var(--p-purple)' }}>Calendar</h1>
          </div>
          <div className="cal-controls">
            <div className="view-toggle">
              {['daily','weekly','monthly','yearly'].map(v => (
                <button key={v} className={view === v ? 'active' : ''} onClick={() => setView(v)}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            <div className="nav-arrows">
              <button onClick={() => navigate(-1)}>◀</button>
              <span className="cal-title">
                {view === 'yearly' ? year : view === 'daily'
                  ? currentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : `${monthNames[month]} ${year}`}
              </span>
              <button onClick={() => navigate(1)}>▶</button>
            </div>
          </div>
        </header>
        {view === 'monthly' && renderMonthly()}
        {view === 'weekly' && renderWeekly()}
        {view === 'daily' && renderDaily()}
        {view === 'yearly' && renderYearly()}
      </div>

      {/* Activity Quick-View Popup */}
      {activeActivity && (
        <div className="activity-popup-overlay" onClick={() => setActiveActivity(null)}>
          <div className="activity-popup" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setActiveActivity(null)}>✕</button>
            <div className="popup-header">
              <span className="popup-icon" style={{ color: catMap[activeActivity.category]?.color }}>
                {catMap[activeActivity.category]?.icon}
              </span>
              <div>
                <span className="popup-cat" style={{ color: catMap[activeActivity.category]?.color }}>
                  {catMap[activeActivity.category]?.name}
                </span>
                <h3 className="popup-title">{activeActivity.title}</h3>
              </div>
            </div>
            <div className="popup-pills">
              <span className="pill">⏱ {activeActivity.duration}</span>
              <span className="pill">👶 {activeActivity.ageRange}</span>
              {activeActivity.difficulty && <span className="pill">{activeActivity.difficulty}</span>}
            </div>
            <div className="popup-instructions">
              <p className="popup-instructions-label">🎯 How it works</p>
              <p className="popup-instructions-text">{activeActivity.instructions}</p>
            </div>
            {activeActivity.materials && activeActivity.materials.length > 0 && (
              <div className="popup-materials">
                <p className="popup-instructions-label">🛒 You'll need</p>
                <div className="popup-materials-list">
                  {activeActivity.materials.map((m, i) => (
                    <span key={i} className="popup-material-tag">{m}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Calendar;
