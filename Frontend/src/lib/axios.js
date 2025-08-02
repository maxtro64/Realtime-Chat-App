
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: "https://realtime-chatty-app-wv5e.onrender.com/api",
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});



export default axiosInstance;
