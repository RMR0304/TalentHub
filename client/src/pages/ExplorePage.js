import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import CreatePostModal from '../components/CreatePostModal';
import '../styles/ExplorePage.css';

const ExplorePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('newest');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await api.get('/api/user');
        setUser(userRes.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
     
      let sortParam;
      switch (activeTab) {
        case 'oldest':
          sortParam = 'oldest';
          break;
        case 'most-commented':
          sortParam = 'top';
          break;
        case 'trending':
          sortParam = 'trending';
          break;
        default:
          sortParam = 'newest';
      }
      
      console.log(`Fetching posts with sort: ${sortParam}`);
      const res = await api.get(`/api/posts?sort=${sortParam}`);

      if (res.data && Array.isArray(res.data.posts)) {
        console.log(`Received ${res.data.posts.length} posts`);
        setPosts(res.data.posts);
      } else {
        console.error('Unexpected response format:', res.data);
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const handleUpdatePost = (updatedPost) => {
    console.log('Updating post in ExplorePage:', updatedPost);
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };
  
  const handleCreatePost = async (newPost) => {
    console.log('New post created in ExplorePage:', newPost);
    if (newPost && posts) {
      setPosts([newPost, ...posts]);
    }
    
    try {
      const userRes = await api.get('/api/user');
      setUser(userRes.data);
    } catch (error) {
      console.error('Error fetching updated user data:', error);
    }
  };
  return (
    <div className="explore-layout">
      <Sidebar 
        user={user}
        onLogout={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }}
      />
      <div className="explore-container">
        <div className="explore-header">
          <h1>Explore Messages</h1>
          <button 
            className="create-post-button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Post
          </button>
        </div>
        <div className="explore-tabs">
          <button
            className={`tab-btn ${activeTab === 'newest' ? 'active' : ''}`}
            onClick={() => setActiveTab('newest')}
          >
            Newest Messages
          </button>
          <button
            className={`tab-btn ${activeTab === 'oldest' ? 'active' : ''}`}
            onClick={() => setActiveTab('oldest')}
          >
            Oldest Messages
          </button>
          <button
            className={`tab-btn ${activeTab === 'most-commented' ? 'active' : ''}`}
            onClick={() => setActiveTab('most-commented')}
          >
            Most Commented
          </button>
          <button
            className={`tab-btn ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveTab('trending')}
          >
            Trending
          </button>
        </div>
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : !posts || !Array.isArray(posts) ? (
          <div className="no-posts">No messages found</div>
        ) : posts.length === 0 ? (
          <div className="no-posts">No messages found</div>
        ) : (
          <div className="posts-grid">
            {posts.map(post => (
              <PostCard 
                key={post._id} 
                post={post} 
                onUpdatePost={handleUpdatePost}
              />
            ))}
          </div>
        )}
      </div>
      
      {isCreateModalOpen && (
        <CreatePostModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreatePost}
        />
      )}
    </div>
  );
};

export default ExplorePage;