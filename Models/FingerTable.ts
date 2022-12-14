import { TypedEmitter } from 'tiny-typed-emitter';
import { Site, SiteI } from "./Site";
import {Mutex, MutexInterface, Semaphore, SemaphoreInterface, withTimeout} from 'async-mutex';

/**Event Interface
 * This is where all possible event types are defined.
 */
interface FingerTableEventsI {
    'failure': (el:SiteI) => void;
    'join': (el:SiteI) => void;
    'ready': () => void;
  }

/**Declaration of an Finger Table Site Entry Interface */
export interface FingerTableSiteI extends SiteI{
    clock:Date;
}

/**This class describes an entry in the finger table*/
export class FingerTableSite extends Site  implements FingerTableSiteI {
    /**Clock on the local machine when this Site was last updated.*/
    clock:Date;

    constructor(site:SiteI){
        super(site.ip,site.port,site.id,site.leader);
        this.timeStamp = site.timeStamp;
        this.clock = new Date();
    }
    
    /**Updates properties of the FingerTable Site. 
     * @param site Site containing the up to date states of the entry
    */
    updateTimeStamp(site:SiteI){
        this.timeStamp = site.timeStamp > this.timeStamp ? site.timeStamp : this.timeStamp;
        this.leader = site.leader;
        this.clock = new Date();
        this.client = site.client;
    }
}


/**Finger Table implementation */
export class FingerTable extends TypedEmitter<FingerTableEventsI>{
    /**Array of entries in the Finger table */
    private entries:FingerTableSite[];
    private secconds:number;
    private lock:Mutex;
    /**Constructor
     * @param seconds Number of seconds to declare a site failure.
     */
    constructor(seconds:number){
        super();
        this.secconds = seconds;
        this.entries = [];
        this.lock = new Mutex();
        setInterval(() => {
            this.removeFailuredEntries();
        },seconds * 1000);
    }

    /**Return all Entries in the Finger Table
     * @return Array of Entries
    */
    getEntries = ():FingerTableSiteI[] => this.entries.map((e) =>  e as FingerTableSiteI);

    /**Insert or update an entry in the finger table.
     * 
     * If an entry with the same Id is already in the fingertable it compares the Lamport Time Stamp.
     * If the new TimeStamp is greater than it updates the entry with the new TimeStamp as well as the the new Local Date Time.
     * 
     * @param {site} site  The Site to be updated or inserted
    */
    upsertEntry(site:SiteI):void{
        this.lock.acquire();
        var entry = this.getEntryById(site.id);
        if(entry == null){
            entry = new FingerTableSite(site);
            this.entries.push(entry);
            this.emit("join",entry);
        }
        entry.updateTimeStamp(site);
        this.sort();
        this.setLeader(site);
        this.lock.release();
    }

    sort = () => this.entries.sort((a,b) => a.id - b.id);

    /**Remove Failured Entries from Finger Table
     * 
     * After removing emmits an event ("failure") caring the list of failured entries.
    */
    removeFailuredEntries():void{
        this.lock.acquire();
        var timeCut = new Date();
        timeCut.setSeconds(timeCut.getSeconds() - this.secconds);
        var listOfFailures = this.entries.filter((e) => e.clock < timeCut);
        this.entries = this.entries.filter((e) => e.clock > timeCut);
        if(listOfFailures.length > 0)
            listOfFailures.forEach((s) => this.emit("failure", s));
        this.sort();
        this.lock.release();
    }

    /**Return a Finger Table Entry based on the Id.
     * @param id Id to be searched.
     * @return Finger Table Entry with matching Id, if there is none than returns null.
    */
    getEntryById(id:number):(FingerTableSite | null){
        var entries = this.entries.filter((e) => e.id == id);
        return entries.length > 0 ? entries[0] : null;
    }

    /**Return a Finger Table Entry based on the Id.
     * @param id Id to be searched.
     * @return Finger Table Entry with matching Id, if there is none than returns null.
    */
     removeEntryById(id:number){
        this.lock.acquire();
        this.entries = this.entries.filter((e) => e.id != id);
        this.lock.release();
    }

    /**Randomly Pic a  Site from the fingertable that is not it self or the sender of the original message.*/
    randomlyPickEntry(site:SiteI,sender:SiteI): (FingerTableSiteI | null){
        var servers = this.entries.filter((e) => site.id != e.id && sender.id != e.id );
        var index = Math.floor(Math.random() * servers.length);
        return servers[index];
    }

    /**
     * Returns a list of Sites that has smaller ids than the reference Id
     * @param id Reference Id
     * @returns List of Sites
     */
    getEntriesWithSmallerId = (id:number): FingerTableSiteI[] => this.entries.filter((n) => id  > n.id && !n.client);

    /**
     * Returns a list of Sites that has greater ids than the reference Id
     * @param id Reference Id
     * @returns List of Sites
     */
    getEntriesWithGreaterId = (id:number): FingerTableSiteI[] =>  this.entries.filter((n) => id < n.id && !n.client);

    /**
     * Returns the Leader Site
     * @returns Site
     */
    getLeader(): (FingerTableSiteI | null){
        var entries = this.entries.filter((n) => n.leader == true);
        return entries.length > 0 ? entries[0] : null;
    }

    /**
     * Returns the Leader Site
     * @returns Site
     */
    private setLeader(site:SiteI){
        this.entries.forEach((e) => {
            e.leader = site.id == e.id;
        })
    }

    
}
