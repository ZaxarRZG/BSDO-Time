var GITHUB_CONFIG = {
    apiBase: 'https://api.github.com',
    token: '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', 
    gistId: null,
    gistDescription: 'World Time - Timer Entries',
    gistFilename: 'timer-data.json',
    autoRefreshInterval: null,
    checkTimerInterval: null,
    activeTimers: {}
};

var elements = {};
var timerEntries = [];

//ИНИЦИАЛИЗАЦИЯ
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
    
    startAutoRefresh();
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
        loadEntries(false);
    }, 60000);
    
    console.log('⏱️ Авто-обновление включено (каждую минуту)');
}

// ===== ПРОВЕРКА ТАЙМЕРОВ =====
function startTimerCheck() {
    if (GITHUB_CONFIG.checkTimerInterval) {
        clearInterval(GITHUB_CONFIG.checkTimerInterval);
    }
    
    GITHUB_CONFIG.checkTimerInterval = setInterval(function() {
        checkTimers();
    }, 5000);
    
    console.log('⏰ Проверка таймеров включена (каждые 5 сек)');
}

// ===== ПРОВЕРКА И ВОЗВРАТ К ВРЕМЕНИ =====
function checkAndResumeMoscowTime() {
    console.log('🔍 Проверка активных таймеров...');
    
    var today = new Date().toISOString().split('T')[0];
    var hasActiveTimers = false;
    
    if (timerEntries.length > 0) {
        timerEntries.forEach(function(entry) {
            var isToday = entry.noDate || entry.date === today;
            var notTriggered = entry.triggeredToday !== today;
            
            if (isToday && notTriggered) {
                hasActiveTimers = true;
            }
        });
    }
    
    if (!hasActiveTimers && Object.keys(GITHUB_CONFIG.activeTimers).length === 0) {
        console.log('✅ Активных таймеров нет - возврат к московскому времени');
        resumeMoscowTime();
    } else {
        console.log('⏱️ Есть активные таймеры:', hasActiveTimers);
    }
}

// ===== ВОЗВРАТ К МОСКОВСКОМУ ВРЕМЕНИ =====
function resumeMoscowTime() {
    console.log('🕐 Возврат к московскому времени...');
    
    if (typeof window.resetTimer === 'function') {
        window.resetTimer();
    }
    
    var bsodOverlay = document.getElementById('bsod-overlay');
    if (bsodOverlay) {
        bsodOverlay.classList.add('hidden');
        bsodOverlay.style.display = 'none';
    }
    
    if (typeof window.exitFullscreen === 'function') {
        window.exitFullscreen();
    }
    
    document.body.style.overflow = '';
}

// ===== ПРОВЕРКА ТАЙМЕРОВ =====
function checkTimers() {
    if (timerEntries.length === 0) {
        checkAndResumeMoscowTime();
        return;
    }
    
    var now = new Date();
    var currentDate = now.toISOString().split('T')[0];
    var currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    
    var hasActiveTimers = false;
    
    timerEntries.forEach(function(entry, index) {
        if (entry.triggeredToday === currentDate) {
            return;
        }
        
        if (GITHUB_CONFIG.activeTimers[entry.id]) {
            hasActiveTimers = true;
            return;
        }
        
        var isToday = false;
        if (entry.noDate) {
            isToday = true;
        } else if (entry.date === currentDate) {
            isToday = true;
        }
        
        if (!isToday) {
            return;
        }
        
        hasActiveTimers = true;
        
        var timeParts = entry.time.split(':');
        var targetHours = parseInt(timeParts[0]);
        var targetMinutes = parseInt(timeParts[1]);
        var targetTime = targetHours * 3600 + targetMinutes * 60;
        
        var diffSeconds = targetTime - currentTime;
        
        if (diffSeconds < 0) {
            console.log('⏭️ Время прошло:', entry.name, entry.time);
            return;
        }
        
        if (diffSeconds <= 5) {
            console.log('⏰ ТАЙМЕР СРАБОТАЛ:', entry.name, entry.time);
            triggerTimer(entry, index);
            entry.triggeredToday = currentDate;
            scheduleAutoDelete(entry, index);
            return;
        }
        
        if (diffSeconds > 5) {
            console.log('🚀 Запуск обратного отсчёта:', entry.name, 'через', diffSeconds, 'сек');
            startCountdownTimer(entry, index, diffSeconds);
        }
    });
    
    if (!hasActiveTimers && Object.keys(GITHUB_CONFIG.activeTimers).length === 0) {
        console.log('✅ Все таймеры завершены - возврат к времени');
        checkAndResumeMoscowTime();
    }
}

// ===== ЗАПУСК ОБРАТНОГО ОТСЧЁТА =====
function startCountdownTimer(entry, index, durationSeconds) {
    console.log('⏱️ Обратный отсчёт:', entry.name, durationSeconds, 'секунд');
    
    var modal = document.getElementById('ModalOverlay');
    if (modal) {
        modal.classList.remove('active');
    }
    
    if (typeof window.startCountdown === 'function') {
        window.startCountdown(Math.floor(durationSeconds));
    }
    
    GITHUB_CONFIG.activeTimers[entry.id] = {
        entry: entry,
        index: index,
        startTime: Date.now(),
        duration: durationSeconds
    };
    
    setTimeout(function() {
        console.log('✅ Таймер завершён:', entry.name);
        delete GITHUB_CONFIG.activeTimers[entry.id];
    }, durationSeconds * 1000);
}

// ===== ЗАПУСК ТАЙМЕРА =====
function triggerTimer(entry, index) {
    console.log('🔔 СРАБОТАЛ ТАЙМЕР:', entry.name);
    
    highlightEntry(index);
    
    if (typeof window.startCountdown === 'function') {
        window.startCountdown(10);
    }
}

// ===== ПОДСВЕТКА =====
function highlightEntry(index) {
    if (!elements.tableBody) return;
    
    var rows = elements.tableBody.querySelectorAll('tr');
    if (rows[index]) {
        rows[index].style.background = '#4caf50';
        rows[index].style.transition = 'background 0.5s';
        
        setTimeout(function() {
            rows[index].style.background = '';
        }, 3000);
    }
}

// ===== АВТО-УДАЛЕНИЕ =====
function scheduleAutoDelete(entry, index) {
    console.log('🗑️ Авто-удаление через 15 сек:', entry.name);
    
    setTimeout(function() {
        autoDeleteEntry(entry, index);
    }, 15000);
}

function autoDeleteEntry(entry, index) {
    console.log('🗑️ Удаление записи:', entry.name);
    
    var deleteFromGitHub = function() {
        if (!GITHUB_CONFIG.token) {
            timerEntries.splice(index, 1);
            renderTable(timerEntries);
            checkAndResumeMoscowTime();
            return Promise.resolve();
        }
        
        return findOrCreateGist()
            .then(function(gistId) {
                return githubRequest('/gists/' + gistId).then(function(gist) {
                    var file = gist.files[GITHUB_CONFIG.gistFilename];
                    var data = JSON.parse(file.content);
                    
                    var entryIndex = -1;
                    for (var i = 0; i < data.entries.length; i++) {
                        if (data.entries[i].id === entry.id) {
                            entryIndex = i;
                            break;
                        }
                    }
                    
                    if (entryIndex >= 0) {
                        data.entries.splice(entryIndex, 1);
                        data.updatedAt = new Date().toISOString();
                        
                        var files = {};
                        files[GITHUB_CONFIG.gistFilename] = { 
                            content: JSON.stringify(data, null, 2) 
                        };
                        
                        return githubRequest('/gists/' + gistId, 'PATCH', { files: files });
                    }
                });
            })
            .then(function() {
                console.log('✅ Удалено из GitHub');
                loadEntries(false).then(function() {
                    checkAndResumeMoscowTime();
                });
            })
            .catch(function(error) {
                console.error('❌ Ошибка удаления:', error);
                timerEntries.splice(index, 1);
                renderTable(timerEntries);
                checkAndResumeMoscowTime();
            });
    };
    
    setTimeout(deleteFromGitHub, 15000);
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
function loadEntries(showLoading) {
    if (!elements.tableBody) return;
    
    if (showLoading !== false) {
        elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">⏳ Загрузка...</td></tr>';
    }
    
    if (!GITHUB_CONFIG.token) {
        showDemoData();
        return Promise.resolve();
    }
    
    return findOrCreateGist()
        .then(function(gistId) {
            return githubRequest('/gists/' + gistId);
        })
        .then(function(gist) {
            var file = gist.files[GITHUB_CONFIG.gistFilename];
            if (!file) throw new Error('Файл не найден');
            
            var data = JSON.parse(file.content);
            timerEntries = data.entries || [];
            renderTable(timerEntries);
            
            console.log('✅ Загружено записей:', timerEntries.length);
            checkAndResumeMoscowTime();
        })
        .catch(function(error) {
            console.error('❌ Ошибка:', error);
            if (showLoading !== false) {
                elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">' + error.message + '</td></tr>';
            }
        });
}

// ===== ОТРИСОВКА ТАБЛИЦЫ =====
function renderTable(entries) {
    if (!elements.tableBody) return;
    
    elements.tableBody.innerHTML = '';
    
    if (entries.length === 0) {
        elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">📭 Нет записей</td></tr>';
        return;
    }
    
    var today = new Date().toISOString().split('T')[0];
    var now = new Date();
    var currentTime = now.getHours() * 3600 + now.getMinutes() * 60;
    
    entries.forEach(function(entry, index) {
        var row = elements.tableBody.insertRow();
        
        var isToday = entry.noDate || entry.date === today;
        var isFuture = false;
        var timeLeft = '';
        
        if (isToday && !entry.triggeredToday) {
            var timeParts = entry.time.split(':');
            var targetTime = parseInt(timeParts[0]) * 3600 + parseInt(timeParts[1]) * 60;
            var diff = targetTime - currentTime;
            
            if (diff > 0) {
                isFuture = true;
                var hours = Math.floor(diff / 3600);
                var mins = Math.floor((diff % 3600) / 60);
                timeLeft = 'через ' + (hours > 0 ? hours + ' ч ' : '') + mins + ' мин';
                row.style.background = 'rgba(33, 150, 243, 0.2)';
            } else if (diff <= 0 && diff > -300) {
                row.style.background = 'rgba(255, 152, 0, 0.2)';
                timeLeft = 'время прошло';
            }
        }
        
        if (entry.triggeredToday === today) {
            row.style.background = 'rgba(76, 175, 80, 0.2)';
        }
        
        var timeCell = entry.time || '—';
        if (timeLeft) {
            timeCell += ' <small style="color:#2196f3">(' + timeLeft + ')</small>';
        }
        
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
    
    var today = new Date().toISOString().split('T')[0];
    
    var newEntry = {
        id: Date.now().toString(),
        name: name,
        time: time,
        date: noDate ? null : date,
        noDate: noDate,
        repeat: repeat,
        triggeredToday: null,
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
        loadEntries();
    }).catch(function(error) {
        alert('Ошибка: ' + error.message);
    });
}

// ===== УДАЛЕНИЕ =====
function deleteEntry(index) {
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
        loadEntries();
    }).catch(function(error) {
        alert('Ошибка: ' + error.message);
    });
}

// ===== ВСПОМОГАТЕЛЬНЫЕ =====
function showDemoData() {
    var today = new Date().toISOString().split('T')[0];
    timerEntries = [
        { name: 'Утро ☕', time: '08:00', date: today, noDate: false, repeat: false, triggeredToday: null },
        { name: 'Обед 🍽️', time: '13:30', date: null, noDate: true, repeat: false, triggeredToday: null }
    ];
    renderTable(timerEntries);
}

function stopAutoRefresh() {
    if (GITHUB_CONFIG.autoRefreshInterval) {
        clearInterval(GITHUB_CONFIG.autoRefreshInterval);
    }
}

function stopTimerCheck() {
    if (GITHUB_CONFIG.checkTimerInterval) {
        clearInterval(GITHUB_CONFIG.checkTimerInterval);
    }
}

// ===== INIT =====
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

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initGitHubAPI, 1000);
});

window.addEventListener('beforeunload', function() {
    stopAutoRefresh();
    stopTimerCheck();
});