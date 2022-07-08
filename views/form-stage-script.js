'use strict';

const form = document.getElementById('form');

// при відправці інформація записується у localstorage
form.addEventListener('submit', () => {
  const inputs = Object.assign({}, form.elements);
  for (const key in inputs) {
    if (isNaN(parseInt(key))) {
      const val = inputs[key].value;
      localStorage.setItem(key, val);
    }
  }
});

// заповнюються поля з localstorage якщо є
for (const key in localStorage) {
  const val = localStorage.getItem(key);
  if (val) {
    const input = form.elements[key];
    if (input) input.value = val;
  }
}
