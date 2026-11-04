
const API_URL =
    "https://campus-events-api-production.up.railway.app/api/v1";

const AUTH_URL =
    "https://campus-events-api-production.up.railway.app/api";

const FRONTEND_URL =
    "https://2407419-create.github.io";

const token = localStorage.getItem("token");

let user = null;

let organizerEvents = [];

let organizerRegistrations = [];


try {

    user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

} catch {

    user = null;

}


const form = document.getElementById("eventForm");

const categorySelect =
    document.getElementById("category_id");

const message =
    document.getElementById("message");

const submitButton =
    document.getElementById("submitButton");


// CHECK LOGIN AND ORGANIZER ROLE

if (!token || !user) {

    alert("Please log in first.");

    window.location.href =
        `${FRONTEND_URL}/login.html`;

} else if (Number(user.role_id) !== 2) {

    alert("This dashboard is only for Event Organizers.");

    window.location.href = FRONTEND_URL;

} else {

    document.getElementById("welcome").textContent =
        `Welcome, ${user.name}. You are logged in as an Event Organizer.`;

    initializeDashboard();

}


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


    const result = await response.json();


    if (!response.ok) {

        const errors = result.errors
            ? Object.values(result.errors).flat().join(" ")
            : result.message;

        throw new Error(
            errors || "Something went wrong."
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

        console.error(error);

        alert(error.message);

    }

}


// LOAD CATEGORIES

async function loadCategories() {

    try {

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

    } catch (error) {

        categorySelect.innerHTML =
            '<option value="">Unable to load categories</option>';

        throw error;

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
        .toISOString()
        .split("T")[0];


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


// DISPLAY ORGANIZER EVENTS

function displayEvents() {

    const table =
        document.getElementById("eventsTable");


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


        const title = row.insertCell();

        const category = row.insertCell();

        const date = row.insertCell();

        const venue = row.insertCell();

        const status = row.insertCell();


        title.textContent =
            event.title || "N/A";


        category.textContent =
            event.category?.name || "N/A";


        date.textContent =
            event.event_date || "N/A";


        venue.textContent =
            event.venue || "N/A";


        status.textContent =
            event.status || "N/A";

    });

}


// DISPLAY STUDENT REGISTRATIONS

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


        const student = row.insertCell();

        const event = row.insertCell();

        const status = row.insertCell();


        student.textContent =
            registration.user?.name || "Unknown student";


        event.textContent =
            registration.event?.title || "Unknown event";


        status.textContent =
            registration.status || "N/A";

    });

}


// DISPLAY SUCCESS OR ERROR MESSAGE

function showMessage(text, type) {

    message.textContent = text;

    message.className = `message ${type}`;

}


// CREATE A NEW EVENT

form.addEventListener("submit", async function(event) {

    event.preventDefault();


    const formData = new FormData(form);


    const eventDate =
        formData.get("event_date");

    const deadline =
        formData.get("registration_deadline");

    const startTime =
        formData.get("start_time");

    const endTime =
        formData.get("end_time");


    // Validate registration deadline.

    if (deadline && deadline > eventDate) {

        showMessage(
            "The registration deadline cannot be after the event date.",
            "error"
        );

        return;

    }


    // Validate event time.

    if (endTime <= startTime) {

        showMessage(
            "The end time must be later than the start time.",
            "error"
        );

        return;

    }


    const eventData = {

        title: formData.get("title").trim(),

        description: formData.get("description").trim(),

        category_id: Number(
            formData.get("category_id")
        ),

        venue: formData.get("venue").trim(),

        event_date: eventDate,

        start_time: startTime,

        end_time: endTime,

        maximum_capacity: Number(
            formData.get("maximum_capacity")
        ),

        registration_deadline: deadline || null,

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


        showMessage(

            result.message ||
            "Event created successfully!",

            "success"

        );


        form.reset();


        // Refresh dashboard information.

        await loadDashboardData();


    } catch (error) {

        showMessage(
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


        const selectedSection =
            this.dataset.section;


        // Hide all sections.

        document.querySelectorAll(
            ".dashboard-section"
        ).forEach(section => {

            section.hidden = true;

        });


        // Show selected section.

        document.getElementById(
            selectedSection
        ).hidden = false;


        // Update active navigation button.

        document.querySelectorAll(
            ".navigation button"
        ).forEach(navButton => {

            navButton.classList.remove("active");

        });


        this.classList.add("active");


    });

});


// LOGOUT

document.getElementById(
    "logoutLink"
).addEventListener("click", async function(event) {


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

        console.error(
            "Logout request failed:",
            error
        );

    } finally {


        localStorage.removeItem("token");

        localStorage.removeItem("user");


        window.location.href =
            `${FRONTEND_URL}/login.html`;


    }

});
