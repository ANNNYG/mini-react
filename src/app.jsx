import React, { update } from "../core/react";

let fooCount = 0;
let barCount = 0;

const Foo = () => {
  console.log("foo");
  const handleClick = () => {
    fooCount++;
    update();
  };

  return (
    <div>
      <h1>foo</h1>
      {fooCount}
      <button onClick={handleClick}>update foo</button>
    </div>
  );
};

const Bar = () => {
  console.log("bar");
  const handleClick = () => {
    barCount++;
    update();
  };

  return (
    <div>
      <h1>bar</h1>
      {barCount}
      <button onClick={handleClick}>update bar</button>
    </div>
  );
};

const Counter = () => {
  return (
    <div>
      App
      <Foo />
      <Bar />
    </div>
  );
};

const App = () => {
  return <Counter num={10} />;
};

export default App;
