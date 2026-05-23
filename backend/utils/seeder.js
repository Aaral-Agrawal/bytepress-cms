require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const SEED_USERS = [
  {
    name: 'Alex Johnson',
    email: 'admin@blogcms.com',
    password: 'Admin@12345',
    role: 'superadmin',
    status: 'active',
    bio: 'Platform super administrator.',
  },
  {
    name: 'Maya Chen',
    email: 'editor@blogcms.com',
    password: 'Editor@12345',
    role: 'editor',
    status: 'active',
    bio: 'Content editor and SEO specialist.',
  },
  {
    name: 'Raj Patel',
    email: 'author@blogcms.com',
    password: 'Author@12345',
    role: 'author',
    status: 'active',
    bio: 'Technical writer and developer.',
  },
  {
    name: 'Sam Wilson',
    email: 'viewer@blogcms.com',
    password: 'Viewer@12345',
    role: 'viewer',
    status: 'active',
    bio: 'Blog reader — public frontend only.',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/blog_cms');
    console.log('✅  Connected to MongoDB');

    await User.deleteMany({});
    console.log('🗑️   Cleared existing users');

    const users = await User.insertMany(SEED_USERS);
    console.log(`✅  Seeded ${users.length} users:\n`);

    users.forEach((u) => {
      console.log(`  • ${u.role.padEnd(12)} ${u.email}`);
    });

    console.log('\n📝  Login credentials:');
    console.log('  Super Admin  →  admin@blogcms.com   /  Admin@12345');
    console.log('  Editor       →  editor@blogcms.com  /  Editor@12345');
    console.log('  Author       →  author@blogcms.com  /  Author@12345');
    console.log('  (Viewer cannot access admin panel)\n');

    process.exit(0);
  } catch (err) {
    console.error('❌  Seed failed:', err);
    process.exit(1);
  }
};

seed();