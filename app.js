```javascript
const SUPABASE_URL = "https://uvshnvndkvplhwalopid.supabase.co";
const SUPABASE_KEY = "YOUR_PUBLISHABLE_KEY";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let currentUser = null;
let notes = [];
let currentNote = null;
let currentView = "dashboard";

/* =========================
   INITIALIZATION
========================= */

document.addEventListener("DOMContentLoaded", async () => {
  setupNavigation();
  setupSearch();
  setupGlobalButtons();

  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {
    currentUser = data.session.user;
    await loadApp();
  } else {
    showLogin();
  }

  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    if (session) {
      currentUser = session.user;
      await loadApp();
    } else {
      currentUser = null;
      showLogin();
    }
  });
});

/* =========================
   AUTH
========================= */

function showLogin() {
  document.body.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <h1>My Knowledge System</h1>
        <p>Sign in to continue.</p>

        <form id="loginForm">
          <input
            type="email"
            id="loginEmail"
            placeholder="Email"
            required
          />

          <input
            type="password"
            id="loginPassword"
            placeholder="Password"
            required
          />

          <button type="submit">Sign In</button>
        </form>

        <p id="loginError"></p>
      </div>
    </div>
  `;

  document
    .getElementById("loginForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;

      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        document.getElementById("loginError").textContent = error.message;
      }
    });
}

/* =========================
   APP LOADING
========================= */

async function loadApp() {
  await loadNotes();
  renderApp();
}

async function loadNotes() {
  const { data, error } = await supabaseClient
    .from("notes")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading notes:", error);
    alert("Could not load notes: " + error.message);
    return;
  }

  notes = data || [];
}

/* =========================
   MAIN APP
========================= */

function renderApp() {
  document.body.innerHTML = `
    <div class="app">

      <aside class="sidebar">

        <div class="logo">
          <h2>Knowledge System</h2>
        </div>

        <nav>
          <button data-view="dashboard">Dashboard</button>
          <button data-view="medicine">Medicine</button>
          <button data-view="finance">Finance</button>
          <button data-view="career">Career</button>
          <button data-view="knowledge">Knowledge</button>
          <button data-view="life">Life</button>
          <button data-view="projects">Projects</button>
          <button data-view="inbox">Inbox</button>
          <button data-view="resources">Resources</button>
          <button data-view="settings">Settings</button>
        </nav>

        <button id="logoutButton">Log Out</button>

      </aside>

      <main class="main-content">

        <header class="topbar">

          <div class="search-container">
            <input
              type="text"
              id="searchInput"
              placeholder="Search your knowledge..."
            />
          </div>

          <button id="newNoteButton">
            + New Note
          </button>

        </header>

        <section id="content"></section>

      </main>

    </div>

    <div id="modalContainer"></div>
  `;

  setupNavigation();
  setupSearch();
  setupGlobalButtons();

  renderCurrentView();
}

/* =========================
   NAVIGATION
========================= */

function setupNavigation() {
  document.addEventListener("click", (e) => {
    const button = e.target.closest("[data-view]");

    if (!button) return;

    currentView = button.dataset.view;
    renderCurrentView();
  });
}

function renderCurrentView() {
  const content = document.getElementById("content");

  if (!content) return;

  switch (currentView) {
    case "dashboard":
      renderDashboard();
      break;

    case "medicine":
      renderNotesByArea("Medicine");
      break;

    case "finance":
      renderNotesByArea("Finance");
      break;

    case "career":
      renderNotesByArea("Career");
      break;

    case "knowledge":
      renderNotesByArea("Knowledge");
      break;

    case "life":
      renderNotesByArea("Life");
      break;

    case "projects":
      renderNotesByArea("Projects");
      break;

    case "inbox":
      renderInbox();
      break;

    case "resources":
      renderResources();
      break;

    case "settings":
      renderSettings();
      break;

    default:
      renderDashboard();
  }
}

/* =========================
   DASHBOARD
========================= */

function renderDashboard() {
  const content = document.getElementById("content");

  const favorites = notes.filter(n => n.favorite);
  const inbox = notes.filter(n => n.status === "Inbox");

  content.innerHTML = `
    <div class="page-header">
      <h1>Good morning</h1>
      <p>Your personal knowledge system.</p>
    </div>

    <div class="stats-grid">

      <div class="stat-card">
        <h3>${notes.length}</h3>
        <p>Total Notes</p>
      </div>

      <div class="stat-card">
        <h3>${favorites.length}</h3>
        <p>Favorites</p>
      </div>

      <div class="stat-card">
        <h3>${inbox.length}</h3>
        <p>Inbox</p>
      </div>

    </div>

    <div class="section-header">
      <h2>Recently Added</h2>
    </div>

    <div id="recentNotes">
      ${renderNoteCards(notes.slice(0, 10))}
    </div>
  `;
}

/* =========================
   NOTE CARDS
========================= */

function renderNoteCards(noteList) {

  if (!noteList.length) {
    return `
      <div class="empty-state">
        <p>No notes yet.</p>
        <button id="emptyNewNote">Create your first note</button>
      </div>
    `;
  }

  return `
    <div class="notes-grid">
      ${noteList.map(note => `
        <div
          class="note-card"
          data-note-id="${note.id}"
          onclick="openNote('${note.id}')"
        >

          <div class="note-card-header">

            <h3>
              ${escapeHtml(note.title || "Untitled")}
            </h3>

            ${
              note.favorite
                ? `<span class="favorite">★</span>`
                : ""
            }

          </div>

          ${
            note.summary
              ? `<p>${escapeHtml(note.summary)}</p>`
              : ""
          }

          <div class="note-meta">

            ${
              note.area
                ? `<span>${escapeHtml(note.area)}</span>`
                : ""
            }

            ${
              note.type
                ? `<span>${escapeHtml(note.type)}</span>`
                : ""
            }

            ${
              note.status
                ? `<span>${escapeHtml(note.status)}</span>`
                : ""
            }

          </div>

        </div>
      `).join("")}
    </div>
  `;
}

/* =========================
   AREA VIEWS
========================= */

function renderNotesByArea(area) {

  const content = document.getElementById("content");

  const filtered = notes.filter(
    note => note.area === area
  );

  content.innerHTML = `
    <div class="page-header">
      <h1>${area}</h1>
      <p>${filtered.length} notes</p>
    </div>

    ${renderNoteCards(filtered)}
  `;
}

/* =========================
   INBOX
========================= */

function renderInbox() {

  const content = document.getElementById("content");

  const inboxNotes = notes.filter(
    note => note.status === "Inbox"
  );

  content.innerHTML = `
    <div class="page-header">
      <h1>Inbox</h1>
      <p>Notes that still need processing.</p>
    </div>

    ${renderNoteCards(inboxNotes)}
  `;
}

/* =========================
   RESOURCES
========================= */

function renderResources() {

  const content = document.getElementById("content");

  const resources = notes.filter(
    note => note.type === "Resource"
  );

  content.innerHTML = `
    <div class="page-header">
      <h1>Resources</h1>
      <p>Saved references and useful materials.</p>
    </div>

    ${renderNoteCards(resources)}
  `;
}

/* =========================
   SETTINGS
========================= */

function renderSettings() {

  const content = document.getElementById("content");

  content.innerHTML = `
    <div class="page-header">
      <h1>Settings</h1>
    </div>

    <div class="settings-card">
      <p>
        Logged in as:
        <strong>${escapeHtml(currentUser.email)}</strong>
      </p>
    </div>
  `;
}

/* =========================
   SEARCH
========================= */

function setupSearch() {

  const input = document.getElementById("searchInput");

  if (!input) return;

  input.addEventListener("input", () => {

    const query = input.value
      .trim()
      .toLowerCase();

    if (!query) {
      renderCurrentView();
      return;
    }

    performSearch(query);
  });
}

function performSearch(query) {

  const content = document.getElementById("content");

  const results = notes.filter(note => {

    const searchableText = [

      note.title,
      note.summary,
      note.content,
      note.area,
      note.type,
      note.status,
      note.source,
      note.url,
      Array.isArray(note.tags)
        ? note.tags.join(" ")
        : note.tags

    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });

  content.innerHTML = `
    <div class="page-header">

      <h1>Search Results</h1>

      <p>
        ${results.length}
        ${results.length === 1 ? "result" : "results"}
      </p>

    </div>

    ${renderNoteCards(results)}
  `;
}

/* =========================
   NOTE MODAL
========================= */

window.openNote = function(noteId) {

  const note = notes.find(
    n => String(n.id) === String(noteId)
  );

  if (!note) {
    console.error("Could not find note:", noteId);
    return;
  }

  currentNote = note;

  const modalContainer =
    document.getElementById("modalContainer");

  modalContainer.innerHTML = `

    <div class="modal-overlay" id="noteModal">

      <div class="note-modal">

        <div class="modal-header">

          <h2>
            ${escapeHtml(note.title || "Untitled")}
          </h2>

          <button
            onclick="closeNoteModal()"
            class="close-button"
          >
            ×
          </button>

        </div>

        <div class="note-details">

          ${
            note.summary
              ? `
                <div class="note-summary">
                  <strong>Summary</strong>
                  <p>${escapeHtml(note.summary)}</p>
                </div>
              `
              : ""
          }

          <div class="note-meta">

            ${
              note.area
                ? `<span>Area: ${escapeHtml(note.area)}</span>`
                : ""
            }

            ${
              note.type
                ? `<span>Type: ${escapeHtml(note.type)}</span>`
                : ""
            }

            ${
              note.status
                ? `<span>Status: ${escapeHtml(note.status)}</span>`
                : ""
            }

          </div>

          <div class="note-content">

            ${formatNoteContent(note.content)}

          </div>

          ${
            note.source
              ? `
                <div class="note-source">
                  <strong>Source:</strong>
                  ${escapeHtml(note.source)}
                </div>
              `
              : ""
          }

          ${
            note.url
              ? `
                <div class="note-source">
                  <a
                    href="${escapeAttribute(note.url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Source
                  </a>
                </div>
              `
              : ""
          }

        </div>

        <div class="modal-actions">

          <button onclick="editNote('${note.id}')">
            Edit
          </button>

          <button onclick="deleteNote('${note.id}')">
            Delete
          </button>

        </div>

      </div>

    </div>
  `;

  document
    .getElementById("noteModal")
    .addEventListener("click", (e) => {

      if (e.target.id === "noteModal") {
        closeNoteModal();
      }

    });
};

window.closeNoteModal = function() {

  const modal =
    document.getElementById("noteModal");

  if (modal) {
    modal.remove();
  }

  currentNote = null;
};

/* =========================
   NEW NOTE
========================= */

function setupGlobalButtons() {

  const newButton =
    document.getElementById("newNoteButton");

  if (newButton) {
    newButton.onclick = () => openNoteEditor();
  }

  const logoutButton =
    document.getElementById("logoutButton");

  if (logoutButton) {
    logoutButton.onclick = async () => {
      await supabaseClient.auth.signOut();
    };
  }
}

window.openNoteEditor = function(note = null) {

  const modalContainer =
    document.getElementById("modalContainer");

  const isEditing = !!note;

  modalContainer.innerHTML = `

    <div class="modal-overlay">

      <div class="note-modal">

        <div class="modal-header">

          <h2>
            ${isEditing ? "Edit Note" : "New Note"}
          </h2>

          <button
            onclick="closeEditor()"
            class="close-button"
          >
            ×
          </button>

        </div>

        <form id="noteForm">

          <label>Title</label>

          <input
            id="noteTitle"
            value="${escapeAttribute(note?.title || "")}"
            required
          />

          <label>Summary</label>

          <textarea
            id="noteSummary"
            rows="3"
          >${escapeHtml(note?.summary || "")}</textarea>

          <label>Area</label>

          <select id="noteArea">

            ${option("Medicine", note?.area)}
            ${option("Finance", note?.area)}
            ${option("Career", note?.area)}
            ${option("Knowledge", note?.area)}
            ${option("Life", note?.area)}
            ${option("Projects", note?.area)}
            ${option("Inbox", note?.area)}
            ${option("Resources", note?.area)}

          </select>

          <label>Type</label>

          <select id="noteType">

            ${option("Note", note?.type)}
            ${option("Clinical Pearl", note?.type)}
            ${option("Resource", note?.type)}
            ${option("Idea", note?.type)}
            ${option("Project", note?.type)}
            ${option("Reference", note?.type)}

          </select>

          <label>Status</label>

          <select id="noteStatus">

            ${option("Inbox", note?.status)}
            ${option("Active", note?.status)}
            ${option("Reviewed", note?.status)}
            ${option("Archived", note?.status)}

          </select>

          <label>Review Date</label>

          <input
            type="date"
            id="noteReviewDate"
            value="${note?.review_date || ""}"
          />

          <label>Tags</label>

          <input
            id="noteTags"
            value="${
              Array.isArray(note?.tags)
                ? note.tags.join(", ")
                : note?.tags || ""
            }"
            placeholder="e.g. hypertension, cardiology"
          />

          <label>Content</label>

          <textarea
            id="noteContent"
            rows="12"
          >${escapeHtml(note?.content || "")}</textarea>

          <label>Source</label>

          <input
            id="noteSource"
            value="${escapeAttribute(note?.source || "")}"
          />

          <label>Source URL</label>

          <input
            id="noteUrl"
            value="${escapeAttribute(note?.url || "")}"
            type="url"
          />

          <label class="checkbox-label">

            <input
              type="checkbox"
              id="noteFavorite"
              ${note?.favorite ? "checked" : ""}
            />

            Favorite

          </label>

          <button type="submit">
            ${isEditing ? "Save Changes" : "Save Note"}
          </button>

        </form>

      </div>

    </div>
  `;

  document
    .getElementById("noteForm")
    .addEventListener("submit", async (e) => {

      e.preventDefault();

      await saveNote(note?.id || null);

    });
};

window.closeEditor = function() {

  const modalContainer =
    document.getElementById("modalContainer");

  modalContainer.innerHTML = "";
};

/* =========================
   SAVE NOTE
========================= */

async function saveNote(noteId) {

  const tagsValue =
    document.getElementById("noteTags").value;

  const tags = tagsValue
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean);

  const noteData = {

    title:
      document.getElementById("noteTitle").value.trim(),

    summary:
      document.getElementById("noteSummary").value.trim(),

    area:
      document.getElementById("noteArea").value,

    type:
      document.getElementById("noteType").value,

    status:
      document.getElementById("noteStatus").value,

    review_date:
      document.getElementById("noteReviewDate").value || null,

    tags,

    content:
      document.getElementById("noteContent").value,

    source:
      document.getElementById("noteSource").value.trim(),

    url:
      document.getElementById("noteUrl").value.trim(),

    favorite:
      document.getElementById("noteFavorite").checked

  };

  let result;

  if (noteId) {

    result = await supabaseClient
      .from("notes")
      .update(noteData)
      .eq("id", noteId)
      .eq("user_id", currentUser.id);

  } else {

    result = await supabaseClient
      .from("notes")
      .insert({
        ...noteData,
        user_id: currentUser.id
      });

  }

  if (result.error) {

    console.error(result.error);

    alert(
      "Could not save note:\n\n" +
      result.error.message
    );

    return;
  }

  closeEditor();

  await loadNotes();

  renderCurrentView();
}

/* =========================
   EDIT NOTE
========================= */

window.editNote = function(noteId) {

  const note = notes.find(
    n => String(n.id) === String(noteId)
  );

  if (!note) return;

  closeNoteModal();

  openNoteEditor(note);
};

/* =========================
   DELETE NOTE
========================= */

window.deleteNote = async function(noteId) {

  const confirmed =
    confirm("Are you sure you want to delete this note?");

  if (!confirmed) return;

  const { error } = await supabaseClient
    .from("notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", currentUser.id);

  if (error) {

    alert(
      "Could not delete note:\n\n" +
      error.message
    );

    return;
  }

  closeNoteModal();

  await loadNotes();

  renderCurrentView();
};

/* =========================
   HELPERS
========================= */

function option(value, selected) {

  return `
    <option
      value="${escapeAttribute(value)}"
      ${selected === value ? "selected" : ""}
    >
      ${escapeHtml(value)}
    </option>
  `;
}

function escapeHtml(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function formatNoteContent(content) {

  if (!content) {
    return "<p>No content.</p>";
  }

  return String(content)
    .split("\n")
    .map(line => `<p>${escapeHtml(line)}</p>`)
    .join("");
}
```
