import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const uri = process.env.MONGODB_URI || '';
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//\$1:****@');
    console.log(`URI: ${maskedUri}`);
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
