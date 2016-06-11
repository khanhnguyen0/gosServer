var express = require('express');
var app = express();
var Message = require('./model/message.js')
var cors = require('cors');
var User = require('./model/user.js');
var mongoose = require('mongoose');
var credentials = require('./credentials.js');
var bodyparser = require('body-parser');
var PORT = process.env.PORT || 5000;
var opts = {
	server:{
		socketOptions: { keepAlive: 1 }
	}
};

// console.log(credentials);
mongoose.connect(credentials.mongo.development.connectionString,opts);
app.use(bodyparser());
app.use('/api',cors());
app.get('/api/hello',function(req,res){
	console.log("request received");
	res.status(200).send("Hello world");
});

app.get('/api/current_user',function(req,res){
	User.find({online:true}, function(err,users){
		if (err) return res.send(500,'database error');
		res.json(users.map(function(u){
			return
			{
				user: u.userName
			}
		}));
	});
});

app.get('/api/messages',function(req,res){ 
	console.log('get');
	Message.find({}, function(err,messages){
		console.log(messages);
		if (err) return res.send(500,'database error');
		res.json(messages.map(function(m){
			console.log(m);
			return {
				user: m.user,
				time: m.time,
				message: m.message
			}
		}));
	});
});

app.post('/api/messages',function(req,res){
	console.log(req.body);
	var m = new Message({
		user:req.body.user,
		time:new Date(),
		message:req.body.message
	});
	console.log(m);
	m.save(function(err, m){
		if (err) return res.send(500,'Database Error');
		res.json({id: m._id});
	})
});

app.listen(PORT,function(){
	console.log('Running on port', PORT);	
});
