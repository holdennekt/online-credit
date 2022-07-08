const path = require('path');

// html хендлери віддають сторінки
const registerHtmlHandlers = (
  app,
  checkAuthenticated,
  checkNotAuthenticated
) => {
  app.get('/', (req, res) => {
    res.redirect('/stage1');
  });

  app.get('/stage1', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'form-stage1.html'));
  });

  app.get('/stage2', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'form-stage2.html'));
  });

  app.get('/stage3', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'form-stage3.html'));
  });

  app.get('/stage4', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'form-stage4.html'));
  });

  app.get('/waiting', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'waiting.html'));
  });

  app.get('/login', checkNotAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'manager-login.html'));
  });

  app.get('/table', checkAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'manager-table.html'));
  });
};

module.exports = registerHtmlHandlers;
