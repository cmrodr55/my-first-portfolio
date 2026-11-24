
// OPERATIONS HUB
// Developed by Carla Rodriguez

const $ = id => document.getElementById(id);

// Local storage
const defaultData = {
    plans: [],
    members: [],
    tasks: [],
    goals: [],
    training: [],
    messages: [],
    metrics: {}
};

let data = { ...defaultData };

try {
    data = {
        ...defaultData,
        ...JSON.parse(localStorage.getItem("operationsHub") || "{}")
    };
} catch (error) {
    console.error("Unable to load saved data", error);
}

function saveData() {
    localStorage.setItem("operationsHub", JSON.stringify(data));
    renderAll();
}

// Current date
$("current-date").textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
});

// Navigation
function showSection(id) {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    $(id).classList.add("active");
}

// Input helpers
function value(id) {
    return $(id).value.trim();
}

function clearInputs(...ids) {
    ids.forEach(id => $(id).value = "");
}

function addItem(category, item) {
    data[category].push({
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        ...item
    });

    saveData();
}

// Daily Plans
function addPlan() {
    const leader = value("leader-name");

    if (!leader) {
        alert("Please enter a leader name.");
        return;
    }

    addItem("plans", {
        leader,
        shift: value("shift"),
        zone: value("zone"),
        date: new Date().toLocaleDateString()
    });

    clearInputs("leader-name");
}

// Team Development
function addMember() {
    const name = value("member-name");

    if (!name) {
        alert("Please enter a team member name.");
        return;
    }

    addItem("members", {
        name,
        level: value("member-level"),
        notes: value("member-notes")
    });

    clearInputs("member-name", "member-notes");
}

// Cleanliness and Walkthroughs
function addTask() {
    const task = value("task-name");
    const owner = value("task-owner");

    if (!task || !owner) {
        alert("Please enter a task and its owner.");
        return;
    }

    addItem("tasks", {
        task,
        owner,
        completed: false
    });

    clearInputs("task-name", "task-owner");
}

function completeTask(id) {
    const task = data.tasks.find(item => item.id === id);

    if (task) {
        task.completed = !task.completed;
        saveData();
    }
}

// Performance Metrics
function saveMetrics() {
    const cem = value("cem");
    const accuracy = value("accuracy");
    const serviceTime = value("service-time");

    if (
        !cem || !accuracy ||
        Number(cem) < 0 || Number(cem) > 100 ||
        Number(accuracy) < 0 || Number(accuracy) > 100
    ) {
        alert("Enter valid percentages between 0 and 100.");
        return;
    }

    if (!/^\d+:[0-5]\d$/.test(serviceTime)) {
        alert("Enter service time as minutes:seconds.");
        return;
    }

    data.metrics = {
        cem,
        accuracy,
        serviceTime
    };

    saveData();
    alert("Performance metrics saved!");
}

// SMART Goals
function addGoal() {
    const goal = value("goal-name");
    const deadline = value("goal-deadline");

    if (!goal || !deadline) {
        alert("Please enter a goal and deadline.");
        return;
    }

    addItem("goals", {
        goal,
        deadline,
        completed: false
    });

    clearInputs("goal-name", "goal-deadline");
}

function completeGoal(id) {
    const goal = data.goals.find(item => item.id === id);

    if (goal) {
        goal.completed = !goal.completed;
        saveData();
    }
}

// Training
function addTraining() {
    const name = value("trainee-name");

    if (!name) {
        alert("Please enter a trainee name.");
        return;
    }

    addItem("training", {
        name,
        position: value("training-position"),
        status: value("training-status"),
        time: value("training-time"),
        notes: value("training-notes")
    });

    clearInputs(
        "trainee-name",
        "training-time",
        "training-notes"
    );
}

// FOH and BOH Communication
function addMessage() {
    const author = value("message-author");
    const message = value("message-text");

    if (!author || !message) {
        alert("Please enter your name and update.");
        return;
    }

    addItem("messages", {
        author,
        department: value("department"),
        message,
        date: new Date().toLocaleString()
    });

    clearInputs("message-author", "message-text");
}

// Delete records
function deleteItem(category, id) {
    if (!confirm("Are you sure you want to delete this record?")) {
        return;
    }

    data[category] = data[category].filter(item => item.id !== id);

    saveData();
}

// Display records safely
function renderList(category, listId, format, toggle) {
    const list = $(listId);
    list.replaceChildren();

    if (!data[category].length) {
        const empty = document.createElement("li");
        empty.textContent = "No records yet.";
        list.appendChild(empty);
        return;
    }

    data[category].forEach(item => {
        const li = document.createElement("li");

        if (item.completed) {
            li.classList.add("completed");
        }

        const description = document.createElement("div");
        description.textContent = format(item);
        description.style.whiteSpace = "pre-line";

        li.appendChild(description);

        if (toggle) {
            const complete = document.createElement("button");

            complete.textContent = item.completed
                ? "Undo"
                : "Mark Complete";

            complete.onclick = () => toggle(item.id);

            li.appendChild(complete);
        }

        const remove = document.createElement("button");
        remove.textContent = "Delete";
        remove.className = "delete-btn";
        remove.onclick = () => deleteItem(category, item.id);

        li.appendChild(remove);
        list.appendChild(li);
    });
}

// Dashboard
function updateDashboard() {
    $("task-count").textContent = data.tasks.length;

    $("completed-count").textContent =
        data.tasks.filter(task => task.completed).length;

    $("team-count").textContent = data.members.length;

    $("goal-count").textContent =
        data.goals.filter(goal => !goal.completed).length;
}

// Render all sections
function renderAll() {
    renderList("plans", "plan-list", item =>
        `${item.leader} | ${item.shift}\n${item.zone} | ${item.date}`
    );

    renderList("members", "member-list", item =>
        `${item.name} | ${item.level}\n${item.notes}`
    );

    renderList("tasks", "task-list", item =>
        `${item.task}\nAssigned to: ${item.owner}`,
        completeTask
    );

    renderList("goals", "goal-list", item =>
        `${item.goal}\nDeadline: ${item.deadline}`,
        completeGoal
    );

    renderList("training", "training-list", item =>
        `${item.name} | ${item.position}\nStatus: ${item.status}\nTraining time: ${item.time}\n${item.notes}`
    );

    renderList("messages", "message-list", item =>
        `${item.author} | ${item.department}\n${item.message}\n${item.date}`
    );

    updateDashboard();
}

// Load saved metrics
$("cem").value = data.metrics.cem || "";
$("accuracy").value = data.metrics.accuracy || "";
$("service-time").value = data.metrics.serviceTime || "";

// Initialize application
renderAll();
