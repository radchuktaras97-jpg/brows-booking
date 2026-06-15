const mongoose = require("mongoose");

const BlockSchema = new mongoose.Schema({
  date: String,
  time: String
});

// 🔥 защита от дублей блоков (очень желательно)
BlockSchema.index({ date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model("Block", BlockSchema);