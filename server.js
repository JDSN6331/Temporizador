import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'pulse_precision_jwt_secret_key_2026';
const DATABASE_URL = process.env.DATABASE_URL;

// Database Adapter Abstraction (Supports PostgreSQL & SQLite)
let dbAdapter = {
  isPg: false,
  sqliteDb: null,
  pgPool: null,

  async init() {
    if (DATABASE_URL) {
      console.log('🐘 Conectando ao Banco de Dados PostgreSQL...');
      this.isPg = true;
      this.pgPool = new pg.Pool({ connectionString: DATABASE_URL });
      
      await this.pgPool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS workout_history (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          preset_name VARCHAR(255) NOT NULL,
          preset_category VARCHAR(255) NOT NULL,
          duration_seconds INTEGER NOT NULL,
          completed_at VARCHAR(255) NOT NULL,
          calories_burned INTEGER DEFAULT 0,
          rounds_completed INTEGER DEFAULT 4,
          total_rounds INTEGER DEFAULT 4,
          work_seconds INTEGER,
          rest_seconds INTEGER,
          prep_seconds INTEGER,
          exercises_per_set INTEGER,
          set_rest_seconds INTEGER,
          total_sets INTEGER
        );

        CREATE TABLE IF NOT EXISTS custom_presets (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(255) NOT NULL,
          work_seconds INTEGER NOT NULL,
          rest_seconds INTEGER NOT NULL,
          sets INTEGER NOT NULL,
          cycles INTEGER DEFAULT 1,
          prep_seconds INTEGER DEFAULT 10,
          set_rest_seconds INTEGER DEFAULT 60,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS user_settings (
          user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          sound_enabled INTEGER DEFAULT 1,
          volume REAL DEFAULT 0.6,
          theme_mode VARCHAR(50) DEFAULT 'dark',
          weekly_goal INTEGER DEFAULT 5,
          glassmorphism_enabled INTEGER DEFAULT 1
        );
      `);

      // Safe column additions for existing PostgreSQL tables
      const pgCols = ['rounds_completed', 'total_rounds', 'work_seconds', 'rest_seconds', 'prep_seconds', 'exercises_per_set', 'set_rest_seconds', 'total_sets'];
      for (const col of pgCols) {
        try { await this.pgPool.query(`ALTER TABLE workout_history ADD COLUMN ${col} INTEGER`); } catch (e) {}
      }

      console.log('✅ PostgreSQL Schema Inicializado com Sucesso!');
    } else {
      console.log('📁 Conectando ao Banco de Dados SQLite...');
      const dataDir = path.join(__dirname, 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const dbPath = process.env.DB_PATH || path.join(dataDir, 'database.sqlite');
      this.sqliteDb = new Database(dbPath);
      this.sqliteDb.pragma('journal_mode = WAL');

      this.sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS workout_history (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          preset_name TEXT NOT NULL,
          preset_category TEXT NOT NULL,
          duration_seconds INTEGER NOT NULL,
          completed_at TEXT NOT NULL,
          calories_burned INTEGER DEFAULT 0,
          rounds_completed INTEGER DEFAULT 4,
          total_rounds INTEGER DEFAULT 4,
          work_seconds INTEGER,
          rest_seconds INTEGER,
          prep_seconds INTEGER,
          exercises_per_set INTEGER,
          set_rest_seconds INTEGER,
          total_sets INTEGER,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS custom_presets (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          work_seconds INTEGER NOT NULL,
          rest_seconds INTEGER NOT NULL,
          sets INTEGER NOT NULL,
          cycles INTEGER DEFAULT 1,
          prep_seconds INTEGER DEFAULT 10,
          set_rest_seconds INTEGER DEFAULT 60,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS user_settings (
          user_id TEXT PRIMARY KEY,
          sound_enabled INTEGER DEFAULT 1,
          volume REAL DEFAULT 0.6,
          theme_mode TEXT DEFAULT 'dark',
          weekly_goal INTEGER DEFAULT 5,
          glassmorphism_enabled INTEGER DEFAULT 1,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      // Safe column additions for existing SQLite tables
      const sqliteCols = ['rounds_completed', 'total_rounds', 'work_seconds', 'rest_seconds', 'prep_seconds', 'exercises_per_set', 'set_rest_seconds', 'total_sets'];
      for (const col of sqliteCols) {
        try { this.sqliteDb.exec(`ALTER TABLE workout_history ADD COLUMN ${col} INTEGER`); } catch (e) {}
      }

      console.log(`✅ SQLite Inicializado em: ${dbPath}`);
    }
  },

  async queryOne(sqlSqlite, paramsSqlite, sqlPg, paramsPg) {
    if (this.isPg) {
      const res = await this.pgPool.query(sqlPg || sqlSqlite, paramsPg || paramsSqlite);
      return res.rows[0];
    }
    return this.sqliteDb.prepare(sqlSqlite).get(...(paramsSqlite || []));
  },

  async queryAll(sqlSqlite, paramsSqlite, sqlPg, paramsPg) {
    if (this.isPg) {
      const res = await this.pgPool.query(sqlPg || sqlSqlite, paramsPg || paramsSqlite);
      return res.rows;
    }
    return this.sqliteDb.prepare(sqlSqlite).all(...(paramsSqlite || []));
  },

  async execute(sqlSqlite, paramsSqlite, sqlPg, paramsPg) {
    if (this.isPg) {
      return await this.pgPool.query(sqlPg || sqlSqlite, paramsPg || paramsSqlite);
    }
    return this.sqliteDb.prepare(sqlSqlite).run(...(paramsSqlite || []));
  }
};

await dbAdapter.init();

const app = express();
app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Acesso não autorizado. Faça login primeiro.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Sessão expirada ou inválida.' });
    }
    req.user = decoded;
    next();
  });
};

// ================= AUTH ROUTES =================

// Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Preencha nome, e-mail e senha.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await dbAdapter.queryOne(
      'SELECT id FROM users WHERE email = ?',
      [cleanEmail],
      'SELECT id FROM users WHERE email = $1',
      [cleanEmail]
    );

    if (existing) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const hashedPassword = bcrypt.hashSync(password, 10);

    await dbAdapter.execute(
      'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)',
      [userId, name.trim(), cleanEmail, hashedPassword],
      'INSERT INTO users (id, name, email, password_hash) VALUES ($1, $2, $3, $4)',
      [userId, name.trim(), cleanEmail, hashedPassword]
    );

    await dbAdapter.execute(
      'INSERT INTO user_settings (user_id, sound_enabled, volume, theme_mode, weekly_goal, glassmorphism_enabled) VALUES (?, 1, 0.6, \'dark\', 5, 1)',
      [userId],
      'INSERT INTO user_settings (user_id, sound_enabled, volume, theme_mode, weekly_goal, glassmorphism_enabled) VALUES ($1, 1, 0.6, \'dark\', 5, 1)',
      [userId]
    );

    const userPayload = { id: userId, name: name.trim(), email: cleanEmail };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '30d' });

    return res.json({
      user: { ...userPayload, isLoggedIn: true },
      token
    });
  } catch (err) {
    console.error('Erro no registro:', err);
    return res.status(500).json({ error: 'Erro interno ao criar conta.' });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Informe e-mail e senha.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await dbAdapter.queryOne(
      'SELECT * FROM users WHERE email = ?',
      [cleanEmail],
      'SELECT * FROM users WHERE email = $1',
      [cleanEmail]
    );

    if (!user) {
      return res.status(404).json({ error: 'Esta conta ainda não foi cadastrada. Clique na aba CADASTRAR para criar sua conta.' });
    }

    const passwordValid = bcrypt.compareSync(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Senha incorreta. Verifique os dados digitados.' });
    }

    const userPayload = { id: user.id, name: user.name, email: user.email };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '30d' });

    return res.json({
      user: { ...userPayload, isLoggedIn: true },
      token
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
});

// Get Current Logged-in User Info
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbAdapter.queryOne(
      'SELECT id, name, email FROM users WHERE id = ?',
      [req.user.id],
      'SELECT id, name, email FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    return res.json({ user: { ...user, isLoggedIn: true } });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar dados do usuário.' });
  }
});

// ================= HISTORY ROUTES =================

app.get('/api/history', authenticateToken, async (req, res) => {
  try {
    const rows = await dbAdapter.queryAll(
      `SELECT id, preset_name as "presetName", preset_category as "presetCategory", 
              duration_seconds as "durationSeconds", completed_at as "completedAt", 
              calories_burned as "caloriesBurned", rounds_completed as "roundsCompleted",
              total_rounds as "totalRounds", work_seconds as "workSeconds",
              rest_seconds as "restSeconds", prep_seconds as "prepSeconds",
              exercises_per_set as "exercisesPerSet", set_rest_seconds as "setRestSeconds",
              total_sets as "totalSets"
       FROM workout_history 
       WHERE user_id = ? 
       ORDER BY completed_at DESC`,
      [req.user.id],
      `SELECT id, preset_name as "presetName", preset_category as "presetCategory", 
              duration_seconds as "durationSeconds", completed_at as "completedAt", 
              calories_burned as "caloriesBurned", rounds_completed as "roundsCompleted",
              total_rounds as "totalRounds", work_seconds as "workSeconds",
              rest_seconds as "restSeconds", prep_seconds as "prepSeconds",
              exercises_per_set as "exercisesPerSet", set_rest_seconds as "setRestSeconds",
              total_sets as "totalSets"
       FROM workout_history 
       WHERE user_id = $1 
       ORDER BY completed_at DESC`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar histórico:', err);
    return res.status(500).json({ error: 'Erro ao buscar histórico.' });
  }
});

app.post('/api/history', authenticateToken, async (req, res) => {
  try {
    const {
      id,
      presetName,
      presetCategory,
      durationSeconds,
      completedAt,
      caloriesBurned,
      roundsCompleted,
      totalRounds,
      workSeconds,
      restSeconds,
      prepSeconds,
      exercisesPerSet,
      setRestSeconds,
      totalSets,
    } = req.body;
    const historyId = id || `hist_${Date.now()}`;

    await dbAdapter.execute(
      `INSERT INTO workout_history (
        id, user_id, preset_name, preset_category, duration_seconds, completed_at, 
        calories_burned, rounds_completed, total_rounds, work_seconds, rest_seconds,
        prep_seconds, exercises_per_set, set_rest_seconds, total_sets
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        req.user.id,
        presetName || 'Treino Pulse',
        presetCategory || 'CUSTOM',
        durationSeconds || 0,
        completedAt || new Date().toISOString(),
        caloriesBurned || 0,
        roundsCompleted || 4,
        totalRounds || 4,
        workSeconds || null,
        restSeconds || null,
        prepSeconds || null,
        exercisesPerSet || null,
        setRestSeconds || null,
        totalSets || null,
      ],
      `INSERT INTO workout_history (
        id, user_id, preset_name, preset_category, duration_seconds, completed_at, 
        calories_burned, rounds_completed, total_rounds, work_seconds, rest_seconds,
        prep_seconds, exercises_per_set, set_rest_seconds, total_sets
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        historyId,
        req.user.id,
        presetName || 'Treino Pulse',
        presetCategory || 'CUSTOM',
        durationSeconds || 0,
        completedAt || new Date().toISOString(),
        caloriesBurned || 0,
        roundsCompleted || 4,
        totalRounds || 4,
        workSeconds || null,
        restSeconds || null,
        prepSeconds || null,
        exercisesPerSet || null,
        setRestSeconds || null,
        totalSets || null,
      ]
    );

    return res.json({ success: true, id: historyId });
  } catch (err) {
    console.error('Erro ao salvar histórico:', err);
    return res.status(500).json({ error: 'Erro ao salvar histórico no banco.' });
  }
});

app.delete('/api/history/:id', authenticateToken, async (req, res) => {
  try {
    await dbAdapter.execute(
      'DELETE FROM workout_history WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id],
      'DELETE FROM workout_history WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao remover item do histórico.' });
  }
});

app.delete('/api/history', authenticateToken, async (req, res) => {
  try {
    await dbAdapter.execute(
      'DELETE FROM workout_history WHERE user_id = ?',
      [req.user.id],
      'DELETE FROM workout_history WHERE user_id = $1',
      [req.user.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao limpar histórico.' });
  }
});

// ================= CUSTOM PRESETS ROUTES =================

app.get('/api/presets', authenticateToken, async (req, res) => {
  try {
    const rows = await dbAdapter.queryAll(
      `SELECT id, name, category, work_seconds as "workSeconds", rest_seconds as "restSeconds", 
              sets, cycles, prep_seconds as "prepSeconds", set_rest_seconds as "setRestSeconds"
       FROM custom_presets 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [req.user.id],
      `SELECT id, name, category, work_seconds as "workSeconds", rest_seconds as "restSeconds", 
              sets, cycles, prep_seconds as "prepSeconds", set_rest_seconds as "setRestSeconds"
       FROM custom_presets 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar treinos personalizados:', err);
    return res.status(500).json({ error: 'Erro ao buscar treinos personalizados.' });
  }
});

app.post('/api/presets', authenticateToken, async (req, res) => {
  try {
    const { id, name, category, workSeconds, restSeconds, sets, cycles, prepSeconds, setRestSeconds } = req.body;
    const presetId = id || `preset_${Date.now()}`;

    await dbAdapter.execute(
      `INSERT INTO custom_presets (id, user_id, name, category, work_seconds, rest_seconds, sets, cycles, prep_seconds, set_rest_seconds)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [presetId, req.user.id, name || 'Treino Personalizado', category || 'CUSTOM', workSeconds || 20, restSeconds || 10, sets || 4, cycles || 1, prepSeconds || 10, setRestSeconds || 60],
      `INSERT INTO custom_presets (id, user_id, name, category, work_seconds, rest_seconds, sets, cycles, prep_seconds, set_rest_seconds)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [presetId, req.user.id, name || 'Treino Personalizado', category || 'CUSTOM', workSeconds || 20, restSeconds || 10, sets || 4, cycles || 1, prepSeconds || 10, setRestSeconds || 60]
    );

    return res.json({ success: true, id: presetId });
  } catch (err) {
    console.error('Erro ao salvar treino personalizado:', err);
    return res.status(500).json({ error: 'Erro ao salvar treino personalizado.' });
  }
});

app.delete('/api/presets/:id', authenticateToken, async (req, res) => {
  try {
    await dbAdapter.execute(
      'DELETE FROM custom_presets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id],
      'DELETE FROM custom_presets WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao excluir treino personalizado.' });
  }
});

// ================= USER SETTINGS ROUTES =================

app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const row = await dbAdapter.queryOne(
      `SELECT sound_enabled as "soundEnabled", volume, theme_mode as "themeMode", 
              weekly_goal as "weeklyGoal", glassmorphism_enabled as "glassmorphismEnabled"
       FROM user_settings 
       WHERE user_id = ?`,
      [req.user.id],
      `SELECT sound_enabled as "soundEnabled", volume, theme_mode as "themeMode", 
              weekly_goal as "weeklyGoal", glassmorphism_enabled as "glassmorphismEnabled"
       FROM user_settings 
       WHERE user_id = $1`,
      [req.user.id]
    );
    if (!row) return res.json(null);
    return res.json({
      soundEnabled: Boolean(row.soundEnabled),
      volume: Number(row.volume),
      themeMode: row.themeMode || 'dark',
      weeklyGoal: Number(row.weeklyGoal) || 5,
      glassmorphismEnabled: Boolean(row.glassmorphismEnabled),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao carregar configurações.' });
  }
});

app.put('/api/settings', authenticateToken, async (req, res) => {
  try {
    const { soundEnabled, volume, themeMode, weeklyGoal, glassmorphismEnabled } = req.body;
    await dbAdapter.execute(
      `UPDATE user_settings 
       SET sound_enabled = COALESCE(?, sound_enabled),
           volume = COALESCE(?, volume),
           theme_mode = COALESCE(?, theme_mode),
           weekly_goal = COALESCE(?, weekly_goal),
           glassmorphism_enabled = COALESCE(?, glassmorphism_enabled)
       WHERE user_id = ?`,
      [
        soundEnabled !== undefined ? (soundEnabled ? 1 : 0) : null,
        volume !== undefined ? volume : null,
        themeMode || null,
        weeklyGoal || null,
        glassmorphismEnabled !== undefined ? (glassmorphismEnabled ? 1 : 0) : null,
        req.user.id,
      ],
      `UPDATE user_settings 
       SET sound_enabled = COALESCE($1, sound_enabled),
           volume = COALESCE($2, volume),
           theme_mode = COALESCE($3, theme_mode),
           weekly_goal = COALESCE($4, weekly_goal),
           glassmorphism_enabled = COALESCE($5, glassmorphism_enabled)
       WHERE user_id = $6`,
      [
        soundEnabled !== undefined ? (soundEnabled ? 1 : 0) : null,
        volume !== undefined ? volume : null,
        themeMode || null,
        weeklyGoal || null,
        glassmorphismEnabled !== undefined ? (glassmorphismEnabled ? 1 : 0) : null,
        req.user.id,
      ]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao salvar configurações.' });
  }
});

// Health check endpoint for Easypanel
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: dbAdapter.isPg ? 'PostgreSQL' : 'SQLite', timestamp: new Date().toISOString() });
});

// Serve frontend static build files in production
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Pulse & Precision rodando na porta ${PORT}`);
});
