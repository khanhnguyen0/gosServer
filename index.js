var express = require('express');
var app = express();
var server = require('http').Server(app);
var Message = require('./model/message.js')
var cors = require('cors');
var User = require('./model/user.js');
var mongoose = require('mongoose');
var credentials = require('./credentials.js');
var bodyparser = require('body-parser');
var io = require('socket.io')(server);
var PORT = process.env.PORT || 5000;
var opts = {
	server:{
		socketOptions: { keepAlive: 1 }
	}
};
var onlineSocket = [];
var onlineUser = [];
var corsOption = {
	origin: "http://localhost:8080",
	credentials: true
}

// console.log(credentials);
mongoose.connect(credentials.mongo.development.connectionString,opts);
app.use(bodyparser());

app.use('/',cors(corsOption));

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
			res.send(onlineUser);
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



io.on('connection',function(socket){
	if (onlineSocket.indexOf(socket)==-1){
	onlineSocket.push(socket);
	socket.on('user',function(user){
		if (typeof user != 'undefined'){
		socket.broadcast.emit('new user',user);
		console.log(user,'has connected')
		onlineUser.push(user);
		console.log(onlineUser);
		io.sockets.emit('current user',onlineUser);
		console.log('emitted');
		Message.find({},function(err,messages){
			if (err) return;
			messages.map(function(m){
				socket.emit('new message',m)
			})
		})
		}	
	
	});
}

	socket.on('message',function(m){
		// socket.disconnect();
		socket.broadcast.emit('new message',m);
		Message.find({},function(err,messages){
			if (err) return;
			console.log(messages.length);
			for(var i = 0;i <messages.length-10;i++){
				messages[i].remove();
			}
		});

		var message = new Message({
			user:m.user,
			time:m.time,
			message:m.message
		});
		message.save();
	});

	socket.on('disconnect',function(){
		var index = onlineSocket.indexOf(socket);
		console.log(onlineUser[index],'disconnected');
		socket.broadcast.emit('dis',onlineUser[index]);
		onlineUser.splice(index,1);
		onlineSocket.splice(index,1);
		console.log(onlineUser);
		io.sockets.emit('current user',onlineUser);
	});

	socket.on('type', function(user){
		socket.broadcast.emit('typing',user);
	});

	socket.on('closing', function(a){
		console.log('closing');
		socket.disconnect();
	});
});
server.listen(PORT,function(){
	console.log('Running on port', PORT);	
});
