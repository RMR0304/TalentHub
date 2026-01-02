import React from 'react';
import '../styles/CommentSection.css';

const CommentSection = ({ comments, newComment, onCommentChange, onAddComment }) => {
  return (
    <div className="comment-section">
      <div className="comments-list">
        {comments.map((comment, index) => (
          <div key={index} className="comment">
            <div className="comment-author">{comment.author.username}</div>
            <div className="comment-text">{comment.text}</div>
          </div>
        ))}
      </div>
      
      <div className="add-comment">
        <input
          type="text"
          value={newComment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Add a comment..."
          className="comment-input"
        />
        <button 
          onClick={onAddComment}
          disabled={!newComment.trim()}
          className="comment-submit"
        >
          Post
        </button>
      </div>
    </div>
  );
};

export default CommentSection;