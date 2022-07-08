// допоміжна функція для getMonthlyPayments
const getDateTo = (dateFrom, monthsNumber) => {
  const dateTo = new Date(dateFrom);
  dateTo.setMonth(dateTo.getMonth() + monthsNumber);
  return dateTo;
};
// допоміжна функція для getMonthlyPayments
const getDaysInMonth = date => {
  const year = date.getFullYear();
  const month = date.getMonth();
  return new Date(year, month + 1, 0).getDate();
};

// допоміжна функція для getMonthlyPayments
const getDaysCount = (dateFrom, dateTo) => {
  const difference = Math.abs(dateTo.getTime() - dateFrom.getTime());
  const daysCount = Math.ceil(difference / (1000 * 3600 * 24));
  return daysCount;
};

// отримати вирахувані місячні платежі для кредиту
const getMonthlyPayments = (
  dateFromStr,
  monthsNumberStr,
  moneyAmountStr,
  percent
) => {
  const dateFrom = new Date(dateFromStr);
  const moneyAmount = parseInt(moneyAmountStr);
  const monthsNumber = parseInt(monthsNumberStr);

  const bodyCredit = moneyAmount / monthsNumber;
  const daysCount = getDaysCount(dateFrom, getDateTo(dateFrom, monthsNumber));

  const monthlyPayments = [];

  for (let i = 0; i < monthsNumber; i++) {
    const daysInMonth = getDaysInMonth(getDateTo(dateFrom, i));
    const penalty =
      (((moneyAmount - bodyCredit * i) * percent) / 100 / daysCount) *
      daysInMonth;
    const monthlyPayment = Math.ceil(bodyCredit + penalty);
    monthlyPayments.push(monthlyPayment);
  }
  return monthlyPayments;
};

module.exports = { getMonthlyPayments };
