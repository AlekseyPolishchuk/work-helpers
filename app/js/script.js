'use strict';

document.addEventListener('DOMContentLoaded', () => {
    (function () {
        const inputData = document.querySelector('.converter__input');
        const outputData = document.querySelector('.converter__output');
        const btn = document.querySelector('.converter__button');
        const copyBtn = document.querySelector('.converter__copy');
        const clearBtn = document.querySelector('.converter__clear');
        const list = document.querySelector('.converter__list');

        function formatKeys(inputText) {
            const lines = inputText.split('\n');

            const keys = lines
                .map(line => line.trim())
                .filter(line => /origin\/[A-Z]+-\d+/.test(line))
                .map(line => line.split('/')[1]);

            const result = keys.map(key => `key = ${key}`).join(' OR ');

            return result;
        }

        function generateCheckboxList(keys) {
            list.innerHTML = '';
            keys.forEach(key => {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = key;
                checkbox.value = key;

                const label = document.createElement('label');
                label.htmlFor = key;
                label.textContent = key;

                const div = document.createElement('div');
                div.classList.add('converter__checkbox');
                div.appendChild(checkbox);
                div.appendChild(label);

                list.appendChild(div);
            });
        }

        function updateOutputData(inputText) {
            const formattedText = formatKeys(inputText);
            outputData.value = formattedText;

            navigator.clipboard
                .writeText(outputData.value)
                .then(() => {
                    copyBtn.classList.add('copied');
                    copyBtn.textContent = 'Copied';
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                });
        }

        function updateOutputAndList() {
            outputData.classList.remove('error');
            const inputText = inputData.value;

            if (inputText.trim() === '') {
                outputData.value = '';
                list.innerHTML = '';
                copyBtn.classList.remove('copied');
                copyBtn.textContent = 'Copy to Clipboard';
                return;
            }

            const inputKeys = inputText
                .split('\n')
                .map(line => line.trim())
                .filter(line => /origin\/[A-Z]+-\d+/.test(line))
                .map(line => line.split('/')[1]);

            if (inputKeys.length === 0) {
                outputData.classList.add('error');
                outputData.value = 'Input data does not match the required format...';
                list.innerHTML = '';
                copyBtn.classList.remove('copied');
                copyBtn.textContent = 'Copy to Clipboard';
                return;
            }

            updateOutputData(inputText);

            const formattedText = formatKeys(inputText);
            outputData.value = formattedText;

            const keys = formattedText.split(' OR ').map(item => item.split(' = ')[1]);
            generateCheckboxList(keys);
        }

        inputData.addEventListener('input', updateOutputAndList);
        inputData.addEventListener('focus', () => {
            navigator.clipboard
                .readText()
                .then(text => {
                    inputData.value = text;
                    updateOutputAndList(); // Вызовите функцию для обновления данных и списка чекбоксов
                })
                .catch(err => {
                    console.error('Failed to read from clipboard: ', err);
                });
        });

        clearBtn.addEventListener('click', () => {
            inputData.value = '';
            outputData.value = '';
            list.innerHTML = '';
            copyBtn.classList.remove('copied');
            copyBtn.textContent = 'Copy to Clipboard';
        });
    })();
});
