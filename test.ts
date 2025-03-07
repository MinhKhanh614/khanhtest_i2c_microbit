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

let bttState: number = 1;


basic.forever(function () {
    input.onButtonPressed(Button.A, function () {
        bttState = bttState - 1;
        if (bttState < 0) bttState = 1;
        BlynkGate.virtualWrite(4, bttState.toString());
    })
    basic.showNumber(bttState);
    BlynkGate.checkI2CThenSendSerial(handleI2CData)
})

// Hàm callback xử lý dữ liệu
function handleI2CData(pin: number, value: number): void {
    // console.log(`Pin: ${pin}, Value: ${value}`);
    serial.writeLine(pin.toString())
    serial.writeLine(value.toString())
    // Thực hiện các tác vụ khác ở đây
    if (pin === 4) {
        // console.log(`Special processing for pin 4: ${value}`);
        bttState = value;
    }
}