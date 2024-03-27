import React, { update } from "../core/react";

let count = 10;
const Counter = ({ num }) => {
  const handleClick = () => {
    console.log("click");
    count++;
    update();
  };

  return (
    <div>
      Counter:{count}
      <button onClick={handleClick}>click</button>
    </div>
  );
};

const App = () => {
  return <Counter num={10} />;
};

export default App;
