const SUPABASE_URL = "https://uvshnvndkvplhwalopid.supabase.co";
const SUPABASE_KEY = "sb_publishable_HFFGKwhEbvajsYdoHN_AHQ_qsns3gUy";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let currentUser = null;
let notes = [];
let currentNote = null;

/* =========================
   INITIALIZATION
========================= */

document.addEventListener("DOMContentLoaded", async () => {
  // Set up login form handler
  setupLoginForm();
  
  // Check if user is already logged in
  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {
    currentUser = data.session.user;
    showApp();
    await loadApp();
  } else {
    showLoginPage();
  }

  // Listen for auth state changes
  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    if (session) {
      currentUser = session.user;
      showApp();
      await loadApp();
    } else {
      currentUser = null;
      showLoginPage();
    }
  });
});

/* =========================
   AUTH - LOGIN FORM SETUP
========================= */

function setupLoginForm() {
  const loginForm = document.getElementById("loginForm");
  
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const messageEl = document.getElementById("loginMessage");

    if (!email || !password) {
      messageEl.textContent = "Please enter both email and password.";
      messageEl.classList.add("error");
      return;
    }

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        messageEl.textContent = error.message;
        messageEl.classList.add("error");
      } else {
        messageEl.textContent = "Signing in...";
        messageEl.classList.remove("error");
      }
    } catch (err) {
      messageEl.textContent = "An error occurred. Please try again.";
      messageEl.classList.add("error");
      console.error(err);
    }
  });
}

/* =========================
   SHOW/HIDE PAGES
========================= */

function showLoginPage() {
  document.getElementById("loginScreen").classList.remove("hidden");
  document.getElementById("appShell").classList.add("hidden");
}

function showApp() {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("appShell").classList.remove("hidden");
}

/* =========================
   APP LOADING
========================= */

async function loadApp() {
  await loadNotes();
  setupNavigation();
  setupLogout();
  setupSearch();
  renderContent("home");
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
   NAVIGATION
========================= */

function setupNavigation() {
  const navButtons = document.querySelectorAll("[data-section]");
  
  navButtons.forEach(button => {
    button.addEventListener("click", () => {
      navButtons.forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      renderContent(button.dataset.section);
    });
  });
}

function renderContent(section) {
  const contentEl = document.getElementById("content");
  
  switch(section) {
    case "home":
      renderDashboard(contentEl);
      break;
    case "inbox":
      renderInbox(contentEl);
      break;
    case "medicine":
      renderNotesByArea(contentEl, "Medicine");
      break;
    case "finance":
      renderNotesByArea(contentEl, "Finance");
      break;
    case "career":
      renderNotesByArea(contentEl, "Career");
      break;
    case "projects":
      renderNotesByArea(contentEl, "Projects");
      break;
    case "knowledge":
      renderNotesByArea(contentEl, "Knowledge");
      break;
    case "life":
      renderNotesByArea(contentEl, "Life");
      break;
    case "resources":
      renderNotesByArea(contentEl, "Resources");
      break;
    case "settings":
      renderSettings(contentEl);
      break;
    default:
      renderDashboard(contentEl);
  }
}

/* =========================
   DASHBOARD
========================= */

function renderDashboard(contentEl) {
  const favorites = notes.filter(n => n.favorite);
  const inbox = notes.filter(n => n.status === "Inbox");

  contentEl.innerHTML = `
    <div class="page-header">
      <h1>Dashboard</h1>
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

    ${renderNoteCards(notes.slice(0, 10))}
  `;
}

/* =========================
   NOTE CARDS
========================= */

function renderNoteCards(noteList) {
  if (!noteList.length) {
    return `<div class="empty-state"><p>No notes yet.</p></div>`;
  }

  return `
    <div class="notes-grid">
      ${noteList.map(note => `
        <div class="note-card" data-note-id="${note.id}">
          <h3>${escapeHtml(note.title || "Untitled")}</h3>
          ${note.summary ? `<p>${escapeHtml(note.summary)}</p>` : ""}
          <div class="note-meta">
            ${note.area ? `<span>${escapeHtml(note.area)}</span>` : ""}
            ${note.type ? `<span>${escapeHtml(note.type)}</span>` : ""}
            ${note.status ? `<span>${escapeHtml(note.status)}</span>` : ""}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

/* =========================
   AREA VIEWS
========================= */

function renderNotesByArea(contentEl, area) {
  const filtered = notes.filter(note => note.area === area);
  
  contentEl.innerHTML = `
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

function renderInbox(contentEl) {
  const inboxNotes = notes.filter(note => note.status === "Inbox");
  
  contentEl.innerHTML = `
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

function renderResources(contentEl) {
  const resources = notes.filter(note => note.type === "Resource");
  
  contentEl.innerHTML = `
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

function renderSettings(contentEl) {
  contentEl.innerHTML = `
    <div class="page-header">
      <h1>Settings</h1>
    </div>
    <div class="settings-card">
      <p>Logged in as: <strong>${escapeHtml(currentUser.email)}</strong></p>
    </div>
  `;
}

/* =========================
   LOGOUT
========================= */

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabaseClient.auth.signOut();
    });
  }
}

/* =========================
   SEARCH
========================= */

function setupSearch() {
  const searchInput = document.getElementById("search");
  
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) {
      renderContent("home");
      return;
    }

    performSearch(query);
  });
}

function performSearch(query) {
  const contentEl = document.getElementById("content");
  
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
      Array.isArray(note.tags) ? note.tags.join(" ") : note.tags
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });

  contentEl.innerHTML = `
    <div class="page-header">
      <h1>Search Results</h1>
      <p>${results.length} ${results.length === 1 ? "result" : "results"}</p>
    </div>
    ${renderNoteCards(results)}
  `;
}

/* =========================
   HELPERS
========================= */

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
