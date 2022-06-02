//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const res = require("express/lib/response");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//connection to the contacts database
mongoose.connect("mongodb://localhost:27017/contactDB");

//contact schema definition
const contactSchema = {
  name: String,
  phone_no: String,
  email: String
};

const Contact = mongoose.model("Contact", contactSchema);

app.post('/api/login', (_req, res) =>{

  // mock user
  const user = {
    id : 1,
    username: 'Amrita',
    email: 'as09082020@gmail.com'
  }
  jwt.sign({user}, 'secretkey', (_err, token) => {
    res.json({
      token
    });
  });
});

app.route('/contacts')
// get all the contacts
.get(verifyToken, function(req, res){

  Contact.find(function(err, foundContacts){
    if (!err) {
      res.send(foundContacts);
    } 
    else 
    {
      res.send(err);
    }
  });
})


.post(verifyToken, function(req, res){

  // adding a new contact
  const newContact = new Contact({
    name: req.body.name,
    phone_no: req.body.phone_no,
    email: req.body.email
  });

  newContact.save(function(err){
    if (!err){
      res.send("Successfully added a new contact.");
    } else {
      res.send(err);
    }
  });
})

// deleting all the contact
.delete(verifyToken, function(req, res){

  Contact.deleteMany(function(err){
    if (!err){
      res.send("Successfully deleted all contacts.");
    } else {
      res.send(err);
    }
  });
});

////////////////////////////////Requests Targetting A Specific Contact////////////////////////

// get a specific contact using name of the person
app.route("/contacts/:contactName")

.get(verifyToken, function(req, res){

  Contact.findOne({name: req.params.contactName}, function(err, foundContact){
    if (foundContact) {
      res.send(foundContact);
    } else {
      res.send("No contact matching that name was found.");
    }
  });
})

// update a contact
.put(verifyToken, function(req, res){
  Contact.replaceOne(
    {name: req.params.contactName},
    {name: req.body.name, phone_no: req.body.phone_no, email: req.body.email},
    {overwrite: true},
    function(err){
      if(!err){
        res.send("Successfully updated the selected contact.");
      }
      else
      {
        console.log(err);
      }
    }
  );
})

.delete(verifyToken, function(req, res){

  Contact.deleteOne(
    {name: req.params.contactName},
    function(err){
      if (!err){
        res.send("Successfully deleted the corresponding contact.");
      } else {
        res.send(err);
      }
    }
  );
});


// FORMAT OF TOKEN
// Authorization: Bearer <access_token>

// verify Token
function verifyToken(req, res, next){
  // get the auth header value
  const bearerHeader = req.headers['authorization'];
  // check if bearer is undefined
  if(typeof bearerHeader !== 'undefined')
  {
    // split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];
    // set the token
    req.token = bearerToken;
    //next middleware
    next();
  }
  else
  {
    // Forbidden
    res.sendStatus(403);
  }
}

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
