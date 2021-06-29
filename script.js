const createServerExpress = require('express');
const server = createServerExpress();
const path = require('path');
const fs = require('fs');
const cors = require('cors')
const formidable = require('formidable');
const nodemailer = require("nodemailer");
const session = require('express-session');

const sharp = require('sharp');
var requestIp = require('request-ip');
const crypto = require('crypto');
const {Client, ClientBase} = require("pg");
const { query } = require('express');
server.use(createServerExpress.json());
server.use(cors());

const client = new Client({host:"ec2-176-34-105-15.eu-west-1.compute.amazonaws.com", database:"d7s3iko9o8tosi", user:"gbzpussoftuekx", password:"d9554d09181fbe57f88e623374a21051888ba5bcef8e3bbb187be58fe2e5de02",port:5432, ssl: { require: true, rejectUnauthorized: false }})
client.connect();

server.post("/receiver", function(req, res) {
    // console.log(req);
    client.query(req.body.query, function (err, queryResult) {
        // res.end()
        // res.json(queryResult.rows);
        console.log({err: err})
        // res.redirect("/produse");
        res.render("./pages/produse.ejs", {produse: queryResult.rows});
        
    });
    // res.end()
})

server.use(session({
    secret: 'abcdefg',//folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
  }));

  function getUtiliz(req){
	var utiliz;
	if(req.session){
		utiliz=req.session.utilizator
	}
	else{utiliz=null}
	return utiliz;
}

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

// async function trimiteMail(username, email){
// 	var transp= nodemailer.createTransport({
// 		service: "gmail",
// 		secure: false,
// 		auth:{//date login 
// 			user:"test.tweb.node@gmail.com",
// 			pass:"tehniciweb"
// 		},
// 		tls:{
// 			rejectUnauthorized:false
// 		}
// 	});
// 	//genereaza html
// 	await transp.sendMail({
// 		from:"test.tweb.node@gmail.com",
// 		to:email,
// 		subject:"Te-ai inregistrat cu succes",
// 		text:"Username-ul tau este "+username,
// 		html:"<h1>Salut!</h1><p>Username-ul tau este "+username+"</p>",
// 	})
// 	console.log("trimis mail");
// }


let parolaServer="tehniciweb";
server.post("/inreg",function(req, res){ 
    console.log("primit date");
    var username;
    let formular= formidable.IncomingForm();
	//nr ordine: 4
    formular.parse(req, function(err, campuriText, campuriFisier){
        console.log({campuriText :campuriText});
		eroare ="";
		if(campuriText.username=="" || !campuriText.username.match("^[A-Za-z0-9]+$")){
			eroare+="Username gresit. ";
		}
        if(campuriText.parola !== campuriText.rparola){
            eroare += "Cele 2 parole nu corespund";
        }
        //varificare daca exista username
        client.query(`select count(*) from utilizatori where username='${campuriText.username}';`, function (err, value) {
            let userExists = value.rows[0].count;
            if (userExists == 1) {
                eroare += "Acest utilizator exista deja!";
                // res.render("pages/inregistrare.ejs", { campuriText: campuriText, registerError: '(Userul deja exista. Incearca altceva)' });
                res.render("pages/inregistrare",{err:"Userul deja exista. Incearca altceva", raspuns:"."});
            }})


		if(!eroare){
			let parolaCriptata= crypto.scryptSync(campuriText.parola, parolaServer, 32).toString('ascii');
			let comanda= `insert into utilizatori (username, nume, prenume, parola, email) values ('${campuriText.username}','${campuriText.nume}', '${campuriText.prenume}', '${parolaCriptata}', '${campuriText.email}')`;
			console.log(comanda);
			client.query(comanda, function(err, rez){
				if (err){
					console.log(err);
					res.render("pages/inregistrare",{err:"Eroare baza date! Reveniti mai tarziu", raspuns:"Datele nu au fost introdduse."});
				}
				else{
					res.render("pages/inregistrare",{err:"", raspuns:"Totu bine!"});
					// trimiteMail(campuriText.username,campuriText.email);
					console.log(campuriText.email);
				}
			});
		}
		else{
			res.render("pages/inregistrare",{err:"Eroare formular. "+eroare, raspuns:""});
		}
    });

	//nr ordine: 2
	formular.on("fileBegin", function(name,campFisier){
		console.log("inceput upload: ", campFisier);
		if(campFisier && campFisier.name!=""){
			//am  fisier transmis
			var cale=__dirname+"/poze_uploadate/"+username
			if (!fs.existsSync(cale))
				fs.mkdirSync(cale);
			campFisier.path=cale+"/"+campFisier.name;
			console.log(campFisier.path);
		}
	});	

	//nr ordine: 1
	formular.on("field", function(name,field){
		if(name=='username')
			username=field;
		console.log("camp - field:", name)
	});
	
	//nr ordine: 3
	formular.on("file", function(name,field){
		console.log("final upload: ", name);
	});
	
});

function getUtiliz(req){
	var utiliz;
	if(req.session){
		utiliz=req.session.utilizator
	}
	else{utiliz=null}
	return utiliz;
}

server.post("/sterge_utiliz",function(req, res){
	if(req.session && req.session.utilizator && req.session.utilizator.rol=="admin"){
	var formular= formidable.IncomingForm()
	
	formular.parse(req, function(err, campuriText, campuriFisier){
		var comanda=`delete from utilizatori where id='${campuriText.id_utiliz}'`;
		client.query(comanda, function(err, rez){
			// TO DO mesaj cu stergerea
		});
	});
	}
	res.redirect("/useri");
	
});

server.get('/useri', function(req, res){
	
	if(req.session && req.session.utilizator && req.session.utilizator.rol=="admin"){
        client.query("select * from utilizatori",function(err, rezultat){
            if(err) throw err;
            console.log({REQQQQ: req.session.utilizator});
            res.render('pages/useri',{useri:rezultat.rows, utilizator:req.session.utilizator});//afisez index-ul in acest caz
        });
	} else{
		res.status(403).render('pages/eroare',{mesaj:"Nu aveti acces", utilizator:req.session.utilizator});
	}

});

server.get("/logout", function(req, res){
    req.session.destroy();
    res.render("pages/logout");
});

server.post("/login", function(req,res){
    let formular= formidable.IncomingForm();
    formular.parse(req, function(err, campuriText){
        let parolaCriptata= crypto.scryptSync(campuriText.parola, parolaServer, 32).toString('ascii');
        let comanda_param= `select id,username,nume, email, rol from utilizatori where username= $1::text and parola=$2::text`;
        
        client.query(comanda_param, [campuriText.username, parolaCriptata], function(err, rez){
        //client.query(comanda, function(err, rez){
            if (!err){
                console.log({reqqqqqqQ: req.session.utilizator});
                if (rez.rows.length == 1){
                    req.session.utilizator={
                        id:rez.rows[0].id,
                        username:rez.rows[0].username,
                        nume:rez.rows[0].nume,
                        email:rez.rows[0].email,
						rol:rez.rows[0].rol
                    }
                }
                
            }
            res.redirect("/index");
        });
    }); 
})

server.listen(8080);
console.log("A pornit serverul!");

server.get("/", (req, res) => {
    var userIp = requestIp.getClientIp(req);
    let galleryPaths = pictureCheck();
    res.render("pages/index.ejs", {
        utilizator: req.session.utilizator,
        userIp: userIp,
        images: galleryPaths
    })
});

server.get("/index", (req, res) => {
    var userIp = requestIp.getClientIp(req);
    let galleryPaths = pictureCheck();
    res.render("pages/index.ejs", {
        utilizator: req.session.utilizator,
        userIp: userIp,
        images: galleryPaths
    })
});

server.get("/produse", function (req, res) {

    const result = client.query("select * from tabel_pachete", function (err, queryResult) {
        // console.log(queryResult)
        res.render("pages/produse.ejs", {produse: queryResult.rows, utilizator: req.session.utilizator});
        
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
});