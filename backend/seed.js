const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');
const { generateProducts } = require('./seedData');

dotenv.config();

async function seedDatabase() {
  await connectDB();

  const products = generateProducts();

  const userEmail = 'demo@yjwatches.com';
  const userPassword = 'Demo1234';

  await Product.deleteMany();
  await Product.insertMany(products);

  const passwordHash = await bcrypt.hash(userPassword, 10);
  await User.deleteMany({ email: userEmail });
  await User.create({ fullname: 'Demo User', email: userEmail, password: passwordHash });

  console.log('✅ Seed data inserted successfully.');
  console.log(`- Demo user: ${userEmail}`);
  console.log(`- Demo password: ${userPassword}`);
  process.exit(0);
}

seedDatabase().catch((error) => {
  console.error('❌ Seed error:', error.message);
  process.exit(1);
});
