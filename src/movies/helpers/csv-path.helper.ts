import * as path from 'node:path';
import * as fs from 'node:fs';

/**
 * Obtém o path correto para o csv.
 * @param {string} fileName nome do arquivo para leitura.
 * @returns {string} caminho do arquivo.
 */
export function resolveCsvPath(fileName: string): string {
  const devPath = path.resolve('src', 'data', fileName);
  const prodPath = path.resolve(__dirname, '..', 'data', fileName);

  return fs.existsSync(devPath) ? devPath : prodPath;
}
