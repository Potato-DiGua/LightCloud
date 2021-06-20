import axios from "axios";

let instance;
if (process.env.NODE_ENV === "development") {
  //开发环境
  instance = axios.create({
    baseURL: "http://localhost",
    timeout: 15000,
    withCredentials: true,
  });
} else {
  instance = axios.create({
    //生产环境
    timeout: 15000,
    withCredentials: true,
  });
}

export const http = instance;
