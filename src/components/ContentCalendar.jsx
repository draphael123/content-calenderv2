import React, { useState, useMemo, useEffect, useRef } from 'react';
import { sheetsApi } from '../services/sheetsApi';
import UserSelector from './UserSelector';

const ContentCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 1, 1));
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date(2025, 1, 2)); // Sunday
  const [draggedItem, setDraggedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [newComment, setNewComment] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    assignee: 'all',
    platform: 'all',
    status: 'all',
    pillar: 'all',
    type: 'all',
  });

  // API State
  const [teamMembers, setTeamMembers] = useState([]);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('contentCalendarUser') ? parseInt(localStorage.getItem('contentCalendarUser')) : null;
  });
  const [showUserSelector, setShowUserSelector] = useState(false);
  const refreshIntervalRef = useRef(null);

  const platforms = {
    tiktok: { name: 'TikTok', icon: '♪', color: '#00F2EA', bg: '#00F2EA15' },
    instagram: { name: 'Instagram', icon: '◎', color: '#E1306C', bg: '#E1306C15' },
    youtube: { name: 'YouTube', icon: '▶', color: '#FF0000', bg: '#FF000015' },
  };

  const contentTypes = {
    'Educational': { name: 'Educational', icon: '📚', color: '#3B82F6' },
    'Testimonial': { name: 'Testimonial', icon: '💬', color: '#10B981' },
    'Q&A': { name: 'Q&A', icon: '❓', color: '#8B5CF6' },
    'Behind-the-scenes': { name: 'Behind-the-scenes', icon: '🎬', color: '#F59E0B' },
    'Promotional': { name: 'Promotional', icon: '📢', color: '#EF4444' },
    'Announcement': { name: 'Announcement', icon: '📣', color: '#EC4899' },
  };

  const contentPillars = {
    weightloss: { name: 'Weight Loss / GLP-1', color: '#10B981', icon: '⚖️' },
    trt: { name: 'TRT', color: '#6366F1', icon: '💪' },
    hrt: { name: 'HRT', color: '#EC4899', icon: '✨' },
    lifestyle: { name: 'Lifestyle & Wellness', color: '#F59E0B', icon: '🌿' },
    testimonials: { name: 'Patient Stories', color: '#8B5CF6', icon: '💬' },
  };

  const contentTypes = ['Educational', 'Testimonial', 'Behind-the-scenes', 'Product', 'Trending', 'Q&A'];
  
  const statuses = {
    draft: { label: 'Draft', color: '#94A3B8', bg: '#F1F5F9' },
    review: { label: 'In Review', color: '#F59E0B', bg: '#FEF3C7' },
    approved: { label: 'Approved', color: '#10B981', bg: '#D1FAE5' },
    scheduled: { label: 'Scheduled', color: '#6366F1', bg: '#E0E7FF' },
    published: { label: 'Published', color: '#8B5CF6', bg: '#EDE9FE' },
  };

  const hashtagSets = {
    tiktok: {
      weightloss: ['#glp1', '#weightlosstiktok', '#ozempic', '#semaglutide', '#weightlossjourney', '#fyp'],
      trt: ['#trt', '#testosterone', '#menshealth', '#hormonehealth', '#fitness', '#fyp'],
      hrt: ['#hrt', '#menopause', '#hormones', '#womenshealth', '#wellness', '#fyp'],
    },
    instagram: {
      weightloss: ['#glp1weightloss', '#weightlosstransformation', '#semaglutide', '#healthylifestyle', '#fountainhealth'],
      trt: ['#testosteronetherapy', '#menshealth', '#hormoneoptimization', '#menshormonehealth', '#fountainhealth'],
      hrt: ['#hormonereplacementtherapy', '#menopauserelief', '#womenshormones', '#wellnessjourney', '#fountainhealth'],
    },
    youtube: {
      weightloss: ['glp-1', 'weight loss', 'semaglutide', 'medical weight loss', 'fountain health'],
      trt: ['testosterone therapy', 'trt', 'mens health', 'hormone therapy', 'fountain health'],
      hrt: ['hormone replacement', 'menopause', 'hrt', 'womens health', 'fountain health'],
    },
  };

  const recurringTemplates = [
    { id: 1, name: 'Transformation Tuesday', day: 2, platform: 'instagram', pillar: 'testimonials', type: 'Testimonial' },
    { id: 2, name: 'FAQ Friday', day: 5, platform: 'tiktok', pillar: 'weightloss', type: 'Q&A' },
    { id: 3, name: 'Wellness Wednesday', day: 3, platform: 'youtube', pillar: 'lifestyle', type: 'Educational' },
    { id: 4, name: 'Monday Motivation', day: 1, platform: 'instagram', pillar: 'testimonials', type: 'Testimonial' },
  ];


  const [newContent, setNewContent] = useState({
    title: '',
    platform: 'tiktok',
    assignee: 1,
    status: 'draft',
    type: 'Educational',
    pillar: 'weightloss',
    publishDate: '',
    publishTime: '',
    deadline: '',
    caption: '',
    assetLinks: [],
    comments: [],
    reviewer: null,
    approvedBy: null,
    approvedAt: null,
    reminderSet: false,
  });

  const [newAssetLink, setNewAssetLink] = useState({ type: 'canva', url: '', label: '' });

  // Load data on mount
  useEffect(() => {
    if (!currentUser) {
      // Load team first to show user selector
      const loadTeam = async () => {
        try {
          const teamData = await sheetsApi.getTeam();
          setTeamMembers(teamData || []);
          setShowUserSelector(true);
        } catch (err) {
          setError(err.message || 'Failed to load team data');
        }
      };
      loadTeam();
      return;
    }
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [contentData, teamData] = await Promise.all([
          sheetsApi.getAll(),
          sheetsApi.getTeam(),
        ]);
        setContents(contentData || []);
        setTeamMembers(teamData || []);
      } catch (err) {
        setError(err.message || 'Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [currentUser]);

  // Periodic refresh every 60 seconds
  useEffect(() => {
    if (!currentUser || loading) return;
    
    refreshIntervalRef.current = setInterval(async () => {
      try {
        const contentData = await sheetsApi.getAll();
        setContents(contentData || []);
      } catch (err) {
        console.error('Error refreshing data:', err);
      }
    }, 60000);
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [currentUser, loading]);

  // Handle user selection
  const handleUserSelect = (userId) => {
    setCurrentUser(userId);
    localStorage.setItem('contentCalendarUser', userId.toString());
    setShowUserSelector(false);
  };

  // Filtered contents
  const filteredContents = useMemo(() => {
    return contents.filter(c => {
      if (filters.assignee !== 'all' && c.assignee !== parseInt(filters.assignee)) return false;
      if (filters.platform !== 'all' && c.platform !== filters.platform) return false;
      if (filters.status !== 'all' && c.status !== filters.status) return false;
      if (filters.pillar !== 'all' && c.pillar !== filters.pillar) return false;
      if (filters.type !== 'all' && c.type !== filters.type) return false;
      return true;
    });
  }, [contents, filters]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const formatDateKey = (day, month = currentDate.getMonth(), year = currentDate.getFullYear()) => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  };

  const getContentsForDate = (dateKey) => {
    return filteredContents.filter(c => c.publishDate === dateKey);
  };

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const handleDragStart = (e, content) => {
    setDraggedItem(content);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, dateKey) => {
    e.preventDefault();
    if (draggedItem) {
      const originalContents = contents;
      const updatedContent = { ...draggedItem, publishDate: dateKey };
      // Optimistic update
      setContents(contents.map(c => 
        c.id === draggedItem.id ? updatedContent : c
      ));
      setDraggedItem(null);
      
      // Sync to API
      try {
        setSyncing(true);
        await sheetsApi.update(updatedContent);
      } catch (err) {
        // Revert on failure
        setContents(originalContents);
        setError('Failed to update content. Please try again.');
        console.error('Error updating content:', err);
      } finally {
        setSyncing(false);
      }
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + (direction * 7));
    setCurrentWeekStart(newDate);
  };

  const openModal = (dateKey) => {
    setSelectedDate(dateKey);
    setEditingContent(null);
    setActiveTab('details');
    setNewContent({
      title: '',
      platform: 'tiktok',
      assignee: currentUser || (teamMembers.length > 0 ? teamMembers[0].id : 1),
      status: 'draft',
      type: 'Educational',
      pillar: 'weightloss',
      publishDate: dateKey,
      publishTime: '',
      deadline: '',
      caption: '',
      assetLinks: [],
      comments: [],
      reviewer: null,
      approvedBy: null,
      approvedAt: null,
      reminderSet: false,
    });
    setShowModal(true);
  };

  const handleAddContent = async () => {
    if (!newContent.title.trim()) return;
    
    const originalContents = contents;
    const content = editingContent 
      ? { ...editingContent, ...newContent }
      : { ...newContent, id: Date.now() };
    
    // Optimistic update
    if (editingContent) {
      setContents(contents.map(c => 
        c.id === editingContent.id ? content : c
      ));
    } else {
      setContents([...contents, content]);
    }
    setShowModal(false);
    const previousEditingContent = editingContent;
    setEditingContent(null);
    
    // Sync to API
    try {
      setSyncing(true);
      if (previousEditingContent) {
        await sheetsApi.update(content);
      } else {
        await sheetsApi.add(content);
      }
    } catch (err) {
      // Revert on failure
      setContents(originalContents);
      setError('Failed to save content. Please try again.');
      setShowModal(true);
      setEditingContent(previousEditingContent);
      console.error('Error saving content:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleEditContent = (content) => {
    setSelectedDate(content.publishDate);
    setEditingContent(content);
    setActiveTab('details');
    setNewContent({ ...content });
    setShowModal(true);
  };

  const handleDeleteContent = async (id) => {
    const originalContents = contents;
    // Optimistic update
    setContents(contents.filter(c => c.id !== id));
    setShowModal(false);
    
    // Sync to API
    try {
      setSyncing(true);
      await sheetsApi.delete(id);
    } catch (err) {
      // Revert on failure
      setContents(originalContents);
      setError('Failed to delete content. Please try again.');
      console.error('Error deleting content:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !currentUser) return;
    const comment = {
      id: Date.now(),
      author: currentUser,
      text: newComment,
      timestamp: new Date().toISOString(),
    };
    setNewContent({
      ...newContent,
      comments: [...newContent.comments, comment],
    });
    setNewComment('');
  };

  const handleAddAssetLink = () => {
    if (!newAssetLink.url.trim() || !newAssetLink.label.trim()) return;
    setNewContent({
      ...newContent,
      assetLinks: [...newContent.assetLinks, { ...newAssetLink }],
    });
    setNewAssetLink({ type: 'canva', url: '', label: '' });
  };

  const handleRemoveAssetLink = (index) => {
    setNewContent({
      ...newContent,
      assetLinks: newContent.assetLinks.filter((_, i) => i !== index),
    });
  };

  const handleApprove = () => {
    if (!currentUser) return;
    setNewContent({
      ...newContent,
      status: 'approved',
      approvedBy: currentUser,
      approvedAt: new Date().toISOString(),
    });
  };

  const handleApplyTemplate = async (template) => {
    // Find next occurrence of this day
    const today = new Date();
    let targetDate = new Date(today);
    while (targetDate.getDay() !== template.day) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    
    const dateKey = formatDateKey(targetDate.getDate(), targetDate.getMonth(), targetDate.getFullYear());
    
    const originalContents = contents;
    const content = {
      id: Date.now(),
      title: template.name,
      platform: template.platform,
      assignee: currentUser || (teamMembers.length > 0 ? teamMembers[0].id : 1),
      status: 'draft',
      type: template.type,
      pillar: template.pillar,
      publishDate: dateKey,
      publishTime: '10:00',
      deadline: '',
      caption: '',
      assetLinks: [],
      comments: [],
      reviewer: null,
      approvedBy: null,
      approvedAt: null,
      reminderSet: false,
    };
    // Optimistic update
    setContents([...contents, content]);
    setShowTemplateModal(false);
    
    // Sync to API
    try {
      setSyncing(true);
      await sheetsApi.add(content);
    } catch (err) {
      // Revert on failure
      setContents(originalContents);
      setError('Failed to create content from template. Please try again.');
      console.error('Error creating template content:', err);
    } finally {
      setSyncing(false);
    }
  };

  const getAssignee = (id) => teamMembers.find(t => t.id === id);
  const getHashtags = (platform, pillar) => hashtagSets[platform]?.[pillar] || [];

  const calendarDays = [];
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const isOverdue = (content) => {
    if (!content.deadline) return false;
    const deadline = new Date(content.deadline);
    const today = new Date();
    return deadline < today && content.status !== 'published';
  };

  const ContentCard = ({ content, compact = false }) => {
    const platform = platforms[content.platform];
    const assignee = getAssignee(content.assignee);
    const status = statuses[content.status];
    const pillar = contentPillars[content.pillar];
    const overdue = isOverdue(content);

    return (
      <div
        className={`content-card ${overdue ? 'overdue' : ''}`}
        style={{ borderLeftColor: platform.color }}
        draggable
        onDragStart={(e) => handleDragStart(e, content)}
        onClick={(e) => {
          e.stopPropagation();
          handleEditContent(content);
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px', color: platform.color }}>{platform.icon}</span>
            <span style={{ fontSize: '10px' }}>{pillar?.icon}</span>
          </div>
          <div style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: assignee?.color,
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {assignee?.avatar}
          </div>
        </div>
        <div style={{
          fontSize: '11px',
          fontWeight: '500',
          color: '#E2E8F0',
          marginBottom: '6px',
          lineHeight: '1.3',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {content.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span className="status-pill" style={{ color: status.color, background: status.bg }}>
            {status.label}
          </span>
          {content.publishTime && (
            <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '500' }}>
              🕐 {content.publishTime.replace(/^(\d{1,2}):(\d{2})$/, (_, h, m) => {
                const hour = parseInt(h);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const hour12 = hour % 12 || 12;
                return `${hour12}:${m} ${ampm}`;
              })}
            </span>
          )}
          {overdue && (
            <span className="status-pill" style={{ color: '#EF4444', background: '#FEE2E2' }}>
              ⚠ Overdue
            </span>
          )}
          {content.comments && content.comments.length > 0 && (
            <span style={{ fontSize: '10px', color: '#64748B' }}>💬 {content.comments.length}</span>
          )}
          {content.reminderSet && (
            <span style={{ fontSize: '10px', color: '#64748B' }}>🔔</span>
          )}
        </div>
      </div>
    );
  };

  // Show user selector if no user selected
  if (showUserSelector || (!currentUser && teamMembers.length > 0)) {
    return <UserSelector teamMembers={teamMembers} onSelect={handleUserSelect} />;
  }

  // Show loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#E2E8F0',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
          <div>Loading calendar...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '20px',
      color: '#E2E8F0',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        
        * { box-sizing: border-box; }
        
        .calendar-day {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          min-height: 120px;
          padding: 8px;
          transition: all 0.2s ease;
          cursor: pointer;
          overflow: hidden;
        }
        
        .calendar-day:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.12);
        }
        
        .calendar-day.week-view {
          min-height: 400px;
        }
        
        .content-card {
          background: rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 8px 10px;
          margin-bottom: 6px;
          cursor: grab;
          transition: all 0.15s ease;
          border-left: 3px solid;
        }
        
        .content-card:hover {
          background: rgba(255,255,255,0.12);
          transform: scale(1.02);
        }
        
        .content-card.overdue {
          background: rgba(239, 68, 68, 0.1);
        }
        
        .btn {
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          font-size: 13px;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: white;
        }
        
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
        }
        
        .btn-success {
          background: linear-gradient(135deg, #10B981, #059669);
          color: white;
        }
        
        .btn-ghost {
          background: transparent;
          color: #94A3B8;
          border: 1px solid rgba(255,255,255,0.1);
        }
        
        .btn-ghost:hover {
          background: rgba(255,255,255,0.05);
          color: #E2E8F0;
        }
        
        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }
        
        .input-field {
          width: 100%;
          padding: 10px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #E2E8F0;
          font-size: 13px;
          transition: all 0.2s ease;
        }
        
        .input-field:focus {
          outline: none;
          border-color: #6366F1;
          background: rgba(255,255,255,0.08);
        }
        
        .textarea-field {
          width: 100%;
          padding: 10px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #E2E8F0;
          font-size: 13px;
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
        }
        
        .textarea-field:focus {
          outline: none;
          border-color: #6366F1;
        }
        
        .select-field {
          width: 100%;
          padding: 10px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #E2E8F0;
          font-size: 13px;
          cursor: pointer;
        }
        
        .select-field option {
          background: #1a1a2e;
          color: #E2E8F0;
        }
        
        .filter-select {
          padding: 8px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #E2E8F0;
          font-size: 12px;
          cursor: pointer;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          animation: fadeIn 0.2s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .modal {
          background: linear-gradient(135deg, #1e1e3f, #252550);
          border-radius: 16px;
          width: 95%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          animation: slideUp 0.3s ease;
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          position: sticky;
          top: 0;
          background: linear-gradient(135deg, #1e1e3f, #252550);
          z-index: 10;
        }
        
        .modal-body {
          padding: 20px 24px;
        }
        
        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid rgba(255,255,255,0.1);
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          position: sticky;
          bottom: 0;
          background: linear-gradient(135deg, #1e1e3f, #252550);
        }
        
        .tab-btn {
          padding: 8px 16px;
          background: transparent;
          border: none;
          color: #64748B;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
        }
        
        .tab-btn.active {
          color: #E2E8F0;
          border-bottom-color: #6366F1;
        }
        
        .tab-btn:hover {
          color: #E2E8F0;
        }
        
        .team-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .team-btn.selected {
          border-color: #6366F1;
          transform: scale(1.1);
        }
        
        .platform-btn {
          padding: 8px 14px;
          border-radius: 8px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 600;
          font-size: 12px;
        }
        
        .platform-btn.selected {
          border-color: currentColor;
        }
        
        .pillar-btn {
          padding: 6px 12px;
          border-radius: 6px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 11px;
          font-weight: 600;
        }
        
        .pillar-btn.selected {
          border-color: currentColor;
        }
        
        .status-pill {
          display: inline-flex;
          align-items: center;
          padding: 3px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .comment-bubble {
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 10px;
        }
        
        .asset-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          margin-bottom: 8px;
        }
        
        .hashtag {
          display: inline-block;
          padding: 4px 10px;
          background: rgba(99, 102, 241, 0.2);
          border-radius: 20px;
          font-size: 11px;
          color: #A5B4FC;
          margin: 2px;
        }
        
        .view-toggle {
          display: flex;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          padding: 4px;
        }
        
        .view-toggle button {
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: #64748B;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        
        .view-toggle button.active {
          background: rgba(99, 102, 241, 0.3);
          color: #E2E8F0;
        }
        
        .template-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .template-card:hover {
          background: rgba(255,255,255,0.08);
          transform: translateY(-2px);
        }
      `}</style>

      {/* Demo Data Banner */}
      {!import.meta.env.VITE_SHEETS_API_URL && (
        <div style={{
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          color: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🧪</span>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
                DEMO MODE - Sample Data
              </div>
              <div style={{ fontSize: '13px', opacity: 0.9 }}>
                This calendar is displaying demo/mock data. No Google Sheets connection configured.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            margin: 0,
            background: 'linear-gradient(135deg, #E2E8F0, #94A3B8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: "'Space Mono', monospace",
          }}>
            Content Calendar
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '13px' }}>
            Organic Content Team • Fountain
            {syncing && <span style={{ marginLeft: '12px', color: '#6366F1' }}>🔄 Syncing...</span>}
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {error && (
            <div style={{
              padding: '8px 12px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              color: '#FCA5A5',
              fontSize: '12px',
            }}>
              ⚠ {error}
              <button 
                onClick={() => setError(null)}
                style={{ marginLeft: '8px', background: 'transparent', border: 'none', color: '#FCA5A5', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => setShowTemplateModal(true)}>
            📋 Templates
          </button>
          <div className="view-toggle">
            <button className={viewMode === 'month' ? 'active' : ''} onClick={() => setViewMode('month')}>Month</button>
            <button className={viewMode === 'week' ? 'active' : ''} onClick={() => setViewMode('week')}>Week</button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>FILTERS:</span>
        <select 
          className="filter-select" 
          value={filters.assignee}
          onChange={e => setFilters({ ...filters, assignee: e.target.value })}
        >
          <option value="all">All Team</option>
          {teamMembers.map(m => (
            <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
          ))}
        </select>
        <select 
          className="filter-select"
          value={filters.platform}
          onChange={e => setFilters({ ...filters, platform: e.target.value })}
        >
          <option value="all">All Platforms</option>
          {Object.entries(platforms).map(([key, p]) => (
            <option key={key} value={key}>{p.icon} {p.name}</option>
          ))}
        </select>
        <select 
          className="filter-select"
          value={filters.type}
          onChange={e => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="all">All Types</option>
          {Object.entries(contentTypes).map(([key, type]) => (
            <option key={key} value={key}>{type.icon} {type.name}</option>
          ))}
        </select>
        <select 
          className="filter-select"
          value={filters.status}
          onChange={e => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">All Status</option>
          {Object.entries(statuses).map(([key, s]) => (
            <option key={key} value={key}>{s.label}</option>
          ))}
        </select>
        <select 
          className="filter-select"
          value={filters.pillar}
          onChange={e => setFilters({ ...filters, pillar: e.target.value })}
        >
          <option value="all">All Pillars</option>
          {Object.entries(contentPillars).map(([key, p]) => (
            <option key={key} value={key}>{p.icon} {p.name}</option>
          ))}
        </select>
        {(filters.assignee !== 'all' || filters.platform !== 'all' || filters.status !== 'all' || filters.pillar !== 'all' || filters.type !== 'all') && (
          <button 
            className="btn btn-ghost btn-sm"
            onClick={() => setFilters({ assignee: 'all', platform: 'all', status: 'all', pillar: 'all', type: 'all' })}
          >
            Clear
          </button>
        )}
      </div>

      {/* Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '10px',
        marginBottom: '16px',
      }}>
        {Object.entries(statuses).map(([key, status]) => {
          const count = filteredContents.filter(c => c.status === key).length;
          return (
            <div key={key} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: status.bg,
              borderRadius: '8px',
              fontSize: '12px',
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: status.color }} />
              <span style={{ color: status.color, fontWeight: '600' }}>{status.label}</span>
              <span style={{ marginLeft: 'auto', color: '#64748B', fontWeight: '700' }}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => viewMode === 'month' ? navigateMonth(-1) : navigateWeek(-1)}>
          ← {viewMode === 'month' ? 'Previous' : 'Prev Week'}
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, fontFamily: "'Space Mono', monospace" }}>
          {viewMode === 'month' 
            ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
            : `Week of ${monthNames[currentWeekStart.getMonth()]} ${currentWeekStart.getDate()}`
          }
        </h2>
        <button className="btn btn-ghost btn-sm" onClick={() => viewMode === 'month' ? navigateMonth(1) : navigateWeek(1)}>
          {viewMode === 'month' ? 'Next' : 'Next Week'} →
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        padding: '16px',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        {viewMode === 'month' ? (
          <>
            {/* Month View Headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '10px' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} style={{
                  textAlign: 'center',
                  padding: '8px',
                  color: '#64748B',
                  fontWeight: '600',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Month View Days */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
              {calendarDays.map((day, index) => {
                const dateKey = day ? formatDateKey(day) : null;
                const dayContents = dateKey ? getContentsForDate(dateKey) : [];
                return (
                  <div
                    key={index}
                    className="calendar-day"
                    style={{ opacity: day ? 1 : 0.3, pointerEvents: day ? 'auto' : 'none' }}
                    onDragOver={day ? handleDragOver : undefined}
                    onDrop={day ? (e) => handleDrop(e, dateKey) : undefined}
                    onClick={() => day && openModal(dateKey)}
                  >
                    {day && (
                      <>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#94A3B8', marginBottom: '6px' }}>
                          {day}
                        </div>
                        {dayContents.slice(0, 3).map(content => (
                          <ContentCard key={content.id} content={content} compact />
                        ))}
                        {dayContents.length > 3 && (
                          <div style={{ fontSize: '10px', color: '#64748B', textAlign: 'center', marginTop: '4px' }}>
                            +{dayContents.length - 3} more
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* Week View */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
              {getWeekDates().map((date, index) => {
                const dateKey = formatDateKey(date.getDate(), date.getMonth(), date.getFullYear());
                const dayContents = getContentsForDate(dateKey);
                const isToday = new Date().toDateString() === date.toDateString();
                return (
                  <div
                    key={index}
                    className="calendar-day week-view"
                    style={{
                      borderColor: isToday ? 'rgba(99, 102, 241, 0.4)' : undefined,
                    }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, dateKey)}
                    onClick={() => openModal(dateKey)}
                  >
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '12px',
                      paddingBottom: '8px',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                    }}>
                      <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {dayNames[date.getDay()].slice(0, 3)}
                      </div>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: isToday ? '#6366F1' : '#E2E8F0',
                      }}>
                        {date.getDate()}
                      </div>
                    </div>
                    {dayContents.map(content => (
                      <ContentCard key={content.id} content={content} />
                    ))}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Platform & Pillar Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px', flexWrap: 'wrap' }}>
        {Object.entries(platforms).map(([key, platform]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: platform.color, fontSize: '12px', fontWeight: '500' }}>
            <span style={{ fontSize: '16px' }}>{platform.icon}</span>
            {platform.name}
          </div>
        ))}
        <span style={{ color: '#64748B' }}>|</span>
        {Object.entries(contentPillars).map(([key, pillar]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: pillar.color, fontSize: '12px', fontWeight: '500' }}>
            <span>{pillar.icon}</span>
            {pillar.name}
          </div>
        ))}
      </div>

      {/* Content Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', fontFamily: "'Space Mono', monospace" }}>
                {editingContent ? 'Edit Content' : 'Add Content'}
              </h3>
              <div style={{ display: 'flex', gap: '0', marginTop: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <button className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Details</button>
                <button className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>Content</button>
                <button className={`tab-btn ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => setActiveTab('assets')}>Assets</button>
                <button className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>
                  Comments {newContent.comments && newContent.comments.length > 0 && `(${newContent.comments.length})`}
                </button>
                <button className={`tab-btn ${activeTab === 'approval' ? 'active' : ''}`} onClick={() => setActiveTab('approval')}>Approval</button>
              </div>
            </div>

            <div className="modal-body">
              {activeTab === 'details' && (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', color: '#94A3B8', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title</label>
                    <input type="text" className="input-field" placeholder="Content title..." value={newContent.title} onChange={e => setNewContent({ ...newContent, title: e.target.value })} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', color: '#94A3B8', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Publish Date</label>
                      <input type="date" className="input-field" value={newContent.publishDate} onChange={e => setNewContent({ ...newContent, publishDate: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', color: '#94A3B8', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time</label>
                      <input type="time" className="input-field" value={newContent.publishTime} onChange={e => setNewContent({ ...newContent, publishTime: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', color: '#94A3B8', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deadline</label>
                      <input type="date" className="input-field" value={newContent.deadline} onChange={e => setNewContent({ ...newContent, deadline: e.target.value })} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#94A3B8', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Platform</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {Object.entries(platforms).map(([key, platform]) => (
                        <button key={key} className={`platform-btn ${newContent.platform === key ? 'selected' : ''}`} style={{ background: newContent.platform === key ? platform.bg : 'rgba(255,255,255,0.05)', color: platform.color }} onClick={() => setNewContent({ ...newContent, platform: key })}>
                          {platform.icon} {platform.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#94A3B8', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Content Pillar</label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {Object.entries(contentPillars).map(([key, pillar]) => (
                        <button key={key} className={`pillar-btn ${newContent.pillar === key ? 'selected' : ''}`} style={{ background: newContent.pillar === key ? `${pillar.color}20` : 'rgba(255,255,255,0.05)', color: pillar.color }} onClick={() => setNewContent({ ...newContent, pillar: key })}>
                          {pillar.icon} {pillar.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#94A3B8', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assign To</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {teamMembers.map(member => (
                        <button key={member.id} className={`team-btn ${newContent.assignee === member.id ? 'selected' : ''}`} style={{ background: member.color }} onClick={() => setNewContent({ ...newContent, assignee: member.id })} title={member.name}>
                          {member.avatar}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', color: '#94A3B8', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
                      <select className="select-field" value={newContent.status} onChange={e => setNewContent({ ...newContent, status: e.target.value })}>
                        {Object.entries(statuses).map(([key, status]) => (
                          <option key={key} value={key}>{status.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', color: '#94A3B8', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Content Type</label>
                      <select className="select-field" value={newContent.type} onChange={e => setNewContent({ ...newContent, type: e.target.value })}>
                        {contentTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                      <input type="checkbox" checked={newContent.reminderSet} onChange={e => setNewContent({ ...newContent, reminderSet: e.target.checked })} style={{ width: '16px', height: '16px' }} />
                      🔔 Set deadline reminder (Slack/Email)
                    </label>
                  </div>
                </>
              )}

              {activeTab === 'content' && (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', color: '#94A3B8', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Caption / Script</label>
                    <textarea className="textarea-field" placeholder="Write your caption or script..." value={newContent.caption} onChange={e => setNewContent({ ...newContent, caption: e.target.value })} style={{ minHeight: '150px' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#94A3B8', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Suggested Hashtags</label>
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px' }}>
                      {getHashtags(newContent.platform, newContent.pillar).length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {getHashtags(newContent.platform, newContent.pillar).map((tag, i) => (
                            <span key={i} className="hashtag">{tag}</span>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: '#64748B', fontSize: '12px', margin: 0 }}>Select a platform and pillar to see suggested hashtags</p>
                      )}
                      <button className="btn btn-ghost btn-sm" style={{ marginTop: '10px' }} onClick={() => {
                        const tags = getHashtags(newContent.platform, newContent.pillar).join(' ');
                        setNewContent({ ...newContent, caption: newContent.caption + '\n\n' + tags });
                      }}>
                        Add to Caption
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'assets' && (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#94A3B8', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Asset Links</label>
                    
                    {newContent.assetLinks && newContent.assetLinks.map((link, index) => (
                      <div key={index} className="asset-link">
                        <span style={{ fontSize: '16px' }}>
                          {link.type === 'canva' ? '🎨' : link.type === 'drive' ? '📁' : '🔗'}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '500' }}>{link.label}</div>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#6366F1' }}>{link.url}</a>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleRemoveAssetLink(index)}>✕</button>
                      </div>
                    ))}

                    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '10px', color: '#64748B' }}>Type</label>
                        <select className="select-field" value={newAssetLink.type} onChange={e => setNewAssetLink({ ...newAssetLink, type: e.target.value })}>
                          <option value="canva">Canva</option>
                          <option value="drive">Drive</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '10px', color: '#64748B' }}>Label</label>
                        <input type="text" className="input-field" placeholder="e.g. Final Video" value={newAssetLink.label} onChange={e => setNewAssetLink({ ...newAssetLink, label: e.target.value })} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '10px', color: '#64748B' }}>URL</label>
                        <input type="text" className="input-field" placeholder="https://..." value={newAssetLink.url} onChange={e => setNewAssetLink({ ...newAssetLink, url: e.target.value })} />
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={handleAddAssetLink}>Add</button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'comments' && (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    {!newContent.comments || newContent.comments.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                        <p style={{ fontSize: '14px', margin: 0 }}>No comments yet</p>
                        <p style={{ fontSize: '12px', margin: '4px 0 0' }}>Start the conversation below</p>
                      </div>
                    ) : (
                      newContent.comments.map(comment => {
                        const author = getAssignee(comment.author);
                        return (
                          <div key={comment.id} className="comment-bubble">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: author?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                                {author?.avatar}
                              </div>
                              <span style={{ fontWeight: '600', fontSize: '13px' }}>{author?.name}</span>
                              <span style={{ fontSize: '11px', color: '#64748B' }}>
                                {new Date(comment.timestamp).toLocaleDateString()} {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>{comment.text}</p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" className="input-field" placeholder="Add a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddComment()} />
                    <button className="btn btn-primary" onClick={handleAddComment}>Send</button>
                  </div>
                </>
              )}

              {activeTab === 'approval' && (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#94A3B8', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reviewer</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className={`team-btn ${newContent.reviewer === null ? 'selected' : ''}`} style={{ background: 'rgba(255,255,255,0.1)', fontSize: '14px' }} onClick={() => setNewContent({ ...newContent, reviewer: null })} title="None">—</button>
                      {teamMembers.map(member => (
                        <button key={member.id} className={`team-btn ${newContent.reviewer === member.id ? 'selected' : ''}`} style={{ background: member.color }} onClick={() => setNewContent({ ...newContent, reviewer: member.id })} title={member.name}>
                          {member.avatar}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '20px' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600' }}>Approval Status</h4>
                    
                    {newContent.approvedBy ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>✓</div>
                        <div>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#10B981' }}>Approved</p>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                            By {getAssignee(newContent.approvedBy)?.name} on {new Date(newContent.approvedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ) : newContent.status === 'review' ? (
                      <div>
                        <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#F59E0B' }}>⏳ Awaiting review{newContent.reviewer ? ` from ${getAssignee(newContent.reviewer)?.name}` : ''}</p>
                        <button className="btn btn-success" onClick={handleApprove}>
                          ✓ Approve Content
                        </button>
                      </div>
                    ) : (
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                        Set status to "In Review" and assign a reviewer to enable approval workflow
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              {editingContent && (
                <button className="btn" style={{ background: '#EF4444', color: 'white', marginRight: 'auto' }} onClick={() => handleDeleteContent(editingContent.id)}>
                  Delete
                </button>
              )}
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddContent}>
                {editingContent ? 'Save Changes' : 'Add Content'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplateModal && (
        <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', fontFamily: "'Space Mono', monospace" }}>
                📋 Recurring Templates
              </h3>
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748B' }}>
                Click to create content from a template
              </p>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gap: '12px' }}>
                {recurringTemplates.map(template => {
                  const platform = platforms[template.platform];
                  const pillar = contentPillars[template.pillar];
                  return (
                    <div key={template.id} className="template-card" onClick={() => handleApplyTemplate(template)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '24px', color: platform.color }}>{platform.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', fontSize: '14px' }}>{template.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>
                            Every {dayNames[template.day]} • {platform.name} • {pillar.name}
                          </div>
                        </div>
                        <span style={{ fontSize: '18px' }}>{pillar.icon}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowTemplateModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCalendar;

