const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// функція для ініціалізації паспорту аутентифікації
const initialize = (passport, getUserByUsername, getUserById) => {
  const authenticateUser = async (username, password, done) => {
    const user = await getUserByUsername(username);
    if (user === undefined) {
      return done(null, false, { message: 'No user with this username' });
    }
    try {
      const matched = await bcrypt.compare(password, user.password);
      if (matched) return done(null, user);
      else return done(null, false, { message: 'Password incorrect' });
    } catch (e) {
      return done(e);
    }
  };
  passport.use(new LocalStrategy(authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) =>
    done(null, await getUserById(id))
  );
};

module.exports = initialize;
