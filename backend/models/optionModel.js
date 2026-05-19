const db = require('../config/database');

class OptionModel {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM options');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM options WHERE option_id = ?', [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const { name, type, price, data_gb = 0, minutes = 0, sms = 0, validity_days = 30 } = data;
    const [result] = await db.query(
      `INSERT INTO options (name, type, price, data_gb, minutes, sms, validity_days) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, type, price, data_gb, minutes, sms, validity_days]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const { name, type, price, data_gb, minutes, sms, validity_days } = data;
    const [result] = await db.query(
      `UPDATE options SET name=?, type=?, price=?, data_gb=?, minutes=?, sms=?, validity_days=? WHERE option_id=?`,
      [name, type, price, data_gb, minutes, sms, validity_days, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM options WHERE option_id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = OptionModel;