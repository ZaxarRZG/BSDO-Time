
var GITHUB_CONFIG = {
    apiBase: 'https://api.github.com',
    token: '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',
    gistId: null,
    gistDescription: 'World Time - Timer Entries',
    gistFilename: 'timer-data.json'
};

var elements = {};


function initGitHubAPI() {
    console.log('🔗 Инициализация GitHub API...');
    
    elements.tableBody = document.querySelector('tbody');
    elements.addBtn = Array.from(document.querySelectorAll('button')).find(function(btn) {
        return btn.textContent.includes('Добавить');
    });
    elements.refreshBtn = Array.from(document.querySelectorAll('button')).find(function(btn) {
        return btn.textContent.includes('Обновить');
    });
    elements.nameInput = document.querySelector('input[type="text"]');
    elements.timeInput = document.querySelector('input[type="time"]');
    elements.dateInput = document.querySelector('input[type="date"]');
    elements.noDateCheckbox = document.querySelector('input[type="checkbox"]');
    
    if (elements.addBtn) {
        elements.addBtn.addEventListener('click', handleAddEntry);
    }
    if (elements.refreshBtn) {
        elements.refreshBtn.addEventListener('click', loadEntries);
    }
    
    loadEntries();
    console.log('✅ GitHub API инициализирован');
}

// ===== ЗАПРОС К API =====
function githubRequest(endpoint, method, body) {
    var url = GITHUB_CONFIG.apiBase + endpoint;
    var headers = {
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    };
    
    if (GITHUB_CONFIG.token) {
        headers['Authorization'] = 'Bearer ' + GITHUB_CONFIG.token;
    }
    
    var options = {
        method: method || 'GET',
        headers: headers
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    return fetch(url, options).then(function(response) {
        if (!response.ok) {
            return response.json().then(function(err) {
                throw new Error(err.message || 'HTTP ' + response.status);
            });
        }
        return response.json();
    });
}

// ===== ПОИСК ИЛИ СОЗДАНИЕ GIST =====
function findOrCreateGist() {
    if (GITHUB_CONFIG.gistId) {
        return Promise.resolve(GITHUB_CONFIG.gistId);
    }
    
    return githubRequest('/gists').then(function(gists) {
        var found = gists.find(function(gist) {
            return gist.description === GITHUB_CONFIG.gistDescription;
        });
        
        if (found) {
            GITHUB_CONFIG.gistId = found.id;
            return found.id;
        }
        
        return createNewGist();
    });
}

// ===== СОЗДАНИЕ GIST =====
function createNewGist() {
    var gistData = {
        description: GITHUB_CONFIG.gistDescription,
        public: false,
        files: {}
    };
    
    gistData.files[GITHUB_CONFIG.gistFilename] = {
        content: JSON.stringify({ entries: [], createdAt: new Date().toISOString() }, null, 2)
    };
    
    return githubRequest('/gists', 'POST', gistData).then(function(gist) {
        GITHUB_CONFIG.gistId = gist.id;
        return gist.id;
    });
}

// ===== ЗАГРУЗКА ЗАПИСЕЙ =====
function loadEntries() {
    if (!elements.tableBody) return;
    
    elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">⏳ Загрузка...</td></tr>';
    
    if (!GITHUB_CONFIG.token) {
        showDemoData();
        return;
    }
    
    findOrCreateGist()
        .then(function(gistId) {
            return githubRequest('/gists/' + gistId);
        })
        .then(function(gist) {
            var file = gist.files[GITHUB_CONFIG.gistFilename];
            if (!file) throw new Error('Файл не найден');
            
            var data = JSON.parse(file.content);
            renderTable(data.entries || []);
        })
        .catch(function(error) {
            console.error('❌ Ошибка:', error);
            elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">' + error.message + '</td></tr>';
        });
}

// ===== ОТРИСОВКА ТАБЛИЦЫ - ИСПРАВЛЕНО =====
function renderTable(entries) {
    if (!elements.tableBody) return;
    
    elements.tableBody.innerHTML = '';
    
    if (entries.length === 0) {
        elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">📭 Нет записей</td></tr>';
        return;
    }
    
    entries.forEach(function(entry, index) {
        var row = elements.tableBody.insertRow();
        row.innerHTML = 
            '<td>' + (index + 1) + '</td>' +
            '<td>' + (entry.name || '—') + '</td>' +
            '<td>' + (entry.time || '—') + '</td>' +
            '<td>' + (entry.noDate ? 'Без даты' : (entry.date || '—')) + '</td>' +
            '<td>' + (entry.repeat ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw-icon lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>') + '</td>' +
            '<td>' +
                '<button class="btn-edit" data-index="' + index + '"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-brush-icon lucide-brush"><path d="m11 10 3 3"/><path d="M6.5 21A3.5 3.5 0 1 0 3 17.5a2.62 2.62 0 0 1-.708 1.792A1 1 0 0 0 3 21z"/><path d="M9.969 17.031 21.378 5.624a1 1 0 0 0-3.002-3.002L6.967 14.031"/></svg></button>' +
                '<button class="btn-delete" data-index="' + index + '"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' +
            '</td>';
    });
    
    // ✅ ИСПРАВЛЕНО: elements.tableBody вместо row
    elements.tableBody.querySelectorAll('.btn-edit').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = parseInt(this.getAttribute('data-index'));
            editEntry(idx);
        });
    });
    
    elements.tableBody.querySelectorAll('.btn-delete').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = parseInt(this.getAttribute('data-index'));
            deleteEntry(idx);
        });
    });
}

// ===== ДОБАВЛЕНИЕ =====
function handleAddEntry() {
    if (!GITHUB_CONFIG.token) {
        alert('Установите токен!');
        return;
    }
    
    var name = elements.nameInput ? elements.nameInput.value.trim() : '';
    var time = elements.timeInput ? elements.timeInput.value : '';
    var date = elements.dateInput ? elements.dateInput.value : '';
    var noDate = elements.noDateCheckbox ? elements.noDateCheckbox.checked : false;
    var repeat = false;
    
    if (!name || !time) {
        alert('Заполните имя и время!');
        return;
    }
    
    var newEntry = {
        id: Date.now().toString(),
        name: name,
        time: time,
        date: noDate ? null : date,
        noDate: noDate,
        repeat: repeat,
        createdAt: new Date().toISOString()
    };
    
    if (elements.addBtn) {
        elements.addBtn.disabled = true;
        elements.addBtn.textContent = '⏳...';
    }
    
    findOrCreateGist()
        .then(function(gistId) {
            return githubRequest('/gists/' + gistId).then(function(gist) {
                var file = gist.files[GITHUB_CONFIG.gistFilename];
                var data = JSON.parse(file.content);
                if (!data.entries) data.entries = [];
                data.entries.unshift(newEntry);
                data.updatedAt = new Date().toISOString();
                
                return githubRequest('/gists/' + gistId, 'PATCH', {
                    files: (function() {
                        var f = {};
                        f[GITHUB_CONFIG.gistFilename] = { content: JSON.stringify(data, null, 2) };
                        return f;
                    })()
                });
            });
        })
        .then(function() {
            if (elements.nameInput) elements.nameInput.value = '';
            if (elements.timeInput) elements.timeInput.value = '';
            if (elements.dateInput) elements.dateInput.value = '';
            loadEntries();
        })
        .catch(function(error) {
            alert('Ошибка: ' + error.message);
        })
        .finally(function() {
            if (elements.addBtn) {
                elements.addBtn.disabled = false;
                elements.addBtn.textContent = 'Добавить в базу';
            }
        });
}

// ===== РЕДАКТИРОВАНИЕ =====
function editEntry(index) {
    console.log(' Edit index:', index);
    
    findOrCreateGist().then(function(gistId) {
        return githubRequest('/gists/' + gistId).then(function(gist) {
            var file = gist.files[GITHUB_CONFIG.gistFilename];
            var data = JSON.parse(file.content);
            
            if (!data.entries || !data.entries[index]) {
                throw new Error('Запись не найдена');
            }
            
            var entry = data.entries[index];
            var newName = prompt('Новое имя:', entry.name);
            
            if (!newName || !newName.trim()) return;
            
            entry.name = newName.trim();
            entry.updatedAt = new Date().toISOString();
            
            var files = {};
            files[GITHUB_CONFIG.gistFilename] = { content: JSON.stringify(data, null, 2) };
            
            return githubRequest('/gists/' + gistId, 'PATCH', { files: files });
        });
    }).then(function() {
        console.log('✅ Edited');
        loadEntries();
    }).catch(function(error) {
        console.error('❌ Edit error:', error);
        alert('Ошибка: ' + error.message);
    });
}

// ===== УДАЛЕНИЕ =====
function deleteEntry(index) {
    console.log(' Delete index:', index);
    
    if (!confirm('Удалить запись?')) return;
    
    findOrCreateGist().then(function(gistId) {
        return githubRequest('/gists/' + gistId).then(function(gist) {
            var file = gist.files[GITHUB_CONFIG.gistFilename];
            var data = JSON.parse(file.content);
            
            if (!data.entries || !data.entries[index]) {
                throw new Error('Запись не найдена');
            }
            
            data.entries.splice(index, 1);
            data.updatedAt = new Date().toISOString();
            
            var files = {};
            files[GITHUB_CONFIG.gistFilename] = { content: JSON.stringify(data, null, 2) };
            
            return githubRequest('/gists/' + gistId, 'PATCH', { files: files });
        });
    }).then(function() {
        console.log('✅ Deleted');
        loadEntries();
    }).catch(function(error) {
        console.error('❌ Delete error:', error);
        alert('Ошибка: ' + error.message);
    });
}

// ===== ВСПОМОГАТЕЛЬНЫЕ =====
function showDemoData() {
    renderTable([
        { name: 'Утро ☕', time: '08:00', date: '2026-01-15', noDate: false, repeat: true },
        { name: 'Обед 🍽️', time: '13:30', date: null, noDate: true, repeat: false }
    ]);
}

// ===== INIT =====
window.GitHubAPI = {
    init: initGitHubAPI,
    refresh: loadEntries,
    setToken: function(token) {
        GITHUB_CONFIG.token = token;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initGitHubAPI, 1000);
});