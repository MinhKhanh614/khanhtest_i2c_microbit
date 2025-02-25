// tests go here; this will not be compiled when this package is used as an extension.
namespace BlynkConfig {
    export const TEMPLATE_ID: string = "TMPL6koTRhUeq";
    export const TEMPLATE_NAME: string = "IOT Garden";
    export const AUTH_TOKEN: string = "mfBIlnpKTwX0XwB0rTTvm35CwzzMUzw9";
}
namespace Profile {
    export const AUTH_TOKEN: string = BlynkConfig.AUTH_TOKEN;
    export const SSID: string = "MakerLab.vn"; // Nhập tên wifi của bạn (Băng thông 2.4Ghz). Bạn có thể kiểm tra với điện thoại thông minh của mình để biết tên wifi
    export const PASSWORD: string = "";        // Nhập mật khẩu wifi của bạn
}
// basic.forever(function () {
BlynkGate.connect(Profile.AUTH_TOKEN, Profile.SSID, Profile.PASSWORD)
// })