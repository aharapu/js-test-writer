function motherFunc() {
  const a = 1;

  function firstChildFunc() {
    let b = 2;
  }

  const secondChildFunc = (arg1) => {
    console.log(arg1);
  };
}

function reactComponent(props) {
  const { prop } = props;

  return <div>some html content</div>;
}

function addTwoNumbers(a, b) {
  return a + b;
}
