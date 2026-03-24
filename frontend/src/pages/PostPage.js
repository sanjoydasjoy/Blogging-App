import { useContext, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL, apiRequest, extractErrorMessage } from '../lib/api';
import { UserContext } from '../UserContext';
import { motion } from 'framer-motion';

function HeartIcon({ filled }) {
  return (
    <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A5.5 5.5 0 0 1 12 5.09 5.5 5.5 0 0 1 22 8.5c0 3.78-3.4 6.86-8.55 11.54z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function BookmarkIcon({ filled }) {
  return (
    <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function resolveCoverUrl(cover) {
  if (!cover) {
    return '';
  }

  if (/^https?:\/\//i.test(cover)) {
    return cover;
  }

  return `${API_BASE_URL}/${cover}`;
}

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useContext(UserContext);

  const [postInfo, setPostInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function fetchPost() {
      try {
        setLoading(true);
        setError('');
        const data = await apiRequest(`/post/${id}`);
        if (!ignore) {
          setPostInfo(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(extractErrorMessage(err, 'Could not load this article'));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchPost();

    return () => {
      ignore = true;
    };
  }, [id]);

  const isAuthor = useMemo(() => {
    return userInfo?.id && postInfo?.author?._id && userInfo.id === postInfo.author._id;
  }, [userInfo, postInfo]);

  async function handleDelete() {
    const hasConfirmed = window.confirm('Delete this post permanently?');
    if (!hasConfirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      await apiRequest(`/post/${id}`, { method: 'DELETE' });
      setDeleted(true);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not delete post'));
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleBookmark() {
    if (!userInfo?.id) {
      navigate('/login');
      return;
    }

    try {
      setActionError('');
      const result = await apiRequest(`/post/${id}/bookmark`, { method: 'POST' });
      setPostInfo(prev => ({
        ...prev,
        engagement: {
          ...(prev?.engagement || {}),
          bookmarkCount: result.bookmarkCount,
          viewer: {
            ...(prev?.engagement?.viewer || {}),
            bookmarked: result.bookmarked,
          },
        },
      }));
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Could not update bookmark'));
    }
  }

  async function handleReaction(type) {
    if (!userInfo?.id) {
      navigate('/login');
      return;
    }

    try {
      setActionError('');
      const result = await apiRequest(`/post/${id}/reaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      setPostInfo(prev => ({
        ...prev,
        engagement: {
          ...(prev?.engagement || {}),
          reactions: result.counts,
          viewer: {
            ...(prev?.engagement?.viewer || {}),
            reaction: result.reaction,
          },
        },
      }));
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Could not update reaction'));
    }
  }

  if (deleted) {
    return <Navigate to="/" />;
  }

  if (loading) {
    return <div className="status-box">Loading story...</div>;
  }

  if (error) {
    return (
      <div className="status-box error-box">
        <p>{error}</p>
        <button className="ghost-btn" onClick={() => navigate('/')}>Go Back Home</button>
      </div>
    );
  }

  if (!postInfo) {
    return <div className="status-box">Post not found.</div>;
  }

  const coverUrl = resolveCoverUrl(postInfo.cover);

  return (
    <motion.article className="article-page" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <p className="meta-kicker">Featured Story</p>
      <h1>{postInfo.title}</h1>
      <p className="article-summary">{postInfo.summary}</p>

      <div className="article-meta-row">
        <span>By {postInfo.author?.username || 'Unknown Author'}</span>
        <time>{format(new Date(postInfo.createdAt), 'MMM d, yyyy HH:mm')}</time>
      </div>

      <div className="card-engagement">
        <button
          className={`engage-icon-btn ${postInfo?.engagement?.viewer?.bookmarked ? 'is-active' : ''}`}
          onClick={handleBookmark}
          type="button"
          aria-label="Toggle bookmark"
          title="Bookmark"
        >
          <BookmarkIcon filled={postInfo?.engagement?.viewer?.bookmarked} />
        </button>
        <button
          className={`engage-btn love-btn ${postInfo?.engagement?.viewer?.reaction === 'love' ? 'is-active' : ''}`}
          onClick={() => handleReaction('love')}
          type="button"
          aria-label="Love post"
        >
          <HeartIcon filled={postInfo?.engagement?.viewer?.reaction === 'love'} />
          <span>{postInfo?.engagement?.reactions?.love || 0}</span>
        </button>
      </div>
      {actionError && <p className="mini-error">{actionError}</p>}

      {isAuthor && (
        <div className="article-actions">
          <Link className="ghost-btn" to={`/edit/${postInfo._id}`}>Edit</Link>
          <button className="danger-btn" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}

      {coverUrl && (
        <img
          className="article-cover"
          src={coverUrl}
          alt={postInfo.title}
        />
      )}

      <div className="article-content" dangerouslySetInnerHTML={{ __html: postInfo.content }} />
    </motion.article>
  );
}
