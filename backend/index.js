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
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');

app.use('/uploads', express.static('uploads'));

const salt = bcrypt.genSaltSync(10);
const secret = process.env.JWT_SECRET;
const mongoUri = process.env.MONGO_URI;
const frontendOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
const port = process.env.PORT || 4000;

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

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt),
        });
        res.json(userDoc);
    } catch (e) {
        res.status(400).json(e);
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    if (!userDoc) {
        return res.status(400).json('User not found');
    }
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
        jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token).json({
                id: userDoc._id,
                username
            });
        });
    } else {
        res.status(400).json('Wrong credentials');
    }
});

app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    jwt.verify(token, secret, {}, (err, info) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        res.json(info);
    });
});

app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok');
});

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = `${path}.${ext}`;
        fs.renameSync(path, newPath);

        jwt.verify(token, secret, {}, async (err, info) => {
            if (err) {
                return res.status(401).json({ error: 'Invalid token' });
            }
            
            const { title, summary, content } = req.body;
            if (!title || !summary || !content) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const postDoc = await Post.create({
                title,
                summary,
                content,
                cover: newPath,
                author: info.id
            });
            res.json(postDoc);
        });
    } catch (err) {
        console.error('Error processing file:', err);
        res.status(500).json({ error: "Error processing file" });
    }
});

app.get('/post', async (req, res) => {
    res.json(await Post.find().populate('author', ['username']));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
