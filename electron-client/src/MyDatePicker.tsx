import React from 'react';
import { DatePicker } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import  moment, { Moment } from 'moment';

interface MyDatePickerProps {
  date: Moment,
  handleDateChange: (date: Moment) => void
}

export class MyDatePicker extends React.Component<MyDatePickerProps, Object> {
  constructor(props: MyDatePickerProps) {
    super(props);
        
  }

  private onDateChange = (date: Moment) => {
    this.props.handleDateChange(date);
  }

  private disabledDate = (date: Moment) => { return date.isAfter(moment(), 'days'); }

  private nextDay = ()=> { this.onDateChange(this.props.date.add(1, 'days')); }
  private preDay = () => { this.onDateChange(this.props.date.subtract(1, 'days')); }

  render() {
    return (
      <div>
        <LeftOutlined style={{color: 'black'}} onClick={this.preDay}/>
        <span><DatePicker 
          onChange={this.onDateChange} 
          value={this.props.date} 
          format={dateFormat}
          disabledDate={this.disabledDate}
        /></span>
        {this.props.date.isSame(moment(), 'day') ? <RightOutlined style={{color: 'WhiteSmoke'}} /> : 
          <RightOutlined style={{color: 'black'}} onClick={this.nextDay}/>}
      </div>
    )
  }
}

const dateFormat = 'YYYY/MM/DD';