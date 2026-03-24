import {useContext, useEffect, useState} from 'react';
import {format} from "date-fns"
import {Link, useNavigate} from "react-router-dom";
import { API_BASE_URL, apiRequest, extractErrorMessage } from './lib/api';
import { motion } from 'framer-motion';
import { UserContext } from './UserContext';

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

function stripHtml(html = '') {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
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

const defaultEngagement = {
  bookmarkCount: 0,
  reactions: {
    love: 0,
  },
  viewer: {
    bookmarked: false,
    reaction: null,
  },
};

export default function Post({_id,title,summary,cover,content,createdAt,author,topic,engagement}){
  const navigate = useNavigate();
  const { userInfo } = useContext(UserContext);
  const preview = stripHtml(content).slice(0, 320);
  const topicLabel = topic ? topic.charAt(0).toUpperCase() + topic.slice(1) : 'General';
  const [localEngagement, setLocalEngagement] = useState(engagement || defaultEngagement);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    setLocalEngagement(engagement || defaultEngagement);
  }, [_id, engagement]);

  async function handleBookmark() {
    if (!userInfo?.id) {
      navigate('/login');
      return;
    }

    try {
      setActionError('');
      const result = await apiRequest(`/post/${_id}/bookmark`, { method: 'POST' });
      setLocalEngagement(prev => ({
        ...prev,
        bookmarkCount: result.bookmarkCount,
        viewer: {
          ...prev.viewer,
          bookmarked: result.bookmarked,
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
      const result = await apiRequest(`/post/${_id}/reaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      setLocalEngagement(prev => ({
        ...prev,
        reactions: result.counts,
        viewer: {
          ...prev.viewer,
          reaction: result.reaction,
        },
      }));
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Could not update reaction'));
    }
  }

    const coverUrl = resolveCoverUrl(cover);

    return(
        <motion.article
          className="post-card"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.3 }}
          whileHover={{ y: -4 }}
        >
        <Link className="card-media" to={`/post/${_id}`}>
          {coverUrl ? (
            <img src={coverUrl} alt={title}/>
          ) : (
            <div className="image-fallback">No cover image</div>
          )}
        </Link>
        <div className="card-texts">
          <div className="card-meta-top">
            <p className="meta-kicker">{author?.username || 'Unknown Author'}</p>
            <span className="topic-chip">{topicLabel}</span>
          </div>
          <h2>
            <Link to={`/post/${_id}`}>{title}</Link>
          </h2>
          <p className="card-summary">{summary}</p>
          <p className="card-preview">{preview ? `${preview}...` : 'Open the article to continue reading.'}</p>
          <div className="card-engagement">
            <button
              className={`engage-icon-btn ${localEngagement?.viewer?.bookmarked ? 'is-active' : ''}`}
              onClick={handleBookmark}
              type="button"
              aria-label="Toggle bookmark"
              title="Bookmark"
            >
              <BookmarkIcon filled={localEngagement?.viewer?.bookmarked} />
            </button>
            <button
              className={`engage-btn love-btn ${localEngagement?.viewer?.reaction === 'love' ? 'is-active' : ''}`}
              onClick={() => handleReaction('love')}
              type="button"
              aria-label="Love post"
            >
              <HeartIcon filled={localEngagement?.viewer?.reaction === 'love'} />
              <span>{localEngagement?.reactions?.love || 0}</span>
            </button>
          </div>
          {actionError && <p className="mini-error">{actionError}</p>}
          <div className="card-footer">
            <time>{format(new Date(createdAt),'MMM d, yyyy HH:mm')}</time>
            <Link to={`/post/${_id}`} className="read-more-link">Read</Link>
          </div>
        </div>
      </motion.article>
    )
}