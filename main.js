// Authors; Rune, Mai, Timmi.

// Get a hold of the input field
let input = document.querySelector("input");
// Listen to keydown events on the input
input.addEventListener("keydown", (e) => {
  // We don't care if it isn't the enter key
  if (e.key !== "Enter") return;
  // if the input is the empty string, make a dialog box alert
  if (input.value.trim().length == 0) {
    alert("Please write a note in the box");
    return;
  }
  // Create a new note object to be saved
  let note = {};
  // Giving the note an unique ID;
  note.id = Date.now();
  // Grab the text from the input field and store in the note
  note.text = input.value;
  // Set the "todo" state of the note to true
  note.isTodo = true;
  // Load already saved notes from the store
  let notes = ministore.get("notes");
  // if note only consists of empty spaces, do nothing
  if (note.text.trim(" ").length === 0) return;
  // Add the new note
  notes.unshift(note);
  // Store the new notes back into ministore
  ministore.set("notes", notes);
  // Empty the input field
  input.value = "";
});

// We add an event listener to the clear button to delete all notes.
let clear = document.querySelector("#clear");
clear.addEventListener("click", (e) => {
  ministore.set("notes", []);
});

// When any changes happens in ministore, call the showNotes function
ministore.addChangeHandler(showNotes);

// Call showNotes when the page loads
showNotes();

// showNotes is used to load stored notes and display them
function showNotes() {
  // Get a hold of the notes div
  let notesDiv = document.querySelector("#notes");
  // Load notes from ministore
  let notes = ministore.get("notes");
  // If there's no notes stored, lets create them in ministore
  if (!notes) {
    ministore.set("notes", []);
    notes = [];
  }
  // Clear the notesDiv of any old notes
  notesDiv.innerHTML = "";

  // iterate through the array of notes from ministore
  for (let note of notes) {
    // Create DOM elements for each note
    let span = document.createElement("span");
    span.innerText = note.text;
    span.classList.add("note");

    //create DOM element for Edit button
    let editButton = document.createElement("button");
    editButton.innerText = "Edit";
    editButton.classList.add("editButton");

    //create DOM element for Delete button
    let deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.classList.add("deleteButton");

    // if note is done, strike it
    if (note.isTodo == false) {
      span.classList.add("strike");
    }

    // when clicking a note, strike or unstrike it
    span.addEventListener("pointerdown", () => {
      if (note.isTodo == true) {
        span.classList.add("strike");
        //sets note to done
        note.isTodo = false;
        // Saves changes locally
        ministore.set("notes", notes);
      } else {
        span.classList.remove("strike");
        //Sets note to todo
        note.isTodo = true;
        // Saves changes locally
        ministore.set("notes", notes);
      }
    });

    // when clicking edit button, edit the note
    editButton.addEventListener("click", () => {
      // Changing blue Edit button to green Done button
      editButton.classList.remove("editButton");
      editButton.classList.add("doneButton");
      editButton.innerText = "Done";

      // replacing note with an editable note
      let editInput = document.createElement("input");
      editInput.classList.add("editInput");
      span.replaceWith(editInput);
      // inserting current text
      editInput.value = note.text;
      editInput.focus();

      // Listen for an "enter" press
      editInput.addEventListener("keydown", (e) => {
        // We don't care if it isn't the enter key
        if (e.key !== "Enter") return;
        saveNote();
      });

      // Listen for mouseclick on done button
      editButton.addEventListener("click", (e) => {
        saveNote();
      });

      // Saves the edited note.
      function saveNote() {
        console.log(note);
        // if the input is the empty string, make a dialog box alert
        if (editInput.value.trim().length == 0) {
          alert("Please write a note in the box");
          return;
        }
        // Changing green Done button to blue Edit button
        editButton.classList.remove("doneButton");
        editButton.classList.add("editButton");
        // Grab the text from the input field and store in the note
        note.text = editInput.value;
        // Store the updated notes back into ministore
        ministore.set("notes", notes);
      }
    });

    // when clicking delete button, delete the element
    deleteButton.addEventListener("click", (e) => {
      // Clear the notesDiv of any old notes
      notesDiv.innerHTML = "";
      // Timmi's awesome delete-løsning. Rune approves.
      let noteIndex = notes.findIndex((obj) => {
        return obj === note;
      });
      notes.splice(noteIndex, 1);
      // Saves changes locally
      ministore.set("notes", notes);
    });

    const noteContainer = document.createElement("div");
    noteContainer.classList.add("noteContainer");
    const liElement = document.createElement("li");
    liElement.classList.add("theDot");

    liElement.appendChild(span);
    liElement.appendChild(editButton);
    liElement.appendChild(deleteButton);

    noteContainer.appendChild(liElement);

    notesDiv.appendChild(noteContainer);
  }
}
