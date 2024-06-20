import { ProjectSync } from "./projectSync";

// 创建 ProjectSync 实例
const createProjectSync = (rootPath, user) => {
  const projectSync = new ProjectSync(
    rootPath,
    user,
    (filePath, content) => {
      console.log("File changed:", filePath, content);
    },
  );

  return projectSync;
};

// 测试文件同步操作
const testFileSync = async (projectSync, filePath, content) => {
  try {
    await projectSync.writeFile(filePath, content);
    const readContent = await projectSync.readFile(filePath);
    console.log(readContent);
  } catch (err) {
    console.error(err);
  }
};

export const syncTest = () => {
  const user = {
    id: "user1",
    name: "John Doe",
    color: "#ff0000"
  };
  const fileSync = createProjectSync("inform7", user);

  testFileSync(fileSync, "inform7/test.txt", "Hello, world!");

};

export const syncTestCo = () => {
  const user = {
    id: "user2",
    name: "Jane Doe",
    color: "#00ff00"
  };
  const fileSync = createProjectSync("inform7", user);

  testFileSync(fileSync, "inform7/test22.txt", "Hello, world!");
};
