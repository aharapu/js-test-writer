// Arrow function without closure
const arrowFuncWithoutClosure = (n) => n*n;

// mainNode.type === 'VariableDeclaration'
// mainNode.declarations === [{...}] - array of Nodes

// let declaration = mainNode.declarations[0]

// declaration.init.type === 'ArrowFunctionExpression'
// declaration.id.name === 'arrowFuncWithoutClosure'

// let body = declaration.init.body
// body.type === 'BinaryExpression'

// if (const arrowFuncWithoutClosure = (n) => n*n;) then body.type === 'JSXElement' --> it's a react function component?