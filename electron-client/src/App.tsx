
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';
import { Menu, ConfigProvider,Drawer, Input, Button, message } from 'antd';
import { Work } from './Work';
import { LowDBHelper } from './LowDBHelper';
import  moment, { Moment } from 'moment';
import { EditableTable } from './WorkTable';
import { MyDatePicker } from './MyDatePicker';
import { MenuOutlined } from '@ant-design/icons';
import zhCN from 'antd/lib/locale/zh_CN';
import axios from 'axios';
import { About } from './About'

moment.locale('zh-cn');
let currentDay = moment();
if (process.env.NODE_ENV == "development") {
  axios.defaults.baseURL = 'http://localhost:3000';
} else {
  axios.defaults.baseURL = 'http://zhangyesong.com:3000';
}


interface MainPagerState {
  workTitle: string,
  working: boolean,
  works: Work[],
  startTime: number,
  date: Moment,
  spendTime: number,
  drawerVisible: boolean,
  selectTab: number
}

class MainPager extends React.Component<Object, MainPagerState> {
  constructor(props: Object) {
    super(props);
    let startWorkTime = LowDBHelper.getStartWorkTime();
    let working = moment(startWorkTime).isSame(moment(), 'days');
    let curTitle = LowDBHelper.getCurrentContent();
    if(curTitle == null) {
      curTitle = "工作";
    }
    this.state = {
      workTitle: curTitle,
      working: working,
      works: LowDBHelper.getUserWorks(0, moment()),
      startTime: startWorkTime,
      date: moment(),
      spendTime: working?moment().valueOf() - startWorkTime:0,
      drawerVisible: false,
      selectTab: 1
    };
    setInterval(() => {
      this.setState({spendTime:moment().valueOf() - this.state.startTime});
      //发现到了新的一天，强制刷新页面
      if(!currentDay.isSame(moment(), 'day')) {
        currentDay = moment();
        this.forceUpdate();
      }
    }, 60000);
  }

  private openDrawer = () => {
    this.setState({drawerVisible: true});
  }

  private closeDrawer = () => {
    this.setState({drawerVisible: false});
  }

  private handleTabChange = (e) => {
    this.setState({selectTab: e.key});
    this.closeDrawer();
  }

  private getButtonText = () => {
    if(!this.state.date.isSame(moment(), 'days')) {
      return "添加事件";
    }
    let working = this.state.working;
    return working? "停  止 已耗时"+moment.duration(this.state.spendTime).minutes()+"分钟":"开始";
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

  private handleSyncClick = () => {
    const outerThis = this;
    axios.post("/work/sync",
      {userId: 0, works: LowDBHelper.getUserAllWorks(0), deletes: LowDBHelper.getUserDeletes()})
      .then(function (response) {
        console.log(response);
        LowDBHelper.syncWorks(response.data);
        outerThis.handleDateChange(outerThis.state.date);
        message.info('同步成功！');
      })
      .catch(function (error) {
        console.log(error);
        message.info('同步失败！');
      });

  }

  private handleOperateClick = () => {
    if(!this.state.date.isSame(moment(), 'days')) {
      let works = this.state.works;
      let title = this.state.workTitle;
      if (title.trim().length <= 0) {
        title = '工作';
      }
      let m = moment();
      m.set('year', this.state.date.get('year'));
      m.set('month', this.state.date.get('month'));
      m.set('date', this.state.date.get('date'));
      let work: Work = new Work(0, m.valueOf(), title, m.valueOf(), m.valueOf());
      works.push(work);
      let newWorks = works.slice();
      LowDBHelper.insertWork(work);
      this.setState({works: newWorks});
      LowDBHelper.setStartWorkTime(-1);
      return;
    }
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
      this.setState({works: newWorks, spendTime: 0});
      LowDBHelper.setStartWorkTime(-1);
      LowDBHelper.setCurrentContent("");
    } else {
      this.setState({startTime: moment().valueOf(), spendTime: 0});
      LowDBHelper.setCurrentContent(this.state.workTitle);
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

  //今日已工作xx小时
  private getTotalTime = () => {
    let works = this.state.works;
    let totalTime: number = 0;
    works.forEach((work:Work) => totalTime+=work.endTime-work.startTime);
    return moment.duration(totalTime).as('hours').toFixed(1);
  }

  private renderContent(index: number) {
    if(index == 1) {
      return this.renderHome();
    } else {
      return this.renderAbout();
    }
  }

  private renderAbout() {
    return(<About />);
  }

  private renderHome() {
    return(
      <div className="Home">
        <div className="head_div">
          <MenuOutlined style={{color: 'black', fontSize: "20px", paddingRight: "44px"}} onClick={this.openDrawer}/>
          <h2>柳比歇夫计时器</h2>
          <Button type="primary" onClick={this.handleSyncClick}>同步</Button>
        </div>
        <MyDatePicker date={this.state.date} handleDateChange={this.handleDateChange}/>
        <Input onChange={this.onInputChange}
              value={this.state.workTitle}
              disabled={this.state.working}
              size="large" placeholder="工作"/>
        <Button
          className="operate_button"
          onClick={this.handleOperateClick}
          type="primary" danger={this.state.working}
          shape="round"
          size="large" block>
          {this.getButtonText()}
        </Button>
        <div className="totalTime">今天已工作{this.getTotalTime()}小时</div>
        <EditableTable handleDelete={this.handleDelete}
                      handleUpdate={this.handleUpdate}
                      handleEditTime={this.handleEditTime}
                      dataSource={this.state.works}
                      count={this.state.works.length}
                      date={this.state.date}
        />
      </div>);
  }

  render() {
    return (
      <div>
        {this.renderContent(this.state.selectTab)}
        <Drawer
          className="drawer"
          title="柳比歇夫"
          placement="left"
          closable={false}
          onClose={this.closeDrawer}
          visible={this.state.drawerVisible}
          style={{ position: 'absolute' }}
        >
          <Menu
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}>
              <Menu.Item key="1" onClick={this.handleTabChange}>
                主   页
              </Menu.Item>
              <Menu.Item key="2" onClick={this.handleTabChange}>
                柳比歇夫
              </Menu.Item>
              <Menu.Item key="3" onClick={this.handleTabChange}>
                统   计
              </Menu.Item>
              <Menu.Item key="4" onClick={this.handleTabChange}>
                复   盘
              </Menu.Item>
              <Menu.Item key="5" onClick={this.handleTabChange}>
                关   于
              </Menu.Item>
          </Menu>
        </Drawer>
      </div>);
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
