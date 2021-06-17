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
    return http.get<ResponseWrap<Array<FileInfo>>>(`/files/${path}`);
  },
};
