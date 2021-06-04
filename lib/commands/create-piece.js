require('shelljs/global');
// Utilities from shelljs
/* globals mkdir exec */
const fs = require('fs');
const util = require('../util');
const { stripIndent } = require('common-tags');

module.exports = function (program) {
  program
    .command('create-piece <piece-type-name>')
    .description(stripIndent`
      Bootstrap a subclass of apostrophe-pieces with all the configuration you need to get started.
      Example: \`apos create-piece articles\`
    `)
    .option('--pages', 'Configure a corresponding apostrophe-pieces-pages module')
    .option('--widgets', 'Configure a corresponding apostrophe-pieces-widgets module')
    .action(function(pieceName, options) {

      if (!util.getAppPath('create-piece')) {
        return false;
      }

      const moduleName = pieceName;

      util.log('create-piece', 'Adding ' + moduleName + ' folder to /lib/modules.');

      const path = 'lib/modules/' + moduleName;

      mkdir('-p', path);

      const pieceConfig = stripIndent`
        module.exports = {
          extend: 'apostrophe-pieces',
          // TODO: Update the piece type name to be the singular version of the module
          // name. For example, if the module is "people" the piece type name should be
          // "person".
          name: '${pieceName}',
          // TODO: Update the singular label for editors
          label: '${util.titleCase(pieceName.replace(/-/g, ' '))}',
          // TODO: Update the plural label for editors
          pluralLabel: '${util.titleCase(pieceName.replace(/-/g, ' '))}',
          addFields: []
        };
      `;

      util.log('create-piece', 'Setting up index.js for ' + moduleName + ' module');
      fs.writeFileSync(path + '/index.js', pieceConfig);

      if (options.pages) {
        util.log('create-piece', 'Creating a ' + moduleName + '-pages folder with index.js and appropriate views');

        const pagesConfig = stripIndent`
          module.exports = {
            extend: 'apostrophe-pieces-pages',
            label: '${util.titleCase(pieceName.replace(/-/g, ' '))} Page',
            addFields: []
          };
        `;

        mkdir('-p', path + '-pages');
        fs.writeFileSync(path + '-pages/index.js', pagesConfig);

        mkdir('-p', path + '-pages/views');
        exec('touch ' + path + '-pages/views/show.html');
        exec('touch ' + path + '-pages/views/index.html');
        util.log('create-piece', 'YOUR NEXT STEP: add the ' + moduleName + '-pages module to "modules" in app.js.');
        util.log('create-piece', 'YOUR NEXT STEP: add the ' + pieceName + '-page page type to the "types" array in lib/modules/apostrophe-pages/index.js.');
      }

      if (options.widgets) {
        util.log('create-piece', 'Creating a ' + moduleName + '-widgets folder with index.js and appropriate views');

        const widgetsConfig = stripIndent`
          module.exports = {
            extend: 'apostrophe-pieces-widgets',
            label: '${util.titleCase(pieceName.replace(/-/g, ' '))} Widget',
            addFields: []
          };
        `;

        mkdir('-p', path + '-widgets');
        fs.writeFileSync(path + '-widgets/index.js', widgetsConfig);

        mkdir('-p', path + '-widgets/views');
        exec('touch ' + path + '-widgets/views/widget.html');
        util.log('create-piece', 'YOUR NEXT STEP: add the ' + moduleName + '-widgets module to "modules" in app.js.');
      }
      util.log('create-piece', 'YOUR NEXT STEP: add the ' + moduleName + ' module to "modules" in app.js.');

      util.success('create-piece');

      return true;
    });
};
