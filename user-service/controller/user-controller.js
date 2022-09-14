import { ormCreateUser as _createUser,
        ormLoginUser as _loginUser,
        ormForgetPassword as _forgetPassword,
        ormVerifyResetPassword as _verifyResetPassword,
        ormResetPassword as _resetPassword } from '../model/user-orm.js'

export async function createUser(req, res) {
    try {
        const { username, email, password } = req.body;
        if (username && email && password) {
            const resp = await _createUser(username, email, password);
            console.log(resp);
            if (resp.err) {
                return res.status(400).json({message: 'Could not create a new user!'});
            } else {
                if (resp) {
                    console.log(`Created new user ${username} successfully!`)
                    return res.status(201).json({message: `Created new user ${username} successfully!`});
                } else {
                    console.log(`${username} already exists!`)
                    return res.status(400).json({message: `${username} already exists!`});
                }
            }
        } else {
            return res.status(400).json({message: 'Username, Email and/or Password are missing!'});
        }
    } catch (err) {
        return res.status(500).json({message: 'Database failure when creating new user!'})
    }
}

export async function loginUser(req, res) {
    try {
        const { username, password } = req.body;
        if (username && password) {
            const resp = await _loginUser(username, password);
            console.log(resp);
            if (resp.err) {
                return res.status(400).json({ message: resp.err });
            } else {
                const jwt = resp.jwt;
                console.log(`Login in as user ${username} successfully!`)
                return res.status(200).json({ jwt });
            }
        } else {
            return res.status(400).json({ message: 'Username and/or Password are missing!' });
        }
    } catch (err) {
        return res.status(500).json({ message: `Database failure when logging in as ${username}!` })
    }
}

export async function forgetPassword(req, res) {
    try {
        const { username } = req.body;
        // Check the existance of input
        if (!username) {
            return res.status(400).json({ message: 'Username is missing!' });
        }

        const resp = await _forgetPassword(username);
        if(resp.err) {
            return res.status(400).json({ message: resp.err });
        } else {
            const msg = resp.message;
            console.log(msg);
            return res.status(200).json({ msg });
        }
    } catch (err) {
        return res.status(500).json({ message: `Database failure when sending reset link!` })
    }
}

export async function verifyResetPassword(req, res) {
    try {
        const { username, token } = req.params;
        const resp = await _verifyResetPassword(username, token);
        
        if (resp.err || !resp) {
            return res.status(400).json({ message: resp.err });
        } else {
            return res.status(200).json(true)
        }

    } catch (err) {
        return res.status(500).json({ message: `Database failure while resetting password!` })
    }
}

export async function resetPassword(req, res) {
    try {
        const { username, token } = req.params;
        const { password, confirmPassword } = req.body;
        const resp = await _resetPassword(username, token, password, confirmPassword);

        if (resp.err) {
            return res.status(400).json({message: 'Fail to reset password!'});
        } else if (resp) {
            console.log(`Password updated successfully!`)
            return res.status(200).json({message: `Password updated successfully!`});
        } else {
            console.log('Password does not match!')
            return res.status(400).json({message: 'Password does not match!'});
        }
    } catch (err) {
        return res.status(500).json({ message: `Database failure while resetting password!` })
    }
}
    
