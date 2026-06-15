const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  name: String,
  phone: String,
  service: String,
  date: String,
  time: String
});

// ✅ ВАЖНО: правильное имя переменной
BookingSchema.index({ date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model("Booking", BookingSchema);