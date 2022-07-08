'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });
const passport = require('passport');
const session = require('express-session');
const DataProvider = require('../model/provider');

const registerApiHandlers = require('./apiHandlers');
const registerHtmlHandlers = require('./htmlHandlers');
const initializePassport = require('./passport-config');
const { getMonthlyPayments } = require('./getMonthlyPayments');

initializePassport(
  passport,
  async username => (await provider.getManagerBy(['username', username]))[0],
  async id => (await provider.getManagerBy(['id', id]))[0]
);

app.use(express.static('views'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
};

const checkNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return res.redirect('/table');
  next();
};

// тимчасове зберігання форми до того, як вона буде повна
const form = {};
Object.defineProperty(form, 'fill', {
  value: data => {
    for (const key in data) {
      form[key] = data[key];
    }
  },
});

// екземпляр класу для роботи з бд
const provider = new DataProvider();

registerHtmlHandlers(app, checkAuthenticated, checkNotAuthenticated);
registerApiHandlers(app, provider);

app.post('/stage1', (req, res) => {
  form.fill(req.body);
  res.redirect('/stage2');
});

app.post('/stage2', (req, res) => {
  form.fill(req.body);
  res.redirect('/stage3');
});

app.post('/stage3', (req, res) => {
  form.fill(req.body);
  res.redirect('/stage4');
});

app.post('/stage4', async (req, res) => {
  form.fill(req.body);

  const customer = {
    firstName: form.firstName,
    lastName: form.lastName,
    age: form.age,
    phoneNumber: form.phoneNumber,
    maritalStatus: form.maritalStatus,
    gender: form.gender,
    occupation: form.occupation,
    workPosition: form.workPosition,
    companyName: form.companyName,
    documentNumber: form.documentNumber,
    ipn: form.ipn,
    whiteIncome: form.whiteIncome,
    blackIncome: form.blackIncome,
    workingStatus: form.workingStatus,
    socialStatus: form.socialStatus,
  };

  let customerId;
  const customerFromDb = await provider.getCustomerBy([
    'documentNumber',
    form.documentNumber,
  ]);
  if (customerFromDb[0]) {
    customerId = customerFromDb[0].id;
    customer.id = customerId;
    await provider.updateCustomer(customer);
  } else customerId = await provider.newCustomer(customer);
  const rate = await provider.getRateBy(['monthsNumber', form.monthsNumber]);
  const monthlyPayments = getMonthlyPayments(
    form.dateFrom,
    form.monthsNumber,
    form.moneyAmount,
    rate[0].percent
  );
  const credit = {
    moneyAmount: form.moneyAmount,
    purpose: form.purpose,
    dateFrom: form.dateFrom,
    monthlyPayments: JSON.stringify(monthlyPayments),
    status: 'in processing',
    customer: customerId,
    rate: rate[0].id,
  };
  const creditId = await provider.newCredit(credit);
  const creditFromDb = await provider.getFullCreditBy(['id', creditId]);

  // відправити меседж менеджеру сокетом
  for (const client of wss.clients) {
    if (client.role === 'manager') {
      const message = {
        type: 'credit',
        body: creditFromDb[0],
      };
      client.send(JSON.stringify(message));
    }
  }

  res.redirect('/waiting');
});

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/table',
    failureRedirect: '/login',
  })
);

// налаштування сокет серверу
wss.on('connection', (socket, req) => {
  console.log('new connection');
  socket.on('message', async mes => {
    const message = JSON.parse(mes.toString());
    if (message.type === 'manager') socket.role = 'manager';
    else if (message.type === 'customer') socket.id = message.body.id;
    else if (message.type === 'creditAnswer') {
      for (const client of wss.clients) {
        if (client.id === message.body.clientId) {
          client.send(
            JSON.stringify({
              type: 'creditAnswer',
              body: {
                answer: message.body.answer,
                comment: message.body.comment,
              },
            })
          );
        }
      }
      const credit = await provider.getCreditBy(['id', message.body.creditId]);
      credit[0].status = message.body.newStatus;
      provider.updateCredit(credit[0]);
    }
  });
  socket.on('close', () => console.log('disconnected'));
});

app.listen(8080, 'localhost');
