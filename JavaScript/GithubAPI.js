// ===== GitHub GISTS API =====
var GITHUB_CONFIG = {
    apiBase: 'https://api.github.com',
    token: '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',
    gistId: null,
    gistDescription: 'World Time - Timer Entries',
    gistFilename: 'timer-data.json',
    autoRefreshInterval: null,
    checkTimerInterval: null
};

var elements = {};
var timerEntries = [];


function initGitHubAPI() {
    console.log('🔗 Инициализация GitHub API...');
    
    elements.tableBody = document.querySelector('tbody');
    elements.addBtn = Array.from(document.querySelectorAll('button')).find(function(btn) {
        return btn.textContent.includes('Добавить');
    });
    elements.refreshBtn = Array.from(document.querySelectorAll('button')).find(function(btn) {
        return btn.textContent.includes('Обновить') || btn.textContent.includes('обновить');
    });
    elements.nameInput = document.querySelector('input[type="text"]');
    elements.timeInput = document.querySelector('input[type="time"]');
    elements.dateInput = document.querySelector('input[type="date"]');
    elements.noDateCheckbox = document.querySelector('input[type="checkbox"]');
    
    if (elements.addBtn) {
        elements.addBtn.addEventListener('click', handleAddEntry);
    }
    
    if (elements.refreshBtn) {
        elements.refreshBtn.addEventListener('click', function() {
            console.log('🔄 Ручное обновление...');
            loadEntries();
        });
        console.log('✅ Кнопка "Обновить" привязана');
    }
    
    // Авто-обновление каждые 60 секунд
    startAutoRefresh();
    
    // Проверка таймеров каждые 10 секунд
    startTimerCheck();
    
    loadEntries();
    console.log('✅ GitHub API инициализирован');
}

// ===== АВТО-ОБНОВЛЕНИЕ =====
function startAutoRefresh() {
    if (GITHUB_CONFIG.autoRefreshInterval) {
        clearInterval(GITHUB_CONFIG.autoRefreshInterval);
    }
    
    GITHUB_CONFIG.autoRefreshInterval = setInterval(function() {
        console.log('🔄 Авто-обновление данных...');
        loadEntries(false); // false = не показывать загрузку
    }, 60000); // 60 секунд
    
    console.log('⏱️ Авто-обновление включено (каждую минуту)');
}

// ===== ПРОВЕРКА ТАЙМЕРОВ =====
function startTimerCheck() {
    if (GITHUB_CONFIG.checkTimerInterval) {
        clearInterval(GITHUB_CONFIG.checkTimerInterval);
    }
    
    GITHUB_CONFIG.checkTimerInterval = setInterval(function() {
        checkTimers();
    }, 10000); // Проверяем каждые 10 секунд
    
    console.log('⏰ Проверка таймеров включена (каждые 10 сек)');
}

// ===== ПРОВЕРКА АКТИВНЫХ ТАЙМЕРОВ =====
function checkTimers() {
    if (timerEntries.length === 0) return;
    
    var now = new Date();
    var currentTime = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
    var currentDate = now.toISOString().split('T')[0];
    var currentDay = now.getDay(); // 0 = воскресенье, 1 = понедельник, и т.д.
    
    timerEntries.forEach(function(entry) {
        // Проверяем дату
        if (entry.noDate || entry.date === currentDate) {
            // Проверяем время
            if (entry.time === currentTime) {
                // Проверяем повтор (день недели)
                if (entry.repeat) {
                    // Если повтор включён - проверяем день недели
                    var entryDay = new Date(entry.date || currentDate).getDay();
                    if (entryDay === currentDay || entry.noDate) {
                        triggerTimer(entry);
                    }
                } else {
                    // Если без повтора - проверяем что ещё не сработал сегодня
                    if (!entry.triggeredToday || entry.triggeredToday !== currentDate) {
                        triggerTimer(entry);
                        // Отмечаем что сработал сегодня
                        entry.triggeredToday = currentDate;
                        saveTriggeredStatus(entry);
                    }
                }
            }
        }
    });
}

// ===== ЗАПУСК ТАЙМЕРА =====
function triggerTimer(entry) {
    console.log('⏰ ЗАПУСК ТАЙМЕРА:', entry.name, entry.time);
    
    // Показываем уведомление
    showNotification('⏰ ' + entry.name, 'Время: ' + entry.time);
    
    // Если есть функция запуска таймера из Script.js
    if (typeof window.startCountdown === 'function') {
        // Запускаем таймер на 10 секунд как тест
        window.startCountdown(10);
    }
    
    // Звуковой сигнал (опционально)
    playAlarmSound();
}

// ===== УВЕДОМЛЕНИЕ =====
function showNotification(title, message) {
    // Создаём элемент уведомления
    var notification = document.createElement('div');
    notification.style.cssText = 
        'position:fixed;top:20px;right:20px;background:#2196f3;color:white;' +
        'padding:20px;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.3);' +
        'z-index:10000;animation:slideIn 0.3s ease;max-width:300px;';
    notification.innerHTML = 
        '<h3 style="margin:0 0 10px 0;">' + title + '</h3>' +
        '<p style="margin:0;">' + message + '</p>';
    
    document.body.appendChild(notification);
    
    // Удаляем через 5 секунд
    setTimeout(function() {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(function() {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// ===== ЗВУКОВОЙ СИГНАЛ =====
function playAlarmSound() {
    try {
        var audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
        audio.play().catch(function() {
            console.log('🔇 Звук заблокирован браузером');
        });
    } catch(e) {
        console.log('❌ Ошибка воспроизведения звука:', e);
    }
}

// ===== СОХРАНЕНИЕ СТАТУСА =====
function saveTriggeredStatus(entry) {
    // Сохраняем в localStorage чтобы не срабатывал дважды
    if (!window.triggeredTimers) {
        window.triggeredTimers = {};
    }
    window.triggeredTimers[entry.id] = new Date().toISOString();
    localStorage.setItem('triggeredTimers', JSON.stringify(window.triggeredTimers));
}


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


function loadEntries(showLoading) {
    if (!elements.tableBody) return;
    
    if (showLoading !== false) {
        elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">⏳ Загрузка...</td></tr>';
    }
    
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
            timerEntries = data.entries || []; // Сохраняем для проверки
            renderTable(timerEntries);
            
            console.log('✅ Загружено записей:', timerEntries.length);
        })
        .catch(function(error) {
            console.error('❌ Ошибка:', error);
            if (showLoading !== false) {
                elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">' + error.message + '</td></tr>';
            }
        });
}


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

//d
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


function editEntry(index) {
    console.log('✏️ Edit index:', index);
    
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


function deleteEntry(index) {
    console.log('🗑️ Delete index:', index);
    
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


function showDemoData() {
    timerEntries = [
        { name: 'Утро ☕', time: '08:00', date: '2026-01-15', noDate: false, repeat: true },
        { name: 'Обед 🍽️', time: '13:30', date: null, noDate: true, repeat: false }
    ];
    renderTable(timerEntries);
}


function stopAutoRefresh() {
    if (GITHUB_CONFIG.autoRefreshInterval) {
        clearInterval(GITHUB_CONFIG.autoRefreshInterval);
        GITHUB_CONFIG.autoRefreshInterval = null;
        console.log('⏹️ Авто-обновление остановлено');
    }
}

function stopTimerCheck() {
    if (GITHUB_CONFIG.checkTimerInterval) {
        clearInterval(GITHUB_CONFIG.checkTimerInterval);
        GITHUB_CONFIG.checkTimerInterval = null;
        console.log('⏹️ Проверка таймеров остановлена');
    }
}


window.GitHubAPI = {
    init: initGitHubAPI,
    refresh: loadEntries,
    stop: function() {
        stopAutoRefresh();
        stopTimerCheck();
    },
    setToken: function(token) {
        GITHUB_CONFIG.token = token;
    },
    getEntries: function() {
        return timerEntries;
    }
};


var style = document.createElement('style');
style.textContent = 
    '@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }' +
    '@keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }';
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initGitHubAPI, 1000);
});


window.addEventListener('beforeunload', function() {
    stopAutoRefresh();
    stopTimerCheck();
});