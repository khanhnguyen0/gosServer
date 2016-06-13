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

app.get('/api/user/:user',function(req,res){
	User.findOne({userName:req.params.user},function(err,user){
		if (err) return res.send(500,'database error');
		if (user) {
			res.send(false);
		}
		else 
			res.send(true);
	});
});


app.get('/api/current_user',function(req,res){
	User.find({online:true}, function(err,users){
		if (err) return res.send(500,'database error');
		res.json(users.map(function(u){
			return u.userName
		}));
	});
});


app.post('/api/new_user',function(req,res){
	console.log(req.body);
	var u = new User({
		userName:req.body.userName,
		password:req.body.password,
		online:true
	});
	u.save(function(err,m){
		if (err) return res.send(500,'Database Error');
		res.json({id: u._id});
	});
});

app.post('/api/user',function(req,res){
	User.findOne({userName:req.body.userName,password:req.body.password},function(err,user){
		if (err) return res.send(500,'Database error');
		if (user){
			user.set({online:true});
			res.json({isSuccess:true});
		}
		else{
			res.json({isSuccess:false});
		}
	});
});

app.get('/api/messages',function(req,res){ 
	Message.find({}, function(err,messages){
		console.log(messages);
		if (err) return res.send(500,'database error');
		res.json(messages.map(function(m){
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
