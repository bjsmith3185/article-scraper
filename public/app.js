


function displayResults(data) {
  $(".results").empty();

  for (var i = 0; i < data.length; i++) {

    $(".results").append(`
  <div class="article-area">
  <div> ${data[i].title} </div>
  <a class="link" href="${data[i].link}">Link to Story</a>
  <div class="time"> ${data[i].time} </div>
  <div class="edit-buttons text-center">
  <button class="save" data-article="${data[i]._id}">Save</button>
  <button class="add-note" data-article="${data[i]._id}" data-toggle="modal" data-target="#myModal">Add Note</button>
  </div>
 `);
  };
};


// scrape page on click
$("#scrape").on("click", function () {
  $(".results").empty();
  $.getJSON("/scrape", function () {
  })
});


// button to get back all articles in database
$("#articles").on("click", function () {
  $.getJSON("/all", function (data) {
    displayResults(data);
  });
});


// delete database
$("#delete").on("click", function () {
  $.get("/delete", function (data) {
    // console.log("database emptied")
    // console.log(data)
    $(".results").empty();
    location.reload();
  })
});


// save button to add to favorites
$(document).on("click", ".save", function () {
  var id = $(this).attr("data-article");
  var data = {
    id: id
  }
  $.post("/save", data, function (result) {
    // console.log("saved to fav")
    // console.log(result);
  })
});


// show saved articles
$("#saved").on("click", function () {
  $.get("/mysaved", function (data) {
    displayResults(data);
  });
});



// add note button
$(document).on("click", ".add-note", function () {
  var articleId = $(this).attr("data-article");
  // console.log(articleId);

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + articleId
  })
    // With that done, add the note information to the page
    .then(function (data) {
      // console.log("read this to see if note is there")
      // console.log(data);

      $(".modal-title").text(data.title);
      $("#savenote").attr("data-article", data._id);
      $("#deletenote").attr("data-article", data._id);
      if (data.note) {
        $("#titleinput").val(data.note.title);
        $("#bodyinput").val(data.note.body);
        $("#deletenote").attr("data-note", data.note._id);
      };
    });
});



// When you click the savenote button
$(document).on("click", "#savenote", function () {

  var articleId = $(this).attr("data-article");

  $.ajax({
    method: "POST",
    url: "/articles/" + articleId,
    data: {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val()
    }
  })
    .then(function (data) {
      // console.log(` this should have the note:id in there`)
      // console.log(data.note);

      $("#deletenote").attr("data-note", data.note);
      $("#savenote").attr("data-note", data.note);
      $(".notes").empty();
    });

  $("#titleinput").val("");
  $("#bodyinput").val("");
});



// When user clicks the delete button for a note
$(document).on("click", "#deletenote", function () {

  var noteId = $(this).attr("data-note");
  // console.log(`deleting this id: ${noteId}.`)

  $.ajax({
    type: "GET",
    url: "/note/delete/" + noteId,
    success: function (response) {
      // console.log("!!!!!!!!")
      // console.log(response)
      $(".notes").empty();
      $("#titleinput").val("");
      $("#bodyinput").val("");
    }
  });
});


