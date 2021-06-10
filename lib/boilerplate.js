const { stripIndent } = require('common-tags');
const util = require('./util');

module.exports = function (moduleName, options = {}) {
  return {
    a2: {
      'add-module': {
        moduleConfig: stripIndent`
          module.exports = {
            extend: 'apostrophe-module',
            construct: function (self, options) {

            }
          };
        `
      },
      'add-piece': {
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
      'add-widget': {
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
    },
    a3: {
      'add-module': {
        moduleConfig: stripIndent`
          module.exports = {
            extend: '@apostrophecms/module',
            init(self) {

            }
          };
        `
      },
      'add-piece': {
        pieceConfig: stripIndent`
          module.exports = {
            extend: '@apostrophecms/piece-type',
            options: {
              label: '${util.titleCase(moduleName.replace(/-/g, ' '))}',
              // TODO: Update the plural label for editors
              pluralLabel: '${util.titleCase(moduleName.replace(/-/g, ' '))}',
            },
            fields: {
              add: {},
              group: {}
            }
          };
        `,
        pagesConfig: stripIndent`
          module.exports = {
            extend: '@apostrophecms/piece-page-type',
            options: {
              label: '${util.titleCase(moduleName.replace(/-/g, ' '))} Page',
              pluralLabel: '${util.titleCase(moduleName.replace(/-/g, ' '))} Pages',
            },
            fields: {
              add: {},
              group: {}
            }
          };
        `
      },
      'add-widget': {
        widgetsConfig: stripIndent`
          module.exports = {
            extend: '@apostrophecms/widget-type',
            options: {
              label: '${util.titleCase(moduleName.replace(/-/g, ' '))} Widget',
            },
            fields: {
              add: {}
            }
          };
        `,
        widgetsView: stripIndent`
          <section data-${moduleName}-widget>
          </section>
        `,
        jsConfig: stripIndent`
          apos.util.widgetPlayers['${moduleName}'] = {
            selector: '[data-${moduleName}-widget]',
            player: function(el) {
              // Add player code
            }
          };
        `
      }
    }
  };
};
