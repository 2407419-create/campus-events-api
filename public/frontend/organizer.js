
const API_URL = "https://campus-events-api-production.up.railway.app/api/v1";

const token = localStorage.getItem("token");
let user = null;

try {
    user = JSON.parse(localStorage.getItem("user") || "null");
} catch {
    user = null;
}

const form = document.getElementById("eventForm");
const categorySelect = document.getElementById("category_id");
const message = document.getElementById("message");
const submitButton = document.getElementById("submitButton");

// Require an authenticated Event Organizer.
if (!token || !user) {
    alert("Please log in before opening the Organizer Dashboard.");
    window.location.href = "login.html";
} else if (Number(user.role_id) !== 2) {
    alert("This page is for Event Organizers. Please log in with an organizer account.");
    window.location.href = "index.html";
} else {
    document.getElementById("welcome").textContent =
        `Welcome, ${user.name}. You are logged in as an Event Organizer.`;

    loadCategories();
}

function showMessage(text, type) {
    message.textContent = text;
    message.className = type;
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Could not load categories.");
        }

        const categories = Array.isArray(result.data)
            ? result.data
            : Array.isArray(result.categories)
                ? result.categories
                : [];

        categorySelect.innerHTML =
            '<option value="">Select a category</option>';

        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });

        if (categories.length === 0) {
            showMessage("No categories were found. Add a category before creating an event.", "error");
        }
    } catch (error) {
        categorySelect.innerHTML =
            '<option value="">Unable to load categories</option>';
        showMessage(error.message, "error");
    }
}

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!token || !user || Number(user.role_id) !== 2) {
        showMessage("Please log in with an Event Organizer account.", "error");
        return;
    }

    const formData = new FormData(form);

    const eventDate = formData.get("event_date");
    const deadline = formData.get("registration_deadline");
    const startTime = formData.get("start_time");
    const endTime = formData.get("end_time");

    if (deadline > eventDate) {
        showMessage("The registration deadline cannot be after the event date.", "error");
        return;
    }

    if (endTime <= startTime) {
        showMessage("The end time must be later than the start time.", "error");
        return;
    }

    const eventData = {
        title: formData.get("title").trim(),
        description: formData.get("description").trim(),
        category_id: Number(formData.get("category_id")),
        venue: formData.get("venue").trim(),
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        maximum_capacity: Number(formData.get("maximum_capacity")),
        registration_deadline: deadline,
        status: formData.get("status")
    };

    submitButton.disabled = true;
    submitButton.textContent = "Creating Event...";

    try {
        const response = await fetch(`${API_URL}/events`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(eventData)
        });

        const result = await response.json();

        if (!response.ok) {
            const details = result.errors
                ? Object.values(result.errors).flat().join(" ")
                : result.message;

            throw new Error(details || "The event could not be created.");
        }

        showMessage(
            result.message || "Event created successfully!",
            "success"
        );

        form.reset();
        await loadCategories();

    } catch (error) {
        showMessage(error.message, "error");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Create Event";
    }
});

document.getElementById("logoutLink").addEventListener("click", async function (event) {
    event.preventDefault();

    try {
        await fetch("https://campus-events-api-production.up.railway.app/api/logout", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error("Logout request failed:", error);
    } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    }
});
