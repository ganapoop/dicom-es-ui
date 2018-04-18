import React, { Component } from 'react';
import Axios from 'axios';
import { Button, Input, Table, Icon, Divider } from 'antd';

const Search = Input.Search;

const columns = [{
  title: 'SOPInstanceUID',
  dataIndex: 'sopInstanceUID',
  key: 'sopUID',
  render: text => <a href="javascript:;">{text}</a>,
}, {
  title: 'PatientID',
  dataIndex: 'patientId',
  key: 'pID',
}, {
  title: 'Study Date',
  dataIndex: 'studyDate',
  key: 'address',
}, {
  title: 'Action',
  key: 'action',
  render: (text, record) => (
    <span>
      <a href="javascript:;">Action 一 {record.sopUID}</a>
      <Divider type="vertical" />
      <a href="javascript:;">Delete</a>
      <Divider type="vertical" />
      <a href="javascript:;" className="ant-dropdown-link">
        More actions <Icon type="down" />
      </a>
    </span>
  ),
}];

class App extends Component {
  constructor() {
    super();
    this.state = {
      query: '',
      dicom: []
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
    return (
      <div className="App">
        <Search
          placeholder="input search text"
          value={this.state.query}
          onSearch={() => this.getSearchResults(this.state.query)}
          onChange={this.handleChange}
          enterButton
          style={{ width: 600 }}
        />
        <pre>DICOM METADATA in STATE: {JSON.stringify(this.state.dicom)}</pre>
        <Table columns={columns} dataSource={this.state.dicom} />
      </div>
    );
  }
}

export default App;
