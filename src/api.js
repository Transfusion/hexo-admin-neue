import extend from 'extend';
import fs from 'fs';

var updateAny = require('./update')
  , updatePage = updateAny.bind(null, 'Page')
  , update = updateAny.bind(null, 'Post')
  , deploy = require('./deploy')

import { updateRaw, removePage } from './update-utils';
import { Mutex, Semaphore, withTimeout } from 'async-mutex';

let HEXO_WATCHING = true;

module.exports = (app, hexo, rootAPIPath, program) => {

  function addIsDraft(post) {
    post.isDraft = post.source.indexOf('_draft') === 0
    post.isDiscarded = post.source.indexOf('_discarded') === 0
    return post
  }

  function tagsCategoriesAndMetadata() {
    var cats = {}
      , tags = {}
    hexo.model('Category').forEach(function (cat) {
      cats[cat._id] = cat.name
    })
    hexo.model('Tag').forEach(function (tag) {
      tags[tag._id] = tag.name
    })
    return {
      categories: cats,
      tags: tags,
      metadata: Object.keys(hexo.config.metadata || {})
    }
  }

  // reads admin panel settings from _admin-config.yml
  // or writes it if it does not exist
  function getSettings() {
    var path = hexo.base_dir + '_admin-config.yml'
    if (!fs.existsSync(path)) {
      hexo.log.d('admin config not found, creating one')
      fs.writeFile(hexo.base_dir + '_admin-config.yml', '')
      return {}
    } else {
      var settings = yml.safeLoad(fs.readFileSync(path))

      if (!settings) return {}
      return settings
    }
  }

  function removePost(id, body, res) {
    var post = hexo.model('Post').get(id)
    if (!post) return res.send(404, "Post not found")
    var newSource = '_discarded_posts/' + post.source.slice('_drafts'.length)
    update(id, { source: newSource }, function (err, post) {
      if (err) {
        return res.send(400, err);
      }
      res.done(addIsDraft(post))
    }, hexo)
  }

  function _removePage(id, body, res) {
    var page = hexo.model('Page').get(id)
    if (!page) return res.send(404, "Page not found")
    // var newSource = '_discarded_pages/' + page.source.slice('_drafts'.length)
    /* updatePage(id, { source: newSource }, function (err, page) {
      if (err) {
        return res.send(400, err);
      }
      res.done(addIsDraft(page))
    }, hexo) */
    removePage(id, function (err) {
      if (err) { return res.send(400, err); }
      res.done();
    }, program, hexo);
  }

  const publishUnpublishMutex = new Mutex();

  async function publish(id, body, res) {
    const release = await publishUnpublishMutex.acquire();
    var post = hexo.model('Post').get(id);
    if (!post) {
      release();
      return res.send(404, "Post not found")
    }

    if (!fs.existsSync(post.full_source)) {
      release();
      return res.send(500, "Post file not found.");
    }

    if (post.source.includes("_posts")) {
      // cannot publish a post that is already published
      release();
      return res.send(500, "Post has already been published.");
    }

    var newSource = '_posts/' + post.source.slice('_drafts/'.length)
    // console.log("attempting publish to new source", post.source, newSource);
    update(id, { source: newSource }, function (err, post) {
      release();
      if (err) {
        return res.send(400, err);
      }
      res.done(addIsDraft(post))
    }, hexo)
  }

  async function unpublish(id, body, res) {
    const release = await publishUnpublishMutex.acquire();
    var post = hexo.model('Post').get(id);
    if (!post) {
      release();
      return res.send(404, "Post not found")
    }

    // if post.full_source doesn't exist then we are perhaps halfway through a previous unpublish request! (race condition)

    if (!fs.existsSync(post.full_source)) {
      release();
      return res.send(500, "Post file not found.");
    }

    if (post.source.includes("_draft")) {
      // cannot unpublish a post that hasn't been published
      release();
      return res.send(500, "Post has not been published.");
    }


    var newSource = '_drafts/' + post.source.slice('_posts/'.length)
    update(id, { source: newSource }, function (err, post) {
      release();
      if (err) {
        return res.send(400, err);
      }
      res.done(addIsDraft(post))
    }, hexo)
  }

  function rename(id, body, res) {
    var model = 'Post'
    var post = hexo.model('Post').get(id)
    if (!post) {
      model = 'Page'
      post = hexo.model('Page').get(id)
      if (!post) return res.send(404, "Post not found")
    }
    // remember old path w/o index.md
    var oldPath = post.full_source
    oldPath = oldPath.slice(0, oldPath.indexOf('index.md'))

    updateAny(model, id, { source: body.filename }, function (err, post) {
      if (err) {
        return res.send(400, err);
      }
      hexo.log.d(`renamed ${model.toLowerCase()} to ${body.filename}`)

      // remove old folder if empty
      if (model === 'Page' && fs.existsSync(oldPath)) {
        if (fs.readdirSync(oldPath).length === 0) {
          fs.rmdirSync(oldPath)
          hexo.log.d('removed old page\'s empty directory')
        }
      }

      res.done(addIsDraft(post))
    }, hexo)
  }

  var use = function (path, fn) {
    app.use('/' + rootAPIPath + path, function (req, res) {
      var done = function (val) {
        if (!val) {
          res.statusCode = 204
          return res.end('');
        }
        res.setHeader('Content-type', 'application/json')
        res.end(JSON.stringify(val, function (k, v) {
          // tags and cats have posts reference resulting in circular json..
          if (k == 'tags' || k == 'categories') {
            // convert object to simple array
            return v.toArray ? v.toArray().map(function (obj) {
              return obj.name
            }) : v
          }
          return v;
        }))
      }
      res.done = done
      res.send = function (num, data) {
        res.statusCode = num
        res.end(data)
      }
      fn(req, res)
    })
  }


  use('settings/list', function (req, res) {
    res.done({ sample: 'jancok' });
  });

  use('posts/list', function (req, res) {
    var post = hexo.model('Post')
    res.done(post.toArray().map(addIsDraft));
  });

  use('posts/new', function (req, res, next) {
    if (req.method !== 'POST') return next()
    if (!req.body) {
      return res.send(400, 'No post body given');
    }
    if (!req.body.title) {
      return res.send(400, 'No title given');
    }

    var postParameters = { title: req.body.title, layout: 'draft', date: new Date(), author: hexo.config.author };
    extend(postParameters, hexo.config.metadata || {});
    hexo.post.create(postParameters)
      .error(function (err) {
        console.error(err, err.stack)
        return res.send(500, 'Failed to create post')
      })
      .then(function (file) {
        var source = file.path.slice(hexo.source_dir.length)
        hexo.source.process([source]).then(function () {
          var post = hexo.model('Post').findOne({ source: source.replace(/\\/g, '\/') })
          res.done(addIsDraft(post));
        });
      });
  });

  use('posts/', function (req, res, next) {
    var url = req.url
    if (url[url.length - 1] === '/') {
      url = url.slice(0, -1)
    }
    var parts = url.split('/')
    var last = parts[parts.length - 1]
    if (last === 'publish') {
      return publish(parts[parts.length - 2], req.body, res)
    }
    if (last === 'unpublish') {
      return unpublish(parts[parts.length - 2], req.body, res)
    }
    if (last === 'remove') {
      return removePost(parts[parts.length - 2], req.body, res)
    }
    if (last === 'rename') {
      return rename(parts[parts.length - 2], req.body, res)
    }

    var id = last
    if (id === 'posts' || !id) return next()
    if (req.method === 'GET') {
      var post = hexo.model('Post').get(id)
      if (!post) return next()
      return res.done(addIsDraft(post))
    }

    if (!req.body) {
      return res.send(400, 'No post body given');
    }

    /* update(id, req.body, function (err, post) {
      if (err) {
        return res.send(400, err);
      }
      res.done({
        post: addIsDraft(post),
        tagsCategoriesAndMetadata: tagsCategoriesAndMetadata()
      })
    }, hexo); */

    if (!req.body.postRaw) {
      return res.send(400, 'No raw post given');
    }

    updateRaw('Post', id, req.body.postRaw, function (err, post) {
      if (err) {
        return res.send(400, err);
      }
      res.done({
        post: addIsDraft(post),
        tagsCategoriesAndMetadata: tagsCategoriesAndMetadata()
      })
    }, hexo);

  });

  use('pages/list', function (req, res) {
    var page = hexo.model('Page')
    res.done(page.toArray().map(addIsDraft));
  });

  use('pages/new', function (req, res, next) {
    if (req.method !== 'POST') return next()
    if (!req.body) {
      return res.send(400, 'No page body given');
    }
    if (!req.body.title) {
      return res.send(400, 'No title given');
    }

    hexo.post.create({ title: req.body.title, layout: 'page', date: new Date() })
      .error(function (err) {
        console.error(err, err.stack)
        return res.send(500, 'Failed to create page')
      })
      .then(function (file) {
        var source = file.path.slice(hexo.source_dir.length)

        hexo.source.process([source]).then(function () {
          var page = hexo.model('Page').findOne({ source: source })
          res.done(addIsDraft(page));
        });
      });
  });

  use('pages/', function (req, res, next) {
    var url = req.url
    if (url[url.length - 1] === '/') {
      url = url.slice(0, -1)
    }
    var parts = url.split('/')
    var last = parts[parts.length - 1]
    // not currently used?
    if (last === 'remove') {
      return _removePage(parts[parts.length - 2], req.body, res)
    }
    if (last === 'rename') {
      return rename(parts[parts.length - 2], req.body, res)
    }

    var id = last
    if (id === 'pages' || !id) return next()
    if (req.method === 'GET') {
      var page = hexo.model('Page').get(id)
      if (!page) return next()
      return res.done(addIsDraft(page))
    }

    if (!req.body) {
      return res.send(400, 'No page body given');
    }

    if (!req.body.pageRaw) {
      return res.send(400, 'No raw page given');
    }

    updateRaw('Page', id, req.body.pageRaw, function (err, page) {
      if (err) {
        return res.send(400, err);
      }
      res.done({
        page: addIsDraft(page),
        // no tag support for pages just yet https://github.com/hexojs/hexo/issues/1067
      })
    }, hexo);


  });

  use('settings/list', function (req, res) {
    res.done(getSettings())
  });

  /* use('mdrender', function (req, res, next) {
    if (req.method !== 'POST') return next()
    if (!req.body || !req.body.md) {
      return res.send(400, 'No markdown to render');
    }
    console.log(hexo.render.renderSync({ text: req.body.md, engine: 'markdown' }));
    // render with marked
    hexo.render.render({ text: req.body.md, engine: 'markdown' }).then(function (result) {
      res.done(result);
    });
  }); */

  use('generate', function (req, res, next) {
    if (req.method !== 'POST') return next()
    hexo.call('generate').then(function () {
      res.done();
    }).catch(function (err) {
      console.log(err);

      return res.send(400, err.message);
    });
  })

  // https://web.archive.org/web/20200531084213/https://johnwonder.github.io/2016/09/11/hexo-call/
  use('deploy', function (req, res, next) {
    if (req.method !== 'POST') return next()
    try {
      let args;
      if (req.body.args) {
        args = req.body.args.split(' ');
      } else {
        args = [];
      }

      hexo.call('deploy', { _: args }).then(function () {
        res.done();
      })

    } catch (e) {
      res.statusCode = 500;
      res.setHeader('Content-type', 'application/json')
      res.end(JSON.stringify({ error: e.message }));
    }
  });


  use('clean', function (req, res, next) {
    if (req.method !== 'POST') return next()
    hexo.call('clean').then(function () {
      res.done();
    }).catch(function (err) {
      console.log(err);

      return res.send(400, err.message);
    });
  })

  use('watch/status', function (req, res, next) {
    if (req.method !== 'GET') return next()
    res.done({ watching: HEXO_WATCHING });
  })

  // unwatch and watch
  use('watch', function (req, res, next) {
    if (req.method !== 'POST') return next()
    hexo.watch().then(function () {
      HEXO_WATCHING = true;
      res.done();
    }).catch(function (err) {
      console.log(err);

      return res.send(400, err.message);
    });
  })

  use('unwatch', function (req, res, next) {
    if (req.method !== 'POST') return next()
    // void function
    hexo.unwatch();
    HEXO_WATCHING = false;
    res.done();
  })

  use('kill-server', function (req, res, next) {
    if (req.method !== 'POST') return next()
    res.statusCode = 204
    res.end('');
    // app._server.close(() => {
      process.exit(0);
    // });
  });

  use('profile', function (req, res, next) {
    const passwordProtected = hexo.config.admin && hexo.config.admin.username;
    if (req.method !== 'GET') return next()
    if (passwordProtected && req.isAuthenticated()) {
      res.done({ authenticated: true, user: req.user });
    } else {
      // the auth route will return success: false
      res.done({ authenticated: false, passwordProtected: !!passwordProtected });
    }

  });
}

