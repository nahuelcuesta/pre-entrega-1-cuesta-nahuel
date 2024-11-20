import express from 'express';
import passport from 'passport';
import { validatePassword } from '../utils/bcrypt.js';
import { generateToken, verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  
  const { first_name, last_name, email, age, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }
    const newUser = new User({
      first_name,
      last_name,
      email,
      age,
      password
    });
    await newUser.save();
    const token = generateToken(newUser);
    res.cookie('token', token, { httpOnly: true });
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hubo un error al registrar el usuario' });
  }
});


router.post('/login', passport.authenticate('local', { session: false }), async (req, res) => {

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    console.log('Usuario encontrado, mail:', user.email);
    if (!user) {
      console.log('Usuario no encontrado');
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    console.log('Validando contraseña...');
    const isMatch = validatePassword(password, user.password);
    if (!isMatch) {
      console.log('Contraseña incorrecta');
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }
    console.log('Generando token...');
    const token = generateToken(user);
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    console.log('Login exitoso');
    res.json({ message: 'Login exitoso', token });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.get('/current', (req, res) => {
  const token = req.cookies.token;
  console.log('Token:', token);
  if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
  }
  try {
    const decoded = verifyToken(token); 
    User.findById(decoded.id)
      .then((user) => {
        if (user) {
          console.log('Usuario actual:', user.email);
          return res.json(user);  
        } else {
          return res.status(404).json({ message: 'Usuario no encontrado' });
        }
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener el usuario' });
      });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    return res.status(400).json({ message: 'Token inválido o expirado' });
  }
});

export default router;