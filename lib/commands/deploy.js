const util = require('../util');
const { stripIndent } = require('common-tags');
const fs = require('fs');
const { homedir } = require('os');
const prompts = require('prompts');

const aposDir = `${homedir()}/.apos`;
const serversFile = `${aposDir}/servers.json`;

if (!fs.existsSync(aposDir)) {
  fs.mkdirSync(aposDir);
}

module.exports = function (program, version) {
  const deploy = program
    .command('deploy <environment>')
    .description(stripIndent`
      Deploy an Apostrophe project to the named environment.
      
      Run with no environment name to list the environments.
    `)
    .action(async function(environment, options) {
      await util.log('deploy', `Deploying ${environment}`);
      const servers = await getServers({
        addFirst: true
      });
      const deploymentsFile = 'deployments.json';
      if (!fs.existsSync(deploymentsFile)) {
        fs.writeFileSync(deploymentsFile, '{}');
        await chooseServer(environment);
      }
      const deployments = JSON.parse(fs.readFileSync(deploymentsFile));
      const deployment = deployments[environment];
      return true;
    });
};

async function getServers({ addFirst = true }) {
  let servers = readServers();
  if ((Object.keys(servers).length === 0) && addFirst) {
    await addFirstServer();
    servers = readServers();
  }
  async function addFirstServer() {
    util.log('deploy', 'You do not have a server configured yet.');
    await addServer();
  }
}

async function addServer() {
  let ipResonse;
  do {
    ipResponse = await prompts({
      type: 'text',
      name: 'ip',
      message: 'Please enter the IP address of your server:'
    });
  } while (!ipResponse.ip);
  const server = {
    ip: ipResponse.ip
  };
  while (!server.strategy) {
    let userResponse;
    const response = await prompts({
      type: 'select',
      name: 'strategy',
      message: `How should we connect to the server ${server.ip} as root?`,
      choices: [
        {
          title: 'ssh as root',
          value: 'root'
        },
        {
          title: 'ssh as another user, then use sudo',
          value: 'sudo'
        }
      ]
    });
    if (response.strategy === 'root') {
      util.log('deploy', "Let's try a simple test connection to see if that works...");
      try {
        exec(`ssh -t root@${server.ip} echo "ok"`);
      } catch (e) {
        util.log('deploy', "Hmm, that didn't quite work.");
        continue;
      }
    } else if (response.strategy === 'sudo') {
      userResponse = await prompts({
        type: 'text',
        name: 'user',
        message: 'What username should we initially log in with?',
      });
      util.log('deploy', "Let's try a simple test connection to see if that works...");
      try {
        exec(`ssh -t ${userResponse.user}@${server.ip} sudo echo "ok"`);
      } catch (e) {
        util.log('deploy', "Hmm, that didn't quite work.");
        continue;
      }
    }
    server.strategy = response.strategy;
    if (server.strategy === 'sudo') {
      server.sudoUser = userResponse.user;
    } else {
      delete server.sudoUser;
    }
  }
  await sshRoot(server, stripIndent`
    apt-get install -y build-essential imagemagick nginx &&
    echo "Testing if MongoDB is already installed" &&
    mongod --version || (
      echo "Installing MongoDB"
      wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add - &&
      echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list &&
      apt-get update &&
      apt-get install -y mongodb-org &&
      (systemctl start mongod || (systemctl daemon-reload && systemctl start mongod)) &&
      systemctl enable mongod
    ) &&
    echo "Testing if Node.js is already installed" &&
    node --version || (
      curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - &&
      apt-get install -y nodejs
    )
    if id -u aposapps > /dev/null 2>&1; then
      echo "The aposapps user already exists"
    else
      echo "Creating the aposapps user"
      useradd -m -s /bin/bash aposapps
    fi
  `);
  const servers = readServers();
  servers[server.ip] = server;
  writeServers(servers);
}

async function sshRoot(server, bash) {
  console.log(`> ${bash}`);
  const connect = (server.strategy === 'sudo')
    ? `ssh -t ${server.sudoUser}@${server.ip} sudo`
    : `ssh -t root@${server.ip}`;
  const quoted = bash.replace(/'/g, "'\\''");
  return exec(`${connect} 'bash -c '\\''${quoted}'\\'''`);
}

function readServers() {
  return fs.existsSync(serversFile) ? JSON.parse(fs.readFileSync(serversFile)) : {};    
}

function writeServers(servers) {
  fs.writeFileSync(serversFile, JSON.stringify(servers));
}

function exec(cmd) {
  // Generally redundant to what sshRoot logs, with more quoting
  // console.log(`>> ${cmd}`);
  // execSync with inherit allows ssh with a sudo password,
  // shelljs exec gets hung up there
  return require('child_process').execSync(cmd, { stdio: 'inherit' });
}
