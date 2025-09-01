const mongoose = require('mongoose');
async function connectDB(uri) {
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 8000, //Atlas 연결 지연ㄴ시 빠르게 실패
        });
        console.log('mongoDB (Atlas) connected');
    } catch (err) {
        console.error('mongoDB connection failed:', err.message);
    }
}
module.exports = {connectDB};