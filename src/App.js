import React, { Component } from 'react';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryLabel, VictoryLine } from 'victory';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'
import FormControl from 'react-bootstrap/FormControl'
import Form from 'react-bootstrap/Form'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import * as Papa from 'papaparse'

class AppState {
  stateData: Object
  logData: Object
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
    let app = this;
    Papa.parse(e.target.files[0], {
      complete: function(results) {
        app.setState({logData: results});
        console.log("result=", results);
      }
    })
  }

  navigation() {
    return <Navbar bg="light" expand="lg">
                <Navbar.Brand href="#home">Bandit Tools</Navbar.Brand>
                  <Form inline>
                    <Badge pill variant="info">State File:</Badge>
                    <FormControl type="file" onChange={(e) => this.stateSelect(e)}/>
                  </Form>
                  <Form inline>
                    <Badge pill variant="info">Log File:</Badge>
                    <FormControl type="file" onChange={(e) => this.logSelect(e)}/>
                  </Form>
           </Navbar>
  }

  niceName(str) {
    return str.split(":")[1];
  }

  transformToChartData(vals) {
    let result = [];

    for (var key in vals) {
      if (!vals.hasOwnProperty(key)) continue;
      result.push({arm: this.niceName(key), val: vals[key]});
    }

    result.sort((a, b) => {
        let t1 = parseInt(a.arm, 10);
        let t2 = parseInt(b.arm, 10);
        return t1 - t2;
    });

    return result;
  }

  transformToTimeSeriesUpdate(logData) {
    let result = [];
    for (let i = 0; i < logData.data.length; i++) {
      let line = logData.data[i];
      if (line[0] === "UPDATE") {
        result.push(parseFloat(line[3]));
      }
    }
    return result;
  }

  logChartsRow() {
    if(this.state.logData) {

      let updateData = this.transformToTimeSeriesUpdate(this.state.logData);

      return <Row>
        <Col>
          <VictoryChart domainPadding={20} width={1200} height={300}>
            <VictoryAxis label="Draws" fixLabelOverlap={true}/>
            <VictoryAxis label="Reward (kH/s)" dependentAxis={true} axisLabelComponent={<VictoryLabel dy={-12}/>}/>
            <VictoryLine data={updateData}
                         style={{ data: { strokeWidth: 1, strokeLinecap: "round" } }}/>
          </VictoryChart>
        </Col>
      </Row>
    } else {
      return <Row>
        <Col xs={12} md={12} lg={12} style={{margin:"20px"}}>
          <div>Upload your log file to see log related charts</div>
        </Col>
      </Row>
    }
  }

  countChartsRow() {
    if(this.state.stateData) {
      let countData = this.transformToChartData(this.state.stateData.counts);
      let rewardData = this.transformToChartData(this.state.stateData.values);

      return <div>
          <Col>
            <VictoryChart domainPadding={20}>
              <VictoryAxis label="Arms" fixLabelOverlap={true}/>
              <VictoryAxis label="Draw Count" dependentAxis={true} axisLabelComponent={<VictoryLabel dy={-12}/>}/>
              <VictoryBar data={countData} x="arm" y="val"/>
            </VictoryChart>
          </Col>
          <Col>
            <VictoryChart domainPadding={20}>
              <VictoryAxis label="Arms" fixLabelOverlap={true}/>
              <VictoryAxis label="Average Reward (kH/s)" dependentAxis={true} axisLabelComponent={<VictoryLabel dy={-12}/>}/>
              <VictoryBar data={rewardData} x="arm" y="val"/>
            </VictoryChart>
          </Col>
        </div>
    } else {
      return <Col xs={12} md={12} lg={12} style={{margin:"20px"}}>
          <div>Upload your state file to see state related charts</div>
        </Col>
    }
  }

  highest(data) {
    var arm = "?"
    var max = -1;
    for (var key in data) {
      if (!data.hasOwnProperty(key)) continue;
      var val = data[key];

      if(val > max) {
        max = val
        arm = key
      }
    }
    return [this.niceName(arm), max];
  }

  stateDataSummary() {
    if(this.state.stateData) {
      let [hRewardArm, hReward] = this.highest(this.state.stateData.values);
      let [hCountArm, hCount] = this.highest(this.state.stateData.counts);

      return <div>
        <div>Arm with highest reward: {hRewardArm} ({hReward.toPrecision(4)})</div>
        <div>Arm with highest count: {hCountArm} ({hCount})</div>
     </div>
   }
  }

  minMaxReward(logData) {
    var min = Number.MAX_SAFE_INTEGER;
    var max = Number.MIN_SAFE_INTEGER;
    for (let i = 0; i < logData.data.length; i++) {
      let line = logData.data[i];
      if (line[0] === "UPDATE") {
        let reward = parseFloat(line[3]);
        if(reward < min) {
          min = reward
        }
        if(reward > max) {
          max = reward
        }
      }
    }
    return [min, max];
  }

  regretAndAvg(logData, max) {
    let regret = 0;
    let sum  = 0;
    for (let i = 0; i < logData.data.length; i++) {
      let line = logData.data[i];
      if (line[0] === "UPDATE") {
        let reward = parseFloat(line[3]);
        regret += max - reward;
        sum += reward
      }
    }
    let avg = sum/logData.data.length;
    return [regret, avg];
  }

  logDataSummary() {
    if(this.state.logData) {

      let [min, max] = this.minMaxReward(this.state.logData);
      let [regret, avg] = this.regretAndAvg(this.state.logData, max);

      return <div>
        <div>&nbsp;</div>
        <div>Total regret: {regret.toPrecision(4)} kH/s</div>
        <div>Min. reward: {min.toPrecision(4)} kH/s</div>
        <div>Max. reward: {max.toPrecision(4)} kH/s</div>
        <div>Avg. reward: {avg.toPrecision(4)} kH/s</div>
      </div>
    }
  }

  summaryPanel() {
    if(this.state.stateData || this.state.logData) {
      return <Col xs={12} md={6} lg={4}>
        <Card>
          {this.stateDataSummary()}
          {this.logDataSummary()}
        </Card>
      </Col>
    }
  }

  renderCharts() {
      return <Container>
        <Row>
          {this.countChartsRow()}
          {this.summaryPanel()}
        </Row>
        {this.logChartsRow()}
      </Container>
  }

  render() {
    return (
      <div>
        <header>
        {this.navigation()}
        </header>
        <main>
        {this.renderCharts()}
        </main>
      </div>
    );
  }
}

export default App;
