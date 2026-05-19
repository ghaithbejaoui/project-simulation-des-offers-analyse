const db = require('../config/database');

class CustomerProfileModel {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM customer_profiles');
    return rows.map(p => this._addSegment(p));
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM customer_profiles WHERE profile_id = ? OR id = ?', [id, id]);
    if (rows.length === 0) return null;
    return this._addSegment(rows[0]);
  }

  static async create(data) {
    const {
      label, minutes_avg = 0, sms_avg = 0, data_avg_gb = 0,
      night_usage_pct = 0, roaming_days = 0, budget_max = 0, priority = 'BALANCED'
    } = data;

    const [result] = await db.query(
      `INSERT INTO customer_profiles (label, minutes_avg, sms_avg, data_avg_gb, night_usage_pct, roaming_days, budget_max, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [label, minutes_avg, sms_avg, data_avg_gb, night_usage_pct, roaming_days, budget_max, priority]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const { label, minutes_avg, sms_avg, data_avg_gb, night_usage_pct, roaming_days, budget_max, priority } = data;

    const [result] = await db.query(
      `UPDATE customer_profiles SET label=?, minutes_avg=?, sms_avg=?, data_avg_gb=?, night_usage_pct=?, roaming_days=?, budget_max=?, priority=? WHERE profile_id=? OR id=?`,
      [label, minutes_avg, sms_avg, data_avg_gb, night_usage_pct, roaming_days, budget_max, priority, id, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM customer_profiles WHERE profile_id = ? OR id = ?', [id, id]);
    return result.affectedRows > 0;
  }

  static _addSegment(profile) {
    let segment = 'POSTPAID';
    if (profile.data_avg_gb > 40 && profile.minutes_avg === 0 && profile.sms_avg === 0) {
      segment = 'DATA_ONLY';
    } else if (profile.budget_max <= 30) {
      segment = 'PREPAID';
    } else if (profile.budget_max >= 100 && (profile.minutes_avg > 500 || profile.data_avg_gb > 30)) {
      segment = 'BUSINESS';
    }
    return { ...profile, segment };
  }
}

module.exports = CustomerProfileModel;