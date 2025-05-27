import mongoose from 'mongoose';
import Menu from '../models/Menu.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateMenuCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Category mapping from old to new values
    const categoryMapping = {
      'appetizer': 'entree',
      'main': 'mainCourse',
      'dessert': 'desserts',
      'beverage': 'beverages'
    };

    // Find all menu items with old category values
    const oldCategories = Object.keys(categoryMapping);
    const menuItems = await Menu.find({ category: { $in: oldCategories } });

    console.log(`Found ${menuItems.length} menu items with old category values`);

    if (menuItems.length === 0) {
      console.log('No menu items need migration');
      return;
    }

    // Update each menu item
    let updatedCount = 0;
    for (const item of menuItems) {
      const newCategory = categoryMapping[item.category];
      if (newCategory) {
        await Menu.findByIdAndUpdate(item._id, { category: newCategory });
        console.log(`Updated menu item "${item.name}" from "${item.category}" to "${newCategory}"`);
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} menu items`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the migration
migrateMenuCategories(); 