//% color=#FF6EC7 weight=100 icon="\uf004" block="Rainbow Sparkle Unicorn"
//% category="Rainbow Sparkle Unicorn"
//% subcategories='["Touch", "Switch", "Sound", "Light", "Sliders / Dials / Spinners" ,"Movement", "IoT", "Expert"]'
namespace RSU {

    let alreadyStarted = false;
    let redirectedToUSB = false;

    //% block="Start Rainbow Sparkle Unicorn"
    export function start(): void {

        //prevent running more than once
        if (alreadyStarted == true) {
            return;
        } else {
            alreadyStarted = true;
        }

        const TxBufferSize: number = 128;
        const RxBufferSize: number = 128;

        serial.redirect(SerialPin.P14, SerialPin.P15, BaudRate.BaudRate115200);
        serial.setTxBufferSize(TxBufferSize);
        serial.setRxBufferSize(RxBufferSize);

        //add 1s for UART ready to support Micro:bit V2
        basic.pause(1000);

        //reboot ESP32
        sendMessage("RESTART");

        //was 500,but 1000 seems more stable - time the ESP32 takes to reboot
        basic.pause(1000);

        //add the serial data recieve handler
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), () => {

            let msgrecieved = serial.readUntil(serial.delimiters(Delimiters.NewLine));

            //this tiny pause improves the stability soo much
            basic.pause(1);

            readMessage(msgrecieved);
        });

    }

    export function sendMessage(message: string): void {
        serial.writeString(message + String.fromCharCode(Delimiters.CarriageReturn));
    }

    const eventOffset = 1000;

    function readMessage(message: string): void {

        let messageParts = message.split(":");

        let topic: string = messageParts[0];
      
        switch (topic) {
            case "1":
                control.raiseEvent(999, parseInt(messageParts[1]) + eventOffset);
                break;
            case "2":
                control.raiseEvent(666, parseInt(messageParts[1]) + eventOffset);
                break;
        }
    }

}