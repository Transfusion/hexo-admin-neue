#!/usr/bin/env node

const os = require('os')
const { spawn } = require("child_process");

const npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm'

spawn(npmCmd, ["ci"], {
  stdio: 'inherit',
  shell: true, // doesn't matter if shell: true is here or not.
  cwd: './frontend',
  env: {PATH: process.env.PATH} // DO NOT WASTE ANOTHER 12 HOURS OF YOUR LIFE ON THIS...
  // IF WE RUN npm ci from npm scripts some npm related environment variable will mess things up
  // and it won't be found
});