        const body = document.body;
        const toggleButton = document.getElementById('BtnThem');
        const themeSpan = document.getElementById('current-theme');


        function setTheme(theme) {

            body.classList.remove('light-theme', 'dark-theme');

            body.classList.add(theme + '-theme');

            themeSpan.textContent = theme === 'light' ? 'светлая' : 'тёмная';

            localStorage.setItem('theme', theme);
        }


        const savedTheme = localStorage.getItem('theme') || 'light'; // по умолчанию светлая
        setTheme(savedTheme);


        toggleButton.addEventListener('click', () => {
            const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
