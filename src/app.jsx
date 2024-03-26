import React from "../core/react";

const Counter = ({ num }) => {
  return <div>Counter:{num}</div>;
};

const App = () => {
  return (
    <div>
      <Counter num={10} />
      <Counter num={20} />
    </div>
  );
};

export default App;
