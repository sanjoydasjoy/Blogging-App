import { useEffect, useMemo, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Link, Navigate, useParams } from 'react-router-dom';
import { apiRequest, extractErrorMessage } from '../lib/api';
import { motion } from 'framer-motion';

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
];

export default function EditPost() {
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('general');
  const [tags, setTags] = useState('');
  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadPost() {
      try {
        setLoading(true);
        setError('');
        const data = await apiRequest(`/post/${id}`);
        if (!ignore) {
          setTitle(data.title || '');
          setSummary(data.summary || '');
          setContent(data.content || '');
          setTopic(data.topic || 'general');
          setTags(Array.isArray(data.tags) ? data.tags.join(', ') : '');
        }
      } catch (err) {
        if (!ignore) {
          setError(extractErrorMessage(err, 'Could not load post for editing'));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadPost();

    return () => {
      ignore = true;
    };
  }, [id]);

  const canSubmit = useMemo(() => {
    return title.trim() && summary.trim() && content.trim();
  }, [title, summary, content]);

  async function updatePost(ev) {
    ev.preventDefault();

    if (!canSubmit) {
      setError('Title, summary, and content are required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const data = new FormData();
      data.append('title', title.trim());
      data.append('summary', summary.trim());
      data.append('content', content);
      data.append('topic', topic);
      data.append('tags', tags);

      if (files?.[0]) {
        data.append('file', files[0]);
      }

      await apiRequest(`/post/${id}`, {
        method: 'PUT',
        body: data,
      });

      setRedirect(true);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not update post'));
    } finally {
      setSaving(false);
    }
  }

  if (redirect) {
    return <Navigate to={`/post/${id}`} />;
  }

  if (loading) {
    return <div className="status-box">Loading editor...</div>;
  }

  return (
    <motion.section className="editor-shell" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div className="editor-head">
        <p className="meta-kicker">Update Story</p>
        <h1>Edit your post</h1>
      </div>

      <form className="editor-form" onSubmit={updatePost}>
        {error && <p className="inline-error">{error}</p>}

        <label htmlFor="post-title">Title</label>
        <input
          id="post-title"
          type="text"
          placeholder="Give your post a magnetic title"
          value={title}
          onChange={ev => setTitle(ev.target.value)}
        />

        <label htmlFor="post-summary">Summary</label>
        <input
          id="post-summary"
          type="text"
          placeholder="What is this article about?"
          value={summary}
          onChange={ev => setSummary(ev.target.value)}
        />

        <label htmlFor="post-cover">Replace cover image (optional)</label>
        <input id="post-cover" type="file" onChange={ev => setFiles(ev.target.files)} />

        <div className="editor-grid">
          <div>
            <label htmlFor="post-topic">Topic</label>
            <select
              id="post-topic"
              value={topic}
              onChange={ev => setTopic(ev.target.value)}
              className="app-select"
            >
              <option value="general">General</option>
              <option value="politics">Politics</option>
              <option value="culture">Culture</option>
              <option value="education">Education</option>
              <option value="ai">AI</option>
              <option value="technology">Technology</option>
              <option value="sports">Sports</option>
              <option value="business">Business</option>
              <option value="health">Health</option>
              <option value="environment">Environment</option>
              <option value="travel">Travel</option>
            </select>
          </div>

          <div>
            <label htmlFor="post-tags">Tags</label>
            <input
              id="post-tags"
              type="text"
              placeholder="comma,separated,tags"
              value={tags}
              onChange={ev => setTags(ev.target.value)}
            />
          </div>
        </div>

        <label>Content</label>
        <ReactQuill value={content} onChange={setContent} modules={modules} formats={formats} />

        <div className="editor-actions">
          <Link className="ghost-btn" to={`/post/${id}`}>Cancel</Link>
          <button disabled={saving} className="primary-btn" type="submit">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </motion.section>
  );
}
