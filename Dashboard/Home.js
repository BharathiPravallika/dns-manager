import React, { useEffect, useState } from 'react';
import axios from "axios";
import Formtable from './Formtable';
import Charts from './Charts';
import FileUpload from './FileUpload';
import DNSRecordsTable from './DNSRecordsTable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/App.css';
import { Link } from "react-router-dom";
import '../Auth/Login';
import '../Auth/Register'

axios.default.baseURL = "http://localhost:8080";

function Home() {
  const [addSection, setAddSection] = useState(false);
  const [editSection, setEditSection] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    name: "",
    value: "",
    ttl: "",
  });
  const [formDataEdit, setFormDataEdit] = useState({
    type: "",
    name: "",
    value: "",
    ttl: "",
    _id: ""
  });
  const [dataList, setDataList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [filterType, setFilterType] = useState(""); //State for filter by type
  const [filterTTL, setFilterTTL] = useState(""); //State for filter by TTL
  const [searchTerm, setSearchTerm] = useState(""); //State for search term
  const [fileData, setFileData] = useState([]);

  //Filter and search logic
  const filteredData = dataList.filter((record) => {
    //Filter by type
    if (filterType && record.type !== filterType) return false;
    //Filter by TTL
    if (filterTTL && record.ttl !== parseInt(filterTTL)) return false;
    //Search by name
    if (searchTerm && !record.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  //Handle filter and search input changes
  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
  };

  const handleFilterTTLChange = (e) => {
    setFilterTTL(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleOnChange = (e) => {
    const { value, name } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    const{name, type, value, ttl} = formData;
    if(!name || !type || !value || !ttl){
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const data = await axios.post("http://localhost:8080/api/mongodb/create", formData);
      console.log(data);
      if (data.data.success) {
        setAddSection(false);
        toast.success(data.data.message);
        getFetchData();
        setFormData({
          type: "",
          name: "",
          value: "",
          ttl: ""
        });
      } else {
        toast.error(data.data.message);
      }
    } catch (error) {
      console.error("Error:", error.response.data);
      toast.error("An error occured while processing your request. Please try again later.")
    }

  };

  useEffect(() => {
    getFetchData();
  }, []);

  //Get current records
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = dataList.slice(indexOfFirstRecord, indexOfLastRecord);

  //Apply pagination to the filtered data
  const indexOfLastFilteredRecord = currentPage * recordsPerPage;
  const indexOfFirstFilteredRecord = indexOfLastFilteredRecord - recordsPerPage;
  const currentFilteredRecords = filteredData.slice(indexOfFirstFilteredRecord, indexOfLastFilteredRecord);

  //Change page
  const paginate = pageNumber => setCurrentPage(pageNumber);

  const getFetchData = async () => {
    const data = await axios.get("http://localhost:8080/api/mongodb");
    console.log(data);
    if (data.data.success) {
      setDataList(data.data.data);
    }
  };

  const handleDataUpload = (data) => {
    setDataList(data);
    setFileData([...data]); // Ensure to spread the data into a new array
  };

  const handleFileDataFetch = (data) => {
    setDataList([data]); // Ensure to spread the data into a new array
  };

  const handleDelete = async (id) => {
    const data = await axios.delete(`http://localhost:8080/api/mongodb/delete/${id}`);
    if (data.data.success) {
      getFetchData();
      toast.success(data.data.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const data = await axios.put("http://localhost:8080/api/mongodb/update", formDataEdit);
    if (data.data.success) {
      getFetchData();
      toast.success(data.data.message);
      setEditSection(false);
    }
  };

  const handleEditOnChange = async (e) => {
    const { value, name } = e.target;
    setFormDataEdit((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (el) => {
    setFormDataEdit(el);
    setEditSection(true);
  };

  return (
    <>
      <div className="container">
        <h1>DNS Manager</h1>

        <FileUpload onDataUpload={handleDataUpload} onFileDataFetch={handleFileDataFetch} setFileData={setFileData} />

        <button className="btn-filterr btn-add" onClick={() => setAddSection(true)}>Add DNS Record</button>
        <select className='btn-filterr' value={filterType} onChange={handleFilterTypeChange}>
          <option value="">Filter by Type</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="K">K</option>

        </select>
        <select className='btn-filterr' value={filterTTL} onChange={handleFilterTTLChange}>
          <option value="">Filter by TTL</option>
          <option value="3600">3600</option>
          <option value="7200">7200</option>
        </select>

        <input className='btn-filterr'
          type='text'
          placeholder='Seach by Name'
          value={searchTerm}
          onChange={handleSearch}
        />
        <Link to='/login' className="btn-filterr btn-light my-5">Logout</Link>

        {
          addSection && (
            <Formtable
              handleSubmit={handleSubmit}
              handleOnChange={handleOnChange}
              handleClose={() => setAddSection(false)}
              rest={formData}
            />
          )
        }
        {
          editSection && (
            <Formtable
              handleSubmit={handleUpdate}
              handleOnChange={handleEditOnChange}
              handleClose={() => setEditSection(false)}
              rest={formDataEdit}
            />
          )
        }

        <div className='tableContainer'>
          {
            fileData.map(file => (
              <div key={file.fileName}>
                <h3>{file.fileName}</h3>
                <table >
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Name</th>
                      <th>Value</th>
                      <th>TTL</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Render data from the 'file.data' array here */}
                    {file.data.map(dataItem => (
                      <tr key={dataItem._id}>
                        <td>{dataItem.type}</td>
                        <td>{dataItem.name}</td>
                        <td>{dataItem.value}</td>
                        <td>{dataItem.ttl}</td>
                        <td>
                          <button className='btn btn-edit' onClick={() => handleEdit(dataItem)}>Edit</button>
                          <button className='btn btn-delete' onClick={() => handleDelete(dataItem._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}

                  </tbody>
                </table>
              </div>
            ))
          }

          <div className='pagination'>
            <button
              className={`paginationn-btn ${currentPage === 1 && 'disabled'}`}
              onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
              Prev
            </button>
            <button
              className={`paginationn-btn ${indexOfLastRecord >= dataList.length && 'disabled'}`}
              onClick={() => setCurrentPage(currentPage + 1)} disabled={indexOfLastRecord >= dataList.length}>
              Next
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Name</th>
                <th>Value</th>
                <th>TTL</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentFilteredRecords.length > 0 ? (
                currentFilteredRecords.map((el) => {
                  return (
                    <tr className='' key={el._id}>
                      <td>{el.type}</td>
                      <td>{el.name}</td>
                      <td>{el.value}</td>
                      <td>{el.ttl}</td>
                      <td>
                        <button className='btn btn-edit' onClick={() => handleEdit(el)}>Edit</button>
                        <button className='btn btn-delete' onClick={() => handleDelete(el._id)}>Delete</button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>No Data available!</td>
                </tr>
              )

              }
            </tbody>
          </table>
          <DNSRecordsTable />



        </div>
      </div>
      <div className='charts-container'>
        <Charts dataList={dataList} />
      </div>

      <ToastContainer />
    </>
  );
}

export default Home;
