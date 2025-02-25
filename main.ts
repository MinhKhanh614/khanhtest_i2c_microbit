let text = "Hello, world!"
let buffer = pins.createBuffer(text.length)

for (let i = 0; i < text.length; i++) {
    buffer.setNumber(NumberFormat.UInt8LE, i, text.charCodeAt(i))
}


let address = 74

pins.i2cWriteBuffer(address, buffer, false)

