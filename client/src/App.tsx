import "./App.css";
import { Layout } from "antd";
import { Content, Header } from "antd/lib/layout/layout";
import { FileList } from "./view/FileList/FileList";

function App() {
  return (
    <Layout>
      <Header>
        <h2 style={{ color: "white" }}>云盘</h2>
      </Header>
      <Content style={{ minHeight: "100vh" }}>
        <FileList></FileList>
      </Content>
    </Layout>
  );
}

export default App;
