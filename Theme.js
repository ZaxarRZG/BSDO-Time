document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const themeBtn = document.getElementById('BtnTheme');

    if (!themeBtn) {
        console.warn('Кнопка темы #BtnTheme не найдена');
        return;
    }

    function setTheme(theme) {
        body.classList.remove('light-theme', 'dark-theme');
        body.classList.add(theme + '-theme');
        localStorage.setItem('theme', theme);
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);


    themeBtn.addEventListener('click', () => {
        const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });
});