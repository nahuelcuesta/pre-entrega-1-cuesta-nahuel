import passport from 'passport';

const authMiddleware = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
        if (!user) {
            return res.status(401).json({ message: 'No autorizado' });
        }
        req.user = user;
        next();
    })(req, res, next);
};

export default authMiddleware;