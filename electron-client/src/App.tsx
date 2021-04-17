
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';
import { Input, Button, Modal } from 'antd';
import {Work} from './Work';
import  moment from 'moment';
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import { EditableTable } from './WorkTable';

moment.locale('zh-cn');

const adapter = new FileSync('db.json'); // 申明一个适配器
const db = low(adapter);

db.defaults({works: []})
  .write();

interface MainPagerState {
  workTitle: string,
  working: boolean,
  works: Work[],
  startTime: number,
  isTimeModalVisible: boolean
}

class MainPager extends React.Component<Object, MainPagerState> {
  constructor(props: Object) {
    super(props);
    this.state = {
      workTitle: "",
      working: false,
      works: db.get("works").filter({userId: 0}).value(),
      startTime: moment().valueOf(),
      isTimeModalVisible: false
    };
  }

  private getButtonText = () => {
    let working = this.state.working;
    return working? "停止":"开始";
  }

  private setTimeModalVisible = (visible: boolean) => {
    this.setState({isTimeModalVisible: visible});
  }

  private handleEditTime = (work: Work) => {
    this.showTimeModal();
  }

  private showTimeModal = () => {this.setTimeModalVisible(true)}
  private handleTimeModalOk = () => {this.setTimeModalVisible(false)}
  private handleTimeModalCancel = () => {this.setTimeModalVisible(false)}

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
      let work: Work = new Work(0, moment().valueOf(), title, this.state.startTime, moment().valueOf());
      works.push(work);
      let newWorks = works.slice();
      db.get('works')
        .push(work)
        .write();
      this.setState({works: newWorks});
    } else {
      this.setState({startTime: moment().valueOf()})
    }
  }

  private handleDelete = (record: Work) => {
    let index = this.state.works.indexOf(record);
    if (index > -1) {
      db.get('works').remove({insertTime: record.insertTime}).write();
      this.state.works.splice(index, 1);
      let newWorks = this.state.works.slice();
      this.setState({works: newWorks});
    }
  }

  private handleUpdate = (record: Work) => {
    const newWorks = [...this.state.works];
    const index = newWorks.findIndex(item => record.insertTime === item.insertTime);
    if (index < 0) {
      return;
    }
    db.get('works')
      .find({ insertTime: record.insertTime })
      .assign({ content: record.content})
      .write();

    const item = newWorks[index];
    newWorks.splice(index, 1, {
      ...item,
      ...record,
    });
    this.setState({works: newWorks});
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
        <Modal title="Basic Modal" visible={this.state.isTimeModalVisible} 
          onOk={this.handleTimeModalOk} onCancel={this.handleTimeModalCancel}>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Modal>
        <EditableTable handleDelete={this.handleDelete}
                       handleUpdate={this.handleUpdate}
                       handleEditTime={this.handleEditTime}
                       dataSource={this.state.works}
                       count={this.state.works.length}
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
