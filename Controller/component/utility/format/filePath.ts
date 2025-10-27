import FilePathJson from "../fileConfig/filePathConfig.json";

/**
 * informationLog内を参照するためのクラス
 */
export class FilePath {
    /**
     * 現在ある注文のjsonパス
     */
    static get Now(): string {
        return FilePathJson.filePlace + FilePathJson.fileName.now + ".json";
    }
    /**
     * 注文履歴のjsonパス
     */
    static get History(): string {
        return FilePathJson.filePlace + FilePathJson.fileName.history + ".json";
    }
    /**
     * 注文取消しリクエストのjsonパス
     */
    static get Request(): string {
        return FilePathJson.filePlace + FilePathJson.fileName.request + ".json";
    }
    /**
     * タイムカードのjsonパス
     */
    static get Attendance(): string {
        return FilePathJson.filePlace + FilePathJson.fileName.attend + ".json";
    }
}