//% color="#4CAF50"
namespace BlynkGate {

    const slaveAddress = 74; // Địa chỉ I2C của thiết bị slave
    const KXN_BYTE_PER_TIME_SEND = 32;
    const BLYNK_I2C_CMD_VIRTUAL_PIN_TX: string = "ATW";
    const BLYNK_I2C_CMD_VIRTUAL_PIN_RX: string = "EATR";

    const BLYNK_I2C_SADDR_ID: number = 0;
    const BLYNK_I2C_MODE_ID_GET_DATA: number = 1;
    const BLYNK_I2C_MODE_ID_DETECT_DEVICE: number = 2;
    const MODE_ID_SET_OUTPUT: number = 3;
    const BLYNK_I2C_END_MODE_ID: number = 4;

    interface SerialBlynkI2CData {
        id: string;
        modeId: string;
        lenData: number;
        checkSumData: number;
        data: string;
    }

    let auth: string
    let ssid: string
    let pass: string

    //% block ="Connect to WiFi 2.4G"
    export function setup(input_auth: string, input_ssid: string, input_pass: string) {
        auth = input_auth;
        ssid = input_ssid;
        pass = input_pass;
    }
    /**
     * @param TEST
     */
    export function connect(auth_: string, ssid_: string, pass_: string) {
        // Tạo chuỗi dữ liệu theo định dạng mong muốn
        let loStr = "connect " + auth_ + " " + ssid_ + " " + pass_ + '\n'
        // Gửi chuỗi dữ liệu qua giao thức I2C
        SendStringToI2C(loStr)
        // DBSerial(loStr)
    }
    /** */


    //% block
    export function SendStringToI2C(loStr: string) {
        // Chuyển đổi chuỗi thành buffer
        let buffer = pins.createBuffer(loStr.length)
        for (let i = 0; i < loStr.length; i++) {
            buffer.setNumber(NumberFormat.UInt8LE, i, loStr.charCodeAt(i))
        }
        // Ghi buffer qua I2C đến địa chỉ thiết bị mong muốn (giả sử là 0x42)
        // let address = 0x42
        let address = 74
        serial.writeBuffer(buffer)
        pins.i2cWriteBuffer(address, buffer, false)
    }
    //% block
    export function virtualWrite(vx_: number, strValue_: string): void {
        let tempStr = BLYNK_I2C_CMD_VIRTUAL_PIN_TX;
        tempStr += " ";
        tempStr += vx_.toString();
        tempStr += " ";
        tempStr += strValue_;
        tempStr += "\n";
        SetupCharArrayToBuffer4(tempStr, tempStr.length);
    }
    //% block
    export function I2C_writeString(myAdd: number, myString: string, myLen: number): void {
        pins.i2cWriteBuffer(myAdd, pins.createBufferFromArray(myString.split('').map(c => c.charCodeAt(0))));
        control.waitMicros(1000);
    }
    //% block
    export function SetupCharArrayToBuffer4(inputCharArray: string, len: number): void {
        const timeSend = Math.floor(len / KXN_BYTE_PER_TIME_SEND);

        for (let cf = 0; cf <= timeSend; cf++) {
            let temHeader: SerialBlynkI2CData = {
                id: '0',
                modeId: '2',
                lenData: 0,
                checkSumData: 0,
                data: ''
            };

            if (timeSend === cf) {
                temHeader.lenData = len % KXN_BYTE_PER_TIME_SEND - 1;
            } else {
                temHeader.lenData = KXN_BYTE_PER_TIME_SEND;
            }
            temHeader.checkSumData = temHeader.lenData;

            const pSplitArray = inputCharArray.substr(cf * KXN_BYTE_PER_TIME_SEND, temHeader.lenData + 1);
            temHeader.data = pSplitArray;
            const tempArrChar = temHeader.id + temHeader.modeId + String.fromCharCode(temHeader.lenData) + String.fromCharCode(temHeader.checkSumData) + temHeader.data;
            // DBSerial(tempArrChar);
            I2C_writeString(slaveAddress, tempArrChar, temHeader.lenData + 4);
            control.waitMicros(1000);
        }
    }
    //% block
    export function checkI2CThenSendSerial(callback: (pin: number, value: number) => void): void {

        let isEmptyData = false;
        let tempStringData: string = '';

        while (!isEmptyData) {
            // Gửi lệnh getData
            let tempCharHeader = "";

            let tempHeader: SerialBlynkI2CData = {
                id: '0',
                modeId: BLYNK_I2C_MODE_ID_GET_DATA.toString(),
                lenData: 0,
                checkSumData: 0,
                data: ''
            };

            // Gửi lệnh GET_DATA qua I2C
            tempCharHeader += String.fromCharCode(0x00);  // Thêm header (giống với `tempHeader` trong C++)
            tempCharHeader += String.fromCharCode(0x01);  // Thêm header (giống với `tempHeader` trong C++)
            tempCharHeader += String.fromCharCode(0x00);  // Thêm header (giống với `tempHeader` trong C++)
            tempCharHeader += String.fromCharCode(0x00);  // Thêm header (giống với `tempHeader` trong C++)
            // serial.writeLine(tempCharHeader)
            I2C_writeString(slaveAddress, tempCharHeader, tempCharHeader.length);

            control.waitMicros(1000);  // Tạm dừng một chút để I2C trả lời

            let buffer = pins.i2cReadBuffer(slaveAddress, 32);  // Đọc dữ liệu từ I2C
            // serial.writeBuffer(buffer);
            let myArr = buffer.toArray(NumberFormat.UInt8LE);
            // serial.writeLine('\n');

            // serial.writeNumbers(myArr);
            /**
             * test ok d07m03y25
             */
            if (myArr[0] == 0)
                if (myArr[1] == 50)
                    if (myArr[2] != 0)
                        if (myArr[3] == myArr[2]) {
                            // serial.writeLine("HEADER PASS");
                            // serial.writeNumber(myArr[3]);
                            // serial.writeLine('\n')
                            // if (myArr[3] == (myArr.length - 4))
                            // serial.writeLine(myArr.length.toString())
                            let tempArrData: number[] = []
                            for (let i = 0; i < myArr[3]; i++) {
                                tempArrData.push(myArr[i + 4]);
                                tempStringData += String.fromCharCode(myArr[i + 4])
                            }
                            // serial.writeNumbers(tempArrData);
                            // serial.writeLine(tempStringData);
                            // tempStringData = tempArrData.join("");
                        }
            /**
             * end
             */

            isEmptyData = true;

        }
        // Nếu có dữ liệu, thực hiện xử lý
        if (tempStringData.length > 0) {
            control.waitMicros(10000);  // Tạm dừng trước khi gửi dữ liệu qua serial

            // Kiểm tra và xử lý dữ liệu nếu là lệnh Virtual Pin RX
            if (tempStringData.indexOf(BLYNK_I2C_CMD_VIRTUAL_PIN_RX) !== -1) {

                // Tách chuỗi bằng cách loại bỏ chữ "EATR"
                let parts = tempStringData.split(" "); // Chia chuỗi thành mảng dựa vào khoảng trắng
                let pin = parseInt(parts[1]); // Lấy phần tử thứ 2 và chuyển thành số nguyên
                let value = parseFloat(parts[2]); // Lấy phần tử thứ 3 và chuyển thành số thực (float)

                callback(pin, value);

            }
        }
        tempStringData = '';
    }
}

