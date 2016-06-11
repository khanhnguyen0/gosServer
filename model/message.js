var mongoose = require('mongoose');
var chatSchema = mongoose.Schema({
	user:String,
	time:Date,
	message:String
});

var Message = mongoose.model('Message',chatSchema);
module.exports = Message;	