const passport = require("passport");
const passportJwt = require("passport-jwt");

const { ExtractJwt } = passportJwt;
const StrategyJwt = passportJwt.Strategy;
const db = require("../models");

passport.use(
  new StrategyJwt(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    },
    (jwtPayload, done) =>
      db.Users.findOne({
        where: { id: jwtPayload.id },
        attributes: { exclude: ["password", "verification_code"] }
      })
        .then((user) => done(null, user))
        .catch((err) => done(err))
  )
);
