import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="logo">🎨 Talent Hub 📚</div>
        <div className="auth-buttons">
          <button onClick={() => navigate('/login')} className="login-btn">Login</button>
          <button onClick={() => navigate('/signup')} className="signup-btn">Sign Up</button>
        </div>
      </header>

      <main className="landing-content">
        <section className="hero-section">
          <h1>Welcome to Talent Hub</h1>
          <p>Share your art. Exchange your stories. Connect with fellow creators.</p>
          <button className="cta-button" onClick={() => navigate('/signup')}>
            Join the Movement
          </button>
        </section>

        <section className="features-section">
          <div className="feature-card">
            <h3>🎨 Share Your Art</h3>
            <p>Upload your illustrations, designs, or crafts and get appreciated.</p>
          </div>
          <div className="feature-card">
            <h3>📚 Discover Books</h3>
            <p>Find and share rare reads, indie authors, and community reviews.</p>
          </div>
          <div className="feature-card">
            <h3>💬 Engage & Collaborate</h3>
            <p>Join vibrant discussions, get feedback, and collaborate with creators.</p>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© 2025 Talent Hub. Built for creators, by creators.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
