import React, { update, useState } from "../core/react";

const Foo = () => {
  const [count, setCount] = useState(10);
  const [bar, setBar] = useState("bar");

  const handleClick = () => {
    setCount((pre) => pre + 1);
    setBar((pre) => pre + "s");
  };

  return (
    <div>
      <h1>foo</h1>
      {count}
      {bar}
      <button onClick={handleClick}>update foo</button>
    </div>
  );
};

// const Bar = () => {
//   console.log("bar");
//   const updater = update();
//   const handleClick = () => {
//     barCount++;
//     updater();
//   };

//   return (
//     <div>
//       <h1>bar</h1>
//       {barCount}
//       <button onClick={handleClick}>update bar</button>
//     </div>
//   );
// };

const Counter = () => {
  return (
    <div>
      App
      <Foo />
    </div>
  );
};

const App = () => {
  return <Counter num={10} />;
};

export default App;
