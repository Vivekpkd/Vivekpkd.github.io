function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const code = codeBlock.querySelector('code').innerText;

    navigator.clipboard.writeText(code).then(() => {
        const originalInner = button.innerHTML;
        button.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        button.style.color = '#10b981';

        setTimeout(() => {
            button.innerHTML = originalInner;
            button.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}
