/*

Copyright 2018 Jared Forsyth <jared@jaredforsyth.com>
Modified 2020 Bryan Kok <bryan.wyern1@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

*/

var path = require('path'),
  moment = require('moment'),
  hfm = require('hexo-front-matter'),
  fs = require('hexo-fs'),
  extend = require('extend');
//  yfm = util.yfm,
//  escape = util.escape;


/**
 * Updates a post.
 *
 * @method update
 * @param {str} model the type of model being updated
 * @param {Object} post a post model
 * @param {Object} update attributes to update
 * @param {Function} callback
 */
module.exports = function (model, id, update, callback, hexo) {
  function removeExtname(str) {
    return str.substring(0, str.length - path.extname(str).length);
  }
  var post = hexo.model(model).get(id)
  if (!post) {
    return callback('Post not found');
  }
  var config = hexo.config,
    slug = post.slug = hfm.escape(post.slug || post.title, config.filename_case),
    layout = post.layout = (post.layout || config.default_layout).toLowerCase(),
    date = post.date = post.date ? moment(post.date) : moment();

  const split = hfm.split(post.raw);
  const frontMatter = split.data;
  const compiled = hfm.parse([frontMatter, '---', split.content].join('\n'));

  var preservedKeys = ['title', 'date', 'tags', 'categories', '_content', 'author'];
  Object.keys(hexo.config.metadata || {}).forEach(function (key) {
    preservedKeys.push(key);
  });
  var prev_full = post.full_source,
    full_source = prev_full;
  if (update.source && update.source !== post.source) {
    // post.full_source only readable ~ see: /hexo/lib/models/post.js
    full_source = hexo.source_dir + update.source
  }

  preservedKeys.forEach(function (attr) {
    if (attr in update) {
      compiled[attr] = update[attr]
    }
  });
  compiled.date = moment(compiled.date).toDate()

  delete update._content
  var raw = hfm.stringify(compiled);
  update.raw = raw
  update.updated = moment()

  // tags and cats are only getters now. ~ see: /hexo/lib/models/post.js
  if (typeof update.tags !== 'undefined') {
    post.setTags(update.tags)
    delete update.tags
  }
  if (typeof update.categories !== 'undefined') {
    post.setCategories(update.categories)
    delete update.categories
  }

  extend(post, update)

  post.save(function () {
    fs.writeFile(full_source, raw, function (err) {
      if (err) return callback(err);

      let new_source = post.source;
      if (full_source !== prev_full) {
        fs.unlinkSync(prev_full)
        // move asset dir
        var assetPrev = removeExtname(prev_full);
        const _ext = path.extname(full_source);
        var assetDest = removeExtname(full_source);
        new_source = assetDest + _ext;
        fs.exists(assetPrev).then(function (exist) {
          if (exist) {
            fs.copyDir(assetPrev, assetDest).then(function () {
              fs.rmdir(assetPrev);
            });
          }
        });
      }
      // console.log("post source after writing", post.source);
      hexo.source.process(post.source).then(function () {
        callback(null, hexo.model(model).get(id));
      });
    });
  });
}
