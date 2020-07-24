#!/usr/bin/env node

const os = require('os')
const { spawn } = require("child_process");

const npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm'

spawn(npmCmd, ["run", "build-frontend"], {
  stdio: 'inherit',
  shell: true, // doesn't matter if shell: true is here or not.
  cwd: __dirname
});
