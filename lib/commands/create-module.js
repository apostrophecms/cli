require('shelljs/global');
// Utilities from shelljs
/* globals mkdir */
const fs = require('fs');
const path = require('path');
const util = require('../util');
const { stripIndent } = require('common-tags');

module.exports = function (program, version) {
  program
    .command('create-module <module-name>')
    .description(stripIndent`
      Bootstrap a general Apostrophe module with boilerplate configuration to get you started.
      Example: \`apos create-module my-module\`
    `)
    .action(function(moduleName, options) {
      if (!util.getAppPath('create-module')) {
        return false;
      }

      const majorVersion = util.getMajorVersion('create-module', version);

      if (!majorVersion) {
        return false;
      }

      const modulesDir = majorVersion === '2' ? 'lib/modules' : 'modules';
      const stringSet = majorVersion === '2' ? 'a2' : 'a3';

      const strings = util.getStrings(stringSet, 'create-module', moduleName);

      util.log('create-module', `Adding ${moduleName} folder to /${modulesDir}.`);

      const modulePath = path.join(modulesDir, moduleName);

      mkdir('-p', modulePath);

      const moduleConfig = strings.moduleConfig;

      util.log('create-module', `Setting up index.js for the ${moduleName} module.`);
      fs.writeFileSync(path.join(modulePath, 'index.js'), moduleConfig);

      util.success('create-module');

      return true;
    });
};
