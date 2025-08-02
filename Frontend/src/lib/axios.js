
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: "https://realtime-chat-2jot910q2-maxtro64s-projects.vercel.app/api",
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});



export default axiosInstance;
