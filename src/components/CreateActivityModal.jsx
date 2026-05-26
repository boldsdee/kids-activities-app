import React, { useState } from 'react';
import { categories } from '../data/categories';

const CreateActivityModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'arts',
    ageRange: '',
    duration: '',
    budgetGBP: 0,
    materials: '',
    instructions: '',
    difficulty: 'Easy'
  });

  React.useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        ...initialData,
        materials: Array.isArray(initialData.materials) ? initialData.materials.join(', ') : initialData.materials || ''
      });
    } else if (!isOpen) {
      setFormData({
        title: '', category: 'arts', ageRange: '', duration: '',
        budgetGBP: 0, materials: '', instructions: '', difficulty: 'Easy'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newActivity = {
      ...formData,
      budgetGBP: parseFloat(formData.budgetGBP) || 0,
      materials: formData.materials.split(',').map(m => m.trim()).filter(m => m)
    };
    onSave(newActivity);
    onClose();
  };

  const modalStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000, padding: '20px'
  };

  const contentStyle = {
    background: '#1A1A2E',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '32px',
    width: '100%', maxWidth: '500px',
    maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)'
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', marginTop: '8px', marginBottom: '16px',
    borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.05)', color: '#F1F0FF',
    fontFamily: 'Outfit', fontSize: '15px', boxSizing: 'border-box'
  };

  const labelStyle = { color: 'var(--text-soft)', fontSize: '14px', fontWeight: '500' };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', margin: 0, background: 'linear-gradient(135deg, #A78BFA, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {initialData ? 'Edit Custom Activity' : 'Create Custom Activity'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-soft)', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Title</label>
          <input style={inputStyle} name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Backyard Obstacle Course" required />

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} name="category" value={formData.category} onChange={handleChange}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Difficulty</label>
              <select style={inputStyle} name="difficulty" value={formData.difficulty} onChange={handleChange}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Age Range</label>
              <input style={inputStyle} name="ageRange" value={formData.ageRange} onChange={handleChange} placeholder="e.g. 4-12" required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Duration</label>
              <input style={inputStyle} name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 30 min" required />
            </div>
          </div>

          <label style={labelStyle}>Budget (£)</label>
          <input style={inputStyle} type="number" min="0" name="budgetGBP" value={formData.budgetGBP} onChange={handleChange} required />

          <label style={labelStyle}>Materials (comma-separated)</label>
          <input style={inputStyle} name="materials" value={formData.materials} onChange={handleChange} placeholder="e.g. Chalk, Water balloons" />

          <label style={labelStyle}>Instructions</label>
          <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} name="instructions" value={formData.instructions} onChange={handleChange} placeholder="Step-by-step instructions..." required />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '12px 24px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.1)', color: '#F1F0FF', border: 'none', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: '600' }}>Cancel</button>
            <button type="submit" style={{ padding: '12px 24px', borderRadius: '14px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: '600', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>Save Activity</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateActivityModal;
