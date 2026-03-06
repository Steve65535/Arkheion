const logger = require('../../libs/logger');

describe('Logger', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('logCommand 输出包含命令名', () => {
    logger.logCommand('wallet submit');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('wallet submit')
    );
  });

  it('logInput 输出包含输入内容', () => {
    logger.logInput('--to=0xabc');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('--to=0xabc')
    );
  });

  it('logResult 输出包含结果内容', () => {
    logger.logResult('success');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('success')
    );
  });

  it('logInteraction 依次输出三条日志', () => {
    logger.logInteraction('cmd', 'input', 'result');
    expect(consoleSpy).toHaveBeenCalledTimes(3);
  });

  it('logInteraction 跳过 falsy 参数', () => {
    logger.logInteraction(null, null, 'result');
    expect(consoleSpy).toHaveBeenCalledTimes(1);
  });

  it('COLORS 导出包含必要颜色', () => {
    expect(logger.COLORS).toHaveProperty('reset');
    expect(logger.COLORS).toHaveProperty('brightGreen');
    expect(logger.COLORS).toHaveProperty('brightBlue');
  });
});
