export const errorHandler = (err, req, res, next) => {
  console.error('[ErrorMiddleware] Guardrail caught an error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error. Guardrails active.'
  });
};