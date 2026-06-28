// Immutablejs state
const { Map, List } = Immutable;

// Initial app state
let state = Map({
    rovers: List(),
    selectedRover: "Curiosity",
    loading: true,
    apod: '',
});

// Static rover metadata
const roverMeta = {
    Curiosity: {
        status: "active",
        launchDate: "2011-11-26",
        landingDate: "2012-08-06",
    },
    Opportunity: {
        status: "complete",
        launchDate: "2003-07-07",
        landingDate: "2004-01-25",
    },
    Spirit: {
        status: "complete",
        launchDate: "2003-06-10",
        landingDate: "2004-01-04",
    },
};

// Pure state update functions
const setRovers = (state, rovers) =>
    state
        .set("rovers", List(rovers))
        .set("selectedRover", rovers[0]?.name || "Curiosity")
        .set("loading", false);

const selectRover = (state, roverName) =>
    state.set("selectedRover", roverName);

// Render helpers
const ul = (items) => `
    <ul>
        ${items.map((item) => `<li>${item}</li>`).join("")}
    </ul>
`;

// Getting the photos setup for display
const renderPhotos = (photos) => {
    // Check if photos exists
    if (!photos || photos.length === 0) {
        return `<p>No photos available.</p>`;
    }
    // Return the HTML for the thumb photos and titles
    return `
        <div class="photos">
        ${photos
            .slice(0, 6)
            .map(
                (p) => `
                    <figure data-full="${p.thumb}" data-title="${p.title}">
                    <img src="${p.thumb}" alt="${p.title}" />
                    <figcaption>${p.title}</figcaption>
                    </figure>
                `
            )
            .join("")}
        </div>
    `;
};

// Sets the mission status
const renderStatusBadge = (status) => {
    const label = status === "active" ? "Active Mission" : "Completed Mission";
    
    return `<span class="status status-${status}">${label}</span>`;
};

// Creates the section for the photo thumbs and used for the data section 
const section = (title, content) => `
    <section>
        <h2>${title}</h2>
        ${content}
    </section>
`;

// Main render function
const render = (state) => {
   // Define root element
    const root = document.getElementById("root");
    
    // Check loading state
    if (state.get("loading")) {
        root.innerHTML = `<div id="loading">Loading rover data...</div>`;
        return;
    }

    // Assign values to variables
    const rovers = state.get("rovers").toJS();
    const selected = state.get("selectedRover");
    const current = rovers.find((r) => r.name === selected);

    // Build tabs
    const tabs = `
        <div class="tabs">
        ${rovers
            .map(
                (r) => `
                <button
                    class="tab ${r.name === selected ? "active" : ""}"
                    data-rover="${r.name}"
                >
                    ${r.name}
                </button>
            `
            )
            .join("")
        }
        </div>
    `;
    // Rover info `Photos Returned: ${current.photos.length}`,
    const info = `
        <div class="rover-layout">
            <div>
                ${section(
                    current.name,
                    `
                    ${renderStatusBadge(current.status)}
                    ${ul([
                        `Rover: ${current.name}`,
                        `Launch Date: ${current.launchDate}`,
                        `Landing Date: ${current.landingDate}`                        
                    ])}
                    <div class="thumbs-under-meta">
                        ${section("Latest Photos", renderPhotos(current.photos))}
                    </div>
                    `
                )}
            </div>
            <div class="apod">
                <section>
                    <h2>Picture of the Day</h2>
                    <p><strong>${state.get("apod").title} ${state.get("apod").date}</strong> </p>
                    <img src="${state.get("apod").url}" alt="${state.get("apod").title}" />
                    <p><strong>${state.get("apod").explanation}</strong></p>
                    <p class="copyright">
                        ${state.get("apod").copyright 
                            ? `© ${state.get("apod").copyright}` 
                            : "© NASA / Public Domain"}
                    </p>
                </section>
            </div>
        </div>
    `;

    // Add to index.html
    root.innerHTML = `
        <h1>Mars Rover Dashboard</h1>
        ${tabs}
        ${info}
    `;

    // Tab switching
    document.querySelectorAll(".tab").forEach((btn) => {
        btn.addEventListener("click", () => {
            state = selectRover(state, btn.dataset.rover);
            render(state);
        });
    });

    // Modal viewer
    document.querySelectorAll("figure").forEach((fig) => {
        fig.addEventListener("click", () => {
            const full = fig.dataset.full;
            const title = fig.dataset.title;

            document.getElementById("modal-img").src = full;
            document.getElementById("modal-title").textContent = title;

            document.getElementById("modal").style.display = "flex";
        });
    });

    // Listener to hide modal
    document.getElementById("modal").addEventListener("click", () => {
        document.getElementById("modal").style.display = "none";
    });
};

    // Fetch rover data on startup
    Promise.all([
        fetch("/api/rovers/Curiosity").then((r) => r.json()),
        fetch("/api/rovers/Opportunity").then((r) => r.json()),
        fetch("/api/rovers/Spirit").then((r) => r.json()),
        fetch("/api/apod").then(r => r.json()),
    ])
    .then(([c, o, s, apod]) => {
        const normalize = (data) => ({
            name: data.rover,
            status: roverMeta[data.rover].status,
            launchDate: roverMeta[data.rover].launchDate,
            landingDate: roverMeta[data.rover].landingDate,
            photos: data.photos.map((p) => ({
                thumb: p.thumb,
                title: p.title,
                description: p.description,
            })),
        });

        const rovers = [normalize(c), normalize(o), normalize(s)];
        
        state = setRovers(state, rovers).set("apod", apod);

        // Initial render
        render(state);
    })
    .catch((err) => {
        console.error(err);
        document.getElementById("root").innerHTML =
        "<p>Failed to load rover data.</p>";
    });