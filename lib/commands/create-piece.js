require('shelljs/global');
// Utilities from shelljs
/* globals mkdir exec */
const fs = require('fs');
const path = require('path');
const util = require('../util');
const { stripIndent } = require('common-tags');

module.exports = function (program, version) {
  program
    .command('create-piece <piece-type-name>')
    .description(stripIndent`
      Bootstrap a subclass of apostrophe-pieces with all the configuration you need to get started.
      Example: \`apos create-piece articles\`
    `)
    .option('--pages', 'Configure a corresponding apostrophe-pieces-pages module')
    .option('--widgets', 'Configure a corresponding apostrophe-pieces-widgets module')
    .action(function(moduleName, options) {
      if (!util.getAppPath('create-piece')) {
        return false;
      }

      const command = 'create-piece';
      const majorVersion = util.getMajorVersion(command, version);

      if (!majorVersion) {
        return false;
      }

      const modulesDir = majorVersion === '2' ? 'lib/modules' : 'modules';
      const stringSet = majorVersion === '2' ? 'a2' : 'a3';
      const strings = util.getStrings(stringSet, 'create-piece', moduleName);

      util.log('create-piece', `Adding ${moduleName} folder to /${modulesDir}.`);

      const modulePath = path.join(modulesDir, moduleName);

      mkdir('-p', modulePath);

      util.log('create-piece', `Setting up index.js for ${moduleName} module`);

      const pieceConfig = strings.pieceConfig;
      fs.writeFileSync(path.join(modulePath, 'index.js'), pieceConfig);

      util.log('create-piece', `YOUR NEXT STEP: add the ${moduleName} module to "modules" in app.js.`);

      // Piece page setup
      // ****************
      if (options.pages) {
        util.log('create-piece', `Creating a ${moduleName}-pages folder with index.js and appropriate views`);

        const pagesConfig = strings.pagesConfig;
        const pageDir = `${modulePath}-pages`;

        mkdir('-p', path.join(pageDir));
        fs.writeFileSync(path.join(pageDir, 'index.js'), pagesConfig);

        mkdir('-p', path.join(pageDir, 'views'));
        exec(`touch ${path.join(pageDir, 'views', 'show.html')}`);
        exec(`touch ${path.join(pageDir, 'views', 'index.html')}`);

        util.log('create-piece', `YOUR NEXT STEP: add the ${moduleName}-pages module to "modules" in app.js.`);
        util.log('create-piece', `YOUR NEXT STEP: add the ${moduleName}-page page type to the "types" array in ${modulesDir}/apostrophe-pages/index.js.`);
      }

      // Piece widget setup
      // ******************
      if (options.widgets) {
        util.log('create-piece', `Creating a ${moduleName}-widgets folder with index.js and appropriate views`);

        const widgetsConfig = strings.widgetsConfig;
        const widgetDir = `${modulePath}-widgets`;

        mkdir('-p', widgetDir);
        fs.writeFileSync(path.join(widgetDir, 'index.js'), widgetsConfig);

        mkdir('-p', path.join(widgetDir, 'views'));
        exec(`touch ${path.join(widgetDir, 'views', 'widget.html')}`);

        util.log('create-piece', `YOUR NEXT STEP: add the ${moduleName}-widgets module to "modules" in app.js.`);
      }

      util.success('create-piece');

      return true;
    });
};
