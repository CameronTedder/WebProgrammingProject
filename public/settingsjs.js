document.addEventListener("DOMContentLoaded", async () => {
    const settingsForm = document.getElementById("settings-form");

    // Fetch the current user profile information when the page loads
    await loadUserProfile();

    // Handle form submission
    settingsForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const firstname = document.getElementById("firstname").value;
        const lastname = document.getElementById("lastname").value;
        const avatar_img = document.getElementById("avatar_img").value;

        try {
            const res = await fetch("/api/routes/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstname,
                    lastname,
                    avatar_img
                })
            });

            const data = await res.json();
            if (res.ok) {
                document.getElementById("message").textContent = data.message;
                document.getElementById("message").style.color = "green";
            } else {
                document.getElementById("message").textContent = data.error;
                document.getElementById("message").style.color = "red";
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            document.getElementById("message").textContent = "An error occurred.";
            document.getElementById("message").style.color = "red";
        }
    });

    // Function to load the user's current profile data
    async function loadUserProfile() {
        const res = await fetch("/api/routes/profile");
        const data = await res.json();

        if (res.ok) {
            document.getElementById("firstname").value = data.user.firstname;
            document.getElementById("lastname").value = data.user.lastname;
            document.getElementById("avatar_img").value = data.user.avatar_img || "";
        } else {
            document.getElementById("message").textContent = data.error || "Failed to load profile.";
            document.getElementById("message").style.color = "red";
        }
    }
});