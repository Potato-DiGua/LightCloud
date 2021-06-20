import { http } from "../../config/http";
import { ResponseWrap } from "../../model/ResponseWrap";
export const api = {
  login(account: string, pwd: string) {
    return http.post<ResponseWrap<boolean>>("/user/login", {
      account: account,
      pwd: pwd,
    });
  },
  isLogin() {
    return http.get<ResponseWrap<boolean>>("/user/isLogin");
  },
};
