import React, { useState, useEffect } from 'react';
import '../styles/App.css';

function DNSRecordsTable() {
    const [dnsRecords, setDNSRecords] = useState([]);

    useEffect(() => {
        fetch('/api/google-cloud-dns') 
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    setDNSRecords(data.records);
                } else {
                    console.error('Error fetching DNS records:', data.message);
                }
            })
            .catch(error => {
                console.error('Error fetching DNS records:', error);
            });
    }, []);
    

    return (
        <div>
            <h2>DNS Records from GCP</h2>
            <table>
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Name</th>
                        <th>Value</th>
                        <th>TTL</th>
                        
                    </tr>
                </thead>
                <tbody>
                    {dnsRecords.map(record => (
                        <tr key={record.id}>
                            <td>{record.type}</td>
                            <td>{record.name}</td>
                            <td>{record.value}</td>
                            <td>{record.ttl}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DNSRecordsTable;
