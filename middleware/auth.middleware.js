const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalido o expirado' });
  }
}

 estaAutorizado = (...rol) => {
  return (req, res, next) => {
    if (!rol.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  }
}

module.exports = {
  authenticateToken,
  estaAutorizado,
};
