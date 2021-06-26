const createServerExpress = require('express');
const server = createServerExpress();
const path = require('path');
const fs = require('fs');
const cors = require('cors')
const sharp = require('sharp');
var requestIp = require('request-ip');
const {Client, ClientBase} = require("pg");
const { query } = require('express');
server.use(createServerExpress.json());
server.use(cors());

const client = new Client({host:"localhost", database:"mydata", user:"andrei", password:"123456",port:5432})
client.connect();

server.post("/receiver", function(req, res) {
    // console.log(req);
   
    const result = client.query(req.body.query, function (err, queryResult) {
        // res.end()
        // res.json(queryResult.rows);
        console.log({queryResult: queryResult.rows == undefined})
        res.render("pages/produse.ejs", {produse: queryResult.rows == undefined ? {rows: []} : queryResult.rows}, (eroare, html) => {
            // console.log({RASPUNS: html})
            // res.set('Content-Type', 'text/html');
            // res.render("./pages/produse");
            // res.send(html)
        });
});
})



server.set("view engine", "ejs");

server.get("/src/json/gallery.json", function (req, res) {
    res.status(403).render("pages/page403.ejs");
})

server.use("/src", createServerExpress.static(path.join(__dirname, "src")));

// function pictureCheck() {

//     var jsonFile = fs.readFileSync("src/json/gallery.json");
//     var obj = JSON.parse(jsonFile);
//     var galleryPath = obj.myPath;
//     var imagesPaths = [];

//     for (let img of obj.images) {

//         var oldImg = path.join(galleryPath, img.relPath);
//         var ext = path.extname(img.relPath);
//         var fileName = path.basename(img.relPath, ext);
//         let newImg = path.join(galleryPath + "/small/" + fileName + "Small" + ".webp");    

//         var data = new Date();
//         var hour = data.getHours();

//         if(img.time == "day" && hour >= 12 & hour <= 20)
//             imagesPaths.push({normal:oldImg, small:newImg, description: img.description, license:img.license, link:img.licenseLink, name:fileName});
//         else
//             if(img.time == "morning" && hour > 5 && hour < 12 )
//             imagesPaths.push({normal:oldImg, small:newImg, description: img.description, license:img.license, link:img.licenseLink});
//             else
//                 if(img.time == "night" && ((hour >20 && hour <= 23) || (hour >= 0 && hour <= 5)))
//                 imagesPaths.push({normal:oldImg, small:newImg, description: img.description, license:img.license, link:img.licenseLink});

//         if(!fs.existsSync(newImg)) {
//             sharp(oldImg)
//                 .resize(150)
//                 .toFile(newImg, function(err) {
//                     console.log("can't convert ", oldImg, " to ", newImg, err);
//             });
//         }
//     }

//     return imagesPaths

// }


function pictureCheck() {
    var textFisier = fs.readFileSync("src/json/gallery.json")
    var jsi = JSON.parse(textFisier);
    var caleGalerie = jsi.cale_galerie;
    let vect = []
    for (let im of jsi.images) {
        var imVeche = path.join(caleGalerie, im.cale_fisier);
        var ext = path.extname(im.cale_fisier);
        var numeFisier = path.basename(im.cale_fisier, ext)
        let imNoua = path.join(caleGalerie + "/mare/", numeFisier + ".webp");
        let imMica = path.join(caleGalerie + "/mic/", numeFisier + "-150" + ".webp");
        let imMedie = path.join(caleGalerie + "/mediu/", numeFisier + "-300" + ".webp");
        if (!fs.existsSync(imNoua))
            sharp(imVeche)
                .resize(400, 266)
                .toFile(imNoua, function (err) {
                    if (err)
                        console.log("eroare conversie", imVeche, "->", imNoua, err);
                });
        if (!fs.existsSync(imMica))
            sharp(imVeche)
                .resize(150, 100)
                .toFile(imMica, function (err) {
                    if (err)
                        console.log("eroare conversie", imVeche, "->", imMica, err);
                });
        if (!fs.existsSync(imMedie))
            sharp(imVeche)
                .resize(300, 200)
                .toFile(imMedie, function (err) {
                    if (err)
                        console.log("eroare conversie", imVeche, "->", imMedie, err);
                });
        vect.push({ mare: "/" + imNoua, titlu: im.titlu, ora_start: im.ora_start, ora_final: im.ora_final, alt: im.alt, text_descriere: im.text_descriere });
    }

    return vect;
}

server.listen(8080);
console.log("A pornit serverul!");

server.get("/", (req, res) => {
    var userIp = requestIp.getClientIp(req);
    let galleryPaths = pictureCheck();
    res.render("pages/index.ejs", {
        userIp: userIp,
        images: galleryPaths
    })
});

server.get("/index", (req, res) => {
    var userIp = requestIp.getClientIp(req);
    let galleryPaths = pictureCheck();
    res.render("pages/index.ejs", {
        userIp: userIp,
        images: galleryPaths
    })
});

server.get("/produse", function (req, res) {

    const result = client.query("select * from tabel_pachete", function (err, queryResult) {
        console.log(queryResult)
        res.render("pages/produse.ejs", {produse: queryResult.rows});
        
    });
})
server.get("/produs/:id", function (req, res) {
    const result = client.query("select * from tabel_pachete where id=" + req.params.id, function (err, queryResult) {
        // console.log(queryResult)
        res.render("pages/produs.ejs", {produse: queryResult.rows});
        
    });
})

server.get("/*", function (req, res) {

    res.render("pages" + req.url + ".ejs", function (err, renderResult) {
        console.log(req.url);
        if (err) {
            if (err.message.includes("Failed to lookup view")) {
                res.status(404).render("pages/page404.ejs");
            }
            else
                throw err;
        }
        else
            res.send(renderResult);
    });
})

