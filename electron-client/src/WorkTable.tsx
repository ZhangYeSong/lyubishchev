import React, { useContext, useState, useEffect, useRef } from 'react';
import { Table, Input, Popconfirm, Form, Modal, TimePicker } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { Work, updateTimeString } from './Work';
import  moment, { Moment } from 'moment';

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
  index: number;
}

interface Item {
  key: number;
  content: string;
  startEndTime: string;
  cost: string;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof Item;
  record: Item;
  handleSave: (record: Item) => void;
}

const EditableCell: React.FC<EditableCellProps> =
  ({ title, editable, children, dataIndex, record, handleSave, ...restProps }) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<Input>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current!.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }} name={dataIndex} rules={[
        {
          required: true,
          message: `${title} is required.`,
        },
      ]}>
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

type TableTypes = Parameters<typeof Table>[0];

interface EditableTableProps {
  dataSource: Work[];
  handleDelete: (record: Work) => void;
  handleUpdate: (record: Work) => void;
  handleEditTime: (record?: Work) => void;
  count: number;
  date: Moment;
}

interface EditableTableStates {
  isTimeModalVisible: boolean;
  curWork?: Work;
}

type ColumnTypes = Exclude<TableTypes['columns'], undefined>;

export class EditableTable extends React.Component<EditableTableProps, EditableTableStates> {
  columns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[];

  constructor(props: EditableTableProps) {
    super(props);
    this.state = {isTimeModalVisible: false};

    this.columns = [
      {
        title: '事件',
        dataIndex: 'content',
        width: '30%',
        editable: true,
        align: 'center'
      },
      {
        title: '起止时间',
        dataIndex: 'startEndTime',
        align: 'center',
        width: '30%',
        render: (text: string) => <a>{text}</a>
      },
      {
        title: '耗时',
        dataIndex: 'cost',
        align: 'center'
      },
      {
        title: '操作',
        dataIndex: 'operation',
        align: 'center',
        render: (_, record: Work) =>
          this.props.dataSource.length >= 1 ? (
            <Popconfirm title="确定删除?" onConfirm={() => this.props.handleDelete(record)}>
              <a>删除</a>
            </Popconfirm>) : null,
      },
    ];
  }


  private setTimeModalVisible = (visible: boolean) => {
    this.setState({isTimeModalVisible: visible});
  }

  private showTimeModal = () => {this.setTimeModalVisible(true)}
  private handleTimeModalOk = () => {
    this.setTimeModalVisible(false);
    this.props.handleEditTime(this.state.curWork);
  }
  private handleTimeModalCancel = () => {this.setTimeModalVisible(false)}

  handleSave = (row: Work) => {
    this.props.handleUpdate(row);
  };

  OnModalTimeChange = (time:Moment[]) => {
    let work = this.state.curWork;
    if(work == null) {
      return;
    }
    let start = time[0];
    let end = time[1];
    start.set('year', this.props.date.get('year'));
    start.set('month', this.props.date.get('month'));
    start.set('date', this.props.date.get('date'));
    end.set('year', this.props.date.get('year'));
    end.set('month', this.props.date.get('month'));
    end.set('date', this.props.date.get('date'));
    let newWork = new Work(0, work.insertTime, work.content,
      start.valueOf(), end.valueOf());
    updateTimeString(newWork);
    this.setState({curWork: newWork});
  }

  render() {
    const dataSource = this.props.dataSource;
    const components = {
      body: {
        row: EditableRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map(col => {
      if (!col.editable) {
        if(col.title == '起止时间') {
          return {
            ...col,
            onCell: (record: Work) => {
              return {
                onClick: () => {
                  this.showTimeModal();
                  this.setState({curWork: record});
                  this.props.handleEditTime(record);
                }
              }
            }
          }
        } else {
          return col;
        }
      }
      return {
        ...col,
        onCell: (record: Work) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });
    return (
      <div>
        <Table
          className="work-list"
          components={components}
          rowClassName={() => 'editable-row'}
          dataSource={dataSource}
          columns={columns as ColumnTypes}
          pagination={ false }
          rowKey={(record: Work) => record.insertTime}
          scroll={{y: "60vh"}}
        />
        <Modal title="修改时间" visible={this.state.isTimeModalVisible} 
          onOk={this.handleTimeModalOk} onCancel={this.handleTimeModalCancel}>
          <TimePicker.RangePicker 
            format={format} 
            onChange={this.OnModalTimeChange}
            value={[moment(this.state.curWork?.startTime), moment(this.state.curWork?.endTime)]}/>
        </Modal>
      </div>
    );
  }
}

const format = 'HH:mm';


