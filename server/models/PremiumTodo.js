import mongoose from 'mongoose';

const premiumTodoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  date: {
    type: String,
    required: true,
    index: true // index for faster queries by date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const PremiumTodo = mongoose.model('PremiumTodo', premiumTodoSchema);
