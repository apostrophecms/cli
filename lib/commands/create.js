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
    .command('create <shortname-without-spaces>')
    .description(stripIndent`
      Create an Apostrophe project (using the A3 boilerplate by default).
      Example: \`apos create my-website\`
    `)
    .option('--a2', 'Use the Apostrophe 2 boilerplate')
    .option('--starter <url>', 'Use a specific git repository to use as the project starter')
    .action(async function(shortName, options) {
      if (!options.starter && options.boilerplate) {
        // Support the old boilerplate flag to be nice.
        options.starter = options.boilerplate;
      }

      const boilerplateUrl = options.starter ? options.starter
        : options.a2 ? config.A2_BOILERPLATE : config.A3_BOILERPLATE;

      util.log('create', 'Grabbing the starter from Github [1/4]');

      // Clone the boilerplate project
      if (exec(`git clone ${boilerplateUrl} ${shortName}`).code !== 0) {
        await util.error('create', 'Error cloning starter code.');
        return false;
      }

      cd(shortName);

      // Remove the initial .git directory.
      rm('-rf', '.git/');

      util.log('create', `Adding your project shortname (${shortName}) [2/4]`);

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

      // Remove lock file and install packages.
      util.log('create', 'Installing packages [3/4]');

      if (fs.existsSync('package-lock.json')) {
        rm('package-lock.json');
      }
      if (fs.existsSync('yarn.lock')) {
        rm('yarn.lock');
      }

      try {
        await util.spawnWithSpinner('npm install', {
          spinnerMessage: 'Installing packages. This will take a little while...'
        });
      } catch (error) {
        await util.error('create', 'Error installing packages');
        /* eslint-disable-next-line no-console */
        console.error(error);
      }

      const cwd = process.cwd();
      const aposPath = `${cwd}/node_modules/apostrophe`;

      // Append the installed Apostrophe version, if in an active project.
      if (!fs.existsSync(aposPath)) {
        await util.error('create', 'Error installing new project packages.');
        return false;
      }
      const version = require(`${aposPath}/package.json`).version;
      const majorVersion = await util.getMajorVersion('create', version);

      // Create an admin user (note this will prompt for password)
      util.log('create', 'Creating an admin user [4/4]');
      util.log('create', 'Choose a password for the admin user');

      const response = await prompts({
        type: 'password',
        name: 'pw',
        message: '???? Please enter a password:'
      });

      const userTask = majorVersion === '3' ? '@apostrophecms/user:add'
        : 'apostrophe-users:add';

      exec(`echo "${response.pw}" | node app.js ${userTask} admin admin`);
      util.log('create', 'All done! ???? Login as "admin" at the /login URL.');

      await util.success('create');
      return true;
    });
};

function replaceInConfig(regex, replacement) {
  util.replaceInFiles([ './app.js', './package.json' ], regex, replacement);
}
