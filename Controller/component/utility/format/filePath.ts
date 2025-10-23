import FilePathJson from "../fileConfig/filePathConfig.json";

class OrderFile {
    /**
     * 現在ある注文のjsonパス
     */
    get Now(): string {
        return FilePathJson.filePlace + FilePathJson.fileName.now + ".json";
    }
    /**
     * 注文履歴のjsonパス
     */
    get History(): string {
        return FilePathJson.filePlace + FilePathJson.fileName.history + ".json";
    }
    /**
     * 注文取消しリクエストのjsonパス
     */
    get Request(): string {
        return FilePathJson.filePlace + FilePathJson.fileName.request + ".json";
    }
}

/**
 * informationLog内を参照するためのクラス
 */
export class FilePath {
    /**
     * 注文に関するパス
     */
    order: OrderFile = new OrderFile();
    /**
     * タイムカードのjsonパス
     */
    get Attendance(): string {
        return FilePathJson.filePlace + FilePathJson.fileName.attend + ".json";
    }
}