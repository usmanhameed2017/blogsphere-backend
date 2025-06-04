const nodemailer = require("nodemailer");
const { gmail, gmailAppPassword } = require("../constants");

// Configure transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmail,
        pass: gmailAppPassword
    }
});

// Send email
const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: gmail,
        to:to,
        subject:subject,
        html:text
    }

    try 
    {
        const result = await transporter.sendMail(mailOptions);
        return result;
    } 
    catch(error) 
    {
        console.log(error.message);
        return null;
    }
}

module.exports = sendEmail;