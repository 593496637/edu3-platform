import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'edu3_db',
      user: process.env.DB_USER || 'edu3_user',
      password: process.env.DB_PASSWORD || 'edu3_password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async initialize() {
    try {
      // 读取并执行SQL schema
      const schemaPath = path.join(__dirname, '../../schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      await this.pool.query(schema);
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  async query(text: string, params?: any[]) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async close() {
    await this.pool.end();
  }

  // 用户相关查询
  async findUserByAddress(address: string) {
    const result = await this.query(
      'SELECT * FROM users WHERE address = $1',
      [address.toLowerCase()]
    );
    return result.rows[0];
  }

  async createUser(address: string, username?: string) {
    const result = await this.query(
      'INSERT INTO users (address, username) VALUES ($1, $2) RETURNING *',
      [address.toLowerCase(), username]
    );
    return result.rows[0];
  }

  async updateUserInstructorStatus(address: string, isInstructor: boolean) {
    const result = await this.query(
      'UPDATE users SET is_instructor = $1 WHERE address = $2 RETURNING *',
      [isInstructor, address.toLowerCase()]
    );
    return result.rows[0];
  }

  // 课程相关查询
  async getAllCourses() {
    const result = await this.query(
      'SELECT * FROM courses ORDER BY created_at DESC'
    );
    return result.rows;
  }

  async getCourseByChainId(chainId: number) {
    const result = await this.query(
      'SELECT * FROM courses WHERE chain_id = $1',
      [chainId]
    );
    return result.rows[0];
  }

  async createCourse(chainId: number, title: string, description: string, price: string, instructorAddress: string) {
    const result = await this.query(
      'INSERT INTO courses (chain_id, title, description, price, instructor_address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [chainId, title, description, price, instructorAddress.toLowerCase()]
    );
    return result.rows[0];
  }

  // 购买记录相关查询
  async createPurchase(userAddress: string, courseChainId: number, txHash: string, blockNumber: number, price: string) {
    const result = await this.query(
      'INSERT INTO purchases (user_address, course_chain_id, tx_hash, block_number, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userAddress.toLowerCase(), courseChainId, txHash, blockNumber, price]
    );
    return result.rows[0];
  }

  async getPurchaseByTxHash(txHash: string) {
    const result = await this.query(
      'SELECT * FROM purchases WHERE tx_hash = $1',
      [txHash]
    );
    return result.rows[0];
  }

  async getUserPurchases(userAddress: string) {
    const result = await this.query(`
      SELECT p.*, c.title, c.description, c.instructor_address
      FROM purchases p
      JOIN courses c ON p.course_chain_id = c.chain_id
      WHERE p.user_address = $1
      ORDER BY p.purchased_at DESC
    `, [userAddress.toLowerCase()]);
    return result.rows;
  }

  async hasPurchased(userAddress: string, courseChainId: number) {
    const result = await this.query(
      'SELECT id FROM purchases WHERE user_address = $1 AND course_chain_id = $2',
      [userAddress.toLowerCase(), courseChainId]
    );
    return result.rows.length > 0;
  }
}

export const db = new Database();
