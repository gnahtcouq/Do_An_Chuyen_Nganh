import db from '../models/index'
import _ from 'lodash'
require('dotenv').config()

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
        !inputData.action
      ) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter'
        })
      } else {
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
      if (!data.arrSchedule || !data.staffId || !data.formatedDate) {
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
          where: {staffId: data.staffId, date: data.formatedDate},
          attributes: ['timeType', 'date', 'staffId', 'maxNumber'],
          raw: true
        })

        // convert date to number
        if (existingSchedule && existingSchedule.length > 0) {
          existingSchedule.map((item) => {
            item.date = new Date(item.date).getTime()
            return item
          })
        }

        // compare difference
        let toCreate = _.differenceWith(schedule, existingSchedule, (a, b) => {
          return a.timeType === b.timeType && a.date === b.date
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
          attributes: ['timeType', 'date', 'staffId', 'maxNumber']
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

module.exports = {
  getTopStaffHome: getTopStaffHome,
  getAllStaff: getAllStaff,
  saveDetailInfoStaff: saveDetailInfoStaff,
  getDetailStaffById: getDetailStaffById,
  bulkCreateSchedule: bulkCreateSchedule,
  getScheduleByDate: getScheduleByDate
}
