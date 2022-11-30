import AdmZip from 'adm-zip';

export class ZipManager {
  private static _instance: ZipManager;
  private _zip: any;

  private constructor() {
    this._zip = new AdmZip(); 
  }

  public static get Zip() {
    this._instance = this._instance || (this._instance = new this());
    return this._instance._zip;
  }

  public static async compress(folderPath: string, s3FolderName: string, userFolderName: string) {
    try {
      const outputFile = `tmp/${userFolderName}/${s3FolderName}.zip`;
      ZipManager.Zip.addLocalFolder(folderPath);
      ZipManager.Zip.writeZip(outputFile);
      return true;
    } catch (err) {
      return false;
    }
  }
}
