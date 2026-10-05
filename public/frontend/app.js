const API_URL = "http://127.0.0.1:8000/api/v1";


// Display logged-in user
function displayUser() {

    const user = localStorage.getItem("user");

    if (user) {

        const userData = JSON.parse(user);

        document.getElementById("userInfo").textContent =
            "Welcome, " + userData.name;
    }
}


// Load events
async function loadEvents() {

    const search = document.getElementById("search").value;
    const category = document.getElementById("category").value;

    let url = `${API_URL}/events?`;

    if (search) {
        url += `search=${encodeURIComponent(search)}&`;
    }

    if (category) {
        url += `category_id=${category}`;
    }

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(url, {

            method: "GET",

            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }

        });

        const result = await response.json();

        const eventsContainer =
            document.getElementById("events");


        if (!response.ok) {

            eventsContainer.innerHTML =
                `<p>${result.message || "Unable to load events."}</p>`;

            return;
        }


        eventsContainer.innerHTML = "";


        if (result.data.length === 0) {

            eventsContainer.innerHTML =
                "<p>No events found.</p>";

            return;
        }


        result.data.forEach(event => {

            eventsContainer.innerHTML += `

                <div class="event-card">

                    <h3>${event.title}</h3>

                    <p>
                        <strong>Description:</strong>
                        ${event.description || "No description"}
                    </p>

                    <p>
                        <strong>Venue:</strong>
                        ${event.venue}
                    </p>

                    <p>
                        <strong>Date:</strong>
                        ${event.event_date}
                    </p>

                    <p>
                        <strong>Time:</strong>
                        ${event.start_time} - ${event.end_time}
                    </p>

                    <p>
                        <strong>Capacity:</strong>
                        ${event.maximum_capacity}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${event.status || "Upcoming"}
                    </p>

                    <button onclick="registerForEvent(${event.id})">
                        Register for Event
                    </button>

                </div>

            `;
        });

    } catch (error) {

        console.error(error);

        document.getElementById("events").innerHTML =
            "<p>Unable to connect to the Laravel API.</p>";
    }
}


// Load categories
async function loadCategories() {

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            `${API_URL}/categories`,
            {
                method: "GET",

                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const result = await response.json();

        const categorySelect =
            document.getElementById("category");


        if (!response.ok) {
            return;
        }


        result.data.forEach(category => {

            categorySelect.innerHTML += `

                <option value="${category.id}">
                    ${category.name}
                </option>

            `;

        });


    } catch (error) {

        console.error(
            "Could not load categories:",
            error
        );

    }
}


// Register for an event
async function registerForEvent(eventId) {

    const token = localStorage.getItem("token");


    if (!token) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;
    }


    try {

        const response = await fetch(
            "http://127.0.0.1:8000/api/v1/registrations",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    event_id: eventId
                })
            }
        );


        const result = await response.json();


        if (response.ok) {

            alert(
                "You have successfully registered for this event."
            );

        } else {

            alert(
                result.message || "Registration failed."
            );

        }


    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to the Laravel API."
        );

    }
}


// Logout
async function logout() {

    const token = localStorage.getItem("token");


    try {

        await fetch(
            "http://127.0.0.1:8000/api/logout",
            {
                method: "POST",

                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );

    } catch (error) {

        console.error(error);

    }


    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
}


// Load page
document.addEventListener(
    "DOMContentLoaded",
    function() {

        displayUser();

        loadCategories();

        loadEvents();

    }
);