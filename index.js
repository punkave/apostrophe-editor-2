var extend = require('extend');
var _ = require('underscore');
var clone = require('clone');

module.exports = function(options, callback) {
  return new Construct(options, callback);
};

module.exports.Construct = Construct;

function Construct(options, callback) {
  var apos = options.apos;
  var app = options.app;

  var self = this;

  console.log('editor-2');
  // TODO: refactor the .modules stuff from snippets/index.js so we can do easy
  // overrides of templates here and in any module, don't keep copying all that code

  self.pushAsset = function(type, name, optionsArg) {
    var options = {};
    extend(true, options, optionsArg);
    options.fs = __dirname;
    options.web = '/apos-editor-2';
    return apos.pushAsset(type, name, options);
  };

  self.pushAsset('script', 'vendor/ckeditor/ckeditor', { when: 'user' });
  self.pushAsset('script', 'editor', { when: 'user' });
  self.pushAsset('stylesheet', 'editor', { when: 'user' });
  self.pushAsset('template', 'itemButtons', { when: 'user' });
  self.pushAsset('template', 'lockedItemButtons', { when: 'user' });
  self.pushAsset('template', 'lockupButtons', { when: 'user' });
  self.pushAsset('template', 'richText', { when: 'user' });
  self.pushAsset('template', 'itemSeparator', { when: 'user' });

  self.render = function(name, data) {
    return apos.partial(name, data, __dirname + '/views');
  };

  app.post('/apos-editor-2/content-menu', function(req, res) {
    var controls;
    if (req.body.controls) {
      controls = apos.sanitizeTags(req.body.controls);
    } else {
      // So we don't inadvertently modify the original
      controls = clone(apos.defaultControls);
    }
    richText = apos.sanitizeBoolean(req.query.richText, true);
    if (richText) {
      controls.unshift('richText');
    }
    return res.send(self.render('contentMenu', { controls: controls, itemTypes: apos.itemTypes, richText: richText }));
  });

  // Serve our assets
  app.get('/apos-editor-2/*', apos.static(__dirname + '/public'));

  // Constructor name for our client side object that edits areas and should be
  // instantiated whenever an area the user has permission to output is present
  // without waiting for an edit button to be clicked ("always editing")
  apos.alwaysEditing = 'AposEditor2';

  return setImmediate(function() { return callback(null); });
}