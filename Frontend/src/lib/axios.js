
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE==="development"?'http://localhost:5001/api':"https://realtime-chatty-app-wv5e.onrender.com/api",
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});



export default axiosInstance;
