document.addEventListener('DOMContentLoaded', function () {
    var overlay    = document.getElementById('modal-overlay');
    var messageEl  = document.getElementById('modal-message');
    var inputEl    = document.getElementById('modal-input');
    var okBtn      = document.getElementById('modal-ok-btn');
    var cancelBtn  = document.getElementById('modal-cancel-btn');

    if (!overlay || !messageEl || !inputEl || !okBtn || !cancelBtn) {
        console.error('Modal: one or more elements not found in DOM');
        return;
    }

    overlay.style.display = 'none';

    var currentResolve = null;
    var currentType    = null;

    function show(message, type, inputType) {
        currentType = type;
        messageEl.textContent = message;

        inputEl.style.display  = (type === 'prompt') ? 'block' : 'none';
        cancelBtn.style.display = (type === 'alert')  ? 'none'  : '';

        if (type === 'prompt') {
            inputEl.type        = inputType || 'text';
            inputEl.value       = '';
            inputEl.placeholder = '';
        }

        overlay.style.display = 'flex';

        requestAnimationFrame(function () {
            if (type === 'prompt') inputEl.focus();
            else okBtn.focus();
        });

        return new Promise(function (resolve) {
            currentResolve = resolve;
        });
    }

    function closeModal(value) {
        overlay.style.display = 'none';
        if (currentResolve) {
            var cb = currentResolve;
            currentResolve = null;
            cb(value);
        }
    }

    okBtn.addEventListener('click', function () {
        closeModal(currentType === 'prompt' ? inputEl.value : true);
    });

    cancelBtn.addEventListener('click', function () {
        closeModal(currentType === 'confirm' ? false : null);
    });

    inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter')  okBtn.click();
        if (e.key === 'Escape') cancelBtn.click();
    });

    document.addEventListener('keydown', function (e) {
        if (overlay.style.display === 'none') return;
        if (e.key === 'Escape') {
            if (currentType === 'alert') okBtn.click();
            else cancelBtn.click();
        }
    });

    window.showAlert = function (message) {
        return show(message, 'alert', null);
    };

    window.showConfirm = function (message) {
        return show(message, 'confirm', null);
    };

    window.showPrompt = function (message, options) {
        var inputType = (options && options.inputType) ? options.inputType : 'text';
        return show(message, 'prompt', inputType);
    };
});
