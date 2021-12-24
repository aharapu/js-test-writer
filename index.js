const fs = require('fs');
const babelParser = require("@babel/parser");
// const babel = require('@babel/core');

const buffer = fs.readFileSync('./code.js');
const code = buffer.toString();

// const result = babel.parseSync(code, )
const syntaxTree = babelParser.parse(code, { plugins: ['jsx']});

console.log(`result: `, syntaxTree.program.body);

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
  // TODO -> use a switch statement?
  const isFunction = node.type === 'FunctionDeclaration';
  // todo -> add spaces before each row
  if (isFunction) {
    increaseSpaces();
    testFileString += spaces + `describe('${node.id.name}', () => {\n`;
    if (node?.body?.body) node.body.body.forEach(childNode => checkNode(childNode));
    testFileString += spaces + `});\n`;
    decreaseSpaces();
  }

  const isFile = node.type === 'File';
  if (isFile) {
    node.program.body.forEach(childNode => checkNode(childNode));
  }
}

checkNode(syntaxTree);

testFileString