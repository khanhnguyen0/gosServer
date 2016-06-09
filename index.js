var express = require('express');
var app = express();
app.use('api/',require('cors')());
app.listen(3000);
console.log('Running on port 3000');