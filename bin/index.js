#! /usr/bin/env node

/* 
TODO -> investigate error. occurs when trying to execute the jtw script from the console
apparently a "windows only" error, and the tool works great in GitBash

jtw : File C:\Users\hpome\AppData\Roaming\npm\jtw.ps1 cannot be loaded because running scripts is disabled on this system. For more 
information, see about_Execution_Policies at https:/go.microsoft.com/fwlink/?LinkID=135170.
At line:1 char:1
+ jtw FunctionComponent.js
+ ~~~~~~~~~~~
    + CategoryInfo          : SecurityError: (:) [], PSSecurityException
    + FullyQualifiedErrorId : UnauthorizedAccess
*/

// TODO -> find a way to configure the cli's indentation, if it should use semicolons etc;
// TODO -> consider using a library for command input arguments (yargs)
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
    // TODO -> add an option to use tabs instead of indentation
    default:
      break;
  }
})

const buffer = fs.readFileSync(fileName);
const code = buffer.toString();

const syntaxTree = babelParser.parse(code, { plugins: ['jsx'], sourceType: "module"});
const node = syntaxTree.program.body[0];
node;

let testFileString = '';

let tabs = 0;
let indentation = '';

function increaseIndentation() {
    tabs++;
    for (let j = 1; j <= tabSize; j++) {
      indentation += ' ';
    }
}

function decreaseIndentation() {
  tabs--;
  indentation = indentation.slice(0, indentation.length - tabSize);
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
const fileNameSplitByDots = fileName.split('.');
const fileExtension = fileNameSplitByDots.pop();
fs.writeFileSync(`${process.cwd()}\\${fileNameSplitByDots.join('.')}.test.${fileExtension}`, testFileString);

// TODO -> create a test file manager class ?

function addFunctionDeclaration(node) {
  testFileString += indentation + `describe('${node.id.name}', () => {\n`;
  if (node.body.type === 'BlockStatement') {
    traverseBlock(node.body);
  }
  testFileString += indentation + `});\n`;
}

function addArrowFunctionExpression(node) {
  node;
  const name = node.id.name;
  const body = node.init.body;

  if (body.type === 'JSXElement') {
    writeReactComponentTest(name); // TODO -> split such helpers into openDescribeBlock(what to describe) + closeBlock()
  } else {
    testFileString += indentation + `describe('${name}', () => {\n`;
    if (body.type === 'BlockStatement') {
      increaseIndentation();
      body.body.forEach(childNode => checkNode(childNode));
      decreaseIndentation();

      // TODO -> return might be a JSX element, in which case a react component test must be written
    }
    testFileString += indentation + `});\n`;
  }
}

// When an AST node is a block statement, it's body is an array of nodes
function traverseBlock(node) {
  increaseIndentation();
  node.body.forEach(childNode => checkNode(childNode));
  decreaseIndentation();
}

function print(text) {
  testFileString += indentation + text;
}

function writeReactComponentTest(componentName) {
  // TODO -> check if react and render imports are present, and if not, add them at the top
  // use a helper function like addReactImports();
  print(`describe('${componentName} component', () => {\n`);
  increaseIndentation();
  print(`it('renders without crashing', () => {\n`);
  increaseIndentation();
  print(`render(<${componentName} />)\n`);
  decreaseIndentation();
  print('});\n');
  decreaseIndentation();
  print('});\n');
}