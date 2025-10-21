import FilePathJson from "../fileConfig/filePathConfig.json";

class OrderFile {
    get Now(): string {
        return FilePathJson.filePlace + FilePathJson.fileName.now + ".json";
    }
    get History(): string {
        return FilePathJson.filePlace + FilePathJson.fileName.history + ".json";
    }
}

export class FilePath {
    order: OrderFile = new OrderFile();
    get Attendance(): string {
        return FilePathJson.filePlace + FilePathJson.fileName.attend + ".json";
    }
}