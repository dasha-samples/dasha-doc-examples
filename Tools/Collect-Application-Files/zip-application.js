const fs = require("fs/promises")
const glob = require("glob")
const path = require("path")
const JSZip = require("jszip")

function removeDslComments(dslFileContent) {
  return dslFileContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "").trim();
}

function parseDslImports(dslFileContent) {
  const importRE = /import "(.*)"/g;
  const content = removeDslComments(dslFileContent);
  let match;
  const matches = [];
  while ((match = importRE.exec(content)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

function findSingleAppConfig(directory) {
  let files = glob.sync(`${directory}/*.dashaapp`);
  files = files.filter(async (f) => (await fs.lstat(f)).isFile());
  if (files.length === 0) throw new Error(`No .dashaapp file was detected in path '${directory}'`);
  if (files.length > 1)
    throw new Error(`Multiple .dashaapp files were detected: ${files.join(", ")}`);
  const dashaappFilePath = files[0];
  return dashaappFilePath;
}

async function parseValidateAppConfig(appConfigPath) {
  let config;
  try {
    config = JSON.parse(await fs.readFile(appConfigPath, "utf-8"));
  } catch (e) {
    throw new Error(`Could not parse .dashaapp config file: ${e.message}`);
  }
  if (config.dialogue?.file === undefined) throw new Error(`Dsl root file is not defined`);
  if (config.nlg?.file === undefined) throw new Error(`Nlg file is not defined`)
  if (config.nlg?.signatureFile === undefined) throw new Error(`Nlg signature file is not defined`)
  return config;
}

async function collectDslFilePathsInner(dslFilePath, result) {
  await fs
    .lstat(dslFilePath)
    .catch((e) => {
      throw new Error(`File ${dslFilePath} was not found`);
    })
    .then((f) => {
      if (!f.isFile() || path.parse(dslFilePath).ext !== ".dsl") throw new Error(`${dslFilePath} is not a dsl file`);
    });
  if (result.includes(dslFilePath))
    throw new Error(`Found reference cycle starting at path ${dslFilePath}`);
  result.push(dslFilePath);

  const dslFileContent = await fs.readFile(dslFilePath, "utf-8");
  const importedRelPaths = parseDslImports(dslFileContent);

  for (const relPath of importedRelPaths) {
    const absPath = path.resolve(path.parse(dslFilePath).dir, relPath);
    await collectDslFilePathsInner(absPath, result);
  }
}

async function collectDslFilePaths(mainFilePath) {
  const result = [];
  await collectDslFilePathsInner(mainFilePath, result);
  return result;
}

function getRootFolder(filePaths) {
  if (filePaths.length === 1) return path.dirname(filePaths[0]);
  const rootFolderSplit = filePaths.reduce((prev, cur, curInd) => {
    cur = path.normalize(cur).split(path.sep);
    if (curInd === 1) prev = path.normalize(prev).split(path.sep);
    const largest = prev.length > cur.length ? prev : cur;
    for (const ind in largest) {
      if (cur[ind] != prev[ind]) return prev.slice(0, ind);
    }
    return cur;
  });
  let rootFolder = (rootFolderSplit).join(path.sep);
  if (!rootFolder.includes(path.sep)) rootFolder += path.sep;
  return rootFolder;
}

async function zipApplication(appFolderPath) {
  const dashaappFilePathAbs = path.resolve(findSingleAppConfig(appFolderPath));
  /** collect absolute paths of application files */
  const appConfig = await parseValidateAppConfig(dashaappFilePathAbs);
  const resolveConfigPath = (p) => {
    const relPath = path.join(path.parse(dashaappFilePathAbs).dir, p);
    return path.resolve(relPath);
  };
  const appFilePathsAbs = {
    mainDsl: resolveConfigPath(appConfig.dialogue.file),
    phrasemap: resolveConfigPath(appConfig.nlg.file),
    signatureFile: resolveConfigPath(appConfig.nlg.signatureFile),
    dataset:
      appConfig.nlu.customIntents?.file === undefined
        ? undefined
        : resolveConfigPath(appConfig.nlu.customIntents?.file),
  };
  /** collect dependent dsl files recursively */
  const dslFilePathsAbs = await collectDslFilePaths(appFilePathsAbs.mainDsl);
  const dslRootFolder = getRootFolder(dslFilePathsAbs);

  const zip = new JSZip();
  const createDslArchivePath = (p) => {
    p = path.join("__dsl_dialogue", path.relative(dslRootFolder, p));
    return p.split(path.sep).join(path.posix.sep);
  };
  const createArchivePath = (p) => {
    p = path.relative(path.resolve(appFolderPath), p);
    return p.split(path.sep).join(path.posix.sep);
  };
  /** add used files to zip */
  for (const p of dslFilePathsAbs) zip.file(createDslArchivePath(p), await fs.readFile(p, "utf-8"));
  const restFiles = [appFilePathsAbs.phrasemap, appFilePathsAbs.signatureFile];
  if (appFilePathsAbs.dataset !== undefined) restFiles.push(appFilePathsAbs.dataset);

  for (const p of restFiles) zip.file(createArchivePath(p), await fs.readFile(p, "utf-8"));
  /** substitute dsl entry point */
  appConfig.dialogue.file = createDslArchivePath(appFilePathsAbs.mainDsl);
  zip.file(
    path.relative(path.resolve(appFolderPath), dashaappFilePathAbs),
    JSON.stringify(appConfig)
  );
  return await zip.generateAsync({ type: "uint8array" });
}

module.exports = zipApplication;
