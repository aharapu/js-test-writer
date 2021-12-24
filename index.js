const fs = require('fs');
const babelParser = require("@babel/parser");
// const babel = require('@babel/core');

const buffer = fs.readFileSync('./code-file.js');
const code = buffer.toString();

// const result = babel.parseSync(code, )
const syntaxTree = babelParser.parse(code, { plugins: ['jsx']});
const node = syntaxTree.program.body[0];
const declaration = node.declarations[0];
const body = declaration.init.body;
body


let testFileString = ''; // add any imports at the top if necessary

// todo -> make a recurring function that has program as the root node and traverses the tree
// if the node has a body, call the recurring function on each
const tabSize = 2; // todo -> make tabsize customizable
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
          increaseSpaces();
          testFileString += spaces + `describe('${declaration.id.name}', () => {\n`;
          // TODO -> if it has a body, iterate and check its elements
          testFileString += spaces + `});\n`;
          decreaseSpaces();
        }
      }
      break;

    case 'FunctionDeclaration':
      increaseSpaces();
      testFileString += spaces + `describe('${node.id.name}', () => {\n`;
      if (node?.body?.body) node.body.body.forEach(childNode => checkNode(childNode));
      testFileString += spaces + `});\n`;
      decreaseSpaces();
      break;
  
    case 'File':
      node.program.body.forEach(childNode => checkNode(childNode));

    default:
      break;
  }
}

checkNode(syntaxTree);

testFileString