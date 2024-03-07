const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
 

  email: {
    type: String,
    require: true,
    unique: true,
  },

  password: {
    type: String,
    require: true,
  },
  username: {
    type: String,
    require: true,
    unique: true,
  },

  token:{
    type:String,
    default:"",
  }
});

module.exports = mongoose.model("user", userSchema);
