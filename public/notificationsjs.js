document.addEventListener("DOMContentLoaded", () => {
    const notificationsContainer = document.getElementById("notifications-container");
    const showUnreadButton = document.getElementById("show-unread");
    const showReadButton = document.getElementById("show-read");

    // Function to fetch and display notifications
    async function fetchNotifications(showRead) {
        notificationsContainer.innerHTML = "Loading..."; // Clear container and show loading text

        const res = await fetch(`/api/routes/notifications?showRead=${showRead}`);
        const data = await res.json();

        if (res.ok) {
            notificationsContainer.innerHTML = ""; // Clear container
            if (data.notifications.length > 0) {
                data.notifications.forEach(notification => {
                    const notificationDiv = document.createElement("div");
                    notificationDiv.classList.add("notification");
                    notificationDiv.textContent = notification.message;

                    // Mark as read when clicked (only for unread notifications)
                    if (!showRead) {
                        notificationDiv.addEventListener("click", async () => {
                            const readRes = await fetch(`/api/routes/notifications/${notification.notification_id}/read`, {
                                method: "POST",
                            });

                            if (readRes.ok) {
                                notificationDiv.remove(); // Remove from DOM
                            }
                        });
                    }

                    notificationsContainer.appendChild(notificationDiv);
                });
            } else {
                notificationsContainer.textContent = `No ${showRead ? "read" : "unread"} notifications.`;
            }
        } else {
            notificationsContainer.textContent = data.error || "Failed to load notifications.";
        }
    }

    // Event listeners for toggling notifications
    showUnreadButton.addEventListener("click", () => fetchNotifications(false)); // Unread
    showReadButton.addEventListener("click", () => fetchNotifications(true)); // Read

    // Load unread notifications by default
    fetchNotifications(false);
});