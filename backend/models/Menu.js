import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
  partner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true }, // Dish name
  description: { type: String, required: true }, // Detailed description of the dish
  image: { type: String }, // URL/path to the dish image
  ingredients: [{ type: String }], // List of ingredients
  price: { type: Number, required: true }, // Price of the dish
  spicyLevel: { 
    type: String, 
    enum: ['none', 'mild', 'medium', 'hot', 'extraHot'],
    default: 'none'
  },
  dietaryTags: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'glutenFree', 'dairyFree', 'nutFree', 'halal', 'keto']
  }],
  category: { 
    type: String, 
    enum: ['entree', 'mainCourse', 'desserts', 'beverages', 'alcoholicDrinks', 'coffeeAndTea'],
    default: 'mainCourse'
  }
}, { timestamps: true });

export default mongoose.model("Menu", menuSchema); 
