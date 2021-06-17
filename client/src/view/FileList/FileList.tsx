import { Table } from "antd";
import { FolderOutlined, FileOutlined } from "@ant-design/icons";
import React from "react";
import { timestampToTime } from "../../Utils";
import { FileInfo, api } from "./api";

export interface FileListProps {}
interface State {
  fileList: FileInfo[];
}
export class FileList extends React.Component<FileListProps, State> {
  private columns = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      sorter: (a: FileInfo, b: FileInfo) => {
        const comp = a.type - b.type;
        if (comp !== 0) {
          return comp;
        }
        if (a.name === b.name) {
          return 0;
        } else if (a.name > b.name) {
          return 1;
        } else {
          return -1;
        }
      },
      render: (_text: string, record: FileInfo) => {
        if (record.type === 0) {
          //文件夹
          return (
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            <a
              href="#"
              onClick={() => {
                this.getFileList(record.url);
              }}
            >
              <span style={{ marginRight: "5px" }}>
                <FolderOutlined />
              </span>
              {record.name}
            </a>
          );
        } else {
          // 文件
          return (
            <a href={record.url} target="_blank" rel="noreferrer">
              <span style={{ marginRight: "5px" }}>
                <FileOutlined />
              </span>
              {record.name}
            </a>
          );
        }
      },
    },
    {
      title: "修改时间",
      dataIndex: "modificationTime",
      key: "modificationTime",
      sorter: (a: FileInfo, b: FileInfo) =>
        a.modificationTime - b.modificationTime,
      render: (value: number) => {
        return <p>{timestampToTime(value)}</p>;
      },
    },
    {
      title: "大小",
      dataIndex: "size",
      key: "size",
      sorter: (a: FileInfo, b: FileInfo) => a.size - b.size,
      render: (value: number) => {
        return <p>{this.formatFileSize(value)}</p>;
      },
    },
  ];
  constructor(props: FileListProps) {
    super(props);
    this.state = { fileList: [] };
    this.getFileList("");
  }

  private getFileList(url: string) {
    api
      .getFiles(url)
      .then(({ data: resp }) => {
        if (resp && resp.status === 0) {
          this.setState({ fileList: resp.data });
          console.log(this.state);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    return (
      <div style={style.div}>
        <Table
          columns={this.columns}
          dataSource={this.state.fileList}
          pagination={false}
        />
      </div>
    );
  }
  private static KB = 1024;
  private static MB = 1024 * FileList.KB;
  private static GB = 1024 * FileList.MB;

  private formatFileSize(size: number): string {
    if (size < FileList.KB) {
      return size + " B";
    } else if (size < FileList.MB) {
      return (size / FileList.KB).toFixed(2) + " KB";
    } else if (size < FileList.GB) {
      return (size / FileList.MB).toFixed(2) + " MB";
    } else {
      return (size / FileList.GB).toFixed(2) + " GB";
    }
  }
}

const style = {
  div: {
    width: "1200px",
    margin: "20px auto",
  },
};
