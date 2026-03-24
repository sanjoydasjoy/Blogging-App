require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Post = require('../models/Post');

const MONGO_URL = process.env.MONGO_URI;

if (!MONGO_URL) {
  console.error('Missing MONGO_URI in environment');
  process.exit(1);
}

const users = [
  { username: 'arif_hasan', password: 'demoPassword123' },
  { username: 'nabila_rahman', password: 'demoPassword123' },
  { username: 'tanvir_islam', password: 'demoPassword123' },
  { username: 'sadia_aktar', password: 'demoPassword123' },
  { username: 'mehedi_rana', password: 'demoPassword123' },
  { username: 'farzana_nur', password: 'demoPassword123' },
  { username: 'shanto_kabir', password: 'demoPassword123' },
  { username: 'tasnim_hoque', password: 'demoPassword123' },
  { username: 'rifat_chowdhury', password: 'demoPassword123' },
  { username: 'mariam_jahan', password: 'demoPassword123' },
];

const posts = [
  {
    title: 'Dhaka Metro and the Future of Daily Commute',
    summary: 'How metro rail is changing productivity, time management, and city flow for office workers in Dhaka, while also reshaping neighborhood business patterns and lifestyle habits.',
    topic: 'technology',
    tags: ['dhaka', 'metro', 'urban-tech'],
    cover: 'https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?auto=format&fit=crop&w=1400&q=80',
    publishedAt: new Date('2025-02-14T09:20:00.000Z'),
    content: '<p>Dhaka\'s metro is not just transport. It is changing how people plan work, meetings, and personal time. Faster movement across the city creates better routines and less stress.</p><p>For young professionals, this means new job opportunities farther from home now feel realistic and sustainable.</p>'
  },
  {
    title: 'Why Local Libraries Matter for Community Learning',
    summary: 'A look at how neighborhood libraries can support students and job seekers beyond the classroom through internet access, curated reading lists, and focused learning spaces.',
    topic: 'education',
    tags: ['learning', 'students', 'community'],
    cover: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1400&q=80',
    publishedAt: new Date('2025-04-03T14:05:00.000Z'),
    content: '<p>Libraries offer quiet space, access to books, and internet support for learners who do not have perfect study conditions at home.</p><p>In Bangladesh, stronger local libraries can reduce learning gaps and improve exam preparation for many families.</p>'
  },
  {
    title: 'AI Tools in Bangla Content Creation',
    summary: 'Practical ways writers are using AI assistants to brainstorm and polish Bangla-first content without losing local voice, context, and cultural authenticity.',
    topic: 'ai',
    tags: ['ai', 'bangla', 'writing'],
    cover: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80',
    publishedAt: new Date('2025-06-17T08:40:00.000Z'),
    content: '<p>AI can speed up ideation, but human voice still matters most. Writers who use AI carefully can improve drafts while keeping authenticity.</p><p>The best workflow is to treat AI as an editor assistant, not a replacement for lived experience.</p>'
  },
  {
    title: 'Grassroots Sports Academies and Youth Confidence',
    summary: 'How small sports centers in district towns are helping teenagers build discipline, ambition, and social confidence through structured practice and mentorship.',
    topic: 'sports',
    tags: ['youth', 'sports', 'discipline'],
    cover: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1400&q=80',
    publishedAt: new Date('2025-08-11T16:10:00.000Z'),
    content: '<p>Sports academies are not only for elite athletes. They build teamwork, routine, and confidence among young students.</p><p>Regular practice and local coaching can shape mindset as much as physical ability.</p>'
  },
  {
    title: 'The New Wave of Dhaka Coffee Culture',
    summary: 'Cafes are becoming creative work hubs for freelancers, founders, and independent makers by offering collaborative spaces, stable internet, and long-form work comfort.',
    topic: 'culture',
    tags: ['cafes', 'creativity', 'dhaka'],
    cover: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80',
    publishedAt: new Date('2025-10-22T11:30:00.000Z'),
    content: '<p>More cafes now offer stable internet and long-stay seating, turning them into informal coworking spots.</p><p>This shift supports startup teams and creators who need flexible places to collaborate.</p>'
  },
  {
    title: 'Small Online Stores and Smart Business Growth',
    summary: 'Simple operating habits that help Facebook and Instagram based stores become trusted brands through reliable delivery, transparent communication, and post-sale support.',
    topic: 'business',
    tags: ['ecommerce', 'small-business', 'growth'],
    cover: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=80',
    publishedAt: new Date('2025-12-09T13:15:00.000Z'),
    content: '<p>Consistent delivery, transparent pricing, and clear return policy are more important than aggressive ads.</p><p>Bangladeshi micro-brands can scale steadily with customer trust and better inventory planning.</p>'
  },
  {
    title: 'Climate Pressure in Coastal Districts',
    summary: 'Why practical local adaptation projects are essential for vulnerable communities in the south facing salinity, flood risks, and long-term displacement pressure.',
    topic: 'environment',
    tags: ['climate', 'coast', 'resilience'],
    cover: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1400&q=80',
    publishedAt: new Date('2026-01-27T07:55:00.000Z'),
    content: '<p>Coastal erosion and salinity affect agriculture, health, and migration decisions.</p><p>Community-led adaptation, improved water systems, and climate-aware planning can reduce long-term damage.</p>'
  },
  {
    title: 'Balancing Remote Work and Family Life',
    summary: 'Healthy routines for professionals working from home in multigenerational households with practical boundaries, intentional breaks, and stronger communication rhythms.',
    topic: 'health',
    tags: ['remote-work', 'wellbeing', 'routine'],
    cover: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=80',
    publishedAt: new Date('2026-03-05T10:45:00.000Z'),
    content: '<p>Remote work can increase flexibility, but it can also blur boundaries. Clear work windows and rest breaks improve mental energy.</p><p>Simple family communication about schedule can reduce friction and improve concentration.</p>'
  },
  {
    title: 'University Politics and Student Leadership Growth',
    summary: 'Constructive student leadership models that focus on service, debate, and accountability while reducing conflict-driven politics in campus communities.',
    topic: 'politics',
    tags: ['campus', 'leadership', 'policy'],
    cover: 'https://images.unsplash.com/photo-1529101091764-c3526daf38fe?auto=format&fit=crop&w=1400&q=80',
    publishedAt: new Date('2026-04-18T15:00:00.000Z'),
    content: '<p>Student leadership can be a strong training ground for public service when it prioritizes constructive participation.</p><p>Healthy debate culture on campus creates long-term civic value for the country.</p>'
  },
  {
    title: 'Weekend Escapes Near Dhaka for Burnout Recovery',
    summary: 'Short travel plans that help professionals disconnect and return with better focus by blending low-cost nature breaks, digital detox, and rest-first routines.',
    topic: 'travel',
    tags: ['weekend', 'mental-health', 'nature'],
    cover: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80',
    publishedAt: new Date('2026-06-02T12:25:00.000Z'),
    content: '<p>Quick trips to nearby natural spots can reset attention after intense work weeks.</p><p>Even low-budget travel can improve mood, creativity, and motivation for the next week.</p>'
  },
];

async function seed() {
  await mongoose.connect(MONGO_URL);

  for (const user of users) {
    const exists = await User.findOne({ username: user.username });
    if (!exists) {
      const hashedPassword = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
      await User.create({ username: user.username, password: hashedPassword });
    }
  }

  const allUsers = await User.find({ username: { $in: users.map(u => u.username) } });
  const userMap = new Map(allUsers.map(user => [user.username, user._id]));

  for (let index = 0; index < posts.length; index += 1) {
    const post = posts[index];
    const authorUsername = users[index % users.length].username;
    const authorId = userMap.get(authorUsername);

    if (!authorId) {
      continue;
    }

    const existingPost = await Post.findOne({ title: post.title });
    if (existingPost) {
      await Post.updateOne(
        { _id: existingPost._id },
        {
          $set: {
            summary: post.summary,
            content: post.content,
            topic: post.topic,
            tags: post.tags,
            cover: post.cover,
            author: authorId,
            createdAt: post.publishedAt,
            updatedAt: post.publishedAt,
          },
        }
      , { timestamps: false });
      continue;
    }

    await Post.create({
      title: post.title,
      summary: post.summary,
      content: post.content,
      topic: post.topic,
      tags: post.tags,
      cover: post.cover,
      author: authorId,
      createdAt: post.publishedAt,
      updatedAt: post.publishedAt,
    });
  }

  const totalPosts = await Post.countDocuments();
  console.log(`Seed complete. Total posts in database: ${totalPosts}`);
}

seed()
  .catch(error => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
