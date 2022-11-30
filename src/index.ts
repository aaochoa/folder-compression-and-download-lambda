import * as fileSysEx from 'fs-extra';
import * as path from 'path';


import { AWSTools } from './utils/aws.wrapper';
import { ZipManager } from './utils/zip.wrapper';

export const handler = async (resource: any) => {
  const audios = resource.processed.flat();
  const { s3FolderName, userFolderName } = resource.data;
  const tmpDirPath = path.join(__dirname, `../tmp/${userFolderName}/`);
  const folderName = `${userFolderName}/${s3FolderName}`;
  fileSysEx.ensureDirSync(tmpDirPath);

  for (let audio of audios) {
    const tmpFilePath = `${tmpDirPath}/${audio.key}`;
    let folderAndFileName = audio.key.split('/');
    let fileExists = await AWSTools.fileExistsS3(folderName, folderAndFileName[2]);
    if (fileExists) {
      let bufferAudio = await AWSTools.downloadFromS3(folderName, folderAndFileName[2]);
      fileSysEx.outputFileSync(tmpFilePath, bufferAudio);
    }
  }

  let isTheZipFileCreated = await ZipManager.compress(tmpDirPath, s3FolderName, userFolderName);

  if (isTheZipFileCreated) {
    const zipFileName = `${s3FolderName}.zip`;
    const zipBuffer = fileSysEx.readFileSync(`${tmpDirPath}/${zipFileName}`);
    const audioResult: any = await AWSTools.uploadToS3(userFolderName, zipFileName, zipBuffer);
    const url = await AWSTools.getDownloadUrl(audioResult.key);
    fileSysEx.removeSync(tmpDirPath);
    return url;
  }
}