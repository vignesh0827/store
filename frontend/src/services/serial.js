/**
 * Serial Service for Web Serial API
 * Handles connection to RS-232 weighing scales
 */

class SerialService {
    constructor() {
        this.port = null;
        this.reader = null;
        this.keepReading = false;
        this.onDataReceived = null;
    }

    /**
     * Request a connection to a serial port
     * Requires a user gesture (click)
     */
    async connect(baudRate = 9600) {
        if (!("serial" in navigator)) {
            throw new Error("Web Serial API not supported in this browser.");
        }

        try {
            this.port = await navigator.serial.requestPort();
            await this.port.open({ baudRate });
            this.keepReading = true;
            this.readLoop();
            return true;
        } catch (error) {
            console.error("Serial Connection Error:", error);
            throw error;
        }
    }

    /**
     * Continuous read loop
     */
    async readLoop() {
        while (this.port?.readable && this.keepReading) {
            this.reader = this.port.readable.getReader();
            try {
                while (true) {
                    const { value, done } = await this.reader.read();
                    if (done) break;

                    if (this.onDataReceived && value) {
                        // Convert Uint8Array to string
                        const textDecoder = new TextDecoder();
                        const decodedData = textDecoder.decode(value);
                        this.onDataReceived(decodedData);
                    }
                }
            } catch (error) {
                console.error("Read error:", error);
            } finally {
                this.reader.releaseLock();
            }
        }
    }

    /**
     * Parse typical weighing scale output strings
     * Often format: '  2.345 KG\r\n'
     */
    parseWeight(dataString) {
        // Regex to find numbers including decimals
        const match = dataString.match(/[-+]?\d*\.?\d+/);
        return match ? parseFloat(match[0]) : null;
    }

    async disconnect() {
        this.keepReading = false;
        if (this.reader) {
            await this.reader.cancel();
        }
        if (this.port) {
            await this.port.close();
            this.port = null;
        }
    }
}

export const serialSvc = new SerialService();
