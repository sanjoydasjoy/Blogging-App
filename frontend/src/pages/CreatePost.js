import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Link, Navigate } from 'react-router-dom';
import { apiRequest, extractErrorMessage } from '../lib/api';
import { motion } from 'framer-motion';

const modules = {
    toolbar: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image'
];

export default function CreatePost() {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [topic, setTopic] = useState('general');
    const [tags, setTags] = useState('');
    const [files, setFiles] = useState(null);
    const [redirect, setRedirect] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    async function createNewPost(ev) {
        ev.preventDefault();

        if (!title.trim() || !summary.trim() || !content.trim()) {
            setError('Please fill in title, summary, and content');
            return;
        }

        const data = new FormData();
        data.append('title', title.trim());
        data.append('summary', summary.trim());
        data.append('content', content);
        data.append('topic', topic);
        data.append('tags', tags);
        if (files?.[0]) {
            data.append('file', files[0]);
        }

        try {
            setIsSaving(true);
            setError('');
            await apiRequest('/post', {
                method: 'POST',
                body: data,
            });
            setRedirect(true)
        } catch (err) {
            setError(extractErrorMessage(err, 'Could not publish post'));
        } finally {
            setIsSaving(false);
        }
    }

    if(redirect){
        return <Navigate to={'/'} />
    }

    return (
        <motion.section className="editor-shell" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <div className="editor-head">
                <p className="meta-kicker">New Story</p>
                <h1>Create something people remember</h1>
            </div>

            <form className="editor-form" onSubmit={createNewPost}>
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

                <label htmlFor="post-cover">Cover Image (optional)</label>
                <input
                    id="post-cover"
                    type="file"
                    onChange={ev => setFiles(ev.target.files)}
                />

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
                <ReactQuill
                    value={content}
                    onChange={newValue => setContent(newValue)}
                    modules={modules}
                    formats={formats}
                />

                <div className="editor-actions">
                    <Link className="ghost-btn" to="/">Cancel</Link>
                    <button className="primary-btn" disabled={isSaving} type="submit">
                        {isSaving ? 'Publishing...' : 'Publish Story'}
                    </button>
                </div>
            </form>
        </motion.section>
    );
}
