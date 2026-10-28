const taskForm = document.querySelector('#taskForm');
const taskInput = document.querySelector('#taskInput'); // input
const taskList = document.querySelector('#taskList'); // ul
const errorSpan = document.querySelector('#taskError');
const errorText = document.querySelector('#errorText');
const confirmationModal = document.querySelector('#confirmationModal');
const modalText = document.querySelector('#modalText');

// Pegando a lista do localStorage e transformando em objeto
let savedTasks = JSON.parse(localStorage.getItem('tasks')) || []; 
// guarda temporariamente o id da tarefa que o usuário quer excluir, entre o clique em "delete" e o clique em "Confirmar" no modal
let idToDelete = null;

function saveToStorage() {
    localStorage.setItem('tasks', JSON.stringify(savedTasks));
}

// Quando a página carrega renderiza o localStorage
document.addEventListener("DOMContentLoaded", () => {
    renderTasks(savedTasks);
});

document.querySelector('#confirmBtn').addEventListener('click', () => {
    const taskElement = taskList.querySelector(`[data-id="${idToDelete}"]`);

    savedTasks = savedTasks.filter(task => task.id !== idToDelete);
    saveToStorage();
    taskElement.remove();
    confirmationModal.close();
});

document.querySelector('#cancelBtn').addEventListener('click', () => {
    confirmationModal.close();
});

function createTaskElement(status, id, text) {
    const li = document.createElement('li');
    li.classList.add(status);
    li.dataset.id = id;

    const btnCheck = document.createElement('button');
    btnCheck.classList.add('check');
    btnCheck.setAttribute('type', 'button');

    const imgCheck = document.createElement('img');

    if (status === 'completed') {
        imgCheck.setAttribute('src', '/assets/icon/undo.svg');
        imgCheck.setAttribute('alt', 'Desfazer');
    } else {
        imgCheck.setAttribute('src', '/assets/icon/check.svg');
        imgCheck.setAttribute('alt', 'Concluir tarefa');
    }

    btnCheck.append(imgCheck);
    li.append(btnCheck);

    const spanText = document.createElement('span');
    spanText.textContent = text;
    li.append(spanText);

    const btnDelete = document.createElement('button');
    btnDelete.classList.add('delete');
    btnDelete.setAttribute('type', 'button');
    
    const imgDelete = document.createElement('img');
    imgDelete.setAttribute('src', '/assets/icon/trash-2.svg');
    imgDelete.setAttribute('alt', 'Excluir tarefa');
    
    btnDelete.append(imgDelete);
    li.append(btnDelete);

    taskList.append(li);
}

// renderizando o localStorage e transformando em "li"
function renderTasks(tasks) {
    tasks.forEach(task => {
        createTaskElement(task.status, task.id, task.text);
    });
}

taskForm.addEventListener('submit', event => {
    event.preventDefault();

    const id = crypto.randomUUID(); // id único
    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    const inputValue = taskInput.value.trim();
    const processedInput = inputValue.charAt(0).toUpperCase() + inputValue.slice(1);

    if (inputValue === '') {
        errorText.innerText = 'Você não digitou sua tarefa!';
        errorSpan.classList.add('visible'); // mostra
        return;
    }

    if (!regex.test(inputValue)) {
        errorText.innerText = 'A tarefa não pode conter números ou símbolos!';
        errorSpan.classList.add('visible');
        return;
    }

    createTaskElement('pending', id, processedInput);

    savedTasks.push({ id: id, text: processedInput, status: 'pending' });
    saveToStorage();

    errorSpan.classList.remove('visible'); // esconde (mas mantém o espaço)
    taskInput.value = '';
});

// Adicionando evento na ul e delegando o evento para os filhos
taskList.addEventListener('click', event => {
    const clickedElement = event.target;
    const button = clickedElement.closest('button');

    if (!button) return;

    const taskElement = button.parentElement; // pegando a "li" do botão clicado
    const taskId = taskElement.dataset.id; // pegando o id da tarefa da lista

    function toggleTaskStatus(newStatus, oldStatus, src, alt) {
        const clickedImg = button.querySelector('img');

        savedTasks.forEach(task => {
            if (task.id === taskId) {
                task.status = newStatus;
                saveToStorage();
            }
        });

        taskElement.classList.toggle(oldStatus);
        taskElement.classList.toggle(newStatus);

        clickedImg.setAttribute('src', src);
        clickedImg.setAttribute('alt', alt);
    }

    if (button.classList.contains('delete')) {
        const taskItemToDelete = savedTasks.find(task => task.id === taskId);

        if (taskItemToDelete) {
            idToDelete = taskId; // guarda pra usar depois
            modalText.innerText = `Excluir a tarefa ${taskItemToDelete.text}?`;
            confirmationModal.showModal();
        }
    }

    if (button.classList.contains('check')) {
        if (taskElement.classList.contains('pending')) {
            toggleTaskStatus('completed', 'pending', '/assets/icon/undo.svg', 'Desfazer');
        } else {
            toggleTaskStatus('pending', 'completed', '/assets/icon/check.svg', 'Concluir tarefa');
        }
    }
});
// localStorage.clear();