const tunnel = require('tunnel-ssh');
const config = require('../config/config');

function createTunnel() {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting tunnel creation process');

      let sshConfig;
      try {
        sshConfig = {
          ...config.ssh,
          privateKey: process.env.SSH_PRIVATE_KEY,
          passphrase: process.env.SSH_PASSPHRASE
        };
        console.log('SSH config created successfully');
      } catch (configError) {
        console.error('Error creating SSH config:', configError);
        return reject(configError);
      }

      let tunnelConfig;
      try {
        tunnelConfig = {
          ...sshConfig,
          dstPort: sshConfig.dstPort,
          dstHost: sshConfig.dstHost,
          localHost: sshConfig.localHost,
          localPort: sshConfig.localPort
        };
        console.log('Tunnel config created successfully');
      } catch (tunnelConfigError) {
        console.error('Error creating tunnel config:', tunnelConfigError);
        return reject(tunnelConfigError);
      }

      console.log('Attempting to create tunnel with config:', {
        ...tunnelConfig,
        privateKey: tunnelConfig.privateKey ? 'PRESENT' : 'MISSING',
        passphrase: tunnelConfig.passphrase ? 'PRESENT' : 'MISSING'
      });

      const server = tunnel(tunnelConfig, (error, server) => {
        if (error) {
          console.error('Tunnel connection failed:', error);
          return reject(error);
        }
        console.log('Tunnel connection successful');
        resolve(server);
      });

      server.on('error', (error) => {
        console.error('SSH tunnel error:', error);
        reject(error);
      });

      server.on('connect', () => {
        console.log('SSH tunnel connected');
      });

    } catch (generalError) {
      console.error('General error in createTunnel:', generalError);
      reject(generalError);
    }
  });
}

module.exports = { createTunnel };