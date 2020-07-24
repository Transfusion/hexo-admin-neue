#!/usr/bin/env node

// https://timonweb.com/posts/how-to-enable-es6-imports-in-nodejs/
require("@babel/register")({
    presets: ["@babel/preset-env"]
});

module.exports = require('./src/app.js')
