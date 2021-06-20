import { Breadcrumb, Button, Input, message, Modal, Space, Table } from "antd";
import {
  FolderOutlined,
  FileOutlined,
  InboxOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import React from "react";
import { timestampToTime } from "../../Utils";
import { FileInfo, api } from "./api";
import Dragger from "antd/lib/upload/Dragger";
import { UploadChangeParam, UploadFile } from "antd/lib/upload/interface";
import styles from "./FileList.module.css";
import env from "../../config/env";

export interface FileListProps {
  isLogin: boolean;
}
interface State {
  fileList: FileInfo[];
  createDirModalVisible: boolean;
  uploadFileModalVisible: boolean;
  loading: boolean;
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
    {
      title: "动作",
      key: "action",
      render: (_value: number, record: FileInfo) => {
        let downloadBtn;
        if (record.type === 0) {
          downloadBtn = null;
        } else {
          downloadBtn = (
            <a href={record.url} download={record.name}>
              <DownloadOutlined className={styles.action_icon} />
            </a>
          );
        }
        return (
          <Space>
            {downloadBtn}
            {this.props.isLogin ? (
              <Button
                type="link"
                shape="circle"
                icon={<DeleteOutlined />}
                danger
                onClick={() => {
                  const path = this.path + "/" + record.name;
                  Modal.confirm({
                    title: `你确定要删除"${record.name}"吗?`,
                    icon: <ExclamationCircleOutlined />,
                    okText: "确定",
                    okType: "danger",
                    cancelText: "取消",
                    onOk: () => {
                      api.deleteFile(path).then(({ data }) => {
                        if (data.status === 0 && data.data) {
                          message.info(`删除"${record.name}"成功`);
                          this.refreshFileList();
                        } else {
                          message.error(data.msg || `删除"${record.name}"失败`);
                        }
                      });
                    },
                    onCancel() {},
                  });
                }}
              />
            ) : null}
          </Space>
        );
      },
    },
  ];

  // 当前路径
  private path: string = "";

  constructor(props: FileListProps) {
    super(props);
    this.state = {
      fileList: [],
      createDirModalVisible: false,
      uploadFileModalVisible: false,
      loading: false,
    };
  }
  componentDidMount() {
    this.getFileList("/files");
  }
  private requestFileList(url: string) {
    console.log(this.path);
    this.setState({ loading: true });
    api
      .getFiles(url)
      .then(({ data: resp }) => {
        if (resp && resp.status === 0) {
          this.setState({ fileList: resp.data });
        } else {
          message.error(resp.msg || "访问服务器失败");
        }
      })
      .catch((error) => {
        message.error("访问服务器失败");
        console.log(error);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }
  private getFileList(url: string) {
    this.path = url.replaceAll(/^\/files\/*/g, "");
    this.requestFileList(url);
  }
  private getFileListWithoutPrefix(url: string) {
    this.path = url;
    this.requestFileList("/files/" + url);
  }
  private refreshFileList() {
    this.getFileListWithoutPrefix(this.path);
  }

  render() {
    return (
      <div className={styles.block}>
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
        <div className={styles.nav}>
          <span>路径：</span>
          {this.renderPathNavigation()}
          {this.renderToolBtnBlock()}
        </div>
        <Table
          loading={this.state.loading}
          columns={this.columns}
          dataSource={this.state.fileList}
          pagination={false}
        />
        {this.renderCreateDirModal()}
        {this.renderUploadFileModal()}
      </div>
    );
  }
  private renderToolBtnBlock() {
    if (!this.props.isLogin) {
      return null;
    }
    return (
      <div className={styles.topBtnBlock}>
        <Space>
          <Button
            type="primary"
            onClick={() => {
              this.setState({ createDirModalVisible: true });
            }}
          >
            新建目录
          </Button>
          <Button
            type="primary"
            onClick={() => {
              this.setState({ uploadFileModalVisible: true });
            }}
          >
            上传文件
          </Button>
        </Space>
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
  private renderCreateDirModal() {
    // let name: string;
    let nameInput = React.createRef<Input>();
    return (
      <Modal
        title="新建文件夹"
        visible={this.state.createDirModalVisible}
        onOk={() => {
          const name = nameInput.current?.input.value;

          if (name == null || name.length <= 0) {
            message.error("请输入文件夹名称");
          } else if (name.indexOf("/") !== -1) {
            message.error('名称不能包含"/"字符');
          } else {
            this.createDir(name);
            this.setState({ createDirModalVisible: false });
          }
        }}
        onCancel={() => {
          this.setState({ createDirModalVisible: false });
        }}
      >
        <Input ref={nameInput} placeholder="文件夹名称" maxLength={255} />
      </Modal>
    );
  }
  private createDir(name: string) {
    api
      .createDir(this.path, name)
      .then(({ data }) => {
        if (data.status === 0 && data.data) {
          this.refreshFileList();
          message.success(`创建${name}成功`);
        } else {
          message.error(message || `创建${name}失败`);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  private renderUploadFileModal() {
    return (
      <Modal
        title="上传文件"
        visible={this.state.uploadFileModalVisible}
        footer={null}
        onCancel={() => {
          this.refreshFileList();
          this.setState({ uploadFileModalVisible: false });
        }}
        width={800}
      >
        <Dragger
          name="file"
          multiple={true}
          action={`${env.host}/upload/file`}
          data={{ path: this.path }}
          withCredentials
          onChange={(info: UploadChangeParam<UploadFile<any>>) => {
            const { status } = info.file;
            if (status !== "uploading") {
              console.log(info.file, info.fileList);
            }
            if (status === "done") {
              message.success(`${info.file.name} 文件上传成功。`);
            } else if (status === "error") {
              message.error(`${info.file.name} 文件上传失败。`);
            }
          }}
          height={400}
          // onDrop={(e: React.DragEvent<HTMLDivElement>) => {
          //   console.log("Dropped files", e.dataTransfer.files);
          // }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">拖拽文件或点击此处上传文件</p>
        </Dragger>
      </Modal>
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
