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

var PORT = 3000;

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
mongoose.connect("mongodb://localhost/homework18db", { useNewUrlParser: true });


// this function runs on server load and scraped articles
Promise.all(
    axios.get("https://www.charlotteobserver.com/").then(function (response) {

        var $ = cheerio.load(response.data);
 
        $(".title-link-timestamp-macro ").each(function (i, element) {
            var title = $(element).find("a").text().trim();
            var link = $(element).find("a").attr("href");
            var time = $(element).find("time").text().trim();

            var insertData = {
                title: title,
                link: link,
                time: time,
                saved: false,
            };

            db.Article.create(insertData)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    return res.json(err);
                });
        })
    })
).then(function (values) {
    console.log(values);
    res.json(values)
    console.log("returning values")
});


// Routes

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
    console.log("hello world")
    console.log(data)


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
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});


// Route for DELETING an Article's associated Note
// app.post("/note/delete/:id", function (req, res) {
//     // var data = req.params.id;
//     console.log(`this is the id to delete: ${data}.`)


//     db.Note.findByIdAndRemove(req.params.id, (err) => {
//         // As always, handle any potential errors:
//         if (err) return res.status(500).send(err);
//         // We'll create a simple object to send back with a message and the id of the document that was removed
//         // You can really do this however you want, though.
//         const response = {

//             message: "successfully deleted",

//         };
//         return res.status(200).send(response);
//     });
// });


app.get("/note/delete/:id", function (req, res) {
    console.log("below is mongo.js.ObjectID(req.params.id.")
    console.log(mongojs.ObjectID(req.params.id))
    console.log("---------")
    console.log("below is req.params.id")
    console.log(req.params.id);

    db.Note.deleteOne(
        {
            _id: mongojs.ObjectID(req.params.id)
        },
        function (error, removed) {
            // Log any errors from mongojs
            if (error) {
                console.log(error);
                res.send(error);
            }
            else {
                // Otherwise, send the mongojs response to the browser
                // This will fire off the success function of the ajax request
                console.log("it is right here")
                console.log(removed);
                res.send(removed);
            }
        }
    );
});

//000000

app.get("/note/delete/:id", function (req, res) {
    console.log("below is mongo.js.ObjectID(req.params.id.")
    console.log(mongojs.ObjectID(req.params.id))
    console.log("---------")
    console.log("below is req.params.id")
    console.log(req.params.id);

    db.Note.findOneAndRemove(
        {
            _id: mongojs.req.params.id
        },
        function (error, removed) {
            // Log any errors from mongojs
            if (error) {
                console.log(error);
                res.send(error);
            }
            else {
                // Otherwise, send the mongojs response to the browser
                // This will fire off the success function of the ajax request
                console.log("it is right here")
                console.log(removed);
                res.send(removed);
            }
        }
    );
});














// Start the server
app.listen(PORT, function () {
    console.log("listening on port: http://localhost:3000/");
});
