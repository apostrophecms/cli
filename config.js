const config = {};

module.exports = config;

config.SHELL_DEPENDS = [ 'git' ];

const REPO_ROOT = 'https://github.com/apostrophecms';
config.A3_BOILERPLATE = `${REPO_ROOT}/a3-boilerplate.git`;
config.A2_BOILERPLATE = `${REPO_ROOT}/apostrophe-boilerplate.git`;
