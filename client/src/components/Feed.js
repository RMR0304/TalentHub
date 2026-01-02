import React from 'react';
import PostCard from './PostCard';
import '../styles/Feed.css';

const Feed = ({ posts, onUpdatePost }) => {
  console.log('Feed component rendering with posts:', posts);
  
  return (
    <div className="feed-container">
      <div className="stories-bar">
        <div className="story">Posts </div>
      </div>
      <div className="posts-grid">
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard 
              key={post._id} 
              post={post} 
              onUpdatePost={onUpdatePost} 
            />
          ))
        ) : (
          <div className="no-posts">
            <h3>No posts yet</h3>
            <p>Follow artists or create your first post!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
