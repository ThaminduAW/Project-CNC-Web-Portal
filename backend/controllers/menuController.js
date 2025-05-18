import Menu from "../models/Menu.js";

// Get all menu items for the logged-in partner
export const getPartnerMenu = async (req, res) => {
  try {
    const partnerId = req.user.id;
    const menu = await Menu.find({ partner: partnerId });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch menu items" });
  }
};

// Add a new menu item
export const addMenuItem = async (req, res) => {
  try {
    const partnerId = req.user.id;
    const { name, description, ingredients, price, spicyLevel, dietaryTags, category, image } = req.body;
    
    // Create menu item
    const menuItem = new Menu({ 
      partner: partnerId,
      name, 
      description, 
      ingredients,
      price,
      spicyLevel,
      dietaryTags,
      category,
      image
    });
    await menuItem.save();
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
    const { name, description, ingredients, price, spicyLevel, dietaryTags, category, image } = req.body;

    // Update menu item
    const updated = await Menu.findOneAndUpdate(
      { _id: id, partner: partnerId },
      { name, description, ingredients, price, spicyLevel, dietaryTags, category, image },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Menu item not found" });
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

    const deleted = await Menu.findOneAndDelete({ _id: id, partner: partnerId });
    if (!deleted) return res.status(404).json({ message: "Menu item not found" });

    res.json({ message: "Menu item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete menu item" });
  }
}; 