document.addEventListener('DOMContentLoaded', () => {
    const feedPostsContainer = document.getElementById("post-container");
    let currentUserId;
    const signoutLink = document.getElementById("signout-link");

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

        } catch (err) {
            console.error("Error fetching current user ID:", err);
            alert("Failed to fetch current user. Please log in.");
        }
    };


    const fetchComments = async (postId) => {
        try {
            const response = await fetch(`/api/routes/comments?post_id=${postId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch comments.");
            }
            const comments = await response.json();
            console.log(`Fetched comments for post ${postId}:`, comments);

            const commentsContainer = document.getElementById(`comments-list-${postId}`);
            commentsContainer.innerHTML = ""; // Clear previous comments

            if (comments.length === 0) {
                commentsContainer.innerHTML = "<p>No comments available.</p>";
                return;
            }

            comments.forEach((comment) => {
                const commentElement = document.createElement("div");
                commentElement.className = "comment";
    
                const commentDate = new Date(comment.created_at).toLocaleDateString();
    
                commentElement.innerHTML = `
                    <p>${comment.comment_text}</p>
                    <small>Posted by ${comment.firstname} ${comment.lastname} on ${commentDate}</small>
                    ${comment.user_id === currentUserId 
                        ? `<button class="delete-comment-btn" data-comment-id="${comment.comment_id}">🗑️ Delete</button>` 
                        : ""
                    }
                `;
                commentsContainer.appendChild(commentElement);
    
                // Add event listener for the delete button (if present)
                const deleteBtn = commentElement.querySelector(".delete-comment-btn");
                if (deleteBtn) {
                    deleteBtn.addEventListener("click", async (e) => {
                        const commentId = e.target.dataset.commentId;
                        await deleteComment(commentId, postId); // Pass postId to reload comments
                    });
                }
            });
        } catch (err) {
            console.error("Error fetching comments:", err);
        }
    };

    const toggleComments = (postId) => {
        const commentSection = document.getElementById(`comments-${postId}`);
        if (commentSection.style.display === "none" || commentSection.style.display === "") {
            commentSection.style.display = "block";
        } else {
            commentSection.style.display = "none";
        }
    };

    const addComment = async (postId, commentText) => {
        try {
            const response = await fetch("/api/routes/addComment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    post_id: postId, 
                    user_id: currentUserId, // Ensure this is set correctly for the logged-in user
                    comment_text: commentText 
                }),
            });
    
            const result = await response.json();
            if (response.ok) {
                console.log("Comment added successfully:", result);
                fetchComments(postId); // Reload comments for the post
            } else {
                console.error("Failed to add comment:", result.message);
                alert(result.message || "Failed to add comment.");
            }
        } catch (err) {
            console.error("Error adding comment:", err);
            alert("Something went wrong. Please try again later.");
        }
    };

    const fetchAllPosts = async () => {
        try {
            const response = await fetch(`/api/routes/allPosts`);
            if (!response.ok) {
                throw new Error("Failed to fetch all posts.");
            }

            const posts = await response.json();
            console.log("Fetched all posts:", posts);

            // Clear existing posts in the feed container
            feedPostsContainer.innerHTML = "";

            if (posts.length === 0) {
                feedPostsContainer.innerHTML = "<p>No posts available in the feed.</p>";
                return;
            }

            // Populate posts dynamically
            posts.forEach((post) => {
                const postElement = document.createElement("div");
                postElement.className = "post";
                postElement.dataset.postId = post.post_id; // Store post ID for easy reference

                postElement.innerHTML = `
                    <h4>${post.post_text}</h4>
                    <small>Posted by ${post.username || "Unknown User"} on ${new Date(post.created_at).toLocaleDateString()}</small>
                    <button class="view-comments" data-post-id="${post.post_id}">View Comments</button>
                    <div class="comment-section" id="comments-${post.post_id}" style="display: none;">
                        <textarea class="comment-input" placeholder="Add a comment..."></textarea>
                        <button class="add-comment-btn" data-post-id="${post.post_id}">Add Comment</button>
                        <div class="comments-container" id="comments-list-${post.post_id}"></div>
                    </div>
                `;

                feedPostsContainer.appendChild(postElement);

                // Fetch and display the comments for this post
                fetchComments(post.post_id);

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
            });
        } catch (err) {
            console.error("Error fetching all posts:", err);
            feedPostsContainer.innerHTML = "<p>Failed to load posts. Please try again later.</p>";
        }
    };

    const deleteComment = async (commentId, postId) => {
        try {
            const response = await fetch(`/api/routes/removeComment/${commentId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comment_id: commentId }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to delete comment.");
            }
    
            console.log("Comment deleted successfully.");
            fetchComments(postId); // Reload comments for the post
        } catch (err) {
            console.error("Error deleting comment:", err);
            alert("Failed to delete comment. Please try again later.");
        }
    };

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

    checkAuthentication();
    fetchCurrentUserId();

    if (feedPostsContainer) {
        fetchAllPosts();
    }
});