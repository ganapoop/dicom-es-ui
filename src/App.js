import React, { Component } from 'react';
import Axios from 'axios';
import { Layout, Button, Input, Table, Icon, Divider, Avatar } from 'antd';
import logo from './logo.png'

const Search = Input.Search;

const {Header, Content, Footer} = Layout;

const columns = [{
  title: 'SOPInstanceUID',
  dataIndex: 'sopInstanceUID',
  key: 'sopUID',
  render: text => <a href="javascript:;">{text}</a>,
}, {
  title: 'Patient Name',
  dataIndex: 'patientName',
  key: 'pName',
}, {
  title: 'PatientID',
  dataIndex: 'patientId',
  key: 'pID',
}, {
  title: 'Patient Sex',
  dataIndex: 'patientSex',
  key: 'pSex',
}, {
  title: 'Study Date',
  dataIndex: 'studyDate',
  key: 'studyDate',
}, {
  title: 'Study Description',
  dataIndex: 'studyDescription',
  key: 'studyDesc',
}, {
  title: 'Modality',
  dataIndex: 'modality',
  key: 'mod',
}, {
  title: 'Manufacturer',
  dataIndex: 'manufacturer',
  key: 'mf',
}, {
  title: 'Instrument Model Name',
  dataIndex: 'manufacturerModelName',
  key: 'modelName',
} 
// {
//   title: 'Action',
//   key: 'action',
//   render: (text, record) => (
//     <span>
//       <a href="javascript:;">Action 一 {record.sopUID}</a>
//       <Divider type="vertical" />
//       <a href="javascript:;">Delete</a>
//       <Divider type="vertical" />
//       <a href="javascript:;" className="ant-dropdown-link">
//         More actions <Icon type="down" />
//       </a>
//     </span>
//   ),
// }
];


class App extends Component {
  constructor() {
    super();
    this.state = {
      query: '',
      dicom: [],
      selectedRowKeys: [],
      selectedRows: []
    };
    
    this.handleChange = this.handleChange.bind(this);
    this.getSearchResults = this.getSearchResults.bind(this);
  }
  
  componentDidMount() {
    this.getSearchResults('PT');
  }
  
  handleChange(e) {
    let { value } = e.target
    
    this.setState({
      query: value
    });
  }
  
  getSearchResults(query) {
    Axios.get(`http://localhost:5005/search?q=${query}`)
    .then(({data}) => {
      console.log(`return payload from server after query submission: ${JSON.stringify(data)}, ${Array.isArray(data)}`);
      this.setState({
        dicom: data
      });
    })
    .catch((err) => console.error(`ERROR when querying server: ${err}`));
  }
  
  render() {
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    
        this.setState({
          selectedRowKeys: selectedRowKeys,
          selectedRows: selectedRows
        });
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    return (
      <Layout className="layout">
        <Header>
          <img src={logo} style={{ paddingRight: 24, maxWidth: 60 }}/>
          <Search
            placeholder="input search text"
            value={this.state.query}
            onSearch={() => this.getSearchResults(this.state.query)}
            onChange={this.handleChange}
            enterButton
            style={{ width: 600 }}
          />
        </Header>
        <Content>
          <Table rowSelection={rowSelection} columns={columns} dataSource={this.state.dicom} />
        </Content>
      </Layout>
    );
  }
}

export default App;
