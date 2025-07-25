import { useXTerm } from 'react-xtermjs';
import { FitAddon } from '@xterm/addon-fit';
import { useEffect, useRef, useCallback } from 'react';

type TerminalComponentProps = {
  server_name: string;
};

const fileSystem: Record<string, string[]> = {
  '': ['root', 'etc', 'var', 'tmp', 'README.md', 'config.yaml'],
  root: ['documents', 'pictures', 'logs'],
  etc: ['nginx.conf', 'hosts'],
  var: ['log', 'tmp'],
  tmp: [],
  logs: [],
  documents: [],
  pictures: [],
};

const TerminalComponent = ({ server_name }: TerminalComponentProps) => {
  const { instance, ref } = useXTerm();
  const fitAddon = useRef(new FitAddon()).current;
  const inputBuffer = useRef('');

  const currentDir = useRef<string[]>(['root']);

  const getPathString = useCallback(() => {
    return currentDir.current.length === 0 ? '/' : '/' + currentDir.current.join('/');
  }, []);

  const listFiles = useCallback(() => {
    const dirName =
      currentDir.current.length === 0 ? '' : currentDir.current[currentDir.current.length - 1];
    return (fileSystem[dirName] || []).join('  ');
  }, []);

  const changeDirectory = useCallback((path: string) => {
    if (path === '' || path === '~') {
      currentDir.current = ['root'];
      return null;
    }

    if (path === '/') {
      currentDir.current = [];
      return null;
    }

    let target: string[];
    if (path.startsWith('/')) {
      target = path.slice(1).split('/').filter(Boolean);
    } else {
      target = [...currentDir.current, ...path.split('/').filter(Boolean)];
    }

    const norm: string[] = [];
    for (const part of target) {
      if (part === '..') {
        if (norm.length > 0) norm.pop();
      } else if (part !== '.' && part !== '') {
        norm.push(part);
      }
    }

    let dirKey = '';
    for (let i = 0; i < norm.length; i++) {
      const seg = norm[i];
      if (!fileSystem[dirKey]?.includes(seg)) {
        return `bash: cd: ${path}: No such file or directory`;
      }
      dirKey = seg;
    }

    currentDir.current = norm;
    return null;
  }, []);

  const showPrompt = useCallback(() => {
    if (!instance) return;
    instance.write(
      `\r\n[root@${server_name} ${getPathString() === '/root' ? '~' : getPathString()}] $ `,
    );
  }, [instance, server_name, getPathString]);

  useEffect(() => {
    if (!instance) return;
    instance.loadAddon(fitAddon);
    fitAddon.fit();
    showPrompt();

    const onData = (data: string) => {
      if (!instance) return;
      const code = data.charCodeAt(0);

      if (code === 13) {
        instance.writeln('');
        const line = inputBuffer.current.trim();
        inputBuffer.current = '';

        if (!line) {
          showPrompt();
          return;
        }
        const [cmd, ...args] = line.split(' ');

        switch (cmd) {
          case 'help':
            instance.writeln(
              'Available commands: help, clear, ls, pwd, cd, echo, whoami, date, exit',
            );
            break;

          case 'clear':
            instance.reset();
            showPrompt();
            return;

          case 'pwd':
            instance.writeln(getPathString());
            break;

          case 'ls':
            instance.writeln(listFiles());
            break;

          case 'cd': {
            const target = args[0] ?? '';
            const err = changeDirectory(target);
            if (err) instance.writeln(err);
            break;
          }

          case 'echo':
            instance.writeln(args.join(' '));
            break;

          case 'whoami':
            instance.writeln('root');
            break;

          case 'date':
            instance.writeln(new Date().toString());
            break;

          case 'exit':
            instance.writeln('Connection closed.');
            instance.dispose();
            return;

          default:
            instance.writeln(`bash: ${cmd}: command not found`);
        }

        showPrompt();
      } else if (code === 127) {
        if (inputBuffer.current) {
          inputBuffer.current = inputBuffer.current.slice(0, -1);
          instance.write('\b \b');
        }
      } else if (code === 3) {
        instance.write('^C');
        inputBuffer.current = '';
        showPrompt();
      } else {
        inputBuffer.current += data;
        instance.write(data);
      }
    };

    instance.onData(onData);
    window.addEventListener('resize', () => fitAddon.fit());
    return () => window.removeEventListener('resize', () => fitAddon.fit());
  }, [instance, fitAddon, showPrompt, getPathString, listFiles, changeDirectory]);

  return (
    <div
      ref={ref}
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: 'black',
        color: 'white',
        fontFamily: 'monospace',
      }}
    />
  );
};

export default TerminalComponent;
