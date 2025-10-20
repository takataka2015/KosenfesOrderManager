import FilePathJson from "./filePathConfig.json";

class OrderFile{
    get Now():string{
        return FilePathJson.filePlace+FilePathJson.fileName.now;
    }
    get History():string{
        return FilePathJson.filePlace+FilePathJson.fileName.history;
    }
}

export class FilePath{
    order:OrderFile=new OrderFile();
    get Attendance():string{
        return FilePathJson.filePlace+FilePathJson.fileName.attend;
    }
}