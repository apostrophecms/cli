require('shelljs/global');
// Utilities from shelljs
/* globals mkdir */
const fs = require('fs');
const path = require('path');
const util = require('../../util');

module.exports = function(moduleName, majorVersion, options) {
  const modulesDir = majorVersion === '2' ? 'lib/modules' : 'modules';
  const stringSet = majorVersion === '2' ? 'a2' : 'a3';
  const fullWidgetName = `${moduleName}-widget${majorVersion === '2' ? 's' : ''}`;

  util.log('add widget', `Adding ${fullWidgetName} folder to /${modulesDir}.`);

  const strings = util.getStrings(stringSet, 'add-widget', moduleName, options);

  const modulePath = path.join(modulesDir, fullWidgetName);

  mkdir('-p', modulePath);

  util.log('add widget', `Creating a views folder and widget.html for ${fullWidgetName}.`);

  mkdir('-p', path.join(modulePath, 'views'));

  const widgetView = strings.widgetsView || '';

  fs.writeFileSync(path.join(modulePath, 'views/widget.html'), widgetView);

  const widgetsConfig = strings.widgetsConfig;

  util.log('add widget', `Setting up index.js for ${fullWidgetName}.`);

  fs.writeFileSync(path.join(modulePath, 'index.js'), widgetsConfig);

  if (options.player) {
    const playerFilename = majorVersion === '2' ? 'lean.js' : 'browser.js';
    util.log('add widget', `Setting up ${playerFilename} for ${fullWidgetName}.`);

    const jsDir = majorVersion === '2' ? 'public/js' : 'ui/public';

    mkdir('-p', path.join(modulePath, jsDir));

    const jsConfig = strings.jsConfig;

    fs.writeFileSync(path.join(modulePath, jsDir, playerFilename), jsConfig);
  }

  return true;
};
