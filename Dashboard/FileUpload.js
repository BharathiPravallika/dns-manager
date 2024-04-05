import React, { useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import '../styles/App.css';

const FileUpload = ({ onDataUpload, onFileDataFetch, setFileData }) => {
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            toast.error('Please select at least one file.');
            return;
        }

        try {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }

            const response = await axios.post('http://localhost:8080/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                toast.success('File uploaded successfully!');
                //clear file input after upload
                setFiles([]);
                //Reset file input label text
                fileInputRef.current.value = null;

                // Call the onDataUpload callback with empty array to indicate successful upload without data display
                // onDataUpload([]);
                handleFetchData();
            } else {
                toast.error('File upload failed.');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Error uploading file. Please try again.');
        }
    };

    const handleFetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/files');
            if (response.data) {

                const fileData = response.data.map(file => ({
                    fileName: file.split(':')[0],
                    data: file.split(':').slice(1).join(':').trim()
                }));
                onFileDataFetch(fileData);
            }

        } catch (error) {
            console.error('Error fetching file data:', error);
        }
        

    };

    return (
        <div className="file-upload-container">
            <input ref={fileInputRef} className="upload-btn" type="file" multiple onChange={handleFileChange} />
            <button className="btn-filterr upload-btn" onClick={handleUpload}>Upload</button>
            <button className="btn-filterr fetch-btn" onClick={handleFetchData}>Fetch File Data</button>
        </div>
    );
};

export default FileUpload;