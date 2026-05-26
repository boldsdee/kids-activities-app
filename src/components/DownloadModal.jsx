import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { usePlanner } from '../context/PlannerContext';
import { categories } from '../data/categories';
import VisualPlanExport from './VisualPlanExport';

const catMap = {};
categories.forEach(c => { catMap[c.id] = c; });

const DownloadModal = ({ isOpen, onClose, selectedDate, weekDates, monthData }) => {
  const { getActivitiesForDate } = usePlanner();
  const [range, setRange] = useState('day');
  const [format, setFormat] = useState('pdf');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const visualRef = useRef(null);

  if (!isOpen) return null;

  const generateData = () => {
    const d = new Date(selectedDate);
    const year = d.getFullYear();
    const month = d.getMonth();
    
    let datesToExport = [];
    let title = '';

    if (range === 'day') {
      datesToExport = [selectedDate];
      title = `Daily Plan: ${selectedDate}`;
    } else if (range === 'week') {
      datesToExport = weekDates;
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

    const planData = datesToExport.map(dateKey => {
      return {
        dateKey,
        dateStr: new Date(dateKey + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        activities: getActivitiesForDate(dateKey)
      };
    }).filter(d => d.activities.length > 0 || range === 'day'); // Keep empty day if they just selected day

    return { title, planData };
  };

  const handleCsvExport = (title, planData) => {
    let csvContent = "Date,Category,Title,Duration,Age Range,Difficulty,Premium\n";
    planData.forEach(day => {
      day.activities.forEach(a => {
        const catName = catMap[a.category]?.name || 'Unknown';
        const isPaid = a.isPaid ? 'Yes' : 'No';
        const diff = a.difficulty || 'N/A';
        const row = [
          `"${day.dateKey}"`,
          `"${catName}"`,
          `"${a.title.replace(/"/g, '""')}"`,
          `"${a.duration}"`,
          `"${a.ageRange}"`,
          `"${diff}"`,
          `"${isPaid}"`
        ];
        csvContent += row.join(",") + "\n";
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Kids_Activities_${title.replace(/ /g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleStandardPdfExport = (title, planData) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Kids Activities - ${title}`, 20, 20);
    let y = 35;

    if (planData.length === 0 || (planData.length === 1 && planData[0].activities.length === 0)) {
      doc.setFontSize(12);
      doc.text("No activities planned for this period.", 20, y);
    } else {
      planData.forEach(day => {
        if (day.activities.length === 0) return;
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.text(day.dateStr, 20, y);
        y += 8;
        
        doc.setFontSize(10);
        day.activities.forEach((a, index) => {
          if (y > 275) { doc.addPage(); y = 20; }
          const catName = catMap[a.category]?.name || '';
          doc.text(`  ${index + 1}. [${catName}] ${a.title} (${a.duration})`, 25, y);
          y += 6;
        });
        y += 6;
      });
    }

    doc.save(`Kids_Activities_${title.replace(/ /g, '_')}.pdf`);
  };

  const handleVisualPdfExport = async (title) => {
    if (!visualRef.current) return;
    try {
      const canvas = await html2canvas(visualRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Kids_Activities_Visual_${title.replace(/ /g, '_')}.pdf`);
    } catch (err) {
      console.error('Visual export failed', err);
      alert('Failed to generate visual PDF. Please try again.');
    }
  };

  const handleDownload = async () => {
    setIsProcessing(true);
    const { title, planData } = generateData();

    if (format === 'csv') {
      handleCsvExport(title, planData);
      setIsProcessing(false);
      onClose();
    } else if (format === 'pdf') {
      handleStandardPdfExport(title, planData);
      setIsProcessing(false);
      onClose();
    } else if (format === 'visual') {
      // Need a small timeout to let React render the VisualPlanExport into DOM before html2canvas hits it
      setTimeout(async () => {
        await handleVisualPdfExport(title);
        setIsProcessing(false);
        onClose();
      }, 500);
    }
  };

  const modalStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 2000, padding: '20px'
  };

  const contentStyle = {
    background: '#1A1A2E', border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '500px',
    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)'
  };

  const selectStyle = {
    width: '100%', padding: '14px 16px', marginBottom: '24px',
    borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.05)', color: '#F1F0FF',
    fontFamily: 'Outfit', fontSize: '15px', boxSizing: 'border-box'
  };

  const { title, planData } = generateData();

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', margin: 0, background: 'linear-gradient(135deg, #A78BFA, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Download Plan
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-soft)', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>

        <label style={{ display: 'block', color: 'var(--text-soft)', marginBottom: '8px', fontSize: '14px' }}>Select Timeframe</label>
        <select style={selectStyle} value={range} onChange={e => setRange(e.target.value)}>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>

        <label style={{ display: 'block', color: 'var(--text-soft)', marginBottom: '8px', fontSize: '14px' }}>Select Format</label>
        <select style={selectStyle} value={format} onChange={e => setFormat(e.target.value)}>
          <option value="csv">Spreadsheet (CSV)</option>
          <option value="visual">Visual PDF (Pictures & Colors)</option>
          <option value="pdf">Standard PDF (Clean Text)</option>
        </select>

        <button 
          onClick={handleDownload} disabled={isProcessing}
          style={{ 
            width: '100%', padding: '16px', borderRadius: '14px', 
            background: 'var(--primary)', color: '#fff', border: 'none', 
            cursor: isProcessing ? 'not-allowed' : 'pointer', fontFamily: 'Outfit', fontWeight: '600', 
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)', fontSize: '16px', opacity: isProcessing ? 0.7 : 1
          }}
        >
          {isProcessing ? 'Generating...' : 'Download Now ⬇️'}
        </button>
      </div>

      {format === 'visual' && isOpen && (
        <VisualPlanExport planData={planData} title={title} forwardRef={visualRef} />
      )}
    </div>
  );
};

export default DownloadModal;
