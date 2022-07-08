'use sctrict';

const getById = id => document.getElementById(id);
const table = getById('table');
const firstNameInput = getById('firstNameSearch');
const lastNameInput = getById('lastNameSearch');
const documentNumberInput = getById('documentNumberSearch');
const ipnInput = getById('ipnSearch');
const btnReset = getById('reset');
const btnSearch = getById('search');
const modal = getById('modal');
const closeBtn = getById('close');

// масив з усіма кредитами
const credits = [];

const resetCredits = async () => {
  const res = await fetch('http://localhost:8080/api/credits');
  for (const credit of await res.json()) {
    credits.push(credit);
  }
};
resetCredits().then(() => fillTable(table, credits));

const socket = new WebSocket('ws://localhost:8081');

socket.onopen = () => {
  console.log('socket connected');
  const message = {
    type: 'manager',
  };
  socket.send(JSON.stringify(message));
};

// записати кредит у таблицю та у масив
socket.onmessage = mes => {
  const message = JSON.parse(mes.data);
  console.log(message);
  if (message.type === 'credit') {
    console.log('REACHED');
    credits.push(message.body);
    const newRow = createRow(message.body);
    table.appendChild(newRow);
  }
};

// очистити усі поля у модальному вікні
const resetModal = modal => {
  const inputs = modal.getElementsByClassName('modal-input');
  for (const input of inputs) {
    input.value = '';
  }
  const column3 = modal.getElementsByClassName('column3')[0];
  while (column3.childElementCount > 1) {
    column3.removeChild(column3.lastChild);
  }
  const buttons = modal.getElementsByClassName('modal-button');
  for (const button of buttons) {
    button.replaceWith(button.cloneNode(true));
  }
};

// сховати модальне вікно
const closeModal = modal => {
  document.getElementsByClassName('mask')[0].classList.remove('active');
  modal.style.display = 'none';
  resetModal(modal);
};

// запомнити модальне вікно
const fillModal = (modal, credit) => {
  getById('creditStatus').value = credit.status;
  getById('firstName').value = credit.customer.firstName;
  getById('lastName').value = credit.customer.lastName;
  getById('age').value = credit.customer.age;
  getById('phoneNumber').value = credit.customer.phoneNumber;
  getById('gender').value = credit.customer.gender;
  getById('moneyAmount').value = credit.moneyAmount + '$';
  getById('dateFrom').value = credit.dateFrom.slice(0, 10);
  getById('monthsNumber').value = credit.rate.monthsNumber;
  getById('percent').value = credit.rate.percent + '%';
  getById('documentNumber').value = credit.customer.documentNumber;
  getById('ipn').value = credit.customer.ipn;
  getById('socialStatus').value = credit.customer.socialStatus;
  getById('maritalStatus').value = credit.customer.maritalStatus;
  getById('whiteIncome').value = credit.customer.whiteIncome;
  getById('blackIncome').value = credit.customer.blackIncome;
  getById('occuppation').value = credit.customer.occupation;
  getById('workPosition').value = credit.customer.workPosition;
  getById('workingStatus').value = credit.customer.workingStatus;
  getById('companyName').value = credit.customer.companyName;
  getById('purpose').value = credit.purpose;
  credit.monthlyPayments.forEach((val, index) => {
    const div = document.createElement('div');
    div.classList.add('payment-row');
    const p = document.createElement('p');
    p.textContent = `${index + 1} month - ${val}$`;
    div.appendChild(p);
    document.getElementsByClassName('column3')[0].appendChild(div);
  });
  const div = document.createElement('div');
  div.classList.add('payment-row');
  const p = document.createElement('p');
  const total = credit.monthlyPayments.reduce((acc, val) => acc + val);
  p.textContent = `Total: ${total}$`;
  div.appendChild(p);
  document.getElementsByClassName('column3')[0].appendChild(div);
  const comment = getById('comment');
  const confirmBtn = getById('confirm');
  confirmBtn.addEventListener('click', () => {
    const message = {
      type: 'creditAnswer',
      body: {
        clientId: credit.customer.id,
        creditId: credit.id,
        newStatus: 'confirmed',
        answer: 'yes',
        comment: comment.value,
      },
    };
    socket.send(JSON.stringify(message));
    getById(`row${credit.id}`).lastChild.textContent = 'confirmed';
    closeModal(modal);
  });
  const rejectBtn = getById('reject');
  rejectBtn.addEventListener('click', () => {
    const message = {
      type: 'creditAnswer',
      body: {
        clientId: credit.customer.id,
        creditId: credit.id,
        newStatus: 'rejected',
        answer: 'no',
        comment: comment.value,
      },
    };
    getById(`row${credit.id}`).lastChild.textContent = 'rejected';
    socket.send(JSON.stringify(message));
    closeModal(modal);
  });
};

// показати модальне вікно
const showModal = (modal, credit) => {
  fillModal(modal, credit);
  document.getElementsByClassName('mask')[0].classList.add('active');
  modal.style.display = 'grid';
};

closeBtn.addEventListener('click', () => closeModal(modal));

const td = textContent => {
  const td = document.createElement('td');
  td.textContent = textContent;
  return td;
};

// створити рядок у таблиці
function createRow(credit) {
  const row = document.createElement('tr');
  row.id = `row${credit.id}`;
  const fullInfo = document.createElement('button');
  fullInfo.textContent = 'Open';
  fullInfo.classList.add('btn-fullinfo');
  fullInfo.addEventListener('click', () => showModal(modal, credit));
  const tdButton = td('');
  tdButton.appendChild(fullInfo);
  row.append(
    td(credit.id),
    td(credit.customer.firstName),
    td(credit.customer.lastName),
    td(credit.customer.age),
    td(credit.moneyAmount + '$'),
    td(credit.dateFrom.slice(0, 10)),
    td(credit.rate.monthsNumber + ' months'),
    td(credit.rate.percent + '%'),
    td(credit.customer.phoneNumber),
    td(credit.customer.documentNumber),
    tdButton,
    td(credit.status)
  );
  return row;
}

const resetTable = table => {
  while (table.childElementCount > 1) {
    table.removeChild(table.lastElementChild);
  }
};

const fillTable = (table, credits) => {
  for (const credit of credits) {
    const newRow = createRow(credit);
    table.appendChild(newRow);
  }
};

btnReset.addEventListener('click', () => {
  const arr = [firstNameInput, lastNameInput, documentNumberInput, ipnInput];
  for (const input of arr) {
    input.value = '';
  }
  resetTable(table);
  fillTable(table, credits);
});

// пошук у таблиці
btnSearch.addEventListener('click', () => {
  const firstName = firstNameInput.value;
  const lastName = lastNameInput.value;
  const documentNumber = documentNumberInput.value;
  const ipn = ipnInput.value;
  if (!(firstName || lastName || documentNumber || ipn)) {
    resetTable(table);
    fillTable(table, credits);
    return;
  }
  // фільтрація масиву так, щоб залишилися тільки підходящі елементи
  const filtered = credits.filter(
    credit =>
      (firstName ? firstName === credit.customer.firstName : true) &&
      (lastName ? lastName === credit.customer.lastName : true) &&
      (documentNumber ?
        documentNumber === credit.customer.documentNumber :
        true) &&
      (ipn ? ipn === credit.customer.ipn : true)
  );
  resetTable(table);
  fillTable(table, filtered);
});
