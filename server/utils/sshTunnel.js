const tunnel = require('tunnel-ssh');
const config = require('../config/config');

function createTunnel() {
  return new Promise((resolve, reject) => {
    const sshConfig = {
      ...config.ssh,
      privateKey: process.env.SSH_PRIVATE_KEY,
      passphrase: process.env.SSH_PASSPHRASE // Add this line
    };

    const tunnelConfig = {
      ...sshConfig,
      dstPort: sshConfig.dstPort,
      dstHost: sshConfig.dstHost,
      localHost: sshConfig.localHost,
      localPort: sshConfig.localPort
    };

    const server = tunnel(tunnelConfig, (error, server) => {
      if (error) {
        console.error('Tunnel connection failed:', error);
        return reject(error);
      }
      resolve(server);
    });

    server.on('error', (error) => {
      console.error('SSH tunnel error:', error);
      reject(error);
    });
  });
}

module.exports = { createTunnel };