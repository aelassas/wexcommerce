import nodemailer from 'nodemailer';
import * as env from "../config/env.config.js";
/**
 * Send an email.
 *
 * @export
 * @param {nodemailer.SendMailOptions} mailOptions
 * @returns {Promise<unknown>}
 */
export const sendMail = mailOptions => {
  const transporterOptions = {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  };
  const transporter = nodemailer.createTransport(transporterOptions);
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
};