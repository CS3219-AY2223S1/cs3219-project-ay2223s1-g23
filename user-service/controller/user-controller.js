import { ormCreateUser as _createUser,
        ormLoginUser as _loginUser,
        ormDeleteUser as _deleteUser } from '../model/user-orm.js';

export async function createUser(req, res) {
    try {
        const { username, password } = req.body;
        if (username && password) {
            const resp = await _createUser(username, password);
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
            return res.status(400).json({message: 'Username and/or Password are missing!'});
        }
    } catch (err) {
        return res.status(500).json({message: 'Database failure when creating new user!'})
    }
}

export async function deleteUser(req, res) {
    try {
        const { username } = req.params;
        const resp = _deleteUser(username);
        if (resp) {
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