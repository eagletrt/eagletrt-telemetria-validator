import { zweiComplement } from './zweiComplement';

export type CanMessageParser = (msg: number[]) => any;

export const PARSERS: Record<string, CanMessageParser> = {
    /* INVERTERS */
    // (Value / max value) * max rpm
    PARSE_INVERTERS_SPEED: msg => (zweiComplement((msg[2] << 8) + msg[1]) / 32767) * 7000.0,
    PARSE_INVERTERS_TEMPERATURE_IGBT: msg => ((msg[2] << 8) + msg[1] - 15_797) / 112.1182,
    PARSE_INVERTERS_TEMPERATURE_MOTORS: msg => ((msg[2] << 8) + msg[1] - 9393.9) / 55.1,
    // (Value/max value) = percentage of torque requested
    PARSE_INVERTERS_TORQUE: msg => zweiComplement((msg[2] << 256) + msg[1]) / 32767.0,

    /* BMS_HV */
    PARSE_BMS_HV_VOLTAGE: msg => ({
        total: ((msg[1] << 16) + (msg[2] << 8) + msg[3]) / 10_000,
        max: ((msg[4] << 8) + msg[5]) / 10_000,
        min: ((msg[6] << 8) + msg[7]) / 10_000
    }),
    PARSE_BMS_HV_TEMPERATURE: msg => ({
        average: ((msg[1] << 8) + msg[2]) / 100,
        max: ((msg[3] << 8) + msg[4]) / 100,
        min: ((msg[5] << 8) + msg[6]) / 100
    }),
    PARSE_BMS_HV_CURRENT: msg => ({
        current: ((msg[1] << 8) + msg[2]) / 10,
        pow: (msg[3] << 8) + msg[4]
    }),
    PARSE_BMS_HV_ERROR_WARNINGS: msg => ({
        fault_id: msg[1],
        fault_index: Math.abs(msg[2] / 10)
    }),

    /* BMS_LV*/
    PARSE_BMS_LV_VALUES: msg => ({
        temperature: msg[2] / 5,
        voltage: msg[0] / 10
    }),

    /* IMU OLD */
    PARSE_IMU_OLD_ACCEL: msg => {
        const scale = msg[7];
        return {
            x: ((msg[1] << 8) + msg[2]) / 100 - scale,
            y: ((msg[3] << 8) + msg[4]) / 100 - scale,
            z: ((msg[5] << 8) + msg[6]) / 100 - scale,
            scale: scale
        };
    },
    PARSE_IMU_OLD_GYRO: msg => {
        const scale = msg[7] * 10;
        return {
            x: ((msg[1] << 8) + msg[2]) / 10 - scale,
            y: ((msg[3] << 8) + msg[4]) / 10 - scale,
            z: ((msg[5] << 8) + msg[6]) / 10 - scale,
            scale: scale
        };
    },

    /* IMU */
    PARSE_IMU: msg => ({
        x: zweiComplement((msg[0] << 8) + msg[1]) / 100,
        y: zweiComplement((msg[2] << 8) + msg[3]) / 100,
        z: zweiComplement((msg[4] << 8) + msg[5]) / 100
    }),

    /* STEERING WHEEL ENCODER */
    PARSE_STEERING_WHEEL_ENCODER: msg => ((msg[1] << 8) + msg[2]) / 100,

    /* PEDALS */
    PARSE_PEDALS_THROTTLE: msg => msg[1],
    PARSE_PEDALS_BRAKE: msg => ({
        is_breaking: msg[1],
        pressure_front: ((msg[2] << 8) + msg[4]) / 500,
        pressure_back: ((msg[5] << 8) + msg[7]) / 500
    }),

    /* FRONT_WHEELS_ENCODERS */
    PARSE_FRONT_WHEELS_ENCODERS_SPEED_RADS: msg => ({
        left: (msg[0] << 16) + (msg[1] << 8) + msg[2] * (msg[6] == 1 ? 1 : -1),
        right: (msg[3] << 16) + (msg[4] << 8) + msg[5] * (msg[7] == 1 ? 1 : -1)
    }),
    PARSE_FRONT_WHEELS_ENCODERS_ROTATION_AND_KM: msg => ({
        rotations: (msg[0] << 16) + (msg[1] << 8) + msg[2],
        km: (msg[3] << 16) + (msg[4] << 8) + msg[5]
    }),

    /* STEERING_WHEEL_GEARS */
    STEERING_WHEEL_GEARS: msg => ({
        control: msg[1],
        cooling: msg[2],
        map: msg[3]
    })
};
