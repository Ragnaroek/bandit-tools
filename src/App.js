import React, { Component } from 'react';
import { VictoryBar, VictoryChart, VictoryAxis } from 'victory';

const data = [
  {
    "arm": "1",
    "counts": 56
  },
  {
    "arm": "2",
    "counts": 56
  },
  {
    "arm": "3",
    "counts": 32
  }
]

class App extends Component {

  stateSelect(e) {
    let reader = new FileReader();
    reader.onloadend = function() {

      console.log(JSON.parse(reader.result).arms);
    };
    console.log("file", e.target.files[0]);
    reader.readAsText(e.target.files[0]);
  }

  logSelect(e) {
    console.log("log selected", e.target.files);
  }

  render() {
    return (
      <div className="App">
        <div>
          input state file:
          <input name="myFile" type="file" onChange={this.stateSelect}/>
        </div>
        <div>
          input log file:
          <input name="myFile" type="file" onChange={this.logSelect}/>
        </div>

        <VictoryChart domainPadding={20}>
          <VictoryAxis label="Arms" />
          <VictoryAxis label="Draw Count" dependentAxis={true}/>
          <VictoryBar data={data} x="arm" y="counts"/>
        </VictoryChart>
      </div>
    );
  }
}

export default App;
