"use strict";

const mysql = require("mysql2");

class DataProvider {
  connect;

  constructor() {
    this.connect = mysql
      .createPool({
        connectionLimit: 5,
        host: "127.0.0.1",
        user: "root",
        database: "creditdb",
        password: process.env.DB_PASSWORD,
      })
      .promise();
  }

  // валідує пари колонка-значення
  #filterColumnValuePairs(columnValuePairs) {
    const filtered = columnValuePairs.filter((pair) => {
      return (
        pair.every(
          (val) =>
            (typeof val === "number" && val >= 0 && Number.isInteger(val)) ||
            (typeof val === "string" && val.length > 0)
        ) && pair.length === 2
      );
    });
    return filtered;
  }

  // перетворює пари колонка-значення в частину sql запиту
  #getSelectQuery(columnValuePairs) {
    const filtered = this.#filterColumnValuePairs(columnValuePairs);
    if (filtered.length === 0) return "";
    const sqlPairs = filtered.map(([column, value]) => `${column}="${value}"`);
    return "where " + sqlPairs.join(" and ");
  }

  // перетворює пари колонка-значення в частину sql запиту
  #getUpdateQuery(columnValuePairs) {
    const filtered = this.#filterColumnValuePairs(columnValuePairs);
    const sqlPairs = filtered.map(([column, value]) => `${column}="${value}"`);
    return "set " + sqlPairs.join(", ");
  }

  // перетворює пари колонка-значення в частину sql запиту
  #getInsertQuery(columnValuePairs) {
    const filtered = this.#filterColumnValuePairs(columnValuePairs);
    const columns = filtered.map(([column, value]) => column);
    const values = filtered.map(([column, value]) => `"${value}"`);
    return `(${columns.join(", ")}) values (${values.join(", ")})`;
  }

  // повертає масив тарифів
  async getRates() {
    const sql = "select * from rates";
    const res = await this.connect.query(sql).catch(console.log);
    return res[0];
  }

  // приймає назву колонки і її значення аргументами та повертає тариф
  async getRateBy(...columnValuePairs) {
    const condition = this.#getSelectQuery(columnValuePairs);
    const sql = `select * from rates ${condition}`;
    const res = await this.connect.query(sql).catch(console.log);
    return res[0];
  }

  // приймає назву колонки і її значення аргументами та повертає менеджера
  async getManagerBy(...columnValuePairs) {
    const condition = this.#getSelectQuery(columnValuePairs);
    const sql = `select * from managers ${condition}`;
    const res = await this.connect.query(sql).catch(console.log);
    return res[0];
  }

  // приймає набір пар колонка-значення та повертає кліента
  async getCustomerBy(...columnValuePairs) {
    const condition = this.#getSelectQuery(columnValuePairs);
    const sql = `select * from customers ${condition}`;
    const res = await this.connect.query(sql).catch(console.log);
    return res[0];
  }

  // повертає усі кредити
  async getCredits() {
    const sql = "select * from credits";
    const res = await this.connect.query(sql).catch(console.log);
    return res[0].map((credit) => ({
      ...credit,
      monthlyPayments: JSON.parse(credit.monthlyPayments),
    }));
  }

  // повертає усі кредити з підставленими клієнтами і тарифами замість їх id
  async getFullCredits() {
    const credits = await this.getCredits();
    for (const credit of credits) {
      const customer = await this.getCustomerBy(["id", credit.customer]);
      const rate = await this.getRateBy(["id", credit.rate]);
      credit.customer = customer[0];
      credit.rate = rate[0];
    }
    return credits;
  }

  // повертає кредит з підставленим клієнтом і тарифом замість їх id
  async getFullCreditBy(...columnValuePairs) {
    const credit = await this.getCreditBy(...columnValuePairs);
    const customer = await this.getCustomerBy(["id", credit[0].customer]);
    const rate = await this.getRateBy(["id", credit[0].rate]);
    credit[0].customer = customer[0];
    credit[0].rate = rate[0];
    return credit;
  }

  // приймає набір пар колонка-значення та повертає кредит
  async getCreditBy(...columnValuePairs) {
    const condition = this.#getSelectQuery(columnValuePairs);
    const sql = `select * from credits ${condition}`;
    const res = await this.connect.query(sql).catch(console.log);
    return res[0].map((credit) => ({
      ...credit,
      monthlyPayments: JSON.parse(credit.monthlyPayments),
    }));
  }

  // приймає об'єкт кліента аргументом, записує його в бд та повертає його id
  async newCustomer(customer) {
    const columnValuePairs = [];
    for (const key in customer) {
      columnValuePairs.push([key, customer[key]]);
    }
    const insertQuery = this.#getInsertQuery(columnValuePairs);
    const sql = `insert into customers ${insertQuery}`;
    const res = await this.connect.query(sql).catch(console.log);
    return res[0].insertId;
  }

  // приймає об'єкт кредита аргументом, записує його в бд та повертає його id
  async newCredit(credit) {
    const columnValuePairs = [];
    for (const key in credit) {
      columnValuePairs.push([key, credit[key]]);
    }
    const insertQuery = this.#getInsertQuery(columnValuePairs);
    const sql = `insert into credits ${insertQuery}`;
    const res = await this.connect.query(sql).catch(console.log);
    return res[0].insertId;
  }

  // приймає об'єкт кліента аргументом, оновлює його в бд
  async updateCustomer(customer) {
    const columnValuePairs = [];
    for (const key in customer) {
      columnValuePairs.push([key, customer[key]]);
    }
    const updateQuary = this.#getUpdateQuery(columnValuePairs);
    const sql = `update customers ${updateQuary} where id="${customer.id}"`;
    await this.connect.query(sql).catch(console.log);
  }

  // приймає об'єкт кредита аргументом, оновлює його в бд
  async updateCredit(credit) {
    const columnValuePairs = [];
    for (const key in credit) {
      columnValuePairs.push([key, credit[key]]);
    }
    const updateQuary = this.#getUpdateQuery(columnValuePairs);
    const sql = `update credits ${updateQuary} where id="${credit.id}"`;
    await this.connect.query(sql).catch(console.log);
  }
}

module.exports = DataProvider;
