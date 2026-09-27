import { EncryptionService } from '../services/core/encryption.service.js';

export const encryptResponse = (req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    if (typeof body === 'object' && !body.error) {
       // body = EncryptionService.encrypt(body);
    }
    originalSend.call(this, body);
  };
  next();
};