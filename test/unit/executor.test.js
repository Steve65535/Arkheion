const path = require('path');
const fs = require('fs');
const { CommandExecutor } = require('../../cli/executor');

// 临时 handler 目录（用于测试）
const FAKE_HANDLERS_DIR = path.join(__dirname, '../fixtures/handlers');

describe('CommandExecutor', () => {
  let executor;

  beforeAll(() => {
    // 创建测试用的假 handler 文件
    fs.mkdirSync(FAKE_HANDLERS_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(FAKE_HANDLERS_DIR, 'echo.js'),
      'module.exports = async ({ args }) => `echo:${JSON.stringify(args)}`;'
    );
    fs.writeFileSync(
      path.join(FAKE_HANDLERS_DIR, 'throws.js'),
      'module.exports = async () => { throw new Error("handler error"); };'
    );
    fs.writeFileSync(
      path.join(FAKE_HANDLERS_DIR, 'default-export.js'),
      'module.exports = { default: async ({ args }) => `default:${JSON.stringify(args)}` };'
    );
  });

  afterAll(() => {
    fs.rmSync(path.join(__dirname, '../fixtures'), { recursive: true, force: true });
  });

  beforeEach(() => {
    executor = new CommandExecutor(FAKE_HANDLERS_DIR);
  });

  // ──────────────────────────────────────────────
  // loadHandler()
  // ──────────────────────────────────────────────
  describe('loadHandler()', () => {
    it('成功加载 .js handler', async () => {
      const handler = await executor.loadHandler('echo');
      expect(typeof handler).toBe('function');
    });

    it('缓存命中：同路径第二次不重新加载', async () => {
      await executor.loadHandler('echo');
      const spy = jest.spyOn(fs, 'existsSync');
      await executor.loadHandler('echo');
      // 缓存命中时不应再次检查文件
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('clearCache() 之后重新加载', async () => {
      await executor.loadHandler('echo');
      executor.clearCache();
      expect(executor.handlersCache['echo']).toBeUndefined();
    });

    it('加载不存在的 handler 抛出错误', async () => {
      await expect(executor.loadHandler('nonexistent')).rejects.toThrow();
    });

    it('支持 default export 格式的 handler', async () => {
      const handler = await executor.loadHandler('default-export');
      expect(handler).toHaveProperty('default');
      expect(typeof handler.default).toBe('function');
    });
  });

  // ──────────────────────────────────────────────
  // execute()
  // ──────────────────────────────────────────────
  describe('execute()', () => {
    it('handler 为 null 时不抛出（仅打印错误）', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await expect(executor.execute({ handler: null, args: {}, command: null })).resolves.toBeUndefined();
      consoleSpy.mockRestore();
    });

    it('parsedCommand.error 时打印错误信息', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await executor.execute({ handler: null, error: 'Unknown command: xyz', args: {} });
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown command'));
      consoleSpy.mockRestore();
    });

    it('执行 function 类型 handler 并返回结果', async () => {
      const result = await executor.execute({
        handler: 'echo',
        args: { foo: 'bar' },
        command: 'test',
        subcommands: ['test'],
        config: {}
      });
      expect(result).toContain('echo:');
      expect(result).toContain('foo');
    });

    it('执行 default export handler 并返回结果', async () => {
      const result = await executor.execute({
        handler: 'default-export',
        args: { x: 1 },
        command: 'test',
        subcommands: ['test'],
        config: {}
      });
      expect(result).toContain('default:');
    });

    it('handler 抛出错误时 execute 重新抛出', async () => {
      await expect(executor.execute({
        handler: 'throws',
        args: {},
        command: 'test',
        subcommands: ['test'],
        config: {}
      })).rejects.toThrow('handler error');
    });

    it('传递 rootDir 给 handler', async () => {
      // 写一个捕获 rootDir 的 handler
      fs.writeFileSync(
        path.join(FAKE_HANDLERS_DIR, 'capture-rootdir.js'),
        'module.exports = async ({ rootDir }) => rootDir;'
      );
      executor.clearCache();
      const result = await executor.execute({
        handler: 'capture-rootdir',
        args: {},
        command: 'test',
        subcommands: [],
        config: {}
      }, '/custom/root');
      expect(result).toBe('/custom/root');
    });
  });
});
