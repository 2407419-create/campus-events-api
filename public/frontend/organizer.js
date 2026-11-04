const API_URL =
    "https://campus-events-api-production.up.railway.app/api/v1";

const AUTH_URL =
    "https://campus-events-api-production.up.railway.app/api";

let token = localStorage.getItem("token");

let user = null;

let organizerEvents = [];

let organizerRegistrations = [];


// GET HTML ELEMENTS

const loginArea = document.getElementById("loginArea");

const dashboardArea = document.getElementById("dashboardArea");

const loginForm = document.getElementById("loginForm");

const loginMessage = document.getElementById("loginMessage");

const loginButton = document.getElementById("loginButton");

const eventForm = document.getElementById("eventForm");

const categorySelect = document.getElementById("category_id");

const eventMessage = document.getElementById("eventMessage");

const submitButton = document.getElementById("submitButton");

const logoutLink = document.getElementById("logoutLink");


// DISPLAY MESSAGE

function showMessage(element, text, type) {

    element.textContent = text;

    element.className = `message ${type}`;

}


// CHECK USER INFORMATION

function getSavedUser() {

    try {

        return JSON.parse(
            localStorage.getItem("user") || "null"
        );

    } catch (error) {

        return null;

    }

}


// SHOW LOGIN OR DASHBOARD

function checkLogin() {

    token = localStorage.getItem("token");

    user = getSavedUser();

    if (!token || !user) {

        loginArea.hidden = false;

        dashboardArea.hidden = true;

        logoutLink.hidden = true;

        return;

    }

    if (Number(user.role_id) !== 2) {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        token = null;

        user = null;

        loginArea.hidden = false;

        dashboardArea.hidden = true;

        logoutLink.hidden = true;

        showMessage(
            loginMessage,
            "This dashboard is only for Event Organizers. Please log in with an organizer account.",
            "error"
        );

        return;

    }

    loginArea.hidden = true;

    dashboardArea.hidden = false;

    logoutLink.hidden = false;

    document.getElementById("welcome").textContent =
        `Welcome, ${user.name}. You are logged in as an Event Organizer.`;

    initializeDashboard();

}


// ORGANIZER LOGIN

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;

    loginButton.disabled = true;

    loginButton.textContent = "Logging in...";

    showMessage(loginMessage, "", "");

    try {

        const response = await fetch(`${AUTH_URL}/login`, {

            method: "POST",

            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })

        });

        const result = await response.json();

        if (!response.ok) {

            const errors = result.errors
                ? Object.values(result.errors).flat().join(" ")
                : result.message;

            throw new Error(
                errors || "Login failed. Check your email and password."
            );

        }

        if (!result.token || !result.user) {

            throw new Error(
                "The login response did not contain a token and user information."
            );

        }

        // Check organizer role before saving the session.

        if (Number(result.user.role_id) !== 2) {

            throw new Error(
                "Access denied. This account is not an Event Organizer account."
            );

        }

        // Save Sanctum token and user information.

        localStorage.setItem("token", result.token);

        localStorage.setItem(
            "user",
            JSON.stringify(result.user)
        );

        token = result.token;

        user = result.user;

        loginForm.reset();

        checkLogin();

    } catch (error) {

        showMessage(
            loginMessage,
            error.message,
            "error"
        );

    } finally {

        loginButton.disabled = false;

        loginButton.textContent = "Log In";

    }

});


// API REQUEST HELPER

async function apiRequest(url, options = {}) {

    const response = await fetch(url, {

        ...options,

        headers: {

            "Accept": "application/json",

            "Authorization": `Bearer ${token}`,

            ...(options.headers || {})

        }

    });

    const result = await response.json().catch(() => ({}));

    if (response.status === 401) {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        token = null;

        user = null;

        loginArea.hidden = false;

        dashboardArea.hidden = true;

        logoutLink.hidden = true;

        throw new Error(
            "Your login session has expired. Please log in again."
        );

    }

    if (!response.ok) {

        const errors = result.errors
            ? Object.values(result.errors).flat().join(" ")
            : result.message;

        throw new Error(
            errors || "The API request failed."
        );

    }

    return result;

}


// INITIALIZE DASHBOARD

async function initializeDashboard() {

    try {

        await Promise.all([
            loadCategories(),
            loadDashboardData()
        ]);

    } catch (error) {

        console.error("Dashboard error:", error);

        alert(error.message);

    }

}


// LOAD EVENT CATEGORIES

async function loadCategories() {

    const result = await apiRequest(
        `${API_URL}/categories`
    );

    const categories = Array.isArray(result.data)
        ? result.data
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

        categorySelect.innerHTML =
            '<option value="">No categories available</option>';

    }

}


// LOAD EVENTS AND REGISTRATIONS

async function loadDashboardData() {

    const [eventsResult, registrationsResult] =
        await Promise.all([

            apiRequest(`${API_URL}/events`),

            apiRequest(`${API_URL}/registrations`)

        ]);

    organizerEvents = Array.isArray(eventsResult.data)
        ? eventsResult.data
        : [];

    organizerRegistrations =
        Array.isArray(registrationsResult.data)
            ? registrationsResult.data
            : [];

    updateOverview();

    displayEvents();

    displayRegistrations();

}


// UPDATE DASHBOARD STATISTICS

function updateOverview() {

    const today = new Date()
        .toLocaleDateString("en-CA");

    const upcoming = organizerEvents.filter(event =>

        event.event_date >= today &&
        event.status === "Upcoming"

    );

    document.getElementById("totalEvents").textContent =
        organizerEvents.length;

    document.getElementById("upcomingEvents").textContent =
        upcoming.length;

    document.getElementById("totalRegistrations").textContent =
        organizerRegistrations.length;

}


// DISPLAY EVENTS

function displayEvents() {

    const table = document.getElementById("eventsTable");

    table.innerHTML = "";

    if (organizerEvents.length === 0) {

        const row = table.insertRow();

        const cell = row.insertCell();

        cell.colSpan = 5;

        cell.textContent =
            "You have not created any events yet.";

        return;

    }

    organizerEvents.forEach(event => {

        const row = table.insertRow();

        row.insertCell().textContent =
            event.title || "N/A";

        row.insertCell().textContent =
            event.category?.name || "N/A";

        row.insertCell().textContent =
            event.event_date || "N/A";

        row.insertCell().textContent =
            event.venue || "N/A";

        row.insertCell().textContent =
            event.status || "N/A";

    });

}


// DISPLAY REGISTRATIONS

function displayRegistrations() {

    const table =
        document.getElementById("registrationsTable");

    table.innerHTML = "";

    if (organizerRegistrations.length === 0) {

        const row = table.insertRow();

        const cell = row.insertCell();

        cell.colSpan = 3;

        cell.textContent =
            "No students have registered for your events yet.";

        return;

    }

    organizerRegistrations.forEach(registration => {

        const row = table.insertRow();

        row.insertCell().textContent =
            registration.user?.name || "Unknown student";

        row.insertCell().textContent =
            registration.event?.title || "Unknown event";

        row.insertCell().textContent =
            registration.status || "N/A";

    });

}


// DISPLAY EVENT SUCCESS OR ERROR

function showEventMessage(text, type) {

    showMessage(eventMessage, text, type);

}


// CREATE EVENT

eventForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const formData = new FormData(eventForm);

    const eventDate = formData.get("event_date");

    const deadline = formData.get("registration_deadline");

    const startTime = formData.get("start_time");

    const endTime = formData.get("end_time");

    if (deadline > eventDate) {

        showEventMessage(
            "The registration deadline cannot be after the event date.",
            "error"
        );

        return;

    }

    if (endTime <= startTime) {

        showEventMessage(
            "The end time must be later than the start time.",
            "error"
        );

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

        maximum_capacity: Number(
            formData.get("maximum_capacity")
        ),

        registration_deadline: deadline,

        status: formData.get("status")

    };

    submitButton.disabled = true;

    submitButton.textContent = "Creating Event...";

    try {

        const result = await apiRequest(
            `${API_URL}/events`,
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(eventData)

            }
        );

        showEventMessage(
            result.message || "Event created successfully!",
            "success"
        );

        eventForm.reset();

        await loadDashboardData();

    } catch (error) {

        showEventMessage(
            error.message,
            "error"
        );

    } finally {

        submitButton.disabled = false;

        submitButton.textContent = "Create Event";

    }

});


// DASHBOARD NAVIGATION

document.querySelectorAll(
    ".navigation button"
).forEach(button => {

    button.addEventListener("click", function() {

        const selectedSection = this.dataset.section;

        document.querySelectorAll(
            ".dashboard-section"
        ).forEach(section => {

            section.hidden = true;

        });

        document.getElementById(
            selectedSection
        ).hidden = false;

        document.querySelectorAll(
            ".navigation button"
        ).forEach(navButton => {

            navButton.classList.remove("active");

        });

        this.classList.add("active");

    });

});


// LOGOUT

logoutLink.addEventListener("click", async function(event) {

    event.preventDefault();

    try {

        await fetch(`${AUTH_URL}/logout`, {

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

        token = null;

        user = null;

        dashboardArea.hidden = true;

        logoutLink.hidden = true;

        loginArea.hidden = false;

        showMessage(
            loginMessage,
            "You have logged out successfully.",
            "success"
        );

    }

});


// START THE DASHBOARD

checkLogin();