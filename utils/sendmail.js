'use strict';
import nodemailer from 'nodemailer';

// async..await is not allowed in global scope, must use a wrapper
async function sendMail(otp, email) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        // secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Crickit" <crickit@gmail.com>', // sender address
        to: `${email}`, // list of receivers
        subject: 'Email Verification', // Subject line
        html: `<html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Verification</title>
            <style>
                /* Reset some default styles */
                body, html {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    background-color: #f5f5f5;
                }
        
                /* Email container */
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
        
                /* Header styles */
                .header {
                    text-align: center;
                    padding: 20px 0;
                }
        
                /* OTP code styles */
                .otp-code {
                    background-color: #6366F1;
                    color: #ffffff;
                    font-size: 24px;
                    padding: 10px 20px;
                    border-radius: 5px;
                    margin: 20px auto;
                    text-align: center;
                }
        
                /* Instructions */
                .instructions {
                    text-align: center;
                    font-size: 16px;
                }
              
               
                /* Button styles */
                .btn {
                    display: inline-block;
                    background-color: #007bff;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 10px 20px;
                    margin: 20px auto;
                    border-radius: 5px;
                }
        
                /* Footer styles */
                .footer {
                    text-align: center;
                    font-size: 12px;
                    color: #888;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>OTP Verification</h1>
                </div>
                <div class="otp-code">
                    Your OTP Code: <strong>${otp}</strong>
                </div>
                <div class="instructions">
                    Please use the OTP code above to verify your email address.
                </div>
                <div class="footer">
                    This email was sent to you as part of our verification process. If you didn't request this OTP, please ignore this email.
                </div>
            </div>
        </body>
        </html>`, // html body
    });

    // console.log('Message sent: %s', info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

export default sendMail;
