let todoListInput = document.querySelector("#listInput");
todoListInput.addEventListener("keydown", (e) => {
    // We don't care if it isn't the enter key
    if (e.key !== "Enter") return;
    // Save the input as list
    saveInputAsList(todoListInput);
    // Empty the input field
    clearField(todoListInput);
})

let todoListAddButton = document.querySelector("#addList")
todoListAddButton.addEventListener("click", (e) => {
    saveInputAsList(todoListInput);
    // Empty the input field
    clearField(todoListInput);
})

function saveInputAsList(todoListInput) {
    // if the input is the empty string, make a dialog box alert
    if(todoListInput.value.trim().length == 0) {
        alert('Please write a name for the list');
        return;
    }
    // Create a new note object to be saved
    let todolistItem = {
        id: Date.now() - 1000000, //this is a quickfix, proper fix later.
        text: todoListInput.value,
        chosen: true,
    };

    // Load already saved lists from the store
    let todoLists = ministore.get("todoLists");
    // if no todolists exists, make one.
    if(!todoLists) {
        todoLists = [];
    }
    // clear old chosen list, check for name dublicates
    for(let todoList of todoLists) {
        todoList.chosen = false;
        if(todoListInput.value == todoList.text) {
            alert("you already have a todolist by this name");
            // Empty the input field
            clearField(todoListInput);
            return;
        }
    }

    // Add the new list
    todoLists.unshift(todolistItem);

    // Store the new notes back into ministore
    ministore.set("todoLists", todoLists);
}

function showLists() {
    let listsDiv = document.querySelector("#todoList");
    let todoLists = ministore.get("todoLists");

    if(!todoLists) {
        ministore.set("todoLists", []);
        todoLists = [];
    }
    
    // Clear the ListsDiv of any old notes
    listsDiv.innerHTML = "";

    for(let todoItem of todoLists) {
        let span = document.createElement("span");
        span.innerHTML = todoItem.text;
        if(todoItem.chosen == true) {
            span.classList.add("chosenTodoItem")
        } else {
            span.classList.add("todoItem");
        }

        let editButton = makeEditButton();

        // when clicking edit button, edit the list name
        editButton.addEventListener('click', () => {
            editButtonListener(editButton, span, todoItem, todoLists);
        });

        //create DOM element for Delete button
        let deleteButton = makeDeleteButton();

        // when clicking delete button, delete the element
        deleteButton.addEventListener('click', (e) => {
            // Clear the notesDiv of any old notes
            listsDiv.innerHTML = "";
            // Make another list chosen if needed
            if(todoLists.length > 1) {
                if(todoItem.chosen == true) {
                    let thisIndex = todoLists.findIndex(obj => {return obj === todoItem;})
                    if (thisIndex == 0) {
                        todoLists[1].chosen = true;
                    } else {
                        todoLists[0].chosen = true;
                    }
                }
            }
            
            // Timmi's awesome delete-løsning. Rune approves.
            let todoIndex = todoLists.findIndex(obj => {return obj === todoItem;})
            todoLists.splice(todoIndex, 1);
            localStorage.removeItem(todoItem.id);
            
            ministore.set("todoLists", todoLists);
            
        });

        span.addEventListener("click", (e) => {
            if(todoItem.chosen == true) {
                return;
            }
            if(span.classList == "todoItem") {
                span.classList.remove("todoItem");
                span.classList.add("chosenTodoItem");

                todoLists.forEach(element => {
                    element.chosen = false;
                });
                todoItem.chosen = true;
                ministore.set("todoLists",todoLists);
            } else {
                span.classList.remove("chosenTodoItem");
                span.classList.add("todoItem");
                todoItem.chosen = false;
                ministore.set("todoLists",todoLists);
            }
        });

        const todoContainer = document.createElement("div");
        todoContainer.classList.add("todoContainer");
        todoContainer.appendChild(span);
        todoContainer.appendChild(editButton);
        todoContainer.appendChild(deleteButton);
        listsDiv.appendChild(todoContainer);
    }
}


// Get a hold of the input field
let input = document.querySelector("#input");
// Listen to keydown events on the input
input.addEventListener("keydown", (e) => {
    // We don't care if it isn't the enter key
    if (e.key !== "Enter") return;
    saveInputAsNote();
});


let addNoteButton = document.querySelector("#addNote");
addNoteButton.addEventListener("click", (e) => {
    saveInputAsNote();
});


// We add an event listener to the clear button to delete all notes.
let clear = document.querySelector("#clear");
clear.addEventListener("click", (e) => {
    //if no lists exists or the list have no notes, do not do anything
    if (!findChosenTodoList() || getChosenTodoListNotes().length == 0) { return }
    var res = window.confirm("Are you sure you want to clear all notes?");
    if(res) {    
        ministore.set(findChosenTodoList().id, []);
    }
});


//Saves input in textfield as a new note
function saveInputAsNote() {
    // if the input is the empty string, make a dialog box alert
    if(input.value.trim().length == 0) {
        alert('Please write a note in the box');
        return;
    }

    if(ministore.get("todoLists").length == 0) {
        // If no TodoList is chosen or exists, make a new list with the first note as name.
        saveInputAsList(input);
    }

    // Create a new note object to be saved
    let note = {
        id: Date.now(),
        text: input.value,
        isTodo: true
    };

    
    // Load the chosen todolist from the store
    let chosenTodoList = findChosenTodoList();
    // Load already saved notes from the store
    let notes = ministore.get(chosenTodoList.id);
    
    if(!notes) {
        notes = [];
    }
    
    // Add the new note
    notes.unshift(note);
    // Store the new notes back into ministore
    ministore.set(chosenTodoList.id, notes);
    // Empty the input field
    clearField(input);
}

// When any changes happens in ministore, call the showNotes function
ministore.addChangeHandler(showLists);
ministore.addChangeHandler(showNotes);


// Call showLists and showNotes when the page loads
showLists();
showNotes();


// showNotes is used to load stored notes and display them
function showNotes() {
    // Get a hold of the notes div
    let notesDiv = document.querySelector("#notes");
    // Load notes from ministore
    let chosenTodoList = findChosenTodoList();
    if(!chosenTodoList) { 
        notesDiv.innerHTML = "";
        return;
     }
    let notes = ministore.get(chosenTodoList.id);
    // If there's no notes stored, lets create them in ministore
    if (!notes) {
        ministore.set(chosenTodoList.id, []);
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
        let editButton = makeEditButton();

        //create DOM element for Delete button
        let deleteButton = makeDeleteButton();

        //create DOM element for Move button
        let moveButton = document.createElement("button");
        moveButton.innerText = "Move";
        moveButton.classList.add("moveButton");

        //Createing Dom element for Modal
        let theModal = makeWholeModal(note, notes);

        moveButton.addEventListener("click", (e) => {
            theModal.style.display = "block";
        });

        window.addEventListener("click", (e) => {
            if(e.target == theModal) {
                theModal.style.display = "none";
            }
        });

        // if note is done, strike it
        if(note.isTodo == false) {
            span.classList.add("strike");
        }

        // when clicking a note, strike or unstrike it
        span.addEventListener("pointerdown", () => {
            if (note.isTodo == true) {
                span.classList.add("strike");
                //sets note to done
                note.isTodo = false;
                // Saves changes locally
                ministore.set(chosenTodoList.id, notes);
            } else {
                span.classList.remove("strike");
                //Sets note to todo
                note.isTodo = true;
                // Saves changes locally
                ministore.set(chosenTodoList.id, notes);
            }
        });


        // when clicking edit button, edit the note
        editButton.addEventListener('click', () => {
            editButtonListener(editButton, span, note, notes);
        });

        // when clicking delete button, delete the element
        deleteButton.addEventListener('click', (e) => {
            // Clear the notesDiv of any old notes
            notesDiv.innerHTML = "";
            // Timmi's awesome delete-løsning. Rune approves.
            let noteIndex = notes.findIndex(obj => {return obj === note;})
            notes.splice(noteIndex, 1);
            // Saves changes locally
            ministore.set(chosenTodoList.id, notes);
        });

        const noteContainer = document.createElement("div");
        noteContainer.classList.add("noteContainer");
        const liElement = document.createElement("li");
        liElement.classList.add("theDot");
        
        liElement.appendChild(span);
        liElement.appendChild(editButton);
        liElement.appendChild(deleteButton);
        liElement.appendChild(moveButton);
        liElement.appendChild(theModal);
        
        noteContainer.appendChild(liElement);
        
        notesDiv.appendChild(noteContainer);

    }
}

function findChosenTodoList() {
   let todoLists = ministore.get("todoLists"); 
   let chosenTodoList;
   for(let todoList of todoLists) {
        if(todoList.chosen == true) {
            chosenTodoList = todoList;
            break;
        }
   }
   return chosenTodoList;
}

function getChosenTodoListNotes() {
    let notes = ministore.get(findChosenTodoList().id);
    return notes;
}

function makeWholeModal(note ,notes) {
    //create DOM element for Modal.
    let theModal = document.createElement("div");
    theModal.id = "theModal";
    theModal.classList.add("modal");

    let modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");

    let modalSpan = document.createElement("span");
    modalSpan.classList.add("close");
    modalSpan.innerHTML = "&times";

    modalContent.innerHTML = "Please choose which list the note should be moved to:  ";

    let listSelector = document.createElement("select");
    listSelector.id = Date.now(); 
    let todoLists = ministore.get("todoLists");
    for(item of todoLists) {
        var text = item.text;
        var el = document.createElement("option");
        el.textContent = text;
        el.value = text;
        listSelector.appendChild(el);
    }

    let submitButton = document.createElement("button");
    submitButton.innerText = "Submit";
    submitButton.classList.add("submitButton");

    submitButton.addEventListener("click", (e) => {
        //get the index of the chosen option
        var chosenOptionIndex = listSelector.selectedIndex;
        //find the index of the todolist in todoLists.
        var todoListIndex = todoLists.findIndex(obj => obj.text == listSelector[chosenOptionIndex].value);
        //get the notes from the todoList
        var notesFromList = ministore.get(todoLists[todoListIndex].id);

        if(todoLists[todoListIndex].id == findChosenTodoList().id) {
            theModal.style.display = "none";
            return;
        }

        //adds the note the the list
        notesFromList.push(note);
        //update localstorage to have the correct values
        ministore.set(todoLists[todoListIndex].id, notesFromList);

        //remove the moved note from its original location:
        let noteIndex = notes.findIndex(obj => {return obj === note;})
        notes.splice(noteIndex, 1);
        ministore.set(findChosenTodoList().id, notes);

        theModal.style.display = "none";
    });

    modalSpan.addEventListener("click", (e) => {
        theModal.style.display = "none";
    });

    modalContent.appendChild(listSelector);
    modalContent.appendChild(submitButton);
    modalContent.appendChild(modalSpan);
    theModal.appendChild(modalContent);

    return theModal;
}

function makeDeleteButton() {
    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteButton.classList.add("deleteButton");
    return deleteButton;
}

function makeEditButton() {
    let editButton = document.createElement("button");
        editButton.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
        editButton.classList.add("editButton");
    return editButton;
}


function editButtonListener(editButton,span, item, list) {
    // Changing blue Edit button to green Done button
    editButton.classList.remove("editButton");
    editButton.classList.add("doneButton");
    editButton.innerHTML = '<i class="fa-solid fa-check"></i>';

    // replacing span element with an input field
    let editInput = document.createElement("input");
    editInput.classList.add("editInput");
    span.replaceWith(editInput);
    // inserting current text
    editInput.value = item.text;
    editInput.focus();
    
    // Listen for an "enter" press
    editInput.addEventListener("keydown", (e) => {
        // We don't care if it isn't the enter key
        if (e.key !== "Enter") return;
        saveStuff(editInput.value, editButton, item,list);
    });

    // Listen for mouseclick on done button
    editButton.addEventListener("click", (e) => {
        saveStuff(editInput.value, editButton, item,list);
    });
}

// Saves the edited note.
function saveStuff(inputValue, editButton, item, list) {
    // if the input is the empty string, make a dialog box alert
    if(inputValue.trim().length == 0) {
        alert('Please write a note in the box');
        return;
    }
    // Changing green Done button to blue Edit button
    editButton.classList.remove("doneButton");
    editButton.classList.add("editButton");
     // Grab the text from the input field and store in the note
    item.text = inputValue;
    // Store the updated notes back into ministore
    if(ministore.get(item.id) == null) {
        ministore.set(findChosenTodoList().id, list);
    } else {
        ministore.set("todoLists", list);
    }
}

function clearField(input) {
    input.value = "";
}

