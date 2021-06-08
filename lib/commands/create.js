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
    .action(async function(shortName, options) {
      const boilerplateUrl = options.boilerplate ? options.boilerplate
        : options.a2 ? config.A2_BOILERPLATE : config.A3_BOILERPLATE;

      util.log('create-project', 'Grabbing the boilerplate from Github [1/4]');

      // Clone the boilerplate project
      if (exec(`git clone ${boilerplateUrl} ${shortName}`).code !== 0) {
        util.error('create-project');
        return false;
      }

      cd(shortName);

      // Remove the initial .git directory.
      rm('-rf', '.git/');

      util.log('create-project', `Adding your project shortname (${shortName}) [2/4]`);

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

      util.log('create-project', 'Installing packages [3/4]');
      // Update, not install, so the lock file gets updated and we're not
      // tied to a very old version of Apostrophe in the boilerplate lock file.
      exec('npm update --dev');

      const cwd = process.cwd();
      const aposPath = `${cwd}/node_modules/apostrophe`;

      // Append the installed Apostrophe version, if in an active project.
      if (!fs.existsSync(aposPath)) {
        util.error('create-project', 'Error installing new project packages.');
        return false;
      }
      const version = require(`${aposPath}/package.json`).version;
      const majorVersion = util.getMajorVersion('create-project', version);

      // Create an admin user (note this will prompt for password)
      util.log('create-project', 'Creating an admin user [4/4]');
      util.log('create-project', 'Choose a password for the admin user');

      const response = await prompts({
        type: 'password',
        name: 'pw',
        message: '🔏 Please enter a password:'
      });

      const userTask = majorVersion === '3' ? '@apostrophecms/user:add'
        : 'apostrophe-users:add';

      exec(`echo "${response.pw}" | node app.js ${userTask} admin admin`);
      util.log('create-project', 'All done! 🎉 Login as "admin" at the /login URL.');

      util.success('create-project');
      return true;
    });
};

function replaceInConfig(regex, replacement) {
  util.replaceInFiles([ './app.js', './package.json' ], regex, replacement);
}
