'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const inputData = document.querySelector('.converter__input');
    const outputData = document.querySelector('.converter__output');
    const btn = document.querySelector('.converter__button');
    const genCommandsBtn = document.querySelector('.converter__generate');
    const clearBtn = document.querySelector('.converter__clear');
    const list = document.querySelector('.converter__list');
    const remoteBranch = document.querySelector('.remote-branch');
    const localBranch = document.querySelector('.local-branch');
    const checklist = document.querySelector('.checklist');
    const checkboxes = checklist.querySelectorAll('input[type="checkbox"]');

    function formatKeys(inputText) {
        const keys = inputText
            .split('\n')
            .map(line => line.trim().replace(/^\*/, ''))
            .filter(line => /^origin\/[A-Z]+-\d+|^[A-Z]+-\d+/i.test(line))
            .map(line => line.replace(/^origin\//, ''));

        return keys.map(key => `key = ${key}`).join(' OR ');
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

    function updateOutputField(inputText) {
        outputData.value = `(${formatKeys(inputText)}) AND status = Closed ORDER BY key`;

        navigator.clipboard
            .writeText(outputData.value)
            .then()
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

        const formattedText = formatKeys(inputText);

        if (formattedText.trim() === '') {
            outputData.classList.add('error');
            outputData.value = 'Input data does not match the required format...';
            list.innerHTML = '';
            return;
        }

        updateOutputField(inputText);

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
        outputData.classList.remove('error');
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

    checkboxes.forEach(checkbox => {
        checkbox.checked = localStorage.getItem(checkbox.id) === 'true';
    });

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', event => {
            localStorage.setItem(event.target.id, event.target.checked);
        });
    });

    if (localStorage.getItem('checklist') === 'true') {
        checklist.classList.add('checklist--active');
    }

    checklist.addEventListener('click', function (event) {
        if (event.target.classList.contains('checklist__label')) {
            checklist.classList.toggle('checklist--active');
            localStorage.setItem('checklist', checklist.classList.contains('checklist--active'));
        } else if (event.target.classList.contains('checklist__reset')) {
            checklist.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
                localStorage.setItem(checkbox.id, false);
            });
        }
    });

    copyToClipboard(remoteBranch);
    copyToClipboard(localBranch);
});
