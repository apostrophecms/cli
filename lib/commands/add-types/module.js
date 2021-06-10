require('shelljs/global');
// Utilities from shelljs
/* globals mkdir */
const fs = require('fs');
const path = require('path');
const util = require('../../util');

module.exports = function (moduleName, majorVersion) {
  const modulesDir = majorVersion === '2' ? 'lib/modules' : 'modules';
  const stringSet = majorVersion === '2' ? 'a2' : 'a3';

  const strings = util.getStrings(stringSet, 'add-module', moduleName);

  util.log('add module', `Adding ${moduleName} folder to /${modulesDir}.`);

  const modulePath = path.join(modulesDir, moduleName);

  mkdir('-p', modulePath);

  const moduleConfig = strings.moduleConfig;

  util.log('add module', `Setting up index.js for the ${moduleName} module.`);

  fs.writeFileSync(path.join(modulePath, 'index.js'), moduleConfig);

  return true;
};
