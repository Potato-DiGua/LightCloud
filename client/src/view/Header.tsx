import { Button, Modal } from "antd";
import { Header } from "antd/lib/layout/layout";
import { useState } from "react";
import { useAppSelector } from "../app/hooks";
import { LoginPage } from "./Login/Login";
import { selectLoginFlag } from "./Login/LoginSlice";

export const HeaderBlock = () => {
  const isLogin = useAppSelector(selectLoginFlag);

  return (
    <Header>
      <h2 style={{ color: "white", display: "inline-block" }}>云盘</h2>
      {isLogin ? null : <LoginBlock />}
    </Header>
  );
};

const LoginBlock = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = () => {
    setIsModalVisible(true);
  };
  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handleOk = () => {
    closeModal();
  };

  const handleCancel = () => {
    closeModal();
  };
  return (
    <div style={{ float: "right" }}>
      <Button type="primary" onClick={showModal}>
        登录
      </Button>
      <Modal
        title="登录"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <LoginPage />
      </Modal>
    </div>
  );
};
