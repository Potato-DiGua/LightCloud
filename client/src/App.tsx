import "./App.css";
import { Layout } from "antd";
import { Content } from "antd/lib/layout/layout";
import { FileList } from "./view/FileList/FileList";
import { HeaderBlock } from "./view/Header";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { isLoginAsync, selectLoginFlag } from "./view/Login/LoginSlice";
import { useEffect } from "react";

function App() {
  const isLogin = useAppSelector(selectLoginFlag);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(isLoginAsync());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Layout>
      <HeaderBlock />
      <Content style={{ minHeight: "100vh" }}>
        <FileList isLogin={isLogin} />
      </Content>
    </Layout>
  );
}

export default App;
