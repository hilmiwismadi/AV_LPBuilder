import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { scraperAPI, clientAPI } from '../services/api';
import AssignModal from '../components/AssignModal';
import './ScraperSessionDetailPage.css';

const ScraperSessionDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [assignments, setAssignments] = useState({}); // Track assignment status

  useEffect(() => {
    fetchSession();
  }, [slug]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const response = await scraperAPI.getSessionBySlug(slug);
      const data = response?.data || response;
      setSession(data);
      setPosts(data?.scrapedPosts || []);

      // Check assignment status for all posts
      if (data?.scrapedPosts) {
        checkAssignments(data.scrapedPosts);
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
      alert('Failed to load session');
      navigate('/scraper/history');
    } finally {
      setLoading(false);
    }
  };

  const checkAssignments = async (postsToCheck) => {
    const assignmentData = {};

    // Check each post for assignment status
    for (const post of postsToCheck) {
      if (post.phoneNumber1 || post.phoneNumber2) {
        try {
          const response = await clientAPI.checkAssignment(post.id);
          assignmentData[post.id] = response.data;
        } catch (error) {
          console.error(`Failed to check assignment for post ${post.id}:`, error);
          assignmentData[post.id] = { assigned: false };
        }
      }
    }

    setAssignments(assignmentData);
  };

  const exportToCSV = () => {
    const headers = ['Post Index', 'Event Title', 'Organizer', 'Phone 1', 'Phone 2', 'Location', 'Post URL'];
    const rows = filteredPosts.map(post => [
      post.postIndex,
      post.eventTitle || '',
      post.eventOrganizer || '',
      post.phoneNumber1 || '',
      post.phoneNumber2 || '',
      post.location || '',
      post.postUrl
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraper_${session?.username || 'export'}_${slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm ||
      post.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.eventOrganizer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.phoneNumber1?.includes(searchTerm);

    const matchesPhone = phoneFilter === 'all' ||
      (phoneFilter === 'with-phone' && (post.phoneNumber1 || post.phoneNumber2)) ||
      (phoneFilter === 'no-phone' && !post.phoneNumber1 && !post.phoneNumber2);

    return matchesSearch && matchesPhone;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  const handleAssign = (post) => {
    setSelectedPost(post);
    setShowAssignModal(true);
  };

  const handleAssigned = () => {
    setShowAssignModal(false);
    setSelectedPost(null);
    // Refresh assignments
    checkAssignments(posts);
    alert('Client assigned successfully!');
  };

  const handleCloseModal = () => {
    setShowAssignModal(false);
    setSelectedPost(null);
  };

  const getAssignmentDisplay = (post) => {
    const assignment = assignments[post.id];
    if (!assignment || !assignment.assigned) {
      return null;
    }

    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const isAssignedToYou = currentUser?.id === assignment.pic?.id;

    return (
      <span className={`assigned-tag ${isAssignedToYou ? 'assigned-to-you' : 'assigned-to-other'}`}>
        {isAssignedToYou ? 'Assigned to You' : `Assigned to ${assignment.pic?.email || assignment.pic?.name || 'someone'}`}
      </span>
    );
  };

  if (loading) {
    return <div className="scraper-detail-page loading">Loading session details...</div>;
  }

  return (
    <div className="scraper-detail-page">
      <div className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/scraper/history')}>
            ← Back to History
          </button>
          <h1>Scraping Session Details</h1>
          <p>@{session?.username} • {formatDate(session?.createdAt)}</p>
        </div>
        <div className="header-actions">
          <button className="action-btn" onClick={exportToCSV}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="session-info">
        <div className="info-card">
          <div className="info-label">Profile</div>
          <div className="info-value">@{session?.username}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Post Range</div>
          <div className="info-value">{session?.startPostIndex} - {session?.endPostIndex}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Total Scraped</div>
          <div className="info-value">{session?.successfulPosts}/{session?.totalPosts}</div>
        </div>
        <div className="info-card">
          <div className="info-label">With Phone</div>
          <div className="info-value">{session?.postsWithPhone}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Status</div>
          <div className="info-value">{session?.status}</div>
        </div>
      </div>

      <div className="posts-section">
        <div className="posts-header">
          <h2>Scraped Posts ({filteredPosts.length})</h2>
          <div className="posts-filters">
            <input
              type="text"
              className="search-input"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="phone-filter"
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
            >
              <option value="all">All Posts</option>
              <option value="with-phone">With Phone</option>
              <option value="no-phone">Without Phone</option>
            </select>
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="empty-state">No posts found matching your filters.</div>
        ) : (
          <div className="posts-table-container">
            <table className="posts-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Event Title</th>
                  <th>Organizer</th>
                  <th>Phone 1</th>
                  <th>Phone 2</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className={assignments[post.id]?.assigned ? 'row-assigned' : ''}>
                    <td>{post.postIndex + 1}</td>
                    <td>
                      <div className="event-title">{post.eventTitle || 'Untitled'}</div>
                      {getAssignmentDisplay(post)}
                      {post.imageUrl && (
                        <img src={post.imageUrl} alt="" className="post-thumbnail" />
                      )}
                    </td>
                    <td>{post.eventOrganizer || '-'}</td>
                    <td>{post.phoneNumber1 || '-'}</td>
                    <td>{post.phoneNumber2 || '-'}</td>
                    <td>{post.location || '-'}</td>
                    <td>{formatDate(post.postDate)}</td>
                    <td>
                      <button
                        className="assign-btn"
                        onClick={() => handleAssign(post)}
                      >
                        Assign
                      </button>
                      <a
                        href={post.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="post-link"
                      >
                        View Post
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAssignModal && selectedPost && (
        <AssignModal
          postId={selectedPost.id}
          postTitle={selectedPost.eventTitle || 'Untitled'}
          onClose={handleCloseModal}
          onAssigned={handleAssigned}
        />
      )}
    </div>
  );
};

export default ScraperSessionDetailPage;
