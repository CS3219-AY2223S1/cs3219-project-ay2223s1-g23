const URI_USER_SVC = process.env.URI_USER_SVC || 'http://localhost:8000';
const URI_MATCH_SVC = process.env.URI_MATCH_SVC || 'http://localhost:8001';

const PREFIX_USER_SVC = '/api/user';

export const URL_USER_SVC = URI_USER_SVC + PREFIX_USER_SVC;
export const URL_MATCH_SVC = URI_MATCH_SVC;
export const URL_INSERT_DIFFICULTY = URL_MATCH_SVC + '/difficulties';
