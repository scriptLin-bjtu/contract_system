const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 3001;
const SECRET_KEY = 'my_jwt_secret';
app.use(cookieParser()); 
app.use(bodyParser.json());
//Mysql数据库连接
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'contract_system'
});

db.connect(err => {
    if (err) {
        console.error('数据库连接失败：', err.stack);
        return;
    }
    console.log('数据库连接成功');
});
//token处理
const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ code: 401, message: '认证失败，请重新登录' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(401).json({ code: 401, message: '认证失败，请重新登录' });
        }
        req.user = user;
        next();
    });
};


//登陆api
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT id, username, password, role FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) return res.status(500).json({ code: 500, message: '服务器错误' });

        if (results.length === 0) {
            return res.status(401).json({ code: 401, message: '用户名或密码错误' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ code: 401, message: '用户名或密码错误' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        // 设置Cookie（关键修改）
        res.cookie('token', token, {
            maxAge: 3600000, // 1小时（与JWT过期时间一致）
            httpOnly: true,  // 防止XSS
            secure: process.env.NODE_ENV === 'production', // 生产环境启用HTTPS
            sameSite: 'strict' // 防御CSRF
        });

        // 返回成功响应（不再需要返回token）
        res.json({ code: 200, data: { message: '登录成功' } });
    });
});
app.post('/api/register', async (req, res) => {
    const { username, password, confirmPassword, role } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ code: 400, message: '密码和确认密码不匹配' });
    }

    const queryCheckUser = 'SELECT * FROM users WHERE username = ?';
    db.query(queryCheckUser, [username], async (err, results) => {
        if (err) return res.status(500).json({ code: 500, message: '服务器错误' });

        if (results.length > 0) {
            return res.status(400).json({ code: 400, message: '用户名已存在' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const queryInsertUser = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        db.query(queryInsertUser, [username, hashedPassword, role], async (err, results) => {
            if (err) return res.status(500).json({ code: 500, message: '服务器错误' });
			
                const queryInsertUserPermissions = `
                    INSERT INTO user_permissions (user_id, can_draft_contract, can_countersign_contract, can_finalize_contract, can_approve_contract, can_sign_contract, can_query_contract) 
                    VALUES (?, false, false, false, false, false, false)
                `;
            db.query(queryInsertUserPermissions, [results.insertId]);

            res.status(201).json({ code: 200, data: '注册成功' });
            
        });
    });
});
app.post('/api/logout', (req, res) => {
    // 清除 token cookie
    res.cookie('token', '', {
        httpOnly: true,   // 防止 JavaScript 访问该 cookie
        secure: process.env.NODE_ENV === 'production', // 生产环境启用 HTTPS
        expires: new Date(0),  // 设置过期时间为 1970 年 1 月 1 日
        sameSite: 'strict' // 防止 CSRF 攻击
    });
    // 返回登出成功的响应
    res.json({ code: 200, data: { message: '登出成功' } });
});


// 获取用户信息api
app.get('/api/checkAuth', authenticateJWT, (req, res) => {
    const { id, username, role } = req.user;
    res.json({ code: 200, data: { id, username, role } });
});

// 设置存储策略
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // 存储到uploads文件夹
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // 使用时间戳作为文件名
  }
});

const upload = multer({ storage: storage });

// 起草合同接口api
app.post('/api/draftContract', authenticateJWT, upload.single('attachment'), (req, res) => {
    const { id: created_by } = req.user;
    const { title, description, client_name, start_date, end_date } = req.body;
    const attachment = req.file ? '/uploads/' + req.file.filename : null;

    // 插入合同信息到合同表
    const queryInsertContract = 'INSERT INTO contracts (title, description, client_name, created_by, attachment, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(queryInsertContract, [title, description, client_name, created_by, attachment, start_date, end_date], (err, result) => {
        if (err) {
            console.error('合同起草失败：', err);
            return res.status(500).json({ code: 500, message: '合同起草失败' });
        }
        const contractId = result.insertId;
        const queryInsertProcess = 'INSERT INTO contract_process (contract_id, step, status) VALUES (?, ?, ?)';
        db.query(queryInsertProcess, [contractId, '起草', 'completed'], (err) => {
            if (err) {
                console.error('合同流程添加失败：', err);
                return res.status(500).json({ code: 500, message: '合同流程添加失败' });
            }
            res.status(201).json({ code: 200, data: '合同起草成功' });
        });
    });
});


//获取草稿合同列表api
app.get('/api/getDraftList', authenticateJWT, (req, res) => {
    const query = `
        SELECT id, title, description, client_name, created_at 
        FROM contracts 
        WHERE status = 'draft' AND id IN (
            SELECT contract_id 
            FROM contract_process 
            WHERE step = '起草'
        )`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('获取草稿合同列表失败：', err);
            return res.status(500).json({ code: 500, message: '获取草稿合同列表失败' });
        }
        res.json({ code: 200, data: results });
    });
});
//获取用户列表api
app.get('/api/getUsers/:permission', authenticateJWT, (req, res) => {
  const permission = req.params.permission;
  let query;
  
  if (permission === 'all') {
    query = 'SELECT id, username FROM users WHERE role = "user"';
    db.query(query, (err, results) => {
      if (err) {
        console.error('获取用户列表失败：', err);
        return res.status(500).json({ code: 500, message: '获取用户列表失败' });
      }
      res.status(200).json({ code: 200, data: results });
    });
  } else {
    // Map the permission to the corresponding column in user_permissions
    const permissionColumnMap = {
      'draft': 'can_draft_contract',
      'countersign': 'can_countersign_contract',
      'finalize': 'can_finalize_contract',
      'approve': 'can_approve_contract',
      'sign': 'can_sign_contract',
      'query': 'can_query_contract'
    };
    
    const column = permissionColumnMap[permission];
    
    if (!column) {
      return res.status(400).json({ code: 400, message: '无效的权限参数' });
    }
    
    query = `
      SELECT u.id, u.username 
      FROM users u
      JOIN user_permissions up ON u.id = up.user_id
      WHERE u.role = "user" AND up.${column} = TRUE
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('获取用户列表失败：', err);
        return res.status(500).json({ code: 500, message: '获取用户列表失败' });
      }
      res.status(200).json({ code: 200, data: results });
    });
  }
});


//指定合同会签人
app.post('/api/setCountersigner', authenticateJWT, (req, res) => {
    const { id, users } = req.body;
    const userList = users.split(';');

    // 查询合同是否存在并处于草稿状态
    const queryContract = 'SELECT * FROM contracts WHERE id = ? AND status = ?';
    db.query(queryContract, [id, 'draft'], (err, results) => {
        if (err) {
            console.error('查询合同失败：', err);
            return res.status(500).json({ code: 500, message: '查询合同失败' });
        }

        if (results.length === 0) {
            return res.status(404).json({ code: 404, message: '合同不存在或不处于草稿状态' });
        }

        // 查找用户ID
        const queryUsers = 'SELECT id, username FROM users WHERE username IN (?)';
        db.query(queryUsers, [userList], (err, userResults) => {
            if (err) {
                console.error('查询用户失败：', err);
                return res.status(500).json({ code: 500, message: '查询用户失败' });
            }

            if (userResults.length !== userList.length) {
                return res.status(404).json({ code: 404, message: '部分用户不存在' });
            }

            // 开启事务
            db.beginTransaction((err) => {
                if (err) {
                    console.error('开启事务失败：', err);
                    return res.status(500).json({ code: 500, message: '开启事务失败' });
                }

                // 更新合同表和合同流程表
                const updateContract = 'UPDATE contracts SET status = ? WHERE id = ?';
                const updateProcess = 'UPDATE contract_process SET step = ? WHERE contract_id = ?';

                db.query(updateContract, ['internal_review', id], (err) => {
                    if (err) {
                        db.rollback(() => {
                            console.error('更新合同表失败：', err);
                            return res.status(500).json({ code: 500, message: '更新合同表失败' });
                        });
                    }

                    db.query(updateProcess, ['待会签', id], (err) => {
                        if (err) {
                            db.rollback(() => {
                                console.error('更新合同流程表失败：', err);
                                return res.status(500).json({ code: 500, message: '更新合同流程表失败' });
                            });
                        }

                        // 插入会签人权限
                        const userPermissions = userResults.map(user => [user.id, id, 'edit']);
                        const insertPermissions = 'INSERT INTO user_contract_permissions (user_id, contract_id, permission) VALUES ?';

                        db.query(insertPermissions, [userPermissions], (err) => {
                            if (err) {
                                db.rollback(() => {
                                    console.error('插入会签人权限失败：', err);
                                    return res.status(500).json({ code: 500, message: '插入会签人权限失败' });
                                });
                            }

                            // 提交事务
                            db.commit((err) => {
                                if (err) {
                                    db.rollback(() => {
                                        console.error('提交事务失败：', err);
                                        return res.status(500).json({ code: 500, message: '提交事务失败' });
                                    });
                                }
                                res.status(200).json({ code: 200, data: '指定会签人成功' });
                            });
                        });
                    });
                });
            });
        });
    });
});

//获取待会签合同列表api
app.get('/api/getPendingContracts', authenticateJWT, (req, res) => {
    const { id: userId } = req.user;

    const query = `
        SELECT c.id, c.title, c.description, c.client_name, c.created_at,c.start_date,c.end_date,c.attachment
        FROM contracts c
        JOIN user_contract_permissions ucp ON c.id = ucp.contract_id
        WHERE ucp.user_id = ? AND ucp.permission = 'edit' AND c.status = 'internal_review'
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('查询待会签合同失败：', err);
            return res.status(500).json({ code: 500, message: '查询待会签合同失败' });
        }

        res.json({ code: 200, data: results });
    });
});

//提交会签意见api
app.post('/api/submitCountersign', authenticateJWT, (req, res) => {
    const { contractId, comment, status } = req.body;
    const { id: userId } = req.user;

    // 插入会签记录
    const insertSignature = `
        INSERT INTO contract_signatures (contract_id, signed_by, comment, status, signature_type)
        VALUES (?, ?, ?, ?, 'manual')
    `;

    db.query(insertSignature, [contractId, userId, comment, status], (err) => {
        if (err) {
            console.error('提交会签意见失败：', err);
            return res.status(500).json({ code: 500, message: '提交会签意见失败' });
        }

        // 删除用户权限表中的对应记录
        const deletePermission = `
            DELETE FROM user_contract_permissions 
            WHERE contract_id = ? AND user_id = ? AND permission = 'edit'
        `;

        db.query(deletePermission, [contractId, userId], (err) => {
            if (err) {
                console.error('删除用户权限记录失败：', err);
                return res.status(500).json({ code: 500, message: '删除用户权限记录失败' });
            }

            // 查询是否所有会签人都已提交意见
            const checkSignatures = `
                SELECT COUNT(*) AS pendingCount 
                FROM user_contract_permissions ucp
                LEFT JOIN contract_signatures cs ON ucp.contract_id = cs.contract_id AND ucp.user_id = cs.signed_by
                WHERE ucp.contract_id = ? AND ucp.permission = 'edit' AND cs.id IS NULL
            `;

            db.query(checkSignatures, [contractId], (err, results) => {
                if (err) {
                    console.error('检查会签状态失败：', err);
                    return res.status(500).json({ code: 500, message: '检查会签状态失败' });
                }

                const { pendingCount } = results[0];

                if (pendingCount === 0) {
                    // 更新合同流程表中的 step 为 '待定稿'
                    const updateProcess = `
                        UPDATE contract_process SET step = '待定稿' 
                        WHERE contract_id = ?
                    `;

                    db.query(updateProcess, [contractId], (err) => {
                        if (err) {
                            console.error('更新合同流程失败：', err);
                            return res.status(500).json({ code: 500, message: '更新合同流程失败' });
                        }

                        res.status(200).json({ code: 200, data: '会签意见提交成功，并更新为待定稿' });
                    });
                } else {
                    res.status(200).json({ code: 200, data: '会签意见提交成功' });
                }
            });
        });
    });
});

//获取待定稿合同列表api
app.get('/api/getFinalDrafts', authenticateJWT, (req, res) => {
    const { id: userId } = req.user;

    const queryContracts = `
        SELECT c.*, cp.step
        FROM contracts c
        JOIN contract_process cp ON c.id = cp.contract_id
        WHERE c.created_by = ? AND cp.step = '待定稿'
    `;

    db.query(queryContracts, [userId], (err, contracts) => {
        if (err) {
            console.error('获取待定稿合同列表失败：', err);
            return res.status(500).json({ code: 500, message: '获取待定稿合同列表失败' });
        }

        if (contracts.length === 0) {
            return res.status(200).json({ code: 200, data: [] });
        }

        const contractIds = contracts.map(contract => contract.id);
        
        // 获取会签意见
        const querySignatures = `
            SELECT cs.contract_id, cs.comment, cs.status, u.username
            FROM contract_signatures cs
            JOIN users u ON cs.signed_by = u.id
            WHERE cs.contract_id IN (?)
        `;

        db.query(querySignatures, [contractIds], (err, signatures) => {
            if (err) {
                console.error('获取会签意见失败：', err);
                return res.status(500).json({ code: 500, message: '获取会签意见失败' });
            }

            // 将会签意见添加到合同中
            const contractMap = contracts.reduce((map, contract) => {
                map[contract.id] = { ...contract, signatures: [] };
                return map;
            }, {});

            signatures.forEach(signature => {
                contractMap[signature.contract_id].signatures.push(signature);
            });

            const result = Object.values(contractMap);
            res.status(200).json({ code: 200, data: result });
        });
    });
});

// 提交定稿api
app.post('/api/submitFinalDraft', authenticateJWT, (req, res) => {
    const { contractId, title, description, clientName, changeDescription} = req.body;
    const { id: userId } = req.user;

    // 更新合同表
    const updateContract = `
        UPDATE contracts
        SET title = ?, description = ?, client_name = ?, status = 'approval'
        WHERE id = ?
    `;

    // 插入合同更改记录
    const insertChange = `
        INSERT INTO contract_changes (contract_id, change_description, changed_by)
        VALUES (?, ?, ?)
    `;

    // 更新合同流程表
    const updateProcess = `
        UPDATE contract_process SET step = '待审批' 
        WHERE contract_id = ?
    `;

    db.beginTransaction(err => {
        if (err) {
            console.error('启动事务失败：', err);
            return res.status(500).json({ code: 500, message: '启动事务失败' });
        }

        db.query(updateContract, [title, description, clientName,contractId], err => {
            if (err) {
                return db.rollback(() => {
                    console.error('更新合同表失败：', err);
                    res.status(500).json({ code: 500, message: '更新合同表失败' });
                });
            }

            db.query(insertChange, [contractId, changeDescription, userId], err => {
                if (err) {
                    return db.rollback(() => {
                        console.error('插入合同更改记录失败：', err);
                        res.status(500).json({ code: 500, message: '插入合同更改记录失败' });
                    });
                }

                db.query(updateProcess, [contractId], err => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('更新合同流程表失败：', err);
                            res.status(500).json({ code: 500, message: '更新合同流程表失败' });
                        });
                    }

                    db.commit(err => {
                        if (err) {
                            return db.rollback(() => {
                                console.error('提交事务失败：', err);
                                res.status(500).json({ code: 500, message: '提交事务失败' });
                            });
                        }

                        res.status(200).json({ code: 200, data: '定稿提交成功' });
                    });
                });
            });
        });
    });
});

//获取定稿合同列表api
app.get('/api/getApprovalList', authenticateJWT, (req, res) => {
    const query = `
        SELECT id, title, description, client_name, created_at ,start_date,end_date
        FROM contracts 
        WHERE status = 'approval' AND id IN (
            SELECT contract_id 
            FROM contract_process 
            WHERE step = '待审批'
        )`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('获取定稿合同列表失败：', err);
            return res.status(500).json({ code: 500, message: '获取定稿合同列表失败' });
        }
        res.json({ code: 200, data: results });
    });
});

//指定合同审批人api
app.post('/api/setContractApprover', authenticateJWT, (req, res) => {
    const { id,userId } = req.body;
    
    // 查询合同是否存在并处于草稿状态
    const queryContract = 'SELECT * FROM contracts WHERE id = ? AND status = ?';
    db.query(queryContract, [id, 'approval'], (err, results) => {
        if (err) {
            console.error('查询合同失败：', err);
            return res.status(500).json({ code: 500, message: '查询合同失败' });
        }

        if (results.length === 0) {
            return res.status(404).json({ code: 404, message: '合同不存在或不处于草稿状态' });
        }

        // 查找用户ID
        const queryUsers = 'SELECT id, username FROM users WHERE username = ?';
        db.query(queryUsers, [userId], (err, userResults) => {
            if (err) {
                console.error('查询用户失败：', err);
                return res.status(500).json({ code: 500, message: '查询用户失败' });
            }
            // 开启事务
            db.beginTransaction((err) => {
                if (err) {
                    console.error('开启事务失败：', err);
                    return res.status(500).json({ code: 500, message: '开启事务失败' });
                }

                // 更新合同表和合同流程表
                const updateContract = 'UPDATE contracts SET status = ? WHERE id = ?';
                const updateProcess = 'UPDATE contract_process SET step = ? WHERE contract_id = ?';

                db.query(updateContract, ['signed', id], (err) => {
                    if (err) {
                        db.rollback(() => {
                            console.error('更新合同表失败：', err);
                            return res.status(500).json({ code: 500, message: '更新合同表失败' });
                        });
                    }

                    db.query(updateProcess, ['待审批', id], (err) => {
                        if (err) {
                            db.rollback(() => {
                                console.error('更新合同流程表失败：', err);
                                return res.status(500).json({ code: 500, message: '更新合同流程表失败' });
                            });
                        }

                        // 插入审批人权限
                        const userPermissions = userResults.map(user => [user.id, id, 'edit']);
                        const insertPermissions = 'INSERT INTO user_contract_permissions (user_id, contract_id, permission) VALUES ?';

                        db.query(insertPermissions, [userPermissions], (err) => {
                            if (err) {
                                db.rollback(() => {
                                    console.error('插入审批人权限失败：', err);
                                    return res.status(500).json({ code: 500, message: '插入审批人权限失败' });
                                });
                            }

                            // 提交事务
                            db.commit((err) => {
                                if (err) {
                                    db.rollback(() => {
                                        console.error('提交事务失败：', err);
                                        return res.status(500).json({ code: 500, message: '提交事务失败' });
                                    });
                                }
                                res.status(200).json({ code: 200, data: '指定审批人成功' });
                            });
                        });
                    });
                });
            });
        });
    });
});

//获取待审批合同列表api
app.get('/api/getPendingApproval', authenticateJWT, (req, res) => {
    const { id: userId } = req.user;

    const query = `
        SELECT c.id, c.title, c.description, c.client_name, c.created_at ,c.start_date,c.end_date,c.attachment
        FROM contracts c
        JOIN user_contract_permissions ucp ON c.id = ucp.contract_id
        WHERE ucp.user_id = ? AND ucp.permission = 'edit' AND c.status = 'signed'
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('查询待审批合同失败：', err);
            return res.status(500).json({ code: 500, message: '查询待审批合同失败' });
        }

        res.json({ code: 200, data: results });
    });
});

// 提交审批结果api
app.post('/api/submitApprovalResults', authenticateJWT, (req, res) => {
    const { contractId, comment, status } = req.body;
    const { id: userId } = req.user;

    // 插入审批记录
    const insertSignature = `
        INSERT INTO contract_signatures (contract_id, signed_by, comment, status, signature_type)
        VALUES (?, ?, ?, ?, 'manual')
    `;

    db.query(insertSignature, [contractId, userId, comment, status], (err) => {
        if (err) {
            console.error('提交审批失败：', err);
            return res.status(500).json({ code: 500, message: '提交审批失败' });
        }

        // 删除用户权限表中的对应记录
        const deletePermission = `
            DELETE FROM user_contract_permissions 
            WHERE contract_id = ? AND user_id = ? AND permission = 'edit'
        `;

        db.query(deletePermission, [contractId, userId], (err) => {
            if (err) {
                console.error('删除用户权限记录失败：', err);
                return res.status(500).json({ code: 500, message: '删除用户权限记录失败' });
            }

            // 检查是否所有审批人都已提交意见
            const checkSignatures = `
                SELECT COUNT(*) AS pendingCount 
                FROM user_contract_permissions ucp
                LEFT JOIN contract_signatures cs ON ucp.contract_id = cs.contract_id AND ucp.user_id = cs.signed_by
                WHERE ucp.contract_id = ? AND ucp.permission = 'edit' AND cs.id IS NULL
            `;

            db.query(checkSignatures, [contractId], (err, results) => {
                if (err) {
                    console.error('检查审批状态失败：', err);
                    return res.status(500).json({ code: 500, message: '检查审批状态失败' });
                }

                const { pendingCount } = results[0];

                if (pendingCount === 0) {
                    // 所有审批人已提交意见，根据最后一个审批结果更新合同流程状态
                    const newStep = status === 'approved' ? '待签署' : '未通过';

                    const updateProcess = `
                        UPDATE contract_process SET step = ? 
                        WHERE contract_id = ?
                    `;

                    db.query(updateProcess, [newStep, contractId], (err) => {
                        if (err) {
                            console.error('更新合同流程失败：', err);
                            return res.status(500).json({ code: 500, message: '更新合同流程失败' });
                        }

                        if (status === 'approved') {
                            // 获取 client_name 并插入签署权限
                            const getClientName = `
                                SELECT client_name FROM contracts WHERE id = ?
                            `;

                            db.query(getClientName, [contractId], (err, results) => {
                                if (err) {
                                    console.error('获取客户端名称失败：', err);
                                    return res.status(500).json({ code: 500, message: '获取客户端名称失败' });
                                }

                                const { client_name } = results[0];
                                const users = client_name.split(';');

                                // 查找用户ID
                                const queryUsers = 'SELECT id, username FROM users WHERE username IN (?)';
                                db.query(queryUsers, [users], (err, userResults) => {
                                    if (err) {
                                        console.error('查询用户失败：', err);
                                        return res.status(500).json({ code: 500, message: '查询用户失败' });
                                    }

                                    const userPermissions = userResults.map(user => [user.id, contractId, 'sign']);
                                    const insertPermissions = 'INSERT INTO user_contract_permissions (user_id, contract_id, permission) VALUES ?';

                                    db.query(insertPermissions, [userPermissions], (err) => {
                                        if (err) {
                                            console.error('插入签署权限失败：', err);
                                            return res.status(500).json({ code: 500, message: '插入签署权限失败' });
                                        }

                                        res.status(200).json({ code: 200, data: '审批结果提交成功，并更新合同状态为待签署' });
                                    });
                                });
                            });
                        } else {
                            res.status(200).json({ code: 200, data: '审批结果提交成功，并更新合同状态为未通过' });
                        }
                    });
                } else {
                    res.status(200).json({ code: 200, data: '审批结果提交成功' });
                }
            });
        });
    });
});
//获取待签定列表api
app.get('/api/getPendingSignContracts', authenticateJWT, (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT c.id, c.title, c.description ,c.start_date,c.end_date,c.attachment
        FROM contracts c
        JOIN user_contract_permissions ucp ON c.id = ucp.contract_id
        WHERE ucp.user_id = ? AND ucp.permission = 'sign' AND c.status = 'signed'
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('获取待签定合同列表失败：', err);
            return res.status(500).json({ code: 500, message: '获取待签定合同列表失败' });
        }
        res.status(200).json({code:200,data:results});
    });
});
//签署合同api
app.post('/api/submitSignContract', authenticateJWT, (req, res) => {
    const { contractId, comment } = req.body;
    const { id: userId } = req.user;

    // 插入签署记录
    const insertSignature = `
        INSERT INTO contract_signatures (contract_id, signed_by, comment, status, signature_type)
        VALUES (?, ?, ?, 'approved', 'manual')
    `;

    db.query(insertSignature, [contractId, userId, comment], (err) => {
        if (err) {
            console.error('提交签署信息失败：', err);
            return res.status(500).json({ code: 500, message: '提交签署信息失败' });
        }

        // 删除用户权限表中的对应记录
        const deletePermission = `
            DELETE FROM user_contract_permissions 
            WHERE contract_id = ? AND user_id = ? AND permission = 'sign'
        `;

        db.query(deletePermission, [contractId, userId], (err) => {
            if (err) {
                console.error('删除用户权限记录失败：', err);
                return res.status(500).json({ code: 500, message: '删除用户权限记录失败' });
            }

            // 检查是否所有签署人都已提交签署信息
            const checkSignatures = `
                SELECT COUNT(*) AS pendingCount 
                FROM user_contract_permissions 
                WHERE contract_id = ? AND permission = 'sign'
            `;

            db.query(checkSignatures, [contractId], (err, results) => {
                if (err) {
                    console.error('检查签署状态失败：', err);
                    return res.status(500).json({ code: 500, message: '检查签署状态失败' });
                }

                const { pendingCount } = results[0];

                if (pendingCount === 0) {
                    // 所有签署人已提交签署信息，更新合同流程状态为已签署，合同状态为归档
                    const updateProcess = `
                        UPDATE contract_process SET step = '已签署' 
                        WHERE contract_id = ?
                    `;

                    db.query(updateProcess, [contractId], (err) => {
                        if (err) {
                            console.error('更新合同流程失败：', err);
                            return res.status(500).json({ code: 500, message: '更新合同流程失败' });
                        }

                        const updateContract = `
                            UPDATE contracts SET status = 'archived'
                            WHERE id = ?
                        `;

                        db.query(updateContract, [contractId], (err) => {
                            if (err) {
                                console.error('更新合同状态失败：', err);
                                return res.status(500).json({ code: 500, message: '更新合同状态失败' });
                            }

                            res.status(200).json({ code: 200, data: '合同签署成功，已更新状态' });
                        });
                    });
                } else {
                    res.status(200).json({ code: 200, data: '合同签署成功' });
                }
            });
        });
    });
});

//查询合同信息api
app.post('/api/getContractDetails', authenticateJWT, (req, res) => {
    let { contractId } = req.body;
	const {role} =req.user;
    contractId = parseInt(contractId, 10);
    //console.log(`Received contractId: ${contractId}`);

    if (isNaN(contractId)) {
        console.error('Invalid contractId:', contractId);
        return res.status(400).json({ code: 400, message: '无效的合同ID' });
    }

    const contractQuery = 'SELECT * FROM contracts WHERE id = ?';
    const changesQuery = 'SELECT * FROM contract_changes WHERE contract_id = ?';
    const processQuery = 'SELECT * FROM contract_process WHERE contract_id = ?';
    const permissionsQuery = 'SELECT * FROM user_contract_permissions WHERE contract_id = ?';
    const signaturesQuery = 'SELECT * FROM contract_signatures WHERE contract_id = ?';

    db.query(contractQuery, [contractId], (err, contractResults) => {
        if (err) {
            console.error('查询合同失败：', err);
            return res.status(500).json({ code: 500, message: '查询合同失败' });
        }

        if (contractResults.length === 0) {
            console.error('合同不存在');
            return res.status(404).json({ code: 404, message: '合同不存在' });
        }

        const contract = contractResults[0];
        //console.log('Contract results:', contract);

        db.query(changesQuery, [contractId], (err, changesResults) => {
            if (err) {
                console.error('查询合同修改记录失败：', err);
                return res.status(500).json({ code: 500, message: '查询合同修改记录失败' });
            }

            //console.log('Changes results:', changesResults);

            db.query(processQuery, [contractId], (err, processResults) => {
                if (err) {
                    console.error('查询合同流程信息失败：', err);
                    return res.status(500).json({ code: 500, message: '查询合同流程信息失败' });
                }

                //console.log('Process results:', processResults);

                db.query(permissionsQuery, [contractId], (err, permissionsResults) => {
                    if (err) {
                        console.error('查询用户权限信息失败：', err);
                        return res.status(500).json({ code: 500, message: '查询用户权限信息失败' });
                    }

                    //console.log('Permissions results:', permissionsResults);

                    db.query(signaturesQuery, [contractId], (err, signaturesResults) => {
                        if (err) {
                            console.error('查询签署信息失败：', err);
                            return res.status(500).json({ code: 500, message: '查询签署信息失败' });
                        }

                       //console.log('Signatures results:', signaturesResults);
					   let Thedata;
					   if(role==='user'){
						   Thedata={
							   contract,
							   changes: [],
							   process: processResults[0],
							   permissions: [],
							   signatures: []
						   };
					   }else{
						   Thedata={
							   contract,
							   changes: changesResults,
							   process: processResults[0],
							   permissions: permissionsResults,
							   signatures: signaturesResults
						   };
					   }
                        res.status(200).json({code:200,data:Thedata});
                    });
                });
            });
        });
    });
});

//更新用户权限api
app.post('/api/updateUserPermissions', authenticateJWT, (req, res) => {
    try {
        const { userId, permissions } = req.body;
        const updateQuery = `
            UPDATE user_permissions 
            SET 
                can_draft_contract = ?,
                can_countersign_contract = ?,
                can_finalize_contract = ?,
                can_approve_contract = ?,
                can_sign_contract = ?,
                can_query_contract = ?
            WHERE user_id = ?
        `;
        db.query(updateQuery, [
            permissions.draftContract,
            permissions.countersignContract,
            permissions.finalizeContract,
            permissions.approveContract,
            permissions.signContract,
            permissions.viewContract,
            userId
        ], (err) => {
            if (err) {
                console.error('更新用户权限失败：', err);
                return res.status(500).json({ code: 500, message: '更新用户权限失败' });
            }

            res.status(200).json({ code: 200, data: '用户权限更新成功' });
        });
    } catch (error) {
        console.error('更新用户权限失败：', error);
        res.status(500).json({ code: 500, message: '更新用户权限失败' });
    }
});
//查询用户是否有权限api
app.post('/api/checkPermission/:permission', authenticateJWT, (req, res) => {
    try {
        const { id: userId } = req.user;
        const { permission } = req.params;
		//console.log(permission);
		//console.log(userId);

        // 查询用户对应的权限表中是否有该权限
        const query = `
            SELECT 
                CASE WHEN ${permission} = true THEN true ELSE false END AS hasPermission
            FROM user_permissions
            WHERE user_id = ?
        `;
        
        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error('查询用户权限失败：', err);
                return res.status(500).json({ code: 500, message: '查询用户权限失败' });
            }

            // 如果查询成功，返回结果
            if (results.length > 0) {
                const { hasPermission } = results[0];
                res.status(200).json({ code:200,data:hasPermission });
            } else {
                res.status(404).json({ code: 404, message: '用户权限未找到' });
            }
        });
    } catch (error) {
        console.error('检查用户权限失败：', error);
        res.status(500).json({ code: 500, message: '检查用户权限失败' });
    }
});


app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = __dirname +'/uploads/'+ filename;
  res.download(filePath); // 使用 res.download() 发送文件
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ code: 500, message: '服务器错误' });
});

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});

