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
      first_name: req.body.Name.First,
      last_name: req.body.Name.Last,
      line_1: req.body.Address.Line1,
      line_2: req.body.Address.Line2,
      city: req.body.Address.City,
      state: req.body.Address.State,
      zip:  req.body.Address.PostalCode,
      country: req.body.Address.Country,
      metadata: req.body.EventId
    }
  })
  res.status(200).end()
})
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})