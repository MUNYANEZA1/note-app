// DOM elements
const noteTitle = document.getElementById("note-title");
const noteContent = document.getElementById("note-content");
const noteTags = document.getElementById("note-tags");
const saveNoteBtn = document.getElementById("save-note");
const clearFormBtn = document.getElementById("clear-form");
const searchInput = document.getElementById("search-input");
const filterTagsBtn = document.getElementById("filter-tags-btn");
const notesContainer = document.getElementById("notes-container");
const toggleThemeBtn = document.getElementById("toggle-theme");
const exportNotesBtn = document.getElementById("export-notes");

let notes = JSON.parse(localStorage.getItem("notes")) || [];

// Initialize the app and load saved notes
function initializeApp() {
  renderNotes(notes);
  applyDarkMode();
}

// Save note to LocalStorage
function saveNote() {
  const newNote = {
    id: Date.now(),
    title: noteTitle.value,
    content: noteContent.value,
    tags: noteTags.value.split(",").map((tag) => tag.trim()),
    color: getRandomColor(),
    createdAt: new Date(),
    modifiedAt: new Date(),
    pinned: false,
  };

  notes.push(newNote);
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes(notes);
  clearForm();
}

// Render notes to the UI
function renderNotes(notesArray) {
  notesContainer.innerHTML = "";

  if (notesArray.length === 0) {
    notesContainer.innerHTML = "<p>No notes found. Please add some.</p>";
  }

  notesArray.forEach((note) => {
    const noteCard = document.createElement("div");
    noteCard.classList.add("note-card");
    noteCard.style.backgroundColor = note.color;

    const noteTitleEl = document.createElement("h3");
    noteTitleEl.textContent = note.title;

    const noteContentEl = document.createElement("p");
    noteContentEl.textContent = note.content;

    const noteTagsEl = document.createElement("p");
    noteTagsEl.textContent = `Tags: ${note.tags.join(", ")}`;

    const noteDateEl = document.createElement("p");
    noteDateEl.textContent = `Created: ${note.createdAt.toLocaleString()}`;

    const noteBtns = document.createElement("div");
    noteBtns.classList.add("note-btns");

    const editBtn = document.createElement("button");
    editBtn.classList.add("btn", "btn-info");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => editNote(note.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("btn", "btn-danger");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteNote(note.id);

    const pinBtn = document.createElement("button");
    pinBtn.classList.add("btn", note.pinned ? "btn-warning" : "btn-secondary");
    pinBtn.textContent = note.pinned ? "Unpin" : "Pin";
    pinBtn.onclick = () => togglePin(note.id);

    noteBtns.appendChild(editBtn);
    noteBtns.appendChild(deleteBtn);
    noteBtns.appendChild(pinBtn);

    noteCard.appendChild(noteTitleEl);
    noteCard.appendChild(noteContentEl);
    noteCard.appendChild(noteTagsEl);
    noteCard.appendChild(noteDateEl);
    noteCard.appendChild(noteBtns);

    notesContainer.appendChild(noteCard);
  });
}

// Clear form input fields
function clearForm() {
  noteTitle.value = "";
  noteContent.value = "";
  noteTags.value = "";
}

// Edit note functionality
function editNote(noteId) {
  const note = notes.find((n) => n.id === noteId);

  if (note) {
    noteTitle.value = note.title;
    noteContent.value = note.content;
    noteTags.value = note.tags.join(", ");
    notes = notes.filter((n) => n.id !== noteId);
    localStorage.setItem("notes", JSON.stringify(notes));
    renderNotes(notes);
  }
}

// Delete note functionality
function deleteNote(noteId) {
  notes = notes.filter((note) => note.id !== noteId);
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes(notes);
}

// Toggle pin/unpin functionality
function togglePin(noteId) {
  const note = notes.find((n) => n.id === noteId);
  note.pinned = !note.pinned;
  note.modifiedAt = new Date();
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes(notes);
}

// Search notes by title/content
function searchNotes() {
  const query = searchInput.value.toLowerCase();
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
  );
  renderNotes(filteredNotes);
}

// Filter notes by tags
function filterNotesByTags() {
  const tags = prompt("Enter tags to filter (comma separated):")
    .split(",")
    .map((tag) => tag.trim().toLowerCase());
  const filteredNotes = notes.filter((note) =>
    note.tags.some((tag) => tags.includes(tag.toLowerCase()))
  );
  renderNotes(filteredNotes);
}

// Random color generator for note background
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Toggle Dark Mode
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(
    "dark-mode",
    document.body.classList.contains("dark-mode")
  );
}

// Apply Dark Mode from localStorage
function applyDarkMode() {
  if (localStorage.getItem("dark-mode") === "true") {
    document.body.classList.add("dark-mode");
  }
}

// Export notes as PDF, Word, or JSON
function exportNotes() {
  const exportOption = prompt(
    "Select the export format:\n1. PDF\n2. Word Document\n3. JSON"
  );

  switch (exportOption) {
    case "1":
      exportAsPDF();
      break;
    case "2":
      exportAsWord();
      break;
    case "3":
      exportAsJSON();
      break;
    default:
      alert("Invalid choice. Please select 1, 2, or 3.");
  }
}

// Export notes as PDF using jsPDF
function exportAsPDF() {
  const { jsPDF } = window.jspdf; // Ensure jsPDF library is included
  const doc = new jsPDF();

  notes.forEach((note, index) => {
    doc.text(`Title: ${note.title}`, 10, 10 + index * 30);
    doc.text(`Content: ${note.content}`, 10, 20 + index * 30);
    doc.text(`Tags: ${note.tags.join(", ")}`, 10, 30 + index * 30);
    doc.text(
      `Created At: ${note.createdAt.toLocaleString()}`,
      10,
      40 + index * 30
    );
    doc.addPage(); // Add new page for each note (optional)
  });

  doc.save("notes.pdf");
}

// Export notes as Word document using Blob
function exportAsWord() {
  let wordContent = "<html><body><h1>Notes</h1>";
  notes.forEach((note) => {
    wordContent += `<h2>${note.title}</h2>`;
    wordContent += `<p>${note.content}</p>`;
    wordContent += `<p><strong>Tags:</strong> ${note.tags.join(", ")}</p>`;
    wordContent += `<p><strong>Created At:</strong> ${note.createdAt.toLocaleString()}</p>`;
  });
  wordContent += "</body></html>";

  const blob = new Blob([wordContent], { type: "application/msword" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "notes.docx";
  link.click();
}

// Export notes as JSON file
function exportAsJSON() {
  const jsonContent = JSON.stringify(notes, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "notes.json";
  link.click();
}

// Event listeners
saveNoteBtn.addEventListener("click", saveNote);
clearFormBtn.addEventListener("click", clearForm);
searchInput.addEventListener("input", searchNotes);
filterTagsBtn.addEventListener("click", filterNotesByTags);
toggleThemeBtn.addEventListener("click", toggleDarkMode);
exportNotesBtn.addEventListener("click", exportNotes);

// Initialize the app
initializeApp();
