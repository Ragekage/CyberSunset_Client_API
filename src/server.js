const uuidv1 = require('uuid/v1')
const express = require('express');
var sql = require('mssql')
var bodyParser = require('body-parser')
const app = express();
const port = process.env.PORT || 5000;


var nodemailer = require('nodemailer')
var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "17881c7c885f7d",
      pass: "ba97eb7c132ca2"
    },
    debug: true,
    logger: true,
  });

  var gmailTransport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
      user: 'cybersunsetgame@gmail.com',
      pass: 'Flowz13579'
  }
  });

  console.log(transport)

  gmailTransport.verify(function(error, success) {
    if (error) {
         console.log(error);
    } else {
         console.log('Server is ready to take our messages');
    }
 });

 var mailOptions = {
    from: '"Example Team" <from@example.com>',
    to: 'user1@example.com, user2@example.com',
    subject: 'Kadey boi',
    text: 'Hey there, it’s our first message sent with Nodemailer ;) ', 
    html: '<b>Hey there! </b><br> This is our first message sent with Nodemailer'
};


var dbConfig = {
    user: "kadejd",
    password: "Flowz13579!",
    server: "cyberfdb.czz9fn6at3dn.eu-west-2.rds.amazonaws.com",
    database: "cyberFdbMain"
}

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// create a GET route
app.get('/express_backend', (req, res) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});

app.get('/sendEmail', (req, res) => {
    transport.sendMail(mailOptions).then(res => { console.log(res)})
    res.send({express: 'yo i sent it'})
})

app.get('/dbtest', (req, res) => {
 var response = getPlayers()
    res.send({express: response})
})

app.post('/createuser', bodyParser(), (req, res) => {
    console.log(req)

    var confirmId = uuidv1();
    var dbConn = new sql.ConnectionPool(dbConfig);
    
    
    dbConn.connect()
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        request.query("insert into dbo.UsersTables (Username, Password, Email, CreatedAt, Confirmed)  values ( " + "'" +  req.body.postData.username + "'" + "," + "'" + req.body.postData.password + "'" + "," + "'" + req.body.postData.email + "'," + "GETDATE()," + "'" + confirmId + "'" + ")").then(function (resp) {
            console.log(resp);
            dbConn.close();
            res.send({ result: "user created"})

            var ConfirmationMail = {
                from: 'cybersunsetgame@gmail.com',
                to: req.body.postData.email + ", cybersunsetgame@gmail.com",
                subject: 'CyberSunset - Confirmation Email',
                html: '<b>Welcome!</b><br> Love you sexy girl ;),  please use this link to confirm your email: http://localhost:3000/confirmation/' + confirmId
            };

            gmailTransport.sendMail(ConfirmationMail).then(res => { console.log(res)})
        }).catch(function (err) {
            console.log(err);
            res.send({ result: "error occured"})
            dbConn.close();
        })
    }).catch(function (err) {
        console.log(err)
    })})




    app.post('/confirmcheck', bodyParser(), (req, res) => {
        var dbConn = new sql.ConnectionPool(dbConfig);
        dbConn.connect()
        dbConn.connect().then(function () {
            var request = new sql.Request(dbConn);
            request.query("select * from dbo.UsersTables where Confirmed='"+ req.body.confirmId + "'").then(function (resp) {
                console.log(resp);
                console.log(req.body)
                if(resp.rowsAffected > 0)
                {
                res.send({result: "confirmed"})
                upDateConfirmed(resp.recordset[0].Id)
                }
                else
                {
                res.send({result: "failed"})
                }
                dbConn.close();
            }).catch(function (err) {
                console.log(err);
                dbConn.close();
            })
        }).catch(function (err) {
            console.log(err)
        })
    })


    app.post('/checkuser', bodyParser(), (req, res) => {
    var dbConn = new sql.ConnectionPool(dbConfig);
    dbConn.connect()
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        request.query("select * from dbo.UsersTables").then(function (resp) {
            console.log(resp.recordset);
            console.log(req.body)
            dbConn.close();
           var search = containsUsernameString("Email", req.body.userData.username, resp.recordset, req.body.userData.password)
            res.send({players: search})
        }).catch(function (err) {
            console.log(err);
            dbConn.close();
        })
    }).catch(function (err) {
        console.log(err)
    })})

    app.get('/dbtest', (req, res) => {
        var query = "select * from dbo.UsersTables"
        dataBaseQuerys(query, res)
    })

    app.post('/EmailUserCheck', bodyParser(), (req, res) => {
        var query = "select * from dbo.UsersTables"
        dataBaseQuerysContains(query, res, req, checkUserNameEmailExists)
    })


    function upDateConfirmed(id) {
        var dbConn = new sql.ConnectionPool(dbConfig);
        dbConn.connect()
        dbConn.connect().then(function () {
            var request = new sql.Request(dbConn);
            request.query("update dbo.UsersTables set Confirmed = 'true' where Id =" + id).then(function (resp) {
                console.log(resp);
            }).catch(function (err) {
                console.log(err);
            })
        }).catch(function (err) {
            console.log(err);
        });
    }

    function dataBaseQuerysContains(query, res, req, sFunction){
        var dbConn = new sql.ConnectionPool(dbConfig);
        dbConn.connect()
        dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        request.query(query).then(function (resp) {
                dbConn.close();
                console.log(resp)
                var search = sFunction(resp.recordset, req)
                res.send({data: search})
            }).catch(function (err) {
                console.log(err);
                dbConn.close();
            })
        }).catch(function (err) {
            console.log(err)
        })

    }

    function dataBaseQuerys(query, res){
        var dbConn = new sql.ConnectionPool(dbConfig);
        dbConn.connect()
        dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        request.query(query).then(function (resp) {
                dbConn.close();
                console.log(resp)
                res.send({data: resp})
            }).catch(function (err) {
                console.log(err);
                dbConn.close();
            })
        }).catch(function (err) {
            console.log(err)
        })

    }


    async function dataBaseQuery(query){
        var dbConn = new sql.ConnectionPool(dbConfig);
        dbConn.connect()
     var response = await dbConn.connect().then(function () {
            var request = new sql.Request(dbConn);

        var requested = request.query(query).then(function (resp) {
                dbConn.close();
                console.log(resp)
                return resp
            }).catch(function (err) {
                console.log(err);
                dbConn.close();
                return err
            })

            return requested
        }).catch(function (err) {
            console.log(err)
            return err
        })

        return response
    }


    function checkUserNameEmailExists(data, request){
        console.log(request)
        var dataFilter = data.filter(data => data.Username === request.body.postData.username || data.Email === request.body.postData.email)
        if(dataFilter.length > 0)
        {
            return "exists"
        }
        else
        {
            return "ok"
        }
    }



      function containsId(searchid, data) {
           var dataFilter = data.filter(data => data.id === searchid)
           if(dataFilter.length > 0)
           {
               return true
           }
           else
           {
               return false
           }
        }




        function containsUsernameString(field, searchString, data, password) {
            var dataFilter = data.filter(data => data.Email === searchString)
            if(dataFilter.length > 0)
            {
                if(field === "Email")
                {
                    console.log(dataFilter[0], password)
                    if(dataFilter[0].Password === password)
                    {
                        if(dataFilter[0].Confirmed !== "true")
                        {
                            return "Need Email Confirm"
                        }
                        else
                        {
                       return "Password Accepted"
                        }
                    }
                    else
                    {
                        return "Password Rejected"
                    }
                }
                return "Found"
            }
            else
            {
                return "Not Found"
            }
         }


