const { stripIndent } = require('common-tags');
const util = require('./util');

module.exports = function (moduleName, options = {}) {
  return {
    a2: {
      'create-module': {
        moduleConfig: stripIndent`
          module.exports = {
            extend: 'apostrophe-module',
            construct: function (self, options) {

            }
          };
        `
      },
      'create-piece': {
        pieceConfig: stripIndent`
          module.exports = {
            extend: 'apostrophe-pieces',
            // TODO: Update the piece type name to be the singular version of the module
            // name. For example, if the module is "people" the piece type name should be
            // "person".
            name: '${moduleName}',
            // TODO: Update the singular label for editors
            label: '${util.titleCase(moduleName.replace(/-/g, ' '))}',
            // TODO: Update the plural label for editors
            pluralLabel: '${util.titleCase(moduleName.replace(/-/g, ' '))}',
            addFields: []
          };
        `,
        pagesConfig: stripIndent`
          module.exports = {
            extend: 'apostrophe-pieces-pages',
            label: '${util.titleCase(moduleName.replace(/-/g, ' '))} Page',
            addFields: []
          };
        `,
        widgetsConfig: stripIndent`
          module.exports = {
            extend: 'apostrophe-pieces-widgets',
            label: '${util.titleCase(moduleName.replace(/-/g, ' '))} Widget',
            addFields: []
          };
        `
      },
      'create-widget': {
        widgetsConfig: stripIndent`
          module.exports = {
            extend: 'apostrophe-widgets',
            label: '${util.titleCase(moduleName.replace(/-/g, ' '))} Widget',
            addFields: []${options.player ? `,
            construct: function (self, options) {
              self.pushAsset('script', 'lean', { when: 'lean' });
            }` : ''}
          };
        `,
        jsConfig: stripIndent`
          apos.utils.widgetPlayers['${moduleName}'] = function(el, data, options) {
            // Lean widget player documentation:
            // https://docs.apostrophecms.org/core-concepts/editable-content-on-pages/custom-widgets.html#adding-a-javascript-widget-player-on-the-browser-side
          };
        `
      }
    }
  };
};
