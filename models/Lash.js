const mongoose = require("mongoose");

const LashSchema = new mongoose.Schema({
    name: String,
    price: Number
});

module.exports = mongoose.model("Lash", LashSchema, "lashes");