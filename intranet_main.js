const express = require('express')
const app = express()
const fs = require('fs')
const port = 3000

var pictures = []
var seachdir = "G:/Bilder/2003/"
var currentImage = "Ostern04/138_3883.JPG"


function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const currentFile = dir + "/" + file
        if (fs.statSync(currentFile).isDirectory()) {
            walk(currentFile)
        } else {
            const depth = seachdir.split("/").length
            const relativePath = currentFile.split("/").slice(depth).join("/")
            if (file.split(".")[1] == "JPG" || file.split(".")[1] == "jpg" || file.split(".")[1] == "png") {
                pictures.push(relativePath)
            }
        }
    })
}


app.get('/', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    fs.readFile('templates/Dahoam.html', function (error, data) {
        if (error) {
            res.writeHead(404)
            res.write('Error: File not found')
        } else {
            res.write(data)
        }
        res.end()
    })
})

app.get('/generalstyle.css', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/css' })
    fs.readFile('css/generalstyle.css', function (error, data) {
        if (error) {
            res.writeHead(404)
            res.write('Error: File not found')
        } else {
            res.write(data)
        }
        res.end()
    })
})

app.get('/fotoalbum', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    fs.readFile('templates/fotoalbum.html', function (error, data) {
        if (error) {
            res.writeHead(404)
            res.write('Error: File not found')
        } else {
            res.write(data)
        }
        res.end()
    })
})

app.get('/api/random_image', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text' })
    currentImage = pictures[Math.floor(Math.random() * pictures.length)]
    changeCurrentPic(res)
    res.end()
})

app.get('/api/images/*', function (req, res) {
    fs.readFile(seachdir + req.params[0], function (error, data) {
        console.log(seachdir + req.params[0])
        if (error) {
            res.writeHead(404)
            res.write('Error: File not found')
        } else {
            res.writeHead(200, { 'Content-Type': 'image/png, image/jpeg' })
            res.write(data)
        }
        res.end()
    })
})

app.get('/api/next_image', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text' })
    currentImage = pictures[pictures.indexOf(currentImage) + 1]
    changeCurrentPic(res)
    res.end()
})

app.get('/api/last_image', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text' })
    currentImage = pictures[pictures.indexOf(currentImage) - 1]
    changeCurrentPic(res)
    res.end()
})

function changeCurrentPic(res) {
    const content = JSON.stringify({ "picture": currentImage })
    res.write(content)

}

app.get('/tickets', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    fs.readFile('templates/ticket_site.html', function (error, data) {
        if (error) {
            res.writeHead(404)
            res.write('Error: File not found')
        } else {
            res.write(data)
        }
        res.end()
    })
})

app.use(express.json())
app.post('/api/tickets', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text' })

    var complaints
    fs.readFile("ftp/complaints.json", function (error, data) {
        if (error) {
            console.log("Error at opening of json file complaints.json")
        } else {
            complaints = JSON.parse(data)
            const inp_subject = req.body.subject
            const inp_content = req.body.content

            complaints.complaint.push({
                subject: inp_subject,
                content: inp_content
            })
            fs.writeFile("ftp/complaints.json", JSON.stringify(complaints), function (error) {
                if (error) console.log(error)
                else console.log("Data written to file succesfully")
            })
        }
    })

})

app.get('/admin', function (req, res) {

    if (req.socket.localAddress.replace("::ffff:", "") != "192.168.8.129") {
        res.writeHead(403, { 'Content-Type': 'text/html' })
        res.end()
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        fs.readFile('templates/passwd_check.html', function (error, data) {
            if (error) {
                res.writeHead(404)
                res.write('Error: File not found')
            } else {
                res.write(data)
            }
            res.end()
        })
    }
})

app.use(express.json())
app.post('/api/check_password', function (req, res) {
    if (req.body.password == "Waltsu18!") {
        res.write(JSON.stringify({ allowed: true }))
        console.log("Login succesfull")
        res.end()
    } else {
        res.write(JSON.stringify({ allowed: false }))
        console.log("Loging failed")
        res.end()
    }
})

app.get('/api/admin_panel', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    fs.readFile('templates/admin_panel.html', function (error, data) {
        if (error) {
            res.writeHead(404)
            res.write('Error: File not found')
        } else {
            res.write(data)
        }
        res.end()
    })
})

app.get('/api/complaints', function (req, res) {
    fs.readFile('ftp/complaints.json', function (error, data) {
        if (error) {
            res.writeHead(404)
            res.write('Error: File not found')
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.write(data)
        }
        res.end()
    })
})

app.listen(port, function (error) {
    if (error) {
        console.log('Something went wrong', error)
    } else {
        console.log('Server is listening on port ' + port)
    }
})


walk(seachdir)