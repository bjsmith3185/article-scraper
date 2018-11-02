


function displayResults(data) {
  // First, empty the div
  $(".results").empty();

  for (var i = 0; i < data.length; i++) {

    $(".results").append(`
  <div class="article-area">
  <div><span class="save" id="${data[i]._id}" data-article="${data[i]._id}">Save</span>        ${data[i].title} </div>
  <a class="link" href="${data[i].link}">Link to Story</a>
  <div class="time"> ${data[i].time} </div>
  <div class="edit-buttons text-center">
  <button class="add-note" data-article="${data[i]._id}">Add Note</button>
  </div>
  <div class="notes"></div>
 `);
  };
};


// button to get back all articles in database
$("#articles").on("click", function () {
  $.getJSON("/all", function (data) {
    displayResults(data);
  });
});


// save button to add to favorites
$(document).on("click", ".save", function () {

  var id = $(this).attr("data-article");
  console.log(id);
  var data = {
    id: id
  }
  $.post("/save", data, function (result) {
    // change the color/words of the button to red for saved
    console.log("saved to fav")
    console.log(result);
    console.log(result.saved)

    // if(result.saved) {

    //   var id = `"#${result._id}"`;
    //   $(id).css("color", "red");

    // } else {
    //   $(this).css("color", "blue");
    // }
  })
});


// show saved articles
$("#saved").on("click", function () {
  $.get("/mysaved", function (data) {
    displayResults(data);
  });
});


// button to clear results area
$("#clear").on("click", function () {
  $(".results").empty();
});



// add note button
$(document).on("click", ".add-note", function () {
  // Empty the notes from the note section
  $(".notes").empty();
  // Save the id from the p tag
  var articleId = $(this).attr("data-article");
  console.log(articleId);

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + articleId
  })

    .then(function (data) {
      console.log(data);

      var noteHtml = `
      <div class="row">
            <div class="col-3">
                <div class="note-title"></div> Note title
                <input class="input-title" placeholder="Note Title" id='titleinput' name='title'>
            </div>
            <div class="col-7">
                <div class="note-body"> Note body</div>
                <textarea class="input-body" placeholder="Enter Note Here" id='bodyinput' name='body'></textarea>
            </div>
            <div class="col-2 text-center">
                <button class="btn save-note" data-article='${data._id}' id='savenote'>Save Note</button>
            </div>
        </div>
        <div class="row">
            <div class="col-12 text-center">
                <div class="delete-note-btn" data-article="${data._id}" id='deletenote'>Delete Note</div>
            </div>
        </div>
        '
        `;

        $(".notes").append(noteHtml);

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);

        $("#deletenote").attr("data-note", data.note._id);
      }
    });
});



// When you click the savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var articleId = $(this).attr("data-article");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + articleId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(` this should have the note:id in there`)
      // console.log(data); 
      console.log(data.note);//
      // add the data-note id to the save and delete buttons here
$("#deletenote").attr("data-note", data.note);
$("#savenote").attr("data-note", data.note);

      $(".notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});


// Delete note button
// $(document).on("click", "#deletenote", function() {
//   // Grab the id associated with the article from the submit button
//   var thisId = $(this).attr("data-id");
//   console.log(`deleting this id: ${thisId}.`)

//   // Run a POST request to change the note, using what's entered in the inputs
//   $.ajax({
//     method: "POST",
//     url: "/note/delete/" + thisId,
//   })
//     .then(function(removed) {
//       console.log("the note was deleted")
//       console.log(removed);
//       // Empty the notes section
//       $("#notes").empty();
//     });

//   // Also, remove the values entered in the input and textarea for note entry
//   $("#titleinput").val("");
//   $("#bodyinput").val("");
// });

// When user clicks the delete button for a note
$(document).on("click", "#deletenote", function () {

  var noteId = $(this).attr("data-note");
  console.log(`deleting this id: ${noteId}.`)

  $.ajax({
    type: "GET",
    url: "/note/delete/" +noteId,

    // On successful call
    success: function (response) {
      console.log("!!!!!!!!")
      console.log(response)
      $(".notes").empty();
      // Clear the note and title inputs
      $("#titleinput").val("");
      $("#bodyinput").val("");


    }
  });
});


//---------------------------------------------



// // display number of total article available in database
// $.getJSON("/count", function (data) {
//   var count = data;
//   console.log("this is the count of articles")
//   console.log(count);
//   $("#article-qty").text(`There are ${count} articles in the database.`);
// });














// button to delete database
$("#delete").on("click", function () {
  $.post("/delete", function () {
    console.log("database deleted")
  });
});










// button to get back 5 articles in database
$("#five-results").on("click", function () {
  $.getJSON("/five", function (data) {
    displayResults(data);
  });
});




// button to get back 10 articles in database
$("#ten-results").on("click", function () {
  $.getJSON("/ten", function (data) {
    displayResults(data);
  });
});



// do a scrape to refresh articles
$("#re-scrape").on("click", function () {
  $(".results").empty();
  $.getJSON("/rescrape", function (data) {

  })
});
