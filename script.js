let todos = JSON.parse(localStorage.getItem('todos')) || {};
let categories = JSON.parse(localStorage.getItem('categories')) || ['Personal', 'Work', 'Shopping'];
let currentCategory = null;
let editingId = null;

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function updateStats() {
    const categoryTodos = todos[currentCategory] || [];
    document.getElementById('totalTasks').textContent = `${categoryTodos.length} Total`;
    const completed = categoryTodos.filter(todo => todo.completed).length;
    document.getElementById('completedTasks').textContent = `${completed} Completed`;
    
    // Update progress bar
    const progressBar = document.getElementById('progressBar');
    const progressPercentage = categoryTodos.length > 0 ? (completed / categoryTodos.length) * 100 : 0;
    progressBar.style.width = `${progressPercentage}%`;

    // Check if all tasks are complete
    if (completed === categoryTodos.length && categoryTodos.length > 0) {
        showCongratsModal();
    }
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
    updateStats();
}

function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

function renderCategories() {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = '';

    categories.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.textContent = category;
        categoryItem.onclick = () => selectCategory(category);
        categoryList.appendChild(categoryItem);
    });
}

function selectCategory(category) {
    currentCategory = category;
    document.getElementById('currentCategory').textContent = category;
    document.getElementById('categoryPage').style.display = 'none';
    document.getElementById('todoApp').style.display = 'block';
    renderTodos();
    updateStats();
}

function addCategory() {
    const input = document.getElementById('categoryInput');
    const category = input.value.trim();

    if (category && !categories.includes(category)) {
        categories.push(category);
        saveCategories();
        renderCategories();
        input.value = '';
        showToast('Category added successfully!');
    } else if (categories.includes(category)) {
        showToast('Category already exists!', 'error');
    }
}

function renderTodos() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';

    const categoryTodos = todos[currentCategory] || [];

    if (categoryTodos.length === 0) {
        todoList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>No tasks yet. Add a new task to get started!</p>
            </div>
        `;
        return;
    }

    categoryTodos.forEach(todo => {
        const li = document.createElement('div');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''} 
                onchange="toggleTodo(${todo.id})">
            <span class="todo-text">${todo.text}</span>
            <div class="todo-actions">
                <button class="action-btn edit-btn" onclick="openEditModal(${todo.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteTodo(${todo.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        todoList.appendChild(li);
    });
}

function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();

    if (text) {
        if (!todos[currentCategory]) {
            todos[currentCategory] = [];
        }
        const newTodo = {
            id: Date.now(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        todos[currentCategory].unshift(newTodo);
        saveTodos();
        input.value = '';
        renderTodos();
        showToast('Task added successfully!');
    }
}

function toggleTodo(id) {
    const todo = todos[currentCategory].find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        showToast(todo.completed ? 'Task completed!' : 'Task uncompleted');
    }
}

function openEditModal(id) {
    editingId = id;
    const todo = todos[currentCategory].find(t => t.id === id);
    const modal = document.getElementById('editModal');
    const input = document.getElementById('editInput');
    input.value = todo.text;
    modal.style.display = 'block';
}

function updateTodo() {
    const input = document.getElementById('editInput');
    const newText = input.value.trim();

    if (newText) {
        const todo = todos[currentCategory].find(t => t.id === editingId);
        if (todo) {
            todo.text = newText;
            todo.updatedAt = new Date().toISOString();
            saveTodos();
            showToast('Task updated successfully!');
        }
    }
    closeEditModal();
    renderTodos();
}

function deleteTodo(id) {
    todos[currentCategory] = todos[currentCategory].filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
    showToast('Task deleted!', 'error');
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
}

function showCongratsModal() {
    const modal = document.getElementById('congratsModal');
    modal.style.display = 'block';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 5000);
}

// Event Listeners
document.getElementById('getStartedBtn').addEventListener('click', function() {
    document.getElementById('welcomePage').style.display = 'none';
    document.getElementById('categoryPage').style.display = 'block';
});

document.getElementById('backToCategories').addEventListener('click', function() {
    document.getElementById('todoApp').style.display = 'none';
    document.getElementById('categoryPage').style.display = 'block';
});

document.getElementById('todoInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTodo();
    }
});

document.querySelector('.close').addEventListener('click', closeEditModal);

window.onclick = function(event) {
    const editModal = document.getElementById('editModal');
    const congratsModal = document.getElementById('congratsModal');
    if (event.target == editModal) {
        closeEditModal();
    }
    if (event.target == congratsModal) {
        congratsModal.style.display = 'none';
    }
}

// Initial render
renderCategories();

