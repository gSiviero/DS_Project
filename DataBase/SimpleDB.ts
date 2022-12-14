import { Md5 } from "ts-md5";

export class SimpleDB{
    db : any;
    /**Clock on the local machine when this Site was last updated.*/
    constructor(port:number){
        var JSONdb = require("simple-json-db");
        this.db = new JSONdb(`${__dirname}/storage-${port}.json`,{});
        this.db.JSON({});
    }

    insert(value:any):string{
        var id = value.id == undefined ? Md5.hashStr(`value ${Date()}`) : value.id;
        this.db.set(id, value.value);
        return id;
    }

    update(id:string,value:any){
        this.db.set(id, value);
    }

    get(id:string){
        return this.db.get(id) ?? "Not Found";
    }

    delete(id:string){
        if(this.db.has(id)){
            this.db.delete(id);
            return "Object Deleted"
        }
        return "Not Found"
    }

    restore(bkp:string){
        try{
        this.db.JSON(JSON.parse(bkp));
        this.db.sync();
        return "DB Restored";
        }
        catch(e){
            return e;
        }
    }

    clear(){
        try{
        this.db.JSON({});
        this.db.sync();
        return "DB Restored";
        }
        catch(e){
            return e;
        }
    }

    getBkp(){
        return this.db.JSON();
    }
}
