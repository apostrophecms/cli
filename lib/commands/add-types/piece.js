require('shelljs/global');
// Utilities from shelljs
/* globals mkdir */
const fs = require('fs');
const path = require('path');
const util = require('../../util');

const apostrophe2 = {
  modulesDir: 'lib/modules',
  version: 'a2',
  pageSuffix: '-pages',
  widgetSuffix: '-widgets',
  pageModuleDir: 'apostrophe-pages/index.js'
};
const apostrophe3 = {
  modulesDir: 'modules',
  version: 'a3',
  pageSuffix: '-page',
  widgetSuffix: '-widget',
  pageModuleDir: '@apostrophecms/page/index.js'
};

module.exports = function(moduleName, majorVersion, options) {
  const {
    modulesDir,
    version,
    pageSuffix,
    widgetSuffix,
    pageModuleDir
  } = (majorVersion === '2' ? apostrophe2 : apostrophe3);
  const strings = util.getStrings(version, 'add-piece', moduleName);

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
    const pageDir = `${modulePath}${pageSuffix}`;
    util.log('add piece', `Creating a ${pageDir} folder with index.js and appropriate views`);

    const pagesConfig = strings.pagesConfig;

    mkdir('-p', path.join(pageDir));
    fs.writeFileSync(path.join(pageDir, 'index.js'), pagesConfig);

    mkdir('-p', path.join(pageDir, 'views'));
    fs.writeFileSync(path.join(pageDir, 'views/show.html'), '');
    fs.writeFileSync(path.join(pageDir, 'views/index.html'), '');

    util.log('add piece', `YOUR NEXT STEP: add the ${pageDir} module to "modules" in app.js.`);
    util.log('add piece', `YOUR NEXT STEP: add the ${pageDir} page type to the "types" array in ${modulesDir}/${pageModuleDir}`);
  }

  // Piece widget setup
  // ******************
  if (options.widget && majorVersion === '3') {
    util.log('add piece', '👉 The --widget option does not apply to Apostrophe 3 projects.');
  } else if (options.widget) {
    const widgetDir = `${modulePath}${widgetSuffix}`;
    util.log('add piece', `Creating a ${widgetDir} folder with index.js and appropriate views`);

    const widgetsConfig = strings.widgetsConfig;

    mkdir('-p', widgetDir);
    fs.writeFileSync(path.join(widgetDir, 'index.js'), widgetsConfig);

    mkdir('-p', path.join(widgetDir, 'views'));
    fs.writeFileSync(path.join(widgetDir, 'views', 'widget.html'), '');

    util.log('add piece', `YOUR NEXT STEP: add the ${widgetDir} module to "modules" in app.js.`);
  }

  return true;
};
