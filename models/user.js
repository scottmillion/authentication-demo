const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});

// passport-local-mongoose allows us to access the methods from local-mongoose. Ex. User.serializeUser() and User.deserializeUser(). Otherwise, we'd have to add these methods to our User schema manually.
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);