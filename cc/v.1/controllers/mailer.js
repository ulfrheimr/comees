const nodemailer = require('nodemailer')
const moment = require("moment")
const Reporter = require("./report")

let transporter = nodemailer.createTransport({
  host: 'a2plcpnl0051.prod.iad2.secureserver.net',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "administracion@comees.com.mx", // generated ethereal user
    pass: "Wh4t_m_d01ng_here" // generated ethereal password
  }
});


const intervalTime = 60 * 60 * 1000;
const reportDates = [15, 0, 5]
var sent = false


function getSales(query, callback) {
  var sales = {
    "MI": null,
    "MC": null
  }

  console.log(query);

  function check() {
    if (sales.MI != null && sales.MC != null) {
      callback(sales)
    }
  }

  Reporter.getMCReport(query, (s) => {
    let misales = s.map((x) => {
      return {
        "date": moment(x["timestamp"]).format("MMM Do YYYY"),
        "payments": x["payments"].map((p) => {
          return {
            "qty": p["payment"],
            "type": p["paymentType"],
            "usr": p["usr"]
          }
        }),
        "mcs": x["mcs"].map((p) => {
          return {
            "mc": p.mc.name,
            "qty": p.qty,
            "phys": p.phys,
            "price": p.sale_price
          }
        })
      }
    })

    sales["MC"] = misales

    check()
  })

  Reporter.getMIReport(query, (s) => {
    let misales = s.map((x) => {
      return {
        "date": moment(x["timestamp"]).format("MMM Do YYYY"),
        "payments": x["payments"].map((p) => {
          return {
            "qty": p["payment"],
            "type": p["paymentType"],
            "usr": p["usr"]
          }
        }),
        "mis": x["mis"].map((p) => {
          return {
            "mi": p.mi.name,
            "qty": p.qty,
            "price": p.sale_price,
            "discount": p.discount,
            "type_discount": p.type_discount
          }
        })
      }
    })

    sales["MI"] = misales

    check()
  })
}

function sendMail(query, callback) {


  getSales(query, (sales) => {
    let msg = ""
    msg += "<h2>MIS</h2>"

    msg += "<div> <h3>Pagos</h3>"

    let mip = sales["MI"].map((x) => {
      let date = x.date
      let res = x.payments.map((p) => {
        let msg = "<tr>"
        msg += "<td>" + date + "</td>"
        msg += "<td>" + p.qty + "</td>"
        msg += "<td>" + p.type + "</td>"
        msg += "<td>" + p.usr + "</td>"
        msg += "</tr>"


        return msg
      })

      return res
    })
    mip = [].concat(...mip)
    msg += "<table>"
    msg += "<thead><tr><td>Fecha</td><td>Pago</td><td>Tipo</td><td>Vendedor</td><tr></thead>"
    msg += mip.reduce((x, y) => x + y, "")
    msg += "</table>"
    msg += "</div>"


    let mim = sales["MI"].map((x) => {
      let date = x.date

      let res = x.mis.map((p) => {
        let msg = "<tr>"
        msg += "<td>" + date + "</td>"
        msg += "<td>" + p.qty + "</td>"
        msg += "<td>" + p.mi + "</td>"
        msg += "<td>" + p.price + "</td>"
        msg += "<td>" + p.discount + "</td>"
        msg += "</tr>"
        return msg
      })

      return res
    })
    mim = [].concat(...mim)
    msg += "<h3>MIS</h3>"
    msg += "<table>"
    msg += "<thead><tr><td>Fecha</td><td>Qty</td><td>MI</td><td>Precio</td><td>Descuento</td><tr></thead>"
    msg += mim.reduce((x, y) => x + y, "")
    msg += "</table>"

    let total = sales["MI"].map((x) => x.payments.map((p) => p.qty))
    total = [].concat(...total).reduce((x, y) => x + y, 0)

    msg += "<div><h3>Total: " + total + "</h3></div>"
    msg += "</div>"

    msg += "<br><br><br><br><br>"
    msg += "<h2>MCS</h2>"
    msg += "<div> <h3>Pagos</h3>"


    let mcp = sales["MC"].map((x) => {
      let date = x.date
      let res = x.payments.map((p) => {
        let msg = "<tr>"
        msg += "<td>" + date + "</td>"
        msg += "<td>" + p.qty + "</td>"
        msg += "<td>" + p.type + "</td>"
        msg += "<td>" + p.usr + "</td>"
        msg += "</tr>"


        return msg
      })

      return res
    })
    mcp = [].concat(...mcp)
    msg += "<div>MCS</div>"
    msg += "<table>"
    msg += "<thead><tr><td>Fecha</td><td>Pago</td><td>Tipo</td><td>Vendedor</td><tr></thead>"
    msg += mcp.reduce((x, y) => x + y, "")
    msg += "</table>"
    msg += "</div>"

    let mcm = sales["MC"].map((x) => {
      let date = x.date

      let res = x.mcs.map((p) => {
        let msg = "<tr>"
        msg += "<td>" + date + "</td>"
        msg += "<td>" + p.qty + "</td>"
        msg += "<td>" + p.mc + "</td>"
        msg += "<td>" + p.phys + "</td>"
        msg += "<td>" + p.price + "</td>"
        msg += "</tr>"
        return msg
      })


      return res
    })
    mcm = [].concat(...mcm)

    msg += "<h3>MCS</h3>"
    msg += "<table>"
    msg += "<thead><tr><td>Fecha</td><td>Qty</td><td>MC</td><td>Doctor</td><td>Precio</td><tr></thead>"
    msg += mcm.reduce((x, y) => x + y, "")
    msg += "</table>"

    total = sales["MC"].map((x) => x.payments.map((p) => p.qty))
    total = [].concat(...total).reduce((x, y) => x + y, 0)

    msg += "<div><h3>Total: " + total + "</h3></div>"
    msg += "</div>"

    console.log("sending");

    let mailOptions = {
      from: 'administracion@comees.com.mx', // sender address
      to: 'ulfrheimr@gmail.com', // list of receivers
      subject: 'Reporte de Ventas', // Subject line
      html: msg
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }

      callback("Message sent" + info.messageId)
    });
  })
}


setInterval(function() {
  let query = {}
  // let currentDay = moment().date()
  let currentDay = 5

  let tryTo = reportDates.indexOf(currentDay) != -1 ||
    reportDates.indexOf(currentDay - moment().daysInMonth()) != -1

  if (tryTo && !sent) {
    if (!sent) {
      if (currentDay == 5) {
        let init = moment(moment().subtract(1, "months"))

        query = {
          "init": init.year().toString() + "-" + (init.month() + 1).toString().padStart(2, "0") + "-" + init.daysInMonth().toString(),
          "end": moment().format('YYYY-MM-DD')
        }

      } else {
        let init = moment()
        query = {
          "init": init.year().toString() + "-" + (init.month() + 1).toString().padStart(2, "0") + "-" + 15,
          "end": moment().format('YYYY-MM-DD')
        }
      }


      console.log("Trying to send reports mail");
      sendMail(query, (message) => {
        console.log(message)
        sent = true
      })

    }
  }

  if (!tryTo) {
    sent = false
  }


}, intervalTime);
