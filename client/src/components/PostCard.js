import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, Trash2, Download } from 'react-feather';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { SERVER_URL } from '../utils/constants';
import getColorFromUsername from '../utils/getColorFromUsername';
import '../styles/PostCard.css';

const PostCard = ({ post = {}, onUpdatePost, onBookmarkUpdate, onDeletePost, showDeleteButton = false }) => {
  const safePost = {
    _id: post._id || '',
    author: post.author || { username: 'Unknown', avatar: '' },
    content: post.content || '',
    mediaType: post.mediaType || 'text',
    mediaUrl: post.mediaUrl || '',
    tags: Array.isArray(post.tags) ? post.tags : [],
    comments: Array.isArray(post.comments) ? post.comments : [],
    createdAt: post.createdAt || new Date().toISOString(),
    upvotes: post.upvotes || [],
  };

  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(safePost.upvotes.length);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(safePost.comments);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {

    const currentUser = JSON.parse(localStorage.getItem('user')) || {};
    const userId = currentUser.id;
   
    if (userId && Array.isArray(safePost.upvotes)) {
      setIsLiked(safePost.upvotes.includes(userId));
    } else {
      setIsLiked(false);
    }
    
    setLikes(Array.isArray(safePost.upvotes) ? safePost.upvotes.length : 0);
    
    try {
      const storedBookmarks = JSON.parse(localStorage.getItem('bookmarkedPosts'));
      
      let bookmarkedPosts = [];
      if (Array.isArray(storedBookmarks)) {
        bookmarkedPosts = storedBookmarks;
      } else if (storedBookmarks && typeof storedBookmarks === 'object') {
      
        bookmarkedPosts = Object.keys(storedBookmarks).filter(key => storedBookmarks[key]);
       
        localStorage.setItem('bookmarkedPosts', JSON.stringify(bookmarkedPosts));
      }
      
      setIsBookmarked(bookmarkedPosts.includes(safePost._id));
    } catch (error) {
      console.error('Error parsing bookmarks:', error);
      setIsBookmarked(false);
      localStorage.setItem('bookmarkedPosts', JSON.stringify([]));
    }
  }, [safePost._id, safePost.upvotes]);

  const handleLike = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {

      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      const userId = currentUser.id;
      
      console.log('Current user:', currentUser);
      console.log('User ID:', userId);
      console.log('Token:', localStorage.getItem('token'));
      
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      console.log('Sending upvote request for post:', safePost._id);
      const res = await api.post(`/api/posts/${safePost._id}/upvote`);
      console.log('Upvote response:', res.data);
      const updatedPost = res.data;
      
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      
      setLikes(prev => newIsLiked ? prev + 1 : prev - 1);
     
      if (onUpdatePost) {
        console.log('Updating parent component with new upvotes');
        onUpdatePost({
          ...safePost,
          upvotes: newIsLiked 
            ? [...safePost.upvotes, userId] 
            : safePost.upvotes.filter(id => id !== userId)
        });
      } else {
        console.log('No onUpdatePost function provided');
      }

      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
      if (newIsLiked) {
        if (!likedPosts.includes(safePost._id)) {
          likedPosts.push(safePost._id);
        }
      } else {
        const index = likedPosts.indexOf(safePost._id);
        if (index > -1) {
          likedPosts.splice(index, 1);
        }
      }
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
      
      console.log('Like updated successfully:', newIsLiked ? 'liked' : 'unliked');
    } catch (error) {
      console.error('Error updating like:', error);
      console.error('Error details:', error.response?.data);
 
      setIsLiked(!isLiked);
      setLikes(safePost.upvotes.length);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {

      const endpoint = isBookmarked
        ? `/api/posts/${safePost._id}/unbookmark`
        : `/api/posts/${safePost._id}/bookmark`;
      
      const res = await api.post(endpoint);
      const updatedPost = res.data;

      const currentUser = JSON.parse(localStorage.getItem('user'));

      setIsBookmarked(updatedPost.bookmarked);
  
      if (onBookmarkUpdate) {
        onBookmarkUpdate(safePost._id);
      }
      
      try {
        const storedBookmarks = JSON.parse(localStorage.getItem('bookmarkedPosts'));
        let bookmarkedPosts = Array.isArray(storedBookmarks) ? storedBookmarks : [];
        
        if (updatedPost.bookmarked) {
          if (!bookmarkedPosts.includes(safePost._id)) {
            bookmarkedPosts.push(safePost._id);
          }
        } else {
          bookmarkedPosts = bookmarkedPosts.filter(id => id !== safePost._id);
        }
        
        localStorage.setItem('bookmarkedPosts', JSON.stringify(bookmarkedPosts));
      } catch (error) {
        console.error('Error updating bookmarks in localStorage:', error);
        localStorage.setItem('bookmarkedPosts', JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const tempComment = {
      text: newComment,
      author: { username: 'You' }
    };

    setComments(prev => [...prev, tempComment]);
    setNewComment('');

    try {
      const res = await api.post(`/api/posts/${safePost._id}/comments`, { text: tempComment.text });
      setComments(res.data);
      if (onUpdatePost) onUpdatePost({ ...safePost, comments: res.data });
    } catch (error) {
      console.error('Could not add comment:', error);
      setComments(prev => prev.slice(0, -1)); 
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/post/${safePost._id}`;
    if (navigator.share) {
      navigator.share({
        title: `Post by ${safePost.author.username}`,
        text: safePost.content,
        url: shareUrl,
      }).catch(() => {
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleDelete = () => {
    console.log('Delete button clicked for post:', safePost._id);
    console.log('Current token:', localStorage.getItem('token'));
    if (onDeletePost) {
      onDeletePost(safePost._id);
    }
  };

  const handleDownload = async () => {
    if (safePost.mediaType === 'file' && safePost.mediaUrl) {
      try {
  
        let fileUrl = safePost.mediaUrl;
        if (!fileUrl.startsWith('http') && !fileUrl.startsWith(`${SERVER_URL}/api/media/`)) {
          fileUrl = `${SERVER_URL}/api/media/${fileUrl}`;
        }

        const response = await fetch(fileUrl);
        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
 
        const fileName = fileUrl.split('/').pop() || 'downloaded-file';
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
  
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading file:', error);
        alert('Failed to download file. Please try again.');
      }
    }
  };

  const renderComment = (comment, index) => (
    <div key={index} className="comment">
      <strong>{comment.author?.username || 'Unknown'}</strong> {comment.text}
    </div>
  );

  let mediaUrl = safePost.mediaUrl;
  if (
    safePost.mediaType === 'image' &&
    mediaUrl &&
    !mediaUrl.startsWith('http') &&
    !mediaUrl.startsWith(`${SERVER_URL}/api/media/`)
  ) {
    mediaUrl = `${SERVER_URL}/api/media/${mediaUrl}`;
  }

  return (
    <motion.div 
      className="post-card"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="post-header">
        {safePost.author.avatar && !imageError ? (
          <img
            src={`${SERVER_URL}/api/media/${safePost.author.avatar}`}
            alt={`${safePost.author.username}'s avatar`}
            className="profile-pic-small"
            onError={() => setImageError(true)}
          />
        ) : (
          <div 
            className="default-avatar"
            style={{ backgroundColor: getColorFromUsername(safePost.author.username) }}
          >
            {safePost.author.username.charAt(0).toUpperCase()}
          </div>
        )}
        
        <div className="user-details">
          <span className="username" title={safePost.author.username}>
            {safePost.author.username}
          </span>
          <span className="post-time">
            {formatDistanceToNow(new Date(safePost.createdAt), { addSuffix: true })}
          </span>
        </div>
        
        <div className="post-actions-header">
          {showDeleteButton && (
            <button 
              className="delete-btn" 
              onClick={handleDelete}
              aria-label="Delete post"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button className="more-btn" aria-label="More options">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>


      {safePost.mediaType === 'image' && mediaUrl && (
        <div className="post-media">
          <img
            src={mediaUrl}
            alt={safePost.content || "Post image"}
            className="post-image"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              const errorDiv = document.createElement('div');
              errorDiv.className = 'image-error-message';
              errorDiv.textContent = 'Image could not be loaded';
              e.target.parentNode.appendChild(errorDiv);
            }}
          />
        </div>
      )}

      {safePost.mediaType === 'video' && mediaUrl && (
        <div className="post-media">
          <video 
            src={mediaUrl}
            controls
            className="post-video"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              const errorDiv = document.createElement('div');
              errorDiv.className = 'video-error-message';
              errorDiv.textContent = 'Video could not be loaded';
              e.target.parentNode.appendChild(errorDiv);
            }}
          />
        </div>
      )}

      {safePost.mediaType === 'file' && safePost.mediaUrl && (
        <div className="post-file">
          <div className="file-info">
            <div className="file-icon">📄</div>
            <div className="file-details">
              <div className="file-name">{safePost.mediaUrl.split('/').pop() || 'File'}</div>
              <button className="download-btn" onClick={handleDownload}>
                <Download size={16} />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="post-details">
        <div className="caption">
    
          {safePost.content ? safePost.content : <span className="placeholder-text">No content to display.</span>}
        </div>

        {safePost.tags.length > 0 && (
          <div className="tags">
            {safePost.tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}

        {comments.length > 0 && (
          <div className="comments-section">
            <button
              className="view-comments"
              onClick={() => setShowComments(!showComments)}
            >
              {showComments ? 'Hide comments' : `View all ${comments.length} comments`}
            </button>
            {showComments ? (
              <div className="comments-list">
                {comments.map(renderComment)}
              </div>
            ) : (
              <div className="comment-preview">
                {renderComment(comments[0])}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleAddComment} className="add-comment">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="comment-input"
            aria-label="Add a comment"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="comment-submit"
          >
            Post
          </button>
        </form>
      </div>

      <div className="post-actions">
        <div className="left-actions">
          <button
            className={`action-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
            disabled={isLoading}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart size={28} fill={isLiked ? 'currentColor' : 'none'} />
            {likes > 0 && <span>{likes}</span>}
          </button>
          <button
            className="action-btn"
            onClick={() => setShowComments(!showComments)}
            aria-label="Comment"
          >
            <MessageCircle size={28} />
            {comments.length > 0 && <span>{comments.length}</span>}
          </button>
          <button
            className="action-btn"
            onClick={handleShare}
            aria-label="Share"
          >
            <Share2 size={28} />
          </button>
        </div>
        <button
          className={`action-btn ${isBookmarked ? 'bookmarked' : ''}`}
          onClick={handleBookmark}
          disabled={isLoading}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          <Bookmark size={28} fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>
    </motion.div>
  );
};

export default PostCard;
