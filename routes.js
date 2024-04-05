const express = require('express');
const router = express.Router();
const { DNS } = require('@google-cloud/dns');
const dns = new DNS({
    projectId: 'dns-manager-123',
    keyFilename: '/keys/dns-manager-key.json'
});
const dnsRecord = require('./models/dnsRecord');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

//Multer Configuration
const upload = multer({ dest: 'uploads/' });


//CRUD operations on DNS records

//http://localhost:8080/ Read all DNS records 
router.get("/mongodb", async (req, res) => {
    const data = await dnsRecord.find({})
    res.json({ success: true, data: data })
})


//http://localhost:8080/create Create a new DNS record
router.post('/mongodb/create', async (req, res) => {
    console.log(req.body)
    const data = new dnsRecord(req.body)
    await data.save()
    res.send({ success: true, message: "data saved successfully", data: data })
})


//http://localhost:8080/update Update a DNS record
router.put("/mongodb/update", async (req, res) => {
    console.log(req.body)
    const { _id, ...rest } = req.body

    const data = await dnsRecord.updateOne({ _id: _id }, rest)
    res.send({ success: true, message: "data updated successfully", data: data })
})


//http://localhost:8080/delete Delete a DNS record
router.delete("/mongodb/delete/:id", async (req, res) => {
    const id = req.params.id
    console.log(id)
    const data = await dnsRecord.deleteOne({ _id: id })
    res.send({ success: true, message: "data deleted successfully", data: data })
})


//Handle multiple file uploads
router.post('/upload', upload.array('files', 5), (req, res) => {
    console.log('Request Body:', req.body);
    console.log('Request Headers:', req.headers);
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const files = req.files;

    console.log('Received files:', files.map(file => file.originalname));

    const allResults = [];

    files.forEach((file) => {
        if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
            const results = [];
            fs.createReadStream(file.path)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    // Process CSV data
                    console.log('CSV data:', results);
                    allResults.push({ fileName: file.originalname, data: results });
                    if (allResults.length === files.length) {
                        res.json({ success: true, data: allResults });
                    }
                });
        } else if (file.mimetype === 'application/json') {
            // Handle JSON file
            const jsonData = JSON.parse(fs.readFileSync(file.path, 'utf-8'));
            console.log('JSON data:', jsonData);
            allResults.push({ fileName: file.originalname, data: jsonData });
            if (allResults.length === files.length) {
                res.json({ success: true, message: 'Files uploaded successfully' });
            }
        } else {
            // Unsupported file type
            res.status(400).json({ success: false, message: 'Unsupported file type' });
        }
    });
});


// Read all DNS records from Google Cloud DNS
router.get("/google-cloud-dns", async (req, res) => {
    try {
        const zoneName = 'dnsmanager-zone'; 
        const zone = dns.zone(zoneName);
        const [records] = await zone.getRecords();
        res.json({ success: true, records: records });
    } catch (error) {
        console.error('Error fetching DNS records from Google Cloud DNS:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// Create a new DNS record in Google Cloud DNS
router.post('/google-cloud-dns/create', async (req, res) => {
    try {
        const zoneName = 'dnsmanager-zone'; 
        const zone = dns.zone(zoneName);
        const recordData = {
            name: 'example.com',
            type: 'A', 
            ttl: 300, 
            rrdatas: ['1.2.3.4']
        };
        await zone.createChange({ add: recordData });
        res.json({ success: true, message: 'DNS record created successfully' });
    } catch (error) {
        console.error('Error creating DNS record in Google Cloud DNS:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// Update a DNS record in Google Cloud DNS
router.put("/google-cloud-dns/update", async (req, res) => {
    try {
        const zoneName = 'dnsmanager-zone';
        const zone = dns.zone(zoneName);

        const recordName = 'example.com'; 
        const recordType = 'A'; 
        const newRecordData = ['new-ip-address'];

        // Replace the existing record with the updated data
        await zone.replaceRecords(recordName, recordType, newRecordData);

        res.json({ success: true, message: 'DNS record updated successfully' });
    } catch (error) {
        console.error('Error updating DNS record in Google Cloud DNS:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// Delete a DNS record from Google Cloud DNS
router.delete("/google-cloud-dns/delete/:id", async (req, res) => {
    try {
        const zoneName = 'dnsmanager-zone';
        const zone = dns.zone(zoneName);
        const recordId = req.params.id;
        await zone.deleteRecord(recordId);
        res.json({ success: true, message: 'DNS record deleted successfully' });
    } catch (error) {
        console.error('Error deleting DNS record from Google Cloud DNS:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;