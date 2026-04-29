var GITHUB_CONFIG = {
    apiBase: 'https://api.github.com',
    token: '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',
    gistId: null,
    gistDescription: 'World Time - Timer Entries',
    gistFilename: 'timer-data.json'
};

var elements = {
    nameInput: null,
    timeInput: null,
    dateInput: null,
    noDateCheckbox: null,
    repeatCheckbox: null,
    addBtn: null,
    refreshBtn: null,
    tableBody: null,
    loadingRow: null
};


function initGitHubAPI() {
    console.log('Инициализация GitHub API...');
    
    // Получаем элементы
    elements.nameInput = document.querySelector('input[placeholder*="Имя"], input[type="text"]');
    elements.timeInput = document.getElementById('TimeInput') || document.querySelector('input[type="time"]');
    elements.dateInput = document.querySelector('input[type="date"]');
    elements.noDateCheckbox = document.querySelector('input[type="checkbox"]');
    elements.repeatCheckbox = document.querySelectorAll('input[type="checkbox"]')[1] || elements.noDateCheckbox;
    elements.tableBody = document.querySelector('tbody');
    

    var buttons = document.querySelectorAll('button');
    buttons.forEach(function(btn) {
        if (btn.textContent.includes('Добавить')) {
            elements.addBtn = btn;
        }
        if (btn.textContent.includes('Обновить')) {
            elements.refreshBtn = btn;
        }
    });
    
    if (!elements.tableBody) {
        console.error('❌ Не найдена таблица (tbody)');
        return;
    }
    
    // Привязка кнопок
    if (elements.addBtn) {
        elements.addBtn.addEventListener('click', handleAddEntry);
        console.log('✅ Кнопка "Добавить" привязана');
    }
    
    if (elements.refreshBtn) {
        elements.refreshBtn.addEventListener('click', function() {
            loadEntries();
        });
        console.log('✅ Кнопка "Обновить" привязана');
    }
    
    // Чекбокс "Без даты"
    if (elements.noDateCheckbox) {
        elements.noDateCheckbox.addEventListener('change', function() {
            if (elements.dateInput) {
                elements.dateInput.disabled = this.checked;
            }
        });
    }
    

    loadEntries();
    
    console.log(' GitHub API готов к работе');
}

// api req
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
    
    return fetch(url, options)
        .then(function(response) {
            var rateLimit = response.headers.get('X-RateLimit-Remaining');
            console.log('API лимиты: осталось ' + rateLimit + ' запросов');
            
            if (!response.ok) {
                return response.json().then(function(err) {
                    throw new Error(err.message || 'GitHub API error: ' + response.status);
                });
            }
            return response.json();
        });
}


function findOrCreateGist() {
    if (GITHUB_CONFIG.gistId) {
        return Promise.resolve(GITHUB_CONFIG.gistId);
    }
    
    return githubRequest('/gists')
        .then(function(gists) {

            var found = gists.find(function(gist) {
                return gist.description === GITHUB_CONFIG.gistDescription;
            });
            
            if (found) {
                console.log('Найден Gist:', found.id);
                GITHUB_CONFIG.gistId = found.id;
                return found.id;
            }
            

            return createNewGist();
        });
}


function createNewGist() {
    var gistData = {
        description: GITHUB_CONFIG.gistDescription,
        public: false,
        files: {}
    };
    
    gistData.files[GITHUB_CONFIG.gistFilename] = {
        content: JSON.stringify({ entries: [], createdAt: new Date().toISOString() }, null, 2)
    };
    
    return githubRequest('/gists', 'POST', gistData)
        .then(function(gist) {
            console.log('✅ Gist создан:', gist.id);
            GITHUB_CONFIG.gistId = gist.id;
            return gist.id;
        });
}


function loadEntries() {
    if (!elements.tableBody) return;
    
    // show load
    showLoading();
    

    if (!GITHUB_CONFIG.token) {
        console.warn('⚠️ Токен не установлен - демо режим');
        showDemoData();
        return;
    }
    
    findOrCreateGist()
        .then(function(gistId) {
            return githubRequest('/gists/' + gistId);
        })
        .then(function(gist) {
            var file = gist.files[GITHUB_CONFIG.gistFilename];
            if (!file) {
                throw new Error('Файл не найден');
            }
            
            var data = JSON.parse(file.content);
            renderTable(data.entries || []);
        })
        .catch(function(error) {
            console.error('Ошибка загрузки:', error);
            showError('Ошибка: ' + error.message);
        });
}

//load table
function renderTable(entries) {
    if (!elements.tableBody) return;
    
    elements.tableBody.innerHTML = '';
    
    if (entries.length === 0) {
        var row = elements.tableBody.insertRow();
        var cell = row.insertCell(0);
        cell.colSpan = 6;
        cell.style.textAlign = 'center';
        cell.textContent = '📭 Нет записей';
        return;
    }
    
    entries.forEach(function(entry, index) {
        var row = elements.tableBody.insertRow();
        row.dataset.index = index;
        
        // №
        var cellNum = row.insertCell(0);
        cellNum.textContent = index + 1;
        
        // Имя
        var cellName = row.insertCell(1);
        cellName.textContent = entry.name || '—';
        
        // Время
        var cellTime = row.insertCell(2);
        cellTime.textContent = entry.time || '—';
        
        // Дата
        var cellDate = row.insertCell(3);
        cellDate.textContent = entry.noDate ? 'Без даты' : (entry.date || '—');
        
        // Повтор
        var cellRepeat = row.insertCell(4);
        cellRepeat.textContent = entry.repeat ? '🔁 Да' : '❌ Нет';
        
        // Кнопочки
        var cellButtons = row.insertCell(5);
        cellButtons.innerHTML = `
            <button class="btn-edit" data-index="${index}" title="Редактировать"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-edit"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" /><path d="M16 5l3 3" /></svg></button>
            <button class="btn-delete" data-index="${index}" title="Удалить"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-trash-x"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 7h16" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /><path d="M10 12l4 4m0 -4l-4 4" /></svg></button>
        `;
    });
    

    attachTableButtons();
}


function attachTableButtons() {
    // Редактирование
    elements.tableBody.querySelectorAll('.btn-edit').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var index = parseInt(this.dataset.index);
            editEntry(index);
        });
    });
    

    elements.tableBody.querySelectorAll('.btn-delete').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var index = parseInt(this.dataset.index);
            deleteEntry(index);
        });
    });
}


function handleAddEntry() {
    if (!GITHUB_CONFIG.token) {
        alert('⚠️ Установите токен в GITHUB_CONFIG.token');
        return;
    }
    
    
    var name = elements.nameInput ? elements.nameInput.value.trim() : '';
    var time = elements.timeInput ? elements.timeInput.value : '';
    var date = elements.dateInput ? elements.dateInput.value : '';
    var noDate = elements.noDateCheckbox ? elements.noDateCheckbox.checked : false;
    var repeat = elements.repeatCheckbox ? elements.repeatCheckbox.checked : false;
    
  
    if (!name) {
        alert('⚠️ Введите имя!');
        if (elements.nameInput) elements.nameInput.focus();
        return;
    }
    
    if (!time) {
        alert('⚠️ Выберите время!');
        if (elements.timeInput) elements.timeInput.focus();
        return;
    }
    
    if (!noDate && !date) {
        alert('⚠️ Выберите дату или отметьте "Без даты"!');
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
        elements.addBtn.textContent = '⏳ Сохранение...';
    }
    
    findOrCreateGist()
        .then(function(gistId) {

            return githubRequest('/gists/' + gistId)
                .then(function(gist) {
                    var file = gist.files[GITHUB_CONFIG.gistFilename];
                    var data = JSON.parse(file.content);
                    
                  
                    if (!data.entries) data.entries = [];
                    data.entries.unshift(newEntry);
                    data.updatedAt = new Date().toISOString();
                    

                    var updateData = {
                        files: {}
                    };
                    updateData.files[GITHUB_CONFIG.gistFilename] = {
                        content: JSON.stringify(data, null, 2)
                    };
                    
                    return githubRequest('/gists/' + gistId, 'PATCH', updateData);
                });
        })
        .then(function() {
            console.log('Запись добавлена');
            
            // Очищаем форму
            if (elements.nameInput) elements.nameInput.value = '';
            if (elements.timeInput) elements.timeInput.value = '';
            if (elements.dateInput) elements.dateInput.value = '';
            if (elements.noDateCheckbox) elements.noDateCheckbox.checked = false;
            if (elements.repeatCheckbox) elements.repeatCheckbox.checked = false;
            
            // Перезагружаем таблицу
            loadEntries();
        })
        .catch(function(error) {
            console.error('Ошибка:', error);
            alert('Ошибка сохранения: ' + error.message);
        })
        .finally(function() {
            if (elements.addBtn) {
                elements.addBtn.disabled = false;
                elements.addBtn.textContent = 'Добавить в базу';
            }
        });
}

function editEntry(index) {
    findOrCreateGist()
        .then(function(gistId) {
            return githubRequest('/gists/' + gistId);
        })
        .then(function(gist) {
            var file = gist.files[GITHUB_CONFIG.gistFilename];
            var data = JSON.parse(file.content);
            var entry = data.entries[index];
            
            if (!entry) return;
            
            var newName = prompt('Новое имя:', entry.name);
            if (newName === null || !newName.trim()) return;
            
            entry.name = newName.trim();
            entry.updatedAt = new Date().toISOString();
            
            var updateData = {
                files: {}
            };
            updateData.files[GITHUB_CONFIG.gistFilename] = {
                content: JSON.stringify(data, null, 2)
            };
            
            return githubRequest('/gists/' + gistId, 'PATCH', updateData);
        })
        .then(function() {
            loadEntries();
        })
        .catch(function(error) {
            alert('Ошибка: ' + error.message);
        });
}


function deleteEntry(index) {
    if (!confirm('🗑️ Удалить эту запись?')) return;
    
    findOrCreateGist()
        .then(function(gistId) {
            return githubRequest('/gists/' + gistId);
        })
        .then(function(gist) {
            var file = gist.files[GITHUB_CONFIG.gistFilename];
            var data = JSON.parse(file.content);
            
            data.entries.splice(index, 1);
            data.updatedAt = new Date().toISOString();
            
            var updateData = {
                files: {}
            };
            updateData.files[GITHUB_CONFIG.gistFilename] = {
                content: JSON.stringify(data, null, 2)
            };
            
            return githubRequest('/gists/' + gistId, 'PATCH', updateData);
        })
        .then(function() {
            loadEntries();
        })
        .catch(function(error) {
            alert('Ошибка: ' + error.message);
        });
}


function showLoading() {
    if (!elements.tableBody) return;
    elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">⏳ Загрузка...</td></tr>';
}

function showError(message) {
    if (!elements.tableBody) return;
    elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#c62828;">' + message + '</td></tr>';
}

function showDemoData() {
    var demoEntries = [
        { id: '1', name: 'Утро ☕', time: '08:00', date: '2026-01-15', noDate: false, repeat: true },
        { id: '2', name: 'Обед 🍽️', time: '13:30', date: null, noDate: true, repeat: false },
        { id: '3', name: 'Тренировка 💪', time: '19:00', date: '2026-01-16', noDate: false, repeat: true }
    ];
    renderTable(demoEntries);
}


window.GitHubAPI = {
    init: initGitHubAPI,
    refresh: loadEntries,
    setToken: function(token) {
        GITHUB_CONFIG.token = token;
        console.log('✅ Токен установлен');
    }
};


document.addEventListener('DOMContentLoaded', function() {

    setTimeout(initGitHubAPI, 1000);
});


if (typeof window.modalOpened === 'function') {
    var originalModalOpened = window.modalOpened;
    window.modalOpened = function() {
        originalModalOpened();
        if (window.GitHubAPI) {
            window.GitHubAPI.refresh();
        }
    };
}

//editbtn
function editEntry(index) {
    findOrCreateGist()
        .then(function(gistId) {
            return githubRequest('/gists/' + gistId);
        })
        .then(function(gist) {
            var file = gist.files[GITHUB_CONFIG.gistFilename];
            if (!file) {
                throw new Error('Файл не найден в Gist');
            }
            
            var data = JSON.parse(file.content);
            var entry = data.entries[index];
            
            if (!entry) {
                throw new Error('Запись #' + index + ' не найдена');
            }
            
            var newName = prompt('Новое имя:', entry.name);
            if (newName === null || !newName.trim()) {
                console.log('Редактирование отменено');
                return;
            }
            
            entry.name = newName.trim();
            entry.updatedAt = new Date().toISOString();
            
            var updateData = {
                files: {}
            };
            updateData.files[GITHUB_CONFIG.gistFilename] = {
                content: JSON.stringify(data, null, 2)
            };
            
            console.log('Сохранение изменений...');
            return githubRequest('/gists/' + gistId, 'PATCH', updateData);
        })
        .then(function() {
            console.log('Запись отредактирована');
            loadEntries();
        })

}

//DELbtn
function deleteEntry(index) {
    if (!confirm('Удалить эту запись?')) {
        console.log('Удаление отменено');
        return;
    }
    
    findOrCreateGist()
        .then(function(gistId) {
            return githubRequest('/gists/' + gistId);
        })
        .then(function(gist) {
            var file = gist.files[GITHUB_CONFIG.gistFilename];
            if (!file) {
                throw new Error('Файл не найден в Gist');
            }
            
            var data = JSON.parse(file.content);
            
            if (!data.entries || !data.entries[index]) {
                throw new Error('Запись #' + index + ' не найдена');
            }
            
            var deletedEntry = data.entries[index];
            console.log('Удаление записи:', deletedEntry.name);
            
            data.entries.splice(index, 1);
            data.updatedAt = new Date().toISOString();
            
            var updateData = {
                files: {}
            };
            updateData.files[GITHUB_CONFIG.gistFilename] = {
                content: JSON.stringify(data, null, 2)
            };
            
            return githubRequest('/gists/' + gistId, 'PATCH', updateData);
        })
        .then(function() {
            console.log('Запись удалена');
            loadEntries();
        })
        .catch(function(error) {
            console.error('Ошибка удаления:', error);
            alert('Ошибка удаления: ' + error.message);
        });
}