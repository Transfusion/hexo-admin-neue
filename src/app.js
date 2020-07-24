#!/usr/bin/env node

import Hexo from 'hexo';
import url from 'url';
import process from 'process';
import express from 'express';
import proxy from 'express-http-proxy';
import { createProxyMiddleware } from "http-proxy-middleware"; // just for the react devmode live reloading...
import compression from 'compression';
import path from 'path';
import { program } from 'commander';
import bodyParser from 'body-parser';
import { middleware } from '@opuscapita/filemanager-server';
const fileManagerMiddleware = middleware;

import { FILE_MANAGER_API_PATH, API_PATH } from './constants';

import api from './api';

// const PROGRAM_ROOT = process.cwd();
// let PROGRAM_ROOT = __dirname;
// const parsedPath = path.parse(PROGRAM_ROOT);
// if (parsedPath.base === 'dist') {
//   PROGRAM_ROOT = parsedPath.dir;
// }

const PROGRAM_ROOT = path.parse(__dirname).dir;

program
  .requiredOption('-p, --port <port>', 'Port to listen on')
  .requiredOption('-d, --hexo-dir <dir>', 'Your hexo site\'s directory (may be relative)')
  .requiredOption('-sp, --sub-path <path>', 'Subpath that the app should be served under (e.g. admin/, should be identical to the PUBLIC_URL environment variable used when running or building the frontend)')
  .option('--dev-frontend <url>', 'Root url of the frontend\'s create-react-app server.');

program.parse(process.argv);

/* several hexo plugins such as hexo-generator-sitemap expect the cwd to be the hexo directory
 Unhandled rejection Error: ENOENT: no such file or directory, open './sitemap_template.xml' */
process.chdir(program.hexoDir);

const hexo = new Hexo(program.hexoDir, { debug: false, safe: false });

hexo.init().then(() => {
  /* If we use hexo.load() here, the db.json **WILL NOT** be updated when we publish or unpublish the post!!!
   DO NOT WASTE 12 HOURS OF YOUR LIFE ON THIS */
  return hexo.watch()
}).then(() => {
  return hexo.source.process()
}).then(() => {

  const fileManagerConfig = {
    fsRoot: path.resolve(program.hexoDir),
    rootName: 'Hexo Root'
  }

  const app = express();
  app.use(compression());
  app.use(bodyParser.json());

  const passwordProtected = hexo.config.admin && hexo.config.admin.username;
  if (passwordProtected) {
    require('./auth')(app, hexo, program.subPath + API_PATH);   // setup authentication, login page, etc.
  }

  app.use('/' + program.subPath + API_PATH, bodyParser.json({ limit: '200mb' }));
  api(app, hexo, program.subPath + API_PATH, program);


  // file manager
  if (passwordProtected) {
    app.use('/' + program.subPath + FILE_MANAGER_API_PATH, (req, res, next) => {
      if (req.isAuthenticated()) {
        console.log(req.session.cookie);
        next();
      } else {
        res.redirect(302, '/' + program.subPath);
      }
    });
  }

  // react devmode HMR
  // https://github.com/villadora/express-http-proxy/issues/28
  if (!!program.devFrontend) {
    app.use('/sockjs-node', createProxyMiddleware({
      target: program.devFrontend,
      changeOrigin: true,
      ws: true,
      logLevel: 'debug'
    }));
  }

  // opuscapita's file manager
  app.use('/' + program.subPath + FILE_MANAGER_API_PATH, fileManagerMiddleware(fileManagerConfig));

  // serve the frontend assets, public folder, css, etc which are meant to be publicly accesssible
  if (!!program.devFrontend) {
    app.use('/' + program.subPath, proxy(program.devFrontend, {
      proxyReqPathResolver: function (req) {
        return url.parse(req.originalUrl).path;
      }
    }));
  } else {
    app.use('/' + program.subPath, express.static(path.join(PROGRAM_ROOT, 'www')));
  }

  // serve the index.html file for routing purposes
  if (!!program.devFrontend) {
    app.get('/' + program.subPath + "*", proxy(program.devFrontend, {
      proxyReqPathResolver: function (req) {
        return program.subPath + '/index.html';
      }
    }));
  } else {
    app.get('/' + program.subPath + "*", function (req, res, next) {
      res.sendFile(path.join(PROGRAM_ROOT, 'www', 'index.html'));
    });
  }

  // serve the public folder if one exists
  if (passwordProtected) {
    app.use('/*', (req, res, next) => {
      if (req.isAuthenticated()) {
        console.log(req.session.cookie);
        next();
      } else {
        /* res.statusCode = 403;
        res.setHeader('Content-type', 'application/json');
        const body = { success: false, error: 'Forbidden' };
        return res.end(JSON.stringify(body));*/
        res.redirect(302, '/' + program.subPath);
      }
    });
  }

  app.get('/*', express.static(path.join(program.hexoDir, hexo.config.public_dir)));

  // assign to app._server so we can kill the process from within api.js
  app._server = app.listen(program.port, () => console.log(`Listening on port ${program.port}`));

})
