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
let editingNoteId = null;


/* =========================================================
   DATABASE
========================================================= */

async function loadNotes() {

  const { data, error } = await client
    .from("notes")
    .select("*")
    .order("updated_at", {
      ascending: false
    });

  if (error) {
    console.error("Error loading notes:", error);
    return;
  }

  notesCache = data || [];
}


/* =========================================================
   HELPERS
========================================================= */

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


function formatDate(date) {

  if (!date) return "";

  return new Date(date).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  );
}


function stat(number, label) {

  return `
    <div class="card stat">

      <div class="num">
        ${number}
      </div>

      <div class="label">
        ${label}
      </div>

    </div>
  `;
}


function getSectionColor(section) {

  const colors = {

    Medicine: "blue",
    Finance: "green",
    Career: "purple",
    Projects: "orange",
    Knowledge: "pink",
    Life: "teal",
    Inbox: "yellow",
    Resources: "gray"

  };

  return colors[section] || "blue";
}


/* =========================================================
   NOTE LIST ITEM
========================================================= */

function noteListItem(note) {

  const favorite =
    note.favorite
      ? "★"
      : "☆";


  return `

    <div
      class="list-item note-list-item"
      onclick="openNote('${note.id}')"
    >

      <div class="note-list-main">

        <div class="note-title-row">

          <strong>
            ${escapeHtml(note.title)}
          </strong>

          <button
            class="favorite-btn"
            onclick="
              event.stopPropagation();
              toggleFavorite('${note.id}');
            "
          >
            ${favorite}
          </button>

        </div>


        ${
          note.summary
            ? `
              <div class="note-summary">
                ${escapeHtml(note.summary)}
              </div>
            `
            : ""
        }


        <div class="note-meta">

          <span
            class="tag ${getSectionColor(note.section)}"
          >
            ${escapeHtml(note.section || "Knowledge")}
          </span>

          <span class="tag">
            ${escapeHtml(note.note_type || "Note")}
          </span>

          ${
            note.status
              ? `
                <span class="tag">
                  ${escapeHtml(note.status)}
                </span>
              `
              : ""
          }

        </div>

      </div>


      <div class="note-date">

        ${formatDate(note.updated_at)}

      </div>

    </div>

  `;
}


/* =========================================================
   MODAL
========================================================= */

function openModal(html) {

  document
    .getElementById("modalContent")
    .innerHTML = html;

  document
    .getElementById("modal")
    .classList
    .remove("hidden");
}


function closeModal() {

  document
    .getElementById("modal")
    .classList
    .add("hidden");

  editingNoteId = null;
}


/* =========================================================
   DASHBOARD
========================================================= */

function renderHome() {

  const favorites =
    notesCache.filter(
      note => note.favorite
    );


  const inbox =
    notesCache.filter(
      note =>
        note.section === "Inbox" ||
        note.status === "Inbox"
    );


  const clinical =
    notesCache.filter(
      note =>
        note.note_type === "Clinical Pearl"
    );


  return `

    <div class="feature">

      <div class="eyebrow">
        PERSONAL KNOWLEDGE OS
      </div>

      <h1>
        Build knowledge that compounds.
      </h1>

      <p>
        Capture ideas, organize what you learn,
        and build a personal reference system
        that becomes more valuable over time.
      </p>

      <div class="actions">

        <button
          class="btn primary"
          onclick="newNote()"
        >
          ＋ New note
        </button>

        <button
          class="btn"
          onclick="quickCapture()"
        >
          ⚡ Quick capture
        </button>

      </div>

    </div>


    <div class="grid grid-4">

      ${stat(
        notesCache.length,
        "Saved notes"
      )}

      ${stat(
        favorites.length,
        "Favorites"
      )}

      ${stat(
        clinical.length,
        "Clinical pearls"
      )}

      ${stat(
        inbox.length,
        "Inbox"
      )}

    </div>


    <div class="section-title">

      <div>

        <h2>
          Your knowledge domains
        </h2>

        <span class="sub">
          Organize knowledge by where it becomes useful.
        </span>

      </div>

    </div>


    <div class="grid grid-3">

      ${domain(
        "✚",
        "Medicine",
        "Clinical knowledge and outpatient reference.",
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
        "Your professional development and direction.",
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
          ⭐ Favorite knowledge
        </h2>

      </div>

      <a onclick="showFavorites()">
        View all →
      </a>

    </div>


    <div class="card list">

      ${
        favorites
          .slice(0, 5)
          .map(noteListItem)
          .join("")
        ||
        `
          <div class="sub">
            You haven't favorited any notes yet.
          </div>
        `
      }

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


/* =========================================================
   DOMAINS
========================================================= */

function domain(
  icon,
  title,
  description,
  section
) {

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


/* =========================================================
   CATEGORY DATA
========================================================= */

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


/* =========================================================
   CATEGORY PAGE
========================================================= */

function renderCategory(name) {

  const savedNotes =
    notesCache.filter(
      note => note.section === name
    );


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

      ${
        (categoryCards[name] || [])
          .map(card => `

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

          `)
          .join("")
      }

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


/* =========================================================
   PROJECTS
========================================================= */

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


/* =========================================================
   INBOX
========================================================= */

function renderInbox() {

  const notes =
    notesCache.filter(
      note =>
        note.section === "Inbox" ||
        note.status === "Inbox"
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
        onclick="quickCapture()"
      >
        ⚡ Quick capture
      </button>

    </div>


    <div class="card list">

      ${
        notes
          .map(noteListItem)
          .join("")
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


/* =========================================================
   RESOURCES
========================================================= */

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
        notes
          .map(noteListItem)
          .join("")
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


/* =========================================================
   SETTINGS
========================================================= */

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
          Row Level Security protects your data.
        </li>

      </ul>


      <h3>
        Knowledge philosophy
      </h3>

      <p>
        Capture → Organize → Connect → Review → Apply.
      </p>


      <p>
        <b>Medical privacy:</b>
        Never store patient-identifiable information
        or PHI in this application.
      </p>

    </div>

  `;
}


/* =========================================================
   NAVIGATION
========================================================= */

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


  document
    .getElementById("content")
    .innerHTML = html;

}


/* =========================================================
   NOTE EDITOR
========================================================= */

function newNote(section = "") {

  editingNoteId = null;


  openNoteEditor(
    null,
    section
  );

}


function openNoteEditor(note = null, section = "") {

  const isEditing = !!note;


  const selectedSection =
    note?.section ||
    section ||
    "Medicine";


  const selectedType =
    note?.note_type ||
    "Note";


  const selectedStatus =
    note?.status ||
    "Active";


  const tags =
    note?.tags || [];


  openModal(`

    <div class="eyebrow">

      ${isEditing ? "EDIT NOTE" : "NEW NOTE"}

    </div>


    <h2>

      ${
        isEditing
          ? "Update knowledge"
          : "Capture knowledge"
      }

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
          value="${escapeHtml(note?.title || "")}"
          placeholder="What is this about?"
        >

      </label>


      <label>

        One-sentence summary

        <input
          id="noteSummary"
          value="${escapeHtml(note?.summary || "")}"
          placeholder="What should future-you remember?"
        >

      </label>


      <div class="form-grid">

        <label>

          Area

          <select id="noteArea">

            ${[
              "Medicine",
              "Finance",
              "Career",
              "Knowledge",
              "Life",
              "Projects",
              "Resources",
              "Inbox"
            ]
              .map(
                item => `
                  <option
                    ${
                      selectedSection === item
                        ? "selected"
                        : ""
                    }
                  >
                    ${item}
                  </option>
                `
              )
              .join("")}

          </select>

        </label>


        <label>

          Type

          <select id="noteType">

            ${[
              "Note",
              "Clinical Pearl",
              "Concept",
              "Framework",
              "Idea",
              "Question",
              "Algorithm",
              "Reference"
            ]
              .map(
                item => `
                  <option
                    ${
                      selectedType === item
                        ? "selected"
                        : ""
                    }
                  >
                    ${item}
                  </option>
                `
              )
              .join("")}

          </select>

        </label>

      </div>


      <div class="form-grid">

        <label>

          Status

          <select id="noteStatus">

            ${[
              "Active",
              "Inbox",
              "Review",
              "Archived"
            ]
              .map(
                item => `
                  <option
                    ${
                      selectedStatus === item
                        ? "selected"
                        : ""
                    }
                  >
                    ${item}
                  </option>
                `
              )
              .join("")}

          </select>

        </label>


        <label>

          Review date

          <input
            id="noteReviewDate"
            type="date"
            value="${note?.review_date || ""}"
          >

        </label>

      </div>


      <label>

        Tags

        <input
          id="noteTags"
          value="${escapeHtml(tags.join(", "))}"
          placeholder="hypertension, cardiology, outpatient"
        >

      </label>


      <label>

        Content

        <textarea
          id="noteContent"
          required
          placeholder="Write the actual knowledge here..."
        >${escapeHtml(note?.content || "")}</textarea>

      </label>


      <div class="form-grid">

        <label>

          Source

          <input
            id="noteSource"
            value="${escapeHtml(note?.source || "")}"
            placeholder="ACC guideline, book, lecture..."
          >

        </label>


        <label>

          Source URL

          <input
            id="noteUrl"
            type="url"
            value="${escapeHtml(note?.url || "")}"
            placeholder="https://..."
          >

        </label>

      </div>


      <label class="checkbox-row">

        <input
          id="noteFavorite"
          type="checkbox"
          ${note?.favorite ? "checked" : ""}
        >

        <span>
          ⭐ Add to favorites
        </span>

      </label>


      <button
        class="btn primary"
        type="submit"
      >

        ${
          isEditing
            ? "Save changes"
            : "Save note"
        }

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


/* =========================================================
   SAVE NOTE
========================================================= */

async function saveNote() {

  const tags =
    document
      .getElementById("noteTags")
      .value
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean);


  const noteData = {

    title:
      document
        .getElementById("noteTitle")
        .value
        .trim(),

    summary:
      document
        .getElementById("noteSummary")
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

    status:
      document
        .getElementById("noteStatus")
        .value,

    tags,

    source:
      document
        .getElementById("noteSource")
        .value
        .trim(),

    url:
      document
        .getElementById("noteUrl")
        .value
        .trim(),

    favorite:
      document
        .getElementById("noteFavorite")
        .checked,

    review_date:
      document
        .getElementById("noteReviewDate")
        .value || null,

    updated_at:
      new Date().toISOString()

  };


  let response;


  if (editingNoteId) {

    response =
      await client
        .from("notes")
        .update(noteData)
        .eq("id", editingNoteId);

  } else {

    response =
      await client
        .from("notes")
        .insert({
          ...noteData,
          user_id: currentUser.id
        });

  }


  if (response.error) {

    document
      .getElementById("saveMessage")
      .textContent =
      response.error.message;

    console.error(response.error);

    return;

  }


  await loadNotes();


  closeModal();


  navigate(currentSection);

}


/* =========================================================
   EDIT
========================================================= */

function editNote(id) {

  const note =
    notesCache.find(
      item => item.id === id
    );


  if (!note) return;


  editingNoteId = id;

  openNoteEditor(note);

}


/* =========================================================
   FAVORITES
========================================================= */

async function toggleFavorite(id) {

  const note =
    notesCache.find(
      item => item.id === id
    );


  if (!note) return;


  const { error } =
    await client
      .from("notes")
      .update({
        favorite: !note.favorite,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);


  if (error) {

    console.error(error);

    return;

  }


  await loadNotes();


  navigate(currentSection);

}


/* =========================================================
   DELETE
========================================================= */

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

  closeModal();

  navigate(currentSection);

}


/* =========================================================
   VIEW NOTE
========================================================= */

function openNote(id) {

  const note =
    notesCache.find(
      item => item.id === id
    );


  if (!note) return;


  const tags =
    (note.tags || [])
      .map(
        tag => `
          <span class="tag">
            ${escapeHtml(tag)}
          </span>
        `
      )
      .join("");


  openModal(`

    <div class="note-header">

      <div>

        <div class="eyebrow">

          ${escapeHtml(note.section || "")}
          ·
          ${escapeHtml(note.note_type || "Note")}

        </div>


        <h2>
          ${escapeHtml(note.title)}
        </h2>

      </div>


      <button
        class="favorite-large"
        onclick="toggleFavoriteFromModal('${note.id}')"
      >

        ${
          note.favorite
            ? "★"
            : "☆"
        }

      </button>

    </div>


    ${
      note.summary
        ? `
          <div class="note-summary-large">

            ${escapeHtml(note.summary)}

          </div>
        `
        : ""
    }


    <div class="note-meta">

      ${
        note.status
          ? `
            <span class="tag">
              ${escapeHtml(note.status)}
            </span>
          `
          : ""
      }

      ${tags}

    </div>


    <div class="note-body">

      ${escapeHtml(note.content || "")
        .replace(/\n/g, "<br>")}

    </div>


    ${
      note.source || note.url
        ? `

          <div class="source-box">

            <strong>
              Source
            </strong>

            ${
              note.source
                ? `
                  <div>
                    ${escapeHtml(note.source)}
                  </div>
                `
                : ""
            }

            ${
              note.url
                ? `
                  <a
                    href="${escapeHtml(note.url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open source →
                  </a>
                `
                : ""
            }

          </div>

        `
        : ""
    }


    ${
      note.review_date
        ? `
          <div class="review-box">

            📅 Review on
            <strong>
              ${formatDate(note.review_date)}
            </strong>

          </div>
        `
        : ""
    }


    <div class="actions">

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


async function toggleFavoriteFromModal(id) {

  closeModal();

  await toggleFavorite(id);

}


/* =========================================================
   FAVORITES VIEW
========================================================= */

function showFavorites() {

  const favorites =
    notesCache.filter(
      note => note.favorite
    );


  openModal(`

    <div class="eyebrow">
      FAVORITES
    </div>

    <h2>
      Your highest-value knowledge
    </h2>


    <div class="card list">

      ${
        favorites
          .map(noteListItem)
          .join("")
        ||
        `
          <div class="sub">
            No favorites yet.
          </div>
        `
      }

    </div>

  `);

}


/* =========================================================
   ALL NOTES
========================================================= */

function showAllNotes() {

  openModal(`

    <div class="eyebrow">
      KNOWLEDGE LIBRARY
    </div>

    <h2>
      All notes
    </h2>


    <div class="card list">

      ${
        notesCache
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


/* =========================================================
   QUICK CAPTURE
========================================================= */

function quickCapture() {

  openModal(`

    <div class="eyebrow">
      QUICK CAPTURE
    </div>

    <h2>
      Get it out of your head.
    </h2>

    <p class="sub">
      Don't organize it yet.
      Just capture the thought.
    </p>


    <form
      id="quickCaptureForm"
      class="form"
    >

      <label>

        What do you want to remember?

        <input
          id="quickTitle"
          required
          placeholder="e.g. Research SGLT2 sick-day rules"
        >

      </label>


      <label>

        Details

        <textarea
          id="quickContent"
          placeholder="Add anything useful..."
        ></textarea>

      </label>


      <button
        class="btn primary"
        type="submit"
      >
        Capture
      </button>

    </form>

  `);


  document
    .getElementById("quickCaptureForm")
    .onsubmit = async event => {

      event.preventDefault();


      const { error } =
        await client
          .from("notes")
          .insert({

            title:
              document
                .getElementById("quickTitle")
                .value
                .trim(),

            content:
              document
                .getElementById("quickContent")
                .value,

            section: "Inbox",

            note_type: "Idea",

            status: "Inbox",

            tags: [],

            favorite: false,

            user_id:
              currentUser.id,

            updated_at:
              new Date().toISOString()

          });


      if (error) {

        alert(error.message);

        return;

      }


      await loadNotes();

      closeModal();

      navigate("inbox");

    };

}


/* =========================================================
   SEARCH
========================================================= */

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

          ${note.summary}

          ${note.content}

          ${note.section}

          ${note.note_type}

          ${note.status}

          ${note.source}

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


/* =========================================================
   AUTH
========================================================= */

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


  currentUser =
    data.user;


  await showApp();

}


async function showApp() {

  document
    .getElementById("loginScreen")
    .classList
    .add("hidden");


  document
    .getElementById("appShell")
    .classList
    .remove("hidden");


  document
    .getElementById("avatar")
    .textContent =
    (
      currentUser.email ||
      "E"
    )
      .charAt(0)
      .toUpperCase();


  await loadNotes();

  navigate("home");

}


async function logout() {

  await client.auth.signOut();

  location.reload();

}


/* =========================================================
   EVENTS
========================================================= */

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
  .onclick = closeModal;


document
  .getElementById("modal")
  .onclick = event => {

    if (
      event.target.id === "modal"
    ) {

      closeModal();

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


    if (event.key === "Escape") {

      closeModal();

    }

  }
);


/* =========================================================
   INITIALIZE
========================================================= */

(async function initialize() {

  const {
    data: {
      session
    }
  } =
    await client.auth.getSession();


  if (session) {

    currentUser =
      session.user;

    await showApp();

  }

})();
