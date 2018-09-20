const sfdxGenerator = require('sfdx-generator');
const path = require('path');
const root = path.resolve(__dirname, './..');
const generator = new sfdxGenerator.Generator({
  SFDXPath: 'sfdx',
  outputDirectory: path.resolve(root, './src/generated'),
  templateDirectory: path.resolve(root, './tools/templates'),
  fileExtension: '.ts'
});

const commandFile = require('../commands.json');
const stringFile = JSON.stringify(commandFile);
generator.generate(stringFile).then(() => {
  console.log('Generating done');
});
