const authService = require('../services/auth.service');


// ===========================================
// Register
// ===========================================

const register = async (req, res, next) => {

   try {

      const result = await authService.register(
         req.body
      );

      res.status(201).json(result);

   } catch (error) {

      next(error);

   }
};


// ===========================================
// Login
// ===========================================

const login = async (req, res, next) => {

   try {

      const result = await authService.login(
         req.body
      );

      res.status(200).json(result);

   } catch (error) {

      next(error);

   }
};


module.exports = {
   register,
   login
};