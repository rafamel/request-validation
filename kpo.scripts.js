const kpo = require('kpo');
const { scripts } = require('./project.config');

module.exports.scripts = {
  ...scripts,
  build: [scripts.build, kpo.series('npm pack', { cwd: './pkg' })],
  watch: 'onchange ./src --initial --kill -- kpo watch:task',
  'watch:test': 'kpo test -- --watch',
  test: 'kpo test:task -- --runInBand',

  /* Private */
  '$test:task': scripts.test,
  '$watch:task': [kpo.log`\x1Bc⚡`, 'kpo lint build']
};
