// tests go here; this will not be compiled when this package is used as an extension.
namespace BlynkConfig {
    export const TEMPLATE_ID: string = "TMPL6koTRhUeq";
    export const TEMPLATE_NAME: string = "IOT Garden";
    export const AUTH_TOKEN: string = "mfBIlnpKTwX0XwB0rTTvm35CwzzMUzw9";
}
namespace Profile {
    export const AUTH_TOKEN: string = BlynkConfig.AUTH_TOKEN;
    export const SSID: string = "Hshop.vn"; // Nhập tên wifi của bạn (Băng thông 2.4Ghz). Bạn có thể kiểm tra với điện thoại thông minh của mình để biết tên wifi
    export const PASSWORD: string = "";        // Nhập mật khẩu wifi của bạn
}

BlynkGate.connect(Profile.AUTH_TOKEN, Profile.SSID, Profile.PASSWORD)

// basic.pause(15000)
// BlynkGate.DBSerial("RUN virtualWrite")
let bttState: number = 1;

// setBlynkWriteCallback((request, param) => {
//     let req = request.buff
//     let pa = param.
//     if(parseInt(req)==4){
//         bttState = param;
//     }
// });

basic.forever(function () {
    input.onButtonPressed(Button.A, function () {
        bttState = bttState - 1;
        if (bttState < 0) bttState = 1;
        basic.showLeds(`
        . . . . .
        . . . . .
        . . # . .
        . . . . .
        . . . . .
        `)

        BlynkGate.virtualWrite(4, bttState.toString());

    })
    
    input.onButtonPressed(Button.B, BlynkGate.checkI2CThenSendSerial);

    basic.showNumber(bttState);
    basic.showLeds(`
        . . . . .
        . . . . .
        . . . . .
        . . . . .
        . . . . .
        `)
})




// loops.everyInterval(500, function() {
//     BlynkGate.checkI2CThenSendSerial
// })