const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'project_pweb',
});

async function seedPasswords() {
    const plaintextPassword = 'rahasia123';
    const hashed = await bcrypt.hash(plaintextPassword, 10);

    await pool.execute('UPDATE users SET password = ? WHERE id = 1', [hashed]);
    await pool.execute('UPDATE users SET password = ? WHERE id = 2', [hashed]);
    await pool.execute('UPDATE users SET password = ? WHERE id = 3', [hashed]);

    console.log('Password berhasil di-hash dan diupdate!');
    console.log('Hash:', hashed);
    await pool.end();
}

seedPasswords().catch(console.error);