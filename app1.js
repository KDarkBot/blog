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

// Reference to the posts node in the database
var postsRef = database.ref("posts");

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

    // Create a new post element
    var postElement = document.createElement("div");
    postElement.classList.add("post");
    postElement.innerHTML = `
          <img src="${post.imageUrl}" />
          <h3>${post.title}</h3>
        `;

    // Add an event listener to the post element to display the post detail modal
    postElement.addEventListener("click", function () {
      // Get a reference to the post detail content element
      var postDetailContent = document.getElementById("post-detail-content");

      // Set the HTML of the post detail content element
      postDetailContent.innerHTML = `
            <img src="${post.imageUrl}" />
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <button onclick="hidePostDetail()">Close</button>
          `;

      // Show the post detail modal
      document.getElementById("post-detail").style.display = "block";
    });

    // Add the post element to the posts list element
    postsList.appendChild(postElement);
  });
}

// Function to hide the post detail modal
function hidePostDetail() {
  document.getElementById("post-detail").style.display = "none";
}

// Display all posts when the page loads
displayPosts();
