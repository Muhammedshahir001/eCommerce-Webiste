const mongoose = require("mongoose");

const categoryschema = mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
});


module.exports = mongoose.model("Category", categoryschema);

