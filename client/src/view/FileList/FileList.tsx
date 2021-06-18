import { Breadcrumb, Button, message, Space, Table } from "antd";
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
              // href="javascript:;"
              onClick={() => {
                this.getFileList(record.url);
                console.log(record.url);
                return false;
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
      render: (value: number, record: FileInfo) => {
        return <p>{record.type === 0 ? "" : this.formatFileSize(value)}</p>;
      },
    },
  ];

  // 当前路径
  private path: string = "";

  constructor(props: FileListProps) {
    super(props);
    this.state = { fileList: [] };
  }
  componentDidMount() {
    this.getFileList("/files");
  }
  private getFileList(url: string) {
    this.path = url.replaceAll(/^\/files\/?/g, "");
    api
      .getFiles(url)
      .then(({ data: resp }) => {
        if (resp && resp.status === 0) {
          this.setState({ fileList: resp.data });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  private getFileListWithoutPrefix(url: string) {
    this.path = url;
    api
      .getFiles("/files/" + url)
      .then(({ data: resp }) => {
        if (resp && resp.status === 0) {
          this.setState({ fileList: resp.data });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    return (
      <div style={style.div}>
        <div>
          <Button
            type="primary"
            disabled={this.path === ""}
            onClick={() => {
              this.returnParentDir();
            }}
          >
            返回上级目录
          </Button>
        </div>
        <div style={{ height: "32px", lineHeight: "32px" }}>
          <span>路径：</span>
          {this.renderPathNavigation()}
          {/* <h3>当前路径：{this.path === "" ? "/" : this.path}</h3> */}
          <div
            style={{ float: "right", display: "inline-block", margin: "5px 0" }}
          >
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  // this.returnParentDir();
                }}
              >
                新建目录
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  // this.returnParentDir();
                }}
              >
                上传文件
              </Button>
            </Space>
          </div>
        </div>
        <Table
          columns={this.columns}
          dataSource={this.state.fileList}
          pagination={false}
        />
      </div>
    );
  }
  private renderPathNavigation() {
    let list;
    if (this.path !== "") {
      list = this.path
        .split(/\/+/)
        .filter((value) => value !== "")
        .map((item, index, array) => {
          const path = array.slice(0, index + 1).join("/");
          if (index === array.length - 1) {
            return (
              <Breadcrumb.Item key={(index + 1).toString()}>
                {item}
              </Breadcrumb.Item>
            );
          } else {
            return (
              <Breadcrumb.Item
                key={(index + 1).toString()}
                href="#!"
                onClick={() => {
                  this.getFileListWithoutPrefix(path);
                }}
              >
                {item}
              </Breadcrumb.Item>
            );
          }
        });
    } else {
      list = null;
    }

    return (
      <Breadcrumb separator="/" style={{ display: "inline-block" }}>
        <Breadcrumb.Item
          key="0"
          href="#!"
          onClick={() => {
            if (this.path !== "") {
              this.getFileListWithoutPrefix("");
            }
          }}
        >
          根目录
        </Breadcrumb.Item>
        {list}
      </Breadcrumb>
    );
  }

  private returnParentDir() {
    if (this.path === "") {
      message.warning("目前处于根目录无法返回");
    } else {
      this.getFileListWithoutPrefix(
        this.path.substring(0, this.path.lastIndexOf("/"))
      );
    }
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
