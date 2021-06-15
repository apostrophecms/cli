require('shelljs/global');
// Utilities from shelljs
/* globals mkdir */
const fs = require('fs');
const path = require('path');
const util = require('../../util');

module.exports = function(moduleName, majorVersion, options) {
  const modulesDir = majorVersion === '2' ? 'lib/modules' : 'modules';
  const stringSet = majorVersion === '2' ? 'a2' : 'a3';
  const strings = util.getStrings(stringSet, 'add-piece', moduleName);

  util.log('add piece', `Adding ${moduleName} folder to /${modulesDir}.`);

  const modulePath = path.join(modulesDir, moduleName);

  mkdir('-p', modulePath);

  util.log('add piece', `Setting up index.js for ${moduleName} module`);

  const pieceConfig = strings.pieceConfig;
  fs.writeFileSync(path.join(modulePath, 'index.js'), pieceConfig);

  util.log('add piece', `YOUR NEXT STEP: add the ${moduleName} module to "modules" in app.js.`);

  // Piece page setup
  // ****************
  if (options.page) {
    const pageDir = `${modulePath}-page${majorVersion === '2' ? 's' : ''}`;
    util.log('add piece', `Creating a ${pageDir} folder with index.js and appropriate views`);

    const pagesConfig = strings.pagesConfig;

    mkdir('-p', path.join(pageDir));
    fs.writeFileSync(path.join(pageDir, 'index.js'), pagesConfig);

    mkdir('-p', path.join(pageDir, 'views'));
    fs.writeFileSync(path.join(pageDir, 'views/show.html'), '');
    fs.writeFileSync(path.join(pageDir, 'views/index.html'), '');

    util.log('add piece', `YOUR NEXT STEP: add the ${moduleName}-pages module to "modules" in app.js.`);
    util.log('add piece', `YOUR NEXT STEP: add the ${moduleName}-page page type to the "types" array in ${modulesDir}/apostrophe-pages/index.js.`);
  }

  // Piece widget setup
  // ******************
  if (options.widget && majorVersion === '3') {
    util.log('add piece', '👉 The --widgets option does not apply to Apostrophe 3 projects.');
  } else if (options.widget) {
    util.log('add piece', `Creating a ${moduleName}-widgets folder with index.js and appropriate views`);

    const widgetsConfig = strings.widgetsConfig;
    const widgetDir = `${modulePath}-widgets`;

    mkdir('-p', widgetDir);
    fs.writeFileSync(path.join(widgetDir, 'index.js'), widgetsConfig);

    mkdir('-p', path.join(widgetDir, 'views'));
    fs.writeFileSync(path.join(widgetDir, 'views', 'widget.html'), '');

    util.log('add piece', `YOUR NEXT STEP: add the ${moduleName}-widgets module to "modules" in app.js.`);
  }

  return true;
};
