const display = document.getElementById('calcDisplay');
if (display) {
  let first = 0, operator = '', fresh = false;

  function calculate(a, op, b) {
    if (op === '+') return a + b;
    if (op === '-') return a - b;
    if (op === '*') return a * b;
    if (op === '/') return b === 0 ? 'Error' : a / b;
    return 'Error';
  }

  document.querySelectorAll('.calc-grid button').forEach(function (button) {
    button.addEventListener('click', function () {
      const key = button.dataset.key;
      if (key === 'C') {
        display.value = '0'; first = 0; operator = ''; fresh = false;
      } else if ('0123456789'.includes(key)) {
        display.value = fresh || display.value === '0' || display.value === 'Error' ? key : display.value + key;
        fresh = false;
      } else if ('+-*/'.includes(key)) {
        first = Number(display.value); operator = key; fresh = true;
      } else if (key === '=' && operator) {
        const result = calculate(first, operator, Number(display.value));
        display.value = Number.isFinite(result) ? String(result) : 'Error';
        operator = ''; fresh = true;
      }
    });
  });
}
