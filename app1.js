// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD29bVLILOVDR1yac_WFrXzbRnA5bAMOA4",
  authDomain: "myfbasesystem.firebaseapp.com",
  databaseURL: "https://myfbasesystem-default-rtdb.firebaseio.com/",
  projectId: "myfbasesystem",
  storageBucket: "myfbasesystem.appspot.com",
  messagingSenderId: "1020677483532",
  appId: "1:1020677483532:web:c3d4d84eaa438029a49229",
  measurementId: "G-HR4036FRJD",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference to the database
var database = firebase.database();

// Reference to the storage
var storage = firebase.storage();
var commentsRef = database.ref("comments");

// Reference to the posts node in the database
var postsRef = database.ref("posts");
// Function to hide the post detail modal
function hidePostDetail() {
  // Get a reference to the post detail element
  var postDetail = document.getElementById("post-detail");

  // Set the display style of the post detail element to "none"
  postDetail.style.display = "none";
}

// Function to add a new post
function submitPostForm() {
  var title = document.getElementById("title-input").value;
  var content = document.getElementById("content-input").value;
  var image = document.getElementById("image-input").files[0];

  // Upload the image to Firebase Storage
  var imageRef = storage.ref().child("images/" + image.name);
  imageRef.put(image).then(function () {
    // Get the URL of the image from Firebase Storage
    imageRef.getDownloadURL().then(function (imageUrl) {
      // Create a new post object
      var newPost = {
        title: title,
        content: content,
        imageUrl: imageUrl,
        timestamp: Date.now(),
      };

      // Push the new post object to the posts node in the database
      postsRef.push(newPost);

      // Clear the form inputs
      document.getElementById("title-input").value = "";
      document.getElementById("content-input").value = "";
      document.getElementById("image-input").value = "";
    });
  });
}
function addCommentForm(postId) {
  var commentsList = document.getElementById("comments-list-" + postId);
  var commentInput = document.getElementById("comment-input-" + postId);
  var addCommentButton = document.getElementById(
    "add-comment-button-" + postId
  );

  addCommentButton.addEventListener("click", function () {
    // Get the content of the new comment
    var commentContent = commentInput.value;

    // Create a new comment object
    var newComment = {
      content: commentContent,
      timestamp: Date.now(),
      postId: postId,
    };

    // Push the new comment object to the comments node in the database
    commentsRef.push(newComment);

    // Clear the comment input field
    commentInput.value = "";

    // Scroll to the bottom of the comments list
    commentsList.scrollTop = commentsList.scrollHeight;
  });
}

function showPostForm() {
  document.getElementById("post-form").style.display = "block";
}

function hidePostForm() {
  document.getElementById("post-form").style.display = "none";
}

// Function to display all posts
function displayPosts() {
  // Get a reference to the posts list element
  var postsList = document.getElementById("posts-list");

  // Remove any existing posts from the posts list element
  while (postsList.firstChild) {
    postsList.removeChild(postsList.firstChild);
  }

  // Get all posts from the database and add them to the posts list element
  postsRef.orderByChild("timestamp").on("child_added", function (snapshot) {
    var post = snapshot.val();
    post.id = snapshot.key; // Add id property to post object

    // Create a new post element
    var postElement = document.createElement("div");
    postElement.classList.add("post");
    var postTitle = post.title;
    if (postTitle.length > 6) {
      // Limit the post title to 6 characters
      postTitle = postTitle.substring(0, 6) + "...";
    }
    postElement.innerHTML = `
  <img src="${post.imageUrl}" style="border-radius: 20px; border: solid black 3px;"/>
  <h3>${postTitle}</h3>
`;

    // Add the post element to the posts list element
    postsList.appendChild(postElement);

    // Add an event listener to the post element to display the post detail modal
    postElement.addEventListener("click", function () {
      // Get a reference to the post detail content element
      var postDetailContent = document.getElementById("post-detail-content");

      // Set the HTML of the post detail content element
      postDetailContent.innerHTML = `
        <img src="${post.imageUrl}" style="width: 758px; height: 427px" />
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <h4>Comments</h4>
        <ul id="comments-list"></ul>
        <form id="add-comment-form">
          <input type="text" id="comment-input" placeholder="Add a comment...">
          <button type="submit">Add Comment</button>
        </form>
        <button onclick="hidePostDetail()">Close</button>
      `;

      // Show the post detail modal
      document.getElementById("post-detail").style.display = "block";

      // Get a reference to the comments list element
      var commentsList = document.getElementById("comments-list");

      // Remove any existing comments from the comments list element
      while (commentsList.firstChild) {
        commentsList.removeChild(commentsList.firstChild);
      }

      // Get all comments for this post from the database and add them to the comments list element
      commentsRef
        .orderByChild("timestamp")
        .on("child_added", function (snapshot) {
          var comment = snapshot.val();
          if (comment.postId === post.id) {
            var commentElement = document.createElement("li");
            commentElement.innerText = "익명 : " + comment.content;
            commentsList.appendChild(commentElement);
          }
        });

      // Get a reference to the add comment form
      var addCommentForm = document.getElementById("add-comment-form");

      // Add an event listener to the add comment form to handle form submission
      addCommentForm.addEventListener("submit", function (event) {
        event.preventDefault();

        // Get the content of the new comment
        var commentContent = document.getElementById("comment-input").value;

        // Create a new comment object
        var newComment = {
          content: commentContent,
          timestamp: Date.now(),
          postId: post.id,
        };

        commentsRef.push(newComment);

        document.getElementById("comment-input").value = "";

        commentsList.scrollTop = commentsList.scrollHeight;
      });
    });
  });
}
displayPosts();
