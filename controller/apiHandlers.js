const registerApiHandlers = (app, provider) => {
  // отримати усі тарифи(для останньої сторінки форми)
  app.get('/api/rates', async (req, res) => {
    const rates = await provider.getRates();
    res.status(200).send(rates);
  });

  // отримати усі кредити(для таблички у менеджера)
  app.get('/api/credits', async (req, res) => {
    if (req.isAuthenticated()) {
      const credits = await provider.getFullCredits();
      res.status(200).send(credits);
    } else res.status(401).send('access denied');
  });

  // отримати id користувача по номеру документа
  app.get('/api/getId', async (req, res) => {
    const columnValue = ['documentNumber', req.query.documentNumber];
    const customer = await provider.getCustomerBy(columnValue);
    res.status(200).send(customer[0].id.toString());
  });
};

module.exports = registerApiHandlers;
