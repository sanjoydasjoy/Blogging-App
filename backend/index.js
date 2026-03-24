const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const uploadMiddleware = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            cb(new Error('Only PNG, JPEG, and WEBP images are allowed'));
            return;
        }

        cb(null, true);
    },
});

app.use('/uploads', express.static('uploads'));

const salt = bcrypt.genSaltSync(10);
const secret = process.env.JWT_SECRET;
const mongoUri = process.env.MONGO_URI;
const frontendOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
const port = process.env.PORT || 4000;

const VALID_TOPICS = new Set([
    'politics',
    'culture',
    'education',
    'ai',
    'technology',
    'sports',
    'business',
    'health',
    'environment',
    'travel',
    'general',
]);

const SEEDED_USERNAMES = new Set([
    'arif_hasan',
    'nabila_rahman',
    'tanvir_islam',
    'sadia_aktar',
    'mehedi_rana',
    'farzana_nur',
    'shanto_kabir',
    'tasnim_hoque',
    'rifat_chowdhury',
    'mariam_jahan',
]);

const REACTION_TYPES = ['love'];

const SEMANTIC_HINTS = {
    ai: ['artificial intelligence', 'machine learning', 'automation', 'llm'],
    remote: ['work from home', 'hybrid work', 'distributed team'],
    health: ['wellbeing', 'mental health', 'stress'],
    travel: ['trip', 'tour', 'destination', 'weekend escape'],
    business: ['startup', 'ecommerce', 'growth', 'brand'],
    education: ['learning', 'student', 'study'],
    politics: ['policy', 'governance', 'leadership'],
    technology: ['tech', 'software', 'digital'],
};

const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
};

if (!secret) {
    console.error('Missing required environment variable: JWT_SECRET');
    process.exit(1);
}

if (!mongoUri) {
    console.error('Missing required environment variable: MONGO_URI');
    process.exit(1);
}

app.use(cors({
    credentials: true,
    origin: frontendOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(cookieParser());

mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

function parseTokenFromRequest(req) {
    return req.cookies?.token;
}

function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, {}, (err, info) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(info);
        });
    });
}

async function getUserInfoFromRequest(req) {
    const token = parseTokenFromRequest(req);
    if (!token) {
        return null;
    }

    try {
        return await verifyToken(token);
    } catch {
        return null;
    }
}

function normalizeUploadPath(filePath) {
    return filePath.split(path.sep).join('/');
}

function normalizeTopic(topic) {
    if (!topic || typeof topic !== 'string') {
        return 'general';
    }

    const normalized = topic.trim().toLowerCase();
    if (!normalized) {
        return 'general';
    }

    return VALID_TOPICS.has(normalized) ? normalized : 'general';
}

function normalizeTags(tags) {
    if (!tags) {
        return [];
    }

    const tagList = Array.isArray(tags)
        ? tags
        : String(tags)
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean);

    return [...new Set(tagList.map(tag => tag.toLowerCase()))].slice(0, 12);
}

function validatePostPayload(title, summary, content, topic) {
    if (!title || !summary || !content) {
        return 'Missing required fields';
    }

    if (title.trim().length < 6) {
        return 'Title must be at least 6 characters';
    }

    if (summary.trim().length < 12) {
        return 'Summary must be at least 12 characters';
    }

    if (content.trim().length < 40) {
        return 'Content must be at least 40 characters';
    }

    if (!VALID_TOPICS.has(topic)) {
        return 'Invalid topic selected';
    }

    return null;
}

function ensureValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

function stripHtml(text = '') {
    return String(text).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeRegExp(value = '') {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildSemanticTerms(queryText = '') {
    const cleaned = String(queryText).toLowerCase().trim();
    if (!cleaned) {
        return [];
    }

    const baseTerms = cleaned
        .split(/[^a-z0-9]+/)
        .map(item => item.trim())
        .filter(Boolean)
        .slice(0, 10);

    const expanded = [...baseTerms];
    for (const term of baseTerms) {
        for (const [key, values] of Object.entries(SEMANTIC_HINTS)) {
            if (term.includes(key)) {
                expanded.push(...values);
            }
        }
    }

    return [...new Set(expanded)].slice(0, 24);
}

function computeSemanticScore(post, semanticTerms) {
    if (!semanticTerms.length) {
        return 0;
    }

    const title = String(post.title || '').toLowerCase();
    const summary = String(post.summary || '').toLowerCase();
    const content = stripHtml(post.content || '').toLowerCase();
    const tags = Array.isArray(post.tags) ? post.tags.join(' ').toLowerCase() : '';
    const topic = String(post.topic || '').toLowerCase();

    let score = 0;
    for (const term of semanticTerms) {
        const safeTerm = term.toLowerCase();
        if (!safeTerm) {
            continue;
        }

        if (title.includes(safeTerm)) {
            score += 5;
        }

        if (summary.includes(safeTerm)) {
            score += 4;
        }

        if (tags.includes(safeTerm)) {
            score += 3;
        }

        if (topic.includes(safeTerm)) {
            score += 2;
        }

        if (content.includes(safeTerm)) {
            score += 1;
        }
    }

    return score;
}

function getReactionCounts(post) {
    const reactions = post?.reactions || {};

    return {
        love: Array.isArray(reactions.love) ? reactions.love.length : 0,
    };
}

function getViewerReaction(post, viewerId) {
    if (!viewerId) {
        return null;
    }

    const viewerIdString = String(viewerId);
    for (const reactionType of REACTION_TYPES) {
        const list = Array.isArray(post?.reactions?.[reactionType]) ? post.reactions[reactionType] : [];
        if (list.some(item => String(item) === viewerIdString)) {
            return reactionType;
        }
    }

    return null;
}

function serializePostForClient(post, viewerId) {
    const plain = typeof post.toObject === 'function' ? post.toObject() : post;
    const bookmarkList = Array.isArray(plain.bookmarks) ? plain.bookmarks : [];
    const bookmarked = viewerId
        ? bookmarkList.some(item => String(item) === String(viewerId))
        : false;

    const reactionCounts = getReactionCounts(plain);
    const viewerReaction = getViewerReaction(plain, viewerId);

    return {
        ...plain,
        engagement: {
            bookmarkCount: bookmarkList.length,
            reactions: reactionCounts,
            viewer: {
                bookmarked,
                reaction: viewerReaction,
            },
        },
    };
}

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const normalizedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';

    if (!normalizedUsername || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    if (normalizedUsername.length < 4) {
        return res.status(400).json({ error: 'Username must be at least 4 characters' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        const userDoc = await User.create({
            username: normalizedUsername,
            password: bcrypt.hashSync(password, salt),
        });
        res.status(201).json({ id: userDoc._id, username: userDoc.username });
    } catch (e) {
        if (e.code === 11000) {
            return res.status(409).json({ error: 'Username already taken' });
        }

        res.status(400).json({ error: 'Registration failed' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const normalizedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';

    if (!normalizedUsername || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const userDoc = await User.findOne({ username: normalizedUsername });
    if (!userDoc) {
        return res.status(400).json({ error: 'User not found' });
    }

    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
        jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token, cookieOptions).json({
                id: userDoc._id,
                username: userDoc.username
            });
        });
    } else {
        res.status(400).json({ error: 'Wrong credentials' });
    }
});

app.get('/profile', async (req, res) => {
    const info = await getUserInfoFromRequest(req);
    if (!info) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    res.json(info);
});

app.post('/logout', (req, res) => {
    res.cookie('token', '', {
        ...cookieOptions,
        maxAge: 0,
    }).json({ ok: true });
});

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    try {
        const info = await getUserInfoFromRequest(req);
        if (!info) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { title, summary, content } = req.body;
        const topic = normalizeTopic(req.body.topic);
        const tags = normalizeTags(req.body.tags);
        const payloadError = validatePostPayload(title, summary, content, topic);
        if (payloadError) {
            return res.status(400).json({ error: payloadError });
        }

        let coverPath = null;
        if (req.file) {
            const { originalname, path: tempPath } = req.file;
            const parts = originalname.split('.');
            const ext = parts.length > 1 ? parts[parts.length - 1] : 'bin';
            const newPath = `${tempPath}.${ext}`;
            fs.renameSync(tempPath, newPath);
            coverPath = normalizeUploadPath(newPath);
        }

        const postDoc = await Post.create({
            title: title.trim(),
            summary: summary.trim(),
            content,
            topic,
            tags,
            cover: coverPath,
            author: info.id
        });

        const populatedPost = await Post.findById(postDoc._id).populate('author', ['username']);
        res.status(201).json(populatedPost);
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ error: 'Error creating post' });
    }
});

app.put('/post/:id', uploadMiddleware.single('file'), async (req, res) => {
    try {
        if (!ensureValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid post id' });
        }

        const info = await getUserInfoFromRequest(req);
        if (!info) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const postDoc = await Post.findById(req.params.id);
        if (!postDoc) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (String(postDoc.author) !== String(info.id)) {
            return res.status(403).json({ error: 'You can only edit your own posts' });
        }

        const { title, summary, content } = req.body;
        const topic = normalizeTopic(req.body.topic);
        const tags = normalizeTags(req.body.tags);
        const payloadError = validatePostPayload(title, summary, content, topic);
        if (payloadError) {
            return res.status(400).json({ error: payloadError });
        }

        const updatedData = {
            title: title.trim(),
            summary: summary.trim(),
            content,
            topic,
            tags,
        };

        if (req.file) {
            const { originalname, path: tempPath } = req.file;
            const parts = originalname.split('.');
            const ext = parts.length > 1 ? parts[parts.length - 1] : 'bin';
            const newPath = `${tempPath}.${ext}`;
            fs.renameSync(tempPath, newPath);
            updatedData.cover = normalizeUploadPath(newPath);
        }

        await Post.findByIdAndUpdate(req.params.id, updatedData, { new: true });

        const updatedPost = await Post.findById(req.params.id).populate('author', ['username']);
        res.json(updatedPost);
    } catch (err) {
        console.error('Error updating post:', err);
        res.status(500).json({ error: 'Error updating post' });
    }
});

app.delete('/post/:id', async (req, res) => {
    try {
        if (!ensureValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid post id' });
        }

        const info = await getUserInfoFromRequest(req);
        if (!info) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const postDoc = await Post.findById(req.params.id);
        if (!postDoc) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (String(postDoc.author) !== String(info.id)) {
            return res.status(403).json({ error: 'You can only delete your own posts' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ ok: true });
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({ error: 'Error deleting post' });
    }
});

app.get('/post', async (req, res) => {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 50);
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const rawTopic = String(req.query.topic || '').trim().toLowerCase();
    const author = (req.query.author || '').trim().toLowerCase();
    const sort = String(req.query.sort || 'newest').toLowerCase();

    const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const query = {};

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { summary: { $regex: search, $options: 'i' } },
        ];
    }

    if (rawTopic && rawTopic !== 'all') {
        const topic = normalizeTopic(rawTopic);
        query.topic = topic;
    }

    const viewerInfo = await getUserInfoFromRequest(req);
    const posts = await Post.find()
        .find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('author', ['username']);

    const shouldPrioritizeOriginal = !search && !rawTopic && !author && sort === 'newest';

    const prioritizedPosts = shouldPrioritizeOriginal
        ? [...posts].sort((a, b) => {
            const aSeeded = SEEDED_USERNAMES.has((a.author?.username || '').toLowerCase());
            const bSeeded = SEEDED_USERNAMES.has((b.author?.username || '').toLowerCase());

            if (aSeeded !== bSeeded) {
                return aSeeded ? 1 : -1;
            }

            return new Date(b.createdAt) - new Date(a.createdAt);
        })
        : posts;

    const filteredPosts = author
        ? prioritizedPosts.filter(post => post.author?.username === author)
        : prioritizedPosts;

    const serializedPosts = filteredPosts.map(post => serializePostForClient(post, viewerInfo?.id));

    res.json({
        page,
        limit,
        count: serializedPosts.length,
        posts: serializedPosts,
    });
});

app.get('/search/semantic', async (req, res) => {
    const q = String(req.query.q || '').trim();
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 50);
    const rawTopic = String(req.query.topic || '').trim().toLowerCase();

    if (q.length < 2) {
        return res.json({
            query: q,
            page,
            limit,
            count: 0,
            posts: [],
        });
    }

    const semanticTerms = buildSemanticTerms(q);
    if (!semanticTerms.length) {
        return res.json({
            query: q,
            page,
            limit,
            count: 0,
            posts: [],
        });
    }

    const viewerInfo = await getUserInfoFromRequest(req);

    const query = {};
    if (rawTopic && rawTopic !== 'all') {
        query.topic = normalizeTopic(rawTopic);
    }

    const semanticRegex = new RegExp(semanticTerms.map(escapeRegExp).join('|'), 'i');

    const candidatePosts = await Post.find({
        ...query,
        $or: [
            { title: { $regex: semanticRegex } },
            { summary: { $regex: semanticRegex } },
            { content: { $regex: semanticRegex } },
            { tags: { $elemMatch: { $regex: semanticRegex } } },
            { topic: { $regex: semanticRegex } },
        ],
    })
        .sort({ createdAt: -1 })
        .limit(200)
        .populate('author', ['username']);

    const scoredPosts = candidatePosts
        .map(post => ({
            post,
            score: computeSemanticScore(post, semanticTerms),
        }))
        .filter(item => item.score > 0)
        .sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }

            return new Date(b.post.createdAt) - new Date(a.post.createdAt);
        });

    const start = (page - 1) * limit;
    const pagedPosts = scoredPosts.slice(start, start + limit).map(item => item.post);
    const serializedPosts = pagedPosts.map(post => serializePostForClient(post, viewerInfo?.id));

    res.json({
        query: q,
        page,
        limit,
        count: scoredPosts.length,
        posts: serializedPosts,
    });
});

app.get('/topics', async (req, res) => {
    const result = await Post.aggregate([
        {
            $group: {
                _id: '$topic',
                count: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                topic: '$_id',
                count: 1,
            },
        },
    ]);

    const mergedByTopic = new Map();
    for (const item of result) {
        const normalizedTopic = normalizeTopic(item.topic);
        const currentCount = mergedByTopic.get(normalizedTopic) || 0;
        mergedByTopic.set(normalizedTopic, currentCount + (item.count || 0));
    }

    const topics = [...mergedByTopic.entries()]
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => {
            if (b.count !== a.count) {
                return b.count - a.count;
            }

            return a.topic.localeCompare(b.topic);
        });

    res.json(topics);
});

app.get('/post/:id', async (req, res) => {
    if (!ensureValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid post id' });
    }

    const viewerInfo = await getUserInfoFromRequest(req);
    const postDoc = await Post.findById(req.params.id).populate('author', ['username']);
    if (!postDoc) {
        return res.status(404).json({ error: 'Post not found' });
    }

    res.json(serializePostForClient(postDoc, viewerInfo?.id));
});

app.post('/post/:id/bookmark', async (req, res) => {
    if (!ensureValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid post id' });
    }

    const info = await getUserInfoFromRequest(req);
    if (!info) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const postDoc = await Post.findById(req.params.id).select('_id bookmarks');
    if (!postDoc) {
        return res.status(404).json({ error: 'Post not found' });
    }

    const current = Array.isArray(postDoc.bookmarks) ? postDoc.bookmarks : [];
    const alreadyBookmarked = current.some(item => String(item) === String(info.id));

    const update = alreadyBookmarked
        ? { $pull: { bookmarks: info.id } }
        : { $addToSet: { bookmarks: info.id } };

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, update, {
        new: true,
        projection: { bookmarks: 1 },
    }).lean();

    const bookmarkCount = Array.isArray(updatedPost?.bookmarks) ? updatedPost.bookmarks.length : 0;

    res.json({
        bookmarked: !alreadyBookmarked,
        bookmarkCount,
    });
});

app.post('/post/:id/reaction', async (req, res) => {
    if (!ensureValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid post id' });
    }

    const info = await getUserInfoFromRequest(req);
    if (!info) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const type = String(req.body?.type || '').trim().toLowerCase();
    if (!REACTION_TYPES.includes(type)) {
        return res.status(400).json({ error: 'Invalid reaction type' });
    }

    const postDoc = await Post.findById(req.params.id);
    if (!postDoc) {
        return res.status(404).json({ error: 'Post not found' });
    }

    const reactions = postDoc.reactions || { love: [] };
    let currentReaction = null;
    for (const reactionType of REACTION_TYPES) {
        const list = Array.isArray(reactions[reactionType]) ? reactions[reactionType] : [];
        if (list.some(item => String(item) === String(info.id))) {
            currentReaction = reactionType;
            break;
        }
    }

    const nextReaction = currentReaction === type ? null : type;
    const update = nextReaction
        ? { $addToSet: { 'reactions.love': info.id } }
        : { $pull: { 'reactions.love': info.id } };

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, update, {
        new: true,
        projection: { reactions: 1 },
    }).lean();

    const counts = {
        love: Array.isArray(updatedPost?.reactions?.love) ? updatedPost.reactions.love.length : 0,
    };

    res.json({
        reaction: nextReaction,
        counts,
    });
});

app.get('/me/bookmarks', async (req, res) => {
    const info = await getUserInfoFromRequest(req);
    if (!info) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const posts = await Post.find({ bookmarks: info.id })
        .sort({ createdAt: -1 })
        .populate('author', ['username'])
        .limit(100);

    res.json(posts.map(post => serializePostForClient(post, info.id)));
});

app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Image is too large. Max size is 5MB.' });
    }

    if (err.message && err.message.includes('Only PNG, JPEG, and WEBP')) {
        return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: 'Something broke!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
