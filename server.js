'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var cors = require('cors');
var bodyParser = require('body-parser');
var Schema = mongoose.Schema
var app = express();


// Basic Configuration 
var port = process.env.PORT || 3000;
mongoose.connect(process.env.DB)

var URLSchema = new Schema({
  original_url:{type:String,unique:true},
  short_url:{type:Number,unique:true}
})
var URL = mongoose.model("URL",URLSchema)
/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
app.use(bodyParser.urlencoded({extended: false})) 
app.use(cors());
app.use(bodyParser.json())
/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});


app.post('/api/shorturl/new',(req,res,next)=>{
  var found =false;
  var regex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-z0-9@:%_\+.~#?&//=]*)?/gi;
  var url = req.body.url


    if(regex.test(url)===true){
      var short = Math.floor(Math.random()*100000).toString()
      var data = new URL({original_url: url,  short_url: short})
      data.save((err,data)=>{
        if(err){
          console.log('founded the url')
          URL.findOne({original_url:url}).then(result=>{
            res.send({original_url:result.original_url,short_url:result.short_url})
          })
        }else{
          res.send({original_url: url,  short_url: short})
        }
      })
    }
})

app.get('/api/shorturl/:number',(req,res,next)=>{
  var short = req.params.number
  URL.findOne({short_url:short}).then(result=>{
    if(result.original_url.includes('http')){
      res.redirect(result.original_url)
    } else{
      res.redirect('http://'+result.original_url)
    }
  })
})