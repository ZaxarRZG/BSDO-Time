document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('BtnTheme');
  const body = document.body;

  // Загрузка сохранённой темы
  function loadTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      body.classList.add('dark');
    }
  }

  // Переключение темы
  function toggleTheme() {
    body.classList.toggle('dark');
    const isDark = body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  loadTheme();

  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  } else {
    console.warn('Кнопка #BtnTheme не найдена в DOM');
  }

  // Горячая клавиша T
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 't' && !e.target.matches('input, textarea')) {
      toggleTheme();
    }
  });
});