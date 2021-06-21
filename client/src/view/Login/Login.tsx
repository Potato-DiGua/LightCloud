import { Form, Input, Button, Col, Row } from "antd";
import md5 from "js-md5";
import { useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import env from "../../config/env";
import { loginAsync } from "./LoginSlice";

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

export interface LoginPageProps {
  onValidateFailed?: () => void;
}

export const LoginPage = (props: LoginPageProps) => {
  const dispatch = useAppDispatch();

  const onFinish = (values: any) => {
    dispatch(
      loginAsync({
        account: values.account,
        pwd: md5(values.password),
        randomCode: values.randomCode,
      })
    );
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
    if (props && props.onValidateFailed != null) {
      props.onValidateFailed();
    }
  };
  const [randomCodeImgUrl, setRandomCodeImgUrl] = useState(
    `${env.host}/user/captcha`
  );
  const onRandomImgClick = () => {
    setRandomCodeImgUrl(
      `${env.host}/user/captcha?t=${new Date().getTime().toString()}`
    );
  };

  return (
    <Form
      {...layout}
      name="basic"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <Form.Item
        label="用户名"
        name="account"
        rules={[{ required: true, message: "请输入用户名!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="密码"
        name="password"
        rules={[{ required: true, message: "请输入密码!" }]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        label="验证码"
        name="randomCode"
        rules={[{ required: true, message: "请输入验证码!" }]}
      >
        <Row gutter={8} align="middle">
          <Col span={14}>
            <Input />
          </Col>

          <Col span={10}>
            <img
              src={randomCodeImgUrl}
              alt="验证码"
              onClick={onRandomImgClick}
            />
          </Col>
        </Row>
      </Form.Item>

      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          登录
        </Button>
      </Form.Item>
    </Form>
  );
};
