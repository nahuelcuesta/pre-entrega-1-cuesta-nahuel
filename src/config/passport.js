import dotenv from 'dotenv';
dotenv.config();
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcrypt';
import User from '../models/User.js'; 

console.log('JWT_SECRET:', process.env.JWT_SECRET); 

passport.use(
  new LocalStrategy(
    { 
      usernameField: 'email'
    },
    async (email, password, done) => {
      try {
        console.log('Buscando usuario con email:', email);
        const user = await User.findOne({ email });
        if (!user) {
          console.log('Usuario no encontrado');
          return done(null, false, { message: 'Usuario no encontrado' });
        }
        console.log('Validando contraseña...');
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
          console.log('Contraseña incorrecta');
          return done(null, false, { message: 'Contraseña incorrecta' });
        }
        console.log('Usuario autenticado:', user.email);
        return done(null, user);
      } catch (error) {
        console.error('Error en la estrategia local:', error);
        return done(error);
      }
    }
  )
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET, 
    },
    async (jwtPayload, done) => {
      try {
        const user = await User.findById(jwtPayload.id);
        if (!user) {
          return done(null, false, { message: 'Usuario no encontrado' });
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
    done(null, user.id); 
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport;
