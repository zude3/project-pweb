const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pweb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('login', {
            error: "Email dan password tidak boleh kosong!",
            berhasil: null
        });
    }

    try {
        const query = `
            SELECT u.*, r.id AS role_id, r.name AS role_name
            FROM users u
            LEFT JOIN model_has_roles mhr ON u.id = mhr.model_id
            LEFT JOIN roles r ON mhr.role_id = r.id
            WHERE u.email = ?
        `;
        const [rows] = await pool.execute(query, [email]);

        if (rows.length === 0) {
            return res.render('login', { error: "Email tidak ditemukan.", berhasil: null });
        }

        const user = rows[0];
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.render('login', { error: "Password salah.", berhasil: null });
        }

        const queryPermissions = `
            SELECT p.name AS permission_name
            FROM permissions p
            JOIN role_has_permissions rhp ON p.id = rhp.permission_id
            WHERE rhp.role_id = ?
        `;
        const [permissionRows] = await pool.execute(queryPermissions, [user.role_id]);
        const userPermissions = permissionRows.map(row => row.permission_name);

        req.session.userId = user.id;
        req.session.userName = user.name;  
        req.session.userRole = user.role_name;
        req.session.permissions = userPermissions;

        if (user.role_name === 'pj_peralatan') {
            res.redirect('/dashboard-pj');
        } else if (user.role_name === 'mahasiswa') {
            res.redirect('/dashboard-mahasiswa');
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send("Terjadi kesalahan saat logout.");
        res.clearCookie('connect.sid');
        res.redirect('/login?berhasil=Anda+berhasil+logout');
    });
});

app.post('/tambah-alat', async (req, res) => {
    const { nama, jumlah } = req.body;
    if (!nama || !jumlah) {
        return res.redirect('/tambah-alat?error=Data+tidak+lengkap');
    }

    try {
        await pool.execute(
            'INSERT INTO peralatan (nama, jumlah, tersedia, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
            [nama, parseInt(jumlah), parseInt(jumlah)]
        );
        res.redirect('/dashboard-pj?berhasil=Alat+berhasil+ditambahkan');
    } catch (error) {
        console.error("Error tambah alat:", error);
        res.status(500).send("Gagal menambahkan alat");
    }
});