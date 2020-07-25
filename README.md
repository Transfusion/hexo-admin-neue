<img align="left" width="50" height="58" src="https://i.imgur.com/yMUTfA9.png">

# hexo-admin-neue

A fully responsive, mobile-friendly admin interface for Hexo.

![](https://i.imgur.com/AbrzFBU.gif)

Skip to [Running in production](#running-in-production) if you've just completed `npm install hexo-admin-neue -g` !

## Windows Users

A few quirks I noticed while briefly testing on Windows 10 1903:
- Works with node.js 12.18.3.
- Calling `npm ci` in the `frontend` folder will fail because [fsevents < 2 is a transitive dependency](https://github.com/fsevents/fsevents/issues/301), of `create-react-app`.
- `--hexo-dir` cannot end in a backslash in [development mode](#development), possibly because of some interaction with the `--` used to pass arguments to `npm start`.
- Setting environment variables can be done like this: `> $env:PUBLIC_URL='/admin_neue'; ham-build-frontend.cmd`. Remember to unset it after.
## Usage
```
$ hexo-admin-neue -h
Usage: hexo-admin-neue [options]

Options:
  -p, --port <port>       Port to listen on
  -d, --hexo-dir <dir>    Your hexo site's directory (may be relative)
  -sp, --sub-path <path>  Subpath that the app should be served under (e.g. admin/, should be identical to the
                          PUBLIC_URL environment variable used when running or building the frontend)
  --dev-frontend <url>    Root url of the frontend's create-react-app server.
  -h, --help              display help for command
```

The app is structured as follows:

The admin interface will be served under a 1st level `--sub-path`; hence `https://example.com/some_sub_path`, assuming your domain name is `example.com`. The API that the frontend depends on will be located at `some_sub_path/api`. In production mode, such as when you're done with `npm install hexo-admin-neue -g`, it expects the frontend to be located in the the `www` folder.

Since the frontend is bootstrapped with `create-react-app` and makes use of `react-router`'s client side routing, it has to be built with the `PUBLIC_URL` environment variable set to the `--sub-path`.

All requests that do not match the `--sub-path` will be served statically from the `public_dir` located in your Hexo's `config.yml`; i.e. all paths that do not start with the `--sub-path` will serve your generated Hexo blog as is from the root. This allows us to preview uploaded images and other assets...

<img align="center" width="650" src="https://i.imgur.com/4n8AcK3.png">

Or even cooler things such as raw HTML in iframes..

<img align="center" width="650" src="https://i.imgur.com/eqPC65O.png">

...which look like this when published!

<img align="center" width="650" src="https://i.imgur.com/L1R07HK.png">

## Development
`create-react-app`'s development server needs to be reverse proxied through the express application server because it expects to be served under `--sub-path` as mentioned above.

`cd` into the `frontend` folder and start the development server as usual:
```
...hexo-admin-neue/frontend$ PUBLIC_URL=/some_sub_path npm start -p 3000
```

Run `hexo-admin-neue` with the `--dev-frontend` flag:
```sh
.../hexo-admin-neue$ npm run start -- -p 3500 -d ~/my_hexo_blog -sp some_sub_path/ --dev-frontend http://localhost:3000
...
[HPM] Proxy created: /  -> http://localhost:3000
[HPM] Subscribed to http-proxy events: [ 'error', 'close' ]
Listening on port 3500
```

Browse to `http://localhost:3500/some_sub_path` .

## Production

### Compiling and running in production mode **with this repo cloned**:

Build `frontend` :
```sh
.../hexo-admin-neue$ PUBLIC_URL=/some_sub_path npm run build-frontend
...
  36.37 KB  build/static/css/2.ec53bf1e.chunk.css
  9.35 KB   build/static/js/main.869fb407.chunk.js
  1.42 KB   build/static/css/main.8db02cd5.chunk.css
  786 B     build/static/js/runtime-main.cdf6b95b.js

The project was built assuming it is hosted at /some_sub_path/.
You can control this with the homepage field in your package.json.

The build folder is ready to be deployed.
...
```
Runing `hexo-admin-neue` without the `--dev-frontend` flag will serve the frontend from the `www` folder in the root.

```sh
.../hexo-admin-neue$ npm run start -- -p 3500 -d ~/my_hexo_blog -sp some_sub_path/
```

### Running in production:

The command to rebuild the frontend is exposed as `ham-rebuild-frontend`. This command must be run whenever you want the admin subpath to change before starting the admin interface (e.g. if `some_sub_path/` just happens to coincide with a Hexo page you have.)

**Remember to include the slashes like the examples below!**

```sh
$ PUBLIC_URL=/some_sub_path ham-build-frontend
...
  36.37 KB   build/static/css/2.a2000c3d.chunk.css
  9.4 KB     build/static/js/main.2a5e9ea9.chunk.js
  1.42 KB    build/static/css/main.abf77429.chunk.css
  790 B      build/static/js/runtime-main.9d2e2fce.js

The project was built assuming it is hosted at /some_sub_path/.
You can control this with the homepage field in your package.json.

The build folder is ready to be deployed.
...
```
The admin interface itself is `hexo-admin-neue`.
```
$ hexo-admin-neue -p 3500 -d ~/my_hexo_blog -sp some_sub_path/
...
INFO  === Checking package dependencies ===
INFO  === Checking the configuration file ===
INFO  === Registering Hexo extensions ===
INFO  Start processing
Session store initialized.
Listening on port 3500
```

You may now create a server block or virtualhost that points a subdomain to `http://localhost:3500`.

## Tips
- Follow the instructions in `Settings` to setup a basic username and password.
- Running `hexo-admin-neue` under a process manager such as `pm2` that auto-restarts the app if it is terminated is recommended, e.g. `pm2 start hexo-admin-neue -- -p 3500 -d ~/my_hexo_blog -sp some_sub_path/`.
  - `Hexo Commands > Kill Server` terminates the server in case you encounter undefined behavior or you are trying something that otherwise requires an entire server restart such as editing config files.
- Remember to click `Hexo Commands > Generate` after you save a post or page for your changes to be reflected in the preview! In effect, saving simply saves the file and calls `Box.process` on your saved post to reload it into memory.
- The same applies to uploading assets such as images; click `Generate` to copy them over to the `public_dir` so you can then reference them in the markdown. For instance, if you uploaded `abc.jpg` to `images`, you would reference it as `![My Image](/images/abc.jpg)` within your markdown.