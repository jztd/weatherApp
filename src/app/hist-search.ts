import {HistObject} from './hist-object';

// container for the yearly data at a given location
export class HistSearch {
    public accessDate: number;
    public cityName: string;
    public latitude: number;
    public longitude: number;
    public data: HistObject[];
}
