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

interface SerialBlynkI2CData {
    id: string;
    modeId: string;
    lenData: number;
    checkSumData: number;
    data: string;
}


namespace BlynkGate {
    const KXN_BYTE_PER_TIME_SEND = 32;
    const slaveAddress = 74; // Địa chỉ I2C của thiết bị slave
    const BLYNK_I2C_CMD_VIRTUAL_PIN_TX: string = "ATW";



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

    export function virtualWrite(vx_: number, strValue_: string): void {
        let tempStr = BLYNK_I2C_CMD_VIRTUAL_PIN_TX;
        tempStr += " ";
        tempStr += vx_.toString();
        tempStr += " ";
        tempStr += strValue_;
        tempStr += "\n";
        console.log(tempStr);
        DBSerial(tempStr);
        SetupCharArrayToBuffer4(tempStr,tempStr.length);
        // SendStringToI2C(tempStr);
    }

    function I2C_writeString(myAdd: number, myString: string, myLen: number): void {
        pins.i2cWriteBuffer(myAdd, pins.createBufferFromArray(myString.split('').map(c => c.charCodeAt(0))));
        control.waitMicros(1000);
    }

    function DBSerial(message: string): void {
        serial.writeLine(message);
    }

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

