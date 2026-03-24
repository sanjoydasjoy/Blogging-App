import { useContext, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserContext } from '../UserContext';
import { apiRequest, extractErrorMessage } from '../lib/api';

function StatCard({ label, value, hint }) {
  return (
    <article className="stat-card">
      <p className="meta-kicker">{label}</p>
      <h3>{value}</h3>
      <p>{hint}</p>
    </article>
  );
}

export default function DashboardPage() {
  const { userInfo, loading: authLoading } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userInfo?.id) {
      return;
    }

    let ignore = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');

        const [postResponse, bookmarkResponse] = await Promise.all([
          apiRequest('/post?limit=100&page=1&sort=newest'),
          apiRequest('/me/bookmarks'),
        ]);

        if (!ignore) {
          const allPosts = Array.isArray(postResponse?.posts) ? postResponse.posts : [];
          const myPosts = allPosts.filter(post => post?.author?._id === userInfo.id);
          setPosts(myPosts);
          setBookmarks(Array.isArray(bookmarkResponse) ? bookmarkResponse : []);
        }
      } catch (err) {
        if (!ignore) {
          setError(extractErrorMessage(err, 'Could not load dashboard right now'));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, [userInfo]);

  const totals = useMemo(() => {
    const totalLove = posts.reduce((sum, post) => sum + (post?.engagement?.reactions?.love || 0), 0);
    const totalBookmarks = posts.reduce((sum, post) => sum + (post?.engagement?.bookmarkCount || 0), 0);

    return {
      posts: posts.length,
      loves: totalLove,
      saved: totalBookmarks,
      library: bookmarks.length,
    };
  }, [posts, bookmarks]);

  if (!authLoading && !userInfo?.id) {
    return <Navigate to="/login" />;
  }

  return (
    <motion.section className="dashboard-shell" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
      <div className="dashboard-hero">
        <p className="meta-kicker">Profile Dashboard</p>
        <h1>Creator command center</h1>
        <p>
          Track content output, audience signals, and saved reading behavior from one streamlined place.
        </p>
      </div>

      {loading && <div className="status-box">Loading dashboard metrics...</div>}
      {error && <div className="status-box error-box">{error}</div>}

      {!loading && !error && (
        <div className="stats-grid">
          <StatCard label="Published" value={totals.posts} hint="Posts currently live" />
          <StatCard label="Love Signals" value={totals.loves} hint="Total hearts on your posts" />
          <StatCard label="Bookmarked" value={totals.saved} hint="Times your posts were saved" />
          <StatCard label="My Library" value={totals.library} hint="Stories you bookmarked" />
        </div>
      )}

      {!loading && !error && (
        <div className="dashboard-panels">
          <section className="section-block">
            <div className="section-head">
              <p className="meta-kicker">Recent Performance</p>
              <h2>Your latest posts</h2>
            </div>
            {posts.length === 0 && <div className="status-box">You have not published posts yet.</div>}
            {posts.slice(0, 5).map(post => (
              <article className="mini-row" key={post._id}>
                <h3>{post.title}</h3>
                <div className="mini-row-meta">
                  <span>♥ {post?.engagement?.reactions?.love || 0}</span>
                  <span>🔖 {post?.engagement?.bookmarkCount || 0}</span>
                </div>
              </article>
            ))}
          </section>

          <section className="section-block">
            <div className="section-head">
              <p className="meta-kicker">Saved Library</p>
              <h2>What you bookmarked</h2>
            </div>
            {bookmarks.length === 0 && <div className="status-box">No saved stories yet.</div>}
            {bookmarks.slice(0, 5).map(post => (
              <article className="mini-row" key={post._id}>
                <h3>{post.title}</h3>
                <div className="mini-row-meta">
                  <span>{post?.author?.username || 'Unknown'}</span>
                  <span>{post?.topic || 'general'}</span>
                </div>
              </article>
            ))}
          </section>
        </div>
      )}
    </motion.section>
  );
}
