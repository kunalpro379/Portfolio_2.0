export const authenticate = (req, res, next) => {
  console.log('[AuthMiddleware] Verifying request to', req.path);
  next();
};