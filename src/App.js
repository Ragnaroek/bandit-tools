import React, { Component } from 'react';

class App extends Component {

  stateSelect(e) {
    console.log("state selected", e.target.files);
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
      </div>
    );
  }
}

export default App;
