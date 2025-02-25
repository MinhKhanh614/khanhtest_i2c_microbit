// let text = "Hello, world!"
// let buffer = pins.createBuffer(text.length)

// for (let i = 0; i < text.length; i++) {
//     buffer.setNumber(NumberFormat.UInt8LE, i, text.charCodeAt(i))
// }



// pins.i2cWriteBuffer(address, buffer, false)

// class BlynkGate {
//     private auth: string
//     private ssid: string
//     private pass: string

//     constructor() {
//         this.auth = ""
//         this.ssid = ""
//         this.pass = ""
//     }

//     connect(auth_: string, ssid_: string, pass_: string) {
//         // Tạo chuỗi dữ liệu theo định dạng mong muốn
//         let loStr = "connect " + auth_ + " " + ssid_ + " " + pass_ + '\n'
//         this.auth = auth_
//         this.ssid = ssid_
//         this.pass = pass_

//         // Gửi chuỗi dữ liệu qua giao thức I2C
//         this.SendStringToI2C(loStr)
//         this.DBSerial(loStr)
//     }

//     SendStringToI2C(loStr: string) {
//         // Chuyển đổi chuỗi thành buffer
//         let buffer = pins.createBuffer(loStr.length)
//         for (let i = 0; i < loStr.length; i++) {
//             buffer.setNumber(NumberFormat.UInt8LE, i, loStr.charCodeAt(i))
//         }
//         // Ghi buffer qua I2C đến địa chỉ thiết bị mong muốn (giả sử là 0x42)
//         // let address = 0x42
//         pins.i2cWriteBuffer(address, buffer, false)
//     }

//     DBSerial(loStr: string) {
//         // Ghi chuỗi ra cổng serial cho mục đích debug
//         serial.writeString(loStr)
//     }
// }
//% color="#AA278D"
namespace BlynkGate {
    let auth: string
    let ssid: string
    let pass: string

    export function connect(auth_: string, ssid_: string, pass_: string) {
        // Tạo chuỗi dữ liệu theo định dạng mong muốn
        let loStr = "connect " + auth_ + " " + ssid_ + " " + pass_ + '\n'
        auth = auth_
        ssid = ssid_
        pass = pass_

        // Gửi chuỗi dữ liệu qua giao thức I2C
        SendStringToI2C(loStr)
        // DBSerial(loStr)
    }

    function SendStringToI2C(loStr: string) {
        // Chuyển đổi chuỗi thành buffer
        let buffer = pins.createBuffer(loStr.length)
        for (let i = 0; i < loStr.length; i++) {
            buffer.setNumber(NumberFormat.UInt8LE, i, loStr.charCodeAt(i))
        }
        // Ghi buffer qua I2C đến địa chỉ thiết bị mong muốn (giả sử là 0x42)
        // let address = 0x42
        let address = 74
        pins.i2cWriteBuffer(address, buffer, false)
    }

    function DBSerial(loStr: string) {
        // Ghi chuỗi ra cổng serial cho mục đích debug
        serial.writeString(loStr)
    }
}
