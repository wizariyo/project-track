require('dotenv').config();
const path = require('path');

let db;

if (process.env.DATABASE_URL) {
  // Use Supabase PostgreSQL
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  // Helper to convert SQLite ? to PostgreSQL $1, $2, etc.
  function convertSql(sql) {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
  }

  const KEY_MAP = {
    projectrole: 'projectRole',
    groupid: 'groupId',
    avatarcolor: 'avatarColor',
    projectname: 'projectName',
    teacherid: 'teacherId',
    assigneeid: 'assigneeId',
    duedate: 'dueDate',
    createdat: 'createdAt',
    updatedat: 'updatedAt',
    completedat: 'completedAt',
    studentid: 'studentId',
    workdone: 'workDone',
    nextplan: 'nextPlan',
    feedbacktext: 'feedbackText',
    feedbackteacherid: 'feedbackTeacherId',
    feedbackdate: 'feedbackDate',
    taskid: 'taskId',
    username: 'userName',
    filetype: 'fileType',
    filename: 'fileName',
    filepath: 'filePath',
    uploadedby: 'uploadedBy',
    uploadedat: 'uploadedAt'
  };

  function normalizeRow(row) {
    if (!row) return row;
    const normalized = {};
    for (const [key, val] of Object.entries(row)) {
      const targetKey = KEY_MAP[key.toLowerCase()] || key;
      normalized[targetKey] = val;
    }
    return normalized;
  }

  db = {
    run(sql, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      const pgSql = convertSql(sql);
      pool.query(pgSql, params, (err, res) => {
        if (err) {
          console.error('PostgreSQL query error (run):', err.message, 'SQL:', pgSql);
          if (callback) callback(err);
          return;
        }
        const context = {
          changes: res.rowCount,
          lastID: null
        };
        if (callback) callback.call(context, null);
      });
    },
    get(sql, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      const pgSql = convertSql(sql);
      pool.query(pgSql, params, (err, res) => {
        if (err) {
          console.error('PostgreSQL query error (get):', err.message, 'SQL:', pgSql);
          if (callback) callback(err);
          return;
        }
        const row = res.rows && res.rows.length > 0 ? res.rows[0] : undefined;
        if (callback) callback(null, normalizeRow(row));
      });
    },
    all(sql, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      const pgSql = convertSql(sql);
      pool.query(pgSql, params, (err, res) => {
        if (err) {
          console.error('PostgreSQL query error (all):', err.message, 'SQL:', pgSql);
          if (callback) callback(err);
          return;
        }
        if (callback) callback(null, (res.rows || []).map(normalizeRow));
      });
    },
    serialize(callback) {
      callback();
    }
  };

  console.log('Connected to Supabase PostgreSQL database.');
  createTables(true);
} else {
  // Use local SQLite
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.resolve(__dirname, 'database.sqlite');
  const sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database', err.message);
    } else {
      console.log('Connected to the SQLite database.');
      sqliteDb.run('PRAGMA foreign_keys = ON');
      createTables(false);
    }
  });

  db = sqliteDb;
}

function createTables(isPostgres) {
  const textType = isPostgres ? 'VARCHAR(255)' : 'TEXT';
  const longTextType = isPostgres ? 'TEXT' : 'TEXT';
  const integerType = isPostgres ? 'INTEGER' : 'INTEGER';
  const bigintType = isPostgres ? 'BIGINT' : 'INTEGER';
  const realType = isPostgres ? 'DOUBLE PRECISION' : 'REAL';

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id ${textType} PRIMARY KEY,
      name ${textType} NOT NULL,
      email ${textType} UNIQUE NOT NULL,
      password ${textType} NOT NULL,
      role ${textType} NOT NULL,
      title ${textType},
      projectRole ${textType},
      groupId ${textType},
      avatarColor ${textType},
      photoUrl ${textType},
      subjects ${textType}
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS groups (
      id ${textType} PRIMARY KEY,
      name ${textType} NOT NULL,
      projectName ${textType} NOT NULL,
      teacherId ${textType} NOT NULL,
      progress ${integerType} DEFAULT 0,
      status ${textType} DEFAULT 'On Track',
      subject ${textType},
      groupLeadId ${textType},
      remarks ${longTextType},
      FOREIGN KEY(teacherId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(groupLeadId) REFERENCES users(id) ON DELETE SET NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS group_members (
      groupId ${textType} NOT NULL,
      userId ${textType} NOT NULL,
      isLead ${integerType} DEFAULT 0,
      PRIMARY KEY (groupId, userId),
      FOREIGN KEY(groupId) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS group_teachers (
      groupId ${textType} NOT NULL,
      teacherId ${textType} NOT NULL,
      PRIMARY KEY (groupId, teacherId),
      FOREIGN KEY(groupId) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY(teacherId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id ${textType} PRIMARY KEY,
      groupId ${textType} NOT NULL,
      title ${textType} NOT NULL,
      description ${longTextType},
      status ${textType} NOT NULL DEFAULT 'todo',
      assigneeId ${textType},
      dueDate ${textType},
      createdAt ${integerType},
      updatedAt ${integerType},
      timeSpent ${integerType} DEFAULT 0,
      FOREIGN KEY(groupId) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY(assigneeId) REFERENCES users(id) ON DELETE SET NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS reports (
      id ${textType} PRIMARY KEY,
      groupId ${textType} NOT NULL,
      studentId ${textType} NOT NULL,
      title ${textType} NOT NULL,
      workDone ${longTextType} NOT NULL,
      hours ${realType} NOT NULL DEFAULT 0,
      blockers ${longTextType},
      nextPlan ${longTextType} NOT NULL,
      date ${bigintType} NOT NULL,
      feedbackText ${longTextType},
      feedbackTeacherId ${textType},
      feedbackDate ${bigintType},
      FOREIGN KEY(groupId) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY(studentId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS task_comments (
      id ${textType} PRIMARY KEY,
      taskId ${textType} NOT NULL,
      userId ${textType} NOT NULL,
      text ${longTextType} NOT NULL,
      createdAt ${bigintType} NOT NULL,
      FOREIGN KEY(taskId) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS activities (
      id ${textType} PRIMARY KEY,
      groupId ${textType} NOT NULL,
      userId ${textType} NOT NULL,
      userName ${textType},
      action ${textType} NOT NULL,
      target ${textType} NOT NULL,
      timestamp ${bigintType} NOT NULL,
      FOREIGN KEY(groupId) REFERENCES groups(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS subtasks (
      id ${textType} PRIMARY KEY,
      taskId ${textType} NOT NULL,
      title ${textType} NOT NULL,
      completed ${integerType} DEFAULT 0,
      FOREIGN KEY(taskId) REFERENCES tasks(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS project_files (
      id ${textType} PRIMARY KEY,
      groupId ${textType} NOT NULL,
      uploadedBy ${textType} NOT NULL,
      fileType ${textType} NOT NULL,
      fileName ${textType} NOT NULL,
      filePath ${longTextType} NOT NULL,
      uploadedAt ${bigintType} NOT NULL,
      FOREIGN KEY(groupId) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY(uploadedBy) REFERENCES users(id) ON DELETE CASCADE
    )`);

    if (!isPostgres) {
      // Add missing columns to existing SQLite tables safely
      db.run(`ALTER TABLE tasks ADD COLUMN dueDate TEXT`, () => {});
      db.run(`ALTER TABLE tasks ADD COLUMN updatedAt INTEGER`, () => {});
      db.run(`ALTER TABLE activities ADD COLUMN userName TEXT`, () => {});
      db.run(`ALTER TABLE groups ADD COLUMN subject TEXT`, () => {});
      db.run(`ALTER TABLE groups ADD COLUMN groupLeadId TEXT`, () => {});
      db.run(`ALTER TABLE groups ADD COLUMN remarks TEXT`, () => {});
      db.run(`ALTER TABLE users ADD COLUMN photoUrl TEXT`, () => {});
      db.run(`ALTER TABLE users ADD COLUMN subjects TEXT`, () => {});
    } else {
      db.run(`ALTER TABLE groups ADD COLUMN IF NOT EXISTS subject TEXT`, () => {});
      db.run(`ALTER TABLE groups ADD COLUMN IF NOT EXISTS "groupLeadId" TEXT`, () => {});
      db.run(`ALTER TABLE groups ADD COLUMN IF NOT EXISTS remarks TEXT`, () => {});
      db.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "photoUrl" TEXT`, () => {});
      db.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subjects TEXT`, () => {});
    }

    // Seeding existing memberships from users table into group_members
    db.run(`
      INSERT OR IGNORE INTO group_members (groupId, userId, isLead)
      SELECT groupId, id, 0 FROM users WHERE groupId IS NOT NULL
    `, () => {
      // Pick first member of each group as the lead if no group lead exists
      db.run(`
        UPDATE group_members
        SET isLead = 1
        WHERE rowid IN (
          SELECT MIN(rowid) FROM group_members GROUP BY groupId
        ) AND NOT EXISTS (
          SELECT 1 FROM group_members gm2 WHERE gm2.groupId = group_members.groupId AND gm2.isLead = 1
        )
      `, () => {
        // Update groupLeadId in groups table for consistency
        db.run(`
          UPDATE groups
          SET groupLeadId = (
            SELECT userId FROM group_members WHERE group_members.groupId = groups.id AND group_members.isLead = 1 LIMIT 1
          )
          WHERE groupLeadId IS NULL
        `, () => {});
      });
    });

    // Indices for optimized querying
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_group ON users(groupId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_group ON tasks(groupId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assigneeId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_reports_group ON reports(groupId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_reports_student ON reports(studentId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_comments_task ON task_comments(taskId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_subtasks_task ON subtasks(taskId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_files_group ON project_files(groupId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_group_members ON group_members(groupId, userId)`);
  });
}

module.exports = db;
