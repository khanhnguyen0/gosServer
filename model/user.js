var mongoose = require('mongoose');
var userSchema  = mongoose.Schema({
	userName: String,
	online: Boolean,
	password: String
});

var User = mongoose.model('User',userSchema);
module.exports = User;