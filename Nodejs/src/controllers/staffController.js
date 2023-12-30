import staffService from '../services/staffService'
let getTopStaffHome = async (req, res) => {
  let limit = req.query.limit
  if (!limit) limit = 10
  try {
    let response = await staffService.getTopStaffHome(+limit)
    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
    return res.status(200).json({
      errCode: -1,
      message: 'Error from server'
    })
  }
}

let getAllStaff = async (req, res) => {
  try {
    let staffs = await staffService.getAllStaff()
    return res.status(200).json(staffs)
  } catch (error) {
    console.log(error)
    return res.status(200).json({
      errCode: -1,
      message: 'Error from server'
    })
  }
}

let postInfoStaff = async (req, res) => {
  try {
    let data = req.body
    let response = await staffService.saveDetailInfoStaff(data)
    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
    return res.status(200).json({
      errCode: -1,
      message: 'Error from server'
    })
  }
}

let getDetailStaffById = async (req, res) => {
  try {
    let info = await staffService.getDetailStaffById(req.query.id)
    return res.status(200).json(info)
  } catch (error) {
    console.log(error)
    return res.status(200).json({
      errCode: -1,
      message: 'Error from server'
    })
  }
}

let bulkCreateSchedule = async (req, res) => {
  try {
    let message = await staffService.bulkCreateSchedule(req.body)
    return res.status(200).json(message)
  } catch (error) {
    console.log(error)
    return res.status(200).json({
      errCode: -1,
      message: 'Error from server'
    })
  }
}

let getScheduleByDate = async (req, res) => {
  try {
    let schedule = await staffService.getScheduleByDate(
      req.query.staffId,
      req.query.date
    )
    return res.status(200).json(schedule)
  } catch (error) {
    console.log(error)
    return res.status(200).json({
      errCode: -1,
      message: 'Error from server'
    })
  }
}

module.exports = {
  getTopStaffHome: getTopStaffHome,
  getAllStaff: getAllStaff,
  postInfoStaff: postInfoStaff,
  getDetailStaffById: getDetailStaffById,
  bulkCreateSchedule: bulkCreateSchedule,
  getScheduleByDate: getScheduleByDate
}
