/**
 * This file takes care of updating posts and pages
 *
 * Unlike hexo-admin, the user edits the front matter too
 */

import fs from 'fs';
import path from 'path';

function removeExtname(str) {
  return str.substring(0, str.length - path.extname(str).length);
}

// TODO: add boolean to update the date to now

/**
 *
 * @param {str} model
 * @param {str} id
 * @param {str} raw
 * @param {Function} callback
 * @param {Object} hexo
 */
export function updateRaw(model, id, raw, callback, hexo) {
  const config = hexo.config;

  const item = hexo.model(model).get(id)
  if (!item) {
    return callback('Post not found');
  }

  // full_source is the full absolute path to the file on disk
  const prev_full = item.full_source,
    full_source = prev_full;

  // write the entire body including front matter to disk
  fs.writeFile(full_source, raw, function (err) {
    if (err) return callback(err);

    let new_source = item.source;
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
    hexo.source.process(item.source).then(function () {
      callback(null, hexo.model(model).get(id));
    });
  });

}

/**
 * the update logic is too convoluted to reuse for page deletion
 * Example path: full_source: "/home/user/hexo_blog/source/about/index.md"
 **/
export function removePage(id, callback, program, hexo) {
  const config = hexo.config;
  const _item = hexo.model('Page').get(id);

  if (!_item) { return callback('Page not found'); }

  const _sourceDir = path.join(program.hexoDir, hexo.config.source_dir);
  const relativePath = path.relative(_sourceDir, _item.full_source);

  const { dir: _relativeDir, base } = path.parse(relativePath);

  const _resultDir = path.join(_sourceDir, '_discarded_pages', _relativeDir);

  // synchronous
  fs.mkdirSync(_resultDir, { recursive: true });

  // copy the actual .md into the newly created dir
  fs.copyFileSync(_item.full_source, path.join(_resultDir, base));
  fs.unlinkSync(_item.full_source);

  const { dir: origPageFolder } = path.parse(_item.full_source);

  // if it is empty, then delete the folder
  fs.readdir(origPageFolder, function (err, files) {
    if (err) {
      return callback("Error occurred while trying to determine if the page folder is empty.");
    } else {
      if (!files.length) {
        // delete the directory
        fs.rmdirSync(origPageFolder);
      }
    }

    hexo.source.process().then(function () {
      callback(null);
    });
  });



  // recreate the folder structure in _discarded_pages, e.g. /about
  // move post into the newly created folder
  // if the original folder /home/user/hexo_blog/source/about/ is empty, delete it




}