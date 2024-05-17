'use strict';

document.addEventListener('DOMContentLoaded', () => {
    (function () {
        const inputData = document.querySelector('.converter__input');
        inputData.value = `
origin/ARE-1255
origin/ARE-1276
origin/ARE-1348
origin/ARE-941
origin/HEAD -> origin/main
origin/WOR-189
origin/WOR-317
origin/WOR-367
origin/WOR-391
origin/main`;

        const outputData = document.querySelector('.converter__output');
        const btn = document.querySelector('.converter__button');

        function formatKeys(inputText) {
            // Разделяем входной текст на строки
            const lines = inputText.split('\n');

            // Используем регулярное выражение для фильтрации нужных строк и извлечения ключей
            const keys = lines
                .map(line => line.trim()) // Удаляем пробелы в начале и конце строки
                .filter(line => /origin\/(ARE|WOR)-\d+/.test(line)) // Оставляем только нужные строки
                .map(line => line.split('/')[1]); // Извлекаем ключ

            // Формируем итоговую строку
            const result = keys.map(key => `key = ${key}`).join(' OR ');

            return result;
        }

        btn.addEventListener('click', () => {
            const inputText = inputData.value; // Получаем текст из inputData
            const formattedText = formatKeys(inputText); // Форматируем текст
            outputData.value = formattedText; // Присваиваем результат в outputData
        });
    })();
});
