var Patient = require('../models/patient')
var PatientHelper = require('../models/patient-helper')
var winston = require('winston')
var moment = require('moment')
var pad = require('pad')

var findPatients = (query) => {
  return new Promise((resolve, reject) => {
    Patient.find(query)
      .exec((err, sales) => {
        if (err) reject(err);

        resolve(sales);
      });
  });
}

var updatePatient = (patient) => {
  return new Promise((resolve, reject) => {
    Patient.findOneAndUpdate({
      _id: patient.id
    }, {
      name: patient.name,
      gender: patient.gender,
      age: patient.age,
      address: patient.address,
      phone: patient.phone,
      mobile: patient.mobile,
      activity: patient.activity,
      mail: patient.mail,
      marital_status: patient.marital_status,
      additional_info: patient.additional_info,
      available: true,
      timestamp: new Date()
    }, {
      upsert: true,
      new: true
    }, function(err, phys) {
      if (err) reject(err);
      return resolve(phys);
    });
  });
};

var patientSequential = async() => {
  return new Promise((resolve, reject) => {

    Patient.findOne({}, {}, {
      sort: {
        'timestamp': -1
      }
    }, function(err, current) {
      if (err) reject(err);

      resolve(current);
    });
  });
}

var i = {
  modifyPatient: async(req, res) => {
    try {
      var id = req.body._id;
      var name = req.body.name;
      var gender = req.body.gender;
      var age = req.body.age;
      var address = req.body.address;
      var phone = req.body.phone;
      var mobile = req.body.mobile;
      var activity = req.body.activity;
      var mail = req.body.mail;
      var marital_status = req.body.marital_status;
      var additional_info = req.body.additional_info;
      var available = true;
      var usr = req.body.usr;

      if (!PatientHelper.Gender[gender])
        throw {
          "message": "Gender not allowed"
        }

      if (!PatientHelper.MaritalStatus[marital_status])
        throw {
          "message": "Marital status  not allowed"
        }
      if (!address.i || !address.cp ||
        !address.loc || !address.state)
        throw {
          "message": "Additional address info needed"
        }

      if (Object.keys(additional_info).length > 0) {
        if (!additional_info.type_info)
          throw {
            "message": "Additional info needed"
          }
      }

      var data = {
        id: id,
        name: name,
        gender: gender,
        age: age,
        address: address,
        phone: phone,
        mobile: mobile,
        activity: activity,
        mail: mail,
        marital_status: marital_status,
        additional_info: additional_info,
        available: true
      }

      if (!data.id) {
        var curr = moment().format('YYYYMMDD')
        var seq = 1
        var prevClient = await patientSequential()
        var prevID = prevClient._id

        if (prevID)
          seq = parseInt(prevID.split("-")[1]) + 1

        var curr = moment().format('YYYYMMDD') + "-" +
          pad(2, seq + "", '0')

        data["id"] = curr
      }

      updatePatient(data)
        .then((r) => {
          res.json({
            ok: 1,
            data: r
          })
        })
        .catch((err) => {
          winston.log('error', err);
          res.status(500).json({
            err: err.message
          });
        })
    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }
  },
  getPatients: (req, res) => {
    try {
      var patient = req.query.patient || "";

      var query = {
        'name': {
          $regex: ".*" + patient + ".*",
          $options: 'i'
        },
        available: 1
      }

      console.log(query);

      findPatients(query)
        .then((r) => {
          res.json({
            ok: 1,
            data: r
          })
        })
        .catch((err) => {
          winston.log('error', err);
          res.status(500).json({
            err: err.message
          });
        })


    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }
  }
}

module.exports = i
