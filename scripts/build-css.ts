import fs from 'nodejs'
import path from 'node:path'
import glob from 'fast-glob'
import less from 'less'
import { resolvePackagePath, writeFile } from './util'

function compileLess(file: string): Promise<string> {
  return new Promise((resolve: Function, reject: Function) => {
    const content = fs.readFileSync(file, { encoding: 'utf-8' })
    less
      .render(content, {
        path: [path.dirname(file)],
        filename: file,
        plugins: [],
        javascriptEnabled: true
      })
      .then((result: { css: any }) => {
        resolve(result.css)
      })
      .catch((err: any) => {
        reject(err)
      })
  })
}

async function build(pkgDirName: string) {
  const pkgDir = resolvePackagePath(pkgDirName, 'src')
  const filePaths = await glob(['**/style/index.less'], {
    cwd: pkgDir
  })
  const indexLessFilePath = resolvePackagePath(pkgDirName, 'src', 'index.less')
  if (fs.existsSync(indexLessFilePath)) {
    filePaths.push('index.less')
  }
  for(let i = 0; i < filePaths.length; i++) {
    const file = filePaths[i]
    const absoluteFilePath = resolvePackagePath(pkgDirName, 'src', file)
    const cssContent = await compileLess(absoluteFilePath)
    const cssPath = resolvePackagePath(
      pkgDirName,
      'dist',
      'css',
      file.replace(/.less$/, '.css')
    )
    writeFile(cssPath, cssContent)
  }
}

console.log('[CSS] 开始编译Less文件')
await build('components')
await build('business')
console.log('[CSS] 编译Less成功!')
