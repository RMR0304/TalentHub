import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import '../styles/BookmarkPage.css';

const BookmarkPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
      
        const userRes = await api.get('/api/user');
        setUser(userRes.data);
        
        const bookmarksRes = await api.get('/api/users/me/bookmarks');
      
        const userBookmarks = bookmarksRes.data || [];
        setBookmarks(userBookmarks);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  const handleUpdateBookmark = (postId) => {
    setBookmarks(bookmarks.filter(post => post._id !== postId));
  };

  const handleUpdatePost = (updatedPost) => {
    console.log('Updating post in BookmarkPage:', updatedPost);
    setBookmarks(prevBookmarks => 
      prevBookmarks.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/users/me/bookmarks');
      setBookmarks(res.data || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="bookmarks-layout">
      <Sidebar 
        user={user} 
        onLogout={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }}
      />
      <div className="bookmarks-container">
        <h1>Your Bookmarks</h1>
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : bookmarks.length === 0 ? (
          <div className="no-bookmarks">No bookmarks yet</div>
        ) : (
          <div className="bookmarks-grid">
            {bookmarks.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onUpdatePost={handleUpdatePost}
                onBookmarkUpdate={handleUpdateBookmark}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkPage;
