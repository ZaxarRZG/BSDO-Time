var GITHUB_CONFIG = {
    apiBase: 'https://api.github.com',
    token: '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', 
    gistId: null,
    gistDescription: 'World Time - Timer Entries',
    gistFilename: 'timer-data.json',
    autoRefreshInterval: null,
    checkTimerInterval: null,
    activeTimers: {} // Хранилище активных таймеров
};

var elements = {};
var timerEntries = [];

// ===== ИНИЦИАЛИЗАЦИЯ =====
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
    
    // Проверка таймеров каждые 5 секунд
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

// ===== ПРОВЕРКА И ЗАПУСК ТАЙМЕРОВ =====
function checkTimers() {
    if (timerEntries.length === 0) return;
    
    var now = new Date();
    var currentDate = now.toISOString().split('T')[0];
    var currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    
    timerEntries.forEach(function(entry, index) {
        // Пропускаем уже сработавшие
        if (entry.triggeredToday === currentDate) {
            return;
        }
        
        // Пропускаем если уже есть активный таймер для этой записи
        if (GITHUB_CONFIG.activeTimers[entry.id]) {
            return;
        }
        
        // Проверяем дату
        var isToday = false;
        if (entry.noDate) {
            isToday = true;
        } else if (entry.date === currentDate) {
            isToday = true;
        }
        
        if (!isToday) {
            return;
        }
        
        // Парсим время записи
        var timeParts = entry.time.split(':');
        var targetHours = parseInt(timeParts[0]);
        var targetMinutes = parseInt(timeParts[1]);
        var targetTime = targetHours * 3600 + targetMinutes * 60;
        
        // Вычисляем разницу в секундах
        var diffSeconds = targetTime - currentTime;
        
        // Если время уже прошло сегодня
        if (diffSeconds < 0) {
            console.log('⏭️ Время прошло:', entry.name, entry.time);
            return;
        }
        
        // Если время наступило (меньше 5 секунд)
        if (diffSeconds <= 5) {
            console.log('⏰ ТАЙМЕР СРАБОТАЛ:', entry.name, entry.time);
            triggerTimer(entry, index);
            entry.triggeredToday = currentDate;
            scheduleAutoDelete(entry, index);
            return;
        }
        
        // Если время в будущем - запускаем обратный отсчёт
        if (diffSeconds > 5) {
            console.log('🚀 Запуск обратного отсчёта:', entry.name, 'через', diffSeconds, 'сек');
            startCountdownTimer(entry, index, diffSeconds);
        }
    });
}

// ===== ЗАПУСК ОБРАТНОГО ОТСЧЁТА =====
function startCountdownTimer(entry, index, durationSeconds) {
    console.log('⏱️ Обратный отсчёт:', entry.name, durationSeconds, 'секунд');
    
    // Показываем уведомление о запуске
    showNotification('⏱️ ' + entry.name, 
        'Таймер запущен на ' + formatDuration(durationSeconds), 
        'info');
    
    // Закрываем модальное окно
    var modal = document.getElementById('ModalOverlay');
    if (modal) {
        modal.classList.remove('active');
    }
    
    // Запускаем таймер (если есть функция в Script.js)
    if (typeof window.startCountdown === 'function') {
        window.startCountdown(Math.floor(durationSeconds));
    }
    
    // Отмечаем что таймер активен
    GITHUB_CONFIG.activeTimers[entry.id] = {
        entry: entry,
        index: index,
        startTime: Date.now(),
        duration: durationSeconds
    };
    
    // Планируем срабатывание
    setTimeout(function() {
        console.log('✅ Таймер завершён:', entry.name);
        delete GITHUB_CONFIG.activeTimers[entry.id];
    }, durationSeconds * 1000);
}

// ===== ФОРМАТИРОВАНИЕ ДЛИТЕЛЬНОСТИ =====
function formatDuration(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var secs = seconds % 60;
    
    if (hours > 0) {
        return hours + ' ч ' + minutes + ' мин';
    } else if (minutes > 0) {
        return minutes + ' мин ' + secs + ' сек';
    } else {
        return secs + ' секунд';
    }
}

// ===== ЗАПУСК ТАЙМЕРА (КОГДА ВРЕМЯ НАСТУПИЛО) =====
function triggerTimer(entry, index) {
    console.log('🔔 СРАБОТАЛ ТАЙМЕР:', entry.name);
    
    // Уведомление
    showNotification('⏰ ' + entry.name, 
        'Время наступило!', 
        'success');
    
    // Звук
    playAlarmSound();
    
    // Визуальная подсветка
    highlightEntry(index);
    
    // Запускаем короткий таймер на 10 секунд (тест BSOD)
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
    
    if (!GITHUB_CONFIG.token) {
        timerEntries.splice(index, 1);
        renderTable(timerEntries);
        showNotification('🗑️ ' + entry.name, 'Запись удалена', 'info');
        return;
    }
    
    findOrCreateGist()
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
            showNotification('🗑️ ' + entry.name, 'Запись удалена автоматически', 'info');
            loadEntries(false);
        })
        .catch(function(error) {
            console.error('❌ Ошибка удаления:', error);
            timerEntries.splice(index, 1);
            renderTable(timerEntries);
        });
}

// ===== УВЕДОМЛЕНИЕ =====
function showNotification(title, message, type) {
    var notification = document.createElement('div');
    
    var bgColor = '#2196f3';
    if (type === 'success') bgColor = '#4caf50';
    if (type === 'info') bgColor = '#ff9800';
    if (type === 'error') bgColor = '#f44336';
    
    notification.style.cssText = 
        'position:fixed;top:20px;right:20px;background:' + bgColor + ';color:white;' +
        'padding:20px;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.3);' +
        'z-index:10000;animation:slideIn 0.3s ease;max-width:300px;';
    notification.innerHTML = 
        '<h3 style="margin:0 0 10px 0;">' + title + '</h3>' +
        '<p style="margin:0;">' + message + '</p>';
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(function() {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// ===== ЗВУК =====
function playAlarmSound() {
    try {
        var audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
        audio.play().catch(function() {
            console.log('🔇 Звук заблокирован');
        });
    } catch(e) {
        console.log('❌ Ошибка звука:', e);
    }
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
            timerEntries = data.entries || [];
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
        
        // Подсветка если сегодня
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
                row.style.background = 'rgba(33, 150, 243, 0.2)'; // Голубой для будущих
            } else if (diff <= 0 && diff > -300) {
                row.style.background = 'rgba(255, 152, 0, 0.2)'; // Оранжевый для прошедших
                timeLeft = 'время прошло';
            }
        }
        
        if (entry.triggeredToday === today) {
            row.style.background = 'rgba(76, 175, 80, 0.2)'; // Зелёный для сработавших
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
    var isToday = noDate || date === today;
    
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
    
    if (isToday) {
        var timeParts = time.split(':');
        var now = new Date();
        var targetTime = parseInt(timeParts[0]) * 3600 + parseInt(timeParts[1]) * 60;
        var currentTime = now.getHours() * 3600 + now.getMinutes() * 60;
        var diff = targetTime - currentTime;
        
        if (diff > 0) {
            showNotification('🚀 ' + name, 
                'Таймер запущен! ' + formatDuration(diff), 
                'success');
        } else {
            showNotification('⚠️ ' + name, 
                'Время уже прошло сегодня', 
                'error');
        }
    }
    
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

// ===== ОСТАНОВКА =====
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

// ===== CSS =====
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

