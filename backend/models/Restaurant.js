import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  image: {
    type: String
  },

  address: {
    type: String
  }

}, { timestamps: true });

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;