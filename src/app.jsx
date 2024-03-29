import React, { update } from "../core/react";

let fooCount = 0;
let barCount = 0;

const Foo = () => {
  console.log("foo");
  const updater = update();
  const handleClick = () => {
    fooCount++;
    updater();
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
  const updater = update();
  const handleClick = () => {
    barCount++;
    updater();
  };

  return (
    <div>
      <h1>bar</h1>
      {barCount}
      <button onClick={handleClick}>update bar</button>
    </div>
  );
};

let show = false;

const Counter = () => {
  console.log("Count");
  const updater = update();
  const handleShow = () => {
    show = !show;
    updater();
  };
  return (
    <div>
      {show && <Foo />}
      App
      <Foo />
      <Bar />
      <button onClick={handleShow}>show</button>
    </div>
  );
};

const App = () => {
  return <Counter num={10} />;
};

export default App;
