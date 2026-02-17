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
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpTab, setHelpTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [newComment, setNewComment] = useState('');
  const [suggestion, setSuggestion] = useState({
    name: '',
    email: '',
    type: 'feature',
    message: '',
  });
  
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
    'Educational': { name: 'Educational', icon: '📚', color: '#DB2777' },
    'Testimonial': { name: 'Testimonial', icon: '💬', color: '#BE185D' },
    'Q&A': { name: 'Q&A', icon: '❓', color: '#9D174D' },
    'Behind-the-scenes': { name: 'Behind-the-scenes', icon: '🎬', color: '#EC4899' },
    'Product': { name: 'Product', icon: '📦', color: '#F472B6' },
    'Trending': { name: 'Trending', icon: '📈', color: '#F9A8D4' },
    'Promotional': { name: 'Promotional', icon: '📢', color: '#EC4899' },
    'Announcement': { name: 'Announcement', icon: '📣', color: '#F472B6' },
  };

  const contentPillars = {
    weightloss: { name: 'Weight Loss / GLP-1', color: '#10B981', icon: '⚖️' },
    trt: { name: 'TRT', color: '#6366F1', icon: '💪' },
    hrt: { name: 'HRT', color: '#EC4899', icon: '✨' },
    lifestyle: { name: 'Lifestyle & Wellness', color: '#F59E0B', icon: '🌿' },
    testimonials: { name: 'Patient Stories', color: '#8B5CF6', icon: '💬' },
  };
  
  const statuses = {
    draft: { label: 'Draft', color: '#9D174D', bg: '#F1F5F9' },
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
    setNewContent({
      ...content,
      comments: content.comments || [],
      assetLinks: content.assetLinks || [],
    });
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
      comments: [...(newContent.comments || []), comment],
    });
    setNewComment('');
  };

  const handleAddAssetLink = () => {
    if (!newAssetLink.url.trim() || !newAssetLink.label.trim()) return;
    setNewContent({
      ...newContent,
      assetLinks: [...(newContent.assetLinks || []), { ...newAssetLink }],
    });
    setNewAssetLink({ type: 'canva', url: '', label: '' });
  };

  const handleRemoveAssetLink = (index) => {
    setNewContent({
      ...newContent,
      assetLinks: (newContent.assetLinks || []).filter((_, i) => i !== index),
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
    targetDate.setDate(targetDate.getDate() + 1); // Start from tomorrow
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
    
    // Navigate to the month containing the new content
    setCurrentDate(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1));
    if (viewMode === 'week') {
      // For week view, set to the Sunday of that week
      const sunday = new Date(targetDate);
      sunday.setDate(targetDate.getDate() - targetDate.getDay());
      setCurrentWeekStart(sunday);
    }
    
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

  const handleSubmitSuggestion = () => {
    const currentUserData = getAssignee(currentUser);
    const userName = suggestion.name || currentUserData?.name || 'Anonymous';
    const userEmail = suggestion.email || '';
    
    const subject = `Content Calendar Suggestion: ${suggestion.type === 'feature' ? 'Feature Request' : suggestion.type === 'bug' ? 'Bug Report' : 'Feedback'}`;
    const body = `From: ${userName}${userEmail ? ` (${userEmail})` : ''}\nType: ${suggestion.type}\n\nMessage:\n${suggestion.message}`;
    
    // Open mailto link
    window.location.href = `mailto:daniel@fountain.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Reset form and close modal
    setSuggestion({ name: '', email: '', type: 'feature', message: '' });
    setShowSuggestionModal(false);
  };

  const handleDownloadCSV = () => {
    // Prepare Content CSV
    const contentHeaders = ['id', 'title', 'platform', 'assignee', 'status', 'type', 'pillar', 'publishDate', 'publishTime', 'deadline', 'caption', 'assetLinks', 'comments', 'reviewer', 'approvedBy', 'approvedAt', 'reminderSet'];
    
    const contentRows = contents.map(content => [
      content.id,
      content.title,
      content.platform,
      content.assignee,
      content.status,
      content.type,
      content.pillar,
      content.publishDate,
      content.publishTime || '',
      content.deadline || '',
      content.caption || '',
      JSON.stringify(content.assetLinks || []),
      JSON.stringify(content.comments || []),
      content.reviewer || '',
      content.approvedBy || '',
      content.approvedAt || '',
      content.reminderSet || false
    ]);

    const contentCSV = [
      contentHeaders.join(','),
      ...contentRows.map(row => row.map(cell => {
        // Escape commas and quotes in cell content
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(','))
    ].join('\n');

    // Prepare Team CSV
    const teamHeaders = ['id', 'name', 'avatar', 'color', 'role'];
    const teamRows = teamMembers.map(member => [
      member.id,
      member.name,
      member.avatar,
      member.color,
      member.role
    ]);

    const teamCSV = [
      teamHeaders.join(','),
      ...teamRows.map(row => row.join(','))
    ].join('\n');

    // Download Content CSV
    const contentBlob = new Blob([contentCSV], { type: 'text/csv;charset=utf-8;' });
    const contentLink = document.createElement('a');
    contentLink.href = URL.createObjectURL(contentBlob);
    contentLink.download = `Content_Export_${new Date().toISOString().split('T')[0]}.csv`;
    contentLink.click();

    // Download Team CSV
    setTimeout(() => {
      const teamBlob = new Blob([teamCSV], { type: 'text/csv;charset=utf-8;' });
      const teamLink = document.createElement('a');
      teamLink.href = URL.createObjectURL(teamBlob);
      teamLink.download = `Team_Export_${new Date().toISOString().split('T')[0]}.csv`;
      teamLink.click();
    }, 500);
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
          color: '#374151',
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
            <span style={{ fontSize: '10px', color: '#9D174D', fontWeight: '500' }}>
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
            <span style={{ fontSize: '10px', color: '#9D174D' }}>💬 {content.comments.length}</span>
          )}
          {content.reminderSet && (
            <span style={{ fontSize: '10px', color: '#9D174D' }}>🔔</span>
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
        background: 'linear-gradient(135deg, #FFF5F7 0%, #FCE7F3 50%, #FDF2F8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#831843',
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
      background: 'linear-gradient(135deg, #FFF5F7 0%, #FCE7F3 50%, #FDF2F8 100%)',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '20px',
      color: '#4B5563',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        
        * { box-sizing: border-box; }
        
        .calendar-day {
          background: rgba(255,255,255,0.8);
          border: 1px solid rgba(236, 72, 153, 0.2);
          border-radius: 12px;
          min-height: 120px;
          padding: 8px;
          transition: all 0.2s ease;
          cursor: pointer;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(236, 72, 153, 0.08);
        }
        
        .calendar-day:hover {
          background: #FFFFFF;
          border-color: rgba(236, 72, 153, 0.35);
        }
        
        .calendar-day.week-view {
          min-height: 400px;
        }
        
        .content-card {
          background: #FFFFFF;
          border-radius: 8px;
          padding: 8px 10px;
          margin-bottom: 6px;
          cursor: grab;
          transition: all 0.15s ease;
          border-left: 3px solid;
          box-shadow: 0 1px 4px rgba(236, 72, 153, 0.1);
          color: #374151;
        }
        
        .content-card:hover {
          background: #FDF2F8;
          transform: scale(1.02);
          box-shadow: 0 2px 8px rgba(236, 72, 153, 0.15);
        }
        
        .content-card.overdue {
          background: #FEE2E2;
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
          background: linear-gradient(135deg, #EC4899, #DB2777);
          color: white;
        }
        
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(236, 72, 153, 0.4);
        }
        
        .btn-success {
          background: linear-gradient(135deg, #DB2777, #BE185D);
          color: white;
        }
        
        .btn-ghost {
          background: transparent;
          color: #9D174D;
          border: 1px solid rgba(236, 72, 153, 0.3);
        }
        
        .btn-ghost:hover {
          background: rgba(236, 72, 153, 0.08);
          color: #831843;
        }
        
        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }
        
        .input-field {
          width: 100%;
          padding: 10px 12px;
          background: #FFFFFF;
          border: 1px solid rgba(236, 72, 153, 0.25);
          border-radius: 8px;
          color: #374151;
          font-size: 13px;
          transition: all 0.2s ease;
        }
        
        .input-field:focus {
          outline: none;
          border-color: #EC4899;
          background: #FFFBFF;
        }
        
        .textarea-field {
          width: 100%;
          padding: 10px 12px;
          background: #FFFFFF;
          border: 1px solid rgba(236, 72, 153, 0.25);
          border-radius: 8px;
          color: #374151;
          font-size: 13px;
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
        }
        
        .textarea-field:focus {
          outline: none;
          border-color: #EC4899;
        }
        
        .select-field {
          width: 100%;
          padding: 10px 12px;
          background: #FFFFFF;
          border: 1px solid rgba(236, 72, 153, 0.25);
          border-radius: 8px;
          color: #374151;
          font-size: 13px;
          cursor: pointer;
        }
        
        .select-field option {
          background: #FFFFFF;
          color: #374151;
        }
        
        .filter-select {
          padding: 8px 12px;
          background: #FFFFFF;
          border: 1px solid rgba(236, 72, 153, 0.25);
          border-radius: 8px;
          color: #831843;
          font-size: 12px;
          cursor: pointer;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(236, 72, 153, 0.15);
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
          background: linear-gradient(135deg, #FFFFFF, #FDF2F8);
          border-radius: 16px;
          width: 95%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid rgba(236, 72, 153, 0.2);
          box-shadow: 0 20px 60px rgba(236, 72, 153, 0.2);
          animation: slideUp 0.3s ease;
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(236, 72, 153, 0.2);
          position: sticky;
          top: 0;
          background: linear-gradient(135deg, #FFFFFF, #FDF2F8);
          z-index: 10;
        }
        
        .modal-body {
          padding: 20px 24px;
        }
        
        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid rgba(236, 72, 153, 0.2);
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          position: sticky;
          bottom: 0;
          background: linear-gradient(135deg, #FFFFFF, #FDF2F8);
        }
        
        .tab-btn {
          padding: 8px 16px;
          background: transparent;
          border: none;
          color: #9D174D;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
        }
        
        .tab-btn.active {
          color: #BE185D;
          border-bottom-color: #EC4899;
        }
        
        .tab-btn:hover {
          color: #831843;
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
          border-color: #EC4899;
          transform: scale(1.1);
        }
        
        .platform-btn {
          padding: 8px 14px;
          border-radius: 8px;
          border: 2px solid rgba(236, 72, 153, 0.3);
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 600;
          font-size: 12px;
        }
        
        .platform-btn.selected {
          border-color: currentColor;
          background: rgba(236, 72, 153, 0.12) !important;
        }
        
        .pillar-btn {
          padding: 6px 12px;
          border-radius: 6px;
          border: 2px solid rgba(236, 72, 153, 0.3);
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
          background: rgba(236, 72, 153, 0.08);
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 10px;
          border: 1px solid rgba(236, 72, 153, 0.15);
        }
        
        .asset-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: rgba(236, 72, 153, 0.06);
          border-radius: 8px;
          margin-bottom: 8px;
          border: 1px solid rgba(236, 72, 153, 0.12);
        }
        
        .hashtag {
          display: inline-block;
          padding: 4px 10px;
          background: rgba(236, 72, 153, 0.15);
          border-radius: 20px;
          font-size: 11px;
          color: #9D174D;
          margin: 2px;
        }
        
        .view-toggle {
          display: flex;
          background: rgba(255,255,255,0.8);
          border-radius: 8px;
          padding: 4px;
          border: 1px solid rgba(236, 72, 153, 0.2);
        }
        
        .view-toggle button {
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: #9D174D;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        
        .view-toggle button.active {
          background: rgba(236, 72, 153, 0.2);
          color: #831843;
        }
        
        .template-card {
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(236, 72, 153, 0.2);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .template-card:hover {
          background: #FDF2F8;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(236, 72, 153, 0.15);
        }
      `}</style>

      {/* Demo Data Banner */}
      {!import.meta.env.VITE_SHEETS_API_URL && (
        <div style={{
          background: 'linear-gradient(135deg, #EC4899, #DB2777)',
          color: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
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
            background: 'linear-gradient(135deg, #DB2777, #EC4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: "'Space Mono', monospace",
          }}>
            Content Calendar
          </h1>
          <p style={{ margin: '4px 0 0', color: '#9D174D', fontSize: '13px' }}>
            Organic Content Team • Fountain
            {syncing && <span style={{ marginLeft: '12px', color: '#EC4899' }}>🔄 Syncing...</span>}
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
          <button className="btn btn-ghost btn-sm" onClick={handleDownloadCSV}>
            📥 Download
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowSuggestionModal(true)}>
            💡 Suggestions
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowHelpModal(true)}>
            ❓ How It Works
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
        <span style={{ fontSize: '12px', color: '#9D174D', fontWeight: '600' }}>FILTERS:</span>
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
              <span style={{ marginLeft: 'auto', color: '#9D174D', fontWeight: '700' }}>{count}</span>
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
        background: 'rgba(255,255,255,0.6)',
        borderRadius: '16px',
        padding: '16px',
        border: '1px solid rgba(236, 72, 153, 0.15)',
      }}>
        {viewMode === 'month' ? (
          <>
            {/* Month View Headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '10px' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} style={{
                  textAlign: 'center',
                  padding: '8px',
                  color: '#9D174D',
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
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#9D174D', marginBottom: '6px' }}>
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
                      borderColor: isToday ? 'rgba(236, 72, 153, 0.5)' : undefined,
                    }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, dateKey)}
                    onClick={() => openModal(dateKey)}
                  >
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '12px',
                      paddingBottom: '8px',
                      borderBottom: '1px solid rgba(236, 72, 153, 0.15)',
                    }}>
                      <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {dayNames[date.getDay()].slice(0, 3)}
                      </div>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: isToday ? '#EC4899' : '#374151',
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
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', fontFamily: "'Space Mono', monospace", color: '#831843' }}>
                {editingContent ? 'Edit Content' : 'Add Content'}
              </h3>
              <div style={{ display: 'flex', gap: '0', marginTop: '12px', borderBottom: '1px solid rgba(236, 72, 153, 0.2)' }}>
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
                    <label style={{ display: 'block', marginBottom: '6px', color: '#9D174D', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title</label>
                    <input type="text" className="input-field" placeholder="Content title..." value={newContent.title} onChange={e => setNewContent({ ...newContent, title: e.target.value })} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', color: '#9D174D', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Publish Date</label>
                      <input type="date" className="input-field" value={newContent.publishDate} onChange={e => setNewContent({ ...newContent, publishDate: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', color: '#9D174D', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time</label>
                      <input type="time" className="input-field" value={newContent.publishTime} onChange={e => setNewContent({ ...newContent, publishTime: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', color: '#9D174D', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deadline</label>
                      <input type="date" className="input-field" value={newContent.deadline} onChange={e => setNewContent({ ...newContent, deadline: e.target.value })} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#9D174D', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Platform</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {Object.entries(platforms).map(([key, platform]) => (
                        <button key={key} className={`platform-btn ${newContent.platform === key ? 'selected' : ''}`} style={{ background: newContent.platform === key ? platform.bg : 'rgba(236, 72, 153, 0.06)', color: platform.color }} onClick={() => setNewContent({ ...newContent, platform: key })}>
                          {platform.icon} {platform.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#9D174D', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Content Pillar</label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {Object.entries(contentPillars).map(([key, pillar]) => (
                        <button key={key} className={`pillar-btn ${newContent.pillar === key ? 'selected' : ''}`} style={{ background: newContent.pillar === key ? `${pillar.color}20` : 'rgba(236, 72, 153, 0.06)', color: pillar.color }} onClick={() => setNewContent({ ...newContent, pillar: key })}>
                          {pillar.icon} {pillar.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#9D174D', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assign To</label>
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
                      <label style={{ display: 'block', marginBottom: '6px', color: '#9D174D', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
                      <select className="select-field" value={newContent.status} onChange={e => setNewContent({ ...newContent, status: e.target.value })}>
                        {Object.entries(statuses).map(([key, status]) => (
                          <option key={key} value={key}>{status.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', color: '#9D174D', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Content Type</label>
                      <select className="select-field" value={newContent.type} onChange={e => setNewContent({ ...newContent, type: e.target.value })}>
                        {Object.entries(contentTypes).map(([key, type]) => (
                          <option key={key} value={key}>{type.icon} {type.name}</option>
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
                    <label style={{ display: 'block', marginBottom: '6px', color: '#9D174D', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Caption / Script</label>
                    <textarea className="textarea-field" placeholder="Write your caption or script..." value={newContent.caption} onChange={e => setNewContent({ ...newContent, caption: e.target.value })} style={{ minHeight: '150px' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#9D174D', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Suggested Hashtags</label>
                    <div style={{ background: 'rgba(236, 72, 153, 0.06)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(236, 72, 153, 0.12)' }}>
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
                    <label style={{ display: 'block', marginBottom: '8px', color: '#9D174D', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Asset Links</label>
                    
                    {newContent.assetLinks && newContent.assetLinks.map((link, index) => (
                      <div key={index} className="asset-link">
                        <span style={{ fontSize: '16px' }}>
                          {link.type === 'canva' ? '🎨' : link.type === 'drive' ? '📁' : '🔗'}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '500' }}>{link.label}</div>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#DB2777' }}>{link.url}</a>
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
                    <label style={{ display: 'block', marginBottom: '8px', color: '#9D174D', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reviewer</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className={`team-btn ${newContent.reviewer === null ? 'selected' : ''}`} style={{ background: 'rgba(236, 72, 153, 0.1)', fontSize: '14px' }} onClick={() => setNewContent({ ...newContent, reviewer: null })} title="None">—</button>
                      {teamMembers.map(member => (
                        <button key={member.id} className={`team-btn ${newContent.reviewer === member.id ? 'selected' : ''}`} style={{ background: member.color }} onClick={() => setNewContent({ ...newContent, reviewer: member.id })} title={member.name}>
                          {member.avatar}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(236, 72, 153, 0.06)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(236, 72, 153, 0.12)' }}>
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
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', fontFamily: "'Space Mono', monospace", color: '#831843' }}>
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

      {/* Help Modal */}
      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', fontFamily: "'Space Mono', monospace", color: '#831843' }}>
                ❓ How the Content Calendar Works
              </h3>
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748B' }}>
                Quick guide to using the calendar
              </p>
              <div style={{ display: 'flex', gap: '0', marginTop: '12px', borderBottom: '1px solid rgba(236, 72, 153, 0.2)' }}>
                <button className={`tab-btn ${helpTab === 'overview' ? 'active' : ''}`} onClick={() => setHelpTab('overview')}>Overview</button>
                <button className={`tab-btn ${helpTab === 'creating' ? 'active' : ''}`} onClick={() => setHelpTab('creating')}>Creating Content</button>
                <button className={`tab-btn ${helpTab === 'features' ? 'active' : ''}`} onClick={() => setHelpTab('features')}>Features</button>
                <button className={`tab-btn ${helpTab === 'tips' ? 'active' : ''}`} onClick={() => setHelpTab('tips')}>Tips</button>
              </div>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {helpTab === 'overview' && (
                <>
                  <h4 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '600', color: '#831843' }}>🎯 What is This?</h4>
                  <p style={{ margin: '0 0 16px', fontSize: '13px', lineHeight: '1.6', color: '#4B5563' }}>
                    The Content Calendar helps you plan, schedule, and manage social media content across TikTok, Instagram, and YouTube. 
                    All content syncs with Google Sheets in real-time.
                  </p>

                  <h4 style={{ margin: '16px 0 12px', fontSize: '15px', fontWeight: '600', color: '#831843' }}>📊 Key Sections</h4>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div style={{ padding: '10px', background: 'rgba(236, 72, 153, 0.06)', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.12)' }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>📅 Calendar Views</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Switch between Month and Week views to see your content schedule</div>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(236, 72, 153, 0.06)', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.12)' }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>🔍 Filters</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Filter by team member, platform, status, pillar, or content type</div>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(236, 72, 153, 0.06)', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.12)' }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>📊 Status Tracker</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>See how many items are in Draft, Review, Approved, Scheduled, and Published</div>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(236, 72, 153, 0.06)', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.12)' }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>🎴 Content Cards</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Each card shows platform, pillar, assignee, status, time, and more</div>
                    </div>
                  </div>

                  <h4 style={{ margin: '16px 0 12px', fontSize: '15px', fontWeight: '600', color: '#831843' }}>🎨 Understanding Content Cards</h4>
                  <div style={{ padding: '12px', background: 'rgba(236, 72, 153, 0.06)', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.12)' }}>
                    <div style={{ fontSize: '12px', lineHeight: '1.8', color: '#4B5563' }}>
                      <div><strong>♪ ◎ ▶</strong> = Platform icons (TikTok, Instagram, YouTube)</div>
                      <div><strong>⚖️ 💪 ✨ 🌿 💬</strong> = Content pillars (Weight Loss, TRT, HRT, Lifestyle, Testimonials)</div>
                      <div><strong>Colored pill</strong> = Status (Draft, Review, Approved, etc.)</div>
                      <div><strong>🕐 Time</strong> = Publish time</div>
                      <div><strong>💬 Number</strong> = Comment count</div>
                      <div><strong>🔔</strong> = Reminder set</div>
                      <div><strong>⚠ Overdue</strong> = Deadline passed</div>
                    </div>
                  </div>
                </>
              )}

              {helpTab === 'creating' && (
                <>
                  <h4 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '600', color: '#831843' }}>➕ Creating New Content</h4>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '8px' }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px', color: '#059669' }}>Method 1: Click Any Day</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Click an empty space on any calendar day to create content for that date</div>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '8px' }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px', color: '#059669' }}>Method 2: Use Templates</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Click 📋 Templates button to quick-create recurring content like "Transformation Tuesday"</div>
                    </div>
                  </div>

                  <h4 style={{ margin: '16px 0 12px', fontSize: '15px', fontWeight: '600', color: '#831843' }}>📝 Content Form Tabs</h4>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div style={{ padding: '10px', background: 'rgba(236, 72, 153, 0.06)', borderRadius: '8px' }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>⚙️ Details</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Title, platform, publish date/time, deadline, assignee, status, type, and pillar</div>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(236, 72, 153, 0.06)', borderRadius: '8px' }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>📝 Content</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Write your caption/script + get smart hashtag suggestions based on platform & pillar</div>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(236, 72, 153, 0.06)', borderRadius: '8px' }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>🎨 Assets</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Add links to Canva designs, Google Drive files, or other resources</div>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(236, 72, 153, 0.06)', borderRadius: '8px' }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>💬 Comments</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Collaborate with team - add feedback, notes, and discussions</div>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(236, 72, 153, 0.06)', borderRadius: '8px' }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>✅ Approval</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Assign reviewer and track approval status with timestamps</div>
                    </div>
                  </div>

                  <h4 style={{ margin: '16px 0 12px', fontSize: '15px', fontWeight: '600', color: '#831843' }}>📋 Status Workflow</h4>
                  <div style={{ padding: '12px', background: 'rgba(236, 72, 153, 0.06)', borderRadius: '8px', fontSize: '12px', lineHeight: '1.8', color: '#4B5563' }}>
                    <div><strong>Draft</strong> → Initial creation</div>
                    <div><strong>In Review</strong> → Awaiting approval from reviewer</div>
                    <div><strong>Approved</strong> → Ready to schedule</div>
                    <div><strong>Scheduled</strong> → Queued for publishing</div>
                    <div><strong>Published</strong> → Live on platform</div>
                  </div>
                </>
              )}

              {helpTab === 'features' && (
                <>
                  <h4 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '600', color: '#831843' }}>🖱️ Drag & Drop</h4>
                  <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(236, 72, 153, 0.06)', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.12)' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '13px', lineHeight: '1.6', color: '#4B5563' }}>
                      Reschedule content instantly by dragging cards to different days:
                    </p>
                    <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#64748B' }}>
                      <li>Click and hold any content card</li>
                      <li>Drag to a different day</li>
                      <li>Release to drop</li>
                      <li>✅ Updates immediately and syncs to Google Sheets</li>
                    </ol>
                  </div>

                  <h4 style={{ margin: '16px 0 12px', fontSize: '15px', fontWeight: '600', color: '#831843' }}>🔍 Smart Filters</h4>
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#4B5563' }}>Filter your calendar to focus on specific content:</p>
                    <div style={{ display: 'grid', gap: '8px', fontSize: '12px' }}>
                      <div style={{ padding: '8px', background: 'rgba(236, 72, 153, 0.06)', borderRadius: '6px' }}>
                        <strong>Team:</strong> See only content assigned to specific members
                      </div>
                      <div style={{ padding: '8px', background: 'rgba(236, 72, 153, 0.06)', borderRadius: '6px' }}>
                        <strong>Platform:</strong> Filter by TikTok, Instagram, or YouTube
                      </div>
                      <div style={{ padding: '8px', background: 'rgba(236, 72, 153, 0.06)', borderRadius: '6px' }}>
                        <strong>Status:</strong> Show only drafts, in review, approved, etc.
                      </div>
                      <div style={{ padding: '8px', background: 'rgba(236, 72, 153, 0.06)', borderRadius: '6px' }}>
                        <strong>Pillar:</strong> Filter by content pillar (Weight Loss, TRT, HRT, etc.)
                      </div>
                      <div style={{ padding: '8px', background: 'rgba(236, 72, 153, 0.06)', borderRadius: '6px' }}>
                        <strong>Type:</strong> Filter by content type (Educational, Testimonial, Q&A, etc.)
                      </div>
                    </div>
                  </div>

                  <h4 style={{ margin: '16px 0 12px', fontSize: '15px', fontWeight: '600', color: '#831843' }}>📱 Views</h4>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div style={{ padding: '10px', background: 'rgba(236, 72, 153, 0.06)', borderRadius: '8px' }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>📅 Month View</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Overview of the entire month - great for long-term planning. Shows up to 3 items per day.</div>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(236, 72, 153, 0.06)', borderRadius: '8px' }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>📊 Week View</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Detailed view of one week - shows ALL content with more space. Today is highlighted.</div>
                    </div>
                  </div>

                  <h4 style={{ margin: '16px 0 12px', fontSize: '15px', fontWeight: '600', color: '#831843' }}>🔄 Real-Time Sync</h4>
                  <div style={{ padding: '12px', background: 'rgba(236, 72, 153, 0.06)', borderRadius: '8px', fontSize: '12px', lineHeight: '1.8', color: '#4B5563' }}>
                    <div>✅ Changes appear instantly on your calendar</div>
                    <div>✅ Syncs to Google Sheets in the background</div>
                    <div>✅ Auto-refreshes every 60 seconds</div>
                    <div>✅ Other team members see updates automatically</div>
                  </div>

                  <h4 style={{ margin: '16px 0 12px', fontSize: '15px', fontWeight: '600', color: '#831843' }}>#️⃣ Smart Hashtags</h4>
                  <div style={{ padding: '12px', background: 'rgba(236, 72, 153, 0.06)', borderRadius: '8px', fontSize: '12px', lineHeight: '1.6', color: '#4B5563' }}>
                    Get platform-specific hashtag suggestions based on your content pillar! The calendar automatically suggests relevant hashtags for each platform + pillar combination. Click "Add to Caption" to insert them.
                  </div>
                </>
              )}

              {helpTab === 'tips' && (
                <>
                  <h4 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '600', color: '#831843' }}>💡 Pro Tips</h4>
                  
                  <h5 style={{ margin: '16px 0 8px', fontSize: '14px', fontWeight: '600', color: '#9D174D' }}>Planning</h5>
                  <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                      <span>✅</span>
                      <span>Use <strong>Week View</strong> for detailed day-by-day scheduling</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                      <span>✅</span>
                      <span>Use <strong>Month View</strong> to spot gaps in your content calendar</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                      <span>✅</span>
                      <span>Set <strong>deadlines 2-3 days before</strong> publish date</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                      <span>✅</span>
                      <span>Plan <strong>2-4 weeks ahead</strong> for best results</span>
                    </div>
                  </div>

                  <h5 style={{ margin: '16px 0 8px', fontSize: '14px', fontWeight: '600', color: '#9D174D' }}>Workflow</h5>
                  <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                      <span>✅</span>
                      <span>Use <strong>Templates</strong> for recurring content to save time</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                      <span>✅</span>
                      <span>Create content in <strong>batches</strong> - it's more efficient</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                      <span>✅</span>
                      <span>Set status to <strong>In Review</strong> when ready for feedback</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                      <span>✅</span>
                      <span>Check for <strong>⚠ Overdue</strong> items daily</span>
                    </div>
                  </div>

                  <h5 style={{ margin: '16px 0 8px', fontSize: '14px', fontWeight: '600', color: '#9D174D' }}>Team Collaboration</h5>
                  <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                      <span>✅</span>
                      <span>Use <strong>Comments</strong> to discuss content without external tools</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                      <span>✅</span>
                      <span>Assign <strong>Reviewers</strong> for quality control</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                      <span>✅</span>
                      <span>Filter by your name to see <strong>only your tasks</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                      <span>✅</span>
                      <span>Link <strong>all assets</strong> in the Assets tab for easy access</span>
                    </div>
                  </div>

                  <h5 style={{ margin: '16px 0 8px', fontSize: '14px', fontWeight: '600', color: '#9D174D' }}>Content Strategy</h5>
                  <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                      <span>✅</span>
                      <span><strong>Balance content pillars</strong> across the week</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                      <span>✅</span>
                      <span><strong>Vary content types</strong> - mix educational, testimonials, Q&A</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                      <span>✅</span>
                      <span>Check <strong>Published</strong> filter to see what's performing</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                      <span>✅</span>
                      <span>Use <strong>suggested hashtags</strong> for better reach</span>
                    </div>
                  </div>

                  <h5 style={{ margin: '16px 0 8px', fontSize: '14px', fontWeight: '600', color: '#9D174D' }}>Quick Actions</h5>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                      <span>🖱️</span>
                      <span><strong>Click empty day</strong> → Create content</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                      <span>🖱️</span>
                      <span><strong>Click content card</strong> → Edit/view details</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                      <span>🖱️</span>
                      <span><strong>Drag card</strong> → Reschedule to different day</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                      <span>⌨️</span>
                      <span><strong>Press Enter</strong> → Submit comment (in comment field)</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#059669', marginBottom: '6px' }}>💡 Need More Help?</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      Click the <strong>💡 Suggestions</strong> button to send feedback or ask questions!
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowHelpModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Suggestion Modal */}
      {showSuggestionModal && (
        <div className="modal-overlay" onClick={() => setShowSuggestionModal(false)}>
          <div className="modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', fontFamily: "'Space Mono', monospace", color: '#831843' }}>
                💡 Submit Suggestion
              </h3>
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748B' }}>
                Share your ideas, report bugs, or give feedback
              </p>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#9D174D', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Your Name (Optional)
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Your name..." 
                  value={suggestion.name} 
                  onChange={e => setSuggestion({ ...suggestion, name: e.target.value })} 
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#9D174D', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Your Email (Optional)
                </label>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="your.email@example.com" 
                  value={suggestion.email} 
                  onChange={e => setSuggestion({ ...suggestion, email: e.target.value })} 
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#9D174D', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Suggestion Type
                </label>
                <select 
                  className="select-field" 
                  value={suggestion.type} 
                  onChange={e => setSuggestion({ ...suggestion, type: e.target.value })}
                >
                  <option value="feature">💡 Feature Request</option>
                  <option value="bug">🐛 Bug Report</option>
                  <option value="improvement">✨ Improvement</option>
                  <option value="feedback">💬 General Feedback</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#9D174D', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Message *
                </label>
                <textarea 
                  className="textarea-field" 
                  placeholder="Describe your suggestion, bug, or feedback..." 
                  value={suggestion.message} 
                  onChange={e => setSuggestion({ ...suggestion, message: e.target.value })} 
                  style={{ minHeight: '120px' }}
                  required
                />
              </div>

              <div style={{ 
                background: 'rgba(236, 72, 153, 0.08)', 
                borderRadius: '8px', 
                padding: '12px', 
                fontSize: '12px', 
                color: '#64748B',
                border: '1px solid rgba(236, 72, 153, 0.15)'
              }}>
                📧 This will open your email client to send to <strong style={{ color: '#831843' }}>daniel@fountain.net</strong>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowSuggestionModal(false)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={handleSubmitSuggestion}
                disabled={!suggestion.message.trim()}
              >
                📧 Send Suggestion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCalendar;

