'use strict';

document.addEventListener('DOMContentLoaded', () => {
    (function () {
        const inputData = document.querySelector('.converter__input');
        const outputData = document.querySelector('.converter__output');
        const btn = document.querySelector('.converter__button');
        const genCommandsBtn = document.querySelector('.converter__generate');
        const clearBtn = document.querySelector('.converter__clear');
        const list = document.querySelector('.converter__list');
        const remoteBranch = document.querySelector('.remote-branch');
        const localBranch = document.querySelector('.local-branch');

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
            outputData.value = `(${formatKeys(inputText)}) AND status = Closed ORDER BY key`;

            navigator.clipboard
                .writeText(outputData.value)
                .then(() => {
                    // copyBtn.classList.add('copied');
                    // copyBtn.textContent = 'Copied';
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
                return;
            }

            updateOutputData(inputText);

            const formattedText = formatKeys(inputText);

            const keys = formattedText
                .split(' OR ')
                .map(item => item.split(' = ')[1])
                .sort();
            generateCheckboxList(keys);
        }

        function copyToClipboard(elem) {
            elem.addEventListener('click', () => {
                navigator.clipboard
                    .writeText(elem.textContent)
                    .then(() => {
                        showMessage(elem, 'Copied to clipboard');
                    })
                    .catch(err => {
                        console.error('Failed to copy text: ', err);
                    });
            });
        }

        function showMessage(field, text) {
            if (!field.closest('.field-wrap').querySelector('.converter__message')) {
                const message = document.createElement('div');
                message.textContent = text;
                message.classList.add('converter__message');

                field.closest('.field-wrap').insertAdjacentElement('beforeend', message);
                setTimeout(() => message.remove(), 2000);
            }
        }

        inputData.addEventListener('input', updateOutputAndList);
        inputData.addEventListener('focus', () => {
            if (inputData.value.trim() === '') {
                navigator.clipboard
                    .readText()
                    .then(text => {
                        inputData.value = text;
                        updateOutputAndList();
                    })
                    .catch(err => {
                        console.error('Failed to read from clipboard: ', err);
                    });
            }
        });

        btn.addEventListener('click', () => {
            navigator.clipboard
                .readText()
                .then(text => {
                    inputData.value = text;
                    updateOutputAndList();
                })
                .catch(err => {
                    console.error('Failed to read from clipboard: ', err);
                });
        });

        clearBtn.addEventListener('click', () => {
            inputData.value = '';
            outputData.value = '';
            list.innerHTML = '';
            remoteBranch.innerHTML = '';
            localBranch.innerHTML = '';
            remoteBranch.classList.remove('copied');
            localBranch.classList.remove('copied');
        });

        genCommandsBtn.addEventListener('click', function () {
            const selectedBranches = Array.from(list.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => checkbox.value);

            if (selectedBranches.length === 0) {
                remoteBranch.innerHTML = '';
                localBranch.innerHTML = '';
                return;
            }

            const branchesText = selectedBranches.join(' ');

            const remoteScript = `for branch in ${branchesText}; do\n  git push origin :$branch\n  echo "================================================="\ndone\n`;
            const localScript = `for branch in ${branchesText}; do\n  git branch -d $branch\n  echo "================================================="\ndone\n`;

            remoteBranch.innerHTML = remoteScript;
            localBranch.innerHTML = localScript;
        });

        copyToClipboard(remoteBranch);
        copyToClipboard(localBranch);
    })();
});
