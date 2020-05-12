var clockwork = require('clockwork')({key:'fe30b6664a6a6f8ae30fcc17b4c4d151b96edc53'});

export function sendTextAlert(user, message){
    var phone = user.phone;
    phone = phone.substring(1);
    phone = "44" + phone;

    /*clockwork.sendSms({ To: phone, Content: message}, 
        function(error, resp) {
          if (error) {
              console.log(error);
          }
      });*/
    var output = phone + ", " + message;
    console.log(output)
}