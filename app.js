const SUPABASE_URL = "https://uvshnvndkvplhwalopid.supabase.co";
const SUPABASE_KEY = "sb_publishable_HFFGKwhEbvajsYdoHN_AHQ_qsns3gUy";

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
  setupSearch();
  setupGlobalButtons();
  setupNavigation();

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
  const loginScreen = document.getElementById("loginScreen");
  const appShell = document.getElementById("appShell");
  
  loginScreen.classList.remove("hidden");
  appShell.classList.add("hidden");

  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");

  // Clear any previous error messages
  loginMessage.textContent = "";

  loginForm.addEventListener("submit", handleLoginSubmit, { once: true });
}

async function handleLoginSubmit(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const loginMessage = document.getElementById("loginMessage");

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    loginMessage.textContent = error.message;
    loginMessage.style.color = "red";
    
    // Re-attach listener for next attempt
    document.getElementById("loginForm").addEventListener("submit", handleLoginSubmit, { once: true });
  }
}

/* =========================
   APP LOADING
========================= */

async function loadApp() {
  await loadNotes();
  showApp();
  renderCurrentView();
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

function showApp() {
  const loginScreen = document.getElementById("loginScreen");
  const appShell = document.getElementById("appShell");
  
  loginScreen.classList.add("hidden");
  appShell.classList.remove("hidden");
}

/* =========================
   NAVIGATION
========================= */

function setupNavigation() {
  const navButtons = document.querySelectorAll("[data-section]");

  navButtons.forEach(button => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      navButtons.forEach(b => b.classList.remove("active"));
      
      // Add active class to clicked button
      button.classList.add("active");

      currentView = button.dataset.section;
      renderCurrentView();
    });
  });
}

function renderCurrentView() {
  const content = document.getElementById("content");

  if (!content) return;

  switch (currentView) {
    case "home":
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
        <button id="emptyNewNote" onclick="openNoteEditor()">Create your first note</button>
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
      <h1>${escapeHtml(area)}</h1>
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

  const input = document.getElementById("search");

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

  const modalContent = document.getElementById("modalContent");
  const modal = document.getElementById("modal");

  modalContent.innerHTML = `

    <div class="note-details">

      <h2>${escapeHtml(note.title || "Untitled")}</h2>

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
  `;

  modal.classList.remove("hidden");
};

window.closeNoteModal = function() {
  const modal = document.getElementById("modal");
  modal.classList.add("hidden");
  currentNote = null;
};

/* =========================
   NEW NOTE
========================= */

function setupGlobalButtons() {

  const newButton = document.getElementById("newNoteButton");

  if (newButton) {
    newButton.onclick = () => openNoteEditor();
  }

  const logoutButton = document.getElementById("logoutBtn");

  if (logoutButton) {
    logoutButton.onclick = async () => {
      await supabaseClient.auth.signOut();
    };
  }

  const modalClose = document.getElementById("modalClose");
  if (modalClose) {
    modalClose.onclick = closeNoteModal;
  }
}

window.openNoteEditor = function(note = null) {

  const modalContent = document.getElementById("modalContent");
  const modal = document.getElementById("modal");

  const isEditing = !!note;

  modalContent.innerHTML = `

    <div class="editor-form">

      <h2>
        ${isEditing ? "Edit Note" : "New Note"}
      </h2>

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
  `;

  modal.classList.remove("hidden");

  document
    .getElementById("noteForm")
    .addEventListener("submit", async (e) => {

      e.preventDefault();

      await saveNote(note?.id || null);

    });
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

  closeNoteModal();

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
