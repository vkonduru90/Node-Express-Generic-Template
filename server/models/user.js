/* global module */
/* global require */

"use strict";

// get an instance of mongoose and mongoose.Schema
let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let bcrypt = require("bcryptjs");


// set up a mongoose model and pass it using module.exports
let UserSchema = new Schema({
  name: {type: String, required: true, unique: true},
  email: {type: String, unique: true},
  password: String,
  roles : [{
		name : { type : String, enum : ['ADMIN'], required: true },
		isActiveRole : Boolean,
	}],
  deleted: {type: Boolean, default: false},
  date_created: {type: Date, default: Date.now},
});

UserSchema.pre("save", function (next) {
  let user = this;
  // if (this.isModified("password") || this.isNew) {
  //   bcrypt.genSalt(10, function (err, salt) {
  //     if (err)
  //       return next(err);

  //     bcrypt.hash(user.password, salt, function (err, hash) {
  //       if (err) {
  //         return next(err);
  //       }
        user.password = user.password; //hash
        next();
  //     });
  //   });
  // } else {
  //   return next();
  // }
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
