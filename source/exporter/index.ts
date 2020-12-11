import * as fs from 'fs'
import * as path from 'path'
import { EType } from '../types';
import parseCan from '../parser/parse-can'
import parseGps from '../parser/parse-gps'
import { type } from 'os';


export function exportTest(canInputFilename: string | undefined, gpsInputFilename: string | undefined, outputFilename: string) {
    const result: { [id: string]: any[] } = {}
    const callback = (props: string[], value: any) => {
        if (result[props.join('.')]) {
            result[props.join('.')].push(value);
        } else {
            result[props.join('.')] = [value];
        }
    };

    if (canInputFilename) {
        const lines = fs.readFileSync(canInputFilename).toString().split('\n');
        for (const line of lines) {
            parseCan(line, callback)
        }
    }
    if (gpsInputFilename) {
        const lines = fs.readFileSync(gpsInputFilename).toString().split('\n');
        for (const line of lines) {
            parseGps(line, callback)
        }
    }

    const output: { message: string, values: any[] }[] = []
    for (const key in result) {
        output.push({
            message: key,
            values: result[key]
        })
    }
    fs.writeFileSync(outputFilename, JSON.stringify(output));
}

export function exportJSON(canInputFilename: string | undefined, gpsInputFilename: string | undefined, outputFilename: string) {
    const result: object = {}
    const callback = (props: string[], value: any, timestamp: Date) => {
        let tempRes: any = result;
        let key = props.pop()!;
        for (const p of props) {
            if (tempRes[p] === undefined) {
                tempRes[p] = {} as any;
            }
            tempRes = tempRes[p];
        }

        if (tempRes[key]) {
            tempRes[key].push({
                timestamp: timestamp,
                value: value
            });
        } else {
            tempRes[key] = [{
                timestamp: timestamp,
                value: value
            }];
        }
    };

    if (canInputFilename) {
        const lines = fs.readFileSync(canInputFilename).toString().split('\n');
        for (const line of lines) {
            parseCan(line, (p, v) => callback(p, v, new Date()));
        }
    }
    if (gpsInputFilename) {
        const lines = fs.readFileSync(gpsInputFilename).toString().split('\n');
        for (const line of lines) {
            parseGps(line, (p, v) => callback(p, v, new Date()));
        }
    }
    fs.writeFileSync(outputFilename, JSON.stringify(result));
}

export function exportCSV(canInputFilename: string | undefined, gpsInputFilename: string | undefined, outputPath: string) {
    const result: { [id: string]: any[] } = {}
    const callback = (props: string[], value: any, timestamp: Date) => {
        let tempRes: any = result;
        let key = props.pop()!;
        for (const p of props) {
            if (tempRes[p] === undefined) {
                tempRes[p] = {} as any;
            }
            tempRes = tempRes[p];
        }

        if (tempRes[key]) {
            tempRes[key].push({
                timestamp: timestamp,
                value: value
            });
        } else {
            tempRes[key] = [{
                timestamp: timestamp,
                value: value
            }];
        }
    };

    if (canInputFilename) {
        const lines = fs.readFileSync(canInputFilename).toString().split('\n');
        for (const line of lines) {
            parseCan(line, (p, v) => callback(p, v, new Date()));
        }
    }
    if (gpsInputFilename) {
        const lines = fs.readFileSync(gpsInputFilename).toString().split('\n');
        for (const line of lines) {
            parseGps(line, (p, v) => callback(p, v, new Date()));
        }
    }

    recursiveCreateCSV(outputPath, result);
}

function recursiveCreateCSV(partialPath: string, partialResult: any) {
    for (const k in partialResult) {
        if (Array.isArray(partialResult[k])) {
            let header = undefined as string | undefined;
            const lines: string[] = partialResult[k].map((l: { timestamp: Date, value: any }) => {
                if (typeof l.value === 'object') {
                    if (!header) {
                        header = `timestamp\t${Object.keys(l.value).join('\t')}`;
                    }
                    return `timestamp\t${Object.keys(l.value).map(k => l.value[k]).join('\t')}`
                    
                } else {
                    if (!header) {
                        header = 'timestamp\tvalue';
                    }
                    return `${l.timestamp}\t${l.value}`;
                }
            })
            if (header) {
                lines.unshift(header);
                fs.writeFileSync(path.join(partialPath, `${k}.csv`), lines.join('\n'));
            }

        } else if (typeof partialResult[k] === 'object') {
            let dir = path.join(partialPath, k);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            recursiveCreateCSV(dir, partialResult[k]);
        }
    }
}