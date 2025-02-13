import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',  // Backend API base URL
});

export default API;
