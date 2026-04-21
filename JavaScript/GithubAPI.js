/*var GITHUB_CONFIG = {
    apiBase: 'https://api.github.com'
    Token: "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"
    
}

var gitTableBody = null;
var gitTableHead = null;
var addTimeBtn = null;
var timeInput = null;
var dateInput = null;
var repeatCheckbox = null;

function initGitHubAPI() {
    console.log('Инициализация GitHub API...');
    
     gitTableBody = document.getElementById('GitGists');
    gitTableHead = document.getElementById('TbeHead');
    
     addTimeBtn = document.getElementById('AddTimeBtn');
    timeInput = document.getElementById('TimeInput');
    dateInput = document.getElementById('DataInput');
    repeatCheckbox = document.getElementById('CheckboxRepeat');
    
     if (!gitTableBody) {
        console.error('Не найден tbody#GitGists');
        return;
    }

    if (dateInput) {
        var today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    
    if (addTimeBtn) {
        addTimeBtn.addEventListener('click', handleAddTimeEntry);
        console.log('Кнопка "Добавить" привязана');
    }
    
    loadGistsData();
    
    console.log('GitHub API инициализирован');
}*/