import React, { useContext, useState, useEffect, useRef } from 'react';
import { Table, Input, Popconfirm, Form } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { Work } from './Work';

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
  handleEditTime: (record: Work) => void;
  count: number;
}

type ColumnTypes = Exclude<TableTypes['columns'], undefined>;

export class EditableTable extends React.Component<EditableTableProps, Object> {
  columns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[];

  constructor(props: EditableTableProps) {
    super(props);

    this.columns = [
      {
        title: '事件',
        dataIndex: 'content',
        width: '40%',
        editable: true,
        align: 'center'
      },
      {
        title: '起止时间',
        dataIndex: 'startEndTime',
        align: 'center',
        render: (text: string, record: Work) => <a onClick={this.props.handleEditTime}>{text}</a>
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

  handleEditTime = (record: Work) => {
    this.props.handleEditTime(record);
  }

  handleSave = (row: Work) => {
    this.props.handleUpdate(row);
  };

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
        return col;
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
          bordered
          dataSource={dataSource}
          columns={columns as ColumnTypes}
          pagination={ false }
          rowKey={(record: Work) => record.insertTime}
        />
      </div>
    );
  }
}


