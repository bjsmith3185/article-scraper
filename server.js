var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var mongojs = require("mongojs");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

// var PORT = 3000;
var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/homework18db", { useNewUrlParser: true });

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

// process.env.MONGODB_URI;


// Routes
app.get("/scrape", function(req, res) {
// function checkfordatabase() {
   
    db.Article.count().then((count) => {
        console.log(` The number of articles in the database is : ${count}`)
        if (count) {
            console.log("true") // collection already exists
            axios.get("https://www.charlotteobserver.com/").then(function (response) {

                var $ = cheerio.load(response.data);
                // console.log(response.data);
        
                $(".title-link-timestamp-macro ").each(function (i, element) {
                    var title = $(element).find("a").text().trim();
                    var link = $(element).find("a").attr("href");
                    var time = $(element).find("time").text().trim();
                    // console.log(`this is the title: ${title} at index ${i}.`)
        
                    var insertData = {
                        title: title,
                        link: link,
                        time: time,
                        saved: false,
                    };
        
                    db.Article.update(insertData, {upsert:true})
                        .then(function (dbArticle) {
                            // View the added result in the console
                            // console.log(dbArticle);
                        })
                        .catch(function (err) {
                            // If an error occurred, send it to the client
                            return res.json(err);
                        });
                });
            })




        } else {
            console.log("false") // collection does not exist
            axios.get("https://www.charlotteobserver.com/").then(function (response) {

                var $ = cheerio.load(response.data);
                // console.log(response.data);
        
                $(".title-link-timestamp-macro ").each(function (i, element) {
                    var title = $(element).find("a").text().trim();
                    var link = $(element).find("a").attr("href");
                    var time = $(element).find("time").text().trim();
                    // console.log(`this is the title: ${title} at index ${i}.`)
        
                    var insertData = {
                        title: title,
                        link: link,
                        time: time,
                        saved: false,
                    };
        
                    db.Article.create(insertData)
                        .then(function (dbArticle) {
                            // View the added result in the console
                            // console.log(dbArticle);
                        })
                        .catch(function (err) {
                            // If an error occurred, send it to the client
                            return res.json(err);
                        });
                });
            })
        }
    });
// }
});



// Route for getting all Articles from the db
app.get("/all", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// post request for saved articles
app.post("/save", function (req, res) {
    var data = req.body.id;
    // console.log("hello world")
    // console.log(data)


    db.Article.findOneAndUpdate({ _id: mongojs.ObjectId(data) }, { $set: { "saved": true } }, { new: true }).then((function (results) {
        res.json(results);
    }))


});


// Route for showing saved articles
app.get("/mysaved", function (req, res) {
    db.Article.find({ saved: true }, function (err, data) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(data);
        }
    });
});


// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});


// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});


//Route to remove a note from the Articles collection
app.get("/note/delete/:id", function (req, res) {
    // console.log("below is mongo.js.ObjectID(req.params.id.")
    // console.log(mongojs.ObjectID(req.params.id))

    db.Note.deleteOne(
        {
            _id: mongojs.ObjectID(req.params.id)
        },
        function (error, removed) {
            if (error) {
                console.log(error);
                res.send(error);
            }
            else {

                // console.log("it is right here")
                // console.log(removed);
                res.send(removed);
            }
        }
    );
});


// Delete articles collection
app.get("/delete", function (req, res) {
    db.Article.remove({})
        .then(function (error, removed) {
            // Log any errors from mongojs
            if (error) {
                console.log(error);
                res.send(error);
            }
            else {

                db.Note.remove({})
                    .then(function (error, erased) {
                        if (error) {
                            console.log(error);
                            res.send(error);
                        }
                        else {
                            // console.log("notes collection emptied")
                        }
                    })
                // console.log("articles collection emptied")
                res.send(removed);
            }
        }
        );
});


// Start the server
app.listen(PORT, function () {
    console.log("listening on port: http://localhost:3000/");
});
