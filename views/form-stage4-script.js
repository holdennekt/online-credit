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

// масив з тарифами
const rates = [];

(async () => {
  const ratesRes = await fetch('http://localhost:8080/api/rates');
  const ratesArr = await ratesRes.json();
  rates.push(...ratesArr);
})();

const MIN_MONTHS = 1;
const MAX_MONTHS = 12;

const moneyAmountLabel = document.getElementById('moneyAmountLabel');
const moneyAmount = document.getElementById('moneyAmount');
const termLabel = document.getElementById('termLabel');
const months = document.getElementById('months');
const paymentTable = document.getElementById('monthlyPaymentTable');
const total = document.getElementById('totalPayment');

const dateFromStr = localStorage.getItem('dateFrom');
const whiteIncome = parseInt(localStorage.getItem('whiteIncome'));
const blackIncome = parseInt(localStorage.getItem('blackIncome'));

const superFunc = () => {
  const monthsVal = parseInt(months.value);
  const { percent } = rates.find(rate => monthsVal === rate.monthsNumber);
  const monthlyPayments = getMonthlyPayments(
    dateFromStr,
    months.value,
    moneyAmount.value,
    percent
  );

  const td = value => {
    const elem = document.createElement('td');
    elem.textContent = value;
    return elem;
  };

  while (paymentTable.childElementCount > 0) {
    paymentTable.removeChild(paymentTable.lastChild);
  }

  monthlyPayments.forEach((payment, index) => {
    const row = document.createElement('tr');
    const monthNumber = index + 1;
    row.append(td(monthNumber + ' month - '), td(payment + '$'));
    paymentTable.append(row);
  });

  total.value = monthlyPayments.reduce((acc, payment) => acc + payment);
};

// listener спрацьовує на зміну терміну і вираховує плату
months.addEventListener('change', event => {
  if (event.target.value < MIN_MONTHS) months.value = MIN_MONTHS;
  else if (event.target.value > MAX_MONTHS) months.value = MAX_MONTHS;
  const monthsVal = parseInt(months.value);

  const creditModes = [
    '',
    'fast',
    'fast',
    'fast',
    'short-term',
    'short-term',
    'short-term',
    'moderate',
    'moderate',
    'moderate',
    'long-term',
    'long-term',
    'long-term',
  ];
  const addition = ` credit (${monthsVal} months)`;
  termLabel.textContent = 'Term: ' + creditModes[monthsVal] + addition;

  superFunc();
});

moneyAmount.addEventListener('change', () => {
  if (months.value === '') return;
  superFunc();
});

form.addEventListener('submit', event => {
  event.preventDefault();

  const monthsVal = parseInt(months.value);
  const { percent } = rates.find(rate => monthsVal === rate.monthsNumber);
  const monthlyPayments = getMonthlyPayments(
    dateFromStr,
    months.value,
    moneyAmount.value,
    percent
  );

  const possiblePaymentAmount = (whiteIncome + blackIncome) * 0.4 - 2500;
  if (possiblePaymentAmount < monthlyPayments[0]) {
    const maxMoneyAmount = getMaxMoneyAmount(
      possiblePaymentAmount,
      percent,
      dateFromStr,
      months.value
    );
    moneyAmountLabel.textContent = `Money amount: your maximum is ${maxMoneyAmount}$!`;
    moneyAmountLabel.style.color = 'red';
  } else {
    fetch('http://localhost:8080/stage4', {
      method: 'POST',
      body: JSON.stringify({
        moneyAmount: moneyAmount.value,
        monthsNumber: months.value,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    }).then(() => {
      window.location.replace('http://localhost:8080/waiting');
    });
  }
});
