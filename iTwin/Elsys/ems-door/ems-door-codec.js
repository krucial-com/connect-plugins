/*
______ _       _______     _______
|  ____| |     / ____\ \   / / ____|
| |__  | |    | (___  \ \_/ / (___
|  __| | |     \___ \  \   / \___ \
| |____| |____ ____) |  | |  ____) |
|______|______|_____/   |_| |_____/

ELSYS simple payload decoder.
Use it as it is or remove the bugs :)
www.elsys.se
peter@elsys.se

Modified by Krucial for direct use with Connect iTwin Plugin
Original generic JavaScript implementation available here: https://www.elsys.se/en/elsys-payload/

*/

let elsysDecoder= {
    TYPE_TEMP: 0x01,
    TYPE_RH: 0x02,
    TYPE_ACC:0x03,
    TYPE_LIGHT: 0x04,
    TYPE_MOTION: 0x05,
    TYPE_CO2: 0x06,
    TYPE_VDD: 0x07,
    TYPE_ANALOG1: 0x08,
    TYPE_GPS: 0x09,
    TYPE_PULSE1: 0x0A,
    TYPE_PULSE1_ABS: 0x0B,
    TYPE_EXT_TEMP1: 0x0C,
    TYPE_EXT_DIGITAL: 0x0D,
    TYPE_EXT_DISTANCE: 0x0E,
    TYPE_ACC_MOTION: 0x0F,
    TYPE_IR_TEMP: 0x10,
    TYPE_OCCUPANCY: 0x11,
    TYPE_WATERLEAK: 0x12,
    TYPE_GRIDEYE: 0x13,
    TYPE_PRESSURE: 0x14,
    TYPE_SOUND: 0x15,
    TYPE_PULSE2: 0x16,
    TYPE_PULSE2_ABS: 0x17,
    TYPE_ANALOG2: 0x18,
    TYPE_EXT_TEMP2: 0x19,
    TYPE_EXT_DIGITAL2: 0x1A,
    TYPE_EXT_ANALOG_UV: 0x1B,
    TYPE_DEBUG: 0x3D,

    bin16dec: function(bin){
        let num= bin&0xFFFF;
        if (0x8000 & num)
            num = - (0x010000 - num);
        return num;
    },

    bin8dec: function (bin){
        let num = bin & 0xFF;
        if (0x80 & num)
            num = -(0x0100 - num);

        return num;
    },

    decode: function(data, recvTime){
        let obj = {};
        for (let i = 0; i < data.length; i++) {
            let t1;
            let t2;
            let temp;
            let t;
            let pulseAbs;
            let rh;
            let iTemp;
            let eTemp;
            let ref;

            switch (data[i]) {
                case this.TYPE_TEMP:
                    t1 = (data[i + 1] << 8) | (data[i + 2]);
                    t1 = this.bin16dec(t1);
                    obj.temperature = t1 / 10;
                    i += 2;
                    break;
                case this.TYPE_RH:
                    rh = (data[i + 1]);
                    obj.humidity = rh;
                    i += 1;
                    break;
                case this.TYPE_ACC:
                    obj.x = {"iTwin-value":  this.bin8dec(data[i + 1])};
                    obj.y = {"iTwin-value": this.bin8dec(data[i + 2])};
                    obj.z = {"iTwin-value": this.bin8dec(data[i + 3])};
                    i += 3;
                    break;
                case this.TYPE_LIGHT:
                    obj.light = (data[i + 1] << 8) | (data[i + 2]);
                    i += 2;
                    break;
                case this.TYPE_MOTION:
                    obj.motion = (data[i + 1]);
                    i += 1;
                    break;
                case this.TYPE_CO2:
                    obj.co2 = (data[i + 1] << 8) | (data[i + 2]);
                    i += 2;
                    break;
                case this.TYPE_VDD:
                    obj.V = {"iTwin-value": (data[i + 1] << 8) | (data[i + 2])};
                    i += 2;
                    break;
                case this.TYPE_ANALOG1:
                    obj.analog1 = (data[i + 1] << 8) | (data[i + 2]);
                    i += 2;
                    break;
                case this.TYPE_GPS:
                    i++;
                    obj.lat = (data[i] | data[i + 1] << 8 | data[i + 2] << 16 | (data[i + 2] && 0x80 ? 0xFF << 24 : 0)) / 10000;
                    obj.long = (data[i + 3] | data[i + 4] << 8 | data[i + 5] << 16 | (data[i + 5] && 0x80 ? 0xFF << 24 : 0)) / 10000;
                    i += 5;
                    break;
                case this.TYPE_PULSE1:
                    obj.pulse1 = (data[i + 1] << 8) | (data[i + 2]);
                    i += 2;
                    break;
                case this.TYPE_PULSE1_ABS:
                    pulseAbs = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
                    obj.pulses = {"iTwin-value": pulseAbs};
                    i += 4;
                    break;
                case this.TYPE_EXT_TEMP1:
                    t2 = (data[i + 1] << 8) | (data[i + 2]);
                    t2 = this.bin16dec(t2);
                    obj.externalTemperature = t2 / 10;
                    i += 2;
                    break;
                case this.TYPE_EXT_DIGITAL:
                    obj.digital = (data[i + 1]);
                    i += 1;
                    break;
                case this.TYPE_EXT_DISTANCE:
                    obj.distance = (data[i + 1] << 8) | (data[i + 2]);
                    i += 2;
                    break;
                case this.TYPE_ACC_MOTION:
                    obj.acceleration_x = {"iTwin-value": (data[i + 1])};
                    i += 1;
                    break;
                case this.TYPE_IR_TEMP:
                    iTemp = (data[i + 1] << 8) | (data[i + 2]);
                    iTemp = this.bin16dec(iTemp);
                    eTemp = (data[i + 3] << 8) | (data[i + 4]);
                    eTemp = this.bin16dec(eTemp);
                    obj.irInternalTemperature = iTemp / 10;
                    obj.irExternalTemperature = eTemp / 10;
                    i += 4;
                    break;
                case this.TYPE_OCCUPANCY:
                    obj.occupancy = (data[i + 1]);
                    i += 1;
                    break;
                case this.TYPE_WATERLEAK:
                    obj.waterleak = (data[i + 1]);
                    i += 1;
                    break;
                case this.TYPE_GRIDEYE:
                    ref = data[i + 1];
                    i++;
                    obj.grideye = [];
                    for (let j = 0; j < 64; j++) {
                        obj.grideye[j] = ref + (data[1 + i + j] / 10.0);
                    }
                    i += 64;
                    break;
                case this.TYPE_PRESSURE:
                    t = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
                    obj.pressure = t / 1000;
                    i += 4;
                    break;
                case this.TYPE_SOUND:
                    obj.soundPeak = data[i + 1];
                    obj.soundAvg = data[i + 2];
                    i += 2;
                    break;
                case this.TYPE_PULSE2:
                    obj.pulse2 = (data[i + 1] << 8) | (data[i + 2]);
                    i += 2;
                    break;
                case this.TYPE_PULSE2_ABS:
                    obj.pulseAbs2 = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
                    i += 4;
                    break;
                case this.TYPE_ANALOG2:
                    obj.analog2 = (data[i + 1] << 8) | (data[i + 2]);
                    i += 2;
                    break;
                case this.TYPE_EXT_TEMP2:
                    temp = (data[i + 1] << 8) | (data[i + 2]);
                    temp = this.bin16dec(temp);
                    if (typeof obj.externalTemperature2 === "number") {
                        obj.externalTemperature2 = [obj.externalTemperature2];
                    }
                    if (typeof obj.externalTemperature2 === "object") {
                        obj.externalTemperature2.push(temp / 10);
                    } else {
                        obj.externalTemperature2 = temp / 10;
                    }
                    i += 2;
                    break;
                case this.TYPE_EXT_DIGITAL2:
                    obj.digital2 = (data[i + 1]);
                    i += 1;
                    break;
                case this.TYPE_EXT_ANALOG_UV:
                    obj.analogUv = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
                    i += 4;
                    break;
                default:
                    i = data.length;
                    return {
                        data: {},
                        errors: ["There has been an issue decoding the data."],
                        warnings: []
                    };
            }
        }

        return {
            data: obj,
            errors: [],
            warnings: []
        };
    }
};

function decodeUplink(input){
    let res = elsysDecoder.decode(input.bytes, input.recvTime);

    if(Object.getOwnPropertyNames(res.data).length !== 0){
        if(!res.data.hasOwnProperty("x")){
            res.data.x = {"iTwin-value": -999999.0};
        }

        if(!res.data.hasOwnProperty("y")){
            res.data.y = {"iTwin-value": -999999.0};
        }

        if(!res.data.hasOwnProperty("z")){
            res.data.z = {"iTwin-value": -999999.0};
        }

        if(!res.data.hasOwnProperty("V")){
            res.data.V = {"iTwin-value": -999999.0};
        }

        if(!res.data.hasOwnProperty("pulses")){
            res.data.pulses = {"iTwin-value": -999999.0};
        }

        if(!res.data.hasOwnProperty("acceleration_x")){
            res.data.acceleration_x = {"iTwin-value": -999999.0};
        }

        res.data.timestamp = input.recvTime;
    }

    return res;
}

