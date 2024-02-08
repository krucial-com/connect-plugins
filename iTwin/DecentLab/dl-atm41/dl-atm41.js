/* https://www.decentlab.com/products/eleven-parameter-weather-station-for-lorawan */
let weatherstation_decoder = {
    PROTOCOL_VERSION: 2,
    SENSORS: [
        {length: 17,
            values: [{name: 'solar_radiation',
                displayName: 'Solar radiation',
                convertVal: function (val) { return val - 32768; },
                unit: 'W⋅m⁻²'},
                {name: 'precipitation',
                    displayName: 'Precipitation',
                    convertVal: function (val) { return (val - 32768) / 1000; },
                    unit: 'mm'},
                {name: 'lightning_strike_count',
                    displayName: 'Lightning strike count',
                    convertVal: function (val) { return val - 32768; }},
                {name: 'lightning_average_distance',
                    displayName: 'Lightning average distance',
                    convertVal: function (val) { return val - 32768; },
                    unit: 'km'},
                {name: 'wind_speed',
                    displayName: 'Wind speed',
                    convertVal: function (val) { return (val - 32768) / 100; },
                    unit: 'm⋅s⁻¹'},
                {name: 'wind_direction',
                    displayName: 'Wind direction',
                    convertVal: function (val) { return (val - 32768) / 10; },
                    unit: '°'},
                {name: 'maximum_wind_speed',
                    displayName: 'Maximum wind speed',
                    convertVal: function (val) { return (val - 32768) / 100; },
                    unit: 'm⋅s⁻¹'},
                {name: 'air_temperature',
                    displayName: 'Air temperature',
                    convertVal: function (val) { return (val - 32768) / 10; },
                    unit: '°C'},
                {name: 'vapor_pressure',
                    displayName: 'Vapor pressure',
                    convertVal: function (val) { return (val - 32768) / 100; },
                    unit: 'kPa'},
                {name: 'atmospheric_pressure',
                    displayName: 'Atmospheric pressure',
                    convertVal: function (val) { return (val - 32768) / 100; },
                    unit: 'kPa'},
                {name: 'relative_humidity',
                    displayName: 'Relative humidity',
                    convertVal: function (val) { return (val - 32768) / 10; },
                    unit: '%'},
                {name: 'sensor_temperature_internal',
                    displayName: 'Sensor temperature (internal)',
                    convertVal: function (val) { return (val - 32768) / 10; },
                    unit: '°C'},
                {name: 'x_orientation_angle',
                    displayName: 'X orientation angle',
                    convertVal: function (val) { return (val - 32768) / 10; },
                    unit: '°'},
                {name: 'y_orientation_angle',
                    displayName: 'Y orientation angle',
                    convertVal: function (val) { return (val - 32768) / 10; },
                    unit: '°'},
                {name: 'compass_heading',
                    displayName: 'Compass heading',
                    convertVal: function (val) { return val - 32768; },
                    unit: '°'},
                {name: 'north_wind_speed',
                    displayName: 'North wind speed',
                    convertVal: function (val) { return (val - 32768) / 100; },
                    unit: 'm⋅s⁻¹'},
                {name: 'east_wind_speed',
                    displayName: 'East wind speed',
                    convertVal: function (val) { return (val - 32768) / 100; },
                    unit: 'm⋅s⁻¹'}]},
        {length: 1,
            values: [{name: 'battery_voltage',
                displayName: 'Battery voltage',
                convertVal: function (val) { return val / 1000; },
                unit: 'V'}]}
    ],

    read_int: function (bytes, pos) {
        return (bytes[pos] << 8) + bytes[pos + 1];
    },

    decode: function (bytes, recvTime) {
        let version = bytes[0];

        if (version !== this.PROTOCOL_VERSION) {
            return {
                data: {},
                errors: ["protocol version " + version + " doesn't match v2"],
                warnings: []
            };
        }

        let deviceId = this.read_int(bytes, 1);
        let flags = this.read_int(bytes, 3);
        let result = {'protocol_version': version, 'device_id': deviceId};

        let pos = 5;

        for (let i = 0; i < this.SENSORS.length; i++, flags >>= 1) {
            if ((flags & 1) !== 1)
                continue;

            let convertedVals = [];

            for (let j = 0; j < this.SENSORS[i].length; j++) {
                convertedVals.push(this.read_int(bytes, pos));
                pos += 2;
            }

            for (let k = 0; k < this.SENSORS[i].values.length; k++) {
                let value = this.SENSORS[i].values[k];

                if ('convertVal' in value) {
                    result[value.name] = {displayName: value.displayName,
                        value: value.convertVal(convertedVals[k])};
                    if ('unit' in value)
                        result[value.name]['unit'] = value.unit;
                }
            }
        }

        result['timestamp'] = recvTime;

        return {
            data: result,
            errors: [],
            warnings: []
        };
    }
};

function decodeUplink(input) {
    return weatherstation_decoder.decode(input.bytes, input.recvTime)
}
