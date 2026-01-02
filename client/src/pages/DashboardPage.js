// pages/DashboardPage.js
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import api from '../utils/api';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await api.get('/api/user');
      console.log('User data:', res.data); 
      setUser(res.data);
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Failed to load user data. Please try logging in again.');
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get('/api/posts');
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchPosts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };
  
  const handleCreatePost = (newPost) => {
    console.log('New post created:', newPost);
    setPosts([newPost, ...posts]);
    fetchUser();
  };

  const handleUpdatePost = (updatedPost) => {
    console.log('Updating post in DashboardPage:', updatedPost);
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar user={user} posts={posts} onLogout={handleLogout} />
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Home Feed</h1>
          <button 
            className="create-post-button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Post
          </button>
        </div>
        
        {loading ? (
          <div className="loading-spinner"></div>
        ) : (
          <div className="main-feed">
            {posts.length > 0 ? (
              posts.map(post => (
                <PostCard key={post._id} post={post} onUpdatePost={handleUpdatePost} />
              ))
            ) : (
              <div className="no-posts-message">
                <h3>No posts yet</h3>
                <p>Be the first to create a post!</p>
                <button 
                  className="create-first-post-button"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Create Your First Post
                </button>
              </div>
            )}
          </div>
        )}
        
        {isCreateModalOpen && (
          <CreatePostModal
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreatePost}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
