import Post from "../post"
import {useState,useEffect} from 'react'
import { apiRequest, extractErrorMessage } from '../lib/api';
import { motion } from 'framer-motion';

const topicCards = [
    {
        title: 'Engineering',
        description: 'Architecture notes, system design, and pragmatic implementation details.',
    },
    {
        title: 'Product',
        description: 'How product decisions are made, validated, and iterated with users.',
    },
    {
        title: 'Design',
        description: 'Interface craft, interaction quality, and editorial presentation standards.',
    },
    {
        title: 'Career',
        description: 'Learning logs, growth reflections, and career-building strategies.',
    },
];

const curatedFallback = [
    {
        title: 'Building Software With Better Tradeoffs',
        summary: 'A practical guide to balancing speed, quality, and long-term maintainability.',
    },
    {
        title: 'Why Editorial UX Still Matters',
        summary: 'How clean information hierarchy improves reading time and retention.',
    },
    {
        title: 'From Side Project to Portfolio Asset',
        summary: 'Turning a small app into a production-quality showcase recruiters notice.',
    },
];

function toTopicLabel(topic) {
    if (!topic || typeof topic !== 'string') {
        return 'General';
    }

    return topic
        .split('-')
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}


export default function IndexPage() {
    const [posts, setPosts] = useState([])
    const [topicOptions, setTopicOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        let ignore = false;

        async function fetchPosts() {
            try {
                setLoading(true);
                const queryParams = new URLSearchParams({
                    limit: '30',
                    page: '1',
                    sort: sortBy,
                });

                if (selectedTopic !== 'all') {
                    queryParams.set('topic', selectedTopic);
                }

                const hasSearch = !!searchText.trim();
                const endpoint = hasSearch
                    ? `/search/semantic?q=${encodeURIComponent(searchText.trim())}&topic=${encodeURIComponent(selectedTopic)}&limit=30&page=1`
                    : `/post?${queryParams.toString()}`;

                const response = await apiRequest(endpoint);
                const normalizedPosts = Array.isArray(response)
                    ? response
                    : (response?.posts || []);
                if (!ignore) {
                    setPosts(normalizedPosts);
                }
            } catch (err) {
                if (!ignore) {
                    setError(extractErrorMessage(err, 'Could not load stories right now'));
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        fetchPosts();

        return () => {
            ignore = true;
        };
    }, [selectedTopic, searchText, sortBy]);

    useEffect(() => {
        let ignore = false;

        async function fetchTopics() {
            try {
                const topics = await apiRequest('/topics');
                if (!ignore) {
                    setTopicOptions(Array.isArray(topics) ? topics : []);
                }
            } catch {
                if (!ignore) {
                    setTopicOptions([]);
                }
            }
        }

        fetchTopics();

        return () => {
            ignore = true;
        };
    }, []);

    return (
        <motion.section className="home-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
            <motion.div className="hero-panel" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
                <p className="meta-kicker">Scriptoria</p>
                <h1>Signal-first stories for founders, creators, and operators.</h1>
                <p>
                    A modern publishing space for thoughtful articles, practical ideas,
                    and clean reading experience.
                </p>

                <div className="hero-actions">
                    <a className="primary-btn" href="#latest">Explore feed</a>
                    <a className="ghost-btn" href="#topics">View signals</a>
                </div>

                <div className="hero-meta-row">
                    <span>Semantic discovery</span>
                    <span>Heart + bookmark signals</span>
                    <span>Creator dashboard ready</span>
                </div>

            </motion.div>

            <motion.section id="latest" className="section-block" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.25 }}>
                <div className="section-head">
                    <p className="meta-kicker">Latest</p>
                    <h2>Recent writing</h2>
                    {searchText.trim() && <p className="semantic-hint">Semantic search is active</p>}
                </div>

            <div className="filter-bar">
                <input
                    type="text"
                    placeholder="Search by title or summary"
                    value={searchText}
                    onChange={ev => setSearchText(ev.target.value)}
                />

                <select className="app-select" value={selectedTopic} onChange={ev => setSelectedTopic(ev.target.value)}>
                    <option value="all">All Topics</option>
                    {topicOptions.map(item => (
                        <option key={`${item.topic || 'general'}-${item.count || 0}`} value={item.topic || 'general'}>
                            {toTopicLabel(item.topic)} ({item.count || 0})
                        </option>
                    ))}
                </select>

                <select className="app-select" value={sortBy} onChange={ev => setSortBy(ev.target.value)}>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                </select>
            </div>

            {loading && <div className="status-box">Loading latest stories...</div>}
            {error && (
                <div className="status-box error-box">
                    {error}
                    <div className="status-help">Start backend server to load database content.</div>
                </div>
            )}

            {!loading && !error && posts.length === 0 && (
                <div className="status-box">No entries published yet. Start with your first post.</div>
            )}

            {!loading && !error && posts.length > 0 && (
                <div className="post-grid">
                    {posts.map(post => (
                        <Post key={post._id} {...post} />
                    ))}
                </div>
            )}

            {error && (
                <div className="curated-grid">
                    {curatedFallback.map(item => (
                        <article className="curated-card" key={item.title}>
                            <p className="meta-kicker">Editor Pick</p>
                            <h3>{item.title}</h3>
                            <p>{item.summary}</p>
                        </article>
                    ))}
                </div>
            )}
            </motion.section>

            <motion.section id="topics" className="section-block" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.25 }}>
                <div className="section-head">
                    <p className="meta-kicker">Topics</p>
                    <h2>Explore by strategic area</h2>
                </div>

                <div className="topics-grid">
                    {topicCards.map(item => (
                        <article className="topic-card" key={item.title}>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                        </article>
                    ))}
                </div>
            </motion.section>

            <motion.section id="about" className="section-block about-block" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.25 }}>
                <div className="section-head">
                    <p className="meta-kicker">About</p>
                    <h2>Built to sell as a product</h2>
                </div>

                <p>
                    Scriptoria is built for clear publishing, better discovery, and a polished
                    reader experience that feels modern and practical.
                </p>

                <ul className="about-list">
                    <li>Purpose-built for portfolio-grade blogging projects</li>
                    <li>Signal-based engagement using hearts and bookmarks</li>
                    <li>Structured APIs for semantic discovery and creator workflows</li>
                </ul>
            </motion.section>

            <footer className="site-footer">
                <span>Scriptoria</span>
                <span>Editorial intelligence platform</span>
            </footer>
        </motion.section>
    )
}