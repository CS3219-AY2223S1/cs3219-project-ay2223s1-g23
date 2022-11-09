import express from 'express';
import cors from 'cors';
import { CREATE_PATH, DELETE_PATH, LOGIN_PATH, FORGET_PASSWORD_PATH, RESET_PASSWORD_PATH } from "./config.js";

const app = express();
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors()) // config cors so that front-end can use
app.options('*', cors())
import { createUser, loginUser, forgetPassword, resetPassword, deleteUser } from './controller/user-controller.js';
import { verifyJWT } from './middleware/verifyJWT.js';

const router = express.Router()

// Controller will contain all the User-defined Routes
router.get('/', (_, res) => res.send('Hello World from user-service'))
router.post(CREATE_PATH, createUser)
router.post(LOGIN_PATH, loginUser)
router.delete(DELETE_PATH, verifyJWT, deleteUser)
router.post(FORGET_PASSWORD_PATH, forgetPassword)
router.put(RESET_PASSWORD_PATH, resetPassword)

app.use('/api/user', router).all((_, res) => {
    res.setHeader('content-type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
})

const PORT = process.env.PORT || 8000;

app.listen(PORT, () =>
  console.log(`user-service listening on port ${PORT}`)
);

export default app;