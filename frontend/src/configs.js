const URI_USER_SVC = process.env.REACT_APP_URI_USER_SVC || "http://localhost:8000";
const URI_MATCH_SVC = process.env.REACT_APP_URI_MATCH_SVC || "http://localhost:8001";
const URI_COLLAB_SVC = process.env.REACT_APP_URI_COLLAB_SVC || "http://localhost:8002";
const URI_COMM_SVC = process.env.REACT_APP_URI_COMM_SVC || "http://localhost:8003";
const URI_QUES_SVC = process.env.REACT_APP_URI_QUES_SVC || "http://localhost:8009";

const PREFIX_USER_SVC = "/api/user";

export const URL_USER_SVC = URI_USER_SVC + PREFIX_USER_SVC;
export const URL_USER_SVC_LOGIN = URL_USER_SVC + "/login";
export const URL_USER_SVC_LOGOUT = URL_USER_SVC + "/logout";
export const URL_USER_SVC_USER_INFO = URL_USER_SVC + "/userInfo";
export const URL_USER_SVC_FORGET_PASSWORD = URL_USER_SVC + "/forget-password";
export const URL_USER_SVC_RESET_PASSWORD = URL_USER_SVC + "/reset-password";
export const URL_MATCH_SVC = URI_MATCH_SVC;
export const URL_INSERT_DIFFICULTY = URL_MATCH_SVC + "/difficulties";
export const URL_COLLAB_SVC = URI_COLLAB_SVC;
export const URL_COLLAB = URI_COLLAB_SVC + "/collab";
export const URL_COMM_SVC = URI_COMM_SVC;
export const URL_INSERT_ONLINE = URL_COMM_SVC + "/online";
export const URL_QUES = URI_QUES_SVC + "/q";
