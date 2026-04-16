const { v4: uuidv4 } = require('uuid');

const LockerService = {
  generateLocker: () => {
    const lockerId = `L-${Math.floor(Math.random() * 900) + 100}`;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const qrCodeMockUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${uuidv4()}`;
    return { lockerId, otp, qrCode: qrCodeMockUrl };
  }
};

module.exports = LockerService;
