/*
 * @Description: LaTeX 编译引擎自动检测类
 * @Author: Devin
 * @Date: 2024-08-23 17:49:54
 */
class LaTeXEngineDetector {
  constructor(texContent) {
    this.texContent = texContent;
  }

  // 检查是否包含特定的宏包或命令
  contains(pattern) {
    return pattern.test(this.texContent);
  }

  // 识别是否适合使用 pdflatex
  isPdflatexCompatible() {
    // 检查是否包含 fontspec 包
    if (this.contains(/\\usepackage\{fontspec\}/)) {
      return false;
    }

    // 检查是否包含 setmainfont 命令
    if (this.contains(/\\setmainfont/)) {
      return false;
    }

    // 检查是否包含 inputenc 包
    if (this.contains(/\\usepackage\[utf8\]\{inputenc\}/)) {
      return true;
    }

    // 检查图像格式
    if (this.contains(/\\includegraphics.*\.(jpg|png|pdf)/)) {
      return true;
    }

    if (this.contains(/\\includegraphics.*\.eps/)) {
      return false;
    }

    // 默认返回 true，假设文档是 pdflatex 兼容的
    return true;
  }

  // 获取推荐的编译引擎
  getRecommendedEngine() {
    if (this.isPdflatexCompatible()) {
      return "pdflatex";
    } else {
      return "xelatex";
    }
  }
}

export default LaTeXEngineDetector;

// const detector = new LaTeXEngineDetector(texContent);
// console.log(detector.getRecommendedEngine()); // 输出: pdflatex