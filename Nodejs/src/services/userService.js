import db from '../models/index'
import bcrypt from 'bcryptjs'

const salt = bcrypt.genSaltSync(10)

let hashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      var hashPassword = await bcrypt.hashSync(password, salt)
      resolve(hashPassword)
    } catch (error) {
      reject(error)
    }
  })
}

let handleUserLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!email || !password) {
        resolve({
          errCode: 1,
          errMessage: 'Missing input parameter'
        })
      } else {
        let userData = {}
        let isExist = await checkUserEmail(email)
        if (isExist) {
          // User already exist
          let user = await db.User.findOne({
            attributes: [
              'email',
              'roleId',
              'password',
              'firstName',
              'lastName'
            ],
            where: {email: email},
            raw: true
          })
          if (user) {
            let check = await bcrypt.compareSync(password, user.password)
            if (check) {
              userData.errCode = 0
              userData.errMessage = 'Ok'
              delete user.password
              userData.user = user
            } else {
              userData.errCode = 2
              userData.errMessage = 'Wrong password'
            }
          } else {
            userData.errCode = 3
            userData.errMessage = `The user isn't exist`
          }
        } else {
          // Return error
          userData.errCode = 4
          userData.errMessage = `Your's email isn't exist in your system. Please try other email!`
        }
        resolve(userData)
      }
    } catch (error) {
      reject(error)
    }
  })
}

let checkUserEmail = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: {email: userEmail}
      })
      if (user) {
        resolve(true)
      } else {
        resolve(false)
      }
    } catch (error) {
      reject(error)
    }
  })
}

let getAllUsers = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = ''
      if (userId === 'ALL') {
        users = await db.User.findAll({
          attributes: {
            exclude: ['password']
          }
        })
      }
      if (userId && userId !== 'ALL') {
        users = await db.User.findOne({
          where: {id: userId},
          attributes: {
            exclude: ['password']
          }
        })
      }
      resolve(users)
    } catch (error) {
      reject(error)
    }
  })
}

let createNewUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check email is exist or not
      let check = await checkUserEmail(data.email)
      if (check === true) {
        resolve({
          errCode: 1,
          errMessage:
            'Your email is already exist in your system. Please try other email!'
        })
      } else {
        let hashPasswordFromBcrypt = await hashUserPassword(data.password)
        await db.User.create({
          email: data.email,
          password: hashPasswordFromBcrypt,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          phonenumber: data.phonenumber,
          gender: data.gender,
          roleId: data.roleId
        })

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

let deleteUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    let foundUser = await db.User.findOne({
      where: {id: userId},
      raw: false
    })
    if (!foundUser) {
      resolve({
        errCode: 2,
        errMessage: `The user isn't exist`
      })
    }

    await db.User.destroy({
      where: {id: userId}
    })

    resolve({
      errCode: 0,
      message: 'The user is deleted'
    })
  })
}

let updateUserData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id || !data.roleId || !data.gender) {
        resolve({
          errCode: 2,
          errMessage: 'Missing required parameter'
        })
      }
      let user = await db.User.findOne({
        where: {id: data.id},
        raw: false
      })
      if (user) {
        user.firstName = data.firstName
        user.lastName = data.lastName
        user.address = data.address
        user.phonenumber = data.phonenumber
        user.gender = data.gender
        user.roleId = data.roleId

        await user.save()
        // await db.User.save({
        //   firstName: data.firstName,
        //   lastName: data.lastName,
        //   address: data.address
        // })

        resolve({
          errCode: 0,
          message: 'The user is updated successfully'
        })
      } else
        resolve({
          errCode: 1,
          errMessage: `The user isn't exist`
        })
    } catch {
      reject(error)
    }
  })
}

let getAllCodeService = (typeInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!typeInput) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter'
        })
      } else {
        let res = {}
        let allcode = await db.Allcode.findAll({
          where: {type: typeInput}
        })
        res.errCode = 0
        res.data = allcode
        resolve(res)
      }
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  handleUserLogin: handleUserLogin,
  getAllUsers: getAllUsers,
  createNewUser: createNewUser,
  deleteUser: deleteUser,
  updateUserData: updateUserData,
  getAllCodeService: getAllCodeService
}
