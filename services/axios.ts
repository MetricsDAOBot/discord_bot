import axios from 'axios';
import 'dotenv/config';

const instance = axios.create({
    baseURL: process.env.BACKEND_BASE_URL
});

export default instance;