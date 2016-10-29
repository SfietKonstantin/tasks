export class FakeFile implements File {
    readonly lastModifiedDate: any;
    readonly name: string;
    readonly webkitRelativePath: string;
    readonly size: number;
    readonly type: string;
    fileReader: FakeFileReader
    constructor(type: string, fileReader: FakeFileReader) {
        this.type = type
        this.fileReader = fileReader
    }
    msClose(): void {
        throw new Error("Not mocked")
    }
    msDetachStream(): any {
        throw new Error("Not mocked")
    }
    slice(start?: number, end?: number, contentType?: string): Blob {
        throw new Error("Not mocked")
    }
    onload() {
        this.fileReader.onload(null)
    }
}

export class FakeFileReader {
    onload: (this: this, ev: any) => any
    readonly result: string
    constructor(result: string) {
        this.result = result
    }
    readAsText(blob: Blob, encoding?: string): void {
        throw new Error("Not mocked")
    }

}
