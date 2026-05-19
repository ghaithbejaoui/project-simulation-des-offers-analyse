const db = require('../config/database');

class OfferOptionModel {
  static async findAll() {
    const [rows] = await db.query(`
      SELECT oo.*, o.name as offer_name, opt.name as option_name
      FROM offer_options oo
      JOIN offers o ON oo.offer_id = o.offer_id
      JOIN options opt ON oo.option_id = opt.option_id
    `);
    return rows;
  }

  static async findByOfferId(offerId) {
    const [rows] = await db.query(`
      SELECT opt.* FROM options opt
      JOIN offer_options oo ON opt.option_id = oo.option_id
      WHERE oo.offer_id = ?
    `, [offerId]);
    return rows;
  }

  static async findByOptionId(optionId) {
    const [rows] = await db.query(`
      SELECT o.* FROM offers o
      JOIN offer_options oo ON o.offer_id = oo.offer_id
      WHERE oo.option_id = ?
    `, [optionId]);
    return rows;
  }

  static async create(offerId, optionId) {
    const [result] = await db.query(
      'INSERT INTO offer_options (offer_id, option_id) VALUES (?, ?)',
      [offerId, optionId]
    );
    return result.insertId;
  }

  static async delete(offerId, optionId) {
    const [result] = await db.query(
      'DELETE FROM offer_options WHERE offer_id = ? AND option_id = ?',
      [offerId, optionId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = OfferOptionModel;