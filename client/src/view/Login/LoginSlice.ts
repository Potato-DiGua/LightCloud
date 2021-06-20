import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { message } from "antd";
import { RootState } from "../../app/store";
import { api } from "./api";

export interface LoginState {
  isLogin: boolean;
}

const initialState: LoginState = {
  isLogin: false,
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const loginAsync = createAsyncThunk<
  boolean,
  { account: string; pwd: string }
>("login/login", async (params) => {
  const { data: resp } = await api.login(params.account, params.pwd);
  if (resp.status === 0 && resp.data) {
    return true;
  } else {
    message.error(resp.msg || "登录失败");
    return false;
  }
});

export const isLoginAsync = createAsyncThunk<boolean>(
  "login/isLogin",
  async () => {
    const { data: resp } = await api.isLogin();
    if (resp.status === 0 && resp.data) {
      return true;
    } else {
      return false;
    }
  }
);

export const loginSlice = createSlice({
  name: "login",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    login: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.isLogin = true;
    },
    logOut: (state) => {
      state.isLogin = false;
    },
  },
  // 处理异步请求结果的reducer
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLogin = action.payload;
      })
      .addCase(isLoginAsync.fulfilled, (state, action) => {
        state.isLogin = action.payload;
      });
  },
});

export const { login, logOut } = loginSlice.actions;

export const selectLoginFlag = (state: RootState) => state.login.isLogin;

export default loginSlice.reducer;
