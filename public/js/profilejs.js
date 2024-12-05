document.addEventListener("DOMContentLoaded", () => {
    const userPostsContainer = document.querySelector("#post-container");
    let currentUserId;
    const welcomeMessage = document.querySelector("#welcome-message");
    const signoutLink = document.getElementById("signout-link");
    const profilePicture = document.getElementById("profile-picture");

    const checkAuthentication = async () => {
        try {
            const response = await fetch('/api/routes/check-auth');
            if (response.status === 401) {
                // If not authenticated, redirect to login page
                window.location.href = 'index.html';
            }
        } catch (err) {
            console.error("Error checking authentication:", err);
            window.location.href = 'index.html';  // Redirect in case of error
        }
    };

    const fetchCurrentUserId = async () => {
        try {
            const response = await fetch('/api/routes/getCurrentUser'); // Adjusted to match your defined route
            if (!response.ok) throw new Error("Failed to fetch current user.");
            
            const data = await response.json();
            currentUserId = data.user_id; // Store the user ID globally
            console.log("Current User ID:", currentUserId);

            fetchUserName(currentUserId);

            // Fetch user posts only after fetching the user ID
           
            fetchUserPosts();
            
        } catch (err) {
            console.error("Error fetching current user ID:", err);
            alert("Failed to fetch current user. Please log in.");
        }
    };

    
    const fetchUserName = async (userId) => {
        try {
            const response = await fetch(`/api/routes/getUserName?user_id=${userId}`);
            if (!response.ok) throw new Error("Failed to fetch first name.");
    
            const data = await response.json();
            console.log("Fetched data:", data);  // Log the response to check the data
            
            // Check if the firstname exists in the data
            if (data.firstname) {
                welcomeMessage.innerHTML = `Welcome, ${data.firstname}`;
            } else {
                console.error("Firstname not found in the response.");
                welcomeMessage.innerHTML = "Welcome, Guest";  // Default message if no firstname
            }
        } catch (err) {
            console.error("Error fetching first name:", err);
            alert("Failed to load first name.");
        }
    };
    
    const fetchUserPosts = async () => {
        if (!currentUserId) {
            console.error("User ID is not set. Cannot fetch posts.");
            return;
        }
    
        try {
            const response = await fetch(`/api/routes/posts?user_id=${currentUserId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch posts.");
            }
    
            const posts = await response.json();
            console.log("Fetched posts:", posts);  // Log posts to see the response
    
            // Clear existing posts
            userPostsContainer.innerHTML = "";
    
            if (posts.length === 0) {
                userPostsContainer.innerHTML = "<p>No posts available.</p>";
                return;
            }
    
            // Populate posts dynamically
            posts.forEach((post) => {
                const postElement = document.createElement("div");
                postElement.className = "post";
                postElement.dataset.postId = post.post_id;  // Store post ID for easy reference
    
                postElement.innerHTML = `
                    <h4>${post.post_text}</h4>
                    <small>Posted on ${new Date(post.created_at).toLocaleDateString()}</small>
                    <button class="view-comments" data-post-id="${post.post_id}">View Comments</button>
                    <div class="comment-section" id="comments-${post.post_id}" style="display: none;">
                        <textarea class="comment-input" placeholder="Add a comment..."></textarea>
                        <button class="add-comment-btn" data-post-id="${post.post_id}">Add Comment</button>
                        <div class="comments-container" id="comments-list-${post.post_id}"></div>
                    </div>
                    ${post.user_id === currentUserId ? 
                        `<button class="delete-post-btn" data-post-id="${post.post_id}">🗑️</button>` 
                        : ''
                    }
                `;
    
                userPostsContainer.appendChild(postElement);
    
                // Fetch and display the comments for this post
                fetchComments(post.post_id, post.user_id);
    
                // Add event listener for "View Comments" button
                postElement.querySelector(".view-comments").addEventListener("click", (e) => {
                    const postId = e.target.dataset.postId;
                    toggleComments(postId);
                });
    
                // Add event listener for "Add Comment" button
                postElement.querySelector(".add-comment-btn").addEventListener("click", async (e) => {
                    const postId = e.target.dataset.postId;
                    const commentText = e.target.previousElementSibling.value.trim();
                    if (!commentText) {
                        alert("Comment cannot be empty!");
                        return;
                    }
                    // Add the comment
                    await addComment(postId, commentText);
                });
    
                // Add event listener for deleting the post (if the user is the post owner)
                if (post.user_id === currentUserId) {
                    postElement.querySelector(".delete-post-btn").addEventListener("click", async (e) => {
                        const postId = e.target.dataset.postId;
                        await deletePost(postId);
                    });
                }
            });
        } catch (err) {
            console.error("Error fetching posts:", err);
            userPostsContainer.innerHTML = "<p>Failed to load posts. Please try again later.</p>";
        }
    };


    const addComment = async (postId, commentText) => {
        try {
            const response = await fetch("/api/routes/addComment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    post_id: postId, 
                    user_id: currentUserId, // This should be the logged-in user's ID
                    comment_text: commentText
                })
            });
    
            const result = await response.json();
            if (response.ok) {
                alert(result.message); // Show success message
                fetchComments(postId);
                document.querySelector('.comment-input').value = ''; 
            } else {
                alert("Failed to add comment.");
            }
        } catch (err) {
            console.error("Error adding comment:", err);
            alert("Something went wrong.");
        }
    };

    // Fetch and display comments for a specific post
    const fetchComments = async (postId, postUserId) => {
        try {
            const response = await fetch(`/api/routes/comments?post_id=${postId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch comments.");
            }
    
            const comments = await response.json();
            const commentsContainer = document.querySelector(`#comments-list-${postId}`);
            commentsContainer.innerHTML = "";
    
            if (comments.length === 0) {
                commentsContainer.innerHTML = "<p>No comments yet.</p>";
                return;
            }
    
            comments.forEach((comment) => {
                const commentElement = document.createElement("div");
                commentElement.className = "comment";
                const commentDate = new Date(comment.created_at).toLocaleDateString();
    
                commentElement.innerHTML = `
                <p>${comment.comment_text}</p>
                <small>
                    Posted by 
                    <a href="otherprofile.html?user_id=${comment.user_id}" class="commenter-link">
                        ${comment.firstname} ${comment.lastname}
                    </a> 
                    on ${commentDate}
                </small>
                ${comment.user_id === currentUserId 
                    ? `<button class="delete-comment-btn" data-comment-id="${comment.comment_id}">🗑️ Delete</button>` 
                    : ""
                }
            `;
    
                commentsContainer.appendChild(commentElement);
    
                // Add event listener to delete comment button (if visible)
                const deleteBtn = commentElement.querySelector(".delete-comment-btn");
                if (deleteBtn) {
                    deleteBtn.addEventListener("click", async (e) => {
                        const commentId = e.target.dataset.commentId;
                        await deleteComment(commentId);
                    });
                }
            });
        } catch (err) {
            console.error("Error fetching comments:", err);
        }
    };

    // Toggle comments visibility
    const toggleComments = (postId) => {
        const commentsContainer = document.querySelector(`#comments-${postId}`);
        const isVisible = commentsContainer.style.display === "block";

        if (isVisible) {
            commentsContainer.style.display = "none";
        } else {
            fetchComments(postId);
            commentsContainer.style.display = "block";
        }
    };

    // Function to delete a post
    const deletePost = async (postId) => {
        try {
            const response = await fetch(`/api/routes/removePost/${postId}`, { method: "DELETE" });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                fetchUserPosts();  // Reload posts after deleting the post
            } else {
                alert("Failed to delete post.");
            }
        } catch (err) {
            console.error("Error deleting post:", err);
        }
    };

    // Function to delete a comment
    const deleteComment = async (commentId) => {
        try {
            const response = await fetch(`/api/routes/removeComment/${commentId}`, { method: "DELETE" });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                fetchUserPosts();  // Reload posts to reflect the deleted comment
            } else {
                alert("Failed to delete comment.");
            }
        } catch (err) {
            console.error("Error deleting comment:", err);
        }
    };


    //Add new post
    document.querySelector(".btn.post-btn").addEventListener("click", async () => {
        console.log("Post button clicked!");
        
        const postInput = document.querySelector(".post-input");
        const postText = postInput.value.trim();
    
        if (!postText) {
            alert("Post cannot be empty!");
            return;
        }
    
        try {
            const response = await fetch("/api/routes/addPost", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: currentUserId, post_text: postText }), // Replace with dynamic user_id
            });
    
            const result = await response.json();
            if (response.ok) {
                postInput.value = ""; // Clear input field
                alert("Post added successfully!");
    
                // Reload the posts list to include the newly added post
                fetchUserPosts(); // Fetch and update the posts list dynamically
            } else {
                console.error(result.error);
                alert("Failed to add post.");
            }
        } catch (err) {
            console.error("Error adding post:", err);
        }
    });

    
    async function fetchProfileImage() {
        try {
            const response = await fetch("/api/routes/getUserProfileImage");
            if (!response.ok) throw new Error("Failed to fetch profile image.");
            
            const { profileImage } = await response.json();
            // Update profile picture
            profilePicture.src = profileImage ? `images/${profileImage}` : "images/mm1.png";
        } catch (error) {
            console.error("Error fetching profile image:", error);
            // Set default image in case of error
            profilePicture.src = "images/mm1.png";
        }
    }
    fetchProfileImage();

    if (signoutLink) {
        signoutLink.addEventListener("click", async (e) => {
            e.preventDefault(); // Prevent the default link action

            try {
                // Call the backend signout API
                const response = await fetch('/api/routes/signout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (response.ok) {
                    // Redirect to index.html on success
                    window.location.href = "index.html";
                } else {
                    const error = await response.json();
                    console.error("Error during signout:", error.message);
                    alert(error.message || "Failed to sign out. Please try again.");
                }
            } catch (err) {
                console.error("Error during signout:", err);
                alert("Something went wrong. Please try again.");
            }
        });
    }


    fetchCurrentUserId();
    checkAuthentication();
    
});

