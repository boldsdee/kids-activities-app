import React, { useState } from 'react';
import { categories } from '../data/categories';
import { usePlanner } from '../context/PlannerContext';
import jsPDF from 'jspdf';

const catMap = {};
categories.forEach(c => { catMap[c.id] = c; });

const SavedPlans = () => {
  const { savedPlans, savePlan, loadPlan, deletePlan, plannedActivities, clearPlan } = usePlanner();
  const [planName, setPlanName] = useState('');
  const [showSave, setShowSave] = useState(false);

  const handleSave = () => {
    if (!planName.trim()) return;
    savePlan(planName.trim());
    setPlanName('');
    setShowSave(false);
  };

  const exportJSON = (plan) => {
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${plan.name}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = (plan) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Kids Activities Plan: ${plan.name}`, 20, 20);
    doc.setFontSize(10);
    doc.text(`Created: ${new Date(plan.date).toLocaleDateString()}`, 20, 30);
    let y = 45;
    Object.entries(plan.activities).sort().forEach(([dateKey, acts]) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.text(new Date(dateKey + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }), 20, y);
      y += 8;
      doc.setFontSize(10);
      acts.forEach(a => {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(`  ${catMap[a.category]?.name || ''} — ${a.title} (${a.duration})`, 25, y);
        y += 6;
      });
      y += 4;
    });
    doc.save(`${plan.name}.pdf`);
  };

  const totalCurrent = Object.values(plannedActivities).reduce((s, a) => s + a.length, 0);

  return (
    <div className="page saved-page">
      <header className="saved-header">
        <h1>💾 Saved Plans</h1>
        <button className="btn-primary" onClick={() => setShowSave(true)} disabled={totalCurrent === 0}>
          Save Current Plan ({totalCurrent} activities)
        </button>
      </header>

      {showSave && (
        <div className="save-modal-backdrop" onClick={() => setShowSave(false)}>
          <div className="save-modal" onClick={e => e.stopPropagation()}>
            <h2>Save Your Plan</h2>
            <input placeholder="Plan name..." value={planName} onChange={e => setPlanName(e.target.value)} autoFocus />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowSave(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {savedPlans.length === 0 ? (
        <div className="empty-state">
          <span>📦</span>
          <p>No saved plans yet. Plan some activities and save them here!</p>
        </div>
      ) : (
        <div className="saved-list">
          {savedPlans.map(plan => {
            const totalActs = Object.values(plan.activities).reduce((s, a) => s + a.length, 0);
            const totalDays = Object.keys(plan.activities).length;
            return (
              <div key={plan.id} className="saved-card">
                <div className="saved-info">
                  <h3>{plan.name}</h3>
                  <p>{totalActs} activities across {totalDays} day{totalDays !== 1 ? 's' : ''}</p>
                  <span className="saved-date">Saved {new Date(plan.date).toLocaleDateString()}</span>
                </div>
                <div className="saved-actions">
                  <button onClick={() => loadPlan(plan.id)} title="Load plan">📂 Load</button>
                  <button onClick={() => exportPDF(plan)} title="Download PDF">📄 PDF</button>
                  <button onClick={() => exportJSON(plan)} title="Download JSON">💾 JSON</button>
                  <button onClick={() => deletePlan(plan.id)} className="delete-btn" title="Delete">🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedPlans;
