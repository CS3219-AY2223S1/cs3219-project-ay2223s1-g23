import { getCookie } from "./cookies";
import jwtDecode from "jwt-decode";

const decodedJwt = () => {
  const token = getCookie("token");
  if (!token) {
    return {};
  }

  return jwtDecode(token);
};

export default decodedJwt;
