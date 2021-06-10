require('shelljs/global');
// Utilities from shelljs
/* globals mkdir */
const fs = require('fs');
const path = require('path');
const util = require('../util');
const { stripIndent } = require('common-tags');

module.exports = function (program, version) {
  program
    .command('create-widget <widget-type-name>')
    .option('--player', 'Also add a public/js folder to your new apostrophe-widgets module directory with an always.js set up with an apostrophe player.')
    .description(stripIndent`
      Bootstrap a subclass of apostrophe-widgets with all the configuration you need to get started.
      Example: \`apos create-widget gallery\``)
    .action(function(moduleName, options) {
      if (!util.getAppPath('create-widget')) {
        return false;
      }

      const command = 'create-widget';
      const majorVersion = util.getMajorVersion(command, version);

      if (!majorVersion) {
        return false;
      }

      const modulesDir = majorVersion === '2' ? 'lib/modules' : 'modules';
      const stringSet = majorVersion === '2' ? 'a2' : 'a3';

      util.log('create-widget', `Adding ${moduleName}-widgets folder to /${modulesDir}.`);

      const strings = util.getStrings(stringSet, 'create-widget', moduleName, options);

      const fullWidgetName = `${moduleName}-widgets`;
      const modulePath = path.join(modulesDir, fullWidgetName);

      mkdir('-p', modulePath);

      util.log('create-widget', `Creating a views folder and widget.html for ${fullWidgetName}.`);

      mkdir('-p', path.join(modulePath, 'views'));

      const widgetView = strings.widgetsView || '';

      fs.writeFileSync(path.join(modulePath, 'views/widget.html'), widgetView);

      const widgetsConfig = strings.widgetsConfig;

      util.log('create-widget', `Setting up index.js for ${fullWidgetName}.`);

      fs.writeFileSync(path.join(modulePath, 'index.js'), widgetsConfig);

      if (options.player) {
        const playerFilename = majorVersion === '2' ? 'lean.js' : 'browser.js';
        util.log('create-widget', `Setting up ${playerFilename} for ${fullWidgetName}.`);
        mkdir('-p', path.join(modulePath, 'public/js'));

        const jsConfig = strings.jsConfig;

        fs.writeFileSync(path.join(modulePath, 'public/js', playerFilename), jsConfig);
      }

      util.success('create-widget');

      return true;
    });
};
