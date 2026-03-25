document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('BtnTimer');
    const modalOverlay = document.getElementById('ModalOverlay');
    const closeBtn = document.querySelector('#closeBtn');

    console.log('🔍 Элементы:', { openBtn, modalOverlay, closeBtn });

    if (!openBtn || !modalOverlay || !closeBtn) {
        console.error('❌ Элемент не найден!');
        return;
    }

    // ✅ Проверка: работает ли клик?
    openBtn.addEventListener('click', () => {
        console.log('🔘 Клик! Добавляем класс active...');
        modalOverlay.classList.add('active');
        console.log('✅ Классы модалки:', modalOverlay.classList);
        console.log('✅ opacity:', getComputedStyle(modalOverlay).opacity);
    });

    closeBtn.addEventListener('click', () => {
        console.log('❌ Закрытие');
        modalOverlay.classList.remove('active');
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            modalOverlay.classList.remove('active');
        }
    });
});