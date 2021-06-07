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

      const modulesPath = majorVersion === '2' ? 'lib/modules' : 'modules';

      const strings = getStrings(moduleName);

      util.log('create-module', `Adding ${moduleName} folder to /${modulesPath}.`);

      const newModulePath = `${modulesPath}/${moduleName}`;

      mkdir('-p', newModulePath);

      const moduleConfig = strings.a2.moduleConfig;

      util.log('create-module', `Setting up index.js for the ${moduleName} module.`);
      fs.writeFileSync(path.join(newModulePath, '/index.js'), moduleConfig);

      util.success('create-module');

      return true;
    });
};

function getStrings(moduleName) {
  return {
    a2: {
      moduleConfig: stripIndent`
        module.exports = {
          extend: 'apostrophe-module',
          label: '${util.titleCase(moduleName.replace(/-/g, ' '))}',
          construct: function (self, options) {

          }
        };
      `
    }
  };
};
