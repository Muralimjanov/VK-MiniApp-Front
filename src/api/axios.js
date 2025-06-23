// import axios from 'axios';

// export const instance = axios.create({
//   baseURL: import.meta.env.VITE_BACKEND_DOMAIN_URL,
//   headers: {
//     "Content-Type": "application/json",
//     Authorization: `VK ${btoa(window.location.search)}`
//   }
// })

// instance.interceptors.response.use(
//     response => {
//         console.log(response.data);
//       return response.data
//     },
//     error => {
//       return Promise.reject(error)
//     }
// )

import axios from 'axios';

export const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_DOMAIN_URL || 'http://equpment-rent-club.ru:5000/',
  headers: {
    "Content-Type": "application/json",
  }
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);