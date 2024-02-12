/**
 * (c) Krucial 2024
 * Example codec for iTwin providing decode functionality only
 */

/**
 * payloadDecoder - decodes battery and distance measurements for an example connect iTwin compliant LoRa codec
 * @type {{readUInt16LE: (function(*): *), decode: ((function(*, *, *): ({data: {}, warnings: [], errors: [string]}))|*)}}
 */
let payloadDecoder = {
    decode: function (bytes, port, recvTime) {
        const decoded = {};
        if (port == 0x01) {
            decoded.battery_percentage = {"iTwin-value": bytes[0]};
            decoded.distance = {"iTwin-value": this.readUInt16LE(bytes.slice(1, 3))};
        } else {
            return {
                data: decoded,
                errors: ["Unable to decode packet. Unrecognised port."],
                warnings: []
            };
        }
        decoded.data.timestamp = recvTime;
        return {data: decoded, errors: [], warnings: []};
    }, readUInt16LE: function (bytes) {
        const value = (bytes[1] << 8) + bytes[0];
        return value & 0xffff;
    }
};

/**
 * LoRaWAN compliant decoder
 * https://resources.lora-alliance.org/home/lorawan-payload-codec-api
 * @param input {bytes[]: int, port: int, recvTime: int}
 * @returns {{data: {}, warnings: [], errors: [string]}|{data: {}, warnings: [], errors: []}}
 */
function decodeUplink(input) {
    let res = payloadDecoder.decode(input.bytes, input.port, input.recvTime);
    return res;
}