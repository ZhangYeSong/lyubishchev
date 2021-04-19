
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';
import { ConfigProvider, Input, Button } from 'antd';
import { Work } from './Work';
import { LowDBHelper } from './LowDBHelper';
import  moment, { Moment } from 'moment';
import { EditableTable } from './WorkTable';
import { MyDatePicker } from './MyDatePicker';
import zhCN from 'antd/lib/locale/zh_CN';

moment.locale('zh-cn');

interface MainPagerState {
  workTitle: string,
  working: boolean,
  works: Work[],
  startTime: number,
  date: Moment
}

class MainPager extends React.Component<Object, MainPagerState> {
  constructor(props: Object) {
    super(props);
    let startWorkTime = LowDBHelper.getStartWorkTime();
    let working = moment(startWorkTime).isSame(moment(), 'days');
    this.state = {
      workTitle: "",
      working: working,
      works: LowDBHelper.getUserWorks(0, moment()),
      startTime: startWorkTime,
      date: moment()
    };
  }

  private getButtonText = () => {
    let working = this.state.working;
    return working? "停止":"开始";
  }

  private handleEditTime = (work?: Work) => {
    const newWorks = [...this.state.works];
    if(work == null) {
      return;
    }
    const index = newWorks.findIndex(item => work.insertTime === item.insertTime);
    if (index < 0) {
      return;
    }
    LowDBHelper.updateWork(work);
    const item = newWorks[index];

    newWorks.splice(index, 1, {
      ...item,
      ...work,
    });
    this.setState({works: newWorks});
  }

  private handleDateChange = (date: Moment) => {
    this.setState({
      date: moment(date),
      works: LowDBHelper.getUserWorks(0, date)
    });
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
      let work: Work = new Work(0, moment().valueOf(), title, this.state.startTime, moment().valueOf());
      works.push(work);
      let newWorks = works.slice();
      LowDBHelper.insertWork(work);
      this.setState({works: newWorks});
      LowDBHelper.setStartWorkTime(-1);
    } else {
      this.setState({startTime: moment().valueOf()});
      LowDBHelper.setStartWorkTime(moment().valueOf());
    }
  }

  private handleDelete = (record: Work) => {
    let index = this.state.works.indexOf(record);
    if (index > -1) {
      LowDBHelper.removeWork(record);
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
    LowDBHelper.updateWork(record);

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
        <MyDatePicker date={this.state.date} handleDateChange={this.handleDateChange}/>
        <Input onChange={this.onInputChange}
               value={this.state.workTitle}
               size="large" placeholder="工作"/>
        <Button
          className="operate_button"
          onClick={this.handleClick}
          type="primary"
          shape="round"
          size="large" block>
          {this.getButtonText()}
        </Button>
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
        <ConfigProvider locale={zhCN}>
          <Route path="/" component={MainPager} />
        </ConfigProvider>
      </Switch>
    </Router>
  );
}
