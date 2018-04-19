import React, { Component } from 'react';
import Axios from 'axios';
import { Layout, Button, Input, Table, Icon, Divider, Avatar} from 'antd';
import logo from './logo.png'

const Search = Input.Search;

const {Header, Content, Footer} = Layout;


class App extends Component {
  constructor() {
    super();
    this.state = {
      query: '',
      dicom: [],
      selectedRowKeys: [],
      selectedRows: [],
      filteredInfo: null,
      sortedInfo: null,
    };
    
    this.handleChange = this.handleChange.bind(this);
    this.getSearchResults = this.getSearchResults.bind(this);
    this.handleTableChange = this.handleTableChange.bind(this);
    this.clearFilters = this.clearFilters.bind(this);
    this.clearAll = this.clearAll.bind(this);
    this.setDateSort = this.setDateSort.bind(this);
    this.enterIconLoading = this.enterIconLoading.bind(this);
  }
  
  componentDidMount() {
    this.getSearchResults('');
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

  handleTableChange(pagination, filters, sorter) {
    console.log('Various parameters', pagination, filters, sorter);
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    });
  }

  clearFilters() {
    this.setState({ filteredInfo: null });
  }
  
  clearAll() {
    this.setState({
      filteredInfo: null,
      sortedInfo: null,
    });
  }

  setDateSort() {
    this.setState({
      sortedInfo: {
        order: 'descend',
        columnKey: 'mod',
      },
    });
  }

  enterIconLoading = (e) => {
    this.setState({ iconLoading: e.target.value });
  }
  
  render() {
    let modalities = this.state.dicom.reduce((filters, record) => {
      if (!filters.includes(record.modality)) {
        filters.push(record.modality);
      }

      return filters;
    }, []);


    let scans = this.state.dicom.reduce((scanList, record) => {
      if (!scanList.includes(record.sopInstanceUID)) {
        scanList.push(record.sopInstanceUID);
      }
      return scanList;
    }, []);
    
    let { sortedInfo, filteredInfo } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};


    const columns = [
    {
      title: 'Patient Name',
      dataIndex: 'patientName',
      key: 'pName',
      render: text => <a href="javascript:;">{text}</a>,
    }, {
      title: 'PatientID',
      dataIndex: 'patientId',
      key: 'pID',
    }, {
      title: 'Patient Sex',
      dataIndex: 'patientSex',
      key: 'pSex',
      filters: [
        { text: 'Male', value: 'M' },
        { text: 'Female', value: 'F' },
      ],
      filteredValue: filteredInfo.pSex || null,
      onFilter: (value, record) => record.patientSex === value,
    }, {
      title: 'SOPInstanceUID',
      dataIndex: 'sopInstanceUID',
      key: 'sopUID',
      width: '14rem',
      render: text => <a href="javascript:;">{text}</a>,
      sorter: (a, b) => a.sopInstanceUID.length - b.sopInstanceUID.length,
      sortOrder: sortedInfo.columnKey === 'sopUID' && sortedInfo.order,
      filters: scans.map((scan) => ({ text: scan, value: scan })),
      filteredValue: filteredInfo.sopUID || null,
      onFilter: (value, record) => record.sopInstanceUID.includes(value),
    }, {
      title: 'Study Date',
      dataIndex: 'studyDate',
      key: 'studyDate',
      sorter: (a, b) => a.studyDate.length - b.studyDate.length,
      sortOrder: sortedInfo.columnKey === 'studyDate' && sortedInfo.order,
    }, {
      title: 'Study Description',
      dataIndex: 'studyDescription',
      key: 'studyDesc',
    }, {
      title: 'Modality',
      dataIndex: 'modality',
      key: 'mod',
      filters: modalities.map((modality) => ({ text: modality, value: modality })),
      filteredValue: filteredInfo.mod || null,
      onFilter: (value, record) => record.modality.includes(value),
    }, {
      title: 'Manufacturer',
      dataIndex: 'manufacturer',
      key: 'mf',
      sorter: (a, b) => a.manufacturer.length - b.manufacturer.length,
      sortOrder: sortedInfo.columnKey === 'mf' && sortedInfo.order,
    }, {
      title: 'Instrument Model Name',
      dataIndex: 'manufacturerModelName',
      key: 'modelName',
    }, {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <span>
          <a href="javascript:;">
            <Button type="primary" size="medium" icon="picture" value={record.sopInstanceUID} loading={this.state.iconLoading === record.sopInstanceUID} onClick={this.enterIconLoading}>
              View this image
            </Button>
          </a>
          {/* <Divider type="vertical" />
          <a href="javascript:;">Delete</a>
          <Divider type="vertical" />
          <a href="javascript:;" className="ant-dropdown-link">
            More actions <Icon type="down" />
          </a> */}
        </span>
      ),
    }
    ];



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
          <div>
            {/* <Button onClick={this.setAgeSort}>Sort age</Button> */}
            <Button onClick={this.clearFilters}>Clear filters</Button>
            <Button onClick={this.clearAll}>Clear filters and sorters</Button>
          </div>
        </Header>
        <Content>
          <div>
            <div className="table-operations">
              <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={this.state.dicom}
                size="medium"
                onChange={this.handleTableChange}
                pagination={{ position: 'both', showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`}}
              />
            </div>
          </div>
        </Content>
      </Layout>
    );
  }
}

export default App;
