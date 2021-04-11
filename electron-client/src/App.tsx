
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';
import { Input, Button, List } from 'antd';
import {Work} from './Work';
import  moment from 'moment';
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

moment.locale('zh-cn');

const adapter = new FileSync('db.json'); // 申明一个适配器
const db = low(adapter);

db.defaults({works: []})
  .write();

interface MainPagerState {
  workTitle: string,
  working: boolean,
  works: Work[],
  startTime: number
}

class MainPager extends React.Component<Object, MainPagerState> {
  constructor(props: Object) {
    super(props);
    this.state = {
      workTitle: "",
      working: false,
      works: db.get("works").filter({userId: 0}).value(),
      startTime: moment().valueOf()
    };
  }

  private getButtonText = () => {
    let working = this.state.working;
    return working? "停止":"开始";
  }

  private handleClick = () => {
    this.setState({
      working: !this.state.working
    });
    if (this.state.working) {
      let works = this.state.works;
      let title = this.state.workTitle;
      if (title.trim().length <= 0) {
        title = '工作';
      }
      let work: Work = {
        userId: 0,
        insertTime: moment().valueOf(),
        content: title,
        startTime: this.state.startTime,
        endTime: moment().valueOf()
      };
      works.push(work);
      db.get('works')
        .push(work)
        .write();
    } else {
      this.setState({startTime: moment().valueOf()})
    }
  }

  private getWorkTimeString = (work: Work) => {
    return work.content
      + " "
      + moment(work.startTime).format("LT")
      + " - "
      + moment(work.endTime).format("LT")
      + " "
      + (moment(work.endTime).diff(moment(work.startTime), "minutes") + 1)
      + "分钟";
  }

  private onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    this.setState({
      workTitle: e.target.value
    });
  }

  render() {
    return (
      <div className="Hello">
        <h1>柳比歇夫计时器</h1>
        <Input onChange={this.onInputChange}
               value={this.state.workTitle}
               size="large" placeholder="工作"/><br/>
        <Button
          className="operate_button"
          onClick={this.handleClick}
          type="primary"
          shape="round"
          size="large" block>
          {this.getButtonText()}
        </Button>
        <List
          className="work-list"
          size="large"
          bordered
          dataSource={this.state.works}
          renderItem={item => <List.Item>{this.getWorkTimeString(item)}</List.Item>}
        />
      </div>
    );
  }
}

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={MainPager} />
      </Switch>
    </Router>
  );
}
