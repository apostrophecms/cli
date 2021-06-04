require('shelljs/global');
// Utilities from shelljs
/* globals exec cd rm */
const prompts = require('prompts');
const util = require('../util');
const config = require('../../config');
const fs = require('fs');
const { stripIndent } = require('common-tags');

module.exports = function (program) {
  program
    .command('create-project <shortname-without-spaces>')
    .description(stripIndent`
      Create an Apostrophe project (using the A3 boilerplate by default).
      Example: \`apos create-project my-website\`
    `)
    .option('--a2', 'Use the Apostrophe 2 boilerplate')
    .option('--boilerplate <url>', 'Use a custom boilerplate to create the project with')
    .option('--setup', 'Will setup the project further by installing dependencies and creating an admin user')
    .action(async function(shortName, options) {
      const totalSteps = options.setup ? 3 : 2;

      const boilerplateUrl = options.boilerplate ? options.boilerplate
        : options.a2 ? config.A2_BOILERPLATE : config.A3_BOILERPLATE;

      util.log('create-project', `Grabbing the boilerplate from Github [1/${totalSteps}]`);

      // Clone the boilerplate project
      if (exec(`git clone ${boilerplateUrl} ${shortName}`).code !== 0) {
        util.error('create-project');
        return false;
      }

      cd(shortName);

      // Remove the initial .git directory.
      rm('-rf', '.git/');

      util.log('create-project', `Setting up your project shortname [2/${totalSteps}]`);

      // Do some token replaces to rename the project
      replaceInConfig(/a3-boilerplate|apostrophe-boilerplate|apostrophe-open-museum/g, shortName);

      // Generate session secret
      let secret = util.secret();

      if (fs.existsSync('./lib/modules/apostrophe-express/index.js')) {
        util.replaceInFiles([ './lib/modules/apostrophe-express/index.js' ], /secret: undefined/, `secret: '${secret}'`);
      }

      // Set disabledFileKey for uploadfs
      secret = util.secret();

      util.replaceInFiles([ './app.js' ], /disabledFileKey: undefined/, `disabledFileKey: '${secret}'`);

      // Run setup if indicated.
      if (options.setup) {
        // update, not install, so package-lock.json gets updated
        // & we're not married to a very old version of Apostrophe
        exec('npm update --dev');
        // Create an admin user (note this will prompt for password)
        util.log('create-project', 'Creating an admin user [3/3]');
        util.log('create-project', 'Choose a password for the admin user');

        const response = await prompts({
          type: 'password',
          name: 'pw',
          message: '🔏 Please enter a password:'
        });

        exec('echo "' + response.pw + '" | node app.js apostrophe-users:add admin admin');
        util.log('create', 'Login as "admin"');
      }

      util.success('create-project');
      return true;
    });
};

function replaceInConfig(regex, replacement) {
  util.replaceInFiles([ './app.js', './package.json' ], regex, replacement);
}
