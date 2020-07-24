const bcrypt = require('bcrypt-nodejs');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const bodyParser = require('body-parser');
// for actually authenticating using JWTs
// const passportJwt = require('passport-jwt');

// for generating JWTs
// const jwt = require('jsonwebtoken');

// LocalStrategy to handle the actual login and issuing of tokens
const LocalStrategy = require('passport-local').Strategy;

// JwtStrategy whenever we are making an actual request
// const JwtStrategy = passportJwt.Strategy,
//   ExtractJwt = passportJwt.ExtractJwt;

module.exports = function (app, hexo, rootAPIPath) {
  const config = hexo.config.admin;

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser(config.secret));

  // simple session, memorystore by default
  app.use(session({
    secret: config.secret,
    name: 'hexo-admin-neue-auth',
    resave: false,
    saveUninitialized: false,
    httpOnly: false,
    cookie: { maxAge: 604800000, sameSite: 'lax', } // 7 days
  }));

  console.log("Session store initialized.");

  /* const jwtOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.secret
  }
 
  // the expiry will be implicitly respected by passport
  passport.use(new JwtStrategy(jwtOpts, function (jwt_payload, done) {
    if (jwt_payload.user === config.username) {
      return done(null, jwt_payload.user);
    }
    return done(null, false);
  })); */


  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(
    function (username, password, done) {
      if (username === config.username &&
        bcrypt.compareSync(password, config.password_hash)) {
        return done(null, username);
      }
      return done(null, false);
    }
  ));

  passport.serializeUser(function (user, cb) {
    cb(null, user);
  });

  passport.deserializeUser(function (id, done) {
    done(null, id);
  });

  // https://stackoverflow.com/questions/36525187/passport-serializeuser-is-not-called-with-this-authenticate-callback
  app.use('/' + rootAPIPath + 'auth/login', (req, res) => {

    passport.authenticate('local', {
      session: true
    }, (err, user, info) => {
      if (err || !user) {
        res.statusCode = 401;
        res.setHeader('Content-type', 'application/json');
        const body = { success: false };
        if (err) { body.error = JSON.stringify(err); }
        if (info) { body.info = info; }
        return res.end(JSON.stringify(body));
      }

      else {
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        // const token = jwt.sign({ user, ts: new Date() }, config.secret, { expiresIn: '7d' });
        // const body = { success: true, token };
        const body = { success: true };
        // return res.end(JSON.stringify(body));

        req.logIn(user, function (err) {
          if (err) { return next(err); }
          // return res.redirect('/users/' + user.username);
          // req.session.touch() doesn't seem to work
          req.session.lastAccess = new Date().getTime();
          return res.end(JSON.stringify(body));
        });

      }

    })(req, res);

  });

  app.post('/' + rootAPIPath + 'auth/logout', (req, res) => {
    req.logout();
    res.statusCode = 204
    return res.end('');
  });

  // protect endpoints (next() is automatically called)
  // app.use('/' + rootAPIPath, passport.authenticate('jwt', { session: false }));
  app.use('/' + rootAPIPath, (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.statusCode = 403;
      res.setHeader('Content-type', 'application/json');
      const body = { success: false, error: 'Forbidden' };
      return res.end(JSON.stringify(body));
    }
  });

}