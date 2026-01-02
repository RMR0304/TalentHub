import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import Sidebar from '../components/Sidebar';
import '../styles/FeedPage.css';

const FeedPage = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [visiblePosts, setVisiblePosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('newest');
  const [selectedTag, setSelectedTag] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const navigate = useNavigate();

  const postsPerPage = 5;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/api/posts');

        if (res.data && Array.isArray(res.data.posts)) {
          setAllPosts(res.data.posts);
          setVisiblePosts(res.data.posts.slice(0, postsPerPage));
        } else {
          console.error('Unexpected response format:', res.data);
          setAllPosts([]);
          setVisiblePosts([]);
        }

        const tagsRes = await api.get('/api/tags');
        setAvailableTags(tagsRes.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setAllPosts([]);
        setVisiblePosts([]);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    let filteredPosts = [...allPosts];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredPosts = filteredPosts.filter(post => 
        post.title?.toLowerCase().includes(term) || 
        post.content?.toLowerCase().includes(term) ||
        post.author?.username?.toLowerCase().includes(term) ||
        (Array.isArray(post.tags) && post.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    if (selectedTag) {
      filteredPosts = filteredPosts.filter(post => 
        Array.isArray(post.tags) && post.tags.includes(selectedTag)
      );
    }

    filteredPosts.sort((a, b) => {
      if (selectedSort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (selectedSort === 'top') return (b.upvotes?.length || 0) - (a.upvotes?.length || 0);
      return 0;
    });
    
    setVisiblePosts(filteredPosts);
    setCurrentIndex(0);
    
    console.log(`Search applied: "${searchTerm}" - Found ${filteredPosts.length} posts`);
  }, [allPosts, searchTerm, selectedTag, selectedSort]);

  const handleNext = () => {
    const nextIndex = currentIndex + postsPerPage;
    if (nextIndex < visiblePosts.length) {
      setCurrentIndex(nextIndex);
    }
  };

  const handlePrevious = () => {
    const prevIndex = Math.max(0, currentIndex - postsPerPage);
    setCurrentIndex(prevIndex);
  };

  const handleCreatePost = (newPost) => {
    setAllPosts(prev => [newPost, ...prev]);
    setIsModalOpen(false);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/api/posts/${postId}`);
        setAllPosts(prev => prev.filter(p => p._id !== postId));
        alert('Post deleted successfully!');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const handleUpdatePost = (updatedPost) => {
    console.log('Updating post in FeedPage:', updatedPost);
    setAllPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      )
    );

    setVisiblePosts(prevPosts => 
      prevPosts.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isCurrentUser = (post) => post.author?._id === currentUser._id;

  return (
    <div className="main-layout">
      <Sidebar user={currentUser} onLogout={() => { localStorage.clear(); navigate('/'); }} />
      <div className="feed-container">
        <div className="feed-header">
          <h1>Talent Hub</h1>
          <div className="feed-actions">
            <div className="action-buttons">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="tag-filter"
                aria-label="Filter by tag"
              >
                <option value="">All Tags</option>
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>#{tag}</option>
                ))}
              </select>
              <select 
                value={selectedSort} 
                onChange={(e) => setSelectedSort(e.target.value)}
                className="sort-select"
                aria-label="Sort posts"
              >
                <option value="newest">Newest</option>
                <option value="top">Top</option>
              </select>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="create-post-btn"
              >
                Create Post
              </button>
            </div>
          </div>
        </div>

        
          <div className="posts-grid">
            {visiblePosts.length > 0 ? (
              visiblePosts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  onUpdatePost={handleUpdatePost}
                  onDeletePost={handleDeletePost}
                  showDeleteButton={isCurrentUser(post)}
                />
              ))
            ) : (
              <div className="no-posts">
                <p>No posts found. Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        )

        {visiblePosts.length > postsPerPage && !searchTerm && (
          <div className="pagination-controls">
            <button 
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="nav-button"
            >
              Previous
            </button>
            <span>Posts {currentIndex + 1}-{Math.min(currentIndex + postsPerPage, visiblePosts.length)} of {visiblePosts.length}</span>
            <button 
              onClick={handleNext}
              disabled={currentIndex + postsPerPage >= visiblePosts.length}
              className="nav-button"
            >
              Next
            </button>
          </div>
        )}

        {isModalOpen && (
          <CreatePostModal
            onClose={() => setIsModalOpen(false)}
            onCreate={handleCreatePost}
          />
        )}
      </div>
    </div>
  );
};

export default FeedPage;