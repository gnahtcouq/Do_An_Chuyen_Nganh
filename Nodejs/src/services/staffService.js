import db from '../models/index'

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
        !inputData.contentMarkdown
      ) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter'
        })
      } else {
        await db.Markdown.create({
          contentHTML: inputData.contentHTML,
          contentMarkdown: inputData.contentMarkdown,
          description: inputData.description,
          staffId: inputData.staffId
        })

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
            exclude: ['password', 'image']
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

module.exports = {
  getTopStaffHome: getTopStaffHome,
  getAllStaff: getAllStaff,
  saveDetailInfoStaff: saveDetailInfoStaff,
  getDetailStaffById: getDetailStaffById
}
