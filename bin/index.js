#! /usr/bin/env node

const fs = require('fs');
const babelParser = require("@babel/parser");

let tabSize = 2; // default tab size

// TODO -> install packages for colors and decoration (chalk boxen)

const fileName = process.argv[2] === 'runner' ? './bin/code-file.js' : process.argv[2]; // default file name present for Quokka to work during development
// TODO -> a validator will be needed that a file is passed
// TODO -> use this: console.log('current working directory: ', process.cwd());
console.log('file name ', fileName);

const executionArguments = process.argv.slice(2);
executionArguments.forEach(argument => {
  const [name, value] = argument.split('=');
  // TODO -> add some validators for names and values
  switch (name) {
    case 'tabSize':
      tabSize = parseInt(value, 10);
      break;
    // TODO -> add an option to use tabs instead of spaces
    default:
      break;
  }
})

const buffer = fs.readFileSync(fileName);
const code = buffer.toString();

const syntaxTree = babelParser.parse(code, { plugins: ['jsx']});
const declaration = syntaxTree.program.body[0].declarations[0];
const body = declaration.init.body;
body;

let testFileString = '';

let tabs = 0;
let spaces = '';

function increaseSpaces() {
    tabs++;
    for (let j = 1; j <= tabSize; j++) {
      spaces += ' ';
    }
}

function decreaseSpaces() {
  tabs--;
  spaces = spaces.slice(0, spaces.length - tabSize);
}

// TODO -> check if an export statement is correctly parsed
// TODO -> recursion should enter if / else blocks as well as switch statements
// TODO -> should the code check inside IIFEs?
function checkNode(node) {

  // TODO -> add a case when it's a variable declaration, to check if it is an arrow function declaration.
  // i.e. const arrowFuncWithoutClosure = (n) => (<div>some content</div>);

  // TODO -> what about const something = function() {} ??
  switch (node.type) {
    case 'VariableDeclaration':
      const declaration = node.declarations[0]; // assuming only 1 declaration. a limitation which can get extended.
      if (declaration.init.type === 'ArrowFunctionExpression') {
        addArrowFunctionExpression(declaration);
      }
      break;

    case 'FunctionDeclaration':
      addFunctionDeclaration(node);
      break;
  
    case 'File':
      node.program.body.forEach(childNode => checkNode(childNode));

    default:
      break;
  }
}

checkNode(syntaxTree);

console.log(testFileString);

function addFunctionDeclaration(node) {
  testFileString += spaces + `describe('${node.id.name}', () => {\n`;
  increaseSpaces();
  if (node?.body?.body) node.body.body.forEach(childNode => checkNode(childNode));
  decreaseSpaces();
  testFileString += spaces + `});\n`;
}

function addArrowFunctionExpression(node) {
  const body = node.init.body;

  if (body.type === 'JSXElement') {
    // TODO -> write component specific test
  } else {
    testFileString += spaces + `describe('${node.id.name}', () => {\n`;
    if (body.type === 'BlockStatement') {
      increaseSpaces();
      body.body.forEach(childNode => checkNode(childNode));
      decreaseSpaces();
    }
    testFileString += spaces + `});\n`;
  }
}