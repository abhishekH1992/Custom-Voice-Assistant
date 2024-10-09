const tunnel = require('tunnel-ssh');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

function createTunnel() {
  return new Promise((resolve, reject) => {
    const sshConfig = {
      ...config.ssh,
      privateKey: fs.readFileSync(path.resolve(__dirname, '../../', config.ssh.privateKey))
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