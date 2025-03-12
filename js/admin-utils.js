async function handleQuickAction(action) {
    switch(action) {
        case 'appointment':
            // Open appointment modal
            openModal('appointment-modal');
            break;
        case 'client':
            // Open client modal
            openModal('client-modal');
            break;
        case 'artist':
            // Open artist modal
            openModal('artist-modal');
            break;
        case 'portfolio':
            // Open portfolio modal
            openModal('portfolio-modal');
            break;
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}
