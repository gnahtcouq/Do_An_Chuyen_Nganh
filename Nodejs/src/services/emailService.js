require('dotenv').config()
import nodemailer from 'nodemailer'

let sendEmail = async (dataSend) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  })

  // async..await is not allowed in global scope, must use a wrapper
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Pet Cưng" <comehere.thang@gmail.com>', // sender address
    to: dataSend.receiverEmail, // list of receivers
    subject: 'Thông tin đặt lịch tại Pet Cưng', // Subject line
    html: getBodyHTMLEmail(dataSend) // html body
  })
}

let getBodyHTMLEmail = (dataSend) => {
  let result = ''
  if (dataSend.language === 'vi') {
    result = `
        <p>Xin chào, ${dataSend.customerName}!</p>
        <p>Bạn đã đặt lịch tại Pet Cưng thành công</p>
        <p>Thông tin lịch hẹn:</p>
        <p><b>- Thời gian: ${dataSend.time}</b></p>
        <p><b>- Nhân viên: ${dataSend.staffName}</b></p>
        <p>Hãy nhấp <a href=${dataSend.redirectLink} target="_blank">vào đây</a> để xác nhận và hoàn tất thủ tục đặt lịch.</p>
        <p>Cảm ơn bạn đã sử dụng dịch vụ của Pet Cưng!</p>
        <i>Quý khách vui lòng không phản hồi về địa chỉ email này vì chúng tôi sẽ không nhận được. Để gửi phản hồi quý khách vui lòng gửi vào email contact@petcung.tech. Pet Cưng chỉ tiếp nhận và xử lí các yêu cầu từ cuộc gọi và email của quý khách trong giờ làm việc.
        Xin cảm ơn quý khách!</i>
        `
  }

  if (dataSend.language === 'en') {
    result = `
        <p>Hi, ${dataSend.customerName}!</p>
        <p>You have successfully booked an appointment at Pet Cưng</p>
        <p>Appointment details:</p>
        <p><b>- Time: ${dataSend.time}</b></p>
        <p><b>- Staff: ${dataSend.staffName}</b></p>
        <p>Please click <a href=${dataSend.redirectLink} target="_blank">here</a> to confirm and complete the booking process.</p>
        <p>Thank you for using Pet Cưng's services!</p>
        <i>Dear customer, please do not reply to this email address as we will not receive it. To provide feedback, please send an email to contact@petcung.tech. Pet Cưng only accepts and processes requests from your calls and emails during working hours. Thank you!</i>
    
        `
  }

  return result
}

module.exports = {
  sendEmail: sendEmail
}
