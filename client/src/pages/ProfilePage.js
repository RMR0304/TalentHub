import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import { SERVER_URL } from '../utils/constants';
import getColorFromUsername from '../utils/getColorFromUsername';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [profileRes, postsRes, userRes] = await Promise.all([
          api.get(`/api/users/${username}`),
          api.get(`/api/users/${username}/posts`),
          api.get('/api/user')
        ]);
        setProfile(profileRes.data);
        setUser(userRes.data);
        setBio(profileRes.data.bio || '');
        setDisplayName(profileRes.data.displayName || profileRes.data.username);
        const fetchedPosts = Array.isArray(postsRes.data.posts)
          ? postsRes.data.posts
          : postsRes.data;
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [username]);

  const handleUpdatePost = (updatedPost) => {
    console.log('Updating post in ProfilePage:', updatedPost);
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        console.log('Deleting post with ID:', postId);
        const response = await api.delete(`/api/posts/${postId}`);
        console.log('Delete response:', response);
        setPosts(prev => prev.filter(p => p._id !== postId));
        alert('Post deleted successfully!');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const totalLikes = posts.reduce((acc, post) => acc + (post.upvotes?.length || 0), 0);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const formData = new FormData();
      if (avatar) formData.append('avatar', avatar);
      formData.append('bio', bio);
      formData.append('displayName', displayName);
      
      const response = await api.put('/api/users/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setEditMode(false);
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.message || 'Failed to update profile. Please try again.');
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const formData = new FormData();
      formData.append('removeAvatar', 'true');
      await api.put('/api/users/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setAvatar(null);
      setAvatarPreview(null);
      window.location.reload();
    } catch (error) {
      console.error('Error removing avatar:', error);
      alert('Failed to remove avatar. Please try again.');
    }
  };

  if (loading || !user) return <div className="loading-spinner">Loading...</div>;
  if (!profile) return <div className="not-found">User not found</div>;

  return (
    <div className="profile-layout">
      <Sidebar 
        user={user}
        userPosts={user.username === profile.username ? posts : []}
        onLogout={handleLogout}
      /> 
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-image-container">
            {editMode ? (
              <div className="avatar-upload">
                <label htmlFor="avatar-input" className="avatar-upload-label">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="profile-image" />
                  ) : profile.avatar ? (
                    <img
                      src={`${SERVER_URL}/api/media/${profile.avatar}`}
                      alt="Current avatar"
                      className="profile-image"
                    />
                  ) : (
                    <div
                      className="profile-image"
                      style={{
                        backgroundColor: getColorFromUsername(profile.username),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '48px',
                        color: 'white'
                      }}
                    >
                      {profile.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="avatar-upload-overlay">
                    <span>Change Photo</span>
                  </div>
                </label>
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                {profile.avatar && (
                  <button
                    className="remove-avatar-btn"
                    onClick={handleRemoveAvatar}
                    title="Remove profile picture"
                  >
                    ×
                  </button>
                )}
              </div>
            ) : (
              <>
                {profile.avatar ? (
                  <>
                    <img
                      src={`${SERVER_URL}/api/media/${profile.avatar}`}
                      alt={`${profile.username}'s avatar`}
                      className="profile-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${profile.username}&background=random`;
                      }}
                    />
                    {user.username === profile.username && (
                      <button
                        className="remove-avatar-btn"
                        onClick={handleRemoveAvatar}
                        title="Remove profile picture"
                      >
                        ×
                      </button>
                    )}
                  </>
                ) : (
                  <div
                    className="profile-image"
                    style={{
                      backgroundColor: getColorFromUsername(profile.username),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px',
                      color: 'white'
                    }}
                  >
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="profile-info">
            {editMode ? (
              <div className="edit-profile-form">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display Name"
                  className="display-name-input"
                />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write something about yourself..."
                  className="bio-input"
                />
                <div className="edit-buttons">
                  <button onClick={handleProfileUpdate} className="save-btn">Save</button>
                  <button onClick={() => setEditMode(false)} className="cancel-btn">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="profile-username">{profile.username}</h1>
                {profile.displayName && profile.displayName !== profile.username && (
                  <h2 className="profile-display-name">{profile.displayName}</h2>
                )}
                <div className="profile-bio">{profile.bio || 'No bio yet'}</div>
                {user.username === profile.username && (
                  <button onClick={() => setEditMode(true)} className="edit-profile-btn">
                    Edit Profile
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        <div className="profile-posts">
          {posts.length > 0 ? (
            <div className="posts-grid">
              {posts.map((post) => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  onUpdatePost={handleUpdatePost} 
                  onDeletePost={user.username === profile.username ? handleDeletePost : null}
                  showDeleteButton={user.username === profile.username}
                />
              ))}
            </div>
          ) : (
            <div className="no-posts"><p>No posts yet</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;