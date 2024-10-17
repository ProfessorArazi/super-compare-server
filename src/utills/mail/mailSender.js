const nodemailer = require("nodemailer");
const fs = require("fs");
const handleBars = require("handlebars");
const path = require("path");

const mailSender = async (email, name, link) => {
    let subject = "Super Compare";
    const mail = process.env.MAIL;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        auth: {
            user: mail,
            pass: process.env.PASS,
        },
    });

    const templateHtml = fs.readFileSync(
        path.join(__dirname, "mail.html"),
        "utf-8"
    );
    const template = handleBars.compile(templateHtml);

    const emailData = {
        name,
        link,
    };

    const htmlToSend = template(emailData);

    const mailOptions = {
        from: mail,
        to: email,
        subject,
        html: htmlToSend,
    };
    await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                reject(error);
            } else resolve("email sent");
        });
    });
};

module.exports = mailSender;
