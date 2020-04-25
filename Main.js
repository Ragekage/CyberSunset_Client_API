
// async..await is not allowed in global scope, must use a wrapper
export const main =  () => {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    // let testAccount = await nodemailer.createTestAccount();
    // create reusable transporter object using the default SMTP transport
  
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

      console.log(transport)

      transport.verify(function(error, success) {
        if (error) {
             console.log(error);
        } else {
             console.log('Server is ready to take our messages');
        }
     });
  
    // send mail with defined transport object
    // let info = await transport.sendMail({
    //   from: '"Fred Foo 👻" <foo@example.com>', // sender address
    //   to: "bar@example.com, baz@example.com", // list of receivers
    //   subject: "Hello ✔", // Subject line
    //   text: "Hello world?", // plain text body
    //   html: "<b>Hello world?</b>" // html body
    // });

    var mailOptions = {
        from: '"Example Team" <from@example.com>',
        to: 'user1@example.com, user2@example.com',
        subject: 'Nice Nodemailer test',
        text: 'Hey there, it’s our first message sent with Nodemailer ;) ', 
        html: '<b>Hey there! </b><br> This is our first message sent with Nodemailer'
    };

    

    transport.sendMail(mailOptions).then(res => { console.log(res)})
   
  
    // console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
    // Preview only available when sending through an Ethereal account
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }
