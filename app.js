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

// Firebase services
const database = firebase.database();
const storage = firebase.storage();

function generatePostElement(post) {
  const postElement = document.createElement("div");
  postElement.classList.add("post");

  // 게시물 제목 표시
  const postTitle = document.createElement("h3");
  postTitle.innerText = post.title;
  postElement.appendChild(postTitle);

  // 게시물 이미지 표시
  const postImage = document.createElement("img");
  postImage.src = post.imageUrl;
  postImage.alt = post.title;
  postImage.onclick = () => showPostDetail(post);
  postElement.appendChild(postImage);

  return postElement;
}

// Submit post function
function submitPost() {
  const title = document.getElementById("title-input").value;
  const content = document.getElementById("content-input").value;
  const image = document.getElementById("image-input").files[0];

  // Upload image to Firebase Storage
  const imageRef = storage.ref().child("images/" + image.name);
  const uploadTask = imageRef.put(image);
  uploadTask.on(
    "state_changed",
    (snapshot) => {
      // Upload progress
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log("Upload is " + progress + "% done");
    },
    (error) => {
      // Error handling
      console.log(error);
    },
    () => {
      // Upload success
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        // Save post data to Firebase Realtime Database
        const postData = {
          title: title,
          content: content,
          imageUrl: downloadURL,
        };
        database.ref("posts").push(postData);
        // Clear input fields
        document.getElementById("title-input").value = "";
        document.getElementById("content-input").value = "";
        document.getElementById("image-input").value = "";
      });
    }
  );
}

// Show post detail function
function showPostDetail(title, content, imageUrl) {
  const postDetail = document.getElementById("post-detail");
  postDetail.innerHTML = `
    <div id="post-detail-content">
      <img src="${imageUrl}" width="400">
      <h2>${title}</h2>
      <p>${content}</p>
      <button onclick="hidePostDetail()">Close</button>
    </div>
  `;
  postDetail.style.display = "block";
}

function hidePostDetail() {
  document.getElementById("post-detail").style.display = "none";
}

// Load posts function
function loadPosts() {
  const postsRef = database.ref("posts");
  postsRef.on("value", (snapshot) => {
    const postsList = document.getElementById("posts-list");
    postsList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
      const post = childSnapshot.val();
      const postDiv = document.createElement("div");
      const postImage = document.createElement("img");
      const postTitle = document.createElement("h3");
      postImage.src = post.imageUrl;
      postImage.width = 200;
      postTitle.textContent = post.title;
      postDiv.appendChild(postImage);
      postDiv.appendChild(postTitle);
      postDiv.onclick = () => {
        showPostDetail(post.title, post.content, post.imageUrl);
      };
      postsList.appendChild(postDiv);
    });
  });
}

// Call loadPosts function when page loads
window.onload = loadPosts;
