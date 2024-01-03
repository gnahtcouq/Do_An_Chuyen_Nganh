import db from '../models/index'
require('dotenv').config()
import emailService from './emailService'
import {v4 as uuidv4} from 'uuid'

let buildUrlEmail = (staffId, token) => {
  let result = `${process.env.URL_REACT}/verify-booking?token=${token}&staffId=${staffId}`
  return result
}

let postBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.staffId ||
        !data.timeType ||
        !data.date ||
        !data.fullName ||
        !data.selectedGender ||
        !data.address
      ) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter!'
        })
      } else {
        let token = uuidv4()

        await emailService.sendEmail({
          receiverEmail: data.email,
          customerName: data.fullName,
          time: data.timeString,
          staffName: data.staffName,
          language: data.language,
          redirectLink: buildUrlEmail(data.staffId, token)
        })

        let user = await db.User.findOrCreate({
          where: {email: data.email},
          defaults: {
            email: data.email,
            roleId: 'R3',
            gender: data.selectedGender,
            address: data.address,
            firstName: data.fullName
          }
        })

        // console.log('user', user[0])

        if (user && user[0]) {
          await db.Booking.findOrCreate({
            where: {customerId: user[0].id},
            defaults: {
              statusId: 'S1',
              staffId: data.staffId,
              customerId: user[0].id,
              date: data.date,
              timeType: data.timeType,
              token: token
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

let postVerifyBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.staffId || !data.token) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter!'
        })
      } else {
        let booking = await db.Booking.findOne({
          where: {staffId: data.staffId, token: data.token, statusId: 'S1'},
          raw: false
        })

        if (booking) {
          await db.Booking.update(
            {statusId: 'S2'},
            {
              where: {staffId: data.staffId, token: data.token}
            }
          )
          resolve({
            errCode: 0,
            message: 'Update the booking successfully!'
          })
        } else {
          resolve({
            errCode: 2,
            errMessage: 'The booking request is not found!'
          })
        }
      }
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  postBookAppointment: postBookAppointment,
  postVerifyBookAppointment: postVerifyBookAppointment
}
