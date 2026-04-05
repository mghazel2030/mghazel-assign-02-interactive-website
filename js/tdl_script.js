/* 
   =========================================================
   To-Do-List App JS File: File: tdl_script.js
   ---------------------------------------------------------
   Course: Software Development Bootcamp Course
   Assignment # 2: Interactive Website
   =========================================================
   Content: The main JavaScript file of the App.
   =========================================================
   Developer: Mohsen Ghazel
   Version: 26-Mar-2026
   =========================================================
*/

// Get the HTML elements
const input = document.getElementById("taskInput")
const addBtn = document.getElementById("addBtn")
const list = document.getElementById("taskList")
const filterButtons = document.querySelectorAll(".filters button")
const dateDisplay = document.getElementById("todayDate")

// Initialize the list of tasks
let tasks = []
let currentFilter = "all"

// Set the intial screen
showDate()
loadTasks()
renderTasks()

// Add task 
addBtn.onclick = addTask
// Handle Enter key
input.addEventListener("keypress", e => {if (e.key === "Enter") addTask()})

// Set today's date
function showDate(){
    let today = new Date()
    dateDisplay.textContent = today.toDateString()
}

/*
  Add tasks function
*/
function addTask(){
    // Get the user input for the task name
    let text = input.value.trim()

    // Validate the text
    if (text==="") return

    // prevent duplicates
    if (tasks.some(t => t.text.toLowerCase() === text.toLowerCase()))
    {
        alert("Task already exists")
        return
    }
    // Add the task to the list of tasks
    tasks.push({
        id:Date.now(),
        text:text,
        completed:false
    })

    // Clear the input
    input.value=""
    // Save the tasks
    saveTasks()
    // Render the tasks
    renderTasks()
}

/*
  Render the tasks
*/
function renderTasks() {
    list.innerHTML = "";

    let filtered = tasks.filter(task => {
        if (currentFilter === "active") return !task.completed;
        if (currentFilter === "completed") return task.completed;
        return true;
    });

    filtered.forEach(task => {
        let li = document.createElement("li");
        li.className = "task-item"; // Matches the CSS below

        // Left Side: Checkbox + Task Text
        let left = document.createElement("div");
        left.className = "task-left";

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.onchange = () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        };

        let span = document.createElement("span");
        span.textContent = task.text;
        span.className = "task-text";
        if (task.completed) span.classList.add("text-decoration-line-through", "text-muted");

        left.append(checkbox, span);

        // Right Side: Action Buttons
        let actions = document.createElement("div");
        actions.className = "task-btns";

        let editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "btn-edit"; // Matches modern CSS styling
        editBtn.onclick = () => {
            let newText = prompt("Edit task", task.text);
            if (!newText || newText.trim() === "") return;
            task.text = newText;
            saveTasks();
            renderTasks();
        };

        let deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "btn-delete"; // Matches modern CSS styling
        deleteBtn.onclick = () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
        };

        actions.append(editBtn, deleteBtn);

        // Append both sides to the LI
        li.append(left, actions);
        list.appendChild(li);
    });
}

// Save the tasks
function saveTasks(){
    localStorage.setItem("tasks",JSON.stringify(tasks))
}

// Load the tasks
function loadTasks(){
    let saved=localStorage.getItem("tasks")
    if(saved)
    tasks = JSON.parse(saved)
}

// Filter button handler
filterButtons.forEach(btn => {
    btn.onclick = () => {
        // Remove active class from ALL buttons
        filterButtons.forEach(b => b.classList.remove("active"));
        // Add to the clicked one
        btn.classList.add("active");
        // Set the current filer
        currentFilter = btn.dataset.filter;
        renderTasks();
    };
});
