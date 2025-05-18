import Menu from "../models/Menu.js";
import Tour from "../models/Tour.js";

// Get all menu items for the logged-in partner, optionally filtered by tour
export const getPartnerMenu = async (req, res) => {
  try {
    const partnerId = req.user.id;
    const filter = { partner: partnerId };
    if (req.query.tour) {
      filter.tour = req.query.tour;
    }
    const menu = await Menu.find(filter);
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch menu items" });
  }
};

// Add a new menu item
export const addMenuItem = async (req, res) => {
  try {
    const partnerId = req.user.id;
    const { name, description, ingredients, price, spicyLevel, dietaryTags, category, tour } = req.body;
    if (!tour) return res.status(400).json({ message: 'Tour is required' });
    
    // Create menu item
    const menuItem = new Menu({ 
      partner: partnerId, 
      tour, 
      name, 
      description, 
      ingredients,
      price,
      spicyLevel,
      dietaryTags,
      category
    });
    await menuItem.save();

    // Update tour's restaurant menu
    const tourDoc = await Tour.findById(tour);
    if (!tourDoc) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    const restaurantIndex = tourDoc.restaurants.findIndex(
      r => r.restaurant.toString() === partnerId
    );

    if (restaurantIndex === -1) {
      return res.status(404).json({ message: 'Restaurant not found in this tour' });
    }

    // Add menu item to tour's restaurant menu
    tourDoc.restaurants[restaurantIndex].menu.push({
      name: menuItem.name,
      description: menuItem.description,
      ingredients: menuItem.ingredients,
      price: menuItem.price,
      spicyLevel: menuItem.spicyLevel,
      dietaryTags: menuItem.dietaryTags,
      category: menuItem.category
    });

    await tourDoc.save();
    res.status(201).json(menuItem);
  } catch (err) {
    console.error('Add menu item error:', err);
    res.status(400).json({ message: err.message || "Failed to add menu item" });
  }
};

// Edit a menu item
export const editMenuItem = async (req, res) => {
  try {
    const partnerId = req.user.id;
    const { id } = req.params;
    const { name, description, ingredients, price, spicyLevel, dietaryTags, category } = req.body;

    // Update menu item
    const updated = await Menu.findOneAndUpdate(
      { _id: id, partner: partnerId },
      { name, description, ingredients, price, spicyLevel, dietaryTags, category },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Menu item not found" });

    // Update tour's restaurant menu
    const tourDoc = await Tour.findById(updated.tour);
    if (!tourDoc) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    const restaurantIndex = tourDoc.restaurants.findIndex(
      r => r.restaurant.toString() === partnerId
    );

    if (restaurantIndex === -1) {
      return res.status(404).json({ message: 'Restaurant not found in this tour' });
    }

    // Update menu item in tour's restaurant menu
    const menuIndex = tourDoc.restaurants[restaurantIndex].menu.findIndex(
      item => item.name === updated.name
    );

    if (menuIndex !== -1) {
      tourDoc.restaurants[restaurantIndex].menu[menuIndex] = {
        name: updated.name,
        description: updated.description,
        ingredients: updated.ingredients,
        price: updated.price,
        spicyLevel: updated.spicyLevel,
        dietaryTags: updated.dietaryTags,
        category: updated.category
      };
      await tourDoc.save();
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Failed to update menu item" });
  }
};

// Delete a menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const partnerId = req.user.id;
    const { id } = req.params;

    // Get menu item before deleting
    const menuItem = await Menu.findOne({ _id: id, partner: partnerId });
    if (!menuItem) return res.status(404).json({ message: "Menu item not found" });

    // Delete menu item
    await Menu.findOneAndDelete({ _id: id, partner: partnerId });

    // Update tour's restaurant menu
    const tourDoc = await Tour.findById(menuItem.tour);
    if (tourDoc) {
      const restaurantIndex = tourDoc.restaurants.findIndex(
        r => r.restaurant.toString() === partnerId
      );

      if (restaurantIndex !== -1) {
        // Remove menu item from tour's restaurant menu
        tourDoc.restaurants[restaurantIndex].menu = tourDoc.restaurants[restaurantIndex].menu.filter(
          item => item.name !== menuItem.name
        );
        await tourDoc.save();
      }
    }

    res.json({ message: "Menu item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete menu item" });
  }
}; 