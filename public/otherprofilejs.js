document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("user_id");

    if (!userId) {
        alert("User not found!");
        return;
    }

    const userNameElement = document.getElementById("user-name");
    const postsContainer = document.getElementById("posts-container");

    try {
        // Fetch user details
        const userDetailsRes = await fetch(`/api/routes/userDetails/${userId}`);
        if (!userDetailsRes.ok) throw new Error("Failed to fetch user details.");
        const userDetails = await userDetailsRes.json();
        userNameElement.textContent = `${userDetails.firstname} ${userDetails.lastname}'s Profile`;

        // Fetch user's posts
        const userPostsRes = await fetch(`/api/routes/userPosts/${userId}`);
        if (!userPostsRes.ok) throw new Error("Failed to fetch user's posts.");
        const userPosts = await userPostsRes.json();

        // Populate posts
        if (userPosts.length === 0) {
            postsContainer.innerHTML = "<p>No posts available.</p>";
        } else {
            userPosts.forEach((post) => {
                const postElement = document.createElement("div");
                postElement.className = "post";
                postElement.innerHTML = `
                    <h4>${post.post_text}</h4>
                    <small>Posted on ${new Date(post.created_at).toLocaleDateString()}</small>
                `;
                postsContainer.appendChild(postElement);
            });
        }
    } catch (error) {
        console.error(error);
        postsContainer.innerHTML = "<p>Failed to load profile data.</p>";
    }
});