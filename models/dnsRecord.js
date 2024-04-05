const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dnsRecordSchema = new mongoose.Schema({
    type: String,
    name: String, 
    value: String,
    ttl: Number
},{
    timestamps: true 
});
const dnsRecord = mongoose.model('dnsRecord', dnsRecordSchema);

module.exports = dnsRecord;