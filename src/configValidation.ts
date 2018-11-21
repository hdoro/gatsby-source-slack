import { throwError } from './helpers';

interface IPluginProps {
  token: string;
}

export const validateConfig = ({ token }: IPluginProps) => {
  if (typeof token !== 'string') {
    throwError('nodeType must be a string!');
  }
};
