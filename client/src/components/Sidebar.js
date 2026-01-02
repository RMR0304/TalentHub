import React from 'react';
import { Link } from 'react-router-dom';
import { SERVER_URL } from '../utils/constants';
import getColorFromUsername from '../utils/getColorFromUsername';
import '../styles/Sidebar.css';

const Sidebar = ({ user, onLogout }) => {

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Talent Hub</h2>
      </div>

      <div className="user-profile">
        {user?.avatar ? (
          <img
            src={`${SERVER_URL}/api/media/${user.avatar}`}
            alt="Profile"
            className="profile-pic"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
             
              const defaultAvatar = document.createElement('div');
              defaultAvatar.className = 'default-avatar profile-pic';
              defaultAvatar.style.backgroundColor = getColorFromUsername(user?.username);
              defaultAvatar.innerText = user?.username ? user.username.charAt(0).toUpperCase() : '?';
              e.target.parentNode.appendChild(defaultAvatar);
            }}
          />
        ) : (
          <div
            className="default-avatar profile-pic"
            style={{ backgroundColor: getColorFromUsername(user?.username) }}
          >
            {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
          </div>
        )}
        <h3>{user?.username || 'User'}</h3>
      </div>

      <nav className="sidebar-nav">
        <Link to="/dashboard" className="nav-item">Home</Link>
        <Link to="/explore" className="nav-item">Explore</Link>
        <Link to="/saved" className="nav-item">Bookmarks</Link>
        <Link to={`/profile/${user?.username}`} className="nav-item">Profile</Link>
      </nav>

      <button className="logout-btn" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
