import mongoose from 'mongoose';
import { hashPassword, validatePassword } from '../utils/bcrypt.js';

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  password: { type: String, required: true },
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
  role: { type: String, default: 'user' },
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  this.password = hashPassword(this.password);
  next();
});

userSchema.methods.validatePassword = function (password) {
  return validatePassword(password, this.password);
};

export default mongoose.model('User', userSchema);