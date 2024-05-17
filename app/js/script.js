'use strict';

document.addEventListener('DOMContentLoaded', () => {
    (function () {
        const inputData = document.querySelector('.converter__input');
        const outputData = document.querySelector('.converter__output');
        const btn = document.querySelector('.converter__button');
        const copyBtn = document.querySelector('.converter__copy');

        function formatKeys(inputText) {
            const lines = inputText.split('\n');

            const keys = lines
                .map(line => line.trim())
                .filter(line => /origin\/[A-Z]+-\d+/.test(line))
                .map(line => line.split('/')[1]);

            const result = keys.map(key => `key = ${key}`).join(' OR ');

            return result;
        }

        btn.addEventListener('click', () => {
            const inputText = inputData.value;
            const formattedText = formatKeys(inputText);
            outputData.value = formattedText;
            copyBtn.classList.remove('copied');
            copyBtn.innerText = 'Copy to Clipboard';
        });

        copyBtn.addEventListener('click', () => {
            navigator.clipboard
                .writeText(outputData.value)
                .then(() => {
                    copyBtn.classList.add('copied');
                    copyBtn.innerText = 'Copied';
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                });
        });
    })();
});
