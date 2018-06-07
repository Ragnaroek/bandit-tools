import React, { Component } from 'react';
import { VictoryBar, VictoryChart, VictoryAxis } from 'victory';
import { Nav, Navbar, FormGroup, FormControl, Label } from 'react-bootstrap';

class AppState {
  stateData: Object
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = new AppState();
  }

  stateSelect(e) {
    let app = this;
    let reader = new FileReader();
    reader.onloadend = () => {
      app.setState({stateData: JSON.parse(reader.result)});
    };
    reader.readAsText(e.target.files[0]);
  }

  logSelect(e) {
    console.log("log selected", e.target.files);
  }

  navigation() {
    return <Navbar staticTop>
              <Navbar.Header>
                <Navbar.Brand>
                  <a href="#home">Bandit Tools</a>
                </Navbar.Brand>
              </Navbar.Header>
              <Nav pullRight>
                <Navbar.Form>
                   <Label>State File:</Label>
                   <FormGroup>
                     <FormControl type="file" onChange={(e) => this.stateSelect(e)}/>
                   </FormGroup>{' '}
                </Navbar.Form>
                <Navbar.Form>
                   <Label>Log File:  </Label>
                   <FormGroup>
                     <FormControl type="file" onChange={(e) => this.logSelect(e)}/>
                   </FormGroup>{' '}
                </Navbar.Form>
              </Nav>
           </Navbar>
  }

  transformToChartData() {
    let result = [];
    let vals = this.state.stateData.counts;

    console.log("vals = ", vals.length);

    for (var key in vals) {
      if (!vals.hasOwnProperty(key)) continue;
      result.push({arm: key.split(":")[1], counts: vals[key]});
    }

    result.sort((a, b) => {
        let t1 = parseInt(a.arm, 10);
        let t2 = parseInt(b.arm, 10);
        return t1 - t2;
    });

    return result;
  }

  renderDrawCount() {
    if(this.state.stateData) {

      let chartData = this.transformToChartData();
      console.log("chartData: ", chartData);

      return <VictoryChart domainPadding={20}>
        <VictoryAxis label="Arms" />
        <VictoryAxis label="Draw Count" dependentAxis={true}/>
        <VictoryBar data={chartData} x="arm" y="counts"/>
      </VictoryChart>
    } else {
      return <div>Chart Placeholder TODO</div>
    }
  }

  render() {
    return (
      <div>
        <header>
        {this.navigation()}
        </header>
        <main>
        {this.renderDrawCount()}
        </main>
      </div>
    );
  }
}

export default App;
