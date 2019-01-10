export const consoleColors = {
  BgRed: '\x1b[41m',
  FgGreen: '\x1b[32m',
  FgBlue: '\x1b[34m',
};

export const colorizeLog = (str: string, color = consoleColors.FgBlue) =>
  `${color}${str}\x1b[0m`;

export const throwError = (error: string) => {
  throw new Error(colorizeLog(error, consoleColors.BgRed));
};

export const boldString = (str: string) => {
  return str.replace(
    /\*{1}(?=[^\s\*])(.*?)([^\s\*])\*{1}/gi,
    s => `<b>${s.replace(/\*/g, '')}</b>`
  );
};

export const italicizeString = (str: string) => {
  return str.replace(
    /\_{1}(?=[^\s\_])(.*?)([^\s\_])\_{1}/gi,
    s => `<em>${s.replace(/\*/g, '')}</em>`
  );
};

export const strikeString = (str: string) => {
  return str.replace(
    /\~{1}(?=[^\s\~])(.*?)([^\s\~])\~{1}/gi,
    s => `<strike>${s.replace(/\*/g, '')}</strike>`
  );
};
