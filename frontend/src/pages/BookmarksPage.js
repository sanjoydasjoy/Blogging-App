import { useEffect, useState } from 'react';
import Post from '../post';
import { apiRequest, extractErrorMessage } from '../lib/api';

export default function BookmarksPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function fetchBookmarks() {
      try {
        setLoading(true);
        setError('');
        const data = await apiRequest('/me/bookmarks');
        if (!ignore) {
          setPosts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!ignore) {
          setError(extractErrorMessage(err, 'Could not load bookmarks'));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchBookmarks();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className="section-block">
      <div className="section-head">
        <p className="meta-kicker">Personal Library</p>
        <h2>Saved signal feed</h2>
      </div>

      {loading && <div className="status-box">Loading bookmarks...</div>}
      {error && <div className="status-box error-box">{error}</div>}

      {!loading && !error && posts.length === 0 && (
        <div className="status-box">No bookmarks yet. Save posts to read later.</div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="post-grid">
          {posts.map(post => (
            <Post key={post._id} {...post} />
          ))}
        </div>
      )}
    </section>
  );
}
