import { ormCreateUser as _createUser,
        ormLoginUser as _loginUser,
        ormForgetPassword as _forgetPassword,
        ormResetPassword as _resetPassword,
        ormDeleteUser as _deleteUser } from '../model/user-orm.js'

export async function createUser(req, res) {
    try {
        const { username, email, password } = req.body;
        const emptyError = { err: {} }
        if (!username) {
            emptyError.err.username = 'Username is missing!' 
        } 
        if (!email) {
            emptyError.err.email = 'Email is missing!' 
        } 
        if (!password) {
            emptyError.err.password = 'Password is missing!' 
        } 

        if (emptyError.err.username || emptyError.err.email || emptyError.err.password) {
            return res.status(400).json(emptyError);
        }
        
        
        const resp = await _createUser(username, email, password);
        console.log(resp);
        if (resp.err) {
            return res.status(400).json(resp);
        } else {
            if (resp) {
                console.log(`Created new user ${username} successfully!`)
                return res.status(201).json({message: `Created new user ${username} successfully!`});
            } else {
                console.log(`${username} already exists!`)
                return res.status(400).json(resp);
            }
        }
        
    } catch (err) {
        return res.status(500).json({message: 'Database failure when creating new user!'})
    }
}

export async function deleteUser(req, res) {
    try {
        const { username } = req.params;
        const resp = await _deleteUser(username);
        if (resp.err) {
            return res.status(400).json({message: 'Could not delete the user'});
        } else if (resp) {
            return res.status(200).json({message: `User successfully removed!`}); 
        } else {
            return res.status(404).json({message: 'User not found!'});
        }
    } catch (err) {
        return res.status(500).json({message: 'Database failure when deleting user!'})
    }
}

export async function loginUser(req, res) {
    try {
        const { username, password } = req.body;
        const emptyError = { err: {} }
        if (!username) {
            emptyError.err.username = 'Username is missing!' 
        }  
        if (!password) {
            emptyError.err.password = 'Password is missing!' 
        }

        if (emptyError.err.username || emptyError.err.password) {
            return res.status(400).json(emptyError);
        }
        
        const resp = await _loginUser(username, password);
        console.log(resp);
        if (resp.err) {
            return res.status(400).json(resp);
        } else {
            const jwt = resp.jwt;
            console.log(`Login in as user ${username} successfully!`)
            return res.status(200).json({ jwt });
        }
    } catch (err) {
        return res.status(500).json({ message: `Database failure when logging in as ${username}!` })
    }
}

export async function forgetPassword(req, res) {
    try {
        const { username } = req.body;
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

export async function resetPassword(req, res) {
    try {
        const { token } = req.params;
        const { username, newPassword, confirmNewPassword } = req.body;
        if (!newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: 'Password and/or Confirm Password is missing!' }); 
        }

        const resp = await _resetPassword(username, token, newPassword, confirmNewPassword);

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
    
