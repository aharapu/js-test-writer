const fs = require('fs');
const babelParser = require("@babel/parser");

let tabSize = 2; // default tab size

const fileName = process.argv[2] === 'runner' ? 'code-file.js' : process.argv[2]; // default file name present for Quokka to work during development
console.log('file name ', fileName);

const executionArguments = process.argv.slice(2);
executionArguments.forEach(argument => {
  const [name, value] = argument.split('=');
  // TODO -> add some validators for names and values
  switch (name) {
    case 'tabSize':
      tabSize = parseInt(value, 10);
      break;
    // TODO -> add an option to use spaces instead of tabs
    default:
      break;
  }
})

const buffer = fs.readFileSync(fileName);
const code = buffer.toString();

const syntaxTree = babelParser.parse(code, { plugins: ['jsx']});

let testFileString = '';

let tabs = 0; // will increase to 0 when the recursion intiates
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

function checkNode(node) {

  // TODO -> add a case when it's a variable declaration, to check if it is an arrow function declaration.
  // i.e. const arrowFuncWithoutClosure = (n) => (<div>some content</div>);

  // TODO -> what about const something = function() {} ??
  switch (node.type) {
    case 'VariableDeclaration':
      const declaration = node.declarations[0]; // assuming only 1 declaration. a limitation which can get extended.
      if (declaration.init.type === 'ArrowFunctionExpression') {
        const body = declaration.init.body;
        if (body.type === 'JSXElement') {
          // TODO -> write component specific test
        } else {
          testFileString += spaces + `describe('${declaration.id.name}', () => {\n`;
          // TODO -> if it has a body, iterate and check its elements
          testFileString += spaces + `});\n`;
        }
      }
      break;

    case 'FunctionDeclaration':
      testFileString += spaces + `describe('${node.id.name}', () => {\n`;
      increaseSpaces();
      if (node?.body?.body) node.body.body.forEach(childNode => checkNode(childNode));
      decreaseSpaces();
      testFileString += spaces + `});\n`;
      break;
  
    case 'File':
      node.program.body.forEach(childNode => checkNode(childNode));

    default:
      break;
  }
}

checkNode(syntaxTree);

console.log(testFileString);
