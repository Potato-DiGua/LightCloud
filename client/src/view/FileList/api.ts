import { http } from "../../config/http";
import { ResponseWrap } from "../../model/ResponseWrap";
export interface FileInfo {
  name: string;
  type: number; // 0：文件夹 1：文件
  modificationTime: number;
  size: number;
  path: string;
  url: string;
}
export const api = {
  getFiles(path: string) {
    return http.get<ResponseWrap<Array<FileInfo>>>(path);
  },
  createDir(path: string, fileName: string) {
    return http.post<ResponseWrap<boolean>>("/upload/create-dir", {
      path: path,
      name: fileName,
    });
  },
  deleteFile(path: string) {
    return http.get<ResponseWrap<boolean>>("/delete/file", {
      params: { path: path },
    });
  },
};
