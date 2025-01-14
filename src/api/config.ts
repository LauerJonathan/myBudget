import axios from 'axios';

export const API = axios.create({
  baseURL: 'http://localhost:3000/api', // À adapter selon votre backend
  timeout: 10000,
});