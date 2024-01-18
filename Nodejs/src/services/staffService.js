import db from '../models/index'
import _ from 'lodash'
require('dotenv').config()
import emailService from './emailService'

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE

let getTopStaffHome = (limitInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await db.User.findAll({
        limit: limitInput,
        where: {roleId: 'R2'},
        order: [['createdAt', 'DESC']],
        attributes: {
          exclude: ['password']
        },
        include: [
          {
            model: db.Allcode,
            as: 'genderData',
            attributes: ['valueEn', 'valueVi']
          }
        ],
        raw: true,
        nest: true
      })

      resolve({
        errCode: 0,
        data: users
      })
    } catch (error) {
      reject(error)
    }
  })
}

let getAllStaff = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let staffs = await db.User.findAll({
        where: {roleId: 'R2'},
        attributes: {
          exclude: ['password', 'image']
        }
      })

      resolve({
        errCode: 0,
        data: staffs
      })
    } catch (error) {
      reject(error)
    }
  })
}

let saveDetailInfoStaff = (inputData) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !inputData.staffId ||
        !inputData.contentHTML ||
        !inputData.contentMarkdown ||
        !inputData.action ||
        !inputData.selectedPrice ||
        !inputData.selectedPayment ||
        !inputData.note
      ) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter'
        })
      } else {
        // upsert to Markdown table
        if (inputData.action === 'CREATE') {
          await db.Markdown.create({
            contentHTML: inputData.contentHTML,
            contentMarkdown: inputData.contentMarkdown,
            description: inputData.description,
            staffId: inputData.staffId
          })
        } else if (inputData.action === 'EDIT') {
          let staffMarkdown = await db.Markdown.findOne({
            where: {staffId: inputData.staffId},
            raw: false
          })

          // upsert to staff_info table
          let staffInfo = await db.Staff_Info.findOne({
            where: {staffId: inputData.staffId},
            raw: false
          })

          if (staffInfo) {
            // update
            staffInfo.staffId = inputData.staffId
            staffInfo.priceId = inputData.selectedPrice
            staffInfo.paymentId = inputData.selectedPayment
            staffInfo.note = inputData.note
            await staffInfo.save()
          } else {
            // create
            await db.Staff_Info.create({
              staffId: inputData.staffId,
              priceId: inputData.selectedPrice,
              paymentId: inputData.selectedPayment,
              note: inputData.note
            })
          }

          if (staffMarkdown) {
            staffMarkdown.contentHTML = inputData.contentHTML
            staffMarkdown.contentMarkdown = inputData.contentMarkdown
            staffMarkdown.description = inputData.description
            await staffMarkdown.save()
          }
        }

        resolve({
          errCode: 0,
          message: 'Save detail info staff success'
        })
      }
    } catch (error) {
      reject(error)
    }
  })
}

let getDetailStaffById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter'
        })
      } else {
        let data = await db.User.findOne({
          where: {id: inputId},
          attributes: {
            exclude: ['password']
          },
          include: [
            {
              model: db.Markdown,
              attributes: ['description', 'contentHTML', 'contentMarkdown']
            },
            {
              model: db.Staff_Info,
              attributes: {
                exclude: ['id', 'staffId']
              },
              include: [
                {
                  model: db.Allcode,
                  as: 'priceTypeData',
                  attributes: ['valueEn', 'valueVi']
                },
                {
                  model: db.Allcode,
                  as: 'paymentTypeData',
                  attributes: ['valueEn', 'valueVi']
                }
              ]
            }
          ],
          raw: false,
          nest: true
        })

        if (data && data.image) {
          data.image = new Buffer(data.image, 'base64').toString('binary')
        }

        if (!data) data = {}

        resolve({
          errCode: 0,
          data: data
        })
      }
    } catch (error) {
      reject(error)
    }
  })
}

let bulkCreateSchedule = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.arrSchedule || !data.staffId || !data.formattedDate) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter'
        })
      } else {
        let schedule = data.arrSchedule
        if (schedule && schedule.length > 0) {
          schedule.map((item) => {
            item.maxNumber = MAX_NUMBER_SCHEDULE
            return item
          })
        }

        // console.log('check schedule', schedule)

        // get all existing schedule
        let existingSchedule = await db.Schedule.findAll({
          where: {staffId: data.staffId, date: data.formattedDate},
          attributes: ['timeType', 'date', 'staffId', 'maxNumber'],
          raw: true
        })

        // // convert date to number
        // if (existingSchedule && existingSchedule.length > 0) {
        //   existingSchedule.map((item) => {
        //     item.date = new Date(item.date).getTime()
        //     return item
        //   })
        // }

        // compare difference
        let toCreate = _.differenceWith(schedule, existingSchedule, (a, b) => {
          return a.timeType === b.timeType && +a.date === +b.date
        })

        // create new schedule
        if (toCreate && toCreate.length > 0) {
          await db.Schedule.bulkCreate(toCreate)
        }

        // console.log('check difference', toCreate)

        resolve({
          errCode: 0,
          message: 'OK'
        })
      }
    } catch (error) {
      reject(error)
    }
  })
}

let getScheduleByDate = (staffId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!staffId || !date) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter'
        })
      } else {
        let schedule = await db.Schedule.findAll({
          where: {staffId: staffId, date: date},
          attributes: ['timeType', 'date', 'staffId', 'maxNumber'],
          include: [
            {
              model: db.Allcode,
              as: 'timeTypeData',
              attributes: ['valueEn', 'valueVi']
            },
            {
              model: db.User,
              as: 'staffData',
              attributes: ['firstName', 'lastName']
            }
          ],
          raw: true,
          nest: true
        })

        if (!schedule) schedule = []

        resolve({
          errCode: 0,
          data: schedule
        })
      }
    } catch (error) {
      reject(error)
    }
  })
}

let getExtraInfoStaffById = (idInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!idInput) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter'
        })
      } else {
        let data = await db.Staff_Info.findOne({
          where: {staffId: idInput},
          attributes: {
            exclude: ['id', 'staffId']
          },
          include: [
            {
              model: db.Allcode,
              as: 'priceTypeData',
              attributes: ['valueEn', 'valueVi']
            },
            {
              model: db.Allcode,
              as: 'paymentTypeData',
              attributes: ['valueEn', 'valueVi']
            }
          ],
          raw: false,
          nest: true
        })

        if (!data) data = {}

        resolve({
          errCode: 0,
          data: data
        })
      }
    } catch (error) {
      reject(error)
    }
  })
}

let getProfileStaffById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter'
        })
      } else {
        let data = await db.User.findOne({
          where: {id: inputId},
          attributes: {
            exclude: ['password']
          },
          include: [
            {
              model: db.Markdown,
              attributes: ['description', 'contentHTML', 'contentMarkdown']
            },
            {
              model: db.Staff_Info,
              attributes: {
                exclude: ['id', 'staffId']
              },
              include: [
                {
                  model: db.Allcode,
                  as: 'priceTypeData',
                  attributes: ['valueEn', 'valueVi']
                },
                {
                  model: db.Allcode,
                  as: 'paymentTypeData',
                  attributes: ['valueEn', 'valueVi']
                }
              ]
            }
          ],
          raw: false,
          nest: true
        })

        if (data && data.image) {
          data.image = new Buffer(data.image, 'base64').toString('binary')
        }

        if (!data) data = {}

        resolve({
          errCode: 0,
          data: data
        })
      }
    } catch (error) {
      reject(error)
    }
  })
}

let getListCustomerForStaff = (staffId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!staffId || !date) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter'
        })
      } else {
        let data = await db.Booking.findAll({
          where: {
            statusId: 'S2',
            staffId: staffId,
            date: date
          },
          include: [
            {
              model: db.User,
              as: 'customerData',
              attributes: ['email', 'firstName', 'address', 'gender'],
              include: [
                {
                  model: db.Allcode,
                  as: 'genderData',
                  attributes: ['valueEn', 'valueVi']
                }
              ]
            },
            {
              model: db.Allcode,
              as: 'timeTypeDataCustomer',
              attributes: ['valueEn', 'valueVi']
            }
          ],
          raw: false,
          nest: true
        })

        resolve({
          errCode: 0,
          data: data
        })
      }
    } catch (error) {
      reject(error)
    }
  })
}

let sendRemedy = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.staffId ||
        !data.customerId ||
        !data.timeType ||
        !data.imgBase64
      ) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter'
        })
      } else {
        // update customer status
        let appointment = await db.Booking.findOne({
          where: {
            staffId: data.staffId,
            customerId: data.customerId,
            timeType: data.timeType,
            statusId: 'S2'
          },
          raw: false
        })

        if (appointment) {
          appointment.statusId = 'S3'
          await appointment.save()
        }

        // send email remedy
        await emailService.sendAttachmentEmail(data)

        resolve({
          errCode: 0,
          errMessage: 'OK'
        })
      }
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  getTopStaffHome: getTopStaffHome,
  getAllStaff: getAllStaff,
  saveDetailInfoStaff: saveDetailInfoStaff,
  getDetailStaffById: getDetailStaffById,
  bulkCreateSchedule: bulkCreateSchedule,
  getScheduleByDate: getScheduleByDate,
  getExtraInfoStaffById: getExtraInfoStaffById,
  getProfileStaffById: getProfileStaffById,
  getListCustomerForStaff: getListCustomerForStaff,
  sendRemedy: sendRemedy
}
