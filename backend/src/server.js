
const path = require('path');
const dotenv = require('dotenv');
dotenv.config(); // <-- let it load from current working dir (backend)


const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 4000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();
