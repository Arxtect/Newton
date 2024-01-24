var ENGINE_PATH = new URL("./swiftlatexxetex.js", import.meta.url).toString();

export class CompileResult {
  constructor() {
    this.pdf = undefined;
    this.status = -254;
    this.log = "No log";
  }
}

export class XeTeXEngine {
  constructor() {
    this.latexWorker = undefined;
    this.latexWorkerStatus = 1; // Assuming Init is 1
  }

  async loadEngine() {
    if (this.latexWorker !== undefined) {
      throw new Error("Other instance is running, abort()");
    }
    this.latexWorkerStatus = 1; // Assuming Init is 1
    await new Promise((resolve, reject) => {
      this.latexWorker = new Worker(ENGINE_PATH);
      this.latexWorker.onmessage = (ev) => {
        const data = ev.data;
        const cmd = data.result;
        if (cmd === "ok") {
          this.latexWorkerStatus = 2; // Assuming Ready is 2
          resolve();
        } else {
          this.latexWorkerStatus = 4; // Assuming Error is 4
          reject();
        }
      };
    });
    this.latexWorker.onmessage = () => {};
    this.latexWorker.onerror = () => {};
  }

  isReady() {
    return this.latexWorkerStatus === 2; // Assuming Ready is 2
  }

  checkEngineStatus() {
    if (!this.isReady()) {
      throw Error("Engine is still spinning or not ready yet!");
    }
  }

  async compileLaTeX() {
    this.checkEngineStatus();
    this.latexWorkerStatus = 3; // Assuming Busy is 3
    const start_compile_time = performance.now();
    const res = await new Promise((resolve) => {
      this.latexWorker.onmessage = (ev) => {
        const data = ev.data;
        const cmd = data.cmd;
        if (cmd !== "compile") return;
        const result = data.result;
        const log = data.log;
        const status = data.status;
        this.latexWorkerStatus = 2; // Assuming Ready is 2
        console.log(
          "Engine compilation finish " +
            (performance.now() - start_compile_time)
        );
        const nice_report = new CompileResult();
        nice_report.status = status;
        nice_report.log = log;
        if (result === "ok") {
          const pdf = new Uint8Array(data.pdf);
          nice_report.pdf = pdf;
        }
        resolve(nice_report);
      };
      this.latexWorker.postMessage({ cmd: "compilelatex" });
      console.log("Engine compilation start");
    });
    this.latexWorker.onmessage = () => {};

    return res;
  }

  async compileFormat() {
    this.checkEngineStatus();
    this.latexWorkerStatus = 3; // Assuming Busy is 3
    await new Promise((resolve, reject) => {
      this.latexWorker.onmessage = (ev) => {
        const data = ev.data;
        const cmd = data.cmd;
        if (cmd !== "compile") return;
        const result = data.result;
        const log = data.log;
        this.latexWorkerStatus = 2; // Assuming Ready is 2
        if (result === "ok") {
          const formatArray = data.pdf; // PDF for result
          const formatBlob = new Blob([formatArray], {
            type: "application/octet-stream",
          });
          const formatURL = URL.createObjectURL(formatBlob);
          setTimeout(() => {
            URL.revokeObjectURL(formatURL);
          }, 30000);
          console.log("Download format file via " + formatURL);
          resolve();
        } else {
          reject(log);
        }
      };
      this.latexWorker.postMessage({ cmd: "compileformat" });
    });
    this.latexWorker.onmessage = () => {};
  }

  setEngineMainFile(filename) {
    this.checkEngineStatus();
    if (this.latexWorker !== undefined) {
      this.latexWorker.postMessage({ cmd: "setmainfile", url: filename });
    }
  }

  writeMemFSFile(filename, srccode) {
    this.checkEngineStatus();
    if (this.latexWorker !== undefined) {
      this.latexWorker.postMessage({
        cmd: "writefile",
        url: filename,
        src: srccode,
      });
    }
  }

  makeMemFSFolder(folder) {
    this.checkEngineStatus();
    if (this.latexWorker !== undefined) {
      if (folder === "" || folder === "/") {
        return;
      }
      this.latexWorker.postMessage({ cmd: "mkdir", url: folder });
    }
  }

  flushCache() {
    this.checkEngineStatus();
    if (this.latexWorker !== undefined) {
      this.latexWorker.postMessage({ cmd: "flushcache" });
    }
  }

  setTexliveEndpoint(url) {
    if (this.latexWorker !== undefined) {
      this.latexWorker.postMessage({ cmd: "settexliveurl", url: url });
    }
  }

  closeWorker() {
    if (this.latexWorker !== undefined) {
      this.latexWorker.postMessage({ cmd: "grace" });
      this.latexWorker = undefined;
    }
  }
}
