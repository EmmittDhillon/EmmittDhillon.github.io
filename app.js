const SUPABASE_URL = "https://uvshnvndkvplhwalopid.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_HFFGKwhEbvajsYdoHN_AHQ_qsns3gUy";

const client = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

let currentUser = null;
let currentSection = "home";
let notesCache = [];


/* =========================
   SUPABASE / NOTES
========================= */

async function loadNotes() {

  const { data, error } = await client
    .from("notes")
    .select("*")
    .order("updated_at", {
      ascending: false
    });

  if (error) {
    console.error(error);
    return;
  }

  notesCache = data || [];
}


/* =========================
   HTML HELPERS
========================= */

function escapeHtml(value) {

  return String(value ?? "").replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]
  );
}


function stat(number, label) {

  return `
    <div class="card stat">
      <div class="num">${number}</div>
      <div class="label">${label}</div>
    </div>
  `;
}


function noteListItem(note) {

  return `
    <div
      class="list-item"
      onclick="openNote('${note.id}')"
    >

      <div>

        <strong>
          ${escapeHtml(note.title)}
        </strong>

        <small>
          ${escapeHtml(note.section || "Knowledge")}
        </small>

      </div>

      <span class="tag blue">
        ${escapeHtml(note.note_type || "Note")}
      </span>

    </div>
  `;
}


function openModal(html) {

  document.getElementById("modalContent").innerHTML = html;

  document
    .getElementById("modal")
    .classList.remove("hidden");
}


/* =========================
   DASHBOARD
========================= */

function renderHome() {

  return `

    <div class="feature">

      <div class="eyebrow">
        PERSONAL KNOWLEDGE OS
      </div>

      <h1>
        Build knowledge that compounds.
      </h1>

      <p>
        Your command center for medicine, finance,
        career, projects and life.
        Capture ideas, connect concepts and turn
        what you learn into reusable assets.
      </p>

      <button
        class="btn"
        onclick="newNote()"
      >
        ＋ Add something
      </button>

    </div>


    <div class="grid grid-4">

      ${stat(
        notesCache.length,
        "Saved notes"
      )}

      ${stat(
        "5",
        "Active projects"
      )}

      ${stat(
        notesCache.filter(
          note => note.note_type === "Clinical Pearl"
        ).length,
        "Clinical pearls"
      )}

      ${stat(
        notesCache.filter(
          note => note.section === "Inbox"
        ).length,
        "Inbox"
      )}

    </div>


    <div class="section-title">

      <div>

        <h2>
          Your knowledge domains
        </h2>

        <span class="sub">
          Everything has a home,
          but links connect the whole system.
        </span>

      </div>

    </div>


    <div class="grid grid-3">

      ${domain(
        "✚",
        "Medicine",
        "Clinical knowledge and your outpatient reference.",
        "medicine"
      )}

      ${domain(
        "$",
        "Finance",
        "Personal finance, investing and real estate.",
        "finance"
      )}

      ${domain(
        "↗",
        "Career",
        "Your professional life and direction.",
        "career"
      )}

      ${domain(
        "◆",
        "Projects",
        "Ideas turned into tangible outcomes.",
        "projects"
      )}

      ${domain(
        "◇",
        "Knowledge",
        "Concepts, mental models and lessons.",
        "knowledge"
      )}

      ${domain(
        "○",
        "Life",
        "Travel, hobbies and personal development.",
        "life"
      )}

    </div>


    <div class="section-title">

      <div>

        <h2>
          Recently added
        </h2>

      </div>

      <a onclick="showAllNotes()">
        View all →
      </a>

    </div>


    <div class="card list">

      ${
        notesCache
          .slice(0, 8)
          .map(noteListItem)
          .join("")
        ||
        `
          <div class="sub">
            No notes yet.
            Create your first one.
          </div>
        `
      }

    </div>

  `;
}


function domain(icon, title, description, section) {

  return `

    <div
      class="card clickable"
      onclick="navigate('${section}')"
    >

      <div class="card-icon">
        ${icon}
      </div>

      <div class="card-title">
        ${title}
      </div>

      <div class="card-desc">
        ${description}
      </div>

    </div>

  `;
}


/* =========================
   CATEGORY PAGES
========================= */

const categoryCards = {

  Medicine: [

    [
      "✚",
      "Outpatient IM",
      "Clinical knowledge for common complaints and chronic disease.",
      "Clinical"
    ],

    [
      "♥",
      "Cardiology",
      "HTN, HLD, CAD, HF, AF and HCM.",
      "Specialty"
    ],

    [
      "◉",
      "Endocrinology",
      "Diabetes, thyroid disease and metabolic disorders.",
      "Specialty"
    ],

    [
      "◌",
      "Pulmonary",
      "Asthma, COPD, OSA and chronic cough.",
      "Specialty"
    ],

    [
      "▣",
      "GI",
      "GERD, IBS, liver disease and screening.",
      "Specialty"
    ],

    [
      "⌁",
      "Nephrology",
      "CKD, AKI and electrolyte disorders.",
      "Specialty"
    ],

    [
      "+",
      "Preventive Care",
      "Cancer screening, vaccines and prevention.",
      "Reference"
    ],

    [
      "✦",
      "Clinical Pearls",
      "Short lessons worth remembering.",
      "High-yield"
    ]

  ],


  Finance: [

    [
      "$",
      "Personal Finance",
      "Budgeting, insurance and financial organization.",
      "Foundation"
    ],

    [
      "◈",
      "Investing",
      "Asset allocation, equities and ETFs.",
      "Wealth"
    ],

    [
      "⌂",
      "Real Estate",
      "Deal analysis, financing and development.",
      "Wealth"
    ],

    [
      "%",
      "Taxes",
      "Tax planning and retirement accounts.",
      "Planning"
    ],

    [
      "∞",
      "Retirement",
      "401(k), IRA, HSA and long-term planning.",
      "Planning"
    ]

  ],


  Career: [

    [
      "★",
      "Current Job",
      "Onboarding, workflow and clinical efficiency.",
      "Now"
    ],

    [
      "◎",
      "Career Goals",
      "1-, 3-, 5- and 10-year direction.",
      "Planning"
    ],

    [
      "§",
      "Contracts",
      "Compensation, benefits and negotiation.",
      "Reference"
    ],

    [
      "↔",
      "Negotiation",
      "Principles and preparation.",
      "Skill"
    ],

    [
      "◇",
      "Leadership",
      "Communication and organizational thinking.",
      "Skill"
    ]

  ],


  Knowledge: [

    [
      "◇",
      "Concepts",
      "Durable explanations worth understanding.",
      "Core"
    ],

    [
      "◎",
      "Mental Models",
      "Frameworks that improve decisions.",
      "Thinking"
    ],

    [
      "✦",
      "Lessons",
      "What experience has taught you.",
      "Experience"
    ],

    [
      "?",
      "Questions",
      "Things you want to investigate.",
      "Curiosity"
    ],

    [
      "⌁",
      "Ideas",
      "Interesting possibilities.",
      "Creation"
    ]

  ],


  Life: [

    [
      "⌂",
      "Travel",
      "Trips and future destinations.",
      "Life"
    ],

    [
      "♨",
      "Cooking",
      "Recipes and techniques.",
      "Life"
    ],

    [
      "○",
      "Personal Development",
      "Reflection and growth.",
      "Growth"
    ],

    [
      "◆",
      "Hobbies",
      "Interests and things to improve.",
      "Life"
    ]

  ]

};


function renderCategory(name) {

  const savedNotes =
    notesCache.filter(
      note => note.section === name
    );

  const cards =
    categoryCards[name] || [];


  return `

    <div class="header-row">

      <div>

        <div class="eyebrow">
          ${name}
        </div>

        <h1>
          ${name}
        </h1>

        <div class="sub">
          Build a collection that becomes
          more valuable every time you use it.
        </div>

      </div>


      <button
        class="btn primary"
        onclick="newNote('${name}')"
      >
        ＋ New note
      </button>

    </div>


    <div class="grid grid-3">

      ${cards.map(card => `

        <div
          class="card clickable"
          onclick="newNote('${name}')"
        >

          <div class="card-icon">
            ${card[0]}
          </div>

          <div class="card-title">
            ${card[1]}
          </div>

          <div class="card-desc">
            ${card[2]}
          </div>

          <div style="margin-top:14px">
            <span class="tag">
              ${card[3]}
            </span>
          </div>

        </div>

      `).join("")}

    </div>


    <div class="section-title">

      <div>

        <h2>
          Your ${name} notes
        </h2>

        <span class="sub">
          ${savedNotes.length} saved
        </span>

      </div>

    </div>


    <div class="card list">

      ${
        savedNotes
          .map(noteListItem)
          .join("")
        ||
        `
          <div class="sub">
            Nothing saved here yet.
            Start building this section.
          </div>
        `
      }

    </div>

  `;
}


/* =========================
   OTHER SECTIONS
========================= */

function renderProjects() {

  return `

    <div class="header-row">

      <div>

        <div class="eyebrow">
          PROJECTS
        </div>

        <h1>
          Make things.
        </h1>

        <div class="sub">
          Knowledge becomes valuable
          when it changes what you do.
        </div>

      </div>

      <button
        class="btn primary"
        onclick="alert('Project tracking will be the next database upgrade.')"
      >
        ＋ New project
      </button>

    </div>


    <div class="grid grid-2">

      ${project(
        "Outpatient IM Knowledge Base",
        68
      )}

      ${project(
        "Personal Financial Plan",
        42
      )}

      ${project(
        "AI Physician Workflow",
        25
      )}

      ${project(
        "Real Estate Research",
        18
      )}

    </div>

  `;
}


function project(name, progress) {

  return `

    <div class="card">

      <div class="card-title">
        ${name}
      </div>

      <div class="progress">

        <span
          style="width:${progress}%"
        ></span>

      </div>

      <div
        style="
          margin-top:10px;
          color:var(--muted);
          font-size:12px;
        "
      >
        ${progress}% complete
      </div>

    </div>

  `;
}


function renderInbox() {

  const notes =
    notesCache.filter(
      note => note.section === "Inbox"
    );


  return `

    <div class="header-row">

      <div>

        <div class="eyebrow">
          INBOX
        </div>

        <h1>
          Capture first.
        </h1>

        <div class="sub">
          Don't interrupt your thinking
          just to organize it.
        </div>

      </div>

      <button
        class="btn primary"
        onclick="newNote('Inbox')"
      >
        ＋ Capture
      </button>

    </div>


    <div class="card list">

      ${
        notes.map(noteListItem).join("")
        ||
        `
          <div class="sub">
            Your inbox is empty.
          </div>
        `
      }

    </div>

  `;
}


function renderResources() {

  const notes =
    notesCache.filter(
      note => note.section === "Resources"
    );


  return `

    <div class="header-row">

      <div>

        <div class="eyebrow">
          RESOURCES
        </div>

        <h1>
          Useful, not hoarded.
        </h1>

        <div class="sub">
          Save resources because they support
          a question, project or concept.
        </div>

      </div>

      <button
        class="btn primary"
        onclick="newNote('Resources')"
      >
        ＋ Add resource
      </button>

    </div>


    <div class="card list">

      ${
        notes.map(noteListItem).join("")
        ||
        `
          <div class="sub">
            Add your first resource.
          </div>
        `
      }

    </div>

  `;
}


function renderSettings() {

  return `

    <div class="header-row">

      <div>

        <div class="eyebrow">
          SETTINGS
        </div>

        <h1>
          Your system.
        </h1>

        <div class="sub">
          Connected to Supabase.
        </div>

      </div>

    </div>


    <div class="card note-body">

      <h3>
        Account
      </h3>

      <p>
        ${escapeHtml(currentUser?.email)}
      </p>


      <h3>
        Current architecture
      </h3>

      <ul>

        <li>
          GitHub Pages hosts the website.
        </li>

        <li>
          Supabase stores your notes.
        </li>

        <li>
          Supabase Authentication protects access.
        </li>

        <li>
          Row Level Security protects database records.
        </li>

      </ul>


      <p>
        <b>Important:</b>
        Never store patient-identifiable information
        or PHI in this application.
      </p>

    </div>

  `;
}


/* =========================
   NAVIGATION
========================= */

function navigate(section) {

  currentSection = section;


  document
    .querySelectorAll(".nav-item")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.section === section
      );

    });


  let html;


  if (section === "home") {

    html = renderHome();

  } else if (section === "projects") {

    html = renderProjects();

  } else if (section === "inbox") {

    html = renderInbox();

  } else if (section === "resources") {

    html = renderResources();

  } else if (section === "settings") {

    html = renderSettings();

  } else {

    const name =
      section.charAt(0).toUpperCase()
      + section.slice(1);

    html = renderCategory(name);

  }


  document.getElementById(
    "content"
  ).innerHTML = html;
}


/* =========================
   CREATE NOTE
========================= */

function newNote(section = "") {

  openModal(`

    <div class="eyebrow">
      NEW NOTE
    </div>

    <h2>
      Capture knowledge
    </h2>


    <form
      id="noteForm"
      class="form"
    >

      <label>

        Title

        <input
          id="noteTitle"
          required
          placeholder="e.g. Hypertension treatment pearls"
        >

      </label>


      <label>

        Area

        <select id="noteArea">

          <option
            ${section === "Medicine" ? "selected" : ""}
          >
            Medicine
          </option>

          <option
            ${section === "Finance" ? "selected" : ""}
          >
            Finance
          </option>

          <option
            ${section === "Career" ? "selected" : ""}
          >
            Career
          </option>

          <option
            ${section === "Knowledge" ? "selected" : ""}
          >
            Knowledge
          </option>

          <option
            ${section === "Life" ? "selected" : ""}
          >
            Life
          </option>

          <option
            ${section === "Resources" ? "selected" : ""}
          >
            Resources
          </option>

          <option
            ${section === "Inbox" ? "selected" : ""}
          >
            Inbox
          </option>

        </select>

      </label>


      <label>

        Type

        <select id="noteType">

          <option>
            Note
          </option>

          <option>
            Clinical Pearl
          </option>

          <option>
            Concept
          </option>

          <option>
            Framework
          </option>

          <option>
            Idea
          </option>

          <option>
            Question
          </option>

        </select>

      </label>


      <label>

        Tags

        <input
          id="noteTags"
          placeholder="comma, separated, tags"
        >

      </label>


      <label>

        Content

        <textarea
          id="noteContent"
          required
          placeholder="What do you want future-you to remember?"
        ></textarea>

      </label>


      <button
        class="btn primary"
        type="submit"
      >
        Save note
      </button>


      <div
        id="saveMessage"
        class="login-message"
      ></div>

    </form>

  `);


  document
    .getElementById("noteForm")
    .onsubmit = async event => {

      event.preventDefault();

      await saveNote();

    };

}


/* =========================
   SAVE NOTE
========================= */

async function saveNote() {

  const tags =
    document
      .getElementById("noteTags")
      .value
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean);


  const note = {

    title:
      document
        .getElementById("noteTitle")
        .value
        .trim(),

    content:
      document
        .getElementById("noteContent")
        .value,

    section:
      document
        .getElementById("noteArea")
        .value,

    note_type:
      document
        .getElementById("noteType")
        .value,

    tags,

    favorite: false,

    user_id:
      currentUser.id,

    updated_at:
      new Date().toISOString()

  };


  const { error } =
    await client
      .from("notes")
      .insert(note);


  if (error) {

    document
      .getElementById("saveMessage")
      .textContent = error.message;

    console.error(error);

    return;

  }


  await loadNotes();


  document
    .getElementById("modal")
    .classList.add("hidden");


  navigate(currentSection);

}


/* =========================
   OPEN NOTE
========================= */

function openNote(id) {

  const note =
    notesCache.find(
      item => item.id === id
    );


  if (!note) return;


  openModal(`

    <div class="eyebrow">

      ${escapeHtml(note.section)}
      ·
      ${escapeHtml(note.note_type || "Note")}

    </div>


    <h2>
      ${escapeHtml(note.title)}
    </h2>


    <div class="note-body">

      ${escapeHtml(note.content || "")
        .replace(/\n/g, "<br>")}

    </div>


    <div
      class="actions"
      style="margin-top:24px"
    >

      <button
        class="btn"
        onclick="editNote('${note.id}')"
      >
        Edit
      </button>


      <button
        class="btn"
        onclick="deleteNote('${note.id}')"
      >
        Delete
      </button>

    </div>

  `);

}


/* =========================
   EDIT NOTE
========================= */

function editNote(id) {

  const note =
    notesCache.find(
      item => item.id === id
    );


  if (!note) return;


  newNote(note.section);


  document.getElementById(
    "noteTitle"
  ).value = note.title;


  document.getElementById(
    "noteType"
  ).value = note.note_type || "Note";


  document.getElementById(
    "noteTags"
  ).value =
    (note.tags || []).join(", ");


  document.getElementById(
    "noteContent"
  ).value =
    note.content || "";


  document
    .getElementById("noteForm")
    .onsubmit = async event => {

      event.preventDefault();


      const updated = {

        title:
          document
            .getElementById("noteTitle")
            .value
            .trim(),

        content:
          document
            .getElementById("noteContent")
            .value,

        section:
          document
            .getElementById("noteArea")
            .value,

        note_type:
          document
            .getElementById("noteType")
            .value,

        tags:
          document
            .getElementById("noteTags")
            .value
            .split(",")
            .map(tag => tag.trim())
            .filter(Boolean),

        updated_at:
          new Date().toISOString()

      };


      const { error } =
        await client
          .from("notes")
          .update(updated)
          .eq("id", id);


      if (error) {

        document
          .getElementById("saveMessage")
          .textContent =
          error.message;

        return;

      }


      await loadNotes();


      document
        .getElementById("modal")
        .classList.add("hidden");


      navigate(currentSection);

    };

}


/* =========================
   DELETE NOTE
========================= */

async function deleteNote(id) {

  if (
    !confirm(
      "Are you sure you want to delete this note?"
    )
  ) {

    return;

  }


  const { error } =
    await client
      .from("notes")
      .delete()
      .eq("id", id);


  if (error) {

    alert(error.message);

    return;

  }


  await loadNotes();


  document
    .getElementById("modal")
    .classList.add("hidden");


  navigate(currentSection);

}


/* =========================
   SHOW ALL NOTES
========================= */

function showAllNotes(section) {

  const notes =
    section
      ? notesCache.filter(
          note => note.section === section
        )
      : notesCache;


  openModal(`

    <div class="eyebrow">
      NOTES
    </div>

    <h2>
      ${section || "All notes"}
    </h2>


    <div class="card list">

      ${
        notes
          .map(noteListItem)
          .join("")
        ||
        `
          <div class="sub">
            No notes yet.
          </div>
        `
      }

    </div>

  `);

}


/* =========================
   LOGIN
========================= */

async function login() {

  const email =
    document
      .getElementById("loginEmail")
      .value;


  const password =
    document
      .getElementById("loginPassword")
      .value;


  const { data, error } =
    await client.auth.signInWithPassword({
      email,
      password
    });


  if (error) {

    document
      .getElementById("loginMessage")
      .textContent =
      error.message;

    return;

  }


  currentUser = data.user;

  await showApp();

}


async function showApp() {

  document
    .getElementById("loginScreen")
    .classList.add("hidden");


  document
    .getElementById("appShell")
    .classList.remove("hidden");


  document
    .getElementById("avatar")
    .textContent =
    (currentUser.email || "E")
      .charAt(0)
      .toUpperCase();


  await loadNotes();


  navigate("home");

}


async function logout() {

  await client.auth.signOut();

  location.reload();

}


/* =========================
   EVENT LISTENERS
========================= */

document
  .getElementById("loginForm")
  .onsubmit = event => {

    event.preventDefault();

    login();

  };


document
  .getElementById("logoutBtn")
  .onclick = logout;


document
  .getElementById("nav")
  .onclick = event => {

    const button =
      event.target.closest(".nav-item");


    if (
      button &&
      button.dataset.section
    ) {

      navigate(
        button.dataset.section
      );

    }

  };


document
  .getElementById("modalClose")
  .onclick = () => {

    document
      .getElementById("modal")
      .classList.add("hidden");

  };


document
  .getElementById("modal")
  .onclick = event => {

    if (
      event.target.id === "modal"
    ) {

      event.currentTarget
        .classList
        .add("hidden");

    }

  };


document
  .getElementById("themeBtn")
  .onclick = () => {

    document.body.classList.toggle(
      "dark"
    );

  };


document
  .getElementById("mobileMenu")
  .onclick = () => {

    document
      .querySelector(".sidebar")
      .classList.toggle("open");

  };


/* Keyboard shortcut */

document.addEventListener(
  "keydown",
  event => {

    if (
      (event.metaKey || event.ctrlKey) &&
      event.key.toLowerCase() === "k"
    ) {

      event.preventDefault();

      document
        .getElementById("search")
        .focus();

    }

  }
);


/* Search */

document
  .getElementById("search")
  .oninput = event => {

    const query =
      event.target.value
        .toLowerCase()
        .trim();


    if (!query) {

      navigate(currentSection);

      return;

    }


    const results =
      notesCache.filter(note => {

        const searchable = `

          ${note.title}

          ${note.content}

          ${(note.tags || []).join(" ")}

        `.toLowerCase();


        return searchable.includes(query);

      });


    document
      .getElementById("content")
      .innerHTML = `

        <div class="header-row">

          <div>

            <div class="eyebrow">
              SEARCH
            </div>

            <h1>
              Results
            </h1>

            <div class="sub">
              ${results.length}
              matching notes
            </div>

          </div>

        </div>


        <div class="card list">

          ${
            results
              .map(noteListItem)
              .join("")
            ||
            `
              <div class="sub">
                No matching notes.
              </div>
            `
          }

        </div>

      `;

  };


/* =========================
   START APPLICATION
========================= */

(async function initialize() {

  const {
    data: {
      session
    }
  } =
    await client.auth.getSession();


  if (session) {

    currentUser = session.user;

    await showApp();

  }

})();
