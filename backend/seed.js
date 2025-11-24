const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const Product = require('./models/Product');
const { parseCSV } = require('./utils/csvParser');

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Parse CSV file and import products
    const csvPath = path.join(__dirname, '..', 'wholesale_za_products.csv');
    let products = [];
    
    try {
      products = parseCSV(csvPath);
      console.log(`Parsed ${products.length} products from CSV`);
    } catch (error) {
      console.error('Error parsing CSV:', error.message);
      console.log('Using default sample products instead...');
      // Fallback to sample products if CSV parsing fails
      products = [
        {
          name: 'A4 Board Sheet 160G Pack of 10',
          description: 'Quality board sheets for all your needs',
          price: 35.00,
          category: 'Books',
          image: 'https://via.placeholder.com/500',
          stock: 50,
          rating: 4.5,
          numReviews: 120
        }
      ];
    }

    // Insert products
    await Product.insertMany(products);
    console.log(`Successfully seeded ${products.length} products`);

    // Create admin user if it doesn't exist
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      const admin = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        isAdmin: true
      });
      await admin.save();
      console.log('Admin user created (email: admin@example.com, password: admin123)');
    } else {
      console.log('Admin user already exists');
    }

    // Create a test user if it doesn't exist
    const testUserExists = await User.findOne({ email: 'user@example.com' });
    if (!testUserExists) {
      const testUser = new User({
        name: 'Test User',
        email: 'user@example.com',
        password: 'user123',
        isAdmin: false
      });
      await testUser.save();
      console.log('Test user created (email: user@example.com, password: user123)');
    } else {
      console.log('Test user already exists');
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();


