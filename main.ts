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

    interface BlynkReq {
        pin: number;
    }


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

    export function virtualWrite(vx_: number, strValue_: string): void {
        let tempStr = BLYNK_I2C_CMD_VIRTUAL_PIN_TX;
        tempStr += " ";
        tempStr += vx_.toString();
        tempStr += " ";
        tempStr += strValue_;
        tempStr += "\n";
        console.log(tempStr);
        DBSerial(tempStr);
        SetupCharArrayToBuffer4(tempStr, tempStr.length);
        // SendStringToI2C(tempStr);
    }

    export function I2C_writeString(myAdd: number, myString: string, myLen: number): void {
        pins.i2cWriteBuffer(myAdd, pins.createBufferFromArray(myString.split('').map(c => c.charCodeAt(0))));
        control.waitMicros(1000);
    }

    function DBSerial(message: string): void {
        serial.writeLine(message);
    }

    function splitString(motherString: string, command: string, startSymbol: string, stopSymbol: string, offset: number): string {
        let lenOfCommand = command.length;
        let posOfCommand = motherString.indexOf(command);

        // Kiểm tra nếu không tìm thấy command trong chuỗi
        if (posOfCommand === -1) return '';

        let posOfStartSymbol = motherString.indexOf(startSymbol, posOfCommand + lenOfCommand);

        // Kiểm tra nếu không tìm thấy startSymbol sau command
        if (posOfStartSymbol === -1) return '';

        while (offset > 0) {
            offset--;
            posOfStartSymbol = motherString.indexOf(startSymbol, posOfStartSymbol + 1);

            // Kiểm tra nếu không tìm thấy startSymbol sau offset
            if (posOfStartSymbol === -1) return '';
        }

        let posOfStopSymbol = motherString.indexOf(stopSymbol, posOfStartSymbol + 1);

        // Kiểm tra nếu không tìm thấy stopSymbol sau startSymbol
        if (posOfStopSymbol === -1) return '';

        // Trả về phần chuỗi từ startSymbol đến stopSymbol
        return motherString.substr(posOfStartSymbol + 1, posOfStopSymbol - posOfStartSymbol - 1);
    }



    export function SetupCharArrayToBuffer4(inputCharArray: string, len: number): void {
        const timeSend = Math.floor(len / KXN_BYTE_PER_TIME_SEND);

        for (let cf = 0; cf <= timeSend; cf++) {
            let temHeader: SerialBlynkI2CData = {
                id: '0',
                modeId: '2',
                // modeId: '1',
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

            DBSerial("subString: ");
            DBSerial(pSplitArray);
            DBSerial("temHeader->lenData: " + temHeader.lenData);

            temHeader.data = pSplitArray;
            const tempArrChar = temHeader.id + temHeader.modeId + String.fromCharCode(temHeader.lenData) + String.fromCharCode(temHeader.checkSumData) + temHeader.data;
            DBSerial(tempArrChar);
            I2C_writeString(slaveAddress, tempArrChar, temHeader.lenData + 4);
            control.waitMicros(1000);
        }
    }


    export function checkI2CThenSendSerial(): void {
        let dataString = "";
        let isEmptyData = false;

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
            tempCharHeader += String.fromCharCode(1);  // Thêm header (giống với `tempHeader` trong C++)
            serial.writeLine(tempCharHeader)
            I2C_writeString(slaveAddress, tempCharHeader, tempCharHeader.length);

            control.waitMicros(1000);  // Tạm dừng một chút để I2C trả lời

            let buffer = pins.i2cReadBuffer(slaveAddress, 32);  // Đọc dữ liệu từ I2C
            DBSerial(buffer.toHex());
            let countIndex = 0;

            while (buffer.length > countIndex) {
                let c = String.fromCharCode(buffer[countIndex]);
                tempCharHeader += c;

                // Kiểm tra điều kiện như trong C++
                if (countIndex > 3) {
                    if (tempHeader.lenData !== 0) {
                        if (countIndex < (tempHeader.lenData + 4)) {
                            dataString += c;  // Thêm dữ liệu vào chuỗi
                        }
                    } else {
                        isEmptyData = true;  // Không còn dữ liệu để nhận
                    }
                }
                countIndex++;
            }
            // DBSerial(tempCharHeader);
            DBSerial('\n');
        }
        // Nếu có dữ liệu, thực hiện xử lý
        if (dataString.length > 0) {
            control.waitMicros(10000);  // Tạm dừng trước khi gửi dữ liệu qua serial
            // DBSerial(dataString);

            // Kiểm tra và xử lý dữ liệu nếu là lệnh Virtual Pin RX
            if (dataString.indexOf(BLYNK_I2C_CMD_VIRTUAL_PIN_RX) === 0) {
                let tempVirtualPin = splitString(dataString, BLYNK_I2C_CMD_VIRTUAL_PIN_RX, " ", " ", 0);
                let valueTemp = splitString(dataString, BLYNK_I2C_CMD_VIRTUAL_PIN_RX, " ", " ", 1);

                // DBSerial(tempVirtualPin);
                // DBSerial(valueTemp);

                let request1 = { pin: parseInt(tempVirtualPin) };
                let param = { len: valueTemp.length, buff: valueTemp, buff_size: valueTemp.length };
            }
        }
    }
}

class KeyValuePair<K, V> {
    constructor(public key: K, public value: V) { }
}

class Queue<K, V> {
    private queue: KeyValuePair<K, V>[];
    private front: number;
    private rear: number;
    private count: number;
    private size: number;

    constructor(size: number) {
        this.queue = [];
        this.front = 0;
        this.rear = -1;
        this.count = 0;
        this.size = size;
    }

    enqueue(key: K, value: V): void {
        if (this.count === this.size) {
            // Queue is full
            console.log("Queue is full.");
        } else {
            for (let i = 0; i < this.count; i++) {
                if (this.queue[(this.front + i) % this.size].key === key) {
                    this.queue[(this.front + i) % this.size].value = value;
                    return;
                }
            }
            this.rear = (this.rear + 1) % this.size;
            this.queue[this.rear] = new KeyValuePair(key, value);
            this.count++;
        }
    }

    dequeue(): KeyValuePair<K, V> {
        if (this.count === 0) {
            // Queue is empty
            console.log("Queue is empty.");
            return new KeyValuePair<K, V>(null, null);
        } else {
            const kv = this.queue[this.front];
            this.front = (this.front + 1) % this.size;
            this.count--;
            return kv;
        }
    }

    getQueueSize(): number {
        return this.count;
    }
}

class BlynkWriteDefualt {
    Write() {
    }
}

// class externBlynkWriteDefualt extends BlynkWriteDefualt {
//     Write(vPin: )
// }
