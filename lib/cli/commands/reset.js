const fs = require('fs');
const shell = require('shelljs');

const { wpcli, cli } = require('../modules/exec');
const run = require('../modules/run');
const configureWordPress = require('../modules/configureWordPress');

/**
 * Restore the instance to its initial state.
 * @param {String} packageDir - Path to the package directory.
 * @param {Object} logFile - Logfile to output stdout and stderr.
 * @param {Object} options - CLI options.
 */
const reset = async (packageDir, logFile, options) => {
  const config = JSON.parse(fs.readFileSync(`${packageDir}/config.json`, 'utf8'));
  shell.cd(packageDir);

  const version = typeof options.version === 'string' ? options.version : config.validVersions[0];

  await cli(`bash update.sh ${version}`, logFile);

  const wpConfigKeys = Object.keys(config.config);

  await run(
    async () => wpcli(`core config \
    --dbhost=db \
    --dbname=wordpress \
    --dbuser=root \
    --dbpass='' \
    --locale=en_US \
    --extra-php <<PHP
define( 'FS_METHOD', 'direct' ); ${wpConfigKeys.map((key) => `
define( '${key}', ${config.config[key]} );`).join('')}
PHP
`, logFile),
    'Creating wp-config.php',
    'wp-config.php created',
    logFile,
  );

  await run(
    async () => wpcli('db reset --yes', logFile),
    'Creating database',
    'Database created',
    logFile,
  );

  const url = config.port
    ? `http://localhost:${config.port}`
    : 'http://localhost';

  await run(
    async () => wpcli(
      `core install --url=${url} --title="WP Cypress" --admin_user=admin --admin_password=password --admin_email="admin@test.com" --skip-email`,
      logFile,
    ),
    'Installing WordPress',
    'WordPress Installed',
    logFile,
  );

  await configureWordPress(config, logFile);
};

module.exports = reset;