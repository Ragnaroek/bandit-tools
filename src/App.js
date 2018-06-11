import React, { Component } from 'react';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryLabel } from 'victory';
import { Nav, Navbar, FormGroup, FormControl, Label, Grid, Row, Col } from 'react-bootstrap';

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

  transformToChartData(vals) {
    let result = [];

    for (var key in vals) {
      if (!vals.hasOwnProperty(key)) continue;
      result.push({arm: key.split(":")[1], val: vals[key]});
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

      let countData = this.transformToChartData(this.state.stateData.counts);
      let rewardData = this.transformToChartData(this.state.stateData.values);

      return <Grid>
        <Row className="show-grid">
          <Col xs={12} md={6} lg={4}>
            <VictoryChart domainPadding={20}>
              <VictoryAxis label="Arms" fixLabelOverlap={true}/>
              <VictoryAxis label="Draw Count" dependentAxis={true} axisLabelComponent={<VictoryLabel dy={-12}/>}/>
              <VictoryBar data={countData} x="arm" y="val"/>
            </VictoryChart>
          </Col>
          <Col xs={12} md={6} lg={4}>
            <VictoryChart domainPadding={20}>
              <VictoryAxis label="Arms" fixLabelOverlap={true}/>
              <VictoryAxis label="Average Reward (kH/s)" dependentAxis={true} axisLabelComponent={<VictoryLabel dy={-12}/>}/>
              <VictoryBar data={rewardData} x="arm" y="val"/>
            </VictoryChart>
          </Col>
          <Col xs={12} md={6} lg={4}>
            TODO Add Summary Panel here, with:
            - Total Regret,
            - Best Arm with reward
            - ????
          </Col>
        </Row>
      </Grid>
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
