document.addEventListener("DOMContentLoaded", async () => {
    const settingsForm = document.getElementById("settings-form");
    const profileImages = document.querySelectorAll(".profile-image");
    let selectedImage = null;

    // Fetch the current user profile information when the page loads
    await loadUserProfile();


    profileImages.forEach((img) => {
        img.addEventListener("click", () => {
            profileImages.forEach((image) => image.classList.remove("selected"));
            img.classList.add("selected");
            selectedImage = img.dataset.image;
        });
    });

    // Handle form submission
    settingsForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!selectedImage) {
            alert("Please select a profile picture!");
            return;
        }

        const firstname = document.getElementById("firstname").value.trim();
        const lastname = document.getElementById("lastname").value.trim();

        try {
            const res = await fetch("/api/routes/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstname,
                    lastname,
                    avatar_img: selectedImage,
                }),
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

    async function loadUserProfile() {
        try {
            const res = await fetch("/api/routes/profile");
            const data = await res.json();

            if (res.ok) {
                document.getElementById("firstname").value = data.user.firstname;
                document.getElementById("lastname").value = data.user.lastname;

                if (data.user.avatar_img) {
                    selectedImage = data.user.avatar_img;
                    const selectedImgElement = Array.from(profileImages).find(
                        (img) => img.dataset.image === data.user.avatar_img
                    );
                    if (selectedImgElement) {
                        selectedImgElement.classList.add("selected");
                    }
                }
            } else {
                console.error("Error loading user profile:", data.error);
                document.getElementById("message").textContent = data.error || "Failed to load profile.";
            }
        } catch (err) {
            console.error("Error loading user profile:", err);
            document.getElementById("message").textContent = "Failed to load profile2.";
        }
    }
    // // Function to load the user's current profile data
    // async function loadUserProfile() {
    //     const res = await fetch("/api/routes/profile");
    //     const data = await res.json();

    //     if (res.ok) {
    //         document.getElementById("firstname").value = data.user.firstname;
    //         document.getElementById("lastname").value = data.user.lastname;
    //         document.getElementById("avatar_img").value = data.user.avatar_img || "";
    //     } else {
    //         document.getElementById("message").textContent = data.error || "Failed to load profile.";
    //         document.getElementById("message").style.color = "red";
    //     }
    // }
});