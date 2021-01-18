const express = require('express')
const bodyParser = require("body-parser")
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const app = express()
const port = 3000

app.use(bodyParser.json())
app.post("/send", async (req, res) => {
  console.log(req.body)
  await prisma.address.create({
    data: {
      first_name: req.body.FirstName,
      last_name: req.body.LastName,
      line_1: req.body.Address.Line1,
      line_2: req.body.Address.Line2,
      city: req.body.Address.City,
      state: req.body.Address.State,
      zip:  req.body.Address.PostalCode
    }
  })
  res.status(200).end()
})
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})