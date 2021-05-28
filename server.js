const express = require("express")
const path = require("path")

const app = express()

app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = process.env.PORT || 8080

const clients = []
const connections = [];

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"))
})

 
app.post("/enter", (req, res) => {
    if (clientExists(req.body.name)) {
        res.send({ok: false, data: "Name taken"})
        return
    }
    let c = {
        name: req.body.name,
        color: getRandomColor(),
    }
    clients.push(c)
    res.send({ok: true, data: c.name})
})

app.get("/chat", (req, res) => {
    connections.push(res);
})

app.post("/sendMsg", (req, res) => {
    console.log("aaa", req.body)
    const client = getClient(req.body.name)
    const msg = req.body.message;
    if (msg.startsWith("/")) {
        command(client, msg, res)
    } else {
        connections.forEach((c, index) => {
            c.send({from: client, message: msg})
        })
        connections.length = 0
        res.end();
    }
})

function command(client, command, res) {
    const c = command.substr(1).split(" ");
    if(c[0] == "color") {
        // /color #ffffff
        client.color = c[1]
        res.end()
    }
    if (c[0] == "nick") {
        client.name = c[1].trim()
        res.end(c[1].trim())
    }
    if (c[0] == "quit") {
        res.redirect("/")
    }
}

function clientExists(name) {
    return getClient(name) != undefined
}

function getClient(name) {
    return clients.find(el => el.name == name);
}

function getRandomColor() {
    let r = Math.floor(256 * Math.random()).toString(16)
    let g = Math.floor(256 * Math.random()).toString(16)
    let b = Math.floor(256 * Math.random()).toString(16)
    return "#"+r+g+b
}
app.listen(PORT, () => {
    console.log("Started on", PORT)
})