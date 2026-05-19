const db = require('../config/database');

class OfferModel {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM offers');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM offers WHERE offer_id = ?', [id]);
    return rows[0] || null;
  }

  static async findByIdWithOptions(id) {
    const offer = await this.findById(id);
    if (!offer) return null;

    const [optionsRows] = await db.query(
      `SELECT o.* FROM options o JOIN offer_options oo ON o.option_id = oo.option_id WHERE oo.offer_id = ?`,
      [id]
    );
    offer.options = optionsRows;
    return offer;
  }

  static async create(data) {
    const {
      name, segment, monthly_price, quota_minutes = 0, quota_sms = 0,
      quota_data_gb = 0, validity_days = 30, fair_use_gb = 0,
      over_minute_price = 0.10, over_sms_price = 0.05, over_data_price = 0.50,
      roaming_included_days = 0, status = 'PUBLISHED'
    } = data;

    const [result] = await db.query(
      `INSERT INTO offers (
        name, segment, monthly_price, quota_minutes, quota_sms, quota_data_gb,
        validity_days, fair_use_gb, over_minute_price, over_sms_price,
        over_data_price, roaming_included_days, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, segment, monthly_price, quota_minutes, quota_sms, quota_data_gb,
       validity_days, fair_use_gb, over_minute_price, over_sms_price,
       over_data_price, roaming_included_days, status]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const {
      name, segment, monthly_price, quota_minutes, quota_sms, quota_data_gb,
      validity_days, fair_use_gb, over_minute_price, over_sms_price,
      over_data_price, roaming_included_days, status
    } = data;

    const [result] = await db.query(
      `UPDATE offers SET name=?, segment=?, monthly_price=?, quota_minutes=?, quota_sms=?,
       quota_data_gb=?, validity_days=?, fair_use_gb=?, over_minute_price=?, over_sms_price=?,
       over_data_price=?, roaming_included_days=?, status=? WHERE offer_id=?`,
      [name, segment, monthly_price, quota_minutes, quota_sms, quota_data_gb,
       validity_days, fair_use_gb, over_minute_price, over_sms_price,
       over_data_price, roaming_included_days, status, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM offers WHERE offer_id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async findPublished(segment = null) {
    let query = 'SELECT * FROM offers WHERE status = ?';
    let params = ['PUBLISHED'];
    if (segment) {
      query += ' AND segment = ?';
      params.push(segment);
    }
    const [rows] = await db.query(query, params);
    return rows;
  }
}

module.exports = OfferModel;