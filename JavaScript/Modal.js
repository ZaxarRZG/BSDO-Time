document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('BtnTimer');
    const modalOverlay = document.getElementById('ModalOverlay');
    const CloseBtn = document.querySelector('#CloseBtn');

    if (!openBtn || !modalOverlay || !CloseBtn) {
        console.error('❌ Элемент не найден!');
        return;
    }


    openBtn.addEventListener('click', () => {
        modalOverlay.classList.add('active');
    });

    CloseBtn.addEventListener('click', () => {
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
