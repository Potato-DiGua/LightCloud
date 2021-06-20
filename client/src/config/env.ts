function isDev() {
  return process.env.NODE_ENV === "development";
}

const env = {
  host: isDev() ? "http://localhost" : "",
};
export default env;
