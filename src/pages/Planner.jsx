import React, { useState, useMemo, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import { activities } from '../data/activities';
import { categories } from '../data/categories';
import { usePlanner } from '../context/PlannerContext';
import { useAuth } from '../context/AuthContext';
import ActivityCard from '../components/ActivityCard';
import { useNavigate } from 'react-router-dom';
import DownloadModal from '../components/DownloadModal';
import InfographicSteps from '../components/InfographicSteps';
import { filterActivitiesForDate, paidAllowedOnDate } from '../utils/activityFilters';

const catMap = {};
categories.forEach(c => { catMap[c.id] = c; });

const Planner = () => {
  const { addToPlan, removeFromPlan, getActivitiesForDate } = usePlanner();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isPro = currentUser?.isPro || false;

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [viewMode, setViewMode] = useState('day');
  const [activeActivity, setActiveActivity] = useState(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const planned = getActivitiesForDate(selectedDate);

  const getWeekDates = () => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const mon = new Date(d); mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    return Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(mon); dd.setDate(mon.getDate() + i);
      return dd.toISOString().split('T')[0];
    });
  };

  const weekDates = getWeekDates();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getMonthData = () => {
    const d = new Date(selectedDate);
    const year = d.getFullYear();
    const month = d.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    return { year, month, daysInMonth, offset };
  };

  const monthData = getMonthData();

  const filtered = useMemo(() => {
    const pool = isPro ? activities : activities.slice(0, 30);
    if (!search) return pool;
    return pool.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));
  }, [search, isPro]);

  const handleDrop = (e, dateKey) => {
    e.preventDefault();
    setDragOver(false);
    try {
      const activity = JSON.parse(e.dataTransfer.getData('application/json'));
      addToPlan(dateKey || selectedDate, activity);
    } catch {}
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleAutoPopulate = () => {
    const getRandomActivities = (count, excludeIds = [], dateKey) => {
      const pool = filterActivitiesForDate(activities, dateKey);
      const available = pool.filter(a => !excludeIds.includes(a.id));
      if (available.length === 0) return [];
      const shuffled = [...available].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    if (viewMode === 'day') {
      const existing = getActivitiesForDate(selectedDate);
      const existingIds = existing.map(a => a.id);
      const toAdd = getRandomActivities(3, existingIds, selectedDate);
      toAdd.forEach(activity => addToPlan(selectedDate, activity));
    } else if (viewMode === 'week') {
      weekDates.forEach(dateKey => {
        const existing = getActivitiesForDate(dateKey);
        const existingIds = existing.map(a => a.id);
        const count = Math.floor(Math.random() * 2) + 1;
        const toAdd = getRandomActivities(count, existingIds, dateKey);
        toAdd.forEach(activity => addToPlan(dateKey, activity));
      });
    } else if (viewMode === 'month') {
      for (let day = 1; day <= monthData.daysInMonth; day++) {
        const dateKey = `${monthData.year}-${String(monthData.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const existing = getActivitiesForDate(dateKey);
        const existingIds = existing.map(a => a.id);
        const toAdd = getRandomActivities(1, existingIds, dateKey);
        toAdd.forEach(activity => addToPlan(dateKey, activity));
      }
    }
  };

  const handleClear = () => {
    if (viewMode === 'day') {
      const acts = getActivitiesForDate(selectedDate);
      acts.forEach(a => removeFromPlan(selectedDate, a.id));
    } else if (viewMode === 'week') {
      weekDates.forEach(dateKey => {
        const acts = getActivitiesForDate(dateKey);
        acts.forEach(a => removeFromPlan(dateKey, a.id));
      });
    } else if (viewMode === 'month') {
      for (let day = 1; day <= monthData.daysInMonth; day++) {
        const dateKey = `${monthData.year}-${String(monthData.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const acts = getActivitiesForDate(dateKey);
        acts.forEach(a => removeFromPlan(dateKey, a.id));
      }
    }
  };

  const handleDownload = (range) => {
    const doc = new jsPDF();
    const d = new Date(selectedDate);
    const year = d.getFullYear();
    const month = d.getMonth();
    
    let datesToExport = [];
    let title = '';

    if (range === 'day') {
      datesToExport = [selectedDate];
      title = `Daily Plan: ${selectedDate}`;
    } else if (range === 'week') {
      datesToExport = getWeekDates();
      title = `Weekly Plan: Week of ${datesToExport[0]}`;
    } else if (range === 'month') {
      for (let i = 1; i <= monthData.daysInMonth; i++) {
        datesToExport.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
      }
      title = `Monthly Plan: ${d.toLocaleString('default', { month: 'long' })} ${year}`;
    } else if (range === 'year') {
      for (let m = 0; m < 12; m++) {
        const days = new Date(year, m + 1, 0).getDate();
        for (let i = 1; i <= days; i++) {
          datesToExport.push(`${year}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
        }
      }
      title = `Yearly Plan: ${year}`;
    }

    doc.setFontSize(20);
    doc.text(`Kids Activities - ${title}`, 20, 20);
    let y = 35;
    let hasActivities = false;

    datesToExport.forEach(dateKey => {
      const acts = getActivitiesForDate(dateKey);
      if (acts.length === 0) return;
      
      hasActivities = true;
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.text(new Date(dateKey + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), 20, y);
      y += 8;
      
      doc.setFontSize(10);
      acts.forEach((a, index) => {
        if (y > 275) { doc.addPage(); y = 20; }
        const catName = catMap[a.category]?.name || '';
        doc.text(`  ${index + 1}. [${catName}] ${a.title} (${a.duration})`, 25, y);
        y += 6;
      });
      y += 6;
    });

    if (!hasActivities) {
      doc.setFontSize(12);
      doc.text("No activities planned for this period.", 20, y);
    }

    doc.save(`Kids_Activities_${range}_plan.pdf`);
    setShowDownloadMenu(false);
  };

  return (
    <>
      <div className="page planner-page">
      <header className="planner-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '48px' }}>📋</span>
          <h1 style={{ fontSize: '36px', color: 'var(--p-purple)' }}>Activity Planner</h1>
        </div>
        <div className="planner-controls" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button className="btn-auto-populate" onClick={handleAutoPopulate}>
            ✨ Auto-Fill {viewMode === 'day' ? 'Day' : viewMode === 'week' ? 'Week' : 'Month'}
          </button>
          <button className="btn-clear-plan" onClick={handleClear}>
            🗑 Clear {viewMode === 'day' ? 'Day' : viewMode === 'week' ? 'Week' : 'Month'}
          </button>
          <div className="view-toggle">
            <button className={viewMode === 'day' ? 'active' : ''} onClick={() => setViewMode('day')}>Day</button>
            <button className={viewMode === 'week' ? 'active' : ''} onClick={() => setViewMode('week')}>Week</button>
            <button className={viewMode === 'month' ? 'active' : ''} onClick={() => setViewMode('month')}>Month</button>
          </div>
          <button 
            className="btn-primary" 
            onClick={() => {
              if (!isPro) {
                navigate('/pricing');
              } else {
                setIsDownloadModalOpen(true);
              }
            }}
          >
            {isPro ? 'Download ⬇️' : '🔒 Download'}
          </button>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>
      </header>

      <div className="planner-layout">
        <div className="planner-sidebar">
          <div className="search-bar">
            <span>🔍</span>
            <input placeholder="Search activities..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <p className="sidebar-hint">Drag activities to the plan area →</p>
          <div className="sidebar-list">
            {filtered.map(a => <ActivityCard key={a.id} activity={a} compact showAdd targetDate={selectedDate} />)}
          </div>
        </div>

        <div className="planner-main">
          {viewMode === 'day' ? (
            <div className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
              onDrop={(e) => handleDrop(e)} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
              <h2>{new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h2>
              {planned.length === 0 ? (
                <div className="drop-placeholder">
                  <span>📥</span><p>Drop activities here or click "Add to Plan"</p>
                </div>
              ) : (
                <div className="planned-list">
                  {planned.map((a, i) => (
                    <div key={a.id} className="planned-item" style={{ '--cat-color': catMap[a.category]?.color }}
                      onClick={() => setActiveActivity(a)} title="Click to see how it works">
                      <span className="planned-num">{i + 1}</span>
                      <span className="planned-icon">{catMap[a.category]?.icon}</span>
                      <div className="planned-info">
                        <strong>{a.title}</strong>
                        <span>{a.duration}</span>
                      </div>
                      <button className="remove-btn" onClick={(e) => { e.stopPropagation(); removeFromPlan(selectedDate, a.id); }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : viewMode === 'week' ? (
            <div className="week-grid">
              {weekDates.map((dateKey, i) => {
                const dayPlan = getActivitiesForDate(dateKey);
                return (
                  <div key={dateKey}
                    className={`week-day-col ${dateKey === selectedDate ? 'selected' : ''}`}
                    onDrop={(e) => handleDrop(e, dateKey)}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => setSelectedDate(dateKey)}>
                    <div className="week-day-header">
                      <span className="day-name">{dayNames[i]}</span>
                      <span className="day-num">{new Date(dateKey + 'T12:00:00').getDate()}</span>
                    </div>
                    <div className="week-day-items">
                      {dayPlan.map(a => (
                        <div key={a.id} className="week-item"
                          style={{ background: catMap[a.category]?.color + '22', borderLeft: `3px solid ${catMap[a.category]?.color}` }}
                          onClick={(e) => { e.stopPropagation(); setActiveActivity(a); }}
                          title="Click to see how it works">
                          <span>{catMap[a.category]?.icon}</span> {a.title}
                        </div>
                      ))}
                      {dayPlan.length === 0 && <span className="week-empty">Drop here</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="cal-grid">
              {dayNames.map(d => <div key={d} className="cal-header-cell">{d}</div>)}
              {Array.from({ length: monthData.offset }).map((_, i) => (
                <div key={`empty-${i}`} className="cal-cell empty" />
              ))}
              {Array.from({ length: monthData.daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateKey = `${monthData.year}-${String(monthData.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayPlan = getActivitiesForDate(dateKey);
                const isSelected = dateKey === selectedDate;
                const isToday = dateKey === new Date().toISOString().split('T')[0];
                return (
                  <div key={day}
                    className={`cal-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(dateKey)}
                    onDrop={(e) => handleDrop(e, dateKey)}
                    onDragOver={(e) => e.preventDefault()}>
                    <span className="cal-day-num">{day}</span>
                    <div className="cal-items">
                      {dayPlan.slice(0, 3).map(a => (
                        <div key={a.id} className="cal-item"
                          style={{ background: catMap[a.category]?.color + '33', color: catMap[a.category]?.color }}
                          title="Click to see how it works">
                          <span className="cal-item-icon" onClick={(e) => { e.stopPropagation(); setActiveActivity(a); }}>{catMap[a.category]?.icon}</span>
                          <span className="cal-item-label" onClick={(e) => { e.stopPropagation(); setActiveActivity(a); }}>{a.title}</span>
                          <button
                            className="cal-item-delete"
                            onClick={(e) => { e.stopPropagation(); removeFromPlan(dateKey, a.id); }}
                            title="Remove activity">
                            ✕
                          </button>
                        </div>
                      ))}
                      {dayPlan.length > 3 && (
                        <span className="cal-more">+{dayPlan.length - 3} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
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
              <InfographicSteps instructions={activeActivity.instructions} color={catMap[activeActivity.category]?.color} />
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
      
      <DownloadModal 
        isOpen={isDownloadModalOpen} 
        onClose={() => setIsDownloadModalOpen(false)} 
        selectedDate={selectedDate} 
        weekDates={weekDates} 
        monthData={monthData} 
      />
    </>
  );
};

export default Planner;
