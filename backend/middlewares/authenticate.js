const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {

   try {

      const authHeader = req.headers.authorization;

      if (!authHeader) {
         return res.status(401).json({
            msg: "Authentication token is required"
         });
      }

      const parts = authHeader.split(' ');

      if (
         parts.length !== 2 ||
         parts[0] !== 'Bearer'
      ) {
         return res.status(401).json({
            msg: "Invalid authentication format"
         });
      }

      const token = parts[1];

      const payload = jwt.verify(
         token,
         process.env.secret_key
      );

      req.user = payload;

      next();

   } catch (error) {

      return res.status(401).json({
         msg: "Invalid or expired token"
      });

   }
};

module.exports = authenticate;