import mongoose from "mongoose";

export const todoModel = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
});
