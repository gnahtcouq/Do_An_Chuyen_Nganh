import db from '../models/index'
require('dotenv').config()

let postBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email || !data.staffId || !data.timeType || !data.date) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter!'
        })
      } else {
        let user = await db.User.findOrCreate({
          where: {email: data.email},
          defaults: {
            email: data.email,
            roleId: 'R3'
          }
        })

        console.log('user', user[0])

        if (user && user[0]) {
          await db.Booking.findOrCreate({
            where: {customerId: user[0].id},
            defaults: {
              statusId: 'S1',
              staffId: data.staffId,
              customerId: user[0].id,
              date: data.date,
              timeType: data.timeType
            }
          })
        }

        resolve({
          errCode: 0,
          message: 'Save the booking successfully!'
        })
      }
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  postBookAppointment: postBookAppointment
}
